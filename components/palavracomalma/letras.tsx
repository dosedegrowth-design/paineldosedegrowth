"use client";

import { useState } from "react";

const FONTES = [
  { nome: "Artesanal", classe: "pa-f-fraunces", fonte: "Fraunces", uso: "Títulos com cara de livro antigo, curvas suaves. Combina com o feito à mão." },
  { nome: "Místico", classe: "pa-f-cinzel", fonte: "Cinzel", uso: "Letras de inscrição, como em pedra ou em carta de tarot. Boa para títulos curtos." },
  { nome: "Editorial", classe: "pa-f-bodoni", fonte: "Bodoni Moda", uso: "Contraste forte entre traços finos e grossos. Cara de revista, de luxo." },
  { nome: "Escrita à mão", classe: "pa-f-mao", fonte: "Pinyon Script", uso: "Parece caneta tinteiro, como o “Loja” do seu logo. Só para detalhes, nunca para textos longos." },
  { nome: "Moderno", classe: "pa-f-grot", fonte: "Hanken Grotesk", uso: "Limpa e direta. Mais atual, menos mística. Ótima para textos e preços." },
];

export function Letras() {
  const [i, setI] = useState(0);
  const f = FONTES[i];
  return (
    <div className="pa-card pa-tipo">
      <div className="pa-tipo-prev">
        <small>Coleção Orixás</small>
        <h3 className={f.classe}>Caderno Oxóssi</h3>
        <p>Capa autoral, miolo personalizado e produção própria.</p>
        <p className={`pa-preco ${f.classe}`}>R$ 92,49</p>
      </div>
      <div className="pa-tipo-info">
        <div>
          <p className="pa-sel-t">Toque para trocar a letra</p>
          <div className="pa-sel" role="group" aria-label="Tipos de letra">
            {FONTES.map((x, k) => (
              <button key={x.nome} aria-pressed={k === i} onClick={() => setI(k)}>
                {x.nome}
              </button>
            ))}
          </div>
        </div>
        <p>
          <b>{f.fonte}</b>
          {f.uso}
        </p>
        <p>
          <b>Na prática</b>
          Normalmente usamos duas: uma com personalidade para títulos e uma bem legível para textos e preços. As fontes ficam
          dentro do próprio site, então aparecem iguais em qualquer celular.
        </p>
      </div>
    </div>
  );
}
