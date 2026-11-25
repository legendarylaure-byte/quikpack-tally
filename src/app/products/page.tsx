import Link from "next/link";
import { MarketingShell, marketingMetadata } from "@/components/marketing/marketing-shell";
import { MARKETING_ASSETS, PRODUCT_CATEGORIES } from "@/lib/marketing";

export const metadata = marketingMetadata({
  title: "Products & Solutions",
  description:
    "Explore QUIKPACK's HORECA, household, cleaning and sustainability ranges — disposables and cleaning supplies for Ghana.",
  path: "/products",
});

export default function ProductsPage() {
  return (
    <MarketingShell>
      <section className="mk-page-hero" data-theme="light">
        <div className="mk-page-hero__inner">
          <p className="mk-eyebrow" data-reveal>Products & solutions</p>
          <h1 data-reveal>Products that keep your day moving.</h1>
          <p className="mk-page-hero__body" data-reveal>
            Four practical ranges serve hotels, restaurants, cafés, retailers,
            institutions and homes across Ghana. Choose the products that fit
            your operation, then tell us what you need.
          </p>
        </div>
      </section>

      <section className="mk-section mk-section--product-grid" data-theme="light">
        <div className="mk-section__inner">
          {PRODUCT_CATEGORIES.map((category, index) => (
            <article key={category.slug} className="mk-product-card" data-reveal>
              <div className="mk-product-card__visual">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={category.visual ?? MARKETING_ASSETS.heroBg} alt="" />
              </div>
              <div className="mk-product-card__body">
                <span className="mk-category-card__num">0{index + 1}</span>
                <h2>{category.name}</h2>
                <p>{category.body}</p>
                <ul>
                  {category.items.slice(0, 3).map((item) => (
                    <li key={item.name}>{item.name}</li>
                  ))}
                </ul>
                <Link href={`/products/${category.slug}`} className="mk-text-link">
                  View range →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mk-page-cta" data-theme="dark">
        <div>
          <p className="mk-eyebrow">Not sure where to start?</p>
          <h2 data-reveal>Send us your list. We will find the fit.</h2>
          <p data-reveal>Tell us what you use today and we will suggest practical options.</p>
          <Link href="/contact" className="mk-button mk-button--light" data-reveal>
            Start an enquiry
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
