import { test, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server.js";
import { proxy } from "../src/proxy.ts";
const names = [
  "NEXT_PUBLIC_DEMO_MODE",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];
const previous = Object.fromEntries(names.map((k) => [k, process.env[k]]));
const originalFetch = globalThis.fetch;
let calls = [];
beforeEach(() => {
  process.env.NEXT_PUBLIC_DEMO_MODE = "false";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test-project.example";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-only-anon";
  calls = [];
  globalThis.fetch = async (...args) => {
    calls.push(args);
    throw new Error("Unexpected test request");
  };
});
after(() => {
  globalThis.fetch = originalFetch;
  for (const k of names) {
    if (previous[k] === undefined) delete process.env[k];
    else process.env[k] = previous[k];
  }
});
const request = (cookie = "") =>
  new NextRequest("https://hotel.example/admin/pricing", {
    headers: { cookie },
  });
const json = (data, status = 200) => Response.json(data, { status });
test("admin request without database configuration redirects before rendering", async () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  const result = await proxy(request());
  assert.equal(result.status, 307);
  assert.equal(
    result.headers.get("location"),
    "https://hotel.example/admin-login",
  );
  assert.equal(calls.length, 0);
});
test("missing access and refresh cookies fail closed", async () => {
  assert.equal((await proxy(request())).status, 307);
  assert.equal(calls.length, 0);
});
test("a forged access token is never treated as an authenticated staff session", async () => {
  globalThis.fetch = async (...args) => {
    calls.push(args);
    return json({}, 401);
  };
  assert.equal((await proxy(request("fp-access=forged"))).status, 307);
  assert.equal(calls.length, 1);
});
test("verified auth without an active staff assignment cannot enter admin", async () => {
  let n = 0;
  globalThis.fetch = async () => json(++n === 1 ? { id: "test-user" } : []);
  assert.equal((await proxy(request("fp-access=test-valid"))).status, 307);
});
test("verified staff request is allowed with private uncached response headers", async () => {
  let n = 0;
  globalThis.fetch = async () =>
    json(++n === 1 ? { id: "test-user" } : [{ id: "assignment" }]);
  const result = await proxy(request("fp-access=test-valid"));
  assert.equal(result.status, 200);
  assert.equal(result.headers.get("x-middleware-next"), "1");
  assert.equal(result.headers.get("cache-control"), "private, no-store");
});
test("expired staff access refreshes HttpOnly cookies and forwards the new session", async () => {
  let n = 0;
  globalThis.fetch = async (...args) => {
    calls.push(args);
    n++;
    return n === 1
      ? json({}, 401)
      : n === 2
        ? json({
            access_token: "renewed-test-token",
            refresh_token: "renewed-test-refresh",
            expires_in: 3600,
          })
        : n === 3
          ? json({ id: "test-user" })
          : json([{ id: "assignment" }]);
  };
  const result = await proxy(
    request("fp-access=expired; fp-refresh=test-refresh"),
  );
  assert.equal(result.status, 200);
  assert.equal(result.cookies.get("fp-access").value, "renewed-test-token");
  assert.match(result.headers.get("set-cookie"), /HttpOnly/i);
  assert.match(
    result.headers.get("x-middleware-request-cookie"),
    /renewed-test-token/,
  );
  assert.match(calls[1][0], /grant_type=refresh_token/);
});
test("auth infrastructure errors fail closed", async () => {
  assert.equal((await proxy(request("fp-access=test"))).status, 307);
});
test("only explicit demo mode bypasses live staff authentication", async () => {
  process.env.NEXT_PUBLIC_DEMO_MODE = "true";
  assert.equal((await proxy(request())).status, 200);
  assert.equal(calls.length, 0);
});
