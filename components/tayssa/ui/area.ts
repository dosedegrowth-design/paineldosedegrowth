/**
 * VIP e painel: telas de uso, sem as peças do site (rolagem suave, vigia de
 * animações fora da tela). Vale com e sem o prefixo /tayssa — no
 * subdomínio tayssa.* a URL é limpa (/vip, /admin).
 */
export function ehAreaPrivada(pathname: string | null): boolean {
  return pathname ? /^(\/tayssa)?\/(vip|admin)(\/|$)/.test(pathname) : false;
}
