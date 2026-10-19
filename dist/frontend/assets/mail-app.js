import { n as e } from "./rolldown-runtime.js";
import { r as t, t as n } from "./react.js";
import { a as r, n as i, o as a, r as o, s } from "./zod.js";
import { a as c, l, o as u, r as d, t as f } from "./gmail-api.js";
var p = e(t(), 1),
  m = 50,
  h = 998,
  g = 5e4,
  _ = a({
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
  v = a({
    clientDraftId: s(),
    to: i(s()),
    cc: i(s()),
    subject: s(),
    body: s(),
    isReply: o(),
    agentEditedAt: r().nullable(),
  });
function ee() {
  return crypto.randomUUID();
}
function y(e) {
  if (e.to.length + e.cc.length > m)
    throw Error(`A draft can have at most ${m} recipients`);
  if (e.subject.length > h)
    throw Error(`A subject can have at most ${h} characters`);
  if (new TextEncoder().encode(e.body).byteLength > g)
    throw Error(`A draft can have at most 50 KB of text. Shorten the body.`);
}
function b(e, t, n) {
  return u(e, `/page/drafts/list`, { accountId: t, cursor: n }, _);
}
function x(e, t, n) {
  return u(e, `/page/drafts/get`, { accountId: t, clientDraftId: n }, v);
}
async function S(e, t) {
  (y(t.fields),
    await u(e, `/page/drafts/create`, t, a({ clientDraftId: s() })));
}
async function C(e, t) {
  (y(t.fields), await u(e, `/page/drafts/update`, t, a({ saved: o() })));
}
async function w(e, t, n) {
  await u(
    e,
    `/page/drafts/delete`,
    { accountId: t, clientDraftId: n },
    a({ deleted: o() }),
  );
}
var T = 4;
function E(e) {
  return new Promise((t) => setTimeout(t, e));
}
function D(e) {
  return e instanceof f ? d(e) : e instanceof Error ? e.message : String(e);
}
async function O(e, t, n) {
  for (let r = 0; ; r += 1) {
    let i = await e.fetchJson(t, n),
      a = i.body,
      o =
        i.status === 429 && typeof a == `object` && a && `retryAfterMs` in a
          ? a.retryAfterMs
          : void 0;
    if (typeof o == `number` && r < T) {
      await E(o + Math.random() * 250);
      continue;
    }
    return i;
  }
}
function k(e) {
  return typeof e == `string` ? e : ``;
}
function A(e) {
  return Array.isArray(e) ? e.filter((e) => typeof e == `string`) : [];
}
function j(e) {
  return (
    e
      .slice(e.lastIndexOf(`/`) + 1)
      .replace(/\.md$/u, ``)
      .replace(/^\d{2}-/u, ``)
      .replace(/-[0-9a-f]+$/u, ``)
      .replace(/-/gu, ` `) || `(no subject)`
  );
}
function M(e) {
  let t = /\/(\d{4})\/(\d{2})\/(\d{2})-[^/]*$/u.exec(e);
  return t ? `${t[1]}-${t[2]}-${t[3]}` : ``;
}
function te(e, t) {
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
      from: k(n.from),
      to: A(n.to),
      cc: A(n.cc),
      subject: k(n.subject) || j(e),
      date: k(n.date),
      direction: i === `sent` || i === `received` ? i : null,
      gmailMessageId: k(n[`gmail-message-id`]) || null,
    },
    body: r.trimEnd(),
  };
}
async function N(e, t) {
  let n = await O(e, `/api/v1/files/read`, { path: t });
  if (n.status !== 200 || n.body === null || !(`content` in n.body)) {
    let e = n.body && `message` in n.body ? n.body.message : `HTTP ${n.status}`;
    throw Error(`Failed to read ${t}: ${e}`);
  }
  return te(t, n.body.content);
}
async function P(e, t) {
  let n = [],
    r = null;
  for (;;) {
    let i = await O(e, `/api/v1/files/list`, {
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
function ne(e, t) {
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
            subject: j(e.path),
            day: M(e.path),
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
  z = new TextEncoder(),
  B = new TextDecoder(),
  V = `Saved as a Gmail draft and open in the Mail page. It was not sent. Only the member can send it.`;
function H(e, t) {
  let n = z.encode(e);
  return n.byteLength <= t
    ? e
    : `${B.decode(n.slice(0, t))}\n[Shortened. Open the file for the rest.]`;
}
function U(e) {
  return e.slice(0, L).map((e) => H(e, I));
}
function W(e) {
  return {
    path: e.path,
    from: H(e.headers.from, I),
    to: U(e.headers.to),
    cc: U(e.headers.cc),
    subject: H(e.headers.subject, I),
    date: e.headers.date,
    direction: e.headers.direction,
    body: H(e.body, F),
  };
}
function re(e) {
  return {
    draftId: e.clientDraftId,
    to: U(e.to),
    cc: U(e.cc),
    subject: H(e.subject, I),
    isReply: e.isReply,
    editedByAgent: e.agentEditedAt !== null,
  };
}
function G(e) {
  return {
    draftId: e.clientDraftId,
    to: U(e.to),
    cc: U(e.cc),
    subject: H(e.subject, I),
    body: H(e.body, F),
    isReply: e.isReply,
    editedByAgent: e.agentEditedAt !== null,
  };
}
function K(e) {
  if (typeof e != `object` || !e || Array.isArray(e))
    throw Error(`The input must be an object`);
  return e;
}
function q(e, t) {
  let n = e[t];
  if (n !== void 0) {
    if (typeof n != `string`) throw Error(`${t} must be a string`);
    return n;
  }
}
function J(e, t) {
  let n = e[t];
  if (n !== void 0) {
    if (!Array.isArray(n) || !n.every((e) => typeof e == `string`))
      throw Error(`${t} must be a list of strings`);
    return n;
  }
}
function Y(e, t) {
  if (e === void 0) throw Error(`${t} is required`);
  return e;
}
function ie(e) {
  let t = Y(q(e, `draftId`), `draftId`);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)
  )
    throw Error(
      `No draft has the id ${H(t, I)}. Call list_drafts to see the ids.`,
    );
  return t;
}
function ae(e, t) {
  let n = () => {
      let e = t.getView().account;
      if (!e)
        throw Error(
          `No Gmail account is connected. Connect one on the Gmail page.`,
        );
      return e;
    },
    r = new Map(),
    i = (t, n) =>
      e.agent.registerTool(t, async (e) => {
        try {
          return await n(e);
        } catch (e) {
          throw Error(D(e));
        }
      }),
    a = [
      i(`get_view`, async () => {
        let n = t.getView(),
          r =
            n.account && n.openDraftId
              ? await x(e, n.account.accountId, n.openDraftId).catch(() => null)
              : null;
        return {
          account: n.account?.emailAddress ?? null,
          canWriteDrafts: n.account?.canCompose ?? !1,
          folder: n.folder,
          openEmail: n.openEmail ? W(n.openEmail) : null,
          openDraft: r ? G(r) : null,
          emails: n.rows
            .slice(0, R)
            .map((e) => ({
              path: e.path,
              from: e.headers ? H(e.headers.from, I) : null,
              subject: H(e.headers?.subject ?? e.subject, I),
              date: e.headers?.date ?? e.day,
              direction: e.headers?.direction ?? null,
            })),
          draftCount: n.drafts.length,
        };
      }),
      i(`open_email`, async (n) => {
        let r = Y(q(K(n), `path`), `path`);
        if (!r.startsWith(`/`) || !r.endsWith(`.md`))
          throw Error(`path must be a Files path that ends with .md`);
        let i = await N(e, r);
        return (t.showEmail(i), W(i));
      }),
      i(`list_drafts`, () => ({
        drafts: t.getView().drafts.map(re),
        note: `These are the newest drafts, without their text. To read one, ask the member to open it, then call get_view.`,
      })),
      i(`create_draft`, async (i) => {
        let a = K(i),
          o = {
            to: Y(J(a, `to`), `to`),
            cc: J(a, `cc`) ?? [],
            subject: Y(q(a, `subject`), `subject`),
            body: Y(q(a, `body`), `body`),
          },
          s = q(a, `replyToPath`);
        y(o);
        let c = n(),
          l = null;
        if (
          s !== void 0 &&
          ((l = (await N(e, s)).headers.gmailMessageId), l === null)
        )
          throw Error(
            `${s} has no Gmail id, so a reply cannot be made from it`,
          );
        let u = JSON.stringify([c.accountId, o, l]),
          d = r.get(u) ?? ee();
        return (
          r.set(u, d),
          r.size > 20 && r.delete(r.keys().next().value),
          await S(e, {
            accountId: c.accountId,
            clientDraftId: d,
            fields: o,
            replyToGmailMessageId: l,
            byAgent: !0,
          }),
          await t.refreshDrafts().catch(() => {}),
          t.showDraft(d),
          { draftId: d, saved: !0, note: V }
        );
      }),
      i(`update_draft`, async (r) => {
        let i = K(r),
          a = ie(i),
          o = n(),
          s = await x(e, o.accountId, a),
          c = {
            to: J(i, `to`) ?? s.to,
            cc: J(i, `cc`) ?? s.cc,
            subject: q(i, `subject`) ?? s.subject,
            body: q(i, `body`) ?? s.body,
          };
        return (
          await C(e, {
            accountId: o.accountId,
            clientDraftId: a,
            fields: c,
            byAgent: !0,
          }),
          await t.refreshDrafts().catch(() => {}),
          t.showDraft(a),
          { draftId: a, saved: !0, note: V }
        );
      }),
      i(`delete_draft`, async (r) => {
        let i = ie(K(r));
        return (
          await w(e, n().accountId, i),
          await t.refreshDrafts().catch(() => {}),
          { draftId: i, deleted: !0 }
        );
      }),
    ];
  return () => {
    for (let e of a) e();
  };
}
var oe = 45e3;
async function se(e, t) {
  await u(e, `/page/drafts/send`, t, a({ sent: o() }), oe);
}
var X = n(),
  ce = 30,
  le = 4,
  ue = 3e3,
  de = 1e4,
  fe = 5e3;
function pe(e) {
  let t = new Date(e);
  return Number.isNaN(t.getTime())
    ? ``
    : t.toLocaleString(void 0, { dateStyle: `medium`, timeStyle: `short` });
}
function me(e) {
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
function $(e) {
  return /<([^<>]+)>\s*$/u.exec(e)?.[1] ?? e;
}
function he(e) {
  let t = /^re:/iu.test(e.headers.subject)
      ? e.headers.subject
      : `Re: ${e.headers.subject}`,
    n = (e.body.length > ue ? `${e.body.slice(0, ue)}…` : e.body)
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
      body: `\n\nOn ${pe(e.headers.date)}, ${e.headers.from} wrote:\n${n}`,
    },
    replyToGmailMessageId: e.headers.gmailMessageId,
  };
}
function ge(e) {
  return e.isComposer
    ? e.canCompose
      ? null
      : `Drafts are off for ${e.emailAddress}. Open the Gmail page and press Allow drafts and Send.`
    : `Only the member who connected ${e.emailAddress} can write drafts for it.`;
}
async function _e(e) {
  let t = [],
    n = null;
  do {
    let r = await u(e, `/page/status`, { cursor: n }, l);
    for (let n of r.accounts)
      (n.canRepair &&
        u(
          e,
          `/page/press-repair`,
          {
            accountId: n.accountId,
            expectedGeneration: n.connectionGeneration,
            clientRequestId: c(),
          },
          a({}),
        ).catch((e) => {
          console.error(
            `[MailApp.list_accounts] Failed to renew the Press grant`,
            { error: e, accountId: n.accountId },
          );
        }),
        n.syncStatus !== `disconnected` &&
          t.push({
            accountId: n.accountId,
            emailAddress: n.emailAddress,
            destinationPath: n.destinationPath,
            canCompose: n.canCompose,
            isComposer: n.isComposer,
          }));
    n = r.cursor;
  } while (n !== null);
  return t;
}
function ve(e) {
  let { client: t } = e,
    [n, r] = (0, p.useState)(null),
    [i, a] = (0, p.useState)(null),
    [o, s] = (0, p.useState)(`all`),
    [c, l] = (0, p.useState)([]),
    [u, d] = (0, p.useState)(ce),
    [f, m] = (0, p.useState)(!1),
    [h, g] = (0, p.useState)(!1),
    [_, v] = (0, p.useState)(null),
    [y, x] = (0, p.useState)(null),
    [C, w] = (0, p.useState)(null),
    [T, E] = (0, p.useState)(null),
    [O, k] = (0, p.useState)(null),
    [A, j] = (0, p.useState)(!1),
    [M, te] = (0, p.useState)(null),
    [P, F] = (0, p.useState)(null),
    [I, L] = (0, p.useState)(null),
    R = n?.find((e) => e.accountId === i) ?? null,
    z = R ? ge(R) : null,
    B = (0, p.useMemo)(
      () => (R === null ? null : ne(t, R.destinationPath)),
      [t, R?.destinationPath],
    ),
    V = (0, p.useRef)(null),
    H = (0, p.useRef)(!1),
    U = (0, p.useRef)([]),
    W = (0, p.useRef)(new Set()),
    re = (0, p.useRef)(0),
    G = (0, p.useRef)(null),
    K = (0, p.useRef)({
      account: R,
      folder: o,
      rows: c,
      openEmail: C,
      openDraftId: null,
      drafts: [],
    });
  K.current = {
    account: R,
    folder: o,
    rows: c,
    openEmail: y?.kind === `email` ? C : null,
    openDraftId: y?.kind === `draft` ? y.id : null,
    drafts: O ?? [],
  };
  let q = async () => {
      let e = K.current.account;
      if (e === null || ge(e) !== null) return;
      let n = await b(t, e.accountId, null);
      K.current.account?.accountId === e.accountId &&
        (te(null), k(n.drafts), j(n.cursor !== null));
    },
    J = () => {
      q().catch(() => {});
    },
    Y = (e) => {
      ((G.current = e.path),
        s(`all`),
        x({ kind: `email`, path: e.path }),
        w(e),
        E(null));
    },
    ie = (e) => {
      ((G.current = e),
        x({ kind: `email`, path: e }),
        w(null),
        E(null),
        N(t, e).then(
          (t) => {
            G.current === e && w(t);
          },
          (t) => {
            G.current === e && E(D(t));
          },
        ));
    },
    oe = (e) => {
      ((G.current = null), s(`drafts`), x({ kind: `draft`, id: e }), L(null));
    },
    se = (e) => {
      if (R === null) return;
      let n = ee();
      (F(null),
        S(t, { accountId: R.accountId, clientDraftId: n, ...e, byAgent: !1 })
          .then(() => q().catch(() => {}))
          .then(
            () => oe(n),
            (e) => F(D(e)),
          ));
    },
    ue = (e, t, n) => {
      H.current ||
        ((H.current = !0),
        g(!0),
        v(null),
        (async () => {
          let r = t;
          for (; r < n; ) {
            let t = await e.next();
            if (V.current !== e) return;
            if (t === null) {
              m(!0);
              return;
            }
            ((r += t.length), l((e) => [...e, ...t]));
          }
        })()
          .catch((t) => {
            V.current === e && v(D(t));
          })
          .finally(() => {
            ((H.current = !1), V.current === e && g(!1));
          }));
    },
    de = () => {
      if (B === null || h) return;
      let e = u + ce;
      (d(e), c.length < e && !f && ue(B, c.length, e));
    },
    Q = () => {
      for (; re.current < le; ) {
        let e = U.current.shift();
        if (e === void 0) return;
        ((re.current += 1),
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
              (--re.current, Q());
            }));
      }
    };
  ((0, p.useEffect)(() => {
    _e(t).then(
      (e) => {
        (r(e), a(e[0]?.accountId ?? null));
      },
      (e) => {
        (r([]), v(D(e)));
      },
    );
  }, [t]),
    (0, p.useEffect)(() => {
      (l([]),
        k(null),
        x(null),
        w(null),
        (G.current = null),
        d(ce),
        m(!1),
        g(!1),
        (U.current = []),
        W.current.clear(),
        (V.current = B),
        (H.current = !1),
        B !== null && ue(B, 0, ce));
    }, [B]),
    (0, p.useEffect)(() => {
      for (let e of c.slice(0, u))
        e.headers === null &&
          !W.current.has(e.path) &&
          (W.current.add(e.path), U.current.push(e.path));
      Q();
    }, [t, c, u]),
    (0, p.useEffect)(() => {
      if (R === null || z !== null) return;
      let e = () => {
        document.visibilityState === `visible` && q().catch((e) => te(D(e)));
      };
      e();
      let t = setInterval(e, fe);
      return () => clearInterval(t);
    }, [t, R?.accountId, z]),
    (0, p.useEffect)(
      () =>
        ae(t, {
          getView: () => K.current,
          showEmail: Y,
          showDraft: oe,
          refreshDrafts: q,
        }),
      [t],
    ));
  let $ =
    y?.kind === `draft`
      ? ((O ?? []).find((e) => e.clientDraftId === y.id) ?? null)
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
            disabled: R === null || z !== null,
            onClick: () =>
              se({
                fields: { to: [], cc: [], subject: ``, body: `` },
                replyToGmailMessageId: null,
              }),
            children: `Compose`,
          }),
          P === null
            ? null
            : (0, X.jsx)(`p`, {
                className: `mail-status is-error`,
                role: `alert`,
                children: P,
              }),
          z === null
            ? null
            : (0, X.jsx)(`p`, { className: `mail-status`, children: z }),
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
                                y?.kind === `email` && y.path === e.path
                                  ? `true`
                                  : void 0,
                              "data-direction": e.headers?.direction ?? void 0,
                              onClick: () => ie(e.path),
                              children: [
                                (0, X.jsx)(`span`, {
                                  className: `mail-row-from`,
                                  children:
                                    e.headers === null
                                      ? ``
                                      : e.headers.direction === `sent`
                                        ? `To: ${me(e.headers.to[0] ?? ``)}`
                                        : me(e.headers.from),
                                }),
                                (0, X.jsx)(`span`, {
                                  className: `mail-row-date`,
                                  children: e.headers
                                    ? pe(e.headers.date)
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
                  !h && B !== null && (c.length > u || !f)
                    ? (0, X.jsx)(`button`, {
                        className: `button mail-more`,
                        onClick: de,
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
                  z === null
                    ? null
                    : (0, X.jsx)(`p`, {
                        className: `mail-status`,
                        children: z,
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
                              y?.kind === `draft` && y.id === e.clientDraftId
                                ? `true`
                                : void 0,
                            onClick: () => oe(e.clientDraftId),
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
          I === null
            ? null
            : (0, X.jsx)(`p`, {
                className: `mail-status`,
                role: `status`,
                children: I,
              }),
          y === null && I === null
            ? (0, X.jsx)(`p`, {
                className: `mail-status`,
                children: `Choose an email or a draft.`,
              })
            : null,
          y?.kind === `email`
            ? T === null
              ? C === null || C.path !== y.path
                ? (0, X.jsx)(`p`, {
                    className: `mail-status`,
                    role: `status`,
                    children: `Opening…`,
                  })
                : (0, X.jsx)(ye, {
                    email: C,
                    replyBlock: z,
                    onReply: () => se(he(C)),
                  })
              : (0, X.jsx)(`p`, {
                  className: `mail-status is-error`,
                  role: `alert`,
                  children: T,
                })
            : null,
          y?.kind === `draft` && R !== null
            ? $ !== null && !$.saving
              ? (0, X.jsx)(
                  be,
                  {
                    client: t,
                    accountId: R.accountId,
                    draft: $,
                    onChanged: J,
                    onClosed: (e) => {
                      (x(null), L(e), J());
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
function ye(e) {
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
              (0, X.jsx)(`dd`, { children: pe(t.headers.date) }),
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
function be(e) {
  let { client: t, accountId: n, draft: r, onChanged: i, onClosed: a } = e,
    [o, s] = (0, p.useState)(null),
    [c, l] = (0, p.useState)(null),
    [u, d] = (0, p.useState)(``),
    [m, h] = (0, p.useState)(``),
    [g, _] = (0, p.useState)(``),
    [v, ee] = (0, p.useState)(``),
    [y, b] = (0, p.useState)(!1),
    [S, T] = (0, p.useState)(!1),
    [E, O] = (0, p.useState)(null),
    k = { accountId: n, clientDraftId: r.clientDraftId },
    A = (e, t) => {
      (T(!0),
        O(null),
        e().then(
          () => {
            (T(!1), O({ text: t, isError: !1 }));
          },
          (e) => {
            (T(!1), O({ text: D(e), isError: !0 }));
          },
        ));
    },
    j = () => ({ to: Q(u), cc: Q(m), subject: g, body: v }),
    M = () => (b(!1), C(t, { ...k, fields: j(), byAgent: !1 }).then(i)),
    te = () => A(M, `Saved to Gmail`),
    N = () =>
      M().then(
        () => O({ text: `Saved to Gmail`, isError: !1 }),
        (e) => O({ text: D(e), isError: !0 }),
      ),
    P = () =>
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
    ne = () => {
      (b(!1),
        A(async () => {
          (await w(t, n, r.clientDraftId), a(`Draft deleted.`));
        }, `Deleted`));
    },
    F = () => {
      let e = j();
      (b(!1),
        T(!0),
        O({ text: `Sending…`, isError: !1 }),
        se(t, { ...k, fields: e }).then(
          () => a(`Sent: ${e.subject || `(no subject)`}`),
          (t) => {
            T(!1);
            let n =
              !(t instanceof f) ||
              [`send_unknown`, `service_unavailable`].includes(t.code);
            O({
              text: n
                ? `We could not confirm that “${e.subject || `(no subject)`}” was sent. Check Sent in Gmail before you press Send again.`
                : D(t),
              isError: !0,
            });
          },
        ));
    };
  if (
    ((0, p.useEffect)(() => {
      let e = !1;
      return (
        x(t, n, r.clientDraftId).then(
          (t) => {
            e || (s(t), d(Z(t.to)), h(Z(t.cc)), _(t.subject), ee(t.body));
          },
          (t) => {
            if (!e) {
              if (t instanceof f && t.code === `draft_gone`) {
                a(D(t));
                return;
              }
              l(D(t));
            }
          },
        ),
        () => {
          e = !0;
        }
      );
    }, [t, n, r.clientDraftId]),
    (0, p.useEffect)(() => {
      if (!y) return;
      let e = setTimeout(N, de);
      return () => clearTimeout(e);
    }, [y, u, m, g, v]),
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
  let I = [...Q(u), ...Q(m)].map($),
    L = () => {
      y && N();
    };
  return (0, X.jsxs)(`form`, {
    className: `mail-draft`,
    "aria-label": `Draft`,
    onSubmit: (e) => {
      (e.preventDefault(), te());
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
            readOnly: S,
            onBlur: L,
            onInput: (e) => {
              (d(e.currentTarget.value), b(!0));
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
            readOnly: S,
            onBlur: L,
            onInput: (e) => {
              (h(e.currentTarget.value), b(!0));
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
            readOnly: S,
            onBlur: L,
            onInput: (e) => {
              (_(e.currentTarget.value), b(!0));
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
            readOnly: S,
            onBlur: L,
            onInput: (e) => {
              (ee(e.currentTarget.value), b(!0));
            },
          }),
        ],
      }),
      (0, X.jsx)(`p`, {
        className: `mail-note`,
        "data-mail-send-recipients": I.join(`,`),
        children:
          I.length > 0
            ? `Send goes to: ${I.join(`, `)}`
            : `Add a recipient to send.`,
      }),
      (0, X.jsxs)(`div`, {
        className: `mail-actions`,
        children: [
          (0, X.jsx)(`button`, {
            className: `button is-primary`,
            type: `button`,
            disabled: S || I.length === 0,
            onClick: F,
            children: `Send`,
          }),
          (0, X.jsx)(`button`, {
            className: `button`,
            type: `submit`,
            disabled: S,
            children: `Save`,
          }),
          (0, X.jsx)(`button`, {
            className: `button`,
            type: `button`,
            disabled: S,
            onClick: P,
            children: `Copy`,
          }),
          (0, X.jsx)(`button`, {
            className: `button`,
            type: `button`,
            disabled: S,
            onClick: ne,
            children: `Delete`,
          }),
          E === null
            ? null
            : (0, X.jsx)(`span`, {
                className: E.isError
                  ? `mail-draft-status is-error`
                  : `mail-draft-status`,
                role: E.isError ? `alert` : `status`,
                children: E.text,
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
export { ve as MailApp };
