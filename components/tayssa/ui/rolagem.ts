"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { motionValue, useMotionValue, type MotionValue } from "framer-motion";

/**
 * Progresso de rolagem sem custo por quadro.
 *
 * O `useScroll({ target })` do framer-motion mede a posição de cada alvo a
 * cada evento de scroll (offsetTop/offsetParent pela árvore toda): com onze
 * seções na home são ~350 leituras de layout por quadro, o que derruba o
 * celular. Aqui a posição de cada alvo é medida só quando algo muda de
 * tamanho (tela, página, o próprio alvo); no scroll é só aritmética sobre
 * `scrollY`. Devolve o mesmo MotionValue de 0 a 1 — os `useTransform` de
 * quem usa não mudam.
 *
 * Bordas aceitas no `offset`, no mesmo formato do framer-motion:
 * "start" | "center" | "end" | "N%" | "Npx" — "start end" = o topo do alvo
 * encontra o pé da tela.
 */

type Inscrito = {
  el: HTMLElement;
  offset: readonly [string, string];
  mv: MotionValue<number>;
  ini: number;
  fim: number;
};

const BORDA: Record<string, number> = { start: 0, center: 0.5, end: 1 };
const inscritos = new Set<Inscrito>();
let rolagemY: MotionValue<number> | null = null;
let ligado = false;
let pendente = 0;
let ro: ResizeObserver | null = null;

function ponto(v: string, tamanho: number) {
  if (v in BORDA) return BORDA[v] * tamanho;
  if (v.endsWith("%")) return (parseFloat(v) / 100) * tamanho;
  return parseFloat(v) || 0; // "Npx"
}

/** topo do elemento no documento, sem transform (igual ao framer-motion) */
export function topoNoDocumento(el: HTMLElement) {
  let topo = 0;
  let n: HTMLElement | null = el;
  while (n) {
    topo += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return topo;
}

function medir(i: Inscrito) {
  const topo = topoNoDocumento(i.el);
  const altura = i.el.offsetHeight;
  const tela = document.documentElement.clientHeight;
  const cruzamento = (par: string) => {
    const [alvo, visor = alvo] = par.trim().split(/\s+/);
    return topo + ponto(alvo, altura) - ponto(visor, tela);
  };
  i.ini = cruzamento(i.offset[0]);
  i.fim = cruzamento(i.offset[1]);
}

function atualizar(i: Inscrito, y: number) {
  const curso = i.fim - i.ini;
  const p = curso === 0 ? (y >= i.fim ? 1 : 0) : (y - i.ini) / curso;
  i.mv.set(p < 0 ? 0 : p > 1 ? 1 : p);
}

function aoRolar() {
  const y = window.scrollY;
  rolagemY?.set(y);
  for (const i of inscritos) atualizar(i, y);
}

/** remede tudo uma vez no próximo quadro, por mais gatilhos que cheguem */
function remedir() {
  if (pendente) return;
  pendente = requestAnimationFrame(() => {
    pendente = 0;
    for (const i of inscritos) medir(i);
    aoRolar();
  });
}

function ligar() {
  if (ligado) return;
  ligado = true;
  window.addEventListener("scroll", aoRolar, { passive: true });
  window.addEventListener("resize", remedir, { passive: true });
  window.addEventListener("load", remedir);
  document.fonts?.ready.then(remedir).catch(() => {});
  // a página cresce (imagem, fonte, seção que monta): as posições mudam
  ro = new ResizeObserver(remedir);
  ro.observe(document.body);
}

function desligarSeVazio() {
  if (inscritos.size || rolagemY) return;
  ligado = false;
  window.removeEventListener("scroll", aoRolar);
  window.removeEventListener("resize", remedir);
  window.removeEventListener("load", remedir);
  ro?.disconnect();
  ro = null;
}

/** no servidor não há rolagem: um valor parado, nunca compartilhado com o navegador */
const NO_SERVIDOR = motionValue(0);

const useEfeitoDeLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Progresso (0 a 1) do alvo atravessando a tela, como o `scrollYProgress` do framer-motion. */
export function useProgressoRolagem(
  ref: RefObject<HTMLElement | null>,
  offset: readonly [string, string] = ["start end", "end start"],
): MotionValue<number> {
  const mv = useMotionValue(0);
  const [a, b] = offset;
  useEfeitoDeLayout(() => {
    const el = ref.current;
    if (!el) return;
    const i: Inscrito = { el, offset: [a, b], mv, ini: 0, fim: 0 };
    inscritos.add(i);
    ligar();
    ro?.observe(el);
    medir(i);
    atualizar(i, window.scrollY);
    return () => {
      inscritos.delete(i);
      ro?.unobserve(el);
      desligarSeVazio();
    };
  }, [ref, mv, a, b]);
  return mv;
}

/** `scrollY` da janela como MotionValue (um só para a página toda). */
export function useRolagemY(): MotionValue<number> {
  const mv = typeof window === "undefined" ? NO_SERVIDOR : (rolagemY ??= motionValue(window.scrollY));
  useEffect(() => {
    ligar();
    mv.set(window.scrollY);
  }, [mv]);
  return mv;
}
