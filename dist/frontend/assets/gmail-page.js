import { n as e } from "./rolldown-runtime.js";
import { r as t, t as n } from "./react.js";
import { o as r } from "./zod.js";
import {
  a as i,
  c as a,
  i as o,
  n as s,
  o as c,
  r as l,
  s as u,
  t as d,
} from "./gmail-api.js";
var f = e(t(), 1),
  p = n(),
  m = `gmail-connect-retry`,
  h = r({});
function g() {
  return [...crypto.getRandomValues(new Uint8Array(32))]
    .map((e) => e.toString(16).padStart(2, `0`))
    .join(``);
}
function _(e) {
  return e === null ? `—` : new Date(e).toLocaleString();
}
function v({ client: e }) {
  let [t, n] = (0, f.useState)(null),
    [r, v] = (0, f.useState)(`loading`),
    [y, b] = (0, f.useState)(null),
    [x, S] = (0, f.useState)(!1),
    [C, w] = (0, f.useState)(null),
    [T, E] = (0, f.useState)(``),
    [D, O] = (0, f.useState)(``),
    [k, A] = (0, f.useState)(null),
    [j, M] = (0, f.useState)(null),
    [N, P] = (0, f.useState)(Date.now()),
    [F, I] = (0, f.useState)(null),
    L = (0, f.useId)(),
    R = (0, f.useRef)(null),
    z = (0, f.useRef)(!1),
    B = (0, f.useRef)(!1),
    V = (0, f.useRef)(new Set()),
    H = (0, f.useRef)(!1),
    U = (0, f.useRef)(0);
  function W(e) {
    ((R.current = e),
      e
        ? sessionStorage.setItem(m, JSON.stringify(e))
        : (sessionStorage.removeItem(m), w(null), E(``), I(null), O(``)));
  }
  let G = (0, f.useCallback)(async () => {
    if (B.current) return;
    B.current = !0;
    let t = U.current;
    try {
      let r = await i(e, `/page/status`, { cursor: k }, a);
      if (!H.current || t !== U.current) return;
      if ((n(r), v(`ready`), P(Date.now()), !z.current)) {
        z.current = !0;
        let t = null;
        try {
          let e = c.safeParse(JSON.parse(sessionStorage.getItem(m) ?? `null`));
          e.success && (t = e.data);
        } catch {}
        if (
          ((t &&
            Object.entries(r.binding).every(([e, n]) => t.binding[e] === n)) ||
            (t = null),
          r.attempt
            ? (t = {
                binding: r.binding,
                clientRequestId: r.attempt.clientRequestId,
                accountId: r.attempt.accountId,
                attemptId: r.attempt.attemptId,
                purpose: r.attempt.purpose,
              })
            : t?.attemptId && (t = null),
          W(t),
          t && r.canWrite)
        )
          try {
            let n = await i(
              e,
              `/page/connect/start`,
              {
                clientRequestId: t.clientRequestId,
                accountId: t.accountId,
                purpose: t.purpose,
              },
              u,
            );
            H.current &&
              (W({ ...t, attemptId: n.attemptId }), w(n.consentUrl ?? null));
          } catch (e) {
            H.current && b(l(e));
          }
      } else if (r.attempt && R.current?.attemptId !== r.attempt.attemptId) {
        let t = {
          binding: r.binding,
          clientRequestId: r.attempt.clientRequestId,
          accountId: r.attempt.accountId,
          attemptId: r.attempt.attemptId,
          purpose: r.attempt.purpose,
        };
        if ((W(t), r.canWrite))
          try {
            let n = await i(
              e,
              `/page/connect/start`,
              {
                clientRequestId: t.clientRequestId,
                accountId: t.accountId,
                purpose: t.purpose,
              },
              u,
            );
            H.current && w(n.consentUrl ?? null);
          } catch (e) {
            H.current && b(l(e));
          }
      } else !r.attempt && R.current?.attemptId && W(null);
      for (let t of r.accounts) {
        let n = `${t.accountId}:${t.connectionGeneration}`;
        if (t.canRepair && !V.current.has(n)) {
          V.current.add(n);
          try {
            await i(
              e,
              `/page/press-repair`,
              {
                accountId: t.accountId,
                expectedGeneration: t.connectionGeneration,
                clientRequestId: g(),
              },
              h,
            );
          } catch (e) {
            H.current && b(l(e));
          }
        }
      }
    } catch {
      H.current && v(`unavailable`);
    } finally {
      ((B.current = !1),
        H.current &&
          document.visibilityState === `visible` &&
          t !== U.current &&
          G());
    }
  }, [e, k]);
  (0, f.useEffect)(() => {
    H.current = !0;
    let e = null;
    function t() {
      (U.current++,
        e !== null && (clearInterval(e), (e = null)),
        document.visibilityState === `visible` &&
          (v(`loading`),
          P(Date.now()),
          G(),
          (e = setInterval(() => {
            document.visibilityState === `visible` && G();
          }, 5e3))));
    }
    return (
      t(),
      document.addEventListener(`visibilitychange`, t),
      () => {
        ((H.current = !1),
          U.current++,
          e !== null && clearInterval(e),
          document.removeEventListener(`visibilitychange`, t));
      }
    );
  }, [G]);
  async function K(e) {
    (S(!0), b(null));
    try {
      (await e(), await G());
    } catch (e) {
      (b(l(e)),
        e instanceof d &&
          [
            `start_again`,
            `attempt_expired`,
            `choose_reconnect`,
            `gmail_account_changed`,
          ].includes(e.code) &&
          W(null));
    } finally {
      S(!1);
    }
  }
  async function q(n, r) {
    if (!t) return;
    let a = {
      binding: t.binding,
      clientRequestId: g(),
      accountId: n,
      attemptId: null,
      purpose: r,
    };
    W(a);
    let o = await i(
      e,
      `/page/connect/start`,
      { clientRequestId: a.clientRequestId, accountId: n, purpose: r },
      u,
    );
    (W({ ...a, attemptId: o.attemptId }), w(o.consentUrl ?? null));
  }
  async function J() {
    try {
      (await navigator.clipboard.writeText(C), O(`Link copied`));
    } catch {
      O(`Select and copy the link below.`);
    }
  }
  let Y = t?.attempt;
  return (0, p.jsxs)(`main`, {
    className: `GmailPage`,
    "data-gmail-service-status": r,
    children: [
      (0, p.jsx)(`h1`, { children: `Gmail` }),
      (0, p.jsx)(`p`, {
        children: `Save sent and received emails in Files. People with file access can read them.`,
      }),
      y &&
        r === `ready` &&
        (0, p.jsx)(`p`, {
          role: `alert`,
          className: `GmailError`,
          children: y,
        }),
      r === `ready`
        ? t &&
          (0, p.jsxs)(p.Fragment, {
            children: [
              !t.canWrite &&
                (0, p.jsx)(`p`, {
                  children: `You can view this page. Write access is needed to change a connection.`,
                }),
              !Y &&
                (0, p.jsx)(`button`, {
                  disabled: x || !t.canWrite,
                  onClick: () => void K(() => q(null, `connect`)),
                  children: `Connect Gmail`,
                }),
              Y &&
                (0, p.jsxs)(`section`, {
                  className: `GmailCard`,
                  "data-gmail-connect-status": Y.status,
                  children: [
                    (0, p.jsx)(`h2`, {
                      children:
                        Y.purpose === `compose`
                          ? `Allow drafts and Send`
                          : `Connect Gmail`,
                    }),
                    (0, p.jsxs)(`p`, {
                      children: [
                        `Organization ID: `,
                        (0, p.jsx)(`code`, {
                          children: t.binding.organizationId,
                        }),
                        (0, p.jsx)(`br`, {}),
                        `Workspace ID: `,
                        (0, p.jsx)(`code`, { children: t.binding.workspaceId }),
                      ],
                    }),
                    (0, p.jsx)(`p`, {
                      children: `Open this link in a new tab. Allow access. Copy the finish code back here. Compare these IDs with the callback page.`,
                    }),
                    C
                      ? (0, p.jsxs)(p.Fragment, {
                          children: [
                            (0, p.jsx)(`button`, {
                              onClick: () => void J(),
                              children: `Copy link`,
                            }),
                            (0, p.jsx)(`p`, {
                              className: `GmailLink`,
                              children: C,
                            }),
                          ],
                        })
                      : (0, p.jsxs)(p.Fragment, {
                          children: [
                            (0, p.jsx)(`p`, {
                              role: `status`,
                              children:
                                Y.status === `awaiting_finish`
                                  ? `Google confirmed the account. Paste the finish code below.`
                                  : `Preparing the Google link…`,
                            }),
                            Y.status !== `awaiting_finish` &&
                              (0, p.jsx)(`button`, {
                                disabled: x || !t.canWrite,
                                onClick: () =>
                                  void K(async () => {
                                    let t = await i(
                                      e,
                                      `/page/connect/start`,
                                      {
                                        clientRequestId: Y.clientRequestId,
                                        accountId: Y.accountId,
                                        purpose: Y.purpose,
                                      },
                                      u,
                                    );
                                    w(t.consentUrl ?? null);
                                  }),
                                children: `Retry connection link`,
                              }),
                          ],
                        }),
                    D && (0, p.jsx)(`p`, { role: `status`, children: D }),
                    (0, p.jsxs)(`form`, {
                      noValidate: !0,
                      onSubmit: (t) => {
                        if (
                          (t.preventDefault(), !t.currentTarget.checkValidity())
                        ) {
                          I(
                            `Enter the 64-character finish code from the callback page.`,
                          );
                          return;
                        }
                        K(async () => {
                          (await i(
                            e,
                            `/page/connect/finish`,
                            { attemptId: Y.attemptId, finishCode: T },
                            h,
                          ),
                            W(null));
                        });
                      },
                      children: [
                        (0, p.jsx)(`label`, {
                          htmlFor: L,
                          children: `Finish code`,
                        }),
                        (0, p.jsx)(`input`, {
                          id: L,
                          value: T,
                          onChange: (e) => {
                            (E(e.target.value.trim()), I(null));
                          },
                          required: !0,
                          pattern: `[0-9a-f]{64}`,
                          minLength: 64,
                          maxLength: 64,
                          autoComplete: `off`,
                          spellCheck: !1,
                        }),
                        F && (0, p.jsx)(`p`, { role: `alert`, children: F }),
                        (0, p.jsxs)(`div`, {
                          className: `GmailActions`,
                          children: [
                            (0, p.jsx)(`button`, {
                              type: `submit`,
                              disabled: x || !t.canWrite,
                              children: `Finish connection`,
                            }),
                            (0, p.jsx)(`button`, {
                              type: `button`,
                              disabled: x || !t.canWrite,
                              onClick: () =>
                                void K(async () => {
                                  (await i(
                                    e,
                                    `/page/connect/cancel`,
                                    { attemptId: Y.attemptId },
                                    h,
                                  ),
                                    W(null));
                                }),
                              children: `Cancel connection`,
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, p.jsxs)(`p`, {
                      children: [
                        `Expires at `,
                        _(Y.expiresAt),
                        `. Do not share the finish code.`,
                      ],
                    }),
                  ],
                }),
              t.accounts.map((n) => {
                let r = s(n.lastSyncedAt, N),
                  a = {
                    accountId: n.accountId,
                    expectedGeneration: n.connectionGeneration,
                  },
                  c = n.ledgerCounts.permissionHeld,
                  l = n.syncStatus === `blocked` || n.syncStatus === `error`;
                return (0, p.jsxs)(
                  `section`,
                  {
                    className: `GmailCard`,
                    "data-gmail-sync-status": n.syncStatus,
                    "data-gmail-check-status": r,
                    "data-gmail-files-status": c ? `write_refused` : `normal`,
                    children: [
                      (0, p.jsx)(`h2`, { children: n.emailAddress }),
                      (0, p.jsxs)(`p`, {
                        children: [
                          `Destination: `,
                          (0, p.jsx)(`code`, { children: n.destinationPath }),
                        ],
                      }),
                      (0, p.jsx)(`p`, {
                        role: `status`,
                        children:
                          n.syncStatus === `disconnected`
                            ? `Disconnected`
                            : l && !n.pressReady
                              ? `Press connection needs attention`
                              : n.pressReady
                                ? n.backfillComplete
                                  ? `${n.messagesSynced} emails saved`
                                  : `Backfilling… ${n.messagesSynced} emails saved`
                                : `Finishing Press connection`,
                      }),
                      (0, p.jsxs)(`p`, {
                        children: [
                          n.messagesSkipped,
                          ` skipped.`,
                          ` `,
                          n.ledgerCounts.pending + n.ledgerCounts.failed,
                          ` `,
                          `unfinished. `,
                          n.ledgerCounts.given_up,
                          ` failed.`,
                        ],
                      }),
                      (0, p.jsxs)(`p`, {
                        children: [
                          r === `unchecked`
                            ? `No mail check completed yet`
                            : r === `delayed`
                              ? `Sync is delayed`
                              : !l &&
                                  n.pressReady &&
                                  n.syncStatus !== `disconnected` &&
                                  !c
                                ? `Checking for new mail`
                                : `Last completed mail check`,
                          n.lastSyncedAt !== null &&
                            (0, p.jsxs)(p.Fragment, {
                              children: [`: `, _(n.lastSyncedAt)],
                            }),
                        ],
                      }),
                      c > 0 &&
                        (0, p.jsxs)(`p`, {
                          className: `GmailAttention`,
                          children: [
                            `Some saves were refused by Files. `,
                            c,
                            ` emails are waiting for access. Check the connecting member and Gmail service account Can write on the workspace, destination and restricted folders. Permission retries are limited while access is refused.`,
                            n.nextPermissionRetryAt !== null &&
                              (0, p.jsxs)(p.Fragment, {
                                children: [
                                  ` `,
                                  `Next permission retry:`,
                                  ` `,
                                  _(n.nextPermissionRetryAt),
                                  `.`,
                                ],
                              }),
                          ],
                        }),
                      n.attachmentsSkippedReason &&
                        (0, p.jsxs)(`p`, {
                          children: [
                            `Some attachments were not saved because of the workspace`,
                            ` `,
                            n.attachmentsSkippedReason === `plan`
                              ? `plan`
                              : `storage limit`,
                            `. New emails will check again.`,
                          ],
                        }),
                      n.ledgerCounts.emailAssumed > 0 &&
                        (0, p.jsxs)(`p`, {
                          children: [
                            n.ledgerCounts.emailAssumed,
                            ` email saves were assumed because the path already existed.`,
                          ],
                        }),
                      n.syncStatus !== `disconnected` &&
                        (0, p.jsxs)(`p`, {
                          "data-gmail-compose-status": n.canCompose
                            ? `on`
                            : `off`,
                          children: [
                            `Drafts and Send: `,
                            n.canCompose ? `on` : `off`,
                            `.`,
                            !n.isComposer &&
                              ` Only the member who connected ${n.emailAddress} can write drafts for it.`,
                          ],
                        }),
                      n.sourceError === `google_revoked` &&
                        (0, p.jsx)(`p`, {
                          children: `Google access stopped. Reconnect Gmail.`,
                        }),
                      [`gmail_request`, `history_response_too_large`].includes(
                        n.sourceError ?? ``,
                      ) &&
                        (0, p.jsx)(`p`, {
                          children: `Gmail could not complete a request. Retry sync or ask the operator to check the source limit.`,
                        }),
                      n.syncError === `credits` &&
                        (0, p.jsx)(`p`, {
                          children: `Add credits in Billing.`,
                        }),
                      n.canRepair &&
                        (0, p.jsx)(`p`, {
                          children: `Press access needs repair.`,
                        }),
                      n.syncError === `actor_lost` &&
                        (0, p.jsx)(`p`, {
                          children: `The connecting member lost write access. A writer must reconnect Gmail.`,
                        }),
                      [
                        `press_temporary`,
                        `gmail_temporary`,
                        `sync_error`,
                        `credits`,
                      ].includes(n.syncError ?? ``) &&
                        n.nextSyncAt !== null &&
                        (0, p.jsxs)(`p`, {
                          children: [`Retrying at `, _(n.nextSyncAt), `.`],
                        }),
                      (0, p.jsxs)(`div`, {
                        className: `GmailActions`,
                        children: [
                          (n.needsReconnect ||
                            n.syncStatus === `disconnected`) &&
                            (0, p.jsx)(`button`, {
                              disabled: x || !t.canWrite || !!Y,
                              onClick: () =>
                                void K(() => q(n.accountId, `connect`)),
                              children: `Reconnect Gmail`,
                            }),
                          n.isComposer &&
                            !n.canCompose &&
                            !n.needsReconnect &&
                            n.syncStatus !== `disconnected` &&
                            (0, p.jsx)(`button`, {
                              disabled: x || !t.canWrite || !!Y,
                              onClick: () =>
                                void K(() => q(n.accountId, `compose`)),
                              children: `Allow drafts and Send`,
                            }),
                          n.canRepair &&
                            (0, p.jsx)(`button`, {
                              disabled: x,
                              onClick: () =>
                                void K(async () => {
                                  await i(
                                    e,
                                    `/page/press-repair`,
                                    { ...a, clientRequestId: g() },
                                    h,
                                  );
                                }),
                              children: `Repair Press access`,
                            }),
                          n.sourceError !== `google_revoked` &&
                            n.sourceError !== null &&
                            (0, p.jsx)(`button`, {
                              disabled: x || !t.canWrite,
                              onClick: () =>
                                void K(async () => {
                                  await i(e, `/page/retry-sync`, a, h);
                                }),
                              children: `Retry sync`,
                            }),
                          n.ledgerCounts.given_up > 0 &&
                            (0, p.jsxs)(p.Fragment, {
                              children: [
                                (0, p.jsx)(`button`, {
                                  disabled: x,
                                  onClick: () =>
                                    void K(async () => {
                                      M({
                                        accountId: n.accountId,
                                        page: await i(
                                          e,
                                          `/page/failures`,
                                          { accountId: n.accountId },
                                          o,
                                        ),
                                      });
                                    }),
                                  children: `View failed emails`,
                                }),
                                (0, p.jsx)(`button`, {
                                  disabled:
                                    x ||
                                    !t.canWrite ||
                                    n.syncStatus === `disconnected`,
                                  onClick: () =>
                                    void K(async () => {
                                      await i(e, `/page/retry-failed`, a, h);
                                    }),
                                  children: `Retry failed emails`,
                                }),
                              ],
                            }),
                          n.syncStatus !== `disconnected` &&
                            (0, p.jsx)(`button`, {
                              disabled: x || !t.canWrite,
                              onClick: () =>
                                void K(async () => {
                                  (await i(e, `/page/disconnect`, a, h),
                                    W(null));
                                }),
                              children: `Disconnect`,
                            }),
                        ],
                      }),
                      j?.accountId === n.accountId &&
                        (0, p.jsxs)(`div`, {
                          children: [
                            (0, p.jsx)(`ul`, {
                              children: j.page.items.map((e) =>
                                (0, p.jsxs)(
                                  `li`,
                                  {
                                    children: [
                                      (0, p.jsx)(`code`, {
                                        children: e.gmailMessageId,
                                      }),
                                      `:`,
                                      ` `,
                                      e.reasonCode,
                                    ],
                                  },
                                  e.gmailMessageId,
                                ),
                              ),
                            }),
                            j.page.cursor &&
                              (0, p.jsx)(`button`, {
                                disabled: x,
                                onClick: () =>
                                  void K(async () => {
                                    M({
                                      accountId: n.accountId,
                                      page: await i(
                                        e,
                                        `/page/failures`,
                                        {
                                          accountId: n.accountId,
                                          cursor: j.page.cursor,
                                        },
                                        o,
                                      ),
                                    });
                                  }),
                                children: `More failed emails`,
                              }),
                          ],
                        }),
                    ],
                  },
                  n.accountId,
                );
              }),
              (0, p.jsxs)(`div`, {
                className: `GmailActions`,
                children: [
                  k !== null &&
                    (0, p.jsx)(`button`, {
                      disabled: x,
                      onClick: () => A(null),
                      children: `First accounts`,
                    }),
                  t.cursor !== null &&
                    (0, p.jsx)(`button`, {
                      disabled: x,
                      onClick: () => A(t.cursor),
                      children: `More accounts`,
                    }),
                ],
              }),
              (0, p.jsx)(`p`, {
                className: `GmailLimits`,
                children: `Bodies are limited to 2 MiB and may be shortened. Up to 16 attachments per email, each up to 32 MiB. Attachments use the workspace upload plan and credits.`,
              }),
              (0, p.jsx)(`p`, {
                children: `Disconnect Gmail before uninstalling this plugin. This clears its saved Gmail access. Files stay. Removing the app in Google Account Security stops all its workspace connections.`,
              }),
            ],
          })
        : (0, p.jsxs)(`section`, {
            children: [
              (0, p.jsx)(`p`, {
                role: `status`,
                children:
                  r === `loading`
                    ? `Loading Gmail status…`
                    : `Gmail service is unavailable. Retry or ask the operator to check Convex.`,
              }),
              r === `unavailable` &&
                (0, p.jsx)(`button`, {
                  disabled: x,
                  onClick: () => void G(),
                  children: `Retry`,
                }),
            ],
          }),
    ],
  });
}
export { v as GmailPage };
