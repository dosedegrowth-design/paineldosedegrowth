import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/fraunces/full-italic.css";
import "./carol.css";
import { IG_URL, TIKTOK_URL } from "@/components/carol/site-data";

const TITLE = "Carolina Kühn — UGC Creator & Estrategista";
const DESCRIPTION =
  "8+ anos de estratégia nos bastidores de marcas como Nestlé, Itaú e Apple — agora na frente da câmera. UGC, fotografia, e uma comunidade de mulheres que confia. 2,16 mi de visualizações em 30 dias.";

export const metadata: Metadata = {
  metadataBase: new URL("https://paineltrafego.dosedegrowth.com.br"),
  title: { absolute: TITLE },
  description: DESCRIPTION,
  applicationName: "Carolina Kühn",
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://paineltrafego.dosedegrowth.com.br/carol",
    type: "website",
    locale: "pt_BR",
    images: [{ url: "/carol/og.jpg", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f1e7",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Carolina Kühn",
  jobTitle: "UGC Creator e Estrategista de Conteúdo",
  description:
    "Publicitária com 8+ anos de mercado digital, UGC creator e fotógrafa. Atuou na estratégia e criação de conteúdo para Nestlé, Itaú, Caudalie, McDonald's, Apple, ONU e Clinique.",
  knowsAbout: [
    "UGC",
    "Marketing de influência",
    "Estratégia de conteúdo",
    "Fotografia",
  ],
  sameAs: [IG_URL, TIKTOK_URL],
};

export default function CarolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="carol-scope">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="carol-grain" aria-hidden />
      {children}
    </div>
  );
}
