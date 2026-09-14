/**
 * Prova social — selo do Google + relatos reais do Google Meu Negócio.
 *
 * Nada aqui é escrito por nós: cada relato é copiado de uma avaliação
 * real do perfil da VIVA no Google. Enquanto a lista estiver vazia, o
 * bloco desenha o campo tonal com a legenda — igual às fotos. Nunca
 * depoimento inventado.
 */

export type Relato = {
  /** primeiro nome + inicial, como aparece no Google */
  autor: string;
  /** 1 a 5, como o cliente avaliou */
  nota: number;
  texto: string;
  /** opcional: "há 2 meses", como o Google mostra */
  quando?: string;
};

export const GOOGLE = {
  /** link do perfil no Google Meu Negócio — ⚠️ confirmar com a VIVA */
  perfilUrl: "",
  /** nota média exibida no selo; null enquanto não confirmada */
  nota: null as number | null,
  /** quantidade de avaliações; null enquanto não confirmada */
  total: null as number | null,
} as const;

/** Copiar do perfil do Google. Vazio = bloco mostra o slot a preencher. */
export const RELATOS: Relato[] = [];
