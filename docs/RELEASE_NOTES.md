# Release notes

## 0.1.0 — first paid-release build

- Invite-only single workspace `quikpack-main` with admin-managed users and roles.
- Company profile, branches, GHS/USD/NPR settings, fiscal calendar and effective-dated Ghana tax rates.
- Masters, voucher posting/reversals, stock movements and client-branded invoices with PDF.
- Financial, tax, inventory, aging, ledger and day book reports; JSON/CSV export and audit log.
- Manual subscription payment proofs, data deletion requests and optional TOTP enrollment.
- Responsive installable web shell with command bar and quick actions.

## Demo-branch updates — 2026-11-25

- TOTP enrollment now renders a scannable SVG QR code with a manual key fallback.
- Dev-only demo seed script loads PDF-derived Everpack items, stock and five role users.
- CSV import for items and parties, with upsert by SKU/name and validation.
- Import permissions now accept role admins as well as custom-claim admins and accountants.
- Final QA: invoice PDF branding, mobile layout, tenant tagging, RBAC and audit-log checks.

Demo-branch work has not been merged to `main` or deployed to production. Monitoring and hosted payment checkout/webhooks remain blocked on credentials.

Deferred to later phases: provider payment webhooks, Cloud Storage uploads, barcode scanning, AI entry, Tally migration, recurring invoices, full bank reconciliation and native mobile apps.
