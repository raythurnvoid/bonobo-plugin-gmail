import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import { describe, expect, test, vi } from "vitest";
import { create_mailbox_walk, parse_email_markdown, read_email } from "./mail-emails";

// The same shape the Gmail plugin writes (gmail_format_markdown in bonobo-plugin-gmail).
const EMAIL_FILE = [
	"---",
	'from: "Ada Lovelace <ada@example.com>"',
	'to: ["me@example.com"]',
	"cc: []",
	'date: "2026-10-18T09:30:00.000Z"',
	'subject: "Lunch: friday?"',
	'direction: "received"',
	'dmarc: "fail"',
	'gmail-message-id: "18f2a"',
	'gmail-thread-id: "18f2a"',
	'message-id: "<a@example.com>"',
	'in-reply-to: ""',
	"attachments: []",
	"---",
	"",
	"# Lunch: friday?",
	"",
	"[Open in Gmail](https://mail.google.com/mail/u/0/#all/18f2a)",
	"",
	"Hi, are you free on Friday?",
	"",
].join("\n");

describe("parse_email_markdown", () => {
	test("reads the frontmatter and drops the title and Gmail link from the body", () => {
		const email = parse_email_markdown("/emails/me/2026/10/18-lunch-friday-18f2a.md", EMAIL_FILE);

		expect(email.headers).toEqual({
			from: "Ada Lovelace <ada@example.com>",
			to: ["me@example.com"],
			cc: [],
			subject: "Lunch: friday?",
			date: "2026-10-18T09:30:00.000Z",
			direction: "received",
			gmailMessageId: "18f2a",
			gmailThreadId: "18f2a",
			senderUnconfirmed: true,
		});
		expect(email.body).toBe("Hi, are you free on Friday?");
	});
});

describe("read_email", () => {
	test("reads every page and joins a UTF-8 character split across pages", async () => {
		const content = EMAIL_FILE + "Hello 👋";
		const bytes = new TextEncoder().encode(content);
		const fetchRaw = vi.fn()
			.mockResolvedValueOnce(new Response(bytes.slice(0, -2), { headers: { "X-File-Next-Cursor": "page-two" } }))
			.mockResolvedValueOnce(new Response(bytes.slice(-2)));
		const email = await read_email({ fetchRaw } as unknown as BonoboClient, "/email.md");
		expect(email).toEqual(parse_email_markdown("/email.md", content));
		expect(fetchRaw.mock.calls).toEqual([
			["/api/v1/files/read", { path: "/email.md", cursor: null }],
			["/api/v1/files/read", { path: "/email.md", cursor: "page-two" }],
		]);
	});

	test("does not return partial text when a later page fails", async () => {
		const fetchRaw = vi.fn()
			.mockResolvedValueOnce(new Response(EMAIL_FILE, { headers: { "X-File-Next-Cursor": "page-two" } }))
			.mockResolvedValueOnce(Response.json({ message: "File changed.", errorCode: "file_changed" }, { status: 409 }));
		await expect(read_email({ fetchRaw } as unknown as BonoboClient, "/email.md")).rejects.toThrow("File changed.");
	});

	test("retries a rate-limited page with the same cursor", async () => {
		vi.useFakeTimers();
		try {
			const fetchRaw = vi.fn()
				.mockResolvedValueOnce(new Response("Hello ", { headers: { "X-File-Next-Cursor": "page-two" } }))
				.mockResolvedValueOnce(Response.json({ retryAfterMs: 20 }, { status: 429 }))
				.mockResolvedValueOnce(new Response("world"));
			const result = read_email({ fetchRaw } as unknown as BonoboClient, "/email.md");
			await vi.runAllTimersAsync();
			expect((await result).body).toBe("Hello world");
			expect(fetchRaw.mock.calls[1]).toEqual(fetchRaw.mock.calls[2]);
		} finally {
			vi.useRealTimers();
		}
	});

	test("returns a call-limit refusal without retrying", async () => {
		const fetchRaw = vi.fn().mockResolvedValue(Response.json({ message: "Plugin API call limit exceeded" }, { status: 429 }));
		await expect(read_email({ fetchRaw } as unknown as BonoboClient, "/email.md")).rejects.toThrow("Plugin API call limit exceeded");
		expect(fetchRaw).toHaveBeenCalledOnce();
	});
});

type FakeChild = { name: string; kind: "folder" | "file"; locked?: boolean };

/**
 * A fake `/api/v1/files/list` that reads `tree` like Press: it keeps only `kind`, sorts by name in
 * `order`, pages by `limit`, and answers 403 for a folder it does not know (a locked one).
 */
function fake_files(tree: Record<string, FakeChild[]>) {
	return vi.fn(async (_path: string, body: { path: string; kind?: string; order?: string; limit: number; cursor: string | null }) => {
		const children = tree[body.path];
		if (children === undefined) {
			return { status: 403, body: { message: "Permission denied" } };
		}
		const matching = children
			.filter((child) => body.kind === undefined || child.kind === body.kind)
			.sort((a, b) => (a.name < b.name ? -1 : 1) * (body.order === "desc" ? -1 : 1));
		const start = Number(body.cursor ?? 0);
		return {
			status: 200,
			body: {
				items: matching
					.slice(start, start + body.limit)
					.map((child) => ({ ...child, locked: child.locked ?? false, path: `${body.path}/${child.name}` })),
				cursor: String(start + body.limit),
				isDone: start + body.limit >= matching.length,
			},
		};
	});
}

const names = (rows: { path: string }[] | null) => rows?.map((row) => row.path.slice(row.path.lastIndexOf("/") + 1));

