import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import type { BonoboHttpApi, BonoboHttpApiPath, BonoboHttpResponse } from "bonobo-plugin-sdk/http-api";
import { gmail_ApiError, gmail_error_message } from "./gmail-api";

/**
 * How many times a rate-limited call is sent again before its 429 is returned.
 */
const MAX_429_RETRIES = 4;

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function get_error_message(error: unknown): string {
	// A backend error carries only a code. Show its text.
	if (error instanceof gmail_ApiError) {
		return gmail_error_message(error);
	}
	return error instanceof Error ? error.message : String(error);
}

/**
 * `client.fetchJson` with the 429 back-off the SDK README asks for: wait `retryAfterMs` plus a
 * small random delay, then send the exact same body (including any cursor) again.
 *
 * A 429 without `retryAfterMs` ("Plugin API call limit exceeded") does not clear soon, so it comes
 * back at once. Every other status comes back for the caller to narrow on, a 5xx included.
 */
export async function fetch_json_with_429_retry<P extends BonoboHttpApiPath>(
	client: BonoboClient,
	path: P,
	body: BonoboHttpApi[P]["POST"]["body"],
): Promise<BonoboHttpResponse<P>> {
	for (let attempt = 0; ; attempt += 1) {
		const answer = await client.fetchJson(path, body);
		// The generic answer type does not name `retryAfterMs`, so read it from the plain object.
		const answerBody: unknown = answer.body;
		const retryAfterMs =
			answer.status === 429 && typeof answerBody === "object" && answerBody !== null && "retryAfterMs" in answerBody
				? answerBody.retryAfterMs
				: undefined;
		if (typeof retryAfterMs === "number" && attempt < MAX_429_RETRIES) {
			await sleep(retryAfterMs + Math.random() * 250);
			continue;
		}
		return answer;
	}
}
