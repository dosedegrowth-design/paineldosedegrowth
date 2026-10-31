/**
 * O briefing da Marina Saleme: os meses, o formato de um anúncio e as
 * contas da lista. Puro (sem banco, sem React) para servir aos dois
 * lados. As regras de validação ficam na action.
 */

// Só novembro por enquanto. Acrescentar dezembro (ou janeiro) é
// uma entrada aqui e outra em MES_TITULO: o banco já aceita.
export const MESES = ["novembro"] as const;
export type Mes = (typeof MESES)[number];

/** Como o mês aparece escrito na tela. */
export const MES_TITULO: Record<Mes, string> = {
  novembro: "Anúncios de novembro",
};

export type ArquivoAnuncio = {
  id: string;
  anuncioId: string;
  url: string;
  nome: string;
  mime: string;
  bytes: number | null;
};

/**
 * As duas frentes de novembro. Mora no ARQUIVO, não no anúncio: a Bia
 * cadastrou foto de estampa nova dentro de anúncio de última peça, então
 * quem tem frente é cada imagem.
 */
export const FRENTES = ["ultimas", "novas"] as const;
export type Frente = (typeof FRENTES)[number];

export const FRENTE_TITULO: Record<Frente, string> = {
  ultimas: "Últimas peças",
  novas: "Estampas novas",
};

export const FRENTE_DICA: Record<Frente, string> = {
  ultimas: "O que já está na loja e precisa sair.",
  novas: "Tijolo, Paraíso, Rei e Rainha.",
};

/** A outra frente, para o botão de mover. */
export const outraFrente = (f: Frente): Frente => (f === "ultimas" ? "novas" : "ultimas");

/**
 * Uma foto ou vídeo na tela de organizar.
 *
 * `peca` é o nome do produto DESTA foto, no padrão da marca (peça e estampa
 * num nome só, como na loja: "CAMISA ANA PARAÍSO BLUE"). `grupo` é o anúncio
 * onde a Bia cadastrou: nas estampas novas ela juntou várias peças no mesmo,
 * agrupando por estampa, então um grupo tem fotos de produtos diferentes.
 */
export type ItemOrganizar = ArquivoAnuncio & {
  frente: Frente;
  fora: boolean;
  peca: string;
  grupo: string;
  estampa: string;
  produtoUrl: string | null;
  ordem: number;
};

export const LIMITE_PECA = 160;

export function contarFrente(f: Frente, itens: ItemOrganizar[]): number {
  return itens.filter((i) => !i.fora && i.frente === f).length;
}

export type Anuncio = {
  id: string;
  mes: Mes;
  ordem: number;
  peca: string;
  estampa: string;
  legenda: string;
  link: string;
};

/** O que a Bia escreve. O id e o mês não mudam depois de criado. */
export type CamposAnuncio = Pick<Anuncio, "peca" | "estampa" | "legenda" | "link">;

export const CAMPOS_VAZIOS: CamposAnuncio = { peca: "", estampa: "", legenda: "", link: "" };

export const LIMITES = { peca: 120, estampa: 120, legenda: 2200, link: 500 } as const;

/** Um anúncio conta como pronto quando tem peça, legenda e pelo menos um arquivo. */
export function anuncioPronto(a: Anuncio, arquivos: ArquivoAnuncio[]): boolean {
  return (
    a.peca.trim().length > 0 &&
    a.legenda.trim().length > 0 &&
    arquivos.some((f) => f.anuncioId === a.id)
  );
}

export function contarMes(mes: Mes, anuncios: Anuncio[], arquivos: ArquivoAnuncio[]) {
  const doMes = anuncios.filter((a) => a.mes === mes);
  return { total: doMes.length, prontos: doMes.filter((a) => anuncioPronto(a, arquivos)).length };
}

export const ehVideo = (mime: string) => mime.startsWith("video/");

/** 1,4 MB — para a Bia ver o peso do que subiu. */
export function peso(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "";
  const mb = bytes / 1024 / 1024;
  if (mb < 1) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${mb.toFixed(1).replace(".", ",")} MB`;
}

/** O que toda action deste briefing devolve. */
export type Resultado<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; error: string };
