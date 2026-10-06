import { afterEach, describe, expect, test, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { internal } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";
import { gmail_test_fixture } from "../scripts/gmail-test-fixtures";
import * as gmail_codec from "../shared/gmail-codec";
import { gmail_workpool } from "./gmail_workpool";
import { work_account_slice } from "./gmail_worker";
import { gmail_callback, gmail_finish, gmail_start } from "./gmail_oauth";
import { gmail_encrypt, gmail_google_token_purpose, gmail_random_secret } from "./gmail_secrets";

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});
const committed = {
	state: "committed",
	path: "/emails/ray-example.com/member-moved.pdf",
	nodeId: "attachment-node",
	actualBytes: 4,
};
const pending = {
	state: "pending",
	path: "/emails/ray-example.com/invoice.pdf",
	nodeId: "attachment-node",
	actualBytes: null,
};
const transport = {
	...pending,
	uploadUrl: "https://upload.example.test/object",
	headers: { "Content-Type": "application/pdf" },
	uploadUrlExpiresAt: Date.now() + 3600_000,
};
const profile = { emailAddress: "ray@example.com", historyId: "10" };
const source = {
	id: "ab",
	threadId: "cd",
	internalDate: "1791142652000",
	payload: {
		mimeType: "multipart/mixed",
		headers: [
			{ name: "Subject", value: "Worker test" },
			{ name: "From", value: "sender@example.com" },
		],
		parts: [
			{
				partId: "0",
				mimeType: "text/plain",
				body: { size: 4, data: "bWFpbA" },
			},
			{
				partId: "1",
				filename: "invoice.pdf",
				mimeType: "application/pdf",
				body: { size: 4, data: "ZmlsZQ" },
			},
		],
	},
};

async function fixture(
	options: {
		held?: boolean;
		sourceError?: "google_revoked";
		fresh?: boolean;
	} = {},
) {
	const f = await gmail_test_fixture();
	const workId = await f.t.run((ctx) =>
		gmail_workpool.enqueueAction(
			ctx,
			internal.gmail_grants.connect,
			{ grantId: f.grantId },
			{ runAt: Date.now() + 3600_000 },
		),
	);
	await f.t.run(async (ctx) => {
		const account = (await ctx.db.get(f.accountId))!;
		const row = (await ctx.db.get(f.ledgerId))!;
		await ctx.db.patch(f.accountId, {
			syncRequestId: "worker",
			syncWorkId: workId,
			permissionProbeNotBefore: null,
			sourceError: options.sourceError ?? null,
			googleRefreshToken: options.sourceError ? null : account.googleRefreshToken,
			messagesSynced: options.fresh ? 0 : account.messagesSynced,
			backfillPage: null,
			backfillPageToken: null,
			historyPageToken: null,
			nextSliceKind: "retry",
			ledgerCounts: {
				...account.ledgerCounts,
				failed: 0,
				pending: 1,
				permissionHeld: options.held ? 1 : 0,
			},
		});
		await ctx.db.patch(f.ledgerId, {
			status: "pending",
			nextAttemptAt: Date.now(),
			permissionHeld: options.held ?? false,
			fileAccessOperation: options.held ? row.fileAccessOperation : null,
			error: options.held ? "file_access" : null,
			...(options.fresh
				? {
						attachments: [],
						filePath: null,
						emailWritten: false,
						fileNodeId: null,
						settlementNeeded: false,
					}
				: {}),
		});
	});
	return {
		...f,
		workId,
		work: {
			accountId: f.accountId,
			generation: 1,
			requestId: "worker",
			grantId: f.grantId,
		},
	};
}

function network(answer: (path: string, body: unknown, url: URL) => Response | Promise<Response>) {
	const calls: { path: string; body: unknown }[] = [];
	vi.stubGlobal(
		"fetch",
		vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
			const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
			const body: unknown =
				typeof init?.body === "string" && init.body.startsWith("{") ? JSON.parse(init.body) : init?.body;
			calls.push({ path: url.pathname, body });
			if (url.hostname === "oauth2.googleapis.com")
				return Response.json({
					access_token: "access",
					expires_in: 3600,
					scope: "https://www.googleapis.com/auth/gmail.readonly",
					token_type: "Bearer",
				});
			if (url.pathname.endsWith("/verify-live"))
				return Response.json({
					installationId: "installation",
					phase: "processing",
					destinationPathPrefix: "/emails/ray-example.com",
					expiresAt: Date.now() + 3600_000,
					scopes: ["files:write"],
					contentPermissions: { read: true, write: true },
				});
			return answer(url.pathname, body, url);
		}),
	);
	return calls;
}

async function stop_after_mutation(
	f: Awaited<ReturnType<typeof fixture>>,
	mutation: "save_message" | "save_traversal" | "discover_message" | "finish_slice" | "ingest_history" | "pace_press" | "claim_permission",
	reached: (args: unknown) => Promise<boolean>,
	phase: "before" | "after" = "after",
) {
	// Convex-test calls this internal handler. Stop at the chosen mutation boundary.
	const registered = work_account_slice as typeof work_account_slice & {
		_handler: (ctx: ActionCtx, args: { work: typeof f.work }) => Promise<null>;
	};
	const handler = registered._handler;
	const crash = new Error(`Worker stopped ${phase} saved checkpoint`);
	let stopped = false;
	const interrupted = vi.spyOn(registered, "_handler").mockImplementation(async (ctx, args) => {
		const runMutation: ActionCtx["runMutation"] = async (reference, ...values) => {
			if (stopped) throw crash;
			const selected = getFunctionName(reference) === `gmail_accounts:${mutation}`;
			if (selected && phase === "before" && await reached(values[0])) {
				stopped = true;
				throw crash;
			}
			const result = await ctx.runMutation(reference, ...values);
			if (selected && phase === "after" && await reached(values[0])) {
				stopped = true;
				throw crash;
			}
			return result;
		};
		return handler({ ...ctx, runMutation }, args);
	});
	try {
		await expect(f.t.action(internal.gmail_worker.work_account_slice, { work: f.work })).rejects.toThrow(crash.message);
	} finally {
		interrupted.mockRestore();
	}
	expect(stopped).toBe(true);
	return crash;
}

async function stop_after_task_save(
	f: Awaited<ReturnType<typeof fixture>>,
	state: "unstarted" | "uncertain" | "pending" | "saved" | "unconfirmed",
	progress: { deliveries?: number; emailWritten?: boolean } = {},
) {
	return stop_after_mutation(f, "save_message", async () => {
		const saved = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		return saved.attachments.length === 1 && saved.attachments[0].state === state &&
			(progress.deliveries === undefined || saved.attachments[0].deliveries === progress.deliveries) &&
			(progress.emailWritten === undefined || saved.emailWritten === progress.emailWritten);
	});
}

