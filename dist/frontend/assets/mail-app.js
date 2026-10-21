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
function y() {
  return crypto.randomUUID();
}
function b(e) {
  if (e.to.length + e.cc.length > m)
    throw Error(`A draft can have at most ${m} recipients`);
  if (e.subject.length > h)
    throw Error(`A subject can have at most ${h} characters`);
  if (new TextEncoder().encode(e.body).byteLength > g)
    throw Error(`A draft can have at most 50 KB of text. Shorten the body.`);
}
function ee(e, t, n) {
  return u(e, `/page/drafts/list`, { accountId: t, cursor: n }, _);
}
function te(e, t, n) {
  return u(e, `/page/drafts/get`, { accountId: t, clientDraftId: n }, v);
}
async function x(e, t) {
  (b(t.fields),
    await u(e, `/page/drafts/create`, t, a({ clientDraftId: s() })));
}
async function S(e, t) {
  (b(t.fields), await u(e, `/page/drafts/update`, t, a({ saved: o() })));
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
  return e instanceof f ? d(e) : e instanceof Error ? e.message : String(e);
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
function j(e, t) {
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
async function M(e, t) {
  let n = await D(e, `/api/v1/files/read`, { path: t });
  if (n.status !== 200 || n.body === null || !(`content` in n.body)) {
    let e = n.body && `message` in n.body ? n.body.message : `HTTP ${n.status}`;
    throw Error(`Failed to read ${t}: ${e}`);
  }
  return j(t, n.body.content);
}
function N(e) {
  let t = /^(\d{2})-.*-([0-9a-f]{1,16})\.md$/u.exec(e);
  return t ? `${t[1]}-${t[2].padStart(16, `0`)}` : e;
}
function P(e) {
  return /^(\d{2})-/u.exec(e)?.[1] ?? e;
}
async function re(e, t, n, r) {
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
    let i = await re(e, t, `folder`, r);
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
function ie(e, t) {
  let n = null,
    r = !1,
    i = [],
    a = new Set();
  return async function () {
    for (;;) {
      let o = i.length > 0 ? P(i[0].name) : null,
        s = o === null ? -1 : i.findIndex((e) => P(e.name) !== o);
      if (o !== null && (s !== -1 || r)) {
        let e = i.splice(0, s === -1 ? i.length : s);
        for (let t of e) a.add(t.path);
        return e.sort((e, t) => (N(e.name) < N(t.name) ? 1 : -1));
      }
      if (r) return null;
      let c = await re(e, t, `file`, n);
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
function ae(e, t) {
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
          a = { path: t, next_day: ie(e, t) };
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
var I = 12e3,
  L = 300,
  R = 10,
  z = 25,
  B = new TextEncoder(),
  V = new TextDecoder(),
  H = `Saved as a Gmail draft and open in the Mail page. It was not sent. Only the member can send it.`,
  U = `The member has typed text in a draft that is not saved yet. Wait about 10 seconds for the autosave, or ask the member to save, then try again.`;
function W(e, t) {
  let n = B.encode(e);
  return n.byteLength <= t
    ? e
    : `${V.decode(n.slice(0, t))}\n[Shortened. Open the file for the rest.]`;
}
function G(e) {
  return e.slice(0, R).map((e) => W(e, L));
}
function oe(e) {
  return {
    path: e.path,
    from: W(e.headers.from, L),
    to: G(e.headers.to),
    cc: G(e.headers.cc),
    subject: W(e.headers.subject, L),
    date: e.headers.date,
    direction: e.headers.direction,
    body: W(e.body, I),
  };
}
function K(e) {
  return {
    draftId: e.clientDraftId,
    to: G(e.to),
    cc: G(e.cc),
    subject: W(e.subject, L),
    isReply: e.isReply,
    editedByAgent: e.agentEditedAt !== null,
  };
}
function se(e) {
  return {
    draftId: e.clientDraftId,
    to: G(e.to),
    cc: G(e.cc),
    subject: W(e.subject, L),
    body: W(e.body, I),
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
function Y(e, t) {
  let n = e[t];
  if (n !== void 0) {
    if (!Array.isArray(n) || !n.every((e) => typeof e == `string`))
      throw Error(`${t} must be a list of strings`);
    return n;
  }
}
function X(e, t) {
  if (e === void 0) throw Error(`${t} is required`);
  return e;
}
function ce(e) {
  let t = X(J(e, `draftId`), `draftId`);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)
  )
    throw Error(
      `No draft has the id ${W(t, L)}. Call list_drafts to see the ids.`,
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
    r = () => {
      if (t.getView().unsavedDraftId !== null) throw Error(U);
    },
    i = new Map(),
    a = (t, n) =>
      e.agent.registerTool(t, async (e) => {
        try {
          return await n(e);
        } catch (e) {
          throw Error(E(e));
        }
      }),
    o = [
      a(`get_view`, async () => {
        let n = t.getView(),
          r =
            n.account && n.openDraftId
              ? await te(e, n.account.accountId, n.openDraftId).catch(
                  () => null,
                )
              : null;
        return {
          account: n.account?.emailAddress ?? null,
          canWriteDrafts: n.account?.canCompose ?? !1,
          folder: n.folder,
          openEmail: n.openEmail ? oe(n.openEmail) : null,
          openDraft: r ? se(r) : null,
          emails: n.rows
            .slice(0, z)
            .map((e) => ({
              path: e.path,
              from: e.headers ? W(e.headers.from, L) : null,
              subject: W(e.headers?.subject ?? e.subject, L),
              date: e.headers?.date ?? e.day,
              direction: e.headers?.direction ?? null,
              locked: e.locked,
            })),
          draftCount: n.drafts.length,
        };
      }),
      a(`open_email`, async (n) => {
        let i = X(J(q(n), `path`), `path`);
        if (!i.startsWith(`/`) || !i.endsWith(`.md`))
          throw Error(`path must be a Files path that ends with .md`);
        let a = await M(e, i);
        return (r(), t.showEmail(a), oe(a));
      }),
      a(`list_drafts`, () => ({
        drafts: t.getView().drafts.map(K),
        note: `These are the newest drafts, without their text. To read one, ask the member to open it, then call get_view.`,
      })),
      a(`create_draft`, async (a) => {
        let o = q(a),
          s = {
            to: X(Y(o, `to`), `to`),
            cc: Y(o, `cc`) ?? [],
            subject: X(J(o, `subject`), `subject`),
            body: X(J(o, `body`), `body`),
          },
          c = J(o, `replyToPath`);
        b(s);
        let l = n();
        r();
        let u = null;
        if (
          c !== void 0 &&
          ((u = (await M(e, c)).headers.gmailMessageId), u === null)
        )
          throw Error(
            `${c} has no Gmail id, so a reply cannot be made from it`,
          );
        let d = JSON.stringify([l.accountId, s, u]),
          f = i.get(d) ?? y();
        return (
          i.set(d, f),
          i.size > 20 && i.delete(i.keys().next().value),
          await x(e, {
            accountId: l.accountId,
            clientDraftId: f,
            fields: s,
            replyToGmailMessageId: u,
            byAgent: !0,
          }),
          await t.refreshDrafts().catch(() => {}),
          t.showDraft(f),
          { draftId: f, saved: !0, note: H }
        );
      }),
      a(`update_draft`, async (i) => {
        let a = q(i),
          o = ce(a),
          s = n();
        r();
        let c = await te(e, s.accountId, o);
        r();
        let l = {
          to: Y(a, `to`) ?? c.to,
          cc: Y(a, `cc`) ?? c.cc,
          subject: J(a, `subject`) ?? c.subject,
          body: J(a, `body`) ?? c.body,
        };
        return (
          await S(e, {
            accountId: s.accountId,
            clientDraftId: o,
            fields: l,
            byAgent: !0,
          }),
          await t.refreshDrafts().catch(() => {}),
          t.showDraft(o),
          { draftId: o, saved: !0, note: H }
        );
      }),
      a(`delete_draft`, async (r) => {
        let i = ce(q(r)),
          a = t.getView();
        if (a.unsavedDraftId === i) throw Error(U);
        let o = a.drafts.find((e) => e.clientDraftId === i);
        if (o === void 0 || o.agentEditedAt !== o.updatedAt)
          throw Error(
            `Only the member can delete this draft, because the member changed it last. Ask them to delete it in the Mail page.`,
          );
        return (
          await C(e, n().accountId, i),
          await t.refreshDrafts().catch(() => {}),
          { draftId: i, deleted: !0 }
        );
      }),
    ];
  return () => {
    for (let e of o) e();
  };
}
var ue = 45e3;
async function de(e, t) {
  await u(e, `/page/drafts/send`, t, a({ sent: o() }), ue);
}
var Z = n(),
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
function Q(e) {
  return e.join(`, `);
}
function be(e) {
  return e
    .split(/[,;\n]/u)
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
}
function xe(e) {
  return /<([^<>]+)>\s*$/u.exec(e)?.[1] ?? e;
}
function Se(e) {
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
function Ce(e) {
  return e.isComposer
    ? e.canCompose
      ? null
      : `Drafts are off for ${e.emailAddress}. Open the Gmail page and press Allow drafts and Send.`
    : `Only the member who connected ${e.emailAddress} can write drafts for it.`;
}
async function we(e, t) {
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
function $(e) {
  let { client: t } = e,
    [n, r] = (0, p.useState)(null),
    [i, a] = (0, p.useState)(null),
    [o, s] = (0, p.useState)(`all`),
    [c, l] = (0, p.useState)([]),
    [u, d] = (0, p.useState)(fe),
    [f, m] = (0, p.useState)(!1),
    [h, g] = (0, p.useState)(!1),
    [_, v] = (0, p.useState)(null),
    [b, te] = (0, p.useState)([]),
    [S, C] = (0, p.useState)(null),
    [w, T] = (0, p.useState)(null),
    [D, O] = (0, p.useState)(null),
    [k, A] = (0, p.useState)(null),
    [ne, j] = (0, p.useState)(!1),
    [N, P] = (0, p.useState)(null),
    [re, F] = (0, p.useState)(null),
    [ie, I] = (0, p.useState)(null),
    [L, R] = (0, p.useState)(null),
    z = n?.find((e) => e.accountId === i) ?? null,
    B = z ? Ce(z) : null,
    V = (0, p.useMemo)(
      () => (z === null ? null : ae(t, z.destinationPath)),
      [t, z?.destinationPath],
    ),
    H = (0, p.useRef)(null),
    U = (0, p.useRef)(!1),
    W = (0, p.useRef)([]),
    G = (0, p.useRef)(new Set()),
    oe = (0, p.useRef)(0),
    K = (0, p.useRef)(null),
    se = (0, p.useRef)(new Set()),
    q = (0, p.useRef)({
      account: z,
      folder: o,
      rows: c,
      openEmail: w,
      openDraftId: null,
      unsavedDraftId: null,
      drafts: [],
    });
  q.current = {
    account: z,
    folder: o,
    rows: c,
    openEmail: S?.kind === `email` ? w : null,
    openDraftId: S?.kind === `draft` ? S.id : null,
    unsavedDraftId: re,
    drafts: k ?? [],
  };
  let J = async () => {
      let e = q.current.account;
      if (e === null || Ce(e) !== null) return;
      let n = await ee(t, e.accountId, null);
      q.current.account?.accountId === e.accountId &&
        (P(null), A(n.drafts), j(n.cursor !== null));
    },
    Y = () => {
      J().catch(() => {});
    },
    X = (e) => {
      ((K.current = e.path),
        s(`all`),
        C({ kind: `email`, path: e.path }),
        T(e),
        O(null));
    },
    ce = (e) => {
      if (
        ((K.current = e),
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
      M(t, e).then(
        (t) => {
          K.current === e && T(t);
        },
        (t) => {
          K.current === e && O(E(t));
        },
      );
    },
    ue = (e) => {
      ((K.current = null), s(`drafts`), C({ kind: `draft`, id: e }), R(null));
    },
    de = (e) => {
      if (z === null) return;
      let n = y();
      (I(null),
        x(t, { accountId: z.accountId, clientDraftId: n, ...e, byAgent: !1 })
          .then(() => J().catch(() => {}))
          .then(
            () => ue(n),
            (e) => I(E(e)),
          ));
    },
    me = (e, t, n) => {
      U.current ||
        ((U.current = !0),
        g(!0),
        v(null),
        (async () => {
          let r = t;
          for (; r < n; ) {
            let t = await e.next();
            if (H.current !== e) return;
            if ((te([...e.lockedFolders]), t === null)) {
              m(!0);
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
            H.current === e && v(E(t));
          })
          .finally(() => {
            ((U.current = !1), H.current === e && g(!1));
          }));
    },
    he = () => {
      if (V === null || h) return;
      let e = u + fe;
      (d(e), c.length < e && !f && me(V, c.length, e));
    },
    be = (e, n) => {
      ae(t, n)
        .next()
        .then((t) => {
          if (H.current !== e || t === null) return;
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
    xe = () => {
      for (; oe.current < pe; ) {
        let e = W.current.shift();
        if (e === void 0) return;
        ((oe.current += 1),
          M(t, e)
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
              (--oe.current, xe());
            }));
      }
    };
  ((0, p.useEffect)(() => {
    we(t, se.current).then(
      (e) => {
        (r(e.accounts), a(e.accounts[0]?.accountId ?? null));
      },
      (e) => {
        (r([]), v(E(e)));
      },
    );
  }, [t]),
    (0, p.useEffect)(() => {
      (l([]),
        A(null),
        C(null),
        T(null),
        (K.current = null),
        d(fe),
        m(!1),
        te([]),
        g(!1),
        (W.current = []),
        G.current.clear(),
        (H.current = V),
        (U.current = !1),
        V !== null && me(V, 0, fe));
    }, [V]),
    (0, p.useEffect)(() => {
      for (let e of c.slice(0, u))
        !e.locked &&
          e.headers === null &&
          !G.current.has(e.path) &&
          (G.current.add(e.path), W.current.push(e.path));
      xe();
    }, [t, c, u]),
    (0, p.useEffect)(() => {
      if (z === null || B !== null) return;
      let e = () => {
        document.visibilityState === `visible` && J().catch((e) => P(E(e)));
      };
      e();
      let t = setInterval(e, ge);
      return () => clearInterval(t);
    }, [t, z?.accountId, B]),
    (0, p.useEffect)(() => {
      if (V === null || z === null) return;
      let { accountId: e, destinationPath: n } = z,
        r = null,
        i = () => {
          document.visibilityState === `visible` &&
            we(t, se.current).then(
              (t) => {
                let i = t.newestEmailAt.get(e);
                i !== void 0 && (r !== null && i > r && be(V, n), (r = i));
              },
              () => {},
            );
        };
      i();
      let a = setInterval(i, _e);
      return () => clearInterval(a);
    }, [t, V]),
    (0, p.useEffect)(
      () =>
        le(t, {
          getView: () => q.current,
          showEmail: X,
          showDraft: ue,
          refreshDrafts: J,
        }),
      [t],
    ));
  let $ =
    S?.kind === `draft`
      ? ((k ?? []).find((e) => e.clientDraftId === S.id) ?? null)
      : null;
  return (0, Z.jsxs)(`div`, {
    className: `mail`,
    children: [
      (0, Z.jsxs)(`nav`, {
        className: `mail-rail`,
        "aria-label": `Mailboxes`,
        children: [
          (0, Z.jsx)(`button`, {
            className: `button is-primary`,
            disabled: z === null || B !== null,
            onClick: () =>
              de({
                fields: { to: [], cc: [], subject: ``, body: `` },
                replyToGmailMessageId: null,
              }),
            children: `Compose`,
          }),
          ie === null
            ? null
            : (0, Z.jsx)(`p`, {
                className: `mail-status is-error`,
                role: `alert`,
                children: ie,
              }),
          B === null
            ? null
            : (0, Z.jsx)(`p`, { className: `mail-status`, children: B }),
          (0, Z.jsx)(`button`, {
            className: `mail-rail-item`,
            "aria-current": o === `all` ? `page` : void 0,
            onClick: () => s(`all`),
            children: `All mail`,
          }),
          (0, Z.jsxs)(`button`, {
            className: `mail-rail-item`,
            "aria-current": o === `drafts` ? `page` : void 0,
            onClick: () => s(`drafts`),
            children: [
              `Drafts`,
              k !== null && k.length > 0
                ? (0, Z.jsx)(`span`, {
                    className: `mail-rail-count`,
                    children: k.length,
                  })
                : null,
            ],
          }),
          n !== null && n.length > 1
            ? (0, Z.jsxs)(`label`, {
                className: `mail-rail-account`,
                children: [
                  `Account`,
                  (0, Z.jsx)(`select`, {
                    value: i ?? ``,
                    onChange: (e) => a(e.currentTarget.value),
                    children: n.map((e) =>
                      (0, Z.jsx)(
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
      (0, Z.jsx)(`section`, {
        className: `mail-list`,
        "aria-label": o === `all` ? `All mail` : `Drafts`,
        children:
          o === `all`
            ? (0, Z.jsxs)(Z.Fragment, {
                children: [
                  n !== null && n.length === 0 && _ === null
                    ? (0, Z.jsx)(`p`, {
                        className: `mail-status`,
                        children: `No Gmail account is connected. Connect one on the Gmail page.`,
                      })
                    : null,
                  z !== null && b.includes(z.destinationPath)
                    ? (0, Z.jsxs)(`p`, {
                        className: `mail-status is-error`,
                        role: `alert`,
                        "data-mail-locked-folders": b.join(`,`),
                        children: [
                          `You cannot open `,
                          z.destinationPath,
                          `, so Mail cannot show its emails. Ask a member who can manage this folder in Files to give you access.`,
                        ],
                      })
                    : b.length > 0
                      ? (0, Z.jsxs)(`p`, {
                          className: `mail-status`,
                          "data-mail-locked-folders": b.join(`,`),
                          children: [
                            `Mail skipped emails in folders you cannot open: `,
                            b.join(`, `),
                            `. Ask a member who can manage them in Files to give you access.`,
                          ],
                        })
                      : null,
                  (0, Z.jsx)(`ul`, {
                    className: `mail-rows`,
                    children: c
                      .slice(0, u)
                      .map((e) =>
                        (0, Z.jsx)(
                          `li`,
                          {
                            children: (0, Z.jsxs)(`button`, {
                              className: `mail-row`,
                              "aria-current":
                                S?.kind === `email` && S.path === e.path
                                  ? `true`
                                  : void 0,
                              "data-direction": e.headers?.direction ?? void 0,
                              "data-locked": e.locked ? `` : void 0,
                              onClick: () => ce(e.path),
                              children: [
                                (0, Z.jsx)(`span`, {
                                  className: `mail-row-from`,
                                  children: e.locked
                                    ? (0, Z.jsx)(`span`, {
                                        className: `mail-badge`,
                                        children: `Locked`,
                                      })
                                    : e.headers === null
                                      ? ``
                                      : e.headers.direction === `sent`
                                        ? `To: ${ye(e.headers.to[0] ?? ``)}`
                                        : ye(e.headers.from),
                                }),
                                (0, Z.jsx)(`span`, {
                                  className: `mail-row-date`,
                                  children: e.headers
                                    ? ve(e.headers.date)
                                    : e.day,
                                }),
                                (0, Z.jsx)(`span`, {
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
                    ? (0, Z.jsx)(`p`, {
                        className: `mail-status`,
                        role: `status`,
                        children: `Loading…`,
                      })
                    : null,
                  !h && V !== null && (c.length > u || !f)
                    ? (0, Z.jsx)(`button`, {
                        className: `button mail-more`,
                        onClick: he,
                        children: `Show more`,
                      })
                    : null,
                  _ === null
                    ? null
                    : (0, Z.jsx)(`p`, {
                        className: `mail-status is-error`,
                        role: `alert`,
                        children: _,
                      }),
                ],
              })
            : (0, Z.jsxs)(Z.Fragment, {
                children: [
                  B === null
                    ? null
                    : (0, Z.jsx)(`p`, {
                        className: `mail-status`,
                        children: B,
                      }),
                  N === null
                    ? null
                    : (0, Z.jsx)(`p`, {
                        className: `mail-status is-error`,
                        role: `alert`,
                        children: N,
                      }),
                  k !== null && k.length === 0
                    ? (0, Z.jsx)(`p`, {
                        className: `mail-status`,
                        children: `No drafts. Ask the agent to write one.`,
                      })
                    : null,
                  (0, Z.jsx)(`ul`, {
                    className: `mail-rows`,
                    children: (k ?? []).map((e) =>
                      (0, Z.jsx)(
                        `li`,
                        {
                          children: (0, Z.jsxs)(`button`, {
                            className: `mail-row`,
                            "aria-current":
                              S?.kind === `draft` && S.id === e.clientDraftId
                                ? `true`
                                : void 0,
                            onClick: () => ue(e.clientDraftId),
                            children: [
                              (0, Z.jsx)(`span`, {
                                className: `mail-row-from`,
                                children:
                                  e.to.length > 0
                                    ? `To: ${Q(e.to)}`
                                    : `No recipients`,
                              }),
                              (0, Z.jsx)(`span`, {
                                className: `mail-row-date`,
                                children:
                                  e.agentEditedAt === null
                                    ? null
                                    : (0, Z.jsx)(`span`, {
                                        className: `mail-badge`,
                                        children: `Agent`,
                                      }),
                              }),
                              (0, Z.jsx)(`span`, {
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
                    ? (0, Z.jsx)(`p`, {
                        className: `mail-status`,
                        children: `Showing the 25 newest drafts.`,
                      })
                    : null,
                ],
              }),
      }),
      (0, Z.jsxs)(`main`, {
        className: `mail-reader`,
        children: [
          L === null
            ? null
            : (0, Z.jsx)(`p`, {
                className: `mail-status`,
                role: `status`,
                children: L,
              }),
          S === null && L === null
            ? (0, Z.jsx)(`p`, {
                className: `mail-status`,
                children: `Choose an email or a draft.`,
              })
            : null,
          S?.kind === `email`
            ? D === null
              ? w === null || w.path !== S.path
                ? (0, Z.jsx)(`p`, {
                    className: `mail-status`,
                    role: `status`,
                    children: `Opening…`,
                  })
                : (0, Z.jsx)(Te, {
                    email: w,
                    replyBlock: B,
                    onReply: () => de(Se(w)),
                  })
              : (0, Z.jsx)(`p`, {
                  className: `mail-status is-error`,
                  role: `alert`,
                  children: D,
                })
            : null,
          S?.kind === `draft` && z !== null
            ? $ !== null && !$.saving
              ? (0, Z.jsx)(
                  Ee,
                  {
                    client: t,
                    accountId: z.accountId,
                    draft: $,
                    onUnsavedChange: F,
                    onChanged: Y,
                    onClosed: (e) => {
                      (C(null), R(e), Y());
                    },
                  },
                  `${$.clientDraftId}:${$.agentEditedAt ?? 0}`,
                )
              : (0, Z.jsx)(`p`, {
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
function Te(e) {
  let { email: t, replyBlock: n, onReply: r } = e;
  return (0, Z.jsxs)(`article`, {
    className: `mail-email`,
    "aria-label": t.headers.subject,
    children: [
      (0, Z.jsxs)(`header`, {
        className: `mail-email-header`,
        children: [
          (0, Z.jsx)(`h1`, { children: t.headers.subject }),
          (0, Z.jsxs)(`dl`, {
            children: [
              (0, Z.jsx)(`dt`, { children: `From` }),
              (0, Z.jsx)(`dd`, { children: t.headers.from }),
              (0, Z.jsx)(`dt`, { children: `To` }),
              (0, Z.jsx)(`dd`, { children: Q(t.headers.to) }),
              t.headers.cc.length > 0
                ? (0, Z.jsxs)(Z.Fragment, {
                    children: [
                      (0, Z.jsx)(`dt`, { children: `Cc` }),
                      (0, Z.jsx)(`dd`, { children: Q(t.headers.cc) }),
                    ],
                  })
                : null,
              (0, Z.jsx)(`dt`, { children: `Date` }),
              (0, Z.jsx)(`dd`, { children: ve(t.headers.date) }),
            ],
          }),
          (0, Z.jsxs)(`div`, {
            className: `mail-actions`,
            children: [
              (0, Z.jsx)(`button`, {
                className: `button`,
                disabled: n !== null || t.headers.gmailMessageId === null,
                onClick: r,
                children: `Reply`,
              }),
              n === null
                ? null
                : (0, Z.jsx)(`span`, {
                    className: `mail-draft-status`,
                    children: n,
                  }),
            ],
          }),
        ],
      }),
      (0, Z.jsx)(`div`, { className: `mail-email-body`, children: t.body }),
    ],
  });
}
function Ee(e) {
  let {
      client: t,
      accountId: n,
      draft: r,
      onUnsavedChange: i,
      onChanged: a,
      onClosed: o,
    } = e,
    [s, c] = (0, p.useState)(null),
    [l, u] = (0, p.useState)(null),
    [d, m] = (0, p.useState)(``),
    [h, g] = (0, p.useState)(``),
    [_, v] = (0, p.useState)(``),
    [y, b] = (0, p.useState)(``),
    [ee, x] = (0, p.useState)(!1),
    [w, T] = (0, p.useState)(!1),
    [D, O] = (0, p.useState)(null),
    k = (0, p.useRef)(0),
    A = (0, p.useRef)(!1),
    ne = { accountId: n, clientDraftId: r.clientDraftId },
    j = () => {
      ((k.current += 1), x(!0), i(r.clientDraftId));
    },
    M = (e, t) => {
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
    N = () => ({ to: be(d), cc: be(h), subject: _, body: y }),
    P = () => {
      let e = k.current;
      return (
        x(!1),
        S(t, { ...ne, fields: N(), byAgent: !1 }).then(() => {
          (!A.current && k.current === e && i(null), a());
        })
      );
    },
    re = () => M(P, `Saved to Gmail`),
    F = () =>
      P().then(
        () => O({ text: `Saved to Gmail`, isError: !1 }),
        (e) => O({ text: E(e), isError: !0 }),
      ),
    ie = () =>
      M(async () => {
        let e = N(),
          t = [
            `To: ${Q(e.to)}`,
            ...(e.cc.length > 0 ? [`Cc: ${Q(e.cc)}`] : []),
            `Subject: ${e.subject}`,
            ``,
            e.body,
          ].join(`
`);
        await navigator.clipboard.writeText(t);
      }, `Copied`),
    ae = () => {
      (x(!1),
        M(async () => {
          (await C(t, n, r.clientDraftId), o(`Draft deleted.`));
        }, `Deleted`));
    },
    I = () => {
      let e = N();
      (x(!1),
        T(!0),
        O({ text: `Sending…`, isError: !1 }),
        de(t, { ...ne, fields: e }).then(
          () => o(`Sent: ${e.subject || `(no subject)`}`),
          (t) => {
            T(!1);
            let n =
              !(t instanceof f) ||
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
    ((0, p.useEffect)(() => {
      let e = !1;
      return (
        te(t, n, r.clientDraftId).then(
          (t) => {
            e || (c(t), m(Q(t.to)), g(Q(t.cc)), v(t.subject), b(t.body));
          },
          (t) => {
            if (!e) {
              if (t instanceof f && t.code === `draft_gone`) {
                o(E(t));
                return;
              }
              u(E(t));
            }
          },
        ),
        () => {
          e = !0;
        }
      );
    }, [t, n, r.clientDraftId]),
    (0, p.useEffect)(() => {
      if (!ee) return;
      let e = setTimeout(F, he);
      return () => clearTimeout(e);
    }, [ee, d, h, _, y]),
    (0, p.useEffect)(
      () => (
        (A.current = !1),
        () => {
          ((A.current = !0), i(null));
        }
      ),
      [i],
    ),
    l !== null)
  )
    return (0, Z.jsx)(`p`, {
      className: `mail-status is-error`,
      role: `alert`,
      children: l,
    });
  if (s === null)
    return (0, Z.jsx)(`p`, {
      className: `mail-status`,
      role: `status`,
      children: `Opening the draft…`,
    });
  let L = [...be(d), ...be(h)].map(xe),
    R = () => {
      ee && F();
    };
  return (0, Z.jsxs)(`form`, {
    className: `mail-draft`,
    "aria-label": `Draft`,
    onSubmit: (e) => {
      (e.preventDefault(), re());
    },
    children: [
      (0, Z.jsxs)(`header`, {
        className: `mail-draft-header`,
        children: [
          (0, Z.jsx)(`h1`, { children: `Draft` }),
          r.agentEditedAt === null
            ? null
            : (0, Z.jsx)(`span`, {
                className: `mail-badge`,
                children: `Edited by the agent`,
              }),
        ],
      }),
      (0, Z.jsxs)(`label`, {
        className: `mail-field`,
        children: [
          (0, Z.jsx)(`span`, { children: `To` }),
          (0, Z.jsx)(`input`, {
            value: d,
            readOnly: w,
            onBlur: R,
            onInput: (e) => {
              (m(e.currentTarget.value), j());
            },
            autoComplete: `off`,
          }),
        ],
      }),
      (0, Z.jsxs)(`label`, {
        className: `mail-field`,
        children: [
          (0, Z.jsx)(`span`, { children: `Cc` }),
          (0, Z.jsx)(`input`, {
            value: h,
            readOnly: w,
            onBlur: R,
            onInput: (e) => {
              (g(e.currentTarget.value), j());
            },
            autoComplete: `off`,
          }),
        ],
      }),
      (0, Z.jsxs)(`label`, {
        className: `mail-field`,
        children: [
          (0, Z.jsx)(`span`, { children: `Subject` }),
          (0, Z.jsx)(`input`, {
            value: _,
            readOnly: w,
            onBlur: R,
            onInput: (e) => {
              (v(e.currentTarget.value), j());
            },
          }),
        ],
      }),
      (0, Z.jsxs)(`label`, {
        className: `mail-field is-body`,
        children: [
          (0, Z.jsx)(`span`, { children: `Body` }),
          (0, Z.jsx)(`textarea`, {
            value: y,
            readOnly: w,
            onBlur: R,
            onInput: (e) => {
              (b(e.currentTarget.value), j());
            },
          }),
        ],
      }),
      (0, Z.jsx)(`p`, {
        className: `mail-note`,
        "data-mail-send-recipients": L.join(`,`),
        children:
          L.length > 0
            ? `Send goes to: ${L.join(`, `)}`
            : `Add a recipient to send.`,
      }),
      (0, Z.jsxs)(`div`, {
        className: `mail-actions`,
        children: [
          (0, Z.jsx)(`button`, {
            className: `button is-primary`,
            type: `button`,
            disabled: w || L.length === 0,
            onClick: I,
            children: `Send`,
          }),
          (0, Z.jsx)(`button`, {
            className: `button`,
            type: `submit`,
            disabled: w,
            children: `Save`,
          }),
          (0, Z.jsx)(`button`, {
            className: `button`,
            type: `button`,
            disabled: w,
            onClick: ie,
            children: `Copy`,
          }),
          (0, Z.jsx)(`button`, {
            className: `button`,
            type: `button`,
            disabled: w,
            onClick: ae,
            children: `Delete`,
          }),
          D === null
            ? null
            : (0, Z.jsx)(`span`, {
                className: D.isError
                  ? `mail-draft-status is-error`
                  : `mail-draft-status`,
                role: D.isError ? `alert` : `status`,
                children: D.text,
              }),
        ],
      }),
      (0, Z.jsx)(`p`, {
        className: `mail-note`,
        children: `This is a Gmail draft. It also shows in Gmail, where Gmail's own Send works. When the agent changes this draft, its version replaces text you did not save.`,
      }),
    ],
  });
}
export { $ as MailApp };
