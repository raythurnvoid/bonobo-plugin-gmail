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
function x(e, t, n) {
  return u(e, `/page/drafts/list`, { accountId: t, cursor: n }, _);
}
function S(e, t, n) {
  return u(e, `/page/drafts/get`, { accountId: t, clientDraftId: n }, v);
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
    if (typeof o == `number` && r < E) {
      await D(o + Math.random() * 250);
      continue;
    }
    return i;
  }
}
function A(e) {
  return typeof e == `string` ? e : ``;
}
function j(e) {
  return Array.isArray(e) ? e.filter((e) => typeof e == `string`) : [];
}
function M(e) {
  return (
    e
      .slice(e.lastIndexOf(`/`) + 1)
      .replace(/\.md$/u, ``)
      .replace(/^\d{2}-/u, ``)
      .replace(/-[0-9a-f]+$/u, ``)
      .replace(/-/gu, ` `) || `(no subject)`
  );
}
function N(e) {
  let t = /\/(\d{4})\/(\d{2})\/(\d{2})-[^/]*$/u.exec(e);
  return t ? `${t[1]}-${t[2]}-${t[3]}` : ``;
}
function ee(e, t) {
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
      subject: A(n.subject) || M(e),
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
  return ee(t, n.body.content);
}
function F(e) {
  let t = /^(\d{2})-.*-([0-9a-f]{1,16})\.md$/u.exec(e);
  return t ? `${t[1]}-${t[2].padStart(16, `0`)}` : e;
}
async function te(e, t) {
  let n = [],
    r = null;
  for (;;) {
    let i = await k(e, `/api/v1/files/list`, {
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
    if (i.status === 403) return null;
    if (i.status === 404) return [];
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
      n.push({ path: e.path, name: e.name, kind: e.kind, locked: e.locked });
    if (i.body.isDone) return n;
    r = i.body.cursor;
  }
}
function ne(e, t) {
  let n = [{ folders: [t] }],
    r = [];
  return {
    lockedFolders: r,
    async next() {
      for (; n.length > 0; ) {
        let t = n[n.length - 1],
          i = t.folders[0];
        if (i === void 0) {
          n.pop();
          continue;
        }
        let a = await te(e, i);
        if ((t.folders.shift(), a === null)) {
          r.push(i);
          continue;
        }
        let o = (e, t) => (e < t ? 1 : e > t ? -1 : 0),
          s = a
            .filter(
              (e) => e.kind === `folder` && !e.name.endsWith(`-attachments`),
            )
            .sort((e, t) => o(e.name, t.name));
        for (let e of s) e.locked && r.push(e.path);
        let c = a
            .filter((e) => e.kind === `file` && e.name.endsWith(`.md`))
            .sort((e, t) => o(F(e.name), F(t.name))),
          l = s.filter((e) => !e.locked);
        if (
          (l.length > 0 && n.push({ folders: l.map((e) => e.path) }),
          c.length > 0)
        )
          return c.map((e) => ({
            path: e.path,
            subject: M(e.path),
            day: N(e.path),
            locked: e.locked,
            headers: null,
          }));
      }
      return null;
    },
  };
}
var I = 12e3,
  L = 300,
  R = 10,
  re = 25,
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
  return e.slice(0, R).map((e) => H(e, L));
}
function W(e) {
  return {
    path: e.path,
    from: H(e.headers.from, L),
    to: U(e.headers.to),
    cc: U(e.headers.cc),
    subject: H(e.headers.subject, L),
    date: e.headers.date,
    direction: e.headers.direction,
    body: H(e.body, I),
  };
}
function ie(e) {
  return {
    draftId: e.clientDraftId,
    to: U(e.to),
    cc: U(e.cc),
    subject: H(e.subject, L),
    isReply: e.isReply,
    editedByAgent: e.agentEditedAt !== null,
  };
}
function ae(e) {
  return {
    draftId: e.clientDraftId,
    to: U(e.to),
    cc: U(e.cc),
    subject: H(e.subject, L),
    body: H(e.body, I),
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
function oe(e) {
  let t = J(K(e, `draftId`), `draftId`);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)
  )
    throw Error(
      `No draft has the id ${H(t, L)}. Call list_drafts to see the ids.`,
    );
  return t;
}
function se(e, t) {
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
          throw Error(O(e));
        }
      }),
    a = [
      i(`get_view`, async () => {
        let n = t.getView(),
          r =
            n.account && n.openDraftId
              ? await S(e, n.account.accountId, n.openDraftId).catch(() => null)
              : null;
        return {
          account: n.account?.emailAddress ?? null,
          canWriteDrafts: n.account?.canCompose ?? !1,
          folder: n.folder,
          openEmail: n.openEmail ? W(n.openEmail) : null,
          openDraft: r ? ae(r) : null,
          emails: n.rows
            .slice(0, re)
            .map((e) => ({
              path: e.path,
              from: e.headers ? H(e.headers.from, L) : null,
              subject: H(e.headers?.subject ?? e.subject, L),
              date: e.headers?.date ?? e.day,
              direction: e.headers?.direction ?? null,
              locked: e.locked,
            })),
          draftCount: n.drafts.length,
        };
      }),
      i(`open_email`, async (n) => {
        let r = J(K(G(n), `path`), `path`);
        if (!r.startsWith(`/`) || !r.endsWith(`.md`))
          throw Error(`path must be a Files path that ends with .md`);
        let i = await P(e, r);
        return (t.showEmail(i), W(i));
      }),
      i(`list_drafts`, () => ({
        drafts: t.getView().drafts.map(ie),
        note: `These are the newest drafts, without their text. To read one, ask the member to open it, then call get_view.`,
      })),
      i(`create_draft`, async (i) => {
        let a = G(i),
          o = {
            to: J(q(a, `to`), `to`),
            cc: q(a, `cc`) ?? [],
            subject: J(K(a, `subject`), `subject`),
            body: J(K(a, `body`), `body`),
          },
          s = K(a, `replyToPath`);
        b(o);
        let c = n(),
          l = null;
        if (
          s !== void 0 &&
          ((l = (await P(e, s)).headers.gmailMessageId), l === null)
        )
          throw Error(
            `${s} has no Gmail id, so a reply cannot be made from it`,
          );
        let u = JSON.stringify([c.accountId, o, l]),
          d = r.get(u) ?? y();
        return (
          r.set(u, d),
          r.size > 20 && r.delete(r.keys().next().value),
          await C(e, {
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
        let i = G(r),
          a = oe(i),
          o = n(),
          s = await S(e, o.accountId, a),
          c = {
            to: q(i, `to`) ?? s.to,
            cc: q(i, `cc`) ?? s.cc,
            subject: K(i, `subject`) ?? s.subject,
            body: K(i, `body`) ?? s.body,
          };
        return (
          await w(e, {
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
        let i = oe(G(r));
        return (
          await T(e, n().accountId, i),
          await t.refreshDrafts().catch(() => {}),
          { draftId: i, deleted: !0 }
        );
      }),
    ];
  return () => {
    for (let e of a) e();
  };
}
var ce = 45e3;
async function le(e, t) {
  await u(e, `/page/drafts/send`, t, a({ sent: o() }), ce);
}
var Y = n(),
  ue = 30,
  de = 4,
  X = 3e3,
  fe = 1e4,
  pe = 5e3,
  me = 15e3;
function he(e) {
  let t = new Date(e);
  return Number.isNaN(t.getTime())
    ? ``
    : t.toLocaleString(void 0, { dateStyle: `medium`, timeStyle: `short` });
}
function ge(e) {
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
function _e(e) {
  return /<([^<>]+)>\s*$/u.exec(e)?.[1] ?? e;
}
function ve(e) {
  let t = /^re:/iu.test(e.headers.subject)
      ? e.headers.subject
      : `Re: ${e.headers.subject}`,
    n = (e.body.length > X ? `${e.body.slice(0, X)}…` : e.body)
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
      body: `\n\nOn ${he(e.headers.date)}, ${e.headers.from} wrote:\n${n}`,
    },
    replyToGmailMessageId: e.headers.gmailMessageId,
  };
}
function ye(e) {
  return e.isComposer
    ? e.canCompose
      ? null
      : `Drafts are off for ${e.emailAddress}. Open the Gmail page and press Allow drafts and Send.`
    : `Only the member who connected ${e.emailAddress} can write drafts for it.`;
}
async function be(e, t) {
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
function xe(e) {
  let { client: t } = e,
    [n, r] = (0, p.useState)(null),
    [i, a] = (0, p.useState)(null),
    [o, s] = (0, p.useState)(`all`),
    [c, l] = (0, p.useState)([]),
    [u, d] = (0, p.useState)(ue),
    [f, m] = (0, p.useState)(!1),
    [h, g] = (0, p.useState)(!1),
    [_, v] = (0, p.useState)(null),
    [b, S] = (0, p.useState)([]),
    [w, T] = (0, p.useState)(null),
    [E, D] = (0, p.useState)(null),
    [k, A] = (0, p.useState)(null),
    [j, M] = (0, p.useState)(null),
    [N, ee] = (0, p.useState)(!1),
    [F, te] = (0, p.useState)(null),
    [I, L] = (0, p.useState)(null),
    [R, re] = (0, p.useState)(null),
    z = n?.find((e) => e.accountId === i) ?? null,
    B = z ? ye(z) : null,
    V = (0, p.useMemo)(
      () => (z === null ? null : ne(t, z.destinationPath)),
      [t, z?.destinationPath],
    ),
    H = (0, p.useRef)(null),
    U = (0, p.useRef)(!1),
    W = (0, p.useRef)([]),
    ie = (0, p.useRef)(new Set()),
    ae = (0, p.useRef)(0),
    G = (0, p.useRef)(null),
    K = (0, p.useRef)(new Set()),
    q = (0, p.useRef)({
      account: z,
      folder: o,
      rows: c,
      openEmail: E,
      openDraftId: null,
      drafts: [],
    });
  q.current = {
    account: z,
    folder: o,
    rows: c,
    openEmail: w?.kind === `email` ? E : null,
    openDraftId: w?.kind === `draft` ? w.id : null,
    drafts: j ?? [],
  };
  let J = async () => {
      let e = q.current.account;
      if (e === null || ye(e) !== null) return;
      let n = await x(t, e.accountId, null);
      q.current.account?.accountId === e.accountId &&
        (te(null), M(n.drafts), ee(n.cursor !== null));
    },
    oe = () => {
      J().catch(() => {});
    },
    ce = (e) => {
      ((G.current = e.path),
        s(`all`),
        T({ kind: `email`, path: e.path }),
        D(e),
        A(null));
    },
    le = (e) => {
      if (
        ((G.current = e),
        T({ kind: `email`, path: e }),
        D(null),
        A(null),
        c.some((t) => t.path === e && t.locked))
      ) {
        A(
          `You cannot open ${e}. It is locked in Files. Ask a member who can manage it to give you access.`,
        );
        return;
      }
      P(t, e).then(
        (t) => {
          G.current === e && D(t);
        },
        (t) => {
          G.current === e && A(O(t));
        },
      );
    },
    X = (e) => {
      ((G.current = null), s(`drafts`), T({ kind: `draft`, id: e }), re(null));
    },
    fe = (e) => {
      if (z === null) return;
      let n = y();
      (L(null),
        C(t, { accountId: z.accountId, clientDraftId: n, ...e, byAgent: !1 })
          .then(() => J().catch(() => {}))
          .then(
            () => X(n),
            (e) => L(O(e)),
          ));
    },
    Q = (e, t, n) => {
      U.current ||
        ((U.current = !0),
        g(!0),
        v(null),
        (async () => {
          let r = t;
          for (; r < n; ) {
            let t = await e.next();
            if (H.current !== e) return;
            if ((S([...e.lockedFolders]), t === null)) {
              m(!0);
              return;
            }
            ((r += t.length), l((e) => [...e, ...t]));
          }
        })()
          .catch((t) => {
            H.current === e && v(O(t));
          })
          .finally(() => {
            ((U.current = !1), H.current === e && g(!1));
          }));
    },
    _e = () => {
      if (V === null || h) return;
      let e = u + ue;
      (d(e), c.length < e && !f && Q(V, c.length, e));
    },
    xe = (e, n) => {
      ne(t, n)
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
    we = () => {
      for (; ae.current < de; ) {
        let e = W.current.shift();
        if (e === void 0) return;
        ((ae.current += 1),
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
              (--ae.current, we());
            }));
      }
    };
  ((0, p.useEffect)(() => {
    be(t, K.current).then(
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
        M(null),
        T(null),
        D(null),
        (G.current = null),
        d(ue),
        m(!1),
        S([]),
        g(!1),
        (W.current = []),
        ie.current.clear(),
        (H.current = V),
        (U.current = !1),
        V !== null && Q(V, 0, ue));
    }, [V]),
    (0, p.useEffect)(() => {
      for (let e of c.slice(0, u))
        !e.locked &&
          e.headers === null &&
          !ie.current.has(e.path) &&
          (ie.current.add(e.path), W.current.push(e.path));
      we();
    }, [t, c, u]),
    (0, p.useEffect)(() => {
      if (z === null || B !== null) return;
      let e = () => {
        document.visibilityState === `visible` && J().catch((e) => te(O(e)));
      };
      e();
      let t = setInterval(e, pe);
      return () => clearInterval(t);
    }, [t, z?.accountId, B]),
    (0, p.useEffect)(() => {
      if (V === null || z === null) return;
      let { accountId: e, destinationPath: n } = z,
        r = null,
        i = () => {
          document.visibilityState === `visible` &&
            be(t, K.current).then(
              (t) => {
                let i = t.newestEmailAt.get(e);
                i !== void 0 && (r !== null && i > r && xe(V, n), (r = i));
              },
              () => {},
            );
        };
      i();
      let a = setInterval(i, me);
      return () => clearInterval(a);
    }, [t, V]),
    (0, p.useEffect)(
      () =>
        se(t, {
          getView: () => q.current,
          showEmail: ce,
          showDraft: X,
          refreshDrafts: J,
        }),
      [t],
    ));
  let $ =
    w?.kind === `draft`
      ? ((j ?? []).find((e) => e.clientDraftId === w.id) ?? null)
      : null;
  return (0, Y.jsxs)(`div`, {
    className: `mail`,
    children: [
      (0, Y.jsxs)(`nav`, {
        className: `mail-rail`,
        "aria-label": `Mailboxes`,
        children: [
          (0, Y.jsx)(`button`, {
            className: `button is-primary`,
            disabled: z === null || B !== null,
            onClick: () =>
              fe({
                fields: { to: [], cc: [], subject: ``, body: `` },
                replyToGmailMessageId: null,
              }),
            children: `Compose`,
          }),
          I === null
            ? null
            : (0, Y.jsx)(`p`, {
                className: `mail-status is-error`,
                role: `alert`,
                children: I,
              }),
          B === null
            ? null
            : (0, Y.jsx)(`p`, { className: `mail-status`, children: B }),
          (0, Y.jsx)(`button`, {
            className: `mail-rail-item`,
            "aria-current": o === `all` ? `page` : void 0,
            onClick: () => s(`all`),
            children: `All mail`,
          }),
          (0, Y.jsxs)(`button`, {
            className: `mail-rail-item`,
            "aria-current": o === `drafts` ? `page` : void 0,
            onClick: () => s(`drafts`),
            children: [
              `Drafts`,
              j !== null && j.length > 0
                ? (0, Y.jsx)(`span`, {
                    className: `mail-rail-count`,
                    children: j.length,
                  })
                : null,
            ],
          }),
          n !== null && n.length > 1
            ? (0, Y.jsxs)(`label`, {
                className: `mail-rail-account`,
                children: [
                  `Account`,
                  (0, Y.jsx)(`select`, {
                    value: i ?? ``,
                    onChange: (e) => a(e.currentTarget.value),
                    children: n.map((e) =>
                      (0, Y.jsx)(
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
      (0, Y.jsx)(`section`, {
        className: `mail-list`,
        "aria-label": o === `all` ? `All mail` : `Drafts`,
        children:
          o === `all`
            ? (0, Y.jsxs)(Y.Fragment, {
                children: [
                  n !== null && n.length === 0 && _ === null
                    ? (0, Y.jsx)(`p`, {
                        className: `mail-status`,
                        children: `No Gmail account is connected. Connect one on the Gmail page.`,
                      })
                    : null,
                  z !== null && b.includes(z.destinationPath)
                    ? (0, Y.jsxs)(`p`, {
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
                      ? (0, Y.jsxs)(`p`, {
                          className: `mail-status`,
                          "data-mail-locked-folders": b.join(`,`),
                          children: [
                            `Mail skipped emails in folders you cannot open: `,
                            b.join(`, `),
                            `. Ask a member who can manage them in Files to give you access.`,
                          ],
                        })
                      : null,
                  (0, Y.jsx)(`ul`, {
                    className: `mail-rows`,
                    children: c
                      .slice(0, u)
                      .map((e) =>
                        (0, Y.jsx)(
                          `li`,
                          {
                            children: (0, Y.jsxs)(`button`, {
                              className: `mail-row`,
                              "aria-current":
                                w?.kind === `email` && w.path === e.path
                                  ? `true`
                                  : void 0,
                              "data-direction": e.headers?.direction ?? void 0,
                              "data-locked": e.locked ? `` : void 0,
                              onClick: () => le(e.path),
                              children: [
                                (0, Y.jsx)(`span`, {
                                  className: `mail-row-from`,
                                  children: e.locked
                                    ? (0, Y.jsx)(`span`, {
                                        className: `mail-badge`,
                                        children: `Locked`,
                                      })
                                    : e.headers === null
                                      ? ``
                                      : e.headers.direction === `sent`
                                        ? `To: ${ge(e.headers.to[0] ?? ``)}`
                                        : ge(e.headers.from),
                                }),
                                (0, Y.jsx)(`span`, {
                                  className: `mail-row-date`,
                                  children: e.headers
                                    ? he(e.headers.date)
                                    : e.day,
                                }),
                                (0, Y.jsx)(`span`, {
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
                    ? (0, Y.jsx)(`p`, {
                        className: `mail-status`,
                        role: `status`,
                        children: `Loading…`,
                      })
                    : null,
                  !h && V !== null && (c.length > u || !f)
                    ? (0, Y.jsx)(`button`, {
                        className: `button mail-more`,
                        onClick: _e,
                        children: `Show more`,
                      })
                    : null,
                  _ === null
                    ? null
                    : (0, Y.jsx)(`p`, {
                        className: `mail-status is-error`,
                        role: `alert`,
                        children: _,
                      }),
                ],
              })
            : (0, Y.jsxs)(Y.Fragment, {
                children: [
                  B === null
                    ? null
                    : (0, Y.jsx)(`p`, {
                        className: `mail-status`,
                        children: B,
                      }),
                  F === null
                    ? null
                    : (0, Y.jsx)(`p`, {
                        className: `mail-status is-error`,
                        role: `alert`,
                        children: F,
                      }),
                  j !== null && j.length === 0
                    ? (0, Y.jsx)(`p`, {
                        className: `mail-status`,
                        children: `No drafts. Ask the agent to write one.`,
                      })
                    : null,
                  (0, Y.jsx)(`ul`, {
                    className: `mail-rows`,
                    children: (j ?? []).map((e) =>
                      (0, Y.jsx)(
                        `li`,
                        {
                          children: (0, Y.jsxs)(`button`, {
                            className: `mail-row`,
                            "aria-current":
                              w?.kind === `draft` && w.id === e.clientDraftId
                                ? `true`
                                : void 0,
                            onClick: () => X(e.clientDraftId),
                            children: [
                              (0, Y.jsx)(`span`, {
                                className: `mail-row-from`,
                                children:
                                  e.to.length > 0
                                    ? `To: ${Z(e.to)}`
                                    : `No recipients`,
                              }),
                              (0, Y.jsx)(`span`, {
                                className: `mail-row-date`,
                                children:
                                  e.agentEditedAt === null
                                    ? null
                                    : (0, Y.jsx)(`span`, {
                                        className: `mail-badge`,
                                        children: `Agent`,
                                      }),
                              }),
                              (0, Y.jsx)(`span`, {
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
                  N
                    ? (0, Y.jsx)(`p`, {
                        className: `mail-status`,
                        children: `Showing the 25 newest drafts.`,
                      })
                    : null,
                ],
              }),
      }),
      (0, Y.jsxs)(`main`, {
        className: `mail-reader`,
        children: [
          R === null
            ? null
            : (0, Y.jsx)(`p`, {
                className: `mail-status`,
                role: `status`,
                children: R,
              }),
          w === null && R === null
            ? (0, Y.jsx)(`p`, {
                className: `mail-status`,
                children: `Choose an email or a draft.`,
              })
            : null,
          w?.kind === `email`
            ? k === null
              ? E === null || E.path !== w.path
                ? (0, Y.jsx)(`p`, {
                    className: `mail-status`,
                    role: `status`,
                    children: `Opening…`,
                  })
                : (0, Y.jsx)(Se, {
                    email: E,
                    replyBlock: B,
                    onReply: () => fe(ve(E)),
                  })
              : (0, Y.jsx)(`p`, {
                  className: `mail-status is-error`,
                  role: `alert`,
                  children: k,
                })
            : null,
          w?.kind === `draft` && z !== null
            ? $ !== null && !$.saving
              ? (0, Y.jsx)(
                  Ce,
                  {
                    client: t,
                    accountId: z.accountId,
                    draft: $,
                    onChanged: oe,
                    onClosed: (e) => {
                      (T(null), re(e), oe());
                    },
                  },
                  `${$.clientDraftId}:${$.agentEditedAt ?? 0}`,
                )
              : (0, Y.jsx)(`p`, {
                  className: `mail-status`,
                  role: `status`,
                  children:
                    j === null || $?.saving
                      ? `Opening the draft…`
                      : `This draft is not available. It may have been sent or deleted.`,
                })
            : null,
        ],
      }),
    ],
  });
}
function Se(e) {
  let { email: t, replyBlock: n, onReply: r } = e;
  return (0, Y.jsxs)(`article`, {
    className: `mail-email`,
    "aria-label": t.headers.subject,
    children: [
      (0, Y.jsxs)(`header`, {
        className: `mail-email-header`,
        children: [
          (0, Y.jsx)(`h1`, { children: t.headers.subject }),
          (0, Y.jsxs)(`dl`, {
            children: [
              (0, Y.jsx)(`dt`, { children: `From` }),
              (0, Y.jsx)(`dd`, { children: t.headers.from }),
              (0, Y.jsx)(`dt`, { children: `To` }),
              (0, Y.jsx)(`dd`, { children: Z(t.headers.to) }),
              t.headers.cc.length > 0
                ? (0, Y.jsxs)(Y.Fragment, {
                    children: [
                      (0, Y.jsx)(`dt`, { children: `Cc` }),
                      (0, Y.jsx)(`dd`, { children: Z(t.headers.cc) }),
                    ],
                  })
                : null,
              (0, Y.jsx)(`dt`, { children: `Date` }),
              (0, Y.jsx)(`dd`, { children: he(t.headers.date) }),
            ],
          }),
          (0, Y.jsxs)(`div`, {
            className: `mail-actions`,
            children: [
              (0, Y.jsx)(`button`, {
                className: `button`,
                disabled: n !== null || t.headers.gmailMessageId === null,
                onClick: r,
                children: `Reply`,
              }),
              n === null
                ? null
                : (0, Y.jsx)(`span`, {
                    className: `mail-draft-status`,
                    children: n,
                  }),
            ],
          }),
        ],
      }),
      (0, Y.jsx)(`div`, { className: `mail-email-body`, children: t.body }),
    ],
  });
}
function Ce(e) {
  let { client: t, accountId: n, draft: r, onChanged: i, onClosed: a } = e,
    [o, s] = (0, p.useState)(null),
    [c, l] = (0, p.useState)(null),
    [u, d] = (0, p.useState)(``),
    [m, h] = (0, p.useState)(``),
    [g, _] = (0, p.useState)(``),
    [v, y] = (0, p.useState)(``),
    [b, x] = (0, p.useState)(!1),
    [C, E] = (0, p.useState)(!1),
    [D, k] = (0, p.useState)(null),
    A = { accountId: n, clientDraftId: r.clientDraftId },
    j = (e, t) => {
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
    M = () => ({ to: Q(u), cc: Q(m), subject: g, body: v }),
    N = () => (x(!1), w(t, { ...A, fields: M(), byAgent: !1 }).then(i)),
    ee = () => j(N, `Saved to Gmail`),
    P = () =>
      N().then(
        () => k({ text: `Saved to Gmail`, isError: !1 }),
        (e) => k({ text: O(e), isError: !0 }),
      ),
    F = () =>
      j(async () => {
        let e = M(),
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
    te = () => {
      (x(!1),
        j(async () => {
          (await T(t, n, r.clientDraftId), a(`Draft deleted.`));
        }, `Deleted`));
    },
    ne = () => {
      let e = M();
      (x(!1),
        E(!0),
        k({ text: `Sending…`, isError: !1 }),
        le(t, { ...A, fields: e }).then(
          () => a(`Sent: ${e.subject || `(no subject)`}`),
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
            e || (s(t), d(Z(t.to)), h(Z(t.cc)), _(t.subject), y(t.body));
          },
          (t) => {
            if (!e) {
              if (t instanceof f && t.code === `draft_gone`) {
                a(O(t));
                return;
              }
              l(O(t));
            }
          },
        ),
        () => {
          e = !0;
        }
      );
    }, [t, n, r.clientDraftId]),
    (0, p.useEffect)(() => {
      if (!b) return;
      let e = setTimeout(P, fe);
      return () => clearTimeout(e);
    }, [b, u, m, g, v]),
    c !== null)
  )
    return (0, Y.jsx)(`p`, {
      className: `mail-status is-error`,
      role: `alert`,
      children: c,
    });
  if (o === null)
    return (0, Y.jsx)(`p`, {
      className: `mail-status`,
      role: `status`,
      children: `Opening the draft…`,
    });
  let I = [...Q(u), ...Q(m)].map(_e),
    L = () => {
      b && P();
    };
  return (0, Y.jsxs)(`form`, {
    className: `mail-draft`,
    "aria-label": `Draft`,
    onSubmit: (e) => {
      (e.preventDefault(), ee());
    },
    children: [
      (0, Y.jsxs)(`header`, {
        className: `mail-draft-header`,
        children: [
          (0, Y.jsx)(`h1`, { children: `Draft` }),
          r.agentEditedAt === null
            ? null
            : (0, Y.jsx)(`span`, {
                className: `mail-badge`,
                children: `Edited by the agent`,
              }),
        ],
      }),
      (0, Y.jsxs)(`label`, {
        className: `mail-field`,
        children: [
          (0, Y.jsx)(`span`, { children: `To` }),
          (0, Y.jsx)(`input`, {
            value: u,
            readOnly: C,
            onBlur: L,
            onInput: (e) => {
              (d(e.currentTarget.value), x(!0));
            },
            autoComplete: `off`,
          }),
        ],
      }),
      (0, Y.jsxs)(`label`, {
        className: `mail-field`,
        children: [
          (0, Y.jsx)(`span`, { children: `Cc` }),
          (0, Y.jsx)(`input`, {
            value: m,
            readOnly: C,
            onBlur: L,
            onInput: (e) => {
              (h(e.currentTarget.value), x(!0));
            },
            autoComplete: `off`,
          }),
        ],
      }),
      (0, Y.jsxs)(`label`, {
        className: `mail-field`,
        children: [
          (0, Y.jsx)(`span`, { children: `Subject` }),
          (0, Y.jsx)(`input`, {
            value: g,
            readOnly: C,
            onBlur: L,
            onInput: (e) => {
              (_(e.currentTarget.value), x(!0));
            },
          }),
        ],
      }),
      (0, Y.jsxs)(`label`, {
        className: `mail-field is-body`,
        children: [
          (0, Y.jsx)(`span`, { children: `Body` }),
          (0, Y.jsx)(`textarea`, {
            value: v,
            readOnly: C,
            onBlur: L,
            onInput: (e) => {
              (y(e.currentTarget.value), x(!0));
            },
          }),
        ],
      }),
      (0, Y.jsx)(`p`, {
        className: `mail-note`,
        "data-mail-send-recipients": I.join(`,`),
        children:
          I.length > 0
            ? `Send goes to: ${I.join(`, `)}`
            : `Add a recipient to send.`,
      }),
      (0, Y.jsxs)(`div`, {
        className: `mail-actions`,
        children: [
          (0, Y.jsx)(`button`, {
            className: `button is-primary`,
            type: `button`,
            disabled: C || I.length === 0,
            onClick: ne,
            children: `Send`,
          }),
          (0, Y.jsx)(`button`, {
            className: `button`,
            type: `submit`,
            disabled: C,
            children: `Save`,
          }),
          (0, Y.jsx)(`button`, {
            className: `button`,
            type: `button`,
            disabled: C,
            onClick: F,
            children: `Copy`,
          }),
          (0, Y.jsx)(`button`, {
            className: `button`,
            type: `button`,
            disabled: C,
            onClick: te,
            children: `Delete`,
          }),
          D === null
            ? null
            : (0, Y.jsx)(`span`, {
                className: D.isError
                  ? `mail-draft-status is-error`
                  : `mail-draft-status`,
                role: D.isError ? `alert` : `status`,
                children: D.text,
              }),
        ],
      }),
      (0, Y.jsx)(`p`, {
        className: `mail-note`,
        children: `This is a Gmail draft. It also shows in Gmail, where Gmail's own Send works. When the agent changes this draft, its version replaces text you did not save.`,
      }),
    ],
  });
}
export { xe as MailApp };
