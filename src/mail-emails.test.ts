import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import { describe, expect, test, vi } from "vitest";
import { create_mailbox_walk, parse_email_markdown } from "./mail-emails";

// The same shape the Gmail plugin writes (gmail_format_markdown in bonobo-plugin-gmail).
const EMAIL_FILE = [
	"---",
	'from: "Ada Lovelace <ada@example.com>"',
	'to: ["me@example.com"]',
	"cc: []",
	'date: "2026-10-18T09:30:00.000Z"',
	'subject: "Lunch: friday?"',
	'direction: "received"',
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
		});
		expect(email.body).toBe("Hi, are you free on Friday?");
	});
});

describe("create_mailbox_walk", () => {
	test("returns month folders newest first and skips empty and attachment folders", async () => {
		const tree: Record<string, { name: string; kind: "folder" | "file" }[]> = {
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
		};
		const fetchJson = vi.fn(async (_path: string, body: { path: string }) => ({
			status: 200,
			body: {
				items: tree[body.path].map((item) => ({ ...item, path: `${body.path}/${item.name}` })),
				cursor: "",
				isDone: true,
			},
		}));
		const walk = create_mailbox_walk({ fetchJson } as unknown as BonoboClient, "/emails/me");

		expect((await walk.next())?.map((row) => row.path.slice(row.path.lastIndexOf("/") + 1))).toEqual(["18-a-3.md", "02-b-2.md"]);
		expect((await walk.next())?.map((row) => row.path.slice(row.path.lastIndexOf("/") + 1))).toEqual(["31-old-1.md"]);
		expect(await walk.next()).toBeNull();
	});
});
