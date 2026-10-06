import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { doc } from "convex-helpers/validators";
import { vOnCompleteArgs, type WorkId } from "@convex-dev/workpool";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation, internalQuery, type ActionCtx, type MutationCtx, type QueryCtx } from "./_generated/server";
import schema, {
	gmail_account_sync_status,
	gmail_host_binding,
	gmail_history_event,
	gmail_ledger_counts,
	gmail_oauth_status,
	gmail_permission_claim,
	gmail_source_error,
	gmail_worker_context,
} from "./schema";
import { gmail_close_attempt } from "./gmail_oauth";
import { gmail_encrypt, gmail_random_secret } from "./gmail_secrets";
import { gmail_PageError, gmail_rate_limit } from "./gmail_page";
import { gmail_grant_step } from "./gmail_grants";
import { gmail_workpool } from "./gmail_workpool";

const failure = v.object({ _nay: v.object({ status: v.number(), code: v.string() }) });
const change_args = { ...gmail_host_binding, accountId: v.string(), expectedGeneration: v.number() };
function refused(status: number, code: string) {
	return { _nay: { status, code } };
}

async function workspace_account(
	ctx: QueryCtx | MutationCtx,
	args: { accountId: string; organizationId: string; workspaceId: string },
) {
	const id = ctx.db.normalizeId("gmail_accounts", args.accountId);
	const account = id ? await ctx.db.get(id) : null;
	return account && account.hostOrganizationId === args.organizationId && account.hostWorkspaceId === args.workspaceId
		? account
		: null;
}

async function disconnect_account(ctx: MutationCtx, account: Doc<"gmail_accounts">) {
	if (account.connectRequestId) {
		const attempt = await ctx.db.get(account.connectRequestId);
		if (attempt) await gmail_close_attempt(ctx, attempt, "cancelled", "disconnected");
	}
	if (account.syncWorkId) await gmail_workpool.cancel(ctx, account.syncWorkId as WorkId);
	if (account.hostGrantId) {
		const grant = await ctx.db.get(account.hostGrantId);
		if (grant)
			await ctx.db.patch(grant._id, {
				phase: "cancelled",
				sourceSecret: null,
				interactiveSecret: null,
				sealedSecret: null,
				nextAttemptAt: null,
				updatedAt: Date.now(),
			});
	}
	await ctx.db.patch(account._id, {
		connectionGeneration: account.connectionGeneration + 1,
		googleRefreshToken: null,
		hostGrantId: null,
		connectRequestId: null,
		syncStatus: "disconnected",
		syncError: null,
		nextSyncAt: null,
		syncWorkId: null,
		syncRequestId: null,
		updatedAt: Date.now(),
	});
}

const public_account = v.object({
	accountId: v.string(),
	emailAddress: v.string(),
	destinationPath: v.string(),
	connectionGeneration: v.number(),
	syncStatus: gmail_account_sync_status,
	syncError: v.union(v.string(), v.null()),
	sourceError: gmail_source_error,
	pressReady: v.boolean(),
	canRepair: v.boolean(),
	needsReconnect: v.boolean(),
	backfillComplete: v.boolean(),
	messagesSynced: v.number(),
	messagesSkipped: v.number(),
	ledgerCounts: gmail_ledger_counts,
	attachmentsSkippedReason: v.union(v.literal("plan"), v.literal("storage"), v.null()),
	nextSyncAt: v.union(v.number(), v.null()),
	nextPermissionRetryAt: v.union(v.number(), v.null()),
	lastSyncedAt: v.union(v.number(), v.null()),
});

