"use client";

/* Fundo do hero: grade com parallax de scroll (-0.02x) e bolha de
   névoa que segue o mouse (0.05x) + bolha flutuante autônoma. */

import { useEffect, useRef } from "react";

export function MistBackground() {
  const grid = useRef<HTMLDivElement>(null);
  const blob = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let mx = 0.5;
    let my = 0.4;

    const paint = () => {
      if (grid.current) {
        grid.current.style.transform = `translateY(${window.scrollY * -0.02}px)`;
      }
      if (blob.current) {
        blob.current.style.transform = `translate(calc(${mx * 100}vw - 50% + ${
          (mx - 0.5) * 0.05 * window.innerWidth
        }px), calc(${my * 60}vh - 50%))`;
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paint);
    };
    const onMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth;
      my = e.clientY / window.innerHeight;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div ref={grid} className="absolute -inset-y-10 inset-x-0 andre-grid-bg" />
      <div className="andre-mist-blob" style={{ top: "-6%", left: "52%" }} />
      <div
        className="andre-mist-blob"
        style={{ top: "40%", left: "-12%", animationDelay: "-4s" }}
      />
      <div ref={blob} className="andre-mist-blob" style={{ opacity: 0.7 }} />
    </div>
  );
}
