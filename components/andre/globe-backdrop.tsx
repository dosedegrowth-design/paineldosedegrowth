"use client";

import dynamic from "next/dynamic";
import { useMotionFX } from "./use-desktop-fx";

const GlobeCanvas = dynamic(
  () => import("@/components/ui/globe-hero").then((m) => m.GlobeCanvas),
  { ssr: false }
);

/* Globo wireframe estático (SVG) — fallback só pra prefers-reduced-motion. */
function StaticWireGlobe() {
  const parallels = [-60, -40, -20, 0, 20, 40, 60];
  const meridians = [0.15, 0.4, 0.65, 0.85];
  return (
    <svg
      viewBox="-110 -110 220 220"
      className="w-[125vw] max-w-[560px] aspect-square opacity-[0.16]"
      fill="none"
      stroke="#22d3ee"
      strokeWidth="0.6"
      aria-hidden
    >
      <circle r="100" />
      {parallels.map((lat) => {
        const y = Math.sin((lat * Math.PI) / 180) * 100;
        const rx = Math.cos((lat * Math.PI) / 180) * 100;
        return <ellipse key={lat} cy={y} rx={rx} ry={rx * 0.22} />;
      })}
      {meridians.map((f) => (
        <ellipse key={f} rx={100 * f} ry={100} />
      ))}
    </svg>
  );
}

/* Atrás do hero: o mesmo globo three.js girando em desktop E mobile —
   mesma complexidade nas duas telas. SVG estático só quando o usuário
   pede menos movimento (prefers-reduced-motion). */
export function GlobeBackdrop() {
  const { ok, lite } = useMotionFX();

  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden"
      aria-hidden
    >
      {ok ? (
        <div className="absolute inset-0">
          <GlobeCanvas
            rotationSpeed={0.0035}
            /* mobile: raio menor pra esfera caber INTEIRA na tela */
            globeRadius={lite ? 0.92 : 1.55}
            wireframeColor="#22d3ee"
            wireframeOpacity={lite ? 0.17 : 0.14}
          />
        </div>
      ) : (
        <StaticWireGlobe />
      )}
    </div>
  );
}
