import { describe, expect, test } from "vitest";
import { gmail_read_json } from "./gmail-request";

describe("gmail_read_json", () => {
	test("parses chunked JSON at the actual byte cap", async () => {
		const body = new ReadableStream<Uint8Array>({ start(controller) {
			controller.enqueue(new TextEncoder().encode('{"a":'));
			controller.enqueue(new TextEncoder().encode('"é"}'));
			controller.close();
		} });
		expect(await gmail_read_json(body, 10)).toEqual({ a: "é" });
	});
	test("aborts before parsing an oversized stream", async () => {
		let cancelled = false;
		const body = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new Uint8Array(11)); }, cancel() { cancelled = true; } });
		await expect(gmail_read_json(body, 10)).rejects.toThrow("source_too_large");
		expect(cancelled).toBe(true);
	});
	test("refuses missing and malformed JSON", async () => {
		await expect(gmail_read_json(null, 100)).rejects.toThrow("Missing JSON body");
		await expect(gmail_read_json(new Response("{").body, 100)).rejects.toThrow();
	});
});
