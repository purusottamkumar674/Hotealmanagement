# Production readiness — not complete

Use this checklist before any real guest booking.

## Business / client sign-off

- [ ] Verify both hotel legal names, addresses and contact details.
- [ ] Obtain approved photos, brand colors/logos and descriptions.
- [ ] Confirm room type inventory, occupancy limits, rules, operational timezone.
- [ ] Confirm rate plans, base rates, weekend, event, seasonal, minimum/maximum rates.
- [ ] Confirm applicable Indian tax rules and exact invoice language, if relevant.
- [ ] Approve check-in/out, cancellation, no-show, refund and child policies.
- [ ] Approve payment methods, merchant account, refund authority and settlement handling.
- [ ] Obtain a verified domain, booking email/SMS sender and customer support contacts.

## Engineering

- [ ] Install dependencies; run `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:logic`.
- [ ] Review and apply starter migration in a **non-production** Supabase project first.
- [ ] Implement secure server data layer instead of `src/lib/demo-store.ts`.
- [ ] Implement Supabase Auth, robust admin onboarding, property-scoped RLS and permission tests.
- [ ] Build REST/Server Action booking hold and confirmation lifecycle, idempotency and expiry cleanup.
- [ ] Add verified payment-order creation, webhooks, refund and reconciliation logic.
- [ ] Test concurrent last-room booking attempts (must never oversell).
- [ ] Add multiple room booking, modifications, checkout/no-show and inventory blocks in the backend.
- [ ] Integrate genuine prices/inventory and rate parity through approved channel manager.
- [ ] Implement separate rate plans, rules and audit history; preserve booking snapshots.
- [ ] Configure Resend/SMTP/WhatsApp provider with authorized templates and consent checks.
- [ ] Add operational observability, alerts, backups/restore tests, emergency procedures.
- [ ] Remove localStorage PII and protect all booking details via authentication or OTP.
- [ ] Run WCAG/accessibility, load, payment, vulnerability and full UAT testing.

## Marketing / SEO

- [ ] Confirm both Google Business Profile identities and authorized access.
- [ ] Verify NAP consistency, unique page metadata, real geodata and Hotel schema.
- [ ] Obtain approved review links; deploy QR signage and genuine post-checkout invitation flow.
- [ ] Configure Google API/legitimate rank-tracking provider, source fields and timestamps.
- [ ] Implement verified performance reports; no invented reviews, ratings or Google ranking promises.
- [ ] Add GA4, consent controls and Google Search Console after production domain verified.

## Legal / policy

- [ ] Replace draft policy pages with client-approved legal text.
- [ ] Document privacy, consent, retention, data export/delete rights and DPA.
- [ ] Confirm third-party license fees and SOW out-of-scope exclusions.

## Go-live acceptance

- [ ] Both properties tested independently and cross-linked.
- [ ] Final invoice amounts and payment milestones signed off.
- [ ] Actual booking can be independently verified in backend and hotel ops.
- [ ] A booking is never confirmed solely from a frontend success state.
- [ ] Manual/OTA reservations cannot cause overbooking.
- [ ] Server-side price overrides propagate reliably and are auditable.
- [ ] End-to-end refund + cancellation process verified against client policy.
- [ ] No fake live metrics, reviews or photos are displayed.
