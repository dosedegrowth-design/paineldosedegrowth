"use client";

/* Capítulo 02 — O problema. Seção pinada estilo apresentação:
   três verdades desconfortáveis crossfadam enquanto o usuário rola. */

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Chapter } from "./chapter";

const statements = [
  {
    a: "34°C em São Paulo.",
    b: "E o seu ar soprando vento quente.",
  },
  {
    a: "Conta de luz subindo,",
    b: "compressor pedindo socorro.",
  },
  {
    a: "Filtro sujo é invisível.",
    b: "O ar que sua família respira, não.",
  },
];

function Statement({
  index,
  total,
  progress,
  a,
  b,
}: {
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  a: string;
  b: string;
}) {
  const slice = 1 / total;
  const start = index * slice;
  const end = start + slice;
  const opacity = useTransform(
    progress,
    [start, start + slice * 0.25, end - slice * 0.25, end],
    [0, 1, 1, index === total - 1 ? 1 : 0]
  );
  const y = useTransform(progress, [start, start + slice * 0.3], [40, 0]);
  const blur = useTransform(
    progress,
    [start, start + slice * 0.3],
    ["blur(12px)", "blur(0px)"]
  );

  return (
    <motion.div
      className="absolute inset-x-0 text-center px-5"
      style={{ opacity, y, filter: blur }}
    >
      <p className="text-3xl sm:text-5xl lg:text-[4.2rem] font-black leading-[1.06] tracking-tight text-white">
        {a}
      </p>
      <p className="mt-3 text-3xl sm:text-5xl lg:text-[4.2rem] font-black leading-[1.06] tracking-tight text-slate-500">
        {b}
      </p>
    </motion.div>
  );
}

export function Problema() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  if (reduce) {
    return (
      <section className="relative py-28">
        <div className="max-w-4xl mx-auto px-5 text-center space-y-12">
          <Chapter n="02" label="O problema" />
          {statements.map((s) => (
            <p key={s.a} className="text-4xl font-black text-white">
              {s.a} <span className="text-slate-500">{s.b}</span>
            </p>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* calor residual no fundo do capítulo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 60%, rgba(251,113,36,0.07), transparent 70%)",
          }}
        />
        <div className="absolute top-[14vh]">
          <Chapter n="02" label="O problema" />
        </div>
        <div className="relative w-full max-w-5xl mx-auto h-56">
          {statements.map((s, i) => (
            <Statement
              key={s.a}
              index={i}
              total={statements.length}
              progress={scrollYProgress}
              a={s.a}
              b={s.b}
            />
          ))}
        </div>
        <motion.p
          className="absolute bottom-[12vh] text-sm text-slate-400 tracking-wide"
          style={{
            opacity: useTransform(scrollYProgress, [0.8, 0.98], [0, 1]),
          }}
        >
          Existe um jeito certo de resolver isso ↓
        </motion.p>
      </div>
    </section>
  );
}
