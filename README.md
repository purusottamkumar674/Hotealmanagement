# Flower Inn & Petal Inn — Next.js Hotel Platform Preview

**A substantial, responsive Next.js frontend implementation** of the 23 November 2026 SOW for Flower Inn & Petal Inn. The ZIP includes the public website, working browser-local reservation demo, dynamic daily pricing preview, admin workspace, an initial PostgreSQL/Supabase schema, tests and production handover notes.

> **IMPORTANT: THIS IS NOT A PRODUCTION BOOKING SYSTEM.** This release is an interactive **frontend-first prototype**. Sample bookings and rate overrides are stored in **localStorage** on the same browser only. Authentication, real inventory, cross-device synchronization, payment, approved hotel data, channel-manager synchronization and Google API connections are **not active**. Never use it to accept real guest reservations or personal data.

## Quick start — Windows PowerShell

1. Extract the ZIP (e.g. to `C:\projects\flower-petal-hotel`).
2. Open the extracted folder in VS Code.
3. In VS Code Terminal / PowerShell, run:

```powershell
node -v
npm install
Copy-Item .env.example .env.local
npm run dev
```

4. Open **http://localhost:3000**.
5. Open **http://localhost:3000/admin** for the admin preview.

Use Node.js **20.9 or newer** (Node 22 LTS recommended). Internet access is required for the initial `npm install` and remote illustrative Unsplash images/Google Fonts.

### Commands

```powershell
npm run dev        # local dev server
npm run build      # production compilation (run after npm install)
npm run start      # serve compiled app
npm run typecheck  # TS checks
npm run lint       # lint (Next ESLint config)
npm run test:logic # pricing/date unit tests
```

### Important build verification disclosure

The source package has been statically parsed for TypeScript/TSX syntax and seven pure pricing/date tests were executed. **The Next.js production build was not run when this ZIP was created because the isolated build environment could not reach the npm registry to install dependencies.** After extracting, run `npm install`, `npm run typecheck`, and `npm run build` in your own environment. Report any tool-version issues in your environment and pin compatible package versions as needed.

## What you can actually do in the preview

| Area | Implemented in preview | Persistence |
|---|---|---|
| Home, hotels, rooms, room details, gallery, FAQ, policies | Responsive Next.js pages | Static sample data |
| Property selector + check-in/check-out + guest count | Working inputs and navigation | URL parameters |
| Search available rooms | Filters demo inventory by property/date/guest count | Browser demo data |
| Checkout and booking confirmation | Validates and saves test booking; no payment | Browser localStorage |
| Booking reference lookup | Requires matching reference and email in same browser | Browser localStorage |
| Multi-hotel admin overview | Live stats based on sample + test data | Browser localStorage |
| Bookings management | Filter, CSV export, change status | Browser localStorage |
| Daily pricing | Date-range INR override; rate appears in customer search | Browser localStorage |
| Inventory blocking | Block units by room type and date | Browser localStorage |
| Availability calendar | 14-day overview | Browser localStorage |
| Payment management preview | Sample "mark paid" state; never charges money | Browser localStorage |
| Reviews worklist | Draft replies and mark handled manually | Browser localStorage |
| Review QR | Generate QR after entering approved review URL | Browser localStorage |
| Local SEO | Worklist and targets; no fabricated rankings | Browser localStorage |
| CMS | Edit homepage hero text and see change | Browser localStorage |
| Reports | Booking summaries and CSV | Browser localStorage |
| Staff, integrations, refunds | Clearly labeled implementation-ready screens | Documentation only |
| Backend database | Starter migrations for Supabase | Not connected or deployed |

**Testing the connected pricing UI:** Open `/admin/pricing`, select Flower Inn / Classic Room, change a future date's rate, save. Return to the public `/search` page, choose that hotel and the matching date range. The frontend recalculates the quote using your override.

**Testing booking flow:** Open `/search`, choose dates, click **Choose room**, enter **test** name/email/phone, accept the demonstration notice and click **Confirm demo booking**. The confirmation and `/admin/bookings` should show your new test record. This has **not** reserved a real room.

