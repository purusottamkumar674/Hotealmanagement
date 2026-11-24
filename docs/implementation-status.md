# Implementation status and route inventory

Updated 24 November 2026. This document describes the source upgrade; production integration remains unconfigured. See `feature-audit.md` for the original findings recorded before edits.

## Delivered source

| Feature                        | Implementation                                                                                                                | Verification / remaining input                                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Existing frontend and demo     | Existing pages retained; demo components are opt-in; live pages use Supabase data                                             | TypeScript/build and route smoke checks; no production data imported                                                             |
| Multi-property accommodations  | Extends `room_types` with room/apartment, BHK 1/2/3, bedroom/bathroom/bed counts, kitchen/living room, capacity and inventory | Actual PostgreSQL constraints/RLS tests; real inventory and naming required                                                      |
| Daily pricing                  | Calendar, inclusive bulk edits, weekday filters, rules, actor/reason/history                                                  | PostgreSQL quote/override/property tests; approved client rates required                                                         |
| Booking                        | Server quotes, room locks, idempotency, stale-price rejection, immutable amounts and policy snapshots                         | Embedded PostgreSQL tests; hosted concurrent stress and client UAT pending                                                       |
| Staff authentication           | Supabase password login, verified server session, HttpOnly cookies, refresh/logout, protected routes/APIs                     | Permission, pre-render Auth/refresh and RLS tests; actual Auth sessions need staging credentials                                 |
| Staff management               | Audited group-only provisioning/deactivation of existing Auth users                                                           | Property escalation tests; staff users must first be invited/created in Supabase                                                 |
| Content                        | Property-specific About, policies, FAQ, amenities, nearby CRUD                                                                | Validation and RLS tests; approved text/facilities/nearby sources required                                                       |
| Media / branding               | Signature/MIME/size checks, user-JWT Storage upload, replace/delete, metadata, official property logos and favicon            | Upload validation tests; actual Storage upload/cleanup and official assets need staging                                          |
| Homepage                       | Stored slides, mobile image, CTA, order/active, arrows/dots, pause/reduced motion                                             | Five carousel DOM interaction tests and a six-guest BHK search regression; visual responsive QA pending                          |
| Locations                      | Address/coordinates/Place ID, responsive embed, Maps and directions links                                                     | Empty states and URL validation; verified data and optional restricted Embed key required                                        |
| SEO                            | Canonicals, sitemap, indexing gate, verified Hotel JSON-LD without fabricated ratings                                         | Source/build verified; actual domain and approved content required                                                               |
| Reputation / SEO management    | Database worklists, manual verified observations, source notes, approved review link + QR                                     | No Google API or ranking claims; operator/Google authorization needed for automation                                             |
| Reporting                      | Property-scoped booking/guest/payment/activity reads and CSV exports                                                          | Bounded to latest 500 records; ledger reads depend on assigned role                                                              |
| Payments / communication / OTA | Honest unavailable states; safe branded email template supplied                                                               | BLOCKED BY EXTERNAL CREDENTIALS and approved provider specifications; no sending, charging, refunds or synchronization performed |

## New public/staff pages

- `/booking-policy` — published approved text per property, otherwise a content-required state.
- `/admin-login` — staff sign-in / configuration-required state.
- `/admin/accommodations`, `/admin/amenities`, `/admin/nearby`, `/admin/hero-slides`, `/admin/content`, `/admin/faqs`, `/admin/pricing-rules`, `/admin/seo-observations`.

## Modified page families

- `/`, `/hotels`, `/hotels/[slug]`, `/hotels/[slug]/rooms/[roomSlug]`, `/rooms`.
- `/about`, `/gallery`, `/amenities`, `/offers`, `/contact`, `/faq`, `/policies`, `/terms-and-conditions`, `/privacy-policy`, `/cancellation-policy` via the existing information-page route.
- `/search`, `/checkout`, `/booking/manage`, `/booking/confirmation/[reference]`.
- `/admin`, all existing `/admin/[section]` routes, admin layout, header/footer/branding and global error/loading states.
- `/account`, `/account/bookings`, `/account/profile`, login/signup/reset landing views: guest-reservation management in live mode; original previews remain in explicit demo mode. Self-service customer account enrollment/profile editing is not part of the guest-checkout flow.
- `/robots.txt`, `/sitemap.xml`, `/api/health`.

## Public APIs

All new routes are dispatched by `src/app/api/[...path]/route.ts`. Existing `/api/demo/catalog` remains explicitly illustrative.

