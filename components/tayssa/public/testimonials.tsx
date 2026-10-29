"use client";

import Image from "next/image";
import { useState } from "react";
import type { ConteudoSite } from "@/lib/tayssa/content";
import { temDepoimentos } from "@/lib/tayssa/content";
import { Reveal } from "@/components/tayssa/ui/reveal";
import { Pendente, useEstrutura } from "@/components/tayssa/ui/estrutura";

/** no celular, quantos prints aparecem antes do "ver mais" (no computador vão todos, em colunas) */
const PRIMEIROS = 3;

/**
 * Depoimentos: os prints das mensagens que as clientes mandaram para a
 * Tayssa no WhatsApp, recortados no balão (nada de nome, foto ou telefone
 * de cliente). Avaliação no site é print, não texto nosso (pedido do
 * Lucas). No celular, um embaixo do outro com "ver mais" (os prints têm
 * alturas muito diferentes: de lado, o mais alto deixava buraco embaixo dos
 * curtos); no computador, em colunas. Sem nenhum, a seção não existe.
 */
export function Testimonials({ conteudo }: { conteudo: ConteudoSite }) {
  const estrutura = useEstrutura();
  const [todos, setTodos] = useState(false);
  if (!temDepoimentos(conteudo) && !estrutura) return null;
  const lista = conteudo.depoimentos;

  return (
    <section id="depoimentos" className="ty-section tydp" aria-label="Depoimentos">
      <div className="ty-container">
        <Reveal className="tydp__topo" y={14}>
          <span className="ty-mono ty-mono--ink">Quem já sentou na cadeira</span>
          <span className="ty-index">
            <b>{String(lista.length).padStart(2, "0")}</b> mensagens no WhatsApp
          </span>
        </Reveal>
        <div className="ty-rule" />

        {lista.length ? (
          <>
            <ul className="tydp__prints" id="tydp-prints" data-todos={todos ? "true" : "false"}>
              {lista.map((d, i) => (
                <li key={d.print.src} className="tydp__print" data-extra={i >= PRIMEIROS ? "true" : undefined}>
                  <Reveal as="div" delay={Math.min(i, 3) * 0.06} amount={0.15}>
                    <figure className="tydp__balao">
                      <Image
                        src={d.print.src}
                        alt={`Mensagem de cliente no WhatsApp: ${d.texto}`}
                        width={d.print.largura}
                        height={d.print.altura}
                        sizes="(max-width: 899px) 92vw, 380px"
                        draggable={false}
                      />
                    </figure>
                  </Reveal>
                </li>
              ))}
            </ul>
            {lista.length > PRIMEIROS ? (
              <div className="tydp__mais">
                <button
                  type="button"
                  className="ty-link ty-link--caps"
                  aria-expanded={todos}
                  aria-controls="tydp-prints"
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
                  {todos ? "Mostrar menos" : `Ver mais ${lista.length - PRIMEIROS} mensagens`}
                </button>
              </div>
            ) : null}
            <p className="ty-mono tydp__fonte">Mensagens reais, enviadas pelas clientes à Tayssa</p>
          </>
        ) : (
          <Pendente
            titulo="Depoimentos de clientes"
            detalhe="Prints de mensagens do WhatsApp, recortados no balão (sem nome, foto ou telefone da cliente)."
          />
        )}
      </div>
    </section>
  );
}
