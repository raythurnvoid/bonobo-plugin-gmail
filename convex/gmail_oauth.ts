import { v } from "convex/values";
import { doc } from "convex-helpers/validators";
import type { WorkId } from "@convex-dev/workpool";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, internalQuery, type ActionCtx, type MutationCtx, type QueryCtx } from "./_generated/server";
import schema, { gmail_host_binding } from "./schema";
import { gmail_decrypt, gmail_encrypt, gmail_google_token_purpose, gmail_random_secret, gmail_sha256 } from "./gmail_secrets";
import { gmail_cleanup_page_rows, gmail_PageError, gmail_rate_limit, gmail_verify_live } from "./gmail_page";
import { gmail_HostError } from "./press";
import { gmail_grant_step } from "./gmail_grants";
import { gmail_consent_url, gmail_google_get, gmail_google_token, gmail_profile_response } from "./gmail_google";
import { gmail_slug } from "../shared/gmail-paths";
import { gmail_workpool } from "./gmail_workpool";

const maximumAccounts = Number(process.env.GMAIL_MAX_CONNECTED_ACCOUNTS);
if (!Number.isSafeInteger(maximumAccounts) || maximumAccounts < 1) throw new Error("GMAIL_MAX_CONNECTED_ACCOUNTS must be a positive integer");
if (!process.env.CONVEX_SITE_URL) throw new Error("CONVEX_SITE_URL is not set");
const callback = `${process.env.CONVEX_SITE_URL}/oauth/google/callback`;
const failure = v.object({ _nay: v.object({ status: v.number(), code: v.string() }) });
const activeStatuses = ["preparing", "pending", "exchanging", "awaiting_finish"] as const;

function refused(status: number, code: string) { return { _nay: { status, code } }; }
function same_binding(attempt: Doc<"oauth_states">, actor: { organizationId: string; workspaceId: string; installationId: string; actorUserId: string }) {
	return attempt.organizationId === actor.organizationId && attempt.workspaceId === actor.workspaceId
		&& attempt.installationId === actor.installationId && attempt.actorUserId === actor.actorUserId;
}

async function target_current(ctx: QueryCtx | MutationCtx, attempt: Doc<"oauth_states">) {
	if (!attempt.accountId) return true;
	const account = await ctx.db.get(attempt.accountId);
	return !!account && account.connectRequestId === attempt._id && account.connectionGeneration === attempt.expectedGeneration
		&& account.hostOrganizationId === attempt.organizationId && account.hostWorkspaceId === attempt.workspaceId;
}

export async function gmail_close_attempt(ctx: MutationCtx, attempt: Doc<"oauth_states">, status: "failed" | "cancelled", error: string) {
	if (attempt.status === "finished") return;
	await ctx.db.patch(attempt._id, { status, error, stateHash: null, encryptedState: null, stagedRefreshToken: null,
		stagedEmailAddress: null, stagedHistoryId: null, finishCodeHash: null, encryptedFinishCode: null, processingDeadline: null, updatedAt: Date.now() });
	if (attempt.accountId) {
		const account = await ctx.db.get(attempt.accountId);
		if (account?.connectRequestId === attempt._id) await ctx.db.patch(account._id, { connectRequestId: null });
	}
	if (attempt.grantId) {
		const grant = await ctx.db.get(attempt.grantId);
		if (grant?.attemptId === attempt._id && grant.accountId === null) await ctx.db.patch(grant._id, {
			phase: "cancelled", sourceSecret: null, interactiveSecret: null, sealedSecret: null, nextAttemptAt: null, updatedAt: Date.now() });
	}
}

