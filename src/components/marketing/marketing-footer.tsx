import Link from "next/link";
import { ACCESS_REQUEST_URL, FOOTER_LINKS, SITE } from "@/lib/marketing";

export function MarketingFooter() {
  const first = FOOTER_LINKS.slice(0, 7);
  const second = FOOTER_LINKS.slice(7);

  return (
    <footer className="mk-footer" id="contact">
      <div className="mk-footer__cta">
        <p className="mk-eyebrow">Ready when you are</p>
        <h2>Tell us what you need.</h2>
        <p>We will help you choose the right products, packs and supply rhythm.</p>
        <Link href="/contact" className="mk-button mk-button--primary">
          Start an enquiry
        </Link>
      </div>

      <div className="mk-footer__grid">
        <div className="mk-footer__brand">
          <strong>{SITE.brand}</strong>
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
            <a href={SITE.whatsappUrl} target="_blank" rel="noreferrer">
              WhatsApp {SITE.whatsapp}
            </a>
            <Link href={SITE.loginUrl}>Sign in to Tally</Link>
            <a href={ACCESS_REQUEST_URL} target="_blank" rel="noreferrer">
              Request Tally access
            </a>
          </div>
        </div>
      </div>

      <p className="mk-footer__legal">Powered by quikpack · Ghana-first disposables and cleaning supply.</p>
    </footer>
  );
}
