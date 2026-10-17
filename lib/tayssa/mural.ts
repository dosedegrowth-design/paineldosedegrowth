/**
 * O mural do VIP: as fotos aprovadas para o site (Mídia → No site, de
 * qualquer serviço) passando na diagonal, em fileiras que correm sem fim,
 * atrás do espaço da cliente. Puro, para ser testado.
 */
import type { PhotoRow } from "@/lib/tayssa/types";

export type FotoMural = { src: string; foco: { x: number; y: number; zoom: number } };

type Linha = Pick<PhotoRow, "public_url" | "media_type" | "status"> & Partial<Pick<PhotoRow, "focus_x" | "focus_y" | "zoom">>;

/**
 * As fotos do mural: só imagem publicada (vídeo pesaria e não para). Com
 * menos de 6, completa com as fotos reais do site (arquivos que existem).
 */
export function fotosDoMural(linhas: Linha[], estaticas: string[] = [], minimo = 6): FotoMural[] {
  const publicadas: FotoMural[] = linhas
    .filter((l) => l.status === "active" && l.media_type !== "video" && l.public_url)
    .map((l) => ({ src: l.public_url, foco: { x: Number(l.focus_x ?? 50), y: Number(l.focus_y ?? 50), zoom: Number(l.zoom ?? 1) } }));
  const todas = publicadas.length >= minimo ? publicadas : [...publicadas, ...estaticas.map((src) => ({ src, foco: { x: 50, y: 50, zoom: 1 } }))];
  const vistos = new Set<string>();
  return todas.filter((f) => (vistos.has(f.src) ? false : (vistos.add(f.src), true)));
}

/**
 * Distribui as fotos nas fileiras: cada fileira começa num ponto diferente
 * da lista (fileiras vizinhas nunca mostram a mesma foto em cima da outra)
 * e repete até ter fotos suficientes para cobrir a largura.
 */
export function fileirasDoMural(fotos: FotoMural[], fileiras = 5, porFileira = 7): FotoMural[][] {
  const n = fotos.length;
  if (!n) return [];
  // meia volta da lista entre fileiras vizinhas (no mínimo uma foto)
  const passo = Math.max(1, Math.floor(n / 2));
  return Array.from({ length: fileiras }, (_, f) =>
    Array.from({ length: Math.max(porFileira, n) }, (_, i) => fotos[(i + f * passo) % n]),
  );
}
