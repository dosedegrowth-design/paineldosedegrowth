"use client";

import dynamic from "next/dynamic";
import { useDesktopFX } from "./use-desktop-fx";

const AmbientCrystals = dynamic(
  () => import("./ambient-crystals").then((m) => m.AmbientCrystals),
  { ssr: false }
);

export function AmbientCrystalsClient() {
  const ok = useDesktopFX();
  if (!ok) return null;
  return <AmbientCrystals />;
}
