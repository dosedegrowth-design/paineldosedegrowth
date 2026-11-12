/**
 * Google Analytics 4 do site da Tayssa (Lucas, 12/11/2026, com o site
 * entrando nos perfis dela: "preciso saber de detalhes"). A propriedade é a
 * que ele criou: fluxo "TAYSSA FARIAS", https://tayssafarias.com.br/.
 * Puro e testado em `analytics.test.ts`; quem carrega o GA no navegador é
 * `components/tayssa/ui/analise.tsx`.
 */

/** O ID de medição é público: vai no código de qualquer página com GA. */
export const GA_TAYSSA = "G-WCRGDB68B5";

/**
 * Onde o Analytics não conta, com ou sem o `/tayssa` na frente:
 * - o painel (`/admin`): é a Tayssa trabalhando, não cliente chegando;
 * - o entrar (`/entrar`): o link de entrada leva o código de acesso no `?t=`;
 * - o folder do horário (`/horario/<id>`): o id do pedido vai no endereço.
 */
export const FORA_DA_ANALISE = /^\/(?:tayssa\/)?(?:admin|entrar|horario)(?:\/|$)/;

export function foraDaAnalise(caminho: string): boolean {
  return FORA_DA_ANALISE.test(caminho);
}

/**
 * Atalhos com a origem marcada, para o GA separar de onde veio cada visita
 * (o Instagram abre o link no navegador dele e quase nunca diz de onde veio):
 * `tayssafarias.com.br/ig` na bio, `/stories` no link do story e `/whatsapp`
 * nas conversas e no status.
 */
export const ATALHOS = {
  ig: { utm_source: "instagram", utm_medium: "bio" },
  stories: { utm_source: "instagram", utm_medium: "stories" },
  whatsapp: { utm_source: "whatsapp", utm_medium: "conversa" },
} as const;

export type Atalho = keyof typeof ATALHOS;

/** O início do site com a origem do atalho no endereço. */
export function enderecoDoAtalho(inicio: string, atalho: Atalho): string {
  const u = new URL(inicio);
  for (const [k, v] of Object.entries(ATALHOS[atalho])) u.searchParams.set(k, v);
  return u.toString();
}
