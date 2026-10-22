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
function te(e, t, n) {
  return u(e, `/page/drafts/list`, { accountId: t, cursor: n }, v);
}
function x(e, t, n) {
  return u(e, `/page/drafts/get`, { accountId: t, clientDraftId: n }, y);
}
async function S(e, t) {
  (b(t.fields),
    await u(e, `/page/drafts/create`, t, a({ clientDraftId: s() })));
}
async function C(e, t) {
  (b(t.fields), await u(e, `/page/drafts/update`, t, a({ saved: o() })));
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
    if (typeof o == `number` && r < T) await E(o + Math.random() * 250);
    else return i;
  }
}
function k(e) {
  return typeof e == `string` ? e : ``;
}
function A(e) {
  return Array.isArray(e) ? e.filter((e) => typeof e == `string`) : [];
}
function ne(e) {
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
      from: k(n.from),
      to: A(n.to),
      cc: A(n.cc),
      subject: k(n.subject) || ne(e),
      date: k(n.date),
      direction: i === `sent` || i === `received` ? i : null,
      gmailMessageId: k(n[`gmail-message-id`]) || null,
      gmailThreadId: k(n[`gmail-thread-id`]) || null,
      senderUnconfirmed: n.dmarc === `fail`,
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
  return M(t, n.body.content);
}
function P(e) {
  let t = /^(\d{2})-.*-([0-9a-f]{1,16})\.md$/u.exec(e);
  return t ? `${t[1]}-${t[2].padStart(16, `0`)}` : e;
}
function re(e) {
  return /^(\d{2})-/u.exec(e)?.[1] ?? e;
}
async function ie(e, t, n, r) {
  let i = await O(e, `/api/v1/files/list`, {
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
    let i = await ie(e, t, `folder`, r);
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
      let o = i.length > 0 ? re(i[0].name) : null,
        s = o === null ? -1 : i.findIndex((e) => re(e.name) !== o);
      if (o !== null && (s !== -1 || r)) {
        let e = i.splice(0, s === -1 ? i.length : s);
        for (let t of e) a.add(t.path);
        return e.sort((e, t) => (P(e.name) < P(t.name) ? 1 : -1));
      }
      if (r) return null;
      let c = await ie(e, t, `file`, n);
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
            subject: ne(e.path),
            day: j(e.path),
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
          let i = await F(e, t);
          (i === null && n.push(t), (r = i === null ? [] : o(i)));
          continue;
        }
        let s = r[0];
        if (s === void 0) return null;
        let c = await F(e, s);
        (r.shift(), c === null ? n.push(s) : i.push(...o(c)));
      }
    },
  };
}
var I = 12e3,
  L = 300,
  R = 10,
  z = 25,
  se = new TextEncoder(),
  B = new TextDecoder(),
  V = `Saved as a Gmail draft and open in the Mail page. It was not sent. Only the member can send it.`,
  H = `The member has typed text in a draft that is not saved yet. Wait about 10 seconds for the autosave, or ask the member to save, then try again.`;
