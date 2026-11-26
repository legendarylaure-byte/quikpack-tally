import Link from "next/link";
import { FOOTER_LINKS, SITE } from "@/lib/marketing";

export function MarketingFooter() {
  const first = FOOTER_LINKS.slice(0, 7);
  const second = FOOTER_LINKS.slice(7);

  return (
    <footer className="mk-footer" id="contact">
      <div className="mk-footer__cta">
        <p className="mk-eyebrow">Ready when you are</p>
        <h2>Tell us what you <span className="mk-accent">need.</span></h2>
        <p>We will help you choose the right products, packs and supply rhythm.</p>
        <Link href="/contact" className="mk-button mk-button--primary">
          Start an enquiry
        </Link>
      </div>

      <div className="mk-footer__grid">
        <div className="mk-footer__brand">
          <strong>{SITE.brand.slice(0, 4)}<span className="mk-accent mk-accent--plain">{SITE.brand.slice(4)}</span></strong>
          <span>{SITE.tagline}</span>
          <p>{SITE.legalName}</p>
          <p>
            Reg {SITE.registrationNumber} · TIN {SITE.tin}
          </p>
        </div>

        <div className="mk-footer__links">
          <div>
            <h3>Explore</h3>
            {first.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
          <div>
            <h3>Company</h3>
            {second.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
          <div>
            <h3>Reach us</h3>
            <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
              WhatsApp {SITE.whatsapp}
            </a>
            <Link href={SITE.loginUrl}>Sign in</Link>
            <Link href="/contact">Enquiry</Link>
          </div>
        </div>
      </div>

      <div className="mk-footer__legal">
        <span>Powered by QUIKPACK · Ghana-first disposables and cleaning supply.</span>
        <span>
          Crafted in Kathmandu · Deployed Globally{" "}
          <a
            href="https://www.vyomai.cloud/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="VYOMAICLOUD website (opens in a new tab)"
          >
            @VYOMAICLOUD
          </a>
        </span>
      </div>
    </footer>
  );
}
