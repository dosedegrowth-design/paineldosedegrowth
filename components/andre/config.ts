export const ANDRE_CONFIG = {
  brand: "André Ar Condicionado",
  tagline: "Instalação, manutenção e higienização com garantia real.",
  phone: "(11) 94000-0000",
  phoneRaw: "5511940000000",
  whatsappMessage:
    "Olá, André! Vim pelo site e quero um orçamento rápido de ar condicionado.",
  emergencyText: "Atendimento em até 24h · Orçamento sem compromisso",
  city: "São Paulo e Grande SP",
  yearsExperience: 12,
  clientsServed: "3.500+",
  rating: 4.9,
};

export function waLink(msg?: string) {
  const m = msg ?? ANDRE_CONFIG.whatsappMessage;
  return `https://wa.me/${ANDRE_CONFIG.phoneRaw}?text=${encodeURIComponent(m)}`;
}

export function telLink() {
  return `tel:+${ANDRE_CONFIG.phoneRaw}`;
}
