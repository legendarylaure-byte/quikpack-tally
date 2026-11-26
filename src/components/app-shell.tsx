"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { COMPANY, SUPPORT } from "@/lib/constants";
import type { FeatureKey } from "@/lib/permissions";
import { useAuth } from "./auth-provider";

interface AppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  actions?: ReactNode;
}

interface NavLink {
  href: string;
  label: string;
  feature?: FeatureKey;
  admin?: true;
}

const LINKS: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/masters", label: "Masters", feature: "masters" },
  { href: "/vouchers", label: "Vouchers", feature: "vouchers" },
  { href: "/inventory", label: "Inventory", feature: "inventory" },
  { href: "/invoices", label: "Invoices", feature: "invoicing" },
  { href: "/reports", label: "Reports", feature: "reports" },
  { href: "/audit", label: "Audit", feature: "reports" },
  { href: "/settings", label: "Settings", feature: "settings" },
  { href: "/subscription", label: "Plan", feature: "settings" },
  { href: "/admin/users", label: "Users", admin: true },
];

export function AppShell({ title, subtitle, children, actions }: AppShellProps) {
  const { isAdmin, can, role } = useAuth();
  const router = useRouter();
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visibleLinks = useMemo(
    () =>
      LINKS.filter((link) =>
        link.admin ? isAdmin : link.feature ? can(link.feature) : true,
      ),
    [isAdmin, can],
  );

  const filteredLinks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? visibleLinks.filter((link) => link.label.toLowerCase().includes(needle))
      : visibleLinks;
  }, [visibleLinks, query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      } else if (event.key === "Escape") {
        setCommandOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const readOnlyRole = role === "viewer" || role === "auditor";
  const quickCreate = readOnlyRole
    ? undefined
    : visibleLinks.find((link) =>
        ["/vouchers", "/invoices", "/masters", "/inventory"].includes(link.href),
      );

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="app-header">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="brand-gradient flex size-9 items-center justify-center rounded-lg font-black text-white">
              q
            </span>
            <div>
              <p className="text-base leading-none font-extrabold text-navy">
                quikpack
              </p>
              <p className="mt-1 text-[9px] tracking-[0.18em] text-navy/50 uppercase">
                Tally System
              </p>
            </div>
          </Link>

          <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                title={`Open ${link.label}`}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-navy transition hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              title="Search pages (Ctrl/Cmd + K)"
              className="rounded-full border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy transition hover:border-brand"
            >
              Search
            </button>
            <a
              href={SUPPORT.whatsappUrl}
              title="Contact support on WhatsApp"
              className="rounded-full border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy transition hover:border-brand"
            >
              Support
            </a>
            {actions}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <h1 className="text-3xl font-black tracking-tight text-navy">{title}</h1>
        <p className="mt-2 text-sm text-navy/65">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </main>

      <footer className="border-t border-navy/10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-6 text-xs text-navy/55">
          <span>
            {COMPANY.legalName} · Reg {COMPANY.registrationNumber} · TIN{" "}
            {COMPANY.tin}
          </span>
          <span className="ml-auto">
            Crafted in Kathmandu · Deployed Globally{" "}
            <a
              href="https://www.vyomai.cloud/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="VYOMAICLOUD website (opens in a new tab)"
              className="font-semibold text-navy/70 underline-offset-2 transition hover:text-navy hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              @VYOMAICLOUD
            </a>
          </span>
        </div>
      </footer>

      {quickCreate ? (
        <Link
          href={quickCreate.href}
          title={`Go to ${quickCreate.label}`}
          className="no-print brand-gradient fixed right-5 bottom-5 z-30 flex size-14 items-center justify-center rounded-full text-3xl font-light text-white shadow-lg"
          aria-label={`Quick create in ${quickCreate.label}`}
        >
          +
        </Link>
      ) : null}

      {commandOpen ? (
        <div
          className="no-print fixed inset-0 z-50 flex items-start justify-center bg-navy/40 p-4 pt-20"
          role="presentation"
          onClick={() => setCommandOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command bar"
            className="glass-panel w-full max-w-lg p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pages…"
              aria-label="Search pages"
              className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm text-navy outline-none focus:border-brand"
            />
            <div className="mt-3 max-h-80 overflow-y-auto">
              {filteredLinks.length === 0 ? (
                <p className="p-3 text-sm text-navy/55">No matching pages.</p>
              ) : (
                filteredLinks.map((link) => (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => {
                      setCommandOpen(false);
                      setQuery("");
                      router.push(link.href);
                    }}
                    className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-navy hover:bg-brand/10"
                  >
                    {link.label}
                  </button>
                ))
              )}
            </div>
            <p className="mt-2 px-1 text-xs text-navy/45">Press Esc to close</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
