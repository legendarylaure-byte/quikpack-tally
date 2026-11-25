import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { marketingMetadata } from "@/components/marketing/marketing-shell";
import { MARKETING_PAGES } from "@/lib/marketing";

const content = MARKETING_PAGES.manufacturing;

export const metadata = marketingMetadata({
  title: content.title,
  description: content.description,
  path: "/manufacturing",
});

export default function ManufacturingPage() {
  return <MarketingContentPage content={content} />;
}