export const prepare_start = internalMutation({
	args: { ...gmail_host_binding, clientRequestId: v.string(), accountId: v.union(v.string(), v.null()), pageToken: v.string() },
	returns: v.union(failure, v.object({ _yay: v.id("oauth_states") })),
	handler: async (ctx, args) => {
		const prior = await ctx.db.query("oauth_states").withIndex("by_actorUser_installation_clientRequestId", q =>
			q.eq("actorUserId", args.actorUserId).eq("installationId", args.installationId).eq("clientRequestId", args.clientRequestId)).unique();
		if (prior) {
			if (!same_binding(prior, args) || prior.accountId !== args.accountId) return refused(409, "request_changed");
			if (["failed", "cancelled"].includes(prior.status)) return refused(409, "start_again");
			if (prior.status !== "finished" && (prior.expiresAt <= Date.now() || !await target_current(ctx, prior))) {
				await gmail_close_attempt(ctx, prior, "failed", "attempt_expired"); return refused(409, "start_again");
			}
			return { _yay: prior._id };
		}
		const accountId = args.accountId ? ctx.db.normalizeId("gmail_accounts", args.accountId) : null;
		const account = accountId ? await ctx.db.get(accountId) : null;
		if (args.accountId && (!account || account.hostOrganizationId !== args.organizationId || account.hostWorkspaceId !== args.workspaceId)) return refused(404, "account_not_found");
		if (!await gmail_rate_limit(ctx, `start:${args.actorUserId}:${args.installationId}`, 60 * 60_000, 10)) return refused(429, "rate_limited");
		for (const status of activeStatuses) {
			const old = await ctx.db.query("oauth_states").withIndex("by_actorUser_installation_status", q =>
				q.eq("actorUserId", args.actorUserId).eq("installationId", args.installationId).eq("status", status)).first();
			if (old) await gmail_close_attempt(ctx, old, "cancelled", "replaced");
		}
		if (account?.connectRequestId) {
			const old = await ctx.db.get(account.connectRequestId);
			if (old) await gmail_close_attempt(ctx, old, "cancelled", "replaced");
		}
		const id = await ctx.db.insert("oauth_states", { organizationId: args.organizationId, workspaceId: args.workspaceId,
			installationId: args.installationId, actorUserId: args.actorUserId, clientRequestId: args.clientRequestId,
			accountId, expectedGeneration: account?.connectionGeneration ?? null, grantId: null, status: "preparing",
			stateHash: null, encryptedState: null, googleCodeHash: null, stagedRefreshToken: null, stagedEmailAddress: null, stagedHistoryId: null,
			finishCodeHash: null, encryptedFinishCode: null, completedAccountId: null, completedGeneration: null,
			expiresAt: Date.now() + 10 * 60_000, processingDeadline: null, receiptExpiresAt: null, error: null, updatedAt: Date.now() });
		const state = gmail_random_secret();
		const grantId = await ctx.db.insert("host_grants", { organizationId: args.organizationId, workspaceId: args.workspaceId,
			installationId: args.installationId, actorUserId: args.actorUserId, accountId: null, attemptId: id,
			connectionGeneration: account?.connectionGeneration ?? 0, repairClientRequestId: null, phase: "exchange", sourceSecret: null,
			interactiveSecret: null, interactiveExpiresAt: null, sealedSecret: null, sealedExpiresAt: null, destinationPath: null,
			lifecycleRequestId: gmail_random_secret(), nextAttemptAt: Date.now(), temporaryFailures: 0, error: null, updatedAt: Date.now() });
		await ctx.db.patch(grantId, { sourceSecret: await gmail_encrypt(args.pageToken, `grant:${grantId}:source`) });
		await ctx.db.patch(id, { grantId, stateHash: await gmail_sha256(state), encryptedState: await gmail_encrypt(state, `attempt:${id}:state`) });
		if (account) await ctx.db.patch(account._id, { connectRequestId: id });
		return { _yay: id };
	},
});

export const get_attempt = internalQuery({
	args: { ...gmail_host_binding, attemptId: v.string() }, returns: v.union(doc(schema, "oauth_states"), v.null()),
	handler: async (ctx, args) => {
		const id = ctx.db.normalizeId("oauth_states", args.attemptId);
		const attempt = id ? await ctx.db.get(id) : null;
		return attempt && same_binding(attempt, args) ? attempt : null;
	},
});

