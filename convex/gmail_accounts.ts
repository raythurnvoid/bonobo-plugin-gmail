import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { WorkId } from "@convex-dev/workpool";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, internalQuery, type ActionCtx, type MutationCtx, type QueryCtx } from "./_generated/server";
import { gmail_account_sync_status, gmail_host_binding, gmail_ledger_counts, gmail_oauth_status, gmail_source_error } from "./schema";
import { gmail_close_attempt } from "./gmail_oauth";
import { gmail_encrypt, gmail_random_secret } from "./gmail_secrets";
import { gmail_PageError, gmail_rate_limit } from "./gmail_page";
import { gmail_grant_step } from "./gmail_grants";
import { gmail_workpool } from "./gmail_workpool";

const failure = v.object({ _nay: v.object({ status: v.number(), code: v.string() }) });
const change_args = { ...gmail_host_binding, accountId: v.string(), expectedGeneration: v.number() };
function refused(status: number, code: string) { return { _nay: { status, code } }; }

async function workspace_account(ctx: QueryCtx | MutationCtx, args: { accountId: string; organizationId: string; workspaceId: string }) {
	const id = ctx.db.normalizeId("gmail_accounts", args.accountId);
	const account = id ? await ctx.db.get(id) : null;
	return account && account.hostOrganizationId === args.organizationId && account.hostWorkspaceId === args.workspaceId ? account : null;
}

async function disconnect_account(ctx: MutationCtx, account: Doc<"gmail_accounts">) {
	if (account.connectRequestId) {
		const attempt = await ctx.db.get(account.connectRequestId);
		if (attempt) await gmail_close_attempt(ctx, attempt, "cancelled", "disconnected");
	}
	if (account.syncWorkId) await gmail_workpool.cancel(ctx, account.syncWorkId as WorkId);
	if (account.hostGrantId) {
		const grant = await ctx.db.get(account.hostGrantId);
		if (grant) await ctx.db.patch(grant._id, { phase: "cancelled", sourceSecret: null, interactiveSecret: null, sealedSecret: null, nextAttemptAt: null, updatedAt: Date.now() });
	}
	await ctx.db.patch(account._id, { connectionGeneration: account.connectionGeneration + 1, googleRefreshToken: null,
		hostGrantId: null, connectRequestId: null, syncStatus: "disconnected", syncError: null,
		nextSyncAt: null, syncWorkId: null, syncRequestId: null, updatedAt: Date.now() });
}

const public_account = v.object({
	accountId: v.string(), emailAddress: v.string(), destinationPath: v.string(), connectionGeneration: v.number(),
	syncStatus: gmail_account_sync_status, syncError: v.union(v.string(), v.null()), sourceError: gmail_source_error,
	pressReady: v.boolean(), canRepair: v.boolean(), needsReconnect: v.boolean(),
	backfillComplete: v.boolean(), messagesSynced: v.number(), messagesSkipped: v.number(), ledgerCounts: gmail_ledger_counts,
	attachmentsSkippedReason: v.union(v.literal("plan"), v.literal("storage"), v.null()),
	nextSyncAt: v.union(v.number(), v.null()), nextPermissionRetryAt: v.union(v.number(), v.null()), lastSyncedAt: v.union(v.number(), v.null()),
});

