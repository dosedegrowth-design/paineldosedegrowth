"use client";

import { useId, useMemo, type CSSProperties } from "react";
import { FLORA_TONS, flor, folha, type FloraTom, type FlowerKind } from "@/lib/tayssa/flora";

/**
 * Uma flor vetorial. As pétalas abrem de fora para dentro quando `open`
 * vira true (o miolo por último, como abre de verdade). Sem movimento
 * (prefers-reduced-motion) ela já nasce aberta — a regra mora no CSS,
 * então não depende de JS para ficar visível.
 */
export function Bloom({
  kind = "peonia",
  seed = 1,
  tom = "vinho",
  open = true,
  delay = 0,
  className,
  style,
}: {
  kind?: FlowerKind;
  seed?: number;
  tom?: FloraTom;
  open?: boolean;
  /** atraso da abertura, em ms */
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const raw = useId();
  const id = `tyf${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const petals = useMemo(() => flor(kind, seed, tom), [kind, seed, tom]);
  const t = FLORA_TONS[tom];
  const n = petals.length;
  const sepala = kind === "botao" ? folha(52, 14) : null;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className={["tyf", className ?? ""].join(" ").trim()}
      style={style}
      data-open={open}
      aria-hidden
      focusable="false"
    >
      <defs>
        {/* sombra na base, luz na ponta: dá volume sem foto */}
        <linearGradient id={`${id}s`} x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0" stopColor={t.base} stopOpacity="0.62" />
          <stop offset="0.45" stopColor={t.base} stopOpacity="0" />
          <stop offset="0.82" stopColor={t.luz} stopOpacity="0" />
          <stop offset="1" stopColor={t.luz} stopOpacity="0.42" />
        </linearGradient>
      </defs>

      {sepala ? (
        <g className="tyf-sepala">
          {[-34, 34].map((a) => (
            <path
              key={a}
              d={sepala.corpo}
              transform={`translate(0 30) rotate(${a + 180})`}
              fill="var(--t-folha, #55704f)"
            />
          ))}
        </g>
      ) : null}

      {petals.map((p, i) => (
        <g
          key={i}
          className="tyf-p"
          style={
            {
              "--a": p.a,
              // giro extra enquanto fechada: abre girando de leve
              "--g": kind === "botao" ? 0 : 24 - p.k * 40,
              "--d": delay + Math.round((i / n) * (kind === "botao" ? 380 : 900)),
            } as CSSProperties
          }
        >
          <path d={p.d} fill={p.cor} stroke={t.base} strokeOpacity="0.28" strokeWidth="0.6" />
          <path d={p.d} fill={`url(#${id}s)`} />
        </g>
      ))}
    </svg>
  );
}

/** Folha solta, verde da casa — usada como pontuação, nunca como massa. */
export function Leaf({
  length = 90,
  width = 26,
  className,
  style,
}: {
  length?: number;
  width?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const { corpo, nervura } = folha(length, width);
  return (
    <svg
      viewBox={`${-width - 2} ${-length - 2} ${width * 2 + 4} ${length + 4}`}
      className={["tyf-leaf", className ?? ""].join(" ").trim()}
      style={style}
      aria-hidden
      focusable="false"
    >
      <path d={corpo} fill="var(--t-folha, #55704f)" />
      <path d={nervura} fill="none" stroke="var(--t-folha-luz, #8aa07f)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
