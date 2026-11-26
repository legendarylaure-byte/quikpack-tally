import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BeeScene } from "./bee-scene";
import { MarketingFooter } from "./marketing-footer";
import { MarketingHeader } from "./marketing-header";
import { ScrollEffects } from "./scroll-effects";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="mk-site">
      <a className="mk-skip-link" href="#main-content">Skip to content</a>
      <MarketingHeader />
      <BeeScene />
      <ScrollEffects />
      <div className="mk-badge" aria-hidden="true">
        <span className="mk-badge__dot" />
        Ghana-first supply · <b>QUIKPACK</b>
      </div>
      <main id="main-content">{children}</main>
      <MarketingFooter />
    </div>
  );
}

export function marketingMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      title: input.title,
      description: input.description,
      url: input.path,
      siteName: "QUIKPACK",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
  };
}
