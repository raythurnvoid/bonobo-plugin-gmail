import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { FunctionArgs } from "convex/server";
import { internal } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";
import { gmail_test_fixture } from "../scripts/gmail-test-fixtures";
import { gmail_random_secret } from "./gmail_secrets";
import { work_account_slice } from "./gmail_worker";

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(1_800_000_000_000); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

// Add a second due account on its own ready grant.
async function second_account(f: Awaited<ReturnType<typeof gmail_test_fixture>>) {
	return f.t.run(async ctx => {
		const { _id, _creationTime, ...account } = (await ctx.db.get(f.accountId))!;
		const { _id: _grantId, _creationTime: _grantCreationTime, ...grant } = (await ctx.db.get(f.grantId))!;
		const accountId = await ctx.db.insert("gmail_accounts", { ...account, emailAddress: "second@example.com" });
		await ctx.db.patch(accountId, { hostGrantId: await ctx.db.insert("host_grants", { ...grant, accountId }) });
		return accountId;
	});
}

// Stand in for the slice action, so the tests below decide when a slice ends.
function stub_slice(run: () => Promise<void> = async () => {}) {
	const registered = work_account_slice as typeof work_account_slice & {
		_handler: (ctx: ActionCtx, args: FunctionArgs<typeof internal.gmail_worker.work_account_slice>) => Promise<null>;
	};
	return vi.spyOn(registered, "_handler").mockImplementation(async () => {
		await run();
		return null;
	});
}

describe("status", () => {
	test("fills each page from the exact organization and workspace", async () => {
		const { t, actor, accountId } = await gmail_test_fixture();
		const account = (await t.run(ctx => ctx.db.get(accountId)))!;
		const matchingIds = await t.run(async ctx => {
			const { _id, _creationTime, ...fields } = account;
			const disconnected = { ...fields, googleRefreshToken: null, hostGrantId: null, syncStatus: "disconnected" as const,
				nextSyncAt: null, permissionProbeNotBefore: null,
				ledgerCounts: { pending: 0, done: 0, skipped: 0, failed: 0, given_up: 0, emailAssumed: 0, permissionHeld: 0 } };
			// More than one page of other accounts must not shorten the matching page.
			for (let i = 0; i < 30; i++) {
				const emailAddress = `a-${i.toString().padStart(2, "0")}@example.com`;
				await ctx.db.insert("gmail_accounts", { ...disconnected, emailAddress, hostOrganizationId: "other-org" });
				await ctx.db.insert("gmail_accounts", { ...disconnected, emailAddress, hostWorkspaceId: "other-workspace" });
			}
			const ids = [];
			for (let i = 0; i < 26; i++) ids.push(await ctx.db.insert("gmail_accounts", {
				...disconnected, emailAddress: `match-${i.toString().padStart(2, "0")}@example.com`,
			}));
			return ids;
		});
		const first = await t.query(internal.gmail_accounts.status, { ...actor, canWrite: false,
			paginationOpts: { numItems: 25, cursor: null } });
		expect(first.accounts.map(account => account.accountId)).toEqual(matchingIds.slice(0, 25));
		expect(first.cursor).not.toBeNull();
		const second = await t.query(internal.gmail_accounts.status, { ...actor, canWrite: false,
			paginationOpts: { numItems: 25, cursor: first.cursor } });
		expect(second.accounts.map(account => account.accountId)).toEqual([matchingIds[25], accountId]);
		expect(second.cursor).toBeNull();
	});

	test("reports the Gmail time of the newest saved email, not of a newer email still in the queue", async () => {
		const { t, actor, ledgerId } = await gmail_test_fixture();
		await t.run(async ctx => {
			const { _id, _creationTime, ...row } = (await ctx.db.get(ledgerId))!;
			await ctx.db.patch(ledgerId, { internalDate: 1_700_000_000_000 });
			await ctx.db.insert("messages_ledger", { ...row, gmailMessageId: "older", internalDate: 1_600_000_000_000 });
			await ctx.db.insert("messages_ledger", { ...row, gmailMessageId: "queued", internalDate: 1_750_000_000_000,
				emailWritten: false, filePath: null });
		});

		const status = await t.query(internal.gmail_accounts.status, { ...actor, canWrite: false,
			paginationOpts: { numItems: 25, cursor: null } });
		expect(status.accounts[0].newestEmailAt).toBe(1_700_000_000_000);
	});
});

