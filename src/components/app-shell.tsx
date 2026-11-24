import Link from "next/link";
import type { ReactNode } from "react";
import { COMPANY, SUPPORT } from "@/lib/constants";

interface AppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function AppShell({ title, subtitle, children, actions }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-navy/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
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

          <nav className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-full px-4 py-2 text-sm font-semibold text-navy transition hover:bg-brand/10"
            >
              Dashboard
            </Link>
            <a
              href={SUPPORT.whatsappUrl}
              className="rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy transition hover:border-brand"
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
        <div className="mx-auto w-full max-w-6xl px-6 py-6 text-xs text-navy/55">
          {COMPANY.legalName} · Reg {COMPANY.registrationNumber} · TIN{" "}
          {COMPANY.tin}
        </div>
      </footer>
    </div>
  );
}
