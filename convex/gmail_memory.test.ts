// @vitest-environment node
import { createServer } from "node:http";
import { once } from "node:events";
import { createHash } from "node:crypto";
import { afterEach, expect, test, vi } from "vitest";
import { internal } from "./_generated/api";
import { gmail_workpool } from "./gmail_workpool";
import { gmail_test_fixture } from "../scripts/gmail-test-fixtures";

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

// Keep this byte check apart from the memory used by other worker fixtures.
test("a native 25 MB external attachment is delivered whole below 512 MiB", async () => {
	const nativeFetch = fetch;
	const f = await gmail_test_fixture();
	const work = { accountId: f.accountId, generation: 1, requestId: "worker", grantId: f.grantId };
	const workId = await f.t.run(ctx => gmail_workpool.enqueueAction(ctx, internal.gmail_worker.work_account_slice, { work }, { runAt: Date.now() + 3600_000 }));
	await f.t.run(async ctx => {
		await ctx.db.delete(f.ledgerId);
		await ctx.db.patch(f.accountId, {
			syncWorkId: workId, syncRequestId: work.requestId, nextSliceKind: "backfill",
			backfillPage: null, backfillPageToken: null, backfillComplete: false, historyPageToken: null,
			permissionProbeNotBefore: null, messagesSynced: 0,
			ledgerCounts: { pending: 0, done: 0, skipped: 0, failed: 0, given_up: 0, emailAssumed: 0, permissionHeld: 0 },
		});
	});
	const size = 25_000_000;
	const chunk = Buffer.alloc(3 * 256 * 1024, 37);
	const encoded = chunk.toString("base64url");
	const expected = createHash("sha256");
	for (let offset = 0; offset < size; offset += chunk.byteLength) expected.update(chunk.subarray(0, Math.min(chunk.byteLength, size - offset)));
	const expectedHash = expected.digest("hex");
	const calls: { path: string; body: unknown }[] = [];
	let downloads = 0;
	let uploadedBytes = 0;
	let uploadedHash = "";
	let method: string | undefined;
	let contentType: string | undefined;
	let beforePut: unknown;
	const server = createServer((request, response) => {
		if (request.url === "/attachment") {
			downloads++;
			response.writeHead(200, { "Content-Type": "application/json" });
			response.write(`{"size":${size},"data":"`);
			let sent = 0;
			const send = () => {
				if (response.destroyed) return;
				// Whole triples keep each base64 group valid when joined.
				while (sent + chunk.byteLength <= size) {
					sent += chunk.byteLength;
					if (!response.write(encoded)) { response.once("drain", send); return; }
				}
				response.end(chunk.subarray(0, size - sent).toString("base64url") + '"}');
			};
			send();
			return;
		}
		method = request.method;
		contentType = request.headers["content-type"];
		const hash = createHash("sha256");
		request.on("data", (bytes: Buffer) => { uploadedBytes += bytes.byteLength; hash.update(bytes); });
		request.on("end", () => { uploadedHash = hash.digest("hex"); response.end(); });
	});
	server.listen(0, "127.0.0.1");
	await once(server, "listening");
	try {
		const address = server.address();
		if (!address || typeof address === "string") throw new Error("Missing local server address");
		vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
			const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
			const path = url.pathname;
			const body: unknown = typeof init?.body === "string" && init.body.startsWith("{") ? JSON.parse(init.body) : init?.body;
			calls.push({ path, body });
			if (url.hostname === "oauth2.googleapis.com") return Response.json({ access_token: "access", expires_in: 3600,
				scope: "https://www.googleapis.com/auth/gmail.readonly", token_type: "Bearer" });
			if (path.endsWith("/verify-live")) return Response.json({ installationId: "installation", phase: "processing",
				destinationPathPrefix: "/emails/ray-example.com", expiresAt: Date.now() + 3600_000, scopes: ["files:write"], contentPermissions: { read: true, write: true } });
			if (path.endsWith("/messages")) return Response.json({ messages: [{ id: "ab" }] });
			if (path.endsWith("/messages/ab")) return Response.json({ id: "ab", threadId: "cd", internalDate: String(Date.now()), payload: {
				mimeType: "multipart/mixed", headers: [{ name: "Subject", value: "Native large attachment" }],
				parts: [{ partId: "0", mimeType: "text/plain", body: { size: 4, data: "bWFpbA" } },
					{ partId: "1", filename: "large.pdf", mimeType: "application/pdf", body: { size, attachmentId: "large" } }],
			} });
			if (path.endsWith("/attachments/large")) return nativeFetch(`http://127.0.0.1:${address.port}/attachment`, init);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json({ state: "pending", path: "/emails/ray-example.com/large.pdf", nodeId: "attachment-node", actualBytes: null,
				uploadUrl: "https://upload.example.test/object", headers: { "Content-Type": "application/pdf" }, uploadUrlExpiresAt: Date.now() + 3600_000 });
			if (path === "/object") {
				beforePut = await f.t.run(ctx => ctx.db.query("messages_ledger").withIndex("by_account_gmailMessageId", q => q.eq("accountId", f.accountId).eq("gmailMessageId", "ab")).unique());
				return nativeFetch(`http://127.0.0.1:${address.port}/object`, init);
			}
			if (path.endsWith("/finalize")) return Response.json({ state: "committed", path: "/emails/ray-example.com/member-moved.pdf", nodeId: "attachment-node", actualBytes: size });
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			return Response.json({}, { status: 500 });
		}));
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(uploadedBytes).toBe(size);
		expect(uploadedHash).toBe(expectedHash);
		expect({ downloads, method, contentType }).toEqual({ downloads: 1, method: "PUT", contentType: "application/pdf" });
		expect(beforePut).toMatchObject({ emailWritten: true, settlementNeeded: true,
			attachments: [{ accepted: true, deliveries: 1, uploadAttemptedAt: expect.any(Number), request: { size } }] });
		expect(calls.filter(call => /service-uploads|\/object$/.test(call.path)).map(call => call.path)).toEqual([
			"/api/v1/files/service-uploads/create-target", "/object", "/api/v1/files/service-uploads/finalize",
		]);
		const saved = (await f.t.run(ctx => ctx.db.query("messages_ledger").withIndex("by_account_gmailMessageId", q => q.eq("accountId", f.accountId).eq("gmailMessageId", "ab")).unique()))!;
		expect(saved).toMatchObject({ status: "done", emailWritten: true, fileNodeId: "email-node", attempts: 0, error: null, settlementNeeded: false, nextAttemptAt: null,
			attachments: [{ size, state: "saved", accepted: true, deliveries: 1, nodeId: "attachment-node", livePath: "/emails/ray-example.com/member-moved.pdf", nextAttemptAt: null, reason: null }] });
		const before = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls.slice(before).filter(call => /\/messages\/ab|\/files\/write|service-uploads|\/object$/.test(call.path))).toEqual([]);
		expect(await f.t.run(ctx => ctx.db.get(saved._id))).toEqual(saved);
		expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toMatchObject({ sourceError: null, syncError: null,
			messagesSynced: 1, ledgerCounts: { done: 1, pending: 0, given_up: 0 } });
		// maxRSS uses KiB and includes the test runner and local server.
		const peakBytes = process.resourceUsage().maxRSS * 1024;
		expect(peakBytes).toBeGreaterThan(0);
		expect(peakBytes).toBeLessThan(512 * 1024 * 1024);
		process.stdout.write(JSON.stringify({ fixture: "Native 25 MB external attachment", uploadedBytes, uploadedHash, peakRssBytes: peakBytes }) + "\n");
	} finally {
		server.closeAllConnections();
		await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
	}
	expect(server.listening).toBe(false);
});