describe("disconnect", () => {
	test("clears local secrets and work while keeping Files progress and the permission clock", async () => {
		const { t, actor, accountId, grantId, ledgerId } = await gmail_test_fixture();
		const before = (await t.run(ctx => ctx.db.get(accountId)))!;
		const ledger = await t.run(ctx => ctx.db.get(ledgerId));
		const workId = await t.run(ctx => ctx.scheduler.runAt(Date.now() + 3600_000, internal.gmail_grants.connect, { grantId }));
		await t.run(ctx => ctx.db.patch(accountId, { syncWorkId: workId, syncRequestId: "old-request", googleAccessToken: { encrypted: "saved", expiresAt: Date.now() + 3600_000 } }));
		expect(await t.mutation(internal.gmail_accounts.disconnect, { ...actor, accountId, expectedGeneration: 1 })).toEqual({ _yay: { accountId, connectionGeneration: 2 } });
		const after = await t.run(ctx => ctx.db.get(accountId));
		expect(after).toMatchObject({ syncStatus: "disconnected", googleRefreshToken: null, googleAccessToken: null, hostGrantId: null, syncWorkId: null,
			syncRequestId: null, nextSyncAt: null, ledgerCounts: before.ledgerCounts, permissionProbeNotBefore: before.permissionProbeNotBefore,
			destinationPath: before.destinationPath, historyId: before.historyId, messagesSynced: before.messagesSynced });
		expect(await t.run(ctx => ctx.db.get(ledgerId))).toEqual(ledger);
		expect(await t.run(ctx => ctx.db.get(grantId))).toMatchObject({ phase: "cancelled", sourceSecret: null, interactiveSecret: null, sealedSecret: null });
		expect(await t.query(internal.gmail_grants.get_current, { grantId })).toBeNull();
	});
	test("rejects another tenant and an old displayed generation", async () => {
		const { t, actor, accountId } = await gmail_test_fixture();
		expect(await t.mutation(internal.gmail_accounts.disconnect, { ...actor, workspaceId: "other", accountId, expectedGeneration: 1 })).toMatchObject({ _nay: { code: "account_not_found" } });
		expect(await t.mutation(internal.gmail_accounts.disconnect, { ...actor, accountId, expectedGeneration: 0 })).toMatchObject({ _nay: { code: "connection_changed" } });
		expect((await t.run(ctx => ctx.db.get(accountId)))?.syncStatus).toBe("live");
	});
	test("cancels a slice that has not started and starts the next due account", async () => {
		const f = await gmail_test_fixture();
		const secondId = await second_account(f);
		await f.t.run(ctx => ctx.db.patch(f.accountId, { nextSyncAt: Date.now() - 1000 }));
		const slice = stub_slice();
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const workId = (await f.t.run(ctx => ctx.db.get(f.accountId)))!.syncWorkId!;
		expect(await f.t.mutation(internal.gmail_accounts.disconnect, { ...f.actor, accountId: f.accountId, expectedGeneration: 1 }))
			.toMatchObject({ _yay: { accountId: f.accountId } });
		expect(await f.t.run(async ctx => (await ctx.db.system.get(workId))!.state.kind)).toBe("canceled");
		// The first step runs the dispatch, the second the new slice.
		for (let turn = 0; turn < 2; turn++) { vi.advanceTimersByTime(0); await f.t.finishInProgressScheduledFunctions(); }
		expect((await f.t.run(ctx => ctx.db.get(secondId)))!.syncWorkId).toEqual(expect.any(String));
		expect(slice.mock.calls.map(call => call[1].work.accountId)).toEqual([secondId]);
	});
	test("private operator readback is safe, and Disconnect checks its generation", async () => {
		const { t, accountId } = await gmail_test_fixture();
		const summary = await t.query(internal.gmail_accounts.operator_account_summary, { accountId });
		expect(Object.keys(summary!).sort()).toEqual(["accountId", "connectionGeneration", "emailAddress", "hostOrganizationId", "hostWorkspaceId", "hostInstallationId", "hostActorUserId", "destinationPath", "syncStatus"].sort());
		expect(await t.mutation(internal.gmail_accounts.operator_disconnect, { accountId, expectedGeneration: 0 })).toMatchObject({ _nay: { code: "connection_changed" } });
		expect(await t.mutation(internal.gmail_accounts.operator_disconnect, { accountId, expectedGeneration: 1 })).toEqual({ _yay: {
			accountId, connectionGeneration: 2, localSecretsCleared: true, pendingWorkStopped: true, ledgerCountsKept: true } });
		expect((await t.query(internal.gmail_accounts.operator_account_summary, { accountId }))?.syncStatus).toBe("disconnected");
	});
});

