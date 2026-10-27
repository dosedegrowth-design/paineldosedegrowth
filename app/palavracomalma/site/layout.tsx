import type { Metadata } from "next";
import { SacolaProvider } from "@/components/palavracomalma/site/sacola";
import "./loja.css";

export const metadata: Metadata = {
  title: { absolute: "Palavra com Alma · Cadernos, baralhos e magias feitos à mão" },
  description:
    "Cadernos personalizados, baralhos, magias e peças em 3D com produção própria. Coleção Orixás, Coleção Tarot e muito mais. Enviamos para todo o Brasil.",
  robots: { index: false, follow: false },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lj">
      <SacolaProvider>{children}</SacolaProvider>
    </div>
  );
}
