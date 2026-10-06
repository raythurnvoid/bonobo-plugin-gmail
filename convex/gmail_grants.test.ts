import { z } from "zod";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { internal } from "./_generated/api";
import { gmail_test_fixture } from "../scripts/gmail-test-fixtures";
import { gmail_grant_step } from "./gmail_grants";
import { gmail_start } from "./gmail_oauth";
import { gmail_decrypt, gmail_encrypt, gmail_random_secret } from "./gmail_secrets";

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(1_800_000_000_000); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

async function setup() {
	const fixture = await gmail_test_fixture();
	const state = { loseSeal: false, loseReply: null as "exchange" | "renew" | null, status: 200, exchangeCalls: 0, sealCalls: 0, renewCalls: 0,
		beforeReply: null as (() => Promise<void>) | null };
	const receipts = new Map<string, unknown>();
	const rotated = new Set<string>();
	const requests: { path: string; token: string; requestId?: string }[] = [];
	vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
		const path = new URL(String(input)).pathname;
		const token = new Headers(init?.headers).get("Authorization")?.slice(7) ?? "";
		if (typeof init?.body !== "string") throw new Error("Missing body");
		const raw: unknown = JSON.parse(init.body);
		if (path.endsWith("/verify-live")) {
			requests.push({ path, token });
			if (rotated.has(token)) return Response.json({ message: "Unauthorized" }, { status: 401 });
			const body = z.object({ phase: z.enum(["interactive", "processing"]), destinationPathPrefix: z.string().nullable() }).parse(raw);
			return Response.json({ installationId: "installation", ...body, scopes: body.phase === "processing" ? ["files:write"] : [],
				expiresAt: Date.now() + 6 * 24 * 3600_000, contentPermissions: { read: true, write: true } });
		}
		const body = z.object({ requestId: z.string(), operation: z.enum(["exchange", "renew", "seal"]).optional() }).parse(raw);
		requests.push({ path, token, requestId: body.requestId });
		const operation = path.endsWith("/recover") ? body.operation : path.endsWith("/seal-processing") ? "seal" : path.split("/").at(-1);
		const key = JSON.stringify([token, operation, body.requestId]);
		if (path.endsWith("/recover")) return receipts.has(key) ? Response.json(receipts.get(key)) : Response.json({ message: "No saved grant" }, { status: rotated.has(token) ? 401 : 404 });
		// After rotation, only exact recovery can use the old bearer.
		if (rotated.has(token)) return Response.json({ message: "Unauthorized" }, { status: 401 });
		if (state.beforeReply) { const run = state.beforeReply; state.beforeReply = null; await run(); }
		if (state.status !== 200) return Response.json({ message: "refused" }, { status: state.status });
		if (receipts.has(key)) return Response.json(receipts.get(key));
		if (path.endsWith("/exchange")) state.exchangeCalls++;
		if (path.endsWith("/seal-processing")) state.sealCalls++;
		if (path.endsWith("/renew")) { state.renewCalls++; rotated.add(token); }
		const grant = { ...fixture.actor, token: `psg_${String(100 + state.exchangeCalls + state.sealCalls + state.renewCalls).padStart(64, "0")}`,
			expiresAt: Date.now() + (path.endsWith("/seal-processing") ? 6 : 1) * 24 * 3600_000, scopes: ["files:write"] };
		receipts.set(key, grant);
		if (path.endsWith("/seal-processing") && state.loseSeal) { state.loseSeal = false; throw new Error("Lost seal answer"); }
		if (operation === state.loseReply) { state.loseReply = null; throw new Error("Lost grant answer"); }
		return Response.json(grant);
	}));
	return { ...fixture, state, requests };
}

