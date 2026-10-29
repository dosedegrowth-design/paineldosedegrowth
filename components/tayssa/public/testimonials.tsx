"use client";

import { useState } from "react";
import type { ConteudoSite } from "@/lib/tayssa/content";
import { temDepoimentos } from "@/lib/tayssa/content";
import { Reveal } from "@/components/tayssa/ui/reveal";
import { Pendente, useEstrutura } from "@/components/tayssa/ui/estrutura";
import { Bloom } from "@/components/tayssa/flora/bloom";

/** quantos aparecem antes do "ver mais": catorze falas seguidas não cabem no celular */
const PRIMEIROS = 6;

/**
 * Depoimentos — só palavras reais, com autorização de cada cliente.
 * Nunca escritos por nós. Sem nenhum, a seção não existe.
 */
export function Testimonials({ conteudo }: { conteudo: ConteudoSite }) {
  const estrutura = useEstrutura();
  const [todos, setTodos] = useState(false);
  if (!temDepoimentos(conteudo) && !estrutura) return null;
  const lista = conteudo.depoimentos;
  const visiveis = todos ? lista : lista.slice(0, PRIMEIROS);

  return (
    <section id="depoimentos" className="ty-section tydp" aria-label="Depoimentos">
      <div className="ty-container">
        <Reveal className="tydp__topo" y={14}>
          <span className="ty-mono ty-mono--ink">Quem já sentou na cadeira</span>
          <span className="ty-index">
            <b>{String(lista.length).padStart(2, "0")}</b> palavras de clientes
          </span>
        </Reveal>
        <div className="ty-rule" />

        {lista.length ? (
          <ul className="tydp__lista" id="tydp-lista">
            {visiveis.map((d, i) => (
              <Reveal key={i} as="li" className="tydp__item" delay={Math.min(i, 3) * 0.07}>
                <span className="tydp__flor" aria-hidden>
                  <Bloom kind="botao" seed={60 + i} tom={i % 2 ? "rosa" : "vinho"} />
                </span>
                <blockquote className="tydp__texto">
                  <p>
                    <em>“</em>
                    {d.texto}
                    <em>”</em>
                  </p>
                </blockquote>
                <p className="ty-mono tydp__quem">{[d.nome, d.fonte].filter(Boolean).join(" · ")}</p>
              </Reveal>
            ))}
          </ul>
        ) : null}
        {lista.length > PRIMEIROS ? (
          <div className="tydp__mais">
            <button
              type="button"
              className="ty-link ty-link--caps"
              aria-expanded={todos}
              aria-controls="tydp-lista"
              onClick={() => {
                // ao recolher, volta ao começo da seção: a lista encolhe e a
                // pessoa cairia no meio da seção seguinte
                const secao = todos ? document.getElementById("depoimentos") : null;
                if (secao) {
                  if (window.__tyLenis) window.__tyLenis.scrollTo(secao, { offset: -8, immediate: true });
                  else secao.scrollIntoView({ block: "start" });
                }
                setTodos((v) => !v);
              }}
            >
              {todos ? "Mostrar menos" : `Ver mais ${lista.length - PRIMEIROS} depoimentos`}
            </button>
          </div>
        ) : null}
        {lista.length ? null : (
          <Pendente
            titulo="Depoimentos de clientes"
            detalhe="3 a 6 falas reais (print do WhatsApp/Instagram serve de origem), com o primeiro nome e a autorização de cada cliente para publicar."
          />
        )}
      </div>
    </section>
  );
}
