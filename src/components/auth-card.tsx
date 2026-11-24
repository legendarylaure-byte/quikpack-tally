import Link from "next/link";
import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="brand-gradient flex size-10 items-center justify-center rounded-xl text-xl font-black text-white">
            q
          </span>
          <span className="text-xl font-black tracking-tight text-navy">
            quikpack
          </span>
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