function U(e, t) {
  let n = se.encode(e);
  return n.byteLength <= t
    ? e
    : `${B.decode(n.slice(0, t))}\n[Shortened. Open the file for the rest.]`;
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
    threadId: e.headers.gmailThreadId,
    senderWarning: e.headers.senderUnconfirmed
      ? `Gmail could not confirm this sender. The From address may be fake.`
      : null,
    body: U(e.body, I),
  };
}
function K(e) {
  return {
    draftId: e.clientDraftId,
    to: W(e.to),
    cc: W(e.cc),
    subject: U(e.subject, L),
    isReply: e.isReply,
    editedByAgent: e.agentEditedAt !== null,
  };
}
function ce(e) {
  return {
    draftId: e.clientDraftId,
    to: W(e.to),
    cc: W(e.cc),
    subject: U(e.subject, L),
    body: U(e.body, I),
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
function le(e) {
  let t = X(J(e, `draftId`), `draftId`);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)
  )
    throw Error(
      `No draft has the id ${U(t, L)}. Call list_drafts to see the ids.`,
    );
  return t;
}
function ue(e, t) {
  let n = () => {
      let e = t.getView().account;
      if (!e)
        throw Error(
          `No Gmail account is connected. Connect one on the Gmail page.`,
        );
      return e;
    },
    r = () => {
      if (t.getView().unsavedDraftId !== null) throw Error(H);
    },
    i = new Map(),
    a = (t, n) =>
      e.agent.registerTool(t, async (e) => {
        try {
          return await n(e);
        } catch (e) {
          throw Error(D(e));
        }
      }),
    o = [
      a(`get_view`, async () => {
        let n = t.getView(),
          r =
            n.account && n.openDraftId
              ? await x(e, n.account.accountId, n.openDraftId).catch(() => null)
              : null;
        return {
          account: n.account?.emailAddress ?? null,
          canWriteDrafts: n.account?.canCompose ?? !1,
          folder: n.folder,
          openEmail: n.openEmail ? G(n.openEmail) : null,
          openDraft: r ? ce(r) : null,
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
      a(`open_email`, async (n) => {
        let i = X(J(q(n), `path`), `path`);
        if (!i.startsWith(`/`) || !i.endsWith(`.md`))
          throw Error(`path must be a Files path that ends with .md`);
        let a = await N(e, i);
        return (r(), t.showEmail(a), G(a));
      }),
      a(`list_drafts`, () => ({
        drafts: t.getView().drafts.map(K),
        note: `These are the newest drafts, without their text. Call read_draft to read one.`,
      })),
      a(`read_draft`, async (r) => {
        let i = le(q(r)),
          a = () => {
            if (t.getView().unsavedDraftId === i) throw Error(H);
          };
        a();
        let o = await x(e, n().accountId, i);
        return (a(), ce(o));
      }),
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
          ((u = (await N(e, c)).headers.gmailMessageId), u === null)
        )
          throw Error(
            `${c} has no Gmail id, so a reply cannot be made from it`,
          );
        let d = JSON.stringify([l.accountId, s, u]),
          f = i.get(d) ?? ee();
        return (
          i.set(d, f),
          i.size > 20 && i.delete(i.keys().next().value),
          await S(e, {
            accountId: l.accountId,
            clientDraftId: f,
            fields: s,
            replyToGmailMessageId: u,
            byAgent: !0,
          }),
          await t.refreshDrafts().catch(() => {}),
          t.showDraft(f),
          { draftId: f, saved: !0, note: V }
        );
      }),
      a(`update_draft`, async (i) => {
        let a = q(i),
          o = le(a),
          s = n();
        r();
        let c = await x(e, s.accountId, o);
        r();
        let l = {
          to: Y(a, `to`) ?? c.to,
          cc: Y(a, `cc`) ?? c.cc,
          subject: J(a, `subject`) ?? c.subject,
          body: J(a, `body`) ?? c.body,
        };
        return (
          await C(e, {
            accountId: s.accountId,
            clientDraftId: o,
            fields: l,
            byAgent: !0,
          }),
          await t.refreshDrafts().catch(() => {}),
          t.showDraft(o),
          { draftId: o, saved: !0, note: V }
        );
      }),
      a(`delete_draft`, async (r) => {
        let i = le(q(r)),
          a = t.getView();
        if (a.unsavedDraftId === i) throw Error(H);
        let o = a.drafts.find((e) => e.clientDraftId === i);
        if (o === void 0 || o.agentEditedAt !== o.updatedAt)
          throw Error(
            `Only the member can delete this draft, because the member changed it last. Ask them to delete it in the Mail page.`,
          );
        return (
          await w(e, n().accountId, i),
          await t.refreshDrafts().catch(() => {}),
          { draftId: i, deleted: !0 }
        );
      }),
    ];
  return () => {
    for (let e of o) e();
  };
}
var de = 45e3;
async function fe(e, t) {
  await u(e, `/page/drafts/send`, t, a({ sent: o() }), de);
}
var Z = n(),
  pe = 30,
  me = 4,
  he = 3e3,
  ge = 1e4,
  _e = 6e4,
  ve = 5e3;
