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
 * Contato. ⚠️ CONFIRMAR COM A VIVA antes de publicar.
 * Vem das envs justamente para não haver número chutado no código.
 */
export const CONTATO = {
  /** dígitos com DDI+DDD, ex.: "5511999999999" */
  whatsapp: process.env.NEXT_PUBLIC_VIVA_WHATSAPP ?? "",
  telefone: process.env.NEXT_PUBLIC_VIVA_TELEFONE ?? "",
  email: process.env.NEXT_PUBLIC_VIVA_EMAIL ?? "",
  instagram: process.env.NEXT_PUBLIC_VIVA_INSTAGRAM ?? "",
} as const;

export const MARCA = {
  nome: "VIVA Extintores",
  assinatura: "Projetos e Segurança Contra Incêndio",
  frase: "VIVA Extintores. Protegendo pessoas, patrimônios e o seu futuro.",
  posicionamento: "Engenharia, prevenção e combate a incêndio",
} as const;

/** CTA principal do site, como no layout aprovado. */
export const CTA_PRINCIPAL = "Solicite um orçamento";
