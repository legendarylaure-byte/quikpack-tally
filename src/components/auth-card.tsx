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
    <main className="auth-shell flex min-h-screen items-center justify-center px-5 py-12">
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
      <div className="auth-shell__content w-full max-w-md">
        <Link href="/" className="auth-shell__brand mb-8 flex items-center justify-center gap-3">
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
    </main>
  );
}
