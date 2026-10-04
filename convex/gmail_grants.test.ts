import { z } from "zod";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { internal } from "./_generated/api";
import { gmail_test_fixture } from "../scripts/gmail-test-fixtures";
import { gmail_grant_step } from "./gmail_grants";
import { gmail_decrypt, gmail_encrypt, gmail_random_secret } from "./gmail_secrets";

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(1_800_000_000_000); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

async function setup() {
	const fixture = await gmail_test_fixture();
	const state = { loseSeal: false, status: 200, sealCalls: 0, renewCalls: 0, beforeReply: null as (() => Promise<void>) | null };
	const receipts = new Map<string, unknown>();
	const requests: { path: string; token: string; requestId?: string }[] = [];
	vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
		const path = new URL(String(input)).pathname;
		const token = new Headers(init?.headers).get("Authorization")?.slice(7) ?? "";
		if (typeof init?.body !== "string") throw new Error("Missing body");
		const raw: unknown = JSON.parse(init.body);
		if (path.endsWith("/verify-live")) {
			requests.push({ path, token });
			const body = z.object({ phase: z.enum(["interactive", "processing"]), destinationPathPrefix: z.string().nullable() }).parse(raw);
			return Response.json({ installationId: "installation", ...body, scopes: body.phase === "processing" ? ["files:write"] : [],
				expiresAt: Date.now() + 6 * 24 * 3600_000, contentPermissions: { read: true, write: true } });
		}
		const body = z.object({ requestId: z.string(), operation: z.string().optional() }).parse(raw);
		requests.push({ path, token, requestId: body.requestId });
		if (path.endsWith("/recover")) return receipts.has(body.requestId) ? Response.json(receipts.get(body.requestId)) : Response.json({ message: "No saved grant" }, { status: 404 });
		if (state.beforeReply) { const run = state.beforeReply; state.beforeReply = null; await run(); }
		if (state.status !== 200) return Response.json({ message: "refused" }, { status: state.status });
		if (path.endsWith("/seal-processing")) state.sealCalls++;
		if (path.endsWith("/renew")) state.renewCalls++;
		const grant = { ...fixture.actor, token: `psg_${String(100 + state.sealCalls + state.renewCalls).padStart(64, "0")}`,
			expiresAt: Date.now() + (path.endsWith("/seal-processing") ? 6 : 1) * 24 * 3600_000, scopes: ["files:write"] };
		receipts.set(body.requestId, grant);
		if (path.endsWith("/seal-processing") && state.loseSeal) { state.loseSeal = false; throw new Error("Lost seal answer"); }
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
