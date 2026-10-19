"use node";

// Gmail draft calls. They run in Node because the email codec uses Buffer. Page errors come back as values,
// because an error thrown in an action loses its status and code on the way to the HTTP route.
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { internalAction, type ActionCtx } from "./_generated/server";
import { gmail_host_binding } from "./schema";
import { gmail_decrypt, gmail_google_token_purpose } from "./gmail_secrets";
import { gmail_PageError } from "./gmail_page";
import { gmail_GoogleError, gmail_google_get, gmail_google_token, gmail_google_write } from "./gmail_google";
import { GMAIL_BODY_BYTES, gmail_ContentError, gmail_body_text, gmail_decode_base64, gmail_discover_message } from "../shared/gmail-codec";
import { gmail_ComposeError, gmail_compose_raw, type gmail_DraftFields, type gmail_ReplyHeaders } from "../shared/gmail-compose";

type Actor = { organizationId: string; workspaceId: string; installationId: string; actorUserId: string };
type Target = { accountId: Id<"gmail_accounts">; emailAddress: string; refreshToken: string; draft: Doc<"gmail_drafts"> | null };

const failure = v.object({ _nay: v.object({ status: v.number(), code: v.string() }) });
const draft_fields = v.object({ to: v.array(v.string()), cc: v.array(v.string()), subject: v.string(), body: v.string() });
const draft_response = z.object({ id: z.string().min(1), message: z.object({ id: z.string(), threadId: z.string().optional() }) });
const parent_response = z.object({ id: z.string(), threadId: z.string(),
	payload: z.object({ headers: z.array(z.object({ name: z.string(), value: z.string() })).max(1000).optional().default([]) }) });

async function start(ctx: ActionCtx, actor: Actor, accountId: string, clientDraftId: string, kind: "read" | "write" | "send") {
	const result = await ctx.runMutation(internal.gmail_drafts.begin, { ...actor, accountId, clientDraftId, kind });
	if ("_nay" in result) throw new gmail_PageError(result._nay.status, result._nay.code);
	return result._yay;
}

function saved_draft(target: Target) {
	if (!target.draft) throw new gmail_PageError(404, "draft_gone");
	if (!target.draft.gmailDraftId) throw new gmail_PageError(409, "draft_saving");
	return { draft: target.draft, gmailDraftId: target.draft.gmailDraftId };
}

async function access_token(ctx: ActionCtx, actor: Actor, target: Target) {
	const refreshToken = await gmail_decrypt(target.refreshToken, gmail_google_token_purpose(actor.organizationId, actor.workspaceId, target.emailAddress));
	const token = await gmail_call(ctx, target, () => gmail_google_token({ refreshToken }));
	// The user can remove the compose permission in their Google account at any time.
	if (!token.composeGranted) {
		await ctx.runMutation(internal.gmail_drafts.compose_lost, { accountId: target.accountId, refreshToken: target.refreshToken });
		throw new gmail_PageError(403, "compose_not_granted");
	}
	return token.access_token;
}

/**
 * Turn Google and compose errors into page codes. A Gmail 404 for a draft means it was sent or deleted in Gmail, so its row goes too.
 */
async function gmail_call<T>(ctx: ActionCtx, target: Target, run: () => Promise<T>) {
	try {
		return await run();
	} catch (error) {
		if (error instanceof gmail_ComposeError) throw new gmail_PageError(400, error.code);
		if (!(error instanceof gmail_GoogleError)) throw error;
		if (error.code === "compose_not_granted") {
			await ctx.runMutation(internal.gmail_drafts.compose_lost, { accountId: target.accountId, refreshToken: target.refreshToken });
			throw new gmail_PageError(403, "compose_not_granted");
		}
		if (error.code === "google_revoked") throw new gmail_PageError(409, "google_reconnect_needed");
		if (error.status === 404 && target.draft) {
			await ctx.runMutation(internal.gmail_drafts.drop_row, { draftId: target.draft._id });
			throw new gmail_PageError(404, "draft_gone");
		}
		// Without a draft row, the only read that can answer 404 is the email a new reply answers.
		if (error.status === 404) throw new gmail_PageError(404, "email_not_found");
		throw error.code === "gmail_temporary" ? new gmail_PageError(503, "gmail_busy") : new gmail_PageError(502, "gmail_refused");
	}
}

function reply_headers(draft: Doc<"gmail_drafts">): gmail_ReplyHeaders | null {
	return draft.replyTo && { gmailThreadId: draft.replyTo.gmailThreadId, messageIdHeader: draft.replyTo.messageIdHeader, referencesHeader: draft.replyTo.referencesHeader };
}

function gmail_message(raw: string, reply: gmail_ReplyHeaders | null) {
	return { raw, ...(reply ? { threadId: reply.gmailThreadId } : {}) };
}