export const status = internalQuery({
	args: { ...gmail_host_binding, canWrite: v.boolean(), paginationOpts: paginationOptsValidator },
	returns: v.object({
		binding: v.object(gmail_host_binding), canWrite: v.boolean(), accounts: v.array(public_account), cursor: v.union(v.string(), v.null()),
		attempt: v.union(v.object({ attemptId: v.string(), status: gmail_oauth_status, expiresAt: v.number(), clientRequestId: v.string(), accountId: v.union(v.string(), v.null()) }), v.null()),
	}),
	handler: async (ctx, args) => {
		const page = await ctx.db.query("gmail_accounts").withIndex("by_hostWorkspace_emailAddress", q => q.eq("hostWorkspaceId", args.workspaceId)).paginate(args.paginationOpts);
		const accounts = [];
		for (const account of page.page) {
			if (account.hostOrganizationId !== args.organizationId) continue;
			const grant = account.hostGrantId ? await ctx.db.get(account.hostGrantId) : null;
			const pressReady = grant?.phase === "ready" && grant.connectionGeneration === account.connectionGeneration && grant.accountId === account._id;
			let nextPermissionRetryAt: number | null = null;
			if (pressReady && account.syncStatus !== "disconnected" && account.ledgerCounts.permissionHeld > 0) {
				const due = account.sourceError ? [await ctx.db.query("messages_ledger")
					.withIndex("by_account_permissionHeld_settlementNeeded_nextAttemptAt", q => q.eq("accountId", account._id).eq("permissionHeld", true).eq("settlementNeeded", true).gt("nextAttemptAt", null)).first()]
					: await Promise.all((["pending", "failed"] as const).map(status => ctx.db.query("messages_ledger")
						.withIndex("by_account_permissionHeld_status_nextAttemptAt", q => q.eq("accountId", account._id).eq("permissionHeld", true).eq("status", status).gt("nextAttemptAt", null)).first()));
				const times = due.flatMap(row => row?.nextAttemptAt !== null && row?.nextAttemptAt !== undefined ? [Math.max(row.nextAttemptAt, account.permissionProbeNotBefore ?? 0)] : []);
				nextPermissionRetryAt = times.length ? Math.min(...times) : null;
			}
			const knownErrors = ["google_revoked", "gmail_request", "history_response_too_large", "press_reconnect_needed", "actor_lost", "credits", "press_temporary", "gmail_temporary", "sync_error"];
			accounts.push({ accountId: account._id, emailAddress: account.emailAddress, destinationPath: account.destinationPath,
				connectionGeneration: account.connectionGeneration, syncStatus: account.syncStatus,
				syncError: account.syncError === null ? null : knownErrors.includes(account.syncError) ? account.syncError : "sync_error", sourceError: account.sourceError,
				pressReady, canRepair: args.canWrite && account.hostActorUserId === args.actorUserId && account.hostInstallationId === args.installationId
					&& account.syncError === "press_reconnect_needed",
				needsReconnect: account.hostInstallationId !== args.installationId || account.hostActorUserId !== args.actorUserId
					|| account.sourceError === "google_revoked" || account.syncError === "actor_lost",
				backfillComplete: account.backfillComplete, messagesSynced: account.messagesSynced, messagesSkipped: account.messagesSkipped, ledgerCounts: account.ledgerCounts,
				attachmentsSkippedReason: account.attachmentsSkippedReason, nextSyncAt: account.nextSyncAt, nextPermissionRetryAt, lastSyncedAt: account.lastSyncedAt,
			});
		}
		let pending = null;
		for (const status of ["preparing", "pending", "exchanging", "awaiting_finish"] as const) {
			const attempt = await ctx.db.query("oauth_states").withIndex("by_actorUser_installation_status", q => q.eq("actorUserId", args.actorUserId).eq("installationId", args.installationId).eq("status", status)).first();
			if (attempt && attempt.organizationId === args.organizationId && attempt.workspaceId === args.workspaceId && attempt.expiresAt > Date.now()) {
				pending = { attemptId: attempt._id, status: attempt.status, expiresAt: attempt.expiresAt, clientRequestId: attempt.clientRequestId, accountId: attempt.accountId };
				break;
			}
		}
		return { binding: { organizationId: args.organizationId, workspaceId: args.workspaceId, installationId: args.installationId, actorUserId: args.actorUserId },
			canWrite: args.canWrite, accounts, cursor: page.isDone ? null : page.continueCursor, attempt: pending };
	},
});

