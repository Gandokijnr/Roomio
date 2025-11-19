import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { tmpdir } from 'node:os';
import { Server } from 'node:http';
import { resolve, dirname, join } from 'node:path';
import nodeCrypto, { createHmac } from 'node:crypto';
import { parentPort, threadId } from 'node:worker_threads';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, sendRedirect, proxyRequest, getRequestHeader, setResponseHeaders, setResponseStatus, send, getRequestHeaders, setResponseHeader, appendResponseHeader, getRequestURL, getResponseHeader, removeResponseHeader, createError, getQuery as getQuery$1, readBody, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler, getResponseStatus, getRouterParam, getRouterParams, readRawBody, getResponseStatusText } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/h3/dist/index.mjs';
import { escapeHtml } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/@vue/shared/dist/shared.cjs.js';
import { createClient } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/@supabase/supabase-js/dist/main/index.js';
import { createRenderer, getRequestDependencies, getPreloadLinks, getPrefetchLinks } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import { parseURL, withoutBase, joinURL, getQuery, withQuery, withTrailingSlash, decodePath, withLeadingSlash, withoutTrailingSlash, joinRelativeURL } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/ufo/dist/index.mjs';
import { renderToString } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/vue/server-renderer/index.mjs';
import { klona } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/klona/dist/index.mjs';
import defu, { defuFn } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/defu/dist/defu.mjs';
import destr, { destr as destr$1 } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/destr/dist/index.mjs';
import { snakeCase } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/scule/dist/index.mjs';
import { createHead as createHead$1, propsToString, renderSSRHead } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/unhead/dist/server.mjs';
import { stringify, uneval } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/devalue/index.js';
import { isVNode, toValue, isRef } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/vue/index.mjs';
import { DeprecationsPlugin, PromisesPlugin, TemplateParamsPlugin, AliasSortingPlugin } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/unhead/dist/plugins.mjs';
import { createHooks } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/hookable/dist/index.mjs';
import { createFetch, Headers as Headers$1 } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/ofetch/dist/node.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/node-mock-http/dist/index.mjs';
import { createStorage, prefixStorage } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/unstorage/dist/index.mjs';
import unstorage_47drivers_47fs from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/unstorage/drivers/fs.mjs';
import { digest } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/ohash/dist/index.mjs';
import { toRouteMatcher, createRouter } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/radix3/dist/index.mjs';
import { readFile } from 'node:fs/promises';
import consola, { consola as consola$1 } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/consola/dist/index.mjs';
import { ErrorParser } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/youch-core/build/index.js';
import { Youch } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/youch/build/index.js';
import { SourceMapConsumer } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/source-map/source-map.js';
import { AsyncLocalStorage } from 'node:async_hooks';
import { getContext } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/unctx/dist/index.mjs';
import { captureRawStackTrace, parseRawStackTrace } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/errx/dist/index.js';
import { promises } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname as dirname$1, resolve as resolve$1 } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/pathe/dist/index.mjs';
import { walkResolver } from 'file://C:/Users/Gandoki/Desktop/Roomio/node_modules/unhead/dist/utils.mjs';

const serverAssets = [{"baseName":"server","dir":"C:/Users/Gandoki/Desktop/Roomio/server/assets"}];

const assets$1 = createStorage();

for (const asset of serverAssets) {
  assets$1.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"C:/Users/Gandoki/Desktop/Roomio","watchOptions":{"ignored":[null]}}));
storage.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"C:/Users/Gandoki/Desktop/Roomio/server","watchOptions":{"ignored":[null]}}));
storage.mount('build', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"C:/Users/Gandoki/Desktop/Roomio/.nuxt"}));
storage.mount('cache', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"C:/Users/Gandoki/Desktop/Roomio/.nuxt/cache"}));
storage.mount('data', unstorage_47drivers_47fs({"driver":"fs","base":"C:/Users/Gandoki/Desktop/Roomio/.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const inlineAppConfig = {
  "nuxt": {}
};



const appConfig = defuFn(inlineAppConfig);

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "dev",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      }
    }
  },
  "public": {
    "supabaseUrl": "https://dsmfhrfqygzqgazicgsv.supabase.co",
    "supabaseKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbWZocmZxeWd6cWdhemljZ3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NTk1NDMsImV4cCI6MjA3NjUzNTU0M30.o3xk0Iqw-84vrT0qNXV50x5HCoudEJH6HyWddFCpGks",
    "paystackPublicKey": "pk_live_aa389ce291c23d75050a44c1d9704de0ef1926fa",
    "authBackgroundUrl": "https://www.freepik.com/free-photo/sunset-pool_1035192.htm#fromView=search&page=1&position=1&uuid=1ec59f22-b43d-4db9-97cb-7a6b457d1195&query=hotel+view"
  },
  "supabaseUrl": "https://dsmfhrfqygzqgazicgsv.supabase.co",
  "supabaseServiceKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbWZocmZxeWd6cWdhemljZ3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDk1OTU0MywiZXhwIjoyMDc2NTM1NTQzfQ.mZm5GqPLalXkUMMaMm62jfoWmZgeJzTlfYMLhk2wKUs",
  "paystackSecretKey": "sk_live_bb783c79c08049e59aeb3adf501b8de734b1fdf4",
  "paystackWebhookSecret": "http://localhost:3000/api/paystack/webhook"
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function isJsonRequest(event) {
  if (hasReqHeader(event, "accept", "text/html")) {
    return false;
  }
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
  if (event.handled || isJsonRequest(event)) {
    return;
  }
  const defaultRes = await defaultHandler(error, event, { json: true });
  const statusCode = error.statusCode || 500;
  if (statusCode === 404 && defaultRes.status === 302) {
    setResponseHeaders(event, defaultRes.headers);
    setResponseStatus(event, defaultRes.status, defaultRes.statusText);
    return send(event, JSON.stringify(defaultRes.body, null, 2));
  }
  if (typeof defaultRes.body !== "string" && Array.isArray(defaultRes.body.stack)) {
    defaultRes.body.stack = defaultRes.body.stack.join("\n");
  }
  const errorObject = defaultRes.body;
  const url = new URL(errorObject.url);
  errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
  errorObject.message ||= "Server Error";
  errorObject.data ||= error.data;
  errorObject.statusMessage ||= error.statusMessage;
  delete defaultRes.headers["content-type"];
  delete defaultRes.headers["content-security-policy"];
  setResponseHeaders(event, defaultRes.headers);
  const reqHeaders = getRequestHeaders(event);
  const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
  const res = isRenderingError ? null : await useNitroApp().localFetch(
    withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject),
    {
      headers: { ...reqHeaders, "x-nuxt-error": "true" },
      redirect: "manual"
    }
  ).catch(() => null);
  if (event.handled) {
    return;
  }
  if (!res) {
    const { template } = await Promise.resolve().then(function () { return errorDev; }) ;
    {
      errorObject.description = errorObject.message;
    }
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    return send(event, template(errorObject));
  }
  const html = await res.text();
  for (const [header, value] of res.headers.entries()) {
    if (header === "set-cookie") {
      appendResponseHeader(event, header, value);
      continue;
    }
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
  return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  async function defaultNitroErrorHandler(error, event) {
    const res = await defaultHandler(error, event);
    if (!event.node?.res.headersSent) {
      setResponseHeaders(event, res.headers);
    }
    setResponseStatus(event, res.status, res.statusText);
    return send(
      event,
      typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2)
    );
  }
);
async function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  await loadStackTrace(error).catch(consola.error);
  const youch = new Youch();
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    const ansiError = await (await youch.toANSI(error)).replaceAll(process.cwd(), ".");
    consola.error(
      `[request error] ${tags} [${event.method}] ${url}

`,
      ansiError
    );
  }
  const useJSON = opts?.json || !getRequestHeader(event, "accept")?.includes("text/html");
  const headers = {
    "content-type": useJSON ? "application/json" : "text/html",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
  };
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = useJSON ? {
    error: true,
    url,
    statusCode,
    statusMessage,
    message: error.message,
    data: error.data,
    stack: error.stack?.split("\n").map((line) => line.trim())
  } : await youch.toHTML(error, {
    request: {
      url: url.href,
      method: event.method,
      headers: getRequestHeaders(event)
    }
  });
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}
async function loadStackTrace(error) {
  if (!(error instanceof Error)) {
    return;
  }
  const parsed = await new ErrorParser().defineSourceLoader(sourceLoader).parse(error);
  const stack = error.message + "\n" + parsed.frames.map((frame) => fmtFrame(frame)).join("\n");
  Object.defineProperty(error, "stack", { value: stack });
  if (error.cause) {
    await loadStackTrace(error.cause).catch(consola.error);
  }
}
async function sourceLoader(frame) {
  if (!frame.fileName || frame.fileType !== "fs" || frame.type === "native") {
    return;
  }
  if (frame.type === "app") {
    const rawSourceMap = await readFile(`${frame.fileName}.map`, "utf8").catch(() => {
    });
    if (rawSourceMap) {
      const consumer = await new SourceMapConsumer(rawSourceMap);
      const originalPosition = consumer.originalPositionFor({ line: frame.lineNumber, column: frame.columnNumber });
      if (originalPosition.source && originalPosition.line) {
        frame.fileName = resolve(dirname(frame.fileName), originalPosition.source);
        frame.lineNumber = originalPosition.line;
        frame.columnNumber = originalPosition.column || 0;
      }
    }
  }
  const contents = await readFile(frame.fileName, "utf8").catch(() => {
  });
  return contents ? { contents } : void 0;
}
function fmtFrame(frame) {
  if (frame.type === "native") {
    return frame.raw;
  }
  const src = `${frame.fileName || ""}:${frame.lineNumber}:${frame.columnNumber})`;
  return frame.functionName ? `at ${frame.functionName} (${src}` : `at ${src}`;
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const rootDir = "C:/Users/Gandoki/Desktop/Roomio";

const appHead = {"meta":[{"charset":"utf-8"},{"name":"viewport","content":"width=device-width, initial-scale=1"},{"name":"description","content":"Complete hotel management solution for managing rooms, reservations, guests, and payments"}],"link":[],"style":[],"script":[],"noscript":[],"title":"Hotel Management Software"};

const appRootTag = "div";

const appRootAttrs = {"id":"__nuxt"};

const appTeleportTag = "div";

const appTeleportAttrs = {"id":"teleports"};

const appId = "nuxt-app";

const devReducers = {
  VNode: (data) => isVNode(data) ? { type: data.type, props: data.props } : void 0,
  URL: (data) => data instanceof URL ? data.toString() : void 0
};
const asyncContext = getContext("nuxt-dev", { asyncContext: true, AsyncLocalStorage });
const _rqzfOrCwvC5ZPqqKc6WJewpKxFLaRCkuh4Ltd9lejE = (nitroApp) => {
  const handler = nitroApp.h3App.handler;
  nitroApp.h3App.handler = (event) => {
    return asyncContext.callAsync({ logs: [], event }, () => handler(event));
  };
  onConsoleLog((_log) => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    const rawStack = captureRawStackTrace();
    if (!rawStack || rawStack.includes("runtime/vite-node.mjs")) {
      return;
    }
    const trace = [];
    let filename = "";
    for (const entry of parseRawStackTrace(rawStack)) {
      if (entry.source === globalThis._importMeta_.url) {
        continue;
      }
      if (EXCLUDE_TRACE_RE.test(entry.source)) {
        continue;
      }
      filename ||= entry.source.replace(withTrailingSlash(rootDir), "");
      trace.push({
        ...entry,
        source: entry.source.startsWith("file://") ? entry.source.replace("file://", "") : entry.source
      });
    }
    const log = {
      ..._log,
      // Pass along filename to allow the client to display more info about where log comes from
      filename,
      // Clean up file names in stack trace
      stack: trace
    };
    ctx.logs.push(log);
  });
  nitroApp.hooks.hook("afterResponse", () => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    return nitroApp.hooks.callHook("dev:ssr-logs", { logs: ctx.logs, path: ctx.event.path });
  });
  nitroApp.hooks.hook("render:html", (htmlContext) => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    try {
      const reducers = Object.assign(/* @__PURE__ */ Object.create(null), devReducers, ctx.event.context._payloadReducers);
      htmlContext.bodyAppend.unshift(`<script type="application/json" data-nuxt-logs="${appId}">${stringify(ctx.logs, reducers)}<\/script>`);
    } catch (e) {
      const shortError = e instanceof Error && "toString" in e ? ` Received \`${e.toString()}\`.` : "";
      console.warn(`[nuxt] Failed to stringify dev server logs.${shortError} You can define your own reducer/reviver for rich types following the instructions in https://nuxt.com/docs/api/composables/use-nuxt-app#payload.`);
    }
  });
};
const EXCLUDE_TRACE_RE = /\/node_modules\/(?:.*\/)?(?:nuxt|nuxt-nightly|nuxt-edge|nuxt3|consola|@vue)\/|core\/runtime\/nitro/;
function onConsoleLog(callback) {
  consola$1.addReporter({
    log(logObj) {
      callback(logObj);
    }
  });
  consola$1.wrapConsole();
}

const plugins = [
  _rqzfOrCwvC5ZPqqKc6WJewpKxFLaRCkuh4Ltd9lejE
];

const assets = {};

function readAsset (id) {
  const serverDir = dirname$1(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve$1(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _pXuHUk = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError({ statusCode: 404 });
    }
    return;
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const logPlatformAuditEvent = async (params) => {
  const config = useRuntimeConfig();
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    console.error("Missing Supabase config for audit logging");
    return;
  }
  try {
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
    await supabase.from("platform_audit_events").insert({
      event_type: params.eventType,
      tenant_id: params.tenantId || null,
      user_id: params.userId || null,
      details: params.details || {},
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Failed to write platform audit event", error);
  }
};

const _oo1e2q = defineEventHandler(async (event) => {
  const req = event.node.req;
  const url = req.url || "";
  if (url.startsWith("/api/super") || url.startsWith("/api/paystack") || url.startsWith("/webhooks/paystack") || url.startsWith("/api/auth")) {
    return;
  }
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader || Array.isArray(authHeader)) {
    return;
  }
  const [scheme, token] = String(authHeader).split(" ");
  if (scheme !== "Bearer" || !token) {
    return;
  }
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const {
    data: { user },
    error
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return;
  }
  const { data: profile } = await supabase.from("profiles").select("id, tenant_id, is_super_admin").eq("id", user.id).maybeSingle();
  if (!profile || profile.is_super_admin) {
    return;
  }
  if (!profile.tenant_id) {
    return;
  }
  const { data: tenant } = await supabase.from("tenants").select("id, status").eq("id", profile.tenant_id).maybeSingle();
  if (!tenant) {
    return;
  }
  if (tenant.status === "billing_hold") {
    await logPlatformAuditEvent({
      eventType: "BLOCKED_ACCESS",
      tenantId: tenant.id,
      userId: user.id,
      details: {
        route: url,
        method: req.method
      }
    });
    throw createError({
      statusCode: 403,
      statusMessage: "Billing required to continue using Roomio"
    });
  }
});

const VueResolver = (_, value) => {
  return isRef(value) ? toValue(value) : value;
};

const headSymbol = "usehead";
// @__NO_SIDE_EFFECTS__
function vueInstall(head) {
  const plugin = {
    install(app) {
      app.config.globalProperties.$unhead = head;
      app.config.globalProperties.$head = head;
      app.provide(headSymbol, head);
    }
  };
  return plugin.install;
}

// @__NO_SIDE_EFFECTS__
function resolveUnrefHeadInput(input) {
  return walkResolver(input, VueResolver);
}

// @__NO_SIDE_EFFECTS__
function createHead(options = {}) {
  const head = createHead$1({
    ...options,
    propResolvers: [VueResolver]
  });
  head.install = vueInstall(head);
  return head;
}

const unheadOptions = {
  disableDefaults: true,
  disableCapoSorting: false,
  plugins: [DeprecationsPlugin, PromisesPlugin, TemplateParamsPlugin, AliasSortingPlugin],
};

function createSSRContext(event) {
  const ssrContext = {
    url: event.path,
    event,
    runtimeConfig: useRuntimeConfig(event),
    noSSR: event.context.nuxt?.noSSR || (false),
    head: createHead(unheadOptions),
    error: false,
    nuxt: void 0,
    /* NuxtApp */
    payload: {},
    _payloadReducers: /* @__PURE__ */ Object.create(null),
    modules: /* @__PURE__ */ new Set()
  };
  return ssrContext;
}
function setSSRError(ssrContext, error) {
  ssrContext.error = true;
  ssrContext.payload = { error };
  ssrContext.url = error.url;
}

function buildAssetsDir() {
  return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
  return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
  const app = useRuntimeConfig().app;
  const publicBase = app.cdnURL || app.baseURL;
  return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

const APP_ROOT_OPEN_TAG = `<${appRootTag}${propsToString(appRootAttrs)}>`;
const APP_ROOT_CLOSE_TAG = `</${appRootTag}>`;
const getServerEntry = () => import('file://C:/Users/Gandoki/Desktop/Roomio/.nuxt//dist/server/server.mjs').then((r) => r.default || r);
const getClientManifest = () => import('file://C:/Users/Gandoki/Desktop/Roomio/.nuxt//dist/server/client.manifest.mjs').then((r) => r.default || r).then((r) => typeof r === "function" ? r() : r);
const getSSRRenderer = lazyCachedFunction(async () => {
  const manifest = await getClientManifest();
  if (!manifest) {
    throw new Error("client.manifest is not available");
  }
  const createSSRApp = await getServerEntry();
  if (!createSSRApp) {
    throw new Error("Server bundle is not available");
  }
  const options = {
    manifest,
    renderToString: renderToString$1,
    buildAssetsURL
  };
  const renderer = createRenderer(createSSRApp, options);
  async function renderToString$1(input, context) {
    const html = await renderToString(input, context);
    if (process.env.NUXT_VITE_NODE_OPTIONS) {
      renderer.rendererContext.updateManifest(await getClientManifest());
    }
    return APP_ROOT_OPEN_TAG + html + APP_ROOT_CLOSE_TAG;
  }
  return renderer;
});
const getSPARenderer = lazyCachedFunction(async () => {
  const manifest = await getClientManifest();
  const spaTemplate = await Promise.resolve().then(function () { return _virtual__spaTemplate; }).then((r) => r.template).catch(() => "").then((r) => {
    {
      return APP_ROOT_OPEN_TAG + r + APP_ROOT_CLOSE_TAG;
    }
  });
  const options = {
    manifest,
    renderToString: () => spaTemplate,
    buildAssetsURL
  };
  const renderer = createRenderer(() => () => {
  }, options);
  const result = await renderer.renderToString({});
  const renderToString = (ssrContext) => {
    const config = useRuntimeConfig(ssrContext.event);
    ssrContext.modules ||= /* @__PURE__ */ new Set();
    ssrContext.payload.serverRendered = false;
    ssrContext.config = {
      public: config.public,
      app: config.app
    };
    return Promise.resolve(result);
  };
  return {
    rendererContext: renderer.rendererContext,
    renderToString
  };
});
function lazyCachedFunction(fn) {
  let res = null;
  return () => {
    if (res === null) {
      res = fn().catch((err) => {
        res = null;
        throw err;
      });
    }
    return res;
  };
}
function getRenderer(ssrContext) {
  return ssrContext.noSSR ? getSPARenderer() : getSSRRenderer();
}
const getSSRStyles = lazyCachedFunction(() => Promise.resolve().then(function () { return styles$1; }).then((r) => r.default || r));

async function renderInlineStyles(usedModules) {
  const styleMap = await getSSRStyles();
  const inlinedStyles = /* @__PURE__ */ new Set();
  for (const mod of usedModules) {
    if (mod in styleMap && styleMap[mod]) {
      for (const style of await styleMap[mod]()) {
        inlinedStyles.add(style);
      }
    }
  }
  return Array.from(inlinedStyles).map((style) => ({ innerHTML: style }));
}

const ROOT_NODE_REGEX = new RegExp(`^<${appRootTag}[^>]*>([\\s\\S]*)<\\/${appRootTag}>$`);
function getServerComponentHTML(body) {
  const match = body.match(ROOT_NODE_REGEX);
  return match?.[1] || body;
}
const SSR_SLOT_TELEPORT_MARKER = /^uid=([^;]*);slot=(.*)$/;
const SSR_CLIENT_TELEPORT_MARKER = /^uid=([^;]*);client=(.*)$/;
const SSR_CLIENT_SLOT_MARKER = /^island-slot=([^;]*);(.*)$/;
function getSlotIslandResponse(ssrContext) {
  if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.slots).length) {
    return void 0;
  }
  const response = {};
  for (const [name, slot] of Object.entries(ssrContext.islandContext.slots)) {
    response[name] = {
      ...slot,
      fallback: ssrContext.teleports?.[`island-fallback=${name}`]
    };
  }
  return response;
}
function getClientIslandResponse(ssrContext) {
  if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.components).length) {
    return void 0;
  }
  const response = {};
  for (const [clientUid, component] of Object.entries(ssrContext.islandContext.components)) {
    const html = ssrContext.teleports?.[clientUid]?.replaceAll("<!--teleport start anchor-->", "") || "";
    response[clientUid] = {
      ...component,
      html,
      slots: getComponentSlotTeleport(clientUid, ssrContext.teleports ?? {})
    };
  }
  return response;
}
function getComponentSlotTeleport(clientUid, teleports) {
  const entries = Object.entries(teleports);
  const slots = {};
  for (const [key, value] of entries) {
    const match = key.match(SSR_CLIENT_SLOT_MARKER);
    if (match) {
      const [, id, slot] = match;
      if (!slot || clientUid !== id) {
        continue;
      }
      slots[slot] = value;
    }
  }
  return slots;
}
function replaceIslandTeleports(ssrContext, html) {
  const { teleports, islandContext } = ssrContext;
  if (islandContext || !teleports) {
    return html;
  }
  for (const key in teleports) {
    const matchClientComp = key.match(SSR_CLIENT_TELEPORT_MARKER);
    if (matchClientComp) {
      const [, uid, clientId] = matchClientComp;
      if (!uid || !clientId) {
        continue;
      }
      html = html.replace(new RegExp(` data-island-uid="${uid}" data-island-component="${clientId}"[^>]*>`), (full) => {
        return full + teleports[key];
      });
      continue;
    }
    const matchSlot = key.match(SSR_SLOT_TELEPORT_MARKER);
    if (matchSlot) {
      const [, uid, slot] = matchSlot;
      if (!uid || !slot) {
        continue;
      }
      html = html.replace(new RegExp(` data-island-uid="${uid}" data-island-slot="${slot}"[^>]*>`), (full) => {
        return full + teleports[key];
      });
    }
  }
  return html;
}

