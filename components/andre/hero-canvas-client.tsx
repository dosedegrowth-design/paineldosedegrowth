"use client";

import dynamic from "next/dynamic";

export const HeroCanvasClient = dynamic(
  () => import("./hero-canvas").then((m) => m.HeroCanvas),
  { ssr: false }
);
