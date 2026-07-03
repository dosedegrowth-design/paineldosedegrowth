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

export default function AndrePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Services />
        <HowItWorks />
        <Equipment />
        <Coverage />
        <Testimonials />
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
