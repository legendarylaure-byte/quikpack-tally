import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "quikpack Tally",
    template: "%s | quikpack Tally",
  },
  description:
    "Ghana-first SaaS accounting, inventory and invoicing for growing businesses.",
  applicationName: "quikpack Tally",
  keywords: ["accounting", "inventory", "invoicing", "Ghana", "VAT", "SaaS"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GH" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
