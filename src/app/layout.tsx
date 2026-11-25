import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/auth-provider";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "QUIKPACK — Disposables & Cleaning Supply in Ghana",
    template: "%s | QUIKPACK",
  },
  description:
    "QUIKPACK supplies HORECA, corporate and household customers across Ghana with disposables, cleaning supplies and locally made tissue products.",
  applicationName: "QUIKPACK",
  manifest: "/manifest.webmanifest",
  keywords: [
    "disposables",
    "HORECA",
    "paper towels",
    "napkins",
    "takeaway containers",
    "cleaning supplies",
    "Ghana",
    "QUIKPACK",
  ],
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
