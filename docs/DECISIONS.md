# QUIKPACK Tally — Locked Decisions

Last confirmed: 2026-11-24

## Company and legal identity

- Vendor: QUIKPACK.
- Legal name: `S M QUIKPACK GLOBAL LIMITED COMPANY`.
- Registration number: `CS220561026`.
- TIN: `C0068105959`.
- Incorporated under Companies Act 2019, Act 992, Republic of Ghana.
- Incorporation date: 17 October 2026, Accra.
- Liability: limited.
- Support WhatsApp: `+233592810728`.

Use the legal identity on QUIKPACK subscription invoices, terms, receipts and legal footers. Client-created sales invoices use the client's own identity.

## Product

- Product name: QUIKPACK Tally System.
- Target: cloud SaaS accounting/inventory/invoicing system for SMEs, franchises and non-technical users.
- First paid release: MVP-first.
- Delivery model: one fixed, private company workspace (`quikpack-main`). No public signup, onboarding or company creation; the admin creates every user.
- Primary market: Ghana; foreign-currency display required.

## Branding

- Logo wordmark: `quikpack`.
- Tagline: `PACK IT. SERVE IT. LOVE IT.`
- Logo must be redesigned/recolored to the final palette document.
- Final palette:
  - Main Green / brand primary: `#7DBD17`
  - Accent Green: `#68C924`
  - Regal Purple: `#2F1D58`
  - Vibrant Blue / info: `#011BCA`
  - Soft Gold / warning: `#FFD215`
  - Fire Red / error: `#F74028`
  - Neutral Gray / surface: `#F5F5F5`
  - Glass White: `rgba(255,255,255,0.8)`
  - Glass Green Tint: `rgba(125,189,23,0.12)`
  - Glass Shadow: `rgba(47,29,88,0.12)`
- UI style: liquid glass / glassmorphism, accessible, mobile-first.
- Client invoices: client branding primary; QUIKPACK appears only as small `Powered by quikpack`.
- Subscription invoices: full QUIKPACK legal identity.

## Currency

- Base/source currency: GHS.
- Required currencies everywhere: GHS, USD, NPR.
- Catalogue prices are currently GHS.
- Display conversion to USD/NPR must be available.
- Transaction records store currency and exchange rate snapshot.

## Catalogue

- Everpack price list approved for both:
  - demo/seed data,
  - products QUIKPACK may resell.
- Source: `Price List as 17102026 DST.pdf`, Everpack LTD, dated 17 October 2026.
- Catalogue includes SKU, barcode, description, pack, distributor PC price and box price.
- PDF text extraction is messy; full import needs cleanup before production use.

## Infrastructure

- GitHub: repo created at `https://github.com/legendarylaure-byte/quikpack-tally`.
- Vercel: planned frontend hosting.
- Firebase: planned backend.
- Custom domain: available.
- At planning confirmation time, GitHub repo existed; Vercel/Firebase projects and domain connection had not yet been created.

## Payments

- Include Paystack, Flutterwave, bank transfer, Ghana-supported mobile money options and Stripe where eligible.
- Prices stored in GHS; display/convert to USD/NPR.
- Stripe's official global page lists Ghana under `Extended network`; use as optional/international fallback until account eligibility is confirmed.
- Paystack/Flutterwave fee tables and exact method availability must be verified at account creation.

## Solo-developer constraint

Keep the implementation boring and small:

- Next.js monolith on Vercel.
- Firebase Auth and Firestore only. Both projects stay on Spark; no Cloud Functions or Cloud Storage.
- Privileged writes run in server API routes using the Firebase Admin SDK.
- No microservices.
- No plugin marketplace in first paid release.
- No AI assistant in first paid release.
- No native mobile app in first paid release.
- All accounting, inventory, invoicing and reporting features from the build plan remain in scope.
