/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { internal } from "./_generated/api";
import schema from "./schema";
import { gmail_callback, gmail_finish, gmail_start } from "./gmail_oauth";
import { gmail_decrypt, gmail_google_token_purpose, gmail_random_secret, gmail_sha256 } from "./gmail_secrets";
import { GMAIL_READONLY_SCOPE } from "./gmail_google";
import { gmail_test_fixture } from "../scripts/gmail-test-fixtures";

const modules = import.meta.glob("./**/*.ts");
const actor = { organizationId: "org", workspaceId: "workspace", installationId: "installation", actorUserId: "actor" };
const plu = `plu_${"1".repeat(64)}`;
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(1_800_000_000_000); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

function setup(t = convexTest(schema, modules)) {
	const state = { email: "ray@example.com", googleExchanges: 0, loseGoogle: false, losePress: false, exchanges: 0,
		grantActor: { ...actor }, deadTokens: new Set<string>(), temporaryTokens: new Set<string>(), verifiedTokens: [] as string[] };
	const receipts = new Map<string, { token: string; expiresAt: number; scopes: string[]; organizationId: string; workspaceId: string; installationId: string; actorUserId: string }>();
	vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = new URL(input instanceof Request ? input.url : String(input));
		if (url.origin === "https://oauth2.googleapis.com") {
			state.googleExchanges++;
			if (state.loseGoogle) throw new Error("Lost Google answer");
			return Response.json({ access_token: "access", refresh_token: "refresh", expires_in: 3600, scope: GMAIL_READONLY_SCOPE, token_type: "Bearer" });
		}
		if (url.origin === "https://gmail.googleapis.com") return Response.json({ emailAddress: state.email, historyId: "123" });
		expect(url.origin).toBe("https://press.test");
		expect(new Headers(init?.headers).get("X-Bonobo-Service-Authorization")).toBe("Bearer pse_testservice");
		const token = new Headers(init?.headers).get("Authorization")?.slice(7) ?? "";
		if (url.pathname.endsWith("/verify-live")) {
			state.verifiedTokens.push(token);
			if (state.deadTokens.has(token)) return Response.json({ message: "grant invalid" }, { status: 401 });
			if (state.temporaryTokens.has(token)) return Response.json({ message: "temporary" }, { status: 503 });
			return Response.json({ installationId: actor.installationId, phase: "interactive", destinationPathPrefix: null,
				expiresAt: Date.now() + 24 * 60 * 60_000, scopes: [], contentPermissions: { read: true, write: true } });
		}
		if (typeof init?.body !== "string") throw new Error("Missing body");
		const body: unknown = JSON.parse(init.body);
		if (!body || typeof body !== "object" || !("requestId" in body) || typeof body.requestId !== "string") throw new Error("Missing request id");
		if (url.pathname.endsWith("/recover")) return receipts.has(body.requestId) ? Response.json(receipts.get(body.requestId)) : Response.json({ message: "No saved grant" }, { status: 404 });
		expect(url.pathname).toBe("/api/v1/plugins/service-grants/exchange");
		state.exchanges++;
		const grant = { ...state.grantActor, token: `psg_${String(state.exchanges + 2).padStart(64, "0")}`,
			expiresAt: Date.now() + 24 * 60 * 60_000, scopes: [] };
		receipts.set(body.requestId, grant);
		if (state.losePress) { state.losePress = false; throw new Error("Lost Press answer"); }
		return Response.json(grant);
	}));
	const page = (path: string, body: unknown) => t.fetch(path, { method: "POST", headers: { Origin: "https://press.test", Authorization: `Bearer ${plu}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
	const start = (requestId = gmail_random_secret(), accountId: string | null = null) => t.action(ctx => gmail_start(ctx, actor, { clientRequestId: requestId, accountId }, plu));
	const stage = async (accountId: string | null = null) => {
		const started = await start(gmail_random_secret(), accountId);
		const consentState = new URL(started.consentUrl!).searchParams.get("state")!;
		const callback = await t.action(ctx => gmail_callback(ctx, consentState, "google-code", false));
		return { attemptId: started.attemptId, state: consentState, finishCode: callback.finishCode! };
	};
	const dedicated_token = async (attemptId: string) => {
		const attempt = await t.query(internal.gmail_oauth.get_attempt, { ...actor, attemptId });
		const grant = await t.run(ctx => ctx.db.get(attempt!.grantId!));
		return gmail_decrypt(grant!.interactiveSecret!, `grant:${grant!._id}:interactive`);
	};
	return { t, state, page, start, stage, dedicated_token };
}

describe("gmail_start", () => {
	test("replays the exact consent link and keeps its dedicated grant unsealed", async () => {
		const { t, state, start } = setup(); const requestId = gmail_random_secret();
		const first = await start(requestId);
		expect(await start(requestId)).toEqual(first);
		expect(state.exchanges).toBe(1);
		const grants = await t.run(ctx => ctx.db.query("host_grants").collect());
		expect(grants).toHaveLength(1);
		expect(grants[0]).toMatchObject({ phase: "awaiting_finish", accountId: null, sealedSecret: null, nextAttemptAt: null });
		expect(await t.run(ctx => ctx.db.query("gmail_accounts").first())).toBeNull();
		await expect(start(requestId, "different")).rejects.toThrow("request_changed");
	});
	test("recovers a lost Press exchange and starts the consent deadline when ready", async () => {
		const { t, state, start } = setup(); state.losePress = true;
		const requestId = gmail_random_secret();
		expect(await start(requestId)).toMatchObject({ status: "preparing" });
		vi.advanceTimersByTime(60_000);
		expect(await start(requestId)).toMatchObject({ status: "pending", consentUrl: expect.any(String) });
		expect(state.exchanges).toBe(1);
		const attempt = await t.run(ctx => ctx.db.query("oauth_states").unique());
		expect(attempt!.expiresAt).toBe(Date.now() + 600_000);
	});
	test("a new id cancels the earlier attempt and refuses its late callback", async () => {
		const { t, start } = setup(); const first = await start();
		const state = new URL(first.consentUrl!).searchParams.get("state")!;
		await start();
		await expect(t.action(ctx => gmail_callback(ctx, state, "late-code", false))).rejects.toThrow("invalid_callback");
		expect((await t.query(internal.gmail_oauth.get_attempt, { ...actor, attemptId: first.attemptId }))?.status).toBe("cancelled");
	});
	test("a second account attempt gets a separate chain from the same page", async () => {
		const { t, stage } = setup();
		const staged = await stage();
		const first = await t.action(ctx => gmail_finish(ctx, actor, { attemptId: staged.attemptId, finishCode: staged.finishCode }));
		const account = (await t.run(ctx => ctx.db.get(first.accountId)))!;
		const before = await t.run(ctx => ctx.db.get(account.hostGrantId!));
		const second = await t.mutation(internal.gmail_oauth.prepare_start, {
			...actor, clientRequestId: gmail_random_secret(), accountId: null, pageToken: plu,
		});
		if (!("_yay" in second)) throw new Error("Expected a second attempt");
		const attempt = (await t.query(internal.gmail_oauth.get_attempt, { ...actor, attemptId: second._yay }))!;
		expect(attempt.grantId).not.toBe(account.hostGrantId);
		expect(await t.run(ctx => ctx.db.get(account.hostGrantId!))).toEqual(before);
	});
	test("bounds ten new attempts per hour without charging exact recovery", async () => {
		const { start } = setup(); const id = gmail_random_secret(); await start(id);
		for (let i = 0; i < 10; i++) await start(id);
		for (let i = 1; i < 10; i++) await start();
		await expect(start()).rejects.toThrow("rate_limited");
	});
});

describe("gmail_callback", () => {
	test("stages only, and reveals the finish code only for the same Google code", async () => {
		const { t, state, stage } = setup(); const staged = await stage();
		expect(await t.run(ctx => ctx.db.query("gmail_accounts").first())).toBeNull();
		const replay = await t.action(ctx => gmail_callback(ctx, staged.state, "google-code", false));
		expect(replay.finishCode).toBe(staged.finishCode);
		await expect(t.action(ctx => gmail_callback(ctx, staged.state, "other-code", false))).rejects.toThrow("invalid_callback");
		await expect(t.action(ctx => gmail_callback(ctx, staged.state, null, false))).rejects.toThrow("invalid_callback");
		expect(state.googleExchanges).toBe(1);
		const row = await t.query(internal.gmail_oauth.get_attempt, { ...actor, attemptId: staged.attemptId });
		expect(JSON.stringify(row)).not.toContain('"refresh"');
		expect(JSON.stringify(row)).not.toContain(staged.finishCode);
	});
	test("fails a lost exchange once and never reuses its Google code", async () => {
		const { t, state, start } = setup(); const started = await start();
		state.loseGoogle = true;
		const consentState = new URL(started.consentUrl!).searchParams.get("state")!;
		await expect(t.action(ctx => gmail_callback(ctx, consentState, "google-code", false))).rejects.toThrow("start_again");
		await expect(t.action(ctx => gmail_callback(ctx, consentState, "google-code", false))).rejects.toThrow("invalid_callback");
		expect(state.googleExchanges).toBe(1);
		const row = await t.query(internal.gmail_oauth.get_attempt, { ...actor, attemptId: started.attemptId });
		expect(row).toMatchObject({ status: "failed", encryptedState: null, stagedRefreshToken: null, encryptedFinishCode: null });
	});
	test("fails a crashed exchange after two minutes", async () => {
		const { t, state, start } = setup(); const started = await start();
		const consentState = new URL(started.consentUrl!).searchParams.get("state")!;
		await t.mutation(internal.gmail_oauth.claim_callback, { stateHash: await gmail_sha256(consentState), codeHash: await gmail_sha256("google-code"), denied: false });
		vi.advanceTimersByTime(120_000);
		await expect(t.action(ctx => gmail_callback(ctx, consentState, "google-code", false))).rejects.toThrow("start_again");
		expect(state.googleExchanges).toBe(0);
	});
	test("cleanup closes a crashed exchange without waiting for another callback", async () => {
		const { t, start } = setup(); const started = await start();
		const consentState = new URL(started.consentUrl!).searchParams.get("state")!;
		await t.mutation(internal.gmail_oauth.claim_callback, { stateHash: await gmail_sha256(consentState), codeHash: await gmail_sha256("google-code"), denied: false });
		vi.advanceTimersByTime(120_000); await t.mutation(internal.gmail_oauth.cleanup, {});
		expect(await t.query(internal.gmail_oauth.get_attempt, { ...actor, attemptId: started.attemptId })).toMatchObject({ status: "failed", encryptedState: null, processingDeadline: null });
	});
	test("closes a denied pending state without calling Google", async () => {
		const { t, state, start } = setup(); const started = await start();
		await expect(t.action(ctx => gmail_callback(ctx, new URL(started.consentUrl!).searchParams.get("state")!, null, true))).rejects.toThrow("google_denied");
		expect(state.googleExchanges).toBe(0);
		expect((await t.query(internal.gmail_oauth.get_attempt, { ...actor, attemptId: started.attemptId }))?.status).toBe("failed");
	});
	test("the public callback accepts navigation without Origin and escapes its output", async () => {
		const { t, state } = setup();
		const escapedActor = { ...actor, organizationId: "<script>alert(1)</script>" }; state.grantActor = escapedActor;
		const started = await t.action(ctx => gmail_start(ctx, escapedActor, { clientRequestId: gmail_random_secret(), accountId: null }, plu));
		const response = await t.fetch(`/oauth/google/callback?state=${new URL(started.consentUrl!).searchParams.get("state")}&code=google-code`);
		expect(response.status).toBe(200);
		expect(response.headers.get("Cache-Control")).toBe("no-store");
		expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
		const text = await response.text();
		expect(text).toContain("Finish code");
		expect(text).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
		expect(text).not.toContain("<script>");
	});
});

describe("gmail_finish", () => {
	test("a member holding only consent state cannot finish the mailbox", async () => {
		const { t, stage } = setup(); const staged = await stage();
		await expect(t.action(ctx => gmail_finish(ctx, actor, { attemptId: staged.attemptId, finishCode: staged.state }))).rejects.toThrow("invalid_finish_code");
		expect(await t.run(ctx => ctx.db.query("gmail_accounts").first())).toBeNull();
	});
	test("creates one unsealed account, clears staged secrets, and replays only its receipt", async () => {
		const { t, page, stage, state, dedicated_token } = setup(); const staged = await stage();
		const dedicated = await dedicated_token(staged.attemptId);
		const response = await page("/page/connect/finish", { attemptId: staged.attemptId, finishCode: staged.finishCode });
		expect(response.status).toBe(200);
		const receipt: unknown = await response.json();
		expect(receipt).toMatchObject({ accountId: expect.any(String), connectionGeneration: 1 });
		const account = await t.run(ctx => ctx.db.query("gmail_accounts").unique());
		expect(account).toMatchObject({ destinationPath: "/emails/ray-example.com", syncStatus: "backfilling", historyId: null, nextSyncAt: null, lastSyncedAt: null });
		expect(await gmail_decrypt(account!.googleRefreshToken!, gmail_google_token_purpose("org", "workspace", "ray@example.com"))).toBe("refresh");
		const attempt = await t.query(internal.gmail_oauth.get_attempt, { ...actor, attemptId: staged.attemptId });
		expect(attempt).toMatchObject({ status: "finished", stagedRefreshToken: null, encryptedFinishCode: null, encryptedState: null });
		expect((await t.run(ctx => ctx.db.get(account!.hostGrantId!)))?.phase).toBe("seal");
		state.deadTokens.add(dedicated);
		const calls = state.verifiedTokens.filter(token => token === dedicated).length;
		expect(await (await page("/page/connect/finish", { attemptId: staged.attemptId, finishCode: staged.finishCode })).json()).toEqual(receipt);
		expect(state.verifiedTokens.filter(token => token === dedicated)).toHaveLength(calls);
		expect(await t.action(ctx => gmail_callback(ctx, staged.state, "google-code", false))).toMatchObject({ status: "finished" });
	});
	test("dead dedicated authority fails only the attempt", async () => {
		const { t, state, stage, dedicated_token } = setup(); const staged = await stage();
		state.deadTokens.add(await dedicated_token(staged.attemptId));
		await expect(t.action(ctx => gmail_finish(ctx, actor, { attemptId: staged.attemptId, finishCode: staged.finishCode }))).rejects.toThrow("start_again");
		expect(await t.run(ctx => ctx.db.query("gmail_accounts").first())).toBeNull();
		expect(await t.query(internal.gmail_oauth.get_attempt, { ...actor, attemptId: staged.attemptId })).toMatchObject({ status: "failed", stagedRefreshToken: null });
	});
	test("temporary dedicated failure preserves the fixed deadline and code", async () => {
		const { t, state, stage, dedicated_token } = setup(); const staged = await stage();
		const token = await dedicated_token(staged.attemptId); state.temporaryTokens.add(token);
		const before = await t.query(internal.gmail_oauth.get_attempt, { ...actor, attemptId: staged.attemptId });
		await expect(t.action(ctx => gmail_finish(ctx, actor, { attemptId: staged.attemptId, finishCode: staged.finishCode }))).rejects.toThrow("service_unavailable");
		expect(await t.query(internal.gmail_oauth.get_attempt, { ...actor, attemptId: staged.attemptId })).toEqual(before);
		state.temporaryTokens.clear();
		expect(await t.action(ctx => gmail_finish(ctx, actor, { attemptId: staged.attemptId, finishCode: staged.finishCode }))).toMatchObject({ connectionGeneration: 1 });
	});
	test("refuses a different actor, binding, code, and stale completed generation", async () => {
		const { t, stage } = setup(); const staged = await stage();
		const input = { attemptId: staged.attemptId, finishCode: staged.finishCode };
		await expect(t.action(ctx => gmail_finish(ctx, { ...actor, actorUserId: "other" }, input))).rejects.toThrow("invalid_finish_code");
		await expect(t.action(ctx => gmail_finish(ctx, { ...actor, workspaceId: "other" }, input))).rejects.toThrow("invalid_finish_code");
		await expect(t.action(ctx => gmail_finish(ctx, actor, { ...input, finishCode: "0".repeat(64) }))).rejects.toThrow("invalid_finish_code");
		const receipt = await t.action(ctx => gmail_finish(ctx, actor, input));
		await t.run(ctx => ctx.db.patch(receipt.accountId, { connectionGeneration: 2 }));
		await expect(t.action(ctx => gmail_finish(ctx, actor, input))).rejects.toThrow("connection_changed");
	});
	test("counts an unsealed account against the atomic deployment cap", async () => {
		const { t, state, stage } = setup(); const first = await stage();
		const receipt = await t.action(ctx => gmail_finish(ctx, actor, { attemptId: first.attemptId, finishCode: first.finishCode }));
		state.email = "second@example.com"; const second = await stage();
		const input = { attemptId: second.attemptId, finishCode: second.finishCode };
		const before = await t.query(internal.gmail_oauth.get_attempt, { ...actor, attemptId: second.attemptId });
		await expect(t.action(ctx => gmail_finish(ctx, actor, input))).rejects.toThrow("account_capacity");
		expect(await t.query(internal.gmail_oauth.get_attempt, { ...actor, attemptId: second.attemptId })).toEqual(before);
		await t.run(ctx => ctx.db.patch(receipt.accountId, { syncStatus: "disconnected" }));
		expect(await t.action(ctx => gmail_finish(ctx, actor, input))).toMatchObject({ connectionGeneration: 1 });
	});
	test("concurrent Finish calls cannot exceed the final active slot", async () => {
		const { t, state, stage } = setup(); const first = await stage();
		const otherActor = { ...actor, actorUserId: "other" }; state.grantActor = otherActor; state.email = "other@example.com";
		const started = await t.action(ctx => gmail_start(ctx, otherActor, { clientRequestId: gmail_random_secret(), accountId: null }, plu));
		const callback = await t.action(ctx => gmail_callback(ctx, new URL(started.consentUrl!).searchParams.get("state")!, "other-code", false));
		const results = await Promise.allSettled([
			t.action(ctx => gmail_finish(ctx, actor, { attemptId: first.attemptId, finishCode: first.finishCode })),
			t.action(ctx => gmail_finish(ctx, otherActor, { attemptId: started.attemptId, finishCode: callback.finishCode! })),
		]);
		expect(results.filter(result => result.status === "fulfilled")).toHaveLength(1);
		expect(results.filter(result => result.status === "rejected")).toHaveLength(1);
		expect(await t.run(ctx => ctx.db.query("gmail_accounts").collect())).toHaveLength(1);
		expect((await t.run(ctx => ctx.db.query("oauth_states").collect())).filter(attempt => attempt.status === "awaiting_finish")).toHaveLength(1);
	});
	test("Reconnect preserves destination, counts, and permission clock while resetting both traversals", async () => {
		const { t, stage } = setup(); const first = await stage();
		const receipt = await t.action(ctx => gmail_finish(ctx, actor, { attemptId: first.attemptId, finishCode: first.finishCode }));
		const due = Date.now() + 60 * 60_000;
		await t.run(ctx => ctx.db.patch(receipt.accountId, { backfillComplete: true, historyId: "999", historyPageToken: "page", backfillPageToken: "backfill",
			permissionProbeNotBefore: due, messagesSynced: 12, ledgerCounts: { pending: 0, done: 10, skipped: 0, failed: 2, given_up: 0, emailAssumed: 1, permissionHeld: 2 } }));
		const reconnect = await stage(receipt.accountId);
		expect((await t.run(ctx => ctx.db.get(receipt.accountId)))?.connectionGeneration).toBe(1);
		expect(await t.action(ctx => gmail_finish(ctx, actor, { attemptId: reconnect.attemptId, finishCode: reconnect.finishCode }))).toMatchObject({ connectionGeneration: 2 });
		expect(await t.run(ctx => ctx.db.get(receipt.accountId))).toMatchObject({ destinationPath: "/emails/ray-example.com", permissionProbeNotBefore: due,
			messagesSynced: 12, ledgerCounts: { permissionHeld: 2, emailAssumed: 1 }, historyId: null, historyPageToken: null, backfillPageToken: null, backfillComplete: false, lastSyncedAt: null });
	});
	test.each(["pending", "awaiting_finish"])("a later writer cancels an older %s Reconnect and keeps saved mail", async status => {
		const f = await gmail_test_fixture();
		const { t, state, start } = setup(f.t);
		const before = (await t.run(ctx => ctx.db.get(f.accountId)))!;
		const ledger = await t.run(ctx => ctx.db.get(f.ledgerId));
		const older = await start(gmail_random_secret(), f.accountId);
		const oldState = new URL(older.consentUrl!).searchParams.get("state")!;
		const oldCallback = status === "awaiting_finish"
			? await t.action(ctx => gmail_callback(ctx, oldState, "older-code", false)) : null;
		const oldAttempt = (await t.query(internal.gmail_oauth.get_attempt, { ...actor, attemptId: older.attemptId }))!;
		const laterWriter = { ...actor, actorUserId: "later-writer" }; state.grantActor = laterWriter;
		const newer = await t.action(ctx => gmail_start(ctx, laterWriter, {
			clientRequestId: gmail_random_secret(), accountId: f.accountId,
		}, plu));
		const cancelled = await t.query(internal.gmail_oauth.get_attempt, { ...actor, attemptId: older.attemptId });
		expect(cancelled?.status).toBe("cancelled");
		expect(cancelled).toMatchObject({ stateHash: null, encryptedState: null, stagedRefreshToken: null,
			finishCodeHash: null, encryptedFinishCode: null,
		});
		expect(await t.run(ctx => ctx.db.get(oldAttempt.grantId!))).toMatchObject({
			phase: "cancelled", sourceSecret: null, interactiveSecret: null, sealedSecret: null, nextAttemptAt: null,
		});
		const callback = await t.action(ctx => gmail_callback(ctx, new URL(newer.consentUrl!).searchParams.get("state")!, "newer-code", false));
		const input = { attemptId: newer.attemptId, finishCode: callback.finishCode! };
		const receipt = await t.action(ctx => gmail_finish(ctx, laterWriter, input));
		expect(receipt).toEqual({ accountId: f.accountId, connectionGeneration: 2 });
		const after = (await t.run(ctx => ctx.db.get(f.accountId)))!;
		expect(after.hostActorUserId).toBe(laterWriter.actorUserId);
		expect(after).toMatchObject({ destinationPath: before.destinationPath,
			permissionProbeNotBefore: before.permissionProbeNotBefore, messagesSynced: before.messagesSynced,
			ledgerCounts: before.ledgerCounts, syncStatus: "backfilling", historyId: null, historyPageToken: null,
			backfillPage: null, backfillPageToken: null, backfillComplete: false, connectRequestId: null,
		});
		expect(await t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(ledger);
		expect(await t.run(ctx => ctx.db.get(f.grantId))).toMatchObject({
			phase: "cancelled", sourceSecret: null, interactiveSecret: null, sealedSecret: null, nextAttemptAt: null,
		});
		const exchanges = state.googleExchanges;
		await expect(t.action(ctx => gmail_callback(ctx, oldState, "older-code", false))).rejects.toThrow("invalid_callback");
		if (oldCallback) await expect(t.action(ctx => gmail_finish(ctx, actor, {
			attemptId: older.attemptId, finishCode: oldCallback.finishCode!,
		}))).rejects.toThrow("invalid_finish_code");
		expect(state.googleExchanges).toBe(exchanges);
		expect(await t.action(ctx => gmail_finish(ctx, laterWriter, input))).toEqual(receipt);
		expect(await t.run(ctx => ctx.db.get(f.accountId))).toEqual(after);
		expect(await t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(ledger);
	});
	test("an in-flight callback cannot stage its token after a later writer reconnects", async () => {
		const f = await gmail_test_fixture();
		const { t, state, start } = setup(f.t);
		const older = await start(gmail_random_secret(), f.accountId);
		const oldState = new URL(older.consentUrl!).searchParams.get("state")!;
		const fetch = globalThis.fetch;
		let exchangeStarted!: () => void;
		let releaseExchange!: () => void;
		const started = new Promise<void>(resolve => { exchangeStarted = resolve; });
		const released = new Promise<void>(resolve => { releaseExchange = resolve; });
		vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
			const url = new URL(input instanceof Request ? input.url : String(input));
			// Pause only the older exchange so the new connection can finish.
			if (url.origin === "https://oauth2.googleapis.com" && new URLSearchParams(String(init?.body)).get("code") === "older-code") {
				exchangeStarted();
				await released;
			}
			return fetch(input, init);
		});
		const lateReply = t.action(ctx => gmail_callback(ctx, oldState, "older-code", false)).catch((error: unknown) => error);
		await started;
		const laterWriter = { ...actor, actorUserId: "later-writer" }; state.grantActor = laterWriter;
		try {
			const newer = await t.action(ctx => gmail_start(ctx, laterWriter, {
				clientRequestId: gmail_random_secret(), accountId: f.accountId,
			}, plu));
			const callback = await t.action(ctx => gmail_callback(ctx, new URL(newer.consentUrl!).searchParams.get("state")!, "newer-code", false));
			await t.action(ctx => gmail_finish(ctx, laterWriter, { attemptId: newer.attemptId, finishCode: callback.finishCode! }));
			const after = await t.run(ctx => ctx.db.get(f.accountId));
			const ledger = await t.run(ctx => ctx.db.get(f.ledgerId));
			releaseExchange();
			const refused = await lateReply;
			expect(refused instanceof Error && refused.message === "start_again").toBe(true);
			expect(await t.query(internal.gmail_oauth.get_attempt, { ...actor, attemptId: older.attemptId })).toMatchObject({
				status: "cancelled", stagedRefreshToken: null, stagedEmailAddress: null, encryptedFinishCode: null,
			});
			expect(await t.run(ctx => ctx.db.get(f.accountId))).toEqual(after);
			expect(await t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(ledger);
		} finally { releaseExchange(); }
	});
	test("wrong Gmail account and dead pending Reconnect leave the old connection intact", async () => {
		const { t, state, stage, start, dedicated_token } = setup(); const first = await stage();
		const receipt = await t.action(ctx => gmail_finish(ctx, actor, { attemptId: first.attemptId, finishCode: first.finishCode }));
		const before = await t.run(ctx => ctx.db.get(receipt.accountId));
		state.email = "different@example.com";
		const reconnect = await start(gmail_random_secret(), receipt.accountId);
		await expect(t.action(ctx => gmail_callback(ctx, new URL(reconnect.consentUrl!).searchParams.get("state")!, "new-code", false))).rejects.toThrow("gmail_account_changed");
		state.email = "ray@example.com"; const next = await stage(receipt.accountId);
		state.deadTokens.add(await dedicated_token(next.attemptId));
		await expect(t.action(ctx => gmail_finish(ctx, actor, { attemptId: next.attemptId, finishCode: next.finishCode }))).rejects.toThrow("start_again");
		expect(await t.run(ctx => ctx.db.get(receipt.accountId))).toEqual(before);
	});
});

describe("cancel and HTTP admission", () => {
	test("Cancel clears staged secrets and never disconnects a finished account", async () => {
		const { t, stage } = setup(); const staged = await stage();
		expect(await t.mutation(internal.gmail_oauth.cancel, { ...actor, attemptId: staged.attemptId })).toEqual({ _yay: null });
		const row = await t.query(internal.gmail_oauth.get_attempt, { ...actor, attemptId: staged.attemptId });
		expect(row).toMatchObject({ status: "cancelled", stagedRefreshToken: null, encryptedFinishCode: null, encryptedState: null });
		const next = await stage(); await t.action(ctx => gmail_finish(ctx, actor, { attemptId: next.attemptId, finishCode: next.finishCode }));
		expect(await t.mutation(internal.gmail_oauth.cancel, { ...actor, attemptId: next.attemptId })).toMatchObject({ _nay: { code: "connection_finished" } });
	});
	test("rejects malformed finish codes and request ids before outbound calls", async () => {
		const { page, state } = setup();
		expect((await page("/page/connect/finish", { attemptId: "attempt", finishCode: "bad" })).status).toBe(400);
		expect((await page("/page/connect/start", { clientRequestId: "bad", accountId: null })).status).toBe(400);
		expect(state.exchanges).toBe(0);
		expect(state.verifiedTokens).toHaveLength(0);
	});
});
