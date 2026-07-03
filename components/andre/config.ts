export const ANDRE_CONFIG = {
  brand: "Climafrio",
  tagline: "Instalação, manutenção e higienização com garantia real.",
  phone: "(11) 2095-7000",
  phoneRaw: "551120957000",
  phone0800: "0800 015 1011",
  email: "vendas@climafrio.com.br",
  address: "Rua Padre Adelino, 2074 — São Paulo/SP",
  whatsappMessage:
    "Olá! Vi o site da Climafrio e quero falar sobre ar condicionado.",
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
