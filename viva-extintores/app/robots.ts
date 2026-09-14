import type { MetadataRoute } from "next";

/** Nada aqui depende de requisição: é arquivo, não rota dinâmica.
 *  Declarar isso é o que permite a exportação estática do site. */
export const dynamic = "force-static";
import { publicUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: publicUrl("/sitemap.xml"),
  };
}
