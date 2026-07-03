"use client";

import dynamic from "next/dynamic";

export const HeroCanvasClient = dynamic(
  () => import("./hero-canvas").then((m) => m.HeroCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
        Carregando 3D…
      </div>
    ),
  }
);
