/* eslint-disable @typescript-eslint/no-require-imports -- Run against the compiled validation module. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { csvCell } = require("../.test-platform/csv.js");
test("CSV exports escape spreadsheet formulas and embedded quotes", () => {
  assert.equal(csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
  assert.equal(csvCell("  +SUM(A1:A2)"), '"\'  +SUM(A1:A2)"');
  assert.equal(csvCell("A, B"), '"A, B"');
});
const {
  canWrite,
  contentSchemas,
  bookingSchema,
  rateSchema,
  staySchema,
  validateImage,
  mapsUrl,
} = require("../.test-platform/platform.js");
const hotel = randomUUID(),
  other = randomUUID(),
  room = randomUUID();
for (const [role, allowed] of [
  ["property_manager", ["content", "pricing", "operations", "settings"]],
  ["marketing", ["content"]],
  ["front_desk", ["operations"]],
  ["finance", ["pricing"]],
]) {
  test(`${role} permissions and property isolation`, () => {
    const assignments = [{ hotel_id: hotel, role, active: true }];
    for (const area of ["content", "pricing", "operations", "settings"]) {
      assert.equal(canWrite(assignments, hotel, area), allowed.includes(area));
      assert.equal(canWrite(assignments, other, area), false);
    }
    assert.equal(
      canWrite([{ ...assignments[0], active: false }], hotel, "content"),
      false,
    );
  });
}
test("group roles require a group assignment", () => {
  assert.equal(
    canWrite(
      [{ hotel_id: null, role: "super_admin", active: true }],
      other,
      "pricing",
    ),
    true,
  );
  assert.equal(
    canWrite(
      [{ hotel_id: hotel, role: "super_admin", active: true }],
      other,
      "pricing",
    ),
    false,
  );
});
test("BHK inventory requires a matching explicit category and bedroom count", () => {
  const base = {
    hotel_id: hotel,
    name: "TEST apartment",
    slug: "test",
    accommodation_category: "apartment",
    bhk_count: 1,
    bedrooms: 1,
    max_guests: 2,
    inventory: 0,
    base_rate_minor: 200000,
    pricing_change_reason: "TEST",
  };
  assert.equal(contentSchemas.accommodations.safeParse(base).success, true);
  assert.equal(
    contentSchemas.accommodations.safeParse({ ...base, bhk_count: 3 }).success,
    false,
  );
  assert.equal(
    contentSchemas.accommodations.safeParse({
      ...base,
      accommodation_category: "room",
    }).success,
    false,
  );
});
test("no fractional, negative or unsafe monetary inputs", () => {
  const base = {
    hotel_id: hotel,
    room_type_id: room,
    from: "2099-01-01",
    to: "2099-01-02",
    rate_minor: 200000,
    reason: "TEST",
  };
  assert.equal(rateSchema.safeParse(base).success, true);
  for (const n of [-1, 0.5, Number.MAX_SAFE_INTEGER, NaN])
    assert.equal(
      rateSchema.safeParse({ ...base, rate_minor: n }).success,
      false,
    );
});
test("date ranges and impossible dates are rejected", () => {
  const valid = {
    hotel: "flower-inn",
    checkin: "2099-01-01",
    checkout: "2099-01-03",
  };
  assert.equal(staySchema.safeParse(valid).success, true);
  for (const checkout of [
    "2099-01-01",
    "2098-12-31",
    "2099-02-01",
    "2099-02-30",
  ])
    assert.equal(staySchema.safeParse({ ...valid, checkout }).success, false);
});
test("booking cannot supply a trusted price, payment status or omit policy acceptance", () => {
  const base = {
    roomId: room,
    checkin: "2099-01-01",
    checkout: "2099-01-02",
    rooms: 1,
    guests: 2,
    name: "TEST Guest",
    email: "test@example.test",
    phone: "1234567890",
    acceptedPolicies: true,
    expectedTotalMinor: 200000,
    idempotencyKey: randomUUID(),
  };
  assert.equal(bookingSchema.safeParse(base).success, true);
  assert.equal(
    bookingSchema.safeParse({ ...base, total_minor: 1 }).success,
    false,
  );
  assert.equal(
    bookingSchema.safeParse({ ...base, paymentStatus: "paid" }).success,
    false,
  );
  assert.equal(
    bookingSchema.safeParse({ ...base, acceptedPolicies: false }).success,
    false,
  );
});
test("hero links are internal and prevent executable URLs", () => {
  const base = {
    hotel_id: hotel,
    image_id: room,
    heading: "TEST",
    subtitle: "TEST",
    cta_text: "TEST",
    cta_link: "/search",
  };
  assert.equal(contentSchemas["hero-slides"].safeParse(base).success, true);
  for (const cta_link of [
    "//evil.test",
    "javascript:alert(1)",
    "https://evil.test",
    "/\\evil.test",
  ])
    assert.equal(
      contentSchemas["hero-slides"].safeParse({ ...base, cta_link }).success,
      false,
    );
});
test("nearby management requires a verification source and nonnegative distances", () => {
  const base = {
    hotel_id: hotel,
    name: "TEST place",
    category: "landmark",
    source_note: "TEST manually supplied source",
  };
  assert.equal(contentSchemas.nearby.safeParse(base).success, true);
  assert.equal(
    contentSchemas.nearby.safeParse({ ...base, source_note: "" }).success,
    false,
  );
  assert.equal(
    contentSchemas.nearby.safeParse({ ...base, distance_km: -1 }).success,
    false,
  );
});
test("FAQ and policy drafts default to unpublished", () => {
  assert.equal(
    contentSchemas.faqs.parse({
      hotel_id: hotel,
      question: "TEST?",
      answer: "TEST",
      category: "test",
    }).active,
    false,
  );
  const c = contentSchemas.content.parse({
    hotel_id: hotel,
    slug: "booking-policy",
    title: "TEST",
    body: "TEST",
  });
  assert.equal(c.active, false);
  assert.equal(c.approved, false);
});
test("map URLs require Google HTTPS hosts", () => {
  assert.equal(mapsUrl.safeParse("https://g.page/r/test/review").success, true);
  assert.equal(
    mapsUrl.safeParse(
      "https://search.google.com/local/writereview?placeid=test",
    ).success,
    true,
  );
  assert.equal(
    mapsUrl.safeParse("https://www.google.com/maps?q=0,0").success,
    true,
  );
  for (const value of [
    "http://www.google.com/maps",
    "https://google.com.evil.test/maps",
    "javascript:alert(1)",
  ])
    assert.equal(mapsUrl.safeParse(value).success, false);
});
test("upload checks detect signatures, MIME mismatch, SVG and oversize files", () => {
  const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10, 0]);
  assert.equal(validateImage(png, "image/png"), "png");
  assert.throws(() => validateImage(png, "image/jpeg"));
  assert.throws(() =>
    validateImage(new TextEncoder().encode("<svg/>"), "image/svg+xml"),
  );
  assert.throws(() =>
    validateImage(new Uint8Array(8 * 1024 * 1024 + 1), "image/png"),
  );
  assert.throws(() => validateImage(new Uint8Array(), "image/png"));
});
