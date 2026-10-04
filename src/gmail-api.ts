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

export async function gmail_page_post<T>(
	client: Pick<BonoboClient, "getToken" | "refreshToken">,
	path: string,
	body: unknown,
	validator: z.ZodType<T>,
) {
	let token = await client.getToken();
	for (let attempt = 0; attempt < 2; attempt++) {
		const response = await fetch(`${backend}${path}`, {
			method: "POST",
			redirect: "error",
			cache: "no-store",
			headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(20_000),
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
