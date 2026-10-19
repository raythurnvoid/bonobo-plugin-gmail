import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import { z } from "zod";
import { gmail_page_post } from "./gmail-api";

/**
 * Drafts are real Gmail drafts. The backend writes them with the account's Google token and keeps
 * only the subject and recipients, for the list. The text lives in Gmail.
 */
const MAX_ADDRESSES = 50;
const MAX_SUBJECT_LENGTH = 998;
/**
 * The backend builds the email and refuses a body over 50,000 UTF-8 bytes.
 */
const MAX_BODY_BYTES = 50_000;

export type DraftFields = { to: string[]; cc: string[]; subject: string; body: string };

const draft_row = z.object({
	clientDraftId: z.string(),
	to: z.array(z.string()),
	cc: z.array(z.string()),
	subject: z.string(),
	isReply: z.boolean(),
	/**
	 * True while the first Gmail save runs. The draft cannot be opened yet.
	 */
	saving: z.boolean(),
	agentEditedAt: z.number().nullable(),
	updatedAt: z.number(),
});
const drafts_page = z.object({ drafts: z.array(draft_row).max(25), cursor: z.string().nullable() });
const draft_text = z.object({
	clientDraftId: z.string(),
	to: z.array(z.string()),
	cc: z.array(z.string()),
	subject: z.string(),
	body: z.string(),
	isReply: z.boolean(),
	agentEditedAt: z.number().nullable(),
});

export type DraftRow = z.infer<typeof draft_row>;
export type DraftText = z.infer<typeof draft_text>;

type DraftClient = Pick<BonoboClient, "getToken" | "refreshToken">;

/**
 * A new draft id. The page makes it before the first save, so a create sent twice makes one draft.
 */
export function new_draft_id() {
	return crypto.randomUUID();
}

/**
 * Check draft fields that came from the agent or the editor. Throw a plain message, because a page
 * tool sends a thrown message back to the agent.
 */
export function validate_draft_fields(fields: DraftFields) {
	if (fields.to.length + fields.cc.length > MAX_ADDRESSES) {
		throw new Error(`A draft can have at most ${MAX_ADDRESSES} recipients`);
	}
	if (fields.subject.length > MAX_SUBJECT_LENGTH) {
		throw new Error(`A subject can have at most ${MAX_SUBJECT_LENGTH} characters`);
	}
	if (new TextEncoder().encode(fields.body).byteLength > MAX_BODY_BYTES) {
		throw new Error("A draft can have at most 50 KB of text. Shorten the body.");
	}
}

/**
 * List this member's drafts for one account, newest first, 25 per page.
 */
export function list_drafts(client: DraftClient, accountId: string, cursor: string | null) {
	return gmail_page_post(client, "/page/drafts/list", { accountId, cursor }, drafts_page);
}

export function get_draft(client: DraftClient, accountId: string, clientDraftId: string) {
	return gmail_page_post(client, "/page/drafts/get", { accountId, clientDraftId }, draft_text);
}

export async function create_draft(
	client: DraftClient,
	args: { accountId: string; clientDraftId: string; fields: DraftFields; replyToGmailMessageId: string | null; byAgent: boolean },
) {
	validate_draft_fields(args.fields);
	await gmail_page_post(client, "/page/drafts/create", args, z.object({ clientDraftId: z.string() }));
}

export async function update_draft(
	client: DraftClient,
	args: { accountId: string; clientDraftId: string; fields: DraftFields; byAgent: boolean },
) {
	validate_draft_fields(args.fields);
	await gmail_page_post(client, "/page/drafts/update", args, z.object({ saved: z.boolean() }));
}

export async function delete_draft(client: DraftClient, accountId: string, clientDraftId: string) {
	await gmail_page_post(client, "/page/drafts/delete", { accountId, clientDraftId }, z.object({ deleted: z.boolean() }));
}
