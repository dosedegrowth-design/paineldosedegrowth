"use client";

import { createContext, useContext, useState } from "react";
import type { Settings } from "@/lib/tayssa/config";
import type { BenefitRow, ServiceRow } from "@/lib/tayssa/types";
import type { PhotoAssignment } from "@/lib/tayssa/photos";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { IntroLoader } from "@/components/tayssa/public/intro-loader";
import { PublicNav } from "@/components/tayssa/public/nav";
import { Hero } from "@/components/tayssa/public/hero";
import { WorkSequence, type ItemTrabalho } from "@/components/tayssa/public/work-sequence";
import { linkDoServico, Services } from "@/components/tayssa/public/services";
import { AgendarFlutua, Faixa } from "@/components/tayssa/public/faixa";
import { Details } from "@/components/tayssa/public/details";
import { Numeros } from "@/components/tayssa/public/numeros";
import { VipIntro } from "@/components/tayssa/public/vip-intro";
import { ReferralCta } from "@/components/tayssa/public/referral-cta";
import { Closing } from "@/components/tayssa/public/closing";
import { PublicFooter } from "@/components/tayssa/public/footer";
import { Film } from "@/components/tayssa/public/film";
import { About } from "@/components/tayssa/public/about";
import { Studio } from "@/components/tayssa/public/studio";
import { Testimonials } from "@/components/tayssa/public/testimonials";
import { VisitInfo } from "@/components/tayssa/public/visit-info";
import { Catalogo } from "@/components/tayssa/public/catalogo";
import { SemQuebrar } from "@/components/tayssa/ui/sem-quebrar";
import { midiasDoServico, type CapaServico, type CategoriaCatalogo, type MidiaCatalogo } from "@/lib/tayssa/catalogo";
import { completarComFotos, type ItemPortfolio } from "@/lib/tayssa/portfolio";
import { CONTEUDO, temAtendimento, temSobre } from "@/lib/tayssa/content";
import type { VideoAvailability } from "@/lib/tayssa/media-server";
import { useEstrutura } from "@/components/tayssa/ui/estrutura";
import { AgendarProvider, type AgendaSite } from "@/components/tayssa/public/agendar";

const IntroCtx = createContext(false);

export const useIntroReady = () => useContext(IntroCtx);

/**
 * A experiência pública inteira. Uma só narrativa em scroll:
 * abertura (marca + flores + janela) → cada serviço com a sua foto (cartões
 * de lado no celular, coluna grudada no desktop) → o filme → serviços
 * (valor, tempo e galeria de cada um) → cada técnica de perto → a
 * profissional → o estúdio → Instagram → depoimentos → a luz abaixa →
 * VIP → indicação → atendimento → fechamento.
 *
 * As seções que dependem de conteúdo que só a Tayssa pode dar (filme,
 * biografia, estúdio, depoimentos, horários) só entram quando ele
 * existe; com `?estrutura=1` aparecem com o espaço reservado marcado.
 */
/** serviços que ficam fora de "Cada serviço, um olhar" (continuam na lista e na agenda) */
const FORA_DA_APRESENTACAO = new Set(["outro", "manutencao-cilios", "remocao-extensao"]);

