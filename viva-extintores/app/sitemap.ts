import type { MetadataRoute } from "next";
import { AREAS } from "@/lib/areas";
import { publicUrl } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();
  return [
    { url: publicUrl("/"), lastModified: agora, changeFrequency: "monthly", priority: 1 },
    ...AREAS.map((a) => ({
      url: publicUrl(a.href),
      lastModified: agora,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
