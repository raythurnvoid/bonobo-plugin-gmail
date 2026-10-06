import { afterEach, expect, test, vi } from "vitest";
import { internal } from "./_generated/api";
import { gmail_test_fixture } from "../scripts/gmail-test-fixtures";

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

// Keep this byte check apart from the memory used by other worker fixtures.
test("a normal 25 MB external attachment is delivered whole below 512 MiB", async () => {
	let now = Date.now();
	vi.spyOn(Date, "now").mockImplementation(() => now);
	vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
	const f = await gmail_test_fixture();
	await f.t.run(async ctx => {
		await ctx.db.patch(f.accountId, { permissionProbeNotBefore: null, messagesSynced: 0,
			backfillPage: null, backfillPageToken: null, historyPageToken: null,
			ledgerCounts: { pending: 1, done: 0, skipped: 0, failed: 0, given_up: 0, emailAssumed: 0, permissionHeld: 0 } });
		await ctx.db.patch(f.ledgerId, { status: "pending", nextAttemptAt: now, permissionHeld: false,
			fileAccessOperation: null, error: null, attachments: [], filePath: null, emailWritten: false,
			fileNodeId: null, settlementNeeded: false });
	});
	await f.t.mutation(internal.gmail_accounts.dispatch, {});
	const queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
	expect(queued.syncWorkId).not.toBeNull();
	expect(queued.syncRequestId).not.toBeNull();
	const size = 25_000_000;
	let peak = process.memoryUsage().rss;
	const sample = () => { peak = Math.max(peak, process.memoryUsage().rss); };
	const calls: { path: string; body: unknown }[] = [];
	vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
		const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
		const body: unknown = typeof init?.body === "string" && init.body.startsWith("{") ? JSON.parse(init.body) : init?.body;
		calls.push({ path: url.pathname, body });
		now += 600;
		sample();
		if (url.hostname === "oauth2.googleapis.com") return Response.json({ access_token: "access", expires_in: 3600,
			scope: "https://www.googleapis.com/auth/gmail.readonly", token_type: "Bearer" });
		if (url.pathname.endsWith("/verify-live")) return Response.json({ installationId: "installation", phase: "processing",
			destinationPathPrefix: "/emails/ray-example.com", expiresAt: now + 3600_000, scopes: ["files:write"],
			contentPermissions: { read: true, write: true } });
		if (url.pathname.endsWith("/messages/ab")) return Response.json({ id: "ab", threadId: "cd", internalDate: "1791142652000",
			payload: { mimeType: "multipart/mixed", headers: [{ name: "Subject", value: "Worker test" }, { name: "From", value: "sender@example.com" }],
				parts: [{ partId: "0", mimeType: "text/plain", body: { size: 4, data: "bWFpbA" } },
					{ partId: "1", filename: "large.pdf", mimeType: "application/pdf", body: { size, attachmentId: "large" } }] } });
		if (url.pathname.endsWith("/attachments/large")) {
			const response = Response.json({ size, data: Buffer.alloc(size, 37).toString("base64url") });
			sample();
			return response;
		}
		if (url.pathname.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
		if (url.pathname.endsWith("/create-target")) {
			expect(body).toMatchObject({ size });
			sample();
			return Response.json({ state: "pending", path: "/emails/ray-example.com/large.pdf", nodeId: "attachment-node", actualBytes: null,
				uploadUrl: "https://upload.example.test/object", headers: { "Content-Type": "application/pdf" }, uploadUrlExpiresAt: now + 3600_000 });
		}
		if (url.pathname === "/object") {
			expect(body).toBeInstanceOf(Uint8Array);
			expect((body as Uint8Array).byteLength).toBe(size);
			expect((body as Uint8Array)[size - 1]).toBe(37);
			sample();
			return new Response(null);
		}
		if (url.pathname.endsWith("/finalize")) return Response.json({ state: "committed", path: "/emails/ray-example.com/member-moved.pdf",
			nodeId: "attachment-node", actualBytes: size });
		return Response.json({}, { status: 500 });
	}));
	await f.t.action(internal.gmail_worker.work_account_slice, { work: { accountId: f.accountId,
		generation: queued.connectionGeneration, requestId: queued.syncRequestId!, grantId: f.grantId } });
	sample();
	expect(calls.filter(call => call.path === "/object")).toHaveLength(1);
	expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toMatchObject({ status: "done", attachments: [{ size, state: "saved" }] });
	expect(peak).toBeLessThan(512 * 1024 * 1024);
	process.stdout.write(JSON.stringify({ fixture: "25 MB external attachment", sampledPeakRssBytes: peak }) + "\n");
});