export const status = internalQuery({
	args: { ...gmail_host_binding, canWrite: v.boolean(), paginationOpts: paginationOptsValidator },
	returns: v.object({
		binding: v.object(gmail_host_binding),
		canWrite: v.boolean(),
		accounts: v.array(public_account),
		cursor: v.union(v.string(), v.null()),
		attempt: v.union(
			v.object({
				attemptId: v.string(),
				status: gmail_oauth_status,
				expiresAt: v.number(),
				clientRequestId: v.string(),
				accountId: v.union(v.string(), v.null()),
			}),
			v.null(),
		),
	}),
	handler: async (ctx, args) => {
		const page = await ctx.db
			.query("gmail_accounts")
			.withIndex("by_hostOrganization_hostWorkspace_emailAddress", (q) =>
				q.eq("hostOrganizationId", args.organizationId).eq("hostWorkspaceId", args.workspaceId),
			)
			.paginate(args.paginationOpts);
		const accounts = [];
		for (const account of page.page) {
			const grant = account.hostGrantId ? await ctx.db.get(account.hostGrantId) : null;
			const pressReady =
				grant?.phase === "ready" &&
				grant.connectionGeneration === account.connectionGeneration &&
				grant.accountId === account._id;
			let nextPermissionRetryAt: number | null = null;
			if (pressReady && account.syncStatus !== "disconnected" && account.ledgerCounts.permissionHeld > 0) {
				const due = account.sourceError
					? [
							await ctx.db
								.query("messages_ledger")
								.withIndex("by_account_permissionHeld_settlementNeeded_nextAttemptAt", (q) =>
									q
										.eq("accountId", account._id)
										.eq("permissionHeld", true)
										.eq("settlementNeeded", true)
										.gt("nextAttemptAt", null),
								)
								.first(),
						]
					: await Promise.all(
							(["pending", "failed"] as const).map((status) =>
								ctx.db
									.query("messages_ledger")
									.withIndex("by_account_permissionHeld_status_nextAttemptAt", (q) =>
										q
											.eq("accountId", account._id)
											.eq("permissionHeld", true)
											.eq("status", status)
											.gt("nextAttemptAt", null),
									)
									.first(),
							),
						);
				const times = due.flatMap((row) =>
					row?.nextAttemptAt !== null && row?.nextAttemptAt !== undefined
						? [Math.max(row.nextAttemptAt, account.permissionProbeNotBefore ?? 0)]
						: [],
				);
				nextPermissionRetryAt = times.length ? Math.min(...times) : null;
			}
			const knownErrors = [
				"google_revoked",
				"gmail_request",
				"history_response_too_large",
				"press_reconnect_needed",
				"actor_lost",
				"credits",
				"press_temporary",
				"gmail_temporary",
				"sync_error",
			];
			accounts.push({
				accountId: account._id,
				emailAddress: account.emailAddress,
				destinationPath: account.destinationPath,
				connectionGeneration: account.connectionGeneration,
				syncStatus: account.syncStatus,
				syncError:
					account.syncError === null
						? null
						: knownErrors.includes(account.syncError)
							? account.syncError
							: "sync_error",
				sourceError: account.sourceError,
				pressReady,
				canRepair:
					args.canWrite &&
					account.hostActorUserId === args.actorUserId &&
					account.hostInstallationId === args.installationId &&
					account.syncError === "press_reconnect_needed",
				needsReconnect:
					account.hostInstallationId !== args.installationId ||
					account.hostActorUserId !== args.actorUserId ||
					account.sourceError === "google_revoked" ||
					account.syncError === "actor_lost",
				backfillComplete: account.backfillComplete,
				messagesSynced: account.messagesSynced,
				messagesSkipped: account.messagesSkipped,
				ledgerCounts: account.ledgerCounts,
				attachmentsSkippedReason: account.attachmentsSkippedReason,
				nextSyncAt: account.nextSyncAt,
				nextPermissionRetryAt,
				lastSyncedAt: account.lastSyncedAt,
			});
		}
		let pending = null;
		for (const status of ["preparing", "pending", "exchanging", "awaiting_finish"] as const) {
			const attempt = await ctx.db
				.query("oauth_states")
				.withIndex("by_actorUser_installation_status", (q) =>
					q.eq("actorUserId", args.actorUserId).eq("installationId", args.installationId).eq("status", status),
				)
				.first();
			if (
				attempt &&
				attempt.organizationId === args.organizationId &&
				attempt.workspaceId === args.workspaceId &&
				attempt.expiresAt > Date.now()
			) {
				pending = {
					attemptId: attempt._id,
					status: attempt.status,
					expiresAt: attempt.expiresAt,
					clientRequestId: attempt.clientRequestId,
					accountId: attempt.accountId,
				};
				break;
			}
		}
		return {
			binding: {
				organizationId: args.organizationId,
				workspaceId: args.workspaceId,
				installationId: args.installationId,
				actorUserId: args.actorUserId,
			},
			canWrite: args.canWrite,
			accounts,
			cursor: page.isDone ? null : page.continueCursor,
			attempt: pending,
		};
	},
});

export const disconnect = internalMutation({
	args: change_args,
	returns: v.union(failure, v.object({ _yay: v.object({ accountId: v.string(), connectionGeneration: v.number() }) })),
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
	returns: v.union(
		v.object({
			accountId: v.id("gmail_accounts"),
			connectionGeneration: v.number(),
			emailAddress: v.string(),
			hostOrganizationId: v.string(),
			hostWorkspaceId: v.string(),
			hostInstallationId: v.string(),
			hostActorUserId: v.string(),
			destinationPath: v.string(),
			syncStatus: gmail_account_sync_status,
		}),
		v.null(),
	),
	handler: async (ctx, args) => {
		const account = await ctx.db.get(args.accountId);
		if (!account) return null;
		return {
			accountId: account._id,
			connectionGeneration: account.connectionGeneration,
			emailAddress: account.emailAddress,
			hostOrganizationId: account.hostOrganizationId,
			hostWorkspaceId: account.hostWorkspaceId,
			hostInstallationId: account.hostInstallationId,
			hostActorUserId: account.hostActorUserId,
			destinationPath: account.destinationPath,
			syncStatus: account.syncStatus,
		};
	},
});

export const operator_disconnect = internalMutation({
	args: { accountId: v.id("gmail_accounts"), expectedGeneration: v.number() },
	returns: v.union(
		failure,
		v.object({
			_yay: v.object({
				accountId: v.id("gmail_accounts"),
				connectionGeneration: v.number(),
				localSecretsCleared: v.boolean(),
				pendingWorkStopped: v.boolean(),
				ledgerCountsKept: v.boolean(),
			}),
		}),
	),
	handler: async (ctx, args) => {
		const account = await ctx.db.get(args.accountId);
		if (!account) return refused(404, "account_not_found");
		if (account.connectionGeneration !== args.expectedGeneration) return refused(409, "connection_changed");
		await disconnect_account(ctx, account);
		const after = (await ctx.db.get(account._id))!;
		const grant = account.hostGrantId ? await ctx.db.get(account.hostGrantId) : null;
		return {
			_yay: {
				accountId: account._id,
				connectionGeneration: after.connectionGeneration,
				localSecretsCleared:
					after.googleRefreshToken === null &&
					after.hostGrantId === null &&
					(!grant || (grant.sourceSecret === null && grant.interactiveSecret === null && grant.sealedSecret === null)),
				pendingWorkStopped:
					after.syncWorkId === null &&
					after.syncRequestId === null &&
					after.connectRequestId === null &&
					after.nextSyncAt === null,
				ledgerCountsKept: JSON.stringify(after.ledgerCounts) === JSON.stringify(account.ledgerCounts),
			},
		};
	},
});

