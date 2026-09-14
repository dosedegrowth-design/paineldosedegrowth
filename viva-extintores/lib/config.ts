/**
 * VIVA Extintores — configuração central do portfólio.
 *
 * Nada aqui é inventado: o que ainda não foi confirmado pela VIVA fica
 * vazio e o componente se vira sem mentir (ver README, "Pendências").
 */

export const ROUTES = {
  home: "/",
  combate: "/combate-a-incendio",
  alarme: "/alarme-e-deteccao",
  spda: "/spda-para-raios",
  laudos: "/laudos-clcb-avcb",
  relatorio: "/relatorio-tecno-fotografico",
  contato: "/#contato",
  casos: "#casos-reais",
} as const;

/** Origem pública canônica (links absolutos, sitemap, OpenGraph). */
export const PUBLIC_ORIGIN =
  process.env.NEXT_PUBLIC_VIVA_ORIGIN ?? "https://portfolio.vivaextintores.com.br";

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
  /** §5 do briefing — abertura aprovada */
  posicionamento: "Engenharia, prevenção e combate a incêndio",
} as const;

/** CTA principal do projeto (§23). Um só texto, o site inteiro repete. */
export const CTA_PRINCIPAL = "Solicite uma análise técnica";