export const fail_attempt = internalMutation({
	args: { attemptId: v.id("oauth_states"), error: v.string(), googleCodeHash: v.union(v.string(), v.null()) }, returns: v.null(),
	handler: async (ctx, args) => {
		const attempt = await ctx.db.get(args.attemptId);
		if (attempt && attempt.googleCodeHash === args.googleCodeHash && activeStatuses.some(status => status === attempt.status)) await gmail_close_attempt(ctx, attempt, "failed", args.error);
		return null;
	},
});

export async function gmail_start(ctx: ActionCtx, actor: { organizationId: string; workspaceId: string; installationId: string; actorUserId: string },
	input: { clientRequestId: string; accountId: string | null }, pageToken: string) {
	// Check setup before saving an attempt. This never returns a partly configured consent URL.
	gmail_consent_url("", callback);
	const result = await ctx.runMutation(internal.gmail_oauth.prepare_start, { ...actor, ...input, pageToken });
	if ("_nay" in result) throw new gmail_PageError(result._nay.status, result._nay.code);
	let attempt: Doc<"oauth_states"> | null = await ctx.runQuery(internal.gmail_oauth.get_attempt, { ...actor, attemptId: result._yay });
	if (attempt?.status === "preparing" && attempt.grantId) {
		await gmail_grant_step(ctx, attempt.grantId);
		attempt = await ctx.runQuery(internal.gmail_oauth.get_attempt, { ...actor, attemptId: result._yay });
		const grant: Doc<"host_grants"> | null = await ctx.runQuery(internal.gmail_grants.get_current, { grantId: attempt!.grantId! });
		if (grant?.phase === "blocked") {
			await ctx.runMutation(internal.gmail_oauth.fail_attempt, { attemptId: result._yay, error: "start_again", googleCodeHash: null });
			throw new gmail_PageError(409, "start_again");
		}
	}
	if (!attempt || ["failed", "cancelled"].includes(attempt.status)) throw new gmail_PageError(409, "start_again");
	return { attemptId: attempt._id, status: attempt.status,
		...(attempt.status === "pending" && attempt.encryptedState ? { consentUrl: gmail_consent_url(await gmail_decrypt(attempt.encryptedState, `attempt:${attempt._id}:state`), callback) } : {}) };
}

export const claim_callback = internalMutation({
	args: { stateHash: v.string(), codeHash: v.union(v.string(), v.null()), denied: v.boolean() },
	returns: v.union(failure, v.object({ _yay: doc(schema, "oauth_states"), exchange: v.boolean() })),
	handler: async (ctx, args) => {
		const attempt = await ctx.db.query("oauth_states").withIndex("by_stateHash", q => q.eq("stateHash", args.stateHash)).unique();
		if (!attempt || ["failed", "cancelled"].includes(attempt.status)) return refused(400, "invalid_callback");
		if (attempt.status === "finished") return attempt.googleCodeHash === args.codeHash ? { _yay: attempt, exchange: false } : refused(400, "invalid_callback");
		if (attempt.expiresAt <= Date.now() || !await target_current(ctx, attempt)) {
			await gmail_close_attempt(ctx, attempt, "failed", "attempt_expired"); return refused(400, "start_again");
		}
		if (attempt.status === "exchanging" && (attempt.processingDeadline ?? 0) <= Date.now()) {
			await gmail_close_attempt(ctx, attempt, "failed", "exchange_interrupted"); return refused(400, "start_again");
		}
		if (attempt.status === "pending") {
			if (args.denied) { await gmail_close_attempt(ctx, attempt, "failed", "google_denied"); return refused(400, "google_denied"); }
			if (!args.codeHash) return refused(400, "invalid_callback");
			await ctx.db.patch(attempt._id, { status: "exchanging", googleCodeHash: args.codeHash, processingDeadline: Date.now() + 2 * 60_000, updatedAt: Date.now() });
			return { _yay: (await ctx.db.get(attempt._id))!, exchange: true };
		}
		if (attempt.googleCodeHash !== args.codeHash || args.denied || attempt.status === "preparing") return refused(400, "invalid_callback");
		return { _yay: attempt, exchange: false };
	},
});

