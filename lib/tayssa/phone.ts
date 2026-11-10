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

/**
 * A máscara do campo de WhatsApp enquanto a cliente digita (10/11/2026):
 * "(11) 9876-5432" com 10 dígitos e "(11) 98765-4321" com 11. Colou com o
 * +55 na frente? O 55 sai. Nunca passa de 11 dígitos. Apagar não trava: o
 * que sobra de pontuação some junto com o dígito.
 */
export function mascaraTelefone(texto: string): string {
  let d = texto.replace(/\D/g, "");
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  d = d.slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  if (resto.length <= 4) return `(${ddd}) ${resto}`;
  if (d.length <= 10) return `(${ddd}) ${resto.slice(0, 4)}-${resto.slice(4)}`;
  return `(${ddd}) ${resto.slice(0, 5)}-${resto.slice(5)}`;
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

/**
 * O que a cliente digitou no campo de entrar: com "@" é e-mail (como está
 * gravado, em minúsculas); sem, é o WhatsApp com DDD. O resto não é login.
 */
export function chaveDoLogin(bruto: string): { tipo: "email" | "whatsapp"; valor: string } | null {
  const v = bruto.trim();
  if (!v) return null;
  if (v.includes("@")) {
    const email = v.toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? { tipo: "email", valor: email } : null;
  }
  const whatsapp = normalizeBrPhone(v);
  return whatsapp ? { tipo: "whatsapp", valor: whatsapp } : null;
}
