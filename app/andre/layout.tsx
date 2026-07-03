import type { Metadata, Viewport } from "next";
import "./andre.css";

export const metadata: Metadata = {
  title: "André Ar Condicionado — Instalação, manutenção e higienização em SP",
  description:
    "Serviço rápido, técnico especializado e garantia real. Split, Multi Split, VRF, Piso Teto, Cassete. Atendimento em 24h em São Paulo e Grande SP.",
  applicationName: "André Ar Condicionado",
  robots: { index: true, follow: true },
  openGraph: {
    title: "André Ar Condicionado — Ar que trabalha, técnico que resolve.",
    description:
      "Instalação, manutenção preventiva, higienização e recarga de gás com garantia. Orçamento gratuito pelo WhatsApp.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  themeColor: "#050914",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HVACBusiness",
  name: "André Ar Condicionado",
  description:
    "Instalação, manutenção preventiva, higienização e recarga de gás de ar condicionado em São Paulo e Grande SP. Split, Multi Split, VRF, Piso Teto e Cassete.",
  telephone: "+5511965812966",
  url: "https://painel.dosedegrowth.com/andre",
  address: {
    "@type": "PostalAddress",
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
