/**
 * VIP e painel: telas de uso, sem as peças do site (rolagem suave, vigia de
 * animações fora da tela). Vale com e sem o prefixo /tayssa — no
 * subdomínio tayssa.* a URL é limpa (/vip, /admin).
 */
export function ehAreaPrivada(pathname: string | null): boolean {
  // meus-horarios e minha-conta: os endereços da conta sem "vip" (apelidos de /vip/agendar e /vip/perfil)
  return pathname ? /^(\/tayssa)?\/(vip|admin|meus-horarios|minha-conta)(\/|$)/.test(pathname) : false;
}
