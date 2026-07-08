"use client";

import dynamic from "next/dynamic";
import { useDesktopFX } from "./use-desktop-fx";

const GlobeCanvas = dynamic(
  () => import("@/components/ui/globe-hero").then((m) => m.GlobeCanvas),
  { ssr: false }
);

/* Globo wireframe atrás do hero — desktop only. No mobile o fundo fica
   por conta do MistBackground (CSS), que já é barato. */
export function GlobeBackdrop() {
  const ok = useDesktopFX();
  if (!ok) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
      <GlobeCanvas
        rotationSpeed={0.0035}
        globeRadius={1.55}
        wireframeColor="#22d3ee"
        wireframeOpacity={0.14}
      />
    </div>
  );
}
