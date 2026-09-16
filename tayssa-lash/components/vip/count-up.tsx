"use client";

import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "framer-motion";

/**
 * Número que conta até o valor quando aparece. O HTML já vem com o
 * valor final (sem JS ou com movimento reduzido, é isso que fica); com
 * JS, a contagem começa do último valor visto — do zero na primeira vez.
 */
export function CountUp({
  value,
  duration = 1.2,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    const from = seen.current;
    seen.current = value;
    if (!el || reduced || from === value) return;
    const controls = animate(from, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
