"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { LoyaltyProgress } from "@/lib/tayssa/rules";

const W = 320;
const PAD_TOP = 36;
const PAD_BOTTOM = 36;

/**
 * A jornada como caminho, não como barra.
 * Uma linha sinuosa desce; os marcos são pontos ao longo dela; a parte
 * percorrida se desenha quando entra na tela. A posição atual leva o
 * número de pontos. Sem gamificação infantil: tinta, papel, uma linha.
 */
export function JourneyPath({ loyalty, compact = false }: { loyalty: LoyaltyProgress; compact?: boolean }) {
  const reduced = useReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const [marker, setMarker] = useState<{ x: number; y: number } | null>(null);
  const [nodes, setNodes] = useState<{ x: number; y: number }[]>([]);

  const H = compact ? 380 : 520;
  const max = loyalty.milestones[loyalty.milestones.length - 1]?.threshold ?? 1;
  const usable = H - PAD_TOP - PAD_BOTTOM;
  const d = `M ${W * 0.28} ${PAD_TOP} C ${W * 0.28} ${PAD_TOP + usable * 0.3}, ${W * 0.72} ${PAD_TOP + usable * 0.32}, ${W * 0.72} ${PAD_TOP + usable * 0.55} S ${W * 0.3} ${PAD_TOP + usable * 0.85}, ${W * 0.36} ${H - PAD_BOTTOM}`;

  const ratioOf = (threshold: number) => Math.min(1, threshold / max);
  const progressRatio = Math.min(1, loyalty.points / max);

  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const len = p.getTotalLength();
    const at = (r: number) => {
      const pt = p.getPointAtLength(len * r);
      return { x: pt.x, y: pt.y };
    };
    setMarker(at(progressRatio));
    setNodes(loyalty.milestones.map((m) => at(ratioOf(m.threshold))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressRatio, loyalty.milestones.length, H]);

  return (
    <div style={{ position: "relative", maxWidth: W, margin: "0 auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Sua jornada: ${loyalty.points} pontos`}>
        <path ref={pathRef} d={d} fill="none" stroke="var(--t-line-strong)" strokeWidth="1" />
        <motion.path
          d={d}
          fill="none"
          stroke="var(--t-fg)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={reduced ? { pathLength: progressRatio } : { pathLength: 0 }}
          whileInView={{ pathLength: progressRatio }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
        {nodes.map((n, i) => {
          const m = loyalty.milestones[i];
          return (
            <g key={m.key}>
              <motion.circle
                cx={n.x}
                cy={n.y}
                r={m.reached ? 5 : 4.5}
                fill={m.reached ? "var(--t-fg)" : "var(--t-bg)"}
                stroke="var(--t-fg)"
                strokeWidth="1.2"
                initial={reduced ? false : { scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: `${n.x}px ${n.y}px` }}
              />
              <motion.text
                x={n.x > W / 2 ? n.x - 14 : n.x + 14}
                y={n.y + 4}
                textAnchor={n.x > W / 2 ? "end" : "start"}
                fontSize="11"
                fontFamily="var(--t-font-body)"
                letterSpacing="0.18em"
                fill={m.reached ? "var(--t-fg)" : "var(--t-fg-2)"}
                initial={reduced ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + i * 0.15, duration: 0.6 }}
                style={{ textTransform: "uppercase" }}
              >
                {m.title.toUpperCase()} · {m.threshold}
              </motion.text>
            </g>
          );
        })}
        {marker ? (
          <motion.g
            initial={reduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.6, duration: 0.6 }}
          >
            <circle cx={marker.x} cy={marker.y} r="9" fill="var(--t-accent)" opacity="0.18" />
            <circle cx={marker.x} cy={marker.y} r="4" fill="var(--t-accent)" />
          </motion.g>
        ) : null}
      </svg>
      {marker ? (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1.7, duration: 0.6 }}
          style={{
            position: "absolute",
            left: `${(marker.x / W) * 100}%`,
            top: `${(marker.y / H) * 100}%`,
            transform: `translate(${marker.x > W / 2 ? "-110%" : "16px"}, -50%)`,
            whiteSpace: "nowrap",
          }}
        >
          <span className="ty-display ty-num" style={{ fontSize: 30, lineHeight: 1 }}>
            {loyalty.points}
          </span>
          <span className="ty-eyebrow" style={{ marginLeft: 6, fontSize: 9.5 }}>
            pontos
          </span>
        </motion.div>
      ) : null}
    </div>
  );
}
