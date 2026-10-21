import type { MetadataRoute } from "next";

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
      disallow: ["/tayssa/vip", "/tayssa/admin", "/tayssa/entrar", "/briefing"],
    },
    sitemap: "https://painel.dosedegrowth.com/tayssa/sitemap.xml",
  };
}
