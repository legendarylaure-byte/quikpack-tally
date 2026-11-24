# quikpack Tally

Ghana-first SaaS accounting, inventory and invoicing system for SMEs and franchises.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Fill `.env.local` with the Firebase web config for the dev project. See `docs/FIREBASE_SETUP.md`.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Project links

- [Build plan](docs/BUILD_PLAN.md)
- [Locked decisions](docs/DECISIONS.md)
- [Firebase setup](docs/FIREBASE_SETUP.md)
- [GitHub](https://github.com/legendarylaure-byte/quikpack-tally)

## Current foundation

- Next.js App Router + TypeScript + Tailwind CSS.
- QUIKPACK brand tokens and recolored text logo/favicon.
- Health endpoint: `/api/health`.
- GitHub Actions CI for lint, typecheck, tests and build.
- Tracked environment template: `.env.example`.
- Firebase web client with optional Storage support.
- Firestore, Storage and index rules.
- Firebase project aliases: `dev` and `prod`.
- Ghana VAT/NHIL/GETFund calculation module with tests.
- Email/password signup, login and sign out.
- Owner workspace creation and company onboarding.
- Tiny logo support in Firestore until Cloud Storage is enabled.
- Role-aware Firestore rules for owner, accountant, cashier, viewer and auditor.

## Firebase environments

| Environment | Project ID |
|---|---|
| Dev | `quikpack-tally-dev-787fd` |
| Prod | `quikpack-tally-prod` |

Deploy dev rules:

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes --project dev
```

Do not deploy prod rules until emulator/rules tests are added.

## What is not built yet

Masters, vouchers, inventory, invoicing, PDF generation, reports, subscriptions, payment webhooks, audit log writes and user invitation flows are roadmap items. See `docs/BUILD_PLAN.md`.

## Legal

S M QUIKPACK GLOBAL LIMITED COMPANY · Reg CS220561026 · TIN C0068105959
