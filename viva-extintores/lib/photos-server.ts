import "server-only";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { TODOS_OS_SLOTS } from "@/lib/photos";

/**
 * Quais fotos já existem em `public/photos/`.
 *
 * Roda no servidor, uma vez por build/render: o cliente não fica pedindo
 * arquivo que não existe só para descobrir que não existe. O que falta
 * vira campo tonal no <FotoReal>.
 */
export function disponibilidadeDeFotos(): Record<string, boolean> {
  let arquivos: Set<string>;
  try {
    arquivos = new Set(readdirSync(join(process.cwd(), "public", "photos")));
  } catch {
    arquivos = new Set();
  }

  const mapa: Record<string, boolean> = {};
  for (const slot of TODOS_OS_SLOTS) {
    mapa[slot.src] = arquivos.has(slot.src.replace("/photos/", ""));
  }
  return mapa;
}
