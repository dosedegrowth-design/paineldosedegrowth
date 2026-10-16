/**
 * Vídeos reais — manifesto de slots.
 *
 * Os vídeos da Tayssa entram em `public/tayssa/videos/` com estes nomes.
 * Cada slot tem duas versões: horizontal (desktop/tablet deitado) e
 * vertical (celular/tablet em pé), mais um pôster (primeiro quadro, em
 * JPG) que aparece enquanto o vídeo carrega e quando o movimento está
 * desligado. Sem o arquivo, o lugar cai para a foto do slot indicado em
 * `fallbackPhoto` e, sem foto, para o campo tonal — nunca vídeo de banco.
 *
 * Especificação completa em public/tayssa/videos/README.md.
 */

export type VideoSlot = {
  /** horizontal 16:9 — desktop e tablet deitado */
  landscape: string;
  /** vertical 9:16 (ou 4:5) — celular e tablet em pé */
  portrait: string;
  /** primeiro quadro em JPG, mesma proporção do horizontal */
  poster: string;
  /** pôster vertical */
  posterPortrait: string;
  /** descrição para quem não vê o vídeo */
  label: string;
};

const base = "/tayssa/videos";

export const VIDEOS = {
  /** abertura: a janela do herói (loop curto, sem som) */
  hero: {
    landscape: `${base}/hero-16x9.mp4`,
    portrait: `${base}/hero-9x16.mp4`,
    poster: `${base}/hero-16x9.jpg`,
    posterPortrait: `${base}/hero-9x16.jpg`,
    label: "A Tayssa atendendo no estúdio",
  },
  /** o filme: o processo de aplicação, abre até a tela cheia no scroll */
  processo: {
    landscape: `${base}/processo-16x9.mp4`,
    portrait: `${base}/processo-9x16.mp4`,
    poster: `${base}/processo-16x9.jpg`,
    posterPortrait: `${base}/processo-9x16.jpg`,
    label: "O processo de aplicação dos cílios, de perto",
  },
  /** o espaço: ambiente do estúdio */
  espaco: {
    landscape: `${base}/espaco-16x9.mp4`,
    portrait: `${base}/espaco-9x16.mp4`,
    poster: `${base}/espaco-16x9.jpg`,
    posterPortrait: `${base}/espaco-9x16.jpg`,
    label: "O estúdio da Tayssa",
  },
} satisfies Record<string, VideoSlot>;

export type VideoKey = keyof typeof VIDEOS;

/** Quais arquivos de cada slot existem de fato (calculado no servidor). */
export type VideoPresence = {
  landscape: boolean;
  portrait: boolean;
  poster: boolean;
  posterPortrait: boolean;
};

/** O slot só conta como vídeo se ao menos uma das versões existir. */
export const temVideo = (p?: VideoPresence) => Boolean(p && (p.landscape || p.portrait));
