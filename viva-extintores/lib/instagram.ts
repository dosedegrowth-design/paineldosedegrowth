/**
 * Instagram — posts reais do perfil da VIVA.
 *
 * Aqui entram **permalinks de publicações reais**. O site renderiza o
 * post de verdade, pelo incorporador oficial do Instagram, e o clique
 * leva para a publicação. Nada de print, nada de foto solta imitando
 * post.
 *
 * Caminho para pegar o permalink: abrir a publicação no Instagram →
 * "..." → "Copiar link".
 *
 * Quando a VIVA liberar o token da Graph API dá para trocar esta lista
 * por uma busca no feed (`/me/media?fields=permalink`), sem mexer no
 * componente: a forma do dado é a mesma.
 */

import { CONTATO } from "@/lib/config";

export const INSTAGRAM = {
  /** ⚠️ confirmar com a VIVA (env NEXT_PUBLIC_VIVA_INSTAGRAM) */
  handle: CONTATO.instagram,
  url: CONTATO.instagram
    ? `https://www.instagram.com/${CONTATO.instagram.replace(/^@/, "")}/`
    : "",
} as const;

/**
 * Permalinks das publicações a exibir, na ordem.
 * Ex.: "https://www.instagram.com/p/CxxxxxxxxxX/"
 *
 * Vazio = o bloco mostra o espaço a preencher, sem inventar post.
 */
export const POSTS: string[] = [];

/**
 * Sem permalink aqui, a seção do Instagram simplesmente não aparece no
 * site. É de propósito: moldura vazia numa página que vai para o cliente
 * lê como obra inacabada. Cole os links e a seção volta.
 */
