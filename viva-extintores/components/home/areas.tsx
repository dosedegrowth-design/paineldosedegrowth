"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AREAS, type AreaSlug } from "@/lib/areas";
import { Check, Seta } from "@/components/ui/icones";
import { Linhas, Reveal } from "@/components/ui/motion";
import { FotoReal } from "@/components/ui/foto-real";

/**
 * A biblioteca das cinco áreas.
 *
 * Dois toques, de propósito: o primeiro abre o card e mostra do que a
 * área trata; o segundo leva para a página completa. Quem já sabe o que
 * quer chega em dois cliques; quem está só olhando não é jogado para
 * dentro de uma página sem contexto.
 *
 * Sem JavaScript o card continua sendo um link direto para a página — não
 * se perde nada, só o passo intermediário.
 *
 * No celular é biblioteca: os cinco cards correm na horizontal, com
 * encaixe e setas. Não é lista rolando para baixo.
 */
export function AreasGrid({ titulo, texto }: { titulo: string; texto: string }) {
  const [aberto, setAberto] = useState<AreaSlug | null>(null);
  const [indice, setIndice] = useState(0);
  const trilho = useRef<HTMLUListElement>(null);

  /** 1º clique abre o card; 2º deixa o link seguir para a página. */
  function aoClicar(e: React.MouseEvent, slug: AreaSlug) {
    if (aberto === slug) return; // segue o link
    e.preventDefault();
    setAberto(slug);
  }

  function irPara(i: number) {
    const el = trilho.current;
    if (!el) return;
    const alvo = el.children[i] as HTMLElement | undefined;
    if (!alvo) return;
    el.scrollTo({ left: alvo.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }

  function aoRolar() {
    const el = trilho.current;
    if (!el) return;
    const largura = el.scrollWidth / AREAS.length;
    setIndice(Math.min(AREAS.length - 1, Math.round(el.scrollLeft / largura)));
  }

  return (
    <section className="v-section v-bib-sec" aria-labelledby="areas-titulo">
      <div className="v-wrap">
        <div className="v-cab">
          <div>
            <p className="v-eyebrow">Áreas de atuação</p>
            <Linhas
              as="h2"
              id="areas-titulo"
              className="v-display v-h2 v-cab__titulo"
              linhas={titulo.split(" | ")}
            />
          </div>
          <Reveal className="v-cab__apoio" delay={0.12}>
            <p className="v-body">{texto}</p>
          </Reveal>
        </div>

        <div className="v-bib">
          <ul className="v-bib__trilho" ref={trilho} onScroll={aoRolar}>
            {AREAS.map((a) => {
              const estaAberto = aberto === a.slug;
              return (
                <li
                  className="v-bib__item"
                  key={a.slug}
                  data-aberto={estaAberto ? "true" : undefined}
                >
                  <Link
                    href={a.href}
                    className="v-bib__card"
                    aria-expanded={estaAberto}
                    onClick={(e) => aoClicar(e, a.slug)}
                  >
                    <div className="v-bib__media">
                      <FotoReal
                        foto={a.cardFoto}
                        ratio="fill"
                        sizes="(max-width: 900px) 80vw, 340px"
                        style={{ height: "100%" }}
                      />
                    </div>

                    {/* estado fechado: número, nome da área e a seta */}
                    <div className="v-bib__body">
                      <div className="v-bib__texto">
                        <span className="v-bib__num">{a.numero}</span>
                        <h3 className="v-display v-bib__titulo">
                          {a.cardTitulo[0]}
                          {a.cardTitulo[1] ? (
                            <>
                              <br />
                              {a.cardTitulo[1]}
                            </>
                          ) : null}
                        </h3>
                      </div>
                      <span className="v-bib__go" aria-hidden>
                        <Seta />
                      </span>
                    </div>

                    {/* o "card sobre": sobe por dentro do quadrado no
                        primeiro toque; o segundo abre a página */}
                    <div className="v-bib__painel">
                      <span className="v-bib__painel-num">{a.numero}</span>
                      <h3 className="v-display v-bib__painel-titulo">{a.nome}</h3>
                      <p className="v-bib__resumo">{a.cardResumo}</p>
                      <ul className="v-bib__itens">
                        {a.itens.slice(0, 4).map((i) => (
                          <li key={i}>
                            <Check />
                            <span>{i}</span>
                          </li>
                        ))}
                      </ul>
                      <span className="v-bib__ir">
                        Abrir a página
                        <Seta />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* controles da biblioteca — só aparecem no celular */}
          <div className="v-bib__nav">
            <button
              type="button"
              className="v-bib__seta"
              aria-label="Área anterior"
              onClick={() => irPara(Math.max(0, indice - 1))}
            >
              <Seta />
            </button>
            <ol className="v-bib__pontos">
              {AREAS.map((a, i) => (
                <li key={a.slug}>
                  <button
                    type="button"
                    aria-label={`Ir para ${a.nome}`}
                    aria-current={i === indice ? "true" : undefined}
                    onClick={() => irPara(i)}
                  />
                </li>
              ))}
            </ol>
            <button
              type="button"
              className="v-bib__seta"
              aria-label="Próxima área"
              onClick={() => irPara(Math.min(AREAS.length - 1, indice + 1))}
            >
              <Seta />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