export const prepare_repair = internalMutation({
	args: { ...change_args, clientRequestId: v.string(), pageToken: v.string() },
	returns: v.union(
		failure,
		v.object({ _yay: v.object({ grantId: v.id("host_grants"), clientRequestId: v.string() }) }),
	),
	handler: async (ctx, args) => {
		const account = await workspace_account(ctx, args);
		if (!account) return refused(404, "account_not_found");
		if (account.connectionGeneration !== args.expectedGeneration) return refused(409, "connection_changed");
		if (account.hostInstallationId !== args.installationId || account.hostActorUserId !== args.actorUserId)
			return refused(409, "google_reconnect_needed");
		if (account.syncStatus === "disconnected") return refused(409, "account_disconnected");
		const prior = await ctx.db
			.query("host_grants")
			.withIndex("by_actorUser_installation_repairClientRequestId", (q) =>
				q
					.eq("actorUserId", args.actorUserId)
					.eq("installationId", args.installationId)
					.eq("repairClientRequestId", args.clientRequestId),
			)
			.unique();
		if (prior) {
			if (
				prior.accountId !== account._id ||
				prior.connectionGeneration !== account.connectionGeneration ||
				account.hostGrantId !== prior._id ||
				prior.phase === "cancelled"
			)
				return refused(409, "connection_changed");
			return { _yay: { grantId: prior._id, clientRequestId: args.clientRequestId } };
		}
		const old = account.hostGrantId ? await ctx.db.get(account.hostGrantId) : null;
		if (old?.repairClientRequestId && ["exchange", "renew", "seal"].includes(old.phase))
			return { _yay: { grantId: old._id, clientRequestId: old.repairClientRequestId } };
		if (account.syncError !== "press_reconnect_needed") return refused(409, "repair_not_needed");
		if (!(await gmail_rate_limit(ctx, `repair:${args.actorUserId}:${args.installationId}`, 60 * 60_000, 10)))
			return refused(429, "rate_limited");
		if (account.syncWorkId) await gmail_workpool.cancel(ctx, account.syncWorkId as WorkId);
		if (old)
			await ctx.db.patch(old._id, {
				phase: "cancelled",
				sourceSecret: null,
				interactiveSecret: null,
				sealedSecret: null,
				nextAttemptAt: null,
			});
		const grantId = await ctx.db.insert("host_grants", {
			organizationId: args.organizationId,
			workspaceId: args.workspaceId,
			installationId: args.installationId,
			actorUserId: args.actorUserId,
			accountId: account._id,
			attemptId: null,
			connectionGeneration: account.connectionGeneration,
			repairClientRequestId: args.clientRequestId,
			phase: "exchange",
			sourceSecret: null,
			interactiveSecret: null,
			interactiveExpiresAt: null,
			sealedSecret: null,
			sealedExpiresAt: null,
			destinationPath: account.destinationPath,
			lifecycleRequestId: gmail_random_secret(),
			nextAttemptAt: Date.now(),
			temporaryFailures: 0,
			error: null,
			updatedAt: Date.now(),
		});
		await ctx.db.patch(grantId, { sourceSecret: await gmail_encrypt(args.pageToken, `grant:${grantId}:source`) });
		// Replaced slices must not keep the new chain waiting on an old work marker.
		await ctx.db.patch(account._id, {
			hostGrantId: grantId,
			nextSyncAt: null,
			syncWorkId: null,
			syncRequestId: null,
			syncStatus: "blocked",
			updatedAt: Date.now(),
		});
		return { _yay: { grantId, clientRequestId: args.clientRequestId } };
	},
});

export async function gmail_repair(
	ctx: ActionCtx,
	actor: { organizationId: string; workspaceId: string; installationId: string; actorUserId: string },
	body: { accountId: string; expectedGeneration: number; clientRequestId: string },
	pageToken: string,
) {
	const prepared = await ctx.runMutation(internal.gmail_accounts.prepare_repair, { ...actor, ...body, pageToken });
	if ("_nay" in prepared) throw new gmail_PageError(prepared._nay.status, prepared._nay.code);
	await gmail_grant_step(ctx, prepared._yay.grantId);
	const grant: Doc<"host_grants"> | null = await ctx.runQuery(internal.gmail_grants.get_current, {
		grantId: prepared._yay.grantId,
	});
	if (!grant) throw new gmail_PageError(409, "connection_changed");
	return {
		phase: grant.phase,
		clientRequestId: prepared._yay.clientRequestId,
		...(grant.phase === "blocked"
			? { code: grant.error === "actor_lost" ? "actor_lost" : "press_reconnect_needed" }
			: {}),
	};
}