export function PublicExperience({
  settings,
  services,
  benefits,
  photos,
  videos,
  catalogo = [],
  capas = {},
  rolos = {},
  portfolio = [],
  agenda,
}: {
  /** o trabalho dela nos celulares da seção do Instagram */
  portfolio?: ItemPortfolio[];
  /** fotos e vídeos por categoria e produto (painel → Fotos) */
  catalogo?: CategoriaCatalogo[];
  /** a capa de cada serviço (escolhida em Mídia → Capas, ou a primeira foto dele) */
  capas?: Record<string, CapaServico | null>;
  /** as fotos de cada serviço (o visor de cada cartão e a galeria da lista) */
  rolos?: Record<string, MidiaCatalogo[]>;
  /** o que a folha de agendar oferece: serviços, volumes, dias e horários livres */
  agenda: AgendaSite;
  settings: Settings;
  services: ServiceRow[];
  benefits: BenefitRow[];
  photos?: PhotoAssignment;
  videos?: VideoAvailability;
}) {
  const [ready, setReady] = useState(false);
  const wa = settings.whatsapp;
  const phone = settings.business.whatsapp;
  const links = {
    schedule: whatsappUrl(phone, wa.public_schedule),
    vipInfo: whatsappUrl(phone, wa.public_vip_info),
    refer: whatsappUrl(phone, wa.public_refer),
    instagram: settings.business.instagram_url,
    handle: settings.business.instagram_handle,
  };

  const estrutura = useEstrutura();
  // o fundo das seções vinho (serviços e fechamento) é a Tayssa, o mesmo
  // retrato da abertura; nunca uma cliente (pedido do Lucas, 05/11/2026)
  const retrato = photos?.hero ?? photos?.portrait;
  // a colagem usa todas as fotos reais do trabalho que existem, sem repetir
  // (a da abertura é o retrato dela, que já volta em "A Tayssa")
  const colagem = [
    ...(photos?.details ?? []),
    ...(photos?.work ?? []).filter((f): f is NonNullable<typeof f> => Boolean(f)),
    ...Object.values(photos?.byService ?? {}),
  ].filter((f, i, todas) => todas.findIndex((g) => g.src === f.src) === i);
  // cada serviço com a sua foto: a capa, a frase e o jeito dela de fazer
  // (content.ts) e o "Agendar". Valor, tempo e a galeria inteira ficam na
  // lista de serviços, sem se repetir aqui
  const trabalho: ItemTrabalho[] = services
    // manutenção e remoção não são técnica para apresentar (pedido do Lucas,
    // 05/11/2026): seguem na lista de serviços e na agenda, só saem daqui
    .filter((s) => !FORA_DA_APRESENTACAO.has(s.slug))
    .map((s) => {
      const d = CONTEUDO.servicos[s.slug];
      const capa = capas[s.slug] ?? null;
      return {
        slug: s.slug,
        nome: s.name,
        frase: d?.frase ?? null,
        texto: d?.texto ?? null,
        capa,
        midias: midiasDoServico(rolos[s.slug] ?? [], capa, s.name),
        agendar: linkDoServico(links.schedule, s.name),
      };
    });
  // o menu só aponta para seção que está na página
  const secoes = [
    { id: "trabalho", label: "Trabalho" },
    { id: "servicos", label: "Serviços" },
    ...(temSobre(CONTEUDO) || estrutura ? [{ id: "sobre", label: "A Tayssa" }] : []),
    { id: "vip", label: "VIP" },
    ...(temAtendimento(CONTEUDO) || estrutura ? [{ id: "atendimento", label: "Atendimento" }] : []),
  ];

  return (
    <IntroCtx.Provider value={ready}>
      <AgendarProvider agenda={agenda}>
        <IntroLoader onDone={() => setReady(true)} />
        <PublicNav scheduleUrl={links.schedule} sections={secoes} vipAberto={settings.rules.vip_aberto} />
        <main>
          <Hero
            business={settings.business}
            scheduleUrl={links.schedule}
            photo={photos?.hero}
            video={videos?.hero}
            vipAberto={settings.rules.vip_aberto}
          />
          <Faixa itens={services.filter((s) => s.slug !== "outro").map((s) => s.name)} />
          {/* as seções de foto e vídeo: se uma quebrar no celular, some sozinha e o erro vai para o log */}
          <SemQuebrar onde="cada servico">
            <WorkSequence servicos={trabalho} />
          </SemQuebrar>
          <Film video={videos?.processo} />
          {/* a sequência que a Tayssa pediu (29/10/2026): a cliente entende o
              efeito (apresentação, acima), vê as informações práticas e a
              galeria de cada técnica (serviços) e depois explora tudo (catálogo) */}
          <SemQuebrar onde="lista de servicos">
            <Services
              services={services}
              scheduleUrl={links.schedule}
              capas={capas}
              rolos={rolos}
              ambiente={retrato}
            />
          </SemQuebrar>
          <SemQuebrar onde="catalogo">
            <Catalogo catalogo={catalogo} />
          </SemQuebrar>
          <About business={settings.business} conteudo={CONTEUDO} portrait={photos?.portrait} instagramUrl={links.instagram} />
          <Studio conteudo={CONTEUDO} video={videos?.espaco} photo={photos?.studio} />
          <SemQuebrar onde="instagram">
            <Details
              instagramUrl={links.instagram}
              handle={links.handle}
              photos={colagem}
              portfolio={completarComFotos(portfolio, colagem)}
            />
          </SemQuebrar>
          <Numeros numeros={settings.numeros} handle={links.handle} />
          <Testimonials conteudo={CONTEUDO} />
          <VipIntro benefits={benefits} settings={settings} />
          <ReferralCta />
          <VisitInfo business={settings.business} booking={settings.booking} conteudo={CONTEUDO} />
          <Closing scheduleUrl={links.schedule} ambiente={retrato} vipAberto={settings.rules.vip_aberto} />
        </main>
        <PublicFooter business={settings.business} vipAberto={settings.rules.vip_aberto} />
        <AgendarFlutua url={links.schedule} />
      </AgendarProvider>
    </IntroCtx.Provider>
  );
}
