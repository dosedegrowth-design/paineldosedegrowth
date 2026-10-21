/**
 * Telefones brasileiros: normalização para dígitos E.164 (55 + DDD + número).
 * Puro, usado em validação e em UI.
 */

export function normalizeBrPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (!digits) return null;
  // remove zero de operadora / prefixo internacional "00"
  digits = digits.replace(/^0+/, "");
  let nacional: string;
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) nacional = digits.slice(2);
  else if (digits.length === 10 || digits.length === 11) nacional = digits;
  else return null;
  // celular escrito sem o 9 (8 dígitos começando em 6–9) é a mesma linha com
  // o 9: sem isso o mesmo número contava como pessoa nova nas indicações
  if (nacional.length === 10 && /[6-9]/.test(nacional[2])) nacional = `${nacional.slice(0, 2)}9${nacional.slice(2)}`;
  return `55${nacional}`;
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
