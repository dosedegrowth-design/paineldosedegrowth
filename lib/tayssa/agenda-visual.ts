/**
 * A agenda do painel (17/11/2026, no jeito simples do app Tua Agenda): o
 * estado de cada horário em cores, o dia em linha do tempo, a semana e o mês.
 * Puro (sem banco, sem Next) e testado.
 */

export type EstadoVisual = "agendado" | "confirmado" | "em_atendimento" | "concluido" | "cancelado" | "faltou";

/** Na ordem da legenda. */
export const ESTADOS_VISUAIS: { id: EstadoVisual; nome: string }[] = [
  { id: "agendado", nome: "Agendado" },
  { id: "confirmado", nome: "Confirmado" },
  { id: "em_atendimento", nome: "Em atendimento" },
  { id: "concluido", nome: "Concluído" },
  { id: "cancelado", nome: "Cancelado" },
  { id: "faltou", nome: "Não compareceu" },
];

export const NOME_DO_ESTADO = Object.fromEntries(ESTADOS_VISUAIS.map((e) => [e.id, e.nome])) as Record<EstadoVisual, string>;

export function minutos(hhmm: string): number {
  const [h, m] = hhmm.slice(0, 5).split(":").map(Number);
  return h * 60 + (m || 0);
}

export function hhmmDe(min: number): string {
  const m = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/**
 * O estado que a agenda mostra: o pedido (aguardando o sinal) é "Agendado";
 * o confirmado vira "Em atendimento" enquanto o horário corre.
 */
export function estadoVisual(
  a: { status: string; data: string; hora: string; duracao: number },
  agora: { iso: string; min: number },
): EstadoVisual {
  if (a.status === "done") return "concluido";
  if (a.status === "cancelled") return "cancelado";
  if (a.status === "no_show") return "faltou";
  if (a.status === "confirmed" && a.data === agora.iso) {
    const ini = minutos(a.hora);
    if (agora.min >= ini && agora.min < ini + a.duracao) return "em_atendimento";
  }
  return a.status === "confirmed" ? "confirmado" : "agendado";
}

/** Ocupa a agenda (impede outro horário em cima)? Cancelado e falta liberam o horário. */
export function ocupaAgenda(status: string): boolean {
  return status === "requested" || status === "confirmed" || status === "done";
}

/** Dois horários se cruzam? (fim de um = começo do outro não cruza) */
export function seCruzam(a: { ini: number; dur: number }, b: { ini: number; dur: number }): boolean {
  return a.ini < b.ini + b.dur && b.ini < a.ini + a.dur;
}

function utc(iso: string): Date {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}
function isoDe(d: Date): string {
  return d.toISOString().slice(0, 10);
}
export function maisDias(iso: string, n: number): string {
  const d = utc(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return isoDe(d);
}

/** Os 7 dias da semana da data, de domingo a sábado. */
export function diasDaSemana(iso: string): string[] {
  const dom = maisDias(iso, -utc(iso).getUTCDay());
  return Array.from({ length: 7 }, (_, i) => maisDias(dom, i));
}

/** O mês em semanas (domingo a sábado), com os dias de fora nas pontas para fechar a grade. */
export function gradeDoMes(iso: string): string[][] {
  const [a, m] = iso.split("-").map(Number);
  const primeiro = `${a}-${String(m).padStart(2, "0")}-01`;
  const ultimo = isoDe(new Date(Date.UTC(a, m, 0)));
  const semanas: string[][] = [];
  for (let d = maisDias(primeiro, -utc(primeiro).getUTCDay()); d <= ultimo; d = maisDias(d, 7)) {
    semanas.push(Array.from({ length: 7 }, (_, i) => maisDias(d, i)));
  }
  return semanas;
}

/** O intervalo que a visão mostra (para buscar no banco). */
export function intervaloDaVista(vista: "dia" | "semana" | "mes", iso: string): { de: string; ate: string } {
  if (vista === "dia") return { de: iso, ate: iso };
  if (vista === "semana") {
    const s = diasDaSemana(iso);
    return { de: s[0], ate: s[6] };
  }
  const g = gradeDoMes(iso);
  return { de: g[0][0], ate: g[g.length - 1][6] };
}

/** A data do lado (setas): um dia, uma semana ou um mês. */
export function dataVizinha(vista: "dia" | "semana" | "mes", iso: string, passo: 1 | -1): string {
  if (vista === "dia") return maisDias(iso, passo);
  if (vista === "semana") return maisDias(iso, 7 * passo);
  const [a, m] = iso.split("-").map(Number);
  return isoDe(new Date(Date.UTC(a, m - 1 + passo, 1)));
}

/**
 * Horários que se cruzam ficam lado a lado (faixas), como no app: cada um
 * ganha a coluna dele e o total de colunas do grupo em que está.
 */
export function faixas<T extends { ini: number; dur: number }>(itens: readonly T[]): (T & { faixa: number; faixas: number })[] {
  const ordenados = [...itens].sort((x, y) => x.ini - y.ini || y.dur - x.dur);
  const saida: (T & { faixa: number; faixas: number })[] = [];
  let grupo: (T & { faixa: number; faixas: number })[] = [];
  let fimDoGrupo = -1;
  const fechar = () => {
    const n = Math.max(1, ...grupo.map((g) => g.faixa + 1));
    for (const g of grupo) g.faixas = n;
    saida.push(...grupo);
    grupo = [];
  };
  for (const it of ordenados) {
    if (grupo.length && it.ini >= fimDoGrupo) fechar();
    const ocupadas = new Set(grupo.filter((g) => g.ini + g.dur > it.ini).map((g) => g.faixa));
    let faixa = 0;
    while (ocupadas.has(faixa)) faixa++;
    grupo.push({ ...it, faixa, faixas: 1 });
    fimDoGrupo = Math.max(fimDoGrupo, it.ini + it.dur);
  }
  if (grupo.length) fechar();
  return saida;
}
