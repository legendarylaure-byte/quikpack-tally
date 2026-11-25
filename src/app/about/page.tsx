import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { marketingMetadata } from "@/components/marketing/marketing-shell";
import { MARKETING_PAGES } from "@/lib/marketing";

const content = MARKETING_PAGES.about;

export const metadata = marketingMetadata({
  title: content.title,
  description: content.description,
  path: "/about",
});

export default function AboutPage() {
  return <MarketingContentPage content={content} />;
}
