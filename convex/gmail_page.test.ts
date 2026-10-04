/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import schema from "./schema";
import { gmail_page_auth } from "./gmail_page";

const modules = import.meta.glob("./**/*.ts");
const plu = `plu_${"1".repeat(64)}`;
const grantToken = `psg_${"2".repeat(64)}`;

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(1_800_000_000_000); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

function setup() {
	const t = convexTest(schema, modules);
	const requests: { path: string; body: unknown }[] = [];
	const state = { read: true, write: true, verifyStatus: 200, loseExchange: false, exchanges: 0 };
	const receipts = new Set<string>();
	const grant = { token: grantToken, scopes: [], expiresAt: Date.now() + 24 * 60 * 60_000,
		organizationId: "org", workspaceId: "workspace", installationId: "installation", actorUserId: "actor" };
	vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
		const path = new URL(input instanceof Request ? input.url : String(input)).pathname;
		if (typeof init?.body !== "string") throw new Error("Missing request body");
		const body: unknown = JSON.parse(init.body);
		requests.push({ path, body });
		expect(new Headers(init.headers).get("X-Bonobo-Service-Authorization")).toBe("Bearer pse_testservice");
		if (path.endsWith("/recover") || path.endsWith("/exchange")) {
			if (!body || typeof body !== "object" || !("requestId" in body) || typeof body.requestId !== "string") throw new Error("Missing request id");
			if (path.endsWith("/recover")) return receipts.has(body.requestId) ? Response.json(grant) : Response.json({ message: "No saved grant response" }, { status: 404 });
			receipts.add(body.requestId);
		}
		if (path.endsWith("/exchange")) {
			state.exchanges++;
			if (state.loseExchange) { state.loseExchange = false; throw new Error("Lost exchange response"); }
			return Response.json(grant);
		}
		expect(path).toBe("/api/v1/plugins/service-grants/verify-live");
		if (state.verifyStatus !== 200) return Response.json({ message: "refused" }, { status: state.verifyStatus });
		return Response.json({ installationId: "installation", phase: "interactive", destinationPathPrefix: null, scopes: [],
			expiresAt: grant.expiresAt, contentPermissions: { read: state.read, write: state.write } });
	}));
	return { t, requests, state };
}

function status_request(t: ReturnType<typeof setup>["t"], options: { origin?: string | null; token?: string; body?: string } = {}) {
	return t.fetch("/page/status", { method: "POST", body: options.body ?? "{}", headers: {
		...(options.origin === null ? {} : { Origin: options.origin ?? "https://press.test" }),
		Authorization: `Bearer ${options.token ?? plu}`, "Content-Type": "application/json",
	} });
}

describe("gmail_page_auth", () => {
	test("exchanges once, caches reads for a minute, and never renews", async () => {
		const { t, requests, state } = setup();
		expect((await status_request(t)).status).toBe(200);
		expect((await status_request(t)).status).toBe(200);
		expect(state.exchanges).toBe(1);
		expect(requests.filter(r => r.path.endsWith("/verify-live"))).toHaveLength(1);
		vi.advanceTimersByTime(60_000);
		expect((await status_request(t)).status).toBe(200);
		expect(state.exchanges).toBe(1);
		expect(requests.filter(r => r.path.endsWith("/verify-live"))).toHaveLength(2);
		expect(requests.some(r => r.path.endsWith("/renew"))).toBe(false);
		const row = await t.run(ctx => ctx.db.query("page_tokens").unique());
		expect(row?.sourceSecret).toBeNull();
		expect(JSON.stringify(row)).not.toContain(plu);
		expect(JSON.stringify(row)).not.toContain(grantToken);
	});
	test("uses the same recovery request after a lost exchange response", async () => {
		const { t, requests, state } = setup(); state.loseExchange = true;
		expect((await status_request(t)).status).toBe(503);
		expect((await status_request(t)).status).toBe(200);
		expect(state.exchanges).toBe(1);
		const bodies = requests.filter(r => /\/(recover|exchange)$/.test(r.path)).map(r => r.body);
		expect(bodies[0]).toEqual(bodies[2]);
	});
	test("gives viewers read access and checks every change freshly", async () => {
		const { t, state, requests } = setup();
		await status_request(t);
		state.write = false;
		await expect(t.action(ctx => gmail_page_auth(ctx, plu, true))).rejects.toThrow("page_write_refused");
		await expect(t.action(ctx => gmail_page_auth(ctx, plu, true))).rejects.toThrow("page_write_refused");
		expect((await status_request(t)).status).toBe(200);
		expect(requests.filter(r => r.path.endsWith("/verify-live"))).toHaveLength(3);
	});
	test("ends its mapping at thirty minutes even while the grant is live", async () => {
		const { t, requests, state } = setup();
		await status_request(t);
		const first = await t.run(ctx => ctx.db.query("page_tokens").unique());
		vi.advanceTimersByTime(30 * 60_000);
		await status_request(t);
		const second = await t.run(ctx => ctx.db.query("page_tokens").unique());
		expect(second?.exchangeRequestId).not.toBe(first?.exchangeRequestId);
		expect(requests.filter(r => r.path.endsWith("/recover"))).toHaveLength(2);
		expect(state.exchanges).toBe(2);
	});
	test.each([401, 403, 404, 409])("drops a definitely dead cache on %s", async code => {
		const { t, state } = setup();
		await status_request(t); state.verifyStatus = code; vi.advanceTimersByTime(60_000);
		const response = await status_request(t);
		expect(response.status).toBe(401);
		expect(await response.json()).toEqual({ code: "press_access_changed" });
		expect(await t.run(ctx => ctx.db.query("page_tokens").unique())).toBeNull();
	});
	test("retains a cache through a temporary verification failure", async () => {
		const { t, state } = setup(); await status_request(t);
		state.verifyStatus = 503; vi.advanceTimersByTime(60_000);
		expect((await status_request(t)).status).toBe(503);
		expect(await t.run(ctx => ctx.db.query("page_tokens").unique())).not.toBeNull();
		state.verifyStatus = 200;
		expect((await status_request(t)).status).toBe(200);
		expect(state.exchanges).toBe(1);
	});
	test("bounds repeated unfinished exchanges before outbound work", async () => {
		const { t, state, requests } = setup(); state.verifyStatus = 503;
		for (let i = 0; i < 10; i++) expect((await status_request(t)).status).toBe(503);
		const count = requests.length;
		expect((await status_request(t)).status).toBe(429);
		expect(requests).toHaveLength(count);
	});
});

