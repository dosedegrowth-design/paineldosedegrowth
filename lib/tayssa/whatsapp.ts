/**
 * WhatsApp contextual — cada CTA gera uma mensagem própria.
 * Puro (sem server-only) para poder ser usado em client components.
 */

export function renderTemplate(
  template: string,
  vars: Record<string, string | number | null | undefined>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = vars[key];
    return v === null || v === undefined ? "" : String(v);
  });
}

/**
 * Com o VIP fechado a conta da cliente é só a agenda (Lucas, 05/11/2026:
 * "essa é só a área de agendamento"): nenhuma mensagem pronta fala em VIP.
 * Estas entram no lugar das do programa (`settings.whatsapp`) enquanto
 * `settings.rules.vip_aberto` estiver desligado.
 */
export const MENSAGENS_DA_AGENDA = {
  falar: "Oi, Tayssa, tudo bem?",
  falarComNome: "Oi, Tayssa, tudo bem? Aqui é {name}.",
  linkVencido: "Oi, Tayssa, tudo bem? Meu link de acesso não abre mais. Pode me mandar outro?",
} as const;

/**
 * A Tayssa incluiu no VIP uma cliente que se cadastrou pela agenda (Lucas,
 * 05/11/2026): ela entra com o mesmo WhatsApp e a mesma senha de agendar e
 * passa a ver a área VIP. O botão "Avisar no WhatsApp" da ficha manda isto.
 */
export const MENSAGEM_VIP_INCLUIDA =
  "Oi, {name}! Aqui é a Tayssa. Agora você é VIP: tem prioridade na minha agenda e acesso à área VIP, com cartão de visitas, pontos e presentes. É só entrar com o mesmo WhatsApp e a mesma senha que você usa para agendar: {url}";

export function whatsappUrl(phoneDigits: string, message?: string): string {
  const digits = phoneDigits.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
