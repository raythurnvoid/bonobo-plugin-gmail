import { describe, expect, test, vi } from "vitest";
import {
	GMAIL_BODY_BYTES, GMAIL_MARKDOWN_BYTES, gmail_attachment_name, gmail_body_text, gmail_cap_text,
	gmail_decode_base64, gmail_decode_header, gmail_discover_message, gmail_file_path,
	gmail_format_markdown, gmail_history_events, gmail_slug, gmail_unique_attachment_names,
} from "./gmail-codec";

function message(payload: unknown, labelIds: string[] = []) {
	return { id: "18c2f0a1b2c3d4e5", threadId: "18c2f0a1b2c3d000", internalDate: String(Date.parse("2026-09-27T23:59:59Z")), labelIds, payload };
}

describe("gmail_cap_text", () => {
	test.each([
		["plain", 0, ""], ["plain", 3, "pla"], ["a😀b", 4, "a"],
		["a😀b", 5, "a😀"], ["éé", 3, "é"], ["éé", 4, "éé"],
	])("cuts %s at %i bytes without splitting a character", (input, bytes, expected) => {
		expect(gmail_cap_text(input, bytes)).toBe(expected);
	});
	test("cuts the input before allocating UTF-8 bytes", () => {
		const input = "a".repeat(65536);
		const allocation = vi.spyOn(Buffer, "from");
		expect(gmail_cap_text(input, 512)).toBe("a".repeat(512));
		expect(allocation.mock.calls.map(([value]) => typeof value === "string" ? value.length : null)).toEqual([512]);
	});
});

describe("gmail_attachment_name", () => {
	test.each([
		["AGENTS.md", "agents-attachment.md"], ["README", "readme-attachment"], ["SKILL.md", "skill-attachment.md"],
		["../AGENTS.md", "agents-attachment.md"], ["C:\\foo\\Invoice.PDF", "invoice.pdf"],
		[".hidden..name.PDF", "hidden.name.pdf"], ["Résumé _- invoice.pdf", "resume-invoice.pdf"],
		["日本語.pdf", "attachment.pdf"], ["", "attachment"],
	])("normalizes %s to %s", (input, expected) => expect(gmail_attachment_name(input)).toBe(expected));
	test("bounds the basename and extension", () => {
		const name = gmail_attachment_name(`${"a".repeat(300)}.${"b".repeat(40)}`);
		expect(name.split(".").map(part => part.length)).toEqual([120, 16]);
	});
	test("reserves suffix-shaped names before resolving duplicates", () => {
		expect(gmail_unique_attachment_names(["invoice.pdf", "invoice.pdf", "invoice-2.pdf", "invoice.pdf"]))
			.toEqual(["invoice.pdf", "invoice-3.pdf", "invoice-2.pdf", "invoice-4.pdf"]);
	});
});

