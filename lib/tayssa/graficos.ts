/**
 * As contas dos gráficos do painel (Lucas, 17/11/2026: "o Dash tá mó seco,
 * não tem uma animação, um gráfico pizza, um gráfico coluna deitado").
 * Puro e testado; os componentes de `components/tayssa/admin/graficos.tsx`
 * só desenham o que sai daqui.
 *
 * - Faturamento por dia: até 31 dias, uma coluna por dia; até 120, por
 *   semana (começa no domingo, como a agenda); mais que isso, por mês.
 * - Como entrou: Pix, dinheiro, cartão (crédito + débito), outra forma e o
 *   que ainda está pendente. Os percentuais somam 100 (maior resto).
 * - Serviços mais feitos: os cinco primeiros e o resto em "Outros".
 */
import { diasEntre, inicioDaSemana, somarDias, type ResumoFinanceiro } from "./financeiro.ts";

const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function diaDaSemana(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  return SEMANA[new Date(Date.UTC(a, m - 1, d)).getUTCDay()];
}

function dm(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export type GrupoDaSerie = "dia" | "semana" | "mes";

export type PontoDaSerie = {
  /** primeiro e último dia do grupo, dentro do período */
  inicio: string;
  fim: string;
  /** embaixo da coluna: "17", "16/11", "nov" */
  rotulo: string;
  /** na dica e na tabela: "seg, 17/11", "semana de 16/11", "novembro de 2026" */
  rotuloLongo: string;
  valor: number;
  atendimentos: number;
  /** o grupo em que hoje cai */
  atual: boolean;
};

export type SerieDoPeriodo = { grupo: GrupoDaSerie; pontos: PontoDaSerie[]; maior: number };

export function grupoDoPeriodo(de: string, ate: string): GrupoDaSerie {
  const dias = diasEntre(de, ate) + 1;
  return dias <= 31 ? "dia" : dias <= 120 ? "semana" : "mes";
}

/**
 * O faturamento do período em colunas: todo dia (semana, mês) do período
 * aparece, mesmo sem atendimento (coluna vazia), para o tempo não mentir.
 */
export function serieDoPeriodo(
  lista: readonly { data: string; valor: number | null }[],
  de: string,
  ate: string,
  hoje: string,
): SerieDoPeriodo {
  const grupo = grupoDoPeriodo(de, ate);
  const chave = (iso: string) => (grupo === "dia" ? iso : grupo === "semana" ? inicioDaSemana(iso) : iso.slice(0, 7));
  const pontos: PontoDaSerie[] = [];
  const porChave = new Map<string, { ponto: PontoDaSerie; centavos: number }>();
  for (let d = de; d <= ate; d = somarDias(d, 1)) {
    const k = chave(d);
    const ja = porChave.get(k);
    if (ja) {
      ja.ponto.fim = d;
      continue;
    }
    const [a, m] = d.split("-").map(Number);
    const ponto: PontoDaSerie = {
      inicio: d,
      fim: d,
      rotulo: grupo === "dia" ? String(Number(d.slice(8))) : grupo === "semana" ? dm(d) : MESES[m - 1].slice(0, 3),
      rotuloLongo: grupo === "dia" ? `${diaDaSemana(d)}, ${dm(d)}` : grupo === "semana" ? `semana de ${dm(d)}` : `${MESES[m - 1]} de ${a}`,
      valor: 0,
      atendimentos: 0,
      atual: false,
    };
    pontos.push(ponto);
    porChave.set(k, { ponto, centavos: 0 });
  }
  for (const x of lista) {
    if (x.data < de || x.data > ate) continue;
    const alvo = porChave.get(chave(x.data));
    if (!alvo) continue;
    alvo.ponto.atendimentos++;
    if (x.valor != null && x.valor > 0) alvo.centavos += Math.round(x.valor * 100);
  }
  let maior = 0;
  for (const { ponto, centavos } of porChave.values()) {
    ponto.valor = centavos / 100;
    ponto.atual = hoje >= ponto.inicio && hoje <= ponto.fim;
    if (ponto.valor > maior) maior = ponto.valor;
  }
  return { grupo, pontos, maior };
}

/** Até 7 colunas, embaixo de cada uma vai o dia da semana ("seg"). */
export function rotuloDaColuna(p: PontoDaSerie, grupo: GrupoDaSerie, total: number): { cima?: string; baixo: string } {
  if (grupo === "dia" && total <= 7) return { cima: diaDaSemana(p.inicio), baixo: String(Number(p.inicio.slice(8))) };
  return { baixo: p.rotulo };
}

/** De quantas em quantas colunas vai um rótulo embaixo (nunca um embolado no outro). */
export function passoDosRotulos(total: number, maxRotulos = 7): number {
  return total <= maxRotulos ? 1 : Math.ceil(total / maxRotulos);
}

// ------------------------------------------------------------
// Eixo
// ------------------------------------------------------------

/** O topo do eixo num número redondo (1, 2, 2,5 ou 5 × 10ⁿ por marca) e as marcas. */
export function escala(maior: number, marcas = 2): { topo: number; marcas: number[] } {
  if (!(maior > 0)) return { topo: 100, marcas: [0, 50, 100] };
  const bruto = maior / marcas;
  const pot = 10 ** Math.floor(Math.log10(bruto));
  const passo = [1, 2, 2.5, 5, 10].map((x) => x * pot).find((x) => x * marcas >= maior) ?? 10 * pot;
  const lista = Array.from({ length: marcas + 1 }, (_, i) => Math.round(i * passo * 100) / 100);
  return { topo: lista[lista.length - 1], marcas: lista };
}

/** Dinheiro curto para eixo e rótulo de coluna: "R$ 480", "R$ 1.200", "R$ 12 mil", "R$ 1,2 mi". */
export function reaisCurto(v: number): string {
  const n = Math.round(v);
  if (n >= 1_000_000) return `R$ ${String(Math.round(n / 100_000) / 10).replace(".", ",")} mi`;
  if (n >= 10_000) return `R$ ${String(Math.round(n / 100) / 10).replace(".", ",")} mil`;
  return `R$ ${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

// ------------------------------------------------------------
// Como entrou (a rosca)
// ------------------------------------------------------------

export type FatiaId = "pix" | "dinheiro" | "cartao" | "outro" | "pendente";

export type Fatia = { id: FatiaId; nome: string; valor: number; pct: number };

export const NOME_DA_FATIA: Record<FatiaId, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  outro: "Outra forma",
  pendente: "Ainda pendente",
};

/** Percentuais inteiros que somam 100: arredonda para baixo e dá o que falta aos maiores restos. */
export function percentuaisInteiros(valores: readonly number[]): number[] {
  const total = valores.reduce((s, v) => s + Math.max(0, v), 0);
  if (!(total > 0)) return valores.map(() => 0);
  const exatos = valores.map((v) => (Math.max(0, v) / total) * 100);
  const base = exatos.map(Math.floor);
  let falta = 100 - base.reduce((s, v) => s + v, 0);
  const ordem = exatos.map((e, i) => ({ i, resto: e - base[i] })).sort((a, b) => b.resto - a.resto || a.i - b.i);
  for (const { i } of ordem) {
    if (falta <= 0) break;
    if (valores[i] > 0) {
      base[i]++;
      falta--;
    }
  }
  return base;
}

/**
 * O dinheiro do período por forma de pagamento, e o pendente por último:
 * a rosca inteira é tudo o que o período vale (recebido + pendente).
 */
export function fatiasDoPeriodo(r: Pick<ResumoFinanceiro, "porForma" | "pendente">): { fatias: Fatia[]; total: number; pctRecebido: number } {
  const centavos = (v: number) => Math.round(v * 100);
  const todas: { id: FatiaId; c: number }[] = [
    { id: "pix", c: centavos(r.porForma.pix) },
    { id: "dinheiro", c: centavos(r.porForma.dinheiro) },
    { id: "cartao", c: centavos(r.porForma.cartao_credito) + centavos(r.porForma.cartao_debito) },
    { id: "outro", c: centavos(r.porForma.outro) },
    { id: "pendente", c: centavos(r.pendente) },
  ];
  const brutas = todas.filter((f) => f.c > 0);
  const pcts = percentuaisInteiros(brutas.map((f) => f.c));
  const fatias = brutas.map((f, i) => ({ id: f.id, nome: NOME_DA_FATIA[f.id], valor: f.c / 100, pct: pcts[i] }));
  const total = brutas.reduce((s, f) => s + f.c, 0);
  const pendente = brutas.find((f) => f.id === "pendente")?.c ?? 0;
  // "já recebido" arredonda para baixo: 99,6% recebido não pode dizer 100% com algo ainda pendente
  const pctRecebido = total ? Math.floor(((total - pendente) / total) * 100) : 0;
  return { fatias, total: total / 100, pctRecebido };
}

/** Onde cada fatia começa e termina na volta (0 a 1), com o vão de 2px já descontado na hora de desenhar. */
export function arcos(fatias: readonly { valor: number }[]): { inicio: number; fim: number; meio: number }[] {
  const total = fatias.reduce((s, f) => s + f.valor, 0);
  let acc = 0;
  return fatias.map((f) => {
    const inicio = total ? acc / total : 0;
    acc += f.valor;
    const fim = total ? acc / total : 0;
    return { inicio, fim, meio: (inicio + fim) / 2 };
  });
}

// ------------------------------------------------------------
// Serviços mais feitos (barras deitadas)
// ------------------------------------------------------------

export type BarraDeServico = { nome: string; vezes: number; outros?: boolean };

/** Os mais feitos primeiro; do sexto em diante, somados em "Outros". */
export function servicosMaisFeitos(servicos: readonly { nome: string; vezes: number }[], max = 5): BarraDeServico[] {
  const ordem = [...servicos].filter((s) => s.vezes > 0).sort((a, b) => b.vezes - a.vezes || a.nome.localeCompare(b.nome, "pt-BR"));
  if (ordem.length <= max + 1) return ordem;
  const resto = ordem.slice(max);
  return [...ordem.slice(0, max), { nome: `Outros (${resto.length})`, vezes: resto.reduce((s, x) => s + x.vezes, 0), outros: true }];
}
