import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/**
 * Dois modos de saída, escolhidos por ambiente:
 *
 * - padrão: app Next completo (Vercel).
 * - `VIVA_EXPORT=1`: exportação estática em `out/` — é o que o GitHub Pages
 *   serve. O site não tem servidor (onze páginas pré-renderizadas), então
 *   nada se perde. `VIVA_BASE_PATH` é o subcaminho quando o host não é a
 *   raiz (no Pages de projeto é `/<repo>`).
 *
 * `turbopack.root` fixo nesta pasta: sem isso o build sobe um nível e usa
 * o postcss.config e o middleware do painel.
 */
const exportar = Boolean(process.env.VIVA_EXPORT);
const basePath = process.env.VIVA_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: exportar ? "export" : undefined,
  basePath,
  // no Pages cada rota vira pasta/index.html — com a barra final o servidor
  // estático acha o arquivo sem precisar de regra de reescrita
  trailingSlash: exportar,
  env: { NEXT_PUBLIC_BASE_PATH: basePath ?? "" },
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
