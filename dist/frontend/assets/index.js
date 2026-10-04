var Iy = Object.create,
  Qm = Object.defineProperty,
  Fy = Object.getOwnPropertyDescriptor,
  Wy = Object.getOwnPropertyNames,
  Py = Object.getPrototypeOf,
  ep = Object.prototype.hasOwnProperty,
  Pt = (n, i) => () => (
    i || (n((i = { exports: {} }).exports, i), (n = null)),
    i.exports
  ),
  tp = (n, i, u, c) => {
    if ((i && typeof i == "object") || typeof i == "function")
      for (var s = Wy(i), h = 0, d = s.length, v; h < d; h++)
        ((v = s[h]),
          !ep.call(n, v) &&
            v !== u &&
            Qm(n, v, {
              get: ((b) => i[b]).bind(null, v),
              enumerable: !(c = Fy(i, v)) || c.enumerable,
            }));
    return n;
  },
  np = (n, i, u) => (
    (u = n != null ? Iy(Py(n)) : {}),
    tp(
      i || !n || !n.__esModule
        ? Qm(u, "default", { value: n, enumerable: !0 })
        : u,
      n,
    )
  );
(function () {
  const i = document.createElement("link").relList;
  if (i && i.supports && i.supports("modulepreload")) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) c(s);
  new MutationObserver((s) => {
    for (const h of s)
      if (h.type === "childList")
        for (const d of h.addedNodes)
          d.tagName === "LINK" && d.rel === "modulepreload" && c(d);
  }).observe(document, { childList: !0, subtree: !0 });
  function u(s) {
    const h = {};
    return (
      s.integrity && (h.integrity = s.integrity),
      s.referrerPolicy && (h.referrerPolicy = s.referrerPolicy),
      s.crossOrigin === "use-credentials"
        ? (h.credentials = "include")
        : s.crossOrigin === "anonymous"
          ? (h.credentials = "omit")
          : (h.credentials = "same-origin"),
      h
    );
  }
  function c(s) {
    if (s.ep) return;
    s.ep = !0;
    const h = u(s);
    fetch(s.href, h);
  }
})();
var ap = Pt((n) => {
    var i = Symbol.for("react.transitional.element"),
      u = Symbol.for("react.portal"),
      c = Symbol.for("react.fragment"),
      s = Symbol.for("react.strict_mode"),
      h = Symbol.for("react.profiler"),
      d = Symbol.for("react.consumer"),
      v = Symbol.for("react.context"),
      b = Symbol.for("react.forward_ref"),
      z = Symbol.for("react.suspense"),
      _ = Symbol.for("react.memo"),
      q = Symbol.for("react.lazy"),
      w = Symbol.for("react.activity"),
      x = Symbol.iterator;
    function K(g) {
      return g === null || typeof g != "object"
        ? null
        : ((g = (x && g[x]) || g["@@iterator"]),
          typeof g == "function" ? g : null);
    }
    var Te = {
        isMounted: function () {
          return !1;
        },
        enqueueForceUpdate: function () {},
        enqueueReplaceState: function () {},
        enqueueSetState: function () {},
      },
      xe = Object.assign,
      Fe = {};
    function qe(g, R, Z) {
      ((this.props = g),
        (this.context = R),
        (this.refs = Fe),
        (this.updater = Z || Te));
    }
    ((qe.prototype.isReactComponent = {}),
      (qe.prototype.setState = function (g, R) {
        if (typeof g != "object" && typeof g != "function" && g != null)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables.",
          );
        this.updater.enqueueSetState(this, g, R, "setState");
      }),
      (qe.prototype.forceUpdate = function (g) {
        this.updater.enqueueForceUpdate(this, g, "forceUpdate");
      }));
    function P() {}
    P.prototype = qe.prototype;
    function X(g, R, Z) {
      ((this.props = g),
        (this.context = R),
        (this.refs = Fe),
        (this.updater = Z || Te));
    }
    var ne = (X.prototype = new P());
    ((ne.constructor = X),
      xe(ne, qe.prototype),
      (ne.isPureReactComponent = !0));
    var ae = Array.isArray;
    function ge() {}
    var F = { H: null, A: null, T: null, S: null },
      ye = Object.prototype.hasOwnProperty;
    function V(g, R, Z) {
      var L = Z.ref;
      return {
        $$typeof: i,
        type: g,
        key: R,
        ref: L !== void 0 ? L : null,
        props: Z,
      };
    }
    function de(g, R) {
      return V(g.type, R, g.props);
    }
    function me(g) {
      return typeof g == "object" && g !== null && g.$$typeof === i;
    }
    function Ne(g) {
      var R = { "=": "=0", ":": "=2" };
      return (
        "$" +
        g.replace(/[=:]/g, function (Z) {
          return R[Z];
        })
      );
    }
    var De = /\/+/g;
    function We(g, R) {
      return typeof g == "object" && g !== null && g.key != null
        ? Ne("" + g.key)
        : R.toString(36);
    }
    function j(g) {
      switch (g.status) {
        case "fulfilled":
          return g.value;
        case "rejected":
          throw g.reason;
        default:
          switch (
            (typeof g.status == "string"
              ? g.then(ge, ge)
              : ((g.status = "pending"),
                g.then(
                  function (R) {
                    g.status === "pending" &&
                      ((g.status = "fulfilled"), (g.value = R));
                  },
                  function (R) {
                    g.status === "pending" &&
                      ((g.status = "rejected"), (g.reason = R));
                  },
                )),
            g.status)
          ) {
            case "fulfilled":
              return g.value;
            case "rejected":
              throw g.reason;
          }
      }
      throw g;
    }
    function U(g, R, Z, L, ie) {
      var le = typeof g;
      (le === "undefined" || le === "boolean") && (g = null);
      var pe = !1;
      if (g === null) pe = !0;
      else
        switch (le) {
          case "bigint":
          case "string":
          case "number":
            pe = !0;
            break;
          case "object":
            switch (g.$$typeof) {
              case i:
              case u:
                pe = !0;
                break;
              case q:
                return ((pe = g._init), U(pe(g._payload), R, Z, L, ie));
            }
        }
      if (pe)
        return (
          (ie = ie(g)),
          (pe = L === "" ? "." + We(g, 0) : L),
          ae(ie)
            ? ((Z = ""),
              pe != null && (Z = pe.replace(De, "$&/") + "/"),
              U(ie, R, Z, "", function (gi) {
                return gi;
              }))
            : ie != null &&
              (me(ie) &&
                (ie = de(
                  ie,
                  Z +
                    (ie.key == null || (g && g.key === ie.key)
                      ? ""
                      : ("" + ie.key).replace(De, "$&/") + "/") +
                    pe,
                )),
              R.push(ie)),
          1
        );
      pe = 0;
      var rt = L === "" ? "." : L + ":";
      if (ae(g))
        for (var Be = 0; Be < g.length; Be++)
          ((L = g[Be]), (le = rt + We(L, Be)), (pe += U(L, R, Z, le, ie)));
      else if (((Be = K(g)), typeof Be == "function"))
        for (g = Be.call(g), Be = 0; !(L = g.next()).done; )
          ((L = L.value), (le = rt + We(L, Be++)), (pe += U(L, R, Z, le, ie)));
      else if (le === "object") {
        if (typeof g.then == "function") return U(j(g), R, Z, L, ie);
        throw (
          (R = String(g)),
          Error(
            "Objects are not valid as a React child (found: " +
              (R === "[object Object]"
                ? "object with keys {" + Object.keys(g).join(", ") + "}"
                : R) +
              "). If you meant to render a collection of children, use an array instead.",
          )
        );
      }
      return pe;
    }
    function B(g, R, Z) {
      if (g == null) return g;
      var L = [],
        ie = 0;
      return (
        U(g, L, "", "", function (le) {
          return R.call(Z, le, ie++);
        }),
        L
      );
    }
    function W(g) {
      if (g._status === -1) {
        var R = g._result;
        ((R = R()),
          R.then(
            function (Z) {
              (g._status === 0 || g._status === -1) &&
                ((g._status = 1), (g._result = Z));
            },
            function (Z) {
              (g._status === 0 || g._status === -1) &&
                ((g._status = 2), (g._result = Z));
            },
          ),
          g._status === -1 && ((g._status = 0), (g._result = R)));
      }
      if (g._status === 1) return g._result.default;
      throw g._result;
    }
    var k =
        typeof reportError == "function"
          ? reportError
          : function (g) {
              if (
                typeof window == "object" &&
                typeof window.ErrorEvent == "function"
              ) {
                var R = new window.ErrorEvent("error", {
                  bubbles: !0,
                  cancelable: !0,
                  message:
                    typeof g == "object" &&
                    g !== null &&
                    typeof g.message == "string"
                      ? String(g.message)
                      : String(g),
                  error: g,
                });
                if (!window.dispatchEvent(R)) return;
              } else if (
                typeof process == "object" &&
                typeof process.emit == "function"
              ) {
                process.emit("uncaughtException", g);
                return;
              }
              console.error(g);
            },
      I = {
        map: B,
        forEach: function (g, R, Z) {
          B(
            g,
            function () {
              R.apply(this, arguments);
            },
            Z,
          );
        },
        count: function (g) {
          var R = 0;
          return (
            B(g, function () {
              R++;
            }),
            R
          );
        },
        toArray: function (g) {
          return (
            B(g, function (R) {
              return R;
            }) || []
          );
        },
        only: function (g) {
          if (!me(g))
            throw Error(
              "React.Children.only expected to receive a single React element child.",
            );
          return g;
        },
      };
    ((n.Activity = w),
      (n.Children = I),
      (n.Component = qe),
      (n.Fragment = c),
      (n.Profiler = h),
      (n.PureComponent = X),
      (n.StrictMode = s),
      (n.Suspense = z),
      (n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = F),
      (n.__COMPILER_RUNTIME = {
        __proto__: null,
        c: function (g) {
          return F.H.useMemoCache(g);
        },
      }),
      (n.cache = function (g) {
        return function () {
          return g.apply(null, arguments);
        };
      }),
      (n.cacheSignal = function () {
        return null;
      }),
      (n.cloneElement = function (g, R, Z) {
        if (g == null)
          throw Error(
            "The argument must be a React element, but you passed " + g + ".",
          );
        var L = xe({}, g.props),
          ie = g.key;
        if (R != null)
          for (le in (R.key !== void 0 && (ie = "" + R.key), R))
            !ye.call(R, le) ||
              le === "key" ||
              le === "__self" ||
              le === "__source" ||
              (le === "ref" && R.ref === void 0) ||
              (L[le] = R[le]);
        var le = arguments.length - 2;
        if (le === 1) L.children = Z;
        else if (1 < le) {
          for (var pe = Array(le), rt = 0; rt < le; rt++)
            pe[rt] = arguments[rt + 2];
          L.children = pe;
        }
        return V(g.type, ie, L);
      }),
      (n.createContext = function (g) {
        return (
          (g = {
            $$typeof: v,
            _currentValue: g,
            _currentValue2: g,
            _threadCount: 0,
            Provider: null,
            Consumer: null,
          }),
          (g.Provider = g),
          (g.Consumer = { $$typeof: d, _context: g }),
          g
        );
      }),
      (n.createElement = function (g, R, Z) {
        var L,
          ie = {},
          le = null;
        if (R != null)
          for (L in (R.key !== void 0 && (le = "" + R.key), R))
            ye.call(R, L) &&
              L !== "key" &&
              L !== "__self" &&
              L !== "__source" &&
              (ie[L] = R[L]);
        var pe = arguments.length - 2;
        if (pe === 1) ie.children = Z;
        else if (1 < pe) {
          for (var rt = Array(pe), Be = 0; Be < pe; Be++)
            rt[Be] = arguments[Be + 2];
          ie.children = rt;
        }
        if (g && g.defaultProps)
          for (L in ((pe = g.defaultProps), pe))
            ie[L] === void 0 && (ie[L] = pe[L]);
        return V(g, le, ie);
      }),
      (n.createRef = function () {
        return { current: null };
      }),
      (n.forwardRef = function (g) {
        return { $$typeof: b, render: g };
      }),
      (n.isValidElement = me),
      (n.lazy = function (g) {
        return { $$typeof: q, _payload: { _status: -1, _result: g }, _init: W };
      }),
      (n.memo = function (g, R) {
        return { $$typeof: _, type: g, compare: R === void 0 ? null : R };
      }),
      (n.startTransition = function (g) {
        var R = F.T,
          Z = {};
        F.T = Z;
        try {
          var L = g(),
            ie = F.S;
          (ie !== null && ie(Z, L),
            typeof L == "object" &&
              L !== null &&
              typeof L.then == "function" &&
              L.then(ge, k));
        } catch (le) {
          k(le);
        } finally {
          (R !== null && Z.types !== null && (R.types = Z.types), (F.T = R));
        }
      }),
      (n.unstable_useCacheRefresh = function () {
        return F.H.useCacheRefresh();
      }),
      (n.use = function (g) {
        return F.H.use(g);
      }),
      (n.useActionState = function (g, R, Z) {
        return F.H.useActionState(g, R, Z);
      }),
      (n.useCallback = function (g, R) {
        return F.H.useCallback(g, R);
      }),
      (n.useContext = function (g) {
        return F.H.useContext(g);
      }),
      (n.useDebugValue = function () {}),
      (n.useDeferredValue = function (g, R) {
        return F.H.useDeferredValue(g, R);
      }),
      (n.useEffect = function (g, R) {
        return F.H.useEffect(g, R);
      }),
      (n.useEffectEvent = function (g) {
        return F.H.useEffectEvent(g);
      }),
      (n.useId = function () {
        return F.H.useId();
      }),
      (n.useImperativeHandle = function (g, R, Z) {
        return F.H.useImperativeHandle(g, R, Z);
      }),
      (n.useInsertionEffect = function (g, R) {
        return F.H.useInsertionEffect(g, R);
      }),
      (n.useLayoutEffect = function (g, R) {
        return F.H.useLayoutEffect(g, R);
      }),
      (n.useMemo = function (g, R) {
        return F.H.useMemo(g, R);
      }),
      (n.useOptimistic = function (g, R) {
        return F.H.useOptimistic(g, R);
      }),
      (n.useReducer = function (g, R, Z) {
        return F.H.useReducer(g, R, Z);
      }),
      (n.useRef = function (g) {
        return F.H.useRef(g);
      }),
      (n.useState = function (g) {
        return F.H.useState(g);
      }),
      (n.useSyncExternalStore = function (g, R, Z) {
        return F.H.useSyncExternalStore(g, R, Z);
      }),
      (n.useTransition = function () {
        return F.H.useTransition();
      }),
      (n.version = "19.2.7"));
  }),
  Gs = Pt((n, i) => {
    i.exports = ap();
  }),
  It = [],
  Qt = [],
  ip = Uint8Array,
  As = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (var ri = 0, lp = As.length; ri < lp; ++ri)
  ((It[ri] = As[ri]), (Qt[As.charCodeAt(ri)] = ri));
Qt[45] = 62;
Qt[95] = 63;
function up(n) {
  var i = n.length;
  if (i % 4 > 0)
    throw new Error("Invalid string. Length must be a multiple of 4");
  var u = n.indexOf("=");
  u === -1 && (u = i);
  var c = u === i ? 0 : 4 - (u % 4);
  return [u, c];
}
function rp(n, i, u) {
  return ((i + u) * 3) / 4 - u;
}
function vl(n) {
  var i,
    u = up(n),
    c = u[0],
    s = u[1],
    h = new ip(rp(n, c, s)),
    d = 0,
    v = s > 0 ? c - 4 : c,
    b;
  for (b = 0; b < v; b += 4)
    ((i =
      (Qt[n.charCodeAt(b)] << 18) |
      (Qt[n.charCodeAt(b + 1)] << 12) |
      (Qt[n.charCodeAt(b + 2)] << 6) |
      Qt[n.charCodeAt(b + 3)]),
      (h[d++] = (i >> 16) & 255),
      (h[d++] = (i >> 8) & 255),
      (h[d++] = i & 255));
  return (
    s === 2 &&
      ((i = (Qt[n.charCodeAt(b)] << 2) | (Qt[n.charCodeAt(b + 1)] >> 4)),
      (h[d++] = i & 255)),
    s === 1 &&
      ((i =
        (Qt[n.charCodeAt(b)] << 10) |
        (Qt[n.charCodeAt(b + 1)] << 4) |
        (Qt[n.charCodeAt(b + 2)] >> 2)),
      (h[d++] = (i >> 8) & 255),
      (h[d++] = i & 255)),
    h
  );
}
function op(n) {
  return (
    It[(n >> 18) & 63] + It[(n >> 12) & 63] + It[(n >> 6) & 63] + It[n & 63]
  );
}
function sp(n, i, u) {
  for (var c, s = [], h = i; h < u; h += 3)
    ((c =
      ((n[h] << 16) & 16711680) + ((n[h + 1] << 8) & 65280) + (n[h + 2] & 255)),
      s.push(op(c)));
  return s.join("");
}
function gl(n) {
  for (
    var i, u = n.length, c = u % 3, s = [], h = 16383, d = 0, v = u - c;
    d < v;
    d += h
  )
    s.push(sp(n, d, d + h > v ? v : d + h));
  return (
    c === 1
      ? ((i = n[u - 1]), s.push(It[i >> 2] + It[(i << 4) & 63] + "=="))
      : c === 2 &&
        ((i = (n[u - 2] << 8) + n[u - 1]),
        s.push(It[i >> 10] + It[(i >> 4) & 63] + It[(i << 2) & 63] + "=")),
    s.join("")
  );
}
function Yn(n) {
  if (n === void 0) return {};
  if (!$m(n))
    throw new Error(
      `The arguments to a Convex function must be an object. Received: ${n}`,
    );
  return n;
}
function cp(n) {
  if (typeof n > "u")
    throw new Error(
      "Client created with undefined deployment address. If you used an environment variable, check that it's set.",
    );
  if (typeof n != "string")
    throw new Error(`Invalid deployment address: found ${n}".`);
  if (!(n.startsWith("http:") || n.startsWith("https:")))
    throw new Error(
      `Invalid deployment address: Must start with "https://" or "http://". Found "${n}".`,
    );
  try {
    new URL(n);
  } catch {
    throw new Error(
      `Invalid deployment address: "${n}" is not a valid URL. If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`,
    );
  }
  if (n.endsWith(".convex.site"))
    throw new Error(
      `Invalid deployment address: "${n}" ends with .convex.site, which is used for HTTP Actions. Convex deployment URLs typically end with .convex.cloud? If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`,
    );
}
function $m(n) {
  const i = typeof n == "object",
    u = Object.getPrototypeOf(n),
    c =
      u === null || u === Object.prototype || u?.constructor?.name === "Object";
  return i && c;
}
var Lm = !0,
  di = BigInt("-9223372036854775808"),
  Ys = BigInt("9223372036854775807"),
  Us = BigInt("0"),
  fp = BigInt("8"),
  hp = BigInt("256");
function Hm(n) {
  return Number.isNaN(n) || !Number.isFinite(n) || Object.is(n, -0);
}
function dp(n) {
  n < Us && (n -= di + di);
  let i = n.toString(16);
  i.length % 2 === 1 && (i = "0" + i);
  const u = new Uint8Array(new ArrayBuffer(8));
  let c = 0;
  for (const s of i.match(/.{2}/g).reverse())
    (u.set([parseInt(s, 16)], c++), (n >>= fp));
  return gl(u);
}
function mp(n) {
  const i = vl(n);
  if (i.byteLength !== 8)
    throw new Error(`Received ${i.byteLength} bytes, expected 8 for $integer`);
  let u = Us,
    c = Us;
  for (const s of i) ((u += BigInt(s) * hp ** c), c++);
  return (u > Ys && (u += di + di), u);
}
function vp(n) {
  if (n < di || Ys < n)
    throw new Error(`BigInt ${n} does not fit into a 64-bit signed integer.`);
  const i = new ArrayBuffer(8);
  return (new DataView(i).setBigInt64(0, n, !0), gl(new Uint8Array(i)));
}
function gp(n) {
  const i = vl(n);
  if (i.byteLength !== 8)
    throw new Error(`Received ${i.byteLength} bytes, expected 8 for $integer`);
  return new DataView(i.buffer).getBigInt64(0, !0);
}
var yp = DataView.prototype.setBigInt64 ? vp : dp,
  pp = DataView.prototype.getBigInt64 ? gp : mp,
  Pd = 1024;
function js(n) {
  if (n.length > Pd)
    throw new Error(`Field name ${n} exceeds maximum field name length ${Pd}.`);
  if (n.startsWith("$"))
    throw new Error(`Field name ${n} starts with a '$', which is reserved.`);
  for (let i = 0; i < n.length; i += 1) {
    const u = n.charCodeAt(i);
    if (u < 32 || u >= 127)
      throw new Error(
        `Field name ${n} has invalid character '${n[i]}': Field names can only contain non-control ASCII characters`,
      );
  }
}
function mi(n) {
  if (
    n === null ||
    typeof n == "boolean" ||
    typeof n == "number" ||
    typeof n == "string"
  )
    return n;
  if (Array.isArray(n)) return n.map((c) => mi(c));
  if (typeof n != "object") throw new Error(`Unexpected type of ${n}`);
  const i = Object.entries(n);
  if (i.length === 1) {
    const c = i[0][0];
    if (c === "$bytes") {
      if (typeof n.$bytes != "string")
        throw new Error(`Malformed $bytes field on ${n}`);
      return vl(n.$bytes).buffer;
    }
    if (c === "$integer") {
      if (typeof n.$integer != "string")
        throw new Error(`Malformed $integer field on ${n}`);
      return pp(n.$integer);
    }
    if (c === "$float") {
      if (typeof n.$float != "string")
        throw new Error(`Malformed $float field on ${n}`);
      const s = vl(n.$float);
      if (s.byteLength !== 8)
        throw new Error(
          `Received ${s.byteLength} bytes, expected 8 for $float`,
        );
      const h = new DataView(s.buffer).getFloat64(0, Lm);
      if (!Hm(h)) throw new Error(`Float ${h} should be encoded as a number`);
      return h;
    }
    if (c === "$set")
      throw new Error(
        "Received a Set which is no longer supported as a Convex type.",
      );
    if (c === "$map")
      throw new Error(
        "Received a Map which is no longer supported as a Convex type.",
      );
  }
  const u = {};
  for (const [c, s] of Object.entries(n)) (js(c), (u[c] = mi(s)));
  return u;
}
var em = 16384;
function fi(n) {
  const i = JSON.stringify(n, (u, c) =>
    c === void 0 ? "undefined" : typeof c == "bigint" ? `${c.toString()}n` : c,
  );
  if (i.length > em) {
    const u = "[...truncated]";
    let c = em - 14;
    const s = i.codePointAt(c - 1);
    return (s !== void 0 && s > 65535 && (c -= 1), i.substring(0, c) + u);
  }
  return i;
}
function Xu(n, i, u, c) {
  if (n === void 0) {
    const d = u && ` (present at path ${u} in original object ${fi(i)})`;
    throw new Error(
      `undefined is not a valid Convex value${d}. To learn about Convex's supported types, see https://docs.convex.dev/using/types.`,
    );
  }
  if (n === null) return n;
  if (typeof n == "bigint") {
    if (n < di || Ys < n)
      throw new Error(`BigInt ${n} does not fit into a 64-bit signed integer.`);
    return { $integer: yp(n) };
  }
  if (typeof n == "number")
    if (Hm(n)) {
      const d = new ArrayBuffer(8);
      return (
        new DataView(d).setFloat64(0, n, Lm),
        { $float: gl(new Uint8Array(d)) }
      );
    } else return n;
  if (typeof n == "boolean" || typeof n == "string") return n;
  if (n instanceof ArrayBuffer) return { $bytes: gl(new Uint8Array(n)) };
  if (Array.isArray(n)) return n.map((d, v) => Xu(d, i, u + `[${v}]`, !1));
  if (n instanceof Set) throw new Error(Es(u, "Set", [...n], i));
  if (n instanceof Map) throw new Error(Es(u, "Map", [...n], i));
  if (!$m(n)) {
    const d = n?.constructor?.name,
      v = d ? `${d} ` : "";
    throw new Error(Es(u, v, n, i));
  }
  const s = {},
    h = Object.entries(n);
  h.sort(([d, v], [b, z]) => (d === b ? 0 : d < b ? -1 : 1));
  for (const [d, v] of h)
    v !== void 0
      ? (js(d), (s[d] = Xu(v, i, u + `.${d}`, !1)))
      : c && (js(d), (s[d] = bp(v, i, u + `.${d}`)));
  return s;
}
function Es(n, i, u, c) {
  return n
    ? `${i}${fi(u)} is not a supported Convex type (present at path ${n} in original object ${fi(c)}). To learn about Convex's supported types, see https://docs.convex.dev/using/types.`
    : `${i}${fi(u)} is not a supported Convex type.`;
}
function bp(n, i, u) {
  if (n === void 0) return { $undefined: null };
  if (i === void 0)
    throw new Error(
      `Programming error. Current value is ${fi(n)} but original value is undefined`,
    );
  return Xu(n, i, u, !1);
}
function ba(n) {
  return Xu(n, n, "", !1);
}
var Sp = Object.defineProperty,
  _p = (n, i, u) =>
    i in n
      ? Sp(n, i, { enumerable: !0, configurable: !0, writable: !0, value: u })
      : (n[i] = u),
  ws = (n, i, u) => _p(n, typeof i != "symbol" ? i + "" : i, u),
  tm,
  nm,
  Tp = Symbol.for("ConvexError"),
  Zs = class extends ((nm = Error), (tm = Tp), nm) {
    constructor(n) {
      (super(typeof n == "string" ? n : fi(n)),
        ws(this, "name", "ConvexError"),
        ws(this, "data"),
        ws(this, tm, !0),
        (this.data = n));
    }
  },
  am = "1.42.2",
  zp = Object.defineProperty,
  Ap = (n, i, u) =>
    i in n
      ? zp(n, i, { enumerable: !0, configurable: !0, writable: !0, value: u })
      : (n[i] = u),
  im = (n, i, u) => Ap(n, typeof i != "symbol" ? i + "" : i, u),
  Ep = "color:rgb(0, 145, 255)";
function Vm(n) {
  switch (n) {
    case "query":
      return "Q";
    case "mutation":
      return "M";
    case "action":
      return "A";
    case "any":
      return "?";
  }
}
var Gm = class {
  constructor(n) {
    (im(this, "_onLogLineFuncs"),
      im(this, "_verbose"),
      (this._onLogLineFuncs = {}),
      (this._verbose = n.verbose));
  }
  addLogLineListener(n) {
    let i = Math.random().toString(36).substring(2, 15);
    for (let u = 0; u < 10 && this._onLogLineFuncs[i] !== void 0; u++)
      i = Math.random().toString(36).substring(2, 15);
    return (
      (this._onLogLineFuncs[i] = n),
      () => {
        delete this._onLogLineFuncs[i];
      }
    );
  }
  logVerbose(...n) {
    if (this._verbose)
      for (const i of Object.values(this._onLogLineFuncs))
        i("debug", `${new Date().toISOString()}`, ...n);
  }
  log(...n) {
    for (const i of Object.values(this._onLogLineFuncs)) i("info", ...n);
  }
  warn(...n) {
    for (const i of Object.values(this._onLogLineFuncs)) i("warn", ...n);
  }
  error(...n) {
    for (const i of Object.values(this._onLogLineFuncs)) i("error", ...n);
  }
};
function Ym(n) {
  const i = new Gm(n);
  return (
    i.addLogLineListener((u, ...c) => {
      switch (u) {
        case "debug":
          console.debug(...c);
          break;
        case "info":
          console.log(...c);
          break;
        case "warn":
          console.warn(...c);
          break;
        case "error":
          console.error(...c);
          break;
        default:
          console.log(...c);
      }
    }),
    i
  );
}
function Xm(n) {
  return new Gm(n);
}
function Ju(n, i, u, c, s) {
  const h = Vm(u);
  if (
    (typeof s == "object" &&
      (s = `ConvexError ${JSON.stringify(s.errorData, null, 2)}`),
    i === "info")
  ) {
    const d = s.match(/^\[.*?\] /);
    if (d === null) {
      n.error(`[CONVEX ${h}(${c})] Could not parse console.log`);
      return;
    }
    const v = s.slice(1, d[0].length - 2),
      b = s.slice(d[0].length);
    n.log(`%c[CONVEX ${h}(${c})] [${v}]`, Ep, b);
  } else n.error(`[CONVEX ${h}(${c})] ${s}`);
}
function wp(n, i) {
  const u = `[CONVEX FATAL ERROR] ${i}`;
  return (n.error(u), new Error(u));
}
function si(n, i, u) {
  return `[CONVEX ${Vm(n)}(${i})] ${u.errorMessage}
  Called by client`;
}
function xs(n, i) {
  return ((i.data = n.errorData), i);
}
function Sa(n) {
  const i = n.split(":");
  let u, c;
  return (
    i.length === 1
      ? ((u = i[0]), (c = "default"))
      : ((u = i.slice(0, i.length - 1).join(":")), (c = i[i.length - 1])),
    u.endsWith(".js") && (u = u.slice(0, -3)),
    `${u}:${c}`
  );
}
function pa(n, i) {
  return JSON.stringify({ udfPath: Sa(n), args: ba(i) });
}
function lm(n, i, u) {
  const { initialNumItems: c, id: s } = u;
  return JSON.stringify({
    type: "paginated",
    udfPath: Sa(n),
    args: ba(i),
    options: ba({ initialNumItems: c, id: s }),
  });
}
var Op = Object.defineProperty,
  Rp = (n, i, u) =>
    i in n
      ? Op(n, i, { enumerable: !0, configurable: !0, writable: !0, value: u })
      : (n[i] = u),
  Kt = (n, i, u) => Rp(n, typeof i != "symbol" ? i + "" : i, u),
  Cp = class {
    constructor() {
      (Kt(this, "nextQueryId"),
        Kt(this, "querySetVersion"),
        Kt(this, "querySet"),
        Kt(this, "queryIdToToken"),
        Kt(this, "identityVersion"),
        Kt(this, "auth"),
        Kt(this, "outstandingQueriesOlderThanRestart"),
        Kt(this, "outstandingAuthOlderThanRestart"),
        Kt(this, "paused"),
        Kt(this, "pendingQuerySetModifications"),
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
    subscribe(n, i, u, c) {
      const s = Sa(n),
        h = pa(s, i),
        d = this.querySet.get(h);
      if (d !== void 0)
        return (
          (d.numSubscribers += 1),
          {
            queryToken: h,
            modification: null,
            unsubscribe: () => this.removeSubscriber(h),
          }
        );
      {
        const v = this.nextQueryId++,
          b = {
            id: v,
            canonicalizedUdfPath: s,
            args: i,
            numSubscribers: 1,
            journal: u,
            componentPath: c,
          };
        (this.querySet.set(h, b), this.queryIdToToken.set(v, h));
        const z = this.querySetVersion,
          _ = this.querySetVersion + 1,
          q = {
            type: "Add",
            queryId: v,
            udfPath: s,
            args: [ba(i)],
            journal: u,
            componentPath: c,
          };
        return (
          this.paused
            ? this.pendingQuerySetModifications.set(v, q)
            : (this.querySetVersion = _),
          {
            queryToken: h,
            modification: {
              type: "ModifyQuerySet",
              baseVersion: z,
              newVersion: _,
              modifications: [q],
            },
            unsubscribe: () => this.removeSubscriber(h),
          }
        );
      }
    }
    transition(n) {
      for (const i of n.modifications)
        switch (i.type) {
          case "QueryUpdated":
          case "QueryFailed": {
            this.outstandingQueriesOlderThanRestart.delete(i.queryId);
            const u = i.journal;
            if (u !== void 0) {
              const c = this.queryIdToToken.get(i.queryId);
              c !== void 0 && (this.querySet.get(c).journal = u);
            }
            break;
          }
          case "QueryRemoved":
            this.outstandingQueriesOlderThanRestart.delete(i.queryId);
            break;
          default:
            throw new Error(`Invalid modification ${i.type}`);
        }
    }
    queryId(n, i) {
      const u = pa(Sa(n), i),
        c = this.querySet.get(u);
      return c !== void 0 ? c.id : null;
    }
    isCurrentOrNewerAuthVersion(n) {
      return n >= this.identityVersion;
    }
    getAuth() {
      return this.auth;
    }
    setAuth(n) {
      this.auth = { tokenType: "User", value: n };
      const i = this.identityVersion;
      return (
        this.paused || (this.identityVersion = i + 1),
        { type: "Authenticate", baseVersion: i, ...this.auth }
      );
    }
    setAdminAuth(n, i) {
      const u = { tokenType: "Admin", value: n, impersonating: i };
      this.auth = u;
      const c = this.identityVersion;
      return (
        this.paused || (this.identityVersion = c + 1),
        { type: "Authenticate", baseVersion: c, ...u }
      );
    }
    clearAuth() {
      ((this.auth = void 0), this.markAuthCompletion());
      const n = this.identityVersion;
      return (
        this.paused || (this.identityVersion = n + 1),
        { type: "Authenticate", tokenType: "None", baseVersion: n }
      );
    }
    hasAuth() {
      return !!this.auth;
    }
    isNewAuth(n) {
      return this.auth?.value !== n;
    }
    queryPath(n) {
      const i = this.queryIdToToken.get(n);
      return i ? this.querySet.get(i).canonicalizedUdfPath : null;
    }
    queryArgs(n) {
      const i = this.queryIdToToken.get(n);
      return i ? this.querySet.get(i).args : null;
    }
    queryToken(n) {
      return this.queryIdToToken.get(n) ?? null;
    }
    queryJournal(n) {
      return this.querySet.get(n)?.journal;
    }
    restart() {
      (this.unpause(), this.outstandingQueriesOlderThanRestart.clear());
      const n = [];
      for (const c of this.querySet.values()) {
        const s = {
          type: "Add",
          queryId: c.id,
          udfPath: c.canonicalizedUdfPath,
          args: [ba(c.args)],
          journal: c.journal,
          componentPath: c.componentPath,
        };
        (n.push(s), this.outstandingQueriesOlderThanRestart.add(c.id));
      }
      this.querySetVersion = 1;
      const i = {
        type: "ModifyQuerySet",
        baseVersion: 0,
        newVersion: 1,
        modifications: n,
      };
      if (!this.auth) return ((this.identityVersion = 0), [i, void 0]);
      this.outstandingAuthOlderThanRestart = !0;
      const u = { type: "Authenticate", baseVersion: 0, ...this.auth };
      return ((this.identityVersion = 1), [i, u]);
    }
    pause() {
      this.paused = !0;
    }
    resume() {
      const n =
          this.pendingQuerySetModifications.size > 0
            ? {
                type: "ModifyQuerySet",
                baseVersion: this.querySetVersion,
                newVersion: ++this.querySetVersion,
                modifications: Array.from(
                  this.pendingQuerySetModifications.values(),
                ),
              }
            : void 0,
        i =
          this.auth !== void 0
            ? {
                type: "Authenticate",
                baseVersion: this.identityVersion++,
                ...this.auth,
              }
            : void 0;
      return (this.unpause(), [n, i]);
    }
    unpause() {
      ((this.paused = !1), this.pendingQuerySetModifications.clear());
    }
    removeSubscriber(n) {
      const i = this.querySet.get(n);
      if (i.numSubscribers > 1) return ((i.numSubscribers -= 1), null);
      {
        (this.querySet.delete(n),
          this.queryIdToToken.delete(i.id),
          this.outstandingQueriesOlderThanRestart.delete(i.id));
        const u = this.querySetVersion,
          c = this.querySetVersion + 1,
          s = { type: "Remove", queryId: i.id };
        return (
          this.paused
            ? this.pendingQuerySetModifications.has(i.id)
              ? this.pendingQuerySetModifications.delete(i.id)
              : this.pendingQuerySetModifications.set(i.id, s)
            : (this.querySetVersion = c),
          {
            type: "ModifyQuerySet",
            baseVersion: u,
            newVersion: c,
            modifications: [s],
          }
        );
      }
    }
  },
  Mp = Object.defineProperty,
  Np = (n, i, u) =>
    i in n
      ? Mp(n, i, { enumerable: !0, configurable: !0, writable: !0, value: u })
      : (n[i] = u),
  xu = (n, i, u) => Np(n, typeof i != "symbol" ? i + "" : i, u),
  Dp = class {
    constructor(n, i) {
      ((this.logger = n),
        (this.markConnectionStateDirty = i),
        xu(this, "inflightRequests"),
        xu(this, "requestsOlderThanRestart"),
        xu(this, "inflightMutationsCount", 0),
        xu(this, "inflightActionsCount", 0),
        (this.inflightRequests = new Map()),
        (this.requestsOlderThanRestart = new Set()));
    }
    request(n, i) {
      const u = new Promise((c) => {
        const s = i ? "Requested" : "NotSent";
        (this.inflightRequests.set(n.requestId, {
          message: n,
          status: { status: s, requestedAt: new Date(), onResult: c },
        }),
          n.type === "Mutation"
            ? this.inflightMutationsCount++
            : n.type === "Action" && this.inflightActionsCount++);
      });
      return (this.markConnectionStateDirty(), u);
    }
    onResponse(n) {
      const i = this.inflightRequests.get(n.requestId);
      if (i === void 0 || i.status.status === "Completed") return null;
      const u = i.message.type === "Mutation" ? "mutation" : "action",
        c = i.message.udfPath;
      for (const v of n.logLines) Ju(this.logger, "info", u, c, v);
      const s = i.status;
      let h, d;
      if (n.success)
        ((h = { success: !0, logLines: n.logLines, value: mi(n.result) }),
          (d = () => s.onResult(h)));
      else {
        const v = n.result,
          { errorData: b } = n;
        (Ju(this.logger, "error", u, c, v),
          (h = {
            success: !1,
            errorMessage: v,
            errorData: b !== void 0 ? mi(b) : void 0,
            logLines: n.logLines,
          }),
          (d = () => s.onResult(h)));
      }
      return n.type === "ActionResponse" || !n.success
        ? (d(),
          this.inflightRequests.delete(n.requestId),
          this.requestsOlderThanRestart.delete(n.requestId),
          i.message.type === "Action"
            ? this.inflightActionsCount--
            : i.message.type === "Mutation" && this.inflightMutationsCount--,
          this.markConnectionStateDirty(),
          { requestId: n.requestId, result: h })
        : ((i.status = {
            status: "Completed",
            result: h,
            ts: n.ts,
            onResolve: d,
          }),
          null);
    }
    removeCompleted(n) {
      const i = new Map();
      for (const [u, c] of this.inflightRequests.entries()) {
        const s = c.status;
        s.status === "Completed" &&
          s.ts.lessThanOrEqual(n) &&
          (s.onResolve(),
          i.set(u, s.result),
          c.message.type === "Mutation"
            ? this.inflightMutationsCount--
            : c.message.type === "Action" && this.inflightActionsCount--,
          this.inflightRequests.delete(u),
          this.requestsOlderThanRestart.delete(u));
      }
      return (i.size > 0 && this.markConnectionStateDirty(), i);
    }
    restart() {
      this.requestsOlderThanRestart = new Set(this.inflightRequests.keys());
      const n = [];
      for (const [i, u] of this.inflightRequests) {
        if (u.status.status === "NotSent") {
          ((u.status.status = "Requested"), n.push(u.message));
          continue;
        }
        if (u.message.type === "Mutation") n.push(u.message);
        else if (u.message.type === "Action") {
          if (
            (this.inflightRequests.delete(i),
            this.requestsOlderThanRestart.delete(i),
            this.inflightActionsCount--,
            u.status.status === "Completed")
          )
            throw new Error("Action should never be in 'Completed' state");
          u.status.onResult({
            success: !1,
            errorMessage: "Connection lost while action was in flight",
            logLines: [],
          });
        }
      }
      return (this.markConnectionStateDirty(), n);
    }
    resume() {
      const n = [];
      for (const [, i] of this.inflightRequests)
        if (i.status.status === "NotSent") {
          ((i.status.status = "Requested"), n.push(i.message));
          continue;
        }
      return n;
    }
    hasIncompleteRequests() {
      for (const n of this.inflightRequests.values())
        if (n.status.status === "Requested") return !0;
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
      let n = Date.now();
      for (const i of this.inflightRequests.values())
        i.status.status !== "Completed" &&
          i.status.requestedAt.getTime() < n &&
          (n = i.status.requestedAt.getTime());
      return new Date(n);
    }
    inflightMutations() {
      return this.inflightMutationsCount;
    }
    inflightActions() {
      return this.inflightActionsCount;
    }
  },
  Ku = Symbol.for("functionName"),
  kp = Symbol.for("toReferencePath");
function qp(n) {
  return n[kp] ?? null;
}
function Up(n) {
  return n.startsWith("function://");
}
function jp(n) {
  let i;
  if (typeof n == "string")
    Up(n) ? (i = { functionHandle: n }) : (i = { name: n });
  else if (n[Ku]) i = { name: n[Ku] };
  else {
    const u = qp(n);
    if (!u) throw new Error(`${n} is not a functionReference`);
    i = { reference: u };
  }
  return i;
}
function ya(n) {
  const i = jp(n);
  if (i.name === void 0)
    throw i.functionHandle !== void 0
      ? new Error(
          `Expected function reference like "api.file.func" or "internal.file.func", but received function handle ${i.functionHandle}`,
        )
      : i.reference !== void 0
        ? new Error(
            `Expected function reference in the current component like "api.file.func" or "internal.file.func", but received reference ${i.reference}`,
          )
        : new Error(
            `Expected function reference like "api.file.func" or "internal.file.func", but received ${JSON.stringify(i)}`,
          );
  if (typeof n == "string") return n;
  const u = n[Ku];
  if (!u) throw new Error(`${n} is not a functionReference`);
  return u;
}
function Jm(n = []) {
  return new Proxy(
    {},
    {
      get(i, u) {
        if (typeof u == "string") return Jm([...n, u]);
        if (u === Ku) {
          if (n.length < 2) {
            const h = ["api", ...n].join(".");
            throw new Error(
              `API path is expected to be of the form \`api.moduleName.functionName\`. Found: \`${h}\``,
            );
          }
          const c = n.slice(0, -1).join("/"),
            s = n[n.length - 1];
          return s === "default" ? c : c + ":" + s;
        } else return u === Symbol.toStringTag ? "FunctionReference" : void 0;
      },
    },
  );
}
var Zp = Jm(),
  xp = Object.defineProperty,
  Bp = (n, i, u) =>
    i in n
      ? xp(n, i, { enumerable: !0, configurable: !0, writable: !0, value: u })
      : (n[i] = u),
  Iu = (n, i, u) => Bp(n, typeof i != "symbol" ? i + "" : i, u),
  um = class Bs {
    constructor(i) {
      (Iu(this, "queryResults"),
        Iu(this, "modifiedQueries"),
        (this.queryResults = i),
        (this.modifiedQueries = []));
    }
    getQuery(i, ...u) {
      const c = Yn(u[0]),
        s = ya(i),
        h = this.queryResults.get(pa(s, c));
      if (h !== void 0) return Bs.queryValue(h.result);
    }
    getAllQueries(i) {
      const u = [],
        c = ya(i);
      for (const s of this.queryResults.values())
        s.udfPath === Sa(c) &&
          u.push({ args: s.args, value: Bs.queryValue(s.result) });
      return u;
    }
    setQuery(i, u, c) {
      const s = Yn(u),
        h = ya(i),
        d = pa(h, s);
      let v;
      c === void 0
        ? (v = void 0)
        : (v = { success: !0, value: c, logLines: [] });
      const b = { udfPath: h, args: s, result: v };
      (this.queryResults.set(d, b), this.modifiedQueries.push(d));
    }
    static queryValue(i) {
      if (i !== void 0) return i.success ? i.value : void 0;
    }
  },
  Qp = class {
    constructor() {
      (Iu(this, "queryResults"),
        Iu(this, "optimisticUpdates"),
        (this.queryResults = new Map()),
        (this.optimisticUpdates = []));
    }
    ingestQueryResultsFromServer(n, i) {
      this.optimisticUpdates = this.optimisticUpdates.filter(
        (h) => !i.has(h.mutationId),
      );
      const u = this.queryResults;
      this.queryResults = new Map(n);
      const c = new um(this.queryResults);
      for (const h of this.optimisticUpdates) h.update(c);
      const s = [];
      for (const [h, d] of this.queryResults) {
        const v = u.get(h);
        (v === void 0 || v.result !== d.result) && s.push(h);
      }
      return s;
    }
    applyOptimisticUpdate(n, i) {
      this.optimisticUpdates.push({ update: n, mutationId: i });
      const u = new um(this.queryResults);
      return (n(u), u.modifiedQueries);
    }
    rawQueryResult(n) {
      const i = this.queryResults.get(n);
      if (i !== void 0) return i.result;
    }
    queryResult(n) {
      const i = this.queryResults.get(n);
      if (i === void 0) return;
      const u = i.result;
      if (u !== void 0) {
        if (u.success) return u.value;
        throw u.errorData !== void 0
          ? xs(u, new Zs(si("query", i.udfPath, u)))
          : new Error(si("query", i.udfPath, u));
      }
    }
    hasQueryResult(n) {
      return this.queryResults.get(n) !== void 0;
    }
    queryLogs(n) {
      return this.queryResults.get(n)?.result?.logLines;
    }
  },
  $p = Object.defineProperty,
  Lp = (n, i, u) =>
    i in n
      ? $p(n, i, { enumerable: !0, configurable: !0, writable: !0, value: u })
      : (n[i] = u),
  Os = (n, i, u) => Lp(n, typeof i != "symbol" ? i + "" : i, u),
  bl = class Tn {
    constructor(i, u) {
      (Os(this, "low"),
        Os(this, "high"),
        Os(this, "__isUnsignedLong__"),
        (this.low = i | 0),
        (this.high = u | 0),
        (this.__isUnsignedLong__ = !0));
    }
    static isLong(i) {
      return (i && i.__isUnsignedLong__) === !0;
    }
    static fromBytesLE(i) {
      return new Tn(
        i[0] | (i[1] << 8) | (i[2] << 16) | (i[3] << 24),
        i[4] | (i[5] << 8) | (i[6] << 16) | (i[7] << 24),
      );
    }
    toBytesLE() {
      const i = this.high,
        u = this.low;
      return [
        u & 255,
        (u >>> 8) & 255,
        (u >>> 16) & 255,
        u >>> 24,
        i & 255,
        (i >>> 8) & 255,
        (i >>> 16) & 255,
        i >>> 24,
      ];
    }
    static fromNumber(i) {
      return isNaN(i) || i < 0
        ? rm
        : i >= Hp
          ? Vp
          : new Tn((i % hl) | 0, (i / hl) | 0);
    }
    toString() {
      return (BigInt(this.high) * BigInt(hl) + BigInt(this.low)).toString();
    }
    equals(i) {
      return (
        Tn.isLong(i) || (i = Tn.fromValue(i)),
        this.high >>> 31 === 1 && i.high >>> 31 === 1
          ? !1
          : this.high === i.high && this.low === i.low
      );
    }
    notEquals(i) {
      return !this.equals(i);
    }
    comp(i) {
      return (
        Tn.isLong(i) || (i = Tn.fromValue(i)),
        this.equals(i)
          ? 0
          : i.high >>> 0 > this.high >>> 0 ||
              (i.high === this.high && i.low >>> 0 > this.low >>> 0)
            ? -1
            : 1
      );
    }
    lessThanOrEqual(i) {
      return this.comp(i) <= 0;
    }
    static fromValue(i) {
      return typeof i == "number" ? Tn.fromNumber(i) : new Tn(i.low, i.high);
    }
  },
  rm = new bl(0, 0),
  om = 65536,
  hl = om * om,
  Hp = hl * hl,
  Vp = new bl(-1, -1),
  Gp = Object.defineProperty,
  Yp = (n, i, u) =>
    i in n
      ? Gp(n, i, { enumerable: !0, configurable: !0, writable: !0, value: u })
      : (n[i] = u),
  Bu = (n, i, u) => Yp(n, typeof i != "symbol" ? i + "" : i, u),
  sm = class {
    constructor(n, i) {
      (Bu(this, "version"),
        Bu(this, "remoteQuerySet"),
        Bu(this, "queryPath"),
        Bu(this, "logger"),
        (this.version = { querySet: 0, ts: bl.fromNumber(0), identity: 0 }),
        (this.remoteQuerySet = new Map()),
        (this.queryPath = n),
        (this.logger = i));
    }
    transition(n) {
      const i = n.startVersion;
      if (
        this.version.querySet !== i.querySet ||
        this.version.ts.notEquals(i.ts) ||
        this.version.identity !== i.identity
      )
        throw new Error(
          `Invalid start version: ${i.ts.toString()}:${i.querySet}:${i.identity}, transitioning from ${this.version.ts.toString()}:${this.version.querySet}:${this.version.identity}`,
        );
      for (const u of n.modifications)
        switch (u.type) {
          case "QueryUpdated": {
            const c = this.queryPath(u.queryId);
            if (c)
              for (const h of u.logLines)
                Ju(this.logger, "info", "query", c, h);
            const s = mi(u.value ?? null);
            this.remoteQuerySet.set(u.queryId, {
              success: !0,
              value: s,
              logLines: u.logLines,
            });
            break;
          }
          case "QueryFailed": {
            const c = this.queryPath(u.queryId);
            if (c)
              for (const h of u.logLines)
                Ju(this.logger, "info", "query", c, h);
            const { errorData: s } = u;
            this.remoteQuerySet.set(u.queryId, {
              success: !1,
              errorMessage: u.errorMessage,
              errorData: s !== void 0 ? mi(s) : void 0,
              logLines: u.logLines,
            });
            break;
          }
          case "QueryRemoved":
            this.remoteQuerySet.delete(u.queryId);
            break;
          default:
            throw new Error(`Invalid modification ${u.type}`);
        }
      this.version = n.endVersion;
    }
    remoteQueryResults() {
      return this.remoteQuerySet;
    }
    timestamp() {
      return this.version.ts;
    }
  };
function Rs(n) {
  const i = vl(n);
  return bl.fromBytesLE(Array.from(i));
}
function Xp(n) {
  const i = new Uint8Array(n.toBytesLE());
  return gl(i);
}
function cm(n) {
  switch (n.type) {
    case "FatalError":
    case "AuthError":
    case "ActionResponse":
    case "TransitionChunk":
    case "Ping":
      return { ...n };
    case "MutationResponse":
      return n.success ? { ...n, ts: Rs(n.ts) } : { ...n };
    case "Transition":
      return {
        ...n,
        startVersion: { ...n.startVersion, ts: Rs(n.startVersion.ts) },
        endVersion: { ...n.endVersion, ts: Rs(n.endVersion.ts) },
      };
    default:
  }
}
function Jp(n) {
  switch (n.type) {
    case "Authenticate":
    case "ModifyQuerySet":
    case "Mutation":
    case "Action":
    case "Event":
      return { ...n };
    case "Connect":
      return n.maxObservedTimestamp !== void 0
        ? { ...n, maxObservedTimestamp: Xp(n.maxObservedTimestamp) }
        : { ...n, maxObservedTimestamp: void 0 };
    default:
  }
}
var Kp = Object.defineProperty,
  Ip = (n, i, u) =>
    i in n
      ? Kp(n, i, { enumerable: !0, configurable: !0, writable: !0, value: u })
      : (n[i] = u),
  Je = (n, i, u) => Ip(n, typeof i != "symbol" ? i + "" : i, u),
  Fp = 1e3,
  Wp = 1001,
  Pp = 1005,
  e0 = 4040,
  Yu;
function oi() {
  return (
    Yu === void 0 && (Yu = Date.now()),
    typeof performance > "u" || !performance.now
      ? Date.now()
      : Math.round(Yu + performance.now())
  );
}
function fm() {
  return `t=${Math.round((oi() - Yu) / 100) / 10}s`;
}
var Km = {
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
function t0(n) {
  if (n === void 0) return "Unknown";
  for (const i of Object.keys(Km)) if (n.startsWith(i)) return i;
  return "Unknown";
}
var n0 = class {
  constructor(n, i, u, c, s, h) {
    ((this.markConnectionStateDirty = s),
      (this.debug = h),
      Je(this, "socket"),
      Je(this, "connectionCount"),
      Je(this, "_hasEverConnected", !1),
      Je(this, "lastCloseReason"),
      Je(this, "transitionChunkBuffer", null),
      Je(this, "defaultInitialBackoff"),
      Je(this, "maxBackoff"),
      Je(this, "retries"),
      Je(this, "serverInactivityThreshold"),
      Je(this, "reconnectDueToServerInactivityTimeout"),
      Je(this, "scheduledReconnect", null),
      Je(this, "networkOnlineHandler", null),
      Je(this, "pendingNetworkRecoveryInfo", null),
      Je(this, "uri"),
      Je(this, "onOpen"),
      Je(this, "onResume"),
      Je(this, "onMessage"),
      Je(this, "webSocketConstructor"),
      Je(this, "logger"),
      Je(this, "onServerDisconnectError"),
      (this.webSocketConstructor = u),
      (this.socket = { state: "disconnected" }),
      (this.connectionCount = 0),
      (this.lastCloseReason = "InitialConnect"),
      (this.defaultInitialBackoff = 1e3),
      (this.maxBackoff = 16e3),
      (this.retries = 0),
      (this.serverInactivityThreshold = 6e4),
      (this.reconnectDueToServerInactivityTimeout = null),
      (this.uri = n),
      (this.onOpen = i.onOpen),
      (this.onResume = i.onResume),
      (this.onMessage = i.onMessage),
      (this.onServerDisconnectError = i.onServerDisconnectError),
      (this.logger = c),
      this.setupNetworkListener(),
      this.connect());
  }
  setSocketState(n) {
    ((this.socket = n),
      this._logVerbose(
        `socket state changed: ${this.socket.state}, paused: ${"paused" in this.socket ? this.socket.paused : void 0}`,
      ),
      this.markConnectionStateDirty());
  }
  setupNetworkListener() {
    typeof window > "u" ||
      typeof window.addEventListener != "function" ||
      (this.networkOnlineHandler === null &&
        ((this.networkOnlineHandler = () => {
          (this._logVerbose("network online event detected"),
            this.tryReconnectImmediately());
        }),
        window.addEventListener("online", this.networkOnlineHandler),
        this._logVerbose("network online event listener registered")));
  }
  cleanupNetworkListener() {
    this.networkOnlineHandler &&
      typeof window < "u" &&
      typeof window.removeEventListener == "function" &&
      (window.removeEventListener("online", this.networkOnlineHandler),
      (this.networkOnlineHandler = null),
      this._logVerbose("network online event listener removed"));
  }
  assembleTransition(n) {
    if (
      n.partNumber < 0 ||
      n.partNumber >= n.totalParts ||
      n.totalParts === 0 ||
      (this.transitionChunkBuffer &&
        (this.transitionChunkBuffer.totalParts !== n.totalParts ||
          this.transitionChunkBuffer.transitionId !== n.transitionId))
    )
      throw (
        (this.transitionChunkBuffer = null),
        new Error("Invalid TransitionChunk")
      );
    if (
      (this.transitionChunkBuffer === null &&
        (this.transitionChunkBuffer = {
          chunks: [],
          totalParts: n.totalParts,
          transitionId: n.transitionId,
        }),
      n.partNumber !== this.transitionChunkBuffer.chunks.length)
    ) {
      const i = this.transitionChunkBuffer.chunks.length;
      throw (
        (this.transitionChunkBuffer = null),
        new Error(
          `TransitionChunk received out of order: expected part ${i}, got ${n.partNumber}`,
        )
      );
    }
    if (
      (this.transitionChunkBuffer.chunks.push(n.chunk),
      this.transitionChunkBuffer.chunks.length === n.totalParts)
    ) {
      const i = this.transitionChunkBuffer.chunks.join("");
      this.transitionChunkBuffer = null;
      const u = cm(JSON.parse(i));
      if (u.type !== "Transition")
        throw new Error(
          `Expected Transition, got ${u.type} after assembling chunks`,
        );
      return u;
    }
    return null;
  }
  connect() {
    if (this.socket.state === "terminated") return;
    if (this.socket.state !== "disconnected" && this.socket.state !== "stopped")
      throw new Error(
        "Didn't start connection from disconnected state: " + this.socket.state,
      );
    const n = new this.webSocketConstructor(this.uri);
    (this._logVerbose("constructed WebSocket"),
      this.setSocketState({ state: "connecting", ws: n, paused: "no" }),
      this.resetServerInactivityTimeout(),
      (n.onopen = () => {
        if (
          (this.logger.logVerbose("begin ws.onopen"),
          this.socket.state !== "connecting")
        )
          throw new Error("onopen called with socket not in connecting state");
        if (
          (this.setSocketState({
            state: "ready",
            ws: n,
            paused: this.socket.paused === "yes" ? "uninitialized" : "no",
          }),
          this.resetServerInactivityTimeout(),
          this.socket.paused === "no" &&
            ((this._hasEverConnected = !0),
            this.onOpen({
              connectionCount: this.connectionCount,
              lastCloseReason: this.lastCloseReason,
              clientTs: oi(),
            })),
          this.lastCloseReason !== "InitialConnect" &&
            (this.lastCloseReason
              ? this.logger.log(
                  "WebSocket reconnected at",
                  fm(),
                  "after disconnect due to",
                  this.lastCloseReason,
                )
              : this.logger.log("WebSocket reconnected at", fm())),
          (this.connectionCount += 1),
          (this.lastCloseReason = null),
          this.pendingNetworkRecoveryInfo !== null)
        ) {
          const { timeSavedMs: i } = this.pendingNetworkRecoveryInfo;
          ((this.pendingNetworkRecoveryInfo = null),
            this.sendMessage({
              type: "Event",
              eventType: "NetworkRecoveryReconnect",
              event: { timeSavedMs: i },
            }),
            this.logger.log(
              `Network recovery reconnect saved ~${Math.round(i / 1e3)}s of waiting`,
            ));
        }
      }),
      (n.onerror = (i) => {
        this.transitionChunkBuffer = null;
        const u = i.message;
        u && this.logger.log(`WebSocket error message: ${u}`);
      }),
      (n.onmessage = (i) => {
        this.resetServerInactivityTimeout();
        const u = i.data.length;
        let c = cm(JSON.parse(i.data));
        if (
          (this._logVerbose(`received ws message with type ${c.type}`),
          c.type !== "Ping")
        ) {
          if (c.type === "TransitionChunk") {
            const s = this.assembleTransition(c);
            if (!s) return;
            ((c = s),
              this._logVerbose(`assembled full ws message of type ${c.type}`));
          }
          (this.transitionChunkBuffer !== null &&
            ((this.transitionChunkBuffer = null),
            this.logger.log(
              `Received unexpected ${c.type} while buffering TransitionChunks`,
            )),
            c.type === "Transition" &&
              this.reportLargeTransition({ messageLength: u, transition: c }),
            this.onMessage(c).hasSyncedPastLastReconnect &&
              ((this.retries = 0), this.markConnectionStateDirty()));
        }
      }),
      (n.onclose = (i) => {
        if (
          (this._logVerbose("begin ws.onclose"),
          (this.transitionChunkBuffer = null),
          this.lastCloseReason === null &&
            (this.lastCloseReason = i.reason || `closed with code ${i.code}`),
          i.code !== Fp && i.code !== Wp && i.code !== Pp && i.code !== e0)
        ) {
          let c = `WebSocket closed with code ${i.code}`;
          (i.reason && (c += `: ${i.reason}`),
            this.logger.log(c),
            this.onServerDisconnectError &&
              i.reason &&
              this.onServerDisconnectError(c));
        }
        const u = t0(i.reason);
        this.scheduleReconnect(u);
      }));
  }
  socketState() {
    return this.socket.state;
  }
  sendMessage(n) {
    const i = {
      type: n.type,
      ...(n.type === "Authenticate" && n.tokenType === "User"
        ? { value: `...${n.value.slice(-7)}` }
        : {}),
    };
    if (this.socket.state === "ready" && this.socket.paused === "no") {
      const u = Jp(n),
        c = JSON.stringify(u);
      let s = !1;
      try {
        (this.socket.ws.send(c), (s = !0));
      } catch (h) {
        (this.logger.log(
          `Failed to send message on WebSocket, reconnecting: ${h}`,
        ),
          this.closeAndReconnect("FailedToSendMessage"));
      }
      return (
        this._logVerbose(
          `${s ? "sent" : "failed to send"} message with type ${n.type}: ${JSON.stringify(i)}`,
        ),
        !0
      );
    }
    return (
      this._logVerbose(
        `message not sent (socket state: ${this.socket.state}, paused: ${"paused" in this.socket ? this.socket.paused : void 0}): ${JSON.stringify(i)}`,
      ),
      !1
    );
  }
  resetServerInactivityTimeout() {
    this.socket.state !== "terminated" &&
      (this.reconnectDueToServerInactivityTimeout !== null &&
        (clearTimeout(this.reconnectDueToServerInactivityTimeout),
        (this.reconnectDueToServerInactivityTimeout = null)),
      (this.reconnectDueToServerInactivityTimeout = setTimeout(() => {
        this.closeAndReconnect("InactiveServer");
      }, this.serverInactivityThreshold)));
  }
  scheduleReconnect(n) {
    (this.scheduledReconnect &&
      (clearTimeout(this.scheduledReconnect.timeout),
      (this.scheduledReconnect = null)),
      (this.socket = { state: "disconnected" }));
    const i = this.nextBackoff(n);
    (this.markConnectionStateDirty(),
      this.logger.log(`Attempting reconnect in ${Math.round(i)}ms`));
    const u = oi(),
      c = setTimeout(() => {
        this.scheduledReconnect?.timeout === c &&
          ((this.scheduledReconnect = null), this.connect());
      }, i);
    this.scheduledReconnect = { timeout: c, scheduledAt: u, backoffMs: i };
  }
  closeAndReconnect(n) {
    switch (
      (this._logVerbose(`begin closeAndReconnect with reason ${n}`),
      this.socket.state)
    ) {
      case "disconnected":
      case "terminated":
      case "stopped":
        return;
      case "connecting":
      case "ready":
        ((this.lastCloseReason = n),
          this.close(),
          this.scheduleReconnect("client"));
        return;
      default:
        this.socket;
    }
  }
  close() {
    switch (((this.transitionChunkBuffer = null), this.socket.state)) {
      case "disconnected":
      case "terminated":
      case "stopped":
        return Promise.resolve();
      case "connecting": {
        const n = this.socket.ws;
        return (
          (n.onmessage = (i) => {
            this._logVerbose("Ignoring message received after close");
          }),
          new Promise((i) => {
            ((n.onclose = () => {
              (this._logVerbose("Closed after connecting"), i());
            }),
              (n.onopen = () => {
                (this._logVerbose("Opened after connecting"), n.close());
              }));
          })
        );
      }
      case "ready": {
        this._logVerbose("ws.close called");
        const n = this.socket.ws;
        n.onmessage = (u) => {
          this._logVerbose("Ignoring message received after close");
        };
        const i = new Promise((u) => {
          n.onclose = () => {
            u();
          };
        });
        return (n.close(), i);
      }
      default:
        return (this.socket, Promise.resolve());
    }
  }
  terminate() {
    switch (
      (this.reconnectDueToServerInactivityTimeout &&
        clearTimeout(this.reconnectDueToServerInactivityTimeout),
      this.scheduledReconnect &&
        (clearTimeout(this.scheduledReconnect.timeout),
        (this.scheduledReconnect = null)),
      this.cleanupNetworkListener(),
      this.socket.state)
    ) {
      case "terminated":
      case "stopped":
      case "disconnected":
      case "connecting":
      case "ready": {
        const n = this.close();
        return (this.setSocketState({ state: "terminated" }), n);
      }
      default:
        throw (
          this.socket,
          new Error(`Invalid websocket state: ${this.socket.state}`)
        );
    }
  }
  stop() {
    switch (this.socket.state) {
      case "terminated":
        return Promise.resolve();
      case "connecting":
      case "stopped":
      case "disconnected":
      case "ready": {
        this.cleanupNetworkListener();
        const n = this.close();
        return ((this.socket = { state: "stopped" }), n);
      }
      default:
        return (this.socket, Promise.resolve());
    }
  }
  tryRestart() {
    switch (this.socket.state) {
      case "stopped":
        break;
      case "terminated":
      case "connecting":
      case "ready":
      case "disconnected":
        this.logger.logVerbose("Restart called without stopping first");
        return;
      default:
        this.socket;
    }
    (this.setupNetworkListener(), this.connect());
  }
  pause() {
    switch (this.socket.state) {
      case "disconnected":
      case "stopped":
      case "terminated":
        return;
      case "connecting":
      case "ready":
        this.socket = { ...this.socket, paused: "yes" };
        return;
      default:
        this.socket;
        return;
    }
  }
  tryReconnectImmediately() {
    if (
      (this._logVerbose("tryReconnectImmediately called"),
      this.socket.state !== "disconnected")
    ) {
      this._logVerbose(
        `tryReconnectImmediately called but socket state is ${this.socket.state}, no action taken`,
      );
      return;
    }
    let n = null;
    if (this.scheduledReconnect) {
      const i = oi() - this.scheduledReconnect.scheduledAt;
      ((n = Math.max(0, this.scheduledReconnect.backoffMs - i)),
        this._logVerbose(
          `would have waited ${Math.round(n)}ms more (backoff was ${Math.round(this.scheduledReconnect.backoffMs)}ms, elapsed ${Math.round(i)}ms)`,
        ),
        clearTimeout(this.scheduledReconnect.timeout),
        (this.scheduledReconnect = null),
        this._logVerbose("canceled scheduled reconnect"));
    }
    (this.logger.log("Network recovery detected, reconnecting immediately"),
      (this.pendingNetworkRecoveryInfo =
        n !== null ? { timeSavedMs: n } : null),
      this.connect());
  }
  resume() {
    switch (this.socket.state) {
      case "connecting":
        this.socket = { ...this.socket, paused: "no" };
        return;
      case "ready":
        this.socket.paused === "uninitialized"
          ? ((this.socket = { ...this.socket, paused: "no" }),
            (this._hasEverConnected = !0),
            this.onOpen({
              connectionCount: this.connectionCount,
              lastCloseReason: this.lastCloseReason,
              clientTs: oi(),
            }))
          : this.socket.paused === "yes" &&
            ((this.socket = { ...this.socket, paused: "no" }), this.onResume());
        return;
      case "terminated":
      case "stopped":
      case "disconnected":
        return;
      default:
        this.socket;
    }
    this.connect();
  }
  connectionState() {
    return {
      isConnected: this.socket.state === "ready",
      hasEverConnected: this._hasEverConnected,
      connectionCount: this.connectionCount,
      connectionRetries: this.retries,
    };
  }
  _logVerbose(n) {
    this.logger.logVerbose(n);
  }
  nextBackoff(n) {
    const i =
      (n === "client"
        ? 100
        : n === "Unknown"
          ? this.defaultInitialBackoff
          : Km[n].timeout) * Math.pow(2, this.retries);
    this.retries += 1;
    const u = Math.min(i, this.maxBackoff);
    return u + u * (Math.random() - 0.5);
  }
  reportLargeTransition({ transition: n, messageLength: i }) {
    if (n.clientClockSkew === void 0 || n.serverTs === void 0) return;
    const u = oi() - n.clientClockSkew - n.serverTs / 1e6,
      c = `${Math.round(u)}ms`,
      s = `${Math.round(i / 1e4) / 100}MB`,
      h = i / (u / 1e3),
      d = `${Math.round(h / 1e4) / 100}MB per second`;
    (this._logVerbose(`received ${s} transition in ${c} at ${d}`),
      i > 2e7
        ? this.logger.log(
            `received query results totaling more that 20MB (${s}) which will take a long time to download on slower connections`,
          )
        : u > 2e4 &&
          this.logger.log(
            `received query results totaling ${s} which took more than 20s to arrive (${c})`,
          ),
      this.debug &&
        this.sendMessage({
          type: "Event",
          eventType: "ClientReceivedTransition",
          event: { transitionTransitTime: u, messageLength: i },
        }));
  }
};
function a0() {
  return i0();
}
function i0() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (n) => {
    const i = (Math.random() * 16) | 0;
    return (n === "x" ? i : (i & 3) | 8).toString(16);
  });
}
var cl = class extends Error {};
cl.prototype.name = "InvalidTokenError";
function l0(n) {
  return decodeURIComponent(
    atob(n).replace(/(.)/g, (i, u) => {
      let c = u.charCodeAt(0).toString(16).toUpperCase();
      return (c.length < 2 && (c = "0" + c), "%" + c);
    }),
  );
}
function u0(n) {
  let i = n.replace(/-/g, "+").replace(/_/g, "/");
  switch (i.length % 4) {
    case 0:
      break;
    case 2:
      i += "==";
      break;
    case 3:
      i += "=";
      break;
    default:
      throw new Error("base64 string is not of the correct length");
  }
  try {
    return l0(i);
  } catch {
    return atob(i);
  }
}
function Im(n, i) {
  if (typeof n != "string")
    throw new cl("Invalid token specified: must be a string");
  i || (i = {});
  const u = i.header === !0 ? 0 : 1,
    c = n.split(".")[u];
  if (typeof c != "string")
    throw new cl(`Invalid token specified: missing part #${u + 1}`);
  let s;
  try {
    s = u0(c);
  } catch (h) {
    throw new cl(
      `Invalid token specified: invalid base64 for part #${u + 1} (${h.message})`,
    );
  }
  try {
    return JSON.parse(s);
  } catch (h) {
    throw new cl(
      `Invalid token specified: invalid json for part #${u + 1} (${h.message})`,
    );
  }
}
var r0 = Object.defineProperty,
  o0 = (n, i, u) =>
    i in n
      ? r0(n, i, { enumerable: !0, configurable: !0, writable: !0, value: u })
      : (n[i] = u),
  yt = (n, i, u) => o0(n, typeof i != "symbol" ? i + "" : i, u),
  s0 = 480 * 60 * 60 * 1e3,
  hm = 2,
  c0 = class {
    constructor(n, i, u) {
      (yt(this, "authState", { state: "noAuth" }),
        yt(this, "configVersion", 0),
        yt(this, "syncState"),
        yt(this, "authenticate"),
        yt(this, "stopSocket"),
        yt(this, "tryRestartSocket"),
        yt(this, "pauseSocket"),
        yt(this, "resumeSocket"),
        yt(this, "clearAuth"),
        yt(this, "logger"),
        yt(this, "refreshTokenLeewaySeconds"),
        yt(this, "initialAuthTokenReuse"),
        yt(this, "lastRefreshChange"),
        yt(this, "tokenConfirmationAttempts", 0),
        (this.syncState = n),
        (this.authenticate = i.authenticate),
        (this.stopSocket = i.stopSocket),
        (this.tryRestartSocket = i.tryRestartSocket),
        (this.pauseSocket = i.pauseSocket),
        (this.resumeSocket = i.resumeSocket),
        (this.clearAuth = i.clearAuth),
        (this.logger = u.logger),
        (this.refreshTokenLeewaySeconds = u.refreshTokenLeewaySeconds),
        (this.initialAuthTokenReuse = u.initialAuthTokenReuse),
        (this.lastRefreshChange = !1));
    }
    notifyRefreshChange(n) {
      this.authState.state !== "noAuth" &&
        this.authState.state !== "initialRefetch" &&
        this.authState.config.onRefreshChange &&
        this.lastRefreshChange !== n &&
        ((this.lastRefreshChange = n),
        this.authState.config.onRefreshChange(n));
    }
    async setConfig(n, i, u) {
      (this.resetAuthState(),
        this._logVerbose("pausing WS for auth token fetch"),
        this.pauseSocket());
      const c = await this.fetchTokenAndGuardAgainstRace(n, {
        forceRefreshToken: !1,
      });
      if (c.isFromOutdatedConfig) return;
      const s = { fetchToken: n, onAuthChange: i, onRefreshChange: u };
      (c.value
        ? (this.setAuthState({
            state: "waitingForServerConfirmationOfCachedToken",
            config: s,
            hasRetried: !1,
          }),
          this.authenticate(c.value))
        : (this.setAuthState({ state: "initialRefetch", config: s }),
          await this.refetchToken()),
        this._logVerbose("resuming WS after auth token fetch"),
        this.resumeSocket());
    }
    onTransition(n) {
      if (
        this.syncState.isCurrentOrNewerAuthVersion(n.endVersion.identity) &&
        !(n.endVersion.identity <= n.startVersion.identity)
      ) {
        if (
          (this._logVerbose(
            `auth state is ${this.authState.state} when handling transition`,
          ),
          this.syncState.markAuthCompletion(),
          this.authState.state === "waitingForServerConfirmationOfCachedToken")
        ) {
          this._logVerbose("server confirmed auth token is valid");
          const i = this.syncState.getAuth()?.value;
          (this.initialAuthTokenReuse && i
            ? this.scheduleTokenRefetch(i, n.clientClockSkew)
            : this.refetchToken(),
            this.authState.config.onAuthChange(!0));
          return;
        }
        this.authState.state === "waitingForServerConfirmationOfFreshToken" &&
          (this._logVerbose("server confirmed new auth token is valid"),
          this.notifyRefreshChange(!1),
          this.scheduleTokenRefetch(this.authState.token),
          (this.tokenConfirmationAttempts = 0),
          this.authState.hadAuth || this.authState.config.onAuthChange(!0));
      }
    }
    onAuthError(n) {
      if (
        n.authUpdateAttempted === !1 &&
        (this.authState.state === "waitingForServerConfirmationOfFreshToken" ||
          this.authState.state === "waitingForServerConfirmationOfCachedToken")
      ) {
        this._logVerbose("ignoring non-auth token expired error");
        return;
      }
      const { baseVersion: i } = n;
      if (!this.syncState.isCurrentOrNewerAuthVersion(i + 1)) {
        this._logVerbose("ignoring auth error for previous auth attempt");
        return;
      }
      this.tryToReauthenticate(n);
    }
    async tryToReauthenticate(n) {
      if (
        (this._logVerbose(`attempting to reauthenticate: ${n.error}`),
        this.authState.state === "noAuth" ||
          (this.authState.state ===
            "waitingForServerConfirmationOfFreshToken" &&
            this.tokenConfirmationAttempts >= hm))
      ) {
        (this.logger.error(
          `Failed to authenticate: "${n.error}", check your server auth config`,
        ),
          this.syncState.hasAuth() && this.syncState.clearAuth(),
          this.authState.state !== "noAuth" &&
            this.setAndReportAuthFailed(this.authState.config.onAuthChange));
        return;
      }
      if (
        (this.authState.state === "waitingForServerConfirmationOfFreshToken" &&
          (this.tokenConfirmationAttempts++,
          this._logVerbose(
            `retrying reauthentication, ${hm - this.tokenConfirmationAttempts} attempts remaining`,
          )),
        this.notifyRefreshChange(!0),
        await this.stopSocket(),
        this.authState.state === "noAuth")
      )
        return;
      const i = await this.fetchTokenAndGuardAgainstRace(
        this.authState.config.fetchToken,
        { forceRefreshToken: !0 },
      );
      i.isFromOutdatedConfig ||
        (i.value && this.syncState.isNewAuth(i.value)
          ? (this.authenticate(i.value),
            this.setAuthState({
              state: "waitingForServerConfirmationOfFreshToken",
              config: this.authState.config,
              token: i.value,
              hadAuth:
                this.authState.state === "notRefetching" ||
                this.authState.state === "waitingForScheduledRefetch",
            }))
          : (this._logVerbose(
              "reauthentication failed, could not fetch a new token",
            ),
            this.syncState.hasAuth() && this.syncState.clearAuth(),
            this.setAndReportAuthFailed(this.authState.config.onAuthChange)),
        this.tryRestartSocket());
    }
    async refetchToken() {
      if (this.authState.state === "noAuth") return;
      this._logVerbose("refetching auth token");
      const n = await this.fetchTokenAndGuardAgainstRace(
        this.authState.config.fetchToken,
        { forceRefreshToken: !0 },
      );
      n.isFromOutdatedConfig ||
        (n.value
          ? this.syncState.isNewAuth(n.value)
            ? (this.setAuthState({
                state: "waitingForServerConfirmationOfFreshToken",
                hadAuth: this.syncState.hasAuth(),
                token: n.value,
                config: this.authState.config,
              }),
              this.authenticate(n.value))
            : this.setAuthState({
                state: "notRefetching",
                config: this.authState.config,
              })
          : (this._logVerbose("refetching token failed"),
            this.syncState.hasAuth() && this.clearAuth(),
            this.setAndReportAuthFailed(this.authState.config.onAuthChange)),
        this._logVerbose(
          "restarting WS after auth token fetch (if currently stopped)",
        ),
        this.tryRestartSocket());
    }
    scheduleTokenRefetch(n, i) {
      if (this.authState.state === "noAuth") return;
      const u = this.decodeToken(n);
      if (!u) {
        this.logger.error(
          "Auth token is not a valid JWT, cannot refetch the token",
        );
        return;
      }
      const { iat: c, exp: s } = u;
      if (!c || !s) {
        this.logger.error(
          "Auth token does not have required fields, cannot refetch the token",
        );
        return;
      }
      const h = s - c;
      if (h <= 2) {
        this.logger.error(
          "Auth token does not live long enough, cannot refetch the token",
        );
        return;
      }
      let d;
      i !== void 0
        ? ((d = s - (Date.now() - i) / 1e3), d <= 0 && (d = 0))
        : (d = h);
      let v = Math.min(s0, (d - this.refreshTokenLeewaySeconds) * 1e3);
      v <= 0 &&
        (this.logger.warn(
          `Refetching auth token immediately, configured leeway ${this.refreshTokenLeewaySeconds}s is larger than the token's lifetime ${d}s`,
        ),
        (v = 0));
      const b = setTimeout(() => {
        (this._logVerbose("running scheduled token refetch"),
          this.refetchToken());
      }, v);
      (this.setAuthState({
        state: "waitingForScheduledRefetch",
        refetchTokenTimeoutId: b,
        config: this.authState.config,
      }),
        this._logVerbose(
          `scheduled preemptive auth token refetching in ${v}ms`,
        ));
    }
    async fetchTokenAndGuardAgainstRace(n, i) {
      const u = ++this.configVersion;
      this._logVerbose(`fetching token with config version ${u}`);
      const c = await n(i);
      return this.configVersion !== u
        ? (this._logVerbose(
            `stale config version, expected ${u}, got ${this.configVersion}`,
          ),
          { isFromOutdatedConfig: !0 })
        : { isFromOutdatedConfig: !1, value: c };
    }
    stop() {
      (this.resetAuthState(),
        this.configVersion++,
        this._logVerbose(`config version bumped to ${this.configVersion}`));
    }
    setAndReportAuthFailed(n) {
      (n(!1), this.resetAuthState());
    }
    resetAuthState() {
      (this.notifyRefreshChange(!1), this.setAuthState({ state: "noAuth" }));
    }
    setAuthState(n) {
      const i =
        n.state === "waitingForServerConfirmationOfFreshToken"
          ? {
              hadAuth: n.hadAuth,
              state: n.state,
              token: `...${n.token.slice(-7)}`,
            }
          : { state: n.state };
      switch (
        (this._logVerbose(`setting auth state to ${JSON.stringify(i)}`),
        n.state)
      ) {
        case "waitingForScheduledRefetch":
        case "notRefetching":
        case "noAuth":
          this.tokenConfirmationAttempts = 0;
          break;
        case "waitingForServerConfirmationOfFreshToken":
        case "waitingForServerConfirmationOfCachedToken":
        case "initialRefetch":
          break;
        default:
      }
      (this.authState.state === "waitingForScheduledRefetch" &&
        clearTimeout(this.authState.refetchTokenTimeoutId),
        (this.authState = n));
    }
    decodeToken(n) {
      try {
        return Im(n);
      } catch (i) {
        return (
          this._logVerbose(
            `Error decoding token: ${i instanceof Error ? i.message : "Unknown error"}`,
          ),
          null
        );
      }
    }
    _logVerbose(n) {
      this.logger.logVerbose(`${n} [v${this.configVersion}]`);
    }
  },
  f0 = [
    "convexClientConstructed",
    "convexWebSocketOpen",
    "convexFirstMessageReceived",
  ];
function h0(n, i) {
  const u = { sessionId: i };
  typeof performance > "u" ||
    !performance.mark ||
    performance.mark(n, { detail: u });
}
function d0(n) {
  let i = n.name.slice(6);
  return (
    (i = i.charAt(0).toLowerCase() + i.slice(1)),
    { name: i, startTime: n.startTime }
  );
}
function m0(n) {
  if (typeof performance > "u" || !performance.getEntriesByName) return [];
  const i = [];
  for (const u of f0) {
    const c = performance
      .getEntriesByName(u)
      .filter((s) => s.entryType === "mark")
      .filter((s) => s.detail.sessionId === n);
    i.push(...c);
  }
  return i.map(d0);
}
var v0 = Object.defineProperty,
  g0 = (n, i, u) =>
    i in n
      ? v0(n, i, { enumerable: !0, configurable: !0, writable: !0, value: u })
      : (n[i] = u),
  Ke = (n, i, u) => g0(n, typeof i != "symbol" ? i + "" : i, u),
  y0 = class {
    constructor(n, i, u) {
      if (
        (Ke(this, "address"),
        Ke(this, "state"),
        Ke(this, "requestManager"),
        Ke(this, "webSocketManager"),
        Ke(this, "authenticationManager"),
        Ke(this, "remoteQuerySet"),
        Ke(this, "optimisticQueryResults"),
        Ke(this, "_transitionHandlerCounter", 0),
        Ke(this, "_nextRequestId"),
        Ke(this, "_onTransitionFns", new Map()),
        Ke(this, "_sessionId"),
        Ke(this, "firstMessageReceived", !1),
        Ke(this, "debug"),
        Ke(this, "logger"),
        Ke(this, "maxObservedTimestamp"),
        Ke(this, "connectionStateSubscribers", new Map()),
        Ke(this, "nextConnectionStateSubscriberId", 0),
        Ke(this, "_lastPublishedConnectionState"),
        Ke(this, "markConnectionStateDirty", () => {
          Promise.resolve().then(() => {
            const w = this.connectionState();
            if (
              JSON.stringify(w) !==
              JSON.stringify(this._lastPublishedConnectionState)
            ) {
              this._lastPublishedConnectionState = w;
              for (const x of this.connectionStateSubscribers.values()) x(w);
            }
          });
        }),
        Ke(this, "mark", (w) => {
          this.debug && h0(w, this.sessionId);
        }),
        typeof n == "object")
      )
        throw new Error(
          "Passing a ClientConfig object is no longer supported. Pass the URL of the Convex deployment as a string directly.",
        );
      (u?.skipConvexDeploymentUrlCheck !== !0 && cp(n), (u = { ...u }));
      const c = u.authRefreshTokenLeewaySeconds ?? 10;
      let s = u.webSocketConstructor;
      if (!s && typeof WebSocket > "u")
        throw new Error(
          "No WebSocket global variable defined! To use Convex in an environment without WebSocket try the HTTP client: https://docs.convex.dev/api/classes/browser.ConvexHttpClient",
        );
      ((s = s || WebSocket),
        (this.debug = u.reportDebugInfoToConvex ?? !1),
        (this.address = n),
        (this.logger =
          u.logger === !1
            ? Xm({ verbose: u.verbose ?? !1 })
            : u.logger !== !0 && u.logger
              ? u.logger
              : Ym({ verbose: u.verbose ?? !1 })));
      const h = n.search("://");
      if (h === -1)
        throw new Error("Provided address was not an absolute URL.");
      const d = n.substring(h + 3),
        v = n.substring(0, h);
      let b;
      if (v === "http") b = "ws";
      else if (v === "https") b = "wss";
      else throw new Error(`Unknown parent protocol ${v}`);
      const z = `${b}://${d}/api/${am}/sync`;
      ((this.state = new Cp()),
        (this.remoteQuerySet = new sm(
          (w) => this.state.queryPath(w),
          this.logger,
        )),
        (this.requestManager = new Dp(
          this.logger,
          this.markConnectionStateDirty,
        )));
      const _ = () => {
        (this.webSocketManager.pause(), this.state.pause());
      };
      ((this.authenticationManager = new c0(
        this.state,
        {
          authenticate: (w) => {
            const x = this.state.setAuth(w);
            return (this.webSocketManager.sendMessage(x), x.baseVersion);
          },
          stopSocket: () => this.webSocketManager.stop(),
          tryRestartSocket: () => this.webSocketManager.tryRestart(),
          pauseSocket: _,
          resumeSocket: () => this.webSocketManager.resume(),
          clearAuth: () => {
            this.clearAuth();
          },
        },
        {
          logger: this.logger,
          refreshTokenLeewaySeconds: c,
          initialAuthTokenReuse: u.initialAuthTokenReuse ?? !1,
        },
      )),
        (this.optimisticQueryResults = new Qp()),
        this.addOnTransitionHandler((w) => {
          i(w.queries.map((x) => x.token));
        }),
        (this._nextRequestId = 0),
        (this._sessionId = a0()));
      const { unsavedChangesWarning: q } = u;
      if (typeof window > "u" || typeof window.addEventListener > "u") {
        if (q === !0)
          throw new Error(
            "unsavedChangesWarning requested, but window.addEventListener not found! Remove {unsavedChangesWarning: true} from Convex client options.",
          );
      } else
        q !== !1 &&
          window.addEventListener("beforeunload", (w) => {
            if (this.requestManager.hasIncompleteRequests()) {
              w.preventDefault();
              const x =
                "Are you sure you want to leave? Your changes may not be saved.";
              return (((w || window.event).returnValue = x), x);
            }
          });
      ((this.webSocketManager = new n0(
        z,
        {
          onOpen: (w) => {
            (this.mark("convexWebSocketOpen"),
              this.webSocketManager.sendMessage({
                ...w,
                type: "Connect",
                sessionId: this._sessionId,
                maxObservedTimestamp: this.maxObservedTimestamp,
              }),
              (this.remoteQuerySet = new sm(
                (Te) => this.state.queryPath(Te),
                this.logger,
              )));
            const [x, K] = this.state.restart();
            (K && this.webSocketManager.sendMessage(K),
              this.webSocketManager.sendMessage(x));
            for (const Te of this.requestManager.restart())
              this.webSocketManager.sendMessage(Te);
          },
          onResume: () => {
            const [w, x] = this.state.resume();
            (x && this.webSocketManager.sendMessage(x),
              w && this.webSocketManager.sendMessage(w));
            for (const K of this.requestManager.resume())
              this.webSocketManager.sendMessage(K);
          },
          onMessage: (w) => {
            switch (
              (this.firstMessageReceived ||
                ((this.firstMessageReceived = !0),
                this.mark("convexFirstMessageReceived"),
                this.reportMarks()),
              w.type)
            ) {
              case "Transition": {
                (this.observedTimestamp(w.endVersion.ts),
                  this.authenticationManager.onTransition(w),
                  this.remoteQuerySet.transition(w),
                  this.state.transition(w));
                const x = this.requestManager.removeCompleted(
                  this.remoteQuerySet.timestamp(),
                );
                this.notifyOnQueryResultChanges(x);
                break;
              }
              case "MutationResponse": {
                w.success && this.observedTimestamp(w.ts);
                const x = this.requestManager.onResponse(w);
                x !== null &&
                  this.notifyOnQueryResultChanges(
                    new Map([[x.requestId, x.result]]),
                  );
                break;
              }
              case "ActionResponse":
                this.requestManager.onResponse(w);
                break;
              case "AuthError":
                this.authenticationManager.onAuthError(w);
                break;
              case "FatalError": {
                const x = wp(this.logger, w.error);
                throw (this.webSocketManager.terminate(), x);
              }
              default:
            }
            return {
              hasSyncedPastLastReconnect: this.hasSyncedPastLastReconnect(),
            };
          },
          onServerDisconnectError: u.onServerDisconnectError,
        },
        s,
        this.logger,
        this.markConnectionStateDirty,
        this.debug,
      )),
        this.mark("convexClientConstructed"),
        u.expectAuth && _());
    }
    hasSyncedPastLastReconnect() {
      return (
        this.requestManager.hasSyncedPastLastReconnect() &&
        this.state.hasSyncedPastLastReconnect()
      );
    }
    observedTimestamp(n) {
      (this.maxObservedTimestamp === void 0 ||
        this.maxObservedTimestamp.lessThanOrEqual(n)) &&
        (this.maxObservedTimestamp = n);
    }
    getMaxObservedTimestamp() {
      return this.maxObservedTimestamp;
    }
    notifyOnQueryResultChanges(n) {
      const i = this.remoteQuerySet.remoteQueryResults(),
        u = new Map();
      for (const [s, h] of i) {
        const d = this.state.queryToken(s);
        if (d !== null) {
          const v = {
            result: h,
            udfPath: this.state.queryPath(s),
            args: this.state.queryArgs(s),
          };
          u.set(d, v);
        }
      }
      const c = this.optimisticQueryResults.ingestQueryResultsFromServer(
        u,
        new Set(n.keys()),
      );
      this.handleTransition({
        queries: c.map((s) => ({
          token: s,
          modification: {
            kind: "Updated",
            result: this.optimisticQueryResults.rawQueryResult(s),
          },
        })),
        reflectedMutations: Array.from(n).map(([s, h]) => ({
          requestId: s,
          result: h,
        })),
        timestamp: this.remoteQuerySet.timestamp(),
      });
    }
    handleTransition(n) {
      for (const i of this._onTransitionFns.values()) i(n);
    }
    addOnTransitionHandler(n) {
      const i = this._transitionHandlerCounter++;
      return (
        this._onTransitionFns.set(i, n),
        () => this._onTransitionFns.delete(i)
      );
    }
    getCurrentAuthClaims() {
      const n = this.state.getAuth();
      let i = {};
      if (n && n.tokenType === "User")
        try {
          i = n ? Im(n.value) : {};
        } catch {
          i = {};
        }
      else return;
      return { token: n.value, decoded: i };
    }
    setAuth(n, i, u) {
      this.authenticationManager.setConfig(n, i, u);
    }
    hasAuth() {
      return this.state.hasAuth();
    }
    setAdminAuth(n, i) {
      const u = this.state.setAdminAuth(n, i);
      this.webSocketManager.sendMessage(u);
    }
    clearAuth() {
      const n = this.state.clearAuth();
      this.webSocketManager.sendMessage(n);
    }
    subscribe(n, i, u) {
      const c = Yn(i),
        {
          modification: s,
          queryToken: h,
          unsubscribe: d,
        } = this.state.subscribe(n, c, u?.journal, u?.componentPath);
      return (
        s !== null && this.webSocketManager.sendMessage(s),
        {
          queryToken: h,
          unsubscribe: () => {
            const v = d();
            v && this.webSocketManager.sendMessage(v);
          },
        }
      );
    }
    localQueryResult(n, i) {
      const u = pa(n, Yn(i));
      return this.optimisticQueryResults.queryResult(u);
    }
    localQueryResultByToken(n) {
      return this.optimisticQueryResults.queryResult(n);
    }
    hasLocalQueryResultByToken(n) {
      return this.optimisticQueryResults.hasQueryResult(n);
    }
    localQueryLogs(n, i) {
      const u = pa(n, Yn(i));
      return this.optimisticQueryResults.queryLogs(u);
    }
    queryJournal(n, i) {
      const u = pa(n, Yn(i));
      return this.state.queryJournal(u);
    }
    connectionState() {
      const n = this.webSocketManager.connectionState();
      return {
        hasInflightRequests: this.requestManager.hasInflightRequests(),
        isWebSocketConnected: n.isConnected,
        hasEverConnected: n.hasEverConnected,
        connectionCount: n.connectionCount,
        connectionRetries: n.connectionRetries,
        timeOfOldestInflightRequest:
          this.requestManager.timeOfOldestInflightRequest(),
        inflightMutations: this.requestManager.inflightMutations(),
        inflightActions: this.requestManager.inflightActions(),
      };
    }
    subscribeToConnectionState(n) {
      const i = this.nextConnectionStateSubscriberId++;
      return (
        this.connectionStateSubscribers.set(i, n),
        () => {
          this.connectionStateSubscribers.delete(i);
        }
      );
    }
    async mutation(n, i, u) {
      const c = await this.mutationInternal(n, i, u);
      if (!c.success)
        throw c.errorData !== void 0
          ? xs(c, new Zs(si("mutation", n, c)))
          : new Error(si("mutation", n, c));
      return c.value;
    }
    async mutationInternal(n, i, u, c) {
      const { mutationPromise: s } = this.enqueueMutation(n, i, u, c);
      return s;
    }
    enqueueMutation(n, i, u, c) {
      const s = Yn(i);
      this.tryReportLongDisconnect();
      const h = this.nextRequestId;
      if ((this._nextRequestId++, u !== void 0)) {
        const b = u.optimisticUpdate;
        if (b !== void 0) {
          const z = (q) => {
              b(q, s) instanceof Promise &&
                this.logger.warn(
                  "Optimistic update handler returned a Promise. Optimistic updates should be synchronous.",
                );
            },
            _ = this.optimisticQueryResults
              .applyOptimisticUpdate(z, h)
              .map((q) => {
                const w = this.localQueryResultByToken(q);
                return {
                  token: q,
                  modification: {
                    kind: "Updated",
                    result:
                      w === void 0
                        ? void 0
                        : { success: !0, value: w, logLines: [] },
                  },
                };
              });
          this.handleTransition({
            queries: _,
            reflectedMutations: [],
            timestamp: this.remoteQuerySet.timestamp(),
          });
        }
      }
      const d = {
          type: "Mutation",
          requestId: h,
          udfPath: n,
          componentPath: c,
          args: [ba(s)],
        },
        v = this.webSocketManager.sendMessage(d);
      return {
        requestId: h,
        mutationPromise: this.requestManager.request(d, v),
      };
    }
    async action(n, i) {
      const u = await this.actionInternal(n, i);
      if (!u.success)
        throw u.errorData !== void 0
          ? xs(u, new Zs(si("action", n, u)))
          : new Error(si("action", n, u));
      return u.value;
    }
    async actionInternal(n, i, u) {
      const c = Yn(i),
        s = this.nextRequestId;
      (this._nextRequestId++, this.tryReportLongDisconnect());
      const h = {
          type: "Action",
          requestId: s,
          udfPath: n,
          componentPath: u,
          args: [ba(c)],
        },
        d = this.webSocketManager.sendMessage(h);
      return this.requestManager.request(h, d);
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
        const n = m0(this.sessionId);
        this.webSocketManager.sendMessage({
          type: "Event",
          eventType: "ClientConnect",
          event: n,
        });
      }
    }
    tryReportLongDisconnect() {
      if (!this.debug) return;
      const n = this.connectionState().timeOfOldestInflightRequest;
      if (n === null || Date.now() - n.getTime() <= 60 * 1e3) return;
      const i = `${this.address}/api/debug_event`;
      fetch(i, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Convex-Client": `npm-${am}`,
        },
        body: JSON.stringify({ event: "LongWebsocketDisconnect" }),
      })
        .then((u) => {
          u.ok ||
            this.logger.warn("Analytics request failed with response:", u.body);
        })
        .catch((u) => {
          this.logger.warn("Analytics response failed with error:", u);
        });
    }
  };
function Cs(n) {
  if (
    typeof n != "object" ||
    n === null ||
    !Array.isArray(n.page) ||
    typeof n.isDone != "boolean" ||
    typeof n.continueCursor != "string"
  )
    throw new Error(`Not a valid paginated query result: ${n?.toString()}`);
  return n;
}
var p0 = Object.defineProperty,
  b0 = (n, i, u) =>
    i in n
      ? p0(n, i, { enumerable: !0, configurable: !0, writable: !0, value: u })
      : (n[i] = u),
  dm = (n, i, u) => b0(n, typeof i != "symbol" ? i + "" : i, u),
  S0 = class {
    constructor(n, i) {
      ((this.client = n),
        (this.onTransition = i),
        dm(this, "paginatedQuerySet", new Map()),
        dm(this, "lastTransitionTs"),
        (this.lastTransitionTs = bl.fromNumber(0)),
        this.client.addOnTransitionHandler((u) => this.onBaseTransition(u)));
    }
    subscribe(n, i, u) {
      const c = Sa(n),
        s = lm(c, i, u),
        h = () => this.removePaginatedQuerySubscriber(s),
        d = this.paginatedQuerySet.get(s);
      return d
        ? ((d.numSubscribers += 1), { paginatedQueryToken: s, unsubscribe: h })
        : (this.paginatedQuerySet.set(s, {
            token: s,
            canonicalizedUdfPath: c,
            args: i,
            numSubscribers: 1,
            options: { initialNumItems: u.initialNumItems },
            nextPageKey: 0,
            pageKeys: [],
            pageKeyToQuery: new Map(),
            ongoingSplits: new Map(),
            skip: !1,
            id: u.id,
          }),
          this.addPageToPaginatedQuery(s, null, u.initialNumItems),
          { paginatedQueryToken: s, unsubscribe: h });
    }
    localQueryResult(n, i, u) {
      const c = lm(Sa(n), i, u);
      return this.localQueryResultByToken(c);
    }
    localQueryResultByToken(n) {
      const i = this.paginatedQuerySet.get(n);
      if (!i) return;
      const u = this.activePageQueryTokens(i);
      if (u.length === 0)
        return {
          results: [],
          status: "LoadingFirstPage",
          loadMore: (v) => this.loadMoreOfPaginatedQuery(n, v),
        };
      let c = [],
        s = !1,
        h = !1;
      for (const v of u) {
        const b = this.client.localQueryResultByToken(v);
        if (b === void 0) {
          ((s = !0), (h = !1));
          continue;
        }
        const z = Cs(b);
        ((c = c.concat(z.page)), (h = !!z.isDone));
      }
      let d;
      return (
        s
          ? (d = c.length === 0 ? "LoadingFirstPage" : "LoadingMore")
          : h
            ? (d = "Exhausted")
            : (d = "CanLoadMore"),
        {
          results: c,
          status: d,
          loadMore: (v) => this.loadMoreOfPaginatedQuery(n, v),
        }
      );
    }
    onBaseTransition(n) {
      const i = n.queries.map((h) => h.token),
        u = this.queriesContainingTokens(i);
      let c = [];
      u.length > 0 &&
        (this.processPaginatedQuerySplits(u, (h) =>
          this.client.localQueryResultByToken(h),
        ),
        (c = u.map((h) => ({
          token: h,
          modification: {
            kind: "Updated",
            result: this.localQueryResultByToken(h),
          },
        }))));
      const s = { ...n, paginatedQueries: c };
      this.onTransition(s);
    }
    loadMoreOfPaginatedQuery(n, i) {
      this.mustGetPaginatedQuery(n);
      const u = this.queryTokenForLastPageOfPaginatedQuery(n),
        c = this.client.localQueryResultByToken(u);
      if (!c) return !1;
      const s = Cs(c);
      if (s.isDone) return !1;
      this.addPageToPaginatedQuery(n, s.continueCursor, i);
      const h = {
        timestamp: this.lastTransitionTs,
        reflectedMutations: [],
        queries: [],
        paginatedQueries: [
          {
            token: n,
            modification: {
              kind: "Updated",
              result: this.localQueryResultByToken(n),
            },
          },
        ],
      };
      return (this.onTransition(h), !0);
    }
    queriesContainingTokens(n) {
      if (n.length === 0) return [];
      const i = [],
        u = new Set(n);
      for (const [c, s] of this.paginatedQuerySet)
        for (const h of this.allQueryTokens(s))
          if (u.has(h)) {
            i.push(c);
            break;
          }
      return i;
    }
    processPaginatedQuerySplits(n, i) {
      for (const u of n) {
        const c = this.mustGetPaginatedQuery(u),
          { ongoingSplits: s, pageKeyToQuery: h, pageKeys: d } = c;
        for (const [v, [b, z]] of s)
          i(h.get(b).queryToken) !== void 0 &&
            i(h.get(z).queryToken) !== void 0 &&
            this.completePaginatedQuerySplit(c, v, b, z);
        for (const v of d) {
          if (s.has(v)) continue;
          const b = h.get(v).queryToken,
            z = i(b);
          if (!z) continue;
          const _ = Cs(z);
          _.splitCursor &&
            (_.pageStatus === "SplitRecommended" ||
              _.pageStatus === "SplitRequired" ||
              _.page.length > c.options.initialNumItems * 2) &&
            this.splitPaginatedQueryPage(c, v, _.splitCursor, _.continueCursor);
        }
      }
    }
    splitPaginatedQueryPage(n, i, u, c) {
      const s = n.nextPageKey++,
        h = n.nextPageKey++,
        d = { cursor: c, numItems: n.options.initialNumItems, id: n.id },
        v = this.client.subscribe(n.canonicalizedUdfPath, {
          ...n.args,
          paginationOpts: { ...d, cursor: null, endCursor: u },
        });
      n.pageKeyToQuery.set(s, v);
      const b = this.client.subscribe(n.canonicalizedUdfPath, {
        ...n.args,
        paginationOpts: { ...d, cursor: u, endCursor: c },
      });
      (n.pageKeyToQuery.set(h, b), n.ongoingSplits.set(i, [s, h]));
    }
    addPageToPaginatedQuery(n, i, u) {
      const c = this.mustGetPaginatedQuery(n),
        s = c.nextPageKey++,
        h = { cursor: i, numItems: u, id: c.id },
        d = { ...c.args, paginationOpts: h },
        v = this.client.subscribe(c.canonicalizedUdfPath, d);
      return (c.pageKeys.push(s), c.pageKeyToQuery.set(s, v), v);
    }
    removePaginatedQuerySubscriber(n) {
      const i = this.paginatedQuerySet.get(n);
      if (i && ((i.numSubscribers -= 1), !(i.numSubscribers > 0))) {
        for (const u of i.pageKeyToQuery.values()) u.unsubscribe();
        this.paginatedQuerySet.delete(n);
      }
    }
    completePaginatedQuerySplit(n, i, u, c) {
      const s = n.pageKeyToQuery.get(i);
      n.pageKeyToQuery.delete(i);
      const h = n.pageKeys.indexOf(i);
      (n.pageKeys.splice(h, 1, u, c),
        n.ongoingSplits.delete(i),
        s.unsubscribe());
    }
    activePageQueryTokens(n) {
      return n.pageKeys.map((i) => n.pageKeyToQuery.get(i).queryToken);
    }
    allQueryTokens(n) {
      return Array.from(n.pageKeyToQuery.values()).map((i) => i.queryToken);
    }
    queryTokenForLastPageOfPaginatedQuery(n) {
      const i = this.mustGetPaginatedQuery(n),
        u = i.pageKeys[i.pageKeys.length - 1];
      if (u === void 0) throw new Error(`No pages for paginated query ${n}`);
      return i.pageKeyToQuery.get(u).queryToken;
    }
    mustGetPaginatedQuery(n) {
      const i = this.paginatedQuerySet.get(n);
      if (!i)
        throw new Error("paginated query no longer exists for token " + n);
      return i;
    }
  },
  Ze = np(Gs(), 1),
  _0 = Object.defineProperty,
  T0 = (n, i, u) =>
    i in n
      ? _0(n, i, { enumerable: !0, configurable: !0, writable: !0, value: u })
      : (n[i] = u),
  Sn = (n, i, u) => T0(n, typeof i != "symbol" ? i + "" : i, u),
  z0 = 5e3;
if (typeof Ze.default > "u")
  throw new Error("Required dependency 'react' not found");
var A0 = class {
    constructor(n, i) {
      if (
        (Sn(this, "address"),
        Sn(this, "cachedSync"),
        Sn(this, "cachedPaginatedQueryClient"),
        Sn(this, "listeners"),
        Sn(this, "options"),
        Sn(this, "closed", !1),
        Sn(this, "_logger"),
        Sn(this, "adminAuth"),
        Sn(this, "fakeUserIdentity"),
        n === void 0)
      )
        throw new Error(
          "No address provided to ConvexReactClient.\nIf trying to deploy to production, make sure to follow all the instructions found at https://docs.convex.dev/production/hosting/\nIf running locally, make sure to run `convex dev` and ensure the .env.local file is populated.",
        );
      if (typeof n != "string")
        throw new Error(
          `ConvexReactClient requires a URL like 'https://happy-otter-123.convex.cloud', received something of type ${typeof n} instead.`,
        );
      if (!n.includes("://"))
        throw new Error("Provided address was not an absolute URL.");
      ((this.address = n),
        (this.listeners = new Map()),
        (this._logger =
          i?.logger === !1
            ? Xm({ verbose: i?.verbose ?? !1 })
            : i?.logger !== !0 && i?.logger
              ? i.logger
              : Ym({ verbose: i?.verbose ?? !1 })),
        (this.options = { ...i, logger: this._logger }));
    }
    get url() {
      return this.address;
    }
    get sync() {
      if (this.closed)
        throw new Error("ConvexReactClient has already been closed.");
      return this.cachedSync
        ? this.cachedSync
        : ((this.cachedSync =
            this.options.baseClient ??
            new y0(this.address, () => {}, this.options)),
          this.adminAuth &&
            this.cachedSync.setAdminAuth(this.adminAuth, this.fakeUserIdentity),
          (this.cachedPaginatedQueryClient = new S0(this.cachedSync, (n) =>
            this.handleTransition(n),
          )),
          this.cachedSync);
    }
    get paginatedQueryClient() {
      if ((this.sync, this.cachedPaginatedQueryClient))
        return this.cachedPaginatedQueryClient;
      throw new Error("Should already be instantiated");
    }
    setAuth(n, i, u) {
      if (typeof n == "string")
        throw new Error(
          "Passing a string to ConvexReactClient.setAuth is no longer supported, please upgrade to passing in an async function to handle reauthentication.",
        );
      this.sync.setAuth(n, i ?? (() => {}), u);
    }
    clearAuth() {
      this.sync.clearAuth();
    }
    setAdminAuth(n, i) {
      if (((this.adminAuth = n), (this.fakeUserIdentity = i), this.closed))
        throw new Error("ConvexReactClient has already been closed.");
      this.cachedSync && this.sync.setAdminAuth(n, i);
    }
    watchQuery(n, ...i) {
      const [u, c] = i,
        s = ya(n);
      return {
        onUpdate: (h) => {
          const { queryToken: d, unsubscribe: v } = this.sync.subscribe(
              s,
              u,
              c,
            ),
            b = this.listeners.get(d);
          return (
            b !== void 0 ? b.add(h) : this.listeners.set(d, new Set([h])),
            () => {
              if (this.closed) return;
              const z = this.listeners.get(d);
              (z.delete(h), z.size === 0 && this.listeners.delete(d), v());
            }
          );
        },
        localQueryResult: () => {
          if (this.cachedSync) return this.cachedSync.localQueryResult(s, u);
        },
        localQueryLogs: () => {
          if (this.cachedSync) return this.cachedSync.localQueryLogs(s, u);
        },
        journal: () => {
          if (this.cachedSync) return this.cachedSync.queryJournal(s, u);
        },
      };
    }
    prewarmQuery(n) {
      const i = n.extendSubscriptionFor ?? z0,
        u = this.watchQuery(n.query, n.args || {}).onUpdate(() => {});
      setTimeout(u, i);
    }
    watchPaginatedQuery(n, i, u) {
      const c = ya(n);
      return {
        onUpdate: (s) => {
          const { paginatedQueryToken: h, unsubscribe: d } =
              this.paginatedQueryClient.subscribe(c, i || {}, u),
            v = this.listeners.get(h);
          return (
            v !== void 0 ? v.add(s) : this.listeners.set(h, new Set([s])),
            () => {
              if (this.closed) return;
              const b = this.listeners.get(h);
              (b.delete(s), b.size === 0 && this.listeners.delete(h), d());
            }
          );
        },
        localQueryResult: () =>
          this.paginatedQueryClient.localQueryResult(c, i, u),
      };
    }
    mutation(n, ...i) {
      const [u, c] = i,
        s = ya(n);
      return this.sync.mutation(s, u, c);
    }
    action(n, ...i) {
      const u = ya(n);
      return this.sync.action(u, ...i);
    }
    query(n, ...i) {
      const u = this.watchQuery(n, ...i),
        c = u.localQueryResult();
      return c !== void 0
        ? Promise.resolve(c)
        : new Promise((s, h) => {
            const d = u.onUpdate(() => {
              d();
              try {
                s(u.localQueryResult());
              } catch (v) {
                h(v);
              }
            });
          });
    }
    connectionState() {
      return this.sync.connectionState();
    }
    subscribeToConnectionState(n) {
      return this.sync.subscribeToConnectionState(n);
    }
    get logger() {
      return this._logger;
    }
    async close() {
      if (
        ((this.closed = !0),
        (this.listeners = new Map()),
        this.cachedPaginatedQueryClient &&
          (this.cachedPaginatedQueryClient = void 0),
        this.cachedSync)
      ) {
        const n = this.cachedSync;
        ((this.cachedSync = void 0), await n.close());
      }
    }
    handleTransition(n) {
      const i = n.queries.map((c) => c.token),
        u = n.paginatedQueries.map((c) => c.token);
      this.transition([...i, ...u]);
    }
    transition(n) {
      for (const i of n) {
        const u = this.listeners.get(i);
        if (u) for (const c of u) c();
      }
    }
  },
  AT = Ze.createContext(void 0),
  E0 = Zp,
  mm = 6e4,
  w0 = 500,
  O0 = 1e4,
  R0 = 1e3,
  C0 = 3e4,
  M0 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function vm(n) {
  if (typeof n != "object" || n === null) return null;
  const i = n;
  if (
    (i.mode !== "light" && i.mode !== "dark") ||
    typeof i.tokens != "object" ||
    i.tokens === null
  )
    return null;
  const u = {};
  for (const [c, s] of Object.entries(i.tokens)) {
    if (typeof s != "string") return null;
    u[c] = s;
  }
  return { mode: i.mode, tokens: u };
}
function gm(n) {
  const i = document.documentElement;
  for (const [u, c] of Object.entries(n.tokens)) i.style.setProperty(u, c);
  (i.classList.toggle("light", n.mode === "light"),
    i.classList.toggle("dark", n.mode === "dark"));
}
function N0(n) {
  if (typeof n != "object" || n === null) return !1;
  const i = n;
  if (
    typeof i.pluginName != "string" ||
    typeof i.userId != "string" ||
    typeof i.organizationId != "string" ||
    typeof i.workspaceId != "string"
  )
    return !1;
  if (i.kind === "page")
    return typeof i.pageId == "string" && typeof i.pageTitle == "string";
  if (i.kind === "file_view") {
    if (
      typeof i.fileViewId != "string" ||
      typeof i.fileViewTitle != "string" ||
      typeof i.file != "object" ||
      i.file === null
    )
      return !1;
    const u = i.file;
    return (
      typeof u.fileNodeId == "string" &&
      typeof u.name == "string" &&
      typeof u.path == "string" &&
      typeof u.contentType == "string"
    );
  }
  return !1;
}
function D0() {
  const n = window.location.hash.slice(1);
  if (!n)
    throw new Error(
      "Missing host bridge fragment — this plugin frame must be embedded by the Bonobo host app",
    );
  const i = new URLSearchParams(n),
    u = i.getAll("parentOrigin"),
    c = i.getAll("nonce");
  if (i.size !== 2 || u.length !== 1 || c.length !== 1)
    throw new Error("Invalid host bridge fragment");
  const s = u[0],
    h = c[0];
  let d;
  try {
    d = new URL(s);
  } catch {
    throw new Error("Invalid host bridge parent origin");
  }
  if ((d.protocol !== "http:" && d.protocol !== "https:") || d.origin !== s)
    throw new Error("Invalid host bridge parent origin");
  if (!M0.test(h)) throw new Error("Invalid host bridge nonce");
  return { parentOrigin: s, nonce: h };
}
async function k0() {
  const { parentOrigin: n, nonce: i } = D0();
  let u = "",
    c = "",
    s = 0,
    h = "",
    d = 0,
    v = null;
  const b = new Set(),
    z = new Map();
  let _ = null;
  async function q() {
    return Date.now() >= s - mm ? w() : c;
  }
  function w() {
    if (_) return _;
    const P = crypto.randomUUID();
    return (
      (_ = new Promise((X, ne) => {
        const ae = setTimeout(() => {
          (z.delete(P), ne(new Error("Plugin frame token refresh timed out")));
        }, O0);
        z.set(P, { resolve: X, reject: ne, timeout: ae });
        try {
          window.parent.postMessage(
            { type: "bonobo:token-refresh-request", nonce: i, requestId: P },
            n,
          );
        } catch (ge) {
          (clearTimeout(ae), z.delete(P), ne(ge));
        }
      }).finally(() => {
        _ = null;
      })),
      _
    );
  }
  const x = () => h !== "" && Date.now() < d - mm,
    K = (P) => {
      typeof P.jwt == "string" &&
      typeof P.jwtExpiresAt == "number" &&
      Number.isFinite(P.jwtExpiresAt)
        ? ((h = P.jwt), (d = P.jwtExpiresAt))
        : ((h = ""), (d = 0));
    };
  async function Te(P, X, ne) {
    const ae = JSON.stringify(X),
      ge = (me) => {
        const Ne = new Headers(ne?.headers);
        return (
          Ne.set("Authorization", `Bearer ${me}`),
          Ne.set("Content-Type", "application/json"),
          Ne.set("Accept", "application/json"),
          fetch(u + P, {
            ...ne,
            method: "POST",
            body: ae,
            headers: Ne,
            redirect: "error",
          })
        );
      },
      F = await q();
    let ye = await ge(F);
    ye.status === 401 && (ye = await ge(c !== F ? c : await w()));
    const V = await ye.text();
    let de = null;
    try {
      de = JSON.parse(V);
    } catch {}
    return { status: ye.status, body: de };
  }
  async function xe(P) {
    const X = new Headers(P);
    return (X.set("Authorization", `Bearer ${await q()}`), X);
  }
  const Fe = (P) =>
    fetch(u + "/plugins-ui/session-jwt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: P }),
    });
  async function qe(P) {
    const X = P?.forceRefreshToken === !0;
    for (let ne = 0; ; ne += 1) {
      if (x() && !X) return h;
      let ae = null;
      try {
        if (h !== "" && (await w(), x())) return h;
        ((ae = await Fe(await q())),
          ae.status === 401 && (ae = await Fe(await w())));
      } catch {
        ae = null;
      }
      if (ae?.ok) {
        const ge = await ae.json().catch(() => null),
          F = ge?._yay?.jwt,
          ye = ge?._yay?.sessionExpiresAt;
        return typeof F != "string" || typeof ye != "number"
          ? null
          : ((s = ye), (h = F), (d = ye), F);
      }
      if (!(ae === null || ae.status === 429 || ae.status >= 500) || ne >= 2)
        return null;
      await new Promise((ge) => setTimeout(ge, 1e3 * (ne + 1)));
    }
  }
  return new Promise((P) => {
    let X = !1,
      ne;
    const ae = () => {
        window.parent.postMessage({ type: "bonobo:ready", nonce: i }, n);
      },
      ge = () => {
        clearInterval(ne);
      },
      F = (ye) => {
        if (ye.source !== window.parent || ye.origin !== n) return;
        const V = ye.data;
        if (!(typeof V != "object" || V === null)) {
          if (
            V.type === "bonobo:init" &&
            !X &&
            V.nonce === i &&
            typeof V.apiOrigin == "string" &&
            typeof V.convexUrl == "string" &&
            typeof V.token == "string" &&
            typeof V.tokenExpiresAt == "number" &&
            Number.isFinite(V.tokenExpiresAt) &&
            N0(V.context)
          ) {
            ((X = !0),
              ge(),
              window.removeEventListener("pagehide", ge),
              (u = V.apiOrigin),
              (c = V.token),
              (s = V.tokenExpiresAt),
              K(V));
            const de = new A0(V.convexUrl, {
              expectAuth: !0,
              unsavedChangesWarning: !1,
              initialAuthTokenReuse: !0,
            });
            let me = Date.now();
            const Ne = setInterval(() => {
              const De = Date.now();
              (De - me >= C0 && de.setAuth(qe), (me = De));
            }, R0);
            (de.setAuth(qe),
              window.addEventListener(
                "pagehide",
                () => {
                  (clearInterval(Ne), de.close());
                },
                { once: !0 },
              ),
              (v = vm(V.theme)),
              v && gm(v),
              P({
                context: V.context,
                apiOrigin: u,
                getToken: q,
                refreshToken: w,
                fetchJson: Te,
                authorize: xe,
                convex: de,
                api: E0,
                session: { expiresAt: () => s, fetchJwt: qe },
                theme: {
                  current: () => v,
                  subscribe(De) {
                    return (
                      b.add(De),
                      () => {
                        b.delete(De);
                      }
                    );
                  },
                },
              }));
          } else if (
            X &&
            V.nonce === i &&
            V.type === "bonobo:token" &&
            typeof V.requestId == "string" &&
            typeof V.token == "string" &&
            typeof V.tokenExpiresAt == "number" &&
            Number.isFinite(V.tokenExpiresAt)
          ) {
            const de = z.get(V.requestId);
            de &&
              (z.delete(V.requestId),
              clearTimeout(de.timeout),
              (c = V.token),
              (s = V.tokenExpiresAt),
              K(V),
              de.resolve(V.token));
          } else if (X && V.nonce === i && V.type === "bonobo:theme") {
            const de = vm(V.theme);
            if (de) {
              ((v = de), gm(de));
              for (const me of b) me(de);
            }
          } else if (
            X &&
            V.nonce === i &&
            V.type === "bonobo:token-error" &&
            typeof V.requestId == "string" &&
            typeof V.message == "string"
          ) {
            const de = z.get(V.requestId);
            de &&
              (z.delete(V.requestId),
              clearTimeout(de.timeout),
              de.reject(new Error(V.message)));
          }
        }
      };
    (window.addEventListener("message", F),
      window.addEventListener("pagehide", ge, { once: !0 }),
      ae(),
      (ne = setInterval(ae, w0)));
  });
}
var q0 = Pt((n) => {
    function i(j, U) {
      var B = j.length;
      j.push(U);
      e: for (; 0 < B; ) {
        var W = (B - 1) >>> 1,
          k = j[W];
        if (0 < s(k, U)) ((j[W] = U), (j[B] = k), (B = W));
        else break e;
      }
    }
    function u(j) {
      return j.length === 0 ? null : j[0];
    }
    function c(j) {
      if (j.length === 0) return null;
      var U = j[0],
        B = j.pop();
      if (B !== U) {
        j[0] = B;
        e: for (var W = 0, k = j.length, I = k >>> 1; W < I; ) {
          var g = 2 * (W + 1) - 1,
            R = j[g],
            Z = g + 1,
            L = j[Z];
          if (0 > s(R, B))
            Z < k && 0 > s(L, R)
              ? ((j[W] = L), (j[Z] = B), (W = Z))
              : ((j[W] = R), (j[g] = B), (W = g));
          else if (Z < k && 0 > s(L, B)) ((j[W] = L), (j[Z] = B), (W = Z));
          else break e;
        }
      }
      return U;
    }
    function s(j, U) {
      var B = j.sortIndex - U.sortIndex;
      return B !== 0 ? B : j.id - U.id;
    }
    if (
      ((n.unstable_now = void 0),
      typeof performance == "object" && typeof performance.now == "function")
    ) {
      var h = performance;
      n.unstable_now = function () {
        return h.now();
      };
    } else {
      var d = Date,
        v = d.now();
      n.unstable_now = function () {
        return d.now() - v;
      };
    }
    var b = [],
      z = [],
      _ = 1,
      q = null,
      w = 3,
      x = !1,
      K = !1,
      Te = !1,
      xe = !1,
      Fe = typeof setTimeout == "function" ? setTimeout : null,
      qe = typeof clearTimeout == "function" ? clearTimeout : null,
      P = typeof setImmediate < "u" ? setImmediate : null;
    function X(j) {
      for (var U = u(z); U !== null; ) {
        if (U.callback === null) c(z);
        else if (U.startTime <= j)
          (c(z), (U.sortIndex = U.expirationTime), i(b, U));
        else break;
        U = u(z);
      }
    }
    function ne(j) {
      if (((Te = !1), X(j), !K))
        if (u(b) !== null) ((K = !0), ae || ((ae = !0), me()));
        else {
          var U = u(z);
          U !== null && We(ne, U.startTime - j);
        }
    }
    var ae = !1,
      ge = -1,
      F = 5,
      ye = -1;
    function V() {
      return xe ? !0 : !(n.unstable_now() - ye < F);
    }
    function de() {
      if (((xe = !1), ae)) {
        var j = n.unstable_now();
        ye = j;
        var U = !0;
        try {
          e: {
            ((K = !1), Te && ((Te = !1), qe(ge), (ge = -1)), (x = !0));
            var B = w;
            try {
              t: {
                for (
                  X(j), q = u(b);
                  q !== null && !(q.expirationTime > j && V());
                ) {
                  var W = q.callback;
                  if (typeof W == "function") {
                    ((q.callback = null), (w = q.priorityLevel));
                    var k = W(q.expirationTime <= j);
                    if (((j = n.unstable_now()), typeof k == "function")) {
                      ((q.callback = k), X(j), (U = !0));
                      break t;
                    }
                    (q === u(b) && c(b), X(j));
                  } else c(b);
                  q = u(b);
                }
                if (q !== null) U = !0;
                else {
                  var I = u(z);
                  (I !== null && We(ne, I.startTime - j), (U = !1));
                }
              }
              break e;
            } finally {
              ((q = null), (w = B), (x = !1));
            }
            U = void 0;
          }
        } finally {
          U ? me() : (ae = !1);
        }
      }
    }
    var me;
    if (typeof P == "function")
      me = function () {
        P(de);
      };
    else if (typeof MessageChannel < "u") {
      var Ne = new MessageChannel(),
        De = Ne.port2;
      ((Ne.port1.onmessage = de),
        (me = function () {
          De.postMessage(null);
        }));
    } else
      me = function () {
        Fe(de, 0);
      };
    function We(j, U) {
      ge = Fe(function () {
        j(n.unstable_now());
      }, U);
    }
    ((n.unstable_IdlePriority = 5),
      (n.unstable_ImmediatePriority = 1),
      (n.unstable_LowPriority = 4),
      (n.unstable_NormalPriority = 3),
      (n.unstable_Profiling = null),
      (n.unstable_UserBlockingPriority = 2),
      (n.unstable_cancelCallback = function (j) {
        j.callback = null;
      }),
      (n.unstable_forceFrameRate = function (j) {
        0 > j || 125 < j
          ? console.error(
              "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
            )
          : (F = 0 < j ? Math.floor(1e3 / j) : 5);
      }),
      (n.unstable_getCurrentPriorityLevel = function () {
        return w;
      }),
      (n.unstable_next = function (j) {
        switch (w) {
          case 1:
          case 2:
          case 3:
            var U = 3;
            break;
          default:
            U = w;
        }
        var B = w;
        w = U;
        try {
          return j();
        } finally {
          w = B;
        }
      }),
      (n.unstable_requestPaint = function () {
        xe = !0;
      }),
      (n.unstable_runWithPriority = function (j, U) {
        switch (j) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            break;
          default:
            j = 3;
        }
        var B = w;
        w = j;
        try {
          return U();
        } finally {
          w = B;
        }
      }),
      (n.unstable_scheduleCallback = function (j, U, B) {
        var W = n.unstable_now();
        switch (
          (typeof B == "object" && B !== null
            ? ((B = B.delay), (B = typeof B == "number" && 0 < B ? W + B : W))
            : (B = W),
          j)
        ) {
          case 1:
            var k = -1;
            break;
          case 2:
            k = 250;
            break;
          case 5:
            k = 1073741823;
            break;
          case 4:
            k = 1e4;
            break;
          default:
            k = 5e3;
        }
        return (
          (k = B + k),
          (j = {
            id: _++,
            callback: U,
            priorityLevel: j,
            startTime: B,
            expirationTime: k,
            sortIndex: -1,
          }),
          B > W
            ? ((j.sortIndex = B),
              i(z, j),
              u(b) === null &&
                j === u(z) &&
                (Te ? (qe(ge), (ge = -1)) : (Te = !0), We(ne, B - W)))
            : ((j.sortIndex = k),
              i(b, j),
              K || x || ((K = !0), ae || ((ae = !0), me()))),
          j
        );
      }),
      (n.unstable_shouldYield = V),
      (n.unstable_wrapCallback = function (j) {
        var U = w;
        return function () {
          var B = w;
          w = U;
          try {
            return j.apply(this, arguments);
          } finally {
            w = B;
          }
        };
      }));
  }),
  U0 = Pt((n, i) => {
    i.exports = q0();
  }),
  j0 = Pt((n) => {
    var i = Gs();
    function u(z) {
      var _ = "https://react.dev/errors/" + z;
      if (1 < arguments.length) {
        _ += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var q = 2; q < arguments.length; q++)
          _ += "&args[]=" + encodeURIComponent(arguments[q]);
      }
      return (
        "Minified React error #" +
        z +
        "; visit " +
        _ +
        " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
      );
    }
    function c() {}
    var s = {
        d: {
          f: c,
          r: function () {
            throw Error(u(522));
          },
          D: c,
          C: c,
          L: c,
          m: c,
          X: c,
          S: c,
          M: c,
        },
        p: 0,
        findDOMNode: null,
      },
      h = Symbol.for("react.portal");
    function d(z, _, q) {
      var w =
        3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
      return {
        $$typeof: h,
        key: w == null ? null : "" + w,
        children: z,
        containerInfo: _,
        implementation: q,
      };
    }
    var v = i.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    function b(z, _) {
      if (z === "font") return "";
      if (typeof _ == "string") return _ === "use-credentials" ? _ : "";
    }
    ((n.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = s),
      (n.createPortal = function (z, _) {
        var q =
          2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
        if (!_ || (_.nodeType !== 1 && _.nodeType !== 9 && _.nodeType !== 11))
          throw Error(u(299));
        return d(z, _, null, q);
      }),
      (n.flushSync = function (z) {
        var _ = v.T,
          q = s.p;
        try {
          if (((v.T = null), (s.p = 2), z)) return z();
        } finally {
          ((v.T = _), (s.p = q), s.d.f());
        }
      }),
      (n.preconnect = function (z, _) {
        typeof z == "string" &&
          (_
            ? ((_ = _.crossOrigin),
              (_ =
                typeof _ == "string"
                  ? _ === "use-credentials"
                    ? _
                    : ""
                  : void 0))
            : (_ = null),
          s.d.C(z, _));
      }),
      (n.prefetchDNS = function (z) {
        typeof z == "string" && s.d.D(z);
      }),
      (n.preinit = function (z, _) {
        if (typeof z == "string" && _ && typeof _.as == "string") {
          var q = _.as,
            w = b(q, _.crossOrigin),
            x = typeof _.integrity == "string" ? _.integrity : void 0,
            K = typeof _.fetchPriority == "string" ? _.fetchPriority : void 0;
          q === "style"
            ? s.d.S(
                z,
                typeof _.precedence == "string" ? _.precedence : void 0,
                { crossOrigin: w, integrity: x, fetchPriority: K },
              )
            : q === "script" &&
              s.d.X(z, {
                crossOrigin: w,
                integrity: x,
                fetchPriority: K,
                nonce: typeof _.nonce == "string" ? _.nonce : void 0,
              });
        }
      }),
      (n.preinitModule = function (z, _) {
        if (typeof z == "string")
          if (typeof _ == "object" && _ !== null) {
            if (_.as == null || _.as === "script") {
              var q = b(_.as, _.crossOrigin);
              s.d.M(z, {
                crossOrigin: q,
                integrity:
                  typeof _.integrity == "string" ? _.integrity : void 0,
                nonce: typeof _.nonce == "string" ? _.nonce : void 0,
              });
            }
          } else _ ?? s.d.M(z);
      }),
      (n.preload = function (z, _) {
        if (
          typeof z == "string" &&
          typeof _ == "object" &&
          _ !== null &&
          typeof _.as == "string"
        ) {
          var q = _.as,
            w = b(q, _.crossOrigin);
          s.d.L(z, q, {
            crossOrigin: w,
            integrity: typeof _.integrity == "string" ? _.integrity : void 0,
            nonce: typeof _.nonce == "string" ? _.nonce : void 0,
            type: typeof _.type == "string" ? _.type : void 0,
            fetchPriority:
              typeof _.fetchPriority == "string" ? _.fetchPriority : void 0,
            referrerPolicy:
              typeof _.referrerPolicy == "string" ? _.referrerPolicy : void 0,
            imageSrcSet:
              typeof _.imageSrcSet == "string" ? _.imageSrcSet : void 0,
            imageSizes: typeof _.imageSizes == "string" ? _.imageSizes : void 0,
            media: typeof _.media == "string" ? _.media : void 0,
          });
        }
      }),
      (n.preloadModule = function (z, _) {
        if (typeof z == "string")
          if (_) {
            var q = b(_.as, _.crossOrigin);
            s.d.m(z, {
              as: typeof _.as == "string" && _.as !== "script" ? _.as : void 0,
              crossOrigin: q,
              integrity: typeof _.integrity == "string" ? _.integrity : void 0,
            });
          } else s.d.m(z);
      }),
      (n.requestFormReset = function (z) {
        s.d.r(z);
      }),
      (n.unstable_batchedUpdates = function (z, _) {
        return z(_);
      }),
      (n.useFormState = function (z, _, q) {
        return v.H.useFormState(z, _, q);
      }),
      (n.useFormStatus = function () {
        return v.H.useHostTransitionStatus();
      }),
      (n.version = "19.2.7"));
  }),
  Z0 = Pt((n, i) => {
    function u() {
      if (
        !(
          typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
          typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
        )
      )
        try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(u);
        } catch (c) {
          console.error(c);
        }
    }
    (u(), (i.exports = j0()));
  }),
  x0 = Pt((n) => {
    var i = U0(),
      u = Gs(),
      c = Z0();
    function s(e) {
      var t = "https://react.dev/errors/" + e;
      if (1 < arguments.length) {
        t += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var a = 2; a < arguments.length; a++)
          t += "&args[]=" + encodeURIComponent(arguments[a]);
      }
      return (
        "Minified React error #" +
        e +
        "; visit " +
        t +
        " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
      );
    }
    function h(e) {
      return !(
        !e ||
        (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11)
      );
    }
    function d(e) {
      var t = e,
        a = e;
      if (e.alternate) for (; t.return; ) t = t.return;
      else {
        e = t;
        do ((t = e), (t.flags & 4098) !== 0 && (a = t.return), (e = t.return));
        while (e);
      }
      return t.tag === 3 ? a : null;
    }
    function v(e) {
      if (e.tag === 13) {
        var t = e.memoizedState;
        if (
          (t === null &&
            ((e = e.alternate), e !== null && (t = e.memoizedState)),
          t !== null)
        )
          return t.dehydrated;
      }
      return null;
    }
    function b(e) {
      if (e.tag === 31) {
        var t = e.memoizedState;
        if (
          (t === null &&
            ((e = e.alternate), e !== null && (t = e.memoizedState)),
          t !== null)
        )
          return t.dehydrated;
      }
      return null;
    }
    function z(e) {
      if (d(e) !== e) throw Error(s(188));
    }
    function _(e) {
      var t = e.alternate;
      if (!t) {
        if (((t = d(e)), t === null)) throw Error(s(188));
        return t !== e ? null : e;
      }
      for (var a = e, l = t; ; ) {
        var r = a.return;
        if (r === null) break;
        var o = r.alternate;
        if (o === null) {
          if (((l = r.return), l !== null)) {
            a = l;
            continue;
          }
          break;
        }
        if (r.child === o.child) {
          for (o = r.child; o; ) {
            if (o === a) return (z(r), e);
            if (o === l) return (z(r), t);
            o = o.sibling;
          }
          throw Error(s(188));
        }
        if (a.return !== l.return) ((a = r), (l = o));
        else {
          for (var f = !1, m = r.child; m; ) {
            if (m === a) {
              ((f = !0), (a = r), (l = o));
              break;
            }
            if (m === l) {
              ((f = !0), (l = r), (a = o));
              break;
            }
            m = m.sibling;
          }
          if (!f) {
            for (m = o.child; m; ) {
              if (m === a) {
                ((f = !0), (a = o), (l = r));
                break;
              }
              if (m === l) {
                ((f = !0), (l = o), (a = r));
                break;
              }
              m = m.sibling;
            }
            if (!f) throw Error(s(189));
          }
        }
        if (a.alternate !== l) throw Error(s(190));
      }
      if (a.tag !== 3) throw Error(s(188));
      return a.stateNode.current === a ? e : t;
    }
    function q(e) {
      var t = e.tag;
      if (t === 5 || t === 26 || t === 27 || t === 6) return e;
      for (e = e.child; e !== null; ) {
        if (((t = q(e)), t !== null)) return t;
        e = e.sibling;
      }
      return null;
    }
    var w = Object.assign,
      x = Symbol.for("react.element"),
      K = Symbol.for("react.transitional.element"),
      Te = Symbol.for("react.portal"),
      xe = Symbol.for("react.fragment"),
      Fe = Symbol.for("react.strict_mode"),
      qe = Symbol.for("react.profiler"),
      P = Symbol.for("react.consumer"),
      X = Symbol.for("react.context"),
      ne = Symbol.for("react.forward_ref"),
      ae = Symbol.for("react.suspense"),
      ge = Symbol.for("react.suspense_list"),
      F = Symbol.for("react.memo"),
      ye = Symbol.for("react.lazy"),
      V = Symbol.for("react.activity"),
      de = Symbol.for("react.memo_cache_sentinel"),
      me = Symbol.iterator;
    function Ne(e) {
      return e === null || typeof e != "object"
        ? null
        : ((e = (me && e[me]) || e["@@iterator"]),
          typeof e == "function" ? e : null);
    }
    var De = Symbol.for("react.client.reference");
    function We(e) {
      if (e == null) return null;
      if (typeof e == "function")
        return e.$$typeof === De ? null : e.displayName || e.name || null;
      if (typeof e == "string") return e;
      switch (e) {
        case xe:
          return "Fragment";
        case qe:
          return "Profiler";
        case Fe:
          return "StrictMode";
        case ae:
          return "Suspense";
        case ge:
          return "SuspenseList";
        case V:
          return "Activity";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case Te:
            return "Portal";
          case X:
            return e.displayName || "Context";
          case P:
            return (e._context.displayName || "Context") + ".Consumer";
          case ne:
            var t = e.render;
            return (
              (e = e.displayName),
              e ||
                ((e = t.displayName || t.name || ""),
                (e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")),
              e
            );
          case F:
            return (
              (t = e.displayName || null),
              t !== null ? t : We(e.type) || "Memo"
            );
          case ye:
            ((t = e._payload), (e = e._init));
            try {
              return We(e(t));
            } catch {}
        }
      return null;
    }
    var j = Array.isArray,
      U = u.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
      B = c.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
      W = { pending: !1, data: null, method: null, action: null },
      k = [],
      I = -1;
    function g(e) {
      return { current: e };
    }
    function R(e) {
      0 > I || ((e.current = k[I]), (k[I] = null), I--);
    }
    function Z(e, t) {
      (I++, (k[I] = e.current), (e.current = t));
    }
    var L = g(null),
      ie = g(null),
      le = g(null),
      pe = g(null);
    function rt(e, t) {
      switch ((Z(le, t), Z(ie, e), Z(L, null), t.nodeType)) {
        case 9:
        case 11:
          e = (e = t.documentElement) && (e = e.namespaceURI) ? Ed(e) : 0;
          break;
        default:
          if (((e = t.tagName), (t = t.namespaceURI)))
            ((t = Ed(t)), (e = wd(t, e)));
          else
            switch (e) {
              case "svg":
                e = 1;
                break;
              case "math":
                e = 2;
                break;
              default:
                e = 0;
            }
      }
      (R(L), Z(L, e));
    }
    function Be() {
      (R(L), R(ie), R(le));
    }
    function gi(e) {
      e.memoizedState !== null && Z(pe, e);
      var t = L.current,
        a = wd(t, e.type);
      t !== a && (Z(ie, e), Z(L, a));
    }
    function Sl(e) {
      (ie.current === e && (R(L), R(ie)),
        pe.current === e && (R(pe), (ll._currentValue = W)));
    }
    var ur, tc;
    function Kn(e) {
      if (ur === void 0)
        try {
          throw Error();
        } catch (a) {
          var t = a.stack.trim().match(/\n( *(at )?)/);
          ((ur = (t && t[1]) || ""),
            (tc =
              -1 <
              a.stack.indexOf(`
    at`)
                ? " (<anonymous>)"
                : -1 < a.stack.indexOf("@")
                  ? "@unknown:0:0"
                  : ""));
        }
      return (
        `
` +
        ur +
        e +
        tc
      );
    }
    var rr = !1;
    function or(e, t) {
      if (!e || rr) return "";
      rr = !0;
      var a = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      try {
        var l = {
          DetermineComponentFrameRoot: function () {
            try {
              if (t) {
                var D = function () {
                  throw Error();
                };
                if (
                  (Object.defineProperty(D.prototype, "props", {
                    set: function () {
                      throw Error();
                    },
                  }),
                  typeof Reflect == "object" && Reflect.construct)
                ) {
                  try {
                    Reflect.construct(D, []);
                  } catch (O) {
                    var E = O;
                  }
                  Reflect.construct(e, [], D);
                } else {
                  try {
                    D.call();
                  } catch (O) {
                    E = O;
                  }
                  e.call(D.prototype);
                }
              } else {
                try {
                  throw Error();
                } catch (O) {
                  E = O;
                }
                (D = e()) &&
                  typeof D.catch == "function" &&
                  D.catch(function () {});
              }
            } catch (O) {
              if (O && E && typeof O.stack == "string")
                return [O.stack, E.stack];
            }
            return [null, null];
          },
        };
        l.DetermineComponentFrameRoot.displayName =
          "DetermineComponentFrameRoot";
        var r = Object.getOwnPropertyDescriptor(
          l.DetermineComponentFrameRoot,
          "name",
        );
        r &&
          r.configurable &&
          Object.defineProperty(l.DetermineComponentFrameRoot, "name", {
            value: "DetermineComponentFrameRoot",
          });
        var o = l.DetermineComponentFrameRoot(),
          f = o[0],
          m = o[1];
        if (f && m) {
          var y = f.split(`
`),
            A = m.split(`
`);
          for (
            r = l = 0;
            l < y.length && !y[l].includes("DetermineComponentFrameRoot");
          )
            l++;
          for (
            ;
            r < A.length && !A[r].includes("DetermineComponentFrameRoot");
          )
            r++;
          if (l === y.length || r === A.length)
            for (
              l = y.length - 1, r = A.length - 1;
              1 <= l && 0 <= r && y[l] !== A[r];
            )
              r--;
          for (; 1 <= l && 0 <= r; l--, r--)
            if (y[l] !== A[r]) {
              if (l !== 1 || r !== 1)
                do
                  if ((l--, r--, 0 > r || y[l] !== A[r])) {
                    var C =
                      `
` + y[l].replace(" at new ", " at ");
                    return (
                      e.displayName &&
                        C.includes("<anonymous>") &&
                        (C = C.replace("<anonymous>", e.displayName)),
                      C
                    );
                  }
                while (1 <= l && 0 <= r);
              break;
            }
        }
      } finally {
        ((rr = !1), (Error.prepareStackTrace = a));
      }
      return (a = e ? e.displayName || e.name : "") ? Kn(a) : "";
    }
    function qv(e, t) {
      switch (e.tag) {
        case 26:
        case 27:
        case 5:
          return Kn(e.type);
        case 16:
          return Kn("Lazy");
        case 13:
          return e.child !== t && t !== null
            ? Kn("Suspense Fallback")
            : Kn("Suspense");
        case 19:
          return Kn("SuspenseList");
        case 0:
        case 15:
          return or(e.type, !1);
        case 11:
          return or(e.type.render, !1);
        case 1:
          return or(e.type, !0);
        case 31:
          return Kn("Activity");
        default:
          return "";
      }
    }
    function nc(e) {
      try {
        var t = "",
          a = null;
        do ((t += qv(e, a)), (a = e), (e = e.return));
        while (e);
        return t;
      } catch (l) {
        return (
          `
Error generating stack: ` +
          l.message +
          `
` +
          l.stack
        );
      }
    }
    var sr = Object.prototype.hasOwnProperty,
      cr = i.unstable_scheduleCallback,
      fr = i.unstable_cancelCallback,
      Uv = i.unstable_shouldYield,
      jv = i.unstable_requestPaint,
      St = i.unstable_now,
      Zv = i.unstable_getCurrentPriorityLevel,
      ac = i.unstable_ImmediatePriority,
      ic = i.unstable_UserBlockingPriority,
      _l = i.unstable_NormalPriority,
      xv = i.unstable_LowPriority,
      lc = i.unstable_IdlePriority,
      Bv = i.log,
      Qv = i.unstable_setDisableYieldValue,
      yi = null,
      _t = null;
    function zn(e) {
      if (
        (typeof Bv == "function" && Qv(e),
        _t && typeof _t.setStrictMode == "function")
      )
        try {
          _t.setStrictMode(yi, e);
        } catch {}
    }
    var Tt = Math.clz32 ? Math.clz32 : Hv,
      $v = Math.log,
      Lv = Math.LN2;
    function Hv(e) {
      return ((e >>>= 0), e === 0 ? 32 : (31 - (($v(e) / Lv) | 0)) | 0);
    }
    var Tl = 256,
      zl = 262144,
      Al = 4194304;
    function In(e) {
      var t = e & 42;
      if (t !== 0) return t;
      switch (e & -e) {
        case 1:
          return 1;
        case 2:
          return 2;
        case 4:
          return 4;
        case 8:
          return 8;
        case 16:
          return 16;
        case 32:
          return 32;
        case 64:
          return 64;
        case 128:
          return 128;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
          return e & 261888;
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return e & 3932160;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          return e & 62914560;
        case 67108864:
          return 67108864;
        case 134217728:
          return 134217728;
        case 268435456:
          return 268435456;
        case 536870912:
          return 536870912;
        case 1073741824:
          return 0;
        default:
          return e;
      }
    }
    function El(e, t, a) {
      var l = e.pendingLanes;
      if (l === 0) return 0;
      var r = 0,
        o = e.suspendedLanes,
        f = e.pingedLanes;
      e = e.warmLanes;
      var m = l & 134217727;
      return (
        m !== 0
          ? ((l = m & ~o),
            l !== 0
              ? (r = In(l))
              : ((f &= m),
                f !== 0
                  ? (r = In(f))
                  : a || ((a = m & ~e), a !== 0 && (r = In(a)))))
          : ((m = l & ~o),
            m !== 0
              ? (r = In(m))
              : f !== 0
                ? (r = In(f))
                : a || ((a = l & ~e), a !== 0 && (r = In(a)))),
        r === 0
          ? 0
          : t !== 0 &&
              t !== r &&
              (t & o) === 0 &&
              ((o = r & -r),
              (a = t & -t),
              o >= a || (o === 32 && (a & 4194048) !== 0))
            ? t
            : r
      );
    }
    function pi(e, t) {
      return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
    }
    function Vv(e, t) {
      switch (e) {
        case 1:
        case 2:
        case 4:
        case 8:
        case 64:
          return t + 250;
        case 16:
        case 32:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return t + 5e3;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          return -1;
        case 67108864:
        case 134217728:
        case 268435456:
        case 536870912:
        case 1073741824:
          return -1;
        default:
          return -1;
      }
    }
    function uc() {
      var e = Al;
      return ((Al <<= 1), (Al & 62914560) === 0 && (Al = 4194304), e);
    }
    function hr(e) {
      for (var t = [], a = 0; 31 > a; a++) t.push(e);
      return t;
    }
    function wl(e, t) {
      ((e.pendingLanes |= t),
        t !== 268435456 &&
          ((e.suspendedLanes = 0), (e.pingedLanes = 0), (e.warmLanes = 0)));
    }
    function Gv(e, t, a, l, r, o) {
      var f = e.pendingLanes;
      ((e.pendingLanes = a),
        (e.suspendedLanes = 0),
        (e.pingedLanes = 0),
        (e.warmLanes = 0),
        (e.expiredLanes &= a),
        (e.entangledLanes &= a),
        (e.errorRecoveryDisabledLanes &= a),
        (e.shellSuspendCounter = 0));
      var m = e.entanglements,
        y = e.expirationTimes,
        A = e.hiddenUpdates;
      for (a = f & ~a; 0 < a; ) {
        var C = 31 - Tt(a),
          D = 1 << C;
        ((m[C] = 0), (y[C] = -1));
        var E = A[C];
        if (E !== null)
          for (A[C] = null, C = 0; C < E.length; C++) {
            var O = E[C];
            O !== null && (O.lane &= -536870913);
          }
        a &= ~D;
      }
      (l !== 0 && rc(e, l, 0),
        o !== 0 &&
          r === 0 &&
          e.tag !== 0 &&
          (e.suspendedLanes |= o & ~(f & ~t)));
    }
    function rc(e, t, a) {
      ((e.pendingLanes |= t), (e.suspendedLanes &= ~t));
      var l = 31 - Tt(t);
      ((e.entangledLanes |= t),
        (e.entanglements[l] = e.entanglements[l] | 1073741824 | (a & 261930)));
    }
    function oc(e, t) {
      var a = (e.entangledLanes |= t);
      for (e = e.entanglements; a; ) {
        var l = 31 - Tt(a),
          r = 1 << l;
        ((r & t) | (e[l] & t) && (e[l] |= t), (a &= ~r));
      }
    }
    function sc(e, t) {
      var a = t & -t;
      return (
        (a = (a & 42) !== 0 ? 1 : cc(a)),
        (a & (e.suspendedLanes | t)) !== 0 ? 0 : a
      );
    }
    function cc(e) {
      switch (e) {
        case 2:
          e = 1;
          break;
        case 8:
          e = 4;
          break;
        case 32:
          e = 16;
          break;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          e = 128;
          break;
        case 268435456:
          e = 134217728;
          break;
        default:
          e = 0;
      }
      return e;
    }
    function dr(e) {
      return (
        (e &= -e),
        2 < e ? (8 < e ? ((e & 134217727) !== 0 ? 32 : 268435456) : 8) : 2
      );
    }
    function fc() {
      var e = B.p;
      return e !== 0 ? e : ((e = window.event), e === void 0 ? 32 : Xd(e.type));
    }
    function hc(e, t) {
      var a = B.p;
      try {
        return ((B.p = e), t());
      } finally {
        B.p = a;
      }
    }
    var An = Math.random().toString(36).slice(2),
      tt = "__reactFiber$" + An,
      ct = "__reactProps$" + An,
      bi = "__reactContainer$" + An,
      mr = "__reactEvents$" + An,
      Yv = "__reactListeners$" + An,
      Xv = "__reactHandles$" + An,
      dc = "__reactResources$" + An,
      Si = "__reactMarker$" + An;
    function vr(e) {
      (delete e[tt], delete e[ct], delete e[mr], delete e[Yv], delete e[Xv]);
    }
    function Aa(e) {
      var t = e[tt];
      if (t) return t;
      for (var a = e.parentNode; a; ) {
        if ((t = a[bi] || a[tt])) {
          if (
            ((a = t.alternate),
            t.child !== null || (a !== null && a.child !== null))
          )
            for (e = kd(e); e !== null; ) {
              if ((a = e[tt])) return a;
              e = kd(e);
            }
          return t;
        }
        ((e = a), (a = e.parentNode));
      }
      return null;
    }
    function Ea(e) {
      if ((e = e[tt] || e[bi])) {
        var t = e.tag;
        if (
          t === 5 ||
          t === 6 ||
          t === 13 ||
          t === 31 ||
          t === 26 ||
          t === 27 ||
          t === 3
        )
          return e;
      }
      return null;
    }
    function _i(e) {
      var t = e.tag;
      if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
      throw Error(s(33));
    }
    function wa(e) {
      var t = e[dc];
      return (
        t ||
          (t = e[dc] =
            { hoistableStyles: new Map(), hoistableScripts: new Map() }),
        t
      );
    }
    function Pe(e) {
      e[Si] = !0;
    }
    var mc = new Set(),
      vc = {};
    function Fn(e, t) {
      (Oa(e, t), Oa(e + "Capture", t));
    }
    function Oa(e, t) {
      for (vc[e] = t, e = 0; e < t.length; e++) mc.add(t[e]);
    }
    var Jv = RegExp(
        "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$",
      ),
      gc = {},
      yc = {};
    function Kv(e) {
      return sr.call(yc, e)
        ? !0
        : sr.call(gc, e)
          ? !1
          : Jv.test(e)
            ? (yc[e] = !0)
            : ((gc[e] = !0), !1);
    }
    function Ol(e, t, a) {
      if (Kv(t))
        if (a === null) e.removeAttribute(t);
        else {
          switch (typeof a) {
            case "undefined":
            case "function":
            case "symbol":
              e.removeAttribute(t);
              return;
            case "boolean":
              var l = t.toLowerCase().slice(0, 5);
              if (l !== "data-" && l !== "aria-") {
                e.removeAttribute(t);
                return;
              }
          }
          e.setAttribute(t, "" + a);
        }
    }
    function Rl(e, t, a) {
      if (a === null) e.removeAttribute(t);
      else {
        switch (typeof a) {
          case "undefined":
          case "function":
          case "symbol":
          case "boolean":
            e.removeAttribute(t);
            return;
        }
        e.setAttribute(t, "" + a);
      }
    }
    function en(e, t, a, l) {
      if (l === null) e.removeAttribute(a);
      else {
        switch (typeof l) {
          case "undefined":
          case "function":
          case "symbol":
          case "boolean":
            e.removeAttribute(a);
            return;
        }
        e.setAttributeNS(t, a, "" + l);
      }
    }
    function Ct(e) {
      switch (typeof e) {
        case "bigint":
        case "boolean":
        case "number":
        case "string":
        case "undefined":
          return e;
        case "object":
          return e;
        default:
          return "";
      }
    }
    function pc(e) {
      var t = e.type;
      return (
        (e = e.nodeName) &&
        e.toLowerCase() === "input" &&
        (t === "checkbox" || t === "radio")
      );
    }
    function Iv(e, t, a) {
      var l = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
      if (
        !e.hasOwnProperty(t) &&
        typeof l < "u" &&
        typeof l.get == "function" &&
        typeof l.set == "function"
      ) {
        var r = l.get,
          o = l.set;
        return (
          Object.defineProperty(e, t, {
            configurable: !0,
            get: function () {
              return r.call(this);
            },
            set: function (f) {
              ((a = "" + f), o.call(this, f));
            },
          }),
          Object.defineProperty(e, t, { enumerable: l.enumerable }),
          {
            getValue: function () {
              return a;
            },
            setValue: function (f) {
              a = "" + f;
            },
            stopTracking: function () {
              ((e._valueTracker = null), delete e[t]);
            },
          }
        );
      }
    }
    function gr(e) {
      if (!e._valueTracker) {
        var t = pc(e) ? "checked" : "value";
        e._valueTracker = Iv(e, t, "" + e[t]);
      }
    }
    function bc(e) {
      if (!e) return !1;
      var t = e._valueTracker;
      if (!t) return !0;
      var a = t.getValue(),
        l = "";
      return (
        e && (l = pc(e) ? (e.checked ? "true" : "false") : e.value),
        (e = l),
        e !== a ? (t.setValue(e), !0) : !1
      );
    }
    function Cl(e) {
      if (
        ((e = e || (typeof document < "u" ? document : void 0)), typeof e > "u")
      )
        return null;
      try {
        return e.activeElement || e.body;
      } catch {
        return e.body;
      }
    }
    var Fv = /[\n"\\]/g;
    function Mt(e) {
      return e.replace(Fv, function (t) {
        return "\\" + t.charCodeAt(0).toString(16) + " ";
      });
    }
    function yr(e, t, a, l, r, o, f, m) {
      ((e.name = ""),
        f != null &&
        typeof f != "function" &&
        typeof f != "symbol" &&
        typeof f != "boolean"
          ? (e.type = f)
          : e.removeAttribute("type"),
        t != null
          ? f === "number"
            ? ((t === 0 && e.value === "") || e.value != t) &&
              (e.value = "" + Ct(t))
            : e.value !== "" + Ct(t) && (e.value = "" + Ct(t))
          : (f !== "submit" && f !== "reset") || e.removeAttribute("value"),
        t != null
          ? pr(e, f, Ct(t))
          : a != null
            ? pr(e, f, Ct(a))
            : l != null && e.removeAttribute("value"),
        r == null && o != null && (e.defaultChecked = !!o),
        r != null &&
          (e.checked = r && typeof r != "function" && typeof r != "symbol"),
        m != null &&
        typeof m != "function" &&
        typeof m != "symbol" &&
        typeof m != "boolean"
          ? (e.name = "" + Ct(m))
          : e.removeAttribute("name"));
    }
    function Sc(e, t, a, l, r, o, f, m) {
      if (
        (o != null &&
          typeof o != "function" &&
          typeof o != "symbol" &&
          typeof o != "boolean" &&
          (e.type = o),
        t != null || a != null)
      ) {
        if (!((o !== "submit" && o !== "reset") || t != null)) {
          gr(e);
          return;
        }
        ((a = a != null ? "" + Ct(a) : ""),
          (t = t != null ? "" + Ct(t) : a),
          m || t === e.value || (e.value = t),
          (e.defaultValue = t));
      }
      ((l = l ?? r),
        (l = typeof l != "function" && typeof l != "symbol" && !!l),
        (e.checked = m ? e.checked : !!l),
        (e.defaultChecked = !!l),
        f != null &&
          typeof f != "function" &&
          typeof f != "symbol" &&
          typeof f != "boolean" &&
          (e.name = f),
        gr(e));
    }
    function pr(e, t, a) {
      (t === "number" && Cl(e.ownerDocument) === e) ||
        e.defaultValue === "" + a ||
        (e.defaultValue = "" + a);
    }
    function Ra(e, t, a, l) {
      if (((e = e.options), t)) {
        t = {};
        for (var r = 0; r < a.length; r++) t["$" + a[r]] = !0;
        for (a = 0; a < e.length; a++)
          ((r = t.hasOwnProperty("$" + e[a].value)),
            e[a].selected !== r && (e[a].selected = r),
            r && l && (e[a].defaultSelected = !0));
      } else {
        for (a = "" + Ct(a), t = null, r = 0; r < e.length; r++) {
          if (e[r].value === a) {
            ((e[r].selected = !0), l && (e[r].defaultSelected = !0));
            return;
          }
          t !== null || e[r].disabled || (t = e[r]);
        }
        t !== null && (t.selected = !0);
      }
    }
    function _c(e, t, a) {
      if (
        t != null &&
        ((t = "" + Ct(t)), t !== e.value && (e.value = t), a == null)
      ) {
        e.defaultValue !== t && (e.defaultValue = t);
        return;
      }
      e.defaultValue = a != null ? "" + Ct(a) : "";
    }
    function Tc(e, t, a, l) {
      if (t == null) {
        if (l != null) {
          if (a != null) throw Error(s(92));
          if (j(l)) {
            if (1 < l.length) throw Error(s(93));
            l = l[0];
          }
          a = l;
        }
        ((a ??= ""), (t = a));
      }
      ((a = Ct(t)),
        (e.defaultValue = a),
        (l = e.textContent),
        l === a && l !== "" && l !== null && (e.value = l),
        gr(e));
    }
    function Ca(e, t) {
      if (t) {
        var a = e.firstChild;
        if (a && a === e.lastChild && a.nodeType === 3) {
          a.nodeValue = t;
          return;
        }
      }
      e.textContent = t;
    }
    var Wv = new Set(
      "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
        " ",
      ),
    );
    function zc(e, t, a) {
      var l = t.indexOf("--") === 0;
      a == null || typeof a == "boolean" || a === ""
        ? l
          ? e.setProperty(t, "")
          : t === "float"
            ? (e.cssFloat = "")
            : (e[t] = "")
        : l
          ? e.setProperty(t, a)
          : typeof a != "number" || a === 0 || Wv.has(t)
            ? t === "float"
              ? (e.cssFloat = a)
              : (e[t] = ("" + a).trim())
            : (e[t] = a + "px");
    }
    function Ac(e, t, a) {
      if (t != null && typeof t != "object") throw Error(s(62));
      if (((e = e.style), a != null)) {
        for (var l in a)
          !a.hasOwnProperty(l) ||
            (t != null && t.hasOwnProperty(l)) ||
            (l.indexOf("--") === 0
              ? e.setProperty(l, "")
              : l === "float"
                ? (e.cssFloat = "")
                : (e[l] = ""));
        for (var r in t)
          ((l = t[r]), t.hasOwnProperty(r) && a[r] !== l && zc(e, r, l));
      } else for (var o in t) t.hasOwnProperty(o) && zc(e, o, t[o]);
    }
    function br(e) {
      if (e.indexOf("-") === -1) return !1;
      switch (e) {
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          return !1;
        default:
          return !0;
      }
    }
    var Pv = new Map([
        ["acceptCharset", "accept-charset"],
        ["htmlFor", "for"],
        ["httpEquiv", "http-equiv"],
        ["crossOrigin", "crossorigin"],
        ["accentHeight", "accent-height"],
        ["alignmentBaseline", "alignment-baseline"],
        ["arabicForm", "arabic-form"],
        ["baselineShift", "baseline-shift"],
        ["capHeight", "cap-height"],
        ["clipPath", "clip-path"],
        ["clipRule", "clip-rule"],
        ["colorInterpolation", "color-interpolation"],
        ["colorInterpolationFilters", "color-interpolation-filters"],
        ["colorProfile", "color-profile"],
        ["colorRendering", "color-rendering"],
        ["dominantBaseline", "dominant-baseline"],
        ["enableBackground", "enable-background"],
        ["fillOpacity", "fill-opacity"],
        ["fillRule", "fill-rule"],
        ["floodColor", "flood-color"],
        ["floodOpacity", "flood-opacity"],
        ["fontFamily", "font-family"],
        ["fontSize", "font-size"],
        ["fontSizeAdjust", "font-size-adjust"],
        ["fontStretch", "font-stretch"],
        ["fontStyle", "font-style"],
        ["fontVariant", "font-variant"],
        ["fontWeight", "font-weight"],
        ["glyphName", "glyph-name"],
        ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
        ["glyphOrientationVertical", "glyph-orientation-vertical"],
        ["horizAdvX", "horiz-adv-x"],
        ["horizOriginX", "horiz-origin-x"],
        ["imageRendering", "image-rendering"],
        ["letterSpacing", "letter-spacing"],
        ["lightingColor", "lighting-color"],
        ["markerEnd", "marker-end"],
        ["markerMid", "marker-mid"],
        ["markerStart", "marker-start"],
        ["overlinePosition", "overline-position"],
        ["overlineThickness", "overline-thickness"],
        ["paintOrder", "paint-order"],
        ["panose-1", "panose-1"],
        ["pointerEvents", "pointer-events"],
        ["renderingIntent", "rendering-intent"],
        ["shapeRendering", "shape-rendering"],
        ["stopColor", "stop-color"],
        ["stopOpacity", "stop-opacity"],
        ["strikethroughPosition", "strikethrough-position"],
        ["strikethroughThickness", "strikethrough-thickness"],
        ["strokeDasharray", "stroke-dasharray"],
        ["strokeDashoffset", "stroke-dashoffset"],
        ["strokeLinecap", "stroke-linecap"],
        ["strokeLinejoin", "stroke-linejoin"],
        ["strokeMiterlimit", "stroke-miterlimit"],
        ["strokeOpacity", "stroke-opacity"],
        ["strokeWidth", "stroke-width"],
        ["textAnchor", "text-anchor"],
        ["textDecoration", "text-decoration"],
        ["textRendering", "text-rendering"],
        ["transformOrigin", "transform-origin"],
        ["underlinePosition", "underline-position"],
        ["underlineThickness", "underline-thickness"],
        ["unicodeBidi", "unicode-bidi"],
        ["unicodeRange", "unicode-range"],
        ["unitsPerEm", "units-per-em"],
        ["vAlphabetic", "v-alphabetic"],
        ["vHanging", "v-hanging"],
        ["vIdeographic", "v-ideographic"],
        ["vMathematical", "v-mathematical"],
        ["vectorEffect", "vector-effect"],
        ["vertAdvY", "vert-adv-y"],
        ["vertOriginX", "vert-origin-x"],
        ["vertOriginY", "vert-origin-y"],
        ["wordSpacing", "word-spacing"],
        ["writingMode", "writing-mode"],
        ["xmlnsXlink", "xmlns:xlink"],
        ["xHeight", "x-height"],
      ]),
      eg =
        /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
    function Ml(e) {
      return eg.test("" + e)
        ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
        : e;
    }
    function tn() {}
    var Sr = null;
    function _r(e) {
      return (
        (e = e.target || e.srcElement || window),
        e.correspondingUseElement && (e = e.correspondingUseElement),
        e.nodeType === 3 ? e.parentNode : e
      );
    }
    var Ma = null,
      Na = null;
    function Ec(e) {
      var t = Ea(e);
      if (t && (e = t.stateNode)) {
        var a = e[ct] || null;
        e: switch (((e = t.stateNode), t.type)) {
          case "input":
            if (
              (yr(
                e,
                a.value,
                a.defaultValue,
                a.defaultValue,
                a.checked,
                a.defaultChecked,
                a.type,
                a.name,
              ),
              (t = a.name),
              a.type === "radio" && t != null)
            ) {
              for (a = e; a.parentNode; ) a = a.parentNode;
              for (
                a = a.querySelectorAll(
                  'input[name="' + Mt("" + t) + '"][type="radio"]',
                ),
                  t = 0;
                t < a.length;
                t++
              ) {
                var l = a[t];
                if (l !== e && l.form === e.form) {
                  var r = l[ct] || null;
                  if (!r) throw Error(s(90));
                  yr(
                    l,
                    r.value,
                    r.defaultValue,
                    r.defaultValue,
                    r.checked,
                    r.defaultChecked,
                    r.type,
                    r.name,
                  );
                }
              }
              for (t = 0; t < a.length; t++)
                ((l = a[t]), l.form === e.form && bc(l));
            }
            break e;
          case "textarea":
            _c(e, a.value, a.defaultValue);
            break e;
          case "select":
            ((t = a.value), t != null && Ra(e, !!a.multiple, t, !1));
        }
      }
    }
    var Tr = !1;
    function wc(e, t, a) {
      if (Tr) return e(t, a);
      Tr = !0;
      try {
        return e(t);
      } finally {
        if (
          ((Tr = !1),
          (Ma !== null || Na !== null) &&
            (yu(), Ma && ((t = Ma), (e = Na), (Na = Ma = null), Ec(t), e)))
        )
          for (t = 0; t < e.length; t++) Ec(e[t]);
      }
    }
    function Ti(e, t) {
      var a = e.stateNode;
      if (a === null) return null;
      var l = a[ct] || null;
      if (l === null) return null;
      a = l[t];
      e: switch (t) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
          ((l = !l.disabled) ||
            ((e = e.type),
            (l = !(
              e === "button" ||
              e === "input" ||
              e === "select" ||
              e === "textarea"
            ))),
            (e = !l));
          break e;
        default:
          e = !1;
      }
      if (e) return null;
      if (a && typeof a != "function") throw Error(s(231, t, typeof a));
      return a;
    }
    var nn = !(
        typeof window > "u" ||
        typeof window.document > "u" ||
        typeof window.document.createElement > "u"
      ),
      zr = !1;
    if (nn)
      try {
        var zi = {};
        (Object.defineProperty(zi, "passive", {
          get: function () {
            zr = !0;
          },
        }),
          window.addEventListener("test", zi, zi),
          window.removeEventListener("test", zi, zi));
      } catch {
        zr = !1;
      }
    var En = null,
      Ar = null,
      Nl = null;
    function Oc() {
      if (Nl) return Nl;
      var e,
        t = Ar,
        a = t.length,
        l,
        r = "value" in En ? En.value : En.textContent,
        o = r.length;
      for (e = 0; e < a && t[e] === r[e]; e++);
      var f = a - e;
      for (l = 1; l <= f && t[a - l] === r[o - l]; l++);
      return (Nl = r.slice(e, 1 < l ? 1 - l : void 0));
    }
    function Dl(e) {
      var t = e.keyCode;
      return (
        "charCode" in e
          ? ((e = e.charCode), e === 0 && t === 13 && (e = 13))
          : (e = t),
        e === 10 && (e = 13),
        32 <= e || e === 13 ? e : 0
      );
    }
    function kl() {
      return !0;
    }
    function Rc() {
      return !1;
    }
    function ft(e) {
      function t(a, l, r, o, f) {
        ((this._reactName = a),
          (this._targetInst = r),
          (this.type = l),
          (this.nativeEvent = o),
          (this.target = f),
          (this.currentTarget = null));
        for (var m in e)
          e.hasOwnProperty(m) && ((a = e[m]), (this[m] = a ? a(o) : o[m]));
        return (
          (this.isDefaultPrevented = (
            o.defaultPrevented != null
              ? o.defaultPrevented
              : o.returnValue === !1
          )
            ? kl
            : Rc),
          (this.isPropagationStopped = Rc),
          this
        );
      }
      return (
        w(t.prototype, {
          preventDefault: function () {
            this.defaultPrevented = !0;
            var a = this.nativeEvent;
            a &&
              (a.preventDefault
                ? a.preventDefault()
                : typeof a.returnValue != "unknown" && (a.returnValue = !1),
              (this.isDefaultPrevented = kl));
          },
          stopPropagation: function () {
            var a = this.nativeEvent;
            a &&
              (a.stopPropagation
                ? a.stopPropagation()
                : typeof a.cancelBubble != "unknown" && (a.cancelBubble = !0),
              (this.isPropagationStopped = kl));
          },
          persist: function () {},
          isPersistent: kl,
        }),
        t
      );
    }
    var Wn = {
        eventPhase: 0,
        bubbles: 0,
        cancelable: 0,
        timeStamp: function (e) {
          return e.timeStamp || Date.now();
        },
        defaultPrevented: 0,
        isTrusted: 0,
      },
      ql = ft(Wn),
      Ai = w({}, Wn, { view: 0, detail: 0 }),
      tg = ft(Ai),
      Er,
      wr,
      Ei,
      Ul = w({}, Ai, {
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        getModifierState: Rr,
        button: 0,
        buttons: 0,
        relatedTarget: function (e) {
          return e.relatedTarget === void 0
            ? e.fromElement === e.srcElement
              ? e.toElement
              : e.fromElement
            : e.relatedTarget;
        },
        movementX: function (e) {
          return "movementX" in e
            ? e.movementX
            : (e !== Ei &&
                (Ei && e.type === "mousemove"
                  ? ((Er = e.screenX - Ei.screenX),
                    (wr = e.screenY - Ei.screenY))
                  : (wr = Er = 0),
                (Ei = e)),
              Er);
        },
        movementY: function (e) {
          return "movementY" in e ? e.movementY : wr;
        },
      }),
      Cc = ft(Ul),
      ng = ft(w({}, Ul, { dataTransfer: 0 })),
      Or = ft(w({}, Ai, { relatedTarget: 0 })),
      ag = ft(
        w({}, Wn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
      ),
      ig = ft(
        w({}, Wn, {
          clipboardData: function (e) {
            return "clipboardData" in e
              ? e.clipboardData
              : window.clipboardData;
          },
        }),
      ),
      Mc = ft(w({}, Wn, { data: 0 })),
      lg = {
        Esc: "Escape",
        Spacebar: " ",
        Left: "ArrowLeft",
        Up: "ArrowUp",
        Right: "ArrowRight",
        Down: "ArrowDown",
        Del: "Delete",
        Win: "OS",
        Menu: "ContextMenu",
        Apps: "ContextMenu",
        Scroll: "ScrollLock",
        MozPrintableKey: "Unidentified",
      },
      ug = {
        8: "Backspace",
        9: "Tab",
        12: "Clear",
        13: "Enter",
        16: "Shift",
        17: "Control",
        18: "Alt",
        19: "Pause",
        20: "CapsLock",
        27: "Escape",
        32: " ",
        33: "PageUp",
        34: "PageDown",
        35: "End",
        36: "Home",
        37: "ArrowLeft",
        38: "ArrowUp",
        39: "ArrowRight",
        40: "ArrowDown",
        45: "Insert",
        46: "Delete",
        112: "F1",
        113: "F2",
        114: "F3",
        115: "F4",
        116: "F5",
        117: "F6",
        118: "F7",
        119: "F8",
        120: "F9",
        121: "F10",
        122: "F11",
        123: "F12",
        144: "NumLock",
        145: "ScrollLock",
        224: "Meta",
      },
      rg = {
        Alt: "altKey",
        Control: "ctrlKey",
        Meta: "metaKey",
        Shift: "shiftKey",
      };
    function og(e) {
      var t = this.nativeEvent;
      return t.getModifierState
        ? t.getModifierState(e)
        : (e = rg[e])
          ? !!t[e]
          : !1;
    }
    function Rr() {
      return og;
    }
    var sg = ft(
        w({}, Ai, {
          key: function (e) {
            if (e.key) {
              var t = lg[e.key] || e.key;
              if (t !== "Unidentified") return t;
            }
            return e.type === "keypress"
              ? ((e = Dl(e)), e === 13 ? "Enter" : String.fromCharCode(e))
              : e.type === "keydown" || e.type === "keyup"
                ? ug[e.keyCode] || "Unidentified"
                : "";
          },
          code: 0,
          location: 0,
          ctrlKey: 0,
          shiftKey: 0,
          altKey: 0,
          metaKey: 0,
          repeat: 0,
          locale: 0,
          getModifierState: Rr,
          charCode: function (e) {
            return e.type === "keypress" ? Dl(e) : 0;
          },
          keyCode: function (e) {
            return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
          },
          which: function (e) {
            return e.type === "keypress"
              ? Dl(e)
              : e.type === "keydown" || e.type === "keyup"
                ? e.keyCode
                : 0;
          },
        }),
      ),
      Nc = ft(
        w({}, Ul, {
          pointerId: 0,
          width: 0,
          height: 0,
          pressure: 0,
          tangentialPressure: 0,
          tiltX: 0,
          tiltY: 0,
          twist: 0,
          pointerType: 0,
          isPrimary: 0,
        }),
      ),
      cg = ft(
        w({}, Ai, {
          touches: 0,
          targetTouches: 0,
          changedTouches: 0,
          altKey: 0,
          metaKey: 0,
          ctrlKey: 0,
          shiftKey: 0,
          getModifierState: Rr,
        }),
      ),
      fg = ft(w({}, Wn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 })),
      hg = ft(
        w({}, Ul, {
          deltaX: function (e) {
            return "deltaX" in e
              ? e.deltaX
              : "wheelDeltaX" in e
                ? -e.wheelDeltaX
                : 0;
          },
          deltaY: function (e) {
            return "deltaY" in e
              ? e.deltaY
              : "wheelDeltaY" in e
                ? -e.wheelDeltaY
                : "wheelDelta" in e
                  ? -e.wheelDelta
                  : 0;
          },
          deltaZ: 0,
          deltaMode: 0,
        }),
      ),
      dg = ft(w({}, Wn, { newState: 0, oldState: 0 })),
      mg = [9, 13, 27, 32],
      Cr = nn && "CompositionEvent" in window,
      wi = null;
    nn && "documentMode" in document && (wi = document.documentMode);
    var vg = nn && "TextEvent" in window && !wi,
      Dc = nn && (!Cr || (wi && 8 < wi && 11 >= wi)),
      kc = " ",
      qc = !1;
    function Uc(e, t) {
      switch (e) {
        case "keyup":
          return mg.indexOf(t.keyCode) !== -1;
        case "keydown":
          return t.keyCode !== 229;
        case "keypress":
        case "mousedown":
        case "focusout":
          return !0;
        default:
          return !1;
      }
    }
    function jc(e) {
      return (
        (e = e.detail),
        typeof e == "object" && "data" in e ? e.data : null
      );
    }
    var Da = !1;
    function gg(e, t) {
      switch (e) {
        case "compositionend":
          return jc(t);
        case "keypress":
          return t.which !== 32 ? null : ((qc = !0), kc);
        case "textInput":
          return ((e = t.data), e === kc && qc ? null : e);
        default:
          return null;
      }
    }
    function yg(e, t) {
      if (Da)
        return e === "compositionend" || (!Cr && Uc(e, t))
          ? ((e = Oc()), (Nl = Ar = En = null), (Da = !1), e)
          : null;
      switch (e) {
        case "paste":
          return null;
        case "keypress":
          if (
            !(t.ctrlKey || t.altKey || t.metaKey) ||
            (t.ctrlKey && t.altKey)
          ) {
            if (t.char && 1 < t.char.length) return t.char;
            if (t.which) return String.fromCharCode(t.which);
          }
          return null;
        case "compositionend":
          return Dc && t.locale !== "ko" ? null : t.data;
        default:
          return null;
      }
    }
    var pg = {
      color: !0,
      date: !0,
      datetime: !0,
      "datetime-local": !0,
      email: !0,
      month: !0,
      number: !0,
      password: !0,
      range: !0,
      search: !0,
      tel: !0,
      text: !0,
      time: !0,
      url: !0,
      week: !0,
    };
    function Zc(e) {
      var t = e && e.nodeName && e.nodeName.toLowerCase();
      return t === "input" ? !!pg[e.type] : t === "textarea";
    }
    function xc(e, t, a, l) {
      (Ma ? (Na ? Na.push(l) : (Na = [l])) : (Ma = l),
        (t = Au(t, "onChange")),
        0 < t.length &&
          ((a = new ql("onChange", "change", null, a, l)),
          e.push({ event: a, listeners: t })));
    }
    var Oi = null,
      Ri = null;
    function bg(e) {
      pd(e, 0);
    }
    function jl(e) {
      if (bc(_i(e))) return e;
    }
    function Bc(e, t) {
      if (e === "change") return t;
    }
    var Qc = !1;
    if (nn) {
      var Mr;
      if (nn) {
        var Nr = "oninput" in document;
        if (!Nr) {
          var $c = document.createElement("div");
          ($c.setAttribute("oninput", "return;"),
            (Nr = typeof $c.oninput == "function"));
        }
        Mr = Nr;
      } else Mr = !1;
      Qc = Mr && (!document.documentMode || 9 < document.documentMode);
    }
    function Lc() {
      Oi && (Oi.detachEvent("onpropertychange", Hc), (Ri = Oi = null));
    }
    function Hc(e) {
      if (e.propertyName === "value" && jl(Ri)) {
        var t = [];
        (xc(t, Ri, e, _r(e)), wc(bg, t));
      }
    }
    function Sg(e, t, a) {
      e === "focusin"
        ? (Lc(), (Oi = t), (Ri = a), Oi.attachEvent("onpropertychange", Hc))
        : e === "focusout" && Lc();
    }
    function _g(e) {
      if (e === "selectionchange" || e === "keyup" || e === "keydown")
        return jl(Ri);
    }
    function Tg(e, t) {
      if (e === "click") return jl(t);
    }
    function zg(e, t) {
      if (e === "input" || e === "change") return jl(t);
    }
    function Ag(e, t) {
      return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
    }
    var zt = typeof Object.is == "function" ? Object.is : Ag;
    function Ci(e, t) {
      if (zt(e, t)) return !0;
      if (
        typeof e != "object" ||
        e === null ||
        typeof t != "object" ||
        t === null
      )
        return !1;
      var a = Object.keys(e),
        l = Object.keys(t);
      if (a.length !== l.length) return !1;
      for (l = 0; l < a.length; l++) {
        var r = a[l];
        if (!sr.call(t, r) || !zt(e[r], t[r])) return !1;
      }
      return !0;
    }
    function Vc(e) {
      for (; e && e.firstChild; ) e = e.firstChild;
      return e;
    }
    function Gc(e, t) {
      var a = Vc(e);
      e = 0;
      for (var l; a; ) {
        if (a.nodeType === 3) {
          if (((l = e + a.textContent.length), e <= t && l >= t))
            return { node: a, offset: t - e };
          e = l;
        }
        e: {
          for (; a; ) {
            if (a.nextSibling) {
              a = a.nextSibling;
              break e;
            }
            a = a.parentNode;
          }
          a = void 0;
        }
        a = Vc(a);
      }
    }
    function Yc(e, t) {
      return e && t
        ? e === t
          ? !0
          : e && e.nodeType === 3
            ? !1
            : t && t.nodeType === 3
              ? Yc(e, t.parentNode)
              : "contains" in e
                ? e.contains(t)
                : e.compareDocumentPosition
                  ? !!(e.compareDocumentPosition(t) & 16)
                  : !1
        : !1;
    }
    function Xc(e) {
      e =
        e != null &&
        e.ownerDocument != null &&
        e.ownerDocument.defaultView != null
          ? e.ownerDocument.defaultView
          : window;
      for (var t = Cl(e.document); t instanceof e.HTMLIFrameElement; ) {
        try {
          var a = typeof t.contentWindow.location.href == "string";
        } catch {
          a = !1;
        }
        if (a) e = t.contentWindow;
        else break;
        t = Cl(e.document);
      }
      return t;
    }
    function Dr(e) {
      var t = e && e.nodeName && e.nodeName.toLowerCase();
      return (
        t &&
        ((t === "input" &&
          (e.type === "text" ||
            e.type === "search" ||
            e.type === "tel" ||
            e.type === "url" ||
            e.type === "password")) ||
          t === "textarea" ||
          e.contentEditable === "true")
      );
    }
    var Eg = nn && "documentMode" in document && 11 >= document.documentMode,
      ka = null,
      kr = null,
      Mi = null,
      qr = !1;
    function Jc(e, t, a) {
      var l =
        a.window === a ? a.document : a.nodeType === 9 ? a : a.ownerDocument;
      qr ||
        ka == null ||
        ka !== Cl(l) ||
        ((l = ka),
        "selectionStart" in l && Dr(l)
          ? (l = { start: l.selectionStart, end: l.selectionEnd })
          : ((l = (
              (l.ownerDocument && l.ownerDocument.defaultView) ||
              window
            ).getSelection()),
            (l = {
              anchorNode: l.anchorNode,
              anchorOffset: l.anchorOffset,
              focusNode: l.focusNode,
              focusOffset: l.focusOffset,
            })),
        (Mi && Ci(Mi, l)) ||
          ((Mi = l),
          (l = Au(kr, "onSelect")),
          0 < l.length &&
            ((t = new ql("onSelect", "select", null, t, a)),
            e.push({ event: t, listeners: l }),
            (t.target = ka))));
    }
    function Pn(e, t) {
      var a = {};
      return (
        (a[e.toLowerCase()] = t.toLowerCase()),
        (a["Webkit" + e] = "webkit" + t),
        (a["Moz" + e] = "moz" + t),
        a
      );
    }
    var qa = {
        animationend: Pn("Animation", "AnimationEnd"),
        animationiteration: Pn("Animation", "AnimationIteration"),
        animationstart: Pn("Animation", "AnimationStart"),
        transitionrun: Pn("Transition", "TransitionRun"),
        transitionstart: Pn("Transition", "TransitionStart"),
        transitioncancel: Pn("Transition", "TransitionCancel"),
        transitionend: Pn("Transition", "TransitionEnd"),
      },
      Ur = {},
      Kc = {};
    nn &&
      ((Kc = document.createElement("div").style),
      "AnimationEvent" in window ||
        (delete qa.animationend.animation,
        delete qa.animationiteration.animation,
        delete qa.animationstart.animation),
      "TransitionEvent" in window || delete qa.transitionend.transition);
    function ea(e) {
      if (Ur[e]) return Ur[e];
      if (!qa[e]) return e;
      var t = qa[e],
        a;
      for (a in t) if (t.hasOwnProperty(a) && a in Kc) return (Ur[e] = t[a]);
      return e;
    }
    var Ic = ea("animationend"),
      Fc = ea("animationiteration"),
      Wc = ea("animationstart"),
      wg = ea("transitionrun"),
      Og = ea("transitionstart"),
      Rg = ea("transitioncancel"),
      Pc = ea("transitionend"),
      ef = new Map(),
      jr =
        "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
          " ",
        );
    jr.push("scrollEnd");
    function Lt(e, t) {
      (ef.set(e, t), Fn(t, [e]));
    }
    var Zl =
        typeof reportError == "function"
          ? reportError
          : function (e) {
              if (
                typeof window == "object" &&
                typeof window.ErrorEvent == "function"
              ) {
                var t = new window.ErrorEvent("error", {
                  bubbles: !0,
                  cancelable: !0,
                  message:
                    typeof e == "object" &&
                    e !== null &&
                    typeof e.message == "string"
                      ? String(e.message)
                      : String(e),
                  error: e,
                });
                if (!window.dispatchEvent(t)) return;
              } else if (
                typeof process == "object" &&
                typeof process.emit == "function"
              ) {
                process.emit("uncaughtException", e);
                return;
              }
              console.error(e);
            },
      Nt = [],
      Ua = 0,
      Zr = 0;
    function xl() {
      for (var e = Ua, t = (Zr = Ua = 0); t < e; ) {
        var a = Nt[t];
        Nt[t++] = null;
        var l = Nt[t];
        Nt[t++] = null;
        var r = Nt[t];
        Nt[t++] = null;
        var o = Nt[t];
        if (((Nt[t++] = null), l !== null && r !== null)) {
          var f = l.pending;
          (f === null ? (r.next = r) : ((r.next = f.next), (f.next = r)),
            (l.pending = r));
        }
        o !== 0 && tf(a, r, o);
      }
    }
    function Bl(e, t, a, l) {
      ((Nt[Ua++] = e),
        (Nt[Ua++] = t),
        (Nt[Ua++] = a),
        (Nt[Ua++] = l),
        (Zr |= l),
        (e.lanes |= l),
        (e = e.alternate),
        e !== null && (e.lanes |= l));
    }
    function xr(e, t, a, l) {
      return (Bl(e, t, a, l), Ql(e));
    }
    function ta(e, t) {
      return (Bl(e, null, null, t), Ql(e));
    }
    function tf(e, t, a) {
      e.lanes |= a;
      var l = e.alternate;
      l !== null && (l.lanes |= a);
      for (var r = !1, o = e.return; o !== null; )
        ((o.childLanes |= a),
          (l = o.alternate),
          l !== null && (l.childLanes |= a),
          o.tag === 22 &&
            ((e = o.stateNode), e === null || e._visibility & 1 || (r = !0)),
          (e = o),
          (o = o.return));
      return e.tag === 3
        ? ((o = e.stateNode),
          r &&
            t !== null &&
            ((r = 31 - Tt(a)),
            (e = o.hiddenUpdates),
            (l = e[r]),
            l === null ? (e[r] = [t]) : l.push(t),
            (t.lane = a | 536870912)),
          o)
        : null;
    }
    function Ql(e) {
      if (50 < Wi) throw ((Wi = 0), (Jo = null), Error(s(185)));
      for (var t = e.return; t !== null; ) ((e = t), (t = e.return));
      return e.tag === 3 ? e.stateNode : null;
    }
    var ja = {};
    function Cg(e, t, a, l) {
      ((this.tag = e),
        (this.key = a),
        (this.sibling =
          this.child =
          this.return =
          this.stateNode =
          this.type =
          this.elementType =
            null),
        (this.index = 0),
        (this.refCleanup = this.ref = null),
        (this.pendingProps = t),
        (this.dependencies =
          this.memoizedState =
          this.updateQueue =
          this.memoizedProps =
            null),
        (this.mode = l),
        (this.subtreeFlags = this.flags = 0),
        (this.deletions = null),
        (this.childLanes = this.lanes = 0),
        (this.alternate = null));
    }
    function At(e, t, a, l) {
      return new Cg(e, t, a, l);
    }
    function Br(e) {
      return ((e = e.prototype), !(!e || !e.isReactComponent));
    }
    function an(e, t) {
      var a = e.alternate;
      return (
        a === null
          ? ((a = At(e.tag, t, e.key, e.mode)),
            (a.elementType = e.elementType),
            (a.type = e.type),
            (a.stateNode = e.stateNode),
            (a.alternate = e),
            (e.alternate = a))
          : ((a.pendingProps = t),
            (a.type = e.type),
            (a.flags = 0),
            (a.subtreeFlags = 0),
            (a.deletions = null)),
        (a.flags = e.flags & 65011712),
        (a.childLanes = e.childLanes),
        (a.lanes = e.lanes),
        (a.child = e.child),
        (a.memoizedProps = e.memoizedProps),
        (a.memoizedState = e.memoizedState),
        (a.updateQueue = e.updateQueue),
        (t = e.dependencies),
        (a.dependencies =
          t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
        (a.sibling = e.sibling),
        (a.index = e.index),
        (a.ref = e.ref),
        (a.refCleanup = e.refCleanup),
        a
      );
    }
    function nf(e, t) {
      e.flags &= 65011714;
      var a = e.alternate;
      return (
        a === null
          ? ((e.childLanes = 0),
            (e.lanes = t),
            (e.child = null),
            (e.subtreeFlags = 0),
            (e.memoizedProps = null),
            (e.memoizedState = null),
            (e.updateQueue = null),
            (e.dependencies = null),
            (e.stateNode = null))
          : ((e.childLanes = a.childLanes),
            (e.lanes = a.lanes),
            (e.child = a.child),
            (e.subtreeFlags = 0),
            (e.deletions = null),
            (e.memoizedProps = a.memoizedProps),
            (e.memoizedState = a.memoizedState),
            (e.updateQueue = a.updateQueue),
            (e.type = a.type),
            (t = a.dependencies),
            (e.dependencies =
              t === null
                ? null
                : { lanes: t.lanes, firstContext: t.firstContext })),
        e
      );
    }
    function $l(e, t, a, l, r, o) {
      var f = 0;
      if (((l = e), typeof e == "function")) Br(e) && (f = 1);
      else if (typeof e == "string")
        f = Uy(e, a, L.current)
          ? 26
          : e === "html" || e === "head" || e === "body"
            ? 27
            : 5;
      else
        e: switch (e) {
          case V:
            return (
              (e = At(31, a, t, r)),
              (e.elementType = V),
              (e.lanes = o),
              e
            );
          case xe:
            return na(a.children, r, o, t);
          case Fe:
            ((f = 8), (r |= 24));
            break;
          case qe:
            return (
              (e = At(12, a, t, r | 2)),
              (e.elementType = qe),
              (e.lanes = o),
              e
            );
          case ae:
            return (
              (e = At(13, a, t, r)),
              (e.elementType = ae),
              (e.lanes = o),
              e
            );
          case ge:
            return (
              (e = At(19, a, t, r)),
              (e.elementType = ge),
              (e.lanes = o),
              e
            );
          default:
            if (typeof e == "object" && e !== null)
              switch (e.$$typeof) {
                case X:
                  f = 10;
                  break e;
                case P:
                  f = 9;
                  break e;
                case ne:
                  f = 11;
                  break e;
                case F:
                  f = 14;
                  break e;
                case ye:
                  ((f = 16), (l = null));
                  break e;
              }
            ((f = 29),
              (a = Error(s(130, e === null ? "null" : typeof e, ""))),
              (l = null));
        }
      return (
        (t = At(f, a, t, r)),
        (t.elementType = e),
        (t.type = l),
        (t.lanes = o),
        t
      );
    }
    function na(e, t, a, l) {
      return ((e = At(7, e, l, t)), (e.lanes = a), e);
    }
    function Qr(e, t, a) {
      return ((e = At(6, e, null, t)), (e.lanes = a), e);
    }
    function af(e) {
      var t = At(18, null, null, 0);
      return ((t.stateNode = e), t);
    }
    function $r(e, t, a) {
      return (
        (t = At(4, e.children !== null ? e.children : [], e.key, t)),
        (t.lanes = a),
        (t.stateNode = {
          containerInfo: e.containerInfo,
          pendingChildren: null,
          implementation: e.implementation,
        }),
        t
      );
    }
    var lf = new WeakMap();
    function Dt(e, t) {
      if (typeof e == "object" && e !== null) {
        var a = lf.get(e);
        return a !== void 0
          ? a
          : ((t = { value: e, source: t, stack: nc(t) }), lf.set(e, t), t);
      }
      return { value: e, source: t, stack: nc(t) };
    }
    var Za = [],
      xa = 0,
      Ll = null,
      Ni = 0,
      kt = [],
      qt = 0,
      wn = null,
      Yt = 1,
      Xt = "";
    function ln(e, t) {
      ((Za[xa++] = Ni), (Za[xa++] = Ll), (Ll = e), (Ni = t));
    }
    function uf(e, t, a) {
      ((kt[qt++] = Yt), (kt[qt++] = Xt), (kt[qt++] = wn), (wn = e));
      var l = Yt;
      e = Xt;
      var r = 32 - Tt(l) - 1;
      ((l &= ~(1 << r)), (a += 1));
      var o = 32 - Tt(t) + r;
      if (30 < o) {
        var f = r - (r % 5);
        ((o = (l & ((1 << f) - 1)).toString(32)),
          (l >>= f),
          (r -= f),
          (Yt = (1 << (32 - Tt(t) + r)) | (a << r) | l),
          (Xt = o + e));
      } else ((Yt = (1 << o) | (a << r) | l), (Xt = e));
    }
    function Lr(e) {
      e.return !== null && (ln(e, 1), uf(e, 1, 0));
    }
    function Hr(e) {
      for (; e === Ll; )
        ((Ll = Za[--xa]), (Za[xa] = null), (Ni = Za[--xa]), (Za[xa] = null));
      for (; e === wn; )
        ((wn = kt[--qt]),
          (kt[qt] = null),
          (Xt = kt[--qt]),
          (kt[qt] = null),
          (Yt = kt[--qt]),
          (kt[qt] = null));
    }
    function rf(e, t) {
      ((kt[qt++] = Yt),
        (kt[qt++] = Xt),
        (kt[qt++] = wn),
        (Yt = t.id),
        (Xt = t.overflow),
        (wn = e));
    }
    var nt = null,
      Oe = null,
      ce = !1,
      On = null,
      Ut = !1,
      Vr = Error(s(519));
    function Rn(e) {
      throw (
        Di(
          Dt(
            Error(
              s(
                418,
                1 < arguments.length && arguments[1] !== void 0 && arguments[1]
                  ? "text"
                  : "HTML",
                "",
              ),
            ),
            e,
          ),
        ),
        Vr
      );
    }
    function of(e) {
      var t = e.stateNode,
        a = e.type,
        l = e.memoizedProps;
      switch (((t[tt] = e), (t[ct] = l), a)) {
        case "dialog":
          (re("cancel", t), re("close", t));
          break;
        case "iframe":
        case "object":
        case "embed":
          re("load", t);
          break;
        case "video":
        case "audio":
          for (a = 0; a < el.length; a++) re(el[a], t);
          break;
        case "source":
          re("error", t);
          break;
        case "img":
        case "image":
        case "link":
          (re("error", t), re("load", t));
          break;
        case "details":
          re("toggle", t);
          break;
        case "input":
          (re("invalid", t),
            Sc(
              t,
              l.value,
              l.defaultValue,
              l.checked,
              l.defaultChecked,
              l.type,
              l.name,
              !0,
            ));
          break;
        case "select":
          re("invalid", t);
          break;
        case "textarea":
          (re("invalid", t), Tc(t, l.value, l.defaultValue, l.children));
      }
      ((a = l.children),
        (typeof a != "string" &&
          typeof a != "number" &&
          typeof a != "bigint") ||
        t.textContent === "" + a ||
        l.suppressHydrationWarning === !0 ||
        zd(t.textContent, a)
          ? (l.popover != null && (re("beforetoggle", t), re("toggle", t)),
            l.onScroll != null && re("scroll", t),
            l.onScrollEnd != null && re("scrollend", t),
            l.onClick != null && (t.onclick = tn),
            (t = !0))
          : (t = !1),
        t || Rn(e, !0));
    }
    function sf(e) {
      for (nt = e.return; nt; )
        switch (nt.tag) {
          case 5:
          case 31:
          case 13:
            Ut = !1;
            return;
          case 27:
          case 3:
            Ut = !0;
            return;
          default:
            nt = nt.return;
        }
    }
    function Ba(e) {
      if (e !== nt) return !1;
      if (!ce) return (sf(e), (ce = !0), !1);
      var t = e.tag,
        a;
      if (
        ((a = t !== 3 && t !== 27) &&
          ((a = t === 5) &&
            ((a = e.type),
            (a =
              !(a !== "form" && a !== "button") ||
              os(e.type, e.memoizedProps))),
          (a = !a)),
        a && Oe && Rn(e),
        sf(e),
        t === 13)
      ) {
        if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
          throw Error(s(317));
        Oe = Dd(e);
      } else if (t === 31) {
        if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
          throw Error(s(317));
        Oe = Dd(e);
      } else
        t === 27
          ? ((t = Oe),
            Qn(e.type) ? ((e = ds), (ds = null), (Oe = e)) : (Oe = t))
          : (Oe = nt ? xt(e.stateNode.nextSibling) : null);
      return !0;
    }
    function aa() {
      ((Oe = nt = null), (ce = !1));
    }
    function Gr() {
      var e = On;
      return (
        e !== null &&
          (vt === null ? (vt = e) : vt.push.apply(vt, e), (On = null)),
        e
      );
    }
    function Di(e) {
      On === null ? (On = [e]) : On.push(e);
    }
    var Yr = g(null),
      ia = null,
      un = null;
    function Cn(e, t, a) {
      (Z(Yr, t._currentValue), (t._currentValue = a));
    }
    function rn(e) {
      ((e._currentValue = Yr.current), R(Yr));
    }
    function Xr(e, t, a) {
      for (; e !== null; ) {
        var l = e.alternate;
        if (
          ((e.childLanes & t) !== t
            ? ((e.childLanes |= t), l !== null && (l.childLanes |= t))
            : l !== null && (l.childLanes & t) !== t && (l.childLanes |= t),
          e === a)
        )
          break;
        e = e.return;
      }
    }
    function Jr(e, t, a, l) {
      var r = e.child;
      for (r !== null && (r.return = e); r !== null; ) {
        var o = r.dependencies;
        if (o !== null) {
          var f = r.child;
          o = o.firstContext;
          e: for (; o !== null; ) {
            var m = o;
            o = r;
            for (var y = 0; y < t.length; y++)
              if (m.context === t[y]) {
                ((o.lanes |= a),
                  (m = o.alternate),
                  m !== null && (m.lanes |= a),
                  Xr(o.return, a, e),
                  l || (f = null));
                break e;
              }
            o = m.next;
          }
        } else if (r.tag === 18) {
          if (((f = r.return), f === null)) throw Error(s(341));
          ((f.lanes |= a),
            (o = f.alternate),
            o !== null && (o.lanes |= a),
            Xr(f, a, e),
            (f = null));
        } else f = r.child;
        if (f !== null) f.return = r;
        else
          for (f = r; f !== null; ) {
            if (f === e) {
              f = null;
              break;
            }
            if (((r = f.sibling), r !== null)) {
              ((r.return = f.return), (f = r));
              break;
            }
            f = f.return;
          }
        r = f;
      }
    }
    function Qa(e, t, a, l) {
      e = null;
      for (var r = t, o = !1; r !== null; ) {
        if (!o) {
          if ((r.flags & 524288) !== 0) o = !0;
          else if ((r.flags & 262144) !== 0) break;
        }
        if (r.tag === 10) {
          var f = r.alternate;
          if (f === null) throw Error(s(387));
          if (((f = f.memoizedProps), f !== null)) {
            var m = r.type;
            zt(r.pendingProps.value, f.value) ||
              (e !== null ? e.push(m) : (e = [m]));
          }
        } else if (r === pe.current) {
          if (((f = r.alternate), f === null)) throw Error(s(387));
          f.memoizedState.memoizedState !== r.memoizedState.memoizedState &&
            (e !== null ? e.push(ll) : (e = [ll]));
        }
        r = r.return;
      }
      (e !== null && Jr(t, e, a, l), (t.flags |= 262144));
    }
    function Hl(e) {
      for (e = e.firstContext; e !== null; ) {
        if (!zt(e.context._currentValue, e.memoizedValue)) return !0;
        e = e.next;
      }
      return !1;
    }
    function la(e) {
      ((ia = e),
        (un = null),
        (e = e.dependencies),
        e !== null && (e.firstContext = null));
    }
    function at(e) {
      return cf(ia, e);
    }
    function Vl(e, t) {
      return (ia === null && la(e), cf(e, t));
    }
    function cf(e, t) {
      var a = t._currentValue;
      if (((t = { context: t, memoizedValue: a, next: null }), un === null)) {
        if (e === null) throw Error(s(308));
        ((un = t),
          (e.dependencies = { lanes: 0, firstContext: t }),
          (e.flags |= 524288));
      } else un = un.next = t;
      return a;
    }
    var Mg =
        typeof AbortController < "u"
          ? AbortController
          : function () {
              var e = [],
                t = (this.signal = {
                  aborted: !1,
                  addEventListener: function (a, l) {
                    e.push(l);
                  },
                });
              this.abort = function () {
                ((t.aborted = !0),
                  e.forEach(function (a) {
                    return a();
                  }));
              };
            },
      Ng = i.unstable_scheduleCallback,
      Dg = i.unstable_NormalPriority,
      Ve = {
        $$typeof: X,
        Consumer: null,
        Provider: null,
        _currentValue: null,
        _currentValue2: null,
        _threadCount: 0,
      };
    function Kr() {
      return { controller: new Mg(), data: new Map(), refCount: 0 };
    }
    function ki(e) {
      (e.refCount--,
        e.refCount === 0 &&
          Ng(Dg, function () {
            e.controller.abort();
          }));
    }
    var qi = null,
      Ir = 0,
      $a = 0,
      La = null;
    function kg(e, t) {
      if (qi === null) {
        var a = (qi = []);
        ((Ir = 0),
          ($a = es()),
          (La = {
            status: "pending",
            value: void 0,
            then: function (l) {
              a.push(l);
            },
          }));
      }
      return (Ir++, t.then(ff, ff), t);
    }
    function ff() {
      if (--Ir === 0 && qi !== null) {
        La !== null && (La.status = "fulfilled");
        var e = qi;
        ((qi = null), ($a = 0), (La = null));
        for (var t = 0; t < e.length; t++) (0, e[t])();
      }
    }
    function qg(e, t) {
      var a = [],
        l = {
          status: "pending",
          value: null,
          reason: null,
          then: function (r) {
            a.push(r);
          },
        };
      return (
        e.then(
          function () {
            ((l.status = "fulfilled"), (l.value = t));
            for (var r = 0; r < a.length; r++) (0, a[r])(t);
          },
          function (r) {
            for (l.status = "rejected", l.reason = r, r = 0; r < a.length; r++)
              (0, a[r])(void 0);
          },
        ),
        l
      );
    }
    var hf = U.S;
    U.S = function (e, t) {
      ((Yh = St()),
        typeof t == "object" &&
          t !== null &&
          typeof t.then == "function" &&
          kg(e, t),
        hf !== null && hf(e, t));
    };
    var ua = g(null);
    function Fr() {
      var e = ua.current;
      return e !== null ? e : we.pooledCache;
    }
    function Gl(e, t) {
      t === null ? Z(ua, ua.current) : Z(ua, t.pool);
    }
    function df() {
      var e = Fr();
      return e === null ? null : { parent: Ve._currentValue, pool: e };
    }
    var Ha = Error(s(460)),
      Wr = Error(s(474)),
      Yl = Error(s(542)),
      Xl = { then: function () {} };
    function mf(e) {
      return ((e = e.status), e === "fulfilled" || e === "rejected");
    }
    function vf(e, t, a) {
      switch (
        ((a = e[a]),
        a === void 0 ? e.push(t) : a !== t && (t.then(tn, tn), (t = a)),
        t.status)
      ) {
        case "fulfilled":
          return t.value;
        case "rejected":
          throw ((e = t.reason), yf(e), e);
        default:
          if (typeof t.status == "string") t.then(tn, tn);
          else {
            if (((e = we), e !== null && 100 < e.shellSuspendCounter))
              throw Error(s(482));
            ((e = t),
              (e.status = "pending"),
              e.then(
                function (l) {
                  if (t.status === "pending") {
                    var r = t;
                    ((r.status = "fulfilled"), (r.value = l));
                  }
                },
                function (l) {
                  if (t.status === "pending") {
                    var r = t;
                    ((r.status = "rejected"), (r.reason = l));
                  }
                },
              ));
          }
          switch (t.status) {
            case "fulfilled":
              return t.value;
            case "rejected":
              throw ((e = t.reason), yf(e), e);
          }
          throw ((oa = t), Ha);
      }
    }
    function ra(e) {
      try {
        var t = e._init;
        return t(e._payload);
      } catch (a) {
        throw a !== null && typeof a == "object" && typeof a.then == "function"
          ? ((oa = a), Ha)
          : a;
      }
    }
    var oa = null;
    function gf() {
      if (oa === null) throw Error(s(459));
      var e = oa;
      return ((oa = null), e);
    }
    function yf(e) {
      if (e === Ha || e === Yl) throw Error(s(483));
    }
    var Va = null,
      Ui = 0;
    function Jl(e) {
      var t = Ui;
      return ((Ui += 1), Va === null && (Va = []), vf(Va, e, t));
    }
    function ji(e, t) {
      ((t = t.props.ref), (e.ref = t !== void 0 ? t : null));
    }
    function Kl(e, t) {
      throw t.$$typeof === x
        ? Error(s(525))
        : ((e = Object.prototype.toString.call(t)),
          Error(
            s(
              31,
              e === "[object Object]"
                ? "object with keys {" + Object.keys(t).join(", ") + "}"
                : e,
            ),
          ));
    }
    function pf(e) {
      function t(S, p) {
        if (e) {
          var T = S.deletions;
          T === null ? ((S.deletions = [p]), (S.flags |= 16)) : T.push(p);
        }
      }
      function a(S, p) {
        if (!e) return null;
        for (; p !== null; ) (t(S, p), (p = p.sibling));
        return null;
      }
      function l(S) {
        for (var p = new Map(); S !== null; )
          (S.key !== null ? p.set(S.key, S) : p.set(S.index, S),
            (S = S.sibling));
        return p;
      }
      function r(S, p) {
        return ((S = an(S, p)), (S.index = 0), (S.sibling = null), S);
      }
      function o(S, p, T) {
        return (
          (S.index = T),
          e
            ? ((T = S.alternate),
              T !== null
                ? ((T = T.index), T < p ? ((S.flags |= 67108866), p) : T)
                : ((S.flags |= 67108866), p))
            : ((S.flags |= 1048576), p)
        );
      }
      function f(S) {
        return (e && S.alternate === null && (S.flags |= 67108866), S);
      }
      function m(S, p, T, M) {
        return p === null || p.tag !== 6
          ? ((p = Qr(T, S.mode, M)), (p.return = S), p)
          : ((p = r(p, T)), (p.return = S), p);
      }
      function y(S, p, T, M) {
        var G = T.type;
        return G === xe
          ? C(S, p, T.props.children, M, T.key)
          : p !== null &&
              (p.elementType === G ||
                (typeof G == "object" &&
                  G !== null &&
                  G.$$typeof === ye &&
                  ra(G) === p.type))
            ? ((p = r(p, T.props)), ji(p, T), (p.return = S), p)
            : ((p = $l(T.type, T.key, T.props, null, S.mode, M)),
              ji(p, T),
              (p.return = S),
              p);
      }
      function A(S, p, T, M) {
        return p === null ||
          p.tag !== 4 ||
          p.stateNode.containerInfo !== T.containerInfo ||
          p.stateNode.implementation !== T.implementation
          ? ((p = $r(T, S.mode, M)), (p.return = S), p)
          : ((p = r(p, T.children || [])), (p.return = S), p);
      }
      function C(S, p, T, M, G) {
        return p === null || p.tag !== 7
          ? ((p = na(T, S.mode, M, G)), (p.return = S), p)
          : ((p = r(p, T)), (p.return = S), p);
      }
      function D(S, p, T) {
        if (
          (typeof p == "string" && p !== "") ||
          typeof p == "number" ||
          typeof p == "bigint"
        )
          return ((p = Qr("" + p, S.mode, T)), (p.return = S), p);
        if (typeof p == "object" && p !== null) {
          switch (p.$$typeof) {
            case K:
              return (
                (T = $l(p.type, p.key, p.props, null, S.mode, T)),
                ji(T, p),
                (T.return = S),
                T
              );
            case Te:
              return ((p = $r(p, S.mode, T)), (p.return = S), p);
            case ye:
              return ((p = ra(p)), D(S, p, T));
          }
          if (j(p) || Ne(p))
            return ((p = na(p, S.mode, T, null)), (p.return = S), p);
          if (typeof p.then == "function") return D(S, Jl(p), T);
          if (p.$$typeof === X) return D(S, Vl(S, p), T);
          Kl(S, p);
        }
        return null;
      }
      function E(S, p, T, M) {
        var G = p !== null ? p.key : null;
        if (
          (typeof T == "string" && T !== "") ||
          typeof T == "number" ||
          typeof T == "bigint"
        )
          return G !== null ? null : m(S, p, "" + T, M);
        if (typeof T == "object" && T !== null) {
          switch (T.$$typeof) {
            case K:
              return T.key === G ? y(S, p, T, M) : null;
            case Te:
              return T.key === G ? A(S, p, T, M) : null;
            case ye:
              return ((T = ra(T)), E(S, p, T, M));
          }
          if (j(T) || Ne(T)) return G !== null ? null : C(S, p, T, M, null);
          if (typeof T.then == "function") return E(S, p, Jl(T), M);
          if (T.$$typeof === X) return E(S, p, Vl(S, T), M);
          Kl(S, T);
        }
        return null;
      }
      function O(S, p, T, M, G) {
        if (
          (typeof M == "string" && M !== "") ||
          typeof M == "number" ||
          typeof M == "bigint"
        )
          return ((S = S.get(T) || null), m(p, S, "" + M, G));
        if (typeof M == "object" && M !== null) {
          switch (M.$$typeof) {
            case K:
              return (
                (S = S.get(M.key === null ? T : M.key) || null),
                y(p, S, M, G)
              );
            case Te:
              return (
                (S = S.get(M.key === null ? T : M.key) || null),
                A(p, S, M, G)
              );
            case ye:
              return ((M = ra(M)), O(S, p, T, M, G));
          }
          if (j(M) || Ne(M))
            return ((S = S.get(T) || null), C(p, S, M, G, null));
          if (typeof M.then == "function") return O(S, p, T, Jl(M), G);
          if (M.$$typeof === X) return O(S, p, T, Vl(p, M), G);
          Kl(p, M);
        }
        return null;
      }
      function $(S, p, T, M) {
        for (
          var G = null, fe = null, H = p, te = (p = 0), se = null;
          H !== null && te < T.length;
          te++
        ) {
          H.index > te ? ((se = H), (H = null)) : (se = H.sibling);
          var he = E(S, H, T[te], M);
          if (he === null) {
            H === null && (H = se);
            break;
          }
          (e && H && he.alternate === null && t(S, H),
            (p = o(he, p, te)),
            fe === null ? (G = he) : (fe.sibling = he),
            (fe = he),
            (H = se));
        }
        if (te === T.length) return (a(S, H), ce && ln(S, te), G);
        if (H === null) {
          for (; te < T.length; te++)
            ((H = D(S, T[te], M)),
              H !== null &&
                ((p = o(H, p, te)),
                fe === null ? (G = H) : (fe.sibling = H),
                (fe = H)));
          return (ce && ln(S, te), G);
        }
        for (H = l(H); te < T.length; te++)
          ((se = O(H, S, te, T[te], M)),
            se !== null &&
              (e &&
                se.alternate !== null &&
                H.delete(se.key === null ? te : se.key),
              (p = o(se, p, te)),
              fe === null ? (G = se) : (fe.sibling = se),
              (fe = se)));
        return (
          e &&
            H.forEach(function (Gn) {
              return t(S, Gn);
            }),
          ce && ln(S, te),
          G
        );
      }
      function J(S, p, T, M) {
        if (T == null) throw Error(s(151));
        for (
          var G = null,
            fe = null,
            H = p,
            te = (p = 0),
            se = null,
            he = T.next();
          H !== null && !he.done;
          te++, he = T.next()
        ) {
          H.index > te ? ((se = H), (H = null)) : (se = H.sibling);
          var Gn = E(S, H, he.value, M);
          if (Gn === null) {
            H === null && (H = se);
            break;
          }
          (e && H && Gn.alternate === null && t(S, H),
            (p = o(Gn, p, te)),
            fe === null ? (G = Gn) : (fe.sibling = Gn),
            (fe = Gn),
            (H = se));
        }
        if (he.done) return (a(S, H), ce && ln(S, te), G);
        if (H === null) {
          for (; !he.done; te++, he = T.next())
            ((he = D(S, he.value, M)),
              he !== null &&
                ((p = o(he, p, te)),
                fe === null ? (G = he) : (fe.sibling = he),
                (fe = he)));
          return (ce && ln(S, te), G);
        }
        for (H = l(H); !he.done; te++, he = T.next())
          ((he = O(H, S, te, he.value, M)),
            he !== null &&
              (e &&
                he.alternate !== null &&
                H.delete(he.key === null ? te : he.key),
              (p = o(he, p, te)),
              fe === null ? (G = he) : (fe.sibling = he),
              (fe = he)));
        return (
          e &&
            H.forEach(function (Ky) {
              return t(S, Ky);
            }),
          ce && ln(S, te),
          G
        );
      }
      function Ee(S, p, T, M) {
        if (
          (typeof T == "object" &&
            T !== null &&
            T.type === xe &&
            T.key === null &&
            (T = T.props.children),
          typeof T == "object" && T !== null)
        ) {
          switch (T.$$typeof) {
            case K:
              e: {
                for (var G = T.key; p !== null; ) {
                  if (p.key === G) {
                    if (((G = T.type), G === xe)) {
                      if (p.tag === 7) {
                        (a(S, p.sibling),
                          (M = r(p, T.props.children)),
                          (M.return = S),
                          (S = M));
                        break e;
                      }
                    } else if (
                      p.elementType === G ||
                      (typeof G == "object" &&
                        G !== null &&
                        G.$$typeof === ye &&
                        ra(G) === p.type)
                    ) {
                      (a(S, p.sibling),
                        (M = r(p, T.props)),
                        ji(M, T),
                        (M.return = S),
                        (S = M));
                      break e;
                    }
                    a(S, p);
                    break;
                  } else t(S, p);
                  p = p.sibling;
                }
                T.type === xe
                  ? ((M = na(T.props.children, S.mode, M, T.key)),
                    (M.return = S),
                    (S = M))
                  : ((M = $l(T.type, T.key, T.props, null, S.mode, M)),
                    ji(M, T),
                    (M.return = S),
                    (S = M));
              }
              return f(S);
            case Te:
              e: {
                for (G = T.key; p !== null; ) {
                  if (p.key === G)
                    if (
                      p.tag === 4 &&
                      p.stateNode.containerInfo === T.containerInfo &&
                      p.stateNode.implementation === T.implementation
                    ) {
                      (a(S, p.sibling),
                        (M = r(p, T.children || [])),
                        (M.return = S),
                        (S = M));
                      break e;
                    } else {
                      a(S, p);
                      break;
                    }
                  else t(S, p);
                  p = p.sibling;
                }
                ((M = $r(T, S.mode, M)), (M.return = S), (S = M));
              }
              return f(S);
            case ye:
              return ((T = ra(T)), Ee(S, p, T, M));
          }
          if (j(T)) return $(S, p, T, M);
          if (Ne(T)) {
            if (((G = Ne(T)), typeof G != "function")) throw Error(s(150));
            return ((T = G.call(T)), J(S, p, T, M));
          }
          if (typeof T.then == "function") return Ee(S, p, Jl(T), M);
          if (T.$$typeof === X) return Ee(S, p, Vl(S, T), M);
          Kl(S, T);
        }
        return (typeof T == "string" && T !== "") ||
          typeof T == "number" ||
          typeof T == "bigint"
          ? ((T = "" + T),
            p !== null && p.tag === 6
              ? (a(S, p.sibling), (M = r(p, T)), (M.return = S), (S = M))
              : (a(S, p), (M = Qr(T, S.mode, M)), (M.return = S), (S = M)),
            f(S))
          : a(S, p);
      }
      return function (S, p, T, M) {
        try {
          Ui = 0;
          var G = Ee(S, p, T, M);
          return ((Va = null), G);
        } catch (H) {
          if (H === Ha || H === Yl) throw H;
          var fe = At(29, H, null, S.mode);
          return ((fe.lanes = M), (fe.return = S), fe);
        }
      };
    }
    var sa = pf(!0),
      bf = pf(!1),
      Mn = !1;
    function Pr(e) {
      e.updateQueue = {
        baseState: e.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: { pending: null, lanes: 0, hiddenCallbacks: null },
        callbacks: null,
      };
    }
    function eo(e, t) {
      ((e = e.updateQueue),
        t.updateQueue === e &&
          (t.updateQueue = {
            baseState: e.baseState,
            firstBaseUpdate: e.firstBaseUpdate,
            lastBaseUpdate: e.lastBaseUpdate,
            shared: e.shared,
            callbacks: null,
          }));
    }
    function ca(e) {
      return { lane: e, tag: 0, payload: null, callback: null, next: null };
    }
    function fa(e, t, a) {
      var l = e.updateQueue;
      if (l === null) return null;
      if (((l = l.shared), (ve & 2) !== 0)) {
        var r = l.pending;
        return (
          r === null ? (t.next = t) : ((t.next = r.next), (r.next = t)),
          (l.pending = t),
          (t = Ql(e)),
          tf(e, null, a),
          t
        );
      }
      return (Bl(e, l, t, a), Ql(e));
    }
    function Zi(e, t, a) {
      if (
        ((t = t.updateQueue),
        t !== null && ((t = t.shared), (a & 4194048) !== 0))
      ) {
        var l = t.lanes;
        ((l &= e.pendingLanes), (a |= l), (t.lanes = a), oc(e, a));
      }
    }
    function to(e, t) {
      var a = e.updateQueue,
        l = e.alternate;
      if (l !== null && ((l = l.updateQueue), a === l)) {
        var r = null,
          o = null;
        if (((a = a.firstBaseUpdate), a !== null)) {
          do {
            var f = {
              lane: a.lane,
              tag: a.tag,
              payload: a.payload,
              callback: null,
              next: null,
            };
            (o === null ? (r = o = f) : (o = o.next = f), (a = a.next));
          } while (a !== null);
          o === null ? (r = o = t) : (o = o.next = t);
        } else r = o = t;
        ((a = {
          baseState: l.baseState,
          firstBaseUpdate: r,
          lastBaseUpdate: o,
          shared: l.shared,
          callbacks: l.callbacks,
        }),
          (e.updateQueue = a));
        return;
      }
      ((e = a.lastBaseUpdate),
        e === null ? (a.firstBaseUpdate = t) : (e.next = t),
        (a.lastBaseUpdate = t));
    }
    var no = !1;
    function xi() {
      if (no) {
        var e = La;
        if (e !== null) throw e;
      }
    }
    function Bi(e, t, a, l) {
      no = !1;
      var r = e.updateQueue;
      Mn = !1;
      var o = r.firstBaseUpdate,
        f = r.lastBaseUpdate,
        m = r.shared.pending;
      if (m !== null) {
        r.shared.pending = null;
        var y = m,
          A = y.next;
        ((y.next = null), f === null ? (o = A) : (f.next = A), (f = y));
        var C = e.alternate;
        C !== null &&
          ((C = C.updateQueue),
          (m = C.lastBaseUpdate),
          m !== f &&
            (m === null ? (C.firstBaseUpdate = A) : (m.next = A),
            (C.lastBaseUpdate = y)));
      }
      if (o !== null) {
        var D = r.baseState;
        ((f = 0), (C = A = y = null), (m = o));
        do {
          var E = m.lane & -536870913,
            O = E !== m.lane;
          if (O ? (oe & E) === E : (l & E) === E) {
            (E !== 0 && E === $a && (no = !0),
              C !== null &&
                (C = C.next =
                  {
                    lane: 0,
                    tag: m.tag,
                    payload: m.payload,
                    callback: null,
                    next: null,
                  }));
            e: {
              var $ = e,
                J = m;
              E = t;
              var Ee = a;
              switch (J.tag) {
                case 1:
                  if ((($ = J.payload), typeof $ == "function")) {
                    D = $.call(Ee, D, E);
                    break e;
                  }
                  D = $;
                  break e;
                case 3:
                  $.flags = ($.flags & -65537) | 128;
                case 0:
                  if (
                    (($ = J.payload),
                    (E = typeof $ == "function" ? $.call(Ee, D, E) : $),
                    E == null)
                  )
                    break e;
                  D = w({}, D, E);
                  break e;
                case 2:
                  Mn = !0;
              }
            }
            ((E = m.callback),
              E !== null &&
                ((e.flags |= 64),
                O && (e.flags |= 8192),
                (O = r.callbacks),
                O === null ? (r.callbacks = [E]) : O.push(E)));
          } else
            ((O = {
              lane: E,
              tag: m.tag,
              payload: m.payload,
              callback: m.callback,
              next: null,
            }),
              C === null ? ((A = C = O), (y = D)) : (C = C.next = O),
              (f |= E));
          if (((m = m.next), m === null)) {
            if (((m = r.shared.pending), m === null)) break;
            ((O = m),
              (m = O.next),
              (O.next = null),
              (r.lastBaseUpdate = O),
              (r.shared.pending = null));
          }
        } while (!0);
        (C === null && (y = D),
          (r.baseState = y),
          (r.firstBaseUpdate = A),
          (r.lastBaseUpdate = C),
          o === null && (r.shared.lanes = 0),
          (Un |= f),
          (e.lanes = f),
          (e.memoizedState = D));
      }
    }
    function Sf(e, t) {
      if (typeof e != "function") throw Error(s(191, e));
      e.call(t);
    }
    function _f(e, t) {
      var a = e.callbacks;
      if (a !== null)
        for (e.callbacks = null, e = 0; e < a.length; e++) Sf(a[e], t);
    }
    var Ga = g(null),
      Il = g(0);
    function Tf(e, t) {
      ((e = gn), Z(Il, e), Z(Ga, t), (gn = e | t.baseLanes));
    }
    function ao() {
      (Z(Il, gn), Z(Ga, Ga.current));
    }
    function io() {
      ((gn = Il.current), R(Ga), R(Il));
    }
    var Et = g(null),
      jt = null;
    function Nn(e) {
      var t = e.alternate;
      (Z(Qe, Qe.current & 1),
        Z(Et, e),
        jt === null &&
          (t === null || Ga.current !== null || t.memoizedState !== null) &&
          (jt = e));
    }
    function lo(e) {
      (Z(Qe, Qe.current), Z(Et, e), jt === null && (jt = e));
    }
    function zf(e) {
      e.tag === 22
        ? (Z(Qe, Qe.current), Z(Et, e), jt === null && (jt = e))
        : Dn(e);
    }
    function Dn() {
      (Z(Qe, Qe.current), Z(Et, Et.current));
    }
    function wt(e) {
      (R(Et), jt === e && (jt = null), R(Qe));
    }
    var Qe = g(0);
    function Fl(e) {
      for (var t = e; t !== null; ) {
        if (t.tag === 13) {
          var a = t.memoizedState;
          if (a !== null && ((a = a.dehydrated), a === null || fs(a) || hs(a)))
            return t;
        } else if (
          t.tag === 19 &&
          (t.memoizedProps.revealOrder === "forwards" ||
            t.memoizedProps.revealOrder === "backwards" ||
            t.memoizedProps.revealOrder === "unstable_legacy-backwards" ||
            t.memoizedProps.revealOrder === "together")
        ) {
          if ((t.flags & 128) !== 0) return t;
        } else if (t.child !== null) {
          ((t.child.return = t), (t = t.child));
          continue;
        }
        if (t === e) break;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e) return null;
          t = t.return;
        }
        ((t.sibling.return = t.return), (t = t.sibling));
      }
      return null;
    }
    var on = 0,
      ee = null,
      ze = null,
      Ge = null,
      Wl = !1,
      Ya = !1,
      ha = !1,
      Pl = 0,
      Qi = 0,
      Xa = null,
      Ug = 0;
    function Ue() {
      throw Error(s(321));
    }
    function uo(e, t) {
      if (t === null) return !1;
      for (var a = 0; a < t.length && a < e.length; a++)
        if (!zt(e[a], t[a])) return !1;
      return !0;
    }
    function ro(e, t, a, l, r, o) {
      return (
        (on = o),
        (ee = t),
        (t.memoizedState = null),
        (t.updateQueue = null),
        (t.lanes = 0),
        (U.H = e === null || e.memoizedState === null ? uh : zo),
        (ha = !1),
        (o = a(l, r)),
        (ha = !1),
        Ya && (o = Ef(t, a, l, r)),
        Af(e),
        o
      );
    }
    function Af(e) {
      U.H = Hi;
      var t = ze !== null && ze.next !== null;
      if (
        ((on = 0), (Ge = ze = ee = null), (Wl = !1), (Qi = 0), (Xa = null), t)
      )
        throw Error(s(300));
      e === null ||
        Ye ||
        ((e = e.dependencies), e !== null && Hl(e) && (Ye = !0));
    }
    function Ef(e, t, a, l) {
      ee = e;
      var r = 0;
      do {
        if ((Ya && (Xa = null), (Qi = 0), (Ya = !1), 25 <= r))
          throw Error(s(301));
        if (((r += 1), (Ge = ze = null), e.updateQueue != null)) {
          var o = e.updateQueue;
          ((o.lastEffect = null),
            (o.events = null),
            (o.stores = null),
            o.memoCache != null && (o.memoCache.index = 0));
        }
        ((U.H = rh), (o = t(a, l)));
      } while (Ya);
      return o;
    }
    function jg() {
      var e = U.H,
        t = e.useState()[0];
      return (
        (t = typeof t.then == "function" ? $i(t) : t),
        (e = e.useState()[0]),
        (ze !== null ? ze.memoizedState : null) !== e && (ee.flags |= 1024),
        t
      );
    }
    function oo() {
      var e = Pl !== 0;
      return ((Pl = 0), e);
    }
    function so(e, t, a) {
      ((t.updateQueue = e.updateQueue), (t.flags &= -2053), (e.lanes &= ~a));
    }
    function co(e) {
      if (Wl) {
        for (e = e.memoizedState; e !== null; ) {
          var t = e.queue;
          (t !== null && (t.pending = null), (e = e.next));
        }
        Wl = !1;
      }
      ((on = 0), (Ge = ze = ee = null), (Ya = !1), (Qi = Pl = 0), (Xa = null));
    }
    function ot() {
      var e = {
        memoizedState: null,
        baseState: null,
        baseQueue: null,
        queue: null,
        next: null,
      };
      return (
        Ge === null ? (ee.memoizedState = Ge = e) : (Ge = Ge.next = e),
        Ge
      );
    }
    function $e() {
      if (ze === null) {
        var e = ee.alternate;
        e = e !== null ? e.memoizedState : null;
      } else e = ze.next;
      var t = Ge === null ? ee.memoizedState : Ge.next;
      if (t !== null) ((Ge = t), (ze = e));
      else {
        if (e === null)
          throw ee.alternate === null ? Error(s(467)) : Error(s(310));
        ((ze = e),
          (e = {
            memoizedState: ze.memoizedState,
            baseState: ze.baseState,
            baseQueue: ze.baseQueue,
            queue: ze.queue,
            next: null,
          }),
          Ge === null ? (ee.memoizedState = Ge = e) : (Ge = Ge.next = e));
      }
      return Ge;
    }
    function eu() {
      return { lastEffect: null, events: null, stores: null, memoCache: null };
    }
    function $i(e) {
      var t = Qi;
      return (
        (Qi += 1),
        Xa === null && (Xa = []),
        (e = vf(Xa, e, t)),
        (t = ee),
        (Ge === null ? t.memoizedState : Ge.next) === null &&
          ((t = t.alternate),
          (U.H = t === null || t.memoizedState === null ? uh : zo)),
        e
      );
    }
    function tu(e) {
      if (e !== null && typeof e == "object") {
        if (typeof e.then == "function") return $i(e);
        if (e.$$typeof === X) return at(e);
      }
      throw Error(s(438, String(e)));
    }
    function fo(e) {
      var t = null,
        a = ee.updateQueue;
      if ((a !== null && (t = a.memoCache), t == null)) {
        var l = ee.alternate;
        l !== null &&
          ((l = l.updateQueue),
          l !== null &&
            ((l = l.memoCache),
            l != null &&
              (t = {
                data: l.data.map(function (r) {
                  return r.slice();
                }),
                index: 0,
              })));
      }
      if (
        ((t ??= { data: [], index: 0 }),
        a === null && ((a = eu()), (ee.updateQueue = a)),
        (a.memoCache = t),
        (a = t.data[t.index]),
        a === void 0)
      )
        for (a = t.data[t.index] = Array(e), l = 0; l < e; l++) a[l] = de;
      return (t.index++, a);
    }
    function sn(e, t) {
      return typeof t == "function" ? t(e) : t;
    }
    function nu(e) {
      return ho($e(), ze, e);
    }
    function ho(e, t, a) {
      var l = e.queue;
      if (l === null) throw Error(s(311));
      l.lastRenderedReducer = a;
      var r = e.baseQueue,
        o = l.pending;
      if (o !== null) {
        if (r !== null) {
          var f = r.next;
          ((r.next = o.next), (o.next = f));
        }
        ((t.baseQueue = r = o), (l.pending = null));
      }
      if (((o = e.baseState), r === null)) e.memoizedState = o;
      else {
        t = r.next;
        var m = (f = null),
          y = null,
          A = t,
          C = !1;
        do {
          var D = A.lane & -536870913;
          if (D !== A.lane ? (oe & D) === D : (on & D) === D) {
            var E = A.revertLane;
            if (E === 0)
              (y !== null &&
                (y = y.next =
                  {
                    lane: 0,
                    revertLane: 0,
                    gesture: null,
                    action: A.action,
                    hasEagerState: A.hasEagerState,
                    eagerState: A.eagerState,
                    next: null,
                  }),
                D === $a && (C = !0));
            else if ((on & E) === E) {
              ((A = A.next), E === $a && (C = !0));
              continue;
            } else
              ((D = {
                lane: 0,
                revertLane: A.revertLane,
                gesture: null,
                action: A.action,
                hasEagerState: A.hasEagerState,
                eagerState: A.eagerState,
                next: null,
              }),
                y === null ? ((m = y = D), (f = o)) : (y = y.next = D),
                (ee.lanes |= E),
                (Un |= E));
            ((D = A.action),
              ha && a(o, D),
              (o = A.hasEagerState ? A.eagerState : a(o, D)));
          } else
            ((E = {
              lane: D,
              revertLane: A.revertLane,
              gesture: A.gesture,
              action: A.action,
              hasEagerState: A.hasEagerState,
              eagerState: A.eagerState,
              next: null,
            }),
              y === null ? ((m = y = E), (f = o)) : (y = y.next = E),
              (ee.lanes |= D),
              (Un |= D));
          A = A.next;
        } while (A !== null && A !== t);
        if (
          (y === null ? (f = o) : (y.next = m),
          !zt(o, e.memoizedState) && ((Ye = !0), C && ((a = La), a !== null)))
        )
          throw a;
        ((e.memoizedState = o),
          (e.baseState = f),
          (e.baseQueue = y),
          (l.lastRenderedState = o));
      }
      return (r === null && (l.lanes = 0), [e.memoizedState, l.dispatch]);
    }
    function mo(e) {
      var t = $e(),
        a = t.queue;
      if (a === null) throw Error(s(311));
      a.lastRenderedReducer = e;
      var l = a.dispatch,
        r = a.pending,
        o = t.memoizedState;
      if (r !== null) {
        a.pending = null;
        var f = (r = r.next);
        do ((o = e(o, f.action)), (f = f.next));
        while (f !== r);
        (zt(o, t.memoizedState) || (Ye = !0),
          (t.memoizedState = o),
          t.baseQueue === null && (t.baseState = o),
          (a.lastRenderedState = o));
      }
      return [o, l];
    }
    function wf(e, t, a) {
      var l = ee,
        r = $e(),
        o = ce;
      if (o) {
        if (a === void 0) throw Error(s(407));
        a = a();
      } else a = t();
      var f = !zt((ze || r).memoizedState, a);
      if (
        (f && ((r.memoizedState = a), (Ye = !0)),
        (r = r.queue),
        yo(Cf.bind(null, l, r, e), [e]),
        r.getSnapshot !== t || f || (Ge !== null && Ge.memoizedState.tag & 1))
      ) {
        if (
          ((l.flags |= 2048),
          Ja(9, { destroy: void 0 }, Rf.bind(null, l, r, a, t), null),
          we === null)
        )
          throw Error(s(349));
        o || (on & 127) !== 0 || Of(l, t, a);
      }
      return a;
    }
    function Of(e, t, a) {
      ((e.flags |= 16384),
        (e = { getSnapshot: t, value: a }),
        (t = ee.updateQueue),
        t === null
          ? ((t = eu()), (ee.updateQueue = t), (t.stores = [e]))
          : ((a = t.stores), a === null ? (t.stores = [e]) : a.push(e)));
    }
    function Rf(e, t, a, l) {
      ((t.value = a), (t.getSnapshot = l), Mf(t) && Nf(e));
    }
    function Cf(e, t, a) {
      return a(function () {
        Mf(t) && Nf(e);
      });
    }
    function Mf(e) {
      var t = e.getSnapshot;
      e = e.value;
      try {
        var a = t();
        return !zt(e, a);
      } catch {
        return !0;
      }
    }
    function Nf(e) {
      var t = ta(e, 2);
      t !== null && gt(t, e, 2);
    }
    function vo(e) {
      var t = ot();
      if (typeof e == "function") {
        var a = e;
        if (((e = a()), ha)) {
          zn(!0);
          try {
            a();
          } finally {
            zn(!1);
          }
        }
      }
      return (
        (t.memoizedState = t.baseState = e),
        (t.queue = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: sn,
          lastRenderedState: e,
        }),
        t
      );
    }
    function Df(e, t, a, l) {
      return ((e.baseState = a), ho(e, ze, typeof l == "function" ? l : sn));
    }
    function Zg(e, t, a, l, r) {
      if (lu(e)) throw Error(s(485));
      if (((e = t.action), e !== null)) {
        var o = {
          payload: r,
          action: e,
          next: null,
          isTransition: !0,
          status: "pending",
          value: null,
          reason: null,
          listeners: [],
          then: function (f) {
            o.listeners.push(f);
          },
        };
        (U.T !== null ? a(!0) : (o.isTransition = !1),
          l(o),
          (a = t.pending),
          a === null
            ? ((o.next = t.pending = o), kf(t, o))
            : ((o.next = a.next), (t.pending = a.next = o)));
      }
    }
    function kf(e, t) {
      var a = t.action,
        l = t.payload,
        r = e.state;
      if (t.isTransition) {
        var o = U.T,
          f = {};
        U.T = f;
        try {
          var m = a(r, l),
            y = U.S;
          (y !== null && y(f, m), qf(e, t, m));
        } catch (A) {
          go(e, t, A);
        } finally {
          (o !== null && f.types !== null && (o.types = f.types), (U.T = o));
        }
      } else
        try {
          ((o = a(r, l)), qf(e, t, o));
        } catch (A) {
          go(e, t, A);
        }
    }
    function qf(e, t, a) {
      a !== null && typeof a == "object" && typeof a.then == "function"
        ? a.then(
            function (l) {
              Uf(e, t, l);
            },
            function (l) {
              return go(e, t, l);
            },
          )
        : Uf(e, t, a);
    }
    function Uf(e, t, a) {
      ((t.status = "fulfilled"),
        (t.value = a),
        jf(t),
        (e.state = a),
        (t = e.pending),
        t !== null &&
          ((a = t.next),
          a === t
            ? (e.pending = null)
            : ((a = a.next), (t.next = a), kf(e, a))));
    }
    function go(e, t, a) {
      var l = e.pending;
      if (((e.pending = null), l !== null)) {
        l = l.next;
        do ((t.status = "rejected"), (t.reason = a), jf(t), (t = t.next));
        while (t !== l);
      }
      e.action = null;
    }
    function jf(e) {
      e = e.listeners;
      for (var t = 0; t < e.length; t++) (0, e[t])();
    }
    function Zf(e, t) {
      return t;
    }
    function xf(e, t) {
      if (ce) {
        var a = we.formState;
        if (a !== null) {
          e: {
            var l = ee;
            if (ce) {
              if (Oe) {
                t: {
                  for (var r = Oe, o = Ut; r.nodeType !== 8; ) {
                    if (!o) {
                      r = null;
                      break t;
                    }
                    if (((r = xt(r.nextSibling)), r === null)) {
                      r = null;
                      break t;
                    }
                  }
                  ((o = r.data), (r = o === "F!" || o === "F" ? r : null));
                }
                if (r) {
                  ((Oe = xt(r.nextSibling)), (l = r.data === "F!"));
                  break e;
                }
              }
              Rn(l);
            }
            l = !1;
          }
          l && (t = a[0]);
        }
      }
      return (
        (a = ot()),
        (a.memoizedState = a.baseState = t),
        (l = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: Zf,
          lastRenderedState: t,
        }),
        (a.queue = l),
        (a = ah.bind(null, ee, l)),
        (l.dispatch = a),
        (l = vo(!1)),
        (o = To.bind(null, ee, !1, l.queue)),
        (l = ot()),
        (r = { state: t, dispatch: null, action: e, pending: null }),
        (l.queue = r),
        (a = Zg.bind(null, ee, r, o, a)),
        (r.dispatch = a),
        (l.memoizedState = e),
        [t, a, !1]
      );
    }
    function Bf(e) {
      return Qf($e(), ze, e);
    }
    function Qf(e, t, a) {
      if (
        ((t = ho(e, t, Zf)[0]),
        (e = nu(sn)[0]),
        typeof t == "object" && t !== null && typeof t.then == "function")
      )
        try {
          var l = $i(t);
        } catch (f) {
          throw f === Ha ? Yl : f;
        }
      else l = t;
      t = $e();
      var r = t.queue,
        o = r.dispatch;
      return (
        a !== t.memoizedState &&
          ((ee.flags |= 2048),
          Ja(9, { destroy: void 0 }, xg.bind(null, r, a), null)),
        [l, o, e]
      );
    }
    function xg(e, t) {
      e.action = t;
    }
    function $f(e) {
      var t = $e(),
        a = ze;
      if (a !== null) return Qf(t, a, e);
      ($e(), (t = t.memoizedState), (a = $e()));
      var l = a.queue.dispatch;
      return ((a.memoizedState = e), [t, l, !1]);
    }
    function Ja(e, t, a, l) {
      return (
        (e = { tag: e, create: a, deps: l, inst: t, next: null }),
        (t = ee.updateQueue),
        t === null && ((t = eu()), (ee.updateQueue = t)),
        (a = t.lastEffect),
        a === null
          ? (t.lastEffect = e.next = e)
          : ((l = a.next), (a.next = e), (e.next = l), (t.lastEffect = e)),
        e
      );
    }
    function Lf() {
      return $e().memoizedState;
    }
    function au(e, t, a, l) {
      var r = ot();
      ((ee.flags |= e),
        (r.memoizedState = Ja(
          1 | t,
          { destroy: void 0 },
          a,
          l === void 0 ? null : l,
        )));
    }
    function iu(e, t, a, l) {
      var r = $e();
      l = l === void 0 ? null : l;
      var o = r.memoizedState.inst;
      ze !== null && l !== null && uo(l, ze.memoizedState.deps)
        ? (r.memoizedState = Ja(t, o, a, l))
        : ((ee.flags |= e), (r.memoizedState = Ja(1 | t, o, a, l)));
    }
    function Hf(e, t) {
      au(8390656, 8, e, t);
    }
    function yo(e, t) {
      iu(2048, 8, e, t);
    }
    function Bg(e) {
      ee.flags |= 4;
      var t = ee.updateQueue;
      if (t === null) ((t = eu()), (ee.updateQueue = t), (t.events = [e]));
      else {
        var a = t.events;
        a === null ? (t.events = [e]) : a.push(e);
      }
    }
    function Vf(e) {
      var t = $e().memoizedState;
      return (
        Bg({ ref: t, nextImpl: e }),
        function () {
          if ((ve & 2) !== 0) throw Error(s(440));
          return t.impl.apply(void 0, arguments);
        }
      );
    }
    function Gf(e, t) {
      return iu(4, 2, e, t);
    }
    function Yf(e, t) {
      return iu(4, 4, e, t);
    }
    function Xf(e, t) {
      if (typeof t == "function") {
        e = e();
        var a = t(e);
        return function () {
          typeof a == "function" ? a() : t(null);
        };
      }
      if (t != null)
        return (
          (e = e()),
          (t.current = e),
          function () {
            t.current = null;
          }
        );
    }
    function Jf(e, t, a) {
      ((a = a != null ? a.concat([e]) : null),
        iu(4, 4, Xf.bind(null, t, e), a));
    }
    function po() {}
    function Kf(e, t) {
      var a = $e();
      t = t === void 0 ? null : t;
      var l = a.memoizedState;
      return t !== null && uo(t, l[1]) ? l[0] : ((a.memoizedState = [e, t]), e);
    }
    function If(e, t) {
      var a = $e();
      t = t === void 0 ? null : t;
      var l = a.memoizedState;
      if (t !== null && uo(t, l[1])) return l[0];
      if (((l = e()), ha)) {
        zn(!0);
        try {
          e();
        } finally {
          zn(!1);
        }
      }
      return ((a.memoizedState = [l, t]), l);
    }
    function bo(e, t, a) {
      return a === void 0 || ((on & 1073741824) !== 0 && (oe & 261930) === 0)
        ? (e.memoizedState = t)
        : ((e.memoizedState = a), (e = Jh()), (ee.lanes |= e), (Un |= e), a);
    }
    function Ff(e, t, a, l) {
      return zt(a, t)
        ? a
        : Ga.current !== null
          ? ((e = bo(e, a, l)), zt(e, t) || (Ye = !0), e)
          : (on & 42) === 0 || ((on & 1073741824) !== 0 && (oe & 261930) === 0)
            ? ((Ye = !0), (e.memoizedState = a))
            : ((e = Jh()), (ee.lanes |= e), (Un |= e), t);
    }
    function Wf(e, t, a, l, r) {
      var o = B.p;
      B.p = o !== 0 && 8 > o ? o : 8;
      var f = U.T,
        m = {};
      ((U.T = m), To(e, !1, t, a));
      try {
        var y = r(),
          A = U.S;
        (A !== null && A(m, y),
          y !== null && typeof y == "object" && typeof y.then == "function"
            ? Li(e, t, qg(y, l), Zt(e))
            : Li(e, t, l, Zt(e)));
      } catch (C) {
        Li(e, t, { then: function () {}, status: "rejected", reason: C }, Zt());
      } finally {
        ((B.p = o),
          f !== null && m.types !== null && (f.types = m.types),
          (U.T = f));
      }
    }
    function Qg() {}
    function So(e, t, a, l) {
      if (e.tag !== 5) throw Error(s(476));
      var r = Pf(e).queue;
      Wf(
        e,
        r,
        t,
        W,
        a === null
          ? Qg
          : function () {
              return (eh(e), a(l));
            },
      );
    }
    function Pf(e) {
      var t = e.memoizedState;
      if (t !== null) return t;
      t = {
        memoizedState: W,
        baseState: W,
        baseQueue: null,
        queue: {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: sn,
          lastRenderedState: W,
        },
        next: null,
      };
      var a = {};
      return (
        (t.next = {
          memoizedState: a,
          baseState: a,
          baseQueue: null,
          queue: {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: sn,
            lastRenderedState: a,
          },
          next: null,
        }),
        (e.memoizedState = t),
        (e = e.alternate),
        e !== null && (e.memoizedState = t),
        t
      );
    }
    function eh(e) {
      var t = Pf(e);
      (t.next === null && (t = e.alternate.memoizedState),
        Li(e, t.next.queue, {}, Zt()));
    }
    function _o() {
      return at(ll);
    }
    function th() {
      return $e().memoizedState;
    }
    function nh() {
      return $e().memoizedState;
    }
    function $g(e) {
      for (var t = e.return; t !== null; ) {
        switch (t.tag) {
          case 24:
          case 3:
            var a = Zt();
            e = ca(a);
            var l = fa(t, e, a);
            (l !== null && (gt(l, t, a), Zi(l, t, a)),
              (t = { cache: Kr() }),
              (e.payload = t));
            return;
        }
        t = t.return;
      }
    }
    function Lg(e, t, a) {
      var l = Zt();
      ((a = {
        lane: l,
        revertLane: 0,
        gesture: null,
        action: a,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      }),
        lu(e)
          ? ih(t, a)
          : ((a = xr(e, t, a, l)), a !== null && (gt(a, e, l), lh(a, t, l))));
    }
    function ah(e, t, a) {
      Li(e, t, a, Zt());
    }
    function Li(e, t, a, l) {
      var r = {
        lane: l,
        revertLane: 0,
        gesture: null,
        action: a,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      };
      if (lu(e)) ih(t, r);
      else {
        var o = e.alternate;
        if (
          e.lanes === 0 &&
          (o === null || o.lanes === 0) &&
          ((o = t.lastRenderedReducer), o !== null)
        )
          try {
            var f = t.lastRenderedState,
              m = o(f, a);
            if (((r.hasEagerState = !0), (r.eagerState = m), zt(m, f)))
              return (Bl(e, t, r, 0), we === null && xl(), !1);
          } catch {}
        if (((a = xr(e, t, r, l)), a !== null))
          return (gt(a, e, l), lh(a, t, l), !0);
      }
      return !1;
    }
    function To(e, t, a, l) {
      if (
        ((l = {
          lane: 2,
          revertLane: es(),
          gesture: null,
          action: l,
          hasEagerState: !1,
          eagerState: null,
          next: null,
        }),
        lu(e))
      ) {
        if (t) throw Error(s(479));
      } else ((t = xr(e, a, l, 2)), t !== null && gt(t, e, 2));
    }
    function lu(e) {
      var t = e.alternate;
      return e === ee || (t !== null && t === ee);
    }
    function ih(e, t) {
      Ya = Wl = !0;
      var a = e.pending;
      (a === null ? (t.next = t) : ((t.next = a.next), (a.next = t)),
        (e.pending = t));
    }
    function lh(e, t, a) {
      if ((a & 4194048) !== 0) {
        var l = t.lanes;
        ((l &= e.pendingLanes), (a |= l), (t.lanes = a), oc(e, a));
      }
    }
    var Hi = {
      readContext: at,
      use: tu,
      useCallback: Ue,
      useContext: Ue,
      useEffect: Ue,
      useImperativeHandle: Ue,
      useLayoutEffect: Ue,
      useInsertionEffect: Ue,
      useMemo: Ue,
      useReducer: Ue,
      useRef: Ue,
      useState: Ue,
      useDebugValue: Ue,
      useDeferredValue: Ue,
      useTransition: Ue,
      useSyncExternalStore: Ue,
      useId: Ue,
      useHostTransitionStatus: Ue,
      useFormState: Ue,
      useActionState: Ue,
      useOptimistic: Ue,
      useMemoCache: Ue,
      useCacheRefresh: Ue,
    };
    Hi.useEffectEvent = Ue;
    var uh = {
        readContext: at,
        use: tu,
        useCallback: function (e, t) {
          return ((ot().memoizedState = [e, t === void 0 ? null : t]), e);
        },
        useContext: at,
        useEffect: Hf,
        useImperativeHandle: function (e, t, a) {
          ((a = a != null ? a.concat([e]) : null),
            au(4194308, 4, Xf.bind(null, t, e), a));
        },
        useLayoutEffect: function (e, t) {
          return au(4194308, 4, e, t);
        },
        useInsertionEffect: function (e, t) {
          au(4, 2, e, t);
        },
        useMemo: function (e, t) {
          var a = ot();
          t = t === void 0 ? null : t;
          var l = e();
          if (ha) {
            zn(!0);
            try {
              e();
            } finally {
              zn(!1);
            }
          }
          return ((a.memoizedState = [l, t]), l);
        },
        useReducer: function (e, t, a) {
          var l = ot();
          if (a !== void 0) {
            var r = a(t);
            if (ha) {
              zn(!0);
              try {
                a(t);
              } finally {
                zn(!1);
              }
            }
          } else r = t;
          return (
            (l.memoizedState = l.baseState = r),
            (e = {
              pending: null,
              lanes: 0,
              dispatch: null,
              lastRenderedReducer: e,
              lastRenderedState: r,
            }),
            (l.queue = e),
            (e = e.dispatch = Lg.bind(null, ee, e)),
            [l.memoizedState, e]
          );
        },
        useRef: function (e) {
          var t = ot();
          return ((e = { current: e }), (t.memoizedState = e));
        },
        useState: function (e) {
          e = vo(e);
          var t = e.queue,
            a = ah.bind(null, ee, t);
          return ((t.dispatch = a), [e.memoizedState, a]);
        },
        useDebugValue: po,
        useDeferredValue: function (e, t) {
          return bo(ot(), e, t);
        },
        useTransition: function () {
          var e = vo(!1);
          return (
            (e = Wf.bind(null, ee, e.queue, !0, !1)),
            (ot().memoizedState = e),
            [!1, e]
          );
        },
        useSyncExternalStore: function (e, t, a) {
          var l = ee,
            r = ot();
          if (ce) {
            if (a === void 0) throw Error(s(407));
            a = a();
          } else {
            if (((a = t()), we === null)) throw Error(s(349));
            (oe & 127) !== 0 || Of(l, t, a);
          }
          r.memoizedState = a;
          var o = { value: a, getSnapshot: t };
          return (
            (r.queue = o),
            Hf(Cf.bind(null, l, o, e), [e]),
            (l.flags |= 2048),
            Ja(9, { destroy: void 0 }, Rf.bind(null, l, o, a, t), null),
            a
          );
        },
        useId: function () {
          var e = ot(),
            t = we.identifierPrefix;
          if (ce) {
            var a = Xt,
              l = Yt;
            ((a = (l & ~(1 << (32 - Tt(l) - 1))).toString(32) + a),
              (t = "_" + t + "R_" + a),
              (a = Pl++),
              0 < a && (t += "H" + a.toString(32)),
              (t += "_"));
          } else ((a = Ug++), (t = "_" + t + "r_" + a.toString(32) + "_"));
          return (e.memoizedState = t);
        },
        useHostTransitionStatus: _o,
        useFormState: xf,
        useActionState: xf,
        useOptimistic: function (e) {
          var t = ot();
          t.memoizedState = t.baseState = e;
          var a = {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: null,
            lastRenderedState: null,
          };
          return (
            (t.queue = a),
            (t = To.bind(null, ee, !0, a)),
            (a.dispatch = t),
            [e, t]
          );
        },
        useMemoCache: fo,
        useCacheRefresh: function () {
          return (ot().memoizedState = $g.bind(null, ee));
        },
        useEffectEvent: function (e) {
          var t = ot(),
            a = { impl: e };
          return (
            (t.memoizedState = a),
            function () {
              if ((ve & 2) !== 0) throw Error(s(440));
              return a.impl.apply(void 0, arguments);
            }
          );
        },
      },
      zo = {
        readContext: at,
        use: tu,
        useCallback: Kf,
        useContext: at,
        useEffect: yo,
        useImperativeHandle: Jf,
        useInsertionEffect: Gf,
        useLayoutEffect: Yf,
        useMemo: If,
        useReducer: nu,
        useRef: Lf,
        useState: function () {
          return nu(sn);
        },
        useDebugValue: po,
        useDeferredValue: function (e, t) {
          return Ff($e(), ze.memoizedState, e, t);
        },
        useTransition: function () {
          var e = nu(sn)[0],
            t = $e().memoizedState;
          return [typeof e == "boolean" ? e : $i(e), t];
        },
        useSyncExternalStore: wf,
        useId: th,
        useHostTransitionStatus: _o,
        useFormState: Bf,
        useActionState: Bf,
        useOptimistic: function (e, t) {
          return Df($e(), ze, e, t);
        },
        useMemoCache: fo,
        useCacheRefresh: nh,
      };
    zo.useEffectEvent = Vf;
    var rh = {
      readContext: at,
      use: tu,
      useCallback: Kf,
      useContext: at,
      useEffect: yo,
      useImperativeHandle: Jf,
      useInsertionEffect: Gf,
      useLayoutEffect: Yf,
      useMemo: If,
      useReducer: mo,
      useRef: Lf,
      useState: function () {
        return mo(sn);
      },
      useDebugValue: po,
      useDeferredValue: function (e, t) {
        var a = $e();
        return ze === null ? bo(a, e, t) : Ff(a, ze.memoizedState, e, t);
      },
      useTransition: function () {
        var e = mo(sn)[0],
          t = $e().memoizedState;
        return [typeof e == "boolean" ? e : $i(e), t];
      },
      useSyncExternalStore: wf,
      useId: th,
      useHostTransitionStatus: _o,
      useFormState: $f,
      useActionState: $f,
      useOptimistic: function (e, t) {
        var a = $e();
        return ze !== null
          ? Df(a, ze, e, t)
          : ((a.baseState = e), [e, a.queue.dispatch]);
      },
      useMemoCache: fo,
      useCacheRefresh: nh,
    };
    rh.useEffectEvent = Vf;
    function Ao(e, t, a, l) {
      ((t = e.memoizedState),
        (a = a(l, t)),
        (a = a == null ? t : w({}, t, a)),
        (e.memoizedState = a),
        e.lanes === 0 && (e.updateQueue.baseState = a));
    }
    var Eo = {
      enqueueSetState: function (e, t, a) {
        e = e._reactInternals;
        var l = Zt(),
          r = ca(l);
        ((r.payload = t),
          a != null && (r.callback = a),
          (t = fa(e, r, l)),
          t !== null && (gt(t, e, l), Zi(t, e, l)));
      },
      enqueueReplaceState: function (e, t, a) {
        e = e._reactInternals;
        var l = Zt(),
          r = ca(l);
        ((r.tag = 1),
          (r.payload = t),
          a != null && (r.callback = a),
          (t = fa(e, r, l)),
          t !== null && (gt(t, e, l), Zi(t, e, l)));
      },
      enqueueForceUpdate: function (e, t) {
        e = e._reactInternals;
        var a = Zt(),
          l = ca(a);
        ((l.tag = 2),
          t != null && (l.callback = t),
          (t = fa(e, l, a)),
          t !== null && (gt(t, e, a), Zi(t, e, a)));
      },
    };
    function oh(e, t, a, l, r, o, f) {
      return (
        (e = e.stateNode),
        typeof e.shouldComponentUpdate == "function"
          ? e.shouldComponentUpdate(l, o, f)
          : t.prototype && t.prototype.isPureReactComponent
            ? !Ci(a, l) || !Ci(r, o)
            : !0
      );
    }
    function sh(e, t, a, l) {
      ((e = t.state),
        typeof t.componentWillReceiveProps == "function" &&
          t.componentWillReceiveProps(a, l),
        typeof t.UNSAFE_componentWillReceiveProps == "function" &&
          t.UNSAFE_componentWillReceiveProps(a, l),
        t.state !== e && Eo.enqueueReplaceState(t, t.state, null));
    }
    function da(e, t) {
      var a = t;
      if ("ref" in t) {
        a = {};
        for (var l in t) l !== "ref" && (a[l] = t[l]);
      }
      if ((e = e.defaultProps)) {
        a === t && (a = w({}, a));
        for (var r in e) a[r] === void 0 && (a[r] = e[r]);
      }
      return a;
    }
    function Hg(e) {
      Zl(e);
    }
    function Vg(e) {
      console.error(e);
    }
    function Gg(e) {
      Zl(e);
    }
    function uu(e, t) {
      try {
        var a = e.onUncaughtError;
        a(t.value, { componentStack: t.stack });
      } catch (l) {
        setTimeout(function () {
          throw l;
        });
      }
    }
    function ch(e, t, a) {
      try {
        var l = e.onCaughtError;
        l(a.value, {
          componentStack: a.stack,
          errorBoundary: t.tag === 1 ? t.stateNode : null,
        });
      } catch (r) {
        setTimeout(function () {
          throw r;
        });
      }
    }
    function wo(e, t, a) {
      return (
        (a = ca(a)),
        (a.tag = 3),
        (a.payload = { element: null }),
        (a.callback = function () {
          uu(e, t);
        }),
        a
      );
    }
    function fh(e) {
      return ((e = ca(e)), (e.tag = 3), e);
    }
    function hh(e, t, a, l) {
      var r = a.type.getDerivedStateFromError;
      if (typeof r == "function") {
        var o = l.value;
        ((e.payload = function () {
          return r(o);
        }),
          (e.callback = function () {
            ch(t, a, l);
          }));
      }
      var f = a.stateNode;
      f !== null &&
        typeof f.componentDidCatch == "function" &&
        (e.callback = function () {
          (ch(t, a, l),
            typeof r != "function" &&
              (jn === null ? (jn = new Set([this])) : jn.add(this)));
          var m = l.stack;
          this.componentDidCatch(l.value, {
            componentStack: m !== null ? m : "",
          });
        });
    }
    function Yg(e, t, a, l, r) {
      if (
        ((a.flags |= 32768),
        l !== null && typeof l == "object" && typeof l.then == "function")
      ) {
        if (
          ((t = a.alternate),
          t !== null && Qa(t, a, r, !0),
          (a = Et.current),
          a !== null)
        ) {
          switch (a.tag) {
            case 31:
            case 13:
              return (
                jt === null
                  ? pu()
                  : a.alternate === null && je === 0 && (je = 3),
                (a.flags &= -257),
                (a.flags |= 65536),
                (a.lanes = r),
                l === Xl
                  ? (a.flags |= 16384)
                  : ((t = a.updateQueue),
                    t === null ? (a.updateQueue = new Set([l])) : t.add(l),
                    Fo(e, l, r)),
                !1
              );
            case 22:
              return (
                (a.flags |= 65536),
                l === Xl
                  ? (a.flags |= 16384)
                  : ((t = a.updateQueue),
                    t === null
                      ? ((t = {
                          transitions: null,
                          markerInstances: null,
                          retryQueue: new Set([l]),
                        }),
                        (a.updateQueue = t))
                      : ((a = t.retryQueue),
                        a === null ? (t.retryQueue = new Set([l])) : a.add(l)),
                    Fo(e, l, r)),
                !1
              );
          }
          throw Error(s(435, a.tag));
        }
        return (Fo(e, l, r), pu(), !1);
      }
      if (ce)
        return (
          (t = Et.current),
          t !== null
            ? ((t.flags & 65536) === 0 && (t.flags |= 256),
              (t.flags |= 65536),
              (t.lanes = r),
              l !== Vr && ((e = Error(s(422), { cause: l })), Di(Dt(e, a))))
            : (l !== Vr && ((t = Error(s(423), { cause: l })), Di(Dt(t, a))),
              (e = e.current.alternate),
              (e.flags |= 65536),
              (r &= -r),
              (e.lanes |= r),
              (l = Dt(l, a)),
              (r = wo(e.stateNode, l, r)),
              to(e, r),
              je !== 4 && (je = 2)),
          !1
        );
      var o = Error(s(520), { cause: l });
      if (
        ((o = Dt(o, a)),
        Fi === null ? (Fi = [o]) : Fi.push(o),
        je !== 4 && (je = 2),
        t === null)
      )
        return !0;
      ((l = Dt(l, a)), (a = t));
      do {
        switch (a.tag) {
          case 3:
            return (
              (a.flags |= 65536),
              (e = r & -r),
              (a.lanes |= e),
              (e = wo(a.stateNode, l, e)),
              to(a, e),
              !1
            );
          case 1:
            if (
              ((t = a.type),
              (o = a.stateNode),
              (a.flags & 128) === 0 &&
                (typeof t.getDerivedStateFromError == "function" ||
                  (o !== null &&
                    typeof o.componentDidCatch == "function" &&
                    (jn === null || !jn.has(o)))))
            )
              return (
                (a.flags |= 65536),
                (r &= -r),
                (a.lanes |= r),
                (r = fh(r)),
                hh(r, e, a, l),
                to(a, r),
                !1
              );
        }
        a = a.return;
      } while (a !== null);
      return !1;
    }
    var Oo = Error(s(461)),
      Ye = !1;
    function it(e, t, a, l) {
      t.child = e === null ? bf(t, null, a, l) : sa(t, e.child, a, l);
    }
    function dh(e, t, a, l, r) {
      a = a.render;
      var o = t.ref;
      if ("ref" in l) {
        var f = {};
        for (var m in l) m !== "ref" && (f[m] = l[m]);
      } else f = l;
      return (
        la(t),
        (l = ro(e, t, a, f, o, r)),
        (m = oo()),
        e !== null && !Ye
          ? (so(e, t, r), cn(e, t, r))
          : (ce && m && Lr(t), (t.flags |= 1), it(e, t, l, r), t.child)
      );
    }
    function mh(e, t, a, l, r) {
      if (e === null) {
        var o = a.type;
        return typeof o == "function" &&
          !Br(o) &&
          o.defaultProps === void 0 &&
          a.compare === null
          ? ((t.tag = 15), (t.type = o), vh(e, t, o, l, r))
          : ((e = $l(a.type, null, l, t, t.mode, r)),
            (e.ref = t.ref),
            (e.return = t),
            (t.child = e));
      }
      if (((o = e.child), !Uo(e, r))) {
        var f = o.memoizedProps;
        if (
          ((a = a.compare),
          (a = a !== null ? a : Ci),
          a(f, l) && e.ref === t.ref)
        )
          return cn(e, t, r);
      }
      return (
        (t.flags |= 1),
        (e = an(o, l)),
        (e.ref = t.ref),
        (e.return = t),
        (t.child = e)
      );
    }
    function vh(e, t, a, l, r) {
      if (e !== null) {
        var o = e.memoizedProps;
        if (Ci(o, l) && e.ref === t.ref)
          if (((Ye = !1), (t.pendingProps = l = o), Uo(e, r)))
            (e.flags & 131072) !== 0 && (Ye = !0);
          else return ((t.lanes = e.lanes), cn(e, t, r));
      }
      return Ro(e, t, a, l, r);
    }
    function gh(e, t, a, l) {
      var r = l.children,
        o = e !== null ? e.memoizedState : null;
      if (
        (e === null &&
          t.stateNode === null &&
          (t.stateNode = {
            _visibility: 1,
            _pendingMarkers: null,
            _retryCache: null,
            _transitions: null,
          }),
        l.mode === "hidden")
      ) {
        if ((t.flags & 128) !== 0) {
          if (((o = o !== null ? o.baseLanes | a : a), e !== null)) {
            for (l = t.child = e.child, r = 0; l !== null; )
              ((r = r | l.lanes | l.childLanes), (l = l.sibling));
            l = r & ~o;
          } else ((l = 0), (t.child = null));
          return yh(e, t, o, a, l);
        }
        if ((a & 536870912) !== 0)
          ((t.memoizedState = { baseLanes: 0, cachePool: null }),
            e !== null && Gl(t, o !== null ? o.cachePool : null),
            o !== null ? Tf(t, o) : ao(),
            zf(t));
        else
          return (
            (l = t.lanes = 536870912),
            yh(e, t, o !== null ? o.baseLanes | a : a, a, l)
          );
      } else
        o !== null
          ? (Gl(t, o.cachePool), Tf(t, o), Dn(t), (t.memoizedState = null))
          : (e !== null && Gl(t, null), ao(), Dn(t));
      return (it(e, t, r, a), t.child);
    }
    function Vi(e, t) {
      return (
        (e !== null && e.tag === 22) ||
          t.stateNode !== null ||
          (t.stateNode = {
            _visibility: 1,
            _pendingMarkers: null,
            _retryCache: null,
            _transitions: null,
          }),
        t.sibling
      );
    }
    function yh(e, t, a, l, r) {
      var o = Fr();
      return (
        (o = o === null ? null : { parent: Ve._currentValue, pool: o }),
        (t.memoizedState = { baseLanes: a, cachePool: o }),
        e !== null && Gl(t, null),
        ao(),
        zf(t),
        e !== null && Qa(e, t, l, !0),
        (t.childLanes = r),
        null
      );
    }
    function ru(e, t) {
      return (
        (t = su({ mode: t.mode, children: t.children }, e.mode)),
        (t.ref = e.ref),
        (e.child = t),
        (t.return = e),
        t
      );
    }
    function ph(e, t, a) {
      return (
        sa(t, e.child, null, a),
        (e = ru(t, t.pendingProps)),
        (e.flags |= 2),
        wt(t),
        (t.memoizedState = null),
        e
      );
    }
    function Xg(e, t, a) {
      var l = t.pendingProps,
        r = (t.flags & 128) !== 0;
      if (((t.flags &= -129), e === null)) {
        if (ce) {
          if (l.mode === "hidden")
            return ((e = ru(t, l)), (t.lanes = 536870912), Vi(null, e));
          if (
            (lo(t),
            (e = Oe)
              ? ((e = Nd(e, Ut)),
                (e = e !== null && e.data === "&" ? e : null),
                e !== null &&
                  ((t.memoizedState = {
                    dehydrated: e,
                    treeContext: wn !== null ? { id: Yt, overflow: Xt } : null,
                    retryLane: 536870912,
                    hydrationErrors: null,
                  }),
                  (a = af(e)),
                  (a.return = t),
                  (t.child = a),
                  (nt = t),
                  (Oe = null)))
              : (e = null),
            e === null)
          )
            throw Rn(t);
          return ((t.lanes = 536870912), null);
        }
        return ru(t, l);
      }
      var o = e.memoizedState;
      if (o !== null) {
        var f = o.dehydrated;
        if ((lo(t), r))
          if (t.flags & 256) ((t.flags &= -257), (t = ph(e, t, a)));
          else if (t.memoizedState !== null)
            ((t.child = e.child), (t.flags |= 128), (t = null));
          else throw Error(s(558));
        else if (
          (Ye || Qa(e, t, a, !1), (r = (a & e.childLanes) !== 0), Ye || r)
        ) {
          if (
            ((l = we),
            l !== null && ((f = sc(l, a)), f !== 0 && f !== o.retryLane))
          )
            throw ((o.retryLane = f), ta(e, f), gt(l, e, f), Oo);
          (pu(), (t = ph(e, t, a)));
        } else
          ((e = o.treeContext),
            (Oe = xt(f.nextSibling)),
            (nt = t),
            (ce = !0),
            (On = null),
            (Ut = !1),
            e !== null && rf(t, e),
            (t = ru(t, l)),
            (t.flags |= 4096));
        return t;
      }
      return (
        (e = an(e.child, { mode: l.mode, children: l.children })),
        (e.ref = t.ref),
        (t.child = e),
        (e.return = t),
        e
      );
    }
    function ou(e, t) {
      var a = t.ref;
      if (a === null) e !== null && e.ref !== null && (t.flags |= 4194816);
      else {
        if (typeof a != "function" && typeof a != "object") throw Error(s(284));
        (e === null || e.ref !== a) && (t.flags |= 4194816);
      }
    }
    function Ro(e, t, a, l, r) {
      return (
        la(t),
        (a = ro(e, t, a, l, void 0, r)),
        (l = oo()),
        e !== null && !Ye
          ? (so(e, t, r), cn(e, t, r))
          : (ce && l && Lr(t), (t.flags |= 1), it(e, t, a, r), t.child)
      );
    }
    function bh(e, t, a, l, r, o) {
      return (
        la(t),
        (t.updateQueue = null),
        (a = Ef(t, l, a, r)),
        Af(e),
        (l = oo()),
        e !== null && !Ye
          ? (so(e, t, o), cn(e, t, o))
          : (ce && l && Lr(t), (t.flags |= 1), it(e, t, a, o), t.child)
      );
    }
    function Sh(e, t, a, l, r) {
      if ((la(t), t.stateNode === null)) {
        var o = ja,
          f = a.contextType;
        (typeof f == "object" && f !== null && (o = at(f)),
          (o = new a(l, o)),
          (t.memoizedState =
            o.state !== null && o.state !== void 0 ? o.state : null),
          (o.updater = Eo),
          (t.stateNode = o),
          (o._reactInternals = t),
          (o = t.stateNode),
          (o.props = l),
          (o.state = t.memoizedState),
          (o.refs = {}),
          Pr(t),
          (f = a.contextType),
          (o.context = typeof f == "object" && f !== null ? at(f) : ja),
          (o.state = t.memoizedState),
          (f = a.getDerivedStateFromProps),
          typeof f == "function" &&
            (Ao(t, a, f, l), (o.state = t.memoizedState)),
          typeof a.getDerivedStateFromProps == "function" ||
            typeof o.getSnapshotBeforeUpdate == "function" ||
            (typeof o.UNSAFE_componentWillMount != "function" &&
              typeof o.componentWillMount != "function") ||
            ((f = o.state),
            typeof o.componentWillMount == "function" && o.componentWillMount(),
            typeof o.UNSAFE_componentWillMount == "function" &&
              o.UNSAFE_componentWillMount(),
            f !== o.state && Eo.enqueueReplaceState(o, o.state, null),
            Bi(t, l, o, r),
            xi(),
            (o.state = t.memoizedState)),
          typeof o.componentDidMount == "function" && (t.flags |= 4194308),
          (l = !0));
      } else if (e === null) {
        o = t.stateNode;
        var m = t.memoizedProps,
          y = da(a, m);
        o.props = y;
        var A = o.context,
          C = a.contextType;
        ((f = ja), typeof C == "object" && C !== null && (f = at(C)));
        var D = a.getDerivedStateFromProps;
        ((C =
          typeof D == "function" ||
          typeof o.getSnapshotBeforeUpdate == "function"),
          (m = t.pendingProps !== m),
          C ||
            (typeof o.UNSAFE_componentWillReceiveProps != "function" &&
              typeof o.componentWillReceiveProps != "function") ||
            ((m || A !== f) && sh(t, o, l, f)),
          (Mn = !1));
        var E = t.memoizedState;
        ((o.state = E),
          Bi(t, l, o, r),
          xi(),
          (A = t.memoizedState),
          m || E !== A || Mn
            ? (typeof D == "function" &&
                (Ao(t, a, D, l), (A = t.memoizedState)),
              (y = Mn || oh(t, a, y, l, E, A, f))
                ? (C ||
                    (typeof o.UNSAFE_componentWillMount != "function" &&
                      typeof o.componentWillMount != "function") ||
                    (typeof o.componentWillMount == "function" &&
                      o.componentWillMount(),
                    typeof o.UNSAFE_componentWillMount == "function" &&
                      o.UNSAFE_componentWillMount()),
                  typeof o.componentDidMount == "function" &&
                    (t.flags |= 4194308))
                : (typeof o.componentDidMount == "function" &&
                    (t.flags |= 4194308),
                  (t.memoizedProps = l),
                  (t.memoizedState = A)),
              (o.props = l),
              (o.state = A),
              (o.context = f),
              (l = y))
            : (typeof o.componentDidMount == "function" && (t.flags |= 4194308),
              (l = !1)));
      } else {
        ((o = t.stateNode),
          eo(e, t),
          (f = t.memoizedProps),
          (C = da(a, f)),
          (o.props = C),
          (D = t.pendingProps),
          (E = o.context),
          (A = a.contextType),
          (y = ja),
          typeof A == "object" && A !== null && (y = at(A)),
          (m = a.getDerivedStateFromProps),
          (A =
            typeof m == "function" ||
            typeof o.getSnapshotBeforeUpdate == "function") ||
            (typeof o.UNSAFE_componentWillReceiveProps != "function" &&
              typeof o.componentWillReceiveProps != "function") ||
            ((f !== D || E !== y) && sh(t, o, l, y)),
          (Mn = !1),
          (E = t.memoizedState),
          (o.state = E),
          Bi(t, l, o, r),
          xi());
        var O = t.memoizedState;
        f !== D ||
        E !== O ||
        Mn ||
        (e !== null && e.dependencies !== null && Hl(e.dependencies))
          ? (typeof m == "function" && (Ao(t, a, m, l), (O = t.memoizedState)),
            (C =
              Mn ||
              oh(t, a, C, l, E, O, y) ||
              (e !== null && e.dependencies !== null && Hl(e.dependencies)))
              ? (A ||
                  (typeof o.UNSAFE_componentWillUpdate != "function" &&
                    typeof o.componentWillUpdate != "function") ||
                  (typeof o.componentWillUpdate == "function" &&
                    o.componentWillUpdate(l, O, y),
                  typeof o.UNSAFE_componentWillUpdate == "function" &&
                    o.UNSAFE_componentWillUpdate(l, O, y)),
                typeof o.componentDidUpdate == "function" && (t.flags |= 4),
                typeof o.getSnapshotBeforeUpdate == "function" &&
                  (t.flags |= 1024))
              : (typeof o.componentDidUpdate != "function" ||
                  (f === e.memoizedProps && E === e.memoizedState) ||
                  (t.flags |= 4),
                typeof o.getSnapshotBeforeUpdate != "function" ||
                  (f === e.memoizedProps && E === e.memoizedState) ||
                  (t.flags |= 1024),
                (t.memoizedProps = l),
                (t.memoizedState = O)),
            (o.props = l),
            (o.state = O),
            (o.context = y),
            (l = C))
          : (typeof o.componentDidUpdate != "function" ||
              (f === e.memoizedProps && E === e.memoizedState) ||
              (t.flags |= 4),
            typeof o.getSnapshotBeforeUpdate != "function" ||
              (f === e.memoizedProps && E === e.memoizedState) ||
              (t.flags |= 1024),
            (l = !1));
      }
      return (
        (o = l),
        ou(e, t),
        (l = (t.flags & 128) !== 0),
        o || l
          ? ((o = t.stateNode),
            (a =
              l && typeof a.getDerivedStateFromError != "function"
                ? null
                : o.render()),
            (t.flags |= 1),
            e !== null && l
              ? ((t.child = sa(t, e.child, null, r)),
                (t.child = sa(t, null, a, r)))
              : it(e, t, a, r),
            (t.memoizedState = o.state),
            (e = t.child))
          : (e = cn(e, t, r)),
        e
      );
    }
    function _h(e, t, a, l) {
      return (aa(), (t.flags |= 256), it(e, t, a, l), t.child);
    }
    var Co = {
      dehydrated: null,
      treeContext: null,
      retryLane: 0,
      hydrationErrors: null,
    };
    function Mo(e) {
      return { baseLanes: e, cachePool: df() };
    }
    function No(e, t, a) {
      return ((e = e !== null ? e.childLanes & ~a : 0), t && (e |= Rt), e);
    }
    function Th(e, t, a) {
      var l = t.pendingProps,
        r = !1,
        o = (t.flags & 128) !== 0,
        f;
      if (
        ((f = o) ||
          (f =
            e !== null && e.memoizedState === null
              ? !1
              : (Qe.current & 2) !== 0),
        f && ((r = !0), (t.flags &= -129)),
        (f = (t.flags & 32) !== 0),
        (t.flags &= -33),
        e === null)
      ) {
        if (ce) {
          if (
            (r ? Nn(t) : Dn(t),
            (e = Oe)
              ? ((e = Nd(e, Ut)),
                (e = e !== null && e.data !== "&" ? e : null),
                e !== null &&
                  ((t.memoizedState = {
                    dehydrated: e,
                    treeContext: wn !== null ? { id: Yt, overflow: Xt } : null,
                    retryLane: 536870912,
                    hydrationErrors: null,
                  }),
                  (a = af(e)),
                  (a.return = t),
                  (t.child = a),
                  (nt = t),
                  (Oe = null)))
              : (e = null),
            e === null)
          )
            throw Rn(t);
          return (hs(e) ? (t.lanes = 32) : (t.lanes = 536870912), null);
        }
        var m = l.children;
        return (
          (l = l.fallback),
          r
            ? (Dn(t),
              (r = t.mode),
              (m = su({ mode: "hidden", children: m }, r)),
              (l = na(l, r, a, null)),
              (m.return = t),
              (l.return = t),
              (m.sibling = l),
              (t.child = m),
              (l = t.child),
              (l.memoizedState = Mo(a)),
              (l.childLanes = No(e, f, a)),
              (t.memoizedState = Co),
              Vi(null, l))
            : (Nn(t), Do(t, m))
        );
      }
      var y = e.memoizedState;
      if (y !== null && ((m = y.dehydrated), m !== null)) {
        if (o)
          t.flags & 256
            ? (Nn(t), (t.flags &= -257), (t = ko(e, t, a)))
            : t.memoizedState !== null
              ? (Dn(t), (t.child = e.child), (t.flags |= 128), (t = null))
              : (Dn(t),
                (m = l.fallback),
                (r = t.mode),
                (l = su({ mode: "visible", children: l.children }, r)),
                (m = na(m, r, a, null)),
                (m.flags |= 2),
                (l.return = t),
                (m.return = t),
                (l.sibling = m),
                (t.child = l),
                sa(t, e.child, null, a),
                (l = t.child),
                (l.memoizedState = Mo(a)),
                (l.childLanes = No(e, f, a)),
                (t.memoizedState = Co),
                (t = Vi(null, l)));
        else if ((Nn(t), hs(m))) {
          if (((f = m.nextSibling && m.nextSibling.dataset), f)) var A = f.dgst;
          ((f = A),
            (l = Error(s(419))),
            (l.stack = ""),
            (l.digest = f),
            Di({ value: l, source: null, stack: null }),
            (t = ko(e, t, a)));
        } else if (
          (Ye || Qa(e, t, a, !1), (f = (a & e.childLanes) !== 0), Ye || f)
        ) {
          if (
            ((f = we),
            f !== null && ((l = sc(f, a)), l !== 0 && l !== y.retryLane))
          )
            throw ((y.retryLane = l), ta(e, l), gt(f, e, l), Oo);
          (fs(m) || pu(), (t = ko(e, t, a)));
        } else
          fs(m)
            ? ((t.flags |= 192), (t.child = e.child), (t = null))
            : ((e = y.treeContext),
              (Oe = xt(m.nextSibling)),
              (nt = t),
              (ce = !0),
              (On = null),
              (Ut = !1),
              e !== null && rf(t, e),
              (t = Do(t, l.children)),
              (t.flags |= 4096));
        return t;
      }
      return r
        ? (Dn(t),
          (m = l.fallback),
          (r = t.mode),
          (y = e.child),
          (A = y.sibling),
          (l = an(y, { mode: "hidden", children: l.children })),
          (l.subtreeFlags = y.subtreeFlags & 65011712),
          A !== null
            ? (m = an(A, m))
            : ((m = na(m, r, a, null)), (m.flags |= 2)),
          (m.return = t),
          (l.return = t),
          (l.sibling = m),
          (t.child = l),
          Vi(null, l),
          (l = t.child),
          (m = e.child.memoizedState),
          m === null
            ? (m = Mo(a))
            : ((r = m.cachePool),
              r !== null
                ? ((y = Ve._currentValue),
                  (r = r.parent !== y ? { parent: y, pool: y } : r))
                : (r = df()),
              (m = { baseLanes: m.baseLanes | a, cachePool: r })),
          (l.memoizedState = m),
          (l.childLanes = No(e, f, a)),
          (t.memoizedState = Co),
          Vi(e.child, l))
        : (Nn(t),
          (a = e.child),
          (e = a.sibling),
          (a = an(a, { mode: "visible", children: l.children })),
          (a.return = t),
          (a.sibling = null),
          e !== null &&
            ((f = t.deletions),
            f === null ? ((t.deletions = [e]), (t.flags |= 16)) : f.push(e)),
          (t.child = a),
          (t.memoizedState = null),
          a);
    }
    function Do(e, t) {
      return (
        (t = su({ mode: "visible", children: t }, e.mode)),
        (t.return = e),
        (e.child = t)
      );
    }
    function su(e, t) {
      return ((e = At(22, e, null, t)), (e.lanes = 0), e);
    }
    function ko(e, t, a) {
      return (
        sa(t, e.child, null, a),
        (e = Do(t, t.pendingProps.children)),
        (e.flags |= 2),
        (t.memoizedState = null),
        e
      );
    }
    function zh(e, t, a) {
      e.lanes |= t;
      var l = e.alternate;
      (l !== null && (l.lanes |= t), Xr(e.return, t, a));
    }
    function qo(e, t, a, l, r, o) {
      var f = e.memoizedState;
      f === null
        ? (e.memoizedState = {
            isBackwards: t,
            rendering: null,
            renderingStartTime: 0,
            last: l,
            tail: a,
            tailMode: r,
            treeForkCount: o,
          })
        : ((f.isBackwards = t),
          (f.rendering = null),
          (f.renderingStartTime = 0),
          (f.last = l),
          (f.tail = a),
          (f.tailMode = r),
          (f.treeForkCount = o));
    }
    function Ah(e, t, a) {
      var l = t.pendingProps,
        r = l.revealOrder,
        o = l.tail;
      l = l.children;
      var f = Qe.current,
        m = (f & 2) !== 0;
      if (
        (m ? ((f = (f & 1) | 2), (t.flags |= 128)) : (f &= 1),
        Z(Qe, f),
        it(e, t, l, a),
        (l = ce ? Ni : 0),
        !m && e !== null && (e.flags & 128) !== 0)
      )
        e: for (e = t.child; e !== null; ) {
          if (e.tag === 13) e.memoizedState !== null && zh(e, a, t);
          else if (e.tag === 19) zh(e, a, t);
          else if (e.child !== null) {
            ((e.child.return = e), (e = e.child));
            continue;
          }
          if (e === t) break e;
          for (; e.sibling === null; ) {
            if (e.return === null || e.return === t) break e;
            e = e.return;
          }
          ((e.sibling.return = e.return), (e = e.sibling));
        }
      switch (r) {
        case "forwards":
          for (a = t.child, r = null; a !== null; )
            ((e = a.alternate),
              e !== null && Fl(e) === null && (r = a),
              (a = a.sibling));
          ((a = r),
            a === null
              ? ((r = t.child), (t.child = null))
              : ((r = a.sibling), (a.sibling = null)),
            qo(t, !1, r, a, o, l));
          break;
        case "backwards":
        case "unstable_legacy-backwards":
          for (a = null, r = t.child, t.child = null; r !== null; ) {
            if (((e = r.alternate), e !== null && Fl(e) === null)) {
              t.child = r;
              break;
            }
            ((e = r.sibling), (r.sibling = a), (a = r), (r = e));
          }
          qo(t, !0, a, null, o, l);
          break;
        case "together":
          qo(t, !1, null, null, void 0, l);
          break;
        default:
          t.memoizedState = null;
      }
      return t.child;
    }
    function cn(e, t, a) {
      if (
        (e !== null && (t.dependencies = e.dependencies),
        (Un |= t.lanes),
        (a & t.childLanes) === 0)
      )
        if (e !== null) {
          if ((Qa(e, t, a, !1), (a & t.childLanes) === 0)) return null;
        } else return null;
      if (e !== null && t.child !== e.child) throw Error(s(153));
      if (t.child !== null) {
        for (
          e = t.child, a = an(e, e.pendingProps), t.child = a, a.return = t;
          e.sibling !== null;
        )
          ((e = e.sibling),
            (a = a.sibling = an(e, e.pendingProps)),
            (a.return = t));
        a.sibling = null;
      }
      return t.child;
    }
    function Uo(e, t) {
      return (e.lanes & t) !== 0
        ? !0
        : ((e = e.dependencies), !!(e !== null && Hl(e)));
    }
    function Jg(e, t, a) {
      switch (t.tag) {
        case 3:
          (rt(t, t.stateNode.containerInfo),
            Cn(t, Ve, e.memoizedState.cache),
            aa());
          break;
        case 27:
        case 5:
          gi(t);
          break;
        case 4:
          rt(t, t.stateNode.containerInfo);
          break;
        case 10:
          Cn(t, t.type, t.memoizedProps.value);
          break;
        case 31:
          if (t.memoizedState !== null) return ((t.flags |= 128), lo(t), null);
          break;
        case 13:
          var l = t.memoizedState;
          if (l !== null)
            return l.dehydrated !== null
              ? (Nn(t), (t.flags |= 128), null)
              : (a & t.child.childLanes) !== 0
                ? Th(e, t, a)
                : (Nn(t), (e = cn(e, t, a)), e !== null ? e.sibling : null);
          Nn(t);
          break;
        case 19:
          var r = (e.flags & 128) !== 0;
          if (
            ((l = (a & t.childLanes) !== 0),
            l || (Qa(e, t, a, !1), (l = (a & t.childLanes) !== 0)),
            r)
          ) {
            if (l) return Ah(e, t, a);
            t.flags |= 128;
          }
          if (
            ((r = t.memoizedState),
            r !== null &&
              ((r.rendering = null), (r.tail = null), (r.lastEffect = null)),
            Z(Qe, Qe.current),
            l)
          )
            break;
          return null;
        case 22:
          return ((t.lanes = 0), gh(e, t, a, t.pendingProps));
        case 24:
          Cn(t, Ve, e.memoizedState.cache);
      }
      return cn(e, t, a);
    }
    function Eh(e, t, a) {
      if (e !== null)
        if (e.memoizedProps !== t.pendingProps) Ye = !0;
        else {
          if (!Uo(e, a) && (t.flags & 128) === 0)
            return ((Ye = !1), Jg(e, t, a));
          Ye = (e.flags & 131072) !== 0;
        }
      else ((Ye = !1), ce && (t.flags & 1048576) !== 0 && uf(t, Ni, t.index));
      switch (((t.lanes = 0), t.tag)) {
        case 16:
          e: {
            var l = t.pendingProps;
            if (((e = ra(t.elementType)), (t.type = e), typeof e == "function"))
              Br(e)
                ? ((l = da(e, l)), (t.tag = 1), (t = Sh(null, t, e, l, a)))
                : ((t.tag = 0), (t = Ro(null, t, e, l, a)));
            else {
              if (e != null) {
                var r = e.$$typeof;
                if (r === ne) {
                  ((t.tag = 11), (t = dh(null, t, e, l, a)));
                  break e;
                } else if (r === F) {
                  ((t.tag = 14), (t = mh(null, t, e, l, a)));
                  break e;
                }
              }
              throw ((t = We(e) || e), Error(s(306, t, "")));
            }
          }
          return t;
        case 0:
          return Ro(e, t, t.type, t.pendingProps, a);
        case 1:
          return ((l = t.type), (r = da(l, t.pendingProps)), Sh(e, t, l, r, a));
        case 3:
          e: {
            if ((rt(t, t.stateNode.containerInfo), e === null))
              throw Error(s(387));
            l = t.pendingProps;
            var o = t.memoizedState;
            ((r = o.element), eo(e, t), Bi(t, l, null, a));
            var f = t.memoizedState;
            if (
              ((l = f.cache),
              Cn(t, Ve, l),
              l !== o.cache && Jr(t, [Ve], a, !0),
              xi(),
              (l = f.element),
              o.isDehydrated)
            )
              if (
                ((o = { element: l, isDehydrated: !1, cache: f.cache }),
                (t.updateQueue.baseState = o),
                (t.memoizedState = o),
                t.flags & 256)
              ) {
                t = _h(e, t, l, a);
                break e;
              } else if (l !== r) {
                ((r = Dt(Error(s(424)), t)), Di(r), (t = _h(e, t, l, a)));
                break e;
              } else {
                switch (((e = t.stateNode.containerInfo), e.nodeType)) {
                  case 9:
                    e = e.body;
                    break;
                  default:
                    e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
                }
                for (
                  Oe = xt(e.firstChild),
                    nt = t,
                    ce = !0,
                    On = null,
                    Ut = !0,
                    a = bf(t, null, l, a),
                    t.child = a;
                  a;
                )
                  ((a.flags = (a.flags & -3) | 4096), (a = a.sibling));
              }
            else {
              if ((aa(), l === r)) {
                t = cn(e, t, a);
                break e;
              }
              it(e, t, l, a);
            }
            t = t.child;
          }
          return t;
        case 26:
          return (
            ou(e, t),
            e === null
              ? (a = Zd(t.type, null, t.pendingProps, null))
                ? (t.memoizedState = a)
                : ce ||
                  ((a = t.type),
                  (e = t.pendingProps),
                  (l = Eu(le.current).createElement(a)),
                  (l[tt] = t),
                  (l[ct] = e),
                  lt(l, a, e),
                  Pe(l),
                  (t.stateNode = l))
              : (t.memoizedState = Zd(
                  t.type,
                  e.memoizedProps,
                  t.pendingProps,
                  e.memoizedState,
                )),
            null
          );
        case 27:
          return (
            gi(t),
            e === null &&
              ce &&
              ((l = t.stateNode = qd(t.type, t.pendingProps, le.current)),
              (nt = t),
              (Ut = !0),
              (r = Oe),
              Qn(t.type) ? ((ds = r), (Oe = xt(l.firstChild))) : (Oe = r)),
            it(e, t, t.pendingProps.children, a),
            ou(e, t),
            e === null && (t.flags |= 4194304),
            t.child
          );
        case 5:
          return (
            e === null &&
              ce &&
              ((r = l = Oe) &&
                ((l = Ty(l, t.type, t.pendingProps, Ut)),
                l !== null
                  ? ((t.stateNode = l),
                    (nt = t),
                    (Oe = xt(l.firstChild)),
                    (Ut = !1),
                    (r = !0))
                  : (r = !1)),
              r || Rn(t)),
            gi(t),
            (r = t.type),
            (o = t.pendingProps),
            (f = e !== null ? e.memoizedProps : null),
            (l = o.children),
            os(r, o) ? (l = null) : f !== null && os(r, f) && (t.flags |= 32),
            t.memoizedState !== null &&
              ((r = ro(e, t, jg, null, null, a)), (ll._currentValue = r)),
            ou(e, t),
            it(e, t, l, a),
            t.child
          );
        case 6:
          return (
            e === null &&
              ce &&
              ((e = a = Oe) &&
                ((a = zy(a, t.pendingProps, Ut)),
                a !== null
                  ? ((t.stateNode = a), (nt = t), (Oe = null), (e = !0))
                  : (e = !1)),
              e || Rn(t)),
            null
          );
        case 13:
          return Th(e, t, a);
        case 4:
          return (
            rt(t, t.stateNode.containerInfo),
            (l = t.pendingProps),
            e === null ? (t.child = sa(t, null, l, a)) : it(e, t, l, a),
            t.child
          );
        case 11:
          return dh(e, t, t.type, t.pendingProps, a);
        case 7:
          return (it(e, t, t.pendingProps, a), t.child);
        case 8:
          return (it(e, t, t.pendingProps.children, a), t.child);
        case 12:
          return (it(e, t, t.pendingProps.children, a), t.child);
        case 10:
          return (
            (l = t.pendingProps),
            Cn(t, t.type, l.value),
            it(e, t, l.children, a),
            t.child
          );
        case 9:
          return (
            (r = t.type._context),
            (l = t.pendingProps.children),
            la(t),
            (r = at(r)),
            (l = l(r)),
            (t.flags |= 1),
            it(e, t, l, a),
            t.child
          );
        case 14:
          return mh(e, t, t.type, t.pendingProps, a);
        case 15:
          return vh(e, t, t.type, t.pendingProps, a);
        case 19:
          return Ah(e, t, a);
        case 31:
          return Xg(e, t, a);
        case 22:
          return gh(e, t, a, t.pendingProps);
        case 24:
          return (
            la(t),
            (l = at(Ve)),
            e === null
              ? ((r = Fr()),
                r === null &&
                  ((r = we),
                  (o = Kr()),
                  (r.pooledCache = o),
                  o.refCount++,
                  o !== null && (r.pooledCacheLanes |= a),
                  (r = o)),
                (t.memoizedState = { parent: l, cache: r }),
                Pr(t),
                Cn(t, Ve, r))
              : ((e.lanes & a) !== 0 && (eo(e, t), Bi(t, null, null, a), xi()),
                (r = e.memoizedState),
                (o = t.memoizedState),
                r.parent !== l
                  ? ((r = { parent: l, cache: l }),
                    (t.memoizedState = r),
                    t.lanes === 0 &&
                      (t.memoizedState = t.updateQueue.baseState = r),
                    Cn(t, Ve, l))
                  : ((l = o.cache),
                    Cn(t, Ve, l),
                    l !== r.cache && Jr(t, [Ve], a, !0))),
            it(e, t, t.pendingProps.children, a),
            t.child
          );
        case 29:
          throw t.pendingProps;
      }
      throw Error(s(156, t.tag));
    }
    function fn(e) {
      e.flags |= 4;
    }
    function jo(e, t, a, l, r) {
      if (((t = (e.mode & 32) !== 0) && (t = !1), t)) {
        if (((e.flags |= 16777216), (r & 335544128) === r))
          if (e.stateNode.complete) e.flags |= 8192;
          else if (Wh()) e.flags |= 8192;
          else throw ((oa = Xl), Wr);
      } else e.flags &= -16777217;
    }
    function wh(e, t) {
      if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
        e.flags &= -16777217;
      else if (((e.flags |= 16777216), !Ld(t)))
        if (Wh()) e.flags |= 8192;
        else throw ((oa = Xl), Wr);
    }
    function cu(e, t) {
      (t !== null && (e.flags |= 4),
        e.flags & 16384 &&
          ((t = e.tag !== 22 ? uc() : 536870912), (e.lanes |= t), (Wa |= t)));
    }
    function Gi(e, t) {
      if (!ce)
        switch (e.tailMode) {
          case "hidden":
            t = e.tail;
            for (var a = null; t !== null; )
              (t.alternate !== null && (a = t), (t = t.sibling));
            a === null ? (e.tail = null) : (a.sibling = null);
            break;
          case "collapsed":
            a = e.tail;
            for (var l = null; a !== null; )
              (a.alternate !== null && (l = a), (a = a.sibling));
            l === null
              ? t || e.tail === null
                ? (e.tail = null)
                : (e.tail.sibling = null)
              : (l.sibling = null);
        }
    }
    function Re(e) {
      var t = e.alternate !== null && e.alternate.child === e.child,
        a = 0,
        l = 0;
      if (t)
        for (var r = e.child; r !== null; )
          ((a |= r.lanes | r.childLanes),
            (l |= r.subtreeFlags & 65011712),
            (l |= r.flags & 65011712),
            (r.return = e),
            (r = r.sibling));
      else
        for (r = e.child; r !== null; )
          ((a |= r.lanes | r.childLanes),
            (l |= r.subtreeFlags),
            (l |= r.flags),
            (r.return = e),
            (r = r.sibling));
      return ((e.subtreeFlags |= l), (e.childLanes = a), t);
    }
    function Kg(e, t, a) {
      var l = t.pendingProps;
      switch ((Hr(t), t.tag)) {
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14:
          return (Re(t), null);
        case 1:
          return (Re(t), null);
        case 3:
          return (
            (a = t.stateNode),
            (l = null),
            e !== null && (l = e.memoizedState.cache),
            t.memoizedState.cache !== l && (t.flags |= 2048),
            rn(Ve),
            Be(),
            a.pendingContext &&
              ((a.context = a.pendingContext), (a.pendingContext = null)),
            (e === null || e.child === null) &&
              (Ba(t)
                ? fn(t)
                : e === null ||
                  (e.memoizedState.isDehydrated && (t.flags & 256) === 0) ||
                  ((t.flags |= 1024), Gr())),
            Re(t),
            null
          );
        case 26:
          var r = t.type,
            o = t.memoizedState;
          return (
            e === null
              ? (fn(t),
                o !== null ? (Re(t), wh(t, o)) : (Re(t), jo(t, r, null, l, a)))
              : o
                ? o !== e.memoizedState
                  ? (fn(t), Re(t), wh(t, o))
                  : (Re(t), (t.flags &= -16777217))
                : ((e = e.memoizedProps),
                  e !== l && fn(t),
                  Re(t),
                  jo(t, r, e, l, a)),
            null
          );
        case 27:
          if (
            (Sl(t),
            (a = le.current),
            (r = t.type),
            e !== null && t.stateNode != null)
          )
            e.memoizedProps !== l && fn(t);
          else {
            if (!l) {
              if (t.stateNode === null) throw Error(s(166));
              return (Re(t), null);
            }
            ((e = L.current),
              Ba(t) ? of(t, e) : ((e = qd(r, l, a)), (t.stateNode = e), fn(t)));
          }
          return (Re(t), null);
        case 5:
          if ((Sl(t), (r = t.type), e !== null && t.stateNode != null))
            e.memoizedProps !== l && fn(t);
          else {
            if (!l) {
              if (t.stateNode === null) throw Error(s(166));
              return (Re(t), null);
            }
            if (((o = L.current), Ba(t))) of(t, o);
            else {
              var f = Eu(le.current);
              switch (o) {
                case 1:
                  o = f.createElementNS("http://www.w3.org/2000/svg", r);
                  break;
                case 2:
                  o = f.createElementNS(
                    "http://www.w3.org/1998/Math/MathML",
                    r,
                  );
                  break;
                default:
                  switch (r) {
                    case "svg":
                      o = f.createElementNS("http://www.w3.org/2000/svg", r);
                      break;
                    case "math":
                      o = f.createElementNS(
                        "http://www.w3.org/1998/Math/MathML",
                        r,
                      );
                      break;
                    case "script":
                      ((o = f.createElement("div")),
                        (o.innerHTML = "<script><\/script>"),
                        (o = o.removeChild(o.firstChild)));
                      break;
                    case "select":
                      ((o =
                        typeof l.is == "string"
                          ? f.createElement("select", { is: l.is })
                          : f.createElement("select")),
                        l.multiple
                          ? (o.multiple = !0)
                          : l.size && (o.size = l.size));
                      break;
                    default:
                      o =
                        typeof l.is == "string"
                          ? f.createElement(r, { is: l.is })
                          : f.createElement(r);
                  }
              }
              ((o[tt] = t), (o[ct] = l));
              e: for (f = t.child; f !== null; ) {
                if (f.tag === 5 || f.tag === 6) o.appendChild(f.stateNode);
                else if (f.tag !== 4 && f.tag !== 27 && f.child !== null) {
                  ((f.child.return = f), (f = f.child));
                  continue;
                }
                if (f === t) break e;
                for (; f.sibling === null; ) {
                  if (f.return === null || f.return === t) break e;
                  f = f.return;
                }
                ((f.sibling.return = f.return), (f = f.sibling));
              }
              t.stateNode = o;
              e: switch ((lt(o, r, l), r)) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  l = !!l.autoFocus;
                  break e;
                case "img":
                  l = !0;
                  break e;
                default:
                  l = !1;
              }
              l && fn(t);
            }
          }
          return (
            Re(t),
            jo(
              t,
              t.type,
              e === null ? null : e.memoizedProps,
              t.pendingProps,
              a,
            ),
            null
          );
        case 6:
          if (e && t.stateNode != null) e.memoizedProps !== l && fn(t);
          else {
            if (typeof l != "string" && t.stateNode === null)
              throw Error(s(166));
            if (((e = le.current), Ba(t))) {
              if (
                ((e = t.stateNode),
                (a = t.memoizedProps),
                (l = null),
                (r = nt),
                r !== null)
              )
                switch (r.tag) {
                  case 27:
                  case 5:
                    l = r.memoizedProps;
                }
              ((e[tt] = t),
                (e = !!(
                  e.nodeValue === a ||
                  (l !== null && l.suppressHydrationWarning === !0) ||
                  zd(e.nodeValue, a)
                )),
                e || Rn(t, !0));
            } else
              ((e = Eu(e).createTextNode(l)), (e[tt] = t), (t.stateNode = e));
          }
          return (Re(t), null);
        case 31:
          if (((a = t.memoizedState), e === null || e.memoizedState !== null)) {
            if (((l = Ba(t)), a !== null)) {
              if (e === null) {
                if (!l) throw Error(s(318));
                if (
                  ((e = t.memoizedState),
                  (e = e !== null ? e.dehydrated : null),
                  !e)
                )
                  throw Error(s(557));
                e[tt] = t;
              } else
                (aa(),
                  (t.flags & 128) === 0 && (t.memoizedState = null),
                  (t.flags |= 4));
              (Re(t), (e = !1));
            } else
              ((a = Gr()),
                e !== null &&
                  e.memoizedState !== null &&
                  (e.memoizedState.hydrationErrors = a),
                (e = !0));
            if (!e) return t.flags & 256 ? (wt(t), t) : (wt(t), null);
            if ((t.flags & 128) !== 0) throw Error(s(558));
          }
          return (Re(t), null);
        case 13:
          if (
            ((l = t.memoizedState),
            e === null ||
              (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
          ) {
            if (((r = Ba(t)), l !== null && l.dehydrated !== null)) {
              if (e === null) {
                if (!r) throw Error(s(318));
                if (
                  ((r = t.memoizedState),
                  (r = r !== null ? r.dehydrated : null),
                  !r)
                )
                  throw Error(s(317));
                r[tt] = t;
              } else
                (aa(),
                  (t.flags & 128) === 0 && (t.memoizedState = null),
                  (t.flags |= 4));
              (Re(t), (r = !1));
            } else
              ((r = Gr()),
                e !== null &&
                  e.memoizedState !== null &&
                  (e.memoizedState.hydrationErrors = r),
                (r = !0));
            if (!r) return t.flags & 256 ? (wt(t), t) : (wt(t), null);
          }
          return (
            wt(t),
            (t.flags & 128) !== 0
              ? ((t.lanes = a), t)
              : ((a = l !== null),
                (e = e !== null && e.memoizedState !== null),
                a &&
                  ((l = t.child),
                  (r = null),
                  l.alternate !== null &&
                    l.alternate.memoizedState !== null &&
                    l.alternate.memoizedState.cachePool !== null &&
                    (r = l.alternate.memoizedState.cachePool.pool),
                  (o = null),
                  l.memoizedState !== null &&
                    l.memoizedState.cachePool !== null &&
                    (o = l.memoizedState.cachePool.pool),
                  o !== r && (l.flags |= 2048)),
                a !== e && a && (t.child.flags |= 8192),
                cu(t, t.updateQueue),
                Re(t),
                null)
          );
        case 4:
          return (
            Be(),
            e === null && bd(t.stateNode.containerInfo),
            Re(t),
            null
          );
        case 10:
          return (rn(t.type), Re(t), null);
        case 19:
          if ((R(Qe), (l = t.memoizedState), l === null)) return (Re(t), null);
          if (((r = (t.flags & 128) !== 0), (o = l.rendering), o === null))
            if (r) Gi(l, !1);
            else {
              if (je !== 0 || (e !== null && (e.flags & 128) !== 0))
                for (e = t.child; e !== null; ) {
                  if (((o = Fl(e)), o !== null)) {
                    for (
                      t.flags |= 128,
                        Gi(l, !1),
                        e = o.updateQueue,
                        t.updateQueue = e,
                        cu(t, e),
                        t.subtreeFlags = 0,
                        e = a,
                        a = t.child;
                      a !== null;
                    )
                      (nf(a, e), (a = a.sibling));
                    return (
                      Z(Qe, (Qe.current & 1) | 2),
                      ce && ln(t, l.treeForkCount),
                      t.child
                    );
                  }
                  e = e.sibling;
                }
              l.tail !== null &&
                St() > vu &&
                ((t.flags |= 128), (r = !0), Gi(l, !1), (t.lanes = 4194304));
            }
          else {
            if (!r)
              if (((e = Fl(o)), e !== null)) {
                if (
                  ((t.flags |= 128),
                  (r = !0),
                  (e = e.updateQueue),
                  (t.updateQueue = e),
                  cu(t, e),
                  Gi(l, !0),
                  l.tail === null &&
                    l.tailMode === "hidden" &&
                    !o.alternate &&
                    !ce)
                )
                  return (Re(t), null);
              } else
                2 * St() - l.renderingStartTime > vu &&
                  a !== 536870912 &&
                  ((t.flags |= 128), (r = !0), Gi(l, !1), (t.lanes = 4194304));
            l.isBackwards
              ? ((o.sibling = t.child), (t.child = o))
              : ((e = l.last),
                e !== null ? (e.sibling = o) : (t.child = o),
                (l.last = o));
          }
          return l.tail !== null
            ? ((e = l.tail),
              (l.rendering = e),
              (l.tail = e.sibling),
              (l.renderingStartTime = St()),
              (e.sibling = null),
              (a = Qe.current),
              Z(Qe, r ? (a & 1) | 2 : a & 1),
              ce && ln(t, l.treeForkCount),
              e)
            : (Re(t), null);
        case 22:
        case 23:
          return (
            wt(t),
            io(),
            (l = t.memoizedState !== null),
            e !== null
              ? (e.memoizedState !== null) !== l && (t.flags |= 8192)
              : l && (t.flags |= 8192),
            l
              ? (a & 536870912) !== 0 &&
                (t.flags & 128) === 0 &&
                (Re(t), t.subtreeFlags & 6 && (t.flags |= 8192))
              : Re(t),
            (a = t.updateQueue),
            a !== null && cu(t, a.retryQueue),
            (a = null),
            e !== null &&
              e.memoizedState !== null &&
              e.memoizedState.cachePool !== null &&
              (a = e.memoizedState.cachePool.pool),
            (l = null),
            t.memoizedState !== null &&
              t.memoizedState.cachePool !== null &&
              (l = t.memoizedState.cachePool.pool),
            l !== a && (t.flags |= 2048),
            e !== null && R(ua),
            null
          );
        case 24:
          return (
            (a = null),
            e !== null && (a = e.memoizedState.cache),
            t.memoizedState.cache !== a && (t.flags |= 2048),
            rn(Ve),
            Re(t),
            null
          );
        case 25:
          return null;
        case 30:
          return null;
      }
      throw Error(s(156, t.tag));
    }
    function Ig(e, t) {
      switch ((Hr(t), t.tag)) {
        case 1:
          return (
            (e = t.flags),
            e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
          );
        case 3:
          return (
            rn(Ve),
            Be(),
            (e = t.flags),
            (e & 65536) !== 0 && (e & 128) === 0
              ? ((t.flags = (e & -65537) | 128), t)
              : null
          );
        case 26:
        case 27:
        case 5:
          return (Sl(t), null);
        case 31:
          if (t.memoizedState !== null) {
            if ((wt(t), t.alternate === null)) throw Error(s(340));
            aa();
          }
          return (
            (e = t.flags),
            e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
          );
        case 13:
          if (
            (wt(t), (e = t.memoizedState), e !== null && e.dehydrated !== null)
          ) {
            if (t.alternate === null) throw Error(s(340));
            aa();
          }
          return (
            (e = t.flags),
            e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
          );
        case 19:
          return (R(Qe), null);
        case 4:
          return (Be(), null);
        case 10:
          return (rn(t.type), null);
        case 22:
        case 23:
          return (
            wt(t),
            io(),
            e !== null && R(ua),
            (e = t.flags),
            e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
          );
        case 24:
          return (rn(Ve), null);
        case 25:
          return null;
        default:
          return null;
      }
    }
    function Oh(e, t) {
      switch ((Hr(t), t.tag)) {
        case 3:
          (rn(Ve), Be());
          break;
        case 26:
        case 27:
        case 5:
          Sl(t);
          break;
        case 4:
          Be();
          break;
        case 31:
          t.memoizedState !== null && wt(t);
          break;
        case 13:
          wt(t);
          break;
        case 19:
          R(Qe);
          break;
        case 10:
          rn(t.type);
          break;
        case 22:
        case 23:
          (wt(t), io(), e !== null && R(ua));
          break;
        case 24:
          rn(Ve);
      }
    }
    function Yi(e, t) {
      try {
        var a = t.updateQueue,
          l = a !== null ? a.lastEffect : null;
        if (l !== null) {
          var r = l.next;
          a = r;
          do {
            if ((a.tag & e) === e) {
              l = void 0;
              var o = a.create,
                f = a.inst;
              ((l = o()), (f.destroy = l));
            }
            a = a.next;
          } while (a !== r);
        }
      } catch (m) {
        Se(t, t.return, m);
      }
    }
    function kn(e, t, a) {
      try {
        var l = t.updateQueue,
          r = l !== null ? l.lastEffect : null;
        if (r !== null) {
          var o = r.next;
          l = o;
          do {
            if ((l.tag & e) === e) {
              var f = l.inst,
                m = f.destroy;
              if (m !== void 0) {
                ((f.destroy = void 0), (r = t));
                var y = a,
                  A = m;
                try {
                  A();
                } catch (C) {
                  Se(r, y, C);
                }
              }
            }
            l = l.next;
          } while (l !== o);
        }
      } catch (C) {
        Se(t, t.return, C);
      }
    }
    function Rh(e) {
      var t = e.updateQueue;
      if (t !== null) {
        var a = e.stateNode;
        try {
          _f(t, a);
        } catch (l) {
          Se(e, e.return, l);
        }
      }
    }
    function Ch(e, t, a) {
      ((a.props = da(e.type, e.memoizedProps)), (a.state = e.memoizedState));
      try {
        a.componentWillUnmount();
      } catch (l) {
        Se(e, t, l);
      }
    }
    function Xi(e, t) {
      try {
        var a = e.ref;
        if (a !== null) {
          switch (e.tag) {
            case 26:
            case 27:
            case 5:
              var l = e.stateNode;
              break;
            case 30:
              l = e.stateNode;
              break;
            default:
              l = e.stateNode;
          }
          typeof a == "function" ? (e.refCleanup = a(l)) : (a.current = l);
        }
      } catch (r) {
        Se(e, t, r);
      }
    }
    function Jt(e, t) {
      var a = e.ref,
        l = e.refCleanup;
      if (a !== null)
        if (typeof l == "function")
          try {
            l();
          } catch (r) {
            Se(e, t, r);
          } finally {
            ((e.refCleanup = null),
              (e = e.alternate),
              e != null && (e.refCleanup = null));
          }
        else if (typeof a == "function")
          try {
            a(null);
          } catch (r) {
            Se(e, t, r);
          }
        else a.current = null;
    }
    function Mh(e) {
      var t = e.type,
        a = e.memoizedProps,
        l = e.stateNode;
      try {
        e: switch (t) {
          case "button":
          case "input":
          case "select":
          case "textarea":
            a.autoFocus && l.focus();
            break e;
          case "img":
            a.src ? (l.src = a.src) : a.srcSet && (l.srcset = a.srcSet);
        }
      } catch (r) {
        Se(e, e.return, r);
      }
    }
    function Zo(e, t, a) {
      try {
        var l = e.stateNode;
        (gy(l, e.type, a, t), (l[ct] = t));
      } catch (r) {
        Se(e, e.return, r);
      }
    }
    function Nh(e) {
      return (
        e.tag === 5 ||
        e.tag === 3 ||
        e.tag === 26 ||
        (e.tag === 27 && Qn(e.type)) ||
        e.tag === 4
      );
    }
    function xo(e) {
      e: for (;;) {
        for (; e.sibling === null; ) {
          if (e.return === null || Nh(e.return)) return null;
          e = e.return;
        }
        for (
          e.sibling.return = e.return, e = e.sibling;
          e.tag !== 5 && e.tag !== 6 && e.tag !== 18;
        ) {
          if (
            (e.tag === 27 && Qn(e.type)) ||
            e.flags & 2 ||
            e.child === null ||
            e.tag === 4
          )
            continue e;
          ((e.child.return = e), (e = e.child));
        }
        if (!(e.flags & 2)) return e.stateNode;
      }
    }
    function Bo(e, t, a) {
      var l = e.tag;
      if (l === 5 || l === 6)
        ((e = e.stateNode),
          t
            ? (a.nodeType === 9
                ? a.body
                : a.nodeName === "HTML"
                  ? a.ownerDocument.body
                  : a
              ).insertBefore(e, t)
            : ((t =
                a.nodeType === 9
                  ? a.body
                  : a.nodeName === "HTML"
                    ? a.ownerDocument.body
                    : a),
              t.appendChild(e),
              (a = a._reactRootContainer),
              a != null || t.onclick !== null || (t.onclick = tn)));
      else if (
        l !== 4 &&
        (l === 27 && Qn(e.type) && ((a = e.stateNode), (t = null)),
        (e = e.child),
        e !== null)
      )
        for (Bo(e, t, a), e = e.sibling; e !== null; )
          (Bo(e, t, a), (e = e.sibling));
    }
    function fu(e, t, a) {
      var l = e.tag;
      if (l === 5 || l === 6)
        ((e = e.stateNode), t ? a.insertBefore(e, t) : a.appendChild(e));
      else if (
        l !== 4 &&
        (l === 27 && Qn(e.type) && (a = e.stateNode), (e = e.child), e !== null)
      )
        for (fu(e, t, a), e = e.sibling; e !== null; )
          (fu(e, t, a), (e = e.sibling));
    }
    function Dh(e) {
      var t = e.stateNode,
        a = e.memoizedProps;
      try {
        for (var l = e.type, r = t.attributes; r.length; )
          t.removeAttributeNode(r[0]);
        (lt(t, l, a), (t[tt] = e), (t[ct] = a));
      } catch (o) {
        Se(e, e.return, o);
      }
    }
    var hn = !1,
      Xe = !1,
      Qo = !1,
      kh = typeof WeakSet == "function" ? WeakSet : Set,
      et = null;
    function Fg(e, t) {
      if (((e = e.containerInfo), (us = Du), (e = Xc(e)), Dr(e))) {
        if ("selectionStart" in e)
          var a = { start: e.selectionStart, end: e.selectionEnd };
        else
          e: {
            a = ((a = e.ownerDocument) && a.defaultView) || window;
            var l = a.getSelection && a.getSelection();
            if (l && l.rangeCount !== 0) {
              a = l.anchorNode;
              var r = l.anchorOffset,
                o = l.focusNode;
              l = l.focusOffset;
              try {
                (a.nodeType, o.nodeType);
              } catch {
                a = null;
                break e;
              }
              var f = 0,
                m = -1,
                y = -1,
                A = 0,
                C = 0,
                D = e,
                E = null;
              t: for (;;) {
                for (
                  var O;
                  D !== a || (r !== 0 && D.nodeType !== 3) || (m = f + r),
                    D !== o || (l !== 0 && D.nodeType !== 3) || (y = f + l),
                    D.nodeType === 3 && (f += D.nodeValue.length),
                    (O = D.firstChild) !== null;
                )
                  ((E = D), (D = O));
                for (;;) {
                  if (D === e) break t;
                  if (
                    (E === a && ++A === r && (m = f),
                    E === o && ++C === l && (y = f),
                    (O = D.nextSibling) !== null)
                  )
                    break;
                  ((D = E), (E = D.parentNode));
                }
                D = O;
              }
              a = m === -1 || y === -1 ? null : { start: m, end: y };
            } else a = null;
          }
        a = a || { start: 0, end: 0 };
      } else a = null;
      for (
        rs = { focusedElem: e, selectionRange: a }, Du = !1, et = t;
        et !== null;
      )
        if (
          ((t = et), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null)
        )
          ((e.return = t), (et = e));
        else
          for (; et !== null; ) {
            switch (((t = et), (o = t.alternate), (e = t.flags), t.tag)) {
              case 0:
                if (
                  (e & 4) !== 0 &&
                  ((e = t.updateQueue),
                  (e = e !== null ? e.events : null),
                  e !== null)
                )
                  for (a = 0; a < e.length; a++)
                    ((r = e[a]), (r.ref.impl = r.nextImpl));
                break;
              case 11:
              case 15:
                break;
              case 1:
                if ((e & 1024) !== 0 && o !== null) {
                  ((e = void 0),
                    (a = t),
                    (r = o.memoizedProps),
                    (o = o.memoizedState),
                    (l = a.stateNode));
                  try {
                    var $ = da(a.type, r);
                    ((e = l.getSnapshotBeforeUpdate($, o)),
                      (l.__reactInternalSnapshotBeforeUpdate = e));
                  } catch (J) {
                    Se(a, a.return, J);
                  }
                }
                break;
              case 3:
                if ((e & 1024) !== 0) {
                  if (
                    ((e = t.stateNode.containerInfo), (a = e.nodeType), a === 9)
                  )
                    cs(e);
                  else if (a === 1)
                    switch (e.nodeName) {
                      case "HEAD":
                      case "HTML":
                      case "BODY":
                        cs(e);
                        break;
                      default:
                        e.textContent = "";
                    }
                }
                break;
              case 5:
              case 26:
              case 27:
              case 6:
              case 4:
              case 17:
                break;
              default:
                if ((e & 1024) !== 0) throw Error(s(163));
            }
            if (((e = t.sibling), e !== null)) {
              ((e.return = t.return), (et = e));
              break;
            }
            et = t.return;
          }
    }
    function qh(e, t, a) {
      var l = a.flags;
      switch (a.tag) {
        case 0:
        case 11:
        case 15:
          (mn(e, a), l & 4 && Yi(5, a));
          break;
        case 1:
          if ((mn(e, a), l & 4))
            if (((e = a.stateNode), t === null))
              try {
                e.componentDidMount();
              } catch (f) {
                Se(a, a.return, f);
              }
            else {
              var r = da(a.type, t.memoizedProps);
              t = t.memoizedState;
              try {
                e.componentDidUpdate(
                  r,
                  t,
                  e.__reactInternalSnapshotBeforeUpdate,
                );
              } catch (f) {
                Se(a, a.return, f);
              }
            }
          (l & 64 && Rh(a), l & 512 && Xi(a, a.return));
          break;
        case 3:
          if ((mn(e, a), l & 64 && ((e = a.updateQueue), e !== null))) {
            if (((t = null), a.child !== null))
              switch (a.child.tag) {
                case 27:
                case 5:
                  t = a.child.stateNode;
                  break;
                case 1:
                  t = a.child.stateNode;
              }
            try {
              _f(e, t);
            } catch (f) {
              Se(a, a.return, f);
            }
          }
          break;
        case 27:
          t === null && l & 4 && Dh(a);
        case 26:
        case 5:
          (mn(e, a), t === null && l & 4 && Mh(a), l & 512 && Xi(a, a.return));
          break;
        case 12:
          mn(e, a);
          break;
        case 31:
          (mn(e, a), l & 4 && Zh(e, a));
          break;
        case 13:
          (mn(e, a),
            l & 4 && xh(e, a),
            l & 64 &&
              ((e = a.memoizedState),
              e !== null &&
                ((e = e.dehydrated),
                e !== null && ((a = uy.bind(null, a)), Ay(e, a)))));
          break;
        case 22:
          if (((l = a.memoizedState !== null || hn), !l)) {
            ((t = (t !== null && t.memoizedState !== null) || Xe), (r = hn));
            var o = Xe;
            ((hn = l),
              (Xe = t) && !o
                ? vn(e, a, (a.subtreeFlags & 8772) !== 0)
                : mn(e, a),
              (hn = r),
              (Xe = o));
          }
          break;
        case 30:
          break;
        default:
          mn(e, a);
      }
    }
    function Uh(e) {
      var t = e.alternate;
      (t !== null && ((e.alternate = null), Uh(t)),
        (e.child = null),
        (e.deletions = null),
        (e.sibling = null),
        e.tag === 5 && ((t = e.stateNode), t !== null && vr(t)),
        (e.stateNode = null),
        (e.return = null),
        (e.dependencies = null),
        (e.memoizedProps = null),
        (e.memoizedState = null),
        (e.pendingProps = null),
        (e.stateNode = null),
        (e.updateQueue = null));
    }
    var Ce = null,
      ht = !1;
    function dn(e, t, a) {
      for (a = a.child; a !== null; ) (jh(e, t, a), (a = a.sibling));
    }
    function jh(e, t, a) {
      if (_t && typeof _t.onCommitFiberUnmount == "function")
        try {
          _t.onCommitFiberUnmount(yi, a);
        } catch {}
      switch (a.tag) {
        case 26:
          (Xe || Jt(a, t),
            dn(e, t, a),
            a.memoizedState
              ? a.memoizedState.count--
              : a.stateNode &&
                ((a = a.stateNode), a.parentNode.removeChild(a)));
          break;
        case 27:
          Xe || Jt(a, t);
          var l = Ce,
            r = ht;
          (Qn(a.type) && ((Ce = a.stateNode), (ht = !1)),
            dn(e, t, a),
            nl(a.stateNode),
            (Ce = l),
            (ht = r));
          break;
        case 5:
          Xe || Jt(a, t);
        case 6:
          if (
            ((l = Ce),
            (r = ht),
            (Ce = null),
            dn(e, t, a),
            (Ce = l),
            (ht = r),
            Ce !== null)
          )
            if (ht)
              try {
                (Ce.nodeType === 9
                  ? Ce.body
                  : Ce.nodeName === "HTML"
                    ? Ce.ownerDocument.body
                    : Ce
                ).removeChild(a.stateNode);
              } catch (o) {
                Se(a, t, o);
              }
            else
              try {
                Ce.removeChild(a.stateNode);
              } catch (o) {
                Se(a, t, o);
              }
          break;
        case 18:
          Ce !== null &&
            (ht
              ? ((e = Ce),
                Cd(
                  e.nodeType === 9
                    ? e.body
                    : e.nodeName === "HTML"
                      ? e.ownerDocument.body
                      : e,
                  a.stateNode,
                ),
                ui(e))
              : Cd(Ce, a.stateNode));
          break;
        case 4:
          ((l = Ce),
            (r = ht),
            (Ce = a.stateNode.containerInfo),
            (ht = !0),
            dn(e, t, a),
            (Ce = l),
            (ht = r));
          break;
        case 0:
        case 11:
        case 14:
        case 15:
          (kn(2, a, t), Xe || kn(4, a, t), dn(e, t, a));
          break;
        case 1:
          (Xe ||
            (Jt(a, t),
            (l = a.stateNode),
            typeof l.componentWillUnmount == "function" && Ch(a, t, l)),
            dn(e, t, a));
          break;
        case 21:
          dn(e, t, a);
          break;
        case 22:
          ((Xe = (l = Xe) || a.memoizedState !== null), dn(e, t, a), (Xe = l));
          break;
        default:
          dn(e, t, a);
      }
    }
    function Zh(e, t) {
      if (
        t.memoizedState === null &&
        ((e = t.alternate), e !== null && ((e = e.memoizedState), e !== null))
      ) {
        e = e.dehydrated;
        try {
          ui(e);
        } catch (a) {
          Se(t, t.return, a);
        }
      }
    }
    function xh(e, t) {
      if (
        t.memoizedState === null &&
        ((e = t.alternate),
        e !== null &&
          ((e = e.memoizedState),
          e !== null && ((e = e.dehydrated), e !== null)))
      )
        try {
          ui(e);
        } catch (a) {
          Se(t, t.return, a);
        }
    }
    function Wg(e) {
      switch (e.tag) {
        case 31:
        case 13:
        case 19:
          var t = e.stateNode;
          return (t === null && (t = e.stateNode = new kh()), t);
        case 22:
          return (
            (e = e.stateNode),
            (t = e._retryCache),
            t === null && (t = e._retryCache = new kh()),
            t
          );
        default:
          throw Error(s(435, e.tag));
      }
    }
    function hu(e, t) {
      var a = Wg(e);
      t.forEach(function (l) {
        if (!a.has(l)) {
          a.add(l);
          var r = ry.bind(null, e, l);
          l.then(r, r);
        }
      });
    }
    function dt(e, t) {
      var a = t.deletions;
      if (a !== null)
        for (var l = 0; l < a.length; l++) {
          var r = a[l],
            o = e,
            f = t,
            m = f;
          e: for (; m !== null; ) {
            switch (m.tag) {
              case 27:
                if (Qn(m.type)) {
                  ((Ce = m.stateNode), (ht = !1));
                  break e;
                }
                break;
              case 5:
                ((Ce = m.stateNode), (ht = !1));
                break e;
              case 3:
              case 4:
                ((Ce = m.stateNode.containerInfo), (ht = !0));
                break e;
            }
            m = m.return;
          }
          if (Ce === null) throw Error(s(160));
          (jh(o, f, r),
            (Ce = null),
            (ht = !1),
            (o = r.alternate),
            o !== null && (o.return = null),
            (r.return = null));
        }
      if (t.subtreeFlags & 13886)
        for (t = t.child; t !== null; ) (Bh(t, e), (t = t.sibling));
    }
    var Ht = null;
    function Bh(e, t) {
      var a = e.alternate,
        l = e.flags;
      switch (e.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          (dt(t, e),
            mt(e),
            l & 4 && (kn(3, e, e.return), Yi(3, e), kn(5, e, e.return)));
          break;
        case 1:
          (dt(t, e),
            mt(e),
            l & 512 && (Xe || a === null || Jt(a, a.return)),
            l & 64 &&
              hn &&
              ((e = e.updateQueue),
              e !== null &&
                ((l = e.callbacks),
                l !== null &&
                  ((a = e.shared.hiddenCallbacks),
                  (e.shared.hiddenCallbacks = a === null ? l : a.concat(l))))));
          break;
        case 26:
          var r = Ht;
          if (
            (dt(t, e),
            mt(e),
            l & 512 && (Xe || a === null || Jt(a, a.return)),
            l & 4)
          ) {
            var o = a !== null ? a.memoizedState : null;
            if (((l = e.memoizedState), a === null))
              if (l === null)
                if (e.stateNode === null) {
                  e: {
                    ((l = e.type),
                      (a = e.memoizedProps),
                      (r = r.ownerDocument || r));
                    t: switch (l) {
                      case "title":
                        ((o = r.getElementsByTagName("title")[0]),
                          (!o ||
                            o[Si] ||
                            o[tt] ||
                            o.namespaceURI === "http://www.w3.org/2000/svg" ||
                            o.hasAttribute("itemprop")) &&
                            ((o = r.createElement(l)),
                            r.head.insertBefore(
                              o,
                              r.querySelector("head > title"),
                            )),
                          lt(o, l, a),
                          (o[tt] = e),
                          Pe(o),
                          (l = o));
                        break e;
                      case "link":
                        var f = Qd("link", "href", r).get(l + (a.href || ""));
                        if (f) {
                          for (var m = 0; m < f.length; m++)
                            if (
                              ((o = f[m]),
                              o.getAttribute("href") ===
                                (a.href == null || a.href === ""
                                  ? null
                                  : a.href) &&
                                o.getAttribute("rel") ===
                                  (a.rel == null ? null : a.rel) &&
                                o.getAttribute("title") ===
                                  (a.title == null ? null : a.title) &&
                                o.getAttribute("crossorigin") ===
                                  (a.crossOrigin == null
                                    ? null
                                    : a.crossOrigin))
                            ) {
                              f.splice(m, 1);
                              break t;
                            }
                        }
                        ((o = r.createElement(l)),
                          lt(o, l, a),
                          r.head.appendChild(o));
                        break;
                      case "meta":
                        if (
                          (f = Qd("meta", "content", r).get(
                            l + (a.content || ""),
                          ))
                        ) {
                          for (m = 0; m < f.length; m++)
                            if (
                              ((o = f[m]),
                              o.getAttribute("content") ===
                                (a.content == null ? null : "" + a.content) &&
                                o.getAttribute("name") ===
                                  (a.name == null ? null : a.name) &&
                                o.getAttribute("property") ===
                                  (a.property == null ? null : a.property) &&
                                o.getAttribute("http-equiv") ===
                                  (a.httpEquiv == null ? null : a.httpEquiv) &&
                                o.getAttribute("charset") ===
                                  (a.charSet == null ? null : a.charSet))
                            ) {
                              f.splice(m, 1);
                              break t;
                            }
                        }
                        ((o = r.createElement(l)),
                          lt(o, l, a),
                          r.head.appendChild(o));
                        break;
                      default:
                        throw Error(s(468, l));
                    }
                    ((o[tt] = e), Pe(o), (l = o));
                  }
                  e.stateNode = l;
                } else $d(r, e.type, e.stateNode);
              else e.stateNode = Bd(r, l, e.memoizedProps);
            else
              o !== l
                ? (o === null
                    ? a.stateNode !== null &&
                      ((a = a.stateNode), a.parentNode.removeChild(a))
                    : o.count--,
                  l === null
                    ? $d(r, e.type, e.stateNode)
                    : Bd(r, l, e.memoizedProps))
                : l === null &&
                  e.stateNode !== null &&
                  Zo(e, e.memoizedProps, a.memoizedProps);
          }
          break;
        case 27:
          (dt(t, e),
            mt(e),
            l & 512 && (Xe || a === null || Jt(a, a.return)),
            a !== null && l & 4 && Zo(e, e.memoizedProps, a.memoizedProps));
          break;
        case 5:
          if (
            (dt(t, e),
            mt(e),
            l & 512 && (Xe || a === null || Jt(a, a.return)),
            e.flags & 32)
          ) {
            r = e.stateNode;
            try {
              Ca(r, "");
            } catch ($) {
              Se(e, e.return, $);
            }
          }
          (l & 4 &&
            e.stateNode != null &&
            ((r = e.memoizedProps), Zo(e, r, a !== null ? a.memoizedProps : r)),
            l & 1024 && (Qo = !0));
          break;
        case 6:
          if ((dt(t, e), mt(e), l & 4)) {
            if (e.stateNode === null) throw Error(s(162));
            ((l = e.memoizedProps), (a = e.stateNode));
            try {
              a.nodeValue = l;
            } catch ($) {
              Se(e, e.return, $);
            }
          }
          break;
        case 3:
          if (
            ((Ru = null),
            (r = Ht),
            (Ht = wu(t.containerInfo)),
            dt(t, e),
            (Ht = r),
            mt(e),
            l & 4 && a !== null && a.memoizedState.isDehydrated)
          )
            try {
              ui(t.containerInfo);
            } catch ($) {
              Se(e, e.return, $);
            }
          Qo && ((Qo = !1), Qh(e));
          break;
        case 4:
          ((l = Ht),
            (Ht = wu(e.stateNode.containerInfo)),
            dt(t, e),
            mt(e),
            (Ht = l));
          break;
        case 12:
          (dt(t, e), mt(e));
          break;
        case 31:
          (dt(t, e),
            mt(e),
            l & 4 &&
              ((l = e.updateQueue),
              l !== null && ((e.updateQueue = null), hu(e, l))));
          break;
        case 13:
          (dt(t, e),
            mt(e),
            e.child.flags & 8192 &&
              (e.memoizedState !== null) !=
                (a !== null && a.memoizedState !== null) &&
              (mu = St()),
            l & 4 &&
              ((l = e.updateQueue),
              l !== null && ((e.updateQueue = null), hu(e, l))));
          break;
        case 22:
          r = e.memoizedState !== null;
          var y = a !== null && a.memoizedState !== null,
            A = hn,
            C = Xe;
          if (
            ((hn = A || r),
            (Xe = C || y),
            dt(t, e),
            (Xe = C),
            (hn = A),
            mt(e),
            l & 8192)
          )
            e: for (
              t = e.stateNode,
                t._visibility = r ? t._visibility & -2 : t._visibility | 1,
                r && (a === null || y || hn || Xe || ma(e)),
                a = null,
                t = e;
              ;
            ) {
              if (t.tag === 5 || t.tag === 26) {
                if (a === null) {
                  y = a = t;
                  try {
                    if (((o = y.stateNode), r))
                      ((f = o.style),
                        typeof f.setProperty == "function"
                          ? f.setProperty("display", "none", "important")
                          : (f.display = "none"));
                    else {
                      m = y.stateNode;
                      var D = y.memoizedProps.style,
                        E =
                          D != null && D.hasOwnProperty("display")
                            ? D.display
                            : null;
                      m.style.display =
                        E == null || typeof E == "boolean"
                          ? ""
                          : ("" + E).trim();
                    }
                  } catch ($) {
                    Se(y, y.return, $);
                  }
                }
              } else if (t.tag === 6) {
                if (a === null) {
                  y = t;
                  try {
                    y.stateNode.nodeValue = r ? "" : y.memoizedProps;
                  } catch ($) {
                    Se(y, y.return, $);
                  }
                }
              } else if (t.tag === 18) {
                if (a === null) {
                  y = t;
                  try {
                    var O = y.stateNode;
                    r ? Md(O, !0) : Md(y.stateNode, !1);
                  } catch ($) {
                    Se(y, y.return, $);
                  }
                }
              } else if (
                ((t.tag !== 22 && t.tag !== 23) ||
                  t.memoizedState === null ||
                  t === e) &&
                t.child !== null
              ) {
                ((t.child.return = t), (t = t.child));
                continue;
              }
              if (t === e) break e;
              for (; t.sibling === null; ) {
                if (t.return === null || t.return === e) break e;
                (a === t && (a = null), (t = t.return));
              }
              (a === t && (a = null),
                (t.sibling.return = t.return),
                (t = t.sibling));
            }
          l & 4 &&
            ((l = e.updateQueue),
            l !== null &&
              ((a = l.retryQueue),
              a !== null && ((l.retryQueue = null), hu(e, a))));
          break;
        case 19:
          (dt(t, e),
            mt(e),
            l & 4 &&
              ((l = e.updateQueue),
              l !== null && ((e.updateQueue = null), hu(e, l))));
          break;
        case 30:
          break;
        case 21:
          break;
        default:
          (dt(t, e), mt(e));
      }
    }
    function mt(e) {
      var t = e.flags;
      if (t & 2) {
        try {
          for (var a, l = e.return; l !== null; ) {
            if (Nh(l)) {
              a = l;
              break;
            }
            l = l.return;
          }
          if (a == null) throw Error(s(160));
          switch (a.tag) {
            case 27:
              var r = a.stateNode;
              fu(e, xo(e), r);
              break;
            case 5:
              var o = a.stateNode;
              (a.flags & 32 && (Ca(o, ""), (a.flags &= -33)), fu(e, xo(e), o));
              break;
            case 3:
            case 4:
              var f = a.stateNode.containerInfo;
              Bo(e, xo(e), f);
              break;
            default:
              throw Error(s(161));
          }
        } catch (m) {
          Se(e, e.return, m);
        }
        e.flags &= -3;
      }
      t & 4096 && (e.flags &= -4097);
    }
    function Qh(e) {
      if (e.subtreeFlags & 1024)
        for (e = e.child; e !== null; ) {
          var t = e;
          (Qh(t),
            t.tag === 5 && t.flags & 1024 && t.stateNode.reset(),
            (e = e.sibling));
        }
    }
    function mn(e, t) {
      if (t.subtreeFlags & 8772)
        for (t = t.child; t !== null; )
          (qh(e, t.alternate, t), (t = t.sibling));
    }
    function ma(e) {
      for (e = e.child; e !== null; ) {
        var t = e;
        switch (t.tag) {
          case 0:
          case 11:
          case 14:
          case 15:
            (kn(4, t, t.return), ma(t));
            break;
          case 1:
            Jt(t, t.return);
            var a = t.stateNode;
            (typeof a.componentWillUnmount == "function" && Ch(t, t.return, a),
              ma(t));
            break;
          case 27:
            nl(t.stateNode);
          case 26:
          case 5:
            (Jt(t, t.return), ma(t));
            break;
          case 22:
            t.memoizedState === null && ma(t);
            break;
          case 30:
            ma(t);
            break;
          default:
            ma(t);
        }
        e = e.sibling;
      }
    }
    function vn(e, t, a) {
      for (a = a && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null; ) {
        var l = t.alternate,
          r = e,
          o = t,
          f = o.flags;
        switch (o.tag) {
          case 0:
          case 11:
          case 15:
            (vn(r, o, a), Yi(4, o));
            break;
          case 1:
            if (
              (vn(r, o, a),
              (l = o),
              (r = l.stateNode),
              typeof r.componentDidMount == "function")
            )
              try {
                r.componentDidMount();
              } catch (A) {
                Se(l, l.return, A);
              }
            if (((l = o), (r = l.updateQueue), r !== null)) {
              var m = l.stateNode;
              try {
                var y = r.shared.hiddenCallbacks;
                if (y !== null)
                  for (
                    r.shared.hiddenCallbacks = null, r = 0;
                    r < y.length;
                    r++
                  )
                    Sf(y[r], m);
              } catch (A) {
                Se(l, l.return, A);
              }
            }
            (a && f & 64 && Rh(o), Xi(o, o.return));
            break;
          case 27:
            Dh(o);
          case 26:
          case 5:
            (vn(r, o, a), a && l === null && f & 4 && Mh(o), Xi(o, o.return));
            break;
          case 12:
            vn(r, o, a);
            break;
          case 31:
            (vn(r, o, a), a && f & 4 && Zh(r, o));
            break;
          case 13:
            (vn(r, o, a), a && f & 4 && xh(r, o));
            break;
          case 22:
            (o.memoizedState === null && vn(r, o, a), Xi(o, o.return));
            break;
          case 30:
            break;
          default:
            vn(r, o, a);
        }
        t = t.sibling;
      }
    }
    function $o(e, t) {
      var a = null;
      (e !== null &&
        e.memoizedState !== null &&
        e.memoizedState.cachePool !== null &&
        (a = e.memoizedState.cachePool.pool),
        (e = null),
        t.memoizedState !== null &&
          t.memoizedState.cachePool !== null &&
          (e = t.memoizedState.cachePool.pool),
        e !== a && (e != null && e.refCount++, a != null && ki(a)));
    }
    function Lo(e, t) {
      ((e = null),
        t.alternate !== null && (e = t.alternate.memoizedState.cache),
        (t = t.memoizedState.cache),
        t !== e && (t.refCount++, e != null && ki(e)));
    }
    function Vt(e, t, a, l) {
      if (t.subtreeFlags & 10256)
        for (t = t.child; t !== null; ) ($h(e, t, a, l), (t = t.sibling));
    }
    function $h(e, t, a, l) {
      var r = t.flags;
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          (Vt(e, t, a, l), r & 2048 && Yi(9, t));
          break;
        case 1:
          Vt(e, t, a, l);
          break;
        case 3:
          (Vt(e, t, a, l),
            r & 2048 &&
              ((e = null),
              t.alternate !== null && (e = t.alternate.memoizedState.cache),
              (t = t.memoizedState.cache),
              t !== e && (t.refCount++, e != null && ki(e))));
          break;
        case 12:
          if (r & 2048) {
            (Vt(e, t, a, l), (e = t.stateNode));
            try {
              var o = t.memoizedProps,
                f = o.id,
                m = o.onPostCommit;
              typeof m == "function" &&
                m(
                  f,
                  t.alternate === null ? "mount" : "update",
                  e.passiveEffectDuration,
                  -0,
                );
            } catch (y) {
              Se(t, t.return, y);
            }
          } else Vt(e, t, a, l);
          break;
        case 31:
          Vt(e, t, a, l);
          break;
        case 13:
          Vt(e, t, a, l);
          break;
        case 23:
          break;
        case 22:
          ((o = t.stateNode),
            (f = t.alternate),
            t.memoizedState !== null
              ? o._visibility & 2
                ? Vt(e, t, a, l)
                : Ji(e, t)
              : o._visibility & 2
                ? Vt(e, t, a, l)
                : ((o._visibility |= 2),
                  Ka(e, t, a, l, (t.subtreeFlags & 10256) !== 0 || !1)),
            r & 2048 && $o(f, t));
          break;
        case 24:
          (Vt(e, t, a, l), r & 2048 && Lo(t.alternate, t));
          break;
        default:
          Vt(e, t, a, l);
      }
    }
    function Ka(e, t, a, l, r) {
      for (
        r = r && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child;
        t !== null;
      ) {
        var o = e,
          f = t,
          m = a,
          y = l,
          A = f.flags;
        switch (f.tag) {
          case 0:
          case 11:
          case 15:
            (Ka(o, f, m, y, r), Yi(8, f));
            break;
          case 23:
            break;
          case 22:
            var C = f.stateNode;
            (f.memoizedState !== null
              ? C._visibility & 2
                ? Ka(o, f, m, y, r)
                : Ji(o, f)
              : ((C._visibility |= 2), Ka(o, f, m, y, r)),
              r && A & 2048 && $o(f.alternate, f));
            break;
          case 24:
            (Ka(o, f, m, y, r), r && A & 2048 && Lo(f.alternate, f));
            break;
          default:
            Ka(o, f, m, y, r);
        }
        t = t.sibling;
      }
    }
    function Ji(e, t) {
      if (t.subtreeFlags & 10256)
        for (t = t.child; t !== null; ) {
          var a = e,
            l = t,
            r = l.flags;
          switch (l.tag) {
            case 22:
              (Ji(a, l), r & 2048 && $o(l.alternate, l));
              break;
            case 24:
              (Ji(a, l), r & 2048 && Lo(l.alternate, l));
              break;
            default:
              Ji(a, l);
          }
          t = t.sibling;
        }
    }
    var Ki = 8192;
    function Ia(e, t, a) {
      if (e.subtreeFlags & Ki)
        for (e = e.child; e !== null; ) (Lh(e, t, a), (e = e.sibling));
    }
    function Lh(e, t, a) {
      switch (e.tag) {
        case 26:
          (Ia(e, t, a),
            e.flags & Ki &&
              e.memoizedState !== null &&
              jy(a, Ht, e.memoizedState, e.memoizedProps));
          break;
        case 5:
          Ia(e, t, a);
          break;
        case 3:
        case 4:
          var l = Ht;
          ((Ht = wu(e.stateNode.containerInfo)), Ia(e, t, a), (Ht = l));
          break;
        case 22:
          e.memoizedState === null &&
            ((l = e.alternate),
            l !== null && l.memoizedState !== null
              ? ((l = Ki), (Ki = 16777216), Ia(e, t, a), (Ki = l))
              : Ia(e, t, a));
          break;
        default:
          Ia(e, t, a);
      }
    }
    function Hh(e) {
      var t = e.alternate;
      if (t !== null && ((e = t.child), e !== null)) {
        t.child = null;
        do ((t = e.sibling), (e.sibling = null), (e = t));
        while (e !== null);
      }
    }
    function Ii(e) {
      var t = e.deletions;
      if ((e.flags & 16) !== 0) {
        if (t !== null)
          for (var a = 0; a < t.length; a++) {
            var l = t[a];
            ((et = l), Gh(l, e));
          }
        Hh(e);
      }
      if (e.subtreeFlags & 10256)
        for (e = e.child; e !== null; ) (Vh(e), (e = e.sibling));
    }
    function Vh(e) {
      switch (e.tag) {
        case 0:
        case 11:
        case 15:
          (Ii(e), e.flags & 2048 && kn(9, e, e.return));
          break;
        case 3:
          Ii(e);
          break;
        case 12:
          Ii(e);
          break;
        case 22:
          var t = e.stateNode;
          e.memoizedState !== null &&
          t._visibility & 2 &&
          (e.return === null || e.return.tag !== 13)
            ? ((t._visibility &= -3), du(e))
            : Ii(e);
          break;
        default:
          Ii(e);
      }
    }
    function du(e) {
      var t = e.deletions;
      if ((e.flags & 16) !== 0) {
        if (t !== null)
          for (var a = 0; a < t.length; a++) {
            var l = t[a];
            ((et = l), Gh(l, e));
          }
        Hh(e);
      }
      for (e = e.child; e !== null; ) {
        switch (((t = e), t.tag)) {
          case 0:
          case 11:
          case 15:
            (kn(8, t, t.return), du(t));
            break;
          case 22:
            ((a = t.stateNode),
              a._visibility & 2 && ((a._visibility &= -3), du(t)));
            break;
          default:
            du(t);
        }
        e = e.sibling;
      }
    }
    function Gh(e, t) {
      for (; et !== null; ) {
        var a = et;
        switch (a.tag) {
          case 0:
          case 11:
          case 15:
            kn(8, a, t);
            break;
          case 23:
          case 22:
            if (
              a.memoizedState !== null &&
              a.memoizedState.cachePool !== null
            ) {
              var l = a.memoizedState.cachePool.pool;
              l != null && l.refCount++;
            }
            break;
          case 24:
            ki(a.memoizedState.cache);
        }
        if (((l = a.child), l !== null)) ((l.return = a), (et = l));
        else
          e: for (a = e; et !== null; ) {
            l = et;
            var r = l.sibling,
              o = l.return;
            if ((Uh(l), l === a)) {
              et = null;
              break e;
            }
            if (r !== null) {
              ((r.return = o), (et = r));
              break e;
            }
            et = o;
          }
      }
    }
    var Pg = {
        getCacheForType: function (e) {
          var t = at(Ve),
            a = t.data.get(e);
          return (a === void 0 && ((a = e()), t.data.set(e, a)), a);
        },
        cacheSignal: function () {
          return at(Ve).controller.signal;
        },
      },
      ey = typeof WeakMap == "function" ? WeakMap : Map,
      ve = 0,
      we = null,
      ue = null,
      oe = 0,
      be = 0,
      Ot = null,
      qn = !1,
      Fa = !1,
      Ho = !1,
      gn = 0,
      je = 0,
      Un = 0,
      va = 0,
      Vo = 0,
      Rt = 0,
      Wa = 0,
      Fi = null,
      vt = null,
      Go = !1,
      mu = 0,
      Yh = 0,
      vu = 1 / 0,
      gu = null,
      jn = null,
      Ie = 0,
      Zn = null,
      Pa = null,
      yn = 0,
      Yo = 0,
      Xo = null,
      Xh = null,
      Wi = 0,
      Jo = null;
    function Zt() {
      return (ve & 2) !== 0 && oe !== 0 ? oe & -oe : U.T !== null ? es() : fc();
    }
    function Jh() {
      if (Rt === 0)
        if ((oe & 536870912) === 0 || ce) {
          var e = zl;
          ((zl <<= 1), (zl & 3932160) === 0 && (zl = 262144), (Rt = e));
        } else Rt = 536870912;
      return ((e = Et.current), e !== null && (e.flags |= 32), Rt);
    }
    function gt(e, t, a) {
      (((e === we && (be === 2 || be === 9)) ||
        e.cancelPendingCommit !== null) &&
        (ei(e, 0), xn(e, oe, Rt, !1)),
        wl(e, a),
        ((ve & 2) === 0 || e !== we) &&
          (e === we &&
            ((ve & 2) === 0 && (va |= a), je === 4 && xn(e, oe, Rt, !1)),
          pn(e)));
    }
    function Kh(e, t, a) {
      if ((ve & 6) !== 0) throw Error(s(327));
      var l = (!a && (t & 127) === 0 && (t & e.expiredLanes) === 0) || pi(e, t),
        r = l ? ay(e, t) : Io(e, t, !0),
        o = l;
      do {
        if (r === 0) {
          Fa && !l && xn(e, t, 0, !1);
          break;
        } else {
          if (((a = e.current.alternate), o && !ty(a))) {
            ((r = Io(e, t, !1)), (o = !1));
            continue;
          }
          if (r === 2) {
            if (((o = t), e.errorRecoveryDisabledLanes & o)) var f = 0;
            else
              ((f = e.pendingLanes & -536870913),
                (f = f !== 0 ? f : f & 536870912 ? 536870912 : 0));
            if (f !== 0) {
              t = f;
              e: {
                var m = e;
                r = Fi;
                var y = m.current.memoizedState.isDehydrated;
                if (
                  (y && (ei(m, f).flags |= 256), (f = Io(m, f, !1)), f !== 2)
                ) {
                  if (Ho && !y) {
                    ((m.errorRecoveryDisabledLanes |= o), (va |= o), (r = 4));
                    break e;
                  }
                  ((o = vt),
                    (vt = r),
                    o !== null &&
                      (vt === null ? (vt = o) : vt.push.apply(vt, o)));
                }
                r = f;
              }
              if (((o = !1), r !== 2)) continue;
            }
          }
          if (r === 1) {
            (ei(e, 0), xn(e, t, 0, !0));
            break;
          }
          e: {
            switch (((l = e), (o = r), o)) {
              case 0:
              case 1:
                throw Error(s(345));
              case 4:
                if ((t & 4194048) !== t) break;
              case 6:
                xn(l, t, Rt, !qn);
                break e;
              case 2:
                vt = null;
                break;
              case 3:
              case 5:
                break;
              default:
                throw Error(s(329));
            }
            if ((t & 62914560) === t && ((r = mu + 300 - St()), 10 < r)) {
              if ((xn(l, t, Rt, !qn), El(l, 0, !0) !== 0)) break e;
              ((yn = t),
                (l.timeoutHandle = Od(
                  Ih.bind(
                    null,
                    l,
                    a,
                    vt,
                    gu,
                    Go,
                    t,
                    Rt,
                    va,
                    Wa,
                    qn,
                    o,
                    "Throttled",
                    -0,
                    0,
                  ),
                  r,
                )));
              break e;
            }
            Ih(l, a, vt, gu, Go, t, Rt, va, Wa, qn, o, null, -0, 0);
          }
        }
        break;
      } while (!0);
      pn(e);
    }
    function Ih(e, t, a, l, r, o, f, m, y, A, C, D, E, O) {
      if (
        ((e.timeoutHandle = -1),
        (D = t.subtreeFlags),
        D & 8192 || (D & 16785408) === 16785408)
      ) {
        ((D = {
          stylesheets: null,
          count: 0,
          imgCount: 0,
          imgBytes: 0,
          suspenseyImages: [],
          waitingForImages: !0,
          waitingForViewTransition: !1,
          unsuspend: tn,
        }),
          Lh(t, o, D));
        var $ =
          (o & 62914560) === o
            ? mu - St()
            : (o & 4194048) === o
              ? Yh - St()
              : 0;
        if ((($ = Zy(D, $)), $ !== null)) {
          ((yn = o),
            (e.cancelPendingCommit = $(
              id.bind(null, e, t, o, a, l, r, f, m, y, C, D, null, E, O),
            )),
            xn(e, o, f, !A));
          return;
        }
      }
      id(e, t, o, a, l, r, f, m, y);
    }
    function ty(e) {
      for (var t = e; ; ) {
        var a = t.tag;
        if (
          (a === 0 || a === 11 || a === 15) &&
          t.flags & 16384 &&
          ((a = t.updateQueue), a !== null && ((a = a.stores), a !== null))
        )
          for (var l = 0; l < a.length; l++) {
            var r = a[l],
              o = r.getSnapshot;
            r = r.value;
            try {
              if (!zt(o(), r)) return !1;
            } catch {
              return !1;
            }
          }
        if (((a = t.child), t.subtreeFlags & 16384 && a !== null))
          ((a.return = t), (t = a));
        else {
          if (t === e) break;
          for (; t.sibling === null; ) {
            if (t.return === null || t.return === e) return !0;
            t = t.return;
          }
          ((t.sibling.return = t.return), (t = t.sibling));
        }
      }
      return !0;
    }
    function xn(e, t, a, l) {
      ((t &= ~Vo),
        (t &= ~va),
        (e.suspendedLanes |= t),
        (e.pingedLanes &= ~t),
        l && (e.warmLanes |= t),
        (l = e.expirationTimes));
      for (var r = t; 0 < r; ) {
        var o = 31 - Tt(r),
          f = 1 << o;
        ((l[o] = -1), (r &= ~f));
      }
      a !== 0 && rc(e, a, t);
    }
    function yu() {
      return (ve & 6) === 0 ? (Pi(0, !1), !1) : !0;
    }
    function Ko() {
      if (ue !== null) {
        if (be === 0) var e = ue.return;
        else
          ((e = ue), (un = ia = null), co(e), (Va = null), (Ui = 0), (e = ue));
        for (; e !== null; ) (Oh(e.alternate, e), (e = e.return));
        ue = null;
      }
    }
    function ei(e, t) {
      var a = e.timeoutHandle;
      (a !== -1 && ((e.timeoutHandle = -1), by(a)),
        (a = e.cancelPendingCommit),
        a !== null && ((e.cancelPendingCommit = null), a()),
        (yn = 0),
        Ko(),
        (we = e),
        (ue = a = an(e.current, null)),
        (oe = t),
        (be = 0),
        (Ot = null),
        (qn = !1),
        (Fa = pi(e, t)),
        (Ho = !1),
        (Wa = Rt = Vo = va = Un = je = 0),
        (vt = Fi = null),
        (Go = !1),
        (t & 8) !== 0 && (t |= t & 32));
      var l = e.entangledLanes;
      if (l !== 0)
        for (e = e.entanglements, l &= t; 0 < l; ) {
          var r = 31 - Tt(l),
            o = 1 << r;
          ((t |= e[r]), (l &= ~o));
        }
      return ((gn = t), xl(), a);
    }
    function Fh(e, t) {
      ((ee = null),
        (U.H = Hi),
        t === Ha || t === Yl
          ? ((t = gf()), (be = 3))
          : t === Wr
            ? ((t = gf()), (be = 4))
            : (be =
                t === Oo
                  ? 8
                  : t !== null &&
                      typeof t == "object" &&
                      typeof t.then == "function"
                    ? 6
                    : 1),
        (Ot = t),
        ue === null && ((je = 1), uu(e, Dt(t, e.current))));
    }
    function Wh() {
      var e = Et.current;
      return e === null
        ? !0
        : (oe & 4194048) === oe
          ? jt === null
          : (oe & 62914560) === oe || (oe & 536870912) !== 0
            ? e === jt
            : !1;
    }
    function Ph() {
      var e = U.H;
      return ((U.H = Hi), e === null ? Hi : e);
    }
    function ed() {
      var e = U.A;
      return ((U.A = Pg), e);
    }
    function pu() {
      ((je = 4),
        qn || ((oe & 4194048) !== oe && Et.current !== null) || (Fa = !0),
        ((Un & 134217727) === 0 && (va & 134217727) === 0) ||
          we === null ||
          xn(we, oe, Rt, !1));
    }
    function Io(e, t, a) {
      var l = ve;
      ve |= 2;
      var r = Ph(),
        o = ed();
      ((we !== e || oe !== t) && ((gu = null), ei(e, t)), (t = !1));
      var f = je;
      e: do
        try {
          if (be !== 0 && ue !== null) {
            var m = ue,
              y = Ot;
            switch (be) {
              case 8:
                (Ko(), (f = 6));
                break e;
              case 3:
              case 2:
              case 9:
              case 6:
                Et.current === null && (t = !0);
                var A = be;
                if (((be = 0), (Ot = null), ti(e, m, y, A), a && Fa)) {
                  f = 0;
                  break e;
                }
                break;
              default:
                ((A = be), (be = 0), (Ot = null), ti(e, m, y, A));
            }
          }
          (ny(), (f = je));
          break;
        } catch (C) {
          Fh(e, C);
        }
      while (!0);
      return (
        t && e.shellSuspendCounter++,
        (un = ia = null),
        (ve = l),
        (U.H = r),
        (U.A = o),
        ue === null && ((we = null), (oe = 0), xl()),
        f
      );
    }
    function ny() {
      for (; ue !== null; ) td(ue);
    }
    function ay(e, t) {
      var a = ve;
      ve |= 2;
      var l = Ph(),
        r = ed();
      we !== e || oe !== t
        ? ((gu = null), (vu = St() + 500), ei(e, t))
        : (Fa = pi(e, t));
      e: do
        try {
          if (be !== 0 && ue !== null) {
            t = ue;
            var o = Ot;
            t: switch (be) {
              case 1:
                ((be = 0), (Ot = null), ti(e, t, o, 1));
                break;
              case 2:
              case 9:
                if (mf(o)) {
                  ((be = 0), (Ot = null), nd(t));
                  break;
                }
                ((t = function () {
                  ((be !== 2 && be !== 9) || we !== e || (be = 7), pn(e));
                }),
                  o.then(t, t));
                break e;
              case 3:
                be = 7;
                break e;
              case 4:
                be = 5;
                break e;
              case 7:
                mf(o)
                  ? ((be = 0), (Ot = null), nd(t))
                  : ((be = 0), (Ot = null), ti(e, t, o, 7));
                break;
              case 5:
                var f = null;
                switch (ue.tag) {
                  case 26:
                    f = ue.memoizedState;
                  case 5:
                  case 27:
                    var m = ue;
                    if (f ? Ld(f) : m.stateNode.complete) {
                      ((be = 0), (Ot = null));
                      var y = m.sibling;
                      if (y !== null) ue = y;
                      else {
                        var A = m.return;
                        A !== null ? ((ue = A), bu(A)) : (ue = null);
                      }
                      break t;
                    }
                }
                ((be = 0), (Ot = null), ti(e, t, o, 5));
                break;
              case 6:
                ((be = 0), (Ot = null), ti(e, t, o, 6));
                break;
              case 8:
                (Ko(), (je = 6));
                break e;
              default:
                throw Error(s(462));
            }
          }
          iy();
          break;
        } catch (C) {
          Fh(e, C);
        }
      while (!0);
      return (
        (un = ia = null),
        (U.H = l),
        (U.A = r),
        (ve = a),
        ue !== null ? 0 : ((we = null), (oe = 0), xl(), je)
      );
    }
    function iy() {
      for (; ue !== null && !Uv(); ) td(ue);
    }
    function td(e) {
      var t = Eh(e.alternate, e, gn);
      ((e.memoizedProps = e.pendingProps), t === null ? bu(e) : (ue = t));
    }
    function nd(e) {
      var t = e,
        a = t.alternate;
      switch (t.tag) {
        case 15:
        case 0:
          t = bh(a, t, t.pendingProps, t.type, void 0, oe);
          break;
        case 11:
          t = bh(a, t, t.pendingProps, t.type.render, t.ref, oe);
          break;
        case 5:
          co(t);
        default:
          (Oh(a, t), (t = ue = nf(t, gn)), (t = Eh(a, t, gn)));
      }
      ((e.memoizedProps = e.pendingProps), t === null ? bu(e) : (ue = t));
    }
    function ti(e, t, a, l) {
      ((un = ia = null), co(t), (Va = null), (Ui = 0));
      var r = t.return;
      try {
        if (Yg(e, r, t, a, oe)) {
          ((je = 1), uu(e, Dt(a, e.current)), (ue = null));
          return;
        }
      } catch (o) {
        if (r !== null) throw ((ue = r), o);
        ((je = 1), uu(e, Dt(a, e.current)), (ue = null));
        return;
      }
      t.flags & 32768
        ? (ce || l === 1
            ? (e = !0)
            : Fa || (oe & 536870912) !== 0
              ? (e = !1)
              : ((qn = e = !0),
                (l === 2 || l === 9 || l === 3 || l === 6) &&
                  ((l = Et.current),
                  l !== null && l.tag === 13 && (l.flags |= 16384))),
          ad(t, e))
        : bu(t);
    }
    function bu(e) {
      var t = e;
      do {
        if ((t.flags & 32768) !== 0) {
          ad(t, qn);
          return;
        }
        e = t.return;
        var a = Kg(t.alternate, t, gn);
        if (a !== null) {
          ue = a;
          return;
        }
        if (((t = t.sibling), t !== null)) {
          ue = t;
          return;
        }
        ue = t = e;
      } while (t !== null);
      je === 0 && (je = 5);
    }
    function ad(e, t) {
      do {
        var a = Ig(e.alternate, e);
        if (a !== null) {
          ((a.flags &= 32767), (ue = a));
          return;
        }
        if (
          ((a = e.return),
          a !== null &&
            ((a.flags |= 32768), (a.subtreeFlags = 0), (a.deletions = null)),
          !t && ((e = e.sibling), e !== null))
        ) {
          ue = e;
          return;
        }
        ue = e = a;
      } while (e !== null);
      ((je = 6), (ue = null));
    }
    function id(e, t, a, l, r, o, f, m, y) {
      e.cancelPendingCommit = null;
      do Su();
      while (Ie !== 0);
      if ((ve & 6) !== 0) throw Error(s(327));
      if (t !== null) {
        if (t === e.current) throw Error(s(177));
        if (
          ((o = t.lanes | t.childLanes),
          (o |= Zr),
          Gv(e, a, o, f, m, y),
          e === we && ((ue = we = null), (oe = 0)),
          (Pa = t),
          (Zn = e),
          (yn = a),
          (Yo = o),
          (Xo = r),
          (Xh = l),
          (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0
            ? ((e.callbackNode = null),
              (e.callbackPriority = 0),
              oy(_l, function () {
                return (sd(), null);
              }))
            : ((e.callbackNode = null), (e.callbackPriority = 0)),
          (l = (t.flags & 13878) !== 0),
          (t.subtreeFlags & 13878) !== 0 || l)
        ) {
          ((l = U.T), (U.T = null), (r = B.p), (B.p = 2), (f = ve), (ve |= 4));
          try {
            Fg(e, t, a);
          } finally {
            ((ve = f), (B.p = r), (U.T = l));
          }
        }
        ((Ie = 1), ld(), ud(), rd());
      }
    }
    function ld() {
      if (Ie === 1) {
        Ie = 0;
        var e = Zn,
          t = Pa,
          a = (t.flags & 13878) !== 0;
        if ((t.subtreeFlags & 13878) !== 0 || a) {
          ((a = U.T), (U.T = null));
          var l = B.p;
          B.p = 2;
          var r = ve;
          ve |= 4;
          try {
            Bh(t, e);
            var o = rs,
              f = Xc(e.containerInfo),
              m = o.focusedElem,
              y = o.selectionRange;
            if (
              f !== m &&
              m &&
              m.ownerDocument &&
              Yc(m.ownerDocument.documentElement, m)
            ) {
              if (y !== null && Dr(m)) {
                var A = y.start,
                  C = y.end;
                if ((C === void 0 && (C = A), "selectionStart" in m))
                  ((m.selectionStart = A),
                    (m.selectionEnd = Math.min(C, m.value.length)));
                else {
                  var D = m.ownerDocument || document,
                    E = (D && D.defaultView) || window;
                  if (E.getSelection) {
                    var O = E.getSelection(),
                      $ = m.textContent.length,
                      J = Math.min(y.start, $),
                      Ee = y.end === void 0 ? J : Math.min(y.end, $);
                    !O.extend && J > Ee && ((f = Ee), (Ee = J), (J = f));
                    var S = Gc(m, J),
                      p = Gc(m, Ee);
                    if (
                      S &&
                      p &&
                      (O.rangeCount !== 1 ||
                        O.anchorNode !== S.node ||
                        O.anchorOffset !== S.offset ||
                        O.focusNode !== p.node ||
                        O.focusOffset !== p.offset)
                    ) {
                      var T = D.createRange();
                      (T.setStart(S.node, S.offset),
                        O.removeAllRanges(),
                        J > Ee
                          ? (O.addRange(T), O.extend(p.node, p.offset))
                          : (T.setEnd(p.node, p.offset), O.addRange(T)));
                    }
                  }
                }
              }
              for (D = [], O = m; (O = O.parentNode); )
                O.nodeType === 1 &&
                  D.push({ element: O, left: O.scrollLeft, top: O.scrollTop });
              for (
                typeof m.focus == "function" && m.focus(), m = 0;
                m < D.length;
                m++
              ) {
                var M = D[m];
                ((M.element.scrollLeft = M.left),
                  (M.element.scrollTop = M.top));
              }
            }
            ((Du = !!us), (rs = us = null));
          } finally {
            ((ve = r), (B.p = l), (U.T = a));
          }
        }
        ((e.current = t), (Ie = 2));
      }
    }
    function ud() {
      if (Ie === 2) {
        Ie = 0;
        var e = Zn,
          t = Pa,
          a = (t.flags & 8772) !== 0;
        if ((t.subtreeFlags & 8772) !== 0 || a) {
          ((a = U.T), (U.T = null));
          var l = B.p;
          B.p = 2;
          var r = ve;
          ve |= 4;
          try {
            qh(e, t.alternate, t);
          } finally {
            ((ve = r), (B.p = l), (U.T = a));
          }
        }
        Ie = 3;
      }
    }
    function rd() {
      if (Ie === 4 || Ie === 3) {
        ((Ie = 0), jv());
        var e = Zn,
          t = Pa,
          a = yn,
          l = Xh;
        (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0
          ? (Ie = 5)
          : ((Ie = 0), (Pa = Zn = null), od(e, e.pendingLanes));
        var r = e.pendingLanes;
        if (
          (r === 0 && (jn = null),
          dr(a),
          (t = t.stateNode),
          _t && typeof _t.onCommitFiberRoot == "function")
        )
          try {
            _t.onCommitFiberRoot(
              yi,
              t,
              void 0,
              (t.current.flags & 128) === 128,
            );
          } catch {}
        if (l !== null) {
          ((t = U.T), (r = B.p), (B.p = 2), (U.T = null));
          try {
            for (var o = e.onRecoverableError, f = 0; f < l.length; f++) {
              var m = l[f];
              o(m.value, { componentStack: m.stack });
            }
          } finally {
            ((U.T = t), (B.p = r));
          }
        }
        ((yn & 3) !== 0 && Su(),
          pn(e),
          (r = e.pendingLanes),
          (a & 261930) !== 0 && (r & 42) !== 0
            ? e === Jo
              ? Wi++
              : ((Wi = 0), (Jo = e))
            : (Wi = 0),
          Pi(0, !1));
      }
    }
    function od(e, t) {
      (e.pooledCacheLanes &= t) === 0 &&
        ((t = e.pooledCache), t != null && ((e.pooledCache = null), ki(t)));
    }
    function Su() {
      return (ld(), ud(), rd(), sd());
    }
    function sd() {
      if (Ie !== 5) return !1;
      var e = Zn,
        t = Yo;
      Yo = 0;
      var a = dr(yn),
        l = U.T,
        r = B.p;
      try {
        ((B.p = 32 > a ? 32 : a), (U.T = null), (a = Xo), (Xo = null));
        var o = Zn,
          f = yn;
        if (((Ie = 0), (Pa = Zn = null), (yn = 0), (ve & 6) !== 0))
          throw Error(s(331));
        var m = ve;
        if (
          ((ve |= 4),
          Vh(o.current),
          $h(o, o.current, f, a),
          (ve = m),
          Pi(0, !1),
          _t && typeof _t.onPostCommitFiberRoot == "function")
        )
          try {
            _t.onPostCommitFiberRoot(yi, o);
          } catch {}
        return !0;
      } finally {
        ((B.p = r), (U.T = l), od(e, t));
      }
    }
    function cd(e, t, a) {
      ((t = Dt(a, t)),
        (t = wo(e.stateNode, t, 2)),
        (e = fa(e, t, 2)),
        e !== null && (wl(e, 2), pn(e)));
    }
    function Se(e, t, a) {
      if (e.tag === 3) cd(e, e, a);
      else
        for (; t !== null; ) {
          if (t.tag === 3) {
            cd(t, e, a);
            break;
          } else if (t.tag === 1) {
            var l = t.stateNode;
            if (
              typeof t.type.getDerivedStateFromError == "function" ||
              (typeof l.componentDidCatch == "function" &&
                (jn === null || !jn.has(l)))
            ) {
              ((e = Dt(a, e)),
                (a = fh(2)),
                (l = fa(t, a, 2)),
                l !== null && (hh(a, l, t, e), wl(l, 2), pn(l)));
              break;
            }
          }
          t = t.return;
        }
    }
    function Fo(e, t, a) {
      var l = e.pingCache;
      if (l === null) {
        l = e.pingCache = new ey();
        var r = new Set();
        l.set(t, r);
      } else ((r = l.get(t)), r === void 0 && ((r = new Set()), l.set(t, r)));
      r.has(a) ||
        ((Ho = !0), r.add(a), (e = ly.bind(null, e, t, a)), t.then(e, e));
    }
    function ly(e, t, a) {
      var l = e.pingCache;
      (l !== null && l.delete(t),
        (e.pingedLanes |= e.suspendedLanes & a),
        (e.warmLanes &= ~a),
        we === e &&
          (oe & a) === a &&
          (je === 4 || (je === 3 && (oe & 62914560) === oe && 300 > St() - mu)
            ? (ve & 2) === 0 && ei(e, 0)
            : (Vo |= a),
          Wa === oe && (Wa = 0)),
        pn(e));
    }
    function fd(e, t) {
      (t === 0 && (t = uc()), (e = ta(e, t)), e !== null && (wl(e, t), pn(e)));
    }
    function uy(e) {
      var t = e.memoizedState,
        a = 0;
      (t !== null && (a = t.retryLane), fd(e, a));
    }
    function ry(e, t) {
      var a = 0;
      switch (e.tag) {
        case 31:
        case 13:
          var l = e.stateNode,
            r = e.memoizedState;
          r !== null && (a = r.retryLane);
          break;
        case 19:
          l = e.stateNode;
          break;
        case 22:
          l = e.stateNode._retryCache;
          break;
        default:
          throw Error(s(314));
      }
      (l !== null && l.delete(t), fd(e, a));
    }
    function oy(e, t) {
      return cr(e, t);
    }
    var _u = null,
      ni = null,
      Wo = !1,
      Tu = !1,
      Po = !1,
      Bn = 0;
    function pn(e) {
      (e !== ni &&
        e.next === null &&
        (ni === null ? (_u = ni = e) : (ni = ni.next = e)),
        (Tu = !0),
        Wo || ((Wo = !0), cy()));
    }
    function Pi(e, t) {
      if (!Po && Tu) {
        Po = !0;
        do
          for (var a = !1, l = _u; l !== null; ) {
            if (!t)
              if (e !== 0) {
                var r = l.pendingLanes;
                if (r === 0) var o = 0;
                else {
                  var f = l.suspendedLanes,
                    m = l.pingedLanes;
                  ((o = (1 << (31 - Tt(42 | e) + 1)) - 1),
                    (o &= r & ~(f & ~m)),
                    (o = o & 201326741 ? (o & 201326741) | 1 : o ? o | 2 : 0));
                }
                o !== 0 && ((a = !0), vd(l, o));
              } else
                ((o = oe),
                  (o = El(
                    l,
                    l === we ? o : 0,
                    l.cancelPendingCommit !== null || l.timeoutHandle !== -1,
                  )),
                  (o & 3) === 0 || pi(l, o) || ((a = !0), vd(l, o)));
            l = l.next;
          }
        while (a);
        Po = !1;
      }
    }
    function sy() {
      hd();
    }
    function hd() {
      Tu = Wo = !1;
      var e = 0;
      Bn !== 0 && py() && (e = Bn);
      for (var t = St(), a = null, l = _u; l !== null; ) {
        var r = l.next,
          o = dd(l, t);
        (o === 0
          ? ((l.next = null),
            a === null ? (_u = r) : (a.next = r),
            r === null && (ni = a))
          : ((a = l), (e !== 0 || (o & 3) !== 0) && (Tu = !0)),
          (l = r));
      }
      ((Ie !== 0 && Ie !== 5) || Pi(e, !1), Bn !== 0 && (Bn = 0));
    }
    function dd(e, t) {
      for (
        var a = e.suspendedLanes,
          l = e.pingedLanes,
          r = e.expirationTimes,
          o = e.pendingLanes & -62914561;
        0 < o;
      ) {
        var f = 31 - Tt(o),
          m = 1 << f,
          y = r[f];
        (y === -1
          ? ((m & a) === 0 || (m & l) !== 0) && (r[f] = Vv(m, t))
          : y <= t && (e.expiredLanes |= m),
          (o &= ~m));
      }
      if (
        ((t = we),
        (a = oe),
        (a = El(
          e,
          e === t ? a : 0,
          e.cancelPendingCommit !== null || e.timeoutHandle !== -1,
        )),
        (l = e.callbackNode),
        a === 0 ||
          (e === t && (be === 2 || be === 9)) ||
          e.cancelPendingCommit !== null)
      )
        return (
          l !== null && l !== null && fr(l),
          (e.callbackNode = null),
          (e.callbackPriority = 0)
        );
      if ((a & 3) === 0 || pi(e, a)) {
        if (((t = a & -a), t === e.callbackPriority)) return t;
        switch ((l !== null && fr(l), dr(a))) {
          case 2:
          case 8:
            a = ic;
            break;
          case 32:
            a = _l;
            break;
          case 268435456:
            a = lc;
            break;
          default:
            a = _l;
        }
        return (
          (l = md.bind(null, e)),
          (a = cr(a, l)),
          (e.callbackPriority = t),
          (e.callbackNode = a),
          t
        );
      }
      return (
        l !== null && l !== null && fr(l),
        (e.callbackPriority = 2),
        (e.callbackNode = null),
        2
      );
    }
    function md(e, t) {
      if (Ie !== 0 && Ie !== 5)
        return ((e.callbackNode = null), (e.callbackPriority = 0), null);
      var a = e.callbackNode;
      if (Su() && e.callbackNode !== a) return null;
      var l = oe;
      return (
        (l = El(
          e,
          e === we ? l : 0,
          e.cancelPendingCommit !== null || e.timeoutHandle !== -1,
        )),
        l === 0
          ? null
          : (Kh(e, l, t),
            dd(e, St()),
            e.callbackNode != null && e.callbackNode === a
              ? md.bind(null, e)
              : null)
      );
    }
    function vd(e, t) {
      if (Su()) return null;
      Kh(e, t, !0);
    }
    function cy() {
      Sy(function () {
        (ve & 6) !== 0 ? cr(ac, sy) : hd();
      });
    }
    function es() {
      if (Bn === 0) {
        var e = $a;
        (e === 0 && ((e = Tl), (Tl <<= 1), (Tl & 261888) === 0 && (Tl = 256)),
          (Bn = e));
      }
      return Bn;
    }
    function gd(e) {
      return e == null || typeof e == "symbol" || typeof e == "boolean"
        ? null
        : typeof e == "function"
          ? e
          : Ml("" + e);
    }
    function yd(e, t) {
      var a = t.ownerDocument.createElement("input");
      return (
        (a.name = t.name),
        (a.value = t.value),
        e.id && a.setAttribute("form", e.id),
        t.parentNode.insertBefore(a, t),
        (e = new FormData(e)),
        a.parentNode.removeChild(a),
        e
      );
    }
    function fy(e, t, a, l, r) {
      if (t === "submit" && a && a.stateNode === r) {
        var o = gd((r[ct] || null).action),
          f = l.submitter;
        f &&
          ((t = (t = f[ct] || null)
            ? gd(t.formAction)
            : f.getAttribute("formAction")),
          t !== null && ((o = t), (f = null)));
        var m = new ql("action", "action", null, l, r);
        e.push({
          event: m,
          listeners: [
            {
              instance: null,
              listener: function () {
                if (l.defaultPrevented) {
                  if (Bn !== 0) {
                    var y = f ? yd(r, f) : new FormData(r);
                    So(
                      a,
                      { pending: !0, data: y, method: r.method, action: o },
                      null,
                      y,
                    );
                  }
                } else
                  typeof o == "function" &&
                    (m.preventDefault(),
                    (y = f ? yd(r, f) : new FormData(r)),
                    So(
                      a,
                      { pending: !0, data: y, method: r.method, action: o },
                      o,
                      y,
                    ));
              },
              currentTarget: r,
            },
          ],
        });
      }
    }
    for (var ts = 0; ts < jr.length; ts++) {
      var ns = jr[ts];
      Lt(ns.toLowerCase(), "on" + (ns[0].toUpperCase() + ns.slice(1)));
    }
    (Lt(Ic, "onAnimationEnd"),
      Lt(Fc, "onAnimationIteration"),
      Lt(Wc, "onAnimationStart"),
      Lt("dblclick", "onDoubleClick"),
      Lt("focusin", "onFocus"),
      Lt("focusout", "onBlur"),
      Lt(wg, "onTransitionRun"),
      Lt(Og, "onTransitionStart"),
      Lt(Rg, "onTransitionCancel"),
      Lt(Pc, "onTransitionEnd"),
      Oa("onMouseEnter", ["mouseout", "mouseover"]),
      Oa("onMouseLeave", ["mouseout", "mouseover"]),
      Oa("onPointerEnter", ["pointerout", "pointerover"]),
      Oa("onPointerLeave", ["pointerout", "pointerover"]),
      Fn(
        "onChange",
        "change click focusin focusout input keydown keyup selectionchange".split(
          " ",
        ),
      ),
      Fn(
        "onSelect",
        "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
          " ",
        ),
      ),
      Fn("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]),
      Fn(
        "onCompositionEnd",
        "compositionend focusout keydown keypress keyup mousedown".split(" "),
      ),
      Fn(
        "onCompositionStart",
        "compositionstart focusout keydown keypress keyup mousedown".split(" "),
      ),
      Fn(
        "onCompositionUpdate",
        "compositionupdate focusout keydown keypress keyup mousedown".split(
          " ",
        ),
      ));
    var el =
        "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
          " ",
        ),
      hy = new Set(
        "beforetoggle cancel close invalid load scroll scrollend toggle"
          .split(" ")
          .concat(el),
      );
    function pd(e, t) {
      t = (t & 4) !== 0;
      for (var a = 0; a < e.length; a++) {
        var l = e[a],
          r = l.event;
        l = l.listeners;
        e: {
          var o = void 0;
          if (t)
            for (var f = l.length - 1; 0 <= f; f--) {
              var m = l[f],
                y = m.instance,
                A = m.currentTarget;
              if (((m = m.listener), y !== o && r.isPropagationStopped()))
                break e;
              ((o = m), (r.currentTarget = A));
              try {
                o(r);
              } catch (C) {
                Zl(C);
              }
              ((r.currentTarget = null), (o = y));
            }
          else
            for (f = 0; f < l.length; f++) {
              if (
                ((m = l[f]),
                (y = m.instance),
                (A = m.currentTarget),
                (m = m.listener),
                y !== o && r.isPropagationStopped())
              )
                break e;
              ((o = m), (r.currentTarget = A));
              try {
                o(r);
              } catch (C) {
                Zl(C);
              }
              ((r.currentTarget = null), (o = y));
            }
        }
      }
    }
    function re(e, t) {
      var a = t[mr];
      a === void 0 && (a = t[mr] = new Set());
      var l = e + "__bubble";
      a.has(l) || (Sd(t, e, 2, !1), a.add(l));
    }
    function as(e, t, a) {
      var l = 0;
      (t && (l |= 4), Sd(a, e, l, t));
    }
    var zu = "_reactListening" + Math.random().toString(36).slice(2);
    function bd(e) {
      if (!e[zu]) {
        ((e[zu] = !0),
          mc.forEach(function (a) {
            a !== "selectionchange" &&
              (hy.has(a) || as(a, !1, e), as(a, !0, e));
          }));
        var t = e.nodeType === 9 ? e : e.ownerDocument;
        t === null || t[zu] || ((t[zu] = !0), as("selectionchange", !1, t));
      }
    }
    function Sd(e, t, a, l) {
      switch (Xd(t)) {
        case 2:
          var r = Ly;
          break;
        case 8:
          r = Hy;
          break;
        default:
          r = ps;
      }
      ((a = r.bind(null, t, a, e)),
        (r = void 0),
        !zr ||
          (t !== "touchstart" && t !== "touchmove" && t !== "wheel") ||
          (r = !0),
        l
          ? r !== void 0
            ? e.addEventListener(t, a, { capture: !0, passive: r })
            : e.addEventListener(t, a, !0)
          : r !== void 0
            ? e.addEventListener(t, a, { passive: r })
            : e.addEventListener(t, a, !1));
    }
    function is(e, t, a, l, r) {
      var o = l;
      if ((t & 1) === 0 && (t & 2) === 0 && l !== null)
        e: for (;;) {
          if (l === null) return;
          var f = l.tag;
          if (f === 3 || f === 4) {
            var m = l.stateNode.containerInfo;
            if (m === r) break;
            if (f === 4)
              for (f = l.return; f !== null; ) {
                var y = f.tag;
                if ((y === 3 || y === 4) && f.stateNode.containerInfo === r)
                  return;
                f = f.return;
              }
            for (; m !== null; ) {
              if (((f = Aa(m)), f === null)) return;
              if (((y = f.tag), y === 5 || y === 6 || y === 26 || y === 27)) {
                l = o = f;
                continue e;
              }
              m = m.parentNode;
            }
          }
          l = l.return;
        }
      wc(function () {
        var A = o,
          C = _r(a),
          D = [];
        e: {
          var E = ef.get(e);
          if (E !== void 0) {
            var O = ql,
              $ = e;
            switch (e) {
              case "keypress":
                if (Dl(a) === 0) break e;
              case "keydown":
              case "keyup":
                O = sg;
                break;
              case "focusin":
                (($ = "focus"), (O = Or));
                break;
              case "focusout":
                (($ = "blur"), (O = Or));
                break;
              case "beforeblur":
              case "afterblur":
                O = Or;
                break;
              case "click":
                if (a.button === 2) break e;
              case "auxclick":
              case "dblclick":
              case "mousedown":
              case "mousemove":
              case "mouseup":
              case "mouseout":
              case "mouseover":
              case "contextmenu":
                O = Cc;
                break;
              case "drag":
              case "dragend":
              case "dragenter":
              case "dragexit":
              case "dragleave":
              case "dragover":
              case "dragstart":
              case "drop":
                O = ng;
                break;
              case "touchcancel":
              case "touchend":
              case "touchmove":
              case "touchstart":
                O = cg;
                break;
              case Ic:
              case Fc:
              case Wc:
                O = ag;
                break;
              case Pc:
                O = fg;
                break;
              case "scroll":
              case "scrollend":
                O = tg;
                break;
              case "wheel":
                O = hg;
                break;
              case "copy":
              case "cut":
              case "paste":
                O = ig;
                break;
              case "gotpointercapture":
              case "lostpointercapture":
              case "pointercancel":
              case "pointerdown":
              case "pointermove":
              case "pointerout":
              case "pointerover":
              case "pointerup":
                O = Nc;
                break;
              case "toggle":
              case "beforetoggle":
                O = dg;
            }
            var J = (t & 4) !== 0,
              Ee = !J && (e === "scroll" || e === "scrollend"),
              S = J ? (E !== null ? E + "Capture" : null) : E;
            J = [];
            for (var p = A, T; p !== null; ) {
              var M = p;
              if (
                ((T = M.stateNode),
                (M = M.tag),
                (M !== 5 && M !== 26 && M !== 27) ||
                  T === null ||
                  S === null ||
                  ((M = Ti(p, S)), M != null && J.push(tl(p, M, T))),
                Ee)
              )
                break;
              p = p.return;
            }
            0 < J.length &&
              ((E = new O(E, $, null, a, C)),
              D.push({ event: E, listeners: J }));
          }
        }
        if ((t & 7) === 0) {
          e: {
            if (
              ((E = e === "mouseover" || e === "pointerover"),
              (O = e === "mouseout" || e === "pointerout"),
              E &&
                a !== Sr &&
                ($ = a.relatedTarget || a.fromElement) &&
                (Aa($) || $[bi]))
            )
              break e;
            if (
              (O || E) &&
              ((E =
                C.window === C
                  ? C
                  : (E = C.ownerDocument)
                    ? E.defaultView || E.parentWindow
                    : window),
              O
                ? (($ = a.relatedTarget || a.toElement),
                  (O = A),
                  ($ = $ ? Aa($) : null),
                  $ !== null &&
                    ((Ee = d($)),
                    (J = $.tag),
                    $ !== Ee || (J !== 5 && J !== 27 && J !== 6)) &&
                    ($ = null))
                : ((O = null), ($ = A)),
              O !== $)
            ) {
              if (
                ((J = Cc),
                (M = "onMouseLeave"),
                (S = "onMouseEnter"),
                (p = "mouse"),
                (e === "pointerout" || e === "pointerover") &&
                  ((J = Nc),
                  (M = "onPointerLeave"),
                  (S = "onPointerEnter"),
                  (p = "pointer")),
                (Ee = O == null ? E : _i(O)),
                (T = $ == null ? E : _i($)),
                (E = new J(M, p + "leave", O, a, C)),
                (E.target = Ee),
                (E.relatedTarget = T),
                (M = null),
                Aa(C) === A &&
                  ((J = new J(S, p + "enter", $, a, C)),
                  (J.target = T),
                  (J.relatedTarget = Ee),
                  (M = J)),
                (Ee = M),
                O && $)
              )
                t: {
                  for (J = dy, S = O, p = $, T = 0, M = S; M; M = J(M)) T++;
                  M = 0;
                  for (var G = p; G; G = J(G)) M++;
                  for (; 0 < T - M; ) ((S = J(S)), T--);
                  for (; 0 < M - T; ) ((p = J(p)), M--);
                  for (; T--; ) {
                    if (S === p || (p !== null && S === p.alternate)) {
                      J = S;
                      break t;
                    }
                    ((S = J(S)), (p = J(p)));
                  }
                  J = null;
                }
              else J = null;
              (O !== null && _d(D, E, O, J, !1),
                $ !== null && Ee !== null && _d(D, Ee, $, J, !0));
            }
          }
          e: {
            if (
              ((E = A ? _i(A) : window),
              (O = E.nodeName && E.nodeName.toLowerCase()),
              O === "select" || (O === "input" && E.type === "file"))
            )
              var fe = Bc;
            else if (Zc(E))
              if (Qc) fe = zg;
              else {
                fe = _g;
                var H = Sg;
              }
            else
              ((O = E.nodeName),
                !O ||
                O.toLowerCase() !== "input" ||
                (E.type !== "checkbox" && E.type !== "radio")
                  ? A && br(A.elementType) && (fe = Bc)
                  : (fe = Tg));
            if (fe && (fe = fe(e, A))) {
              xc(D, fe, a, C);
              break e;
            }
            (H && H(e, E, A),
              e === "focusout" &&
                A &&
                E.type === "number" &&
                A.memoizedProps.value != null &&
                pr(E, "number", E.value));
          }
          switch (((H = A ? _i(A) : window), e)) {
            case "focusin":
              (Zc(H) || H.contentEditable === "true") &&
                ((ka = H), (kr = A), (Mi = null));
              break;
            case "focusout":
              Mi = kr = ka = null;
              break;
            case "mousedown":
              qr = !0;
              break;
            case "contextmenu":
            case "mouseup":
            case "dragend":
              ((qr = !1), Jc(D, a, C));
              break;
            case "selectionchange":
              if (Eg) break;
            case "keydown":
            case "keyup":
              Jc(D, a, C);
          }
          var te;
          if (Cr)
            e: {
              switch (e) {
                case "compositionstart":
                  var se = "onCompositionStart";
                  break e;
                case "compositionend":
                  se = "onCompositionEnd";
                  break e;
                case "compositionupdate":
                  se = "onCompositionUpdate";
                  break e;
              }
              se = void 0;
            }
          else
            Da
              ? Uc(e, a) && (se = "onCompositionEnd")
              : e === "keydown" &&
                a.keyCode === 229 &&
                (se = "onCompositionStart");
          (se &&
            (Dc &&
              a.locale !== "ko" &&
              (Da || se !== "onCompositionStart"
                ? se === "onCompositionEnd" && Da && (te = Oc())
                : ((En = C),
                  (Ar = "value" in En ? En.value : En.textContent),
                  (Da = !0))),
            (H = Au(A, se)),
            0 < H.length &&
              ((se = new Mc(se, e, null, a, C)),
              D.push({ event: se, listeners: H }),
              te
                ? (se.data = te)
                : ((te = jc(a)), te !== null && (se.data = te)))),
            (te = vg ? gg(e, a) : yg(e, a)) &&
              ((se = Au(A, "onBeforeInput")),
              0 < se.length &&
                ((H = new Mc("onBeforeInput", "beforeinput", null, a, C)),
                D.push({ event: H, listeners: se }),
                (H.data = te))),
            fy(D, e, A, a, C));
        }
        pd(D, t);
      });
    }
    function tl(e, t, a) {
      return { instance: e, listener: t, currentTarget: a };
    }
    function Au(e, t) {
      for (var a = t + "Capture", l = []; e !== null; ) {
        var r = e,
          o = r.stateNode;
        if (
          ((r = r.tag),
          (r !== 5 && r !== 26 && r !== 27) ||
            o === null ||
            ((r = Ti(e, a)),
            r != null && l.unshift(tl(e, r, o)),
            (r = Ti(e, t)),
            r != null && l.push(tl(e, r, o))),
          e.tag === 3)
        )
          return l;
        e = e.return;
      }
      return [];
    }
    function dy(e) {
      if (e === null) return null;
      do e = e.return;
      while (e && e.tag !== 5 && e.tag !== 27);
      return e || null;
    }
    function _d(e, t, a, l, r) {
      for (var o = t._reactName, f = []; a !== null && a !== l; ) {
        var m = a,
          y = m.alternate,
          A = m.stateNode;
        if (((m = m.tag), y !== null && y === l)) break;
        ((m !== 5 && m !== 26 && m !== 27) ||
          A === null ||
          ((y = A),
          r
            ? ((A = Ti(a, o)), A != null && f.unshift(tl(a, A, y)))
            : r || ((A = Ti(a, o)), A != null && f.push(tl(a, A, y)))),
          (a = a.return));
      }
      f.length !== 0 && e.push({ event: t, listeners: f });
    }
    var my = /\r\n?/g,
      vy = /\u0000|\uFFFD/g;
    function Td(e) {
      return (typeof e == "string" ? e : "" + e)
        .replace(
          my,
          `
`,
        )
        .replace(vy, "");
    }
    function zd(e, t) {
      return ((t = Td(t)), Td(e) === t);
    }
    function Ae(e, t, a, l, r, o) {
      switch (a) {
        case "children":
          typeof l == "string"
            ? t === "body" || (t === "textarea" && l === "") || Ca(e, l)
            : (typeof l == "number" || typeof l == "bigint") &&
              t !== "body" &&
              Ca(e, "" + l);
          break;
        case "className":
          Rl(e, "class", l);
          break;
        case "tabIndex":
          Rl(e, "tabindex", l);
          break;
        case "dir":
        case "role":
        case "viewBox":
        case "width":
        case "height":
          Rl(e, a, l);
          break;
        case "style":
          Ac(e, l, o);
          break;
        case "data":
          if (t !== "object") {
            Rl(e, "data", l);
            break;
          }
        case "src":
        case "href":
          if (l === "" && (t !== "a" || a !== "href")) {
            e.removeAttribute(a);
            break;
          }
          if (
            l == null ||
            typeof l == "function" ||
            typeof l == "symbol" ||
            typeof l == "boolean"
          ) {
            e.removeAttribute(a);
            break;
          }
          ((l = Ml("" + l)), e.setAttribute(a, l));
          break;
        case "action":
        case "formAction":
          if (typeof l == "function") {
            e.setAttribute(
              a,
              "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')",
            );
            break;
          } else
            typeof o == "function" &&
              (a === "formAction"
                ? (t !== "input" && Ae(e, t, "name", r.name, r, null),
                  Ae(e, t, "formEncType", r.formEncType, r, null),
                  Ae(e, t, "formMethod", r.formMethod, r, null),
                  Ae(e, t, "formTarget", r.formTarget, r, null))
                : (Ae(e, t, "encType", r.encType, r, null),
                  Ae(e, t, "method", r.method, r, null),
                  Ae(e, t, "target", r.target, r, null)));
          if (l == null || typeof l == "symbol" || typeof l == "boolean") {
            e.removeAttribute(a);
            break;
          }
          ((l = Ml("" + l)), e.setAttribute(a, l));
          break;
        case "onClick":
          l != null && (e.onclick = tn);
          break;
        case "onScroll":
          l != null && re("scroll", e);
          break;
        case "onScrollEnd":
          l != null && re("scrollend", e);
          break;
        case "dangerouslySetInnerHTML":
          if (l != null) {
            if (typeof l != "object" || !("__html" in l)) throw Error(s(61));
            if (((a = l.__html), a != null)) {
              if (r.children != null) throw Error(s(60));
              e.innerHTML = a;
            }
          }
          break;
        case "multiple":
          e.multiple = l && typeof l != "function" && typeof l != "symbol";
          break;
        case "muted":
          e.muted = l && typeof l != "function" && typeof l != "symbol";
          break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "defaultValue":
        case "defaultChecked":
        case "innerHTML":
        case "ref":
          break;
        case "autoFocus":
          break;
        case "xlinkHref":
          if (
            l == null ||
            typeof l == "function" ||
            typeof l == "boolean" ||
            typeof l == "symbol"
          ) {
            e.removeAttribute("xlink:href");
            break;
          }
          ((a = Ml("" + l)),
            e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", a));
          break;
        case "contentEditable":
        case "spellCheck":
        case "draggable":
        case "value":
        case "autoReverse":
        case "externalResourcesRequired":
        case "focusable":
        case "preserveAlpha":
          l != null && typeof l != "function" && typeof l != "symbol"
            ? e.setAttribute(a, "" + l)
            : e.removeAttribute(a);
          break;
        case "inert":
        case "allowFullScreen":
        case "async":
        case "autoPlay":
        case "controls":
        case "default":
        case "defer":
        case "disabled":
        case "disablePictureInPicture":
        case "disableRemotePlayback":
        case "formNoValidate":
        case "hidden":
        case "loop":
        case "noModule":
        case "noValidate":
        case "open":
        case "playsInline":
        case "readOnly":
        case "required":
        case "reversed":
        case "scoped":
        case "seamless":
        case "itemScope":
          l && typeof l != "function" && typeof l != "symbol"
            ? e.setAttribute(a, "")
            : e.removeAttribute(a);
          break;
        case "capture":
        case "download":
          l === !0
            ? e.setAttribute(a, "")
            : l !== !1 &&
                l != null &&
                typeof l != "function" &&
                typeof l != "symbol"
              ? e.setAttribute(a, l)
              : e.removeAttribute(a);
          break;
        case "cols":
        case "rows":
        case "size":
        case "span":
          l != null &&
          typeof l != "function" &&
          typeof l != "symbol" &&
          !isNaN(l) &&
          1 <= l
            ? e.setAttribute(a, l)
            : e.removeAttribute(a);
          break;
        case "rowSpan":
        case "start":
          l == null ||
          typeof l == "function" ||
          typeof l == "symbol" ||
          isNaN(l)
            ? e.removeAttribute(a)
            : e.setAttribute(a, l);
          break;
        case "popover":
          (re("beforetoggle", e), re("toggle", e), Ol(e, "popover", l));
          break;
        case "xlinkActuate":
          en(e, "http://www.w3.org/1999/xlink", "xlink:actuate", l);
          break;
        case "xlinkArcrole":
          en(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", l);
          break;
        case "xlinkRole":
          en(e, "http://www.w3.org/1999/xlink", "xlink:role", l);
          break;
        case "xlinkShow":
          en(e, "http://www.w3.org/1999/xlink", "xlink:show", l);
          break;
        case "xlinkTitle":
          en(e, "http://www.w3.org/1999/xlink", "xlink:title", l);
          break;
        case "xlinkType":
          en(e, "http://www.w3.org/1999/xlink", "xlink:type", l);
          break;
        case "xmlBase":
          en(e, "http://www.w3.org/XML/1998/namespace", "xml:base", l);
          break;
        case "xmlLang":
          en(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", l);
          break;
        case "xmlSpace":
          en(e, "http://www.w3.org/XML/1998/namespace", "xml:space", l);
          break;
        case "is":
          Ol(e, "is", l);
          break;
        case "innerText":
        case "textContent":
          break;
        default:
          (!(2 < a.length) ||
            (a[0] !== "o" && a[0] !== "O") ||
            (a[1] !== "n" && a[1] !== "N")) &&
            ((a = Pv.get(a) || a), Ol(e, a, l));
      }
    }
    function ls(e, t, a, l, r, o) {
      switch (a) {
        case "style":
          Ac(e, l, o);
          break;
        case "dangerouslySetInnerHTML":
          if (l != null) {
            if (typeof l != "object" || !("__html" in l)) throw Error(s(61));
            if (((a = l.__html), a != null)) {
              if (r.children != null) throw Error(s(60));
              e.innerHTML = a;
            }
          }
          break;
        case "children":
          typeof l == "string"
            ? Ca(e, l)
            : (typeof l == "number" || typeof l == "bigint") && Ca(e, "" + l);
          break;
        case "onScroll":
          l != null && re("scroll", e);
          break;
        case "onScrollEnd":
          l != null && re("scrollend", e);
          break;
        case "onClick":
          l != null && (e.onclick = tn);
          break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "innerHTML":
        case "ref":
          break;
        case "innerText":
        case "textContent":
          break;
        default:
          if (!vc.hasOwnProperty(a))
            e: {
              if (
                a[0] === "o" &&
                a[1] === "n" &&
                ((r = a.endsWith("Capture")),
                (t = a.slice(2, r ? a.length - 7 : void 0)),
                (o = e[ct] || null),
                (o = o != null ? o[a] : null),
                typeof o == "function" && e.removeEventListener(t, o, r),
                typeof l == "function")
              ) {
                (typeof o != "function" &&
                  o !== null &&
                  (a in e
                    ? (e[a] = null)
                    : e.hasAttribute(a) && e.removeAttribute(a)),
                  e.addEventListener(t, l, r));
                break e;
              }
              a in e
                ? (e[a] = l)
                : l === !0
                  ? e.setAttribute(a, "")
                  : Ol(e, a, l);
            }
      }
    }
    function lt(e, t, a) {
      switch (t) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li":
          break;
        case "img":
          (re("error", e), re("load", e));
          var l = !1,
            r = !1,
            o;
          for (o in a)
            if (a.hasOwnProperty(o)) {
              var f = a[o];
              if (f != null)
                switch (o) {
                  case "src":
                    l = !0;
                    break;
                  case "srcSet":
                    r = !0;
                    break;
                  case "children":
                  case "dangerouslySetInnerHTML":
                    throw Error(s(137, t));
                  default:
                    Ae(e, t, o, f, a, null);
                }
            }
          (r && Ae(e, t, "srcSet", a.srcSet, a, null),
            l && Ae(e, t, "src", a.src, a, null));
          return;
        case "input":
          re("invalid", e);
          var m = (o = f = r = null),
            y = null,
            A = null;
          for (l in a)
            if (a.hasOwnProperty(l)) {
              var C = a[l];
              if (C != null)
                switch (l) {
                  case "name":
                    r = C;
                    break;
                  case "type":
                    f = C;
                    break;
                  case "checked":
                    y = C;
                    break;
                  case "defaultChecked":
                    A = C;
                    break;
                  case "value":
                    o = C;
                    break;
                  case "defaultValue":
                    m = C;
                    break;
                  case "children":
                  case "dangerouslySetInnerHTML":
                    if (C != null) throw Error(s(137, t));
                    break;
                  default:
                    Ae(e, t, l, C, a, null);
                }
            }
          Sc(e, o, m, y, A, f, r, !1);
          return;
        case "select":
          (re("invalid", e), (l = f = o = null));
          for (r in a)
            if (a.hasOwnProperty(r) && ((m = a[r]), m != null))
              switch (r) {
                case "value":
                  o = m;
                  break;
                case "defaultValue":
                  f = m;
                  break;
                case "multiple":
                  l = m;
                default:
                  Ae(e, t, r, m, a, null);
              }
          ((t = o),
            (a = f),
            (e.multiple = !!l),
            t != null ? Ra(e, !!l, t, !1) : a != null && Ra(e, !!l, a, !0));
          return;
        case "textarea":
          (re("invalid", e), (o = r = l = null));
          for (f in a)
            if (a.hasOwnProperty(f) && ((m = a[f]), m != null))
              switch (f) {
                case "value":
                  l = m;
                  break;
                case "defaultValue":
                  r = m;
                  break;
                case "children":
                  o = m;
                  break;
                case "dangerouslySetInnerHTML":
                  if (m != null) throw Error(s(91));
                  break;
                default:
                  Ae(e, t, f, m, a, null);
              }
          Tc(e, l, r, o);
          return;
        case "option":
          for (y in a)
            if (a.hasOwnProperty(y) && ((l = a[y]), l != null))
              switch (y) {
                case "selected":
                  e.selected =
                    l && typeof l != "function" && typeof l != "symbol";
                  break;
                default:
                  Ae(e, t, y, l, a, null);
              }
          return;
        case "dialog":
          (re("beforetoggle", e),
            re("toggle", e),
            re("cancel", e),
            re("close", e));
          break;
        case "iframe":
        case "object":
          re("load", e);
          break;
        case "video":
        case "audio":
          for (l = 0; l < el.length; l++) re(el[l], e);
          break;
        case "image":
          (re("error", e), re("load", e));
          break;
        case "details":
          re("toggle", e);
          break;
        case "embed":
        case "source":
        case "link":
          (re("error", e), re("load", e));
        case "area":
        case "base":
        case "br":
        case "col":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "track":
        case "wbr":
        case "menuitem":
          for (A in a)
            if (a.hasOwnProperty(A) && ((l = a[A]), l != null))
              switch (A) {
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(s(137, t));
                default:
                  Ae(e, t, A, l, a, null);
              }
          return;
        default:
          if (br(t)) {
            for (C in a)
              a.hasOwnProperty(C) &&
                ((l = a[C]), l !== void 0 && ls(e, t, C, l, a, void 0));
            return;
          }
      }
      for (m in a)
        a.hasOwnProperty(m) &&
          ((l = a[m]), l != null && Ae(e, t, m, l, a, null));
    }
    function gy(e, t, a, l) {
      switch (t) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li":
          break;
        case "input":
          var r = null,
            o = null,
            f = null,
            m = null,
            y = null,
            A = null,
            C = null;
          for (O in a) {
            var D = a[O];
            if (a.hasOwnProperty(O) && D != null)
              switch (O) {
                case "checked":
                  break;
                case "value":
                  break;
                case "defaultValue":
                  y = D;
                default:
                  l.hasOwnProperty(O) || Ae(e, t, O, null, l, D);
              }
          }
          for (var E in l) {
            var O = l[E];
            if (((D = a[E]), l.hasOwnProperty(E) && (O != null || D != null)))
              switch (E) {
                case "type":
                  o = O;
                  break;
                case "name":
                  r = O;
                  break;
                case "checked":
                  A = O;
                  break;
                case "defaultChecked":
                  C = O;
                  break;
                case "value":
                  f = O;
                  break;
                case "defaultValue":
                  m = O;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (O != null) throw Error(s(137, t));
                  break;
                default:
                  O !== D && Ae(e, t, E, O, l, D);
              }
          }
          yr(e, f, m, y, A, C, o, r);
          return;
        case "select":
          O = f = m = E = null;
          for (o in a)
            if (((y = a[o]), a.hasOwnProperty(o) && y != null))
              switch (o) {
                case "value":
                  break;
                case "multiple":
                  O = y;
                default:
                  l.hasOwnProperty(o) || Ae(e, t, o, null, l, y);
              }
          for (r in l)
            if (
              ((o = l[r]),
              (y = a[r]),
              l.hasOwnProperty(r) && (o != null || y != null))
            )
              switch (r) {
                case "value":
                  E = o;
                  break;
                case "defaultValue":
                  m = o;
                  break;
                case "multiple":
                  f = o;
                default:
                  o !== y && Ae(e, t, r, o, l, y);
              }
          ((t = m),
            (a = f),
            (l = O),
            E != null
              ? Ra(e, !!a, E, !1)
              : !!l != !!a &&
                (t != null ? Ra(e, !!a, t, !0) : Ra(e, !!a, a ? [] : "", !1)));
          return;
        case "textarea":
          O = E = null;
          for (m in a)
            if (
              ((r = a[m]),
              a.hasOwnProperty(m) && r != null && !l.hasOwnProperty(m))
            )
              switch (m) {
                case "value":
                  break;
                case "children":
                  break;
                default:
                  Ae(e, t, m, null, l, r);
              }
          for (f in l)
            if (
              ((r = l[f]),
              (o = a[f]),
              l.hasOwnProperty(f) && (r != null || o != null))
            )
              switch (f) {
                case "value":
                  E = r;
                  break;
                case "defaultValue":
                  O = r;
                  break;
                case "children":
                  break;
                case "dangerouslySetInnerHTML":
                  if (r != null) throw Error(s(91));
                  break;
                default:
                  r !== o && Ae(e, t, f, r, l, o);
              }
          _c(e, E, O);
          return;
        case "option":
          for (var $ in a)
            if (
              ((E = a[$]),
              a.hasOwnProperty($) && E != null && !l.hasOwnProperty($))
            )
              switch ($) {
                case "selected":
                  e.selected = !1;
                  break;
                default:
                  Ae(e, t, $, null, l, E);
              }
          for (y in l)
            if (
              ((E = l[y]),
              (O = a[y]),
              l.hasOwnProperty(y) && E !== O && (E != null || O != null))
            )
              switch (y) {
                case "selected":
                  e.selected =
                    E && typeof E != "function" && typeof E != "symbol";
                  break;
                default:
                  Ae(e, t, y, E, l, O);
              }
          return;
        case "img":
        case "link":
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
        case "menuitem":
          for (var J in a)
            ((E = a[J]),
              a.hasOwnProperty(J) &&
                E != null &&
                !l.hasOwnProperty(J) &&
                Ae(e, t, J, null, l, E));
          for (A in l)
            if (
              ((E = l[A]),
              (O = a[A]),
              l.hasOwnProperty(A) && E !== O && (E != null || O != null))
            )
              switch (A) {
                case "children":
                case "dangerouslySetInnerHTML":
                  if (E != null) throw Error(s(137, t));
                  break;
                default:
                  Ae(e, t, A, E, l, O);
              }
          return;
        default:
          if (br(t)) {
            for (var Ee in a)
              ((E = a[Ee]),
                a.hasOwnProperty(Ee) &&
                  E !== void 0 &&
                  !l.hasOwnProperty(Ee) &&
                  ls(e, t, Ee, void 0, l, E));
            for (C in l)
              ((E = l[C]),
                (O = a[C]),
                !l.hasOwnProperty(C) ||
                  E === O ||
                  (E === void 0 && O === void 0) ||
                  ls(e, t, C, E, l, O));
            return;
          }
      }
      for (var S in a)
        ((E = a[S]),
          a.hasOwnProperty(S) &&
            E != null &&
            !l.hasOwnProperty(S) &&
            Ae(e, t, S, null, l, E));
      for (D in l)
        ((E = l[D]),
          (O = a[D]),
          !l.hasOwnProperty(D) ||
            E === O ||
            (E == null && O == null) ||
            Ae(e, t, D, E, l, O));
    }
    function Ad(e) {
      switch (e) {
        case "css":
        case "script":
        case "font":
        case "img":
        case "image":
        case "input":
        case "link":
          return !0;
        default:
          return !1;
      }
    }
    function yy() {
      if (typeof performance.getEntriesByType == "function") {
        for (
          var e = 0, t = 0, a = performance.getEntriesByType("resource"), l = 0;
          l < a.length;
          l++
        ) {
          var r = a[l],
            o = r.transferSize,
            f = r.initiatorType,
            m = r.duration;
          if (o && m && Ad(f)) {
            for (f = 0, m = r.responseEnd, l += 1; l < a.length; l++) {
              var y = a[l],
                A = y.startTime;
              if (A > m) break;
              var C = y.transferSize,
                D = y.initiatorType;
              C &&
                Ad(D) &&
                ((y = y.responseEnd),
                (f += C * (y < m ? 1 : (m - A) / (y - A))));
            }
            if ((--l, (t += (8 * (o + f)) / (r.duration / 1e3)), e++, 10 < e))
              break;
          }
        }
        if (0 < e) return t / e / 1e6;
      }
      return navigator.connection &&
        ((e = navigator.connection.downlink), typeof e == "number")
        ? e
        : 5;
    }
    var us = null,
      rs = null;
    function Eu(e) {
      return e.nodeType === 9 ? e : e.ownerDocument;
    }
    function Ed(e) {
      switch (e) {
        case "http://www.w3.org/2000/svg":
          return 1;
        case "http://www.w3.org/1998/Math/MathML":
          return 2;
        default:
          return 0;
      }
    }
    function wd(e, t) {
      if (e === 0)
        switch (t) {
          case "svg":
            return 1;
          case "math":
            return 2;
          default:
            return 0;
        }
      return e === 1 && t === "foreignObject" ? 0 : e;
    }
    function os(e, t) {
      return (
        e === "textarea" ||
        e === "noscript" ||
        typeof t.children == "string" ||
        typeof t.children == "number" ||
        typeof t.children == "bigint" ||
        (typeof t.dangerouslySetInnerHTML == "object" &&
          t.dangerouslySetInnerHTML !== null &&
          t.dangerouslySetInnerHTML.__html != null)
      );
    }
    var ss = null;
    function py() {
      var e = window.event;
      return e && e.type === "popstate"
        ? e === ss
          ? !1
          : ((ss = e), !0)
        : ((ss = null), !1);
    }
    var Od = typeof setTimeout == "function" ? setTimeout : void 0,
      by = typeof clearTimeout == "function" ? clearTimeout : void 0,
      Rd = typeof Promise == "function" ? Promise : void 0,
      Sy =
        typeof queueMicrotask == "function"
          ? queueMicrotask
          : typeof Rd < "u"
            ? function (e) {
                return Rd.resolve(null).then(e).catch(_y);
              }
            : Od;
    function _y(e) {
      setTimeout(function () {
        throw e;
      });
    }
    function Qn(e) {
      return e === "head";
    }
    function Cd(e, t) {
      var a = t,
        l = 0;
      do {
        var r = a.nextSibling;
        if ((e.removeChild(a), r && r.nodeType === 8))
          if (((a = r.data), a === "/$" || a === "/&")) {
            if (l === 0) {
              (e.removeChild(r), ui(t));
              return;
            }
            l--;
          } else if (
            a === "$" ||
            a === "$?" ||
            a === "$~" ||
            a === "$!" ||
            a === "&"
          )
            l++;
          else if (a === "html") nl(e.ownerDocument.documentElement);
          else if (a === "head") {
            ((a = e.ownerDocument.head), nl(a));
            for (var o = a.firstChild; o; ) {
              var f = o.nextSibling,
                m = o.nodeName;
              (o[Si] ||
                m === "SCRIPT" ||
                m === "STYLE" ||
                (m === "LINK" && o.rel.toLowerCase() === "stylesheet") ||
                a.removeChild(o),
                (o = f));
            }
          } else a === "body" && nl(e.ownerDocument.body);
        a = r;
      } while (a);
      ui(t);
    }
    function Md(e, t) {
      var a = e;
      e = 0;
      do {
        var l = a.nextSibling;
        if (
          (a.nodeType === 1
            ? t
              ? ((a._stashedDisplay = a.style.display),
                (a.style.display = "none"))
              : ((a.style.display = a._stashedDisplay || ""),
                a.getAttribute("style") === "" && a.removeAttribute("style"))
            : a.nodeType === 3 &&
              (t
                ? ((a._stashedText = a.nodeValue), (a.nodeValue = ""))
                : (a.nodeValue = a._stashedText || "")),
          l && l.nodeType === 8)
        )
          if (((a = l.data), a === "/$")) {
            if (e === 0) break;
            e--;
          } else (a !== "$" && a !== "$?" && a !== "$~" && a !== "$!") || e++;
        a = l;
      } while (a);
    }
    function cs(e) {
      var t = e.firstChild;
      for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
        var a = t;
        switch (((t = t.nextSibling), a.nodeName)) {
          case "HTML":
          case "HEAD":
          case "BODY":
            (cs(a), vr(a));
            continue;
          case "SCRIPT":
          case "STYLE":
            continue;
          case "LINK":
            if (a.rel.toLowerCase() === "stylesheet") continue;
        }
        e.removeChild(a);
      }
    }
    function Ty(e, t, a, l) {
      for (; e.nodeType === 1; ) {
        var r = a;
        if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
          if (!l && (e.nodeName !== "INPUT" || e.type !== "hidden")) break;
        } else if (l) {
          if (!e[Si])
            switch (t) {
              case "meta":
                if (!e.hasAttribute("itemprop")) break;
                return e;
              case "link":
                if (
                  ((o = e.getAttribute("rel")),
                  o === "stylesheet" && e.hasAttribute("data-precedence"))
                )
                  break;
                if (
                  o !== r.rel ||
                  e.getAttribute("href") !==
                    (r.href == null || r.href === "" ? null : r.href) ||
                  e.getAttribute("crossorigin") !==
                    (r.crossOrigin == null ? null : r.crossOrigin) ||
                  e.getAttribute("title") !== (r.title == null ? null : r.title)
                )
                  break;
                return e;
              case "style":
                if (e.hasAttribute("data-precedence")) break;
                return e;
              case "script":
                if (
                  ((o = e.getAttribute("src")),
                  (o !== (r.src == null ? null : r.src) ||
                    e.getAttribute("type") !==
                      (r.type == null ? null : r.type) ||
                    e.getAttribute("crossorigin") !==
                      (r.crossOrigin == null ? null : r.crossOrigin)) &&
                    o &&
                    e.hasAttribute("async") &&
                    !e.hasAttribute("itemprop"))
                )
                  break;
                return e;
              default:
                return e;
            }
        } else if (t === "input" && e.type === "hidden") {
          var o = r.name == null ? null : "" + r.name;
          if (r.type === "hidden" && e.getAttribute("name") === o) return e;
        } else return e;
        if (((e = xt(e.nextSibling)), e === null)) break;
      }
      return null;
    }
    function zy(e, t, a) {
      if (t === "") return null;
      for (; e.nodeType !== 3; )
        if (
          ((e.nodeType !== 1 ||
            e.nodeName !== "INPUT" ||
            e.type !== "hidden") &&
            !a) ||
          ((e = xt(e.nextSibling)), e === null)
        )
          return null;
      return e;
    }
    function Nd(e, t) {
      for (; e.nodeType !== 8; )
        if (
          ((e.nodeType !== 1 ||
            e.nodeName !== "INPUT" ||
            e.type !== "hidden") &&
            !t) ||
          ((e = xt(e.nextSibling)), e === null)
        )
          return null;
      return e;
    }
    function fs(e) {
      return e.data === "$?" || e.data === "$~";
    }
    function hs(e) {
      return (
        e.data === "$!" ||
        (e.data === "$?" && e.ownerDocument.readyState !== "loading")
      );
    }
    function Ay(e, t) {
      var a = e.ownerDocument;
      if (e.data === "$~") e._reactRetry = t;
      else if (e.data !== "$?" || a.readyState !== "loading") t();
      else {
        var l = function () {
          (t(), a.removeEventListener("DOMContentLoaded", l));
        };
        (a.addEventListener("DOMContentLoaded", l), (e._reactRetry = l));
      }
    }
    function xt(e) {
      for (; e != null; e = e.nextSibling) {
        var t = e.nodeType;
        if (t === 1 || t === 3) break;
        if (t === 8) {
          if (
            ((t = e.data),
            t === "$" ||
              t === "$!" ||
              t === "$?" ||
              t === "$~" ||
              t === "&" ||
              t === "F!" ||
              t === "F")
          )
            break;
          if (t === "/$" || t === "/&") return null;
        }
      }
      return e;
    }
    var ds = null;
    function Dd(e) {
      e = e.nextSibling;
      for (var t = 0; e; ) {
        if (e.nodeType === 8) {
          var a = e.data;
          if (a === "/$" || a === "/&") {
            if (t === 0) return xt(e.nextSibling);
            t--;
          } else
            (a !== "$" &&
              a !== "$!" &&
              a !== "$?" &&
              a !== "$~" &&
              a !== "&") ||
              t++;
        }
        e = e.nextSibling;
      }
      return null;
    }
    function kd(e) {
      e = e.previousSibling;
      for (var t = 0; e; ) {
        if (e.nodeType === 8) {
          var a = e.data;
          if (
            a === "$" ||
            a === "$!" ||
            a === "$?" ||
            a === "$~" ||
            a === "&"
          ) {
            if (t === 0) return e;
            t--;
          } else (a !== "/$" && a !== "/&") || t++;
        }
        e = e.previousSibling;
      }
      return null;
    }
    function qd(e, t, a) {
      switch (((t = Eu(a)), e)) {
        case "html":
          if (((e = t.documentElement), !e)) throw Error(s(452));
          return e;
        case "head":
          if (((e = t.head), !e)) throw Error(s(453));
          return e;
        case "body":
          if (((e = t.body), !e)) throw Error(s(454));
          return e;
        default:
          throw Error(s(451));
      }
    }
    function nl(e) {
      for (var t = e.attributes; t.length; ) e.removeAttributeNode(t[0]);
      vr(e);
    }
    var Bt = new Map(),
      Ud = new Set();
    function wu(e) {
      return typeof e.getRootNode == "function"
        ? e.getRootNode()
        : e.nodeType === 9
          ? e
          : e.ownerDocument;
    }
    var bn = B.d;
    B.d = { f: Ey, r: wy, D: Oy, C: Ry, L: Cy, m: My, X: Dy, S: Ny, M: ky };
    function Ey() {
      var e = bn.f(),
        t = yu();
      return e || t;
    }
    function wy(e) {
      var t = Ea(e);
      t !== null && t.tag === 5 && t.type === "form" ? eh(t) : bn.r(e);
    }
    var ai = typeof document > "u" ? null : document;
    function jd(e, t, a) {
      var l = ai;
      if (l && typeof t == "string" && t) {
        var r = Mt(t);
        ((r = 'link[rel="' + e + '"][href="' + r + '"]'),
          typeof a == "string" && (r += '[crossorigin="' + a + '"]'),
          Ud.has(r) ||
            (Ud.add(r),
            (e = { rel: e, crossOrigin: a, href: t }),
            l.querySelector(r) === null &&
              ((t = l.createElement("link")),
              lt(t, "link", e),
              Pe(t),
              l.head.appendChild(t))));
      }
    }
    function Oy(e) {
      (bn.D(e), jd("dns-prefetch", e, null));
    }
    function Ry(e, t) {
      (bn.C(e, t), jd("preconnect", e, t));
    }
    function Cy(e, t, a) {
      bn.L(e, t, a);
      var l = ai;
      if (l && e && t) {
        var r = 'link[rel="preload"][as="' + Mt(t) + '"]';
        t === "image" && a && a.imageSrcSet
          ? ((r += '[imagesrcset="' + Mt(a.imageSrcSet) + '"]'),
            typeof a.imageSizes == "string" &&
              (r += '[imagesizes="' + Mt(a.imageSizes) + '"]'))
          : (r += '[href="' + Mt(e) + '"]');
        var o = r;
        switch (t) {
          case "style":
            o = ii(e);
            break;
          case "script":
            o = li(e);
        }
        Bt.has(o) ||
          ((e = w(
            {
              rel: "preload",
              href: t === "image" && a && a.imageSrcSet ? void 0 : e,
              as: t,
            },
            a,
          )),
          Bt.set(o, e),
          l.querySelector(r) !== null ||
            (t === "style" && l.querySelector(al(o))) ||
            (t === "script" && l.querySelector(il(o))) ||
            ((t = l.createElement("link")),
            lt(t, "link", e),
            Pe(t),
            l.head.appendChild(t)));
      }
    }
    function My(e, t) {
      bn.m(e, t);
      var a = ai;
      if (a && e) {
        var l = t && typeof t.as == "string" ? t.as : "script",
          r =
            'link[rel="modulepreload"][as="' +
            Mt(l) +
            '"][href="' +
            Mt(e) +
            '"]',
          o = r;
        switch (l) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            o = li(e);
        }
        if (
          !Bt.has(o) &&
          ((e = w({ rel: "modulepreload", href: e }, t)),
          Bt.set(o, e),
          a.querySelector(r) === null)
        ) {
          switch (l) {
            case "audioworklet":
            case "paintworklet":
            case "serviceworker":
            case "sharedworker":
            case "worker":
            case "script":
              if (a.querySelector(il(o))) return;
          }
          ((l = a.createElement("link")),
            lt(l, "link", e),
            Pe(l),
            a.head.appendChild(l));
        }
      }
    }
    function Ny(e, t, a) {
      bn.S(e, t, a);
      var l = ai;
      if (l && e) {
        var r = wa(l).hoistableStyles,
          o = ii(e);
        t = t || "default";
        var f = r.get(o);
        if (!f) {
          var m = { loading: 0, preload: null };
          if ((f = l.querySelector(al(o)))) m.loading = 5;
          else {
            ((e = w({ rel: "stylesheet", href: e, "data-precedence": t }, a)),
              (a = Bt.get(o)) && ms(e, a));
            var y = (f = l.createElement("link"));
            (Pe(y),
              lt(y, "link", e),
              (y._p = new Promise(function (A, C) {
                ((y.onload = A), (y.onerror = C));
              })),
              y.addEventListener("load", function () {
                m.loading |= 1;
              }),
              y.addEventListener("error", function () {
                m.loading |= 2;
              }),
              (m.loading |= 4),
              Ou(f, t, l));
          }
          ((f = { type: "stylesheet", instance: f, count: 1, state: m }),
            r.set(o, f));
        }
      }
    }
    function Dy(e, t) {
      bn.X(e, t);
      var a = ai;
      if (a && e) {
        var l = wa(a).hoistableScripts,
          r = li(e),
          o = l.get(r);
        o ||
          ((o = a.querySelector(il(r))),
          o ||
            ((e = w({ src: e, async: !0 }, t)),
            (t = Bt.get(r)) && vs(e, t),
            (o = a.createElement("script")),
            Pe(o),
            lt(o, "link", e),
            a.head.appendChild(o)),
          (o = { type: "script", instance: o, count: 1, state: null }),
          l.set(r, o));
      }
    }
    function ky(e, t) {
      bn.M(e, t);
      var a = ai;
      if (a && e) {
        var l = wa(a).hoistableScripts,
          r = li(e),
          o = l.get(r);
        o ||
          ((o = a.querySelector(il(r))),
          o ||
            ((e = w({ src: e, async: !0, type: "module" }, t)),
            (t = Bt.get(r)) && vs(e, t),
            (o = a.createElement("script")),
            Pe(o),
            lt(o, "link", e),
            a.head.appendChild(o)),
          (o = { type: "script", instance: o, count: 1, state: null }),
          l.set(r, o));
      }
    }
    function Zd(e, t, a, l) {
      var r = (r = le.current) ? wu(r) : null;
      if (!r) throw Error(s(446));
      switch (e) {
        case "meta":
        case "title":
          return null;
        case "style":
          return typeof a.precedence == "string" && typeof a.href == "string"
            ? ((t = ii(a.href)),
              (a = wa(r).hoistableStyles),
              (l = a.get(t)),
              l ||
                ((l = { type: "style", instance: null, count: 0, state: null }),
                a.set(t, l)),
              l)
            : { type: "void", instance: null, count: 0, state: null };
        case "link":
          if (
            a.rel === "stylesheet" &&
            typeof a.href == "string" &&
            typeof a.precedence == "string"
          ) {
            e = ii(a.href);
            var o = wa(r).hoistableStyles,
              f = o.get(e);
            if (
              (f ||
                ((r = r.ownerDocument || r),
                (f = {
                  type: "stylesheet",
                  instance: null,
                  count: 0,
                  state: { loading: 0, preload: null },
                }),
                o.set(e, f),
                (o = r.querySelector(al(e))) &&
                  !o._p &&
                  ((f.instance = o), (f.state.loading = 5)),
                Bt.has(e) ||
                  ((a = {
                    rel: "preload",
                    as: "style",
                    href: a.href,
                    crossOrigin: a.crossOrigin,
                    integrity: a.integrity,
                    media: a.media,
                    hrefLang: a.hrefLang,
                    referrerPolicy: a.referrerPolicy,
                  }),
                  Bt.set(e, a),
                  o || qy(r, e, a, f.state))),
              t && l === null)
            )
              throw Error(s(528, ""));
            return f;
          }
          if (t && l !== null) throw Error(s(529, ""));
          return null;
        case "script":
          return (
            (t = a.async),
            (a = a.src),
            typeof a == "string" &&
            t &&
            typeof t != "function" &&
            typeof t != "symbol"
              ? ((t = li(a)),
                (a = wa(r).hoistableScripts),
                (l = a.get(t)),
                l ||
                  ((l = {
                    type: "script",
                    instance: null,
                    count: 0,
                    state: null,
                  }),
                  a.set(t, l)),
                l)
              : { type: "void", instance: null, count: 0, state: null }
          );
        default:
          throw Error(s(444, e));
      }
    }
    function ii(e) {
      return 'href="' + Mt(e) + '"';
    }
    function al(e) {
      return 'link[rel="stylesheet"][' + e + "]";
    }
    function xd(e) {
      return w({}, e, { "data-precedence": e.precedence, precedence: null });
    }
    function qy(e, t, a, l) {
      e.querySelector('link[rel="preload"][as="style"][' + t + "]")
        ? (l.loading = 1)
        : ((t = e.createElement("link")),
          (l.preload = t),
          t.addEventListener("load", function () {
            return (l.loading |= 1);
          }),
          t.addEventListener("error", function () {
            return (l.loading |= 2);
          }),
          lt(t, "link", a),
          Pe(t),
          e.head.appendChild(t));
    }
    function li(e) {
      return '[src="' + Mt(e) + '"]';
    }
    function il(e) {
      return "script[async]" + e;
    }
    function Bd(e, t, a) {
      if ((t.count++, t.instance === null))
        switch (t.type) {
          case "style":
            var l = e.querySelector('style[data-href~="' + Mt(a.href) + '"]');
            if (l) return ((t.instance = l), Pe(l), l);
            var r = w({}, a, {
              "data-href": a.href,
              "data-precedence": a.precedence,
              href: null,
              precedence: null,
            });
            return (
              (l = (e.ownerDocument || e).createElement("style")),
              Pe(l),
              lt(l, "style", r),
              Ou(l, a.precedence, e),
              (t.instance = l)
            );
          case "stylesheet":
            r = ii(a.href);
            var o = e.querySelector(al(r));
            if (o) return ((t.state.loading |= 4), (t.instance = o), Pe(o), o);
            ((l = xd(a)),
              (r = Bt.get(r)) && ms(l, r),
              (o = (e.ownerDocument || e).createElement("link")),
              Pe(o));
            var f = o;
            return (
              (f._p = new Promise(function (m, y) {
                ((f.onload = m), (f.onerror = y));
              })),
              lt(o, "link", l),
              (t.state.loading |= 4),
              Ou(o, a.precedence, e),
              (t.instance = o)
            );
          case "script":
            return (
              (o = li(a.src)),
              (r = e.querySelector(il(o)))
                ? ((t.instance = r), Pe(r), r)
                : ((l = a),
                  (r = Bt.get(o)) && ((l = w({}, a)), vs(l, r)),
                  (e = e.ownerDocument || e),
                  (r = e.createElement("script")),
                  Pe(r),
                  lt(r, "link", l),
                  e.head.appendChild(r),
                  (t.instance = r))
            );
          case "void":
            return null;
          default:
            throw Error(s(443, t.type));
        }
      else
        t.type === "stylesheet" &&
          (t.state.loading & 4) === 0 &&
          ((l = t.instance), (t.state.loading |= 4), Ou(l, a.precedence, e));
      return t.instance;
    }
    function Ou(e, t, a) {
      for (
        var l = a.querySelectorAll(
            'link[rel="stylesheet"][data-precedence],style[data-precedence]',
          ),
          r = l.length ? l[l.length - 1] : null,
          o = r,
          f = 0;
        f < l.length;
        f++
      ) {
        var m = l[f];
        if (m.dataset.precedence === t) o = m;
        else if (o !== r) break;
      }
      o
        ? o.parentNode.insertBefore(e, o.nextSibling)
        : ((t = a.nodeType === 9 ? a.head : a),
          t.insertBefore(e, t.firstChild));
    }
    function ms(e, t) {
      ((e.crossOrigin ??= t.crossOrigin),
        (e.referrerPolicy ??= t.referrerPolicy),
        (e.title ??= t.title));
    }
    function vs(e, t) {
      ((e.crossOrigin ??= t.crossOrigin),
        (e.referrerPolicy ??= t.referrerPolicy),
        (e.integrity ??= t.integrity));
    }
    var Ru = null;
    function Qd(e, t, a) {
      if (Ru === null) {
        var l = new Map(),
          r = (Ru = new Map());
        r.set(a, l);
      } else ((r = Ru), (l = r.get(a)), l || ((l = new Map()), r.set(a, l)));
      if (l.has(e)) return l;
      for (
        l.set(e, null), a = a.getElementsByTagName(e), r = 0;
        r < a.length;
        r++
      ) {
        var o = a[r];
        if (
          !(
            o[Si] ||
            o[tt] ||
            (e === "link" && o.getAttribute("rel") === "stylesheet")
          ) &&
          o.namespaceURI !== "http://www.w3.org/2000/svg"
        ) {
          var f = o.getAttribute(t) || "";
          f = e + f;
          var m = l.get(f);
          m ? m.push(o) : l.set(f, [o]);
        }
      }
      return l;
    }
    function $d(e, t, a) {
      ((e = e.ownerDocument || e),
        e.head.insertBefore(
          a,
          t === "title" ? e.querySelector("head > title") : null,
        ));
    }
    function Uy(e, t, a) {
      if (a === 1 || t.itemProp != null) return !1;
      switch (e) {
        case "meta":
        case "title":
          return !0;
        case "style":
          if (
            typeof t.precedence != "string" ||
            typeof t.href != "string" ||
            t.href === ""
          )
            break;
          return !0;
        case "link":
          if (
            typeof t.rel != "string" ||
            typeof t.href != "string" ||
            t.href === "" ||
            t.onLoad ||
            t.onError
          )
            break;
          switch (t.rel) {
            case "stylesheet":
              return (
                (e = t.disabled),
                typeof t.precedence == "string" && e == null
              );
            default:
              return !0;
          }
        case "script":
          if (
            t.async &&
            typeof t.async != "function" &&
            typeof t.async != "symbol" &&
            !t.onLoad &&
            !t.onError &&
            t.src &&
            typeof t.src == "string"
          )
            return !0;
      }
      return !1;
    }
    function Ld(e) {
      return !(e.type === "stylesheet" && (e.state.loading & 3) === 0);
    }
    function jy(e, t, a, l) {
      if (
        a.type === "stylesheet" &&
        (typeof l.media != "string" || matchMedia(l.media).matches !== !1) &&
        (a.state.loading & 4) === 0
      ) {
        if (a.instance === null) {
          var r = ii(l.href),
            o = t.querySelector(al(r));
          if (o) {
            ((t = o._p),
              t !== null &&
                typeof t == "object" &&
                typeof t.then == "function" &&
                (e.count++, (e = Cu.bind(e)), t.then(e, e)),
              (a.state.loading |= 4),
              (a.instance = o),
              Pe(o));
            return;
          }
          ((o = t.ownerDocument || t),
            (l = xd(l)),
            (r = Bt.get(r)) && ms(l, r),
            (o = o.createElement("link")),
            Pe(o));
          var f = o;
          ((f._p = new Promise(function (m, y) {
            ((f.onload = m), (f.onerror = y));
          })),
            lt(o, "link", l),
            (a.instance = o));
        }
        (e.stylesheets === null && (e.stylesheets = new Map()),
          e.stylesheets.set(a, t),
          (t = a.state.preload) &&
            (a.state.loading & 3) === 0 &&
            (e.count++,
            (a = Cu.bind(e)),
            t.addEventListener("load", a),
            t.addEventListener("error", a)));
      }
    }
    var gs = 0;
    function Zy(e, t) {
      return (
        e.stylesheets && e.count === 0 && Nu(e, e.stylesheets),
        0 < e.count || 0 < e.imgCount
          ? function (a) {
              var l = setTimeout(function () {
                if ((e.stylesheets && Nu(e, e.stylesheets), e.unsuspend)) {
                  var o = e.unsuspend;
                  ((e.unsuspend = null), o());
                }
              }, 6e4 + t);
              0 < e.imgBytes && gs === 0 && (gs = 62500 * yy());
              var r = setTimeout(
                function () {
                  if (
                    ((e.waitingForImages = !1),
                    e.count === 0 &&
                      (e.stylesheets && Nu(e, e.stylesheets), e.unsuspend))
                  ) {
                    var o = e.unsuspend;
                    ((e.unsuspend = null), o());
                  }
                },
                (e.imgBytes > gs ? 50 : 800) + t,
              );
              return (
                (e.unsuspend = a),
                function () {
                  ((e.unsuspend = null), clearTimeout(l), clearTimeout(r));
                }
              );
            }
          : null
      );
    }
    function Cu() {
      if (
        (this.count--,
        this.count === 0 && (this.imgCount === 0 || !this.waitingForImages))
      ) {
        if (this.stylesheets) Nu(this, this.stylesheets);
        else if (this.unsuspend) {
          var e = this.unsuspend;
          ((this.unsuspend = null), e());
        }
      }
    }
    var Mu = null;
    function Nu(e, t) {
      ((e.stylesheets = null),
        e.unsuspend !== null &&
          (e.count++,
          (Mu = new Map()),
          t.forEach(xy, e),
          (Mu = null),
          Cu.call(e)));
    }
    function xy(e, t) {
      if (!(t.state.loading & 4)) {
        var a = Mu.get(e);
        if (a) var l = a.get(null);
        else {
          ((a = new Map()), Mu.set(e, a));
          for (
            var r = e.querySelectorAll(
                "link[data-precedence],style[data-precedence]",
              ),
              o = 0;
            o < r.length;
            o++
          ) {
            var f = r[o];
            (f.nodeName === "LINK" || f.getAttribute("media") !== "not all") &&
              (a.set(f.dataset.precedence, f), (l = f));
          }
          l && a.set(null, l);
        }
        ((r = t.instance),
          (f = r.getAttribute("data-precedence")),
          (o = a.get(f) || l),
          o === l && a.set(null, r),
          a.set(f, r),
          this.count++,
          (l = Cu.bind(this)),
          r.addEventListener("load", l),
          r.addEventListener("error", l),
          o
            ? o.parentNode.insertBefore(r, o.nextSibling)
            : ((e = e.nodeType === 9 ? e.head : e),
              e.insertBefore(r, e.firstChild)),
          (t.state.loading |= 4));
      }
    }
    var ll = {
      $$typeof: X,
      Provider: null,
      Consumer: null,
      _currentValue: W,
      _currentValue2: W,
      _threadCount: 0,
    };
    function By(e, t, a, l, r, o, f, m, y) {
      ((this.tag = 1),
        (this.containerInfo = e),
        (this.pingCache = this.current = this.pendingChildren = null),
        (this.timeoutHandle = -1),
        (this.callbackNode =
          this.next =
          this.pendingContext =
          this.context =
          this.cancelPendingCommit =
            null),
        (this.callbackPriority = 0),
        (this.expirationTimes = hr(-1)),
        (this.entangledLanes =
          this.shellSuspendCounter =
          this.errorRecoveryDisabledLanes =
          this.expiredLanes =
          this.warmLanes =
          this.pingedLanes =
          this.suspendedLanes =
          this.pendingLanes =
            0),
        (this.entanglements = hr(0)),
        (this.hiddenUpdates = hr(null)),
        (this.identifierPrefix = l),
        (this.onUncaughtError = r),
        (this.onCaughtError = o),
        (this.onRecoverableError = f),
        (this.pooledCache = null),
        (this.pooledCacheLanes = 0),
        (this.formState = y),
        (this.incompleteTransitions = new Map()));
    }
    function Qy(e, t, a, l, r, o, f, m, y, A, C, D) {
      return (
        (e = new By(e, t, a, f, y, A, C, D, m)),
        (t = 1),
        o === !0 && (t |= 24),
        (o = At(3, null, null, t)),
        (e.current = o),
        (o.stateNode = e),
        (t = Kr()),
        t.refCount++,
        (e.pooledCache = t),
        t.refCount++,
        (o.memoizedState = { element: l, isDehydrated: a, cache: t }),
        Pr(o),
        e
      );
    }
    function $y(e) {
      return e ? ((e = ja), e) : ja;
    }
    function Hd(e, t, a, l, r, o) {
      ((r = $y(r)),
        l.context === null ? (l.context = r) : (l.pendingContext = r),
        (l = ca(t)),
        (l.payload = { element: a }),
        (o = o === void 0 ? null : o),
        o !== null && (l.callback = o),
        (a = fa(e, l, t)),
        a !== null && (gt(a, e, t), Zi(a, e, t)));
    }
    function Vd(e, t) {
      if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
        var a = e.retryLane;
        e.retryLane = a !== 0 && a < t ? a : t;
      }
    }
    function ys(e, t) {
      (Vd(e, t), (e = e.alternate) && Vd(e, t));
    }
    function Gd(e) {
      if (e.tag === 13 || e.tag === 31) {
        var t = ta(e, 67108864);
        (t !== null && gt(t, e, 67108864), ys(e, 67108864));
      }
    }
    function Yd(e) {
      if (e.tag === 13 || e.tag === 31) {
        var t = Zt();
        t = cc(t);
        var a = ta(e, t);
        (a !== null && gt(a, e, t), ys(e, t));
      }
    }
    var Du = !0;
    function Ly(e, t, a, l) {
      var r = U.T;
      U.T = null;
      var o = B.p;
      try {
        ((B.p = 2), ps(e, t, a, l));
      } finally {
        ((B.p = o), (U.T = r));
      }
    }
    function Hy(e, t, a, l) {
      var r = U.T;
      U.T = null;
      var o = B.p;
      try {
        ((B.p = 8), ps(e, t, a, l));
      } finally {
        ((B.p = o), (U.T = r));
      }
    }
    function ps(e, t, a, l) {
      if (Du) {
        var r = bs(l);
        if (r === null) (is(e, t, l, ku, a), Jd(e, l));
        else if (Gy(r, e, t, a, l)) l.stopPropagation();
        else if ((Jd(e, l), t & 4 && -1 < Vy.indexOf(e))) {
          for (; r !== null; ) {
            var o = Ea(r);
            if (o !== null)
              switch (o.tag) {
                case 3:
                  if (
                    ((o = o.stateNode), o.current.memoizedState.isDehydrated)
                  ) {
                    var f = In(o.pendingLanes);
                    if (f !== 0) {
                      var m = o;
                      for (m.pendingLanes |= 2, m.entangledLanes |= 2; f; ) {
                        var y = 1 << (31 - Tt(f));
                        ((m.entanglements[1] |= y), (f &= ~y));
                      }
                      (pn(o), (ve & 6) === 0 && ((vu = St() + 500), Pi(0, !1)));
                    }
                  }
                  break;
                case 31:
                case 13:
                  ((m = ta(o, 2)), m !== null && gt(m, o, 2), yu(), ys(o, 2));
              }
            if (((o = bs(l)), o === null && is(e, t, l, ku, a), o === r)) break;
            r = o;
          }
          r !== null && l.stopPropagation();
        } else is(e, t, l, null, a);
      }
    }
    function bs(e) {
      return ((e = _r(e)), Ss(e));
    }
    var ku = null;
    function Ss(e) {
      if (((ku = null), (e = Aa(e)), e !== null)) {
        var t = d(e);
        if (t === null) e = null;
        else {
          var a = t.tag;
          if (a === 13) {
            if (((e = v(t)), e !== null)) return e;
            e = null;
          } else if (a === 31) {
            if (((e = b(t)), e !== null)) return e;
            e = null;
          } else if (a === 3) {
            if (t.stateNode.current.memoizedState.isDehydrated)
              return t.tag === 3 ? t.stateNode.containerInfo : null;
            e = null;
          } else t !== e && (e = null);
        }
      }
      return ((ku = e), null);
    }
    function Xd(e) {
      switch (e) {
        case "beforetoggle":
        case "cancel":
        case "click":
        case "close":
        case "contextmenu":
        case "copy":
        case "cut":
        case "auxclick":
        case "dblclick":
        case "dragend":
        case "dragstart":
        case "drop":
        case "focusin":
        case "focusout":
        case "input":
        case "invalid":
        case "keydown":
        case "keypress":
        case "keyup":
        case "mousedown":
        case "mouseup":
        case "paste":
        case "pause":
        case "play":
        case "pointercancel":
        case "pointerdown":
        case "pointerup":
        case "ratechange":
        case "reset":
        case "resize":
        case "seeked":
        case "submit":
        case "toggle":
        case "touchcancel":
        case "touchend":
        case "touchstart":
        case "volumechange":
        case "change":
        case "selectionchange":
        case "textInput":
        case "compositionstart":
        case "compositionend":
        case "compositionupdate":
        case "beforeblur":
        case "afterblur":
        case "beforeinput":
        case "blur":
        case "fullscreenchange":
        case "focus":
        case "hashchange":
        case "popstate":
        case "select":
        case "selectstart":
          return 2;
        case "drag":
        case "dragenter":
        case "dragexit":
        case "dragleave":
        case "dragover":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "pointermove":
        case "pointerout":
        case "pointerover":
        case "scroll":
        case "touchmove":
        case "wheel":
        case "mouseenter":
        case "mouseleave":
        case "pointerenter":
        case "pointerleave":
          return 8;
        case "message":
          switch (Zv()) {
            case ac:
              return 2;
            case ic:
              return 8;
            case _l:
            case xv:
              return 32;
            case lc:
              return 268435456;
            default:
              return 32;
          }
        default:
          return 32;
      }
    }
    var _s = !1,
      $n = null,
      Ln = null,
      Hn = null,
      ul = new Map(),
      rl = new Map(),
      Vn = [],
      Vy =
        "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
          " ",
        );
    function Jd(e, t) {
      switch (e) {
        case "focusin":
        case "focusout":
          $n = null;
          break;
        case "dragenter":
        case "dragleave":
          Ln = null;
          break;
        case "mouseover":
        case "mouseout":
          Hn = null;
          break;
        case "pointerover":
        case "pointerout":
          ul.delete(t.pointerId);
          break;
        case "gotpointercapture":
        case "lostpointercapture":
          rl.delete(t.pointerId);
      }
    }
    function ol(e, t, a, l, r, o) {
      return e === null || e.nativeEvent !== o
        ? ((e = {
            blockedOn: t,
            domEventName: a,
            eventSystemFlags: l,
            nativeEvent: o,
            targetContainers: [r],
          }),
          t !== null && ((t = Ea(t)), t !== null && Gd(t)),
          e)
        : ((e.eventSystemFlags |= l),
          (t = e.targetContainers),
          r !== null && t.indexOf(r) === -1 && t.push(r),
          e);
    }
    function Gy(e, t, a, l, r) {
      switch (t) {
        case "focusin":
          return (($n = ol($n, e, t, a, l, r)), !0);
        case "dragenter":
          return ((Ln = ol(Ln, e, t, a, l, r)), !0);
        case "mouseover":
          return ((Hn = ol(Hn, e, t, a, l, r)), !0);
        case "pointerover":
          var o = r.pointerId;
          return (ul.set(o, ol(ul.get(o) || null, e, t, a, l, r)), !0);
        case "gotpointercapture":
          return (
            (o = r.pointerId),
            rl.set(o, ol(rl.get(o) || null, e, t, a, l, r)),
            !0
          );
      }
      return !1;
    }
    function Kd(e) {
      var t = Aa(e.target);
      if (t !== null) {
        var a = d(t);
        if (a !== null) {
          if (((t = a.tag), t === 13)) {
            if (((t = v(a)), t !== null)) {
              ((e.blockedOn = t),
                hc(e.priority, function () {
                  Yd(a);
                }));
              return;
            }
          } else if (t === 31) {
            if (((t = b(a)), t !== null)) {
              ((e.blockedOn = t),
                hc(e.priority, function () {
                  Yd(a);
                }));
              return;
            }
          } else if (
            t === 3 &&
            a.stateNode.current.memoizedState.isDehydrated
          ) {
            e.blockedOn = a.tag === 3 ? a.stateNode.containerInfo : null;
            return;
          }
        }
      }
      e.blockedOn = null;
    }
    function qu(e) {
      if (e.blockedOn !== null) return !1;
      for (var t = e.targetContainers; 0 < t.length; ) {
        var a = bs(e.nativeEvent);
        if (a === null) {
          a = e.nativeEvent;
          var l = new a.constructor(a.type, a);
          ((Sr = l), a.target.dispatchEvent(l), (Sr = null));
        } else return ((t = Ea(a)), t !== null && Gd(t), (e.blockedOn = a), !1);
        t.shift();
      }
      return !0;
    }
    function Id(e, t, a) {
      qu(e) && a.delete(t);
    }
    function Yy() {
      ((_s = !1),
        $n !== null && qu($n) && ($n = null),
        Ln !== null && qu(Ln) && (Ln = null),
        Hn !== null && qu(Hn) && (Hn = null),
        ul.forEach(Id),
        rl.forEach(Id));
    }
    function Uu(e, t) {
      e.blockedOn === t &&
        ((e.blockedOn = null),
        _s ||
          ((_s = !0),
          i.unstable_scheduleCallback(i.unstable_NormalPriority, Yy)));
    }
    var ju = null;
    function Fd(e) {
      ju !== e &&
        ((ju = e),
        i.unstable_scheduleCallback(i.unstable_NormalPriority, function () {
          ju === e && (ju = null);
          for (var t = 0; t < e.length; t += 3) {
            var a = e[t],
              l = e[t + 1],
              r = e[t + 2];
            if (typeof l != "function") {
              if (Ss(l || a) === null) continue;
              break;
            }
            var o = Ea(a);
            o !== null &&
              (e.splice(t, 3),
              (t -= 3),
              So(
                o,
                { pending: !0, data: r, method: a.method, action: l },
                l,
                r,
              ));
          }
        }));
    }
    function ui(e) {
      function t(y) {
        return Uu(y, e);
      }
      ($n !== null && Uu($n, e),
        Ln !== null && Uu(Ln, e),
        Hn !== null && Uu(Hn, e),
        ul.forEach(t),
        rl.forEach(t));
      for (var a = 0; a < Vn.length; a++) {
        var l = Vn[a];
        l.blockedOn === e && (l.blockedOn = null);
      }
      for (; 0 < Vn.length && ((a = Vn[0]), a.blockedOn === null); )
        (Kd(a), a.blockedOn === null && Vn.shift());
      if (((a = (e.ownerDocument || e).$$reactFormReplay), a != null))
        for (l = 0; l < a.length; l += 3) {
          var r = a[l],
            o = a[l + 1],
            f = r[ct] || null;
          if (typeof o == "function") f || Fd(a);
          else if (f) {
            var m = null;
            if (o && o.hasAttribute("formAction")) {
              if (((r = o), (f = o[ct] || null))) m = f.formAction;
              else if (Ss(r) !== null) continue;
            } else m = f.action;
            (typeof m == "function"
              ? (a[l + 1] = m)
              : (a.splice(l, 3), (l -= 3)),
              Fd(a));
          }
        }
    }
    function Xy() {
      function e(o) {
        o.canIntercept &&
          o.info === "react-transition" &&
          o.intercept({
            handler: function () {
              return new Promise(function (f) {
                return (r = f);
              });
            },
            focusReset: "manual",
            scroll: "manual",
          });
      }
      function t() {
        (r !== null && (r(), (r = null)), l || setTimeout(a, 20));
      }
      function a() {
        if (!l && !navigation.transition) {
          var o = navigation.currentEntry;
          o &&
            o.url != null &&
            navigation.navigate(o.url, {
              state: o.getState(),
              info: "react-transition",
              history: "replace",
            });
        }
      }
      if (typeof navigation == "object") {
        var l = !1,
          r = null;
        return (
          navigation.addEventListener("navigate", e),
          navigation.addEventListener("navigatesuccess", t),
          navigation.addEventListener("navigateerror", t),
          setTimeout(a, 100),
          function () {
            ((l = !0),
              navigation.removeEventListener("navigate", e),
              navigation.removeEventListener("navigatesuccess", t),
              navigation.removeEventListener("navigateerror", t),
              r !== null && (r(), (r = null)));
          }
        );
      }
    }
    function Ts(e) {
      this._internalRoot = e;
    }
    ((zs.prototype.render = Ts.prototype.render =
      function (e) {
        var t = this._internalRoot;
        if (t === null) throw Error(s(409));
        var a = t.current;
        Hd(a, Zt(), e, t, null, null);
      }),
      (zs.prototype.unmount = Ts.prototype.unmount =
        function () {
          var e = this._internalRoot;
          if (e !== null) {
            this._internalRoot = null;
            var t = e.containerInfo;
            (Hd(e.current, 2, null, e, null, null), yu(), (t[bi] = null));
          }
        }));
    function zs(e) {
      this._internalRoot = e;
    }
    zs.prototype.unstable_scheduleHydration = function (e) {
      if (e) {
        var t = fc();
        e = { blockedOn: null, target: e, priority: t };
        for (var a = 0; a < Vn.length && t !== 0 && t < Vn[a].priority; a++);
        (Vn.splice(a, 0, e), a === 0 && Kd(e));
      }
    };
    var Wd = u.version;
    if (Wd !== "19.2.7") throw Error(s(527, Wd, "19.2.7"));
    B.findDOMNode = function (e) {
      var t = e._reactInternals;
      if (t === void 0)
        throw typeof e.render == "function"
          ? Error(s(188))
          : ((e = Object.keys(e).join(",")), Error(s(268, e)));
      return (
        (e = _(t)),
        (e = e !== null ? q(e) : null),
        (e = e === null ? null : e.stateNode),
        e
      );
    };
    var Jy = {
      bundleType: 0,
      version: "19.2.7",
      rendererPackageName: "react-dom",
      currentDispatcherRef: U,
      reconcilerVersion: "19.2.7",
    };
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
      var Zu = __REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (!Zu.isDisabled && Zu.supportsFiber)
        try {
          ((yi = Zu.inject(Jy)), (_t = Zu));
        } catch {}
    }
    n.createRoot = function (e, t) {
      if (!h(e)) throw Error(s(299));
      var a = !1,
        l = "",
        r = Hg,
        o = Vg,
        f = Gg;
      return (
        t != null &&
          (t.unstable_strictMode === !0 && (a = !0),
          t.identifierPrefix !== void 0 && (l = t.identifierPrefix),
          t.onUncaughtError !== void 0 && (r = t.onUncaughtError),
          t.onCaughtError !== void 0 && (o = t.onCaughtError),
          t.onRecoverableError !== void 0 && (f = t.onRecoverableError)),
        (t = Qy(e, 1, !1, null, null, a, l, null, r, o, f, Xy)),
        (e[bi] = t.current),
        bd(e),
        new Ts(t)
      );
    };
  }),
  B0 = Pt((n, i) => {
    function u() {
      if (
        !(
          typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
          typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
        )
      )
        try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(u);
        } catch (c) {
          console.error(c);
        }
    }
    (u(), (i.exports = x0()));
  }),
  ET = Object.freeze({ status: "aborted" });
function N(n, i, u) {
  function c(v, b) {
    if (
      (v._zod ||
        Object.defineProperty(v, "_zod", {
          value: { def: b, constr: d, traits: new Set() },
          enumerable: !1,
        }),
      v._zod.traits.has(n))
    )
      return;
    (v._zod.traits.add(n), i(v, b));
    const z = d.prototype,
      _ = Object.keys(z);
    for (let q = 0; q < _.length; q++) {
      const w = _[q];
      w in v || (v[w] = z[w].bind(v));
    }
  }
  const s = u?.Parent ?? Object;
  class h extends s {}
  Object.defineProperty(h, "name", { value: n });
  function d(v) {
    var b;
    const z = u?.Parent ? new h() : this;
    (c(z, v), (b = z._zod).deferred ?? (b.deferred = []));
    for (const _ of z._zod.deferred) _();
    return z;
  }
  return (
    Object.defineProperty(d, "init", { value: c }),
    Object.defineProperty(d, Symbol.hasInstance, {
      value: (v) =>
        u?.Parent && v instanceof u.Parent ? !0 : v?._zod?.traits?.has(n),
    }),
    Object.defineProperty(d, "name", { value: n }),
    d
  );
}
var hi = class extends Error {
    constructor() {
      super(
        "Encountered Promise during synchronous parse. Use .parseAsync() instead.",
      );
    }
  },
  Fm = class extends Error {
    constructor(n) {
      (super(`Encountered unidirectional transform during encode: ${n}`),
        (this.name = "ZodEncodeError"));
    }
  },
  Qs = {};
function _a(n) {
  return (n && Object.assign(Qs, n), Qs);
}
function Wm(n) {
  const i = Object.values(n).filter((u) => typeof u == "number");
  return Object.entries(n)
    .filter(([u, c]) => i.indexOf(+u) === -1)
    .map(([u, c]) => c);
}
function $s(n, i) {
  return typeof i == "bigint" ? i.toString() : i;
}
function Xs(n) {
  return {
    get value() {
      {
        const i = n();
        return (Object.defineProperty(this, "value", { value: i }), i);
      }
      throw new Error("cached value already set");
    },
  };
}
function Js(n) {
  return n == null;
}
function Ks(n) {
  const i = n.startsWith("^") ? 1 : 0,
    u = n.endsWith("$") ? n.length - 1 : n.length;
  return n.slice(i, u);
}
function Q0(n, i) {
  const u = (n.toString().split(".")[1] || "").length,
    c = i.toString();
  let s = (c.split(".")[1] || "").length;
  if (s === 0 && /\d?e-\d?/.test(c)) {
    const d = c.match(/\d?e-(\d?)/);
    d?.[1] && (s = Number.parseInt(d[1]));
  }
  const h = u > s ? u : s;
  return (
    (Number.parseInt(n.toFixed(h).replace(".", "")) %
      Number.parseInt(i.toFixed(h).replace(".", ""))) /
    10 ** h
  );
}
var ym = Symbol("evaluating");
function _e(n, i, u) {
  let c;
  Object.defineProperty(n, i, {
    get() {
      if (c !== ym) return (c === void 0 && ((c = ym), (c = u())), c);
    },
    set(s) {
      Object.defineProperty(n, i, { value: s });
    },
    configurable: !0,
  });
}
function za(n, i, u) {
  Object.defineProperty(n, i, {
    value: u,
    writable: !0,
    enumerable: !0,
    configurable: !0,
  });
}
function Xn(...n) {
  const i = {};
  for (const u of n) {
    const c = Object.getOwnPropertyDescriptors(u);
    Object.assign(i, c);
  }
  return Object.defineProperties({}, i);
}
function pm(n) {
  return JSON.stringify(n);
}
function $0(n) {
  return n
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
var Pm = "captureStackTrace" in Error ? Error.captureStackTrace : (...n) => {};
function Fu(n) {
  return typeof n == "object" && n !== null && !Array.isArray(n);
}
var L0 = Xs(() => {
  if (typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare"))
    return !1;
  try {
    return !1;
  } catch {
    return !1;
  }
});
function yl(n) {
  if (Fu(n) === !1) return !1;
  const i = n.constructor;
  if (i === void 0 || typeof i != "function") return !0;
  const u = i.prototype;
  return !(
    Fu(u) === !1 ||
    Object.prototype.hasOwnProperty.call(u, "isPrototypeOf") === !1
  );
}
function ev(n) {
  return yl(n) ? { ...n } : Array.isArray(n) ? [...n] : n;
}
var H0 = new Set(["string", "number", "symbol"]);
function nr(n) {
  return n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Jn(n, i, u) {
  const c = new n._zod.constr(i ?? n._zod.def);
  return ((!i || u?.parent) && (c._zod.parent = n), c);
}
function Y(n) {
  const i = n;
  if (!i) return {};
  if (typeof i == "string") return { error: () => i };
  if (i?.message !== void 0) {
    if (i?.error !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    i.error = i.message;
  }
  return (
    delete i.message,
    typeof i.error == "string" ? { ...i, error: () => i.error } : i
  );
}
function V0(n) {
  return Object.keys(n).filter(
    (i) => n[i]._zod.optin === "optional" && n[i]._zod.optout === "optional",
  );
}
var G0 = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE],
};
function Y0(n, i) {
  const u = n._zod.def,
    c = u.checks;
  if (c && c.length > 0)
    throw new Error(
      ".pick() cannot be used on object schemas containing refinements",
    );
  return Jn(
    n,
    Xn(n._zod.def, {
      get shape() {
        const s = {};
        for (const h in i) {
          if (!(h in u.shape)) throw new Error(`Unrecognized key: "${h}"`);
          i[h] && (s[h] = u.shape[h]);
        }
        return (za(this, "shape", s), s);
      },
      checks: [],
    }),
  );
}
function X0(n, i) {
  const u = n._zod.def,
    c = u.checks;
  if (c && c.length > 0)
    throw new Error(
      ".omit() cannot be used on object schemas containing refinements",
    );
  return Jn(
    n,
    Xn(n._zod.def, {
      get shape() {
        const s = { ...n._zod.def.shape };
        for (const h in i) {
          if (!(h in u.shape)) throw new Error(`Unrecognized key: "${h}"`);
          i[h] && delete s[h];
        }
        return (za(this, "shape", s), s);
      },
      checks: [],
    }),
  );
}
function J0(n, i) {
  if (!yl(i))
    throw new Error("Invalid input to extend: expected a plain object");
  const u = n._zod.def.checks;
  if (u && u.length > 0) {
    const c = n._zod.def.shape;
    for (const s in i)
      if (Object.getOwnPropertyDescriptor(c, s) !== void 0)
        throw new Error(
          "Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.",
        );
  }
  return Jn(
    n,
    Xn(n._zod.def, {
      get shape() {
        const c = { ...n._zod.def.shape, ...i };
        return (za(this, "shape", c), c);
      },
    }),
  );
}
function K0(n, i) {
  if (!yl(i))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  return Jn(
    n,
    Xn(n._zod.def, {
      get shape() {
        const u = { ...n._zod.def.shape, ...i };
        return (za(this, "shape", u), u);
      },
    }),
  );
}
function I0(n, i) {
  return Jn(
    n,
    Xn(n._zod.def, {
      get shape() {
        const u = { ...n._zod.def.shape, ...i._zod.def.shape };
        return (za(this, "shape", u), u);
      },
      get catchall() {
        return i._zod.def.catchall;
      },
      checks: [],
    }),
  );
}
function F0(n, i, u) {
  const c = i._zod.def.checks;
  if (c && c.length > 0)
    throw new Error(
      ".partial() cannot be used on object schemas containing refinements",
    );
  return Jn(
    i,
    Xn(i._zod.def, {
      get shape() {
        const s = i._zod.def.shape,
          h = { ...s };
        if (u)
          for (const d in u) {
            if (!(d in s)) throw new Error(`Unrecognized key: "${d}"`);
            u[d] &&
              (h[d] = n ? new n({ type: "optional", innerType: s[d] }) : s[d]);
          }
        else
          for (const d in s)
            h[d] = n ? new n({ type: "optional", innerType: s[d] }) : s[d];
        return (za(this, "shape", h), h);
      },
      checks: [],
    }),
  );
}
function W0(n, i, u) {
  return Jn(
    i,
    Xn(i._zod.def, {
      get shape() {
        const c = i._zod.def.shape,
          s = { ...c };
        if (u)
          for (const h in u) {
            if (!(h in s)) throw new Error(`Unrecognized key: "${h}"`);
            u[h] && (s[h] = new n({ type: "nonoptional", innerType: c[h] }));
          }
        else
          for (const h in c)
            s[h] = new n({ type: "nonoptional", innerType: c[h] });
        return (za(this, "shape", s), s);
      },
    }),
  );
}
function ci(n, i = 0) {
  if (n.aborted === !0) return !0;
  for (let u = i; u < n.issues.length; u++)
    if (n.issues[u]?.continue !== !0) return !0;
  return !1;
}
function tv(n, i) {
  return i.map((u) => {
    var c;
    return ((c = u).path ?? (c.path = []), u.path.unshift(n), u);
  });
}
function Qu(n) {
  return typeof n == "string" ? n : n?.message;
}
function Ta(n, i, u) {
  const c = { ...n, path: n.path ?? [] };
  return (
    n.message ||
      (c.message =
        Qu(n.inst?._zod.def?.error?.(n)) ??
        Qu(i?.error?.(n)) ??
        Qu(u.customError?.(n)) ??
        Qu(u.localeError?.(n)) ??
        "Invalid input"),
    delete c.inst,
    delete c.continue,
    i?.reportInput || delete c.input,
    c
  );
}
function Is(n) {
  return Array.isArray(n)
    ? "array"
    : typeof n == "string"
      ? "string"
      : "unknown";
}
function pl(...n) {
  const [i, u, c] = n;
  return typeof i == "string"
    ? { message: i, code: "custom", input: u, inst: c }
    : { ...i };
}
var nv = (n, i) => {
    ((n.name = "$ZodError"),
      Object.defineProperty(n, "_zod", { value: n._zod, enumerable: !1 }),
      Object.defineProperty(n, "issues", { value: i, enumerable: !1 }),
      (n.message = JSON.stringify(i, $s, 2)),
      Object.defineProperty(n, "toString", {
        value: () => n.message,
        enumerable: !1,
      }));
  },
  av = N("$ZodError", nv),
  iv = N("$ZodError", nv, { Parent: Error });
function P0(n, i = (u) => u.message) {
  const u = {},
    c = [];
  for (const s of n.issues)
    s.path.length > 0
      ? ((u[s.path[0]] = u[s.path[0]] || []), u[s.path[0]].push(i(s)))
      : c.push(i(s));
  return { formErrors: c, fieldErrors: u };
}
function eb(n, i = (u) => u.message) {
  const u = { _errors: [] },
    c = (s) => {
      for (const h of s.issues)
        if (h.code === "invalid_union" && h.errors.length)
          h.errors.map((d) => c({ issues: d }));
        else if (h.code === "invalid_key") c({ issues: h.issues });
        else if (h.code === "invalid_element") c({ issues: h.issues });
        else if (h.path.length === 0) u._errors.push(i(h));
        else {
          let d = u,
            v = 0;
          for (; v < h.path.length; ) {
            const b = h.path[v];
            (v !== h.path.length - 1
              ? (d[b] = d[b] || { _errors: [] })
              : ((d[b] = d[b] || { _errors: [] }), d[b]._errors.push(i(h))),
              (d = d[b]),
              v++);
          }
        }
    };
  return (c(n), u);
}
var Fs = (n) => (i, u, c, s) => {
    const h = c ? Object.assign(c, { async: !1 }) : { async: !1 },
      d = i._zod.run({ value: u, issues: [] }, h);
    if (d instanceof Promise) throw new hi();
    if (d.issues.length) {
      const v = new (s?.Err ?? n)(d.issues.map((b) => Ta(b, h, _a())));
      throw (Pm(v, s?.callee), v);
    }
    return d.value;
  },
  Ws = (n) => async (i, u, c, s) => {
    const h = c ? Object.assign(c, { async: !0 }) : { async: !0 };
    let d = i._zod.run({ value: u, issues: [] }, h);
    if ((d instanceof Promise && (d = await d), d.issues.length)) {
      const v = new (s?.Err ?? n)(d.issues.map((b) => Ta(b, h, _a())));
      throw (Pm(v, s?.callee), v);
    }
    return d.value;
  },
  ar = (n) => (i, u, c) => {
    const s = c ? { ...c, async: !1 } : { async: !1 },
      h = i._zod.run({ value: u, issues: [] }, s);
    if (h instanceof Promise) throw new hi();
    return h.issues.length
      ? {
          success: !1,
          error: new (n ?? av)(h.issues.map((d) => Ta(d, s, _a()))),
        }
      : { success: !0, data: h.value };
  },
  tb = ar(iv),
  ir = (n) => async (i, u, c) => {
    const s = c ? Object.assign(c, { async: !0 }) : { async: !0 };
    let h = i._zod.run({ value: u, issues: [] }, s);
    return (
      h instanceof Promise && (h = await h),
      h.issues.length
        ? { success: !1, error: new n(h.issues.map((d) => Ta(d, s, _a()))) }
        : { success: !0, data: h.value }
    );
  },
  nb = ir(iv),
  ab = (n) => (i, u, c) => {
    const s = c
      ? Object.assign(c, { direction: "backward" })
      : { direction: "backward" };
    return Fs(n)(i, u, s);
  },
  ib = (n) => (i, u, c) => Fs(n)(i, u, c),
  lb = (n) => async (i, u, c) => {
    const s = c
      ? Object.assign(c, { direction: "backward" })
      : { direction: "backward" };
    return Ws(n)(i, u, s);
  },
  ub = (n) => async (i, u, c) => Ws(n)(i, u, c),
  rb = (n) => (i, u, c) => {
    const s = c
      ? Object.assign(c, { direction: "backward" })
      : { direction: "backward" };
    return ar(n)(i, u, s);
  },
  ob = (n) => (i, u, c) => ar(n)(i, u, c),
  sb = (n) => async (i, u, c) => {
    const s = c
      ? Object.assign(c, { direction: "backward" })
      : { direction: "backward" };
    return ir(n)(i, u, s);
  },
  cb = (n) => async (i, u, c) => ir(n)(i, u, c),
  fb = /^[cC][^\s-]{8,}$/,
  hb = /^[0-9a-z]+$/,
  db = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/,
  mb = /^[0-9a-vA-V]{20}$/,
  vb = /^[A-Za-z0-9]{27}$/,
  gb = /^[a-zA-Z0-9_-]{21}$/,
  yb =
    /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/,
  pb =
    /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,
  bm = (n) =>
    n
      ? new RegExp(
          `^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${n}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`,
        )
      : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/,
  bb =
    /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,
  Sb = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function _b() {
  return new RegExp(Sb, "u");
}
var Tb =
    /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
  zb =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/,
  Ab =
    /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/,
  Eb =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
  wb =
    /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/,
  lv = /^[A-Za-z0-9_-]*$/,
  Ob = /^\+[1-9]\d{6,14}$/,
  uv =
    "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))",
  Rb = new RegExp(`^${uv}$`);
function rv(n) {
  const i = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof n.precision == "number"
    ? n.precision === -1
      ? `${i}`
      : n.precision === 0
        ? `${i}:[0-5]\\d`
        : `${i}:[0-5]\\d\\.\\d{${n.precision}}`
    : `${i}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Cb(n) {
  return new RegExp(`^${rv(n)}$`);
}
function Mb(n) {
  const i = rv({ precision: n.precision }),
    u = ["Z"];
  (n.local && u.push(""),
    n.offset && u.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)"));
  const c = `${i}(?:${u.join("|")})`;
  return new RegExp(`^${uv}T(?:${c})$`);
}
var Nb = (n) => {
    const i = n
      ? `[\\s\\S]{${n?.minimum ?? 0},${n?.maximum ?? ""}}`
      : "[\\s\\S]*";
    return new RegExp(`^${i}$`);
  },
  Db = /^-?\d+$/,
  kb = /^-?\d+(?:\.\d+)?$/,
  qb = /^(?:true|false)$/i,
  Ub = /^[^A-Z]*$/,
  jb = /^[^a-z]*$/,
  bt = N("$ZodCheck", (n, i) => {
    var u;
    (n._zod ?? (n._zod = {}),
      (n._zod.def = i),
      (u = n._zod).onattach ?? (u.onattach = []));
  }),
  ov = { number: "number", bigint: "bigint", object: "date" },
  sv = N("$ZodCheckLessThan", (n, i) => {
    bt.init(n, i);
    const u = ov[typeof i.value];
    (n._zod.onattach.push((c) => {
      const s = c._zod.bag,
        h =
          (i.inclusive ? s.maximum : s.exclusiveMaximum) ??
          Number.POSITIVE_INFINITY;
      i.value < h &&
        (i.inclusive ? (s.maximum = i.value) : (s.exclusiveMaximum = i.value));
    }),
      (n._zod.check = (c) => {
        (i.inclusive ? c.value <= i.value : c.value < i.value) ||
          c.issues.push({
            origin: u,
            code: "too_big",
            maximum: typeof i.value == "object" ? i.value.getTime() : i.value,
            input: c.value,
            inclusive: i.inclusive,
            inst: n,
            continue: !i.abort,
          });
      }));
  }),
  cv = N("$ZodCheckGreaterThan", (n, i) => {
    bt.init(n, i);
    const u = ov[typeof i.value];
    (n._zod.onattach.push((c) => {
      const s = c._zod.bag,
        h =
          (i.inclusive ? s.minimum : s.exclusiveMinimum) ??
          Number.NEGATIVE_INFINITY;
      i.value > h &&
        (i.inclusive ? (s.minimum = i.value) : (s.exclusiveMinimum = i.value));
    }),
      (n._zod.check = (c) => {
        (i.inclusive ? c.value >= i.value : c.value > i.value) ||
          c.issues.push({
            origin: u,
            code: "too_small",
            minimum: typeof i.value == "object" ? i.value.getTime() : i.value,
            input: c.value,
            inclusive: i.inclusive,
            inst: n,
            continue: !i.abort,
          });
      }));
  }),
  Zb = N("$ZodCheckMultipleOf", (n, i) => {
    (bt.init(n, i),
      n._zod.onattach.push((u) => {
        var c;
        (c = u._zod.bag).multipleOf ?? (c.multipleOf = i.value);
      }),
      (n._zod.check = (u) => {
        if (typeof u.value != typeof i.value)
          throw new Error("Cannot mix number and bigint in multiple_of check.");
        (typeof u.value == "bigint"
          ? u.value % i.value === BigInt(0)
          : Q0(u.value, i.value) === 0) ||
          u.issues.push({
            origin: typeof u.value,
            code: "not_multiple_of",
            divisor: i.value,
            input: u.value,
            inst: n,
            continue: !i.abort,
          });
      }));
  }),
  xb = N("$ZodCheckNumberFormat", (n, i) => {
    (bt.init(n, i), (i.format = i.format || "float64"));
    const u = i.format?.includes("int"),
      c = u ? "int" : "number",
      [s, h] = G0[i.format];
    (n._zod.onattach.push((d) => {
      const v = d._zod.bag;
      ((v.format = i.format),
        (v.minimum = s),
        (v.maximum = h),
        u && (v.pattern = Db));
    }),
      (n._zod.check = (d) => {
        const v = d.value;
        if (u) {
          if (!Number.isInteger(v)) {
            d.issues.push({
              expected: c,
              format: i.format,
              code: "invalid_type",
              continue: !1,
              input: v,
              inst: n,
            });
            return;
          }
          if (!Number.isSafeInteger(v)) {
            v > 0
              ? d.issues.push({
                  input: v,
                  code: "too_big",
                  maximum: Number.MAX_SAFE_INTEGER,
                  note: "Integers must be within the safe integer range.",
                  inst: n,
                  origin: c,
                  inclusive: !0,
                  continue: !i.abort,
                })
              : d.issues.push({
                  input: v,
                  code: "too_small",
                  minimum: Number.MIN_SAFE_INTEGER,
                  note: "Integers must be within the safe integer range.",
                  inst: n,
                  origin: c,
                  inclusive: !0,
                  continue: !i.abort,
                });
            return;
          }
        }
        (v < s &&
          d.issues.push({
            origin: "number",
            input: v,
            code: "too_small",
            minimum: s,
            inclusive: !0,
            inst: n,
            continue: !i.abort,
          }),
          v > h &&
            d.issues.push({
              origin: "number",
              input: v,
              code: "too_big",
              maximum: h,
              inclusive: !0,
              inst: n,
              continue: !i.abort,
            }));
      }));
  }),
  Bb = N("$ZodCheckMaxLength", (n, i) => {
    var u;
    (bt.init(n, i),
      (u = n._zod.def).when ??
        (u.when = (c) => {
          const s = c.value;
          return !Js(s) && s.length !== void 0;
        }),
      n._zod.onattach.push((c) => {
        const s = c._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
        i.maximum < s && (c._zod.bag.maximum = i.maximum);
      }),
      (n._zod.check = (c) => {
        const s = c.value;
        if (s.length <= i.maximum) return;
        const h = Is(s);
        c.issues.push({
          origin: h,
          code: "too_big",
          maximum: i.maximum,
          inclusive: !0,
          input: s,
          inst: n,
          continue: !i.abort,
        });
      }));
  }),
  Qb = N("$ZodCheckMinLength", (n, i) => {
    var u;
    (bt.init(n, i),
      (u = n._zod.def).when ??
        (u.when = (c) => {
          const s = c.value;
          return !Js(s) && s.length !== void 0;
        }),
      n._zod.onattach.push((c) => {
        const s = c._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
        i.minimum > s && (c._zod.bag.minimum = i.minimum);
      }),
      (n._zod.check = (c) => {
        const s = c.value;
        if (s.length >= i.minimum) return;
        const h = Is(s);
        c.issues.push({
          origin: h,
          code: "too_small",
          minimum: i.minimum,
          inclusive: !0,
          input: s,
          inst: n,
          continue: !i.abort,
        });
      }));
  }),
  $b = N("$ZodCheckLengthEquals", (n, i) => {
    var u;
    (bt.init(n, i),
      (u = n._zod.def).when ??
        (u.when = (c) => {
          const s = c.value;
          return !Js(s) && s.length !== void 0;
        }),
      n._zod.onattach.push((c) => {
        const s = c._zod.bag;
        ((s.minimum = i.length), (s.maximum = i.length), (s.length = i.length));
      }),
      (n._zod.check = (c) => {
        const s = c.value,
          h = s.length;
        if (h === i.length) return;
        const d = Is(s),
          v = h > i.length;
        c.issues.push({
          origin: d,
          ...(v
            ? { code: "too_big", maximum: i.length }
            : { code: "too_small", minimum: i.length }),
          inclusive: !0,
          exact: !0,
          input: c.value,
          inst: n,
          continue: !i.abort,
        });
      }));
  }),
  lr = N("$ZodCheckStringFormat", (n, i) => {
    var u, c;
    (bt.init(n, i),
      n._zod.onattach.push((s) => {
        const h = s._zod.bag;
        ((h.format = i.format),
          i.pattern &&
            (h.patterns ?? (h.patterns = new Set()),
            h.patterns.add(i.pattern)));
      }),
      i.pattern
        ? ((u = n._zod).check ??
          (u.check = (s) => {
            ((i.pattern.lastIndex = 0),
              !i.pattern.test(s.value) &&
                s.issues.push({
                  origin: "string",
                  code: "invalid_format",
                  format: i.format,
                  input: s.value,
                  ...(i.pattern ? { pattern: i.pattern.toString() } : {}),
                  inst: n,
                  continue: !i.abort,
                }));
          }))
        : ((c = n._zod).check ?? (c.check = () => {})));
  }),
  Lb = N("$ZodCheckRegex", (n, i) => {
    (lr.init(n, i),
      (n._zod.check = (u) => {
        ((i.pattern.lastIndex = 0),
          !i.pattern.test(u.value) &&
            u.issues.push({
              origin: "string",
              code: "invalid_format",
              format: "regex",
              input: u.value,
              pattern: i.pattern.toString(),
              inst: n,
              continue: !i.abort,
            }));
      }));
  }),
  Hb = N("$ZodCheckLowerCase", (n, i) => {
    (i.pattern ?? (i.pattern = Ub), lr.init(n, i));
  }),
  Vb = N("$ZodCheckUpperCase", (n, i) => {
    (i.pattern ?? (i.pattern = jb), lr.init(n, i));
  }),
  Gb = N("$ZodCheckIncludes", (n, i) => {
    bt.init(n, i);
    const u = nr(i.includes),
      c = new RegExp(
        typeof i.position == "number" ? `^.{${i.position}}${u}` : u,
      );
    ((i.pattern = c),
      n._zod.onattach.push((s) => {
        const h = s._zod.bag;
        (h.patterns ?? (h.patterns = new Set()), h.patterns.add(c));
      }),
      (n._zod.check = (s) => {
        s.value.includes(i.includes, i.position) ||
          s.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "includes",
            includes: i.includes,
            input: s.value,
            inst: n,
            continue: !i.abort,
          });
      }));
  }),
  Yb = N("$ZodCheckStartsWith", (n, i) => {
    bt.init(n, i);
    const u = new RegExp(`^${nr(i.prefix)}.*`);
    (i.pattern ?? (i.pattern = u),
      n._zod.onattach.push((c) => {
        const s = c._zod.bag;
        (s.patterns ?? (s.patterns = new Set()), s.patterns.add(u));
      }),
      (n._zod.check = (c) => {
        c.value.startsWith(i.prefix) ||
          c.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "starts_with",
            prefix: i.prefix,
            input: c.value,
            inst: n,
            continue: !i.abort,
          });
      }));
  }),
  Xb = N("$ZodCheckEndsWith", (n, i) => {
    bt.init(n, i);
    const u = new RegExp(`.*${nr(i.suffix)}$`);
    (i.pattern ?? (i.pattern = u),
      n._zod.onattach.push((c) => {
        const s = c._zod.bag;
        (s.patterns ?? (s.patterns = new Set()), s.patterns.add(u));
      }),
      (n._zod.check = (c) => {
        c.value.endsWith(i.suffix) ||
          c.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "ends_with",
            suffix: i.suffix,
            input: c.value,
            inst: n,
            continue: !i.abort,
          });
      }));
  }),
  Jb = N("$ZodCheckOverwrite", (n, i) => {
    (bt.init(n, i),
      (n._zod.check = (u) => {
        u.value = i.tx(u.value);
      }));
  }),
  Kb = class {
    constructor(n = []) {
      ((this.content = []), (this.indent = 0), this && (this.args = n));
    }
    indented(n) {
      ((this.indent += 1), n(this), (this.indent -= 1));
    }
    write(n) {
      if (typeof n == "function") {
        (n(this, { execution: "sync" }), n(this, { execution: "async" }));
        return;
      }
      const i = n
          .split(
            `
`,
          )
          .filter((s) => s),
        u = Math.min(...i.map((s) => s.length - s.trimStart().length)),
        c = i
          .map((s) => s.slice(u))
          .map((s) => " ".repeat(this.indent * 2) + s);
      for (const s of c) this.content.push(s);
    }
    compile() {
      const n = Function,
        i = this?.args,
        u = [...(this?.content ?? [""]).map((c) => `  ${c}`)];
      return new n(
        ...i,
        u.join(`
`),
      );
    }
  },
  Ib = { major: 4, minor: 3, patch: 5 },
  Le = N("$ZodType", (n, i) => {
    var u;
    (n ?? (n = {}),
      (n._zod.def = i),
      (n._zod.bag = n._zod.bag || {}),
      (n._zod.version = Ib));
    const c = [...(n._zod.def.checks ?? [])];
    n._zod.traits.has("$ZodCheck") && c.unshift(n);
    for (const s of c) for (const h of s._zod.onattach) h(n);
    if (c.length === 0)
      ((u = n._zod).deferred ?? (u.deferred = []),
        n._zod.deferred?.push(() => {
          n._zod.run = n._zod.parse;
        }));
    else {
      const s = (d, v, b) => {
          let z = ci(d),
            _;
          for (const q of v) {
            if (q._zod.def.when) {
              if (!q._zod.def.when(d)) continue;
            } else if (z) continue;
            const w = d.issues.length,
              x = q._zod.check(d);
            if (x instanceof Promise && b?.async === !1) throw new hi();
            if (_ || x instanceof Promise)
              _ = (_ ?? Promise.resolve()).then(async () => {
                (await x, d.issues.length !== w && (z || (z = ci(d, w))));
              });
            else {
              if (d.issues.length === w) continue;
              z || (z = ci(d, w));
            }
          }
          return _ ? _.then(() => d) : d;
        },
        h = (d, v, b) => {
          if (ci(d)) return ((d.aborted = !0), d);
          const z = s(v, c, b);
          if (z instanceof Promise) {
            if (b.async === !1) throw new hi();
            return z.then((_) => n._zod.parse(_, b));
          }
          return n._zod.parse(z, b);
        };
      n._zod.run = (d, v) => {
        if (v.skipChecks) return n._zod.parse(d, v);
        if (v.direction === "backward") {
          const z = n._zod.parse(
            { value: d.value, issues: [] },
            { ...v, skipChecks: !0 },
          );
          return z instanceof Promise ? z.then((_) => h(_, d, v)) : h(z, d, v);
        }
        const b = n._zod.parse(d, v);
        if (b instanceof Promise) {
          if (v.async === !1) throw new hi();
          return b.then((z) => s(z, c, v));
        }
        return s(b, c, v);
      };
    }
    _e(n, "~standard", () => ({
      validate: (s) => {
        try {
          const h = tb(n, s);
          return h.success ? { value: h.data } : { issues: h.error?.issues };
        } catch {
          return nb(n, s).then((d) =>
            d.success ? { value: d.data } : { issues: d.error?.issues },
          );
        }
      },
      vendor: "zod",
      version: 1,
    }));
  }),
  Ps = N("$ZodString", (n, i) => {
    (Le.init(n, i),
      (n._zod.pattern =
        [...(n?._zod.bag?.patterns ?? [])].pop() ?? Nb(n._zod.bag)),
      (n._zod.parse = (u, c) => {
        if (i.coerce)
          try {
            u.value = String(u.value);
          } catch {}
        return (
          typeof u.value == "string" ||
            u.issues.push({
              expected: "string",
              code: "invalid_type",
              input: u.value,
              inst: n,
            }),
          u
        );
      }));
  }),
  Me = N("$ZodStringFormat", (n, i) => {
    (lr.init(n, i), Ps.init(n, i));
  }),
  Fb = N("$ZodGUID", (n, i) => {
    (i.pattern ?? (i.pattern = pb), Me.init(n, i));
  }),
  Wb = N("$ZodUUID", (n, i) => {
    if (i.version) {
      const u = { v1: 1, v2: 2, v3: 3, v4: 4, v5: 5, v6: 6, v7: 7, v8: 8 }[
        i.version
      ];
      if (u === void 0) throw new Error(`Invalid UUID version: "${i.version}"`);
      i.pattern ?? (i.pattern = bm(u));
    } else i.pattern ?? (i.pattern = bm());
    Me.init(n, i);
  }),
  Pb = N("$ZodEmail", (n, i) => {
    (i.pattern ?? (i.pattern = bb), Me.init(n, i));
  }),
  e1 = N("$ZodURL", (n, i) => {
    (Me.init(n, i),
      (n._zod.check = (u) => {
        try {
          const c = u.value.trim(),
            s = new URL(c);
          (i.hostname &&
            ((i.hostname.lastIndex = 0),
            i.hostname.test(s.hostname) ||
              u.issues.push({
                code: "invalid_format",
                format: "url",
                note: "Invalid hostname",
                pattern: i.hostname.source,
                input: u.value,
                inst: n,
                continue: !i.abort,
              })),
            i.protocol &&
              ((i.protocol.lastIndex = 0),
              i.protocol.test(
                s.protocol.endsWith(":") ? s.protocol.slice(0, -1) : s.protocol,
              ) ||
                u.issues.push({
                  code: "invalid_format",
                  format: "url",
                  note: "Invalid protocol",
                  pattern: i.protocol.source,
                  input: u.value,
                  inst: n,
                  continue: !i.abort,
                })),
            i.normalize ? (u.value = s.href) : (u.value = c));
          return;
        } catch {
          u.issues.push({
            code: "invalid_format",
            format: "url",
            input: u.value,
            inst: n,
            continue: !i.abort,
          });
        }
      }));
  }),
  t1 = N("$ZodEmoji", (n, i) => {
    (i.pattern ?? (i.pattern = _b()), Me.init(n, i));
  }),
  n1 = N("$ZodNanoID", (n, i) => {
    (i.pattern ?? (i.pattern = gb), Me.init(n, i));
  }),
  a1 = N("$ZodCUID", (n, i) => {
    (i.pattern ?? (i.pattern = fb), Me.init(n, i));
  }),
  i1 = N("$ZodCUID2", (n, i) => {
    (i.pattern ?? (i.pattern = hb), Me.init(n, i));
  }),
  l1 = N("$ZodULID", (n, i) => {
    (i.pattern ?? (i.pattern = db), Me.init(n, i));
  }),
  u1 = N("$ZodXID", (n, i) => {
    (i.pattern ?? (i.pattern = mb), Me.init(n, i));
  }),
  r1 = N("$ZodKSUID", (n, i) => {
    (i.pattern ?? (i.pattern = vb), Me.init(n, i));
  }),
  o1 = N("$ZodISODateTime", (n, i) => {
    (i.pattern ?? (i.pattern = Mb(i)), Me.init(n, i));
  }),
  s1 = N("$ZodISODate", (n, i) => {
    (i.pattern ?? (i.pattern = Rb), Me.init(n, i));
  }),
  c1 = N("$ZodISOTime", (n, i) => {
    (i.pattern ?? (i.pattern = Cb(i)), Me.init(n, i));
  }),
  f1 = N("$ZodISODuration", (n, i) => {
    (i.pattern ?? (i.pattern = yb), Me.init(n, i));
  }),
  h1 = N("$ZodIPv4", (n, i) => {
    (i.pattern ?? (i.pattern = Tb),
      Me.init(n, i),
      (n._zod.bag.format = "ipv4"));
  }),
  d1 = N("$ZodIPv6", (n, i) => {
    (i.pattern ?? (i.pattern = zb),
      Me.init(n, i),
      (n._zod.bag.format = "ipv6"),
      (n._zod.check = (u) => {
        try {
          new URL(`http://[${u.value}]`);
        } catch {
          u.issues.push({
            code: "invalid_format",
            format: "ipv6",
            input: u.value,
            inst: n,
            continue: !i.abort,
          });
        }
      }));
  }),
  m1 = N("$ZodCIDRv4", (n, i) => {
    (i.pattern ?? (i.pattern = Ab), Me.init(n, i));
  }),
  v1 = N("$ZodCIDRv6", (n, i) => {
    (i.pattern ?? (i.pattern = Eb),
      Me.init(n, i),
      (n._zod.check = (u) => {
        const c = u.value.split("/");
        try {
          if (c.length !== 2) throw new Error();
          const [s, h] = c;
          if (!h) throw new Error();
          const d = Number(h);
          if (`${d}` !== h) throw new Error();
          if (d < 0 || d > 128) throw new Error();
          new URL(`http://[${s}]`);
        } catch {
          u.issues.push({
            code: "invalid_format",
            format: "cidrv6",
            input: u.value,
            inst: n,
            continue: !i.abort,
          });
        }
      }));
  });
function fv(n) {
  if (n === "") return !0;
  if (n.length % 4 !== 0) return !1;
  try {
    return (atob(n), !0);
  } catch {
    return !1;
  }
}
var g1 = N("$ZodBase64", (n, i) => {
  (i.pattern ?? (i.pattern = wb),
    Me.init(n, i),
    (n._zod.bag.contentEncoding = "base64"),
    (n._zod.check = (u) => {
      fv(u.value) ||
        u.issues.push({
          code: "invalid_format",
          format: "base64",
          input: u.value,
          inst: n,
          continue: !i.abort,
        });
    }));
});
function y1(n) {
  if (!lv.test(n)) return !1;
  const i = n.replace(/[-_]/g, (u) => (u === "-" ? "+" : "/"));
  return fv(i.padEnd(Math.ceil(i.length / 4) * 4, "="));
}
var p1 = N("$ZodBase64URL", (n, i) => {
    (i.pattern ?? (i.pattern = lv),
      Me.init(n, i),
      (n._zod.bag.contentEncoding = "base64url"),
      (n._zod.check = (u) => {
        y1(u.value) ||
          u.issues.push({
            code: "invalid_format",
            format: "base64url",
            input: u.value,
            inst: n,
            continue: !i.abort,
          });
      }));
  }),
  b1 = N("$ZodE164", (n, i) => {
    (i.pattern ?? (i.pattern = Ob), Me.init(n, i));
  });
function S1(n, i = null) {
  try {
    const u = n.split(".");
    if (u.length !== 3) return !1;
    const [c] = u;
    if (!c) return !1;
    const s = JSON.parse(atob(c));
    return !(
      ("typ" in s && s?.typ !== "JWT") ||
      !s.alg ||
      (i && (!("alg" in s) || s.alg !== i))
    );
  } catch {
    return !1;
  }
}
var _1 = N("$ZodJWT", (n, i) => {
    (Me.init(n, i),
      (n._zod.check = (u) => {
        S1(u.value, i.alg) ||
          u.issues.push({
            code: "invalid_format",
            format: "jwt",
            input: u.value,
            inst: n,
            continue: !i.abort,
          });
      }));
  }),
  hv = N("$ZodNumber", (n, i) => {
    (Le.init(n, i),
      (n._zod.pattern = n._zod.bag.pattern ?? kb),
      (n._zod.parse = (u, c) => {
        if (i.coerce)
          try {
            u.value = Number(u.value);
          } catch {}
        const s = u.value;
        if (typeof s == "number" && !Number.isNaN(s) && Number.isFinite(s))
          return u;
        const h =
          typeof s == "number"
            ? Number.isNaN(s)
              ? "NaN"
              : Number.isFinite(s)
                ? void 0
                : "Infinity"
            : void 0;
        return (
          u.issues.push({
            expected: "number",
            code: "invalid_type",
            input: s,
            inst: n,
            ...(h ? { received: h } : {}),
          }),
          u
        );
      }));
  }),
  T1 = N("$ZodNumberFormat", (n, i) => {
    (xb.init(n, i), hv.init(n, i));
  }),
  z1 = N("$ZodBoolean", (n, i) => {
    (Le.init(n, i),
      (n._zod.pattern = qb),
      (n._zod.parse = (u, c) => {
        if (i.coerce)
          try {
            u.value = !!u.value;
          } catch {}
        const s = u.value;
        return (
          typeof s == "boolean" ||
            u.issues.push({
              expected: "boolean",
              code: "invalid_type",
              input: s,
              inst: n,
            }),
          u
        );
      }));
  }),
  A1 = N("$ZodUnknown", (n, i) => {
    (Le.init(n, i), (n._zod.parse = (u) => u));
  }),
  E1 = N("$ZodNever", (n, i) => {
    (Le.init(n, i),
      (n._zod.parse = (u, c) => (
        u.issues.push({
          expected: "never",
          code: "invalid_type",
          input: u.value,
          inst: n,
        }),
        u
      )));
  });
function Sm(n, i, u) {
  (n.issues.length && i.issues.push(...tv(u, n.issues)),
    (i.value[u] = n.value));
}
var w1 = N("$ZodArray", (n, i) => {
  (Le.init(n, i),
    (n._zod.parse = (u, c) => {
      const s = u.value;
      if (!Array.isArray(s))
        return (
          u.issues.push({
            expected: "array",
            code: "invalid_type",
            input: s,
            inst: n,
          }),
          u
        );
      u.value = Array(s.length);
      const h = [];
      for (let d = 0; d < s.length; d++) {
        const v = s[d],
          b = i.element._zod.run({ value: v, issues: [] }, c);
        b instanceof Promise ? h.push(b.then((z) => Sm(z, u, d))) : Sm(b, u, d);
      }
      return h.length ? Promise.all(h).then(() => u) : u;
    }));
});
function Wu(n, i, u, c, s) {
  if (n.issues.length) {
    if (s && !(u in c)) return;
    i.issues.push(...tv(u, n.issues));
  }
  n.value === void 0 ? u in c && (i.value[u] = void 0) : (i.value[u] = n.value);
}
function dv(n) {
  const i = Object.keys(n.shape);
  for (const c of i)
    if (!n.shape?.[c]?._zod?.traits?.has("$ZodType"))
      throw new Error(`Invalid element at key "${c}": expected a Zod schema`);
  const u = V0(n.shape);
  return {
    ...n,
    keys: i,
    keySet: new Set(i),
    numKeys: i.length,
    optionalKeys: new Set(u),
  };
}
function mv(n, i, u, c, s, h) {
  const d = [],
    v = s.keySet,
    b = s.catchall._zod,
    z = b.def.type,
    _ = b.optout === "optional";
  for (const q in i) {
    if (v.has(q)) continue;
    if (z === "never") {
      d.push(q);
      continue;
    }
    const w = b.run({ value: i[q], issues: [] }, c);
    w instanceof Promise
      ? n.push(w.then((x) => Wu(x, u, q, i, _)))
      : Wu(w, u, q, i, _);
  }
  return (
    d.length &&
      u.issues.push({ code: "unrecognized_keys", keys: d, input: i, inst: h }),
    n.length ? Promise.all(n).then(() => u) : u
  );
}
var O1 = N("$ZodObject", (n, i) => {
    if ((Le.init(n, i), !Object.getOwnPropertyDescriptor(i, "shape")?.get)) {
      const d = i.shape;
      Object.defineProperty(i, "shape", {
        get: () => {
          const v = { ...d };
          return (Object.defineProperty(i, "shape", { value: v }), v);
        },
      });
    }
    const u = Xs(() => dv(i));
    _e(n._zod, "propValues", () => {
      const d = i.shape,
        v = {};
      for (const b in d) {
        const z = d[b]._zod;
        if (z.values) {
          v[b] ?? (v[b] = new Set());
          for (const _ of z.values) v[b].add(_);
        }
      }
      return v;
    });
    const c = Fu,
      s = i.catchall;
    let h;
    n._zod.parse = (d, v) => {
      h ?? (h = u.value);
      const b = d.value;
      if (!c(b))
        return (
          d.issues.push({
            expected: "object",
            code: "invalid_type",
            input: b,
            inst: n,
          }),
          d
        );
      d.value = {};
      const z = [],
        _ = h.shape;
      for (const q of h.keys) {
        const w = _[q],
          x = w._zod.optout === "optional",
          K = w._zod.run({ value: b[q], issues: [] }, v);
        K instanceof Promise
          ? z.push(K.then((Te) => Wu(Te, d, q, b, x)))
          : Wu(K, d, q, b, x);
      }
      return s
        ? mv(z, b, d, v, u.value, n)
        : z.length
          ? Promise.all(z).then(() => d)
          : d;
    };
  }),
  R1 = N("$ZodObjectJIT", (n, i) => {
    O1.init(n, i);
    const u = n._zod.parse,
      c = Xs(() => dv(i)),
      s = (w) => {
        const x = new Kb(["shape", "payload", "ctx"]),
          K = c.value,
          Te = (P) => {
            const X = pm(P);
            return `shape[${X}]._zod.run({ value: input[${X}], issues: [] }, ctx)`;
          };
        x.write("const input = payload.value;");
        const xe = Object.create(null);
        let Fe = 0;
        for (const P of K.keys) xe[P] = `key_${Fe++}`;
        x.write("const newResult = {};");
        for (const P of K.keys) {
          const X = xe[P],
            ne = pm(P),
            ae = w[P]?._zod?.optout === "optional";
          (x.write(`const ${X} = ${Te(P)};`),
            ae
              ? x.write(`
        if (${X}.issues.length) {
          if (${ne} in input) {
            payload.issues = payload.issues.concat(${X}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${ne}, ...iss.path] : [${ne}]
            })));
          }
        }

        if (${X}.value === undefined) {
          if (${ne} in input) {
            newResult[${ne}] = undefined;
          }
        } else {
          newResult[${ne}] = ${X}.value;
        }

      `)
              : x.write(`
        if (${X}.issues.length) {
          payload.issues = payload.issues.concat(${X}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${ne}, ...iss.path] : [${ne}]
          })));
        }

        if (${X}.value === undefined) {
          if (${ne} in input) {
            newResult[${ne}] = undefined;
          }
        } else {
          newResult[${ne}] = ${X}.value;
        }

      `));
        }
        (x.write("payload.value = newResult;"), x.write("return payload;"));
        const qe = x.compile();
        return (P, X) => qe(w, P, X);
      };
    let h;
    const d = Fu,
      v = !Qs.jitless,
      z = v && L0.value,
      _ = i.catchall;
    let q;
    n._zod.parse = (w, x) => {
      q ?? (q = c.value);
      const K = w.value;
      return d(K)
        ? v && z && x?.async === !1 && x.jitless !== !0
          ? (h || (h = s(i.shape)),
            (w = h(w, x)),
            _ ? mv([], K, w, x, q, n) : w)
          : u(w, x)
        : (w.issues.push({
            expected: "object",
            code: "invalid_type",
            input: K,
            inst: n,
          }),
          w);
    };
  });
function _m(n, i, u, c) {
  for (const h of n) if (h.issues.length === 0) return ((i.value = h.value), i);
  const s = n.filter((h) => !ci(h));
  return s.length === 1
    ? ((i.value = s[0].value), s[0])
    : (i.issues.push({
        code: "invalid_union",
        input: i.value,
        inst: u,
        errors: n.map((h) => h.issues.map((d) => Ta(d, c, _a()))),
      }),
      i);
}
var C1 = N("$ZodUnion", (n, i) => {
    (Le.init(n, i),
      _e(n._zod, "optin", () =>
        i.options.some((s) => s._zod.optin === "optional")
          ? "optional"
          : void 0,
      ),
      _e(n._zod, "optout", () =>
        i.options.some((s) => s._zod.optout === "optional")
          ? "optional"
          : void 0,
      ),
      _e(n._zod, "values", () => {
        if (i.options.every((s) => s._zod.values))
          return new Set(i.options.flatMap((s) => Array.from(s._zod.values)));
      }),
      _e(n._zod, "pattern", () => {
        if (i.options.every((s) => s._zod.pattern)) {
          const s = i.options.map((h) => h._zod.pattern);
          return new RegExp(`^(${s.map((h) => Ks(h.source)).join("|")})$`);
        }
      }));
    const u = i.options.length === 1,
      c = i.options[0]._zod.run;
    n._zod.parse = (s, h) => {
      if (u) return c(s, h);
      let d = !1;
      const v = [];
      for (const b of i.options) {
        const z = b._zod.run({ value: s.value, issues: [] }, h);
        if (z instanceof Promise) (v.push(z), (d = !0));
        else {
          if (z.issues.length === 0) return z;
          v.push(z);
        }
      }
      return d ? Promise.all(v).then((b) => _m(b, s, n, h)) : _m(v, s, n, h);
    };
  }),
  M1 = N("$ZodIntersection", (n, i) => {
    (Le.init(n, i),
      (n._zod.parse = (u, c) => {
        const s = u.value,
          h = i.left._zod.run({ value: s, issues: [] }, c),
          d = i.right._zod.run({ value: s, issues: [] }, c);
        return h instanceof Promise || d instanceof Promise
          ? Promise.all([h, d]).then(([v, b]) => Tm(u, v, b))
          : Tm(u, h, d);
      }));
  });
function Ls(n, i) {
  if (n === i) return { valid: !0, data: n };
  if (n instanceof Date && i instanceof Date && +n == +i)
    return { valid: !0, data: n };
  if (yl(n) && yl(i)) {
    const u = Object.keys(i),
      c = Object.keys(n).filter((h) => u.indexOf(h) !== -1),
      s = { ...n, ...i };
    for (const h of c) {
      const d = Ls(n[h], i[h]);
      if (!d.valid)
        return { valid: !1, mergeErrorPath: [h, ...d.mergeErrorPath] };
      s[h] = d.data;
    }
    return { valid: !0, data: s };
  }
  if (Array.isArray(n) && Array.isArray(i)) {
    if (n.length !== i.length) return { valid: !1, mergeErrorPath: [] };
    const u = [];
    for (let c = 0; c < n.length; c++) {
      const s = n[c],
        h = i[c],
        d = Ls(s, h);
      if (!d.valid)
        return { valid: !1, mergeErrorPath: [c, ...d.mergeErrorPath] };
      u.push(d.data);
    }
    return { valid: !0, data: u };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function Tm(n, i, u) {
  const c = new Map();
  let s;
  for (const v of i.issues)
    if (v.code === "unrecognized_keys") {
      s ?? (s = v);
      for (const b of v.keys) (c.has(b) || c.set(b, {}), (c.get(b).l = !0));
    } else n.issues.push(v);
  for (const v of u.issues)
    if (v.code === "unrecognized_keys")
      for (const b of v.keys) (c.has(b) || c.set(b, {}), (c.get(b).r = !0));
    else n.issues.push(v);
  const h = [...c].filter(([, v]) => v.l && v.r).map(([v]) => v);
  if ((h.length && s && n.issues.push({ ...s, keys: h }), ci(n))) return n;
  const d = Ls(i.value, u.value);
  if (!d.valid)
    throw new Error(
      `Unmergable intersection. Error path: ${JSON.stringify(d.mergeErrorPath)}`,
    );
  return ((n.value = d.data), n);
}
var N1 = N("$ZodEnum", (n, i) => {
    Le.init(n, i);
    const u = Wm(i.entries),
      c = new Set(u);
    ((n._zod.values = c),
      (n._zod.pattern = new RegExp(
        `^(${u
          .filter((s) => H0.has(typeof s))
          .map((s) => (typeof s == "string" ? nr(s) : s.toString()))
          .join("|")})$`,
      )),
      (n._zod.parse = (s, h) => {
        const d = s.value;
        return (
          c.has(d) ||
            s.issues.push({
              code: "invalid_value",
              values: u,
              input: d,
              inst: n,
            }),
          s
        );
      }));
  }),
  D1 = N("$ZodTransform", (n, i) => {
    (Le.init(n, i),
      (n._zod.parse = (u, c) => {
        if (c.direction === "backward") throw new Fm(n.constructor.name);
        const s = i.transform(u.value, u);
        if (c.async)
          return (s instanceof Promise ? s : Promise.resolve(s)).then(
            (h) => ((u.value = h), u),
          );
        if (s instanceof Promise) throw new hi();
        return ((u.value = s), u);
      }));
  });
function zm(n, i) {
  return n.issues.length && i === void 0 ? { issues: [], value: void 0 } : n;
}
var vv = N("$ZodOptional", (n, i) => {
    (Le.init(n, i),
      (n._zod.optin = "optional"),
      (n._zod.optout = "optional"),
      _e(n._zod, "values", () =>
        i.innerType._zod.values
          ? new Set([...i.innerType._zod.values, void 0])
          : void 0,
      ),
      _e(n._zod, "pattern", () => {
        const u = i.innerType._zod.pattern;
        return u ? new RegExp(`^(${Ks(u.source)})?$`) : void 0;
      }),
      (n._zod.parse = (u, c) => {
        if (i.innerType._zod.optin === "optional") {
          const s = i.innerType._zod.run(u, c);
          return s instanceof Promise
            ? s.then((h) => zm(h, u.value))
            : zm(s, u.value);
        }
        return u.value === void 0 ? u : i.innerType._zod.run(u, c);
      }));
  }),
  k1 = N("$ZodExactOptional", (n, i) => {
    (vv.init(n, i),
      _e(n._zod, "values", () => i.innerType._zod.values),
      _e(n._zod, "pattern", () => i.innerType._zod.pattern),
      (n._zod.parse = (u, c) => i.innerType._zod.run(u, c)));
  }),
  q1 = N("$ZodNullable", (n, i) => {
    (Le.init(n, i),
      _e(n._zod, "optin", () => i.innerType._zod.optin),
      _e(n._zod, "optout", () => i.innerType._zod.optout),
      _e(n._zod, "pattern", () => {
        const u = i.innerType._zod.pattern;
        return u ? new RegExp(`^(${Ks(u.source)}|null)$`) : void 0;
      }),
      _e(n._zod, "values", () =>
        i.innerType._zod.values
          ? new Set([...i.innerType._zod.values, null])
          : void 0,
      ),
      (n._zod.parse = (u, c) =>
        u.value === null ? u : i.innerType._zod.run(u, c)));
  }),
  U1 = N("$ZodDefault", (n, i) => {
    (Le.init(n, i),
      (n._zod.optin = "optional"),
      _e(n._zod, "values", () => i.innerType._zod.values),
      (n._zod.parse = (u, c) => {
        if (c.direction === "backward") return i.innerType._zod.run(u, c);
        if (u.value === void 0) return ((u.value = i.defaultValue), u);
        const s = i.innerType._zod.run(u, c);
        return s instanceof Promise ? s.then((h) => Am(h, i)) : Am(s, i);
      }));
  });
function Am(n, i) {
  return (n.value === void 0 && (n.value = i.defaultValue), n);
}
var j1 = N("$ZodPrefault", (n, i) => {
    (Le.init(n, i),
      (n._zod.optin = "optional"),
      _e(n._zod, "values", () => i.innerType._zod.values),
      (n._zod.parse = (u, c) => (
        c.direction === "backward" ||
          (u.value === void 0 && (u.value = i.defaultValue)),
        i.innerType._zod.run(u, c)
      )));
  }),
  Z1 = N("$ZodNonOptional", (n, i) => {
    (Le.init(n, i),
      _e(n._zod, "values", () => {
        const u = i.innerType._zod.values;
        return u ? new Set([...u].filter((c) => c !== void 0)) : void 0;
      }),
      (n._zod.parse = (u, c) => {
        const s = i.innerType._zod.run(u, c);
        return s instanceof Promise ? s.then((h) => Em(h, n)) : Em(s, n);
      }));
  });
function Em(n, i) {
  return (
    !n.issues.length &&
      n.value === void 0 &&
      n.issues.push({
        code: "invalid_type",
        expected: "nonoptional",
        input: n.value,
        inst: i,
      }),
    n
  );
}
var x1 = N("$ZodCatch", (n, i) => {
    (Le.init(n, i),
      _e(n._zod, "optin", () => i.innerType._zod.optin),
      _e(n._zod, "optout", () => i.innerType._zod.optout),
      _e(n._zod, "values", () => i.innerType._zod.values),
      (n._zod.parse = (u, c) => {
        if (c.direction === "backward") return i.innerType._zod.run(u, c);
        const s = i.innerType._zod.run(u, c);
        return s instanceof Promise
          ? s.then(
              (h) => (
                (u.value = h.value),
                h.issues.length &&
                  ((u.value = i.catchValue({
                    ...u,
                    error: { issues: h.issues.map((d) => Ta(d, c, _a())) },
                    input: u.value,
                  })),
                  (u.issues = [])),
                u
              ),
            )
          : ((u.value = s.value),
            s.issues.length &&
              ((u.value = i.catchValue({
                ...u,
                error: { issues: s.issues.map((h) => Ta(h, c, _a())) },
                input: u.value,
              })),
              (u.issues = [])),
            u);
      }));
  }),
  B1 = N("$ZodPipe", (n, i) => {
    (Le.init(n, i),
      _e(n._zod, "values", () => i.in._zod.values),
      _e(n._zod, "optin", () => i.in._zod.optin),
      _e(n._zod, "optout", () => i.out._zod.optout),
      _e(n._zod, "propValues", () => i.in._zod.propValues),
      (n._zod.parse = (u, c) => {
        if (c.direction === "backward") {
          const h = i.out._zod.run(u, c);
          return h instanceof Promise
            ? h.then((d) => $u(d, i.in, c))
            : $u(h, i.in, c);
        }
        const s = i.in._zod.run(u, c);
        return s instanceof Promise
          ? s.then((h) => $u(h, i.out, c))
          : $u(s, i.out, c);
      }));
  });
function $u(n, i, u) {
  return n.issues.length
    ? ((n.aborted = !0), n)
    : i._zod.run({ value: n.value, issues: n.issues }, u);
}
var Q1 = N("$ZodReadonly", (n, i) => {
  (Le.init(n, i),
    _e(n._zod, "propValues", () => i.innerType._zod.propValues),
    _e(n._zod, "values", () => i.innerType._zod.values),
    _e(n._zod, "optin", () => i.innerType?._zod?.optin),
    _e(n._zod, "optout", () => i.innerType?._zod?.optout),
    (n._zod.parse = (u, c) => {
      if (c.direction === "backward") return i.innerType._zod.run(u, c);
      const s = i.innerType._zod.run(u, c);
      return s instanceof Promise ? s.then(wm) : wm(s);
    }));
});
function wm(n) {
  return ((n.value = Object.freeze(n.value)), n);
}
var $1 = N("$ZodCustom", (n, i) => {
  (bt.init(n, i),
    Le.init(n, i),
    (n._zod.parse = (u, c) => u),
    (n._zod.check = (u) => {
      const c = u.value,
        s = i.fn(c);
      if (s instanceof Promise) return s.then((h) => Om(h, u, c, n));
      Om(s, u, c, n);
    }));
});
function Om(n, i, u, c) {
  if (!n) {
    const s = {
      code: "custom",
      input: u,
      inst: c,
      path: [...(c._zod.def.path ?? [])],
      continue: !c._zod.def.abort,
    };
    (c._zod.def.params && (s.params = c._zod.def.params), i.issues.push(pl(s)));
  }
}
var Rm,
  L1 = class {
    constructor() {
      ((this._map = new WeakMap()), (this._idmap = new Map()));
    }
    add(n, ...i) {
      const u = i[0];
      return (
        this._map.set(n, u),
        u && typeof u == "object" && "id" in u && this._idmap.set(u.id, n),
        this
      );
    }
    clear() {
      return ((this._map = new WeakMap()), (this._idmap = new Map()), this);
    }
    remove(n) {
      const i = this._map.get(n);
      return (
        i && typeof i == "object" && "id" in i && this._idmap.delete(i.id),
        this._map.delete(n),
        this
      );
    }
    get(n) {
      const i = n._zod.parent;
      if (i) {
        const u = { ...(this.get(i) ?? {}) };
        delete u.id;
        const c = { ...u, ...this._map.get(n) };
        return Object.keys(c).length ? c : void 0;
      }
      return this._map.get(n);
    }
    has(n) {
      return this._map.has(n);
    }
  };
function H1() {
  return new L1();
}
(Rm = globalThis).__zod_globalRegistry ?? (Rm.__zod_globalRegistry = H1());
var fl = globalThis.__zod_globalRegistry;
function V1(n, i) {
  return new n({ type: "string", ...Y(i) });
}
function gv(n, i) {
  return new n({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function Cm(n, i) {
  return new n({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function G1(n, i) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function Y1(n, i) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...Y(i),
  });
}
function X1(n, i) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...Y(i),
  });
}
function J1(n, i) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...Y(i),
  });
}
function yv(n, i) {
  return new n({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function K1(n, i) {
  return new n({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function I1(n, i) {
  return new n({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function F1(n, i) {
  return new n({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function W1(n, i) {
  return new n({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function P1(n, i) {
  return new n({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function eS(n, i) {
  return new n({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function tS(n, i) {
  return new n({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function nS(n, i) {
  return new n({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function aS(n, i) {
  return new n({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function iS(n, i) {
  return new n({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function lS(n, i) {
  return new n({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function uS(n, i) {
  return new n({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function rS(n, i) {
  return new n({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function oS(n, i) {
  return new n({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function sS(n, i) {
  return new n({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...Y(i),
  });
}
function cS(n, i) {
  return new n({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...Y(i),
  });
}
function fS(n, i) {
  return new n({
    type: "string",
    format: "date",
    check: "string_format",
    ...Y(i),
  });
}
function hS(n, i) {
  return new n({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...Y(i),
  });
}
function dS(n, i) {
  return new n({
    type: "string",
    format: "duration",
    check: "string_format",
    ...Y(i),
  });
}
function mS(n, i) {
  return new n({ type: "number", checks: [], ...Y(i) });
}
function vS(n, i) {
  return new n({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...Y(i),
  });
}
function gS(n, i) {
  return new n({ type: "boolean", ...Y(i) });
}
function yS(n) {
  return new n({ type: "unknown" });
}
function pS(n, i) {
  return new n({ type: "never", ...Y(i) });
}
function Mm(n, i) {
  return new sv({ check: "less_than", ...Y(i), value: n, inclusive: !1 });
}
function Ms(n, i) {
  return new sv({ check: "less_than", ...Y(i), value: n, inclusive: !0 });
}
function Nm(n, i) {
  return new cv({ check: "greater_than", ...Y(i), value: n, inclusive: !1 });
}
function Ns(n, i) {
  return new cv({ check: "greater_than", ...Y(i), value: n, inclusive: !0 });
}
function Dm(n, i) {
  return new Zb({ check: "multiple_of", ...Y(i), value: n });
}
function pv(n, i) {
  return new Bb({ check: "max_length", ...Y(i), maximum: n });
}
function Pu(n, i) {
  return new Qb({ check: "min_length", ...Y(i), minimum: n });
}
function bv(n, i) {
  return new $b({ check: "length_equals", ...Y(i), length: n });
}
function bS(n, i) {
  return new Lb({
    check: "string_format",
    format: "regex",
    ...Y(i),
    pattern: n,
  });
}
function SS(n) {
  return new Hb({ check: "string_format", format: "lowercase", ...Y(n) });
}
function _S(n) {
  return new Vb({ check: "string_format", format: "uppercase", ...Y(n) });
}
function TS(n, i) {
  return new Gb({
    check: "string_format",
    format: "includes",
    ...Y(i),
    includes: n,
  });
}
function zS(n, i) {
  return new Yb({
    check: "string_format",
    format: "starts_with",
    ...Y(i),
    prefix: n,
  });
}
function AS(n, i) {
  return new Xb({
    check: "string_format",
    format: "ends_with",
    ...Y(i),
    suffix: n,
  });
}
function vi(n) {
  return new Jb({ check: "overwrite", tx: n });
}
function ES(n) {
  return vi((i) => i.normalize(n));
}
function wS() {
  return vi((n) => n.trim());
}
function OS() {
  return vi((n) => n.toLowerCase());
}
function RS() {
  return vi((n) => n.toUpperCase());
}
function CS() {
  return vi((n) => $0(n));
}
function MS(n, i, u) {
  return new n({ type: "array", element: i, ...Y(u) });
}
function NS(n, i, u) {
  return new n({ type: "custom", check: "custom", fn: i, ...Y(u) });
}
function DS(n) {
  const i = kS(
    (u) => (
      (u.addIssue = (c) => {
        if (typeof c == "string") u.issues.push(pl(c, u.value, i._zod.def));
        else {
          const s = c;
          (s.fatal && (s.continue = !1),
            s.code ?? (s.code = "custom"),
            s.input ?? (s.input = u.value),
            s.inst ?? (s.inst = i),
            s.continue ?? (s.continue = !i._zod.def.abort),
            u.issues.push(pl(s)));
        }
      }),
      n(u.value, u)
    ),
  );
  return i;
}
function kS(n, i) {
  const u = new bt({ check: "custom", ...Y(i) });
  return ((u._zod.check = n), u);
}
function Sv(n) {
  let i = n?.target ?? "draft-2020-12";
  return (
    i === "draft-4" && (i = "draft-04"),
    i === "draft-7" && (i = "draft-07"),
    {
      processors: n.processors ?? {},
      metadataRegistry: n?.metadata ?? fl,
      target: i,
      unrepresentable: n?.unrepresentable ?? "throw",
      override: n?.override ?? (() => {}),
      io: n?.io ?? "output",
      counter: 0,
      seen: new Map(),
      cycles: n?.cycles ?? "ref",
      reused: n?.reused ?? "inline",
      external: n?.external ?? void 0,
    }
  );
}
function ut(n, i, u = { path: [], schemaPath: [] }) {
  var c;
  const s = n._zod.def,
    h = i.seen.get(n);
  if (h)
    return (
      h.count++,
      u.schemaPath.includes(n) && (h.cycle = u.path),
      h.schema
    );
  const d = { schema: {}, count: 1, cycle: void 0, path: u.path };
  i.seen.set(n, d);
  const v = n._zod.toJSONSchema?.();
  if (v) d.schema = v;
  else {
    const z = { ...u, schemaPath: [...u.schemaPath, n], path: u.path };
    if (n._zod.processJSONSchema) n._zod.processJSONSchema(i, d.schema, z);
    else {
      const q = d.schema,
        w = i.processors[s.type];
      if (!w)
        throw new Error(
          `[toJSONSchema]: Non-representable type encountered: ${s.type}`,
        );
      w(n, i, q, z);
    }
    const _ = n._zod.parent;
    _ && (d.ref || (d.ref = _), ut(_, i, z), (i.seen.get(_).isParent = !0));
  }
  const b = i.metadataRegistry.get(n);
  return (
    b && Object.assign(d.schema, b),
    i.io === "input" &&
      st(n) &&
      (delete d.schema.examples, delete d.schema.default),
    i.io === "input" &&
      d.schema._prefault &&
      ((c = d.schema).default ?? (c.default = d.schema._prefault)),
    delete d.schema._prefault,
    i.seen.get(n).schema
  );
}
function _v(n, i) {
  const u = n.seen.get(i);
  if (!u) throw new Error("Unprocessed schema. This is a bug in Zod.");
  const c = new Map();
  for (const d of n.seen.entries()) {
    const v = n.metadataRegistry.get(d[0])?.id;
    if (v) {
      const b = c.get(v);
      if (b && b !== d[0])
        throw new Error(
          `Duplicate schema id "${v}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`,
        );
      c.set(v, d[0]);
    }
  }
  const s = (d) => {
      const v = n.target === "draft-2020-12" ? "$defs" : "definitions";
      if (n.external) {
        const _ = n.external.registry.get(d[0])?.id,
          q = n.external.uri ?? ((x) => x);
        if (_) return { ref: q(_) };
        const w = d[1].defId ?? d[1].schema.id ?? `schema${n.counter++}`;
        return (
          (d[1].defId = w),
          { defId: w, ref: `${q("__shared")}#/${v}/${w}` }
        );
      }
      if (d[1] === u) return { ref: "#" };
      const b = `#/${v}/`,
        z = d[1].schema.id ?? `__schema${n.counter++}`;
      return { defId: z, ref: b + z };
    },
    h = (d) => {
      if (d[1].schema.$ref) return;
      const v = d[1],
        { ref: b, defId: z } = s(d);
      ((v.def = { ...v.schema }), z && (v.defId = z));
      const _ = v.schema;
      for (const q in _) delete _[q];
      _.$ref = b;
    };
  if (n.cycles === "throw")
    for (const d of n.seen.entries()) {
      const v = d[1];
      if (v.cycle)
        throw new Error(`Cycle detected: #/${v.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (const d of n.seen.entries()) {
    const v = d[1];
    if (i === d[0]) {
      h(d);
      continue;
    }
    if (n.external) {
      const b = n.external.registry.get(d[0])?.id;
      if (i !== d[0] && b) {
        h(d);
        continue;
      }
    }
    if (n.metadataRegistry.get(d[0])?.id) {
      h(d);
      continue;
    }
    if (v.cycle) {
      h(d);
      continue;
    }
    if (v.count > 1 && n.reused === "ref") {
      h(d);
      continue;
    }
  }
}
function Tv(n, i) {
  const u = n.seen.get(i);
  if (!u) throw new Error("Unprocessed schema. This is a bug in Zod.");
  const c = (d) => {
    const v = n.seen.get(d);
    if (v.ref === null) return;
    const b = v.def ?? v.schema,
      z = { ...b },
      _ = v.ref;
    if (((v.ref = null), _)) {
      c(_);
      const w = n.seen.get(_),
        x = w.schema;
      if (
        (x.$ref &&
        (n.target === "draft-07" ||
          n.target === "draft-04" ||
          n.target === "openapi-3.0")
          ? ((b.allOf = b.allOf ?? []), b.allOf.push(x))
          : Object.assign(b, x),
        Object.assign(b, z),
        d._zod.parent === _)
      )
        for (const K in b)
          K === "$ref" || K === "allOf" || K in z || delete b[K];
      if (x.$ref)
        for (const K in b)
          K === "$ref" ||
            K === "allOf" ||
            (K in w.def &&
              JSON.stringify(b[K]) === JSON.stringify(w.def[K]) &&
              delete b[K]);
    }
    const q = d._zod.parent;
    if (q && q !== _) {
      c(q);
      const w = n.seen.get(q);
      if (w?.schema.$ref && ((b.$ref = w.schema.$ref), w.def))
        for (const x in b)
          x === "$ref" ||
            x === "allOf" ||
            (x in w.def &&
              JSON.stringify(b[x]) === JSON.stringify(w.def[x]) &&
              delete b[x]);
    }
    n.override({ zodSchema: d, jsonSchema: b, path: v.path ?? [] });
  };
  for (const d of [...n.seen.entries()].reverse()) c(d[0]);
  const s = {};
  if (
    (n.target === "draft-2020-12"
      ? (s.$schema = "https://json-schema.org/draft/2020-12/schema")
      : n.target === "draft-07"
        ? (s.$schema = "http://json-schema.org/draft-07/schema#")
        : n.target === "draft-04"
          ? (s.$schema = "http://json-schema.org/draft-04/schema#")
          : n.target,
    n.external?.uri)
  ) {
    const d = n.external.registry.get(i)?.id;
    if (!d) throw new Error("Schema is missing an `id` property");
    s.$id = n.external.uri(d);
  }
  Object.assign(s, u.def ?? u.schema);
  const h = n.external?.defs ?? {};
  for (const d of n.seen.entries()) {
    const v = d[1];
    v.def && v.defId && (h[v.defId] = v.def);
  }
  n.external ||
    (Object.keys(h).length > 0 &&
      (n.target === "draft-2020-12" ? (s.$defs = h) : (s.definitions = h)));
  try {
    const d = JSON.parse(JSON.stringify(s));
    return (
      Object.defineProperty(d, "~standard", {
        value: {
          ...i["~standard"],
          jsonSchema: {
            input: er(i, "input", n.processors),
            output: er(i, "output", n.processors),
          },
        },
        enumerable: !1,
        writable: !1,
      }),
      d
    );
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function st(n, i) {
  const u = i ?? { seen: new Set() };
  if (u.seen.has(n)) return !1;
  u.seen.add(n);
  const c = n._zod.def;
  if (c.type === "transform") return !0;
  if (c.type === "array") return st(c.element, u);
  if (c.type === "set") return st(c.valueType, u);
  if (c.type === "lazy") return st(c.getter(), u);
  if (
    c.type === "promise" ||
    c.type === "optional" ||
    c.type === "nonoptional" ||
    c.type === "nullable" ||
    c.type === "readonly" ||
    c.type === "default" ||
    c.type === "prefault"
  )
    return st(c.innerType, u);
  if (c.type === "intersection") return st(c.left, u) || st(c.right, u);
  if (c.type === "record" || c.type === "map")
    return st(c.keyType, u) || st(c.valueType, u);
  if (c.type === "pipe") return st(c.in, u) || st(c.out, u);
  if (c.type === "object") {
    for (const s in c.shape) if (st(c.shape[s], u)) return !0;
    return !1;
  }
  if (c.type === "union") {
    for (const s of c.options) if (st(s, u)) return !0;
    return !1;
  }
  if (c.type === "tuple") {
    for (const s of c.items) if (st(s, u)) return !0;
    return !!(c.rest && st(c.rest, u));
  }
  return !1;
}
var qS =
    (n, i = {}) =>
    (u) => {
      const c = Sv({ ...u, processors: i });
      return (ut(n, c), _v(c, n), Tv(c, n));
    },
  er =
    (n, i, u = {}) =>
    (c) => {
      const { libraryOptions: s, target: h } = c ?? {},
        d = Sv({ ...(s ?? {}), target: h, io: i, processors: u });
      return (ut(n, d), _v(d, n), Tv(d, n));
    },
  US = {
    guid: "uuid",
    url: "uri",
    datetime: "date-time",
    json_string: "json-string",
    regex: "",
  },
  jS = (n, i, u, c) => {
    const s = u;
    s.type = "string";
    const {
      minimum: h,
      maximum: d,
      format: v,
      patterns: b,
      contentEncoding: z,
    } = n._zod.bag;
    if (
      (typeof h == "number" && (s.minLength = h),
      typeof d == "number" && (s.maxLength = d),
      v &&
        ((s.format = US[v] ?? v),
        s.format === "" && delete s.format,
        v === "time" && delete s.format),
      z && (s.contentEncoding = z),
      b && b.size > 0)
    ) {
      const _ = [...b];
      _.length === 1
        ? (s.pattern = _[0].source)
        : _.length > 1 &&
          (s.allOf = [
            ..._.map((q) => ({
              ...(i.target === "draft-07" ||
              i.target === "draft-04" ||
              i.target === "openapi-3.0"
                ? { type: "string" }
                : {}),
              pattern: q.source,
            })),
          ]);
    }
  },
  ZS = (n, i, u, c) => {
    const s = u,
      {
        minimum: h,
        maximum: d,
        format: v,
        multipleOf: b,
        exclusiveMaximum: z,
        exclusiveMinimum: _,
      } = n._zod.bag;
    (typeof v == "string" && v.includes("int")
      ? (s.type = "integer")
      : (s.type = "number"),
      typeof _ == "number" &&
        (i.target === "draft-04" || i.target === "openapi-3.0"
          ? ((s.minimum = _), (s.exclusiveMinimum = !0))
          : (s.exclusiveMinimum = _)),
      typeof h == "number" &&
        ((s.minimum = h),
        typeof _ == "number" &&
          i.target !== "draft-04" &&
          (_ >= h ? delete s.minimum : delete s.exclusiveMinimum)),
      typeof z == "number" &&
        (i.target === "draft-04" || i.target === "openapi-3.0"
          ? ((s.maximum = z), (s.exclusiveMaximum = !0))
          : (s.exclusiveMaximum = z)),
      typeof d == "number" &&
        ((s.maximum = d),
        typeof z == "number" &&
          i.target !== "draft-04" &&
          (z <= d ? delete s.maximum : delete s.exclusiveMaximum)),
      typeof b == "number" && (s.multipleOf = b));
  },
  xS = (n, i, u, c) => {
    u.type = "boolean";
  },
  BS = (n, i, u, c) => {
    u.not = {};
  },
  QS = (n, i, u, c) => {},
  $S = (n, i, u, c) => {
    const s = n._zod.def,
      h = Wm(s.entries);
    (h.every((d) => typeof d == "number") && (u.type = "number"),
      h.every((d) => typeof d == "string") && (u.type = "string"),
      (u.enum = h));
  },
  LS = (n, i, u, c) => {
    if (i.unrepresentable === "throw")
      throw new Error("Custom types cannot be represented in JSON Schema");
  },
  HS = (n, i, u, c) => {
    if (i.unrepresentable === "throw")
      throw new Error("Transforms cannot be represented in JSON Schema");
  },
  VS = (n, i, u, c) => {
    const s = u,
      h = n._zod.def,
      { minimum: d, maximum: v } = n._zod.bag;
    (typeof d == "number" && (s.minItems = d),
      typeof v == "number" && (s.maxItems = v),
      (s.type = "array"),
      (s.items = ut(h.element, i, { ...c, path: [...c.path, "items"] })));
  },
  GS = (n, i, u, c) => {
    const s = u,
      h = n._zod.def;
    ((s.type = "object"), (s.properties = {}));
    const d = h.shape;
    for (const z in d)
      s.properties[z] = ut(d[z], i, {
        ...c,
        path: [...c.path, "properties", z],
      });
    const v = new Set(Object.keys(d)),
      b = new Set(
        [...v].filter((z) => {
          const _ = h.shape[z]._zod;
          return i.io === "input" ? _.optin === void 0 : _.optout === void 0;
        }),
      );
    (b.size > 0 && (s.required = Array.from(b)),
      h.catchall?._zod.def.type === "never"
        ? (s.additionalProperties = !1)
        : h.catchall
          ? h.catchall &&
            (s.additionalProperties = ut(h.catchall, i, {
              ...c,
              path: [...c.path, "additionalProperties"],
            }))
          : i.io === "output" && (s.additionalProperties = !1));
  },
  YS = (n, i, u, c) => {
    const s = n._zod.def,
      h = s.inclusive === !1,
      d = s.options.map((v, b) =>
        ut(v, i, { ...c, path: [...c.path, h ? "oneOf" : "anyOf", b] }),
      );
    h ? (u.oneOf = d) : (u.anyOf = d);
  },
  XS = (n, i, u, c) => {
    const s = n._zod.def,
      h = ut(s.left, i, { ...c, path: [...c.path, "allOf", 0] }),
      d = ut(s.right, i, { ...c, path: [...c.path, "allOf", 1] }),
      v = (b) => "allOf" in b && Object.keys(b).length === 1;
    u.allOf = [...(v(h) ? h.allOf : [h]), ...(v(d) ? d.allOf : [d])];
  },
  JS = (n, i, u, c) => {
    const s = n._zod.def,
      h = ut(s.innerType, i, c),
      d = i.seen.get(n);
    i.target === "openapi-3.0"
      ? ((d.ref = s.innerType), (u.nullable = !0))
      : (u.anyOf = [h, { type: "null" }]);
  },
  KS = (n, i, u, c) => {
    const s = n._zod.def;
    ut(s.innerType, i, c);
    const h = i.seen.get(n);
    h.ref = s.innerType;
  },
  IS = (n, i, u, c) => {
    const s = n._zod.def;
    ut(s.innerType, i, c);
    const h = i.seen.get(n);
    ((h.ref = s.innerType),
      (u.default = JSON.parse(JSON.stringify(s.defaultValue))));
  },
  FS = (n, i, u, c) => {
    const s = n._zod.def;
    ut(s.innerType, i, c);
    const h = i.seen.get(n);
    ((h.ref = s.innerType),
      i.io === "input" &&
        (u._prefault = JSON.parse(JSON.stringify(s.defaultValue))));
  },
  WS = (n, i, u, c) => {
    const s = n._zod.def;
    ut(s.innerType, i, c);
    const h = i.seen.get(n);
    h.ref = s.innerType;
    let d;
    try {
      d = s.catchValue(void 0);
    } catch {
      throw new Error("Dynamic catch values are not supported in JSON Schema");
    }
    u.default = d;
  },
  PS = (n, i, u, c) => {
    const s = n._zod.def,
      h =
        i.io === "input"
          ? s.in._zod.def.type === "transform"
            ? s.out
            : s.in
          : s.out;
    ut(h, i, c);
    const d = i.seen.get(n);
    d.ref = h;
  },
  e_ = (n, i, u, c) => {
    const s = n._zod.def;
    ut(s.innerType, i, c);
    const h = i.seen.get(n);
    ((h.ref = s.innerType), (u.readOnly = !0));
  },
  zv = (n, i, u, c) => {
    const s = n._zod.def;
    ut(s.innerType, i, c);
    const h = i.seen.get(n);
    h.ref = s.innerType;
  },
  t_ = N("ZodISODateTime", (n, i) => {
    (o1.init(n, i), ke.init(n, i));
  });
function n_(n) {
  return cS(t_, n);
}
var a_ = N("ZodISODate", (n, i) => {
  (s1.init(n, i), ke.init(n, i));
});
function i_(n) {
  return fS(a_, n);
}
var l_ = N("ZodISOTime", (n, i) => {
  (c1.init(n, i), ke.init(n, i));
});
function u_(n) {
  return hS(l_, n);
}
var r_ = N("ZodISODuration", (n, i) => {
  (f1.init(n, i), ke.init(n, i));
});
function o_(n) {
  return dS(r_, n);
}
var Av = (n, i) => {
    (av.init(n, i),
      (n.name = "ZodError"),
      Object.defineProperties(n, {
        format: { value: (u) => eb(n, u) },
        flatten: { value: (u) => P0(n, u) },
        addIssue: {
          value: (u) => {
            (n.issues.push(u), (n.message = JSON.stringify(n.issues, $s, 2)));
          },
        },
        addIssues: {
          value: (u) => {
            (n.issues.push(...u),
              (n.message = JSON.stringify(n.issues, $s, 2)));
          },
        },
        isEmpty: {
          get() {
            return n.issues.length === 0;
          },
        },
      }));
  },
  wT = N("ZodError", Av),
  $t = N("ZodError", Av, { Parent: Error }),
  s_ = Fs($t),
  c_ = Ws($t),
  f_ = ar($t),
  h_ = ir($t),
  d_ = ab($t),
  m_ = ib($t),
  v_ = lb($t),
  g_ = ub($t),
  y_ = rb($t),
  p_ = ob($t),
  b_ = sb($t),
  S_ = cb($t),
  He = N(
    "ZodType",
    (n, i) => (
      Le.init(n, i),
      Object.assign(n["~standard"], {
        jsonSchema: { input: er(n, "input"), output: er(n, "output") },
      }),
      (n.toJSONSchema = qS(n, {})),
      (n.def = i),
      (n.type = i.type),
      Object.defineProperty(n, "_def", { value: i }),
      (n.check = (...u) =>
        n.clone(
          Xn(i, {
            checks: [
              ...(i.checks ?? []),
              ...u.map((c) =>
                typeof c == "function"
                  ? {
                      _zod: {
                        check: c,
                        def: { check: "custom" },
                        onattach: [],
                      },
                    }
                  : c,
              ),
            ],
          }),
          { parent: !0 },
        )),
      (n.with = n.check),
      (n.clone = (u, c) => Jn(n, u, c)),
      (n.brand = () => n),
      (n.register = (u, c) => (u.add(n, c), n)),
      (n.parse = (u, c) => s_(n, u, c, { callee: n.parse })),
      (n.safeParse = (u, c) => f_(n, u, c)),
      (n.parseAsync = async (u, c) => c_(n, u, c, { callee: n.parseAsync })),
      (n.safeParseAsync = async (u, c) => h_(n, u, c)),
      (n.spa = n.safeParseAsync),
      (n.encode = (u, c) => d_(n, u, c)),
      (n.decode = (u, c) => m_(n, u, c)),
      (n.encodeAsync = async (u, c) => v_(n, u, c)),
      (n.decodeAsync = async (u, c) => g_(n, u, c)),
      (n.safeEncode = (u, c) => y_(n, u, c)),
      (n.safeDecode = (u, c) => p_(n, u, c)),
      (n.safeEncodeAsync = async (u, c) => b_(n, u, c)),
      (n.safeDecodeAsync = async (u, c) => S_(n, u, c)),
      (n.refine = (u, c) => n.check(hT(u, c))),
      (n.superRefine = (u) => n.check(dT(u))),
      (n.overwrite = (u) => n.check(vi(u))),
      (n.optional = () => jm(n)),
      (n.exactOptional = () => P_(n)),
      (n.nullable = () => Zm(n)),
      (n.nullish = () => jm(Zm(n))),
      (n.nonoptional = (u) => lT(n, u)),
      (n.array = () => ec(n)),
      (n.or = (u) => X_([n, u])),
      (n.and = (u) => K_(n, u)),
      (n.transform = (u) => xm(n, F_(u))),
      (n.default = (u) => nT(n, u)),
      (n.prefault = (u) => iT(n, u)),
      (n.catch = (u) => rT(n, u)),
      (n.pipe = (u) => xm(n, u)),
      (n.readonly = () => cT(n)),
      (n.describe = (u) => {
        const c = n.clone();
        return (fl.add(c, { description: u }), c);
      }),
      Object.defineProperty(n, "description", {
        get() {
          return fl.get(n)?.description;
        },
        configurable: !0,
      }),
      (n.meta = (...u) => {
        if (u.length === 0) return fl.get(n);
        const c = n.clone();
        return (fl.add(c, u[0]), c);
      }),
      (n.isOptional = () => n.safeParse(void 0).success),
      (n.isNullable = () => n.safeParse(null).success),
      (n.apply = (u) => u(n)),
      n
    ),
  ),
  Ev = N("_ZodString", (n, i) => {
    (Ps.init(n, i),
      He.init(n, i),
      (n._zod.processJSONSchema = (c, s, h) => jS(n, c, s, h)));
    const u = n._zod.bag;
    ((n.format = u.format ?? null),
      (n.minLength = u.minimum ?? null),
      (n.maxLength = u.maximum ?? null),
      (n.regex = (...c) => n.check(bS(...c))),
      (n.includes = (...c) => n.check(TS(...c))),
      (n.startsWith = (...c) => n.check(zS(...c))),
      (n.endsWith = (...c) => n.check(AS(...c))),
      (n.min = (...c) => n.check(Pu(...c))),
      (n.max = (...c) => n.check(pv(...c))),
      (n.length = (...c) => n.check(bv(...c))),
      (n.nonempty = (...c) => n.check(Pu(1, ...c))),
      (n.lowercase = (c) => n.check(SS(c))),
      (n.uppercase = (c) => n.check(_S(c))),
      (n.trim = () => n.check(wS())),
      (n.normalize = (...c) => n.check(ES(...c))),
      (n.toLowerCase = () => n.check(OS())),
      (n.toUpperCase = () => n.check(RS())),
      (n.slugify = () => n.check(CS())));
  }),
  __ = N("ZodString", (n, i) => {
    (Ps.init(n, i),
      Ev.init(n, i),
      (n.email = (u) => n.check(gv(wv, u))),
      (n.url = (u) => n.check(yv(Ov, u))),
      (n.jwt = (u) => n.check(sS(x_, u))),
      (n.emoji = (u) => n.check(K1(A_, u))),
      (n.guid = (u) => n.check(Cm(km, u))),
      (n.uuid = (u) => n.check(G1(Lu, u))),
      (n.uuidv4 = (u) => n.check(Y1(Lu, u))),
      (n.uuidv6 = (u) => n.check(X1(Lu, u))),
      (n.uuidv7 = (u) => n.check(J1(Lu, u))),
      (n.nanoid = (u) => n.check(I1(E_, u))),
      (n.guid = (u) => n.check(Cm(km, u))),
      (n.cuid = (u) => n.check(F1(w_, u))),
      (n.cuid2 = (u) => n.check(W1(O_, u))),
      (n.ulid = (u) => n.check(P1(R_, u))),
      (n.base64 = (u) => n.check(uS(U_, u))),
      (n.base64url = (u) => n.check(rS(j_, u))),
      (n.xid = (u) => n.check(eS(C_, u))),
      (n.ksuid = (u) => n.check(tS(M_, u))),
      (n.ipv4 = (u) => n.check(nS(N_, u))),
      (n.ipv6 = (u) => n.check(aS(D_, u))),
      (n.cidrv4 = (u) => n.check(iS(k_, u))),
      (n.cidrv6 = (u) => n.check(lS(q_, u))),
      (n.e164 = (u) => n.check(oS(Z_, u))),
      (n.datetime = (u) => n.check(n_(u))),
      (n.date = (u) => n.check(i_(u))),
      (n.time = (u) => n.check(u_(u))),
      (n.duration = (u) => n.check(o_(u))));
  });
function Ft(n) {
  return V1(__, n);
}
var ke = N("ZodStringFormat", (n, i) => {
    (Me.init(n, i), Ev.init(n, i));
  }),
  wv = N("ZodEmail", (n, i) => {
    (Pb.init(n, i), ke.init(n, i));
  });
function T_(n) {
  return gv(wv, n);
}
var km = N("ZodGUID", (n, i) => {
    (Fb.init(n, i), ke.init(n, i));
  }),
  Lu = N("ZodUUID", (n, i) => {
    (Wb.init(n, i), ke.init(n, i));
  }),
  Ov = N("ZodURL", (n, i) => {
    (e1.init(n, i), ke.init(n, i));
  });
function z_(n) {
  return yv(Ov, n);
}
var A_ = N("ZodEmoji", (n, i) => {
    (t1.init(n, i), ke.init(n, i));
  }),
  E_ = N("ZodNanoID", (n, i) => {
    (n1.init(n, i), ke.init(n, i));
  }),
  w_ = N("ZodCUID", (n, i) => {
    (a1.init(n, i), ke.init(n, i));
  }),
  O_ = N("ZodCUID2", (n, i) => {
    (i1.init(n, i), ke.init(n, i));
  }),
  R_ = N("ZodULID", (n, i) => {
    (l1.init(n, i), ke.init(n, i));
  }),
  C_ = N("ZodXID", (n, i) => {
    (u1.init(n, i), ke.init(n, i));
  }),
  M_ = N("ZodKSUID", (n, i) => {
    (r1.init(n, i), ke.init(n, i));
  }),
  N_ = N("ZodIPv4", (n, i) => {
    (h1.init(n, i), ke.init(n, i));
  }),
  D_ = N("ZodIPv6", (n, i) => {
    (d1.init(n, i), ke.init(n, i));
  }),
  k_ = N("ZodCIDRv4", (n, i) => {
    (m1.init(n, i), ke.init(n, i));
  }),
  q_ = N("ZodCIDRv6", (n, i) => {
    (v1.init(n, i), ke.init(n, i));
  }),
  U_ = N("ZodBase64", (n, i) => {
    (g1.init(n, i), ke.init(n, i));
  }),
  j_ = N("ZodBase64URL", (n, i) => {
    (p1.init(n, i), ke.init(n, i));
  }),
  Z_ = N("ZodE164", (n, i) => {
    (b1.init(n, i), ke.init(n, i));
  }),
  x_ = N("ZodJWT", (n, i) => {
    (_1.init(n, i), ke.init(n, i));
  }),
  Rv = N("ZodNumber", (n, i) => {
    (hv.init(n, i),
      He.init(n, i),
      (n._zod.processJSONSchema = (c, s, h) => ZS(n, c, s, h)),
      (n.gt = (c, s) => n.check(Nm(c, s))),
      (n.gte = (c, s) => n.check(Ns(c, s))),
      (n.min = (c, s) => n.check(Ns(c, s))),
      (n.lt = (c, s) => n.check(Mm(c, s))),
      (n.lte = (c, s) => n.check(Ms(c, s))),
      (n.max = (c, s) => n.check(Ms(c, s))),
      (n.int = (c) => n.check(qm(c))),
      (n.safe = (c) => n.check(qm(c))),
      (n.positive = (c) => n.check(Nm(0, c))),
      (n.nonnegative = (c) => n.check(Ns(0, c))),
      (n.negative = (c) => n.check(Mm(0, c))),
      (n.nonpositive = (c) => n.check(Ms(0, c))),
      (n.multipleOf = (c, s) => n.check(Dm(c, s))),
      (n.step = (c, s) => n.check(Dm(c, s))),
      (n.finite = () => n));
    const u = n._zod.bag;
    ((n.minValue =
      Math.max(
        u.minimum ?? Number.NEGATIVE_INFINITY,
        u.exclusiveMinimum ?? Number.NEGATIVE_INFINITY,
      ) ?? null),
      (n.maxValue =
        Math.min(
          u.maximum ?? Number.POSITIVE_INFINITY,
          u.exclusiveMaximum ?? Number.POSITIVE_INFINITY,
        ) ?? null),
      (n.isInt =
        (u.format ?? "").includes("int") ||
        Number.isSafeInteger(u.multipleOf ?? 0.5)),
      (n.isFinite = !0),
      (n.format = u.format ?? null));
  });
function tr(n) {
  return mS(Rv, n);
}
var B_ = N("ZodNumberFormat", (n, i) => {
  (T1.init(n, i), Rv.init(n, i));
});
function qm(n) {
  return vS(B_, n);
}
var Q_ = N("ZodBoolean", (n, i) => {
  (z1.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (u, c, s) => xS(n, u, c, s)));
});
function sl(n) {
  return gS(Q_, n);
}
var $_ = N("ZodUnknown", (n, i) => {
  (A1.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (u, c, s) => QS(n, u, c, s)));
});
function Um() {
  return yS($_);
}
var L_ = N("ZodNever", (n, i) => {
  (E1.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (u, c, s) => BS(n, u, c, s)));
});
function H_(n) {
  return pS(L_, n);
}
var V_ = N("ZodArray", (n, i) => {
  (w1.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (u, c, s) => VS(n, u, c, s)),
    (n.element = i.element),
    (n.min = (u, c) => n.check(Pu(u, c))),
    (n.nonempty = (u) => n.check(Pu(1, u))),
    (n.max = (u, c) => n.check(pv(u, c))),
    (n.length = (u, c) => n.check(bv(u, c))),
    (n.unwrap = () => n.element));
});
function ec(n, i) {
  return MS(V_, n, i);
}
var G_ = N("ZodObject", (n, i) => {
  (R1.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (u, c, s) => GS(n, u, c, s)),
    _e(n, "shape", () => i.shape),
    (n.keyof = () => dl(Object.keys(n._zod.def.shape))),
    (n.catchall = (u) => n.clone({ ...n._zod.def, catchall: u })),
    (n.passthrough = () => n.clone({ ...n._zod.def, catchall: Um() })),
    (n.loose = () => n.clone({ ...n._zod.def, catchall: Um() })),
    (n.strict = () => n.clone({ ...n._zod.def, catchall: H_() })),
    (n.strip = () => n.clone({ ...n._zod.def, catchall: void 0 })),
    (n.extend = (u) => J0(n, u)),
    (n.safeExtend = (u) => K0(n, u)),
    (n.merge = (u) => I0(n, u)),
    (n.pick = (u) => Y0(n, u)),
    (n.omit = (u) => X0(n, u)),
    (n.partial = (...u) => F0(Cv, n, u[0])),
    (n.required = (...u) => W0(Mv, n, u[0])));
});
function Gt(n, i) {
  const u = { type: "object", shape: n ?? {}, ...Y(i) };
  return new G_(u);
}
var Y_ = N("ZodUnion", (n, i) => {
  (C1.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (u, c, s) => YS(n, u, c, s)),
    (n.options = i.options));
});
function X_(n, i) {
  return new Y_({ type: "union", options: n, ...Y(i) });
}
var J_ = N("ZodIntersection", (n, i) => {
  (M1.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (u, c, s) => XS(n, u, c, s)));
});
function K_(n, i) {
  return new J_({ type: "intersection", left: n, right: i });
}
var Hs = N("ZodEnum", (n, i) => {
  (N1.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (c, s, h) => $S(n, c, s, h)),
    (n.enum = i.entries),
    (n.options = Object.values(i.entries)));
  const u = new Set(Object.keys(i.entries));
  ((n.extract = (c, s) => {
    const h = {};
    for (const d of c)
      if (u.has(d)) h[d] = i.entries[d];
      else throw new Error(`Key ${d} not found in enum`);
    return new Hs({ ...i, checks: [], ...Y(s), entries: h });
  }),
    (n.exclude = (c, s) => {
      const h = { ...i.entries };
      for (const d of c)
        if (u.has(d)) delete h[d];
        else throw new Error(`Key ${d} not found in enum`);
      return new Hs({ ...i, checks: [], ...Y(s), entries: h });
    }));
});
function dl(n, i) {
  const u = Array.isArray(n) ? Object.fromEntries(n.map((c) => [c, c])) : n;
  return new Hs({ type: "enum", entries: u, ...Y(i) });
}
var I_ = N("ZodTransform", (n, i) => {
  (D1.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (u, c, s) => HS(n, u, c, s)),
    (n._zod.parse = (u, c) => {
      if (c.direction === "backward") throw new Fm(n.constructor.name);
      u.addIssue = (h) => {
        if (typeof h == "string") u.issues.push(pl(h, u.value, i));
        else {
          const d = h;
          (d.fatal && (d.continue = !1),
            d.code ?? (d.code = "custom"),
            d.input ?? (d.input = u.value),
            d.inst ?? (d.inst = n),
            u.issues.push(pl(d)));
        }
      };
      const s = i.transform(u.value, u);
      return s instanceof Promise
        ? s.then((h) => ((u.value = h), u))
        : ((u.value = s), u);
    }));
});
function F_(n) {
  return new I_({ type: "transform", transform: n });
}
var Cv = N("ZodOptional", (n, i) => {
  (vv.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (u, c, s) => zv(n, u, c, s)),
    (n.unwrap = () => n._zod.def.innerType));
});
function jm(n) {
  return new Cv({ type: "optional", innerType: n });
}
var W_ = N("ZodExactOptional", (n, i) => {
  (k1.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (u, c, s) => zv(n, u, c, s)),
    (n.unwrap = () => n._zod.def.innerType));
});
function P_(n) {
  return new W_({ type: "optional", innerType: n });
}
var eT = N("ZodNullable", (n, i) => {
  (q1.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (u, c, s) => JS(n, u, c, s)),
    (n.unwrap = () => n._zod.def.innerType));
});
function Zm(n) {
  return new eT({ type: "nullable", innerType: n });
}
var tT = N("ZodDefault", (n, i) => {
  (U1.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (u, c, s) => IS(n, u, c, s)),
    (n.unwrap = () => n._zod.def.innerType),
    (n.removeDefault = n.unwrap));
});
function nT(n, i) {
  return new tT({
    type: "default",
    innerType: n,
    get defaultValue() {
      return typeof i == "function" ? i() : ev(i);
    },
  });
}
var aT = N("ZodPrefault", (n, i) => {
  (j1.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (u, c, s) => FS(n, u, c, s)),
    (n.unwrap = () => n._zod.def.innerType));
});
function iT(n, i) {
  return new aT({
    type: "prefault",
    innerType: n,
    get defaultValue() {
      return typeof i == "function" ? i() : ev(i);
    },
  });
}
var Mv = N("ZodNonOptional", (n, i) => {
  (Z1.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (u, c, s) => KS(n, u, c, s)),
    (n.unwrap = () => n._zod.def.innerType));
});
function lT(n, i) {
  return new Mv({ type: "nonoptional", innerType: n, ...Y(i) });
}
var uT = N("ZodCatch", (n, i) => {
  (x1.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (u, c, s) => WS(n, u, c, s)),
    (n.unwrap = () => n._zod.def.innerType),
    (n.removeCatch = n.unwrap));
});
function rT(n, i) {
  return new uT({
    type: "catch",
    innerType: n,
    catchValue: typeof i == "function" ? i : () => i,
  });
}
var oT = N("ZodPipe", (n, i) => {
  (B1.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (u, c, s) => PS(n, u, c, s)),
    (n.in = i.in),
    (n.out = i.out));
});
function xm(n, i) {
  return new oT({ type: "pipe", in: n, out: i });
}
var sT = N("ZodReadonly", (n, i) => {
  (Q1.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (u, c, s) => e_(n, u, c, s)),
    (n.unwrap = () => n._zod.def.innerType));
});
function cT(n) {
  return new sT({ type: "readonly", innerType: n });
}
var fT = N("ZodCustom", (n, i) => {
  ($1.init(n, i),
    He.init(n, i),
    (n._zod.processJSONSchema = (u, c, s) => LS(n, u, c, s)));
});
function hT(n, i = {}) {
  return NS(fT, n, i);
}
function dT(n) {
  return DS(n);
}
var mT = B0(),
  Wt = Ft().min(1).max(128),
  Ds = tr().finite().nonnegative().nullable(),
  _n = tr().int().nonnegative(),
  Nv = Gt({
    organizationId: Wt,
    workspaceId: Wt,
    installationId: Wt,
    actorUserId: Wt,
  }),
  vT = Gt({
    binding: Nv,
    clientRequestId: Ft().regex(/^[0-9a-f]{64}$/),
    accountId: Wt.nullable(),
    attemptId: Wt.nullable(),
  }),
  Dv = dl([
    "preparing",
    "pending",
    "exchanging",
    "awaiting_finish",
    "finished",
    "failed",
    "cancelled",
  ]),
  Hu = Gt({
    attemptId: Wt,
    status: Dv,
    consentUrl: z_()
      .refine((n) => new URL(n).origin === "https://accounts.google.com")
      .optional(),
  }),
  gT = Gt({
    binding: Nv,
    canWrite: sl(),
    cursor: Ft().nullable(),
    attempt: Gt({
      attemptId: Wt,
      status: Dv,
      expiresAt: tr().finite().positive(),
      clientRequestId: Ft().regex(/^[0-9a-f]{64}$/),
      accountId: Wt.nullable(),
    }).nullable(),
    accounts: ec(
      Gt({
        accountId: Wt,
        emailAddress: T_(),
        destinationPath: Ft().min(1),
        connectionGeneration: tr().int().positive(),
        syncStatus: dl([
          "backfilling",
          "live",
          "blocked",
          "error",
          "disconnected",
        ]),
        syncError: Ft().nullable(),
        sourceError: dl([
          "google_revoked",
          "gmail_request",
          "history_response_too_large",
        ]).nullable(),
        pressReady: sl(),
        canRepair: sl(),
        needsReconnect: sl(),
        backfillComplete: sl(),
        messagesSynced: _n,
        messagesSkipped: _n,
        ledgerCounts: Gt({
          pending: _n,
          done: _n,
          skipped: _n,
          failed: _n,
          given_up: _n,
          emailAssumed: _n,
          permissionHeld: _n,
        }),
        attachmentsSkippedReason: dl(["plan", "storage"]).nullable(),
        nextSyncAt: Ds,
        nextPermissionRetryAt: Ds,
        lastSyncedAt: Ds,
      }),
    ).max(25),
  }),
  Bm = Gt({
    items: ec(
      Gt({ gmailMessageId: Ft().regex(/^[0-9a-f]+$/), reasonCode: Ft() }),
    ).max(25),
    cursor: Ft().nullable(),
  }),
  yT = "https://kindhearted-mallard-511.convex.site",
  pT = Gt({ code: Ft() }),
  ml = class extends Error {
    code;
    constructor(n) {
      (super(n), (this.code = n));
    }
  };
async function pt(n, i, u, c) {
  let s = await n.getToken();
  for (let h = 0; h < 2; h++) {
    const d = await fetch(`${yT}${i}`, {
      method: "POST",
      redirect: "error",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${s}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(u),
      signal: AbortSignal.timeout(2e4),
    });
    if (d.status === 401 && h === 0) {
      s = await n.refreshToken();
      continue;
    }
    const v = await d.json();
    if (!d.ok) {
      const z = pT.safeParse(v);
      throw new ml(z.success ? z.data.code : "service_unavailable");
    }
    const b = c.safeParse(v);
    if (!b.success) throw new ml("service_unavailable");
    return b.data;
  }
  throw new ml("press_access_changed");
}
function bT(n, i) {
  return n === null ? "unchecked" : i - n > 10 * 6e4 ? "delayed" : "recent";
}
var ST = Pt((n) => {
    var i = Symbol.for("react.transitional.element"),
      u = Symbol.for("react.fragment");
    function c(s, h, d) {
      var v = null;
      if (
        (d !== void 0 && (v = "" + d),
        h.key !== void 0 && (v = "" + h.key),
        "key" in h)
      ) {
        d = {};
        for (var b in h) b !== "key" && (d[b] = h[b]);
      } else d = h;
      return (
        (h = d.ref),
        { $$typeof: i, type: s, key: v, ref: h !== void 0 ? h : null, props: d }
      );
    }
    ((n.Fragment = u), (n.jsx = c), (n.jsxs = c));
  }),
  _T = Pt((n, i) => {
    i.exports = ST();
  }),
  Q = _T(),
  ks = "gmail-connect-retry",
  ga = Gt({}),
  TT = {
    press_access_changed:
      "Press access changed. Reopen the Gmail page to resume.",
    page_write_refused: "You need write access to change this connection.",
    account_capacity:
      "This service has reached its connection limit. Ask the operator to check hosting capacity.",
    rate_limited: "Too many requests. Wait a minute and try again.",
    start_again: "This connection expired or stopped. Start again.",
    choose_reconnect:
      "This Gmail account already exists here. Use Reconnect Gmail.",
    gmail_account_changed: "Use the same Gmail account for Reconnect.",
    invalid_finish_code:
      "The finish code is not valid. Copy it from the Google callback page.",
    connection_changed: "The connection changed. Refresh this page.",
    google_reconnect_needed: "Use Reconnect Gmail for this account.",
    attempt_expired: "This connection expired. Start again.",
  };
function Vu(n) {
  return n instanceof ml
    ? (TT[n.code] ??
        "Gmail service is unavailable. Retry or ask the operator to check Convex.")
    : "Gmail service is unavailable. Retry or ask the operator to check Convex.";
}
function qs() {
  return [...crypto.getRandomValues(new Uint8Array(32))]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
}
function Gu(n) {
  return n === null ? "—" : new Date(n).toLocaleString();
}
function zT({ client: n }) {
  const [i, u] = (0, Ze.useState)(null),
    [c, s] = (0, Ze.useState)("loading"),
    [h, d] = (0, Ze.useState)(null),
    [v, b] = (0, Ze.useState)(!1),
    [z, _] = (0, Ze.useState)(null),
    [q, w] = (0, Ze.useState)(""),
    [x, K] = (0, Ze.useState)(""),
    [Te, xe] = (0, Ze.useState)(null),
    [Fe, qe] = (0, Ze.useState)(null),
    [P, X] = (0, Ze.useState)(Date.now()),
    [ne, ae] = (0, Ze.useState)(null),
    ge = (0, Ze.useId)(),
    F = (0, Ze.useRef)(null),
    ye = (0, Ze.useRef)(!1),
    V = (0, Ze.useRef)(!1),
    de = (0, Ze.useRef)(new Set()),
    me = (0, Ze.useRef)(!1),
    Ne = (0, Ze.useRef)(0);
  function De(k) {
    ((F.current = k),
      k
        ? sessionStorage.setItem(ks, JSON.stringify(k))
        : (sessionStorage.removeItem(ks), _(null), w(""), ae(null), K("")));
  }
  const We = (0, Ze.useCallback)(async () => {
    if (V.current) return;
    V.current = !0;
    const k = Ne.current;
    try {
      const I = await pt(n, "/page/status", { cursor: Te }, gT);
      if (!me.current || k !== Ne.current) return;
      if ((u(I), s("ready"), X(Date.now()), ye.current))
        if (I.attempt && F.current?.attemptId !== I.attempt.attemptId) {
          const g = {
            binding: I.binding,
            clientRequestId: I.attempt.clientRequestId,
            accountId: I.attempt.accountId,
            attemptId: I.attempt.attemptId,
          };
          if ((De(g), I.canWrite))
            try {
              const R = await pt(
                n,
                "/page/connect/start",
                { clientRequestId: g.clientRequestId, accountId: g.accountId },
                Hu,
              );
              me.current && _(R.consentUrl ?? null);
            } catch (R) {
              me.current && d(Vu(R));
            }
        } else !I.attempt && F.current?.attemptId && De(null);
      else {
        ye.current = !0;
        let g = null;
        try {
          const R = vT.safeParse(
            JSON.parse(sessionStorage.getItem(ks) ?? "null"),
          );
          R.success && (g = R.data);
        } catch {}
        if (
          ((g &&
            Object.entries(I.binding).every(([R, Z]) => g.binding[R] === Z)) ||
            (g = null),
          I.attempt
            ? (g = {
                binding: I.binding,
                clientRequestId: I.attempt.clientRequestId,
                accountId: I.attempt.accountId,
                attemptId: I.attempt.attemptId,
              })
            : g?.attemptId && (g = null),
          De(g),
          g && I.canWrite)
        )
          try {
            const R = await pt(
              n,
              "/page/connect/start",
              { clientRequestId: g.clientRequestId, accountId: g.accountId },
              Hu,
            );
            me.current &&
              (De({ ...g, attemptId: R.attemptId }), _(R.consentUrl ?? null));
          } catch (R) {
            me.current && d(Vu(R));
          }
      }
      for (const g of I.accounts) {
        const R = `${g.accountId}:${g.connectionGeneration}`;
        if (g.canRepair && !de.current.has(R)) {
          de.current.add(R);
          try {
            await pt(
              n,
              "/page/press-repair",
              {
                accountId: g.accountId,
                expectedGeneration: g.connectionGeneration,
                clientRequestId: qs(),
              },
              ga,
            );
          } catch (Z) {
            me.current && d(Vu(Z));
          }
        }
      }
    } catch {
      me.current && s("unavailable");
    } finally {
      ((V.current = !1),
        me.current &&
          document.visibilityState === "visible" &&
          k !== Ne.current &&
          We());
    }
  }, [n, Te]);
  (0, Ze.useEffect)(() => {
    me.current = !0;
    let k = null;
    function I() {
      (Ne.current++,
        k !== null && (clearInterval(k), (k = null)),
        document.visibilityState === "visible" &&
          (s("loading"),
          X(Date.now()),
          We(),
          (k = setInterval(() => {
            document.visibilityState === "visible" && We();
          }, 5e3))));
    }
    return (
      I(),
      document.addEventListener("visibilitychange", I),
      () => {
        ((me.current = !1),
          Ne.current++,
          k !== null && clearInterval(k),
          document.removeEventListener("visibilitychange", I));
      }
    );
  }, [We]);
  async function j(k) {
    (b(!0), d(null));
    try {
      (await k(), await We());
    } catch (I) {
      (d(Vu(I)),
        I instanceof ml &&
          [
            "start_again",
            "attempt_expired",
            "choose_reconnect",
            "gmail_account_changed",
          ].includes(I.code) &&
          De(null));
    } finally {
      b(!1);
    }
  }
  async function U(k) {
    if (!i) return;
    const I = {
      binding: i.binding,
      clientRequestId: qs(),
      accountId: k,
      attemptId: null,
    };
    De(I);
    const g = await pt(
      n,
      "/page/connect/start",
      { clientRequestId: I.clientRequestId, accountId: k },
      Hu,
    );
    (De({ ...I, attemptId: g.attemptId }), _(g.consentUrl ?? null));
  }
  async function B() {
    try {
      (await navigator.clipboard.writeText(z), K("Link copied"));
    } catch {
      K("Select and copy the link below.");
    }
  }
  const W = i?.attempt;
  return (0, Q.jsxs)("main", {
    className: "GmailPage",
    "data-gmail-service-status": c,
    children: [
      (0, Q.jsx)("h1", { children: "Gmail" }),
      (0, Q.jsx)("p", {
        children:
          "Save sent and received emails in Files. People with file access can read them.",
      }),
      h &&
        (0, Q.jsx)("p", {
          role: "alert",
          className: "GmailError",
          children: h,
        }),
      c !== "ready"
        ? (0, Q.jsxs)("section", {
            children: [
              (0, Q.jsx)("p", {
                role: "status",
                children:
                  c === "loading"
                    ? "Loading Gmail status…"
                    : "Gmail service is unavailable. Retry or ask the operator to check Convex.",
              }),
              c === "unavailable" &&
                (0, Q.jsx)("button", {
                  disabled: v,
                  onClick: () => void We(),
                  children: "Retry",
                }),
            ],
          })
        : i &&
          (0, Q.jsxs)(Q.Fragment, {
            children: [
              !i.canWrite &&
                (0, Q.jsx)("p", {
                  children:
                    "You can view this page. Write access is needed to change a connection.",
                }),
              !W &&
                (0, Q.jsx)("button", {
                  disabled: v || !i.canWrite,
                  onClick: () => void j(() => U(null)),
                  children: "Connect Gmail",
                }),
              W &&
                (0, Q.jsxs)("section", {
                  className: "GmailCard",
                  "data-gmail-connect-status": W.status,
                  children: [
                    (0, Q.jsx)("h2", { children: "Connect Gmail" }),
                    (0, Q.jsxs)("p", {
                      children: [
                        "Organization ID: ",
                        (0, Q.jsx)("code", {
                          children: i.binding.organizationId,
                        }),
                        (0, Q.jsx)("br", {}),
                        "Workspace ID: ",
                        (0, Q.jsx)("code", { children: i.binding.workspaceId }),
                      ],
                    }),
                    (0, Q.jsx)("p", {
                      children:
                        "Open this link in a new tab. Allow access. Copy the finish code back here. Compare these IDs with the callback page.",
                    }),
                    z
                      ? (0, Q.jsxs)(Q.Fragment, {
                          children: [
                            (0, Q.jsx)("button", {
                              onClick: () => void B(),
                              children: "Copy link",
                            }),
                            (0, Q.jsx)("p", {
                              className: "GmailLink",
                              children: z,
                            }),
                          ],
                        })
                      : (0, Q.jsxs)(Q.Fragment, {
                          children: [
                            (0, Q.jsx)("p", {
                              role: "status",
                              children:
                                W.status === "awaiting_finish"
                                  ? "Google confirmed the account. Paste the finish code below."
                                  : "Preparing the Google link…",
                            }),
                            W.status !== "awaiting_finish" &&
                              (0, Q.jsx)("button", {
                                disabled: v || !i.canWrite,
                                onClick: () =>
                                  void j(async () => {
                                    const k = await pt(
                                      n,
                                      "/page/connect/start",
                                      {
                                        clientRequestId: W.clientRequestId,
                                        accountId: W.accountId,
                                      },
                                      Hu,
                                    );
                                    _(k.consentUrl ?? null);
                                  }),
                                children: "Retry connection link",
                              }),
                          ],
                        }),
                    x && (0, Q.jsx)("p", { role: "status", children: x }),
                    (0, Q.jsxs)("form", {
                      noValidate: !0,
                      onSubmit: (k) => {
                        if (
                          (k.preventDefault(), !k.currentTarget.checkValidity())
                        ) {
                          ae(
                            "Enter the 64-character finish code from the callback page.",
                          );
                          return;
                        }
                        j(async () => {
                          (await pt(
                            n,
                            "/page/connect/finish",
                            { attemptId: W.attemptId, finishCode: q },
                            ga,
                          ),
                            De(null));
                        });
                      },
                      children: [
                        (0, Q.jsx)("label", {
                          htmlFor: ge,
                          children: "Finish code",
                        }),
                        (0, Q.jsx)("input", {
                          id: ge,
                          value: q,
                          onChange: (k) => {
                            (w(k.target.value.trim()), ae(null));
                          },
                          required: !0,
                          pattern: "[0-9a-f]{64}",
                          minLength: 64,
                          maxLength: 64,
                          autoComplete: "off",
                          spellCheck: !1,
                        }),
                        ne && (0, Q.jsx)("p", { role: "alert", children: ne }),
                        (0, Q.jsxs)("div", {
                          className: "GmailActions",
                          children: [
                            (0, Q.jsx)("button", {
                              type: "submit",
                              disabled: v || !i.canWrite,
                              children: "Finish connection",
                            }),
                            (0, Q.jsx)("button", {
                              type: "button",
                              disabled: v || !i.canWrite,
                              onClick: () =>
                                void j(async () => {
                                  (await pt(
                                    n,
                                    "/page/connect/cancel",
                                    { attemptId: W.attemptId },
                                    ga,
                                  ),
                                    De(null));
                                }),
                              children: "Cancel connection",
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, Q.jsxs)("p", {
                      children: [
                        "Expires at ",
                        Gu(W.expiresAt),
                        ". Do not share the finish code.",
                      ],
                    }),
                  ],
                }),
              i.accounts.map((k) => {
                const I = bT(k.lastSyncedAt, P),
                  g = {
                    accountId: k.accountId,
                    expectedGeneration: k.connectionGeneration,
                  },
                  R = k.ledgerCounts.permissionHeld,
                  Z = k.syncStatus === "blocked" || k.syncStatus === "error";
                return (0, Q.jsxs)(
                  "section",
                  {
                    className: "GmailCard",
                    "data-gmail-sync-status": k.syncStatus,
                    "data-gmail-check-status": I,
                    "data-gmail-files-status": R ? "write_refused" : "normal",
                    children: [
                      (0, Q.jsx)("h2", { children: k.emailAddress }),
                      (0, Q.jsxs)("p", {
                        children: [
                          "Destination: ",
                          (0, Q.jsx)("code", { children: k.destinationPath }),
                        ],
                      }),
                      (0, Q.jsx)("p", {
                        role: "status",
                        children:
                          k.syncStatus === "disconnected"
                            ? "Disconnected"
                            : Z && !k.pressReady
                              ? "Press connection needs attention"
                              : k.pressReady
                                ? k.backfillComplete
                                  ? `${k.messagesSynced} emails saved`
                                  : `Backfilling… ${k.messagesSynced} emails saved`
                                : "Finishing Press connection",
                      }),
                      (0, Q.jsxs)("p", {
                        children: [
                          k.messagesSkipped,
                          " skipped.",
                          " ",
                          k.ledgerCounts.pending + k.ledgerCounts.failed,
                          " ",
                          "unfinished. ",
                          k.ledgerCounts.given_up,
                          " failed.",
                        ],
                      }),
                      (0, Q.jsxs)("p", {
                        children: [
                          I === "unchecked"
                            ? "No mail check completed yet"
                            : I === "delayed"
                              ? "Sync is delayed"
                              : !Z &&
                                  k.pressReady &&
                                  k.syncStatus !== "disconnected" &&
                                  !R
                                ? "Checking for new mail"
                                : "Last completed mail check",
                          k.lastSyncedAt !== null &&
                            (0, Q.jsxs)(Q.Fragment, {
                              children: [": ", Gu(k.lastSyncedAt)],
                            }),
                        ],
                      }),
                      R > 0 &&
                        (0, Q.jsxs)("p", {
                          className: "GmailAttention",
                          children: [
                            "Some saves were refused by Files. ",
                            R,
                            " emails are waiting for access. Check the connecting member and Gmail service account Can write on the workspace, destination and restricted folders. Permission retries are limited while access is refused.",
                            k.nextPermissionRetryAt !== null &&
                              (0, Q.jsxs)(Q.Fragment, {
                                children: [
                                  " ",
                                  "Next permission retry:",
                                  " ",
                                  Gu(k.nextPermissionRetryAt),
                                  ".",
                                ],
                              }),
                          ],
                        }),
                      k.attachmentsSkippedReason &&
                        (0, Q.jsxs)("p", {
                          children: [
                            "Some attachments were not saved because of the workspace",
                            " ",
                            k.attachmentsSkippedReason === "plan"
                              ? "plan"
                              : "storage limit",
                            ". New emails will check again.",
                          ],
                        }),
                      k.ledgerCounts.emailAssumed > 0 &&
                        (0, Q.jsxs)("p", {
                          children: [
                            k.ledgerCounts.emailAssumed,
                            " email saves were assumed because the path already existed.",
                          ],
                        }),
                      k.sourceError === "google_revoked" &&
                        (0, Q.jsx)("p", {
                          children: "Google access stopped. Reconnect Gmail.",
                        }),
                      ["gmail_request", "history_response_too_large"].includes(
                        k.sourceError ?? "",
                      ) &&
                        (0, Q.jsx)("p", {
                          children:
                            "Gmail could not complete a request. Retry sync or ask the operator to check the source limit.",
                        }),
                      k.syncError === "credits" &&
                        (0, Q.jsx)("p", {
                          children: "Add credits in Billing.",
                        }),
                      k.canRepair &&
                        (0, Q.jsx)("p", {
                          children: "Press access needs repair.",
                        }),
                      k.syncError === "actor_lost" &&
                        (0, Q.jsx)("p", {
                          children:
                            "The connecting member lost write access. A writer must reconnect Gmail.",
                        }),
                      [
                        "press_temporary",
                        "gmail_temporary",
                        "sync_error",
                        "credits",
                      ].includes(k.syncError ?? "") &&
                        k.nextSyncAt !== null &&
                        (0, Q.jsxs)("p", {
                          children: ["Retrying at ", Gu(k.nextSyncAt), "."],
                        }),
                      (0, Q.jsxs)("div", {
                        className: "GmailActions",
                        children: [
                          (k.needsReconnect ||
                            k.syncStatus === "disconnected") &&
                            (0, Q.jsx)("button", {
                              disabled: v || !i.canWrite || !!W,
                              onClick: () => void j(() => U(k.accountId)),
                              children: "Reconnect Gmail",
                            }),
                          k.canRepair &&
                            (0, Q.jsx)("button", {
                              disabled: v,
                              onClick: () =>
                                void j(async () => {
                                  await pt(
                                    n,
                                    "/page/press-repair",
                                    { ...g, clientRequestId: qs() },
                                    ga,
                                  );
                                }),
                              children: "Repair Press access",
                            }),
                          k.sourceError !== "google_revoked" &&
                            k.sourceError !== null &&
                            (0, Q.jsx)("button", {
                              disabled: v || !i.canWrite,
                              onClick: () =>
                                void j(async () => {
                                  await pt(n, "/page/retry-sync", g, ga);
                                }),
                              children: "Retry sync",
                            }),
                          k.ledgerCounts.given_up > 0 &&
                            (0, Q.jsxs)(Q.Fragment, {
                              children: [
                                (0, Q.jsx)("button", {
                                  disabled: v,
                                  onClick: () =>
                                    void j(async () => {
                                      qe({
                                        accountId: k.accountId,
                                        page: await pt(
                                          n,
                                          "/page/failures",
                                          { accountId: k.accountId },
                                          Bm,
                                        ),
                                      });
                                    }),
                                  children: "View failed emails",
                                }),
                                (0, Q.jsx)("button", {
                                  disabled:
                                    v ||
                                    !i.canWrite ||
                                    k.syncStatus === "disconnected",
                                  onClick: () =>
                                    void j(async () => {
                                      await pt(n, "/page/retry-failed", g, ga);
                                    }),
                                  children: "Retry failed emails",
                                }),
                              ],
                            }),
                          k.syncStatus !== "disconnected" &&
                            (0, Q.jsx)("button", {
                              disabled: v || !i.canWrite,
                              onClick: () =>
                                void j(async () => {
                                  (await pt(n, "/page/disconnect", g, ga),
                                    De(null));
                                }),
                              children: "Disconnect",
                            }),
                        ],
                      }),
                      Fe?.accountId === k.accountId &&
                        (0, Q.jsxs)("div", {
                          children: [
                            (0, Q.jsx)("ul", {
                              children: Fe.page.items.map((L) =>
                                (0, Q.jsxs)(
                                  "li",
                                  {
                                    children: [
                                      (0, Q.jsx)("code", {
                                        children: L.gmailMessageId,
                                      }),
                                      ":",
                                      " ",
                                      L.reasonCode,
                                    ],
                                  },
                                  L.gmailMessageId,
                                ),
                              ),
                            }),
                            Fe.page.cursor &&
                              (0, Q.jsx)("button", {
                                disabled: v,
                                onClick: () =>
                                  void j(async () => {
                                    qe({
                                      accountId: k.accountId,
                                      page: await pt(
                                        n,
                                        "/page/failures",
                                        {
                                          accountId: k.accountId,
                                          cursor: Fe.page.cursor,
                                        },
                                        Bm,
                                      ),
                                    });
                                  }),
                                children: "More failed emails",
                              }),
                          ],
                        }),
                    ],
                  },
                  k.accountId,
                );
              }),
              (0, Q.jsxs)("div", {
                className: "GmailActions",
                children: [
                  Te !== null &&
                    (0, Q.jsx)("button", {
                      disabled: v,
                      onClick: () => xe(null),
                      children: "First accounts",
                    }),
                  i.cursor !== null &&
                    (0, Q.jsx)("button", {
                      disabled: v,
                      onClick: () => xe(i.cursor),
                      children: "More accounts",
                    }),
                ],
              }),
              (0, Q.jsx)("p", {
                className: "GmailLimits",
                children:
                  "Bodies are limited to 2 MiB and may be shortened. Up to 16 attachments per email, each up to 32 MiB. Attachments use the workspace upload plan and credits.",
              }),
              (0, Q.jsx)("p", {
                children:
                  "Disconnect Gmail before uninstalling this plugin. This clears its saved Gmail access. Files stay. Removing the app in Google Account Security stops all its workspace connections.",
              }),
            ],
          }),
    ],
  });
}
var kv = document.getElementById("root");
if (!kv) throw new Error("index.html is missing the #root element");
var Vs = (0, mT.createRoot)(kv);
Vs.render(
  (0, Q.jsx)("main", {
    className: "GmailPage",
    role: "status",
    children: "Connecting to Press…",
  }),
);
k0().then(
  (n) => {
    (n.context.kind === "page" && (document.title = n.context.pageTitle),
      Vs.render((0, Q.jsx)(zT, { client: n })));
  },
  () =>
    Vs.render(
      (0, Q.jsx)("main", {
        className: "GmailPage",
        role: "alert",
        children: "Press access changed. Reopen the Gmail page.",
      }),
    ),
);