describe("work_account_slice", () => {
	test("settles a committed receipt without Google reads, even after revocation", async () => {
		const f = await fixture({ sourceError: "google_revoked" });
		const calls = network((path) =>
			path.endsWith("/finalize") ? Response.json(committed) : Response.json({}, { status: 500 }),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.map((call) => call.path)).toEqual(["/api/v1/files/service-uploads/finalize"]);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done",
			settlementNeeded: false,
			attachments: [{ state: "saved", livePath: committed.path }],
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			sourceError: "google_revoked",
			syncStatus: "error",
			nextSyncAt: null,
			ledgerCounts: { pending: 0, done: 1 },
		});
	});
	test.each(["create", "finalize", "source-free finalize"] as const)("a stop after committed %s keeps the message complete after revocation", async (step) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture(step === "source-free finalize" ? { sourceError: "google_revoked" } : { fresh: true });
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json(step === "create" ? committed : transport);
			if (path.endsWith("/finalize")) return Response.json(committed);
			return new Response(null, { status: 200 });
		});
		const crash = await stop_after_task_save(f, "saved");
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			emailWritten: true, attachments: [{ state: "saved", livePath: committed.path }],
		});
		const before = calls.length;
		await f.t.mutation(internal.gmail_accounts.finish_slice, { work: f.work, error: "google_revoked", retryAfterMs: null, attachmentNote: null });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "failed", error: crash.message } });
		now += 3600_000;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(calls).toHaveLength(before);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "done", nextAttemptAt: null, settlementNeeded: false });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			messagesSynced: 1, sourceError: "google_revoked", googleRefreshToken: null,
			nextSyncAt: null, syncWorkId: null, syncRequestId: null, ledgerCounts: { pending: 0, done: 1 },
		});
	});
	test("writes Markdown, freezes a target, then PUTs and finalizes one attachment", async () => {
		const f = await fixture({ fresh: true });
		const calls = network(async (path) => {
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) {
				const row = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
				expect(row).toMatchObject({
					emailWritten: true,
					settlementNeeded: true,
					attachments: [
						{
							state: "uncertain",
							request: {
								idempotencyKey: `${f.accountId}:ab`,
								targetKey: "ab:att-0",
							},
						},
					],
				});
				return Response.json(transport);
			}
			if (path === "/object") {
				expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
					attachments: [{ deliveries: 1, uploadAttemptedAt: expect.any(Number) }],
				});
				return new Response(null, { status: 200 });
			}
			return Response.json(committed);
		});
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.map((call) => call.path)).toEqual([
			"/token",
			"/gmail/v1/users/me/messages/ab",
			"/api/v1/files/write",
			"/api/v1/files/service-uploads/create-target",
			"/object",
			"/api/v1/files/service-uploads/finalize",
		]);
		const write = calls.find((call) => call.path.endsWith("/files/write"))!;
		expect(write.body).toMatchObject({
			overwrite: "fail",
			contentType: "text/markdown",
			content: expect.stringContaining('gmail-thread-id: "cd"'),
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done",
			emailWritten: true,
			attachments: [{ state: "saved" }],
		});
	});
	test.each(["planned", "written"] as const)("a stop after the %s email save keeps its path and writes once", async (step) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		// Pause queued actions while running their saved work requests.
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		let resumed = false;
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json(resumed ? {
				...source, payload: { ...source.payload, headers: source.payload.headers.map(header =>
					header.name === "Subject" ? { ...header, value: "Changed after the stop" } : header) },
			} : source);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path.endsWith("/finalize")) return Response.json(committed);
			if (path === "/object") return new Response(null, { status: 200 });
			return Response.json({}, { status: 500 });
		});
		const crash = await stop_after_task_save(f, "unstarted", { emailWritten: step === "written" });
		expect(calls.map(call => call.path)).toEqual([
			"/token", "/gmail/v1/users/me/messages/ab", ...(step === "written" ? ["/api/v1/files/write"] : []),
		]);
		const checkpoint = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(checkpoint.filePath).not.toBeNull();
		expect(checkpoint).toMatchObject({
			status: "pending", emailWritten: step === "written", fileNodeId: step === "written" ? "email-node" : null,
			attempts: 0, settlementNeeded: false,
			attachments: [{ state: "unstarted", request: null, deliveries: 0, uploadAttemptedAt: null }],
		});
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "failed", error: crash.message } });
		const stopped = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(stopped.nextSyncAt).toBeGreaterThan(now);
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
		now = stopped.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		expect(queued.syncRequestId).not.toBe(f.work.requestId);
		const work = { ...f.work, requestId: queued.syncRequestId! };
		resumed = true;
		const before = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		const writes = calls.filter(call => call.path.endsWith("/files/write"));
		expect(writes).toHaveLength(1);
		expect(writes[0].body).toMatchObject({ path: checkpoint.filePath, overwrite: "fail", contentType: "text/markdown" });
		expect(calls.slice(before).map(call => call.path)).toEqual([
			"/token", "/gmail/v1/users/me/messages/ab", ...(step === "planned" ? ["/api/v1/files/write"] : []),
			"/api/v1/files/service-uploads/create-target", "/object", "/api/v1/files/service-uploads/finalize",
		]);
		expect(calls.filter(call => call.path.endsWith("/create-target")).map(call => call.body))
			.toEqual([{ idempotencyKey: `${f.accountId}:ab`, targetKey: "ab:att-0", path: checkpoint.attachments[0].initialPath,
				contentType: "application/pdf", size: 4, readOnly: false, nonCollaborative: false }]);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(1);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done", filePath: checkpoint.filePath, emailWritten: true, fileNodeId: "email-node", emailAssumed: false,
			attempts: 0, settlementNeeded: false, nextAttemptAt: null,
			attachments: [{ state: "saved", initialPath: checkpoint.attachments[0].initialPath, deliveries: 1 }],
		});
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: work, result: { kind: "success", returnValue: null } });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			messagesSynced: 1, syncStatus: "live", syncError: null, syncWorkId: null, syncRequestId: null,
			ledgerCounts: { pending: 0, done: 1, emailAssumed: 0 },
		});
	});
	test.each(["inline", "external"])("%s text body uses decoded bytes when Gmail reports a different size", async (kind) => {
		const f = await fixture({ fresh: true });
		const text = "café 😀";
		const bytes = Buffer.from(text);
		const data = bytes.toString("base64url");
		const message = {
			...source,
			payload: { ...source.payload, parts: [{
				partId: "0", mimeType: "text/plain",
				body: kind === "inline" ? { size: text.length, data } : { size: text.length, attachmentId: "body" },
			}] },
		};
		const calls = network((path) => {
			if (path.endsWith("/messages/ab")) return Response.json(message);
			if (path.endsWith("/attachments/body")) return Response.json({ size: bytes.length, data });
			return Response.json({ nodeId: "email-node" });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		const writes = calls.filter((call) => call.path.endsWith("/files/write"));
		expect(writes).toHaveLength(1);
		expect(writes[0].body).toMatchObject({ content: expect.stringContaining(text) });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "done", emailWritten: true });
	});
	test.each(["inline", "external"])("%s attachment still requires its exact declared size", async (kind) => {
		const f = await fixture({ fresh: true });
		const message = {
			...source,
			payload: { ...source.payload, parts: [source.payload.parts[0], {
				partId: "1", filename: "invoice.pdf", mimeType: "application/pdf",
				body: kind === "inline" ? { size: 3, data: "ZmlsZQ" } : { size: 3, attachmentId: "file" },
			}] },
		};
		const calls = network((path) => {
			if (path.endsWith("/messages/ab")) return Response.json(message);
			if (path.endsWith("/attachments/file")) return Response.json({ size: 3, data: "ZmlsZQ" });
			return Response.json({ nodeId: "email-node" });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.filter((call) => call.path.endsWith("/files/write"))).toHaveLength(1);
		expect(calls.filter((call) => call.path.endsWith("/create-target"))).toHaveLength(0);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "given_up", error: "invalid_source" });
	});
	test("decoded text above 2 MiB stays limited when the reported size is smaller", async () => {
		const f = await fixture({ fresh: true });
		const message = { ...source, payload: { ...source.payload, parts: [{
			partId: "0", mimeType: "text/plain", body: { size: 4, data: Buffer.alloc(2 * 1024 * 1024 + 1, 65).toString("base64url") },
		}] } };
		const calls = network((path) => path.endsWith("/messages/ab") ? Response.json(message) : Response.json({ nodeId: "email-node" }));
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.find((call) => call.path.endsWith("/files/write"))?.body).toMatchObject({ content: expect.stringContaining("Body not copied:") });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "done", emailWritten: true });
	});
	test("body and attachment reads release used and unselected source strings", async () => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		const discover = gmail_codec.gmail_discover_message;
		const discovered: ReturnType<typeof discover>[] = [];
		// Keep the parsed sources so reference release can be checked without a memory estimate.
		vi.spyOn(gmail_codec, "gmail_discover_message").mockImplementation(input => {
			const parsed = discover(input);
			discovered.push(parsed);
			return parsed;
		});
		const samples: { phase: string; body: number[]; attachments: number[] }[] = [];
		const calls = network((path, body) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json({ ...source, payload: { ...source.payload,
				parts: [source.payload.parts[0], { partId: "0.1", mimeType: "text/plain", body: { size: 4, attachmentId: "body" } },
					source.payload.parts[1], { ...source.payload.parts[1], partId: "2", filename: "second.pdf", body: { size: 6, data: "c2Vjb25k" } }] } });
			if (path.endsWith("/attachments/body") || path.endsWith("/create-target")) {
				const parsed = discovered.at(-1)!;
				samples.push({ phase: path.endsWith("/attachments/body") ? "body" : "create",
					body: parsed.bodyParts.map(part => part.data?.length ?? 0), attachments: parsed.attachments.map(part => part.data?.length ?? 0) });
			}
			if (path.endsWith("/attachments/body")) return Response.json({ size: 4, data: "bWFpbA" });
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target") || path.endsWith("/finalize")) {
				if (body === null || typeof body !== "object" || !("targetKey" in body) || typeof body.targetKey !== "string") throw new Error("Missing target key");
				const second = body.targetKey.endsWith("att-1");
				const livePath = second ? "/emails/ray-example.com/second.pdf" : transport.path;
				const nodeId = second ? "second-node" : transport.nodeId;
				return Response.json(path.endsWith("/create-target")
					? { ...transport, path: livePath, nodeId, uploadUrl: `https://upload.example.test/${second ? "second" : "first"}`, uploadUrlExpiresAt: now + 3600_000 }
					: { ...committed, path: livePath, nodeId, actualBytes: second ? 6 : 4 });
			}
			if (path === "/first" || path === "/second") return new Response(null, { status: 200 });
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			return Response.json({}, { status: 500 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "success", returnValue: null } });
		now = (await f.t.run(ctx => ctx.db.get(f.accountId)))!.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		const next = { ...f.work, requestId: queued.syncRequestId! };
		await f.t.action(internal.gmail_worker.work_account_slice, { work: next });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: next, result: { kind: "success", returnValue: null } });
		expect(samples[0]).toEqual({ phase: "body", body: [0, 0], attachments: [6, 0] });
		expect(samples.slice(1)).toEqual([{ phase: "create", body: [0, 0], attachments: [0, 0] },
			{ phase: "create", body: [], attachments: [0, 0] }]);
		expect(calls.filter(call => call.path === "/first" || call.path === "/second").map(call => Array.from(call.body as Uint8Array)))
			.toEqual([[102, 105, 108, 101], [115, 101, 99, 111, 110, 100]]);
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(1);
		expect(calls.find(call => call.path.endsWith("/files/write"))!.body).toMatchObject({ content: expect.stringContaining("mail\n\nmail") });
		expect(calls.filter(call => call.path.endsWith("/attachments/body"))).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/messages/ab"))).toHaveLength(2);
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toMatchObject({ status: "done", emailWritten: true, settlementNeeded: false,
			attachmentsNotSaved: 0, attachments: [{ state: "saved", size: 4 }, { state: "saved", size: 6 }] });
	});
	test("a pending target with no PUT marker replays create immediately", async () => {
		const f = await fixture();
		await f.t.run(async (ctx) => {
			const row = (await ctx.db.get(f.ledgerId))!;
			await ctx.db.patch(row._id, {
				attachments: row.attachments.map((task) => ({
					...task,
					uploadAttemptedAt: null,
					deliveries: 0,
				})),
			});
		});
		let finalizes = 0;
		const calls = network((path) =>
			path.endsWith("/finalize")
				? Response.json(++finalizes === 1 ? pending : committed)
				: path.endsWith("/messages/ab")
					? Response.json(source)
					: path.endsWith("/create-target")
						? Response.json(transport)
						: new Response(null),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.filter((call) => call.path.endsWith("/create-target"))).toHaveLength(1);
		expect(calls.findIndex((call) => call.path.endsWith("/finalize"))).toBeLessThan(
			calls.findIndex((call) => call.path === "/token"),
		);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done",
			attachments: [{ deliveries: 1 }],
		});
	});
	test.each(["frozen", "accepted"] as const)("a stop after the %s target save resumes with one first PUT", async (step) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		// Pause queued actions while running their saved work requests.
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		let finalizes = 0;
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path.endsWith("/finalize") && ++finalizes === 1) return step === "frozen"
				? Response.json({ message: "Target not found" }, { status: 404 }) : Response.json(pending);
			if (path.endsWith("/finalize")) return Response.json(committed);
			if (path === "/object") return new Response(null, { status: 200 });
			return Response.json({}, { status: 500 });
		});
		const crash = await stop_after_task_save(f, step === "frozen" ? "uncertain" : "pending");
		expect(calls.map(call => call.path)).toEqual([
			"/token", "/gmail/v1/users/me/messages/ab", "/api/v1/files/write",
			...(step === "accepted" ? ["/api/v1/files/service-uploads/create-target"] : []),
		]);
		const checkpoint = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(checkpoint).toMatchObject({
			status: "pending", emailWritten: true, settlementNeeded: true, attempts: 0,
			attachments: [{ state: step === "frozen" ? "uncertain" : "pending", accepted: step === "accepted",
				nodeId: step === "frozen" ? null : pending.nodeId, livePath: step === "frozen" ? null : pending.path,
				deliveries: 0, uploadAttemptedAt: null, request: { idempotencyKey: `${f.accountId}:ab`, targetKey: "ab:att-0" } }],
		});
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "failed", error: crash.message } });
		const stopped = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(stopped).toMatchObject({ syncStatus: "blocked", syncError: "sync_error", temporaryFailures: 1 });
		expect(stopped.nextSyncAt).toBeGreaterThan(now);
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
		now = stopped.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		expect(queued.syncRequestId).not.toBe(f.work.requestId);
		const work = { ...f.work, requestId: queued.syncRequestId! };
		const before = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls.slice(before).map(call => call.path)).toEqual([
			"/api/v1/files/service-uploads/finalize", "/token", "/gmail/v1/users/me/messages/ab",
			"/api/v1/files/service-uploads/create-target", "/object", "/api/v1/files/service-uploads/finalize",
		]);
		const creates = calls.filter(call => call.path.endsWith("/create-target"));
		expect(creates).toHaveLength(step === "accepted" ? 2 : 1);
		const { installationId: _installationId, ...request } = checkpoint.attachments[0].request!;
		expect(creates.map(call => call.body)).toEqual(step === "accepted" ? [request, request] : [request]);
		expect(calls.filter(call => call.path.endsWith("/finalize")).map(call => call.body))
			.toEqual(Array.from({ length: 2 }, () => ({ idempotencyKey: request.idempotencyKey, targetKey: request.targetKey })));
		expect(calls.filter(call => call.path === "/object")).toHaveLength(1);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done", filePath: checkpoint.filePath, emailWritten: true, fileNodeId: checkpoint.fileNodeId,
			attempts: 0, settlementNeeded: false, nextAttemptAt: null,
			attachments: [{ state: "saved", accepted: true, nodeId: committed.nodeId, livePath: committed.path,
				deliveries: 1, uploadAttemptedAt: expect.any(Number), request: checkpoint.attachments[0].request }],
		});
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "failed", error: crash.message } });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncRequestId: work.requestId, syncWorkId: queued.syncWorkId });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: work, result: { kind: "success", returnValue: null } });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			messagesSynced: 1, syncStatus: "live", syncError: null, syncWorkId: null, syncRequestId: null,
			ledgerCounts: { pending: 0, done: 1 },
		});
	});
	test("a stop after the PUT marker waits before one remint delivery", async () => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		// Keep the queue paused so each retry uses its saved due time.
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		let delivered = false;
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target") || path.endsWith("/remint")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path.endsWith("/finalize")) return Response.json(delivered ? committed : pending);
			if (path === "/object") {
				delivered = true;
				return new Response(null, { status: 200 });
			}
			return Response.json({}, { status: 500 });
		});
		// The saved marker counts an attempt even when the worker stops before PUT.
		const crash = await stop_after_task_save(f, "pending", { deliveries: 1 });
		expect(calls.map(call => call.path)).toEqual([
			"/token", "/gmail/v1/users/me/messages/ab", "/api/v1/files/write", "/api/v1/files/service-uploads/create-target",
		]);
		const checkpoint = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(checkpoint).toMatchObject({ status: "pending", settlementNeeded: true, attempts: 0,
			attachments: [{ state: "pending", accepted: true, deliveries: 1, uploadAttemptedAt: now, request: expect.any(Object) }] });
		const request = checkpoint.attachments[0].request!;
		const keys = { idempotencyKey: request.idempotencyKey, targetKey: request.targetKey };
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "failed", error: crash.message } });
		let work = f.work;
		for (let retry = 1; retry <= 3; retry++) {
			const account = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(account.nextSyncAt).not.toBeNull();
			now = account.nextSyncAt!;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(queued.syncWorkId).not.toBeNull();
			expect(queued.syncRequestId).not.toBe(work.requestId);
			work = { ...work, requestId: queued.syncRequestId! };
			const before = calls.length;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			if (retry < 3) {
				expect(now - checkpoint.attachments[0].uploadAttemptedAt!).toBeLessThan(180_000);
				expect(calls.slice(before).some(call => /create-target|remint|object/.test(call.path))).toBe(false);
				expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
					status: "pending", settlementNeeded: true, attempts: 0, attachments: [{ deliveries: 1,
						uploadAttemptedAt: checkpoint.attachments[0].uploadAttemptedAt, request, nextAttemptAt: expect.any(Number) }],
				});
			} else {
				expect(now - checkpoint.attachments[0].uploadAttemptedAt!).toBeGreaterThanOrEqual(180_000);
				expect(calls.slice(before).filter(call => /service-uploads|object/.test(call.path)).map(call => call.path)).toEqual([
					"/api/v1/files/service-uploads/finalize", "/api/v1/files/service-uploads/remint", "/object", "/api/v1/files/service-uploads/finalize",
				]);
			}
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: work, result: { kind: "success", returnValue: null } });
		}
		expect(calls.filter(call => call.path.endsWith("/create-target"))).toHaveLength(1);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/remint")).map(call => call.body)).toEqual([keys]);
		expect(calls.filter(call => call.path.endsWith("/finalize")).map(call => call.body)).toEqual(Array.from({ length: 4 }, () => keys));
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done", emailWritten: true, settlementNeeded: false, nextAttemptAt: null, attempts: 0,
			attachments: [{ state: "saved", deliveries: 2, request, nodeId: committed.nodeId, livePath: committed.path }],
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			messagesSynced: 1, syncStatus: "live", syncError: null, syncWorkId: null, syncRequestId: null,
			ledgerCounts: { pending: 0, done: 1 },
		});
	});
	test.each(["available", "revoked"] as const)("a stop after pending replies with %s source resumes one receipt", async (sourceAccess) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		let finalizes = 0;
		let commit = false;
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path.endsWith("/finalize")) {
				finalizes++;
				return Response.json(commit ? committed : pending);
			}
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			if (path === "/object") return new Response(null, { status: 200 });
			return Response.json({}, { status: 500 });
		});
		await stop_after_mutation(f, "save_message", async () => {
			const task = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!.attachments[0];
			return finalizes === 1 && task.state === "pending" && task.deliveries === 1;
		});
		const checkpoint = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(checkpoint).toMatchObject({ status: "pending", attempts: 0, emailWritten: true, settlementNeeded: true,
			attachments: [{ state: "pending", accepted: true, deliveries: 1, sourceUnavailablePendingChecks: 0,
				nodeId: pending.nodeId, livePath: pending.path, uploadAttemptedAt: expect.any(Number) }],
		});
		expect(checkpoint.attachments[0].nextAttemptAt).toBe(now + 60_000);
		expect(checkpoint.nextAttemptAt).toBe(checkpoint.attachments[0].nextAttemptAt);
		expect(calls.map(call => call.path)).toEqual(["/token", "/gmail/v1/users/me/messages/ab", "/api/v1/files/write",
			"/api/v1/files/service-uploads/create-target", "/object", "/api/v1/files/service-uploads/finalize"]);
		const request = checkpoint.attachments[0].request!;
		if (sourceAccess === "revoked") await f.t.mutation(internal.gmail_accounts.finish_slice, {
			work: f.work, error: "google_revoked", retryAfterMs: null, attachmentNote: null,
		});
		// Workpool can retry the same request before the saved task is due.
		const early = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.slice(early).map(call => call.path)).toEqual(sourceAccess === "available" ? ["/token", "/gmail/v1/users/me/history"] : []);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(checkpoint);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "success", returnValue: null } });
		const completed = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(completed.nextSyncAt).toBeGreaterThan(now);
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
		now = completed.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		expect(queued.syncRequestId).not.toBe(f.work.requestId);
		const work = { ...f.work, requestId: queued.syncRequestId! };
		const before = calls.length;
		const again = await stop_after_mutation({ ...f, work }, "save_message", async () => {
			const task = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!.attachments[0];
			return finalizes === 2 && task.state === "pending" && (sourceAccess === "revoked"
				? task.reason === "source_unavailable" : calls.at(-1)!.path.endsWith("/messages/ab"));
		});
		expect(calls.slice(before).map(call => call.path)).toEqual(["/api/v1/files/service-uploads/finalize",
			...(sourceAccess === "available" ? ["/token", "/gmail/v1/users/me/messages/ab"] : []),
		]);
		const waiting = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(waiting).toMatchObject({ status: "pending", attempts: 0, settlementNeeded: true,
			filePath: checkpoint.filePath, emailWritten: true, fileNodeId: checkpoint.fileNodeId,
			attachments: [{ state: "pending", accepted: true, deliveries: 1, request,
				uploadAttemptedAt: checkpoint.attachments[0].uploadAttemptedAt }],
		});
		expect(waiting.attachments[0].sourceUnavailablePendingChecks).toBe(sourceAccess === "revoked" ? 1 : 0);
		expect(waiting.attachments[0].nextAttemptAt).toBe(now + 60_000);
		expect(waiting.nextAttemptAt).toBe(waiting.attachments[0].nextAttemptAt);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: work, result: { kind: "failed", error: again.message } });
		const paused = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(paused.nextSyncAt).toBeGreaterThan(now);
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
		now = paused.nextSyncAt!;
		commit = true;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const due = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(due.syncWorkId).not.toBeNull();
		expect(due.syncRequestId).not.toBe(work.requestId);
		const next = { ...work, requestId: due.syncRequestId! };
		const resumed = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work: next });
		expect(calls.slice(resumed).map(call => call.path)).toEqual(["/api/v1/files/service-uploads/finalize"]);
		expect(calls.filter(call => call.path.endsWith("/finalize")).map(call => call.body))
			.toEqual(Array.from({ length: 3 }, () => ({ idempotencyKey: request.idempotencyKey, targetKey: request.targetKey })));
		expect(calls.filter(call => call.path.endsWith("/create-target"))).toHaveLength(1);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(1);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "done", attempts: 0, settlementNeeded: false,
			nextAttemptAt: null, attachments: [{ state: "saved", deliveries: 1, request, nodeId: committed.nodeId, livePath: committed.path,
				sourceUnavailablePendingChecks: sourceAccess === "revoked" ? 1 : 0 }],
		});
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: due.syncWorkId! as typeof f.workId, context: next, result: { kind: "success", returnValue: null } });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ messagesSynced: 1,
			sourceError: sourceAccess === "revoked" ? "google_revoked" : null, syncStatus: sourceAccess === "revoked" ? "error" : "live",
			syncWorkId: null, syncRequestId: null, ledgerCounts: { pending: 0, done: 1 },
		});
	});
	test.each(["available", "revoked"] as const)("a stop at each recovery pending reply with %s source keeps its clock and count", async (sourceAccess) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		let finalizes = 0;
		let commit = false;
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path.endsWith("/finalize")) {
				finalizes++;
				return Response.json(commit ? committed : pending);
			}
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			if (path === "/object") return new Response(null, { status: 200 });
			return Response.json({}, { status: 500 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		const created = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(created).toMatchObject({ status: "pending", emailWritten: true, attempts: 0, settlementNeeded: true,
			attachments: [{ state: "pending", accepted: true, deliveries: 1, sourceUnavailablePendingChecks: 0 }],
		});
		const request = created.attachments[0].request!;
		if (sourceAccess === "revoked") await f.t.mutation(internal.gmail_accounts.finish_slice, {
			work: f.work, error: "google_revoked", retryAfterMs: null, attachmentNote: null,
		});
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "success", returnValue: null } });
		const first = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		now = first.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		expect(queued.syncRequestId).not.toBe(f.work.requestId);
		let work = { ...f.work, requestId: queued.syncRequestId! };
		let workId = queued.syncWorkId! as typeof f.workId;
		const checks = sourceAccess === "revoked" ? 5 : 1;
		for (let check = 1; check <= checks; check++) {
			const before = calls.length;
			const crash = await stop_after_mutation({ ...f, work }, "save_message", async () => {
				const task = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!.attachments[0];
				return finalizes === check + 1 && task.accepted && task.deliveries === 1;
			});
			expect(calls.slice(before).map(call => call.path)).toEqual(["/api/v1/files/service-uploads/finalize"]);
			const saved = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
			expect(saved.attachments[0].sourceUnavailablePendingChecks).toBe(sourceAccess === "revoked" ? check : 0);
			expect(saved).toMatchObject({ filePath: created.filePath, emailWritten: true, fileNodeId: created.fileNodeId,
				attempts: 0, attachments: [{ accepted: true, deliveries: 1, request, nodeId: pending.nodeId, livePath: pending.path,
					uploadAttemptedAt: created.attachments[0].uploadAttemptedAt }],
			});
			if (check === 5) {
				expect(saved).toMatchObject({ status: "given_up", error: "settlement_unconfirmed", settlementNeeded: false,
					nextAttemptAt: null, attachments: [{ state: "unconfirmed", nextAttemptAt: null }],
				});
				await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "failed", error: crash.message } });
				now += 3600_000;
				await f.t.mutation(internal.gmail_accounts.dispatch, {});
				expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ nextSyncAt: null,
					syncWorkId: null, syncRequestId: null, ledgerCounts: { pending: 0, given_up: 1 },
				});
				continue;
			}
			expect(saved.attachments[0].nextAttemptAt).toBe(now + 60_000);
			expect(saved.nextAttemptAt).toBe(saved.attachments[0].nextAttemptAt);
			expect(saved).toMatchObject({ status: "pending", settlementNeeded: true, attachments: [{ state: "pending" }] });
			const early = calls.length;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(calls.slice(early).map(call => call.path)).toEqual(sourceAccess === "available" ? ["/token", "/gmail/v1/users/me/history"] : []);
			expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(saved);
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
			const completed = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(completed.nextSyncAt).toBeGreaterThan(now);
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
			now = completed.nextSyncAt!;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const next = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(next.syncWorkId).not.toBeNull();
			expect(next.syncRequestId).not.toBe(work.requestId);
			work = { ...f.work, requestId: next.syncRequestId! };
			workId = next.syncWorkId! as typeof f.workId;
		}
		if (sourceAccess === "revoked") {
			expect(await f.t.mutation(internal.gmail_accounts.retry_failed, { ...f.actor, accountId: f.accountId, expectedGeneration: 1 }))
				.toEqual({ _yay: { count: 1, more: false } });
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const retry = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(retry.syncWorkId).not.toBeNull();
			expect(retry.syncRequestId).not.toBe(work.requestId);
			work = { ...f.work, requestId: retry.syncRequestId! };
			workId = retry.syncWorkId! as typeof f.workId;
		}
		commit = true;
		const before = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls.slice(before).map(call => call.path)).toEqual([
			...(sourceAccess === "available" ? ["/token", "/gmail/v1/users/me/history"] : []),
			"/api/v1/files/service-uploads/finalize",
		]);
		expect(calls.filter(call => call.path.endsWith("/finalize")).map(call => call.body))
			.toEqual(Array.from({ length: checks + 2 }, () => ({ idempotencyKey: request.idempotencyKey, targetKey: request.targetKey })));
		expect(calls.filter(call => call.path.endsWith("/create-target"))).toHaveLength(1);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(1);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "done", attempts: 0, settlementNeeded: false,
			nextAttemptAt: null, attachments: [{ state: "saved", accepted: true, request, nodeId: committed.nodeId, livePath: committed.path,
				deliveries: sourceAccess === "revoked" ? 0 : 1, sourceUnavailablePendingChecks: 0 }],
		});
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ messagesSynced: 1,
			sourceError: sourceAccess === "revoked" ? "google_revoked" : null, syncWorkId: null, syncRequestId: null,
			ledgerCounts: { pending: 0, done: 1, given_up: 0 },
		});
	});
	test("revocation pauses an unstarted part without hiding a pending receipt", async () => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		let finalizes = 0;
		let commit = false;
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json({ ...source, payload: { ...source.payload,
				parts: [...source.payload.parts, { ...source.payload.parts[1], partId: "2", filename: "second.pdf" }],
			} });
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path.endsWith("/finalize")) { finalizes++; return Response.json(commit ? committed : pending); }
			if (path === "/object") return new Response(null, { status: 200 });
			return Response.json({}, { status: 500 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		const created = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(created.attachments).toHaveLength(2);
		expect(created.attachments.map(task => task.state)).toEqual(["pending", "unstarted"]);
		const request = created.attachments[0].request!;
		await f.t.mutation(internal.gmail_accounts.finish_slice, { work: f.work, error: "google_revoked", retryAfterMs: null, attachmentNote: null });
		const before = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls).toHaveLength(before);
		const paused = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(paused.nextAttemptAt).toBe(created.attachments[0].nextAttemptAt);
		expect(paused).toMatchObject({ settlementNeeded: true, attempts: 0,
			attachments: [{ state: "pending", request, sourceUnavailablePendingChecks: 0 },
				{ state: "unstarted", request: null, nextAttemptAt: null, deliveries: 0 }],
		});
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "success", returnValue: null } });
		now = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		const work = { ...f.work, requestId: queued.syncRequestId! };
		await stop_after_mutation({ ...f, work }, "save_message", async () => finalizes === 2);
		expect(calls.slice(before).map(call => call.path)).toEqual(["/api/v1/files/service-uploads/finalize"]);
		const waiting = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(waiting).toMatchObject({ status: "pending", settlementNeeded: true,
			attachments: [{ state: "pending", request, sourceUnavailablePendingChecks: 1, nextAttemptAt: now + 60_000 },
				{ state: "unstarted", request: null, nextAttemptAt: null }],
		});
		expect(waiting.nextAttemptAt).toBe(waiting.attachments[0].nextAttemptAt);
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(waiting);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: work, result: { kind: "success", returnValue: null } });
		now = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const due = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		commit = true;
		const next = { ...f.work, requestId: due.syncRequestId! };
		await f.t.action(internal.gmail_worker.work_account_slice, { work: next });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: due.syncWorkId! as typeof f.workId, context: next, result: { kind: "success", returnValue: null } });
		expect(calls.slice(before).map(call => call.path)).toEqual(Array.from({ length: 2 }, () => "/api/v1/files/service-uploads/finalize"));
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "pending", settlementNeeded: false,
			attachments: [{ state: "saved", request, sourceUnavailablePendingChecks: 1 }, { state: "unstarted", request: null, nextAttemptAt: null }],
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ sourceError: "google_revoked", nextSyncAt: null, syncWorkId: null });
	});
	test.each(["body", "attachment"] as const)("missing %s bytes keep the Gmail account usable", async (kind) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json({ ...source, payload: { ...source.payload,
				parts: source.payload.parts.map((part, index) => index === (kind === "body" ? 0 : 1)
					? { ...part, body: { size: 4, attachmentId: "bytes" } } : part),
			} });
			if (path.endsWith("/attachments/bytes")) return new Response(null, { status: 404 });
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			return Response.json({}, { status: 500 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.sourceError).toBeNull();
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toMatchObject({ status: "skipped", skipReason: "deleted_before_fetch",
			deletedAt: now, settlementNeeded: false, nextAttemptAt: null, attempts: 0, attachmentsNotSaved: 1,
			emailWritten: kind === "attachment", attachments: [{ state: "not_saved", request: null, reason: "source_unavailable" }] });
		expect(calls.filter(call => call.path.endsWith("/attachments/bytes"))).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(kind === "body" ? 0 : 1);
		expect(calls.some(call => /service-uploads|\/object$/.test(call.path))).toBe(false);
	});
	test.each([403, 503])("a %s byte reply keeps the Gmail error handling", async (status) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json({ ...source, payload: { ...source.payload,
				parts: [{ ...source.payload.parts[0], body: { size: 4, attachmentId: "bytes" } }],
			} });
			if (path.endsWith("/attachments/bytes")) return new Response(null, { status });
			return Response.json({}, { status: 500 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect((await f.t.run(ctx => ctx.db.get(f.ledgerId)))!.skipReason).toBeNull();
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toMatchObject({ deletedAt: null, attempts: 0, emailWritten: false });
		expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toMatchObject({ sourceError: status === 403 ? "gmail_request" : null,
			syncError: status === 403 ? "gmail_request" : "gmail_temporary", syncStatus: status === 403 ? "error" : "blocked" });
		expect(calls.filter(call => call.path.endsWith("/attachments/bytes"))).toHaveLength(1);
		expect(calls.some(call => /files\/write|service-uploads|\/object$/.test(call.path))).toBe(false);
	});
	test.each(["body", "new attachment", "remint attachment", "other attachment"] as const)("a stop after missing %s bytes keeps only this message's source loss", async (kind) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		const hasReceipt = kind === "remint attachment" || kind === "other attachment";
		let missing = !hasReceipt;
		let missingReply = false;
		let pendingReplies = 0;
		let settle = false;
		let discover = false;
		const parts = source.payload.parts.map((part, index) => index === (kind === "body" ? 0 : 1) && kind !== "other attachment"
			? { ...part, body: { size: 4, attachmentId: "bytes" } } : part);
		if (hasReceipt) parts.push({ ...source.payload.parts[1], partId: "2", filename: "second.pdf", body: { size: 4, attachmentId: "bytes" } });
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json({ ...source, payload: { ...source.payload, parts } });
			if (path.endsWith("/messages/ef")) return Response.json({ ...source, id: "ef", payload: { ...source.payload, parts: [source.payload.parts[0]] } });
			if (path.endsWith("/attachments/bytes")) {
				if (!missing) return Response.json({ size: 4, data: "ZmlsZQ" });
				missingReply = true;
				return new Response(null, { status: 404 });
			}
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path === "/object") return new Response(null, { status: 200 });
			if (path.endsWith("/finalize")) {
				if (settle) return Response.json(committed);
				pendingReplies++;
				return Response.json(pending);
			}
			if (path.endsWith("/history")) return Response.json({ historyId: discover ? "12" : "11", history: discover
				? [{ id: "12", messagesAdded: [{ message: { id: "ef" } }] }] : [] });
			return Response.json({}, { status: 500 });
		});
		let work = f.work;
		let workId = f.workId;
		let prepared = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		if (hasReceipt) {
			const firstCrash = await stop_after_mutation(f, "save_message", async () => pendingReplies === 1);
			prepared = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
			expect(prepared.attachments.map(task => task.state)).toEqual(["pending", "unstarted"]);
			missing = true;
			if (kind === "remint attachment") {
				await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "failed", error: firstCrash.message } });
				const completed = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
				now = Math.max(completed.nextSyncAt!, prepared.attachments[0].uploadAttemptedAt! + 180_000);
				await f.t.mutation(internal.gmail_accounts.dispatch, {});
				const queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
				expect(queued.syncRequestId).not.toBe(work.requestId);
				expect(queued.syncWorkId).not.toBeNull();
				work = { ...work, requestId: queued.syncRequestId! };
				workId = queued.syncWorkId! as typeof f.workId;
			}
		}
		const crash = await stop_after_mutation({ ...f, work }, "save_message", async () => missingReply);
		const saved = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		expect(saved.skipReason).toBe("deleted_before_fetch");
		expect(saved.deletedAt).toBe(now);
		expect(saved.attachments[hasReceipt ? 1 : 0].state).toBe("not_saved");
		expect(saved.attachmentsNotSaved).toBe(1);
		expect(saved.status).toBe(hasReceipt ? "pending" : "skipped");
		expect(saved.settlementNeeded).toBe(hasReceipt);
		expect(saved.nextAttemptAt).toBe(hasReceipt ? saved.attachments[0].nextAttemptAt : null);
		expect(saved).toMatchObject({ attempts: 0, error: null, emailWritten: kind !== "body" });
		if (hasReceipt) {
			expect(saved.attachments[0].request).toEqual(prepared.attachments[0].request);
			expect(saved.attachments[0].sourceUnavailablePendingChecks).toBe(kind === "remint attachment" ? 1 : 0);
			expect(saved.attachments[0]).toMatchObject({ state: "pending", accepted: true, deliveries: 1,
				uploadAttemptedAt: prepared.attachments[0].uploadAttemptedAt, sourceUnavailablePendingChecks: kind === "remint attachment" ? 1 : 0 });
			expect(saved.attachments[1]).toMatchObject({ state: "not_saved", request: null, reason: "source_unavailable", nextAttemptAt: null });
			expect(saved.filePath).toBe(prepared.filePath);
			expect(saved.fileNodeId).toBe(prepared.fileNodeId);
		}
		expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.sourceError).toBeNull();
		const early = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(saved);
		expect(calls.slice(early).filter(call => /messages\/ab|files\/write|service-uploads|\/object$/.test(call.path))).toHaveLength(0);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "failed", error: crash.message } });
		const completed = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		expect(completed.nextSyncAt).toBeGreaterThan(now);
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toEqual(completed);
		now = completed.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		expect(queued.syncRequestId).not.toBe(work.requestId);
		expect(queued.syncWorkId).not.toBeNull();
		work = { ...work, requestId: queued.syncRequestId! };
		workId = queued.syncWorkId! as typeof f.workId;
		settle = true;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		const settled = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		expect(settled).toMatchObject({ status: "skipped", skipReason: saved.skipReason, deletedAt: saved.deletedAt,
			attempts: 0, attachmentsNotSaved: 1, nextAttemptAt: null, settlementNeeded: false,
			filePath: saved.filePath, emailWritten: saved.emailWritten, fileNodeId: saved.fileNodeId });
		if (hasReceipt) expect(settled.attachments[0]).toMatchObject({ state: "saved", request: prepared.attachments[0].request,
			deliveries: 1, sourceUnavailablePendingChecks: kind === "remint attachment" ? 1 : 0 });
		else expect(settled).toEqual(saved);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		discover = true;
		for (let turn = 0; turn < 3; turn++) {
			const due = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			now = due.nextSyncAt!;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const next = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			expect(next.syncWorkId).not.toBeNull();
			work = { ...work, requestId: next.syncRequestId! };
			workId = next.syncWorkId! as typeof f.workId;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		}
		expect(await f.t.run(ctx => ctx.db.query("messages_ledger")
			.withIndex("by_account_gmailMessageId", q => q.eq("accountId", f.accountId).eq("gmailMessageId", "ef")).unique()))
			.toMatchObject({ status: "done", emailWritten: true });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(settled);
		expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.sourceError).toBeNull();
		expect(calls.filter(call => call.path.endsWith("/messages/ab"))).toHaveLength(hasReceipt ? 2 : 1);
		expect(calls.filter(call => call.path.endsWith("/attachments/bytes"))).toHaveLength(kind === "remint attachment" ? 2 : 1);
		expect(calls.filter(call => call.path.endsWith("/create-target"))).toHaveLength(hasReceipt ? 1 : 0);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(hasReceipt ? 1 : 0);
		expect(calls.filter(call => call.path.endsWith("/remint"))).toHaveLength(0);
		if (hasReceipt) expect(calls.filter(call => call.path.endsWith("/finalize")).map(call => call.body)).toEqual(Array.from({ length: kind === "remint attachment" ? 3 : 2 }, () => ({
			idempotencyKey: prepared.attachments[0].request!.idempotencyKey, targetKey: prepared.attachments[0].request!.targetKey,
		})));
	});
	test.each(["deleted", "spam", "trash", "draft", "source_too_large", "mime_too_large", "invalid_source"] as const)("a stop after new %s source loss saves the pending check and skips new parts", async (kind) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		const skipReason = kind === "deleted" ? "deleted_before_fetch" : ["spam", "trash", "draft"].includes(kind) ? kind : null;
		let sourceReads = 0;
		let commit = false;
		let cancelled = false;
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) {
				sourceReads++;
				if (sourceReads === 1) return Response.json({ ...source, payload: { ...source.payload,
					parts: [...source.payload.parts, { ...source.payload.parts[1], partId: "2", filename: "second.pdf" }],
				} });
				if (kind === "deleted") return new Response(null, { status: 404 });
				if (kind === "source_too_large") {
					const chunk = new Uint8Array(1024 * 1024);
					return new Response(new ReadableStream<Uint8Array>({
						pull(controller) { controller.enqueue(chunk); },
						cancel() { cancelled = true; },
					}), { headers: { "Content-Length": "1" } });
				}
				if (kind === "mime_too_large") return Response.json({ ...source, payload: { parts: Array.from({ length: 4096 }, () => ({})) } });
				if (kind === "invalid_source") return Response.json({ ...source, id: "ef" });
				return Response.json({ ...source, labelIds: [kind.toUpperCase()] });
			}
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path.endsWith("/finalize")) return Response.json(commit ? committed : pending);
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			if (path === "/object") return new Response(null, { status: 200 });
			return Response.json({}, { status: 500 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		const created = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(created.attachments.map(task => task.state)).toEqual(["pending", "unstarted"]);
		const request = created.attachments[0].request!;
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "success", returnValue: null } });
		now = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		expect(queued.syncRequestId).not.toBe(f.work.requestId);
		const work = { ...f.work, requestId: queued.syncRequestId! };
		const before = calls.length;
		const crash = await stop_after_mutation({ ...f, work }, "save_message", async () => {
			return sourceReads === 2;
		});
		expect(calls.slice(before).map(call => call.path)).toEqual(["/api/v1/files/service-uploads/finalize", "/token", "/gmail/v1/users/me/messages/ab"]);
		const saved = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(saved.attachments[0].sourceUnavailablePendingChecks).toBe(1);
		expect(saved.attachments[1].state).toBe("not_saved");
		expect(saved).toMatchObject({ status: "pending", settlementNeeded: true, attempts: 0, attachmentsNotSaved: 1,
			filePath: created.filePath, emailWritten: true, fileNodeId: created.fileNodeId, skipReason, error: skipReason ? null : kind,
			attachments: [{ state: "pending", accepted: true, deliveries: 1, request, nextAttemptAt: now + 60_000 },
				{ state: "not_saved", request: null, deliveries: 0, nextAttemptAt: null, reason: "source_unavailable" }],
		});
		expect(saved.nextAttemptAt).toBe(saved.attachments[0].nextAttemptAt);
		expect(saved.deletedAt).toBe(kind === "deleted" ? now : null);
		expect(cancelled).toBe(kind === "source_too_large");
		const early = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls.slice(early).map(call => call.path)).toEqual(["/token", "/gmail/v1/users/me/history"]);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(saved);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: work, result: { kind: "failed", error: crash.message } });
		const completed = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(completed.nextSyncAt).toBeGreaterThan(now);
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
		now = completed.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const due = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(due.syncWorkId).not.toBeNull();
		expect(due.syncRequestId).not.toBe(work.requestId);
		commit = true;
		await f.t.action(internal.gmail_worker.work_account_slice, { work: { ...f.work, requestId: due.syncRequestId! } });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: due.syncWorkId! as typeof f.workId, context: { ...f.work, requestId: due.syncRequestId! }, result: { kind: "success", returnValue: null } });
		expect(sourceReads).toBe(2);
		expect(calls.filter(call => call.path.endsWith("/create-target"))).toHaveLength(1);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/finalize")).map(call => call.body))
			.toEqual(Array.from({ length: 3 }, () => ({ idempotencyKey: request.idempotencyKey, targetKey: request.targetKey })));
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: skipReason ? "skipped" : "given_up",
			settlementNeeded: false, nextAttemptAt: null, attempts: 0, attachmentsNotSaved: 1, skipReason,
			error: skipReason ? null : kind, deletedAt: saved.deletedAt,
			attachments: [{ state: "saved", request, sourceUnavailablePendingChecks: 1, nextAttemptAt: null }, { state: "not_saved" }],
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ messagesSynced: 1, sourceError: null,
			ledgerCounts: { pending: 0, done: 0, skipped: skipReason ? 1 : 0, given_up: skipReason ? 0 : 1 },
		});
	});
	test.each(["deleted", "spam", "invalid_source"] as const)("a stop after new %s source loss without receipts keeps the final status", async (kind) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		let sourceReads = 0;
		const skipReason = kind === "deleted" ? "deleted_before_fetch" : kind === "spam" ? "spam" : null;
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) {
				sourceReads++;
				return kind === "deleted" ? new Response(null, { status: 404 }) : Response.json(kind === "spam"
					? { ...source, labelIds: ["SPAM"] } : { ...source, id: "ef" });
			}
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			return Response.json({}, { status: 500 });
		});
		const crash = await stop_after_mutation(f, "save_message", async () => sourceReads === 1);
		const final = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(final.status).toBe(skipReason ? "skipped" : "given_up");
		expect(final).toMatchObject({ skipReason, error: skipReason ? null : "invalid_source", attempts: 0,
			nextAttemptAt: null, settlementNeeded: false, attachments: [], emailWritten: false, filePath: null,
		});
		expect(final.deletedAt).toBe(kind === "deleted" ? now : null);
		expect(calls.map(call => call.path)).toEqual(["/token", "/gmail/v1/users/me/messages/ab"]);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "failed", error: crash.message } });
		const stopped = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(stopped.nextSyncAt).toBeGreaterThan(now);
		now = stopped.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		expect(queued.syncRequestId).not.toBe(f.work.requestId);
		const work = { ...f.work, requestId: queued.syncRequestId! };
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: work, result: { kind: "success", returnValue: null } });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(final);
		expect(sourceReads).toBe(1);
		expect(calls.some(call => call.path.startsWith("/api/v1/"))).toBe(false);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ messagesSynced: 0,
			ledgerCounts: { pending: 0, done: 0, skipped: skipReason ? 1 : 0, given_up: skipReason ? 0 : 1 },
		});
	});
	test.each([
		["invalid_grant", "finish_slice"], ["invalid_request", "finish_slice"], ["temporarily_unavailable", "finish_slice"],
		["invalid_grant", "save_message"], ["invalid_request", "save_message"],
	] as const)("a stop after token %s at %s keeps pending settlement and its check count", async (kind, checkpoint) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		const sourceError = kind === "invalid_grant" ? "google_revoked" : kind === "invalid_request" ? "gmail_request" : null;
		let rejectToken = false;
		let tokenFailures = 0;
		let commit = false;
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json({ ...source, payload: { ...source.payload,
				parts: [...source.payload.parts, { ...source.payload.parts[1], partId: "2", filename: "second.pdf" }],
			} });
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path.endsWith("/finalize")) return Response.json(commit ? committed : pending);
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			if (path === "/object") return new Response(null, { status: 200 });
			return Response.json({}, { status: 500 });
		});
		const readyFetch = globalThis.fetch;
		vi.stubGlobal("fetch", vi.fn((input: string | URL | Request, init?: RequestInit) => {
			const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
			if (rejectToken && url.hostname === "oauth2.googleapis.com") {
				now += 600;
				tokenFailures++;
				calls.push({ path: url.pathname, body: null });
				return Promise.resolve(Response.json({ error: kind }, { status: sourceError ? 400 : 503 }));
			}
			return readyFetch(input, init);
		}));
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		const created = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(created.attachments.map(task => task.state)).toEqual(["pending", "unstarted"]);
		const request = created.attachments[0].request!;
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "success", returnValue: null } });
		now = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		expect(queued.syncRequestId).not.toBe(f.work.requestId);
		const work = { ...f.work, requestId: queued.syncRequestId! };
		rejectToken = true;
		const before = calls.length;
		const crash = await stop_after_mutation({ ...f, work }, checkpoint, async () => tokenFailures === 1);
		expect(calls.slice(before).map(call => call.path)).toEqual(["/api/v1/files/service-uploads/finalize", "/token"]);
		const saved = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(saved.attachments[0].sourceUnavailablePendingChecks).toBe(sourceError ? 1 : 0);
		expect(saved).toMatchObject({ status: "pending", settlementNeeded: true, emailWritten: true, attempts: 0,
			filePath: created.filePath, fileNodeId: created.fileNodeId,
			attachments: [{ state: "pending", accepted: true, deliveries: 1, request },
				{ state: "unstarted", request: null, deliveries: 0, nextAttemptAt: sourceError ? null : created.attachments[1].nextAttemptAt }],
		});
		if (sourceError) {
			expect(saved.attachments[0].nextAttemptAt).toBe(now + 60_000);
			expect(saved.nextAttemptAt).toBe(saved.attachments[0].nextAttemptAt);
		}
		if (checkpoint === "save_message") {
			expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ sourceError: null });
			const early = calls.length;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(calls.slice(early).map(call => call.path)).toEqual(["/token"]);
			expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(saved);
		}
		const stopped = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(stopped).toMatchObject({ sourceError, syncError: sourceError ?? "gmail_temporary",
			syncStatus: sourceError ? "error" : "blocked", temporaryFailures: sourceError ? 0 : 1,
		});
		expect(stopped.googleRefreshToken === null).toBe(kind === "invalid_grant");
		if (!sourceError) {
			const early = calls.length;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(calls).toHaveLength(early);
			expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toEqual(stopped);
			expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(saved);
		}
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: work,
			result: checkpoint === "save_message" || !sourceError ? { kind: "success", returnValue: null } : { kind: "failed", error: crash.message },
		});
		const completed = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(completed.nextSyncAt).toBeGreaterThan(now);
		const early = calls.length;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
		expect(calls).toHaveLength(early);
		now = completed.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const due = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(due.syncWorkId).not.toBeNull();
		expect(due.syncRequestId).not.toBe(work.requestId);
		commit = true;
		rejectToken = false;
		const next = { ...f.work, requestId: due.syncRequestId! };
		await f.t.action(internal.gmail_worker.work_account_slice, { work: next });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: due.syncWorkId! as typeof f.workId, context: next, result: { kind: "success", returnValue: null } });
		expect(calls.slice(early).map(call => call.path)).toEqual([
			...(sourceError ? [] : ["/token", "/gmail/v1/users/me/history"]),
			"/api/v1/files/service-uploads/finalize",
		]);
		expect(tokenFailures).toBe(checkpoint === "save_message" ? 2 : 1);
		expect(calls.filter(call => call.path.endsWith("/messages/ab"))).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/create-target"))).toHaveLength(1);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/finalize")).map(call => call.body))
			.toEqual(Array.from({ length: 3 }, () => ({ idempotencyKey: request.idempotencyKey, targetKey: request.targetKey })));
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "pending", settlementNeeded: false,
			attachments: [{ state: "saved", request, sourceUnavailablePendingChecks: sourceError ? 1 : 0 }, { state: "unstarted" }],
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ messagesSynced: 1, sourceError,
			nextSyncAt: sourceError ? null : expect.any(Number), syncWorkId: null, syncRequestId: null,
		});
	});
	test.each([
		["email write", "/files/write"],
		["target create", "/create-target"],
	] as const)("a lost %s reply resumes through completion and the minute dispatcher", async (kind, lostRoute) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		// Pause the queued action so this test runs only its saved context.
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		const receipts = new Map<string, unknown>();
		let lost = false;
		let finalizes = 0;
		const calls = network(async (path, body) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/files/write") || path.endsWith("/create-target")) {
				const replay = receipts.has(path);
				if (replay) expect(body).toEqual(receipts.get(path));
				else {
					const checkpoint = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
					expect(checkpoint.filePath).not.toBeNull();
					if (path.endsWith("/create-target")) expect(checkpoint).toMatchObject({
						emailWritten: true, settlementNeeded: true,
						attachments: [{ state: "uncertain", accepted: false, deliveries: 0, uploadAttemptedAt: null, request: expect.any(Object) }],
					});
					receipts.set(path, body);
				}
				if (!lost && path.endsWith(lostRoute)) {
					lost = true;
					// The mock saves the request, then loses the reply.
					throw new TypeError("Save reply lost");
				}
				if (path.endsWith("/files/write")) return replay
					? Response.json({ message: "A file already exists at this path" }, { status: 409 })
					: Response.json({ nodeId: "email-node" });
				return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			}
			if (path.endsWith("/finalize")) return Response.json(kind === "target create" && ++finalizes === 1 ? pending : committed);
			if (path === "/object") return new Response(null, { status: 200 });
			return Response.json({}, { status: 500 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(lost).toBe(true);
		expect(calls.some((call) => call.path === "/object")).toBe(false);
		const checkpoint = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(checkpoint).toMatchObject({ status: "pending", attempts: 0, emailWritten: kind === "target create", settlementNeeded: kind === "target create" });
		const stopped = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(stopped).toMatchObject({ syncStatus: "blocked", syncError: "sync_error", temporaryFailures: 1 });
		expect(stopped.nextSyncAt).toBeGreaterThan(now);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "success", returnValue: null } });
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const early = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(early.syncWorkId).toBeNull();
		now = stopped.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		expect(queued.syncRequestId).not.toBe(f.work.requestId);
		const work = { ...f.work, requestId: queued.syncRequestId! };
		const before = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		const resumed = calls.slice(before).map((call) => call.path);
		if (kind === "target create") expect(resumed).toEqual([
			"/api/v1/files/service-uploads/finalize", "/token", "/gmail/v1/users/me/messages/ab",
			"/api/v1/files/service-uploads/create-target", "/object", "/api/v1/files/service-uploads/finalize",
		]);
		else expect(resumed).toEqual([
			"/token", "/gmail/v1/users/me/messages/ab", "/api/v1/files/write",
			"/api/v1/files/service-uploads/create-target", "/object", "/api/v1/files/service-uploads/finalize",
		]);
		expect(calls.filter((call) => call.path === "/object")).toHaveLength(1);
		const saved = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(saved).toMatchObject({ status: "done", filePath: checkpoint.filePath, emailWritten: true, emailAssumed: kind === "email write",
			attempts: 0, settlementNeeded: false, attachments: [{ state: "saved", deliveries: 1 }] });
		if (kind === "target create") expect(saved.attachments[0].request).toEqual(checkpoint.attachments[0].request);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "success", returnValue: null } });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncRequestId: work.requestId, syncWorkId: queued.syncWorkId });
		// The account stores Workpool ids as strings.
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: work, result: { kind: "success", returnValue: null } });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			messagesSynced: 1, syncStatus: "live", syncError: null, syncWorkId: null, syncRequestId: null,
			ledgerCounts: { pending: 0, done: 1, emailAssumed: kind === "email write" ? 1 : 0 },
		});
	});
	test("pending settlement waits a minute without replaying create after a recent PUT", async () => {
		const f = await fixture();
		await f.t.run(async (ctx) => {
			const row = (await ctx.db.get(f.ledgerId))!;
			await ctx.db.patch(row._id, {
				attachments: row.attachments.map((task) => ({
					...task,
					uploadAttemptedAt: Date.now(),
				})),
			});
		});
		const calls = network((path) => (path.endsWith("/finalize") ? Response.json(pending) : Response.json(source)));
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.some((call) => /create-target|remint|object/.test(call.path))).toBe(false);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "pending",
			attachments: [{ deliveries: 2, nextAttemptAt: expect.any(Number) }],
		});
	});
	test("a stop after five actual deliveries keeps the receipt until explicit Retry", async () => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		let sourceReads = 0;
		let commit = false;
		const calls = network(path => {
			now += 600;
			if (path.endsWith("/messages/ab")) { sourceReads++; return Response.json(source); }
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (/create-target|remint$/.test(path)) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path.endsWith("/finalize")) return Response.json(commit ? committed : pending);
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			if (path === "/object") return new Response(null, { status: 200 });
			return Response.json({}, { status: 500 });
		});
		let work = f.work;
		let workId = f.workId;
		let prepared = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		async function next_work() {
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
			const completed = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			expect(completed.nextSyncAt).toBeGreaterThan(now);
			// A replacement delivery waits three minutes after the previous PUT.
			now = Math.max(completed.nextSyncAt!, prepared.attachments[0].uploadAttemptedAt! + 180_000);
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			expect(queued.syncWorkId).not.toBeNull();
			expect(queued.syncRequestId).not.toBe(work.requestId);
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
		}
		for (let delivery = 1; delivery <= 5; delivery++) {
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			prepared = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
			expect(prepared).toMatchObject({ status: "pending", emailWritten: true, attempts: 0, settlementNeeded: true,
				attachments: [{ state: "pending", accepted: true, deliveries: delivery, sourceUnavailablePendingChecks: 0 }] });
			expect(calls.filter(call => call.path === "/object")).toHaveLength(delivery);
			await next_work();
		}
		const crash = await stop_after_mutation({ ...f, work }, "save_message", async () => sourceReads === 6);
		const saved = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		expect(saved.attachments[0].state).toBe("unconfirmed");
		expect(saved.attachments[0].reason).toBe("delivery_failed");
		expect(saved.attachments[0].request).toEqual(prepared.attachments[0].request);
		expect(saved.attachments[0].deliveries).toBe(5);
		expect(saved.status).toBe("given_up");
		expect(saved.nextAttemptAt).toBeNull();
		expect(saved.settlementNeeded).toBe(false);
		expect(saved).toMatchObject({ emailWritten: true, filePath: prepared.filePath, fileNodeId: prepared.fileNodeId,
			attempts: 0, attachmentsNotSaved: 0, error: "settlement_unconfirmed", attachments: [{ accepted: true,
				nodeId: prepared.attachments[0].nodeId, livePath: prepared.attachments[0].livePath,
				uploadAttemptedAt: prepared.attachments[0].uploadAttemptedAt, sourceUnavailablePendingChecks: 0, nextAttemptAt: null }] });
		expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.ledgerCounts).toMatchObject({ given_up: 1, pending: 0, done: 0 });
		const before = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(saved);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "failed", error: crash.message } });
		const completed = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toEqual(completed);
		now = Math.max(completed.nextSyncAt!, now + 3600_000);
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		const next = { ...work, requestId: queued.syncRequestId! };
		await f.t.action(internal.gmail_worker.work_account_slice, { work: next });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: next,
			result: { kind: "success", returnValue: null } });
		expect(calls.slice(before).filter(call => /messages\/ab|files\/write|service-uploads|\/object$/.test(call.path))).toHaveLength(0);
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(saved);
		expect(await f.t.mutation(internal.gmail_accounts.retry_failed, { ...f.actor, accountId: f.accountId, expectedGeneration: 1 }))
			.toEqual({ _yay: { count: 1, more: false } });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toMatchObject({ status: "pending", settlementNeeded: true,
			attachments: [{ state: "pending", accepted: true, request: prepared.attachments[0].request, deliveries: 0, sourceUnavailablePendingChecks: 0 }] });
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const retry = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		commit = true;
		const retryCalls = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work: { ...work, requestId: retry.syncRequestId! } });
		expect(calls.slice(retryCalls).map(call => call.path)).toEqual(["/api/v1/files/service-uploads/finalize"]);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: retry.syncWorkId! as typeof f.workId,
			context: { ...work, requestId: retry.syncRequestId! }, result: { kind: "success", returnValue: null } });
		expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toMatchObject({ sourceError: null,
			syncWorkId: null, syncRequestId: null, ledgerCounts: { done: 1, pending: 0, given_up: 0 } });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toMatchObject({ status: "done", emailWritten: true,
			filePath: saved.filePath, fileNodeId: saved.fileNodeId, attachmentsNotSaved: 0, settlementNeeded: false,
			attachments: [{ state: "saved", deliveries: 0, request: prepared.attachments[0].request, reason: null }] });
		expect(calls.filter(call => call.path.endsWith("/messages/ab"))).toHaveLength(6);
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/create-target"))).toHaveLength(1);
		expect(calls.filter(call => call.path === "/object").map(call => Array.from(call.body as Uint8Array)))
			.toEqual(Array.from({ length: 5 }, () => [102, 105, 108, 101]));
		const request = prepared.attachments[0].request!;
		const keys = { idempotencyKey: request.idempotencyKey, targetKey: request.targetKey };
		expect(calls.filter(call => call.path.endsWith("/remint")).map(call => call.body)).toEqual(Array.from({ length: 4 }, () => keys));
		expect(calls.filter(call => call.path.endsWith("/finalize")).map(call => call.body)).toEqual(Array.from({ length: 11 }, () => keys));
	});
	test("five source-free pending checks retain receipts and require explicit Retry", async () => {
		const f = await fixture({ sourceError: "google_revoked" });
		await f.t.run(async (ctx) => {
			const row = (await ctx.db.get(f.ledgerId))!;
			await ctx.db.patch(row._id, {
				attachments: row.attachments.map((task) => ({
					...task,
					sourceUnavailablePendingChecks: 4,
				})),
			});
		});
		const calls = network(() => Response.json(pending));
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls).toHaveLength(1);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "given_up",
			error: "settlement_unconfirmed",
			settlementNeeded: false,
			attachments: [
				{
					state: "unconfirmed",
					accepted: true,
					request: expect.any(Object),
					sourceUnavailablePendingChecks: 5,
				},
			],
		});
	});
	test("a stop after the fifth source-free pending check waits for explicit Retry", async () => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		// Keep queued actions paused while running each saved work request.
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ sourceError: "google_revoked" });
		await f.t.run(async (ctx) => {
			const row = (await ctx.db.get(f.ledgerId))!;
			await ctx.db.patch(row._id, { attachments: row.attachments.map(task => ({ ...task, sourceUnavailablePendingChecks: 0 })) });
		});
		const request = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!.attachments[0].request!;
		let commit = false;
		const calls = network(() => {
			now += 600;
			return Response.json(commit ? committed : pending);
		});
		let work = f.work;
		let workId = f.workId;
		for (let check = 1; check <= 4; check++) {
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
				status: "pending", attempts: 0, attachments: [{ deliveries: 2, sourceUnavailablePendingChecks: check, request }],
			});
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
			const account = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(account.nextSyncAt).not.toBeNull();
			now = account.nextSyncAt!;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(queued.syncRequestId).not.toBe(work.requestId);
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
		}
		const crash = await stop_after_task_save({ ...f, work, workId }, "unconfirmed");
		expect(calls).toHaveLength(5);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "failed", error: crash.message } });
		now += 3600_000;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "given_up", error: "settlement_unconfirmed", nextAttemptAt: null, settlementNeeded: false, attempts: 0,
			attachments: [{ state: "unconfirmed", accepted: true, deliveries: 2, sourceUnavailablePendingChecks: 5, request }],
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			nextSyncAt: null, syncWorkId: null, syncRequestId: null, ledgerCounts: { pending: 0, given_up: 1 },
		});
		expect(await f.t.mutation(internal.gmail_accounts.retry_failed, { ...f.actor, accountId: f.accountId, expectedGeneration: 1 }))
			.toEqual({ _yay: { count: 1, more: false } });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "pending", settlementNeeded: true, attachments: [{ deliveries: 0, sourceUnavailablePendingChecks: 0, request }],
		});
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const retry = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		work = { ...work, requestId: retry.syncRequestId! };
		commit = true;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: retry.syncWorkId! as typeof f.workId, context: work, result: { kind: "success", returnValue: null } });
		expect(calls.map(call => call.path)).toEqual(Array.from({ length: 6 }, () => "/api/v1/files/service-uploads/finalize"));
		expect(calls.map(call => call.body)).toEqual(Array.from({ length: 6 }, () => ({ idempotencyKey: request.idempotencyKey, targetKey: request.targetKey })));
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done", settlementNeeded: false, attachments: [{ state: "saved", deliveries: 0, sourceUnavailablePendingChecks: 0, request }],
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			sourceError: "google_revoked", nextSyncAt: null, syncWorkId: null, syncRequestId: null,
			ledgerCounts: { pending: 0, done: 1, given_up: 0 },
		});
	});
	test("a fresh file refusal holds the row without spending failure or delivery attempts", async () => {
		const f = await fixture({ fresh: true });
		const calls = network((path) =>
			path.endsWith("/messages/ab") ? Response.json(source) : Response.json({ message: "Forbidden" }, { status: 403 }),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.some((call) => call.path.endsWith("/verify-live"))).toBe(true);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "failed",
			permissionHeld: true,
			error: "file_access",
			attempts: 0,
			fileAccessOperation: { kind: "email_write" },
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			permissionProbeNotBefore: null,
			ledgerCounts: { permissionHeld: 1 },
		});
	});
	test("continuing denial starts at most one held unit and keeps the claimed hour", async () => {
		const f = await fixture({ held: true, sourceError: "google_revoked" });
		let claimedDeadline = 0;
		const calls = network(async () => {
			claimedDeadline = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!.permissionProbeNotBefore!;
			return Response.json({ message: "Forbidden" }, { status: 403 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.filter((call) => call.path.endsWith("/finalize"))).toHaveLength(1);
		expect(claimedDeadline).toBeGreaterThan(Date.now());
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			permissionProbeNotBefore: claimedDeadline,
			sourceError: "google_revoked",
			nextSyncAt: expect.any(Number),
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			permissionHeld: true,
			attempts: 0,
			attachments: [{ deliveries: 2, sourceUnavailablePendingChecks: 3 }],
		});
	});
	test("matching pending write proof releases the claim and still reaches PUT", async () => {
		const f = await fixture({ held: true });
		await f.t.run(async (ctx) => {
			const row = (await ctx.db.get(f.ledgerId))!;
			await ctx.db.patch(row._id, {
				attachments: row.attachments.map((task) => ({
					...task,
					uploadAttemptedAt: null,
					deliveries: 0,
				})),
			});
		});
		let finalizes = 0;
		const calls = network((path) =>
			path.endsWith("/finalize")
				? Response.json(++finalizes === 1 ? pending : committed)
				: path.endsWith("/messages/ab")
					? Response.json(source)
					: path.endsWith("/create-target")
						? Response.json(transport)
						: new Response(null),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.some((call) => call.path === "/object")).toBe(true);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			permissionProbeNotBefore: null,
			ledgerCounts: { permissionHeld: 0 },
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done",
			permissionHeld: false,
		});
	});
	test("released settlement clears final row attention but does not release the account hour", async () => {
		const f = await fixture({ held: true, sourceError: "google_revoked" });
		network(() => Response.json({ ...pending, state: "released" }));
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done",
			permissionHeld: false,
		});
		expect((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.permissionProbeNotBefore).toBeGreaterThan(Date.now());
	});
	test.each([
		["released", "ready", 200, null], ["missing", "ready", 404, "Not found"],
		["cancelled", "ready", 409, "This target was already released"], ["expired", "ready", 409, "This target's upload expired"],
		["released", "revoked", 200, null], ["missing", "revoked", 404, "Not found"],
		["cancelled", "revoked", 409, "This target was already released"], ["expired", "revoked", 409, "This target's upload expired"],
	] as const)("a stop after an accepted %s result with %s source keeps its final skip", async (_kind, sourceAccess, status, message) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		let release = false;
		let releasedReply = false;
		let revoke = false;
		let tokenFailures = 0;
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path === "/object") return new Response(null, { status: 200 });
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			if (path.endsWith("/finalize")) {
				if (!release) return Response.json(pending);
				releasedReply = true;
				return status === 200 ? Response.json({ ...pending, state: "released" }) : Response.json({ message }, { status });
			}
			return Response.json({}, { status: 500 });
		});
		const readyFetch = globalThis.fetch;
		vi.stubGlobal("fetch", vi.fn((input: string | URL | Request, init?: RequestInit) => {
			const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
			if (revoke && url.hostname === "oauth2.googleapis.com") {
				now += 600;
				tokenFailures++;
				calls.push({ path: url.pathname, body: null });
				return Promise.resolve(Response.json({ error: "invalid_grant" }, { status: 400 }));
			}
			return readyFetch(input, init);
		}));
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		const accepted = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		expect(accepted).toMatchObject({ status: "pending", emailWritten: true, settlementNeeded: true, attempts: 0,
			attachments: [{ state: "pending", accepted: true, deliveries: 1, sourceUnavailablePendingChecks: 0 }] });
		let work = f.work;
		let workId = f.workId;
		async function next_work() {
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
			const finished = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			expect(finished.nextSyncAt).toBeGreaterThan(now);
			now = finished.nextSyncAt!;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			expect(queued.syncWorkId).not.toBeNull();
			expect(queued.syncRequestId).not.toBe(work.requestId);
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
		}
		await next_work();
		if (sourceAccess === "revoked") {
			// Produce revocation through the worker, after its saved pending reply.
			revoke = true;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(tokenFailures).toBe(1);
			expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toMatchObject({ sourceError: "google_revoked", googleRefreshToken: null });
			await next_work();
		}
		const original = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		release = true;
		const before = calls.length;
		const crash = await stop_after_mutation({ ...f, work }, "save_message", async () => releasedReply);
		const saved = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		expect(saved.attachments[0].state).toBe("not_saved");
		expect(saved.attachments[0].reason).toBe("released");
		expect(saved.attachments[0].request).toEqual(original.attachments[0].request);
		expect(saved.attachmentsNotSaved).toBe(1);
		expect(saved.status).toBe("done");
		expect(saved.nextAttemptAt).toBeNull();
		expect(saved.settlementNeeded).toBe(false);
		expect(saved).toMatchObject({ filePath: accepted.filePath, fileNodeId: accepted.fileNodeId, emailWritten: true, attempts: 0,
			attachments: [{ accepted: true, nodeId: original.attachments[0].nodeId, livePath: original.attachments[0].livePath,
				uploadAttemptedAt: accepted.attachments[0].uploadAttemptedAt, deliveries: 1, nextAttemptAt: null,
				sourceUnavailablePendingChecks: sourceAccess === "ready" ? 0 : 1 }] });
		expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.ledgerCounts).toMatchObject({ done: 1, pending: 0, given_up: 0 });
		expect(calls.slice(before).map(call => call.path)).toEqual(["/api/v1/files/service-uploads/finalize"]);
		const replay = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(saved);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "failed", error: crash.message } });
		const completed = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		expect(completed).toMatchObject({ syncWorkId: null, syncRequestId: null, sourceError: sourceAccess === "ready" ? null : "google_revoked" });
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toEqual(completed);
		if (sourceAccess === "ready") {
			expect(completed.nextSyncAt).toBeGreaterThan(now);
			now = completed.nextSyncAt!;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			expect(queued.syncRequestId).not.toBe(work.requestId);
			expect(queued.syncWorkId).not.toBeNull();
			const next = { ...work, requestId: queued.syncRequestId! };
			await f.t.action(internal.gmail_worker.work_account_slice, { work: next });
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: next,
				result: { kind: "success", returnValue: null } });
		} else {
			expect(completed.nextSyncAt).toBeNull();
			expect(completed.googleRefreshToken).toBeNull();
			now += 3600_000;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toEqual(completed);
			expect(calls).toHaveLength(replay);
		}
		expect(calls.slice(replay).filter(call => /messages\/ab|files\/write|service-uploads|\/object$/.test(call.path))).toHaveLength(0);
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(saved);
		expect(await f.t.mutation(internal.gmail_accounts.retry_failed, { ...f.actor, accountId: f.accountId, expectedGeneration: 1 })).toEqual({ _yay: { count: 0, more: false } });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(saved);
		for (const ending of ["/messages/ab", "/files/write", "/create-target", "/object"]) expect(calls.filter(call => call.path.endsWith(ending))).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/finalize")).map(call => call.body)).toEqual(Array.from({ length: sourceAccess === "ready" ? 2 : 3 }, () => ({
			idempotencyKey: original.attachments[0].request!.idempotencyKey, targetKey: original.attachments[0].request!.targetKey,
		})));
		expect(tokenFailures).toBe(sourceAccess === "ready" ? 0 : 1);
	});
	test.each([
		["create", "cancelled", "This target was already released"], ["create", "expired", "This target's upload expired"],
		["remint", "cancelled", "This target was already released"], ["remint", "expired", "This target's upload expired"],
		["finalize", "released", null],
	] as const)("a stop after %s returns %s keeps the accepted upload final", async (route, _kind, message) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		let release = route === "finalize";
		let releasedReply = false;
		let creates = 0;
		let beforeReleased = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		const calls = network(async (path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			if (path === "/object") return new Response(null, { status: 200 });
			if (path.endsWith("/create-target")) creates++;
			if (release && path.endsWith(route === "create" ? "/create-target" : `/${route}`)) {
				beforeReleased = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
				releasedReply = true;
				return route === "finalize" ? Response.json({ ...pending, state: "released" }) : Response.json({ message }, { status: 409 });
			}
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path.endsWith("/finalize")) return Response.json(pending);
			return Response.json({}, { status: 500 });
		});
		let work = f.work;
		let workId = f.workId;
		if (route !== "finalize") {
			let firstCrash: Error | null = null;
			if (route === "create") firstCrash = await stop_after_mutation(f, "save_message", async () => creates === 1);
			else await f.t.action(internal.gmail_worker.work_account_slice, { work });
			const accepted = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
			expect(accepted).toMatchObject({ status: "pending", emailWritten: true, settlementNeeded: true,
				attachments: [{ state: "pending", accepted: true, deliveries: route === "create" ? 0 : 1 }] });
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work,
				result: firstCrash ? { kind: "failed", error: firstCrash.message } : { kind: "success", returnValue: null } });
			const completed = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			expect(completed.nextSyncAt).toBeGreaterThan(now);
			now = Math.max(completed.nextSyncAt!, route === "remint" ? accepted.attachments[0].uploadAttemptedAt! + 180_000 : now);
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			expect(queued.syncWorkId).not.toBeNull();
			expect(queued.syncRequestId).not.toBe(work.requestId);
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
			release = true;
		}
		const crash = await stop_after_mutation({ ...f, work }, "save_message", async () => releasedReply);
		const saved = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		expect(beforeReleased.attachments[0].accepted).toBe(true);
		expect(saved.attachments[0].state).toBe("not_saved");
		expect(saved.attachments[0].reason).toBe("released");
		expect(saved.attachments[0].request).toEqual(beforeReleased.attachments[0].request);
		expect(saved.attachmentsNotSaved).toBe(1);
		expect(saved.status).toBe("done");
		expect(saved.nextAttemptAt).toBeNull();
		expect(saved.settlementNeeded).toBe(false);
		expect(saved).toMatchObject({ filePath: beforeReleased.filePath, fileNodeId: beforeReleased.fileNodeId, emailWritten: true, attempts: 0,
			attachments: [{ accepted: true, nodeId: beforeReleased.attachments[0].nodeId, livePath: beforeReleased.attachments[0].livePath,
				deliveries: route === "create" ? 0 : 1, uploadAttemptedAt: beforeReleased.attachments[0].uploadAttemptedAt,
				sourceUnavailablePendingChecks: 0, nextAttemptAt: null }] });
		expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.ledgerCounts).toMatchObject({ done: 1, pending: 0, given_up: 0 });
		const early = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(saved);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "failed", error: crash.message } });
		const completed = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		expect(completed.nextSyncAt).toBeGreaterThan(now);
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toEqual(completed);
		now = completed.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		expect(queued.syncRequestId).not.toBe(work.requestId);
		const next = { ...work, requestId: queued.syncRequestId! };
		await f.t.action(internal.gmail_worker.work_account_slice, { work: next });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: next,
			result: { kind: "success", returnValue: null } });
		expect(calls.slice(early).filter(call => /messages\/ab|files\/write|service-uploads|\/object$/.test(call.path))).toHaveLength(0);
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(saved);
		expect(await f.t.mutation(internal.gmail_accounts.retry_failed, { ...f.actor, accountId: f.accountId, expectedGeneration: 1 })).toEqual({ _yay: { count: 0, more: false } });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(saved);
		expect(calls.filter(call => call.path.endsWith("/messages/ab"))).toHaveLength(route === "finalize" ? 1 : 2);
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/create-target"))).toHaveLength(route === "create" ? 2 : 1);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(route === "create" ? 0 : 1);
		const request = beforeReleased.attachments[0].request!;
		const { installationId: _installationId, ...frozen } = request;
		expect(calls.filter(call => call.path.endsWith("/create-target")).map(call => call.body)).toEqual(route === "create" ? [frozen, frozen] : [frozen]);
		const keys = { idempotencyKey: request.idempotencyKey, targetKey: request.targetKey };
		expect(calls.filter(call => call.path.endsWith("/remint")).map(call => call.body)).toEqual(route === "remint" ? [keys] : []);
		expect(calls.filter(call => call.path.endsWith("/finalize")).map(call => call.body)).toEqual(Array.from({ length: route === "remint" ? 2 : 1 }, () => keys));
	});
	test("a late old-chain refusal cannot block a repaired chain", async () => {
		const f = await fixture({ sourceError: "google_revoked" });
		const calls = network(async () => {
			await f.t.run((ctx) =>
				ctx.db.patch(f.accountId, {
					syncRequestId: "replacement",
					syncError: null,
				}),
			);
			return Response.json({ message: "Expired" }, { status: 401 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls).toHaveLength(1);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			syncRequestId: "replacement",
			syncError: null,
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.grantId))).toMatchObject({
			phase: "ready",
		});
	});
	test("Disconnect after create stops the next PUT", async () => {
		const f = await fixture({ fresh: true });
		const calls = network(async (path) => {
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			await f.t.mutation(internal.gmail_accounts.disconnect, {
				...f.actor,
				accountId: f.accountId,
				expectedGeneration: 1,
			});
			return Response.json(transport);
		});
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.filter((call) => call.path.endsWith("/create-target"))).toHaveLength(1);
		expect(calls.some((call) => call.path === "/object")).toBe(false);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			syncStatus: "disconnected",
			nextSyncAt: null,
		});
	});
	test.each(["accepted", "lost reply"] as const)("Disconnect during PUT keeps its receipt after %s", async (reply) => {
		const f = await fixture({ fresh: true });
		let saved = await f.t.run((ctx) => ctx.db.get(f.ledgerId));
		const calls = network(async (path) => {
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: Date.now() + 3600_000 });
			if (path === "/object") {
				saved = await f.t.run((ctx) => ctx.db.get(f.ledgerId));
				expect(saved).toMatchObject({
					emailWritten: true, settlementNeeded: true,
					attachments: [{ state: "pending", accepted: true, deliveries: 1, uploadAttemptedAt: expect.any(Number) }],
				});
				await f.t.mutation(internal.gmail_accounts.disconnect, { ...f.actor, accountId: f.accountId, expectedGeneration: 1 });
				if (reply === "lost reply") throw new TypeError("Upload reply lost");
				return new Response(null, { status: 200 });
			}
			return Response.json({}, { status: 500 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.filter((call) => call.path.endsWith("/finalize"))).toHaveLength(0);
		expect(calls.filter((call) => call.path === "/object")).toHaveLength(1);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(saved);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			connectionGeneration: 2, syncStatus: "disconnected", googleRefreshToken: null,
			hostGrantId: null, syncWorkId: null, syncRequestId: null, nextSyncAt: null,
		});
		const before = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls).toHaveLength(before);
	});
	test("a new plan refusal skips the remaining new attachments but saves the email", async () => {
		const f = await fixture({ fresh: true });
		const calls = network((path) =>
			path.endsWith("/messages/ab")
				? Response.json(source)
				: path.endsWith("/files/write")
					? Response.json({ nodeId: "email-node" })
					: Response.json(
							{
								message: "This workspace's plan does not include file uploads",
							},
							{ status: 403 },
						),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.some((call) => call.path.endsWith("/verify-live"))).toBe(false);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done",
			emailWritten: true,
			permissionHeld: false,
			attachments: [{ state: "not_saved", reason: "plan" }],
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			attachmentsSkippedReason: "plan",
		});
	});
	test.each([
		["plan", "refusal", "This workspace's plan does not include file uploads"],
		["storage", "refusal", "This workspace has reached its storage limit"],
		["plan", "clear", "This workspace's plan does not include file uploads"],
		["storage", "clear", "This workspace has reached its storage limit"],
	] as const)("a stop at the %s %s note keeps its message result", async (reason, step, message) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		const second = { partId: "2", filename: "second.pdf", mimeType: "application/pdf", body: { size: 4, attachmentId: "second" } };
		let refused = true;
		let refusalReply = false;
		let acceptedReply = false;
		let discover = false;
		let uploads = 0;
		const calls = network((path) => {
			now += 600;
			if (/\/messages\/(ab|ef)$/.test(path)) return Response.json({ ...source, id: path.split("/").at(-1),
				payload: { ...source.payload, parts: [...source.payload.parts, second] } });
			if (path.endsWith("/attachments/second")) return Response.json({ size: 4, data: "ZmlsZQ" });
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: discover
				? [{ id: "11", messagesAdded: [{ message: { id: "ef" } }] }] : [] });
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) {
				if (refused) { refusalReply = true; return Response.json({ message }, { status: 403 }); }
				acceptedReply = true;
				return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			}
			if (path.endsWith("/finalize")) return Response.json(uploads > 0 ? committed : pending);
			if (path === "/object") { uploads++; return new Response(null, { status: 200 }); }
			return Response.json({}, { status: 500 });
		});
		let work = f.work;
		let workId = f.workId;
		// Keep completion and each new dispatch on the saved account clock.
		async function resume(crash: Error | null = null) {
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work,
				result: crash ? { kind: "failed", error: crash.message } : { kind: "success", returnValue: null } });
			const delayed = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(delayed.nextSyncAt).toBeGreaterThan(now);
			const before = calls.length;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
			expect(calls).toHaveLength(before);
			now = delayed.nextSyncAt!;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(queued.syncWorkId).not.toBeNull();
			expect(queued.syncRequestId).not.toBe(work.requestId);
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
		}
		let crash: Error;
		if (step === "clear") {
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ attachmentsSkippedReason: reason });
			await resume();
			refused = false;
			discover = true;
			crash = await stop_after_mutation({ ...f, work }, "save_message", async () => acceptedReply);
		} else crash = await stop_after_mutation({ ...f, work }, "save_message", async () => refusalReply);
		const original = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(original.attachmentsNotSaved).toBe(2);
		expect(original).toMatchObject({ status: "done", emailWritten: true, attempts: 0, permissionHeld: false,
			settlementNeeded: false, nextAttemptAt: null, attachments: [
				{ state: "not_saved", reason, deliveries: 0, nextAttemptAt: null },
				{ state: "not_saved", reason, request: null, deliveries: 0, nextAttemptAt: null },
			] });
		const account = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(account.attachmentsSkippedReason).toBe(step === "clear" ? null : reason);
		expect(account).toMatchObject({ sourceError: null, ledgerCounts: { done: 1, pending: step === "clear" ? 1 : 0, permissionHeld: 0 } });
		expect(calls.some(call => /verify-live|attachments\/second|\/object$|\/remint$|\/finalize$/.test(call.path))).toBe(false);
		const saved = step === "clear" ? (await f.t.run((ctx) => ctx.db.query("messages_ledger")
			.withIndex("by_account_gmailMessageId", q => q.eq("accountId", f.accountId).eq("gmailMessageId", "ef")).unique()))! : original;
		if (step === "clear") expect(saved).toMatchObject({ status: "pending", emailWritten: true, settlementNeeded: true,
			attachments: [{ state: "pending", accepted: true, deliveries: 0, request: expect.any(Object) }, { state: "unstarted", request: null }] });
		if (step === "refusal") {
			const beforeResume = calls.length;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(original);
			expect(calls.slice(beforeResume).some(call => /messages\/ab|files\/write|service-uploads|\/object$/.test(call.path))).toBe(false);
		}
		await resume(crash);
		for (let turn = 0; turn < (step === "clear" ? 2 : 1); turn++) {
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			if (step === "clear" && turn === 0) await resume();
		}
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(original);
		expect(calls.filter(call => call.path.endsWith("/messages/ab"))).toHaveLength(1);
		if (step === "clear") {
			expect(await f.t.run((ctx) => ctx.db.get(saved._id))).toMatchObject({ status: "done", attempts: 0,
				attachments: [{ state: "saved", request: saved.attachments[0].request, deliveries: 1 }, { state: "saved", deliveries: 1 }] });
			expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(2);
			expect(calls.filter(call => call.path === "/object")).toHaveLength(2);
		} else expect(calls.filter(call => call.path.endsWith("/create-target"))).toHaveLength(1);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ attachmentsSkippedReason: step === "clear" ? null : reason,
			messagesSynced: step === "clear" ? 2 : 1, ledgerCounts: { done: step === "clear" ? 2 : 1, pending: 0, permissionHeld: 0 },
			syncWorkId: null, syncRequestId: null });
	});
	test("an accepted replay plan refusal retains its receipt for finalize-only recovery", async () => {
		const f = await fixture();
		const calls = network((path) =>
			path.endsWith("/finalize")
				? Response.json(pending)
				: path.endsWith("/messages/ab")
					? Response.json(source)
					: Response.json({ message: "This workspace has reached its storage limit" }, { status: 403 }),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "pending",
			permissionHeld: false,
			settlementNeeded: true,
			attachments: [
				{
					state: "pending",
					accepted: true,
					deliveries: 2,
					sourceUnavailablePendingChecks: 3,
					reason: "storage_settlement_only",
					request: expect.any(Object),
				},
			],
		});
		await f.t.run(async (ctx) => {
			const row = (await ctx.db.get(f.ledgerId))!;
			await ctx.db.patch(row._id, {
				nextAttemptAt: Date.now(),
				attachments: row.attachments.map((task) => ({
					...task,
					nextAttemptAt: Date.now(),
				})),
			});
		});
		const before = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.slice(before).map((call) => call.path)).toEqual(["/api/v1/files/service-uploads/finalize"]);
	});
	test.each([
		["plan", "This workspace's plan does not include file uploads"],
		["storage", "This workspace has reached its storage limit"],
	] as const)("a %s refusal skips a new part and keeps two accepted receipts through stops", async (reason, message) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		const receipts = new Map<string, { path: string; size: number; uploads: number }>();
		let pendingReplies = 0;
		let committedReplies = 0;
		let refusalReply = false;
		let settle = false;
		let discover = false;
		const calls = network((path, body) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json({ ...source, payload: { ...source.payload, parts: [
				...source.payload.parts, { ...source.payload.parts[1], partId: "2", filename: "second.pdf", body: { size: 6, data: "c2Vjb25k" } },
				{ partId: "3", filename: "third.pdf", mimeType: "application/pdf", body: { size: 4, attachmentId: "third" } },
			] } });
			if (path.endsWith("/messages/ef")) return Response.json({ ...source, id: "ef" });
			if (path.endsWith("/attachments/third")) return Response.json({ size: 4, data: "ZmlsZQ" });
			if (path.endsWith("/history")) return Response.json({ historyId: discover ? "12" : "11", history: discover
				? [{ id: "12", messagesAdded: [{ message: { id: "ef" } }] }] : [] });
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target") || path.endsWith("/finalize")) {
				if (body === null || typeof body !== "object" || !("targetKey" in body) || typeof body.targetKey !== "string") throw new Error("Missing target key");
				const key = body.targetKey;
				if (path.endsWith("/create-target")) {
					if (key === "ab:att-2") { refusalReply = true; return Response.json({ message }, { status: 403 }); }
					if (!("path" in body) || typeof body.path !== "string" || !("size" in body) || typeof body.size !== "number") throw new Error("Invalid create request");
					expect(receipts.has(key)).toBe(false);
					receipts.set(key, { path: body.path, size: body.size, uploads: 0 });
					return Response.json({ ...transport, path: body.path, nodeId: `node-${key}`,
						uploadUrl: `https://upload.example.test/object/${encodeURIComponent(key)}`, uploadUrlExpiresAt: now + 3600_000 });
				}
				const receipt = receipts.get(key);
				if (!receipt) throw new Error("Unknown receipt");
				if (settle) {
					expect(receipt.uploads).toBe(1);
					committedReplies++;
					return Response.json({ state: "committed", path: receipt.path, nodeId: `node-${key}`, actualBytes: receipt.size });
				}
				pendingReplies++;
				return Response.json({ ...pending, path: receipt.path, nodeId: `node-${key}` });
			}
			if (path.startsWith("/object/")) {
				const key = decodeURIComponent(path.slice("/object/".length));
				const receipt = receipts.get(key);
				if (!receipt || !(body instanceof Uint8Array)) throw new Error("Unknown upload");
				expect(body.byteLength).toBe(receipt.size);
				expect(Buffer.from(body).toString("utf8")).toBe(key === "ab:att-1" ? "second" : "file");
				receipt.uploads++;
				return new Response(null, { status: 200 });
			}
			return Response.json({}, { status: 500 });
		});
		let work = f.work;
		let workId = f.workId;
		async function resume(crash: Error) {
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "failed", error: crash.message } });
			const delayed = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			expect(delayed.nextSyncAt).toBeGreaterThan(now);
			const before = calls.length;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
			expect(calls).toHaveLength(before);
			now = delayed.nextSyncAt!;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			expect(queued.syncWorkId).not.toBeNull();
			expect(queued.syncRequestId).not.toBe(work.requestId);
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
		}
		// Retry the same stopped work while its next unstarted part is still due.
		await stop_after_mutation(f, "save_message", async () => pendingReplies === 1);
		await stop_after_mutation(f, "save_message", async () => pendingReplies === 2);
		const accepted = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		expect(accepted.attachments.map(task => task.state)).toEqual(["pending", "pending", "unstarted"]);
		const refusalCrash = await stop_after_mutation(f, "save_message", async () => refusalReply);
		const saved = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		expect(saved.attachments.slice(0, 2)).toEqual(accepted.attachments.slice(0, 2));
		expect(saved.attachments[2].state).toBe("not_saved");
		expect(saved.attachmentsNotSaved).toBe(1);
		expect(saved.nextAttemptAt).toBe(Math.min(saved.attachments[0].nextAttemptAt!, saved.attachments[1].nextAttemptAt!));
		expect(saved).toMatchObject({ status: "pending", emailWritten: true, permissionHeld: false, attempts: 0, settlementNeeded: true,
			attachments: [{ state: "pending", accepted: true, deliveries: 1 }, { state: "pending", accepted: true, deliveries: 1 },
				{ state: "not_saved", accepted: false, reason, deliveries: 0, nextAttemptAt: null }] });
		expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.attachmentsSkippedReason).toBe(reason);
		const early = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(saved);
		expect(calls.slice(early).map(call => call.path)).toEqual(["/token", "/gmail/v1/users/me/history"]);
		await resume(refusalCrash);
		settle = true;
		let lastCrash = refusalCrash;
		for (let index = 0; index < 2; index++) {
			const before = calls.length;
			lastCrash = await stop_after_mutation({ ...f, work }, "save_message", async () => committedReplies === index + 1);
			expect(calls.slice(before).filter(call => /messages\/ab|attachments\/third|files\/write|service-uploads|\/object\//.test(call.path)).map(call => call.path))
				.toEqual(["/api/v1/files/service-uploads/finalize"]);
			const progress = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
			expect(progress.attachments[index].request).toEqual(saved.attachments[index].request);
			expect(progress.attachments[index].state).toBe("saved");
			expect(progress.attachments[2]).toEqual(saved.attachments[2]);
			expect(progress.attachmentsNotSaved).toBe(1);
			expect(progress.nextAttemptAt).toBe(index === 0 ? progress.attachments[1].nextAttemptAt : null);
			expect(progress).toMatchObject({ status: index === 0 ? "pending" : "done", settlementNeeded: index === 0,
				attempts: 0, filePath: saved.filePath, fileNodeId: saved.fileNodeId, emailWritten: true });
			if (index === 0) await resume(lastCrash);
		}
		const settled = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		expect(settled.nextAttemptAt).toBeNull();
		expect(calls.filter(call => call.path.endsWith("/finalize")).map(call => call.body)).toEqual([
			...accepted.attachments.slice(0, 2).map(task => ({ idempotencyKey: task.request!.idempotencyKey, targetKey: task.request!.targetKey })),
			...accepted.attachments.slice(0, 2).map(task => ({ idempotencyKey: task.request!.idempotencyKey, targetKey: task.request!.targetKey })),
		]);
		expect(calls.filter(call => call.path.endsWith("/messages/ab"))).toHaveLength(3);
		expect(calls.filter(call => call.path.endsWith("/attachments/third"))).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/create-target"))).toHaveLength(3);
		expect(calls.filter(call => call.path.startsWith("/object/"))).toHaveLength(2);
		expect(calls.some(call => call.path.endsWith("/remint"))).toBe(false);
		await resume(lastCrash);
		discover = true;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		const later = (await f.t.run(ctx => ctx.db.query("messages_ledger")
			.withIndex("by_account_gmailMessageId", q => q.eq("accountId", f.accountId).eq("gmailMessageId", "ef")).unique()))!;
		expect(later).toMatchObject({ status: "done", attachments: [{ state: "saved", request: { idempotencyKey: `${f.accountId}:ef`, targetKey: "ef:att-0" } }] });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(settled);
		expect([...receipts.values()].map(receipt => receipt.uploads)).toEqual([1, 1, 1]);
		expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!).toMatchObject({ messagesSynced: 2, attachmentsSkippedReason: null,
			ledgerCounts: { done: 2, pending: 0, given_up: 0, permissionHeld: 0 }, syncRequestId: null, syncWorkId: null });
	});
	test.each([
		["before", "plan", "create", "This workspace's plan does not include file uploads"],
		["after", "plan", "create", "This workspace's plan does not include file uploads"],
		["before", "storage", "create", "This workspace has reached its storage limit"],
		["after", "storage", "create", "This workspace has reached its storage limit"],
		["before", "plan", "remint", "This workspace's plan does not include file uploads"],
		["after", "plan", "remint", "This workspace's plan does not include file uploads"],
		["before", "storage", "remint", "This workspace has reached its storage limit"],
		["after", "storage", "remint", "This workspace has reached its storage limit"],
	] as const)("a stop %s accepted %s %s refusal keeps its receipt through five checks", async (phase, reason, route, message) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		let creates = 0;
		let refused = false;
		let refusalReply = false;
		let countChecks = false;
		let checks = 0;
		let complete = false;
		let discover = false;
		let refusalDoc = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		const calls = network(async (path, body) => {
			now += 600;
			if (/\/messages\/(ab|ef)$/.test(path)) return Response.json({ ...source, id: path.split("/").at(-1) });
			if (path.endsWith("/history")) return Response.json({ historyId: discover ? "12" : "11", history: discover
				? [{ id: "12", messagesAdded: [{ message: { id: "ef" } }] }] : [] });
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target") || path.endsWith("/remint")) {
				if (path.endsWith("/create-target")) creates++;
				if (refused) {
					refusalReply = true;
					refusalDoc = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
					return Response.json({ message }, { status: 403 });
				}
				return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			}
			if (path.endsWith("/finalize")) {
				const later = body !== null && typeof body === "object" && "idempotencyKey" in body && body.idempotencyKey === `${f.accountId}:ef`;
				if (countChecks) checks++;
				return Response.json(complete || later ? committed : pending);
			}
			if (path === "/object") return new Response(null, { status: 200 });
			return Response.json({}, { status: 500 });
		});
		let work = f.work;
		let workId = f.workId;
		async function resume(crash: Error | null = null, minimum = now) {
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work,
				result: crash ? { kind: "failed", error: crash.message } : { kind: "success", returnValue: null } });
			const delayed = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			expect(delayed.nextSyncAt).toBeGreaterThan(now);
			const before = calls.length;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
			expect(calls).toHaveLength(before);
			now = Math.max(delayed.nextSyncAt!, minimum);
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			expect(queued.syncWorkId).not.toBeNull();
			expect(queued.syncRequestId).not.toBe(work.requestId);
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
		}
		let firstCrash: Error | null = null;
		if (route === "create") firstCrash = await stop_after_mutation(f, "save_message", async () => creates === 1);
		else await f.t.action(internal.gmail_worker.work_account_slice, { work });
		const accepted = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		const request = accepted.attachments[0].request!;
		const keys = { idempotencyKey: request.idempotencyKey, targetKey: request.targetKey };
		expect(accepted).toMatchObject({ status: "pending", emailWritten: true, settlementNeeded: true,
			attachments: [{ accepted: true, state: "pending", deliveries: route === "create" ? 0 : 1 }] });
		await resume(firstCrash, route === "remint" ? accepted.attachments[0].uploadAttemptedAt! + 180_000 : now);
		refused = true;
		const beforeRefusal = calls.length;
		const refusalCrash = await stop_after_mutation({ ...f, work }, "save_message", async () => refusalReply, phase);
		const saved = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		if (phase === "before") {
			expect(saved).toEqual(refusalDoc);
			expect(saved.attachments[0].reason).toBeNull();
			expect(saved.attachments[0].nextAttemptAt).toBeGreaterThan(now);
		} else {
			expect(saved.attachments[0].reason).toBe(`${reason}_settlement_only`);
			expect(saved.attachments[0].nextAttemptAt).toBe(now + 60_000);
		}
		expect(saved.attachments[0].request).toEqual(request);
		expect(saved.nextAttemptAt).toBe(saved.attachments[0].nextAttemptAt);
		expect(saved).toMatchObject({ status: "pending", settlementNeeded: true, permissionHeld: false, error: null, attempts: 0,
			filePath: accepted.filePath, fileNodeId: accepted.fileNodeId, emailWritten: true,
			attachments: [{ state: "pending", accepted: true, deliveries: route === "create" ? 0 : 1,
				uploadAttemptedAt: accepted.attachments[0].uploadAttemptedAt, sourceUnavailablePendingChecks: 0 }] });
		expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.attachmentsSkippedReason).toBe(phase === "before" ? null : reason);
		expect(calls.slice(beforeRefusal).map(call => call.path)).toEqual([
			"/api/v1/files/service-uploads/finalize", "/token", "/gmail/v1/users/me/messages/ab",
			`/api/v1/files/service-uploads/${route === "create" ? "create-target" : "remint"}`,
		]);
		const early = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(saved);
		expect(calls.slice(early).map(call => call.path)).toEqual(["/token", "/gmail/v1/users/me/history"]);
		await resume(refusalCrash);
		if (phase === "before") {
			// Stop before slice completion can also save the repeated refusal's note.
			refusalReply = false;
			const beforeRepeat = calls.length;
			const repeatCrash = await stop_after_mutation({ ...f, work }, "save_message", async () => refusalReply);
			const repeated = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
			expect(repeated.attachments[0].reason).toBe(`${reason}_settlement_only`);
			expect(repeated.attachments[0].request).toEqual(request);
			expect(repeated.attachments[0].nextAttemptAt).toBe(now + 60_000);
			expect(repeated.nextAttemptAt).toBe(repeated.attachments[0].nextAttemptAt);
			expect(repeated.attachments[0]).toMatchObject({ state: "pending", accepted: true, deliveries: route === "create" ? 0 : 1,
				sourceUnavailablePendingChecks: 0, uploadAttemptedAt: accepted.attachments[0].uploadAttemptedAt });
			expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.attachmentsSkippedReason).toBe(reason);
			expect(calls.slice(beforeRepeat).filter(call => /messages\/ab|service-uploads|\/object$/.test(call.path)).map(call => call.path)).toEqual([
				"/api/v1/files/service-uploads/finalize", "/gmail/v1/users/me/messages/ab",
				`/api/v1/files/service-uploads/${route === "create" ? "create-target" : "remint"}`,
			]);
			await resume(repeatCrash);
		}
		countChecks = true;
		for (let check = 1; check <= 5; check++) {
			const before = calls.length;
			const crash = await stop_after_mutation({ ...f, work }, "save_message", async () => checks === check);
			expect(calls.slice(before).filter(call => /messages\/ab|files\/write|service-uploads|\/object$/.test(call.path)).map(call => call.path))
				.toEqual(["/api/v1/files/service-uploads/finalize"]);
			const waiting = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
			expect(waiting.attachments[0].sourceUnavailablePendingChecks).toBe(check);
			expect(waiting.attachments[0].reason).toBe(`${reason}_settlement_only`);
			expect(waiting.attachments[0].request).toEqual(request);
			expect(waiting.attachments[0].nextAttemptAt).toBe(check === 5 ? null : now + 60_000);
			expect(waiting.nextAttemptAt).toBe(waiting.attachments[0].nextAttemptAt);
			expect(waiting.attachments[0].state).toBe(check === 5 ? "unconfirmed" : "pending");
			expect(waiting.status).toBe(check === 5 ? "given_up" : "pending");
			expect(waiting).toMatchObject({ settlementNeeded: check !== 5, permissionHeld: false, attempts: 0,
				filePath: accepted.filePath, fileNodeId: accepted.fileNodeId, emailWritten: true,
				attachments: [{ accepted: true, deliveries: route === "create" ? 0 : 1,
					uploadAttemptedAt: accepted.attachments[0].uploadAttemptedAt }] });
			await resume(crash);
		}
		countChecks = false;
		const exhausted = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		const beforeIdle = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls.slice(beforeIdle).map(call => call.path)).toEqual(["/token", "/gmail/v1/users/me/history"]);
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(exhausted);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.ledgerCounts).toMatchObject({ pending: 0, given_up: 1 });
		expect(await f.t.mutation(internal.gmail_accounts.retry_failed, { ...f.actor, accountId: f.accountId, expectedGeneration: work.generation }))
			.toEqual({ _yay: { count: 1, more: false } });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toMatchObject({ status: "pending", settlementNeeded: true,
			attachments: [{ state: "pending", request, accepted: true, deliveries: 0, sourceUnavailablePendingChecks: 0 }] });
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const retry = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		expect(retry.syncWorkId).not.toBeNull();
		expect(retry.syncRequestId).not.toBe(work.requestId);
		work = { ...work, requestId: retry.syncRequestId! };
		workId = retry.syncWorkId! as typeof f.workId;
		complete = true;
		const beforeRetry = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls.slice(beforeRetry).filter(call => /messages\/ab|files\/write|service-uploads|\/object$/.test(call.path)).map(call => call.path))
			.toEqual(["/api/v1/files/service-uploads/finalize"]);
		const settled = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		expect(settled).toMatchObject({ status: "done", settlementNeeded: false, nextAttemptAt: null, attempts: 0,
			attachments: [{ state: "saved", request, accepted: true, deliveries: 0, sourceUnavailablePendingChecks: 0, reason: null }] });
		const repeats = phase === "before" ? 1 : 0;
		expect(calls.filter(call => call.path.endsWith("/finalize")).map(call => call.body)).toEqual(Array.from({ length: (route === "create" ? 7 : 8) + repeats }, () => keys));
		expect(calls.filter(call => call.path.endsWith("/messages/ab"))).toHaveLength(2 + repeats);
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(1);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(route === "create" ? 0 : 1);
		const { installationId: _installationId, ...frozen } = request;
		expect(calls.filter(call => call.path.endsWith("/create-target")).map(call => call.body)).toEqual(
			Array.from({ length: route === "create" ? 2 + repeats : 1 }, () => frozen),
		);
		expect(calls.filter(call => call.path.endsWith("/remint")).map(call => call.body)).toEqual(
			Array.from({ length: route === "create" ? 0 : 1 + repeats }, () => keys),
		);
		await resume();
		refused = false;
		discover = true;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		const later = (await f.t.run(ctx => ctx.db.query("messages_ledger")
			.withIndex("by_account_gmailMessageId", q => q.eq("accountId", f.accountId).eq("gmailMessageId", "ef")).unique()))!;
		expect(later.attachments[0].request).toMatchObject({ idempotencyKey: `${f.accountId}:ef`, targetKey: "ef:att-0" });
		expect(later).toMatchObject({ status: "done", emailWritten: true, attachments: [{ state: "saved", accepted: true, deliveries: 1 }] });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(settled);
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(2);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(route === "create" ? 1 : 2);
		expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toMatchObject({ messagesSynced: 2, attachmentsSkippedReason: null,
			ledgerCounts: { done: 2, pending: 0, given_up: 0, permissionHeld: 0 }, syncRequestId: null, syncWorkId: null });
	});
	test.each([
		["plan", "This workspace's plan does not include file uploads"],
		["storage", "This workspace has reached its storage limit"],
	] as const)("an accepted %s refusal stays finalize-only through repeated pending replies", async (reason, message) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		const f = await fixture({ fresh: true });
		let refused = false;
		let complete = false;
		const calls = network((path) => {
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/messages/ef")) return Response.json({ ...source, id: "ef" });
			if (path.endsWith("/history")) return Response.json({ historyId: "10", history: [] });
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/finalize")) return Response.json(complete ? committed : pending);
			if (path.endsWith("/create-target") || path.endsWith("/remint")) {
				return refused ? Response.json({ message }, { status: 403 }) : Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			}
			if (path === "/object") return new Response(null, { status: 200 });
			return Response.json({}, { status: 500 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		const accepted = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		const request = accepted.attachments[0].request!;
		expect(accepted).toMatchObject({ status: "pending", emailWritten: true, attachments: [{ accepted: true, deliveries: 1 }] });
		refused = true;
		now += 180_000;
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.filter((call) => call.path.endsWith("/remint"))).toHaveLength(1);
		for (let check = 1; check <= 2; check++) {
			const before = calls.length;
			now = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!.nextAttemptAt!;
			await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
			const unitCalls = calls.slice(before).filter((call) => /messages\/ab|service-uploads|\/object$/.test(call.path));
			expect(unitCalls.map((call) => call.path)).toEqual(["/api/v1/files/service-uploads/finalize"]);
			expect(unitCalls[0].body).toEqual({ idempotencyKey: request.idempotencyKey, targetKey: request.targetKey });
			expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
				status: "pending", settlementNeeded: true, permissionHeld: false, attempts: 0,
				attachments: [{ request, deliveries: 1, sourceUnavailablePendingChecks: check }],
			});
		}
		expect((await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!.attachments[0].reason).toBe(`${reason}_settlement_only`);
		complete = true;
		now = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!.nextAttemptAt!;
		const before = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.slice(before).filter((call) => /messages\/ab|service-uploads|\/object$/.test(call.path)).map((call) => call.path))
			.toEqual(["/api/v1/files/service-uploads/finalize"]);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done", settlementNeeded: false, permissionHeld: false, attempts: 0,
			attachments: [{ state: "saved", request, deliveries: 1, sourceUnavailablePendingChecks: 2, reason: null, livePath: committed.path }],
		});
		expect(calls.filter((call) => call.path.endsWith("/files/write"))).toHaveLength(1);
		expect(calls.filter((call) => call.path.endsWith("/create-target"))).toHaveLength(1);
		expect(calls.filter((call) => call.path === "/object")).toHaveLength(1);
		refused = false;
		complete = false;
		now += 60_000;
		const next = (await f.t.mutation(internal.gmail_accounts.discover_message, { work: f.work, gmailMessageId: "ef", backfill: false }))!;
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(await f.t.run((ctx) => ctx.db.get(next._id))).toMatchObject({
			emailWritten: true, attachments: [{ accepted: true, deliveries: 1, request: { idempotencyKey: `${f.accountId}:ef`, targetKey: "ef:att-0" } }],
		});
		expect(calls.filter((call) => call.path.endsWith("/create-target"))).toHaveLength(2);
		expect((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.attachmentsSkippedReason).toBeNull();
	});
	test("five definite file conflicts stop at given_up while outages spend no attempts", async () => {
		const f = await fixture({ fresh: true });
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		let outage = true;
		const calls = network((path) => {
			now += 1000;
			return path.endsWith("/messages/ab") ? Response.json(source)
				: Response.json({ message: outage ? "Unavailable" : "A different conflict" }, { status: outage ? 503 : 409 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect((await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!.attempts).toBe(0);
		const delayed = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(delayed.nextSyncAt).toBeGreaterThan(now);
		const before = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls).toHaveLength(before);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toEqual(delayed);
		now = delayed.nextSyncAt!;
		outage = false;
		for (let attempt = 1; attempt <= 5; attempt++) {
			await f.t.run((ctx) => ctx.db.patch(f.accountId, { nextSliceKind: "retry" }));
			await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
			const row = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
			expect(row.attempts).toBe(attempt);
			if (attempt < 5) now = row.nextAttemptAt!;
		}
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "given_up", nextAttemptAt: null, error: "file_conflict" });
		expect(calls.filter((call) => call.path.endsWith("/files/write"))).toHaveLength(6);
	});
	test("a refused month holds only its email while the next month saves", async () => {
		const f = await fixture({ fresh: true });
		await f.t.run((ctx) => ctx.db.patch(f.accountId, { nextSliceKind: "backfill", backfillComplete: false,
			backfillPage: { ids: ["ab", "ac"], nextPageToken: null, index: 0 } }));
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		const calls = network((path, body) => {
			now += 1000;
			if (/\/messages\/(ab|ac)$/.test(path)) return Response.json({ ...source, id: path.split("/").at(-1),
				internalDate: String(path.endsWith("/ab") ? Date.UTC(2026, 9, 5) : Date.UTC(2026, 10, 5)), payload: source.payload.parts[0] });
			const file = body as { path: string };
			return file.path.includes("/2026/10/") ? Response.json({ message: "Forbidden" }, { status: 403 }) : Response.json({ nodeId: "email-node" });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ permissionHeld: true, attempts: 0 });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ messagesSynced: 1, ledgerCounts: { permissionHeld: 1, done: 1 } });
		await f.t.run((ctx) => ctx.db.patch(f.accountId, { nextSliceKind: "backfill", backfillComplete: false,
			backfillPage: { ids: ["ab"], nextPageToken: null, index: 0 } }));
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.filter((call) => call.path.endsWith("/messages/ab"))).toHaveLength(1);
		expect(calls.filter((call) => call.path.endsWith("/files/write"))).toHaveLength(2);
	});
	test("seventeen messages keep separate upload runs within the target cap", async () => {
		const f = await fixture({ fresh: true });
		const ids = ["ab", ...Array.from({ length: 16 }, (_, index) => (index + 256).toString(16))];
		await f.t.run((ctx) => ctx.db.patch(f.accountId, { nextSliceKind: "backfill", backfillComplete: false,
			backfillPage: { ids, nextPageToken: null, index: 0 } }));
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		const runs = new Map<string, Set<string>>();
		network((path, body) => {
			now += 1000;
			if (/\/messages\/[0-9a-f]+$/.test(path)) return Response.json({ ...source, id: path.split("/").at(-1) });
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) {
				const target = body as { idempotencyKey: string; targetKey: string };
				const targets = runs.get(target.idempotencyKey) ?? new Set<string>();
				targets.add(target.targetKey); runs.set(target.idempotencyKey, targets);
				return targets.size > 16 ? Response.json({ message: "Target limit" }, { status: 409 }) : Response.json(committed);
			}
			return Response.json({}, { status: 500 });
		});
		for (let turn = 0; turn < 5; turn++) {
			await f.t.run((ctx) => ctx.db.patch(f.accountId, { nextSliceKind: "backfill" }));
			await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
			if ((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.backfillComplete) break;
		}
		expect(runs.size).toBe(17);
		expect([...runs.values()].every((targets) => targets.size === 1)).toBe(true);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ messagesSynced: 17, backfillComplete: true, ledgerCounts: { done: 17 } });
	});
	test("an exact email collision is assumed and still saves its attachment", async () => {
		const f = await fixture({ fresh: true });
		network((path) =>
			path.endsWith("/messages/ab")
				? Response.json(source)
				: path.endsWith("/files/write")
					? Response.json({ message: "A file already exists at this path" }, { status: 409 })
					: path.endsWith("/create-target")
						? Response.json(committed)
						: Response.json({}, { status: 500 }),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done",
			emailAssumed: true,
			emailWritten: true,
			attachments: [{ state: "saved" }],
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			ledgerCounts: { emailAssumed: 1 },
		});
	});
	test("two accounts keep separate attachment receipts for the same source id", async () => {
		const f = await fixture({ fresh: true });
		const peerWork = await f.t.run(async (ctx) => {
			const { _id: _accountId, _creationTime: _accountTime, ...account } = (await ctx.db.get(f.accountId))!;
			const { _id: _grantId, _creationTime: _grantTime, ...grant } = (await ctx.db.get(f.grantId))!;
			const { _id: _ledgerId, _creationTime: _ledgerTime, ...row } = (await ctx.db.get(f.ledgerId))!;
			const peerId = await ctx.db.insert("gmail_accounts", {
				...account,
				emailAddress: "peer@example.com",
				destinationPath: "/emails/peer-example.com",
				hostGrantId: null,
				googleRefreshToken: await gmail_encrypt(
					"refresh",
					gmail_google_token_purpose("org", "workspace", "peer@example.com"),
				),
			});
			const peerGrant = await ctx.db.insert("host_grants", {
				...grant,
				accountId: peerId,
				destinationPath: "/emails/peer-example.com",
				sealedSecret: null,
				interactiveSecret: null,
			});
			await ctx.db.patch(peerGrant, {
				sealedSecret: await gmail_encrypt(`psg_${"3".repeat(64)}`, `grant:${peerGrant}:sealed`),
			});
			await ctx.db.patch(peerId, { hostGrantId: peerGrant });
			await ctx.db.insert("messages_ledger", { ...row, accountId: peerId });
			return { ...f.work, accountId: peerId, grantId: peerGrant };
		});
		const receipts = new Map<string, unknown>();
		const calls = network((path, body) => {
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) {
				const target = body as {
					idempotencyKey: string;
					targetKey: string;
					path: string;
				};
				const key = `${target.idempotencyKey}:${target.targetKey}`;
				if (receipts.has(key)) return Response.json({ message: "A different target already exists" }, { status: 409 });
				receipts.set(key, target);
				return Response.json({ ...committed, path: target.path });
			}
			return Response.json({}, { status: 500 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		await f.t.mutation(internal.gmail_accounts.disconnect, {
			...f.actor,
			accountId: f.accountId,
			expectedGeneration: 1,
		});
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: peerWork,
		});
		expect(receipts.size).toBe(2);
		expect([...receipts.keys()]).toEqual([`${f.accountId}:ab:ab:att-0`, `${peerWork.accountId}:ab:ab:att-0`]);
		expect(calls.filter((call) => call.path.endsWith("/create-target"))).toHaveLength(2);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			syncStatus: "disconnected",
			messagesSynced: 1,
		});
		expect(await f.t.run((ctx) => ctx.db.get(peerWork.accountId))).toMatchObject({
			messagesSynced: 1,
			ledgerCounts: { done: 1 },
		});
	});
	test("future-due replay makes no source or Press calls", async () => {
		const f = await fixture();
		await f.t.run((ctx) => ctx.db.patch(f.ledgerId, { nextAttemptAt: Date.now() + 3600_000 }));
		await f.t.run((ctx) =>
			ctx.db.patch(f.accountId, {
				nextSliceKind: "backfill",
				backfillComplete: false,
				backfillPage: { ids: ["ab"], nextPageToken: null, index: 0 },
			}),
		);
		const calls = network((path) =>
			path.endsWith("/history") ? Response.json({ historyId: "11" }) : Response.json({}, { status: 500 }),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.some((call) => /messages\/ab|files\//.test(call.path))).toBe(false);
	});
	test("a saved email deletion settles the receipt without refetching Gmail", async () => {
		const f = await fixture();
		await f.t.run((ctx) => ctx.db.patch(f.ledgerId, { deletedAt: Date.now() }));
		const calls = network(() => Response.json(committed));
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.map((call) => call.path)).toEqual(["/api/v1/files/service-uploads/finalize"]);
	});
	test("reinstall transfers a held receipt before create and old finalize is never called", async () => {
		const f = await fixture({ held: true });
		await f.t.run(async (ctx) => {
			const row = (await ctx.db.get(f.ledgerId))!;
			await ctx.db.patch(row._id, {
				attachments: row.attachments.map((task) => ({
					...task,
					request: { ...task.request!, installationId: "old-installation" },
				})),
			});
		});
		const calls = network(async (path) => {
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/create-target")) {
				expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
					permissionHeld: true,
					fileAccessOperation: {
						kind: "attachment",
						index: 0,
						operation: "create",
					},
					attachments: [
						{
							suffix: 1,
							request: {
								installationId: "installation",
								path: expect.stringContaining("invoice-2.pdf"),
							},
						},
					],
				});
				return Response.json(committed);
			}
			return Response.json({}, { status: 500 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.some((call) => call.path.endsWith("/finalize"))).toBe(false);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done",
			permissionHeld: false,
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			permissionProbeNotBefore: null,
		});
	});
	test("a held reinstall collision keeps its claim until pending create and PUT finish", async () => {
		const f = await fixture({ held: true });
		await f.t.run(async (ctx) => {
			const row = (await ctx.db.get(f.ledgerId))!;
			await ctx.db.patch(row._id, {
				attachments: row.attachments.map((task) => ({
					...task,
					request: { ...task.request!, installationId: "old-installation" },
				})),
			});
		});
		let creates = 0;
		let deadline = 0;
		const calls = network(async (path, body) => {
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/create-target")) {
				creates++;
				const account = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
				if (creates === 1) deadline = account.permissionProbeNotBefore!;
				expect(deadline).toBeGreaterThan(Date.now());
				expect(account).toMatchObject({ permissionProbeNotBefore: deadline, ledgerCounts: { permissionHeld: 1 } });
				expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
					permissionHeld: true,
					attempts: 0,
					fileAccessOperation: { kind: "attachment", index: 0, operation: "create" },
					attachments: [{ suffix: creates, deliveries: 2, sourceUnavailablePendingChecks: 3,
						request: { installationId: "installation", path: expect.stringContaining(`invoice-${creates + 1}.pdf`) } }],
				});
				expect(body).toMatchObject({ path: expect.stringContaining(`invoice-${creates + 1}.pdf`) });
				return creates === 1
					? Response.json({ message: "A file already exists at this path" }, { status: 409 })
					: Response.json(transport);
			}
			if (path === "/object") {
				expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
					permissionProbeNotBefore: null, ledgerCounts: { permissionHeld: 0 },
				});
				expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
					permissionHeld: false, error: null, attachments: [{ suffix: 2, deliveries: 3 }],
				});
				return new Response(null, { status: 200 });
			}
			return path.endsWith("/finalize") ? Response.json(committed) : Response.json({}, { status: 500 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(creates).toBe(2);
		expect(calls.filter((call) => call.path === "/object")).toHaveLength(1);
		expect(calls.filter((call) => call.path.endsWith("/finalize"))).toHaveLength(1);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done", permissionHeld: false, attachments: [{ suffix: 2, state: "saved", deliveries: 3 }],
		});
	});
	test.each([
		[409, "This item is read-only."],
		[409, "Request fingerprint does not match"],
		[403, "Forbidden"],
	])("reinstall refusal %i %s cannot advance the suffix or release its claim", async (status, message) => {
		const f = await fixture({ held: true });
		await f.t.run(async (ctx) => {
			const row = (await ctx.db.get(f.ledgerId))!;
			await ctx.db.patch(row._id, { attachments: row.attachments.map((task) => ({
				...task, request: { ...task.request!, installationId: "old-installation" },
			})) });
		});
		let deadline = 0;
		const calls = network(async (path) => {
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/create-target")) {
				deadline = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!.permissionProbeNotBefore!;
				return Response.json({ message }, { status });
			}
			return Response.json({}, { status: 500 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.filter((call) => call.path.endsWith("/create-target"))).toHaveLength(1);
		expect(calls.some((call) => /finalize|remint|object/.test(call.path))).toBe(false);
		expect(deadline).toBeGreaterThan(Date.now());
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			permissionProbeNotBefore: deadline, ledgerCounts: { permissionHeld: 1 },
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			permissionHeld: true, attempts: status === 403 ? 0 : 1,
			attachments: [{ suffix: 1, deliveries: 2, sourceUnavailablePendingChecks: 3 }],
		});
	});
	test("one history turn durably ingests more than 25 events and commits once", async () => {
		const f = await fixture();
		await f.t.run((ctx) =>
			ctx.db.patch(f.accountId, {
				nextSliceKind: "history",
				lastSyncedAt: null,
			}),
		);
		const history = Array.from({ length: 70 }, (_, index) => ({
			id: String(index + 11),
			messagesDeleted: [{ message: { id: (index + 100).toString(16) } }],
		}));
		const calls = network((path) =>
			path.endsWith("/history") ? Response.json({ historyId: "100", history }) : Response.json(committed),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.filter((call) => call.path.endsWith("/history"))).toHaveLength(1);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			historyId: "100",
			historyAnchor: null,
			lastSyncedAt: expect.any(Number),
			ledgerCounts: { skipped: 70 },
		});
	});
	test("missing history anchor restarts only history and keeps the committed cursor", async () => {
		const f = await fixture();
		await f.t.run((ctx) =>
			ctx.db.patch(f.accountId, {
				nextSliceKind: "history",
				historyPageToken: "saved-page",
				historyAnchor: { historyId: "11", gmailMessageId: "ef", kind: "added" },
				backfillComplete: false,
				backfillPageToken: "keep-backfill",
				lastSyncedAt: null,
			}),
		);
		network(() =>
			Response.json({
				historyId: "20",
				history: [{ id: "12", messagesAdded: [{ message: { id: "aa" } }] }],
			}),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			historyId: "10",
			historyAnchor: null,
			historyPageToken: null,
			backfillPageToken: "keep-backfill",
			backfillComplete: false,
			lastSyncedAt: null,
		});
	});
	test("expired history takes a fresh baseline and retains the ledger", async () => {
		const f = await fixture();
		await f.t.run((ctx) =>
			ctx.db.patch(f.accountId, {
				nextSliceKind: "history",
				historyPageToken: "expired-page",
			}),
		);
		let histories = 0;
		const calls = network((path) =>
			path.endsWith("/history")
				? (++histories, Response.json({}, { status: 404 }))
				: path.endsWith("/profile")
					? Response.json({ ...profile, historyId: "200" })
					: Response.json({}, { status: 500 }),
		);
		const row = await f.t.run((ctx) => ctx.db.get(f.ledgerId));
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(histories).toBe(2);
		expect(calls.some((call) => call.path.endsWith("/profile"))).toBe(true);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			historyId: "200",
			backfillComplete: false,
			backfillPage: null,
			backfillPageToken: null,
			historyPageToken: null,
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(row);
	});
	test.each(["missing anchor", "page 400", "page 404", "expired cursor"] as const)("a stop after %s recovery keeps the pending upload and traversal", async (kind) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		await f.t.run((ctx) => ctx.db.patch(f.accountId, { nextSliceKind: "backfill", historyId: null,
			backfillComplete: false, backfillPage: null, backfillPageToken: null, lastSyncedAt: null }));
		const deleted = Array.from({ length: 30 }, (_, index) => (index + 512).toString(16));
		const keys = ["ab", "ef", ...deleted, "ff"];
		const historyRequests: { cursor: string | null; token: string | null }[] = [];
		const listTokens: (string | null)[] = [];
		let historyReply: "page" | "anchor" | "fault" | "recovered" = "page";
		let commit = false;
		const calls = network((path, _body, url) => {
			now += 600;
			if (path.endsWith("/profile")) return Response.json({ ...profile, historyId: historyReply === "fault" ? "200" : "10" });
			if (path.endsWith("/messages")) {
				listTokens.push(url.searchParams.get("pageToken"));
				return Response.json({ messages: [{ id: "ab" }], ...(historyReply === "page" ? { nextPageToken: "keep-backfill" } : {}) });
			}
			if (path.endsWith("/history")) {
				const cursor = url.searchParams.get("startHistoryId");
				const token = url.searchParams.get("pageToken");
				historyRequests.push({ cursor, token });
				if (historyReply === "page") return Response.json({ historyId: "11", nextPageToken: "saved-page",
					history: [{ id: "11", messagesDeleted: [{ message: { id: "ef" } }] }] });
				if (historyReply === "anchor") return Response.json({ historyId: "20", nextPageToken: "anchor-next",
					history: [{ id: "12", messagesDeleted: deleted.map(id => ({ message: { id } })) }] });
				if (historyReply === "fault" && (kind === "expired cursor" || (token && kind !== "missing anchor")))
					return Response.json({}, { status: kind === "page 400" ? 400 : 404 });
				return Response.json({ historyId: kind === "expired cursor" ? "201" : "30", history: [
					...(historyReply === "recovered" && kind === "missing anchor" ? [{ id: "12", messagesDeleted: deleted.map(id => ({ message: { id } })) }] : []),
					...(kind === "expired cursor" && cursor === "201" ? [] : [{ id: "13", messagesDeleted: [{ message: { id: "ff" } }] }]),
				] });
			}
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path.endsWith("/finalize")) return Response.json(commit ? committed : pending);
			if (path === "/object") return new Response(null, { status: 200 });
			return Response.json({}, { status: 500 });
		});
		let work = f.work;
		let workId = f.workId;
		// Completion and dispatch own the next request and its saved due time.
		async function resume(crash: Error | null = null) {
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work,
				result: crash ? { kind: "failed", error: crash.message } : { kind: "success", returnValue: null } });
			const delayed = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(delayed.nextSyncAt).toBeGreaterThan(now);
			const before = calls.length;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
			expect(calls).toHaveLength(before);
			now = delayed.nextSyncAt!;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(queued.syncWorkId).not.toBeNull();
			expect(queued.syncRequestId).not.toBe(work.requestId);
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
		}
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		const original = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		const prepared = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(original).toMatchObject({ emailWritten: true, status: "pending", settlementNeeded: true, attempts: 0,
			attachments: [{ state: "pending", accepted: true, deliveries: 1, sourceUnavailablePendingChecks: 0 }] });
		expect(prepared).toMatchObject({ historyId: "10", backfillPageToken: "keep-backfill", backfillComplete: false, lastSyncedAt: null });
		await resume();
		const pageCrash = await stop_after_mutation({ ...f, work }, "save_traversal", async () => true);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ historyId: "10", historyPageToken: "saved-page", lastSyncedAt: null });
		await resume(pageCrash);
		if (kind === "missing anchor") {
			historyReply = "anchor";
			const anchorCrash = await stop_after_mutation({ ...f, work }, "ingest_history", async () => true);
			expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ historyPageToken: "saved-page",
				historyAnchor: { historyId: "12", gmailMessageId: deleted[24], kind: "deleted" }, historyId: "10", lastSyncedAt: null });
			await resume(anchorCrash);
		}
		// Exact message keys include missing docs, so a reset cannot hide lost work.
		const beforeReset = await f.t.run((ctx) => Promise.all(keys.map(id => ctx.db.query("messages_ledger")
			.withIndex("by_account_gmailMessageId", (q) => q.eq("accountId", f.accountId).eq("gmailMessageId", id)).collect())));
		historyReply = "fault";
		const faultStart = historyRequests.length;
		const resetCrash = await stop_after_mutation({ ...f, work }, "save_traversal", async () => true);
		expect(historyRequests.slice(faultStart)).toEqual([
			{ cursor: "10", token: "saved-page" }, ...(kind === "missing anchor" ? [] : [{ cursor: "10", token: null }]),
		]);
		const stopped = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(stopped.historyId).toBe(kind === "expired cursor" ? "200" : "10");
		expect(stopped.historyPageToken).toBeNull();
		expect(stopped.historyAnchor).toBeNull();
		expect(stopped.backfillPageToken).toBe(kind === "expired cursor" ? null : "keep-backfill");
		expect(stopped).toMatchObject({ backfillComplete: false, backfillPage: null, lastSyncedAt: null,
			destinationPath: prepared.destinationPath, googleRefreshToken: prepared.googleRefreshToken, sourceError: null,
			connectionGeneration: work.generation });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(original);
		expect(await f.t.run((ctx) => Promise.all(keys.map(id => ctx.db.query("messages_ledger")
			.withIndex("by_account_gmailMessageId", (q) => q.eq("accountId", f.accountId).eq("gmailMessageId", id)).collect())))).toEqual(beforeReset);
		await resume(resetCrash);
		historyReply = "recovered";
		commit = true;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		if (kind === "expired cursor") {
			// The normal retry/history/backfill turns restart listing at page one.
			for (let turn = 0; turn < 2; turn++) {
				await resume();
				await f.t.action(internal.gmail_worker.work_account_slice, { work });
			}
		}
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		expect(calls.filter(call => call.path.endsWith("/profile"))).toHaveLength(kind === "expired cursor" ? 2 : 1);
		expect(listTokens).toEqual(kind === "expired cursor" ? [null, null] : [null]);
		expect(historyRequests).toEqual([
			{ cursor: "10", token: null }, ...(kind === "missing anchor" ? [{ cursor: "10", token: "saved-page" }] : []),
			{ cursor: "10", token: "saved-page" }, ...(kind === "missing anchor" ? [] : [{ cursor: "10", token: null }]),
			{ cursor: kind === "expired cursor" ? "200" : "10", token: null },
			...(kind === "expired cursor" ? [{ cursor: "201", token: null }] : []),
		]);
		const recovered = await f.t.run((ctx) => Promise.all(keys.map(id => ctx.db.query("messages_ledger")
			.withIndex("by_account_gmailMessageId", (q) => q.eq("accountId", f.accountId).eq("gmailMessageId", id)).collect())));
		expect(recovered.map(docs => docs.length)).toEqual(keys.map(id => deleted.includes(id) && kind !== "missing anchor" ? 0 : 1));
		for (const [index, docs] of recovered.entries()) {
			if (keys[index] === "ab" || !docs.length) continue;
			expect(docs[0]).toMatchObject({ status: "skipped", skipReason: "deleted_before_fetch", deletedAt: expect.any(Number), emailWritten: false });
			if (beforeReset[index].length) {
				expect(docs[0]._id).toBe(beforeReset[index][0]._id);
				expect(docs[0].deletedAt).toBe(beforeReset[index][0].deletedAt);
			}
		}
		expect(recovered[0][0]).toMatchObject({ status: "done", attempts: 0, filePath: original.filePath, fileNodeId: original.fileNodeId,
			attachments: [{ state: "saved", request: original.attachments[0].request, deliveries: 1, sourceUnavailablePendingChecks: 0 }] });
		expect(calls.filter(call => call.path.endsWith("/messages/ab"))).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/create-target"))).toHaveLength(1);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/finalize")).map(call => call.body)).toEqual(Array.from({ length: 2 }, () => ({
			idempotencyKey: original.attachments[0].request!.idempotencyKey, targetKey: original.attachments[0].request!.targetKey,
		})));
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ historyId: kind === "expired cursor" ? "201" : "30",
			historyPageToken: null, historyAnchor: null, backfillComplete: kind === "expired cursor", lastSyncedAt: expect.any(Number),
			syncStatus: kind === "expired cursor" ? "live" : "backfilling", syncError: null, messagesSynced: 1,
			syncWorkId: null, syncRequestId: null, ledgerCounts: { pending: 0, done: 1, skipped: kind === "missing anchor" ? 32 : 2 } });
	});
	test.each(["spam", "trash"] as const)("expired history backfill saves an offline %s rescue", async (skipReason) => {
		const f = await fixture({ fresh: true });
		await f.t.run(async (ctx) => {
			await ctx.db.patch(f.ledgerId, { status: "skipped", skipReason, nextAttemptAt: null });
			await ctx.db.patch(f.accountId, { nextSliceKind: "history", historyPageToken: "expired-page",
				messagesSkipped: 1, ledgerCounts: { pending: 0, done: 0, skipped: 1, failed: 0,
					given_up: 0, emailAssumed: 0, permissionHeld: 0 } });
		});
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		const calls = network((path) => {
			now += 1000;
			if (path.endsWith("/history")) return Response.json({}, { status: 404 });
			if (path.endsWith("/profile")) return Response.json({ ...profile, historyId: "200" });
			if (path.endsWith("/messages")) return Response.json({ messages: [{ id: "ab" }] });
			if (path.endsWith("/messages/ab")) return Response.json({ ...source, payload: source.payload.parts[0] });
			return path.endsWith("/files/write") ? Response.json({ nodeId: "email-node" }) : Response.json({}, { status: 500 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ historyId: "200", backfillComplete: false });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "skipped", skipReason });
		await f.t.run((ctx) => ctx.db.patch(f.accountId, { nextSliceKind: "backfill" }));
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.filter((call) => call.path.endsWith("/history"))).toHaveLength(2);
		expect(calls.filter((call) => call.path.endsWith("/files/write"))).toHaveLength(1);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "done", skipReason: null, emailWritten: true });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			historyId: "200", backfillComplete: true, messagesSynced: 1, messagesSkipped: 0, ledgerCounts: { done: 1, skipped: 0 },
		});
	});
	test("a history rescue moved back to trash is skipped before writing", async () => {
		const f = await fixture({ fresh: true });
		await f.t.run(async (ctx) => {
			await ctx.db.patch(f.ledgerId, { status: "skipped", skipReason: "spam", nextAttemptAt: null });
			await ctx.db.patch(f.accountId, { nextSliceKind: "history", messagesSkipped: 1,
				ledgerCounts: { pending: 0, done: 0, skipped: 1, failed: 0, given_up: 0, emailAssumed: 0, permissionHeld: 0 } });
		});
		const calls = network((path) => path.endsWith("/history")
			? Response.json({ historyId: "11", history: [{ id: "11", labelsRemoved: [{ message: { id: "ab" }, labelIds: ["SPAM"] }] }] })
			: path.endsWith("/messages/ab") ? Response.json({ ...source, labelIds: ["TRASH"] }) : Response.json({}, { status: 500 }));
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.filter((call) => call.path.endsWith("/messages/ab"))).toHaveLength(1);
		expect(calls.some((call) => call.path.includes("/files/"))).toBe(false);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "skipped", skipReason: "trash", emailWritten: false });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ historyId: "11", messagesSynced: 0, messagesSkipped: 1 });
	});
	test("a sent draft keeps the old id deleted and saves only the new SENT id", async () => {
		const f = await fixture({ fresh: true });
		await f.t.run(async (ctx) => {
			await ctx.db.patch(f.ledgerId, { status: "skipped", skipReason: "draft", nextAttemptAt: null });
			await ctx.db.patch(f.accountId, { nextSliceKind: "history", messagesSkipped: 1,
				ledgerCounts: { pending: 0, done: 0, skipped: 1, failed: 0, given_up: 0, emailAssumed: 0, permissionHeld: 0 } });
		});
		const calls = network((path) => path.endsWith("/history")
			? Response.json({ historyId: "11", history: [{ id: "11", messagesDeleted: [{ message: { id: "ab" } }],
				messagesAdded: [{ message: { id: "ac" } }] }] })
			: path.endsWith("/messages/ac") ? Response.json({ ...source, id: "ac", labelIds: ["SENT"], payload: source.payload.parts[0] })
				: path.endsWith("/files/write") ? Response.json({ nodeId: "sent-node" }) : Response.json({}, { status: 500 }));
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.some((call) => call.path.endsWith("/messages/ab"))).toBe(false);
		const writes = calls.filter((call) => call.path.endsWith("/files/write"));
		expect(writes).toHaveLength(1);
		expect(writes[0].body).toMatchObject({ content: expect.stringContaining('direction: "sent"') });
		expect(writes[0].body).toMatchObject({ content: expect.stringContaining('gmail-message-id: "ac"') });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "skipped", skipReason: "deleted_before_fetch", emailWritten: false, deletedAt: expect.any(Number),
		});
		expect(await f.t.run((ctx) => ctx.db.query("messages_ledger").withIndex("by_account_gmailMessageId",
			(q) => q.eq("accountId", f.accountId).eq("gmailMessageId", "ac")).unique())).toMatchObject({
			status: "done", emailWritten: true, fileNodeId: "sent-node",
		});
	});
	test("a stop after the final message save advances backfill without new calls", async () => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		// Pause the queue while replaying the saved backfill page.
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		await f.t.run((ctx) => ctx.db.patch(f.accountId, {
			nextSliceKind: "backfill", backfillComplete: false, backfillPage: { ids: ["ab"], nextPageToken: null, index: 0 },
		}));
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path.endsWith("/finalize")) return Response.json(committed);
			if (path === "/object") return new Response(null, { status: 200 });
			return Response.json({}, { status: 500 });
		});
		const crash = await stop_after_task_save(f, "saved");
		const saved = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(saved).toMatchObject({ status: "done", emailWritten: true, settlementNeeded: false, nextAttemptAt: null, attachments: [{ state: "saved" }] });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			messagesSynced: 1, backfillComplete: false, backfillPage: { ids: ["ab"], index: 0 }, ledgerCounts: { pending: 0, done: 1 },
		});
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "failed", error: crash.message } });
		const stopped = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(stopped.nextSyncAt).toBeGreaterThan(now);
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
		now = stopped.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		expect(queued.syncRequestId).not.toBe(f.work.requestId);
		const work = { ...f.work, requestId: queued.syncRequestId! };
		const before = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls).toHaveLength(before);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(saved);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: work, result: { kind: "success", returnValue: null } });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			messagesSynced: 1, backfillComplete: true, backfillPage: null, backfillPageToken: null,
			syncStatus: "live", syncError: null, syncWorkId: null, syncRequestId: null, ledgerCounts: { pending: 0, done: 1 },
		});
	});
	test("a stop after a content failure advances backfill without new calls", async () => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		await f.t.run((ctx) => ctx.db.patch(f.accountId, {
			nextSliceKind: "backfill", backfillComplete: false, backfillPage: { ids: ["ab"], nextPageToken: null, index: 0 },
		}));
		const message = { ...source, payload: { ...source.payload, parts: [source.payload.parts[0], {
			partId: "1", filename: "invoice.pdf", mimeType: "application/pdf", body: { size: 3, data: "ZmlsZQ" },
		}] } };
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json(message);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			return Response.json({}, { status: 500 });
		});
		const crash = await stop_after_mutation(f, "save_message", async () => {
			const saved = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
			return saved.status === "given_up" && saved.error === "invalid_source";
		});
		const saved = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(saved).toMatchObject({ status: "given_up", error: "invalid_source", attempts: 1,
			emailWritten: true, fileNodeId: "email-node", attachmentsNotSaved: 1, settlementNeeded: false, nextAttemptAt: null,
			attachments: [{ state: "not_saved", reason: "source_unavailable", request: null, nextAttemptAt: null }],
		});
		expect(calls.map(call => call.path)).toEqual(["/token", "/gmail/v1/users/me/messages/ab", "/api/v1/files/write"]);
		// The email was saved before its attachment failed.
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ backfillComplete: false,
			backfillPage: { ids: ["ab"], index: 0 }, messagesSynced: 1, ledgerCounts: { pending: 0, done: 0, given_up: 1 },
		});
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "failed", error: crash.message } });
		const stopped = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(stopped.nextSyncAt).toBeGreaterThan(now);
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
		now = stopped.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		expect(queued.syncRequestId).not.toBe(f.work.requestId);
		const work = { ...f.work, requestId: queued.syncRequestId! };
		const before = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls).toHaveLength(before);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(saved);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: work, result: { kind: "success", returnValue: null } });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ backfillComplete: true,
			backfillPage: null, backfillPageToken: null, messagesSynced: 1, syncStatus: "live", syncError: null,
			syncWorkId: null, syncRequestId: null, ledgerCounts: { pending: 0, done: 0, given_up: 1 },
		});
	});
	test("a stop after a future failure keeps its due time through backfill and history", async () => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		await f.t.run((ctx) => ctx.db.patch(f.accountId, {
			nextSliceKind: "backfill", backfillComplete: false, backfillPage: { ids: ["ab"], nextPageToken: null, index: 0 },
		}));
		let refused = true;
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json({ ...source, payload: { ...source.payload, parts: [source.payload.parts[0]] } });
			if (path.endsWith("/files/write")) return refused
				? Response.json({ message: "A different conflict" }, { status: 409 }) : Response.json({ nodeId: "email-node" });
			if (path.endsWith("/history")) return Response.json({ historyId: "20", history: [{ id: "11", messagesAdded: [{ message: { id: "ab" } }] }] });
			return Response.json({}, { status: 500 });
		});
		let work = f.work;
		let workId = f.workId;
		// Two real failures give a ten-minute message delay and a shorter account backoff.
		for (let attempts = 1; attempts <= 2; attempts++) {
			const crash = await stop_after_mutation({ ...f, work }, "save_message", async () => {
				const saved = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
				return saved.status === "failed" && saved.attempts === attempts;
			});
			expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ backfillPage: { ids: ["ab"], index: 0 } });
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "failed", error: crash.message } });
			const stopped = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(stopped.nextSyncAt).toBeGreaterThan(now);
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
			now = stopped.nextSyncAt!;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(queued.syncWorkId).not.toBeNull();
			expect(queued.syncRequestId).not.toBe(work.requestId);
			work = { ...f.work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
		}
		const saved = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(saved).toMatchObject({ status: "failed", error: "file_conflict", attempts: 2, emailWritten: false, settlementNeeded: false });
		expect(saved.nextAttemptAt).toBeGreaterThan(now);
		const before = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls).toHaveLength(before);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(saved);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		const backfilled = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(backfilled).toMatchObject({ backfillComplete: true, backfillPage: null, nextSliceKind: "history",
			messagesSynced: 0, ledgerCounts: { pending: 0, failed: 1, done: 0 },
		});
		expect(backfilled.nextSyncAt).toBeLessThan(saved.nextAttemptAt!);
		now = backfilled.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const history = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(history.syncWorkId).not.toBeNull();
		expect(history.syncRequestId).not.toBe(work.requestId);
		work = { ...f.work, requestId: history.syncRequestId! };
		workId = history.syncWorkId! as typeof f.workId;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls.slice(before).map(call => call.path)).toEqual(["/token", "/gmail/v1/users/me/history"]);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(saved);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ historyId: "20", nextSliceKind: "retry", ledgerCounts: { failed: 1, done: 0 } });
		now = saved.nextAttemptAt!;
		refused = false;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const due = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(due.syncWorkId).not.toBeNull();
		expect(due.syncRequestId).not.toBe(work.requestId);
		work = { ...f.work, requestId: due.syncRequestId! };
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls.filter(call => call.path.endsWith("/messages/ab"))).toHaveLength(3);
		const writes = calls.filter(call => call.path.endsWith("/files/write"));
		expect(writes).toHaveLength(3);
		for (const write of writes) expect(write.body).toMatchObject({ path: saved.filePath });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "done", emailWritten: true, fileNodeId: "email-node", attempts: 2, nextAttemptAt: null });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: due.syncWorkId! as typeof f.workId, context: work, result: { kind: "success", returnValue: null } });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ messagesSynced: 1, syncStatus: "live", syncError: null,
			syncWorkId: null, syncRequestId: null, ledgerCounts: { pending: 0, failed: 0, done: 1 },
		});
	});
	test("a completed backfill replay makes no source or Files calls", async () => {
		const f = await fixture({ fresh: true });
		await f.t.run(async (ctx) => {
			await ctx.db.patch(f.accountId, {
				nextSliceKind: "backfill",
				backfillComplete: false,
				backfillPage: { ids: ["ab"], nextPageToken: null, index: 0 },
				messagesSkipped: 1,
				ledgerCounts: {
					pending: 0,
					done: 0,
					skipped: 1,
					failed: 0,
					given_up: 0,
					emailAssumed: 0,
					permissionHeld: 0,
				},
			});
			await ctx.db.patch(f.ledgerId, {
				status: "skipped",
				skipReason: "draft",
				nextAttemptAt: null,
			});
		});
		const calls = network(() => Response.json(source));
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.filter((call) => call.path.includes("/files/"))).toHaveLength(0);
		expect(calls).toHaveLength(0);
		expect((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.backfillComplete).toBe(true);
	});
	test("parallel history finishes a backfill longer than the history window", async () => {
		const f = await fixture({ fresh: true });
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		await f.t.run((ctx) =>
			ctx.db.patch(f.accountId, {
				nextSliceKind: "backfill",
				historyId: "10",
				backfillComplete: false,
			}),
		);
		const ids = ["ab", ...Array.from({ length: 119 }, (_, index) => (index + 256).toString(16))];
		let historyId = 10;
		let cursorTime = now;
		let expired = 0;
		const calls = network((path, _body, url) => {
			now += 1000;
			if (path.endsWith("/messages")) {
				const index = Number(url.searchParams.get("pageToken") ?? "0");
				return Response.json({
					messages: ids.slice(index, index + 25).map((id) => ({ id })),
					...(index + 25 < ids.length ? { nextPageToken: String(index + 25) } : {}),
				});
			}
			if (path.endsWith("/history")) {
				expect(url.searchParams.get("startHistoryId")).toBe(String(historyId));
				if (now - cursorTime > 5 * 60_000) {
					expired++;
					return Response.json({}, { status: 404 });
				}
				cursorTime = now;
				historyId++;
				return Response.json({
					historyId: String(historyId),
					history: [
						{
							id: String(historyId),
							messagesDeleted: [{ message: { id: "ab" } }],
						},
					],
				});
			}
			if (/\/messages\/[0-9a-f]+$/.test(path))
				return Response.json({
					...source,
					id: path.split("/").at(-1),
					payload: source.payload.parts[0],
				});
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			return Response.json({}, { status: 500 });
		});
		const started = now;
		for (let turn = 0; turn < 30; turn++) {
			await f.t.action(internal.gmail_worker.work_account_slice, {
				work: f.work,
			});
			const account = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			if (account.backfillComplete) break;
			now += 60_000;
		}
		await f.t.run((ctx) => ctx.db.patch(f.accountId, { nextSliceKind: "history" }));
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(now - started).toBeGreaterThan(5 * 60_000);
		expect(expired).toBe(0);
		expect(calls.filter((call) => call.path.endsWith("/files/write"))).toHaveLength(ids.length);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			backfillComplete: true,
			messagesSynced: ids.length,
		});
		expect((await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!.deletedAt).not.toBeNull();
	});
	test.each(["baseline", "page", "discovery"] as const)("a stop after the %s checkpoint resumes saved backfill", async (step) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		// Pause the queue so completion and dispatch choose each next request.
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		await f.t.run(async (ctx) => {
			await ctx.db.delete(f.ledgerId);
			const account = (await ctx.db.get(f.accountId))!;
			await ctx.db.patch(f.accountId, { nextSliceKind: "backfill", historyId: null, backfillComplete: false,
				backfillPage: null, backfillPageToken: null, lastSyncedAt: null, ledgerCounts: { ...account.ledgerCounts, pending: 0 } });
		});
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/profile")) return Response.json(profile);
			if (path.endsWith("/messages")) return Response.json({ messages: [{ id: "ab" }], nextPageToken: "list-next" });
			if (path.endsWith("/messages/ab")) return Response.json({ ...source,
				payload: { ...source.payload, parts: [source.payload.parts[0]] } });
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			return Response.json({}, { status: 500 });
		});
		const crash = await stop_after_mutation(f, step === "discovery" ? "discover_message" : "save_traversal", async () => {
			const account = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			return step === "baseline" ? account.historyId === "10" && account.backfillPage === null
				: account.backfillPage?.index === 0;
		});
		expect(calls.map(call => call.path)).toEqual([
			"/token", "/gmail/v1/users/me/profile", ...(step === "baseline" ? [] : ["/gmail/v1/users/me/messages"]),
		]);
		// Read this one message key fully so a duplicate doc fails the check.
		const discovered = await f.t.run((ctx) => ctx.db.query("messages_ledger").withIndex("by_account_gmailMessageId",
			(q) => q.eq("accountId", f.accountId).eq("gmailMessageId", "ab")).collect());
		expect(discovered).toHaveLength(step === "discovery" ? 1 : 0);
		if (step === "discovery") expect(discovered[0]).toMatchObject({ status: "pending", emailWritten: false, filePath: null });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ historyId: "10", backfillComplete: false,
			backfillPage: step === "baseline" ? null : { ids: ["ab"], nextPageToken: "list-next", index: 0 },
			lastSyncedAt: null, ledgerCounts: { pending: step === "discovery" ? 1 : 0, done: 0 } });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "failed", error: crash.message } });
		const stopped = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(stopped.nextSyncAt).toBeGreaterThan(now);
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
		now = stopped.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		expect(queued.syncRequestId).not.toBe(f.work.requestId);
		const work = { ...f.work, requestId: queued.syncRequestId! };
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		const messages = await f.t.run((ctx) => ctx.db.query("messages_ledger").withIndex("by_account_gmailMessageId",
			(q) => q.eq("accountId", f.accountId).eq("gmailMessageId", "ab")).collect());
		expect(messages).toHaveLength(1);
		expect(messages[0]).toMatchObject({ status: "done", emailWritten: true, fileNodeId: "email-node" });
		if (step === "discovery") expect(messages[0]._id).toBe(discovered[0]._id);
		expect(calls.filter(call => call.path.endsWith("/profile"))).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/messages"))).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/messages/ab"))).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(1);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: work, result: { kind: "success", returnValue: null } });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ historyId: "10", backfillPage: null,
			backfillPageToken: "list-next", backfillComplete: false, lastSyncedAt: null, messagesSynced: 1,
			syncStatus: "backfilling", syncError: null, syncWorkId: null, syncRequestId: null, ledgerCounts: { pending: 0, done: 1 } });
	});
	test("the first baseline is saved before backfill listing", async () => {
		const f = await fixture();
		await f.t.run((ctx) =>
			ctx.db.patch(f.accountId, {
				nextSliceKind: "backfill",
				historyId: null,
				backfillComplete: false,
				lastSyncedAt: null,
			}),
		);
		const calls = network(async (path) => {
			if (path.endsWith("/profile")) return Response.json(profile);
			if (path.endsWith("/messages")) {
				expect((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.historyId).toBe("10");
				return Response.json({});
			}
			return Response.json({}, { status: 500 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.map((call) => call.path)).toEqual([
			"/token",
			"/gmail/v1/users/me/profile",
			"/gmail/v1/users/me/messages",
		]);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			backfillComplete: true,
			lastSyncedAt: null,
		});
	});
});

