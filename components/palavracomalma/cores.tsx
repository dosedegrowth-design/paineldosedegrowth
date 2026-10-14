"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { brl, porId } from "@/app/palavracomalma/produtos";

type Paleta = {
  nome: string;
  clima: string;
  logo: "claro" | "escuro";
  cores: { fundo: string; sup: string; dest: string; botao: string; txt: string; txt2: string; botaoTxt: string };
};

const PALETAS: Paleta[] = [
  {
    nome: "Vinho e ouro",
    clima: "O jeito da marca hoje, mais elegante: fundo vinho quase preto, detalhes dourados.",
    logo: "claro",
    cores: { fundo: "#1A0B0F", sup: "#2A1117", dest: "#C9A45C", botao: "#8E1B2E", txt: "#F1E4CB", txt2: "rgba(241,228,203,.7)", botaoTxt: "#F1E4CB" },
  },
  {
    nome: "Noite de lua",
    clima: "Azul-noite com prata e lilás. Mais calmo, puxa para tarot e lua.",
    logo: "claro",
    cores: { fundo: "#0C0B16", sup: "#17162B", dest: "#C7C2EE", botao: "#3D3283", txt: "#ECEAF8", txt2: "rgba(236,234,248,.68)", botaoTxt: "#ECEAF8" },
  },
  {
    nome: "Vela e pergaminho",
    clima: "Fundo claro cor de papel antigo com vinho. Artesanal e acolhedor.",
    logo: "escuro",
    cores: { fundo: "#F3E9D7", sup: "#FFF9EE", dest: "#8E1B2E", botao: "#5B1324", txt: "#2B1A14", txt2: "rgba(43,26,20,.68)", botaoTxt: "#F7EEDD" },
  },
  {
    nome: "Sangue e carvão",
    clima: "Preto com vermelho vivo. Mais forte, mais gótico.",
    logo: "claro",
    cores: { fundo: "#0A0A0A", sup: "#171717", dest: "#E0263F", botao: "#E0263F", txt: "#F5F2EE", txt2: "rgba(245,242,238,.66)", botaoTxt: "#ffffff" },
  },
];

const PAPEIS: { chave: keyof Paleta["cores"]; nome: string }[] = [
  { chave: "fundo", nome: "Fundo" },
  { chave: "sup", nome: "Cartões" },
  { chave: "dest", nome: "Destaque" },
  { chave: "botao", nome: "Botão" },
  { chave: "txt", nome: "Texto" },
];

const PRODUTO = porId(203);

export function Cores() {
  const [i, setI] = useState(0);
  const p = PALETAS[i];
  const c = p.cores;
  const vars = {
    "--fundo": c.fundo,
    "--sup": c.sup,
    "--dest": c.dest,
    "--botao": c.botao,
    "--txt": c.txt,
    "--txt2": c.txt2,
    "--botao-txt": c.botaoTxt,
  } as React.CSSProperties;

  return (
    <div className="pa-demo">
      <div className="pa-cel pa-pal" style={vars}>
        <div className="pa-cel-tela is-curta">
          <div className="pa-pal-cupom">✦ Frete grátis acima de R$ 199 ✦</div>
          <div className="pa-pal-top">
            <img src={`/palavracomalma/logo-${p.logo}.png`} alt="" />
            <span className="pa-sacola" style={{ display: "flex", gap: 14 }}>
              <Search size={17} />
              <ShoppingBag size={17} />
            </span>
          </div>
          <div className="pa-pal-hero">
            <small>COLEÇÃO ORIXÁS</small>
            <h4>Escrito com intenção, feito à mão</h4>
            <p>Cadernos A4 e A5 com capa autoral e miolo personalizado.</p>
          </div>
          <div className="pa-pal-card">
            <img src={PRODUTO.img} alt="" />
            <div>
              <span className="pa-pal-selo">-10%</span>
              <b>{PRODUTO.nome}</b>
              <s>{brl(PRODUTO.preco)}</s>
              <strong>{brl(PRODUTO.promo!)}</strong>
            </div>
          </div>
          <div className="pa-pal-botao">Adicionar ao carrinho</div>
          <div className="pa-pal-chips">
            <span>Cadernos</span>
            <span>Baralhos</span>
            <span>Magias</span>
          </div>
        </div>
      </div>

      <div className="pa-demo-lado">
        <div>
          <p className="pa-sel-t">Toque para trocar a paleta</p>
          <div className="pa-sel" role="group" aria-label="Paletas">
            {PALETAS.map((x, k) => (
              <button key={x.nome} aria-pressed={k === i} onClick={() => setI(k)}>
                {x.nome}
              </button>
            ))}
          </div>
        </div>
        <p className="pa-explica">
          <b>{p.nome}:</b> {p.clima}
        </p>
        <div className="pa-amostras">
          {PAPEIS.map((r) => (
            <div className="pa-amostra" key={r.chave}>
              <i style={{ background: c[r.chave] }} />
              {r.nome}
              <code>{c[r.chave].startsWith("#") ? c[r.chave] : "—"}</code>
            </div>
          ))}
        </div>
        <div>
          <p className="pa-sel-t">E não é só cor chapada</p>
          <div className="pa-extras">
            <div className="pa-extra">
              <span>Dourado em degradê</span>
              <b className="pa-ex-ouro pa-ouro">Alma</b>
            </div>
            <div className="pa-extra is-papel">
              <span>Textura de papel</span>
              <b>feito à mão</b>
            </div>
            <div className="pa-extra is-brilho">
              <span>Brilho de vela</span>
              <b>Magias</b>
            </div>
            <div className="pa-extra is-degrade">
              <span>Fundo em degradê</span>
              <b>Coleção Tarot</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
