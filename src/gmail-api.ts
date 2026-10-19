import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import { z } from "zod";

const id = z.string().min(1).max(128);
const time = z.number().finite().nonnegative().nullable();
const count = z.number().int().nonnegative();
export const gmail_binding = z.object({ organizationId: id, workspaceId: id, installationId: id, actorUserId: id });
export const gmail_saved_start = z.object({
	binding: gmail_binding,
	clientRequestId: z.string().regex(/^[0-9a-f]{64}$/),
	accountId: id.nullable(),
	attemptId: id.nullable(),
	purpose: z.enum(["connect", "compose"]),
});
const oauth_status = z.enum([
	"preparing",
	"pending",
	"exchanging",
	"awaiting_finish",
	"finished",
	"failed",
	"cancelled",
]);
export const gmail_start_response = z.object({
	attemptId: id,
	status: oauth_status,
	consentUrl: z
		.url()
		.refine((value) => new URL(value).origin === "https://accounts.google.com")
		.optional(),
});
export const gmail_status_response = z.object({
	binding: gmail_binding,
	canWrite: z.boolean(),
	cursor: z.string().nullable(),
	attempt: z
		.object({
			attemptId: id,
			status: oauth_status,
			expiresAt: z.number().finite().positive(),
			clientRequestId: z.string().regex(/^[0-9a-f]{64}$/),
			accountId: id.nullable(),
			purpose: z.enum(["connect", "compose"]),
		})
		.nullable(),
	accounts: z
		.array(
			z.object({
				accountId: id,
				emailAddress: z.email(),
				destinationPath: z.string().min(1),
				connectionGeneration: z.number().int().positive(),
				syncStatus: z.enum(["backfilling", "live", "blocked", "error", "disconnected"]),
				syncError: z.string().nullable(),
				sourceError: z.enum(["google_revoked", "gmail_request", "history_response_too_large"]).nullable(),
				pressReady: z.boolean(),
				canRepair: z.boolean(),
				needsReconnect: z.boolean(),
				isComposer: z.boolean(),
				canCompose: z.boolean(),
				backfillComplete: z.boolean(),
				messagesSynced: count,
				messagesSkipped: count,
				ledgerCounts: z.object({
					pending: count,
					done: count,
					skipped: count,
					failed: count,
					given_up: count,
					emailAssumed: count,
					permissionHeld: count,
				}),
				attachmentsSkippedReason: z.enum(["plan", "storage"]).nullable(),
				nextSyncAt: time,
				nextPermissionRetryAt: time,
				lastSyncedAt: time,
			}),
		)
		.max(25),
});
export const gmail_failures_response = z.object({
	items: z.array(z.object({ gmailMessageId: z.string().regex(/^[0-9a-f]+$/), reasonCode: z.string() })).max(25),
	cursor: z.string().nullable(),
});

const backend = import.meta.env.VITE_CONVEX_SITE_URL;
if (!backend) throw new Error("VITE_CONVEX_SITE_URL is missing");
const error_body = z.object({ code: z.string() });

export class gmail_ApiError extends Error {
	constructor(readonly code: string) {
		super(code);
	}
}

const messages: Record<string, string> = {
	press_access_changed: "Press access changed. Reopen the page to resume.",
	page_write_refused: "You need write access to change this connection.",
	account_capacity: "This service has reached its connection limit. Ask the operator to check hosting capacity.",
	rate_limited: "Too many requests. Wait a minute and try again.",
	start_again: "This connection expired or stopped. Start again.",
	choose_reconnect: "This Gmail account already exists here. Use Reconnect Gmail.",
	gmail_account_changed: "Use the same Gmail account for Reconnect.",
	invalid_finish_code: "The finish code is not valid. Copy it from the Google callback page.",
	connection_changed: "The connection changed. Refresh this page.",
	google_reconnect_needed: "Use Reconnect Gmail for this account.",
	attempt_expired: "This connection expired. Start again.",
	compose_not_granted: "Drafts are off for this account. Open the Gmail page and press Allow drafts and Send.",
	not_composer: "Only the member who connected this account can write drafts for it.",
	account_not_found: "This Gmail account is no longer connected here.",
	draft_gone: "This draft is no longer in Gmail. It was sent or deleted there.",
	draft_saving: "The draft is still being saved. Try again in a moment.",
	draft_unreadable: "This draft was changed in Gmail into a form this page cannot edit. Open it in Gmail.",
	draft_too_large: "A draft can have at most 50 KB of text. Shorten the body.",
	invalid_recipient: "One of the addresses is not a valid email address. Use name@example.com or Name <name@example.com>.",
	invalid_header: "The subject or an address has a line break. Remove it.",
	no_recipient: "Add at least one recipient before you send.",
	email_not_found: "Gmail no longer has the email this reply answers.",
	gmail_busy: "Gmail is busy. Try again in a moment.",
	gmail_refused: "Gmail refused the request. Try again, or check the draft in Gmail.",
	body_too_large: "This draft is too large to save.",
};

/**
 * A random 64-character hex id. The backend uses it to recognize a repeated request.
 */
export function gmail_new_request_id() {
	return [...crypto.getRandomValues(new Uint8Array(32))].map((value) => value.toString(16).padStart(2, "0")).join("");
}

/**
 * The text a page shows for a backend error code.
 */
export function gmail_error_message(error: unknown) {
	return error instanceof gmail_ApiError
		? (messages[error.code] ?? "Gmail service is unavailable. Retry or ask the operator to check Convex.")
		: "Gmail service is unavailable. Retry or ask the operator to check Convex.";
}

export async function gmail_page_post<T>(
	client: Pick<BonoboClient, "getToken" | "refreshToken">,
	path: string,
	body: unknown,
	validator: z.ZodType<T>,
	timeout = 20_000,
) {
	let token = await client.getToken();
	for (let attempt = 0; attempt < 2; attempt++) {
		const response = await fetch(`${backend}${path}`, {
			method: "POST",
			redirect: "error",
			cache: "no-store",
			headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(timeout),
		});
		if (response.status === 401 && attempt === 0) {
			token = await client.refreshToken();
			continue;
		}
		const raw: unknown = await response.json();
		if (!response.ok) {
			const parsed = error_body.safeParse(raw);
			throw new gmail_ApiError(parsed.success ? parsed.data.code : "service_unavailable");
		}
		const parsed = validator.safeParse(raw);
		if (!parsed.success) throw new gmail_ApiError("service_unavailable");
		return parsed.data;
	}
	throw new gmail_ApiError("press_access_changed");
}

export function gmail_check_status(lastSyncedAt: number | null, now: number) {
	return lastSyncedAt === null ? "unchecked" : now - lastSyncedAt > 10 * 60_000 ? "delayed" : "recent";
}
