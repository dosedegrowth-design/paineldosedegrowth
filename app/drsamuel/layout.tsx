import type { Metadata, Viewport } from "next";
import "@fontsource/montserrat/800.css";
import "./drsamuel.css";

const DESCRICAO =
  "Estrutura de anúncios no Google e no Instagram para levar pacientes da região até o WhatsApp do Dr. Samuel Chagas.";

export const metadata: Metadata = {
  // absolute: sem o sufixo "· Tráfego DDG" do template da raiz, que é do painel interno
  title: { absolute: "Dr. Samuel Chagas · Estrutura de anúncios" },
  description: DESCRICAO,
  robots: { index: false, follow: false },
  // Prévia do link no WhatsApp
  openGraph: {
    title: "Dr. Samuel Chagas · Estrutura de anúncios",
    description: DESCRICAO,
    images: [{ url: "https://paineltrafego.dosedegrowth.com.br/drsamuel/capa.jpg", width: 1400, height: 788 }],
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0C0E",
  width: "device-width",
  initialScale: 1,
};

export default function DrSamuelLayout({ children }: { children: React.ReactNode }) {
  return <div className="ds-root">{children}</div>;
}