describe("prepare_repair", () => {
	test("replaces the chain without changing generation, traversals, source error, or holds", async () => {
		const { t, actor, accountId, grantId, ledgerId } = await gmail_test_fixture();
		await t.run(ctx => ctx.db.patch(accountId, { syncStatus: "blocked", syncError: "press_reconnect_needed", sourceError: "google_revoked" }));
		const before = (await t.run(ctx => ctx.db.get(accountId)))!;
		const ledger = await t.run(ctx => ctx.db.get(ledgerId));
		const input = { ...actor, accountId, expectedGeneration: 1, clientRequestId: gmail_random_secret(), pageToken: `plu_${"1".repeat(64)}` };
		const result = await t.mutation(internal.gmail_accounts.prepare_repair, input);
		if (!("_yay" in result)) throw new Error("Expected repair");
		expect(result._yay.grantId).not.toBe(grantId);
		expect(await t.run(ctx => ctx.db.get(accountId))).toMatchObject({ connectionGeneration: 1, hostGrantId: result._yay.grantId,
			sourceError: "google_revoked", historyId: before.historyId, historyPageToken: before.historyPageToken,
			backfillPage: before.backfillPage, backfillPageToken: before.backfillPageToken,
			permissionProbeNotBefore: before.permissionProbeNotBefore, ledgerCounts: before.ledgerCounts, nextSyncAt: null });
		expect(await t.run(ctx => ctx.db.get(ledgerId))).toEqual(ledger);
		expect(await t.run(ctx => ctx.db.get(grantId))).toMatchObject({ phase: "cancelled", interactiveSecret: null, sealedSecret: null });
		expect(await t.mutation(internal.gmail_accounts.prepare_repair, input)).toEqual(result);
		await t.run(ctx => ctx.db.patch(result._yay.grantId, { phase: "ready" }));
		await t.run(ctx => ctx.db.patch(accountId, { syncError: "google_revoked", syncStatus: "error" }));
		expect(await t.mutation(internal.gmail_accounts.prepare_repair, input)).toEqual(result);
		expect(await t.mutation(internal.gmail_accounts.prepare_repair, { ...input, clientRequestId: gmail_random_secret() })).toMatchObject({ _nay: { code: "repair_not_needed" } });
	});
	test("reuses an in-flight repair for a new caller id", async () => {
		const { t, actor, accountId } = await gmail_test_fixture();
		await t.run(ctx => ctx.db.patch(accountId, { syncStatus: "blocked", syncError: "press_reconnect_needed" }));
		const input = { ...actor, accountId, expectedGeneration: 1, clientRequestId: gmail_random_secret(), pageToken: `plu_${"1".repeat(64)}` };
		const first = await t.mutation(internal.gmail_accounts.prepare_repair, input);
		expect(await t.mutation(internal.gmail_accounts.prepare_repair, { ...input, clientRequestId: gmail_random_secret() })).toEqual(first);
		expect(await t.run(ctx => ctx.db.query("host_grants").collect())).toHaveLength(2);
	});
	test.each(["old-installation", "other-actor"])("refuses %s before making a new chain", async kind => {
		const { t, actor, accountId } = await gmail_test_fixture();
		await t.run(ctx => ctx.db.patch(accountId, { syncError: "press_reconnect_needed" }));
		const caller = kind === "old-installation" ? { ...actor, installationId: "new-installation" } : { ...actor, actorUserId: "other" };
		expect(await t.mutation(internal.gmail_accounts.prepare_repair, { ...caller, accountId, expectedGeneration: 1,
			clientRequestId: gmail_random_secret(), pageToken: "unused" })).toMatchObject({ _nay: { code: "google_reconnect_needed" } });
		expect(await t.run(ctx => ctx.db.query("host_grants").collect())).toHaveLength(1);
	});
	test("healthy, disconnected, and changed-generation accounts refuse a new repair", async () => {
		const { t, actor, accountId } = await gmail_test_fixture();
		const input = { ...actor, accountId, expectedGeneration: 1, clientRequestId: gmail_random_secret(), pageToken: "unused" };
		expect(await t.mutation(internal.gmail_accounts.prepare_repair, input)).toMatchObject({ _nay: { code: "repair_not_needed" } });
		await t.run(ctx => ctx.db.patch(accountId, { syncStatus: "disconnected" }));
		expect(await t.mutation(internal.gmail_accounts.prepare_repair, input)).toMatchObject({ _nay: { code: "account_disconnected" } });
		expect(await t.mutation(internal.gmail_accounts.prepare_repair, { ...input, expectedGeneration: 0 })).toMatchObject({ _nay: { code: "connection_changed" } });
	});
});

