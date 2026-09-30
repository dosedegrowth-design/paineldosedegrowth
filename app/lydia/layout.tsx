import type { Metadata, Viewport } from "next";
import "./lydia.css";

export const metadata: Metadata = {
  title: "Lydia Magalhães — Funil de conteúdo | Dose de Growth",
  description:
    "Estratégia de conteúdo e anúncios para levar compradores e vendedores de imóveis até o WhatsApp da Lydia Magalhães.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#14110f",
  width: "device-width",
  initialScale: 1,
};

export default function LydiaLayout({ children }: { children: React.ReactNode }) {
  return <div className="ld-root">{children}</div>;
}
