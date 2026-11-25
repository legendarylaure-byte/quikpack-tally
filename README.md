# quikpack Tally

Ghana-first accounting, inventory and invoicing system for one private company workspace.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Fill `.env.local` with the dev Firebase web config and the server credentials described in `docs/FIREBASE_SETUP.md`.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Access model

This is an invite-only, single-company system. There is no public signup or onboarding.

- Fixed company: `quikpack-main`
- Only an administrator can create users, assign roles, grant feature access and suspend accounts.
- Users receive a Firebase password setup link by email (Resend).
- Firestore rules deny all client-side writes; admin actions run through protected server routes using the Firebase Admin SDK.
- Roles: `admin`, `accountant`, `cashier`, `viewer`, `auditor`.

## First administrator

The first admin must be bootstrapped once per Firebase project:

```bash
FIREBASE_SERVICE_ACCOUNT_JSON="$(cat path/to/service-account.json)" \
  npm run bootstrap:admin -- phuyal.shekhar@gmail.com
```

The script sets the `admin` custom claim, seeds `companies/quikpack-main`, creates the owner membership and prints a password setup link. Sign out and back in after setting the password.

## Project links

- [Build plan](docs/BUILD_PLAN.md)
- [Locked decisions](docs/DECISIONS.md)
- [Firebase setup](docs/FIREBASE_SETUP.md)
- [GitHub](https://github.com/legendarylaure-byte/quikpack-tally)

## Firebase environments

| Environment | Project ID |
|---|---|
| Dev | `quikpack-tally-dev-787fd` |
| Prod | `quikpack-tally-prod` |

Deploy dev rules:

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes --project dev
```

Deploy prod rules only after the dev flow has been tested.

## Included modules

- Company settings, branches, currencies, fiscal calendar and effective-dated Ghana tax rates.
- Chart of accounts, parties/custom fields, items/SKU/barcode and Everpack catalogue import.
- Balanced vouchers with reversal records and branch tags.
- Stock by item/location with batch/expiry fields, FIFO/weighted valuation and low-stock alerts.
- Client-branded invoices with separate VAT/NHIL/GETFund lines and PDF download.
- Dashboard, P&L, trial balance, balance sheet, VAT, AR/AP, stock, cashflow, ledger and day book reports.
- JSON/CSV export, append-only audit log, data deletion requests and manual payment proofs.
- Optional TOTP authenticator enrollment, command bar, floating quick action and installable PWA shell.

## Current foundation

- Next.js App Router + TypeScript + Tailwind CSS.
- QUIKPACK brand tokens, logo and favicon.
- Health endpoint: `/api/health`.
- GitHub Actions CI for lint, typecheck, tests and build.
- Firebase web client; attachments are URL references only (no Cloud Storage on Spark).
- Locked Firestore rules for the single company workspace.
- Ghana VAT/NHIL/GETFund calculation module with tests.
- Email/password login with approval and suspension gating.
- Admin-only user management with role and feature permissions.
- Resend invite emails with Firebase password setup links.

## What is not built yet

Provider-hosted Paystack/Flutterwave/Stripe checkout and webhook reconciliation, Cloud Storage attachment uploads, barcode scanning, Tally migration, AI entry, recurring invoices, full bank reconciliation and native mobile apps remain later phases. See `docs/BUILD_PLAN.md`.

## Legal

S M QUIKPACK GLOBAL LIMITED COMPANY · Reg CS220561026 · TIN C0068105959
