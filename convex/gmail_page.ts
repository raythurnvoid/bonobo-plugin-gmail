import { z } from "zod";
import { v } from "convex/values";
import { doc } from "convex-helpers/validators";
import { internal } from "./_generated/api";
import { internalMutation, internalQuery, type ActionCtx, type MutationCtx } from "./_generated/server";
import schema, { gmail_host_binding } from "./schema";
import { gmail_decrypt, gmail_encrypt, gmail_random_secret, gmail_sha256 } from "./gmail_secrets";
import { gmail_grant_response, gmail_HostError, gmail_host_post, press_post } from "./press";

export const gmail_live_response = z.object({
	installationId: z.string(), phase: z.enum(["interactive", "processing"]), destinationPathPrefix: z.string().nullable(),
	scopes: z.array(z.string()), expiresAt: z.number(), contentPermissions: z.object({ read: z.boolean(), write: z.boolean() }),
});

export class gmail_PageError extends Error {
	constructor(public readonly status: number, public readonly code: string) { super(code); }
}

export async function gmail_rate_limit(ctx: MutationCtx, key: string, size: number, maximum: number) {
	const now = Date.now();
	const window = Math.floor(now / size);
	const row = await ctx.db.query("request_limits").withIndex("by_key_window", q => q.eq("key", key).eq("window", window)).unique();
	if (row && row.count >= maximum) return false;
	if (row) await ctx.db.patch(row._id, { count: row.count + 1 });
	else await ctx.db.insert("request_limits", { key, window, count: 1, expiresAt: (window + 2) * size });
	return true;
}

export const get_cache = internalQuery({
	args: { tokenHash: v.string() }, returns: v.union(doc(schema, "page_tokens"), v.null()),
	handler: async (ctx, args) => ctx.db.query("page_tokens").withIndex("by_tokenHash", q => q.eq("tokenHash", args.tokenHash)).unique(),
});

export const prepare_cache = internalMutation({
	args: { tokenHash: v.string(), exchangeRequestId: v.string() },
	returns: v.union(doc(schema, "page_tokens"), v.null()),
	handler: async (ctx, args) => {
		const existing = await ctx.db.query("page_tokens").withIndex("by_tokenHash", q => q.eq("tokenHash", args.tokenHash)).unique();
		if (existing && existing.expiresAt > Date.now()) return existing;
		if (!await gmail_rate_limit(ctx, "page-exchange-deployment", 60_000, 100)
			|| !await gmail_rate_limit(ctx, `page-exchange:${args.tokenHash}`, 60_000, 10)) return null;
		if (existing) await ctx.db.delete(existing._id);
		const id = await ctx.db.insert("page_tokens", {
			...args, sourceSecret: null, grantSecret: null, organizationId: null, workspaceId: null, installationId: null, actorUserId: null,
			expiresAt: Date.now() + 30 * 60_000, exchangeStartedAt: Date.now(), verifiedAt: null, canRead: false, canWrite: false,
		});
		return ctx.db.get(id);
	},
});

export const save_cache_source = internalMutation({
	args: { id: v.id("page_tokens"), exchangeRequestId: v.string(), sourceSecret: v.string() }, returns: v.boolean(),
	handler: async (ctx, args) => {
		const row = await ctx.db.get(args.id);
		if (!row || row.exchangeRequestId !== args.exchangeRequestId || row.expiresAt <= Date.now()) return false;
		if (!row.sourceSecret && !row.grantSecret) await ctx.db.patch(row._id, { sourceSecret: args.sourceSecret });
		return true;
	},
});

export const reserve_cache_exchange = internalMutation({
	args: { tokenHash: v.string() }, returns: v.boolean(),
	handler: async (ctx, args) => await gmail_rate_limit(ctx, "page-exchange-attempt-deployment", 60_000, 100)
		&& await gmail_rate_limit(ctx, `page-exchange-attempt:${args.tokenHash}`, 60_000, 10),
});

export const save_cache = internalMutation({
	args: { id: v.id("page_tokens"), exchangeRequestId: v.string(), grantSecret: v.string(), ...gmail_host_binding,
		expiresAt: v.number(), canRead: v.boolean(), canWrite: v.boolean() },
	returns: v.boolean(),
	handler: async (ctx, args) => {
		const row = await ctx.db.get(args.id);
		if (!row || row.exchangeRequestId !== args.exchangeRequestId || row.expiresAt <= Date.now()) return false;
		const { id: _id, exchangeRequestId: _requestId, ...patch } = args;
		await ctx.db.patch(row._id, { ...patch, expiresAt: Math.min(args.expiresAt, row.exchangeStartedAt + 30 * 60_000), verifiedAt: Date.now(), sourceSecret: null });
		return true;
	},
});

export const touch_cache = internalMutation({
	args: { id: v.id("page_tokens"), exchangeRequestId: v.string(), canRead: v.boolean(), canWrite: v.boolean() }, returns: v.boolean(),
	handler: async (ctx, args) => {
		const row = await ctx.db.get(args.id);
		if (!row || row.exchangeRequestId !== args.exchangeRequestId || row.expiresAt <= Date.now()) return false;
		await ctx.db.patch(row._id, { verifiedAt: Date.now(), canRead: args.canRead, canWrite: args.canWrite });
		return true;
	},
});

export const drop_cache = internalMutation({
	args: { id: v.id("page_tokens"), exchangeRequestId: v.string() }, returns: v.null(),
	handler: async (ctx, args) => {
		const row = await ctx.db.get(args.id);
		if (row?.exchangeRequestId === args.exchangeRequestId) await ctx.db.delete(row._id);
		return null;
	},
});