describe("retry_sync", () => {
	test.each(["gmail_request", "history_response_too_large"] as const)("clears only recoverable source error %s", async sourceError => {
		const { t, actor, accountId } = await gmail_test_fixture();
		await t.run(ctx => ctx.db.patch(accountId, { syncStatus: "error", syncError: sourceError, sourceError }));
		const before = (await t.run(ctx => ctx.db.get(accountId)))!;
		expect(await t.mutation(internal.gmail_accounts.retry_sync, { ...actor, accountId, expectedGeneration: 1 })).toEqual({ _yay: null });
		expect(await t.run(ctx => ctx.db.get(accountId))).toMatchObject({ sourceError: null, syncError: null, syncStatus: "live", nextSyncAt: Date.now(),
			historyId: before.historyId, historyPageToken: before.historyPageToken, backfillPage: before.backfillPage,
			ledgerCounts: before.ledgerCounts, permissionProbeNotBefore: before.permissionProbeNotBefore });
		// Retry schedules its own dispatch, so no cron is needed.
		vi.advanceTimersByTime(0); await t.finishInProgressScheduledFunctions();
		expect((await t.run(ctx => ctx.db.get(accountId)))?.syncWorkId).toEqual(expect.any(String));
	});
	test("keeps a Press pause while clearing the independent source error", async () => {
		const { t, actor, accountId, grantId } = await gmail_test_fixture();
		await t.run(ctx => ctx.db.patch(grantId, { phase: "blocked" }));
		await t.run(ctx => ctx.db.patch(accountId, { syncStatus: "blocked", syncError: "press_reconnect_needed", sourceError: "gmail_request" }));
		expect(await t.mutation(internal.gmail_accounts.retry_sync, { ...actor, accountId, expectedGeneration: 1 })).toEqual({ _yay: null });
		expect(await t.run(ctx => ctx.db.get(accountId))).toMatchObject({ sourceError: null, syncError: "press_reconnect_needed", nextSyncAt: null });
	});
	test("refuses revocation, healthy accounts, another tenant, and stale generation", async () => {
		const { t, actor, accountId } = await gmail_test_fixture(); const input = { ...actor, accountId, expectedGeneration: 1 };
		expect(await t.mutation(internal.gmail_accounts.retry_sync, input)).toMatchObject({ _nay: { code: "retry_not_available" } });
		await t.run(ctx => ctx.db.patch(accountId, { sourceError: "google_revoked" }));
		expect(await t.mutation(internal.gmail_accounts.retry_sync, input)).toMatchObject({ _nay: { code: "retry_not_available" } });
		expect(await t.mutation(internal.gmail_accounts.retry_sync, { ...input, organizationId: "other" })).toMatchObject({ _nay: { code: "account_not_found" } });
		expect(await t.mutation(internal.gmail_accounts.retry_sync, { ...input, expectedGeneration: 0 })).toMatchObject({ _nay: { code: "connection_changed" } });
	});
});

