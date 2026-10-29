"use client";

import { reais } from "@/lib/tayssa/agendar";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { intercalar, type CategoriaCatalogo } from "@/lib/tayssa/catalogo";
import { FundoVivo } from "@/components/tayssa/ui/fundo-vivo";
import { Pendente, useEstrutura } from "@/components/tayssa/ui/estrutura";
import { Rolo } from "@/components/tayssa/public/rolo";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * O catálogo em movimento: a Tayssa sobe foto e vídeo no painel com
 * categoria e produto, e aqui cada produto vira um rolo. Abas pelas
 * categorias que têm material, pílulas pelos produtos; "Tudo" mostra a
 * categoria inteira. Sem nada no catálogo, a seção não existe (com
 * `?estrutura=1` ela aparece marcada como pendente).
 */
export function Catalogo({ catalogo }: { catalogo: CategoriaCatalogo[] }) {
  const reduced = useReducedMotion();
  const estrutura = useEstrutura();
  const [cat, setCat] = useState(0);
  const [prod, setProd] = useState<number | null>(null);

  if (!catalogo.length) {
    return estrutura ? (
      <section className="tyct ty-night" aria-label="Catálogo">
        <FundoVivo />
        <div className="ty-container tyct__miolo">
          <Pendente
            titulo="Catálogo em movimento"
            detalhe="Cada produto vira um rolo de fotos e vídeos. Alimentado pelo painel: Fotos → categoria + produto."
          />
        </div>
      </section>
    ) : null;
  }

  const categoria = catalogo[Math.min(cat, catalogo.length - 1)];
  const produto = prod === null ? null : categoria.produtos[prod];
  // "Tudo" alterna os produtos: o rolo passa o começo da fila, e assim mostra um pouco de cada
  const itens = produto ? produto.itens : intercalar(categoria.produtos.map((p) => p.itens));
  const titulo = produto ? produto.nome : categoria.label;

  return (
    <section id="catalogo" className="tyct ty-night" aria-label="Catálogo">
      <FundoVivo />
      <div className="ty-container tyct__miolo">
        <motion.div
          className="tyct__topo"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <h2 className="tyct__titulo">
            Cada técnica, <em>de perto.</em>
          </h2>
        </motion.div>

        {catalogo.length > 1 ? (
          <div className="tyct__abas" role="tablist" aria-label="Categorias">
            {catalogo.map((c, i) => (
              <button
                key={c.slug}
                type="button"
                role="tab"
                aria-selected={i === cat}
                className="tyct__aba"
                onClick={() => {
                  setCat(i);
                  setProd(null);
                }}
              >
                {i === cat ? (
                  <motion.span layoutId="tyct-aba" className="tyct__aba-fundo" transition={{ duration: reduced ? 0 : 0.45, ease: EASE }} />
                ) : null}
                <span className="tyct__aba-txt">
                  {c.label} <small>{c.total}</small>
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {categoria.produtos.length > 1 ? (
          <div className="tyct__produtos" aria-label="Produtos">
            <button type="button" className="tyct__produto" data-on={prod === null} onClick={() => setProd(null)}>
              Tudo de {categoria.label.toLowerCase()}
            </button>
            {categoria.produtos.map((p, i) => (
              <button key={p.nome} type="button" className="tyct__produto" data-on={prod === i} onClick={() => setProd(i)}>
                {p.nome} {p.preco != null ? <b className="tyct__preco">{reais(p.preco)}</b> : <small>{p.itens.length}</small>}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <motion.div
        key={`${categoria.slug}-${prod ?? "tudo"}`}
        initial={reduced ? false : { opacity: 0, y: 30, filter: "blur(8px)" }}
        // o filtro sai no fim: com blur(0px) parado, o rolo inteiro (vídeo e cartões
        // correndo) virava uma camada filtrada, refeita a cada quadro
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <Rolo itens={itens} rotulo={`Fotos e vídeos: ${titulo}`} />
      </motion.div>
    </section>
  );
}
