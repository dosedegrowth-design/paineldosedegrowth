"use client";

/* Cursor custom: ponto ciano 8px instantâneo + anel 32px com lag de
   spring; o anel cresce sobre elementos interativos. Só desktop
   (hover:hover) — o CSS esconde nos demais. */

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 150, damping: 15, mass: 0.4 });
  const ry = useSpring(y, { stiffness: 150, damping: 15, mass: 0.4 });

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const onOver = (e: Event) => {
      const t = e.target as HTMLElement;
      const interactive = !!t.closest?.(
        'a, button, [data-magnetic], input, select, [role="button"]'
      );
      ringRef.current?.setAttribute("data-hovering", String(interactive));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseover", onOver);
    };
  }, [x, y]);

  return (
    <>
      <motion.div
        className="andre-cursor-dot"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        aria-hidden
      />
      <motion.div
        ref={ringRef}
        className="andre-cursor-ring"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        aria-hidden
      />
    </>
  );
}