**Resetting:** `/admin/settings` → **Reset demo data**.

## Website routes

- `/` Home
- `/hotels` Two-property listing
- `/hotels/flower-inn` and `/hotels/petal-inn`
- `/hotels/[hotelSlug]/rooms/[roomSlug]`
- `/rooms`, `/search`, `/checkout`, `/booking/confirmation/[reference]`, `/booking/manage`
- `/about`, `/amenities`, `/offers`, `/gallery`, `/contact`, `/faq`
- `/policies`, `/terms-and-conditions`, `/privacy-policy`, `/cancellation-policy`
- `/account`, `/account/bookings`, `/account/profile`
- `/login`, `/signup`, `/forgot-password` — deliberately **disabled until auth is connected**
- `/admin`, `/admin/hotels`, `/admin/rooms`, `/admin/inventory`, `/admin/calendar`, `/admin/pricing`, `/admin/bookings`, `/admin/guests`, `/admin/payments`, `/admin/refunds`, `/admin/reviews`, `/admin/seo`, `/admin/reports`, `/admin/cms`, `/admin/offers`, `/admin/gallery`, `/admin/staff`, `/admin/notifications`, `/admin/integrations`, `/admin/audit-logs`, `/admin/settings`
- `/api/health` preview health/info endpoint; `/api/demo/catalog` read-only illustrative sample catalog

## Architecture in this ZIP

- `src/app/` — Next.js App Router pages and read-only example routes
- `src/components/` — public UI, booking components and admin screens
- `src/lib/catalog.ts` — clearly marked sample hotel and room data
- `src/lib/dates.ts` and `src/lib/pricing.ts` — date/rate calculations
- `src/lib/demo-store.ts` — **browser-only** demo bookings, rate overrides, inventory blocks, CMS, audit trail
- `supabase/migrations/` — **not applied** starter schema with RLS and a **service-role-only** booking RPC designed for later backend integration
- `tests/` — pricing/date tests
- `docs/` — architecture, scope gap and production checklists

## Required client information not provided by the SOW

1. Verified hotel addresses, phone numbers, business names, official logos and licensed photography
2. Physical room inventory, capacity, real room types, amenities, room descriptions
3. Approved room rates, VAT/GST applicability, pricing floors/ceilings, promotional and seasonal rules
4. Actual cancellation/refund/checkout policies and legal/privacy documents
5. Google Business Profile IDs/owner access, approved review URLs, local keywords
6. Approved channel manager vendor + API documentation/credentials + OTA mappings
7. Payment merchant/provider and integration credentials
8. Website domain, hosting, DNS, sender email, messaging consent and accounts
9. Deployment, backup, retention and data-access requirements

## How to make it a **real production system**

Do **not** use the browser data store as a backend. Work through `docs/production-checklist.md`:

1. Create Supabase projects and apply/review the SQL migrations (adjust to actual operations).
2. Implement server-side API clients + Supabase Auth + per-property RLS, and *test* account provisioning.
3. Replace the local booking flow with the transaction-safe database booking RPC and a payment/confirmation lifecycle.
4. Add an expiring hold cleanup strategy, webhook verification, idempotency, rate locking and reconciliation tests.
5. Connect hotel inventories/rates from approved source systems and channel manager.
6. Configure real Google API and review workflows, with no fabricated metrics or reviews.
7. Replace all placeholder photos/location/contact/pricing/policies with approved content.
8. Run full automated and manual UAT, vulnerability review, backup/restore drill and production rollout.

### Design note

Fonts use public Google Fonts when online; images are intentionally remote illustrative Unsplash assets. When deploying, replace these with verified hotel-owned media, or appropriate licensed local assets, and configure optimization and caching.

### Scope note

The SOW covers reputation, Google Maps ranking activities, one connected website and daily pricing. The longer Master Prompt requests additional features (customer accounts, refunds, detailed staff RBAC, etc.). These are modeled in the preview where feasible; real operation is separate work. Third-party licence fees, paid ads and photography are excluded by the original SOW unless separately contracted.

**No real hotel customer details should be entered until the secure backend is operational.**
