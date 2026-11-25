import Link from "next/link";
import type { ReactNode } from "react";
import { MARKETING_ASSETS } from "@/lib/marketing";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="auth-shell">
      <aside className="auth-shell__story">
        <div className="auth-shell__media">
          <video
            className="auth-shell__video"
            autoPlay
            muted
            loop
            playsInline
            poster={MARKETING_ASSETS.loginPoster}
            aria-hidden="true"
          >
            <source src={MARKETING_ASSETS.loginVideo} type="video/mp4" />
          </video>
        </div>

        <div className="auth-shell__story-content">
          <p className="auth-shell__eyebrow">Ghana-first supply partner</p>
          <h2>Stocked for service, packed for speed.</h2>
          <p>
            From napkins and tissue to takeaway containers and cleaning
            essentials, QUIKPACK keeps hotels, restaurants, shops and homes
            supplied with the products they reach for every day.
          </p>
          <div className="auth-shell__chips" aria-label="Our ranges">
            <span>HORECA</span>
            <span>Household</span>
            <span>Cleaning</span>
            <span>Eco options</span>
          </div>
          <Link href="/products" className="auth-shell__cta">
            Explore our range <span aria-hidden="true">→</span>
          </Link>
        </div>
      </aside>

      <section className="auth-shell__form-side">
        <div className="auth-shell__content w-full max-w-md">
          <Link href="/" className="auth-shell__brand mb-8 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MARKETING_ASSETS.logo} alt="QUIKPACK" />
          </Link>

          <section className="glass-panel rounded-3xl p-7 sm:p-9">
            <h1 className="text-2xl font-black tracking-tight text-navy">{title}</h1>
            <p className="mt-2 text-sm text-navy/65">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </section>

          <p className="mt-6 text-center text-sm text-navy/65">{footer}</p>
        </div>
      </section>
    </main>
  );
}
