"use client";

import { useRef, type CSSProperties, type RefObject } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { FloraTom, FlowerKind } from "@/lib/tayssa/flora";
import { Bloom, Leaf } from "@/components/tayssa/flora/bloom";

/**
 * Uma peça do arranjo. Posição em % da caixa do arranjo (o centro da
 * peça), tamanho em CSS (aceita clamp/vw para escalar por tela).
 * `depth` é a profundidade: positivo vem para frente e corre mais no
 * scroll; negativo fica atrás e quase não se mexe.
 */
export type Peca = {
  kind: FlowerKind | "folha";
  x: number;
  y: number;
  size: string;
  seed?: number;
  tom?: FloraTom;
  rotate?: number;
  depth?: number;
  /** atraso de abertura (ms) */
  delay?: number;
  /** some abaixo desta largura — o arranjo do celular é mais enxuto */
  hideBelow?: 768 | 900;
  /** só existe abaixo desta largura — a versão de celular de uma peça */
  showBelow?: 768 | 900;
};

/**
 * Arranjo — um grupo de flores posicionado sobre uma composição. Não é
 * enfeite solto: cada arranjo é desenhado para a seção onde mora, e é
 * usado em duas camadas (atrás e na frente da tipografia/mídia) para a
 * flor atravessar a composição em vez de ficar colada em cima dela.
 *
 * Abre quando entra na tela (ou quando `open` manda); acompanha o scroll
 * da seção indicada em `track` com profundidade por peça.
 */
export function Arranjo({
  pecas,
  className,
  style,
  open,
  track,
  label,
}: {
  pecas: Peca[];
  className?: string;
  style?: CSSProperties;
  /** força a abertura (ex.: depois da abertura do site) */
  open?: boolean;
  /** seção cujo scroll move as peças (parallax por profundidade) */
  track?: RefObject<HTMLElement | null>;
  /** só para depuração/testes — o arranjo é decorativo */
  label?: string;
}) {
  const caixa = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  // observa a caixa sem recorte (clip-path esconde do observador)
  const naTela = useInView(caixa, { once: true, amount: 0 });
  const abre = open ?? naTela;
  const { scrollYProgress } = useScroll({
    target: track ?? caixa,
    offset: ["start end", "end start"],
  });

  return (
    <div
      ref={caixa}
      className={["tyf-arranjo", className ?? ""].join(" ").trim()}
      style={style}
      aria-hidden
      data-flora={label}
    >
      {pecas.map((p, i) => (
        <PecaArranjo key={i} peca={p} abre={abre || Boolean(reduced)} progresso={scrollYProgress} parado={Boolean(reduced)} />
      ))}
    </div>
  );
}

function PecaArranjo({
  peca,
  abre,
  progresso,
  parado,
}: {
  peca: Peca;
  abre: boolean;
  progresso: MotionValue<number>;
  parado: boolean;
}) {
  const depth = peca.depth ?? 0;
  const y = useTransform(progresso, [0, 1], parado ? [0, 0] : [depth * 60, depth * -60]);
  const r = useTransform(progresso, [0, 1], parado ? [0, 0] : [-depth * 6, depth * 6]);
  const st: CSSProperties = {
    left: `${peca.x}%`,
    top: `${peca.y}%`,
    width: peca.size,
  };
  return (
    <motion.div
      className="tyf-peca"
      data-hide-below={peca.hideBelow ?? undefined}
      data-show-below={peca.showBelow ?? undefined}
      style={{ ...st, y, rotate: r }}
    >
      <div className="tyf-giro" style={{ transform: `translate(-50%, -50%) rotate(${peca.rotate ?? 0}deg)` }}>
        {peca.kind === "folha" ? (
          <Leaf className="tyf-folha" style={{ opacity: abre ? 1 : 0 }} />
        ) : (
          <Bloom kind={peca.kind} seed={peca.seed ?? 1} tom={peca.tom ?? "vinho"} open={abre} delay={peca.delay ?? 0} />
        )}
      </div>
    </motion.div>
  );
}