export const retry_sync = internalMutation({
	args: change_args,
	returns: v.union(failure, v.object({ _yay: v.null() })),
	handler: async (ctx, args) => {
		const account = await workspace_account(ctx, args);
		if (!account) return refused(404, "account_not_found");
		if (account.connectionGeneration !== args.expectedGeneration) return refused(409, "connection_changed");
		if (
			account.syncStatus === "disconnected" ||
			!["gmail_request", "history_response_too_large"].includes(account.sourceError ?? "")
		)
			return refused(409, "retry_not_available");
		if (!(await gmail_rate_limit(ctx, `retry-sync:${args.actorUserId}:${args.installationId}`, 60 * 60_000, 10)))
			return refused(429, "rate_limited");
		const grant = account.hostGrantId ? await ctx.db.get(account.hostGrantId) : null;
		const ready = grant?.phase === "ready" && grant.connectionGeneration === account.connectionGeneration;
		await ctx.db.patch(account._id, {
			sourceError: null,
			syncError: ready ? null : account.syncError,
			syncStatus: ready ? (account.backfillComplete ? "live" : "backfilling") : account.syncStatus,
			nextSyncAt: ready ? Date.now() : null,
			updatedAt: Date.now(),
		});
		return { _yay: null };
	},
});

export const retry_failed = internalMutation({
	args: change_args,
	returns: v.union(failure, v.object({ _yay: v.object({ count: v.number(), more: v.boolean() }) })),
	handler: async (ctx, args) => {
		const account = await workspace_account(ctx, args);
		if (!account) return refused(404, "account_not_found");
		if (account.connectionGeneration !== args.expectedGeneration) return refused(409, "connection_changed");
		if (account.syncStatus === "disconnected") return refused(409, "account_disconnected");
		const rows = await ctx.db
			.query("messages_ledger")
			.withIndex("by_account_status_nextAttemptAt", (q) => q.eq("accountId", account._id).eq("status", "given_up"))
			.take(25);
		let held = 0;
		let nextDue: number | null = null;
		for (const row of rows) {
			const attachments = row.attachments.map((task) =>
				["saved", "not_saved"].includes(task.state)
					? task
					: {
							...task,
							state: task.accepted
								? ("pending" as const)
								: task.request
									? ("uncertain" as const)
									: ("unstarted" as const),
							deliveries: 0,
							sourceUnavailablePendingChecks: 0,
							nextAttemptAt: Date.now(),
							reason: null,
						},
			);
			const settlementNeeded = attachments.some(
				(task) => task.request !== null && !["saved", "not_saved"].includes(task.state),
			);
			const due = Math.max(Date.now(), row.permissionHeld ? (account.permissionProbeNotBefore ?? 0) : 0);
			if (!account.sourceError || settlementNeeded) nextDue = Math.min(nextDue ?? due, due);
			if (row.permissionHeld) held++;
			await ctx.db.patch(row._id, {
				status: row.permissionHeld ? "failed" : "pending",
				attempts: 0,
				error: row.permissionHeld ? "file_access" : null,
				attachments,
				settlementNeeded,
				nextAttemptAt: due,
				updatedAt: Date.now(),
			});
		}
		const grant = account.hostGrantId ? await ctx.db.get(account.hostGrantId) : null;
		const ready = grant?.phase === "ready" && grant.connectionGeneration === account.connectionGeneration;
		await ctx.db.patch(account._id, {
			ledgerCounts: {
				...account.ledgerCounts,
				given_up: account.ledgerCounts.given_up - rows.length,
				pending: account.ledgerCounts.pending + rows.length - held,
				failed: account.ledgerCounts.failed + held,
			},
			nextSyncAt: ready && nextDue !== null ? Math.min(account.nextSyncAt ?? nextDue, nextDue) : account.nextSyncAt,
			updatedAt: Date.now(),
		});
		const more = !!(await ctx.db
			.query("messages_ledger")
			.withIndex("by_account_status_nextAttemptAt", (q) => q.eq("accountId", account._id).eq("status", "given_up"))
			.first());
		return { _yay: { count: rows.length, more } };
	},
});

export const failures = internalQuery({
	args: { ...gmail_host_binding, accountId: v.string(), paginationOpts: paginationOptsValidator },
	returns: v.union(
		failure,
		v.object({
			_yay: v.object({
				items: v.array(v.object({ gmailMessageId: v.string(), reasonCode: v.string() })),
				cursor: v.union(v.string(), v.null()),
			}),
		}),
	),
	handler: async (ctx, args) => {
		const account = await workspace_account(ctx, args);
		if (!account) return refused(404, "account_not_found");
		const page = await ctx.db
			.query("messages_ledger")
			.withIndex("by_account_status_nextAttemptAt", (q) => q.eq("accountId", account._id).eq("status", "given_up"))
			.paginate(args.paginationOpts);
		const known = [
			"source_too_large",
			"mime_too_large",
			"invalid_source",
			"settlement_unconfirmed",
			"delivery_failed",
			"gmail_request",
			"file_conflict",
		];
		return {
			_yay: {
				items: page.page.map((row) => ({
					gmailMessageId: row.gmailMessageId,
					reasonCode: known.includes(row.error ?? "") ? row.error! : "message_failed",
				})),
				cursor: page.isDone ? null : page.continueCursor,
			},
		};
	},
});

