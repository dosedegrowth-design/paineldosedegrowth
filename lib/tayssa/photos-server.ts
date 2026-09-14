import "server-only";
import { cache } from "react";
import { existsSync } from "node:fs";
import path from "node:path";
import { PHOTOS } from "@/lib/tayssa/photos";

export type PhotoAvailability = Record<string, boolean>;

/**
 * Quais fotos reais já existem em public/tayssa/photos.
 * Evita pedir ao otimizador de imagem um arquivo que não está lá: o slot
 * já nasce como campo tonal, sem flash nem 400 no console.
 */
export const getPhotoAvailability = cache(async (): Promise<PhotoAvailability> => {
  const root = path.join(process.cwd(), "public");
  const out: PhotoAvailability = {};
  for (const slot of Object.values(PHOTOS)) {
    try {
      out[slot.src] = existsSync(path.join(root, slot.src));
    } catch {
      out[slot.src] = false;
    }
  }
  return out;
});
