/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import workpoolTest from "@convex-dev/workpool/test";
import schema from "../convex/schema";
import { gmail_encrypt, gmail_google_token_purpose, gmail_random_secret } from "../convex/gmail_secrets";

const modules = import.meta.glob("../convex/**/*.ts");
export const gmail_test_actor = { organizationId: "org", workspaceId: "workspace", installationId: "installation", actorUserId: "actor" };

export function gmail_test_attachment() {
	return { partId: "1", displayName: "private invoice.pdf", initialPath: "/emails/ray-example.com/2026/10/message-attachments/invoice.pdf",
		filename: "invoice.pdf", contentType: "application/pdf", size: 4, suffix: 0,
		request: { installationId: "installation", idempotencyKey: "account:ab", targetKey: "ab:att-0", path: "/emails/ray-example.com/2026/10/message-attachments/invoice.pdf",
			contentType: "application/pdf", size: 4, readOnly: false as const, nonCollaborative: false as const },
		state: "pending" as const, accepted: true, uploadAttemptedAt: Date.now() - 180_000, deliveries: 2,
		sourceUnavailablePendingChecks: 3, nextAttemptAt: Date.now(), nodeId: "file-node", livePath: null, reason: null };
}

export async function gmail_test_fixture() {
	const t = convexTest(schema, modules);
	workpoolTest.register(t, "gmail_sync_workpool");
	const seeded = await t.run(async ctx => {
		const accountId = await ctx.db.insert("gmail_accounts", {
			hostOrganizationId: "org", hostWorkspaceId: "workspace", hostInstallationId: "installation", hostActorUserId: "actor",
			provider: "gmail", emailAddress: "ray@example.com", destinationPath: "/emails/ray-example.com",
			googleRefreshToken: await gmail_encrypt("refresh", gmail_google_token_purpose("org", "workspace", "ray@example.com")),
			connectionGeneration: 1, connectRequestId: null, hostGrantId: null,
			historyId: "10", syncStatus: "live", syncError: null, sourceError: null, backfillPageToken: "backfill-page",
			backfillPage: { ids: ["ab"], nextPageToken: "next", index: 0 }, backfillComplete: true, historyPageToken: "history-page", historyAnchor: null, historyPageSize: 25,
			nextSyncAt: Date.now(), permissionProbeNotBefore: Date.now() + 3600_000, temporaryFailures: 0,
			nextSliceKind: "retry", messagesSynced: 1, messagesSkipped: 0,
			ledgerCounts: { pending: 0, done: 0, skipped: 0, failed: 1, given_up: 0, emailAssumed: 0, permissionHeld: 1 },
			attachmentsSkippedReason: null, syncWorkId: null, syncRequestId: null, lastSyncedAt: Date.now() - 60_000, updatedAt: Date.now(),
		});
		const grantId = await ctx.db.insert("host_grants", { ...gmail_test_actor, accountId, attemptId: null,
			connectionGeneration: 1, repairClientRequestId: null, phase: "ready", sourceSecret: null, interactiveSecret: null,
			interactiveExpiresAt: Date.now() + 24 * 3600_000, sealedSecret: null, sealedExpiresAt: Date.now() + 6 * 24 * 3600_000,
			destinationPath: "/emails/ray-example.com", lifecycleRequestId: gmail_random_secret(), nextAttemptAt: Date.now() + 12 * 3600_000,
			temporaryFailures: 0, error: null, updatedAt: Date.now() });
		await ctx.db.patch(grantId, { interactiveSecret: await gmail_encrypt(`psg_${"2".repeat(64)}`, `grant:${grantId}:interactive`),
			sealedSecret: await gmail_encrypt(`psg_${"3".repeat(64)}`, `grant:${grantId}:sealed`) });
		await ctx.db.patch(accountId, { hostGrantId: grantId });
		const ledgerId = await ctx.db.insert("messages_ledger", { accountId, gmailMessageId: "ab", gmailThreadId: "cd", internalDate: Date.now(),
			status: "failed", skipReason: null, filePath: "/emails/ray-example.com/private-subject.md", emailWritten: true, emailAssumed: false, fileNodeId: "email-node",
			attachments: [gmail_test_attachment()], attachmentsNotSaved: 0, attempts: 0, nextAttemptAt: Date.now() + 3600_000,
			settlementNeeded: true, permissionHeld: true, fileAccessOperation: { kind: "attachment", index: 0, operation: "finalize" },
			error: "file_access", deletedAt: null, updatedAt: Date.now() });
		return { accountId, grantId, ledgerId };
	});
	return { t, ...seeded, actor: gmail_test_actor };
}
