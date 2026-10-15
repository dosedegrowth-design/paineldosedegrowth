import type { Metadata } from "next";
import { getSettings } from "@/lib/tayssa/settings";
import { getActiveServices, getPublicBenefits } from "@/lib/tayssa/queries/catalog";
import { getPhotoAvailability } from "@/lib/tayssa/photos-server";
import { getPhotoLibrary } from "@/lib/tayssa/queries/photos";
import { assignPhotos } from "@/lib/tayssa/photos";
import { PublicExperience } from "@/components/tayssa/public/experience";
import { PhotoAvailabilityProvider } from "@/components/tayssa/ui/photo-availability";
import { PUBLIC_ORIGIN } from "@/lib/tayssa/config";

export const metadata: Metadata = {
  alternates: { canonical: PUBLIC_ORIGIN },
};

/**
 * Experiência pública. Dados vêm do banco com fallback nos defaults:
 * a página nunca quebra por causa do Supabase.
 */
export default async function TayssaHome() {
  const [settings, services, benefits, photos, library] = await Promise.all([
    getSettings(),
    getActiveServices(),
    getPublicBenefits(),
    getPhotoAvailability(),
    getPhotoLibrary(),
  ]);
  // uma biblioteca, todos os lugares: o herói, a sequência, o trilho, os serviços.
  // Só entra foto que existe de verdade — da biblioteca, ou arquivo estático
  // presente. Sem isso o site exibiria caixotes vazios no lugar do trabalho.
  const assigned = assignPhotos(library);
  const existe = (p?: { src: string }) => Boolean(p && (p.src.startsWith("http") || photos[p.src]));
  const reais = {
    ...assigned,
    hero: existe(assigned.hero) ? assigned.hero : undefined,
    entrance: existe(assigned.entrance) ? assigned.entrance : undefined,
    work: assigned.work.filter(existe),
    details: assigned.details.filter(existe),
    byService: Object.fromEntries(Object.entries(assigned.byService).filter(([, v]) => existe(v))),
    card: assigned.card.filter(existe),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: settings.business.name,
    description: settings.business.specialty,
    url: PUBLIC_ORIGIN,
    sameAs: [settings.business.instagram_url],
    telephone: `+${settings.business.whatsapp}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PhotoAvailabilityProvider value={photos}>
        <PublicExperience settings={settings} services={services} benefits={benefits} photos={reais} />
      </PhotoAvailabilityProvider>
    </>
  );
}