const ISLAND_SUFFIX_RE = /\.json(?:\?.*)?$/;
const _SxA8c9 = defineEventHandler(async (event) => {
  const nitroApp = useNitroApp();
  setResponseHeaders(event, {
    "content-type": "application/json;charset=utf-8",
    "x-powered-by": "Nuxt"
  });
  const islandContext = await getIslandContext(event);
  const ssrContext = {
    ...createSSRContext(event),
    islandContext,
    noSSR: false,
    url: islandContext.url
  };
  const renderer = await getSSRRenderer();
  const renderResult = await renderer.renderToString(ssrContext).catch(async (err) => {
    await ssrContext.nuxt?.hooks.callHook("app:error", err);
    throw err;
  });
  if (ssrContext.payload?.error) {
    throw ssrContext.payload.error;
  }
  const inlinedStyles = await renderInlineStyles(ssrContext.modules ?? []);
  await ssrContext.nuxt?.hooks.callHook("app:rendered", { ssrContext, renderResult });
  if (inlinedStyles.length) {
    ssrContext.head.push({ style: inlinedStyles });
  }
  {
    const { styles } = getRequestDependencies(ssrContext, renderer.rendererContext);
    const link = [];
    for (const resource of Object.values(styles)) {
      if ("inline" in getQuery(resource.file)) {
        continue;
      }
      if (resource.file.includes("scoped") && !resource.file.includes("pages/")) {
        link.push({ rel: "stylesheet", href: renderer.rendererContext.buildAssetsURL(resource.file), crossorigin: "" });
      }
    }
    if (link.length) {
      ssrContext.head.push({ link }, { mode: "server" });
    }
  }
  const islandHead = {};
  for (const entry of ssrContext.head.entries.values()) {
    for (const [key, value] of Object.entries(resolveUnrefHeadInput(entry.input))) {
      const currentValue = islandHead[key];
      if (Array.isArray(currentValue)) {
        currentValue.push(...value);
      }
      islandHead[key] = value;
    }
  }
  islandHead.link ||= [];
  islandHead.style ||= [];
  const islandResponse = {
    id: islandContext.id,
    head: islandHead,
    html: getServerComponentHTML(renderResult.html),
    components: getClientIslandResponse(ssrContext),
    slots: getSlotIslandResponse(ssrContext)
  };
  await nitroApp.hooks.callHook("render:island", islandResponse, { event, islandContext });
  return islandResponse;
});
async function getIslandContext(event) {
  let url = event.path || "";
  const componentParts = url.substring("/__nuxt_island".length + 1).replace(ISLAND_SUFFIX_RE, "").split("_");
  const hashId = componentParts.length > 1 ? componentParts.pop() : void 0;
  const componentName = componentParts.join("_");
  const context = event.method === "GET" ? getQuery$1(event) : await readBody(event);
  const ctx = {
    url: "/",
    ...context,
    id: hashId,
    name: componentName,
    props: destr$1(context.props) || {},
    slots: {},
    components: {}
  };
  return ctx;
}

const _lazy_sGlCL7 = () => Promise.resolve().then(function () { return cardSetup_post$1; });
const _lazy_tv_JGK = () => Promise.resolve().then(function () { return history_get$1; });
const _lazy__509po = () => Promise.resolve().then(function () { return initialize_post$1; });
const _lazy_j4saOx = () => Promise.resolve().then(function () { return paystackVerify_post$1; });
const _lazy_vbPXaq = () => Promise.resolve().then(function () { return selectPlan_post$1; });
const _lazy_FbRTin = () => Promise.resolve().then(function () { return status_get$1; });
const _lazy_qo_0ii = () => Promise.resolve().then(function () { return subscriptionRenewal_post$1; });
const _lazy_kRnVwV = () => Promise.resolve().then(function () { return trialExpiry_post$1; });
const _lazy_jQDxER = () => Promise.resolve().then(function () { return demoRequest_post$1; });
const _lazy_dlbk4e = () => Promise.resolve().then(function () { return categories_get$1; });
const _lazy_Cegxv9 = () => Promise.resolve().then(function () { return items_get$1; });
const _lazy_A9_iSs = () => Promise.resolve().then(function () { return items_post$1; });
const _lazy_l2sd9W = () => Promise.resolve().then(function () { return _id__patch$7; });
const _lazy_bTR2Zu = () => Promise.resolve().then(function () { return transactions_get$1; });
const _lazy_I3J5Mu = () => Promise.resolve().then(function () { return transactions_post$1; });
const _lazy_BCUYVu = () => Promise.resolve().then(function () { return webhook_post$1; });
const _lazy__eAuJ8 = () => Promise.resolve().then(function () { return purchaseOrders_get$1; });
const _lazy_33BGXH = () => Promise.resolve().then(function () { return purchaseOrders_post$1; });
const _lazy_SOGLjd = () => Promise.resolve().then(function () { return approve_post$3; });
const _lazy_hYTtGl = () => Promise.resolve().then(function () { return menuCategories_get$1; });
const _lazy_yOGuel = () => Promise.resolve().then(function () { return menuItems__id__patch$1; });
const _lazy_Kt1t_e = () => Promise.resolve().then(function () { return menuItems_get$1; });
const _lazy_IUmhRb = () => Promise.resolve().then(function () { return menuItems_post$1; });
const _lazy_blervC = () => Promise.resolve().then(function () { return _id__delete$1; });
const _lazy_qGL93M = () => Promise.resolve().then(function () { return _id__patch$5; });
const _lazy_qUNSpd = () => Promise.resolve().then(function () { return orders__id__patch$1; });
const _lazy_H0FyjL = () => Promise.resolve().then(function () { return orders_get$1; });
const _lazy_zkThyt = () => Promise.resolve().then(function () { return orders_post$1; });
const _lazy_FCvNK3 = () => Promise.resolve().then(function () { return _id__patch$3; });
const _lazy_DxqCh1 = () => Promise.resolve().then(function () { return tables_get$1; });
const _lazy_Bd5poG = () => Promise.resolve().then(function () { return sendInvitation_post$1; });
const _lazy_i5sGcG = () => Promise.resolve().then(function () { return accessRequests_get$1; });
const _lazy_CbVvIe = () => Promise.resolve().then(function () { return approve_post$1; });
const _lazy_DwAPGa = () => Promise.resolve().then(function () { return reject_post$1; });
const _lazy_wtczLp = () => Promise.resolve().then(function () { return activity_get$3; });
const _lazy_xFdCdc = () => Promise.resolve().then(function () { return billingMetrics_get$1; });
const _lazy_c46E7X = () => Promise.resolve().then(function () { return dashboard_get$1; });
const _lazy_LZqzQ7 = () => Promise.resolve().then(function () { return tenantActivity_get$1; });
const _lazy_cU3iqJ = () => Promise.resolve().then(function () { return tenantBilling_get$1; });
const _lazy_J9WZpM = () => Promise.resolve().then(function () { return tenantDetail_get$1; });
const _lazy_JzDhEe = () => Promise.resolve().then(function () { return tenantInviteLink_get$1; });
const _lazy_HMkQ5N = () => Promise.resolve().then(function () { return tenantMetrics_get$1; });
const _lazy_wpoaUC = () => Promise.resolve().then(function () { return tenants_get$1; });
const _lazy_d8uoMu = () => Promise.resolve().then(function () { return _id__activity_get$1; });
const _lazy_WjX9cZ = () => Promise.resolve().then(function () { return _id__get$1; });
const _lazy_78ocNa = () => Promise.resolve().then(function () { return _id__metrics_get$1; });
const _lazy_9a40sP = () => Promise.resolve().then(function () { return _id__patch$1; });
const _lazy_t1a3H8 = () => Promise.resolve().then(function () { return activity_get$1; });
const _lazy_nl9sFX = () => Promise.resolve().then(function () { return billing_get$1; });
const _lazy_xEgvE0 = () => Promise.resolve().then(function () { return metrics_get$1; });
const _lazy_h3Sq2s = () => Promise.resolve().then(function () { return vendors_get$1; });
const _lazy_GNAorI = () => Promise.resolve().then(function () { return paystack_post$1; });
const _lazy_7Vc5ea = () => Promise.resolve().then(function () { return renderer$1; });

const handlers = [
  { route: '', handler: _pXuHUk, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _oo1e2q, lazy: false, middleware: true, method: undefined },
  { route: '/api/billing/card-setup', handler: _lazy_sGlCL7, lazy: true, middleware: false, method: "post" },
  { route: '/api/billing/history', handler: _lazy_tv_JGK, lazy: true, middleware: false, method: "get" },
  { route: '/api/billing/initialize', handler: _lazy__509po, lazy: true, middleware: false, method: "post" },
  { route: '/api/billing/paystack-verify', handler: _lazy_j4saOx, lazy: true, middleware: false, method: "post" },
  { route: '/api/billing/select-plan', handler: _lazy_vbPXaq, lazy: true, middleware: false, method: "post" },
  { route: '/api/billing/status', handler: _lazy_FbRTin, lazy: true, middleware: false, method: "get" },
  { route: '/api/cron/subscription-renewal', handler: _lazy_qo_0ii, lazy: true, middleware: false, method: "post" },
  { route: '/api/cron/trial-expiry', handler: _lazy_kRnVwV, lazy: true, middleware: false, method: "post" },
  { route: '/api/demo-request', handler: _lazy_jQDxER, lazy: true, middleware: false, method: "post" },
  { route: '/api/inventory/categories', handler: _lazy_dlbk4e, lazy: true, middleware: false, method: "get" },
  { route: '/api/inventory/items', handler: _lazy_Cegxv9, lazy: true, middleware: false, method: "get" },
  { route: '/api/inventory/items', handler: _lazy_A9_iSs, lazy: true, middleware: false, method: "post" },
  { route: '/api/inventory/items/:id', handler: _lazy_l2sd9W, lazy: true, middleware: false, method: "patch" },
  { route: '/api/inventory/transactions', handler: _lazy_bTR2Zu, lazy: true, middleware: false, method: "get" },
  { route: '/api/inventory/transactions', handler: _lazy_I3J5Mu, lazy: true, middleware: false, method: "post" },
  { route: '/api/paystack/webhook', handler: _lazy_BCUYVu, lazy: true, middleware: false, method: "post" },
  { route: '/api/purchase-orders', handler: _lazy__eAuJ8, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase-orders', handler: _lazy_33BGXH, lazy: true, middleware: false, method: "post" },
  { route: '/api/purchase-orders/:id/approve', handler: _lazy_SOGLjd, lazy: true, middleware: false, method: "post" },
  { route: '/api/restaurant/menu-categories', handler: _lazy_hYTtGl, lazy: true, middleware: false, method: "get" },
  { route: '/api/restaurant/menu-items-:id', handler: _lazy_yOGuel, lazy: true, middleware: false, method: "patch" },
  { route: '/api/restaurant/menu-items', handler: _lazy_Kt1t_e, lazy: true, middleware: false, method: "get" },
  { route: '/api/restaurant/menu-items', handler: _lazy_IUmhRb, lazy: true, middleware: false, method: "post" },
  { route: '/api/restaurant/menu-items/:id', handler: _lazy_blervC, lazy: true, middleware: false, method: "delete" },
  { route: '/api/restaurant/menu-items/:id', handler: _lazy_qGL93M, lazy: true, middleware: false, method: "patch" },
  { route: '/api/restaurant/orders-:id', handler: _lazy_qUNSpd, lazy: true, middleware: false, method: "patch" },
  { route: '/api/restaurant/orders', handler: _lazy_H0FyjL, lazy: true, middleware: false, method: "get" },
  { route: '/api/restaurant/orders', handler: _lazy_zkThyt, lazy: true, middleware: false, method: "post" },
  { route: '/api/restaurant/orders/:id', handler: _lazy_FCvNK3, lazy: true, middleware: false, method: "patch" },
  { route: '/api/restaurant/tables', handler: _lazy_DxqCh1, lazy: true, middleware: false, method: "get" },
  { route: '/api/send-invitation', handler: _lazy_Bd5poG, lazy: true, middleware: false, method: "post" },
  { route: '/api/super/access-requests', handler: _lazy_i5sGcG, lazy: true, middleware: false, method: "get" },
  { route: '/api/super/access-requests/:id/approve', handler: _lazy_CbVvIe, lazy: true, middleware: false, method: "post" },
  { route: '/api/super/access-requests/:id/reject', handler: _lazy_DwAPGa, lazy: true, middleware: false, method: "post" },
  { route: '/api/super/activity', handler: _lazy_wtczLp, lazy: true, middleware: false, method: "get" },
  { route: '/api/super/billing-metrics', handler: _lazy_xFdCdc, lazy: true, middleware: false, method: "get" },
  { route: '/api/super/dashboard', handler: _lazy_c46E7X, lazy: true, middleware: false, method: "get" },
  { route: '/api/super/tenant-activity', handler: _lazy_LZqzQ7, lazy: true, middleware: false, method: "get" },
  { route: '/api/super/tenant-billing', handler: _lazy_cU3iqJ, lazy: true, middleware: false, method: "get" },
  { route: '/api/super/tenant-detail', handler: _lazy_J9WZpM, lazy: true, middleware: false, method: "get" },
  { route: '/api/super/tenant-invite-link', handler: _lazy_JzDhEe, lazy: true, middleware: false, method: "get" },
  { route: '/api/super/tenant-metrics', handler: _lazy_HMkQ5N, lazy: true, middleware: false, method: "get" },
  { route: '/api/super/tenants', handler: _lazy_wpoaUC, lazy: true, middleware: false, method: "get" },
  { route: '/api/super/tenants/:id.activity', handler: _lazy_d8uoMu, lazy: true, middleware: false, method: "get" },
  { route: '/api/super/tenants/:id', handler: _lazy_WjX9cZ, lazy: true, middleware: false, method: "get" },
  { route: '/api/super/tenants/:id.metrics', handler: _lazy_78ocNa, lazy: true, middleware: false, method: "get" },
  { route: '/api/super/tenants/:id', handler: _lazy_9a40sP, lazy: true, middleware: false, method: "patch" },
  { route: '/api/super/tenants/:id/activity', handler: _lazy_t1a3H8, lazy: true, middleware: false, method: "get" },
  { route: '/api/super/tenants/:id/billing', handler: _lazy_nl9sFX, lazy: true, middleware: false, method: "get" },
  { route: '/api/super/tenants/:id/metrics', handler: _lazy_xEgvE0, lazy: true, middleware: false, method: "get" },
  { route: '/api/vendors', handler: _lazy_h3Sq2s, lazy: true, middleware: false, method: "get" },
  { route: '/webhooks/paystack', handler: _lazy_GNAorI, lazy: true, middleware: false, method: "post" },
  { route: '/__nuxt_error', handler: _lazy_7Vc5ea, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_island/**', handler: _SxA8c9, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_7Vc5ea, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(true),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter$1({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => callNodeRequestHandler(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return fetchNodeRequestHandler(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

const scheduledTasks = false;

const tasks = {
  
};

const __runningTasks__ = {};
async function runTask(name, {
  payload = {},
  context = {}
} = {}) {
  if (__runningTasks__[name]) {
    return __runningTasks__[name];
  }
  if (!(name in tasks)) {
    throw createError({
      message: `Task \`${name}\` is not available!`,
      statusCode: 404
    });
  }
  if (!tasks[name].resolve) {
    throw createError({
      message: `Task \`${name}\` is not implemented!`,
      statusCode: 501
    });
  }
  const handler = await tasks[name].resolve();
  const taskEvent = { name, payload, context };
  __runningTasks__[name] = handler.run(taskEvent);
  try {
    const res = await __runningTasks__[name];
    return res;
  } finally {
    delete __runningTasks__[name];
  }
}

if (!globalThis.crypto) {
  globalThis.crypto = nodeCrypto;
}
const { NITRO_NO_UNIX_SOCKET, NITRO_DEV_WORKER_ID } = process.env;
trapUnhandledNodeErrors();
parentPort?.on("message", (msg) => {
  if (msg && msg.event === "shutdown") {
    shutdown();
  }
});
const nitroApp = useNitroApp();
const server = new Server(toNodeListener(nitroApp.h3App));
let listener;
listen().catch(() => listen(
  true
  /* use random port */
)).catch((error) => {
  console.error("Dev worker failed to listen:", error);
  return shutdown();
});
nitroApp.router.get(
  "/_nitro/tasks",
  defineEventHandler(async (event) => {
    const _tasks = await Promise.all(
      Object.entries(tasks).map(async ([name, task]) => {
        const _task = await task.resolve?.();
        return [name, { description: _task?.meta?.description }];
      })
    );
    return {
      tasks: Object.fromEntries(_tasks),
      scheduledTasks
    };
  })
);
nitroApp.router.use(
  "/_nitro/tasks/:name",
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, "name");
    const payload = {
      ...getQuery$1(event),
      ...await readBody(event).then((r) => r?.payload).catch(() => ({}))
    };
    return await runTask(name, { payload });
  })
);
function listen(useRandomPort = Boolean(
  NITRO_NO_UNIX_SOCKET || process.versions.webcontainer || "Bun" in globalThis && process.platform === "win32"
)) {
  return new Promise((resolve, reject) => {
    try {
      listener = server.listen(useRandomPort ? 0 : getSocketAddress(), () => {
        const address = server.address();
        parentPort?.postMessage({
          event: "listen",
          address: typeof address === "string" ? { socketPath: address } : { host: "localhost", port: address?.port }
        });
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
function getSocketAddress() {
  const socketName = `nitro-worker-${process.pid}-${threadId}-${NITRO_DEV_WORKER_ID}-${Math.round(Math.random() * 1e4)}.sock`;
  if (process.platform === "win32") {
    return join(String.raw`\\.\pipe`, socketName);
  }
  if (process.platform === "linux") {
    const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
    if (nodeMajor >= 20) {
      return `\0${socketName}`;
    }
  }
  return join(tmpdir(), socketName);
}
async function shutdown() {
  server.closeAllConnections?.();
  await Promise.all([
    new Promise((resolve) => listener?.close(resolve)),
    nitroApp.hooks.callHook("close").catch(console.error)
  ]);
  parentPort?.postMessage({ event: "exit" });
}

const _messages = { "appName": "Nuxt", "version": "", "statusCode": 500, "statusMessage": "Server error", "description": "An error occurred in the application and the page could not be served. If you are the application owner, check your server logs for details.", "stack": "" };
const template$1 = (messages) => {
  messages = { ..._messages, ...messages };
  return '<!DOCTYPE html><html lang="en"><head><title>' + escapeHtml(messages.statusCode) + " - " + escapeHtml(messages.statusMessage || "Internal Server Error") + `</title><meta charset="utf-8"><meta content="width=device-width,initial-scale=1.0,minimum-scale=1.0" name="viewport"><style>.spotlight{background:linear-gradient(45deg,#00dc82,#36e4da 50%,#0047e1);bottom:-40vh;filter:blur(30vh);height:60vh;opacity:.8}*,:after,:before{border-color:var(--un-default-border-color,#e5e7eb);border-style:solid;border-width:0;box-sizing:border-box}:after,:before{--un-content:""}html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;font-feature-settings:normal;font-variation-settings:normal;-moz-tab-size:4;tab-size:4;-webkit-tap-highlight-color:transparent}body{line-height:inherit;margin:0}h1{font-size:inherit;font-weight:inherit}h1,p{margin:0}*,:after,:before{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 transparent;--un-ring-shadow:0 0 transparent;--un-shadow-inset: ;--un-shadow:0 0 transparent;--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,.5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }.pointer-events-none{pointer-events:none}.fixed{position:fixed}.left-0{left:0}.right-0{right:0}.z-10{z-index:10}.mb-6{margin-bottom:1.5rem}.mb-8{margin-bottom:2rem}.h-auto{height:auto}.min-h-screen{min-height:100vh}.flex{display:flex}.flex-1{flex:1 1 0%}.flex-col{flex-direction:column}.overflow-y-auto{overflow-y:auto}.rounded-t-md{border-top-left-radius:.375rem;border-top-right-radius:.375rem}.bg-black\\/5{background-color:#0000000d}.bg-white{--un-bg-opacity:1;background-color:rgb(255 255 255/var(--un-bg-opacity))}.p-8{padding:2rem}.px-10{padding-left:2.5rem;padding-right:2.5rem}.pt-14{padding-top:3.5rem}.text-6xl{font-size:3.75rem;line-height:1}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-black{--un-text-opacity:1;color:rgb(0 0 0/var(--un-text-opacity))}.font-light{font-weight:300}.font-medium{font-weight:500}.leading-tight{line-height:1.25}.font-sans{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji}.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}@media (prefers-color-scheme:dark){.dark\\:bg-black{--un-bg-opacity:1;background-color:rgb(0 0 0/var(--un-bg-opacity))}.dark\\:bg-white\\/10{background-color:#ffffff1a}.dark\\:text-white{--un-text-opacity:1;color:rgb(255 255 255/var(--un-text-opacity))}}@media (min-width:640px){.sm\\:text-2xl{font-size:1.5rem;line-height:2rem}.sm\\:text-8xl{font-size:6rem;line-height:1}}</style><script>!function(){const e=document.createElement("link").relList;if(!(e&&e.supports&&e.supports("modulepreload"))){for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver((e=>{for(const o of e)if("childList"===o.type)for(const e of o.addedNodes)"LINK"===e.tagName&&"modulepreload"===e.rel&&r(e)})).observe(document,{childList:!0,subtree:!0})}function r(e){if(e.ep)return;e.ep=!0;const r=function(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),"use-credentials"===e.crossOrigin?r.credentials="include":"anonymous"===e.crossOrigin?r.credentials="omit":r.credentials="same-origin",r}(e);fetch(e.href,r)}}();<\/script></head><body class="antialiased bg-white dark:bg-black dark:text-white flex flex-col font-sans min-h-screen pt-14 px-10 text-black"><div class="fixed left-0 pointer-events-none right-0 spotlight"></div><h1 class="font-medium mb-6 sm:text-8xl text-6xl">` + escapeHtml(messages.statusCode) + '</h1><p class="font-light leading-tight mb-8 sm:text-2xl text-xl">' + escapeHtml(messages.description) + '</p><div class="bg-black/5 bg-white dark:bg-white/10 flex-1 h-auto overflow-y-auto rounded-t-md"><div class="font-light leading-tight p-8 text-xl z-10">' + escapeHtml(messages.stack) + "</div></div></body></html>";
};

const errorDev = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  template: template$1
}, Symbol.toStringTag, { value: 'Module' }));

const template = "";

const _virtual__spaTemplate = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  template: template
}, Symbol.toStringTag, { value: 'Module' }));

