import { z } from "zod";
import { v } from "convex/values";
import { doc } from "convex-helpers/validators";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { internalAction, internalMutation, internalQuery, type ActionCtx, type MutationCtx, type QueryCtx } from "./_generated/server";
import schema from "./schema";
import { gmail_decrypt, gmail_encrypt, gmail_random_secret } from "./gmail_secrets";
import { gmail_grant_response, gmail_HostError, press_post } from "./press";
import { gmail_verify_live } from "./gmail_page";

const token_response = z.object({ token: z.string().regex(/^psg_[0-9a-f]{64}$/), expiresAt: z.number().positive(), scopes: z.array(z.string()) });
const active_phase = v.union(v.literal("exchange"), v.literal("renew"), v.literal("seal"));

async function current_grant(ctx: QueryCtx | MutationCtx, grantId: Id<"host_grants">) {
	const grant = await ctx.db.get(grantId);
	if (!grant || grant.phase === "cancelled") return null;
	if (grant.accountId) {
		const account = await ctx.db.get(grant.accountId);
		if (!account || account.syncStatus === "disconnected" || account.hostGrantId !== grant._id
			|| account.connectionGeneration !== grant.connectionGeneration || account.hostInstallationId !== grant.installationId
			|| account.hostActorUserId !== grant.actorUserId || account.hostOrganizationId !== grant.organizationId
			|| account.hostWorkspaceId !== grant.workspaceId || account.destinationPath !== grant.destinationPath) return null;
	} else if (grant.attemptId) {
		const attempt = await ctx.db.get(grant.attemptId);
		if (!attempt || attempt.grantId !== grant._id || attempt.expiresAt <= Date.now()
			|| ["finished", "failed", "cancelled"].includes(attempt.status)) return null;
		if (attempt.accountId) {
			const target = await ctx.db.get(attempt.accountId);
			if (!target || target.connectRequestId !== attempt._id || target.connectionGeneration !== attempt.expectedGeneration) return null;
		}
	} else return null;
	return grant;
}

export const get_current = internalQuery({
	args: { grantId: v.id("host_grants") }, returns: v.union(doc(schema, "host_grants"), v.null()),
	handler: async (ctx, args) => current_grant(ctx, args.grantId),
});

export const save_step = internalMutation({
	args: { grantId: v.id("host_grants"), lifecycleRequestId: v.string(), phase: active_phase, secret: v.string(), expiresAt: v.number() },
	returns: v.boolean(),
	handler: async (ctx, args) => {
		const grant = await current_grant(ctx, args.grantId);
		if (!grant || grant.lifecycleRequestId !== args.lifecycleRequestId || grant.phase !== args.phase || args.expiresAt <= Date.now()) return false;
		if (args.phase === "seal") {
			if (!grant.accountId) return false;
			const account = (await ctx.db.get(grant.accountId))!;
			await ctx.db.patch(grant._id, { phase: "ready", sealedSecret: args.secret, sealedExpiresAt: args.expiresAt,
				sourceSecret: null, nextAttemptAt: Date.now() + 12 * 60 * 60_000, temporaryFailures: 0, error: null, updatedAt: Date.now() });
			let nextSyncAt: number | null = Date.now();
			if (account.sourceError) {
				const rows = await Promise.all([false, true].map(permissionHeld => ctx.db.query("messages_ledger")
					.withIndex("by_account_permissionHeld_settlementNeeded_nextAttemptAt", q => q.eq("accountId", account._id)
						.eq("permissionHeld", permissionHeld).eq("settlementNeeded", true).gt("nextAttemptAt", null)).first()));
				const times = rows.flatMap((row, index) => row?.nextAttemptAt !== null && row?.nextAttemptAt !== undefined
					? [Math.max(row.nextAttemptAt, index === 1 ? account.permissionProbeNotBefore ?? 0 : 0)] : []);
				nextSyncAt = times.length ? Math.min(...times) : null;
			}
			await ctx.db.patch(account._id, { nextSyncAt, syncError: account.sourceError,
				syncStatus: account.sourceError ? "error" : account.backfillComplete ? "live" : "backfilling", updatedAt: Date.now() });
			await ctx.scheduler.runAfter(12 * 60 * 60_000, internal.gmail_grants.renew, { grantId: grant._id, lifecycleRequestId: grant.lifecycleRequestId });
		} else {
			const pending = args.phase === "exchange" && grant.attemptId !== null;
			await ctx.db.patch(grant._id, { phase: pending ? "awaiting_finish" : "seal", interactiveSecret: args.secret, interactiveExpiresAt: args.expiresAt,
				sourceSecret: args.secret, lifecycleRequestId: gmail_random_secret(), nextAttemptAt: pending ? null : Date.now(),
				temporaryFailures: 0, error: null, updatedAt: Date.now() });
			if (pending) {
				const attempt = (await ctx.db.get(grant.attemptId!))!;
				if (attempt.status === "preparing") await ctx.db.patch(attempt._id, { status: "pending", expiresAt: Date.now() + 10 * 60_000, updatedAt: Date.now() });
			} else await ctx.scheduler.runAfter(0, internal.gmail_grants.connect, { grantId: grant._id });
		}
		return true;
	},
});

