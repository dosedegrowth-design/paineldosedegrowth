import { CONTATO, ROUTES } from "@/lib/config";

/**
 * Link de conversão. Sem número confirmado, o botão não vira link morto
 * nem inventa contato: desce para a seção de contato (§23 do briefing —
 * a página sempre precisa ter caminho de conversão).
 */
export function whatsappUrl(mensagem: string): string {
  if (!CONTATO.whatsapp) return ROUTES.contato;
  return `https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

/** true quando o link sai do site (muda target/rel no componente). */
export function isExterno(href: string): boolean {
  return href.startsWith("http");
}

export const MENSAGENS = {
  geral:
    "Olá! Vi o portfólio da VIVA e quero solicitar uma análise técnica.",
  area: (area: string) =>
    `Olá! Vi o portfólio da VIVA e quero falar sobre ${area}.`,
  inspecao:
    "Olá! Quero solicitar uma inspeção técnica e o Relatório Tecno-Fotográfico do meu prédio.",
} as const;