describe("dispatch", () => {
	test("starts one slice at a time, and the next due account once the first completes", async () => {
		const f = await gmail_test_fixture();
		const secondId = await second_account(f);
		stub_slice();
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const accounts = await f.t.run(ctx => Promise.all([f.accountId, secondId].map(async id => (await ctx.db.get(id))!)));
		const busy = accounts.filter(account => account.syncWorkId !== null);
		expect(busy).toHaveLength(1);
		const [first] = busy;
		const other = accounts.find(account => account._id !== first._id)!;
		// The slice action ends without completion, so the slot stays busy.
		vi.advanceTimersByTime(0); await f.t.finishInProgressScheduledFunctions();
		expect((await f.t.run(ctx => ctx.db.get(other._id)))!.syncWorkId).toBeNull();
		// A slice saves its next wait in finish_slice, before completion.
		await f.t.run(ctx => ctx.db.patch(first._id, { nextSyncAt: Date.now() + 15 * 60_000 }));
		await f.t.mutation(internal.gmail_accounts.on_complete, {
			context: { accountId: first._id, generation: 1, requestId: first.syncRequestId!, grantId: first.hostGrantId!, checkId: f.checkId } });
		vi.advanceTimersByTime(0); await f.t.finishInProgressScheduledFunctions();
		expect((await f.t.run(ctx => ctx.db.get(first._id)))!.syncWorkId).toBeNull();
		expect((await f.t.run(ctx => ctx.db.get(other._id)))!.syncWorkId).toEqual(expect.any(String));
	});
	test("frees the slot of a dead slice whose check was lost", async () => {
		const f = await gmail_test_fixture();
		stub_slice(async () => { throw new Error("Slice stopped before completion"); });
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		vi.advanceTimersByTime(0); await f.t.finishInProgressScheduledFunctions();
		await f.t.run(async ctx => {
			const checks = (await ctx.db.system.query("_scheduled_functions").collect())
				.filter(job => job.name.includes("check_slice") && job.state.kind === "pending");
			expect(checks).toHaveLength(1);
			await ctx.scheduler.cancel(checks[0]._id);
		});
		vi.advanceTimersByTime(60_000); await f.t.finishInProgressScheduledFunctions();
		expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.syncWorkId).not.toBeNull();
		// The 15-minute cron runs this dispatch.
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null,
			syncStatus: "blocked", syncError: "sync_error", temporaryFailures: 1 });
	});
});

