"use client";

import { useEffect, useRef } from "react";
import { formatarNumero, partesDoNumero } from "@/lib/tayssa/numeros";

/**
 * Um número que sobe do zero até o valor quando aparece na tela. O
 * servidor entrega o valor final (sem JS, ou para quem lê a página, é ele
 * que fica); a contagem escreve direto no texto, sem render do React a
 * cada quadro.
 */
export function Conta({ valor, duracao = 1700, atraso = 0 }: { valor: string; duracao?: number; atraso?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    const p = partesDoNumero(valor);
    if (!el || !p || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let espera = 0;
    // ainda abaixo da tela: começa do zero, para o valor final não piscar antes
    if (el.getBoundingClientRect().top > window.innerHeight) el.textContent = formatarNumero(p, 0);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        espera = window.setTimeout(() => {
          const t0 = performance.now();
          const passo = (agora: number) => {
            const t = Math.min(1, (agora - t0) / duracao);
            el.textContent = formatarNumero(p, p.alvo * (1 - Math.pow(1 - t, 3)));
            if (t < 1) raf = requestAnimationFrame(passo);
            else el.textContent = valor;
          };
          raf = requestAnimationFrame(passo);
        }, atraso);
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(espera);
      cancelAnimationFrame(raf);
    };
  }, [valor, duracao, atraso]);
  return (
    <span className="ty-conta">
      <span ref={ref} aria-hidden>
        {valor}
      </span>
      <span className="sr-only">{valor}</span>
    </span>
  );
}
