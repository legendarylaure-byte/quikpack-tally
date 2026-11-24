# QUIKPACK Tally — First Paid Release Build Plan

This is the working build plan. It is based on every supplied document and the locked decisions in `docs/DECISIONS.md`.

## 1. Source documents reviewed

| File | Use |
|---|---|
| `FinalRequiredDoc.docx` | Master functional/technical blueprint and UX enhancement notes. |
| `Company Brand Color details.docx` | Final authoritative UI palette. |
| `Company Registration.pdf` | Legal company identity details. |
| `Company Registration.svg` | SVG wrapper for the scanned certificate; no extra text layer. |
| `companyLogo.jpeg` | Logo artwork; OCR text `quikpack`, tagline `PACK IT. SERVE IT. LOVE IT.` |
| `companyLogo.svg` | Traced vector logo; color mismatch with final palette, so logo will be re-colored. |
| `Price List as 17102026 DST.pdf` | Everpack catalogue; demo/seed and resale product source. |
| `.DS_Store` | macOS metadata; ignored. |

## 2. Blueprint coverage map

| Blueprint area | Release | Notes |
|---|---|---|
| Multi-tenancy | MVP | Every document carries `companyId`; deny cross-tenant access. |
| Auth and RBAC | MVP | Owner, Accountant, Cashier, Viewer, Auditor. |
| Optional 2FA/MFA | MVP | Firebase MFA where available; minimum optional email/password now. |
| Onboarding wizard | MVP | Company, currency, tax status, fiscal period, opening balances. |
| Sandbox/test company | MVP | Free demo workspace with Everpack sample data. |
| Excel/CSV import | MVP-lite | Items/parties import first. |
| Tally ERP migration | Phase 2 | Too risky for first paid release. |
| Company profile/settings | MVP | Logo, address, TIN, branches, fiscal calendar, currencies. |
| Branch/department | MVP | Basic branch on transactions. |
| Chart of accounts | MVP | Groups, ledgers, opening balances. |
| Parties | MVP | Customers/suppliers with tax info and limits. |
| Items/services | MVP | SKU, barcode, unit, tax category, price. |
| Tax setup | MVP | Ghana VAT/NHIL/GETFund plus generic editable tax rules. |
| Warehouse/location/batch master | MVP-lite | Location and batch fields; expiry full in Phase 2. |
| Custom fields | MVP-lite | Parties/items only. |
| Vouchers | MVP | Payment, receipt, contra, journal, sales, purchase, expense, credit/debit note. |
| Approval workflows | Phase 2 | Keep first release single-step. |
| Attachments | MVP | Store in Firebase Storage, linked to transactions. |
| Voice/text AI entry | Phase 3 | Not in first paid release. |
| Undo/reverse/cancel | MVP | Reversal entries, never silently edit posted records. |
| Multi-location stock | MVP-lite | Stock by item/location. |
| Batch/expiry tracking | Phase 2 | Data model ready in MVP. |
| Barcode/QR/NFC | MVP-lite | Barcode field; scanner support Phase 2. |
| FIFO/LIFO/weighted average | MVP | FIFO/weighted average first; LIFO Phase 2. |
| Stock adjustments | MVP | Shrinkage, damage, wastage, audit adjustment. |
| Invoice templates | MVP | One client-branded template. |
| Multi-currency/multi-tax | MVP | GHS/USD/NPR and Ghana tax lines. |
| PDF/email/WhatsApp share | MVP | PDF download + share link; email later if DNS/mail not ready. |
| Payment gateway on invoice | Phase 2 | Payment links after subscription billing is stable. |
| Recurring invoices | Phase 2 | Not MVP. |
| E-invoice/e-way bill | Phase 3 | Ghana E-VAT/QR/FED readiness only; no GRA submission in MVP. |
| Banking/accounts | Phase 2 | Bank master in MVP; reconciliation Phase 2. |
| Bank statement upload | Phase 2 | CSV first, then PDF/OFX. |
| AI bank matching | Phase 3 | Not MVP. |
| Cheque tracking | Phase 2 | Not MVP. |
| Financial reports | MVP | P&L, balance sheet, trial balance, cashflow-lite, ledgers, day books. |
| Tax reports | MVP | VAT/NHIL/GETFund summary. |
| GST/HSN/TDS | Phase 3 | Generic framework only; Ghana first. |
| Inventory reports | MVP | Stock overview, movement, low stock. |
| AR/AP aging | MVP | Required. |
| Saved report layouts | Phase 2 | Not MVP. |
| PDF/Excel export | MVP | PDF and CSV/Excel-lite. |
| AI assistant | Phase 3 | Cost/privacy review required. |
| Smart voucher autofill | Phase 3 | Not MVP. |
| Anomaly detection | Phase 3 | Not MVP. |
| Profit explanation/predictive analytics | Phase 3 | Not MVP. |
| Contextual reminders | MVP-lite | In-app only. |
| Notifications | MVP-lite | In-app + WhatsApp support contact. |
| Audit log | MVP | Append-only, role-limited viewer. |
| Region-aware compliance | MVP | Ghana first, modular rate rules. |
| Custom fields/workflows | MVP-lite/Phase 2 | Fields MVP-lite, workflow rules Phase 2. |
| Plugin system/API/webhooks | Phase 3 | Not MVP. |
| Backup/restore/export | MVP | Full export, manual restore process; scheduled backup later. |
| Encryption at rest/in transit | MVP | Firebase/HTTPS default. |
| Session/device management | MVP-lite | Firebase sessions; device reputation Phase 3. |
| Data deletion flow | MVP | Request-based deletion workflow. |
| WCAG AA+ | MVP | Keyboard, labels, contrast, reduced motion. |
| Simple/Expert mode | MVP-lite | Simple by default; expert toggle later. |
| Mobile-first/PWA | MVP | Responsive web + installable shell; full offline Phase 2. |
| Keyboard shortcuts/command bar | MVP-lite | Command bar early; shortcuts Phase 2. |
| Undo everywhere | MVP | Reversal-first model. |
| Help/tooltips/FAQ | MVP-lite | Contextual help on key forms. |
| Feedback/upvote/analytics | Phase 2 | Not MVP. |
| CI/CD | MVP | GitHub Actions + Vercel preview + Firebase deploy. |
| Monitoring | MVP | Sentry or Firebase Crashlytics/Performance. |
| Documentation | MVP | README, setup, user help skeleton. |
| Release notes/changelogs | MVP | Keep from first release. |
| Branding everywhere | MVP | Recolored logo, favicon, invoices, invites. |

