import { n as e } from "./rolldown-runtime.js";
import { r as t, t as n } from "./react.js";
import { s as r } from "./zod.js";
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
  u as ee,
} from "./gmail-api.js";
var p = e(t(), 1),
  m = n(),
  h = `gmail-connect-retry`,
  g = r({}),
  te = 5e3,
  ne = 6e4,
  re = 12e4;
function _(e) {
  return e === null ? `—` : new Date(e).toLocaleString();
}
function v({ client: e }) {
  let [t, n] = (0, p.useState)(null),
    [r, v] = (0, p.useState)(`loading`),
    [y, b] = (0, p.useState)(null),
    [x, S] = (0, p.useState)(!1),
    [C, w] = (0, p.useState)(null),
    [T, E] = (0, p.useState)(``),
    [D, O] = (0, p.useState)(``),
    [k, A] = (0, p.useState)(null),
    [j, M] = (0, p.useState)(null),
    [N, ie] = (0, p.useState)(Date.now()),
    [ae, P] = (0, p.useState)(null),
    [F, oe] = (0, p.useState)(`30`),
    I = (0, p.useId)(),
    L = (0, p.useId)(),
    R = (0, p.useRef)(null),
    z = (0, p.useRef)(!1),
    B = (0, p.useRef)(!1),
    V = (0, p.useRef)(new Set()),
    H = (0, p.useRef)(!1),
    U = (0, p.useRef)(0),
    W = (0, p.useRef)(0),
    G = (0, p.useRef)(!1),
    K = (0, p.useRef)(0);
  function q(e) {
    ((R.current = e),
      e
        ? sessionStorage.setItem(h, JSON.stringify(e))
        : (sessionStorage.removeItem(h), w(null), E(``), P(null), O(``)));
  }
  let J = (0, p.useCallback)(async () => {
    if (B.current) return;
    ((B.current = !0), (W.current = Date.now()));
    let t = U.current;
    try {
      let r = await l(e, `/page/status`, { cursor: k }, s);
      if (!H.current || t !== U.current) return;
      if (
        (n(r),
        (G.current =
          r.attempt !== null ||
          r.accounts.some((e) => e.syncStatus === `backfilling`)),
        v(`ready`),
        ie(Date.now()),
        !z.current)
      ) {
        z.current = !0;
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
                backfillDays: r.attempt.backfillDays,
              })
            : t?.attemptId && (t = null),
          q(t),
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
                backfillDays: t.backfillDays,
              },
              a,
            );
            H.current &&
              (q({ ...t, attemptId: n.attemptId }), w(n.consentUrl ?? null));
          } catch (e) {
            (H.current && b(u(e)),
              e instanceof f && e.code === `backfill_too_long` && q(null));
          }
      } else if (r.attempt && R.current?.attemptId !== r.attempt.attemptId) {
        let t = {
          binding: r.binding,
          clientRequestId: r.attempt.clientRequestId,
          accountId: r.attempt.accountId,
          attemptId: r.attempt.attemptId,
          purpose: r.attempt.purpose,
          backfillDays: r.attempt.backfillDays,
        };
        if ((q(t), r.canWrite))
          try {
            let n = await l(
              e,
              `/page/connect/start`,
              {
                clientRequestId: t.clientRequestId,
                accountId: t.accountId,
                purpose: t.purpose,
                backfillDays: t.backfillDays,
              },
              a,
            );
            H.current && w(n.consentUrl ?? null);
          } catch (e) {
            H.current && b(u(e));
          }
      } else !r.attempt && R.current?.attemptId && q(null);
      for (let t of r.accounts) {
        let n = `${t.accountId}:${t.connectionGeneration}`;
        if (t.canRepair && !V.current.has(n)) {
          V.current.add(n);
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
            H.current && b(u(e));
          }
        }
      }
    } catch {
      ((G.current = !0), H.current && v(`unavailable`));
    } finally {
      ((B.current = !1),
        H.current &&
          document.visibilityState === `visible` &&
          t !== U.current &&
          J());
    }
  }, [e, k]);
  (0, p.useEffect)(() => {
    H.current = !0;
    let e = null;
    function t() {
      (U.current++,
        e !== null && (clearInterval(e), (e = null)),
        document.visibilityState === `visible` &&
          (v(`loading`),
          ie(Date.now()),
          J(),
          (e = setInterval(() => {
            document.visibilityState === `visible` &&
              (G.current ||
                Date.now() < K.current ||
                Date.now() - W.current >= ne) &&
              J();
          }, te))));
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
  }, [J]);
  async function Y(e) {
    ((K.current = Date.now() + re), S(!0), b(null));
    try {
      (await e(), await J());
    } catch (e) {
      (b(u(e)),
        e instanceof f &&
          [
            `start_again`,
            `attempt_expired`,
            `choose_reconnect`,
            `gmail_account_changed`,
            `backfill_too_long`,
          ].includes(e.code) &&
          q(null));
    } finally {
      S(!1);
    }
  }
  async function X(n, r) {
    if (!t) return;
    let o = r === `connect` ? $ : null,
      s = {
        binding: t.binding,
        clientRequestId: i(),
        accountId: n,
        attemptId: null,
        purpose: r,
        backfillDays: o,
      };
    q(s);
    let c = await l(
      e,
      `/page/connect/start`,
      {
        clientRequestId: s.clientRequestId,
        accountId: n,
        purpose: r,
        backfillDays: o,
      },
      a,
    );
    (q({ ...s, attemptId: c.attemptId }), w(c.consentUrl ?? null));
  }
  async function se() {
    try {
      (await navigator.clipboard.writeText(C), O(`Link copied`));
    } catch {
      O(`Select and copy the link below.`);
    }
  }
  let Z = t?.attempt,
    Q = ee.filter((e) => !t?.backfillMaxDays || e <= t.backfillMaxDays),
    ce = t?.backfillMaxDays === null,
    $ =
      F === `all` && ce
        ? null
        : (Q.find((e) => String(e) === F) ?? Q[Q.length - 1]);
  return (0, m.jsxs)(`main`, {
    className: `GmailPage`,
    "data-gmail-service-status": r,
    children: [
      (0, m.jsx)(`h1`, { children: `Gmail` }),
      (0, m.jsx)(`p`, {
        children: `Save sent and received emails in Files. People with file access can read them.`,
      }),
      y &&
        r === `ready` &&
        (0, m.jsx)(`p`, {
          role: `alert`,
          className: `GmailError`,
          children: y,
        }),
      r === `ready`
        ? t &&
          (0, m.jsxs)(m.Fragment, {
            children: [
              !t.canWrite &&
                (0, m.jsx)(`p`, {
                  children: `You can view this page. Write access is needed to change a connection.`,
                }),
              !Z &&
                (0, m.jsxs)(m.Fragment, {
                  children: [
                    (0, m.jsxs)(`p`, {
                      children: [
                        (0, m.jsx)(`label`, {
                          htmlFor: L,
                          children: `Old mail to save `,
                        }),
                        (0, m.jsxs)(`select`, {
                          id: L,
                          value: $ === null ? `all` : String($),
                          disabled: x || !t.canWrite,
                          onChange: (e) => oe(e.target.value),
                          children: [
                            Q.map((e) =>
                              (0, m.jsx)(
                                `option`,
                                {
                                  value: String(e),
                                  children:
                                    e === 365 ? `Last year` : `Last ${e} days`,
                                },
                                e,
                              ),
                            ),
                            ce &&
                              (0, m.jsx)(`option`, {
                                value: `all`,
                                children: `All mail`,
                              }),
                          ],
                        }),
                        `. New mail is always saved. Connect and Reconnect use this choice.`,
                      ],
                    }),
                    (0, m.jsx)(`button`, {
                      disabled: x || !t.canWrite,
                      onClick: () => void Y(() => X(null, `connect`)),
                      children: `Connect Gmail`,
                    }),
                  ],
                }),
              Z &&
                (0, m.jsxs)(`section`, {
                  className: `GmailCard`,
                  "data-gmail-connect-status": Z.status,
                  children: [
                    (0, m.jsx)(`h2`, {
                      children:
                        Z.purpose === `compose`
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
                    C
                      ? (0, m.jsxs)(m.Fragment, {
                          children: [
                            (0, m.jsx)(`button`, {
                              onClick: () => void se(),
                              children: `Copy link`,
                            }),
                            (0, m.jsx)(`p`, {
                              className: `GmailLink`,
                              children: C,
                            }),
                          ],
                        })
                      : (0, m.jsxs)(m.Fragment, {
                          children: [
                            (0, m.jsx)(`p`, {
                              role: `status`,
                              children:
                                Z.status === `awaiting_finish`
                                  ? `Google confirmed the account. Paste the finish code below.`
                                  : `Preparing the Google link…`,
                            }),
                            Z.status !== `awaiting_finish` &&
                              (0, m.jsx)(`button`, {
                                disabled: x || !t.canWrite,
                                onClick: () =>
                                  void Y(async () => {
                                    let t = await l(
                                      e,
                                      `/page/connect/start`,
                                      {
                                        clientRequestId: Z.clientRequestId,
                                        accountId: Z.accountId,
                                        purpose: Z.purpose,
                                        backfillDays: Z.backfillDays,
                                      },
                                      a,
                                    );
                                    w(t.consentUrl ?? null);
                                  }),
                                children: `Retry connection link`,
                              }),
                          ],
                        }),
                    D && (0, m.jsx)(`p`, { role: `status`, children: D }),
                    (0, m.jsxs)(`form`, {
                      noValidate: !0,
                      onSubmit: (t) => {
                        (t.preventDefault(),
                          t.currentTarget.checkValidity()
                            ? Y(async () => {
                                (await l(
                                  e,
                                  `/page/connect/finish`,
                                  { attemptId: Z.attemptId, finishCode: T },
                                  g,
                                ),
                                  q(null));
                              })
                            : P(
                                `Enter the 64-character finish code from the callback page.`,
                              ));
                      },
                      children: [
                        (0, m.jsx)(`label`, {
                          htmlFor: I,
                          children: `Finish code`,
                        }),
                        (0, m.jsx)(`input`, {
                          id: I,
                          value: T,
                          onChange: (e) => {
                            (E(e.target.value.trim()), P(null));
                          },
                          required: !0,
                          pattern: `[0-9a-f]{64}`,
                          minLength: 64,
                          maxLength: 64,
                          autoComplete: `off`,
                          spellCheck: !1,
                        }),
                        ae && (0, m.jsx)(`p`, { role: `alert`, children: ae }),
                        (0, m.jsxs)(`div`, {
                          className: `GmailActions`,
                          children: [
                            (0, m.jsx)(`button`, {
                              type: `submit`,
                              disabled: x || !t.canWrite,
                              children: `Finish connection`,
                            }),
                            (0, m.jsx)(`button`, {
                              type: `button`,
                              disabled: x || !t.canWrite,
                              onClick: () =>
                                void Y(async () => {
                                  (await l(
                                    e,
                                    `/page/connect/cancel`,
                                    { attemptId: Z.attemptId },
                                    g,
                                  ),
                                    q(null));
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
                        _(Z.expiresAt),
                        `. Do not share the finish code.`,
                      ],
                    }),
                  ],
                }),
              t.accounts.map((n) => {
                let r = c(n.lastSyncedAt, N, n.watchExpiresAt),
                  a = n.watchExpiresAt !== null && n.watchExpiresAt > N,
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
                      (0, m.jsx)(`p`, {
                        "data-gmail-backfill-after": n.backfillAfter ?? `all`,
                        children:
                          n.backfillAfter === null
                            ? `Saves all old mail.`
                            : `Saves old mail since ${new Date(n.backfillAfter * 1e3).toLocaleDateString()}.`,
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
                              children: [`: `, _(n.lastSyncedAt)],
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
                                  _(n.nextPermissionRetryAt),
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
                          children: [`Retrying at `, _(n.nextSyncAt), `.`],
                        }),
                      (0, m.jsxs)(`div`, {
                        className: `GmailActions`,
                        children: [
                          (n.needsReconnect ||
                            n.syncStatus === `disconnected`) &&
                            (0, m.jsx)(`button`, {
                              disabled: x || !t.canWrite || !!Z,
                              onClick: () =>
                                void Y(() => X(n.accountId, `connect`)),
                              children: `Reconnect Gmail`,
                            }),
                          n.isComposer &&
                            !n.canCompose &&
                            !n.needsReconnect &&
                            n.syncStatus !== `disconnected` &&
                            (0, m.jsx)(`button`, {
                              disabled: x || !t.canWrite || !!Z,
                              onClick: () =>
                                void Y(() => X(n.accountId, `compose`)),
                              children: `Allow drafts and Send`,
                            }),
                          n.canRepair &&
                            (0, m.jsx)(`button`, {
                              disabled: x,
                              onClick: () =>
                                void Y(async () => {
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
                              disabled: x || !t.canWrite,
                              onClick: () =>
                                void Y(async () => {
                                  await l(e, `/page/retry-sync`, s, g);
                                }),
                              children: `Retry sync`,
                            }),
                          n.ledgerCounts.given_up > 0 &&
                            (0, m.jsxs)(m.Fragment, {
                              children: [
                                (0, m.jsx)(`button`, {
                                  disabled: x,
                                  onClick: () =>
                                    void Y(async () => {
                                      M({
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
                                    x ||
                                    !t.canWrite ||
                                    n.syncStatus === `disconnected`,
                                  onClick: () =>
                                    void Y(async () => {
                                      await l(e, `/page/retry-failed`, s, g);
                                    }),
                                  children: `Retry failed emails`,
                                }),
                              ],
                            }),
                          n.syncStatus !== `disconnected` &&
                            (0, m.jsx)(`button`, {
                              disabled: x || !t.canWrite,
                              onClick: () =>
                                void Y(async () => {
                                  (await l(e, `/page/disconnect`, s, g),
                                    q(null));
                                }),
                              children: `Disconnect`,
                            }),
                        ],
                      }),
                      j?.accountId === n.accountId &&
                        (0, m.jsxs)(`div`, {
                          children: [
                            (0, m.jsx)(`ul`, {
                              children: j.page.items.map((e) =>
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
                            j.page.cursor &&
                              (0, m.jsx)(`button`, {
                                disabled: x,
                                onClick: () =>
                                  void Y(async () => {
                                    M({
                                      accountId: n.accountId,
                                      page: await l(
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
              (0, m.jsxs)(`div`, {
                className: `GmailActions`,
                children: [
                  k !== null &&
                    (0, m.jsx)(`button`, {
                      disabled: x,
                      onClick: () => A(null),
                      children: `First accounts`,
                    }),
                  t.cursor !== null &&
                    (0, m.jsx)(`button`, {
                      disabled: x,
                      onClick: () => A(t.cursor),
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
                  disabled: x,
                  onClick: () => void J(),
                  children: `Retry`,
                }),
            ],
          }),
    ],
  });
}
export { v as GmailPage };