describe("permission guards", () => {
	test("an older attachment due time cannot bypass the account permission hour", async () => {
		const f = await fixture({ held: true, sourceError: "google_revoked" });
		const deadline = Date.now() + 3600_000;
		await f.t.run((ctx) => ctx.db.patch(f.accountId, { permissionProbeNotBefore: deadline }));
		expect(
			await f.t.query(internal.gmail_accounts.retry_candidates, {
				work: f.work,
				held: true,
			}),
		).toEqual([]);
		const calls = network(() => Response.json(committed));
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls).toHaveLength(0);
		expect((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.permissionProbeNotBefore).toBe(deadline);
	});
	test("held backfill replay needs a matching permission claim before any effect", async () => {
		const f = await fixture({ held: true });
		await f.t.run((ctx) =>
			ctx.db.patch(f.accountId, {
				nextSliceKind: "backfill",
				backfillComplete: false,
				backfillPage: { ids: ["ab"], nextPageToken: null, index: 0 },
			}),
		);
		const row = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(
			await f.t.query(internal.gmail_accounts.guard_message, {
				work: f.work,
				row,
				claim: null,
			}),
		).toBe(false);
		const calls = network(() => Response.json(committed));
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls).toHaveLength(0);
		expect((await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!.permissionHeld).toBe(true);
	});
	test("a replacement target from another installation cannot transfer the claim", async () => {
		const f = await fixture({ held: true });
		const claimed = (await f.t.mutation(internal.gmail_accounts.claim_permission, {
			work: f.work,
			rowId: f.ledgerId,
		}))!;
		const result = await f.t.mutation(internal.gmail_accounts.save_message, {
			work: f.work,
			before: claimed.row,
			claim: claimed.claim,
			proof: null,
			transfer: true,
			attachmentNote: null,
			after: {
				...claimed.row,
				fileAccessOperation: {
					kind: "attachment",
					index: 0,
					operation: "create",
				},
				attachments: claimed.row.attachments.map((task) => ({
					...task,
					suffix: 1,
					request: {
						...task.request!,
						installationId: "other-installation",
						targetKey: "ab:att-0-1",
						path: "/emails/ray-example.com/invoice-2.pdf",
					},
				})),
			},
		});
		expect(result).toBeNull();
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(claimed.row);
	});
	test("a late old-target result cannot overwrite a saved replacement", async () => {
		const f = await fixture({ held: true });
		const claimed = (await f.t.mutation(internal.gmail_accounts.claim_permission, {
			work: f.work,
			rowId: f.ledgerId,
		}))!;
		const replacement = await f.t.mutation(internal.gmail_accounts.save_message, {
			work: f.work,
			before: claimed.row,
			claim: claimed.claim,
			proof: null,
			transfer: true,
			attachmentNote: null,
			after: {
				...claimed.row,
				fileAccessOperation: {
					kind: "attachment",
					index: 0,
					operation: "create",
				},
				attachments: claimed.row.attachments.map((task) => ({
					...task,
					suffix: 1,
					request: {
						...task.request!,
						targetKey: "ab:att-0-1",
						path: "/emails/ray-example.com/invoice-2.pdf",
					},
				})),
			},
		});
		expect(replacement).not.toBeNull();
		expect(
			await f.t.mutation(internal.gmail_accounts.save_message, {
				work: f.work,
				before: claimed.row,
				after: { ...claimed.row, status: "done", permissionHeld: false },
				claim: claimed.claim,
				proof: 0,
				transfer: false,
				attachmentNote: "storage",
			}),
		).toBeNull();
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(replacement);
		expect((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.permissionProbeNotBefore).toBe(claimed.claim.deadline);
		expect((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.attachmentsSkippedReason).toBeNull();
	});
	test.each([
		["before", "ready"], ["after", "ready"], ["before", "revoked"], ["after", "revoked"],
	] as const)("a stop %s reinstall recovery keeps the claimed receipt with %s source", async (phase, sourceAccess) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		const actor = { ...f.actor, installationId: "new-installation" };
		const interactive = `psg_${"4".repeat(64)}`;
		const sealed = `psg_${"5".repeat(64)}`;
		let reinstalled = false;
		let revoke = false;
		let newTarget = false;
		let replacementPath = "";
		const calls = network(path => {
			now += 600;
			if (path.endsWith("/profile")) return Response.json(profile);
			if (path.endsWith("/messages")) return Response.json({ messages: [{ id: "ab" }] });
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/recover")) return Response.json({}, { status: 404 });
			if (path.endsWith("/exchange") || path.endsWith("/seal-processing"))
				return Response.json({ ...actor, token: path.endsWith("/exchange") ? interactive : sealed,
					expiresAt: now + 6 * 24 * 3600_000, scopes: ["files:write"] });
			if (path.endsWith("/finalize")) {
				if (!reinstalled) return Response.json({ message: "Forbidden" }, { status: 403 });
				return newTarget ? Response.json({ ...committed, path: replacementPath }) : Response.json({}, { status: 404 });
			}
			if (path.endsWith("/create-target")) {
				if (reinstalled) newTarget = true;
				return Response.json({ ...transport, ...(reinstalled ? { path: replacementPath } : {}), uploadUrlExpiresAt: now + 3600_000 });
			}
			return path === "/object" ? new Response(null, { status: 200 }) : Response.json({}, { status: 500 });
		});
		const readyFetch = globalThis.fetch;
		vi.stubGlobal("fetch", vi.fn((input: string | URL | Request, init?: RequestInit) => {
			const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
			if (reinstalled && url.hostname === "oauth2.googleapis.com") {
				now += 600;
				calls.push({ path: url.pathname, body: null });
				if (revoke) return Promise.resolve(Response.json({ error: "invalid_grant" }, { status: 400 }));
				return Promise.resolve(Response.json({ access_token: "access", refresh_token: "refresh", expires_in: 3600,
					scope: "https://www.googleapis.com/auth/gmail.readonly", token_type: "Bearer" }));
			}
			if (reinstalled && url.pathname.endsWith("/verify-live")) {
				now += 600;
				calls.push({ path: url.pathname, body: null });
				const processing = new Headers(init?.headers).get("Authorization") === `Bearer ${sealed}`;
				return Promise.resolve(Response.json({ installationId: actor.installationId, phase: processing ? "processing" : "interactive",
					destinationPathPrefix: processing ? "/emails/ray-example.com" : null, expiresAt: now + 6 * 24 * 3600_000,
					scopes: ["files:write"], contentPermissions: { read: true, write: true } }));
			}
			return readyFetch(input, init);
		}));
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		const held = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		expect(held).toMatchObject({ status: "failed", permissionHeld: true, error: "file_access",
			attachments: [{ accepted: true, deliveries: 1, sourceUnavailablePendingChecks: 0 }] });
		replacementPath = held.attachments[0].initialPath.replace(/\.pdf$/, "-2.pdf");
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "success", returnValue: null } });
		reinstalled = true;
		const started = await f.t.action(ctx => gmail_start(ctx, actor, { clientRequestId: gmail_random_secret(), accountId: f.accountId }, `plu_${"1".repeat(64)}`));
		const callback = await f.t.action(ctx => gmail_callback(ctx, new URL(started.consentUrl!).searchParams.get("state")!, "reinstall-code", false));
		expect(await f.t.action(ctx => gmail_finish(ctx, actor, { attemptId: started.attemptId, finishCode: callback.finishCode! })))
			.toEqual({ accountId: f.accountId, connectionGeneration: 2 });
		const connected = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		await f.t.action(internal.gmail_grants.connect, { grantId: connected.hostGrantId! });
		expect(await f.t.run(ctx => ctx.db.get(connected.hostGrantId!))).toMatchObject({ phase: "ready" });
		expect(await f.t.run(ctx => ctx.db.get(f.grantId))).toMatchObject({ phase: "cancelled", sealedSecret: null });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(held);
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		let queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		let work = { ...f.work, generation: 2, grantId: connected.hostGrantId!, requestId: queued.syncRequestId! };
		let workId = queued.syncWorkId! as typeof f.workId;
		const early = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls.slice(early).some(call => /messages\/ab|files\/|object/.test(call.path))).toBe(false);
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(held);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		if (sourceAccess === "revoked") {
			revoke = true;
			now = (await f.t.run(ctx => ctx.db.get(f.accountId)))!.nextSyncAt!;
			expect(now).toBeLessThan(held.nextAttemptAt!);
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
			const failedSource = calls.length;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(calls.slice(failedSource).map(call => call.path)).toEqual(["/token"]);
			expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toMatchObject({ sourceError: "google_revoked", googleRefreshToken: null });
			expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(held);
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		}
		now = held.nextAttemptAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		work = { ...work, requestId: queued.syncRequestId! };
		workId = queued.syncWorkId! as typeof f.workId;
		const before = calls.length;
		let saveArgs: unknown;
		const crash = await stop_after_mutation({ ...f, work }, "save_message", async args => {
			if (sourceAccess === "ready" && (!args || typeof args !== "object" || !("transfer" in args) || args.transfer !== true)) return false;
			saveArgs = args;
			return true;
		}, phase);
		expect(calls.slice(before).filter(call => /files\/|object/.test(call.path))).toHaveLength(0);
		const stopped = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		const account = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		// Transfer or an unconfirmed receipt does not prove write access.
		expect(account.permissionProbeNotBefore ?? 0).toBeGreaterThan(now);
		if (sourceAccess === "revoked") {
			expect(calls.slice(before)).toHaveLength(0);
			expect(saveArgs).toMatchObject({ proof: null, transfer: false, after: { attachments: [{ request: held.attachments[0].request }] } });
			if (phase === "before") expect(stopped).toEqual({ ...held, nextAttemptAt: account.permissionProbeNotBefore });
			else {
				expect(stopped.status).toBe("given_up");
				expect(stopped.error).toBe("settlement_unconfirmed");
				expect(stopped.nextAttemptAt).toBeNull();
				expect(stopped.settlementNeeded).toBe(false);
				expect(stopped).toMatchObject({ permissionHeld: false, fileAccessOperation: null,
					emailWritten: true, filePath: held.filePath, attempts: 0 });
				expect(stopped.attachments[0]).toEqual({ ...held.attachments[0], state: "unconfirmed", reason: "source_unavailable", nextAttemptAt: null });
			}
			expect(account).toMatchObject({ sourceError: "google_revoked", googleRefreshToken: null,
				ledgerCounts: { failed: phase === "before" ? 1 : 0, given_up: phase === "after" ? 1 : 0, permissionHeld: phase === "before" ? 1 : 0 } });
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(calls.slice(before)).toHaveLength(0);
			expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(stopped);
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "failed", error: crash.message } });
			expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(stopped);
			if (phase === "before") {
				const completed = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
				now = Math.max(completed.nextSyncAt!, stopped.nextAttemptAt!, completed.permissionProbeNotBefore!);
				await f.t.mutation(internal.gmail_accounts.dispatch, {});
				queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
				expect(queued.syncRequestId).not.toBe(work.requestId);
				work = { ...work, requestId: queued.syncRequestId! };
				workId = queued.syncWorkId! as typeof f.workId;
				await f.t.action(internal.gmail_worker.work_account_slice, { work });
				await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
			}
			const final = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
			expect(final).toMatchObject({ status: "given_up", error: "settlement_unconfirmed", nextAttemptAt: null, settlementNeeded: false,
				permissionHeld: false, fileAccessOperation: null, emailWritten: true, filePath: held.filePath, attempts: 0 });
			expect(final.attachments[0]).toEqual({ ...held.attachments[0], state: "unconfirmed", reason: "source_unavailable", nextAttemptAt: null });
			const completed = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			expect(completed).toMatchObject({ sourceError: "google_revoked", googleRefreshToken: null, nextSyncAt: null,
				ledgerCounts: { pending: 0, failed: 0, given_up: 1, permissionHeld: 0 } });
			expect(completed.permissionProbeNotBefore ?? 0).toBeGreaterThan(now);
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "success", returnValue: null } });
			expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toEqual(completed);
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(calls.slice(before)).toHaveLength(0);
			expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(final);
			expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(1);
			expect(calls.filter(call => call.path.endsWith("/create-target"))).toHaveLength(1);
			expect(calls.filter(call => call.path === "/object")).toHaveLength(1);
			expect(await f.t.mutation(internal.gmail_accounts.retry_failed, { ...actor, accountId: f.accountId, expectedGeneration: 2 }))
				.toEqual({ _yay: { count: 1, more: false } });
			expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toMatchObject({ status: "pending", settlementNeeded: true,
				attachments: [{ request: held.attachments[0].request, deliveries: 0, sourceUnavailablePendingChecks: 0 }] });
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
			expect(calls.slice(before)).toHaveLength(0);
			expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toMatchObject({ status: "given_up", error: "settlement_unconfirmed",
				settlementNeeded: false, nextAttemptAt: null, attachments: [{ state: "unconfirmed", request: held.attachments[0].request,
					deliveries: 0, sourceUnavailablePendingChecks: 0 }] });
			expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toMatchObject({ sourceError: "google_revoked", nextSyncAt: null,
				ledgerCounts: { pending: 0, failed: 0, given_up: 1, permissionHeld: 0 } });
			return;
		}
		expect(account.ledgerCounts.permissionHeld).toBe(1);
		expect(saveArgs).toMatchObject({ after: { attachments: [{ request: { installationId: actor.installationId } }] } });
		expect(saveArgs).toMatchObject({ after: { attachments: [{ suffix: 1 }] } });
		expect(stopped).toMatchObject({ status: "failed", permissionHeld: true, error: "file_access", settlementNeeded: true,
			filePath: held.filePath, emailWritten: true, attempts: 0, nextAttemptAt: account.permissionProbeNotBefore });
		if (phase === "before") expect(stopped).toEqual({ ...held, nextAttemptAt: account.permissionProbeNotBefore });
		else {
			expect(stopped.attachments[0].request!.installationId).toBe(actor.installationId);
			expect(stopped.attachments[0].suffix).toBe(1);
			expect(stopped.attachments[0].uploadAttemptedAt).toBeNull();
			expect(stopped.attachments[0]).toMatchObject({ state: "uncertain", accepted: false, deliveries: 1,
				sourceUnavailablePendingChecks: 0, nodeId: null, livePath: null,
				request: { ...held.attachments[0].request!, installationId: actor.installationId, path: replacementPath } });
			expect(stopped.fileAccessOperation).toEqual({ kind: "attachment", index: 0, operation: "create" });
		}
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls.slice(before).filter(call => /files\/|object/.test(call.path))).toHaveLength(0);
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(stopped);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "failed", error: crash.message } });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(stopped);
		const completed = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		now = Math.max(completed.nextSyncAt!, stopped.nextAttemptAt!, completed.permissionProbeNotBefore!);
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		expect(queued.syncRequestId).not.toBe(work.requestId);
		work = { ...work, requestId: queued.syncRequestId! };
		workId = queued.syncWorkId! as typeof f.workId;
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "success", returnValue: null } });
		expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toEqual(queued);
		const resumed = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		const saved = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		expect(saved).toMatchObject({ status: "done", permissionHeld: false, error: null, filePath: held.filePath,
			attachments: [{ suffix: 1, state: "saved", deliveries: 2, sourceUnavailablePendingChecks: 0,
				request: { ...held.attachments[0].request!, installationId: actor.installationId, path: replacementPath } }] });
		const request = saved.attachments[0].request!;
		const { installationId: _installationId, ...fields } = request;
		expect(calls.slice(resumed).filter(call => call.path.endsWith("/create-target")).map(call => call.body)).toEqual([fields]);
		expect(calls.slice(resumed).filter(call => call.path.endsWith("/finalize")).map(call => call.body)).toEqual(
			Array.from({ length: phase === "after" ? 2 : 1 }, () => ({ idempotencyKey: request.idempotencyKey, targetKey: request.targetKey })),
		);
		expect(calls.slice(resumed).filter(call => call.path === "/object")).toHaveLength(1);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(2);
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(1);
		expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toMatchObject({
			permissionProbeNotBefore: null, ledgerCounts: { failed: 0, done: 1, permissionHeld: 0 },
		});
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		const count = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls).toHaveLength(count);
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(saved);
	});
	test.each([
		["before", "email"], ["after", "email"], ["before", "settlement"], ["after", "settlement"],
	] as const)("a stop %s the worker's %s permission claim keeps the hold and resumes saved work", async (phase, kind) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		// Pause the queue so completion and dispatch choose each next request.
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		let deny = true;
		let revoke = false;
		let tokenFailures = 0;
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/files/write")) return deny && kind === "email"
				? Response.json({ message: "Forbidden" }, { status: 403 }) : Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path === "/object") return new Response(null, { status: 200 });
			if (path.endsWith("/finalize")) return deny
				? Response.json({ message: "Forbidden" }, { status: 403 }) : Response.json(committed);
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			return Response.json({}, { status: 500 });
		});
		const readyFetch = globalThis.fetch;
		vi.stubGlobal("fetch", vi.fn((input: string | URL | Request, init?: RequestInit) => {
			const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
			if (revoke && url.hostname === "oauth2.googleapis.com") {
				now += 600;
				tokenFailures++;
				calls.push({ path: url.pathname, body: null });
				return Promise.resolve(Response.json({ error: "invalid_grant" }, { status: 400 }));
			}
			return readyFetch(input, init);
		}));
		let work = f.work;
		let workId = f.workId;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		const held = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(held).toMatchObject({ status: "failed", permissionHeld: true, error: "file_access", attempts: 0,
			emailWritten: kind === "settlement", settlementNeeded: kind === "settlement",
			fileAccessOperation: kind === "email" ? { kind: "email_write" } : { kind: "attachment", index: 0, operation: "finalize" } });
		expect(held.nextAttemptAt).toBeGreaterThan(now);
		expect(held.attachments[0]).toMatchObject({ state: kind === "email" ? "unstarted" : "pending", deliveries: kind === "email" ? 0 : 1 });
		expect(calls.filter(call => call.path.endsWith("/verify-live"))).toHaveLength(1);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		if (kind === "settlement") {
			revoke = true;
			now = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!.nextSyncAt!;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(tokenFailures).toBe(1);
			expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ sourceError: "google_revoked", googleRefreshToken: null });
			expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(held);
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		}
		now = held.nextAttemptAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		let queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		expect(queued.syncRequestId).not.toBe(work.requestId);
		work = { ...work, requestId: queued.syncRequestId! };
		workId = queued.syncWorkId! as typeof f.workId;
		const before = calls.length;
		const claimAt = now;
		const deadline = phase === "after" ? claimAt + 3600_000 : null;
		const crash = await stop_after_mutation({ ...f, work }, "claim_permission", async () => true, phase);
		expect(calls).toHaveLength(before);
		const stopped = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.permissionProbeNotBefore).toBe(deadline);
		expect(stopped.nextAttemptAt).toBe(deadline ?? held.nextAttemptAt);
		expect(stopped).toEqual({ ...held, nextAttemptAt: deadline ?? held.nextAttemptAt });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "failed", error: crash.message } });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(stopped);
		const completed = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(completed).toMatchObject({ syncWorkId: null, syncRequestId: null, permissionProbeNotBefore: deadline, temporaryFailures: 1 });
		expect(completed.nextSyncAt).toBeGreaterThan(now);
		if (deadline !== null) {
			now = Math.min(completed.nextSyncAt!, deadline - 1);
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const early = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			const count = calls.length;
			if (early.syncWorkId) {
				const earlyWork = { ...work, requestId: early.syncRequestId! };
				await f.t.action(internal.gmail_worker.work_account_slice, { work: earlyWork });
				await f.t.mutation(internal.gmail_accounts.on_complete, { workId: early.syncWorkId as typeof f.workId, context: earlyWork,
					result: { kind: "success", returnValue: null } });
			}
			expect(calls.slice(count).filter(call => call.path.includes("/messages/") || call.path.startsWith("/api/v1/files/") || call.path === "/object")).toHaveLength(0);
			expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(stopped);
			expect((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.permissionProbeNotBefore).toBe(deadline);
			now = deadline;
		} else now = completed.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		expect(queued.syncRequestId).not.toBe(work.requestId);
		work = { ...work, requestId: queued.syncRequestId! };
		workId = queued.syncWorkId! as typeof f.workId;
		deny = false;
		const count = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		const saved = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(saved).toMatchObject({ status: "done", permissionHeld: false, error: null, fileAccessOperation: null, attempts: 0,
			emailWritten: true, filePath: held.filePath, settlementNeeded: false });
		expect(saved.attachments[0]).toMatchObject({ state: "saved", deliveries: 1, sourceUnavailablePendingChecks: 0 });
		if (kind === "settlement") {
			expect(saved.attachments[0].request).toEqual(held.attachments[0].request);
			expect(calls.slice(count).map(call => call.path)).toEqual(["/api/v1/files/service-uploads/finalize"]);
		}
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(kind === "email" ? 2 : 1);
		expect(calls.filter(call => call.path.endsWith("/create-target"))).toHaveLength(1);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/finalize"))).toHaveLength(kind === "email" ? 1 : 2);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ permissionProbeNotBefore: null, messagesSynced: 1,
			sourceError: kind === "email" ? null : "google_revoked", temporaryFailures: 0, ledgerCounts: { done: 1, pending: 0, failed: 0, permissionHeld: 0 } });
		const finished = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls).toHaveLength(finished);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(saved);
	});
	test.each([
		["before", "email"], ["after", "email"], ["before", "pending create"], ["after", "pending create"],
		["before", "finalize"], ["after", "finalize"], ["before", "source-free finalize"], ["after", "source-free finalize"],
		["before", "pending finalize"], ["after", "pending finalize"],
		["before", "source-free pending finalize"], ["after", "source-free pending finalize"],
	] as const)("a stop %s %s write proof keeps the saved hold and completes once", async (phase, kind) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		const sourceFree = kind.startsWith("source-free");
		const pendingFinalize = kind.includes("pending finalize");
		let deny = true;
		let revoke = false;
		let emailStored = false;
		let emailSaves = 0;
		let targetAccepted = false;
		let uploaded = false;
		let proofReply = false;
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/files/write")) {
				if (deny && kind === "email") return Response.json({ message: "Forbidden" }, { status: 403 });
				if (emailStored) return Response.json({ message: "A file already exists at this path" }, { status: 409 });
				emailStored = true;
				emailSaves++;
				if (!deny && kind === "email") proofReply = true;
				return Response.json({ nodeId: "email-node" });
			}
			if (path.endsWith("/create-target")) {
				if (deny && kind === "pending create") return Response.json({ message: "Forbidden" }, { status: 403 });
				targetAccepted = true;
				if (!deny && kind === "pending create") proofReply = true;
				return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			}
			if (path === "/object") { uploaded = true; return new Response(null, { status: 200 }); }
			if (path.endsWith("/finalize")) {
				if (!targetAccepted) return Response.json({}, { status: 404 });
				if (deny && kind.includes("finalize")) return Response.json({ message: "Forbidden" }, { status: 403 });
				const answer = pendingFinalize && !proofReply ? pending : uploaded ? committed : pending;
				if (!deny && kind.includes("finalize")) proofReply = true;
				return Response.json(answer);
			}
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			return Response.json({}, { status: 500 });
		});
		const readyFetch = globalThis.fetch;
		vi.stubGlobal("fetch", vi.fn((input: string | URL | Request, init?: RequestInit) => {
			const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
			if (revoke && url.hostname === "oauth2.googleapis.com") {
				now += 600;
				calls.push({ path: url.pathname, body: null });
				return Promise.resolve(Response.json({ error: "invalid_grant" }, { status: 400 }));
			}
			return readyFetch(input, init);
		}));
		let work = f.work;
		let workId = f.workId;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		const held = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(held).toMatchObject({ status: "failed", error: "file_access", permissionHeld: true, attempts: 0 });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		if (sourceFree) {
			revoke = true;
			now = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!.nextSyncAt!;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ sourceError: "google_revoked", googleRefreshToken: null });
			expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(held);
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		}
		now = held.nextAttemptAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		let queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		work = { ...work, requestId: queued.syncRequestId! };
		workId = queued.syncWorkId! as typeof f.workId;
		deny = false;
		const crash = await stop_after_mutation({ ...f, work }, "save_message", async () => proofReply, phase);
		const stopped = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		const account = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(stopped.permissionHeld).toBe(phase === "before");
		expect(account.permissionProbeNotBefore === null).toBe(phase === "after");
		expect(account.ledgerCounts.permissionHeld).toBe(phase === "before" ? 1 : 0);
		expect(account.sourceError).toBe(sourceFree ? "google_revoked" : null);
		if (phase === "before") {
			expect(account.permissionProbeNotBefore).toBeGreaterThan(now);
			expect(stopped).toEqual({ ...held, nextAttemptAt: account.permissionProbeNotBefore });
		} else {
			expect(stopped.error).toBeNull();
			expect(stopped.fileAccessOperation).toBeNull();
			if (kind === "email") expect(stopped.nextAttemptAt).toBeLessThanOrEqual(now + 60_000);
			if (kind === "pending create") {
				expect(stopped.status).toBe("pending");
				expect(stopped.settlementNeeded).toBe(true);
				expect(stopped.nextAttemptAt).toBeLessThanOrEqual(now + 60_000);
				expect(account.ledgerCounts).toMatchObject({ pending: 1, failed: 0 });
				expect(stopped.attachments[0]).toMatchObject({ state: "pending", accepted: true, deliveries: 0, uploadAttemptedAt: null });
			}
			if (pendingFinalize) {
				expect(stopped.status).toBe("pending");
				expect(stopped.settlementNeeded).toBe(true);
				expect(stopped.attachments[0].nextAttemptAt).toBe(now + 60_000);
				expect(stopped.nextAttemptAt).toBe(stopped.attachments[0].nextAttemptAt);
				expect(stopped.attachments[0].sourceUnavailablePendingChecks).toBe(sourceFree ? 1 : 0);
				expect(stopped.attachments[0]).toMatchObject({ state: "pending", accepted: true, deliveries: 1,
					uploadAttemptedAt: held.attachments[0].uploadAttemptedAt, request: held.attachments[0].request });
				expect(account.ledgerCounts).toMatchObject({ pending: 1, failed: 0 });
			} else if (kind.includes("finalize")) expect(stopped).toMatchObject({ status: "done", settlementNeeded: false, attachments: [{ state: "saved" }] });
		}
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "failed", error: crash.message } });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(stopped);
		const completed = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(completed).toMatchObject({ syncWorkId: null, syncRequestId: null, permissionProbeNotBefore: account.permissionProbeNotBefore });
		if (completed.nextSyncAt !== null) {
			now = Math.max(completed.nextSyncAt, stopped.nextAttemptAt ?? 0, account.permissionProbeNotBefore ?? 0);
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(queued.syncWorkId).not.toBeNull();
			expect(queued.syncRequestId).not.toBe(work.requestId);
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
			const count = calls.length;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			if (sourceFree) expect(calls.slice(count).map(call => call.path)).toEqual(["/api/v1/files/service-uploads/finalize"]);
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		} else expect(kind === "source-free finalize" && phase === "after").toBe(true);
		const saved = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(saved).toMatchObject({ status: "done", permissionHeld: false, fileAccessOperation: null, attempts: 0,
			emailWritten: true, emailAssumed: phase === "before" && kind === "email", filePath: held.filePath,
			settlementNeeded: false, attachments: [{ state: "saved", deliveries: 1,
				sourceUnavailablePendingChecks: sourceFree && pendingFinalize && phase === "after" ? 1 : 0 }] });
		if (held.attachments[0].request) expect(saved.attachments[0].request).toEqual(held.attachments[0].request);
		expect(emailSaves).toBe(1);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(1);
		const finished = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(finished).toMatchObject({ messagesSynced: 1, ledgerCounts: { done: 1, failed: 0, pending: 0, permissionHeld: 0 },
			sourceError: sourceFree ? "google_revoked" : null });
		if (phase === "before" && kind === "email") expect(finished.permissionProbeNotBefore).toBeGreaterThan(now);
		else expect(finished.permissionProbeNotBefore).toBeNull();
		const count = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls).toHaveLength(count);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(saved);
	});
	test.each([
		["before", "needs Retry"], ["after", "needs Retry"], ["before", "skipped"], ["after", "skipped"],
	] as const)("a stop %s %s proof saves final held work before completion", async (phase, outcome) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		const needsRetry = outcome === "needs Retry";
		let deny = true;
		let revoke = false;
		let exclude = false;
		let commit = false;
		let proofBoundary = false;
		let proofReply = false;
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json(exclude ? { ...source, labelIds: ["SPAM"] } : source);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path === "/object") return new Response(null, { status: 200 });
			if (path.endsWith("/finalize")) {
				if (deny) return Response.json({ message: "Forbidden" }, { status: 403 });
				if (proofBoundary) proofReply = true;
				return Response.json(commit ? committed : pending);
			}
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			return Response.json({}, { status: 500 });
		});
		const readyFetch = globalThis.fetch;
		vi.stubGlobal("fetch", vi.fn((input: string | URL | Request, init?: RequestInit) => {
			const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
			if (revoke && url.hostname === "oauth2.googleapis.com") {
				now += 600;
				calls.push({ path: url.pathname, body: null });
				return Promise.resolve(Response.json({ error: "invalid_grant" }, { status: 400 }));
			}
			return readyFetch(input, init);
		}));
		let work = f.work;
		let workId = f.workId;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		const firstHold = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(firstHold).toMatchObject({ status: "failed", permissionHeld: true, error: "file_access",
			attachments: [{ accepted: true, deliveries: 1, sourceUnavailablePendingChecks: 0 }] });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		if (needsRetry) {
			revoke = true;
			now = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!.nextSyncAt!;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ sourceError: "google_revoked", googleRefreshToken: null });
			expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(firstHold);
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		}
		deny = false;
		exclude = !needsRetry;
		for (let check = 1; check <= (needsRetry ? 4 : 1); check++) {
			const account = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			const row = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
			now = Math.max(account.nextSyncAt!, row.nextAttemptAt!, account.permissionProbeNotBefore ?? 0);
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "pending", permissionHeld: false,
				skipReason: needsRetry ? null : "spam", attachments: [{ deliveries: 1, sourceUnavailablePendingChecks: check }] });
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		}
		// The next permitted reply must release a hold and finish in the same save.
		deny = true;
		const waiting = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		now = Math.max((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.nextSyncAt!, waiting.nextAttemptAt!);
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		let queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		work = { ...work, requestId: queued.syncRequestId! };
		workId = queued.syncWorkId! as typeof f.workId;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		const held = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(held).toMatchObject({ status: "failed", permissionHeld: true, error: "file_access", attempts: 0,
			attachments: [{ deliveries: 1, sourceUnavailablePendingChecks: needsRetry ? 4 : 1,
				request: firstHold.attachments[0].request }] });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		now = held.nextAttemptAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		work = { ...work, requestId: queued.syncRequestId! };
		workId = queued.syncWorkId! as typeof f.workId;
		deny = false;
		commit = !needsRetry;
		proofBoundary = true;
		const proofStart = calls.length;
		const crash = await stop_after_mutation({ ...f, work }, "save_message", async () => proofReply, phase);
		expect(calls.slice(proofStart).filter(call => call.path.endsWith("/finalize"))).toHaveLength(1);
		expect(calls.slice(proofStart).some(call => call.path.endsWith("/messages/ab"))).toBe(false);
		const stopped = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		const account = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(stopped.permissionHeld).toBe(phase === "before");
		expect(account.permissionProbeNotBefore === null).toBe(phase === "after");
		expect(account.ledgerCounts.permissionHeld).toBe(phase === "before" ? 1 : 0);
		expect(account.sourceError).toBe(needsRetry ? "google_revoked" : null);
		if (phase === "before") {
			expect(stopped).toEqual({ ...held, nextAttemptAt: account.permissionProbeNotBefore });
			expect(account.permissionProbeNotBefore).toBeGreaterThan(now);
		} else {
			expect(stopped.status).toBe(needsRetry ? "given_up" : "skipped");
			expect(stopped.error).toBe(needsRetry ? "settlement_unconfirmed" : null);
			expect(stopped.nextAttemptAt).toBeNull();
			expect(stopped.settlementNeeded).toBe(false);
			expect(stopped).toMatchObject({ settlementNeeded: false, fileAccessOperation: null,
				attachments: [{ state: needsRetry ? "unconfirmed" : "saved", accepted: true, deliveries: 1,
					sourceUnavailablePendingChecks: needsRetry ? 5 : 1, nextAttemptAt: null, request: held.attachments[0].request }] });
			expect(account.ledgerCounts).toMatchObject({ failed: 0, pending: 0, given_up: needsRetry ? 1 : 0, skipped: needsRetry ? 0 : 1 });
		}
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "failed", error: crash.message } });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(stopped);
		if (phase === "before") {
			const completed = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			now = Math.max(completed.nextSyncAt!, stopped.nextAttemptAt!, completed.permissionProbeNotBefore!);
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(queued.syncRequestId).not.toBe(work.requestId);
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		}
		const final = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(final).toMatchObject({ status: needsRetry ? "given_up" : "skipped", permissionHeld: false, fileAccessOperation: null,
			error: needsRetry ? "settlement_unconfirmed" : null, settlementNeeded: false, nextAttemptAt: null, attempts: 0,
			filePath: held.filePath, emailWritten: true, attachments: [{ request: held.attachments[0].request }] });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ messagesSynced: 1,
			messagesSkipped: needsRetry ? 0 : 1, permissionProbeNotBefore: null, sourceError: needsRetry ? "google_revoked" : null,
			ledgerCounts: { pending: 0, failed: 0, permissionHeld: 0, given_up: needsRetry ? 1 : 0, skipped: needsRetry ? 0 : 1 } });
		if (needsRetry) expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ nextSyncAt: null });
		const count = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls).toHaveLength(count);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(final);
		expect(await f.t.mutation(internal.gmail_accounts.retry_failed, { ...f.actor, accountId: f.accountId, expectedGeneration: 1 }))
			.toEqual({ _yay: { count: needsRetry ? 1 : 0, more: false } });
		if (needsRetry) {
			expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "pending", settlementNeeded: true,
				attachments: [{ deliveries: 0, sourceUnavailablePendingChecks: 0, request: held.attachments[0].request }] });
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			work = { ...work, requestId: queued.syncRequestId! };
			commit = true;
			const resumed = calls.length;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(calls.slice(resumed).map(call => call.path)).toEqual(["/api/v1/files/service-uploads/finalize"]);
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId,
				context: work, result: { kind: "success", returnValue: null } });
			expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "done", settlementNeeded: false,
				attachments: [{ state: "saved", deliveries: 0, sourceUnavailablePendingChecks: 0, request: held.attachments[0].request }] });
			expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ sourceError: "google_revoked", nextSyncAt: null,
				ledgerCounts: { pending: 0, failed: 0, given_up: 0, done: 1, permissionHeld: 0 } });
		} else expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(final);
		for (const call of calls.filter(call => call.path.endsWith("/finalize")))
			expect(call.body).toEqual({ idempotencyKey: held.attachments[0].request!.idempotencyKey,
				targetKey: held.attachments[0].request!.targetKey });
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/create-target"))).toHaveLength(1);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(1);
	});
	test("a crash after claiming one of nine hundred held rows cannot claim another", async () => {
		const f = await fixture({ held: true, sourceError: "google_revoked" });
		const peer = await f.t.run(async (ctx) => {
			const { _id, _creationTime, ...fields } = (await ctx.db.get(f.ledgerId))!;
			let peerId = f.ledgerId;
			for (let index = 0; index < 899; index++)
				peerId = await ctx.db.insert("messages_ledger", {
					...fields,
					gmailMessageId: (index + 256).toString(16),
				});
			const account = (await ctx.db.get(f.accountId))!;
			await ctx.db.patch(account._id, {
				ledgerCounts: {
					...account.ledgerCounts,
					pending: 900,
					permissionHeld: 900,
				},
			});
			return peerId;
		});
		const claimed = (await f.t.mutation(internal.gmail_accounts.claim_permission, {
			work: f.work,
			rowId: f.ledgerId,
		}))!;
		expect(claimed.claim.deadline).toBeGreaterThan(Date.now());
		expect(
			await f.t.mutation(internal.gmail_accounts.claim_permission, {
				work: f.work,
				rowId: peer,
			}),
		).toBeNull();
		const calls = network(() => Response.json({ message: "Forbidden" }, { status: 403 }));
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls).toHaveLength(0);
		expect((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.permissionProbeNotBefore).toBe(claimed.claim.deadline);
	});
	test("a stale claimed deadline cannot clear a newer claim", async () => {
		const f = await fixture({ held: true });
		const claimed = (await f.t.mutation(internal.gmail_accounts.claim_permission, {
			work: f.work,
			rowId: f.ledgerId,
		}))!;
		await f.t.run((ctx) =>
			ctx.db.patch(f.accountId, {
				permissionProbeNotBefore: claimed.claim.deadline + 3600_000,
			}),
		);
		const result = await f.t.mutation(internal.gmail_accounts.save_message, {
			work: f.work,
			before: claimed.row,
			after: {
				...claimed.row,
				attachments: claimed.row.attachments.map((task) => ({
					...task,
					state: "saved" as const,
					nextAttemptAt: null,
				})),
			},
			claim: claimed.claim,
			proof: 0,
			transfer: false,
			attachmentNote: "storage",
		});
		const savedAccount = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(savedAccount.attachmentsSkippedReason).toBeNull();
		expect(result).toBeNull();
		expect(savedAccount).toMatchObject({
			permissionProbeNotBefore: claimed.claim.deadline + 3600_000,
		});
	});
	test("nine hundred held rows cannot fill the normal indexed settlement lane", async () => {
		const f = await fixture({ sourceError: "google_revoked" });
		await f.t.run(async (ctx) => {
			const row = (await ctx.db.get(f.ledgerId))!;
			const { _id, _creationTime, ...fields } = row;
			for (let i = 0; i < 900; i++)
				await ctx.db.insert("messages_ledger", {
					...fields,
					gmailMessageId: (i + 0xa000).toString(16),
					permissionHeld: true,
					fileAccessOperation: {
						kind: "attachment",
						index: 0,
						operation: "finalize",
					},
					nextAttemptAt: Date.now() - 60_000,
				});
			const account = (await ctx.db.get(f.accountId))!;
			await ctx.db.patch(f.accountId, {
				permissionProbeNotBefore: Date.now() + 3600_000,
				ledgerCounts: {
					...account.ledgerCounts,
					pending: 901,
					permissionHeld: 900,
				},
			});
		});
		const calls = network(() => Response.json(committed));
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.map((call) => call.path)).toEqual(["/api/v1/files/service-uploads/finalize"]);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done",
			permissionHeld: false,
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			ledgerCounts: { permissionHeld: 900, pending: 900, done: 1 },
		});
	});
});