## 3. MVP definition

A client is considered ready to pay when they can:

1. Sign up and create a secure company workspace.
2. Invite users with roles.
3. Set company profile, logo, TIN, currency, fiscal year and branches.
4. Import or create chart of accounts, parties and items.
5. Record sales, purchases, payments, receipts, journals and expenses.
6. Track stock by item/location and see low-stock alerts.
7. Generate a client-branded PDF invoice with GHS/USD/NPR and Ghana tax lines.
8. See dashboard, P&L, trial balance, balance sheet and VAT summary.
9. Export data.
10. See audit logs.
11. Pay QUIKPACK by Paystack/Flutterwave/bank transfer/mobile money/Stripe where eligible.
12. Use the app on desktop and mobile without cross-tenant leaks.

## 4. Architecture

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, `src/`.
- Hosting: Vercel.
- Backend: Firebase Auth, Firestore, Cloud Functions, Storage, Security Rules.
- Repo: GitHub monorepo-lite (`src/`, `functions/`, `docs/`, `scripts/`).
- Environments: dev and prod Firebase projects; Vercel preview and production.
- PDF: server-side invoice generation.
- Monitoring: Sentry or Firebase equivalent.
- Analytics: first-party privacy-safe usage counters only.

## 5. Data model

Top-level collections:

```text
companies/{companyId}
users/{uid}
companyUsers/{companyId}/users/{uid}
accounts/{companyId}/accounts/{accountId}
parties/{companyId}/parties/{partyId}
items/{companyId}/items/{itemId}
vouchers/{companyId}/vouchers/{voucherId}
stock/{companyId}/stock/{itemLocationId}
invoices/{companyId}/invoices/{invoiceId}
attachments/{companyId}/{attachmentId}
auditLogs/{companyId}/{logId}
settings/{companyId}/settings/{settingId}
exchangeRates/{rateId}
subscriptions/{companyId}
payments/{paymentId}
catalogue/{itemId}
```

Rules:

- Every tenant document includes `companyId`.
- Security Rules deny by default.
- Posted vouchers are immutable; reversals are new records.
- Invoice numbers are unique per company per fiscal year.
- Money amounts use integer minor units where practical.

## 6. Ghana tax engine

Verified from GRA VAT page: `https://gra.gov.gh/domestic-tax/vat/`

MVP rules:

