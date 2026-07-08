"use client";

/* ClimaRail — a moldura viva do site:
   · Topo (mobile + desktop): linha de progresso que ESFRIA — âmbar no
     início da página, ciano no fim, com brilho na ponta.
   · Borda direita (desktop): régua térmica com a temperatura caindo de
     34°C pra 21°C conforme o scroll, floco marcando a posição.
   Scroll listener passivo + transform: custo ~zero. */

import { useEffect, useState } from "react";
import { Snowflake } from "lucide-react";

export function ClimaRail() {
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const temp = Math.round(34 - p * 13);

  return (
    <>
      {/* linha de progresso térmica no topo — acima da navbar */}
      <div
        className="fixed top-0 left-0 right-0 z-[60] h-[3px] pointer-events-none"
        aria-hidden
      >
        <div
          className="h-full origin-left will-change-transform"
          style={{
            transform: `scaleX(${p})`,
            background:
              "linear-gradient(90deg, #fb923c 0%, #38bdf8 55%, #22d3ee 100%)",
            boxShadow: "0 0 12px rgba(34, 211, 238, 0.55)",
          }}
        />
      </div>

      {/* régua térmica na borda direita — desktop */}
      <div
        className="fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-2.5 pointer-events-none"
        aria-hidden
      >
        <span className="font-tech text-[9.5px] tracking-[0.2em] text-orange-300/70">
          34°
        </span>
        <div className="relative h-44 w-[3px] rounded-full bg-white/[0.08]">
          <div
            className="absolute left-0 right-0 top-0 rounded-full"
            style={{
              height: `${p * 100}%`,
              background: "linear-gradient(180deg, #fb923c, #38bdf8, #22d3ee)",
            }}
          />
          <span
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full border border-cyan-400/40 bg-[#060a14] shadow-[0_0_12px_rgba(34,211,238,0.45)]"
            style={{ top: `${p * 100}%` }}
          >
            <Snowflake className="h-3 w-3 text-cyan-300" />
          </span>
        </div>
        <span className="font-tech text-[10px] tracking-[0.2em] text-cyan-300 tabular-nums">
          {temp}°
        </span>
      </div>
    </>
  );
}
