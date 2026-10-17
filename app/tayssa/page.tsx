import type { Metadata } from "next";
import { getSettings } from "@/lib/tayssa/settings";
import { getActiveServices, getPublicBenefits } from "@/lib/tayssa/queries/catalog";
import { getPhotoAvailability } from "@/lib/tayssa/photos-server";
import { getVideoAvailability } from "@/lib/tayssa/media-server";
import { getPhotoLibrary, getPrecosProdutos } from "@/lib/tayssa/queries/photos";
import { assignPhotos } from "@/lib/tayssa/photos";
import { categoriaDoServico, comPrecos, montarCatalogo } from "@/lib/tayssa/catalogo";
import { getAgendaPublica } from "@/lib/tayssa/queries/vip";
import { montarPortfolio } from "@/lib/tayssa/portfolio";
import { CONTEUDO } from "@/lib/tayssa/content";
import type { AgendaSite } from "@/components/tayssa/public/agendar";
import { PublicExperience } from "@/components/tayssa/public/experience";
import { PhotoAvailabilityProvider } from "@/components/tayssa/ui/photo-availability";
import { ROUTES, publicUrl } from "@/lib/tayssa/config";

/** Lê o banco a cada pedido: o que a Tayssa muda no painel aparece na hora. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: publicUrl(ROUTES.home) },
};

/**
 * Experiência pública. Dados vêm do banco com fallback nos defaults:
 * a página nunca quebra por causa do Supabase.
 */
export default async function TayssaHome() {
  const [settings, services, benefits, photos, library, videos, dias, precos] = await Promise.all([
    getSettings(),
    getActiveServices(),
    getPublicBenefits(),
    getPhotoAvailability(),
    getPhotoLibrary(),
    getVideoAvailability(),
    getAgendaPublica(),
    getPrecosProdutos(),
  ]);
  // uma biblioteca, todos os lugares: o herói, a sequência, o trilho, os serviços.
  // Só entra foto que existe de verdade — da biblioteca, ou arquivo estático
  // presente. Sem isso o site exibiria caixotes vazios no lugar do trabalho.
  const assigned = assignPhotos(library);
  // o catálogo (foto e vídeo por categoria e produto) alimenta os rolos
  // com o valor de cada produto, quando a Tayssa cadastrou
  const catalogo = comPrecos(montarCatalogo(library), precos);
  // o portfólio dos celulares: Reels do conteúdo + a mídia publicada
  const portfolio = montarPortfolio(library, CONTEUDO.instagram);
  const existe = (p?: { src: string }) => Boolean(p && (p.src.startsWith("http") || photos[p.src]));
  const reais = {
    ...assigned,
    hero: existe(assigned.hero) ? assigned.hero : undefined,
    entrance: existe(assigned.entrance) ? assigned.entrance : undefined,
    work: assigned.work.filter(existe),
    details: assigned.details.filter(existe),
    byService: Object.fromEntries(Object.entries(assigned.byService).filter(([, v]) => existe(v))),
    card: assigned.card.filter(existe),
    portrait: existe(assigned.portrait) ? assigned.portrait : undefined,
    studio: existe(assigned.studio) ? assigned.studio : undefined,
  };

  // a folha de agendar: serviços da casa, os volumes de cílios que ela
  // publicou no catálogo, os dias e horários livres e o sinal da agenda
  const agenda: AgendaSite = {
    telefone: settings.business.whatsapp,
    servicos: services
      .filter((s) => s.slug !== "outro")
      .map((s) => ({
        slug: s.slug,
        nome: s.name,
        tecnicas: categoriaDoServico(s.slug, s.name) === "cilios",
        manutencao: /manuten/i.test(`${s.slug} ${s.name}`),
        preco: s.preco != null ? Number(s.preco) : null,
      })),
    // manutenção já é serviço: não entra como volume
    tecnicas:
      catalogo
        .find((c) => c.slug === "cilios")
        ?.produtos.filter((p) => !/manuten/i.test(p.nome))
        .map((p) => ({ nome: p.nome, preco: p.preco ?? null })) ?? [],
    dias,
    sinal: settings.booking.deposit_reais,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: settings.business.name,
    description: settings.business.specialty,
    url: publicUrl(ROUTES.home),
    sameAs: [settings.business.instagram_url],
    telephone: `+${settings.business.whatsapp}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PhotoAvailabilityProvider value={photos}>
        <PublicExperience
          settings={settings}
          services={services}
          benefits={benefits}
          photos={reais}
          videos={videos}
          catalogo={catalogo}
          portfolio={portfolio}
          agenda={agenda}
        />
      </PhotoAvailabilityProvider>
    </>
  );
}
