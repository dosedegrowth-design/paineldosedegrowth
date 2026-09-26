/**
 * Link do WhatsApp — mecanismo padrão (wa.me) com a mensagem já preenchida.
 * Funciona no app (celular) e no WhatsApp Web (desktop).
 */

export type WhatsappVars = { nome: string; valor: string };

export function renderMessage(template: string, vars: WhatsappVars): string {
  return template.replace(/\{(nome|valor)\}/g, (_, key: keyof WhatsappVars) => vars[key]);
}

export function buildWhatsappUrl(number: string, template: string, vars: WhatsappVars): string {
  const digits = number.replace(/\D/g, "");
  const text = renderMessage(template, vars);
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
