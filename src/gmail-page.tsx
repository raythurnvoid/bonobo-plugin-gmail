import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { z } from "zod";
import {
  gmail_ApiError,
  gmail_check_status,
  gmail_error_message,
  gmail_failures_response,
  gmail_new_request_id,
  gmail_page_post,
  gmail_saved_start,
  gmail_start_response,
  gmail_status_response,
} from "./gmail-api";
import "./gmail.css";

const storageKey = "gmail-connect-retry";
const empty_response = z.object({});

/**
 * Read the status this often while something moves: a connect attempt is open, an account is
 * still backfilling, the member clicked a button in the last two minutes, or the last read failed.
 */
const STATUS_FAST_POLL_MS = 5000;

/**
 * Read the status this often when nothing moves. A sync runs at most once a minute, so a faster
 * read finds the same status.
 */
const STATUS_IDLE_POLL_MS = 60_000;

/**
 * After a button click, read at the fast rate for this long, so the result shows quickly.
 */
const FAST_POLL_AFTER_CLICK_MS = 2 * 60_000;

function time_label(value: number | null) {
  return value === null ? "—" : new Date(value).toLocaleString();
}

export function GmailPage({
  client,
}: {
  client: Pick<BonoboClient, "getToken" | "refreshToken">;
}) {
  const [status, setStatus] = useState<z.infer<
    typeof gmail_status_response
  > | null>(null);
  const [service, setService] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [consentUrl, setConsentUrl] = useState<string | null>(null);
  const [finishCode, setFinishCode] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [failures, setFailures] = useState<{
    accountId: string;
    page: z.infer<typeof gmail_failures_response>;
  } | null>(null);
  const [now, setNow] = useState(Date.now());
  const [inputError, setInputError] = useState<string | null>(null);
  const finishInputId = useId();
  const savedStart = useRef<z.infer<typeof gmail_saved_start> | null>(null);
  const recovered = useRef(false);
  const pollInFlight = useRef(false);
  const repaired = useRef(new Set<string>());
  const mounted = useRef(false);
  const visibilityEpoch = useRef(0);
  const lastPollAt = useRef(0);
  const statusMoving = useRef(false);
  const fastPollUntil = useRef(0);

  function keep_start(value: z.infer<typeof gmail_saved_start> | null) {
    savedStart.current = value;
    if (value) sessionStorage.setItem(storageKey, JSON.stringify(value));
    else {
      sessionStorage.removeItem(storageKey);
      setConsentUrl(null);
      setFinishCode("");
      setInputError(null);
      setCopyMessage("");
    }
  }

  const refresh = useCallback(async () => {
    if (pollInFlight.current) return;
    pollInFlight.current = true;
    lastPollAt.current = Date.now();
    const epoch = visibilityEpoch.current;
    try {
      const value = await gmail_page_post(
        client,
        "/page/status",
        { cursor },
        gmail_status_response,
      );
      if (!mounted.current || epoch !== visibilityEpoch.current) return;
      setStatus(value);
      statusMoving.current =
        value.attempt !== null ||
        value.accounts.some((account) => account.syncStatus === "backfilling");
      setService("ready");
      setNow(Date.now());
      if (!recovered.current) {
        recovered.current = true;
        let local: z.infer<typeof gmail_saved_start> | null = null;
        try {
          const parsed = gmail_saved_start.safeParse(
            JSON.parse(sessionStorage.getItem(storageKey) ?? "null"),
          );
          if (parsed.success) local = parsed.data;
        } catch {
          /* Invalid retry data is discarded. */
        }
        const bound =
          local &&
          Object.entries(value.binding).every(
            ([key, id]) =>
              local!.binding[key as keyof typeof value.binding] === id,
          );
        if (!bound) local = null;
        if (value.attempt)
          local = {
            binding: value.binding,
            clientRequestId: value.attempt.clientRequestId,
            accountId: value.attempt.accountId,
            attemptId: value.attempt.attemptId,
            purpose: value.attempt.purpose,
          };
        else if (local?.attemptId) local = null;
        keep_start(local);
        if (local && value.canWrite) {
          try {
            const result = await gmail_page_post(
              client,
              "/page/connect/start",
              {
                clientRequestId: local.clientRequestId,
                accountId: local.accountId,
                purpose: local.purpose,
              },
              gmail_start_response,
            );
            if (mounted.current) {
              keep_start({ ...local, attemptId: result.attemptId });
              setConsentUrl(result.consentUrl ?? null);
            }
          } catch (failure) {
            if (mounted.current) setError(gmail_error_message(failure));
          }
        }
      } else if (
        value.attempt &&
        savedStart.current?.attemptId !== value.attempt.attemptId
      ) {
        const local = {
          binding: value.binding,
          clientRequestId: value.attempt.clientRequestId,
          accountId: value.attempt.accountId,
          attemptId: value.attempt.attemptId,
          purpose: value.attempt.purpose,
        };
        keep_start(local);
        if (value.canWrite) {
          try {
            const result = await gmail_page_post(
              client,
              "/page/connect/start",
              {
                clientRequestId: local.clientRequestId,
                accountId: local.accountId,
                purpose: local.purpose,
              },
              gmail_start_response,
            );
            if (mounted.current) setConsentUrl(result.consentUrl ?? null);
          } catch (failure) {
            if (mounted.current) setError(gmail_error_message(failure));
          }
        }
      } else if (!value.attempt && savedStart.current?.attemptId)
        keep_start(null);
      for (const account of value.accounts) {
        const key = `${account.accountId}:${account.connectionGeneration}`;
        if (account.canRepair && !repaired.current.has(key)) {
          repaired.current.add(key);
          try {
            await gmail_page_post(
              client,
              "/page/press-repair",
              {
                accountId: account.accountId,
                expectedGeneration: account.connectionGeneration,
                clientRequestId: gmail_new_request_id(),
              },
              empty_response,
            );
          } catch (failure) {
            if (mounted.current) setError(gmail_error_message(failure));
          }
        }
      }
    } catch {
      // Retry a failed read at the fast rate, so the page leaves the unavailable state soon.
      statusMoving.current = true;
      if (mounted.current) setService("unavailable");
    } finally {
      pollInFlight.current = false;
      if (
        mounted.current &&
        document.visibilityState === "visible" &&
        epoch !== visibilityEpoch.current
      )
        void refresh();
    }
  }, [client, cursor]);

  useEffect(() => {
    mounted.current = true;
    let timer: ReturnType<typeof setInterval> | null = null;
    function visible() {
      visibilityEpoch.current++;
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
      if (document.visibilityState !== "visible") return;
      setService("loading");
      setNow(Date.now());
      void refresh();
      // Tick at the fast rate. Read the status at the idle rate when nothing moves.
      timer = setInterval(() => {
        if (document.visibilityState !== "visible") return;
        const fast =
          statusMoving.current || Date.now() < fastPollUntil.current;
        if (fast || Date.now() - lastPollAt.current >= STATUS_IDLE_POLL_MS)
          void refresh();
      }, STATUS_FAST_POLL_MS);
    }
    visible();
    document.addEventListener("visibilitychange", visible);
    return () => {
      mounted.current = false;
      visibilityEpoch.current++;
      if (timer !== null) clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refresh]);

  async function action(run: () => Promise<void>) {
    fastPollUntil.current = Date.now() + FAST_POLL_AFTER_CLICK_MS;
    setBusy(true);
    setError(null);
    try {
      await run();
      await refresh();
    } catch (failure) {
      setError(gmail_error_message(failure));
      if (
        failure instanceof gmail_ApiError &&
        [
          "start_again",
          "attempt_expired",
          "choose_reconnect",
          "gmail_account_changed",
        ].includes(failure.code)
      )
        keep_start(null);
    } finally {
      setBusy(false);
    }
  }

  async function start(
    accountId: string | null,
    purpose: "connect" | "compose",
  ) {
    if (!status) return;
    const local = {
      binding: status.binding,
      clientRequestId: gmail_new_request_id(),
      accountId,
      attemptId: null,
      purpose,
    };
    keep_start(local); // Save only bound retry IDs before the request can be lost.
    const result = await gmail_page_post(
      client,
      "/page/connect/start",
      { clientRequestId: local.clientRequestId, accountId, purpose },
      gmail_start_response,
    );
    keep_start({ ...local, attemptId: result.attemptId });
    setConsentUrl(result.consentUrl ?? null);
  }

  async function copy_link() {
    try {
      await navigator.clipboard.writeText(consentUrl!);
      setCopyMessage("Link copied");
    } catch {
      setCopyMessage("Select and copy the link below.");
    }
  }

  const attempt = status?.attempt;
  return (
    <main className="GmailPage" data-gmail-service-status={service}>
      <h1>Gmail</h1>
      <p>
        Save sent and received emails in Files. People with file access can read
        them.
      </p>
      {error && service === "ready" && (
        <p role="alert" className="GmailError">
          {error}
        </p>
      )}
      {service !== "ready" ? (
        <section>
          <p role="status">
            {service === "loading"
              ? "Loading Gmail status…"
              : "Gmail service is unavailable. Retry or ask the operator to check Convex."}
          </p>
          {service === "unavailable" && (
            <button disabled={busy} onClick={() => void refresh()}>
              Retry
            </button>
          )}
        </section>
      ) : (
        status && (
          <>
            {!status.canWrite && (
              <p>
                You can view this page. Write access is needed to change a
                connection.
              </p>
            )}
            {!attempt && (
              <button
                disabled={busy || !status.canWrite}
                onClick={() => void action(() => start(null, "connect"))}
              >
                Connect Gmail
              </button>
            )}
            {attempt && (
              <section
                className="GmailCard"
                data-gmail-connect-status={attempt.status}
              >
                <h2>
                  {attempt.purpose === "compose"
                    ? "Allow drafts and Send"
                    : "Connect Gmail"}
                </h2>
                <p>
                  Organization ID: <code>{status.binding.organizationId}</code>
                  <br />
                  Workspace ID: <code>{status.binding.workspaceId}</code>
                </p>
                <p>
                  Open this link in a new tab. Allow access. Copy the finish
                  code back here. Compare these IDs with the callback page.
                </p>
                {consentUrl ? (
                  <>
                    <button onClick={() => void copy_link()}>Copy link</button>
                    <p className="GmailLink">{consentUrl}</p>
                  </>
                ) : (
                  <>
                    <p role="status">
                      {attempt.status === "awaiting_finish"
                        ? "Google confirmed the account. Paste the finish code below."
                        : "Preparing the Google link…"}
                    </p>
                    {attempt.status !== "awaiting_finish" && (
                      <button
                        disabled={busy || !status.canWrite}
                        onClick={() =>
                          void action(async () => {
                            const result = await gmail_page_post(
                              client,
                              "/page/connect/start",
                              {
                                clientRequestId: attempt.clientRequestId,
                                accountId: attempt.accountId,
                                purpose: attempt.purpose,
                              },
                              gmail_start_response,
                            );
                            setConsentUrl(result.consentUrl ?? null);
                          })
                        }
                      >
                        Retry connection link
                      </button>
                    )}
                  </>
                )}
                {copyMessage && <p role="status">{copyMessage}</p>}
                <form
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!event.currentTarget.checkValidity()) {
                      setInputError(
                        "Enter the 64-character finish code from the callback page.",
                      );
                      return;
                    }
                    void action(async () => {
                      await gmail_page_post(
                        client,
                        "/page/connect/finish",
                        { attemptId: attempt.attemptId, finishCode },
                        empty_response,
                      );
                      keep_start(null);
                    });
                  }}
                >
                  <label htmlFor={finishInputId}>Finish code</label>
                  <input
                    id={finishInputId}
                    value={finishCode}
                    onChange={(event) => {
                      setFinishCode(event.target.value.trim());
                      setInputError(null);
                    }}
                    required
                    pattern="[0-9a-f]{64}"
                    minLength={64}
                    maxLength={64}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {inputError && <p role="alert">{inputError}</p>}
                  <div className="GmailActions">
                    <button type="submit" disabled={busy || !status.canWrite}>
                      Finish connection
                    </button>
                    <button
                      type="button"
                      disabled={busy || !status.canWrite}
                      onClick={() =>
                        void action(async () => {
                          await gmail_page_post(
                            client,
                            "/page/connect/cancel",
                            { attemptId: attempt.attemptId },
                            empty_response,
                          );
                          keep_start(null);
                        })
                      }
                    >
                      Cancel connection
                    </button>
                  </div>
                </form>
                <p>
                  Expires at {time_label(attempt.expiresAt)}. Do not share the
                  finish code.
                </p>
              </section>
            )}
            {status.accounts.map((account) => {
              const check = gmail_check_status(account.lastSyncedAt, now);
              const change = {
                accountId: account.accountId,
                expectedGeneration: account.connectionGeneration,
              };
              const held = account.ledgerCounts.permissionHeld;
              const paused =
                account.syncStatus === "blocked" ||
                account.syncStatus === "error";
              return (
                <section
                  key={account.accountId}
                  className="GmailCard"
                  data-gmail-sync-status={account.syncStatus}
                  data-gmail-check-status={check}
                  data-gmail-files-status={held ? "write_refused" : "normal"}
                >
                  <h2>{account.emailAddress}</h2>
                  <p>
                    Destination: <code>{account.destinationPath}</code>
                  </p>
                  <p role="status">
                    {account.syncStatus === "disconnected"
                      ? "Disconnected"
                      : paused && !account.pressReady
                        ? "Press connection needs attention"
                        : !account.pressReady
                          ? "Finishing Press connection"
                          : !account.backfillComplete
                            ? `Backfilling… ${account.messagesSynced} emails saved`
                            : `${account.messagesSynced} emails saved`}
                  </p>
                  <p>
                    {account.messagesSkipped} skipped.{" "}
                    {account.ledgerCounts.pending + account.ledgerCounts.failed}{" "}
                    unfinished. {account.ledgerCounts.given_up} failed.
                  </p>
                  <p>
                    {check === "unchecked"
                      ? "No mail check completed yet"
                      : check === "delayed"
                        ? "Sync is delayed"
                        : !paused &&
                            account.pressReady &&
                            account.syncStatus !== "disconnected" &&
                            !held
                          ? "Checking for new mail"
                          : "Last completed mail check"}
                    {account.lastSyncedAt !== null && (
                      <>: {time_label(account.lastSyncedAt)}</>
                    )}
                  </p>
                  {held > 0 && (
                    <p className="GmailAttention">
                      Some saves were refused by Files. {held} emails are
                      waiting for access. Check the connecting member and Gmail
                      service account Can write on the workspace, destination
                      and restricted folders. Permission retries are limited
                      while access is refused.
                      {account.nextPermissionRetryAt !== null && (
                        <>
                          {" "}
                          Next permission retry:{" "}
                          {time_label(account.nextPermissionRetryAt)}.
                        </>
                      )}
                    </p>
                  )}
                  {account.attachmentsSkippedReason && (
                    <p>
                      Some attachments were not saved because of the workspace{" "}
                      {account.attachmentsSkippedReason === "plan"
                        ? "plan"
                        : "storage limit"}
                      . New emails will check again.
                    </p>
                  )}
                  {account.ledgerCounts.emailAssumed > 0 && (
                    <p>
                      {account.ledgerCounts.emailAssumed} email saves were
                      assumed because the path already existed.
                    </p>
                  )}
                  {account.syncStatus !== "disconnected" && (
                    <p
                      data-gmail-compose-status={
                        account.canCompose ? "on" : "off"
                      }
                    >
                      Drafts and Send: {account.canCompose ? "on" : "off"}.
                      {!account.isComposer &&
                        ` Only the member who connected ${account.emailAddress} can write drafts for it.`}
                    </p>
                  )}
                  {account.sourceError === "google_revoked" && (
                    <p>Google access stopped. Reconnect Gmail.</p>
                  )}
                  {["gmail_request", "history_response_too_large"].includes(
                    account.sourceError ?? "",
                  ) && (
                    <p>
                      Gmail could not complete a request. Retry sync or ask the
                      operator to check the source limit.
                    </p>
                  )}
                  {account.syncError === "credits" && (
                    <p>Add credits in Billing.</p>
                  )}
                  {account.canRepair && <p>Press access needs repair.</p>}
                  {account.syncError === "actor_lost" && (
                    <p>
                      The connecting member lost write access. A writer must
                      reconnect Gmail.
                    </p>
                  )}
                  {[
                    "press_temporary",
                    "gmail_temporary",
                    "sync_error",
                    "credits",
                  ].includes(account.syncError ?? "") &&
                    account.nextSyncAt !== null && (
                      <p>Retrying at {time_label(account.nextSyncAt)}.</p>
                    )}
                  <div className="GmailActions">
                    {(account.needsReconnect ||
                      account.syncStatus === "disconnected") && (
                      <button
                        disabled={busy || !status.canWrite || !!attempt}
                        onClick={() =>
                          void action(() => start(account.accountId, "connect"))
                        }
                      >
                        Reconnect Gmail
                      </button>
                    )}
                    {account.isComposer &&
                      !account.canCompose &&
                      !account.needsReconnect &&
                      account.syncStatus !== "disconnected" && (
                        <button
                          disabled={busy || !status.canWrite || !!attempt}
                          onClick={() =>
                            void action(() =>
                              start(account.accountId, "compose"),
                            )
                          }
                        >
                          Allow drafts and Send
                        </button>
                      )}
                    {account.canRepair && (
                      <button
                        disabled={busy}
                        onClick={() =>
                          void action(async () => {
                            await gmail_page_post(
                              client,
                              "/page/press-repair",
                              { ...change, clientRequestId: gmail_new_request_id() },
                              empty_response,
                            );
                          })
                        }
                      >
                        Repair Press access
                      </button>
                    )}
                    {account.sourceError !== "google_revoked" &&
                      account.sourceError !== null && (
                        <button
                          disabled={busy || !status.canWrite}
                          onClick={() =>
                            void action(async () => {
                              await gmail_page_post(
                                client,
                                "/page/retry-sync",
                                change,
                                empty_response,
                              );
                            })
                          }
                        >
                          Retry sync
                        </button>
                      )}
                    {account.ledgerCounts.given_up > 0 && (
                      <>
                        <button
                          disabled={busy}
                          onClick={() =>
                            void action(async () => {
                              setFailures({
                                accountId: account.accountId,
                                page: await gmail_page_post(
                                  client,
                                  "/page/failures",
                                  { accountId: account.accountId },
                                  gmail_failures_response,
                                ),
                              });
                            })
                          }
                        >
                          View failed emails
                        </button>
                        <button
                          disabled={
                            busy ||
                            !status.canWrite ||
                            account.syncStatus === "disconnected"
                          }
                          onClick={() =>
                            void action(async () => {
                              await gmail_page_post(
                                client,
                                "/page/retry-failed",
                                change,
                                empty_response,
                              );
                            })
                          }
                        >
                          Retry failed emails
                        </button>
                      </>
                    )}
                    {account.syncStatus !== "disconnected" && (
                      <button
                        disabled={busy || !status.canWrite}
                        onClick={() =>
                          void action(async () => {
                            await gmail_page_post(
                              client,
                              "/page/disconnect",
                              change,
                              empty_response,
                            );
                            keep_start(null);
                          })
                        }
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                  {failures?.accountId === account.accountId && (
                    <div>
                      <ul>
                        {failures.page.items.map((item) => (
                          <li key={item.gmailMessageId}>
                            <code>{item.gmailMessageId}</code>:{" "}
                            {item.reasonCode}
                          </li>
                        ))}
                      </ul>
                      {failures.page.cursor && (
                        <button
                          disabled={busy}
                          onClick={() =>
                            void action(async () => {
                              setFailures({
                                accountId: account.accountId,
                                page: await gmail_page_post(
                                  client,
                                  "/page/failures",
                                  {
                                    accountId: account.accountId,
                                    cursor: failures.page.cursor,
                                  },
                                  gmail_failures_response,
                                ),
                              });
                            })
                          }
                        >
                          More failed emails
                        </button>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
            <div className="GmailActions">
              {cursor !== null && (
                <button disabled={busy} onClick={() => setCursor(null)}>
                  First accounts
                </button>
              )}
              {status.cursor !== null && (
                <button
                  disabled={busy}
                  onClick={() => setCursor(status.cursor)}
                >
                  More accounts
                </button>
              )}
            </div>
            <p className="GmailLimits">
              Bodies are limited to 2 MiB and may be shortened. Up to 16
              attachments per email, each up to 32 MiB. Attachments use the
              workspace upload plan and credits.
            </p>
            <p>
              Disconnect Gmail before uninstalling this plugin. This clears its
              saved Gmail access. Files stay. Removing the app in Google Account
              Security stops all its workspace connections.
            </p>
          </>
        )
      )}
    </main>
  );
}
