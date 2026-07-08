"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { SectionFX } from "./section-fx";

const stats = [
  { value: 40, suffix: "+ anos", label: "de mercado — desde 1985", decimals: 0 },
  { value: 8, suffix: " linhas", label: "de produto, do Split ao Chiller", decimals: 0 },
  { value: 6, suffix: " marcas", label: "parceiras homologadas", decimals: 0 },
  { value: 24, suffix: "h", label: "atendimento e suporte técnico", decimals: 0 },
];

function CountUp({
  value,
  suffix,
  decimals = 0,
  thousands = false,
  start,
}: {
  value: number;
  suffix: string;
  decimals?: number;
  thousands?: boolean;
  start: boolean;
}) {
  const [display, setDisplay] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!start) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const dur = 1600;
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, value, reduceMotion]);

  const formatted = thousands
    ? Math.round(display).toLocaleString("pt-BR")
    : display.toFixed(decimals);

  return (
    <span className="tabular-nums">
      {formatted}
      <span className="text-sky-400">{suffix}</span>
    </span>
  );
}

export function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-14 lg:py-18 bg-white/[0.02] border-y border-white/[0.06]">
      <SectionFX grid stars={5} />
      <div ref={ref} className="relative max-w-6xl mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="text-center lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <p className="text-4xl lg:text-5xl font-black tracking-tight text-white">
                <CountUp
                  value={s.value}
                  suffix={s.suffix}
                  decimals={s.decimals}
                  start={inView}
                />
              </p>
              <p className="mt-2 text-[13px] text-slate-400 leading-snug">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