export const disconnect = internalMutation({
	args: change_args, returns: v.union(failure, v.object({ _yay: v.object({ accountId: v.string(), connectionGeneration: v.number() }) })),
	handler: async (ctx, args) => {
		const account = await workspace_account(ctx, args);
		if (!account) return refused(404, "account_not_found");
		if (account.connectionGeneration !== args.expectedGeneration) return refused(409, "connection_changed");
		await disconnect_account(ctx, account);
		return { _yay: { accountId: account._id, connectionGeneration: account.connectionGeneration + 1 } };
	},
});

export const operator_account_summary = internalQuery({
	args: { accountId: v.id("gmail_accounts") },
	returns: v.union(v.object({ accountId: v.id("gmail_accounts"), connectionGeneration: v.number(), emailAddress: v.string(),
		hostOrganizationId: v.string(), hostWorkspaceId: v.string(), hostInstallationId: v.string(), hostActorUserId: v.string(),
		destinationPath: v.string(), syncStatus: gmail_account_sync_status }), v.null()),
	handler: async (ctx, args) => {
		const account = await ctx.db.get(args.accountId);
		if (!account) return null;
		return { accountId: account._id, connectionGeneration: account.connectionGeneration, emailAddress: account.emailAddress,
			hostOrganizationId: account.hostOrganizationId, hostWorkspaceId: account.hostWorkspaceId,
			hostInstallationId: account.hostInstallationId, hostActorUserId: account.hostActorUserId,
			destinationPath: account.destinationPath, syncStatus: account.syncStatus };
	},
});

export const operator_disconnect = internalMutation({
	args: { accountId: v.id("gmail_accounts"), expectedGeneration: v.number() },
	returns: v.union(failure, v.object({ _yay: v.object({ accountId: v.id("gmail_accounts"), connectionGeneration: v.number(),
		localSecretsCleared: v.boolean(), pendingWorkStopped: v.boolean(), ledgerCountsKept: v.boolean() }) })),
	handler: async (ctx, args) => {
		const account = await ctx.db.get(args.accountId);
		if (!account) return refused(404, "account_not_found");
		if (account.connectionGeneration !== args.expectedGeneration) return refused(409, "connection_changed");
		await disconnect_account(ctx, account);
		const after = (await ctx.db.get(account._id))!;
		const grant = account.hostGrantId ? await ctx.db.get(account.hostGrantId) : null;
		return { _yay: { accountId: account._id, connectionGeneration: after.connectionGeneration,
			localSecretsCleared: after.googleRefreshToken === null && after.hostGrantId === null
				&& (!grant || (grant.sourceSecret === null && grant.interactiveSecret === null && grant.sealedSecret === null)),
			pendingWorkStopped: after.syncWorkId === null && after.syncRequestId === null && after.connectRequestId === null && after.nextSyncAt === null,
			ledgerCountsKept: JSON.stringify(after.ledgerCounts) === JSON.stringify(account.ledgerCounts) } };
	},
});

