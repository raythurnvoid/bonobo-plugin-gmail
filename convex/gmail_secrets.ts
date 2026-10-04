if (!process.env.GMAIL_PLUGIN_ENCRYPTION_KEY) throw new Error("GMAIL_PLUGIN_ENCRYPTION_KEY is not set in Convex env");
const keyBytes = Uint8Array.from(atob(process.env.GMAIL_PLUGIN_ENCRYPTION_KEY), character => character.charCodeAt(0));
if (keyBytes.length !== 32) throw new Error("GMAIL_PLUGIN_ENCRYPTION_KEY must contain 32 bytes");
const key = crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt", "decrypt"]);
const encoder = new TextEncoder();

export async function gmail_sha256(value: string) {
	const hash = await crypto.subtle.digest("SHA-256", encoder.encode(value));
	return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export function gmail_random_secret() {
	return [...crypto.getRandomValues(new Uint8Array(32))].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function gmail_encrypt(value: string, purpose: string) {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: encoder.encode(purpose) }, await key, encoder.encode(value)));
	return btoa(String.fromCharCode(...iv, ...encrypted));
}

export async function gmail_decrypt(value: string, purpose: string) {
	const bytes = Uint8Array.from(atob(value), character => character.charCodeAt(0));
	const decoded = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes.slice(0, 12), additionalData: encoder.encode(purpose) }, await key, bytes.slice(12));
	return new TextDecoder().decode(decoded);
}

export function gmail_google_token_purpose(organizationId: string, workspaceId: string, email: string) {
	return JSON.stringify(["google-refresh", organizationId, workspaceId, email]);
}
