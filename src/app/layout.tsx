import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/auth-provider";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "quikpack Tally",
    template: "%s | quikpack Tally",
  },
  description:
    "Ghana-first SaaS accounting, inventory and invoicing for growing businesses.",
  applicationName: "quikpack Tally",
  manifest: "/manifest.webmanifest",
  keywords: ["accounting", "inventory", "invoicing", "Ghana", "VAT", "SaaS"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GH" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <PwaRegister />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