export async function gmail_verify_live(token: string, installationId: string, phase: "interactive" | "processing", destinationPathPrefix: string | null) {
	const live = await gmail_host_post("/api/v1/plugins/service-grants/verify-live", {
		installationId, phase, destinationPathPrefix, scopes: phase === "processing" ? ["files:write"] : [],
	}, token, gmail_live_response);
	if (live.installationId !== installationId || live.phase !== phase || live.destinationPathPrefix !== destinationPathPrefix
		|| live.expiresAt <= Date.now() || (phase === "processing" && !live.scopes.includes("files:write"))) {
		throw new gmail_HostError(409, "grant_mismatch");
	}
	return live;
}

export async function gmail_page_auth(ctx: ActionCtx, token: string, changing: boolean) {
	if (!/^plu_[0-9a-f]{64}$/.test(token)) throw new gmail_PageError(401, "press_access_changed");
	const tokenHash = await gmail_sha256(token);
	let cached = await ctx.runQuery(internal.gmail_page.get_cache, { tokenHash });
	if (!cached || cached.expiresAt <= Date.now()) {
		cached = await ctx.runMutation(internal.gmail_page.prepare_cache, { tokenHash, exchangeRequestId: gmail_random_secret() });
		if (!cached) throw new gmail_PageError(429, "rate_limited");
	}
	if (!cached.grantSecret) {
		if (!await ctx.runMutation(internal.gmail_page.reserve_cache_exchange, { tokenHash })) throw new gmail_PageError(429, "rate_limited");
		const sourcePurpose = `page:${cached._id}:source`;
		if (!await ctx.runMutation(internal.gmail_page.save_cache_source, {
			id: cached._id, exchangeRequestId: cached.exchangeRequestId, sourceSecret: await gmail_encrypt(token, sourcePurpose),
		})) throw new gmail_PageError(401, "press_access_changed");
		// Recover with the saved request before exchange; never mint another cache grant on a lost answer.
		const recovered = await press_post("/api/v1/plugins/service-grants/recover", { operation: "exchange", requestId: cached.exchangeRequestId }, token);
		let grant: z.infer<typeof gmail_grant_response>;
		if (recovered.status === 200) {
			const parsed = gmail_grant_response.safeParse(recovered.body);
			if (!parsed.success) throw new gmail_HostError(502, "invalid_response");
			grant = parsed.data;
		} else if (recovered.status === 404) {
			grant = await gmail_host_post("/api/v1/plugins/service-grants/exchange", { requestId: cached.exchangeRequestId }, token, gmail_grant_response);
		} else throw new gmail_HostError(recovered.status, "page_exchange_failed");
		const live = await gmail_verify_live(grant.token, grant.installationId, "interactive", null);
		if (!live.contentPermissions.read) throw new gmail_PageError(403, "page_read_refused");
		if (!await ctx.runMutation(internal.gmail_page.save_cache, {
			id: cached._id, exchangeRequestId: cached.exchangeRequestId,
			organizationId: grant.organizationId, workspaceId: grant.workspaceId, installationId: grant.installationId, actorUserId: grant.actorUserId,
			grantSecret: await gmail_encrypt(grant.token, `page:${cached._id}:grant`), expiresAt: Math.min(grant.expiresAt, live.expiresAt),
			canRead: live.contentPermissions.read, canWrite: live.contentPermissions.write,
		})) throw new gmail_PageError(401, "press_access_changed");
		cached = await ctx.runQuery(internal.gmail_page.get_cache, { tokenHash });
	}
	if (!cached?.grantSecret || !cached.organizationId || !cached.workspaceId || !cached.installationId || !cached.actorUserId) {
		throw new gmail_PageError(401, "press_access_changed");
	}
	let grantToken: string;
	try { grantToken = await gmail_decrypt(cached.grantSecret, `page:${cached._id}:grant`); }
	catch {
		await ctx.runMutation(internal.gmail_page.drop_cache, { id: cached._id, exchangeRequestId: cached.exchangeRequestId });
		throw new gmail_PageError(401, "press_access_changed");
	}
	let permissions = { read: cached.canRead, write: cached.canWrite };
	if (changing || cached.verifiedAt === null || cached.verifiedAt + 60_000 <= Date.now()) {
		try {
			const live = await gmail_verify_live(grantToken, cached.installationId, "interactive", null);
			permissions = live.contentPermissions;
			if (!permissions.read) throw new gmail_HostError(403, "page_read_refused");
			if (!await ctx.runMutation(internal.gmail_page.touch_cache, {
				id: cached._id, exchangeRequestId: cached.exchangeRequestId, canRead: permissions.read, canWrite: permissions.write,
			})) throw new gmail_PageError(401, "press_access_changed");
		} catch (error) {
			if (error instanceof gmail_HostError && [401, 403, 404, 409].includes(error.status)) {
				await ctx.runMutation(internal.gmail_page.drop_cache, { id: cached._id, exchangeRequestId: cached.exchangeRequestId });
				throw new gmail_PageError(401, "press_access_changed");
			}
			throw error;
		}
	}
	if (changing && !permissions.write) throw new gmail_PageError(403, "page_write_refused");
	return { organizationId: cached.organizationId, workspaceId: cached.workspaceId, installationId: cached.installationId, actorUserId: cached.actorUserId, canWrite: permissions.write };
}

export async function gmail_cleanup_page_rows(ctx: MutationCtx) {
	for (const row of await ctx.db.query("page_tokens").withIndex("by_expiresAt", q => q.lte("expiresAt", Date.now())).take(25)) await ctx.db.delete(row._id);
	for (const row of await ctx.db.query("request_limits").withIndex("by_expiresAt", q => q.lte("expiresAt", Date.now())).take(25)) await ctx.db.delete(row._id);
}
