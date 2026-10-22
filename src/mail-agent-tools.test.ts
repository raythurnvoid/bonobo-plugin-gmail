import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import { afterEach, describe, expect, test, vi } from "vitest";
import { register_mail_tools, type MailView } from "./mail-agent-tools";

const EMAIL_FILE = ["---", 'from: "Ada <ada@example.com>"', 'subject: "Lunch"', 'gmail-message-id: "18f2a"', "---", "", "Free on Friday?"].join("\n");
const DRAFT_ID = "6f1c2a4e-0b7d-4c3e-9a51-2f8e7d6c5b4a";
const draft = { clientDraftId: DRAFT_ID, to: ["ada@example.com"], cc: [], subject: "Re: Lunch", body: "Yes", isReply: true, agentEditedAt: null };

afterEach(() => vi.unstubAllGlobals());

function make_page(viewPatch: Partial<MailView> = {}) {
	const handlers = new Map<string, (input: unknown) => unknown>();
	const requests: { path: string; body: unknown }[] = [];
	vi.stubGlobal(
		"fetch",
		vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			const path = new URL(String(input)).pathname;
			requests.push({ path, body: JSON.parse(String(init?.body)) });
			const answers: Record<string, unknown> = {
				"/page/drafts/get": draft,
				"/page/drafts/create": { clientDraftId: "new" },
				"/page/drafts/update": { saved: true },
				"/page/drafts/delete": { deleted: true },
				// Answer a send too, so a tool that sends fails on the assertion below, not on the stub.
				"/page/drafts/send": { sent: true },
			};
			return Response.json(answers[path] ?? { code: "unexpected" }, { status: path in answers ? 200 : 500 });
		}),
	);
	const client = {
		getToken: async () => "plu_test",
		refreshToken: async () => "plu_new",
		fetchJson: async () => ({ status: 200, body: { content: EMAIL_FILE } }),
		agent: {
			registerTool: (name: string, handler: (input: unknown) => unknown) => {
				handlers.set(name, handler);
				return () => handlers.delete(name);
			},
		},
	} as unknown as BonoboClient;
	const view: MailView = {
		account: { accountId: "account", emailAddress: "me@example.com", destinationPath: "/emails/me", canCompose: true, isComposer: true },
		folder: "drafts",
		rows: [],
		openEmail: null,
		openDraftId: DRAFT_ID,
		unsavedDraftId: null,
		// The agent saved this draft last, so it may delete it.
		drafts: [{ clientDraftId: DRAFT_ID, to: ["ada@example.com"], cc: [], subject: "Re: Lunch", isReply: true, saving: false, agentEditedAt: 5, updatedAt: 5 }],
		...viewPatch,
	};
	register_mail_tools(client, { getView: () => view, showEmail: vi.fn(), showDraft: vi.fn(), refreshDrafts: vi.fn(async () => {}) });
	return { handlers, requests, view };
}

describe("register_mail_tools", () => {
	test("no tool can send a draft", async () => {
		const page = make_page();
		const inputs: Record<string, unknown> = {
			get_view: {},
			open_email: { path: "/emails/me/2026/10/18-lunch-18f2a.md" },
			list_drafts: {},
			read_draft: { draftId: DRAFT_ID },
			create_draft: { to: ["ada@example.com"], subject: "Re: Lunch", body: "Yes", replyToPath: "/emails/me/2026/10/18-lunch-18f2a.md" },
			update_draft: { draftId: DRAFT_ID, body: "Yes, at noon" },
			delete_draft: { draftId: DRAFT_ID },
		};

		for (const [name, handler] of page.handlers) {
			await handler(inputs[name]);
		}

		expect(page.handlers.size).toBe(Object.keys(inputs).length);
		expect(page.requests.map((request) => request.path)).toEqual(expect.arrayContaining(["/page/drafts/create", "/page/drafts/update", "/page/drafts/delete"]));
		expect(page.requests.filter((request) => request.path.includes("send"))).toEqual([]);
		expect(page.requests.find((request) => request.path === "/page/drafts/create")?.body).toMatchObject({ replyToGmailMessageId: "18f2a", byAgent: true });
	});

	test("create_draft called again with the same input reuses the draft id", async () => {
		const page = make_page();
		const input = { to: ["ada@example.com"], subject: "Hi", body: "Hello" };

		await page.handlers.get("create_draft")!(input);
		await page.handlers.get("create_draft")!(input);

		const ids = page.requests.map((request) => (request.body as { clientDraftId: string }).clientDraftId);
		expect(ids).toHaveLength(2);
		expect(ids[1]).toBe(ids[0]);
	});

	test("create_draft refuses bad input before it writes", async () => {
		const page = make_page();

		await expect(page.handlers.get("create_draft")!({ to: "ada@example.com", subject: "x", body: "y" })).rejects.toThrow("to must be a list of strings");
		// 20,000 three-byte characters are 60 KB, more than a draft holds.
		await expect(page.handlers.get("create_draft")!({ to: [], subject: "x", body: "語".repeat(20_000) })).rejects.toThrow("at most 50 KB");
		expect(page.requests).toEqual([]);
	});

	test("delete_draft refuses a draft the member changed last", async () => {
		const page = make_page({
			drafts: [{ clientDraftId: DRAFT_ID, to: [], cc: [], subject: "Mine", isReply: false, saving: false, agentEditedAt: 5, updatedAt: 9 }],
		});

		await expect(page.handlers.get("delete_draft")!({ draftId: DRAFT_ID })).rejects.toThrow("Only the member can delete this draft");
		expect(page.requests).toEqual([]);
	});

	test("tools that change the view, and read_draft or delete_draft on that draft, refuse while the member has unsaved text", async () => {
		const page = make_page({ unsavedDraftId: DRAFT_ID });
		const refused: [string, unknown][] = [
			["open_email", { path: "/emails/me/2026/10/18-lunch-18f2a.md" }],
			["read_draft", { draftId: DRAFT_ID }],
			["create_draft", { to: ["ada@example.com"], subject: "Hello", body: "Hi" }],
			["update_draft", { draftId: DRAFT_ID, body: "Yes, at noon" }],
			["delete_draft", { draftId: DRAFT_ID }],
		];

		for (const [name, input] of refused) {
			await expect(page.handlers.get(name)!(input)).rejects.toThrow("not saved yet");
		}
		expect(page.requests).toEqual([]);
	});

	test("read_draft and update_draft refuse when the member starts typing while the draft is read", async () => {
		for (const name of ["read_draft", "update_draft"]) {
			const page = make_page();
			const paths: string[] = [];
			vi.stubGlobal(
				"fetch",
				vi.fn(async (input: RequestInfo | URL) => {
					paths.push(new URL(String(input)).pathname);
					page.view.unsavedDraftId = DRAFT_ID;
					return Response.json(draft);
				}),
			);

			await expect(page.handlers.get(name)!({ draftId: DRAFT_ID, body: "Yes, at noon" })).rejects.toThrow("not saved yet");
			expect(paths).toEqual(["/page/drafts/get"]);
		}
	});
});
