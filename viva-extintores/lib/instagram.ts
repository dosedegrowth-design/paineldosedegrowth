/**
 * Instagram (§ "Puxar o instagram importante").
 *
 * Hoje o bloco leva para o perfil e mostra os posts que a VIVA escolher,
 * como imagem em `public/photos/`. Quando a VIVA liberar o token da
 * Instagram Graph API, dá para trocar `POSTS` por uma busca no feed sem
 * mexer no componente — a forma do dado é a mesma.
 */

import { CONTATO } from "@/lib/config";

export type Post = {
  /** arquivo em public/photos/instagram/ (sem extensão) */
  imagem: string;
  legenda: string;
  /** permalink do post */
  url: string;
};

export const INSTAGRAM = {
  /** ⚠️ confirmar com a VIVA (env NEXT_PUBLIC_VIVA_INSTAGRAM) */
  handle: CONTATO.instagram,
  url: CONTATO.instagram
    ? `https://www.instagram.com/${CONTATO.instagram.replace(/^@/, "")}/`
    : "",
} as const;

/** Vazio = o bloco mostra as janelas a preencher, sem inventar post. */
export const POSTS: Post[] = [];
