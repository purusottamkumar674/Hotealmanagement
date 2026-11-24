import assert from "node:assert/strict";
const base = process.argv[2] || "http://localhost:3100";
let passed = 0;
async function check(name, fn) {
  try {
    await fn();
    passed++;
    console.log("PASS", name);
  } catch (e) {
    console.error("FAIL", name, e.message);
    process.exitCode = 1;
  }
}
const get = (path, options = {}) =>
  fetch(base + path, { redirect: "manual", ...options });
for (const path of [
  "/",
  "/about",
  "/contact",
  "/faq",
  "/booking-policy",
  "/terms-and-conditions",
  "/privacy-policy",
  "/cancellation-policy",
  "/hotels",
  "/rooms",
  "/search",
  "/checkout",
  "/booking/manage",
  "/admin-login",
  "/sitemap.xml",
  "/robots.txt",
]) {
  await check(`${path} responds successfully`, async () => {
    const r = await get(path);
    assert.equal(r.status, 200);
  });
}
await check("admin page requires sign-in", async () => {
  const r = await get("/admin/pricing");
  assert.equal(r.status, 307);
  assert.equal(
    new URL(r.headers.get("location"), base).pathname,
    "/admin-login",
  );
});
for (const path of [
  "/api/admin/pricing",
  "/api/admin/nearby",
  "/api/admin/bookings",
  "/api/admin/staff",
])
  await check(`${path} rejects unauthenticated requests`, async () => {
    const r = await get(path);
    assert.equal(r.status, 401);
    assert.equal((await r.json()).error.code, "UNAUTHENTICATED");
  });
await check(
  "cross-origin mutations are denied before any database write",
  async () => {
    const r = await get("/api/admin/nearby", {
      method: "POST",
      headers: {
        Origin: "https://untrusted.example",
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    assert.equal(r.status, 403);
  },
);
await check(
  "missing private booking access does not expose guest details",
  async () => {
    const r = await get("/api/bookings/FI-000000000000000000");
    assert.ok([404, 503].includes(r.status));
    const body = await r.text();
    assert.equal(body.includes("guest_email"), false);
  },
);
await check("public responses include basic security headers", async () => {
  const r = await get("/about");
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.equal(r.headers.get("x-frame-options"), "DENY");
});
const health = await get("/api/health");
const state = await health.json();
if (!state.databaseConfigured) {
  await check(
    "health reports missing configuration and unavailable online payments",
    async () => {
      assert.equal(health.status, 503);
      assert.equal(state.databaseReachable, false);
      assert.equal(state.onlinePaymentAvailable, false);
    },
  );
  await check(
    "missing database never falls back to production sample prices",
    async () => {
      const r = await get("/api/availability/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel: "flower-inn",
          checkin: "2099-01-01",
          checkout: "2099-01-02",
          rooms: 1,
          guests: 2,
        }),
      });
      assert.equal(r.status, 503);
      assert.equal((await r.json()).error.code, "SETUP_REQUIRED");
    },
  );
  await check(
    "homepage labels local samples and never shows fabricated rates",
    async () => {
      const html = await (await get("/")).text();
      assert.equal(html.includes("images.unsplash.com"), false);
      assert.equal(html.includes("2,899"), false);
      assert.match(html, /Illustrative photo/);
    },
  );
}

for (const width of [640, 1920]) {
  await check("local hero optimized for width " + width, async () => {
    const r = await get(
      "/_next/image?url=%2Fimages%2Fhotels%2Fflower-inn%2Fhero-1.webp&w=" +
        width +
        "&q=75",
    );
    assert.equal(r.status, 200);
    assert.match(r.headers.get("content-type"), /image/);
    assert.ok((await r.arrayBuffer()).byteLength > 0);
  });
}
for (const agent of [
  "Desktop photo check",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile",
]) {
  for (const path of [
    "/",
    "/gallery",
    "/hotels/flower-inn",
    "/hotels/petal-inn",
  ]) {
    await check(path + " photo markup: " + agent, async () => {
      const r = await get(path, { headers: { "user-agent": agent } });
      assert.equal(r.status, 200);
      const html = await r.text();
      assert.match(html, /<img/);
      assert.doesNotMatch(html, /src="https:\/\/images.unsplash.com/);
      if (path === "/")
        assert.equal((html.match(/class="hero-frame/g) || []).length, 4);
    });
  }
}

console.log(
  `${passed} HTTP smoke checks passed. These checks do not authenticate to a hosted Supabase project.`,
);
