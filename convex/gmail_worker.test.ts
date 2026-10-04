import { afterEach, describe, expect, test, vi } from "vitest";
import { internal } from "./_generated/api";
import { gmail_test_fixture } from "../scripts/gmail-test-fixtures";
import { gmail_workpool } from "./gmail_workpool";

afterEach(() => {
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
			{ partId: "0", mimeType: "text/plain", body: { size: 4, data: "bWFpbA" } },
			{ partId: "1", filename: "invoice.pdf", mimeType: "application/pdf", body: { size: 4, data: "ZmlsZQ" } },
		],
	},
};

async function fixture(options: { held?: boolean; sourceError?: "google_revoked"; fresh?: boolean } = {}) {
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
			backfillPage: null,
			backfillPageToken: null,
			historyPageToken: null,
			nextSliceKind: "retry",
			ledgerCounts: { ...account.ledgerCounts, failed: 0, pending: 1, permissionHeld: options.held ? 1 : 0 },
		});
		await ctx.db.patch(f.ledgerId, {
			status: "pending",
			nextAttemptAt: Date.now(),
			permissionHeld: options.held ?? false,
			fileAccessOperation: options.held ? row.fileAccessOperation : null,
			error: options.held ? "file_access" : null,
			...(options.fresh
				? { attachments: [], filePath: null, emailWritten: false, fileNodeId: null, settlementNeeded: false }
				: {}),
		});
	});
	return { ...f, workId, work: { accountId: f.accountId, generation: 1, requestId: "worker", grantId: f.grantId } };
}

function network(answer: (path: string, body: unknown) => Response | Promise<Response>) {
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
			return answer(url.pathname, body);
		}),
	);
	return calls;
}

