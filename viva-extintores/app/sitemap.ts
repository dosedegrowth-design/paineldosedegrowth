import type { MetadataRoute } from "next";

/** Nada aqui depende de requisição: é arquivo, não rota dinâmica.
 *  Declarar isso é o que permite a exportação estática do site. */
export const dynamic = "force-static";
import { AREAS } from "@/lib/areas";
import { MENU, publicUrl } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();
  return [
    ...MENU.map((m) => ({
      url: publicUrl(m.href),
      lastModified: agora,
      changeFrequency: "monthly" as const,
      priority: m.href === "/" ? 1 : 0.8,
    })),
    ...AREAS.map((a) => ({
      url: publicUrl(a.href),
      lastModified: agora,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