- VAT: `15%`.
- NHIL: `2.5%`.
- GETFund: `2.5%`.
- COVID levy: not charged.
- Flat-rate scheme: not enabled.
- All three components calculated on the same tax-exclusive base.
- Invoice shows separate lines for NHIL, GETFund and VAT.
- Tax-inclusive invoices show total tax inclusive value.
- Rates are effective-dated and editable.
- Exempt and zero-rated categories require an evidence/reason field.
- Do not assume every napkin/tissue product is zero-rated; only apply zero-rate with supporting evidence.
- Monthly VAT/levies summary report.
- Filing deadline configuration: last working day of following month.

Risk: GRA navigation still contains stale flat-rate links; main reform text is authoritative but accountant/GRA sign-off is required before filing claims.

## 7. Multi-currency

- Source currency: GHS.
- Supported currencies: GHS, USD, NPR.
- Company has base currency and display currency.
- Each transaction stores:
  - `currency`
  - `exchangeRate`
  - `rateDate`
  - `baseAmountGhs`
- Reports can display in GHS/USD/NPR, but accounting totals remain GHS unless company base currency is changed through a controlled process.
- BoG daily interbank rate is the Ghana reference where applicable.
- NPR rate source must be chosen or manually entered.
- Checkout displays final amount before payment.

## 8. Invoicing

Client invoice:

- client logo/name/address/TIN,
- billTo and shipTo,
- item lines,
- currency and rate,
- VAT/NHIL/GETFund lines,
- total tax inclusive value,
- payment status,
- small `Powered by quikpack` mark.

QUIKPACK subscription invoice:

- full legal entity name,
- Reg No. `CS220561026`,
- TIN `C0068105959`,
- subscription plan,
- payment provider reference.

## 9. Catalogue

- Import Everpack PDF into structured CSV/JSON.
- Fields: SKU, barcode, description, pack, distributor PC price, box price, selling price, source, resellable.
- Store source prices in GHS.
- Allow display/edit in USD/NPR.
- Keep price history.
- Do not auto-reprice unless explicitly enabled.

## 10. Payments

- Primary: Paystack.
- Secondary: Flutterwave.
- Manual: bank transfer with proof upload/admin approval.
- Ghana mobile money: through provider integrations where available, otherwise manual reference.
- Stripe: optional/international; Ghana is listed as Extended network, so confirm account eligibility.
- Webhooks reconcile successful payments to subscriptions.
- Bank/mobile money manual payments require admin approval.

## 11. Subscription pricing

Base prices in GHS:

| Plan | Monthly | Yearly |
|---|---:|---:|
| Demo/Sandbox | Free | Free |
| Starter | GH₵180 | GH₵1,800 |
| Business | GH₵590 | GH₵5,900 |
| Franchise/White-label | GH₵1,800 | GH₵18,000 |
| Enterprise/Custom | From GH₵5,000/month | Custom |

Onboarding fees: GH₵300 / GH₵800 / GH₵2,000. First 10 annual clients can get onboarding waived.

## 12. UX and accessibility

- Liquid glass with final palette.
- Simple mode by default; Expert mode later.
- Floating universal `+` action.
- Command bar (`Cmd/Ctrl + K`).
- Empty states with quick actions.
- Skeleton loaders.
- Contextual help.
- Reduced-motion setting.
- Keyboard and screen-reader checks.
- Large tap targets.
- Color is never the only status indicator.

## 13. QA

Required tests:

- tax math for tax-exclusive and tax-inclusive invoices,
- VAT/NHIL/GETFund separate lines,
- multi-currency rounding and rate snapshots,
- invoice numbering uniqueness,
- tenant isolation,
- RBAC,
- reversal behavior,
- audit log completeness,
- PDF branding,
- catalogue import validation,
- payment webhook idempotency,
- mobile layout,
- accessibility basics.

## 14. Delayed beyond first paid release

AI assistant, voice entry, Tally migration, recurring invoices, payment links on client invoices, full bank reconciliation, cheque tracking, saved report layouts, plugin marketplace, API/webhooks, native mobile app, full offline mode, RTL/multilingual, direct GRA E-VAT/FED submission.

## 15. Known gaps

- Visual inspection of logo artwork not possible by this model; OCR and SVG color extraction were used.
- Everpack PDF text extraction is column-mangled; catalogue cleanup must be checked.
- Ghana tax rules verified from GRA but need accountant/GRA sign-off before filing claims.
- Paystack/Flutterwave exact current fees/availability must be confirmed at signup.
- Stripe Ghana eligibility is `Extended network`, not assumed full direct support.
- Vercel/Firebase/domain projects were not created at planning time; setup must be done.