type WorkerContext = {
	accountId: Id<"gmail_accounts">;
	generation: number;
	requestId: string;
	grantId: Id<"host_grants">;
};
type PermissionClaim = { deadline: number; operation: NonNullable<Doc<"messages_ledger">["fileAccessOperation"]> };

function same(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
	if (Array.isArray(a) || Array.isArray(b))
		return (
			Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => same(value, b[index]))
		);
	const left = Object.entries(a);
	const right = new Map(Object.entries(b));
	return left.length === right.size && left.every(([key, value]) => right.has(key) && same(value, right.get(key)));
}

async function worker_account(ctx: QueryCtx | MutationCtx, work: WorkerContext) {
	const account = await ctx.db.get(work.accountId);
	if (
		!account ||
		account.connectionGeneration !== work.generation ||
		account.syncRequestId !== work.requestId ||
		account.hostGrantId !== work.grantId ||
		account.syncStatus === "disconnected"
	)
		return null;
	const grant = await ctx.db.get(work.grantId);
	if (
		!grant ||
		grant.phase !== "ready" ||
		grant.accountId !== account._id ||
		grant.connectionGeneration !== work.generation ||
		grant.installationId !== account.hostInstallationId ||
		grant.actorUserId !== account.hostActorUserId ||
		grant.organizationId !== account.hostOrganizationId ||
		grant.workspaceId !== account.hostWorkspaceId ||
		grant.destinationPath !== account.destinationPath ||
		!grant.sealedSecret ||
		(grant.sealedExpiresAt ?? 0) <= Date.now()
	)
		return null;
	return { account, grant };
}

function matching_claim(account: Doc<"gmail_accounts">, row: Doc<"messages_ledger">, claim: PermissionClaim | null) {
	return row.permissionHeld
		? claim !== null &&
				account.permissionProbeNotBefore === claim.deadline &&
				same(row.fileAccessOperation, claim.operation)
		: claim === null;
}

export const get_worker = internalQuery({
	args: { work: gmail_worker_context },
	returns: v.union(v.object({ account: doc(schema, "gmail_accounts"), grant: doc(schema, "host_grants") }), v.null()),
	handler: async (ctx, args) => worker_account(ctx, args.work),
});

export const guard_message = internalQuery({
	args: {
		work: gmail_worker_context,
		row: doc(schema, "messages_ledger"),
		claim: v.union(gmail_permission_claim, v.null()),
	},
	returns: v.boolean(),
	handler: async (ctx, args) => {
		const current = await worker_account(ctx, args.work);
		const row = await ctx.db.get(args.row._id);
		return (
			!!current &&
			!!row &&
			row.accountId === current.account._id &&
			same(row, args.row) &&
			matching_claim(current.account, row, args.claim)
		);
	},
});

async function save_ledger(
	ctx: MutationCtx,
	account: Doc<"gmail_accounts">,
	before: Doc<"messages_ledger"> | null,
	after: Omit<Doc<"messages_ledger">, "_id" | "_creationTime">,
	attachmentNote: "plan" | "storage" | "clear" | null = null,
) {
	const counts = { ...account.ledgerCounts };
	if (before) counts[before.status]--;
	counts[after.status]++;
	counts.emailAssumed += Number(after.emailAssumed) - Number(before?.emailAssumed ?? false);
	counts.permissionHeld += Number(after.permissionHeld) - Number(before?.permissionHeld ?? false);
	await ctx.db.patch(account._id, {
		ledgerCounts: counts,
		messagesSynced: account.messagesSynced + Number(after.emailWritten) - Number(before?.emailWritten ?? false),
		messagesSkipped:
			account.messagesSkipped + Number(after.status === "skipped") - Number(before?.status === "skipped"),
		// Keep the upload note with its message when a worker stops after this save.
		...(attachmentNote !== null
			? { attachmentsSkippedReason: attachmentNote === "clear" ? null : attachmentNote }
			: {}),
		updatedAt: Date.now(),
	});
	if (before) {
		await ctx.db.patch(before._id, after);
		return (await ctx.db.get(before._id))!;
	}
	const id = await ctx.db.insert("messages_ledger", after);
	return (await ctx.db.get(id))!;
}

async function discover_id(
	ctx: MutationCtx,
	account: Doc<"gmail_accounts">,
	id: string,
	kind: "backfill" | "added" | "rescue_spam" | "rescue_trash" | "deleted",
) {
	const old = await ctx.db
		.query("messages_ledger")
		.withIndex("by_account_gmailMessageId", (q) => q.eq("accountId", account._id).eq("gmailMessageId", id))
		.unique();
	if (!old)
		return save_ledger(ctx, account, null, {
			accountId: account._id,
			gmailMessageId: id,
			gmailThreadId: null,
			internalDate: null,
			status: kind === "deleted" ? "skipped" : "pending",
			skipReason: kind === "deleted" ? "deleted_before_fetch" : null,
			filePath: null,
			emailWritten: false,
			emailAssumed: false,
			fileNodeId: null,
			attachments: [],
			attachmentsNotSaved: 0,
			attempts: 0,
			nextAttemptAt: kind === "deleted" ? null : Date.now(),
			settlementNeeded: false,
			permissionHeld: false,
			fileAccessOperation: null,
			error: null,
			deletedAt: kind === "deleted" ? Date.now() : null,
			updatedAt: Date.now(),
		});
	if (kind === "deleted") {
		const { _id, _creationTime, ...fields } = old;
		const pending = old.settlementNeeded;
		return save_ledger(ctx, account, old, {
			...fields,
			deletedAt: old.deletedAt ?? Date.now(),
			status: old.emailWritten || old.status === "given_up" ? old.status : pending ? old.status : "skipped",
			skipReason: old.emailWritten ? old.skipReason : "deleted_before_fetch",
			nextAttemptAt: pending ? old.nextAttemptAt : null,
			updatedAt: Date.now(),
		});
	}
	if (
		old.status === "skipped" &&
		((kind === "backfill" && ["spam", "trash"].includes(old.skipReason ?? "")) ||
			(kind === "rescue_spam" && old.skipReason === "spam") ||
			(kind === "rescue_trash" && old.skipReason === "trash"))
	) {
		const { _id, _creationTime, ...fields } = old;
		return save_ledger(ctx, account, old, {
			...fields,
			status: "pending",
			skipReason: null,
			nextAttemptAt: Date.now(),
			updatedAt: Date.now(),
		});
	}
	return old;
}

