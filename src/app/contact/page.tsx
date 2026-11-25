import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { marketingMetadata } from "@/components/marketing/marketing-shell";
import { MARKETING_PAGES } from "@/lib/marketing";

const content = MARKETING_PAGES.contact;

export const metadata = marketingMetadata({
  title: content.title,
  description: content.description,
  path: "/contact",
});

export default function ContactPage() {
  return <MarketingContentPage content={content} contact />;
}
