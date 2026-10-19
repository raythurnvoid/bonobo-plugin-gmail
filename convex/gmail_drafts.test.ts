/// <reference types="vite/client" />
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { GMAIL_COMPOSE_SCOPE, GMAIL_READONLY_SCOPE } from "./gmail_google";
import { gmail_test_actor, gmail_test_fixture } from "../scripts/gmail-test-fixtures";

const plu = `plu_${"1".repeat(64)}`;
const clientDraftId = "5f0c7c1e-3d4b-4b8e-9a51-0d6f3c2b1a90";
const fields = { to: ["Ann <ann@example.com>"], cc: [], subject: "Hello", body: "First text" };

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(1_800_000_000_000); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

async function setup(grantActor = gmail_test_actor) {
	const f = await gmail_test_fixture();
	await f.t.run(ctx => ctx.db.patch(f.accountId, { composeGranted: true }));
	const gmail: { method: string; path: string; body: unknown }[] = [];
	const receipts = new Set<string>();
	vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = new URL(input instanceof Request ? input.url : String(input));
		const body: unknown = typeof init?.body === "string" ? JSON.parse(init.body) : null;
		if (url.origin === "https://oauth2.googleapis.com") {
			gmail.push({ method: "POST", path: "token", body: null });
			return Response.json({ access_token: "access", expires_in: 3600, scope: `${GMAIL_READONLY_SCOPE} ${GMAIL_COMPOSE_SCOPE}`, token_type: "Bearer" });
		}
		if (url.origin === "https://gmail.googleapis.com") {
			gmail.push({ method: init?.method ?? "GET", path: url.pathname.replace("/gmail/v1/users/me", ""), body });
			return Response.json({ id: "gmail-draft", message: { id: "gmail-message", threadId: "gmail-thread" } });
		}
		const grant = { ...grantActor, token: `psg_${"2".repeat(64)}`, scopes: [], expiresAt: Date.now() + 24 * 3600_000 };
		const requestId = body && typeof body === "object" && "requestId" in body ? String(body.requestId) : "";
		if (url.pathname.endsWith("/recover")) return receipts.has(requestId) ? Response.json(grant) : Response.json({ message: "No saved grant" }, { status: 404 });
		if (url.pathname.endsWith("/exchange")) {
			receipts.add(requestId);
			return Response.json(grant);
		}
		expect(url.pathname).toBe("/api/v1/plugins/service-grants/verify-live");
		return Response.json({ installationId: grantActor.installationId, phase: "interactive", destinationPathPrefix: null, scopes: [],
			expiresAt: grant.expiresAt, contentPermissions: { read: true, write: true } });
	}));
	const page = (path: string, request: unknown) => f.t.fetch(path, { method: "POST", body: JSON.stringify(request),
		headers: { Origin: "https://press.test", Authorization: `Bearer ${plu}`, "Content-Type": "application/json" } });
	const create = () => page("/page/drafts/create", { accountId: f.accountId, clientDraftId, fields, replyToGmailMessageId: null, byAgent: false });
	return { ...f, gmail, page, create };
}

describe("gmail drafts routes", () => {
	test("a member who did not connect the account cannot write a draft, and Gmail is never called", async () => {
		const { gmail, create } = await setup({ ...gmail_test_actor, actorUserId: "other" });
		const response = await create();
		expect(response.status).toBe(403);
		expect(await response.json()).toEqual({ code: "not_composer" });
		expect(gmail).toEqual([]);
	});
	test("a repeated create makes one Gmail draft", async () => {
		const { t, gmail, create } = await setup();
		expect((await create()).status).toBe(200);
		expect((await create()).status).toBe(200);
		expect(gmail.filter(call => call.path === "/drafts")).toHaveLength(1);
		expect(await t.run(ctx => ctx.db.query("gmail_drafts").collect())).toMatchObject([{ clientDraftId, gmailDraftId: "gmail-draft", subject: "Hello" }]);
	});
	test("send sends the fields from the request, not the last saved draft", async () => {
		const { t, gmail, page, create, accountId } = await setup();
		await create();
		const response = await page("/page/drafts/send", { accountId, clientDraftId, fields: { ...fields, subject: "Shown subject", body: "Shown text" } });
		expect(response.status).toBe(200);
		const sends = gmail.filter(call => call.path === "/drafts/send");
		expect(sends).toHaveLength(1);
		const sent = sends[0]!.body as { id: string; message: { raw: string } };
		expect(sent.id).toBe("gmail-draft");
		const raw = Buffer.from(sent.message.raw, "base64url").toString();
		expect(raw).toContain(`Subject: =?UTF-8?B?${Buffer.from("Shown subject").toString("base64")}?=`);
		expect(raw).toContain(Buffer.from("Shown text").toString("base64"));
		expect(await t.run(ctx => ctx.db.query("gmail_drafts").collect())).toEqual([]);
	});
});
