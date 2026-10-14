"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { brl, porId } from "@/app/palavracomalma/produtos";

const FORMAS = [
  { id: "reto", nome: "Reto", texto: "O clássico, como quase todo site. Limpo, mas comum." },
  { id: "arco", nome: "Arco / portal", texto: "Topo arredondado, como janela de capela ou portal. Dá clima místico na hora." },
  { id: "carta", nome: "Carta de tarot", texto: "Moldura dourada com estrela no topo. Cada produto vira uma carta." },
  { id: "lua", nome: "Lua", texto: "Recorte redondo com contorno pontilhado. Bom para coleções e categorias." },
];

const LAYOUTS = [
  { id: "catalogo", nome: "Catálogo", texto: "Grade de 2 colunas no celular (4 no computador). É o jeito MenuFy: rolar e escolher." },
  { id: "carrossel", nome: "Carrossel", texto: "Fileira que desliza para o lado com o dedo. Bom para lançamentos e “mais vendidos”." },
  { id: "editorial", nome: "Vitrine editorial", texto: "Um produto grande em destaque e outros menores ao lado, como capa de revista." },
  { id: "lista", nome: "Lista", texto: "Foto pequena, nome e preço em linha. Rápido para quem já sabe o que quer." },
];

const TRES = [203, 263, 199].map(porId);
const OITO = [227, 259, 189, 235, 269, 261, 297, 241].map(porId);

export function Formatos() {
  const [forma, setForma] = useState("arco");
  const [layout, setLayout] = useState("catalogo");
  const f = FORMAS.find((x) => x.id === forma)!;
  const l = LAYOUTS.find((x) => x.id === layout)!;

  return (
    <>
      <div className="pa-demo">
        <div className={`pa-forma-grid pa-forma-${forma}`}>
          {TRES.map((p) => (
            <div className="pa-forma-p" key={p.id}>
              <div className="pa-fig">
                <img src={p.img} alt={p.nome} />
              </div>
              <b>{p.nome.split(" · ")[0]}</b>
              <span>{brl(p.promo ?? p.preco)}</span>
            </div>
          ))}
        </div>
        <div className="pa-demo-lado">
          <div>
            <p className="pa-sel-t">Formato da foto do produto</p>
            <div className="pa-sel" role="group" aria-label="Formatos">
              {FORMAS.map((x) => (
                <button key={x.id} aria-pressed={x.id === forma} onClick={() => setForma(x.id)}>
                  {x.nome}
                </button>
              ))}
            </div>
          </div>
          <p className="pa-explica">
            <b>{f.nome}:</b> {f.texto}
          </p>
        </div>
      </div>

      <div className="pa-lay">
        <p className="pa-sel-t">Jeito de organizar os produtos na página</p>
        <div className="pa-sel" role="group" aria-label="Organização">
          {LAYOUTS.map((x) => (
            <button key={x.id} aria-pressed={x.id === layout} onClick={() => setLayout(x.id)}>
              {x.nome}
            </button>
          ))}
        </div>
        <p className="pa-explica" style={{ margin: "14px 0" }}>
          <b>{l.nome}:</b> {l.texto}
        </p>
        <div className="pa-lay-tela">
          <div key={layout} className={`pa-lay-${layout} pa-lay-anim`}>
            {OITO.map((p) => (
              <div className="pa-lay-item" key={p.id}>
                <div className="pa-fig">
                  <img src={p.img} alt={p.nome} loading="lazy" />
                </div>
                <b>{p.nome}</b>
                <span>{brl(p.promo ?? p.preco)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
