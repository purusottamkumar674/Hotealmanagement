import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFile, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

// Executes the actual migrations and functions in embedded PostgreSQL, not a JS model.
// Auth and Storage infrastructure are fixtures; hosted GoTrue/Storage still require staging QA.
const db = new PGlite({ extensions: { pgcrypto } });
await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth; create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to anon,authenticated,service_role; grant execute on function auth.uid() to public;
 create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text); alter table storage.objects enable row level security;
 create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1,'/') $$;
 grant usage on schema public,storage to anon,authenticated,service_role;
 alter default privileges in schema public grant select on tables to anon;
 alter default privileges in schema public grant all on tables to service_role;
 grant select,insert,delete on storage.objects to authenticated;`);
for (const file of (await readdir("supabase/migrations"))
  .filter((s) => s.endsWith(".sql"))
  .sort()) {
  try {
    await db.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
    console.log("APPLIED", file);
  } catch (e) {
    console.error("MIGRATION FAILED", file, e.message);
    throw e;
  }
}
const q = async (sql, args = []) => (await db.query(sql, args)).rows;
const id = () => randomUUID();
const flower = id(),
  petal = id(),
  manager = id(),
  marketer = id(),
  front = id(),
  finance = id(),
  outsider = id();
const rooms = [id(), id(), id(), id()];
await q(`insert into auth.users(id) select unnest($1::uuid[])`, [
  [manager, marketer, front, finance, outsider],
]);
await q(
  `insert into hotels(id,slug,name,status,booking_enabled,pay_at_property,tax_approved) values ($1,'flower-inn','TEST Flower','published',true,true,true),($2,'petal-inn','TEST Petal','published',true,true,true)`,
  [flower, petal],
);
for (let i = 0; i < 4; i++)
  await q(
    `insert into room_types(id,hotel_id,slug,name,inventory,max_guests,base_rate_minor,published,accommodation_category,bhk_count,bedrooms)
 values($1,$2,$3,$4,1,6,$5,true,'apartment',$6,$6)`,
    [
      rooms[i],
      i === 3 ? petal : flower,
      `test-${i}`,
      `${i === 3 ? 1 : i + 1} BHK TEST`,
      (i + 1) * 200000,
      i === 3 ? 1 : i + 1,
    ],
  );
await q(
  `insert into staff_assignments(auth_user_id,hotel_id,role) values ($1,$2,'property_manager'),($3,$2,'marketing'),($4,$2,'front_desk'),($5,$2,'finance')`,
  [manager, flower, marketer, front, finance],
);
for (const h of [flower, petal])
  for (const slug of [
    "booking-policy",
    "cancellation-policy",
    "privacy-policy",
    "terms-and-conditions",
  ])
    await q(
      `insert into site_content(hotel_id,slug,title,body,approved,active) values($1,$2,'TEST ONLY','TEST FIXTURE ONLY',true,true)`,
      [h, slug],
    );
const day = "2099-12-05",
  checkout = "2099-12-06";
const asUser = async (user, fn) => {
  await db.exec(
    `set role authenticated; select set_config('request.jwt.claim.sub','${user}',false)`,
  );
  try {
    return await fn();
  } finally {
    await db.exec(
      `reset role; select set_config('request.jwt.claim.sub','',false)`,
    );
  }
};
const quote = async (room = rooms[0], from = day, to = checkout) =>
  (await q(`select quote_stay_server($1,$2,$3,1,1) as q`, [room, from, to]))[0]
    .q;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);
test("finance can set daily rates but cannot change physical inventory or property settings", async () => {
  await asUser(finance, async () => {
    await q(
      `select set_daily_rates($1,$2,'2099-12-20','2099-12-20',123000,array[0,1,2,3,4,5,6],'TEST finance')`,
      [flower, rooms[0]],
    );
    assert.equal(
      (
        await q(
          "update room_types set inventory=100 where id=$1 returning id",
          [rooms[0]],
        )
      ).length,
      0,
    );
    assert.equal(
      (
        await q(
          "update hotels set tax_basis_points=9999 where id=$1 returning id",
          [flower],
        )
      ).length,
      0,
    );
  });
  assert.equal(
    (await q("select inventory from room_types where id=$1", [rooms[0]]))[0]
      .inventory,
    1,
  );
});
test("marketing cannot approve or modify approved policy text without management review", async () => {
  await asUser(marketer, () =>
    assert.rejects(
      q(
        "update site_content set body='UNAPPROVED TEST' where hotel_id=$1 and slug='booking-policy'",
        [flower],
      ),
      /Management approval/,
    ),
  );
  assert.equal(
    (
      await q(
        "select body from site_content where hotel_id=$1 and slug='booking-policy'",
        [flower],
      )
    )[0].body,
    "TEST FIXTURE ONLY",
  );
});
test("additive migration preserves conventional starter model and does not seed inventory", async () => {
  assert.equal((await q(`select count(*)::int as n from room_types`))[0].n, 4);
});
test("1 BHK, 2 BHK, 3 BHK and hotel-specific base prices use integer minor units", async () => {
  for (let i = 0; i < 4; i++)
    assert.equal((await quote(rooms[i])).total_minor, (i + 1) * 200000);
});
test("no unapproved automatic weekend uplift", async () => {
  assert.equal((await quote()).subtotal_minor, 200000);
});
test("weekend, seasonal, priority and daily override precedence", async () => {
  await q(
    `insert into pricing_rules(hotel_id,room_type_id,name,kind,start_date,end_date,rate_minor,weekdays,approved,active,reason) values($1,$2,'TEST weekend','weekend',$3,$3,210000,array[0,6],true,true,'test')`,
    [flower, rooms[0], day],
  );
  assert.equal((await quote()).total_minor, 210000);
  await q(
    `insert into pricing_rules(hotel_id,room_type_id,name,kind,start_date,end_date,rate_minor,approved,active,reason) values($1,$2,'TEST season','season',$3,$3,220000,true,true,'test')`,
    [flower, rooms[0], day],
  );
  assert.equal((await quote()).total_minor, 220000);
  await asUser(manager, () =>
    q(
      `select set_daily_rates($1,$2,$3,$3,230000,array[0,1,2,3,4,5,6],'TEST rate change')`,
      [flower, rooms[0], day],
    ),
  );
  assert.equal((await quote()).total_minor, 230000);
  const history = (
    await q(
      `select * from pricing_history where room_type_id=$1 and stay_date=$2`,
      [rooms[0], day],
    )
  )[0];
  assert.equal(history.old_rate_minor, 220000);
  assert.equal(history.new_rate_minor, 230000);
  assert.equal(history.changed_by, manager);
});
test("per-night breakdown is checkout exclusive and includes each date", async () => {
  const result = await quote(rooms[0], day, "2099-12-08");
  assert.equal(result.nights, 3);
  assert.equal(result.nightly.length, 3);
  assert.equal(result.total_minor, 630000);
});
test("marketing and front desk cannot change prices or other properties", async () => {
  await asUser(marketer, () =>
    assert.rejects(
      q(`select set_daily_rates($1,$2,$3,$3,1,array[0],'test')`, [
        flower,
        rooms[0],
        day,
      ]),
      /permission/,
    ),
  );
  await asUser(front, () =>
    assert.rejects(
      q(`select set_daily_rates($1,$2,$3,$3,1,array[0],'test')`, [
        flower,
        rooms[0],
        day,
      ]),
      /permission/,
    ),
  );
  await asUser(manager, () =>
    assert.rejects(
      q(`select set_daily_rates($1,$2,$3,$3,1,array[0],'test')`, [
        petal,
        rooms[3],
        day,
      ]),
      /permission/,
    ),
  );
});
test("room associations cannot cross properties", async () => {
  await assert.rejects(
    q(
      `insert into amenities(hotel_id,room_type_id,name,category) values($1,$2,'TEST','test')`,
      [petal, rooms[0]],
    ),
    /foreign key/,
  );
});
test("nearby and FAQ management is property scoped with draft visibility", async () => {
  await asUser(marketer, () =>
    q(
      `insert into nearby_places(hotel_id,name,category,source_note,active) values($1,'TEST landmark','landmark','test fixture',false)`,
      [flower],
    ),
  );
  await asUser(marketer, () =>
    q(
      `insert into faqs(hotel_id,question,answer,category,active) values($1,'TEST question','TEST answer','test',true)`,
      [flower],
    ),
  );
  await asUser(marketer, () =>
    assert.rejects(
      q(
        `insert into faqs(hotel_id,question,answer,category) values($1,'unauthorized','test','test')`,
        [petal],
      ),
      /row-level security/,
    ),
  );
  await db.exec("set role anon");
  try {
    assert.equal((await q("select * from nearby_places")).length, 0);
    assert.equal((await q("select * from faqs")).length, 1);
  } finally {
    await db.exec("reset role");
  }
});
test("public cannot invoke booking RPC or edit rates directly", async () => {
  await db.exec("set role anon");
  try {
    await assert.rejects(quote(), /permission denied/);
    await assert.rejects(
      q(`update daily_rates set rate_minor=1`),
      /permission denied/,
    );
  } finally {
    await db.exec("reset role");
  }
});
let booked,
  access = "a".repeat(64),
  request = "b".repeat(64),
  key = id();
const reserve = async (k = key, total = 230000, hash = request) =>
  (
    await q(
      `select reserve_stay_server($1,$2,$3,1,1,'TEST Guest','test@example.test','1234567890',$4,$5,$6,$7) as booking`,
      [rooms[0], day, checkout, total, k, access, hash],
    )
  )[0].booking;
test("checkout rejects a stale or forged frontend price", async () => {
  await assert.rejects(reserve(id(), 1), /Price changed/);
});
test("reservation snapshot, idempotency, inventory decrement and double booking prevention", async () => {
  booked = await reserve();
  assert.equal(booked.status, "confirmed");
  assert.equal((await quote()).available, 0);
  assert.deepEqual(await reserve(), booked);
  await assert.rejects(reserve(id()), /sold out/);
  await assert.rejects(
    reserve(key, 230000, "c".repeat(64)),
    /Idempotency conflict/,
  );
});
test("simultaneous submissions for a single remaining unit yield one reservation", async () => {
  const result = await Promise.allSettled([
    q(
      `select reserve_stay_server($1,$2,$3,1,1,'TEST Guest','test@example.test','1234567890',400000,$4,$5,$6)`,
      [rooms[1], day, checkout, id(), access, request],
    ),
    q(
      `select reserve_stay_server($1,$2,$3,1,1,'TEST Guest','test@example.test','1234567890',400000,$4,$5,$6)`,
      [rooms[1], day, checkout, id(), access, request],
    ),
  ]);
  assert.equal(result.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(result.filter((r) => r.status === "rejected").length, 1);
});
test("price changes do not rewrite confirmed booking snapshots", async () => {
  await asUser(manager, () =>
    q(
      `select set_daily_rates($1,$2,$3,$3,990000,array[0,1,2,3,4,5,6],'TEST change after confirmation')`,
      [flower, rooms[0], day],
    ),
  );
  const saved = (
    await q(`select total_minor from bookings where reference=$1`, [
      booked.reference,
    ])
  )[0];
  assert.equal(saved.total_minor, 230000);
});
test("cannot block reserved inventory or lower inventory under confirmed usage", async () => {
  await asUser(front, () =>
    assert.rejects(
      q(
        `insert into inventory_blocks(room_type_id,stay_date,blocked_units,reason) values($1,$2,1,'TEST')`,
        [rooms[0], day],
      ),
      /Inventory cannot/,
    ),
  );
  await asUser(manager, () =>
    assert.rejects(
      q(`update room_types set inventory=0 where id=$1`, [rooms[0]]),
      /Inventory cannot/,
    ),
  );
});
test("marketing cannot read guest records; unassigned users cannot mutate bookings", async () => {
  await asUser(marketer, async () => {
    assert.equal((await q("select * from bookings")).length, 0);
  });
  const b = (
    await q("select id from bookings where reference=$1", [booked.reference])
  )[0];
  await asUser(outsider, () =>
    assert.rejects(
      q(`select change_booking_status($1,'cancelled')`, [b.id]),
      /permission/,
    ),
  );
});
test("property managers cannot grant themselves or others group permissions", async () => {
  await asUser(manager, () =>
    assert.rejects(
      q(`select provision_staff($1,null,'super_admin',true)`, [outsider]),
      /Group administrator/,
    ),
  );
});
test("hero and media associations cannot cross properties; unpublished slides remain private", async () => {
  const media = id();
  await q(
    `insert into media_assets(id,hotel_id,storage_path,url,alt_text,category) values($1,$2,'test/path','https://example.test/test.jpg','TEST ONLY','hero')`,
    [media, flower],
  );
  await assert.rejects(
    q(
      `insert into hero_slides(hotel_id,image_id,heading,cta_text,cta_link) values($1,$2,'TEST','TEST','/search')`,
      [petal, media],
    ),
    /foreign key/,
  );
  await asUser(marketer, () =>
    q(
      `insert into hero_slides(hotel_id,image_id,heading,cta_text,cta_link) values($1,$2,'TEST','TEST','/search')`,
      [flower, media],
    ),
  );
  await db.exec("set role anon");
  try {
    assert.equal((await q("select * from hero_slides")).length, 0);
    assert.equal((await q("select * from media_assets")).length, 0);
  } finally {
    await db.exec("reset role");
  }
});
test("guest cancellation requests are authenticated, audited and idempotent without automatic refunds", async () => {
  await assert.rejects(
    q(`select request_cancellation_server($1,$2)`, [
      booked.reference,
      "z".repeat(64),
    ]),
    /Reservation cannot/,
  );
  await q(`select request_cancellation_server($1,$2)`, [
    booked.reference,
    access,
  ]);
  await q(`select request_cancellation_server($1,$2)`, [
    booked.reference,
    access,
  ]);
  const b = (
    await q(
      "select id,status,payment_status,policy_snapshot,cancellation_requested_at from bookings where reference=$1",
      [booked.reference],
    )
  )[0];
  assert.equal(b.status, "confirmed");
  assert.equal(b.payment_status, "unpaid");
  assert.ok(b.cancellation_requested_at);
  assert.equal(b.policy_snapshot.policies.length, 4);
  assert.equal(
    (
      await q(
        `select count(*)::int as n from audit_logs where entity_id=$1 and action='guest_cancellation_request'`,
        [b.id],
      )
    )[0].n,
    1,
  );
});
test("SEO observations require property permissions and never become public ranking claims", async () => {
  await asUser(marketer, () =>
    q(
      `insert into seo_observations(hotel_id,keyword,observed_on,search_location,metric_type,observed_position,source_note) values($1,'TEST keyword','2026-11-24','TEST location','maps',null,'TEST verified fixture')`,
      [flower],
    ),
  );
  await asUser(marketer, () =>
    assert.rejects(
      q(
        `insert into seo_observations(hotel_id,keyword,observed_on,search_location,metric_type,source_note) values($1,'TEST','2026-11-24','TEST','maps','TEST')`,
        [petal],
      ),
      /row-level security/,
    ),
  );
  await db.exec("set role anon");
  try {
    assert.equal((await q("select * from seo_observations")).length, 0);
  } finally {
    await db.exec("reset role");
  }
});
test("authorized cancellation preserves history and releases inventory; cannot resurrect", async () => {
  const booking = (
    await q(`select id from bookings where reference=$1`, [booked.reference])
  )[0];
  await asUser(front, () =>
    q(`select change_booking_status($1,'cancelled')`, [booking.id]),
  );
  assert.equal((await quote()).available, 1);
  assert.equal((await q("select count(*)::int as n from bookings"))[0].n, 2);
  await asUser(front, () =>
    assert.rejects(
      q(`select change_booking_status($1,'checked_in')`, [booking.id]),
      /Invalid booking status/,
    ),
  );
});
test("tax approval and policy publication gate real bookings", async () => {
  await q(`update hotels set tax_approved=false where id=$1`, [petal]);
  assert.equal((await quote(rooms[3])).bookable, false);
  await q(
    `update hotels set tax_approved=true,tax_basis_points=1800 where id=$1`,
    [petal],
  );
  assert.equal((await quote(rooms[3])).tax_minor, 144000);
  await q(
    `update site_content set approved=false where hotel_id=$1 and slug='booking-policy'`,
    [petal],
  );
  assert.equal((await quote(rooms[3])).bookable, false);
});
test("distributed rate limit rejects over-budget calls", async () => {
  assert.equal(
    (await q(`select consume_api_limit('test',1,60) as allowed`))[0].allowed,
    true,
  );
  assert.equal(
    (await q(`select consume_api_limit('test',1,60) as allowed`))[0].allowed,
    false,
  );
});
let failed = 0;
for (const [name, fn] of tests) {
  try {
    await fn();
    console.log("PASS", name);
  } catch (e) {
    failed++;
    console.error("FAIL", name, e.message);
  }
}
await db.close();
console.log(
  `${tests.length - failed}/${tests.length} database tests passed. Embedded PostgreSQL serializes clients; cross-connection lock stress testing requires staging.`,
);
if (failed) process.exitCode = 1;
