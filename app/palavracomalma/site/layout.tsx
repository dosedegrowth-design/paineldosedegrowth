import type { Metadata } from "next";
import { Caveat, IM_Fell_English, IM_Fell_English_SC, Spectral } from "next/font/google";
import { SacolaProvider } from "@/components/palavracomalma/site/sacola";
import "./loja.css";

// Tipografia de livro antigo (IM Fell, dos tipos de impressão do séc. XVII), texto em Spectral
// e uma letra de mão para as anotações de caderno.
const fell = IM_Fell_English({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--f-fell" });
const fellSc = IM_Fell_English_SC({ weight: "400", subsets: ["latin"], variable: "--f-fell-sc" });
const spectral = Spectral({ weight: ["400", "500", "600", "700"], style: ["normal", "italic"], subsets: ["latin"], variable: "--f-spectral" });
const mao = Caveat({ weight: ["500", "700"], subsets: ["latin"], variable: "--f-caveat" });

export const metadata: Metadata = {
  title: { absolute: "Palavra com Alma · Cadernos, baralhos e magias feitos à mão" },
  description:
    "Cadernos personalizados, baralhos, magias e peças em 3D com produção própria. Coleção Orixás, Coleção Tarot e muito mais. Enviamos para todo o Brasil.",
  robots: { index: false, follow: false },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`lj ${fell.variable} ${fellSc.variable} ${spectral.variable} ${mao.variable}`}>
      <SacolaProvider>{children}</SacolaProvider>
    </div>
  );
}
