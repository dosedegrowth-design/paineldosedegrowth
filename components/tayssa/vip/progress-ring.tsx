"use client";

import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Anel de progresso. Um traço só, dourado indo ao cassis, que se
 * desenha quando a tela abre. O que vai no centro é de quem chama.
 */
export function ProgressRing({
  progress,
  size = 124,
  stroke = 5,
  children,
  label,
}: {
  /** 0..1 */
  progress: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  label: string;
}) {
  const id = useId();
  const reduced = useReducedMotion();
  const p = Math.max(0, Math.min(1, progress));
  const r = (size - stroke) / 2;
  const c = size / 2;
  return (
    <div className="tyv-ring" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg viewBox={`0 0 ${size} ${size}`} className="tyv-ring__svg" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e8cfa0" />
            <stop offset="1" stopColor="#a5647a" />
          </linearGradient>
        </defs>
        <circle className="tyv-ring__track" cx={c} cy={c} r={r} strokeWidth={stroke} />
        <motion.circle
          className="tyv-ring__bar"
          cx={c}
          cy={c}
          r={r}
          strokeWidth={stroke}
          stroke={`url(#${id})`}
          strokeLinecap={p > 0 ? "round" : "butt"}
          transform={`rotate(-90 ${c} ${c})`}
          initial={{ pathLength: reduced ? p : 0 }}
          animate={{ pathLength: p }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />
      </svg>
      <div className="tyv-ring__center">{children}</div>
    </div>
  );
}
