import type { Metadata, Viewport } from "next";
import "@fontsource/montserrat/800.css";
import "./drsamuel.css";

export const metadata: Metadata = {
  title: "Dr. Samuel Chagas — Estrutura de anúncios | Dose de Growth",
  description:
    "Estrutura de anúncios no Google e no Instagram para levar pacientes da região até o WhatsApp do Dr. Samuel Chagas.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0A0C0E",
  width: "device-width",
  initialScale: 1,
};

export default function DrSamuelLayout({ children }: { children: React.ReactNode }) {
  return <div className="ds-root">{children}</div>;
}
