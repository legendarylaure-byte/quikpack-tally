"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_LINKS, SITE } from "@/lib/marketing";

const MOBILE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products/horeca", label: "HORECA" },
  { href: "/products/household", label: "Household" },
  { href: "/products/cleaning", label: "Cleaning" },
  { href: "/products/eco", label: "Eco options" },
  { href: "/why-quikpack", label: "Why QUIKPACK" },
  { href: "/partners", label: "Partners" },
  { href: "/insights", label: "Insights" },
  { href: "/careers", label: "Careers" },
];

function StarMark() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="size-8">
      <path
        d="M20 0c1.2 11.5 8.5 18.8 20 20-11.5 1.2-18.8 8.5-20 20-1.2-11.5-8.5-18.8-20-20C11.5 18.8 18.8 11.5 20 0z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="mk-nav">
        <div className="mk-nav__inner">
          <Link href="/" className="mk-logo" aria-label="QUIKPACK home" onClick={() => setOpen(false)}>
            <StarMark />
            <span>
              <strong>{SITE.brand}</strong>
              <small>Tally System</small>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="mk-nav__links">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname.startsWith(link.href) ? "is-active" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mk-nav__actions">
            <Link href={SITE.loginUrl} className="mk-button mk-button--dark">
              Sign in
            </Link>
            <button
              type="button"
              className="mk-menu-button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <span aria-hidden="true">{open ? "×" : "≡"}</span>
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div id="mobile-menu" className="mk-mobile-menu">
          <nav aria-label="Mobile navigation">
            {[...NAV_LINKS, ...MOBILE_LINKS].map((link) => (
              <Link key={`${link.href}-${link.label}`} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href={SITE.loginUrl} className="mk-button mk-button--primary" onClick={() => setOpen(false)}>
              Sign in to Tally
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
