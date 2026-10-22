import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import { afterEach, describe, expect, test, vi } from "vitest";
import { MailApp } from "./mail-app";

const account = {
	accountId: "account",
	emailAddress: "ray@example.com",
	destinationPath: "/emails/ray-example.com",
	connectionGeneration: 1,
	syncStatus: "blocked",
	syncError: "press_reconnect_needed",
	sourceError: null,
	pressReady: true,
	canRepair: true,
	needsReconnect: false,
	isComposer: true,
	canCompose: true,
	backfillComplete: true,
	messagesSynced: 4,
	messagesSkipped: 0,
	ledgerCounts: { pending: 0, done: 4, skipped: 0, failed: 0, given_up: 0, emailAssumed: 0, permissionHeld: 0 },
	attachmentsSkippedReason: null,
	nextSyncAt: null,
	nextPermissionRetryAt: null,
	lastSyncedAt: 1_800_000_000_000,
	newestEmailAt: 1_800_000_000_000,
};

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

describe("MailApp", () => {
	test("renews the sync's Press grant once when Press stops accepting it after the page loaded", async () => {
		vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
		// The sync notices the refused grant only at its next Press write, a while after the page loaded.
		let canRepair = false;
		const requests: { path: string; body: unknown }[] = [];
		vi.stubGlobal(
			"fetch",
			vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
				const path = new URL(String(input)).pathname;
				requests.push({ path, body: JSON.parse(String(init?.body)) });
				if (path === "/page/status") {
					const binding = { organizationId: "org", workspaceId: "workspace", installationId: "installation", actorUserId: "actor" };
					return Response.json({ binding, canWrite: true, cursor: null, attempt: null, accounts: [{ ...account, canRepair }] });
				}
				return Response.json(path === "/page/drafts/list" ? { drafts: [], cursor: null } : {});
			}),
		);
		const client = {
			getToken: async () => "plu_test",
			refreshToken: async () => "plu_new",
			fetchJson: async () => ({ status: 404, body: { message: "Not found" } }),
			agent: { registerTool: () => () => {} },
		} as unknown as BonoboClient;

		render(<MailApp client={client} />);
		await vi.waitFor(() => expect(requests.filter((request) => request.path === "/page/status").length).toBeGreaterThanOrEqual(2));

		canRepair = true;
		await vi.advanceTimersByTimeAsync(60_000);
		await vi.waitFor(() => expect(requests.map((request) => request.path)).toContain("/page/press-repair"));
		await vi.advanceTimersByTimeAsync(120_000);

		const repairs = requests.filter((request) => request.path === "/page/press-repair");
		expect(repairs).toHaveLength(1);
		expect(repairs[0].body).toMatchObject({ accountId: "account", expectedGeneration: 1 });
	});

	test("reads drafts again when the page becomes visible, not on a timer", async () => {
		vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
		const paths: string[] = [];
		vi.stubGlobal(
			"fetch",
			vi.fn(async (input: RequestInfo | URL) => {
				const path = new URL(String(input)).pathname;
				paths.push(path);
				if (path === "/page/status") {
					const binding = { organizationId: "org", workspaceId: "workspace", installationId: "installation", actorUserId: "actor" };
					return Response.json({ binding, canWrite: true, cursor: null, attempt: null, accounts: [{ ...account, canRepair: false }] });
				}
				return Response.json(path === "/page/drafts/list" ? { drafts: [], cursor: null } : {});
			}),
		);
		const client = {
			getToken: async () => "plu_test",
			refreshToken: async () => "plu_new",
			fetchJson: async () => ({ status: 404, body: { message: "Not found" } }),
			agent: { registerTool: () => () => {} },
		} as unknown as BonoboClient;
		const draftReads = () => paths.filter((path) => path === "/page/drafts/list").length;

		render(<MailApp client={client} />);
		await vi.waitFor(() => expect(draftReads()).toBe(1));

		await vi.advanceTimersByTimeAsync(5 * 60_000);
		expect(draftReads()).toBe(1);

		fireEvent(document, new Event("visibilitychange"));
		await vi.waitFor(() => expect(draftReads()).toBe(2));
	});

	test("reads drafts again every 5 seconds after a failed read, until one works", async () => {
		vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
		let draftsFail = true;
		const paths: string[] = [];
		vi.stubGlobal(
			"fetch",
			vi.fn(async (input: RequestInfo | URL) => {
				const path = new URL(String(input)).pathname;
				paths.push(path);
				if (path === "/page/status") {
					const binding = { organizationId: "org", workspaceId: "workspace", installationId: "installation", actorUserId: "actor" };
					return Response.json({ binding, canWrite: true, cursor: null, attempt: null, accounts: [{ ...account, canRepair: false }] });
				}
				if (path === "/page/drafts/list") {
					return draftsFail ? Response.json({ code: "gmail_busy" }, { status: 503 }) : Response.json({ drafts: [], cursor: null });
				}
				return Response.json({});
			}),
		);
		const client = {
			getToken: async () => "plu_test",
			refreshToken: async () => "plu_new",
			fetchJson: async () => ({ status: 404, body: { message: "Not found" } }),
			agent: { registerTool: () => () => {} },
		} as unknown as BonoboClient;
		const draftReads = () => paths.filter((path) => path === "/page/drafts/list").length;

		render(<MailApp client={client} />);
		fireEvent.click(screen.getByRole("button", { name: "Drafts" }));
		await vi.waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/Gmail is busy/));

		draftsFail = false;
		await vi.advanceTimersByTimeAsync(5000);
		await vi.waitFor(() => expect(screen.getByText(/No drafts/)).toBeTruthy());
		expect(draftReads()).toBe(2);

		await vi.advanceTimersByTimeAsync(5 * 60_000);
		expect(draftReads()).toBe(2);
	});

	test("reads the list again only when the sync saved a newer email", async () => {
		vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
		let messagesSynced = 4;
		let newestEmailAt = 1_800_000_000_000;
		let listCalls = 0;
		const tree: Record<string, string[]> = {
			"/emails/ray-example.com": ["2026"],
			"/emails/ray-example.com/2026": ["10"],
			"/emails/ray-example.com/2026/10": ["19-old-mail-19a0000000000001.md"],
		};
		vi.stubGlobal(
			"fetch",
			vi.fn(async (input: RequestInfo | URL) => {
				const path = new URL(String(input)).pathname;
				if (path === "/page/status") {
					const binding = { organizationId: "org", workspaceId: "workspace", installationId: "installation", actorUserId: "actor" };
					return Response.json({ binding, canWrite: true, cursor: null, attempt: null, accounts: [{ ...account, canRepair: false, messagesSynced, newestEmailAt }] });
				}
				return Response.json(path === "/page/drafts/list" ? { drafts: [], cursor: null } : {});
			}),
		);
		const client = {
			getToken: async () => "plu_test",
			refreshToken: async () => "plu_new",
			fetchJson: async (path: string, body: { path: string; order?: string }) => {
				if (path !== "/api/v1/files/list") {
					return { status: 404, body: { message: "Not found" } };
				}
				listCalls += 1;
				return {
					status: 200,
					body: {
						// Like Press with `order: "desc"`: newest name first.
						items: [...(tree[body.path] ?? [])]
							.sort((x, y) => (x < y ? 1 : -1) * (body.order === "desc" ? 1 : -1))
							.map((name) => ({ name, kind: name.endsWith(".md") ? "file" : "folder", locked: false, path: `${body.path}/${name}` })),
						cursor: "",
						isDone: true,
					},
				};
			},
			agent: { registerTool: () => () => {} },
		} as unknown as BonoboClient;

		render(<MailApp client={client} />);
		await vi.waitFor(() => expect(document.body.textContent).toContain("old mail"));

		// Backfill saved an older email. The newest email did not change, so the list is not read again.
		const listCallsAfterLoad = listCalls;
		messagesSynced = 5;
		await vi.advanceTimersByTimeAsync(60_000);
		expect(listCalls).toBe(listCallsAfterLoad);

		tree["/emails/ray-example.com/2026/10"].push("20-new-mail-19a0000000000002.md");
		messagesSynced = 6;
		newestEmailAt += 60_000;
		await vi.advanceTimersByTimeAsync(60_000);

		await vi.waitFor(() =>
			expect([...document.querySelectorAll(".mail-row-subject")].map((element) => element.textContent)).toEqual(["new mail", "old mail"]),
		);
	});

	test("keeps the agent off a draft whose save failed, so the typed text stays", async () => {
		const draftId = "6f1c2a4e-0b7d-4c3e-9a51-2f8e7d6c5b4a";
		const row = { clientDraftId: draftId, to: ["ada@example.com"], cc: [], subject: "Lunch", isReply: false, saving: false, agentEditedAt: null, updatedAt: 1 };
		const requests: string[] = [];
		vi.stubGlobal(
			"fetch",
			vi.fn(async (input: RequestInfo | URL) => {
				const path = new URL(String(input)).pathname;
				requests.push(path);
				if (path === "/page/status") {
					const binding = { organizationId: "org", workspaceId: "workspace", installationId: "installation", actorUserId: "actor" };
					return Response.json({ binding, canWrite: true, cursor: null, attempt: null, accounts: [{ ...account, canRepair: false }] });
				}
				if (path === "/page/drafts/list") return Response.json({ drafts: [row], cursor: null });
				if (path === "/page/drafts/get") return Response.json({ ...row, body: "Hi" });
				if (path === "/page/drafts/update") return Response.json({ code: "gmail_busy" }, { status: 503 });
				return Response.json({});
			}),
		);
		const tools = new Map<string, (input: unknown) => unknown>();
		const client = {
			getToken: async () => "plu_test",
			refreshToken: async () => "plu_new",
			fetchJson: async () => ({ status: 404, body: { message: "Not found" } }),
			agent: {
				registerTool: (name: string, handler: (input: unknown) => unknown) => {
					tools.set(name, handler);
					return () => tools.delete(name);
				},
			},
		} as unknown as BonoboClient;

		render(<MailApp client={client} />);
		await vi.waitFor(() => expect(screen.getByRole("button", { name: "Drafts" })).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Drafts" }));
		await vi.waitFor(() => expect(screen.getByText("Lunch")).toBeTruthy());
		fireEvent.click(screen.getByText("Lunch"));
		const body = await vi.waitFor(() => {
			const element = document.querySelector("textarea");
			expect(element?.value).toBe("Hi");
			return element!;
		});

		fireEvent.input(body, { target: { value: "Hi, see you at noon" } });
		fireEvent.blur(body);
		await vi.waitFor(() => expect(screen.getByText("Gmail is busy. Try again in a moment.")).toBeTruthy());

		await expect(tools.get("update_draft")!({ draftId, subject: "Lunch on Friday" })).rejects.toThrow("not saved yet");
		expect(requests.filter((path) => path === "/page/drafts/update")).toHaveLength(1);
	});
});
