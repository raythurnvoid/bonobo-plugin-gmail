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
  t as ee,
  u as te,
} from "./gmail-api.js";
var f = e(t(), 1),
  p = n(),
  m = `gmail-connect-retry`,
  h = r({}),
  ne = 5e3,
  re = 6e4,
  ie = 12e4;
function g(e) {
  return e === null ? `—` : new Date(e).toLocaleString();
}
function _({ client: e }) {
  let [t, n] = (0, f.useState)(null),
    [r, _] = (0, f.useState)(`loading`),
    [v, y] = (0, f.useState)(null),
    [b, ae] = (0, f.useState)(!1),
    [x, S] = (0, f.useState)(null),
    [C, w] = (0, f.useState)(``),
    [T, E] = (0, f.useState)(``),
    [D, O] = (0, f.useState)(null),
    [k, A] = (0, f.useState)(null),
    [j, M] = (0, f.useState)(Date.now()),
    [N, P] = (0, f.useState)(null),
    [F, oe] = (0, f.useState)(`30`),
    I = (0, f.useId)(),
    L = (0, f.useId)(),
    R = (0, f.useRef)(null),
    z = (0, f.useRef)(!1),
    B = (0, f.useRef)(!1),
    V = (0, f.useRef)(new Set()),
    H = (0, f.useRef)(!1),
    U = (0, f.useRef)(0),
    W = (0, f.useRef)(0),
    G = (0, f.useRef)(!1),
    K = (0, f.useRef)(0);
  function q(e) {
    ((R.current = e),
      e
        ? sessionStorage.setItem(m, JSON.stringify(e))
        : (sessionStorage.removeItem(m), S(null), w(``), P(null), E(``)));
  }
  let J = (0, f.useCallback)(async () => {
    if (B.current) return;
    ((B.current = !0), (W.current = Date.now()));
    let t = U.current;
    try {
      let r = await l(e, `/page/status`, { cursor: D }, s);
      if (!H.current || t !== U.current) return;
      if (
        (n(r),
        (G.current =
          r.attempt !== null ||
          r.accounts.some((e) => e.syncStatus === `backfilling`)),
        _(`ready`),
        M(Date.now()),
        !z.current)
      ) {
        z.current = !0;
        let t = null;
        try {
          let e = d.safeParse(JSON.parse(sessionStorage.getItem(m) ?? `null`));
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
              (q({ ...t, attemptId: n.attemptId }), S(n.consentUrl ?? null));
          } catch (e) {
            H.current && y(u(e));
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
            H.current && S(n.consentUrl ?? null);
          } catch (e) {
            H.current && y(u(e));
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
              h,
            );
          } catch (e) {
            H.current && y(u(e));
          }
        }
      }
    } catch {
      ((G.current = !0), H.current && _(`unavailable`));
    } finally {
      ((B.current = !1),
        H.current &&
          document.visibilityState === `visible` &&
          t !== U.current &&
          J());
    }
  }, [e, D]);
  (0, f.useEffect)(() => {
    H.current = !0;
    let e = null;
    function t() {
      (U.current++,
        e !== null && (clearInterval(e), (e = null)),
        document.visibilityState === `visible` &&
          (_(`loading`),
          M(Date.now()),
          J(),
          (e = setInterval(() => {
            document.visibilityState === `visible` &&
              (G.current ||
                Date.now() < K.current ||
                Date.now() - W.current >= re) &&
              J();
          }, ne))));
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
    ((K.current = Date.now() + ie), ae(!0), y(null));
    try {
      (await e(), await J());
    } catch (e) {
      (y(u(e)),
        e instanceof ee &&
          [
            `start_again`,
            `attempt_expired`,
            `choose_reconnect`,
            `gmail_account_changed`,
          ].includes(e.code) &&
          q(null));
    } finally {
      ae(!1);
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
    (q({ ...s, attemptId: c.attemptId }), S(c.consentUrl ?? null));
  }
  async function se() {
    try {
      (await navigator.clipboard.writeText(x), E(`Link copied`));
    } catch {
      E(`Select and copy the link below.`);
    }
  }
  let Z = t?.attempt,
    Q = te.filter((e) => !t?.backfillMaxDays || e <= t.backfillMaxDays),
    ce = t?.backfillMaxDays === null,
    $ =
      F === `all` && ce
        ? null
        : (Q.find((e) => String(e) === F) ?? Q[Q.length - 1]);
  return (0, p.jsxs)(`main`, {
    className: `GmailPage`,
    "data-gmail-service-status": r,
    children: [
      (0, p.jsx)(`h1`, { children: `Gmail` }),
      (0, p.jsx)(`p`, {
        children: `Save sent and received emails in Files. People with file access can read them.`,
      }),
      v &&
        r === `ready` &&
        (0, p.jsx)(`p`, {
          role: `alert`,
          className: `GmailError`,
          children: v,
        }),
      r === `ready`
        ? t &&
          (0, p.jsxs)(p.Fragment, {
            children: [
              !t.canWrite &&
                (0, p.jsx)(`p`, {
                  children: `You can view this page. Write access is needed to change a connection.`,
                }),
              !Z &&
                (0, p.jsxs)(p.Fragment, {
                  children: [
                    (0, p.jsxs)(`p`, {
                      children: [
                        (0, p.jsx)(`label`, {
                          htmlFor: L,
                          children: `Old mail to save `,
                        }),
                        (0, p.jsxs)(`select`, {
                          id: L,
                          value: $ === null ? `all` : String($),
                          disabled: b || !t.canWrite,
                          onChange: (e) => oe(e.target.value),
                          children: [
                            Q.map((e) =>
                              (0, p.jsx)(
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
                              (0, p.jsx)(`option`, {
                                value: `all`,
                                children: `All mail`,
                              }),
                          ],
                        }),
                        `. New mail is always saved. Connect and Reconnect use this choice.`,
                      ],
                    }),
                    (0, p.jsx)(`button`, {
                      disabled: b || !t.canWrite,
                      onClick: () => void Y(() => X(null, `connect`)),
                      children: `Connect Gmail`,
                    }),
                  ],
                }),
              Z &&
                (0, p.jsxs)(`section`, {
                  className: `GmailCard`,
                  "data-gmail-connect-status": Z.status,
                  children: [
                    (0, p.jsx)(`h2`, {
                      children:
                        Z.purpose === `compose`
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
                    x
                      ? (0, p.jsxs)(p.Fragment, {
                          children: [
                            (0, p.jsx)(`button`, {
                              onClick: () => void se(),
                              children: `Copy link`,
                            }),
                            (0, p.jsx)(`p`, {
                              className: `GmailLink`,
                              children: x,
                            }),
                          ],
                        })
                      : (0, p.jsxs)(p.Fragment, {
                          children: [
                            (0, p.jsx)(`p`, {
                              role: `status`,
                              children:
                                Z.status === `awaiting_finish`
                                  ? `Google confirmed the account. Paste the finish code below.`
                                  : `Preparing the Google link…`,
                            }),
                            Z.status !== `awaiting_finish` &&
                              (0, p.jsx)(`button`, {
                                disabled: b || !t.canWrite,
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
                                    S(t.consentUrl ?? null);
                                  }),
                                children: `Retry connection link`,
                              }),
                          ],
                        }),
                    T && (0, p.jsx)(`p`, { role: `status`, children: T }),
                    (0, p.jsxs)(`form`, {
                      noValidate: !0,
                      onSubmit: (t) => {
                        (t.preventDefault(),
                          t.currentTarget.checkValidity()
                            ? Y(async () => {
                                (await l(
                                  e,
                                  `/page/connect/finish`,
                                  { attemptId: Z.attemptId, finishCode: C },
                                  h,
                                ),
                                  q(null));
                              })
                            : P(
                                `Enter the 64-character finish code from the callback page.`,
                              ));
                      },
                      children: [
                        (0, p.jsx)(`label`, {
                          htmlFor: I,
                          children: `Finish code`,
                        }),
                        (0, p.jsx)(`input`, {
                          id: I,
                          value: C,
                          onChange: (e) => {
                            (w(e.target.value.trim()), P(null));
                          },
                          required: !0,
                          pattern: `[0-9a-f]{64}`,
                          minLength: 64,
                          maxLength: 64,
                          autoComplete: `off`,
                          spellCheck: !1,
                        }),
                        N && (0, p.jsx)(`p`, { role: `alert`, children: N }),
                        (0, p.jsxs)(`div`, {
                          className: `GmailActions`,
                          children: [
                            (0, p.jsx)(`button`, {
                              type: `submit`,
                              disabled: b || !t.canWrite,
                              children: `Finish connection`,
                            }),
                            (0, p.jsx)(`button`, {
                              type: `button`,
                              disabled: b || !t.canWrite,
                              onClick: () =>
                                void Y(async () => {
                                  (await l(
                                    e,
                                    `/page/connect/cancel`,
                                    { attemptId: Z.attemptId },
                                    h,
                                  ),
                                    q(null));
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
                        g(Z.expiresAt),
                        `. Do not share the finish code.`,
                      ],
                    }),
                  ],
                }),
              t.accounts.map((n) => {
                let r = c(n.lastSyncedAt, j, n.watchExpiresAt),
                  a = n.watchExpiresAt !== null && n.watchExpiresAt > j,
                  s = {
                    accountId: n.accountId,
                    expectedGeneration: n.connectionGeneration,
                  },
                  u = n.ledgerCounts.permissionHeld,
                  d = n.syncStatus === `blocked` || n.syncStatus === `error`;
                return (0, p.jsxs)(
                  `section`,
                  {
                    className: `GmailCard`,
                    "data-gmail-sync-status": n.syncStatus,
                    "data-gmail-check-status": r,
                    "data-gmail-files-status": u ? `write_refused` : `normal`,
                    "data-gmail-push": a ? `on` : `off`,
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
                            : d && !n.pressReady
                              ? `Bonobo Senate connection needs attention`
                              : n.pressReady
                                ? n.backfillComplete
                                  ? `${n.messagesSynced} emails saved`
                                  : `Backfilling… ${n.messagesSynced} emails saved`
                                : `Finishing Bonobo Senate connection`,
                      }),
                      (0, p.jsx)(`p`, {
                        "data-gmail-backfill-after": n.backfillAfter ?? `all`,
                        children:
                          n.backfillAfter === null
                            ? `Saves all old mail.`
                            : `Saves old mail since ${new Date(n.backfillAfter * 1e3).toLocaleDateString()}.`,
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
                              : !d &&
                                  n.pressReady &&
                                  n.syncStatus !== `disconnected` &&
                                  !u
                                ? `Checking for new mail`
                                : `Last completed mail check`,
                          n.lastSyncedAt !== null &&
                            (0, p.jsxs)(p.Fragment, {
                              children: [`: `, g(n.lastSyncedAt)],
                            }),
                        ],
                      }),
                      a &&
                        n.syncStatus === `live` &&
                        (0, p.jsx)(`p`, {
                          children: `Gmail tells us about new mail, so it arrives within about a minute.`,
                        }),
                      u > 0 &&
                        (0, p.jsxs)(`p`, {
                          className: `GmailAttention`,
                          children: [
                            `Some saves were refused by Files. `,
                            u,
                            ` emails are waiting for access. Check the connecting member and Gmail service account Can write on the workspace, destination and restricted folders. Permission retries are limited while access is refused.`,
                            n.nextPermissionRetryAt !== null &&
                              (0, p.jsxs)(p.Fragment, {
                                children: [
                                  ` `,
                                  `Next permission retry:`,
                                  ` `,
                                  g(n.nextPermissionRetryAt),
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
                          children: `Bonobo Senate access needs repair.`,
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
                          children: [`Retrying at `, g(n.nextSyncAt), `.`],
                        }),
                      (0, p.jsxs)(`div`, {
                        className: `GmailActions`,
                        children: [
                          (n.needsReconnect ||
                            n.syncStatus === `disconnected`) &&
                            (0, p.jsx)(`button`, {
                              disabled: b || !t.canWrite || !!Z,
                              onClick: () =>
                                void Y(() => X(n.accountId, `connect`)),
                              children: `Reconnect Gmail`,
                            }),
                          n.isComposer &&
                            !n.canCompose &&
                            !n.needsReconnect &&
                            n.syncStatus !== `disconnected` &&
                            (0, p.jsx)(`button`, {
                              disabled: b || !t.canWrite || !!Z,
                              onClick: () =>
                                void Y(() => X(n.accountId, `compose`)),
                              children: `Allow drafts and Send`,
                            }),
                          n.canRepair &&
                            (0, p.jsx)(`button`, {
                              disabled: b,
                              onClick: () =>
                                void Y(async () => {
                                  await l(
                                    e,
                                    `/page/press-repair`,
                                    { ...s, clientRequestId: i() },
                                    h,
                                  );
                                }),
                              children: `Repair Bonobo Senate access`,
                            }),
                          n.sourceError !== `google_revoked` &&
                            n.sourceError !== null &&
                            (0, p.jsx)(`button`, {
                              disabled: b || !t.canWrite,
                              onClick: () =>
                                void Y(async () => {
                                  await l(e, `/page/retry-sync`, s, h);
                                }),
                              children: `Retry sync`,
                            }),
                          n.ledgerCounts.given_up > 0 &&
                            (0, p.jsxs)(p.Fragment, {
                              children: [
                                (0, p.jsx)(`button`, {
                                  disabled: b,
                                  onClick: () =>
                                    void Y(async () => {
                                      A({
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
                                (0, p.jsx)(`button`, {
                                  disabled:
                                    b ||
                                    !t.canWrite ||
                                    n.syncStatus === `disconnected`,
                                  onClick: () =>
                                    void Y(async () => {
                                      await l(e, `/page/retry-failed`, s, h);
                                    }),
                                  children: `Retry failed emails`,
                                }),
                              ],
                            }),
                          n.syncStatus !== `disconnected` &&
                            (0, p.jsx)(`button`, {
                              disabled: b || !t.canWrite,
                              onClick: () =>
                                void Y(async () => {
                                  (await l(e, `/page/disconnect`, s, h),
                                    q(null));
                                }),
                              children: `Disconnect`,
                            }),
                        ],
                      }),
                      k?.accountId === n.accountId &&
                        (0, p.jsxs)(`div`, {
                          children: [
                            (0, p.jsx)(`ul`, {
                              children: k.page.items.map((e) =>
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
                            k.page.cursor &&
                              (0, p.jsx)(`button`, {
                                disabled: b,
                                onClick: () =>
                                  void Y(async () => {
                                    A({
                                      accountId: n.accountId,
                                      page: await l(
                                        e,
                                        `/page/failures`,
                                        {
                                          accountId: n.accountId,
                                          cursor: k.page.cursor,
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
                  D !== null &&
                    (0, p.jsx)(`button`, {
                      disabled: b,
                      onClick: () => O(null),
                      children: `First accounts`,
                    }),
                  t.cursor !== null &&
                    (0, p.jsx)(`button`, {
                      disabled: b,
                      onClick: () => O(t.cursor),
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
                  disabled: b,
                  onClick: () => void J(),
                  children: `Retry`,
                }),
            ],
          }),
    ],
  });
}
export { _ as GmailPage };
