"use client";

/* Termômetro fixo: o scroll "climatiza" a página — 34°C no topo,
   21°C no fim. Barra preenche com glow ciano. */

import { useEffect, useRef, useState } from "react";

export function Thermometer() {
  const fill = useRef<HTMLDivElement>(null);
  const [temp, setTemp] = useState(34);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const p = Math.min(1, window.scrollY / max);
      if (fill.current) fill.current.style.height = `${p * 100}%`;
      setTemp(Math.round((34 - p * 13) * 10) / 10);
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
    <div className="andre-thermo" aria-hidden>
      <span className="font-tech text-[10px] tracking-[0.2em] text-[var(--andre-primary)]">
        {temp.toFixed(0)}°C
      </span>
      <div className="andre-thermo-bar">
        <div ref={fill} className="andre-thermo-fill" style={{ height: "0%" }} />
      </div>
      <span className="andre-thermo-label">AMBIENTE: 34°C → 21°C</span>
    </div>
  );
}
