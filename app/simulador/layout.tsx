import type { Metadata, Viewport } from "next";
import "@fontsource-variable/public-sans";
import "./simulador.css";
import { BRAND, SEO } from "@/lib/simulador/config";

/**
 * Simulador de benefício — protótipo interno, 100% no navegador.
 * Plataforma independente com linguagem visual institucional; a identidade
 * é própria (lib/simulador/config.ts) e não representa órgão público.
 */
export const metadata: Metadata = {
  title: { absolute: SEO.title },
  description: SEO.description,
  applicationName: BRAND.name,
  robots: BRAND.indexable
    ? { index: true, follow: true }
    : { index: false, follow: false },
  // Ícone próprio (sobrescreve o do painel herdado do root layout)
  icons: {
    icon: [
      { url: "/simulador/icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/simulador/icon-32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: { url: "/simulador/apple-icon.png", sizes: "180x180" },
  },
  openGraph: {
    title: SEO.title,
    description: SEO.description,
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  themeColor: BRAND.themeColor,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function SimuladorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="sim-scope">{children}</div>;
}
