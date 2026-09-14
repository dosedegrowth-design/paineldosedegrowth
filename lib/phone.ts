/**
 * Telefones brasileiros: normalização para dígitos E.164 (55 + DDD + número).
 * Puro, usado em validação e em UI.
 */

export function normalizeBrPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (!digits) return null;
  // remove zero de operadora / prefixo internacional "00"
  digits = digits.replace(/^0+/, "");
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return null;
}

export function formatBrPhone(digits: string | null | undefined): string {
  if (!digits) return "";
  const d = digits.replace(/\D/g, "");
  const local = d.startsWith("55") ? d.slice(2) : d;
  const ddd = local.slice(0, 2);
  const rest = local.slice(2);
  if (rest.length === 9) return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  if (rest.length === 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return d;
}

/** Máscara para exibir a outra pessoa sem expor o número inteiro. */
export function maskPhone(digits: string | null | undefined): string {
  if (!digits) return "";
  const f = formatBrPhone(digits);
  return f.replace(/\d(?=\d{4}$)/g, "•").replace(/^\((\d{2})\) [\d•]+/, (m) => m);
}
