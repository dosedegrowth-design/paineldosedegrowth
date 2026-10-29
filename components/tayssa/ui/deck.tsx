"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useReducedMotion } from "framer-motion";

const dois = (n: number) => String(n).padStart(2, "0");

/**
 * Cartões de lado no celular (`app/tayssa/celular.css`): a lista vira um
 * trilho que o dedo passa, um cartão por vez, e o próximo aparece pela borda.
 * Este hook diz qual cartão está na vez e anda a barrinha de progresso. Mede
 * só quando o trilho rola (um quadro por vez); a barra anda direto no estilo,
 * sem refazer a tela. No computador a lista não rola de lado e nada disso
 * aparece.
 */
export function useDeck(trilho: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();
  const [atual, setAtual] = useState(0);
  const barra = useRef<HTMLElement>(null);

  useEffect(() => {
    const t = trilho.current;
    if (!t) return;
    let raf = 0;
    const medir = () => {
      raf = 0;
      const itens = t.children;
      const n = itens.length;
      if (!n) return;
      const primeiro = itens[0] as HTMLElement;
      const passo = n > 1 ? (itens[1] as HTMLElement).offsetLeft - primeiro.offsetLeft : t.clientWidth;
      const max = t.scrollWidth - t.clientWidth;
      // no fim do trilho o último cartão nem sempre chega ao começo: lá, ele é o da vez
      const i = max <= 0 ? 0 : t.scrollLeft >= max - 4 ? n - 1 : Math.round(t.scrollLeft / Math.max(1, passo));
      setAtual(Math.max(0, Math.min(n - 1, i)));
      const p = max <= 0 ? 0 : t.scrollLeft / max;
      if (barra.current) barra.current.style.transform = `scaleX(${(1 + p * (n - 1)) / n})`;
    };
    const aoMudar = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };
    medir();
    t.addEventListener("scroll", aoMudar, { passive: true });
    window.addEventListener("resize", aoMudar);
    return () => {
      t.removeEventListener("scroll", aoMudar);
      window.removeEventListener("resize", aoMudar);
      cancelAnimationFrame(raf);
    };
  }, [trilho]);

  /** leva o cartão `i` para o começo do trilho (onde o encaixe o põe) */
  const ir = (i: number) => {
    const t = trilho.current;
    if (!t || !t.children.length) return;
    const alvo = t.children[Math.max(0, Math.min(t.children.length - 1, i))] as HTMLElement;
    const primeiro = t.children[0] as HTMLElement;
    t.scrollTo({ left: alvo.offsetLeft - primeiro.offsetLeft, behavior: reduced ? "auto" : "smooth" });
  };

  return { atual, ir, barra };
}

/**
 * Embaixo do trilho: as setas para quem não sabe que dá para passar com o
 * dedo, o "03 / 12" e a barrinha que acompanha o arrasto.
 */
export function NavDeck({
  atual,
  total,
  ir,
  barra,
  nome,
  className,
}: {
  atual: number;
  total: number;
  ir: (i: number) => void;
  barra: RefObject<HTMLElement | null>;
  /** "técnica", "forma"… para as setas dizerem o que passam */
  nome: string;
  className?: string;
}) {
  if (total < 2) return null;
  return (
    <div className={`ty-deck-nav${className ? ` ${className}` : ""}`}>
      <button
        type="button"
        className="ty-deck-nav__seta ty-deck-nav__seta--ant"
        aria-label={`${nome.charAt(0).toUpperCase()}${nome.slice(1)} anterior`}
        disabled={atual === 0}
        onClick={() => ir(atual - 1)}
      />
      <span className="ty-deck-nav__meio" aria-hidden>
        <span className="ty-deck-nav__conta">
          <b>{dois(atual + 1)}</b> / {dois(total)}
        </span>
        <span className="ty-deck-nav__barra">
          <i ref={barra} style={{ transform: `scaleX(${1 / total})` }} />
        </span>
      </span>
      <button
        type="button"
        className="ty-deck-nav__seta ty-deck-nav__seta--prox"
        aria-label={`Próxima ${nome}`}
        disabled={atual === total - 1}
        onClick={() => ir(atual + 1)}
      />
    </div>
  );
}
