"use client";

/* Luz ambiente que acompanha o cursor — quase subliminar. */

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e: MouseEvent) => {
      if (!ref.current) return;
      ref.current.style.setProperty("--cx", `${e.clientX}px`);
      ref.current.style.setProperty("--cy", `${e.clientY}px`);
      ref.current.style.opacity = "1";
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-0 z-[6] pointer-events-none hidden lg:block"
      style={{
        opacity: 0,
        background:
          "radial-gradient(240px circle at var(--cx, 50%) var(--cy, 50%), rgba(56, 189, 248, 0.07), transparent 70%)",
        mixBlendMode: "screen",
        transition: "opacity 0.6s ease",
      }}
    />
  );
}
