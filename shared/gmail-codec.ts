import { Buffer } from "node:buffer";
import emailAddresses from "email-addresses";
import he from "he";
import { z } from "zod";
import { gmail_slug } from "./gmail-paths";

export { gmail_slug } from "./gmail-paths";

export const GMAIL_BODY_BYTES = 2 * 1024 * 1024;
export const GMAIL_ATTACHMENT_BYTES = 32 * 1024 * 1024;
export const GMAIL_JSON_BYTES = 48 * 1024 * 1024;
export const GMAIL_MARKDOWN_BYTES = 800_000;

export class gmail_ContentError extends Error {
	constructor(public readonly code: "source_too_large" | "mime_too_large" | "invalid_source" | "too_large") {
		super(code);
	}
}

export function gmail_cap_text(text: string, bytes: number) {
	// Avoid allocating bytes for the full source string.
	const prefix = text.slice(0, bytes);
	const encoded = Buffer.from(prefix);
	if (encoded.length <= bytes) return prefix;
	let end = bytes;
	while (end > 0 && (encoded[end] & 0xc0) === 0x80) end--;
	return encoded.subarray(0, end).toString("utf8");
}

export function gmail_attachment_name(name: string) {
	const normalized = name.replace(/\\/g, "/").split("/").filter(Boolean).at(-1) ?? "attachment";
	const parts = normalized.normalize("NFKD").replace(/\p{Mark}/gu, "").toLowerCase().split(".")
		.map(part => part.replace(/[^a-z0-9_-]+/g, "-").replace(/[._-]{2,}/g, "-").replace(/^[._-]+|[._-]+$/g, ""));
	const extension = parts.length > 1 ? (parts.pop() || "").slice(0, 16).replace(/[_-]+$/g, "") : "";
	let base = parts.filter(Boolean).join(".") || "attachment";
	if (["agents", "readme", "skill"].includes(base)) base += "-attachment";
	base = base.slice(0, 120).replace(/[._-]+$/g, "");
	return extension ? `${base}.${extension}` : base;
}

export function gmail_unique_attachment_names(names: string[]) {
	const originals = names.map(gmail_attachment_name);
	const reserved = new Set(originals);
	const used = new Set<string>();
	return originals.map(name => {
		let candidate = name;
		if (used.has(candidate)) {
			const dot = name.lastIndexOf(".");
			const base = dot < 0 ? name : name.slice(0, dot);
			const extension = dot < 0 ? "" : name.slice(dot);
			for (let suffix = 2; ; suffix++) {
				const tail = `-${suffix}`;
				candidate = `${base.slice(0, 120 - tail.length).replace(/[._-]+$/g, "")}${tail}${extension}`;
				if (!used.has(candidate) && !reserved.has(candidate)) break;
			}
		}
		used.add(candidate);
		return candidate;
	});
}

export function gmail_decode_base64(data: string, cap: number) {
	const padding = data.endsWith("==") ? 2 : data.endsWith("=") ? 1 : 0;
	if (!/^[A-Za-z0-9_-]*={0,2}$/.test(data) || (data.length - padding) % 4 === 1) {
		throw new gmail_ContentError("invalid_source");
	}
	const length = Math.floor((data.length - padding) * 3 / 4);
	if (length > cap) throw new gmail_ContentError("too_large");
	const bytes = Buffer.from(data, "base64url");
	if (bytes.length > cap) throw new gmail_ContentError("too_large");
	return bytes;
}

export function gmail_decode_header(value: string) {
	// RFC 2047 ignores whitespace between adjacent encoded words.
	return value.replace(/(\?=)\s+(?==\?)/g, "$1").replace(/=\?([^?]+)\?([bq])\?([^?]*)\?=/gi, (whole, charset: string, encoding: string, text: string) => {
		try {
			const bytes = encoding.toLowerCase() === "b"
				? Buffer.from(text, "base64")
				: Buffer.from(text.replace(/_/g, " ").replace(/=([0-9a-f]{2})/gi, (_match, hex: string) => String.fromCharCode(parseInt(hex, 16))), "latin1");
			return new TextDecoder(charset).decode(bytes);
		} catch { return whole; }
	});
}

function parse_addresses(value: string) {
	const parsed = emailAddresses.parseAddressList(gmail_decode_header(gmail_cap_text(value, 64 * 1024))) ?? [];
	return parsed.flatMap(item => item.type === "group" ? item.addresses : [item])
		.map(item => item.name ? `${item.name} <${item.address}>` : item.address);
}

const header_validator = z.object({ name: z.string(), value: z.string() });
const part_validator = z.object({
	partId: z.string().optional().default(""),
	mimeType: z.string().optional().default("application/octet-stream"),
	filename: z.string().optional().default(""),
	headers: z.array(header_validator).optional().default([]),
	body: z.object({ size: z.number().int().nonnegative(), data: z.string().optional(), attachmentId: z.string().optional() }).optional().default({ size: 0 }),
	parts: z.array(z.unknown()).optional().default([]),
});
const message_validator = z.object({
	id: z.string().regex(/^[0-9a-f]+$/), threadId: z.string().regex(/^[0-9a-f]+$/),
	internalDate: z.string().regex(/^\d+$/), labelIds: z.array(z.string()).optional().default([]), payload: z.unknown(),
});

