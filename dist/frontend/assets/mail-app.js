import { n as e } from "./rolldown-runtime.js";
import { r as t, t as n } from "./react.js";
import { a as r, n as i, o as a, r as o, s } from "./zod.js";
import { a as c, l, o as u, r as d, t as ee } from "./gmail-api.js";
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
function te() {
  return crypto.randomUUID();
}
function v(e) {
  if (e.to.length + e.cc.length > p)
    throw Error(`A draft can have at most ${p} recipients`);
  if (e.subject.length > m)
    throw Error(`A subject can have at most ${m} characters`);
  if (new TextEncoder().encode(e.body).byteLength > h)
    throw Error(`A draft can have at most 50 KB of text. Shorten the body.`);
}
function y(e, t, n) {
  return u(e, `/page/drafts/list`, { accountId: t, cursor: n }, g);
}
function b(e, t, n) {
  return u(e, `/page/drafts/get`, { accountId: t, clientDraftId: n }, _);
}
async function x(e, t) {
  (v(t.fields),
    await u(e, `/page/drafts/create`, t, a({ clientDraftId: s() })));
}
async function S(e, t) {
  (v(t.fields), await u(e, `/page/drafts/update`, t, a({ saved: o() })));
}
async function C(e, t, n) {
  await u(
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
  return e instanceof ee ? d(e) : e instanceof Error ? e.message : String(e);
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
function ne(e) {
  let t = /\/(\d{4})\/(\d{2})\/(\d{2})-[^/]*$/u.exec(e);
  return t ? `${t[1]}-${t[2]}-${t[3]}` : ``;
}
function re(e, t) {
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
async function j(e, t) {
  let n = await D(e, `/api/v1/files/read`, { path: t });
  if (n.status !== 200 || n.body === null || !(`content` in n.body)) {
    let e = n.body && `message` in n.body ? n.body.message : `HTTP ${n.status}`;
    throw Error(`Failed to read ${t}: ${e}`);
  }
  return re(t, n.body.content);
}
function M(e) {
  let t = /^(\d{2})-.*-([0-9a-f]{1,16})\.md$/u.exec(e);
  return t ? `${t[1]}-${t[2].padStart(16, `0`)}` : e;
}
function N(e) {
  return /^(\d{2})-/u.exec(e)?.[1] ?? e;
}
async function P(e, t, n, r) {
  let i = await D(e, `/api/v1/files/list`, {
    path: t,
    kind: n,
    order: `desc`,
    cursor: r,
    limit: 100,
  });
  if (
    i.status === 400 &&
    i.body &&
    `errorCode` in i.body &&
    i.body.errorCode === `invalid_cursor`
  )
    return `invalid_cursor`;
  if (i.status === 403) return `locked`;
  if (i.status === 404) return `missing`;
  if (
    i.status !== 200 ||
    i.body === null ||
    !(`items` in i.body) ||
    i.body.items === void 0
  ) {
    let e = i.body && `message` in i.body ? i.body.message : `HTTP ${i.status}`;
    throw Error(`Failed to list ${t}: ${e}`);
  }
  return {
    children: i.body.items.map((e) => ({
      path: e.path,
      name: e.name,
      kind: e.kind,
      locked: e.locked,
    })),
    cursor: i.body.cursor,
    isDone: i.body.isDone,
  };
}
async function F(e, t) {
  let n = [],
    r = null;
  for (;;) {
    let i = await P(e, t, `folder`, r);
    if (i === `invalid_cursor`) {
      ((n.length = 0), (r = null));
      continue;
    }
    if (i === `locked`) return null;
    if (i === `missing`) return [];
    if ((n.push(...i.children), i.isDone)) return n;
    r = i.cursor;
  }
}
function I(e, t) {
  let n = null,
    r = !1,
    i = [],
    a = new Set();
  return async function () {
    for (;;) {
      let o = i.length > 0 ? N(i[0].name) : null,
        s = o === null ? -1 : i.findIndex((e) => N(e.name) !== o);
      if (o !== null && (s !== -1 || r)) {
        let e = i.splice(0, s === -1 ? i.length : s);
        for (let t of e) a.add(t.path);
        return e.sort((e, t) => (M(e.name) < M(t.name) ? 1 : -1));
      }
      if (r) return null;
      let c = await P(e, t, `file`, n);
      if (c === `invalid_cursor`) {
        ((i = []), (n = null));
        continue;
      }
      if (c === `locked`) return `locked`;
      if (c === `missing`) {
        r = !0;
        continue;
      }
      (i.push(
        ...c.children.filter((e) => e.name.endsWith(`.md`) && !a.has(e.path)),
      ),
        (n = c.cursor),
        (r = c.isDone));
    }
  };
}
function ie(e, t) {
  let n = [],
    r = null,
    i = [],
    a = null,
    o = (e) => {
      for (let t of e) t.locked && n.push(t.path);
      return e.filter((e) => !e.locked).map((e) => e.path);
    };
  return {
    lockedFolders: n,
    async next() {
      for (;;) {
        if (a !== null) {
          let e = await a.next_day();
          if (
            (e === `locked` && n.push(a.path), e === `locked` || e === null)
          ) {
            a = null;
            continue;
          }
          return e.map((e) => ({
            path: e.path,
            subject: A(e.path),
            day: ne(e.path),
            locked: e.locked,
            headers: null,
          }));
        }
        if (i.length > 0) {
          let t = i.shift();
          a = { path: t, next_day: I(e, t) };
          continue;
        }
        if (r === null) {
          let i = await F(e, t);
          (i === null && n.push(t), (r = i === null ? [] : o(i)));
          continue;
        }
        let s = r[0];
        if (s === void 0) return null;
        let c = await F(e, s);
        if ((r.shift(), c === null)) {
          n.push(s);
          continue;
        }
        i.push(...o(c));
      }
    },
  };
}
var ae = 12e3,
  L = 300,
  R = 10,
  z = 25,
  B = new TextEncoder(),
  V = new TextDecoder(),
  H = `Saved as a Gmail draft and open in the Mail page. It was not sent. Only the member can send it.`;
function U(e, t) {
  let n = B.encode(e);
  return n.byteLength <= t
    ? e
    : `${V.decode(n.slice(0, t))}\n[Shortened. Open the file for the rest.]`;
}
function W(e) {
  return e.slice(0, R).map((e) => U(e, L));
}
function G(e) {
  return {
    path: e.path,
    from: U(e.headers.from, L),
    to: W(e.headers.to),
    cc: W(e.headers.cc),
    subject: U(e.headers.subject, L),
    date: e.headers.date,
    direction: e.headers.direction,
    body: U(e.body, ae),
  };
}
function oe(e) {
  return {
    draftId: e.clientDraftId,
    to: W(e.to),
    cc: W(e.cc),
    subject: U(e.subject, L),
    isReply: e.isReply,
    editedByAgent: e.agentEditedAt !== null,
  };
}
function K(e) {
  return {
    draftId: e.clientDraftId,
    to: W(e.to),
    cc: W(e.cc),
    subject: U(e.subject, L),
    body: U(e.body, ae),
    isReply: e.isReply,
    editedByAgent: e.agentEditedAt !== null,
  };
}
function q(e) {
  if (typeof e != `object` || !e || Array.isArray(e))
    throw Error(`The input must be an object`);
  return e;
}
function J(e, t) {
  let n = e[t];
  if (n !== void 0) {
    if (typeof n != `string`) throw Error(`${t} must be a string`);
    return n;
  }
}
function se(e, t) {
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
function ce(e) {
  let t = Y(J(e, `draftId`), `draftId`);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)
  )
    throw Error(
      `No draft has the id ${U(t, L)}. Call list_drafts to see the ids.`,
    );
  return t;
}
function le(e, t) {
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
          throw Error(E(e));
        }
      }),
    a = [
      i(`get_view`, async () => {
        let n = t.getView(),
          r =
            n.account && n.openDraftId
              ? await b(e, n.account.accountId, n.openDraftId).catch(() => null)
              : null;
        return {
          account: n.account?.emailAddress ?? null,
          canWriteDrafts: n.account?.canCompose ?? !1,
          folder: n.folder,
          openEmail: n.openEmail ? G(n.openEmail) : null,
          openDraft: r ? K(r) : null,
          emails: n.rows
            .slice(0, z)
            .map((e) => ({
              path: e.path,
              from: e.headers ? U(e.headers.from, L) : null,
              subject: U(e.headers?.subject ?? e.subject, L),
              date: e.headers?.date ?? e.day,
              direction: e.headers?.direction ?? null,
              locked: e.locked,
            })),
          draftCount: n.drafts.length,
        };
      }),
      i(`open_email`, async (n) => {
        let r = Y(J(q(n), `path`), `path`);
        if (!r.startsWith(`/`) || !r.endsWith(`.md`))
          throw Error(`path must be a Files path that ends with .md`);
        let i = await j(e, r);
        return (t.showEmail(i), G(i));
      }),
      i(`list_drafts`, () => ({
        drafts: t.getView().drafts.map(oe),
        note: `These are the newest drafts, without their text. To read one, ask the member to open it, then call get_view.`,
      })),
      i(`create_draft`, async (i) => {
        let a = q(i),
          o = {
            to: Y(se(a, `to`), `to`),
            cc: se(a, `cc`) ?? [],
            subject: Y(J(a, `subject`), `subject`),
            body: Y(J(a, `body`), `body`),
          },
          s = J(a, `replyToPath`);
        v(o);
        let c = n(),
          l = null;
        if (
          s !== void 0 &&
          ((l = (await j(e, s)).headers.gmailMessageId), l === null)
        )
          throw Error(
            `${s} has no Gmail id, so a reply cannot be made from it`,
          );
        let u = JSON.stringify([c.accountId, o, l]),
          d = r.get(u) ?? te();
        return (
          r.set(u, d),
          r.size > 20 && r.delete(r.keys().next().value),
          await x(e, {
            accountId: c.accountId,
            clientDraftId: d,
            fields: o,
            replyToGmailMessageId: l,
            byAgent: !0,
          }),
          await t.refreshDrafts().catch(() => {}),
          t.showDraft(d),
          { draftId: d, saved: !0, note: H }
        );
      }),
      i(`update_draft`, async (r) => {
        let i = q(r),
          a = ce(i),
          o = n(),
          s = await b(e, o.accountId, a),
          c = {
            to: se(i, `to`) ?? s.to,
            cc: se(i, `cc`) ?? s.cc,
            subject: J(i, `subject`) ?? s.subject,
            body: J(i, `body`) ?? s.body,
          };
        return (
          await S(e, {
            accountId: o.accountId,
            clientDraftId: a,
            fields: c,
            byAgent: !0,
          }),
          await t.refreshDrafts().catch(() => {}),
          t.showDraft(a),
          { draftId: a, saved: !0, note: H }
        );
      }),
      i(`delete_draft`, async (r) => {
        let i = ce(q(r));
        return (
          await C(e, n().accountId, i),
          await t.refreshDrafts().catch(() => {}),
          { draftId: i, deleted: !0 }
        );
      }),
    ];
  return () => {
    for (let e of a) e();
  };
}
var ue = 45e3;
async function de(e, t) {
  await u(e, `/page/drafts/send`, t, a({ sent: o() }), ue);
}
var X = n(),
  fe = 30,
  pe = 4,
  me = 3e3,
  he = 1e4,
  ge = 5e3,
  _e = 15e3;