async function draft_get(ctx: ActionCtx, actor: Actor, input: { accountId: string; clientDraftId: string }) {
	const target = await start(ctx, actor, input.accountId, input.clientDraftId, "read");
	const { draft, gmailDraftId } = saved_draft(target);
	const accessToken = await access_token(ctx, actor, target);
	const answer = draft_response.extend({ message: z.unknown() }).safeParse(await gmail_call(ctx, target, () => gmail_google_get(`/drafts/${encodeURIComponent(gmailDraftId)}?format=full`, accessToken, 2 * GMAIL_BODY_BYTES)));
	if (!answer.success) throw new gmail_PageError(502, "gmail_refused");
	let message: ReturnType<typeof gmail_discover_message>;
	let body: string;
	try {
		message = gmail_discover_message(answer.data.message);
		// Gmail puts the text of a small message inline, and an empty part has no data. A non-empty part without inline
		// text was changed in Gmail into something this page cannot edit.
		if (message.bodyLimit || message.bodyParts.some(part => part.data === undefined && part.size > 0)) throw new gmail_ContentError("invalid_source");
		body = gmail_body_text(message.bodyParts.map(part => ({ bytes: gmail_decode_base64(part.data ?? "", GMAIL_BODY_BYTES), charset: part.charset, mimeType: part.mimeType })));
	} catch (error) {
		if (error instanceof gmail_ContentError) throw new gmail_PageError(422, "draft_unreadable");
		throw error;
	}
	// Return the recipients this page saved, not the ones parsed back from the email. A display name with a comma
	// would not survive the round trip.
	return { clientDraftId: draft.clientDraftId, to: draft.to, cc: draft.cc, subject: message.subject === "(no subject)" ? "" : message.subject,
		body: body.replace(/\r\n/g, "\n").replace(/\n$/, ""), isReply: draft.replyTo !== null, agentEditedAt: draft.agentEditedAt };
}

async function draft_create(ctx: ActionCtx, actor: Actor,
	input: { accountId: string; clientDraftId: string; fields: gmail_DraftFields; replyToGmailMessageId: string | null; byAgent: boolean }) {
	const target = await start(ctx, actor, input.accountId, input.clientDraftId, "write");
	if (target.draft) return { clientDraftId: input.clientDraftId };
	const accessToken = await access_token(ctx, actor, target);
	let replyTo: Doc<"gmail_drafts">["replyTo"] = null;
	if (input.replyToGmailMessageId) {
		// Read the parent from this mailbox. That also proves the email belongs to this account.
		const parent = parent_response.safeParse(await gmail_call(ctx, target, () => gmail_google_get(`/messages/${encodeURIComponent(input.replyToGmailMessageId!)}`
			+ "?format=metadata&metadataHeaders=Message-ID&metadataHeaders=References", accessToken, 256 * 1024)));
		if (!parent.success) throw new gmail_PageError(404, "email_not_found");
		const header = (name: string) => parent.data.payload.headers.find(item => item.name.toLowerCase() === name)?.value.slice(0, 16_384) ?? "";
		replyTo = { gmailMessageId: parent.data.id, gmailThreadId: parent.data.threadId, messageIdHeader: header("message-id"), referencesHeader: header("references") };
	}
	const reply = replyTo && { gmailThreadId: replyTo.gmailThreadId, messageIdHeader: replyTo.messageIdHeader, referencesHeader: replyTo.referencesHeader };
	const raw = await gmail_call(ctx, target, async () => gmail_compose_raw({ ...input.fields, from: target.emailAddress, reply }));
	const draftId = await ctx.runMutation(internal.gmail_drafts.reserve_create, { accountId: target.accountId, actorUserId: actor.actorUserId,
		clientDraftId: input.clientDraftId, to: input.fields.to, cc: input.fields.cc, subject: input.fields.subject, replyTo, byAgent: input.byAgent });
	if (!draftId) return { clientDraftId: input.clientDraftId };
	try {
		const created = draft_response.safeParse(await gmail_call(ctx, target, () => gmail_google_write("POST", "/drafts", { message: gmail_message(raw, reply) }, accessToken, 64 * 1024)));
		if (!created.success) throw new gmail_PageError(502, "gmail_refused");
		await ctx.runMutation(internal.gmail_drafts.save_row, { draftId, gmailDraftId: created.data.id, to: input.fields.to, cc: input.fields.cc,
			subject: input.fields.subject, byAgent: input.byAgent });
	} catch (error) {
		await ctx.runMutation(internal.gmail_drafts.drop_row, { draftId });
		throw error;
	}
	return { clientDraftId: input.clientDraftId };
}

async function draft_update(ctx: ActionCtx, actor: Actor, input: { accountId: string; clientDraftId: string; fields: gmail_DraftFields; byAgent: boolean }) {
	const target = await start(ctx, actor, input.accountId, input.clientDraftId, "write");
	const { draft, gmailDraftId } = saved_draft(target);
	const reply = reply_headers(draft);
	const raw = await gmail_call(ctx, target, async () => gmail_compose_raw({ ...input.fields, from: target.emailAddress, reply }));
	const accessToken = await access_token(ctx, actor, target);
	// Last write wins. Send carries its own copy of the fields, so a late update cannot change what is sent.
	await gmail_call(ctx, target, () => gmail_google_write("PUT", `/drafts/${encodeURIComponent(gmailDraftId)}`, { id: gmailDraftId, message: gmail_message(raw, reply) }, accessToken, 64 * 1024));
	await ctx.runMutation(internal.gmail_drafts.save_row, { draftId: draft._id, gmailDraftId, to: input.fields.to, cc: input.fields.cc,
		subject: input.fields.subject, byAgent: input.byAgent });
	return { saved: true };
}

