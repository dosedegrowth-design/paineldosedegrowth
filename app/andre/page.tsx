import { Navbar } from "@/components/andre/navbar";
import { HeroGlobe } from "@/components/andre/hero-globe";
import { TrustBar } from "@/components/andre/trust-bar";
import { Empresa } from "@/components/andre/empresa";
import { Services } from "@/components/andre/services";
import { Produtos } from "@/components/andre/produtos";
import { Segmentos } from "@/components/andre/segmentos";
import { Marcas } from "@/components/andre/marcas";
import { HowItWorks } from "@/components/andre/how-it-works";
import { FieldGallery } from "@/components/andre/field-gallery";
import { Coverage } from "@/components/andre/coverage";
import { StatsBand } from "@/components/andre/stats-band";
import { Testimonials } from "@/components/andre/testimonials";
import { FAQ } from "@/components/andre/faq";
import { Contato } from "@/components/andre/contato";
import { Footer } from "@/components/andre/footer";
import { WhatsAppFloat } from "@/components/andre/whatsapp-float";
import { AmbientCrystalsClient } from "@/components/andre/ambient-crystals-client";
import { ThermoOverlay } from "@/components/andre/thermo-overlay";
import { SmoothScroll } from "@/components/andre/smooth-scroll";
import { Manifesto } from "@/components/andre/manifesto";
import { MarqueeStrip } from "@/components/andre/marquee-strip";
import { CursorGlow } from "@/components/andre/cursor-glow";
import { SiteFrame } from "@/components/andre/site-frame";
import { Thermometer } from "@/components/andre/thermometer";
import { CustomCursor } from "@/components/andre/custom-cursor";

export default function AndrePage() {
  return (
    <>
      <SmoothScroll />
      <AmbientCrystalsClient />
      <ThermoOverlay />
      <CursorGlow />
      <SiteFrame />
      <Thermometer />
      <CustomCursor />
      <Navbar />
      <main className="relative z-10">
        <HeroGlobe />
        <MarqueeStrip />
        <Empresa />
        <TrustBar />
        <Manifesto />
        <Services />
        <Produtos />
        <Segmentos />
        <Marcas />
        <HowItWorks />
        <FieldGallery />
        <Coverage />
        <StatsBand />
        <Testimonials />
        <FAQ />
        <Contato />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
