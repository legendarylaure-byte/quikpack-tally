import Link from "next/link";
import { MARKETING_ASSETS, type MarketingPageContent, type MarketingSection } from "@/lib/marketing";
import { EnquiryForm } from "./enquiry-form";

function DetailList({ items }: { items?: MarketingSection["items"] }) {
  if (!items?.length) return null;
  return (
    <div className="mk-detail-list">
      {items.map((item) => (
        <article key={item.title} data-reveal>
          <h3>{item.title}</h3>
          <p>{item.detail}</p>
        </article>
      ))}
    </div>
  );
}

function Section({ section, index }: { section: MarketingSection; index: number }) {
  const visual = section.visual ?? MARKETING_ASSETS.cosmos;

  return (
    <section className={`mk-section mk-section--${section.layout ?? "split"}${section.reverse ? " mk-section--reverse" : ""}`} data-theme={section.theme ?? "light"}>
      <div className="mk-section__inner">
        {section.layout === "grid" ? (
          <>
            <div className="mk-section__lead">
              <p className="mk-eyebrow" data-reveal>{section.eyebrow ?? `0${index + 1}`}</p>
              <h2 data-reveal>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mk-section__body" data-reveal>{paragraph}</p>
              ))}
            </div>
            <DetailList items={section.items} />
          </>
        ) : section.layout === "list" ? (
          <>
            <div className="mk-section__lead">
              <p className="mk-eyebrow" data-reveal>{section.eyebrow ?? `0${index + 1}`}</p>
              <h2 data-reveal>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mk-section__body" data-reveal>{paragraph}</p>
              ))}
            </div>
            <DetailList items={section.items} />
          </>
        ) : (
          <>
            <div className="mk-section__lead">
              <p className="mk-eyebrow" data-reveal>{section.eyebrow ?? `0${index + 1}`}</p>
              <h2 data-reveal>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mk-section__body" data-reveal>{paragraph}</p>
              ))}
              <DetailList items={section.items} />
            </div>
            <div className="mk-section__visual" data-speed="-0.16" data-rot="5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={visual} alt="" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export function MarketingPage({ content, contact = false }: { content: MarketingPageContent; contact?: boolean }) {
  return (
    <>
      <section className="mk-page-hero" data-theme="light">
        <div className="mk-page-hero__inner">
          <p className="mk-eyebrow" data-reveal>{content.eyebrow}</p>
          <h1 data-reveal>{content.heroTitle}</h1>
          <p className="mk-page-hero__body" data-reveal>{content.heroBody}</p>
          <div className="mk-page-hero__actions" data-reveal>
            <Link href="/products" className="mk-button mk-button--primary">Explore products</Link>
            <Link href="/contact" className="mk-button mk-button--ghost">Start an enquiry</Link>
          </div>
        </div>
      </section>

      {contact ? (
        <section className="mk-section mk-section--contact" data-theme="light">
          <div className="mk-section__inner">
            <div className="mk-section__lead">
              <p className="mk-eyebrow" data-reveal>Contact / enquiry</p>
              <h2 data-reveal>Send us the details.</h2>
              <p className="mk-section__body" data-reveal>We will respond on WhatsApp with practical options for your business or home.</p>
            </div>
            <div data-reveal><EnquiryForm /></div>
          </div>
        </section>
      ) : null}

      {content.sections.map((section, index) => (
        <Section key={section.id} section={section} index={index} />
      ))}

      <section className="mk-page-cta" data-theme="dark">
        <div>
          <p className="mk-eyebrow">{contact ? "Let's begin" : "Next step"}</p>
          <h2 data-reveal>{content.ctaTitle}</h2>
          <p data-reveal>{content.ctaBody}</p>
          {contact ? null : (
            <Link href="/contact" className="mk-button mk-button--light" data-reveal>Contact QUIKPACK</Link>
          )}
        </div>
      </section>
    </>
  );
}