describe("push_received", () => {
	test("brings an idle sync forward at most once a minute, marks a running slice, and ignores old or blocked pushes", async () => {
		const f = await gmail_test_fixture();
		const now = Date.now();
		const later = now + 60 * 60_000;
		const read = async () => (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		const push = (historyId: string) => f.t.mutation(internal.gmail_accounts.push_received, { emailAddress: " Ray@Example.com", historyId });
		const dispatches = () => f.t.run(async ctx => (await ctx.db.system.query("_scheduled_functions").collect())
			.filter(job => job.name.includes("dispatch") && job.state.kind === "pending").length);
		// The fixture saved history id 10, and its last history read was one minute ago.
		await f.t.run(ctx => ctx.db.patch(f.accountId, { nextSyncAt: later }));

		await push("10");
		expect((await read()).nextSyncAt).toBe(later);
		await push("11");
		expect((await read()).nextSyncAt).toBe(now);
		expect(await dispatches()).toBe(1);

		// A slice that just read history makes the next push wait one minute.
		await f.t.run(ctx => ctx.db.patch(f.accountId, { lastSyncedAt: now, nextSyncAt: later }));
		await push("12");
		expect((await read()).nextSyncAt).toBe(now + 60_000);

		await f.t.run(ctx => ctx.db.patch(f.accountId, { syncWorkId: f.checkId, nextSyncAt: later }));
		await push("13");
		expect(await read()).toMatchObject({ pushPending: true, nextSyncAt: later });

		// A push never shortens an error wait.
		await f.t.run(ctx => ctx.db.patch(f.accountId, { syncWorkId: null, pushPending: false, syncStatus: "blocked" }));
		await push("14");
		expect(await read()).toMatchObject({ pushPending: false, nextSyncAt: later });
	});
	test("the push route needs the URL token and acknowledges a message it cannot read", async () => {
		vi.stubEnv("GMAIL_PUSH_TOKEN", "a".repeat(64));
		try {
			const f = await gmail_test_fixture();
			const later = Date.now() + 60 * 60_000;
			await f.t.run(ctx => ctx.db.patch(f.accountId, { nextSyncAt: later }));
			const post = (token: string, body: unknown) => f.t.fetch(`/google/push?token=${token}`, { method: "POST", body: JSON.stringify(body) });
			const message = { message: { data: btoa(JSON.stringify({ emailAddress: "ray@example.com", historyId: 11 })), messageId: "1" }, subscription: "s" };

			expect((await post("b".repeat(64), message)).status).toBe(403);
			expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.nextSyncAt).toBe(later);
			expect((await post("a".repeat(64), { message: { data: "not base64!" } })).status).toBe(204);
			expect((await post("a".repeat(64), message)).status).toBe(204);
			expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.nextSyncAt).toBe(Date.now());
		} finally {
			vi.unstubAllEnvs();
		}
	});
});

describe("on_complete", () => {
	test.each([
		["a saved idle wait", 15 * 60_000, 15 * 60_000],
		// A stale slice ends without finish_slice and leaves a past due time.
		["a past due time", -5_000, 60_000],
	] as const)("schedules the next dispatch after %s", async (_name, dueIn, wait) => {
		const { t, accountId, grantId, checkId } = await gmail_test_fixture();
		await t.run(async ctx => ctx.db.patch(accountId, { syncWorkId: await ctx.scheduler.runAfter(3600_000, internal.gmail_grants.connect, { grantId }),
			syncRequestId: "request", nextSyncAt: Date.now() + dueIn }));
		await t.mutation(internal.gmail_accounts.on_complete, { context: { accountId, generation: 1, requestId: "request", grantId, checkId } });
		vi.advanceTimersByTime(wait - 1); await t.finishInProgressScheduledFunctions();
		expect((await t.run(ctx => ctx.db.get(accountId)))?.syncWorkId).toBeNull();
		vi.advanceTimersByTime(1); await t.finishInProgressScheduledFunctions();
		expect((await t.run(ctx => ctx.db.get(accountId)))?.syncWorkId).toEqual(expect.any(String));
	});
	test("keeps this account's dispatch when an earlier account can no longer start", async () => {
		const f = await gmail_test_fixture();
		const secondId = await second_account(f);
		stub_slice();
		await f.t.run(async ctx => {
			await ctx.db.patch(f.accountId, { syncWorkId: await ctx.scheduler.runAfter(3600_000, internal.gmail_grants.connect, { grantId: f.grantId }),
				syncRequestId: "request", nextSyncAt: Date.now() + 15 * 60_000 });
			await ctx.db.patch(secondId, { nextSyncAt: Date.now() + 5 * 60_000 });
		});
		await f.t.mutation(internal.gmail_accounts.on_complete, { context: { accountId: f.accountId, generation: 1, requestId: "request", grantId: f.grantId, checkId: f.checkId } });
		const second = (await f.t.run(ctx => ctx.db.get(secondId)))!;
		await f.t.run(ctx => ctx.db.patch(second.hostGrantId!, { phase: "renew" }));
		vi.advanceTimersByTime(5 * 60_000); await f.t.finishInProgressScheduledFunctions();
		expect((await f.t.run(ctx => ctx.db.get(secondId)))).toMatchObject({ syncWorkId: null, nextSyncAt: null });
		expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.syncWorkId).toBeNull();
		vi.advanceTimersByTime(10 * 60_000); await f.t.finishInProgressScheduledFunctions();
		expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.syncWorkId).toEqual(expect.any(String));
	});
});