const styles = {};

const styles$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: styles
}, Symbol.toStringTag, { value: 'Module' }));

const verifyTenantUser = async (event) => {
  var _a, _b, _c, _d;
  const authHeader = ((_b = (_a = event.node) == null ? void 0 : _a.req) == null ? void 0 : _b.headers["authorization"]) || ((_d = (_c = event.node) == null ? void 0 : _c.req) == null ? void 0 : _d.headers["Authorization"]);
  if (!authHeader || Array.isArray(authHeader)) {
    throw createError({
      statusCode: 401,
      statusMessage: "Missing authorization header"
    });
  }
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid authorization header"
    });
  }
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const {
    data: { user },
    error
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid or expired token"
    });
  }
  const { data: profile, error: profileError } = await supabase.from("profiles").select("id, tenant_id, is_super_admin").eq("id", user.id).maybeSingle();
  if (profileError || !profile) {
    throw createError({
      statusCode: 403,
      statusMessage: "Profile not found"
    });
  }
  if (!profile.tenant_id && !profile.is_super_admin) {
    throw createError({
      statusCode: 403,
      statusMessage: "Tenant access required"
    });
  }
  return { user, profile };
};

const cardSetup_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const { profile } = await verifyTenantUser(event);
  const body = await readBody(event);
  const { plan_id } = body || {};
  if (!plan_id) {
    throw createError({
      statusCode: 400,
      statusMessage: "plan_id is required"
    });
  }
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const tenantId = profile.tenant_id;
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "No tenant associated with this user"
    });
  }
  const { data: tenant, error: tenantError } = await supabase.from("tenants").select("*").eq("id", tenantId).maybeSingle();
  if (tenantError || !tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: (tenantError == null ? void 0 : tenantError.message) || "Tenant not found"
    });
  }
  if (!tenant.primary_contact_email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant is missing primary contact email"
    });
  }
  if (!["trial", "billing_hold", "active"].includes(tenant.status)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant is not eligible for card setup"
    });
  }
  const { data: plan, error: planError } = await supabase.from("plans").select("*").eq("id", plan_id).eq("is_active", true).maybeSingle();
  if (planError || !plan) {
    throw createError({
      statusCode: 404,
      statusMessage: (planError == null ? void 0 : planError.message) || "Plan not found or inactive"
    });
  }
  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const headers = {
    Authorization: `Bearer ${config.paystackSecretKey}`,
    "Content-Type": "application/json"
  };
  const defaultAmountKobo = 100;
  const amountKobo = Number(config.paystackCardSetupAmountKobo || defaultAmountKobo);
  try {
    const response = await $fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers,
      body: {
        email: tenant.primary_contact_email,
        amount: amountKobo,
        currency: plan.currency || "NGN",
        metadata: {
          tenant_id: tenant.id,
          plan_id: plan.id,
          purpose: "card_setup"
        },
        callback_url: `${baseUrl}/billing/verify`
      }
    });
    if (!(response == null ? void 0 : response.status)) {
      throw createError({
        statusCode: 502,
        statusMessage: "Failed to initialize Paystack card setup transaction"
      });
    }
    return {
      success: true,
      data: {
        authorization_url: (_a = response.data) == null ? void 0 : _a.authorization_url,
        access_code: (_b = response.data) == null ? void 0 : _b.access_code,
        reference: (_c = response.data) == null ? void 0 : _c.reference
      }
    };
  } catch (error) {
    console.error("Paystack card-setup initialize error:", error);
    if ((error == null ? void 0 : error.statusCode) && (error == null ? void 0 : error.statusMessage)) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to initialize card setup"
    });
  }
});

const cardSetup_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: cardSetup_post
}, Symbol.toStringTag, { value: 'Module' }));

const history_get = defineEventHandler(async (event) => {
  const { profile } = await verifyTenantUser(event);
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const tenantId = profile.tenant_id;
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "No tenant associated with this user"
    });
  }
  const { data, error } = await supabase.from("platform_audit_events").select("id, event_type, details, created_at").eq("tenant_id", tenantId).in("event_type", ["PAYMENT_SUCCESS", "PAYMENT_FAILURE"]).order("created_at", { ascending: false }).limit(20);
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }
  return {
    success: true,
    data: {
      events: data || []
    }
  };
});

const history_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: history_get
}, Symbol.toStringTag, { value: 'Module' }));

const initialize_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const { profile } = await verifyTenantUser(event);
  const body = await readBody(event);
  const { plan_id } = body || {};
  if (!plan_id) {
    throw createError({
      statusCode: 400,
      statusMessage: "plan_id is required"
    });
  }
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const tenantId = profile.tenant_id;
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "No tenant associated with this user"
    });
  }
  const { data: tenant, error: tenantError } = await supabase.from("tenants").select("*").eq("id", tenantId).maybeSingle();
  if (tenantError || !tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: (tenantError == null ? void 0 : tenantError.message) || "Tenant not found"
    });
  }
  if (!tenant.primary_contact_email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant is missing primary contact email"
    });
  }
  if (!["trial", "billing_hold"].includes(tenant.status)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant is not eligible for billing initialization"
    });
  }
  const { data: plan, error: planError } = await supabase.from("plans").select("*").eq("id", plan_id).eq("is_active", true).maybeSingle();
  if (planError || !plan) {
    throw createError({
      statusCode: 404,
      statusMessage: (planError == null ? void 0 : planError.message) || "Plan not found or inactive"
    });
  }
  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const headers = {
    Authorization: `Bearer ${config.paystackSecretKey}`,
    "Content-Type": "application/json"
  };
  const amountKobo = Math.round(Number(plan.price_monthly) * 100);
  try {
    const response = await $fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers,
      body: {
        email: tenant.primary_contact_email,
        amount: amountKobo,
        currency: plan.currency || "NGN",
        metadata: {
          tenant_id: tenant.id,
          plan_id: plan.id,
          purpose: "subscription_charge"
        },
        callback_url: `${baseUrl}/billing/verify`
      }
    });
    if (!(response == null ? void 0 : response.status)) {
      throw createError({
        statusCode: 502,
        statusMessage: "Failed to initialize Paystack transaction"
      });
    }
    return {
      success: true,
      data: {
        authorization_url: (_a = response.data) == null ? void 0 : _a.authorization_url,
        access_code: (_b = response.data) == null ? void 0 : _b.access_code,
        reference: (_c = response.data) == null ? void 0 : _c.reference
      }
    };
  } catch (error) {
    console.error("Paystack initialize error:", error);
    if ((error == null ? void 0 : error.statusCode) && (error == null ? void 0 : error.statusMessage)) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to initialize payment"
    });
  }
});

const initialize_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: initialize_post
}, Symbol.toStringTag, { value: 'Module' }));

const paystackVerify_post = defineEventHandler(async (event) => {
  const { profile } = await verifyTenantUser(event);
  const body = await readBody(event);
  const { reference } = body || {};
  if (!reference) {
    throw createError({
      statusCode: 400,
      statusMessage: "reference is required"
    });
  }
  const config = useRuntimeConfig();
  const headers = {
    Authorization: `Bearer ${config.paystackSecretKey}`,
    "Content-Type": "application/json"
  };
  try {
    const response = await $fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers
      }
    );
    return {
      success: true,
      data: {
        paystack: (response == null ? void 0 : response.data) || null,
        tenant_id: profile.tenant_id || null
      }
    };
  } catch (error) {
    console.error("Paystack verify error:", error);
    if ((error == null ? void 0 : error.statusCode) && (error == null ? void 0 : error.statusMessage)) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to verify payment status"
    });
  }
});

const paystackVerify_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: paystackVerify_post
}, Symbol.toStringTag, { value: 'Module' }));

const selectPlan_post = defineEventHandler(async (event) => {
  const { profile } = await verifyTenantUser(event);
  const body = await readBody(event);
  const { plan_id } = body || {};
  if (!plan_id) {
    throw createError({
      statusCode: 400,
      statusMessage: "plan_id is required"
    });
  }
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const tenantId = profile.tenant_id;
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "No tenant associated with this user"
    });
  }
  const { data: plan, error: planError } = await supabase.from("plans").select("id, code, name, price_monthly, currency, is_active").eq("id", plan_id).maybeSingle();
  if (planError || !plan) {
    throw createError({
      statusCode: 404,
      statusMessage: (planError == null ? void 0 : planError.message) || "Plan not found"
    });
  }
  if (!plan.is_active) {
    throw createError({
      statusCode: 400,
      statusMessage: "Plan is not active"
    });
  }
  const { error: updateError } = await supabase.from("tenants").update({
    current_plan_id: plan.id,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", tenantId);
  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: updateError.message
    });
  }
  await logPlatformAuditEvent({
    eventType: "PLAN_SELECTED",
    tenantId,
    userId: profile.id,
    details: {
      plan_id: plan.id,
      plan_code: plan.code,
      plan_name: plan.name,
      price_monthly: plan.price_monthly,
      currency: plan.currency
    }
  });
  return {
    success: true,
    data: {
      plan
    }
  };
});

const selectPlan_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: selectPlan_post
}, Symbol.toStringTag, { value: 'Module' }));

const status_get = defineEventHandler(async (event) => {
  const { profile } = await verifyTenantUser(event);
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const tenantId = profile.tenant_id;
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "No tenant associated with this user"
    });
  }
  const { data: tenant, error } = await supabase.from("tenants").select("*").eq("id", tenantId).maybeSingle();
  if (error || !tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: (error == null ? void 0 : error.message) || "Tenant not found"
    });
  }
  const updatedTenant = tenant;
  const { data: plans, error: plansError } = await supabase.from("plans").select("*").eq("is_active", true).order("sort_order", { ascending: true });
  if (plansError) {
    throw createError({
      statusCode: 500,
      statusMessage: plansError.message
    });
  }
  const currentPlan = updatedTenant.current_plan_id ? (plans == null ? void 0 : plans.find((p) => p.id === updatedTenant.current_plan_id)) || null : null;
  return {
    success: true,
    data: {
      tenant: {
        id: updatedTenant.id,
        status: updatedTenant.status,
        trial_end_date: updatedTenant.trial_end_date,
        subscription_end_date: updatedTenant.subscription_end_date,
        current_plan_id: updatedTenant.current_plan_id
      },
      current_plan: currentPlan,
      available_plans: plans || []
    }
  };
});

const status_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: status_get
}, Symbol.toStringTag, { value: 'Module' }));

const subscriptionRenewal_post = defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const now = /* @__PURE__ */ new Date();
  now.toISOString();
  const { data: tenants, error } = await supabase.from("tenants").select("id, status, subscription_end_date, paystack_authorization_code, paystack_customer_code, current_plan_id, primary_contact_email, billing_retry_attempts, billing_retry_last_attempt").not("paystack_authorization_code", "is", null);
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }
  const headers = {
    Authorization: `Bearer ${config.paystackSecretKey}`,
    "Content-Type": "application/json"
  };
  const processed = [];
  const failed = [];
  if (!tenants || tenants.length === 0) {
    return {
      success: true,
      data: {
        processed: 0,
        failed: 0
      }
    };
  }
  for (const tenant of tenants) {
    const subscriptionEnd = tenant.subscription_end_date ? new Date(tenant.subscription_end_date) : null;
    const attempts = tenant.billing_retry_attempts || 0;
    const lastAttempt = tenant.billing_retry_last_attempt ? new Date(tenant.billing_retry_last_attempt) : null;
    let shouldCharge = false;
    if (tenant.status === "active" && subscriptionEnd && subscriptionEnd <= now) {
      shouldCharge = true;
    }
    const retryWindowMs = 24 * 60 * 60 * 1e3;
    if (tenant.status === "billing_hold" && attempts < 3) {
      if (!lastAttempt || now.getTime() - lastAttempt.getTime() >= retryWindowMs) {
        shouldCharge = true;
      }
    }
    if (!shouldCharge) {
      continue;
    }
    if (!tenant.current_plan_id || !tenant.primary_contact_email) {
      continue;
    }
    const { data: plan, error: planError } = await supabase.from("plans").select("*").eq("id", tenant.current_plan_id).maybeSingle();
    if (planError || !plan) {
      continue;
    }
    const amountKobo = Math.round(Number(plan.price_monthly) * 100);
    try {
      await $fetch("https://api.paystack.co/transaction/charge_authorization", {
        method: "POST",
        headers,
        body: {
          authorization_code: tenant.paystack_authorization_code,
          email: tenant.primary_contact_email,
          amount: amountKobo,
          currency: plan.currency || "NGN",
          metadata: {
            tenant_id: tenant.id,
            plan_id: plan.id,
            purpose: "subscription_charge"
          }
        }
      });
      processed.push(tenant.id);
    } catch (e) {
      console.error("Failed to trigger subscription renewal charge", {
        tenantId: tenant.id,
        error: e
      });
      failed.push(tenant.id);
    }
  }
  return {
    success: true,
    data: {
      processed: processed.length,
      failed: failed.length
    }
  };
});

