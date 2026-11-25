import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { marketingMetadata } from "@/components/marketing/marketing-shell";
import { MARKETING_PAGES } from "@/lib/marketing";

const content = MARKETING_PAGES["why-quikpack"];

export const metadata = marketingMetadata({
  title: content.title,
  description: content.description,
  path: "/why-quikpack",
});

export default function WhyQuikpackPage() {
  return <MarketingContentPage content={content} />;
}
