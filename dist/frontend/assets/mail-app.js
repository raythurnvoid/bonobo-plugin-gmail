import { n as e } from "./rolldown-runtime.js";
import { r as t, t as n } from "./react.js";
import { a as r, n as i, o as a, r as o, s } from "./zod.js";
import { a as c, c as l, r as u, t as d } from "./gmail-api.js";
var f = e(t(), 1),
  p = 50,
  m = 998,
  h = 5e4,
  g = a({
    drafts: i(
      a({
        clientDraftId: s(),
        to: i(s()),
        cc: i(s()),
        subject: s(),
        isReply: o(),
        saving: o(),
        agentEditedAt: r().nullable(),
        updatedAt: r(),
      }),
    ).max(25),
    cursor: s().nullable(),
  }),
  _ = a({
    clientDraftId: s(),
    to: i(s()),
    cc: i(s()),
    subject: s(),
    body: s(),
    isReply: o(),
    agentEditedAt: r().nullable(),
  });
function v() {
  return crypto.randomUUID();
}
function y(e) {
  if (e.to.length + e.cc.length > p)
    throw Error(`A draft can have at most ${p} recipients`);
  if (e.subject.length > m)
    throw Error(`A subject can have at most ${m} characters`);
  if (new TextEncoder().encode(e.body).byteLength > h)
    throw Error(`A draft can have at most 50 KB of text. Shorten the body.`);
}
function ee(e, t, n) {
  return c(e, `/page/drafts/list`, { accountId: t, cursor: n }, g);
}
function b(e, t, n) {
  return c(e, `/page/drafts/get`, { accountId: t, clientDraftId: n }, _);
}
async function x(e, t) {
  (y(t.fields),
    await c(e, `/page/drafts/create`, t, a({ clientDraftId: s() })));
}
async function S(e, t) {
  (y(t.fields), await c(e, `/page/drafts/update`, t, a({ saved: o() })));
}
async function C(e, t, n) {
  await c(
    e,
    `/page/drafts/delete`,
    { accountId: t, clientDraftId: n },
    a({ deleted: o() }),
  );
}
var w = 4;
function T(e) {
  return new Promise((t) => setTimeout(t, e));
}
function E(e) {
  return e instanceof d ? u(e) : e instanceof Error ? e.message : String(e);
}
async function D(e, t, n) {
  for (let r = 0; ; r += 1) {
    let i = await e.fetchJson(t, n),
      a = i.body,
      o =
        i.status === 429 && typeof a == `object` && a && `retryAfterMs` in a
          ? a.retryAfterMs
          : void 0;
    if (typeof o == `number` && r < w) {
      await T(o + Math.random() * 250);
      continue;
    }
    return i;
  }
}
function O(e) {
  return typeof e == `string` ? e : ``;
}
function k(e) {
  return Array.isArray(e) ? e.filter((e) => typeof e == `string`) : [];
}
function A(e) {
  return (
    e
      .slice(e.lastIndexOf(`/`) + 1)
      .replace(/\.md$/u, ``)
      .replace(/^\d{2}-/u, ``)
      .replace(/-[0-9a-f]+$/u, ``)
      .replace(/-/gu, ` `) || `(no subject)`
  );
}
function j(e) {
  let t = /\/(\d{4})\/(\d{2})\/(\d{2})-[^/]*$/u.exec(e);
  return t ? `${t[1]}-${t[2]}-${t[3]}` : ``;
}
function M(e, t) {
  let n = {},
    r = t;
  if (
    t.startsWith(`---
`)
  ) {
    let e = t.indexOf(
        `
---
`,
        4,
      ),
      i = e === -1 ? `` : t.slice(4, e);
    r = e === -1 ? t : t.slice(e + 5);
    for (let e of i.split(`
`)) {
      let t = e.indexOf(`: `);
      if (t !== -1)
        try {
          n[e.slice(0, t)] = JSON.parse(e.slice(t + 2));
        } catch {}
    }
  }
  r = r
    .replace(/^\s*# [^\n]*\n+/u, ``)
    .replace(/^\[Open in Gmail\]\([^)]*\)\n+/u, ``);
  let i = n.direction;
  return {
    path: e,
    headers: {
      from: O(n.from),
      to: k(n.to),
      cc: k(n.cc),
      subject: O(n.subject) || A(e),
      date: O(n.date),
      direction: i === `sent` || i === `received` ? i : null,
      gmailMessageId: O(n[`gmail-message-id`]) || null,
    },
    body: r.trimEnd(),
  };
}
async function N(e, t) {
  let n = await D(e, `/api/v1/files/read`, { path: t });
  if (n.status !== 200 || n.body === null || !(`content` in n.body)) {
    let e = n.body && `message` in n.body ? n.body.message : `HTTP ${n.status}`;
    throw Error(`Failed to read ${t}: ${e}`);
  }
  return M(t, n.body.content);
}
async function P(e, t) {
  let n = [],
    r = null;
  for (;;) {
    let i = await D(e, `/api/v1/files/list`, {
      path: t,
      cursor: r,
      limit: 100,
    });
    if (
      i.status === 400 &&
      i.body &&
      `errorCode` in i.body &&
      i.body.errorCode === `invalid_cursor`
    ) {
      ((n.length = 0), (r = null));
      continue;
    }
    if (i.status === 403 || i.status === 404) return [];
    if (
      i.status !== 200 ||
      i.body === null ||
      !(`items` in i.body) ||
      i.body.items === void 0
    ) {
      let e =
        i.body && `message` in i.body ? i.body.message : `HTTP ${i.status}`;
      throw Error(`Failed to list ${t}: ${e}`);
    }
    for (let e of i.body.items)
      n.push({ path: e.path, name: e.name, kind: e.kind });
    if (i.body.isDone) return n;
    r = i.body.cursor;
  }
}
function te(e, t) {
  let n = [{ folders: [t] }];
  return {
    async next() {
      for (; n.length > 0; ) {
        let t = n[n.length - 1],
          r = t.folders[0];
        if (r === void 0) {
          n.pop();
          continue;
        }
        let i = await P(e, r);
        t.folders.shift();
        let a = (e, t) => (e.name < t.name ? 1 : e.name > t.name ? -1 : 0),
          o = i
            .filter(
              (e) => e.kind === `folder` && !e.name.endsWith(`-attachments`),
            )
            .sort(a),
          s = i
            .filter((e) => e.kind === `file` && e.name.endsWith(`.md`))
            .sort(a);
        if (
          (o.length > 0 && n.push({ folders: o.map((e) => e.path) }),
          s.length > 0)
        )
          return s.map((e) => ({
            path: e.path,
            subject: A(e.path),
            day: j(e.path),
            headers: null,
          }));
      }
      return null;
    },
  };
}
var F = 12e3,
  I = 300,
  L = 10,
  R = 25,
  ne = new TextEncoder(),
  re = new TextDecoder(),
  z = `Saved as a Gmail draft and open in the Mail page. It was not sent. Only the member can send it.`;
