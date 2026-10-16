import "server-only";
import { cache } from "react";
import { existsSync } from "node:fs";
import path from "node:path";
import { VIDEOS, type VideoKey, type VideoPresence } from "@/lib/tayssa/media";

export type VideoAvailability = Record<VideoKey, VideoPresence>;

/**
 * Quais vídeos reais já existem em public/tayssa/videos. Mesma ideia das
 * fotos: o slot nasce sabendo se tem arquivo, sem pedir o que não existe.
 */
export const getVideoAvailability = cache(async (): Promise<VideoAvailability> => {
  const root = path.join(process.cwd(), "public");
  const has = (src: string) => {
    try {
      return existsSync(path.join(root, src));
    } catch {
      return false;
    }
  };
  const out = {} as VideoAvailability;
  for (const [key, slot] of Object.entries(VIDEOS) as [VideoKey, (typeof VIDEOS)[VideoKey]][]) {
    out[key] = {
      landscape: has(slot.landscape),
      portrait: has(slot.portrait),
      poster: has(slot.poster),
      posterPortrait: has(slot.posterPortrait),
    };
  }
  return out;
});
