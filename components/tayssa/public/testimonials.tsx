"use client";

import type { ConteudoSite } from "@/lib/tayssa/content";
import { temDepoimentos } from "@/lib/tayssa/content";
import { Reveal } from "@/components/tayssa/ui/reveal";
import { Pendente, useEstrutura } from "@/components/tayssa/ui/estrutura";
import { Bloom } from "@/components/tayssa/flora/bloom";

/**
 * Depoimentos — só palavras reais, com autorização de cada cliente.
 * Nunca escritos por nós. Sem nenhum, a seção não existe.
 */
export function Testimonials({ conteudo }: { conteudo: ConteudoSite }) {
  const estrutura = useEstrutura();
  if (!temDepoimentos(conteudo) && !estrutura) return null;
  const lista = conteudo.depoimentos;

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
          <ul className="tydp__lista">
            {lista.map((d, i) => (
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
                <p className="ty-mono tydp__quem">
                  {d.nome} · {d.fonte}
                </p>
              </Reveal>
            ))}
          </ul>
        ) : (
          <Pendente
            titulo="Depoimentos de clientes"
            detalhe="3 a 6 falas reais (print do WhatsApp/Instagram serve de origem), com o primeiro nome e a autorização de cada cliente para publicar."
          />
        )}
      </div>
    </section>
  );
}
