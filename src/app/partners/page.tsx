import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { marketingMetadata } from "@/components/marketing/marketing-shell";
import { MARKETING_PAGES } from "@/lib/marketing";

const content = MARKETING_PAGES.partners;

export const metadata = marketingMetadata({
  title: content.title,
  description: content.description,
  path: "/partners",
});

export default function PartnersPage() {
  return <MarketingContentPage content={content} />;
}
