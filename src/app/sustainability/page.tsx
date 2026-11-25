import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { marketingMetadata } from "@/components/marketing/marketing-shell";
import { MARKETING_PAGES } from "@/lib/marketing";

const content = MARKETING_PAGES.sustainability;

export const metadata = marketingMetadata({
  title: content.title,
  description: content.description,
  path: "/sustainability",
});

export default function SustainabilityPage() {
  return <MarketingContentPage content={content} />;
}
