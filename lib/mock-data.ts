/**
 * Mock data realista para Petderma (cliente piloto).
 * Será substituído pela sync real do Google/Meta na Fase 1.
 */

export type Plataforma = "google" | "meta";
export type StatusCampanha = "active" | "paused" | "removed";

export interface Cliente {
  id: string;
  nome: string;
  slug: string;
  cor_primaria: string;
  logo_url: string;
  cac_maximo: number;
  ticket_medio: number;
  ativo: boolean;
}

export interface Campanha {
  id: string;
  cliente_id: string;
  plataforma: Plataforma;
  campanha_id: string;
  campanha_nome: string;
  objetivo: string;
  status: StatusCampanha;
  investimento: number;
  impressoes: number;
  cliques: number;
  ctr: number;
  cpc: number;
  conversoes: number;
  cpa: number;
  receita: number;
  roas: number;
}

export interface SeriePonto {
  data: string;
  investimento: number;
  conversoes: number;
  receita: number;
  roas: number;
  cpa: number;
  cliques: number;
  impressoes: number;
}

export interface AdCriativo {
  id: string;
  campanha: string;
  plataforma: Plataforma;
  thumbnail: string;
  headline: string;
  investimento: number;
  conversoes: number;
  ctr: number;
  cpa: number;
  roas: number;
}

export interface Anomalia {
  id: string;
  tipo: string;
  severidade: "baixa" | "media" | "alta" | "critica";
  metrica: string;
  valor_atual: number;
  baseline: number;
  desvio_percentual: number;
  descricao: string;
  narrativa_ia: string;
  detectada_em: string;
  resolvida: boolean;
  campanha?: string;
}

export interface Mudanca {
  id: string;
  feita_em: string;
  feita_por: string;
  entidade_tipo: string;
  entidade_nome: string;
  campo: string;
  valor_antes: string;
  valor_depois: string;
  veredicto: "positiva" | "negativa" | "neutra" | "aguardando";
  narrativa_ia: string;
  impacto_dias: number;
}

// ==================== CLIENTES ====================

export const CLIENTES: Cliente[] = [
  {
    id: "petderma",
    nome: "Petderma",
    slug: "petderma",
    cor_primaria: "#F15839",
    logo_url: "/brand/logo-icon.svg",
    cac_maximo: 80,
    ticket_medio: 250,
    ativo: true,
  },
];

// ==================== HELPER ====================

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max));
}

// ==================== CAMPANHAS PETDERMA ====================

export const CAMPANHAS: Campanha[] = [
  // Google Ads
  {
    id: "g1",
    cliente_id: "petderma",
    plataforma: "google",
    campanha_id: "21458732145",
    campanha_nome: "[Search] Petderma - Marca",
    objetivo: "Conversões",
    status: "active",
    investimento: 4280.5,
    impressoes: 89420,
    cliques: 3420,
    ctr: 3.83,
    cpc: 1.25,
    conversoes: 142,
    cpa: 30.14,
    receita: 35500,
    roas: 8.29,
  },
  {
    id: "g2",
    cliente_id: "petderma",
    plataforma: "google",
    campanha_id: "21458732146",
    campanha_nome: "[Search] Petderma - Genérico",
    objetivo: "Conversões",
    status: "active",
    investimento: 8920.3,
    impressoes: 245800,
    cliques: 7280,
    ctr: 2.96,
    cpc: 1.23,
    conversoes: 98,
    cpa: 91.02,
    receita: 24500,
    roas: 2.75,
  },
  {
    id: "g3",
    cliente_id: "petderma",
    plataforma: "google",
    campanha_id: "21458732147",
    campanha_nome: "[Pmax] Petderma - Catálogo",
    objetivo: "Vendas",
    status: "active",
    investimento: 12450.8,
    impressoes: 580200,
    cliques: 14820,
    ctr: 2.55,
    cpc: 0.84,
    conversoes: 285,
    cpa: 43.69,
    receita: 71250,
    roas: 5.72,
  },
  {
    id: "g4",
    cliente_id: "petderma",
    plataforma: "google",
    campanha_id: "21458732148",
    campanha_nome: "[Display] Remarketing 30d",
    objetivo: "Conversões",
    status: "paused",
    investimento: 1820.4,
    impressoes: 158400,
    cliques: 1240,
    ctr: 0.78,
    cpc: 1.47,
    conversoes: 18,
    cpa: 101.13,
    receita: 4500,
    roas: 2.47,
  },
  // Meta Ads
  {
    id: "m1",
    cliente_id: "petderma",
    plataforma: "meta",
    campanha_id: "23854712365",
    campanha_nome: "ABO - Conversões - Cães",
    objetivo: "Conversions",
    status: "active",
    investimento: 9820.5,
    impressoes: 1245800,
    cliques: 28450,
    ctr: 2.28,
    cpc: 0.35,
    conversoes: 245,
    cpa: 40.08,
    receita: 61250,
    roas: 6.24,
  },
  {
    id: "m2",
    cliente_id: "petderma",
    plataforma: "meta",
    campanha_id: "23854712366",
    campanha_nome: "CBO - Conversões - Gatos",
    objetivo: "Conversions",
    status: "active",
    investimento: 5430.2,
    impressoes: 685400,
    cliques: 14820,
    ctr: 2.16,
    cpc: 0.37,
    conversoes: 132,
    cpa: 41.14,
    receita: 33000,
    roas: 6.08,
  },
  {
    id: "m3",
    cliente_id: "petderma",
    plataforma: "meta",
    campanha_id: "23854712367",
    campanha_nome: "Advantage+ Shopping",
    objetivo: "Sales",
    status: "active",
    investimento: 14820.6,
    impressoes: 2145000,
    cliques: 48200,
    ctr: 2.25,
    cpc: 0.31,
    conversoes: 412,
    cpa: 35.97,
    receita: 103000,
    roas: 6.95,
  },
  {
    id: "m4",
    cliente_id: "petderma",
    plataforma: "meta",
    campanha_id: "23854712368",
    campanha_nome: "Lookalike 1% - Compradores 90d",
    objetivo: "Conversions",
    status: "active",
    investimento: 3240.8,
    impressoes: 425000,
    cliques: 8900,
    ctr: 2.09,
    cpc: 0.36,
    conversoes: 58,
    cpa: 55.88,
    receita: 14500,
    roas: 4.47,
  },
  {
    id: "m5",
    cliente_id: "petderma",
    plataforma: "meta",
    campanha_id: "23854712369",
    campanha_nome: "Retargeting - View Content 14d",
    objetivo: "Conversions",
    status: "active",
    investimento: 2180.4,
    impressoes: 320500,
    cliques: 9450,
    ctr: 2.95,
    cpc: 0.23,
    conversoes: 78,
    cpa: 27.95,
    receita: 19500,
    roas: 8.94,
  },
];

