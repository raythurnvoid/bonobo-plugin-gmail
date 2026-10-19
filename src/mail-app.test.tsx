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
});

describe("MailApp", () => {
	test("renews the sync's Press grant when Press stopped accepting it", async () => {
		const requests: { path: string; body: unknown }[] = [];
		vi.stubGlobal(
			"fetch",
			vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
				const path = new URL(String(input)).pathname;
				requests.push({ path, body: JSON.parse(String(init?.body)) });
				if (path === "/page/status") {
					const binding = { organizationId: "org", workspaceId: "workspace", installationId: "installation", actorUserId: "actor" };
					return Response.json({ binding, canWrite: true, cursor: null, attempt: null, accounts: [account] });
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

		await vi.waitFor(() => expect(requests.map((request) => request.path)).toContain("/page/press-repair"));
		expect(requests.find((request) => request.path === "/page/press-repair")?.body).toMatchObject({ accountId: "account", expectedGeneration: 1 });
	});
});
