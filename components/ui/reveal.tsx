"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Bloco que entra (opacidade + leve subida) quando aparece na tela. */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
  style,
  once = true,
  amount = 0.12,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
  once?: boolean;
  amount?: number;
  as?: "div" | "section" | "p" | "li" | "span" | "h1" | "h2" | "h3";
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      style={style}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.82, ease: EASE_OUT, delay }}
    >
      {children}
    </Tag>
  );
}

/**
 * Linhas mascaradas: cada linha sobe de dentro de uma máscara, em cascata.
 * Para títulos onde a quebra é decisão de design (uma string por linha).
 */
export function MaskedLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.085,
  duration = 0.95,
  as = "h2",
  once = true,
  inView = true,
  amount = 0.4,
  play = true,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  as?: "h1" | "h2" | "h3" | "p" | "div";
  once?: boolean;
  /** false = anima ao montar (hero); true = anima ao entrar na tela */
  inView?: boolean;
  amount?: number;
  /** com inView=false: só anima quando play vira true (ex.: depois do loader) */
  play?: boolean;
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const line: Variants = {
    hidden: { y: "112%" },
    show: { y: "0%", transition: { duration, ease: EASE_OUT } },
  };
  return (
    <Tag
      className={className}
      variants={container}
      initial={reduced ? "show" : "hidden"}
      {...(inView
        ? { whileInView: "show", viewport: { once, amount } }
        : { animate: play || reduced ? "show" : "hidden" })}
    >
      {lines.map((l, i) => (
        <span key={i} className="ty-mask" style={{ display: "block" }}>
          <motion.span
            variants={line}
            className={lineClassName}
            style={{ display: "block", willChange: "transform" }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Foto entra por máscara (inset) com leve zoom de 1.08 -> 1. */
export function MaskedPhoto({
  children,
  className,
  style,
  delay = 0,
  from = "bottom",
  once = true,
  inView = true,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  from?: "bottom" | "top" | "left" | "right" | "center";
  once?: boolean;
  inView?: boolean;
}) {
  const reduced = useReducedMotion();
  const insets: Record<typeof from, string> = {
    bottom: "inset(100% 0 0 0)",
    top: "inset(0 0 100% 0)",
    left: "inset(0 100% 0 0)",
    right: "inset(0 0 0 100%)",
    center: "inset(50% 50% 50% 50%)",
  };
  return (
    <motion.div
      className={className}
      style={{ ...style, willChange: "clip-path" }}
      initial={reduced ? false : { clipPath: insets[from] }}
      {...(inView
        ? { whileInView: { clipPath: "inset(0 0 0 0)" }, viewport: { once, amount: 0.2 } }
        : { animate: { clipPath: "inset(0 0 0 0)" } })}
      transition={{ duration: 1.25, ease: EASE_OUT, delay }}
    >
      <motion.div
        style={{ height: "100%", willChange: "transform" }}
        initial={reduced ? false : { scale: 1.08 }}
        {...(inView
          ? { whileInView: { scale: 1 }, viewport: { once, amount: 0.2 } }
          : { animate: { scale: 1 } })}
        transition={{ duration: 1.6, ease: EASE_OUT, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
