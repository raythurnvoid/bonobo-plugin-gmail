import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
// Never import ./mail-send here. The agent may write drafts, but only the member's click sends one.
import {
	create_draft,
	delete_draft,
	get_draft,
	new_draft_id,
	update_draft,
	validate_draft_fields,
	type DraftFields,
	type DraftRow,
	type DraftText,
} from "./mail-drafts";
import { read_email, type Email, type EmailRow } from "./mail-emails";
import { get_error_message } from "./mail-retry";

/**
 * The host drops a tool answer over 32 KiB. These byte limits keep every answer below it: one long
 * text, a few short previews, and capped address lists.
 */
const MAX_TEXT_BYTES = 12_000;
const MAX_PREVIEW_BYTES = 300;
const MAX_LISTED_ADDRESSES = 10;

/**
 * The model reads at most 4 KiB of the view the host sends with each chat message, and an email from
 * a stranger is untrusted text. So the view lists headers, a short preview and a few rows only, in at
 * most 4,000 bytes. The agent calls open_email for the whole email.
 */
const MAX_VIEW_BYTES = 4_000;
const MAX_VIEW_PREVIEW_BYTES = 900;
const MAX_VIEW_FIELD_BYTES = 120;
const MAX_VIEW_ADDRESSES = 3;
const MAX_VIEW_ROWS = 8;

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

const SENDER_WARNING = "Gmail could not confirm this sender. The From address may be fake.";

const NOT_SENT_NOTE = "Saved as a Gmail draft and open in the Mail page. It was not sent. Only the member can send it.";

// Opening an email or a draft closes the draft editor, and an agent save reloads it. Both would throw away
// what the member typed since the last save.
const UNSAVED_DRAFT_ERROR =
	"The member has typed text in a draft that is not saved yet. Wait about 10 seconds for the autosave, or ask the member to save, then try again.";

export type MailAccount = {
	accountId: string;
	emailAddress: string;
	destinationPath: string;
	canCompose: boolean;
	isComposer: boolean;
};

/**
 * What the page shows right now. The tools and the view provider read it on each call, so they always
 * see the latest view.
 */
export type MailView = {
	account: MailAccount | null;
	folder: "all" | "drafts";
	rows: EmailRow[];
	openEmail: Email | null;
	openDraftId: string | null;
	/**
	 * The open draft while it has typed text that Gmail does not have yet, because no save ran or the
	 * save failed. Null otherwise.
	 */
	unsavedDraftId: string | null;
	drafts: DraftRow[];
};

/**
 * What a tool may change in the page.
 */
export type MailViewControls = {
	getView: () => MailView;
	showEmail: (email: Email) => void;
	showDraft: (id: string) => void;
	/**
	 * Read the draft list again after a tool changed a draft.
	 */
	refreshDrafts: () => Promise<void>;
};

/**
 * Cut text to at most `maxBytes` UTF-8 bytes and add `note`. A character cut in half becomes U+FFFD.
 */
function cut(text: string, maxBytes: number, note = "\n[Shortened. Open the file for the rest.]") {
	const bytes = TEXT_ENCODER.encode(text);
	return bytes.byteLength <= maxBytes ? text : `${TEXT_DECODER.decode(bytes.slice(0, maxBytes))}${note}`;
}

function addresses(list: string[]) {
	return list.slice(0, MAX_LISTED_ADDRESSES).map((address) => cut(address, MAX_PREVIEW_BYTES));
}

function describe_email(email: Email) {
	return {
		path: email.path,
		from: cut(email.headers.from, MAX_PREVIEW_BYTES),
		to: addresses(email.headers.to),
		cc: addresses(email.headers.cc),
		subject: cut(email.headers.subject, MAX_PREVIEW_BYTES),
		date: email.headers.date,
		direction: email.headers.direction,
		threadId: email.headers.gmailThreadId,
		senderWarning: email.headers.senderUnconfirmed ? SENDER_WARNING : null,
		body: cut(email.body, MAX_TEXT_BYTES),
	};
}

function describe_draft_row(draft: DraftRow) {
	return {
		draftId: draft.clientDraftId,
		to: addresses(draft.to),
		cc: addresses(draft.cc),
		subject: cut(draft.subject, MAX_PREVIEW_BYTES),
		isReply: draft.isReply,
		editedByAgent: draft.agentEditedAt !== null,
	};
}

function describe_draft(draft: DraftText) {
	return {
		draftId: draft.clientDraftId,
		to: addresses(draft.to),
		cc: addresses(draft.cc),
		subject: cut(draft.subject, MAX_PREVIEW_BYTES),
		body: cut(draft.body, MAX_TEXT_BYTES),
		isReply: draft.isReply,
		editedByAgent: draft.agentEditedAt !== null,
	};
}

