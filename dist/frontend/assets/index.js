var Bg = Object.create,
  cd = Object.defineProperty,
  Hg = Object.getOwnPropertyDescriptor,
  Lg = Object.getOwnPropertyNames,
  Vg = Object.getPrototypeOf,
  xg = Object.prototype.hasOwnProperty,
  Be = (u, c) => () => (
    c || (u((c = { exports: {} }).exports, c), (u = null)),
    c.exports
  ),
  jg = (u, c, o, h) => {
    if ((c && typeof c == "object") || typeof c == "function")
      for (var f = Lg(c), m = 0, A = f.length, z; m < A; m++)
        ((z = f[m]),
          !xg.call(u, z) &&
            z !== o &&
            cd(u, z, {
              get: ((U) => c[U]).bind(null, z),
              enumerable: !(h = Hg(c, z)) || h.enumerable,
            }));
    return u;
  },
  Yg = (u, c, o) => (
    (o = u != null ? Bg(Vg(u)) : {}),
    jg(
      c || !u || !u.__esModule
        ? cd(o, "default", { value: u, enumerable: !0 })
        : o,
      u,
    )
  );
(function () {
  const c = document.createElement("link").relList;
  if (c && c.supports && c.supports("modulepreload")) return;
  for (const f of document.querySelectorAll('link[rel="modulepreload"]')) h(f);
  new MutationObserver((f) => {
    for (const m of f)
      if (m.type === "childList")
        for (const A of m.addedNodes)
          A.tagName === "LINK" && A.rel === "modulepreload" && h(A);
  }).observe(document, { childList: !0, subtree: !0 });
  function o(f) {
    const m = {};
    return (
      f.integrity && (m.integrity = f.integrity),
      f.referrerPolicy && (m.referrerPolicy = f.referrerPolicy),
      f.crossOrigin === "use-credentials"
        ? (m.credentials = "include")
        : f.crossOrigin === "anonymous"
          ? (m.credentials = "omit")
          : (m.credentials = "same-origin"),
      m
    );
  }
  function h(f) {
    if (f.ep) return;
    f.ep = !0;
    const m = o(f);
    fetch(f.href, m);
  }
})();
var Gg = Be((u) => {
    var c = Symbol.for("react.transitional.element"),
      o = Symbol.for("react.portal"),
      h = Symbol.for("react.fragment"),
      f = Symbol.for("react.strict_mode"),
      m = Symbol.for("react.profiler"),
      A = Symbol.for("react.consumer"),
      z = Symbol.for("react.context"),
      U = Symbol.for("react.forward_ref"),
      D = Symbol.for("react.suspense"),
      O = Symbol.for("react.memo"),
      V = Symbol.for("react.lazy"),
      C = Symbol.for("react.activity"),
      k = Symbol.iterator;
    function At(g) {
      return g === null || typeof g != "object"
        ? null
        : ((g = (k && g[k]) || g["@@iterator"]),
          typeof g == "function" ? g : null);
    }
    var zt = {
        isMounted: function () {
          return !1;
        },
        enqueueForceUpdate: function () {},
        enqueueReplaceState: function () {},
        enqueueSetState: function () {},
      },
      kt = Object.assign,
      Me = {};
    function Vt(g, R, w) {
      ((this.props = g),
        (this.context = R),
        (this.refs = Me),
        (this.updater = w || zt));
    }
    ((Vt.prototype.isReactComponent = {}),
      (Vt.prototype.setState = function (g, R) {
        if (typeof g != "object" && typeof g != "function" && g != null)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables.",
          );
        this.updater.enqueueSetState(this, g, R, "setState");
      }),
      (Vt.prototype.forceUpdate = function (g) {
        this.updater.enqueueForceUpdate(this, g, "forceUpdate");
      }));
    function ct() {}
    ct.prototype = Vt.prototype;
    function tt(g, R, w) {
      ((this.props = g),
        (this.context = R),
        (this.refs = Me),
        (this.updater = w || zt));
    }
    var mt = (tt.prototype = new ct());
    ((mt.constructor = tt),
      kt(mt, Vt.prototype),
      (mt.isPureReactComponent = !0));
    var at = Array.isArray;
    function yt() {}
    var X = { H: null, A: null, T: null, S: null },
      gt = Object.prototype.hasOwnProperty;
    function j(g, R, w) {
      var L = w.ref;
      return {
        $$typeof: c,
        type: g,
        key: R,
        ref: L !== void 0 ? L : null,
        props: w,
      };
    }
    function ft(g, R) {
      return j(g.type, R, g.props);
    }
    function Ct(g) {
      return typeof g == "object" && g !== null && g.$$typeof === c;
    }
    function xt(g) {
      var R = { "=": "=0", ":": "=2" };
      return (
        "$" +
        g.replace(/[=:]/g, function (w) {
          return R[w];
        })
      );
    }
    var de = /\/+/g;
    function Re(g, R) {
      return typeof g == "object" && g !== null && g.key != null
        ? xt("" + g.key)
        : R.toString(36);
    }
    function Q(g) {
      switch (g.status) {
        case "fulfilled":
          return g.value;
        case "rejected":
          throw g.reason;
        default:
          switch (
            (typeof g.status == "string"
              ? g.then(yt, yt)
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
    function q(g, R, w, L, K) {
      var J = typeof g;
      (J === "undefined" || J === "boolean") && (g = null);
      var ut = !1;
      if (g === null) ut = !0;
      else
        switch (J) {
          case "bigint":
          case "string":
          case "number":
            ut = !0;
            break;
          case "object":
            switch (g.$$typeof) {
              case c:
              case o:
                ut = !0;
                break;
              case V:
                return ((ut = g._init), q(ut(g._payload), R, w, L, K));
            }
        }
      if (ut)
        return (
          (K = K(g)),
          (ut = L === "" ? "." + Re(g, 0) : L),
          at(K)
            ? ((w = ""),
              ut != null && (w = ut.replace(de, "$&/") + "/"),
              q(K, R, w, "", function (Xa) {
                return Xa;
              }))
            : K != null &&
              (Ct(K) &&
                (K = ft(
                  K,
                  w +
                    (K.key == null || (g && g.key === K.key)
                      ? ""
                      : ("" + K.key).replace(de, "$&/") + "/") +
                    ut,
                )),
              R.push(K)),
          1
        );
      ut = 0;
      var Kt = L === "" ? "." : L + ":";
      if (at(g))
        for (var Ot = 0; Ot < g.length; Ot++)
          ((L = g[Ot]), (J = Kt + Re(L, Ot)), (ut += q(L, R, w, J, K)));
      else if (((Ot = At(g)), typeof Ot == "function"))
        for (g = Ot.call(g), Ot = 0; !(L = g.next()).done; )
          ((L = L.value), (J = Kt + Re(L, Ot++)), (ut += q(L, R, w, J, K)));
      else if (J === "object") {
        if (typeof g.then == "function") return q(Q(g), R, w, L, K);
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
      return ut;
    }
    function N(g, R, w) {
      if (g == null) return g;
      var L = [],
        K = 0;
      return (
        q(g, L, "", "", function (J) {
          return R.call(w, J, K++);
        }),
        L
      );
    }
    function lt(g) {
      if (g._status === -1) {
        var R = g._result;
        ((R = R()),
          R.then(
            function (w) {
              (g._status === 0 || g._status === -1) &&
                ((g._status = 1), (g._result = w));
            },
            function (w) {
              (g._status === 0 || g._status === -1) &&
                ((g._status = 2), (g._result = w));
            },
          ),
          g._status === -1 && ((g._status = 0), (g._result = R)));
      }
      if (g._status === 1) return g._result.default;
      throw g._result;
    }
    var St =
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
      ae = {
        map: N,
        forEach: function (g, R, w) {
          N(
            g,
            function () {
              R.apply(this, arguments);
            },
            w,
          );
        },
        count: function (g) {
          var R = 0;
          return (
            N(g, function () {
              R++;
            }),
            R
          );
        },
        toArray: function (g) {
          return (
            N(g, function (R) {
              return R;
            }) || []
          );
        },
        only: function (g) {
          if (!Ct(g))
            throw Error(
              "React.Children.only expected to receive a single React element child.",
            );
          return g;
        },
      };
    ((u.Activity = C),
      (u.Children = ae),
      (u.Component = Vt),
      (u.Fragment = h),
      (u.Profiler = m),
      (u.PureComponent = tt),
      (u.StrictMode = f),
      (u.Suspense = D),
      (u.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = X),
      (u.__COMPILER_RUNTIME = {
        __proto__: null,
        c: function (g) {
          return X.H.useMemoCache(g);
        },
      }),
      (u.cache = function (g) {
        return function () {
          return g.apply(null, arguments);
        };
      }),
      (u.cacheSignal = function () {
        return null;
      }),
      (u.cloneElement = function (g, R, w) {
        if (g == null)
          throw Error(
            "The argument must be a React element, but you passed " + g + ".",
          );
        var L = kt({}, g.props),
          K = g.key;
        if (R != null)
          for (J in (R.key !== void 0 && (K = "" + R.key), R))
            !gt.call(R, J) ||
              J === "key" ||
              J === "__self" ||
              J === "__source" ||
              (J === "ref" && R.ref === void 0) ||
              (L[J] = R[J]);
        var J = arguments.length - 2;
        if (J === 1) L.children = w;
        else if (1 < J) {
          for (var ut = Array(J), Kt = 0; Kt < J; Kt++)
            ut[Kt] = arguments[Kt + 2];
          L.children = ut;
        }
        return j(g.type, K, L);
      }),
      (u.createContext = function (g) {
        return (
          (g = {
            $$typeof: z,
            _currentValue: g,
            _currentValue2: g,
            _threadCount: 0,
            Provider: null,
            Consumer: null,
          }),
          (g.Provider = g),
          (g.Consumer = { $$typeof: A, _context: g }),
          g
        );
      }),
      (u.createElement = function (g, R, w) {
        var L,
          K = {},
          J = null;
        if (R != null)
          for (L in (R.key !== void 0 && (J = "" + R.key), R))
            gt.call(R, L) &&
              L !== "key" &&
              L !== "__self" &&
              L !== "__source" &&
              (K[L] = R[L]);
        var ut = arguments.length - 2;
        if (ut === 1) K.children = w;
        else if (1 < ut) {
          for (var Kt = Array(ut), Ot = 0; Ot < ut; Ot++)
            Kt[Ot] = arguments[Ot + 2];
          K.children = Kt;
        }
        if (g && g.defaultProps)
          for (L in ((ut = g.defaultProps), ut))
            K[L] === void 0 && (K[L] = ut[L]);
        return j(g, J, K);
      }),
      (u.createRef = function () {
        return { current: null };
      }),
      (u.forwardRef = function (g) {
        return { $$typeof: U, render: g };
      }),
      (u.isValidElement = Ct),
      (u.lazy = function (g) {
        return {
          $$typeof: V,
          _payload: { _status: -1, _result: g },
          _init: lt,
        };
      }),
      (u.memo = function (g, R) {
        return { $$typeof: O, type: g, compare: R === void 0 ? null : R };
      }),
      (u.startTransition = function (g) {
        var R = X.T,
          w = {};
        X.T = w;
        try {
          var L = g(),
            K = X.S;
          (K !== null && K(w, L),
            typeof L == "object" &&
              L !== null &&
              typeof L.then == "function" &&
              L.then(yt, St));
        } catch (J) {
          St(J);
        } finally {
          (R !== null && w.types !== null && (R.types = w.types), (X.T = R));
        }
      }),
      (u.unstable_useCacheRefresh = function () {
        return X.H.useCacheRefresh();
      }),
      (u.use = function (g) {
        return X.H.use(g);
      }),
      (u.useActionState = function (g, R, w) {
        return X.H.useActionState(g, R, w);
      }),
      (u.useCallback = function (g, R) {
        return X.H.useCallback(g, R);
      }),
      (u.useContext = function (g) {
        return X.H.useContext(g);
      }),
      (u.useDebugValue = function () {}),
      (u.useDeferredValue = function (g, R) {
        return X.H.useDeferredValue(g, R);
      }),
      (u.useEffect = function (g, R) {
        return X.H.useEffect(g, R);
      }),
      (u.useEffectEvent = function (g) {
        return X.H.useEffectEvent(g);
      }),
      (u.useId = function () {
        return X.H.useId();
      }),
      (u.useImperativeHandle = function (g, R, w) {
        return X.H.useImperativeHandle(g, R, w);
      }),
      (u.useInsertionEffect = function (g, R) {
        return X.H.useInsertionEffect(g, R);
      }),
      (u.useLayoutEffect = function (g, R) {
        return X.H.useLayoutEffect(g, R);
      }),
      (u.useMemo = function (g, R) {
        return X.H.useMemo(g, R);
      }),
      (u.useOptimistic = function (g, R) {
        return X.H.useOptimistic(g, R);
      }),
      (u.useReducer = function (g, R, w) {
        return X.H.useReducer(g, R, w);
      }),
      (u.useRef = function (g) {
        return X.H.useRef(g);
      }),
      (u.useState = function (g) {
        return X.H.useState(g);
      }),
      (u.useSyncExternalStore = function (g, R, w) {
        return X.H.useSyncExternalStore(g, R, w);
      }),
      (u.useTransition = function () {
        return X.H.useTransition();
      }),
      (u.version = "19.2.7"));
  }),
  Ys = Be((u, c) => {
    c.exports = Gg();
  }),
  Qe = [],
  Oe = [],
  Xg = Uint8Array,
  qs = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (var Ha = 0, Zg = qs.length; Ha < Zg; ++Ha)
  ((Qe[Ha] = qs[Ha]), (Oe[qs.charCodeAt(Ha)] = Ha));
Oe[45] = 62;
Oe[95] = 63;
function kg(u) {
  var c = u.length;
  if (c % 4 > 0)
    throw new Error("Invalid string. Length must be a multiple of 4");
  var o = u.indexOf("=");
  o === -1 && (o = c);
  var h = o === c ? 0 : 4 - (o % 4);
  return [o, h];
}
function Kg(u, c, o) {
  return ((c + o) * 3) / 4 - o;
}
function Vl(u) {
  var c,
    o = kg(u),
    h = o[0],
    f = o[1],
    m = new Xg(Kg(u, h, f)),
    A = 0,
    z = f > 0 ? h - 4 : h,
    U;
  for (U = 0; U < z; U += 4)
    ((c =
      (Oe[u.charCodeAt(U)] << 18) |
      (Oe[u.charCodeAt(U + 1)] << 12) |
      (Oe[u.charCodeAt(U + 2)] << 6) |
      Oe[u.charCodeAt(U + 3)]),
      (m[A++] = (c >> 16) & 255),
      (m[A++] = (c >> 8) & 255),
      (m[A++] = c & 255));
  return (
    f === 2 &&
      ((c = (Oe[u.charCodeAt(U)] << 2) | (Oe[u.charCodeAt(U + 1)] >> 4)),
      (m[A++] = c & 255)),
    f === 1 &&
      ((c =
        (Oe[u.charCodeAt(U)] << 10) |
        (Oe[u.charCodeAt(U + 1)] << 4) |
        (Oe[u.charCodeAt(U + 2)] >> 2)),
      (m[A++] = (c >> 8) & 255),
      (m[A++] = c & 255)),
    m
  );
}
function Jg(u) {
  return (
    Qe[(u >> 18) & 63] + Qe[(u >> 12) & 63] + Qe[(u >> 6) & 63] + Qe[u & 63]
  );
}
function $g(u, c, o) {
  for (var h, f = [], m = c; m < o; m += 3)
    ((h =
      ((u[m] << 16) & 16711680) + ((u[m + 1] << 8) & 65280) + (u[m + 2] & 255)),
      f.push(Jg(h)));
  return f.join("");
}
function xl(u) {
  for (
    var c, o = u.length, h = o % 3, f = [], m = 16383, A = 0, z = o - h;
    A < z;
    A += m
  )
    f.push($g(u, A, A + m > z ? z : A + m));
  return (
    h === 1
      ? ((c = u[o - 1]), f.push(Qe[c >> 2] + Qe[(c << 4) & 63] + "=="))
      : h === 2 &&
        ((c = (u[o - 2] << 8) + u[o - 1]),
        f.push(Qe[c >> 10] + Qe[(c >> 4) & 63] + Qe[(c << 2) & 63] + "=")),
    f.join("")
  );
}
function zn(u) {
  if (u === void 0) return {};
  if (!sd(u))
    throw new Error(
      `The arguments to a Convex function must be an object. Received: ${u}`,
    );
  return u;
}
function Fg(u) {
  if (typeof u > "u")
    throw new Error(
      "Client created with undefined deployment address. If you used an environment variable, check that it's set.",
    );
  if (typeof u != "string")
    throw new Error(`Invalid deployment address: found ${u}".`);
  if (!(u.startsWith("http:") || u.startsWith("https:")))
    throw new Error(
      `Invalid deployment address: Must start with "https://" or "http://". Found "${u}".`,
    );
  try {
    new URL(u);
  } catch {
    throw new Error(
      `Invalid deployment address: "${u}" is not a valid URL. If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`,
    );
  }
  if (u.endsWith(".convex.site"))
    throw new Error(
      `Invalid deployment address: "${u}" ends with .convex.site, which is used for HTTP Actions. Convex deployment URLs typically end with .convex.cloud? If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`,
    );
}
function sd(u) {
  const c = typeof u == "object",
    o = Object.getPrototypeOf(u),
    h =
      o === null || o === Object.prototype || o?.constructor?.name === "Object";
  return c && h;
}
var od = !0,
  Ya = BigInt("-9223372036854775808"),
  Gs = BigInt("9223372036854775807"),
  Bs = BigInt("0"),
  Wg = BigInt("8"),
  Ig = BigInt("256");
function fd(u) {
  return Number.isNaN(u) || !Number.isFinite(u) || Object.is(u, -0);
}
function Pg(u) {
  u < Bs && (u -= Ya + Ya);
  let c = u.toString(16);
  c.length % 2 === 1 && (c = "0" + c);
  const o = new Uint8Array(new ArrayBuffer(8));
  let h = 0;
  for (const f of c.match(/.{2}/g).reverse())
    (o.set([parseInt(f, 16)], h++), (u >>= Wg));
  return xl(o);
}
function tv(u) {
  const c = Vl(u);
  if (c.byteLength !== 8)
    throw new Error(`Received ${c.byteLength} bytes, expected 8 for $integer`);
  let o = Bs,
    h = Bs;
  for (const f of c) ((o += BigInt(f) * Ig ** h), h++);
  return (o > Gs && (o += Ya + Ya), o);
}
function ev(u) {
  if (u < Ya || Gs < u)
    throw new Error(`BigInt ${u} does not fit into a 64-bit signed integer.`);
  const c = new ArrayBuffer(8);
  return (new DataView(c).setBigInt64(0, u, !0), xl(new Uint8Array(c)));
}
function nv(u) {
  const c = Vl(u);
  if (c.byteLength !== 8)
    throw new Error(`Received ${c.byteLength} bytes, expected 8 for $integer`);
  return new DataView(c.buffer).getBigInt64(0, !0);
}
var av = DataView.prototype.setBigInt64 ? ev : Pg,
  lv = DataView.prototype.getBigInt64 ? nv : tv,
  Gh = 1024;
function Hs(u) {
  if (u.length > Gh)
    throw new Error(`Field name ${u} exceeds maximum field name length ${Gh}.`);
  if (u.startsWith("$"))
    throw new Error(`Field name ${u} starts with a '$', which is reserved.`);
  for (let c = 0; c < u.length; c += 1) {
    const o = u.charCodeAt(c);
    if (o < 32 || o >= 127)
      throw new Error(
        `Field name ${u} has invalid character '${u[c]}': Field names can only contain non-control ASCII characters`,
      );
  }
}
function Ga(u) {
  if (
    u === null ||
    typeof u == "boolean" ||
    typeof u == "number" ||
    typeof u == "string"
  )
    return u;
  if (Array.isArray(u)) return u.map((h) => Ga(h));
  if (typeof u != "object") throw new Error(`Unexpected type of ${u}`);
  const c = Object.entries(u);
  if (c.length === 1) {
    const h = c[0][0];
    if (h === "$bytes") {
      if (typeof u.$bytes != "string")
        throw new Error(`Malformed $bytes field on ${u}`);
      return Vl(u.$bytes).buffer;
    }
    if (h === "$integer") {
      if (typeof u.$integer != "string")
        throw new Error(`Malformed $integer field on ${u}`);
      return lv(u.$integer);
    }
    if (h === "$float") {
      if (typeof u.$float != "string")
        throw new Error(`Malformed $float field on ${u}`);
      const f = Vl(u.$float);
      if (f.byteLength !== 8)
        throw new Error(
          `Received ${f.byteLength} bytes, expected 8 for $float`,
        );
      const m = new DataView(f.buffer).getFloat64(0, od);
      if (!fd(m)) throw new Error(`Float ${m} should be encoded as a number`);
      return m;
    }
    if (h === "$set")
      throw new Error(
        "Received a Set which is no longer supported as a Convex type.",
      );
    if (h === "$map")
      throw new Error(
        "Received a Map which is no longer supported as a Convex type.",
      );
  }
  const o = {};
  for (const [h, f] of Object.entries(u)) (Hs(h), (o[h] = Ga(f)));
  return o;
}
var Xh = 16384;
function ja(u) {
  const c = JSON.stringify(u, (o, h) =>
    h === void 0 ? "undefined" : typeof h == "bigint" ? `${h.toString()}n` : h,
  );
  if (c.length > Xh) {
    const o = "[...truncated]";
    let h = Xh - 14;
    const f = c.codePointAt(h - 1);
    return (f !== void 0 && f > 65535 && (h -= 1), c.substring(0, h) + o);
  }
  return c;
}
function ou(u, c, o, h) {
  if (u === void 0) {
    const A = o && ` (present at path ${o} in original object ${ja(c)})`;
    throw new Error(
      `undefined is not a valid Convex value${A}. To learn about Convex's supported types, see https://docs.convex.dev/using/types.`,
    );
  }
  if (u === null) return u;
  if (typeof u == "bigint") {
    if (u < Ya || Gs < u)
      throw new Error(`BigInt ${u} does not fit into a 64-bit signed integer.`);
    return { $integer: av(u) };
  }
  if (typeof u == "number")
    if (fd(u)) {
      const A = new ArrayBuffer(8);
      return (
        new DataView(A).setFloat64(0, u, od),
        { $float: xl(new Uint8Array(A)) }
      );
    } else return u;
  if (typeof u == "boolean" || typeof u == "string") return u;
  if (u instanceof ArrayBuffer) return { $bytes: xl(new Uint8Array(u)) };
  if (Array.isArray(u)) return u.map((A, z) => ou(A, c, o + `[${z}]`, !1));
  if (u instanceof Set) throw new Error(Ds(o, "Set", [...u], c));
  if (u instanceof Map) throw new Error(Ds(o, "Map", [...u], c));
  if (!sd(u)) {
    const A = u?.constructor?.name,
      z = A ? `${A} ` : "";
    throw new Error(Ds(o, z, u, c));
  }
  const f = {},
    m = Object.entries(u);
  m.sort(([A, z], [U, D]) => (A === U ? 0 : A < U ? -1 : 1));
  for (const [A, z] of m)
    z !== void 0
      ? (Hs(A), (f[A] = ou(z, c, o + `.${A}`, !1)))
      : h && (Hs(A), (f[A] = iv(z, c, o + `.${A}`)));
  return f;
}
function Ds(u, c, o, h) {
  return u
    ? `${c}${ja(o)} is not a supported Convex type (present at path ${u} in original object ${ja(h)}). To learn about Convex's supported types, see https://docs.convex.dev/using/types.`
    : `${c}${ja(o)} is not a supported Convex type.`;
}
function iv(u, c, o) {
  if (u === void 0) return { $undefined: null };
  if (c === void 0)
    throw new Error(
      `Programming error. Current value is ${ja(u)} but original value is undefined`,
    );
  return ou(u, c, o, !1);
}
function In(u) {
  return ou(u, u, "", !1);
}
var uv = Object.defineProperty,
  cv = (u, c, o) =>
    c in u
      ? uv(u, c, { enumerable: !0, configurable: !0, writable: !0, value: o })
      : (u[c] = o),
  ws = (u, c, o) => cv(u, typeof c != "symbol" ? c + "" : c, o),
  Zh,
  kh,
  sv = Symbol.for("ConvexError"),
  Ls = class extends ((kh = Error), (Zh = sv), kh) {
    constructor(u) {
      (super(typeof u == "string" ? u : ja(u)),
        ws(this, "name", "ConvexError"),
        ws(this, "data"),
        ws(this, Zh, !0),
        (this.data = u));
    }
  },
  Kh = "1.42.2",
  ov = Object.defineProperty,
  fv = (u, c, o) =>
    c in u
      ? ov(u, c, { enumerable: !0, configurable: !0, writable: !0, value: o })
      : (u[c] = o),
  Jh = (u, c, o) => fv(u, typeof c != "symbol" ? c + "" : c, o),
  rv = "color:rgb(0, 145, 255)";
function rd(u) {
  switch (u) {
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
var hd = class {
  constructor(u) {
    (Jh(this, "_onLogLineFuncs"),
      Jh(this, "_verbose"),
      (this._onLogLineFuncs = {}),
      (this._verbose = u.verbose));
  }
  addLogLineListener(u) {
    let c = Math.random().toString(36).substring(2, 15);
    for (let o = 0; o < 10 && this._onLogLineFuncs[c] !== void 0; o++)
      c = Math.random().toString(36).substring(2, 15);
    return (
      (this._onLogLineFuncs[c] = u),
      () => {
        delete this._onLogLineFuncs[c];
      }
    );
  }
  logVerbose(...u) {
    if (this._verbose)
      for (const c of Object.values(this._onLogLineFuncs))
        c("debug", `${new Date().toISOString()}`, ...u);
  }
  log(...u) {
    for (const c of Object.values(this._onLogLineFuncs)) c("info", ...u);
  }
  warn(...u) {
    for (const c of Object.values(this._onLogLineFuncs)) c("warn", ...u);
  }
  error(...u) {
    for (const c of Object.values(this._onLogLineFuncs)) c("error", ...u);
  }
};
function dd(u) {
  const c = new hd(u);
  return (
    c.addLogLineListener((o, ...h) => {
      switch (o) {
        case "debug":
          console.debug(...h);
          break;
        case "info":
          console.log(...h);
          break;
        case "warn":
          console.warn(...h);
          break;
        case "error":
          console.error(...h);
          break;
        default:
          console.log(...h);
      }
    }),
    c
  );
}
function yd(u) {
  return new hd(u);
}
function fu(u, c, o, h, f) {
  const m = rd(o);
  if (
    (typeof f == "object" &&
      (f = `ConvexError ${JSON.stringify(f.errorData, null, 2)}`),
    c === "info")
  ) {
    const A = f.match(/^\[.*?\] /);
    if (A === null) {
      u.error(`[CONVEX ${m}(${h})] Could not parse console.log`);
      return;
    }
    const z = f.slice(1, A[0].length - 2),
      U = f.slice(A[0].length);
    u.log(`%c[CONVEX ${m}(${h})] [${z}]`, rv, U);
  } else u.error(`[CONVEX ${m}(${h})] ${f}`);
}
function hv(u, c) {
  const o = `[CONVEX FATAL ERROR] ${c}`;
  return (u.error(o), new Error(o));
}
function xa(u, c, o) {
  return `[CONVEX ${rd(u)}(${c})] ${o.errorMessage}
  Called by client`;
}
function Vs(u, c) {
  return ((c.data = u.errorData), c);
}
function Pn(u) {
  const c = u.split(":");
  let o, h;
  return (
    c.length === 1
      ? ((o = c[0]), (h = "default"))
      : ((o = c.slice(0, c.length - 1).join(":")), (h = c[c.length - 1])),
    o.endsWith(".js") && (o = o.slice(0, -3)),
    `${o}:${h}`
  );
}
function Wn(u, c) {
  return JSON.stringify({ udfPath: Pn(u), args: In(c) });
}
function $h(u, c, o) {
  const { initialNumItems: h, id: f } = o;
  return JSON.stringify({
    type: "paginated",
    udfPath: Pn(u),
    args: In(c),
    options: In({ initialNumItems: h, id: f }),
  });
}
var dv = Object.defineProperty,
  yv = (u, c, o) =>
    c in u
      ? dv(u, c, { enumerable: !0, configurable: !0, writable: !0, value: o })
      : (u[c] = o),
  Ne = (u, c, o) => yv(u, typeof c != "symbol" ? c + "" : c, o),
  gv = class {
    constructor() {
      (Ne(this, "nextQueryId"),
        Ne(this, "querySetVersion"),
        Ne(this, "querySet"),
        Ne(this, "queryIdToToken"),
        Ne(this, "identityVersion"),
        Ne(this, "auth"),
        Ne(this, "outstandingQueriesOlderThanRestart"),
        Ne(this, "outstandingAuthOlderThanRestart"),
        Ne(this, "paused"),
        Ne(this, "pendingQuerySetModifications"),
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
    subscribe(u, c, o, h) {
      const f = Pn(u),
        m = Wn(f, c),
        A = this.querySet.get(m);
      if (A !== void 0)
        return (
          (A.numSubscribers += 1),
          {
            queryToken: m,
            modification: null,
            unsubscribe: () => this.removeSubscriber(m),
          }
        );
      {
        const z = this.nextQueryId++,
          U = {
            id: z,
            canonicalizedUdfPath: f,
            args: c,
            numSubscribers: 1,
            journal: o,
            componentPath: h,
          };
        (this.querySet.set(m, U), this.queryIdToToken.set(z, m));
        const D = this.querySetVersion,
          O = this.querySetVersion + 1,
          V = {
            type: "Add",
            queryId: z,
            udfPath: f,
            args: [In(c)],
            journal: o,
            componentPath: h,
          };
        return (
          this.paused
            ? this.pendingQuerySetModifications.set(z, V)
            : (this.querySetVersion = O),
          {
            queryToken: m,
            modification: {
              type: "ModifyQuerySet",
              baseVersion: D,
              newVersion: O,
              modifications: [V],
            },
            unsubscribe: () => this.removeSubscriber(m),
          }
        );
      }
    }
    transition(u) {
      for (const c of u.modifications)
        switch (c.type) {
          case "QueryUpdated":
          case "QueryFailed": {
            this.outstandingQueriesOlderThanRestart.delete(c.queryId);
            const o = c.journal;
            if (o !== void 0) {
              const h = this.queryIdToToken.get(c.queryId);
              h !== void 0 && (this.querySet.get(h).journal = o);
            }
            break;
          }
          case "QueryRemoved":
            this.outstandingQueriesOlderThanRestart.delete(c.queryId);
            break;
          default:
            throw new Error(`Invalid modification ${c.type}`);
        }
    }
    queryId(u, c) {
      const o = Wn(Pn(u), c),
        h = this.querySet.get(o);
      return h !== void 0 ? h.id : null;
    }
    isCurrentOrNewerAuthVersion(u) {
      return u >= this.identityVersion;
    }
    getAuth() {
      return this.auth;
    }
    setAuth(u) {
      this.auth = { tokenType: "User", value: u };
      const c = this.identityVersion;
      return (
        this.paused || (this.identityVersion = c + 1),
        { type: "Authenticate", baseVersion: c, ...this.auth }
      );
    }
    setAdminAuth(u, c) {
      const o = { tokenType: "Admin", value: u, impersonating: c };
      this.auth = o;
      const h = this.identityVersion;
      return (
        this.paused || (this.identityVersion = h + 1),
        { type: "Authenticate", baseVersion: h, ...o }
      );
    }
    clearAuth() {
      ((this.auth = void 0), this.markAuthCompletion());
      const u = this.identityVersion;
      return (
        this.paused || (this.identityVersion = u + 1),
        { type: "Authenticate", tokenType: "None", baseVersion: u }
      );
    }
    hasAuth() {
      return !!this.auth;
    }
    isNewAuth(u) {
      return this.auth?.value !== u;
    }
    queryPath(u) {
      const c = this.queryIdToToken.get(u);
      return c ? this.querySet.get(c).canonicalizedUdfPath : null;
    }
    queryArgs(u) {
      const c = this.queryIdToToken.get(u);
      return c ? this.querySet.get(c).args : null;
    }
    queryToken(u) {
      return this.queryIdToToken.get(u) ?? null;
    }
    queryJournal(u) {
      return this.querySet.get(u)?.journal;
    }
    restart() {
      (this.unpause(), this.outstandingQueriesOlderThanRestart.clear());
      const u = [];
      for (const h of this.querySet.values()) {
        const f = {
          type: "Add",
          queryId: h.id,
          udfPath: h.canonicalizedUdfPath,
          args: [In(h.args)],
          journal: h.journal,
          componentPath: h.componentPath,
        };
        (u.push(f), this.outstandingQueriesOlderThanRestart.add(h.id));
      }
      this.querySetVersion = 1;
      const c = {
        type: "ModifyQuerySet",
        baseVersion: 0,
        newVersion: 1,
        modifications: u,
      };
      if (!this.auth) return ((this.identityVersion = 0), [c, void 0]);
      this.outstandingAuthOlderThanRestart = !0;
      const o = { type: "Authenticate", baseVersion: 0, ...this.auth };
      return ((this.identityVersion = 1), [c, o]);
    }
    pause() {
      this.paused = !0;
    }
    resume() {
      const u =
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
        c =
          this.auth !== void 0
            ? {
                type: "Authenticate",
                baseVersion: this.identityVersion++,
                ...this.auth,
              }
            : void 0;
      return (this.unpause(), [u, c]);
    }
    unpause() {
      ((this.paused = !1), this.pendingQuerySetModifications.clear());
    }
    removeSubscriber(u) {
      const c = this.querySet.get(u);
      if (c.numSubscribers > 1) return ((c.numSubscribers -= 1), null);
      {
        (this.querySet.delete(u),
          this.queryIdToToken.delete(c.id),
          this.outstandingQueriesOlderThanRestart.delete(c.id));
        const o = this.querySetVersion,
          h = this.querySetVersion + 1,
          f = { type: "Remove", queryId: c.id };
        return (
          this.paused
            ? this.pendingQuerySetModifications.has(c.id)
              ? this.pendingQuerySetModifications.delete(c.id)
              : this.pendingQuerySetModifications.set(c.id, f)
            : (this.querySetVersion = h),
          {
            type: "ModifyQuerySet",
            baseVersion: o,
            newVersion: h,
            modifications: [f],
          }
        );
      }
    }
  },
  vv = Object.defineProperty,
  mv = (u, c, o) =>
    c in u
      ? vv(u, c, { enumerable: !0, configurable: !0, writable: !0, value: o })
      : (u[c] = o),
  uu = (u, c, o) => mv(u, typeof c != "symbol" ? c + "" : c, o),
  Sv = class {
    constructor(u, c) {
      ((this.logger = u),
        (this.markConnectionStateDirty = c),
        uu(this, "inflightRequests"),
        uu(this, "requestsOlderThanRestart"),
        uu(this, "inflightMutationsCount", 0),
        uu(this, "inflightActionsCount", 0),
        (this.inflightRequests = new Map()),
        (this.requestsOlderThanRestart = new Set()));
    }
    request(u, c) {
      const o = new Promise((h) => {
        const f = c ? "Requested" : "NotSent";
        (this.inflightRequests.set(u.requestId, {
          message: u,
          status: { status: f, requestedAt: new Date(), onResult: h },
        }),
          u.type === "Mutation"
            ? this.inflightMutationsCount++
            : u.type === "Action" && this.inflightActionsCount++);
      });
      return (this.markConnectionStateDirty(), o);
    }
    onResponse(u) {
      const c = this.inflightRequests.get(u.requestId);
      if (c === void 0 || c.status.status === "Completed") return null;
      const o = c.message.type === "Mutation" ? "mutation" : "action",
        h = c.message.udfPath;
      for (const z of u.logLines) fu(this.logger, "info", o, h, z);
      const f = c.status;
      let m, A;
      if (u.success)
        ((m = { success: !0, logLines: u.logLines, value: Ga(u.result) }),
          (A = () => f.onResult(m)));
      else {
        const z = u.result,
          { errorData: U } = u;
        (fu(this.logger, "error", o, h, z),
          (m = {
            success: !1,
            errorMessage: z,
            errorData: U !== void 0 ? Ga(U) : void 0,
            logLines: u.logLines,
          }),
          (A = () => f.onResult(m)));
      }
      return u.type === "ActionResponse" || !u.success
        ? (A(),
          this.inflightRequests.delete(u.requestId),
          this.requestsOlderThanRestart.delete(u.requestId),
          c.message.type === "Action"
            ? this.inflightActionsCount--
            : c.message.type === "Mutation" && this.inflightMutationsCount--,
          this.markConnectionStateDirty(),
          { requestId: u.requestId, result: m })
        : ((c.status = {
            status: "Completed",
            result: m,
            ts: u.ts,
            onResolve: A,
          }),
          null);
    }
    removeCompleted(u) {
      const c = new Map();
      for (const [o, h] of this.inflightRequests.entries()) {
        const f = h.status;
        f.status === "Completed" &&
          f.ts.lessThanOrEqual(u) &&
          (f.onResolve(),
          c.set(o, f.result),
          h.message.type === "Mutation"
            ? this.inflightMutationsCount--
            : h.message.type === "Action" && this.inflightActionsCount--,
          this.inflightRequests.delete(o),
          this.requestsOlderThanRestart.delete(o));
      }
      return (c.size > 0 && this.markConnectionStateDirty(), c);
    }
    restart() {
      this.requestsOlderThanRestart = new Set(this.inflightRequests.keys());
      const u = [];
      for (const [c, o] of this.inflightRequests) {
        if (o.status.status === "NotSent") {
          ((o.status.status = "Requested"), u.push(o.message));
          continue;
        }
        if (o.message.type === "Mutation") u.push(o.message);
        else if (o.message.type === "Action") {
          if (
            (this.inflightRequests.delete(c),
            this.requestsOlderThanRestart.delete(c),
            this.inflightActionsCount--,
            o.status.status === "Completed")
          )
            throw new Error("Action should never be in 'Completed' state");
          o.status.onResult({
            success: !1,
            errorMessage: "Connection lost while action was in flight",
            logLines: [],
          });
        }
      }
      return (this.markConnectionStateDirty(), u);
    }
    resume() {
      const u = [];
      for (const [, c] of this.inflightRequests)
        if (c.status.status === "NotSent") {
          ((c.status.status = "Requested"), u.push(c.message));
          continue;
        }
      return u;
    }
    hasIncompleteRequests() {
      for (const u of this.inflightRequests.values())
        if (u.status.status === "Requested") return !0;
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
      let u = Date.now();
      for (const c of this.inflightRequests.values())
        c.status.status !== "Completed" &&
          c.status.requestedAt.getTime() < u &&
          (u = c.status.requestedAt.getTime());
      return new Date(u);
    }
    inflightMutations() {
      return this.inflightMutationsCount;
    }
    inflightActions() {
      return this.inflightActionsCount;
    }
  },
  ru = Symbol.for("functionName"),
  pv = Symbol.for("toReferencePath");
function bv(u) {
  return u[pv] ?? null;
}
function Tv(u) {
  return u.startsWith("function://");
}
function Av(u) {
  let c;
  if (typeof u == "string")
    Tv(u) ? (c = { functionHandle: u }) : (c = { name: u });
  else if (u[ru]) c = { name: u[ru] };
  else {
    const o = bv(u);
    if (!o) throw new Error(`${u} is not a functionReference`);
    c = { reference: o };
  }
  return c;
}
function Fn(u) {
  const c = Av(u);
  if (c.name === void 0)
    throw c.functionHandle !== void 0
      ? new Error(
          `Expected function reference like "api.file.func" or "internal.file.func", but received function handle ${c.functionHandle}`,
        )
      : c.reference !== void 0
        ? new Error(
            `Expected function reference in the current component like "api.file.func" or "internal.file.func", but received reference ${c.reference}`,
          )
        : new Error(
            `Expected function reference like "api.file.func" or "internal.file.func", but received ${JSON.stringify(c)}`,
          );
  if (typeof u == "string") return u;
  const o = u[ru];
  if (!o) throw new Error(`${u} is not a functionReference`);
  return o;
}
function gd(u = []) {
  return new Proxy(
    {},
    {
      get(c, o) {
        if (typeof o == "string") return gd([...u, o]);
        if (o === ru) {
          if (u.length < 2) {
            const m = ["api", ...u].join(".");
            throw new Error(
              `API path is expected to be of the form \`api.moduleName.functionName\`. Found: \`${m}\``,
            );
          }
          const h = u.slice(0, -1).join("/"),
            f = u[u.length - 1];
          return f === "default" ? h : h + ":" + f;
        } else return o === Symbol.toStringTag ? "FunctionReference" : void 0;
      },
    },
  );
}
var _v = gd(),
  Ev = Object.defineProperty,
  Ov = (u, c, o) =>
    c in u
      ? Ev(u, c, { enumerable: !0, configurable: !0, writable: !0, value: o })
      : (u[c] = o),
  hu = (u, c, o) => Ov(u, typeof c != "symbol" ? c + "" : c, o),
  Fh = class xs {
    constructor(c) {
      (hu(this, "queryResults"),
        hu(this, "modifiedQueries"),
        (this.queryResults = c),
        (this.modifiedQueries = []));
    }
    getQuery(c, ...o) {
      const h = zn(o[0]),
        f = Fn(c),
        m = this.queryResults.get(Wn(f, h));
      if (m !== void 0) return xs.queryValue(m.result);
    }
    getAllQueries(c) {
      const o = [],
        h = Fn(c);
      for (const f of this.queryResults.values())
        f.udfPath === Pn(h) &&
          o.push({ args: f.args, value: xs.queryValue(f.result) });
      return o;
    }
    setQuery(c, o, h) {
      const f = zn(o),
        m = Fn(c),
        A = Wn(m, f);
      let z;
      h === void 0
        ? (z = void 0)
        : (z = { success: !0, value: h, logLines: [] });
      const U = { udfPath: m, args: f, result: z };
      (this.queryResults.set(A, U), this.modifiedQueries.push(A));
    }
    static queryValue(c) {
      if (c !== void 0) return c.success ? c.value : void 0;
    }
  },
  Mv = class {
    constructor() {
      (hu(this, "queryResults"),
        hu(this, "optimisticUpdates"),
        (this.queryResults = new Map()),
        (this.optimisticUpdates = []));
    }
    ingestQueryResultsFromServer(u, c) {
      this.optimisticUpdates = this.optimisticUpdates.filter(
        (m) => !c.has(m.mutationId),
      );
      const o = this.queryResults;
      this.queryResults = new Map(u);
      const h = new Fh(this.queryResults);
      for (const m of this.optimisticUpdates) m.update(h);
      const f = [];
      for (const [m, A] of this.queryResults) {
        const z = o.get(m);
        (z === void 0 || z.result !== A.result) && f.push(m);
      }
      return f;
    }
    applyOptimisticUpdate(u, c) {
      this.optimisticUpdates.push({ update: u, mutationId: c });
      const o = new Fh(this.queryResults);
      return (u(o), o.modifiedQueries);
    }
    rawQueryResult(u) {
      const c = this.queryResults.get(u);
      if (c !== void 0) return c.result;
    }
    queryResult(u) {
      const c = this.queryResults.get(u);
      if (c === void 0) return;
      const o = c.result;
      if (o !== void 0) {
        if (o.success) return o.value;
        throw o.errorData !== void 0
          ? Vs(o, new Ls(xa("query", c.udfPath, o)))
          : new Error(xa("query", c.udfPath, o));
      }
    }
    hasQueryResult(u) {
      return this.queryResults.get(u) !== void 0;
    }
    queryLogs(u) {
      return this.queryResults.get(u)?.result?.logLines;
    }
  },
  Rv = Object.defineProperty,
  zv = (u, c, o) =>
    c in u
      ? Rv(u, c, { enumerable: !0, configurable: !0, writable: !0, value: o })
      : (u[c] = o),
  Us = (u, c, o) => zv(u, typeof c != "symbol" ? c + "" : c, o),
  jl = class an {
    constructor(c, o) {
      (Us(this, "low"),
        Us(this, "high"),
        Us(this, "__isUnsignedLong__"),
        (this.low = c | 0),
        (this.high = o | 0),
        (this.__isUnsignedLong__ = !0));
    }
    static isLong(c) {
      return (c && c.__isUnsignedLong__) === !0;
    }
    static fromBytesLE(c) {
      return new an(
        c[0] | (c[1] << 8) | (c[2] << 16) | (c[3] << 24),
        c[4] | (c[5] << 8) | (c[6] << 16) | (c[7] << 24),
      );
    }
    toBytesLE() {
      const c = this.high,
        o = this.low;
      return [
        o & 255,
        (o >>> 8) & 255,
        (o >>> 16) & 255,
        o >>> 24,
        c & 255,
        (c >>> 8) & 255,
        (c >>> 16) & 255,
        c >>> 24,
      ];
    }
    static fromNumber(c) {
      return isNaN(c) || c < 0
        ? Wh
        : c >= Cv
          ? qv
          : new an((c % Ll) | 0, (c / Ll) | 0);
    }
    toString() {
      return (BigInt(this.high) * BigInt(Ll) + BigInt(this.low)).toString();
    }
    equals(c) {
      return (
        an.isLong(c) || (c = an.fromValue(c)),
        this.high >>> 31 === 1 && c.high >>> 31 === 1
          ? !1
          : this.high === c.high && this.low === c.low
      );
    }
    notEquals(c) {
      return !this.equals(c);
    }
    comp(c) {
      return (
        an.isLong(c) || (c = an.fromValue(c)),
        this.equals(c)
          ? 0
          : c.high >>> 0 > this.high >>> 0 ||
              (c.high === this.high && c.low >>> 0 > this.low >>> 0)
            ? -1
            : 1
      );
    }
    lessThanOrEqual(c) {
      return this.comp(c) <= 0;
    }
    static fromValue(c) {
      return typeof c == "number" ? an.fromNumber(c) : new an(c.low, c.high);
    }
  },
  Wh = new jl(0, 0),
  Ih = 65536,
  Ll = Ih * Ih,
  Cv = Ll * Ll,
  qv = new jl(-1, -1),
  Dv = Object.defineProperty,
  wv = (u, c, o) =>
    c in u
      ? Dv(u, c, { enumerable: !0, configurable: !0, writable: !0, value: o })
      : (u[c] = o),
  cu = (u, c, o) => wv(u, typeof c != "symbol" ? c + "" : c, o),
  Ph = class {
    constructor(u, c) {
      (cu(this, "version"),
        cu(this, "remoteQuerySet"),
        cu(this, "queryPath"),
        cu(this, "logger"),
        (this.version = { querySet: 0, ts: jl.fromNumber(0), identity: 0 }),
        (this.remoteQuerySet = new Map()),
        (this.queryPath = u),
        (this.logger = c));
    }
    transition(u) {
      const c = u.startVersion;
      if (
        this.version.querySet !== c.querySet ||
        this.version.ts.notEquals(c.ts) ||
        this.version.identity !== c.identity
      )
        throw new Error(
          `Invalid start version: ${c.ts.toString()}:${c.querySet}:${c.identity}, transitioning from ${this.version.ts.toString()}:${this.version.querySet}:${this.version.identity}`,
        );
      for (const o of u.modifications)
        switch (o.type) {
          case "QueryUpdated": {
            const h = this.queryPath(o.queryId);
            if (h)
              for (const m of o.logLines)
                fu(this.logger, "info", "query", h, m);
            const f = Ga(o.value ?? null);
            this.remoteQuerySet.set(o.queryId, {
              success: !0,
              value: f,
              logLines: o.logLines,
            });
            break;
          }
          case "QueryFailed": {
            const h = this.queryPath(o.queryId);
            if (h)
              for (const m of o.logLines)
                fu(this.logger, "info", "query", h, m);
            const { errorData: f } = o;
            this.remoteQuerySet.set(o.queryId, {
              success: !1,
              errorMessage: o.errorMessage,
              errorData: f !== void 0 ? Ga(f) : void 0,
              logLines: o.logLines,
            });
            break;
          }
          case "QueryRemoved":
            this.remoteQuerySet.delete(o.queryId);
            break;
          default:
            throw new Error(`Invalid modification ${o.type}`);
        }
      this.version = u.endVersion;
    }
    remoteQueryResults() {
      return this.remoteQuerySet;
    }
    timestamp() {
      return this.version.ts;
    }
  };
function Ns(u) {
  const c = Vl(u);
  return jl.fromBytesLE(Array.from(c));
}
function Uv(u) {
  const c = new Uint8Array(u.toBytesLE());
  return xl(c);
}
function td(u) {
  switch (u.type) {
    case "FatalError":
    case "AuthError":
    case "ActionResponse":
    case "TransitionChunk":
    case "Ping":
      return { ...u };
    case "MutationResponse":
      return u.success ? { ...u, ts: Ns(u.ts) } : { ...u };
    case "Transition":
      return {
        ...u,
        startVersion: { ...u.startVersion, ts: Ns(u.startVersion.ts) },
        endVersion: { ...u.endVersion, ts: Ns(u.endVersion.ts) },
      };
    default:
  }
}
function Nv(u) {
  switch (u.type) {
    case "Authenticate":
    case "ModifyQuerySet":
    case "Mutation":
    case "Action":
    case "Event":
      return { ...u };
    case "Connect":
      return u.maxObservedTimestamp !== void 0
        ? { ...u, maxObservedTimestamp: Uv(u.maxObservedTimestamp) }
        : { ...u, maxObservedTimestamp: void 0 };
    default:
  }
}
var Qv = Object.defineProperty,
  Bv = (u, c, o) =>
    c in u
      ? Qv(u, c, { enumerable: !0, configurable: !0, writable: !0, value: o })
      : (u[c] = o),
  Nt = (u, c, o) => Bv(u, typeof c != "symbol" ? c + "" : c, o),
  Hv = 1e3,
  Lv = 1001,
  Vv = 1005,
  xv = 4040,
  su;
function La() {
  return (
    su === void 0 && (su = Date.now()),
    typeof performance > "u" || !performance.now
      ? Date.now()
      : Math.round(su + performance.now())
  );
}
function ed() {
  return `t=${Math.round((La() - su) / 100) / 10}s`;
}
var vd = {
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
function jv(u) {
  if (u === void 0) return "Unknown";
  for (const c of Object.keys(vd)) if (u.startsWith(c)) return c;
  return "Unknown";
}
var Yv = class {
  constructor(u, c, o, h, f, m) {
    ((this.markConnectionStateDirty = f),
      (this.debug = m),
      Nt(this, "socket"),
      Nt(this, "connectionCount"),
      Nt(this, "_hasEverConnected", !1),
      Nt(this, "lastCloseReason"),
      Nt(this, "transitionChunkBuffer", null),
      Nt(this, "defaultInitialBackoff"),
      Nt(this, "maxBackoff"),
      Nt(this, "retries"),
      Nt(this, "serverInactivityThreshold"),
      Nt(this, "reconnectDueToServerInactivityTimeout"),
      Nt(this, "scheduledReconnect", null),
      Nt(this, "networkOnlineHandler", null),
      Nt(this, "pendingNetworkRecoveryInfo", null),
      Nt(this, "uri"),
      Nt(this, "onOpen"),
      Nt(this, "onResume"),
      Nt(this, "onMessage"),
      Nt(this, "webSocketConstructor"),
      Nt(this, "logger"),
      Nt(this, "onServerDisconnectError"),
      (this.webSocketConstructor = o),
      (this.socket = { state: "disconnected" }),
      (this.connectionCount = 0),
      (this.lastCloseReason = "InitialConnect"),
      (this.defaultInitialBackoff = 1e3),
      (this.maxBackoff = 16e3),
      (this.retries = 0),
      (this.serverInactivityThreshold = 6e4),
      (this.reconnectDueToServerInactivityTimeout = null),
      (this.uri = u),
      (this.onOpen = c.onOpen),
      (this.onResume = c.onResume),
      (this.onMessage = c.onMessage),
      (this.onServerDisconnectError = c.onServerDisconnectError),
      (this.logger = h),
      this.setupNetworkListener(),
      this.connect());
  }
  setSocketState(u) {
    ((this.socket = u),
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
  assembleTransition(u) {
    if (
      u.partNumber < 0 ||
      u.partNumber >= u.totalParts ||
      u.totalParts === 0 ||
      (this.transitionChunkBuffer &&
        (this.transitionChunkBuffer.totalParts !== u.totalParts ||
          this.transitionChunkBuffer.transitionId !== u.transitionId))
    )
      throw (
        (this.transitionChunkBuffer = null),
        new Error("Invalid TransitionChunk")
      );
    if (
      (this.transitionChunkBuffer === null &&
        (this.transitionChunkBuffer = {
          chunks: [],
          totalParts: u.totalParts,
          transitionId: u.transitionId,
        }),
      u.partNumber !== this.transitionChunkBuffer.chunks.length)
    ) {
      const c = this.transitionChunkBuffer.chunks.length;
      throw (
        (this.transitionChunkBuffer = null),
        new Error(
          `TransitionChunk received out of order: expected part ${c}, got ${u.partNumber}`,
        )
      );
    }
    if (
      (this.transitionChunkBuffer.chunks.push(u.chunk),
      this.transitionChunkBuffer.chunks.length === u.totalParts)
    ) {
      const c = this.transitionChunkBuffer.chunks.join("");
      this.transitionChunkBuffer = null;
      const o = td(JSON.parse(c));
      if (o.type !== "Transition")
        throw new Error(
          `Expected Transition, got ${o.type} after assembling chunks`,
        );
      return o;
    }
    return null;
  }
  connect() {
    if (this.socket.state === "terminated") return;
    if (this.socket.state !== "disconnected" && this.socket.state !== "stopped")
      throw new Error(
        "Didn't start connection from disconnected state: " + this.socket.state,
      );
    const u = new this.webSocketConstructor(this.uri);
    (this._logVerbose("constructed WebSocket"),
      this.setSocketState({ state: "connecting", ws: u, paused: "no" }),
      this.resetServerInactivityTimeout(),
      (u.onopen = () => {
        if (
          (this.logger.logVerbose("begin ws.onopen"),
          this.socket.state !== "connecting")
        )
          throw new Error("onopen called with socket not in connecting state");
        if (
          (this.setSocketState({
            state: "ready",
            ws: u,
            paused: this.socket.paused === "yes" ? "uninitialized" : "no",
          }),
          this.resetServerInactivityTimeout(),
          this.socket.paused === "no" &&
            ((this._hasEverConnected = !0),
            this.onOpen({
              connectionCount: this.connectionCount,
              lastCloseReason: this.lastCloseReason,
              clientTs: La(),
            })),
          this.lastCloseReason !== "InitialConnect" &&
            (this.lastCloseReason
              ? this.logger.log(
                  "WebSocket reconnected at",
                  ed(),
                  "after disconnect due to",
                  this.lastCloseReason,
                )
              : this.logger.log("WebSocket reconnected at", ed())),
          (this.connectionCount += 1),
          (this.lastCloseReason = null),
          this.pendingNetworkRecoveryInfo !== null)
        ) {
          const { timeSavedMs: c } = this.pendingNetworkRecoveryInfo;
          ((this.pendingNetworkRecoveryInfo = null),
            this.sendMessage({
              type: "Event",
              eventType: "NetworkRecoveryReconnect",
              event: { timeSavedMs: c },
            }),
            this.logger.log(
              `Network recovery reconnect saved ~${Math.round(c / 1e3)}s of waiting`,
            ));
        }
      }),
      (u.onerror = (c) => {
        this.transitionChunkBuffer = null;
        const o = c.message;
        o && this.logger.log(`WebSocket error message: ${o}`);
      }),
      (u.onmessage = (c) => {
        this.resetServerInactivityTimeout();
        const o = c.data.length;
        let h = td(JSON.parse(c.data));
        if (
          (this._logVerbose(`received ws message with type ${h.type}`),
          h.type !== "Ping")
        ) {
          if (h.type === "TransitionChunk") {
            const f = this.assembleTransition(h);
            if (!f) return;
            ((h = f),
              this._logVerbose(`assembled full ws message of type ${h.type}`));
          }
          (this.transitionChunkBuffer !== null &&
            ((this.transitionChunkBuffer = null),
            this.logger.log(
              `Received unexpected ${h.type} while buffering TransitionChunks`,
            )),
            h.type === "Transition" &&
              this.reportLargeTransition({ messageLength: o, transition: h }),
            this.onMessage(h).hasSyncedPastLastReconnect &&
              ((this.retries = 0), this.markConnectionStateDirty()));
        }
      }),
      (u.onclose = (c) => {
        if (
          (this._logVerbose("begin ws.onclose"),
          (this.transitionChunkBuffer = null),
          this.lastCloseReason === null &&
            (this.lastCloseReason = c.reason || `closed with code ${c.code}`),
          c.code !== Hv && c.code !== Lv && c.code !== Vv && c.code !== xv)
        ) {
          let h = `WebSocket closed with code ${c.code}`;
          (c.reason && (h += `: ${c.reason}`),
            this.logger.log(h),
            this.onServerDisconnectError &&
              c.reason &&
              this.onServerDisconnectError(h));
        }
        const o = jv(c.reason);
        this.scheduleReconnect(o);
      }));
  }
  socketState() {
    return this.socket.state;
  }
  sendMessage(u) {
    const c = {
      type: u.type,
      ...(u.type === "Authenticate" && u.tokenType === "User"
        ? { value: `...${u.value.slice(-7)}` }
        : {}),
    };
    if (this.socket.state === "ready" && this.socket.paused === "no") {
      const o = Nv(u),
        h = JSON.stringify(o);
      let f = !1;
      try {
        (this.socket.ws.send(h), (f = !0));
      } catch (m) {
        (this.logger.log(
          `Failed to send message on WebSocket, reconnecting: ${m}`,
        ),
          this.closeAndReconnect("FailedToSendMessage"));
      }
      return (
        this._logVerbose(
          `${f ? "sent" : "failed to send"} message with type ${u.type}: ${JSON.stringify(c)}`,
        ),
        !0
      );
    }
    return (
      this._logVerbose(
        `message not sent (socket state: ${this.socket.state}, paused: ${"paused" in this.socket ? this.socket.paused : void 0}): ${JSON.stringify(c)}`,
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
  scheduleReconnect(u) {
    (this.scheduledReconnect &&
      (clearTimeout(this.scheduledReconnect.timeout),
      (this.scheduledReconnect = null)),
      (this.socket = { state: "disconnected" }));
    const c = this.nextBackoff(u);
    (this.markConnectionStateDirty(),
      this.logger.log(`Attempting reconnect in ${Math.round(c)}ms`));
    const o = La(),
      h = setTimeout(() => {
        this.scheduledReconnect?.timeout === h &&
          ((this.scheduledReconnect = null), this.connect());
      }, c);
    this.scheduledReconnect = { timeout: h, scheduledAt: o, backoffMs: c };
  }
  closeAndReconnect(u) {
    switch (
      (this._logVerbose(`begin closeAndReconnect with reason ${u}`),
      this.socket.state)
    ) {
      case "disconnected":
      case "terminated":
      case "stopped":
        return;
      case "connecting":
      case "ready":
        ((this.lastCloseReason = u),
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
        const u = this.socket.ws;
        return (
          (u.onmessage = (c) => {
            this._logVerbose("Ignoring message received after close");
          }),
          new Promise((c) => {
            ((u.onclose = () => {
              (this._logVerbose("Closed after connecting"), c());
            }),
              (u.onopen = () => {
                (this._logVerbose("Opened after connecting"), u.close());
              }));
          })
        );
      }
      case "ready": {
        this._logVerbose("ws.close called");
        const u = this.socket.ws;
        u.onmessage = (o) => {
          this._logVerbose("Ignoring message received after close");
        };
        const c = new Promise((o) => {
          u.onclose = () => {
            o();
          };
        });
        return (u.close(), c);
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
        const u = this.close();
        return (this.setSocketState({ state: "terminated" }), u);
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
        const u = this.close();
        return ((this.socket = { state: "stopped" }), u);
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
    let u = null;
    if (this.scheduledReconnect) {
      const c = La() - this.scheduledReconnect.scheduledAt;
      ((u = Math.max(0, this.scheduledReconnect.backoffMs - c)),
        this._logVerbose(
          `would have waited ${Math.round(u)}ms more (backoff was ${Math.round(this.scheduledReconnect.backoffMs)}ms, elapsed ${Math.round(c)}ms)`,
        ),
        clearTimeout(this.scheduledReconnect.timeout),
        (this.scheduledReconnect = null),
        this._logVerbose("canceled scheduled reconnect"));
    }
    (this.logger.log("Network recovery detected, reconnecting immediately"),
      (this.pendingNetworkRecoveryInfo =
        u !== null ? { timeSavedMs: u } : null),
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
              clientTs: La(),
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
  _logVerbose(u) {
    this.logger.logVerbose(u);
  }
  nextBackoff(u) {
    const c =
      (u === "client"
        ? 100
        : u === "Unknown"
          ? this.defaultInitialBackoff
          : vd[u].timeout) * Math.pow(2, this.retries);
    this.retries += 1;
    const o = Math.min(c, this.maxBackoff);
    return o + o * (Math.random() - 0.5);
  }
  reportLargeTransition({ transition: u, messageLength: c }) {
    if (u.clientClockSkew === void 0 || u.serverTs === void 0) return;
    const o = La() - u.clientClockSkew - u.serverTs / 1e6,
      h = `${Math.round(o)}ms`,
      f = `${Math.round(c / 1e4) / 100}MB`,
      m = c / (o / 1e3),
      A = `${Math.round(m / 1e4) / 100}MB per second`;
    (this._logVerbose(`received ${f} transition in ${h} at ${A}`),
      c > 2e7
        ? this.logger.log(
            `received query results totaling more that 20MB (${f}) which will take a long time to download on slower connections`,
          )
        : o > 2e4 &&
          this.logger.log(
            `received query results totaling ${f} which took more than 20s to arrive (${h})`,
          ),
      this.debug &&
        this.sendMessage({
          type: "Event",
          eventType: "ClientReceivedTransition",
          event: { transitionTransitTime: o, messageLength: c },
        }));
  }
};
function Gv() {
  return Xv();
}
function Xv() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (u) => {
    const c = (Math.random() * 16) | 0;
    return (u === "x" ? c : (c & 3) | 8).toString(16);
  });
}
var Hl = class extends Error {};
Hl.prototype.name = "InvalidTokenError";
function Zv(u) {
  return decodeURIComponent(
    atob(u).replace(/(.)/g, (c, o) => {
      let h = o.charCodeAt(0).toString(16).toUpperCase();
      return (h.length < 2 && (h = "0" + h), "%" + h);
    }),
  );
}
function kv(u) {
  let c = u.replace(/-/g, "+").replace(/_/g, "/");
  switch (c.length % 4) {
    case 0:
      break;
    case 2:
      c += "==";
      break;
    case 3:
      c += "=";
      break;
    default:
      throw new Error("base64 string is not of the correct length");
  }
  try {
    return Zv(c);
  } catch {
    return atob(c);
  }
}
function md(u, c) {
  if (typeof u != "string")
    throw new Hl("Invalid token specified: must be a string");
  c || (c = {});
  const o = c.header === !0 ? 0 : 1,
    h = u.split(".")[o];
  if (typeof h != "string")
    throw new Hl(`Invalid token specified: missing part #${o + 1}`);
  let f;
  try {
    f = kv(h);
  } catch (m) {
    throw new Hl(
      `Invalid token specified: invalid base64 for part #${o + 1} (${m.message})`,
    );
  }
  try {
    return JSON.parse(f);
  } catch (m) {
    throw new Hl(
      `Invalid token specified: invalid json for part #${o + 1} (${m.message})`,
    );
  }
}
var Kv = Object.defineProperty,
  Jv = (u, c, o) =>
    c in u
      ? Kv(u, c, { enumerable: !0, configurable: !0, writable: !0, value: o })
      : (u[c] = o),
  ne = (u, c, o) => Jv(u, typeof c != "symbol" ? c + "" : c, o),
  $v = 480 * 60 * 60 * 1e3,
  nd = 2,
  Fv = class {
    constructor(u, c, o) {
      (ne(this, "authState", { state: "noAuth" }),
        ne(this, "configVersion", 0),
        ne(this, "syncState"),
        ne(this, "authenticate"),
        ne(this, "stopSocket"),
        ne(this, "tryRestartSocket"),
        ne(this, "pauseSocket"),
        ne(this, "resumeSocket"),
        ne(this, "clearAuth"),
        ne(this, "logger"),
        ne(this, "refreshTokenLeewaySeconds"),
        ne(this, "initialAuthTokenReuse"),
        ne(this, "lastRefreshChange"),
        ne(this, "tokenConfirmationAttempts", 0),
        (this.syncState = u),
        (this.authenticate = c.authenticate),
        (this.stopSocket = c.stopSocket),
        (this.tryRestartSocket = c.tryRestartSocket),
        (this.pauseSocket = c.pauseSocket),
        (this.resumeSocket = c.resumeSocket),
        (this.clearAuth = c.clearAuth),
        (this.logger = o.logger),
        (this.refreshTokenLeewaySeconds = o.refreshTokenLeewaySeconds),
        (this.initialAuthTokenReuse = o.initialAuthTokenReuse),
        (this.lastRefreshChange = !1));
    }
    notifyRefreshChange(u) {
      this.authState.state !== "noAuth" &&
        this.authState.state !== "initialRefetch" &&
        this.authState.config.onRefreshChange &&
        this.lastRefreshChange !== u &&
        ((this.lastRefreshChange = u),
        this.authState.config.onRefreshChange(u));
    }
    async setConfig(u, c, o) {
      (this.resetAuthState(),
        this._logVerbose("pausing WS for auth token fetch"),
        this.pauseSocket());
      const h = await this.fetchTokenAndGuardAgainstRace(u, {
        forceRefreshToken: !1,
      });
      if (h.isFromOutdatedConfig) return;
      const f = { fetchToken: u, onAuthChange: c, onRefreshChange: o };
      (h.value
        ? (this.setAuthState({
            state: "waitingForServerConfirmationOfCachedToken",
            config: f,
            hasRetried: !1,
          }),
          this.authenticate(h.value))
        : (this.setAuthState({ state: "initialRefetch", config: f }),
          await this.refetchToken()),
        this._logVerbose("resuming WS after auth token fetch"),
        this.resumeSocket());
    }
    onTransition(u) {
      if (
        this.syncState.isCurrentOrNewerAuthVersion(u.endVersion.identity) &&
        !(u.endVersion.identity <= u.startVersion.identity)
      ) {
        if (
          (this._logVerbose(
            `auth state is ${this.authState.state} when handling transition`,
          ),
          this.syncState.markAuthCompletion(),
          this.authState.state === "waitingForServerConfirmationOfCachedToken")
        ) {
          this._logVerbose("server confirmed auth token is valid");
          const c = this.syncState.getAuth()?.value;
          (this.initialAuthTokenReuse && c
            ? this.scheduleTokenRefetch(c, u.clientClockSkew)
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
    onAuthError(u) {
      if (
        u.authUpdateAttempted === !1 &&
        (this.authState.state === "waitingForServerConfirmationOfFreshToken" ||
          this.authState.state === "waitingForServerConfirmationOfCachedToken")
      ) {
        this._logVerbose("ignoring non-auth token expired error");
        return;
      }
      const { baseVersion: c } = u;
      if (!this.syncState.isCurrentOrNewerAuthVersion(c + 1)) {
        this._logVerbose("ignoring auth error for previous auth attempt");
        return;
      }
      this.tryToReauthenticate(u);
    }
    async tryToReauthenticate(u) {
      if (
        (this._logVerbose(`attempting to reauthenticate: ${u.error}`),
        this.authState.state === "noAuth" ||
          (this.authState.state ===
            "waitingForServerConfirmationOfFreshToken" &&
            this.tokenConfirmationAttempts >= nd))
      ) {
        (this.logger.error(
          `Failed to authenticate: "${u.error}", check your server auth config`,
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
            `retrying reauthentication, ${nd - this.tokenConfirmationAttempts} attempts remaining`,
          )),
        this.notifyRefreshChange(!0),
        await this.stopSocket(),
        this.authState.state === "noAuth")
      )
        return;
      const c = await this.fetchTokenAndGuardAgainstRace(
        this.authState.config.fetchToken,
        { forceRefreshToken: !0 },
      );
      c.isFromOutdatedConfig ||
        (c.value && this.syncState.isNewAuth(c.value)
          ? (this.authenticate(c.value),
            this.setAuthState({
              state: "waitingForServerConfirmationOfFreshToken",
              config: this.authState.config,
              token: c.value,
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
      const u = await this.fetchTokenAndGuardAgainstRace(
        this.authState.config.fetchToken,
        { forceRefreshToken: !0 },
      );
      u.isFromOutdatedConfig ||
        (u.value
          ? this.syncState.isNewAuth(u.value)
            ? (this.setAuthState({
                state: "waitingForServerConfirmationOfFreshToken",
                hadAuth: this.syncState.hasAuth(),
                token: u.value,
                config: this.authState.config,
              }),
              this.authenticate(u.value))
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
    scheduleTokenRefetch(u, c) {
      if (this.authState.state === "noAuth") return;
      const o = this.decodeToken(u);
      if (!o) {
        this.logger.error(
          "Auth token is not a valid JWT, cannot refetch the token",
        );
        return;
      }
      const { iat: h, exp: f } = o;
      if (!h || !f) {
        this.logger.error(
          "Auth token does not have required fields, cannot refetch the token",
        );
        return;
      }
      const m = f - h;
      if (m <= 2) {
        this.logger.error(
          "Auth token does not live long enough, cannot refetch the token",
        );
        return;
      }
      let A;
      c !== void 0
        ? ((A = f - (Date.now() - c) / 1e3), A <= 0 && (A = 0))
        : (A = m);
      let z = Math.min($v, (A - this.refreshTokenLeewaySeconds) * 1e3);
      z <= 0 &&
        (this.logger.warn(
          `Refetching auth token immediately, configured leeway ${this.refreshTokenLeewaySeconds}s is larger than the token's lifetime ${A}s`,
        ),
        (z = 0));
      const U = setTimeout(() => {
        (this._logVerbose("running scheduled token refetch"),
          this.refetchToken());
      }, z);
      (this.setAuthState({
        state: "waitingForScheduledRefetch",
        refetchTokenTimeoutId: U,
        config: this.authState.config,
      }),
        this._logVerbose(
          `scheduled preemptive auth token refetching in ${z}ms`,
        ));
    }
    async fetchTokenAndGuardAgainstRace(u, c) {
      const o = ++this.configVersion;
      this._logVerbose(`fetching token with config version ${o}`);
      const h = await u(c);
      return this.configVersion !== o
        ? (this._logVerbose(
            `stale config version, expected ${o}, got ${this.configVersion}`,
          ),
          { isFromOutdatedConfig: !0 })
        : { isFromOutdatedConfig: !1, value: h };
    }
    stop() {
      (this.resetAuthState(),
        this.configVersion++,
        this._logVerbose(`config version bumped to ${this.configVersion}`));
    }
    setAndReportAuthFailed(u) {
      (u(!1), this.resetAuthState());
    }
    resetAuthState() {
      (this.notifyRefreshChange(!1), this.setAuthState({ state: "noAuth" }));
    }
    setAuthState(u) {
      const c =
        u.state === "waitingForServerConfirmationOfFreshToken"
          ? {
              hadAuth: u.hadAuth,
              state: u.state,
              token: `...${u.token.slice(-7)}`,
            }
          : { state: u.state };
      switch (
        (this._logVerbose(`setting auth state to ${JSON.stringify(c)}`),
        u.state)
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
        (this.authState = u));
    }
    decodeToken(u) {
      try {
        return md(u);
      } catch (c) {
        return (
          this._logVerbose(
            `Error decoding token: ${c instanceof Error ? c.message : "Unknown error"}`,
          ),
          null
        );
      }
    }
    _logVerbose(u) {
      this.logger.logVerbose(`${u} [v${this.configVersion}]`);
    }
  },
  Wv = [
    "convexClientConstructed",
    "convexWebSocketOpen",
    "convexFirstMessageReceived",
  ];
function Iv(u, c) {
  const o = { sessionId: c };
  typeof performance > "u" ||
    !performance.mark ||
    performance.mark(u, { detail: o });
}
function Pv(u) {
  let c = u.name.slice(6);
  return (
    (c = c.charAt(0).toLowerCase() + c.slice(1)),
    { name: c, startTime: u.startTime }
  );
}
function tm(u) {
  if (typeof performance > "u" || !performance.getEntriesByName) return [];
  const c = [];
  for (const o of Wv) {
    const h = performance
      .getEntriesByName(o)
      .filter((f) => f.entryType === "mark")
      .filter((f) => f.detail.sessionId === u);
    c.push(...h);
  }
  return c.map(Pv);
}
var em = Object.defineProperty,
  nm = (u, c, o) =>
    c in u
      ? em(u, c, { enumerable: !0, configurable: !0, writable: !0, value: o })
      : (u[c] = o),
  Qt = (u, c, o) => nm(u, typeof c != "symbol" ? c + "" : c, o),
  am = class {
    constructor(u, c, o) {
      if (
        (Qt(this, "address"),
        Qt(this, "state"),
        Qt(this, "requestManager"),
        Qt(this, "webSocketManager"),
        Qt(this, "authenticationManager"),
        Qt(this, "remoteQuerySet"),
        Qt(this, "optimisticQueryResults"),
        Qt(this, "_transitionHandlerCounter", 0),
        Qt(this, "_nextRequestId"),
        Qt(this, "_onTransitionFns", new Map()),
        Qt(this, "_sessionId"),
        Qt(this, "firstMessageReceived", !1),
        Qt(this, "debug"),
        Qt(this, "logger"),
        Qt(this, "maxObservedTimestamp"),
        Qt(this, "connectionStateSubscribers", new Map()),
        Qt(this, "nextConnectionStateSubscriberId", 0),
        Qt(this, "_lastPublishedConnectionState"),
        Qt(this, "markConnectionStateDirty", () => {
          Promise.resolve().then(() => {
            const C = this.connectionState();
            if (
              JSON.stringify(C) !==
              JSON.stringify(this._lastPublishedConnectionState)
            ) {
              this._lastPublishedConnectionState = C;
              for (const k of this.connectionStateSubscribers.values()) k(C);
            }
          });
        }),
        Qt(this, "mark", (C) => {
          this.debug && Iv(C, this.sessionId);
        }),
        typeof u == "object")
      )
        throw new Error(
          "Passing a ClientConfig object is no longer supported. Pass the URL of the Convex deployment as a string directly.",
        );
      (o?.skipConvexDeploymentUrlCheck !== !0 && Fg(u), (o = { ...o }));
      const h = o.authRefreshTokenLeewaySeconds ?? 10;
      let f = o.webSocketConstructor;
      if (!f && typeof WebSocket > "u")
        throw new Error(
          "No WebSocket global variable defined! To use Convex in an environment without WebSocket try the HTTP client: https://docs.convex.dev/api/classes/browser.ConvexHttpClient",
        );
      ((f = f || WebSocket),
        (this.debug = o.reportDebugInfoToConvex ?? !1),
        (this.address = u),
        (this.logger =
          o.logger === !1
            ? yd({ verbose: o.verbose ?? !1 })
            : o.logger !== !0 && o.logger
              ? o.logger
              : dd({ verbose: o.verbose ?? !1 })));
      const m = u.search("://");
      if (m === -1)
        throw new Error("Provided address was not an absolute URL.");
      const A = u.substring(m + 3),
        z = u.substring(0, m);
      let U;
      if (z === "http") U = "ws";
      else if (z === "https") U = "wss";
      else throw new Error(`Unknown parent protocol ${z}`);
      const D = `${U}://${A}/api/${Kh}/sync`;
      ((this.state = new gv()),
        (this.remoteQuerySet = new Ph(
          (C) => this.state.queryPath(C),
          this.logger,
        )),
        (this.requestManager = new Sv(
          this.logger,
          this.markConnectionStateDirty,
        )));
      const O = () => {
        (this.webSocketManager.pause(), this.state.pause());
      };
      ((this.authenticationManager = new Fv(
        this.state,
        {
          authenticate: (C) => {
            const k = this.state.setAuth(C);
            return (this.webSocketManager.sendMessage(k), k.baseVersion);
          },
          stopSocket: () => this.webSocketManager.stop(),
          tryRestartSocket: () => this.webSocketManager.tryRestart(),
          pauseSocket: O,
          resumeSocket: () => this.webSocketManager.resume(),
          clearAuth: () => {
            this.clearAuth();
          },
        },
        {
          logger: this.logger,
          refreshTokenLeewaySeconds: h,
          initialAuthTokenReuse: o.initialAuthTokenReuse ?? !1,
        },
      )),
        (this.optimisticQueryResults = new Mv()),
        this.addOnTransitionHandler((C) => {
          c(C.queries.map((k) => k.token));
        }),
        (this._nextRequestId = 0),
        (this._sessionId = Gv()));
      const { unsavedChangesWarning: V } = o;
      if (typeof window > "u" || typeof window.addEventListener > "u") {
        if (V === !0)
          throw new Error(
            "unsavedChangesWarning requested, but window.addEventListener not found! Remove {unsavedChangesWarning: true} from Convex client options.",
          );
      } else
        V !== !1 &&
          window.addEventListener("beforeunload", (C) => {
            if (this.requestManager.hasIncompleteRequests()) {
              C.preventDefault();
              const k =
                "Are you sure you want to leave? Your changes may not be saved.";
              return (((C || window.event).returnValue = k), k);
            }
          });
      ((this.webSocketManager = new Yv(
        D,
        {
          onOpen: (C) => {
            (this.mark("convexWebSocketOpen"),
              this.webSocketManager.sendMessage({
                ...C,
                type: "Connect",
                sessionId: this._sessionId,
                maxObservedTimestamp: this.maxObservedTimestamp,
              }),
              (this.remoteQuerySet = new Ph(
                (zt) => this.state.queryPath(zt),
                this.logger,
              )));
            const [k, At] = this.state.restart();
            (At && this.webSocketManager.sendMessage(At),
              this.webSocketManager.sendMessage(k));
            for (const zt of this.requestManager.restart())
              this.webSocketManager.sendMessage(zt);
          },
          onResume: () => {
            const [C, k] = this.state.resume();
            (k && this.webSocketManager.sendMessage(k),
              C && this.webSocketManager.sendMessage(C));
            for (const At of this.requestManager.resume())
              this.webSocketManager.sendMessage(At);
          },
          onMessage: (C) => {
            switch (
              (this.firstMessageReceived ||
                ((this.firstMessageReceived = !0),
                this.mark("convexFirstMessageReceived"),
                this.reportMarks()),
              C.type)
            ) {
              case "Transition": {
                (this.observedTimestamp(C.endVersion.ts),
                  this.authenticationManager.onTransition(C),
                  this.remoteQuerySet.transition(C),
                  this.state.transition(C));
                const k = this.requestManager.removeCompleted(
                  this.remoteQuerySet.timestamp(),
                );
                this.notifyOnQueryResultChanges(k);
                break;
              }
              case "MutationResponse": {
                C.success && this.observedTimestamp(C.ts);
                const k = this.requestManager.onResponse(C);
                k !== null &&
                  this.notifyOnQueryResultChanges(
                    new Map([[k.requestId, k.result]]),
                  );
                break;
              }
              case "ActionResponse":
                this.requestManager.onResponse(C);
                break;
              case "AuthError":
                this.authenticationManager.onAuthError(C);
                break;
              case "FatalError": {
                const k = hv(this.logger, C.error);
                throw (this.webSocketManager.terminate(), k);
              }
              default:
            }
            return {
              hasSyncedPastLastReconnect: this.hasSyncedPastLastReconnect(),
            };
          },
          onServerDisconnectError: o.onServerDisconnectError,
        },
        f,
        this.logger,
        this.markConnectionStateDirty,
        this.debug,
      )),
        this.mark("convexClientConstructed"),
        o.expectAuth && O());
    }
    hasSyncedPastLastReconnect() {
      return (
        this.requestManager.hasSyncedPastLastReconnect() &&
        this.state.hasSyncedPastLastReconnect()
      );
    }
    observedTimestamp(u) {
      (this.maxObservedTimestamp === void 0 ||
        this.maxObservedTimestamp.lessThanOrEqual(u)) &&
        (this.maxObservedTimestamp = u);
    }
    getMaxObservedTimestamp() {
      return this.maxObservedTimestamp;
    }
    notifyOnQueryResultChanges(u) {
      const c = this.remoteQuerySet.remoteQueryResults(),
        o = new Map();
      for (const [f, m] of c) {
        const A = this.state.queryToken(f);
        if (A !== null) {
          const z = {
            result: m,
            udfPath: this.state.queryPath(f),
            args: this.state.queryArgs(f),
          };
          o.set(A, z);
        }
      }
      const h = this.optimisticQueryResults.ingestQueryResultsFromServer(
        o,
        new Set(u.keys()),
      );
      this.handleTransition({
        queries: h.map((f) => ({
          token: f,
          modification: {
            kind: "Updated",
            result: this.optimisticQueryResults.rawQueryResult(f),
          },
        })),
        reflectedMutations: Array.from(u).map(([f, m]) => ({
          requestId: f,
          result: m,
        })),
        timestamp: this.remoteQuerySet.timestamp(),
      });
    }
    handleTransition(u) {
      for (const c of this._onTransitionFns.values()) c(u);
    }
    addOnTransitionHandler(u) {
      const c = this._transitionHandlerCounter++;
      return (
        this._onTransitionFns.set(c, u),
        () => this._onTransitionFns.delete(c)
      );
    }
    getCurrentAuthClaims() {
      const u = this.state.getAuth();
      let c = {};
      if (u && u.tokenType === "User")
        try {
          c = u ? md(u.value) : {};
        } catch {
          c = {};
        }
      else return;
      return { token: u.value, decoded: c };
    }
    setAuth(u, c, o) {
      this.authenticationManager.setConfig(u, c, o);
    }
    hasAuth() {
      return this.state.hasAuth();
    }
    setAdminAuth(u, c) {
      const o = this.state.setAdminAuth(u, c);
      this.webSocketManager.sendMessage(o);
    }
    clearAuth() {
      const u = this.state.clearAuth();
      this.webSocketManager.sendMessage(u);
    }
    subscribe(u, c, o) {
      const h = zn(c),
        {
          modification: f,
          queryToken: m,
          unsubscribe: A,
        } = this.state.subscribe(u, h, o?.journal, o?.componentPath);
      return (
        f !== null && this.webSocketManager.sendMessage(f),
        {
          queryToken: m,
          unsubscribe: () => {
            const z = A();
            z && this.webSocketManager.sendMessage(z);
          },
        }
      );
    }
    localQueryResult(u, c) {
      const o = Wn(u, zn(c));
      return this.optimisticQueryResults.queryResult(o);
    }
    localQueryResultByToken(u) {
      return this.optimisticQueryResults.queryResult(u);
    }
    hasLocalQueryResultByToken(u) {
      return this.optimisticQueryResults.hasQueryResult(u);
    }
    localQueryLogs(u, c) {
      const o = Wn(u, zn(c));
      return this.optimisticQueryResults.queryLogs(o);
    }
    queryJournal(u, c) {
      const o = Wn(u, zn(c));
      return this.state.queryJournal(o);
    }
    connectionState() {
      const u = this.webSocketManager.connectionState();
      return {
        hasInflightRequests: this.requestManager.hasInflightRequests(),
        isWebSocketConnected: u.isConnected,
        hasEverConnected: u.hasEverConnected,
        connectionCount: u.connectionCount,
        connectionRetries: u.connectionRetries,
        timeOfOldestInflightRequest:
          this.requestManager.timeOfOldestInflightRequest(),
        inflightMutations: this.requestManager.inflightMutations(),
        inflightActions: this.requestManager.inflightActions(),
      };
    }
    subscribeToConnectionState(u) {
      const c = this.nextConnectionStateSubscriberId++;
      return (
        this.connectionStateSubscribers.set(c, u),
        () => {
          this.connectionStateSubscribers.delete(c);
        }
      );
    }
    async mutation(u, c, o) {
      const h = await this.mutationInternal(u, c, o);
      if (!h.success)
        throw h.errorData !== void 0
          ? Vs(h, new Ls(xa("mutation", u, h)))
          : new Error(xa("mutation", u, h));
      return h.value;
    }
    async mutationInternal(u, c, o, h) {
      const { mutationPromise: f } = this.enqueueMutation(u, c, o, h);
      return f;
    }
    enqueueMutation(u, c, o, h) {
      const f = zn(c);
      this.tryReportLongDisconnect();
      const m = this.nextRequestId;
      if ((this._nextRequestId++, o !== void 0)) {
        const U = o.optimisticUpdate;
        if (U !== void 0) {
          const D = (V) => {
              U(V, f) instanceof Promise &&
                this.logger.warn(
                  "Optimistic update handler returned a Promise. Optimistic updates should be synchronous.",
                );
            },
            O = this.optimisticQueryResults
              .applyOptimisticUpdate(D, m)
              .map((V) => {
                const C = this.localQueryResultByToken(V);
                return {
                  token: V,
                  modification: {
                    kind: "Updated",
                    result:
                      C === void 0
                        ? void 0
                        : { success: !0, value: C, logLines: [] },
                  },
                };
              });
          this.handleTransition({
            queries: O,
            reflectedMutations: [],
            timestamp: this.remoteQuerySet.timestamp(),
          });
        }
      }
      const A = {
          type: "Mutation",
          requestId: m,
          udfPath: u,
          componentPath: h,
          args: [In(f)],
        },
        z = this.webSocketManager.sendMessage(A);
      return {
        requestId: m,
        mutationPromise: this.requestManager.request(A, z),
      };
    }
    async action(u, c) {
      const o = await this.actionInternal(u, c);
      if (!o.success)
        throw o.errorData !== void 0
          ? Vs(o, new Ls(xa("action", u, o)))
          : new Error(xa("action", u, o));
      return o.value;
    }
    async actionInternal(u, c, o) {
      const h = zn(c),
        f = this.nextRequestId;
      (this._nextRequestId++, this.tryReportLongDisconnect());
      const m = {
          type: "Action",
          requestId: f,
          udfPath: u,
          componentPath: o,
          args: [In(h)],
        },
        A = this.webSocketManager.sendMessage(m);
      return this.requestManager.request(m, A);
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
        const u = tm(this.sessionId);
        this.webSocketManager.sendMessage({
          type: "Event",
          eventType: "ClientConnect",
          event: u,
        });
      }
    }
    tryReportLongDisconnect() {
      if (!this.debug) return;
      const u = this.connectionState().timeOfOldestInflightRequest;
      if (u === null || Date.now() - u.getTime() <= 60 * 1e3) return;
      const c = `${this.address}/api/debug_event`;
      fetch(c, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Convex-Client": `npm-${Kh}`,
        },
        body: JSON.stringify({ event: "LongWebsocketDisconnect" }),
      })
        .then((o) => {
          o.ok ||
            this.logger.warn("Analytics request failed with response:", o.body);
        })
        .catch((o) => {
          this.logger.warn("Analytics response failed with error:", o);
        });
    }
  };
function Qs(u) {
  if (
    typeof u != "object" ||
    u === null ||
    !Array.isArray(u.page) ||
    typeof u.isDone != "boolean" ||
    typeof u.continueCursor != "string"
  )
    throw new Error(`Not a valid paginated query result: ${u?.toString()}`);
  return u;
}
var lm = Object.defineProperty,
  im = (u, c, o) =>
    c in u
      ? lm(u, c, { enumerable: !0, configurable: !0, writable: !0, value: o })
      : (u[c] = o),
  ad = (u, c, o) => im(u, typeof c != "symbol" ? c + "" : c, o),
  um = class {
    constructor(u, c) {
      ((this.client = u),
        (this.onTransition = c),
        ad(this, "paginatedQuerySet", new Map()),
        ad(this, "lastTransitionTs"),
        (this.lastTransitionTs = jl.fromNumber(0)),
        this.client.addOnTransitionHandler((o) => this.onBaseTransition(o)));
    }
    subscribe(u, c, o) {
      const h = Pn(u),
        f = $h(h, c, o),
        m = () => this.removePaginatedQuerySubscriber(f),
        A = this.paginatedQuerySet.get(f);
      return A
        ? ((A.numSubscribers += 1), { paginatedQueryToken: f, unsubscribe: m })
        : (this.paginatedQuerySet.set(f, {
            token: f,
            canonicalizedUdfPath: h,
            args: c,
            numSubscribers: 1,
            options: { initialNumItems: o.initialNumItems },
            nextPageKey: 0,
            pageKeys: [],
            pageKeyToQuery: new Map(),
            ongoingSplits: new Map(),
            skip: !1,
            id: o.id,
          }),
          this.addPageToPaginatedQuery(f, null, o.initialNumItems),
          { paginatedQueryToken: f, unsubscribe: m });
    }
    localQueryResult(u, c, o) {
      const h = $h(Pn(u), c, o);
      return this.localQueryResultByToken(h);
    }
    localQueryResultByToken(u) {
      const c = this.paginatedQuerySet.get(u);
      if (!c) return;
      const o = this.activePageQueryTokens(c);
      if (o.length === 0)
        return {
          results: [],
          status: "LoadingFirstPage",
          loadMore: (z) => this.loadMoreOfPaginatedQuery(u, z),
        };
      let h = [],
        f = !1,
        m = !1;
      for (const z of o) {
        const U = this.client.localQueryResultByToken(z);
        if (U === void 0) {
          ((f = !0), (m = !1));
          continue;
        }
        const D = Qs(U);
        ((h = h.concat(D.page)), (m = !!D.isDone));
      }
      let A;
      return (
        f
          ? (A = h.length === 0 ? "LoadingFirstPage" : "LoadingMore")
          : m
            ? (A = "Exhausted")
            : (A = "CanLoadMore"),
        {
          results: h,
          status: A,
          loadMore: (z) => this.loadMoreOfPaginatedQuery(u, z),
        }
      );
    }
    onBaseTransition(u) {
      const c = u.queries.map((m) => m.token),
        o = this.queriesContainingTokens(c);
      let h = [];
      o.length > 0 &&
        (this.processPaginatedQuerySplits(o, (m) =>
          this.client.localQueryResultByToken(m),
        ),
        (h = o.map((m) => ({
          token: m,
          modification: {
            kind: "Updated",
            result: this.localQueryResultByToken(m),
          },
        }))));
      const f = { ...u, paginatedQueries: h };
      this.onTransition(f);
    }
    loadMoreOfPaginatedQuery(u, c) {
      this.mustGetPaginatedQuery(u);
      const o = this.queryTokenForLastPageOfPaginatedQuery(u),
        h = this.client.localQueryResultByToken(o);
      if (!h) return !1;
      const f = Qs(h);
      if (f.isDone) return !1;
      this.addPageToPaginatedQuery(u, f.continueCursor, c);
      const m = {
        timestamp: this.lastTransitionTs,
        reflectedMutations: [],
        queries: [],
        paginatedQueries: [
          {
            token: u,
            modification: {
              kind: "Updated",
              result: this.localQueryResultByToken(u),
            },
          },
        ],
      };
      return (this.onTransition(m), !0);
    }
    queriesContainingTokens(u) {
      if (u.length === 0) return [];
      const c = [],
        o = new Set(u);
      for (const [h, f] of this.paginatedQuerySet)
        for (const m of this.allQueryTokens(f))
          if (o.has(m)) {
            c.push(h);
            break;
          }
      return c;
    }
    processPaginatedQuerySplits(u, c) {
      for (const o of u) {
        const h = this.mustGetPaginatedQuery(o),
          { ongoingSplits: f, pageKeyToQuery: m, pageKeys: A } = h;
        for (const [z, [U, D]] of f)
          c(m.get(U).queryToken) !== void 0 &&
            c(m.get(D).queryToken) !== void 0 &&
            this.completePaginatedQuerySplit(h, z, U, D);
        for (const z of A) {
          if (f.has(z)) continue;
          const U = m.get(z).queryToken,
            D = c(U);
          if (!D) continue;
          const O = Qs(D);
          O.splitCursor &&
            (O.pageStatus === "SplitRecommended" ||
              O.pageStatus === "SplitRequired" ||
              O.page.length > h.options.initialNumItems * 2) &&
            this.splitPaginatedQueryPage(h, z, O.splitCursor, O.continueCursor);
        }
      }
    }
    splitPaginatedQueryPage(u, c, o, h) {
      const f = u.nextPageKey++,
        m = u.nextPageKey++,
        A = { cursor: h, numItems: u.options.initialNumItems, id: u.id },
        z = this.client.subscribe(u.canonicalizedUdfPath, {
          ...u.args,
          paginationOpts: { ...A, cursor: null, endCursor: o },
        });
      u.pageKeyToQuery.set(f, z);
      const U = this.client.subscribe(u.canonicalizedUdfPath, {
        ...u.args,
        paginationOpts: { ...A, cursor: o, endCursor: h },
      });
      (u.pageKeyToQuery.set(m, U), u.ongoingSplits.set(c, [f, m]));
    }
    addPageToPaginatedQuery(u, c, o) {
      const h = this.mustGetPaginatedQuery(u),
        f = h.nextPageKey++,
        m = { cursor: c, numItems: o, id: h.id },
        A = { ...h.args, paginationOpts: m },
        z = this.client.subscribe(h.canonicalizedUdfPath, A);
      return (h.pageKeys.push(f), h.pageKeyToQuery.set(f, z), z);
    }
    removePaginatedQuerySubscriber(u) {
      const c = this.paginatedQuerySet.get(u);
      if (c && ((c.numSubscribers -= 1), !(c.numSubscribers > 0))) {
        for (const o of c.pageKeyToQuery.values()) o.unsubscribe();
        this.paginatedQuerySet.delete(u);
      }
    }
    completePaginatedQuerySplit(u, c, o, h) {
      const f = u.pageKeyToQuery.get(c);
      u.pageKeyToQuery.delete(c);
      const m = u.pageKeys.indexOf(c);
      (u.pageKeys.splice(m, 1, o, h),
        u.ongoingSplits.delete(c),
        f.unsubscribe());
    }
    activePageQueryTokens(u) {
      return u.pageKeys.map((c) => u.pageKeyToQuery.get(c).queryToken);
    }
    allQueryTokens(u) {
      return Array.from(u.pageKeyToQuery.values()).map((c) => c.queryToken);
    }
    queryTokenForLastPageOfPaginatedQuery(u) {
      const c = this.mustGetPaginatedQuery(u),
        o = c.pageKeys[c.pageKeys.length - 1];
      if (o === void 0) throw new Error(`No pages for paginated query ${u}`);
      return c.pageKeyToQuery.get(o).queryToken;
    }
    mustGetPaginatedQuery(u) {
      const c = this.paginatedQuerySet.get(u);
      if (!c)
        throw new Error("paginated query no longer exists for token " + u);
      return c;
    }
  },
  Sd = Yg(Ys(), 1),
  cm = Object.defineProperty,
  sm = (u, c, o) =>
    c in u
      ? cm(u, c, { enumerable: !0, configurable: !0, writable: !0, value: o })
      : (u[c] = o),
  nn = (u, c, o) => sm(u, typeof c != "symbol" ? c + "" : c, o),
  om = 5e3;
if (typeof Sd.default > "u")
  throw new Error("Required dependency 'react' not found");
var fm = class {
    constructor(u, c) {
      if (
        (nn(this, "address"),
        nn(this, "cachedSync"),
        nn(this, "cachedPaginatedQueryClient"),
        nn(this, "listeners"),
        nn(this, "options"),
        nn(this, "closed", !1),
        nn(this, "_logger"),
        nn(this, "adminAuth"),
        nn(this, "fakeUserIdentity"),
        u === void 0)
      )
        throw new Error(
          "No address provided to ConvexReactClient.\nIf trying to deploy to production, make sure to follow all the instructions found at https://docs.convex.dev/production/hosting/\nIf running locally, make sure to run `convex dev` and ensure the .env.local file is populated.",
        );
      if (typeof u != "string")
        throw new Error(
          `ConvexReactClient requires a URL like 'https://happy-otter-123.convex.cloud', received something of type ${typeof u} instead.`,
        );
      if (!u.includes("://"))
        throw new Error("Provided address was not an absolute URL.");
      ((this.address = u),
        (this.listeners = new Map()),
        (this._logger =
          c?.logger === !1
            ? yd({ verbose: c?.verbose ?? !1 })
            : c?.logger !== !0 && c?.logger
              ? c.logger
              : dd({ verbose: c?.verbose ?? !1 })),
        (this.options = { ...c, logger: this._logger }));
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
            new am(this.address, () => {}, this.options)),
          this.adminAuth &&
            this.cachedSync.setAdminAuth(this.adminAuth, this.fakeUserIdentity),
          (this.cachedPaginatedQueryClient = new um(this.cachedSync, (u) =>
            this.handleTransition(u),
          )),
          this.cachedSync);
    }
    get paginatedQueryClient() {
      if ((this.sync, this.cachedPaginatedQueryClient))
        return this.cachedPaginatedQueryClient;
      throw new Error("Should already be instantiated");
    }
    setAuth(u, c, o) {
      if (typeof u == "string")
        throw new Error(
          "Passing a string to ConvexReactClient.setAuth is no longer supported, please upgrade to passing in an async function to handle reauthentication.",
        );
      this.sync.setAuth(u, c ?? (() => {}), o);
    }
    clearAuth() {
      this.sync.clearAuth();
    }
    setAdminAuth(u, c) {
      if (((this.adminAuth = u), (this.fakeUserIdentity = c), this.closed))
        throw new Error("ConvexReactClient has already been closed.");
      this.cachedSync && this.sync.setAdminAuth(u, c);
    }
    watchQuery(u, ...c) {
      const [o, h] = c,
        f = Fn(u);
      return {
        onUpdate: (m) => {
          const { queryToken: A, unsubscribe: z } = this.sync.subscribe(
              f,
              o,
              h,
            ),
            U = this.listeners.get(A);
          return (
            U !== void 0 ? U.add(m) : this.listeners.set(A, new Set([m])),
            () => {
              if (this.closed) return;
              const D = this.listeners.get(A);
              (D.delete(m), D.size === 0 && this.listeners.delete(A), z());
            }
          );
        },
        localQueryResult: () => {
          if (this.cachedSync) return this.cachedSync.localQueryResult(f, o);
        },
        localQueryLogs: () => {
          if (this.cachedSync) return this.cachedSync.localQueryLogs(f, o);
        },
        journal: () => {
          if (this.cachedSync) return this.cachedSync.queryJournal(f, o);
        },
      };
    }
    prewarmQuery(u) {
      const c = u.extendSubscriptionFor ?? om,
        o = this.watchQuery(u.query, u.args || {}).onUpdate(() => {});
      setTimeout(o, c);
    }
    watchPaginatedQuery(u, c, o) {
      const h = Fn(u);
      return {
        onUpdate: (f) => {
          const { paginatedQueryToken: m, unsubscribe: A } =
              this.paginatedQueryClient.subscribe(h, c || {}, o),
            z = this.listeners.get(m);
          return (
            z !== void 0 ? z.add(f) : this.listeners.set(m, new Set([f])),
            () => {
              if (this.closed) return;
              const U = this.listeners.get(m);
              (U.delete(f), U.size === 0 && this.listeners.delete(m), A());
            }
          );
        },
        localQueryResult: () =>
          this.paginatedQueryClient.localQueryResult(h, c, o),
      };
    }
    mutation(u, ...c) {
      const [o, h] = c,
        f = Fn(u);
      return this.sync.mutation(f, o, h);
    }
    action(u, ...c) {
      const o = Fn(u);
      return this.sync.action(o, ...c);
    }
    query(u, ...c) {
      const o = this.watchQuery(u, ...c),
        h = o.localQueryResult();
      return h !== void 0
        ? Promise.resolve(h)
        : new Promise((f, m) => {
            const A = o.onUpdate(() => {
              A();
              try {
                f(o.localQueryResult());
              } catch (z) {
                m(z);
              }
            });
          });
    }
    connectionState() {
      return this.sync.connectionState();
    }
    subscribeToConnectionState(u) {
      return this.sync.subscribeToConnectionState(u);
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
        const u = this.cachedSync;
        ((this.cachedSync = void 0), await u.close());
      }
    }
    handleTransition(u) {
      const c = u.queries.map((h) => h.token),
        o = u.paginatedQueries.map((h) => h.token);
      this.transition([...c, ...o]);
    }
    transition(u) {
      for (const c of u) {
        const o = this.listeners.get(c);
        if (o) for (const h of o) h();
      }
    }
  },
  Cm = Sd.createContext(void 0),
  rm = _v,
  ld = 6e4,
  hm = 500,
  dm = 1e4,
  ym = 1e3,
  gm = 3e4,
  vm = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function id(u) {
  if (typeof u != "object" || u === null) return null;
  const c = u;
  if (
    (c.mode !== "light" && c.mode !== "dark") ||
    typeof c.tokens != "object" ||
    c.tokens === null
  )
    return null;
  const o = {};
  for (const [h, f] of Object.entries(c.tokens)) {
    if (typeof f != "string") return null;
    o[h] = f;
  }
  return { mode: c.mode, tokens: o };
}
function ud(u) {
  const c = document.documentElement;
  for (const [o, h] of Object.entries(u.tokens)) c.style.setProperty(o, h);
  (c.classList.toggle("light", u.mode === "light"),
    c.classList.toggle("dark", u.mode === "dark"));
}
function mm(u) {
  if (typeof u != "object" || u === null) return !1;
  const c = u;
  if (
    typeof c.pluginName != "string" ||
    typeof c.userId != "string" ||
    typeof c.organizationId != "string" ||
    typeof c.workspaceId != "string"
  )
    return !1;
  if (c.kind === "page")
    return typeof c.pageId == "string" && typeof c.pageTitle == "string";
  if (c.kind === "file_view") {
    if (
      typeof c.fileViewId != "string" ||
      typeof c.fileViewTitle != "string" ||
      typeof c.file != "object" ||
      c.file === null
    )
      return !1;
    const o = c.file;
    return (
      typeof o.fileNodeId == "string" &&
      typeof o.name == "string" &&
      typeof o.path == "string" &&
      typeof o.contentType == "string"
    );
  }
  return !1;
}
function Sm() {
  const u = window.location.hash.slice(1);
  if (!u)
    throw new Error(
      "Missing host bridge fragment — this plugin frame must be embedded by the Bonobo host app",
    );
  const c = new URLSearchParams(u),
    o = c.getAll("parentOrigin"),
    h = c.getAll("nonce");
  if (c.size !== 2 || o.length !== 1 || h.length !== 1)
    throw new Error("Invalid host bridge fragment");
  const f = o[0],
    m = h[0];
  let A;
  try {
    A = new URL(f);
  } catch {
    throw new Error("Invalid host bridge parent origin");
  }
  if ((A.protocol !== "http:" && A.protocol !== "https:") || A.origin !== f)
    throw new Error("Invalid host bridge parent origin");
  if (!vm.test(m)) throw new Error("Invalid host bridge nonce");
  return { parentOrigin: f, nonce: m };
}
async function pm() {
  const { parentOrigin: u, nonce: c } = Sm();
  let o = "",
    h = "",
    f = 0,
    m = "",
    A = 0,
    z = null;
  const U = new Set(),
    D = new Map();
  let O = null;
  async function V() {
    return Date.now() >= f - ld ? C() : h;
  }
  function C() {
    if (O) return O;
    const ct = crypto.randomUUID();
    return (
      (O = new Promise((tt, mt) => {
        const at = setTimeout(() => {
          (D.delete(ct), mt(new Error("Plugin frame token refresh timed out")));
        }, dm);
        D.set(ct, { resolve: tt, reject: mt, timeout: at });
        try {
          window.parent.postMessage(
            { type: "bonobo:token-refresh-request", nonce: c, requestId: ct },
            u,
          );
        } catch (yt) {
          (clearTimeout(at), D.delete(ct), mt(yt));
        }
      }).finally(() => {
        O = null;
      })),
      O
    );
  }
  const k = () => m !== "" && Date.now() < A - ld,
    At = (ct) => {
      typeof ct.jwt == "string" &&
      typeof ct.jwtExpiresAt == "number" &&
      Number.isFinite(ct.jwtExpiresAt)
        ? ((m = ct.jwt), (A = ct.jwtExpiresAt))
        : ((m = ""), (A = 0));
    };
  async function zt(ct, tt, mt) {
    const at = JSON.stringify(tt),
      yt = (Ct) => {
        const xt = new Headers(mt?.headers);
        return (
          xt.set("Authorization", `Bearer ${Ct}`),
          xt.set("Content-Type", "application/json"),
          xt.set("Accept", "application/json"),
          fetch(o + ct, {
            ...mt,
            method: "POST",
            body: at,
            headers: xt,
            redirect: "error",
          })
        );
      },
      X = await V();
    let gt = await yt(X);
    gt.status === 401 && (gt = await yt(h !== X ? h : await C()));
    const j = await gt.text();
    let ft = null;
    try {
      ft = JSON.parse(j);
    } catch {}
    return { status: gt.status, body: ft };
  }
  async function kt(ct) {
    const tt = new Headers(ct);
    return (tt.set("Authorization", `Bearer ${await V()}`), tt);
  }
  const Me = (ct) =>
    fetch(o + "/plugins-ui/session-jwt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: ct }),
    });
  async function Vt(ct) {
    const tt = ct?.forceRefreshToken === !0;
    for (let mt = 0; ; mt += 1) {
      if (k() && !tt) return m;
      let at = null;
      try {
        if (m !== "" && (await C(), k())) return m;
        ((at = await Me(await V())),
          at.status === 401 && (at = await Me(await C())));
      } catch {
        at = null;
      }
      if (at?.ok) {
        const yt = await at.json().catch(() => null),
          X = yt?._yay?.jwt,
          gt = yt?._yay?.sessionExpiresAt;
        return typeof X != "string" || typeof gt != "number"
          ? null
          : ((f = gt), (m = X), (A = gt), X);
      }
      if (!(at === null || at.status === 429 || at.status >= 500) || mt >= 2)
        return null;
      await new Promise((yt) => setTimeout(yt, 1e3 * (mt + 1)));
    }
  }
  return new Promise((ct) => {
    let tt = !1,
      mt;
    const at = () => {
        window.parent.postMessage({ type: "bonobo:ready", nonce: c }, u);
      },
      yt = () => {
        clearInterval(mt);
      },
      X = (gt) => {
        if (gt.source !== window.parent || gt.origin !== u) return;
        const j = gt.data;
        if (!(typeof j != "object" || j === null)) {
          if (
            j.type === "bonobo:init" &&
            !tt &&
            j.nonce === c &&
            typeof j.apiOrigin == "string" &&
            typeof j.convexUrl == "string" &&
            typeof j.token == "string" &&
            typeof j.tokenExpiresAt == "number" &&
            Number.isFinite(j.tokenExpiresAt) &&
            mm(j.context)
          ) {
            ((tt = !0),
              yt(),
              window.removeEventListener("pagehide", yt),
              (o = j.apiOrigin),
              (h = j.token),
              (f = j.tokenExpiresAt),
              At(j));
            const ft = new fm(j.convexUrl, {
              expectAuth: !0,
              unsavedChangesWarning: !1,
              initialAuthTokenReuse: !0,
            });
            let Ct = Date.now();
            const xt = setInterval(() => {
              const de = Date.now();
              (de - Ct >= gm && ft.setAuth(Vt), (Ct = de));
            }, ym);
            (ft.setAuth(Vt),
              window.addEventListener(
                "pagehide",
                () => {
                  (clearInterval(xt), ft.close());
                },
                { once: !0 },
              ),
              (z = id(j.theme)),
              z && ud(z),
              ct({
                context: j.context,
                apiOrigin: o,
                getToken: V,
                refreshToken: C,
                fetchJson: zt,
                authorize: kt,
                convex: ft,
                api: rm,
                session: { expiresAt: () => f, fetchJwt: Vt },
                theme: {
                  current: () => z,
                  subscribe(de) {
                    return (
                      U.add(de),
                      () => {
                        U.delete(de);
                      }
                    );
                  },
                },
              }));
          } else if (
            tt &&
            j.nonce === c &&
            j.type === "bonobo:token" &&
            typeof j.requestId == "string" &&
            typeof j.token == "string" &&
            typeof j.tokenExpiresAt == "number" &&
            Number.isFinite(j.tokenExpiresAt)
          ) {
            const ft = D.get(j.requestId);
            ft &&
              (D.delete(j.requestId),
              clearTimeout(ft.timeout),
              (h = j.token),
              (f = j.tokenExpiresAt),
              At(j),
              ft.resolve(j.token));
          } else if (tt && j.nonce === c && j.type === "bonobo:theme") {
            const ft = id(j.theme);
            if (ft) {
              ((z = ft), ud(ft));
              for (const Ct of U) Ct(ft);
            }
          } else if (
            tt &&
            j.nonce === c &&
            j.type === "bonobo:token-error" &&
            typeof j.requestId == "string" &&
            typeof j.message == "string"
          ) {
            const ft = D.get(j.requestId);
            ft &&
              (D.delete(j.requestId),
              clearTimeout(ft.timeout),
              ft.reject(new Error(j.message)));
          }
        }
      };
    (window.addEventListener("message", X),
      window.addEventListener("pagehide", yt, { once: !0 }),
      at(),
      (mt = setInterval(at, hm)));
  });
}
var bm = Be((u) => {
    function c(Q, q) {
      var N = Q.length;
      Q.push(q);
      t: for (; 0 < N; ) {
        var lt = (N - 1) >>> 1,
          St = Q[lt];
        if (0 < f(St, q)) ((Q[lt] = q), (Q[N] = St), (N = lt));
        else break t;
      }
    }
    function o(Q) {
      return Q.length === 0 ? null : Q[0];
    }
    function h(Q) {
      if (Q.length === 0) return null;
      var q = Q[0],
        N = Q.pop();
      if (N !== q) {
        Q[0] = N;
        t: for (var lt = 0, St = Q.length, ae = St >>> 1; lt < ae; ) {
          var g = 2 * (lt + 1) - 1,
            R = Q[g],
            w = g + 1,
            L = Q[w];
          if (0 > f(R, N))
            w < St && 0 > f(L, R)
              ? ((Q[lt] = L), (Q[w] = N), (lt = w))
              : ((Q[lt] = R), (Q[g] = N), (lt = g));
          else if (w < St && 0 > f(L, N)) ((Q[lt] = L), (Q[w] = N), (lt = w));
          else break t;
        }
      }
      return q;
    }
    function f(Q, q) {
      var N = Q.sortIndex - q.sortIndex;
      return N !== 0 ? N : Q.id - q.id;
    }
    if (
      ((u.unstable_now = void 0),
      typeof performance == "object" && typeof performance.now == "function")
    ) {
      var m = performance;
      u.unstable_now = function () {
        return m.now();
      };
    } else {
      var A = Date,
        z = A.now();
      u.unstable_now = function () {
        return A.now() - z;
      };
    }
    var U = [],
      D = [],
      O = 1,
      V = null,
      C = 3,
      k = !1,
      At = !1,
      zt = !1,
      kt = !1,
      Me = typeof setTimeout == "function" ? setTimeout : null,
      Vt = typeof clearTimeout == "function" ? clearTimeout : null,
      ct = typeof setImmediate < "u" ? setImmediate : null;
    function tt(Q) {
      for (var q = o(D); q !== null; ) {
        if (q.callback === null) h(D);
        else if (q.startTime <= Q)
          (h(D), (q.sortIndex = q.expirationTime), c(U, q));
        else break;
        q = o(D);
      }
    }
    function mt(Q) {
      if (((zt = !1), tt(Q), !At))
        if (o(U) !== null) ((At = !0), at || ((at = !0), Ct()));
        else {
          var q = o(D);
          q !== null && Re(mt, q.startTime - Q);
        }
    }
    var at = !1,
      yt = -1,
      X = 5,
      gt = -1;
    function j() {
      return kt ? !0 : !(u.unstable_now() - gt < X);
    }
    function ft() {
      if (((kt = !1), at)) {
        var Q = u.unstable_now();
        gt = Q;
        var q = !0;
        try {
          t: {
            ((At = !1), zt && ((zt = !1), Vt(yt), (yt = -1)), (k = !0));
            var N = C;
            try {
              e: {
                for (
                  tt(Q), V = o(U);
                  V !== null && !(V.expirationTime > Q && j());
                ) {
                  var lt = V.callback;
                  if (typeof lt == "function") {
                    ((V.callback = null), (C = V.priorityLevel));
                    var St = lt(V.expirationTime <= Q);
                    if (((Q = u.unstable_now()), typeof St == "function")) {
                      ((V.callback = St), tt(Q), (q = !0));
                      break e;
                    }
                    (V === o(U) && h(U), tt(Q));
                  } else h(U);
                  V = o(U);
                }
                if (V !== null) q = !0;
                else {
                  var ae = o(D);
                  (ae !== null && Re(mt, ae.startTime - Q), (q = !1));
                }
              }
              break t;
            } finally {
              ((V = null), (C = N), (k = !1));
            }
            q = void 0;
          }
        } finally {
          q ? Ct() : (at = !1);
        }
      }
    }
    var Ct;
    if (typeof ct == "function")
      Ct = function () {
        ct(ft);
      };
    else if (typeof MessageChannel < "u") {
      var xt = new MessageChannel(),
        de = xt.port2;
      ((xt.port1.onmessage = ft),
        (Ct = function () {
          de.postMessage(null);
        }));
    } else
      Ct = function () {
        Me(ft, 0);
      };
    function Re(Q, q) {
      yt = Me(function () {
        Q(u.unstable_now());
      }, q);
    }
    ((u.unstable_IdlePriority = 5),
      (u.unstable_ImmediatePriority = 1),
      (u.unstable_LowPriority = 4),
      (u.unstable_NormalPriority = 3),
      (u.unstable_Profiling = null),
      (u.unstable_UserBlockingPriority = 2),
      (u.unstable_cancelCallback = function (Q) {
        Q.callback = null;
      }),
      (u.unstable_forceFrameRate = function (Q) {
        0 > Q || 125 < Q
          ? console.error(
              "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
            )
          : (X = 0 < Q ? Math.floor(1e3 / Q) : 5);
      }),
      (u.unstable_getCurrentPriorityLevel = function () {
        return C;
      }),
      (u.unstable_next = function (Q) {
        switch (C) {
          case 1:
          case 2:
          case 3:
            var q = 3;
            break;
          default:
            q = C;
        }
        var N = C;
        C = q;
        try {
          return Q();
        } finally {
          C = N;
        }
      }),
      (u.unstable_requestPaint = function () {
        kt = !0;
      }),
      (u.unstable_runWithPriority = function (Q, q) {
        switch (Q) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            break;
          default:
            Q = 3;
        }
        var N = C;
        C = Q;
        try {
          return q();
        } finally {
          C = N;
        }
      }),
      (u.unstable_scheduleCallback = function (Q, q, N) {
        var lt = u.unstable_now();
        switch (
          (typeof N == "object" && N !== null
            ? ((N = N.delay), (N = typeof N == "number" && 0 < N ? lt + N : lt))
            : (N = lt),
          Q)
        ) {
          case 1:
            var St = -1;
            break;
          case 2:
            St = 250;
            break;
          case 5:
            St = 1073741823;
            break;
          case 4:
            St = 1e4;
            break;
          default:
            St = 5e3;
        }
        return (
          (St = N + St),
          (Q = {
            id: O++,
            callback: q,
            priorityLevel: Q,
            startTime: N,
            expirationTime: St,
            sortIndex: -1,
          }),
          N > lt
            ? ((Q.sortIndex = N),
              c(D, Q),
              o(U) === null &&
                Q === o(D) &&
                (zt ? (Vt(yt), (yt = -1)) : (zt = !0), Re(mt, N - lt)))
            : ((Q.sortIndex = St),
              c(U, Q),
              At || k || ((At = !0), at || ((at = !0), Ct()))),
          Q
        );
      }),
      (u.unstable_shouldYield = j),
      (u.unstable_wrapCallback = function (Q) {
        var q = C;
        return function () {
          var N = C;
          C = q;
          try {
            return Q.apply(this, arguments);
          } finally {
            C = N;
          }
        };
      }));
  }),
  Tm = Be((u, c) => {
    c.exports = bm();
  }),
  Am = Be((u) => {
    var c = Ys();
    function o(D) {
      var O = "https://react.dev/errors/" + D;
      if (1 < arguments.length) {
        O += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var V = 2; V < arguments.length; V++)
          O += "&args[]=" + encodeURIComponent(arguments[V]);
      }
      return (
        "Minified React error #" +
        D +
        "; visit " +
        O +
        " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
      );
    }
    function h() {}
    var f = {
        d: {
          f: h,
          r: function () {
            throw Error(o(522));
          },
          D: h,
          C: h,
          L: h,
          m: h,
          X: h,
          S: h,
          M: h,
        },
        p: 0,
        findDOMNode: null,
      },
      m = Symbol.for("react.portal");
    function A(D, O, V) {
      var C =
        3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
      return {
        $$typeof: m,
        key: C == null ? null : "" + C,
        children: D,
        containerInfo: O,
        implementation: V,
      };
    }
    var z = c.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    function U(D, O) {
      if (D === "font") return "";
      if (typeof O == "string") return O === "use-credentials" ? O : "";
    }
    ((u.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = f),
      (u.createPortal = function (D, O) {
        var V =
          2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
        if (!O || (O.nodeType !== 1 && O.nodeType !== 9 && O.nodeType !== 11))
          throw Error(o(299));
        return A(D, O, null, V);
      }),
      (u.flushSync = function (D) {
        var O = z.T,
          V = f.p;
        try {
          if (((z.T = null), (f.p = 2), D)) return D();
        } finally {
          ((z.T = O), (f.p = V), f.d.f());
        }
      }),
      (u.preconnect = function (D, O) {
        typeof D == "string" &&
          (O
            ? ((O = O.crossOrigin),
              (O =
                typeof O == "string"
                  ? O === "use-credentials"
                    ? O
                    : ""
                  : void 0))
            : (O = null),
          f.d.C(D, O));
      }),
      (u.prefetchDNS = function (D) {
        typeof D == "string" && f.d.D(D);
      }),
      (u.preinit = function (D, O) {
        if (typeof D == "string" && O && typeof O.as == "string") {
          var V = O.as,
            C = U(V, O.crossOrigin),
            k = typeof O.integrity == "string" ? O.integrity : void 0,
            At = typeof O.fetchPriority == "string" ? O.fetchPriority : void 0;
          V === "style"
            ? f.d.S(
                D,
                typeof O.precedence == "string" ? O.precedence : void 0,
                { crossOrigin: C, integrity: k, fetchPriority: At },
              )
            : V === "script" &&
              f.d.X(D, {
                crossOrigin: C,
                integrity: k,
                fetchPriority: At,
                nonce: typeof O.nonce == "string" ? O.nonce : void 0,
              });
        }
      }),
      (u.preinitModule = function (D, O) {
        if (typeof D == "string")
          if (typeof O == "object" && O !== null) {
            if (O.as == null || O.as === "script") {
              var V = U(O.as, O.crossOrigin);
              f.d.M(D, {
                crossOrigin: V,
                integrity:
                  typeof O.integrity == "string" ? O.integrity : void 0,
                nonce: typeof O.nonce == "string" ? O.nonce : void 0,
              });
            }
          } else O ?? f.d.M(D);
      }),
      (u.preload = function (D, O) {
        if (
          typeof D == "string" &&
          typeof O == "object" &&
          O !== null &&
          typeof O.as == "string"
        ) {
          var V = O.as,
            C = U(V, O.crossOrigin);
          f.d.L(D, V, {
            crossOrigin: C,
            integrity: typeof O.integrity == "string" ? O.integrity : void 0,
            nonce: typeof O.nonce == "string" ? O.nonce : void 0,
            type: typeof O.type == "string" ? O.type : void 0,
            fetchPriority:
              typeof O.fetchPriority == "string" ? O.fetchPriority : void 0,
            referrerPolicy:
              typeof O.referrerPolicy == "string" ? O.referrerPolicy : void 0,
            imageSrcSet:
              typeof O.imageSrcSet == "string" ? O.imageSrcSet : void 0,
            imageSizes: typeof O.imageSizes == "string" ? O.imageSizes : void 0,
            media: typeof O.media == "string" ? O.media : void 0,
          });
        }
      }),
      (u.preloadModule = function (D, O) {
        if (typeof D == "string")
          if (O) {
            var V = U(O.as, O.crossOrigin);
            f.d.m(D, {
              as: typeof O.as == "string" && O.as !== "script" ? O.as : void 0,
              crossOrigin: V,
              integrity: typeof O.integrity == "string" ? O.integrity : void 0,
            });
          } else f.d.m(D);
      }),
      (u.requestFormReset = function (D) {
        f.d.r(D);
      }),
      (u.unstable_batchedUpdates = function (D, O) {
        return D(O);
      }),
      (u.useFormState = function (D, O, V) {
        return z.H.useFormState(D, O, V);
      }),
      (u.useFormStatus = function () {
        return z.H.useHostTransitionStatus();
      }),
      (u.version = "19.2.7"));
  }),
  _m = Be((u, c) => {
    function o() {
      if (
        !(
          typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
          typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
        )
      )
        try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(o);
        } catch (h) {
          console.error(h);
        }
    }
    (o(), (c.exports = Am()));
  }),
  Em = Be((u) => {
    var c = Tm(),
      o = Ys(),
      h = _m();
    function f(t) {
      var e = "https://react.dev/errors/" + t;
      if (1 < arguments.length) {
        e += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var n = 2; n < arguments.length; n++)
          e += "&args[]=" + encodeURIComponent(arguments[n]);
      }
      return (
        "Minified React error #" +
        t +
        "; visit " +
        e +
        " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
      );
    }
    function m(t) {
      return !(
        !t ||
        (t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11)
      );
    }
    function A(t) {
      var e = t,
        n = t;
      if (t.alternate) for (; e.return; ) e = e.return;
      else {
        t = e;
        do ((e = t), (e.flags & 4098) !== 0 && (n = e.return), (t = e.return));
        while (t);
      }
      return e.tag === 3 ? n : null;
    }
    function z(t) {
      if (t.tag === 13) {
        var e = t.memoizedState;
        if (
          (e === null &&
            ((t = t.alternate), t !== null && (e = t.memoizedState)),
          e !== null)
        )
          return e.dehydrated;
      }
      return null;
    }
    function U(t) {
      if (t.tag === 31) {
        var e = t.memoizedState;
        if (
          (e === null &&
            ((t = t.alternate), t !== null && (e = t.memoizedState)),
          e !== null)
        )
          return e.dehydrated;
      }
      return null;
    }
    function D(t) {
      if (A(t) !== t) throw Error(f(188));
    }
    function O(t) {
      var e = t.alternate;
      if (!e) {
        if (((e = A(t)), e === null)) throw Error(f(188));
        return e !== t ? null : t;
      }
      for (var n = t, a = e; ; ) {
        var l = n.return;
        if (l === null) break;
        var i = l.alternate;
        if (i === null) {
          if (((a = l.return), a !== null)) {
            n = a;
            continue;
          }
          break;
        }
        if (l.child === i.child) {
          for (i = l.child; i; ) {
            if (i === n) return (D(l), t);
            if (i === a) return (D(l), e);
            i = i.sibling;
          }
          throw Error(f(188));
        }
        if (n.return !== a.return) ((n = l), (a = i));
        else {
          for (var s = !1, r = l.child; r; ) {
            if (r === n) {
              ((s = !0), (n = l), (a = i));
              break;
            }
            if (r === a) {
              ((s = !0), (a = l), (n = i));
              break;
            }
            r = r.sibling;
          }
          if (!s) {
            for (r = i.child; r; ) {
              if (r === n) {
                ((s = !0), (n = i), (a = l));
                break;
              }
              if (r === a) {
                ((s = !0), (a = i), (n = l));
                break;
              }
              r = r.sibling;
            }
            if (!s) throw Error(f(189));
          }
        }
        if (n.alternate !== a) throw Error(f(190));
      }
      if (n.tag !== 3) throw Error(f(188));
      return n.stateNode.current === n ? t : e;
    }
    function V(t) {
      var e = t.tag;
      if (e === 5 || e === 26 || e === 27 || e === 6) return t;
      for (t = t.child; t !== null; ) {
        if (((e = V(t)), e !== null)) return e;
        t = t.sibling;
      }
      return null;
    }
    var C = Object.assign,
      k = Symbol.for("react.element"),
      At = Symbol.for("react.transitional.element"),
      zt = Symbol.for("react.portal"),
      kt = Symbol.for("react.fragment"),
      Me = Symbol.for("react.strict_mode"),
      Vt = Symbol.for("react.profiler"),
      ct = Symbol.for("react.consumer"),
      tt = Symbol.for("react.context"),
      mt = Symbol.for("react.forward_ref"),
      at = Symbol.for("react.suspense"),
      yt = Symbol.for("react.suspense_list"),
      X = Symbol.for("react.memo"),
      gt = Symbol.for("react.lazy"),
      j = Symbol.for("react.activity"),
      ft = Symbol.for("react.memo_cache_sentinel"),
      Ct = Symbol.iterator;
    function xt(t) {
      return t === null || typeof t != "object"
        ? null
        : ((t = (Ct && t[Ct]) || t["@@iterator"]),
          typeof t == "function" ? t : null);
    }
    var de = Symbol.for("react.client.reference");
    function Re(t) {
      if (t == null) return null;
      if (typeof t == "function")
        return t.$$typeof === de ? null : t.displayName || t.name || null;
      if (typeof t == "string") return t;
      switch (t) {
        case kt:
          return "Fragment";
        case Vt:
          return "Profiler";
        case Me:
          return "StrictMode";
        case at:
          return "Suspense";
        case yt:
          return "SuspenseList";
        case j:
          return "Activity";
      }
      if (typeof t == "object")
        switch (t.$$typeof) {
          case zt:
            return "Portal";
          case tt:
            return t.displayName || "Context";
          case ct:
            return (t._context.displayName || "Context") + ".Consumer";
          case mt:
            var e = t.render;
            return (
              (t = t.displayName),
              t ||
                ((t = e.displayName || e.name || ""),
                (t = t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef")),
              t
            );
          case X:
            return (
              (e = t.displayName || null),
              e !== null ? e : Re(t.type) || "Memo"
            );
          case gt:
            ((e = t._payload), (t = t._init));
            try {
              return Re(t(e));
            } catch {}
        }
      return null;
    }
    var Q = Array.isArray,
      q = o.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
      N = h.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
      lt = { pending: !1, data: null, method: null, action: null },
      St = [],
      ae = -1;
    function g(t) {
      return { current: t };
    }
    function R(t) {
      0 > ae || ((t.current = St[ae]), (St[ae] = null), ae--);
    }
    function w(t, e) {
      (ae++, (St[ae] = t.current), (t.current = e));
    }
    var L = g(null),
      K = g(null),
      J = g(null),
      ut = g(null);
    function Kt(t, e) {
      switch ((w(J, e), w(K, t), w(L, null), e.nodeType)) {
        case 9:
        case 11:
          t = (t = e.documentElement) && (t = t.namespaceURI) ? gh(t) : 0;
          break;
        default:
          if (((t = e.tagName), (e = e.namespaceURI)))
            ((e = gh(e)), (t = vh(e, t)));
          else
            switch (t) {
              case "svg":
                t = 1;
                break;
              case "math":
                t = 2;
                break;
              default:
                t = 0;
            }
      }
      (R(L), w(L, t));
    }
    function Ot() {
      (R(L), R(K), R(J));
    }
    function Xa(t) {
      t.memoizedState !== null && w(ut, t);
      var e = L.current,
        n = vh(e, t.type);
      e !== n && (w(K, t), w(L, n));
    }
    function Yl(t) {
      (K.current === t && (R(L), R(K)),
        ut.current === t && (R(ut), (Ul._currentValue = lt)));
    }
    var du, Xs;
    function Cn(t) {
      if (du === void 0)
        try {
          throw Error();
        } catch (n) {
          var e = n.stack.trim().match(/\n( *(at )?)/);
          ((du = (e && e[1]) || ""),
            (Xs =
              -1 <
              n.stack.indexOf(`
    at`)
                ? " (<anonymous>)"
                : -1 < n.stack.indexOf("@")
                  ? "@unknown:0:0"
                  : ""));
        }
      return (
        `
` +
        du +
        t +
        Xs
      );
    }
    var yu = !1;
    function gu(t, e) {
      if (!t || yu) return "";
      yu = !0;
      var n = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      try {
        var a = {
          DetermineComponentFrameRoot: function () {
            try {
              if (e) {
                var M = function () {
                  throw Error();
                };
                if (
                  (Object.defineProperty(M.prototype, "props", {
                    set: function () {
                      throw Error();
                    },
                  }),
                  typeof Reflect == "object" && Reflect.construct)
                ) {
                  try {
                    Reflect.construct(M, []);
                  } catch (T) {
                    var b = T;
                  }
                  Reflect.construct(t, [], M);
                } else {
                  try {
                    M.call();
                  } catch (T) {
                    b = T;
                  }
                  t.call(M.prototype);
                }
              } else {
                try {
                  throw Error();
                } catch (T) {
                  b = T;
                }
                (M = t()) &&
                  typeof M.catch == "function" &&
                  M.catch(function () {});
              }
            } catch (T) {
              if (T && b && typeof T.stack == "string")
                return [T.stack, b.stack];
            }
            return [null, null];
          },
        };
        a.DetermineComponentFrameRoot.displayName =
          "DetermineComponentFrameRoot";
        var l = Object.getOwnPropertyDescriptor(
          a.DetermineComponentFrameRoot,
          "name",
        );
        l &&
          l.configurable &&
          Object.defineProperty(a.DetermineComponentFrameRoot, "name", {
            value: "DetermineComponentFrameRoot",
          });
        var i = a.DetermineComponentFrameRoot(),
          s = i[0],
          r = i[1];
        if (s && r) {
          var d = s.split(`
`),
            p = r.split(`
`);
          for (
            l = a = 0;
            a < d.length && !d[a].includes("DetermineComponentFrameRoot");
          )
            a++;
          for (
            ;
            l < p.length && !p[l].includes("DetermineComponentFrameRoot");
          )
            l++;
          if (a === d.length || l === p.length)
            for (
              a = d.length - 1, l = p.length - 1;
              1 <= a && 0 <= l && d[a] !== p[l];
            )
              l--;
          for (; 1 <= a && 0 <= l; a--, l--)
            if (d[a] !== p[l]) {
              if (a !== 1 || l !== 1)
                do
                  if ((a--, l--, 0 > l || d[a] !== p[l])) {
                    var _ =
                      `
` + d[a].replace(" at new ", " at ");
                    return (
                      t.displayName &&
                        _.includes("<anonymous>") &&
                        (_ = _.replace("<anonymous>", t.displayName)),
                      _
                    );
                  }
                while (1 <= a && 0 <= l);
              break;
            }
        }
      } finally {
        ((yu = !1), (Error.prepareStackTrace = n));
      }
      return (n = t ? t.displayName || t.name : "") ? Cn(n) : "";
    }
    function bd(t, e) {
      switch (t.tag) {
        case 26:
        case 27:
        case 5:
          return Cn(t.type);
        case 16:
          return Cn("Lazy");
        case 13:
          return t.child !== e && e !== null
            ? Cn("Suspense Fallback")
            : Cn("Suspense");
        case 19:
          return Cn("SuspenseList");
        case 0:
        case 15:
          return gu(t.type, !1);
        case 11:
          return gu(t.type.render, !1);
        case 1:
          return gu(t.type, !0);
        case 31:
          return Cn("Activity");
        default:
          return "";
      }
    }
    function Zs(t) {
      try {
        var e = "",
          n = null;
        do ((e += bd(t, n)), (n = t), (t = t.return));
        while (t);
        return e;
      } catch (a) {
        return (
          `
Error generating stack: ` +
          a.message +
          `
` +
          a.stack
        );
      }
    }
    var vu = Object.prototype.hasOwnProperty,
      mu = c.unstable_scheduleCallback,
      Su = c.unstable_cancelCallback,
      Td = c.unstable_shouldYield,
      Ad = c.unstable_requestPaint,
      le = c.unstable_now,
      _d = c.unstable_getCurrentPriorityLevel,
      ks = c.unstable_ImmediatePriority,
      Ks = c.unstable_UserBlockingPriority,
      Gl = c.unstable_NormalPriority,
      Ed = c.unstable_LowPriority,
      Js = c.unstable_IdlePriority,
      Od = c.log,
      Md = c.unstable_setDisableYieldValue,
      Za = null,
      ie = null;
    function ln(t) {
      if (
        (typeof Od == "function" && Md(t),
        ie && typeof ie.setStrictMode == "function")
      )
        try {
          ie.setStrictMode(Za, t);
        } catch {}
    }
    var ue = Math.clz32 ? Math.clz32 : Cd,
      Rd = Math.log,
      zd = Math.LN2;
    function Cd(t) {
      return ((t >>>= 0), t === 0 ? 32 : (31 - ((Rd(t) / zd) | 0)) | 0);
    }
    var Xl = 256,
      Zl = 262144,
      kl = 4194304;
    function qn(t) {
      var e = t & 42;
      if (e !== 0) return e;
      switch (t & -t) {
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
          return t & 261888;
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return t & 3932160;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          return t & 62914560;
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
          return t;
      }
    }
    function Kl(t, e, n) {
      var a = t.pendingLanes;
      if (a === 0) return 0;
      var l = 0,
        i = t.suspendedLanes,
        s = t.pingedLanes;
      t = t.warmLanes;
      var r = a & 134217727;
      return (
        r !== 0
          ? ((a = r & ~i),
            a !== 0
              ? (l = qn(a))
              : ((s &= r),
                s !== 0
                  ? (l = qn(s))
                  : n || ((n = r & ~t), n !== 0 && (l = qn(n)))))
          : ((r = a & ~i),
            r !== 0
              ? (l = qn(r))
              : s !== 0
                ? (l = qn(s))
                : n || ((n = a & ~t), n !== 0 && (l = qn(n)))),
        l === 0
          ? 0
          : e !== 0 &&
              e !== l &&
              (e & i) === 0 &&
              ((i = l & -l),
              (n = e & -e),
              i >= n || (i === 32 && (n & 4194048) !== 0))
            ? e
            : l
      );
    }
    function ka(t, e) {
      return (t.pendingLanes & ~(t.suspendedLanes & ~t.pingedLanes) & e) === 0;
    }
    function qd(t, e) {
      switch (t) {
        case 1:
        case 2:
        case 4:
        case 8:
        case 64:
          return e + 250;
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
          return e + 5e3;
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
    function $s() {
      var t = kl;
      return ((kl <<= 1), (kl & 62914560) === 0 && (kl = 4194304), t);
    }
    function pu(t) {
      for (var e = [], n = 0; 31 > n; n++) e.push(t);
      return e;
    }
    function Jl(t, e) {
      ((t.pendingLanes |= e),
        e !== 268435456 &&
          ((t.suspendedLanes = 0), (t.pingedLanes = 0), (t.warmLanes = 0)));
    }
    function Dd(t, e, n, a, l, i) {
      var s = t.pendingLanes;
      ((t.pendingLanes = n),
        (t.suspendedLanes = 0),
        (t.pingedLanes = 0),
        (t.warmLanes = 0),
        (t.expiredLanes &= n),
        (t.entangledLanes &= n),
        (t.errorRecoveryDisabledLanes &= n),
        (t.shellSuspendCounter = 0));
      var r = t.entanglements,
        d = t.expirationTimes,
        p = t.hiddenUpdates;
      for (n = s & ~n; 0 < n; ) {
        var _ = 31 - ue(n),
          M = 1 << _;
        ((r[_] = 0), (d[_] = -1));
        var b = p[_];
        if (b !== null)
          for (p[_] = null, _ = 0; _ < b.length; _++) {
            var T = b[_];
            T !== null && (T.lane &= -536870913);
          }
        n &= ~M;
      }
      (a !== 0 && Fs(t, a, 0),
        i !== 0 &&
          l === 0 &&
          t.tag !== 0 &&
          (t.suspendedLanes |= i & ~(s & ~e)));
    }
    function Fs(t, e, n) {
      ((t.pendingLanes |= e), (t.suspendedLanes &= ~e));
      var a = 31 - ue(e);
      ((t.entangledLanes |= e),
        (t.entanglements[a] = t.entanglements[a] | 1073741824 | (n & 261930)));
    }
    function Ws(t, e) {
      var n = (t.entangledLanes |= e);
      for (t = t.entanglements; n; ) {
        var a = 31 - ue(n),
          l = 1 << a;
        ((l & e) | (t[a] & e) && (t[a] |= e), (n &= ~l));
      }
    }
    function Is(t, e) {
      var n = e & -e;
      return (
        (n = (n & 42) !== 0 ? 1 : Ps(n)),
        (n & (t.suspendedLanes | e)) !== 0 ? 0 : n
      );
    }
    function Ps(t) {
      switch (t) {
        case 2:
          t = 1;
          break;
        case 8:
          t = 4;
          break;
        case 32:
          t = 16;
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
          t = 128;
          break;
        case 268435456:
          t = 134217728;
          break;
        default:
          t = 0;
      }
      return t;
    }
    function bu(t) {
      return (
        (t &= -t),
        2 < t ? (8 < t ? ((t & 134217727) !== 0 ? 32 : 268435456) : 8) : 2
      );
    }
    function to() {
      var t = N.p;
      return t !== 0 ? t : ((t = window.event), t === void 0 ? 32 : Hh(t.type));
    }
    function eo(t, e) {
      var n = N.p;
      try {
        return ((N.p = t), e());
      } finally {
        N.p = n;
      }
    }
    var un = Math.random().toString(36).slice(2),
      jt = "__reactFiber$" + un,
      $t = "__reactProps$" + un,
      Ka = "__reactContainer$" + un,
      Tu = "__reactEvents$" + un,
      wd = "__reactListeners$" + un,
      Ud = "__reactHandles$" + un,
      no = "__reactResources$" + un,
      Ja = "__reactMarker$" + un;
    function Au(t) {
      (delete t[jt], delete t[$t], delete t[Tu], delete t[wd], delete t[Ud]);
    }
    function ta(t) {
      var e = t[jt];
      if (e) return e;
      for (var n = t.parentNode; n; ) {
        if ((e = n[Ka] || n[jt])) {
          if (
            ((n = e.alternate),
            e.child !== null || (n !== null && n.child !== null))
          )
            for (t = _h(t); t !== null; ) {
              if ((n = t[jt])) return n;
              t = _h(t);
            }
          return e;
        }
        ((t = n), (n = t.parentNode));
      }
      return null;
    }
    function ea(t) {
      if ((t = t[jt] || t[Ka])) {
        var e = t.tag;
        if (
          e === 5 ||
          e === 6 ||
          e === 13 ||
          e === 31 ||
          e === 26 ||
          e === 27 ||
          e === 3
        )
          return t;
      }
      return null;
    }
    function $a(t) {
      var e = t.tag;
      if (e === 5 || e === 26 || e === 27 || e === 6) return t.stateNode;
      throw Error(f(33));
    }
    function na(t) {
      var e = t[no];
      return (
        e ||
          (e = t[no] =
            { hoistableStyles: new Map(), hoistableScripts: new Map() }),
        e
      );
    }
    function Ht(t) {
      t[Ja] = !0;
    }
    var ao = new Set(),
      lo = {};
    function Dn(t, e) {
      (aa(t, e), aa(t + "Capture", e));
    }
    function aa(t, e) {
      for (lo[t] = e, t = 0; t < e.length; t++) ao.add(e[t]);
    }
    var Nd = RegExp(
        "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$",
      ),
      io = {},
      uo = {};
    function Qd(t) {
      return vu.call(uo, t)
        ? !0
        : vu.call(io, t)
          ? !1
          : Nd.test(t)
            ? (uo[t] = !0)
            : ((io[t] = !0), !1);
    }
    function $l(t, e, n) {
      if (Qd(e))
        if (n === null) t.removeAttribute(e);
        else {
          switch (typeof n) {
            case "undefined":
            case "function":
            case "symbol":
              t.removeAttribute(e);
              return;
            case "boolean":
              var a = e.toLowerCase().slice(0, 5);
              if (a !== "data-" && a !== "aria-") {
                t.removeAttribute(e);
                return;
              }
          }
          t.setAttribute(e, "" + n);
        }
    }
    function Fl(t, e, n) {
      if (n === null) t.removeAttribute(e);
      else {
        switch (typeof n) {
          case "undefined":
          case "function":
          case "symbol":
          case "boolean":
            t.removeAttribute(e);
            return;
        }
        t.setAttribute(e, "" + n);
      }
    }
    function He(t, e, n, a) {
      if (a === null) t.removeAttribute(n);
      else {
        switch (typeof a) {
          case "undefined":
          case "function":
          case "symbol":
          case "boolean":
            t.removeAttribute(n);
            return;
        }
        t.setAttributeNS(e, n, "" + a);
      }
    }
    function ye(t) {
      switch (typeof t) {
        case "bigint":
        case "boolean":
        case "number":
        case "string":
        case "undefined":
          return t;
        case "object":
          return t;
        default:
          return "";
      }
    }
    function co(t) {
      var e = t.type;
      return (
        (t = t.nodeName) &&
        t.toLowerCase() === "input" &&
        (e === "checkbox" || e === "radio")
      );
    }
    function Bd(t, e, n) {
      var a = Object.getOwnPropertyDescriptor(t.constructor.prototype, e);
      if (
        !t.hasOwnProperty(e) &&
        typeof a < "u" &&
        typeof a.get == "function" &&
        typeof a.set == "function"
      ) {
        var l = a.get,
          i = a.set;
        return (
          Object.defineProperty(t, e, {
            configurable: !0,
            get: function () {
              return l.call(this);
            },
            set: function (s) {
              ((n = "" + s), i.call(this, s));
            },
          }),
          Object.defineProperty(t, e, { enumerable: a.enumerable }),
          {
            getValue: function () {
              return n;
            },
            setValue: function (s) {
              n = "" + s;
            },
            stopTracking: function () {
              ((t._valueTracker = null), delete t[e]);
            },
          }
        );
      }
    }
    function _u(t) {
      if (!t._valueTracker) {
        var e = co(t) ? "checked" : "value";
        t._valueTracker = Bd(t, e, "" + t[e]);
      }
    }
    function so(t) {
      if (!t) return !1;
      var e = t._valueTracker;
      if (!e) return !0;
      var n = e.getValue(),
        a = "";
      return (
        t && (a = co(t) ? (t.checked ? "true" : "false") : t.value),
        (t = a),
        t !== n ? (e.setValue(t), !0) : !1
      );
    }
    function Wl(t) {
      if (
        ((t = t || (typeof document < "u" ? document : void 0)), typeof t > "u")
      )
        return null;
      try {
        return t.activeElement || t.body;
      } catch {
        return t.body;
      }
    }
    var Hd = /[\n"\\]/g;
    function ge(t) {
      return t.replace(Hd, function (e) {
        return "\\" + e.charCodeAt(0).toString(16) + " ";
      });
    }
    function Eu(t, e, n, a, l, i, s, r) {
      ((t.name = ""),
        s != null &&
        typeof s != "function" &&
        typeof s != "symbol" &&
        typeof s != "boolean"
          ? (t.type = s)
          : t.removeAttribute("type"),
        e != null
          ? s === "number"
            ? ((e === 0 && t.value === "") || t.value != e) &&
              (t.value = "" + ye(e))
            : t.value !== "" + ye(e) && (t.value = "" + ye(e))
          : (s !== "submit" && s !== "reset") || t.removeAttribute("value"),
        e != null
          ? Ou(t, s, ye(e))
          : n != null
            ? Ou(t, s, ye(n))
            : a != null && t.removeAttribute("value"),
        l == null && i != null && (t.defaultChecked = !!i),
        l != null &&
          (t.checked = l && typeof l != "function" && typeof l != "symbol"),
        r != null &&
        typeof r != "function" &&
        typeof r != "symbol" &&
        typeof r != "boolean"
          ? (t.name = "" + ye(r))
          : t.removeAttribute("name"));
    }
    function oo(t, e, n, a, l, i, s, r) {
      if (
        (i != null &&
          typeof i != "function" &&
          typeof i != "symbol" &&
          typeof i != "boolean" &&
          (t.type = i),
        e != null || n != null)
      ) {
        if (!((i !== "submit" && i !== "reset") || e != null)) {
          _u(t);
          return;
        }
        ((n = n != null ? "" + ye(n) : ""),
          (e = e != null ? "" + ye(e) : n),
          r || e === t.value || (t.value = e),
          (t.defaultValue = e));
      }
      ((a = a ?? l),
        (a = typeof a != "function" && typeof a != "symbol" && !!a),
        (t.checked = r ? t.checked : !!a),
        (t.defaultChecked = !!a),
        s != null &&
          typeof s != "function" &&
          typeof s != "symbol" &&
          typeof s != "boolean" &&
          (t.name = s),
        _u(t));
    }
    function Ou(t, e, n) {
      (e === "number" && Wl(t.ownerDocument) === t) ||
        t.defaultValue === "" + n ||
        (t.defaultValue = "" + n);
    }
    function la(t, e, n, a) {
      if (((t = t.options), e)) {
        e = {};
        for (var l = 0; l < n.length; l++) e["$" + n[l]] = !0;
        for (n = 0; n < t.length; n++)
          ((l = e.hasOwnProperty("$" + t[n].value)),
            t[n].selected !== l && (t[n].selected = l),
            l && a && (t[n].defaultSelected = !0));
      } else {
        for (n = "" + ye(n), e = null, l = 0; l < t.length; l++) {
          if (t[l].value === n) {
            ((t[l].selected = !0), a && (t[l].defaultSelected = !0));
            return;
          }
          e !== null || t[l].disabled || (e = t[l]);
        }
        e !== null && (e.selected = !0);
      }
    }
    function fo(t, e, n) {
      if (
        e != null &&
        ((e = "" + ye(e)), e !== t.value && (t.value = e), n == null)
      ) {
        t.defaultValue !== e && (t.defaultValue = e);
        return;
      }
      t.defaultValue = n != null ? "" + ye(n) : "";
    }
    function ro(t, e, n, a) {
      if (e == null) {
        if (a != null) {
          if (n != null) throw Error(f(92));
          if (Q(a)) {
            if (1 < a.length) throw Error(f(93));
            a = a[0];
          }
          n = a;
        }
        ((n ??= ""), (e = n));
      }
      ((n = ye(e)),
        (t.defaultValue = n),
        (a = t.textContent),
        a === n && a !== "" && a !== null && (t.value = a),
        _u(t));
    }
    function ia(t, e) {
      if (e) {
        var n = t.firstChild;
        if (n && n === t.lastChild && n.nodeType === 3) {
          n.nodeValue = e;
          return;
        }
      }
      t.textContent = e;
    }
    var Ld = new Set(
      "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
        " ",
      ),
    );
    function ho(t, e, n) {
      var a = e.indexOf("--") === 0;
      n == null || typeof n == "boolean" || n === ""
        ? a
          ? t.setProperty(e, "")
          : e === "float"
            ? (t.cssFloat = "")
            : (t[e] = "")
        : a
          ? t.setProperty(e, n)
          : typeof n != "number" || n === 0 || Ld.has(e)
            ? e === "float"
              ? (t.cssFloat = n)
              : (t[e] = ("" + n).trim())
            : (t[e] = n + "px");
    }
    function yo(t, e, n) {
      if (e != null && typeof e != "object") throw Error(f(62));
      if (((t = t.style), n != null)) {
        for (var a in n)
          !n.hasOwnProperty(a) ||
            (e != null && e.hasOwnProperty(a)) ||
            (a.indexOf("--") === 0
              ? t.setProperty(a, "")
              : a === "float"
                ? (t.cssFloat = "")
                : (t[a] = ""));
        for (var l in e)
          ((a = e[l]), e.hasOwnProperty(l) && n[l] !== a && ho(t, l, a));
      } else for (var i in e) e.hasOwnProperty(i) && ho(t, i, e[i]);
    }
    function Mu(t) {
      if (t.indexOf("-") === -1) return !1;
      switch (t) {
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
    var Vd = new Map([
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
      xd =
        /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
    function Il(t) {
      return xd.test("" + t)
        ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
        : t;
    }
    function Le() {}
    var Ru = null;
    function zu(t) {
      return (
        (t = t.target || t.srcElement || window),
        t.correspondingUseElement && (t = t.correspondingUseElement),
        t.nodeType === 3 ? t.parentNode : t
      );
    }
    var ua = null,
      ca = null;
    function go(t) {
      var e = ea(t);
      if (e && (t = e.stateNode)) {
        var n = t[$t] || null;
        t: switch (((t = e.stateNode), e.type)) {
          case "input":
            if (
              (Eu(
                t,
                n.value,
                n.defaultValue,
                n.defaultValue,
                n.checked,
                n.defaultChecked,
                n.type,
                n.name,
              ),
              (e = n.name),
              n.type === "radio" && e != null)
            ) {
              for (n = t; n.parentNode; ) n = n.parentNode;
              for (
                n = n.querySelectorAll(
                  'input[name="' + ge("" + e) + '"][type="radio"]',
                ),
                  e = 0;
                e < n.length;
                e++
              ) {
                var a = n[e];
                if (a !== t && a.form === t.form) {
                  var l = a[$t] || null;
                  if (!l) throw Error(f(90));
                  Eu(
                    a,
                    l.value,
                    l.defaultValue,
                    l.defaultValue,
                    l.checked,
                    l.defaultChecked,
                    l.type,
                    l.name,
                  );
                }
              }
              for (e = 0; e < n.length; e++)
                ((a = n[e]), a.form === t.form && so(a));
            }
            break t;
          case "textarea":
            fo(t, n.value, n.defaultValue);
            break t;
          case "select":
            ((e = n.value), e != null && la(t, !!n.multiple, e, !1));
        }
      }
    }
    var Cu = !1;
    function vo(t, e, n) {
      if (Cu) return t(e, n);
      Cu = !0;
      try {
        return t(e);
      } finally {
        if (
          ((Cu = !1),
          (ua !== null || ca !== null) &&
            (Vi(), ua && ((e = ua), (t = ca), (ca = ua = null), go(e), t)))
        )
          for (e = 0; e < t.length; e++) go(t[e]);
      }
    }
    function Fa(t, e) {
      var n = t.stateNode;
      if (n === null) return null;
      var a = n[$t] || null;
      if (a === null) return null;
      n = a[e];
      t: switch (e) {
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
          ((a = !a.disabled) ||
            ((t = t.type),
            (a = !(
              t === "button" ||
              t === "input" ||
              t === "select" ||
              t === "textarea"
            ))),
            (t = !a));
          break t;
        default:
          t = !1;
      }
      if (t) return null;
      if (n && typeof n != "function") throw Error(f(231, e, typeof n));
      return n;
    }
    var Ve = !(
        typeof window > "u" ||
        typeof window.document > "u" ||
        typeof window.document.createElement > "u"
      ),
      qu = !1;
    if (Ve)
      try {
        var Wa = {};
        (Object.defineProperty(Wa, "passive", {
          get: function () {
            qu = !0;
          },
        }),
          window.addEventListener("test", Wa, Wa),
          window.removeEventListener("test", Wa, Wa));
      } catch {
        qu = !1;
      }
    var cn = null,
      Du = null,
      Pl = null;
    function mo() {
      if (Pl) return Pl;
      var t,
        e = Du,
        n = e.length,
        a,
        l = "value" in cn ? cn.value : cn.textContent,
        i = l.length;
      for (t = 0; t < n && e[t] === l[t]; t++);
      var s = n - t;
      for (a = 1; a <= s && e[n - a] === l[i - a]; a++);
      return (Pl = l.slice(t, 1 < a ? 1 - a : void 0));
    }
    function ti(t) {
      var e = t.keyCode;
      return (
        "charCode" in t
          ? ((t = t.charCode), t === 0 && e === 13 && (t = 13))
          : (t = e),
        t === 10 && (t = 13),
        32 <= t || t === 13 ? t : 0
      );
    }
    function ei() {
      return !0;
    }
    function So() {
      return !1;
    }
    function Ft(t) {
      function e(n, a, l, i, s) {
        ((this._reactName = n),
          (this._targetInst = l),
          (this.type = a),
          (this.nativeEvent = i),
          (this.target = s),
          (this.currentTarget = null));
        for (var r in t)
          t.hasOwnProperty(r) && ((n = t[r]), (this[r] = n ? n(i) : i[r]));
        return (
          (this.isDefaultPrevented = (
            i.defaultPrevented != null
              ? i.defaultPrevented
              : i.returnValue === !1
          )
            ? ei
            : So),
          (this.isPropagationStopped = So),
          this
        );
      }
      return (
        C(e.prototype, {
          preventDefault: function () {
            this.defaultPrevented = !0;
            var n = this.nativeEvent;
            n &&
              (n.preventDefault
                ? n.preventDefault()
                : typeof n.returnValue != "unknown" && (n.returnValue = !1),
              (this.isDefaultPrevented = ei));
          },
          stopPropagation: function () {
            var n = this.nativeEvent;
            n &&
              (n.stopPropagation
                ? n.stopPropagation()
                : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
              (this.isPropagationStopped = ei));
          },
          persist: function () {},
          isPersistent: ei,
        }),
        e
      );
    }
    var wn = {
        eventPhase: 0,
        bubbles: 0,
        cancelable: 0,
        timeStamp: function (t) {
          return t.timeStamp || Date.now();
        },
        defaultPrevented: 0,
        isTrusted: 0,
      },
      ni = Ft(wn),
      Ia = C({}, wn, { view: 0, detail: 0 }),
      jd = Ft(Ia),
      wu,
      Uu,
      Pa,
      ai = C({}, Ia, {
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
        getModifierState: Qu,
        button: 0,
        buttons: 0,
        relatedTarget: function (t) {
          return t.relatedTarget === void 0
            ? t.fromElement === t.srcElement
              ? t.toElement
              : t.fromElement
            : t.relatedTarget;
        },
        movementX: function (t) {
          return "movementX" in t
            ? t.movementX
            : (t !== Pa &&
                (Pa && t.type === "mousemove"
                  ? ((wu = t.screenX - Pa.screenX),
                    (Uu = t.screenY - Pa.screenY))
                  : (Uu = wu = 0),
                (Pa = t)),
              wu);
        },
        movementY: function (t) {
          return "movementY" in t ? t.movementY : Uu;
        },
      }),
      po = Ft(ai),
      Yd = Ft(C({}, ai, { dataTransfer: 0 })),
      Nu = Ft(C({}, Ia, { relatedTarget: 0 })),
      Gd = Ft(
        C({}, wn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
      ),
      Xd = Ft(
        C({}, wn, {
          clipboardData: function (t) {
            return "clipboardData" in t
              ? t.clipboardData
              : window.clipboardData;
          },
        }),
      ),
      bo = Ft(C({}, wn, { data: 0 })),
      Zd = {
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
      kd = {
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
      Kd = {
        Alt: "altKey",
        Control: "ctrlKey",
        Meta: "metaKey",
        Shift: "shiftKey",
      };
    function Jd(t) {
      var e = this.nativeEvent;
      return e.getModifierState
        ? e.getModifierState(t)
        : (t = Kd[t])
          ? !!e[t]
          : !1;
    }
    function Qu() {
      return Jd;
    }
    var $d = Ft(
        C({}, Ia, {
          key: function (t) {
            if (t.key) {
              var e = Zd[t.key] || t.key;
              if (e !== "Unidentified") return e;
            }
            return t.type === "keypress"
              ? ((t = ti(t)), t === 13 ? "Enter" : String.fromCharCode(t))
              : t.type === "keydown" || t.type === "keyup"
                ? kd[t.keyCode] || "Unidentified"
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
          getModifierState: Qu,
          charCode: function (t) {
            return t.type === "keypress" ? ti(t) : 0;
          },
          keyCode: function (t) {
            return t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
          },
          which: function (t) {
            return t.type === "keypress"
              ? ti(t)
              : t.type === "keydown" || t.type === "keyup"
                ? t.keyCode
                : 0;
          },
        }),
      ),
      To = Ft(
        C({}, ai, {
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
      Fd = Ft(
        C({}, Ia, {
          touches: 0,
          targetTouches: 0,
          changedTouches: 0,
          altKey: 0,
          metaKey: 0,
          ctrlKey: 0,
          shiftKey: 0,
          getModifierState: Qu,
        }),
      ),
      Wd = Ft(C({}, wn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 })),
      Id = Ft(
        C({}, ai, {
          deltaX: function (t) {
            return "deltaX" in t
              ? t.deltaX
              : "wheelDeltaX" in t
                ? -t.wheelDeltaX
                : 0;
          },
          deltaY: function (t) {
            return "deltaY" in t
              ? t.deltaY
              : "wheelDeltaY" in t
                ? -t.wheelDeltaY
                : "wheelDelta" in t
                  ? -t.wheelDelta
                  : 0;
          },
          deltaZ: 0,
          deltaMode: 0,
        }),
      ),
      Pd = Ft(C({}, wn, { newState: 0, oldState: 0 })),
      ty = [9, 13, 27, 32],
      Bu = Ve && "CompositionEvent" in window,
      tl = null;
    Ve && "documentMode" in document && (tl = document.documentMode);
    var ey = Ve && "TextEvent" in window && !tl,
      Ao = Ve && (!Bu || (tl && 8 < tl && 11 >= tl)),
      _o = " ",
      Eo = !1;
    function Oo(t, e) {
      switch (t) {
        case "keyup":
          return ty.indexOf(e.keyCode) !== -1;
        case "keydown":
          return e.keyCode !== 229;
        case "keypress":
        case "mousedown":
        case "focusout":
          return !0;
        default:
          return !1;
      }
    }
    function Mo(t) {
      return (
        (t = t.detail),
        typeof t == "object" && "data" in t ? t.data : null
      );
    }
    var sa = !1;
    function ny(t, e) {
      switch (t) {
        case "compositionend":
          return Mo(e);
        case "keypress":
          return e.which !== 32 ? null : ((Eo = !0), _o);
        case "textInput":
          return ((t = e.data), t === _o && Eo ? null : t);
        default:
          return null;
      }
    }
    function ay(t, e) {
      if (sa)
        return t === "compositionend" || (!Bu && Oo(t, e))
          ? ((t = mo()), (Pl = Du = cn = null), (sa = !1), t)
          : null;
      switch (t) {
        case "paste":
          return null;
        case "keypress":
          if (
            !(e.ctrlKey || e.altKey || e.metaKey) ||
            (e.ctrlKey && e.altKey)
          ) {
            if (e.char && 1 < e.char.length) return e.char;
            if (e.which) return String.fromCharCode(e.which);
          }
          return null;
        case "compositionend":
          return Ao && e.locale !== "ko" ? null : e.data;
        default:
          return null;
      }
    }
    var ly = {
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
    function Ro(t) {
      var e = t && t.nodeName && t.nodeName.toLowerCase();
      return e === "input" ? !!ly[t.type] : e === "textarea";
    }
    function zo(t, e, n, a) {
      (ua ? (ca ? ca.push(a) : (ca = [a])) : (ua = a),
        (e = ki(e, "onChange")),
        0 < e.length &&
          ((n = new ni("onChange", "change", null, n, a)),
          t.push({ event: n, listeners: e })));
    }
    var el = null,
      nl = null;
    function iy(t) {
      sh(t, 0);
    }
    function li(t) {
      if (so($a(t))) return t;
    }
    function Co(t, e) {
      if (t === "change") return e;
    }
    var qo = !1;
    if (Ve) {
      var Hu;
      if (Ve) {
        var Lu = "oninput" in document;
        if (!Lu) {
          var Do = document.createElement("div");
          (Do.setAttribute("oninput", "return;"),
            (Lu = typeof Do.oninput == "function"));
        }
        Hu = Lu;
      } else Hu = !1;
      qo = Hu && (!document.documentMode || 9 < document.documentMode);
    }
    function wo() {
      el && (el.detachEvent("onpropertychange", Uo), (nl = el = null));
    }
    function Uo(t) {
      if (t.propertyName === "value" && li(nl)) {
        var e = [];
        (zo(e, nl, t, zu(t)), vo(iy, e));
      }
    }
    function uy(t, e, n) {
      t === "focusin"
        ? (wo(), (el = e), (nl = n), el.attachEvent("onpropertychange", Uo))
        : t === "focusout" && wo();
    }
    function cy(t) {
      if (t === "selectionchange" || t === "keyup" || t === "keydown")
        return li(nl);
    }
    function sy(t, e) {
      if (t === "click") return li(e);
    }
    function oy(t, e) {
      if (t === "input" || t === "change") return li(e);
    }
    function fy(t, e) {
      return (t === e && (t !== 0 || 1 / t === 1 / e)) || (t !== t && e !== e);
    }
    var ce = typeof Object.is == "function" ? Object.is : fy;
    function al(t, e) {
      if (ce(t, e)) return !0;
      if (
        typeof t != "object" ||
        t === null ||
        typeof e != "object" ||
        e === null
      )
        return !1;
      var n = Object.keys(t),
        a = Object.keys(e);
      if (n.length !== a.length) return !1;
      for (a = 0; a < n.length; a++) {
        var l = n[a];
        if (!vu.call(e, l) || !ce(t[l], e[l])) return !1;
      }
      return !0;
    }
    function No(t) {
      for (; t && t.firstChild; ) t = t.firstChild;
      return t;
    }
    function Qo(t, e) {
      var n = No(t);
      t = 0;
      for (var a; n; ) {
        if (n.nodeType === 3) {
          if (((a = t + n.textContent.length), t <= e && a >= e))
            return { node: n, offset: e - t };
          t = a;
        }
        t: {
          for (; n; ) {
            if (n.nextSibling) {
              n = n.nextSibling;
              break t;
            }
            n = n.parentNode;
          }
          n = void 0;
        }
        n = No(n);
      }
    }
    function Bo(t, e) {
      return t && e
        ? t === e
          ? !0
          : t && t.nodeType === 3
            ? !1
            : e && e.nodeType === 3
              ? Bo(t, e.parentNode)
              : "contains" in t
                ? t.contains(e)
                : t.compareDocumentPosition
                  ? !!(t.compareDocumentPosition(e) & 16)
                  : !1
        : !1;
    }
    function Ho(t) {
      t =
        t != null &&
        t.ownerDocument != null &&
        t.ownerDocument.defaultView != null
          ? t.ownerDocument.defaultView
          : window;
      for (var e = Wl(t.document); e instanceof t.HTMLIFrameElement; ) {
        try {
          var n = typeof e.contentWindow.location.href == "string";
        } catch {
          n = !1;
        }
        if (n) t = e.contentWindow;
        else break;
        e = Wl(t.document);
      }
      return e;
    }
    function Vu(t) {
      var e = t && t.nodeName && t.nodeName.toLowerCase();
      return (
        e &&
        ((e === "input" &&
          (t.type === "text" ||
            t.type === "search" ||
            t.type === "tel" ||
            t.type === "url" ||
            t.type === "password")) ||
          e === "textarea" ||
          t.contentEditable === "true")
      );
    }
    var ry = Ve && "documentMode" in document && 11 >= document.documentMode,
      oa = null,
      xu = null,
      ll = null,
      ju = !1;
    function Lo(t, e, n) {
      var a =
        n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
      ju ||
        oa == null ||
        oa !== Wl(a) ||
        ((a = oa),
        "selectionStart" in a && Vu(a)
          ? (a = { start: a.selectionStart, end: a.selectionEnd })
          : ((a = (
              (a.ownerDocument && a.ownerDocument.defaultView) ||
              window
            ).getSelection()),
            (a = {
              anchorNode: a.anchorNode,
              anchorOffset: a.anchorOffset,
              focusNode: a.focusNode,
              focusOffset: a.focusOffset,
            })),
        (ll && al(ll, a)) ||
          ((ll = a),
          (a = ki(xu, "onSelect")),
          0 < a.length &&
            ((e = new ni("onSelect", "select", null, e, n)),
            t.push({ event: e, listeners: a }),
            (e.target = oa))));
    }
    function Un(t, e) {
      var n = {};
      return (
        (n[t.toLowerCase()] = e.toLowerCase()),
        (n["Webkit" + t] = "webkit" + e),
        (n["Moz" + t] = "moz" + e),
        n
      );
    }
    var fa = {
        animationend: Un("Animation", "AnimationEnd"),
        animationiteration: Un("Animation", "AnimationIteration"),
        animationstart: Un("Animation", "AnimationStart"),
        transitionrun: Un("Transition", "TransitionRun"),
        transitionstart: Un("Transition", "TransitionStart"),
        transitioncancel: Un("Transition", "TransitionCancel"),
        transitionend: Un("Transition", "TransitionEnd"),
      },
      Yu = {},
      Vo = {};
    Ve &&
      ((Vo = document.createElement("div").style),
      "AnimationEvent" in window ||
        (delete fa.animationend.animation,
        delete fa.animationiteration.animation,
        delete fa.animationstart.animation),
      "TransitionEvent" in window || delete fa.transitionend.transition);
    function Nn(t) {
      if (Yu[t]) return Yu[t];
      if (!fa[t]) return t;
      var e = fa[t],
        n;
      for (n in e) if (e.hasOwnProperty(n) && n in Vo) return (Yu[t] = e[n]);
      return t;
    }
    var xo = Nn("animationend"),
      jo = Nn("animationiteration"),
      Yo = Nn("animationstart"),
      hy = Nn("transitionrun"),
      dy = Nn("transitionstart"),
      yy = Nn("transitioncancel"),
      Go = Nn("transitionend"),
      Xo = new Map(),
      Gu =
        "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
          " ",
        );
    Gu.push("scrollEnd");
    function ze(t, e) {
      (Xo.set(t, e), Dn(e, [t]));
    }
    var ii =
        typeof reportError == "function"
          ? reportError
          : function (t) {
              if (
                typeof window == "object" &&
                typeof window.ErrorEvent == "function"
              ) {
                var e = new window.ErrorEvent("error", {
                  bubbles: !0,
                  cancelable: !0,
                  message:
                    typeof t == "object" &&
                    t !== null &&
                    typeof t.message == "string"
                      ? String(t.message)
                      : String(t),
                  error: t,
                });
                if (!window.dispatchEvent(e)) return;
              } else if (
                typeof process == "object" &&
                typeof process.emit == "function"
              ) {
                process.emit("uncaughtException", t);
                return;
              }
              console.error(t);
            },
      ve = [],
      ra = 0,
      Xu = 0;
    function ui() {
      for (var t = ra, e = (Xu = ra = 0); e < t; ) {
        var n = ve[e];
        ve[e++] = null;
        var a = ve[e];
        ve[e++] = null;
        var l = ve[e];
        ve[e++] = null;
        var i = ve[e];
        if (((ve[e++] = null), a !== null && l !== null)) {
          var s = a.pending;
          (s === null ? (l.next = l) : ((l.next = s.next), (s.next = l)),
            (a.pending = l));
        }
        i !== 0 && Zo(n, l, i);
      }
    }
    function ci(t, e, n, a) {
      ((ve[ra++] = t),
        (ve[ra++] = e),
        (ve[ra++] = n),
        (ve[ra++] = a),
        (Xu |= a),
        (t.lanes |= a),
        (t = t.alternate),
        t !== null && (t.lanes |= a));
    }
    function Zu(t, e, n, a) {
      return (ci(t, e, n, a), si(t));
    }
    function Qn(t, e) {
      return (ci(t, null, null, e), si(t));
    }
    function Zo(t, e, n) {
      t.lanes |= n;
      var a = t.alternate;
      a !== null && (a.lanes |= n);
      for (var l = !1, i = t.return; i !== null; )
        ((i.childLanes |= n),
          (a = i.alternate),
          a !== null && (a.childLanes |= n),
          i.tag === 22 &&
            ((t = i.stateNode), t === null || t._visibility & 1 || (l = !0)),
          (t = i),
          (i = i.return));
      return t.tag === 3
        ? ((i = t.stateNode),
          l &&
            e !== null &&
            ((l = 31 - ue(n)),
            (t = i.hiddenUpdates),
            (a = t[l]),
            a === null ? (t[l] = [e]) : a.push(e),
            (e.lane = n | 536870912)),
          i)
        : null;
    }
    function si(t) {
      if (50 < Ml) throw ((Ml = 0), (ts = null), Error(f(185)));
      for (var e = t.return; e !== null; ) ((t = e), (e = t.return));
      return t.tag === 3 ? t.stateNode : null;
    }
    var ha = {};
    function gy(t, e, n, a) {
      ((this.tag = t),
        (this.key = n),
        (this.sibling =
          this.child =
          this.return =
          this.stateNode =
          this.type =
          this.elementType =
            null),
        (this.index = 0),
        (this.refCleanup = this.ref = null),
        (this.pendingProps = e),
        (this.dependencies =
          this.memoizedState =
          this.updateQueue =
          this.memoizedProps =
            null),
        (this.mode = a),
        (this.subtreeFlags = this.flags = 0),
        (this.deletions = null),
        (this.childLanes = this.lanes = 0),
        (this.alternate = null));
    }
    function se(t, e, n, a) {
      return new gy(t, e, n, a);
    }
    function ku(t) {
      return ((t = t.prototype), !(!t || !t.isReactComponent));
    }
    function xe(t, e) {
      var n = t.alternate;
      return (
        n === null
          ? ((n = se(t.tag, e, t.key, t.mode)),
            (n.elementType = t.elementType),
            (n.type = t.type),
            (n.stateNode = t.stateNode),
            (n.alternate = t),
            (t.alternate = n))
          : ((n.pendingProps = e),
            (n.type = t.type),
            (n.flags = 0),
            (n.subtreeFlags = 0),
            (n.deletions = null)),
        (n.flags = t.flags & 65011712),
        (n.childLanes = t.childLanes),
        (n.lanes = t.lanes),
        (n.child = t.child),
        (n.memoizedProps = t.memoizedProps),
        (n.memoizedState = t.memoizedState),
        (n.updateQueue = t.updateQueue),
        (e = t.dependencies),
        (n.dependencies =
          e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }),
        (n.sibling = t.sibling),
        (n.index = t.index),
        (n.ref = t.ref),
        (n.refCleanup = t.refCleanup),
        n
      );
    }
    function ko(t, e) {
      t.flags &= 65011714;
      var n = t.alternate;
      return (
        n === null
          ? ((t.childLanes = 0),
            (t.lanes = e),
            (t.child = null),
            (t.subtreeFlags = 0),
            (t.memoizedProps = null),
            (t.memoizedState = null),
            (t.updateQueue = null),
            (t.dependencies = null),
            (t.stateNode = null))
          : ((t.childLanes = n.childLanes),
            (t.lanes = n.lanes),
            (t.child = n.child),
            (t.subtreeFlags = 0),
            (t.deletions = null),
            (t.memoizedProps = n.memoizedProps),
            (t.memoizedState = n.memoizedState),
            (t.updateQueue = n.updateQueue),
            (t.type = n.type),
            (e = n.dependencies),
            (t.dependencies =
              e === null
                ? null
                : { lanes: e.lanes, firstContext: e.firstContext })),
        t
      );
    }
    function oi(t, e, n, a, l, i) {
      var s = 0;
      if (((a = t), typeof t == "function")) ku(t) && (s = 1);
      else if (typeof t == "string")
        s = Tg(t, n, L.current)
          ? 26
          : t === "html" || t === "head" || t === "body"
            ? 27
            : 5;
      else
        t: switch (t) {
          case j:
            return (
              (t = se(31, n, e, l)),
              (t.elementType = j),
              (t.lanes = i),
              t
            );
          case kt:
            return Bn(n.children, l, i, e);
          case Me:
            ((s = 8), (l |= 24));
            break;
          case Vt:
            return (
              (t = se(12, n, e, l | 2)),
              (t.elementType = Vt),
              (t.lanes = i),
              t
            );
          case at:
            return (
              (t = se(13, n, e, l)),
              (t.elementType = at),
              (t.lanes = i),
              t
            );
          case yt:
            return (
              (t = se(19, n, e, l)),
              (t.elementType = yt),
              (t.lanes = i),
              t
            );
          default:
            if (typeof t == "object" && t !== null)
              switch (t.$$typeof) {
                case tt:
                  s = 10;
                  break t;
                case ct:
                  s = 9;
                  break t;
                case mt:
                  s = 11;
                  break t;
                case X:
                  s = 14;
                  break t;
                case gt:
                  ((s = 16), (a = null));
                  break t;
              }
            ((s = 29),
              (n = Error(f(130, t === null ? "null" : typeof t, ""))),
              (a = null));
        }
      return (
        (e = se(s, n, e, l)),
        (e.elementType = t),
        (e.type = a),
        (e.lanes = i),
        e
      );
    }
    function Bn(t, e, n, a) {
      return ((t = se(7, t, a, e)), (t.lanes = n), t);
    }
    function Ku(t, e, n) {
      return ((t = se(6, t, null, e)), (t.lanes = n), t);
    }
    function Ko(t) {
      var e = se(18, null, null, 0);
      return ((e.stateNode = t), e);
    }
    function Ju(t, e, n) {
      return (
        (e = se(4, t.children !== null ? t.children : [], t.key, e)),
        (e.lanes = n),
        (e.stateNode = {
          containerInfo: t.containerInfo,
          pendingChildren: null,
          implementation: t.implementation,
        }),
        e
      );
    }
    var Jo = new WeakMap();
    function me(t, e) {
      if (typeof t == "object" && t !== null) {
        var n = Jo.get(t);
        return n !== void 0
          ? n
          : ((e = { value: t, source: e, stack: Zs(e) }), Jo.set(t, e), e);
      }
      return { value: t, source: e, stack: Zs(e) };
    }
    var da = [],
      ya = 0,
      fi = null,
      il = 0,
      Se = [],
      pe = 0,
      sn = null,
      De = 1,
      we = "";
    function je(t, e) {
      ((da[ya++] = il), (da[ya++] = fi), (fi = t), (il = e));
    }
    function $o(t, e, n) {
      ((Se[pe++] = De), (Se[pe++] = we), (Se[pe++] = sn), (sn = t));
      var a = De;
      t = we;
      var l = 32 - ue(a) - 1;
      ((a &= ~(1 << l)), (n += 1));
      var i = 32 - ue(e) + l;
      if (30 < i) {
        var s = l - (l % 5);
        ((i = (a & ((1 << s) - 1)).toString(32)),
          (a >>= s),
          (l -= s),
          (De = (1 << (32 - ue(e) + l)) | (n << l) | a),
          (we = i + t));
      } else ((De = (1 << i) | (n << l) | a), (we = t));
    }
    function $u(t) {
      t.return !== null && (je(t, 1), $o(t, 1, 0));
    }
    function Fu(t) {
      for (; t === fi; )
        ((fi = da[--ya]), (da[ya] = null), (il = da[--ya]), (da[ya] = null));
      for (; t === sn; )
        ((sn = Se[--pe]),
          (Se[pe] = null),
          (we = Se[--pe]),
          (Se[pe] = null),
          (De = Se[--pe]),
          (Se[pe] = null));
    }
    function Fo(t, e) {
      ((Se[pe++] = De),
        (Se[pe++] = we),
        (Se[pe++] = sn),
        (De = e.id),
        (we = e.overflow),
        (sn = t));
    }
    var Yt = null,
      pt = null,
      P = !1,
      on = null,
      be = !1,
      Wu = Error(f(519));
    function fn(t) {
      throw (
        ul(
          me(
            Error(
              f(
                418,
                1 < arguments.length && arguments[1] !== void 0 && arguments[1]
                  ? "text"
                  : "HTML",
                "",
              ),
            ),
            t,
          ),
        ),
        Wu
      );
    }
    function Wo(t) {
      var e = t.stateNode,
        n = t.type,
        a = t.memoizedProps;
      switch (((e[jt] = t), (e[$t] = a), n)) {
        case "dialog":
          (F("cancel", e), F("close", e));
          break;
        case "iframe":
        case "object":
        case "embed":
          F("load", e);
          break;
        case "video":
        case "audio":
          for (n = 0; n < zl.length; n++) F(zl[n], e);
          break;
        case "source":
          F("error", e);
          break;
        case "img":
        case "image":
        case "link":
          (F("error", e), F("load", e));
          break;
        case "details":
          F("toggle", e);
          break;
        case "input":
          (F("invalid", e),
            oo(
              e,
              a.value,
              a.defaultValue,
              a.checked,
              a.defaultChecked,
              a.type,
              a.name,
              !0,
            ));
          break;
        case "select":
          F("invalid", e);
          break;
        case "textarea":
          (F("invalid", e), ro(e, a.value, a.defaultValue, a.children));
      }
      ((n = a.children),
        (typeof n != "string" &&
          typeof n != "number" &&
          typeof n != "bigint") ||
        e.textContent === "" + n ||
        a.suppressHydrationWarning === !0 ||
        dh(e.textContent, n)
          ? (a.popover != null && (F("beforetoggle", e), F("toggle", e)),
            a.onScroll != null && F("scroll", e),
            a.onScrollEnd != null && F("scrollend", e),
            a.onClick != null && (e.onclick = Le),
            (e = !0))
          : (e = !1),
        e || fn(t, !0));
    }
    function Io(t) {
      for (Yt = t.return; Yt; )
        switch (Yt.tag) {
          case 5:
          case 31:
          case 13:
            be = !1;
            return;
          case 27:
          case 3:
            be = !0;
            return;
          default:
            Yt = Yt.return;
        }
    }
    function ga(t) {
      if (t !== Yt) return !1;
      if (!P) return (Io(t), (P = !0), !1);
      var e = t.tag,
        n;
      if (
        ((n = e !== 3 && e !== 27) &&
          ((n = e === 5) &&
            ((n = t.type),
            (n =
              !(n !== "form" && n !== "button") ||
              ys(t.type, t.memoizedProps))),
          (n = !n)),
        n && pt && fn(t),
        Io(t),
        e === 13)
      ) {
        if (((t = t.memoizedState), (t = t !== null ? t.dehydrated : null), !t))
          throw Error(f(317));
        pt = Ah(t);
      } else if (e === 31) {
        if (((t = t.memoizedState), (t = t !== null ? t.dehydrated : null), !t))
          throw Error(f(317));
        pt = Ah(t);
      } else
        e === 27
          ? ((e = pt),
            An(t.type) ? ((t = ps), (ps = null), (pt = t)) : (pt = e))
          : (pt = Yt ? _e(t.stateNode.nextSibling) : null);
      return !0;
    }
    function Hn() {
      ((pt = Yt = null), (P = !1));
    }
    function Iu() {
      var t = on;
      return (
        t !== null &&
          (te === null ? (te = t) : te.push.apply(te, t), (on = null)),
        t
      );
    }
    function ul(t) {
      on === null ? (on = [t]) : on.push(t);
    }
    var Pu = g(null),
      Ln = null,
      Ye = null;
    function rn(t, e, n) {
      (w(Pu, e._currentValue), (e._currentValue = n));
    }
    function Ge(t) {
      ((t._currentValue = Pu.current), R(Pu));
    }
    function tc(t, e, n) {
      for (; t !== null; ) {
        var a = t.alternate;
        if (
          ((t.childLanes & e) !== e
            ? ((t.childLanes |= e), a !== null && (a.childLanes |= e))
            : a !== null && (a.childLanes & e) !== e && (a.childLanes |= e),
          t === n)
        )
          break;
        t = t.return;
      }
    }
    function ec(t, e, n, a) {
      var l = t.child;
      for (l !== null && (l.return = t); l !== null; ) {
        var i = l.dependencies;
        if (i !== null) {
          var s = l.child;
          i = i.firstContext;
          t: for (; i !== null; ) {
            var r = i;
            i = l;
            for (var d = 0; d < e.length; d++)
              if (r.context === e[d]) {
                ((i.lanes |= n),
                  (r = i.alternate),
                  r !== null && (r.lanes |= n),
                  tc(i.return, n, t),
                  a || (s = null));
                break t;
              }
            i = r.next;
          }
        } else if (l.tag === 18) {
          if (((s = l.return), s === null)) throw Error(f(341));
          ((s.lanes |= n),
            (i = s.alternate),
            i !== null && (i.lanes |= n),
            tc(s, n, t),
            (s = null));
        } else s = l.child;
        if (s !== null) s.return = l;
        else
          for (s = l; s !== null; ) {
            if (s === t) {
              s = null;
              break;
            }
            if (((l = s.sibling), l !== null)) {
              ((l.return = s.return), (s = l));
              break;
            }
            s = s.return;
          }
        l = s;
      }
    }
    function va(t, e, n, a) {
      t = null;
      for (var l = e, i = !1; l !== null; ) {
        if (!i) {
          if ((l.flags & 524288) !== 0) i = !0;
          else if ((l.flags & 262144) !== 0) break;
        }
        if (l.tag === 10) {
          var s = l.alternate;
          if (s === null) throw Error(f(387));
          if (((s = s.memoizedProps), s !== null)) {
            var r = l.type;
            ce(l.pendingProps.value, s.value) ||
              (t !== null ? t.push(r) : (t = [r]));
          }
        } else if (l === ut.current) {
          if (((s = l.alternate), s === null)) throw Error(f(387));
          s.memoizedState.memoizedState !== l.memoizedState.memoizedState &&
            (t !== null ? t.push(Ul) : (t = [Ul]));
        }
        l = l.return;
      }
      (t !== null && ec(e, t, n, a), (e.flags |= 262144));
    }
    function ri(t) {
      for (t = t.firstContext; t !== null; ) {
        if (!ce(t.context._currentValue, t.memoizedValue)) return !0;
        t = t.next;
      }
      return !1;
    }
    function Vn(t) {
      ((Ln = t),
        (Ye = null),
        (t = t.dependencies),
        t !== null && (t.firstContext = null));
    }
    function Gt(t) {
      return Po(Ln, t);
    }
    function hi(t, e) {
      return (Ln === null && Vn(t), Po(t, e));
    }
    function Po(t, e) {
      var n = e._currentValue;
      if (((e = { context: e, memoizedValue: n, next: null }), Ye === null)) {
        if (t === null) throw Error(f(308));
        ((Ye = e),
          (t.dependencies = { lanes: 0, firstContext: e }),
          (t.flags |= 524288));
      } else Ye = Ye.next = e;
      return n;
    }
    var vy =
        typeof AbortController < "u"
          ? AbortController
          : function () {
              var t = [],
                e = (this.signal = {
                  aborted: !1,
                  addEventListener: function (n, a) {
                    t.push(a);
                  },
                });
              this.abort = function () {
                ((e.aborted = !0),
                  t.forEach(function (n) {
                    return n();
                  }));
              };
            },
      my = c.unstable_scheduleCallback,
      Sy = c.unstable_NormalPriority,
      qt = {
        $$typeof: tt,
        Consumer: null,
        Provider: null,
        _currentValue: null,
        _currentValue2: null,
        _threadCount: 0,
      };
    function nc() {
      return { controller: new vy(), data: new Map(), refCount: 0 };
    }
    function cl(t) {
      (t.refCount--,
        t.refCount === 0 &&
          my(Sy, function () {
            t.controller.abort();
          }));
    }
    var sl = null,
      ac = 0,
      ma = 0,
      Sa = null;
    function py(t, e) {
      if (sl === null) {
        var n = (sl = []);
        ((ac = 0),
          (ma = us()),
          (Sa = {
            status: "pending",
            value: void 0,
            then: function (a) {
              n.push(a);
            },
          }));
      }
      return (ac++, e.then(tf, tf), e);
    }
    function tf() {
      if (--ac === 0 && sl !== null) {
        Sa !== null && (Sa.status = "fulfilled");
        var t = sl;
        ((sl = null), (ma = 0), (Sa = null));
        for (var e = 0; e < t.length; e++) (0, t[e])();
      }
    }
    function by(t, e) {
      var n = [],
        a = {
          status: "pending",
          value: null,
          reason: null,
          then: function (l) {
            n.push(l);
          },
        };
      return (
        t.then(
          function () {
            ((a.status = "fulfilled"), (a.value = e));
            for (var l = 0; l < n.length; l++) (0, n[l])(e);
          },
          function (l) {
            for (a.status = "rejected", a.reason = l, l = 0; l < n.length; l++)
              (0, n[l])(void 0);
          },
        ),
        a
      );
    }
    var ef = q.S;
    q.S = function (t, e) {
      ((Br = le()),
        typeof e == "object" &&
          e !== null &&
          typeof e.then == "function" &&
          py(t, e),
        ef !== null && ef(t, e));
    };
    var xn = g(null);
    function lc() {
      var t = xn.current;
      return t !== null ? t : vt.pooledCache;
    }
    function di(t, e) {
      e === null ? w(xn, xn.current) : w(xn, e.pool);
    }
    function nf() {
      var t = lc();
      return t === null ? null : { parent: qt._currentValue, pool: t };
    }
    var pa = Error(f(460)),
      ic = Error(f(474)),
      yi = Error(f(542)),
      gi = { then: function () {} };
    function af(t) {
      return ((t = t.status), t === "fulfilled" || t === "rejected");
    }
    function lf(t, e, n) {
      switch (
        ((n = t[n]),
        n === void 0 ? t.push(e) : n !== e && (e.then(Le, Le), (e = n)),
        e.status)
      ) {
        case "fulfilled":
          return e.value;
        case "rejected":
          throw ((t = e.reason), cf(t), t);
        default:
          if (typeof e.status == "string") e.then(Le, Le);
          else {
            if (((t = vt), t !== null && 100 < t.shellSuspendCounter))
              throw Error(f(482));
            ((t = e),
              (t.status = "pending"),
              t.then(
                function (a) {
                  if (e.status === "pending") {
                    var l = e;
                    ((l.status = "fulfilled"), (l.value = a));
                  }
                },
                function (a) {
                  if (e.status === "pending") {
                    var l = e;
                    ((l.status = "rejected"), (l.reason = a));
                  }
                },
              ));
          }
          switch (e.status) {
            case "fulfilled":
              return e.value;
            case "rejected":
              throw ((t = e.reason), cf(t), t);
          }
          throw ((Yn = e), pa);
      }
    }
    function jn(t) {
      try {
        var e = t._init;
        return e(t._payload);
      } catch (n) {
        throw n !== null && typeof n == "object" && typeof n.then == "function"
          ? ((Yn = n), pa)
          : n;
      }
    }
    var Yn = null;
    function uf() {
      if (Yn === null) throw Error(f(459));
      var t = Yn;
      return ((Yn = null), t);
    }
    function cf(t) {
      if (t === pa || t === yi) throw Error(f(483));
    }
    var ba = null,
      ol = 0;
    function vi(t) {
      var e = ol;
      return ((ol += 1), ba === null && (ba = []), lf(ba, t, e));
    }
    function fl(t, e) {
      ((e = e.props.ref), (t.ref = e !== void 0 ? e : null));
    }
    function mi(t, e) {
      throw e.$$typeof === k
        ? Error(f(525))
        : ((t = Object.prototype.toString.call(e)),
          Error(
            f(
              31,
              t === "[object Object]"
                ? "object with keys {" + Object.keys(e).join(", ") + "}"
                : t,
            ),
          ));
    }
    function sf(t) {
      function e(v, y) {
        if (t) {
          var S = v.deletions;
          S === null ? ((v.deletions = [y]), (v.flags |= 16)) : S.push(y);
        }
      }
      function n(v, y) {
        if (!t) return null;
        for (; y !== null; ) (e(v, y), (y = y.sibling));
        return null;
      }
      function a(v) {
        for (var y = new Map(); v !== null; )
          (v.key !== null ? y.set(v.key, v) : y.set(v.index, v),
            (v = v.sibling));
        return y;
      }
      function l(v, y) {
        return ((v = xe(v, y)), (v.index = 0), (v.sibling = null), v);
      }
      function i(v, y, S) {
        return (
          (v.index = S),
          t
            ? ((S = v.alternate),
              S !== null
                ? ((S = S.index), S < y ? ((v.flags |= 67108866), y) : S)
                : ((v.flags |= 67108866), y))
            : ((v.flags |= 1048576), y)
        );
      }
      function s(v) {
        return (t && v.alternate === null && (v.flags |= 67108866), v);
      }
      function r(v, y, S, E) {
        return y === null || y.tag !== 6
          ? ((y = Ku(S, v.mode, E)), (y.return = v), y)
          : ((y = l(y, S)), (y.return = v), y);
      }
      function d(v, y, S, E) {
        var x = S.type;
        return x === kt
          ? _(v, y, S.props.children, E, S.key)
          : y !== null &&
              (y.elementType === x ||
                (typeof x == "object" &&
                  x !== null &&
                  x.$$typeof === gt &&
                  jn(x) === y.type))
            ? ((y = l(y, S.props)), fl(y, S), (y.return = v), y)
            : ((y = oi(S.type, S.key, S.props, null, v.mode, E)),
              fl(y, S),
              (y.return = v),
              y);
      }
      function p(v, y, S, E) {
        return y === null ||
          y.tag !== 4 ||
          y.stateNode.containerInfo !== S.containerInfo ||
          y.stateNode.implementation !== S.implementation
          ? ((y = Ju(S, v.mode, E)), (y.return = v), y)
          : ((y = l(y, S.children || [])), (y.return = v), y);
      }
      function _(v, y, S, E, x) {
        return y === null || y.tag !== 7
          ? ((y = Bn(S, v.mode, E, x)), (y.return = v), y)
          : ((y = l(y, S)), (y.return = v), y);
      }
      function M(v, y, S) {
        if (
          (typeof y == "string" && y !== "") ||
          typeof y == "number" ||
          typeof y == "bigint"
        )
          return ((y = Ku("" + y, v.mode, S)), (y.return = v), y);
        if (typeof y == "object" && y !== null) {
          switch (y.$$typeof) {
            case At:
              return (
                (S = oi(y.type, y.key, y.props, null, v.mode, S)),
                fl(S, y),
                (S.return = v),
                S
              );
            case zt:
              return ((y = Ju(y, v.mode, S)), (y.return = v), y);
            case gt:
              return ((y = jn(y)), M(v, y, S));
          }
          if (Q(y) || xt(y))
            return ((y = Bn(y, v.mode, S, null)), (y.return = v), y);
          if (typeof y.then == "function") return M(v, vi(y), S);
          if (y.$$typeof === tt) return M(v, hi(v, y), S);
          mi(v, y);
        }
        return null;
      }
      function b(v, y, S, E) {
        var x = y !== null ? y.key : null;
        if (
          (typeof S == "string" && S !== "") ||
          typeof S == "number" ||
          typeof S == "bigint"
        )
          return x !== null ? null : r(v, y, "" + S, E);
        if (typeof S == "object" && S !== null) {
          switch (S.$$typeof) {
            case At:
              return S.key === x ? d(v, y, S, E) : null;
            case zt:
              return S.key === x ? p(v, y, S, E) : null;
            case gt:
              return ((S = jn(S)), b(v, y, S, E));
          }
          if (Q(S) || xt(S)) return x !== null ? null : _(v, y, S, E, null);
          if (typeof S.then == "function") return b(v, y, vi(S), E);
          if (S.$$typeof === tt) return b(v, y, hi(v, S), E);
          mi(v, S);
        }
        return null;
      }
      function T(v, y, S, E, x) {
        if (
          (typeof E == "string" && E !== "") ||
          typeof E == "number" ||
          typeof E == "bigint"
        )
          return ((v = v.get(S) || null), r(y, v, "" + E, x));
        if (typeof E == "object" && E !== null) {
          switch (E.$$typeof) {
            case At:
              return (
                (v = v.get(E.key === null ? S : E.key) || null),
                d(y, v, E, x)
              );
            case zt:
              return (
                (v = v.get(E.key === null ? S : E.key) || null),
                p(y, v, E, x)
              );
            case gt:
              return ((E = jn(E)), T(v, y, S, E, x));
          }
          if (Q(E) || xt(E))
            return ((v = v.get(S) || null), _(y, v, E, x, null));
          if (typeof E.then == "function") return T(v, y, S, vi(E), x);
          if (E.$$typeof === tt) return T(v, y, S, hi(y, E), x);
          mi(y, E);
        }
        return null;
      }
      function B(v, y, S, E) {
        for (
          var x = null, et = null, H = y, Z = (y = 0), I = null;
          H !== null && Z < S.length;
          Z++
        ) {
          H.index > Z ? ((I = H), (H = null)) : (I = H.sibling);
          var nt = b(v, H, S[Z], E);
          if (nt === null) {
            H === null && (H = I);
            break;
          }
          (t && H && nt.alternate === null && e(v, H),
            (y = i(nt, y, Z)),
            et === null ? (x = nt) : (et.sibling = nt),
            (et = nt),
            (H = I));
        }
        if (Z === S.length) return (n(v, H), P && je(v, Z), x);
        if (H === null) {
          for (; Z < S.length; Z++)
            ((H = M(v, S[Z], E)),
              H !== null &&
                ((y = i(H, y, Z)),
                et === null ? (x = H) : (et.sibling = H),
                (et = H)));
          return (P && je(v, Z), x);
        }
        for (H = a(H); Z < S.length; Z++)
          ((I = T(H, v, Z, S[Z], E)),
            I !== null &&
              (t &&
                I.alternate !== null &&
                H.delete(I.key === null ? Z : I.key),
              (y = i(I, y, Z)),
              et === null ? (x = I) : (et.sibling = I),
              (et = I)));
        return (
          t &&
            H.forEach(function (Rn) {
              return e(v, Rn);
            }),
          P && je(v, Z),
          x
        );
      }
      function Y(v, y, S, E) {
        if (S == null) throw Error(f(151));
        for (
          var x = null, et = null, H = y, Z = (y = 0), I = null, nt = S.next();
          H !== null && !nt.done;
          Z++, nt = S.next()
        ) {
          H.index > Z ? ((I = H), (H = null)) : (I = H.sibling);
          var Rn = b(v, H, nt.value, E);
          if (Rn === null) {
            H === null && (H = I);
            break;
          }
          (t && H && Rn.alternate === null && e(v, H),
            (y = i(Rn, y, Z)),
            et === null ? (x = Rn) : (et.sibling = Rn),
            (et = Rn),
            (H = I));
        }
        if (nt.done) return (n(v, H), P && je(v, Z), x);
        if (H === null) {
          for (; !nt.done; Z++, nt = S.next())
            ((nt = M(v, nt.value, E)),
              nt !== null &&
                ((y = i(nt, y, Z)),
                et === null ? (x = nt) : (et.sibling = nt),
                (et = nt)));
          return (P && je(v, Z), x);
        }
        for (H = a(H); !nt.done; Z++, nt = S.next())
          ((nt = T(H, v, Z, nt.value, E)),
            nt !== null &&
              (t &&
                nt.alternate !== null &&
                H.delete(nt.key === null ? Z : nt.key),
              (y = i(nt, y, Z)),
              et === null ? (x = nt) : (et.sibling = nt),
              (et = nt)));
        return (
          t &&
            H.forEach(function (Qg) {
              return e(v, Qg);
            }),
          P && je(v, Z),
          x
        );
      }
      function dt(v, y, S, E) {
        if (
          (typeof S == "object" &&
            S !== null &&
            S.type === kt &&
            S.key === null &&
            (S = S.props.children),
          typeof S == "object" && S !== null)
        ) {
          switch (S.$$typeof) {
            case At:
              t: {
                for (var x = S.key; y !== null; ) {
                  if (y.key === x) {
                    if (((x = S.type), x === kt)) {
                      if (y.tag === 7) {
                        (n(v, y.sibling),
                          (E = l(y, S.props.children)),
                          (E.return = v),
                          (v = E));
                        break t;
                      }
                    } else if (
                      y.elementType === x ||
                      (typeof x == "object" &&
                        x !== null &&
                        x.$$typeof === gt &&
                        jn(x) === y.type)
                    ) {
                      (n(v, y.sibling),
                        (E = l(y, S.props)),
                        fl(E, S),
                        (E.return = v),
                        (v = E));
                      break t;
                    }
                    n(v, y);
                    break;
                  } else e(v, y);
                  y = y.sibling;
                }
                S.type === kt
                  ? ((E = Bn(S.props.children, v.mode, E, S.key)),
                    (E.return = v),
                    (v = E))
                  : ((E = oi(S.type, S.key, S.props, null, v.mode, E)),
                    fl(E, S),
                    (E.return = v),
                    (v = E));
              }
              return s(v);
            case zt:
              t: {
                for (x = S.key; y !== null; ) {
                  if (y.key === x)
                    if (
                      y.tag === 4 &&
                      y.stateNode.containerInfo === S.containerInfo &&
                      y.stateNode.implementation === S.implementation
                    ) {
                      (n(v, y.sibling),
                        (E = l(y, S.children || [])),
                        (E.return = v),
                        (v = E));
                      break t;
                    } else {
                      n(v, y);
                      break;
                    }
                  else e(v, y);
                  y = y.sibling;
                }
                ((E = Ju(S, v.mode, E)), (E.return = v), (v = E));
              }
              return s(v);
            case gt:
              return ((S = jn(S)), dt(v, y, S, E));
          }
          if (Q(S)) return B(v, y, S, E);
          if (xt(S)) {
            if (((x = xt(S)), typeof x != "function")) throw Error(f(150));
            return ((S = x.call(S)), Y(v, y, S, E));
          }
          if (typeof S.then == "function") return dt(v, y, vi(S), E);
          if (S.$$typeof === tt) return dt(v, y, hi(v, S), E);
          mi(v, S);
        }
        return (typeof S == "string" && S !== "") ||
          typeof S == "number" ||
          typeof S == "bigint"
          ? ((S = "" + S),
            y !== null && y.tag === 6
              ? (n(v, y.sibling), (E = l(y, S)), (E.return = v), (v = E))
              : (n(v, y), (E = Ku(S, v.mode, E)), (E.return = v), (v = E)),
            s(v))
          : n(v, y);
      }
      return function (v, y, S, E) {
        try {
          ol = 0;
          var x = dt(v, y, S, E);
          return ((ba = null), x);
        } catch (H) {
          if (H === pa || H === yi) throw H;
          var et = se(29, H, null, v.mode);
          return ((et.lanes = E), (et.return = v), et);
        }
      };
    }
    var Gn = sf(!0),
      of = sf(!1),
      hn = !1;
    function uc(t) {
      t.updateQueue = {
        baseState: t.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: { pending: null, lanes: 0, hiddenCallbacks: null },
        callbacks: null,
      };
    }
    function cc(t, e) {
      ((t = t.updateQueue),
        e.updateQueue === t &&
          (e.updateQueue = {
            baseState: t.baseState,
            firstBaseUpdate: t.firstBaseUpdate,
            lastBaseUpdate: t.lastBaseUpdate,
            shared: t.shared,
            callbacks: null,
          }));
    }
    function Xn(t) {
      return { lane: t, tag: 0, payload: null, callback: null, next: null };
    }
    function Zn(t, e, n) {
      var a = t.updateQueue;
      if (a === null) return null;
      if (((a = a.shared), (it & 2) !== 0)) {
        var l = a.pending;
        return (
          l === null ? (e.next = e) : ((e.next = l.next), (l.next = e)),
          (a.pending = e),
          (e = si(t)),
          Zo(t, null, n),
          e
        );
      }
      return (ci(t, a, e, n), si(t));
    }
    function rl(t, e, n) {
      if (
        ((e = e.updateQueue),
        e !== null && ((e = e.shared), (n & 4194048) !== 0))
      ) {
        var a = e.lanes;
        ((a &= t.pendingLanes), (n |= a), (e.lanes = n), Ws(t, n));
      }
    }
    function sc(t, e) {
      var n = t.updateQueue,
        a = t.alternate;
      if (a !== null && ((a = a.updateQueue), n === a)) {
        var l = null,
          i = null;
        if (((n = n.firstBaseUpdate), n !== null)) {
          do {
            var s = {
              lane: n.lane,
              tag: n.tag,
              payload: n.payload,
              callback: null,
              next: null,
            };
            (i === null ? (l = i = s) : (i = i.next = s), (n = n.next));
          } while (n !== null);
          i === null ? (l = i = e) : (i = i.next = e);
        } else l = i = e;
        ((n = {
          baseState: a.baseState,
          firstBaseUpdate: l,
          lastBaseUpdate: i,
          shared: a.shared,
          callbacks: a.callbacks,
        }),
          (t.updateQueue = n));
        return;
      }
      ((t = n.lastBaseUpdate),
        t === null ? (n.firstBaseUpdate = e) : (t.next = e),
        (n.lastBaseUpdate = e));
    }
    var oc = !1;
    function hl() {
      if (oc) {
        var t = Sa;
        if (t !== null) throw t;
      }
    }
    function dl(t, e, n, a) {
      oc = !1;
      var l = t.updateQueue;
      hn = !1;
      var i = l.firstBaseUpdate,
        s = l.lastBaseUpdate,
        r = l.shared.pending;
      if (r !== null) {
        l.shared.pending = null;
        var d = r,
          p = d.next;
        ((d.next = null), s === null ? (i = p) : (s.next = p), (s = d));
        var _ = t.alternate;
        _ !== null &&
          ((_ = _.updateQueue),
          (r = _.lastBaseUpdate),
          r !== s &&
            (r === null ? (_.firstBaseUpdate = p) : (r.next = p),
            (_.lastBaseUpdate = d)));
      }
      if (i !== null) {
        var M = l.baseState;
        ((s = 0), (_ = p = d = null), (r = i));
        do {
          var b = r.lane & -536870913,
            T = b !== r.lane;
          if (T ? (W & b) === b : (a & b) === b) {
            (b !== 0 && b === ma && (oc = !0),
              _ !== null &&
                (_ = _.next =
                  {
                    lane: 0,
                    tag: r.tag,
                    payload: r.payload,
                    callback: null,
                    next: null,
                  }));
            t: {
              var B = t,
                Y = r;
              b = e;
              var dt = n;
              switch (Y.tag) {
                case 1:
                  if (((B = Y.payload), typeof B == "function")) {
                    M = B.call(dt, M, b);
                    break t;
                  }
                  M = B;
                  break t;
                case 3:
                  B.flags = (B.flags & -65537) | 128;
                case 0:
                  if (
                    ((B = Y.payload),
                    (b = typeof B == "function" ? B.call(dt, M, b) : B),
                    b == null)
                  )
                    break t;
                  M = C({}, M, b);
                  break t;
                case 2:
                  hn = !0;
              }
            }
            ((b = r.callback),
              b !== null &&
                ((t.flags |= 64),
                T && (t.flags |= 8192),
                (T = l.callbacks),
                T === null ? (l.callbacks = [b]) : T.push(b)));
          } else
            ((T = {
              lane: b,
              tag: r.tag,
              payload: r.payload,
              callback: r.callback,
              next: null,
            }),
              _ === null ? ((p = _ = T), (d = M)) : (_ = _.next = T),
              (s |= b));
          if (((r = r.next), r === null)) {
            if (((r = l.shared.pending), r === null)) break;
            ((T = r),
              (r = T.next),
              (T.next = null),
              (l.lastBaseUpdate = T),
              (l.shared.pending = null));
          }
        } while (!0);
        (_ === null && (d = M),
          (l.baseState = d),
          (l.firstBaseUpdate = p),
          (l.lastBaseUpdate = _),
          i === null && (l.shared.lanes = 0),
          (mn |= s),
          (t.lanes = s),
          (t.memoizedState = M));
      }
    }
    function ff(t, e) {
      if (typeof t != "function") throw Error(f(191, t));
      t.call(e);
    }
    function rf(t, e) {
      var n = t.callbacks;
      if (n !== null)
        for (t.callbacks = null, t = 0; t < n.length; t++) ff(n[t], e);
    }
    var Ta = g(null),
      Si = g(0);
    function hf(t, e) {
      ((t = Ie), w(Si, t), w(Ta, e), (Ie = t | e.baseLanes));
    }
    function fc() {
      (w(Si, Ie), w(Ta, Ta.current));
    }
    function rc() {
      ((Ie = Si.current), R(Ta), R(Si));
    }
    var oe = g(null),
      Te = null;
    function dn(t) {
      var e = t.alternate;
      (w(Mt, Mt.current & 1),
        w(oe, t),
        Te === null &&
          (e === null || Ta.current !== null || e.memoizedState !== null) &&
          (Te = t));
    }
    function hc(t) {
      (w(Mt, Mt.current), w(oe, t), Te === null && (Te = t));
    }
    function df(t) {
      t.tag === 22
        ? (w(Mt, Mt.current), w(oe, t), Te === null && (Te = t))
        : yn(t);
    }
    function yn() {
      (w(Mt, Mt.current), w(oe, oe.current));
    }
    function fe(t) {
      (R(oe), Te === t && (Te = null), R(Mt));
    }
    var Mt = g(0);
    function pi(t) {
      for (var e = t; e !== null; ) {
        if (e.tag === 13) {
          var n = e.memoizedState;
          if (n !== null && ((n = n.dehydrated), n === null || ms(n) || Ss(n)))
            return e;
        } else if (
          e.tag === 19 &&
          (e.memoizedProps.revealOrder === "forwards" ||
            e.memoizedProps.revealOrder === "backwards" ||
            e.memoizedProps.revealOrder === "unstable_legacy-backwards" ||
            e.memoizedProps.revealOrder === "together")
        ) {
          if ((e.flags & 128) !== 0) return e;
        } else if (e.child !== null) {
          ((e.child.return = e), (e = e.child));
          continue;
        }
        if (e === t) break;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === t) return null;
          e = e.return;
        }
        ((e.sibling.return = e.return), (e = e.sibling));
      }
      return null;
    }
    var Xe = 0,
      G = null,
      rt = null,
      Dt = null,
      bi = !1,
      Aa = !1,
      kn = !1,
      Ti = 0,
      yl = 0,
      _a = null,
      Ty = 0;
    function _t() {
      throw Error(f(321));
    }
    function dc(t, e) {
      if (e === null) return !1;
      for (var n = 0; n < e.length && n < t.length; n++)
        if (!ce(t[n], e[n])) return !1;
      return !0;
    }
    function yc(t, e, n, a, l, i) {
      return (
        (Xe = i),
        (G = e),
        (e.memoizedState = null),
        (e.updateQueue = null),
        (e.lanes = 0),
        (q.H = t === null || t.memoizedState === null ? Ff : Cc),
        (kn = !1),
        (i = n(a, l)),
        (kn = !1),
        Aa && (i = gf(e, n, a, l)),
        yf(t),
        i
      );
    }
    function yf(t) {
      q.H = ml;
      var e = rt !== null && rt.next !== null;
      if (((Xe = 0), (Dt = rt = G = null), (bi = !1), (yl = 0), (_a = null), e))
        throw Error(f(300));
      t === null ||
        wt ||
        ((t = t.dependencies), t !== null && ri(t) && (wt = !0));
    }
    function gf(t, e, n, a) {
      G = t;
      var l = 0;
      do {
        if ((Aa && (_a = null), (yl = 0), (Aa = !1), 25 <= l))
          throw Error(f(301));
        if (((l += 1), (Dt = rt = null), t.updateQueue != null)) {
          var i = t.updateQueue;
          ((i.lastEffect = null),
            (i.events = null),
            (i.stores = null),
            i.memoCache != null && (i.memoCache.index = 0));
        }
        ((q.H = Wf), (i = e(n, a)));
      } while (Aa);
      return i;
    }
    function Ay() {
      var t = q.H,
        e = t.useState()[0];
      return (
        (e = typeof e.then == "function" ? gl(e) : e),
        (t = t.useState()[0]),
        (rt !== null ? rt.memoizedState : null) !== t && (G.flags |= 1024),
        e
      );
    }
    function gc() {
      var t = Ti !== 0;
      return ((Ti = 0), t);
    }
    function vc(t, e, n) {
      ((e.updateQueue = t.updateQueue), (e.flags &= -2053), (t.lanes &= ~n));
    }
    function mc(t) {
      if (bi) {
        for (t = t.memoizedState; t !== null; ) {
          var e = t.queue;
          (e !== null && (e.pending = null), (t = t.next));
        }
        bi = !1;
      }
      ((Xe = 0), (Dt = rt = G = null), (Aa = !1), (yl = Ti = 0), (_a = null));
    }
    function Jt() {
      var t = {
        memoizedState: null,
        baseState: null,
        baseQueue: null,
        queue: null,
        next: null,
      };
      return (
        Dt === null ? (G.memoizedState = Dt = t) : (Dt = Dt.next = t),
        Dt
      );
    }
    function Rt() {
      if (rt === null) {
        var t = G.alternate;
        t = t !== null ? t.memoizedState : null;
      } else t = rt.next;
      var e = Dt === null ? G.memoizedState : Dt.next;
      if (e !== null) ((Dt = e), (rt = t));
      else {
        if (t === null)
          throw G.alternate === null ? Error(f(467)) : Error(f(310));
        ((rt = t),
          (t = {
            memoizedState: rt.memoizedState,
            baseState: rt.baseState,
            baseQueue: rt.baseQueue,
            queue: rt.queue,
            next: null,
          }),
          Dt === null ? (G.memoizedState = Dt = t) : (Dt = Dt.next = t));
      }
      return Dt;
    }
    function Ai() {
      return { lastEffect: null, events: null, stores: null, memoCache: null };
    }
    function gl(t) {
      var e = yl;
      return (
        (yl += 1),
        _a === null && (_a = []),
        (t = lf(_a, t, e)),
        (e = G),
        (Dt === null ? e.memoizedState : Dt.next) === null &&
          ((e = e.alternate),
          (q.H = e === null || e.memoizedState === null ? Ff : Cc)),
        t
      );
    }
    function _i(t) {
      if (t !== null && typeof t == "object") {
        if (typeof t.then == "function") return gl(t);
        if (t.$$typeof === tt) return Gt(t);
      }
      throw Error(f(438, String(t)));
    }
    function Sc(t) {
      var e = null,
        n = G.updateQueue;
      if ((n !== null && (e = n.memoCache), e == null)) {
        var a = G.alternate;
        a !== null &&
          ((a = a.updateQueue),
          a !== null &&
            ((a = a.memoCache),
            a != null &&
              (e = {
                data: a.data.map(function (l) {
                  return l.slice();
                }),
                index: 0,
              })));
      }
      if (
        ((e ??= { data: [], index: 0 }),
        n === null && ((n = Ai()), (G.updateQueue = n)),
        (n.memoCache = e),
        (n = e.data[e.index]),
        n === void 0)
      )
        for (n = e.data[e.index] = Array(t), a = 0; a < t; a++) n[a] = ft;
      return (e.index++, n);
    }
    function Ze(t, e) {
      return typeof e == "function" ? e(t) : e;
    }
    function Ei(t) {
      return pc(Rt(), rt, t);
    }
    function pc(t, e, n) {
      var a = t.queue;
      if (a === null) throw Error(f(311));
      a.lastRenderedReducer = n;
      var l = t.baseQueue,
        i = a.pending;
      if (i !== null) {
        if (l !== null) {
          var s = l.next;
          ((l.next = i.next), (i.next = s));
        }
        ((e.baseQueue = l = i), (a.pending = null));
      }
      if (((i = t.baseState), l === null)) t.memoizedState = i;
      else {
        e = l.next;
        var r = (s = null),
          d = null,
          p = e,
          _ = !1;
        do {
          var M = p.lane & -536870913;
          if (M !== p.lane ? (W & M) === M : (Xe & M) === M) {
            var b = p.revertLane;
            if (b === 0)
              (d !== null &&
                (d = d.next =
                  {
                    lane: 0,
                    revertLane: 0,
                    gesture: null,
                    action: p.action,
                    hasEagerState: p.hasEagerState,
                    eagerState: p.eagerState,
                    next: null,
                  }),
                M === ma && (_ = !0));
            else if ((Xe & b) === b) {
              ((p = p.next), b === ma && (_ = !0));
              continue;
            } else
              ((M = {
                lane: 0,
                revertLane: p.revertLane,
                gesture: null,
                action: p.action,
                hasEagerState: p.hasEagerState,
                eagerState: p.eagerState,
                next: null,
              }),
                d === null ? ((r = d = M), (s = i)) : (d = d.next = M),
                (G.lanes |= b),
                (mn |= b));
            ((M = p.action),
              kn && n(i, M),
              (i = p.hasEagerState ? p.eagerState : n(i, M)));
          } else
            ((b = {
              lane: M,
              revertLane: p.revertLane,
              gesture: p.gesture,
              action: p.action,
              hasEagerState: p.hasEagerState,
              eagerState: p.eagerState,
              next: null,
            }),
              d === null ? ((r = d = b), (s = i)) : (d = d.next = b),
              (G.lanes |= M),
              (mn |= M));
          p = p.next;
        } while (p !== null && p !== e);
        if (
          (d === null ? (s = i) : (d.next = r),
          !ce(i, t.memoizedState) && ((wt = !0), _ && ((n = Sa), n !== null)))
        )
          throw n;
        ((t.memoizedState = i),
          (t.baseState = s),
          (t.baseQueue = d),
          (a.lastRenderedState = i));
      }
      return (l === null && (a.lanes = 0), [t.memoizedState, a.dispatch]);
    }
    function bc(t) {
      var e = Rt(),
        n = e.queue;
      if (n === null) throw Error(f(311));
      n.lastRenderedReducer = t;
      var a = n.dispatch,
        l = n.pending,
        i = e.memoizedState;
      if (l !== null) {
        n.pending = null;
        var s = (l = l.next);
        do ((i = t(i, s.action)), (s = s.next));
        while (s !== l);
        (ce(i, e.memoizedState) || (wt = !0),
          (e.memoizedState = i),
          e.baseQueue === null && (e.baseState = i),
          (n.lastRenderedState = i));
      }
      return [i, a];
    }
    function vf(t, e, n) {
      var a = G,
        l = Rt(),
        i = P;
      if (i) {
        if (n === void 0) throw Error(f(407));
        n = n();
      } else n = e();
      var s = !ce((rt || l).memoizedState, n);
      if (
        (s && ((l.memoizedState = n), (wt = !0)),
        (l = l.queue),
        _c(pf.bind(null, a, l, t), [t]),
        l.getSnapshot !== e || s || (Dt !== null && Dt.memoizedState.tag & 1))
      ) {
        if (
          ((a.flags |= 2048),
          Ea(9, { destroy: void 0 }, Sf.bind(null, a, l, n, e), null),
          vt === null)
        )
          throw Error(f(349));
        i || (Xe & 127) !== 0 || mf(a, e, n);
      }
      return n;
    }
    function mf(t, e, n) {
      ((t.flags |= 16384),
        (t = { getSnapshot: e, value: n }),
        (e = G.updateQueue),
        e === null
          ? ((e = Ai()), (G.updateQueue = e), (e.stores = [t]))
          : ((n = e.stores), n === null ? (e.stores = [t]) : n.push(t)));
    }
    function Sf(t, e, n, a) {
      ((e.value = n), (e.getSnapshot = a), bf(e) && Tf(t));
    }
    function pf(t, e, n) {
      return n(function () {
        bf(e) && Tf(t);
      });
    }
    function bf(t) {
      var e = t.getSnapshot;
      t = t.value;
      try {
        var n = e();
        return !ce(t, n);
      } catch {
        return !0;
      }
    }
    function Tf(t) {
      var e = Qn(t, 2);
      e !== null && ee(e, t, 2);
    }
    function Tc(t) {
      var e = Jt();
      if (typeof t == "function") {
        var n = t;
        if (((t = n()), kn)) {
          ln(!0);
          try {
            n();
          } finally {
            ln(!1);
          }
        }
      }
      return (
        (e.memoizedState = e.baseState = t),
        (e.queue = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: Ze,
          lastRenderedState: t,
        }),
        e
      );
    }
    function Af(t, e, n, a) {
      return ((t.baseState = n), pc(t, rt, typeof a == "function" ? a : Ze));
    }
    function _y(t, e, n, a, l) {
      if (Ri(t)) throw Error(f(485));
      if (((t = e.action), t !== null)) {
        var i = {
          payload: l,
          action: t,
          next: null,
          isTransition: !0,
          status: "pending",
          value: null,
          reason: null,
          listeners: [],
          then: function (s) {
            i.listeners.push(s);
          },
        };
        (q.T !== null ? n(!0) : (i.isTransition = !1),
          a(i),
          (n = e.pending),
          n === null
            ? ((i.next = e.pending = i), _f(e, i))
            : ((i.next = n.next), (e.pending = n.next = i)));
      }
    }
    function _f(t, e) {
      var n = e.action,
        a = e.payload,
        l = t.state;
      if (e.isTransition) {
        var i = q.T,
          s = {};
        q.T = s;
        try {
          var r = n(l, a),
            d = q.S;
          (d !== null && d(s, r), Ef(t, e, r));
        } catch (p) {
          Ac(t, e, p);
        } finally {
          (i !== null && s.types !== null && (i.types = s.types), (q.T = i));
        }
      } else
        try {
          ((i = n(l, a)), Ef(t, e, i));
        } catch (p) {
          Ac(t, e, p);
        }
    }
    function Ef(t, e, n) {
      n !== null && typeof n == "object" && typeof n.then == "function"
        ? n.then(
            function (a) {
              Of(t, e, a);
            },
            function (a) {
              return Ac(t, e, a);
            },
          )
        : Of(t, e, n);
    }
    function Of(t, e, n) {
      ((e.status = "fulfilled"),
        (e.value = n),
        Mf(e),
        (t.state = n),
        (e = t.pending),
        e !== null &&
          ((n = e.next),
          n === e
            ? (t.pending = null)
            : ((n = n.next), (e.next = n), _f(t, n))));
    }
    function Ac(t, e, n) {
      var a = t.pending;
      if (((t.pending = null), a !== null)) {
        a = a.next;
        do ((e.status = "rejected"), (e.reason = n), Mf(e), (e = e.next));
        while (e !== a);
      }
      t.action = null;
    }
    function Mf(t) {
      t = t.listeners;
      for (var e = 0; e < t.length; e++) (0, t[e])();
    }
    function Rf(t, e) {
      return e;
    }
    function zf(t, e) {
      if (P) {
        var n = vt.formState;
        if (n !== null) {
          t: {
            var a = G;
            if (P) {
              if (pt) {
                e: {
                  for (var l = pt, i = be; l.nodeType !== 8; ) {
                    if (!i) {
                      l = null;
                      break e;
                    }
                    if (((l = _e(l.nextSibling)), l === null)) {
                      l = null;
                      break e;
                    }
                  }
                  ((i = l.data), (l = i === "F!" || i === "F" ? l : null));
                }
                if (l) {
                  ((pt = _e(l.nextSibling)), (a = l.data === "F!"));
                  break t;
                }
              }
              fn(a);
            }
            a = !1;
          }
          a && (e = n[0]);
        }
      }
      return (
        (n = Jt()),
        (n.memoizedState = n.baseState = e),
        (a = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: Rf,
          lastRenderedState: e,
        }),
        (n.queue = a),
        (n = Kf.bind(null, G, a)),
        (a.dispatch = n),
        (a = Tc(!1)),
        (i = zc.bind(null, G, !1, a.queue)),
        (a = Jt()),
        (l = { state: e, dispatch: null, action: t, pending: null }),
        (a.queue = l),
        (n = _y.bind(null, G, l, i, n)),
        (l.dispatch = n),
        (a.memoizedState = t),
        [e, n, !1]
      );
    }
    function Cf(t) {
      return qf(Rt(), rt, t);
    }
    function qf(t, e, n) {
      if (
        ((e = pc(t, e, Rf)[0]),
        (t = Ei(Ze)[0]),
        typeof e == "object" && e !== null && typeof e.then == "function")
      )
        try {
          var a = gl(e);
        } catch (s) {
          throw s === pa ? yi : s;
        }
      else a = e;
      e = Rt();
      var l = e.queue,
        i = l.dispatch;
      return (
        n !== e.memoizedState &&
          ((G.flags |= 2048),
          Ea(9, { destroy: void 0 }, Ey.bind(null, l, n), null)),
        [a, i, t]
      );
    }
    function Ey(t, e) {
      t.action = e;
    }
    function Df(t) {
      var e = Rt(),
        n = rt;
      if (n !== null) return qf(e, n, t);
      (Rt(), (e = e.memoizedState), (n = Rt()));
      var a = n.queue.dispatch;
      return ((n.memoizedState = t), [e, a, !1]);
    }
    function Ea(t, e, n, a) {
      return (
        (t = { tag: t, create: n, deps: a, inst: e, next: null }),
        (e = G.updateQueue),
        e === null && ((e = Ai()), (G.updateQueue = e)),
        (n = e.lastEffect),
        n === null
          ? (e.lastEffect = t.next = t)
          : ((a = n.next), (n.next = t), (t.next = a), (e.lastEffect = t)),
        t
      );
    }
    function wf() {
      return Rt().memoizedState;
    }
    function Oi(t, e, n, a) {
      var l = Jt();
      ((G.flags |= t),
        (l.memoizedState = Ea(
          1 | e,
          { destroy: void 0 },
          n,
          a === void 0 ? null : a,
        )));
    }
    function Mi(t, e, n, a) {
      var l = Rt();
      a = a === void 0 ? null : a;
      var i = l.memoizedState.inst;
      rt !== null && a !== null && dc(a, rt.memoizedState.deps)
        ? (l.memoizedState = Ea(e, i, n, a))
        : ((G.flags |= t), (l.memoizedState = Ea(1 | e, i, n, a)));
    }
    function Uf(t, e) {
      Oi(8390656, 8, t, e);
    }
    function _c(t, e) {
      Mi(2048, 8, t, e);
    }
    function Oy(t) {
      G.flags |= 4;
      var e = G.updateQueue;
      if (e === null) ((e = Ai()), (G.updateQueue = e), (e.events = [t]));
      else {
        var n = e.events;
        n === null ? (e.events = [t]) : n.push(t);
      }
    }
    function Nf(t) {
      var e = Rt().memoizedState;
      return (
        Oy({ ref: e, nextImpl: t }),
        function () {
          if ((it & 2) !== 0) throw Error(f(440));
          return e.impl.apply(void 0, arguments);
        }
      );
    }
    function Qf(t, e) {
      return Mi(4, 2, t, e);
    }
    function Bf(t, e) {
      return Mi(4, 4, t, e);
    }
    function Hf(t, e) {
      if (typeof e == "function") {
        t = t();
        var n = e(t);
        return function () {
          typeof n == "function" ? n() : e(null);
        };
      }
      if (e != null)
        return (
          (t = t()),
          (e.current = t),
          function () {
            e.current = null;
          }
        );
    }
    function Lf(t, e, n) {
      ((n = n != null ? n.concat([t]) : null),
        Mi(4, 4, Hf.bind(null, e, t), n));
    }
    function Ec() {}
    function Vf(t, e) {
      var n = Rt();
      e = e === void 0 ? null : e;
      var a = n.memoizedState;
      return e !== null && dc(e, a[1]) ? a[0] : ((n.memoizedState = [t, e]), t);
    }
    function xf(t, e) {
      var n = Rt();
      e = e === void 0 ? null : e;
      var a = n.memoizedState;
      if (e !== null && dc(e, a[1])) return a[0];
      if (((a = t()), kn)) {
        ln(!0);
        try {
          t();
        } finally {
          ln(!1);
        }
      }
      return ((n.memoizedState = [a, e]), a);
    }
    function Oc(t, e, n) {
      return n === void 0 || ((Xe & 1073741824) !== 0 && (W & 261930) === 0)
        ? (t.memoizedState = e)
        : ((t.memoizedState = n), (t = Lr()), (G.lanes |= t), (mn |= t), n);
    }
    function jf(t, e, n, a) {
      return ce(n, e)
        ? n
        : Ta.current !== null
          ? ((t = Oc(t, n, a)), ce(t, e) || (wt = !0), t)
          : (Xe & 42) === 0 || ((Xe & 1073741824) !== 0 && (W & 261930) === 0)
            ? ((wt = !0), (t.memoizedState = n))
            : ((t = Lr()), (G.lanes |= t), (mn |= t), e);
    }
    function Yf(t, e, n, a, l) {
      var i = N.p;
      N.p = i !== 0 && 8 > i ? i : 8;
      var s = q.T,
        r = {};
      ((q.T = r), zc(t, !1, e, n));
      try {
        var d = l(),
          p = q.S;
        (p !== null && p(r, d),
          d !== null && typeof d == "object" && typeof d.then == "function"
            ? vl(t, e, by(d, a), Ae(t))
            : vl(t, e, a, Ae(t)));
      } catch (_) {
        vl(t, e, { then: function () {}, status: "rejected", reason: _ }, Ae());
      } finally {
        ((N.p = i),
          s !== null && r.types !== null && (s.types = r.types),
          (q.T = s));
      }
    }
    function My() {}
    function Mc(t, e, n, a) {
      if (t.tag !== 5) throw Error(f(476));
      var l = Gf(t).queue;
      Yf(
        t,
        l,
        e,
        lt,
        n === null
          ? My
          : function () {
              return (Xf(t), n(a));
            },
      );
    }
    function Gf(t) {
      var e = t.memoizedState;
      if (e !== null) return e;
      e = {
        memoizedState: lt,
        baseState: lt,
        baseQueue: null,
        queue: {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: Ze,
          lastRenderedState: lt,
        },
        next: null,
      };
      var n = {};
      return (
        (e.next = {
          memoizedState: n,
          baseState: n,
          baseQueue: null,
          queue: {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: Ze,
            lastRenderedState: n,
          },
          next: null,
        }),
        (t.memoizedState = e),
        (t = t.alternate),
        t !== null && (t.memoizedState = e),
        e
      );
    }
    function Xf(t) {
      var e = Gf(t);
      (e.next === null && (e = t.alternate.memoizedState),
        vl(t, e.next.queue, {}, Ae()));
    }
    function Rc() {
      return Gt(Ul);
    }
    function Zf() {
      return Rt().memoizedState;
    }
    function kf() {
      return Rt().memoizedState;
    }
    function Ry(t) {
      for (var e = t.return; e !== null; ) {
        switch (e.tag) {
          case 24:
          case 3:
            var n = Ae();
            t = Xn(n);
            var a = Zn(e, t, n);
            (a !== null && (ee(a, e, n), rl(a, e, n)),
              (e = { cache: nc() }),
              (t.payload = e));
            return;
        }
        e = e.return;
      }
    }
    function zy(t, e, n) {
      var a = Ae();
      ((n = {
        lane: a,
        revertLane: 0,
        gesture: null,
        action: n,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      }),
        Ri(t)
          ? Jf(e, n)
          : ((n = Zu(t, e, n, a)), n !== null && (ee(n, t, a), $f(n, e, a))));
    }
    function Kf(t, e, n) {
      vl(t, e, n, Ae());
    }
    function vl(t, e, n, a) {
      var l = {
        lane: a,
        revertLane: 0,
        gesture: null,
        action: n,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      };
      if (Ri(t)) Jf(e, l);
      else {
        var i = t.alternate;
        if (
          t.lanes === 0 &&
          (i === null || i.lanes === 0) &&
          ((i = e.lastRenderedReducer), i !== null)
        )
          try {
            var s = e.lastRenderedState,
              r = i(s, n);
            if (((l.hasEagerState = !0), (l.eagerState = r), ce(r, s)))
              return (ci(t, e, l, 0), vt === null && ui(), !1);
          } catch {}
        if (((n = Zu(t, e, l, a)), n !== null))
          return (ee(n, t, a), $f(n, e, a), !0);
      }
      return !1;
    }
    function zc(t, e, n, a) {
      if (
        ((a = {
          lane: 2,
          revertLane: us(),
          gesture: null,
          action: a,
          hasEagerState: !1,
          eagerState: null,
          next: null,
        }),
        Ri(t))
      ) {
        if (e) throw Error(f(479));
      } else ((e = Zu(t, n, a, 2)), e !== null && ee(e, t, 2));
    }
    function Ri(t) {
      var e = t.alternate;
      return t === G || (e !== null && e === G);
    }
    function Jf(t, e) {
      Aa = bi = !0;
      var n = t.pending;
      (n === null ? (e.next = e) : ((e.next = n.next), (n.next = e)),
        (t.pending = e));
    }
    function $f(t, e, n) {
      if ((n & 4194048) !== 0) {
        var a = e.lanes;
        ((a &= t.pendingLanes), (n |= a), (e.lanes = n), Ws(t, n));
      }
    }
    var ml = {
      readContext: Gt,
      use: _i,
      useCallback: _t,
      useContext: _t,
      useEffect: _t,
      useImperativeHandle: _t,
      useLayoutEffect: _t,
      useInsertionEffect: _t,
      useMemo: _t,
      useReducer: _t,
      useRef: _t,
      useState: _t,
      useDebugValue: _t,
      useDeferredValue: _t,
      useTransition: _t,
      useSyncExternalStore: _t,
      useId: _t,
      useHostTransitionStatus: _t,
      useFormState: _t,
      useActionState: _t,
      useOptimistic: _t,
      useMemoCache: _t,
      useCacheRefresh: _t,
    };
    ml.useEffectEvent = _t;
    var Ff = {
        readContext: Gt,
        use: _i,
        useCallback: function (t, e) {
          return ((Jt().memoizedState = [t, e === void 0 ? null : e]), t);
        },
        useContext: Gt,
        useEffect: Uf,
        useImperativeHandle: function (t, e, n) {
          ((n = n != null ? n.concat([t]) : null),
            Oi(4194308, 4, Hf.bind(null, e, t), n));
        },
        useLayoutEffect: function (t, e) {
          return Oi(4194308, 4, t, e);
        },
        useInsertionEffect: function (t, e) {
          Oi(4, 2, t, e);
        },
        useMemo: function (t, e) {
          var n = Jt();
          e = e === void 0 ? null : e;
          var a = t();
          if (kn) {
            ln(!0);
            try {
              t();
            } finally {
              ln(!1);
            }
          }
          return ((n.memoizedState = [a, e]), a);
        },
        useReducer: function (t, e, n) {
          var a = Jt();
          if (n !== void 0) {
            var l = n(e);
            if (kn) {
              ln(!0);
              try {
                n(e);
              } finally {
                ln(!1);
              }
            }
          } else l = e;
          return (
            (a.memoizedState = a.baseState = l),
            (t = {
              pending: null,
              lanes: 0,
              dispatch: null,
              lastRenderedReducer: t,
              lastRenderedState: l,
            }),
            (a.queue = t),
            (t = t.dispatch = zy.bind(null, G, t)),
            [a.memoizedState, t]
          );
        },
        useRef: function (t) {
          var e = Jt();
          return ((t = { current: t }), (e.memoizedState = t));
        },
        useState: function (t) {
          t = Tc(t);
          var e = t.queue,
            n = Kf.bind(null, G, e);
          return ((e.dispatch = n), [t.memoizedState, n]);
        },
        useDebugValue: Ec,
        useDeferredValue: function (t, e) {
          return Oc(Jt(), t, e);
        },
        useTransition: function () {
          var t = Tc(!1);
          return (
            (t = Yf.bind(null, G, t.queue, !0, !1)),
            (Jt().memoizedState = t),
            [!1, t]
          );
        },
        useSyncExternalStore: function (t, e, n) {
          var a = G,
            l = Jt();
          if (P) {
            if (n === void 0) throw Error(f(407));
            n = n();
          } else {
            if (((n = e()), vt === null)) throw Error(f(349));
            (W & 127) !== 0 || mf(a, e, n);
          }
          l.memoizedState = n;
          var i = { value: n, getSnapshot: e };
          return (
            (l.queue = i),
            Uf(pf.bind(null, a, i, t), [t]),
            (a.flags |= 2048),
            Ea(9, { destroy: void 0 }, Sf.bind(null, a, i, n, e), null),
            n
          );
        },
        useId: function () {
          var t = Jt(),
            e = vt.identifierPrefix;
          if (P) {
            var n = we,
              a = De;
            ((n = (a & ~(1 << (32 - ue(a) - 1))).toString(32) + n),
              (e = "_" + e + "R_" + n),
              (n = Ti++),
              0 < n && (e += "H" + n.toString(32)),
              (e += "_"));
          } else ((n = Ty++), (e = "_" + e + "r_" + n.toString(32) + "_"));
          return (t.memoizedState = e);
        },
        useHostTransitionStatus: Rc,
        useFormState: zf,
        useActionState: zf,
        useOptimistic: function (t) {
          var e = Jt();
          e.memoizedState = e.baseState = t;
          var n = {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: null,
            lastRenderedState: null,
          };
          return (
            (e.queue = n),
            (e = zc.bind(null, G, !0, n)),
            (n.dispatch = e),
            [t, e]
          );
        },
        useMemoCache: Sc,
        useCacheRefresh: function () {
          return (Jt().memoizedState = Ry.bind(null, G));
        },
        useEffectEvent: function (t) {
          var e = Jt(),
            n = { impl: t };
          return (
            (e.memoizedState = n),
            function () {
              if ((it & 2) !== 0) throw Error(f(440));
              return n.impl.apply(void 0, arguments);
            }
          );
        },
      },
      Cc = {
        readContext: Gt,
        use: _i,
        useCallback: Vf,
        useContext: Gt,
        useEffect: _c,
        useImperativeHandle: Lf,
        useInsertionEffect: Qf,
        useLayoutEffect: Bf,
        useMemo: xf,
        useReducer: Ei,
        useRef: wf,
        useState: function () {
          return Ei(Ze);
        },
        useDebugValue: Ec,
        useDeferredValue: function (t, e) {
          return jf(Rt(), rt.memoizedState, t, e);
        },
        useTransition: function () {
          var t = Ei(Ze)[0],
            e = Rt().memoizedState;
          return [typeof t == "boolean" ? t : gl(t), e];
        },
        useSyncExternalStore: vf,
        useId: Zf,
        useHostTransitionStatus: Rc,
        useFormState: Cf,
        useActionState: Cf,
        useOptimistic: function (t, e) {
          return Af(Rt(), rt, t, e);
        },
        useMemoCache: Sc,
        useCacheRefresh: kf,
      };
    Cc.useEffectEvent = Nf;
    var Wf = {
      readContext: Gt,
      use: _i,
      useCallback: Vf,
      useContext: Gt,
      useEffect: _c,
      useImperativeHandle: Lf,
      useInsertionEffect: Qf,
      useLayoutEffect: Bf,
      useMemo: xf,
      useReducer: bc,
      useRef: wf,
      useState: function () {
        return bc(Ze);
      },
      useDebugValue: Ec,
      useDeferredValue: function (t, e) {
        var n = Rt();
        return rt === null ? Oc(n, t, e) : jf(n, rt.memoizedState, t, e);
      },
      useTransition: function () {
        var t = bc(Ze)[0],
          e = Rt().memoizedState;
        return [typeof t == "boolean" ? t : gl(t), e];
      },
      useSyncExternalStore: vf,
      useId: Zf,
      useHostTransitionStatus: Rc,
      useFormState: Df,
      useActionState: Df,
      useOptimistic: function (t, e) {
        var n = Rt();
        return rt !== null
          ? Af(n, rt, t, e)
          : ((n.baseState = t), [t, n.queue.dispatch]);
      },
      useMemoCache: Sc,
      useCacheRefresh: kf,
    };
    Wf.useEffectEvent = Nf;
    function qc(t, e, n, a) {
      ((e = t.memoizedState),
        (n = n(a, e)),
        (n = n == null ? e : C({}, e, n)),
        (t.memoizedState = n),
        t.lanes === 0 && (t.updateQueue.baseState = n));
    }
    var Dc = {
      enqueueSetState: function (t, e, n) {
        t = t._reactInternals;
        var a = Ae(),
          l = Xn(a);
        ((l.payload = e),
          n != null && (l.callback = n),
          (e = Zn(t, l, a)),
          e !== null && (ee(e, t, a), rl(e, t, a)));
      },
      enqueueReplaceState: function (t, e, n) {
        t = t._reactInternals;
        var a = Ae(),
          l = Xn(a);
        ((l.tag = 1),
          (l.payload = e),
          n != null && (l.callback = n),
          (e = Zn(t, l, a)),
          e !== null && (ee(e, t, a), rl(e, t, a)));
      },
      enqueueForceUpdate: function (t, e) {
        t = t._reactInternals;
        var n = Ae(),
          a = Xn(n);
        ((a.tag = 2),
          e != null && (a.callback = e),
          (e = Zn(t, a, n)),
          e !== null && (ee(e, t, n), rl(e, t, n)));
      },
    };
    function If(t, e, n, a, l, i, s) {
      return (
        (t = t.stateNode),
        typeof t.shouldComponentUpdate == "function"
          ? t.shouldComponentUpdate(a, i, s)
          : e.prototype && e.prototype.isPureReactComponent
            ? !al(n, a) || !al(l, i)
            : !0
      );
    }
    function Pf(t, e, n, a) {
      ((t = e.state),
        typeof e.componentWillReceiveProps == "function" &&
          e.componentWillReceiveProps(n, a),
        typeof e.UNSAFE_componentWillReceiveProps == "function" &&
          e.UNSAFE_componentWillReceiveProps(n, a),
        e.state !== t && Dc.enqueueReplaceState(e, e.state, null));
    }
    function Kn(t, e) {
      var n = e;
      if ("ref" in e) {
        n = {};
        for (var a in e) a !== "ref" && (n[a] = e[a]);
      }
      if ((t = t.defaultProps)) {
        n === e && (n = C({}, n));
        for (var l in t) n[l] === void 0 && (n[l] = t[l]);
      }
      return n;
    }
    function Cy(t) {
      ii(t);
    }
    function qy(t) {
      console.error(t);
    }
    function Dy(t) {
      ii(t);
    }
    function zi(t, e) {
      try {
        var n = t.onUncaughtError;
        n(e.value, { componentStack: e.stack });
      } catch (a) {
        setTimeout(function () {
          throw a;
        });
      }
    }
    function tr(t, e, n) {
      try {
        var a = t.onCaughtError;
        a(n.value, {
          componentStack: n.stack,
          errorBoundary: e.tag === 1 ? e.stateNode : null,
        });
      } catch (l) {
        setTimeout(function () {
          throw l;
        });
      }
    }
    function wc(t, e, n) {
      return (
        (n = Xn(n)),
        (n.tag = 3),
        (n.payload = { element: null }),
        (n.callback = function () {
          zi(t, e);
        }),
        n
      );
    }
    function er(t) {
      return ((t = Xn(t)), (t.tag = 3), t);
    }
    function nr(t, e, n, a) {
      var l = n.type.getDerivedStateFromError;
      if (typeof l == "function") {
        var i = a.value;
        ((t.payload = function () {
          return l(i);
        }),
          (t.callback = function () {
            tr(e, n, a);
          }));
      }
      var s = n.stateNode;
      s !== null &&
        typeof s.componentDidCatch == "function" &&
        (t.callback = function () {
          (tr(e, n, a),
            typeof l != "function" &&
              (Sn === null ? (Sn = new Set([this])) : Sn.add(this)));
          var r = a.stack;
          this.componentDidCatch(a.value, {
            componentStack: r !== null ? r : "",
          });
        });
    }
    function wy(t, e, n, a, l) {
      if (
        ((n.flags |= 32768),
        a !== null && typeof a == "object" && typeof a.then == "function")
      ) {
        if (
          ((e = n.alternate),
          e !== null && va(e, n, l, !0),
          (n = oe.current),
          n !== null)
        ) {
          switch (n.tag) {
            case 31:
            case 13:
              return (
                Te === null
                  ? xi()
                  : n.alternate === null && Et === 0 && (Et = 3),
                (n.flags &= -257),
                (n.flags |= 65536),
                (n.lanes = l),
                a === gi
                  ? (n.flags |= 16384)
                  : ((e = n.updateQueue),
                    e === null ? (n.updateQueue = new Set([a])) : e.add(a),
                    as(t, a, l)),
                !1
              );
            case 22:
              return (
                (n.flags |= 65536),
                a === gi
                  ? (n.flags |= 16384)
                  : ((e = n.updateQueue),
                    e === null
                      ? ((e = {
                          transitions: null,
                          markerInstances: null,
                          retryQueue: new Set([a]),
                        }),
                        (n.updateQueue = e))
                      : ((n = e.retryQueue),
                        n === null ? (e.retryQueue = new Set([a])) : n.add(a)),
                    as(t, a, l)),
                !1
              );
          }
          throw Error(f(435, n.tag));
        }
        return (as(t, a, l), xi(), !1);
      }
      if (P)
        return (
          (e = oe.current),
          e !== null
            ? ((e.flags & 65536) === 0 && (e.flags |= 256),
              (e.flags |= 65536),
              (e.lanes = l),
              a !== Wu && ((t = Error(f(422), { cause: a })), ul(me(t, n))))
            : (a !== Wu && ((e = Error(f(423), { cause: a })), ul(me(e, n))),
              (t = t.current.alternate),
              (t.flags |= 65536),
              (l &= -l),
              (t.lanes |= l),
              (a = me(a, n)),
              (l = wc(t.stateNode, a, l)),
              sc(t, l),
              Et !== 4 && (Et = 2)),
          !1
        );
      var i = Error(f(520), { cause: a });
      if (
        ((i = me(i, n)),
        Ol === null ? (Ol = [i]) : Ol.push(i),
        Et !== 4 && (Et = 2),
        e === null)
      )
        return !0;
      ((a = me(a, n)), (n = e));
      do {
        switch (n.tag) {
          case 3:
            return (
              (n.flags |= 65536),
              (t = l & -l),
              (n.lanes |= t),
              (t = wc(n.stateNode, a, t)),
              sc(n, t),
              !1
            );
          case 1:
            if (
              ((e = n.type),
              (i = n.stateNode),
              (n.flags & 128) === 0 &&
                (typeof e.getDerivedStateFromError == "function" ||
                  (i !== null &&
                    typeof i.componentDidCatch == "function" &&
                    (Sn === null || !Sn.has(i)))))
            )
              return (
                (n.flags |= 65536),
                (l &= -l),
                (n.lanes |= l),
                (l = er(l)),
                nr(l, t, n, a),
                sc(n, l),
                !1
              );
        }
        n = n.return;
      } while (n !== null);
      return !1;
    }
    var Uc = Error(f(461)),
      wt = !1;
    function Xt(t, e, n, a) {
      e.child = t === null ? of(e, null, n, a) : Gn(e, t.child, n, a);
    }
    function ar(t, e, n, a, l) {
      n = n.render;
      var i = e.ref;
      if ("ref" in a) {
        var s = {};
        for (var r in a) r !== "ref" && (s[r] = a[r]);
      } else s = a;
      return (
        Vn(e),
        (a = yc(t, e, n, s, i, l)),
        (r = gc()),
        t !== null && !wt
          ? (vc(t, e, l), ke(t, e, l))
          : (P && r && $u(e), (e.flags |= 1), Xt(t, e, a, l), e.child)
      );
    }
    function lr(t, e, n, a, l) {
      if (t === null) {
        var i = n.type;
        return typeof i == "function" &&
          !ku(i) &&
          i.defaultProps === void 0 &&
          n.compare === null
          ? ((e.tag = 15), (e.type = i), ir(t, e, i, a, l))
          : ((t = oi(n.type, null, a, e, e.mode, l)),
            (t.ref = e.ref),
            (t.return = e),
            (e.child = t));
      }
      if (((i = t.child), !jc(t, l))) {
        var s = i.memoizedProps;
        if (
          ((n = n.compare),
          (n = n !== null ? n : al),
          n(s, a) && t.ref === e.ref)
        )
          return ke(t, e, l);
      }
      return (
        (e.flags |= 1),
        (t = xe(i, a)),
        (t.ref = e.ref),
        (t.return = e),
        (e.child = t)
      );
    }
    function ir(t, e, n, a, l) {
      if (t !== null) {
        var i = t.memoizedProps;
        if (al(i, a) && t.ref === e.ref)
          if (((wt = !1), (e.pendingProps = a = i), jc(t, l)))
            (t.flags & 131072) !== 0 && (wt = !0);
          else return ((e.lanes = t.lanes), ke(t, e, l));
      }
      return Nc(t, e, n, a, l);
    }
    function ur(t, e, n, a) {
      var l = a.children,
        i = t !== null ? t.memoizedState : null;
      if (
        (t === null &&
          e.stateNode === null &&
          (e.stateNode = {
            _visibility: 1,
            _pendingMarkers: null,
            _retryCache: null,
            _transitions: null,
          }),
        a.mode === "hidden")
      ) {
        if ((e.flags & 128) !== 0) {
          if (((i = i !== null ? i.baseLanes | n : n), t !== null)) {
            for (a = e.child = t.child, l = 0; a !== null; )
              ((l = l | a.lanes | a.childLanes), (a = a.sibling));
            a = l & ~i;
          } else ((a = 0), (e.child = null));
          return cr(t, e, i, n, a);
        }
        if ((n & 536870912) !== 0)
          ((e.memoizedState = { baseLanes: 0, cachePool: null }),
            t !== null && di(e, i !== null ? i.cachePool : null),
            i !== null ? hf(e, i) : fc(),
            df(e));
        else
          return (
            (a = e.lanes = 536870912),
            cr(t, e, i !== null ? i.baseLanes | n : n, n, a)
          );
      } else
        i !== null
          ? (di(e, i.cachePool), hf(e, i), yn(e), (e.memoizedState = null))
          : (t !== null && di(e, null), fc(), yn(e));
      return (Xt(t, e, l, n), e.child);
    }
    function Sl(t, e) {
      return (
        (t !== null && t.tag === 22) ||
          e.stateNode !== null ||
          (e.stateNode = {
            _visibility: 1,
            _pendingMarkers: null,
            _retryCache: null,
            _transitions: null,
          }),
        e.sibling
      );
    }
    function cr(t, e, n, a, l) {
      var i = lc();
      return (
        (i = i === null ? null : { parent: qt._currentValue, pool: i }),
        (e.memoizedState = { baseLanes: n, cachePool: i }),
        t !== null && di(e, null),
        fc(),
        df(e),
        t !== null && va(t, e, a, !0),
        (e.childLanes = l),
        null
      );
    }
    function Ci(t, e) {
      return (
        (e = Di({ mode: e.mode, children: e.children }, t.mode)),
        (e.ref = t.ref),
        (t.child = e),
        (e.return = t),
        e
      );
    }
    function sr(t, e, n) {
      return (
        Gn(e, t.child, null, n),
        (t = Ci(e, e.pendingProps)),
        (t.flags |= 2),
        fe(e),
        (e.memoizedState = null),
        t
      );
    }
    function Uy(t, e, n) {
      var a = e.pendingProps,
        l = (e.flags & 128) !== 0;
      if (((e.flags &= -129), t === null)) {
        if (P) {
          if (a.mode === "hidden")
            return ((t = Ci(e, a)), (e.lanes = 536870912), Sl(null, t));
          if (
            (hc(e),
            (t = pt)
              ? ((t = Th(t, be)),
                (t = t !== null && t.data === "&" ? t : null),
                t !== null &&
                  ((e.memoizedState = {
                    dehydrated: t,
                    treeContext: sn !== null ? { id: De, overflow: we } : null,
                    retryLane: 536870912,
                    hydrationErrors: null,
                  }),
                  (n = Ko(t)),
                  (n.return = e),
                  (e.child = n),
                  (Yt = e),
                  (pt = null)))
              : (t = null),
            t === null)
          )
            throw fn(e);
          return ((e.lanes = 536870912), null);
        }
        return Ci(e, a);
      }
      var i = t.memoizedState;
      if (i !== null) {
        var s = i.dehydrated;
        if ((hc(e), l))
          if (e.flags & 256) ((e.flags &= -257), (e = sr(t, e, n)));
          else if (e.memoizedState !== null)
            ((e.child = t.child), (e.flags |= 128), (e = null));
          else throw Error(f(558));
        else if (
          (wt || va(t, e, n, !1), (l = (n & t.childLanes) !== 0), wt || l)
        ) {
          if (
            ((a = vt),
            a !== null && ((s = Is(a, n)), s !== 0 && s !== i.retryLane))
          )
            throw ((i.retryLane = s), Qn(t, s), ee(a, t, s), Uc);
          (xi(), (e = sr(t, e, n)));
        } else
          ((t = i.treeContext),
            (pt = _e(s.nextSibling)),
            (Yt = e),
            (P = !0),
            (on = null),
            (be = !1),
            t !== null && Fo(e, t),
            (e = Ci(e, a)),
            (e.flags |= 4096));
        return e;
      }
      return (
        (t = xe(t.child, { mode: a.mode, children: a.children })),
        (t.ref = e.ref),
        (e.child = t),
        (t.return = e),
        t
      );
    }
    function qi(t, e) {
      var n = e.ref;
      if (n === null) t !== null && t.ref !== null && (e.flags |= 4194816);
      else {
        if (typeof n != "function" && typeof n != "object") throw Error(f(284));
        (t === null || t.ref !== n) && (e.flags |= 4194816);
      }
    }
    function Nc(t, e, n, a, l) {
      return (
        Vn(e),
        (n = yc(t, e, n, a, void 0, l)),
        (a = gc()),
        t !== null && !wt
          ? (vc(t, e, l), ke(t, e, l))
          : (P && a && $u(e), (e.flags |= 1), Xt(t, e, n, l), e.child)
      );
    }
    function or(t, e, n, a, l, i) {
      return (
        Vn(e),
        (e.updateQueue = null),
        (n = gf(e, a, n, l)),
        yf(t),
        (a = gc()),
        t !== null && !wt
          ? (vc(t, e, i), ke(t, e, i))
          : (P && a && $u(e), (e.flags |= 1), Xt(t, e, n, i), e.child)
      );
    }
    function fr(t, e, n, a, l) {
      if ((Vn(e), e.stateNode === null)) {
        var i = ha,
          s = n.contextType;
        (typeof s == "object" && s !== null && (i = Gt(s)),
          (i = new n(a, i)),
          (e.memoizedState =
            i.state !== null && i.state !== void 0 ? i.state : null),
          (i.updater = Dc),
          (e.stateNode = i),
          (i._reactInternals = e),
          (i = e.stateNode),
          (i.props = a),
          (i.state = e.memoizedState),
          (i.refs = {}),
          uc(e),
          (s = n.contextType),
          (i.context = typeof s == "object" && s !== null ? Gt(s) : ha),
          (i.state = e.memoizedState),
          (s = n.getDerivedStateFromProps),
          typeof s == "function" &&
            (qc(e, n, s, a), (i.state = e.memoizedState)),
          typeof n.getDerivedStateFromProps == "function" ||
            typeof i.getSnapshotBeforeUpdate == "function" ||
            (typeof i.UNSAFE_componentWillMount != "function" &&
              typeof i.componentWillMount != "function") ||
            ((s = i.state),
            typeof i.componentWillMount == "function" && i.componentWillMount(),
            typeof i.UNSAFE_componentWillMount == "function" &&
              i.UNSAFE_componentWillMount(),
            s !== i.state && Dc.enqueueReplaceState(i, i.state, null),
            dl(e, a, i, l),
            hl(),
            (i.state = e.memoizedState)),
          typeof i.componentDidMount == "function" && (e.flags |= 4194308),
          (a = !0));
      } else if (t === null) {
        i = e.stateNode;
        var r = e.memoizedProps,
          d = Kn(n, r);
        i.props = d;
        var p = i.context,
          _ = n.contextType;
        ((s = ha), typeof _ == "object" && _ !== null && (s = Gt(_)));
        var M = n.getDerivedStateFromProps;
        ((_ =
          typeof M == "function" ||
          typeof i.getSnapshotBeforeUpdate == "function"),
          (r = e.pendingProps !== r),
          _ ||
            (typeof i.UNSAFE_componentWillReceiveProps != "function" &&
              typeof i.componentWillReceiveProps != "function") ||
            ((r || p !== s) && Pf(e, i, a, s)),
          (hn = !1));
        var b = e.memoizedState;
        ((i.state = b),
          dl(e, a, i, l),
          hl(),
          (p = e.memoizedState),
          r || b !== p || hn
            ? (typeof M == "function" &&
                (qc(e, n, M, a), (p = e.memoizedState)),
              (d = hn || If(e, n, d, a, b, p, s))
                ? (_ ||
                    (typeof i.UNSAFE_componentWillMount != "function" &&
                      typeof i.componentWillMount != "function") ||
                    (typeof i.componentWillMount == "function" &&
                      i.componentWillMount(),
                    typeof i.UNSAFE_componentWillMount == "function" &&
                      i.UNSAFE_componentWillMount()),
                  typeof i.componentDidMount == "function" &&
                    (e.flags |= 4194308))
                : (typeof i.componentDidMount == "function" &&
                    (e.flags |= 4194308),
                  (e.memoizedProps = a),
                  (e.memoizedState = p)),
              (i.props = a),
              (i.state = p),
              (i.context = s),
              (a = d))
            : (typeof i.componentDidMount == "function" && (e.flags |= 4194308),
              (a = !1)));
      } else {
        ((i = e.stateNode),
          cc(t, e),
          (s = e.memoizedProps),
          (_ = Kn(n, s)),
          (i.props = _),
          (M = e.pendingProps),
          (b = i.context),
          (p = n.contextType),
          (d = ha),
          typeof p == "object" && p !== null && (d = Gt(p)),
          (r = n.getDerivedStateFromProps),
          (p =
            typeof r == "function" ||
            typeof i.getSnapshotBeforeUpdate == "function") ||
            (typeof i.UNSAFE_componentWillReceiveProps != "function" &&
              typeof i.componentWillReceiveProps != "function") ||
            ((s !== M || b !== d) && Pf(e, i, a, d)),
          (hn = !1),
          (b = e.memoizedState),
          (i.state = b),
          dl(e, a, i, l),
          hl());
        var T = e.memoizedState;
        s !== M ||
        b !== T ||
        hn ||
        (t !== null && t.dependencies !== null && ri(t.dependencies))
          ? (typeof r == "function" && (qc(e, n, r, a), (T = e.memoizedState)),
            (_ =
              hn ||
              If(e, n, _, a, b, T, d) ||
              (t !== null && t.dependencies !== null && ri(t.dependencies)))
              ? (p ||
                  (typeof i.UNSAFE_componentWillUpdate != "function" &&
                    typeof i.componentWillUpdate != "function") ||
                  (typeof i.componentWillUpdate == "function" &&
                    i.componentWillUpdate(a, T, d),
                  typeof i.UNSAFE_componentWillUpdate == "function" &&
                    i.UNSAFE_componentWillUpdate(a, T, d)),
                typeof i.componentDidUpdate == "function" && (e.flags |= 4),
                typeof i.getSnapshotBeforeUpdate == "function" &&
                  (e.flags |= 1024))
              : (typeof i.componentDidUpdate != "function" ||
                  (s === t.memoizedProps && b === t.memoizedState) ||
                  (e.flags |= 4),
                typeof i.getSnapshotBeforeUpdate != "function" ||
                  (s === t.memoizedProps && b === t.memoizedState) ||
                  (e.flags |= 1024),
                (e.memoizedProps = a),
                (e.memoizedState = T)),
            (i.props = a),
            (i.state = T),
            (i.context = d),
            (a = _))
          : (typeof i.componentDidUpdate != "function" ||
              (s === t.memoizedProps && b === t.memoizedState) ||
              (e.flags |= 4),
            typeof i.getSnapshotBeforeUpdate != "function" ||
              (s === t.memoizedProps && b === t.memoizedState) ||
              (e.flags |= 1024),
            (a = !1));
      }
      return (
        (i = a),
        qi(t, e),
        (a = (e.flags & 128) !== 0),
        i || a
          ? ((i = e.stateNode),
            (n =
              a && typeof n.getDerivedStateFromError != "function"
                ? null
                : i.render()),
            (e.flags |= 1),
            t !== null && a
              ? ((e.child = Gn(e, t.child, null, l)),
                (e.child = Gn(e, null, n, l)))
              : Xt(t, e, n, l),
            (e.memoizedState = i.state),
            (t = e.child))
          : (t = ke(t, e, l)),
        t
      );
    }
    function rr(t, e, n, a) {
      return (Hn(), (e.flags |= 256), Xt(t, e, n, a), e.child);
    }
    var Qc = {
      dehydrated: null,
      treeContext: null,
      retryLane: 0,
      hydrationErrors: null,
    };
    function Bc(t) {
      return { baseLanes: t, cachePool: nf() };
    }
    function Hc(t, e, n) {
      return ((t = t !== null ? t.childLanes & ~n : 0), e && (t |= he), t);
    }
    function hr(t, e, n) {
      var a = e.pendingProps,
        l = !1,
        i = (e.flags & 128) !== 0,
        s;
      if (
        ((s = i) ||
          (s =
            t !== null && t.memoizedState === null
              ? !1
              : (Mt.current & 2) !== 0),
        s && ((l = !0), (e.flags &= -129)),
        (s = (e.flags & 32) !== 0),
        (e.flags &= -33),
        t === null)
      ) {
        if (P) {
          if (
            (l ? dn(e) : yn(e),
            (t = pt)
              ? ((t = Th(t, be)),
                (t = t !== null && t.data !== "&" ? t : null),
                t !== null &&
                  ((e.memoizedState = {
                    dehydrated: t,
                    treeContext: sn !== null ? { id: De, overflow: we } : null,
                    retryLane: 536870912,
                    hydrationErrors: null,
                  }),
                  (n = Ko(t)),
                  (n.return = e),
                  (e.child = n),
                  (Yt = e),
                  (pt = null)))
              : (t = null),
            t === null)
          )
            throw fn(e);
          return (Ss(t) ? (e.lanes = 32) : (e.lanes = 536870912), null);
        }
        var r = a.children;
        return (
          (a = a.fallback),
          l
            ? (yn(e),
              (l = e.mode),
              (r = Di({ mode: "hidden", children: r }, l)),
              (a = Bn(a, l, n, null)),
              (r.return = e),
              (a.return = e),
              (r.sibling = a),
              (e.child = r),
              (a = e.child),
              (a.memoizedState = Bc(n)),
              (a.childLanes = Hc(t, s, n)),
              (e.memoizedState = Qc),
              Sl(null, a))
            : (dn(e), Lc(e, r))
        );
      }
      var d = t.memoizedState;
      if (d !== null && ((r = d.dehydrated), r !== null)) {
        if (i)
          e.flags & 256
            ? (dn(e), (e.flags &= -257), (e = Vc(t, e, n)))
            : e.memoizedState !== null
              ? (yn(e), (e.child = t.child), (e.flags |= 128), (e = null))
              : (yn(e),
                (r = a.fallback),
                (l = e.mode),
                (a = Di({ mode: "visible", children: a.children }, l)),
                (r = Bn(r, l, n, null)),
                (r.flags |= 2),
                (a.return = e),
                (r.return = e),
                (a.sibling = r),
                (e.child = a),
                Gn(e, t.child, null, n),
                (a = e.child),
                (a.memoizedState = Bc(n)),
                (a.childLanes = Hc(t, s, n)),
                (e.memoizedState = Qc),
                (e = Sl(null, a)));
        else if ((dn(e), Ss(r))) {
          if (((s = r.nextSibling && r.nextSibling.dataset), s)) var p = s.dgst;
          ((s = p),
            (a = Error(f(419))),
            (a.stack = ""),
            (a.digest = s),
            ul({ value: a, source: null, stack: null }),
            (e = Vc(t, e, n)));
        } else if (
          (wt || va(t, e, n, !1), (s = (n & t.childLanes) !== 0), wt || s)
        ) {
          if (
            ((s = vt),
            s !== null && ((a = Is(s, n)), a !== 0 && a !== d.retryLane))
          )
            throw ((d.retryLane = a), Qn(t, a), ee(s, t, a), Uc);
          (ms(r) || xi(), (e = Vc(t, e, n)));
        } else
          ms(r)
            ? ((e.flags |= 192), (e.child = t.child), (e = null))
            : ((t = d.treeContext),
              (pt = _e(r.nextSibling)),
              (Yt = e),
              (P = !0),
              (on = null),
              (be = !1),
              t !== null && Fo(e, t),
              (e = Lc(e, a.children)),
              (e.flags |= 4096));
        return e;
      }
      return l
        ? (yn(e),
          (r = a.fallback),
          (l = e.mode),
          (d = t.child),
          (p = d.sibling),
          (a = xe(d, { mode: "hidden", children: a.children })),
          (a.subtreeFlags = d.subtreeFlags & 65011712),
          p !== null
            ? (r = xe(p, r))
            : ((r = Bn(r, l, n, null)), (r.flags |= 2)),
          (r.return = e),
          (a.return = e),
          (a.sibling = r),
          (e.child = a),
          Sl(null, a),
          (a = e.child),
          (r = t.child.memoizedState),
          r === null
            ? (r = Bc(n))
            : ((l = r.cachePool),
              l !== null
                ? ((d = qt._currentValue),
                  (l = l.parent !== d ? { parent: d, pool: d } : l))
                : (l = nf()),
              (r = { baseLanes: r.baseLanes | n, cachePool: l })),
          (a.memoizedState = r),
          (a.childLanes = Hc(t, s, n)),
          (e.memoizedState = Qc),
          Sl(t.child, a))
        : (dn(e),
          (n = t.child),
          (t = n.sibling),
          (n = xe(n, { mode: "visible", children: a.children })),
          (n.return = e),
          (n.sibling = null),
          t !== null &&
            ((s = e.deletions),
            s === null ? ((e.deletions = [t]), (e.flags |= 16)) : s.push(t)),
          (e.child = n),
          (e.memoizedState = null),
          n);
    }
    function Lc(t, e) {
      return (
        (e = Di({ mode: "visible", children: e }, t.mode)),
        (e.return = t),
        (t.child = e)
      );
    }
    function Di(t, e) {
      return ((t = se(22, t, null, e)), (t.lanes = 0), t);
    }
    function Vc(t, e, n) {
      return (
        Gn(e, t.child, null, n),
        (t = Lc(e, e.pendingProps.children)),
        (t.flags |= 2),
        (e.memoizedState = null),
        t
      );
    }
    function dr(t, e, n) {
      t.lanes |= e;
      var a = t.alternate;
      (a !== null && (a.lanes |= e), tc(t.return, e, n));
    }
    function xc(t, e, n, a, l, i) {
      var s = t.memoizedState;
      s === null
        ? (t.memoizedState = {
            isBackwards: e,
            rendering: null,
            renderingStartTime: 0,
            last: a,
            tail: n,
            tailMode: l,
            treeForkCount: i,
          })
        : ((s.isBackwards = e),
          (s.rendering = null),
          (s.renderingStartTime = 0),
          (s.last = a),
          (s.tail = n),
          (s.tailMode = l),
          (s.treeForkCount = i));
    }
    function yr(t, e, n) {
      var a = e.pendingProps,
        l = a.revealOrder,
        i = a.tail;
      a = a.children;
      var s = Mt.current,
        r = (s & 2) !== 0;
      if (
        (r ? ((s = (s & 1) | 2), (e.flags |= 128)) : (s &= 1),
        w(Mt, s),
        Xt(t, e, a, n),
        (a = P ? il : 0),
        !r && t !== null && (t.flags & 128) !== 0)
      )
        t: for (t = e.child; t !== null; ) {
          if (t.tag === 13) t.memoizedState !== null && dr(t, n, e);
          else if (t.tag === 19) dr(t, n, e);
          else if (t.child !== null) {
            ((t.child.return = t), (t = t.child));
            continue;
          }
          if (t === e) break t;
          for (; t.sibling === null; ) {
            if (t.return === null || t.return === e) break t;
            t = t.return;
          }
          ((t.sibling.return = t.return), (t = t.sibling));
        }
      switch (l) {
        case "forwards":
          for (n = e.child, l = null; n !== null; )
            ((t = n.alternate),
              t !== null && pi(t) === null && (l = n),
              (n = n.sibling));
          ((n = l),
            n === null
              ? ((l = e.child), (e.child = null))
              : ((l = n.sibling), (n.sibling = null)),
            xc(e, !1, l, n, i, a));
          break;
        case "backwards":
        case "unstable_legacy-backwards":
          for (n = null, l = e.child, e.child = null; l !== null; ) {
            if (((t = l.alternate), t !== null && pi(t) === null)) {
              e.child = l;
              break;
            }
            ((t = l.sibling), (l.sibling = n), (n = l), (l = t));
          }
          xc(e, !0, n, null, i, a);
          break;
        case "together":
          xc(e, !1, null, null, void 0, a);
          break;
        default:
          e.memoizedState = null;
      }
      return e.child;
    }
    function ke(t, e, n) {
      if (
        (t !== null && (e.dependencies = t.dependencies),
        (mn |= e.lanes),
        (n & e.childLanes) === 0)
      )
        if (t !== null) {
          if ((va(t, e, n, !1), (n & e.childLanes) === 0)) return null;
        } else return null;
      if (t !== null && e.child !== t.child) throw Error(f(153));
      if (e.child !== null) {
        for (
          t = e.child, n = xe(t, t.pendingProps), e.child = n, n.return = e;
          t.sibling !== null;
        )
          ((t = t.sibling),
            (n = n.sibling = xe(t, t.pendingProps)),
            (n.return = e));
        n.sibling = null;
      }
      return e.child;
    }
    function jc(t, e) {
      return (t.lanes & e) !== 0
        ? !0
        : ((t = t.dependencies), !!(t !== null && ri(t)));
    }
    function Ny(t, e, n) {
      switch (e.tag) {
        case 3:
          (Kt(e, e.stateNode.containerInfo),
            rn(e, qt, t.memoizedState.cache),
            Hn());
          break;
        case 27:
        case 5:
          Xa(e);
          break;
        case 4:
          Kt(e, e.stateNode.containerInfo);
          break;
        case 10:
          rn(e, e.type, e.memoizedProps.value);
          break;
        case 31:
          if (e.memoizedState !== null) return ((e.flags |= 128), hc(e), null);
          break;
        case 13:
          var a = e.memoizedState;
          if (a !== null)
            return a.dehydrated !== null
              ? (dn(e), (e.flags |= 128), null)
              : (n & e.child.childLanes) !== 0
                ? hr(t, e, n)
                : (dn(e), (t = ke(t, e, n)), t !== null ? t.sibling : null);
          dn(e);
          break;
        case 19:
          var l = (t.flags & 128) !== 0;
          if (
            ((a = (n & e.childLanes) !== 0),
            a || (va(t, e, n, !1), (a = (n & e.childLanes) !== 0)),
            l)
          ) {
            if (a) return yr(t, e, n);
            e.flags |= 128;
          }
          if (
            ((l = e.memoizedState),
            l !== null &&
              ((l.rendering = null), (l.tail = null), (l.lastEffect = null)),
            w(Mt, Mt.current),
            a)
          )
            break;
          return null;
        case 22:
          return ((e.lanes = 0), ur(t, e, n, e.pendingProps));
        case 24:
          rn(e, qt, t.memoizedState.cache);
      }
      return ke(t, e, n);
    }
    function gr(t, e, n) {
      if (t !== null)
        if (t.memoizedProps !== e.pendingProps) wt = !0;
        else {
          if (!jc(t, n) && (e.flags & 128) === 0)
            return ((wt = !1), Ny(t, e, n));
          wt = (t.flags & 131072) !== 0;
        }
      else ((wt = !1), P && (e.flags & 1048576) !== 0 && $o(e, il, e.index));
      switch (((e.lanes = 0), e.tag)) {
        case 16:
          t: {
            var a = e.pendingProps;
            if (((t = jn(e.elementType)), (e.type = t), typeof t == "function"))
              ku(t)
                ? ((a = Kn(t, a)), (e.tag = 1), (e = fr(null, e, t, a, n)))
                : ((e.tag = 0), (e = Nc(null, e, t, a, n)));
            else {
              if (t != null) {
                var l = t.$$typeof;
                if (l === mt) {
                  ((e.tag = 11), (e = ar(null, e, t, a, n)));
                  break t;
                } else if (l === X) {
                  ((e.tag = 14), (e = lr(null, e, t, a, n)));
                  break t;
                }
              }
              throw ((e = Re(t) || t), Error(f(306, e, "")));
            }
          }
          return e;
        case 0:
          return Nc(t, e, e.type, e.pendingProps, n);
        case 1:
          return ((a = e.type), (l = Kn(a, e.pendingProps)), fr(t, e, a, l, n));
        case 3:
          t: {
            if ((Kt(e, e.stateNode.containerInfo), t === null))
              throw Error(f(387));
            a = e.pendingProps;
            var i = e.memoizedState;
            ((l = i.element), cc(t, e), dl(e, a, null, n));
            var s = e.memoizedState;
            if (
              ((a = s.cache),
              rn(e, qt, a),
              a !== i.cache && ec(e, [qt], n, !0),
              hl(),
              (a = s.element),
              i.isDehydrated)
            )
              if (
                ((i = { element: a, isDehydrated: !1, cache: s.cache }),
                (e.updateQueue.baseState = i),
                (e.memoizedState = i),
                e.flags & 256)
              ) {
                e = rr(t, e, a, n);
                break t;
              } else if (a !== l) {
                ((l = me(Error(f(424)), e)), ul(l), (e = rr(t, e, a, n)));
                break t;
              } else {
                switch (((t = e.stateNode.containerInfo), t.nodeType)) {
                  case 9:
                    t = t.body;
                    break;
                  default:
                    t = t.nodeName === "HTML" ? t.ownerDocument.body : t;
                }
                for (
                  pt = _e(t.firstChild),
                    Yt = e,
                    P = !0,
                    on = null,
                    be = !0,
                    n = of(e, null, a, n),
                    e.child = n;
                  n;
                )
                  ((n.flags = (n.flags & -3) | 4096), (n = n.sibling));
              }
            else {
              if ((Hn(), a === l)) {
                e = ke(t, e, n);
                break t;
              }
              Xt(t, e, a, n);
            }
            e = e.child;
          }
          return e;
        case 26:
          return (
            qi(t, e),
            t === null
              ? (n = Rh(e.type, null, e.pendingProps, null))
                ? (e.memoizedState = n)
                : P ||
                  ((n = e.type),
                  (t = e.pendingProps),
                  (a = Ki(J.current).createElement(n)),
                  (a[jt] = e),
                  (a[$t] = t),
                  Zt(a, n, t),
                  Ht(a),
                  (e.stateNode = a))
              : (e.memoizedState = Rh(
                  e.type,
                  t.memoizedProps,
                  e.pendingProps,
                  t.memoizedState,
                )),
            null
          );
        case 27:
          return (
            Xa(e),
            t === null &&
              P &&
              ((a = e.stateNode = Eh(e.type, e.pendingProps, J.current)),
              (Yt = e),
              (be = !0),
              (l = pt),
              An(e.type) ? ((ps = l), (pt = _e(a.firstChild))) : (pt = l)),
            Xt(t, e, e.pendingProps.children, n),
            qi(t, e),
            t === null && (e.flags |= 4194304),
            e.child
          );
        case 5:
          return (
            t === null &&
              P &&
              ((l = a = pt) &&
                ((a = sg(a, e.type, e.pendingProps, be)),
                a !== null
                  ? ((e.stateNode = a),
                    (Yt = e),
                    (pt = _e(a.firstChild)),
                    (be = !1),
                    (l = !0))
                  : (l = !1)),
              l || fn(e)),
            Xa(e),
            (l = e.type),
            (i = e.pendingProps),
            (s = t !== null ? t.memoizedProps : null),
            (a = i.children),
            ys(l, i) ? (a = null) : s !== null && ys(l, s) && (e.flags |= 32),
            e.memoizedState !== null &&
              ((l = yc(t, e, Ay, null, null, n)), (Ul._currentValue = l)),
            qi(t, e),
            Xt(t, e, a, n),
            e.child
          );
        case 6:
          return (
            t === null &&
              P &&
              ((t = n = pt) &&
                ((n = og(n, e.pendingProps, be)),
                n !== null
                  ? ((e.stateNode = n), (Yt = e), (pt = null), (t = !0))
                  : (t = !1)),
              t || fn(e)),
            null
          );
        case 13:
          return hr(t, e, n);
        case 4:
          return (
            Kt(e, e.stateNode.containerInfo),
            (a = e.pendingProps),
            t === null ? (e.child = Gn(e, null, a, n)) : Xt(t, e, a, n),
            e.child
          );
        case 11:
          return ar(t, e, e.type, e.pendingProps, n);
        case 7:
          return (Xt(t, e, e.pendingProps, n), e.child);
        case 8:
          return (Xt(t, e, e.pendingProps.children, n), e.child);
        case 12:
          return (Xt(t, e, e.pendingProps.children, n), e.child);
        case 10:
          return (
            (a = e.pendingProps),
            rn(e, e.type, a.value),
            Xt(t, e, a.children, n),
            e.child
          );
        case 9:
          return (
            (l = e.type._context),
            (a = e.pendingProps.children),
            Vn(e),
            (l = Gt(l)),
            (a = a(l)),
            (e.flags |= 1),
            Xt(t, e, a, n),
            e.child
          );
        case 14:
          return lr(t, e, e.type, e.pendingProps, n);
        case 15:
          return ir(t, e, e.type, e.pendingProps, n);
        case 19:
          return yr(t, e, n);
        case 31:
          return Uy(t, e, n);
        case 22:
          return ur(t, e, n, e.pendingProps);
        case 24:
          return (
            Vn(e),
            (a = Gt(qt)),
            t === null
              ? ((l = lc()),
                l === null &&
                  ((l = vt),
                  (i = nc()),
                  (l.pooledCache = i),
                  i.refCount++,
                  i !== null && (l.pooledCacheLanes |= n),
                  (l = i)),
                (e.memoizedState = { parent: a, cache: l }),
                uc(e),
                rn(e, qt, l))
              : ((t.lanes & n) !== 0 && (cc(t, e), dl(e, null, null, n), hl()),
                (l = t.memoizedState),
                (i = e.memoizedState),
                l.parent !== a
                  ? ((l = { parent: a, cache: a }),
                    (e.memoizedState = l),
                    e.lanes === 0 &&
                      (e.memoizedState = e.updateQueue.baseState = l),
                    rn(e, qt, a))
                  : ((a = i.cache),
                    rn(e, qt, a),
                    a !== l.cache && ec(e, [qt], n, !0))),
            Xt(t, e, e.pendingProps.children, n),
            e.child
          );
        case 29:
          throw e.pendingProps;
      }
      throw Error(f(156, e.tag));
    }
    function Ke(t) {
      t.flags |= 4;
    }
    function Yc(t, e, n, a, l) {
      if (((e = (t.mode & 32) !== 0) && (e = !1), e)) {
        if (((t.flags |= 16777216), (l & 335544128) === l))
          if (t.stateNode.complete) t.flags |= 8192;
          else if (Yr()) t.flags |= 8192;
          else throw ((Yn = gi), ic);
      } else t.flags &= -16777217;
    }
    function vr(t, e) {
      if (e.type !== "stylesheet" || (e.state.loading & 4) !== 0)
        t.flags &= -16777217;
      else if (((t.flags |= 16777216), !wh(e)))
        if (Yr()) t.flags |= 8192;
        else throw ((Yn = gi), ic);
    }
    function wi(t, e) {
      (e !== null && (t.flags |= 4),
        t.flags & 16384 &&
          ((e = t.tag !== 22 ? $s() : 536870912), (t.lanes |= e), (za |= e)));
    }
    function pl(t, e) {
      if (!P)
        switch (t.tailMode) {
          case "hidden":
            e = t.tail;
            for (var n = null; e !== null; )
              (e.alternate !== null && (n = e), (e = e.sibling));
            n === null ? (t.tail = null) : (n.sibling = null);
            break;
          case "collapsed":
            n = t.tail;
            for (var a = null; n !== null; )
              (n.alternate !== null && (a = n), (n = n.sibling));
            a === null
              ? e || t.tail === null
                ? (t.tail = null)
                : (t.tail.sibling = null)
              : (a.sibling = null);
        }
    }
    function bt(t) {
      var e = t.alternate !== null && t.alternate.child === t.child,
        n = 0,
        a = 0;
      if (e)
        for (var l = t.child; l !== null; )
          ((n |= l.lanes | l.childLanes),
            (a |= l.subtreeFlags & 65011712),
            (a |= l.flags & 65011712),
            (l.return = t),
            (l = l.sibling));
      else
        for (l = t.child; l !== null; )
          ((n |= l.lanes | l.childLanes),
            (a |= l.subtreeFlags),
            (a |= l.flags),
            (l.return = t),
            (l = l.sibling));
      return ((t.subtreeFlags |= a), (t.childLanes = n), e);
    }
    function Qy(t, e, n) {
      var a = e.pendingProps;
      switch ((Fu(e), e.tag)) {
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14:
          return (bt(e), null);
        case 1:
          return (bt(e), null);
        case 3:
          return (
            (n = e.stateNode),
            (a = null),
            t !== null && (a = t.memoizedState.cache),
            e.memoizedState.cache !== a && (e.flags |= 2048),
            Ge(qt),
            Ot(),
            n.pendingContext &&
              ((n.context = n.pendingContext), (n.pendingContext = null)),
            (t === null || t.child === null) &&
              (ga(e)
                ? Ke(e)
                : t === null ||
                  (t.memoizedState.isDehydrated && (e.flags & 256) === 0) ||
                  ((e.flags |= 1024), Iu())),
            bt(e),
            null
          );
        case 26:
          var l = e.type,
            i = e.memoizedState;
          return (
            t === null
              ? (Ke(e),
                i !== null ? (bt(e), vr(e, i)) : (bt(e), Yc(e, l, null, a, n)))
              : i
                ? i !== t.memoizedState
                  ? (Ke(e), bt(e), vr(e, i))
                  : (bt(e), (e.flags &= -16777217))
                : ((t = t.memoizedProps),
                  t !== a && Ke(e),
                  bt(e),
                  Yc(e, l, t, a, n)),
            null
          );
        case 27:
          if (
            (Yl(e),
            (n = J.current),
            (l = e.type),
            t !== null && e.stateNode != null)
          )
            t.memoizedProps !== a && Ke(e);
          else {
            if (!a) {
              if (e.stateNode === null) throw Error(f(166));
              return (bt(e), null);
            }
            ((t = L.current),
              ga(e) ? Wo(e, t) : ((t = Eh(l, a, n)), (e.stateNode = t), Ke(e)));
          }
          return (bt(e), null);
        case 5:
          if ((Yl(e), (l = e.type), t !== null && e.stateNode != null))
            t.memoizedProps !== a && Ke(e);
          else {
            if (!a) {
              if (e.stateNode === null) throw Error(f(166));
              return (bt(e), null);
            }
            if (((i = L.current), ga(e))) Wo(e, i);
            else {
              var s = Ki(J.current);
              switch (i) {
                case 1:
                  i = s.createElementNS("http://www.w3.org/2000/svg", l);
                  break;
                case 2:
                  i = s.createElementNS(
                    "http://www.w3.org/1998/Math/MathML",
                    l,
                  );
                  break;
                default:
                  switch (l) {
                    case "svg":
                      i = s.createElementNS("http://www.w3.org/2000/svg", l);
                      break;
                    case "math":
                      i = s.createElementNS(
                        "http://www.w3.org/1998/Math/MathML",
                        l,
                      );
                      break;
                    case "script":
                      ((i = s.createElement("div")),
                        (i.innerHTML = "<script><\/script>"),
                        (i = i.removeChild(i.firstChild)));
                      break;
                    case "select":
                      ((i =
                        typeof a.is == "string"
                          ? s.createElement("select", { is: a.is })
                          : s.createElement("select")),
                        a.multiple
                          ? (i.multiple = !0)
                          : a.size && (i.size = a.size));
                      break;
                    default:
                      i =
                        typeof a.is == "string"
                          ? s.createElement(l, { is: a.is })
                          : s.createElement(l);
                  }
              }
              ((i[jt] = e), (i[$t] = a));
              t: for (s = e.child; s !== null; ) {
                if (s.tag === 5 || s.tag === 6) i.appendChild(s.stateNode);
                else if (s.tag !== 4 && s.tag !== 27 && s.child !== null) {
                  ((s.child.return = s), (s = s.child));
                  continue;
                }
                if (s === e) break t;
                for (; s.sibling === null; ) {
                  if (s.return === null || s.return === e) break t;
                  s = s.return;
                }
                ((s.sibling.return = s.return), (s = s.sibling));
              }
              e.stateNode = i;
              t: switch ((Zt(i, l, a), l)) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  a = !!a.autoFocus;
                  break t;
                case "img":
                  a = !0;
                  break t;
                default:
                  a = !1;
              }
              a && Ke(e);
            }
          }
          return (
            bt(e),
            Yc(
              e,
              e.type,
              t === null ? null : t.memoizedProps,
              e.pendingProps,
              n,
            ),
            null
          );
        case 6:
          if (t && e.stateNode != null) t.memoizedProps !== a && Ke(e);
          else {
            if (typeof a != "string" && e.stateNode === null)
              throw Error(f(166));
            if (((t = J.current), ga(e))) {
              if (
                ((t = e.stateNode),
                (n = e.memoizedProps),
                (a = null),
                (l = Yt),
                l !== null)
              )
                switch (l.tag) {
                  case 27:
                  case 5:
                    a = l.memoizedProps;
                }
              ((t[jt] = e),
                (t = !!(
                  t.nodeValue === n ||
                  (a !== null && a.suppressHydrationWarning === !0) ||
                  dh(t.nodeValue, n)
                )),
                t || fn(e, !0));
            } else
              ((t = Ki(t).createTextNode(a)), (t[jt] = e), (e.stateNode = t));
          }
          return (bt(e), null);
        case 31:
          if (((n = e.memoizedState), t === null || t.memoizedState !== null)) {
            if (((a = ga(e)), n !== null)) {
              if (t === null) {
                if (!a) throw Error(f(318));
                if (
                  ((t = e.memoizedState),
                  (t = t !== null ? t.dehydrated : null),
                  !t)
                )
                  throw Error(f(557));
                t[jt] = e;
              } else
                (Hn(),
                  (e.flags & 128) === 0 && (e.memoizedState = null),
                  (e.flags |= 4));
              (bt(e), (t = !1));
            } else
              ((n = Iu()),
                t !== null &&
                  t.memoizedState !== null &&
                  (t.memoizedState.hydrationErrors = n),
                (t = !0));
            if (!t) return e.flags & 256 ? (fe(e), e) : (fe(e), null);
            if ((e.flags & 128) !== 0) throw Error(f(558));
          }
          return (bt(e), null);
        case 13:
          if (
            ((a = e.memoizedState),
            t === null ||
              (t.memoizedState !== null && t.memoizedState.dehydrated !== null))
          ) {
            if (((l = ga(e)), a !== null && a.dehydrated !== null)) {
              if (t === null) {
                if (!l) throw Error(f(318));
                if (
                  ((l = e.memoizedState),
                  (l = l !== null ? l.dehydrated : null),
                  !l)
                )
                  throw Error(f(317));
                l[jt] = e;
              } else
                (Hn(),
                  (e.flags & 128) === 0 && (e.memoizedState = null),
                  (e.flags |= 4));
              (bt(e), (l = !1));
            } else
              ((l = Iu()),
                t !== null &&
                  t.memoizedState !== null &&
                  (t.memoizedState.hydrationErrors = l),
                (l = !0));
            if (!l) return e.flags & 256 ? (fe(e), e) : (fe(e), null);
          }
          return (
            fe(e),
            (e.flags & 128) !== 0
              ? ((e.lanes = n), e)
              : ((n = a !== null),
                (t = t !== null && t.memoizedState !== null),
                n &&
                  ((a = e.child),
                  (l = null),
                  a.alternate !== null &&
                    a.alternate.memoizedState !== null &&
                    a.alternate.memoizedState.cachePool !== null &&
                    (l = a.alternate.memoizedState.cachePool.pool),
                  (i = null),
                  a.memoizedState !== null &&
                    a.memoizedState.cachePool !== null &&
                    (i = a.memoizedState.cachePool.pool),
                  i !== l && (a.flags |= 2048)),
                n !== t && n && (e.child.flags |= 8192),
                wi(e, e.updateQueue),
                bt(e),
                null)
          );
        case 4:
          return (
            Ot(),
            t === null && oh(e.stateNode.containerInfo),
            bt(e),
            null
          );
        case 10:
          return (Ge(e.type), bt(e), null);
        case 19:
          if ((R(Mt), (a = e.memoizedState), a === null)) return (bt(e), null);
          if (((l = (e.flags & 128) !== 0), (i = a.rendering), i === null))
            if (l) pl(a, !1);
            else {
              if (Et !== 0 || (t !== null && (t.flags & 128) !== 0))
                for (t = e.child; t !== null; ) {
                  if (((i = pi(t)), i !== null)) {
                    for (
                      e.flags |= 128,
                        pl(a, !1),
                        t = i.updateQueue,
                        e.updateQueue = t,
                        wi(e, t),
                        e.subtreeFlags = 0,
                        t = n,
                        n = e.child;
                      n !== null;
                    )
                      (ko(n, t), (n = n.sibling));
                    return (
                      w(Mt, (Mt.current & 1) | 2),
                      P && je(e, a.treeForkCount),
                      e.child
                    );
                  }
                  t = t.sibling;
                }
              a.tail !== null &&
                le() > Hi &&
                ((e.flags |= 128), (l = !0), pl(a, !1), (e.lanes = 4194304));
            }
          else {
            if (!l)
              if (((t = pi(i)), t !== null)) {
                if (
                  ((e.flags |= 128),
                  (l = !0),
                  (t = t.updateQueue),
                  (e.updateQueue = t),
                  wi(e, t),
                  pl(a, !0),
                  a.tail === null &&
                    a.tailMode === "hidden" &&
                    !i.alternate &&
                    !P)
                )
                  return (bt(e), null);
              } else
                2 * le() - a.renderingStartTime > Hi &&
                  n !== 536870912 &&
                  ((e.flags |= 128), (l = !0), pl(a, !1), (e.lanes = 4194304));
            a.isBackwards
              ? ((i.sibling = e.child), (e.child = i))
              : ((t = a.last),
                t !== null ? (t.sibling = i) : (e.child = i),
                (a.last = i));
          }
          return a.tail !== null
            ? ((t = a.tail),
              (a.rendering = t),
              (a.tail = t.sibling),
              (a.renderingStartTime = le()),
              (t.sibling = null),
              (n = Mt.current),
              w(Mt, l ? (n & 1) | 2 : n & 1),
              P && je(e, a.treeForkCount),
              t)
            : (bt(e), null);
        case 22:
        case 23:
          return (
            fe(e),
            rc(),
            (a = e.memoizedState !== null),
            t !== null
              ? (t.memoizedState !== null) !== a && (e.flags |= 8192)
              : a && (e.flags |= 8192),
            a
              ? (n & 536870912) !== 0 &&
                (e.flags & 128) === 0 &&
                (bt(e), e.subtreeFlags & 6 && (e.flags |= 8192))
              : bt(e),
            (n = e.updateQueue),
            n !== null && wi(e, n.retryQueue),
            (n = null),
            t !== null &&
              t.memoizedState !== null &&
              t.memoizedState.cachePool !== null &&
              (n = t.memoizedState.cachePool.pool),
            (a = null),
            e.memoizedState !== null &&
              e.memoizedState.cachePool !== null &&
              (a = e.memoizedState.cachePool.pool),
            a !== n && (e.flags |= 2048),
            t !== null && R(xn),
            null
          );
        case 24:
          return (
            (n = null),
            t !== null && (n = t.memoizedState.cache),
            e.memoizedState.cache !== n && (e.flags |= 2048),
            Ge(qt),
            bt(e),
            null
          );
        case 25:
          return null;
        case 30:
          return null;
      }
      throw Error(f(156, e.tag));
    }
    function By(t, e) {
      switch ((Fu(e), e.tag)) {
        case 1:
          return (
            (t = e.flags),
            t & 65536 ? ((e.flags = (t & -65537) | 128), e) : null
          );
        case 3:
          return (
            Ge(qt),
            Ot(),
            (t = e.flags),
            (t & 65536) !== 0 && (t & 128) === 0
              ? ((e.flags = (t & -65537) | 128), e)
              : null
          );
        case 26:
        case 27:
        case 5:
          return (Yl(e), null);
        case 31:
          if (e.memoizedState !== null) {
            if ((fe(e), e.alternate === null)) throw Error(f(340));
            Hn();
          }
          return (
            (t = e.flags),
            t & 65536 ? ((e.flags = (t & -65537) | 128), e) : null
          );
        case 13:
          if (
            (fe(e), (t = e.memoizedState), t !== null && t.dehydrated !== null)
          ) {
            if (e.alternate === null) throw Error(f(340));
            Hn();
          }
          return (
            (t = e.flags),
            t & 65536 ? ((e.flags = (t & -65537) | 128), e) : null
          );
        case 19:
          return (R(Mt), null);
        case 4:
          return (Ot(), null);
        case 10:
          return (Ge(e.type), null);
        case 22:
        case 23:
          return (
            fe(e),
            rc(),
            t !== null && R(xn),
            (t = e.flags),
            t & 65536 ? ((e.flags = (t & -65537) | 128), e) : null
          );
        case 24:
          return (Ge(qt), null);
        case 25:
          return null;
        default:
          return null;
      }
    }
    function mr(t, e) {
      switch ((Fu(e), e.tag)) {
        case 3:
          (Ge(qt), Ot());
          break;
        case 26:
        case 27:
        case 5:
          Yl(e);
          break;
        case 4:
          Ot();
          break;
        case 31:
          e.memoizedState !== null && fe(e);
          break;
        case 13:
          fe(e);
          break;
        case 19:
          R(Mt);
          break;
        case 10:
          Ge(e.type);
          break;
        case 22:
        case 23:
          (fe(e), rc(), t !== null && R(xn));
          break;
        case 24:
          Ge(qt);
      }
    }
    function bl(t, e) {
      try {
        var n = e.updateQueue,
          a = n !== null ? n.lastEffect : null;
        if (a !== null) {
          var l = a.next;
          n = l;
          do {
            if ((n.tag & t) === t) {
              a = void 0;
              var i = n.create,
                s = n.inst;
              ((a = i()), (s.destroy = a));
            }
            n = n.next;
          } while (n !== l);
        }
      } catch (r) {
        ot(e, e.return, r);
      }
    }
    function gn(t, e, n) {
      try {
        var a = e.updateQueue,
          l = a !== null ? a.lastEffect : null;
        if (l !== null) {
          var i = l.next;
          a = i;
          do {
            if ((a.tag & t) === t) {
              var s = a.inst,
                r = s.destroy;
              if (r !== void 0) {
                ((s.destroy = void 0), (l = e));
                var d = n,
                  p = r;
                try {
                  p();
                } catch (_) {
                  ot(l, d, _);
                }
              }
            }
            a = a.next;
          } while (a !== i);
        }
      } catch (_) {
        ot(e, e.return, _);
      }
    }
    function Sr(t) {
      var e = t.updateQueue;
      if (e !== null) {
        var n = t.stateNode;
        try {
          rf(e, n);
        } catch (a) {
          ot(t, t.return, a);
        }
      }
    }
    function pr(t, e, n) {
      ((n.props = Kn(t.type, t.memoizedProps)), (n.state = t.memoizedState));
      try {
        n.componentWillUnmount();
      } catch (a) {
        ot(t, e, a);
      }
    }
    function Tl(t, e) {
      try {
        var n = t.ref;
        if (n !== null) {
          switch (t.tag) {
            case 26:
            case 27:
            case 5:
              var a = t.stateNode;
              break;
            case 30:
              a = t.stateNode;
              break;
            default:
              a = t.stateNode;
          }
          typeof n == "function" ? (t.refCleanup = n(a)) : (n.current = a);
        }
      } catch (l) {
        ot(t, e, l);
      }
    }
    function Ue(t, e) {
      var n = t.ref,
        a = t.refCleanup;
      if (n !== null)
        if (typeof a == "function")
          try {
            a();
          } catch (l) {
            ot(t, e, l);
          } finally {
            ((t.refCleanup = null),
              (t = t.alternate),
              t != null && (t.refCleanup = null));
          }
        else if (typeof n == "function")
          try {
            n(null);
          } catch (l) {
            ot(t, e, l);
          }
        else n.current = null;
    }
    function br(t) {
      var e = t.type,
        n = t.memoizedProps,
        a = t.stateNode;
      try {
        t: switch (e) {
          case "button":
          case "input":
          case "select":
          case "textarea":
            n.autoFocus && a.focus();
            break t;
          case "img":
            n.src ? (a.src = n.src) : n.srcSet && (a.srcset = n.srcSet);
        }
      } catch (l) {
        ot(t, t.return, l);
      }
    }
    function Gc(t, e, n) {
      try {
        var a = t.stateNode;
        (ng(a, t.type, n, e), (a[$t] = e));
      } catch (l) {
        ot(t, t.return, l);
      }
    }
    function Tr(t) {
      return (
        t.tag === 5 ||
        t.tag === 3 ||
        t.tag === 26 ||
        (t.tag === 27 && An(t.type)) ||
        t.tag === 4
      );
    }
    function Xc(t) {
      t: for (;;) {
        for (; t.sibling === null; ) {
          if (t.return === null || Tr(t.return)) return null;
          t = t.return;
        }
        for (
          t.sibling.return = t.return, t = t.sibling;
          t.tag !== 5 && t.tag !== 6 && t.tag !== 18;
        ) {
          if (
            (t.tag === 27 && An(t.type)) ||
            t.flags & 2 ||
            t.child === null ||
            t.tag === 4
          )
            continue t;
          ((t.child.return = t), (t = t.child));
        }
        if (!(t.flags & 2)) return t.stateNode;
      }
    }
    function Zc(t, e, n) {
      var a = t.tag;
      if (a === 5 || a === 6)
        ((t = t.stateNode),
          e
            ? (n.nodeType === 9
                ? n.body
                : n.nodeName === "HTML"
                  ? n.ownerDocument.body
                  : n
              ).insertBefore(t, e)
            : ((e =
                n.nodeType === 9
                  ? n.body
                  : n.nodeName === "HTML"
                    ? n.ownerDocument.body
                    : n),
              e.appendChild(t),
              (n = n._reactRootContainer),
              n != null || e.onclick !== null || (e.onclick = Le)));
      else if (
        a !== 4 &&
        (a === 27 && An(t.type) && ((n = t.stateNode), (e = null)),
        (t = t.child),
        t !== null)
      )
        for (Zc(t, e, n), t = t.sibling; t !== null; )
          (Zc(t, e, n), (t = t.sibling));
    }
    function Ui(t, e, n) {
      var a = t.tag;
      if (a === 5 || a === 6)
        ((t = t.stateNode), e ? n.insertBefore(t, e) : n.appendChild(t));
      else if (
        a !== 4 &&
        (a === 27 && An(t.type) && (n = t.stateNode), (t = t.child), t !== null)
      )
        for (Ui(t, e, n), t = t.sibling; t !== null; )
          (Ui(t, e, n), (t = t.sibling));
    }
    function Ar(t) {
      var e = t.stateNode,
        n = t.memoizedProps;
      try {
        for (var a = t.type, l = e.attributes; l.length; )
          e.removeAttributeNode(l[0]);
        (Zt(e, a, n), (e[jt] = t), (e[$t] = n));
      } catch (i) {
        ot(t, t.return, i);
      }
    }
    var Je = !1,
      Ut = !1,
      kc = !1,
      _r = typeof WeakSet == "function" ? WeakSet : Set,
      Lt = null;
    function Hy(t, e) {
      if (((t = t.containerInfo), (hs = tu), (t = Ho(t)), Vu(t))) {
        if ("selectionStart" in t)
          var n = { start: t.selectionStart, end: t.selectionEnd };
        else
          t: {
            n = ((n = t.ownerDocument) && n.defaultView) || window;
            var a = n.getSelection && n.getSelection();
            if (a && a.rangeCount !== 0) {
              n = a.anchorNode;
              var l = a.anchorOffset,
                i = a.focusNode;
              a = a.focusOffset;
              try {
                (n.nodeType, i.nodeType);
              } catch {
                n = null;
                break t;
              }
              var s = 0,
                r = -1,
                d = -1,
                p = 0,
                _ = 0,
                M = t,
                b = null;
              e: for (;;) {
                for (
                  var T;
                  M !== n || (l !== 0 && M.nodeType !== 3) || (r = s + l),
                    M !== i || (a !== 0 && M.nodeType !== 3) || (d = s + a),
                    M.nodeType === 3 && (s += M.nodeValue.length),
                    (T = M.firstChild) !== null;
                )
                  ((b = M), (M = T));
                for (;;) {
                  if (M === t) break e;
                  if (
                    (b === n && ++p === l && (r = s),
                    b === i && ++_ === a && (d = s),
                    (T = M.nextSibling) !== null)
                  )
                    break;
                  ((M = b), (b = M.parentNode));
                }
                M = T;
              }
              n = r === -1 || d === -1 ? null : { start: r, end: d };
            } else n = null;
          }
        n = n || { start: 0, end: 0 };
      } else n = null;
      for (
        ds = { focusedElem: t, selectionRange: n }, tu = !1, Lt = e;
        Lt !== null;
      )
        if (
          ((e = Lt), (t = e.child), (e.subtreeFlags & 1028) !== 0 && t !== null)
        )
          ((t.return = e), (Lt = t));
        else
          for (; Lt !== null; ) {
            switch (((e = Lt), (i = e.alternate), (t = e.flags), e.tag)) {
              case 0:
                if (
                  (t & 4) !== 0 &&
                  ((t = e.updateQueue),
                  (t = t !== null ? t.events : null),
                  t !== null)
                )
                  for (n = 0; n < t.length; n++)
                    ((l = t[n]), (l.ref.impl = l.nextImpl));
                break;
              case 11:
              case 15:
                break;
              case 1:
                if ((t & 1024) !== 0 && i !== null) {
                  ((t = void 0),
                    (n = e),
                    (l = i.memoizedProps),
                    (i = i.memoizedState),
                    (a = n.stateNode));
                  try {
                    var B = Kn(n.type, l);
                    ((t = a.getSnapshotBeforeUpdate(B, i)),
                      (a.__reactInternalSnapshotBeforeUpdate = t));
                  } catch (Y) {
                    ot(n, n.return, Y);
                  }
                }
                break;
              case 3:
                if ((t & 1024) !== 0) {
                  if (
                    ((t = e.stateNode.containerInfo), (n = t.nodeType), n === 9)
                  )
                    vs(t);
                  else if (n === 1)
                    switch (t.nodeName) {
                      case "HEAD":
                      case "HTML":
                      case "BODY":
                        vs(t);
                        break;
                      default:
                        t.textContent = "";
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
                if ((t & 1024) !== 0) throw Error(f(163));
            }
            if (((t = e.sibling), t !== null)) {
              ((t.return = e.return), (Lt = t));
              break;
            }
            Lt = e.return;
          }
    }
    function Er(t, e, n) {
      var a = n.flags;
      switch (n.tag) {
        case 0:
        case 11:
        case 15:
          (Fe(t, n), a & 4 && bl(5, n));
          break;
        case 1:
          if ((Fe(t, n), a & 4))
            if (((t = n.stateNode), e === null))
              try {
                t.componentDidMount();
              } catch (s) {
                ot(n, n.return, s);
              }
            else {
              var l = Kn(n.type, e.memoizedProps);
              e = e.memoizedState;
              try {
                t.componentDidUpdate(
                  l,
                  e,
                  t.__reactInternalSnapshotBeforeUpdate,
                );
              } catch (s) {
                ot(n, n.return, s);
              }
            }
          (a & 64 && Sr(n), a & 512 && Tl(n, n.return));
          break;
        case 3:
          if ((Fe(t, n), a & 64 && ((t = n.updateQueue), t !== null))) {
            if (((e = null), n.child !== null))
              switch (n.child.tag) {
                case 27:
                case 5:
                  e = n.child.stateNode;
                  break;
                case 1:
                  e = n.child.stateNode;
              }
            try {
              rf(t, e);
            } catch (s) {
              ot(n, n.return, s);
            }
          }
          break;
        case 27:
          e === null && a & 4 && Ar(n);
        case 26:
        case 5:
          (Fe(t, n), e === null && a & 4 && br(n), a & 512 && Tl(n, n.return));
          break;
        case 12:
          Fe(t, n);
          break;
        case 31:
          (Fe(t, n), a & 4 && Rr(t, n));
          break;
        case 13:
          (Fe(t, n),
            a & 4 && zr(t, n),
            a & 64 &&
              ((t = n.memoizedState),
              t !== null &&
                ((t = t.dehydrated),
                t !== null && ((n = ky.bind(null, n)), fg(t, n)))));
          break;
        case 22:
          if (((a = n.memoizedState !== null || Je), !a)) {
            ((e = (e !== null && e.memoizedState !== null) || Ut), (l = Je));
            var i = Ut;
            ((Je = a),
              (Ut = e) && !i
                ? We(t, n, (n.subtreeFlags & 8772) !== 0)
                : Fe(t, n),
              (Je = l),
              (Ut = i));
          }
          break;
        case 30:
          break;
        default:
          Fe(t, n);
      }
    }
    function Or(t) {
      var e = t.alternate;
      (e !== null && ((t.alternate = null), Or(e)),
        (t.child = null),
        (t.deletions = null),
        (t.sibling = null),
        t.tag === 5 && ((e = t.stateNode), e !== null && Au(e)),
        (t.stateNode = null),
        (t.return = null),
        (t.dependencies = null),
        (t.memoizedProps = null),
        (t.memoizedState = null),
        (t.pendingProps = null),
        (t.stateNode = null),
        (t.updateQueue = null));
    }
    var Tt = null,
      Wt = !1;
    function $e(t, e, n) {
      for (n = n.child; n !== null; ) (Mr(t, e, n), (n = n.sibling));
    }
    function Mr(t, e, n) {
      if (ie && typeof ie.onCommitFiberUnmount == "function")
        try {
          ie.onCommitFiberUnmount(Za, n);
        } catch {}
      switch (n.tag) {
        case 26:
          (Ut || Ue(n, e),
            $e(t, e, n),
            n.memoizedState
              ? n.memoizedState.count--
              : n.stateNode &&
                ((n = n.stateNode), n.parentNode.removeChild(n)));
          break;
        case 27:
          Ut || Ue(n, e);
          var a = Tt,
            l = Wt;
          (An(n.type) && ((Tt = n.stateNode), (Wt = !1)),
            $e(t, e, n),
            ql(n.stateNode),
            (Tt = a),
            (Wt = l));
          break;
        case 5:
          Ut || Ue(n, e);
        case 6:
          if (
            ((a = Tt),
            (l = Wt),
            (Tt = null),
            $e(t, e, n),
            (Tt = a),
            (Wt = l),
            Tt !== null)
          )
            if (Wt)
              try {
                (Tt.nodeType === 9
                  ? Tt.body
                  : Tt.nodeName === "HTML"
                    ? Tt.ownerDocument.body
                    : Tt
                ).removeChild(n.stateNode);
              } catch (i) {
                ot(n, e, i);
              }
            else
              try {
                Tt.removeChild(n.stateNode);
              } catch (i) {
                ot(n, e, i);
              }
          break;
        case 18:
          Tt !== null &&
            (Wt
              ? ((t = Tt),
                ph(
                  t.nodeType === 9
                    ? t.body
                    : t.nodeName === "HTML"
                      ? t.ownerDocument.body
                      : t,
                  n.stateNode,
                ),
                Ba(t))
              : ph(Tt, n.stateNode));
          break;
        case 4:
          ((a = Tt),
            (l = Wt),
            (Tt = n.stateNode.containerInfo),
            (Wt = !0),
            $e(t, e, n),
            (Tt = a),
            (Wt = l));
          break;
        case 0:
        case 11:
        case 14:
        case 15:
          (gn(2, n, e), Ut || gn(4, n, e), $e(t, e, n));
          break;
        case 1:
          (Ut ||
            (Ue(n, e),
            (a = n.stateNode),
            typeof a.componentWillUnmount == "function" && pr(n, e, a)),
            $e(t, e, n));
          break;
        case 21:
          $e(t, e, n);
          break;
        case 22:
          ((Ut = (a = Ut) || n.memoizedState !== null), $e(t, e, n), (Ut = a));
          break;
        default:
          $e(t, e, n);
      }
    }
    function Rr(t, e) {
      if (
        e.memoizedState === null &&
        ((t = e.alternate), t !== null && ((t = t.memoizedState), t !== null))
      ) {
        t = t.dehydrated;
        try {
          Ba(t);
        } catch (n) {
          ot(e, e.return, n);
        }
      }
    }
    function zr(t, e) {
      if (
        e.memoizedState === null &&
        ((t = e.alternate),
        t !== null &&
          ((t = t.memoizedState),
          t !== null && ((t = t.dehydrated), t !== null)))
      )
        try {
          Ba(t);
        } catch (n) {
          ot(e, e.return, n);
        }
    }
    function Ly(t) {
      switch (t.tag) {
        case 31:
        case 13:
        case 19:
          var e = t.stateNode;
          return (e === null && (e = t.stateNode = new _r()), e);
        case 22:
          return (
            (t = t.stateNode),
            (e = t._retryCache),
            e === null && (e = t._retryCache = new _r()),
            e
          );
        default:
          throw Error(f(435, t.tag));
      }
    }
    function Ni(t, e) {
      var n = Ly(t);
      e.forEach(function (a) {
        if (!n.has(a)) {
          n.add(a);
          var l = Ky.bind(null, t, a);
          a.then(l, l);
        }
      });
    }
    function It(t, e) {
      var n = e.deletions;
      if (n !== null)
        for (var a = 0; a < n.length; a++) {
          var l = n[a],
            i = t,
            s = e,
            r = s;
          t: for (; r !== null; ) {
            switch (r.tag) {
              case 27:
                if (An(r.type)) {
                  ((Tt = r.stateNode), (Wt = !1));
                  break t;
                }
                break;
              case 5:
                ((Tt = r.stateNode), (Wt = !1));
                break t;
              case 3:
              case 4:
                ((Tt = r.stateNode.containerInfo), (Wt = !0));
                break t;
            }
            r = r.return;
          }
          if (Tt === null) throw Error(f(160));
          (Mr(i, s, l),
            (Tt = null),
            (Wt = !1),
            (i = l.alternate),
            i !== null && (i.return = null),
            (l.return = null));
        }
      if (e.subtreeFlags & 13886)
        for (e = e.child; e !== null; ) (Cr(e, t), (e = e.sibling));
    }
    var Ce = null;
    function Cr(t, e) {
      var n = t.alternate,
        a = t.flags;
      switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          (It(e, t),
            Pt(t),
            a & 4 && (gn(3, t, t.return), bl(3, t), gn(5, t, t.return)));
          break;
        case 1:
          (It(e, t),
            Pt(t),
            a & 512 && (Ut || n === null || Ue(n, n.return)),
            a & 64 &&
              Je &&
              ((t = t.updateQueue),
              t !== null &&
                ((a = t.callbacks),
                a !== null &&
                  ((n = t.shared.hiddenCallbacks),
                  (t.shared.hiddenCallbacks = n === null ? a : n.concat(a))))));
          break;
        case 26:
          var l = Ce;
          if (
            (It(e, t),
            Pt(t),
            a & 512 && (Ut || n === null || Ue(n, n.return)),
            a & 4)
          ) {
            var i = n !== null ? n.memoizedState : null;
            if (((a = t.memoizedState), n === null))
              if (a === null)
                if (t.stateNode === null) {
                  t: {
                    ((a = t.type),
                      (n = t.memoizedProps),
                      (l = l.ownerDocument || l));
                    e: switch (a) {
                      case "title":
                        ((i = l.getElementsByTagName("title")[0]),
                          (!i ||
                            i[Ja] ||
                            i[jt] ||
                            i.namespaceURI === "http://www.w3.org/2000/svg" ||
                            i.hasAttribute("itemprop")) &&
                            ((i = l.createElement(a)),
                            l.head.insertBefore(
                              i,
                              l.querySelector("head > title"),
                            )),
                          Zt(i, a, n),
                          (i[jt] = t),
                          Ht(i),
                          (a = i));
                        break t;
                      case "link":
                        var s = qh("link", "href", l).get(a + (n.href || ""));
                        if (s) {
                          for (var r = 0; r < s.length; r++)
                            if (
                              ((i = s[r]),
                              i.getAttribute("href") ===
                                (n.href == null || n.href === ""
                                  ? null
                                  : n.href) &&
                                i.getAttribute("rel") ===
                                  (n.rel == null ? null : n.rel) &&
                                i.getAttribute("title") ===
                                  (n.title == null ? null : n.title) &&
                                i.getAttribute("crossorigin") ===
                                  (n.crossOrigin == null
                                    ? null
                                    : n.crossOrigin))
                            ) {
                              s.splice(r, 1);
                              break e;
                            }
                        }
                        ((i = l.createElement(a)),
                          Zt(i, a, n),
                          l.head.appendChild(i));
                        break;
                      case "meta":
                        if (
                          (s = qh("meta", "content", l).get(
                            a + (n.content || ""),
                          ))
                        ) {
                          for (r = 0; r < s.length; r++)
                            if (
                              ((i = s[r]),
                              i.getAttribute("content") ===
                                (n.content == null ? null : "" + n.content) &&
                                i.getAttribute("name") ===
                                  (n.name == null ? null : n.name) &&
                                i.getAttribute("property") ===
                                  (n.property == null ? null : n.property) &&
                                i.getAttribute("http-equiv") ===
                                  (n.httpEquiv == null ? null : n.httpEquiv) &&
                                i.getAttribute("charset") ===
                                  (n.charSet == null ? null : n.charSet))
                            ) {
                              s.splice(r, 1);
                              break e;
                            }
                        }
                        ((i = l.createElement(a)),
                          Zt(i, a, n),
                          l.head.appendChild(i));
                        break;
                      default:
                        throw Error(f(468, a));
                    }
                    ((i[jt] = t), Ht(i), (a = i));
                  }
                  t.stateNode = a;
                } else Dh(l, t.type, t.stateNode);
              else t.stateNode = Ch(l, a, t.memoizedProps);
            else
              i !== a
                ? (i === null
                    ? n.stateNode !== null &&
                      ((n = n.stateNode), n.parentNode.removeChild(n))
                    : i.count--,
                  a === null
                    ? Dh(l, t.type, t.stateNode)
                    : Ch(l, a, t.memoizedProps))
                : a === null &&
                  t.stateNode !== null &&
                  Gc(t, t.memoizedProps, n.memoizedProps);
          }
          break;
        case 27:
          (It(e, t),
            Pt(t),
            a & 512 && (Ut || n === null || Ue(n, n.return)),
            n !== null && a & 4 && Gc(t, t.memoizedProps, n.memoizedProps));
          break;
        case 5:
          if (
            (It(e, t),
            Pt(t),
            a & 512 && (Ut || n === null || Ue(n, n.return)),
            t.flags & 32)
          ) {
            l = t.stateNode;
            try {
              ia(l, "");
            } catch (B) {
              ot(t, t.return, B);
            }
          }
          (a & 4 &&
            t.stateNode != null &&
            ((l = t.memoizedProps), Gc(t, l, n !== null ? n.memoizedProps : l)),
            a & 1024 && (kc = !0));
          break;
        case 6:
          if ((It(e, t), Pt(t), a & 4)) {
            if (t.stateNode === null) throw Error(f(162));
            ((a = t.memoizedProps), (n = t.stateNode));
            try {
              n.nodeValue = a;
            } catch (B) {
              ot(t, t.return, B);
            }
          }
          break;
        case 3:
          if (
            ((Fi = null),
            (l = Ce),
            (Ce = Ji(e.containerInfo)),
            It(e, t),
            (Ce = l),
            Pt(t),
            a & 4 && n !== null && n.memoizedState.isDehydrated)
          )
            try {
              Ba(e.containerInfo);
            } catch (B) {
              ot(t, t.return, B);
            }
          kc && ((kc = !1), qr(t));
          break;
        case 4:
          ((a = Ce),
            (Ce = Ji(t.stateNode.containerInfo)),
            It(e, t),
            Pt(t),
            (Ce = a));
          break;
        case 12:
          (It(e, t), Pt(t));
          break;
        case 31:
          (It(e, t),
            Pt(t),
            a & 4 &&
              ((a = t.updateQueue),
              a !== null && ((t.updateQueue = null), Ni(t, a))));
          break;
        case 13:
          (It(e, t),
            Pt(t),
            t.child.flags & 8192 &&
              (t.memoizedState !== null) !=
                (n !== null && n.memoizedState !== null) &&
              (Bi = le()),
            a & 4 &&
              ((a = t.updateQueue),
              a !== null && ((t.updateQueue = null), Ni(t, a))));
          break;
        case 22:
          l = t.memoizedState !== null;
          var d = n !== null && n.memoizedState !== null,
            p = Je,
            _ = Ut;
          if (
            ((Je = p || l),
            (Ut = _ || d),
            It(e, t),
            (Ut = _),
            (Je = p),
            Pt(t),
            a & 8192)
          )
            t: for (
              e = t.stateNode,
                e._visibility = l ? e._visibility & -2 : e._visibility | 1,
                l && (n === null || d || Je || Ut || Jn(t)),
                n = null,
                e = t;
              ;
            ) {
              if (e.tag === 5 || e.tag === 26) {
                if (n === null) {
                  d = n = e;
                  try {
                    if (((i = d.stateNode), l))
                      ((s = i.style),
                        typeof s.setProperty == "function"
                          ? s.setProperty("display", "none", "important")
                          : (s.display = "none"));
                    else {
                      r = d.stateNode;
                      var M = d.memoizedProps.style,
                        b =
                          M != null && M.hasOwnProperty("display")
                            ? M.display
                            : null;
                      r.style.display =
                        b == null || typeof b == "boolean"
                          ? ""
                          : ("" + b).trim();
                    }
                  } catch (B) {
                    ot(d, d.return, B);
                  }
                }
              } else if (e.tag === 6) {
                if (n === null) {
                  d = e;
                  try {
                    d.stateNode.nodeValue = l ? "" : d.memoizedProps;
                  } catch (B) {
                    ot(d, d.return, B);
                  }
                }
              } else if (e.tag === 18) {
                if (n === null) {
                  d = e;
                  try {
                    var T = d.stateNode;
                    l ? bh(T, !0) : bh(d.stateNode, !1);
                  } catch (B) {
                    ot(d, d.return, B);
                  }
                }
              } else if (
                ((e.tag !== 22 && e.tag !== 23) ||
                  e.memoizedState === null ||
                  e === t) &&
                e.child !== null
              ) {
                ((e.child.return = e), (e = e.child));
                continue;
              }
              if (e === t) break t;
              for (; e.sibling === null; ) {
                if (e.return === null || e.return === t) break t;
                (n === e && (n = null), (e = e.return));
              }
              (n === e && (n = null),
                (e.sibling.return = e.return),
                (e = e.sibling));
            }
          a & 4 &&
            ((a = t.updateQueue),
            a !== null &&
              ((n = a.retryQueue),
              n !== null && ((a.retryQueue = null), Ni(t, n))));
          break;
        case 19:
          (It(e, t),
            Pt(t),
            a & 4 &&
              ((a = t.updateQueue),
              a !== null && ((t.updateQueue = null), Ni(t, a))));
          break;
        case 30:
          break;
        case 21:
          break;
        default:
          (It(e, t), Pt(t));
      }
    }
    function Pt(t) {
      var e = t.flags;
      if (e & 2) {
        try {
          for (var n, a = t.return; a !== null; ) {
            if (Tr(a)) {
              n = a;
              break;
            }
            a = a.return;
          }
          if (n == null) throw Error(f(160));
          switch (n.tag) {
            case 27:
              var l = n.stateNode;
              Ui(t, Xc(t), l);
              break;
            case 5:
              var i = n.stateNode;
              (n.flags & 32 && (ia(i, ""), (n.flags &= -33)), Ui(t, Xc(t), i));
              break;
            case 3:
            case 4:
              var s = n.stateNode.containerInfo;
              Zc(t, Xc(t), s);
              break;
            default:
              throw Error(f(161));
          }
        } catch (r) {
          ot(t, t.return, r);
        }
        t.flags &= -3;
      }
      e & 4096 && (t.flags &= -4097);
    }
    function qr(t) {
      if (t.subtreeFlags & 1024)
        for (t = t.child; t !== null; ) {
          var e = t;
          (qr(e),
            e.tag === 5 && e.flags & 1024 && e.stateNode.reset(),
            (t = t.sibling));
        }
    }
    function Fe(t, e) {
      if (e.subtreeFlags & 8772)
        for (e = e.child; e !== null; )
          (Er(t, e.alternate, e), (e = e.sibling));
    }
    function Jn(t) {
      for (t = t.child; t !== null; ) {
        var e = t;
        switch (e.tag) {
          case 0:
          case 11:
          case 14:
          case 15:
            (gn(4, e, e.return), Jn(e));
            break;
          case 1:
            Ue(e, e.return);
            var n = e.stateNode;
            (typeof n.componentWillUnmount == "function" && pr(e, e.return, n),
              Jn(e));
            break;
          case 27:
            ql(e.stateNode);
          case 26:
          case 5:
            (Ue(e, e.return), Jn(e));
            break;
          case 22:
            e.memoizedState === null && Jn(e);
            break;
          case 30:
            Jn(e);
            break;
          default:
            Jn(e);
        }
        t = t.sibling;
      }
    }
    function We(t, e, n) {
      for (n = n && (e.subtreeFlags & 8772) !== 0, e = e.child; e !== null; ) {
        var a = e.alternate,
          l = t,
          i = e,
          s = i.flags;
        switch (i.tag) {
          case 0:
          case 11:
          case 15:
            (We(l, i, n), bl(4, i));
            break;
          case 1:
            if (
              (We(l, i, n),
              (a = i),
              (l = a.stateNode),
              typeof l.componentDidMount == "function")
            )
              try {
                l.componentDidMount();
              } catch (p) {
                ot(a, a.return, p);
              }
            if (((a = i), (l = a.updateQueue), l !== null)) {
              var r = a.stateNode;
              try {
                var d = l.shared.hiddenCallbacks;
                if (d !== null)
                  for (
                    l.shared.hiddenCallbacks = null, l = 0;
                    l < d.length;
                    l++
                  )
                    ff(d[l], r);
              } catch (p) {
                ot(a, a.return, p);
              }
            }
            (n && s & 64 && Sr(i), Tl(i, i.return));
            break;
          case 27:
            Ar(i);
          case 26:
          case 5:
            (We(l, i, n), n && a === null && s & 4 && br(i), Tl(i, i.return));
            break;
          case 12:
            We(l, i, n);
            break;
          case 31:
            (We(l, i, n), n && s & 4 && Rr(l, i));
            break;
          case 13:
            (We(l, i, n), n && s & 4 && zr(l, i));
            break;
          case 22:
            (i.memoizedState === null && We(l, i, n), Tl(i, i.return));
            break;
          case 30:
            break;
          default:
            We(l, i, n);
        }
        e = e.sibling;
      }
    }
    function Kc(t, e) {
      var n = null;
      (t !== null &&
        t.memoizedState !== null &&
        t.memoizedState.cachePool !== null &&
        (n = t.memoizedState.cachePool.pool),
        (t = null),
        e.memoizedState !== null &&
          e.memoizedState.cachePool !== null &&
          (t = e.memoizedState.cachePool.pool),
        t !== n && (t != null && t.refCount++, n != null && cl(n)));
    }
    function Jc(t, e) {
      ((t = null),
        e.alternate !== null && (t = e.alternate.memoizedState.cache),
        (e = e.memoizedState.cache),
        e !== t && (e.refCount++, t != null && cl(t)));
    }
    function qe(t, e, n, a) {
      if (e.subtreeFlags & 10256)
        for (e = e.child; e !== null; ) (Dr(t, e, n, a), (e = e.sibling));
    }
    function Dr(t, e, n, a) {
      var l = e.flags;
      switch (e.tag) {
        case 0:
        case 11:
        case 15:
          (qe(t, e, n, a), l & 2048 && bl(9, e));
          break;
        case 1:
          qe(t, e, n, a);
          break;
        case 3:
          (qe(t, e, n, a),
            l & 2048 &&
              ((t = null),
              e.alternate !== null && (t = e.alternate.memoizedState.cache),
              (e = e.memoizedState.cache),
              e !== t && (e.refCount++, t != null && cl(t))));
          break;
        case 12:
          if (l & 2048) {
            (qe(t, e, n, a), (t = e.stateNode));
            try {
              var i = e.memoizedProps,
                s = i.id,
                r = i.onPostCommit;
              typeof r == "function" &&
                r(
                  s,
                  e.alternate === null ? "mount" : "update",
                  t.passiveEffectDuration,
                  -0,
                );
            } catch (d) {
              ot(e, e.return, d);
            }
          } else qe(t, e, n, a);
          break;
        case 31:
          qe(t, e, n, a);
          break;
        case 13:
          qe(t, e, n, a);
          break;
        case 23:
          break;
        case 22:
          ((i = e.stateNode),
            (s = e.alternate),
            e.memoizedState !== null
              ? i._visibility & 2
                ? qe(t, e, n, a)
                : Al(t, e)
              : i._visibility & 2
                ? qe(t, e, n, a)
                : ((i._visibility |= 2),
                  Oa(t, e, n, a, (e.subtreeFlags & 10256) !== 0 || !1)),
            l & 2048 && Kc(s, e));
          break;
        case 24:
          (qe(t, e, n, a), l & 2048 && Jc(e.alternate, e));
          break;
        default:
          qe(t, e, n, a);
      }
    }
    function Oa(t, e, n, a, l) {
      for (
        l = l && ((e.subtreeFlags & 10256) !== 0 || !1), e = e.child;
        e !== null;
      ) {
        var i = t,
          s = e,
          r = n,
          d = a,
          p = s.flags;
        switch (s.tag) {
          case 0:
          case 11:
          case 15:
            (Oa(i, s, r, d, l), bl(8, s));
            break;
          case 23:
            break;
          case 22:
            var _ = s.stateNode;
            (s.memoizedState !== null
              ? _._visibility & 2
                ? Oa(i, s, r, d, l)
                : Al(i, s)
              : ((_._visibility |= 2), Oa(i, s, r, d, l)),
              l && p & 2048 && Kc(s.alternate, s));
            break;
          case 24:
            (Oa(i, s, r, d, l), l && p & 2048 && Jc(s.alternate, s));
            break;
          default:
            Oa(i, s, r, d, l);
        }
        e = e.sibling;
      }
    }
    function Al(t, e) {
      if (e.subtreeFlags & 10256)
        for (e = e.child; e !== null; ) {
          var n = t,
            a = e,
            l = a.flags;
          switch (a.tag) {
            case 22:
              (Al(n, a), l & 2048 && Kc(a.alternate, a));
              break;
            case 24:
              (Al(n, a), l & 2048 && Jc(a.alternate, a));
              break;
            default:
              Al(n, a);
          }
          e = e.sibling;
        }
    }
    var _l = 8192;
    function Ma(t, e, n) {
      if (t.subtreeFlags & _l)
        for (t = t.child; t !== null; ) (wr(t, e, n), (t = t.sibling));
    }
    function wr(t, e, n) {
      switch (t.tag) {
        case 26:
          (Ma(t, e, n),
            t.flags & _l &&
              t.memoizedState !== null &&
              Ag(n, Ce, t.memoizedState, t.memoizedProps));
          break;
        case 5:
          Ma(t, e, n);
          break;
        case 3:
        case 4:
          var a = Ce;
          ((Ce = Ji(t.stateNode.containerInfo)), Ma(t, e, n), (Ce = a));
          break;
        case 22:
          t.memoizedState === null &&
            ((a = t.alternate),
            a !== null && a.memoizedState !== null
              ? ((a = _l), (_l = 16777216), Ma(t, e, n), (_l = a))
              : Ma(t, e, n));
          break;
        default:
          Ma(t, e, n);
      }
    }
    function Ur(t) {
      var e = t.alternate;
      if (e !== null && ((t = e.child), t !== null)) {
        e.child = null;
        do ((e = t.sibling), (t.sibling = null), (t = e));
        while (t !== null);
      }
    }
    function El(t) {
      var e = t.deletions;
      if ((t.flags & 16) !== 0) {
        if (e !== null)
          for (var n = 0; n < e.length; n++) {
            var a = e[n];
            ((Lt = a), Qr(a, t));
          }
        Ur(t);
      }
      if (t.subtreeFlags & 10256)
        for (t = t.child; t !== null; ) (Nr(t), (t = t.sibling));
    }
    function Nr(t) {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          (El(t), t.flags & 2048 && gn(9, t, t.return));
          break;
        case 3:
          El(t);
          break;
        case 12:
          El(t);
          break;
        case 22:
          var e = t.stateNode;
          t.memoizedState !== null &&
          e._visibility & 2 &&
          (t.return === null || t.return.tag !== 13)
            ? ((e._visibility &= -3), Qi(t))
            : El(t);
          break;
        default:
          El(t);
      }
    }
    function Qi(t) {
      var e = t.deletions;
      if ((t.flags & 16) !== 0) {
        if (e !== null)
          for (var n = 0; n < e.length; n++) {
            var a = e[n];
            ((Lt = a), Qr(a, t));
          }
        Ur(t);
      }
      for (t = t.child; t !== null; ) {
        switch (((e = t), e.tag)) {
          case 0:
          case 11:
          case 15:
            (gn(8, e, e.return), Qi(e));
            break;
          case 22:
            ((n = e.stateNode),
              n._visibility & 2 && ((n._visibility &= -3), Qi(e)));
            break;
          default:
            Qi(e);
        }
        t = t.sibling;
      }
    }
    function Qr(t, e) {
      for (; Lt !== null; ) {
        var n = Lt;
        switch (n.tag) {
          case 0:
          case 11:
          case 15:
            gn(8, n, e);
            break;
          case 23:
          case 22:
            if (
              n.memoizedState !== null &&
              n.memoizedState.cachePool !== null
            ) {
              var a = n.memoizedState.cachePool.pool;
              a != null && a.refCount++;
            }
            break;
          case 24:
            cl(n.memoizedState.cache);
        }
        if (((a = n.child), a !== null)) ((a.return = n), (Lt = a));
        else
          t: for (n = t; Lt !== null; ) {
            a = Lt;
            var l = a.sibling,
              i = a.return;
            if ((Or(a), a === n)) {
              Lt = null;
              break t;
            }
            if (l !== null) {
              ((l.return = i), (Lt = l));
              break t;
            }
            Lt = i;
          }
      }
    }
    var Vy = {
        getCacheForType: function (t) {
          var e = Gt(qt),
            n = e.data.get(t);
          return (n === void 0 && ((n = t()), e.data.set(t, n)), n);
        },
        cacheSignal: function () {
          return Gt(qt).controller.signal;
        },
      },
      xy = typeof WeakMap == "function" ? WeakMap : Map,
      it = 0,
      vt = null,
      $ = null,
      W = 0,
      st = 0,
      re = null,
      vn = !1,
      Ra = !1,
      $c = !1,
      Ie = 0,
      Et = 0,
      mn = 0,
      $n = 0,
      Fc = 0,
      he = 0,
      za = 0,
      Ol = null,
      te = null,
      Wc = !1,
      Bi = 0,
      Br = 0,
      Hi = 1 / 0,
      Li = null,
      Sn = null,
      Bt = 0,
      pn = null,
      Ca = null,
      Pe = 0,
      Ic = 0,
      Pc = null,
      Hr = null,
      Ml = 0,
      ts = null;
    function Ae() {
      return (it & 2) !== 0 && W !== 0 ? W & -W : q.T !== null ? us() : to();
    }
    function Lr() {
      if (he === 0)
        if ((W & 536870912) === 0 || P) {
          var t = Zl;
          ((Zl <<= 1), (Zl & 3932160) === 0 && (Zl = 262144), (he = t));
        } else he = 536870912;
      return ((t = oe.current), t !== null && (t.flags |= 32), he);
    }
    function ee(t, e, n) {
      (((t === vt && (st === 2 || st === 9)) ||
        t.cancelPendingCommit !== null) &&
        (qa(t, 0), bn(t, W, he, !1)),
        Jl(t, n),
        ((it & 2) === 0 || t !== vt) &&
          (t === vt &&
            ((it & 2) === 0 && ($n |= n), Et === 4 && bn(t, W, he, !1)),
          tn(t)));
    }
    function Vr(t, e, n) {
      if ((it & 6) !== 0) throw Error(f(327));
      var a = (!n && (e & 127) === 0 && (e & t.expiredLanes) === 0) || ka(t, e),
        l = a ? Gy(t, e) : ns(t, e, !0),
        i = a;
      do {
        if (l === 0) {
          Ra && !a && bn(t, e, 0, !1);
          break;
        } else {
          if (((n = t.current.alternate), i && !jy(n))) {
            ((l = ns(t, e, !1)), (i = !1));
            continue;
          }
          if (l === 2) {
            if (((i = e), t.errorRecoveryDisabledLanes & i)) var s = 0;
            else
              ((s = t.pendingLanes & -536870913),
                (s = s !== 0 ? s : s & 536870912 ? 536870912 : 0));
            if (s !== 0) {
              e = s;
              t: {
                var r = t;
                l = Ol;
                var d = r.current.memoizedState.isDehydrated;
                if (
                  (d && (qa(r, s).flags |= 256), (s = ns(r, s, !1)), s !== 2)
                ) {
                  if ($c && !d) {
                    ((r.errorRecoveryDisabledLanes |= i), ($n |= i), (l = 4));
                    break t;
                  }
                  ((i = te),
                    (te = l),
                    i !== null &&
                      (te === null ? (te = i) : te.push.apply(te, i)));
                }
                l = s;
              }
              if (((i = !1), l !== 2)) continue;
            }
          }
          if (l === 1) {
            (qa(t, 0), bn(t, e, 0, !0));
            break;
          }
          t: {
            switch (((a = t), (i = l), i)) {
              case 0:
              case 1:
                throw Error(f(345));
              case 4:
                if ((e & 4194048) !== e) break;
              case 6:
                bn(a, e, he, !vn);
                break t;
              case 2:
                te = null;
                break;
              case 3:
              case 5:
                break;
              default:
                throw Error(f(329));
            }
            if ((e & 62914560) === e && ((l = Bi + 300 - le()), 10 < l)) {
              if ((bn(a, e, he, !vn), Kl(a, 0, !0) !== 0)) break t;
              ((Pe = e),
                (a.timeoutHandle = mh(
                  xr.bind(
                    null,
                    a,
                    n,
                    te,
                    Li,
                    Wc,
                    e,
                    he,
                    $n,
                    za,
                    vn,
                    i,
                    "Throttled",
                    -0,
                    0,
                  ),
                  l,
                )));
              break t;
            }
            xr(a, n, te, Li, Wc, e, he, $n, za, vn, i, null, -0, 0);
          }
        }
        break;
      } while (!0);
      tn(t);
    }
    function xr(t, e, n, a, l, i, s, r, d, p, _, M, b, T) {
      if (
        ((t.timeoutHandle = -1),
        (M = e.subtreeFlags),
        M & 8192 || (M & 16785408) === 16785408)
      ) {
        ((M = {
          stylesheets: null,
          count: 0,
          imgCount: 0,
          imgBytes: 0,
          suspenseyImages: [],
          waitingForImages: !0,
          waitingForViewTransition: !1,
          unsuspend: Le,
        }),
          wr(e, i, M));
        var B =
          (i & 62914560) === i
            ? Bi - le()
            : (i & 4194048) === i
              ? Br - le()
              : 0;
        if (((B = _g(M, B)), B !== null)) {
          ((Pe = i),
            (t.cancelPendingCommit = B(
              Jr.bind(null, t, e, i, n, a, l, s, r, d, _, M, null, b, T),
            )),
            bn(t, i, s, !p));
          return;
        }
      }
      Jr(t, e, i, n, a, l, s, r, d);
    }
    function jy(t) {
      for (var e = t; ; ) {
        var n = e.tag;
        if (
          (n === 0 || n === 11 || n === 15) &&
          e.flags & 16384 &&
          ((n = e.updateQueue), n !== null && ((n = n.stores), n !== null))
        )
          for (var a = 0; a < n.length; a++) {
            var l = n[a],
              i = l.getSnapshot;
            l = l.value;
            try {
              if (!ce(i(), l)) return !1;
            } catch {
              return !1;
            }
          }
        if (((n = e.child), e.subtreeFlags & 16384 && n !== null))
          ((n.return = e), (e = n));
        else {
          if (e === t) break;
          for (; e.sibling === null; ) {
            if (e.return === null || e.return === t) return !0;
            e = e.return;
          }
          ((e.sibling.return = e.return), (e = e.sibling));
        }
      }
      return !0;
    }
    function bn(t, e, n, a) {
      ((e &= ~Fc),
        (e &= ~$n),
        (t.suspendedLanes |= e),
        (t.pingedLanes &= ~e),
        a && (t.warmLanes |= e),
        (a = t.expirationTimes));
      for (var l = e; 0 < l; ) {
        var i = 31 - ue(l),
          s = 1 << i;
        ((a[i] = -1), (l &= ~s));
      }
      n !== 0 && Fs(t, n, e);
    }
    function Vi() {
      return (it & 6) === 0 ? (Rl(0, !1), !1) : !0;
    }
    function es() {
      if ($ !== null) {
        if (st === 0) var t = $.return;
        else ((t = $), (Ye = Ln = null), mc(t), (ba = null), (ol = 0), (t = $));
        for (; t !== null; ) (mr(t.alternate, t), (t = t.return));
        $ = null;
      }
    }
    function qa(t, e) {
      var n = t.timeoutHandle;
      (n !== -1 && ((t.timeoutHandle = -1), ig(n)),
        (n = t.cancelPendingCommit),
        n !== null && ((t.cancelPendingCommit = null), n()),
        (Pe = 0),
        es(),
        (vt = t),
        ($ = n = xe(t.current, null)),
        (W = e),
        (st = 0),
        (re = null),
        (vn = !1),
        (Ra = ka(t, e)),
        ($c = !1),
        (za = he = Fc = $n = mn = Et = 0),
        (te = Ol = null),
        (Wc = !1),
        (e & 8) !== 0 && (e |= e & 32));
      var a = t.entangledLanes;
      if (a !== 0)
        for (t = t.entanglements, a &= e; 0 < a; ) {
          var l = 31 - ue(a),
            i = 1 << l;
          ((e |= t[l]), (a &= ~i));
        }
      return ((Ie = e), ui(), n);
    }
    function jr(t, e) {
      ((G = null),
        (q.H = ml),
        e === pa || e === yi
          ? ((e = uf()), (st = 3))
          : e === ic
            ? ((e = uf()), (st = 4))
            : (st =
                e === Uc
                  ? 8
                  : e !== null &&
                      typeof e == "object" &&
                      typeof e.then == "function"
                    ? 6
                    : 1),
        (re = e),
        $ === null && ((Et = 1), zi(t, me(e, t.current))));
    }
    function Yr() {
      var t = oe.current;
      return t === null
        ? !0
        : (W & 4194048) === W
          ? Te === null
          : (W & 62914560) === W || (W & 536870912) !== 0
            ? t === Te
            : !1;
    }
    function Gr() {
      var t = q.H;
      return ((q.H = ml), t === null ? ml : t);
    }
    function Xr() {
      var t = q.A;
      return ((q.A = Vy), t);
    }
    function xi() {
      ((Et = 4),
        vn || ((W & 4194048) !== W && oe.current !== null) || (Ra = !0),
        ((mn & 134217727) === 0 && ($n & 134217727) === 0) ||
          vt === null ||
          bn(vt, W, he, !1));
    }
    function ns(t, e, n) {
      var a = it;
      it |= 2;
      var l = Gr(),
        i = Xr();
      ((vt !== t || W !== e) && ((Li = null), qa(t, e)), (e = !1));
      var s = Et;
      t: do
        try {
          if (st !== 0 && $ !== null) {
            var r = $,
              d = re;
            switch (st) {
              case 8:
                (es(), (s = 6));
                break t;
              case 3:
              case 2:
              case 9:
              case 6:
                oe.current === null && (e = !0);
                var p = st;
                if (((st = 0), (re = null), Da(t, r, d, p), n && Ra)) {
                  s = 0;
                  break t;
                }
                break;
              default:
                ((p = st), (st = 0), (re = null), Da(t, r, d, p));
            }
          }
          (Yy(), (s = Et));
          break;
        } catch (_) {
          jr(t, _);
        }
      while (!0);
      return (
        e && t.shellSuspendCounter++,
        (Ye = Ln = null),
        (it = a),
        (q.H = l),
        (q.A = i),
        $ === null && ((vt = null), (W = 0), ui()),
        s
      );
    }
    function Yy() {
      for (; $ !== null; ) Zr($);
    }
    function Gy(t, e) {
      var n = it;
      it |= 2;
      var a = Gr(),
        l = Xr();
      vt !== t || W !== e
        ? ((Li = null), (Hi = le() + 500), qa(t, e))
        : (Ra = ka(t, e));
      t: do
        try {
          if (st !== 0 && $ !== null) {
            e = $;
            var i = re;
            e: switch (st) {
              case 1:
                ((st = 0), (re = null), Da(t, e, i, 1));
                break;
              case 2:
              case 9:
                if (af(i)) {
                  ((st = 0), (re = null), kr(e));
                  break;
                }
                ((e = function () {
                  ((st !== 2 && st !== 9) || vt !== t || (st = 7), tn(t));
                }),
                  i.then(e, e));
                break t;
              case 3:
                st = 7;
                break t;
              case 4:
                st = 5;
                break t;
              case 7:
                af(i)
                  ? ((st = 0), (re = null), kr(e))
                  : ((st = 0), (re = null), Da(t, e, i, 7));
                break;
              case 5:
                var s = null;
                switch ($.tag) {
                  case 26:
                    s = $.memoizedState;
                  case 5:
                  case 27:
                    var r = $;
                    if (s ? wh(s) : r.stateNode.complete) {
                      ((st = 0), (re = null));
                      var d = r.sibling;
                      if (d !== null) $ = d;
                      else {
                        var p = r.return;
                        p !== null ? (($ = p), ji(p)) : ($ = null);
                      }
                      break e;
                    }
                }
                ((st = 0), (re = null), Da(t, e, i, 5));
                break;
              case 6:
                ((st = 0), (re = null), Da(t, e, i, 6));
                break;
              case 8:
                (es(), (Et = 6));
                break t;
              default:
                throw Error(f(462));
            }
          }
          Xy();
          break;
        } catch (_) {
          jr(t, _);
        }
      while (!0);
      return (
        (Ye = Ln = null),
        (q.H = a),
        (q.A = l),
        (it = n),
        $ !== null ? 0 : ((vt = null), (W = 0), ui(), Et)
      );
    }
    function Xy() {
      for (; $ !== null && !Td(); ) Zr($);
    }
    function Zr(t) {
      var e = gr(t.alternate, t, Ie);
      ((t.memoizedProps = t.pendingProps), e === null ? ji(t) : ($ = e));
    }
    function kr(t) {
      var e = t,
        n = e.alternate;
      switch (e.tag) {
        case 15:
        case 0:
          e = or(n, e, e.pendingProps, e.type, void 0, W);
          break;
        case 11:
          e = or(n, e, e.pendingProps, e.type.render, e.ref, W);
          break;
        case 5:
          mc(e);
        default:
          (mr(n, e), (e = $ = ko(e, Ie)), (e = gr(n, e, Ie)));
      }
      ((t.memoizedProps = t.pendingProps), e === null ? ji(t) : ($ = e));
    }
    function Da(t, e, n, a) {
      ((Ye = Ln = null), mc(e), (ba = null), (ol = 0));
      var l = e.return;
      try {
        if (wy(t, l, e, n, W)) {
          ((Et = 1), zi(t, me(n, t.current)), ($ = null));
          return;
        }
      } catch (i) {
        if (l !== null) throw (($ = l), i);
        ((Et = 1), zi(t, me(n, t.current)), ($ = null));
        return;
      }
      e.flags & 32768
        ? (P || a === 1
            ? (t = !0)
            : Ra || (W & 536870912) !== 0
              ? (t = !1)
              : ((vn = t = !0),
                (a === 2 || a === 9 || a === 3 || a === 6) &&
                  ((a = oe.current),
                  a !== null && a.tag === 13 && (a.flags |= 16384))),
          Kr(e, t))
        : ji(e);
    }
    function ji(t) {
      var e = t;
      do {
        if ((e.flags & 32768) !== 0) {
          Kr(e, vn);
          return;
        }
        t = e.return;
        var n = Qy(e.alternate, e, Ie);
        if (n !== null) {
          $ = n;
          return;
        }
        if (((e = e.sibling), e !== null)) {
          $ = e;
          return;
        }
        $ = e = t;
      } while (e !== null);
      Et === 0 && (Et = 5);
    }
    function Kr(t, e) {
      do {
        var n = By(t.alternate, t);
        if (n !== null) {
          ((n.flags &= 32767), ($ = n));
          return;
        }
        if (
          ((n = t.return),
          n !== null &&
            ((n.flags |= 32768), (n.subtreeFlags = 0), (n.deletions = null)),
          !e && ((t = t.sibling), t !== null))
        ) {
          $ = t;
          return;
        }
        $ = t = n;
      } while (t !== null);
      ((Et = 6), ($ = null));
    }
    function Jr(t, e, n, a, l, i, s, r, d) {
      t.cancelPendingCommit = null;
      do Yi();
      while (Bt !== 0);
      if ((it & 6) !== 0) throw Error(f(327));
      if (e !== null) {
        if (e === t.current) throw Error(f(177));
        if (
          ((i = e.lanes | e.childLanes),
          (i |= Xu),
          Dd(t, n, i, s, r, d),
          t === vt && (($ = vt = null), (W = 0)),
          (Ca = e),
          (pn = t),
          (Pe = n),
          (Ic = i),
          (Pc = l),
          (Hr = a),
          (e.subtreeFlags & 10256) !== 0 || (e.flags & 10256) !== 0
            ? ((t.callbackNode = null),
              (t.callbackPriority = 0),
              Jy(Gl, function () {
                return (Pr(), null);
              }))
            : ((t.callbackNode = null), (t.callbackPriority = 0)),
          (a = (e.flags & 13878) !== 0),
          (e.subtreeFlags & 13878) !== 0 || a)
        ) {
          ((a = q.T), (q.T = null), (l = N.p), (N.p = 2), (s = it), (it |= 4));
          try {
            Hy(t, e, n);
          } finally {
            ((it = s), (N.p = l), (q.T = a));
          }
        }
        ((Bt = 1), $r(), Fr(), Wr());
      }
    }
    function $r() {
      if (Bt === 1) {
        Bt = 0;
        var t = pn,
          e = Ca,
          n = (e.flags & 13878) !== 0;
        if ((e.subtreeFlags & 13878) !== 0 || n) {
          ((n = q.T), (q.T = null));
          var a = N.p;
          N.p = 2;
          var l = it;
          it |= 4;
          try {
            Cr(e, t);
            var i = ds,
              s = Ho(t.containerInfo),
              r = i.focusedElem,
              d = i.selectionRange;
            if (
              s !== r &&
              r &&
              r.ownerDocument &&
              Bo(r.ownerDocument.documentElement, r)
            ) {
              if (d !== null && Vu(r)) {
                var p = d.start,
                  _ = d.end;
                if ((_ === void 0 && (_ = p), "selectionStart" in r))
                  ((r.selectionStart = p),
                    (r.selectionEnd = Math.min(_, r.value.length)));
                else {
                  var M = r.ownerDocument || document,
                    b = (M && M.defaultView) || window;
                  if (b.getSelection) {
                    var T = b.getSelection(),
                      B = r.textContent.length,
                      Y = Math.min(d.start, B),
                      dt = d.end === void 0 ? Y : Math.min(d.end, B);
                    !T.extend && Y > dt && ((s = dt), (dt = Y), (Y = s));
                    var v = Qo(r, Y),
                      y = Qo(r, dt);
                    if (
                      v &&
                      y &&
                      (T.rangeCount !== 1 ||
                        T.anchorNode !== v.node ||
                        T.anchorOffset !== v.offset ||
                        T.focusNode !== y.node ||
                        T.focusOffset !== y.offset)
                    ) {
                      var S = M.createRange();
                      (S.setStart(v.node, v.offset),
                        T.removeAllRanges(),
                        Y > dt
                          ? (T.addRange(S), T.extend(y.node, y.offset))
                          : (S.setEnd(y.node, y.offset), T.addRange(S)));
                    }
                  }
                }
              }
              for (M = [], T = r; (T = T.parentNode); )
                T.nodeType === 1 &&
                  M.push({ element: T, left: T.scrollLeft, top: T.scrollTop });
              for (
                typeof r.focus == "function" && r.focus(), r = 0;
                r < M.length;
                r++
              ) {
                var E = M[r];
                ((E.element.scrollLeft = E.left),
                  (E.element.scrollTop = E.top));
              }
            }
            ((tu = !!hs), (ds = hs = null));
          } finally {
            ((it = l), (N.p = a), (q.T = n));
          }
        }
        ((t.current = e), (Bt = 2));
      }
    }
    function Fr() {
      if (Bt === 2) {
        Bt = 0;
        var t = pn,
          e = Ca,
          n = (e.flags & 8772) !== 0;
        if ((e.subtreeFlags & 8772) !== 0 || n) {
          ((n = q.T), (q.T = null));
          var a = N.p;
          N.p = 2;
          var l = it;
          it |= 4;
          try {
            Er(t, e.alternate, e);
          } finally {
            ((it = l), (N.p = a), (q.T = n));
          }
        }
        Bt = 3;
      }
    }
    function Wr() {
      if (Bt === 4 || Bt === 3) {
        ((Bt = 0), Ad());
        var t = pn,
          e = Ca,
          n = Pe,
          a = Hr;
        (e.subtreeFlags & 10256) !== 0 || (e.flags & 10256) !== 0
          ? (Bt = 5)
          : ((Bt = 0), (Ca = pn = null), Ir(t, t.pendingLanes));
        var l = t.pendingLanes;
        if (
          (l === 0 && (Sn = null),
          bu(n),
          (e = e.stateNode),
          ie && typeof ie.onCommitFiberRoot == "function")
        )
          try {
            ie.onCommitFiberRoot(
              Za,
              e,
              void 0,
              (e.current.flags & 128) === 128,
            );
          } catch {}
        if (a !== null) {
          ((e = q.T), (l = N.p), (N.p = 2), (q.T = null));
          try {
            for (var i = t.onRecoverableError, s = 0; s < a.length; s++) {
              var r = a[s];
              i(r.value, { componentStack: r.stack });
            }
          } finally {
            ((q.T = e), (N.p = l));
          }
        }
        ((Pe & 3) !== 0 && Yi(),
          tn(t),
          (l = t.pendingLanes),
          (n & 261930) !== 0 && (l & 42) !== 0
            ? t === ts
              ? Ml++
              : ((Ml = 0), (ts = t))
            : (Ml = 0),
          Rl(0, !1));
      }
    }
    function Ir(t, e) {
      (t.pooledCacheLanes &= e) === 0 &&
        ((e = t.pooledCache), e != null && ((t.pooledCache = null), cl(e)));
    }
    function Yi() {
      return ($r(), Fr(), Wr(), Pr());
    }
    function Pr() {
      if (Bt !== 5) return !1;
      var t = pn,
        e = Ic;
      Ic = 0;
      var n = bu(Pe),
        a = q.T,
        l = N.p;
      try {
        ((N.p = 32 > n ? 32 : n), (q.T = null), (n = Pc), (Pc = null));
        var i = pn,
          s = Pe;
        if (((Bt = 0), (Ca = pn = null), (Pe = 0), (it & 6) !== 0))
          throw Error(f(331));
        var r = it;
        if (
          ((it |= 4),
          Nr(i.current),
          Dr(i, i.current, s, n),
          (it = r),
          Rl(0, !1),
          ie && typeof ie.onPostCommitFiberRoot == "function")
        )
          try {
            ie.onPostCommitFiberRoot(Za, i);
          } catch {}
        return !0;
      } finally {
        ((N.p = l), (q.T = a), Ir(t, e));
      }
    }
    function th(t, e, n) {
      ((e = me(n, e)),
        (e = wc(t.stateNode, e, 2)),
        (t = Zn(t, e, 2)),
        t !== null && (Jl(t, 2), tn(t)));
    }
    function ot(t, e, n) {
      if (t.tag === 3) th(t, t, n);
      else
        for (; e !== null; ) {
          if (e.tag === 3) {
            th(e, t, n);
            break;
          } else if (e.tag === 1) {
            var a = e.stateNode;
            if (
              typeof e.type.getDerivedStateFromError == "function" ||
              (typeof a.componentDidCatch == "function" &&
                (Sn === null || !Sn.has(a)))
            ) {
              ((t = me(n, t)),
                (n = er(2)),
                (a = Zn(e, n, 2)),
                a !== null && (nr(n, a, e, t), Jl(a, 2), tn(a)));
              break;
            }
          }
          e = e.return;
        }
    }
    function as(t, e, n) {
      var a = t.pingCache;
      if (a === null) {
        a = t.pingCache = new xy();
        var l = new Set();
        a.set(e, l);
      } else ((l = a.get(e)), l === void 0 && ((l = new Set()), a.set(e, l)));
      l.has(n) ||
        (($c = !0), l.add(n), (t = Zy.bind(null, t, e, n)), e.then(t, t));
    }
    function Zy(t, e, n) {
      var a = t.pingCache;
      (a !== null && a.delete(e),
        (t.pingedLanes |= t.suspendedLanes & n),
        (t.warmLanes &= ~n),
        vt === t &&
          (W & n) === n &&
          (Et === 4 || (Et === 3 && (W & 62914560) === W && 300 > le() - Bi)
            ? (it & 2) === 0 && qa(t, 0)
            : (Fc |= n),
          za === W && (za = 0)),
        tn(t));
    }
    function eh(t, e) {
      (e === 0 && (e = $s()), (t = Qn(t, e)), t !== null && (Jl(t, e), tn(t)));
    }
    function ky(t) {
      var e = t.memoizedState,
        n = 0;
      (e !== null && (n = e.retryLane), eh(t, n));
    }
    function Ky(t, e) {
      var n = 0;
      switch (t.tag) {
        case 31:
        case 13:
          var a = t.stateNode,
            l = t.memoizedState;
          l !== null && (n = l.retryLane);
          break;
        case 19:
          a = t.stateNode;
          break;
        case 22:
          a = t.stateNode._retryCache;
          break;
        default:
          throw Error(f(314));
      }
      (a !== null && a.delete(e), eh(t, n));
    }
    function Jy(t, e) {
      return mu(t, e);
    }
    var Gi = null,
      wa = null,
      ls = !1,
      Xi = !1,
      is = !1,
      Tn = 0;
    function tn(t) {
      (t !== wa &&
        t.next === null &&
        (wa === null ? (Gi = wa = t) : (wa = wa.next = t)),
        (Xi = !0),
        ls || ((ls = !0), Fy()));
    }
    function Rl(t, e) {
      if (!is && Xi) {
        is = !0;
        do
          for (var n = !1, a = Gi; a !== null; ) {
            if (!e)
              if (t !== 0) {
                var l = a.pendingLanes;
                if (l === 0) var i = 0;
                else {
                  var s = a.suspendedLanes,
                    r = a.pingedLanes;
                  ((i = (1 << (31 - ue(42 | t) + 1)) - 1),
                    (i &= l & ~(s & ~r)),
                    (i = i & 201326741 ? (i & 201326741) | 1 : i ? i | 2 : 0));
                }
                i !== 0 && ((n = !0), ih(a, i));
              } else
                ((i = W),
                  (i = Kl(
                    a,
                    a === vt ? i : 0,
                    a.cancelPendingCommit !== null || a.timeoutHandle !== -1,
                  )),
                  (i & 3) === 0 || ka(a, i) || ((n = !0), ih(a, i)));
            a = a.next;
          }
        while (n);
        is = !1;
      }
    }
    function $y() {
      nh();
    }
    function nh() {
      Xi = ls = !1;
      var t = 0;
      Tn !== 0 && lg() && (t = Tn);
      for (var e = le(), n = null, a = Gi; a !== null; ) {
        var l = a.next,
          i = ah(a, e);
        (i === 0
          ? ((a.next = null),
            n === null ? (Gi = l) : (n.next = l),
            l === null && (wa = n))
          : ((n = a), (t !== 0 || (i & 3) !== 0) && (Xi = !0)),
          (a = l));
      }
      ((Bt !== 0 && Bt !== 5) || Rl(t, !1), Tn !== 0 && (Tn = 0));
    }
    function ah(t, e) {
      for (
        var n = t.suspendedLanes,
          a = t.pingedLanes,
          l = t.expirationTimes,
          i = t.pendingLanes & -62914561;
        0 < i;
      ) {
        var s = 31 - ue(i),
          r = 1 << s,
          d = l[s];
        (d === -1
          ? ((r & n) === 0 || (r & a) !== 0) && (l[s] = qd(r, e))
          : d <= e && (t.expiredLanes |= r),
          (i &= ~r));
      }
      if (
        ((e = vt),
        (n = W),
        (n = Kl(
          t,
          t === e ? n : 0,
          t.cancelPendingCommit !== null || t.timeoutHandle !== -1,
        )),
        (a = t.callbackNode),
        n === 0 ||
          (t === e && (st === 2 || st === 9)) ||
          t.cancelPendingCommit !== null)
      )
        return (
          a !== null && a !== null && Su(a),
          (t.callbackNode = null),
          (t.callbackPriority = 0)
        );
      if ((n & 3) === 0 || ka(t, n)) {
        if (((e = n & -n), e === t.callbackPriority)) return e;
        switch ((a !== null && Su(a), bu(n))) {
          case 2:
          case 8:
            n = Ks;
            break;
          case 32:
            n = Gl;
            break;
          case 268435456:
            n = Js;
            break;
          default:
            n = Gl;
        }
        return (
          (a = lh.bind(null, t)),
          (n = mu(n, a)),
          (t.callbackPriority = e),
          (t.callbackNode = n),
          e
        );
      }
      return (
        a !== null && a !== null && Su(a),
        (t.callbackPriority = 2),
        (t.callbackNode = null),
        2
      );
    }
    function lh(t, e) {
      if (Bt !== 0 && Bt !== 5)
        return ((t.callbackNode = null), (t.callbackPriority = 0), null);
      var n = t.callbackNode;
      if (Yi() && t.callbackNode !== n) return null;
      var a = W;
      return (
        (a = Kl(
          t,
          t === vt ? a : 0,
          t.cancelPendingCommit !== null || t.timeoutHandle !== -1,
        )),
        a === 0
          ? null
          : (Vr(t, a, e),
            ah(t, le()),
            t.callbackNode != null && t.callbackNode === n
              ? lh.bind(null, t)
              : null)
      );
    }
    function ih(t, e) {
      if (Yi()) return null;
      Vr(t, e, !0);
    }
    function Fy() {
      ug(function () {
        (it & 6) !== 0 ? mu(ks, $y) : nh();
      });
    }
    function us() {
      if (Tn === 0) {
        var t = ma;
        (t === 0 && ((t = Xl), (Xl <<= 1), (Xl & 261888) === 0 && (Xl = 256)),
          (Tn = t));
      }
      return Tn;
    }
    function uh(t) {
      return t == null || typeof t == "symbol" || typeof t == "boolean"
        ? null
        : typeof t == "function"
          ? t
          : Il("" + t);
    }
    function ch(t, e) {
      var n = e.ownerDocument.createElement("input");
      return (
        (n.name = e.name),
        (n.value = e.value),
        t.id && n.setAttribute("form", t.id),
        e.parentNode.insertBefore(n, e),
        (t = new FormData(t)),
        n.parentNode.removeChild(n),
        t
      );
    }
    function Wy(t, e, n, a, l) {
      if (e === "submit" && n && n.stateNode === l) {
        var i = uh((l[$t] || null).action),
          s = a.submitter;
        s &&
          ((e = (e = s[$t] || null)
            ? uh(e.formAction)
            : s.getAttribute("formAction")),
          e !== null && ((i = e), (s = null)));
        var r = new ni("action", "action", null, a, l);
        t.push({
          event: r,
          listeners: [
            {
              instance: null,
              listener: function () {
                if (a.defaultPrevented) {
                  if (Tn !== 0) {
                    var d = s ? ch(l, s) : new FormData(l);
                    Mc(
                      n,
                      { pending: !0, data: d, method: l.method, action: i },
                      null,
                      d,
                    );
                  }
                } else
                  typeof i == "function" &&
                    (r.preventDefault(),
                    (d = s ? ch(l, s) : new FormData(l)),
                    Mc(
                      n,
                      { pending: !0, data: d, method: l.method, action: i },
                      i,
                      d,
                    ));
              },
              currentTarget: l,
            },
          ],
        });
      }
    }
    for (var cs = 0; cs < Gu.length; cs++) {
      var ss = Gu[cs];
      ze(ss.toLowerCase(), "on" + (ss[0].toUpperCase() + ss.slice(1)));
    }
    (ze(xo, "onAnimationEnd"),
      ze(jo, "onAnimationIteration"),
      ze(Yo, "onAnimationStart"),
      ze("dblclick", "onDoubleClick"),
      ze("focusin", "onFocus"),
      ze("focusout", "onBlur"),
      ze(hy, "onTransitionRun"),
      ze(dy, "onTransitionStart"),
      ze(yy, "onTransitionCancel"),
      ze(Go, "onTransitionEnd"),
      aa("onMouseEnter", ["mouseout", "mouseover"]),
      aa("onMouseLeave", ["mouseout", "mouseover"]),
      aa("onPointerEnter", ["pointerout", "pointerover"]),
      aa("onPointerLeave", ["pointerout", "pointerover"]),
      Dn(
        "onChange",
        "change click focusin focusout input keydown keyup selectionchange".split(
          " ",
        ),
      ),
      Dn(
        "onSelect",
        "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
          " ",
        ),
      ),
      Dn("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]),
      Dn(
        "onCompositionEnd",
        "compositionend focusout keydown keypress keyup mousedown".split(" "),
      ),
      Dn(
        "onCompositionStart",
        "compositionstart focusout keydown keypress keyup mousedown".split(" "),
      ),
      Dn(
        "onCompositionUpdate",
        "compositionupdate focusout keydown keypress keyup mousedown".split(
          " ",
        ),
      ));
    var zl =
        "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
          " ",
        ),
      Iy = new Set(
        "beforetoggle cancel close invalid load scroll scrollend toggle"
          .split(" ")
          .concat(zl),
      );
    function sh(t, e) {
      e = (e & 4) !== 0;
      for (var n = 0; n < t.length; n++) {
        var a = t[n],
          l = a.event;
        a = a.listeners;
        t: {
          var i = void 0;
          if (e)
            for (var s = a.length - 1; 0 <= s; s--) {
              var r = a[s],
                d = r.instance,
                p = r.currentTarget;
              if (((r = r.listener), d !== i && l.isPropagationStopped()))
                break t;
              ((i = r), (l.currentTarget = p));
              try {
                i(l);
              } catch (_) {
                ii(_);
              }
              ((l.currentTarget = null), (i = d));
            }
          else
            for (s = 0; s < a.length; s++) {
              if (
                ((r = a[s]),
                (d = r.instance),
                (p = r.currentTarget),
                (r = r.listener),
                d !== i && l.isPropagationStopped())
              )
                break t;
              ((i = r), (l.currentTarget = p));
              try {
                i(l);
              } catch (_) {
                ii(_);
              }
              ((l.currentTarget = null), (i = d));
            }
        }
      }
    }
    function F(t, e) {
      var n = e[Tu];
      n === void 0 && (n = e[Tu] = new Set());
      var a = t + "__bubble";
      n.has(a) || (fh(e, t, 2, !1), n.add(a));
    }
    function os(t, e, n) {
      var a = 0;
      (e && (a |= 4), fh(n, t, a, e));
    }
    var Zi = "_reactListening" + Math.random().toString(36).slice(2);
    function oh(t) {
      if (!t[Zi]) {
        ((t[Zi] = !0),
          ao.forEach(function (n) {
            n !== "selectionchange" &&
              (Iy.has(n) || os(n, !1, t), os(n, !0, t));
          }));
        var e = t.nodeType === 9 ? t : t.ownerDocument;
        e === null || e[Zi] || ((e[Zi] = !0), os("selectionchange", !1, e));
      }
    }
    function fh(t, e, n, a) {
      switch (Hh(e)) {
        case 2:
          var l = zg;
          break;
        case 8:
          l = Cg;
          break;
        default:
          l = Es;
      }
      ((n = l.bind(null, e, n, t)),
        (l = void 0),
        !qu ||
          (e !== "touchstart" && e !== "touchmove" && e !== "wheel") ||
          (l = !0),
        a
          ? l !== void 0
            ? t.addEventListener(e, n, { capture: !0, passive: l })
            : t.addEventListener(e, n, !0)
          : l !== void 0
            ? t.addEventListener(e, n, { passive: l })
            : t.addEventListener(e, n, !1));
    }
    function fs(t, e, n, a, l) {
      var i = a;
      if ((e & 1) === 0 && (e & 2) === 0 && a !== null)
        t: for (;;) {
          if (a === null) return;
          var s = a.tag;
          if (s === 3 || s === 4) {
            var r = a.stateNode.containerInfo;
            if (r === l) break;
            if (s === 4)
              for (s = a.return; s !== null; ) {
                var d = s.tag;
                if ((d === 3 || d === 4) && s.stateNode.containerInfo === l)
                  return;
                s = s.return;
              }
            for (; r !== null; ) {
              if (((s = ta(r)), s === null)) return;
              if (((d = s.tag), d === 5 || d === 6 || d === 26 || d === 27)) {
                a = i = s;
                continue t;
              }
              r = r.parentNode;
            }
          }
          a = a.return;
        }
      vo(function () {
        var p = i,
          _ = zu(n),
          M = [];
        t: {
          var b = Xo.get(t);
          if (b !== void 0) {
            var T = ni,
              B = t;
            switch (t) {
              case "keypress":
                if (ti(n) === 0) break t;
              case "keydown":
              case "keyup":
                T = $d;
                break;
              case "focusin":
                ((B = "focus"), (T = Nu));
                break;
              case "focusout":
                ((B = "blur"), (T = Nu));
                break;
              case "beforeblur":
              case "afterblur":
                T = Nu;
                break;
              case "click":
                if (n.button === 2) break t;
              case "auxclick":
              case "dblclick":
              case "mousedown":
              case "mousemove":
              case "mouseup":
              case "mouseout":
              case "mouseover":
              case "contextmenu":
                T = po;
                break;
              case "drag":
              case "dragend":
              case "dragenter":
              case "dragexit":
              case "dragleave":
              case "dragover":
              case "dragstart":
              case "drop":
                T = Yd;
                break;
              case "touchcancel":
              case "touchend":
              case "touchmove":
              case "touchstart":
                T = Fd;
                break;
              case xo:
              case jo:
              case Yo:
                T = Gd;
                break;
              case Go:
                T = Wd;
                break;
              case "scroll":
              case "scrollend":
                T = jd;
                break;
              case "wheel":
                T = Id;
                break;
              case "copy":
              case "cut":
              case "paste":
                T = Xd;
                break;
              case "gotpointercapture":
              case "lostpointercapture":
              case "pointercancel":
              case "pointerdown":
              case "pointermove":
              case "pointerout":
              case "pointerover":
              case "pointerup":
                T = To;
                break;
              case "toggle":
              case "beforetoggle":
                T = Pd;
            }
            var Y = (e & 4) !== 0,
              dt = !Y && (t === "scroll" || t === "scrollend"),
              v = Y ? (b !== null ? b + "Capture" : null) : b;
            Y = [];
            for (var y = p, S; y !== null; ) {
              var E = y;
              if (
                ((S = E.stateNode),
                (E = E.tag),
                (E !== 5 && E !== 26 && E !== 27) ||
                  S === null ||
                  v === null ||
                  ((E = Fa(y, v)), E != null && Y.push(Cl(y, E, S))),
                dt)
              )
                break;
              y = y.return;
            }
            0 < Y.length &&
              ((b = new T(b, B, null, n, _)),
              M.push({ event: b, listeners: Y }));
          }
        }
        if ((e & 7) === 0) {
          t: {
            if (
              ((b = t === "mouseover" || t === "pointerover"),
              (T = t === "mouseout" || t === "pointerout"),
              b &&
                n !== Ru &&
                (B = n.relatedTarget || n.fromElement) &&
                (ta(B) || B[Ka]))
            )
              break t;
            if (
              (T || b) &&
              ((b =
                _.window === _
                  ? _
                  : (b = _.ownerDocument)
                    ? b.defaultView || b.parentWindow
                    : window),
              T
                ? ((B = n.relatedTarget || n.toElement),
                  (T = p),
                  (B = B ? ta(B) : null),
                  B !== null &&
                    ((dt = A(B)),
                    (Y = B.tag),
                    B !== dt || (Y !== 5 && Y !== 27 && Y !== 6)) &&
                    (B = null))
                : ((T = null), (B = p)),
              T !== B)
            ) {
              if (
                ((Y = po),
                (E = "onMouseLeave"),
                (v = "onMouseEnter"),
                (y = "mouse"),
                (t === "pointerout" || t === "pointerover") &&
                  ((Y = To),
                  (E = "onPointerLeave"),
                  (v = "onPointerEnter"),
                  (y = "pointer")),
                (dt = T == null ? b : $a(T)),
                (S = B == null ? b : $a(B)),
                (b = new Y(E, y + "leave", T, n, _)),
                (b.target = dt),
                (b.relatedTarget = S),
                (E = null),
                ta(_) === p &&
                  ((Y = new Y(v, y + "enter", B, n, _)),
                  (Y.target = S),
                  (Y.relatedTarget = dt),
                  (E = Y)),
                (dt = E),
                T && B)
              )
                e: {
                  for (Y = Py, v = T, y = B, S = 0, E = v; E; E = Y(E)) S++;
                  E = 0;
                  for (var x = y; x; x = Y(x)) E++;
                  for (; 0 < S - E; ) ((v = Y(v)), S--);
                  for (; 0 < E - S; ) ((y = Y(y)), E--);
                  for (; S--; ) {
                    if (v === y || (y !== null && v === y.alternate)) {
                      Y = v;
                      break e;
                    }
                    ((v = Y(v)), (y = Y(y)));
                  }
                  Y = null;
                }
              else Y = null;
              (T !== null && rh(M, b, T, Y, !1),
                B !== null && dt !== null && rh(M, dt, B, Y, !0));
            }
          }
          t: {
            if (
              ((b = p ? $a(p) : window),
              (T = b.nodeName && b.nodeName.toLowerCase()),
              T === "select" || (T === "input" && b.type === "file"))
            )
              var et = Co;
            else if (Ro(b))
              if (qo) et = oy;
              else {
                et = cy;
                var H = uy;
              }
            else
              ((T = b.nodeName),
                !T ||
                T.toLowerCase() !== "input" ||
                (b.type !== "checkbox" && b.type !== "radio")
                  ? p && Mu(p.elementType) && (et = Co)
                  : (et = sy));
            if (et && (et = et(t, p))) {
              zo(M, et, n, _);
              break t;
            }
            (H && H(t, b, p),
              t === "focusout" &&
                p &&
                b.type === "number" &&
                p.memoizedProps.value != null &&
                Ou(b, "number", b.value));
          }
          switch (((H = p ? $a(p) : window), t)) {
            case "focusin":
              (Ro(H) || H.contentEditable === "true") &&
                ((oa = H), (xu = p), (ll = null));
              break;
            case "focusout":
              ll = xu = oa = null;
              break;
            case "mousedown":
              ju = !0;
              break;
            case "contextmenu":
            case "mouseup":
            case "dragend":
              ((ju = !1), Lo(M, n, _));
              break;
            case "selectionchange":
              if (ry) break;
            case "keydown":
            case "keyup":
              Lo(M, n, _);
          }
          var Z;
          if (Bu)
            t: {
              switch (t) {
                case "compositionstart":
                  var I = "onCompositionStart";
                  break t;
                case "compositionend":
                  I = "onCompositionEnd";
                  break t;
                case "compositionupdate":
                  I = "onCompositionUpdate";
                  break t;
              }
              I = void 0;
            }
          else
            sa
              ? Oo(t, n) && (I = "onCompositionEnd")
              : t === "keydown" &&
                n.keyCode === 229 &&
                (I = "onCompositionStart");
          (I &&
            (Ao &&
              n.locale !== "ko" &&
              (sa || I !== "onCompositionStart"
                ? I === "onCompositionEnd" && sa && (Z = mo())
                : ((cn = _),
                  (Du = "value" in cn ? cn.value : cn.textContent),
                  (sa = !0))),
            (H = ki(p, I)),
            0 < H.length &&
              ((I = new bo(I, t, null, n, _)),
              M.push({ event: I, listeners: H }),
              Z ? (I.data = Z) : ((Z = Mo(n)), Z !== null && (I.data = Z)))),
            (Z = ey ? ny(t, n) : ay(t, n)) &&
              ((I = ki(p, "onBeforeInput")),
              0 < I.length &&
                ((H = new bo("onBeforeInput", "beforeinput", null, n, _)),
                M.push({ event: H, listeners: I }),
                (H.data = Z))),
            Wy(M, t, p, n, _));
        }
        sh(M, e);
      });
    }
    function Cl(t, e, n) {
      return { instance: t, listener: e, currentTarget: n };
    }
    function ki(t, e) {
      for (var n = e + "Capture", a = []; t !== null; ) {
        var l = t,
          i = l.stateNode;
        if (
          ((l = l.tag),
          (l !== 5 && l !== 26 && l !== 27) ||
            i === null ||
            ((l = Fa(t, n)),
            l != null && a.unshift(Cl(t, l, i)),
            (l = Fa(t, e)),
            l != null && a.push(Cl(t, l, i))),
          t.tag === 3)
        )
          return a;
        t = t.return;
      }
      return [];
    }
    function Py(t) {
      if (t === null) return null;
      do t = t.return;
      while (t && t.tag !== 5 && t.tag !== 27);
      return t || null;
    }
    function rh(t, e, n, a, l) {
      for (var i = e._reactName, s = []; n !== null && n !== a; ) {
        var r = n,
          d = r.alternate,
          p = r.stateNode;
        if (((r = r.tag), d !== null && d === a)) break;
        ((r !== 5 && r !== 26 && r !== 27) ||
          p === null ||
          ((d = p),
          l
            ? ((p = Fa(n, i)), p != null && s.unshift(Cl(n, p, d)))
            : l || ((p = Fa(n, i)), p != null && s.push(Cl(n, p, d)))),
          (n = n.return));
      }
      s.length !== 0 && t.push({ event: e, listeners: s });
    }
    var tg = /\r\n?/g,
      eg = /\u0000|\uFFFD/g;
    function hh(t) {
      return (typeof t == "string" ? t : "" + t)
        .replace(
          tg,
          `
`,
        )
        .replace(eg, "");
    }
    function dh(t, e) {
      return ((e = hh(e)), hh(t) === e);
    }
    function ht(t, e, n, a, l, i) {
      switch (n) {
        case "children":
          typeof a == "string"
            ? e === "body" || (e === "textarea" && a === "") || ia(t, a)
            : (typeof a == "number" || typeof a == "bigint") &&
              e !== "body" &&
              ia(t, "" + a);
          break;
        case "className":
          Fl(t, "class", a);
          break;
        case "tabIndex":
          Fl(t, "tabindex", a);
          break;
        case "dir":
        case "role":
        case "viewBox":
        case "width":
        case "height":
          Fl(t, n, a);
          break;
        case "style":
          yo(t, a, i);
          break;
        case "data":
          if (e !== "object") {
            Fl(t, "data", a);
            break;
          }
        case "src":
        case "href":
          if (a === "" && (e !== "a" || n !== "href")) {
            t.removeAttribute(n);
            break;
          }
          if (
            a == null ||
            typeof a == "function" ||
            typeof a == "symbol" ||
            typeof a == "boolean"
          ) {
            t.removeAttribute(n);
            break;
          }
          ((a = Il("" + a)), t.setAttribute(n, a));
          break;
        case "action":
        case "formAction":
          if (typeof a == "function") {
            t.setAttribute(
              n,
              "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')",
            );
            break;
          } else
            typeof i == "function" &&
              (n === "formAction"
                ? (e !== "input" && ht(t, e, "name", l.name, l, null),
                  ht(t, e, "formEncType", l.formEncType, l, null),
                  ht(t, e, "formMethod", l.formMethod, l, null),
                  ht(t, e, "formTarget", l.formTarget, l, null))
                : (ht(t, e, "encType", l.encType, l, null),
                  ht(t, e, "method", l.method, l, null),
                  ht(t, e, "target", l.target, l, null)));
          if (a == null || typeof a == "symbol" || typeof a == "boolean") {
            t.removeAttribute(n);
            break;
          }
          ((a = Il("" + a)), t.setAttribute(n, a));
          break;
        case "onClick":
          a != null && (t.onclick = Le);
          break;
        case "onScroll":
          a != null && F("scroll", t);
          break;
        case "onScrollEnd":
          a != null && F("scrollend", t);
          break;
        case "dangerouslySetInnerHTML":
          if (a != null) {
            if (typeof a != "object" || !("__html" in a)) throw Error(f(61));
            if (((n = a.__html), n != null)) {
              if (l.children != null) throw Error(f(60));
              t.innerHTML = n;
            }
          }
          break;
        case "multiple":
          t.multiple = a && typeof a != "function" && typeof a != "symbol";
          break;
        case "muted":
          t.muted = a && typeof a != "function" && typeof a != "symbol";
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
            a == null ||
            typeof a == "function" ||
            typeof a == "boolean" ||
            typeof a == "symbol"
          ) {
            t.removeAttribute("xlink:href");
            break;
          }
          ((n = Il("" + a)),
            t.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n));
          break;
        case "contentEditable":
        case "spellCheck":
        case "draggable":
        case "value":
        case "autoReverse":
        case "externalResourcesRequired":
        case "focusable":
        case "preserveAlpha":
          a != null && typeof a != "function" && typeof a != "symbol"
            ? t.setAttribute(n, "" + a)
            : t.removeAttribute(n);
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
          a && typeof a != "function" && typeof a != "symbol"
            ? t.setAttribute(n, "")
            : t.removeAttribute(n);
          break;
        case "capture":
        case "download":
          a === !0
            ? t.setAttribute(n, "")
            : a !== !1 &&
                a != null &&
                typeof a != "function" &&
                typeof a != "symbol"
              ? t.setAttribute(n, a)
              : t.removeAttribute(n);
          break;
        case "cols":
        case "rows":
        case "size":
        case "span":
          a != null &&
          typeof a != "function" &&
          typeof a != "symbol" &&
          !isNaN(a) &&
          1 <= a
            ? t.setAttribute(n, a)
            : t.removeAttribute(n);
          break;
        case "rowSpan":
        case "start":
          a == null ||
          typeof a == "function" ||
          typeof a == "symbol" ||
          isNaN(a)
            ? t.removeAttribute(n)
            : t.setAttribute(n, a);
          break;
        case "popover":
          (F("beforetoggle", t), F("toggle", t), $l(t, "popover", a));
          break;
        case "xlinkActuate":
          He(t, "http://www.w3.org/1999/xlink", "xlink:actuate", a);
          break;
        case "xlinkArcrole":
          He(t, "http://www.w3.org/1999/xlink", "xlink:arcrole", a);
          break;
        case "xlinkRole":
          He(t, "http://www.w3.org/1999/xlink", "xlink:role", a);
          break;
        case "xlinkShow":
          He(t, "http://www.w3.org/1999/xlink", "xlink:show", a);
          break;
        case "xlinkTitle":
          He(t, "http://www.w3.org/1999/xlink", "xlink:title", a);
          break;
        case "xlinkType":
          He(t, "http://www.w3.org/1999/xlink", "xlink:type", a);
          break;
        case "xmlBase":
          He(t, "http://www.w3.org/XML/1998/namespace", "xml:base", a);
          break;
        case "xmlLang":
          He(t, "http://www.w3.org/XML/1998/namespace", "xml:lang", a);
          break;
        case "xmlSpace":
          He(t, "http://www.w3.org/XML/1998/namespace", "xml:space", a);
          break;
        case "is":
          $l(t, "is", a);
          break;
        case "innerText":
        case "textContent":
          break;
        default:
          (!(2 < n.length) ||
            (n[0] !== "o" && n[0] !== "O") ||
            (n[1] !== "n" && n[1] !== "N")) &&
            ((n = Vd.get(n) || n), $l(t, n, a));
      }
    }
    function rs(t, e, n, a, l, i) {
      switch (n) {
        case "style":
          yo(t, a, i);
          break;
        case "dangerouslySetInnerHTML":
          if (a != null) {
            if (typeof a != "object" || !("__html" in a)) throw Error(f(61));
            if (((n = a.__html), n != null)) {
              if (l.children != null) throw Error(f(60));
              t.innerHTML = n;
            }
          }
          break;
        case "children":
          typeof a == "string"
            ? ia(t, a)
            : (typeof a == "number" || typeof a == "bigint") && ia(t, "" + a);
          break;
        case "onScroll":
          a != null && F("scroll", t);
          break;
        case "onScrollEnd":
          a != null && F("scrollend", t);
          break;
        case "onClick":
          a != null && (t.onclick = Le);
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
          if (!lo.hasOwnProperty(n))
            t: {
              if (
                n[0] === "o" &&
                n[1] === "n" &&
                ((l = n.endsWith("Capture")),
                (e = n.slice(2, l ? n.length - 7 : void 0)),
                (i = t[$t] || null),
                (i = i != null ? i[n] : null),
                typeof i == "function" && t.removeEventListener(e, i, l),
                typeof a == "function")
              ) {
                (typeof i != "function" &&
                  i !== null &&
                  (n in t
                    ? (t[n] = null)
                    : t.hasAttribute(n) && t.removeAttribute(n)),
                  t.addEventListener(e, a, l));
                break t;
              }
              n in t
                ? (t[n] = a)
                : a === !0
                  ? t.setAttribute(n, "")
                  : $l(t, n, a);
            }
      }
    }
    function Zt(t, e, n) {
      switch (e) {
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
          (F("error", t), F("load", t));
          var a = !1,
            l = !1,
            i;
          for (i in n)
            if (n.hasOwnProperty(i)) {
              var s = n[i];
              if (s != null)
                switch (i) {
                  case "src":
                    a = !0;
                    break;
                  case "srcSet":
                    l = !0;
                    break;
                  case "children":
                  case "dangerouslySetInnerHTML":
                    throw Error(f(137, e));
                  default:
                    ht(t, e, i, s, n, null);
                }
            }
          (l && ht(t, e, "srcSet", n.srcSet, n, null),
            a && ht(t, e, "src", n.src, n, null));
          return;
        case "input":
          F("invalid", t);
          var r = (i = s = l = null),
            d = null,
            p = null;
          for (a in n)
            if (n.hasOwnProperty(a)) {
              var _ = n[a];
              if (_ != null)
                switch (a) {
                  case "name":
                    l = _;
                    break;
                  case "type":
                    s = _;
                    break;
                  case "checked":
                    d = _;
                    break;
                  case "defaultChecked":
                    p = _;
                    break;
                  case "value":
                    i = _;
                    break;
                  case "defaultValue":
                    r = _;
                    break;
                  case "children":
                  case "dangerouslySetInnerHTML":
                    if (_ != null) throw Error(f(137, e));
                    break;
                  default:
                    ht(t, e, a, _, n, null);
                }
            }
          oo(t, i, r, d, p, s, l, !1);
          return;
        case "select":
          (F("invalid", t), (a = s = i = null));
          for (l in n)
            if (n.hasOwnProperty(l) && ((r = n[l]), r != null))
              switch (l) {
                case "value":
                  i = r;
                  break;
                case "defaultValue":
                  s = r;
                  break;
                case "multiple":
                  a = r;
                default:
                  ht(t, e, l, r, n, null);
              }
          ((e = i),
            (n = s),
            (t.multiple = !!a),
            e != null ? la(t, !!a, e, !1) : n != null && la(t, !!a, n, !0));
          return;
        case "textarea":
          (F("invalid", t), (i = l = a = null));
          for (s in n)
            if (n.hasOwnProperty(s) && ((r = n[s]), r != null))
              switch (s) {
                case "value":
                  a = r;
                  break;
                case "defaultValue":
                  l = r;
                  break;
                case "children":
                  i = r;
                  break;
                case "dangerouslySetInnerHTML":
                  if (r != null) throw Error(f(91));
                  break;
                default:
                  ht(t, e, s, r, n, null);
              }
          ro(t, a, l, i);
          return;
        case "option":
          for (d in n)
            if (n.hasOwnProperty(d) && ((a = n[d]), a != null))
              switch (d) {
                case "selected":
                  t.selected =
                    a && typeof a != "function" && typeof a != "symbol";
                  break;
                default:
                  ht(t, e, d, a, n, null);
              }
          return;
        case "dialog":
          (F("beforetoggle", t), F("toggle", t), F("cancel", t), F("close", t));
          break;
        case "iframe":
        case "object":
          F("load", t);
          break;
        case "video":
        case "audio":
          for (a = 0; a < zl.length; a++) F(zl[a], t);
          break;
        case "image":
          (F("error", t), F("load", t));
          break;
        case "details":
          F("toggle", t);
          break;
        case "embed":
        case "source":
        case "link":
          (F("error", t), F("load", t));
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
          for (p in n)
            if (n.hasOwnProperty(p) && ((a = n[p]), a != null))
              switch (p) {
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(f(137, e));
                default:
                  ht(t, e, p, a, n, null);
              }
          return;
        default:
          if (Mu(e)) {
            for (_ in n)
              n.hasOwnProperty(_) &&
                ((a = n[_]), a !== void 0 && rs(t, e, _, a, n, void 0));
            return;
          }
      }
      for (r in n)
        n.hasOwnProperty(r) &&
          ((a = n[r]), a != null && ht(t, e, r, a, n, null));
    }
    function ng(t, e, n, a) {
      switch (e) {
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
          var l = null,
            i = null,
            s = null,
            r = null,
            d = null,
            p = null,
            _ = null;
          for (T in n) {
            var M = n[T];
            if (n.hasOwnProperty(T) && M != null)
              switch (T) {
                case "checked":
                  break;
                case "value":
                  break;
                case "defaultValue":
                  d = M;
                default:
                  a.hasOwnProperty(T) || ht(t, e, T, null, a, M);
              }
          }
          for (var b in a) {
            var T = a[b];
            if (((M = n[b]), a.hasOwnProperty(b) && (T != null || M != null)))
              switch (b) {
                case "type":
                  i = T;
                  break;
                case "name":
                  l = T;
                  break;
                case "checked":
                  p = T;
                  break;
                case "defaultChecked":
                  _ = T;
                  break;
                case "value":
                  s = T;
                  break;
                case "defaultValue":
                  r = T;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (T != null) throw Error(f(137, e));
                  break;
                default:
                  T !== M && ht(t, e, b, T, a, M);
              }
          }
          Eu(t, s, r, d, p, _, i, l);
          return;
        case "select":
          T = s = r = b = null;
          for (i in n)
            if (((d = n[i]), n.hasOwnProperty(i) && d != null))
              switch (i) {
                case "value":
                  break;
                case "multiple":
                  T = d;
                default:
                  a.hasOwnProperty(i) || ht(t, e, i, null, a, d);
              }
          for (l in a)
            if (
              ((i = a[l]),
              (d = n[l]),
              a.hasOwnProperty(l) && (i != null || d != null))
            )
              switch (l) {
                case "value":
                  b = i;
                  break;
                case "defaultValue":
                  r = i;
                  break;
                case "multiple":
                  s = i;
                default:
                  i !== d && ht(t, e, l, i, a, d);
              }
          ((e = r),
            (n = s),
            (a = T),
            b != null
              ? la(t, !!n, b, !1)
              : !!a != !!n &&
                (e != null ? la(t, !!n, e, !0) : la(t, !!n, n ? [] : "", !1)));
          return;
        case "textarea":
          T = b = null;
          for (r in n)
            if (
              ((l = n[r]),
              n.hasOwnProperty(r) && l != null && !a.hasOwnProperty(r))
            )
              switch (r) {
                case "value":
                  break;
                case "children":
                  break;
                default:
                  ht(t, e, r, null, a, l);
              }
          for (s in a)
            if (
              ((l = a[s]),
              (i = n[s]),
              a.hasOwnProperty(s) && (l != null || i != null))
            )
              switch (s) {
                case "value":
                  b = l;
                  break;
                case "defaultValue":
                  T = l;
                  break;
                case "children":
                  break;
                case "dangerouslySetInnerHTML":
                  if (l != null) throw Error(f(91));
                  break;
                default:
                  l !== i && ht(t, e, s, l, a, i);
              }
          fo(t, b, T);
          return;
        case "option":
          for (var B in n)
            if (
              ((b = n[B]),
              n.hasOwnProperty(B) && b != null && !a.hasOwnProperty(B))
            )
              switch (B) {
                case "selected":
                  t.selected = !1;
                  break;
                default:
                  ht(t, e, B, null, a, b);
              }
          for (d in a)
            if (
              ((b = a[d]),
              (T = n[d]),
              a.hasOwnProperty(d) && b !== T && (b != null || T != null))
            )
              switch (d) {
                case "selected":
                  t.selected =
                    b && typeof b != "function" && typeof b != "symbol";
                  break;
                default:
                  ht(t, e, d, b, a, T);
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
          for (var Y in n)
            ((b = n[Y]),
              n.hasOwnProperty(Y) &&
                b != null &&
                !a.hasOwnProperty(Y) &&
                ht(t, e, Y, null, a, b));
          for (p in a)
            if (
              ((b = a[p]),
              (T = n[p]),
              a.hasOwnProperty(p) && b !== T && (b != null || T != null))
            )
              switch (p) {
                case "children":
                case "dangerouslySetInnerHTML":
                  if (b != null) throw Error(f(137, e));
                  break;
                default:
                  ht(t, e, p, b, a, T);
              }
          return;
        default:
          if (Mu(e)) {
            for (var dt in n)
              ((b = n[dt]),
                n.hasOwnProperty(dt) &&
                  b !== void 0 &&
                  !a.hasOwnProperty(dt) &&
                  rs(t, e, dt, void 0, a, b));
            for (_ in a)
              ((b = a[_]),
                (T = n[_]),
                !a.hasOwnProperty(_) ||
                  b === T ||
                  (b === void 0 && T === void 0) ||
                  rs(t, e, _, b, a, T));
            return;
          }
      }
      for (var v in n)
        ((b = n[v]),
          n.hasOwnProperty(v) &&
            b != null &&
            !a.hasOwnProperty(v) &&
            ht(t, e, v, null, a, b));
      for (M in a)
        ((b = a[M]),
          (T = n[M]),
          !a.hasOwnProperty(M) ||
            b === T ||
            (b == null && T == null) ||
            ht(t, e, M, b, a, T));
    }
    function yh(t) {
      switch (t) {
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
    function ag() {
      if (typeof performance.getEntriesByType == "function") {
        for (
          var t = 0, e = 0, n = performance.getEntriesByType("resource"), a = 0;
          a < n.length;
          a++
        ) {
          var l = n[a],
            i = l.transferSize,
            s = l.initiatorType,
            r = l.duration;
          if (i && r && yh(s)) {
            for (s = 0, r = l.responseEnd, a += 1; a < n.length; a++) {
              var d = n[a],
                p = d.startTime;
              if (p > r) break;
              var _ = d.transferSize,
                M = d.initiatorType;
              _ &&
                yh(M) &&
                ((d = d.responseEnd),
                (s += _ * (d < r ? 1 : (r - p) / (d - p))));
            }
            if ((--a, (e += (8 * (i + s)) / (l.duration / 1e3)), t++, 10 < t))
              break;
          }
        }
        if (0 < t) return e / t / 1e6;
      }
      return navigator.connection &&
        ((t = navigator.connection.downlink), typeof t == "number")
        ? t
        : 5;
    }
    var hs = null,
      ds = null;
    function Ki(t) {
      return t.nodeType === 9 ? t : t.ownerDocument;
    }
    function gh(t) {
      switch (t) {
        case "http://www.w3.org/2000/svg":
          return 1;
        case "http://www.w3.org/1998/Math/MathML":
          return 2;
        default:
          return 0;
      }
    }
    function vh(t, e) {
      if (t === 0)
        switch (e) {
          case "svg":
            return 1;
          case "math":
            return 2;
          default:
            return 0;
        }
      return t === 1 && e === "foreignObject" ? 0 : t;
    }
    function ys(t, e) {
      return (
        t === "textarea" ||
        t === "noscript" ||
        typeof e.children == "string" ||
        typeof e.children == "number" ||
        typeof e.children == "bigint" ||
        (typeof e.dangerouslySetInnerHTML == "object" &&
          e.dangerouslySetInnerHTML !== null &&
          e.dangerouslySetInnerHTML.__html != null)
      );
    }
    var gs = null;
    function lg() {
      var t = window.event;
      return t && t.type === "popstate"
        ? t === gs
          ? !1
          : ((gs = t), !0)
        : ((gs = null), !1);
    }
    var mh = typeof setTimeout == "function" ? setTimeout : void 0,
      ig = typeof clearTimeout == "function" ? clearTimeout : void 0,
      Sh = typeof Promise == "function" ? Promise : void 0,
      ug =
        typeof queueMicrotask == "function"
          ? queueMicrotask
          : typeof Sh < "u"
            ? function (t) {
                return Sh.resolve(null).then(t).catch(cg);
              }
            : mh;
    function cg(t) {
      setTimeout(function () {
        throw t;
      });
    }
    function An(t) {
      return t === "head";
    }
    function ph(t, e) {
      var n = e,
        a = 0;
      do {
        var l = n.nextSibling;
        if ((t.removeChild(n), l && l.nodeType === 8))
          if (((n = l.data), n === "/$" || n === "/&")) {
            if (a === 0) {
              (t.removeChild(l), Ba(e));
              return;
            }
            a--;
          } else if (
            n === "$" ||
            n === "$?" ||
            n === "$~" ||
            n === "$!" ||
            n === "&"
          )
            a++;
          else if (n === "html") ql(t.ownerDocument.documentElement);
          else if (n === "head") {
            ((n = t.ownerDocument.head), ql(n));
            for (var i = n.firstChild; i; ) {
              var s = i.nextSibling,
                r = i.nodeName;
              (i[Ja] ||
                r === "SCRIPT" ||
                r === "STYLE" ||
                (r === "LINK" && i.rel.toLowerCase() === "stylesheet") ||
                n.removeChild(i),
                (i = s));
            }
          } else n === "body" && ql(t.ownerDocument.body);
        n = l;
      } while (n);
      Ba(e);
    }
    function bh(t, e) {
      var n = t;
      t = 0;
      do {
        var a = n.nextSibling;
        if (
          (n.nodeType === 1
            ? e
              ? ((n._stashedDisplay = n.style.display),
                (n.style.display = "none"))
              : ((n.style.display = n._stashedDisplay || ""),
                n.getAttribute("style") === "" && n.removeAttribute("style"))
            : n.nodeType === 3 &&
              (e
                ? ((n._stashedText = n.nodeValue), (n.nodeValue = ""))
                : (n.nodeValue = n._stashedText || "")),
          a && a.nodeType === 8)
        )
          if (((n = a.data), n === "/$")) {
            if (t === 0) break;
            t--;
          } else (n !== "$" && n !== "$?" && n !== "$~" && n !== "$!") || t++;
        n = a;
      } while (n);
    }
    function vs(t) {
      var e = t.firstChild;
      for (e && e.nodeType === 10 && (e = e.nextSibling); e; ) {
        var n = e;
        switch (((e = e.nextSibling), n.nodeName)) {
          case "HTML":
          case "HEAD":
          case "BODY":
            (vs(n), Au(n));
            continue;
          case "SCRIPT":
          case "STYLE":
            continue;
          case "LINK":
            if (n.rel.toLowerCase() === "stylesheet") continue;
        }
        t.removeChild(n);
      }
    }
    function sg(t, e, n, a) {
      for (; t.nodeType === 1; ) {
        var l = n;
        if (t.nodeName.toLowerCase() !== e.toLowerCase()) {
          if (!a && (t.nodeName !== "INPUT" || t.type !== "hidden")) break;
        } else if (a) {
          if (!t[Ja])
            switch (e) {
              case "meta":
                if (!t.hasAttribute("itemprop")) break;
                return t;
              case "link":
                if (
                  ((i = t.getAttribute("rel")),
                  i === "stylesheet" && t.hasAttribute("data-precedence"))
                )
                  break;
                if (
                  i !== l.rel ||
                  t.getAttribute("href") !==
                    (l.href == null || l.href === "" ? null : l.href) ||
                  t.getAttribute("crossorigin") !==
                    (l.crossOrigin == null ? null : l.crossOrigin) ||
                  t.getAttribute("title") !== (l.title == null ? null : l.title)
                )
                  break;
                return t;
              case "style":
                if (t.hasAttribute("data-precedence")) break;
                return t;
              case "script":
                if (
                  ((i = t.getAttribute("src")),
                  (i !== (l.src == null ? null : l.src) ||
                    t.getAttribute("type") !==
                      (l.type == null ? null : l.type) ||
                    t.getAttribute("crossorigin") !==
                      (l.crossOrigin == null ? null : l.crossOrigin)) &&
                    i &&
                    t.hasAttribute("async") &&
                    !t.hasAttribute("itemprop"))
                )
                  break;
                return t;
              default:
                return t;
            }
        } else if (e === "input" && t.type === "hidden") {
          var i = l.name == null ? null : "" + l.name;
          if (l.type === "hidden" && t.getAttribute("name") === i) return t;
        } else return t;
        if (((t = _e(t.nextSibling)), t === null)) break;
      }
      return null;
    }
    function og(t, e, n) {
      if (e === "") return null;
      for (; t.nodeType !== 3; )
        if (
          ((t.nodeType !== 1 ||
            t.nodeName !== "INPUT" ||
            t.type !== "hidden") &&
            !n) ||
          ((t = _e(t.nextSibling)), t === null)
        )
          return null;
      return t;
    }
    function Th(t, e) {
      for (; t.nodeType !== 8; )
        if (
          ((t.nodeType !== 1 ||
            t.nodeName !== "INPUT" ||
            t.type !== "hidden") &&
            !e) ||
          ((t = _e(t.nextSibling)), t === null)
        )
          return null;
      return t;
    }
    function ms(t) {
      return t.data === "$?" || t.data === "$~";
    }
    function Ss(t) {
      return (
        t.data === "$!" ||
        (t.data === "$?" && t.ownerDocument.readyState !== "loading")
      );
    }
    function fg(t, e) {
      var n = t.ownerDocument;
      if (t.data === "$~") t._reactRetry = e;
      else if (t.data !== "$?" || n.readyState !== "loading") e();
      else {
        var a = function () {
          (e(), n.removeEventListener("DOMContentLoaded", a));
        };
        (n.addEventListener("DOMContentLoaded", a), (t._reactRetry = a));
      }
    }
    function _e(t) {
      for (; t != null; t = t.nextSibling) {
        var e = t.nodeType;
        if (e === 1 || e === 3) break;
        if (e === 8) {
          if (
            ((e = t.data),
            e === "$" ||
              e === "$!" ||
              e === "$?" ||
              e === "$~" ||
              e === "&" ||
              e === "F!" ||
              e === "F")
          )
            break;
          if (e === "/$" || e === "/&") return null;
        }
      }
      return t;
    }
    var ps = null;
    function Ah(t) {
      t = t.nextSibling;
      for (var e = 0; t; ) {
        if (t.nodeType === 8) {
          var n = t.data;
          if (n === "/$" || n === "/&") {
            if (e === 0) return _e(t.nextSibling);
            e--;
          } else
            (n !== "$" &&
              n !== "$!" &&
              n !== "$?" &&
              n !== "$~" &&
              n !== "&") ||
              e++;
        }
        t = t.nextSibling;
      }
      return null;
    }
    function _h(t) {
      t = t.previousSibling;
      for (var e = 0; t; ) {
        if (t.nodeType === 8) {
          var n = t.data;
          if (
            n === "$" ||
            n === "$!" ||
            n === "$?" ||
            n === "$~" ||
            n === "&"
          ) {
            if (e === 0) return t;
            e--;
          } else (n !== "/$" && n !== "/&") || e++;
        }
        t = t.previousSibling;
      }
      return null;
    }
    function Eh(t, e, n) {
      switch (((e = Ki(n)), t)) {
        case "html":
          if (((t = e.documentElement), !t)) throw Error(f(452));
          return t;
        case "head":
          if (((t = e.head), !t)) throw Error(f(453));
          return t;
        case "body":
          if (((t = e.body), !t)) throw Error(f(454));
          return t;
        default:
          throw Error(f(451));
      }
    }
    function ql(t) {
      for (var e = t.attributes; e.length; ) t.removeAttributeNode(e[0]);
      Au(t);
    }
    var Ee = new Map(),
      Oh = new Set();
    function Ji(t) {
      return typeof t.getRootNode == "function"
        ? t.getRootNode()
        : t.nodeType === 9
          ? t
          : t.ownerDocument;
    }
    var en = N.d;
    N.d = { f: rg, r: hg, D: dg, C: yg, L: gg, m: vg, X: Sg, S: mg, M: pg };
    function rg() {
      var t = en.f(),
        e = Vi();
      return t || e;
    }
    function hg(t) {
      var e = ea(t);
      e !== null && e.tag === 5 && e.type === "form" ? Xf(e) : en.r(t);
    }
    var Ua = typeof document > "u" ? null : document;
    function Mh(t, e, n) {
      var a = Ua;
      if (a && typeof e == "string" && e) {
        var l = ge(e);
        ((l = 'link[rel="' + t + '"][href="' + l + '"]'),
          typeof n == "string" && (l += '[crossorigin="' + n + '"]'),
          Oh.has(l) ||
            (Oh.add(l),
            (t = { rel: t, crossOrigin: n, href: e }),
            a.querySelector(l) === null &&
              ((e = a.createElement("link")),
              Zt(e, "link", t),
              Ht(e),
              a.head.appendChild(e))));
      }
    }
    function dg(t) {
      (en.D(t), Mh("dns-prefetch", t, null));
    }
    function yg(t, e) {
      (en.C(t, e), Mh("preconnect", t, e));
    }
    function gg(t, e, n) {
      en.L(t, e, n);
      var a = Ua;
      if (a && t && e) {
        var l = 'link[rel="preload"][as="' + ge(e) + '"]';
        e === "image" && n && n.imageSrcSet
          ? ((l += '[imagesrcset="' + ge(n.imageSrcSet) + '"]'),
            typeof n.imageSizes == "string" &&
              (l += '[imagesizes="' + ge(n.imageSizes) + '"]'))
          : (l += '[href="' + ge(t) + '"]');
        var i = l;
        switch (e) {
          case "style":
            i = Na(t);
            break;
          case "script":
            i = Qa(t);
        }
        Ee.has(i) ||
          ((t = C(
            {
              rel: "preload",
              href: e === "image" && n && n.imageSrcSet ? void 0 : t,
              as: e,
            },
            n,
          )),
          Ee.set(i, t),
          a.querySelector(l) !== null ||
            (e === "style" && a.querySelector(Dl(i))) ||
            (e === "script" && a.querySelector(wl(i))) ||
            ((e = a.createElement("link")),
            Zt(e, "link", t),
            Ht(e),
            a.head.appendChild(e)));
      }
    }
    function vg(t, e) {
      en.m(t, e);
      var n = Ua;
      if (n && t) {
        var a = e && typeof e.as == "string" ? e.as : "script",
          l =
            'link[rel="modulepreload"][as="' +
            ge(a) +
            '"][href="' +
            ge(t) +
            '"]',
          i = l;
        switch (a) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            i = Qa(t);
        }
        if (
          !Ee.has(i) &&
          ((t = C({ rel: "modulepreload", href: t }, e)),
          Ee.set(i, t),
          n.querySelector(l) === null)
        ) {
          switch (a) {
            case "audioworklet":
            case "paintworklet":
            case "serviceworker":
            case "sharedworker":
            case "worker":
            case "script":
              if (n.querySelector(wl(i))) return;
          }
          ((a = n.createElement("link")),
            Zt(a, "link", t),
            Ht(a),
            n.head.appendChild(a));
        }
      }
    }
    function mg(t, e, n) {
      en.S(t, e, n);
      var a = Ua;
      if (a && t) {
        var l = na(a).hoistableStyles,
          i = Na(t);
        e = e || "default";
        var s = l.get(i);
        if (!s) {
          var r = { loading: 0, preload: null };
          if ((s = a.querySelector(Dl(i)))) r.loading = 5;
          else {
            ((t = C({ rel: "stylesheet", href: t, "data-precedence": e }, n)),
              (n = Ee.get(i)) && bs(t, n));
            var d = (s = a.createElement("link"));
            (Ht(d),
              Zt(d, "link", t),
              (d._p = new Promise(function (p, _) {
                ((d.onload = p), (d.onerror = _));
              })),
              d.addEventListener("load", function () {
                r.loading |= 1;
              }),
              d.addEventListener("error", function () {
                r.loading |= 2;
              }),
              (r.loading |= 4),
              $i(s, e, a));
          }
          ((s = { type: "stylesheet", instance: s, count: 1, state: r }),
            l.set(i, s));
        }
      }
    }
    function Sg(t, e) {
      en.X(t, e);
      var n = Ua;
      if (n && t) {
        var a = na(n).hoistableScripts,
          l = Qa(t),
          i = a.get(l);
        i ||
          ((i = n.querySelector(wl(l))),
          i ||
            ((t = C({ src: t, async: !0 }, e)),
            (e = Ee.get(l)) && Ts(t, e),
            (i = n.createElement("script")),
            Ht(i),
            Zt(i, "link", t),
            n.head.appendChild(i)),
          (i = { type: "script", instance: i, count: 1, state: null }),
          a.set(l, i));
      }
    }
    function pg(t, e) {
      en.M(t, e);
      var n = Ua;
      if (n && t) {
        var a = na(n).hoistableScripts,
          l = Qa(t),
          i = a.get(l);
        i ||
          ((i = n.querySelector(wl(l))),
          i ||
            ((t = C({ src: t, async: !0, type: "module" }, e)),
            (e = Ee.get(l)) && Ts(t, e),
            (i = n.createElement("script")),
            Ht(i),
            Zt(i, "link", t),
            n.head.appendChild(i)),
          (i = { type: "script", instance: i, count: 1, state: null }),
          a.set(l, i));
      }
    }
    function Rh(t, e, n, a) {
      var l = (l = J.current) ? Ji(l) : null;
      if (!l) throw Error(f(446));
      switch (t) {
        case "meta":
        case "title":
          return null;
        case "style":
          return typeof n.precedence == "string" && typeof n.href == "string"
            ? ((e = Na(n.href)),
              (n = na(l).hoistableStyles),
              (a = n.get(e)),
              a ||
                ((a = { type: "style", instance: null, count: 0, state: null }),
                n.set(e, a)),
              a)
            : { type: "void", instance: null, count: 0, state: null };
        case "link":
          if (
            n.rel === "stylesheet" &&
            typeof n.href == "string" &&
            typeof n.precedence == "string"
          ) {
            t = Na(n.href);
            var i = na(l).hoistableStyles,
              s = i.get(t);
            if (
              (s ||
                ((l = l.ownerDocument || l),
                (s = {
                  type: "stylesheet",
                  instance: null,
                  count: 0,
                  state: { loading: 0, preload: null },
                }),
                i.set(t, s),
                (i = l.querySelector(Dl(t))) &&
                  !i._p &&
                  ((s.instance = i), (s.state.loading = 5)),
                Ee.has(t) ||
                  ((n = {
                    rel: "preload",
                    as: "style",
                    href: n.href,
                    crossOrigin: n.crossOrigin,
                    integrity: n.integrity,
                    media: n.media,
                    hrefLang: n.hrefLang,
                    referrerPolicy: n.referrerPolicy,
                  }),
                  Ee.set(t, n),
                  i || bg(l, t, n, s.state))),
              e && a === null)
            )
              throw Error(f(528, ""));
            return s;
          }
          if (e && a !== null) throw Error(f(529, ""));
          return null;
        case "script":
          return (
            (e = n.async),
            (n = n.src),
            typeof n == "string" &&
            e &&
            typeof e != "function" &&
            typeof e != "symbol"
              ? ((e = Qa(n)),
                (n = na(l).hoistableScripts),
                (a = n.get(e)),
                a ||
                  ((a = {
                    type: "script",
                    instance: null,
                    count: 0,
                    state: null,
                  }),
                  n.set(e, a)),
                a)
              : { type: "void", instance: null, count: 0, state: null }
          );
        default:
          throw Error(f(444, t));
      }
    }
    function Na(t) {
      return 'href="' + ge(t) + '"';
    }
    function Dl(t) {
      return 'link[rel="stylesheet"][' + t + "]";
    }
    function zh(t) {
      return C({}, t, { "data-precedence": t.precedence, precedence: null });
    }
    function bg(t, e, n, a) {
      t.querySelector('link[rel="preload"][as="style"][' + e + "]")
        ? (a.loading = 1)
        : ((e = t.createElement("link")),
          (a.preload = e),
          e.addEventListener("load", function () {
            return (a.loading |= 1);
          }),
          e.addEventListener("error", function () {
            return (a.loading |= 2);
          }),
          Zt(e, "link", n),
          Ht(e),
          t.head.appendChild(e));
    }
    function Qa(t) {
      return '[src="' + ge(t) + '"]';
    }
    function wl(t) {
      return "script[async]" + t;
    }
    function Ch(t, e, n) {
      if ((e.count++, e.instance === null))
        switch (e.type) {
          case "style":
            var a = t.querySelector('style[data-href~="' + ge(n.href) + '"]');
            if (a) return ((e.instance = a), Ht(a), a);
            var l = C({}, n, {
              "data-href": n.href,
              "data-precedence": n.precedence,
              href: null,
              precedence: null,
            });
            return (
              (a = (t.ownerDocument || t).createElement("style")),
              Ht(a),
              Zt(a, "style", l),
              $i(a, n.precedence, t),
              (e.instance = a)
            );
          case "stylesheet":
            l = Na(n.href);
            var i = t.querySelector(Dl(l));
            if (i) return ((e.state.loading |= 4), (e.instance = i), Ht(i), i);
            ((a = zh(n)),
              (l = Ee.get(l)) && bs(a, l),
              (i = (t.ownerDocument || t).createElement("link")),
              Ht(i));
            var s = i;
            return (
              (s._p = new Promise(function (r, d) {
                ((s.onload = r), (s.onerror = d));
              })),
              Zt(i, "link", a),
              (e.state.loading |= 4),
              $i(i, n.precedence, t),
              (e.instance = i)
            );
          case "script":
            return (
              (i = Qa(n.src)),
              (l = t.querySelector(wl(i)))
                ? ((e.instance = l), Ht(l), l)
                : ((a = n),
                  (l = Ee.get(i)) && ((a = C({}, n)), Ts(a, l)),
                  (t = t.ownerDocument || t),
                  (l = t.createElement("script")),
                  Ht(l),
                  Zt(l, "link", a),
                  t.head.appendChild(l),
                  (e.instance = l))
            );
          case "void":
            return null;
          default:
            throw Error(f(443, e.type));
        }
      else
        e.type === "stylesheet" &&
          (e.state.loading & 4) === 0 &&
          ((a = e.instance), (e.state.loading |= 4), $i(a, n.precedence, t));
      return e.instance;
    }
    function $i(t, e, n) {
      for (
        var a = n.querySelectorAll(
            'link[rel="stylesheet"][data-precedence],style[data-precedence]',
          ),
          l = a.length ? a[a.length - 1] : null,
          i = l,
          s = 0;
        s < a.length;
        s++
      ) {
        var r = a[s];
        if (r.dataset.precedence === e) i = r;
        else if (i !== l) break;
      }
      i
        ? i.parentNode.insertBefore(t, i.nextSibling)
        : ((e = n.nodeType === 9 ? n.head : n),
          e.insertBefore(t, e.firstChild));
    }
    function bs(t, e) {
      ((t.crossOrigin ??= e.crossOrigin),
        (t.referrerPolicy ??= e.referrerPolicy),
        (t.title ??= e.title));
    }
    function Ts(t, e) {
      ((t.crossOrigin ??= e.crossOrigin),
        (t.referrerPolicy ??= e.referrerPolicy),
        (t.integrity ??= e.integrity));
    }
    var Fi = null;
    function qh(t, e, n) {
      if (Fi === null) {
        var a = new Map(),
          l = (Fi = new Map());
        l.set(n, a);
      } else ((l = Fi), (a = l.get(n)), a || ((a = new Map()), l.set(n, a)));
      if (a.has(t)) return a;
      for (
        a.set(t, null), n = n.getElementsByTagName(t), l = 0;
        l < n.length;
        l++
      ) {
        var i = n[l];
        if (
          !(
            i[Ja] ||
            i[jt] ||
            (t === "link" && i.getAttribute("rel") === "stylesheet")
          ) &&
          i.namespaceURI !== "http://www.w3.org/2000/svg"
        ) {
          var s = i.getAttribute(e) || "";
          s = t + s;
          var r = a.get(s);
          r ? r.push(i) : a.set(s, [i]);
        }
      }
      return a;
    }
    function Dh(t, e, n) {
      ((t = t.ownerDocument || t),
        t.head.insertBefore(
          n,
          e === "title" ? t.querySelector("head > title") : null,
        ));
    }
    function Tg(t, e, n) {
      if (n === 1 || e.itemProp != null) return !1;
      switch (t) {
        case "meta":
        case "title":
          return !0;
        case "style":
          if (
            typeof e.precedence != "string" ||
            typeof e.href != "string" ||
            e.href === ""
          )
            break;
          return !0;
        case "link":
          if (
            typeof e.rel != "string" ||
            typeof e.href != "string" ||
            e.href === "" ||
            e.onLoad ||
            e.onError
          )
            break;
          switch (e.rel) {
            case "stylesheet":
              return (
                (t = e.disabled),
                typeof e.precedence == "string" && t == null
              );
            default:
              return !0;
          }
        case "script":
          if (
            e.async &&
            typeof e.async != "function" &&
            typeof e.async != "symbol" &&
            !e.onLoad &&
            !e.onError &&
            e.src &&
            typeof e.src == "string"
          )
            return !0;
      }
      return !1;
    }
    function wh(t) {
      return !(t.type === "stylesheet" && (t.state.loading & 3) === 0);
    }
    function Ag(t, e, n, a) {
      if (
        n.type === "stylesheet" &&
        (typeof a.media != "string" || matchMedia(a.media).matches !== !1) &&
        (n.state.loading & 4) === 0
      ) {
        if (n.instance === null) {
          var l = Na(a.href),
            i = e.querySelector(Dl(l));
          if (i) {
            ((e = i._p),
              e !== null &&
                typeof e == "object" &&
                typeof e.then == "function" &&
                (t.count++, (t = Wi.bind(t)), e.then(t, t)),
              (n.state.loading |= 4),
              (n.instance = i),
              Ht(i));
            return;
          }
          ((i = e.ownerDocument || e),
            (a = zh(a)),
            (l = Ee.get(l)) && bs(a, l),
            (i = i.createElement("link")),
            Ht(i));
          var s = i;
          ((s._p = new Promise(function (r, d) {
            ((s.onload = r), (s.onerror = d));
          })),
            Zt(i, "link", a),
            (n.instance = i));
        }
        (t.stylesheets === null && (t.stylesheets = new Map()),
          t.stylesheets.set(n, e),
          (e = n.state.preload) &&
            (n.state.loading & 3) === 0 &&
            (t.count++,
            (n = Wi.bind(t)),
            e.addEventListener("load", n),
            e.addEventListener("error", n)));
      }
    }
    var As = 0;
    function _g(t, e) {
      return (
        t.stylesheets && t.count === 0 && Pi(t, t.stylesheets),
        0 < t.count || 0 < t.imgCount
          ? function (n) {
              var a = setTimeout(function () {
                if ((t.stylesheets && Pi(t, t.stylesheets), t.unsuspend)) {
                  var i = t.unsuspend;
                  ((t.unsuspend = null), i());
                }
              }, 6e4 + e);
              0 < t.imgBytes && As === 0 && (As = 62500 * ag());
              var l = setTimeout(
                function () {
                  if (
                    ((t.waitingForImages = !1),
                    t.count === 0 &&
                      (t.stylesheets && Pi(t, t.stylesheets), t.unsuspend))
                  ) {
                    var i = t.unsuspend;
                    ((t.unsuspend = null), i());
                  }
                },
                (t.imgBytes > As ? 50 : 800) + e,
              );
              return (
                (t.unsuspend = n),
                function () {
                  ((t.unsuspend = null), clearTimeout(a), clearTimeout(l));
                }
              );
            }
          : null
      );
    }
    function Wi() {
      if (
        (this.count--,
        this.count === 0 && (this.imgCount === 0 || !this.waitingForImages))
      ) {
        if (this.stylesheets) Pi(this, this.stylesheets);
        else if (this.unsuspend) {
          var t = this.unsuspend;
          ((this.unsuspend = null), t());
        }
      }
    }
    var Ii = null;
    function Pi(t, e) {
      ((t.stylesheets = null),
        t.unsuspend !== null &&
          (t.count++,
          (Ii = new Map()),
          e.forEach(Eg, t),
          (Ii = null),
          Wi.call(t)));
    }
    function Eg(t, e) {
      if (!(e.state.loading & 4)) {
        var n = Ii.get(t);
        if (n) var a = n.get(null);
        else {
          ((n = new Map()), Ii.set(t, n));
          for (
            var l = t.querySelectorAll(
                "link[data-precedence],style[data-precedence]",
              ),
              i = 0;
            i < l.length;
            i++
          ) {
            var s = l[i];
            (s.nodeName === "LINK" || s.getAttribute("media") !== "not all") &&
              (n.set(s.dataset.precedence, s), (a = s));
          }
          a && n.set(null, a);
        }
        ((l = e.instance),
          (s = l.getAttribute("data-precedence")),
          (i = n.get(s) || a),
          i === a && n.set(null, l),
          n.set(s, l),
          this.count++,
          (a = Wi.bind(this)),
          l.addEventListener("load", a),
          l.addEventListener("error", a),
          i
            ? i.parentNode.insertBefore(l, i.nextSibling)
            : ((t = t.nodeType === 9 ? t.head : t),
              t.insertBefore(l, t.firstChild)),
          (e.state.loading |= 4));
      }
    }
    var Ul = {
      $$typeof: tt,
      Provider: null,
      Consumer: null,
      _currentValue: lt,
      _currentValue2: lt,
      _threadCount: 0,
    };
    function Og(t, e, n, a, l, i, s, r, d) {
      ((this.tag = 1),
        (this.containerInfo = t),
        (this.pingCache = this.current = this.pendingChildren = null),
        (this.timeoutHandle = -1),
        (this.callbackNode =
          this.next =
          this.pendingContext =
          this.context =
          this.cancelPendingCommit =
            null),
        (this.callbackPriority = 0),
        (this.expirationTimes = pu(-1)),
        (this.entangledLanes =
          this.shellSuspendCounter =
          this.errorRecoveryDisabledLanes =
          this.expiredLanes =
          this.warmLanes =
          this.pingedLanes =
          this.suspendedLanes =
          this.pendingLanes =
            0),
        (this.entanglements = pu(0)),
        (this.hiddenUpdates = pu(null)),
        (this.identifierPrefix = a),
        (this.onUncaughtError = l),
        (this.onCaughtError = i),
        (this.onRecoverableError = s),
        (this.pooledCache = null),
        (this.pooledCacheLanes = 0),
        (this.formState = d),
        (this.incompleteTransitions = new Map()));
    }
    function Mg(t, e, n, a, l, i, s, r, d, p, _, M) {
      return (
        (t = new Og(t, e, n, s, d, p, _, M, r)),
        (e = 1),
        i === !0 && (e |= 24),
        (i = se(3, null, null, e)),
        (t.current = i),
        (i.stateNode = t),
        (e = nc()),
        e.refCount++,
        (t.pooledCache = e),
        e.refCount++,
        (i.memoizedState = { element: a, isDehydrated: n, cache: e }),
        uc(i),
        t
      );
    }
    function Rg(t) {
      return t ? ((t = ha), t) : ha;
    }
    function Uh(t, e, n, a, l, i) {
      ((l = Rg(l)),
        a.context === null ? (a.context = l) : (a.pendingContext = l),
        (a = Xn(e)),
        (a.payload = { element: n }),
        (i = i === void 0 ? null : i),
        i !== null && (a.callback = i),
        (n = Zn(t, a, e)),
        n !== null && (ee(n, t, e), rl(n, t, e)));
    }
    function Nh(t, e) {
      if (((t = t.memoizedState), t !== null && t.dehydrated !== null)) {
        var n = t.retryLane;
        t.retryLane = n !== 0 && n < e ? n : e;
      }
    }
    function _s(t, e) {
      (Nh(t, e), (t = t.alternate) && Nh(t, e));
    }
    function Qh(t) {
      if (t.tag === 13 || t.tag === 31) {
        var e = Qn(t, 67108864);
        (e !== null && ee(e, t, 67108864), _s(t, 67108864));
      }
    }
    function Bh(t) {
      if (t.tag === 13 || t.tag === 31) {
        var e = Ae();
        e = Ps(e);
        var n = Qn(t, e);
        (n !== null && ee(n, t, e), _s(t, e));
      }
    }
    var tu = !0;
    function zg(t, e, n, a) {
      var l = q.T;
      q.T = null;
      var i = N.p;
      try {
        ((N.p = 2), Es(t, e, n, a));
      } finally {
        ((N.p = i), (q.T = l));
      }
    }
    function Cg(t, e, n, a) {
      var l = q.T;
      q.T = null;
      var i = N.p;
      try {
        ((N.p = 8), Es(t, e, n, a));
      } finally {
        ((N.p = i), (q.T = l));
      }
    }
    function Es(t, e, n, a) {
      if (tu) {
        var l = Os(a);
        if (l === null) (fs(t, e, a, eu, n), Lh(t, a));
        else if (Dg(l, t, e, n, a)) a.stopPropagation();
        else if ((Lh(t, a), e & 4 && -1 < qg.indexOf(t))) {
          for (; l !== null; ) {
            var i = ea(l);
            if (i !== null)
              switch (i.tag) {
                case 3:
                  if (
                    ((i = i.stateNode), i.current.memoizedState.isDehydrated)
                  ) {
                    var s = qn(i.pendingLanes);
                    if (s !== 0) {
                      var r = i;
                      for (r.pendingLanes |= 2, r.entangledLanes |= 2; s; ) {
                        var d = 1 << (31 - ue(s));
                        ((r.entanglements[1] |= d), (s &= ~d));
                      }
                      (tn(i), (it & 6) === 0 && ((Hi = le() + 500), Rl(0, !1)));
                    }
                  }
                  break;
                case 31:
                case 13:
                  ((r = Qn(i, 2)), r !== null && ee(r, i, 2), Vi(), _s(i, 2));
              }
            if (((i = Os(a)), i === null && fs(t, e, a, eu, n), i === l)) break;
            l = i;
          }
          l !== null && a.stopPropagation();
        } else fs(t, e, a, null, n);
      }
    }
    function Os(t) {
      return ((t = zu(t)), Ms(t));
    }
    var eu = null;
    function Ms(t) {
      if (((eu = null), (t = ta(t)), t !== null)) {
        var e = A(t);
        if (e === null) t = null;
        else {
          var n = e.tag;
          if (n === 13) {
            if (((t = z(e)), t !== null)) return t;
            t = null;
          } else if (n === 31) {
            if (((t = U(e)), t !== null)) return t;
            t = null;
          } else if (n === 3) {
            if (e.stateNode.current.memoizedState.isDehydrated)
              return e.tag === 3 ? e.stateNode.containerInfo : null;
            t = null;
          } else e !== t && (t = null);
        }
      }
      return ((eu = t), null);
    }
    function Hh(t) {
      switch (t) {
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
          switch (_d()) {
            case ks:
              return 2;
            case Ks:
              return 8;
            case Gl:
            case Ed:
              return 32;
            case Js:
              return 268435456;
            default:
              return 32;
          }
        default:
          return 32;
      }
    }
    var Rs = !1,
      _n = null,
      En = null,
      On = null,
      Nl = new Map(),
      Ql = new Map(),
      Mn = [],
      qg =
        "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
          " ",
        );
    function Lh(t, e) {
      switch (t) {
        case "focusin":
        case "focusout":
          _n = null;
          break;
        case "dragenter":
        case "dragleave":
          En = null;
          break;
        case "mouseover":
        case "mouseout":
          On = null;
          break;
        case "pointerover":
        case "pointerout":
          Nl.delete(e.pointerId);
          break;
        case "gotpointercapture":
        case "lostpointercapture":
          Ql.delete(e.pointerId);
      }
    }
    function Bl(t, e, n, a, l, i) {
      return t === null || t.nativeEvent !== i
        ? ((t = {
            blockedOn: e,
            domEventName: n,
            eventSystemFlags: a,
            nativeEvent: i,
            targetContainers: [l],
          }),
          e !== null && ((e = ea(e)), e !== null && Qh(e)),
          t)
        : ((t.eventSystemFlags |= a),
          (e = t.targetContainers),
          l !== null && e.indexOf(l) === -1 && e.push(l),
          t);
    }
    function Dg(t, e, n, a, l) {
      switch (e) {
        case "focusin":
          return ((_n = Bl(_n, t, e, n, a, l)), !0);
        case "dragenter":
          return ((En = Bl(En, t, e, n, a, l)), !0);
        case "mouseover":
          return ((On = Bl(On, t, e, n, a, l)), !0);
        case "pointerover":
          var i = l.pointerId;
          return (Nl.set(i, Bl(Nl.get(i) || null, t, e, n, a, l)), !0);
        case "gotpointercapture":
          return (
            (i = l.pointerId),
            Ql.set(i, Bl(Ql.get(i) || null, t, e, n, a, l)),
            !0
          );
      }
      return !1;
    }
    function Vh(t) {
      var e = ta(t.target);
      if (e !== null) {
        var n = A(e);
        if (n !== null) {
          if (((e = n.tag), e === 13)) {
            if (((e = z(n)), e !== null)) {
              ((t.blockedOn = e),
                eo(t.priority, function () {
                  Bh(n);
                }));
              return;
            }
          } else if (e === 31) {
            if (((e = U(n)), e !== null)) {
              ((t.blockedOn = e),
                eo(t.priority, function () {
                  Bh(n);
                }));
              return;
            }
          } else if (
            e === 3 &&
            n.stateNode.current.memoizedState.isDehydrated
          ) {
            t.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
            return;
          }
        }
      }
      t.blockedOn = null;
    }
    function nu(t) {
      if (t.blockedOn !== null) return !1;
      for (var e = t.targetContainers; 0 < e.length; ) {
        var n = Os(t.nativeEvent);
        if (n === null) {
          n = t.nativeEvent;
          var a = new n.constructor(n.type, n);
          ((Ru = a), n.target.dispatchEvent(a), (Ru = null));
        } else return ((e = ea(n)), e !== null && Qh(e), (t.blockedOn = n), !1);
        e.shift();
      }
      return !0;
    }
    function xh(t, e, n) {
      nu(t) && n.delete(e);
    }
    function wg() {
      ((Rs = !1),
        _n !== null && nu(_n) && (_n = null),
        En !== null && nu(En) && (En = null),
        On !== null && nu(On) && (On = null),
        Nl.forEach(xh),
        Ql.forEach(xh));
    }
    function au(t, e) {
      t.blockedOn === e &&
        ((t.blockedOn = null),
        Rs ||
          ((Rs = !0),
          c.unstable_scheduleCallback(c.unstable_NormalPriority, wg)));
    }
    var lu = null;
    function jh(t) {
      lu !== t &&
        ((lu = t),
        c.unstable_scheduleCallback(c.unstable_NormalPriority, function () {
          lu === t && (lu = null);
          for (var e = 0; e < t.length; e += 3) {
            var n = t[e],
              a = t[e + 1],
              l = t[e + 2];
            if (typeof a != "function") {
              if (Ms(a || n) === null) continue;
              break;
            }
            var i = ea(n);
            i !== null &&
              (t.splice(e, 3),
              (e -= 3),
              Mc(
                i,
                { pending: !0, data: l, method: n.method, action: a },
                a,
                l,
              ));
          }
        }));
    }
    function Ba(t) {
      function e(d) {
        return au(d, t);
      }
      (_n !== null && au(_n, t),
        En !== null && au(En, t),
        On !== null && au(On, t),
        Nl.forEach(e),
        Ql.forEach(e));
      for (var n = 0; n < Mn.length; n++) {
        var a = Mn[n];
        a.blockedOn === t && (a.blockedOn = null);
      }
      for (; 0 < Mn.length && ((n = Mn[0]), n.blockedOn === null); )
        (Vh(n), n.blockedOn === null && Mn.shift());
      if (((n = (t.ownerDocument || t).$$reactFormReplay), n != null))
        for (a = 0; a < n.length; a += 3) {
          var l = n[a],
            i = n[a + 1],
            s = l[$t] || null;
          if (typeof i == "function") s || jh(n);
          else if (s) {
            var r = null;
            if (i && i.hasAttribute("formAction")) {
              if (((l = i), (s = i[$t] || null))) r = s.formAction;
              else if (Ms(l) !== null) continue;
            } else r = s.action;
            (typeof r == "function"
              ? (n[a + 1] = r)
              : (n.splice(a, 3), (a -= 3)),
              jh(n));
          }
        }
    }
    function Ug() {
      function t(i) {
        i.canIntercept &&
          i.info === "react-transition" &&
          i.intercept({
            handler: function () {
              return new Promise(function (s) {
                return (l = s);
              });
            },
            focusReset: "manual",
            scroll: "manual",
          });
      }
      function e() {
        (l !== null && (l(), (l = null)), a || setTimeout(n, 20));
      }
      function n() {
        if (!a && !navigation.transition) {
          var i = navigation.currentEntry;
          i &&
            i.url != null &&
            navigation.navigate(i.url, {
              state: i.getState(),
              info: "react-transition",
              history: "replace",
            });
        }
      }
      if (typeof navigation == "object") {
        var a = !1,
          l = null;
        return (
          navigation.addEventListener("navigate", t),
          navigation.addEventListener("navigatesuccess", e),
          navigation.addEventListener("navigateerror", e),
          setTimeout(n, 100),
          function () {
            ((a = !0),
              navigation.removeEventListener("navigate", t),
              navigation.removeEventListener("navigatesuccess", e),
              navigation.removeEventListener("navigateerror", e),
              l !== null && (l(), (l = null)));
          }
        );
      }
    }
    function zs(t) {
      this._internalRoot = t;
    }
    ((Cs.prototype.render = zs.prototype.render =
      function (t) {
        var e = this._internalRoot;
        if (e === null) throw Error(f(409));
        var n = e.current;
        Uh(n, Ae(), t, e, null, null);
      }),
      (Cs.prototype.unmount = zs.prototype.unmount =
        function () {
          var t = this._internalRoot;
          if (t !== null) {
            this._internalRoot = null;
            var e = t.containerInfo;
            (Uh(t.current, 2, null, t, null, null), Vi(), (e[Ka] = null));
          }
        }));
    function Cs(t) {
      this._internalRoot = t;
    }
    Cs.prototype.unstable_scheduleHydration = function (t) {
      if (t) {
        var e = to();
        t = { blockedOn: null, target: t, priority: e };
        for (var n = 0; n < Mn.length && e !== 0 && e < Mn[n].priority; n++);
        (Mn.splice(n, 0, t), n === 0 && Vh(t));
      }
    };
    var Yh = o.version;
    if (Yh !== "19.2.7") throw Error(f(527, Yh, "19.2.7"));
    N.findDOMNode = function (t) {
      var e = t._reactInternals;
      if (e === void 0)
        throw typeof t.render == "function"
          ? Error(f(188))
          : ((t = Object.keys(t).join(",")), Error(f(268, t)));
      return (
        (t = O(e)),
        (t = t !== null ? V(t) : null),
        (t = t === null ? null : t.stateNode),
        t
      );
    };
    var Ng = {
      bundleType: 0,
      version: "19.2.7",
      rendererPackageName: "react-dom",
      currentDispatcherRef: q,
      reconcilerVersion: "19.2.7",
    };
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
      var iu = __REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (!iu.isDisabled && iu.supportsFiber)
        try {
          ((Za = iu.inject(Ng)), (ie = iu));
        } catch {}
    }
    u.createRoot = function (t, e) {
      if (!m(t)) throw Error(f(299));
      var n = !1,
        a = "",
        l = Cy,
        i = qy,
        s = Dy;
      return (
        e != null &&
          (e.unstable_strictMode === !0 && (n = !0),
          e.identifierPrefix !== void 0 && (a = e.identifierPrefix),
          e.onUncaughtError !== void 0 && (l = e.onUncaughtError),
          e.onCaughtError !== void 0 && (i = e.onCaughtError),
          e.onRecoverableError !== void 0 && (s = e.onRecoverableError)),
        (e = Mg(t, 1, !1, null, null, n, a, null, l, i, s, Ug)),
        (t[Ka] = e.current),
        oh(t),
        new zs(e)
      );
    };
  }),
  Om = Be((u, c) => {
    function o() {
      if (
        !(
          typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
          typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
        )
      )
        try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(o);
        } catch (h) {
          console.error(h);
        }
    }
    (o(), (c.exports = Em()));
  }),
  Mm = Om(),
  Rm = Be((u) => {
    var c = Symbol.for("react.transitional.element");
    function o(h, f, m) {
      var A = null;
      if (
        (m !== void 0 && (A = "" + m),
        f.key !== void 0 && (A = "" + f.key),
        "key" in f)
      ) {
        m = {};
        for (var z in f) z !== "key" && (m[z] = f[z]);
      } else m = f;
      return (
        (f = m.ref),
        { $$typeof: c, type: h, key: A, ref: f !== void 0 ? f : null, props: m }
      );
    }
    ((u.jsx = o), (u.jsxs = o));
  }),
  zm = Be((u, c) => {
    c.exports = Rm();
  }),
  Va = zm(),
  pd = document.getElementById("root");
if (!pd) throw new Error("index.html is missing the #root element");
var js = (0, Mm.createRoot)(pd);
js.render(
  (0, Va.jsx)("main", {
    className: "GmailPage",
    role: "status",
    children: "Connecting to Press…",
  }),
);
pm().then(
  (u) => {
    (u.context.kind === "page" && (document.title = u.context.pageTitle),
      js.render(
        (0, Va.jsxs)("main", {
          className: "GmailPage",
          "data-gmail-service-status": "setup",
          children: [
            (0, Va.jsx)("h1", { children: "Gmail" }),
            (0, Va.jsx)("p", {
              role: "status",
              children:
                "Gmail setup is in progress. Connection is not enabled yet.",
            }),
            (0, Va.jsx)("p", {
              children:
                "Sent and received emails will be saved in Files. People with file access can read them.",
            }),
          ],
        }),
      ));
  },
  () =>
    js.render(
      (0, Va.jsx)("main", {
        className: "GmailPage",
        role: "alert",
        children: "Press access changed. Reopen the Gmail page.",
      }),
    ),
);
