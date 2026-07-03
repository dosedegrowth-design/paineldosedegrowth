"use client";

import { useEffect, useRef } from "react";

export function TechHud() {
  const glowRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      glowRef.current.style.setProperty("--gx", `${e.clientX}px`);
      glowRef.current.style.setProperty("--gy", `${e.clientY}px`);
    };
    const onScroll = () => {
      if (!barRef.current) return;
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      barRef.current.style.width = `${(window.scrollY / max) * 100}%`;
    };
    onScroll();
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      {/* Barra de progresso de scroll */}
      <div ref={barRef} className="andre-scroll-progress" aria-hidden />
      {/* Cursor spotlight */}
      <div
        ref={glowRef}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 25,
          pointerEvents: "none",
          background:
            "radial-gradient(220px circle at var(--gx, 50%) var(--gy, 50%), rgba(56, 189, 248, 0.14), transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
      {/* Scanlines */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 24,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(0deg, rgba(56,189,248,0.02) 0px, rgba(56,189,248,0.02) 1px, transparent 1px, transparent 4px)",
          mixBlendMode: "overlay",
          opacity: 0.3,
        }}
      />
      {/* Corner brackets */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 26,
          pointerEvents: "none",
        }}
      >
        {(["tl", "tr", "bl", "br"] as const).map((pos) => (
          <span key={pos} className={`tech-bracket tech-bracket-${pos}`} />
        ))}
        <div className="tech-readout">
          <span className="tech-dot" /> ANDRE_AC · SYS_ONLINE · SP-BR
        </div>
        <div className="tech-readout tech-readout-r">
          v2.4 · uptime: 24h · lat: 5ms
        </div>
      </div>
    </>
  );
}
