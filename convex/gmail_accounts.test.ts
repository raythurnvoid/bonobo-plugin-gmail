import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { internal } from "./_generated/api";
import { gmail_test_fixture } from "../scripts/gmail-test-fixtures";
import { gmail_random_secret } from "./gmail_secrets";
import { gmail_workpool } from "./gmail_workpool";

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(1_800_000_000_000); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("disconnect", () => {
	test("clears local secrets and work while keeping Files progress and the permission clock", async () => {
		const { t, actor, accountId, grantId, ledgerId } = await gmail_test_fixture();
		const before = (await t.run(ctx => ctx.db.get(accountId)))!;
		const ledger = await t.run(ctx => ctx.db.get(ledgerId));
		const workId = await t.run(ctx => gmail_workpool.enqueueAction(ctx, internal.gmail_grants.connect, { grantId }, { runAt: Date.now() + 3600_000 }));
		await t.run(ctx => ctx.db.patch(accountId, { syncWorkId: workId, syncRequestId: "old-request" }));
		expect(await t.mutation(internal.gmail_accounts.disconnect, { ...actor, accountId, expectedGeneration: 1 })).toEqual({ _yay: { accountId, connectionGeneration: 2 } });
		const after = await t.run(ctx => ctx.db.get(accountId));
		expect(after).toMatchObject({ syncStatus: "disconnected", googleRefreshToken: null, hostGrantId: null, syncWorkId: null,
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
