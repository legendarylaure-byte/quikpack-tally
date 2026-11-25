"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { SignOutButton } from "@/components/sign-out-button";
import { apiFetch } from "@/lib/api-client";
import { COMPANY, TAX } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/money";
import { FEATURES } from "@/lib/permissions";

const LINKS: Array<{ href: string; label: string; feature: (typeof FEATURES)[number]["key"] }> = [
  { href: "/masters", label: "Masters", feature: "masters" },
  { href: "/vouchers", label: "Vouchers", feature: "vouchers" },
  { href: "/inventory", label: "Inventory", feature: "inventory" },
  { href: "/invoices", label: "Invoices", feature: "invoicing" },
  { href: "/reports", label: "Reports", feature: "reports" },
  { href: "/settings", label: "Settings", feature: "settings" },
];

function DashboardContent() {
  const { user, membership, isAdmin, can } = useAuth();
  const [stats, setStats] = useState({
    accounts: 0,
    parties: 0,
    items: 0,
    vouchers: 0,
    invoices: 0,
    stockAlerts: 0,
    overdueInvoices: 0,
    salesMinor: 0,
  });
  const [company, setCompany] = useState<{ displayName: string; baseCurrency: string } | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) {
      return;
    }
    try {
      const token = await user.getIdToken();
      const [accounts, parties, items, vouchers, invoices, stock, settings] = await Promise.all([
        apiFetch<{ items: unknown[] }>(token, "/api/data/accounts"),
        apiFetch<{ items: unknown[] }>(token, "/api/data/parties"),
        apiFetch<{ items: unknown[] }>(token, "/api/data/items"),
        apiFetch<{ items: Array<{ totalDebitMinor?: number }> }>(token, "/api/vouchers"),
        apiFetch<{ items: Array<{ totalMinor?: number; status?: string; dueDate?: string }> }>(token, "/api/invoices"),
        apiFetch<{ items: Array<{ quantity?: number; reorderLevel?: number }> }>(token, "/api/data/stock"),
        apiFetch<{ items: Array<Record<string, unknown>> }>(token, "/api/data/settings"),
      ]);
      setStats({
        accounts: accounts.items.length,
        parties: parties.items.length,
        items: items.items.length,
        vouchers: vouchers.items.length,
        invoices: invoices.items.length,
        stockAlerts: stock.items.filter(
          (row) => Number(row.quantity ?? 0) <= Number(row.reorderLevel ?? 0),
        ).length,
        overdueInvoices: invoices.items.filter(
          (invoice) =>
            invoice.status === "sent" &&
            !!invoice.dueDate &&
            invoice.dueDate < new Date().toISOString().slice(0, 10),
        ).length,
        salesMinor: invoices.items
          .filter((invoice) => invoice.status !== "void")
          .reduce((sum, invoice) => sum + Number(invoice.totalMinor ?? 0), 0),
      });
      const saved = settings.items.find((doc) => doc.key === "company");
      if (saved) {
        setCompany({
          displayName: String(saved.displayName ?? COMPANY.brandName),
          baseCurrency: String(saved.baseCurrency ?? "GHS"),
        });
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    }
  }, [user]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const cards = [
    { label: "Accounts", value: String(stats.accounts) },
    { label: "Parties", value: String(stats.parties) },
    { label: "Items", value: String(stats.items) },
    { label: "Vouchers", value: String(stats.vouchers) },
    { label: "Invoices", value: String(stats.invoices) },
    { label: "Invoice value", value: formatMoney(stats.salesMinor) },
  ];

  return (
    <AppShell
      title="Dashboard"
      subtitle={user?.email ? `Signed in as ${user.email}` : "Your workspace"}
      actions={<SignOutButton />}
    >
      {error ? (
        <p role="alert" className="mb-5 rounded-xl bg-error/10 p-4 text-sm text-error">{error}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <section key={card.label} className="glass-panel rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-navy/50">{card.label}</p>
            <p className="mt-2 text-2xl font-black text-navy">{card.value}</p>
          </section>
        ))}
      </div>

      {(stats.stockAlerts > 0 || stats.overdueInvoices > 0) ? (
        <div className="mt-5 space-y-2">
          {stats.stockAlerts > 0 ? (
            <p className="rounded-xl bg-error/10 p-4 text-sm font-semibold text-error">
              {stats.stockAlerts} item{stats.stockAlerts === 1 ? "" : "s"} at or below reorder level.
            </p>
          ) : null}
          {stats.overdueInvoices > 0 ? (
            <p className="rounded-xl bg-error/10 p-4 text-sm font-semibold text-error">
              {stats.overdueInvoices} sent invoice{stats.overdueInvoices === 1 ? " is" : "s are"} overdue.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-bold text-navy">Workspace</h2>
          <p className="mt-2 text-2xl font-black text-navy">{company?.displayName ?? COMPANY.brandName}</p>
          <p className="mt-1 text-sm text-navy/65">{COMPANY.legalName}</p>
          <div className="mt-5 grid gap-2 text-sm text-navy/70">
            <p>Reg: {COMPANY.registrationNumber}</p>
            <p>TIN: {COMPANY.tin}</p>
            <p>Base currency: {company?.baseCurrency ?? "GHS"}</p>
            <p>
              VAT {(TAX.vatRate * 100).toFixed(0)}% · NHIL {(TAX.nhilRate * 100).toFixed(1)}% · GETFund{" "}
              {(TAX.getfundRate * 100).toFixed(1)}%
            </p>
          </div>
        </section>

        <section className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-bold text-navy">Quick actions</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {LINKS.filter((link) => can(link.feature)).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-brand/30 px-4 py-2 text-sm font-bold text-brand transition hover:bg-brand/10"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <h3 className="mt-6 text-sm font-bold text-navy">Your access</h3>
          <p className="mt-1 text-sm font-semibold text-brand capitalize">
            {isAdmin ? "Administrator" : (membership?.role ?? "No role assigned")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {FEATURES.map((feature) => {
              const enabled = can(feature.key);
              return (
                <span
                  key={feature.key}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    enabled ? "bg-brand/15 text-brand" : "bg-navy/5 text-navy/40 line-through"
                  }`}
                >
                  {feature.label}
                </span>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
