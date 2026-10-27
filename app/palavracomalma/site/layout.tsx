/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { SacolaProvider } from "@/components/palavracomalma/site/sacola";
import { Cabecalho } from "@/components/palavracomalma/site/cabecalho";
import { WhatsAppFlutuante, WhatsAppIcon } from "@/components/palavracomalma/site/whatsapp";
import { Surgir } from "@/components/palavracomalma/site/surgir";
import { BASE, EMAIL, INSTAGRAM, MENU, PRODUTOS, cartao, waLink } from "./catalogo";
import "./loja.css";

export const metadata: Metadata = {
  title: { absolute: "Palavra com Alma · Cadernos, baralhos e magias feitos à mão" },
  description:
    "Cadernos personalizados, baralhos, magias e peças em 3D com produção própria. Coleção Orixás, Coleção Tarot e muito mais. Enviamos para todo o Brasil.",
  robots: { index: false, follow: false },
};

export default function LojaLayout({ children }: { children: React.ReactNode }) {
  const menu = MENU.map((c) => ({ id: c.id, nome: c.nome, slug: c.slug, filhas: c.filhas.map((f) => ({ id: f.id, nome: f.nome, slug: f.slug })) }));
  const cartoes = PRODUTOS.map(cartao);

  return (
    <div className="lj">
      <SacolaProvider>
        <Cabecalho menu={menu} cartoes={cartoes} />
        <main id="conteudo">{children}</main>
        <footer className="lj-rodape">
          <div className="lj-wrap lj-rod-grade">
            <div className="lj-rod-marca">
              <img src="/palavracomalma/logo-claro.png" alt="Palavra com Alma" width={900} height={385} />
              <p>Cadernos, baralhos e magias com produção própria. Cada peça é feita à mão, com intenção.</p>
            </div>
            <div>
              <h3>Loja</h3>
              <Link href={`${BASE}/loja`}>Toda a loja</Link>
              {menu.map((c) => (
                <Link key={c.id} href={`${BASE}/loja?c=${encodeURIComponent(c.slug)}`}>
                  {c.nome}
                </Link>
              ))}
            </div>
            <div>
              <h3>Atendimento</h3>
              <a href={waLink("Oi, Palavra com Alma! Vim pelo site.")} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon size={15} /> (11) 94527-8301
              </a>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
                Instagram @loja.palavracomalma
              </a>
            </div>
            <div>
              <h3>Compra segura</h3>
              <p>Pix, boleto ou cartão de crédito em até 3x.</p>
              <p>Envio para todo o Brasil, com código de rastreio.</p>
            </div>
          </div>
          <div className="lj-wrap lj-rod-base">
            <span>© 2026 Palavra com Alma</span>
            <span>Versão experimental do site novo · Dose de Growth</span>
          </div>
        </footer>
        <WhatsAppFlutuante />
        <Surgir />
      </SacolaProvider>
    </div>
  );
}
