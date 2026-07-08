"use client";

/* Manifesto tipográfico: as palavras acendem uma a uma conforme o
   scroll atravessa a seção — tipografia como experiência. */

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const SENTENCE =
  "Conforto não é luxo. É engenharia bem feita — no grau certo, no silêncio certo, todos os dias do verão.";

function Word({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const start = index / total;
  const end = Math.min(1, start + 1.5 / total);
  const opacity = useTransform(progress, [start, end], [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {word}{" "}
    </motion.span>
  );
}

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.82", "end 0.42"],
  });

  const words = SENTENCE.split(" ");

  return (
    <section className="relative py-16 lg:py-44">
      <div ref={ref} className="max-w-4xl mx-auto px-5 lg:px-8">
        {/* Desktop: as palavras acendem com o scroll */}
        <p className="hidden lg:block text-[3.4rem] font-black leading-[1.18] tracking-tight text-white text-center">
          {reduce
            ? SENTENCE
            : words.map((w, i) => (
                <Word
                  key={i}
                  word={w}
                  index={i}
                  total={words.length}
                  progress={scrollYProgress}
                />
              ))}
        </p>

        {/* Mobile: citação estática totalmente legível — nada de texto
            fantasma boiando no preto */}
        <p className="lg:hidden text-3xl sm:text-4xl font-black leading-[1.18] tracking-tight text-white text-center">
          Conforto não é luxo. É engenharia bem feita —{" "}
          <span className="andre-gradient-text">
            no grau certo, no silêncio certo
          </span>
          , todos os dias do verão.
        </p>
      </div>
    </section>
  );
}
