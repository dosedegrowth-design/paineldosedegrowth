import type { Metadata, Viewport } from "next";
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
  title: "Climafrio — Ar-condicionado em São Paulo | Instalação e Manutenção",
  description:
    "Instalação, manutenção e higienização de ar-condicionado com precisão técnica. Split, Multi Split, VRF. Orçamento em minutos no WhatsApp, atendimento em 24h em SP.",
  applicationName: "Climafrio",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Climafrio — O frio certo, no silêncio certo.",
    description:
      "Instalação, manutenção e higienização de ar-condicionado com precisão de engenharia. Orçamento em minutos pelo WhatsApp.",
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
    "Instalação, manutenção preventiva, higienização e recarga de gás de ar condicionado em São Paulo e Grande SP. Split, Multi Split, VRF, Piso Teto e Cassete.",
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
      {children}
    </div>
  );
}
