/**
 * Busca do painel: sem acento, sem caixa e, no telefone, só os dígitos.
 * "cartao" acha "Cartão"; "(11) 90000-0002" acha quem tem 11900000002.
 */
export function semAcento(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** O texto digitado bate com algum dos campos? (palavra ou telefone) */
export function bateBusca(consulta: string, campos: (string | null | undefined)[]): boolean {
  const q = semAcento(consulta.trim());
  if (!q) return true;
  const alvo = semAcento(campos.filter(Boolean).join(" "));
  if (alvo.includes(q)) return true;
  // telefone digitado com máscara, espaço ou +55: compara só os dígitos
  const digitos = q.replace(/\D/g, "");
  if (digitos.length >= 4 && /^[\d\s()+\-.]+$/.test(q)) {
    return campos.some((c) => (c ?? "").replace(/\D/g, "").includes(digitos));
  }
  return false;
}
