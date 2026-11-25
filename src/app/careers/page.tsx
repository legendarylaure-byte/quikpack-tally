import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { marketingMetadata } from "@/components/marketing/marketing-shell";
import { MARKETING_PAGES } from "@/lib/marketing";

const content = MARKETING_PAGES.careers;

export const metadata = marketingMetadata({
  title: content.title,
  description: content.description,
  path: "/careers",
});

export default function CareersPage() {
  return <MarketingContentPage content={content} />;
}
