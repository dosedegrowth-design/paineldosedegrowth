/**
 * VIVA Extintores — configuração central.
 *
 * É um site, não uma landing: institucional + serviços + clientes +
 * contato, e o portfólio como a parte mais pesada de conteúdo (a
 * página-mãe e as cinco áreas).
 *
 * Nada aqui é inventado: o que ainda não foi confirmado pela VIVA fica
 * vazio e o componente se vira sem mentir (ver README, "Pendências").
 */

export const ROUTES = {
  home: "/",
  sobre: "/sobre",
  servicos: "/servicos",
  clientes: "/clientes",
  contato: "/contato",

  /** página-mãe do portfólio — o índice das cinco áreas */
  portfolio: "/portfolio",
  combate: "/portfolio/combate-a-incendio",
  alarme: "/portfolio/alarme-e-deteccao",
  spda: "/portfolio/spda-para-raios",
  laudos: "/portfolio/laudos-clcb-avcb",
  relatorio: "/portfolio/relatorio-tecno-fotografico",

  /** âncora do fim de cada página de área */
  casos: "#casos-reais",
} as const;

/**
 * Para onde aponta a chamada "Veja alguns dos nossos casos reais".
 *
 * A galeria de casos é da agência e já existe — não se reconstrói aqui.
 * Enquanto o endereço dela não for ligado, a chamada NÃO aparece: título
 * e seta apontando para o nada é faixa vazia no fim de toda página de
 * área, e página que vai ao cliente com faixa vazia lê como obra
 * inacabada. Mesma regra dos posts do Instagram.
 *
 * Enquanto a galeria não migra, o destino é a que está no ar hoje, no site
 * atual — é a "janela" que o Felipe disse que o marketing já tem.
 */
export const CASOS_REAIS_URL =
  process.env.NEXT_PUBLIC_VIVA_CASOS ?? "https://www.vivaextintores.com.br/portfolio";

/** O menu, na ordem do layout aprovado. */
export const MENU = [
  { rotulo: "Início", href: ROUTES.home },
  { rotulo: "Sobre nós", href: ROUTES.sobre },
  { rotulo: "Serviços", href: ROUTES.servicos },
  { rotulo: "Portfólio", href: ROUTES.portfolio },
  { rotulo: "Clientes", href: ROUTES.clientes },
  { rotulo: "Contato", href: ROUTES.contato },
] as const;

/** Origem pública canônica (links absolutos, sitemap, OpenGraph). */
export const PUBLIC_ORIGIN =
  process.env.NEXT_PUBLIC_VIVA_ORIGIN ?? "https://www.vivaextintores.com.br";

export function publicUrl(path: string): string {
  return `${PUBLIC_ORIGIN.replace(/\/$/, "")}${path}`;
}

/**
 * Contato. Os padrões são os dados que a VIVA já publica no site atual
 * (vivaextintores.com.br): WhatsApp/telefone, e-mail e Instagram. Nada foi
 * chutado — foi lido de lá. As envs continuam mandando, se existirem.
 */
export const CONTATO = {
  /** dígitos com DDI+DDD */
  whatsapp: process.env.NEXT_PUBLIC_VIVA_WHATSAPP ?? "5511942925865",
  telefone: process.env.NEXT_PUBLIC_VIVA_TELEFONE ?? "(11) 94292-5865",
  email: process.env.NEXT_PUBLIC_VIVA_EMAIL ?? "contato@vivaextintores.com.br",
  instagram: process.env.NEXT_PUBLIC_VIVA_INSTAGRAM ?? "viva_extintores",
} as const;

export const MARCA = {
  nome: "VIVA Extintores",
  assinatura: "Engenharia • Prevenção • Combate a Incêndio",
  frase: "VIVA Extintores. Protegendo pessoas, patrimônios e o seu futuro.",
  posicionamento: "Engenharia, prevenção e combate a incêndio",
} as const;

/** CTA principal do site, como no layout aprovado. */
export const CTA_PRINCIPAL = "Solicite um orçamento";
