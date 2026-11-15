import { n as e } from "./rolldown-runtime.js";
import { r as t, t as n } from "./react.js";
import { c as r, n as i, o as a, r as o, s } from "./zod.js";
import { a as c, l, o as u, r as d, t as f } from "./gmail-api.js";
var p = e(t(), 1),
  m = 50,
  h = 998,
  g = 5e4,
  _ = s({
    clientDraftId: r(),
    to: i(r()),
    cc: i(r()),
    subject: r(),
    isReply: o(),
    saving: o(),
    agentEditedAt: a().nullable(),
    updatedAt: a(),
  }),
  v = s({ drafts: i(_).max(25), cursor: r().nullable() }),
  y = s({
    clientDraftId: r(),
    to: i(r()),
    cc: i(r()),
    subject: r(),
    body: r(),
    isReply: o(),
    agentEditedAt: a().nullable(),
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
    await u(e, `/page/drafts/create`, t, s({ clientDraftId: r() })));
}
async function w(e, t) {
  (b(t.fields), await u(e, `/page/drafts/update`, t, s({ saved: o() })));
}
async function T(e, t, n) {
  await u(
    e,
    `/page/drafts/delete`,
    { accountId: t, clientDraftId: n },
    s({ deleted: o() }),
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
async function A(e, t, n) {
  for (let r = 0; ; r += 1) {
    let i = await e.fetchRaw(t, n);
    if (i.status !== 429 || r >= E) return i;
    let a = await i
        .clone()
        .json()
        .catch(() => null),
      o =
        typeof a == `object` && a && `retryAfterMs` in a
          ? a.retryAfterMs
          : void 0;
    if (typeof o != `number`) return i;
    (await i.body?.cancel(), await D(o + Math.random() * 250));
  }
}
function j(e) {
  return typeof e == `string` ? e : ``;
}
function M(e) {
  return Array.isArray(e) ? e.filter((e) => typeof e == `string`) : [];
}
function N(e) {
  return (
    e
      .slice(e.lastIndexOf(`/`) + 1)
      .replace(/\.md$/u, ``)
      .replace(/^\d{2}-/u, ``)
      .replace(/-[0-9a-f]+$/u, ``)
      .replace(/-/gu, ` `) || `(no subject)`
  );
}
function P(e) {
  let t = /\/(\d{4})\/(\d{2})\/(\d{2})-[^/]*$/u.exec(e);
  return t ? `${t[1]}-${t[2]}-${t[3]}` : ``;
}
function F(e, t) {
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
      from: j(n.from),
      to: M(n.to),
      cc: M(n.cc),
      subject: j(n.subject) || N(e),
      date: j(n.date),
      direction: i === `sent` || i === `received` ? i : null,
      gmailMessageId: j(n[`gmail-message-id`]) || null,
      gmailThreadId: j(n[`gmail-thread-id`]) || null,
      senderUnconfirmed: n.dmarc === `fail`,
    },
    body: r.trimEnd(),
  };
}
async function I(e, t) {
  let n = new TextDecoder(),
    r = null,
    i = ``;
  do {
    let a = await A(e, `/api/v1/files/read`, { path: t, cursor: r });
    if (a.status !== 200) {
      let e = await a.json().catch(() => null),
        n =
          typeof e == `object` && e && `message` in e
            ? e.message
            : `HTTP ${a.status}`;
      throw Error(`Failed to read ${t}: ${n}`);
    }
    ((i += n.decode(await a.arrayBuffer(), { stream: !0 })),
      (r = a.headers.get(`X-File-Next-Cursor`)));
  } while (r !== null);
  return F(t, i + n.decode());
}
function te(e) {
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
        return e.sort((e, t) => (te(e.name) < te(t.name) ? 1 : -1));
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
function L(e, t) {
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
            subject: N(e.path),
            day: P(e.path),
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
var R = 12e3,
  z = 300,
  B = 10,
  oe = 4e3,
  V = 900,
  H = 120,
  U = 3,
  se = 8,
  ce = new TextEncoder(),
  le = new TextDecoder(),
  W = `Gmail could not confirm this sender. The From address may be fake.`,
  ue = `Saved as a Gmail draft and open in the Mail page. It was not sent. Only the member can send it.`,
  G = `The member has typed text in a draft that is not saved yet. Wait about 10 seconds for the autosave, or ask the member to save, then try again.`;
function K(
  e,
  t,
  n = `
[Shortened. Open the file for the rest.]`,
) {
  let r = ce.encode(e);
  return r.byteLength <= t ? e : `${le.decode(r.slice(0, t))}${n}`;
}
function q(e) {
  return e.slice(0, B).map((e) => K(e, z));
}
function de(e) {
  return {
    path: e.path,
    from: K(e.headers.from, z),
    to: q(e.headers.to),
    cc: q(e.headers.cc),
    subject: K(e.headers.subject, z),
    date: e.headers.date,
    direction: e.headers.direction,
    threadId: e.headers.gmailThreadId,
    senderWarning: e.headers.senderUnconfirmed ? W : null,
    body: K(e.body, R),
  };
}
function fe(e) {
  return {
    draftId: e.clientDraftId,
    to: q(e.to),
    cc: q(e.cc),
    subject: K(e.subject, z),
    isReply: e.isReply,
    editedByAgent: e.agentEditedAt !== null,
  };
}
function pe(e) {
  return {
    draftId: e.clientDraftId,
    to: q(e.to),
    cc: q(e.cc),
    subject: K(e.subject, z),
    body: K(e.body, R),
    isReply: e.isReply,
    editedByAgent: e.agentEditedAt !== null,
  };
}
function me(e) {
  let t = (e, t) => K(e.replace(/\s+/g, ` `), t, `…`),
    n = (e) => t(e, H),
    r = [
      e.account
        ? `Gmail account: ${e.account.emailAddress} (${e.account.canCompose ? `can write drafts` : `cannot write drafts`})`
        : `No Gmail account is connected.`,
      `Folder: ${e.folder === `drafts` ? `Drafts` : `All mail`}`,
    ];
  if (e.openEmail) {
    let { headers: i } = e.openEmail,
      a = i.to.length > U ? ` and ${i.to.length - U} more` : ``;
    (r.push(
      `Open email: ${e.openEmail.path}`,
      `From: ${n(i.from)}`,
      `To: ${i.to.slice(0, U).map(n).join(`, `)}${a}`,
      `Subject: ${n(i.subject)}`,
      `Date: ${i.date}${i.direction ? ` (${i.direction})` : ``}`,
    ),
      i.senderUnconfirmed && r.push(`Warning: ${W}`),
      r.push(
        `Start of the email (call open_email for all of it): ${t(e.openEmail.body, V)}`,
      ));
  }
  (e.openDraftId &&
    r.push(`Open draft: ${e.openDraftId} (call read_draft to read it)`),
    r.push(`Newest emails in All mail (${e.rows.length} loaded):`));
  for (let t of e.rows.slice(0, se)) {
    let e = t.headers ? `${n(t.headers.from)} | ` : ``;
    r.push(
      `- ${t.path} | ${e}${n(t.headers?.subject ?? t.subject)} | ${t.headers?.date ?? t.day}${t.locked ? ` | locked` : ``}`,
    );
  }
  return (
    r.push(`Drafts: ${e.drafts.length}`),
    {
      content: [
        {
          type: `text`,
          text: K(
            r.join(`
`),
            oe,
            `
[Shortened.]`,
          ),
        },
      ],
    }
  );
}
function J(e) {
  if (typeof e != `object` || !e || Array.isArray(e))
    throw Error(`The input must be an object`);
  return e;
}
function Y(e, t) {
  let n = e[t];
  if (n !== void 0) {
    if (typeof n != `string`) throw Error(`${t} must be a string`);
    return n;
  }
}
function he(e, t) {
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
function Z(e) {
  let t = X(Y(e, `draftId`), `draftId`);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)
  )
    throw Error(
      `No draft has the id ${K(t, z)}. Call list_drafts to see the ids.`,
    );
  return t;
}
function ge(e, t) {
  let n = () => {
      let e = t.getView().account;
      if (!e)
        throw Error(
          `No Gmail account is connected. Connect one on the Gmail page.`,
        );
      return e;
    },
    r = () => {
      if (t.getView().unsavedDraftId !== null) throw Error(G);
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
      e.agent.setContextProvider(() => me(t.getView())),
      a(`open_email`, async (n) => {
        let i = X(Y(J(n), `path`), `path`);
        if (!i.startsWith(`/`) || !i.endsWith(`.md`))
          throw Error(`path must be a Files path that ends with .md`);
        let a = await I(e, i);
        return (r(), t.showEmail(a), de(a));
      }),
      a(`list_drafts`, () => ({
        drafts: t.getView().drafts.map(fe),
        note: `These are the newest drafts, without their text. Call read_draft to read one.`,
      })),
      a(`read_draft`, async (r) => {
        let i = Z(J(r)),
          a = () => {
            if (t.getView().unsavedDraftId === i) throw Error(G);
          };
        a();
        let o = await S(e, n().accountId, i);
        return (a(), pe(o));
      }),
      a(`create_draft`, async (a) => {
        let o = J(a),
          s = {
            to: X(he(o, `to`), `to`),
            cc: he(o, `cc`) ?? [],
            subject: X(Y(o, `subject`), `subject`),
            body: X(Y(o, `body`), `body`),
          },
          c = Y(o, `replyToPath`);
        b(s);
        let l = n();
        r();
        let u = null;
        if (
          c !== void 0 &&
          ((u = (await I(e, c)).headers.gmailMessageId), u === null)
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
          { draftId: f, saved: !0, note: ue }
        );
      }),
      a(`update_draft`, async (i) => {
        let a = J(i),
          o = Z(a),
          s = n();
        r();
        let c = await S(e, s.accountId, o);
        r();
        let l = {
          to: he(a, `to`) ?? c.to,
          cc: he(a, `cc`) ?? c.cc,
          subject: Y(a, `subject`) ?? c.subject,
          body: Y(a, `body`) ?? c.body,
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
          { draftId: o, saved: !0, note: ue }
        );
      }),
      a(`delete_draft`, async (r) => {
        let i = Z(J(r)),
          a = t.getView();
        if (a.unsavedDraftId === i) throw Error(G);
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
var _e = 45e3;
async function ve(e, t) {
  await u(e, `/page/drafts/send`, t, s({ sent: o() }), _e);
}
var Q = n(),
  ye = 30,
  be = 4,
  xe = 3e3,
  Se = 1e4,
  Ce = 6e4,
  we = 5e3;
function Te(e) {
  let t = new Date(e);
  return Number.isNaN(t.getTime())
    ? ``
    : t.toLocaleString(void 0, { dateStyle: `medium`, timeStyle: `short` });
}
function Ee(e) {
  let t = /^\s*"?([^"<]+?)"?\s*<[^>]+>\s*$/u.exec(e);
  return t ? t[1] : e;
}
function $(e) {
  return e.join(`, `);
}
function De(e) {
  return e
    .split(/[,;\n]/u)
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
}
function Oe(e) {
  return /<([^<>]+)>\s*$/u.exec(e)?.[1] ?? e;
}
function ke(e) {
  let t = /^re:/iu.test(e.headers.subject)
      ? e.headers.subject
      : `Re: ${e.headers.subject}`,
    n = (e.body.length > xe ? `${e.body.slice(0, xe)}…` : e.body)
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
      body: `\n\nOn ${Te(e.headers.date)}, ${e.headers.from} wrote:\n${n}`,
    },
    replyToGmailMessageId: e.headers.gmailMessageId,
  };
}
function Ae(e) {
  return e.isComposer
    ? e.canCompose
      ? null
      : `Drafts are off for ${e.emailAddress}. Open the Gmail page and press Allow drafts and Send.`
    : `Only the member who connected ${e.emailAddress} can write drafts for it.`;
}
async function je(e, t) {
  let n = [],
    r = new Map(),
    i = null;
  do {
    let a = await u(e, `/page/status`, { cursor: i }, l);
    for (let i of a.accounts) {
      let a = `${i.accountId}:${i.connectionGeneration}`;
      (i.canRepair &&
        !t.has(a) &&
        (t.add(a),
        u(
          e,
          `/page/press-repair`,
          {
            accountId: i.accountId,
            expectedGeneration: i.connectionGeneration,
            clientRequestId: c(),
          },
          s({}),
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
    i = a.cursor;
  } while (i !== null);
  return { accounts: n, newestEmailAt: r };
}
function Me(e) {
  let { client: t } = e,
    [n, r] = (0, p.useState)(null),
    [i, a] = (0, p.useState)(null),
    [o, s] = (0, p.useState)(`all`),
    [c, l] = (0, p.useState)([]),
    [u, d] = (0, p.useState)(ye),
    [f, m] = (0, p.useState)(!1),
    [h, g] = (0, p.useState)(!1),
    [_, v] = (0, p.useState)(null),
    [y, b] = (0, p.useState)([]),
    [S, w] = (0, p.useState)(null),
    [T, E] = (0, p.useState)(null),
    [D, k] = (0, p.useState)(null),
    [A, j] = (0, p.useState)(null),
    [M, N] = (0, p.useState)(!1),
    [P, F] = (0, p.useState)(null),
    [te, ne] = (0, p.useState)(null),
    [re, ie] = (0, p.useState)(null),
    [ae, R] = (0, p.useState)(null),
    z = n?.find((e) => e.accountId === i) ?? null,
    B = z ? Ae(z) : null,
    oe = P !== null || (A?.some((e) => e.saving) ?? !1),
    V = (0, p.useMemo)(
      () => (z === null ? null : L(t, z.destinationPath)),
      [t, z?.destinationPath],
    ),
    H = (0, p.useRef)(null),
    U = (0, p.useRef)(!1),
    se = (0, p.useRef)([]),
    ce = (0, p.useRef)(new Set()),
    le = (0, p.useRef)(0),
    W = (0, p.useRef)(null),
    ue = (0, p.useRef)(new Set()),
    G = (0, p.useRef)({
      account: z,
      folder: o,
      rows: c,
      openEmail: T,
      openDraftId: null,
      unsavedDraftId: null,
      drafts: [],
    });
  G.current = {
    account: z,
    folder: o,
    rows: c,
    openEmail: S?.kind === `email` ? T : null,
    openDraftId: S?.kind === `draft` ? S.id : null,
    unsavedDraftId: te,
    drafts: A ?? [],
  };
  let K = async () => {
      let e = G.current.account;
      if (e === null || Ae(e) !== null) return;
      let n = await x(t, e.accountId, null);
      G.current.account?.accountId === e.accountId &&
        (F(null), j(n.drafts), N(n.cursor !== null));
    },
    q = () => {
      K().catch((e) => F(O(e)));
    },
    de = (e) => {
      ((W.current = e.path),
        s(`all`),
        w({ kind: `email`, path: e.path }),
        E(e),
        k(null));
    },
    fe = (e) => {
      ((W.current = e),
        w({ kind: `email`, path: e }),
        E(null),
        k(null),
        c.some((t) => t.path === e && t.locked)
          ? k(
              `You cannot open ${e}. It is locked in Files. Ask a member who can manage it to give you access.`,
            )
          : I(t, e).then(
              (t) => {
                W.current === e && E(t);
              },
              (t) => {
                W.current === e && k(O(t));
              },
            ));
    },
    pe = (e) => {
      ((W.current = null), s(`drafts`), w({ kind: `draft`, id: e }), R(null));
    },
    me = (e) => {
      if (z === null) return;
      let n = ee();
      (ie(null),
        C(t, { accountId: z.accountId, clientDraftId: n, ...e, byAgent: !1 })
          .then(() => K().catch(() => {}))
          .then(
            () => pe(n),
            (e) => ie(O(e)),
          ));
    },
    J = (e, t, n) => {
      U.current ||
        ((U.current = !0),
        g(!0),
        v(null),
        (async () => {
          let r = t;
          for (; r < n;) {
            let t = await e.next();
            if (H.current !== e) return;
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
            H.current === e && v(O(t));
          })
          .finally(() => {
            ((U.current = !1), H.current === e && g(!1));
          }));
    },
    Y = () => {
      if (V === null || h) return;
      let e = u + ye;
      (d(e), c.length < e && !f && J(V, c.length, e));
    },
    he = (e, n) => {
      L(t, n)
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
    X = () => {
      for (; le.current < be;) {
        let e = se.current.shift();
        if (e === void 0) return;
        ((le.current += 1),
          I(t, e)
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
              (--le.current, X());
            }));
      }
    };
  ((0, p.useEffect)(() => {
    je(t, ue.current).then(
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
        (W.current = null),
        d(ye),
        m(!1),
        b([]),
        g(!1),
        (se.current = []),
        ce.current.clear(),
        (H.current = V),
        (U.current = !1),
        V !== null && J(V, 0, ye));
    }, [V]),
    (0, p.useEffect)(() => {
      for (let e of c.slice(0, u))
        !e.locked &&
          e.headers === null &&
          !ce.current.has(e.path) &&
          (ce.current.add(e.path), se.current.push(e.path));
      X();
    }, [t, c, u]),
    (0, p.useEffect)(() => {
      if (z === null || B !== null) return;
      let e = () => {
        document.visibilityState === `visible` && K().catch((e) => F(O(e)));
      };
      return (
        e(),
        document.addEventListener(`visibilitychange`, e),
        () => document.removeEventListener(`visibilitychange`, e)
      );
    }, [t, z?.accountId, B]),
    (0, p.useEffect)(() => {
      if (!oe) return;
      let e = setInterval(() => {
        document.visibilityState === `visible` && K().catch((e) => F(O(e)));
      }, we);
      return () => clearInterval(e);
    }, [oe]),
    (0, p.useEffect)(() => {
      if (V === null || z === null) return;
      let { accountId: e, destinationPath: n } = z,
        r = null,
        i = () => {
          document.visibilityState === `visible` &&
            je(t, ue.current).then(
              (t) => {
                let i = t.newestEmailAt.get(e);
                i !== void 0 && (r !== null && i > r && he(V, n), (r = i));
              },
              () => {},
            );
        };
      i();
      let a = setInterval(i, Ce);
      return (
        document.addEventListener(`visibilitychange`, i),
        () => {
          (clearInterval(a),
            document.removeEventListener(`visibilitychange`, i));
        }
      );
    }, [t, V]),
    (0, p.useEffect)(
      () =>
        ge(t, {
          getView: () => G.current,
          showEmail: de,
          showDraft: pe,
          refreshDrafts: K,
        }),
      [t],
    ));
  let Z =
    S?.kind === `draft`
      ? ((A ?? []).find((e) => e.clientDraftId === S.id) ?? null)
      : null;
  return (0, Q.jsxs)(`div`, {
    className: `mail`,
    children: [
      (0, Q.jsxs)(`nav`, {
        className: `mail-rail`,
        "aria-label": `Mailboxes`,
        children: [
          (0, Q.jsx)(`button`, {
            className: `button is-primary`,
            disabled: z === null || B !== null,
            onClick: () =>
              me({
                fields: { to: [], cc: [], subject: ``, body: `` },
                replyToGmailMessageId: null,
              }),
            children: `Compose`,
          }),
          re === null
            ? null
            : (0, Q.jsx)(`p`, {
                className: `mail-status is-error`,
                role: `alert`,
                children: re,
              }),
          B === null
            ? null
            : (0, Q.jsx)(`p`, { className: `mail-status`, children: B }),
          (0, Q.jsx)(`button`, {
            className: `mail-rail-item`,
            "aria-current": o === `all` ? `page` : void 0,
            onClick: () => s(`all`),
            children: `All mail`,
          }),
          (0, Q.jsxs)(`button`, {
            className: `mail-rail-item`,
            "aria-current": o === `drafts` ? `page` : void 0,
            onClick: () => s(`drafts`),
            children: [
              `Drafts`,
              A !== null && A.length > 0
                ? (0, Q.jsx)(`span`, {
                    className: `mail-rail-count`,
                    children: A.length,
                  })
                : null,
            ],
          }),
          n !== null && n.length > 1
            ? (0, Q.jsxs)(`label`, {
                className: `mail-rail-account`,
                children: [
                  `Account`,
                  (0, Q.jsx)(`select`, {
                    value: i ?? ``,
                    onChange: (e) => a(e.currentTarget.value),
                    children: n.map((e) =>
                      (0, Q.jsx)(
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
      (0, Q.jsx)(`section`, {
        className: `mail-list`,
        "aria-label": o === `all` ? `All mail` : `Drafts`,
        children:
          o === `all`
            ? (0, Q.jsxs)(Q.Fragment, {
                children: [
                  n !== null && n.length === 0 && _ === null
                    ? (0, Q.jsx)(`p`, {
                        className: `mail-status`,
                        children: `No Gmail account is connected. Connect one on the Gmail page.`,
                      })
                    : null,
                  z !== null && y.includes(z.destinationPath)
                    ? (0, Q.jsxs)(`p`, {
                        className: `mail-status is-error`,
                        role: `alert`,
                        "data-mail-locked-folders": y.join(`,`),
                        children: [
                          `You cannot open `,
                          z.destinationPath,
                          `, so Mail cannot show its emails. Ask a member who can manage this folder in Files to give you access.`,
                        ],
                      })
                    : y.length > 0
                      ? (0, Q.jsxs)(`p`, {
                          className: `mail-status`,
                          "data-mail-locked-folders": y.join(`,`),
                          children: [
                            `Mail skipped emails in folders you cannot open: `,
                            y.join(`, `),
                            `. Ask a member who can manage them in Files to give you access.`,
                          ],
                        })
                      : null,
                  (0, Q.jsx)(`ul`, {
                    className: `mail-rows`,
                    children: c
                      .slice(0, u)
                      .map((e) =>
                        (0, Q.jsx)(
                          `li`,
                          {
                            children: (0, Q.jsxs)(`button`, {
                              className: `mail-row`,
                              "aria-current":
                                S?.kind === `email` && S.path === e.path
                                  ? `true`
                                  : void 0,
                              "data-direction": e.headers?.direction ?? void 0,
                              "data-locked": e.locked ? `` : void 0,
                              onClick: () => fe(e.path),
                              children: [
                                (0, Q.jsx)(`span`, {
                                  className: `mail-row-from`,
                                  children: e.locked
                                    ? (0, Q.jsx)(`span`, {
                                        className: `mail-badge`,
                                        children: `Locked`,
                                      })
                                    : e.headers === null
                                      ? ``
                                      : e.headers.direction === `sent`
                                        ? `To: ${Ee(e.headers.to[0] ?? ``)}`
                                        : Ee(e.headers.from),
                                }),
                                (0, Q.jsx)(`span`, {
                                  className: `mail-row-date`,
                                  children: e.headers
                                    ? Te(e.headers.date)
                                    : e.day,
                                }),
                                (0, Q.jsx)(`span`, {
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
                    ? (0, Q.jsx)(`p`, {
                        className: `mail-status`,
                        role: `status`,
                        children: `Loading…`,
                      })
                    : null,
                  !h && V !== null && (c.length > u || !f)
                    ? (0, Q.jsx)(`button`, {
                        className: `button mail-more`,
                        onClick: Y,
                        children: `Show more`,
                      })
                    : null,
                  _ === null
                    ? null
                    : (0, Q.jsx)(`p`, {
                        className: `mail-status is-error`,
                        role: `alert`,
                        children: _,
                      }),
                ],
              })
            : (0, Q.jsxs)(Q.Fragment, {
                children: [
                  B === null
                    ? null
                    : (0, Q.jsx)(`p`, {
                        className: `mail-status`,
                        children: B,
                      }),
                  P === null
                    ? null
                    : (0, Q.jsx)(`p`, {
                        className: `mail-status is-error`,
                        role: `alert`,
                        children: P,
                      }),
                  A !== null && A.length === 0
                    ? (0, Q.jsx)(`p`, {
                        className: `mail-status`,
                        children: `No drafts. Ask the agent to write one.`,
                      })
                    : null,
                  (0, Q.jsx)(`ul`, {
                    className: `mail-rows`,
                    children: (A ?? []).map((e) =>
                      (0, Q.jsx)(
                        `li`,
                        {
                          children: (0, Q.jsxs)(`button`, {
                            className: `mail-row`,
                            "aria-current":
                              S?.kind === `draft` && S.id === e.clientDraftId
                                ? `true`
                                : void 0,
                            onClick: () => pe(e.clientDraftId),
                            children: [
                              (0, Q.jsx)(`span`, {
                                className: `mail-row-from`,
                                children:
                                  e.to.length > 0
                                    ? `To: ${$(e.to)}`
                                    : `No recipients`,
                              }),
                              (0, Q.jsx)(`span`, {
                                className: `mail-row-date`,
                                children:
                                  e.agentEditedAt === null
                                    ? null
                                    : (0, Q.jsx)(`span`, {
                                        className: `mail-badge`,
                                        children: `Agent`,
                                      }),
                              }),
                              (0, Q.jsx)(`span`, {
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
                  M
                    ? (0, Q.jsx)(`p`, {
                        className: `mail-status`,
                        children: `Showing the 25 newest drafts.`,
                      })
                    : null,
                ],
              }),
      }),
      (0, Q.jsxs)(`main`, {
        className: `mail-reader`,
        children: [
          ae === null
            ? null
            : (0, Q.jsx)(`p`, {
                className: `mail-status`,
                role: `status`,
                children: ae,
              }),
          S === null && ae === null
            ? (0, Q.jsx)(`p`, {
                className: `mail-status`,
                children: `Choose an email or a draft.`,
              })
            : null,
          S?.kind === `email`
            ? D === null
              ? T === null || T.path !== S.path
                ? (0, Q.jsx)(`p`, {
                    className: `mail-status`,
                    role: `status`,
                    children: `Opening…`,
                  })
                : (0, Q.jsx)(Ne, {
                    email: T,
                    replyBlock: B,
                    onReply: () => me(ke(T)),
                  })
              : (0, Q.jsx)(`p`, {
                  className: `mail-status is-error`,
                  role: `alert`,
                  children: D,
                })
            : null,
          S?.kind === `draft` && z !== null
            ? Z !== null && !Z.saving
              ? (0, Q.jsx)(
                  Pe,
                  {
                    client: t,
                    accountId: z.accountId,
                    draft: Z,
                    onUnsavedChange: ne,
                    onChanged: q,
                    onClosed: (e) => {
                      (w(null), R(e), q());
                    },
                  },
                  `${Z.clientDraftId}:${Z.agentEditedAt ?? 0}`,
                )
              : (0, Q.jsx)(`p`, {
                  className: `mail-status`,
                  role: `status`,
                  children:
                    A === null || Z?.saving
                      ? `Opening the draft…`
                      : `This draft is not available. It may have been sent or deleted.`,
                })
            : null,
        ],
      }),
    ],
  });
}
function Ne(e) {
  let { email: t, replyBlock: n, onReply: r } = e;
  return (0, Q.jsxs)(`article`, {
    className: `mail-email`,
    "aria-label": t.headers.subject,
    children: [
      (0, Q.jsxs)(`header`, {
        className: `mail-email-header`,
        children: [
          (0, Q.jsx)(`h1`, { children: t.headers.subject }),
          t.headers.senderUnconfirmed
            ? (0, Q.jsx)(`p`, {
                className: `mail-sender-warning`,
                children: `Gmail could not confirm this sender. The From address may be fake.`,
              })
            : null,
          (0, Q.jsxs)(`dl`, {
            children: [
              (0, Q.jsx)(`dt`, { children: `From` }),
              (0, Q.jsx)(`dd`, { children: t.headers.from }),
              (0, Q.jsx)(`dt`, { children: `To` }),
              (0, Q.jsx)(`dd`, { children: $(t.headers.to) }),
              t.headers.cc.length > 0
                ? (0, Q.jsxs)(Q.Fragment, {
                    children: [
                      (0, Q.jsx)(`dt`, { children: `Cc` }),
                      (0, Q.jsx)(`dd`, { children: $(t.headers.cc) }),
                    ],
                  })
                : null,
              (0, Q.jsx)(`dt`, { children: `Date` }),
              (0, Q.jsx)(`dd`, { children: Te(t.headers.date) }),
            ],
          }),
          (0, Q.jsxs)(`div`, {
            className: `mail-actions`,
            children: [
              (0, Q.jsx)(`button`, {
                className: `button`,
                disabled: n !== null || t.headers.gmailMessageId === null,
                onClick: r,
                children: `Reply`,
              }),
              n === null
                ? null
                : (0, Q.jsx)(`span`, {
                    className: `mail-draft-status`,
                    children: n,
                  }),
            ],
          }),
        ],
      }),
      (0, Q.jsx)(`div`, { className: `mail-email-body`, children: t.body }),
    ],
  });
}
function Pe(e) {
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
    M = { accountId: n, clientDraftId: r.clientDraftId },
    N = () => {
      ((A.current += 1), x(!0), i(r.clientDraftId));
    },
    P = (e, t) => {
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
    F = () => ({ to: De(d), cc: De(h), subject: _, body: y }),
    I = () => {
      let e = A.current;
      return (
        x(!1),
        w(t, { ...M, fields: F(), byAgent: !1 }).then(() => {
          (!j.current && A.current === e && i(null), a());
        })
      );
    },
    te = () => P(I, `Saved to Gmail`),
    ne = () =>
      I().then(
        () => k({ text: `Saved to Gmail`, isError: !1 }),
        (e) => k({ text: O(e), isError: !0 }),
      ),
    re = () =>
      P(async () => {
        let e = F(),
          t = [
            `To: ${$(e.to)}`,
            ...(e.cc.length > 0 ? [`Cc: ${$(e.cc)}`] : []),
            `Subject: ${e.subject}`,
            ``,
            e.body,
          ].join(`
`);
        await navigator.clipboard.writeText(t);
      }, `Copied`),
    ie = () => {
      (x(!1),
        P(async () => {
          (await T(t, n, r.clientDraftId), o(`Draft deleted.`));
        }, `Deleted`));
    },
    ae = () => {
      let e = F();
      (x(!1),
        E(!0),
        k({ text: `Sending…`, isError: !1 }),
        ve(t, { ...M, fields: e }).then(
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
            e || (c(t), m($(t.to)), g($(t.cc)), v(t.subject), ee(t.body));
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
      let e = setTimeout(ne, Se);
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
    return (0, Q.jsx)(`p`, {
      className: `mail-status is-error`,
      role: `alert`,
      children: l,
    });
  if (s === null)
    return (0, Q.jsx)(`p`, {
      className: `mail-status`,
      role: `status`,
      children: `Opening the draft…`,
    });
  let L = [...De(d), ...De(h)].map(Oe),
    R = () => {
      b && ne();
    };
  return (0, Q.jsxs)(`form`, {
    className: `mail-draft`,
    "aria-label": `Draft`,
    onSubmit: (e) => {
      (e.preventDefault(), te());
    },
    children: [
      (0, Q.jsxs)(`header`, {
        className: `mail-draft-header`,
        children: [
          (0, Q.jsx)(`h1`, { children: `Draft` }),
          r.agentEditedAt === null
            ? null
            : (0, Q.jsx)(`span`, {
                className: `mail-badge`,
                children: `Edited by the agent`,
              }),
        ],
      }),
      (0, Q.jsxs)(`label`, {
        className: `mail-field`,
        children: [
          (0, Q.jsx)(`span`, { children: `To` }),
          (0, Q.jsx)(`input`, {
            value: d,
            readOnly: C,
            onBlur: R,
            onInput: (e) => {
              (m(e.currentTarget.value), N());
            },
            autoComplete: `off`,
          }),
        ],
      }),
      (0, Q.jsxs)(`label`, {
        className: `mail-field`,
        children: [
          (0, Q.jsx)(`span`, { children: `Cc` }),
          (0, Q.jsx)(`input`, {
            value: h,
            readOnly: C,
            onBlur: R,
            onInput: (e) => {
              (g(e.currentTarget.value), N());
            },
            autoComplete: `off`,
          }),
        ],
      }),
      (0, Q.jsxs)(`label`, {
        className: `mail-field`,
        children: [
          (0, Q.jsx)(`span`, { children: `Subject` }),
          (0, Q.jsx)(`input`, {
            value: _,
            readOnly: C,
            onBlur: R,
            onInput: (e) => {
              (v(e.currentTarget.value), N());
            },
          }),
        ],
      }),
      (0, Q.jsxs)(`label`, {
        className: `mail-field is-body`,
        children: [
          (0, Q.jsx)(`span`, { children: `Body` }),
          (0, Q.jsx)(`textarea`, {
            value: y,
            readOnly: C,
            onBlur: R,
            onInput: (e) => {
              (ee(e.currentTarget.value), N());
            },
          }),
        ],
      }),
      (0, Q.jsx)(`p`, {
        className: `mail-note`,
        "data-mail-send-recipients": L.join(`,`),
        children:
          L.length > 0
            ? `Send goes to: ${L.join(`, `)}`
            : `Add a recipient to send.`,
      }),
      (0, Q.jsxs)(`div`, {
        className: `mail-actions`,
        children: [
          (0, Q.jsx)(`button`, {
            className: `button is-primary`,
            type: `button`,
            disabled: C || L.length === 0,
            onClick: ae,
            children: `Send`,
          }),
          (0, Q.jsx)(`button`, {
            className: `button`,
            type: `submit`,
            disabled: C,
            children: `Save`,
          }),
          (0, Q.jsx)(`button`, {
            className: `button`,
            type: `button`,
            disabled: C,
            onClick: re,
            children: `Copy`,
          }),
          (0, Q.jsx)(`button`, {
            className: `button`,
            type: `button`,
            disabled: C,
            onClick: ie,
            children: `Delete`,
          }),
          D === null
            ? null
            : (0, Q.jsx)(`span`, {
                className: D.isError
                  ? `mail-draft-status is-error`
                  : `mail-draft-status`,
                role: D.isError ? `alert` : `status`,
                children: D.text,
              }),
        ],
      }),
      (0, Q.jsx)(`p`, {
        className: `mail-note`,
        children: `This is a Gmail draft. It also shows in Gmail, where Gmail's own Send works. When the agent changes this draft, its version replaces text you did not save.`,
      }),
    ],
  });
}
export { Me as MailApp };