describe("gmail_file_path", () => {
	test("uses UTC and the full Gmail id", () => {
		const parsed = gmail_discover_message(message({ headers: [{ name: "Subject", value: "Invoice for September" }] }));
		expect(gmail_file_path(parsed, "/emails/ray-example.com"))
			.toBe("/emails/ray-example.com/2026/09/27-invoice-for-september-18c2f0a1b2c3d4e5.md");
	});
	test("trims the end after cutting a subject", () => {
		expect(gmail_slug(`${"a".repeat(59)}-tail`, 60)).toBe("a".repeat(59));
		expect(gmail_slug("日本語", 60)).toBe("untitled");
	});
	test.each(["invoice", "hello.world", "resume-2026", "mail.example-gmail.com", "untitled"])("keeps canonical Press folder %s", name => {
		expect(gmail_slug(name)).toBe(name);
		expect(name).toMatch(/^(?!.*[._-]{2})[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/);
	});
});

describe("gmail_decode_base64", () => {
	test("decodes URL-safe data without changing its alphabet", () => {
		const bytes = Buffer.from([0, 255, 254, 13]);
		expect(gmail_decode_base64(bytes.toString("base64url"), 4)).toEqual(bytes);
	});
	test.each(["a", "**", "ab+/"])("rejects malformed %s", input => expect(() => gmail_decode_base64(input, 100)).toThrow("invalid_source"));
	test("refuses decoded bytes above the cap", () => expect(() => gmail_decode_base64("YWJjZA", 3)).toThrow("too_large"));
});

describe("gmail_decode_header", () => {
	test("decodes adjacent words and a declared charset", () => {
		expect(gmail_decode_header("=?UTF-8?B?SGVsbG8=?= =?UTF-8?Q?_world?=")).toBe("Hello world");
		expect(gmail_decode_header("=?ISO-8859-1?Q?caf=E9?=")).toBe("café");
	});
	test("keeps unsupported words readable", () => expect(gmail_decode_header("=?not-a-charset?Q?test?=")).toBe("=?not-a-charset?Q?test?="));
});

describe("gmail_discover_message", () => {
	test("prefers plain text across nested multipart", () => {
		const parsed = gmail_discover_message(message({ mimeType: "multipart/mixed", parts: [
			{ mimeType: "multipart/alternative", parts: [
				{ partId: "0.0", mimeType: "text/html", body: { size: 4, data: "aHRtbA" } },
				{ partId: "0.1", mimeType: "text/plain", body: { size: 4, attachmentId: "external-body" } },
			] },
			{ partId: "1", filename: "a.pdf", body: { size: 1, data: "YQ" } },
		] }));
		expect(parsed.bodyParts.map(part => part.partId)).toEqual(["0.1"]);
		expect(parsed.bodyParts[0].attachmentId).toBe("external-body");
		expect(parsed.attachments[0].filename).toBe("a.pdf");
	});
	test("never selects body below an attached container", () => {
		const parsed = gmail_discover_message(message({ parts: [
			{ mimeType: "message/rfc822", filename: "forward.eml", parts: [{ mimeType: "text/plain", body: { size: 6, data: "c2VjcmV0" } }] },
			{ mimeType: "multipart/mixed", headers: [{ name: "Content-Disposition", value: "attachment; filename=x" }], parts: [{ mimeType: "text/plain" }] },
		] }));
		expect(parsed.bodyParts).toHaveLength(0);
		expect(parsed.attachments).toHaveLength(2);
	});
	test("skips only images with Content-ID", () => {
		const parsed = gmail_discover_message(message({ parts: [
			{ mimeType: "image/png", filename: "inline.png", headers: [{ name: "Content-ID", value: "<one>" }] },
			{ mimeType: "application/pdf", filename: "kept.pdf", headers: [{ name: "Content-ID", value: "<two>" }] },
			{ mimeType: "image/png", filename: "kept.png" },
		] }));
		expect(parsed.attachments.map(part => part.filename)).toEqual(["kept.pdf", "kept.png"]);
	});
	test("keeps only 16 attachment sources from 1000 parts", () => {
		const parsed = gmail_discover_message(message({ parts: Array.from({ length: 1000 }, (_, i) => ({ filename: `file-${i}.pdf`, body: { size: 1, data: "YQ" } })) }));
		expect(parsed.attachments).toHaveLength(16);
		expect(parsed.overflowNames).toHaveLength(984);
		expect(parsed.overflowNames.every(name => typeof name === "string")).toBe(true);
	});
	test("stops before body fetch on excessive size or parts", () => {
		const large = gmail_discover_message(message({ mimeType: "text/plain", body: { size: GMAIL_BODY_BYTES + 1, attachmentId: "unneeded" } }));
		expect(large.bodyLimit).toBe("bytes");
		expect(large.bodyParts).toHaveLength(0);
		const many = gmail_discover_message(message({ parts: Array.from({ length: 9 }, () => ({ mimeType: "text/plain", body: { size: 1, attachmentId: "unneeded" } })) }));
		expect(many.bodyLimit).toBe("parts");
		expect(many.bodyParts).toHaveLength(0);
	});
	test("rejects excessive MIME depth and count", () => {
		let payload: unknown = { mimeType: "text/plain" };
		for (let i = 0; i < 33; i++) payload = { parts: [payload] };
		expect(() => gmail_discover_message(message(payload))).toThrow("mime_too_large");
		expect(() => gmail_discover_message(message({ parts: Array.from({ length: 4096 }, () => ({})) }))).toThrow("mime_too_large");
	});
	test("parses quoted address lists and encoded names", () => {
		const parsed = gmail_discover_message(message({ headers: [{ name: "To", value: '"Doe, Jane" <jane@example.com>, =?UTF-8?Q?Ren=C3=A9?= <rene@example.com>' }] }));
		expect(parsed.to).toEqual(["Doe, Jane <jane@example.com>", "René <rene@example.com>"]);
	});
	test.each([
		["Subject", "subject"], ["From", "from"], ["Message-ID", "messageId"], ["In-Reply-To", "inReplyTo"],
	] as const)("caps %s input before decoding encoded words", (name, field) => {
		const word = "=?UTF-8?Q?inside?=";
		const prefix = word + " ".repeat(8192 - word.length);
		const parsed = gmail_discover_message(message({ headers: [{ name, value: prefix + "=?UTF-8?Q?outside?=" }] }));
		expect(parsed[field]).toBe("inside" + " ".repeat(8192 - word.length));
		expect(parsed.headersShortened).toBe(true);
		expect(gmail_format_markdown(parsed, "Body")).toContain("Some header text was shortened.");
	});
	test.each(["to", "cc", "bcc"] as const)("caps %s input before decoding and parsing addresses", name => {
		const address = "=?UTF-8?Q?Ren=C3=A9?= <rene@example.com>";
		const value = address + " ".repeat(65536 - address.length) + ", outside@example.com";
		const parsed = gmail_discover_message(message({ headers: [{ name, value }] }, ["SENT"]));
		expect(parsed[name]).toEqual(["René <rene@example.com>"]);
		expect(parsed.headersShortened).toBe(true);
	});
	test("caps attachment name input before decoding display text", () => {
		const word = "=?UTF-8?Q?report?=";
		const prefix = word + " ".repeat(512 - word.length);
		const parsed = gmail_discover_message(message({ parts: [{ filename: prefix + "=?UTF-8?Q?outside?=", body: { size: 1, data: "YQ" } }] }));
		expect(parsed.attachments[0].displayName).toBe("report" + " ".repeat(512 - word.length));
		expect(parsed.attachments[0].filename).toBe("report");
	});
	test("caps body charset headers before extraction", () => {
		const type = "text/plain;";
		const charset = "text/plain; charset=";
		const parsed = gmail_discover_message(message({ parts: [
			{ mimeType: "text/plain", headers: [{ name: "Content-Type", value: type + " ".repeat(8192 - type.length) + "charset=ISO-8859-1" }], body: { size: 2, data: "w6k" } },
			{ mimeType: "text/plain", headers: [{ name: "Content-Type", value: charset + "x".repeat(65536) }], body: { size: 2, data: "w6k" } },
		] }));
		expect(parsed.bodyParts.map(part => [part.charset.slice(0, 20), Buffer.byteLength(part.charset)]))
			.toEqual([["utf-8", 5], ["x".repeat(20), 8192 - charset.length]]);
		expect(gmail_body_text(parsed.bodyParts.map(part => ({ ...part, bytes: gmail_decode_base64(part.data!, GMAIL_BODY_BYTES) })))).toBe("é\n\né");
	});
});

describe("gmail_body_text", () => {
	test("decodes charset and HTML entities with block breaks", () => {
		expect(gmail_body_text([{ bytes: Buffer.from("<p>caf\xe9 &amp; tea</p><script>bad()</script><div>next</div>", "latin1"), charset: "ISO-8859-1", mimeType: "text/html" }]))
			.toBe("café & tea\nnext\n");
	});
	test("checks actual total bytes before conversion", () => expect(() => gmail_body_text([{ bytes: new Uint8Array(GMAIL_BODY_BYTES + 1), charset: "utf-8", mimeType: "text/plain" }])).toThrow("too_large"));
});

describe("gmail_format_markdown", () => {
	test("uses bounded YAML and sent-only Bcc", () => {
		const payload = { headers: [
			{ name: "Subject", value: 'Quotes " and\nlines: yes' },
			{ name: "To", value: Array.from({ length: 600 }, (_, i) => `user${i}@example.com`).join(",") },
			{ name: "Bcc", value: "secret@example.com" },
		], parts: [{ filename: "AGENTS.md", body: { size: 1, data: "YQ" } }] };
		const received = gmail_format_markdown(gmail_discover_message(message(payload)), "Body");
		const sent = gmail_format_markdown(gmail_discover_message(message(payload, ["SENT"])), "Body");
		expect(received).not.toContain("bcc:");
		expect(sent).toContain('bcc: ["secret@example.com"]');
		expect(sent).toContain('direction: "sent"');
		expect(JSON.parse(sent.split("\n").find(line => line.startsWith("to: "))!.slice(4))).toHaveLength(50);
		expect(sent).toContain("Full to list:");
		expect(sent).toContain("planned names, not proof");
		expect(sent).toContain("agents-attachment.md");
		expect(sent).toContain('subject: "Quotes \\" and\\nlines: yes"');
	});
	test("caps the complete file on UTF-8 boundaries", () => {
		const parsed = gmail_discover_message(message({ headers: [{ name: "Subject", value: "Subject" }] }));
		const markdown = gmail_format_markdown(parsed, "é".repeat(1024 * 1024));
		expect(Buffer.byteLength(markdown)).toBeLessThanOrEqual(GMAIL_MARKDOWN_BYTES);
		expect(markdown).toContain("Body shortened");
		expect(markdown).not.toContain("�");
		expect(gmail_cap_text("a😀b", 4)).toBe("a");
	});
});

describe("gmail_history_events", () => {
	test("sorts numeric ids and typed changes, removes duplicates, and puts deletion last", () => {
		const parsed = gmail_history_events({ historyId: "9007199254741000", history: [
			{ id: "9007199254740994", messages: [{ id: "ignored" }], messagesDeleted: [{ message: { id: "a" } }],
				messagesAdded: [{ message: { id: "a" } }, { message: { id: "a" } }],
				labelsRemoved: [{ message: { id: "a" }, labelIds: ["UNREAD", "SPAM", "TRASH"] }] },
			{ id: "99", messagesAdded: [{ message: { id: "b" } }] },
		] });
		expect(parsed.events.map(event => [event.historyId, event.gmailMessageId, event.kind])).toEqual([
			["99", "b", "added"], ["9007199254740994", "a", "added"], ["9007199254740994", "a", "rescue_spam"],
			["9007199254740994", "a", "rescue_trash"], ["9007199254740994", "a", "deleted"],
		]);
	});
	test("keeps the cursor of ignored-only and empty pages", () => {
		expect(gmail_history_events({ historyId: "42", history: [{ id: "41", labelsRemoved: [{ message: { id: "a" }, labelIds: ["UNREAD"] }] }] }))
			.toEqual({ historyId: "42", nextPageToken: null, events: [] });
		expect(gmail_history_events({ historyId: "43" }).historyId).toBe("43");
	});
	test("rejects malformed consumed fields", () => expect(() => gmail_history_events({ historyId: 42 })).toThrow("invalid_source"));
});