const subscriptionRenewal_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: subscriptionRenewal_post
}, Symbol.toStringTag, { value: 'Module' }));

const trialExpiry_post = defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const now = /* @__PURE__ */ new Date();
  const cutoffIso = now.toISOString();
  const { data: tenants, error } = await supabase.from("tenants").select("id, status, trial_end_date").eq("status", "trial").lt("trial_end_date", cutoffIso);
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }
  const expired = tenants || [];
  for (const tenant of expired) {
    const { error: updateError } = await supabase.from("tenants").update({
      status: "billing_hold",
      updated_at: now.toISOString()
    }).eq("id", tenant.id);
    if (updateError) {
      console.error("Failed to update tenant to billing_hold for trial expiry", {
        tenantId: tenant.id,
        error: updateError
      });
      continue;
    }
    await logPlatformAuditEvent({
      eventType: "TRIAL_EXPIRED",
      tenantId: tenant.id,
      details: {
        trial_end_date: tenant.trial_end_date,
        processed_at: now.toISOString()
      }
    });
  }
  return {
    success: true,
    data: {
      processed: expired.length
    }
  };
});

const trialExpiry_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: trialExpiry_post
}, Symbol.toStringTag, { value: 'Module' }));

const demoRequest_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { name, email, hotel, rooms } = body;
    if (!name || !email || !hotel || !rooms) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required fields"
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid email format"
      });
    }
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const { data: existingRequest } = await supabase.from("demo_requests").select("id, status").eq("email", email).single();
    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return {
          success: true,
          message: "Your request is already being reviewed. We'll contact you soon!"
        };
      } else if (existingRequest.status === "approved") {
        return {
          success: true,
          message: "You already have access! Check your email for your invitation link."
        };
      }
    }
    const { data, error } = await supabase.from("demo_requests").insert({
      name,
      email,
      hotel_name: hotel,
      room_count: rooms,
      status: "pending"
    }).select().single();
    if (error) {
      console.error("Supabase error:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to submit request"
      });
    }
    try {
      const { createEmailService } = await Promise.resolve().then(function () { return emailService; });
      const { createAdminNotificationEmail } = await Promise.resolve().then(function () { return emailTemplates; });
      const emailService$1 = createEmailService();
      const baseUrl = process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const adminNotificationTemplate = createAdminNotificationEmail({
        name,
        email,
        hotelName: hotel,
        roomCount: rooms,
        requestId: data.id,
        adminPanelLink: `${baseUrl}/admin/demo-requests`
      });
      const adminEmail = process.env.ADMIN_EMAIL || "admin@roomio.com";
      await emailService$1.sendEmail({
        to: adminEmail,
        toName: "Roomio Admin",
        template: adminNotificationTemplate
      });
      console.log("Admin notification sent for request:", data.id);
    } catch (emailError) {
      console.error("Failed to send admin notification:", emailError);
    }
    return {
      success: true,
      message: "Thank you! Your request has been submitted. We'll review your application and send you an invitation within 24 hours.",
      requestId: data.id
    };
  } catch (error) {
    console.error("Demo request error:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error"
    });
  }
});

const demoRequest_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: demoRequest_post
}, Symbol.toStringTag, { value: 'Module' }));

const categories_get = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const query = getQuery$1(event);
    const { category_type } = query;
    let queryBuilder = supabase.from("inventory_categories").select("*").eq("is_active", true).order("name");
    if (category_type) {
      queryBuilder = queryBuilder.eq("category_type", category_type);
    }
    const { data, error } = await queryBuilder;
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      });
    }
    return {
      success: true,
      data
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error"
    });
  }
});

const categories_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: categories_get
}, Symbol.toStringTag, { value: 'Module' }));

const items_get = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const query = getQuery$1(event);
    const { category_id, search, stock_status } = query;
    let queryBuilder = supabase.from("inventory_items").select(`
        *,
        category:inventory_categories(id, name, category_type),
        supplier:vendors(id, vendor_name)
      `).eq("is_active", true).order("name");
    if (category_id) {
      queryBuilder = queryBuilder.eq("category_id", category_id);
    }
    if (search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${search}%,item_code.ilike.%${search}%`);
    }
    const { data, error } = await queryBuilder;
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      });
    }
    let filteredData = data;
    if (stock_status) {
      filteredData = data == null ? void 0 : data.filter((item) => {
        switch (stock_status) {
          case "in_stock":
            return item.current_stock > item.minimum_stock;
          case "low_stock":
            return item.current_stock <= item.minimum_stock && item.current_stock > 0;
          case "out_of_stock":
            return item.current_stock === 0;
          default:
            return true;
        }
      });
    }
    return {
      success: true,
      data: filteredData
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : "An unexpected error occurred"
    });
  }
});

const items_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: items_get
}, Symbol.toStringTag, { value: 'Module' }));

const items_post = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const user = { id: "system" };
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized"
      });
    }
    const body = await readBody(event);
    const requiredFields = ["name", "category_id", "unit_of_measure", "minimum_stock"];
    for (const field of requiredFields) {
      if (!body[field]) {
        throw createError({
          statusCode: 400,
          statusMessage: `${field} is required`
        });
      }
    }
    if (!body.item_code) {
      const { data: lastItem } = await supabase.from("inventory_items").select("item_code").order("created_at", { ascending: false }).limit(1);
      let nextNumber = 1;
      if (lastItem && lastItem.length > 0) {
        const lastCode = lastItem[0].item_code;
        const match = lastCode.match(/INV-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      body.item_code = `INV-${String(nextNumber).padStart(6, "0")}`;
    }
    body.created_by = user.id;
    body.created_at = (/* @__PURE__ */ new Date()).toISOString();
    body.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    const { data, error } = await supabase.from("inventory_items").insert(body).select(`
        *,
        category:inventory_categories(id, name, category_type),
        supplier:vendors(id, vendor_name)
      `).single();
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      });
    }
    if (body.current_stock > 0) {
      await supabase.from("inventory_transactions").insert({
        transaction_number: `ADJ-${Date.now()}`,
        transaction_type: "adjustment",
        inventory_item_id: data.id,
        quantity: body.current_stock,
        stock_before: 0,
        stock_after: body.current_stock,
        notes: "Initial stock entry",
        processed_by: user.id
      });
    }
    return {
      success: true,
      data
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : "An unexpected error occurred"
    });
  }
});

const items_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: items_post
}, Symbol.toStringTag, { value: 'Module' }));

const _id__patch$6 = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const params = getRouterParams(event);
    const id = params.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Inventory item ID is required"
      });
    }
    const body = await readBody(event);
    const updatePayload = {};
    const updatableFields = [
      "name",
      "item_code",
      "description",
      "category_id",
      "unit_of_measure",
      "current_stock",
      "minimum_stock",
      "maximum_stock",
      "reorder_point",
      "unit_cost",
      "average_cost",
      "last_purchase_price",
      "primary_supplier_id",
      "supplier_item_code",
      "storage_location",
      "storage_temperature",
      "shelf_life_days",
      "is_active"
    ];
    for (const field of updatableFields) {
      if (field in body) {
        updatePayload[field] = body[field];
      }
    }
    if (Object.keys(updatePayload).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No valid fields provided for update"
      });
    }
    updatePayload.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    const { data, error } = await supabase.from("inventory_items").update(updatePayload).eq("id", id).select(`
        *,
        category:inventory_categories(id, name, category_type),
        supplier:vendors(id, vendor_name)
      `).single();
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      });
    }
    return {
      success: true,
      data
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error"
    });
  }
});

const _id__patch$7 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__patch$6
}, Symbol.toStringTag, { value: 'Module' }));

const transactions_get = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const query = getQuery$1(event);
    const {
      inventory_item_id,
      transaction_type,
      limit: queryLimit = 50,
      offset: queryOffset = 0
    } = query;
    if (!inventory_item_id) {
      throw createError({
        statusCode: 400,
        statusMessage: "inventory_item_id is required"
      });
    }
    const limit = parseInt(String(queryLimit));
    const offset = parseInt(String(queryOffset));
    let queryBuilder = supabase.from("inventory_transactions").select(`
        *,
        item:inventory_items(id, name, unit_of_measure),
        supplier:vendors(id, vendor_name)
      `).eq("inventory_item_id", inventory_item_id).order("created_at", { ascending: false }).range(offset, offset + limit - 1);
    if (transaction_type) {
      queryBuilder = queryBuilder.eq("transaction_type", transaction_type);
    }
    const { data, error } = await queryBuilder;
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      });
    }
    return {
      success: true,
      data
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error"
    });
  }
});

const transactions_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: transactions_get
}, Symbol.toStringTag, { value: 'Module' }));

const transactions_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const body = await readBody(event);
    const { transaction_type, inventory_item_id, quantity, processed_by } = body || {};
    if (!transaction_type || !inventory_item_id || typeof quantity !== "number" || !processed_by) {
      throw createError({
        statusCode: 400,
        statusMessage: "transaction_type, inventory_item_id, numeric quantity and processed_by are required"
      });
    }
    const { data: item, error: itemError } = await supabase.from("inventory_items").select("id, current_stock, unit_cost, primary_supplier_id").eq("id", inventory_item_id).single();
    if (itemError || !item) {
      throw createError({
        statusCode: 404,
        statusMessage: "Inventory item not found"
      });
    }
    const stock_before = (_a = item.current_stock) != null ? _a : 0;
    const stock_after = stock_before + quantity;
    const unit_cost = typeof body.unit_cost === "number" ? body.unit_cost : (_b = item.unit_cost) != null ? _b : 0;
    const total_cost = Math.abs(quantity) * (unit_cost != null ? unit_cost : 0);
    const transaction_number = `ADJ-${Date.now()}`;
    const transactionPayload = {
      transaction_number,
      transaction_type,
      inventory_item_id,
      quantity,
      unit_cost,
      total_cost,
      stock_before,
      stock_after,
      reference_type: (_c = body.reference_type) != null ? _c : "manual_adjustment",
      reference_id: (_d = body.reference_id) != null ? _d : null,
      supplier_id: (_f = (_e = body.supplier_id) != null ? _e : item.primary_supplier_id) != null ? _f : null,
      notes: (_g = body.notes) != null ? _g : null,
      batch_number: (_h = body.batch_number) != null ? _h : null,
      expiry_date: (_i = body.expiry_date) != null ? _i : null,
      processed_by
    };
    const { data: transaction, error: txError } = await supabase.from("inventory_transactions").insert(transactionPayload).select("*").single();
    if (txError) {
      throw createError({
        statusCode: 400,
        statusMessage: txError.message
      });
    }
    const { error: updateError } = await supabase.from("inventory_items").update({
      current_stock: stock_after,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", inventory_item_id);
    if (updateError) {
      throw createError({
        statusCode: 400,
        statusMessage: updateError.message
      });
    }
    return {
      success: true,
      data: transaction
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : "An unexpected error occurred"
    });
  }
});

const transactions_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: transactions_post
}, Symbol.toStringTag, { value: 'Module' }));

const handlePaystackChargeSuccess = async (data) => {
  var _a, _b, _c;
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const metadata = data.metadata || {};
  const tenantId = metadata.tenant_id;
  const planId = metadata.plan_id;
  const purpose = metadata.purpose;
  if (!tenantId || !planId) {
    console.error("Paystack success missing tenant_id or plan_id in metadata");
    return;
  }
  const now = /* @__PURE__ */ new Date();
  const nowIso = now.toISOString();
  if (purpose === "card_setup") {
    const updates2 = {
      current_plan_id: planId,
      updated_at: nowIso,
      billing_retry_attempts: 0,
      billing_retry_last_attempt: null
    };
    if ((_a = data.authorization) == null ? void 0 : _a.authorization_code) {
      updates2.paystack_authorization_code = data.authorization.authorization_code;
    }
    if ((_b = data.customer) == null ? void 0 : _b.customer_code) {
      updates2.paystack_customer_code = data.customer.customer_code;
    }
    const { error: updateError2 } = await supabase.from("tenants").update(updates2).eq("id", tenantId);
    if (updateError2) {
      console.error("Failed to update tenant on Paystack card setup success:", updateError2);
    }
    await logPlatformAuditEvent({
      eventType: "CARD_SETUP_SUCCESS",
      tenantId,
      details: {
        gateway: "paystack",
        plan_id: planId,
        amount: data.amount,
        currency: data.currency,
        reference: data.reference,
        status: data.status
      }
    });
    return;
  }
  const updates = {
    status: "active",
    current_plan_id: planId,
    subscription_end_date: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1e3
    ).toISOString(),
    updated_at: nowIso,
    billing_retry_attempts: 0,
    billing_retry_last_attempt: nowIso
  };
  if ((_c = data.customer) == null ? void 0 : _c.customer_code) {
    updates.paystack_customer_code = data.customer.customer_code;
  }
  const { error: updateError } = await supabase.from("tenants").update(updates).eq("id", tenantId);
  if (updateError) {
    console.error("Failed to update tenant on Paystack success:", updateError);
  }
  await logPlatformAuditEvent({
    eventType: "PAYMENT_SUCCESS",
    tenantId,
    details: {
      gateway: "paystack",
      plan_id: planId,
      amount: data.amount,
      currency: data.currency,
      reference: data.reference,
      status: data.status
    }
  });
};
const handlePaystackChargeFailure = async (data) => {
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const metadata = data.metadata || {};
  const tenantId = metadata.tenant_id;
  const purpose = metadata.purpose;
  if (!tenantId) {
    console.error("Paystack failure missing tenant_id in metadata");
    return;
  }
  if (purpose === "card_setup") {
    await logPlatformAuditEvent({
      eventType: "CARD_SETUP_FAILURE",
      tenantId,
      details: {
        gateway: "paystack",
        reference: data.reference,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        reason: data.gateway_response
      }
    });
    return;
  }
  const now = /* @__PURE__ */ new Date();
  const nowIso = now.toISOString();
  const windowMs = 72 * 60 * 60 * 1e3;
  const { data: tenant, error: tenantError } = await supabase.from("tenants").select("id, status, billing_retry_attempts, billing_retry_last_attempt").eq("id", tenantId).maybeSingle();
  if (tenantError || !tenant) {
    console.error("Failed to load tenant for Paystack failure handling", {
      tenantId,
      error: tenantError
    });
  }
  let attempts = (tenant == null ? void 0 : tenant.billing_retry_attempts) || 0;
  const lastAttempt = (tenant == null ? void 0 : tenant.billing_retry_last_attempt) ? new Date(tenant.billing_retry_last_attempt) : null;
  if (lastAttempt && now.getTime() - lastAttempt.getTime() > windowMs) {
    attempts = 0;
  }
  attempts += 1;
  let newStatus = "billing_hold";
  if (attempts >= 3) {
    newStatus = "suspended";
  }
  const { error: updateError } = await supabase.from("tenants").update({
    status: newStatus,
    billing_retry_attempts: attempts,
    billing_retry_last_attempt: nowIso,
    updated_at: nowIso
  }).eq("id", tenantId);
  if (updateError) {
    console.error("Failed to update tenant on Paystack failure:", updateError);
  }
  await logPlatformAuditEvent({
    eventType: "PAYMENT_FAILURE",
    tenantId,
    details: {
      gateway: "paystack",
      reference: data.reference,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      reason: data.gateway_response,
      billing_status: newStatus,
      retry_attempts: attempts
    }
  });
};

const webhook_post = defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event);
  if (!rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: "Empty webhook body"
    });
  }
  const config = useRuntimeConfig();
  const signature = event.node.req.headers["x-paystack-signature"] || event.node.req.headers["X-Paystack-Signature"];
  if (!signature || Array.isArray(signature)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing Paystack signature"
    });
  }
  if (!config.paystackWebhookSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing Paystack webhook secret configuration"
    });
  }
  const hash = createHmac("sha512", config.paystackWebhookSecret).update(rawBody).digest("hex");
  if (hash !== signature) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid webhook signature"
    });
  }
  let payload;
  try {
    payload = JSON.parse(rawBody.toString());
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid webhook JSON"
    });
  }
  const eventName = payload.event;
  const data = payload.data || {};
  if (eventName === "charge.success" && data.status === "success") {
    await handlePaystackChargeSuccess(data);
  } else if (eventName === "charge.failed") {
    await handlePaystackChargeFailure(data);
  }
  return { success: true };
});

const webhook_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: webhook_post
}, Symbol.toStringTag, { value: 'Module' }));

const purchaseOrders_get = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const query = getQuery$1(event);
    const scope = query.scope || "all";
    const status = query.status;
    const supplierId = query.supplier_id;
    let poQuery = supabase.from("purchase_orders").select(
      `
        id,
        po_number,
        supplier_id,
        status,
        order_date,
        expected_delivery_date,
        actual_delivery_date,
        subtotal,
        tax_amount,
        shipping_cost,
        total_amount,
        created_at,
        supplier:vendors(id, vendor_name)
      `,
      { count: "exact" }
    );
    if (scope === "pending") {
      poQuery = poQuery.neq("status", "received").neq("status", "cancelled");
    }
    if (status) {
      poQuery = poQuery.eq("status", status);
    }
    if (supplierId) {
      poQuery = poQuery.eq("supplier_id", supplierId);
    }
    const { data, count, error } = await poQuery.order("order_date", { ascending: false });
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      });
    }
    return {
      success: true,
      scope,
      pendingCount: scope === "pending" ? count || 0 : 0,
      totalCount: count || 0,
      data: data || []
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error"
    });
  }
});

const purchaseOrders_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: purchaseOrders_get
}, Symbol.toStringTag, { value: 'Module' }));

const purchaseOrders_post = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const body = await readBody(event);
    const {
      supplier_id,
      expected_delivery_date,
      tax_amount = 0,
      shipping_cost = 0,
      notes,
      items,
      subtotal,
      total_amount,
      created_by
    } = body || {};
    if (!supplier_id || !Array.isArray(items) || items.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "supplier_id and at least one item are required"
      });
    }
    if (typeof subtotal !== "number" || typeof total_amount !== "number") {
      throw createError({
        statusCode: 400,
        statusMessage: "subtotal and total_amount must be numeric"
      });
    }
    if (!created_by) {
      throw createError({
        statusCode: 400,
        statusMessage: "created_by is required"
      });
    }
    const invalidItem = items.find(
      (item) => !item.inventory_item_id || typeof item.quantity_ordered !== "number" || typeof item.unit_price !== "number"
    );
    if (invalidItem) {
      throw createError({
        statusCode: 400,
        statusMessage: "Each item must have inventory_item_id, numeric quantity_ordered and unit_price"
      });
    }
    const { data: purchaseOrder, error: poError } = await supabase.from("purchase_orders").insert({
      supplier_id,
      expected_delivery_date: expected_delivery_date || null,
      status: "draft",
      subtotal,
      tax_amount,
      shipping_cost,
      total_amount,
      notes: notes || null,
      created_by
    }).select("*").single();
    if (poError || !purchaseOrder) {
      throw createError({
        statusCode: 400,
        statusMessage: (poError == null ? void 0 : poError.message) || "Failed to create purchase order"
      });
    }
    const itemsPayload = items.map((item) => {
      var _a;
      return {
        purchase_order_id: purchaseOrder.id,
        inventory_item_id: item.inventory_item_id,
        quantity_ordered: item.quantity_ordered,
        quantity_received: 0,
        unit_price: item.unit_price,
        total_price: (_a = item.total_price) != null ? _a : item.quantity_ordered * item.unit_price,
        notes: item.notes || null
      };
    });
    const { error: itemsError } = await supabase.from("purchase_order_items").insert(itemsPayload);
    if (itemsError) {
      throw createError({
        statusCode: 400,
        statusMessage: itemsError.message
      });
    }
    return {
      success: true,
      data: {
        ...purchaseOrder,
        items: itemsPayload
      }
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error"
    });
  }
});

const purchaseOrders_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: purchaseOrders_post
}, Symbol.toStringTag, { value: 'Module' }));

const approve_post$2 = defineEventHandler(async (event) => {
  var _a, _b;
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const params = getRouterParams(event);
    const id = params.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Purchase order ID is required"
      });
    }
    const body = await readBody(event);
    const { approver_id } = body || {};
    if (!approver_id) {
      throw createError({
        statusCode: 400,
        statusMessage: "approver_id is required"
      });
    }
    const { data: purchaseOrder, error: poError } = await supabase.from("purchase_orders").select(`
        *,
        items:purchase_order_items(
          id,
          inventory_item_id,
          quantity_ordered,
          unit_price,
          total_price
        )
      `).eq("id", id).single();
    if (poError || !purchaseOrder) {
      throw createError({
        statusCode: 404,
        statusMessage: (poError == null ? void 0 : poError.message) || "Purchase order not found"
      });
    }
    const forbiddenStatuses = ["received", "partial_received", "cancelled"];
    if (forbiddenStatuses.includes(purchaseOrder.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot approve a purchase order in status ${purchaseOrder.status}`
      });
    }
    const items = purchaseOrder.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Purchase order has no items to receive"
      });
    }
    for (const [index, item] of items.entries()) {
      const { inventory_item_id, quantity_ordered, unit_price, total_price } = item;
      const { data: inventoryItem, error: itemError } = await supabase.from("inventory_items").select("id, current_stock, unit_cost, primary_supplier_id").eq("id", inventory_item_id).single();
      if (itemError || !inventoryItem) {
        throw createError({
          statusCode: 404,
          statusMessage: "Inventory item not found for one of the purchase order items"
        });
      }
      const stock_before = (_a = inventoryItem.current_stock) != null ? _a : 0;
      const quantity = quantity_ordered != null ? quantity_ordered : 0;
      const stock_after = stock_before + quantity;
      const unit_cost = typeof unit_price === "number" ? unit_price : (_b = inventoryItem.unit_cost) != null ? _b : 0;
      const tx_total_cost = typeof total_price === "number" ? total_price : Math.abs(quantity) * (unit_cost != null ? unit_cost : 0);
      const basePoNumber = purchaseOrder.po_number || "PO";
      const lineSuffix = `L${String(index + 1).padStart(3, "0")}`;
      const transaction_number = `${basePoNumber}-${lineSuffix}`;
      const transactionPayload = {
        transaction_number,
        transaction_type: "purchase",
        inventory_item_id,
        quantity,
        unit_cost,
        total_cost: tx_total_cost,
        stock_before,
        stock_after,
        reference_type: "purchase_order",
        reference_id: purchaseOrder.id,
        supplier_id: purchaseOrder.supplier_id,
        notes: purchaseOrder.notes || null,
        batch_number: null,
        expiry_date: null,
        processed_by: approver_id
      };
      const { error: txError } = await supabase.from("inventory_transactions").insert(transactionPayload);
      if (txError) {
        throw createError({
          statusCode: 400,
          statusMessage: txError.message
        });
      }
      const { error: updateError } = await supabase.from("inventory_items").update({
        current_stock: stock_after,
        unit_cost,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", inventory_item_id);
      if (updateError) {
        throw createError({
          statusCode: 400,
          statusMessage: updateError.message
        });
      }
    }
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const { data: updatedOrder, error: updatePoError } = await supabase.from("purchase_orders").update({
      status: "received",
      approved_by: approver_id,
      received_by: approver_id,
      actual_delivery_date: today
    }).eq("id", id).select(`
        *,
        items:purchase_order_items(
          id,
          inventory_item_id,
          quantity_ordered,
          unit_price,
          total_price
        )
      `).single();
    if (updatePoError || !updatedOrder) {
      throw createError({
        statusCode: 400,
        statusMessage: (updatePoError == null ? void 0 : updatePoError.message) || "Failed to update purchase order status"
      });
    }
    return {
      success: true,
      data: updatedOrder
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error"
    });
  }
});

