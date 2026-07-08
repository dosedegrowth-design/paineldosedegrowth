export const ANDRE_CONFIG = {
  brand: "Climafrio",
  tagline: "Soluções em climatização desde 1985.",
  phone: "(11) 2095-7000",
  phoneRaw: "551120957000",
  phone0800: "0800 015 1011",
  email: "vendas@climafrio.com.br",
  address: "Rua Padre Adelino, 2074 — Quarta Parada, São Paulo/SP",
  cep: "03303-000",
  cnpj: "45.291.272/0001-26",
  lojaUrl: "https://loja.climafrio.com.br/",
  foundedYear: 1985,
  whatsappMessage:
    "Olá! Visitei o site da Climafrio e gostaria de falar com um especialista.",
  emergencyText: "Atendimento em até 24h · Orçamento sem compromisso",
  city: "São Paulo e Grande SP",
  yearsExperience: 40,
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
