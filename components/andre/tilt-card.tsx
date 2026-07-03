"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import type { ReactNode } from "react";

export function RevealSection({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y: 34,
        filter: "blur(8px)",
        clipPath: "inset(18% 0% 32% 0%)",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        clipPath: "inset(0% 0% 0% 0%)",
      }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.0, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* Card com inclinação 3D sutil + glare seguindo o cursor */
export function TiltCard({
  children,
  className,
  intensity = 7,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xs = useSpring(x, { stiffness: 200, damping: 20, mass: 0.4 });
  const ys = useSpring(y, { stiffness: 200, damping: 20, mass: 0.4 });
  const rotateY = useTransform(xs, [-0.5, 0.5], [-intensity, intensity]);
  const rotateX = useTransform(ys, [-0.5, 0.5], [intensity, -intensity]);
  const glareX = useTransform(xs, [-0.5, 0.5], ["25%", "75%"]);
  const glareY = useTransform(ys, [-0.5, 0.5], ["25%", "75%"]);
  const glare = useTransform([glareX, glareY], ([gx, gy]) =>
    `radial-gradient(circle at ${gx} ${gy}, rgba(125,211,252,0.10), transparent 55%)`
  );

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        reduce
          ? undefined
          : { rotateX, rotateY, transformStyle: "preserve-3d" }
      }
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={reduce ? undefined : { transform: "translateZ(16px)" }}>
        {children}
      </div>
      {!reduce && (
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            background: glare,
            mixBlendMode: "screen",
          }}
        />
      )}
    </motion.div>
  );
}