describe("work_account_slice", () => {
	test("settles a committed receipt without Google reads, even after revocation", async () => {
		const f = await fixture({ sourceError: "google_revoked" });
		const calls = network((path) =>
			path.endsWith("/finalize") ? Response.json(committed) : Response.json({}, { status: 500 }),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
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
						{ state: "uncertain", request: { idempotencyKey: `${f.accountId}:ab`, targetKey: "ab:att-0" } },
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
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
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
	test("a pending target with no PUT marker replays create immediately", async () => {
		const f = await fixture();
		await f.t.run(async (ctx) => {
			const row = (await ctx.db.get(f.ledgerId))!;
			await ctx.db.patch(row._id, {
				attachments: row.attachments.map((task) => ({ ...task, uploadAttemptedAt: null, deliveries: 0 })),
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
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.filter((call) => call.path.endsWith("/create-target"))).toHaveLength(1);
		expect(calls.findIndex((call) => call.path.endsWith("/finalize"))).toBeLessThan(
			calls.findIndex((call) => call.path === "/token"),
		);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done",
			attachments: [{ deliveries: 1 }],
		});
	});
	test("pending settlement waits a minute without replaying create after a recent PUT", async () => {
		const f = await fixture();
		await f.t.run(async (ctx) => {
			const row = (await ctx.db.get(f.ledgerId))!;
			await ctx.db.patch(row._id, {
				attachments: row.attachments.map((task) => ({ ...task, uploadAttemptedAt: Date.now() })),
			});
		});
		const calls = network((path) => (path.endsWith("/finalize") ? Response.json(pending) : Response.json(source)));
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
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
				attachments: row.attachments.map((task) => ({ ...task, sourceUnavailablePendingChecks: 4 })),
			});
		});
		const calls = network(() => Response.json(pending));
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls).toHaveLength(1);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "given_up",
			error: "settlement_unconfirmed",
			settlementNeeded: false,
			attachments: [
				{ state: "unconfirmed", accepted: true, request: expect.any(Object), sourceUnavailablePendingChecks: 5 },
			],
		});
	});
	test("a fresh file refusal holds the row without spending failure or delivery attempts", async () => {
		const f = await fixture({ fresh: true });
		const calls = network((path) =>
			path.endsWith("/messages/ab") ? Response.json(source) : Response.json({ message: "Forbidden" }, { status: 403 }),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
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
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
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
				attachments: row.attachments.map((task) => ({ ...task, uploadAttemptedAt: null, deliveries: 0 })),
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
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.some((call) => call.path === "/object")).toBe(true);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			permissionProbeNotBefore: null,
			ledgerCounts: { permissionHeld: 0 },
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "done", permissionHeld: false });
	});
	test("released settlement clears final row attention but does not release the account hour", async () => {
		const f = await fixture({ held: true, sourceError: "google_revoked" });
		network(() => Response.json({ ...pending, state: "released" }));
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "done", permissionHeld: false });
		expect((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.permissionProbeNotBefore).toBeGreaterThan(Date.now());
	});
	test("a late old-chain refusal cannot block a repaired chain", async () => {
		const f = await fixture({ sourceError: "google_revoked" });
		const calls = network(async () => {
			await f.t.run((ctx) => ctx.db.patch(f.accountId, { syncRequestId: "replacement", syncError: null }));
			return Response.json({ message: "Expired" }, { status: 401 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls).toHaveLength(1);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			syncRequestId: "replacement",
			syncError: null,
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.grantId))).toMatchObject({ phase: "ready" });
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
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.filter((call) => call.path.endsWith("/create-target"))).toHaveLength(1);
		expect(calls.some((call) => call.path === "/object")).toBe(false);
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			syncStatus: "disconnected",
			nextSyncAt: null,
		});
	});
	test("a new plan refusal skips the remaining new attachments but saves the email", async () => {
		const f = await fixture({ fresh: true });
		const calls = network((path) =>
			path.endsWith("/messages/ab")
				? Response.json(source)
				: path.endsWith("/files/write")
					? Response.json({ nodeId: "email-node" })
					: Response.json({ message: "This workspace's plan does not include file uploads" }, { status: 403 }),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.some((call) => call.path.endsWith("/verify-live"))).toBe(false);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done",
			emailWritten: true,
			permissionHeld: false,
			attachments: [{ state: "not_saved", reason: "plan" }],
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ attachmentsSkippedReason: "plan" });
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
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
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
				attachments: row.attachments.map((task) => ({ ...task, nextAttemptAt: Date.now() })),
			});
		});
		const before = calls.length;
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.slice(before).map((call) => call.path)).toEqual(["/api/v1/files/service-uploads/finalize"]);
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
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done",
			emailAssumed: true,
			emailWritten: true,
			attachments: [{ state: "saved" }],
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ ledgerCounts: { emailAssumed: 1 } });
	});
	test("future-due replay makes no source or Press calls", async () => {
		const f = await fixture();
		await f.t.run((ctx) => ctx.db.patch(f.ledgerId, { nextAttemptAt: Date.now() + 3600_000 }));
		const calls = network((path) =>
			path.endsWith("/history") ? Response.json({ historyId: "11" }) : Response.json({}, { status: 500 }),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.some((call) => /messages\/ab|files\//.test(call.path))).toBe(false);
	});
	test("a saved email deletion settles the receipt without refetching Gmail", async () => {
		const f = await fixture();
		await f.t.run((ctx) => ctx.db.patch(f.ledgerId, { deletedAt: Date.now() }));
		const calls = network(() => Response.json(committed));
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
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
					fileAccessOperation: { kind: "attachment", index: 0, operation: "create" },
					attachments: [
						{ suffix: 1, request: { installationId: "installation", path: expect.stringContaining("invoice-2.pdf") } },
					],
				});
				return Response.json(committed);
			}
			return Response.json({}, { status: 500 });
		});
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.some((call) => call.path.endsWith("/finalize"))).toBe(false);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "done", permissionHeld: false });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ permissionProbeNotBefore: null });
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
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls).toHaveLength(0);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "given_up",
			attachments: [{ state: "unconfirmed", request: { installationId: "old-installation" } }],
		});
		expect((await f.t.run((ctx) => ctx.db.get(f.accountId)))!.permissionProbeNotBefore).toBeGreaterThan(Date.now());
	});
	test("one history turn durably ingests more than 25 events and commits once", async () => {
		const f = await fixture();
		await f.t.run((ctx) => ctx.db.patch(f.accountId, { nextSliceKind: "history", lastSyncedAt: null }));
		const history = Array.from({ length: 70 }, (_, index) => ({
			id: String(index + 11),
			messagesDeleted: [{ message: { id: (index + 100).toString(16) } }],
		}));
		const calls = network((path) =>
			path.endsWith("/history") ? Response.json({ historyId: "100", history }) : Response.json(committed),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
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
			Response.json({ historyId: "20", history: [{ id: "12", messagesAdded: [{ message: { id: "aa" } }] }] }),
		);
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
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
		await f.t.run((ctx) => ctx.db.patch(f.accountId, { nextSliceKind: "history", historyPageToken: "expired-page" }));
		let histories = 0;
		const calls = network((path) =>
			path.endsWith("/history")
				? (++histories, Response.json({}, { status: 404 }))
				: path.endsWith("/profile")
					? Response.json({ ...profile, historyId: "200" })
					: Response.json({}, { status: 500 }),
		);
		const row = await f.t.run((ctx) => ctx.db.get(f.ledgerId));
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
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
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
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
	test("a stale claimed deadline cannot clear a newer claim", async () => {
		const f = await fixture({ held: true });
		const claimed = (await f.t.mutation(internal.gmail_accounts.claim_permission, {
			work: f.work,
			rowId: f.ledgerId,
		}))!;
		await f.t.run((ctx) => ctx.db.patch(f.accountId, { permissionProbeNotBefore: claimed.claim.deadline + 3600_000 }));
		const result = await f.t.mutation(internal.gmail_accounts.save_message, {
			work: f.work,
			before: claimed.row,
			after: {
				...claimed.row,
				attachments: claimed.row.attachments.map((task) => ({ ...task, state: "saved" as const, nextAttemptAt: null })),
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
					fileAccessOperation: { kind: "attachment", index: 0, operation: "finalize" },
					nextAttemptAt: Date.now() - 60_000,
				});
			const account = (await ctx.db.get(f.accountId))!;
			await ctx.db.patch(f.accountId, {
				permissionProbeNotBefore: Date.now() + 3600_000,
				ledgerCounts: { ...account.ledgerCounts, pending: 901, permissionHeld: 900 },
			});
		});
		const calls = network(() => Response.json(committed));
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.map((call) => call.path)).toEqual(["/api/v1/files/service-uploads/finalize"]);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "done", permissionHeld: false });
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
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.filter((call) => call.path === "/object")).toHaveLength(1);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({ status: "done" });
	});
	test("slow history setup gets a fresh metadata timer for more than twenty-five events", async () => {
		const f = await fixture();
		let now = Date.now();
		vi.spyOn(Date, "now").mockImplementation(() => now);
		await f.t.run((ctx) => ctx.db.patch(f.accountId, { nextSliceKind: "history", lastSyncedAt: null }));
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
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
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
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({ syncWorkId: null, syncRequestId: null });
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
				const response = Response.json({ size, data: Buffer.alloc(size, 37).toString("base64url") });
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
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		sample();
		expect(calls.filter((call) => call.path === "/object")).toHaveLength(1);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done",
			attachments: [{ size, state: "saved" }],
		});
		expect(peak).toBeLessThan(512 * 1024 * 1024);
		process.stdout.write(JSON.stringify({ fixture: "25 MB external attachment", sampledPeakRssBytes: peak }) + "\n");
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
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
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
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(calls.some((call) => /attachments\/huge|create-target/.test(call.path))).toBe(false);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			status: "done",
			attachments: [{ state: "not_saved", reason: "too_large" }],
		});
	});
	test("oversized history reduces to one record then stops without moving its cursor", async () => {
		const f = await fixture();
		await f.t.run((ctx) =>
			ctx.db.patch(f.accountId, { nextSliceKind: "history", historyPageToken: "page", lastSyncedAt: null }),
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
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			historyId: "10",
			historyPageSize: 1,
			historyPageToken: null,
			sourceError: null,
			lastSyncedAt: null,
		});
		await f.t.run((ctx) => ctx.db.patch(f.accountId, { nextSliceKind: "history" }));
		await f.t.action(internal.gmail_worker.work_account_slice, { work: f.work });
		expect(await f.t.run((ctx) => ctx.db.get(f.accountId))).toMatchObject({
			historyId: "10",
			sourceError: "history_response_too_large",
			lastSyncedAt: null,
		});
	});
});

describe("ingest_history", () => {
	test("keeps held retries and counters while rescuing only the matching skip", async () => {
		const f = await fixture({ held: true });
		const original = (await f.t.run((ctx) => ctx.db.get(f.ledgerId)))!;
		const current = (await f.t.query(internal.gmail_accounts.get_worker, { work: f.work }))!.account;
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
				events: [{ historyId: "11", gmailMessageId: "ab", kind: "rescue_spam" }],
			}),
		).toBe(true);
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toEqual(original);
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
		const current = (await f.t.query(internal.gmail_accounts.get_worker, { work: f.work }))!.account;
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
		).toMatchObject({ status: "skipped", skipReason: "deleted_before_fetch", deletedAt: expect.any(Number) });
		expect(await f.t.run((ctx) => ctx.db.get(f.ledgerId))).toMatchObject({
			emailWritten: true,
			fileNodeId: "email-node",
			settlementNeeded: true,
			status: "pending",
		});
	});
});