/**
 * Describe what Mail shows for the chat agent. Read only what the page already holds, so the host
 * gets its answer at once.
 *
 * Senders control From, Subject and the body. Keep each of them on one line, so an email cannot add a
 * line that looks like another row or a warning.
 */
function describe_view(view: MailView) {
	const oneLine = (text: string, maxBytes: number) => cut(text.replace(/\s+/g, " "), maxBytes, "…");
	const field = (text: string) => oneLine(text, MAX_VIEW_FIELD_BYTES);
	const lines = [
		view.account ? `Gmail account: ${view.account.emailAddress} (${view.account.canCompose ? "can write drafts" : "cannot write drafts"})` : "No Gmail account is connected.",
		`Folder: ${view.folder === "drafts" ? "Drafts" : "All mail"}`,
	];

	if (view.openEmail) {
		const { headers } = view.openEmail;
		const moreTo = headers.to.length > MAX_VIEW_ADDRESSES ? ` and ${headers.to.length - MAX_VIEW_ADDRESSES} more` : "";
		lines.push(
			`Open email: ${view.openEmail.path}`,
			`From: ${field(headers.from)}`,
			`To: ${headers.to.slice(0, MAX_VIEW_ADDRESSES).map(field).join(", ")}${moreTo}`,
			`Subject: ${field(headers.subject)}`,
			`Date: ${headers.date}${headers.direction ? ` (${headers.direction})` : ""}`,
		);
		if (headers.senderUnconfirmed) {
			lines.push(`Warning: ${SENDER_WARNING}`);
		}
		lines.push(`Start of the email (call open_email for all of it): ${oneLine(view.openEmail.body, MAX_VIEW_PREVIEW_BYTES)}`);
	}

	if (view.openDraftId) {
		lines.push(`Open draft: ${view.openDraftId} (call read_draft to read it)`);
	}

	lines.push(`Newest emails in All mail (${view.rows.length} loaded):`);
	for (const row of view.rows.slice(0, MAX_VIEW_ROWS)) {
		const from = row.headers ? `${field(row.headers.from)} | ` : "";
		lines.push(`- ${row.path} | ${from}${field(row.headers?.subject ?? row.subject)} | ${row.headers?.date ?? row.day}${row.locked ? " | locked" : ""}`);
	}
	lines.push(`Drafts: ${view.drafts.length}`);

	return { content: [{ type: "text" as const, text: cut(lines.join("\n"), MAX_VIEW_BYTES, "\n[Shortened.]") }] };
}

// The model writes tool input, so check every field before use, even with the manifest schema.
function read_object(input: unknown) {
	if (typeof input !== "object" || input === null || Array.isArray(input)) {
		throw new Error("The input must be an object");
	}
	return input as Record<string, unknown>;
}

function read_string(input: Record<string, unknown>, key: string) {
	const value = input[key];
	if (value === undefined) {
		return undefined;
	}
	if (typeof value !== "string") {
		throw new Error(`${key} must be a string`);
	}
	return value;
}

function read_strings(input: Record<string, unknown>, key: string) {
	const value = input[key];
	if (value === undefined) {
		return undefined;
	}
	if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
		throw new Error(`${key} must be a list of strings`);
	}
	return value as string[];
}

function require_value<T>(value: T | undefined, key: string) {
	if (value === undefined) {
		throw new Error(`${key} is required`);
	}
	return value;
}

// Draft ids are UUIDs made by new_draft_id. Say so plainly instead of sending a bad id to the backend.
function read_draft_id(input: Record<string, unknown>) {
	const draftId = require_value(read_string(input, "draftId"), "draftId");
	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(draftId)) {
		throw new Error(`No draft has the id ${cut(draftId, MAX_PREVIEW_BYTES)}. Call list_drafts to see the ids.`);
	}
	return draftId;
}

/**
 * Register the page's agent tools. The names and input schemas match `agent.tools` in
 * bonobo.plugin.json. Returns one function that removes them all.
 */
