const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      "./mail-app.js",
      "./rolldown-runtime.js",
      "./react.js",
      "./zod.js",
      "./gmail-api.js",
      "./mail-app.css",
      "./gmail-page.js",
      "./gmail-page.css",
    ]),
) => i.map((i) => d[i]);
import { n as e } from "./rolldown-runtime.js";
import { n as t, r as n, t as r } from "./react.js";
(function () {
  let e = document.createElement(`link`).relList;
  if (e && e.supports && e.supports(`modulepreload`)) return;
  for (let e of document.querySelectorAll(`link[rel="modulepreload"]`)) n(e);
  new MutationObserver((e) => {
    for (let t of e)
      if (t.type === `childList`)
        for (let e of t.addedNodes)
          e.tagName === `LINK` && e.rel === `modulepreload` && n(e);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(e) {
    let t = {};
    return (
      e.integrity && (t.integrity = e.integrity),
      e.referrerPolicy && (t.referrerPolicy = e.referrerPolicy),
      (t.credentials =
        e.crossOrigin === `use-credentials`
          ? `include`
          : e.crossOrigin === `anonymous`
            ? `omit`
            : `same-origin`),
      t
    );
  }
  function n(e) {
    if (e.ep) return;
    e.ep = !0;
    let n = t(e);
    fetch(e.href, n);
  }
})();
for (
  var i = [],
    a = [],
    o = Uint8Array,
    s = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`,
    c = 0,
    l = s.length;
  c < l;
  ++c
)
  ((i[c] = s[c]), (a[s.charCodeAt(c)] = c));
((a[45] = 62), (a[95] = 63));
function u(e) {
  var t = e.length;
  if (t % 4 > 0) throw Error(`Invalid string. Length must be a multiple of 4`);
  var n = e.indexOf(`=`);
  n === -1 && (n = t);
  var r = n === t ? 0 : 4 - (n % 4);
  return [n, r];
}
function d(e, t, n) {
  return ((t + n) * 3) / 4 - n;
}
function f(e) {
  for (
    var t,
      n = u(e),
      r = n[0],
      i = n[1],
      s = new o(d(e, r, i)),
      c = 0,
      l = i > 0 ? r - 4 : r,
      f = 0;
    f < l;
    f += 4
  )
    ((t =
      (a[e.charCodeAt(f)] << 18) |
      (a[e.charCodeAt(f + 1)] << 12) |
      (a[e.charCodeAt(f + 2)] << 6) |
      a[e.charCodeAt(f + 3)]),
      (s[c++] = (t >> 16) & 255),
      (s[c++] = (t >> 8) & 255),
      (s[c++] = t & 255));
  return (
    i === 2 &&
      ((t = (a[e.charCodeAt(f)] << 2) | (a[e.charCodeAt(f + 1)] >> 4)),
      (s[c++] = t & 255)),
    i === 1 &&
      ((t =
        (a[e.charCodeAt(f)] << 10) |
        (a[e.charCodeAt(f + 1)] << 4) |
        (a[e.charCodeAt(f + 2)] >> 2)),
      (s[c++] = (t >> 8) & 255),
      (s[c++] = t & 255)),
    s
  );
}
function p(e) {
  return i[(e >> 18) & 63] + i[(e >> 12) & 63] + i[(e >> 6) & 63] + i[e & 63];
}
function m(e, t, n) {
  for (var r, i = [], a = t; a < n; a += 3)
    ((r =
      ((e[a] << 16) & 16711680) + ((e[a + 1] << 8) & 65280) + (e[a + 2] & 255)),
      i.push(p(r)));
  return i.join(``);
}
function h(e) {
  for (
    var t, n = e.length, r = n % 3, a = [], o = 16383, s = 0, c = n - r;
    s < c;
    s += o
  )
    a.push(m(e, s, s + o > c ? c : s + o));
  return (
    r === 1
      ? ((t = e[n - 1]), a.push(i[t >> 2] + i[(t << 4) & 63] + `==`))
      : r === 2 &&
        ((t = (e[n - 2] << 8) + e[n - 1]),
        a.push(i[t >> 10] + i[(t >> 4) & 63] + i[(t << 2) & 63] + `=`)),
    a.join(``)
  );
}
function g(e) {
  if (e === void 0) return {};
  if (!_(e))
    throw Error(
      `The arguments to a Convex function must be an object. Received: ${e}`,
    );
  return e;
}
function ee(e) {
  if (e === void 0)
    throw Error(
      `Client created with undefined deployment address. If you used an environment variable, check that it's set.`,
    );
  if (typeof e != `string`)
    throw Error(`Invalid deployment address: found ${e}".`);
  if (!(e.startsWith(`http:`) || e.startsWith(`https:`)))
    throw Error(
      `Invalid deployment address: Must start with "https://" or "http://". Found "${e}".`,
    );
  try {
    new URL(e);
  } catch {
    throw Error(
      `Invalid deployment address: "${e}" is not a valid URL. If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`,
    );
  }
  if (e.endsWith(`.convex.site`))
    throw Error(
      `Invalid deployment address: "${e}" ends with .convex.site, which is used for HTTP Actions. Convex deployment URLs typically end with .convex.cloud? If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`,
    );
}
function _(e) {
  let t = typeof e == `object`,
    n = Object.getPrototypeOf(e),
    r =
      n === null || n === Object.prototype || n?.constructor?.name === `Object`;
  return t && r;
}
var v = !0,
  y = BigInt(`-9223372036854775808`),
  b = BigInt(`9223372036854775807`),
  x = BigInt(`0`),
  te = BigInt(`8`),
  ne = BigInt(`256`),
  S = `This commit timestamp is unresolved: its value is assigned when the mutation commits. Read the document after the mutation completes to get its value.`,
  re = class {
    [Symbol.toPrimitive](e) {
      if (e === `string`) return this.toString();
      throw Error(S);
    }
    valueOf() {
      throw Error(S);
    }
    toJSON() {
      throw Error(S);
    }
    toString() {
      return `[unresolved commit timestamp]`;
    }
  },
  ie = new re();
function ae(e) {
  return Number.isNaN(e) || !Number.isFinite(e) || Object.is(e, -0);
}
function oe(e) {
  e < x && (e -= y + y);
  let t = e.toString(16);
  t.length % 2 == 1 && (t = `0` + t);
  let n = new Uint8Array(new ArrayBuffer(8)),
    r = 0;
  for (let i of t.match(/.{2}/g).reverse())
    (n.set([parseInt(i, 16)], r++), (e >>= te));
  return h(n);
}
function se(e) {
  let t = f(e);
  if (t.byteLength !== 8)
    throw Error(`Received ${t.byteLength} bytes, expected 8 for $integer`);
  let n = x,
    r = x;
  for (let e of t) ((n += BigInt(e) * ne ** r), r++);
  return (n > b && (n += y + y), n);
}
function ce(e) {
  if (e < y || b < e)
    throw Error(`BigInt ${e} does not fit into a 64-bit signed integer.`);
  let t = new ArrayBuffer(8);
  return (new DataView(t).setBigInt64(0, e, !0), h(new Uint8Array(t)));
}
function le(e) {
  let t = f(e);
  if (t.byteLength !== 8)
    throw Error(`Received ${t.byteLength} bytes, expected 8 for $integer`);
  return new DataView(t.buffer).getBigInt64(0, !0);
}
var ue = DataView.prototype.setBigInt64 ? ce : oe,
  de = DataView.prototype.getBigInt64 ? le : se,
  fe = 1024;
function C(e) {
  if (e.length > fe)
    throw Error(`Field name ${e} exceeds maximum field name length ${fe}.`);
  if (e.startsWith(`$`))
    throw Error(`Field name ${e} starts with a '$', which is reserved.`);
  for (let t = 0; t < e.length; t += 1) {
    let n = e.charCodeAt(t);
    if (n < 32 || n >= 127)
      throw Error(
        `Field name ${e} has invalid character '${e[t]}': Field names can only contain non-control ASCII characters`,
      );
  }
}
function w(e) {
  if (
    e === null ||
    typeof e == `boolean` ||
    typeof e == `number` ||
    typeof e == `string`
  )
    return e;
  if (Array.isArray(e)) return e.map((e) => w(e));
  if (typeof e != `object`) throw Error(`Unexpected type of ${e}`);
  let t = Object.entries(e);
  if (t.length === 1) {
    let n = t[0][0];
    if (n === `$bytes`) {
      if (typeof e.$bytes != `string`)
        throw Error(`Malformed $bytes field on ${e}`);
      return f(e.$bytes).buffer;
    }
    if (n === `$integer`) {
      if (typeof e.$integer != `string`)
        throw Error(`Malformed $integer field on ${e}`);
      return de(e.$integer);
    }
    if (n === `$float`) {
      if (typeof e.$float != `string`)
        throw Error(`Malformed $float field on ${e}`);
      let t = f(e.$float);
      if (t.byteLength !== 8)
        throw Error(`Received ${t.byteLength} bytes, expected 8 for $float`);
      let n = new DataView(t.buffer).getFloat64(0, v);
      if (!ae(n)) throw Error(`Float ${n} should be encoded as a number`);
      return n;
    }
    if (n === `$commitTs`) {
      if (e.$commitTs !== null)
        throw Error(`Malformed $commitTs field on ${e}`);
      return ie;
    }
    if (n === `$set`)
      throw Error(
        `Received a Set which is no longer supported as a Convex type.`,
      );
    if (n === `$map`)
      throw Error(
        `Received a Map which is no longer supported as a Convex type.`,
      );
  }
  let n = {};
  for (let [t, r] of Object.entries(e)) (C(t), (n[t] = w(r)));
  return n;
}
var pe = 16384;
function T(e) {
  let t = JSON.stringify(e, (e, t) =>
    t === void 0
      ? `undefined`
      : typeof t == `function`
        ? `[Function]`
        : typeof t == `symbol`
          ? String(t)
          : typeof t == `bigint`
            ? `${t.toString()}n`
            : t,
  );
  if (t.length > pe) {
    let e = 16370,
      n = t.codePointAt(e - 1);
    return (
      n !== void 0 && n > 65535 && --e,
      t.substring(0, e) + `[...truncated]`
    );
  }
  return t;
}
function E(e, t, n, r) {
  if (e === void 0) {
    let e = n && ` (present at path ${n} in original object ${T(t)})`;
    throw Error(
      `undefined is not a valid Convex value${e}. To learn about Convex's supported types, see https://docs.convex.dev/using/types.`,
    );
  }
  if (e === null) return e;
  if (typeof e == `bigint`) {
    if (e < y || b < e)
      throw Error(`BigInt ${e} does not fit into a 64-bit signed integer.`);
    return { $integer: ue(e) };
  }
  if (typeof e == `number`) {
    if (ae(e)) {
      let t = new ArrayBuffer(8);
      return (
        new DataView(t).setFloat64(0, e, v),
        { $float: h(new Uint8Array(t)) }
      );
    }
    return e;
  }
  if (typeof e == `boolean` || typeof e == `string`) return e;
  if (e instanceof ArrayBuffer) return { $bytes: h(new Uint8Array(e)) };
  if (e instanceof re) return { $commitTs: null };
  if (Array.isArray(e)) return e.map((e, r) => E(e, t, n + `[${r}]`, !1));
  if (e instanceof Set) throw Error(me(n, `Set`, [...e], t));
  if (e instanceof Map) throw Error(me(n, `Map`, [...e], t));
  if (!_(e)) {
    let r = e?.constructor?.name,
      i = r ? `${r} ` : ``;
    throw Error(me(n, i, e, t));
  }
  let i = {},
    a = Object.entries(e);
  a.sort(([e, t], [n, r]) => (e === n ? 0 : e < n ? -1 : 1));
  for (let [e, o] of a)
    o === void 0
      ? r && (C(e), (i[e] = he(o, t, n + `.${e}`)))
      : (C(e), (i[e] = E(o, t, n + `.${e}`, !1)));
  return i;
}
function me(e, t, n, r) {
  return e
    ? `${t}${T(n)} is not a supported Convex type (present at path ${e} in original object ${T(r)}). To learn about Convex's supported types, see https://docs.convex.dev/using/types.`
    : `${t}${T(n)} is not a supported Convex type.`;
}
function he(e, t, n) {
  if (e === void 0) return { $undefined: null };
  if (t === void 0)
    throw Error(
      `Programming error. Current value is ${T(e)} but original value is undefined`,
    );
  return E(e, t, n, !1);
}
function D(e) {
  return E(e, e, ``, !1);
}
var ge = Object.defineProperty,
  _e = (e, t, n) =>
    t in e
      ? ge(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  O = (e, t, n) => _e(e, typeof t == `symbol` ? t : t + ``, n),
  ve,
  ye,
  be = Symbol.for(`ConvexError`),
  k = class extends ((ye = Error), (ve = be), ye) {
    constructor(e) {
      (super(typeof e == `string` ? e : T(e)),
        O(this, `name`, `ConvexError`),
        O(this, `data`),
        O(this, ve, !0),
        (this.data = e));
    }
  },
  xe = `1.47.0`,
  Se = Object.defineProperty,
  Ce = (e, t, n) =>
    t in e
      ? Se(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  we = (e, t, n) => Ce(e, typeof t == `symbol` ? t : t + ``, n),
  Te = `color:rgb(0, 145, 255)`;
function Ee(e) {
  switch (e) {
    case `query`:
      return `Q`;
    case `mutation`:
      return `M`;
    case `action`:
      return `A`;
    case `any`:
      return `?`;
  }
}
var De = class {
  constructor(e) {
    (we(this, `_onLogLineFuncs`),
      we(this, `_verbose`),
      (this._onLogLineFuncs = {}),
      (this._verbose = e.verbose));
  }
  addLogLineListener(e) {
    let t = Math.random().toString(36).substring(2, 15);
    for (let e = 0; e < 10 && this._onLogLineFuncs[t] !== void 0; e++)
      t = Math.random().toString(36).substring(2, 15);
    return (
      (this._onLogLineFuncs[t] = e),
      () => {
        delete this._onLogLineFuncs[t];
      }
    );
  }
  logVerbose(...e) {
    if (this._verbose)
      for (let t of Object.values(this._onLogLineFuncs))
        t(`debug`, `${new Date().toISOString()}`, ...e);
  }
  log(...e) {
    for (let t of Object.values(this._onLogLineFuncs)) t(`info`, ...e);
  }
  warn(...e) {
    for (let t of Object.values(this._onLogLineFuncs)) t(`warn`, ...e);
  }
  error(...e) {
    for (let t of Object.values(this._onLogLineFuncs)) t(`error`, ...e);
  }
};
function Oe(e) {
  let t = new De(e);
  return (
    t.addLogLineListener((e, ...t) => {
      switch (e) {
        case `debug`:
          console.debug(...t);
          break;
        case `info`:
          console.log(...t);
          break;
        case `warn`:
          console.warn(...t);
          break;
        case `error`:
          console.error(...t);
          break;
        default:
          console.log(...t);
      }
    }),
    t
  );
}
function ke(e) {
  return new De(e);
}
function A(e, t, n, r, i) {
  let a = Ee(n);
  if (
    (typeof i == `object` &&
      (i = `ConvexError ${JSON.stringify(i.errorData, null, 2)}`),
    t === `info`)
  ) {
    let t = i.match(/^\[.*?\] /);
    if (t === null) {
      e.error(`[CONVEX ${a}(${r})] Could not parse console.log`);
      return;
    }
    let n = i.slice(1, t[0].length - 2),
      o = i.slice(t[0].length);
    e.log(`%c[CONVEX ${a}(${r})] [${n}]`, Te, o);
  } else e.error(`[CONVEX ${a}(${r})] ${i}`);
}
function Ae(e, t) {
  let n = `[CONVEX FATAL ERROR] ${t}`;
  return (e.error(n), Error(n));
}
function j(e, t, n) {
  return `[CONVEX ${Ee(e)}(${t})] ${n.errorMessage}
  Called by client`;
}
function M(e, t) {
  return ((t.data = e.errorData), t);
}
function N(e) {
  let t = e.split(`:`),
    n,
    r;
  return (
    t.length === 1
      ? ((n = t[0]), (r = `default`))
      : ((n = t.slice(0, t.length - 1).join(`:`)), (r = t[t.length - 1])),
    n.endsWith(`.js`) && (n = n.slice(0, -3)),
    `${n}:${r}`
  );
}
function P(e, t) {
  return JSON.stringify({ udfPath: N(e), args: D(t) });
}
function je(e, t, n) {
  let { initialNumItems: r, id: i } = n;
  return JSON.stringify({
    type: `paginated`,
    udfPath: N(e),
    args: D(t),
    options: D({ initialNumItems: r, id: i }),
  });
}
var Me = Object.defineProperty,
  Ne = (e, t, n) =>
    t in e
      ? Me(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  F = (e, t, n) => Ne(e, typeof t == `symbol` ? t : t + ``, n),
  Pe = class {
    constructor() {
      (F(this, `nextQueryId`),
        F(this, `querySetVersion`),
        F(this, `querySet`),
        F(this, `queryIdToToken`),
        F(this, `identityVersion`),
        F(this, `auth`),
        F(this, `outstandingQueriesOlderThanRestart`),
        F(this, `outstandingAuthOlderThanRestart`),
        F(this, `paused`),
        F(this, `pendingQuerySetModifications`),
        (this.nextQueryId = 0),
        (this.querySetVersion = 0),
        (this.identityVersion = 0),
        (this.querySet = new Map()),
        (this.queryIdToToken = new Map()),
        (this.outstandingQueriesOlderThanRestart = new Set()),
        (this.outstandingAuthOlderThanRestart = !1),
        (this.paused = !1),
        (this.pendingQuerySetModifications = new Map()));
    }
    hasSyncedPastLastReconnect() {
      return (
        this.outstandingQueriesOlderThanRestart.size === 0 &&
        !this.outstandingAuthOlderThanRestart
      );
    }
    markAuthCompletion() {
      this.outstandingAuthOlderThanRestart = !1;
    }
    subscribe(e, t, n, r) {
      let i = N(e),
        a = P(i, t),
        o = this.querySet.get(a);
      if (o !== void 0)
        return (
          (o.numSubscribers += 1),
          {
            queryToken: a,
            modification: null,
            unsubscribe: () => this.removeSubscriber(a),
          }
        );
      {
        let e = this.nextQueryId++,
          o = {
            id: e,
            canonicalizedUdfPath: i,
            args: t,
            numSubscribers: 1,
            journal: n,
            componentPath: r,
          };
        (this.querySet.set(a, o), this.queryIdToToken.set(e, a));
        let s = this.querySetVersion,
          c = this.querySetVersion + 1,
          l = {
            type: `Add`,
            queryId: e,
            udfPath: i,
            args: [D(t)],
            journal: n,
            componentPath: r,
          };
        return (
          this.paused
            ? this.pendingQuerySetModifications.set(e, l)
            : (this.querySetVersion = c),
          {
            queryToken: a,
            modification: {
              type: `ModifyQuerySet`,
              baseVersion: s,
              newVersion: c,
              modifications: [l],
            },
            unsubscribe: () => this.removeSubscriber(a),
          }
        );
      }
    }
    transition(e) {
      for (let t of e.modifications)
        switch (t.type) {
          case `QueryUpdated`:
          case `QueryFailed`: {
            this.outstandingQueriesOlderThanRestart.delete(t.queryId);
            let e = t.journal;
            if (e !== void 0) {
              let n = this.queryIdToToken.get(t.queryId);
              n !== void 0 && (this.querySet.get(n).journal = e);
            }
            break;
          }
          case `QueryRemoved`:
            this.outstandingQueriesOlderThanRestart.delete(t.queryId);
            break;
          default:
            throw Error(`Invalid modification ${t.type}`);
        }
    }
    queryId(e, t) {
      let n = P(N(e), t),
        r = this.querySet.get(n);
      return r === void 0 ? null : r.id;
    }
    isCurrentOrNewerAuthVersion(e) {
      return e >= this.identityVersion;
    }
    getAuth() {
      return this.auth;
    }
    setAuth(e) {
      this.auth = { tokenType: `User`, value: e };
      let t = this.identityVersion;
      return (
        this.paused || (this.identityVersion = t + 1),
        { type: `Authenticate`, baseVersion: t, ...this.auth }
      );
    }
    setAdminAuth(e, t) {
      let n = { tokenType: `Admin`, value: e, impersonating: t };
      this.auth = n;
      let r = this.identityVersion;
      return (
        this.paused || (this.identityVersion = r + 1),
        { type: `Authenticate`, baseVersion: r, ...n }
      );
    }
    clearAuth() {
      ((this.auth = void 0), this.markAuthCompletion());
      let e = this.identityVersion;
      return (
        this.paused || (this.identityVersion = e + 1),
        { type: `Authenticate`, tokenType: `None`, baseVersion: e }
      );
    }
    hasAuth() {
      return !!this.auth;
    }
    isNewAuth(e) {
      return this.auth?.value !== e;
    }
    queryPath(e) {
      let t = this.queryIdToToken.get(e);
      return t ? this.querySet.get(t).canonicalizedUdfPath : null;
    }
    queryArgs(e) {
      let t = this.queryIdToToken.get(e);
      return t ? this.querySet.get(t).args : null;
    }
    queryToken(e) {
      return this.queryIdToToken.get(e) ?? null;
    }
    queryJournal(e) {
      return this.querySet.get(e)?.journal;
    }
    restart() {
      (this.unpause(), this.outstandingQueriesOlderThanRestart.clear());
      let e = [];
      for (let t of this.querySet.values()) {
        let n = {
          type: `Add`,
          queryId: t.id,
          udfPath: t.canonicalizedUdfPath,
          args: [D(t.args)],
          journal: t.journal,
          componentPath: t.componentPath,
        };
        (e.push(n), this.outstandingQueriesOlderThanRestart.add(t.id));
      }
      this.querySetVersion = 1;
      let t = {
        type: `ModifyQuerySet`,
        baseVersion: 0,
        newVersion: 1,
        modifications: e,
      };
      if (!this.auth) return ((this.identityVersion = 0), [t, void 0]);
      this.outstandingAuthOlderThanRestart = !0;
      let n = { type: `Authenticate`, baseVersion: 0, ...this.auth };
      return ((this.identityVersion = 1), [t, n]);
    }
    pause() {
      this.paused = !0;
    }
    resume() {
      let e =
          this.pendingQuerySetModifications.size > 0
            ? {
                type: `ModifyQuerySet`,
                baseVersion: this.querySetVersion,
                newVersion: ++this.querySetVersion,
                modifications: Array.from(
                  this.pendingQuerySetModifications.values(),
                ),
              }
            : void 0,
        t =
          this.auth === void 0
            ? void 0
            : {
                type: `Authenticate`,
                baseVersion: this.identityVersion++,
                ...this.auth,
              };
      return (this.unpause(), [e, t]);
    }
    unpause() {
      ((this.paused = !1), this.pendingQuerySetModifications.clear());
    }
    removeSubscriber(e) {
      let t = this.querySet.get(e);
      if (t.numSubscribers > 1) return (--t.numSubscribers, null);
      {
        (this.querySet.delete(e),
          this.queryIdToToken.delete(t.id),
          this.outstandingQueriesOlderThanRestart.delete(t.id));
        let n = this.querySetVersion,
          r = this.querySetVersion + 1,
          i = { type: `Remove`, queryId: t.id };
        return (
          this.paused
            ? this.pendingQuerySetModifications.has(t.id)
              ? this.pendingQuerySetModifications.delete(t.id)
              : this.pendingQuerySetModifications.set(t.id, i)
            : (this.querySetVersion = r),
          {
            type: `ModifyQuerySet`,
            baseVersion: n,
            newVersion: r,
            modifications: [i],
          }
        );
      }
    }
  },
  Fe = Object.defineProperty,
  Ie = (e, t, n) =>
    t in e
      ? Fe(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  I = (e, t, n) => Ie(e, typeof t == `symbol` ? t : t + ``, n),
  Le = class {
    constructor(e, t) {
      ((this.logger = e),
        (this.markConnectionStateDirty = t),
        I(this, `inflightRequests`),
        I(this, `requestsOlderThanRestart`),
        I(this, `inflightMutationsCount`, 0),
        I(this, `inflightActionsCount`, 0),
        (this.inflightRequests = new Map()),
        (this.requestsOlderThanRestart = new Set()));
    }
    request(e, t) {
      let n = new Promise((n) => {
        let r = t ? `Requested` : `NotSent`;
        (this.inflightRequests.set(e.requestId, {
          message: e,
          status: { status: r, requestedAt: new Date(), onResult: n },
        }),
          e.type === `Mutation`
            ? this.inflightMutationsCount++
            : e.type === `Action` && this.inflightActionsCount++);
      });
      return (this.markConnectionStateDirty(), n);
    }
    onResponse(e) {
      let t = this.inflightRequests.get(e.requestId);
      if (t === void 0 || t.status.status === `Completed`) return null;
      let n = t.message.type === `Mutation` ? `mutation` : `action`,
        r = t.message.udfPath;
      for (let t of e.logLines) A(this.logger, `info`, n, r, t);
      let i = t.status,
        a,
        o;
      if (e.success)
        ((a = { success: !0, logLines: e.logLines, value: w(e.result) }),
          (o = () => i.onResult(a)));
      else {
        let t = e.result,
          { errorData: s } = e;
        (A(this.logger, `error`, n, r, t),
          (a = {
            success: !1,
            errorMessage: t,
            errorData: s === void 0 ? void 0 : w(s),
            logLines: e.logLines,
          }),
          (o = () => i.onResult(a)));
      }
      return e.type === `ActionResponse` || !e.success
        ? (o(),
          this.inflightRequests.delete(e.requestId),
          this.requestsOlderThanRestart.delete(e.requestId),
          t.message.type === `Action`
            ? this.inflightActionsCount--
            : t.message.type === `Mutation` && this.inflightMutationsCount--,
          this.markConnectionStateDirty(),
          { requestId: e.requestId, result: a })
        : ((t.status = {
            status: `Completed`,
            result: a,
            ts: e.ts,
            onResolve: o,
          }),
          null);
    }
    removeCompleted(e) {
      let t = new Map();
      for (let [n, r] of this.inflightRequests.entries()) {
        let i = r.status;
        i.status === `Completed` &&
          i.ts.lessThanOrEqual(e) &&
          (i.onResolve(),
          t.set(n, i.result),
          r.message.type === `Mutation`
            ? this.inflightMutationsCount--
            : r.message.type === `Action` && this.inflightActionsCount--,
          this.inflightRequests.delete(n),
          this.requestsOlderThanRestart.delete(n));
      }
      return (t.size > 0 && this.markConnectionStateDirty(), t);
    }
    restart() {
      this.requestsOlderThanRestart = new Set(this.inflightRequests.keys());
      let e = [];
      for (let [t, n] of this.inflightRequests)
        if (n.status.status === `NotSent`)
          ((n.status.status = `Requested`), e.push(n.message));
        else if (n.message.type === `Mutation`) e.push(n.message);
        else if (n.message.type === `Action`) {
          if (
            (this.inflightRequests.delete(t),
            this.requestsOlderThanRestart.delete(t),
            this.inflightActionsCount--,
            n.status.status === `Completed`)
          )
            throw Error(`Action should never be in 'Completed' state`);
          n.status.onResult({
            success: !1,
            errorMessage: `Connection lost while action was in flight`,
            logLines: [],
          });
        }
      return (this.markConnectionStateDirty(), e);
    }
    resume() {
      let e = [];
      for (let [, t] of this.inflightRequests)
        if (t.status.status === `NotSent`) {
          ((t.status.status = `Requested`), e.push(t.message));
          continue;
        }
      return e;
    }
    hasIncompleteRequests() {
      for (let e of this.inflightRequests.values())
        if (e.status.status === `Requested`) return !0;
      return !1;
    }
    hasInflightRequests() {
      return this.inflightRequests.size > 0;
    }
    hasSyncedPastLastReconnect() {
      return this.requestsOlderThanRestart.size === 0;
    }
    timeOfOldestInflightRequest() {
      if (this.inflightRequests.size === 0) return null;
      let e = Date.now();
      for (let t of this.inflightRequests.values())
        t.status.status !== `Completed` &&
          t.status.requestedAt.getTime() < e &&
          (e = t.status.requestedAt.getTime());
      return new Date(e);
    }
    inflightMutations() {
      return this.inflightMutationsCount;
    }
    inflightActions() {
      return this.inflightActionsCount;
    }
  },
  L = Symbol.for(`functionName`),
  Re = Symbol.for(`toReferencePath`);
function ze(e) {
  return e[Re] ?? null;
}
function Be(e) {
  return e.startsWith(`function://`);
}
function Ve(e) {
  let t;
  if (typeof e == `string`) t = Be(e) ? { functionHandle: e } : { name: e };
  else if (e[L]) t = { name: e[L] };
  else {
    let n = ze(e);
    if (!n) throw Error(`${e} is not a functionReference`);
    t = { reference: n };
  }
  return t;
}
function R(e) {
  let t = Ve(e);
  if (t.name === void 0)
    throw t.functionHandle === void 0
      ? t.reference === void 0
        ? Error(
            `Expected function reference like "api.file.func" or "internal.file.func", but received ${JSON.stringify(t)}`,
          )
        : Error(
            `Expected function reference in the current component like "api.file.func" or "internal.file.func", but received reference ${t.reference}`,
          )
      : Error(
          `Expected function reference like "api.file.func" or "internal.file.func", but received function handle ${t.functionHandle}`,
        );
  if (typeof e == `string`) return e;
  let n = e[L];
  if (!n) throw Error(`${e} is not a functionReference`);
  return n;
}
function He(e = []) {
  return new Proxy(
    {},
    {
      get(t, n) {
        if (typeof n == `string`) return He([...e, n]);
        if (n === L) {
          if (e.length < 2) {
            let t = [`api`, ...e].join(`.`);
            throw Error(
              `API path is expected to be of the form \`api.moduleName.functionName\`. Found: \`${t}\``,
            );
          }
          let t = e.slice(0, -1).join(`/`),
            n = e[e.length - 1];
          return n === "default" ? t : t + `:` + n;
        }
        if (n === Symbol.toStringTag) return `FunctionReference`;
      },
    },
  );
}
var Ue = He(),
  We = Object.defineProperty,
  Ge = (e, t, n) =>
    t in e
      ? We(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  z = (e, t, n) => Ge(e, typeof t == `symbol` ? t : t + ``, n),
  Ke = class e {
    constructor(e) {
      (z(this, `queryResults`),
        z(this, `modifiedQueries`),
        (this.queryResults = e),
        (this.modifiedQueries = []));
    }
    getQuery(t, ...n) {
      let r = g(n[0]),
        i = R(t),
        a = this.queryResults.get(P(i, r));
      if (a !== void 0) return e.queryValue(a.result);
    }
    getAllQueries(t) {
      let n = [],
        r = R(t);
      for (let t of this.queryResults.values())
        t.udfPath === N(r) &&
          n.push({ args: t.args, value: e.queryValue(t.result) });
      return n;
    }
    setQuery(e, t, n) {
      let r = g(t),
        i = R(e),
        a = P(i, r),
        o;
      o = n === void 0 ? void 0 : { success: !0, value: n, logLines: [] };
      let s = { udfPath: i, args: r, result: o };
      (this.queryResults.set(a, s), this.modifiedQueries.push(a));
    }
    static queryValue(e) {
      if (e !== void 0 && e.success) return e.value;
    }
  },
  qe = class {
    constructor() {
      (z(this, `queryResults`),
        z(this, `optimisticUpdates`),
        (this.queryResults = new Map()),
        (this.optimisticUpdates = []));
    }
    ingestQueryResultsFromServer(e, t) {
      this.optimisticUpdates = this.optimisticUpdates.filter(
        (e) => !t.has(e.mutationId),
      );
      let n = this.queryResults;
      this.queryResults = new Map(e);
      let r = new Ke(this.queryResults);
      for (let e of this.optimisticUpdates) e.update(r);
      let i = [];
      for (let [e, t] of this.queryResults) {
        let r = n.get(e);
        (r === void 0 || r.result !== t.result) && i.push(e);
      }
      return i;
    }
    applyOptimisticUpdate(e, t) {
      this.optimisticUpdates.push({ update: e, mutationId: t });
      let n = new Ke(this.queryResults);
      return (e(n), n.modifiedQueries);
    }
    rawQueryResult(e) {
      let t = this.queryResults.get(e);
      if (t !== void 0) return t.result;
    }
    queryResult(e) {
      let t = this.queryResults.get(e);
      if (t === void 0) return;
      let n = t.result;
      if (n !== void 0) {
        if (n.success) return n.value;
        throw n.errorData === void 0
          ? Error(j(`query`, t.udfPath, n))
          : M(n, new k(j(`query`, t.udfPath, n)));
      }
    }
    hasQueryResult(e) {
      return this.queryResults.get(e) !== void 0;
    }
    queryLogs(e) {
      return this.queryResults.get(e)?.result?.logLines;
    }
  },
  Je = Object.defineProperty,
  Ye = (e, t, n) =>
    t in e
      ? Je(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  B = (e, t, n) => Ye(e, typeof t == `symbol` ? t : t + ``, n),
  V = class e {
    constructor(e, t) {
      (B(this, `low`),
        B(this, `high`),
        B(this, `__isUnsignedLong__`),
        (this.low = e | 0),
        (this.high = t | 0),
        (this.__isUnsignedLong__ = !0));
    }
    static isLong(e) {
      return (e && e.__isUnsignedLong__) === !0;
    }
    static fromBytesLE(t) {
      return new e(
        t[0] | (t[1] << 8) | (t[2] << 16) | (t[3] << 24),
        t[4] | (t[5] << 8) | (t[6] << 16) | (t[7] << 24),
      );
    }
    toBytesLE() {
      let e = this.high,
        t = this.low;
      return [
        t & 255,
        (t >>> 8) & 255,
        (t >>> 16) & 255,
        t >>> 24,
        e & 255,
        (e >>> 8) & 255,
        (e >>> 16) & 255,
        e >>> 24,
      ];
    }
    static fromNumber(t) {
      return isNaN(t) || t < 0
        ? Xe
        : t >= Qe
          ? $e
          : new e((t % H) | 0, (t / H) | 0);
    }
    toString() {
      return (BigInt(this.high) * BigInt(H) + BigInt(this.low)).toString();
    }
    equals(t) {
      return (
        e.isLong(t) || (t = e.fromValue(t)),
        this.high >>> 31 == 1 && t.high >>> 31 == 1
          ? !1
          : this.high === t.high && this.low === t.low
      );
    }
    notEquals(e) {
      return !this.equals(e);
    }
    comp(t) {
      return (
        e.isLong(t) || (t = e.fromValue(t)),
        this.equals(t)
          ? 0
          : t.high >>> 0 > this.high >>> 0 ||
              (t.high === this.high && t.low >>> 0 > this.low >>> 0)
            ? -1
            : 1
      );
    }
    lessThanOrEqual(e) {
      return this.comp(e) <= 0;
    }
    static fromValue(t) {
      return typeof t == `number` ? e.fromNumber(t) : new e(t.low, t.high);
    }
  },
  Xe = new V(0, 0),
  Ze = 65536,
  H = Ze * Ze,
  Qe = H * H,
  $e = new V(-1, -1),
  et = Object.defineProperty,
  tt = (e, t, n) =>
    t in e
      ? et(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  U = (e, t, n) => tt(e, typeof t == `symbol` ? t : t + ``, n),
  nt = class {
    constructor(e, t) {
      (U(this, `version`),
        U(this, `remoteQuerySet`),
        U(this, `queryPath`),
        U(this, `logger`),
        (this.version = { querySet: 0, ts: V.fromNumber(0), identity: 0 }),
        (this.remoteQuerySet = new Map()),
        (this.queryPath = e),
        (this.logger = t));
    }
    transition(e) {
      let t = e.startVersion;
      if (
        this.version.querySet !== t.querySet ||
        this.version.ts.notEquals(t.ts) ||
        this.version.identity !== t.identity
      )
        throw Error(
          `Invalid start version: ${t.ts.toString()}:${t.querySet}:${t.identity}, transitioning from ${this.version.ts.toString()}:${this.version.querySet}:${this.version.identity}`,
        );
      for (let t of e.modifications)
        switch (t.type) {
          case `QueryUpdated`: {
            let e = this.queryPath(t.queryId);
            if (e)
              for (let n of t.logLines) A(this.logger, `info`, `query`, e, n);
            let n = w(t.value ?? null);
            this.remoteQuerySet.set(t.queryId, {
              success: !0,
              value: n,
              logLines: t.logLines,
            });
            break;
          }
          case `QueryFailed`: {
            let e = this.queryPath(t.queryId);
            if (e)
              for (let n of t.logLines) A(this.logger, `info`, `query`, e, n);
            let { errorData: n } = t;
            this.remoteQuerySet.set(t.queryId, {
              success: !1,
              errorMessage: t.errorMessage,
              errorData: n === void 0 ? void 0 : w(n),
              logLines: t.logLines,
            });
            break;
          }
          case `QueryRemoved`:
            this.remoteQuerySet.delete(t.queryId);
            break;
          default:
            throw Error(`Invalid modification ${t.type}`);
        }
      this.version = e.endVersion;
    }
    remoteQueryResults() {
      return this.remoteQuerySet;
    }
    timestamp() {
      return this.version.ts;
    }
  };
function W(e) {
  let t = f(e);
  return V.fromBytesLE(Array.from(t));
}
function rt(e) {
  return h(new Uint8Array(e.toBytesLE()));
}
function it(e) {
  switch (e.type) {
    case `FatalError`:
    case `AuthError`:
    case `ActionResponse`:
    case `TransitionChunk`:
    case `Ping`:
      return { ...e };
    case `MutationResponse`:
      return e.success ? { ...e, ts: W(e.ts) } : { ...e };
    case `Transition`:
      return {
        ...e,
        startVersion: { ...e.startVersion, ts: W(e.startVersion.ts) },
        endVersion: { ...e.endVersion, ts: W(e.endVersion.ts) },
      };
  }
}
function at(e) {
  switch (e.type) {
    case `Authenticate`:
    case `ModifyQuerySet`:
    case `Mutation`:
    case `Action`:
    case `Event`:
      return { ...e };
    case `Connect`:
      return e.maxObservedTimestamp === void 0
        ? { ...e, maxObservedTimestamp: void 0 }
        : { ...e, maxObservedTimestamp: rt(e.maxObservedTimestamp) };
  }
}
var ot = Object.defineProperty,
  st = (e, t, n) =>
    t in e
      ? ot(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  G = (e, t, n) => st(e, typeof t == `symbol` ? t : t + ``, n),
  ct = 1e3,
  lt = 1001,
  ut = 1005,
  dt = 4040,
  K;
function q() {
  return (
    K === void 0 && (K = Date.now()),
    typeof performance > `u` || !performance.now
      ? Date.now()
      : Math.round(K + performance.now())
  );
}
function ft() {
  return `t=${Math.round((q() - K) / 100) / 10}s`;
}
var pt = {
  InternalServerError: { timeout: 1e3 },
  SubscriptionsWorkerFullError: { timeout: 3e3 },
  TooManyConcurrentRequests: { timeout: 3e3 },
  CommitterFullError: { timeout: 3e3 },
  AwsTooManyRequestsException: { timeout: 3e3 },
  ExecuteFullError: { timeout: 3e3 },
  SystemTimeoutError: { timeout: 3e3 },
  ExpiredInQueue: { timeout: 3e3 },
  VectorIndexesUnavailable: { timeout: 1e3 },
  SearchIndexesUnavailable: { timeout: 1e3 },
  TableSummariesUnavailable: { timeout: 1e3 },
  VectorIndexTooLarge: { timeout: 3e3 },
  SearchIndexTooLarge: { timeout: 3e3 },
  TooManyWritesInTimePeriod: { timeout: 3e3 },
};
function mt(e) {
  if (e === void 0) return `Unknown`;
  for (let t of Object.keys(pt)) if (e.startsWith(t)) return t;
  return `Unknown`;
}
var ht = class {
  constructor(e, t, n, r, i, a) {
    ((this.markConnectionStateDirty = i),
      (this.debug = a),
      G(this, `socket`),
      G(this, `connectionCount`),
      G(this, `_hasEverConnected`, !1),
      G(this, `lastCloseReason`),
      G(this, `transitionChunkBuffer`, null),
      G(this, `defaultInitialBackoff`),
      G(this, `maxBackoff`),
      G(this, `retries`),
      G(this, `serverInactivityThreshold`),
      G(this, `reconnectDueToServerInactivityTimeout`),
      G(this, `scheduledReconnect`, null),
      G(this, `networkOnlineHandler`, null),
      G(this, `pendingNetworkRecoveryInfo`, null),
      G(this, `uri`),
      G(this, `onOpen`),
      G(this, `onResume`),
      G(this, `onMessage`),
      G(this, `webSocketConstructor`),
      G(this, `logger`),
      G(this, `onServerDisconnectError`),
      (this.webSocketConstructor = n),
      (this.socket = { state: `disconnected` }),
      (this.connectionCount = 0),
      (this.lastCloseReason = `InitialConnect`),
      (this.defaultInitialBackoff = 1e3),
      (this.maxBackoff = 16e3),
      (this.retries = 0),
      (this.serverInactivityThreshold = 6e4),
      (this.reconnectDueToServerInactivityTimeout = null),
      (this.uri = e),
      (this.onOpen = t.onOpen),
      (this.onResume = t.onResume),
      (this.onMessage = t.onMessage),
      (this.onServerDisconnectError = t.onServerDisconnectError),
      (this.logger = r),
      this.setupNetworkListener(),
      this.connect());
  }
  setSocketState(e) {
    ((this.socket = e),
      this._logVerbose(
        `socket state changed: ${this.socket.state}, paused: ${`paused` in this.socket ? this.socket.paused : void 0}`,
      ),
      this.markConnectionStateDirty());
  }
  setupNetworkListener() {
    typeof window < `u` &&
      typeof window.addEventListener == `function` &&
      this.networkOnlineHandler === null &&
      ((this.networkOnlineHandler = () => {
        (this._logVerbose(`network online event detected`),
          this.tryReconnectImmediately());
      }),
      window.addEventListener(`online`, this.networkOnlineHandler),
      this._logVerbose(`network online event listener registered`));
  }
  cleanupNetworkListener() {
    this.networkOnlineHandler &&
      typeof window < `u` &&
      typeof window.removeEventListener == `function` &&
      (window.removeEventListener(`online`, this.networkOnlineHandler),
      (this.networkOnlineHandler = null),
      this._logVerbose(`network online event listener removed`));
  }
  assembleTransition(e) {
    if (
      e.partNumber < 0 ||
      e.partNumber >= e.totalParts ||
      e.totalParts === 0 ||
      (this.transitionChunkBuffer &&
        (this.transitionChunkBuffer.totalParts !== e.totalParts ||
          this.transitionChunkBuffer.transitionId !== e.transitionId))
    )
      throw (
        (this.transitionChunkBuffer = null),
        Error(`Invalid TransitionChunk`)
      );
    if (
      (this.transitionChunkBuffer === null &&
        (this.transitionChunkBuffer = {
          chunks: [],
          totalParts: e.totalParts,
          transitionId: e.transitionId,
        }),
      e.partNumber !== this.transitionChunkBuffer.chunks.length)
    ) {
      let t = this.transitionChunkBuffer.chunks.length;
      throw (
        (this.transitionChunkBuffer = null),
        Error(
          `TransitionChunk received out of order: expected part ${t}, got ${e.partNumber}`,
        )
      );
    }
    if (
      (this.transitionChunkBuffer.chunks.push(e.chunk),
      this.transitionChunkBuffer.chunks.length === e.totalParts)
    ) {
      let e = this.transitionChunkBuffer.chunks.join(``);
      this.transitionChunkBuffer = null;
      let t = it(JSON.parse(e));
      if (t.type !== `Transition`)
        throw Error(
          `Expected Transition, got ${t.type} after assembling chunks`,
        );
      return t;
    }
    return null;
  }
  connect() {
    if (this.socket.state === `terminated`) return;
    if (this.socket.state !== `disconnected` && this.socket.state !== `stopped`)
      throw Error(
        `Didn't start connection from disconnected state: ` + this.socket.state,
      );
    let e = new this.webSocketConstructor(this.uri);
    (this._logVerbose(`constructed WebSocket`),
      this.setSocketState({ state: `connecting`, ws: e, paused: `no` }),
      this.resetServerInactivityTimeout(),
      (e.onopen = () => {
        if (
          (this.logger.logVerbose(`begin ws.onopen`),
          this.socket.state !== `connecting`)
        )
          throw Error(`onopen called with socket not in connecting state`);
        if (
          (this.setSocketState({
            state: `ready`,
            ws: e,
            paused: this.socket.paused === `yes` ? `uninitialized` : `no`,
          }),
          this.resetServerInactivityTimeout(),
          this.socket.paused === `no` &&
            ((this._hasEverConnected = !0),
            this.onOpen({
              connectionCount: this.connectionCount,
              lastCloseReason: this.lastCloseReason,
              clientTs: q(),
            })),
          this.lastCloseReason !== `InitialConnect` &&
            (this.lastCloseReason
              ? this.logger.log(
                  `WebSocket reconnected at`,
                  ft(),
                  `after disconnect due to`,
                  this.lastCloseReason,
                )
              : this.logger.log(`WebSocket reconnected at`, ft())),
          (this.connectionCount += 1),
          (this.lastCloseReason = null),
          this.pendingNetworkRecoveryInfo !== null)
        ) {
          let { timeSavedMs: e } = this.pendingNetworkRecoveryInfo;
          ((this.pendingNetworkRecoveryInfo = null),
            this.sendMessage({
              type: `Event`,
              eventType: `NetworkRecoveryReconnect`,
              event: { timeSavedMs: e },
            }),
            this.logger.log(
              `Network recovery reconnect saved ~${Math.round(e / 1e3)}s of waiting`,
            ));
        }
      }),
      (e.onerror = (e) => {
        this.transitionChunkBuffer = null;
        let t = e.message;
        t && this.logger.log(`WebSocket error message: ${t}`);
      }),
      (e.onmessage = (e) => {
        this.resetServerInactivityTimeout();
        let t = e.data.length,
          n = it(JSON.parse(e.data));
        if (
          (this._logVerbose(`received ws message with type ${n.type}`),
          n.type !== `Ping`)
        ) {
          if (n.type === `TransitionChunk`) {
            let e = this.assembleTransition(n);
            if (!e) return;
            ((n = e),
              this._logVerbose(`assembled full ws message of type ${n.type}`));
          }
          (this.transitionChunkBuffer !== null &&
            ((this.transitionChunkBuffer = null),
            this.logger.log(
              `Received unexpected ${n.type} while buffering TransitionChunks`,
            )),
            n.type === `Transition` &&
              this.reportLargeTransition({ messageLength: t, transition: n }),
            this.onMessage(n).hasSyncedPastLastReconnect &&
              ((this.retries = 0), this.markConnectionStateDirty()));
        }
      }),
      (e.onclose = (e) => {
        if (
          (this._logVerbose(`begin ws.onclose`),
          (this.transitionChunkBuffer = null),
          this.lastCloseReason === null &&
            (this.lastCloseReason = e.reason || `closed with code ${e.code}`),
          e.code !== ct && e.code !== lt && e.code !== ut && e.code !== dt)
        ) {
          let t = `WebSocket closed with code ${e.code}`;
          (e.reason && (t += `: ${e.reason}`),
            this.logger.log(t),
            this.onServerDisconnectError &&
              e.reason &&
              this.onServerDisconnectError(t));
        }
        let t = mt(e.reason);
        this.scheduleReconnect(t);
      }));
  }
  socketState() {
    return this.socket.state;
  }
  sendMessage(e) {
    let t = {
      type: e.type,
      ...(e.type === `Authenticate` && e.tokenType === `User`
        ? { value: `...${e.value.slice(-7)}` }
        : {}),
    };
    if (this.socket.state === `ready` && this.socket.paused === `no`) {
      let n = at(e),
        r = JSON.stringify(n),
        i = !1;
      try {
        (this.socket.ws.send(r), (i = !0));
      } catch (e) {
        (this.logger.log(
          `Failed to send message on WebSocket, reconnecting: ${e}`,
        ),
          this.closeAndReconnect(`FailedToSendMessage`));
      }
      return (
        this._logVerbose(
          `${i ? `sent` : `failed to send`} message with type ${e.type}: ${JSON.stringify(t)}`,
        ),
        !0
      );
    }
    return (
      this._logVerbose(
        `message not sent (socket state: ${this.socket.state}, paused: ${`paused` in this.socket ? this.socket.paused : void 0}): ${JSON.stringify(t)}`,
      ),
      !1
    );
  }
  resetServerInactivityTimeout() {
    this.socket.state !== `terminated` &&
      (this.reconnectDueToServerInactivityTimeout !== null &&
        (clearTimeout(this.reconnectDueToServerInactivityTimeout),
        (this.reconnectDueToServerInactivityTimeout = null)),
      (this.reconnectDueToServerInactivityTimeout = setTimeout(() => {
        this.closeAndReconnect(`InactiveServer`);
      }, this.serverInactivityThreshold)));
  }
  scheduleReconnect(e) {
    ((this.scheduledReconnect &&=
      (clearTimeout(this.scheduledReconnect.timeout), null)),
      (this.socket = { state: `disconnected` }));
    let t = this.nextBackoff(e);
    (this.markConnectionStateDirty(),
      this.logger.log(`Attempting reconnect in ${Math.round(t)}ms`));
    let n = q(),
      r = setTimeout(() => {
        this.scheduledReconnect?.timeout === r &&
          ((this.scheduledReconnect = null), this.connect());
      }, t);
    this.scheduledReconnect = { timeout: r, scheduledAt: n, backoffMs: t };
  }
  closeAndReconnect(e) {
    switch (
      (this._logVerbose(`begin closeAndReconnect with reason ${e}`),
      this.socket.state)
    ) {
      case `disconnected`:
      case `terminated`:
      case `stopped`:
        return;
      case `connecting`:
      case `ready`:
        ((this.lastCloseReason = e),
          this.close(),
          this.scheduleReconnect(`client`));
        return;
      default:
        this.socket;
    }
  }
  close() {
    switch (((this.transitionChunkBuffer = null), this.socket.state)) {
      case `disconnected`:
      case `terminated`:
      case `stopped`:
        return Promise.resolve();
      case `connecting`: {
        let e = this.socket.ws;
        return (
          (e.onmessage = (e) => {
            this._logVerbose(`Ignoring message received after close`);
          }),
          new Promise((t) => {
            ((e.onclose = () => {
              (this._logVerbose(`Closed after connecting`), t());
            }),
              (e.onopen = () => {
                (this._logVerbose(`Opened after connecting`), e.close());
              }));
          })
        );
      }
      case `ready`: {
        this._logVerbose(`ws.close called`);
        let e = this.socket.ws;
        e.onmessage = (e) => {
          this._logVerbose(`Ignoring message received after close`);
        };
        let t = new Promise((t) => {
          e.onclose = () => {
            t();
          };
        });
        return (e.close(), t);
      }
      default:
        return (this.socket, Promise.resolve());
    }
  }
  terminate() {
    switch (
      (this.reconnectDueToServerInactivityTimeout &&
        clearTimeout(this.reconnectDueToServerInactivityTimeout),
      (this.scheduledReconnect &&=
        (clearTimeout(this.scheduledReconnect.timeout), null)),
      this.cleanupNetworkListener(),
      this.socket.state)
    ) {
      case `terminated`:
      case `stopped`:
      case `disconnected`:
      case `connecting`:
      case `ready`: {
        let e = this.close();
        return (this.setSocketState({ state: `terminated` }), e);
      }
      default:
        throw (
          this.socket,
          Error(`Invalid websocket state: ${this.socket.state}`)
        );
    }
  }
  stop() {
    switch (this.socket.state) {
      case `terminated`:
        return Promise.resolve();
      case `connecting`:
      case `stopped`:
      case `disconnected`:
      case `ready`: {
        this.cleanupNetworkListener();
        let e = this.close();
        return ((this.socket = { state: `stopped` }), e);
      }
      default:
        return (this.socket, Promise.resolve());
    }
  }
  tryRestart() {
    switch (this.socket.state) {
      case `stopped`:
        break;
      case `terminated`:
      case `connecting`:
      case `ready`:
      case `disconnected`:
        this.logger.logVerbose(`Restart called without stopping first`);
        return;
      default:
        this.socket;
    }
    (this.setupNetworkListener(), this.connect());
  }
  pause() {
    switch (this.socket.state) {
      case `disconnected`:
      case `stopped`:
      case `terminated`:
        return;
      case `connecting`:
      case `ready`:
        this.socket = { ...this.socket, paused: `yes` };
        return;
      default:
        this.socket;
        return;
    }
  }
  tryReconnectImmediately() {
    if (
      (this._logVerbose(`tryReconnectImmediately called`),
      this.socket.state !== `disconnected`)
    ) {
      this._logVerbose(
        `tryReconnectImmediately called but socket state is ${this.socket.state}, no action taken`,
      );
      return;
    }
    let e = null;
    if (this.scheduledReconnect) {
      let t = q() - this.scheduledReconnect.scheduledAt;
      ((e = Math.max(0, this.scheduledReconnect.backoffMs - t)),
        this._logVerbose(
          `would have waited ${Math.round(e)}ms more (backoff was ${Math.round(this.scheduledReconnect.backoffMs)}ms, elapsed ${Math.round(t)}ms)`,
        ),
        clearTimeout(this.scheduledReconnect.timeout),
        (this.scheduledReconnect = null),
        this._logVerbose(`canceled scheduled reconnect`));
    }
    (this.logger.log(`Network recovery detected, reconnecting immediately`),
      (this.pendingNetworkRecoveryInfo =
        e === null ? null : { timeSavedMs: e }),
      this.connect());
  }
  resume() {
    switch (this.socket.state) {
      case `connecting`:
        this.socket = { ...this.socket, paused: `no` };
        return;
      case `ready`:
        this.socket.paused === `uninitialized`
          ? ((this.socket = { ...this.socket, paused: `no` }),
            (this._hasEverConnected = !0),
            this.onOpen({
              connectionCount: this.connectionCount,
              lastCloseReason: this.lastCloseReason,
              clientTs: q(),
            }))
          : this.socket.paused === `yes` &&
            ((this.socket = { ...this.socket, paused: `no` }), this.onResume());
        return;
      case `terminated`:
      case `stopped`:
      case `disconnected`:
        return;
      default:
        this.socket;
    }
    this.connect();
  }
  connectionState() {
    return {
      isConnected: this.socket.state === `ready`,
      hasEverConnected: this._hasEverConnected,
      connectionCount: this.connectionCount,
      connectionRetries: this.retries,
    };
  }
  _logVerbose(e) {
    this.logger.logVerbose(e);
  }
  nextBackoff(e) {
    let t =
      (e === `client`
        ? 100
        : e === `Unknown`
          ? this.defaultInitialBackoff
          : pt[e].timeout) *
      2 ** this.retries;
    this.retries += 1;
    let n = Math.min(t, this.maxBackoff);
    return n + n * (Math.random() - 0.5);
  }
  reportLargeTransition({ transition: e, messageLength: t }) {
    if (e.clientClockSkew === void 0 || e.serverTs === void 0) return;
    let n = q() - e.clientClockSkew - e.serverTs / 1e6,
      r = `${Math.round(n)}ms`,
      i = `${Math.round(t / 1e4) / 100}MB`,
      a = t / (n / 1e3),
      o = `${Math.round(a / 1e4) / 100}MB per second`;
    (this._logVerbose(`received ${i} transition in ${r} at ${o}`),
      t > 2e7
        ? this.logger.log(
            `received query results totaling more that 20MB (${i}) which will take a long time to download on slower connections`,
          )
        : n > 2e4 &&
          this.logger.log(
            `received query results totaling ${i} which took more than 20s to arrive (${r})`,
          ),
      this.debug &&
        this.sendMessage({
          type: `Event`,
          eventType: `ClientReceivedTransition`,
          event: { transitionTransitTime: n, messageLength: t },
        }));
  }
};
function gt() {
  return _t();
}
function _t() {
  return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (e) => {
    let t = (Math.random() * 16) | 0;
    return (e === `x` ? t : (t & 3) | 8).toString(16);
  });
}
var J = class extends Error {};
J.prototype.name = `InvalidTokenError`;
function vt(e) {
  return decodeURIComponent(
    atob(e).replace(/(.)/g, (e, t) => {
      let n = t.charCodeAt(0).toString(16).toUpperCase();
      return (n.length < 2 && (n = `0` + n), `%` + n);
    }),
  );
}
function yt(e) {
  let t = e.replace(/-/g, `+`).replace(/_/g, `/`);
  switch (t.length % 4) {
    case 0:
      break;
    case 2:
      t += `==`;
      break;
    case 3:
      t += `=`;
      break;
    default:
      throw Error(`base64 string is not of the correct length`);
  }
  try {
    return vt(t);
  } catch {
    return atob(t);
  }
}
function bt(e, t) {
  if (typeof e != `string`)
    throw new J(`Invalid token specified: must be a string`);
  t ||= {};
  let n = t.header === !0 ? 0 : 1,
    r = e.split(`.`)[n];
  if (typeof r != `string`)
    throw new J(`Invalid token specified: missing part #${n + 1}`);
  let i;
  try {
    i = yt(r);
  } catch (e) {
    throw new J(
      `Invalid token specified: invalid base64 for part #${n + 1} (${e.message})`,
    );
  }
  try {
    return JSON.parse(i);
  } catch (e) {
    throw new J(
      `Invalid token specified: invalid json for part #${n + 1} (${e.message})`,
    );
  }
}
var xt = Object.defineProperty,
  St = (e, t, n) =>
    t in e
      ? xt(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  Y = (e, t, n) => St(e, typeof t == `symbol` ? t : t + ``, n),
  Ct = 1728e6,
  wt = 2,
  Tt = class {
    constructor(e, t, n) {
      (Y(this, `authState`, { state: `noAuth` }),
        Y(this, `configVersion`, 0),
        Y(this, `syncState`),
        Y(this, `authenticate`),
        Y(this, `stopSocket`),
        Y(this, `tryRestartSocket`),
        Y(this, `pauseSocket`),
        Y(this, `resumeSocket`),
        Y(this, `clearAuth`),
        Y(this, `logger`),
        Y(this, `refreshTokenLeewaySeconds`),
        Y(this, `initialAuthTokenReuse`),
        Y(this, `lastRefreshChange`),
        Y(this, `tokenConfirmationAttempts`, 0),
        (this.syncState = e),
        (this.authenticate = t.authenticate),
        (this.stopSocket = t.stopSocket),
        (this.tryRestartSocket = t.tryRestartSocket),
        (this.pauseSocket = t.pauseSocket),
        (this.resumeSocket = t.resumeSocket),
        (this.clearAuth = t.clearAuth),
        (this.logger = n.logger),
        (this.refreshTokenLeewaySeconds = n.refreshTokenLeewaySeconds),
        (this.initialAuthTokenReuse = n.initialAuthTokenReuse),
        (this.lastRefreshChange = !1));
    }
    notifyRefreshChange(e) {
      this.authState.state !== `noAuth` &&
        this.authState.state !== `initialRefetch` &&
        this.authState.config.onRefreshChange &&
        this.lastRefreshChange !== e &&
        ((this.lastRefreshChange = e),
        this.authState.config.onRefreshChange(e));
    }
    async setConfig(e, t, n) {
      (this.resetAuthState(),
        this._logVerbose(`pausing WS for auth token fetch`),
        this.pauseSocket());
      let r = await this.fetchTokenAndGuardAgainstRace(e, {
        forceRefreshToken: !1,
      });
      if (r.isFromOutdatedConfig) return;
      let i = { fetchToken: e, onAuthChange: t, onRefreshChange: n };
      (r.value
        ? (this.setAuthState({
            state: `waitingForServerConfirmationOfCachedToken`,
            config: i,
            hasRetried: !1,
          }),
          this.authenticate(r.value))
        : (this.setAuthState({ state: `initialRefetch`, config: i }),
          await this.refetchToken()),
        this._logVerbose(`resuming WS after auth token fetch`),
        this.resumeSocket());
    }
    onTransition(e) {
      if (
        this.syncState.isCurrentOrNewerAuthVersion(e.endVersion.identity) &&
        !(e.endVersion.identity <= e.startVersion.identity)
      ) {
        if (
          (this._logVerbose(
            `auth state is ${this.authState.state} when handling transition`,
          ),
          this.syncState.markAuthCompletion(),
          this.authState.state === `waitingForServerConfirmationOfCachedToken`)
        ) {
          this._logVerbose(`server confirmed auth token is valid`);
          let t = this.syncState.getAuth()?.value;
          (this.initialAuthTokenReuse && t
            ? this.scheduleTokenRefetch(t, e.clientClockSkew)
            : this.refetchToken(),
            this.authState.config.onAuthChange(!0));
        } else
          this.authState.state === `waitingForServerConfirmationOfFreshToken` &&
            (this._logVerbose(`server confirmed new auth token is valid`),
            this.notifyRefreshChange(!1),
            this.scheduleTokenRefetch(this.authState.token),
            (this.tokenConfirmationAttempts = 0),
            this.authState.hadAuth || this.authState.config.onAuthChange(!0));
      }
    }
    onAuthError(e) {
      if (
        e.authUpdateAttempted === !1 &&
        (this.authState.state === `waitingForServerConfirmationOfFreshToken` ||
          this.authState.state === `waitingForServerConfirmationOfCachedToken`)
      ) {
        this._logVerbose(`ignoring non-auth token expired error`);
        return;
      }
      let { baseVersion: t } = e;
      this.syncState.isCurrentOrNewerAuthVersion(t + 1)
        ? this.tryToReauthenticate(e)
        : this._logVerbose(`ignoring auth error for previous auth attempt`);
    }
    async tryToReauthenticate(e) {
      if (
        (this._logVerbose(`attempting to reauthenticate: ${e.error}`),
        this.authState.state === `noAuth` ||
          (this.authState.state ===
            `waitingForServerConfirmationOfFreshToken` &&
            this.tokenConfirmationAttempts >= wt))
      ) {
        (this.logger.error(
          `Failed to authenticate: "${e.error}", check your server auth config`,
        ),
          this.syncState.hasAuth() && this.syncState.clearAuth(),
          this.authState.state !== `noAuth` &&
            this.setAndReportAuthFailed(this.authState.config.onAuthChange));
        return;
      }
      if (
        (this.authState.state === `waitingForServerConfirmationOfFreshToken` &&
          (this.tokenConfirmationAttempts++,
          this._logVerbose(
            `retrying reauthentication, ${wt - this.tokenConfirmationAttempts} attempts remaining`,
          )),
        this.notifyRefreshChange(!0),
        await this.stopSocket(),
        this.authState.state === `noAuth`)
      )
        return;
      let t = await this.fetchTokenAndGuardAgainstRace(
        this.authState.config.fetchToken,
        { forceRefreshToken: !0 },
      );
      t.isFromOutdatedConfig ||
        (t.value && this.syncState.isNewAuth(t.value)
          ? (this.authenticate(t.value),
            this.setAuthState({
              state: `waitingForServerConfirmationOfFreshToken`,
              config: this.authState.config,
              token: t.value,
              hadAuth:
                this.authState.state === `notRefetching` ||
                this.authState.state === `waitingForScheduledRefetch`,
            }))
          : (this._logVerbose(
              `reauthentication failed, could not fetch a new token`,
            ),
            this.syncState.hasAuth() && this.syncState.clearAuth(),
            this.setAndReportAuthFailed(this.authState.config.onAuthChange)),
        this.tryRestartSocket());
    }
    async refetchToken() {
      if (this.authState.state === `noAuth`) return;
      this._logVerbose(`refetching auth token`);
      let e = await this.fetchTokenAndGuardAgainstRace(
        this.authState.config.fetchToken,
        { forceRefreshToken: !0 },
      );
      e.isFromOutdatedConfig ||
        (e.value
          ? this.syncState.isNewAuth(e.value)
            ? (this.setAuthState({
                state: `waitingForServerConfirmationOfFreshToken`,
                hadAuth: this.syncState.hasAuth(),
                token: e.value,
                config: this.authState.config,
              }),
              this.authenticate(e.value))
            : this.setAuthState({
                state: `notRefetching`,
                config: this.authState.config,
              })
          : (this._logVerbose(`refetching token failed`),
            this.syncState.hasAuth() && this.clearAuth(),
            this.setAndReportAuthFailed(this.authState.config.onAuthChange)),
        this._logVerbose(
          `restarting WS after auth token fetch (if currently stopped)`,
        ),
        this.tryRestartSocket());
    }
    scheduleTokenRefetch(e, t) {
      if (this.authState.state === `noAuth`) return;
      let n = this.decodeToken(e);
      if (!n) {
        this.logger.error(
          `Auth token is not a valid JWT, cannot refetch the token`,
        );
        return;
      }
      let { iat: r, exp: i } = n;
      if (!r || !i) {
        this.logger.error(
          `Auth token does not have required fields, cannot refetch the token`,
        );
        return;
      }
      let a = i - r;
      if (a <= 2) {
        this.logger.error(
          `Auth token does not live long enough, cannot refetch the token`,
        );
        return;
      }
      let o;
      t === void 0
        ? (o = a)
        : ((o = i - (Date.now() - t) / 1e3), o <= 0 && (o = 0));
      let s = Math.min(Ct, (o - this.refreshTokenLeewaySeconds) * 1e3);
      s <= 0 &&
        (this.logger.warn(
          `Refetching auth token immediately, configured leeway ${this.refreshTokenLeewaySeconds}s is larger than the token's lifetime ${o}s`,
        ),
        (s = 0));
      let c = setTimeout(() => {
        (this._logVerbose(`running scheduled token refetch`),
          this.refetchToken());
      }, s);
      (this.setAuthState({
        state: `waitingForScheduledRefetch`,
        refetchTokenTimeoutId: c,
        config: this.authState.config,
      }),
        this._logVerbose(
          `scheduled preemptive auth token refetching in ${s}ms`,
        ));
    }
    async fetchTokenAndGuardAgainstRace(e, t) {
      let n = ++this.configVersion;
      this._logVerbose(`fetching token with config version ${n}`);
      let r = await e(t);
      return this.configVersion === n
        ? { isFromOutdatedConfig: !1, value: r }
        : (this._logVerbose(
            `stale config version, expected ${n}, got ${this.configVersion}`,
          ),
          { isFromOutdatedConfig: !0 });
    }
    stop() {
      (this.resetAuthState(),
        this.configVersion++,
        this._logVerbose(`config version bumped to ${this.configVersion}`));
    }
    setAndReportAuthFailed(e) {
      (e(!1), this.resetAuthState());
    }
    resetAuthState() {
      (this.notifyRefreshChange(!1), this.setAuthState({ state: `noAuth` }));
    }
    setAuthState(e) {
      let t =
        e.state === `waitingForServerConfirmationOfFreshToken`
          ? {
              hadAuth: e.hadAuth,
              state: e.state,
              token: `...${e.token.slice(-7)}`,
            }
          : { state: e.state };
      switch (
        (this._logVerbose(`setting auth state to ${JSON.stringify(t)}`),
        e.state)
      ) {
        case `waitingForScheduledRefetch`:
        case `notRefetching`:
        case `noAuth`:
          this.tokenConfirmationAttempts = 0;
      }
      (this.authState.state === `waitingForScheduledRefetch` &&
        clearTimeout(this.authState.refetchTokenTimeoutId),
        (this.authState = e));
    }
    decodeToken(e) {
      try {
        return bt(e);
      } catch (e) {
        return (
          this._logVerbose(
            `Error decoding token: ${e instanceof Error ? e.message : `Unknown error`}`,
          ),
          null
        );
      }
    }
    _logVerbose(e) {
      this.logger.logVerbose(`${e} [v${this.configVersion}]`);
    }
  },
  Et = [
    `convexClientConstructed`,
    `convexWebSocketOpen`,
    `convexFirstMessageReceived`,
  ];
function Dt(e, t) {
  let n = { sessionId: t };
  typeof performance < `u` &&
    performance.mark &&
    performance.mark(e, { detail: n });
}
function Ot(e) {
  let t = e.name.slice(6);
  return (
    (t = t.charAt(0).toLowerCase() + t.slice(1)),
    { name: t, startTime: e.startTime }
  );
}
function kt(e) {
  if (typeof performance > `u` || !performance.getEntriesByName) return [];
  let t = [];
  for (let n of Et) {
    let r = performance
      .getEntriesByName(n)
      .filter((e) => e.entryType === `mark`)
      .filter((t) => t.detail.sessionId === e);
    t.push(...r);
  }
  return t.map(Ot);
}
var At = Object.defineProperty,
  jt = (e, t, n) =>
    t in e
      ? At(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  X = (e, t, n) => jt(e, typeof t == `symbol` ? t : t + ``, n),
  Mt = class {
    constructor(e, t, n) {
      if (
        (X(this, `address`),
        X(this, `state`),
        X(this, `requestManager`),
        X(this, `webSocketManager`),
        X(this, `authenticationManager`),
        X(this, `remoteQuerySet`),
        X(this, `optimisticQueryResults`),
        X(this, `_transitionHandlerCounter`, 0),
        X(this, `_nextRequestId`),
        X(this, `_onTransitionFns`, new Map()),
        X(this, `_sessionId`),
        X(this, `firstMessageReceived`, !1),
        X(this, `debug`),
        X(this, `logger`),
        X(this, `maxObservedTimestamp`),
        X(this, `connectionStateSubscribers`, new Map()),
        X(this, `nextConnectionStateSubscriberId`, 0),
        X(this, `_lastPublishedConnectionState`),
        X(this, `markConnectionStateDirty`, () => {
          Promise.resolve().then(() => {
            let e = this.connectionState();
            if (
              JSON.stringify(e) !==
              JSON.stringify(this._lastPublishedConnectionState)
            ) {
              this._lastPublishedConnectionState = e;
              for (let t of this.connectionStateSubscribers.values()) t(e);
            }
          });
        }),
        X(this, `mark`, (e) => {
          this.debug && Dt(e, this.sessionId);
        }),
        typeof e == `object`)
      )
        throw Error(
          `Passing a ClientConfig object is no longer supported. Pass the URL of the Convex deployment as a string directly.`,
        );
      (n?.skipConvexDeploymentUrlCheck !== !0 && ee(e), (n = { ...n }));
      let r = n.authRefreshTokenLeewaySeconds ?? 10,
        i = n.webSocketConstructor;
      if (!i && typeof WebSocket > `u`)
        throw Error(
          `No WebSocket global variable defined! To use Convex in an environment without WebSocket try the HTTP client: https://docs.convex.dev/api/classes/browser.ConvexHttpClient`,
        );
      ((i ||= WebSocket),
        (this.debug = n.reportDebugInfoToConvex ?? !1),
        (this.address = e),
        (this.logger =
          n.logger === !1
            ? ke({ verbose: n.verbose ?? !1 })
            : n.logger !== !0 && n.logger
              ? n.logger
              : Oe({ verbose: n.verbose ?? !1 })));
      let a = e.search(`://`);
      if (a === -1) throw Error(`Provided address was not an absolute URL.`);
      let o = e.substring(a + 3),
        s = e.substring(0, a),
        c;
      if (s === `http`) c = `ws`;
      else if (s === `https`) c = `wss`;
      else throw Error(`Unknown parent protocol ${s}`);
      let l = `${c}://${o}/api/${xe}/sync`;
      ((this.state = new Pe()),
        (this.remoteQuerySet = new nt(
          (e) => this.state.queryPath(e),
          this.logger,
        )),
        (this.requestManager = new Le(
          this.logger,
          this.markConnectionStateDirty,
        )));
      let u = () => {
        (this.webSocketManager.pause(), this.state.pause());
      };
      ((this.authenticationManager = new Tt(
        this.state,
        {
          authenticate: (e) => {
            let t = this.state.setAuth(e);
            return (this.webSocketManager.sendMessage(t), t.baseVersion);
          },
          stopSocket: () => this.webSocketManager.stop(),
          tryRestartSocket: () => this.webSocketManager.tryRestart(),
          pauseSocket: u,
          resumeSocket: () => this.webSocketManager.resume(),
          clearAuth: () => {
            this.clearAuth();
          },
        },
        {
          logger: this.logger,
          refreshTokenLeewaySeconds: r,
          initialAuthTokenReuse: n.initialAuthTokenReuse ?? !1,
        },
      )),
        (this.optimisticQueryResults = new qe()),
        this.addOnTransitionHandler((e) => {
          t(e.queries.map((e) => e.token));
        }),
        (this._nextRequestId = 0),
        (this._sessionId = gt()));
      let { unsavedChangesWarning: d } = n;
      if (typeof window > `u` || window.addEventListener === void 0) {
        if (d === !0)
          throw Error(
            `unsavedChangesWarning requested, but window.addEventListener not found! Remove {unsavedChangesWarning: true} from Convex client options.`,
          );
      } else
        d !== !1 &&
          window.addEventListener(`beforeunload`, (e) => {
            if (this.requestManager.hasIncompleteRequests()) {
              e.preventDefault();
              let t = `Are you sure you want to leave? Your changes may not be saved.`;
              return (((e || window.event).returnValue = t), t);
            }
          });
      ((this.webSocketManager = new ht(
        l,
        {
          onOpen: (e) => {
            (this.mark(`convexWebSocketOpen`),
              this.webSocketManager.sendMessage({
                ...e,
                type: `Connect`,
                sessionId: this._sessionId,
                maxObservedTimestamp: this.maxObservedTimestamp,
              }),
              (this.remoteQuerySet = new nt(
                (e) => this.state.queryPath(e),
                this.logger,
              )));
            let [t, n] = this.state.restart();
            (n && this.webSocketManager.sendMessage(n),
              this.webSocketManager.sendMessage(t));
            for (let e of this.requestManager.restart())
              this.webSocketManager.sendMessage(e);
          },
          onResume: () => {
            let [e, t] = this.state.resume();
            (t && this.webSocketManager.sendMessage(t),
              e && this.webSocketManager.sendMessage(e));
            for (let e of this.requestManager.resume())
              this.webSocketManager.sendMessage(e);
          },
          onMessage: (e) => {
            switch (
              (this.firstMessageReceived ||
                ((this.firstMessageReceived = !0),
                this.mark(`convexFirstMessageReceived`),
                this.reportMarks()),
              e.type)
            ) {
              case `Transition`: {
                (this.observedTimestamp(e.endVersion.ts),
                  this.authenticationManager.onTransition(e),
                  this.remoteQuerySet.transition(e),
                  this.state.transition(e));
                let t = this.requestManager.removeCompleted(
                  this.remoteQuerySet.timestamp(),
                );
                this.notifyOnQueryResultChanges(t);
                break;
              }
              case `MutationResponse`: {
                e.success && this.observedTimestamp(e.ts);
                let t = this.requestManager.onResponse(e);
                t !== null &&
                  this.notifyOnQueryResultChanges(
                    new Map([[t.requestId, t.result]]),
                  );
                break;
              }
              case `ActionResponse`:
                this.requestManager.onResponse(e);
                break;
              case `AuthError`:
                this.authenticationManager.onAuthError(e);
                break;
              case `FatalError`: {
                let t = Ae(this.logger, e.error);
                throw (this.webSocketManager.terminate(), t);
              }
            }
            return {
              hasSyncedPastLastReconnect: this.hasSyncedPastLastReconnect(),
            };
          },
          onServerDisconnectError: n.onServerDisconnectError,
        },
        i,
        this.logger,
        this.markConnectionStateDirty,
        this.debug,
      )),
        this.mark(`convexClientConstructed`),
        n.expectAuth && u());
    }
    hasSyncedPastLastReconnect() {
      return (
        this.requestManager.hasSyncedPastLastReconnect() &&
        this.state.hasSyncedPastLastReconnect()
      );
    }
    observedTimestamp(e) {
      (this.maxObservedTimestamp === void 0 ||
        this.maxObservedTimestamp.lessThanOrEqual(e)) &&
        (this.maxObservedTimestamp = e);
    }
    getMaxObservedTimestamp() {
      return this.maxObservedTimestamp;
    }
    notifyOnQueryResultChanges(e) {
      let t = this.remoteQuerySet.remoteQueryResults(),
        n = new Map();
      for (let [e, r] of t) {
        let t = this.state.queryToken(e);
        if (t !== null) {
          let i = {
            result: r,
            udfPath: this.state.queryPath(e),
            args: this.state.queryArgs(e),
          };
          n.set(t, i);
        }
      }
      let r = this.optimisticQueryResults.ingestQueryResultsFromServer(
        n,
        new Set(e.keys()),
      );
      this.handleTransition({
        queries: r.map((e) => ({
          token: e,
          modification: {
            kind: `Updated`,
            result: this.optimisticQueryResults.rawQueryResult(e),
          },
        })),
        reflectedMutations: Array.from(e).map(([e, t]) => ({
          requestId: e,
          result: t,
        })),
        timestamp: this.remoteQuerySet.timestamp(),
      });
    }
    handleTransition(e) {
      for (let t of this._onTransitionFns.values()) t(e);
    }
    addOnTransitionHandler(e) {
      let t = this._transitionHandlerCounter++;
      return (
        this._onTransitionFns.set(t, e),
        () => this._onTransitionFns.delete(t)
      );
    }
    getCurrentAuthClaims() {
      let e = this.state.getAuth(),
        t = {};
      if (e && e.tokenType === `User`)
        try {
          t = e ? bt(e.value) : {};
        } catch {
          t = {};
        }
      else return;
      return { token: e.value, decoded: t };
    }
    setAuth(e, t, n) {
      this.authenticationManager.setConfig(e, t, n);
    }
    hasAuth() {
      return this.state.hasAuth();
    }
    setAdminAuth(e, t) {
      let n = this.state.setAdminAuth(e, t);
      this.webSocketManager.sendMessage(n);
    }
    clearAuth() {
      let e = this.state.clearAuth();
      this.webSocketManager.sendMessage(e);
    }
    subscribe(e, t, n) {
      let r = g(t),
        {
          modification: i,
          queryToken: a,
          unsubscribe: o,
        } = this.state.subscribe(e, r, n?.journal, n?.componentPath);
      return (
        i !== null && this.webSocketManager.sendMessage(i),
        {
          queryToken: a,
          unsubscribe: () => {
            let e = o();
            e && this.webSocketManager.sendMessage(e);
          },
        }
      );
    }
    localQueryResult(e, t) {
      let n = P(e, g(t));
      return this.optimisticQueryResults.queryResult(n);
    }
    localQueryResultByToken(e) {
      return this.optimisticQueryResults.queryResult(e);
    }
    hasLocalQueryResultByToken(e) {
      return this.optimisticQueryResults.hasQueryResult(e);
    }
    localQueryLogs(e, t) {
      let n = P(e, g(t));
      return this.optimisticQueryResults.queryLogs(n);
    }
    queryJournal(e, t) {
      let n = P(e, g(t));
      return this.state.queryJournal(n);
    }
    connectionState() {
      let e = this.webSocketManager.connectionState();
      return {
        hasInflightRequests: this.requestManager.hasInflightRequests(),
        isWebSocketConnected: e.isConnected,
        hasEverConnected: e.hasEverConnected,
        connectionCount: e.connectionCount,
        connectionRetries: e.connectionRetries,
        timeOfOldestInflightRequest:
          this.requestManager.timeOfOldestInflightRequest(),
        inflightMutations: this.requestManager.inflightMutations(),
        inflightActions: this.requestManager.inflightActions(),
      };
    }
    subscribeToConnectionState(e) {
      let t = this.nextConnectionStateSubscriberId++;
      return (
        this.connectionStateSubscribers.set(t, e),
        () => {
          this.connectionStateSubscribers.delete(t);
        }
      );
    }
    async mutation(e, t, n) {
      let r = await this.mutationInternal(e, t, n);
      if (!r.success)
        throw r.errorData === void 0
          ? Error(j(`mutation`, e, r))
          : M(r, new k(j(`mutation`, e, r)));
      return r.value;
    }
    async mutationInternal(e, t, n, r) {
      let { mutationPromise: i } = this.enqueueMutation(e, t, n, r);
      return i;
    }
    enqueueMutation(e, t, n, r) {
      let i = g(t);
      this.tryReportLongDisconnect();
      let a = this.nextRequestId;
      if ((this._nextRequestId++, n !== void 0)) {
        let e = n.optimisticUpdate;
        if (e !== void 0) {
          let t = this.optimisticQueryResults
            .applyOptimisticUpdate((t) => {
              e(t, i) instanceof Promise &&
                this.logger.warn(
                  `Optimistic update handler returned a Promise. Optimistic updates should be synchronous.`,
                );
            }, a)
            .map((e) => {
              let t = this.localQueryResultByToken(e);
              return {
                token: e,
                modification: {
                  kind: `Updated`,
                  result:
                    t === void 0
                      ? void 0
                      : { success: !0, value: t, logLines: [] },
                },
              };
            });
          this.handleTransition({
            queries: t,
            reflectedMutations: [],
            timestamp: this.remoteQuerySet.timestamp(),
          });
        }
      }
      let o = {
          type: `Mutation`,
          requestId: a,
          udfPath: e,
          componentPath: r,
          args: [D(i)],
        },
        s = this.webSocketManager.sendMessage(o);
      return {
        requestId: a,
        mutationPromise: this.requestManager.request(o, s),
      };
    }
    async action(e, t) {
      let n = await this.actionInternal(e, t);
      if (!n.success)
        throw n.errorData === void 0
          ? Error(j(`action`, e, n))
          : M(n, new k(j(`action`, e, n)));
      return n.value;
    }
    async actionInternal(e, t, n) {
      let r = g(t),
        i = this.nextRequestId;
      (this._nextRequestId++, this.tryReportLongDisconnect());
      let a = {
          type: `Action`,
          requestId: i,
          udfPath: e,
          componentPath: n,
          args: [D(r)],
        },
        o = this.webSocketManager.sendMessage(a);
      return this.requestManager.request(a, o);
    }
    async close() {
      return (
        this.authenticationManager.stop(),
        this.webSocketManager.terminate()
      );
    }
    get url() {
      return this.address;
    }
    get nextRequestId() {
      return this._nextRequestId;
    }
    get sessionId() {
      return this._sessionId;
    }
    reportMarks() {
      if (this.debug) {
        let e = kt(this.sessionId);
        this.webSocketManager.sendMessage({
          type: `Event`,
          eventType: `ClientConnect`,
          event: e,
        });
      }
    }
    tryReportLongDisconnect() {
      if (!this.debug) return;
      let e = this.connectionState().timeOfOldestInflightRequest;
      if (e === null || Date.now() - e.getTime() <= 6e4) return;
      let t = `${this.address}/api/debug_event`;
      fetch(t, {
        method: `POST`,
        headers: {
          "Content-Type": `application/json`,
          "Convex-Client": `npm-${xe}`,
        },
        body: JSON.stringify({ event: `LongWebsocketDisconnect` }),
      })
        .then((e) => {
          e.ok ||
            this.logger.warn(`Analytics request failed with response:`, e.body);
        })
        .catch((e) => {
          this.logger.warn(`Analytics response failed with error:`, e);
        });
    }
  };
function Nt(e) {
  if (
    typeof e != `object` ||
    !e ||
    !Array.isArray(e.page) ||
    typeof e.isDone != `boolean` ||
    typeof e.continueCursor != `string`
  )
    throw Error(`Not a valid paginated query result: ${e?.toString()}`);
  return e;
}
var Pt = Object.defineProperty,
  Ft = (e, t, n) =>
    t in e
      ? Pt(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  It = (e, t, n) => Ft(e, typeof t == `symbol` ? t : t + ``, n),
  Lt = class {
    constructor(e, t) {
      ((this.client = e),
        (this.onTransition = t),
        It(this, `paginatedQuerySet`, new Map()),
        It(this, `lastTransitionTs`),
        (this.lastTransitionTs = V.fromNumber(0)),
        this.client.addOnTransitionHandler((e) => this.onBaseTransition(e)));
    }
    subscribe(e, t, n) {
      let r = N(e),
        i = je(r, t, n),
        a = () => this.removePaginatedQuerySubscriber(i),
        o = this.paginatedQuerySet.get(i);
      return o
        ? ((o.numSubscribers += 1), { paginatedQueryToken: i, unsubscribe: a })
        : (this.paginatedQuerySet.set(i, {
            token: i,
            canonicalizedUdfPath: r,
            args: t,
            numSubscribers: 1,
            options: { initialNumItems: n.initialNumItems },
            nextPageKey: 0,
            pageKeys: [],
            pageKeyToQuery: new Map(),
            ongoingSplits: new Map(),
            skip: !1,
            id: n.id,
          }),
          this.addPageToPaginatedQuery(i, null, n.initialNumItems),
          { paginatedQueryToken: i, unsubscribe: a });
    }
    localQueryResult(e, t, n) {
      let r = je(N(e), t, n);
      return this.localQueryResultByToken(r);
    }
    localQueryResultByToken(e) {
      let t = this.paginatedQuerySet.get(e);
      if (!t) return;
      let n = this.activePageQueryTokens(t);
      if (n.length === 0)
        return {
          results: [],
          status: `LoadingFirstPage`,
          loadMore: (t) => this.loadMoreOfPaginatedQuery(e, t),
        };
      let r = [],
        i = !1,
        a = !1;
      for (let e of n) {
        let t = this.client.localQueryResultByToken(e);
        if (t === void 0) {
          ((i = !0), (a = !1));
          continue;
        }
        let n = Nt(t);
        ((r = r.concat(n.page)), (a = !!n.isDone));
      }
      let o;
      return (
        (o = i
          ? r.length === 0
            ? `LoadingFirstPage`
            : `LoadingMore`
          : a
            ? `Exhausted`
            : `CanLoadMore`),
        {
          results: r,
          status: o,
          loadMore: (t) => this.loadMoreOfPaginatedQuery(e, t),
        }
      );
    }
    onBaseTransition(e) {
      let t = e.queries.map((e) => e.token),
        n = this.queriesContainingTokens(t),
        r = [];
      n.length > 0 &&
        (this.processPaginatedQuerySplits(n, (e) =>
          this.client.localQueryResultByToken(e),
        ),
        (r = n.map((e) => ({
          token: e,
          modification: {
            kind: `Updated`,
            result: this.localQueryResultByToken(e),
          },
        }))));
      let i = { ...e, paginatedQueries: r };
      this.onTransition(i);
    }
    loadMoreOfPaginatedQuery(e, t) {
      this.mustGetPaginatedQuery(e);
      let n = this.queryTokenForLastPageOfPaginatedQuery(e),
        r = this.client.localQueryResultByToken(n);
      if (!r) return !1;
      let i = Nt(r);
      if (i.isDone) return !1;
      this.addPageToPaginatedQuery(e, i.continueCursor, t);
      let a = {
        timestamp: this.lastTransitionTs,
        reflectedMutations: [],
        queries: [],
        paginatedQueries: [
          {
            token: e,
            modification: {
              kind: `Updated`,
              result: this.localQueryResultByToken(e),
            },
          },
        ],
      };
      return (this.onTransition(a), !0);
    }
    queriesContainingTokens(e) {
      if (e.length === 0) return [];
      let t = [],
        n = new Set(e);
      for (let [e, r] of this.paginatedQuerySet)
        for (let i of this.allQueryTokens(r))
          if (n.has(i)) {
            t.push(e);
            break;
          }
      return t;
    }
    processPaginatedQuerySplits(e, t) {
      for (let n of e) {
        let e = this.mustGetPaginatedQuery(n),
          { ongoingSplits: r, pageKeyToQuery: i, pageKeys: a } = e;
        for (let [n, [a, o]] of r)
          t(i.get(a).queryToken) !== void 0 &&
            t(i.get(o).queryToken) !== void 0 &&
            this.completePaginatedQuerySplit(e, n, a, o);
        for (let n of a) {
          if (r.has(n)) continue;
          let a = i.get(n);
          if (!a) throw Error(`No page query for active pageKey ${n}`);
          let o = t(a.queryToken);
          if (!o) continue;
          let s = Nt(o);
          s.splitCursor &&
            (s.pageStatus === `SplitRecommended` ||
              s.pageStatus === `SplitRequired` ||
              s.page.length > e.options.initialNumItems * 2) &&
            this.splitPaginatedQueryPage(
              e,
              n,
              a.cursor,
              s.splitCursor,
              s.continueCursor,
            );
        }
      }
    }
    splitPaginatedQueryPage(e, t, n, r, i) {
      let a = e.nextPageKey++,
        o = e.nextPageKey++,
        s = { numItems: e.options.initialNumItems, id: e.id },
        c = this.client.subscribe(e.canonicalizedUdfPath, {
          ...e.args,
          paginationOpts: { ...s, cursor: n, endCursor: r },
        });
      e.pageKeyToQuery.set(a, { ...c, cursor: n });
      let l = this.client.subscribe(e.canonicalizedUdfPath, {
        ...e.args,
        paginationOpts: { ...s, cursor: r, endCursor: i },
      });
      (e.pageKeyToQuery.set(o, { ...l, cursor: r }),
        e.ongoingSplits.set(t, [a, o]));
    }
    addPageToPaginatedQuery(e, t, n) {
      let r = this.mustGetPaginatedQuery(e),
        i = r.nextPageKey++,
        a = { cursor: t, numItems: n, id: r.id },
        o = { ...r.args, paginationOpts: a },
        s = this.client.subscribe(r.canonicalizedUdfPath, o);
      return (
        r.pageKeys.push(i),
        r.pageKeyToQuery.set(i, { ...s, cursor: t }),
        s
      );
    }
    removePaginatedQuerySubscriber(e) {
      let t = this.paginatedQuerySet.get(e);
      if (t && (--t.numSubscribers, !(t.numSubscribers > 0))) {
        for (let e of t.pageKeyToQuery.values()) e.unsubscribe();
        this.paginatedQuerySet.delete(e);
      }
    }
    completePaginatedQuerySplit(e, t, n, r) {
      let i = e.pageKeyToQuery.get(t);
      e.pageKeyToQuery.delete(t);
      let a = e.pageKeys.indexOf(t);
      (e.pageKeys.splice(a, 1, n, r),
        e.ongoingSplits.delete(t),
        i.unsubscribe());
    }
    activePageQueryTokens(e) {
      return e.pageKeys.map((t) => e.pageKeyToQuery.get(t).queryToken);
    }
    allQueryTokens(e) {
      return Array.from(e.pageKeyToQuery.values()).map((e) => e.queryToken);
    }
    queryTokenForLastPageOfPaginatedQuery(e) {
      let t = this.mustGetPaginatedQuery(e),
        n = t.pageKeys[t.pageKeys.length - 1];
      if (n === void 0) throw Error(`No pages for paginated query ${e}`);
      return t.pageKeyToQuery.get(n).queryToken;
    }
    mustGetPaginatedQuery(e) {
      let t = this.paginatedQuerySet.get(e);
      if (!t) throw Error(`paginated query no longer exists for token ` + e);
      return t;
    }
  },
  Rt = e(n(), 1),
  zt = Object.defineProperty,
  Bt = (e, t, n) =>
    t in e
      ? zt(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  Z = (e, t, n) => Bt(e, typeof t == `symbol` ? t : t + ``, n),
  Vt = 5e3;
if (Rt.default === void 0) throw Error(`Required dependency 'react' not found`);
var Ht = class {
  constructor(e, t) {
    if (
      (Z(this, `address`),
      Z(this, `cachedSync`),
      Z(this, `cachedPaginatedQueryClient`),
      Z(this, `listeners`),
      Z(this, `options`),
      Z(this, `closed`, !1),
      Z(this, `_logger`),
      Z(this, `adminAuth`),
      Z(this, `fakeUserIdentity`),
      e === void 0)
    )
      throw Error(`No address provided to ConvexReactClient.
If trying to deploy to production, make sure to follow all the instructions found at https://docs.convex.dev/production/hosting/
If running locally, make sure to run \`convex dev\` and ensure the .env.local file is populated.`);
    if (typeof e != `string`)
      throw Error(
        `ConvexReactClient requires a URL like 'https://happy-otter-123.convex.cloud', received something of type ${typeof e} instead.`,
      );
    if (!e.includes(`://`))
      throw Error(`Provided address was not an absolute URL.`);
    ((this.address = e),
      (this.listeners = new Map()),
      (this._logger =
        t?.logger === !1
          ? ke({ verbose: t?.verbose ?? !1 })
          : t?.logger !== !0 && t?.logger
            ? t.logger
            : Oe({ verbose: t?.verbose ?? !1 })),
      (this.options = { ...t, logger: this._logger }));
  }
  get url() {
    return this.address;
  }
  get sync() {
    if (this.closed) throw Error(`ConvexReactClient has already been closed.`);
    return (
      this.cachedSync ||
        ((this.cachedSync =
          this.options.baseClient ??
          new Mt(this.address, () => {}, this.options)),
        this.adminAuth &&
          this.cachedSync.setAdminAuth(this.adminAuth, this.fakeUserIdentity),
        (this.cachedPaginatedQueryClient = new Lt(this.cachedSync, (e) =>
          this.handleTransition(e),
        ))),
      this.cachedSync
    );
  }
  get paginatedQueryClient() {
    if ((this.sync, this.cachedPaginatedQueryClient))
      return this.cachedPaginatedQueryClient;
    throw Error(`Should already be instantiated`);
  }
  setAuth(e, t, n) {
    if (typeof e == `string`)
      throw Error(
        `Passing a string to ConvexReactClient.setAuth is no longer supported, please upgrade to passing in an async function to handle reauthentication.`,
      );
    this.sync.setAuth(e, t ?? (() => {}), n);
  }
  clearAuth() {
    this.sync.clearAuth();
  }
  setAdminAuth(e, t) {
    if (((this.adminAuth = e), (this.fakeUserIdentity = t), this.closed))
      throw Error(`ConvexReactClient has already been closed.`);
    this.cachedSync && this.sync.setAdminAuth(e, t);
  }
  watchQuery(e, ...t) {
    let [n, r] = t,
      i = R(e);
    return {
      onUpdate: (e) => {
        let { queryToken: t, unsubscribe: a } = this.sync.subscribe(i, n, r),
          o = this.listeners.get(t);
        return (
          o === void 0 ? this.listeners.set(t, new Set([e])) : o.add(e),
          () => {
            if (this.closed) return;
            let n = this.listeners.get(t);
            (n.delete(e), n.size === 0 && this.listeners.delete(t), a());
          }
        );
      },
      localQueryResult: () => {
        if (this.cachedSync) return this.cachedSync.localQueryResult(i, n);
      },
      localQueryLogs: () => {
        if (this.cachedSync) return this.cachedSync.localQueryLogs(i, n);
      },
      journal: () => {
        if (this.cachedSync) return this.cachedSync.queryJournal(i, n);
      },
    };
  }
  prewarmQuery(e) {
    let t = e.extendSubscriptionFor ?? Vt,
      n = this.watchQuery(e.query, e.args || {}).onUpdate(() => {});
    setTimeout(n, t);
  }
  watchPaginatedQuery(e, t, n) {
    let r = R(e);
    return {
      onUpdate: (e) => {
        let { paginatedQueryToken: i, unsubscribe: a } =
            this.paginatedQueryClient.subscribe(r, t || {}, n),
          o = this.listeners.get(i);
        return (
          o === void 0 ? this.listeners.set(i, new Set([e])) : o.add(e),
          () => {
            if (this.closed) return;
            let t = this.listeners.get(i);
            (t.delete(e), t.size === 0 && this.listeners.delete(i), a());
          }
        );
      },
      localQueryResult: () =>
        this.paginatedQueryClient.localQueryResult(r, t, n),
    };
  }
  mutation(e, ...t) {
    let [n, r] = t,
      i = R(e);
    return this.sync.mutation(i, n, r);
  }
  action(e, ...t) {
    let n = R(e);
    return this.sync.action(n, ...t);
  }
  query(e, ...t) {
    let n = this.watchQuery(e, ...t),
      r = n.localQueryResult();
    return r === void 0
      ? new Promise((e, t) => {
          let r = n.onUpdate(() => {
            r();
            try {
              e(n.localQueryResult());
            } catch (e) {
              t(e);
            }
          });
        })
      : Promise.resolve(r);
  }
  connectionState() {
    return this.sync.connectionState();
  }
  subscribeToConnectionState(e) {
    return this.sync.subscribeToConnectionState(e);
  }
  get logger() {
    return this._logger;
  }
  async close() {
    if (
      ((this.closed = !0),
      (this.listeners = new Map()),
      (this.cachedPaginatedQueryClient &&= void 0),
      this.cachedSync)
    ) {
      let e = this.cachedSync;
      ((this.cachedSync = void 0), await e.close());
    }
  }
  handleTransition(e) {
    let t = e.queries.map((e) => e.token),
      n = e.paginatedQueries.map((e) => e.token);
    this.transition([...t, ...n]);
  }
  transition(e) {
    for (let t of e) {
      let e = this.listeners.get(t);
      if (e) for (let t of e) t();
    }
  }
};
Rt.createContext(void 0);
var Ut = Ue,
  Wt = 6e4,
  Gt = 500,
  Kt = 1e4,
  qt = 1e3,
  Jt = 3e4,
  Yt = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function Xt(e) {
  if (typeof e != `object` || !e) return null;
  let t = e;
  if (
    (t.mode !== `light` && t.mode !== `dark`) ||
    typeof t.tokens != `object` ||
    t.tokens === null
  )
    return null;
  let n = {};
  for (let [e, r] of Object.entries(t.tokens)) {
    if (typeof r != `string`) return null;
    n[e] = r;
  }
  return { mode: t.mode, tokens: n };
}
function Zt(e) {
  let t = document.documentElement;
  for (let [n, r] of Object.entries(e.tokens)) t.style.setProperty(n, r);
  (t.classList.toggle(`light`, e.mode === `light`),
    t.classList.toggle(`dark`, e.mode === `dark`));
}
function Qt(e) {
  if (typeof e != `object` || !e) return !1;
  let t = e;
  if (
    typeof t.pluginName != `string` ||
    typeof t.userId != `string` ||
    typeof t.organizationId != `string` ||
    typeof t.workspaceId != `string`
  )
    return !1;
  if (t.kind === `page`)
    return typeof t.pageId == `string` && typeof t.pageTitle == `string`;
  if (t.kind === `file_view`) {
    if (
      typeof t.fileViewId != `string` ||
      typeof t.fileViewTitle != `string` ||
      typeof t.file != `object` ||
      t.file === null
    )
      return !1;
    let e = t.file;
    return (
      typeof e.fileNodeId == `string` &&
      typeof e.name == `string` &&
      typeof e.path == `string` &&
      typeof e.contentType == `string`
    );
  }
  return !1;
}
function $t() {
  let e = window.location.hash.slice(1);
  if (!e)
    throw Error(
      `Missing host bridge fragment — this plugin frame must be embedded by the Bonobo host app`,
    );
  let t = new URLSearchParams(e),
    n = t.getAll(`parentOrigin`),
    r = t.getAll(`nonce`);
  if (t.size !== 2 || n.length !== 1 || r.length !== 1)
    throw Error(`Invalid host bridge fragment`);
  let i = n[0],
    a = r[0],
    o;
  try {
    o = new URL(i);
  } catch {
    throw Error(`Invalid host bridge parent origin`);
  }
  if ((o.protocol !== `http:` && o.protocol !== `https:`) || o.origin !== i)
    throw Error(`Invalid host bridge parent origin`);
  if (!Yt.test(a)) throw Error(`Invalid host bridge nonce`);
  return { parentOrigin: i, nonce: a };
}
async function en() {
  let { parentOrigin: e, nonce: t } = $t(),
    n = ``,
    r = ``,
    i = 0,
    a = ``,
    o = 0,
    s = null,
    c = new Set(),
    l = new Map(),
    u = new Map(),
    d = null;
  async function f() {
    return Date.now() >= i - Wt ? p() : r;
  }
  function p() {
    if (d) return d;
    let n = crypto.randomUUID();
    return (
      (d = new Promise((r, i) => {
        let a = setTimeout(() => {
          (u.delete(n), i(Error(`Plugin frame token refresh timed out`)));
        }, Kt);
        u.set(n, { resolve: r, reject: i, timeout: a });
        try {
          window.parent.postMessage(
            { type: `bonobo:token-refresh-request`, nonce: t, requestId: n },
            e,
          );
        } catch (e) {
          (clearTimeout(a), u.delete(n), i(e));
        }
      }).finally(() => {
        d = null;
      })),
      d
    );
  }
  let m = () => a !== `` && Date.now() < o - Wt,
    h = (e) => {
      typeof e.jwt == `string` &&
      typeof e.jwtExpiresAt == `number` &&
      Number.isFinite(e.jwtExpiresAt)
        ? ((a = e.jwt), (o = e.jwtExpiresAt))
        : ((a = ``), (o = 0));
    };
  async function g(e, t, i) {
    let a = JSON.stringify(t),
      o = (t) => {
        let r = new Headers(i?.headers);
        return (
          r.set(`Authorization`, `Bearer ${t}`),
          r.set(`Content-Type`, `application/json`),
          r.set(`Accept`, `application/json`),
          fetch(n + e, {
            ...i,
            method: `POST`,
            body: a,
            headers: r,
            redirect: `error`,
          })
        );
      },
      s = await f(),
      c = await o(s);
    c.status === 401 && (c = await o(r === s ? await p() : r));
    let l = await c.text(),
      u = null;
    try {
      u = JSON.parse(l);
    } catch {}
    return { status: c.status, body: u };
  }
  async function ee(e) {
    let t = new Headers(e);
    return (t.set(`Authorization`, `Bearer ${await f()}`), t);
  }
  let _ = (e) =>
    fetch(n + `/plugins-ui/session-jwt`, {
      method: `POST`,
      headers: { "Content-Type": `application/json` },
      body: JSON.stringify({ token: e }),
    });
  async function v(e) {
    let t = e?.forceRefreshToken === !0;
    for (let e = 0; ; e += 1) {
      if (m() && !t) return a;
      let n = null;
      try {
        if (a !== `` && (await p(), m())) return a;
        ((n = await _(await f())),
          n.status === 401 && (n = await _(await p())));
      } catch {
        n = null;
      }
      if (n?.ok) {
        let e = await n.json().catch(() => null),
          t = e?._yay?.jwt,
          r = e?._yay?.sessionExpiresAt;
        return typeof t != `string` || typeof r != `number`
          ? null
          : ((i = r), (a = t), (o = r), t);
      }
      if (!(n === null || n.status === 429 || n.status >= 500) || e >= 2)
        return null;
      await new Promise((t) => setTimeout(t, 1e3 * (e + 1)));
    }
  }
  return new Promise((a) => {
    let o = !1,
      d,
      m = () => {
        window.parent.postMessage({ type: `bonobo:ready`, nonce: t }, e);
      },
      _ = () => {
        clearInterval(d);
      };
    (window.addEventListener(`message`, (d) => {
      if (d.source !== window.parent || d.origin !== e) return;
      let m = d.data;
      if (typeof m == `object` && m) {
        if (
          m.type === `bonobo:init` &&
          !o &&
          m.nonce === t &&
          typeof m.apiOrigin == `string` &&
          typeof m.convexUrl == `string` &&
          typeof m.token == `string` &&
          typeof m.tokenExpiresAt == `number` &&
          Number.isFinite(m.tokenExpiresAt) &&
          Qt(m.context)
        ) {
          ((o = !0),
            _(),
            window.removeEventListener(`pagehide`, _),
            (n = m.apiOrigin),
            (r = m.token),
            (i = m.tokenExpiresAt),
            h(m));
          let e = new Ht(m.convexUrl, {
              expectAuth: !0,
              unsavedChangesWarning: !1,
              initialAuthTokenReuse: !0,
            }),
            t = Date.now(),
            u = setInterval(() => {
              let n = Date.now();
              (n - t >= Jt && e.setAuth(v), (t = n));
            }, qt);
          (e.setAuth(v),
            window.addEventListener(
              `pagehide`,
              () => {
                (clearInterval(u), e.close());
              },
              { once: !0 },
            ),
            (s = Xt(m.theme)),
            s && Zt(s),
            a({
              context: m.context,
              apiOrigin: n,
              getToken: f,
              refreshToken: p,
              fetchJson: g,
              authorize: ee,
              convex: e,
              api: Ut,
              session: { expiresAt: () => i, fetchJwt: v },
              theme: {
                current: () => s,
                subscribe(e) {
                  return (
                    c.add(e),
                    () => {
                      c.delete(e);
                    }
                  );
                },
              },
              agent: {
                registerTool(e, t) {
                  return (
                    l.set(e, t),
                    () => {
                      l.get(e) === t && l.delete(e);
                    }
                  );
                },
              },
            }));
        } else if (
          o &&
          m.nonce === t &&
          m.type === `bonobo:token` &&
          typeof m.requestId == `string` &&
          typeof m.token == `string` &&
          typeof m.tokenExpiresAt == `number` &&
          Number.isFinite(m.tokenExpiresAt)
        ) {
          let e = u.get(m.requestId);
          e &&
            (u.delete(m.requestId),
            clearTimeout(e.timeout),
            (r = m.token),
            (i = m.tokenExpiresAt),
            h(m),
            e.resolve(m.token));
        } else if (o && m.nonce === t && m.type === `bonobo:theme`) {
          let e = Xt(m.theme);
          if (e) {
            ((s = e), Zt(e));
            for (let t of c) t(e);
          }
        } else if (
          o &&
          m.nonce === t &&
          m.type === `bonobo:token-error` &&
          typeof m.requestId == `string` &&
          typeof m.message == `string`
        ) {
          let e = u.get(m.requestId);
          e &&
            (u.delete(m.requestId),
            clearTimeout(e.timeout),
            e.reject(Error(m.message)));
        } else if (
          o &&
          m.nonce === t &&
          m.type === `bonobo:agent-tool-call` &&
          typeof m.callId == `string` &&
          typeof m.toolName == `string`
        ) {
          let n = m.callId,
            r = (r) => {
              try {
                window.parent.postMessage(
                  {
                    type: `bonobo:agent-tool-result`,
                    nonce: t,
                    callId: n,
                    ...r,
                  },
                  e,
                );
              } catch {
                window.parent.postMessage(
                  {
                    type: `bonobo:agent-tool-result`,
                    nonce: t,
                    callId: n,
                    ok: !1,
                    error: `The tool output could not be sent`,
                  },
                  e,
                );
              }
            },
            i = l.get(m.toolName);
          i
            ? Promise.resolve()
                .then(() => i(m.input))
                .then(
                  (e) => r({ ok: !0, output: e }),
                  (e) =>
                    r({
                      ok: !1,
                      error: e instanceof Error ? e.message : String(e),
                    }),
                )
            : r({ ok: !1, error: `This page has no tool named ${m.toolName}` });
        }
      }
    }),
      window.addEventListener(`pagehide`, _, { once: !0 }),
      m(),
      (d = setInterval(m, Gt)));
  });
}
var tn = t(),
  Q = r(),
  nn = `modulepreload`,
  rn = function (e, t) {
    return new URL(e, t).href;
  },
  an = {},
  on = function (e) {
    return e.pathname.endsWith(`.css`);
  },
  sn = function (e, t, n) {
    if (t in e) return e[t];
    let r = n();
    if (!r) {
      e[t] = void 0;
      return;
    }
    let i = r.then(
      () => {
        e[t] = void 0;
      },
      (n) => {
        throw ((e[t] = void 0), n);
      },
    );
    return ((e[t] = i), i);
  },
  cn = function (e, t, n) {
    let r = Promise.resolve();
    if (t && t.length > 0) {
      let e,
        i = document.querySelector(`meta[property=csp-nonce]`),
        a = i?.nonce || i?.getAttribute(`nonce`);
      function o(e) {
        return Promise.all(
          e.map((e) =>
            Promise.resolve(e).then(
              (e) => ({ status: `fulfilled`, value: e }),
              (e) => ({ status: `rejected`, reason: e }),
            ),
          ),
        );
      }
      function s(e) {
        return import.meta.resolve
          ? new URL(import.meta.resolve(e))
          : new URL(e, import.meta.url);
      }
      r = o(
        t
          .map((t) => {
            t = rn(t, n);
            let r = s(t),
              i = on(r);
            return sn(an, r.href, () => {
              if (e === void 0) {
                e = { all: new Set(), styles: new Set() };
                let t = document.getElementsByTagName(`link`);
                for (let n = t.length - 1; n >= 0; n--) {
                  let r = t[n];
                  (e.all.add(r.href),
                    r.rel === `stylesheet` && e.styles.add(r.href));
                }
              }
              if ((i ? e.styles : e.all).has(r.href)) return;
              let t = document.createElement(`link`);
              if (
                ((t.rel = i ? `stylesheet` : nn),
                i || (t.as = `script`),
                (t.crossOrigin = ``),
                (t.href = r.href),
                a && t.setAttribute(`nonce`, a),
                document.head.appendChild(t),
                i)
              )
                return new Promise((e, n) => {
                  (t.addEventListener(`load`, e),
                    t.addEventListener(`error`, () =>
                      n(Error(`Unable to preload CSS for ${r}`)),
                    ));
                });
            });
          })
          .filter((e) => e !== void 0),
      );
    }
    function i(e) {
      let t = new Event(`vite:preloadError`, { cancelable: !0 });
      if (((t.payload = e), window.dispatchEvent(t), !t.defaultPrevented))
        throw e;
    }
    return r.then((t) => {
      for (let e of t || []) e.status === `rejected` && i(e.reason);
      return e().catch(i);
    });
  },
  ln = document.getElementById(`root`);
if (!ln) throw Error(`index.html is missing the #root element`);
var $ = (0, tn.createRoot)(ln);
($.render(
  (0, Q.jsx)(`main`, {
    role: `status`,
    children: `Connecting to Bonobo Senate…`,
  }),
),
  en()
    .then(
      async (e) => {
        if (
          (e.context.kind === `page` && (document.title = e.context.pageTitle),
          e.context.kind === `page` && e.context.pageId === `mail`)
        ) {
          let { MailApp: t } = await cn(
            async () => {
              let { MailApp: e } = await import(`./mail-app.js`);
              return { MailApp: e };
            },
            __vite__mapDeps([0, 1, 2, 3, 4, 5]),
            import.meta.url,
          );
          $.render((0, Q.jsx)(t, { client: e }));
        } else {
          let { GmailPage: t } = await cn(
            async () => {
              let { GmailPage: e } = await import(`./gmail-page.js`);
              return { GmailPage: e };
            },
            __vite__mapDeps([6, 1, 2, 3, 4, 7]),
            import.meta.url,
          );
          $.render((0, Q.jsx)(t, { client: e }));
        }
      },
      () =>
        $.render(
          (0, Q.jsx)(`main`, {
            role: `alert`,
            children: `Bonobo Senate access changed. Reopen the page.`,
          }),
        ),
    )
    .catch(() =>
      $.render(
        (0, Q.jsx)(`main`, {
          role: `alert`,
          children: `The page could not load. Reload it.`,
        }),
      ),
    ));
