var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/store.ts
var Conflict = class extends Error {
  static {
    __name(this, "Conflict");
  }
};
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
__name(escapeHtml, "escapeHtml");
var ContactStore = class {
  static {
    __name(this, "ContactStore");
  }
  db;
  constructor(db) {
    this.db = db;
  }
  async find(id) {
    return this.db.prepare("SELECT id AS receiptId,payload_hash AS payloadHash FROM inquiries WHERE request_id=?").bind(id).first();
  }
  async accept(input) {
    const { requestId, payloadHash, fields, now, config } = input;
    const id = crypto.randomUUID();
    const payload = { from: config.from, to: config.to, reply_to: fields.email, subject: `${config.clientId} \u304A\u554F\u3044\u5408\u308F\u305B\u53D7\u4ED8 ${id}`, html: Object.entries(fields).map(([k, v]) => `<p><strong>${escapeHtml(k)}</strong><br>${escapeHtml(v).replace(/\n/g, "<br>")}</p>`).join("") };
    await this.db.batch([
      this.db.prepare("INSERT INTO inquiries (id,request_id,payload_hash,fields,created_at) VALUES (?,?,?,?,?) ON CONFLICT(request_id) DO NOTHING").bind(id, requestId, payloadHash, JSON.stringify(fields), now),
      this.db.prepare("INSERT INTO outbox (id,payload,idempotency_key,created_at,next_at,updated_at) SELECT id,?,?,?, ?,? FROM inquiries WHERE request_id=? AND payload_hash=? ON CONFLICT(id) DO NOTHING").bind(JSON.stringify(payload), `contact/${id}`, now, now, now, requestId, payloadHash)
    ]);
    const found = await this.find(requestId);
    if (!found) throw Error("save failed");
    if (found.payloadHash !== payloadHash) throw new Conflict("request conflict");
    return { receiptId: found.receiptId, duplicate: found.receiptId !== id };
  }
};

// src/contact.ts
function response(status, value) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
__name(response, "response");
function assertConfig(c) {
  if (!["local", "production"].includes(c.mode) || !["local", "production"].includes(c.adapter) || c.mode === "production" && c.adapter === "local") throw Error("unsafe adapter");
  const u = new URL(c.origin);
  if (u.origin !== c.origin || u.hostname !== c.hostname || c.mode === "local" && !["127.0.0.1", "localhost", "[::1]"].includes(u.hostname) || c.mode === "production" && u.protocol !== "https:") throw Error("invalid origin");
  if (c.fields.length > 10 || new Set(c.fields).size !== c.fields.length || !["name", "email", "message"].every((x) => c.fields.includes(x)) || c.fields.some((x) => !/^\w{1,32}$/.test(x))) throw Error("invalid fields");
  if (/[\r\n]/.test(c.from + c.to) || !emailValid(c.to)) throw Error("invalid recipient");
}
__name(assertConfig, "assertConfig");
function emailValid(s) {
  return s.length <= 254 && !/[\s\r\n<>]/.test(s) && /^[^@]+@[^@]+\.[^@]+$/.test(s);
}
__name(emailValid, "emailValid");
async function readJson(r) {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(r.headers.get("Content-Type") || "")) throw { status: 415 };
  const reader = r.body?.getReader();
  if (!reader) throw { status: 400 };
  let size = 0;
  const chunks = [];
  while (true) {
    const p = await reader.read();
    if (p.done) break;
    size += p.value.byteLength;
    if (size > 32768) {
      await reader.cancel();
      throw { status: 413 };
    }
    chunks.push(p.value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw { status: 400 };
  }
}
__name(readJson, "readJson");
async function handleContact(request, deps) {
  try {
    assertConfig(deps.config);
    if (request.method !== "POST") return response(405, { error: "\u9001\u4FE1\u65B9\u6CD5\u304C\u7121\u52B9\u3067\u3059\u3002" });
    if (request.headers.get("Origin") !== deps.config.origin) return response(403, { error: "\u9001\u4FE1\u5143\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002" });
    if (!await deps.rate.allow(await deps.rateKey(request))) return response(429, { error: "\u5C11\u3057\u6642\u9593\u3092\u304A\u3044\u3066\u518D\u9001\u3057\u3066\u304F\u3060\u3055\u3044\u3002" });
    const raw = await readJson(request);
    if (!raw || typeof raw !== "object" || !/^\w{8}-\w{4}-4\w{3}-[89ab]\w{3}-\w{12}$/i.test(raw.requestId || "") || typeof raw.token !== "string" || raw.token.length > 2048 || !raw.fields || typeof raw.fields !== "object" || Array.isArray(raw.fields) || Object.keys(raw).some((k) => !["requestId", "token", "fields"].includes(k)) || Object.keys(raw.fields).some((k) => !deps.config.fields.includes(k))) throw { status: 400 };
    const fields = {};
    for (const key of deps.config.fields) {
      const v = raw.fields[key] ?? "";
      if (typeof v !== "string") throw { status: 400 };
      const value = v.trim(), max = key === "name" ? 100 : key === "email" ? 254 : key === "message" ? 5e3 : 1e3;
      if ([...value].length > max || ["name", "email", "message"].includes(key) && !value || key === "email" && !emailValid(value)) throw { status: 400 };
      fields[key] = value;
    }
    const payloadHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(fields))))).map((x) => x.toString(16).padStart(2, "0")).join("");
    const old = await deps.store.find(raw.requestId);
    if (old) {
      if (old.payloadHash !== payloadHash) throw new Conflict();
      return response(200, { receiptId: old.receiptId });
    }
    const verification = await deps.verify(raw.token);
    if (!verification.success || verification.hostname !== deps.config.hostname || verification.action !== "contact") return response(403, { error: "\u8A8D\u8A3C\u3092\u66F4\u65B0\u3057\u3066\u518D\u9001\u3057\u3066\u304F\u3060\u3055\u3044\u3002" });
    const saved = await deps.store.accept({ requestId: raw.requestId, payloadHash, fields, now: deps.now(), config: deps.config });
    return response(saved.duplicate ? 200 : 201, { receiptId: saved.receiptId });
  } catch (e) {
    const status = e instanceof Conflict ? 409 : e.status || 503;
    return response(status, { error: status === 409 ? "\u5185\u5BB9\u304C\u5909\u308F\u3063\u3066\u3044\u307E\u3059\u3002\u65B0\u3057\u3044\u53D7\u4ED8\u3068\u3057\u3066\u9001\u4FE1\u3057\u3066\u304F\u3060\u3055\u3044\u3002" : status === 413 ? "\u5165\u529B\u5185\u5BB9\u304C\u5927\u304D\u3059\u304E\u307E\u3059\u3002" : status === 400 ? "\u5165\u529B\u5185\u5BB9\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002" : "\u53D7\u4ED8\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u5165\u529B\u3092\u6B8B\u3057\u305F\u307E\u307E\u518D\u9001\u3057\u3066\u304F\u3060\u3055\u3044\u3002" });
  }
}
__name(handleContact, "handleContact");

