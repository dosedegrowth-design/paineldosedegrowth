"use client";

import dynamic from "next/dynamic";

export const AndreExperienceClient = dynamic(
  () => import("./andre-experience").then((m) => m.AndreExperience),
  { ssr: false }
);
