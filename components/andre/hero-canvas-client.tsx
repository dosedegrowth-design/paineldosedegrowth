"use client";

import dynamic from "next/dynamic";
import { useDesktopFX } from "./use-desktop-fx";

const HeroCanvas = dynamic(
  () => import("./hero-canvas").then((m) => m.HeroCanvas),
  { ssr: false }
);

export function HeroCanvasClient() {
  const ok = useDesktopFX();
  if (!ok) return null;
  return <HeroCanvas />;
}
