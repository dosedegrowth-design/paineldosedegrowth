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

export function whatsappUrl(phoneDigits: string, message?: string): string {
  const digits = phoneDigits.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