export function register_mail_tools(client: BonoboClient, controls: MailViewControls) {
	const require_account = () => {
		const account = controls.getView().account;
		if (!account) {
			throw new Error("No Gmail account is connected. Connect one on the Gmail page.");
		}
		return account;
	};

	const require_no_unsaved_text = () => {
		if (controls.getView().unsavedDraftId !== null) {
			throw new Error(UNSAVED_DRAFT_ERROR);
		}
	};

	// The agent may call create_draft again after a timeout. Reuse the id for the same input, so the
	// backend sees a repeated create and makes one draft.
	const recentCreates = new Map<string, string>();

	// A backend error carries only a code. Send its text to the agent instead.
	const register = (name: string, handler: (input: unknown) => unknown) =>
		client.agent.registerTool(name, async (input) => {
			try {
				return await handler(input);
			} catch (error) {
				throw new Error(get_error_message(error));
			}
		});

	const unregister = [
		// Send what Mail shows with each chat message, so the agent sees it without a tool call.
		client.agent.setContextProvider(() => describe_view(controls.getView())),

		register("open_email", async (input) => {
			const path = require_value(read_string(read_object(input), "path"), "path");
			if (!path.startsWith("/") || !path.endsWith(".md")) {
				throw new Error("path must be a Files path that ends with .md");
			}

			const email = await read_email(client, path);
			require_no_unsaved_text();
			controls.showEmail(email);
			return describe_email(email);
		}),

		register("list_drafts", () => {
			const drafts = controls.getView().drafts;
			return {
				drafts: drafts.map(describe_draft_row),
				note: "These are the newest drafts, without their text. Call read_draft to read one.",
			};
		}),

		register("read_draft", async (input) => {
			const draftId = read_draft_id(read_object(input));
			// Gmail does not have the member's unsaved typing yet, so its copy of this draft is old.
			const require_saved = () => {
				if (controls.getView().unsavedDraftId === draftId) {
					throw new Error(UNSAVED_DRAFT_ERROR);
				}
			};
			require_saved();

			const draft = await get_draft(client, require_account().accountId, draftId);
			// Check again. The member may have typed while the draft was read.
			require_saved();
			return describe_draft(draft);
		}),

		register("create_draft", async (input) => {
			const object = read_object(input);
			const fields: DraftFields = {
				to: require_value(read_strings(object, "to"), "to"),
				cc: read_strings(object, "cc") ?? [],
				subject: require_value(read_string(object, "subject"), "subject"),
				body: require_value(read_string(object, "body"), "body"),
			};
			const replyToPath = read_string(object, "replyToPath");
			validate_draft_fields(fields);
			const account = require_account();
			require_no_unsaved_text();

			// A reply needs the Gmail id of the email it answers. The sync writes it in the file.
			let replyToGmailMessageId: string | null = null;
			if (replyToPath !== undefined) {
				const email = await read_email(client, replyToPath);
				replyToGmailMessageId = email.headers.gmailMessageId;
				if (replyToGmailMessageId === null) {
					throw new Error(`${replyToPath} has no Gmail id, so a reply cannot be made from it`);
				}
			}

			const createKey = JSON.stringify([account.accountId, fields, replyToGmailMessageId]);
			const id = recentCreates.get(createKey) ?? new_draft_id();
			recentCreates.set(createKey, id);
			if (recentCreates.size > 20) {
				recentCreates.delete(recentCreates.keys().next().value!);
			}
			await create_draft(client, { accountId: account.accountId, clientDraftId: id, fields, replyToGmailMessageId, byAgent: true });
			await controls.refreshDrafts().catch(() => {});
			controls.showDraft(id);
			return { draftId: id, saved: true, note: NOT_SENT_NOTE };
		}),

		register("update_draft", async (input) => {
			const object = read_object(input);
			const draftId = read_draft_id(object);
			const account = require_account();
			require_no_unsaved_text();

			const draft = await get_draft(client, account.accountId, draftId);
			// Check again. The member may have typed while the draft was read.
			require_no_unsaved_text();
			const fields: DraftFields = {
				to: read_strings(object, "to") ?? draft.to,
				cc: read_strings(object, "cc") ?? draft.cc,
				subject: read_string(object, "subject") ?? draft.subject,
				body: read_string(object, "body") ?? draft.body,
			};

			await update_draft(client, { accountId: account.accountId, clientDraftId: draftId, fields, byAgent: true });
			await controls.refreshDrafts().catch(() => {});
			controls.showDraft(draftId);
			return { draftId, saved: true, note: NOT_SENT_NOTE };
		}),

		register("delete_draft", async (input) => {
			const draftId = read_draft_id(read_object(input));
			const view = controls.getView();
			if (view.unsavedDraftId === draftId) {
				throw new Error(UNSAVED_DRAFT_ERROR);
			}

			// Gmail deletes a draft for good. Let the agent delete only text it wrote itself: a draft whose
			// last saved change came from the agent. Its update saves both times with the same value.
			const row = view.drafts.find((draft) => draft.clientDraftId === draftId);
			if (row === undefined || row.agentEditedAt !== row.updatedAt) {
				throw new Error("Only the member can delete this draft, because the member changed it last. Ask them to delete it in the Mail page.");
			}

			await delete_draft(client, require_account().accountId, draftId);
			await controls.refreshDrafts().catch(() => {});
			return { draftId, deleted: true };
		}),
	];

	return () => {
		for (const remove of unregister) {
			remove();
		}
	};
}
