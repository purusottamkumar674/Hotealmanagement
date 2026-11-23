# Architecture and implementation boundary

## Frontend (implemented)

Next.js App Router renders public property and room pages from the sample catalog. React client components implement search, booking preview, date-by-date pricing, and admin modules. Per-room prices are derived from an illustrative base rate, 12% weekend uplift, and per-night overrides. Date comparisons use check-in inclusive / check-out exclusive.

Browser storage: `fp-hotel-demo-v3` contains demo bookings, rate overrides, blocked units, content edits and worklists. This is neither shared between users nor server-authoritative. It is inappropriate for real inventory, money, guest PII or staff roles. The admin preview is intentionally public and has **no authentication or authorization**.

## Production architecture (not yet connected)

Public website → secure Next.js APIs → Supabase Auth + PostgreSQL (RLS) → inventory/booking/payment transaction workflow.

Third-party adapters (optional/approved): payment provider, email/WhatsApp, channel manager, Google Business Profile API, analytics and local-rank provider.

### Boundary and ordering

1. Public `GET` hotel / room / price/availability endpoints may read only approved published data.
2. Browser sends requested hotel, room, dates and quantity; server recomputes prices and availability, never trusts browser quotes.
3. Server-side booking endpoint validates rate/inventory, uses a DB transaction and room-type row locking, creates a temporary hold and returns a non-guessable reference and (if approved) a payment order.
4. Payment callback is independently verified; only server-confirmed payment or approved pay-at-hotel policy transitions hold to confirmed.
5. Pending holds expire and release inventory. Payment/order reconciliation handles duplicate, late and out-of-order webhooks.
6. Staff admin endpoints require verified Supabase Auth session, role check and property-scoped authorization before mutation. All relevant actions are audited server-side.
7. OTA/channel manager uses approved API, hotel/room mapping, retry/reconciliation and external reservation ID uniqueness. No live OTA credentials exist in this preview.

### Explicit preview limitations

- Demo availability **cannot** protect against concurrent bookings across users, browsers or servers.
- Demo rate changes stay inside the current browser and are **not** published to real visitors.
- Confirming a demo reservation does **not** send email, charge a card or reserve a hotel room.
- Staff/role and customer-account screens are UI architecture only; **not secure authentication**.
- Review examples are fictional placeholders; they are **not** sourced from Google.
- Google Maps rank targets are SOW goals; no live rank measurements are claimed.

## Source references

- `SOW_Flower_Inn_Petal_Inn.pdf`, 23 November 2026, 4 pages.
- Attached Master Development Prompt from the same chat.

## Architecture choices still requiring approval

- Payment mode and gateway
- Guest auth vs guest-only bookings
- Room-level assignment vs type-level pool allocation
- Taxes and fee rules
- Hold expiry duration and cancellation/refund windows
- Channel manager vendor and mapping
- Approved hotel branding, facilities and photos
- Consent, retention and deletion requirements