export const stage_callback = internalMutation({
	args: { attemptId: v.id("oauth_states"), codeHash: v.string(), encryptedRefreshToken: v.string(), emailAddress: v.string(), historyId: v.string() },
	returns: v.union(failure, v.object({ _yay: doc(schema, "oauth_states") })),
	handler: async (ctx, args) => {
		const attempt = await ctx.db.get(args.attemptId);
		if (!attempt || attempt.status !== "exchanging" || attempt.googleCodeHash !== args.codeHash || attempt.expiresAt <= Date.now()
			|| (attempt.processingDeadline ?? 0) <= Date.now() || !await target_current(ctx, attempt)) return refused(409, "start_again");
		const target = attempt.accountId ? await ctx.db.get(attempt.accountId) : null;
		const duplicate = await ctx.db.query("gmail_accounts").withIndex("by_hostWorkspace_emailAddress", q => q.eq("hostWorkspaceId", attempt.workspaceId).eq("emailAddress", args.emailAddress)).unique();
		if ((target && target.emailAddress !== args.emailAddress) || (!target && duplicate)) {
			await gmail_close_attempt(ctx, attempt, "failed", target ? "gmail_account_changed" : "choose_reconnect");
			return refused(409, target ? "gmail_account_changed" : "choose_reconnect");
		}
		const finishCode = gmail_random_secret();
		await ctx.db.patch(attempt._id, { status: "awaiting_finish", stagedRefreshToken: args.encryptedRefreshToken,
			stagedEmailAddress: args.emailAddress, stagedHistoryId: args.historyId, finishCodeHash: await gmail_sha256(finishCode),
			encryptedFinishCode: await gmail_encrypt(finishCode, `attempt:${attempt._id}:finish`), expiresAt: Date.now() + 10 * 60_000,
			processingDeadline: null, updatedAt: Date.now() });
		return { _yay: (await ctx.db.get(attempt._id))! };
	},
});

export async function gmail_callback(ctx: ActionCtx, state: string, code: string | null, denied: boolean) {
	const codeHash = code ? await gmail_sha256(code) : null;
	const claimed = await ctx.runMutation(internal.gmail_oauth.claim_callback, { stateHash: await gmail_sha256(state), codeHash, denied });
	if ("_nay" in claimed) throw new gmail_PageError(claimed._nay.status, claimed._nay.code);
	let attempt: Doc<"oauth_states"> = claimed._yay;
	if (claimed.exchange) {
		try {
			const token = await gmail_google_token({ code: code!, callback });
			const profile = gmail_profile_response.safeParse(await gmail_google_get("/profile", token.access_token, 8192));
			if (!profile.success) throw new Error("Invalid profile");
			const staged = await ctx.runMutation(internal.gmail_oauth.stage_callback, { attemptId: attempt._id, codeHash: codeHash!,
				encryptedRefreshToken: await gmail_encrypt(token.refresh_token!, `attempt:${attempt._id}:google-refresh`),
				emailAddress: profile.data.emailAddress.trim().toLowerCase(), historyId: profile.data.historyId });
			if ("_nay" in staged) throw new gmail_PageError(staged._nay.status, staged._nay.code);
			attempt = staged._yay;
		} catch (error) {
			await ctx.runMutation(internal.gmail_oauth.fail_attempt, { attemptId: attempt._id, error: "start_again", googleCodeHash: codeHash });
			throw error instanceof gmail_PageError ? error : new gmail_PageError(400, "start_again");
		}
	}
	return { status: attempt.status, organizationId: attempt.organizationId, workspaceId: attempt.workspaceId,
		emailAddress: attempt.stagedEmailAddress, ...(attempt.status === "awaiting_finish" && attempt.encryptedFinishCode
			? { finishCode: await gmail_decrypt(attempt.encryptedFinishCode, `attempt:${attempt._id}:finish`) } : {}) };
}

