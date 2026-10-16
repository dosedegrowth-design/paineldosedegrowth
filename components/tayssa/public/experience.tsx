"use client";

import { createContext, useContext, useState } from "react";
import type { Settings } from "@/lib/tayssa/config";
import type { BenefitRow, ServiceRow } from "@/lib/tayssa/types";
import type { PhotoAssignment } from "@/lib/tayssa/photos";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { IntroLoader } from "@/components/tayssa/public/intro-loader";
import { PublicNav } from "@/components/tayssa/public/nav";
import { Hero } from "@/components/tayssa/public/hero";
import { WorkSequence } from "@/components/tayssa/public/work-sequence";
import { Services } from "@/components/tayssa/public/services";
import { Details } from "@/components/tayssa/public/details";
import { VipIntro } from "@/components/tayssa/public/vip-intro";
import { ReferralCta } from "@/components/tayssa/public/referral-cta";
import { Closing } from "@/components/tayssa/public/closing";
import { PublicFooter } from "@/components/tayssa/public/footer";
import { Film } from "@/components/tayssa/public/film";
import { About } from "@/components/tayssa/public/about";
import { Studio } from "@/components/tayssa/public/studio";
import { Testimonials } from "@/components/tayssa/public/testimonials";
import { VisitInfo } from "@/components/tayssa/public/visit-info";
import { CONTEUDO, temAtendimento, temSobre } from "@/lib/tayssa/content";
import type { VideoAvailability } from "@/lib/tayssa/media-server";
import { useEstrutura } from "@/components/tayssa/ui/estrutura";

const IntroCtx = createContext(false);
export const useIntroReady = () => useContext(IntroCtx);

/**
 * A experiência pública inteira. Uma só narrativa em scroll:
 * abertura (marca + flores + janela) → trabalho (pin) → o filme (a
 * janela abre até a tela cheia) → serviços → a profissional → o estúdio
 * → Instagram → depoimentos → a luz abaixa → VIP → indicação →
 * atendimento → fechamento.
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
}: {
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
      <IntroLoader onDone={() => setReady(true)} />
      <PublicNav scheduleUrl={links.schedule} sections={secoes} />
      <main>
        <Hero business={settings.business} scheduleUrl={links.schedule} photo={photos?.hero} video={videos?.hero} />
        <WorkSequence photos={photos?.work} />
        <Film video={videos?.processo} />
        <Services
          services={services}
          scheduleUrl={links.schedule}
          photoBySlug={photos?.byService}
          detalhes={CONTEUDO.servicos}
        />
        <About business={settings.business} conteudo={CONTEUDO} portrait={photos?.portrait} instagramUrl={links.instagram} />
        <Studio conteudo={CONTEUDO} video={videos?.espaco} photo={photos?.studio} />
        <Details instagramUrl={links.instagram} handle={links.handle} photos={photos?.details} />
        <Testimonials conteudo={CONTEUDO} />
        <VipIntro benefits={benefits} />
        <ReferralCta />
        <VisitInfo business={settings.business} conteudo={CONTEUDO} />
        <Closing scheduleUrl={links.schedule} />
      </main>
      <PublicFooter business={settings.business} />
    </IntroCtx.Provider>
  );
}
