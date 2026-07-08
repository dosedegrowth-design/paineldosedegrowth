import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/andre/navbar";
import { Footer } from "@/components/andre/footer";
import { WhatsAppFloat } from "@/components/andre/whatsapp-float";
import { AmbientCrystalsClient } from "@/components/andre/ambient-crystals-client";
import { ThermoOverlay } from "@/components/andre/thermo-overlay";
import { SmoothScroll } from "@/components/andre/smooth-scroll";
import { CursorGlow } from "@/components/andre/cursor-glow";
import { SiteFrame } from "@/components/andre/site-frame";
import { CustomCursor } from "@/components/andre/custom-cursor";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter-tight/700.css";
import "@fontsource/inter-tight/800.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./andre.css";

export const metadata: Metadata = {
  title: "Climafrio — Soluções em Climatização desde 1985 | São Paulo",
  description:
    "Projetos, instalação e manutenção de sistemas de climatização pra hospitais, indústrias, comércio e residências. Split, VRF, VRV, Self Contained e Chiller. Desde 1985 em São Paulo.",
  applicationName: "Climafrio",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Climafrio — Melhore o ar que você respira.",
    description:
      "Soluções em climatização desde 1985: projetos, instalação e manutenção pra hospitalar, industrial, sala limpa, comercial e residencial.",
    type: "website",
    locale: "pt_BR",
    images: [{ url: "/andre/hero-ac.jpg", width: 1600, height: 1024 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#060a14",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HVACBusiness",
  name: "Climafrio",
  description:
    "Soluções em climatização desde 1985: projetos, instalação e manutenção de Split, Multi Split, VRF, VRV, Self Contained e Chiller pra hospitalar, industrial, sala limpa, comercial e residencial.",
  foundingDate: "1985",
  telephone: "+551120957000",
  url: "https://painel.dosedegrowth.com/andre",
  email: "vendas@climafrio.com.br",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua Padre Adelino, 2074",
    addressLocality: "São Paulo",
    addressRegion: "SP",
    addressCountry: "BR",
  },
  areaServed: [
    "São Paulo",
    "Guarulhos",
    "Osasco",
    "Santo André",
    "São Bernardo do Campo",
    "Barueri",
    "Alphaville",
  ],
  openingHours: "Mo-Sa 08:00-20:00",
  priceRange: "$$",
  sameAs: [],
};

export default function AndreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="andre-scope">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SmoothScroll />
      <AmbientCrystalsClient />
      <ThermoOverlay />
      <CursorGlow />
      <SiteFrame />
      <CustomCursor />
      <Navbar />
      <main className="relative z-10">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