// src/outbox.ts
var Outbox = class {
  static {
    __name(this, "Outbox");
  }
  db;
  constructor(db) {
    this.db = db;
  }
  async claim(now) {
    const lease = crypto.randomUUID();
    const row = await this.db.prepare("UPDATE outbox SET state='sending',lease=?,lease_until=?,first_attempt=COALESCE(first_attempt,?),attempts=attempts+1,updated_at=? WHERE id=(SELECT id FROM outbox WHERE ((state IN ('pending','retrying') AND next_at<=?) OR (state='sending' AND lease_until<=?)) ORDER BY next_at,id LIMIT 1) RETURNING *").bind(lease, now + 12e4, now, now, now, now).first();
    if (!row) return null;
    return { id: row.id, payload: JSON.parse(row.payload), key: row.idempotency_key, firstAttempt: row.first_attempt, attempts: row.attempts, lease };
  }
  async finish(job, state, now, nextAt, providerId) {
    const r = await this.db.prepare("UPDATE outbox SET state=?,next_at=?,provider_id=COALESCE(?,provider_id),lease=NULL,lease_until=0,updated_at=? WHERE id=? AND lease=?").bind(state, nextAt, providerId ?? null, now, job.id, job.lease).run();
    if (r.meta.changes !== 1) throw Error("lease lost");
  }
  async summary() {
    return this.db.prepare("SELECT state,COUNT(*) AS count,MAX(updated_at) AS lastProcessed FROM outbox GROUP BY state").all();
  }
};

// src/notify.ts
async function runOutbox(deps) {
  const counts = { accepted: 0, retrying: 0, failed: 0, unknown: 0 };
  for (let n = 0; n < 20; n++) {
    const now = deps.now(), job = await deps.store.claim(now);
    if (!job) break;
    let state = "unknown", nextAt = now, providerId;
    if (now - job.firstAttempt < 864e5) {
      let r;
      try {
        r = await deps.sender.send(job);
      } catch {
        r = { kind: "uncertain" };
      }
      if (r.kind === "accepted") {
        state = "accepted";
        providerId = r.providerId;
      } else if (r.kind === "permanent") {
        state = "failed";
      } else {
        const offsets = [1, 5, 30, 120, 360, 720];
        const minutes = offsets[job.attempts - 1];
        if (minutes !== void 0) {
          nextAt = Math.max(job.firstAttempt + minutes * 6e4, now + ("retryAfterMs" in r ? r.retryAfterMs || 0 : 0));
          if (nextAt < job.firstAttempt + 864e5) state = "retrying";
        }
      }
    }
    await deps.store.finish(job, state, now, nextAt, providerId);
    counts[state]++;
  }
  return counts;
}
__name(runOutbox, "runOutbox");

