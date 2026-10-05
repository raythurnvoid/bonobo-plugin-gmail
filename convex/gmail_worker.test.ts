import { afterEach, describe, expect, test, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { internal } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";
import { gmail_test_fixture } from "../scripts/gmail-test-fixtures";
import { gmail_workpool } from "./gmail_workpool";
import { work_account_slice } from "./gmail_worker";
import { gmail_encrypt, gmail_google_token_purpose } from "./gmail_secrets";

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
	mutation: "save_message" | "save_traversal" | "discover_message",
	reached: () => Promise<boolean>,
) {
	// Convex-test calls this internal handler. Stop after its mutation commits.
	const registered = work_account_slice as typeof work_account_slice & {
		_handler: (ctx: ActionCtx, args: { work: typeof f.work }) => Promise<null>;
	};
	const handler = registered._handler;
	const crash = new Error("Worker stopped after saved checkpoint");
	let stopped = false;
	const interrupted = vi.spyOn(registered, "_handler").mockImplementation(async (ctx, args) => {
		const runMutation: ActionCtx["runMutation"] = async (reference, ...values) => {
			if (stopped) throw crash;
			const result = await ctx.runMutation(reference, ...values);
			if (getFunctionName(reference) === `gmail_accounts:${mutation}` && await reached()) {
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
	test("reinstall without source keeps the old receipt unconfirmed", async () => {
		const f = await fixture({ held: true, sourceError: "google_revoked" });
		await f.t.run(async (ctx) => {
			const row = (await ctx.db.get(f.ledgerId))!;
			await ctx.db.patch(row._id, {
				attachments: row.attachments.map((task) => ({
					...task,
					request: { ...task.request!, installationId: "old-installation" },
				})),
			});
		});
		const calls = network(() => Response.json(committed));
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect(calls).toHaveLength(0);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "given_up",
			attachments: [
				{
					state: "unconfirmed",
					request: { installationId: "old-installation" },
				},
			],
		});
		expect((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.permissionProbeNotBefore).toBeGreaterThan(Date.now());
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
			}),
		).toBeNull();
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(replacement);
		expect((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.permissionProbeNotBefore).toBe(claimed.claim.deadline);
	});
	test("a restart after saving a reinstall target waits for its claim and resumes that target", async () => {
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		const f = await fixture({ held: true });
		await f.t.run(async ctx => {
			const row = (await ctx.db.get(f.ledgerId))!;
			await ctx.db.patch(row._id, { attachments: row.attachments.map(task => ({
				...task, request: { ...task.request!, installationId: "old-installation" },
			})) });
		});
		const claimed = (await f.t.mutation(internal.gmail_accounts.claim_permission, {
			work: f.work, rowId: f.ledgerId,
		}))!;
		const replacement = (await f.t.mutation(internal.gmail_accounts.save_message, {
			work: f.work, before: claimed.row, claim: claimed.claim, proof: null, transfer: true,
			after: { ...claimed.row, fileAccessOperation: { kind: "attachment", index: 0, operation: "create" },
				attachments: claimed.row.attachments.map(task => ({ ...task, suffix: 1, state: "uncertain" as const,
					accepted: false, uploadAttemptedAt: null, nodeId: null, livePath: null,
					request: { ...task.request!, installationId: "installation", idempotencyKey: `${f.accountId}:ab`,
						path: task.initialPath.replace(/\.pdf$/, "-2.pdf") },
				})) },
		}))!;
		expect(replacement).not.toBeNull();
		const request = replacement.attachments[0].request!;
		let finalizes = 0;
		const calls = network(path => {
			now += 1000;
			if (path.endsWith("/history")) return Response.json({ historyId: "10" });
			if (path.endsWith("/messages/ab")) return Response.json(source);
			if (path.endsWith("/finalize")) {
				return ++finalizes === 1 ? Response.json({}, { status: 404 }) : Response.json({ ...committed, path: request.path });
			}
			if (path.endsWith("/create-target")) {
				return Response.json({ ...transport, path: request.path, uploadUrlExpiresAt: now + 3600_000 });
			}
			return new Response(null, { status: 200 });
		});
		// Stop after the saved replacement, then restart without the old in-memory claim.
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.filter(call => /messages\/ab|files\/|object/.test(call.path))).toHaveLength(0);
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toEqual(replacement);
		expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toMatchObject({
			permissionProbeNotBefore: claimed.claim.deadline, ledgerCounts: { permissionHeld: 1 },
		});
		now = claimed.claim.deadline;
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(finalizes).toBe(2);
		expect(calls.filter(call => call.path.endsWith("/finalize")).map(call => call.body)).toEqual([
			{ idempotencyKey: request.idempotencyKey, targetKey: request.targetKey },
			{ idempotencyKey: request.idempotencyKey, targetKey: request.targetKey },
		]);
		const { installationId: _installationId, ...fields } = request;
		expect(calls.filter(call => call.path.endsWith("/create-target")).map(call => call.body)).toEqual([fields]);
		expect(calls.filter(call => call.path === "/object")).toHaveLength(1);
		expect(await f.t.run(ctx => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done", permissionHeld: false, attempts: 0,
			attachments: [{ suffix: 1, state: "saved", deliveries: 3, sourceUnavailablePendingChecks: 3, request }],
		});
		expect(await f.t.run(ctx => ctx.db.get(f.accountId))).toMatchObject({
			permissionProbeNotBefore: null, ledgerCounts: { pending: 0, done: 1, permissionHeld: 0 },
		});
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
		});
		expect(result).toBeNull();
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
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
	test("a normal 25 MB external attachment is delivered whole below 512 MiB", async () => {
		const f = await fixture({ fresh: true });
		const size = 25_000_000;
		let peak = process.memoryUsage().rss;
		const sample = () => {
			peak = Math.max(peak, process.memoryUsage().rss);
		};
		const calls = network(async (path, body) => {
			sample();
			if (path.endsWith("/messages/ab"))
				return Response.json({
					...source,
					payload: {
						...source.payload,
						parts: [
							source.payload.parts[0],
							{
								partId: "1",
								filename: "large.pdf",
								mimeType: "application/pdf",
								body: { size, attachmentId: "large" },
							},
						],
					},
				});
			if (path.endsWith("/attachments/large")) {
				const response = Response.json({
					size,
					data: Buffer.alloc(size, 37).toString("base64url"),
				});
				sample();
				return response;
			}
			if (path.endsWith("/files/write")) return Response.json({ nodeId: "email-node" });
			if (path.endsWith("/create-target")) {
				expect(body).toMatchObject({ size });
				sample();
				return Response.json(transport);
			}
			if (path === "/object") {
				expect(body).toBeInstanceOf(Uint8Array);
				expect((body as Uint8Array).byteLength).toBe(size);
				expect((body as Uint8Array)[size - 1]).toBe(37);
				sample();
				return new Response(null);
			}
			return Response.json({ ...committed, actualBytes: size });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		sample();
		expect(calls.filter((call) => call.path === "/object")).toHaveLength(1);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done",
			attachments: [{ size, state: "saved" }],
		});
		expect(peak).toBeLessThan(512 * 1024 * 1024);
		process.stdout.write(
			JSON.stringify({
				fixture: "25 MB external attachment",
				sampledPeakRssBytes: peak,
			}) + "\n",
		);
	});
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
	test("a crash before cursor commit retains queued mail and deletion work", async () => {
		const f = await fixture();
		await f.t.run((ctx) => ctx.db.patch(f.accountId, { nextSliceKind: "history" }));
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
		await f.t.mutation(internal.gmail_accounts.ingest_history, {
			work: f.work,
			before,
			events: [
				{ historyId: "11", gmailMessageId: "ef", kind: "added" },
				{ historyId: "12", gmailMessageId: "ab", kind: "deleted" },
			],
		});
		// The process stops here. Its cursor commit has not run.
		expect((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.historyId).toBe("10");
		expect(
			await f.t.run((ctx) =>
				ctx.db
					.query("messages_ledger")
					.withIndex("by_account_gmailMessageId", (q) => q.eq("accountId", f.accountId).eq("gmailMessageId", "ef"))
					.unique(),
			),
		).toMatchObject({ status: "pending" });
		expect((await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!.deletedAt).not.toBeNull();
		network((path) =>
			path.endsWith("/history")
				? Response.json({
						historyId: "13",
						history: [
							{ id: "11", messagesAdded: [{ message: { id: "ef" } }] },
							{ id: "12", messagesDeleted: [{ message: { id: "ab" } }] },
						],
					})
				: Response.json({}, { status: 503 }),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, {
			work: f.work,
		});
		expect((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.historyId).toBe("13");
		expect(await f.t.run((ctx) => ctx.db.query("messages_ledger").collect())).toHaveLength(2);
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
