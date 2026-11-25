# Handover checklist

Last updated: 2026-11-25

## Current state

- Working branch: `feat/dev-demo-data`.
- Current Preview URL is provided in the handover chat; Preview URLs change on each branch push.
- Production is unchanged at `dpl_HvZtGvvr8rjnPSxyr4VugdngooiA`; custom domains are `tally.vyomai.cloud` and `quikpack-tally.vercel.app`.
- Nothing from the demo branch has been merged to `main`.
- Preview SSO protection is temporarily disabled for client review. Production custom-domain access is unaffected.
- Demo users are dev-only. Credentials were shared separately and must not be reused in production.

## Included in the demo

- QUIKPACK branding unchanged.
- Five roles: admin, accountant, cashier, viewer and auditor.
- 372 PDF-derived Everpack SKUs, 24 stock rows and stock movements.
- CSV import for items and parties with upsert by SKU/name.
- Everpack catalogue import, vouchers, invoices, inventory, reports, audit log and JSON/CSV export.
- Optional TOTP enrollment with a scannable QR code and manual key fallback.

## QA completed

- `npm run typecheck`, `npm run lint`, `npm test` (30 tests) and `npm run build`.
- Preview route smoke: `/api/health`, `/login`, `/masters`, `/inventory`, `/reports`, `/manifest.webmanifest` and `/sw.js` returned `200`.
- Protected endpoints and imports return `401` without a token; viewer role returns `403` for imports.
- Valid CSV imports returned `201`; re-imports updated existing records instead of duplicating them. QA records were deleted afterwards.
- Invoice PDF returned `200` and contains VAT, NHIL, GETFund and `Powered by quikpack`.
- Mobile layout at `390×844`: no horizontal overflow on dashboard, masters, inventory, reports or settings; no unnamed buttons or unlabeled fields; zero browser console errors.
- Active business documents carry `companyId=quikpack-main`. Audit logs are company-path scoped but do not carry a `companyId` field; acceptable for this single-workspace MVP, revisit before multi-tenant.

## Open items before production

1. Client confirms the demo in writing and lists any changes.
2. Supply real company profile, branches, fiscal period and currencies.
3. Supply and verify chart of accounts, parties, items, prices and tax categories.
4. Supply opening balances.
5. Run one real transaction cycle and confirm reports reconcile.
6. Export a full backup and retain it with the client.
7. Accountant/GRA sign-off on VAT, NHIL and GETFund treatment.
8. Explicit written approval to promote to production.

## Blocked on credentials or confirmation

- Monitoring: needs a Sentry DSN, or approval to use structured Vercel logging only.
- Subscription checkout: needs Paystack test keys; Flutterwave optional; Stripe only after Ghana eligibility is confirmed.
- Webhook reconciliation and idempotency tests need provider test keys.
- Client-invoice payment links remain Phase 2.

## Close-out steps after the demo

1. Re-enable Preview SSO protection: `vercel project protection enable quikpack-tally --sso`.
2. Rotate or delete the five demo users and replace the shared demo password.
3. Confirm production still points at the approved deployment before merging.
4. Only after written approval: merge `feat/dev-demo-data` to `main`, deploy production and repeat smoke QA.
5. Decide the production MFA recovery/owner procedure.

## Known risks

- Preview access is temporarily open and the demo password is shared.
- Item names, pack sizes and prices came from a column-mangled PDF; accountant confirmation is required.
- Ghana tax rates use built-in defaults because the tax-rates collection is empty; GRA/accountant sign-off is required.
- Lost production MFA requires a Firebase-admin reset; no self-service recovery-code flow exists.