export const reserve_finish = internalMutation({
	args: { ...gmail_host_binding, attemptId: v.string(), finishCodeHash: v.string() },
	returns: v.union(failure, v.object({ _yay: doc(schema, "oauth_states") })),
	handler: async (ctx, args) => {
		if (!await gmail_rate_limit(ctx, `finish:${args.actorUserId}:${args.installationId}`, 60_000, 10)) return refused(429, "rate_limited");
		const id = ctx.db.normalizeId("oauth_states", args.attemptId);
		const attempt = id ? await ctx.db.get(id) : null;
		if (!attempt || !same_binding(attempt, args) || attempt.finishCodeHash !== args.finishCodeHash) return refused(400, "invalid_finish_code");
		if (attempt.status === "finished") {
			const account = attempt.completedAccountId ? await ctx.db.get(attempt.completedAccountId) : null;
			if (!account || account.connectionGeneration !== attempt.completedGeneration) return refused(409, "connection_changed");
			return (attempt.receiptExpiresAt ?? 0) > Date.now() ? { _yay: attempt } : refused(409, "start_again");
		}
		if (attempt.status !== "awaiting_finish") return refused(409, "start_again");
		if (attempt.expiresAt <= Date.now() || !await target_current(ctx, attempt)) {
			await gmail_close_attempt(ctx, attempt, "failed", "attempt_expired"); return refused(409, "start_again");
		}
		return { _yay: attempt };
	},
});