function ye(e) {
  let t = new Date(e);
  return Number.isNaN(t.getTime())
    ? ``
    : t.toLocaleString(void 0, { dateStyle: `medium`, timeStyle: `short` });
}
function be(e) {
  let t = /^\s*"?([^"<]+?)"?\s*<[^>]+>\s*$/u.exec(e);
  return t ? t[1] : e;
}
function Q(e) {
  return e.join(`, `);
}
function xe(e) {
  return e
    .split(/[,;\n]/u)
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
}
function Se(e) {
  return /<([^<>]+)>\s*$/u.exec(e)?.[1] ?? e;
}
function Ce(e) {
  let t = /^re:/iu.test(e.headers.subject)
      ? e.headers.subject
      : `Re: ${e.headers.subject}`,
    n = (e.body.length > he ? `${e.body.slice(0, he)}…` : e.body)
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
      body: `\n\nOn ${ye(e.headers.date)}, ${e.headers.from} wrote:\n${n}`,
    },
    replyToGmailMessageId: e.headers.gmailMessageId,
  };
}
function we(e) {
  return e.isComposer
    ? e.canCompose
      ? null
      : `Drafts are off for ${e.emailAddress}. Open the Gmail page and press Allow drafts and Send.`
    : `Only the member who connected ${e.emailAddress} can write drafts for it.`;
}
async function Te(e, t) {
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
            `[MailApp.list_accounts] Failed to renew the Bonobo Senate grant`,
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
    [u, d] = (0, p.useState)(pe),
    [f, m] = (0, p.useState)(!1),
    [h, g] = (0, p.useState)(!1),
    [_, v] = (0, p.useState)(null),
    [y, b] = (0, p.useState)([]),
    [x, C] = (0, p.useState)(null),
    [w, T] = (0, p.useState)(null),
    [E, O] = (0, p.useState)(null),
    [k, A] = (0, p.useState)(null),
    [ne, j] = (0, p.useState)(!1),
    [M, P] = (0, p.useState)(null),
    [re, ie] = (0, p.useState)(null),
    [F, ae] = (0, p.useState)(null),
    [I, L] = (0, p.useState)(null),
    R = n?.find((e) => e.accountId === i) ?? null,
    z = R ? we(R) : null,
    se = M !== null || (k?.some((e) => e.saving) ?? !1),
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
    ce = (0, p.useRef)(new Set()),
    q = (0, p.useRef)({
      account: R,
      folder: o,
      rows: c,
      openEmail: w,
      openDraftId: null,
      unsavedDraftId: null,
      drafts: [],
    });
  q.current = {
    account: R,
    folder: o,
    rows: c,
    openEmail: x?.kind === `email` ? w : null,
    openDraftId: x?.kind === `draft` ? x.id : null,
    unsavedDraftId: re,
    drafts: k ?? [],
  };
  let J = async () => {
      let e = q.current.account;
      if (e === null || we(e) !== null) return;
      let n = await te(t, e.accountId, null);
      q.current.account?.accountId === e.accountId &&
        (P(null), A(n.drafts), j(n.cursor !== null));
    },
    Y = () => {
      J().catch((e) => P(D(e)));
    },
    X = (e) => {
      ((K.current = e.path),
        s(`all`),
        C({ kind: `email`, path: e.path }),
        T(e),
        O(null));
    },
    le = (e) => {
      ((K.current = e),
        C({ kind: `email`, path: e }),
        T(null),
        O(null),
        c.some((t) => t.path === e && t.locked)
          ? O(
              `You cannot open ${e}. It is locked in Files. Ask a member who can manage it to give you access.`,
            )
          : N(t, e).then(
              (t) => {
                K.current === e && T(t);
              },
              (t) => {
                K.current === e && O(D(t));
              },
            ));
    },
    de = (e) => {
      ((K.current = null), s(`drafts`), C({ kind: `draft`, id: e }), L(null));
    },
    fe = (e) => {
      if (R === null) return;
      let n = ee();
      (ae(null),
        S(t, { accountId: R.accountId, clientDraftId: n, ...e, byAgent: !1 })
          .then(() => J().catch(() => {}))
          .then(
            () => de(n),
            (e) => ae(D(e)),
          ));
    },
    he = (e, t, n) => {
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
            V.current === e && v(D(t));
          })
          .finally(() => {
            ((H.current = !1), V.current === e && g(!1));
          }));
    },
    ge = () => {
      if (B === null || h) return;
      let e = u + pe;
      (d(e), c.length < e && !f && he(B, c.length, e));
    },
    xe = (e, n) => {
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
    Se = () => {
      for (; G.current < me;) {
        let e = U.current.shift();
        if (e === void 0) return;
        ((G.current += 1),
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
              (--G.current, Se());
            }));
      }
    };
  ((0, p.useEffect)(() => {
    Te(t, ce.current).then(
      (e) => {
        (r(e.accounts), a(e.accounts[0]?.accountId ?? null));
      },
      (e) => {
        (r([]), v(D(e)));
      },
    );
  }, [t]),
    (0, p.useEffect)(() => {
      (l([]),
        A(null),
        C(null),
        T(null),
        (K.current = null),
        d(pe),
        m(!1),
        b([]),
        g(!1),
        (U.current = []),
        W.current.clear(),
        (V.current = B),
        (H.current = !1),
        B !== null && he(B, 0, pe));
    }, [B]),
    (0, p.useEffect)(() => {
      for (let e of c.slice(0, u))
        !e.locked &&
          e.headers === null &&
          !W.current.has(e.path) &&
          (W.current.add(e.path), U.current.push(e.path));
      Se();
    }, [t, c, u]),
    (0, p.useEffect)(() => {
      if (R === null || z !== null) return;
      let e = () => {
        document.visibilityState === `visible` && J().catch((e) => P(D(e)));
      };
      return (
        e(),
        document.addEventListener(`visibilitychange`, e),
        () => document.removeEventListener(`visibilitychange`, e)
      );
    }, [t, R?.accountId, z]),
    (0, p.useEffect)(() => {
      if (!se) return;
      let e = setInterval(() => {
        document.visibilityState === `visible` && J().catch((e) => P(D(e)));
      }, ve);
      return () => clearInterval(e);
    }, [se]),
    (0, p.useEffect)(() => {
      if (B === null || R === null) return;
      let { accountId: e, destinationPath: n } = R,
        r = null,
        i = () => {
          document.visibilityState === `visible` &&
            Te(t, ce.current).then(
              (t) => {
                let i = t.newestEmailAt.get(e);
                i !== void 0 && (r !== null && i > r && xe(B, n), (r = i));
              },
              () => {},
            );
        };
      i();
      let a = setInterval(i, _e);
      return (
        document.addEventListener(`visibilitychange`, i),
        () => {
          (clearInterval(a),
            document.removeEventListener(`visibilitychange`, i));
        }
      );
    }, [t, B]),
    (0, p.useEffect)(
      () =>
        ue(t, {
          getView: () => q.current,
          showEmail: X,
          showDraft: de,
          refreshDrafts: J,
        }),
      [t],
    ));
  let $ =
    x?.kind === `draft`
      ? ((k ?? []).find((e) => e.clientDraftId === x.id) ?? null)
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
            disabled: R === null || z !== null,
            onClick: () =>
              fe({
                fields: { to: [], cc: [], subject: ``, body: `` },
                replyToGmailMessageId: null,
              }),
            children: `Compose`,
          }),
          F === null
            ? null
            : (0, Z.jsx)(`p`, {
                className: `mail-status is-error`,
                role: `alert`,
                children: F,
              }),
          z === null
            ? null
            : (0, Z.jsx)(`p`, { className: `mail-status`, children: z }),
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
                  R !== null && y.includes(R.destinationPath)
                    ? (0, Z.jsxs)(`p`, {
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
                      ? (0, Z.jsxs)(`p`, {
                          className: `mail-status`,
                          "data-mail-locked-folders": y.join(`,`),
                          children: [
                            `Mail skipped emails in folders you cannot open: `,
                            y.join(`, `),
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
                                x?.kind === `email` && x.path === e.path
                                  ? `true`
                                  : void 0,
                              "data-direction": e.headers?.direction ?? void 0,
                              "data-locked": e.locked ? `` : void 0,
                              onClick: () => le(e.path),
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
                                        ? `To: ${be(e.headers.to[0] ?? ``)}`
                                        : be(e.headers.from),
                                }),
                                (0, Z.jsx)(`span`, {
                                  className: `mail-row-date`,
                                  children: e.headers
                                    ? ye(e.headers.date)
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
                  !h && B !== null && (c.length > u || !f)
                    ? (0, Z.jsx)(`button`, {
                        className: `button mail-more`,
                        onClick: ge,
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
                  z === null
                    ? null
                    : (0, Z.jsx)(`p`, {
                        className: `mail-status`,
                        children: z,
                      }),
                  M === null
                    ? null
                    : (0, Z.jsx)(`p`, {
                        className: `mail-status is-error`,
                        role: `alert`,
                        children: M,
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
                              x?.kind === `draft` && x.id === e.clientDraftId
                                ? `true`
                                : void 0,
                            onClick: () => de(e.clientDraftId),
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
          I === null
            ? null
            : (0, Z.jsx)(`p`, {
                className: `mail-status`,
                role: `status`,
                children: I,
              }),
          x === null && I === null
            ? (0, Z.jsx)(`p`, {
                className: `mail-status`,
                children: `Choose an email or a draft.`,
              })
            : null,
          x?.kind === `email`
            ? E === null
              ? w === null || w.path !== x.path
                ? (0, Z.jsx)(`p`, {
                    className: `mail-status`,
                    role: `status`,
                    children: `Opening…`,
                  })
                : (0, Z.jsx)(Ee, {
                    email: w,
                    replyBlock: z,
                    onReply: () => fe(Ce(w)),
                  })
              : (0, Z.jsx)(`p`, {
                  className: `mail-status is-error`,
                  role: `alert`,
                  children: E,
                })
            : null,
          x?.kind === `draft` && R !== null
            ? $ !== null && !$.saving
              ? (0, Z.jsx)(
                  De,
                  {
                    client: t,
                    accountId: R.accountId,
                    draft: $,
                    onUnsavedChange: ie,
                    onChanged: Y,
                    onClosed: (e) => {
                      (C(null), L(e), Y());
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
function Ee(e) {
  let { email: t, replyBlock: n, onReply: r } = e;
  return (0, Z.jsxs)(`article`, {
    className: `mail-email`,
    "aria-label": t.headers.subject,
    children: [
      (0, Z.jsxs)(`header`, {
        className: `mail-email-header`,
        children: [
          (0, Z.jsx)(`h1`, { children: t.headers.subject }),
          t.headers.senderUnconfirmed
            ? (0, Z.jsx)(`p`, {
                className: `mail-sender-warning`,
                children: `Gmail could not confirm this sender. The From address may be fake.`,
              })
            : null,
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
              (0, Z.jsx)(`dd`, { children: ye(t.headers.date) }),
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
    [b, te] = (0, p.useState)(!1),
    [S, T] = (0, p.useState)(!1),
    [E, O] = (0, p.useState)(null),
    k = (0, p.useRef)(0),
    A = (0, p.useRef)(!1),
    ne = { accountId: n, clientDraftId: r.clientDraftId },
    j = () => {
      ((k.current += 1), te(!0), i(r.clientDraftId));
    },
    M = (e, t) => {
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
    N = () => ({ to: xe(d), cc: xe(h), subject: _, body: y }),
    P = () => {
      let e = k.current;
      return (
        te(!1),
        C(t, { ...ne, fields: N(), byAgent: !1 }).then(() => {
          (!A.current && k.current === e && i(null), a());
        })
      );
    },
    re = () => M(P, `Saved to Gmail`),
    ie = () =>
      P().then(
        () => O({ text: `Saved to Gmail`, isError: !1 }),
        (e) => O({ text: D(e), isError: !0 }),
      ),
    F = () =>
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
      (te(!1),
        M(async () => {
          (await w(t, n, r.clientDraftId), o(`Draft deleted.`));
        }, `Deleted`));
    },
    oe = () => {
      let e = N();
      (te(!1),
        T(!0),
        O({ text: `Sending…`, isError: !1 }),
        fe(t, { ...ne, fields: e }).then(
          () => o(`Sent: ${e.subject || `(no subject)`}`),
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
            e || (c(t), m(Q(t.to)), g(Q(t.cc)), v(t.subject), ee(t.body));
          },
          (t) => {
            e ||
              (t instanceof f && t.code === `draft_gone` ? o(D(t)) : u(D(t)));
          },
        ),
        () => {
          e = !0;
        }
      );
    }, [t, n, r.clientDraftId]),
    (0, p.useEffect)(() => {
      if (!b) return;
      let e = setTimeout(ie, ge);
      return () => clearTimeout(e);
    }, [b, d, h, _, y]),
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
  let I = [...xe(d), ...xe(h)].map(Se),
    L = () => {
      b && ie();
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
            readOnly: S,
            onBlur: L,
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
            readOnly: S,
            onBlur: L,
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
            readOnly: S,
            onBlur: L,
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
            readOnly: S,
            onBlur: L,
            onInput: (e) => {
              (ee(e.currentTarget.value), j());
            },
          }),
        ],
      }),
      (0, Z.jsx)(`p`, {
        className: `mail-note`,
        "data-mail-send-recipients": I.join(`,`),
        children:
          I.length > 0
            ? `Send goes to: ${I.join(`, `)}`
            : `Add a recipient to send.`,
      }),
      (0, Z.jsxs)(`div`, {
        className: `mail-actions`,
        children: [
          (0, Z.jsx)(`button`, {
            className: `button is-primary`,
            type: `button`,
            disabled: S || I.length === 0,
            onClick: oe,
            children: `Send`,
          }),
          (0, Z.jsx)(`button`, {
            className: `button`,
            type: `submit`,
            disabled: S,
            children: `Save`,
          }),
          (0, Z.jsx)(`button`, {
            className: `button`,
            type: `button`,
            disabled: S,
            onClick: F,
            children: `Copy`,
          }),
          (0, Z.jsx)(`button`, {
            className: `button`,
            type: `button`,
            disabled: S,
            onClick: ae,
            children: `Delete`,
          }),
          E === null
            ? null
            : (0, Z.jsx)(`span`, {
                className: E.isError
                  ? `mail-draft-status is-error`
                  : `mail-draft-status`,
                role: E.isError ? `alert` : `status`,
                children: E.text,
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
