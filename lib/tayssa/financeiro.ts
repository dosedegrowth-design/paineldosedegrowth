/**
 * Financeiro da Tayssa (17/11/2026): a divisão Tayssa/Larissa, o que entrou
 * e o que falta receber, por período. Puro (sem banco, sem Next) e testado.
 *
 * Regras que não podem quebrar:
 * - Só atendimento realizado (confirmado) entra: cancelamento e falta não
 *   são atendimento nem faturamento.
 * - Faturamento (o valor dos atendimentos) não é dinheiro recebido: recebido
 *   é a soma dos pagamentos registrados; o resto é pendente.
 * - A divisão de cada atendimento é a da hora em que ele fechou (pct guardado
 *   no atendimento): mudar os percentuais vale só para os próximos.
 * - Tudo em centavos: Tayssa + Larissa dá sempre o valor exato.
 */

export const FORMAS = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao_credito: "Cartão de crédito",
  cartao_debito: "Cartão de débito",
  outro: "Outra forma",
} as const;
export type FormaPagamento = keyof typeof FORMAS;
export const LISTA_FORMAS = Object.keys(FORMAS) as FormaPagamento[];

export function formaValida(v: unknown): v is FormaPagamento {
  return typeof v === "string" && v in FORMAS;
}

/** A divisão padrão (Lucas e Tayssa, 17/11/2026): 70% Tayssa e 30% Larissa. */
export const PCT_TAYSSA_PADRAO = 70;

export function centavos(v: number): number {
  return Math.round(v * 100);
}

/** O valor dividido: a parte da Tayssa arredonda no centavo e a Larissa fica com o resto (a soma bate). */
export function dividir(valor: number, pctTayssa: number): { tayssa: number; larissa: number } {
  const total = centavos(valor);
  const t = Math.round((total * pctTayssa) / 100);
  return { tayssa: t / 100, larissa: (total - t) / 100 };
}

/** Os dois percentuais precisam somar 100 (aceita até duas casas: 66,67 + 33,33). */
export function divisaoValida(pctTayssa: number, pctLarissa: number): boolean {
  return (
    Number.isFinite(pctTayssa) &&
    Number.isFinite(pctLarissa) &&
    pctTayssa >= 0 &&
    pctLarissa >= 0 &&
    Math.round(pctTayssa * 100) + Math.round(pctLarissa * 100) === 10000
  );
}

/** "70" → 70; "66,5" → 66.5; "R$ 1.234,50" → 1234.5. Vazio ou inválido → null. */
export function lerNumero(texto: string | null | undefined): number | null {
  if (texto == null) return null;
  const limpo = String(texto).replace(/[R$\s%]/g, "").trim();
  if (!limpo) return null;
  // "1.234,50" (Brasil) ou "1234.50": a vírgula, quando há, é o decimal
  const normal = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  const n = Number(normal);
  return Number.isFinite(n) ? n : null;
}

// ------------------------------------------------------------
// Situação do pagamento de um atendimento
// ------------------------------------------------------------

export type SituacaoPagamento = "pago" | "parcial" | "pendente" | "sem_valor";

export const SITUACAO_PAGAMENTO: Record<SituacaoPagamento, string> = {
  pago: "Pago",
  parcial: "Parcial",
  pendente: "Pendente",
  sem_valor: "Sem valor",
};

export function situacaoPagamento(valor: number | null, recebido: number): SituacaoPagamento {
  if (valor == null || valor <= 0) return "sem_valor";
  const v = centavos(valor);
  const r = centavos(recebido);
  if (r >= v) return "pago";
  if (r > 0) return "parcial";
  return "pendente";
}

// ------------------------------------------------------------
// Períodos (hoje, ontem, semana, mês, mês passado, dia, personalizado)
// ------------------------------------------------------------

export type TipoPeriodo = "hoje" | "ontem" | "dia" | "semana" | "mes" | "mes-passado" | "personalizado";

export type Periodo = {
  tipo: TipoPeriodo;
  /** "AAAA-MM-DD", inclusive */
  de: string;
  ate: string;
  rotulo: string;
};

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function isoValido(v: unknown): v is string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [a, m, d] = v.split("-").map(Number);
  const dt = new Date(Date.UTC(a, m - 1, d));
  return dt.getUTCFullYear() === a && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function utc(iso: string): Date {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}

