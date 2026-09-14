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