describe("check_slice", () => {
	test("keeps the slot while the slice runs, and frees it a minute after the slice dies", async () => {
		const f = await gmail_test_fixture();
		let heldWhileRunning = false;
		stub_slice(async () => {
			const { syncWorkId: workId, syncRequestId: requestId } = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			await f.t.mutation(internal.gmail_accounts.check_slice, { accountId: f.accountId, requestId: requestId! });
			heldWhileRunning = (await f.t.run(ctx => ctx.db.get(f.accountId)))!.syncWorkId === workId;
			throw new Error("Slice stopped before completion");
		});
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const workId = (await f.t.run(ctx => ctx.db.get(f.accountId)))!.syncWorkId!;
		vi.advanceTimersByTime(0); await f.t.finishInProgressScheduledFunctions();
		expect(heldWhileRunning).toBe(true);
		expect(await f.t.run(async ctx => (await ctx.db.system.get(workId))!.state.kind)).toBe("failed");
		vi.advanceTimersByTime(60_000 - 1); await f.t.finishInProgressScheduledFunctions();
		expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.syncWorkId).toBe(workId);
		vi.advanceTimersByTime(1); await f.t.finishInProgressScheduledFunctions();
		const freed = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		expect(freed).toMatchObject({ syncWorkId: null, syncRequestId: null, syncStatus: "blocked", syncError: "sync_error", temporaryFailures: 1 });
		expect(freed.nextSyncAt).toBeGreaterThanOrEqual(Date.now() + 60_000);
	});
	test("a slice that ends normally cancels its check", async () => {
		const f = await gmail_test_fixture();
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const { syncWorkId } = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		const work: FunctionArgs<typeof internal.gmail_accounts.finish_slice>["work"] =
			await f.t.run(async ctx => (await ctx.db.system.get(syncWorkId!))!.args[0].work);
		await f.t.mutation(internal.gmail_accounts.finish_slice, { work, error: null, retryAfterMs: null, attachmentNote: null,
			active: false, checkedHistory: true });
		expect(await f.t.run(async ctx => (await ctx.db.system.get(work.checkId))!.state.kind)).toBe("canceled");
	});
	test("cancels a slice that never starts and frees the slot", async () => {
		const f = await gmail_test_fixture();
		stub_slice();
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const { syncWorkId: workId, syncRequestId: requestId } = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		// The timers stay still, so the slice job stays pending while the clock moves on.
		vi.setSystemTime(Date.now() + 5 * 60_000);
		await f.t.mutation(internal.gmail_accounts.check_slice, { accountId: f.accountId, requestId: requestId! });
		expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.syncWorkId).toBe(workId);
		vi.setSystemTime(Date.now() + 1);
		await f.t.mutation(internal.gmail_accounts.check_slice, { accountId: f.accountId, requestId: requestId! });
		expect(await f.t.run(async ctx => (await ctx.db.system.get(workId!))!.state.kind)).toBe("canceled");
		expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null, syncError: "sync_error" });
	});
	test("a slice that dies after renew blocked its account keeps the reconnect error", async () => {
		const f = await gmail_test_fixture();
		stub_slice(async () => {
			const grant = (await f.t.run(ctx => ctx.db.get(f.grantId)))!;
			await f.t.run(ctx => ctx.db.patch(f.grantId, { interactiveExpiresAt: Date.now() - 1 }));
			await f.t.mutation(internal.gmail_grants.renew, { grantId: f.grantId, lifecycleRequestId: grant.lifecycleRequestId });
			throw new Error("Slice stopped before completion");
		});
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		vi.advanceTimersByTime(0); await f.t.finishInProgressScheduledFunctions();
		vi.advanceTimersByTime(60_000); await f.t.finishInProgressScheduledFunctions();
		expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null,
			syncStatus: "blocked", syncError: "press_reconnect_needed", temporaryFailures: 0, nextSyncAt: null });
	});
});