function B(e, t) {
  let n = ne.encode(e);
  return n.byteLength <= t
    ? e
    : `${re.decode(n.slice(0, t))}\n[Shortened. Open the file for the rest.]`;
}
function V(e) {
  return e.slice(0, L).map((e) => B(e, I));
}
function H(e) {
  return {
    path: e.path,
    from: B(e.headers.from, I),
    to: V(e.headers.to),
    cc: V(e.headers.cc),
    subject: B(e.headers.subject, I),
    date: e.headers.date,
    direction: e.headers.direction,
    body: B(e.body, F),
  };
}
function U(e) {
  return {
    draftId: e.clientDraftId,
    to: V(e.to),
    cc: V(e.cc),
    subject: B(e.subject, I),
    isReply: e.isReply,
    editedByAgent: e.agentEditedAt !== null,
  };
}
function W(e) {
  return {
    draftId: e.clientDraftId,
    to: V(e.to),
    cc: V(e.cc),
    subject: B(e.subject, I),
    body: B(e.body, F),
    isReply: e.isReply,
    editedByAgent: e.agentEditedAt !== null,
  };
}
function G(e) {
  if (typeof e != `object` || !e || Array.isArray(e))
    throw Error(`The input must be an object`);
  return e;
}
function K(e, t) {
  let n = e[t];
  if (n !== void 0) {
    if (typeof n != `string`) throw Error(`${t} must be a string`);
    return n;
  }
}
function q(e, t) {
  let n = e[t];
  if (n !== void 0) {
    if (!Array.isArray(n) || !n.every((e) => typeof e == `string`))
      throw Error(`${t} must be a list of strings`);
    return n;
  }
}
function J(e, t) {
  if (e === void 0) throw Error(`${t} is required`);
  return e;
}
function ie(e, t) {
  let n = () => {
      let e = t.getView().account;
      if (!e)
        throw Error(
          `No Gmail account is connected. Connect one on the Gmail page.`,
        );
      return e;
    },
    r = (t, n) =>
      e.agent.registerTool(t, async (e) => {
        try {
          return await n(e);
        } catch (e) {
          throw Error(E(e));
        }
      }),
    i = [
      r(`get_view`, async () => {
        let n = t.getView(),
          r =
            n.account && n.openDraftId
              ? await b(e, n.account.accountId, n.openDraftId).catch(() => null)
              : null;
        return {
          account: n.account?.emailAddress ?? null,
          canWriteDrafts: n.account?.canCompose ?? !1,
          folder: n.folder,
          openEmail: n.openEmail ? H(n.openEmail) : null,
          openDraft: r ? W(r) : null,
          emails: n.rows
            .slice(0, R)
            .map((e) => ({
              path: e.path,
              from: e.headers ? B(e.headers.from, I) : null,
              subject: B(e.headers?.subject ?? e.subject, I),
              date: e.headers?.date ?? e.day,
              direction: e.headers?.direction ?? null,
            })),
          draftCount: n.drafts.length,
        };
      }),
      r(`open_email`, async (n) => {
        let r = J(K(G(n), `path`), `path`);
        if (!r.startsWith(`/`) || !r.endsWith(`.md`))
          throw Error(`path must be a Files path that ends with .md`);
        let i = await N(e, r);
        return (t.showEmail(i), H(i));
      }),
      r(`list_drafts`, () => ({
        drafts: t.getView().drafts.map(U),
        note: `These are the newest drafts. get_view shows the full text of the open draft.`,
      })),
      r(`create_draft`, async (r) => {
        let i = G(r),
          a = {
            to: J(q(i, `to`), `to`),
            cc: q(i, `cc`) ?? [],
            subject: J(K(i, `subject`), `subject`),
            body: J(K(i, `body`), `body`),
          },
          o = K(i, `replyToPath`);
        y(a);
        let s = n(),
          c = null;
        if (
          o !== void 0 &&
          ((c = (await N(e, o)).headers.gmailMessageId), c === null)
        )
          throw Error(
            `${o} has no Gmail id, so a reply cannot be made from it`,
          );
        let l = v();
        return (
          await x(e, {
            accountId: s.accountId,
            clientDraftId: l,
            fields: a,
            replyToGmailMessageId: c,
            byAgent: !0,
          }),
          t.refreshDrafts(),
          t.showDraft(l),
          { draftId: l, saved: !0, note: z }
        );
      }),
      r(`update_draft`, async (r) => {
        let i = G(r),
          a = J(K(i, `draftId`), `draftId`),
          o = n(),
          s = await b(e, o.accountId, a),
          c = {
            to: q(i, `to`) ?? s.to,
            cc: q(i, `cc`) ?? s.cc,
            subject: K(i, `subject`) ?? s.subject,
            body: K(i, `body`) ?? s.body,
          };
        return (
          await S(e, {
            accountId: o.accountId,
            clientDraftId: a,
            fields: c,
            byAgent: !0,
          }),
          t.refreshDrafts(),
          t.showDraft(a),
          { draftId: a, saved: !0, note: z }
        );
      }),
      r(`delete_draft`, async (r) => {
        let i = J(K(G(r), `draftId`), `draftId`);
        return (
          await C(e, n().accountId, i),
          t.refreshDrafts(),
          { draftId: i, deleted: !0 }
        );
      }),
    ];
  return () => {
    for (let e of i) e();
  };
}
var Y = 45e3;
async function ae(e, t) {
  await c(e, `/page/drafts/send`, t, a({ sent: o() }), Y);
}
var X = n(),
  oe = 30,
  se = 4,
  ce = 3e3,
  le = 1e4,
  ue = 5e3;
