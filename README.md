# quikpack Tally

Ghana-first SaaS accounting, inventory and invoicing system for SMEs and franchises.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Checks

```bash
npm run lint
npm run build
npm run typecheck
```

## Project links

- [Build plan](docs/BUILD_PLAN.md)
- [Locked decisions](docs/DECISIONS.md)
- [GitHub](https://github.com/legendarylaure-byte/quikpack-tally)

## Current foundation

- Next.js App Router + TypeScript + Tailwind CSS.
- QUIKPACK brand tokens and recolored text logo/favicon.
- Health endpoint: `/api/health`.
- CI workflow for lint and build.
- Environment template for Firebase and payment providers.

## What is not built yet

Auth, Firebase data, tenants, vouchers, inventory, invoicing, reports, subscriptions and payment webhooks are roadmap items. See `docs/BUILD_PLAN.md`.

## Legal

S M QUIKPACK GLOBAL LIMITED COMPANY · Reg CS220561026 · TIN C0068105959
