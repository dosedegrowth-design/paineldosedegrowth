"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor mínimo (ponto cassis). Sobre elementos com [data-cursor="VER"]
 * vira um disco com a palavra. Sobre campos, some (o caret nativo manda).
 * Só desktop com ponteiro fino; nunca em movimento reduzido.
 * Sempre renderizado (aria-hidden, display:none) — o efeito só liga.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    const label = labelRef.current;
    if (!fine || reduced || !el) return;

    const scope = document.querySelector<HTMLElement>(".ty-scope");
    scope?.setAttribute("data-cursor", "on");
    el.style.display = "flex";

    let tx = -100;
    let ty = -100;
    let x = tx;
    let y = ty;
    let raf = 0;
    let visible = false;

    const tick = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = `translate3d(${x - el.offsetWidth / 2}px, ${y - el.offsetHeight / 2}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const setState = (state: string, text = "") => {
      el.dataset.state = state;
      if (label) label.textContent = text;
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        x = tx;
        y = ty;
        el.style.opacity = "1";
      }
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest("input, textarea, select, [data-cursor='native']")) {
        setState("hidden");
        return;
      }
      const tagged = t.closest<HTMLElement>("[data-cursor]");
      if (tagged?.dataset.cursor) {
        setState("label", tagged.dataset.cursor);
        return;
      }
      if (t.closest("a, button, [role='button'], label")) {
        setState("dot-lg");
        return;
      }
      setState("dot");
    };
    const onLeave = () => {
      el.style.opacity = "0";
      visible = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      scope?.removeAttribute("data-cursor");
      el.style.display = "none";
    };
  }, []);

  return (
    <div ref={ref} className="ty-cursor" data-state="dot" style={{ opacity: 0, display: "none" }} aria-hidden>
      <span ref={labelRef} className="ty-cursor__label" />
    </div>
  );
}
