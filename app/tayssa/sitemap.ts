import type { MetadataRoute } from "next";
import { publicUrl, ROUTES } from "@/lib/tayssa/config";

/** As páginas públicas do site da Tayssa (VIP, painel e entrada ficam de fora: são privadas). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: publicUrl(ROUTES.home), changeFrequency: "weekly", priority: 1 },
    { url: publicUrl(ROUTES.refer), changeFrequency: "monthly", priority: 0.5 },
  ];
}
