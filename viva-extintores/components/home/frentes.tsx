"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AREAS, type AreaSlug } from "@/lib/areas";
import { FotoReal } from "@/components/ui/foto-real";
import { Linhas, Reveal } from "@/components/ui/motion";
import { Seta } from "@/components/ui/icones";

/**
 * As cinco frentes — a biblioteca.
 *
 * Deixou de ser grade de cards. Card colocado lado a lado obriga a
 * comparar as fotos entre si, e o acervo da VIVA não aguenta essa
 * comparação: uma é obra de celular, outra é entrega na porta de um
 * comércio amarelo, outra é céu azul. Em painel alto, quase de página
 * inteira, cada foto é lida sozinha — e o tratamento comum resolve o
 * resto.
 *
 * O que continua igual, porque é regra do cliente:
 *
 * - **dois toques.** O primeiro abre o painel e conta do que a área
 *   trata; o segundo abre a página. Sem JavaScript, o link vale de
 *   primeira e nada se perde.
 * - **no celular corre na horizontal**, com encaixe. Não é lista
 *   rolando para baixo.
 *
 * O que saiu: ponto de carrossel, botão vermelho dentro do card, canto
 * arredondado, sombra. Régua fina, contador e duas setas de contorno.
 */
export function Frentes({ titulo, texto }: { titulo: string; texto: string }) {
  const [aberto, setAberto] = useState<AreaSlug | null>(null);
  const [indice, setIndice] = useState(0);
  const trilho = useRef<HTMLUListElement>(null);

  /** 1º clique abre o painel; 2º deixa o link seguir. */
  function aoClicar(e: React.MouseEvent, slug: AreaSlug) {
    if (aberto === slug) return;
    e.preventDefault();
    setAberto(slug);
  }

  const irPara = useCallback((i: number) => {
    const el = trilho.current;
    const alvo = el?.children[i] as HTMLElement | undefined;
    if (!el || !alvo) return;
    el.scrollTo({ left: alvo.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }, []);

  /* Qual painel está no meio da tela — alimenta o contador e a régua. */
  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visivel) return;
        const i = Number((visivel.target as HTMLElement).dataset.indice);
        if (!Number.isNaN(i)) setIndice(i);
      },
      { root: el, threshold: [0.5, 0.75, 1] },
    );
    for (const filho of Array.from(el.children)) observador.observe(filho);
    return () => observador.disconnect();
  }, []);

  return (
    <section className="v-section v-frentes" aria-labelledby="frentes-titulo">
      <div className="v-wrap">
        <div className="v-cab">
          <div>
            <p className="v-eyebrow">Áreas de atuação</p>
            <Linhas
              as="h2"
              id="frentes-titulo"
              className="v-display v-h2 v-cab__titulo"
              linhas={titulo.split(" | ")}
            />
          </div>
          <Reveal className="v-cab__apoio" delay={0.12}>
            <p className="v-body">{texto}</p>
          </Reveal>
        </div>
      </div>

      <ul className="v-frentes__trilho" ref={trilho}>
        {AREAS.map((a, i) => {
          const estaAberto = aberto === a.slug;
          return (
            <li
              className="v-frente"
              key={a.slug}
              data-indice={i}
              data-aberto={estaAberto ? "true" : undefined}
            >
              <Link
                href={a.href}
                className="v-frente__link"
                aria-expanded={estaAberto}
                onClick={(e) => aoClicar(e, a.slug)}
              >
                <FotoReal
                  foto={a.cardFoto}
                  corte="p"
                  className="v-frente__foto"
                  ratio="fill"
                  sizes="(max-width: 760px) 84vw, 22vw"
                  style={{ height: "100%" }}
                />

                <span className="v-frente__pe">
                  <span className="v-frente__num">{a.numero}</span>
                  <span className="v-display v-frente__nome">{a.nome}</span>
                  <span className="v-frente__dica" aria-hidden>
                    {estaAberto ? "Abrir a página" : "Toque para ver"}
                  </span>
                </span>

                <span className="v-frente__sobre">
                  <span className="v-frente__resumo">{a.cardResumo}</span>
                  <span className="v-frente__itens">
                    {a.itens.slice(0, 4).map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </span>
                  <span className="v-frente__ir">
                    Abrir a página
                    <Seta />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="v-wrap">
        <div className="v-frentes__barra">
          <span className="v-frentes__conta">
            <b>{AREAS[indice]?.numero}</b> / {AREAS[AREAS.length - 1]?.numero}
          </span>
          <span className="v-frentes__regua" aria-hidden>
            <i style={{ transform: `scaleX(${(indice + 1) / AREAS.length})` }} />
          </span>
          <span className="v-frentes__setas">
            <button
              type="button"
              aria-label="Área anterior"
              disabled={indice === 0}
              onClick={() => irPara(Math.max(0, indice - 1))}
            >
              <Seta />
            </button>
            <button
              type="button"
              aria-label="Próxima área"
              disabled={indice === AREAS.length - 1}
              onClick={() => irPara(Math.min(AREAS.length - 1, indice + 1))}
            >
              <Seta />
            </button>
          </span>
        </div>
      </div>
    </section>
  );
}
