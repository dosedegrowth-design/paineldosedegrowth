"use client";

import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useRef, type CSSProperties, type ReactNode } from "react";

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

/**
 * Foto entra por máscara (inset) com leve zoom de 1.08 -> 1.
 *
 * Quem decide a hora é o invólucro, não o elemento recortado: no Chromium
 * um elemento com `clip-path` não é reportado pelo IntersectionObserver
 * quando o threshold é maior que zero — medido, `inset(100%)` e
 * `inset(50% 50% 50% 50%)` nunca disparam a 0.2 e sempre disparam a 0.
 * Pendurar o `whileInView` na própria máscara deixava a foto escondida
 * para sempre. Então o invólucro (sem recorte) observa, e a máscara anda
 * por `animate`.
 */
export function MaskedPhoto({
  children,
  className,
  style,
  delay = 0,
  from = "bottom",
  once = true,
  inView = true,
  amount = 0.2,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  from?: "bottom" | "top" | "left" | "right" | "center";
  once?: boolean;
  inView?: boolean;
  amount?: number;
}) {
  const reduced = useReducedMotion();
  const alvo = useRef<HTMLDivElement>(null);
  const apareceu = useInView(alvo, { once, amount });
  const insets: Record<typeof from, string> = {
    bottom: "inset(100% 0 0 0)",
    top: "inset(0 0 100% 0)",
    left: "inset(0 100% 0 0)",
    right: "inset(0 0 0 100%)",
    center: "inset(50% 50% 50% 50%)",
  };
  // sem recorte: ou já é hora (fora do modo inView), ou o invólucro avisou
  const abrir = reduced || !inView || apareceu;
  return (
    <div ref={alvo} className={className} style={style}>
      <motion.div
        style={{ height: "100%", willChange: "clip-path" }}
        initial={reduced ? false : { clipPath: insets[from] }}
        animate={{ clipPath: abrir ? "inset(0 0 0 0)" : insets[from] }}
        transition={{ duration: 1.25, ease: EASE_OUT, delay }}
      >
        <motion.div
          style={{ height: "100%", willChange: "transform" }}
          initial={reduced ? false : { scale: 1.08 }}
          animate={{ scale: abrir ? 1 : 1.08 }}
          transition={{ duration: 1.6, ease: EASE_OUT, delay }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
