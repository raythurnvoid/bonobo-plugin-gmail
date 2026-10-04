import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const nullableString = v.union(v.string(), v.null());
const nullableNumber = v.union(v.number(), v.null());
export const gmail_host_binding = {
	organizationId: v.string(), workspaceId: v.string(), installationId: v.string(), actorUserId: v.string(),
};
export const gmail_history_event = v.object({
	historyId: v.string(), gmailMessageId: v.string(),
	kind: v.union(v.literal("added"), v.literal("rescue_spam"), v.literal("rescue_trash"), v.literal("deleted")),
});
export const gmail_attachment_task = v.object({
	partId: v.string(), displayName: v.string(), initialPath: v.string(), filename: v.string(), contentType: v.string(),
	size: v.number(), suffix: v.number(),
	request: v.union(v.object({
		installationId: v.string(), idempotencyKey: v.string(), targetKey: v.string(), path: v.string(), contentType: v.string(),
		size: v.number(), readOnly: v.literal(false), nonCollaborative: v.literal(false),
	}), v.null()),
	state: v.union(v.literal("unstarted"), v.literal("uncertain"), v.literal("pending"), v.literal("saved"), v.literal("not_saved"), v.literal("unconfirmed")),
	accepted: v.boolean(), uploadAttemptedAt: nullableNumber, deliveries: v.number(), sourceUnavailablePendingChecks: v.number(),
	nextAttemptAt: nullableNumber, nodeId: nullableString, livePath: nullableString, reason: nullableString,
});
export const gmail_file_access_operation = v.union(
	v.object({ kind: v.literal("email_write") }),
	v.object({ kind: v.literal("attachment"), index: v.number(), operation: v.union(v.literal("create"), v.literal("finalize")) }),
);
export const gmail_ledger_status = v.union(v.literal("pending"), v.literal("done"), v.literal("skipped"), v.literal("failed"), v.literal("given_up"));
export const gmail_ledger_counts = v.object({
	pending: v.number(), done: v.number(), skipped: v.number(), failed: v.number(), given_up: v.number(), emailAssumed: v.number(), permissionHeld: v.number(),
});
export const gmail_account_sync_status = v.union(v.literal("backfilling"), v.literal("live"), v.literal("blocked"), v.literal("error"), v.literal("disconnected"));
export const gmail_source_error = v.union(v.literal("google_revoked"), v.literal("gmail_request"), v.literal("history_response_too_large"), v.null());
export const gmail_grant_phase = v.union(
	v.literal("exchange"), v.literal("renew"), v.literal("seal"), v.literal("ready"),
	v.literal("awaiting_finish"), v.literal("blocked"), v.literal("cancelled"),
);
export const gmail_oauth_status = v.union(
	v.literal("preparing"), v.literal("pending"), v.literal("exchanging"), v.literal("awaiting_finish"),
	v.literal("finished"), v.literal("failed"), v.literal("cancelled"),
);