function isoDe(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function somarDias(iso: string, n: number): string {
  const d = utc(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return isoDe(d);
}

/** Dias corridos de `de` até `ate` (ate − de). */
export function diasEntre(de: string, ate: string): number {
  return Math.round((utc(ate).getTime() - utc(de).getTime()) / 86400000);
}

/** O domingo da semana (a agenda do painel começa no domingo). */
export function inicioDaSemana(iso: string): string {
  return somarDias(iso, -utc(iso).getUTCDay());
}

function fimDoMes(ano: number, mes0: number): string {
  return isoDe(new Date(Date.UTC(ano, mes0 + 1, 0)));
}

function dm(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function dma(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

/** O nome do período como aparece no painel, no PDF e na mensagem. */
export function rotuloDoPeriodo(tipo: TipoPeriodo, de: string, ate: string, hoje: string): string {
  if (tipo === "hoje") return `Hoje, ${dm(de)}`;
  if (tipo === "ontem") return `Ontem, ${dm(de)}`;
  if (tipo === "dia") return de === hoje ? `Hoje, ${dm(de)}` : dma(de);
  if (tipo === "mes" || tipo === "mes-passado") {
    const [a, m] = de.split("-").map(Number);
    const nome = `${MESES[m - 1]} de ${a}`;
    return nome.charAt(0).toUpperCase() + nome.slice(1);
  }
  if (tipo === "semana") return `Semana de ${dm(de)} a ${dma(ate)}`;
  return de === ate ? dma(de) : `De ${dm(de)} a ${dma(ate)}`;
}

/**
 * O período pedido no endereço (`?periodo=semana&data=2026-11-17`,
 * `?periodo=mes&mes=2026-11`, `?periodo=personalizado&de=…&ate=…`). Qualquer
 * coisa inválida cai no padrão. Personalizado com as datas trocadas é
 * desvirado, e fica limitado a um ano.
 */
export function resolverPeriodo(
  params: { periodo?: string | null; data?: string | null; mes?: string | null; de?: string | null; ate?: string | null },
  hoje: string,
  padrao: TipoPeriodo = "mes",
): Periodo {
  const tipo = (["hoje", "ontem", "dia", "semana", "mes", "mes-passado", "personalizado"] as const).includes(
    params.periodo as TipoPeriodo,
  )
    ? (params.periodo as TipoPeriodo)
    : padrao;
  const base = isoValido(params.data) ? params.data : hoje;
  let de: string;
  let ate: string;
  switch (tipo) {
    case "hoje":
      de = ate = hoje;
      break;
    case "ontem":
      de = ate = somarDias(hoje, -1);
      break;
    case "dia":
      de = ate = base;
      break;
    case "semana":
      de = inicioDaSemana(base);
      ate = somarDias(de, 6);
      break;
    case "mes-passado": {
      const [a, m] = hoje.split("-").map(Number);
      const anterior = new Date(Date.UTC(a, m - 2, 1));
      de = isoDe(anterior);
      ate = fimDoMes(anterior.getUTCFullYear(), anterior.getUTCMonth());
      break;
    }
    case "personalizado": {
      const a = isoValido(params.de) ? params.de : hoje.slice(0, 8) + "01";
      const b = isoValido(params.ate) ? params.ate : hoje;
      [de, ate] = a <= b ? [a, b] : [b, a];
      if (diasEntre(de, ate) > 366) de = somarDias(ate, -366);
      break;
    }
    default: {
      const mes = typeof params.mes === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(params.mes) ? params.mes : base.slice(0, 7);
      const [a, m] = mes.split("-").map(Number);
      de = `${mes}-01`;
      ate = fimDoMes(a, m - 1);
    }
  }
  return { tipo, de, ate, rotulo: rotuloDoPeriodo(tipo, de, ate, hoje) };
}

/** O período ao lado (setas ‹ ›): dia, semana e mês andam; hoje/ontem viram dia; personalizado anda o próprio tamanho. */
export function periodoVizinho(p: Periodo, passo: 1 | -1, hoje: string): Periodo {
  if (p.tipo === "mes" || p.tipo === "mes-passado") {
    const [a, m] = p.de.split("-").map(Number);
    const d = new Date(Date.UTC(a, m - 1 + passo, 1));
    const mes = isoDe(d).slice(0, 7);
    return resolverPeriodo({ periodo: "mes", mes }, hoje);
  }
  if (p.tipo === "semana") return resolverPeriodo({ periodo: "semana", data: somarDias(p.de, 7 * passo) }, hoje);
  if (p.tipo === "personalizado") {
    const n = diasEntre(p.de, p.ate) + 1;
    return resolverPeriodo({ periodo: "personalizado", de: somarDias(p.de, n * passo), ate: somarDias(p.ate, n * passo) }, hoje);
  }
  return resolverPeriodo({ periodo: "dia", data: somarDias(p.de, passo) }, hoje);
}

/** O período como parâmetros de endereço (para links e para o PDF). */
export function parametrosDoPeriodo(p: Periodo): Record<string, string> {
  if (p.tipo === "hoje" || p.tipo === "ontem" || p.tipo === "mes-passado") return { periodo: p.tipo };
  if (p.tipo === "dia" || p.tipo === "semana") return { periodo: p.tipo, data: p.de };
  if (p.tipo === "mes") return { periodo: "mes", mes: p.de.slice(0, 7) };
  return { periodo: "personalizado", de: p.de, ate: p.ate };
}

// ------------------------------------------------------------
// Resumo financeiro de um conjunto de atendimentos realizados
// ------------------------------------------------------------

export type PagamentoFin = { valor: number; forma: FormaPagamento };

export type AtendimentoFin = {
  id: string;
  clienteId: string;
  data: string;
  servico: string;
  /** valor cobrado; null = sem valor registrado */
  valor: number | null;
  /** a parte da Tayssa da hora em que fechou; null = atendimento antigo (vale o padrão) */
  pctTayssa: number | null;
  pagamentos: PagamentoFin[];
};

export type ParteDe = {
  /** % efetivo no período (todos com 70 → 70) */
  pct: number;
  bruto: number;
  recebido: number;
  aReceber: number;
};

export type ResumoFinanceiro = {
  atendimentos: number;
  clientes: number;
  /** atendimentos sem valor registrado (não entram no faturamento nem no ticket) */
  semValor: number;
  bruto: number;
  recebido: number;
  pendente: number;
  ticketMedio: number;
  porForma: Record<FormaPagamento, number>;
  tayssa: ParteDe;
  larissa: ParteDe;
  /** os percentuais variaram dentro do período (uma mudança no meio) */
  divisaoVariou: boolean;
  servicos: { nome: string; vezes: number }[];
};

/** "Manutenção de cílios + Design de sobrancelhas" → cada serviço conta uma vez. */
function servicosDoNome(nome: string): string[] {
  return nome
    .split(" + ")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function recebidoDe(a: Pick<AtendimentoFin, "pagamentos">): number {
  return a.pagamentos.reduce((s, p) => s + centavos(p.valor), 0) / 100;
}

export function resumir(lista: readonly AtendimentoFin[], pctPadrao: number = PCT_TAYSSA_PADRAO): ResumoFinanceiro {
  let bruto = 0;
  let recebido = 0;
  let pendente = 0;
  let semValor = 0;
  let comValor = 0;
  const porForma = Object.fromEntries(LISTA_FORMAS.map((f) => [f, 0])) as Record<FormaPagamento, number>;
  const t = { bruto: 0, recebido: 0 };
  const l = { bruto: 0, recebido: 0 };
  const pcts = new Set<number>();
  const clientes = new Set<string>();
  const servicos = new Map<string, number>();

  for (const a of lista) {
    clientes.add(a.clienteId);
    for (const s of servicosDoNome(a.servico)) servicos.set(s, (servicos.get(s) ?? 0) + 1);
    const r = a.pagamentos.reduce((s, p) => s + centavos(p.valor), 0);
    for (const p of a.pagamentos) porForma[p.forma] += centavos(p.valor);
    recebido += r;
    if (a.valor == null || a.valor <= 0) {
      semValor++;
      continue;
    }
    comValor++;
    const v = centavos(a.valor);
    const pct = a.pctTayssa ?? pctPadrao;
    pcts.add(pct);
    const recebidoNoValor = Math.min(r, v);
    const tb = Math.round((v * pct) / 100);
    const tr = Math.round((recebidoNoValor * pct) / 100);
    bruto += v;
    pendente += v - recebidoNoValor;
    t.bruto += tb;
    t.recebido += tr;
    l.bruto += v - tb;
    l.recebido += recebidoNoValor - tr;
  }

  const pctEfetivo = (parte: number) => (bruto ? Math.round((parte / bruto) * 1000) / 10 : pcts.size === 1 ? [...pcts][0] : pctPadrao);
  const tayssaPct = pcts.size === 1 ? [...pcts][0] : pctEfetivo(t.bruto);
  return {
    atendimentos: lista.length,
    clientes: clientes.size,
    semValor,
    bruto: bruto / 100,
    recebido: recebido / 100,
    pendente: pendente / 100,
    ticketMedio: comValor ? Math.round(bruto / comValor) / 100 : 0,
    porForma: Object.fromEntries(Object.entries(porForma).map(([k, v]) => [k, v / 100])) as Record<FormaPagamento, number>,
    tayssa: { pct: tayssaPct, bruto: t.bruto / 100, recebido: t.recebido / 100, aReceber: (t.bruto - t.recebido) / 100 },
    larissa: {
      pct: Math.round((100 - tayssaPct) * 100) / 100,
      bruto: l.bruto / 100,
      recebido: l.recebido / 100,
      aReceber: (l.bruto - l.recebido) / 100,
    },
    divisaoVariou: pcts.size > 1,
    servicos: [...servicos.entries()].map(([nome, vezes]) => ({ nome, vezes })).sort((a, b) => b.vezes - a.vezes || a.nome.localeCompare(b.nome)),
  };
}

// ------------------------------------------------------------
// Histórico de uma cliente (Atendimentos realizados e a ficha)
// ------------------------------------------------------------

export type HistoricoCliente = {
  quantidade: number;
  primeira: string | null;
  ultima: string | null;
  servicos: { nome: string; vezes: number }[];
  /** o que ela gastou (valor dos atendimentos) */
  totalGasto: number;
  /** o que já foi pago */
  totalPago: number;
  /** média de dias entre um atendimento e outro (null com menos de dois) */
  frequenciaDias: number | null;
};

export function historicoDaCliente(lista: readonly Pick<AtendimentoFin, "data" | "servico" | "valor" | "pagamentos">[]): HistoricoCliente {
  const datas = lista.map((a) => a.data).sort();
  const servicos = new Map<string, number>();
  let gasto = 0;
  let pago = 0;
  for (const a of lista) {
    for (const s of servicosDoNome(a.servico)) servicos.set(s, (servicos.get(s) ?? 0) + 1);
    if (a.valor != null && a.valor > 0) gasto += centavos(a.valor);
    pago += a.pagamentos.reduce((s, p) => s + centavos(p.valor), 0);
  }
  return {
    quantidade: lista.length,
    primeira: datas[0] ?? null,
    ultima: datas[datas.length - 1] ?? null,
    servicos: [...servicos.entries()].map(([nome, vezes]) => ({ nome, vezes })).sort((a, b) => b.vezes - a.vezes || a.nome.localeCompare(b.nome)),
    totalGasto: gasto / 100,
    totalPago: pago / 100,
    frequenciaDias: datas.length >= 2 ? Math.round(diasEntre(datas[0], datas[datas.length - 1]) / (datas.length - 1)) : null,
  };
}

/** "volta a cada ~18 dias" · "primeira visita" · "" */
export function frequenciaLegivel(dias: number | null, quantidade: number): string {
  if (!quantidade) return "";
  if (dias == null) return "uma visita";
  if (dias <= 1) return "volta no mesmo dia";
  return `volta a cada ~${dias} dias`;
}

/** Recorrente: 3 atendimentos ou mais. */
export function ehRecorrente(quantidade: number): boolean {
  return quantidade >= 3;
}

// ------------------------------------------------------------
// Nome curto para o que sai do painel (página compartilhada e PDF)
// ------------------------------------------------------------

/** "Mariana Souza Lima" → "Mariana L." (sem sobrenome inteiro nem telefone no que é compartilhado) */
export function nomeCurto(nome: string | null | undefined): string {
  const partes = (nome ?? "").trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "Cliente";
  const primeiro = partes[0].charAt(0).toUpperCase() + partes[0].slice(1).toLowerCase();
  if (partes.length === 1) return primeiro;
  return `${primeiro} ${partes[partes.length - 1].charAt(0).toUpperCase()}.`;
}

/** Dinheiro no formato do Brasil, sempre com centavos (para relatório): "R$ 1.234,50". */
export function brl(v: number): string {
  const [int, dec] = Math.abs(v).toFixed(2).split(".");
  const milhar = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${v < 0 ? "-" : ""}R$ ${milhar},${dec}`;
}
