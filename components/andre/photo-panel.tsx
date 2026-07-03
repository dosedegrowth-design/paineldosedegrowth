"use client";

/* Painel de foto estilo makepill com Framer Motion:
   - reveal por clip-path + fade + lift ao entrar na viewport
   - parallax sutil da imagem conforme o scroll
   - zoom suave no hover
   Imagens vivem em public/andre/. */

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
      className={`relative overflow-hidden rounded-2xl border border-sky-400/20 group ${className}`}
      style={{ aspectRatio: ratio, background: "#0a1120" }}
      initial={
        reduceMotion
          ? { opacity: 0 }
          : {
              opacity: 0,
              y: 36,
              clipPath: "inset(14% 8% 14% 8% round 20px)",
            }
      }
      whileInView={
        reduceMotion
          ? { opacity: 1 }
          : {
              opacity: 1,
              y: 0,
              clipPath: "inset(0% 0% 0% 0% round 20px)",
            }
      }
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          y: reduceMotion ? 0 : parallaxY,
          scale: 1.1,
        }}
        whileHover={reduceMotion ? undefined : { scale: 1.16 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      {/* wash frio pra casar com a paleta */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,9,20,0.05) 55%, rgba(5,9,20,0.72) 100%)",
          mixBlendMode: "multiply",
        }}
      />
      <motion.figcaption
        className="absolute bottom-3 left-3 right-3 flex items-center justify-between"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: delay + 0.35 }}
      >
        <span className="tech-stamp" style={{ fontSize: 10 }}>
          {caption}
        </span>
      </motion.figcaption>
      {/* cantos HUD */}
      <span className="absolute top-2.5 left-2.5 w-4 h-4 border-l border-t border-sky-300/60" />
      <span className="absolute top-2.5 right-2.5 w-4 h-4 border-r border-t border-sky-300/60" />
    </motion.figure>
  );
}
