"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

declare global {
  interface Window {
    __tyLenis?: Lenis;
  }
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

  // troca de rota: começa do topo, sem animar
  useEffect(() => {
    window.__tyLenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}

/** Rola até um seletor (usa Lenis se existir, senão nativo). */
export function scrollToTarget(selector: string) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  if (window.__tyLenis) {
    window.__tyLenis.scrollTo(el, { offset: -8, duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
