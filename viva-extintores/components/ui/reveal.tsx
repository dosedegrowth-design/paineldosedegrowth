"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Entrada discreta (§19: nada de efeito promocional).
 *
 * Regra que não pode quebrar: **sem JavaScript, tudo aparece**. O HTML
 * sai do servidor visível; só depois de montar é que o componente assume
 * o controle e esconde o que ainda está abaixo da dobra para animar a
 * entrada. Numa página de captação, conteúdo preso atrás de JS é lead
 * perdido — e buscador que não enxerga.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
  id,
}: {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [comJs, setComJs] = useState(false);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzido) return;

    // Já está na tela? Então nunca esconde — evita piscar no carregamento.
    const naTela = el.getBoundingClientRect().top < window.innerHeight * 0.92;
    if (naTela) {
      setComJs(true);
      setVisivel(true);
      return;
    }

    setComJs(true);
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            setVisivel(true);
            obs.disconnect();
          }
        }
      },
      { rootMargin: "-60px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      id={id}
      className={["v-reveal", className ?? ""].join(" ").trim()}
      data-js={comJs ? "true" : undefined}
      data-shown={visivel ? "true" : undefined}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