| Method | Path                                            | Behavior                                                                       |
| ------ | ----------------------------------------------- | ------------------------------------------------------------------------------ |
| GET    | `/api/hotels`                                   | Published properties from RLS queries                                          |
| GET    | `/api/hotels/[id-or-slug]`                      | Published property                                                             |
| GET    | `/api/hotels/[id-or-slug]/nearby`, `/amenities` | Active property content                                                        |
| GET    | `/api/accommodations`                           | Published accommodation cards                                                  |
| POST   | `/api/availability/search`                      | Validated stay, inventory and per-night server quotes                          |
| POST   | `/api/bookings/quote`                           | Recalculated selected accommodation quote                                      |
| POST   | `/api/bookings`                                 | Transactional confirmed unpaid pay-at-property reservation, only when approved |
| GET    | `/api/bookings/[reference]`                     | Requires private HttpOnly cookie or `X-Booking-Access` header                  |
| PATCH  | `/api/bookings/[reference]`                     | Audited cancellation request; same private access required                     |
| GET    | `/api/branding/favicon`                         | Official property logo or 204 when absent                                      |
| GET    | `/api/health`                                   | Real database configuration/reachability, not a blanket readiness claim        |

A stay body uses `hotel` (slug, UUID or `all`), `checkin`, `checkout`, `rooms`, `guests` and optionally `roomId`. Quotes and booking amounts are integer minor units. Booking requires guest details, `acceptedPolicies: true`, `expectedTotalMinor` and an idempotency UUID. The expected total is compared with the server result, never used to calculate a price.

## Privileged APIs

All verify the Supabase session and property role, with database RLS retained.

| Method        | Path                                                                                                                      | Behavior                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| POST          | `/api/auth/login`, `/refresh`, `/logout`                                                                                  | Staff session lifecycle                                                                     |
| GET           | `/api/auth/session`, `/api/admin/session`                                                                                 | Verified user and active assignments                                                        |
| GET           | `/api/admin/pricing`                                                                                                      | Effective calendar for `room_type_id`, `from`, `to`                                         |
| PATCH         | `/api/admin/pricing`                                                                                                      | Atomic rate-range update                                                                    |
| POST          | `/api/admin/pricing/bulk-update`                                                                                          | Same atomic update, inclusive range/weekday filters/reason                                  |
| GET           | `/api/admin/pricing/history`                                                                                              | Detailed per-night audit history                                                            |
| GET, POST     | `/api/admin/{hotels,accommodations,nearby,amenities,faqs,content,hero-slides,pricing-rules,seo,seo-observations,reviews}` | Property-scoped listing and validated creation                                              |
| PATCH, DELETE | `/api/admin/[resource]/[id]`                                                                                              | Validated edits/deletion; properties/rooms must be archived/unpublished to preserve history |
| GET           | `/api/admin/gallery`                                                                                                      | Property image metadata                                                                     |
| POST          | `/api/admin/uploads`                                                                                                      | Multipart `file`, JSON `metadata`, optional replacement `id`                                |
| PATCH, DELETE | `/api/admin/gallery/[id]`                                                                                                 | Metadata edit or unreferenced-image deletion                                                |
| GET           | `/api/admin/{bookings,guests,reports,audit-logs,staff,inventory,payments}`                                                | RLS-protected operational records                                                           |
| PATCH         | `/api/admin/bookings`                                                                                                     | Allowed reservation status transitions only                                                 |
| POST          | `/api/admin/inventory`                                                                                                    | Validated maintenance block; cannot overbook inventory                                      |
| POST          | `/api/admin/staff`                                                                                                        | Group-only audited assignment of an existing Auth user                                      |

## Migrations

- Starter schema retained; corrected invalid booking-reference concatenation for fresh installations.
- Legacy hold RPC retained but its service-role execution revoked by the upgrade because it included unapproved pricing. Existing pending holds are still counted until expiry.
- New `20261124000000_integrated_platform.sql`: additive hotel/accommodation/booking fields; nearby, amenities, FAQ, approved content, media, slides, rules, detailed price history, SEO observations and distributed API limits; narrow RLS/grants; locking/quote/reservation/status/rate/staff/cancellation RPCs; auditing; Storage bucket/policies. No production inventory, photos, policies or prices are seeded.

## Pending external acceptance

No actual Supabase project or deployment was available. Hosted Auth/PostgREST/Storage tests, multiple PostgreSQL connection races, real hotel data approval, payment/sender/OTA/Google provider integrations, visual browser/mobile QA, backup restore and production rollout remain explicit external dependencies. See `production-checklist.md` and `validation-results.txt`.