describe("create_mailbox_walk", () => {
	test("returns days newest first and skips empty and attachment folders", async () => {
		const fetchJson = fake_files({
			"/emails/me": [
				{ name: "2025", kind: "folder" },
				{ name: "2026", kind: "folder" },
			],
			"/emails/me/2025": [{ name: "12", kind: "folder" }],
			"/emails/me/2025/12": [{ name: "31-old-1.md", kind: "file" }],
			"/emails/me/2026": [
				{ name: "09", kind: "folder" },
				{ name: "10", kind: "folder" },
			],
			"/emails/me/2026/09": [],
			"/emails/me/2026/10": [
				{ name: "02-b-2.md", kind: "file" },
				{ name: "02-b-2-attachments", kind: "folder" },
				{ name: "18-a-3.md", kind: "file" },
			],
		});
		const walk = create_mailbox_walk({ fetchJson } as unknown as BonoboClient, "/emails/me");

		expect(names(await walk.next())).toEqual(["18-a-3.md"]);
		expect(names(await walk.next())).toEqual(["02-b-2.md"]);
		expect(names(await walk.next())).toEqual(["31-old-1.md"]);
		expect(await walk.next()).toBeNull();
	});

	test("reads a big month one day at a time and orders each day by Gmail id", async () => {
		const id = (n: number) => `19a${String(n).padStart(13, "0")}`;
		// Day 20 has 120 emails and day 19 has 100. Subjects run against time, so a name sort is wrong.
		const month: FakeChild[] = [];
		for (let n = 0; n < 120; n++) month.push({ name: `20-s${String(999 - n)}-${id(1000 + n)}.md`, kind: "file" });
		for (let n = 0; n < 100; n++) month.push({ name: `19-s${String(999 - n)}-${id(n)}.md`, kind: "file" });
		const fetchJson = fake_files({
			"/emails/me": [{ name: "2026", kind: "folder" }],
			"/emails/me/2026": [{ name: "10", kind: "folder" }],
			"/emails/me/2026/10": month,
		});
		const walk = create_mailbox_walk({ fetchJson } as unknown as BonoboClient, "/emails/me");

		const day20 = names(await walk.next())!;
		expect(day20).toHaveLength(120);
		expect(day20.slice(0, 2)).toEqual([`20-s880-${id(1119)}.md`, `20-s881-${id(1118)}.md`]);
		// Two pages of 100 hold all of day 20. The third page is read only for day 19.
		expect(fetchJson.mock.calls.filter((call) => call[1].path === "/emails/me/2026/10")).toHaveLength(2);
		const day19 = names(await walk.next())!;
		expect(day19).toHaveLength(100);
		expect(day19[0]).toBe(`19-s900-${id(99)}.md`);
		expect(await walk.next()).toBeNull();
	});

	test("starts a month again after invalid_cursor without returning an email twice", async () => {
		const files = fake_files({
			"/emails/me": [{ name: "2026", kind: "folder" }],
			"/emails/me/2026": [{ name: "10", kind: "folder" }],
			"/emails/me/2026/10": [
				{ name: "20-a-3.md", kind: "file" },
				{ name: "19-b-2.md", kind: "file" },
				{ name: "18-c-1.md", kind: "file" },
			],
		});
		let refused = false;
		// A Move somewhere in the workspace ends the cursor of the third page once, after day 20 was returned.
		const fetchJson = vi.fn(async (path: string, body: Parameters<typeof files>[1]) => {
			if (body.cursor === "2" && !refused) {
				refused = true;
				return { status: 400, body: { message: "This list cursor changed. Start a new page.", errorCode: "invalid_cursor" } };
			}
			return files(path, { ...body, limit: 1 });
		});
		const walk = create_mailbox_walk({ fetchJson } as unknown as BonoboClient, "/emails/me");

		const seen: string[] = [];
		for (let rows = await walk.next(); rows !== null; rows = await walk.next()) seen.push(...names(rows)!);
		expect(refused).toBe(true);
		expect(seen).toEqual(["20-a-3.md", "19-b-2.md", "18-c-1.md"]);
	});

	test("marks locked emails, records locked folders, and never lists them", async () => {
		const fetchJson = fake_files({
			"/emails/me": [{ name: "2026", kind: "folder" }],
			"/emails/me/2026": [
				{ name: "09", kind: "folder", locked: true },
				{ name: "10", kind: "folder" },
			],
			"/emails/me/2026/10": [
				{ name: "18-open-2.md", kind: "file" },
				{ name: "18-secret-1.md", kind: "file", locked: true },
			],
		});
		const walk = create_mailbox_walk({ fetchJson } as unknown as BonoboClient, "/emails/me");

		expect((await walk.next())?.map((row) => [row.path, row.locked])).toEqual([
			["/emails/me/2026/10/18-open-2.md", false],
			["/emails/me/2026/10/18-secret-1.md", true],
		]);
		expect(await walk.next()).toBeNull();
		expect(walk.lockedFolders).toEqual(["/emails/me/2026/09"]);
		expect(fetchJson.mock.calls.map((call) => call[1].path)).not.toContain("/emails/me/2026/09");
	});

	test("records the account folder when the member cannot open it", async () => {
		const fetchJson = vi.fn(async () => ({ status: 403, body: { message: "Permission denied" } }));
		const walk = create_mailbox_walk({ fetchJson } as unknown as BonoboClient, "/emails/me");

		expect(await walk.next()).toBeNull();
		expect(walk.lockedFolders).toEqual(["/emails/me"]);
	});
});
