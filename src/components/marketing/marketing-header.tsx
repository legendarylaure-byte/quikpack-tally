"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MARKETING_ASSETS, NAV_LINKS, SITE } from "@/lib/marketing";

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

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [legalBrand, legalSuffix] = SITE.legalName.split(" GLOBAL ");

  return (
    <>
      <header className="mk-nav">
        <div className="mk-nav__inner">
          <Link href="/" className="mk-logo" aria-label={`QUIKPACK home — ${SITE.legalName}`} onClick={() => setOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="mk-logo__image" src={MARKETING_ASSETS.logo} alt="" />
            <span className="mk-logo__legal">
              <span>{legalBrand} GLOBAL</span>{" "}
              <span>{legalSuffix}</span>
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
            <Link href="/contact" className="mk-button mk-button--primary">
              Enquiry
            </Link>
            <Link href={SITE.loginUrl} className="mk-button mk-button--outline">
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
            <Link href="/contact" className="mk-button mk-button--primary" onClick={() => setOpen(false)}>
              Enquiry
            </Link>
            <Link href={SITE.loginUrl} className="mk-button mk-button--outline" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
