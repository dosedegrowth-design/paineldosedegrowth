import { Navbar } from "@/components/andre/navbar";
import { Hero } from "@/components/andre/hero";
import { TrustBar } from "@/components/andre/trust-bar";
import { Services } from "@/components/andre/services";
import { HowItWorks } from "@/components/andre/how-it-works";
import { Equipment } from "@/components/andre/equipment";
import { Coverage } from "@/components/andre/coverage";
import { Testimonials } from "@/components/andre/testimonials";
import { FAQ } from "@/components/andre/faq";
import { FinalCTA } from "@/components/andre/final-cta";
import { Footer } from "@/components/andre/footer";
import { WhatsAppFloat } from "@/components/andre/whatsapp-float";
import { ConversionPopup } from "@/components/andre/conversion-popup";
import { TechHud } from "@/components/andre/tech-hud";
import { AndreExperienceClient } from "@/components/andre/andre-experience-client";
import { FieldGallery } from "@/components/andre/field-gallery";
import { StatsBand } from "@/components/andre/stats-band";

export default function AndrePage() {
  return (
    <>
      <AndreExperienceClient />
      <Navbar />
      <main className="relative">
        <Hero />
        <TrustBar />
        <Services />
        <HowItWorks />
        <FieldGallery />
        <Equipment />
        <Coverage />
        <Testimonials />
        <StatsBand />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <TechHud />
      <WhatsAppFloat />
      <ConversionPopup />
    </>
  );
}