describe("worker budget and completion", () => {
	test.each(["email", "settlement"] as const)("a stop after %s pacing keeps its reservation and resumes without duplicate effects", async (kind) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		// Pause the queue so completion and dispatch choose each next request.
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture(kind === "email" ? { fresh: true } : { sourceError: "google_revoked" });
		const route = kind === "email" ? "/api/v1/files/write" : "/api/v1/files/service-uploads/finalize";
		expect(await f.t.mutation(internal.gmail_accounts.pace_press, { work: f.work, route })).toBe(0);
		const prior = (await f.t.run((ctx) => ctx.db.query("press_route_pacing").withIndex("by_installation_route",
			(q) => q.eq("installationId", f.actor.installationId).eq("route", route)).unique()))!;
		const original = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		let resume = false;
		const calls = network((path) => {
			if (resume) now += 600;
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path === "/object") return new Response(null, { status: 200 });
			if (path.endsWith("/finalize")) return Response.json(committed);
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			return Response.json({}, { status: 500 });
		});
		const crash = await stop_after_mutation(f, "pace_press", async () => true);
		const reserved = (await f.t.run((ctx) => ctx.db.get(prior._id)))!;
		expect(reserved.lastCallAt - prior.lastCallAt).toBe(600);
		expect(calls.filter(call => call.path.startsWith("/api/v1/files/") || call.path === "/object")).toHaveLength(0);
		const stopped = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		if (kind === "email") {
			expect(stopped).toMatchObject({ status: "pending", emailWritten: false, fileNodeId: null, settlementNeeded: false });
			expect(stopped.filePath).not.toBeNull();
			expect(stopped.attachments).toHaveLength(1);
			expect(stopped.attachments[0]).toMatchObject({ state: "unstarted", request: null, deliveries: 0 });
		} else expect(stopped).toEqual(original);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work,
			result: { kind: "failed", error: crash.message } });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(stopped);
		expect(await f.t.run((ctx) => ctx.db.get(prior._id))).toEqual(reserved);
		const completed = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(completed).toMatchObject({ syncWorkId: null, syncRequestId: null, syncError: "sync_error", temporaryFailures: 1 });
		expect(completed.nextSyncAt).toBeGreaterThan(now);
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
		now = completed.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		expect(queued.syncRequestId).not.toBe(f.work.requestId);
		const work = { ...f.work, requestId: queued.syncRequestId! };
		resume = true;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		const saved = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(saved).toMatchObject({ status: "done", emailWritten: true, settlementNeeded: false, attempts: 0 });
		expect(saved.filePath).toBe(stopped.filePath);
		expect(saved.attachments[0]).toMatchObject({ state: "saved", livePath: committed.path, nodeId: committed.nodeId });
		expect(calls.filter(call => call.path.endsWith("/finalize"))).toHaveLength(1);
		if (kind === "email") {
			expect(saved.attachments[0].initialPath).toBe(stopped.attachments[0].initialPath);
			expect(saved.attachments[0].deliveries).toBe(1);
			for (const ending of ["/files/write", "/create-target"]) expect(calls.filter(call => call.path.endsWith(ending))).toHaveLength(1);
			expect(calls.filter(call => call.path === "/object")).toHaveLength(1);
			expect(calls.filter(call => call.path.endsWith("/messages/ab"))).toHaveLength(2);
		} else {
			expect(saved.attachments[0]).toMatchObject({ request: original.attachments[0].request, deliveries: 2, sourceUnavailablePendingChecks: 3 });
			expect(calls.map(call => call.path)).toEqual([route]);
			expect(calls[0].body).toEqual({ idempotencyKey: original.attachments[0].request!.idempotencyKey,
				targetKey: original.attachments[0].request!.targetKey });
		}
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: work,
			result: { kind: "success", returnValue: null } });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null,
			messagesSynced: 1, sourceError: kind === "email" ? null : "google_revoked", temporaryFailures: 0, ledgerCounts: { pending: 0, done: 1 } });
		const count = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls).toHaveLength(count);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(saved);
	});
	test("slow preparation crosses forty seconds and still finishes one PUT", async () => {
		const f = await fixture({ fresh: true });
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		const calls = network((path) => {
			if (path.endsWith("/messages/ab")) {
				now += 45_000;
				return Response.json(source);
			}
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json(transport);
			if (path === "/object") return new Response(null);
			return Response.json(committed);
		});
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.filter((call) => call.path === "/object")).toHaveLength(1);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done",
		});
	});
	test("slow history setup gets a fresh metadata timer for more than twenty-five events", async () => {
		const f = await fixture();
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		await f.t.run((ctx) =>
			ctx.db.patch(f.accountId, {
				nextSliceKind: "history",
				lastSyncedAt: null,
			}),
		);
		const events = Array.from({ length: 70 }, (_, i) => ({
			id: String(i + 11),
			messagesDeleted: [{ message: { id: (i + 100).toString(16) } }],
		}));
		const calls = network((path) => {
			if (path.endsWith("/history")) {
				now += 45_000;
				return Response.json({ historyId: "100", history: events });
			}
			return Response.json({}, { status: 500 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.filter((call) => call.path.endsWith("/history"))).toHaveLength(1);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			historyId: "100",
			ledgerCounts: { skipped: 70 },
			lastSyncedAt: now,
		});
	});
	test.each([
		["credits", "ready", 402, 3600_000], ["rate limit", "ready", 429, 600_000], ["outage", "ready", 503, 60_000],
		["credits", "revoked", 402, 3600_000], ["rate limit", "revoked", 429, 600_000], ["outage", "revoked", 503, 60_000],
	] as const)("a stop after Press %s with %s source keeps its saved wait through failed completion", async (kind, sourceAccess, status, delay) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		// Pause the queue so completion and dispatch choose each next request.
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		let reject = false;
		let rejected = false;
		let complete = false;
		let revoke = false;
		let tokenFailures = 0;
		const calls = network((path) => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json(sourceAccess === "ready" ? source : {
				...source, payload: { ...source.payload, parts: [...source.payload.parts, {
					...source.payload.parts[1], partId: "2", filename: "second.pdf",
				}] },
			});
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			if (path.endsWith("/finalize")) {
				if (reject) {
					rejected = true;
					return Response.json({ message: kind, ...(status === 429 ? { retryAfterMs: delay } : {}) }, { status });
				}
				return Response.json(complete ? committed : pending);
			}
			if (path === "/object") return new Response(null, { status: 200 });
			return Response.json({}, { status: 500 });
		});
		const readyFetch = globalThis.fetch;
		vi.stubGlobal("fetch", vi.fn((input: string | URL | Request, init?: RequestInit) => {
			const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
			if (revoke && url.hostname === "oauth2.googleapis.com") {
				now += 600;
				tokenFailures++;
				calls.push({ path: url.pathname, body: null });
				return Promise.resolve(Response.json({ error: "invalid_grant" }, { status: 400 }));
			}
			return readyFetch(input, init);
		}));
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		const created = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		expect(created).toMatchObject({ status: "pending", emailWritten: true, settlementNeeded: true, attempts: 0 });
		expect(created.attachments.map(task => task.state)).toEqual(sourceAccess === "ready" ? ["pending"] : ["pending", "unstarted"]);
		expect(created.attachments[0]).toMatchObject({ accepted: true, deliveries: 1, sourceUnavailablePendingChecks: 0 });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work,
			result: { kind: "success", returnValue: null } });
		now = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		let queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		expect(queued.syncRequestId).not.toBe(f.work.requestId);
		let work = { ...f.work, requestId: queued.syncRequestId! };
		if (sourceAccess === "revoked") {
			revoke = true;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(tokenFailures).toBe(1);
			expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ sourceError: "google_revoked", googleRefreshToken: null });
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: work,
				result: { kind: "success", returnValue: null } });
			now = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!.nextSyncAt!;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(queued.syncWorkId).not.toBeNull();
			expect(queued.syncRequestId).not.toBe(work.requestId);
			work = { ...work, requestId: queued.syncRequestId! };
		}
		const original = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		reject = true;
		const before = calls.length;
		const crash = await stop_after_mutation({ ...f, work }, "finish_slice", async () => rejected);
		expect(calls.slice(before).map(call => call.path)).toEqual(["/api/v1/files/service-uploads/finalize"]);
		const stopped = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(stopped).toMatchObject({ sourceError: sourceAccess === "ready" ? null : "google_revoked", syncError: status === 402 ? "credits" : "press_temporary",
			syncStatus: "blocked", temporaryFailures: 1 });
		expect(stopped.nextSyncAt! - now).toBeGreaterThanOrEqual(delay);
		expect(stopped.nextSyncAt! - now).toBeLessThanOrEqual(status === 503 ? delay * 1.1 : delay);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(original);
		const early = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls).toHaveLength(early);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toEqual(stopped);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(original);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: work,
			result: { kind: "failed", error: crash.message } });
		const completed = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(completed.nextSyncAt).toBeGreaterThanOrEqual(stopped.nextSyncAt!);
		expect(completed).toMatchObject({ sourceError: stopped.sourceError, googleRefreshToken: stopped.googleRefreshToken,
			syncError: "sync_error", temporaryFailures: 2, syncRequestId: null, syncWorkId: null });
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toEqual(completed);
		expect(calls).toHaveLength(early);
		now = completed.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const due = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(due.syncWorkId).not.toBeNull();
		expect(due.syncRequestId).not.toBe(work.requestId);
		const next = { ...work, requestId: due.syncRequestId! };
		reject = false;
		complete = true;
		await f.t.action(internal.gmail_worker.work_account_slice, { work: next });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: due.syncWorkId! as typeof f.workId, context: next,
			result: { kind: "success", returnValue: null } });
		expect(calls.slice(early).map(call => call.path)).toEqual([
			...(sourceAccess === "ready" ? ["/token", "/gmail/v1/users/me/history"] : []), "/api/v1/files/service-uploads/finalize",
		]);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: sourceAccess === "ready" ? "done" : "pending", settlementNeeded: false,
			filePath: original.filePath, fileNodeId: original.fileNodeId, emailWritten: true, attempts: 0,
			attachments: [{ state: "saved", request: original.attachments[0].request, deliveries: 1, sourceUnavailablePendingChecks: sourceAccess === "ready" ? 0 : 1 },
				...(sourceAccess === "ready" ? [] : [{ state: "unstarted", request: null, nextAttemptAt: null }])] });
		for (const ending of ["/messages/ab", "/files/write", "/create-target"]) expect(calls.filter(call => call.path.endsWith(ending))).toHaveLength(1);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/finalize")).map(call => call.body)).toEqual(Array.from({ length: sourceAccess === "ready" ? 3 : 4 }, () => ({
			idempotencyKey: original.attachments[0].request!.idempotencyKey, targetKey: original.attachments[0].request!.targetKey,
		})));
		expect(tokenFailures).toBe(sourceAccess === "ready" ? 0 : 1);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ messagesSynced: 1, temporaryFailures: 0,
			sourceError: stopped.sourceError, syncError: stopped.sourceError, syncStatus: sourceAccess === "ready" ? "live" : "error",
			syncRequestId: null, syncWorkId: null, nextSyncAt: sourceAccess === "ready" ? expect.any(Number) : null,
			ledgerCounts: { done: sourceAccess === "ready" ? 1 : 0, pending: sourceAccess === "ready" ? 0 : 1 } });
	});
	test("completion clears only its matching work and request markers", async () => {
		const f = await fixture();
		await f.t.mutation(internal.gmail_accounts.on_complete, {
			workId: f.workId,
			context: { ...f.work, requestId: "old" },
			result: { kind: "success", returnValue: null },
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			syncWorkId: f.workId,
			syncRequestId: "worker",
		});
		await f.t.mutation(internal.gmail_accounts.on_complete, {
			workId: f.workId,
			context: f.work,
			result: { kind: "success", returnValue: null },
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			syncWorkId: null,
			syncRequestId: null,
		});
	});
	test("crash exhaustion retains source error and has no due time without settlement", async () => {
		const f = await fixture({ sourceError: "google_revoked" });
		await f.t.run((ctx) => ctx.db.patch(f.ledgerId, { settlementNeeded: false }));
		await f.t.mutation(internal.gmail_accounts.on_complete, {
			workId: f.workId,
			context: f.work,
			result: { kind: "failed", error: "fixture crash" },
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			sourceError: "google_revoked",
			syncError: "sync_error",
			syncWorkId: null,
			syncRequestId: null,
			nextSyncAt: null,
		});
	});
	test("dispatcher allocates one guarded work request and never queues a second slice", async () => {
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture();
		await f.t.run((ctx) => ctx.db.patch(f.accountId, { syncWorkId: null, syncRequestId: null }));
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(queued.syncRequestId).toMatch(/^[a-f0-9]{64}$/);
		expect(queued.syncWorkId).not.toBeNull();
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toEqual(queued);
	});
});