export const discover_message = internalMutation({
	args: { work: gmail_worker_context, gmailMessageId: v.string(), backfill: v.boolean() },
	returns: v.union(doc(schema, "messages_ledger"), v.null()),
	handler: async (ctx, args) => {
		const current = await worker_account(ctx, args.work);
		if (!current) return null;
		return discover_id(ctx, current.account, args.gmailMessageId, args.backfill ? "backfill" : "added");
	},
});

export const save_message = internalMutation({
	args: {
		work: gmail_worker_context,
		before: doc(schema, "messages_ledger"),
		after: doc(schema, "messages_ledger"),
		claim: v.union(gmail_permission_claim, v.null()),
		proof: v.union(v.literal("email_write"), v.number(), v.null()),
		transfer: v.boolean(),
		attachmentNote: v.union(v.literal("plan"), v.literal("storage"), v.literal("clear"), v.null()),
	},
	returns: v.union(doc(schema, "messages_ledger"), v.null()),
	handler: async (ctx, args) => {
		const current = await worker_account(ctx, args.work);
		const row = await ctx.db.get(args.before._id);
		if (
			!current ||
			!row ||
			row.accountId !== current.account._id ||
			!same(row, args.before) ||
			!matching_claim(current.account, row, args.claim) ||
			args.after._id !== row._id ||
			args.after.accountId !== row.accountId ||
			args.after.gmailMessageId !== row.gmailMessageId ||
			args.after.attachments.length > 16
		)
			return null;
		const after = { ...args.after };
		if (row.permissionHeld) {
			const operation = row.fileAccessOperation!;
			const index = operation.kind === "attachment" ? operation.index : null;
			const sameTarget = index !== null && same(row.attachments[index]?.request, after.attachments[index]?.request);
			const proved =
				operation.kind === "email_write"
					? args.proof === "email_write" && row.filePath === after.filePath
					: args.proof === index && sameTarget;
			if (args.transfer) {
				if (
					index === null ||
					sameTarget ||
					!after.attachments[index]?.request ||
					after.fileAccessOperation?.kind !== "attachment" ||
					after.fileAccessOperation.index !== index ||
					after.fileAccessOperation.operation !== "create" ||
					after.attachments[index].request!.installationId !== current.account.hostInstallationId ||
					after.attachments[index].suffix <= row.attachments[index].suffix ||
					after.attachments[index].suffix > 4
				)
					return null;
			} else if (!sameTarget && index !== null) return null;
			if (proved) {
				after.permissionHeld = false;
				after.fileAccessOperation = null;
				if (after.error === "file_access") after.error = null;
				await ctx.db.patch(current.account._id, { permissionProbeNotBefore: null });
			} else if (!["done", "skipped", "given_up"].includes(after.status)) {
				after.permissionHeld = true;
				after.nextAttemptAt = Math.max(after.nextAttemptAt ?? 0, args.claim!.deadline);
			}
		}
		const { _id, _creationTime, ...fields } = after;
		return save_ledger(ctx, current.account, row, fields, args.attachmentNote);
	},
});

export const retry_candidates = internalQuery({
	args: { work: gmail_worker_context, held: v.boolean() },
	returns: v.array(doc(schema, "messages_ledger")),
	handler: async (ctx, args) => {
		const current = await worker_account(ctx, args.work);
		if (!current || (args.held && (current.account.permissionProbeNotBefore ?? 0) > Date.now())) return [];
		if (current.account.sourceError)
			return ctx.db
				.query("messages_ledger")
				.withIndex("by_account_permissionHeld_settlementNeeded_nextAttemptAt", (q) =>
					q
						.eq("accountId", args.work.accountId)
						.eq("permissionHeld", args.held)
						.eq("settlementNeeded", true)
						.gt("nextAttemptAt", null)
						.lte("nextAttemptAt", Date.now()),
				)
				.take(args.held ? 1 : 25);
		const branches = await Promise.all(
			(["pending", "failed"] as const).map((status) =>
				ctx.db
					.query("messages_ledger")
					.withIndex("by_account_permissionHeld_status_nextAttemptAt", (q) =>
						q
							.eq("accountId", args.work.accountId)
							.eq("permissionHeld", args.held)
							.eq("status", status)
							.gt("nextAttemptAt", null)
							.lte("nextAttemptAt", Date.now()),
					)
					.take(args.held ? 1 : 25),
			),
		);
		return branches
			.flat()
			.sort((a, b) => a.nextAttemptAt! - b.nextAttemptAt! || a._creationTime - b._creationTime)
			.slice(0, args.held ? 1 : 25);
	},
});

