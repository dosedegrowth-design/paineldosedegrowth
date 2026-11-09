import { ROUTES, publicUrl } from "@/lib/tayssa/config";
import { semPrefixo } from "@/lib/tayssa/dominio";

/**
 * robots.txt do domínio da Tayssa: lá o middleware entrega /robots.txt
 * daqui (no painel vale o app/robots.ts). Libera o site e pede para não
 * varrer as áreas logadas, nas duas formas do endereço (com e sem /tayssa);
 * elas também levam noindex.
 */
export function GET() {
  const fechadas = [ROUTES.vip, ROUTES.vipBook, ROUTES.vipProfile, ROUTES.admin, ROUTES.login].flatMap((p) => {
    const limpo = semPrefixo(p);
    return [limpo, `/tayssa${limpo}`];
  });
  const linhas = [
    "User-agent: *",
    "Allow: /",
    ...[...new Set(fechadas)].map((p) => `Disallow: ${p}`),
    "",
    `Sitemap: ${publicUrl("/tayssa/sitemap.xml")}`,
  ];
  return new Response(`${linhas.join("\n")}\n`, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