// src/resend.ts
var ResendSender = class {
  static {
    __name(this, "ResendSender");
  }
  key;
  transport;
  endpoint;
  constructor(key, transport, endpoint = "https://api.resend.com/emails") {
    this.key = key;
    this.transport = transport;
    this.endpoint = endpoint;
  }
  async send(job) {
    try {
      const r = await this.transport(this.endpoint, { method: "POST", headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json", "Idempotency-Key": job.key }, body: JSON.stringify(job.payload), signal: AbortSignal.timeout(1e4) });
      if (r.ok) {
        const body = await r.json();
        return typeof body.id === "string" && body.id ? { kind: "accepted", providerId: body.id } : { kind: "uncertain" };
      }
      if (r.status === 429 || r.status >= 500) {
        const h = r.headers.get("Retry-After");
        let retryAfterMs = h ? Number.isFinite(Number(h)) ? Number(h) * 1e3 : Math.max(0, Date.parse(h) - Date.now()) : 0;
        if (!Number.isFinite(retryAfterMs)) retryAfterMs = 0;
        return { kind: "retryable", retryAfterMs };
      }
      return { kind: "permanent" };
    } catch {
      return { kind: "uncertain" };
    }
  }
};

// src/rate-limit.ts
function localRateGate() {
  const buckets = /* @__PURE__ */ new Map();
  return { async allow(key) {
    const minute = Math.floor(Date.now() / 6e4);
    for (const [k, b2] of buckets) if (b2.minute !== minute) buckets.delete(k);
    const b = buckets.get(key) || { minute, count: 0 };
    buckets.set(key, b);
    return ++b.count <= 5;
  } };
}
__name(localRateGate, "localRateGate");

// src/worker.ts
async function routeRequest(request, deps, assets) {
  try {
    assertConfig(deps.config);
  } catch {
    return response(503, { error: "\u53D7\u4ED8\u8A2D\u5B9A\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002" });
  }
  const path = new URL(request.url).pathname;
  if (path === "/api/contact") return handleContact(request, deps);
  if (path.startsWith("/api/")) return response(404, { error: "\u53D7\u4ED8\u5148\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002" });
  return assets.fetch(request);
}
__name(routeRequest, "routeRequest");

// src/local-services.ts
async function localOnlyFetch(input, init) {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) || url.protocol !== "http:") throw Error("local transport only");
  return fetch(input, { ...init, redirect: "error" });
}
__name(localOnlyFetch, "localOnlyFetch");
async function verifyLocal(token) {
  if (token === "local-unavailable") throw Error("verification unavailable");
  return { success: token === "local-pass", hostname: "127.0.0.1", action: "contact" };
}
__name(verifyLocal, "verifyLocal");

// src/local-worker.ts
var rate = localRateGate();
var local_worker_default = { async fetch(r, env) {
  if (env.CONFIG.mode !== "local" || env.CONFIG.adapter !== "local") return new Response("local only", { status: 503 });
  const store = new ContactStore(env.DB);
  let fail = false;
  return routeRequest(r, { config: env.CONFIG, store: { find: /* @__PURE__ */ __name((id) => store.find(id), "find"), accept: /* @__PURE__ */ __name((input) => {
    if (fail) throw Error("local failure");
    return store.accept(input);
  }, "accept") }, now: Date.now, rate, rateKey: /* @__PURE__ */ __name(async () => "local-browser", "rateKey"), verify: /* @__PURE__ */ __name(async (token) => {
    fail = token === "local-storage-failure";
    return fail ? { success: true, hostname: "127.0.0.1", action: "contact" } : verifyLocal(token);
  }, "verify") }, env.ASSETS);
}, async scheduled(_event, env) {
  if (env.CONFIG.mode !== "local") throw Error("local only");
  return runOutbox({ store: new Outbox(env.DB), sender: new ResendSender("local-only", localOnlyFetch, "http://127.0.0.1:4351/emails"), now: Date.now });
} };
export {
  local_worker_default as default
};
//# sourceMappingURL=local-worker.js.map
