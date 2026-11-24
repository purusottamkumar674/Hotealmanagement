# Flower Inn & Petal Inn

The existing Next.js App Router site now has a Supabase-backed accommodation, pricing, booking and content-management path. Its forest, sage and cream design is retained. Conventional rooms and explicitly confirmed 1/2/3 BHK apartments share the existing `room_types` and booking tables.

**Deployment status:** source implementation and local automated verification only. No live Supabase project, official property content, production secrets or hosting account was supplied. No production database was changed and nothing has been deployed. Reservations remain unavailable until the database and approved property settings are configured. Do not treat embedded database tests as hosted Supabase acceptance testing.

## Run locally

Use Node.js 22 or newer (verification used Node 24). In Windows PowerShell:

```powershell
Set-Location E:\Flower_Inn_Petal_Inn_NextJS_Project\flower-petal-hotel
npm.cmd ci --cache .npm-cache
Copy-Item .env.example .env.local
# Fill in the environment settings in your editor.
npm.cmd run dev
```

Open http://localhost:3000. Staff sign-in is `/admin-login`. Without credentials, the site displays content-required states and admin routes remain protected.

The original browser-local demonstration is preserved in `Demo*` components. To use it explicitly, set `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local`, restart the development server (or rebuild), and use test information only. Demo data never becomes production inventory, pricing or bookings. The old sample 12% weekend uplift exists only in the demo. The default live pricing path has no unapproved uplift. Leave demo mode **false** when deploying.

## Supabase setup

1. Select a staging Supabase project. Back up and inspect its schema and migration history before applying any SQL. Never replay starter migrations against a populated project that already has those tables.
2. For a new database, apply these files in order through the Supabase SQL editor or your established migration workflow:
   - `supabase/migrations/20261123000000_starter_schema.sql`
   - `supabase/migrations/20261123010000_booking_hold_rpc.sql`
   - `supabase/migrations/20261124000000_integrated_platform.sql`
3. If the starter migrations are already applied, review and apply only the new additive migration. The original booking-reference default was corrected from invalid SQL string addition to concatenation for fresh installations. Existing data is not rewritten.
4. Set the Supabase URL, legacy anon key and server-only service-role key from that project in `.env.local` / hosting environment settings. Generate a random `BOOKING_ACCESS_SECRET` of at least 32 characters. Keep it stable across deployments. Never put either server secret in `NEXT_PUBLIC_` variables.
5. Create the first staff account in Supabase Auth, then bootstrap its assignment using that account's actual UUID:

```sql
insert into public.staff_assignments(auth_user_id, hotel_id, role, active)
values ('REPLACE_WITH_AUTH_USER_UUID'::uuid, null, 'super_admin', true);
```

6. Sign in at `/admin-login`. Create Flower Inn and Petal Inn using their respective `flower-inn` and `petal-inn` slugs. Add confirmed rooms or apartments, actual inventory and approved base prices. A 1 BHK apartment has category `apartment`, BHK `1` and bedrooms `1`; similarly for 2 and 3 BHK. Existing conventional rooms remain supported.
7. Upload licensed property photos and client-supplied official logos in Photography & logos. Select a property logo in Property settings. Add hero slides using uploaded images, including optional mobile images. Logos are used in navigation, footer, confirmation branding and the dynamic favicon. A branded email template is included; delivery requires a sender integration.
8. Enter verified addresses, paired coordinates or a Place ID, contact details, check-in/out times, amenities, nearby places with verification sources, FAQs and About content. No amenities, journey times, photos or locations are seeded as real.
9. Publish approved terms, privacy, cancellation and booking policies **for each property**. Approve tax treatment (zero only when management confirms it), pay-at-property and reservation enablement. Publish the property and accommodation only when ready. The server gates booking on all of these settings.
10. Create/invite further staff in Supabase Auth. The Staff page assigns or deactivates their property roles through an audited RPC. Staff cannot grant themselves roles.

The `hotel-media` Storage bucket is public for website image delivery. Draft metadata is hidden by RLS, but uploaded files are publicly accessible to anyone with their URL. Do not upload identity documents or confidential files. Uploads accept JPEG, PNG and WebP, validate signatures and MIME types, and are limited to 8 MB. Referenced images must be unassigned from slides/logos before deletion. Replacement retains the image record ID. Storage cleanup is best effort after a metadata change; check for orphaned objects if Storage is unavailable.

## Daily pricing workflow

Open `/admin/pricing`, choose the property and accommodation, select the first and last dates **inclusive**, choose weekdays, enter an INR price and a reason, and save. Existing effective prices appear in the calendar. Daily changes record actor, timestamp, property, accommodation, date, previous/new rate and reason. Rule/base-rate changes are recorded in Activity history with before/after values.

Rate precedence is deterministic:

1. Explicit daily override.
2. Approved active season/event rule.
3. Approved active weekend rule.
4. Accommodation base rate.