const approve_post$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: approve_post$2
}, Symbol.toStringTag, { value: 'Module' }));

const menuCategories_get = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const { data, error } = await supabase.from("menu_categories").select("*").eq("is_active", true).order("name");
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      });
    }
    return {
      success: true,
      data
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error"
    });
  }
});

const menuCategories_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: menuCategories_get
}, Symbol.toStringTag, { value: 'Module' }));

const menuItems__id__patch = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const params = getRouterParams(event);
    const id = params.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Menu item ID is required"
      });
    }
    const body = await readBody(event);
    const updatePayload = {};
    const updatableFields = [
      "name",
      "item_code",
      "description",
      "category_id",
      "base_price",
      "cost_price",
      "profit_margin",
      "item_type",
      "preparation_time",
      "calories",
      "allergens",
      "dietary_info",
      "is_available",
      "is_featured",
      "availability_schedule",
      "image_url",
      "images",
      "track_inventory",
      "low_stock_threshold"
    ];
    for (const field of updatableFields) {
      if (field in body) {
        updatePayload[field] = body[field];
      }
    }
    const { data, error } = await supabase.from("menu_items").update(updatePayload).eq("id", id).select(`
        *,
        category:menu_categories(id, name, category_type)
      `).single();
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      });
    }
    return {
      success: true,
      data
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error"
    });
  }
});

const menuItems__id__patch$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: menuItems__id__patch
}, Symbol.toStringTag, { value: 'Module' }));

const menuItems_get = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const query = getQuery$1(event);
    const {
      category_id,
      item_type,
      is_available,
      search,
      limit: queryLimit = 100,
      offset: queryOffset = 0
    } = query;
    const limit = parseInt(String(queryLimit));
    const offset = parseInt(String(queryOffset));
    let queryBuilder = supabase.from("menu_items").select(`
        *,
        category:menu_categories(id, name, category_type),
        recipe_ingredients:recipe_ingredients(
          id,
          quantity_required,
          unit,
          inventory_item:inventory_items(id, name, unit_of_measure, current_stock)
        )
      `).order("name").range(offset, offset + limit - 1);
    if (category_id) {
      queryBuilder = queryBuilder.eq("category_id", category_id);
    }
    if (item_type) {
      queryBuilder = queryBuilder.eq("item_type", item_type);
    }
    if (is_available !== void 0) {
      queryBuilder = queryBuilder.eq("is_available", is_available === "true");
    }
    if (search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    const { data, error, count } = await queryBuilder;
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      });
    }
    return {
      success: true,
      data,
      count
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error"
    });
  }
});

const menuItems_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: menuItems_get
}, Symbol.toStringTag, { value: 'Module' }));

const menuItems_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const body = await readBody(event);
    const requiredFields = ["name", "category_id", "base_price", "item_type"];
    for (const field of requiredFields) {
      if (!body[field]) {
        throw createError({
          statusCode: 400,
          statusMessage: `${field} is required`
        });
      }
    }
    if (!body.item_code) {
      const { data: lastItem } = await supabase.from("menu_items").select("item_code").order("created_at", { ascending: false }).limit(1);
      let nextNumber = 1;
      if (lastItem && lastItem.length > 0) {
        const lastCode = lastItem[0].item_code;
        const match = lastCode && lastCode.match(/MENU-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      body.item_code = `MENU-${String(nextNumber).padStart(6, "0")}`;
    }
    const payload = {
      item_code: body.item_code,
      name: body.name,
      description: (_a = body.description) != null ? _a : null,
      category_id: body.category_id,
      base_price: body.base_price,
      cost_price: (_b = body.cost_price) != null ? _b : 0,
      profit_margin: (_c = body.profit_margin) != null ? _c : null,
      item_type: body.item_type,
      preparation_time: (_d = body.preparation_time) != null ? _d : 15,
      calories: (_e = body.calories) != null ? _e : null,
      allergens: (_f = body.allergens) != null ? _f : [],
      dietary_info: (_g = body.dietary_info) != null ? _g : [],
      is_available: (_h = body.is_available) != null ? _h : true,
      is_featured: (_i = body.is_featured) != null ? _i : false,
      availability_schedule: (_j = body.availability_schedule) != null ? _j : null,
      image_url: (_k = body.image_url) != null ? _k : null,
      images: (_l = body.images) != null ? _l : [],
      track_inventory: (_m = body.track_inventory) != null ? _m : true,
      low_stock_threshold: (_n = body.low_stock_threshold) != null ? _n : 10
    };
    const { data, error } = await supabase.from("menu_items").insert(payload).select(`
        *,
        category:menu_categories(id, name, category_type)
      `).single();
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      });
    }
    return {
      success: true,
      data
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error"
    });
  }
});

const menuItems_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: menuItems_post
}, Symbol.toStringTag, { value: 'Module' }));

const _id__delete = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const params = getRouterParams(event);
    const id = params.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Menu item ID is required"
      });
    }
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      });
    }
    return {
      success: true
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error"
    });
  }
});

const _id__delete$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__delete
}, Symbol.toStringTag, { value: 'Module' }));

const _id__patch$4 = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const params = getRouterParams(event);
    const id = params.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Menu item ID is required"
      });
    }
    const body = await readBody(event);
    const updatePayload = {};
    const updatableFields = [
      "name",
      "item_code",
      "description",
      "category_id",
      "base_price",
      "cost_price",
      "profit_margin",
      "item_type",
      "preparation_time",
      "calories",
      "allergens",
      "dietary_info",
      "is_available",
      "is_featured",
      "availability_schedule",
      "image_url",
      "images",
      "track_inventory",
      "low_stock_threshold"
    ];
    for (const field of updatableFields) {
      if (field in body) {
        updatePayload[field] = body[field];
      }
    }
    const { data, error } = await supabase.from("menu_items").update(updatePayload).eq("id", id).select(`
        *,
        category:menu_categories(id, name, category_type)
      `).single();
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      });
    }
    return {
      success: true,
      data
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error"
    });
  }
});

const _id__patch$5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__patch$4
}, Symbol.toStringTag, { value: 'Module' }));

const orders__id__patch = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
    const params = getRouterParams(event);
    const id = params.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Order ID is required"
      });
    }
    const body = await readBody(event);
    const updatePayload = {};
    const updatableFields = [
      "order_status",
      "payment_status",
      "tax_amount",
      "service_charge",
      "discount_amount",
      "payment_method",
      "special_instructions",
      "customer_notes",
      "table_number",
      "room_number",
      "total_amount"
    ];
    for (const field of updatableFields) {
      if (field in body) {
        updatePayload[field] = body[field];
      }
    }
    if (Object.keys(updatePayload).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No valid fields provided for update"
      });
    }
    const { data, error } = await supabase.from("restaurant_orders").update(updatePayload).eq("id", id).select(
      `*,
        guest:guests(id, first_name, last_name, email, phone),
        reservation:reservations(id, reservation_number),
        items:restaurant_order_items(
          id,
          quantity,
          unit_price,
          total_price,
          modifications,
          item_status,
          menu_item:menu_items(id, name, description)
        )`
    ).single();
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      });
    }
    return {
      success: true,
      data
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error"
    });
  }
});

const orders__id__patch$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: orders__id__patch
}, Symbol.toStringTag, { value: 'Module' }));

const orders_get = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const query = getQuery$1(event);
    const {
      status,
      order_type,
      date_from,
      date_to,
      limit: queryLimit = 50,
      offset: queryOffset = 0
    } = query;
    const limit = parseInt(String(queryLimit));
    const offset = parseInt(String(queryOffset));
    let queryBuilder = supabase.from("restaurant_orders").select(`
        *,
        guest:guests(id, first_name, last_name, email, phone),
        reservation:reservations(id, reservation_number),
        items:restaurant_order_items(
          id,
          quantity,
          unit_price,
          total_price,
          modifications,
          item_status,
          menu_item:menu_items(id, name, description)
        ),
        taken_by_profile:profiles!taken_by(id, full_name),
        prepared_by_profile:profiles!prepared_by(id, full_name),
        served_by_profile:profiles!served_by(id, full_name)
      `).order("order_time", { ascending: false }).range(offset, offset + limit - 1);
    if (status) {
      queryBuilder = queryBuilder.eq("order_status", status);
    }
    if (order_type) {
      queryBuilder = queryBuilder.eq("order_type", order_type);
    }
    if (date_from) {
      queryBuilder = queryBuilder.gte("order_time", date_from);
    }
    if (date_to) {
      queryBuilder = queryBuilder.lte("order_time", date_to);
    }
    const { data, error, count } = await queryBuilder;
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      });
    }
    return {
      success: true,
      data,
      count
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error"
    });
  }
});

const orders_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: orders_get
}, Symbol.toStringTag, { value: 'Module' }));

const orders_post = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const body = await readBody(event);
    const requiredFields = ["order_type", "items", "total_amount"];
    for (const field of requiredFields) {
      if (!body[field]) {
        throw createError({
          statusCode: 400,
          statusMessage: `${field} is required`
        });
      }
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Order must contain at least one item"
      });
    }
    if (!body.order_number) {
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
      const { data: lastOrder } = await supabase.from("restaurant_orders").select("order_number").like("order_number", `ORD-${today}-%`).order("created_at", { ascending: false }).limit(1);
      let nextNumber = 1;
      if (lastOrder && lastOrder.length > 0) {
        const lastOrderNumber = lastOrder[0].order_number;
        const match = lastOrderNumber.match(/ORD-\d{8}-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      body.order_number = `ORD-${today}-${String(nextNumber).padStart(4, "0")}`;
    }
    body.order_status = body.order_status || "pending";
    body.payment_status = body.payment_status || "pending";
    body.order_time = body.order_time || (/* @__PURE__ */ new Date()).toISOString();
    let subtotal = 0;
    const items = body.items.map((item) => {
      const itemTotal = item.quantity * item.unit_price;
      subtotal += itemTotal;
      return {
        ...item,
        total_price: itemTotal
      };
    });
    body.subtotal = subtotal;
    body.tax_amount = body.tax_amount || 0;
    body.service_charge = body.service_charge || 0;
    body.discount_amount = body.discount_amount || 0;
    body.total_amount = subtotal + body.tax_amount + body.service_charge - body.discount_amount;
    const orderItems = items;
    delete body.items;
    const { data: order, error: orderError } = await supabase.from("restaurant_orders").insert(body).select().single();
    if (orderError) {
      throw createError({
        statusCode: 400,
        statusMessage: orderError.message
      });
    }
    const orderItemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id
    }));
    const { error: itemsError } = await supabase.from("restaurant_order_items").insert(orderItemsWithOrderId);
    if (itemsError) {
      await supabase.from("restaurant_orders").delete().eq("id", order.id);
      throw createError({
        statusCode: 400,
        statusMessage: itemsError.message
      });
    }
    if ((order.order_type === "dine_in" || order.order_type === "bar") && order.table_number) {
      try {
        const { error: tableError } = await supabase.from("restaurant_tables").update({
          status: "occupied",
          is_active: true
        }).eq("table_number", order.table_number);
        if (tableError) {
          console.error("Error updating table status for new order:", tableError.message);
        }
      } catch (tableUpdateError) {
        console.error("Unexpected error updating table status for new order:", tableUpdateError.message || tableUpdateError);
      }
    }
    const { data: completeOrder, error: fetchError } = await supabase.from("restaurant_orders").select(`
        *,
        guest:guests(id, first_name, last_name, email, phone),
        reservation:reservations(id, reservation_number),
        items:restaurant_order_items(
          id,
          quantity,
          unit_price,
          total_price,
          modifications,
          item_status,
          menu_item:menu_items(id, name, description, item_type)
        )
      `).eq("id", order.id).single();
    if (fetchError) {
      throw createError({
        statusCode: 400,
        statusMessage: fetchError.message
      });
    }
    return {
      success: true,
      data: completeOrder
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error"
    });
  }
});

const orders_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: orders_post
}, Symbol.toStringTag, { value: 'Module' }));

const _id__patch$2 = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const params = getRouterParams(event);
    const id = params.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Order ID is required"
      });
    }
    const body = await readBody(event);
    const updatePayload = {};
    const updatableFields = [
      "order_status",
      "payment_status",
      "tax_amount",
      "service_charge",
      "discount_amount",
      "payment_method",
      "special_instructions",
      "customer_notes",
      "table_number",
      "room_number",
      "total_amount"
    ];
    for (const field of updatableFields) {
      if (field in body) {
        updatePayload[field] = body[field];
      }
    }
    if (Object.keys(updatePayload).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No valid fields provided for update"
      });
    }
    const { data, error } = await supabase.from("restaurant_orders").update(updatePayload).eq("id", id).select(
      `*,
        guest:guests(id, first_name, last_name, email, phone),
        reservation:reservations(id, reservation_number),
        items:restaurant_order_items(
          id,
          quantity,
          unit_price,
          total_price,
          modifications,
          item_status,
          menu_item:menu_items(id, name, description)
        )`
    ).single();
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      });
    }
    try {
      if (data && data.table_number && (data.order_type === "dine_in" || data.order_type === "bar")) {
        const tableNumber = data.table_number;
        const activeStatuses = ["pending", "preparing", "ready", "served"];
        const { data: activeOrders, error: activeOrdersError } = await supabase.from("restaurant_orders").select("id, order_status").eq("table_number", tableNumber).in("order_status", activeStatuses).limit(1);
        if (activeOrdersError) {
          console.error("Error checking active orders for table:", activeOrdersError.message);
        } else {
          const hasActiveOrders = Array.isArray(activeOrders) && activeOrders.length > 0;
          const { error: tableError } = await supabase.from("restaurant_tables").update({
            status: hasActiveOrders ? "occupied" : "available",
            is_active: true
          }).eq("table_number", tableNumber);
          if (tableError) {
            console.error("Error updating table status for order update:", tableError.message);
          }
        }
      }
    } catch (tableUpdateError) {
      console.error("Unexpected error syncing table status for order update:", tableUpdateError.message || tableUpdateError);
    }
    return {
      success: true,
      data
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error"
    });
  }
});

