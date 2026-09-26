/**
 * Estimativa — sorteada localmente, em reais inteiros, dentro da faixa
 * configurada. Nada aqui consulta dado real: é demonstração.
 */

export type EstimateRange = { minBRL: number; maxBRL: number };

/** Inteiro uniforme em [min, max]. */
export function randomIntInclusive(min: number, max: number, random: () => number = Math.random): number {
  const lo = Math.ceil(Math.min(min, max));
  const hi = Math.floor(Math.max(min, max));
  return lo + Math.floor(random() * (hi - lo + 1));
}

/** Valor da simulação em centavos (sempre múltiplo de 100: "R$ 1.087,00"). */
export function generateEstimateCents(range: EstimateRange, random?: () => number): number {
  return randomIntInclusive(range.minBRL, range.maxBRL, random) * 100;
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 108700 → "R$ 1.087,00" (o espaço após "R$" é não separável). */
export function formatBRL(cents: number): string {
  return brl.format(Math.round(cents) / 100);
}

const brlWhole = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** 870 → "R$ 870" — para os rótulos da faixa. */
export function formatBRLWhole(reais: number): string {
  return brlWhole.format(reais);
}

/** Posição (0–1) do valor dentro da faixa, para o indicador visual. */
export function positionInRange(cents: number, range: EstimateRange): number {
  const min = range.minBRL * 100;
  const max = range.maxBRL * 100;
  if (max <= min) return 1;
  return Math.min(1, Math.max(0, (cents - min) / (max - min)));
}
