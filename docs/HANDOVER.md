# Handover checklist

Last updated: 2026-11-26

## Current state

- Release branch: `main` at `5595bfc`. All feature branches, including `feat/dev-demo-data`, are merged into `main` and pushed to GitHub.
- Production is served from `main`; aliases are `tally.vyomai.cloud` and `quikpack-tally.vercel.app`. The deployment promoted on 2026-11-26 was `dpl_EKhGTUpBeNguJjxgB6CanXRbbyv2`. Later doc-only pushes create a new deployment ID — check Vercel for the active one.
- Demo preview: `https://quikpack-tally-gw147yfkn-shekhar-phuyals-projects.vercel.app`, built from `main` on 2026-11-26. Preview URLs change on each push and use the dev Firebase project.
- Preview SSO protection is **on**. The client walkthrough is presented from an already-signed-in browser; do not send the preview link to the client.
- Demo users are dev-only. Credentials were shared separately and must not be reused in production.
- Production Firebase is `quikpack-tally-prod`; dev Firebase is `quikpack-tally-dev-787fd`.
- The demo seed script is committed but has **not** been run against production. Never run `npm run seed:demo` against production.
- Firebase Firestore rules and indexes deployed to both dev and prod on 2026-11-26. `firebase.json` no longer includes Storage rules; both projects stay on Spark with no Cloud Storage bucket.
- Vercel Development environment now has the full set of public Firebase config variables. Preview and Production were already configured.

## Included in the release and demo

- QUIKPACK branding and marketing site.
- Five roles: admin, accountant, cashier, viewer and auditor.
- Role-aware dashboard with plain-language guidance and empty-workspace behaviour.
- 372 PDF-derived Everpack SKUs, 24 stock rows and stock movements in dev only.
- CSV import for items and parties with upsert by SKU/name.
- Everpack catalogue import, vouchers, invoices, inventory, reports, audit log and JSON/CSV export.
- Optional TOTP enrollment with a scannable QR code and manual key fallback.
- Client demo materials in `docs/CLIENT_DEMO_SCRIPT.md`, `docs/client-demo-slides.html` and `docs/CLIENT_DEMO_HANDOUT.md`.

## QA completed

- `npm run lint`, `npm run typecheck`, `npm test` (44 tests) and `npm run build` passed on 2026-11-26.
- Production route smoke on `tally.vyomai.cloud`: `/api/health`, `/login`, `/dashboard`, `/inventory`, `/reports`, `/products`, `/manifest.webmanifest` and `/sw.js` all returned `200`.
- Firestore rules compile; unauthenticated reads are denied in both Firebase projects.
- Protected endpoints and imports return `401` without a token; viewer role returns `403` for imports.
- Valid CSV imports returned `201`; re-imports updated existing records instead of duplicating them. QA records were deleted afterwards.
- Invoice PDF returned `200` and contains VAT, NHIL, GETFund and `Powered by quikpack`.
- Mobile layout at `390×844`: no horizontal overflow on dashboard, masters, inventory, reports or settings; no unnamed buttons or unlabeled fields; zero browser console errors.
- Active business documents carry `companyId=quikpack-main`. Audit logs are company-path scoped but do not carry a `companyId` field; acceptable for this single-workspace MVP, revisit before multi-tenant.

## Open items before client sign-off

1. Client confirms the demo in writing and lists any changes.
2. Supply real company profile, branches, fiscal period and currencies.
3. Supply and verify chart of accounts, parties, items, prices and tax categories.
4. Supply opening balances.
5. Run one real transaction cycle and confirm reports reconcile.
6. Export a full backup and retain it with the client.
7. Accountant/GRA sign-off on VAT, NHIL and GETFund treatment.
8. Decide the production MFA recovery/owner procedure.

## Blocked on credentials or confirmation

- Monitoring: needs a Sentry DSN, or approval to use structured Vercel logging only.
- Subscription checkout: needs Paystack test keys; Flutterwave optional; Stripe only after Ghana eligibility is confirmed.
- Webhook reconciliation and idempotency tests need provider test keys.
- Client-invoice payment links remain Phase 2.

## Close-out steps after the demo

1. Keep Preview SSO protection on; no action needed.
2. Rotate or delete the five demo users and replace the shared demo password.
3. Confirm production is served from `main` and the active deployment is Ready before further changes.
4. Apply the client's written change requests, then redeploy from `main`.
5. Decide the production MFA recovery/owner procedure.

## Known risks

- Production was promoted on owner instruction before written client sign-off. Written confirmation is still outstanding.
- Item names, pack sizes and prices came from a column-mangled PDF; accountant confirmation is required.
- Ghana tax rates use built-in defaults because the tax-rates collection is empty; GRA/accountant sign-off is required.
- Lost production MFA requires a Firebase-admin reset; no self-service recovery-code flow exists.
- The demo preview is behind Vercel SSO and is for screen sharing only.