export const save_error = internalMutation({
	args: { grantId: v.id("host_grants"), lifecycleRequestId: v.string(), temporary: v.boolean(), reason: v.string() }, returns: v.null(),
	handler: async (ctx, args) => {
		const grant = await current_grant(ctx, args.grantId);
		if (!grant || grant.lifecycleRequestId !== args.lifecycleRequestId || !["exchange", "renew", "seal"].includes(grant.phase)) return null;
		const failures = grant.temporaryFailures + 1;
		const due = args.temporary ? Date.now() + Math.min(20 * 60_000, 60_000 * 2 ** Math.min(failures - 1, 5)) : null;
		await ctx.db.patch(grant._id, { phase: args.temporary ? grant.phase : "blocked", nextAttemptAt: due,
			temporaryFailures: failures, error: args.reason, updatedAt: Date.now() });
		if (grant.accountId) {
			await ctx.db.patch(grant.accountId, { nextSyncAt: null, syncStatus: "blocked", syncError: args.temporary ? "press_temporary" : args.reason, updatedAt: Date.now() });
		}
		return null;
	},
});

export const renew = internalMutation({
	args: { grantId: v.id("host_grants"), lifecycleRequestId: v.string() }, returns: v.null(),
	handler: async (ctx, args) => {
		const grant = await current_grant(ctx, args.grantId);
		if (!grant || grant.phase !== "ready" || grant.lifecycleRequestId !== args.lifecycleRequestId) return null;
		if (!grant.interactiveSecret || !grant.interactiveExpiresAt || grant.interactiveExpiresAt <= Date.now()) {
			await ctx.db.patch(grant._id, { phase: "blocked", error: "press_reconnect_needed", nextAttemptAt: null, updatedAt: Date.now() });
			if (grant.accountId) await ctx.db.patch(grant.accountId, { syncStatus: "blocked", syncError: "press_reconnect_needed", nextSyncAt: null });
			return null;
		}
		await ctx.db.patch(grant._id, { phase: "renew", sourceSecret: grant.interactiveSecret,
			lifecycleRequestId: gmail_random_secret(), nextAttemptAt: Date.now(), updatedAt: Date.now() });
		await ctx.scheduler.runAfter(0, internal.gmail_grants.connect, { grantId: grant._id });
		return null;
	},
});

