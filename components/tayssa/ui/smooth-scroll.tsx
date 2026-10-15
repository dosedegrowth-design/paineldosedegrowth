"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

declare global {
  interface Window {
    __tyLenis?: Lenis;
  }
}

/** A abertura da home enquanto cobre a tela (`components/tayssa/public/intro-loader`). */
const ABERTURA = ".ty-loader";
/** Teto da espera pelo alvo: seção animada pode montar alguns frames depois. */
const PRAZO_ALVO_MS = 4000;
/** Teto da correção durante a abertura — ela mesma dura ~2,3s na primeira visita. */
const PRAZO_ABERTURA_MS = 3000;

/** O id pedido na URL, já decodificado. Vazio quando não há hash. */
function idDoHash(): string {
  const bruto = window.location.hash.slice(1);
  if (!bruto) return "";
  try {
    return decodeURIComponent(bruto);
  } catch {
    return bruto;
  }
}

/**
 * Leva até o elemento. Com Lenis, ele já desconta o `scroll-margin-top`
 * das seções (a altura da nav) — o `offset` é só o respiro de 8px. Sem
 * Lenis (toque, ou movimento reduzido), o scroll nativo faz a mesma
 * conta pelo CSS.
 */
function irAte(el: HTMLElement, imediato: boolean) {
  if (window.__tyLenis) {
    window.__tyLenis.scrollTo(el, imediato ? { offset: -8, immediate: true } : { offset: -8, duration: 1.4 });
    return;
  }
  el.scrollIntoView({ behavior: imediato ? "auto" : "smooth", block: "start" });
}

/**
 * Põe a página no alvo do hash assim que der; devolve o cancelamento.
 *
 * O alvo pode não existir no frame em que o efeito roda — as seções da
 * home são client components animados —, então procura a cada frame até
 * o prazo. Enquanto a abertura cobre a tela (~1,9s na primeira visita da
 * sessão), continua recolocando o alvo: é nesse intervalo que a fonte
 * chega e as alturas mudam, e a tela coberta é justamente onde corrigir
 * não custa nada. Quando a cortina levanta, a seção já está no lugar —
 * sem salto à vista. Se a pessoa rolar nesse meio tempo, a correção
 * larga na hora: ninguém fica preso.
 *
 * O salto é direto, nunca animado: não há o que ver numa rolagem de sete
 * mil pixels atrás de uma cortina, e assim também é o comportamento certo
 * com `prefers-reduced-motion`.
 *
 * Hash que não existe na página (link velho, favorito quebrado) volta ao
 * comportamento de quem chega sem hash — o topo — mas só se nada tiver
 * mexido no scroll nesse meio tempo.
 */
function seguirHash(id: string): () => void {
  const inicio = performance.now();
  const partida = window.scrollY;
  let raf = 0;
  let corrigindo = true;

  const soltar = () => {
    corrigindo = false;
  };

  const tentar = (agora: number) => {
    const decorrido = agora - inicio;
    const el = document.getElementById(id);

    if (!el) {
      // alvo ainda não montou: procura no próximo frame
      if (decorrido < PRAZO_ALVO_MS) raf = requestAnimationFrame(tentar);
      else if (window.scrollY === partida) window.__tyLenis?.scrollTo(0, { immediate: true });
      return;
    }

    irAte(el, true);

    if (corrigindo && decorrido < PRAZO_ABERTURA_MS && document.querySelector(ABERTURA)) {
      raf = requestAnimationFrame(tentar);
    }
  };

  window.addEventListener("wheel", soltar, { passive: true, once: true });
  window.addEventListener("touchstart", soltar, { passive: true, once: true });
  window.addEventListener("keydown", soltar, { once: true });
  raf = requestAnimationFrame(tentar);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("wheel", soltar);
    window.removeEventListener("touchstart", soltar);
    window.removeEventListener("keydown", soltar);
  };
}

/**
 * Scroll suave (Lenis) só em ponteiro fino e sem preferência de movimento
 * reduzido. Em touch, o scroll nativo já é o certo.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1 });
    window.__tyLenis = lenis;
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__tyLenis = undefined;
    };
  }, []);

  // primeira carga e troca de rota: o #hash manda; sem hash, começa do topo
  useEffect(() => {
    const id = idDoHash();
    if (!id) {
      window.__tyLenis?.scrollTo(0, { immediate: true });
      return;
    }
    return seguirHash(id);
  }, [pathname]);

  return null;
}

/** Rola até um seletor (usa Lenis se existir, senão nativo). */
export function scrollToTarget(selector: string) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  irAte(el, false);
}
