import type { BonoboHttpApi, BonoboHttpApiPath } from "bonobo-plugin-sdk/http-api";
import { z } from "zod";

if (!process.env.PRESS_HTTP_URL) throw new Error("PRESS_HTTP_URL is not set in Convex env");
if (!process.env.PRESS_GMAIL_SERVICE_SECRET) throw new Error("PRESS_GMAIL_SERVICE_SECRET is not set in Convex env");
export const press_HTTP_URL = process.env.PRESS_HTTP_URL;
const serviceSecret = process.env.PRESS_GMAIL_SERVICE_SECRET;

export const gmail_grant_response = z.object({
	token: z.string().regex(/^psg_[0-9a-f]{64}$/), expiresAt: z.number().positive(), scopes: z.array(z.string()),
	actorUserId: z.string().min(1), organizationId: z.string().min(1), workspaceId: z.string().min(1), installationId: z.string().min(1),
});

export class gmail_HostError extends Error {
	constructor(public readonly status: number, public readonly reason: string) { super(reason); }
}

// Adapted from Chitchat: every backend call carries the separate service proof.
export async function press_post<Path extends BonoboHttpApiPath>(path: Path, body: BonoboHttpApi[Path]["POST"]["body"], token: string) {
	const response = await fetch(`${press_HTTP_URL}${path}`, {
		method: "POST", redirect: "error",
		headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "X-Bonobo-Service-Authorization": `Bearer ${serviceSecret}` },
		body: JSON.stringify(body), signal: AbortSignal.timeout(15_000),
	});
	const parsed: unknown = await response.json();
	return { status: response.status, body: parsed };
}

export async function gmail_host_post<Path extends BonoboHttpApiPath, T>(path: Path, body: BonoboHttpApi[Path]["POST"]["body"], token: string, validator: z.ZodType<T>): Promise<T> {
	const response = await press_post(path, body, token);
	if (response.status !== 200) {
		const parsed = z.object({ message: z.string() }).safeParse(response.body);
		throw new gmail_HostError(response.status, parsed.success ? parsed.data.message : "invalid_response");
	}
	const parsed = validator.safeParse(response.body);
	if (!parsed.success) throw new gmail_HostError(502, "invalid_response");
	return parsed.data;
}