export const promote = internalMutation({
	args: { attemptId: v.id("oauth_states"), grantId: v.id("host_grants"), lifecycleRequestId: v.string(), finishCodeHash: v.string(), accountRefreshToken: v.string() },
	returns: v.union(failure, v.object({ _yay: v.object({ accountId: v.id("gmail_accounts"), connectionGeneration: v.number() }) })),
	handler: async (ctx, args) => {
		const attempt = await ctx.db.get(args.attemptId);
		if (attempt?.status === "finished" && attempt.finishCodeHash === args.finishCodeHash && (attempt.receiptExpiresAt ?? 0) > Date.now()) {
			const account = attempt.completedAccountId ? await ctx.db.get(attempt.completedAccountId) : null;
			return account && account.connectionGeneration === attempt.completedGeneration
				? { _yay: { accountId: account._id, connectionGeneration: account.connectionGeneration } } : refused(409, "connection_changed");
		}
		if (!attempt || attempt.status !== "awaiting_finish" || attempt.expiresAt <= Date.now() || attempt.finishCodeHash !== args.finishCodeHash
			|| attempt.grantId !== args.grantId || !attempt.stagedRefreshToken || !attempt.stagedEmailAddress || !await target_current(ctx, attempt)) return refused(409, "start_again");
		const grant = await ctx.db.get(args.grantId);
		if (!grant || grant.phase !== "awaiting_finish" || grant.attemptId !== attempt._id || grant.accountId !== null
			|| grant.lifecycleRequestId !== args.lifecycleRequestId || (grant.interactiveExpiresAt ?? 0) <= Date.now() || !grant.interactiveSecret
			|| !same_binding(attempt, grant)) return refused(409, "start_again");
		let account = attempt.accountId ? await ctx.db.get(attempt.accountId) : null;
		const duplicate = await ctx.db.query("gmail_accounts").withIndex("by_hostWorkspace_emailAddress", q => q.eq("hostWorkspaceId", attempt.workspaceId).eq("emailAddress", attempt.stagedEmailAddress!)).unique();
		if ((!account && duplicate) || (account && account.emailAddress !== attempt.stagedEmailAddress)) return refused(409, account ? "gmail_account_changed" : "choose_reconnect");
		if (!account || account.syncStatus === "disconnected") {
			let active = 0;
			for (const status of ["backfilling", "live", "blocked", "error"] as const) active += (await ctx.db.query("gmail_accounts").withIndex("by_syncStatus", q => q.eq("syncStatus", status)).take(maximumAccounts + 1)).length;
			if (active >= maximumAccounts) return refused(409, "account_capacity");
		}
		if (!account) {
			const base = `/emails/${gmail_slug(attempt.stagedEmailAddress)}`;
			let destinationPath = base;
			for (let suffix = 2; await ctx.db.query("gmail_accounts").withIndex("by_hostWorkspace_destinationPath", q => q.eq("hostWorkspaceId", attempt.workspaceId).eq("destinationPath", destinationPath)).first(); suffix++) destinationPath = `${base}-${suffix}`;
			const id = await ctx.db.insert("gmail_accounts", {
				hostOrganizationId: attempt.organizationId, hostWorkspaceId: attempt.workspaceId, hostInstallationId: attempt.installationId, hostActorUserId: attempt.actorUserId,
				provider: "gmail", emailAddress: attempt.stagedEmailAddress, destinationPath, googleRefreshToken: null,
				connectionGeneration: 0, connectRequestId: attempt._id, hostGrantId: null, historyId: null,
				syncStatus: "backfilling", syncError: null, sourceError: null, backfillPageToken: null, backfillPage: null, backfillComplete: false,
				historyPageToken: null, historyAnchor: null, historyPageSize: 25, nextSyncAt: null, permissionProbeNotBefore: null, temporaryFailures: 0,
				nextSliceKind: "backfill", messagesSynced: 0, messagesSkipped: 0,
				ledgerCounts: { pending: 0, done: 0, skipped: 0, failed: 0, given_up: 0, emailAssumed: 0, permissionHeld: 0 },
				attachmentsSkippedReason: null, syncWorkId: null, syncRequestId: null, lastSyncedAt: null, updatedAt: Date.now(),
			});
			account = (await ctx.db.get(id))!;
		}
		if (account.syncWorkId) await gmail_workpool.cancel(ctx, account.syncWorkId as WorkId);
		if (account.hostGrantId) {
			const old = await ctx.db.get(account.hostGrantId);
			if (old) await ctx.db.patch(old._id, { phase: "cancelled", sourceSecret: null, interactiveSecret: null, sealedSecret: null, nextAttemptAt: null });
		}
		const generation = account.connectionGeneration + 1;
		await ctx.db.patch(account._id, { hostInstallationId: attempt.installationId, hostActorUserId: attempt.actorUserId,
			googleRefreshToken: args.accountRefreshToken, connectionGeneration: generation, connectRequestId: null, hostGrantId: grant._id,
			historyId: null, syncStatus: "backfilling", syncError: null, sourceError: null, backfillPageToken: null, backfillPage: null, backfillComplete: false,
			historyPageToken: null, historyAnchor: null, historyPageSize: 25, nextSliceKind: "backfill", temporaryFailures: 0,
			nextSyncAt: null, syncWorkId: null, syncRequestId: null, lastSyncedAt: null, updatedAt: Date.now() });
		await ctx.db.patch(grant._id, { accountId: account._id, attemptId: null, connectionGeneration: generation, phase: "seal",
			destinationPath: account.destinationPath, sourceSecret: grant.interactiveSecret, lifecycleRequestId: gmail_random_secret(), nextAttemptAt: Date.now(), updatedAt: Date.now() });
		await ctx.db.patch(attempt._id, { status: "finished", stagedRefreshToken: null, stagedEmailAddress: null, stagedHistoryId: null,
			encryptedState: null, encryptedFinishCode: null, completedAccountId: account._id, completedGeneration: generation,
			receiptExpiresAt: Date.now() + 24 * 60 * 60_000, expiresAt: Date.now() + 24 * 60 * 60_000, updatedAt: Date.now() });
		await ctx.scheduler.runAfter(0, internal.gmail_grants.connect, { grantId: grant._id });
		return { _yay: { accountId: account._id, connectionGeneration: generation } };
	},
});

