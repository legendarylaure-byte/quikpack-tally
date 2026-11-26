import type { MetadataRoute } from "next";
import { PRODUCT_CATEGORIES } from "@/lib/marketing";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const routes = [
  "/",
  "/about",
  "/products",
  "/manufacturing",
  "/why-quikpack",
  "/sustainability",
  "/partners",
  "/insights",
  "/careers",
  "/contact",
  "/privacy",
  "/terms",
  "/data-deletion",
  "/login",
  ...PRODUCT_CATEGORIES.map((category) => `/products/${category.slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