function de(e) {
  let t = new Date(e);
  return Number.isNaN(t.getTime())
    ? ``
    : t.toLocaleString(void 0, { dateStyle: `medium`, timeStyle: `short` });
}
function fe(e) {
  let t = /^\s*"?([^"<]+?)"?\s*<[^>]+>\s*$/u.exec(e);
  return t ? t[1] : e;
}
function Z(e) {
  return e.join(`, `);
}
function Q(e) {
  return e
    .split(/[,;\n]/u)
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
}
function pe(e) {
  return /<([^<>]+)>\s*$/u.exec(e)?.[1] ?? e;
}
function me(e) {
  let t = /^re:/iu.test(e.headers.subject)
      ? e.headers.subject
      : `Re: ${e.headers.subject}`,
    n = (e.body.length > ce ? `${e.body.slice(0, ce)}…` : e.body)
      .split(
        `
`,
      )
      .map((e) => `> ${e}`).join(`
`);
  return {
    fields: {
      to: e.headers.direction === `sent` ? e.headers.to : [e.headers.from],
      cc: [],
      subject: t,
      body: `\n\nOn ${de(e.headers.date)}, ${e.headers.from} wrote:\n${n}`,
    },
    replyToGmailMessageId: e.headers.gmailMessageId,
  };
}
function he(e) {
  return e.isComposer
    ? e.canCompose
      ? null
      : `Drafts are off for ${e.emailAddress}. Open the Gmail page and press Allow drafts and Send.`
    : `Only the member who connected ${e.emailAddress} can write drafts for it.`;
}
async function ge(e) {
  let t = [],
    n = null;
  do {
    let r = await c(e, `/page/status`, { cursor: n }, l);
    for (let e of r.accounts)
      e.syncStatus !== `disconnected` &&
        t.push({
          accountId: e.accountId,
          emailAddress: e.emailAddress,
          destinationPath: e.destinationPath,
          canCompose: e.canCompose,
          isComposer: e.isComposer,
        });
    n = r.cursor;
  } while (n !== null);
  return t;
}
function _e(e) {
  let { client: t } = e,
    [n, r] = (0, f.useState)(null),
    [i, a] = (0, f.useState)(null),
    [o, s] = (0, f.useState)(`all`),
    [c, l] = (0, f.useState)([]),
    [u, d] = (0, f.useState)(oe),
    [p, m] = (0, f.useState)(!1),
    [h, g] = (0, f.useState)(!1),
    [_, y] = (0, f.useState)(null),
    [b, S] = (0, f.useState)(null),
    [C, w] = (0, f.useState)(null),
    [T, D] = (0, f.useState)(null),
    [O, k] = (0, f.useState)(null),
    [A, j] = (0, f.useState)(!1),
    [M, P] = (0, f.useState)(null),
    [F, I] = (0, f.useState)(null),
    [L, R] = (0, f.useState)(null),
    [ne, re] = (0, f.useState)(0),
    z = n?.find((e) => e.accountId === i) ?? null,
    B = z ? he(z) : null,
    V = (0, f.useMemo)(
      () => (z === null ? null : te(t, z.destinationPath)),
      [t, z?.destinationPath],
    ),
    H = (0, f.useRef)(null),
    U = (0, f.useRef)(!1),
    W = (0, f.useRef)([]),
    G = (0, f.useRef)(new Set()),
    K = (0, f.useRef)(0),
    q = (0, f.useRef)(null),
    J = (0, f.useRef)({
      account: z,
      folder: o,
      rows: c,
      openEmail: C,
      openDraftId: null,
      drafts: [],
    });
  J.current = {
    account: z,
    folder: o,
    rows: c,
    openEmail: b?.kind === `email` ? C : null,
    openDraftId: b?.kind === `draft` ? b.id : null,
    drafts: O ?? [],
  };
  let Y = () => re((e) => e + 1),
    ae = (e) => {
      ((q.current = e.path),
        s(`all`),
        S({ kind: `email`, path: e.path }),
        w(e),
        D(null));
    },
    ce = (e) => {
      ((q.current = e),
        S({ kind: `email`, path: e }),
        w(null),
        D(null),
        N(t, e).then(
          (t) => {
            q.current === e && w(t);
          },
          (t) => {
            q.current === e && D(E(t));
          },
        ));
    },
    le = (e) => {
      ((q.current = null), s(`drafts`), S({ kind: `draft`, id: e }), R(null));
    },
    Q = (e) => {
      if (z === null) return;
      let n = v();
      (I(null),
        x(t, {
          accountId: z.accountId,
          clientDraftId: n,
          ...e,
          byAgent: !1,
        }).then(
          () => {
            (Y(), le(n));
          },
          (e) => I(E(e)),
        ));
    },
    pe = (e, t, n) => {
      U.current ||
        ((U.current = !0),
        g(!0),
        y(null),
        (async () => {
          let r = t;
          for (; r < n; ) {
            let t = await e.next();
            if (H.current !== e) return;
            if (t === null) {
              m(!0);
              return;
            }
            ((r += t.length), l((e) => [...e, ...t]));
          }
        })()
          .catch((t) => {
            H.current === e && y(E(t));
          })
          .finally(() => {
            ((U.current = !1), H.current === e && g(!1));
          }));
    },
    _e = () => {
      if (V === null || h) return;
      let e = u + oe;
      (d(e), c.length < e && !p && pe(V, c.length, e));
    },
    be = () => {
      for (; K.current < se; ) {
        let e = W.current.shift();
        if (e === void 0) return;
        ((K.current += 1),
          N(t, e)
            .then(
              (t) =>
                l((n) =>
                  n.map((n) =>
                    n.path === e ? { ...n, headers: t.headers } : n,
                  ),
                ),
              () => {},
            )
            .finally(() => {
              (--K.current, be());
            }));
      }
    };
  ((0, f.useEffect)(() => {
    ge(t).then(
      (e) => {
        (r(e), a(e[0]?.accountId ?? null));
      },
      (e) => {
        (r([]), y(E(e)));
      },
    );
  }, [t]),
    (0, f.useEffect)(() => {
      (l([]),
        k(null),
        d(oe),
        m(!1),
        g(!1),
        (W.current = []),
        G.current.clear(),
        (H.current = V),
        (U.current = !1),
        V !== null && pe(V, 0, oe));
    }, [V]),
    (0, f.useEffect)(() => {
      for (let e of c.slice(0, u))
        e.headers === null &&
          !G.current.has(e.path) &&
          (G.current.add(e.path), W.current.push(e.path));
      be();
    }, [t, c, u]),
    (0, f.useEffect)(() => {
      if (z === null || B !== null) return;
      let e = !1,
        n = () => {
          document.visibilityState === `visible` &&
            ee(t, z.accountId, null).then(
              (t) => {
                e || (P(null), k(t.drafts), j(t.cursor !== null));
              },
              (t) => {
                e || P(E(t));
              },
            );
        };
      n();
      let r = setInterval(n, ue);
      return () => {
        ((e = !0), clearInterval(r));
      };
    }, [t, z?.accountId, B, ne]),
    (0, f.useEffect)(
      () =>
        ie(t, {
          getView: () => J.current,
          showEmail: ae,
          showDraft: le,
          refreshDrafts: Y,
        }),
      [t],
    ));
  let $ =
    b?.kind === `draft`
      ? ((O ?? []).find((e) => e.clientDraftId === b.id) ?? null)
      : null;
  return (0, X.jsxs)(`div`, {
    className: `mail`,
    children: [
      (0, X.jsxs)(`nav`, {
        className: `mail-rail`,
        "aria-label": `Mailboxes`,
        children: [
          (0, X.jsx)(`button`, {
            className: `button is-primary`,
            disabled: z === null || B !== null,
            onClick: () =>
              Q({
                fields: { to: [], cc: [], subject: ``, body: `` },
                replyToGmailMessageId: null,
              }),
            children: `Compose`,
          }),
          F === null
            ? null
            : (0, X.jsx)(`p`, {
                className: `mail-status is-error`,
                role: `alert`,
                children: F,
              }),
          (0, X.jsx)(`button`, {
            className: `mail-rail-item`,
            "aria-current": o === `all` ? `page` : void 0,
            onClick: () => s(`all`),
            children: `All mail`,
          }),
          (0, X.jsxs)(`button`, {
            className: `mail-rail-item`,
            "aria-current": o === `drafts` ? `page` : void 0,
            onClick: () => s(`drafts`),
            children: [
              `Drafts`,
              O !== null && O.length > 0
                ? (0, X.jsx)(`span`, {
                    className: `mail-rail-count`,
                    children: O.length,
                  })
                : null,
            ],
          }),
          n !== null && n.length > 1
            ? (0, X.jsxs)(`label`, {
                className: `mail-rail-account`,
                children: [
                  `Account`,
                  (0, X.jsx)(`select`, {
                    value: i ?? ``,
                    onChange: (e) => a(e.currentTarget.value),
                    children: n.map((e) =>
                      (0, X.jsx)(
                        `option`,
                        { value: e.accountId, children: e.emailAddress },
                        e.accountId,
                      ),
                    ),
                  }),
                ],
              })
            : null,
        ],
      }),
      (0, X.jsx)(`section`, {
        className: `mail-list`,
        "aria-label": o === `all` ? `All mail` : `Drafts`,
        children:
          o === `all`
            ? (0, X.jsxs)(X.Fragment, {
                children: [
                  n !== null && n.length === 0 && _ === null
                    ? (0, X.jsx)(`p`, {
                        className: `mail-status`,
                        children: `No Gmail account is connected. Connect one on the Gmail page.`,
                      })
                    : null,
                  (0, X.jsx)(`ul`, {
                    className: `mail-rows`,
                    children: c
                      .slice(0, u)
                      .map((e) =>
                        (0, X.jsx)(
                          `li`,
                          {
                            children: (0, X.jsxs)(`button`, {
                              className: `mail-row`,
                              "aria-current":
                                b?.kind === `email` && b.path === e.path
                                  ? `true`
                                  : void 0,
                              "data-direction": e.headers?.direction ?? void 0,
                              onClick: () => ce(e.path),
                              children: [
                                (0, X.jsx)(`span`, {
                                  className: `mail-row-from`,
                                  children:
                                    e.headers === null
                                      ? ``
                                      : e.headers.direction === `sent`
                                        ? `To: ${fe(e.headers.to[0] ?? ``)}`
                                        : fe(e.headers.from),
                                }),
                                (0, X.jsx)(`span`, {
                                  className: `mail-row-date`,
                                  children: e.headers
                                    ? de(e.headers.date)
                                    : e.day,
                                }),
                                (0, X.jsx)(`span`, {
                                  className: `mail-row-subject`,
                                  children: e.headers?.subject ?? e.subject,
                                }),
                              ],
                            }),
                          },
                          e.path,
                        ),
                      ),
                  }),
                  h
                    ? (0, X.jsx)(`p`, {
                        className: `mail-status`,
                        role: `status`,
                        children: `Loading…`,
                      })
                    : null,
                  !h && V !== null && (c.length > u || !p)
                    ? (0, X.jsx)(`button`, {
                        className: `button mail-more`,
                        onClick: _e,
                        children: `Show more`,
                      })
                    : null,
                  _ === null
                    ? null
                    : (0, X.jsx)(`p`, {
                        className: `mail-status is-error`,
                        role: `alert`,
                        children: _,
                      }),
                ],
              })
            : (0, X.jsxs)(X.Fragment, {
                children: [
                  B === null
                    ? null
                    : (0, X.jsx)(`p`, {
                        className: `mail-status`,
                        children: B,
                      }),
                  M === null
                    ? null
                    : (0, X.jsx)(`p`, {
                        className: `mail-status is-error`,
                        role: `alert`,
                        children: M,
                      }),
                  O !== null && O.length === 0
                    ? (0, X.jsx)(`p`, {
                        className: `mail-status`,
                        children: `No drafts. Ask the agent to write one.`,
                      })
                    : null,
                  (0, X.jsx)(`ul`, {
                    className: `mail-rows`,
                    children: (O ?? []).map((e) =>
                      (0, X.jsx)(
                        `li`,
                        {
                          children: (0, X.jsxs)(`button`, {
                            className: `mail-row`,
                            "aria-current":
                              b?.kind === `draft` && b.id === e.clientDraftId
                                ? `true`
                                : void 0,
                            onClick: () => le(e.clientDraftId),
                            children: [
                              (0, X.jsx)(`span`, {
                                className: `mail-row-from`,
                                children:
                                  e.to.length > 0
                                    ? `To: ${Z(e.to)}`
                                    : `No recipients`,
                              }),
                              (0, X.jsx)(`span`, {
                                className: `mail-row-date`,
                                children:
                                  e.agentEditedAt === null
                                    ? null
                                    : (0, X.jsx)(`span`, {
                                        className: `mail-badge`,
                                        children: `Agent`,
                                      }),
                              }),
                              (0, X.jsx)(`span`, {
                                className: `mail-row-subject`,
                                children: e.subject || `(no subject)`,
                              }),
                            ],
                          }),
                        },
                        e.clientDraftId,
                      ),
                    ),
                  }),
                  A
                    ? (0, X.jsx)(`p`, {
                        className: `mail-status`,
                        children: `Showing the 25 newest drafts.`,
                      })
                    : null,
                ],
              }),
      }),
      (0, X.jsxs)(`main`, {
        className: `mail-reader`,
        children: [
          L === null
            ? null
            : (0, X.jsx)(`p`, {
                className: `mail-status`,
                role: `status`,
                children: L,
              }),
          b === null && L === null
            ? (0, X.jsx)(`p`, {
                className: `mail-status`,
                children: `Choose an email or a draft.`,
              })
            : null,
          b?.kind === `email`
            ? T === null
              ? C === null || C.path !== b.path
                ? (0, X.jsx)(`p`, {
                    className: `mail-status`,
                    role: `status`,
                    children: `Opening…`,
                  })
                : (0, X.jsx)(ve, {
                    email: C,
                    replyBlock: B,
                    onReply: () => Q(me(C)),
                  })
              : (0, X.jsx)(`p`, {
                  className: `mail-status is-error`,
                  role: `alert`,
                  children: T,
                })
            : null,
          b?.kind === `draft` && z !== null
            ? $ !== null && !$.saving
              ? (0, X.jsx)(
                  ye,
                  {
                    client: t,
                    accountId: z.accountId,
                    draft: $,
                    onChanged: Y,
                    onClosed: (e) => {
                      (S(null), R(e), Y());
                    },
                  },
                  `${$.clientDraftId}:${$.agentEditedAt ?? 0}`,
                )
              : (0, X.jsx)(`p`, {
                  className: `mail-status`,
                  role: `status`,
                  children:
                    O === null || $?.saving
                      ? `Opening the draft…`
                      : `This draft is not available. It may have been sent or deleted.`,
                })
            : null,
        ],
      }),
    ],
  });
}
function ve(e) {
  let { email: t, replyBlock: n, onReply: r } = e;
  return (0, X.jsxs)(`article`, {
    className: `mail-email`,
    "aria-label": t.headers.subject,
    children: [
      (0, X.jsxs)(`header`, {
        className: `mail-email-header`,
        children: [
          (0, X.jsx)(`h1`, { children: t.headers.subject }),
          (0, X.jsxs)(`dl`, {
            children: [
              (0, X.jsx)(`dt`, { children: `From` }),
              (0, X.jsx)(`dd`, { children: t.headers.from }),
              (0, X.jsx)(`dt`, { children: `To` }),
              (0, X.jsx)(`dd`, { children: Z(t.headers.to) }),
              t.headers.cc.length > 0
                ? (0, X.jsxs)(X.Fragment, {
                    children: [
                      (0, X.jsx)(`dt`, { children: `Cc` }),
                      (0, X.jsx)(`dd`, { children: Z(t.headers.cc) }),
                    ],
                  })
                : null,
              (0, X.jsx)(`dt`, { children: `Date` }),
              (0, X.jsx)(`dd`, { children: de(t.headers.date) }),
            ],
          }),
          (0, X.jsxs)(`div`, {
            className: `mail-actions`,
            children: [
              (0, X.jsx)(`button`, {
                className: `button`,
                disabled: n !== null || t.headers.gmailMessageId === null,
                onClick: r,
                children: `Reply`,
              }),
              n === null
                ? null
                : (0, X.jsx)(`span`, {
                    className: `mail-draft-status`,
                    children: n,
                  }),
            ],
          }),
        ],
      }),
      (0, X.jsx)(`div`, { className: `mail-email-body`, children: t.body }),
    ],
  });
}
function ye(e) {
  let { client: t, accountId: n, draft: r, onChanged: i, onClosed: a } = e,
    [o, s] = (0, f.useState)(null),
    [c, l] = (0, f.useState)(null),
    [u, p] = (0, f.useState)(``),
    [m, h] = (0, f.useState)(``),
    [g, _] = (0, f.useState)(``),
    [v, y] = (0, f.useState)(``),
    [ee, x] = (0, f.useState)(!1),
    [w, T] = (0, f.useState)(!1),
    [D, O] = (0, f.useState)(null),
    k = { accountId: n, clientDraftId: r.clientDraftId },
    A = (e, t) => {
      (T(!0),
        O(null),
        e().then(
          () => {
            (T(!1), O({ text: t, isError: !1 }));
          },
          (e) => {
            (T(!1), O({ text: E(e), isError: !0 }));
          },
        ));
    },
    j = () => ({ to: Q(u), cc: Q(m), subject: g, body: v }),
    M = () => (x(!1), S(t, { ...k, fields: j(), byAgent: !1 }).then(i)),
    N = () => A(M, `Saved to Gmail`),
    P = () =>
      M().then(
        () => O({ text: `Saved to Gmail`, isError: !1 }),
        (e) => O({ text: E(e), isError: !0 }),
      ),
    te = () =>
      A(async () => {
        let e = j(),
          t = [
            `To: ${Z(e.to)}`,
            ...(e.cc.length > 0 ? [`Cc: ${Z(e.cc)}`] : []),
            `Subject: ${e.subject}`,
            ``,
            e.body,
          ].join(`
`);
        await navigator.clipboard.writeText(t);
      }, `Copied`),
    F = () => {
      (x(!1),
        A(async () => {
          (await C(t, n, r.clientDraftId), a(`Draft deleted.`));
        }, `Deleted`));
    },
    I = () => {
      let e = j();
      (x(!1),
        T(!0),
        O({ text: `Sending…`, isError: !1 }),
        ae(t, { ...k, fields: e }).then(
          () => a(`Sent: ${e.subject || `(no subject)`}`),
          (t) => {
            T(!1);
            let n =
              !(t instanceof d) ||
              [`send_unknown`, `service_unavailable`].includes(t.code);
            O({
              text: n
                ? `We could not confirm that “${e.subject || `(no subject)`}” was sent. Check Sent in Gmail before you press Send again.`
                : E(t),
              isError: !0,
            });
          },
        ));
    };
  if (
    ((0, f.useEffect)(() => {
      b(t, n, r.clientDraftId).then(
        (e) => {
          (s(e), p(Z(e.to)), h(Z(e.cc)), _(e.subject), y(e.body));
        },
        (e) => {
          if (e instanceof d && e.code === `draft_gone`) {
            a(E(e));
            return;
          }
          l(E(e));
        },
      );
    }, [t, n, r.clientDraftId]),
    (0, f.useEffect)(() => {
      if (!ee) return;
      let e = setTimeout(P, le);
      return () => clearTimeout(e);
    }, [ee, u, m, g, v]),
    c !== null)
  )
    return (0, X.jsx)(`p`, {
      className: `mail-status is-error`,
      role: `alert`,
      children: c,
    });
  if (o === null)
    return (0, X.jsx)(`p`, {
      className: `mail-status`,
      role: `status`,
      children: `Opening the draft…`,
    });
  let L = [...Q(u), ...Q(m)].map(pe),
    R = () => {
      ee && P();
    };
  return (0, X.jsxs)(`form`, {
    className: `mail-draft`,
    "aria-label": `Draft`,
    onSubmit: (e) => {
      (e.preventDefault(), N());
    },
    children: [
      (0, X.jsxs)(`header`, {
        className: `mail-draft-header`,
        children: [
          (0, X.jsx)(`h1`, { children: `Draft` }),
          r.agentEditedAt === null
            ? null
            : (0, X.jsx)(`span`, {
                className: `mail-badge`,
                children: `Edited by the agent`,
              }),
        ],
      }),
      (0, X.jsxs)(`label`, {
        className: `mail-field`,
        children: [
          (0, X.jsx)(`span`, { children: `To` }),
          (0, X.jsx)(`input`, {
            value: u,
            onBlur: R,
            onInput: (e) => {
              (p(e.currentTarget.value), x(!0));
            },
            autoComplete: `off`,
          }),
        ],
      }),
      (0, X.jsxs)(`label`, {
        className: `mail-field`,
        children: [
          (0, X.jsx)(`span`, { children: `Cc` }),
          (0, X.jsx)(`input`, {
            value: m,
            onBlur: R,
            onInput: (e) => {
              (h(e.currentTarget.value), x(!0));
            },
            autoComplete: `off`,
          }),
        ],
      }),
      (0, X.jsxs)(`label`, {
        className: `mail-field`,
        children: [
          (0, X.jsx)(`span`, { children: `Subject` }),
          (0, X.jsx)(`input`, {
            value: g,
            onBlur: R,
            onInput: (e) => {
              (_(e.currentTarget.value), x(!0));
            },
          }),
        ],
      }),
      (0, X.jsxs)(`label`, {
        className: `mail-field is-body`,
        children: [
          (0, X.jsx)(`span`, { children: `Body` }),
          (0, X.jsx)(`textarea`, {
            value: v,
            onBlur: R,
            onInput: (e) => {
              (y(e.currentTarget.value), x(!0));
            },
          }),
        ],
      }),
      (0, X.jsx)(`p`, {
        className: `mail-note`,
        "data-mail-send-recipients": L.join(`,`),
        children:
          L.length > 0
            ? `Send goes to: ${L.join(`, `)}`
            : `Add a recipient to send.`,
      }),
      (0, X.jsxs)(`div`, {
        className: `mail-actions`,
        children: [
          (0, X.jsx)(`button`, {
            className: `button is-primary`,
            type: `button`,
            disabled: w || L.length === 0,
            onClick: I,
            children: `Send`,
          }),
          (0, X.jsx)(`button`, {
            className: `button`,
            type: `submit`,
            disabled: w,
            children: `Save`,
          }),
          (0, X.jsx)(`button`, {
            className: `button`,
            type: `button`,
            disabled: w,
            onClick: te,
            children: `Copy`,
          }),
          (0, X.jsx)(`button`, {
            className: `button`,
            type: `button`,
            disabled: w,
            onClick: F,
            children: `Delete`,
          }),
          D === null
            ? null
            : (0, X.jsx)(`span`, {
                className: D.isError
                  ? `mail-draft-status is-error`
                  : `mail-draft-status`,
                role: `status`,
                children: D.text,
              }),
        ],
      }),
      (0, X.jsx)(`p`, {
        className: `mail-note`,
        children: `This is a Gmail draft. It also shows in Gmail, where Gmail's own Send works. When the agent changes this draft, its version replaces text you did not save.`,
      }),
    ],
  });
}
export { _e as MailApp };
