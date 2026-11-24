import Link from "next/link";
import { COMPANY, CURRENCIES, SUPPORT, TAX } from "@/lib/constants";

const foundationSteps = [
  { label: "GitHub repository", done: true },
  { label: "Next.js + Tailwind foundation", done: true },
  { label: "Firebase dev and prod projects", done: true },
  { label: "Vercel project connected", done: true },
  { label: "Custom domain", done: false },
  { label: "Recolored logo + favicon", done: true },
  { label: "Payment provider accounts", done: false },
];

const releaseModules = [
  "Private single-company workspace",
  "Roles and permissions",
  "Chart of accounts",
  "Customers and suppliers",
  "Products and barcode/SKU",
  "Vouchers and reversals",
  "Stock by location",
  "Client-branded invoices",
  "Ghana VAT, NHIL and GETFund",
  "GHS, USD and NPR",
  "Financial and tax reports",
  "Append-only audit log",
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-surface">
      <header className="border-b border-navy/10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="brand-gradient flex size-10 items-center justify-center rounded-xl text-xl font-black text-white">
              q
            </span>
            <div>
              <p className="text-lg leading-none font-extrabold tracking-tight text-navy">
                {COMPANY.brandName}
              </p>
              <p className="mt-1 text-[10px] tracking-[0.2em] text-navy/60 uppercase">
                Tally System
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy transition hover:border-brand hover:text-brand"
            >
              Sign in
            </Link>
            <a
              href={SUPPORT.whatsappUrl}
              className="rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy transition hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              WhatsApp support
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
        <div className="glass-panel rounded-3xl p-8 sm:p-12">
          <p className="text-sm font-bold tracking-[0.25em] text-brand uppercase">
            Ghana-first accounting SaaS
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl leading-tight font-black tracking-tight sm:text-6xl">
            Tally that fits how Ghana business actually works.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-navy/70">
            {COMPANY.tagline} Built for non-technical staff and accountants —
            with client-branded invoices, stock control and GRA-ready tax lines.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="brand-gradient rounded-full px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {CURRENCIES.map((currency) => (
              <span
                key={currency}
                className="rounded-full bg-navy px-4 py-2 text-sm font-bold text-white"
              >
                {currency}
              </span>
            ))}
            <span className="rounded-full border border-brand/40 px-4 py-2 text-sm font-bold text-brand">
              VAT {(TAX.vatRate * 100).toFixed(0)}%
            </span>
            <span className="rounded-full border border-brand/40 px-4 py-2 text-sm font-bold text-brand">
              NHIL {(TAX.nhilRate * 100).toFixed(1)}%
            </span>
            <span className="rounded-full border border-brand/40 px-4 py-2 text-sm font-bold text-brand">
              GETFund {(TAX.getfundRate * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-navy/10 bg-white p-6">
            <h2 className="text-xl font-bold text-navy">Foundation checklist</h2>
            <ul className="mt-5 space-y-3">
              {foundationSteps.map((step) => (
                <li key={step.label} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-navy/80">{step.label}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      step.done
                        ? "bg-brand/15 text-brand"
                        : "bg-warning/20 text-navy/60"
                    }`}
                  >
                    {step.done ? "Ready" : "Next"}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-navy/10 bg-white p-6">
            <h2 className="text-xl font-bold text-navy">First paid release</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {releaseModules.map((module) => (
                <span
                  key={module}
                  className="rounded-lg bg-surface px-3 py-2 text-xs font-semibold text-navy/70"
                >
                  {module}
                </span>
              ))}
            </div>
          </section>
        </div>
      </section>

      <footer className="mt-auto border-t border-navy/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-8 text-xs text-navy/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {COMPANY.legalName} · Reg {COMPANY.registrationNumber} · TIN{" "}
            {COMPANY.tin}
          </p>
          <p>Powered by quikpack · Support {SUPPORT.whatsappNumber}</p>
        </div>
      </footer>
    </main>
  );
}
