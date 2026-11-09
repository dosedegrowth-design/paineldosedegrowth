/**
 * Onde o site da Tayssa mora (09/11/2026: passou para o domínio dela).
 *
 * No domínio dela (tayssafarias.com.br) e no antigo subdomínio `tayssa.*` o
 * site fica na raiz: o middleware reescreve `/x` para `app/tayssa/x`. No
 * domínio do painel ele mora em `/tayssa`.
 *
 * Sem dependências: o middleware (que roda na borda) também usa.
 */
export const DOMINIO_DA_TAYSSA = "tayssafarias.com.br";

/** O endereço (host, com ou sem porta e www) é de um domínio da Tayssa? */
export function ehHostDaTayssa(host: string): boolean {
  const h = host.trim().toLowerCase().replace(/:\d+$/, "").replace(/^www\./, "");
  return h === DOMINIO_DA_TAYSSA || h.startsWith("tayssa.");
}

/** A origem (https://...) é de um domínio da Tayssa? Origem inválida: não. */
export function origemDaTayssa(origem: string): boolean {
  try {
    return ehHostDaTayssa(new URL(origem).host);
  } catch {
    return false;
  }
}

/** `/tayssa/x` vira `/x` e `/tayssa` vira `/` (mantém busca e âncora). */
export function semPrefixo(caminho: string): string {
  const p = caminho.replace(/^\/tayssa(?=[/?#]|$)/, "");
  return !p || p[0] === "?" || p[0] === "#" ? `/${p}` : p;
}
