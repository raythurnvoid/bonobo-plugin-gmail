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

describe("work_account_slice", () => {
	test("the remaining body deadline saves the time notice and the attachment with native fetch", async () => {
		const nativeFetch = fetch;
		const nativeTimeout = AbortSignal.timeout;
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		const f = await gmail_test_fixture();
		const work = { accountId: f.accountId, generation: 1, requestId: "worker", grantId: f.grantId };
		const workId = await f.t.run(ctx => gmail_workpool.enqueueAction(ctx, internal.gmail_worker.work_account_slice, { work }, { runAt: now + 3600_000 }));
		await f.t.run(async ctx => {
			// Start empty so normal backfill creates the message and every save.
			await ctx.db.delete(f.ledgerId);
			await ctx.db.patch(f.accountId, {
				syncWorkId: workId, syncRequestId: work.requestId, nextSliceKind: "backfill",
				backfillPage: null, backfillPageToken: null, backfillComplete: false, historyPageToken: null,
				permissionProbeNotBefore: null, messagesSynced: 0,
				ledgerCounts: { pending: 0, done: 0, skipped: 0, failed: 0, given_up: 0, emailAssumed: 0, permissionHeld: 0 },
			});
		});
		const timeouts = new Map<AbortSignal, number>();
		vi.spyOn(AbortSignal, "timeout").mockImplementation(milliseconds => {
			const signal = nativeTimeout(milliseconds);
			timeouts.set(signal, milliseconds);
			return signal;
		});
		const bodyTimeouts: number[] = [];
		const bodyCalls: string[] = [];
		const calls: { path: string; body: unknown }[] = [];
		const uploads: number[][] = [];
		let headersReceived = false;
		let bodySignal: AbortSignal | null = null;
		let later: ReturnType<typeof setTimeout> | undefined;
		const server = createServer((_request, response) => {
			response.writeHead(200, { "Content-Type": "application/json" });
			response.write('{"size":4,"data":"');
			// A broken deadline gets valid JSON instead of a test timeout.
			later = setTimeout(() => response.end('bWFpbA"}'), 1000);
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
					destinationPathPrefix: "/emails/ray-example.com", expiresAt: now + 3600_000, scopes: ["files:write"], contentPermissions: { read: true, write: true } });
				if (path.endsWith("/messages")) return Response.json({ messages: [{ id: "ab" }] });
				if (path.endsWith("/messages/ab")) return Response.json({ id: "ab", threadId: "cd", internalDate: String(now), payload: {
					mimeType: "multipart/mixed", headers: [{ name: "Subject", value: "Native body deadline" }],
					parts: [...Array.from({ length: 5 }, (_, index) => ({ partId: String(index), mimeType: "text/plain", body: { size: 4, attachmentId: `body-${index}` } })),
						{ partId: "5", filename: "invoice.pdf", mimeType: "application/pdf", body: { size: 4, data: "ZmlsZQ" } }],
				} });
				if (/\/attachments\/body-\d+$/.test(path)) {
					const signal = init!.signal!;
					const timeout = timeouts.get(signal)!;
					bodyCalls.push(path);
					bodyTimeouts.push(timeout);
					if (!path.endsWith("/body-3")) {
						// Three completed fake reads spend 59.7 seconds of the body clock.
						now += 19_900;
						return Response.json({ size: 4, data: "cGFydA" });
					}
					bodySignal = signal;
					signal.addEventListener("abort", () => { now += timeout; }, { once: true });
					const response = await nativeFetch(`http://127.0.0.1:${address.port}/`, init);
					headersReceived = true;
					return response;
				}
				if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
				if (path.endsWith("/create-target")) return Response.json({ state: "pending", path: "/emails/ray-example.com/native-attachment.pdf",
					nodeId: "attachment-node", actualBytes: null, uploadUrl: "https://upload.example.test/object",
					headers: { "Content-Type": "application/pdf" }, uploadUrlExpiresAt: now + 3600_000 });
				if (path === "/object") {
					if (init?.body instanceof Uint8Array) uploads.push(Array.from(init.body));
					return new Response(null, { status: 200 });
				}
				if (path.endsWith("/finalize")) return Response.json({ state: "committed", path: "/emails/ray-example.com/native-attachment.pdf", nodeId: "attachment-node", actualBytes: 4 });
				if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
				return Response.json({}, { status: 500 });
			}));
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(headersReceived).toBe(true);
			expect(bodyTimeouts).toEqual([20_000, 20_000, 20_000, 300]);
			expect(bodyCalls.map(path => path.split("/").at(-1))).toEqual(["body-0", "body-1", "body-2", "body-3"]);
			expect(bodySignal).toMatchObject({ aborted: true, reason: { name: "TimeoutError" } });
			const writes = calls.filter(call => call.path.endsWith("/files/write"));
			expect(writes).toHaveLength(1);
			expect(writes[0].body).toMatchObject({ content: expect.stringContaining("Body not copied: it exceeds this plugin's time limit. Read it in Gmail.") });
			expect(writes[0].body).toMatchObject({ content: expect.not.stringContaining("\n\npart") });
			expect(uploads).toEqual([[102, 105, 108, 101]]);
			const saved = await f.t.run(ctx => ctx.db.query("messages_ledger").withIndex("by_account_gmailMessageId", q => q.eq("accountId", f.accountId).eq("gmailMessageId", "ab")).unique());
			expect(saved).toMatchObject({ status: "done", emailWritten: true, fileNodeId: "email-node", attempts: 0, error: null,
				attachments: [{ state: "saved", deliveries: 1, nodeId: "attachment-node", livePath: "/emails/ray-example.com/native-attachment.pdf" }] });
			expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toMatchObject({ sourceError: null, syncError: null, backfillComplete: true,
				messagesSynced: 1, ledgerCounts: { done: 1, pending: 0, given_up: 0 } });
			const before = calls.length;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(calls.slice(before).filter(call => /\/messages\/ab|\/files\/write|service-uploads|\/object$/.test(call.path))).toEqual([]);
			expect(await f.t.run(ctx => ctx.db.get(saved!._id))).toEqual(saved);
		} finally {
			clearTimeout(later);
			server.closeAllConnections();
			await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
		}
		expect(server.listening).toBe(false);
	});
});