// ==================== SÉRIES TEMPORAIS (30 dias) ====================

export function gerarSerie30Dias(): SeriePonto[] {
  const hoje = new Date();
  const serie: SeriePonto[] = [];

  for (let i = 29; i >= 0; i--) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - i);

    const baseInvestimento = 2200 + Math.sin(i / 4) * 400 + rand(-200, 300);
    const baseConv = 50 + Math.sin(i / 5) * 12 + rand(-8, 10);
    const baseRoas = 5.5 + Math.cos(i / 6) * 1.2 + rand(-0.5, 0.5);

    const investimento = Math.max(800, baseInvestimento);
    const conversoes = Math.max(10, Math.round(baseConv));
    const roas = Math.max(1, baseRoas);
    const receita = investimento * roas;
    const cpa = investimento / conversoes;
    const cliques = Math.round(investimento / rand(0.5, 1.2));
    const impressoes = Math.round(cliques / rand(0.018, 0.035));

    serie.push({
      data: data.toISOString().split("T")[0],
      investimento: Number(investimento.toFixed(2)),
      conversoes,
      receita: Number(receita.toFixed(2)),
      roas: Number(roas.toFixed(2)),
      cpa: Number(cpa.toFixed(2)),
      cliques,
      impressoes,
    });
  }
  return serie;
}

// ==================== TOP ADS ====================

export const TOP_ADS: AdCriativo[] = [
  {
    id: "ad1",
    campanha: "Advantage+ Shopping",
    plataforma: "meta",
    thumbnail: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=120&h=120&fit=crop",
    headline: "Shampoo Hipoalergênico Petderma - Para peles sensíveis",
    investimento: 4820.5,
    conversoes: 142,
    ctr: 3.42,
    cpa: 33.95,
    roas: 7.85,
  },
  {
    id: "ad2",
    campanha: "ABO - Conversões - Cães",
    plataforma: "meta",
    thumbnail: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=120&h=120&fit=crop",
    headline: "Antiparasitário Natural - Frete Grátis Brasil",
    investimento: 3450.2,
    conversoes: 98,
    ctr: 2.95,
    cpa: 35.21,
    roas: 6.92,
  },
  {
    id: "ad3",
    campanha: "[Pmax] Petderma - Catálogo",
    plataforma: "google",
    thumbnail: "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=120&h=120&fit=crop",
    headline: "Loja Petderma - Produtos Dermatológicos",
    investimento: 5820.8,
    conversoes: 132,
    ctr: 2.78,
    cpa: 44.10,
    roas: 5.45,
  },
  {
    id: "ad4",
    campanha: "Retargeting - View Content 14d",
    plataforma: "meta",
    thumbnail: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=120&h=120&fit=crop",
    headline: "Você esqueceu algo no carrinho! 15% OFF",
    investimento: 1240.5,
    conversoes: 52,
    ctr: 4.12,
    cpa: 23.86,
    roas: 9.42,
  },
  {
    id: "ad5",
    campanha: "CBO - Conversões - Gatos",
    plataforma: "meta",
    thumbnail: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=120&h=120&fit=crop",
    headline: "Linha Felina Petderma - Cuidado especializado",
    investimento: 2980.4,
    conversoes: 78,
    ctr: 2.45,
    cpa: 38.21,
    roas: 6.58,
  },
];

