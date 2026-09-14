import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/**
 * Projeto vizinho do painel dentro do mesmo repositório: sem fixar a raiz,
 * o Turbopack sobe um nível e passa a usar o postcss.config e o
 * middleware do painel. A raiz é esta pasta e só ela.
 */
const nextConfig: NextConfig = {
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