describe("page HTTP boundary", () => {
	test.each([null, "https://evil.test", "https://press.test.evil.test"])("refuses origin %s before auth", async origin => {
		const { t, requests } = setup();
		expect((await status_request(t, { origin })).status).toBe(403);
		expect(requests).toHaveLength(0);
	});
	test("allows the exact preflight headers", async () => {
		const { t, requests } = setup();
		const response = await t.fetch("/page/status", { method: "OPTIONS", headers: { Origin: "https://press.test" } });
		expect(response.status).toBe(204);
		expect(response.headers.get("Access-Control-Allow-Headers")).toBe("Authorization, Content-Type");
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://press.test");
		expect(response.headers.get("Vary")).toBe("Origin");
		expect(requests).toHaveLength(0);
	});
	test.each(["plu_bad", `plu_${"A".repeat(64)}`, "psg_other"])("refuses malformed token %s before outbound work", async token => {
		const { t, requests } = setup(); const response = await status_request(t, { token });
		expect(response.status).toBe(401);
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://press.test");
		expect(response.headers.get("Cache-Control")).toBe("no-store");
		expect(requests).toHaveLength(0);
	});
	test("caps actual body bytes before auth and rejects malformed JSON", async () => {
		const { t, requests } = setup();
		expect((await status_request(t, { body: JSON.stringify({ cursor: "x".repeat(9000) }) })).status).toBe(413);
		expect((await status_request(t, { body: "{" })).status).toBe(400);
		expect(requests).toHaveLength(0);
	});
	test("projects only safe pending-attempt fields to its starting actor", async () => {
		const { t } = setup();
		const attempt = await t.run(ctx => ctx.db.insert("oauth_states", {
			organizationId: "org", workspaceId: "workspace", installationId: "installation", actorUserId: "actor", clientRequestId: "request",
			accountId: null, expectedGeneration: null, grantId: null, status: "awaiting_finish", stateHash: "state-hash", encryptedState: "private-state",
			googleCodeHash: "google-hash", stagedRefreshToken: "private-token", stagedEmailAddress: "private@example.com", stagedHistoryId: "10",
			finishCodeHash: "finish-hash", encryptedFinishCode: "private-code", completedAccountId: null, completedGeneration: null,
			expiresAt: Date.now() + 600_000, processingDeadline: null, receiptExpiresAt: null, error: null, updatedAt: Date.now(),
		}));
		const response = await status_request(t);
		const body: unknown = await response.json();
		expect(body).toMatchObject({ attempt: { attemptId: attempt, clientRequestId: "request", accountId: null } });
		expect(JSON.stringify(body)).not.toContain("private-");
		expect(JSON.stringify(body)).not.toContain("private@example.com");
		await t.run(ctx => ctx.db.patch(attempt, { actorUserId: "other-actor" }));
		expect(await (await status_request(t)).json()).toMatchObject({ attempt: null });
	});
});