export async function gmail_grant_step(ctx: ActionCtx, grantId: Id<"host_grants">) {
	const grant: Doc<"host_grants"> | null = await ctx.runQuery(internal.gmail_grants.get_current, { grantId });
	if (!grant || !["exchange", "renew", "seal"].includes(grant.phase) || !grant.sourceSecret) return;
	const operation = grant.phase as "exchange" | "renew" | "seal";
	try {
		const source = await gmail_decrypt(grant.sourceSecret, `grant:${grant._id}:${operation === "exchange" ? "source" : "interactive"}`);
		const body = { requestId: grant.lifecycleRequestId, ...(operation === "seal" ? { destinationPathPrefix: grant.destinationPath! } : {}) };
		let response = await press_post("/api/v1/plugins/service-grants/recover", { operation, ...body }, source);
		if (response.status === 404) {
			// A second guard covers a replaced chain during the recovery request.
			const current: Doc<"host_grants"> | null = await ctx.runQuery(internal.gmail_grants.get_current, { grantId });
			if (!current || current.lifecycleRequestId !== grant.lifecycleRequestId || current.phase !== operation) return;
			response = await press_post(`/api/v1/plugins/service-grants/${operation === "seal" ? "seal-processing" : operation}`, body, source);
		}
		if (response.status !== 200) throw new gmail_HostError(response.status, "grant_refused");
		const parsed = (operation === "renew" ? token_response : gmail_grant_response).safeParse(response.body);
		if (!parsed.success || parsed.data.expiresAt <= Date.now()) throw new gmail_HostError(502, "invalid_response");
		if (operation !== "renew") {
			const bound = gmail_grant_response.parse(response.body);
			if (bound.actorUserId !== grant.actorUserId || bound.installationId !== grant.installationId
				|| bound.organizationId !== grant.organizationId || bound.workspaceId !== grant.workspaceId) throw new gmail_HostError(409, "grant_mismatch");
		}
		const phase = operation === "seal" ? "processing" : "interactive";
		const current: Doc<"host_grants"> | null = await ctx.runQuery(internal.gmail_grants.get_current, { grantId });
		if (!current || current.lifecycleRequestId !== grant.lifecycleRequestId || current.phase !== operation) return;
		const live = await gmail_verify_live(parsed.data.token, grant.installationId, phase, operation === "seal" ? grant.destinationPath : null);
		if (!live.contentPermissions.write) throw new gmail_HostError(403, "actor_lost");
		await ctx.runMutation(internal.gmail_grants.save_step, { grantId, lifecycleRequestId: grant.lifecycleRequestId, phase: operation,
			secret: await gmail_encrypt(parsed.data.token, `grant:${grant._id}:${operation === "seal" ? "sealed" : "interactive"}`), expiresAt: parsed.data.expiresAt });
	} catch (error) {
		const temporary = !(error instanceof gmail_HostError) || error.status === 429 || error.status >= 500;
		await ctx.runMutation(internal.gmail_grants.save_error, { grantId, lifecycleRequestId: grant.lifecycleRequestId, temporary,
			reason: temporary ? "press_temporary" : error instanceof gmail_HostError && error.status === 403 ? "actor_lost" : "press_reconnect_needed" });
	}
}

export const connect = internalAction({
	args: { grantId: v.id("host_grants") }, returns: v.null(),
	handler: async (ctx, args) => { await gmail_grant_step(ctx, args.grantId); return null; },
});

export const sweep = internalMutation({
	args: {}, returns: v.null(),
	handler: async ctx => {
		for (const phase of ["exchange", "renew", "seal", "ready"] as const) {
			const grants = await ctx.db.query("host_grants").withIndex("by_phase_nextAttemptAt", q => q.eq("phase", phase).gt("nextAttemptAt", null).lte("nextAttemptAt", Date.now())).take(25);
			for (const row of grants) {
				const grant = await current_grant(ctx, row._id);
				if (!grant) { await ctx.db.patch(row._id, { phase: "cancelled", sourceSecret: null, interactiveSecret: null, sealedSecret: null, nextAttemptAt: null }); continue; }
				await ctx.db.patch(grant._id, { nextAttemptAt: Date.now() + 2 * 60_000 });
				if (phase === "ready") await ctx.scheduler.runAfter(0, internal.gmail_grants.renew, { grantId: grant._id, lifecycleRequestId: grant.lifecycleRequestId });
				else await ctx.scheduler.runAfter(0, internal.gmail_grants.connect, { grantId: grant._id });
			}
		}
		return null;
	},
});
