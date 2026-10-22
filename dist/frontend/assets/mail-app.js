import { n as e } from "./rolldown-runtime.js";
import { r as t, t as n } from "./react.js";
import { a as r, n as i, o as a, r as o, s } from "./zod.js";
import { a as c, l, o as u, r as d, t as f } from "./gmail-api.js";
var p = e(t(), 1),
  m = 50,
  h = 998,
  g = 5e4,
  _ = a({
    clientDraftId: s(),
    to: i(s()),
    cc: i(s()),
    subject: s(),
    isReply: o(),
    saving: o(),
    agentEditedAt: r().nullable(),
    updatedAt: r(),
  }),
  v = a({ drafts: i(_).max(25), cursor: s().nullable() }),
  y = a({
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
function b(e) {
  if (e.to.length + e.cc.length > m)
    throw Error(`A draft can have at most ${m} recipients`);
  if (e.subject.length > h)
    throw Error(`A subject can have at most ${h} characters`);
  if (new TextEncoder().encode(e.body).byteLength > g)
    throw Error(`A draft can have at most 50 KB of text. Shorten the body.`);
}
function x(e, t, n) {
  return u(e, `/page/drafts/list`, { accountId: t, cursor: n }, v);
}
function S(e, t, n) {
  return u(e, `/page/drafts/get`, { accountId: t, clientDraftId: n }, y);
}
async function C(e, t) {
  (b(t.fields),
    await u(e, `/page/drafts/create`, t, a({ clientDraftId: s() })));
}
async function w(e, t) {
  (b(t.fields), await u(e, `/page/drafts/update`, t, a({ saved: o() })));
}
async function T(e, t, n) {
  await u(
    e,
    `/page/drafts/delete`,
    { accountId: t, clientDraftId: n },
    a({ deleted: o() }),
  );
}
var E = 4;
function D(e) {
  return new Promise((t) => setTimeout(t, e));
}
function O(e) {
  return e instanceof f ? d(e) : e instanceof Error ? e.message : String(e);
}
async function k(e, t, n) {
  for (let r = 0; ; r += 1) {
    let i = await e.fetchJson(t, n),
      a = i.body,
      o =
        i.status === 429 && typeof a == `object` && a && `retryAfterMs` in a
          ? a.retryAfterMs
          : void 0;
    if (typeof o == `number` && r < E) await D(o + Math.random() * 250);
    else return i;
  }
}
function A(e) {
  return typeof e == `string` ? e : ``;
}
function j(e) {
  return Array.isArray(e) ? e.filter((e) => typeof e == `string`) : [];
}
function te(e) {
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
function N(e, t) {
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
      from: A(n.from),
      to: j(n.to),
      cc: j(n.cc),
      subject: A(n.subject) || te(e),
      date: A(n.date),
      direction: i === `sent` || i === `received` ? i : null,
      gmailMessageId: A(n[`gmail-message-id`]) || null,
    },
    body: r.trimEnd(),
  };
}
async function P(e, t) {
  let n = await k(e, `/api/v1/files/read`, { path: t });
  if (n.status !== 200 || n.body === null || !(`content` in n.body)) {
    let e = n.body && `message` in n.body ? n.body.message : `HTTP ${n.status}`;
    throw Error(`Failed to read ${t}: ${e}`);
  }
  return N(t, n.body.content);
}
function F(e) {
  let t = /^(\d{2})-.*-([0-9a-f]{1,16})\.md$/u.exec(e);
  return t ? `${t[1]}-${t[2].padStart(16, `0`)}` : e;
}
function ne(e) {
  return /^(\d{2})-/u.exec(e)?.[1] ?? e;
}
async function re(e, t, n, r) {
  let i = await k(e, `/api/v1/files/list`, {
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
async function ie(e, t) {
  let n = [],
    r = null;
  for (;;) {
    let i = await re(e, t, `folder`, r);
    if (i === `invalid_cursor`) ((n.length = 0), (r = null));
    else {
      if (i === `locked`) return null;
      if (i === `missing`) return [];
      if ((n.push(...i.children), i.isDone)) return n;
      r = i.cursor;
    }
  }
}
function ae(e, t) {
  let n = null,
    r = !1,
    i = [],
    a = new Set();
  return async function () {
    for (;;) {
      let o = i.length > 0 ? ne(i[0].name) : null,
        s = o === null ? -1 : i.findIndex((e) => ne(e.name) !== o);
      if (o !== null && (s !== -1 || r)) {
        let e = i.splice(0, s === -1 ? i.length : s);
        for (let t of e) a.add(t.path);
        return e.sort((e, t) => (F(e.name) < F(t.name) ? 1 : -1));
      }
      if (r) return null;
      let c = await re(e, t, `file`, n);
      if (c === `invalid_cursor`) ((i = []), (n = null));
      else {
        if (c === `locked`) return `locked`;
        c === `missing`
          ? (r = !0)
          : (i.push(
              ...c.children.filter(
                (e) => e.name.endsWith(`.md`) && !a.has(e.path),
              ),
            ),
            (n = c.cursor),
            (r = c.isDone));
      }
    }
  };
}
function oe(e, t) {
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
            subject: te(e.path),
            day: M(e.path),
            locked: e.locked,
            headers: null,
          }));
        }
        if (i.length > 0) {
          let t = i.shift();
          a = { path: t, next_day: ae(e, t) };
          continue;
        }
        if (r === null) {
          let i = await ie(e, t);
          (i === null && n.push(t), (r = i === null ? [] : o(i)));
          continue;
        }
        let s = r[0];
        if (s === void 0) return null;
        let c = await ie(e, s);
        (r.shift(), c === null ? n.push(s) : i.push(...o(c)));
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
function K(e) {
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
function se(e) {
  return {
    draftId: e.clientDraftId,
    to: G(e.to),
    cc: G(e.cc),
    subject: W(e.subject, L),
    isReply: e.isReply,
    editedByAgent: e.agentEditedAt !== null,
  };
}
function ce(e) {
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
function le(e, t) {
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
function ue(e) {
  let t = Y(J(e, `draftId`), `draftId`);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)
  )
    throw Error(
      `No draft has the id ${W(t, L)}. Call list_drafts to see the ids.`,
    );
  return t;
}
function de(e, t) {
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
          throw Error(O(e));
        }
      }),
    o = [
      a(`get_view`, async () => {
        let n = t.getView(),
          r =
            n.account && n.openDraftId
              ? await S(e, n.account.accountId, n.openDraftId).catch(() => null)
              : null;
        return {
          account: n.account?.emailAddress ?? null,
          canWriteDrafts: n.account?.canCompose ?? !1,
          folder: n.folder,
          openEmail: n.openEmail ? K(n.openEmail) : null,
          openDraft: r ? ce(r) : null,
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
        let i = Y(J(q(n), `path`), `path`);
        if (!i.startsWith(`/`) || !i.endsWith(`.md`))
          throw Error(`path must be a Files path that ends with .md`);
        let a = await P(e, i);
        return (r(), t.showEmail(a), K(a));
      }),
      a(`list_drafts`, () => ({
        drafts: t.getView().drafts.map(se),
        note: `These are the newest drafts, without their text. To read one, ask the member to open it, then call get_view.`,
      })),
      a(`create_draft`, async (a) => {
        let o = q(a),
          s = {
            to: Y(le(o, `to`), `to`),
            cc: le(o, `cc`) ?? [],
            subject: Y(J(o, `subject`), `subject`),
            body: Y(J(o, `body`), `body`),
          },
          c = J(o, `replyToPath`);
        b(s);
        let l = n();
        r();
        let u = null;
        if (
          c !== void 0 &&
          ((u = (await P(e, c)).headers.gmailMessageId), u === null)
        )
          throw Error(
            `${c} has no Gmail id, so a reply cannot be made from it`,
          );
        let d = JSON.stringify([l.accountId, s, u]),
          f = i.get(d) ?? ee();
        return (
          i.set(d, f),
          i.size > 20 && i.delete(i.keys().next().value),
          await C(e, {
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
          o = ue(a),
          s = n();
        r();
        let c = await S(e, s.accountId, o);
        r();
        let l = {
          to: le(a, `to`) ?? c.to,
          cc: le(a, `cc`) ?? c.cc,
          subject: J(a, `subject`) ?? c.subject,
          body: J(a, `body`) ?? c.body,
        };
        return (
          await w(e, {
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
        let i = ue(q(r)),
          a = t.getView();
        if (a.unsavedDraftId === i) throw Error(U);
        let o = a.drafts.find((e) => e.clientDraftId === i);
        if (o === void 0 || o.agentEditedAt !== o.updatedAt)
          throw Error(
            `Only the member can delete this draft, because the member changed it last. Ask them to delete it in the Mail page.`,
          );
        return (
          await T(e, n().accountId, i),
          await t.refreshDrafts().catch(() => {}),
          { draftId: i, deleted: !0 }
        );
      }),
    ];
  return () => {
    for (let e of o) e();
  };
}
var fe = 45e3;
async function pe(e, t) {
  await u(e, `/page/drafts/send`, t, a({ sent: o() }), fe);
}
var X = n(),
  me = 30,
  he = 4,
  ge = 3e3,
  _e = 1e4,
  ve = 5e3,
  ye = 15e3;
function be(e) {
  let t = new Date(e);
  return Number.isNaN(t.getTime())
    ? ``
    : t.toLocaleString(void 0, { dateStyle: `medium`, timeStyle: `short` });
}
function xe(e) {
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
function Se(e) {
  let t = /^re:/iu.test(e.headers.subject)
      ? e.headers.subject
      : `Re: ${e.headers.subject}`,
    n = (e.body.length > ge ? `${e.body.slice(0, ge)}…` : e.body)
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
      body: `\n\nOn ${be(e.headers.date)}, ${e.headers.from} wrote:\n${n}`,
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
function Te(e) {
  let { client: t } = e,
    [n, r] = (0, p.useState)(null),
    [i, a] = (0, p.useState)(null),
    [o, s] = (0, p.useState)(`all`),
    [c, l] = (0, p.useState)([]),
    [u, d] = (0, p.useState)(me),
    [f, m] = (0, p.useState)(!1),
    [h, g] = (0, p.useState)(!1),
    [_, v] = (0, p.useState)(null),
    [y, b] = (0, p.useState)([]),
    [S, w] = (0, p.useState)(null),
    [T, E] = (0, p.useState)(null),
    [D, k] = (0, p.useState)(null),
    [A, j] = (0, p.useState)(null),
    [te, M] = (0, p.useState)(!1),
    [N, F] = (0, p.useState)(null),
    [ne, re] = (0, p.useState)(null),
    [ie, ae] = (0, p.useState)(null),
    [I, L] = (0, p.useState)(null),
    R = n?.find((e) => e.accountId === i) ?? null,
    z = R ? Ce(R) : null,
    B = (0, p.useMemo)(
      () => (R === null ? null : oe(t, R.destinationPath)),
      [t, R?.destinationPath],
    ),
    V = (0, p.useRef)(null),
    H = (0, p.useRef)(!1),
    U = (0, p.useRef)([]),
    W = (0, p.useRef)(new Set()),
    G = (0, p.useRef)(0),
    K = (0, p.useRef)(null),
    se = (0, p.useRef)(new Set()),
    ce = (0, p.useRef)({
      account: R,
      folder: o,
      rows: c,
      openEmail: T,
      openDraftId: null,
      unsavedDraftId: null,
      drafts: [],
    });
  ce.current = {
    account: R,
    folder: o,
    rows: c,
    openEmail: S?.kind === `email` ? T : null,
    openDraftId: S?.kind === `draft` ? S.id : null,
    unsavedDraftId: ne,
    drafts: A ?? [],
  };
  let q = async () => {
      let e = ce.current.account;
      if (e === null || Ce(e) !== null) return;
      let n = await x(t, e.accountId, null);
      ce.current.account?.accountId === e.accountId &&
        (F(null), j(n.drafts), M(n.cursor !== null));
    },
    J = () => {
      q().catch(() => {});
    },
    le = (e) => {
      ((K.current = e.path),
        s(`all`),
        w({ kind: `email`, path: e.path }),
        E(e),
        k(null));
    },
    Y = (e) => {
      ((K.current = e),
        w({ kind: `email`, path: e }),
        E(null),
        k(null),
        c.some((t) => t.path === e && t.locked)
          ? k(
              `You cannot open ${e}. It is locked in Files. Ask a member who can manage it to give you access.`,
            )
          : P(t, e).then(
              (t) => {
                K.current === e && E(t);
              },
              (t) => {
                K.current === e && k(O(t));
              },
            ));
    },
    ue = (e) => {
      ((K.current = null), s(`drafts`), w({ kind: `draft`, id: e }), L(null));
    },
    fe = (e) => {
      if (R === null) return;
      let n = ee();
      (ae(null),
        C(t, { accountId: R.accountId, clientDraftId: n, ...e, byAgent: !1 })
          .then(() => q().catch(() => {}))
          .then(
            () => ue(n),
            (e) => ae(O(e)),
          ));
    },
    pe = (e, t, n) => {
      H.current ||
        ((H.current = !0),
        g(!0),
        v(null),
        (async () => {
          let r = t;
          for (; r < n;) {
            let t = await e.next();
            if (V.current !== e) return;
            if ((b([...e.lockedFolders]), t === null)) {
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
            V.current === e && v(O(t));
          })
          .finally(() => {
            ((H.current = !1), V.current === e && g(!1));
          }));
    },
    ge = () => {
      if (B === null || h) return;
      let e = u + me;
      (d(e), c.length < e && !f && pe(B, c.length, e));
    },
    _e = (e, n) => {
      oe(t, n)
        .next()
        .then((t) => {
          if (V.current !== e || t === null) return;
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
      for (; G.current < he;) {
        let e = U.current.shift();
        if (e === void 0) return;
        ((G.current += 1),
          P(t, e)
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
              (--G.current, Q());
            }));
      }
    };
  ((0, p.useEffect)(() => {
    we(t, se.current).then(
      (e) => {
        (r(e.accounts), a(e.accounts[0]?.accountId ?? null));
      },
      (e) => {
        (r([]), v(O(e)));
      },
    );
  }, [t]),
    (0, p.useEffect)(() => {
      (l([]),
        j(null),
        w(null),
        E(null),
        (K.current = null),
        d(me),
        m(!1),
        b([]),
        g(!1),
        (U.current = []),
        W.current.clear(),
        (V.current = B),
        (H.current = !1),
        B !== null && pe(B, 0, me));
    }, [B]),
    (0, p.useEffect)(() => {
      for (let e of c.slice(0, u))
        !e.locked &&
          e.headers === null &&
          !W.current.has(e.path) &&
          (W.current.add(e.path), U.current.push(e.path));
      Q();
    }, [t, c, u]),
    (0, p.useEffect)(() => {
      if (R === null || z !== null) return;
      let e = () => {
        document.visibilityState === `visible` && q().catch((e) => F(O(e)));
      };
      e();
      let t = setInterval(e, ve);
      return () => clearInterval(t);
    }, [t, R?.accountId, z]),
    (0, p.useEffect)(() => {
      if (B === null || R === null) return;
      let { accountId: e, destinationPath: n } = R,
        r = null,
        i = () => {
          document.visibilityState === `visible` &&
            we(t, se.current).then(
              (t) => {
                let i = t.newestEmailAt.get(e);
                i !== void 0 && (r !== null && i > r && _e(B, n), (r = i));
              },
              () => {},
            );
        };
      i();
      let a = setInterval(i, ye);
      return () => clearInterval(a);
    }, [t, B]),
    (0, p.useEffect)(
      () =>
        de(t, {
          getView: () => ce.current,
          showEmail: le,
          showDraft: ue,
          refreshDrafts: q,
        }),
      [t],
    ));
  let $ =
    S?.kind === `draft`
      ? ((A ?? []).find((e) => e.clientDraftId === S.id) ?? null)
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
              fe({
                fields: { to: [], cc: [], subject: ``, body: `` },
                replyToGmailMessageId: null,
              }),
            children: `Compose`,
          }),
          ie === null
            ? null
            : (0, X.jsx)(`p`, {
                className: `mail-status is-error`,
                role: `alert`,
                children: ie,
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
              A !== null && A.length > 0
                ? (0, X.jsx)(`span`, {
                    className: `mail-rail-count`,
                    children: A.length,
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
                  R !== null && y.includes(R.destinationPath)
                    ? (0, X.jsxs)(`p`, {
                        className: `mail-status is-error`,
                        role: `alert`,
                        "data-mail-locked-folders": y.join(`,`),
                        children: [
                          `You cannot open `,
                          R.destinationPath,
                          `, so Mail cannot show its emails. Ask a member who can manage this folder in Files to give you access.`,
                        ],
                      })
                    : y.length > 0
                      ? (0, X.jsxs)(`p`, {
                          className: `mail-status`,
                          "data-mail-locked-folders": y.join(`,`),
                          children: [
                            `Mail skipped emails in folders you cannot open: `,
                            y.join(`, `),
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
                                        ? `To: ${xe(e.headers.to[0] ?? ``)}`
                                        : xe(e.headers.from),
                                }),
                                (0, X.jsx)(`span`, {
                                  className: `mail-row-date`,
                                  children: e.headers
                                    ? be(e.headers.date)
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
                        onClick: ge,
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
                  N === null
                    ? null
                    : (0, X.jsx)(`p`, {
                        className: `mail-status is-error`,
                        role: `alert`,
                        children: N,
                      }),
                  A !== null && A.length === 0
                    ? (0, X.jsx)(`p`, {
                        className: `mail-status`,
                        children: `No drafts. Ask the agent to write one.`,
                      })
                    : null,
                  (0, X.jsx)(`ul`, {
                    className: `mail-rows`,
                    children: (A ?? []).map((e) =>
                      (0, X.jsx)(
                        `li`,
                        {
                          children: (0, X.jsxs)(`button`, {
                            className: `mail-row`,
                            "aria-current":
                              S?.kind === `draft` && S.id === e.clientDraftId
                                ? `true`
                                : void 0,
                            onClick: () => ue(e.clientDraftId),
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
                  te
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
              ? T === null || T.path !== S.path
                ? (0, X.jsx)(`p`, {
                    className: `mail-status`,
                    role: `status`,
                    children: `Opening…`,
                  })
                : (0, X.jsx)(Ee, {
                    email: T,
                    replyBlock: z,
                    onReply: () => fe(Se(T)),
                  })
              : (0, X.jsx)(`p`, {
                  className: `mail-status is-error`,
                  role: `alert`,
                  children: D,
                })
            : null,
          S?.kind === `draft` && R !== null
            ? $ !== null && !$.saving
              ? (0, X.jsx)(
                  De,
                  {
                    client: t,
                    accountId: R.accountId,
                    draft: $,
                    onUnsavedChange: re,
                    onChanged: J,
                    onClosed: (e) => {
                      (w(null), L(e), J());
                    },
                  },
                  `${$.clientDraftId}:${$.agentEditedAt ?? 0}`,
                )
              : (0, X.jsx)(`p`, {
                  className: `mail-status`,
                  role: `status`,
                  children:
                    A === null || $?.saving
                      ? `Opening the draft…`
                      : `This draft is not available. It may have been sent or deleted.`,
                })
            : null,
        ],
      }),
    ],
  });
}
function Ee(e) {
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
              (0, X.jsx)(`dd`, { children: be(t.headers.date) }),
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
function De(e) {
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
    [y, ee] = (0, p.useState)(``),
    [b, x] = (0, p.useState)(!1),
    [C, E] = (0, p.useState)(!1),
    [D, k] = (0, p.useState)(null),
    A = (0, p.useRef)(0),
    j = (0, p.useRef)(!1),
    te = { accountId: n, clientDraftId: r.clientDraftId },
    M = () => {
      ((A.current += 1), x(!0), i(r.clientDraftId));
    },
    N = (e, t) => {
      (E(!0),
        k(null),
        e().then(
          () => {
            (E(!1), k({ text: t, isError: !1 }));
          },
          (e) => {
            (E(!1), k({ text: O(e), isError: !0 }));
          },
        ));
    },
    P = () => ({ to: Q(d), cc: Q(h), subject: _, body: y }),
    F = () => {
      let e = A.current;
      return (
        x(!1),
        w(t, { ...te, fields: P(), byAgent: !1 }).then(() => {
          (!j.current && A.current === e && i(null), a());
        })
      );
    },
    ne = () => N(F, `Saved to Gmail`),
    re = () =>
      F().then(
        () => k({ text: `Saved to Gmail`, isError: !1 }),
        (e) => k({ text: O(e), isError: !0 }),
      ),
    ie = () =>
      N(async () => {
        let e = P(),
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
    ae = () => {
      (x(!1),
        N(async () => {
          (await T(t, n, r.clientDraftId), o(`Draft deleted.`));
        }, `Deleted`));
    },
    oe = () => {
      let e = P();
      (x(!1),
        E(!0),
        k({ text: `Sending…`, isError: !1 }),
        pe(t, { ...te, fields: e }).then(
          () => o(`Sent: ${e.subject || `(no subject)`}`),
          (t) => {
            E(!1);
            let n =
              !(t instanceof f) ||
              [`send_unknown`, `service_unavailable`].includes(t.code);
            k({
              text: n
                ? `We could not confirm that “${e.subject || `(no subject)`}” was sent. Check Sent in Gmail before you press Send again.`
                : O(t),
              isError: !0,
            });
          },
        ));
    };
  if (
    ((0, p.useEffect)(() => {
      let e = !1;
      return (
        S(t, n, r.clientDraftId).then(
          (t) => {
            e || (c(t), m(Z(t.to)), g(Z(t.cc)), v(t.subject), ee(t.body));
          },
          (t) => {
            e ||
              (t instanceof f && t.code === `draft_gone` ? o(O(t)) : u(O(t)));
          },
        ),
        () => {
          e = !0;
        }
      );
    }, [t, n, r.clientDraftId]),
    (0, p.useEffect)(() => {
      if (!b) return;
      let e = setTimeout(re, _e);
      return () => clearTimeout(e);
    }, [b, d, h, _, y]),
    (0, p.useEffect)(
      () => (
        (j.current = !1),
        () => {
          ((j.current = !0), i(null));
        }
      ),
      [i],
    ),
    l !== null)
  )
    return (0, X.jsx)(`p`, {
      className: `mail-status is-error`,
      role: `alert`,
      children: l,
    });
  if (s === null)
    return (0, X.jsx)(`p`, {
      className: `mail-status`,
      role: `status`,
      children: `Opening the draft…`,
    });
  let I = [...Q(d), ...Q(h)].map($),
    L = () => {
      b && re();
    };
  return (0, X.jsxs)(`form`, {
    className: `mail-draft`,
    "aria-label": `Draft`,
    onSubmit: (e) => {
      (e.preventDefault(), ne());
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
            value: d,
            readOnly: C,
            onBlur: L,
            onInput: (e) => {
              (m(e.currentTarget.value), M());
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
            value: h,
            readOnly: C,
            onBlur: L,
            onInput: (e) => {
              (g(e.currentTarget.value), M());
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
            value: _,
            readOnly: C,
            onBlur: L,
            onInput: (e) => {
              (v(e.currentTarget.value), M());
            },
          }),
        ],
      }),
      (0, X.jsxs)(`label`, {
        className: `mail-field is-body`,
        children: [
          (0, X.jsx)(`span`, { children: `Body` }),
          (0, X.jsx)(`textarea`, {
            value: y,
            readOnly: C,
            onBlur: L,
            onInput: (e) => {
              (ee(e.currentTarget.value), M());
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
            disabled: C || I.length === 0,
            onClick: oe,
            children: `Send`,
          }),
          (0, X.jsx)(`button`, {
            className: `button`,
            type: `submit`,
            disabled: C,
            children: `Save`,
          }),
          (0, X.jsx)(`button`, {
            className: `button`,
            type: `button`,
            disabled: C,
            onClick: ie,
            children: `Copy`,
          }),
          (0, X.jsx)(`button`, {
            className: `button`,
            type: `button`,
            disabled: C,
            onClick: ae,
            children: `Delete`,
          }),
          D === null
            ? null
            : (0, X.jsx)(`span`, {
                className: D.isError
                  ? `mail-draft-status is-error`
                  : `mail-draft-status`,
                role: D.isError ? `alert` : `status`,
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
export { Te as MailApp };