// ==================== ANOMALIAS ====================

export const ANOMALIAS: Anomalia[] = [
  {
    id: "an1",
    tipo: "cpa_subiu",
    severidade: "alta",
    metrica: "CPA",
    valor_atual: 91.02,
    baseline: 58.4,
    desvio_percentual: 55.86,
    descricao: "CPA da campanha [Search] Genérico subiu 55% vs últimos 7 dias",
    narrativa_ia: "Alta significativa no CPA detectada. Possíveis causas: (1) palavras-chave em modo amplo capturando termos irrelevantes, (2) lance manual aumentado recentemente, ou (3) queda na conversion rate do site. Recomendação: revisar search terms e adicionar negativadas.",
    detectada_em: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    resolvida: false,
    campanha: "[Search] Petderma - Genérico",
  },
  {
    id: "an2",
    tipo: "roas_caiu",
    severidade: "media",
    metrica: "ROAS",
    valor_atual: 2.47,
    baseline: 4.12,
    desvio_percentual: -40.05,
    descricao: "ROAS de [Display] Remarketing 30d caiu 40%",
    narrativa_ia: "Queda relevante no ROAS desta campanha de remarketing. A audiência pode estar saturada. Considere: (1) renovar criativos, (2) ajustar a janela para 14 ou 7 dias, (3) testar novo segmento de público.",
    detectada_em: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    resolvida: false,
    campanha: "[Display] Remarketing 30d",
  },
  {
    id: "an3",
    tipo: "gasto_acima_baseline",
    severidade: "critica",
    metrica: "Investimento Diário",
    valor_atual: 4820.0,
    baseline: 2150.0,
    desvio_percentual: 124.18,
    descricao: "Gasto diário 124% acima do baseline na conta Meta",
    narrativa_ia: "Crítico: o investimento dobrou em 24h sem ajuste manual registrado no change tracker. Pode ser auto-otimização do Advantage+ ou learning phase agressiva. Verifique se há nova campanha com CBO mal configurado.",
    detectada_em: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    resolvida: false,
  },
  {
    id: "an4",
    tipo: "conversoes_subiram",
    severidade: "baixa",
    metrica: "Conversões",
    valor_atual: 142,
    baseline: 98,
    desvio_percentual: 44.9,
    descricao: "Conversões da campanha de marca subiram 45%",
    narrativa_ia: "Boa notícia: conversões da campanha de marca aumentaram significativamente. Investigue se há campanha de awareness rodando em paralelo (orgânico ou pago) que esteja gerando demanda. Considere aumentar budget desta campanha.",
    detectada_em: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    resolvida: false,
    campanha: "[Search] Petderma - Marca",
  },
];

// ==================== MUDANÇAS ====================

export const MUDANCAS: Mudanca[] = [
  {
    id: "mu1",
    feita_em: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
    feita_por: "ADM_GERAL",
    entidade_tipo: "campanha",
    entidade_nome: "Advantage+ Shopping",
    campo: "budget_diario",
    valor_antes: "R$ 350,00",
    valor_depois: "R$ 500,00",
    veredicto: "positiva",
    narrativa_ia: "Aumento de 43% no budget resultou em +185 conversões e CPA estável (R$ 35,97 vs R$ 36,12 anterior). Mudança bem calibrada — escalou volume sem perder eficiência. Recomendação: considerar +20% adicional respeitando a regra de não pular mais de 20% por vez.",
    impacto_dias: 21,
  },
  {
    id: "mu2",
    feita_em: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    feita_por: "ADM_GERAL",
    entidade_tipo: "campanha",
    entidade_nome: "[Display] Remarketing 30d",
    campo: "status",
    valor_antes: "active",
    valor_depois: "paused",
    veredicto: "neutra",
    narrativa_ia: "Pausa da campanha de remarketing display. ROAS caiu na semana seguinte na conta como um todo, mas correlação não é necessariamente causal — pode ser sazonalidade. Considere reativar com criativos novos.",
    impacto_dias: 14,
  },
  {
    id: "mu3",
    feita_em: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    feita_por: "ADM_GERAL",
    entidade_tipo: "keyword",
    entidade_nome: "[Search] Genérico - 12 keywords negativadas",
    campo: "negative_keywords",
    valor_antes: "0",
    valor_depois: "12",
    veredicto: "aguardando",
    narrativa_ia: "Adicionadas 12 negativadas em search terms de baixa qualidade. Aguardando 14 dias para análise definitiva.",
    impacto_dias: 7,
  },
];