export default defineSchema({
	gmail_accounts: defineTable({
		hostOrganizationId: v.string(), hostWorkspaceId: v.string(), hostInstallationId: v.string(), hostActorUserId: v.string(),
		provider: v.literal("gmail"), emailAddress: v.string(), destinationPath: v.string(), googleRefreshToken: nullableString,
		connectionGeneration: v.number(), connectRequestId: v.union(v.id("oauth_states"), v.null()), hostGrantId: v.union(v.id("host_grants"), v.null()),
		historyId: nullableString, syncStatus: gmail_account_sync_status, syncError: nullableString, sourceError: gmail_source_error,
		backfillPageToken: nullableString,
		backfillPage: v.union(v.object({ ids: v.array(v.string()), nextPageToken: nullableString, index: v.number() }), v.null()),
		backfillComplete: v.boolean(), historyPageToken: nullableString, historyAnchor: v.union(gmail_history_event, v.null()), historyPageSize: v.number(),
		nextSyncAt: nullableNumber, permissionProbeNotBefore: nullableNumber, temporaryFailures: v.number(),
		nextSliceKind: v.union(v.literal("backfill"), v.literal("history"), v.literal("retry")),
		messagesSynced: v.number(), messagesSkipped: v.number(), ledgerCounts: gmail_ledger_counts,
		attachmentsSkippedReason: v.union(v.literal("plan"), v.literal("storage"), v.null()),
		syncWorkId: nullableString, syncRequestId: nullableString, lastSyncedAt: nullableNumber, updatedAt: v.number(),
	})
		.index("by_hostWorkspace_emailAddress", ["hostWorkspaceId", "emailAddress"])
		.index("by_hostWorkspace_destinationPath", ["hostWorkspaceId", "destinationPath"])
		.index("by_hostInstallation", ["hostInstallationId"])
		.index("by_syncStatus", ["syncStatus"])
		.index("by_syncWorkId_nextSyncAt", ["syncWorkId", "nextSyncAt"]),
	host_grants: defineTable({
		...gmail_host_binding,
		accountId: v.union(v.id("gmail_accounts"), v.null()), attemptId: v.union(v.id("oauth_states"), v.null()),
		connectionGeneration: v.number(), repairClientRequestId: nullableString,
		phase: gmail_grant_phase, sourceSecret: nullableString, interactiveSecret: nullableString,
		interactiveExpiresAt: nullableNumber, sealedSecret: nullableString, sealedExpiresAt: nullableNumber,
		destinationPath: nullableString, lifecycleRequestId: v.string(), nextAttemptAt: nullableNumber,
		temporaryFailures: v.number(), error: nullableString, updatedAt: v.number(),
	})
		.index("by_account", ["accountId"])
		.index("by_attempt", ["attemptId"])
		.index("by_phase_nextAttemptAt", ["phase", "nextAttemptAt"])
		.index("by_actorUser_installation_repairClientRequestId", ["actorUserId", "installationId", "repairClientRequestId"]),
	oauth_states: defineTable({
		...gmail_host_binding, clientRequestId: v.string(),
		accountId: v.union(v.id("gmail_accounts"), v.null()), expectedGeneration: nullableNumber,
		grantId: v.union(v.id("host_grants"), v.null()), status: gmail_oauth_status,
		stateHash: nullableString, encryptedState: nullableString, googleCodeHash: nullableString,
		stagedRefreshToken: nullableString, stagedEmailAddress: nullableString, stagedHistoryId: nullableString,
		finishCodeHash: nullableString, encryptedFinishCode: nullableString,
		completedAccountId: v.union(v.id("gmail_accounts"), v.null()), completedGeneration: nullableNumber,
		expiresAt: v.number(), processingDeadline: nullableNumber, receiptExpiresAt: nullableNumber,
		error: nullableString, updatedAt: v.number(),
	})
		.index("by_stateHash", ["stateHash"])
		.index("by_actorUser_installation_clientRequestId", ["actorUserId", "installationId", "clientRequestId"])
		.index("by_actorUser_installation_status", ["actorUserId", "installationId", "status"])
		.index("by_status_processingDeadline", ["status", "processingDeadline"])
		.index("by_expiresAt", ["expiresAt"]),
	page_tokens: defineTable({
		tokenHash: v.string(), exchangeRequestId: v.string(), sourceSecret: nullableString, grantSecret: nullableString,
		organizationId: nullableString, workspaceId: nullableString, installationId: nullableString, actorUserId: nullableString,
		expiresAt: v.number(), exchangeStartedAt: v.number(), verifiedAt: nullableNumber,
		canRead: v.boolean(), canWrite: v.boolean(),
	})
		.index("by_tokenHash", ["tokenHash"])
		.index("by_expiresAt", ["expiresAt"]),
	request_limits: defineTable({ key: v.string(), window: v.number(), count: v.number(), expiresAt: v.number() })
		.index("by_key_window", ["key", "window"])
		.index("by_expiresAt", ["expiresAt"]),
	press_route_pacing: defineTable({ installationId: v.string(), route: v.string(), lastCallAt: v.number() })
		.index("by_installation_route", ["installationId", "route"]),
	messages_ledger: defineTable({
		accountId: v.id("gmail_accounts"), gmailMessageId: v.string(), gmailThreadId: nullableString, internalDate: nullableNumber,
		status: gmail_ledger_status, skipReason: v.union(v.literal("spam"), v.literal("trash"), v.literal("draft"), v.literal("deleted_before_fetch"), v.null()),
		filePath: nullableString, emailWritten: v.boolean(), emailAssumed: v.boolean(), fileNodeId: nullableString,
		attachments: v.array(gmail_attachment_task), attachmentsNotSaved: v.number(), attempts: v.number(), nextAttemptAt: nullableNumber,
		settlementNeeded: v.boolean(), permissionHeld: v.boolean(), fileAccessOperation: v.union(gmail_file_access_operation, v.null()),
		error: nullableString, deletedAt: nullableNumber, updatedAt: v.number(),
	})
		.index("by_account_gmailMessageId", ["accountId", "gmailMessageId"])
		.index("by_account_status_nextAttemptAt", ["accountId", "status", "nextAttemptAt"])
		.index("by_account_permissionHeld_status_nextAttemptAt", ["accountId", "permissionHeld", "status", "nextAttemptAt"])
		.index("by_account_permissionHeld_settlementNeeded_nextAttemptAt", ["accountId", "permissionHeld", "settlementNeeded", "nextAttemptAt"]),
});
