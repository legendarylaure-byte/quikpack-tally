import type { MarketingPageContent } from "@/lib/marketing";
import { MarketingPage } from "./marketing-page";
import { MarketingShell } from "./marketing-shell";

export function MarketingContentPage({
  content,
  contact = false,
}: {
  content: MarketingPageContent;
  contact?: boolean;
}) {
  return (
    <MarketingShell>
      <MarketingPage content={content} contact={contact} />
    </MarketingShell>
  );
}
