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

  /* Mobile: versão compacta empilhada — a pinada de 260vh vira um
     túnel preto em tela pequena. Reveals mantêm o drama. */
  const mobile = (
    <section className="relative py-16 lg:hidden overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(70% 45% at 50% 45%, rgba(251,113,36,0.06), transparent 70%)",
        }}
      />
      <div className="relative max-w-xl mx-auto px-5 text-center">
        <Chapter n="02" label="O problema" />
        <div className="mt-10 space-y-10">
          {statements.map((s, i) => (
            <motion.div
              key={s.a}
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-[1.85rem] sm:text-4xl font-black leading-[1.1] tracking-tight text-white">
                {s.a}
              </p>
              <p className="mt-1.5 text-[1.85rem] sm:text-4xl font-black leading-[1.1] tracking-tight text-slate-500">
                {s.b}
              </p>
            </motion.div>
          ))}
        </div>
        <p className="mt-12 text-sm text-slate-400 tracking-wide">
          Existe um jeito certo de resolver isso ↓
        </p>
      </div>
    </section>
  );

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
    <>
      {mobile}
      <section ref={ref} className="relative h-[260vh] hidden lg:block">
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
    </>
  );
}
