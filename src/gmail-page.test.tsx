import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { GmailPage } from "./gmail-page";
import {
  gmail_check_status,
  gmail_page_post,
  gmail_status_response,
} from "./gmail-api";

const binding = {
  organizationId: "org",
  workspaceId: "workspace",
  installationId: "installation",
  actorUserId: "actor",
};
const client = {
  getToken: vi.fn(async () => "plu_test"),
  refreshToken: vi.fn(async () => "plu_new"),
};
function status() {
  return { binding, canWrite: true, accounts: [], cursor: null, attempt: null };
}
function account() {
  return {
    accountId: "account",
    emailAddress: "ray@example.com",
    destinationPath: "/emails/ray-example.com",
    connectionGeneration: 1,
    syncStatus: "live",
    syncError: null,
    sourceError: null,
    pressReady: true,
    canRepair: false,
    needsReconnect: false,
    backfillComplete: true,
    messagesSynced: 4,
    messagesSkipped: 0,
    ledgerCounts: {
      pending: 1,
      done: 4,
      skipped: 0,
      failed: 0,
      given_up: 0,
      emailAssumed: 0,
      permissionHeld: 0,
    },
    attachmentsSkippedReason: null,
    nextSyncAt: Date.now() + 60_000,
    nextPermissionRetryAt: null,
    lastSyncedAt: Date.now(),
  };
}
function visible(state: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value: state,
  });
  fireEvent(document, new Event("visibilitychange"));
}
async function settle() {
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(1_800_000_000_000);
  sessionStorage.clear();
  visible("visible");
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("GmailPage", () => {
  test("polls only while visible and removes its timer on unmount", async () => {
    const fetch = vi.fn(async () => Response.json(status()));
    vi.stubGlobal("fetch", fetch);
    const view = render(<GmailPage client={client} />);
    await settle();
    expect(fetch).toHaveBeenCalledTimes(1);
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(fetch).toHaveBeenCalledTimes(2);
    visible("hidden");
    await act(() => vi.advanceTimersByTimeAsync(30_000));
    expect(fetch).toHaveBeenCalledTimes(2);
    visible("visible");
    await settle();
    expect(fetch).toHaveBeenCalledTimes(3);
    view.unmount();
    await act(() => vi.advanceTimersByTimeAsync(30_000));
    expect(fetch).toHaveBeenCalledTimes(3);
  });
  test("a hidden mount starts no backend request", async () => {
    visible("hidden");
    const fetch = vi.fn(async () => Response.json(status()));
    vi.stubGlobal("fetch", fetch);
    render(<GmailPage client={client} />);
    await settle();
    await act(() => vi.advanceTimersByTimeAsync(30_000));
    expect(fetch).not.toHaveBeenCalled();
    visible("visible");
    await settle();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  test("unavailable backend shows a static Retry and hides the old healthy claim", async () => {
    let unavailable = false;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        unavailable
          ? new Response("disabled", { status: 503 })
          : Response.json({ ...status(), accounts: [account()] }),
      ),
    );
    render(<GmailPage client={client} />);
    await settle();
    expect(screen.getByText(/Checking for new mail/)).toBeTruthy();
    unavailable = true;
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(screen.queryByText(/Checking for new mail/)).toBeNull();
    expect(
      document.querySelector("[data-gmail-service-status='unavailable']"),
    ).toBeTruthy();
    unavailable = false;
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await settle();
    expect(screen.getByText(/Checking for new mail/)).toBeTruthy();
    expect(screen.queryByText(/service is unavailable/)).toBeNull();
  });
  test("a blocked Press grant shows attention instead of ongoing connection", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          ...status(),
          accounts: [
            { ...account(), pressReady: false, syncStatus: "blocked" },
          ],
        }),
      ),
    );
    render(<GmailPage client={client} />);
    await settle();
    expect(screen.getByText("Press connection needs attention")).toBeTruthy();
    expect(screen.queryByText("Finishing Press connection")).toBeNull();
    expect(screen.queryByText(/Checking for new mail/)).toBeNull();
  });
  test("queued work cannot hide an old completed check", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          ...status(),
          accounts: [{ ...account(), lastSyncedAt: Date.now() - 11 * 60_000 }],
        }),
      ),
    );
    render(<GmailPage client={client} />);
    await settle();
    expect(screen.getByText(/Sync is delayed/)).toBeTruthy();
    expect(
      document.querySelector("[data-gmail-check-status='delayed']"),
    ).toBeTruthy();
    expect(screen.queryByText(/Checking for new mail/)).toBeNull();
  });
  test("a recent check keeps Files attention visible", async () => {
    const item = account();
    item.ledgerCounts.permissionHeld = 2;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ ...status(), accounts: [item] })),
    );
    render(<GmailPage client={client} />);
    await settle();
    expect(screen.getByText(/2 emails are waiting for access/)).toBeTruthy();
    expect(
      document.querySelector("[data-gmail-files-status='write_refused']"),
    ).toBeTruthy();
    expect(screen.queryByText(/Checking for new mail/)).toBeNull();
  });
  test("a pre-seal account can Disconnect and shows no healthy claim", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          ...status(),
          accounts: [{ ...account(), pressReady: false, lastSyncedAt: null }],
        }),
      ),
    );
    render(<GmailPage client={client} />);
    await settle();
    expect(screen.getByText("Finishing Press connection")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Disconnect" })).toBeTruthy();
    expect(screen.getByText("No mail check completed yet")).toBeTruthy();
  });
  test("saves only bound retry IDs before Start and never the consent URL", async () => {
    const calls: string[] = [];
    let started: {
      attemptId: string;
      status: string;
      clientRequestId: string;
      accountId: null;
      expiresAt: number;
    } | null = null;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        calls.push(url);
        if (url.endsWith("/start")) {
          const stored: unknown = JSON.parse(
            sessionStorage.getItem("gmail-connect-retry")!,
          );
          expect(stored).toMatchObject({
            binding,
            accountId: null,
            attemptId: null,
            clientRequestId: expect.stringMatching(/^[a-f0-9]{64}$/),
          });
          const local = JSON.parse(
            sessionStorage.getItem("gmail-connect-retry")!,
          ) as { clientRequestId: string };
          started = {
            attemptId: "attempt",
            status: "pending",
            clientRequestId: local.clientRequestId,
            accountId: null,
            expiresAt: Date.now() + 60_000,
          };
          return Response.json({
            attemptId: "attempt",
            status: "pending",
            consentUrl:
              "https://accounts.google.com/o/oauth2/v2/auth?state=private",
          });
        }
        return Response.json({ ...status(), attempt: started });
      }),
    );
    render(<GmailPage client={client} />);
    await settle();
    fireEvent.click(screen.getByRole("button", { name: "Connect Gmail" }));
    await settle();
    expect(calls.some((url) => url.endsWith("/start"))).toBe(true);
    expect(sessionStorage.getItem("gmail-connect-retry")).not.toContain(
      "private",
    );
  });
  test("reload verifies the binding before exact Start recovery", async () => {
    const saved = {
      binding,
      clientRequestId: "a".repeat(64),
      accountId: null,
      attemptId: "attempt",
    };
    sessionStorage.setItem("gmail-connect-retry", JSON.stringify(saved));
    const calls: { url: string; body: unknown }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit) => {
        calls.push({ url, body: JSON.parse(String(init.body)) });
        return Response.json(
          url.endsWith("/status")
            ? {
                ...status(),
                attempt: {
                  ...saved,
                  status: "pending",
                  expiresAt: Date.now() + 60_000,
                },
              }
            : {
                attemptId: "attempt",
                status: "pending",
                consentUrl:
                  "https://accounts.google.com/o/oauth2/v2/auth?state=private",
              },
        );
      }),
    );
    render(<GmailPage client={client} />);
    await settle();
    expect(calls.map((call) => call.url.split("/page/")[1])).toEqual([
      "status",
      "connect/start",
    ]);
    expect(calls[1].body).toEqual({
      clientRequestId: saved.clientRequestId,
      accountId: null,
    });
    expect(screen.getByRole("button", { name: "Copy link" })).toBeTruthy();
    expect(sessionStorage.getItem("gmail-connect-retry")).not.toContain(
      "private",
    );
  });
  test("a changed workspace discards stored Start without replay", async () => {
    sessionStorage.setItem(
      "gmail-connect-retry",
      JSON.stringify({
        binding: { ...binding, workspaceId: "other" },
        clientRequestId: "a".repeat(64),
        accountId: null,
        attemptId: null,
      }),
    );
    const fetch = vi.fn(async () => Response.json(status()));
    vi.stubGlobal("fetch", fetch);
    render(<GmailPage client={client} />);
    await settle();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem("gmail-connect-retry")).toBeNull();
  });
  test("malformed finish input fails native validation before any Finish request", async () => {
    const attempt = {
      attemptId: "attempt",
      status: "awaiting_finish",
      clientRequestId: "a".repeat(64),
      accountId: null,
      expiresAt: Date.now() + 60_000,
    };
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        calls.push(url);
        return Response.json(
          url.endsWith("/status")
            ? { ...status(), attempt }
            : { attemptId: "attempt", status: "awaiting_finish" },
        );
      }),
    );
    render(<GmailPage client={client} />);
    await settle();
    const input = screen.getByRole("textbox", {
      name: "Finish code",
    }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "wrong" } });
    fireEvent.submit(input.closest("form")!);
    await settle();
    expect(input.validity.valid).toBe(false);
    expect(screen.getByText(/Enter the 64-character finish code/)).toBeTruthy();
    expect(calls.some((url) => url.endsWith("/finish"))).toBe(false);
  });
});

describe("gmail_page_post and gmail_check_status", () => {
  test("refreshes once on 401, then uses the new token", async () => {
    const headers: unknown[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        headers.push(init.headers);
        return headers.length === 1
          ? Response.json({ code: "press_access_changed" }, { status: 401 })
          : Response.json(status());
      }),
    );
    expect(
      await gmail_page_post(client, "/page/status", {}, gmail_status_response),
    ).toEqual(status());
    expect(client.refreshToken).toHaveBeenCalledTimes(1);
    expect(headers[1]).toMatchObject({ Authorization: "Bearer plu_new" });
  });
  test("validates every consumed status field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ ...status(), canWrite: "yes" })),
    );
    await expect(
      gmail_page_post(client, "/page/status", {}, gmail_status_response),
    ).rejects.toThrow("service_unavailable");
  });
  test("freshness comes only from the saved completed-history time", () => {
    expect(gmail_check_status(null, Date.now())).toBe("unchecked");
    expect(gmail_check_status(Date.now() - 600_000, Date.now())).toBe("recent");
    expect(gmail_check_status(Date.now() - 600_001, Date.now())).toBe(
      "delayed",
    );
  });
});
