# Architecture

The existing Next.js App Router application retains its routes and visual system. Default mode reads Supabase; `NEXT_PUBLIC_DEMO_MODE=true` explicitly selects the preserved browser-local demonstration. No demo record is imported as real business data.

## Data path

Public server components read through `src/lib/server/catalog.ts`, using the anon key and RLS. Uncached queries serve published properties, rooms, media and approved content. Client search/checkout use same-origin Next.js APIs. These validate inputs with `src/lib/platform.ts`; the service role is restricted to server-only quote/reservation/access/rate-limit operations. Staff reads and writes carry the verified user's JWT, retaining RLS and `auth.uid()` for auditing.

`src/lib/server/db.ts` verifies Supabase `/auth/v1/user` on the server instead of trusting a client-supplied user/role. Active assignments are queried for every privileged request. Tokens are HttpOnly/SameSite cookies, secure on production HTTPS. The Next.js pre-render proxy verifies staff, refreshes expired sessions and redirects unauthorized requests before streaming; admin layouts also verify sessions; APIs independently check permissions. Session refresh is available without browser storage of tokens.

## Existing schema, extended

`hotels` and `room_types` remain the property/accommodation source of truth. Apartments add an explicit category and validated BHK/bedroom counts; traditional rooms are preserved. `bookings` and `booking_items` retain historical amounts and nightly snapshots. New child tables use hotel foreign keys and composite room/media relationships to prevent cross-property assignment. Guest/customer directories derive from property-scoped reservation records; no competing customer master table is introduced.

New content/price/media tables use RLS. Group assignments require NULL hotel scope; property roles stay within their assigned hotel. Marketing cannot edit financial tables or read guests; front desk cannot edit rates. Direct booking/price ledger writes are revoked for anon/authenticated roles. Staff provisioning and pricing/status changes use checked RPCs.

## Transaction boundaries

Reservation creation locks an idempotency key and the accommodation row. Price edits and inventory/rule mutations use the same room-row locking discipline. A quote calculates each night using explicit override, approved season/event rule, approved weekend rule, then base rate. Tax uses approved basis points with integer rounding. No implicit weekend uplift or discounts are active in live mode.

The reservation transaction rechecks published state, dates, capacity, inventory, current total, approved payment/tax settings and all four required policies. It records confirmed/unpaid pay-at-property reservations only. Existing pending holds are counted while unexpired; this release does not create unpaid payment holds or simulate gateway success. Duplicate retries return the existing reservation; changed payloads conflict. Historical totals/nightly rates/policy acceptance are retained. Staff cancellation preserves the ledger and releases inventory; guest cancellation is a separate audited request without refund promises.

## Content and assets

Approved text is rendered as escaped paragraphs, never arbitrary HTML. Carousel CTAs are internal paths. Maps render only verified coordinates or an explicitly supplied Place ID (with an authorized Embed key). Missing data produces content-required states. Nearby distances/time fields are nullable and require a verification source. Uploaded JPEG/PNG/WebP files have size/signature/MIME checks and property-folder Storage permissions. Logos preserve proportions. Public bucket file URLs are not confidential; unpublished metadata is hidden, not the underlying object URL.

## Freshness, limits and SEO

Database APIs and catalog queries use `no-store`; the root layout is dynamic so setup-state builds cannot cache business data. Search refreshes every 30 seconds while visible and on focus. Checkout always recalculates in PostgreSQL. API quotas use a database counter, not an ephemeral in-process map. Canonicals, dynamic sitemap and real-data Hotel JSON-LD are provided; indexing is opt-in and reviews/ratings are never invented.

## Verification boundary

PGlite tests execute the actual PostgreSQL migrations, policies and functions, with Auth/Storage infrastructure fixtures. DOM tests execute the real carousel component. Neither proves hosted GoTrue/Storage operation, browser layout, or cross-connection locking under production traffic. Those require the staging checks in `production-checklist.md`.