export const claim_permission = internalMutation({
	args: { work: gmail_worker_context, rowId: v.id("messages_ledger") },
	returns: v.union(v.object({ row: doc(schema, "messages_ledger"), claim: gmail_permission_claim }), v.null()),
	handler: async (ctx, args) => {
		const current = await worker_account(ctx, args.work);
		const row = await ctx.db.get(args.rowId);
		if (
			!current ||
			!row ||
			row.accountId !== current.account._id ||
			!row.permissionHeld ||
			!row.fileAccessOperation ||
			row.nextAttemptAt === null ||
			row.nextAttemptAt > Date.now() ||
			(current.account.permissionProbeNotBefore ?? 0) > Date.now() ||
			(current.account.sourceError && !row.settlementNeeded) ||
			!["pending", "failed"].includes(row.status)
		)
			return null;
		const deadline = Date.now() + 3600_000;
		await ctx.db.patch(current.account._id, { permissionProbeNotBefore: deadline });
		await ctx.db.patch(row._id, { nextAttemptAt: Math.max(row.nextAttemptAt, deadline) });
		return { row: (await ctx.db.get(row._id))!, claim: { deadline, operation: row.fileAccessOperation } };
	},
});

const traversal_checkpoint = v.object({
	historyId: v.union(v.string(), v.null()),
	backfillPageToken: v.union(v.string(), v.null()),
	backfillPage: schema.tables.gmail_accounts.validator.fields.backfillPage,
	backfillComplete: v.boolean(),
	historyPageToken: v.union(v.string(), v.null()),
	historyAnchor: v.union(gmail_history_event, v.null()),
	historyPageSize: v.number(),
});

function traversal(account: Doc<"gmail_accounts">) {
	return {
		historyId: account.historyId,
		backfillPageToken: account.backfillPageToken,
		backfillPage: account.backfillPage,
		backfillComplete: account.backfillComplete,
		historyPageToken: account.historyPageToken,
		historyAnchor: account.historyAnchor,
		historyPageSize: account.historyPageSize,
	};
}

export const save_traversal = internalMutation({
	args: {
		work: gmail_worker_context,
		before: traversal_checkpoint,
		after: traversal_checkpoint,
		completedHistory: v.boolean(),
	},
	returns: v.boolean(),
	handler: async (ctx, args) => {
		const current = await worker_account(ctx, args.work);
		if (
			!current ||
			!same(traversal(current.account), args.before) ||
			(args.after.backfillPage?.ids.length ?? 0) > 25 ||
			![1, 25].includes(args.after.historyPageSize)
		)
			return false;
		await ctx.db.patch(current.account._id, {
			...args.after,
			...(args.completedHistory ? { lastSyncedAt: Date.now() } : {}),
			updatedAt: Date.now(),
		});
		return true;
	},
});

export const ingest_history = internalMutation({
	args: { work: gmail_worker_context, before: traversal_checkpoint, events: v.array(gmail_history_event) },
	returns: v.boolean(),
	handler: async (ctx, args) => {
		const current = await worker_account(ctx, args.work);
		if (
			!current ||
			args.events.length === 0 ||
			args.events.length > 25 ||
			!same(traversal(current.account), args.before)
		)
			return false;
		for (const event of args.events) {
			const account = (await ctx.db.get(current.account._id))!;
			await discover_id(ctx, account, event.gmailMessageId, event.kind);
		}
		await ctx.db.patch(current.account._id, { historyAnchor: args.events.at(-1)!, updatedAt: Date.now() });
		return true;
	},
});

export const pace_press = internalMutation({
	args: { work: gmail_worker_context, route: v.string() },
	returns: v.union(v.number(), v.null()),
	handler: async (ctx, args) => {
		const current = await worker_account(ctx, args.work);
		if (!current) return null;
		const row = await ctx.db
			.query("press_route_pacing")
			.withIndex("by_installation_route", (q) =>
				q.eq("installationId", current.account.hostInstallationId).eq("route", args.route),
			)
			.unique();
		const callAt = Math.max(Date.now(), (row?.lastCallAt ?? 0) + 600);
		if (row) await ctx.db.patch(row._id, { lastCallAt: callAt });
		else
			await ctx.db.insert("press_route_pacing", {
				installationId: current.account.hostInstallationId,
				route: args.route,
				lastCallAt: callAt,
			});
		return callAt - Date.now();
	},
});

async function next_settlement(ctx: QueryCtx | MutationCtx, account: Doc<"gmail_accounts">) {
	const rows = await Promise.all(
		[false, true].map((held) =>
			ctx.db
				.query("messages_ledger")
				.withIndex("by_account_permissionHeld_settlementNeeded_nextAttemptAt", (q) =>
					q
						.eq("accountId", account._id)
						.eq("permissionHeld", held)
						.eq("settlementNeeded", true)
						.gt("nextAttemptAt", null),
				)
				.first(),
		),
	);
	const due = rows.flatMap((row) =>
		row?.nextAttemptAt !== null && row?.nextAttemptAt !== undefined
			? [Math.max(row.nextAttemptAt, row.permissionHeld ? (account.permissionProbeNotBefore ?? 0) : 0)]
			: [],
	);
	return due.length ? Math.min(...due) : null;
}

