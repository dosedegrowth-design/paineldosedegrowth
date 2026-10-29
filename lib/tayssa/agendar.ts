/**
 * Agendar pelo site: a cliente escolhe serviço, técnica, dia e horário numa
 * folha, e o pedido segue pronto para o WhatsApp da Tayssa — com o pedido
 * do Pix do sinal. Nada é gravado no banco: quem fecha a agenda é ela, na
 * conversa. Puro (sem banco, sem React) para ser testado e usado no client.
 */

import { horariosDoDia } from "./rules.ts";

export type DiaAgenda = {
  iso: string;
  /** `ate`: minutos livres depois do início (null = o resto do dia) */
  slots: { time: string; available: boolean; ate?: number | null }[];
};

export type PedidoAgenda = {
  /** nome do serviço, como no catálogo ("Manutenção de cílios") */
  servico: string;
  /** de qual volume é a manutenção ("Volume brasileiro"), quando ela escolheu */
  tecnica?: string | null;
  /** "AAAA-MM-DD" */
  dia: string;
  /** "HH:MM" */
  hora: string;
  nome: string;
  /** valor do serviço/produto, quando a Tayssa cadastrou */
  valor?: number | null;
  /** valor do sinal, em reais */
  sinal: number;
};

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "AAAA-MM-DD" como data civil (sem virar o dia por fuso) */
function civil(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, (m ?? 1) - 1, d ?? 1);
}

/** "14:00" → "14h"; "10:30" → "10h30" */
export function horaLegivel(hhmm: string): string {
  const [h, m] = hhmm.slice(0, 5).split(":");
  return m && m !== "00" ? `${Number(h)}h${m}` : `${Number(h)}h`;
}

/** "sexta, 24/10" */
export function diaLegivel(iso: string): string {
  const d = civil(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${DIAS[d.getDay()]}, ${dd}/${mm}`;
}

/** Peças do cartão de dia: { semana: "sex", numero: "24", mes: "out" } */
export function partesDoDia(iso: string) {
  const d = civil(iso);
  return { semana: DIAS_CURTOS[d.getDay()], numero: String(d.getDate()), mes: MESES_CURTOS[d.getMonth()] };
}

/** "R$ 50", "R$ 1.200", "R$ 37,50" (sem centavos quando é redondo) */
export function reais(v: number): string {
  const [int, dec] = v.toFixed(2).split(".");
  const milhar = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return dec === "00" ? `R$ ${milhar}` : `R$ ${milhar},${dec}`;
}

/**
 * O serviço de `duracaoMin` minutos cabe a partir deste horário? Livre no
 * início e com tempo até o próximo horário ocupado: o volume de 3h não
 * cabe às 10h se às 11h já tem alguém.
 */
export function cabeNoHorario(
  slot: { available: boolean; ate?: number | null },
  duracaoMin?: number | null,
): boolean {
  if (!slot.available) return false;
  if (slot.ate == null || !duracaoMin || duracaoMin <= 0) return true;
  return slot.ate >= duracaoMin;
}

/** Só os dias com pelo menos um horário em que o serviço cabe. */
export function diasAbertos(dias: DiaAgenda[], duracaoMin?: number | null): DiaAgenda[] {
  return dias.filter((d) => d.slots.some((s) => cabeNoHorario(s, duracaoMin)));
}

/** 180 → "3h"; 90 → "1h30"; 40 → "40 min" */
export function duracaoLegivel(min: number | null | undefined): string | null {
  if (!min || min <= 0) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

/**
 * "R$ 120", ou "a partir de R$ 120" quando há variação mais cara (a
 * manutenção do Fox eyes custa mais que a dos outros volumes).
 */
export function valorLegivel(preco: number | null | undefined, variacoes: (number | null | undefined)[] = []): string | null {
  if (preco == null) return null;
  const aPartir = variacoes.some((v) => v != null && v > preco);
  return `${aPartir ? "a partir de " : ""}${reais(preco)}`;
}

/** Manutenção de cílios: pergunta de qual volume é (e o valor vem dele). */
export function ehManutencao(slug: string, nome = ""): boolean {
  return /manuten/i.test(`${slug} ${nome}`);
}

const NOMES_DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

/**
 * Os horários da semana como a cliente lê: dias seguidos com o mesmo
 * começo e fim viram um grupo. { dias: "Terça a sexta", horas: "9h às 19h" }
 */
export function horariosDaSemana(booking: {
  weekdays: number[];
  slots: string[];
  slots_por_dia?: Record<string, string[]> | null;
}): { dias: string; horas: string }[] {
  // segunda primeiro, domingo no fim
  const ordem = [1, 2, 3, 4, 5, 6, 0].filter((d) => booking.weekdays.includes(d));
  const grupos: { dias: number[]; horas: string }[] = [];
  for (const d of ordem) {
    const grade = [...horariosDoDia(booking, d)].sort();
    if (!grade.length) continue;
    const inicio = horaLegivel(grade[0]);
    const fim = horaLegivel(grade[grade.length - 1]);
    const horas = inicio === fim ? inicio : `${inicio} às ${fim}`;
    const ultimo = grupos[grupos.length - 1];
    const anterior = ultimo?.dias[ultimo.dias.length - 1];
    if (ultimo && anterior !== undefined && (anterior + 1) % 7 === d && ultimo.horas === horas) ultimo.dias.push(d);
    else grupos.push({ dias: [d], horas });
  }
  return grupos.map((g) => {
    const primeiro = NOMES_DIAS[g.dias[0]];
    const ultimo = NOMES_DIAS[g.dias[g.dias.length - 1]].toLowerCase();
    const dias = g.dias.length === 1 ? primeiro : g.dias.length === 2 ? `${primeiro} e ${ultimo}` : `${primeiro} a ${ultimo}`;
    return { dias, horas: g.horas };
  });
}

/** A mensagem que chega no WhatsApp dela. */
export function mensagemAgendamento(p: PedidoAgenda): string {
  const servico = p.tecnica ? `${p.servico} (${p.tecnica})` : p.servico;
  const nome = p.nome.trim();
  return [
    "Oi, Tayssa! Quero agendar pelo site.",
    "",
    `Serviço: ${servico}`,
    `Dia: ${diaLegivel(p.dia)}`,
    `Horário: ${horaLegivel(p.hora)}`,
    ...(p.valor != null ? [`Valor: ${reais(p.valor)}`] : []),
    ...(nome ? [`Nome: ${nome}`] : []),
    "",
    `Pode me mandar a chave Pix do sinal de ${reais(p.sinal)} para eu garantir o horário?`,
  ].join("\n");
}
