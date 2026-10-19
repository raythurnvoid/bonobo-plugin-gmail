import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import { z } from "zod";
import { gmail_page_post } from "./gmail-api";
import type { DraftFields } from "./mail-drafts";

/**
 * The backend waits up to 25 seconds for Gmail, after the Press checks. Wait longer here, so a slow
 * send does not look like a failure.
 */
const SEND_TIMEOUT_MS = 45_000;

/**
 * Send a draft with the fields the editor shows. Only the draft editor's Send button calls this.
 * The agent tools module must never import this file: the agent can write drafts but not send them.
 */
export async function send_draft(
	client: Pick<BonoboClient, "getToken" | "refreshToken">,
	args: { accountId: string; clientDraftId: string; fields: DraftFields },
) {
	await gmail_page_post(client, "/page/drafts/send", args, z.object({ sent: z.boolean() }), SEND_TIMEOUT_MS);
}
