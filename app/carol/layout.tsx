import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/fraunces/full-italic.css";
import "./carol.css";
import { IG_URL, TIKTOK_URL } from "@/components/carol/site-data";

const SITE_URL = "https://www.carolinakuhn.com.br";
const TITLE = "Carolina Kühn — UGC Creator & Estrategista";
const DESCRIPTION =
  "8+ anos de estratégia nos bastidores de marcas como Nestlé, Itaú e Apple — agora na frente da câmera. UGC, modelo e uma comunidade de mulheres que confia. 2,16 mi de visualizações em 30 dias.";

export const metadata: Metadata = {
  // Domínio próprio da Carol (raiz reescreve pra /carol no middleware);
  // painel.dosedegrowth.com/carol segue servindo, mas o canonical é ela
  metadataBase: new URL(SITE_URL),
  title: { absolute: TITLE },
  description: DESCRIPTION,
  applicationName: "Carolina Kühn",
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  // Ícone próprio da Carol — sobrescreve o do painel herdado do root layout.
  // URLs em /carol/ (e não /favicon.ico) pra não cair no cache de favicon
  // que o navegador guarda por domínio.
  icons: {
    icon: [
      { url: "/carol/icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/carol/favicon.ico", sizes: "48x48" },
    ],
    apple: { url: "/carol/apple-icon.png", sizes: "180x180" },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
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
  url: SITE_URL,
  jobTitle: "UGC Creator e Estrategista de Conteúdo",
  description:
    "Publicitária com 8+ anos de mercado digital, UGC creator, modelo e bailarina. Atuou na estratégia e criação de conteúdo para Nestlé, Itaú, Caudalie, McDonald's, Apple, ONU e Clinique.",
  knowsAbout: [
    "UGC",
    "Marketing de influência",
    "Estratégia de conteúdo",
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
