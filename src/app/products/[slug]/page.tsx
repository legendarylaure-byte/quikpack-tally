import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell, marketingMetadata } from "@/components/marketing/marketing-shell";
import { EnquiryForm } from "@/components/marketing/enquiry-form";
import { MARKETING_ASSETS, PRODUCT_CATEGORIES } from "@/lib/marketing";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PRODUCT_CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const category = PRODUCT_CATEGORIES.find((item) => item.slug === slug);
  if (!category) return marketingMetadata({ title: "Products", description: "QUIKPACK product ranges.", path: "/products" });
  return marketingMetadata({ title: category.name, description: category.body, path: `/products/${slug}` });
}

export default async function ProductCategoryPage({ params }: Params) {
  const { slug } = await params;
  const category = PRODUCT_CATEGORIES.find((item) => item.slug === slug);
  if (!category) notFound();

  const index = PRODUCT_CATEGORIES.findIndex((item) => item.slug === slug);
  const next = PRODUCT_CATEGORIES[(index + 1) % PRODUCT_CATEGORIES.length];

  return (
    <MarketingShell>
      <section className="mk-product-hero" data-theme="light">
        <div className="mk-product-hero__inner">
          <div>
            <p className="mk-eyebrow" data-reveal>{category.eyebrow}</p>
            <h1 data-reveal>{category.name}</h1>
            <p data-reveal>{category.title}</p>
          </div>
          <div className="mk-product-hero__visual" data-speed="-0.12" data-rot="4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={category.visual ?? MARKETING_ASSETS.heroBg} alt="" />
          </div>
        </div>
      </section>

      <section className="mk-section mk-section--grid" data-theme="light">
        <div className="mk-section__inner">
          <div className="mk-section__lead">
            <p className="mk-eyebrow" data-reveal>What we supply</p>
            <h2 data-reveal>Practical products, chosen for how you work.</h2>
            <p className="mk-section__body" data-reveal>{category.body}</p>
          </div>
          <div className="mk-detail-list">
            {category.items.map((item) => (
              <article key={item.name} data-reveal>
                <h3>{item.name}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section mk-section--contact" data-theme="light">
        <div className="mk-section__inner">
          <div className="mk-section__lead">
            <p className="mk-eyebrow" data-reveal>Enquire</p>
            <h2 data-reveal>Need this range for your business?</h2>
            <p className="mk-section__body" data-reveal>Send volumes, pack preferences and delivery location. We will respond on WhatsApp.</p>
            <Link href={`/products/${next.slug}`} className="mk-text-link">Next: {next.name} →</Link>
          </div>
          <div data-reveal><EnquiryForm /></div>
        </div>
      </section>
    </MarketingShell>
  );
}
