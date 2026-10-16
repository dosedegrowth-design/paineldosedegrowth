"use client";

import { useMemo, type CSSProperties } from "react";
import { flor, folha, type FloraTom, type FlowerKind } from "@/lib/tayssa/flora";

/**
 * A flor da casa (desenho em lib/tayssa/flora.ts, a partir da flor
 * pintada na parede do estúdio). As pétalas abrem de trás para a frente
 * quando `open` vira true. Sem movimento (prefers-reduced-motion) ela já
 * nasce aberta — a regra mora no CSS, então não depende de JS para ficar
 * visível. O quadro tem a base da flor em (0,0): é dali que ela abre.
 */
export function Bloom({
  kind = "flor",
  seed = 1,
  tom = "magenta",
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
  const petals = useMemo(() => flor(kind, seed, tom), [kind, seed, tom]);
  const n = petals.length;
  const caule = kind === "botao" ? folha(46, 11) : null;

  return (
    <svg
      viewBox={kind === "botao" ? "-50 -95 100 125" : "-125 -125 250 170"}
      className={["tyf", `tyf--${kind}`, className ?? ""].join(" ").trim()}
      style={style}
      data-open={open}
      aria-hidden
      focusable="false"
    >
      {caule ? (
        <g className="tyf-sepala">
          {[-40, 40].map((a) => (
            <path key={a} d={caule.corpo} transform={`translate(0 4) rotate(${a + 180})`} fill="var(--t-folha, #55704f)" />
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
              // giro extra enquanto fechada: as pétalas abrem do centro para fora
              "--g": -p.a * 0.85,
              "--d": delay + Math.round((i / n) * (kind === "botao" ? 300 : 820)),
            } as CSSProperties
          }
        >
          {p.camadas.map((c, k) => (
            <path key={k} d={c.d} fill={c.fill} fillOpacity={c.opacity} />
          ))}
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
