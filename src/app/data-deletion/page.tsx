import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { marketingMetadata } from "@/components/marketing/marketing-shell";
import { MARKETING_PAGES } from "@/lib/marketing";

const content = MARKETING_PAGES["data-deletion"];

export const metadata = marketingMetadata({
  title: content.title,
  description: content.description,
  path: "/data-deletion",
});

export default function DataDeletionPage() {
  return <MarketingContentPage content={content} />;
}
