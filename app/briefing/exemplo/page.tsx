import type { Metadata, Viewport } from "next";
import "../briefing.css";
import { BriefingExemplo } from "@/components/briefing/briefing-exemplo";

export const metadata: Metadata = {
  title: { absolute: "Briefing do site · Exemplo" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#f7f4ef" };

/**
 * Cópia de exemplo do briefing que a Tayssa respondeu, para mostrar em
 * outros projetos. Sem chave e sem banco: não guarda nada de ninguém (as
 * respostas ficam no aparelho de quem abre).
 */
export default function BriefingExemploPagina() {
  return <BriefingExemplo />;
}
