import { z } from "zod";
import { gmail_read_json } from "../shared/gmail-request";

const clientId = process.env.GMAIL_OAUTH_CLIENT_ID;
const clientSecret = process.env.GMAIL_OAUTH_CLIENT_SECRET;
export const GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
// Compose lets the Mail page write Gmail drafts and send them. Consent always asks for it, but the user can untick it.
export const GMAIL_COMPOSE_SCOPE = "https://www.googleapis.com/auth/gmail.compose";
export const gmail_profile_response = z.object({ emailAddress: z.email(), historyId: z.string().regex(/^\d+$/) });
const token_response = z.object({ access_token: z.string().min(1), expires_in: z.number().positive(),
	scope: z.string().min(1), token_type: z.string().refine(value => value.toLowerCase() === "bearer"), refresh_token: z.string().min(1).optional() });
const error_response = z.object({ error: z.object({ errors: z.array(z.object({ reason: z.string() })).max(32) }) });

export class gmail_GoogleError extends Error {
	constructor(public readonly status: number, public readonly code: "google_revoked" | "gmail_request" | "gmail_temporary" | "compose_not_granted") { super(code); }
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
		prompt: "consent", include_granted_scopes: "false", scope: `${GMAIL_READONLY_SCOPE} ${GMAIL_COMPOSE_SCOPE}`, state }).toString();
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
	return { ...parsed.data, composeGranted: parsed.data.scope.split(/\s+/).includes(GMAIL_COMPOSE_SCOPE) };
}

async function google_failure(response: Response, write: boolean) {
	let temporary = false;
	let scopeMissing = false;
	if (response.status === 403) {
		try {
			const parsed = error_response.safeParse(await gmail_read_json(response.body, 8192));
			const reasons = parsed.success ? parsed.data.error.errors.map(error => error.reason) : [];
			// Quota limits and Google server errors (backendError) clear with time. A Gmail API turned off in
			// the Google project (accessNotConfigured) clears when the operator turns it on. Sync reads wait and
			// try again for all of them, so no member has to press Retry sync after the fix. A page write keeps
			// only rate limits as temporary. The member sees its error at once, and a refused Send must not say
			// "we could not confirm that it was sent".
			const temporaryReasons = ["rateLimitExceeded", "userRateLimitExceeded", "dailyLimitExceeded",
				...(write ? [] : ["quotaExceeded", "limitExceeded", "backendError", "accessNotConfigured"])];
			temporary = reasons.length > 0 && reasons.every(reason => temporaryReasons.includes(reason));
			scopeMissing = reasons.includes("insufficientPermissions");
			// The reasons show the operator why Gmail refused. They hold no mail data.
			console.warn("Gmail refused a request", { status: 403, reasons });
		} catch { /* An unreadable refusal is not proof of a temporary error. */ }
	} else await response.body?.cancel();
	return new gmail_GoogleError(response.status, response.status === 429 || response.status >= 500 || temporary ? "gmail_temporary"
		: write && scopeMissing ? "compose_not_granted" : "gmail_request");
}

export async function gmail_google_get(path: string, accessToken: string, maximum: number, timeout = 20_000) {
	if (!path.startsWith("/") || path.startsWith("//")) throw new Error("Invalid Gmail path");
	const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`, {
		redirect: "error", headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(timeout),
	});
	if (!response.ok) throw await google_failure(response, false);
	return gmail_read_json(response.body, maximum);
}

/**
 * Write to Gmail for the drafts routes. A 403 for a missing scope becomes `compose_not_granted`, so the page can ask for it.
 */
export async function gmail_google_write(method: "POST" | "PUT" | "DELETE", path: string, body: unknown, accessToken: string, maximum: number, timeout = 20_000) {
	if (!path.startsWith("/") || path.startsWith("//")) throw new Error("Invalid Gmail path");
	const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`, {
		method, redirect: "error", signal: AbortSignal.timeout(timeout),
		headers: { Authorization: `Bearer ${accessToken}`, ...(body === null ? {} : { "Content-Type": "application/json" }) },
		...(body === null ? {} : { body: JSON.stringify(body) }),
	});
	if (!response.ok) throw await google_failure(response, true);
	if (response.status === 204) return null;
	return gmail_read_json(response.body, maximum);
}
