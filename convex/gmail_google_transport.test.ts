// @vitest-environment node
import { createServer } from "node:http";
import { once } from "node:events";
import { afterEach, describe, expect, test, vi } from "vitest";
import { gmail_google_get } from "./gmail_google";

afterEach(() => vi.unstubAllGlobals());

describe("gmail_google_get", () => {
	test.each(["headers", "body"] as const)("the request deadline stops slow %s with native fetch", async kind => {
		const nativeFetch = fetch;
		let headersReceived = false;
		let later: ReturnType<typeof setTimeout> | undefined;
		const server = createServer((_request, response) => {
			if (kind === "body") {
				response.writeHead(200, { "Content-Type": "application/json" });
				response.write('{"ok":');
			}
			// Without the deadline, valid JSON arrives and the rejection check fails.
			later = setTimeout(() => response.end(kind === "body" ? "true}" : '{"ok":true}'), 1000);
		});
		server.listen(0, "127.0.0.1");
		await once(server, "listening");
		try {
			const address = server.address();
			if (!address || typeof address === "string") throw new Error("Missing local server address");
			const fetchMock = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
				const response = await nativeFetch(`http://127.0.0.1:${address.port}/`, init);
				headersReceived = true;
				return response;
			});
			vi.stubGlobal("fetch", fetchMock);
			await expect(gmail_google_get("/profile", "access", 8192, 200)).rejects.toMatchObject({ name: "TimeoutError" });
			expect(headersReceived).toBe(kind === "body");
			expect(fetchMock).toHaveBeenCalledTimes(1);
			expect(fetchMock.mock.calls[0]).toEqual(["https://gmail.googleapis.com/gmail/v1/users/me/profile", {
				redirect: "error", headers: { Authorization: "Bearer access" }, signal: expect.any(AbortSignal),
			}]);
			expect(fetchMock.mock.calls[0][1]!.signal!.aborted).toBe(true);
		} finally {
			clearTimeout(later);
			server.closeAllConnections();
			await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
		}
		expect(server.listening).toBe(false);
	});
});