function ve(e) {
  let t = new Date(e);
  return Number.isNaN(t.getTime())
    ? ``
    : t.toLocaleString(void 0, { dateStyle: `medium`, timeStyle: `short` });
}
function ye(e) {
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
function be(e) {
  let t = /^re:/iu.test(e.headers.subject)
      ? e.headers.subject
      : `Re: ${e.headers.subject}`,
    n = (e.body.length > me ? `${e.body.slice(0, me)}…` : e.body)
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
      body: `\n\nOn ${ve(e.headers.date)}, ${e.headers.from} wrote:\n${n}`,
    },
    replyToGmailMessageId: e.headers.gmailMessageId,
  };
}
function xe(e) {
  return e.isComposer
    ? e.canCompose
      ? null
      : `Drafts are off for ${e.emailAddress}. Open the Gmail page and press Allow drafts and Send.`
    : `Only the member who connected ${e.emailAddress} can write drafts for it.`;
}
async function Se(e, t) {
  let n = [],
    r = new Map(),
    i = null;
  do {
    let o = await u(e, `/page/status`, { cursor: i }, l);
    for (let i of o.accounts) {
      let o = `${i.accountId}:${i.connectionGeneration}`;
      (i.canRepair &&
        !t.has(o) &&
        (t.add(o),
        u(
          e,
          `/page/press-repair`,
          {
            accountId: i.accountId,
            expectedGeneration: i.connectionGeneration,
            clientRequestId: c(),
          },
          a({}),
        ).catch((e) => {
          console.error(
            `[MailApp.list_accounts] Failed to renew the Press grant`,
            { error: e, accountId: i.accountId },
          );
        })),
        i.syncStatus !== `disconnected` &&
          (n.push({
            accountId: i.accountId,
            emailAddress: i.emailAddress,
            destinationPath: i.destinationPath,
            canCompose: i.canCompose,
            isComposer: i.isComposer,
          }),
          r.set(i.accountId, i.newestEmailAt ?? 0)));
    }
    i = o.cursor;
  } while (i !== null);
  return { accounts: n, newestEmailAt: r };
}
function Ce(e) {
  let { client: t } = e,
    [n, r] = (0, f.useState)(null),
    [i, a] = (0, f.useState)(null),
    [o, s] = (0, f.useState)(`all`),
    [c, l] = (0, f.useState)([]),
    [u, d] = (0, f.useState)(fe),
    [ee, p] = (0, f.useState)(!1),
    [m, h] = (0, f.useState)(!1),
    [g, _] = (0, f.useState)(null),
    [v, b] = (0, f.useState)([]),
    [S, C] = (0, f.useState)(null),
    [w, T] = (0, f.useState)(null),
    [D, O] = (0, f.useState)(null),
    [k, A] = (0, f.useState)(null),
    [ne, re] = (0, f.useState)(!1),
    [M, N] = (0, f.useState)(null),
    [P, F] = (0, f.useState)(null),
    [I, ae] = (0, f.useState)(null),
    L = n?.find((e) => e.accountId === i) ?? null,
    R = L ? xe(L) : null,
    z = (0, f.useMemo)(
      () => (L === null ? null : ie(t, L.destinationPath)),
      [t, L?.destinationPath],
    ),
    B = (0, f.useRef)(null),
    V = (0, f.useRef)(!1),
    H = (0, f.useRef)([]),
    U = (0, f.useRef)(new Set()),
    W = (0, f.useRef)(0),
    G = (0, f.useRef)(null),
    oe = (0, f.useRef)(new Set()),
    K = (0, f.useRef)({
      account: L,
      folder: o,
      rows: c,
      openEmail: w,
      openDraftId: null,
      drafts: [],
    });
  K.current = {
    account: L,
    folder: o,
    rows: c,
    openEmail: S?.kind === `email` ? w : null,
    openDraftId: S?.kind === `draft` ? S.id : null,
    drafts: k ?? [],
  };
  let q = async () => {
      let e = K.current.account;
      if (e === null || xe(e) !== null) return;
      let n = await y(t, e.accountId, null);
      K.current.account?.accountId === e.accountId &&
        (N(null), A(n.drafts), re(n.cursor !== null));
    },
    J = () => {
      q().catch(() => {});
    },
    se = (e) => {
      ((G.current = e.path),
        s(`all`),
        C({ kind: `email`, path: e.path }),
        T(e),
        O(null));
    },
    Y = (e) => {
      if (
        ((G.current = e),
        C({ kind: `email`, path: e }),
        T(null),
        O(null),
        c.some((t) => t.path === e && t.locked))
      ) {
        O(
          `You cannot open ${e}. It is locked in Files. Ask a member who can manage it to give you access.`,
        );
        return;
      }
      j(t, e).then(
        (t) => {
          G.current === e && T(t);
        },
        (t) => {
          G.current === e && O(E(t));
        },
      );
    },
    ce = (e) => {
      ((G.current = null), s(`drafts`), C({ kind: `draft`, id: e }), ae(null));
    },
    ue = (e) => {
      if (L === null) return;
      let n = te();
      (F(null),
        x(t, { accountId: L.accountId, clientDraftId: n, ...e, byAgent: !1 })
          .then(() => q().catch(() => {}))
          .then(
            () => ce(n),
            (e) => F(E(e)),
          ));
    },
    de = (e, t, n) => {
      V.current ||
        ((V.current = !0),
        h(!0),
        _(null),
        (async () => {
          let r = t;
          for (; r < n; ) {
            let t = await e.next();
            if (B.current !== e) return;
            if ((b([...e.lockedFolders]), t === null)) {
              p(!0);
              return;
            }
            ((r += t.length),
              l((e) => {
                let n = new Set(e.map((e) => e.path));
                return [...e, ...t.filter((e) => !n.has(e.path))];
              }));
          }
        })()
          .catch((t) => {
            B.current === e && _(E(t));
          })
          .finally(() => {
            ((V.current = !1), B.current === e && h(!1));
          }));
    },
    me = () => {
      if (z === null || m) return;
      let e = u + fe;
      (d(e), c.length < e && !ee && de(z, c.length, e));
    },
    he = (e, n) => {
      ie(t, n)
        .next()
        .then((t) => {
          if (B.current !== e || t === null) return;
          let n = new Set(t.map((e) => e.path));
          l((e) => {
            if (e.length === 0) return e;
            let r = new Map(e.map((e) => [e.path, e]));
            return [
              ...t.map((e) => r.get(e.path) ?? e),
              ...e.filter((e) => !n.has(e.path)),
            ];
          });
        })
        .catch(() => {});
    },
    Q = () => {
      for (; W.current < pe; ) {
        let e = H.current.shift();
        if (e === void 0) return;
        ((W.current += 1),
          j(t, e)
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
              (--W.current, Q());
            }));
      }
    };
  ((0, f.useEffect)(() => {
    Se(t, oe.current).then(
      (e) => {
        (r(e.accounts), a(e.accounts[0]?.accountId ?? null));
      },
      (e) => {
        (r([]), _(E(e)));
      },
    );
  }, [t]),
    (0, f.useEffect)(() => {
      (l([]),
        A(null),
        C(null),
        T(null),
        (G.current = null),
        d(fe),
        p(!1),
        b([]),
        h(!1),
        (H.current = []),
        U.current.clear(),
        (B.current = z),
        (V.current = !1),
        z !== null && de(z, 0, fe));
    }, [z]),
    (0, f.useEffect)(() => {
      for (let e of c.slice(0, u))
        !e.locked &&
          e.headers === null &&
          !U.current.has(e.path) &&
          (U.current.add(e.path), H.current.push(e.path));
      Q();
    }, [t, c, u]),
    (0, f.useEffect)(() => {
      if (L === null || R !== null) return;
      let e = () => {
        document.visibilityState === `visible` && q().catch((e) => N(E(e)));
      };
      e();
      let t = setInterval(e, ge);
      return () => clearInterval(t);
    }, [t, L?.accountId, R]),
    (0, f.useEffect)(() => {
      if (z === null || L === null) return;
      let { accountId: e, destinationPath: n } = L,
        r = null,
        i = () => {
          document.visibilityState === `visible` &&
            Se(t, oe.current).then(
              (t) => {
                let i = t.newestEmailAt.get(e);
                i !== void 0 && (r !== null && i > r && he(z, n), (r = i));
              },
              () => {},
            );
        };
      i();
      let a = setInterval(i, _e);
      return () => clearInterval(a);
    }, [t, z]),
    (0, f.useEffect)(
      () =>
        le(t, {
          getView: () => K.current,
          showEmail: se,
          showDraft: ce,
          refreshDrafts: q,
        }),
      [t],
    ));
  let $ =
    S?.kind === `draft`
      ? ((k ?? []).find((e) => e.clientDraftId === S.id) ?? null)
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
            disabled: L === null || R !== null,
            onClick: () =>
              ue({
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
          R === null
            ? null
            : (0, X.jsx)(`p`, { className: `mail-status`, children: R }),
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
              k !== null && k.length > 0
                ? (0, X.jsx)(`span`, {
                    className: `mail-rail-count`,
                    children: k.length,
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
                  n !== null && n.length === 0 && g === null
                    ? (0, X.jsx)(`p`, {
                        className: `mail-status`,
                        children: `No Gmail account is connected. Connect one on the Gmail page.`,
                      })
                    : null,
                  L !== null && v.includes(L.destinationPath)
                    ? (0, X.jsxs)(`p`, {
                        className: `mail-status is-error`,
                        role: `alert`,
                        "data-mail-locked-folders": v.join(`,`),
                        children: [
                          `You cannot open `,
                          L.destinationPath,
                          `, so Mail cannot show its emails. Ask a member who can manage this folder in Files to give you access.`,
                        ],
                      })
                    : v.length > 0
                      ? (0, X.jsxs)(`p`, {
                          className: `mail-status`,
                          "data-mail-locked-folders": v.join(`,`),
                          children: [
                            `Mail skipped emails in folders you cannot open: `,
                            v.join(`, `),
                            `. Ask a member who can manage them in Files to give you access.`,
                          ],
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
                                S?.kind === `email` && S.path === e.path
                                  ? `true`
                                  : void 0,
                              "data-direction": e.headers?.direction ?? void 0,
                              "data-locked": e.locked ? `` : void 0,
                              onClick: () => Y(e.path),
                              children: [
                                (0, X.jsx)(`span`, {
                                  className: `mail-row-from`,
                                  children: e.locked
                                    ? (0, X.jsx)(`span`, {
                                        className: `mail-badge`,
                                        children: `Locked`,
                                      })
                                    : e.headers === null
                                      ? ``
                                      : e.headers.direction === `sent`
                                        ? `To: ${ye(e.headers.to[0] ?? ``)}`
                                        : ye(e.headers.from),
                                }),
                                (0, X.jsx)(`span`, {
                                  className: `mail-row-date`,
                                  children: e.headers
                                    ? ve(e.headers.date)
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
                  m
                    ? (0, X.jsx)(`p`, {
                        className: `mail-status`,
                        role: `status`,
                        children: `Loading…`,
                      })
                    : null,
                  !m && z !== null && (c.length > u || !ee)
                    ? (0, X.jsx)(`button`, {
                        className: `button mail-more`,
                        onClick: me,
                        children: `Show more`,
                      })
                    : null,
                  g === null
                    ? null
                    : (0, X.jsx)(`p`, {
                        className: `mail-status is-error`,
                        role: `alert`,
                        children: g,
                      }),
                ],
              })
            : (0, X.jsxs)(X.Fragment, {
                children: [
                  R === null
                    ? null
                    : (0, X.jsx)(`p`, {
                        className: `mail-status`,
                        children: R,
                      }),
                  M === null
                    ? null
                    : (0, X.jsx)(`p`, {
                        className: `mail-status is-error`,
                        role: `alert`,
                        children: M,
                      }),
                  k !== null && k.length === 0
                    ? (0, X.jsx)(`p`, {
                        className: `mail-status`,
                        children: `No drafts. Ask the agent to write one.`,
                      })
                    : null,
                  (0, X.jsx)(`ul`, {
                    className: `mail-rows`,
                    children: (k ?? []).map((e) =>
                      (0, X.jsx)(
                        `li`,
                        {
                          children: (0, X.jsxs)(`button`, {
                            className: `mail-row`,
                            "aria-current":
                              S?.kind === `draft` && S.id === e.clientDraftId
                                ? `true`
                                : void 0,
                            onClick: () => ce(e.clientDraftId),
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
                  ne
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
          S === null && I === null
            ? (0, X.jsx)(`p`, {
                className: `mail-status`,
                children: `Choose an email or a draft.`,
              })
            : null,
          S?.kind === `email`
            ? D === null
              ? w === null || w.path !== S.path
                ? (0, X.jsx)(`p`, {
                    className: `mail-status`,
                    role: `status`,
                    children: `Opening…`,
                  })
                : (0, X.jsx)(we, {
                    email: w,
                    replyBlock: R,
                    onReply: () => ue(be(w)),
                  })
              : (0, X.jsx)(`p`, {
                  className: `mail-status is-error`,
                  role: `alert`,
                  children: D,
                })
            : null,
          S?.kind === `draft` && L !== null
            ? $ !== null && !$.saving
              ? (0, X.jsx)(
                  Te,
                  {
                    client: t,
                    accountId: L.accountId,
                    draft: $,
                    onChanged: J,
                    onClosed: (e) => {
                      (C(null), ae(e), J());
                    },
                  },
                  `${$.clientDraftId}:${$.agentEditedAt ?? 0}`,
                )
              : (0, X.jsx)(`p`, {
                  className: `mail-status`,
                  role: `status`,
                  children:
                    k === null || $?.saving
                      ? `Opening the draft…`
                      : `This draft is not available. It may have been sent or deleted.`,
                })
            : null,
        ],
      }),
    ],
  });
}
function we(e) {
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
              (0, X.jsx)(`dd`, { children: ve(t.headers.date) }),
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
function Te(e) {
  let { client: t, accountId: n, draft: r, onChanged: i, onClosed: a } = e,
    [o, s] = (0, f.useState)(null),
    [c, l] = (0, f.useState)(null),
    [u, d] = (0, f.useState)(``),
    [p, m] = (0, f.useState)(``),
    [h, g] = (0, f.useState)(``),
    [_, te] = (0, f.useState)(``),
    [v, y] = (0, f.useState)(!1),
    [x, w] = (0, f.useState)(!1),
    [T, D] = (0, f.useState)(null),
    O = { accountId: n, clientDraftId: r.clientDraftId },
    k = (e, t) => {
      (w(!0),
        D(null),
        e().then(
          () => {
            (w(!1), D({ text: t, isError: !1 }));
          },
          (e) => {
            (w(!1), D({ text: E(e), isError: !0 }));
          },
        ));
    },
    A = () => ({ to: Q(u), cc: Q(p), subject: h, body: _ }),
    ne = () => (y(!1), S(t, { ...O, fields: A(), byAgent: !1 }).then(i)),
    re = () => k(ne, `Saved to Gmail`),
    j = () =>
      ne().then(
        () => D({ text: `Saved to Gmail`, isError: !1 }),
        (e) => D({ text: E(e), isError: !0 }),
      ),
    M = () =>
      k(async () => {
        let e = A(),
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
    N = () => {
      (y(!1),
        k(async () => {
          (await C(t, n, r.clientDraftId), a(`Draft deleted.`));
        }, `Deleted`));
    },
    P = () => {
      let e = A();
      (y(!1),
        w(!0),
        D({ text: `Sending…`, isError: !1 }),
        de(t, { ...O, fields: e }).then(
          () => a(`Sent: ${e.subject || `(no subject)`}`),
          (t) => {
            w(!1);
            let n =
              !(t instanceof ee) ||
              [`send_unknown`, `service_unavailable`].includes(t.code);
            D({
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
      let e = !1;
      return (
        b(t, n, r.clientDraftId).then(
          (t) => {
            e || (s(t), d(Z(t.to)), m(Z(t.cc)), g(t.subject), te(t.body));
          },
          (t) => {
            if (!e) {
              if (t instanceof ee && t.code === `draft_gone`) {
                a(E(t));
                return;
              }
              l(E(t));
            }
          },
        ),
        () => {
          e = !0;
        }
      );
    }, [t, n, r.clientDraftId]),
    (0, f.useEffect)(() => {
      if (!v) return;
      let e = setTimeout(j, he);
      return () => clearTimeout(e);
    }, [v, u, p, h, _]),
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
  let F = [...Q(u), ...Q(p)].map($),
    I = () => {
      v && j();
    };
  return (0, X.jsxs)(`form`, {
    className: `mail-draft`,
    "aria-label": `Draft`,
    onSubmit: (e) => {
      (e.preventDefault(), re());
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
            readOnly: x,
            onBlur: I,
            onInput: (e) => {
              (d(e.currentTarget.value), y(!0));
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
            value: p,
            readOnly: x,
            onBlur: I,
            onInput: (e) => {
              (m(e.currentTarget.value), y(!0));
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
            value: h,
            readOnly: x,
            onBlur: I,
            onInput: (e) => {
              (g(e.currentTarget.value), y(!0));
            },
          }),
        ],
      }),
      (0, X.jsxs)(`label`, {
        className: `mail-field is-body`,
        children: [
          (0, X.jsx)(`span`, { children: `Body` }),
          (0, X.jsx)(`textarea`, {
            value: _,
            readOnly: x,
            onBlur: I,
            onInput: (e) => {
              (te(e.currentTarget.value), y(!0));
            },
          }),
        ],
      }),
      (0, X.jsx)(`p`, {
        className: `mail-note`,
        "data-mail-send-recipients": F.join(`,`),
        children:
          F.length > 0
            ? `Send goes to: ${F.join(`, `)}`
            : `Add a recipient to send.`,
      }),
      (0, X.jsxs)(`div`, {
        className: `mail-actions`,
        children: [
          (0, X.jsx)(`button`, {
            className: `button is-primary`,
            type: `button`,
            disabled: x || F.length === 0,
            onClick: P,
            children: `Send`,
          }),
          (0, X.jsx)(`button`, {
            className: `button`,
            type: `submit`,
            disabled: x,
            children: `Save`,
          }),
          (0, X.jsx)(`button`, {
            className: `button`,
            type: `button`,
            disabled: x,
            onClick: M,
            children: `Copy`,
          }),
          (0, X.jsx)(`button`, {
            className: `button`,
            type: `button`,
            disabled: x,
            onClick: N,
            children: `Delete`,
          }),
          T === null
            ? null
            : (0, X.jsx)(`span`, {
                className: T.isError
                  ? `mail-draft-status is-error`
                  : `mail-draft-status`,
                role: T.isError ? `alert` : `status`,
                children: T.text,
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
export { Ce as MailApp };
