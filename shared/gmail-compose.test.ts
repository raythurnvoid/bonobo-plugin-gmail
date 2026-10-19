import { describe, expect, test } from "vitest";
import { gmail_compose_raw } from "./gmail-compose";
import { gmail_decode_header } from "./gmail-codec";

const fields = { to: ["Ann Lee <ann@example.com>"], cc: [], subject: "Hello", body: "Line one\nLine two" };

function headers(raw: string) {
	const text = Buffer.from(raw, "base64url").toString();
	return text.slice(0, text.indexOf("\r\n\r\n")).replace(/\r\n /g, " ");
}

describe("gmail_compose_raw", () => {
	test.each([
		{ ...fields, subject: "Hi\r\nBcc: spy@example.com" },
		{ ...fields, to: ["ann@example.com\r\nBcc: spy@example.com"] },
		{ ...fields, to: ["Ann <ann@example.com>, spy@example.com"] },
	])("refuses text that would add a header or a hidden recipient", input => {
		expect(() => gmail_compose_raw({ ...input, from: "ray@example.com", reply: null })).toThrow();
	});
	test("encodes names and subject, and keeps only well-formed reply ids", () => {
		const references = Array.from({ length: 25 }, (_, index) => `<r${index}@example.com>`).join(" ");
		const head = headers(gmail_compose_raw({ ...fields, subject: "Città 🙂", from: "ray@example.com",
			reply: { gmailThreadId: "thread", messageIdHeader: "<parent@example.com>", referencesHeader: `${references} <bad id> junk` } }));
		expect(gmail_decode_header(/^Subject: (.*)$/m.exec(head)![1]!)).toBe("Città 🙂");
		expect(head).toMatch(/^To: =\?UTF-8\?B\?[^?]+\?= <ann@example\.com>$/m);
		expect(head).toContain("In-Reply-To: <parent@example.com>");
		const kept = /^References: (.*)$/m.exec(head)![1]!.split(" ");
		expect(kept).toHaveLength(20);
		expect(kept.at(-1)).toBe("<parent@example.com>");
		expect(kept).not.toContain("<bad");
	});
});

