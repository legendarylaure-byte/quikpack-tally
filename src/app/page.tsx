import Link from "next/link";
import { MarketingShell, marketingMetadata } from "@/components/marketing/marketing-shell";
import { MARKETING_ASSETS, PRODUCT_CATEGORIES, SITE } from "@/lib/marketing";

export const metadata = marketingMetadata({
  title: "QUIKPACK — Disposables & Cleaning Supply in Ghana",
  description:
    "QUIKPACK supplies HORECA, corporate and household customers with paper towels, napkins, takeaway containers, carry bags and cleaning supplies across Ghana.",
  path: "/",
});

export default function Home() {
  return (
    <MarketingShell>
      <section className="mk-hero" id="top" data-theme="light">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="mk-flower mk-hero__flower"
          src={MARKETING_ASSETS.cosmos}
          alt=""
          data-speed="-0.25"
          data-rot="8"
        />
        <h1 className="mk-hero__title" data-speed="0.35">
          <span className="line"><span>Everything your business</span></span>{" "}
          <span className="line"><span>needs to serve, pack</span></span>{" "}
          <span className="line"><span>and clean.</span></span>
        </h1>
        <div className="mk-hero__side">
          <p>
            From paper towels and napkins to takeaway containers, carry bags and
            cleaning supplies — QUIKPACK supplies HORECA, corporate and household
            customers across Ghana.
          </p>
          <div className="mk-hero__actions">
            <Link href="/products" className="mk-button mk-button--primary">
              Explore solutions
            </Link>
            <Link href={SITE.loginUrl} className="mk-button mk-button--outline">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="mk-section mk-section--range" id="range" data-theme="light">
        <div className="mk-section__inner">
          <div className="mk-section__lead">
            <p className="mk-eyebrow" data-reveal>One dependable source</p>
            <h2 data-reveal>Everything your operation reaches for every day.</h2>
            <p className="mk-section__body" data-reveal>
              We bring the products busy kitchens, counters, homes and washrooms
              use again and again into one practical supply relationship.
            </p>
          </div>
          <div className="mk-category-grid">
            {PRODUCT_CATEGORIES.map((category, index) => (
              <Link
                key={category.slug}
                href={`/products/${category.slug}`}
                className="mk-category-card"
                data-reveal
              >
                <span className="mk-category-card__num">0{index + 1}</span>
                <span className="mk-category-card__name">{category.name}</span>
                <span className="mk-category-card__copy">{category.eyebrow}</span>
                <span className="mk-category-card__arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section mk-section--dark mk-section--manufacturing" id="manufacturing" data-theme="dark">
        <div className="mk-section__inner">
          <div className="mk-section__lead">
            <div className="mk-big-num" data-speed="0.18" data-reveal>02</div>
            <p className="mk-eyebrow" data-reveal>Manufacturing · new</p>
            <h2 data-reveal>From trading strength to local production.</h2>
            <p className="mk-section__body" data-reveal>
              QUIKPACK is setting up manufacturing for table napkins and other
              tissue materials — giving customers a more consistent, locally
              grounded source for products they use in volume.
            </p>
            <Link href="/manufacturing" className="mk-button mk-button--light" data-reveal>
              See our capability
            </Link>
          </div>
          <div className="mk-section__visual" data-speed="-0.2" data-rot="10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MARKETING_ASSETS.hangingCosmos} alt="" />
          </div>
        </div>
      </section>

      <section className="mk-section mk-section--sustainability" id="sustainability" data-theme="light">
        <div className="mk-section__inner">
          <div className="mk-section__lead">
            <p className="mk-eyebrow" data-reveal>Sustainability</p>
            <h2 data-reveal>Practical choices for less waste.</h2>
            <p className="mk-section__body" data-reveal>
              Sustainability in disposables is about better decisions at the
              product, pack and replenishment level — not slogans. We focus on
              choices that can hold up in daily operations.
            </p>
            <div className="mk-detail-list">
              <article data-reveal>
                <h3>Responsible sourcing</h3>
                <p>Supplier and material choices reviewed with care.</p>
              </article>
              <article data-reveal>
                <h3>Right-sized packing</h3>
                <p>Less unnecessary material in transit and storage.</p>
              </article>
            </div>
            <Link href="/sustainability" className="mk-text-link" data-reveal>
              Read our approach →
            </Link>
          </div>
          <div className="mk-section__visual" data-speed="-0.16" data-rot="-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MARKETING_ASSETS.iris} alt="" />
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
