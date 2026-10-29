import type { Metadata } from "next";
import { getSettings } from "@/lib/tayssa/settings";
import { getActiveServices, getPublicBenefits } from "@/lib/tayssa/queries/catalog";
import { getPhotoAvailability } from "@/lib/tayssa/photos-server";
import { getVideoAvailability } from "@/lib/tayssa/media-server";
import { getFotosPorIds, getPhotoLibrary, getPrecosProdutos } from "@/lib/tayssa/queries/photos";
import { assignPhotos } from "@/lib/tayssa/photos";
import { capasDosServicos, comPrecos, montarCatalogo, rolosDosServicos } from "@/lib/tayssa/catalogo";
import { ehManutencao } from "@/lib/tayssa/agendar";
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
  // uma biblioteca, todos os lugares: a abertura, os serviços, o Instagram.
  // Só entra foto que existe de verdade — da biblioteca, ou arquivo estático
  // presente. Sem isso o site exibiria caixotes vazios no lugar do trabalho.
  const assigned = assignPhotos(library);
  // cada serviço com as fotos dele (o produto com o nome dele) e a capa que a
  // Tayssa escolheu em Mídia → Capas (que pode ser uma foto da galeria)
  const ativos = services.filter((s) => s.slug !== "outro");
  // o catálogo (foto e vídeo por categoria e produto) com o valor de cada produto
  const catalogo = comPrecos(montarCatalogo(library), precos);
  const rolos = rolosDosServicos(catalogo, ativos);
  const fotosDasCapas = await getFotosPorIds(ativos.map((s) => s.capa_photo_id ?? ""));
  const capas = capasDosServicos(ativos, rolos, fotosDasCapas);
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

  // a folha de agendar: os serviços da casa com valor e tempo, os volumes
  // (a manutenção pergunta de qual é, e o valor vem dele), os dias e
  // horários livres e o sinal da agenda
  const agenda: AgendaSite = {
    telefone: settings.business.whatsapp,
    servicos: ativos.map((s) => ({
      slug: s.slug,
      nome: s.name,
      manutencao: ehManutencao(s.slug, s.name),
      preco: s.preco != null ? Number(s.preco) : null,
      duracao: s.duration_min ?? settings.booking.default_duration_min,
    })),
    volumes: ativos
      .filter((s) => s.preco_manutencao != null)
      .map((s) => ({ nome: s.name, manutencao: Number(s.preco_manutencao) })),
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
      {/* "<" escapado: um nome com </script> não fecha a tag antes da hora */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      {/* abertura só na primeira visita da sessão e sem "reduzir movimento":
          decidido antes de o JS chegar — antes a tela ficava coberta até ele
          carregar, mesmo para quem não ia ver a abertura (e sem JS, para sempre) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem("ty_intro_seen")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("ty-sem-abertura")}catch(e){}`,
        }}
      />
      <noscript>
        <style>{`.ty-loader{display:none!important}`}</style>
      </noscript>
      <PhotoAvailabilityProvider value={photos}>
        <PublicExperience
          settings={settings}
          services={services}
          benefits={benefits}
          photos={reais}
          videos={videos}
          catalogo={catalogo}
          capas={capas}
          rolos={rolos}
          portfolio={portfolio}
          agenda={agenda}
        />
      </PhotoAvailabilityProvider>
    </>
  );
}
