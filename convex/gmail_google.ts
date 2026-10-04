import { z } from "zod";
import { gmail_read_json } from "../shared/gmail-request";

const clientId = process.env.GMAIL_OAUTH_CLIENT_ID;
const clientSecret = process.env.GMAIL_OAUTH_CLIENT_SECRET;
export const GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
export const gmail_profile_response = z.object({ emailAddress: z.email(), historyId: z.string().regex(/^\d+$/) });
const token_response = z.object({ access_token: z.string().min(1), expires_in: z.number().positive(),
	scope: z.string().min(1), token_type: z.string().refine(value => value.toLowerCase() === "bearer"), refresh_token: z.string().min(1).optional() });
const error_response = z.object({ error: z.object({ errors: z.array(z.object({ reason: z.string() })).max(32) }) });

export class gmail_GoogleError extends Error {
	constructor(public readonly status: number, public readonly code: "google_revoked" | "gmail_request" | "gmail_temporary") { super(code); }
}

function config() {
	// Google setup is a user step. Missing credentials must never start consent or a source request.
	if (!clientId || !clientSecret) throw new Error("Gmail OAuth credentials are not set");
	return { clientId, clientSecret };
}

export function gmail_consent_url(state: string, callback: string) {
	const { clientId } = config();
	const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
	url.search = new URLSearchParams({ client_id: clientId, redirect_uri: callback, response_type: "code", access_type: "offline",
		prompt: "consent", include_granted_scopes: "false", scope: GMAIL_READONLY_SCOPE, state }).toString();
	return url.toString();
}

export async function gmail_google_token(input: { code: string; callback: string } | { refreshToken: string }) {
	const settings = config();
	const body = new URLSearchParams({ client_id: settings.clientId, client_secret: settings.clientSecret,
		...("code" in input ? { grant_type: "authorization_code", code: input.code, redirect_uri: input.callback }
			: { grant_type: "refresh_token", refresh_token: input.refreshToken }),
	});
	const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", redirect: "error",
		headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, signal: AbortSignal.timeout(20_000) });
	const raw = await gmail_read_json(response.body, 8192);
	if (!response.ok) {
		const failure = z.object({ error: z.string() }).safeParse(raw);
		throw new gmail_GoogleError(response.status, failure.success && failure.data.error === "invalid_grant" ? "google_revoked"
			: response.status === 429 || response.status >= 500 ? "gmail_temporary" : "gmail_request");
	}
	const parsed = token_response.safeParse(raw);
	if (!parsed.success || !parsed.data.scope.split(/\s+/).includes(GMAIL_READONLY_SCOPE) || ("code" in input && !parsed.data.refresh_token)) {
		throw new gmail_GoogleError(502, "gmail_request");
	}
	return parsed.data;
}

export async function gmail_google_get(path: string, accessToken: string, maximum: number, timeout = 20_000) {
	if (!path.startsWith("/") || path.startsWith("//")) throw new Error("Invalid Gmail path");
	const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`, {
		redirect: "error", headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(timeout),
	});
	if (!response.ok) {
		let rateLimited = false;
		if (response.status === 403) {
			try {
				const parsed = error_response.safeParse(await gmail_read_json(response.body, 8192));
				rateLimited = parsed.success && parsed.data.error.errors.length > 0 && parsed.data.error.errors.every(error =>
					["rateLimitExceeded", "userRateLimitExceeded", "dailyLimitExceeded"].includes(error.reason));
			} catch { /* An unreadable refusal is not proof of a rate limit. */ }
		} else await response.body?.cancel();
		throw new gmail_GoogleError(response.status, response.status === 429 || response.status >= 500 || rateLimited ? "gmail_temporary" : "gmail_request");
	}
	return gmail_read_json(response.body, maximum);
}
