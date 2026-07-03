"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

export function PhotoPanel({
  src,
  alt,
  caption,
  ratio = "16/9",
  className = "",
  delay = 0,
}: {
  src: string;
  alt: string;
  caption: string;
  ratio?: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <motion.figure
      ref={ref}
      className={`relative overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)] group bg-[#0d1424] ${className}`}
      style={{ aspectRatio: ratio }}
      initial={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 32, clipPath: "inset(12% 7% 12% 7% round 18px)" }
      }
      whileInView={
        reduceMotion
          ? { opacity: 1 }
          : { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0% round 18px)" }
      }
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ y: reduceMotion ? 0 : parallaxY, scale: 1.1 }}
        whileHover={reduceMotion ? undefined : { scale: 1.15 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, transparent, rgba(15,23,42,0.55))",
        }}
      />
      <motion.figcaption
        className="absolute bottom-3 left-3 right-3"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: delay + 0.3 }}
      >
        <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur px-3 py-1 text-[11px] font-bold text-slate-800 shadow-sm">
          {caption}
        </span>
      </motion.figcaption>
    </motion.figure>
  );
}
