import { CoverFlowCarousel, type CarouselItem } from "@/components/ui/3-d-coverflow-carousel";
import { dados, linkWhatsApp } from "@/lib/dados";

/**
 * A frota no coverflow. A copy de cada card mora aqui; lotação, mínimo e
 * banheiro continuam vindo de dados/vpp.json, pra a página nunca discordar dos
 * criativos de anúncio. Nenhum valor entra — a LP não fala de preço.
 */
const COPY: Record<string, { titulo: string; sub?: string }> = {
  "18-pes": { titulo: "GRUPO PEQUENO", sub: "– O BARCO INTEIRO" },
  "24-pes": { titulo: "DOZE LUGARES", sub: "– UM BARCO SÓ" },
  "33-pes": { titulo: "BANHEIRO A BORDO", sub: "– E SUÍTE" },
};

/** A foto de capa de cada lancha, escolhida entre as do briefing. */
const CAPA: Record<string, string> = {
  "18-pes": "/fotos/18-pes-lancha18-c.jpg",
  "24-pes": "/fotos/24-pes-lancha24-b.jpg",
  "33-pes": "/fotos/33-pes-lancha33-b.jpg",
};

function paraItem(lancha: (typeof dados.frota)[number]): CarouselItem {
  const copy = COPY[lancha.id];
  return {
    tag: `${lancha.pes} PÉS`,
    titleLine1: copy.titulo,
    titleLine2: copy.sub,
    desc: lancha.vende,
    img: CAPA[lancha.id],
    ctaText: "Reservar",
    ctaUrl: linkWhatsApp(lancha.id),
  };
}

export function FrotaCoverflow() {
  return (
    <CoverFlowCarousel
      items={dados.frota.map(paraItem)}
      sectionLabel="A frota"
      autoplayDelay={6500}
      accent="#17C3B2"
      background="#04141F"
      surface="#07203A"
    />
  );
}
