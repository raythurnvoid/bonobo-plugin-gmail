import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { doc } from "convex-helpers/validators";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery, type ActionCtx, type MutationCtx, type QueryCtx } from "./_generated/server";
import schema, { gmail_host_binding } from "./schema";
import { gmail_PageError, gmail_rate_limit } from "./gmail_page";

type Actor = { organizationId: string; workspaceId: string; installationId: string; actorUserId: string };

const failure = v.object({ _nay: v.object({ status: v.number(), code: v.string() }) });
const target_validator = v.object({ accountId: v.id("gmail_accounts"), emailAddress: v.string(), refreshToken: v.string(),
	draft: v.union(doc(schema, "gmail_drafts"), v.null()) });
const listed_draft = v.object({ clientDraftId: v.string(), to: v.array(v.string()), cc: v.array(v.string()), subject: v.string(),
	isReply: v.boolean(), saving: v.boolean(), agentEditedAt: v.union(v.number(), v.null()), updatedAt: v.number() });
// Per member and account, per hour. Autosave runs 10 seconds after typing stops, so 300 writes is a long session.
const hourly_limits = { read: 600, write: 300, send: 20 };

function refused(status: number, code: string) { return { _nay: { status, code } }; }

async function compose_account(ctx: QueryCtx | MutationCtx, args: Actor & { accountId: string }) {
	const id = ctx.db.normalizeId("gmail_accounts", args.accountId);
	const account = id ? await ctx.db.get(id) : null;
	if (!account || account.hostOrganizationId !== args.organizationId || account.hostWorkspaceId !== args.workspaceId) return refused(404, "account_not_found");
	// Only the member who connected the account, in this installation, writes drafts and sends for it.
	if (account.hostActorUserId !== args.actorUserId || account.hostInstallationId !== args.installationId) return refused(403, "not_composer");
	if (account.syncStatus === "disconnected" || !account.googleRefreshToken) return refused(409, "google_reconnect_needed");
	if (account.composeGranted !== true) return refused(403, "compose_not_granted");
	return { _yay: account };
}

async function own_draft(ctx: QueryCtx | MutationCtx, accountId: Id<"gmail_accounts">, actorUserId: string, clientDraftId: string) {
	const draft = await ctx.db.query("gmail_drafts").withIndex("by_account_clientDraftId", q => q.eq("accountId", accountId).eq("clientDraftId", clientDraftId)).unique();
	// After a Reconnect by another member, the old member's rows stay hidden from the new one.
	return draft && draft.hostActorUserId === actorUserId ? draft : null;
}

export const list = internalQuery({
	args: { ...gmail_host_binding, accountId: v.string(), paginationOpts: paginationOptsValidator },
	returns: v.union(failure, v.object({ _yay: v.object({ drafts: v.array(listed_draft), cursor: v.union(v.string(), v.null()) }) })),
	handler: async (ctx, args) => {
		const target = await compose_account(ctx, args);
		if ("_nay" in target) return target;
		const page = await ctx.db.query("gmail_drafts").withIndex("by_account_actor_updatedAt", q => q.eq("accountId", target._yay._id).eq("hostActorUserId", args.actorUserId))
			.order("desc").paginate(args.paginationOpts);
		return { _yay: { cursor: page.isDone ? null : page.continueCursor, drafts: page.page.map(draft => ({
			clientDraftId: draft.clientDraftId, to: draft.to, cc: draft.cc, subject: draft.subject, isReply: draft.replyTo !== null,
			saving: draft.gmailDraftId === null, agentEditedAt: draft.agentEditedAt, updatedAt: draft.updatedAt })) } };
	},
});

