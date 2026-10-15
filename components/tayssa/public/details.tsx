"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { PhotoSlot } from "@/lib/tayssa/photos";
import { RealPhoto } from "@/components/tayssa/ui/real-photo";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** A chamada, quebrada como o olho lê: três tempos, o último em itálico. */
const CHAMADA = ["O trabalho sai", "do estúdio e vai", <em key="perfil">direto pro perfil.</em>];

/**
 * O convite ao Instagram — hoje é lá que o trabalho dela vive.
 *
 * A seção é um bloco chapado de cassis: a chamada em corpo grande, o @ em
 * mono grande e o link para o perfil. Ao redor, régua fina, ficha em mono
 * e uma coluna curta de texto. Sem nenhuma foto a composição já está
 * completa — nada de caixote vazio. Quando a biblioteca tiver foto, um
 * trilho de figuras chapadas entra embaixo, com legenda em mono.
 *
 * Movimento: a massa de cor sobe por máscara e o conteúdo entra atrás
 * dela. O gatilho fica no invólucro, nunca no elemento recortado — um
 * elemento com `clip-path: inset(100%)` não é visto pelo observador e
 * ficaria preso fechado para sempre.
 */
export function Details({
  instagramUrl,
  handle,
  photos,
}: {
  instagramUrl: string;
  handle: string;
  /** já filtradas na página: lista vazia ou undefined = não existe foto */
  photos?: PhotoSlot[];
}) {
  const reduced = useReducedMotion();
  const caixa = useRef<HTMLDivElement>(null);
  const naTela = useInView(caixa, { once: true, amount: 0.25 });
  const abre = naTela || Boolean(reduced);
  const fotos = photos ?? [];

  /** entra junto com o bloco, em cascata curta */
  const sobe = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 16 },
    animate: abre ? { opacity: 1, y: 0 } : reduced ? {} : { opacity: 0, y: 16 },
    transition: { duration: 0.75, delay, ease: EASE },
  });

  return (
    <section className="ty-section" id="instagram" aria-label="Instagram">
      <div className="ty-container">
        {/* ficha de cabeça: a rede de um lado, o perfil do outro */}
        <Reveal className="ty-ig__topo" y={14}>
          <span className="ty-mono ty-mono--ink">Instagram</span>
          <span className="ty-mono">{handle}</span>
        </Reveal>
        <div className="ty-rule" />

        <div className="ty-split ty-split--wide-right ty-split--offset ty-ig__grade">
          {/* coluna curta: por que ir até lá */}
          <div className="ty-ig__lado">
            <Reveal>
              <span className="ty-eyebrow">Antes de agendar</span>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="ty-lead ty-measure--tight">
                Aqui o site conta o essencial: o que a casa faz e como funciona o clube. O
                trabalho recente fica no Instagram — é lá que o olhar aparece de perto, um por
                um.
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <span className="ty-oval">o trabalho vive lá</span>
            </Reveal>
          </div>

          {/* o invólucro é quem o observador enxerga; o bloco é o recortado */}
          <div ref={caixa}>
            <motion.div
              className="ty-block ty-ig__bloco"
              initial={reduced ? false : { clipPath: "inset(100% 0 0 0)" }}
              animate={abre ? { clipPath: "inset(0% 0 0 0)" } : reduced ? {} : { clipPath: "inset(100% 0 0 0)" }}
              transition={{ duration: 1.05, ease: EASE }}
            >
              <motion.span className="ty-mono" {...sobe(0.18)}>
                o perfil
              </motion.span>
              <MaskedLines
                as="h2"
                className="ty-display ty-ig__chamada"
                lines={CHAMADA}
                inView={false}
                play={abre}
                delay={0.26}
              />
              <motion.span className="ty-ig__arroba" {...sobe(0.5)}>
                {handle}
              </motion.span>
              <motion.div className="ty-ig__acao" {...sobe(0.6)}>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ty-ig__cta"
                  aria-label={`Abrir o perfil ${handle} no Instagram`}
                >
                  Abrir o perfil
                  <span className="ty-ig__seta" aria-hidden />
                </a>
                <span className="ty-mono">abre em nova aba</span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* a ficha fecha a composição: A + B + C = o perfil */}
        <Reveal className="ty-ig__ficha ty-rail" y={14}>
          <span>Trabalho recente</span>
          <i aria-hidden>+</i>
          <span>Foto do estúdio</span>
          <i aria-hidden>+</i>
          <span>Sem banco de imagens</span>
          <i aria-hidden>=</i>
          <span className="ty-mono--accent">{handle}</span>
        </Reveal>
      </div>

      {/* foto é bônus, nunca requisito: o trilho só existe se houver foto */}
      {fotos.length > 0 ? (
        <div className="ty-ig__fotos">
          <div className="ty-container ty-ig__topo">
            <span className="ty-mono ty-mono--ink">Do perfil</span>
            <span className="ty-mono ty-num">
              {String(fotos.length).padStart(2, "0")} {fotos.length === 1 ? "foto" : "fotos"}
            </span>
          </div>
          <div className="ty-ig__rolo">
            {fotos.map((foto, i) => (
              <Peca key={`${foto.src}-${i}`} foto={foto} indice={i} handle={handle} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

/** Peça do trilho: figura chapada, legenda em mono, entrada por máscara. */
function Peca({ foto, indice, handle }: { foto: PhotoSlot; indice: number; handle: string }) {
  const reduced = useReducedMotion();
  const alvo = useRef<HTMLElement>(null);
  const naTela = useInView(alvo, { once: true, amount: 0.2 });
  const abre = naTela || Boolean(reduced);
  return (
    <figure ref={alvo} className="ty-figure ty-ig__peca">
      <motion.div
        initial={reduced ? false : { clipPath: "inset(100% 0 0 0)" }}
        animate={abre ? { clipPath: "inset(0% 0 0 0)" } : reduced ? {} : { clipPath: "inset(100% 0 0 0)" }}
        transition={{ duration: 1.05, delay: Math.min(indice, 4) * 0.06, ease: EASE }}
      >
        <RealPhoto photo={foto} hover sizes="(max-width: 899px) 62vw, 26vw" />
      </motion.div>
      <figcaption>
        <span>{foto.caption ?? handle}</span>
        <span className="ty-num">{String(indice + 1).padStart(2, "0")}</span>
      </figcaption>
    </figure>
  );
}
