import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==================== FORMATTERS ====================

export function formatCurrency(value: number, currency: string = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "agora mesmo";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `há ${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `há ${diffDay}d`;
  return formatDate(d);
}

// ==================== METRICS UTILS ====================

export function calculateDelta(current: number, previous: number): {
  value: number;
  percent: number;
  direction: "up" | "down" | "neutral";
} {
  if (previous === 0) {
    return {
      value: current,
      percent: current === 0 ? 0 : 100,
      direction: current > 0 ? "up" : "neutral",
    };
  }
  const delta = current - previous;
  const percent = (delta / previous) * 100;
  return {
    value: delta,
    percent,
    direction: percent > 0.1 ? "up" : percent < -0.1 ? "down" : "neutral",
  };
}

/**
 * Decide se a mudança é "boa" baseado na natureza da métrica.
 * Para CPA/CPC: queda é boa. Para ROAS/conversões: alta é boa.
 */
export function isPositiveChange(
  metricKey: string,
  direction: "up" | "down" | "neutral"
): boolean {
  const lowerIsBetter = ["cpa", "cpc", "cpm", "custo", "investimento_por_conversao"];
  const lower = lowerIsBetter.some((k) => metricKey.toLowerCase().includes(k));
  if (direction === "neutral") return true;
  return lower ? direction === "down" : direction === "up";
}
