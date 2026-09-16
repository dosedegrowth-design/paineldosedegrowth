"use client";

import { createContext, useContext, useState } from "react";
import type { Settings } from "@/lib/config";
import type { BenefitRow, ServiceRow } from "@/lib/types";
import type { PhotoAssignment } from "@/lib/photos";
import { whatsappUrl } from "@/lib/whatsapp";
import { IntroLoader } from "@/components/public/intro-loader";
import { PublicNav } from "@/components/public/nav";
import { Hero } from "@/components/public/hero";
import { WorkSequence } from "@/components/public/work-sequence";
import { Services } from "@/components/public/services";
import { Details } from "@/components/public/details";
import { VipIntro } from "@/components/public/vip-intro";
import { ReferralCta } from "@/components/public/referral-cta";
import { Closing } from "@/components/public/closing";
import { PublicFooter } from "@/components/public/footer";

const IntroCtx = createContext(false);
export const useIntroReady = () => useContext(IntroCtx);

/**
 * A experiência pública inteira. Uma só narrativa em scroll:
 * entrada → hero vira cartão → trabalho (pin) → serviços → detalhes
 * (trilho horizontal) → a luz abaixa → VIP → indicação → fechamento.
 */
export function PublicExperience({
  settings,
  services,
  benefits,
  photos,
}: {
  settings: Settings;
  services: ServiceRow[];
  benefits: BenefitRow[];
  photos?: PhotoAssignment;
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

  return (
    <IntroCtx.Provider value={ready}>
      <IntroLoader onDone={() => setReady(true)} />
      <PublicNav scheduleUrl={links.schedule} />
      <main>
        <Hero business={settings.business} scheduleUrl={links.schedule} photo={photos?.hero} />
        <WorkSequence photos={photos?.work} />
        <Services services={services} scheduleUrl={links.schedule} photoBySlug={photos?.byService} />
        <Details instagramUrl={links.instagram} handle={links.handle} photos={photos?.details} />
        <VipIntro benefits={benefits} />
        <ReferralCta />
        <Closing scheduleUrl={links.schedule} />
      </main>
      <PublicFooter business={settings.business} />
    </IntroCtx.Provider>
  );
}