const _id__patch$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__patch$2
}, Symbol.toStringTag, { value: 'Module' }));

const tables_get = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const query = getQuery$1(event);
    const {
      status,
      capacity_min,
      capacity_max,
      location,
      is_active,
      limit: queryLimit = 100,
      offset: queryOffset = 0
    } = query;
    const limit = parseInt(String(queryLimit));
    const offset = parseInt(String(queryOffset));
    let queryBuilder = supabase.from("restaurant_tables").select(`
        *,
        current_reservation:table_reservations(
          id,
          reservation_time,
          party_size,
          guest:guests(id, first_name, last_name, phone),
          status
        )
      `).order("table_number").range(offset, offset + limit - 1);
    if (status) {
      queryBuilder = queryBuilder.eq("status", status);
    }
    if (capacity_min) {
      queryBuilder = queryBuilder.gte("capacity", parseInt(String(capacity_min)));
    }
    if (capacity_max) {
      queryBuilder = queryBuilder.lte("capacity", parseInt(String(capacity_max)));
    }
    if (location) {
      queryBuilder = queryBuilder.eq("location", location);
    }
    if (is_active !== void 0) {
      queryBuilder = queryBuilder.eq("is_active", is_active === "true");
    }
    const { data, error, count } = await queryBuilder;
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      });
    }
    return {
      success: true,
      data,
      count
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error"
    });
  }
});

const tables_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: tables_get
}, Symbol.toStringTag, { value: 'Module' }));

const sendInvitation_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { requestId } = body;
    if (!requestId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Request ID is required"
      });
    }
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const { data: request, error: fetchError } = await supabase.from("demo_requests").select("*").eq("id", requestId).eq("status", "approved").single();
    if (fetchError || !request) {
      throw createError({
        statusCode: 404,
        statusMessage: "Request not found or not approved"
      });
    }
    const expiryDate = /* @__PURE__ */ new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    const { error: updateError } = await supabase.from("demo_requests").update({
      invitation_sent_at: (/* @__PURE__ */ new Date()).toISOString(),
      invitation_expires_at: expiryDate.toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", requestId);
    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to update invitation status"
      });
    }
    const baseUrl = process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const invitationLink = `${baseUrl}/signup?token=${request.invitation_token}`;
    try {
      const { createEmailService } = await Promise.resolve().then(function () { return emailService; });
      const { createInvitationEmail } = await Promise.resolve().then(function () { return emailTemplates; });
      const emailService$1 = createEmailService();
      const invitationTemplate = createInvitationEmail({
        name: request.name,
        email: request.email,
        hotelName: request.hotel_name,
        invitationLink,
        expiryDate: expiryDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      });
      const emailResult = await emailService$1.sendEmail({
        to: request.email,
        toName: request.name,
        template: invitationTemplate
      });
      if (!emailResult.success) {
        console.error("Failed to send invitation email:", emailResult.error);
      } else {
        console.log("Invitation email sent successfully:", emailResult.messageId);
      }
    } catch (emailError) {
      console.error("Email service error:", emailError);
    }
    return {
      success: true,
      message: "Invitation sent successfully",
      invitationLink,
      expiresAt: expiryDate.toISOString()
    };
  } catch (error) {
    console.error("Send invitation error:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error"
    });
  }
});

const sendInvitation_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: sendInvitation_post
}, Symbol.toStringTag, { value: 'Module' }));

const verifySuperAdmin = async (event) => {
  var _a, _b, _c, _d;
  const authHeader = ((_b = (_a = event.node) == null ? void 0 : _a.req) == null ? void 0 : _b.headers["authorization"]) || ((_d = (_c = event.node) == null ? void 0 : _c.req) == null ? void 0 : _d.headers["Authorization"]);
  if (!authHeader || Array.isArray(authHeader)) {
    throw createError({
      statusCode: 401,
      statusMessage: "Missing authorization header"
    });
  }
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid authorization header"
    });
  }
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid or expired token"
    });
  }
  const { data: profile, error: profileError } = await supabase.from("profiles").select("id, is_super_admin").eq("id", user.id).maybeSingle();
  if (profileError || !profile) {
    throw createError({
      statusCode: 403,
      statusMessage: "Profile not found"
    });
  }
  if (!profile.is_super_admin) {
    throw createError({
      statusCode: 403,
      statusMessage: "Super admin access required"
    });
  }
  return profile;
};

const accessRequests_get = defineEventHandler(async (event) => {
  await verifySuperAdmin(event);
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const query = getQuery$1(event);
  const {
    status = "pending",
    page = 1,
    limit = 25
  } = query;
  const pageNumber = parseInt(String(page)) || 1;
  const pageSize = Math.min(parseInt(String(limit)) || 25, 100);
  const from = (pageNumber - 1) * pageSize;
  const to = from + pageSize - 1;
  let builder = supabase.from("demo_requests").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
  if (status && typeof status === "string") {
    builder = builder.eq("status", status);
  }
  const { data, error, count } = await builder;
  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    });
  }
  return {
    success: true,
    data: {
      requests: data || [],
      total: count || 0,
      page: pageNumber,
      limit: pageSize
    }
  };
});

const accessRequests_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: accessRequests_get
}, Symbol.toStringTag, { value: 'Module' }));

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, key + "" , value);
class EmailService {
  constructor(config) {
    __publicField(this, "config");
    this.config = config;
  }
  async sendEmail(data) {
    try {
      switch (this.config.provider) {
        case "console":
          return this.sendConsoleEmail(data);
        case "sendgrid":
          return this.sendSendGridEmail(data);
        case "resend":
          return this.sendResendEmail(data);
        case "mailgun":
          return this.sendMailgunEmail(data);
        default:
          throw new Error(`Unsupported email provider: ${this.config.provider}`);
      }
    } catch (error) {
      console.error("Email sending failed:", error);
      return { success: false, error: error.message };
    }
  }
  async sendConsoleEmail(data) {
    console.log("\n\u{1F4E7} EMAIL WOULD BE SENT:");
    console.log("=====================================");
    console.log(`From: ${this.config.fromName} <${this.config.fromEmail}>`);
    console.log(`To: ${data.toName || ""} <${data.to}>`);
    console.log(`Subject: ${data.template.subject}`);
    console.log("-------------------------------------");
    console.log("TEXT VERSION:");
    console.log(data.template.text);
    console.log("-------------------------------------");
    console.log("HTML VERSION:");
    console.log(data.template.html.substring(0, 200) + "...");
    console.log("=====================================\n");
    return { success: true, messageId: `console-${Date.now()}` };
  }
  async sendSendGridEmail(data) {
    if (!this.config.apiKey) {
      throw new Error("SendGrid API key is required");
    }
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: data.to, name: data.toName }]
        }],
        from: { email: this.config.fromEmail, name: this.config.fromName },
        subject: data.template.subject,
        content: [
          { type: "text/plain", value: data.template.text },
          { type: "text/html", value: data.template.html }
        ]
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid error: ${error}`);
    }
    const messageId = response.headers.get("x-message-id");
    return { success: true, messageId: messageId || void 0 };
  }
  async sendResendEmail(data) {
    if (!this.config.apiKey) {
      throw new Error("Resend API key is required");
    }
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: [data.to],
        subject: data.template.subject,
        text: data.template.text,
        html: data.template.html
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend error: ${error}`);
    }
    const result = await response.json();
    return { success: true, messageId: result.id };
  }
  async sendMailgunEmail(data) {
    if (!this.config.apiKey) {
      throw new Error("Mailgun API key is required");
    }
    const domain = this.config.fromEmail.split("@")[1];
    const formData = new FormData();
    formData.append("from", `${this.config.fromName} <${this.config.fromEmail}>`);
    formData.append("to", data.to);
    formData.append("subject", data.template.subject);
    formData.append("text", data.template.text);
    formData.append("html", data.template.html);
    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`api:${this.config.apiKey}`).toString("base64")}`
      },
      body: formData
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mailgun error: ${error}`);
    }
    const result = await response.json();
    return { success: true, messageId: result.id };
  }
}
function createEmailService() {
  const provider = process.env.EMAIL_PROVIDER || "console";
  const config = {
    provider,
    apiKey: process.env.EMAIL_API_KEY,
    fromEmail: process.env.EMAIL_FROM || "noreply@roomio.com",
    fromName: process.env.EMAIL_FROM_NAME || "Roomio Team"
  };
  return new EmailService(config);
}

const emailService = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  EmailService: EmailService,
  createEmailService: createEmailService
}, Symbol.toStringTag, { value: 'Module' }));