export const prepare_repair = internalMutation({
	args: { ...change_args, clientRequestId: v.string(), pageToken: v.string() },
	returns: v.union(failure, v.object({ _yay: v.object({ grantId: v.id("host_grants"), clientRequestId: v.string() }) })),
	handler: async (ctx, args) => {
		const account = await workspace_account(ctx, args);
		if (!account) return refused(404, "account_not_found");
		if (account.connectionGeneration !== args.expectedGeneration) return refused(409, "connection_changed");
		if (account.hostInstallationId !== args.installationId || account.hostActorUserId !== args.actorUserId) return refused(409, "google_reconnect_needed");
		if (account.syncStatus === "disconnected") return refused(409, "account_disconnected");
		const prior = await ctx.db.query("host_grants").withIndex("by_actorUser_installation_repairClientRequestId", q =>
			q.eq("actorUserId", args.actorUserId).eq("installationId", args.installationId).eq("repairClientRequestId", args.clientRequestId)).unique();
		if (prior) {
			if (prior.accountId !== account._id || prior.connectionGeneration !== account.connectionGeneration || account.hostGrantId !== prior._id || prior.phase === "cancelled") return refused(409, "connection_changed");
			return { _yay: { grantId: prior._id, clientRequestId: args.clientRequestId } };
		}
		const old = account.hostGrantId ? await ctx.db.get(account.hostGrantId) : null;
		if (old?.repairClientRequestId && ["exchange", "renew", "seal"].includes(old.phase)) return { _yay: { grantId: old._id, clientRequestId: old.repairClientRequestId } };
		if (account.syncError !== "press_reconnect_needed") return refused(409, "repair_not_needed");
		if (!await gmail_rate_limit(ctx, `repair:${args.actorUserId}:${args.installationId}`, 60 * 60_000, 10)) return refused(429, "rate_limited");
		if (account.syncWorkId) await gmail_workpool.cancel(ctx, account.syncWorkId as WorkId);
		if (old) await ctx.db.patch(old._id, { phase: "cancelled", sourceSecret: null, interactiveSecret: null, sealedSecret: null, nextAttemptAt: null });
		const grantId = await ctx.db.insert("host_grants", { organizationId: args.organizationId, workspaceId: args.workspaceId,
			installationId: args.installationId, actorUserId: args.actorUserId, accountId: account._id, attemptId: null,
			connectionGeneration: account.connectionGeneration, repairClientRequestId: args.clientRequestId, phase: "exchange", sourceSecret: null,
			interactiveSecret: null, interactiveExpiresAt: null, sealedSecret: null, sealedExpiresAt: null, destinationPath: account.destinationPath,
			lifecycleRequestId: gmail_random_secret(), nextAttemptAt: Date.now(), temporaryFailures: 0, error: null, updatedAt: Date.now() });
		await ctx.db.patch(grantId, { sourceSecret: await gmail_encrypt(args.pageToken, `grant:${grantId}:source`) });
		// Replaced slices must not keep the new chain waiting on an old work marker.
		await ctx.db.patch(account._id, { hostGrantId: grantId, nextSyncAt: null, syncWorkId: null, syncRequestId: null, syncStatus: "blocked", updatedAt: Date.now() });
		return { _yay: { grantId, clientRequestId: args.clientRequestId } };
	},
});

export async function gmail_repair(ctx: ActionCtx, actor: { organizationId: string; workspaceId: string; installationId: string; actorUserId: string },
	body: { accountId: string; expectedGeneration: number; clientRequestId: string }, pageToken: string) {
	const prepared = await ctx.runMutation(internal.gmail_accounts.prepare_repair, { ...actor, ...body, pageToken });
	if ("_nay" in prepared) throw new gmail_PageError(prepared._nay.status, prepared._nay.code);
	await gmail_grant_step(ctx, prepared._yay.grantId);
	const grant: Doc<"host_grants"> | null = await ctx.runQuery(internal.gmail_grants.get_current, { grantId: prepared._yay.grantId });
	if (!grant) throw new gmail_PageError(409, "connection_changed");
	return { phase: grant.phase, clientRequestId: prepared._yay.clientRequestId,
		...(grant.phase === "blocked" ? { code: grant.error === "actor_lost" ? "actor_lost" : "press_reconnect_needed" } : {}) };
}

export const retry_sync = internalMutation({
	args: change_args, returns: v.union(failure, v.object({ _yay: v.null() })),
	handler: async (ctx, args) => {
		const account = await workspace_account(ctx, args);
		if (!account) return refused(404, "account_not_found");
		if (account.connectionGeneration !== args.expectedGeneration) return refused(409, "connection_changed");
		if (account.syncStatus === "disconnected" || !["gmail_request", "history_response_too_large"].includes(account.sourceError ?? "")) return refused(409, "retry_not_available");
		if (!await gmail_rate_limit(ctx, `retry-sync:${args.actorUserId}:${args.installationId}`, 60 * 60_000, 10)) return refused(429, "rate_limited");
		const grant = account.hostGrantId ? await ctx.db.get(account.hostGrantId) : null;
		const ready = grant?.phase === "ready" && grant.connectionGeneration === account.connectionGeneration;
		await ctx.db.patch(account._id, { sourceError: null, syncError: ready ? null : account.syncError,
			syncStatus: ready ? account.backfillComplete ? "live" : "backfilling" : account.syncStatus,
			nextSyncAt: ready ? Date.now() : null, updatedAt: Date.now() });
		return { _yay: null };
	},
});

