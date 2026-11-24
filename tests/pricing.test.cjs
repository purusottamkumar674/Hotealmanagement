/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS test runner consumes compiled logic modules. */
const assert = require("node:assert/strict");
const {
  nightlyRate,
  buildQuote,
  priceKey,
} = require("../.test-build/pricing.js");
const {
  eachNight,
  nightsBetween,
  dateIsWeekend,
  dateValidStay,
  isoToday,
} = require("../.test-build/dates.js");
const room = { id: "test", baseRate: 2000 };
const tests = [];
function test(label, fn) {
  tests.push({ label, fn });
}
test("date night counting uses checkout exclusive", () => {
  assert.equal(nightsBetween("2026-12-01", "2026-12-04"), 3);
  assert.deepEqual(eachNight("2026-12-01", "2026-12-04"), [
    "2026-12-01",
    "2026-12-02",
    "2026-12-03",
  ]);
});
test("weekend uplift applies on Saturday / Sunday", () => {
  assert.equal(dateIsWeekend("2026-12-05"), true);
  assert.equal(nightlyRate(room, "2026-12-05", {}), 2240);
  assert.equal(nightlyRate(room, "2026-12-04", {}), 2000);
});
test("explicit daily override wins over weekend", () => {
  assert.equal(
    nightlyRate(room, "2026-12-05", { [priceKey("test", "2026-12-05")]: 1750 }),
    1750,
  );
});
test("quantities multiply nightly totals", () => {
  const q = buildQuote(room, "2026-12-01", "2026-12-04", 2);
  assert.equal(q.nights, 3);
  assert.equal(q.subtotal, 12000);
  assert.equal(q.total, 12000);
});
test("zero and reversed date ranges rejected", () => {
  assert.throws(() => buildQuote(room, "2026-12-03", "2026-12-02"));
  assert.throws(() => buildQuote(room, "2026-12-03", "2026-12-03"));
});
test("date validation catches invalid dates", () => {
  assert.equal(nightsBetween("2026-02-31", "2026-03-01"), 0);
  assert.equal(dateValidStay(isoToday(1), isoToday(4)), true);
});
test("unreasonably high room quantities are rejected", () => {
  assert.throws(() => buildQuote(room, "2026-12-01", "2026-12-04", 11));
});
let failures = 0;
for (const { label, fn } of tests) {
  try {
    fn();
    console.log("PASS", label);
  } catch (error) {
    failures++;
    console.error("FAIL", label, error);
  }
}
if (failures) {
  console.error(`${failures} failures`);
  process.exitCode = 1;
} else console.log(`${tests.length} pricing/date tests passed.`);
