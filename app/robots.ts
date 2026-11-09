import type { MetadataRoute } from "next";
import { SITE_NA_RAIZ } from "@/lib/tayssa/config";

/**
 * robots.txt do domínio inteiro (painel e páginas públicas). Libera tudo e
 * só pede para não varrer o que é privado de cada produto — hoje, as áreas
 * logadas e o formulário da Tayssa. As páginas privadas também levam noindex.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/tayssa/vip",
        "/tayssa/meus-horarios",
        "/tayssa/minha-conta",
        "/tayssa/admin",
        "/tayssa/entrar",
        "/briefing",
      ],
    },
    // com o site da Tayssa no domínio dela, o mapa dela é anunciado lá
    sitemap: SITE_NA_RAIZ ? undefined : "https://painel.dosedegrowth.com/tayssa/sitemap.xml",
  };
}
