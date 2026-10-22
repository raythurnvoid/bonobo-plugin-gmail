import { n as e } from "./rolldown-runtime.js";
import { r as t, t as n } from "./react.js";
import { o as r } from "./zod.js";
import {
  a as i,
  c as a,
  i as o,
  l as s,
  n as c,
  o as l,
  r as u,
  s as d,
  t as f,
} from "./gmail-api.js";
var p = e(t(), 1),
  m = n(),
  h = `gmail-connect-retry`,
  g = r({}),
  ee = 5e3,
  _ = 6e4,
  v = 12e4;
function y(e) {
  return e === null ? `—` : new Date(e).toLocaleString();
}
function b({ client: e }) {
  let [t, n] = (0, p.useState)(null),
    [r, b] = (0, p.useState)(`loading`),
    [x, S] = (0, p.useState)(null),
    [C, w] = (0, p.useState)(!1),
    [T, E] = (0, p.useState)(null),
    [D, O] = (0, p.useState)(``),
    [k, A] = (0, p.useState)(``),
    [j, M] = (0, p.useState)(null),
    [N, P] = (0, p.useState)(null),
    [F, I] = (0, p.useState)(Date.now()),
    [L, R] = (0, p.useState)(null),
    z = (0, p.useId)(),
    B = (0, p.useRef)(null),
    V = (0, p.useRef)(!1),
    H = (0, p.useRef)(!1),
    U = (0, p.useRef)(new Set()),
    W = (0, p.useRef)(!1),
    G = (0, p.useRef)(0),
    K = (0, p.useRef)(0),
    q = (0, p.useRef)(!1),
    J = (0, p.useRef)(0);
  function Y(e) {
    ((B.current = e),
      e
        ? sessionStorage.setItem(h, JSON.stringify(e))
        : (sessionStorage.removeItem(h), E(null), O(``), R(null), A(``)));
  }
  let X = (0, p.useCallback)(async () => {
    if (H.current) return;
    ((H.current = !0), (K.current = Date.now()));
    let t = G.current;
    try {
      let r = await l(e, `/page/status`, { cursor: j }, s);
      if (!W.current || t !== G.current) return;
      if (
        (n(r),
        (q.current =
          r.attempt !== null ||
          r.accounts.some((e) => e.syncStatus === `backfilling`)),
        b(`ready`),
        I(Date.now()),
        !V.current)
      ) {
        V.current = !0;
        let t = null;
        try {
          let e = d.safeParse(JSON.parse(sessionStorage.getItem(h) ?? `null`));
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
          Y(t),
          t && r.canWrite)
        )
          try {
            let n = await l(
              e,
              `/page/connect/start`,
              {
                clientRequestId: t.clientRequestId,
                accountId: t.accountId,
                purpose: t.purpose,
              },
              a,
            );
            W.current &&
              (Y({ ...t, attemptId: n.attemptId }), E(n.consentUrl ?? null));
          } catch (e) {
            W.current && S(u(e));
          }
      } else if (r.attempt && B.current?.attemptId !== r.attempt.attemptId) {
        let t = {
          binding: r.binding,
          clientRequestId: r.attempt.clientRequestId,
          accountId: r.attempt.accountId,
          attemptId: r.attempt.attemptId,
          purpose: r.attempt.purpose,
        };
        if ((Y(t), r.canWrite))
          try {
            let n = await l(
              e,
              `/page/connect/start`,
              {
                clientRequestId: t.clientRequestId,
                accountId: t.accountId,
                purpose: t.purpose,
              },
              a,
            );
            W.current && E(n.consentUrl ?? null);
          } catch (e) {
            W.current && S(u(e));
          }
      } else !r.attempt && B.current?.attemptId && Y(null);
      for (let t of r.accounts) {
        let n = `${t.accountId}:${t.connectionGeneration}`;
        if (t.canRepair && !U.current.has(n)) {
          U.current.add(n);
          try {
            await l(
              e,
              `/page/press-repair`,
              {
                accountId: t.accountId,
                expectedGeneration: t.connectionGeneration,
                clientRequestId: i(),
              },
              g,
            );
          } catch (e) {
            W.current && S(u(e));
          }
        }
      }
    } catch {
      ((q.current = !0), W.current && b(`unavailable`));
    } finally {
      ((H.current = !1),
        W.current &&
          document.visibilityState === `visible` &&
          t !== G.current &&
          X());
    }
  }, [e, j]);
  (0, p.useEffect)(() => {
    W.current = !0;
    let e = null;
    function t() {
      (G.current++,
        e !== null && (clearInterval(e), (e = null)),
        document.visibilityState === `visible` &&
          (b(`loading`),
          I(Date.now()),
          X(),
          (e = setInterval(() => {
            document.visibilityState === `visible` &&
              (q.current ||
                Date.now() < J.current ||
                Date.now() - K.current >= _) &&
              X();
          }, ee))));
    }
    return (
      t(),
      document.addEventListener(`visibilitychange`, t),
      () => {
        ((W.current = !1),
          G.current++,
          e !== null && clearInterval(e),
          document.removeEventListener(`visibilitychange`, t));
      }
    );
  }, [X]);
  async function Z(e) {
    ((J.current = Date.now() + v), w(!0), S(null));
    try {
      (await e(), await X());
    } catch (e) {
      (S(u(e)),
        e instanceof f &&
          [
            `start_again`,
            `attempt_expired`,
            `choose_reconnect`,
            `gmail_account_changed`,
          ].includes(e.code) &&
          Y(null));
    } finally {
      w(!1);
    }
  }
  async function Q(n, r) {
    if (!t) return;
    let o = {
      binding: t.binding,
      clientRequestId: i(),
      accountId: n,
      attemptId: null,
      purpose: r,
    };
    Y(o);
    let s = await l(
      e,
      `/page/connect/start`,
      { clientRequestId: o.clientRequestId, accountId: n, purpose: r },
      a,
    );
    (Y({ ...o, attemptId: s.attemptId }), E(s.consentUrl ?? null));
  }
  async function te() {
    try {
      (await navigator.clipboard.writeText(T), A(`Link copied`));
    } catch {
      A(`Select and copy the link below.`);
    }
  }
  let $ = t?.attempt;
  return (0, m.jsxs)(`main`, {
    className: `GmailPage`,
    "data-gmail-service-status": r,
    children: [
      (0, m.jsx)(`h1`, { children: `Gmail` }),
      (0, m.jsx)(`p`, {
        children: `Save sent and received emails in Files. People with file access can read them.`,
      }),
      x &&
        r === `ready` &&
        (0, m.jsx)(`p`, {
          role: `alert`,
          className: `GmailError`,
          children: x,
        }),
      r === `ready`
        ? t &&
          (0, m.jsxs)(m.Fragment, {
            children: [
              !t.canWrite &&
                (0, m.jsx)(`p`, {
                  children: `You can view this page. Write access is needed to change a connection.`,
                }),
              !$ &&
                (0, m.jsx)(`button`, {
                  disabled: C || !t.canWrite,
                  onClick: () => void Z(() => Q(null, `connect`)),
                  children: `Connect Gmail`,
                }),
              $ &&
                (0, m.jsxs)(`section`, {
                  className: `GmailCard`,
                  "data-gmail-connect-status": $.status,
                  children: [
                    (0, m.jsx)(`h2`, {
                      children:
                        $.purpose === `compose`
                          ? `Allow drafts and Send`
                          : `Connect Gmail`,
                    }),
                    (0, m.jsxs)(`p`, {
                      children: [
                        `Organization ID: `,
                        (0, m.jsx)(`code`, {
                          children: t.binding.organizationId,
                        }),
                        (0, m.jsx)(`br`, {}),
                        `Workspace ID: `,
                        (0, m.jsx)(`code`, { children: t.binding.workspaceId }),
                      ],
                    }),
                    (0, m.jsx)(`p`, {
                      children: `Open this link in a new tab. Allow access. Copy the finish code back here. Compare these IDs with the callback page.`,
                    }),
                    T
                      ? (0, m.jsxs)(m.Fragment, {
                          children: [
                            (0, m.jsx)(`button`, {
                              onClick: () => void te(),
                              children: `Copy link`,
                            }),
                            (0, m.jsx)(`p`, {
                              className: `GmailLink`,
                              children: T,
                            }),
                          ],
                        })
                      : (0, m.jsxs)(m.Fragment, {
                          children: [
                            (0, m.jsx)(`p`, {
                              role: `status`,
                              children:
                                $.status === `awaiting_finish`
                                  ? `Google confirmed the account. Paste the finish code below.`
                                  : `Preparing the Google link…`,
                            }),
                            $.status !== `awaiting_finish` &&
                              (0, m.jsx)(`button`, {
                                disabled: C || !t.canWrite,
                                onClick: () =>
                                  void Z(async () => {
                                    let t = await l(
                                      e,
                                      `/page/connect/start`,
                                      {
                                        clientRequestId: $.clientRequestId,
                                        accountId: $.accountId,
                                        purpose: $.purpose,
                                      },
                                      a,
                                    );
                                    E(t.consentUrl ?? null);
                                  }),
                                children: `Retry connection link`,
                              }),
                          ],
                        }),
                    k && (0, m.jsx)(`p`, { role: `status`, children: k }),
                    (0, m.jsxs)(`form`, {
                      noValidate: !0,
                      onSubmit: (t) => {
                        (t.preventDefault(),
                          t.currentTarget.checkValidity()
                            ? Z(async () => {
                                (await l(
                                  e,
                                  `/page/connect/finish`,
                                  { attemptId: $.attemptId, finishCode: D },
                                  g,
                                ),
                                  Y(null));
                              })
                            : R(
                                `Enter the 64-character finish code from the callback page.`,
                              ));
                      },
                      children: [
                        (0, m.jsx)(`label`, {
                          htmlFor: z,
                          children: `Finish code`,
                        }),
                        (0, m.jsx)(`input`, {
                          id: z,
                          value: D,
                          onChange: (e) => {
                            (O(e.target.value.trim()), R(null));
                          },
                          required: !0,
                          pattern: `[0-9a-f]{64}`,
                          minLength: 64,
                          maxLength: 64,
                          autoComplete: `off`,
                          spellCheck: !1,
                        }),
                        L && (0, m.jsx)(`p`, { role: `alert`, children: L }),
                        (0, m.jsxs)(`div`, {
                          className: `GmailActions`,
                          children: [
                            (0, m.jsx)(`button`, {
                              type: `submit`,
                              disabled: C || !t.canWrite,
                              children: `Finish connection`,
                            }),
                            (0, m.jsx)(`button`, {
                              type: `button`,
                              disabled: C || !t.canWrite,
                              onClick: () =>
                                void Z(async () => {
                                  (await l(
                                    e,
                                    `/page/connect/cancel`,
                                    { attemptId: $.attemptId },
                                    g,
                                  ),
                                    Y(null));
                                }),
                              children: `Cancel connection`,
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, m.jsxs)(`p`, {
                      children: [
                        `Expires at `,
                        y($.expiresAt),
                        `. Do not share the finish code.`,
                      ],
                    }),
                  ],
                }),
              t.accounts.map((n) => {
                let r = c(n.lastSyncedAt, F, n.watchExpiresAt),
                  a = n.watchExpiresAt !== null && n.watchExpiresAt > F,
                  s = {
                    accountId: n.accountId,
                    expectedGeneration: n.connectionGeneration,
                  },
                  u = n.ledgerCounts.permissionHeld,
                  d = n.syncStatus === `blocked` || n.syncStatus === `error`;
                return (0, m.jsxs)(
                  `section`,
                  {
                    className: `GmailCard`,
                    "data-gmail-sync-status": n.syncStatus,
                    "data-gmail-check-status": r,
                    "data-gmail-files-status": u ? `write_refused` : `normal`,
                    "data-gmail-push": a ? `on` : `off`,
                    children: [
                      (0, m.jsx)(`h2`, { children: n.emailAddress }),
                      (0, m.jsxs)(`p`, {
                        children: [
                          `Destination: `,
                          (0, m.jsx)(`code`, { children: n.destinationPath }),
                        ],
                      }),
                      (0, m.jsx)(`p`, {
                        role: `status`,
                        children:
                          n.syncStatus === `disconnected`
                            ? `Disconnected`
                            : d && !n.pressReady
                              ? `Bonobo Senate connection needs attention`
                              : n.pressReady
                                ? n.backfillComplete
                                  ? `${n.messagesSynced} emails saved`
                                  : `Backfilling… ${n.messagesSynced} emails saved`
                                : `Finishing Bonobo Senate connection`,
                      }),
                      (0, m.jsxs)(`p`, {
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
                      (0, m.jsxs)(`p`, {
                        children: [
                          r === `unchecked`
                            ? `No mail check completed yet`
                            : r === `delayed`
                              ? `Sync is delayed`
                              : !d &&
                                  n.pressReady &&
                                  n.syncStatus !== `disconnected` &&
                                  !u
                                ? `Checking for new mail`
                                : `Last completed mail check`,
                          n.lastSyncedAt !== null &&
                            (0, m.jsxs)(m.Fragment, {
                              children: [`: `, y(n.lastSyncedAt)],
                            }),
                        ],
                      }),
                      a &&
                        n.syncStatus === `live` &&
                        (0, m.jsx)(`p`, {
                          children: `Gmail tells us about new mail, so it arrives within about a minute.`,
                        }),
                      u > 0 &&
                        (0, m.jsxs)(`p`, {
                          className: `GmailAttention`,
                          children: [
                            `Some saves were refused by Files. `,
                            u,
                            ` emails are waiting for access. Check the connecting member and Gmail service account Can write on the workspace, destination and restricted folders. Permission retries are limited while access is refused.`,
                            n.nextPermissionRetryAt !== null &&
                              (0, m.jsxs)(m.Fragment, {
                                children: [
                                  ` `,
                                  `Next permission retry:`,
                                  ` `,
                                  y(n.nextPermissionRetryAt),
                                  `.`,
                                ],
                              }),
                          ],
                        }),
                      n.attachmentsSkippedReason &&
                        (0, m.jsxs)(`p`, {
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
                        (0, m.jsxs)(`p`, {
                          children: [
                            n.ledgerCounts.emailAssumed,
                            ` email saves were assumed because the path already existed.`,
                          ],
                        }),
                      n.syncStatus !== `disconnected` &&
                        (0, m.jsxs)(`p`, {
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
                        (0, m.jsx)(`p`, {
                          children: `Google access stopped. Reconnect Gmail.`,
                        }),
                      [`gmail_request`, `history_response_too_large`].includes(
                        n.sourceError ?? ``,
                      ) &&
                        (0, m.jsx)(`p`, {
                          children: `Gmail could not complete a request. Retry sync or ask the operator to check the source limit.`,
                        }),
                      n.syncError === `credits` &&
                        (0, m.jsx)(`p`, {
                          children: `Add credits in Billing.`,
                        }),
                      n.canRepair &&
                        (0, m.jsx)(`p`, {
                          children: `Bonobo Senate access needs repair.`,
                        }),
                      n.syncError === `actor_lost` &&
                        (0, m.jsx)(`p`, {
                          children: `The connecting member lost write access. A writer must reconnect Gmail.`,
                        }),
                      [
                        `press_temporary`,
                        `gmail_temporary`,
                        `sync_error`,
                        `credits`,
                      ].includes(n.syncError ?? ``) &&
                        n.nextSyncAt !== null &&
                        (0, m.jsxs)(`p`, {
                          children: [`Retrying at `, y(n.nextSyncAt), `.`],
                        }),
                      (0, m.jsxs)(`div`, {
                        className: `GmailActions`,
                        children: [
                          (n.needsReconnect ||
                            n.syncStatus === `disconnected`) &&
                            (0, m.jsx)(`button`, {
                              disabled: C || !t.canWrite || !!$,
                              onClick: () =>
                                void Z(() => Q(n.accountId, `connect`)),
                              children: `Reconnect Gmail`,
                            }),
                          n.isComposer &&
                            !n.canCompose &&
                            !n.needsReconnect &&
                            n.syncStatus !== `disconnected` &&
                            (0, m.jsx)(`button`, {
                              disabled: C || !t.canWrite || !!$,
                              onClick: () =>
                                void Z(() => Q(n.accountId, `compose`)),
                              children: `Allow drafts and Send`,
                            }),
                          n.canRepair &&
                            (0, m.jsx)(`button`, {
                              disabled: C,
                              onClick: () =>
                                void Z(async () => {
                                  await l(
                                    e,
                                    `/page/press-repair`,
                                    { ...s, clientRequestId: i() },
                                    g,
                                  );
                                }),
                              children: `Repair Bonobo Senate access`,
                            }),
                          n.sourceError !== `google_revoked` &&
                            n.sourceError !== null &&
                            (0, m.jsx)(`button`, {
                              disabled: C || !t.canWrite,
                              onClick: () =>
                                void Z(async () => {
                                  await l(e, `/page/retry-sync`, s, g);
                                }),
                              children: `Retry sync`,
                            }),
                          n.ledgerCounts.given_up > 0 &&
                            (0, m.jsxs)(m.Fragment, {
                              children: [
                                (0, m.jsx)(`button`, {
                                  disabled: C,
                                  onClick: () =>
                                    void Z(async () => {
                                      P({
                                        accountId: n.accountId,
                                        page: await l(
                                          e,
                                          `/page/failures`,
                                          { accountId: n.accountId },
                                          o,
                                        ),
                                      });
                                    }),
                                  children: `View failed emails`,
                                }),
                                (0, m.jsx)(`button`, {
                                  disabled:
                                    C ||
                                    !t.canWrite ||
                                    n.syncStatus === `disconnected`,
                                  onClick: () =>
                                    void Z(async () => {
                                      await l(e, `/page/retry-failed`, s, g);
                                    }),
                                  children: `Retry failed emails`,
                                }),
                              ],
                            }),
                          n.syncStatus !== `disconnected` &&
                            (0, m.jsx)(`button`, {
                              disabled: C || !t.canWrite,
                              onClick: () =>
                                void Z(async () => {
                                  (await l(e, `/page/disconnect`, s, g),
                                    Y(null));
                                }),
                              children: `Disconnect`,
                            }),
                        ],
                      }),
                      N?.accountId === n.accountId &&
                        (0, m.jsxs)(`div`, {
                          children: [
                            (0, m.jsx)(`ul`, {
                              children: N.page.items.map((e) =>
                                (0, m.jsxs)(
                                  `li`,
                                  {
                                    children: [
                                      (0, m.jsx)(`code`, {
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
                            N.page.cursor &&
                              (0, m.jsx)(`button`, {
                                disabled: C,
                                onClick: () =>
                                  void Z(async () => {
                                    P({
                                      accountId: n.accountId,
                                      page: await l(
                                        e,
                                        `/page/failures`,
                                        {
                                          accountId: n.accountId,
                                          cursor: N.page.cursor,
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
              (0, m.jsxs)(`div`, {
                className: `GmailActions`,
                children: [
                  j !== null &&
                    (0, m.jsx)(`button`, {
                      disabled: C,
                      onClick: () => M(null),
                      children: `First accounts`,
                    }),
                  t.cursor !== null &&
                    (0, m.jsx)(`button`, {
                      disabled: C,
                      onClick: () => M(t.cursor),
                      children: `More accounts`,
                    }),
                ],
              }),
              (0, m.jsx)(`p`, {
                className: `GmailLimits`,
                children: `Bodies are limited to 2 MiB and may be shortened. Up to 16 attachments per email, each up to 32 MiB. Attachments use the workspace upload plan and credits.`,
              }),
              (0, m.jsx)(`p`, {
                children: `Disconnect Gmail before uninstalling this plugin. This clears its saved Gmail access. Files stay. Removing the app in Google Account Security stops all its workspace connections.`,
              }),
            ],
          })
        : (0, m.jsxs)(`section`, {
            children: [
              (0, m.jsx)(`p`, {
                role: `status`,
                children:
                  r === `loading`
                    ? `Loading Gmail status…`
                    : `Gmail service is unavailable. Retry or ask the operator to check Convex.`,
              }),
              r === `unavailable` &&
                (0, m.jsx)(`button`, {
                  disabled: C,
                  onClick: () => void X(),
                  children: `Retry`,
                }),
            ],
          }),
    ],
  });
}
export { b as GmailPage };
