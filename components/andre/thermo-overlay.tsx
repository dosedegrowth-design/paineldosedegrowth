"use client";

/* Narrativa térmica: a página começa levemente quente (âmbar) e esfria
   pra ciano conforme o scroll — a sensação de climatização acontecendo.
   Reversível: voltar ao topo re-aquece. */

import { useEffect, useRef } from "react";

export function ThermoOverlay() {
  const warm = useRef<HTMLDivElement>(null);
  const cool = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const p = Math.min(1, window.scrollY / 1800);
      if (warm.current) warm.current.style.opacity = String(0.14 * (1 - p));
      if (cool.current) cool.current.style.opacity = String(0.1 * p);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={warm}
        aria-hidden
        className="fixed inset-0 z-[5] pointer-events-none"
        style={{
          background:
            "radial-gradient(90% 70% at 50% 0%, rgba(251, 146, 60, 0.9), transparent 65%)",
          opacity: 0.14,
          mixBlendMode: "screen",
          transition: "opacity 0.2s linear",
        }}
      />
      <div
        ref={cool}
        aria-hidden
        className="fixed inset-0 z-[5] pointer-events-none"
        style={{
          background:
            "radial-gradient(90% 70% at 50% 100%, rgba(34, 211, 238, 0.8), transparent 65%)",
          opacity: 0,
          mixBlendMode: "screen",
          transition: "opacity 0.2s linear",
        }}
      />
    </>
  );
}
