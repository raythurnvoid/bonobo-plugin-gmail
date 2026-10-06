// @vitest-environment node
import { createServer } from "node:http";
import { once } from "node:events";
import { afterEach, describe, expect, test, vi } from "vitest";
import { internal } from "./_generated/api";
import { gmail_workpool } from "./gmail_workpool";
import { gmail_test_fixture } from "../scripts/gmail-test-fixtures";

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

// Keep native byte checks apart from the memory used by other worker fixtures.
describe("work_account_slice", () => {
	test.each([
		["a native oversized attachment cancels before parsing or uploading below 512 MiB", "wire"],
		["a native decoded attachment stops before allocation below 512 MiB", "decoded"],
	] as const)("%s", async (_title, kind) => {
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
		const calls: { path: string; body: unknown }[] = [];
		let readBytes = 0;
		let largestChunk = 0;
		let cancelled = 0;
		const parse = vi.spyOn(JSON, "parse");
		const decode = vi.spyOn(Buffer, "from");
		const padding = Buffer.alloc(1024 * 1024, kind === "wire" ? 32 : 65);
		const server = createServer((_request, response) => {
			response.writeHead(200, { "Content-Type": "application/json" });
			if (kind === "decoded") response.write('{"size":4,"data":"');
			let chunks = 0;
			const send = () => {
				if (response.destroyed) return;
				while (chunks < (kind === "wire" ? 49 : 44)) {
					chunks++;
					if (!response.write(padding)) { response.once("drain", send); return; }
				}
				// The wire case permits an upload without its guard. The other case represents 33 MiB.
				response.end(kind === "wire" ? '{"size":4,"data":"ZmlsZQ"}' : '"}');
			};
			send();
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
					mimeType: "multipart/mixed", headers: [{ name: "Subject", value: "Native attachment byte limit" }],
					parts: [{ partId: "0", mimeType: "text/plain", body: { size: 4, data: "bWFpbA" } },
						{ partId: "1", filename: "invoice.pdf", mimeType: "application/pdf", body: { size: 4, attachmentId: "oversized" } }],
				} });
				if (path.endsWith("/attachments/oversized")) {
					const response = await nativeFetch(`http://127.0.0.1:${address.port}/`, init);
					const stream = response.body!;
					const reader = stream.getReader();
					const read = reader.read.bind(reader);
					const cancel = reader.cancel.bind(reader);
					// Record native reads and cancellation without changing their bytes.
					vi.spyOn(stream, "getReader").mockReturnValue(reader);
					vi.spyOn(reader, "read").mockImplementation(async () => {
						const next = await read();
						if (!next.done) { readBytes += next.value.byteLength; largestChunk = Math.max(largestChunk, next.value.byteLength); }
						return next;
					});
					vi.spyOn(reader, "cancel").mockImplementation(reason => { cancelled++; return cancel(reason); });
					return response;
				}
				if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
				if (path.endsWith("/create-target")) return Response.json({ state: "pending", path: "/emails/ray-example.com/native-bytes.pdf",
					nodeId: "attachment-node", actualBytes: null, uploadUrl: "https://upload.example.test/object",
					headers: { "Content-Type": "application/pdf" }, uploadUrlExpiresAt: Date.now() + 3600_000 });
				if (path === "/object") return new Response(null, { status: 200 });
				if (path.endsWith("/finalize")) return Response.json({ state: "committed", path: "/emails/ray-example.com/native-bytes.pdf", nodeId: "attachment-node", actualBytes: 4 });
				if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
				return Response.json({}, { status: 500 });
			}));
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			if (kind === "wire") {
				expect(readBytes).toBeGreaterThan(48 * 1024 * 1024);
				expect(readBytes).toBeLessThanOrEqual(48 * 1024 * 1024 + largestChunk);
				expect(cancelled).toBe(1);
				expect(parse.mock.calls.filter(([text]) => text.length > 48 * 1024 * 1024)).toEqual([]);
				expect(decode.mock.calls.filter(([value]) => value === "ZmlsZQ")).toEqual([]);
			} else {
				const encodedBytes = 44 * 1024 * 1024;
				expect(readBytes).toBe(encodedBytes + Buffer.byteLength('{"size":4,"data":""}'));
				expect(cancelled).toBe(0);
				expect(parse.mock.calls.filter(([text]) => text.length === readBytes)).toHaveLength(1);
				expect(decode.mock.calls.filter(([value]) => typeof value === "string" && value.length === encodedBytes).length).toBe(0);
			}
			expect(calls.filter(call => /service-uploads|\/object$/.test(call.path))).toEqual([]);
			expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(1);
			const saved = (await f.t.run(ctx => ctx.db.query("messages_ledger").withIndex("by_account_gmailMessageId", q => q.eq("accountId", f.accountId).eq("gmailMessageId", "ab")).unique()))!;
			expect(saved.attachments[0].reason).toBe("too_large");
			expect(saved).toMatchObject({ status: "done", emailWritten: true, fileNodeId: "email-node", attempts: 0, error: null,
				attachmentsNotSaved: 1, settlementNeeded: false, nextAttemptAt: null,
				attachments: [{ state: "not_saved", request: null, accepted: false, deliveries: 0, nextAttemptAt: null }] });
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
			process.stdout.write(JSON.stringify({ fixture: kind === "wire" ? "Native 49 MiB attachment JSON" : "Native 33 MiB decoded attachment", readBytes, largestChunk, peakRssBytes: peakBytes }) + "\n");
		} finally {
			server.closeAllConnections();
			await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
		}
		expect(server.listening).toBe(false);
	});
});