export const finish_slice = internalMutation({
	args: {
		work: gmail_worker_context,
		error: v.union(
			v.literal("press_reconnect_needed"),
			v.literal("actor_lost"),
			v.literal("credits"),
			v.literal("press_temporary"),
			v.literal("gmail_temporary"),
			v.literal("sync_error"),
			gmail_source_error,
		),
		retryAfterMs: v.union(v.number(), v.null()),
		attachmentNote: v.union(v.literal("plan"), v.literal("storage"), v.literal("clear"), v.null()),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const current = await worker_account(ctx, args.work);
		if (!current) return null;
		const account = current.account;
		const sourceError = ["google_revoked", "gmail_request", "history_response_too_large"].includes(args.error ?? "")
			? (args.error as NonNullable<Doc<"gmail_accounts">["sourceError"]>)
			: account.sourceError;
		const deadHost = args.error === "press_reconnect_needed" || args.error === "actor_lost";
		const temporary = ["press_temporary", "gmail_temporary", "sync_error", "credits"].includes(args.error ?? "");
		const failures = temporary ? account.temporaryFailures + 1 : 0;
		const delay =
			args.error === "credits"
				? 3600_000
				: Math.min(3600_000, 60_000 * 2 ** Math.min(failures - 1, 6)) * (1 + Math.random() * 0.1);
		const nextSyncAt = deadHost
			? null
			: temporary
				? Date.now() + Math.max(delay, args.retryAfterMs ?? 0)
				: sourceError
					? await next_settlement(ctx, account)
					: Date.now() + 60_000;
		if (deadHost) await ctx.db.patch(current.grant._id, { phase: "blocked", error: args.error, nextAttemptAt: null });
		await ctx.db.patch(account._id, {
			sourceError,
			...(args.error === "google_revoked" ? { googleRefreshToken: null } : {}),
			syncError: args.error ?? sourceError,
			syncStatus:
				deadHost || temporary ? "blocked" : sourceError ? "error" : account.backfillComplete ? "live" : "backfilling",
			nextSyncAt,
			temporaryFailures: failures,
			nextSliceKind:
				account.nextSliceKind === "backfill" ? "history" : account.nextSliceKind === "history" ? "retry" : "backfill",
			...(args.attachmentNote !== null
				? { attachmentsSkippedReason: args.attachmentNote === "clear" ? null : args.attachmentNote }
				: {}),
			updatedAt: Date.now(),
		});
		return null;
	},
});

export const dispatch = internalMutation({
	args: {},
	returns: v.null(),
	handler: async (ctx) => {
		const due = await ctx.db
			.query("gmail_accounts")
			.withIndex("by_syncWorkId_nextSyncAt", (q) =>
				q.eq("syncWorkId", null).gt("nextSyncAt", null).lte("nextSyncAt", Date.now()),
			)
			.take(25);
		for (const account of due) {
			const grant = account.hostGrantId ? await ctx.db.get(account.hostGrantId) : null;
			if (
				account.syncStatus === "disconnected" ||
				!grant ||
				grant.phase !== "ready" ||
				grant.connectionGeneration !== account.connectionGeneration
			) {
				await ctx.db.patch(account._id, { nextSyncAt: null });
				continue;
			}
			const work = {
				accountId: account._id,
				generation: account.connectionGeneration,
				requestId: gmail_random_secret(),
				grantId: grant._id,
			};
			const workId = await gmail_workpool.enqueueAction(
				ctx,
				internal.gmail_worker.work_account_slice,
				{ work },
				{ onComplete: internal.gmail_accounts.on_complete, context: work },
			);
			await ctx.db.patch(account._id, { syncRequestId: work.requestId, syncWorkId: workId });
		}
		return null;
	},
});

export const on_complete = internalMutation({
	args: vOnCompleteArgs(gmail_worker_context, v.null()),
	returns: v.null(),
	handler: async (ctx, args) => {
		const account = await ctx.db.get(args.context.accountId);
		if (
			!account ||
			account.connectionGeneration !== args.context.generation ||
			account.syncRequestId !== args.context.requestId ||
			account.syncWorkId !== args.workId ||
			account.hostGrantId !== args.context.grantId
		)
			return null;
		const failed = args.result.kind === "failed" && account.syncStatus !== "disconnected";
		const settlement = failed && account.sourceError ? await next_settlement(ctx, account) : null;
		const retryAt =
			Date.now() + Math.min(3600_000, 60_000 * 2 ** Math.min(account.temporaryFailures, 6)) * (1 + Math.random() * 0.1);
		await ctx.db.patch(account._id, {
			syncRequestId: null,
			syncWorkId: null,
			...(failed
				? {
						syncStatus: "blocked" as const,
						syncError: "sync_error",
						temporaryFailures: account.temporaryFailures + 1,
						// A crash after saving a service wait must not shorten it.
						nextSyncAt: account.sourceError && settlement === null
							? null
							: Math.max(settlement ?? 0, account.nextSyncAt ?? 0, retryAt),
					}
				: {}),
			updatedAt: Date.now(),
		});
		return null;
	},
});
