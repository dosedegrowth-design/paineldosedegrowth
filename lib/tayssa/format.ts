/** Formatação pt-BR (puro, usável no client). */

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function toDate(v: string | Date): Date {
  if (v instanceof Date) return v;
  // "YYYY-MM-DD" -> data civil local (evita virar o dia por fuso)
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [y, m, d] = v.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  // instante (timestamp): o dia no relógio da casa — no servidor (UTC) um
  // registro das 22h já cairia no dia seguinte, e servidor e navegador
  // escreveriam datas diferentes na mesma tela
  return nowInBusinessTz(new Date(v));
}

/** "4 de setembro" */
export function dateLong(v: string | Date | null | undefined, withYear = false): string {
  if (!v) return "";
  const d = toDate(v);
  const base = `${d.getDate()} de ${MONTHS[d.getMonth()]}`;
  return withYear ? `${base} de ${d.getFullYear()}` : base;
}

/** "04/09/2026" */
export function dateShort(v: string | Date | null | undefined): string {
  if (!v) return "";
  const d = toDate(v);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

/** "04/09" */
export function dayMonth(v: string | Date | null | undefined): string {
  if (!v) return "";
  const d = toDate(v);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** "04/09/2026 21:12" — instantes (timestamps) sempre no relógio da casa:
 *  o servidor roda em UTC e mostraria a hora de Londres. */
export function dateTime(v: string | Date | null | undefined): string {
  if (!v) return "";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return `${dateShort(v)} 00:00`;
  const d = v instanceof Date ? v : new Date(v);
  const p = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${g("day")}/${g("month")}/${g("year")} ${g("hour")}:${g("minute")}`;
}

export function currency(v: number | null | undefined): string {
  if (v === null || v === undefined) return "";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export function monthName(month: number): string {
  return MONTHS[month] ?? "";
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

/**
 * Fuso da casa. O servidor roda em UTC; sem isso, à noite o Brasil já
 * estaria "amanhã" para o sistema e a cliente leria a data errada.
 */
export const BUSINESS_TZ = "America/Sao_Paulo";

/** Agora, com os campos (dia, hora) no relógio de parede da casa. */
export function nowInBusinessTz(base: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(base);
  const v = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return new Date(v("year"), v("month") - 1, v("day"), v("hour") % 24, v("minute"), v("second"));
}

const WEEKDAYS_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** "sex" */
export function weekdayShort(v: string | Date): string {
  return WEEKDAYS_SHORT[toDate(v).getDay()];
}

/** "09:00" a partir de "09:00:00" */
export function hhmm(time: string): string {
  return time.slice(0, 5);
}

/** "hoje", "amanhã" ou "sexta, 19 de setembro" */
export function dayLabel(v: string | Date, today = nowInBusinessTz()): string {
  const d = toDate(v);
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - base.getTime()) / 86400000);
  if (diff === 0) return "hoje";
  if (diff === 1) return "amanhã";
  return `${weekdayShort(d)}, ${dateLong(d)}`;
}

/** Aconteceu nas últimas N horas? (null = não aconteceu) */
export function isWithinHours(iso: string | null | undefined, hours: number): boolean {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < hours * 3600 * 1000;
}

/**
 * `cycle_key` é chave interna (`loyalty:loyalty_100`, `birthday:2026`).
 * Na tela vira o ciclo que a Tayssa reconhece — ou nada, quando a chave
 * não acrescenta à linha. Nunca o texto de máquina.
 */
export function cicloLegivel(cycleKey: string): string | null {
  const corte = cycleKey.indexOf(":");
  const tipo = corte < 0 ? cycleKey : cycleKey.slice(0, corte);
  const resto = corte < 0 ? "" : cycleKey.slice(corte + 1);
  const n = Number(resto);
  if (tipo === "birthday" && /^\d{4}$/.test(resto)) return `aniversário de ${resto}`;
  if (tipo === "referral" && Number.isInteger(n) && n > 0) return `${n}ª rodada de indicações`;
  if (tipo === "card" && Number.isInteger(n) && n > 0) return `${n}º cartão`;
  if (tipo === "manual") return "concedido por você";
  // loyalty: a chave deriva do benefício, e o nome dele já distingue a linha
  return null;
}
