"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";

export function TiltCard({
  children,
  className,
  intensity = 12,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 220, damping: 22, mass: 0.4 });
  const ySpring = useSpring(y, { stiffness: 220, damping: 22, mass: 0.4 });

  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-intensity, intensity]);
  const rotateX = useTransform(ySpring, [-0.5, 0.5], [intensity, -intensity]);

  const glareX = useTransform(xSpring, [-0.5, 0.5], ["20%", "80%"]);
  const glareY = useTransform(ySpring, [-0.5, 0.5], ["20%", "80%"]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
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
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
      initial={{ opacity: 0, y: 24, rotateX: -14 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={{ transform: "translateZ(20px)" }}>{children}</div>
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          background: useTransform(
            [glareX, glareY],
            ([gx, gy]) =>
              `radial-gradient(circle at ${gx} ${gy}, rgba(125, 211, 252, 0.18), transparent 55%)`
          ),
          mixBlendMode: "screen",
        }}
      />
    </motion.div>
  );
}

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
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
