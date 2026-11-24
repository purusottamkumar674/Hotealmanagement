# Production checklist

## Required inputs

- [ ] Supabase staging and production projects, migration history and backups inspected.
- [ ] URL/anon/service-role settings and stable random booking-access secret installed in environment settings.
- [ ] Existing database inspected before applying the additive migration; no starter replay or destructive reset.
- [ ] Flower Inn and Petal Inn names, inventory, actual accommodation categories, occupancy and approved rates entered separately.
- [ ] Official licensed photography/logos, alt text, verified addresses, coordinates/Place IDs, contacts, amenities and nearby verification sources supplied.
- [ ] All four policies approved and published per hotel; actual check-in/out and tax treatment approved.
- [ ] Pay-at-property explicitly approved before enabling reservations. Online payment remains unavailable until a real provider integration is implemented and verified.
- [ ] Staff Auth accounts provisioned; group/property role assignments reviewed.

## Staging acceptance

- [ ] Run typecheck, lint, all tests and production build using deployment environment versions.
- [ ] Verify real Supabase sign-in, session refresh, expiry, logout and revoked assignments.
- [ ] Verify Flower staff cannot access Petal drafts, inventory, guest records or write APIs, including direct PostgREST attempts.
- [ ] Verify marketing cannot edit financial data or read guests; front desk cannot change prices.
- [ ] Upload, replace and delete real test photos/logos through Storage; verify referenced-image protection and cleanup failures.
- [ ] Edit 1/2/3 BHK daily prices for each hotel, then confirm the updated public search and final checkout totals on separate devices.
- [ ] Verify weekday/weekend/season/event overlaps, inclusive bulk ranges, history actors/reasons and no unintended discount stacking.
- [ ] Stress the last available unit from multiple independent PostgreSQL connections / API clients. Confirm a single reservation and immutable historical totals.
- [ ] Exercise retry/idempotency conflicts, stale-price rejection, expired legacy holds, inventory reductions/blocks and cancellation status transitions.
- [ ] Verify booking reference/private access retrieval and denial without the token; no public enumeration or PII leakage.
- [ ] Verify required-policy, tax and payment configuration gates and tax rounding against management-approved rules.
- [ ] Check responsive layout, keyboard-only use, carousel pause/visibility/reduced motion, screen-reader labels, maps, gallery, forms and real image performance in an actual browser.
- [ ] Configure trusted forwarded-IP handling, request-size limits and provider/WAF abuse protections for the chosen host.
- [ ] Verify backups/restore, logging/monitoring, retention, privacy requests and incident ownership.

## Deployment

- [ ] Existing repository deployed using Next.js server support, not static export. Use Node 22+ and the correct project root.
- [ ] Deployment-specific exact HTTPS origin set; cookies require HTTPS in production.
- [ ] Demo mode false; secrets stored only in server environment; no real business data in browser-only demo stores.
- [ ] Health endpoint verifies database reachability; actual booking acceptance tested separately.
- [ ] Approved canonical domain/DNS/HTTPS and Supabase API restrictions configured.
- [ ] Keep indexing off until launch approval, then verify robots, sitemap, canonicals and schema with real content.
- [ ] Real Google/OTA/payment/refund/email/SMS integrations receive their own credentials, authorization, implementation and acceptance testing before any claims of activation.
- [ ] Record rollback steps that restore the prior application version without deleting reservation/audit history.