describe("source limits", () => {
	test("oversized source aborts before JSON parse or any Press save", async () => {
		const f = await fixture({ fresh: true });
		let cancelled = false;
		let chunks = 0;
		const calls = network((path) => {
			if (path.endsWith("/messages/ab"))
				return new Response(
					new ReadableStream<Uint8Array>({
						pull(controller) {
							chunks++;
							if (chunks > 50) {
								controller.close();
								return;
							}
							controller.enqueue(new Uint8Array(1024 * 1024));
						},
						cancel() {
							cancelled = true;
						},
					}),
					{ headers: { "Content-Length": "1" } },
				);
			return Response.json({}, { status: 500 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(cancelled).toBe(true);
		expect(chunks).toBeLessThanOrEqual(50);
		expect(calls.some((call) => call.path.startsWith("/api/v1/"))).toBe(false);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "given_up",
			error: "source_too_large",
			settlementNeeded: false,
		});
	});
	test.each(["parts", "declared", "actual", "deadline", "streamed"] as const)("a stop after the %s body-limit marker keeps the email and attachment", async kind => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		const bodies = Array.from({ length: kind === "parts" ? 9 : kind === "deadline" ? 8 : kind === "streamed" ? 1 : 2 }, (_, index) => ({
			partId: `0.${index}`, mimeType: "text/plain", body: { size: kind === "declared" ? 1536 * 1024 : 4, attachmentId: `body-${index}` },
		}));
		const data = kind === "actual" ? Buffer.alloc(1024 * 1024 + 1, 65).toString("base64url") : "bWFpbA";
		const padding = new Uint8Array(1024 * 1024).fill(32);
		let chunks = 0;
		let cancelled = false;
		let emailReply = false;
		const calls = network(path => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json({ ...source, payload: { ...source.payload,
				parts: [...bodies, source.payload.parts[1]] } });
			if (/\/attachments\/body-\d+$/.test(path)) {
				if (kind === "deadline") now += 20_000;
				if (kind !== "streamed") return Response.json({ size: kind === "actual" ? 1024 * 1024 + 1 : 4, data });
				// Valid JSON follows the padding, so the wire guard must cancel it.
				return new Response(new ReadableStream<Uint8Array>({
					pull(controller) {
						chunks++;
						if (chunks <= 49) controller.enqueue(padding);
						else if (chunks === 50) controller.enqueue(new TextEncoder().encode('{"size":4,"data":"bWFpbA"}'));
						else controller.close();
					},
					cancel() { cancelled = true; },
				}), { headers: { "Content-Length": "1" } });
			}
			if (path.endsWith("/files/write")) { emailReply = true; return Response.json({ nodeId: "email-node" }); }
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path.endsWith("/finalize")) return Response.json(committed);
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			if (path === "/object") return new Response(null, { status: 200 });
			return Response.json({}, { status: 500 });
		});
		const crash = await stop_after_mutation(f, "save_message", async () => emailReply);
		const saved = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		expect(cancelled).toBe(kind === "streamed");
		if (kind === "streamed") expect(chunks).toBeLessThanOrEqual(50);
		const bodyCalls = calls.filter(call => /\/attachments\/body-\d+$/.test(call.path)).length;
		expect(bodyCalls).toBe(kind === "parts" || kind === "declared" ? 0 : kind === "actual" ? 2 : kind === "deadline" ? 3 : 1);
		const reason = kind === "parts" ? "part" : kind === "deadline" ? "time" : "size";
		expect(calls.find(call => call.path.endsWith("/files/write"))!.body).toMatchObject({
			content: expect.stringContaining(`Body not copied: it exceeds this plugin's ${reason} limit. Read it in Gmail.`),
		});
		expect(saved).toMatchObject({ emailWritten: true, fileNodeId: "email-node", attempts: 0, error: null,
			attachmentsNotSaved: 0, attachments: [{ state: "unstarted", request: null, deliveries: 0 }] });
		expect(calls.filter(call => /service-uploads|\/object$/.test(call.path))).toEqual([]);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "failed", error: crash.message } });
		now = (await f.t.run(ctx => ctx.db.get(f.accountId)))!.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		const next = { ...f.work, requestId: queued.syncRequestId! };
		const before = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work: next });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: next, result: { kind: "success", returnValue: null } });
		expect(calls.slice(before).filter(call => /\/attachments\/body-\d+$|\/files\/write$/.test(call.path))).toHaveLength(0);
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/messages/ab"))).toHaveLength(2);
		expect(calls.filter(call => call.path.endsWith("/create-target"))).toHaveLength(1);
		expect(calls.filter(call => call.path === "/object").map(call => Array.from(call.body as Uint8Array))).toEqual([[102, 105, 108, 101]]);
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toMatchObject({ status: "done", emailWritten: true, filePath: saved.filePath,
			fileNodeId: saved.fileNodeId, settlementNeeded: false, attempts: 0, error: null, attachments: [{ state: "saved", deliveries: 1 }] });
		expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toMatchObject({ sourceError: null, syncError: null, messagesSynced: 1,
			ledgerCounts: { done: 1, pending: 0, given_up: 0, skipped: 0 } });
	});
	test("a declared attachment above 32 MiB is skipped without fetching its bytes", async () => {
		const f = await fixture({ fresh: true });
		const calls = network((path) =>
			path.endsWith("/messages/ab")
				? Response.json({
						...source,
						payload: {
							...source.payload,
							parts: [
								source.payload.parts[0],
								{
									partId: "1",
									filename: "huge.pdf",
									mimeType: "application/pdf",
									body: { size: 33 * 1024 * 1024, attachmentId: "huge" },
								},
							],
						},
					})
				: Response.json({ nodeId: "email-node" }),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls.some((call) => /attachments\/huge|create-target/.test(call.path))).toBe(false);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done",
			attachments: [{ state: "not_saved", reason: "too_large" }],
		});
	});
	test.each([["empty", 0], ["too_large", 33 * 1024 * 1024]] as const)("a stop after a new %s attachment keeps its final skip", async (reason, size) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		const calls = network(path => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json({ ...source, payload: { ...source.payload,
				parts: [source.payload.parts[0], { ...source.payload.parts[1], body: { size, attachmentId: "bytes" } }] } });
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			return Response.json({}, { status: 500 });
		});
		let saves = 0;
		// The third message save records the skip, after path and email progress.
		const crash = await stop_after_mutation(f, "save_message", async () => ++saves === 3);
		const saved = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		expect(saved.attachments[0].state).toBe("not_saved");
		expect(saved.attachments[0].reason).toBe(reason);
		expect(saved.attachmentsNotSaved).toBe(1);
		expect(saved.status).toBe("done");
		expect(saved.nextAttemptAt).toBeNull();
		expect(saved.settlementNeeded).toBe(false);
		expect(saved).toMatchObject({ emailWritten: true, fileNodeId: "email-node", attempts: 0, error: null,
			attachments: [{ request: null, accepted: false, deliveries: 0, uploadAttemptedAt: null,
				sourceUnavailablePendingChecks: 0, nextAttemptAt: null, size }] });
		expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.ledgerCounts).toMatchObject({ done: 1, pending: 0, given_up: 0 });
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(saved);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: f.workId, context: f.work, result: { kind: "failed", error: crash.message } });
		const completed = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		expect(completed.nextSyncAt).toBeGreaterThan(now);
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toEqual(completed);
		now = completed.nextSyncAt!;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		expect(queued.syncRequestId).not.toBe(f.work.requestId);
		const work = { ...f.work, requestId: queued.syncRequestId! };
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId: queued.syncWorkId! as typeof f.workId, context: work,
			result: { kind: "success", returnValue: null } });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(saved);
		expect(await f.t.mutation(internal.gmail_accounts.retry_failed, { ...f.actor, accountId: f.accountId, expectedGeneration: 1 }))
			.toEqual({ _yay: { count: 0, more: false } });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(saved);
		expect(calls.filter(call => call.path.endsWith("/messages/ab"))).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(1);
		expect(calls.filter(call => /attachments\/bytes|service-uploads|\/object$/.test(call.path))).toHaveLength(0);
	});
	test.each([["new", "streamed"], ["accepted", "streamed"], ["new", "decoded"], ["accepted", "decoded"]] as const)("stops after oversized %s attachment replies at the %s limit keep the saved outcome", async (kind, limit) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		let large = kind === "new";
		let commit = false;
		let oversizedReply = false;
		let pendingReply = false;
		let chunks = 0;
		let cancelled = false;
		const padding = new Uint8Array(1024 * 1024).fill(limit === "streamed" ? 32 : 65);
		const calls = network(path => {
			now += 600;
			if (path.endsWith("/messages/ab")) return Response.json({ ...source, payload: { ...source.payload,
				parts: [source.payload.parts[0], { ...source.payload.parts[1], body: { size: 4, attachmentId: "bytes" } }] } });
			if (path.endsWith("/attachments/bytes")) {
				if (!large) return Response.json({ size: 4, data: "ZmlsZQ" });
				oversizedReply = true;
				// Streamed padding precedes valid JSON.
				// The decoded case carries 33 MiB of bytes in a 44 MiB base64 response.
				return new Response(new ReadableStream<Uint8Array>({
					pull(controller) {
						chunks++;
						if (limit === "decoded") {
							if (chunks === 1) controller.enqueue(new TextEncoder().encode('{"size":4,"data":"'));
							else if (chunks <= 45) controller.enqueue(padding);
							else if (chunks === 46) controller.enqueue(new TextEncoder().encode('"}'));
							else controller.close();
						} else if (chunks <= 49) controller.enqueue(padding);
						else if (chunks === 50) controller.enqueue(new TextEncoder().encode('{"size":4,"data":"ZmlsZQ"}'));
						else controller.close();
					},
					cancel() { cancelled = true; },
				}), { headers: { "Content-Length": "1" } });
			}
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (/create-target|remint$/.test(path)) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path.endsWith("/finalize")) { pendingReply = true; return Response.json(commit ? committed : pending); }
			if (path.endsWith("/history")) return Response.json({ historyId: "11", history: [] });
			if (path === "/object") return new Response(null, { status: 200 });
			return Response.json({}, { status: 500 });
		});
		let work = f.work;
		let workId = f.workId;
		let prepared = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		async function next_work(error?: Error) {
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work,
				result: error ? { kind: "failed", error: error.message } : { kind: "success", returnValue: null } });
			const completed = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			expect(completed.nextSyncAt).toBeGreaterThan(now);
			now = Math.max(completed.nextSyncAt!, large ? 0 : prepared.attachments[0].uploadAttemptedAt! + 180_000);
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			expect(queued.syncWorkId).not.toBeNull();
			expect(queued.syncRequestId).not.toBe(work.requestId);
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
		}
		if (kind === "accepted") {
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			prepared = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
			expect(prepared).toMatchObject({ status: "pending", emailWritten: true,
				attachments: [{ state: "pending", accepted: true, deliveries: 1, sourceUnavailablePendingChecks: 0 }] });
			await next_work();
			large = true;
		}
		const crash = await stop_after_mutation({ ...f, work }, "save_message", async () => oversizedReply);
		const saved = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
		expect(cancelled).toBe(limit === "streamed");
		if (limit === "streamed") expect(chunks).toBeLessThanOrEqual(50);
		else expect(chunks).toBe(47);
		expect(saved.attachments[0].state).toBe(kind === "accepted" ? "pending" : "not_saved");
		expect(saved.attachments[0].reason).toBe(kind === "accepted" ? "too_large_settlement_only" : "too_large");
		expect(saved.attachmentsNotSaved).toBe(kind === "accepted" ? 0 : 1);
		expect(saved.status).toBe(kind === "accepted" ? "pending" : "done");
		expect(saved.attachments[0].nextAttemptAt).toBe(kind === "accepted" ? now + 60_000 : null);
		expect(saved.nextAttemptAt).toBe(saved.attachments[0].nextAttemptAt);
		expect(saved.settlementNeeded).toBe(kind === "accepted");
		expect(saved).toMatchObject({ emailWritten: true, fileNodeId: "email-node", error: null, attempts: 0,
			attachments: [{ accepted: kind === "accepted", deliveries: kind === "accepted" ? 1 : 0, sourceUnavailablePendingChecks: 0 }] });
		if (kind === "accepted") expect(saved.attachments[0].request).toEqual(prepared.attachments[0].request);
		else expect(saved.attachments[0].request).toBeNull();
		expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.sourceError).toBeNull();
		const early = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(saved);
		expect(calls.slice(early).filter(call => /messages\/ab|attachments\/bytes|files\/write|service-uploads|\/object$/.test(call.path))).toHaveLength(0);
		let lastCrash = crash;
		let terminal = saved;
		if (kind === "accepted") {
			for (let check = 1; check <= 5; check++) {
				await next_work(lastCrash);
				pendingReply = false;
				lastCrash = await stop_after_mutation({ ...f, work }, "save_message", async () => pendingReply);
				terminal = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
				expect(terminal.attachments[0].sourceUnavailablePendingChecks).toBe(check);
				expect(terminal.attachments[0].reason).toBe("too_large_settlement_only");
				expect(terminal.attachments[0].request).toEqual(prepared.attachments[0].request);
				expect(terminal.attachments[0].state).toBe(check === 5 ? "unconfirmed" : "pending");
				expect(terminal.status).toBe(check === 5 ? "given_up" : "pending");
				expect(terminal.nextAttemptAt).toBe(check === 5 ? null : now + 60_000);
				expect(terminal.settlementNeeded).toBe(check < 5);
				expect(terminal).toMatchObject({ emailWritten: true, filePath: saved.filePath, fileNodeId: saved.fileNodeId,
					attempts: 0, attachmentsNotSaved: 0, attachments: [{ accepted: true, deliveries: 1,
						uploadAttemptedAt: prepared.attachments[0].uploadAttemptedAt }] });
			}
		}
		await next_work(lastCrash);
		const before = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		expect(calls.slice(before).filter(call => /messages\/ab|attachments\/bytes|files\/write|service-uploads|\/object$/.test(call.path))).toHaveLength(0);
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(terminal);
		expect(await f.t.mutation(internal.gmail_accounts.retry_failed, { ...f.actor, accountId: f.accountId, expectedGeneration: 1 }))
			.toEqual({ _yay: { count: kind === "accepted" ? 1 : 0, more: false } });
		if (kind === "accepted") {
			const retried = (await f.t.run(ctx => ctx.db.get(f.ledgerId)))!;
			expect(retried).toMatchObject({ status: "pending", settlementNeeded: true,
				attachments: [{ request: prepared.attachments[0].request, deliveries: 0, sourceUnavailablePendingChecks: 0, reason: null }] });
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run(ctx => ctx.db.get(f.accountId)))!;
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
			commit = true;
			const retryCalls = calls.length;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(calls.slice(retryCalls).filter(call => /messages\/ab|attachments\/bytes|files\/write|service-uploads|\/object$/.test(call.path))
				.map(call => call.path)).toEqual(["/api/v1/files/service-uploads/finalize"]);
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
			expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toMatchObject({ status: "done", emailWritten: true,
				filePath: saved.filePath, fileNodeId: saved.fileNodeId, settlementNeeded: false, attachmentsNotSaved: 0,
				attachments: [{ state: "saved", request: prepared.attachments[0].request, deliveries: 0, sourceUnavailablePendingChecks: 0 }] });
			const request = prepared.attachments[0].request!;
			expect(calls.filter(call => call.path.endsWith("/finalize")).map(call => call.body)).toEqual(Array.from({ length: 8 }, () => ({
				idempotencyKey: request.idempotencyKey, targetKey: request.targetKey,
			})));
		} else expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(terminal);
		expect(calls.filter(call => call.path.endsWith("/messages/ab"))).toHaveLength(kind === "accepted" ? 2 : 1);
		expect(calls.filter(call => call.path.endsWith("/attachments/bytes"))).toHaveLength(kind === "accepted" ? 2 : 1);
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/create-target"))).toHaveLength(kind === "accepted" ? 1 : 0);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(kind === "accepted" ? 1 : 0);
		expect(calls.filter(call => call.path.endsWith("/remint"))).toHaveLength(0);
		expect((await f.t.run(ctx => ctx.db.get(f.accountId)))!.sourceError).toBeNull();
	});
	test("stops after history size and error saves keep the pending receipt until Retry sync", async () => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		await f.t.run((ctx) => ctx.db.patch(f.accountId, { nextSliceKind: "backfill", historyId: null,
			backfillComplete: false, backfillPage: null, backfillPageToken: null, lastSyncedAt: null }));
		const deleted = Array.from({ length: 30 }, (_, index) => (index + 512).toString(16));
		const keys = ["ab", "ef", ...deleted];
		let reply: "page" | "anchor" | "large" | "settle" | "retry" = "page";
		const historyRequests: { cursor: string | null; token: string | null; size: string | null }[] = [];
		const listTokens: (string | null)[] = [];
		const pulls: number[] = [];
		let cancelled = 0;
		const calls = network((path, _body, url) => {
			now += 600;
			if (path.endsWith("/profile")) return Response.json(profile);
			if (path.endsWith("/messages")) {
				listTokens.push(url.searchParams.get("pageToken"));
				return Response.json({ messages: [{ id: "ab" }], ...(reply === "page" ? { nextPageToken: "keep-backfill" } : {}) });
			}
			if (path.endsWith("/history")) {
				historyRequests.push({ cursor: url.searchParams.get("startHistoryId"), token: url.searchParams.get("pageToken"), size: url.searchParams.get("maxResults") });
				if (reply === "page") return Response.json({ historyId: "11", nextPageToken: "saved-page",
					history: [{ id: "11", messagesDeleted: [{ message: { id: "ef" } }] }] });
				if (reply === "anchor") return Response.json({ historyId: "20", nextPageToken: "anchor-next",
					history: [{ id: "12", messagesDeleted: deleted.map(id => ({ message: { id } })) }] });
				if (reply === "large") {
					const index = pulls.push(0) - 1;
					// Valid JSON follows the padding. The byte limit must stop before parsing it.
					return new Response(new ReadableStream<Uint8Array>({
						pull(controller) {
							if (++pulls[index] <= 17) controller.enqueue(new Uint8Array(1024 * 1024).fill(32));
							else { controller.enqueue(new TextEncoder().encode('{"historyId":"900","history":[]}')); controller.close(); }
						},
						cancel() { cancelled++; },
					}), { headers: { "Content-Length": "1" } });
				}
				return Response.json({ historyId: "200", history: [{ id: "12", messagesDeleted: deleted.map(id => ({ message: { id } })) }] });
			}
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) return Response.json({ ...transport, uploadUrlExpiresAt: now + 3600_000 });
			if (path.endsWith("/finalize")) return Response.json(reply === "settle" ? committed : pending);
			if (path === "/object") return new Response(null, { status: 200 });
			return Response.json({}, { status: 500 });
		});
		let work = f.work;
		let workId = f.workId;
		async function resume(crash: Error | null = null) {
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work,
				result: crash ? { kind: "failed", error: crash.message } : { kind: "success", returnValue: null } });
			const delayed = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(delayed.nextSyncAt).toBeGreaterThan(now);
			const before = calls.length;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
			expect(calls).toHaveLength(before);
			now = delayed.nextSyncAt!;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(queued.syncWorkId).not.toBeNull();
			expect(queued.syncRequestId).not.toBe(work.requestId);
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
		}
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		const original = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		const prepared = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(original).toMatchObject({ status: "pending", emailWritten: true, settlementNeeded: true,
			attachments: [{ state: "pending", deliveries: 1, sourceUnavailablePendingChecks: 0 }] });
		await resume();
		const pageCrash = await stop_after_mutation({ ...f, work }, "save_traversal", async () => true);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ historyPageToken: "saved-page", historyId: "10", lastSyncedAt: null });
		await resume(pageCrash);
		reply = "anchor";
		const anchorCrash = await stop_after_mutation({ ...f, work }, "ingest_history", async () => true);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ historyPageToken: "saved-page",
			historyAnchor: { historyId: "12", gmailMessageId: deleted[24], kind: "deleted" } });
		await resume(anchorCrash);
		// Read each exact key, including missing docs, to catch lost or duplicate work.
		const beforeSize = await f.t.run((ctx) => Promise.all(keys.map(id => ctx.db.query("messages_ledger")
			.withIndex("by_account_gmailMessageId", (q) => q.eq("accountId", f.accountId).eq("gmailMessageId", id)).collect())));
		reply = "large";
		const sizeCrash = await stop_after_mutation({ ...f, work }, "save_traversal", async () => true);
		const reduced = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(reduced.historyPageSize).toBe(1);
		expect(reduced.historyPageToken).toBeNull();
		expect(reduced.historyAnchor).toBeNull();
		expect(reduced).toMatchObject({ historyId: "10", backfillPageToken: "keep-backfill", backfillPage: null,
			backfillComplete: false, lastSyncedAt: null, sourceError: null, googleRefreshToken: prepared.googleRefreshToken });
		expect(await f.t.run((ctx) => Promise.all(keys.map(id => ctx.db.query("messages_ledger")
			.withIndex("by_account_gmailMessageId", (q) => q.eq("accountId", f.accountId).eq("gmailMessageId", id)).collect())))).toEqual(beforeSize);
		expect(cancelled).toBe(1);
		await resume(sizeCrash);
		const errorCrash = await stop_after_mutation({ ...f, work }, "finish_slice", async () => true);
		const stopped = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(stopped.sourceError).toBe("history_response_too_large");
		expect(stopped).toMatchObject({ syncError: "history_response_too_large", syncStatus: "error", historyId: "10",
			historyPageSize: 1, historyPageToken: null, historyAnchor: null, lastSyncedAt: null,
			backfillPageToken: "keep-backfill", googleRefreshToken: prepared.googleRefreshToken, connectionGeneration: work.generation });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(original);
		expect(cancelled).toBe(2);
		expect(pulls).toHaveLength(2);
		for (const count of pulls) expect(count).toBeLessThanOrEqual(18);
		expect(historyRequests.slice(-2)).toEqual([
			{ cursor: "10", token: "saved-page", size: "25" }, { cursor: "10", token: null, size: "1" },
		]);
		await resume(errorCrash);
		reply = "settle";
		const beforeSettlement = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		expect(calls.slice(beforeSettlement).map(call => call.path)).toEqual(["/api/v1/files/service-uploads/finalize"]);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		const settled = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(settled).toMatchObject({ sourceError: "history_response_too_large", syncStatus: "error", historyId: "10",
			historyPageSize: 1, lastSyncedAt: null, nextSyncAt: null, syncWorkId: null, syncRequestId: null, ledgerCounts: { done: 1, pending: 0 } });
		const noWork = calls.length;
		now += 3600_000;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toEqual(settled);
		expect(calls).toHaveLength(noWork);
		expect(await f.t.mutation(internal.gmail_accounts.retry_sync, { ...f.actor, accountId: f.accountId, expectedGeneration: work.generation })).toEqual({ _yay: null });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ sourceError: null, historyId: "10",
			historyPageSize: 1, historyPageToken: null, backfillPageToken: "keep-backfill", lastSyncedAt: null });
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(queued.syncWorkId).not.toBeNull();
		work = { ...work, requestId: queued.syncRequestId! };
		workId = queued.syncWorkId! as typeof f.workId;
		reply = "retry";
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		await resume();
		await f.t.action(internal.gmail_worker.work_account_slice, { work });
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		expect(historyRequests.at(-1)).toEqual({ cursor: "10", token: null, size: "1" });
		expect(listTokens).toEqual([null, "keep-backfill"]);
		const recovered = await f.t.run((ctx) => Promise.all(keys.map(id => ctx.db.query("messages_ledger")
			.withIndex("by_account_gmailMessageId", (q) => q.eq("accountId", f.accountId).eq("gmailMessageId", id)).collect())));
		expect(recovered.map(docs => docs.length)).toEqual(keys.map(() => 1));
		for (const [index, docs] of recovered.entries()) {
			if (index === 0 || !beforeSize[index].length) continue;
			expect(docs[0]._id).toBe(beforeSize[index][0]._id);
			expect(docs[0].deletedAt).toBe(beforeSize[index][0].deletedAt);
		}
		expect(recovered[0][0]).toMatchObject({ status: "done", filePath: original.filePath, fileNodeId: original.fileNodeId,
			attachments: [{ state: "saved", request: original.attachments[0].request, deliveries: 1, sourceUnavailablePendingChecks: 0 }] });
		for (const ending of ["/profile", "/messages/ab", "/files/write", "/create-target"]) expect(calls.filter(call => call.path.endsWith(ending))).toHaveLength(1);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(1);
		expect(calls.filter(call => call.path.endsWith("/finalize")).map(call => call.body)).toEqual(Array.from({ length: 2 }, () => ({
			idempotencyKey: original.attachments[0].request!.idempotencyKey, targetKey: original.attachments[0].request!.targetKey,
		})));
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ historyId: "200", historyPageSize: 1,
			historyPageToken: null, historyAnchor: null, backfillComplete: true, lastSyncedAt: expect.any(Number), sourceError: null,
			syncStatus: "live", syncError: null, messagesSynced: 1, ledgerCounts: { done: 1, pending: 0, skipped: 31 } });
	});
	test("oversized history reduces to one record then stops without moving its cursor", async () => {
		const f = await fixture();
		await f.t.run((ctx) =>
			ctx.db.patch(f.accountId, {
				nextSliceKind: "history",
				historyPageToken: "page",
				lastSyncedAt: null,
			}),
		);
		network(
			() =>
				new Response(
					new ReadableStream<Uint8Array>({
						pull(controller) {
							controller.enqueue(new Uint8Array(1024 * 1024));
						},
					}),
				),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			historyId: "10",
			historyPageSize: 1,
			historyPageToken: null,
			sourceError: null,
			lastSyncedAt: null,
		});
		await f.t.run((ctx) => ctx.db.patch(f.accountId, { nextSliceKind: "history" }));
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			historyId: "10",
			sourceError: "history_response_too_large",
			lastSyncedAt: null,
		});
	});
});

