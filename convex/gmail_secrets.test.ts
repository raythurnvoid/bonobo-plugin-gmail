import { describe, expect, test } from "vitest";
import { gmail_decrypt, gmail_encrypt, gmail_google_token_purpose, gmail_random_secret, gmail_sha256 } from "./gmail_secrets";

describe("gmail_encrypt", () => {
	test("uses a fresh nonce and binds ciphertext to its purpose", async () => {
		const first = await gmail_encrypt("private", "grant:one");
		const second = await gmail_encrypt("private", "grant:one");
		expect(first).not.toBe(second);
		expect(await gmail_decrypt(first, "grant:one")).toBe("private");
		await expect(gmail_decrypt(first, "grant:two")).rejects.toThrow();
	});
	test("binds Google tokens to the exact trusted tenant and address", async () => {
		const purpose = gmail_google_token_purpose("org", "workspace", "ray@example.com");
		const encrypted = await gmail_encrypt("refresh", purpose);
		await expect(gmail_decrypt(encrypted, gmail_google_token_purpose("org", "other", "ray@example.com"))).rejects.toThrow();
		await expect(gmail_decrypt(encrypted, gmail_google_token_purpose("org", "workspace", "other@example.com"))).rejects.toThrow();
	});
});

describe("gmail_sha256", () => {
	test("hashes deterministically and uses 256-bit random secrets", async () => {
		expect(await gmail_sha256("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
		expect(gmail_random_secret()).toMatch(/^[0-9a-f]{64}$/);
		expect(gmail_random_secret()).not.toBe(gmail_random_secret());
	});
});