function createInvitationEmail(data) {
  const subject = `Welcome to Roomio - Your Exclusive Invitation Awaits`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Roomio</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; text-align: center; }
        .logo { font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; }
        .tagline { opacity: 0.9; font-size: 1.1rem; }
        .content { padding: 2rem; }
        .welcome-text { font-size: 1.1rem; margin-bottom: 1.5rem; }
        .hotel-info { background: #f8fafc; padding: 1rem; border-radius: 8px; margin: 1.5rem 0; }
        .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 1.5rem 0; }
        .cta-button:hover { background: #2563eb; }
        .features { margin: 2rem 0; }
        .feature { display: flex; align-items: center; margin: 1rem 0; }
        .feature-icon { font-size: 1.5rem; margin-right: 1rem; }
        .expiry-notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 1rem; border-radius: 8px; margin: 1.5rem 0; }
        .footer { background: #1f2937; color: white; padding: 2rem; text-align: center; }
        .footer-links { margin: 1rem 0; }
        .footer-links a { color: #60a5fa; text-decoration: none; margin: 0 1rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">\u{1F3E8} Roomio</div>
          <div class="tagline">Premium Hotel Management Software</div>
        </div>
        
        <div class="content">
          <h1>Welcome to the Future of Hotel Management!</h1>
          
          <p class="welcome-text">
            Dear ${data.name},
          </p>
          
          <p>
            Congratulations! Your request for exclusive access to Roomio has been approved. 
            You're now part of an elite community of forward-thinking hotel owners who are 
            transforming their operations with our premium management platform.
          </p>
          
          <div class="hotel-info">
            <strong>Your Hotel:</strong> ${data.hotelName}<br>
            <strong>Invitation For:</strong> ${data.email}
          </div>
          
          <p>
            Roomio is trusted by hundreds of leading hotels worldwide to:
          </p>
          
          <div class="features">
            <div class="feature">
              <span class="feature-icon">\u26A1</span>
              <span>Reduce operational costs by up to 40%</span>
            </div>
            <div class="feature">
              <span class="feature-icon">\u{1F4C8}</span>
              <span>Increase revenue through dynamic pricing</span>
            </div>
            <div class="feature">
              <span class="feature-icon">\u{1F3AF}</span>
              <span>Automate housekeeping and room management</span>
            </div>
            <div class="feature">
              <span class="feature-icon">\u{1F4CA}</span>
              <span>Get real-time analytics and insights</span>
            </div>
          </div>
          
          <p style="text-align: center;">
            <a href="${data.invitationLink}" class="cta-button">
              Create Your Account \u2192
            </a>
          </p>
          
          <div class="expiry-notice">
            <strong>\u23F0 Important:</strong> This invitation expires on ${data.expiryDate}. 
            Please create your account soon to secure your access.
          </div>
          
          <p>
            Once you've created your account, you'll receive:
          </p>
          
          <ul>
            <li>Personalized onboarding session</li>
            <li>Dedicated success manager</li>
            <li>Priority customer support</li>
            <li>Access to exclusive features</li>
          </ul>
          
          <p>
            If you have any questions or need assistance, our team is here to help. 
            Simply reply to this email or contact our support team.
          </p>
          
          <p>
            Welcome to Roomio!<br>
            <strong>The Roomio Team</strong>
          </p>
        </div>
        
        <div class="footer">
          <p>\xA9 2024 Roomio. All rights reserved.</p>
          <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Support</a>
          </div>
          <p style="font-size: 0.9rem; opacity: 0.8;">
            This invitation was sent to ${data.email}. If you didn't request access to Roomio, 
            please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  const text = `
Welcome to Roomio - Your Exclusive Invitation

Dear ${data.name},

Congratulations! Your request for exclusive access to Roomio has been approved.

Hotel: ${data.hotelName}
Email: ${data.email}

Create your account: ${data.invitationLink}

This invitation expires on ${data.expiryDate}.

Roomio helps hotels:
- Reduce operational costs by up to 40%
- Increase revenue through dynamic pricing
- Automate housekeeping and room management
- Get real-time analytics and insights

Welcome to the future of hotel management!

The Roomio Team

---
\xA9 2024 Roomio. All rights reserved.
If you didn't request access, please ignore this email.
  `;
  return { subject, html, text };
}
function createAdminNotificationEmail(data) {
  const subject = `New Access Request - ${data.hotelName}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Access Request</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #1f2937; color: white; padding: 1.5rem; text-align: center; }
        .content { padding: 2rem; }
        .request-details { background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 0.5rem 0; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: 600; color: #374151; }
        .detail-value { color: #6b7280; }
        .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 1rem 0; }
        .urgent { background: #fef2f2; border: 1px solid #fecaca; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>\u{1F3E8} New Access Request</h1>
        </div>
        
        <div class="content">
          <p>A new hotel owner has requested access to Roomio:</p>
          
          <div class="request-details">
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">${data.name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${data.email}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Hotel:</span>
              <span class="detail-value">${data.hotelName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Room Count:</span>
              <span class="detail-value">${data.roomCount}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Request ID:</span>
              <span class="detail-value">${data.requestId}</span>
            </div>
          </div>
          
          <div class="urgent">
            <strong>\u23F0 Action Required:</strong> Please review this request and approve or reject it 
            within 24 hours to maintain our premium service standards.
          </div>
          
          <p style="text-align: center;">
            <a href="${data.adminPanelLink}" class="cta-button">
              Review Request \u2192
            </a>
          </p>
          
          <p>
            You can approve, reject, or add notes to this request in the admin panel.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  const text = `
New Access Request - ${data.hotelName}

A new hotel owner has requested access to Roomio:

Name: ${data.name}
Email: ${data.email}
Hotel: ${data.hotelName}
Room Count: ${data.roomCount}
Request ID: ${data.requestId}

Please review this request: ${data.adminPanelLink}

Action required within 24 hours.
  `;
  return { subject, html, text };
}

const emailTemplates = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  createAdminNotificationEmail: createAdminNotificationEmail,
  createInvitationEmail: createInvitationEmail
}, Symbol.toStringTag, { value: 'Module' }));

const approve_post = defineEventHandler(async (event) => {
  const superAdmin = await verifySuperAdmin(event);
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const params = getRouterParams(event);
  const id = params.id;
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Request ID is required"
    });
  }
  const { data: request, error: fetchError } = await supabase.from("demo_requests").select("*").eq("id", id).maybeSingle();
  if (fetchError || !request) {
    throw createError({
      statusCode: 404,
      statusMessage: (fetchError == null ? void 0 : fetchError.message) || "Request not found"
    });
  }
  if (request.status === "rejected") {
    throw createError({
      statusCode: 400,
      statusMessage: "Cannot approve a rejected request"
    });
  }
  const { data: existingTenant } = await supabase.from("tenants").select("id").eq("demo_request_id", request.id).maybeSingle();
  const trialEndDate = /* @__PURE__ */ new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 14);
  const tenantPayload = {
    name: request.hotel_name,
    primary_contact_name: request.name,
    primary_contact_email: request.email,
    status: "trial",
    subscription_plan: "trial",
    demo_request_id: request.id,
    date_joined: (/* @__PURE__ */ new Date()).toISOString(),
    trial_end_date: trialEndDate.toISOString()
  };
  if (existingTenant) {
    await supabase.from("tenants").update(tenantPayload).eq("id", existingTenant.id);
  } else {
    await supabase.from("tenants").insert(tenantPayload);
  }
  const expiryDate = /* @__PURE__ */ new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);
  const { error: updateError } = await supabase.from("demo_requests").update({
    status: "approved",
    invitation_sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    invitation_expires_at: expiryDate.toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    notes: request.notes
  }).eq("id", request.id);
  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: updateError.message
    });
  }
  const baseUrl = process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const invitationLink = `${baseUrl}/signup?token=${request.invitation_token}`;
  try {
    const emailService = createEmailService();
    const invitationTemplate = createInvitationEmail({
      name: request.name,
      email: request.email,
      hotelName: request.hotel_name,
      invitationLink,
      expiryDate: expiryDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    });
    await emailService.sendEmail({
      to: request.email,
      toName: request.name,
      template: invitationTemplate
    });
  } catch (emailError) {
    console.error("Failed to send invitation email (super admin approve):", emailError);
  }
  await supabase.from("activity_logs").insert({
    user_id: superAdmin.id,
    action: "access_request_approved",
    entity_type: "tenant",
    entity_id: request.id,
    metadata: {
      hotel_name: request.hotel_name,
      email: request.email
    }
  });
  return {
    success: true,
    message: "Request approved and invitation sent",
    invitationLink,
    expiresAt: expiryDate.toISOString()
  };
});

const approve_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: approve_post
}, Symbol.toStringTag, { value: 'Module' }));

const reject_post = defineEventHandler(async (event) => {
  const superAdmin = await verifySuperAdmin(event);
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const params = getRouterParams(event);
  const id = params.id;
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Request ID is required"
    });
  }
  const body = await readBody(event);
  const { reason } = body || {};
  const { data: request, error: fetchError } = await supabase.from("demo_requests").select("*").eq("id", id).maybeSingle();
  if (fetchError || !request) {
    throw createError({
      statusCode: 404,
      statusMessage: (fetchError == null ? void 0 : fetchError.message) || "Request not found"
    });
  }
  const { error: updateError } = await supabase.from("demo_requests").update({
    status: "rejected",
    notes: reason || request.notes,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", request.id);
  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: updateError.message
    });
  }
  await supabase.from("activity_logs").insert({
    user_id: superAdmin.id,
    action: "access_request_rejected",
    entity_type: "system",
    entity_id: request.id,
    metadata: {
      hotel_name: request.hotel_name,
      email: request.email,
      reason: reason || null
    }
  });
  return {
    success: true,
    message: "Request rejected"
  };
});

const reject_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: reject_post
}, Symbol.toStringTag, { value: 'Module' }));

const activity_get$2 = defineEventHandler(async (event) => {
  await verifySuperAdmin(event);
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const query = getQuery$1(event);
  const { limit = 50 } = query;
  const max = Math.min(parseInt(String(limit)) || 50, 200);
  const { data, error } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(max);
  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    });
  }
  const events = (data || []).map((log) => {
    var _a;
    let type = log.action;
    let title = log.action;
    if (log.entity_type === "tenant" && log.action === "tenant_status_updated") {
      type = "tenant_status";
      title = "Tenant status updated";
    } else if (log.entity_type === "tenant" && log.action === "tenant_plan_updated") {
      type = "tenant_plan";
      title = "Tenant plan updated";
    } else if (log.entity_type === "tenant" && log.action === "access_request_approved") {
      type = "tenant_created";
      title = "New tenant created";
    } else if (log.entity_type === "system" && ((_a = log.action) == null ? void 0 : _a.toLowerCase().includes("error"))) {
      type = "system_error";
      title = "System error";
    }
    return {
      id: log.id,
      type,
      title,
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      metadata: log.metadata,
      created_at: log.created_at
    };
  });
  return {
    success: true,
    data: {
      events
    }
  };
});

const activity_get$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: activity_get$2
}, Symbol.toStringTag, { value: 'Module' }));

const billingMetrics_get = defineEventHandler(async (event) => {
  await verifySuperAdmin(event);
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const now = /* @__PURE__ */ new Date();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
  const cutoffIso = cutoff.toISOString();
  const { count: billingHoldCount, error: tenantsError } = await supabase.from("tenants").select("id", { count: "exact", head: true }).eq("status", "billing_hold");
  if (tenantsError) {
    throw createError({
      statusCode: 500,
      statusMessage: tenantsError.message
    });
  }
  const { data: auditEvents, error: auditError } = await supabase.from("platform_audit_events").select("event_type, created_at").gte("created_at", cutoffIso).in("event_type", ["PAYMENT_SUCCESS", "PAYMENT_FAILURE"]);
  if (auditError) {
    throw createError({
      statusCode: 500,
      statusMessage: auditError.message
    });
  }
  const successes = (auditEvents || []).filter((e) => e.event_type === "PAYMENT_SUCCESS").length;
  const failures = (auditEvents || []).filter((e) => e.event_type === "PAYMENT_FAILURE").length;
  const total = successes + failures;
  const successRate = total > 0 ? successes / total * 100 : 0;
  return {
    success: true,
    data: {
      billing_hold_count: billingHoldCount || 0,
      payment_stats_24h: {
        successes,
        failures,
        total,
        success_rate: successRate
      }
    }
  };
});

const billingMetrics_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: billingMetrics_get
}, Symbol.toStringTag, { value: 'Module' }));

const dashboard_get = defineEventHandler(async (event) => {
  await verifySuperAdmin(event);
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const now = /* @__PURE__ */ new Date();
  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1e3);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1e3);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
  const [
    { data: tenantRows, error: tenantsError },
    { count: pendingRequestsCount },
    { count: activeUsersCount },
    { count: errorCountLastHour },
    { count: totalEventsLast24h },
    { count: errorEventsLast24h },
    { count: totalRooms },
    { count: totalInventoryItems }
  ] = await Promise.all([
    supabase.from("tenants").select("id, status, subscription_plan, date_joined, updated_at"),
    supabase.from("demo_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("activity_logs").select("id", { count: "exact", head: true }).gte("created_at", fifteenMinutesAgo.toISOString()),
    supabase.from("activity_logs").select("id", { count: "exact", head: true }).gte("created_at", oneHourAgo.toISOString()).or("entity_type.eq.system,action.ilike.%error%"),
    supabase.from("activity_logs").select("id", { count: "exact", head: true }).gte("created_at", twentyFourHoursAgo.toISOString()),
    supabase.from("activity_logs").select("id", { count: "exact", head: true }).gte("created_at", twentyFourHoursAgo.toISOString()).or("entity_type.eq.system,action.ilike.%error%"),
    supabase.from("rooms").select("*", { count: "exact", head: true }),
    supabase.from("inventory_items").select("*", { count: "exact", head: true })
  ]);
  if (tenantsError) {
    throw createError({
      statusCode: 400,
      statusMessage: tenantsError.message
    });
  }
  const tenants = tenantRows || [];
  const totalTenants = tenants.length;
  const newTenantsLast30Days = tenants.filter((tenant) => {
    if (!tenant.date_joined) return false;
    const joinedAt = new Date(tenant.date_joined);
    return joinedAt >= thirtyDaysAgo;
  }).length;
  const subscriptionBreakdown = {
    trial: 0,
    basic: 0,
    premium: 0,
    enterprise: 0,
    other: 0
  };
  const PLAN_PRICES = {
    trial: 0,
    basic: 79,
    premium: 149,
    enterprise: 299
  };
  let mrr = 0;
  let churnedLast30Days = 0;
  let activeAndChurnedBaseline = 0;
  tenants.forEach((tenant) => {
    var _a;
    const plan = (tenant.subscription_plan || "").toLowerCase();
    const status = (tenant.status || "").toLowerCase();
    if (plan in subscriptionBreakdown) {
      subscriptionBreakdown[plan] += 1;
    } else {
      subscriptionBreakdown.other += 1;
    }
    if (status === "active") {
      const price = (_a = PLAN_PRICES[plan]) != null ? _a : 0;
      mrr += price;
      activeAndChurnedBaseline += 1;
    }
    const updatedAt = tenant.updated_at ? new Date(tenant.updated_at) : null;
    if (status === "suspended" && updatedAt && updatedAt >= thirtyDaysAgo) {
      churnedLast30Days += 1;
      activeAndChurnedBaseline += 1;
    }
  });
  const churnRateLast30Days = activeAndChurnedBaseline > 0 ? churnedLast30Days / activeAndChurnedBaseline : 0;
  const errorThreshold = 5;
  const systemHealthStatus = (errorCountLastHour || 0) >= errorThreshold ? "red" : "green";
  const totalEvents = totalEventsLast24h || 0;
  const errorEvents = errorEventsLast24h || 0;
  const errorRateLast24h = totalEvents > 0 ? errorEvents / totalEvents : 0;
  return {
    success: true,
    data: {
      totalTenants,
      pendingRequests: pendingRequestsCount || 0,
      activeUsers: activeUsersCount || 0,
      systemHealth: {
        status: systemHealthStatus,
        errorCountLastHour: errorCountLastHour || 0,
        errorRateLast24h
      },
      newTenantsLast30Days,
      totalRooms: totalRooms || 0,
      totalInventoryItems: totalInventoryItems || 0,
      mrr,
      subscriptionBreakdown,
      churnRateLast30Days
    }
  };
});

const dashboard_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: dashboard_get
}, Symbol.toStringTag, { value: 'Module' }));

const tenantActivity_get = defineEventHandler(async (event) => {
  await verifySuperAdmin(event);
  const query = getQuery$1(event);
  const id = query.id;
  const tenantId = id && String(id);
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant ID is required"
    });
  }
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const { limit = 50 } = query;
  const max = Math.min(parseInt(String(limit)) || 50, 200);
  const { data, error } = await supabase.from("activity_logs").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(max);
  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    });
  }
  const events = (data || []).map((log) => {
    var _a;
    let type = log.action;
    let title = log.action;
    if (log.entity_type === "tenant" && log.action === "tenant_status_updated") {
      type = "tenant_status";
      title = "Tenant status updated";
    } else if (log.entity_type === "tenant" && log.action === "tenant_plan_updated") {
      type = "tenant_plan";
      title = "Tenant plan updated";
    } else if (log.entity_type === "tenant" && log.action === "access_request_approved") {
      type = "tenant_created";
      title = "New tenant created";
    } else if (log.entity_type === "system" && ((_a = log.action) == null ? void 0 : _a.toLowerCase().includes("error"))) {
      type = "system_error";
      title = "System error";
    }
    return {
      id: log.id,
      type,
      title,
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      metadata: log.metadata,
      created_at: log.created_at
    };
  });
  return {
    success: true,
    data: {
      events
    }
  };
});

const tenantActivity_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: tenantActivity_get
}, Symbol.toStringTag, { value: 'Module' }));

const tenantBilling_get = defineEventHandler(async (event) => {
  await verifySuperAdmin(event);
  const query = getQuery$1(event);
  const id = query.id;
  const tenantId = id && String(id);
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant ID is required"
    });
  }
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const { data: tenant, error: tenantError } = await supabase.from("tenants").select("id, name, status, trial_end_date, subscription_end_date, paystack_customer_code, current_plan_id").eq("id", tenantId).maybeSingle();
  if (tenantError || !tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: (tenantError == null ? void 0 : tenantError.message) || "Tenant not found"
    });
  }
  const { data: plan } = await supabase.from("plans").select("*").eq("id", tenant.current_plan_id).maybeSingle();
  const { data: paymentEvents } = await supabase.from("platform_audit_events").select("id, event_type, details, created_at").eq("tenant_id", tenantId).in("event_type", ["PAYMENT_SUCCESS", "PAYMENT_FAILURE"]).order("created_at", { ascending: false }).limit(10);
  const lastPayment = paymentEvents && paymentEvents.length > 0 ? paymentEvents[0] : null;
  let subscriptionStartDate = null;
  if (tenant.subscription_end_date) {
    const end = new Date(tenant.subscription_end_date);
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1e3);
    subscriptionStartDate = start.toISOString();
  }
  return {
    success: true,
    data: {
      tenant_id: tenant.id,
      status: tenant.status,
      trial_end_date: tenant.trial_end_date,
      subscription_start_date: subscriptionStartDate,
      subscription_end_date: tenant.subscription_end_date,
      paystack_customer_code: tenant.paystack_customer_code,
      current_plan: plan || null,
      last_payment: lastPayment,
      payment_events: paymentEvents || []
    }
  };
});

const tenantBilling_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: tenantBilling_get
}, Symbol.toStringTag, { value: 'Module' }));

const tenantDetail_get = defineEventHandler(async (event) => {
  await verifySuperAdmin(event);
  const query = getQuery$1(event);
  const id = query.id;
  const tenantId = id && String(id);
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant ID is required"
    });
  }
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const { data, error } = await supabase.from("tenants").select("*").eq("id", tenantId).maybeSingle();
  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    });
  }
  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: "Tenant not found"
    });
  }
  return {
    success: true,
    data
  };
});

const tenantDetail_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: tenantDetail_get
}, Symbol.toStringTag, { value: 'Module' }));

const tenantInviteLink_get = defineEventHandler(async (event) => {
  await verifySuperAdmin(event);
  const query = getQuery$1(event);
  const tenantId = query.id;
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant ID is required"
    });
  }
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const { data: tenant, error: tenantError } = await supabase.from("tenants").select("id, demo_request_id").eq("id", tenantId).maybeSingle();
  if (tenantError || !tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: (tenantError == null ? void 0 : tenantError.message) || "Tenant not found"
    });
  }
  if (!tenant.demo_request_id) {
    throw createError({
      statusCode: 400,
      statusMessage: "No demo request associated with this tenant"
    });
  }
  const { data: request, error: requestError } = await supabase.from("demo_requests").select("id, invitation_token, status, invitation_expires_at, email, name, hotel_name").eq("id", tenant.demo_request_id).maybeSingle();
  if (requestError || !request) {
    throw createError({
      statusCode: 404,
      statusMessage: (requestError == null ? void 0 : requestError.message) || "Access request not found for this tenant"
    });
  }
  if (!request.invitation_token) {
    throw createError({
      statusCode: 400,
      statusMessage: "No invitation token generated for this request yet"
    });
  }
  const baseUrl = process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const invitationLink = `${baseUrl}/signup?token=${request.invitation_token}`;
  const now = /* @__PURE__ */ new Date();
  const expiresAt = request.invitation_expires_at ? new Date(request.invitation_expires_at).toISOString() : null;
  const isExpired = expiresAt ? new Date(expiresAt) < now : false;
  return {
    success: true,
    data: {
      invitationLink,
      status: request.status,
      expiresAt,
      expired: isExpired,
      email: request.email,
      name: request.name,
      hotelName: request.hotel_name
    }
  };
});

const tenantInviteLink_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: tenantInviteLink_get
}, Symbol.toStringTag, { value: 'Module' }));

const tenantMetrics_get = defineEventHandler(async (event) => {
  await verifySuperAdmin(event);
  const query = getQuery$1(event);
  const id = query.id;
  const tenantId = id && String(id);
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant ID is required"
    });
  }
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const now = /* @__PURE__ */ new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
  const thirtyDaysAgoDate = thirtyDaysAgo.toISOString().slice(0, 10);
  const [
    { count: totalRooms },
    { count: activeRooms },
    { data: reservationsRows, error: reservationsError },
    { data: invoicesRows, error: invoicesError },
    { count: fbOrdersLast30Days },
    { count: staffCount }
  ] = await Promise.all([
    supabase.from("rooms").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
    supabase.from("rooms").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).in("status", ["available", "occupied", "reserved"]),
    supabase.from("reservations").select("id, total_amount, check_in_date, check_out_date, status").eq("tenant_id", tenantId).gte("check_in_date", thirtyDaysAgoDate),
    supabase.from("invoices").select("total_amount, issue_date").eq("tenant_id", tenantId).gte("issue_date", thirtyDaysAgoDate),
    supabase.from("restaurant_orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).gte("order_time", thirtyDaysAgo.toISOString()),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId)
  ]);
  if (reservationsError) {
    throw createError({
      statusCode: 400,
      statusMessage: reservationsError.message
    });
  }
  if (invoicesError) {
    throw createError({
      statusCode: 400,
      statusMessage: invoicesError.message
    });
  }
  const reservations = reservationsRows || [];
  const invoices = invoicesRows || [];
  const reservationsLast30Days = reservations.length;
  const revenueLast30Days = invoices.reduce((sum, invoice) => {
    const amount = Number(invoice.total_amount) || 0;
    return sum + amount;
  }, 0);
  let occupiedNights = 0;
  const nowDateOnly = new Date(now.toISOString().slice(0, 10));
  reservations.forEach((reservation) => {
    if (!reservation.check_in_date || !reservation.check_out_date) return;
    const checkIn = new Date(reservation.check_in_date);
    const checkOut = new Date(reservation.check_out_date);
    const rangeStart = checkIn < thirtyDaysAgo ? thirtyDaysAgo : checkIn;
    const rangeEnd = checkOut > nowDateOnly ? nowDateOnly : checkOut;
    const diffMs = rangeEnd.getTime() - rangeStart.getTime();
    const nights = Math.max(0, Math.round(diffMs / (1e3 * 60 * 60 * 24)));
    occupiedNights += nights;
  });
  const totalRoomNights = (totalRooms || 0) * 30;
  const occupancyRate30Days = totalRoomNights > 0 ? occupiedNights / totalRoomNights : 0;
  const reservationsRevenue = reservations.reduce((sum, reservation) => {
    const amount = Number(reservation.total_amount) || 0;
    return sum + amount;
  }, 0);
  const adr30Days = occupiedNights > 0 ? reservationsRevenue / occupiedNights : 0;
  return {
    success: true,
    data: {
      rooms: {
        totalRooms: totalRooms || 0,
        activeRooms: activeRooms || 0,
        reservationsLast30Days,
        occupancyRate30Days,
        adr30Days
      },
      revenue: {
        revenueLast30Days
      },
      fb: {
        fbOrdersLast30Days: fbOrdersLast30Days || 0
      },
      staff: {
        staffCount: staffCount || 0
      }
    }
  };
});

const tenantMetrics_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: tenantMetrics_get
}, Symbol.toStringTag, { value: 'Module' }));

const tenants_get = defineEventHandler(async (event) => {
  await verifySuperAdmin(event);
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const query = getQuery$1(event);
  const { status, search, page = 1, limit = 25 } = query;
  const pageNumber = parseInt(String(page)) || 1;
  const pageSize = Math.min(parseInt(String(limit)) || 25, 100);
  const from = (pageNumber - 1) * pageSize;
  const to = from + pageSize - 1;
  let builder = supabase.from("tenants").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
  if (status && typeof status === "string") {
    builder = builder.eq("status", status);
  }
  if (search && typeof search === "string") {
    builder = builder.or(
      `name.ilike.%${search}%,primary_contact_email.ilike.%${search}%,primary_contact_name.ilike.%${search}%`
    );
  }
  const { data, error, count } = await builder;
  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    });
  }
  return {
    success: true,
    data: {
      tenants: data || [],
      total: count || 0,
      page: pageNumber,
      limit: pageSize
    }
  };
});

const tenants_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: tenants_get
}, Symbol.toStringTag, { value: 'Module' }));

const _id__activity_get = defineEventHandler(async (event) => {
  await verifySuperAdmin(event);
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const params = getRouterParams(event);
  const id = params.id;
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant ID is required"
    });
  }
  const query = getQuery$1(event);
  const { limit = 50 } = query;
  const max = Math.min(parseInt(String(limit)) || 50, 200);
  const { data, error } = await supabase.from("activity_logs").select("*").eq("tenant_id", id).order("created_at", { ascending: false }).limit(max);
  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    });
  }
  const events = (data || []).map((log) => {
    var _a;
    let type = log.action;
    let title = log.action;
    if (log.entity_type === "tenant" && log.action === "tenant_status_updated") {
      type = "tenant_status";
      title = "Tenant status updated";
    } else if (log.entity_type === "tenant" && log.action === "tenant_plan_updated") {
      type = "tenant_plan";
      title = "Tenant plan updated";
    } else if (log.entity_type === "tenant" && log.action === "access_request_approved") {
      type = "tenant_created";
      title = "New tenant created";
    } else if (log.entity_type === "system" && ((_a = log.action) == null ? void 0 : _a.toLowerCase().includes("error"))) {
      type = "system_error";
      title = "System error";
    }
    return {
      id: log.id,
      type,
      title,
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      metadata: log.metadata,
      created_at: log.created_at
    };
  });
  return {
    success: true,
    data: {
      events
    }
  };
});

const _id__activity_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__activity_get
}, Symbol.toStringTag, { value: 'Module' }));

const _id__get = defineEventHandler(async (event) => {
  await verifySuperAdmin(event);
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const params = getRouterParams(event);
  const tenantId = params.id;
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant ID is required"
    });
  }
  const { data, error } = await supabase.from("tenants").select("*").eq("id", tenantId).maybeSingle();
  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    });
  }
  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: "Tenant not found"
    });
  }
  return {
    success: true,
    data
  };
});

const _id__get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__get
}, Symbol.toStringTag, { value: 'Module' }));

const _id__metrics_get = defineEventHandler(async (event) => {
  await verifySuperAdmin(event);
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const params = getRouterParams(event);
  const id = params.id;
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant ID is required"
    });
  }
  const now = /* @__PURE__ */ new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
  const thirtyDaysAgoDate = thirtyDaysAgo.toISOString().slice(0, 10);
  const [
    { count: totalRooms },
    { count: activeRooms },
    { data: reservationsRows, error: reservationsError },
    { data: invoicesRows, error: invoicesError },
    { count: fbOrdersLast30Days },
    { count: staffCount }
  ] = await Promise.all([
    supabase.from("rooms").select("*", { count: "exact", head: true }).eq("tenant_id", id),
    supabase.from("rooms").select("*", { count: "exact", head: true }).eq("tenant_id", id).in("status", ["available", "occupied", "reserved"]),
    supabase.from("reservations").select("id, total_amount, check_in_date, check_out_date, status").eq("tenant_id", id).gte("check_in_date", thirtyDaysAgoDate),
    supabase.from("invoices").select("total_amount, issue_date").eq("tenant_id", id).gte("issue_date", thirtyDaysAgoDate),
    supabase.from("restaurant_orders").select("*", { count: "exact", head: true }).eq("tenant_id", id).gte("order_time", thirtyDaysAgo.toISOString()),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("tenant_id", id)
  ]);
  if (reservationsError) {
    throw createError({
      statusCode: 400,
      statusMessage: reservationsError.message
    });
  }
  if (invoicesError) {
    throw createError({
      statusCode: 400,
      statusMessage: invoicesError.message
    });
  }
  const reservations = reservationsRows || [];
  const invoices = invoicesRows || [];
  const reservationsLast30Days = reservations.length;
  const revenueLast30Days = invoices.reduce((sum, invoice) => {
    const amount = Number(invoice.total_amount) || 0;
    return sum + amount;
  }, 0);
  let occupiedNights = 0;
  const nowDateOnly = new Date(now.toISOString().slice(0, 10));
  reservations.forEach((reservation) => {
    if (!reservation.check_in_date || !reservation.check_out_date) return;
    const checkIn = new Date(reservation.check_in_date);
    const checkOut = new Date(reservation.check_out_date);
    const rangeStart = checkIn < thirtyDaysAgo ? thirtyDaysAgo : checkIn;
    const rangeEnd = checkOut > nowDateOnly ? nowDateOnly : checkOut;
    const diffMs = rangeEnd.getTime() - rangeStart.getTime();
    const nights = Math.max(0, Math.round(diffMs / (1e3 * 60 * 60 * 24)));
    occupiedNights += nights;
  });
  const totalRoomNights = (totalRooms || 0) * 30;
  const occupancyRate30Days = totalRoomNights > 0 ? occupiedNights / totalRoomNights : 0;
  const reservationsRevenue = reservations.reduce((sum, reservation) => {
    const amount = Number(reservation.total_amount) || 0;
    return sum + amount;
  }, 0);
  const adr30Days = occupiedNights > 0 ? reservationsRevenue / occupiedNights : 0;
  return {
    success: true,
    data: {
      rooms: {
        totalRooms: totalRooms || 0,
        activeRooms: activeRooms || 0,
        reservationsLast30Days,
        occupancyRate30Days,
        adr30Days
      },
      revenue: {
        revenueLast30Days
      },
      fb: {
        fbOrdersLast30Days: fbOrdersLast30Days || 0
      },
      staff: {
        staffCount: staffCount || 0
      }
    }
  };
});

const _id__metrics_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__metrics_get
}, Symbol.toStringTag, { value: 'Module' }));

const _id__patch = defineEventHandler(async (event) => {
  const superAdmin = await verifySuperAdmin(event);
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const params = getRouterParams(event);
  const id = params.id;
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant ID is required"
    });
  }
  const body = await readBody(event);
  const { action, status, subscription_plan, notes } = body || {};
  if (!action) {
    throw createError({
      statusCode: 400,
      statusMessage: "Action is required"
    });
  }
  const updates = {};
  if (action === "update_status") {
    if (!status) {
      throw createError({
        statusCode: 400,
        statusMessage: "Status is required for update_status action"
      });
    }
    updates.status = status;
  }
  if (action === "update_plan") {
    if (!subscription_plan) {
      throw createError({
        statusCode: 400,
        statusMessage: "subscription_plan is required for update_plan action"
      });
    }
    updates.subscription_plan = subscription_plan;
  }
  if (notes !== void 0) {
    updates.notes = notes;
  }
  if (Object.keys(updates).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No updates to apply"
    });
  }
  updates.updated_at = (/* @__PURE__ */ new Date()).toISOString();
  const { data, error } = await supabase.from("tenants").update(updates).eq("id", id).select("*").maybeSingle();
  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    });
  }
  await supabase.from("activity_logs").insert({
    user_id: superAdmin.id,
    action: action === "update_status" ? "tenant_status_updated" : "tenant_plan_updated",
    entity_type: "tenant",
    entity_id: id,
    tenant_id: id,
    metadata: updates
  });
  return {
    success: true,
    data
  };
});

const _id__patch$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__patch
}, Symbol.toStringTag, { value: 'Module' }));

const activity_get = defineEventHandler(async (event) => {
  var _a;
  await verifySuperAdmin(event);
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const tenantId = (_a = event.context.params) == null ? void 0 : _a.id;
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant ID is required"
    });
  }
  const query = getQuery$1(event);
  const { limit = 50 } = query;
  const max = Math.min(parseInt(String(limit)) || 50, 200);
  const { data, error } = await supabase.from("activity_logs").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(max);
  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    });
  }
  const events = (data || []).map((log) => {
    var _a2;
    let type = log.action;
    let title = log.action;
    if (log.entity_type === "tenant" && log.action === "tenant_status_updated") {
      type = "tenant_status";
      title = "Tenant status updated";
    } else if (log.entity_type === "tenant" && log.action === "tenant_plan_updated") {
      type = "tenant_plan";
      title = "Tenant plan updated";
    } else if (log.entity_type === "tenant" && log.action === "access_request_approved") {
      type = "tenant_created";
      title = "New tenant created";
    } else if (log.entity_type === "system" && ((_a2 = log.action) == null ? void 0 : _a2.toLowerCase().includes("error"))) {
      type = "system_error";
      title = "System error";
    }
    return {
      id: log.id,
      type,
      title,
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      metadata: log.metadata,
      created_at: log.created_at
    };
  });
  return {
    success: true,
    data: {
      events
    }
  };
});

const activity_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: activity_get
}, Symbol.toStringTag, { value: 'Module' }));

const billing_get = defineEventHandler(async (event) => {
  var _a;
  await verifySuperAdmin(event);
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const tenantId = (_a = event.context.params) == null ? void 0 : _a.id;
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant id is required"
    });
  }
  const { data: tenant, error: tenantError } = await supabase.from("tenants").select("id, name, status, trial_end_date, subscription_end_date, paystack_customer_code, current_plan_id").eq("id", tenantId).maybeSingle();
  if (tenantError || !tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: (tenantError == null ? void 0 : tenantError.message) || "Tenant not found"
    });
  }
  const { data: plan } = await supabase.from("plans").select("*").eq("id", tenant.current_plan_id).maybeSingle();
  const { data: paymentEvents } = await supabase.from("platform_audit_events").select("id, event_type, details, created_at").eq("tenant_id", tenantId).in("event_type", ["PAYMENT_SUCCESS", "PAYMENT_FAILURE"]).order("created_at", { ascending: false }).limit(10);
  const lastPayment = paymentEvents && paymentEvents.length > 0 ? paymentEvents[0] : null;
  let subscriptionStartDate = null;
  if (tenant.subscription_end_date) {
    const end = new Date(tenant.subscription_end_date);
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1e3);
    subscriptionStartDate = start.toISOString();
  }
  return {
    success: true,
    data: {
      tenant_id: tenant.id,
      status: tenant.status,
      trial_end_date: tenant.trial_end_date,
      subscription_start_date: subscriptionStartDate,
      subscription_end_date: tenant.subscription_end_date,
      paystack_customer_code: tenant.paystack_customer_code,
      current_plan: plan || null,
      last_payment: lastPayment,
      payment_events: paymentEvents || []
    }
  };
});

const billing_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: billing_get
}, Symbol.toStringTag, { value: 'Module' }));

const metrics_get = defineEventHandler(async (event) => {
  var _a;
  await verifySuperAdmin(event);
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  const tenantId = (_a = event.context.params) == null ? void 0 : _a.id;
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant ID is required"
    });
  }
  const now = /* @__PURE__ */ new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
  const thirtyDaysAgoDate = thirtyDaysAgo.toISOString().slice(0, 10);
  const [
    { count: totalRooms },
    { count: activeRooms },
    { data: reservationsRows, error: reservationsError },
    { data: invoicesRows, error: invoicesError },
    { count: fbOrdersLast30Days },
    { count: staffCount }
  ] = await Promise.all([
    supabase.from("rooms").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
    supabase.from("rooms").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).in("status", ["available", "occupied", "reserved"]),
    supabase.from("reservations").select("id, total_amount, check_in_date, check_out_date, status").eq("tenant_id", tenantId).gte("check_in_date", thirtyDaysAgoDate),
    supabase.from("invoices").select("total_amount, issue_date").eq("tenant_id", tenantId).gte("issue_date", thirtyDaysAgoDate),
    supabase.from("restaurant_orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).gte("order_time", thirtyDaysAgo.toISOString()),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId)
  ]);
  if (reservationsError) {
    throw createError({
      statusCode: 400,
      statusMessage: reservationsError.message
    });
  }
  if (invoicesError) {
    throw createError({
      statusCode: 400,
      statusMessage: invoicesError.message
    });
  }
  const reservations = reservationsRows || [];
  const invoices = invoicesRows || [];
  const reservationsLast30Days = reservations.length;
  const revenueLast30Days = invoices.reduce((sum, invoice) => {
    const amount = Number(invoice.total_amount) || 0;
    return sum + amount;
  }, 0);
  let occupiedNights = 0;
  const nowDateOnly = new Date(now.toISOString().slice(0, 10));
  reservations.forEach((reservation) => {
    if (!reservation.check_in_date || !reservation.check_out_date) return;
    const checkIn = new Date(reservation.check_in_date);
    const checkOut = new Date(reservation.check_out_date);
    const rangeStart = checkIn < thirtyDaysAgo ? thirtyDaysAgo : checkIn;
    const rangeEnd = checkOut > nowDateOnly ? nowDateOnly : checkOut;
    const diffMs = rangeEnd.getTime() - rangeStart.getTime();
    const nights = Math.max(0, Math.round(diffMs / (1e3 * 60 * 60 * 24)));
    occupiedNights += nights;
  });
  const totalRoomNights = (totalRooms || 0) * 30;
  const occupancyRate30Days = totalRoomNights > 0 ? occupiedNights / totalRoomNights : 0;
  const reservationsRevenue = reservations.reduce((sum, reservation) => {
    const amount = Number(reservation.total_amount) || 0;
    return sum + amount;
  }, 0);
  const adr30Days = occupiedNights > 0 ? reservationsRevenue / occupiedNights : 0;
  return {
    success: true,
    data: {
      rooms: {
        totalRooms: totalRooms || 0,
        activeRooms: activeRooms || 0,
        reservationsLast30Days,
        occupancyRate30Days,
        adr30Days
      },
      revenue: {
        revenueLast30Days
      },
      fb: {
        fbOrdersLast30Days: fbOrdersLast30Days || 0
      },
      staff: {
        staffCount: staffCount || 0
      }
    }
  };
});

const metrics_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: metrics_get
}, Symbol.toStringTag, { value: 'Module' }));

const vendors_get = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    const { data, error } = await supabase.from("vendors").select("*").order("vendor_name");
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      });
    }
    return {
      success: true,
      data
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : "An unexpected error occurred"
    });
  }
});

const vendors_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: vendors_get
}, Symbol.toStringTag, { value: 'Module' }));

const paystack_post = defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event);
  if (!rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: "Empty webhook body"
    });
  }
  const config = useRuntimeConfig();
  const signature = event.node.req.headers["x-paystack-signature"] || event.node.req.headers["X-Paystack-Signature"];
  if (!signature || Array.isArray(signature)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing Paystack signature"
    });
  }
  if (!config.paystackWebhookSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing Paystack webhook secret configuration"
    });
  }
  const hash = createHmac("sha512", config.paystackWebhookSecret).update(rawBody).digest("hex");
  if (hash !== signature) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid webhook signature"
    });
  }
  let payload;
  try {
    payload = JSON.parse(rawBody.toString());
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid webhook JSON"
    });
  }
  const eventName = payload.event;
  const data = payload.data || {};
  if (eventName === "charge.success" && data.status === "success") {
    await handlePaystackChargeSuccess(data);
  } else if (eventName === "charge.failed") {
    await handlePaystackChargeFailure(data);
  }
  return { success: true };
});

const paystack_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: paystack_post
}, Symbol.toStringTag, { value: 'Module' }));

function renderPayloadResponse(ssrContext) {
  return {
    body: stringify(splitPayload(ssrContext).payload, ssrContext._payloadReducers) ,
    statusCode: getResponseStatus(ssrContext.event),
    statusMessage: getResponseStatusText(ssrContext.event),
    headers: {
      "content-type": "application/json;charset=utf-8" ,
      "x-powered-by": "Nuxt"
    }
  };
}
function renderPayloadJsonScript(opts) {
  const contents = opts.data ? stringify(opts.data, opts.ssrContext._payloadReducers) : "";
  const payload = {
    "type": "application/json",
    "innerHTML": contents,
    "data-nuxt-data": appId,
    "data-ssr": !(opts.ssrContext.noSSR)
  };
  {
    payload.id = "__NUXT_DATA__";
  }
  if (opts.src) {
    payload["data-src"] = opts.src;
  }
  const config = uneval(opts.ssrContext.config);
  return [
    payload,
    {
      innerHTML: `window.__NUXT__={};window.__NUXT__.config=${config}`
    }
  ];
}
function splitPayload(ssrContext) {
  const { data, prerenderedAt, ...initial } = ssrContext.payload;
  return {
    initial: { ...initial, prerenderedAt },
    payload: { data, prerenderedAt }
  };
}

const renderSSRHeadOptions = {"omitLineBreaks":false};

globalThis.__buildAssetsURL = buildAssetsURL;
globalThis.__publicAssetsURL = publicAssetsURL;
const HAS_APP_TELEPORTS = !!(appTeleportAttrs.id);
const APP_TELEPORT_OPEN_TAG = HAS_APP_TELEPORTS ? `<${appTeleportTag}${propsToString(appTeleportAttrs)}>` : "";
const APP_TELEPORT_CLOSE_TAG = HAS_APP_TELEPORTS ? `</${appTeleportTag}>` : "";
const PAYLOAD_URL_RE = /^[^?]*\/_payload.json(?:\?.*)?$/ ;
const renderer = defineRenderHandler(async (event) => {
  const nitroApp = useNitroApp();
  const ssrError = event.path.startsWith("/__nuxt_error") ? getQuery$1(event) : null;
  if (ssrError && !("__unenv__" in event.node.req)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Page Not Found: /__nuxt_error"
    });
  }
  const ssrContext = createSSRContext(event);
  const headEntryOptions = { mode: "server" };
  ssrContext.head.push(appHead, headEntryOptions);
  if (ssrError) {
    ssrError.statusCode &&= Number.parseInt(ssrError.statusCode);
    setSSRError(ssrContext, ssrError);
  }
  const isRenderingPayload = PAYLOAD_URL_RE.test(ssrContext.url);
  if (isRenderingPayload) {
    const url = ssrContext.url.substring(0, ssrContext.url.lastIndexOf("/")) || "/";
    ssrContext.url = url;
    event._path = event.node.req.url = url;
  }
  const routeOptions = getRouteRules(event);
  if (routeOptions.ssr === false) {
    ssrContext.noSSR = true;
  }
  const renderer = await getRenderer(ssrContext);
  const _rendered = await renderer.renderToString(ssrContext).catch(async (error) => {
    if (ssrContext._renderResponse && error.message === "skipping render") {
      return {};
    }
    const _err = !ssrError && ssrContext.payload?.error || error;
    await ssrContext.nuxt?.hooks.callHook("app:error", _err);
    throw _err;
  });
  const inlinedStyles = [];
  await ssrContext.nuxt?.hooks.callHook("app:rendered", { ssrContext, renderResult: _rendered });
  if (ssrContext._renderResponse) {
    return ssrContext._renderResponse;
  }
  if (ssrContext.payload?.error && !ssrError) {
    throw ssrContext.payload.error;
  }
  if (isRenderingPayload) {
    const response = renderPayloadResponse(ssrContext);
    return response;
  }
  const NO_SCRIPTS = routeOptions.noScripts;
  const { styles, scripts } = getRequestDependencies(ssrContext, renderer.rendererContext);
  if (ssrContext._preloadManifest && !NO_SCRIPTS) {
    ssrContext.head.push({
      link: [
        { rel: "preload", as: "fetch", fetchpriority: "low", crossorigin: "anonymous", href: buildAssetsURL(`builds/meta/${ssrContext.runtimeConfig.app.buildId}.json`) }
      ]
    }, { ...headEntryOptions, tagPriority: "low" });
  }
  if (inlinedStyles.length) {
    ssrContext.head.push({ style: inlinedStyles });
  }
  const link = [];
  for (const resource of Object.values(styles)) {
    if ("inline" in getQuery(resource.file)) {
      continue;
    }
    link.push({ rel: "stylesheet", href: renderer.rendererContext.buildAssetsURL(resource.file), crossorigin: "" });
  }
  if (link.length) {
    ssrContext.head.push({ link }, headEntryOptions);
  }
  if (!NO_SCRIPTS) {
    ssrContext.head.push({
      link: getPreloadLinks(ssrContext, renderer.rendererContext)
    }, headEntryOptions);
    ssrContext.head.push({
      link: getPrefetchLinks(ssrContext, renderer.rendererContext)
    }, headEntryOptions);
    ssrContext.head.push({
      script: renderPayloadJsonScript({ ssrContext, data: ssrContext.payload }) 
    }, {
      ...headEntryOptions,
      // this should come before another end of body scripts
      tagPosition: "bodyClose",
      tagPriority: "high"
    });
  }
  if (!routeOptions.noScripts) {
    const tagPosition = "head";
    ssrContext.head.push({
      script: Object.values(scripts).map((resource) => ({
        type: resource.module ? "module" : null,
        src: renderer.rendererContext.buildAssetsURL(resource.file),
        defer: resource.module ? null : true,
        // if we are rendering script tag payloads that import an async payload
        // we need to ensure this resolves before executing the Nuxt entry
        tagPosition,
        crossorigin: ""
      }))
    }, headEntryOptions);
  }
  const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } = await renderSSRHead(ssrContext.head, renderSSRHeadOptions);
  const htmlContext = {
    htmlAttrs: htmlAttrs ? [htmlAttrs] : [],
    head: normalizeChunks([headTags]),
    bodyAttrs: bodyAttrs ? [bodyAttrs] : [],
    bodyPrepend: normalizeChunks([bodyTagsOpen, ssrContext.teleports?.body]),
    body: [
      replaceIslandTeleports(ssrContext, _rendered.html) ,
      APP_TELEPORT_OPEN_TAG + (HAS_APP_TELEPORTS ? joinTags([ssrContext.teleports?.[`#${appTeleportAttrs.id}`]]) : "") + APP_TELEPORT_CLOSE_TAG
    ],
    bodyAppend: [bodyTags]
  };
  await nitroApp.hooks.callHook("render:html", htmlContext, { event });
  return {
    body: renderHTMLDocument(htmlContext),
    statusCode: getResponseStatus(event),
    statusMessage: getResponseStatusText(event),
    headers: {
      "content-type": "text/html;charset=utf-8",
      "x-powered-by": "Nuxt"
    }
  };
});
function normalizeChunks(chunks) {
  const result = [];
  for (const _chunk of chunks) {
    const chunk = _chunk?.trim();
    if (chunk) {
      result.push(chunk);
    }
  }
  return result;
}
function joinTags(tags) {
  return tags.join("");
}
function joinAttrs(chunks) {
  if (chunks.length === 0) {
    return "";
  }
  return " " + chunks.join(" ");
}
function renderHTMLDocument(html) {
  return `<!DOCTYPE html><html${joinAttrs(html.htmlAttrs)}><head>${joinTags(html.head)}</head><body${joinAttrs(html.bodyAttrs)}>${joinTags(html.bodyPrepend)}${joinTags(html.body)}${joinTags(html.bodyAppend)}</body></html>`;
}

const renderer$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: renderer
}, Symbol.toStringTag, { value: 'Module' }));
//# sourceMappingURL=index.mjs.map
