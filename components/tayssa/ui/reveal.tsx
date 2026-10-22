"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cloneElement, Fragment, isValidElement, type CSSProperties, type ReactNode } from "react";

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
      data-reveal=""
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
 * As palavras de uma linha. Texto solto vira uma lista de palavras; um
 * `<em>` com texto vira um `<em>` por palavra (o acento continua nelas).
 * Qualquer outra coisa fica inteira.
 */
function palavras(linha: ReactNode): ReactNode[] {
  if (typeof linha === "string") return juntarCurtas(linha.split(/\s+/).filter(Boolean));
  if (isValidElement<{ children?: ReactNode }>(linha) && typeof linha.props.children === "string") {
    return juntarCurtas(linha.props.children.split(/\s+/).filter(Boolean)).map((p, k) => cloneElement(linha, { key: k }, p));
  }
  return [linha];
}

/**
 * Palavra de uma ou duas letras anda com a seguinte ("a sua", "O resto",
 * "do estúdio"): no celular a linha não termina num "a" ou num "O" sozinho.
 */
function juntarCurtas(ps: string[]): string[] {
  const out: string[] = [];
  let pendente = "";
  for (const p of ps) {
    const atual = pendente ? `${pendente} ${p}` : p;
    if (p.length <= 2) {
      pendente = atual;
      continue;
    }
    out.push(atual);
    pendente = "";
  }
  if (pendente) out.push(pendente);
  return out;
}

/**
 * Linhas mascaradas: cada palavra sobe de dentro da sua máscara, linha
 * por linha, em cascata. No computador cada linha é uma decisão de
 * desenho (uma string por linha) e fica no seu lugar; no celular as
 * linhas correm juntas e quebram onde a largura pede (`centro.css`) — por
 * isso a máscara é por palavra: com uma máscara por linha, o título não
 * conseguia se espalhar e ficava em três linhas curtas no meio da tela.
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
  const container: Variants = { hidden: {}, show: {} };
  // a linha sobe no seu tempo (como antes) e as palavras dela, em sequência curta
  const palavra: Variants = {
    hidden: { y: "112%" },
    show: (atraso: number) => ({ y: "0%", transition: { duration, ease: EASE_OUT, delay: atraso } }),
  };
  return (
    <Tag
      data-reveal=""
      className={className}
      variants={container}
      initial={reduced ? "show" : "hidden"}
      {...(inView
        ? { whileInView: "show", viewport: { once, amount } }
        : { animate: play || reduced ? "show" : "hidden" })}
    >
      {lines.map((l, i) => {
        const ps = palavras(l);
        return (
          <span key={i} className="ty-linha">
            {ps.map((p, k) => (
              <Fragment key={k}>
                <span className="ty-mask">
                  <motion.span
                    data-reveal=""
                    variants={palavra}
                    custom={delay + i * stagger + k * 0.035}
                    className={lineClassName}
                    style={{ display: "inline-block", willChange: "transform" }}
                  >
                    {p}
                  </motion.span>
                </span>
                {/* espaço de verdade entre as palavras (e no fim da linha):
                    some no desenho do fim de linha, mas o título vira
                    "Indique alguém que merece." para leitor de tela e busca */}
                {i < lines.length - 1 || k < ps.length - 1 ? " " : null}
              </Fragment>
            ))}
          </span>
        );
      })}
    </Tag>
  );
}
