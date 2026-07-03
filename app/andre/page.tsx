import { Navbar } from "@/components/andre/navbar";
import { Hero } from "@/components/andre/hero";
import { TrustBar } from "@/components/andre/trust-bar";
import { Services } from "@/components/andre/services";
import { HowItWorks } from "@/components/andre/how-it-works";
import { FieldGallery } from "@/components/andre/field-gallery";
import { Pricing } from "@/components/andre/pricing";
import { Equipment } from "@/components/andre/equipment";
import { Coverage } from "@/components/andre/coverage";
import { StatsBand } from "@/components/andre/stats-band";
import { Testimonials } from "@/components/andre/testimonials";
import { FAQ } from "@/components/andre/faq";
import { FinalCTA } from "@/components/andre/final-cta";
import { Footer } from "@/components/andre/footer";
import { WhatsAppFloat } from "@/components/andre/whatsapp-float";
import { ConversionPopup } from "@/components/andre/conversion-popup";
import { AmbientCrystalsClient } from "@/components/andre/ambient-crystals-client";
import { Problema } from "@/components/andre/problema";
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
        <Hero />
        <MarqueeStrip />
        <Problema />
        <TrustBar />
        <Manifesto />
        <Services />
        <HowItWorks />
        <FieldGallery />
        <Pricing />
        <Equipment />
        <Coverage />
        <StatsBand />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppFloat />
      <ConversionPopup />
    </>
  );
}