export const retry_failed = internalMutation({
	args: change_args, returns: v.union(failure, v.object({ _yay: v.object({ count: v.number(), more: v.boolean() }) })),
	handler: async (ctx, args) => {
		const account = await workspace_account(ctx, args);
		if (!account) return refused(404, "account_not_found");
		if (account.connectionGeneration !== args.expectedGeneration) return refused(409, "connection_changed");
		if (account.syncStatus === "disconnected") return refused(409, "account_disconnected");
		const rows = await ctx.db.query("messages_ledger").withIndex("by_account_status_nextAttemptAt", q => q.eq("accountId", account._id).eq("status", "given_up")).take(25);
		let held = 0;
		let nextDue: number | null = null;
		for (const row of rows) {
			const attachments = row.attachments.map(task => ["saved", "not_saved"].includes(task.state) ? task : { ...task,
				state: task.accepted ? "pending" as const : task.request ? "uncertain" as const : "unstarted" as const,
				deliveries: 0, sourceUnavailablePendingChecks: 0, nextAttemptAt: Date.now(), reason: null });
			const settlementNeeded = attachments.some(task => task.request !== null && !["saved", "not_saved"].includes(task.state));
			const due = Math.max(Date.now(), row.permissionHeld ? account.permissionProbeNotBefore ?? 0 : 0);
			if (!account.sourceError || settlementNeeded) nextDue = Math.min(nextDue ?? due, due);
			if (row.permissionHeld) held++;
			await ctx.db.patch(row._id, { status: row.permissionHeld ? "failed" : "pending", attempts: 0,
				error: row.permissionHeld ? "file_access" : null, attachments, settlementNeeded,
				nextAttemptAt: due, updatedAt: Date.now() });
		}
		const grant = account.hostGrantId ? await ctx.db.get(account.hostGrantId) : null;
		const ready = grant?.phase === "ready" && grant.connectionGeneration === account.connectionGeneration;
		await ctx.db.patch(account._id, { ledgerCounts: { ...account.ledgerCounts, given_up: account.ledgerCounts.given_up - rows.length,
			pending: account.ledgerCounts.pending + rows.length - held, failed: account.ledgerCounts.failed + held },
			nextSyncAt: ready && nextDue !== null ? Math.min(account.nextSyncAt ?? nextDue, nextDue) : account.nextSyncAt, updatedAt: Date.now() });
		const more = !!await ctx.db.query("messages_ledger").withIndex("by_account_status_nextAttemptAt", q => q.eq("accountId", account._id).eq("status", "given_up")).first();
		return { _yay: { count: rows.length, more } };
	},
});

export const failures = internalQuery({
	args: { ...gmail_host_binding, accountId: v.string(), paginationOpts: paginationOptsValidator },
	returns: v.union(failure, v.object({ _yay: v.object({ items: v.array(v.object({ gmailMessageId: v.string(), reasonCode: v.string() })), cursor: v.union(v.string(), v.null()) }) })),
	handler: async (ctx, args) => {
		const account = await workspace_account(ctx, args);
		if (!account) return refused(404, "account_not_found");
		const page = await ctx.db.query("messages_ledger").withIndex("by_account_status_nextAttemptAt", q => q.eq("accountId", account._id).eq("status", "given_up")).paginate(args.paginationOpts);
		const known = ["source_too_large", "mime_too_large", "invalid_source", "settlement_unconfirmed", "delivery_failed", "gmail_request", "file_conflict"];
		return { _yay: { items: page.page.map(row => ({ gmailMessageId: row.gmailMessageId, reasonCode: known.includes(row.error ?? "") ? row.error! : "message_failed" })), cursor: page.isDone ? null : page.continueCursor } };
	},
});
