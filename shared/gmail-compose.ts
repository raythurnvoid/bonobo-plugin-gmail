import { Buffer } from "node:buffer";
import emailAddresses from "email-addresses";

export const GMAIL_DRAFT_BODY_BYTES = 50_000;
const MAX_RECIPIENTS = 50;
// Base64 of 45 bytes is 60 characters, so "=?UTF-8?B?" + 60 + "?=" stays under the 75-character word limit (RFC 2047).
const WORD_BYTES = 45;
const MESSAGE_ID = /^<[^<>\s@]+@[^<>\s@]+>$/;

export class gmail_ComposeError extends Error {
	constructor(public readonly code: "invalid_recipient" | "invalid_header" | "draft_too_large", public readonly detail: string) { super(code); }
}

export type gmail_DraftFields = { to: string[]; cc: string[]; subject: string; body: string };
export type gmail_ReplyHeaders = { gmailThreadId: string; messageIdHeader: string; referencesHeader: string };

// A CR or LF in a header value would start a new header, for example a hidden Bcc.
function check_header_text(value: string) {
	if (/[\r\n\0]/.test(value)) throw new gmail_ComposeError("invalid_header", value.slice(0, 80).replace(/[\r\n\0]/g, " "));
}

/**
 * Parse one recipient. Only `addr` or `Name <addr>` pass, and the address must be plain ASCII.
 */
export function gmail_parse_recipient(value: string) {
	check_header_text(value);
	const parsed = emailAddresses.parseOneAddress(value.trim());
	if (!parsed || parsed.type !== "mailbox" || !/^[\x21-\x7e]+$/.test(parsed.address)) throw new gmail_ComposeError("invalid_recipient", value.slice(0, 200));
	return { name: parsed.name, address: parsed.address };
}

function encode_words(text: string) {
	const words: string[] = [];
	let word = "";
	for (const character of text) {
		if (word && Buffer.byteLength(word + character) > WORD_BYTES) {
			words.push(word);
			word = "";
		}
		word += character;
	}
	if (word) words.push(word);
	// Fold each word onto its own line, so no header line gets near the 998-character limit.
	return words.map(item => `=?UTF-8?B?${Buffer.from(item).toString("base64")}?=`).join("\r\n ");
}

function address_header(name: string, values: string[]) {
	const items = values.map(value => {
		const recipient = gmail_parse_recipient(value);
		// Build the header from the parsed parts, never from the raw text.
		return recipient.name ? `${encode_words(recipient.name)} <${recipient.address}>` : recipient.address;
	});
	return `${name}: ${items.join(",\r\n ")}`;
}

/**
 * Reply headers come from an email someone else sent. Keep only well-formed ids, and at most the last 20 references.
 */
function reply_headers(reply: gmail_ReplyHeaders) {
	const parent = MESSAGE_ID.test(reply.messageIdHeader) ? reply.messageIdHeader : null;
	if (!parent) return [];
	const references = [...reply.referencesHeader.split(/\s+/).filter(id => MESSAGE_ID.test(id)), parent].slice(-20);
	return [`In-Reply-To: ${parent}`, `References: ${references.join("\r\n ")}`];
}

/**
 * Build an RFC 2822 text email for the Gmail drafts API, as base64url.
 */
export function gmail_compose_raw(input: gmail_DraftFields & { from: string; reply: gmail_ReplyHeaders | null }) {
	if (input.to.length + input.cc.length > MAX_RECIPIENTS) throw new gmail_ComposeError("invalid_recipient", `at most ${MAX_RECIPIENTS} recipients`);
	if (Buffer.byteLength(input.body) > GMAIL_DRAFT_BODY_BYTES) throw new gmail_ComposeError("draft_too_large", `${GMAIL_DRAFT_BODY_BYTES} bytes`);
	check_header_text(input.subject);
	const headers = [
		address_header("From", [input.from]),
		...(input.to.length ? [address_header("To", input.to)] : []),
		...(input.cc.length ? [address_header("Cc", input.cc)] : []),
		...(input.subject ? [`Subject: ${encode_words(input.subject)}`] : []),
		...(input.reply ? reply_headers(input.reply) : []),
		"MIME-Version: 1.0",
		"Content-Type: text/plain; charset=UTF-8",
		"Content-Transfer-Encoding: base64",
	];
	const body = Buffer.from(input.body.replace(/\r?\n/g, "\r\n")).toString("base64").match(/.{1,76}/g) ?? [];
	return Buffer.from(`${headers.join("\r\n")}\r\n\r\n${body.join("\r\n")}\r\n`).toString("base64url");
}
