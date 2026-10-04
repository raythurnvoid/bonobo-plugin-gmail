import { afterEach, describe, expect, test, vi } from "vitest";
import { GMAIL_READONLY_SCOPE, gmail_consent_url, gmail_google_get, gmail_google_token } from "./gmail_google";

afterEach(() => vi.unstubAllGlobals());

describe("gmail_consent_url", () => {
	test("asks only for offline readonly access with the exact callback", () => {
		const url = new URL(gmail_consent_url("state", "https://gmail.test/oauth/google/callback"));
		expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
		expect(Object.fromEntries(url.searchParams)).toEqual({ client_id: "test-client", redirect_uri: "https://gmail.test/oauth/google/callback",
			response_type: "code", access_type: "offline", prompt: "consent", include_granted_scopes: "false", scope: GMAIL_READONLY_SCOPE, state: "state" });
	});
});

describe("gmail_google_token", () => {
	test("validates code and refresh answers without keeping access tokens", async () => {
		const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => Response.json({ access_token: "access", refresh_token: "refresh", expires_in: 3600,
			scope: GMAIL_READONLY_SCOPE, token_type: "Bearer" }));
		vi.stubGlobal("fetch", fetchMock);
		expect((await gmail_google_token({ code: "code", callback: "https://gmail.test/oauth/google/callback" })).refresh_token).toBe("refresh");
		expect(fetchMock.mock.calls[0]?.[0]).toBe("https://oauth2.googleapis.com/token");
		const body = fetchMock.mock.calls[0]?.[1]?.body;
		expect(body).toBeInstanceOf(URLSearchParams);
		expect(String(body)).toContain("grant_type=authorization_code");
		expect((await gmail_google_token({ refreshToken: "refresh" })).access_token).toBe("access");
		expect(String(fetchMock.mock.calls[1]?.[1]?.body)).toContain("grant_type=refresh_token");
	});
	test.each([
		{ access_token: "access", expires_in: 3600, scope: GMAIL_READONLY_SCOPE, token_type: "Bearer" },
		{ access_token: "access", refresh_token: "refresh", expires_in: 3600, scope: "https://www.googleapis.com/auth/gmail.modify", token_type: "Bearer" },
		{ access_token: "access", refresh_token: "refresh", expires_in: 0, scope: GMAIL_READONLY_SCOPE, token_type: "Bearer" },
	])("refuses an invalid code exchange answer", async answer => {
		vi.stubGlobal("fetch", vi.fn(async () => Response.json(answer)));
		await expect(gmail_google_token({ code: "code", callback: "https://gmail.test/oauth/google/callback" })).rejects.toMatchObject({ code: "gmail_request" });
	});
	test("classifies revoked refresh tokens", async () => {
		vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: "invalid_grant" }, { status: 400 })));
		await expect(gmail_google_token({ refreshToken: "refresh" })).rejects.toMatchObject({ code: "google_revoked" });
	});
});

describe("gmail_google_get", () => {
	test.each(["rateLimitExceeded", "userRateLimitExceeded", "dailyLimitExceeded", "domainPolicy", "insufficientPermissions"])("classifies 403 reason %s", async reason => {
		vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: { errors: [{ reason }] } }, { status: 403 })));
		await expect(gmail_google_get("/profile", "access", 8192)).rejects.toMatchObject({ code:
			["domainPolicy", "insufficientPermissions"].includes(reason) ? "gmail_request" : "gmail_temporary" });
	});
	test("keeps requests on the Gmail origin and caps streamed bytes", async () => {
		const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => Response.json({ data: "x".repeat(100) }));
		vi.stubGlobal("fetch", fetchMock);
		await expect(gmail_google_get("/messages/1", "access", 50)).rejects.toThrow("source_too_large");
		expect(fetchMock.mock.calls[0]?.[0]).toBe("https://gmail.googleapis.com/gmail/v1/users/me/messages/1");
		expect(fetchMock.mock.calls[0]?.[1]?.redirect).toBe("error");
		await expect(gmail_google_get("//evil.test", "access", 50)).rejects.toThrow("Invalid Gmail path");
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
