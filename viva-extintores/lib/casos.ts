/**
 * Casos reais (§17 e §18 do briefing).
 *
 * A transição "VEJA ALGUNS DOS NOSSOS CASOS REAIS ↓" é obrigatória no fim
 * das cinco páginas. Abaixo dela ficam as janelas do portfólio — poucas,
 * grandes, com foto ou vídeo. Não é para virar catálogo infinito (§24).
 *
 * Cada janela aceita foto (`imagem`) ou vídeo (`video`, arquivo em
 * `public/videos/` ou ID do YouTube). Lista vazia = janelas a preencher.
 */

import type { AreaSlug } from "@/lib/areas";

export type Janela = {
  titulo: string;
  local?: string;
  /** arquivo em public/photos/casos/ (sem extensão) */
  imagem?: string;
  /** arquivo .mp4 em public/videos/ OU ID de vídeo do YouTube */
  video?: string;
  /** "youtube" muda o embed; padrão é arquivo local */
  videoTipo?: "arquivo" | "youtube";
};

/** Quantas janelas o grid desenha quando ainda não há caso cadastrado. */
export const JANELAS_VAZIAS = 3;

export const CASOS: Record<AreaSlug, Janela[]> = {
  "combate-a-incendio": [],
  "alarme-e-deteccao": [],
  "spda-para-raios": [],
  "laudos-clcb-avcb": [],
  "relatorio-tecno-fotografico": [],
};
