"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface CountUpProps {
  /* Valor final formatado em pt-BR, ex.: "2,16 mi", "+3.704", "98,2%" */
  value: string;
  className?: string;
  durationMs?: number;
}

/* Anima o número de 0 até o alvo quando entra na viewport, preservando
   prefixo (+), sufixo (mi/mil/%) e casas decimais pt-BR. SSR renderiza o
   valor final (SEO/no-JS); a animação só começa no client, em view. */
export function CountUp({ value, className, durationMs = 1600 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || reduce) return;

    const match = value.match(/^([^0-9]*)([\d.,]+)(.*)$/);
    if (!match) return;
    const [, prefixo, numero, sufixo] = match;
    const alvo = parseFloat(numero.replace(/\./g, "").replace(",", "."));
    if (Number.isNaN(alvo)) return;
    const decimais = numero.includes(",")
      ? numero.split(",")[1].length
      : 0;

    let raf = 0;
    const inicio = performance.now();
    const tick = (agora: number) => {
      const t = Math.min((agora - inicio) / durationMs, 1);
      const easeOut = 1 - Math.pow(1 - t, 3);
      const atual = alvo * easeOut;
      setDisplay(
        prefixo +
          atual.toLocaleString("pt-BR", {
            minimumFractionDigits: decimais,
            maximumFractionDigits: decimais,
          }) +
          sufixo
      );
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