export function gmail_discover_message(input: unknown) {
	const message = message_validator.safeParse(input);
	if (!message.success) throw new gmail_ContentError("invalid_source");
	const root = part_validator.safeParse(message.data.payload);
	if (!root.success) throw new gmail_ContentError("invalid_source");
	const headers = new Map(root.data.headers.map(h => [h.name.toLowerCase(), h.value]));
	const header = (name: string) => gmail_decode_header(gmail_cap_text(headers.get(name) ?? "", 8192));
	const internalDate = Number(message.data.internalDate);
	if (!Number.isSafeInteger(internalDate) || !Number.isFinite(new Date(internalDate).getTime())) throw new gmail_ContentError("invalid_source");
	const textParts: z.infer<typeof part_validator>[] = [];
	const attachments: z.infer<typeof part_validator>[] = [];
	const stack = [{ input: message.data.payload, depth: 0 }];
	let count = 0;
	while (stack.length) {
		const item = stack.pop()!;
		if (++count > 4096 || item.depth > 32) throw new gmail_ContentError("mime_too_large");
		const parsed = part_validator.safeParse(item.input);
		if (!parsed.success) throw new gmail_ContentError("invalid_source");
		const part = parsed.data;
		const partHeaders = new Map(part.headers.map(h => [h.name.toLowerCase(), gmail_cap_text(h.value, 8192)]));
		const disposition = partHeaders.get("content-disposition") ?? "";
		const mimeType = part.mimeType.toLowerCase();
		if (mimeType.startsWith("image/") && partHeaders.has("content-id")) continue;
		if (part.filename || /^attachment(?:\s|;|$)/i.test(disposition) || mimeType === "message/rfc822") {
			attachments.push(part);
			continue; // An attached container's children cannot become the email body.
		}
		if (mimeType === "text/plain" || mimeType === "text/html") textParts.push(part);
		if (count + stack.length + part.parts.length > 4096) throw new gmail_ContentError("mime_too_large");
		for (let i = part.parts.length - 1; i >= 0; i--) stack.push({ input: part.parts[i], depth: item.depth + 1 });
	}
	const plain = textParts.filter(part => part.mimeType.toLowerCase() === "text/plain");
	const selected = plain.length ? plain : textParts;
	const bodyLimit = selected.length > 8 ? "parts" : selected.reduce((sum, part) => sum + part.body.size, 0) > GMAIL_BODY_BYTES ? "bytes" : null;
	const names = gmail_unique_attachment_names(attachments.map(part => gmail_decode_header(gmail_cap_text(part.filename || "attachment", 512))));
	return {
		id: message.data.id, threadId: message.data.threadId, internalDate,
		labels: message.data.labelIds, subject: header("subject") || "(no subject)", from: header("from"),
		to: parse_addresses(headers.get("to") ?? ""), cc: parse_addresses(headers.get("cc") ?? ""),
		bcc: message.data.labelIds.includes("SENT") ? parse_addresses(headers.get("bcc") ?? "") : [],
		messageId: header("message-id"), inReplyTo: header("in-reply-to"),
		headersShortened: [...headers].some(([name, value]) => Buffer.byteLength(value) > (["to", "cc", "bcc"].includes(name) ? 65536 : 8192)),
		bodyLimit, bodyParts: bodyLimit ? [] : selected.map(part => ({
			partId: part.partId, mimeType: part.mimeType,
			charset: /charset\s*=\s*["']?([^;"'\s]+)/i.exec(gmail_cap_text(part.headers.find(h => h.name.toLowerCase() === "content-type")?.value ?? "", 8192))?.[1] ?? "utf-8",
			...part.body,
		})),
		attachments: attachments.slice(0, 16).map((part, index) => ({
			partId: part.partId, filename: names[index], displayName: gmail_cap_text(gmail_decode_header(gmail_cap_text(part.filename || "attachment", 512)), 512),
			contentType: part.mimeType, ...part.body,
		})),
		overflowNames: names.slice(16),
	};
}

export function gmail_body_text(parts: { bytes: Uint8Array; charset: string; mimeType: string }[]) {
	if (parts.reduce((sum, part) => sum + part.bytes.byteLength, 0) > GMAIL_BODY_BYTES) throw new gmail_ContentError("too_large");
	return parts.map(part => {
		let decoded: string;
		try { decoded = new TextDecoder(part.charset).decode(part.bytes); }
		catch { decoded = new TextDecoder("utf-8").decode(part.bytes); }
		if (part.mimeType.toLowerCase() !== "text/html") return decoded;
		// Handle hidden blocks together so comment markers inside scripts stay hidden.
		return he.decode(decoded.replace(/<!--[\s\S]*?(?:-->|$)|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
			.replace(/<(?:br|\/p|\/div|\/li|\/tr|\/h[1-6])\b[^>]*>/gi, "\n").replace(/<[^>]*>/g, ""));
	}).join("\n\n");
}

export function gmail_file_path(message: { internalDate: number; subject: string; id: string }, destinationPath: string) {
	const date = new Date(message.internalDate).toISOString();
	return `${destinationPath}/${date.slice(0, 4)}/${date.slice(5, 7)}/${date.slice(8, 10)}-${gmail_slug(message.subject, 60)}-${message.id}.md`;
}

export function gmail_format_markdown(message: ReturnType<typeof gmail_discover_message>, body: string) {
	const sent = message.labels.includes("SENT");
	const scalar = (value: string) => JSON.stringify(gmail_cap_text(value, 8192));
	const addresses = (values: string[]) => JSON.stringify(values.slice(0, 50).map(value => gmail_cap_text(value, 512)));
	const names = message.attachments.map(part => part.filename);
	const frontmatter = [
		`from: ${scalar(message.from)}`, `to: ${addresses(message.to)}`, `cc: ${addresses(message.cc)}`,
		...(sent ? [`bcc: ${addresses(message.bcc)}`] : []),
		`date: ${scalar(new Date(message.internalDate).toISOString())}`, `subject: ${scalar(message.subject)}`,
		`direction: "${sent ? "sent" : "received"}"`, `gmail-message-id: ${scalar(message.id)}`,
		`gmail-thread-id: ${scalar(message.threadId)}`, `message-id: ${scalar(message.messageId)}`,
		`in-reply-to: ${scalar(message.inReplyTo)}`, `attachments: ${JSON.stringify(names)}`,
	];
	const notes = [
		...(names.length ? ["Attachment names are planned names, not proof that the files were saved.", ...names.map(name => `- ${name}`)] : []),
		...(message.overflowNames.length ? ["Attachments not saved (this plugin saves at most 16 per email):", ...message.overflowNames.map(name => `- ${name}`)] : []),
		...(message.headersShortened ? ["Some header text was shortened."] : []),
		...(["to", "cc", "bcc"] as const).filter(key => key !== "bcc" || sent)
			.flatMap(key => message[key].length > 50 ? [`Full ${key} list: ${message[key].join(", ")}`] : []),
	];
	const prefix = `---\n${frontmatter.join("\n")}\n---\n\n# ${message.subject.replace(/[\r\n]/g, " ")}\n\n[Open in Gmail](https://mail.google.com/mail/u/0/#all/${message.id})\n\n`;
	const text = [...notes, body].join("\n\n");
	const marker = "\n\nBody shortened. Read the full email in Gmail.\n";
	const room = GMAIL_MARKDOWN_BYTES - Buffer.byteLength(prefix);
	return prefix + (Buffer.byteLength(text) <= room ? text : gmail_cap_text(text, room - Buffer.byteLength(marker)) + marker);
}

const history_message = z.object({ id: z.string().regex(/^[0-9a-f]+$/) });
const history_validator = z.object({
	historyId: z.string().regex(/^\d+$/), nextPageToken: z.string().optional(),
	history: z.array(z.object({
		id: z.string().regex(/^\d+$/),
		messagesAdded: z.array(z.object({ message: history_message })).optional().default([]),
		messagesDeleted: z.array(z.object({ message: history_message })).optional().default([]),
		labelsRemoved: z.array(z.object({ message: history_message, labelIds: z.array(z.string()) })).optional().default([]),
	})).optional().default([]),
});

export function gmail_history_events(input: unknown) {
	const parsed = history_validator.safeParse(input);
	if (!parsed.success) throw new gmail_ContentError("invalid_source");
	const kinds = ["added", "rescue_spam", "rescue_trash", "deleted"] as const;
	const events: { historyId: string; gmailMessageId: string; kind: typeof kinds[number] }[] = [];
	for (const item of parsed.data.history) {
		for (const added of item.messagesAdded) events.push({ historyId: item.id, gmailMessageId: added.message.id, kind: "added" });
		for (const removed of item.labelsRemoved) {
			if (removed.labelIds.includes("SPAM")) events.push({ historyId: item.id, gmailMessageId: removed.message.id, kind: "rescue_spam" });
			if (removed.labelIds.includes("TRASH")) events.push({ historyId: item.id, gmailMessageId: removed.message.id, kind: "rescue_trash" });
		}
		for (const deleted of item.messagesDeleted) events.push({ historyId: item.id, gmailMessageId: deleted.message.id, kind: "deleted" });
	}
	events.sort((a, b) => BigInt(a.historyId) < BigInt(b.historyId) ? -1 : BigInt(a.historyId) > BigInt(b.historyId) ? 1
		: a.gmailMessageId.localeCompare(b.gmailMessageId) || kinds.indexOf(a.kind) - kinds.indexOf(b.kind));
	return { historyId: parsed.data.historyId, nextPageToken: parsed.data.nextPageToken ?? null,
		events: events.filter((event, index) => index === 0 || JSON.stringify(event) !== JSON.stringify(events[index - 1])) };
}
