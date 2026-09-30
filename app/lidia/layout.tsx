import type { Metadata, Viewport } from "next";
import "./lidia.css";

export const metadata: Metadata = {
  title: "Lidia Guimarães — Funil de conteúdo | Dose de Growth",
  description:
    "Estratégia de conteúdo e anúncios para levar compradores e vendedores de imóveis até o WhatsApp da Lidia Guimarães.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#14110f",
  width: "device-width",
  initialScale: 1,
};

export default function LidiaLayout({ children }: { children: React.ReactNode }) {
  return <div className="ld-root">{children}</div>;
}