export const begin = internalMutation({
	args: { ...gmail_host_binding, accountId: v.string(), clientDraftId: v.string(), kind: v.union(v.literal("read"), v.literal("write"), v.literal("send")) },
	returns: v.union(failure, v.object({ _yay: target_validator })),
	handler: async (ctx, args) => {
		const target = await compose_account(ctx, args);
		if ("_nay" in target) return target;
		const account = target._yay;
		if (!await gmail_rate_limit(ctx, `drafts-${args.kind}:${args.actorUserId}:${account._id}`, 60 * 60_000, hourly_limits[args.kind])) return refused(429, "rate_limited");
		return { _yay: { accountId: account._id, emailAddress: account.emailAddress, refreshToken: account.googleRefreshToken!,
			draft: await own_draft(ctx, account._id, args.actorUserId, args.clientDraftId) } };
	},
});

export const reserve_create = internalMutation({
	args: { accountId: v.id("gmail_accounts"), actorUserId: v.string(), clientDraftId: v.string(), to: v.array(v.string()), cc: v.array(v.string()),
		subject: v.string(), replyTo: schema.tables.gmail_drafts.validator.fields.replyTo, byAgent: v.boolean() },
	returns: v.union(v.id("gmail_drafts"), v.null()),
	handler: async (ctx, args) => {
		const existing = await ctx.db.query("gmail_drafts").withIndex("by_account_clientDraftId", q => q.eq("accountId", args.accountId).eq("clientDraftId", args.clientDraftId)).unique();
		// A page tool can run twice. The second create finds the first row and makes no second Gmail draft.
		if (existing) return null;
		const now = Date.now();
		const draftId = await ctx.db.insert("gmail_drafts", { accountId: args.accountId, hostActorUserId: args.actorUserId, clientDraftId: args.clientDraftId,
			gmailDraftId: null, to: args.to, cc: args.cc, subject: args.subject, replyTo: args.replyTo,
			agentEditedAt: args.byAgent ? now : null, createdAt: now, updatedAt: now });
		// If the create action crashes before it saves or drops this row, the row would stay "saving" forever.
		// The Gmail call times out after 20 seconds, so a row still saving after 5 minutes is stuck.
		await ctx.scheduler.runAfter(5 * 60_000, internal.gmail_drafts.drop_if_saving, { draftId });
		return draftId;
	},
});

export const save_row = internalMutation({
	args: { draftId: v.id("gmail_drafts"), gmailDraftId: v.string(), to: v.array(v.string()), cc: v.array(v.string()), subject: v.string(), byAgent: v.boolean() },
	returns: v.null(),
	handler: async (ctx, args) => {
		const draft = await ctx.db.get(args.draftId);
		if (!draft) return null;
		await ctx.db.patch(draft._id, { gmailDraftId: args.gmailDraftId, to: args.to, cc: args.cc, subject: args.subject,
			...(args.byAgent ? { agentEditedAt: Date.now() } : {}), updatedAt: Date.now() });
		return null;
	},
});

export const drop_row = internalMutation({
	args: { draftId: v.id("gmail_drafts") }, returns: v.null(),
	handler: async (ctx, args) => {
		if (await ctx.db.get(args.draftId)) await ctx.db.delete(args.draftId);
		return null;
	},
});

export const drop_if_saving = internalMutation({
	args: { draftId: v.id("gmail_drafts") }, returns: v.null(),
	handler: async (ctx, args) => {
		const draft = await ctx.db.get(args.draftId);
		if (draft && draft.gmailDraftId === null) await ctx.db.delete(draft._id);
		return null;
	},
});

export const compose_lost = internalMutation({
	args: { accountId: v.id("gmail_accounts"), refreshToken: v.string() }, returns: v.null(),
	handler: async (ctx, args) => {
		const account = await ctx.db.get(args.accountId);
		// Change only the token this call used. A new grant may have saved a new token in the meantime.
		if (account?.googleRefreshToken === args.refreshToken) await ctx.db.patch(account._id, { composeGranted: false });
		return null;
	},
});

export async function gmail_drafts_list(ctx: ActionCtx, actor: Actor, input: { accountId: string; cursor: string | null }) {
	const result = await ctx.runQuery(internal.gmail_drafts.list, { ...actor, accountId: input.accountId, paginationOpts: { numItems: 25, cursor: input.cursor } });
	if ("_nay" in result) throw new gmail_PageError(result._nay.status, result._nay.code);
	return result._yay;
}