describe("gmail_grant_step", () => {
	test("lost first seal becomes ready through the sweep with the same request", async () => {
		const { t, grantId, accountId, state, requests } = await setup(); state.loseSeal = true;
		const grant = (await t.run(ctx => ctx.db.get(grantId)))!;
		await t.run(ctx => ctx.db.patch(grantId, { phase: "seal", sourceSecret: grant.interactiveSecret }));
		await t.action(ctx => gmail_grant_step(ctx, grantId));
		expect(await t.run(ctx => ctx.db.get(grantId))).toMatchObject({ phase: "seal", error: "press_temporary", nextAttemptAt: Date.now() + 60_000 });
		vi.advanceTimersByTime(60_000);
		await t.mutation(internal.gmail_grants.sweep, {});
		vi.advanceTimersByTime(0); await t.finishInProgressScheduledFunctions();
		expect(await t.run(ctx => ctx.db.get(grantId))).toMatchObject({ phase: "ready", error: null, sourceSecret: null });
		expect(await t.run(ctx => ctx.db.get(accountId))).toMatchObject({ syncStatus: "live", nextSyncAt: Date.now() });
		expect(state.sealCalls).toBe(1);
		expect(new Set(requests.filter(request => request.requestId).map(request => request.requestId))).toEqual(new Set([grant.lifecycleRequestId]));
	});
	test.each(["exchange", "renew"] as const)("lost %s reply recovers the same grant through the due sweep", async operation => {
		const f = await setup();
		const before = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		const ledger = await f.t.run(ctx => ctx.db.get(f.ledgerId));
		let claimed = (await f.t.run(ctx => ctx.db.get(f.grantId)))!;
		let attemptId: string | null = null;
		f.state.loseReply = operation;
		f.state.beforeReply = async () => {
			const account = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			const attempt = operation === "exchange" ? (await f.t.run(ctx => ctx.db.get(account.connectRequestId!)))! : null;
			claimed = (await f.t.run(ctx => ctx.db.get(attempt ? attempt.grantId! : f.grantId)))!;
		};
		if (operation === "exchange") {
			const start = await f.t.action(ctx => gmail_start(ctx, f.actor, { accountId: f.accountId, clientRequestId: gmail_random_secret() }, `plu_${"1".repeat(64)}`));
			attemptId = start.attemptId;
			expect(start).toEqual({ attemptId, status: "preparing" });
		} else {
			await f.t.mutation(internal.gmail_grants.renew, { grantId: f.grantId, lifecycleRequestId: claimed.lifecycleRequestId });
			vi.advanceTimersByTime(0); await f.t.finishInProgressScheduledFunctions();
		}
		expect(claimed.phase).toBe(operation);
		const lost = (await f.t.run(ctx => ctx.db.get(claimed._id)))!;
		expect(lost).toEqual({ ...claimed, error: "press_temporary", temporaryFailures: 1, nextAttemptAt: Date.now() + 60_000 });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(ledger);
		const source = await gmail_decrypt(claimed.sourceSecret!, `grant:${claimed._id}:${operation === "exchange" ? "source" : "interactive"}`);
		const early = f.requests.length;
		vi.advanceTimersByTime(59_999);
		await f.t.mutation(internal.gmail_grants.sweep, {});
		expect(f.requests).toHaveLength(early);
		expect(await f.t.run(ctx => ctx.db.get(claimed._id))).toEqual(lost);
		vi.advanceTimersByTime(1);
		await f.t.mutation(internal.gmail_grants.sweep, {});
		expect(await f.t.run(ctx => ctx.db.get(claimed._id))).toEqual({ ...lost, nextAttemptAt: Date.now() + 120_000 });
		for (let turn = 0; turn < 3; turn++) { vi.advanceTimersByTime(0); await f.t.finishInProgressScheduledFunctions(); }
		const ready = (await f.t.run(ctx => ctx.db.get(claimed._id)))!;
		expect(ready).toMatchObject({ phase: operation === "exchange" ? "awaiting_finish" : "ready", error: null, temporaryFailures: 0 });
		expect(f.requests.filter(request => request.requestId === claimed.lifecycleRequestId)).toEqual([
			{ path: "/api/v1/plugins/service-grants/recover", token: source, requestId: claimed.lifecycleRequestId },
			{ path: `/api/v1/plugins/service-grants/${operation}`, token: source, requestId: claimed.lifecycleRequestId },
			{ path: "/api/v1/plugins/service-grants/recover", token: source, requestId: claimed.lifecycleRequestId },
		]);
		expect(operation === "exchange" ? f.state.exchangeCalls : f.state.renewCalls).toBe(1);
		expect(f.requests.filter(request => request.path.endsWith(`/${operation}`))).toHaveLength(1);
		expect(await gmail_decrypt(ready.interactiveSecret!, `grant:${ready._id}:interactive`)).toBe(f.requests.find(request => request.path.endsWith("/verify-live"))!.token);
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(ledger);
		if (operation === "exchange") {
			expect(ready).toMatchObject({ accountId: null, sealedSecret: null, nextAttemptAt: null });
			expect(await f.t.query(internal.gmail_oauth.get_attempt, { ...f.actor, attemptId: attemptId! })).toMatchObject({ status: "pending" });
			expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toEqual({ ...before, connectRequestId: attemptId });
			expect(f.state.sealCalls).toBe(0);
		} else {
			expect(ready).toMatchObject({ sourceSecret: null, nextAttemptAt: Date.now() + 12 * 3600_000 });
			expect(f.state.sealCalls).toBe(1);
			expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toEqual({ ...before, nextSyncAt: Date.now(), updatedAt: Date.now() });
		}
	});
	test("renewal makes a new seal and preserves the permission lane", async () => {
		const { t, grantId, accountId, state } = await setup();
		const before = (await t.run(ctx => ctx.db.get(accountId)))!;
		const grant = (await t.run(ctx => ctx.db.get(grantId)))!;
		await t.mutation(internal.gmail_grants.renew, { grantId, lifecycleRequestId: grant.lifecycleRequestId });
		vi.advanceTimersByTime(0); await t.finishInProgressScheduledFunctions();
		vi.advanceTimersByTime(0); await t.finishInProgressScheduledFunctions();
		const after = (await t.run(ctx => ctx.db.get(grantId)))!;
		expect(after.phase).toBe("ready");
		expect(after.lifecycleRequestId).not.toBe(grant.lifecycleRequestId);
		expect(await gmail_decrypt(after.interactiveSecret!, `grant:${grantId}:interactive`)).not.toBe(await gmail_decrypt(grant.interactiveSecret!, `grant:${grantId}:interactive`));
		expect(await t.run(ctx => ctx.db.get(accountId))).toMatchObject({ ledgerCounts: before.ledgerCounts, permissionProbeNotBefore: before.permissionProbeNotBefore, historyId: before.historyId });
		expect(state.renewCalls).toBe(1); expect(state.sealCalls).toBe(1);
	});
	test("renewing account A leaves account B's independent chain unchanged", async () => {
		const { t, grantId, accountId } = await setup();
		const peerGrantId = await t.run(async ctx => {
			const account = (await ctx.db.get(accountId))!;
			const grant = (await ctx.db.get(grantId))!;
			const { _id: _accountId, _creationTime: _accountTime, ...accountFields } = account;
			const { _id: _grantId, _creationTime: _grantTime, ...grantFields } = grant;
			const peerAccountId = await ctx.db.insert("gmail_accounts", { ...accountFields, emailAddress: "peer@example.com", destinationPath: "/emails/peer-example.com", hostGrantId: null });
			const peer = await ctx.db.insert("host_grants", { ...grantFields, accountId: peerAccountId, destinationPath: "/emails/peer-example.com", lifecycleRequestId: gmail_random_secret() });
			await ctx.db.patch(peer, { interactiveSecret: await gmail_encrypt(`psg_${"8".repeat(64)}`, `grant:${peer}:interactive`),
				sealedSecret: await gmail_encrypt(`psg_${"9".repeat(64)}`, `grant:${peer}:sealed`) });
			await ctx.db.patch(peerAccountId, { hostGrantId: peer });
			return peer;
		});
		const before = await t.run(ctx => ctx.db.get(peerGrantId));
		const grant = (await t.run(ctx => ctx.db.get(grantId)))!;
		await t.mutation(internal.gmail_grants.renew, { grantId, lifecycleRequestId: grant.lifecycleRequestId });
		vi.advanceTimersByTime(0); await t.finishInProgressScheduledFunctions();
		vi.advanceTimersByTime(0); await t.finishInProgressScheduledFunctions();
		expect(await t.run(ctx => ctx.db.get(peerGrantId))).toEqual(before);
		expect(await gmail_decrypt(before!.sealedSecret!, `grant:${peerGrantId}:sealed`)).toBe(`psg_${"9".repeat(64)}`);
	});
	test("ready seal on a source-stopped account enables only saved settlement due work", async () => {
		const { t, grantId, accountId } = await setup();
		const grant = (await t.run(ctx => ctx.db.get(grantId)))!;
		await t.run(async ctx => {
			await ctx.db.patch(accountId, { sourceError: "google_revoked" });
			await ctx.db.patch(grantId, { phase: "seal", sourceSecret: grant.interactiveSecret });
		});
		await t.action(ctx => gmail_grant_step(ctx, grantId));
		expect(await t.run(ctx => ctx.db.get(accountId))).toMatchObject({ sourceError: "google_revoked", syncStatus: "error", nextSyncAt: Date.now() + 3600_000 });
	});
	test("a dedicated pending exchange waits for authenticated Finish", async () => {
		const { t, actor, requests } = await setup();
		const result = await t.mutation(internal.gmail_oauth.prepare_start, { ...actor, clientRequestId: gmail_random_secret(), accountId: null, pageToken: `plu_${"1".repeat(64)}` });
		if (!("_yay" in result)) throw new Error("Expected attempt");
		const attempt = (await t.query(internal.gmail_oauth.get_attempt, { ...actor, attemptId: result._yay }))!;
		await t.action(ctx => gmail_grant_step(ctx, attempt.grantId!));
		expect(await t.run(ctx => ctx.db.get(attempt.grantId!))).toMatchObject({ phase: "awaiting_finish", accountId: null, sealedSecret: null, nextAttemptAt: null });
		expect(requests.some(request => request.path.endsWith("/seal-processing"))).toBe(false);
	});
	test("old-chain 401 cannot block a repaired chain", async () => {
		const { t, actor, grantId, accountId, state } = await setup();
		const grant = (await t.run(ctx => ctx.db.get(grantId)))!;
		await t.run(async ctx => { await ctx.db.patch(grantId, { phase: "seal", sourceSecret: grant.interactiveSecret });
			await ctx.db.patch(accountId, { syncError: "press_reconnect_needed" }); });
		state.beforeReply = async () => {
			const repaired = await t.mutation(internal.gmail_accounts.prepare_repair, { ...actor, accountId, expectedGeneration: 1,
				clientRequestId: gmail_random_secret(), pageToken: `plu_${"1".repeat(64)}` });
			if (!("_yay" in repaired)) throw new Error("Expected repair");
			await t.run(async ctx => { await ctx.db.patch(repaired._yay.grantId, { phase: "ready" }); await ctx.db.patch(accountId, { syncStatus: "live", syncError: null, nextSyncAt: Date.now() }); });
		};
		state.status = 401;
		await t.action(ctx => gmail_grant_step(ctx, grantId));
		expect(await t.run(ctx => ctx.db.get(accountId))).toMatchObject({ syncStatus: "live", syncError: null, nextSyncAt: Date.now() });
		expect((await t.run(ctx => ctx.db.get(accountId)))!.hostGrantId).not.toBe(grantId);
	});
	test("long authority pauses keep the encrypted Google token", async () => {
		const { t, grantId, accountId, state } = await setup();
		const before = (await t.run(ctx => ctx.db.get(accountId)))!;
		const grant = (await t.run(ctx => ctx.db.get(grantId)))!;
		await t.run(ctx => ctx.db.patch(grantId, { phase: "seal", sourceSecret: grant.interactiveSecret })); state.status = 401;
		await t.action(ctx => gmail_grant_step(ctx, grantId));
		vi.advanceTimersByTime(90 * 24 * 3600_000);
		await t.mutation(internal.gmail_grants.sweep, {});
		expect(await t.run(ctx => ctx.db.get(accountId))).toMatchObject({ syncStatus: "blocked", syncError: "press_reconnect_needed", googleRefreshToken: before.googleRefreshToken });
	});
	test("expired interactive authority asks for repair instead of renewing", async () => {
		const { t, grantId, accountId, requests } = await setup(); const grant = (await t.run(ctx => ctx.db.get(grantId)))!;
		await t.run(ctx => ctx.db.patch(grantId, { interactiveExpiresAt: Date.now() }));
		await t.mutation(internal.gmail_grants.renew, { grantId, lifecycleRequestId: grant.lifecycleRequestId });
		expect(requests).toHaveLength(0);
		expect(await t.run(ctx => ctx.db.get(accountId))).toMatchObject({ syncError: "press_reconnect_needed", nextSyncAt: null });
	});
	test("stale generation, request, and Disconnect reject late grant progress", async () => {
		const { t, grantId, accountId, actor, requests } = await setup(); const grant = (await t.run(ctx => ctx.db.get(grantId)))!;
		await t.run(ctx => ctx.db.patch(grantId, { phase: "seal", sourceSecret: grant.interactiveSecret }));
		expect(await t.mutation(internal.gmail_grants.save_step, { grantId, lifecycleRequestId: "other", phase: "seal", secret: "late", expiresAt: Date.now() + 3600_000 })).toBe(false);
		await t.mutation(internal.gmail_accounts.disconnect, { ...actor, accountId, expectedGeneration: 1 });
		expect(await t.mutation(internal.gmail_grants.save_step, { grantId, lifecycleRequestId: grant.lifecycleRequestId, phase: "seal", secret: "late", expiresAt: Date.now() + 3600_000 })).toBe(false);
		await t.action(ctx => gmail_grant_step(ctx, grantId));
		expect(requests).toHaveLength(0);
	});
});
