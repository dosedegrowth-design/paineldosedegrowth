"use client";

import dynamic from "next/dynamic";
import { useMotionFX } from "./use-desktop-fx";

const AmbientCrystals = dynamic(
  () => import("./ambient-crystals").then((m) => m.AmbientCrystals),
  { ssr: false }
);

export function AmbientCrystalsClient() {
  const { ok, lite } = useMotionFX();
  if (!ok) return null;
  return <AmbientCrystals lite={lite} />;
}
