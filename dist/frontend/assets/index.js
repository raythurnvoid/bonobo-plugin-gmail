import { n as e } from "./rolldown-runtime.js";
import { n as t, r as n, t as r } from "./react.js";
import {
  a as i,
  c as a,
  i as o,
  n as s,
  o as c,
  r as l,
  s as u,
  t as d,
} from "./zod.js";
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
      e.crossOrigin === `use-credentials`
        ? (t.credentials = `include`)
        : e.crossOrigin === `anonymous`
          ? (t.credentials = `omit`)
          : (t.credentials = `same-origin`),
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
  var f = [],
    p = [],
    m = Uint8Array,
    h = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`,
    g = 0,
    _ = h.length;
  g < _;
  ++g
)
  ((f[g] = h[g]), (p[h.charCodeAt(g)] = g));
((p[45] = 62), (p[95] = 63));
function v(e) {
  var t = e.length;
  if (t % 4 > 0) throw Error(`Invalid string. Length must be a multiple of 4`);
  var n = e.indexOf(`=`);
  n === -1 && (n = t);
  var r = n === t ? 0 : 4 - (n % 4);
  return [n, r];
}
function ee(e, t, n) {
  return ((t + n) * 3) / 4 - n;
}
function y(e) {
  var t,
    n = v(e),
    r = n[0],
    i = n[1],
    a = new m(ee(e, r, i)),
    o = 0,
    s = i > 0 ? r - 4 : r,
    c;
  for (c = 0; c < s; c += 4)
    ((t =
      (p[e.charCodeAt(c)] << 18) |
      (p[e.charCodeAt(c + 1)] << 12) |
      (p[e.charCodeAt(c + 2)] << 6) |
      p[e.charCodeAt(c + 3)]),
      (a[o++] = (t >> 16) & 255),
      (a[o++] = (t >> 8) & 255),
      (a[o++] = t & 255));
  return (
    i === 2 &&
      ((t = (p[e.charCodeAt(c)] << 2) | (p[e.charCodeAt(c + 1)] >> 4)),
      (a[o++] = t & 255)),
    i === 1 &&
      ((t =
        (p[e.charCodeAt(c)] << 10) |
        (p[e.charCodeAt(c + 1)] << 4) |
        (p[e.charCodeAt(c + 2)] >> 2)),
      (a[o++] = (t >> 8) & 255),
      (a[o++] = t & 255)),
    a
  );
}
function te(e) {
  return f[(e >> 18) & 63] + f[(e >> 12) & 63] + f[(e >> 6) & 63] + f[e & 63];
}
function ne(e, t, n) {
  for (var r, i = [], a = t; a < n; a += 3)
    ((r =
      ((e[a] << 16) & 16711680) + ((e[a + 1] << 8) & 65280) + (e[a + 2] & 255)),
      i.push(te(r)));
  return i.join(``);
}
function b(e) {
  for (
    var t, n = e.length, r = n % 3, i = [], a = 16383, o = 0, s = n - r;
    o < s;
    o += a
  )
    i.push(ne(e, o, o + a > s ? s : o + a));
  return (
    r === 1
      ? ((t = e[n - 1]), i.push(f[t >> 2] + f[(t << 4) & 63] + `==`))
      : r === 2 &&
        ((t = (e[n - 2] << 8) + e[n - 1]),
        i.push(f[t >> 10] + f[(t >> 4) & 63] + f[(t << 2) & 63] + `=`)),
    i.join(``)
  );
}
function x(e) {
  if (e === void 0) return {};
  if (!S(e))
    throw Error(
      `The arguments to a Convex function must be an object. Received: ${e}`,
    );
  return e;
}
function re(e) {
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
function S(e) {
  let t = typeof e == `object`,
    n = Object.getPrototypeOf(e),
    r =
      n === null || n === Object.prototype || n?.constructor?.name === `Object`;
  return t && r;
}
var ie = !0,
  C = BigInt(`-9223372036854775808`),
  w = BigInt(`9223372036854775807`),
  T = BigInt(`0`),
  E = BigInt(`8`),
  D = BigInt(`256`);
function ae(e) {
  return Number.isNaN(e) || !Number.isFinite(e) || Object.is(e, -0);
}
function oe(e) {
  e < T && (e -= C + C);
  let t = e.toString(16);
  t.length % 2 == 1 && (t = `0` + t);
  let n = new Uint8Array(new ArrayBuffer(8)),
    r = 0;
  for (let i of t.match(/.{2}/g).reverse())
    (n.set([parseInt(i, 16)], r++), (e >>= E));
  return b(n);
}
function O(e) {
  let t = y(e);
  if (t.byteLength !== 8)
    throw Error(`Received ${t.byteLength} bytes, expected 8 for $integer`);
  let n = T,
    r = T;
  for (let e of t) ((n += BigInt(e) * D ** r), r++);
  return (n > w && (n += C + C), n);
}
function se(e) {
  if (e < C || w < e)
    throw Error(`BigInt ${e} does not fit into a 64-bit signed integer.`);
  let t = new ArrayBuffer(8);
  return (new DataView(t).setBigInt64(0, e, !0), b(new Uint8Array(t)));
}
function ce(e) {
  let t = y(e);
  if (t.byteLength !== 8)
    throw Error(`Received ${t.byteLength} bytes, expected 8 for $integer`);
  return new DataView(t.buffer).getBigInt64(0, !0);
}
var le = DataView.prototype.setBigInt64 ? se : oe,
  ue = DataView.prototype.getBigInt64 ? ce : O,
  de = 1024;
function fe(e) {
  if (e.length > de)
    throw Error(`Field name ${e} exceeds maximum field name length ${de}.`);
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
function k(e) {
  if (
    e === null ||
    typeof e == `boolean` ||
    typeof e == `number` ||
    typeof e == `string`
  )
    return e;
  if (Array.isArray(e)) return e.map((e) => k(e));
  if (typeof e != `object`) throw Error(`Unexpected type of ${e}`);
  let t = Object.entries(e);
  if (t.length === 1) {
    let n = t[0][0];
    if (n === `$bytes`) {
      if (typeof e.$bytes != `string`)
        throw Error(`Malformed $bytes field on ${e}`);
      return y(e.$bytes).buffer;
    }
    if (n === `$integer`) {
      if (typeof e.$integer != `string`)
        throw Error(`Malformed $integer field on ${e}`);
      return ue(e.$integer);
    }
    if (n === `$float`) {
      if (typeof e.$float != `string`)
        throw Error(`Malformed $float field on ${e}`);
      let t = y(e.$float);
      if (t.byteLength !== 8)
        throw Error(`Received ${t.byteLength} bytes, expected 8 for $float`);
      let n = new DataView(t.buffer).getFloat64(0, ie);
      if (!ae(n)) throw Error(`Float ${n} should be encoded as a number`);
      return n;
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
  for (let [t, r] of Object.entries(e)) (fe(t), (n[t] = k(r)));
  return n;
}
var pe = 16384;
function A(e) {
  let t = JSON.stringify(e, (e, t) =>
    t === void 0 ? `undefined` : typeof t == `bigint` ? `${t.toString()}n` : t,
  );
  if (t.length > pe) {
    let e = pe - 14,
      n = t.codePointAt(e - 1);
    return (
      n !== void 0 && n > 65535 && --e,
      t.substring(0, e) + `[...truncated]`
    );
  }
  return t;
}
function me(e, t, n, r) {
  if (e === void 0) {
    let e = n && ` (present at path ${n} in original object ${A(t)})`;
    throw Error(
      `undefined is not a valid Convex value${e}. To learn about Convex's supported types, see https://docs.convex.dev/using/types.`,
    );
  }
  if (e === null) return e;
  if (typeof e == `bigint`) {
    if (e < C || w < e)
      throw Error(`BigInt ${e} does not fit into a 64-bit signed integer.`);
    return { $integer: le(e) };
  }
  if (typeof e == `number`)
    if (ae(e)) {
      let t = new ArrayBuffer(8);
      return (
        new DataView(t).setFloat64(0, e, ie),
        { $float: b(new Uint8Array(t)) }
      );
    } else return e;
  if (typeof e == `boolean` || typeof e == `string`) return e;
  if (e instanceof ArrayBuffer) return { $bytes: b(new Uint8Array(e)) };
  if (Array.isArray(e)) return e.map((e, r) => me(e, t, n + `[${r}]`, !1));
  if (e instanceof Set) throw Error(he(n, `Set`, [...e], t));
  if (e instanceof Map) throw Error(he(n, `Map`, [...e], t));
  if (!S(e)) {
    let r = e?.constructor?.name,
      i = r ? `${r} ` : ``;
    throw Error(he(n, i, e, t));
  }
  let i = {},
    a = Object.entries(e);
  a.sort(([e, t], [n, r]) => (e === n ? 0 : e < n ? -1 : 1));
  for (let [e, o] of a)
    o === void 0
      ? r && (fe(e), (i[e] = ge(o, t, n + `.${e}`)))
      : (fe(e), (i[e] = me(o, t, n + `.${e}`, !1)));
  return i;
}
function he(e, t, n, r) {
  return e
    ? `${t}${A(n)} is not a supported Convex type (present at path ${e} in original object ${A(r)}). To learn about Convex's supported types, see https://docs.convex.dev/using/types.`
    : `${t}${A(n)} is not a supported Convex type.`;
}
function ge(e, t, n) {
  if (e === void 0) return { $undefined: null };
  if (t === void 0)
    throw Error(
      `Programming error. Current value is ${A(e)} but original value is undefined`,
    );
  return me(e, t, n, !1);
}
function j(e) {
  return me(e, e, ``, !1);
}
var _e = Object.defineProperty,
  ve = (e, t, n) =>
    t in e
      ? _e(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  ye = (e, t, n) => ve(e, typeof t == `symbol` ? t : t + ``, n),
  be,
  xe,
  Se = Symbol.for(`ConvexError`),
  Ce = class extends ((xe = Error), (be = Se), xe) {
    constructor(e) {
      (super(typeof e == `string` ? e : A(e)),
        ye(this, `name`, `ConvexError`),
        ye(this, `data`),
        ye(this, be, !0),
        (this.data = e));
    }
  },
  we = `1.42.2`,
  Te = Object.defineProperty,
  Ee = (e, t, n) =>
    t in e
      ? Te(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  De = (e, t, n) => Ee(e, typeof t == `symbol` ? t : t + ``, n),
  Oe = `color:rgb(0, 145, 255)`;
function ke(e) {
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
var Ae = class {
  constructor(e) {
    (De(this, `_onLogLineFuncs`),
      De(this, `_verbose`),
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
function je(e) {
  let t = new Ae(e);
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
function Me(e) {
  return new Ae(e);
}
function Ne(e, t, n, r, i) {
  let a = ke(n);
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
    e.log(`%c[CONVEX ${a}(${r})] [${n}]`, Oe, o);
  } else e.error(`[CONVEX ${a}(${r})] ${i}`);
}
function Pe(e, t) {
  let n = `[CONVEX FATAL ERROR] ${t}`;
  return (e.error(n), Error(n));
}
function M(e, t, n) {
  return `[CONVEX ${ke(e)}(${t})] ${n.errorMessage}
  Called by client`;
}
function Fe(e, t) {
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
  return JSON.stringify({ udfPath: N(e), args: j(t) });
}
function Ie(e, t, n) {
  let { initialNumItems: r, id: i } = n;
  return JSON.stringify({
    type: `paginated`,
    udfPath: N(e),
    args: j(t),
    options: j({ initialNumItems: r, id: i }),
  });
}
var Le = Object.defineProperty,
  Re = (e, t, n) =>
    t in e
      ? Le(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  F = (e, t, n) => Re(e, typeof t == `symbol` ? t : t + ``, n),
  ze = class {
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
            args: [j(t)],
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
          args: [j(t.args)],
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
  Be = Object.defineProperty,
  Ve = (e, t, n) =>
    t in e
      ? Be(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  He = (e, t, n) => Ve(e, typeof t == `symbol` ? t : t + ``, n),
  Ue = class {
    constructor(e, t) {
      ((this.logger = e),
        (this.markConnectionStateDirty = t),
        He(this, `inflightRequests`),
        He(this, `requestsOlderThanRestart`),
        He(this, `inflightMutationsCount`, 0),
        He(this, `inflightActionsCount`, 0),
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
      for (let t of e.logLines) Ne(this.logger, `info`, n, r, t);
      let i = t.status,
        a,
        o;
      if (e.success)
        ((a = { success: !0, logLines: e.logLines, value: k(e.result) }),
          (o = () => i.onResult(a)));
      else {
        let t = e.result,
          { errorData: s } = e;
        (Ne(this.logger, `error`, n, r, t),
          (a = {
            success: !1,
            errorMessage: t,
            errorData: s === void 0 ? void 0 : k(s),
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
      for (let [t, n] of this.inflightRequests) {
        if (n.status.status === `NotSent`) {
          ((n.status.status = `Requested`), e.push(n.message));
          continue;
        }
        if (n.message.type === `Mutation`) e.push(n.message);
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
  I = Symbol.for(`functionName`),
  We = Symbol.for(`toReferencePath`);
function Ge(e) {
  return e[We] ?? null;
}
function Ke(e) {
  return e.startsWith(`function://`);
}
function qe(e) {
  let t;
  if (typeof e == `string`) t = Ke(e) ? { functionHandle: e } : { name: e };
  else if (e[I]) t = { name: e[I] };
  else {
    let n = Ge(e);
    if (!n) throw Error(`${e} is not a functionReference`);
    t = { reference: n };
  }
  return t;
}
function L(e) {
  let t = qe(e);
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
  let n = e[I];
  if (!n) throw Error(`${e} is not a functionReference`);
  return n;
}
function Je(e = []) {
  return new Proxy(
    {},
    {
      get(t, n) {
        if (typeof n == `string`) return Je([...e, n]);
        if (n === I) {
          if (e.length < 2) {
            let t = [`api`, ...e].join(`.`);
            throw Error(
              `API path is expected to be of the form \`api.moduleName.functionName\`. Found: \`${t}\``,
            );
          }
          let t = e.slice(0, -1).join(`/`),
            n = e[e.length - 1];
          return n === "default" ? t : t + `:` + n;
        } else if (n === Symbol.toStringTag) return `FunctionReference`;
        else return;
      },
    },
  );
}
var Ye = Je(),
  Xe = Object.defineProperty,
  Ze = (e, t, n) =>
    t in e
      ? Xe(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  R = (e, t, n) => Ze(e, typeof t == `symbol` ? t : t + ``, n),
  Qe = class e {
    constructor(e) {
      (R(this, `queryResults`),
        R(this, `modifiedQueries`),
        (this.queryResults = e),
        (this.modifiedQueries = []));
    }
    getQuery(t, ...n) {
      let r = x(n[0]),
        i = L(t),
        a = this.queryResults.get(P(i, r));
      if (a !== void 0) return e.queryValue(a.result);
    }
    getAllQueries(t) {
      let n = [],
        r = L(t);
      for (let t of this.queryResults.values())
        t.udfPath === N(r) &&
          n.push({ args: t.args, value: e.queryValue(t.result) });
      return n;
    }
    setQuery(e, t, n) {
      let r = x(t),
        i = L(e),
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
  $e = class {
    constructor() {
      (R(this, `queryResults`),
        R(this, `optimisticUpdates`),
        (this.queryResults = new Map()),
        (this.optimisticUpdates = []));
    }
    ingestQueryResultsFromServer(e, t) {
      this.optimisticUpdates = this.optimisticUpdates.filter(
        (e) => !t.has(e.mutationId),
      );
      let n = this.queryResults;
      this.queryResults = new Map(e);
      let r = new Qe(this.queryResults);
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
      let n = new Qe(this.queryResults);
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
          ? Error(M(`query`, t.udfPath, n))
          : Fe(n, new Ce(M(`query`, t.udfPath, n)));
      }
    }
    hasQueryResult(e) {
      return this.queryResults.get(e) !== void 0;
    }
    queryLogs(e) {
      return this.queryResults.get(e)?.result?.logLines;
    }
  },
  et = Object.defineProperty,
  tt = (e, t, n) =>
    t in e
      ? et(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  nt = (e, t, n) => tt(e, typeof t == `symbol` ? t : t + ``, n),
  z = class e {
    constructor(e, t) {
      (nt(this, `low`),
        nt(this, `high`),
        nt(this, `__isUnsignedLong__`),
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
        ? rt
        : t >= at
          ? ot
          : new e((t % B) | 0, (t / B) | 0);
    }
    toString() {
      return (BigInt(this.high) * BigInt(B) + BigInt(this.low)).toString();
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
  rt = new z(0, 0),
  it = 65536,
  B = it * it,
  at = B * B,
  ot = new z(-1, -1),
  st = Object.defineProperty,
  ct = (e, t, n) =>
    t in e
      ? st(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  lt = (e, t, n) => ct(e, typeof t == `symbol` ? t : t + ``, n),
  ut = class {
    constructor(e, t) {
      (lt(this, `version`),
        lt(this, `remoteQuerySet`),
        lt(this, `queryPath`),
        lt(this, `logger`),
        (this.version = { querySet: 0, ts: z.fromNumber(0), identity: 0 }),
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
              for (let n of t.logLines) Ne(this.logger, `info`, `query`, e, n);
            let n = k(t.value ?? null);
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
              for (let n of t.logLines) Ne(this.logger, `info`, `query`, e, n);
            let { errorData: n } = t;
            this.remoteQuerySet.set(t.queryId, {
              success: !1,
              errorMessage: t.errorMessage,
              errorData: n === void 0 ? void 0 : k(n),
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
function dt(e) {
  let t = y(e);
  return z.fromBytesLE(Array.from(t));
}
function ft(e) {
  return b(new Uint8Array(e.toBytesLE()));
}
function pt(e) {
  switch (e.type) {
    case `FatalError`:
    case `AuthError`:
    case `ActionResponse`:
    case `TransitionChunk`:
    case `Ping`:
      return { ...e };
    case `MutationResponse`:
      return e.success ? { ...e, ts: dt(e.ts) } : { ...e };
    case `Transition`:
      return {
        ...e,
        startVersion: { ...e.startVersion, ts: dt(e.startVersion.ts) },
        endVersion: { ...e.endVersion, ts: dt(e.endVersion.ts) },
      };
    default:
  }
}
function mt(e) {
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
        : { ...e, maxObservedTimestamp: ft(e.maxObservedTimestamp) };
    default:
  }
}
var ht = Object.defineProperty,
  gt = (e, t, n) =>
    t in e
      ? ht(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  V = (e, t, n) => gt(e, typeof t == `symbol` ? t : t + ``, n),
  _t = 1e3,
  vt = 1001,
  yt = 1005,
  bt = 4040,
  xt;
function H() {
  return (
    xt === void 0 && (xt = Date.now()),
    typeof performance > `u` || !performance.now
      ? Date.now()
      : Math.round(xt + performance.now())
  );
}
function St() {
  return `t=${Math.round((H() - xt) / 100) / 10}s`;
}
var Ct = {
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
function wt(e) {
  if (e === void 0) return `Unknown`;
  for (let t of Object.keys(Ct)) if (e.startsWith(t)) return t;
  return `Unknown`;
}
var Tt = class {
  constructor(e, t, n, r, i, a) {
    ((this.markConnectionStateDirty = i),
      (this.debug = a),
      V(this, `socket`),
      V(this, `connectionCount`),
      V(this, `_hasEverConnected`, !1),
      V(this, `lastCloseReason`),
      V(this, `transitionChunkBuffer`, null),
      V(this, `defaultInitialBackoff`),
      V(this, `maxBackoff`),
      V(this, `retries`),
      V(this, `serverInactivityThreshold`),
      V(this, `reconnectDueToServerInactivityTimeout`),
      V(this, `scheduledReconnect`, null),
      V(this, `networkOnlineHandler`, null),
      V(this, `pendingNetworkRecoveryInfo`, null),
      V(this, `uri`),
      V(this, `onOpen`),
      V(this, `onResume`),
      V(this, `onMessage`),
      V(this, `webSocketConstructor`),
      V(this, `logger`),
      V(this, `onServerDisconnectError`),
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
    typeof window > `u` ||
      typeof window.addEventListener != `function` ||
      (this.networkOnlineHandler === null &&
        ((this.networkOnlineHandler = () => {
          (this._logVerbose(`network online event detected`),
            this.tryReconnectImmediately());
        }),
        window.addEventListener(`online`, this.networkOnlineHandler),
        this._logVerbose(`network online event listener registered`)));
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
      let t = pt(JSON.parse(e));
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
              clientTs: H(),
            })),
          this.lastCloseReason !== `InitialConnect` &&
            (this.lastCloseReason
              ? this.logger.log(
                  `WebSocket reconnected at`,
                  St(),
                  `after disconnect due to`,
                  this.lastCloseReason,
                )
              : this.logger.log(`WebSocket reconnected at`, St())),
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
          n = pt(JSON.parse(e.data));
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
          e.code !== _t && e.code !== vt && e.code !== yt && e.code !== bt)
        ) {
          let t = `WebSocket closed with code ${e.code}`;
          (e.reason && (t += `: ${e.reason}`),
            this.logger.log(t),
            this.onServerDisconnectError &&
              e.reason &&
              this.onServerDisconnectError(t));
        }
        let t = wt(e.reason);
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
      let n = mt(e),
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
    let n = H(),
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
      let t = H() - this.scheduledReconnect.scheduledAt;
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
              clientTs: H(),
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
          : Ct[e].timeout) *
      2 ** this.retries;
    this.retries += 1;
    let n = Math.min(t, this.maxBackoff);
    return n + n * (Math.random() - 0.5);
  }
  reportLargeTransition({ transition: e, messageLength: t }) {
    if (e.clientClockSkew === void 0 || e.serverTs === void 0) return;
    let n = H() - e.clientClockSkew - e.serverTs / 1e6,
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
function Et() {
  return Dt();
}
function Dt() {
  return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (e) => {
    let t = (Math.random() * 16) | 0;
    return (e === `x` ? t : (t & 3) | 8).toString(16);
  });
}
var U = class extends Error {};
U.prototype.name = `InvalidTokenError`;
function Ot(e) {
  return decodeURIComponent(
    atob(e).replace(/(.)/g, (e, t) => {
      let n = t.charCodeAt(0).toString(16).toUpperCase();
      return (n.length < 2 && (n = `0` + n), `%` + n);
    }),
  );
}
function kt(e) {
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
    return Ot(t);
  } catch {
    return atob(t);
  }
}
function At(e, t) {
  if (typeof e != `string`)
    throw new U(`Invalid token specified: must be a string`);
  t ||= {};
  let n = t.header === !0 ? 0 : 1,
    r = e.split(`.`)[n];
  if (typeof r != `string`)
    throw new U(`Invalid token specified: missing part #${n + 1}`);
  let i;
  try {
    i = kt(r);
  } catch (e) {
    throw new U(
      `Invalid token specified: invalid base64 for part #${n + 1} (${e.message})`,
    );
  }
  try {
    return JSON.parse(i);
  } catch (e) {
    throw new U(
      `Invalid token specified: invalid json for part #${n + 1} (${e.message})`,
    );
  }
}
var jt = Object.defineProperty,
  Mt = (e, t, n) =>
    t in e
      ? jt(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  W = (e, t, n) => Mt(e, typeof t == `symbol` ? t : t + ``, n),
  Nt = 480 * 60 * 60 * 1e3,
  Pt = 2,
  Ft = class {
    constructor(e, t, n) {
      (W(this, `authState`, { state: `noAuth` }),
        W(this, `configVersion`, 0),
        W(this, `syncState`),
        W(this, `authenticate`),
        W(this, `stopSocket`),
        W(this, `tryRestartSocket`),
        W(this, `pauseSocket`),
        W(this, `resumeSocket`),
        W(this, `clearAuth`),
        W(this, `logger`),
        W(this, `refreshTokenLeewaySeconds`),
        W(this, `initialAuthTokenReuse`),
        W(this, `lastRefreshChange`),
        W(this, `tokenConfirmationAttempts`, 0),
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
          return;
        }
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
      if (!this.syncState.isCurrentOrNewerAuthVersion(t + 1)) {
        this._logVerbose(`ignoring auth error for previous auth attempt`);
        return;
      }
      this.tryToReauthenticate(e);
    }
    async tryToReauthenticate(e) {
      if (
        (this._logVerbose(`attempting to reauthenticate: ${e.error}`),
        this.authState.state === `noAuth` ||
          (this.authState.state ===
            `waitingForServerConfirmationOfFreshToken` &&
            this.tokenConfirmationAttempts >= Pt))
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
            `retrying reauthentication, ${Pt - this.tokenConfirmationAttempts} attempts remaining`,
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
      let s = Math.min(Nt, (o - this.refreshTokenLeewaySeconds) * 1e3);
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
          break;
        case `waitingForServerConfirmationOfFreshToken`:
        case `waitingForServerConfirmationOfCachedToken`:
        case `initialRefetch`:
          break;
        default:
      }
      (this.authState.state === `waitingForScheduledRefetch` &&
        clearTimeout(this.authState.refetchTokenTimeoutId),
        (this.authState = e));
    }
    decodeToken(e) {
      try {
        return At(e);
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
  It = [
    `convexClientConstructed`,
    `convexWebSocketOpen`,
    `convexFirstMessageReceived`,
  ];
function Lt(e, t) {
  let n = { sessionId: t };
  typeof performance > `u` ||
    !performance.mark ||
    performance.mark(e, { detail: n });
}
function Rt(e) {
  let t = e.name.slice(6);
  return (
    (t = t.charAt(0).toLowerCase() + t.slice(1)),
    { name: t, startTime: e.startTime }
  );
}
function zt(e) {
  if (typeof performance > `u` || !performance.getEntriesByName) return [];
  let t = [];
  for (let n of It) {
    let r = performance
      .getEntriesByName(n)
      .filter((e) => e.entryType === `mark`)
      .filter((t) => t.detail.sessionId === e);
    t.push(...r);
  }
  return t.map(Rt);
}
var Bt = Object.defineProperty,
  Vt = (e, t, n) =>
    t in e
      ? Bt(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  G = (e, t, n) => Vt(e, typeof t == `symbol` ? t : t + ``, n),
  Ht = class {
    constructor(e, t, n) {
      if (
        (G(this, `address`),
        G(this, `state`),
        G(this, `requestManager`),
        G(this, `webSocketManager`),
        G(this, `authenticationManager`),
        G(this, `remoteQuerySet`),
        G(this, `optimisticQueryResults`),
        G(this, `_transitionHandlerCounter`, 0),
        G(this, `_nextRequestId`),
        G(this, `_onTransitionFns`, new Map()),
        G(this, `_sessionId`),
        G(this, `firstMessageReceived`, !1),
        G(this, `debug`),
        G(this, `logger`),
        G(this, `maxObservedTimestamp`),
        G(this, `connectionStateSubscribers`, new Map()),
        G(this, `nextConnectionStateSubscriberId`, 0),
        G(this, `_lastPublishedConnectionState`),
        G(this, `markConnectionStateDirty`, () => {
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
        G(this, `mark`, (e) => {
          this.debug && Lt(e, this.sessionId);
        }),
        typeof e == `object`)
      )
        throw Error(
          `Passing a ClientConfig object is no longer supported. Pass the URL of the Convex deployment as a string directly.`,
        );
      (n?.skipConvexDeploymentUrlCheck !== !0 && re(e), (n = { ...n }));
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
            ? Me({ verbose: n.verbose ?? !1 })
            : n.logger !== !0 && n.logger
              ? n.logger
              : je({ verbose: n.verbose ?? !1 })));
      let a = e.search(`://`);
      if (a === -1) throw Error(`Provided address was not an absolute URL.`);
      let o = e.substring(a + 3),
        s = e.substring(0, a),
        c;
      if (s === `http`) c = `ws`;
      else if (s === `https`) c = `wss`;
      else throw Error(`Unknown parent protocol ${s}`);
      let l = `${c}://${o}/api/${we}/sync`;
      ((this.state = new ze()),
        (this.remoteQuerySet = new ut(
          (e) => this.state.queryPath(e),
          this.logger,
        )),
        (this.requestManager = new Ue(
          this.logger,
          this.markConnectionStateDirty,
        )));
      let u = () => {
        (this.webSocketManager.pause(), this.state.pause());
      };
      ((this.authenticationManager = new Ft(
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
        (this.optimisticQueryResults = new $e()),
        this.addOnTransitionHandler((e) => {
          t(e.queries.map((e) => e.token));
        }),
        (this._nextRequestId = 0),
        (this._sessionId = Et()));
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
      ((this.webSocketManager = new Tt(
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
              (this.remoteQuerySet = new ut(
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
                let t = Pe(this.logger, e.error);
                throw (this.webSocketManager.terminate(), t);
              }
              default:
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
          t = e ? At(e.value) : {};
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
      let r = x(t),
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
      let n = P(e, x(t));
      return this.optimisticQueryResults.queryResult(n);
    }
    localQueryResultByToken(e) {
      return this.optimisticQueryResults.queryResult(e);
    }
    hasLocalQueryResultByToken(e) {
      return this.optimisticQueryResults.hasQueryResult(e);
    }
    localQueryLogs(e, t) {
      let n = P(e, x(t));
      return this.optimisticQueryResults.queryLogs(n);
    }
    queryJournal(e, t) {
      let n = P(e, x(t));
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
          ? Error(M(`mutation`, e, r))
          : Fe(r, new Ce(M(`mutation`, e, r)));
      return r.value;
    }
    async mutationInternal(e, t, n, r) {
      let { mutationPromise: i } = this.enqueueMutation(e, t, n, r);
      return i;
    }
    enqueueMutation(e, t, n, r) {
      let i = x(t);
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
          args: [j(i)],
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
          ? Error(M(`action`, e, n))
          : Fe(n, new Ce(M(`action`, e, n)));
      return n.value;
    }
    async actionInternal(e, t, n) {
      let r = x(t),
        i = this.nextRequestId;
      (this._nextRequestId++, this.tryReportLongDisconnect());
      let a = {
          type: `Action`,
          requestId: i,
          udfPath: e,
          componentPath: n,
          args: [j(r)],
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
        let e = zt(this.sessionId);
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
      if (e === null || Date.now() - e.getTime() <= 60 * 1e3) return;
      let t = `${this.address}/api/debug_event`;
      fetch(t, {
        method: `POST`,
        headers: {
          "Content-Type": `application/json`,
          "Convex-Client": `npm-${we}`,
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
function Ut(e) {
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
var Wt = Object.defineProperty,
  Gt = (e, t, n) =>
    t in e
      ? Wt(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  Kt = (e, t, n) => Gt(e, typeof t == `symbol` ? t : t + ``, n),
  qt = class {
    constructor(e, t) {
      ((this.client = e),
        (this.onTransition = t),
        Kt(this, `paginatedQuerySet`, new Map()),
        Kt(this, `lastTransitionTs`),
        (this.lastTransitionTs = z.fromNumber(0)),
        this.client.addOnTransitionHandler((e) => this.onBaseTransition(e)));
    }
    subscribe(e, t, n) {
      let r = N(e),
        i = Ie(r, t, n),
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
      let r = Ie(N(e), t, n);
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
        let n = Ut(t);
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
      let i = Ut(r);
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
          let a = i.get(n).queryToken,
            o = t(a);
          if (!o) continue;
          let s = Ut(o);
          s.splitCursor &&
            (s.pageStatus === `SplitRecommended` ||
              s.pageStatus === `SplitRequired` ||
              s.page.length > e.options.initialNumItems * 2) &&
            this.splitPaginatedQueryPage(e, n, s.splitCursor, s.continueCursor);
        }
      }
    }
    splitPaginatedQueryPage(e, t, n, r) {
      let i = e.nextPageKey++,
        a = e.nextPageKey++,
        o = { cursor: r, numItems: e.options.initialNumItems, id: e.id },
        s = this.client.subscribe(e.canonicalizedUdfPath, {
          ...e.args,
          paginationOpts: { ...o, cursor: null, endCursor: n },
        });
      e.pageKeyToQuery.set(i, s);
      let c = this.client.subscribe(e.canonicalizedUdfPath, {
        ...e.args,
        paginationOpts: { ...o, cursor: n, endCursor: r },
      });
      (e.pageKeyToQuery.set(a, c), e.ongoingSplits.set(t, [i, a]));
    }
    addPageToPaginatedQuery(e, t, n) {
      let r = this.mustGetPaginatedQuery(e),
        i = r.nextPageKey++,
        a = { cursor: t, numItems: n, id: r.id },
        o = { ...r.args, paginationOpts: a },
        s = this.client.subscribe(r.canonicalizedUdfPath, o);
      return (r.pageKeys.push(i), r.pageKeyToQuery.set(i, s), s);
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
  K = e(n(), 1),
  Jt = Object.defineProperty,
  Yt = (e, t, n) =>
    t in e
      ? Jt(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  q = (e, t, n) => Yt(e, typeof t == `symbol` ? t : t + ``, n),
  Xt = 5e3;
if (K.default === void 0) throw Error(`Required dependency 'react' not found`);
var Zt = class {
  constructor(e, t) {
    if (
      (q(this, `address`),
      q(this, `cachedSync`),
      q(this, `cachedPaginatedQueryClient`),
      q(this, `listeners`),
      q(this, `options`),
      q(this, `closed`, !1),
      q(this, `_logger`),
      q(this, `adminAuth`),
      q(this, `fakeUserIdentity`),
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
          ? Me({ verbose: t?.verbose ?? !1 })
          : t?.logger !== !0 && t?.logger
            ? t.logger
            : je({ verbose: t?.verbose ?? !1 })),
      (this.options = { ...t, logger: this._logger }));
  }
  get url() {
    return this.address;
  }
  get sync() {
    if (this.closed) throw Error(`ConvexReactClient has already been closed.`);
    return this.cachedSync
      ? this.cachedSync
      : ((this.cachedSync =
          this.options.baseClient ??
          new Ht(this.address, () => {}, this.options)),
        this.adminAuth &&
          this.cachedSync.setAdminAuth(this.adminAuth, this.fakeUserIdentity),
        (this.cachedPaginatedQueryClient = new qt(this.cachedSync, (e) =>
          this.handleTransition(e),
        )),
        this.cachedSync);
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
      i = L(e);
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
    let t = e.extendSubscriptionFor ?? Xt,
      n = this.watchQuery(e.query, e.args || {}).onUpdate(() => {});
    setTimeout(n, t);
  }
  watchPaginatedQuery(e, t, n) {
    let r = L(e);
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
      i = L(e);
    return this.sync.mutation(i, n, r);
  }
  action(e, ...t) {
    let n = L(e);
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
K.createContext(void 0);
var Qt = Ye,
  $t = 6e4,
  en = 500,
  tn = 1e4,
  nn = 1e3,
  rn = 3e4,
  an = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function on(e) {
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
function sn(e) {
  let t = document.documentElement;
  for (let [n, r] of Object.entries(e.tokens)) t.style.setProperty(n, r);
  (t.classList.toggle(`light`, e.mode === `light`),
    t.classList.toggle(`dark`, e.mode === `dark`));
}
function cn(e) {
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
function ln() {
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
  if (!an.test(a)) throw Error(`Invalid host bridge nonce`);
  return { parentOrigin: i, nonce: a };
}
async function un() {
  let { parentOrigin: e, nonce: t } = ln(),
    n = ``,
    r = ``,
    i = 0,
    a = ``,
    o = 0,
    s = null,
    c = new Set(),
    l = new Map(),
    u = null;
  async function d() {
    return Date.now() >= i - $t ? f() : r;
  }
  function f() {
    if (u) return u;
    let n = crypto.randomUUID();
    return (
      (u = new Promise((r, i) => {
        let a = setTimeout(() => {
          (l.delete(n), i(Error(`Plugin frame token refresh timed out`)));
        }, tn);
        l.set(n, { resolve: r, reject: i, timeout: a });
        try {
          window.parent.postMessage(
            { type: `bonobo:token-refresh-request`, nonce: t, requestId: n },
            e,
          );
        } catch (e) {
          (clearTimeout(a), l.delete(n), i(e));
        }
      }).finally(() => {
        u = null;
      })),
      u
    );
  }
  let p = () => a !== `` && Date.now() < o - $t,
    m = (e) => {
      typeof e.jwt == `string` &&
      typeof e.jwtExpiresAt == `number` &&
      Number.isFinite(e.jwtExpiresAt)
        ? ((a = e.jwt), (o = e.jwtExpiresAt))
        : ((a = ``), (o = 0));
    };
  async function h(e, t, i) {
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
      s = await d(),
      c = await o(s);
    c.status === 401 && (c = await o(r === s ? await f() : r));
    let l = await c.text(),
      u = null;
    try {
      u = JSON.parse(l);
    } catch {}
    return { status: c.status, body: u };
  }
  async function g(e) {
    let t = new Headers(e);
    return (t.set(`Authorization`, `Bearer ${await d()}`), t);
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
      if (p() && !t) return a;
      let n = null;
      try {
        if (a !== `` && (await f(), p())) return a;
        ((n = await _(await d())),
          n.status === 401 && (n = await _(await f())));
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
      u,
      p = () => {
        window.parent.postMessage({ type: `bonobo:ready`, nonce: t }, e);
      },
      _ = () => {
        clearInterval(u);
      };
    (window.addEventListener(`message`, (u) => {
      if (u.source !== window.parent || u.origin !== e) return;
      let p = u.data;
      if (!(typeof p != `object` || !p)) {
        if (
          p.type === `bonobo:init` &&
          !o &&
          p.nonce === t &&
          typeof p.apiOrigin == `string` &&
          typeof p.convexUrl == `string` &&
          typeof p.token == `string` &&
          typeof p.tokenExpiresAt == `number` &&
          Number.isFinite(p.tokenExpiresAt) &&
          cn(p.context)
        ) {
          ((o = !0),
            _(),
            window.removeEventListener(`pagehide`, _),
            (n = p.apiOrigin),
            (r = p.token),
            (i = p.tokenExpiresAt),
            m(p));
          let e = new Zt(p.convexUrl, {
              expectAuth: !0,
              unsavedChangesWarning: !1,
              initialAuthTokenReuse: !0,
            }),
            t = Date.now(),
            l = setInterval(() => {
              let n = Date.now();
              (n - t >= rn && e.setAuth(v), (t = n));
            }, nn);
          (e.setAuth(v),
            window.addEventListener(
              `pagehide`,
              () => {
                (clearInterval(l), e.close());
              },
              { once: !0 },
            ),
            (s = on(p.theme)),
            s && sn(s),
            a({
              context: p.context,
              apiOrigin: n,
              getToken: d,
              refreshToken: f,
              fetchJson: h,
              authorize: g,
              convex: e,
              api: Qt,
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
            }));
        } else if (
          o &&
          p.nonce === t &&
          p.type === `bonobo:token` &&
          typeof p.requestId == `string` &&
          typeof p.token == `string` &&
          typeof p.tokenExpiresAt == `number` &&
          Number.isFinite(p.tokenExpiresAt)
        ) {
          let e = l.get(p.requestId);
          e &&
            (l.delete(p.requestId),
            clearTimeout(e.timeout),
            (r = p.token),
            (i = p.tokenExpiresAt),
            m(p),
            e.resolve(p.token));
        } else if (o && p.nonce === t && p.type === `bonobo:theme`) {
          let e = on(p.theme);
          if (e) {
            ((s = e), sn(e));
            for (let t of c) t(e);
          }
        } else if (
          o &&
          p.nonce === t &&
          p.type === `bonobo:token-error` &&
          typeof p.requestId == `string` &&
          typeof p.message == `string`
        ) {
          let e = l.get(p.requestId);
          e &&
            (l.delete(p.requestId),
            clearTimeout(e.timeout),
            e.reject(Error(p.message)));
        }
      }
    }),
      window.addEventListener(`pagehide`, _, { once: !0 }),
      p(),
      (u = setInterval(p, en)));
  });
}
var dn = t(),
  J = u().min(1).max(128),
  fn = i().finite().nonnegative().nullable(),
  Y = i().int().nonnegative(),
  pn = c({
    organizationId: J,
    workspaceId: J,
    installationId: J,
    actorUserId: J,
  }),
  mn = c({
    binding: pn,
    clientRequestId: u().regex(/^[0-9a-f]{64}$/),
    accountId: J.nullable(),
    attemptId: J.nullable(),
  }),
  hn = d([
    `preparing`,
    `pending`,
    `exchanging`,
    `awaiting_finish`,
    `finished`,
    `failed`,
    `cancelled`,
  ]),
  gn = c({
    attemptId: J,
    status: hn,
    consentUrl: a()
      .refine((e) => new URL(e).origin === `https://accounts.google.com`)
      .optional(),
  }),
  _n = c({
    binding: pn,
    canWrite: l(),
    cursor: u().nullable(),
    attempt: c({
      attemptId: J,
      status: hn,
      expiresAt: i().finite().positive(),
      clientRequestId: u().regex(/^[0-9a-f]{64}$/),
      accountId: J.nullable(),
    }).nullable(),
    accounts: s(
      c({
        accountId: J,
        emailAddress: o(),
        destinationPath: u().min(1),
        connectionGeneration: i().int().positive(),
        syncStatus: d([
          `backfilling`,
          `live`,
          `blocked`,
          `error`,
          `disconnected`,
        ]),
        syncError: u().nullable(),
        sourceError: d([
          `google_revoked`,
          `gmail_request`,
          `history_response_too_large`,
        ]).nullable(),
        pressReady: l(),
        canRepair: l(),
        needsReconnect: l(),
        backfillComplete: l(),
        messagesSynced: Y,
        messagesSkipped: Y,
        ledgerCounts: c({
          pending: Y,
          done: Y,
          skipped: Y,
          failed: Y,
          given_up: Y,
          emailAssumed: Y,
          permissionHeld: Y,
        }),
        attachmentsSkippedReason: d([`plan`, `storage`]).nullable(),
        nextSyncAt: fn,
        nextPermissionRetryAt: fn,
        lastSyncedAt: fn,
      }),
    ).max(25),
  }),
  vn = c({
    items: s(
      c({ gmailMessageId: u().regex(/^[0-9a-f]+$/), reasonCode: u() }),
    ).max(25),
    cursor: u().nullable(),
  }),
  yn = `https://kindhearted-mallard-511.convex.site`,
  bn = c({ code: u() }),
  X = class extends Error {
    code;
    constructor(e) {
      (super(e), (this.code = e));
    }
  };
async function Z(e, t, n, r) {
  let i = await e.getToken();
  for (let a = 0; a < 2; a++) {
    let o = await fetch(`${yn}${t}`, {
      method: `POST`,
      redirect: `error`,
      cache: `no-store`,
      headers: {
        Authorization: `Bearer ${i}`,
        "Content-Type": `application/json`,
      },
      body: JSON.stringify(n),
      signal: AbortSignal.timeout(2e4),
    });
    if (o.status === 401 && a === 0) {
      i = await e.refreshToken();
      continue;
    }
    let s = await o.json();
    if (!o.ok) {
      let e = bn.safeParse(s);
      throw new X(e.success ? e.data.code : `service_unavailable`);
    }
    let c = r.safeParse(s);
    if (!c.success) throw new X(`service_unavailable`);
    return c.data;
  }
  throw new X(`press_access_changed`);
}
function xn(e, t) {
  return e === null ? `unchecked` : t - e > 10 * 6e4 ? `delayed` : `recent`;
}
var Q = r(),
  Sn = `gmail-connect-retry`,
  $ = c({}),
  Cn = {
    press_access_changed: `Press access changed. Reopen the Gmail page to resume.`,
    page_write_refused: `You need write access to change this connection.`,
    account_capacity: `This service has reached its connection limit. Ask the operator to check hosting capacity.`,
    rate_limited: `Too many requests. Wait a minute and try again.`,
    start_again: `This connection expired or stopped. Start again.`,
    choose_reconnect: `This Gmail account already exists here. Use Reconnect Gmail.`,
    gmail_account_changed: `Use the same Gmail account for Reconnect.`,
    invalid_finish_code: `The finish code is not valid. Copy it from the Google callback page.`,
    connection_changed: `The connection changed. Refresh this page.`,
    google_reconnect_needed: `Use Reconnect Gmail for this account.`,
    attempt_expired: `This connection expired. Start again.`,
  };
function wn(e) {
  return e instanceof X
    ? (Cn[e.code] ??
        `Gmail service is unavailable. Retry or ask the operator to check Convex.`)
    : `Gmail service is unavailable. Retry or ask the operator to check Convex.`;
}
function Tn() {
  return [...crypto.getRandomValues(new Uint8Array(32))]
    .map((e) => e.toString(16).padStart(2, `0`))
    .join(``);
}
function En(e) {
  return e === null ? `—` : new Date(e).toLocaleString();
}
function Dn({ client: e }) {
  let [t, n] = (0, K.useState)(null),
    [r, i] = (0, K.useState)(`loading`),
    [a, o] = (0, K.useState)(null),
    [s, c] = (0, K.useState)(!1),
    [l, u] = (0, K.useState)(null),
    [d, f] = (0, K.useState)(``),
    [p, m] = (0, K.useState)(``),
    [h, g] = (0, K.useState)(null),
    [_, v] = (0, K.useState)(null),
    [ee, y] = (0, K.useState)(Date.now()),
    [te, ne] = (0, K.useState)(null),
    b = (0, K.useId)(),
    x = (0, K.useRef)(null),
    re = (0, K.useRef)(!1),
    S = (0, K.useRef)(!1),
    ie = (0, K.useRef)(new Set()),
    C = (0, K.useRef)(!1),
    w = (0, K.useRef)(0);
  function T(e) {
    ((x.current = e),
      e
        ? sessionStorage.setItem(Sn, JSON.stringify(e))
        : (sessionStorage.removeItem(Sn), u(null), f(``), ne(null), m(``)));
  }
  let E = (0, K.useCallback)(async () => {
    if (S.current) return;
    S.current = !0;
    let t = w.current;
    try {
      let r = await Z(e, `/page/status`, { cursor: h }, _n);
      if (!C.current || t !== w.current) return;
      if ((n(r), i(`ready`), y(Date.now()), !re.current)) {
        re.current = !0;
        let t = null;
        try {
          let e = mn.safeParse(
            JSON.parse(sessionStorage.getItem(Sn) ?? `null`),
          );
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
              })
            : t?.attemptId && (t = null),
          T(t),
          t && r.canWrite)
        )
          try {
            let n = await Z(
              e,
              `/page/connect/start`,
              { clientRequestId: t.clientRequestId, accountId: t.accountId },
              gn,
            );
            C.current &&
              (T({ ...t, attemptId: n.attemptId }), u(n.consentUrl ?? null));
          } catch (e) {
            C.current && o(wn(e));
          }
      } else if (r.attempt && x.current?.attemptId !== r.attempt.attemptId) {
        let t = {
          binding: r.binding,
          clientRequestId: r.attempt.clientRequestId,
          accountId: r.attempt.accountId,
          attemptId: r.attempt.attemptId,
        };
        if ((T(t), r.canWrite))
          try {
            let n = await Z(
              e,
              `/page/connect/start`,
              { clientRequestId: t.clientRequestId, accountId: t.accountId },
              gn,
            );
            C.current && u(n.consentUrl ?? null);
          } catch (e) {
            C.current && o(wn(e));
          }
      } else !r.attempt && x.current?.attemptId && T(null);
      for (let t of r.accounts) {
        let n = `${t.accountId}:${t.connectionGeneration}`;
        if (t.canRepair && !ie.current.has(n)) {
          ie.current.add(n);
          try {
            await Z(
              e,
              `/page/press-repair`,
              {
                accountId: t.accountId,
                expectedGeneration: t.connectionGeneration,
                clientRequestId: Tn(),
              },
              $,
            );
          } catch (e) {
            C.current && o(wn(e));
          }
        }
      }
    } catch {
      C.current && i(`unavailable`);
    } finally {
      ((S.current = !1),
        C.current &&
          document.visibilityState === `visible` &&
          t !== w.current &&
          E());
    }
  }, [e, h]);
  (0, K.useEffect)(() => {
    C.current = !0;
    let e = null;
    function t() {
      (w.current++,
        e !== null && (clearInterval(e), (e = null)),
        document.visibilityState === `visible` &&
          (i(`loading`),
          y(Date.now()),
          E(),
          (e = setInterval(() => {
            document.visibilityState === `visible` && E();
          }, 5e3))));
    }
    return (
      t(),
      document.addEventListener(`visibilitychange`, t),
      () => {
        ((C.current = !1),
          w.current++,
          e !== null && clearInterval(e),
          document.removeEventListener(`visibilitychange`, t));
      }
    );
  }, [E]);
  async function D(e) {
    (c(!0), o(null));
    try {
      (await e(), await E());
    } catch (e) {
      (o(wn(e)),
        e instanceof X &&
          [
            `start_again`,
            `attempt_expired`,
            `choose_reconnect`,
            `gmail_account_changed`,
          ].includes(e.code) &&
          T(null));
    } finally {
      c(!1);
    }
  }
  async function ae(n) {
    if (!t) return;
    let r = {
      binding: t.binding,
      clientRequestId: Tn(),
      accountId: n,
      attemptId: null,
    };
    T(r);
    let i = await Z(
      e,
      `/page/connect/start`,
      { clientRequestId: r.clientRequestId, accountId: n },
      gn,
    );
    (T({ ...r, attemptId: i.attemptId }), u(i.consentUrl ?? null));
  }
  async function oe() {
    try {
      (await navigator.clipboard.writeText(l), m(`Link copied`));
    } catch {
      m(`Select and copy the link below.`);
    }
  }
  let O = t?.attempt;
  return (0, Q.jsxs)(`main`, {
    className: `GmailPage`,
    "data-gmail-service-status": r,
    children: [
      (0, Q.jsx)(`h1`, { children: `Gmail` }),
      (0, Q.jsx)(`p`, {
        children: `Save sent and received emails in Files. People with file access can read them.`,
      }),
      a &&
        r === `ready` &&
        (0, Q.jsx)(`p`, {
          role: `alert`,
          className: `GmailError`,
          children: a,
        }),
      r === `ready`
        ? t &&
          (0, Q.jsxs)(Q.Fragment, {
            children: [
              !t.canWrite &&
                (0, Q.jsx)(`p`, {
                  children: `You can view this page. Write access is needed to change a connection.`,
                }),
              !O &&
                (0, Q.jsx)(`button`, {
                  disabled: s || !t.canWrite,
                  onClick: () => void D(() => ae(null)),
                  children: `Connect Gmail`,
                }),
              O &&
                (0, Q.jsxs)(`section`, {
                  className: `GmailCard`,
                  "data-gmail-connect-status": O.status,
                  children: [
                    (0, Q.jsx)(`h2`, { children: `Connect Gmail` }),
                    (0, Q.jsxs)(`p`, {
                      children: [
                        `Organization ID: `,
                        (0, Q.jsx)(`code`, {
                          children: t.binding.organizationId,
                        }),
                        (0, Q.jsx)(`br`, {}),
                        `Workspace ID: `,
                        (0, Q.jsx)(`code`, { children: t.binding.workspaceId }),
                      ],
                    }),
                    (0, Q.jsx)(`p`, {
                      children: `Open this link in a new tab. Allow access. Copy the finish code back here. Compare these IDs with the callback page.`,
                    }),
                    l
                      ? (0, Q.jsxs)(Q.Fragment, {
                          children: [
                            (0, Q.jsx)(`button`, {
                              onClick: () => void oe(),
                              children: `Copy link`,
                            }),
                            (0, Q.jsx)(`p`, {
                              className: `GmailLink`,
                              children: l,
                            }),
                          ],
                        })
                      : (0, Q.jsxs)(Q.Fragment, {
                          children: [
                            (0, Q.jsx)(`p`, {
                              role: `status`,
                              children:
                                O.status === `awaiting_finish`
                                  ? `Google confirmed the account. Paste the finish code below.`
                                  : `Preparing the Google link…`,
                            }),
                            O.status !== `awaiting_finish` &&
                              (0, Q.jsx)(`button`, {
                                disabled: s || !t.canWrite,
                                onClick: () =>
                                  void D(async () => {
                                    let t = await Z(
                                      e,
                                      `/page/connect/start`,
                                      {
                                        clientRequestId: O.clientRequestId,
                                        accountId: O.accountId,
                                      },
                                      gn,
                                    );
                                    u(t.consentUrl ?? null);
                                  }),
                                children: `Retry connection link`,
                              }),
                          ],
                        }),
                    p && (0, Q.jsx)(`p`, { role: `status`, children: p }),
                    (0, Q.jsxs)(`form`, {
                      noValidate: !0,
                      onSubmit: (t) => {
                        if (
                          (t.preventDefault(), !t.currentTarget.checkValidity())
                        ) {
                          ne(
                            `Enter the 64-character finish code from the callback page.`,
                          );
                          return;
                        }
                        D(async () => {
                          (await Z(
                            e,
                            `/page/connect/finish`,
                            { attemptId: O.attemptId, finishCode: d },
                            $,
                          ),
                            T(null));
                        });
                      },
                      children: [
                        (0, Q.jsx)(`label`, {
                          htmlFor: b,
                          children: `Finish code`,
                        }),
                        (0, Q.jsx)(`input`, {
                          id: b,
                          value: d,
                          onChange: (e) => {
                            (f(e.target.value.trim()), ne(null));
                          },
                          required: !0,
                          pattern: `[0-9a-f]{64}`,
                          minLength: 64,
                          maxLength: 64,
                          autoComplete: `off`,
                          spellCheck: !1,
                        }),
                        te && (0, Q.jsx)(`p`, { role: `alert`, children: te }),
                        (0, Q.jsxs)(`div`, {
                          className: `GmailActions`,
                          children: [
                            (0, Q.jsx)(`button`, {
                              type: `submit`,
                              disabled: s || !t.canWrite,
                              children: `Finish connection`,
                            }),
                            (0, Q.jsx)(`button`, {
                              type: `button`,
                              disabled: s || !t.canWrite,
                              onClick: () =>
                                void D(async () => {
                                  (await Z(
                                    e,
                                    `/page/connect/cancel`,
                                    { attemptId: O.attemptId },
                                    $,
                                  ),
                                    T(null));
                                }),
                              children: `Cancel connection`,
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, Q.jsxs)(`p`, {
                      children: [
                        `Expires at `,
                        En(O.expiresAt),
                        `. Do not share the finish code.`,
                      ],
                    }),
                  ],
                }),
              t.accounts.map((n) => {
                let r = xn(n.lastSyncedAt, ee),
                  i = {
                    accountId: n.accountId,
                    expectedGeneration: n.connectionGeneration,
                  },
                  a = n.ledgerCounts.permissionHeld,
                  o = n.syncStatus === `blocked` || n.syncStatus === `error`;
                return (0, Q.jsxs)(
                  `section`,
                  {
                    className: `GmailCard`,
                    "data-gmail-sync-status": n.syncStatus,
                    "data-gmail-check-status": r,
                    "data-gmail-files-status": a ? `write_refused` : `normal`,
                    children: [
                      (0, Q.jsx)(`h2`, { children: n.emailAddress }),
                      (0, Q.jsxs)(`p`, {
                        children: [
                          `Destination: `,
                          (0, Q.jsx)(`code`, { children: n.destinationPath }),
                        ],
                      }),
                      (0, Q.jsx)(`p`, {
                        role: `status`,
                        children:
                          n.syncStatus === `disconnected`
                            ? `Disconnected`
                            : o && !n.pressReady
                              ? `Press connection needs attention`
                              : n.pressReady
                                ? n.backfillComplete
                                  ? `${n.messagesSynced} emails saved`
                                  : `Backfilling… ${n.messagesSynced} emails saved`
                                : `Finishing Press connection`,
                      }),
                      (0, Q.jsxs)(`p`, {
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
                      (0, Q.jsxs)(`p`, {
                        children: [
                          r === `unchecked`
                            ? `No mail check completed yet`
                            : r === `delayed`
                              ? `Sync is delayed`
                              : !o &&
                                  n.pressReady &&
                                  n.syncStatus !== `disconnected` &&
                                  !a
                                ? `Checking for new mail`
                                : `Last completed mail check`,
                          n.lastSyncedAt !== null &&
                            (0, Q.jsxs)(Q.Fragment, {
                              children: [`: `, En(n.lastSyncedAt)],
                            }),
                        ],
                      }),
                      a > 0 &&
                        (0, Q.jsxs)(`p`, {
                          className: `GmailAttention`,
                          children: [
                            `Some saves were refused by Files. `,
                            a,
                            ` emails are waiting for access. Check the connecting member and Gmail service account Can write on the workspace, destination and restricted folders. Permission retries are limited while access is refused.`,
                            n.nextPermissionRetryAt !== null &&
                              (0, Q.jsxs)(Q.Fragment, {
                                children: [
                                  ` `,
                                  `Next permission retry:`,
                                  ` `,
                                  En(n.nextPermissionRetryAt),
                                  `.`,
                                ],
                              }),
                          ],
                        }),
                      n.attachmentsSkippedReason &&
                        (0, Q.jsxs)(`p`, {
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
                        (0, Q.jsxs)(`p`, {
                          children: [
                            n.ledgerCounts.emailAssumed,
                            ` email saves were assumed because the path already existed.`,
                          ],
                        }),
                      n.sourceError === `google_revoked` &&
                        (0, Q.jsx)(`p`, {
                          children: `Google access stopped. Reconnect Gmail.`,
                        }),
                      [`gmail_request`, `history_response_too_large`].includes(
                        n.sourceError ?? ``,
                      ) &&
                        (0, Q.jsx)(`p`, {
                          children: `Gmail could not complete a request. Retry sync or ask the operator to check the source limit.`,
                        }),
                      n.syncError === `credits` &&
                        (0, Q.jsx)(`p`, {
                          children: `Add credits in Billing.`,
                        }),
                      n.canRepair &&
                        (0, Q.jsx)(`p`, {
                          children: `Press access needs repair.`,
                        }),
                      n.syncError === `actor_lost` &&
                        (0, Q.jsx)(`p`, {
                          children: `The connecting member lost write access. A writer must reconnect Gmail.`,
                        }),
                      [
                        `press_temporary`,
                        `gmail_temporary`,
                        `sync_error`,
                        `credits`,
                      ].includes(n.syncError ?? ``) &&
                        n.nextSyncAt !== null &&
                        (0, Q.jsxs)(`p`, {
                          children: [`Retrying at `, En(n.nextSyncAt), `.`],
                        }),
                      (0, Q.jsxs)(`div`, {
                        className: `GmailActions`,
                        children: [
                          (n.needsReconnect ||
                            n.syncStatus === `disconnected`) &&
                            (0, Q.jsx)(`button`, {
                              disabled: s || !t.canWrite || !!O,
                              onClick: () => void D(() => ae(n.accountId)),
                              children: `Reconnect Gmail`,
                            }),
                          n.canRepair &&
                            (0, Q.jsx)(`button`, {
                              disabled: s,
                              onClick: () =>
                                void D(async () => {
                                  await Z(
                                    e,
                                    `/page/press-repair`,
                                    { ...i, clientRequestId: Tn() },
                                    $,
                                  );
                                }),
                              children: `Repair Press access`,
                            }),
                          n.sourceError !== `google_revoked` &&
                            n.sourceError !== null &&
                            (0, Q.jsx)(`button`, {
                              disabled: s || !t.canWrite,
                              onClick: () =>
                                void D(async () => {
                                  await Z(e, `/page/retry-sync`, i, $);
                                }),
                              children: `Retry sync`,
                            }),
                          n.ledgerCounts.given_up > 0 &&
                            (0, Q.jsxs)(Q.Fragment, {
                              children: [
                                (0, Q.jsx)(`button`, {
                                  disabled: s,
                                  onClick: () =>
                                    void D(async () => {
                                      v({
                                        accountId: n.accountId,
                                        page: await Z(
                                          e,
                                          `/page/failures`,
                                          { accountId: n.accountId },
                                          vn,
                                        ),
                                      });
                                    }),
                                  children: `View failed emails`,
                                }),
                                (0, Q.jsx)(`button`, {
                                  disabled:
                                    s ||
                                    !t.canWrite ||
                                    n.syncStatus === `disconnected`,
                                  onClick: () =>
                                    void D(async () => {
                                      await Z(e, `/page/retry-failed`, i, $);
                                    }),
                                  children: `Retry failed emails`,
                                }),
                              ],
                            }),
                          n.syncStatus !== `disconnected` &&
                            (0, Q.jsx)(`button`, {
                              disabled: s || !t.canWrite,
                              onClick: () =>
                                void D(async () => {
                                  (await Z(e, `/page/disconnect`, i, $),
                                    T(null));
                                }),
                              children: `Disconnect`,
                            }),
                        ],
                      }),
                      _?.accountId === n.accountId &&
                        (0, Q.jsxs)(`div`, {
                          children: [
                            (0, Q.jsx)(`ul`, {
                              children: _.page.items.map((e) =>
                                (0, Q.jsxs)(
                                  `li`,
                                  {
                                    children: [
                                      (0, Q.jsx)(`code`, {
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
                            _.page.cursor &&
                              (0, Q.jsx)(`button`, {
                                disabled: s,
                                onClick: () =>
                                  void D(async () => {
                                    v({
                                      accountId: n.accountId,
                                      page: await Z(
                                        e,
                                        `/page/failures`,
                                        {
                                          accountId: n.accountId,
                                          cursor: _.page.cursor,
                                        },
                                        vn,
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
              (0, Q.jsxs)(`div`, {
                className: `GmailActions`,
                children: [
                  h !== null &&
                    (0, Q.jsx)(`button`, {
                      disabled: s,
                      onClick: () => g(null),
                      children: `First accounts`,
                    }),
                  t.cursor !== null &&
                    (0, Q.jsx)(`button`, {
                      disabled: s,
                      onClick: () => g(t.cursor),
                      children: `More accounts`,
                    }),
                ],
              }),
              (0, Q.jsx)(`p`, {
                className: `GmailLimits`,
                children: `Bodies are limited to 2 MiB and may be shortened. Up to 16 attachments per email, each up to 32 MiB. Attachments use the workspace upload plan and credits.`,
              }),
              (0, Q.jsx)(`p`, {
                children: `Disconnect Gmail before uninstalling this plugin. This clears its saved Gmail access. Files stay. Removing the app in Google Account Security stops all its workspace connections.`,
              }),
            ],
          })
        : (0, Q.jsxs)(`section`, {
            children: [
              (0, Q.jsx)(`p`, {
                role: `status`,
                children:
                  r === `loading`
                    ? `Loading Gmail status…`
                    : `Gmail service is unavailable. Retry or ask the operator to check Convex.`,
              }),
              r === `unavailable` &&
                (0, Q.jsx)(`button`, {
                  disabled: s,
                  onClick: () => void E(),
                  children: `Retry`,
                }),
            ],
          }),
    ],
  });
}
var On = document.getElementById(`root`);
if (!On) throw Error(`index.html is missing the #root element`);
var kn = (0, dn.createRoot)(On);
(kn.render(
  (0, Q.jsx)(`main`, {
    className: `GmailPage`,
    role: `status`,
    children: `Connecting to Press…`,
  }),
),
  un().then(
    (e) => {
      (e.context.kind === `page` && (document.title = e.context.pageTitle),
        kn.render((0, Q.jsx)(Dn, { client: e })));
    },
    () =>
      kn.render(
        (0, Q.jsx)(`main`, {
          className: `GmailPage`,
          role: `alert`,
          children: `Press access changed. Reopen the Gmail page.`,
        }),
      ),
  ));
