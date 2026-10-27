/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { SacolaProvider } from "@/components/palavracomalma/site/sacola";
import "./loja.css";

export const metadata: Metadata = {
  title: { absolute: "Palavra com Alma · Cadernos, baralhos e magias feitos à mão" },
  description:
    "Cadernos personalizados, baralhos, magias e peças em 3D com produção própria. Coleção Orixás, Coleção Tarot e muito mais. Enviamos para todo o Brasil.",
  robots: { index: false, follow: false },
};

// Mostra a abertura com o logo só na primeira página da sessão.
const SCRIPT_INTRO = `try{if(sessionStorage.getItem("pca-intro"))document.documentElement.classList.add("lj-sem-intro");else sessionStorage.setItem("pca-intro","1")}catch(e){}`;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lj">
      <script dangerouslySetInnerHTML={{ __html: SCRIPT_INTRO }} />
      <div className="lj-intro" aria-hidden>
        <img src="/palavracomalma/logo-claro.png" alt="" />
        <i />
      </div>
      <SacolaProvider>{children}</SacolaProvider>
    </div>
  );
}
