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
  // uma biblioteca, todos os lugares: o herói, a sequência, o trilho, os serviços
  const assigned = assignPhotos(library);

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
        <PublicExperience settings={settings} services={services} benefits={benefits} photos={assigned} />
      </PhotoAvailabilityProvider>
    </>
  );
}
