import { cleanup, render } from "@testing-library/react";
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
		await vi.advanceTimersByTimeAsync(15_000);
		await vi.waitFor(() => expect(requests.map((request) => request.path)).toContain("/page/press-repair"));
		await vi.advanceTimersByTimeAsync(30_000);

		const repairs = requests.filter((request) => request.path === "/page/press-repair");
		expect(repairs).toHaveLength(1);
		expect(repairs[0].body).toMatchObject({ accountId: "account", expectedGeneration: 1 });
	});

	test("shows new mail at the top after the sync saved it", async () => {
		vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
		let messagesSynced = 4;
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
					return Response.json({ binding, canWrite: true, cursor: null, attempt: null, accounts: [{ ...account, canRepair: false, messagesSynced }] });
				}
				return Response.json(path === "/page/drafts/list" ? { drafts: [], cursor: null } : {});
			}),
		);
		const client = {
			getToken: async () => "plu_test",
			refreshToken: async () => "plu_new",
			fetchJson: async (path: string, body: { path: string }) =>
				path === "/api/v1/files/list"
					? {
							status: 200,
							body: {
								items: (tree[body.path] ?? []).map((name) => ({ name, kind: name.endsWith(".md") ? "file" : "folder", path: `${body.path}/${name}` })),
								cursor: "",
								isDone: true,
							},
						}
					: { status: 404, body: { message: "Not found" } },
			agent: { registerTool: () => () => {} },
		} as unknown as BonoboClient;

		render(<MailApp client={client} />);
		await vi.waitFor(() => expect(document.body.textContent).toContain("old mail"));

		tree["/emails/ray-example.com/2026/10"].push("20-new-mail-19a0000000000002.md");
		messagesSynced = 5;
		await vi.advanceTimersByTimeAsync(15_000);

		await vi.waitFor(() =>
			expect([...document.querySelectorAll(".mail-row-subject")].map((element) => element.textContent)).toEqual(["new mail", "old mail"]),
		);
	});
});
