import "server-only";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { arquivoLocal, TODOS_OS_SLOTS } from "@/lib/photos";

/**
 * Quais fotos já existem em `public/photos/<lote>/`.
 *
 * Roda no servidor, uma vez por render: o navegador não fica pedindo
 * arquivo que não existe só para descobrir que não existe. O que falta
 * vira campo tonal no <FotoReal>.
 */
export function disponibilidadeDeFotos(): Record<string, boolean> {
  const publico = join(process.cwd(), "public");
  const mapa: Record<string, boolean> = {};
  for (const slot of TODOS_OS_SLOTS) {
    // basta conferir um recorte: a receita gera todos de uma vez
    mapa[slot.base] = existsSync(join(publico, arquivoLocal(slot, "w")));
  }
  return mapa;
}
