/**
 * Browser client for the Airlock Cloud API (docs/cloud-api.md).
 * Same-origin by default: nginx serves the API under /api on the console's own host, so the
 * session cookie is first-party and the strict Content-Security-Policy (connect-src 'self') holds.
 */

export class ApiError extends Error {
  constructor(status, body, retryAfterSeconds) {
    super((body && body.message) || "Request failed (HTTP " + status + ")");
    this.name = "ApiError";
    this.status = status;
    this.retryAfter = typeof retryAfterSeconds === "number" && retryAfterSeconds > 0 ? retryAfterSeconds : null;
    this.code = (body && body.code) || "INTERNAL";
    this.quota = body && body.quota ? body.quota : null;
    this.issues = body && body.issues ? body.issues : null;
  }
}

function apiBase() {
  return typeof window !== "undefined" && window.AIRLOCK_API_BASE ? window.AIRLOCK_API_BASE : "/api";
}

async function request(method, path, body, options) {
  const fetchImpl = (options && options.fetch) || fetch;
  const headers = { Accept: "application/json", "X-Airlock-Csrf": "1" };
  const init = { method: method, headers: headers, credentials: "same-origin" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  let response;
  try {
    response = await fetchImpl(apiBase() + path, init);
  } catch (cause) {
    throw new ApiError(0, { code: "INTERNAL", message: "Cannot reach Airlock Cloud. Check your connection and try again." });
  }
  if (response.status === 204) return null;
  let payload = null;
  const text = await response.text();
  if (text) {
    try { payload = JSON.parse(text); } catch (cause) { payload = null; }
  }
  if (!response.ok) {
    const header = response.headers && typeof response.headers.get === "function" ? Number(response.headers.get("Retry-After")) : NaN;
    throw new ApiError(response.status, payload, Number.isFinite(header) ? header : null);
  }
  return payload;
}

function query(params) {
  const entries = Object.entries(params || {}).filter(function (pair) { return pair[1] !== undefined && pair[1] !== null && pair[1] !== ""; });
  if (!entries.length) return "";
  return "?" + entries.map(function (pair) { return encodeURIComponent(pair[0]) + "=" + encodeURIComponent(String(pair[1])); }).join("&");
}

export function createApi(options) {
  const opts = options || {};
  const call = function (method, path, body) { return request(method, path, body, opts); };
  return {
    health: function () { return call("GET", "/health"); },
    signup: function (email, password, name) { return call("POST", "/v1/auth/signup", { email: email, password: password, name: name || undefined }); },
    login: function (email, password) { return call("POST", "/v1/auth/login", { email: email, password: password }); },
    logout: function () { return call("POST", "/v1/auth/logout"); },
    /** Resolves to { user, workspace }, or null when nobody is signed in. */
    me: async function () {
      try { return await call("GET", "/v1/auth/me"); } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    workspace: function () { return call("GET", "/v1/workspace"); },
    renameWorkspace: function (name) { return call("PATCH", "/v1/workspace", { name: name }); },
    usage: function () { return call("GET", "/v1/usage"); },
    analytics: function (days) { return call("GET", "/v1/analytics" + query({ days: days })); },
    keys: {
      list: function () { return call("GET", "/v1/keys"); },
      create: function (name) { return call("POST", "/v1/keys", { name: name }); },
      revoke: function (id) { return call("DELETE", "/v1/keys/" + encodeURIComponent(id)); }
    },
    runs: {
      list: function (params) { return call("GET", "/v1/runs" + query(params)); },
      get: function (id) { return call("GET", "/v1/runs/" + encodeURIComponent(id)); },
      create: function (body) { return call("POST", "/v1/runs", body); },
      cancel: function (id) { return call("POST", "/v1/runs/" + encodeURIComponent(id) + "/cancel"); },
      evidence: function (id) { return call("GET", "/v1/runs/" + encodeURIComponent(id) + "/evidence"); }
    },
    evidenceKey: function () { return call("GET", "/v1/evidence-key"); },
    verifyEvidence: function (bundle) { return call("POST", "/v1/evidence/verify", bundle); }
  };
}

export const api = createApi();