describe("ingest_history", () => {
	test.each(["batch", "page", "cursor"] as const)("a stop after the history %s save keeps queued mail and deletions", async (step) => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
		const f = await fixture({ fresh: true });
		await f.t.run(async (ctx) => {
			await ctx.db.delete(f.ledgerId);
			const account = (await ctx.db.get(f.accountId))!;
			await ctx.db.patch(f.accountId, { nextSliceKind: "history", lastSyncedAt: null,
				ledgerCounts: { ...account.ledgerCounts, pending: 0 } });
		});
		// The add/delete pair ends the first 25-event batch.
		const added = Array.from({ length: 18 }, (_, index) => (index + 256).toString(16));
		const deleted = Array.from({ length: 15 }, (_, index) => (index + 512).toString(16));
		const keys = [...added, ...deleted, "300", "301", "500", "600", "400"];
		const historyRequests: { cursor: string | null; token: string | null }[] = [];
		const calls = network((path, _body, url) => {
			now += 600;
			if (path.endsWith("/history")) {
				const cursor = url.searchParams.get("startHistoryId");
				const token = url.searchParams.get("pageToken");
				historyRequests.push({ cursor, token });
				return Response.json(cursor === "200" ? { historyId: "200", history: [] }
					: token === "next-page" ? { historyId: "200", history: [{ id: "20",
						messagesAdded: [{ message: { id: "500" } }], messagesDeleted: [{ message: { id: "600" } }],
						labelsRemoved: [{ message: { id: "300" }, labelIds: ["SPAM"] }],
					}] } : { historyId: "100", nextPageToken: "next-page", history: [
						{ id: "11", messagesAdded: added.map(id => ({ message: { id } })) },
						{ id: "12", messagesAdded: [{ message: { id: "205" } }], messagesDeleted: deleted.map(id => ({ message: { id } })) },
						{ id: "13", labelsRemoved: [{ message: { id: "300" }, labelIds: ["SPAM", "TRASH"] },
							{ message: { id: "301" }, labelIds: ["TRASH"] }, { message: { id: "400" }, labelIds: ["UNREAD"] }] },
					] });
			}
			if (/\/messages\/[0-9a-f]+$/.test(path)) return Response.json({ ...source, id: path.split("/").at(-1),
				payload: { ...source.payload, parts: [source.payload.parts[0]] } });
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			return Response.json({}, { status: 500 });
		});
		let work = f.work;
		let workId = f.workId;
		if (step === "cursor") {
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ historyId: "10", historyPageToken: "next-page", lastSyncedAt: null });
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
			now = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!.nextSyncAt!;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(queued.syncWorkId).not.toBeNull();
			expect(queued.syncRequestId).not.toBe(work.requestId);
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
		}
		const crash = await stop_after_mutation({ ...f, work }, step === "batch" ? "ingest_history" : "save_traversal", async () => true);
		const stopped = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		// Read each exact message key fully so a duplicate doc fails the check.
		const saved = await f.t.run((ctx) => Promise.all(keys.map(id => ctx.db.query("messages_ledger")
			.withIndex("by_account_gmailMessageId", (q) => q.eq("accountId", f.accountId).eq("gmailMessageId", id)).collect())));
		expect(saved.flat()).toHaveLength(step === "batch" ? 24 : step === "page" ? 35 : 37);
		expect(stopped.historyId).toBe(step === "cursor" ? "200" : "10");
		expect(stopped.lastSyncedAt).toBe(step === "cursor" ? now : null);
		expect(stopped.historyPageToken).toBe(step === "page" ? "next-page" : null);
		expect(stopped.historyAnchor).toEqual(step === "batch" ? { historyId: "12", gmailMessageId: "205", kind: "deleted" } : null);
		expect(stopped.backfillComplete).toBe(true);
		expect(stopped.ledgerCounts).toMatchObject({ pending: step === "batch" ? 18 : step === "page" ? 20 : 1,
			done: step === "cursor" ? 20 : 0, skipped: step === "batch" ? 6 : step === "page" ? 15 : 16 });
		if (step !== "cursor") expect(calls.some(call => call.path.startsWith("/api/v1/"))).toBe(false);
		await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "failed", error: crash.message } });
		const delayed = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
		expect(delayed.nextSyncAt).toBeGreaterThan(now);
		const before = calls.length;
		await f.t.mutation(internal.gmail_accounts.dispatch, {});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
		expect(calls).toHaveLength(before);
		for (let turn = 0; turn < (step === "batch" ? 2 : 1); turn++) {
			now = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!.nextSyncAt!;
			await f.t.mutation(internal.gmail_accounts.dispatch, {});
			const queued = (await f.t.run((ctx) => ctx.db.get(f.accountId)))!;
			expect(queued.syncWorkId).not.toBeNull();
			expect(queued.syncRequestId).not.toBe(work.requestId);
			work = { ...work, requestId: queued.syncRequestId! };
			workId = queued.syncWorkId! as typeof f.workId;
			await f.t.action(internal.gmail_worker.work_account_slice, { work });
			await f.t.mutation(internal.gmail_accounts.on_complete, { workId, context: work, result: { kind: "success", returnValue: null } });
		}
		expect(historyRequests).toEqual([
			{ cursor: "10", token: null }, ...(step === "batch" ? [{ cursor: "10", token: null }] : []),
			{ cursor: "10", token: "next-page" },
		]);
		const recovered = await f.t.run((ctx) => Promise.all(keys.map(id => ctx.db.query("messages_ledger")
			.withIndex("by_account_gmailMessageId", (q) => q.eq("accountId", f.accountId).eq("gmailMessageId", id)).collect())));
		expect(recovered.map(docs => docs.length)).toEqual(keys.map(id => id === "400" ? 0 : 1));
		for (const [index, docs] of recovered.entries()) {
			if (keys[index] === "400") continue;
			const doc = docs[0];
			if (deleted.includes(keys[index]) || keys[index] === "600") {
				expect(doc).toMatchObject({ status: "skipped", skipReason: "deleted_before_fetch", deletedAt: expect.any(Number), emailWritten: false, nextAttemptAt: null });
				if (saved[index].length) expect(doc).toEqual(saved[index][0]);
			} else {
				expect(doc).toMatchObject({ status: "done", emailWritten: true, attachments: [], attempts: 0 });
				if (saved[index].length) expect(doc._id).toBe(saved[index][0]._id);
			}
		}
		expect(calls.filter(call => /\/messages\/[0-9a-f]+$/.test(call.path)).map(call => call.path.split("/").at(-1)).sort())
			.toEqual([...added, "300", "301", "500"].sort());
		expect(calls.filter(call => call.path.endsWith("/files/write"))).toHaveLength(21);
		expect(new Set(calls.filter(call => call.path.endsWith("/files/write")).map(call => (call.body as { path: string }).path)).size).toBe(21);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ historyId: "200", historyPageToken: null, historyAnchor: null,
			lastSyncedAt: expect.any(Number), backfillComplete: true, messagesSynced: 21, messagesSkipped: 16, syncStatus: "live", syncError: null,
			syncWorkId: null, syncRequestId: null, ledgerCounts: { pending: 0, done: 21, skipped: 16 } });
		if (step === "cursor") expect((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.lastSyncedAt).toBe(stopped.lastSyncedAt);
	});
	test("keeps held retries and counters while rescuing only the matching skip", async () => {
		const f = await fixture({ held: true });
		const original = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		const skipped = await f.t.run(async (ctx) => {
			const { _id, _creationTime, ...fields } = original;
			const ids = [];
			for (const [gmailMessageId, skipReason] of [
				["ef", "spam"],
				["fe", "trash"],
			] as const)
				ids.push(
					await ctx.db.insert("messages_ledger", {
						...fields,
						gmailMessageId,
						skipReason,
						status: "skipped",
						emailWritten: false,
						filePath: null,
						fileNodeId: null,
						attachments: [],
						settlementNeeded: false,
						permissionHeld: false,
						fileAccessOperation: null,
						error: null,
						nextAttemptAt: null,
					}),
				);
			const account = (await ctx.db.get(f.accountId))!;
			await ctx.db.patch(f.accountId, {
				messagesSkipped: 2,
				ledgerCounts: { ...account.ledgerCounts, skipped: 2 },
			});
			return ids;
		});
		const current = (await f.t.query(internal.gmail_accounts.get_worker, {
			work: f.work,
		}))!.account;
		const before = {
			historyId: current.historyId,
			historyPageToken: current.historyPageToken,
			historyAnchor: current.historyAnchor,
			historyPageSize: current.historyPageSize,
			backfillPage: current.backfillPage,
			backfillPageToken: current.backfillPageToken,
			backfillComplete: current.backfillComplete,
		};
		expect(
			await f.t.mutation(internal.gmail_accounts.ingest_history, {
				work: f.work,
				before,
				events: ["ab", "ef", "fe"].map((gmailMessageId) => ({
					historyId: "11",
					gmailMessageId,
					kind: "rescue_spam" as const,
				})),
			}),
		).toBe(true);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(original);
		expect(await f.t.run((ctx) => ctx.db.get(skipped[0]))).toMatchObject({
			status: "pending",
			skipReason: null,
		});
		expect(await f.t.run((ctx) => ctx.db.get(skipped[1]))).toMatchObject({
			status: "skipped",
			skipReason: "trash",
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			messagesSkipped: 1,
			ledgerCounts: { pending: 2, skipped: 1, permissionHeld: 1 },
		});
		expect(
			await f.t.mutation(internal.gmail_accounts.ingest_history, {
				work: f.work,
				before,
				events: [{ historyId: "12", gmailMessageId: "ef", kind: "added" }],
			}),
		).toBe(false);
	});
	test("an unknown deletion is durable and a saved deletion keeps Files", async () => {
		const f = await fixture();
		const current = (await f.t.query(internal.gmail_accounts.get_worker, {
			work: f.work,
		}))!.account;
		const {
			historyId,
			historyPageToken,
			historyAnchor,
			historyPageSize,
			backfillPage,
			backfillPageToken,
			backfillComplete,
		} = current;
		expect(
			await f.t.mutation(internal.gmail_accounts.ingest_history, {
				work: f.work,
				before: {
					historyId,
					historyPageToken,
					historyAnchor,
					historyPageSize,
					backfillPage,
					backfillPageToken,
					backfillComplete,
				},
				events: [
					{ historyId: "11", gmailMessageId: "ef", kind: "deleted" },
					{ historyId: "12", gmailMessageId: "ab", kind: "deleted" },
				],
			}),
		).toBe(true);
		expect(
			await f.t.run((ctx) =>
				ctx.db
					.query("messages_ledger")
					.withIndex("by_account_gmailMessageId", (q) => q.eq("accountId", f.accountId).eq("gmailMessageId", "ef"))
					.unique(),
			),
		).toMatchObject({
			status: "skipped",
			skipReason: "deleted_before_fetch",
			deletedAt: expect.any(Number),
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			emailWritten: true,
			fileNodeId: "email-node",
			settlementNeeded: true,
			status: "pending",
		});
	});
});
