import { HeroGlobe } from "@/components/andre/hero-globe";
import { MarqueeStrip } from "@/components/andre/marquee-strip";
import { TrustBar } from "@/components/andre/trust-bar";
import {
  EmpresaTeaser,
  SolucoesTeaser,
  SegmentosTeaser,
  ContatoBand,
} from "@/components/andre/home-teasers";
import { Marcas } from "@/components/andre/marcas";
import { StatsBand } from "@/components/andre/stats-band";
import { Testimonials } from "@/components/andre/testimonials";

export default function AndreHome() {
  return (
    <>
      <HeroGlobe />
      <MarqueeStrip />
      <TrustBar />
      <EmpresaTeaser />
      <SolucoesTeaser />
      <SegmentosTeaser />
      <Marcas />
      <StatsBand />
      <Testimonials />
      <ContatoBand />
    </>
  );
}
