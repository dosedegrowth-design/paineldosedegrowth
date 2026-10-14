"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { ChevronsLeftRight, Search, ShoppingBag } from "lucide-react";
import { brl, porId } from "@/app/palavracomalma/produtos";

const ITENS = [203, 259, 189, 269].map(porId);

/** Arrasta a barra: à esquerda um "modelo pronto", à direita o feito do zero. */
export function Comparar() {
  const [corte, setCorte] = useState(42);

  return (
    <div>
      <div className="pa-cel">
        <div className="pa-cel-tela" style={{ ["--corte" as string]: `${corte}%` }}>
          {/* modelo pronto */}
          <div className="pa-cmp-tela pa-cmp-mod" aria-hidden>
            <div className="pa-mod-cupom">FRETE GRÁTIS ACIMA DE R$ 199</div>
            <div className="pa-mod-top">
              <img src="/palavracomalma/logo-escuro.png" alt="" />
              <ShoppingBag size={16} />
            </div>
            <div className="pa-mod-busca">Buscar produtos...</div>
            <div className="pa-mod-banner">BANNER 1200 x 400</div>
            <div className="pa-mod-h">Destaques</div>
            <div className="pa-mod-grid">
              {ITENS.map((p) => (
                <div className="pa-mod-p" key={p.id}>
                  <img src={p.img} alt="" />
                  <b>{p.nome}</b>
                  <span>{brl(p.promo ?? p.preco)}</span>
                  <i>COMPRAR</i>
                </div>
              ))}
            </div>
          </div>

          {/* feito do zero */}
          <div className="pa-cmp-tela pa-cor-tela pa-cmp-cor" aria-hidden>
            <div className="pa-cor-cupom">✦ CUPOM ALMA10 · 10% NA PRIMEIRA COMPRA ✦</div>
            <div className="pa-cor-top">
              <img src="/palavracomalma/logo-claro.png" alt="" />
              <span style={{ display: "flex", gap: 14, color: "var(--ouro-2)" }}>
                <Search size={17} />
                <ShoppingBag size={17} />
              </span>
            </div>
            <div className="pa-cor-hero">
              <small>FEITO À MÃO · COM INTENÇÃO</small>
              <h4>Cadernos que guardam o seu sagrado</h4>
              <p>Coleção Orixás, Tarot e Frases</p>
            </div>
            <div className="pa-cor-chips">
              <span>Todos</span>
              <span>Cadernos</span>
              <span>Baralhos</span>
              <span>Magias</span>
            </div>
            <div className="pa-cor-grid">
              {ITENS.map((p) => (
                <div className="pa-cor-p" key={p.id}>
                  <img src={p.img} alt="" />
                  <b>{p.nome}</b>
                  <span>{brl(p.promo ?? p.preco)}</span>
                </div>
              ))}
            </div>
          </div>

          <span className="pa-cmp-rot is-a">Modelo pronto</span>
          <span className="pa-cmp-rot is-b">Feito do zero</span>
          <div className="pa-cmp-barra">
            <span className="pa-cmp-pega">
              <ChevronsLeftRight size={20} />
            </span>
          </div>
          <input
            className="pa-cmp-range"
            type="range"
            min={0}
            max={100}
            value={corte}
            onChange={(e) => setCorte(Number(e.target.value))}
            aria-label="Arraste para comparar o modelo pronto com o site feito do zero"
          />
        </div>
      </div>
      <p className="pa-cmp-dica">← arraste a barra dourada para os lados →</p>
    </div>
  );
}
