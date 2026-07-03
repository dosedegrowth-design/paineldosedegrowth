"use client";

import dynamic from "next/dynamic";

export const AmbientCrystalsClient = dynamic(
  () => import("./ambient-crystals").then((m) => m.AmbientCrystals),
  { ssr: false }
);