export async function gmail_finish(ctx: ActionCtx, actor: { organizationId: string; workspaceId: string; installationId: string; actorUserId: string }, input: { attemptId: string; finishCode: string }) {
	const finishCodeHash = await gmail_sha256(input.finishCode);
	const reserved = await ctx.runMutation(internal.gmail_oauth.reserve_finish, { ...actor, attemptId: input.attemptId, finishCodeHash });
	if ("_nay" in reserved) throw new gmail_PageError(reserved._nay.status, reserved._nay.code);
	const attempt: Doc<"oauth_states"> = reserved._yay;
	if (attempt.status === "finished") return { accountId: attempt.completedAccountId!, connectionGeneration: attempt.completedGeneration! };
	const grant: Doc<"host_grants"> | null = attempt.grantId ? await ctx.runQuery(internal.gmail_grants.get_current, { grantId: attempt.grantId }) : null;
	try {
		if (!grant || grant.phase !== "awaiting_finish" || !grant.interactiveSecret || (grant.interactiveExpiresAt ?? 0) <= Date.now()) throw new gmail_HostError(401, "grant_expired");
		const live = await gmail_verify_live(await gmail_decrypt(grant.interactiveSecret, `grant:${grant._id}:interactive`), attempt.installationId, "interactive", null);
		if (!live.contentPermissions.write) throw new gmail_HostError(403, "actor_lost");
	} catch (error) {
		if (error instanceof gmail_HostError && [401, 403, 404, 409].includes(error.status)) {
			await ctx.runMutation(internal.gmail_oauth.fail_attempt, { attemptId: attempt._id, error: "start_again", googleCodeHash: attempt.googleCodeHash });
			throw new gmail_PageError(409, "start_again");
		}
		throw new gmail_PageError(503, "service_unavailable");
	}
	if (!attempt.stagedRefreshToken || !attempt.stagedEmailAddress) throw new gmail_PageError(409, "start_again");
	const refreshToken = await gmail_decrypt(attempt.stagedRefreshToken, `attempt:${attempt._id}:google-refresh`);
	const promoted = await ctx.runMutation(internal.gmail_oauth.promote, { attemptId: attempt._id, grantId: grant!._id,
		lifecycleRequestId: grant!.lifecycleRequestId, finishCodeHash,
		accountRefreshToken: await gmail_encrypt(refreshToken, gmail_google_token_purpose(attempt.organizationId, attempt.workspaceId, attempt.stagedEmailAddress)) });
	if ("_nay" in promoted) {
		if (["start_again", "choose_reconnect", "gmail_account_changed"].includes(promoted._nay.code)) await ctx.runMutation(internal.gmail_oauth.fail_attempt, { attemptId: attempt._id, error: promoted._nay.code, googleCodeHash: attempt.googleCodeHash });
		throw new gmail_PageError(promoted._nay.status, promoted._nay.code);
	}
	return promoted._yay;
}

export const cancel = internalMutation({
	args: { ...gmail_host_binding, attemptId: v.string() }, returns: v.union(failure, v.object({ _yay: v.null() })),
	handler: async (ctx, args) => {
		const id = ctx.db.normalizeId("oauth_states", args.attemptId);
		const attempt = id ? await ctx.db.get(id) : null;
		if (!attempt || !same_binding(attempt, args)) return refused(404, "attempt_not_found");
		if (attempt.status === "finished") return refused(409, "connection_finished");
		await gmail_close_attempt(ctx, attempt, "cancelled", "cancelled");
		return { _yay: null };
	},
});

export const cleanup = internalMutation({
	args: {}, returns: v.null(),
	handler: async ctx => {
		await gmail_cleanup_page_rows(ctx);
		for (const attempt of await ctx.db.query("oauth_states").withIndex("by_status_processingDeadline", q =>
			q.eq("status", "exchanging").gt("processingDeadline", null).lte("processingDeadline", Date.now())).take(25)) {
			await gmail_close_attempt(ctx, attempt, "failed", "exchange_interrupted");
		}
		for (const attempt of await ctx.db.query("oauth_states").withIndex("by_expiresAt", q => q.lte("expiresAt", Date.now())).take(25)) {
			await gmail_close_attempt(ctx, attempt, "failed", "attempt_expired");
			await ctx.db.delete(attempt._id);
		}
		return null;
	},
});
