/**
 * O briefing da Marina Saleme: os meses, o formato de um anúncio e as
 * contas da lista. Puro (sem banco, sem React) para servir aos dois
 * lados. As regras de validação ficam na action.
 */

export const MESES = ["novembro", "dezembro"] as const;
export type Mes = (typeof MESES)[number];

/** Como o mês aparece escrito na tela. Acrescentar mês novo é uma linha aqui e uma em MESES. */
export const MES_TITULO: Record<Mes, string> = {
  novembro: "Anúncios de novembro",
  dezembro: "Anúncios de dezembro",
};

export type ArquivoAnuncio = {
  id: string;
  anuncioId: string;
  url: string;
  nome: string;
  mime: string;
  bytes: number | null;
};

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