describe("retry_failed and failures", () => {
	test("retains frozen receipts, resets finite checks, and keeps holds through source revocation", async () => {
		const { t, actor, accountId, ledgerId } = await gmail_test_fixture();
		const before = (await t.run(ctx => ctx.db.get(ledgerId)))!;
		await t.run(ctx => ctx.db.patch(ledgerId, { status: "given_up", error: "settlement_unconfirmed", attempts: 5,
			settlementNeeded: false, attachments: before.attachments.map(task => ({ ...task, state: "unconfirmed" as const, sourceUnavailablePendingChecks: 5, deliveries: 5 })) }));
		await t.run(ctx => ctx.db.patch(accountId, { sourceError: "google_revoked", nextSyncAt: null, ledgerCounts: { pending: 0, done: 0, skipped: 0, failed: 0, given_up: 1, emailAssumed: 0, permissionHeld: 1 } }));
		expect(await t.mutation(internal.gmail_accounts.retry_failed, { ...actor, accountId, expectedGeneration: 1 })).toEqual({ _yay: { count: 1, more: false } });
		expect(await t.run(ctx => ctx.db.get(ledgerId))).toMatchObject({ status: "failed", attempts: 0, settlementNeeded: true, permissionHeld: true,
			error: "file_access", nextAttemptAt: Date.now() + 3600_000, attachments: [{ request: before.attachments[0].request, accepted: true, state: "pending", deliveries: 0, sourceUnavailablePendingChecks: 0 }] });
		expect(await t.run(ctx => ctx.db.get(accountId))).toMatchObject({ sourceError: "google_revoked", nextSyncAt: Date.now() + 3600_000, ledgerCounts: { permissionHeld: 1, given_up: 0, failed: 1 } });
	});
	test("uses batches of 25, and each continuation checks generation", async () => {
		const { t, actor, accountId, ledgerId } = await gmail_test_fixture(); const row = (await t.run(ctx => ctx.db.get(ledgerId)))!;
		await t.run(async ctx => {
			await ctx.db.delete(ledgerId);
			const { _id, _creationTime, ...fields } = row;
			for (let i = 0; i < 30; i++) await ctx.db.insert("messages_ledger", { ...fields, gmailMessageId: i.toString(16), status: "given_up", permissionHeld: false, fileAccessOperation: null, error: "source_too_large" });
			await ctx.db.patch(accountId, { ledgerCounts: { pending: 0, done: 0, skipped: 0, failed: 0, given_up: 30, emailAssumed: 0, permissionHeld: 0 } });
		});
		const input = { ...actor, accountId, expectedGeneration: 1 };
		expect(await t.mutation(internal.gmail_accounts.retry_failed, input)).toEqual({ _yay: { count: 25, more: true } });
		await t.run(ctx => ctx.db.patch(accountId, { connectionGeneration: 2 }));
		expect(await t.mutation(internal.gmail_accounts.retry_failed, input)).toMatchObject({ _nay: { code: "connection_changed" } });
		expect(await t.mutation(internal.gmail_accounts.retry_failed, { ...input, expectedGeneration: 2 })).toEqual({ _yay: { count: 5, more: false } });
	});
	test("failure lists expose only ids and fixed codes", async () => {
		const { t, actor, accountId, ledgerId } = await gmail_test_fixture();
		await t.run(ctx => ctx.db.patch(ledgerId, { status: "given_up", error: "private vendor error" }));
		expect(await t.query(internal.gmail_accounts.failures, { ...actor, accountId, paginationOpts: { numItems: 25, cursor: null } })).toEqual({ _yay: { items: [{ gmailMessageId: "ab", reasonCode: "message_failed" }], cursor: null } });
		expect(await t.query(internal.gmail_accounts.failures, { ...actor, workspaceId: "other", accountId, paginationOpts: { numItems: 25, cursor: null } })).toMatchObject({ _nay: { code: "account_not_found" } });
	});
});
