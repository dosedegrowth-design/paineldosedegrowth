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
import { Services } from "@/components/tayssa/public/services";
import { ServiceStrip } from "@/components/tayssa/public/service-strip";
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
import type { CapaServico, CategoriaCatalogo, MidiaCatalogo } from "@/lib/tayssa/catalogo";
import { completarComFotos, type ItemPortfolio } from "@/lib/tayssa/portfolio";
import { CONTEUDO, temAtendimento, temSobre } from "@/lib/tayssa/content";
import type { VideoAvailability } from "@/lib/tayssa/media-server";
import { useEstrutura } from "@/components/tayssa/ui/estrutura";
import { AgendarProvider, type AgendaSite } from "@/components/tayssa/public/agendar";

const IntroCtx = createContext(false);

export const useIntroReady = () => useContext(IntroCtx);

/**
 * A experiência pública inteira. Uma só narrativa em scroll:
 * abertura (marca + flores + janela) → os serviços em cartões (com as
 * fotos de cada um passando dentro) → trabalho (pin) → o filme → cada
 * técnica de perto → serviços (capa + carrossel do serviço) → a
 * profissional → o estúdio → Instagram → depoimentos → a luz abaixa →
 * VIP → indicação → atendimento → fechamento.
 *
 * As seções que dependem de conteúdo que só a Tayssa pode dar (filme,
 * biografia, estúdio, depoimentos, horários) só entram quando ele
 * existe; com `?estrutura=1` aparecem com o espaço reservado marcado.
 */
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
  /** as fotos de cada serviço (passam no cartão de cima e embaixo da capa na lista) */
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
  // a colagem usa todas as fotos reais do trabalho que existem, sem repetir
  // (a da abertura é o retrato dela, que já volta em "A Tayssa")
  const colagem = [
    ...(photos?.details ?? []),
    ...(photos?.work ?? []).filter((f): f is NonNullable<typeof f> => Boolean(f)),
    ...Object.values(photos?.byService ?? {}),
  ].filter((f, i, todas) => todas.findIndex((g) => g.src === f.src) === i);
  // a apresentação das técnicas: a frase e o jeito dela de fazer (content.ts).
  // Valor, tempo e fotos ficam na lista de serviços, sem se repetir aqui
  const trabalho: ItemTrabalho[] = services
    .filter((s) => s.slug !== "outro")
    .map((s) => {
      const d = CONTEUDO.servicos[s.slug];
      return {
        slug: s.slug,
        nome: s.name,
        frase: d?.frase ?? null,
        texto: d?.texto ?? null,
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
        <PublicNav scheduleUrl={links.schedule} sections={secoes} />
        <main>
          <Hero business={settings.business} scheduleUrl={links.schedule} photo={photos?.hero} video={videos?.hero} />
          <Faixa itens={services.filter((s) => s.slug !== "outro").map((s) => s.name)} />
          {/* as seções de foto e vídeo: se uma quebrar no celular, some sozinha e o erro vai para o log */}
          <SemQuebrar onde="carrossel de servicos">
            <ServiceStrip services={services} scheduleUrl={links.schedule} capas={capas} rolos={rolos} />
          </SemQuebrar>
          <WorkSequence servicos={trabalho} />
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
              ambiente={colagem[1] ?? colagem[0]}
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
          <Closing scheduleUrl={links.schedule} ambiente={colagem[2] ?? colagem[0]} />
        </main>
        <PublicFooter business={settings.business} />
        <AgendarFlutua url={links.schedule} />
      </AgendarProvider>
    </IntroCtx.Provider>
  );
}
