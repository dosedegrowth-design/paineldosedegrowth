import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A LP vive dentro do repo do painel. Sem fixar a raiz, o Turbopack sobe até
  // /paineldosedegrowth, acha o lockfile e o middleware.ts de lá e tenta
  // compilá-los como se fossem desta app.
  turbopack: { root: path.dirname(new URL(import.meta.url).pathname) },
};

export default nextConfig;
