"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/**
 * Ícones animados da casa (o equivalente aos ícones Rive do Delta, em SVG
 * puro). Traço fino, cor do texto. Cada um:
 *  - se desenha quando entra na tela (o traço corre, pathLength 0 → 1);
 *  - tem um gesto próprio em loop lento, que acelera no hover/foco do
 *    elemento pai (`.ty-ico-gatilho:hover`) — o olho pisca, o presente
 *    abre, a folha do calendário vira…
 * Com movimento reduzido: já desenhados e parados.
 */

export type IconeNome = "olho" | "flor" | "calendario" | "presente" | "coracao" | "mensagem" | "brilho" | "check" | "cartao";

const DRAW = { duration: 1.1, ease: [0.65, 0, 0.35, 1] as [number, number, number, number] };

function Traco({ d, delay = 0, on, className }: { d: string; delay?: number; on: boolean; className?: string }) {
  return (
    <motion.path
      d={d}
      className={className}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: on ? 1 : 0 }}
      transition={{ ...DRAW, delay }}
    />
  );
}

export function Icone({ nome, className, label }: { nome: IconeNome; className?: string; label?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();
  const visto = useInView(ref, { once: true, amount: 0.4 });
  const on = visto || Boolean(reduced);

  const corpo: Record<IconeNome, ReactNode> = {
    // olho com cílios: a pálpebra desce e sobe (piscar)
    olho: (
      <>
        <g className="tyi-palpebra">
          <Traco on={on} d="M5 24c5.5-7.5 12-11 19-11s13.5 3.5 19 11" />
          <Traco on={on} delay={0.25} d="M11 17.5 8.5 13M17 14.6l-1.6-5M24 13.4V8.2M31 14.6l1.6-5M37 17.5l2.5-4.5" />
        </g>
        <Traco on={on} delay={0.15} d="M5 24c5.5 7.5 12 11 19 11s13.5-3.5 19-11" />
        <motion.circle
          className="tyi-iris"
          cx="24"
          cy="24"
          r="5.2"
          initial={{ scale: 0 }}
          animate={{ scale: on ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        />
      </>
    ),
    // flor: as pétalas giram devagar
    flor: (
      <>
        <g className="tyi-gira">
          {[0, 72, 144, 216, 288].map((a, i) => (
            <g key={a} transform={`rotate(${a} 24 24)`}>
              <Traco on={on} delay={i * 0.08} d="M24 24c-3.2-3.6-3.6-9.4 0-13.5 3.6 4.1 3.2 9.9 0 13.5z" />
            </g>
          ))}
        </g>
        <motion.circle
          cx="24"
          cy="24"
          r="2.4"
          className="tyi-cheio"
          initial={{ scale: 0 }}
          animate={{ scale: on ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        />
        <Traco on={on} delay={0.5} d="M24 26.5c0 6 1.5 10 -1.5 15M23 35c-3.5-1-6-0.2-7.5 2" />
      </>
    ),
    // calendário: a folha de cima vira
    calendario: (
      <>
        <Traco on={on} d="M9 14.5h30a3 3 0 0 1 3 3V38a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V17.5a3 3 0 0 1 3-3z" />
        <Traco on={on} delay={0.2} d="M15 9.5v8M33 9.5v8" />
        <g className="tyi-folha">
          <Traco on={on} delay={0.35} d="M6 22h36" />
        </g>
        <Traco on={on} delay={0.55} d="M18 31.5l4 4 8-8.5" className="tyi-marca" />
      </>
    ),
    // presente: a tampa sobe e volta
    presente: (
      <>
        <Traco on={on} d="M10 22h28v17a2.5 2.5 0 0 1-2.5 2.5h-23A2.5 2.5 0 0 1 10 39z" />
        <Traco on={on} delay={0.2} d="M24 22v19.5" />
        <g className="tyi-tampa">
          <Traco on={on} delay={0.3} d="M8 16h32v6H8zM24 16v6" />
          <Traco
            on={on}
            delay={0.5}
            d="M24 16c-2.5-5.5-9.5-7-9.5-2.5 0 2.7 5 2.5 9.5 2.5zM24 16c2.5-5.5 9.5-7 9.5-2.5 0 2.7-5 2.5-9.5 2.5z"
          />
        </g>
      </>
    ),
    // dois corações: o de trás bate
    coracao: (
      <>
        <g className="tyi-bate">
          <Traco on={on} d="M19 37S6 29.5 6 20.5c0-4 3-7 6.8-7 2.7 0 4.9 1.5 6.2 3.8 1.3-2.3 3.5-3.8 6.2-3.8" />
        </g>
        <Traco
          on={on}
          delay={0.3}
          d="M30 40s-13-7.5-13-16.5c0-4 3-7 6.8-7 2.7 0 4.9 1.5 6.2 3.8 1.3-2.3 3.5-3.8 6.2-3.8 3.8 0 6.8 3 6.8 7 0 9-13 16.5-13 16.5z"
        />
      </>
    ),
    // balão de conversa: três pontos digitando
    mensagem: (
      <>
        <Traco on={on} d="M24 8c9.9 0 18 6.7 18 15s-8.1 15-18 15c-2.3 0-4.5-.4-6.5-1L9 40l2.6-7.2C8.1 30.1 6 26.8 6 23 6 14.7 14.1 8 24 8z" />
        {[16, 24, 32].map((x, i) => (
          <motion.circle
            key={x}
            cx={x}
            cy="23"
            r="1.9"
            className={`tyi-cheio tyi-ponto tyi-ponto--${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: on ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 0.7 + i * 0.1 }}
          />
        ))}
      </>
    ),
    // brilho: a estrela pisca
    brilho: (
      <>
        <g className="tyi-pisca">
          <Traco on={on} d="M24 6c1.2 9.5 4.5 12.8 14 14-9.5 1.2-12.8 4.5-14 14-1.2-9.5-4.5-12.8-14-14 9.5-1.2 12.8-4.5 14-14z" />
        </g>
        <g className="tyi-pisca tyi-pisca--2">
          <Traco on={on} delay={0.4} d="M37 31c.5 3.8 1.8 5.1 5.5 5.5-3.7.5-5 1.8-5.5 5.5-.5-3.7-1.8-5-5.5-5.5 3.7-.4 5-1.7 5.5-5.5z" />
        </g>
      </>
    ),
    check: (
      <>
        <Traco on={on} d="M24 6a18 18 0 1 1 0 36 18 18 0 0 1 0-36z" />
        <Traco on={on} delay={0.45} d="M16 24.5l5.5 5.5L33 18.5" className="tyi-marca" />
      </>
    ),
    // cartão de fidelidade: os carimbos acendem em sequência
    cartao: (
      <>
        <Traco on={on} d="M9 12h30a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" />
        {[14, 24, 34].map((x, i) => (
          <motion.circle
            key={x}
            cx={x}
            cy="24"
            r="3.4"
            className={`tyi-carimbo tyi-carimbo--${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: on ? 1 : 0 }}
            transition={{ duration: 0.35, delay: 0.6 + i * 0.12 }}
          />
        ))}
      </>
    ),
  };

  return (
    <svg
      ref={ref}
      viewBox="0 0 48 48"
      className={["tyi", `tyi--${nome}`, className ?? ""].join(" ").trim()}
      data-on={on}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {corpo[nome]}
    </svg>
  );
}