Within a rule tier, higher priority wins, then newest creation time, then ID. A rule applies only within its inclusive date range and selected weekdays (Sunday = 0). Rules are absolute nightly prices. No discounts or promotions stack; unapproved occupancy rules are not activated. Tax uses the property's approved basis-point rate and integer half-up rounding of the stay subtotal. All persisted money and calculations use integer minor units; forms accept INR. Currency creation is restricted to INR in this installation.

New searches and quotes use uncached database reads immediately. Open search pages refresh every 30 seconds while visible and on focus. Checkout recalculates price and inventory inside a locked database transaction; a changed total requires the guest to review a refreshed quote. Confirmed reservations retain nightly, tax/total and accepted-policy snapshots.

## Reservations and permissions

Guest checkout does not require a customer account. When approved by management, pay-at-property reservations are confirmed and recorded as **unpaid**. Online payment is explicitly unavailable. No payment-success simulation or automatic refund is used. Reference plus a private access code (or an HttpOnly booking cookie on the originating device) retrieves a reservation. Cancellation requests are audited and reviewed by authorized property staff; they do not promise cancellation or refund. Historical records are retained.

| Role                      | Scope                                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Super/group administrator | All properties, settings and audited staff provisioning                                                                                   |
| Property manager          | Assigned property settings, content, pricing and operations                                                                               |
| Hotel staff / front desk  | Assigned property reservations and inventory blocks                                                                                       |
| Finance                   | Assigned property pricing and financial/booking reads                                                                                     |
| Marketing                 | Assigned property content drafts, SEO and review workflows; managers approve published page/policy text; no guest records or price writes |

Supabase verifies sessions server-side. Access/refresh tokens use HttpOnly, SameSite cookies; production cookies require HTTPS. The pre-render proxy refreshes expired staff sessions; the workspace also refreshes every 45 minutes and retries unauthorized staff API requests once after refresh. Invalid or revoked sessions require sign-in. RLS enforces permissions for direct database requests too. Privileged booking and distributed rate-limit functions are service-role-only. Staff writes use the staff JWT, preserving RLS and actor identity. The public API never accepts an authoritative price or paid status.

On Vercel, throttling uses its overwritten `x-vercel-forwarded-for`. For another host, configure a trusted reverse proxy that overwrites `x-real-ip`; requests without either use a shared limit. Rate-limit records contain hashed identifiers and expire. Add host/WAF request-size and abuse controls for a public deployment; Vercel's request body limit may be lower than the app's 8 MB image limit.

## Pages and APIs

See [implementation and route inventory](docs/implementation-status.md) and the [pre-change audit](docs/feature-audit.md). Recommended endpoints are implemented by `src/app/api/[...path]/route.ts`, with the existing health/demo handlers retained. API responses use `{data: ...}` or `{error: {code, message}}`, uncached reads, validation and safe error messages.

## Verification

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run test:http # starts/stops a temporary production server for HTTP smoke checks
npm.cmd start
```

Tests include legacy demo logic, input/role/upload validation, actual PostgreSQL migrations/RLS/booking RPCs via PGlite, DOM-based carousel interactions and pre-render authentication/refresh tests. Embedded PostgreSQL is a single backend; its competing-submission test cannot prove cross-connection locking under real production load. Hosted Auth, PostgREST, Storage, multi-connection booking races and browser/mobile visual QA must be exercised in staging. See [validation results](docs/validation-results.txt).

## Deploy the existing Next.js project

1. Follow [production-checklist.md](docs/production-checklist.md), including a staging backup and property-isolation UAT.
2. Import the existing repository into Vercel, using `flower-petal-hotel` as root if the repository's parent is selected. Use the Next.js preset, Node 22+, `npm ci` and `npm run build`. Do not use a static export; APIs and session checks require a server.
3. Add the `.env.example` variables to the correct deployment environment. Set `NEXT_PUBLIC_SITE_URL` to that environment's exact HTTPS origin and `NEXT_PUBLIC_DEMO_MODE=false`. Deploy with indexing disabled initially. Rebuild after public environment or image-host changes.
4. Apply the reviewed migration through the established Supabase workflow, provision staff, and verify actual uploads, sign-in, daily pricing, customer search, checkout, status transitions and cross-property denials.
5. Configure the approved production domain, HTTPS and backups. Enable `SITE_INDEXING_ENABLED=true` only after authentic content and launch QA are approved. Private routes remain excluded from robots.

No hosting project or credentials were available in this workspace, so deployment was not attempted. Google Business API access, OTA/channel-manager synchronization, online payment/refunds and email/SMS sending require separately authorized provider integrations. Manual SEO observations/worklists, review records and approved review-link QR collection are available without pretending to contact Google or publish replies.

Technical references: [Supabase database functions](https://supabase.com/docs/guides/database/functions), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [Storage removal API](https://supabase.com/docs/reference/javascript/storage-from-remove).
