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
  return new Date(v);
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

export function dateTime(v: string | Date | null | undefined): string {
  if (!v) return "";
  const d = toDate(v);
  return `${dateShort(d)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
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

const WEEKDAYS = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

const WEEKDAYS_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** "sexta-feira" */
export function weekdayLong(v: string | Date): string {
  return WEEKDAYS[toDate(v).getDay()];
}

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