async function draft_delete(ctx: ActionCtx, actor: Actor, input: { accountId: string; clientDraftId: string }) {
	const target = await start(ctx, actor, input.accountId, input.clientDraftId, "write");
	const { draft, gmailDraftId } = saved_draft(target);
	const accessToken = await access_token(ctx, actor, target);
	// A draft already gone from Gmail answers 404 in gmail_call, which also deletes the row. The member wanted it gone, so that counts as deleted.
	await gmail_call(ctx, target, () => gmail_google_write("DELETE", `/drafts/${encodeURIComponent(gmailDraftId)}`, null, accessToken, 8192)).catch((error: unknown) => {
		if (!(error instanceof gmail_PageError && error.code === "draft_gone")) throw error;
	});
	await ctx.runMutation(internal.gmail_drafts.drop_row, { draftId: draft._id });
	return { deleted: true };
}

/**
 * Send a draft. Only the draft editor's Send button calls this route; no page tool does.
 *
 * Gmail sends the message built from `fields`, the text the member sees. So an agent edit or an autosave that lands at the
 * same moment cannot change what goes out.
 */
async function draft_send(ctx: ActionCtx, actor: Actor, input: { accountId: string; clientDraftId: string; fields: gmail_DraftFields }) {
	if (input.fields.to.length + input.fields.cc.length === 0) throw new gmail_PageError(400, "no_recipient");
	const target = await start(ctx, actor, input.accountId, input.clientDraftId, "send");
	const { draft, gmailDraftId } = saved_draft(target);
	const reply = reply_headers(draft);
	const raw = await gmail_call(ctx, target, async () => gmail_compose_raw({ ...input.fields, from: target.emailAddress, reply }));
	const accessToken = await access_token(ctx, actor, target);
	try {
		await gmail_call(ctx, target, () => gmail_google_write("POST", "/drafts/send", { id: gmailDraftId, message: gmail_message(raw, reply) }, accessToken, 64 * 1024, 25_000));
	} catch (error) {
		// A timeout, a lost connection, or a Gmail 5xx may come after Gmail sent the email. Never retry here.
		if (error instanceof gmail_PageError && error.code !== "gmail_busy") throw error;
		throw new gmail_PageError(504, "send_unknown");
	}
	await ctx.runMutation(internal.gmail_drafts.drop_row, { draftId: draft._id });
	return { sent: true };
}

async function page_result<T>(run: () => Promise<T>) {
	try {
		return { _yay: await run() };
	} catch (error) {
		if (error instanceof gmail_PageError) return { _nay: { status: error.status, code: error.code } };
		throw error;
	}
}

const draft_target = { ...gmail_host_binding, accountId: v.string(), clientDraftId: v.string() };

export const get = internalAction({
	args: draft_target,
	returns: v.union(failure, v.object({ _yay: v.object({ clientDraftId: v.string(), to: v.array(v.string()), cc: v.array(v.string()), subject: v.string(),
		body: v.string(), isReply: v.boolean(), agentEditedAt: v.union(v.number(), v.null()) }) })),
	handler: async (ctx, { accountId, clientDraftId, ...actor }) => page_result(() => draft_get(ctx, actor, { accountId, clientDraftId })),
});

export const create = internalAction({
	args: { ...draft_target, fields: draft_fields, replyToGmailMessageId: v.union(v.string(), v.null()), byAgent: v.boolean() },
	returns: v.union(failure, v.object({ _yay: v.object({ clientDraftId: v.string() }) })),
	handler: async (ctx, { accountId, clientDraftId, fields, replyToGmailMessageId, byAgent, ...actor }) =>
		page_result(() => draft_create(ctx, actor, { accountId, clientDraftId, fields, replyToGmailMessageId, byAgent })),
});

export const update = internalAction({
	args: { ...draft_target, fields: draft_fields, byAgent: v.boolean() },
	returns: v.union(failure, v.object({ _yay: v.object({ saved: v.boolean() }) })),
	handler: async (ctx, { accountId, clientDraftId, fields, byAgent, ...actor }) => page_result(() => draft_update(ctx, actor, { accountId, clientDraftId, fields, byAgent })),
});

export const remove = internalAction({
	args: draft_target,
	returns: v.union(failure, v.object({ _yay: v.object({ deleted: v.boolean() }) })),
	handler: async (ctx, { accountId, clientDraftId, ...actor }) => page_result(() => draft_delete(ctx, actor, { accountId, clientDraftId })),
});

export const send = internalAction({
	args: { ...draft_target, fields: draft_fields },
	returns: v.union(failure, v.object({ _yay: v.object({ sent: v.boolean() }) })),
	handler: async (ctx, { accountId, clientDraftId, fields, ...actor }) => page_result(() => draft_send(ctx, actor, { accountId, clientDraftId, fields })),
});
