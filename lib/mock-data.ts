/**
 * Mock data multi-modelo:
 * - Petderma (lead_whatsapp): foco em CPL, Conversas, CAC real (vendas manuais)
 * - Marina Saleme (ecommerce): foco em ROAS, Receita, Carrinho Abandonado
 */

export type Plataforma = "google" | "meta";
export type StatusCampanha = "active" | "paused" | "removed";
export type TipoNegocio = "ecommerce" | "lead_whatsapp" | "hibrido";

export interface Cliente {
  id: string;
  nome: string;
  slug: string;
  tipo_negocio: TipoNegocio;
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
  // lead_whatsapp
  leads: number;
  cpl: number;
  // ecommerce
  conversoes: number;
  cpa: number;
  receita: number;
  roas: number;
  // ecommerce extras
  add_to_cart?: number;
  initiate_checkout?: number;
}

export interface SeriePonto {
  data: string;
  investimento: number;
  leads: number;
  cpl: number;
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
  leads?: number;
  conversoes?: number;
  ctr: number;
  cpl?: number;
  cpa?: number;
  roas?: number;
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

export interface VendaManual {
  id: string;
  cliente_id: string;
  periodo_inicio: string;
  periodo_fim: string;
  total_leads_recebidos: number;
  total_investimento: number;
  leads_fechados: number;
  faturamento: number;
  perc_origem_meta?: number;
  perc_origem_google?: number;
  observacoes?: string;
  preenchido_em: string;
}

export interface CarrinhoAbandonado {
  data: string;
  total_carrinhos: number;
  total_iniciado_checkout: number;
  total_finalizado: number;
  valor_total_carrinhos: number;
  valor_recuperado: number;
  taxa_recuperacao: number;
}

// ==================== CLIENTES ====================

export const CLIENTES: Cliente[] = [
  {
    id: "petderma",
    nome: "Petderma",
    slug: "petderma",
    tipo_negocio: "lead_whatsapp",
    cor_primaria: "#F15839",
    logo_url: "/brand/logo-icon.svg",
    cac_maximo: 80,
    ticket_medio: 250,
    ativo: true,
  },
  {
    id: "marina-saleme",
    nome: "Marina Saleme",
    slug: "marina-saleme",
    tipo_negocio: "ecommerce",
    cor_primaria: "#F15839",
    logo_url: "/brand/logo-icon.svg",
    cac_maximo: 60,
    ticket_medio: 180,
    ativo: true,
  },
];

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// ==================== CAMPANHAS PETDERMA (lead_whatsapp) ====================

export const CAMPANHAS_PETDERMA: Campanha[] = [
  { id: "p_g1", cliente_id: "petderma", plataforma: "google", campanha_id: "21458732145", campanha_nome: "[Search] Petderma - Marca", objetivo: "Leads", status: "active", investimento: 4280.5, impressoes: 89420, cliques: 3420, ctr: 3.83, cpc: 1.25, leads: 168, cpl: 25.48, conversoes: 0, cpa: 0, receita: 0, roas: 0 },
  { id: "p_g2", cliente_id: "petderma", plataforma: "google", campanha_id: "21458732146", campanha_nome: "[Search] Dermatologia Pet - Genérico", objetivo: "Leads", status: "active", investimento: 8920.3, impressoes: 245800, cliques: 7280, ctr: 2.96, cpc: 1.23, leads: 142, cpl: 62.82, conversoes: 0, cpa: 0, receita: 0, roas: 0 },
  { id: "p_g3", cliente_id: "petderma", plataforma: "google", campanha_id: "21458732147", campanha_nome: "[Pmax] Petderma - Lead Magnet", objetivo: "Leads", status: "active", investimento: 5450.8, impressoes: 380200, cliques: 8820, ctr: 2.32, cpc: 0.62, leads: 218, cpl: 25.0, conversoes: 0, cpa: 0, receita: 0, roas: 0 },
  { id: "p_m1", cliente_id: "petderma", plataforma: "meta", campanha_id: "23854712365", campanha_nome: "CTWA - Cães - Conversões Mensagem", objetivo: "Mensagens", status: "active", investimento: 9820.5, impressoes: 1245800, cliques: 28450, ctr: 2.28, cpc: 0.35, leads: 312, cpl: 31.48, conversoes: 0, cpa: 0, receita: 0, roas: 0 },
  { id: "p_m2", cliente_id: "petderma", plataforma: "meta", campanha_id: "23854712366", campanha_nome: "CTWA - Gatos - Conversões Mensagem", objetivo: "Mensagens", status: "active", investimento: 5430.2, impressoes: 685400, cliques: 14820, ctr: 2.16, cpc: 0.37, leads: 178, cpl: 30.51, conversoes: 0, cpa: 0, receita: 0, roas: 0 },
  { id: "p_m3", cliente_id: "petderma", plataforma: "meta", campanha_id: "23854712367", campanha_nome: "Lead Form - Captação Geral", objetivo: "Lead", status: "active", investimento: 7820.6, impressoes: 1145000, cliques: 22200, ctr: 1.94, cpc: 0.35, leads: 285, cpl: 27.44, conversoes: 0, cpa: 0, receita: 0, roas: 0 },
  { id: "p_m4", cliente_id: "petderma", plataforma: "meta", campanha_id: "23854712368", campanha_nome: "CTWA - Lookalike Compradores", objetivo: "Mensagens", status: "active", investimento: 3240.8, impressoes: 425000, cliques: 8900, ctr: 2.09, cpc: 0.36, leads: 89, cpl: 36.41, conversoes: 0, cpa: 0, receita: 0, roas: 0 },
];

// ==================== CAMPANHAS MARINA SALEME (ecommerce) ====================

export const CAMPANHAS_MARINA: Campanha[] = [
  { id: "m_g1", cliente_id: "marina-saleme", plataforma: "google", campanha_id: "33458732001", campanha_nome: "[Pmax] Marina Saleme - Catálogo Completo", objetivo: "Vendas", status: "active", investimento: 12450.8, impressoes: 580200, cliques: 14820, ctr: 2.55, cpc: 0.84, leads: 0, cpl: 0, conversoes: 285, cpa: 43.69, receita: 71250, roas: 5.72, add_to_cart: 1840, initiate_checkout: 720 },
  { id: "m_g2", cliente_id: "marina-saleme", plataforma: "google", campanha_id: "33458732002", campanha_nome: "[Search] Marina Saleme - Marca", objetivo: "Vendas", status: "active", investimento: 3280.5, impressoes: 89420, cliques: 3420, ctr: 3.83, cpc: 0.96, leads: 0, cpl: 0, conversoes: 142, cpa: 23.10, receita: 38500, roas: 11.74, add_to_cart: 480, initiate_checkout: 195 },
  { id: "m_g3", cliente_id: "marina-saleme", plataforma: "google", campanha_id: "33458732003", campanha_nome: "[Display] Remarketing 30d", objetivo: "Vendas", status: "active", investimento: 1820.4, impressoes: 158400, cliques: 1240, ctr: 0.78, cpc: 1.47, leads: 0, cpl: 0, conversoes: 38, cpa: 47.91, receita: 9120, roas: 5.01, add_to_cart: 124, initiate_checkout: 58 },
  { id: "m_m1", cliente_id: "marina-saleme", plataforma: "meta", campanha_id: "43854712001", campanha_nome: "Advantage+ Shopping", objetivo: "Sales", status: "active", investimento: 14820.6, impressoes: 2145000, cliques: 48200, ctr: 2.25, cpc: 0.31, leads: 0, cpl: 0, conversoes: 412, cpa: 35.97, receita: 103000, roas: 6.95, add_to_cart: 2840, initiate_checkout: 980 },
  { id: "m_m2", cliente_id: "marina-saleme", plataforma: "meta", campanha_id: "43854712002", campanha_nome: "ABO - Conversion - Cold Audience", objetivo: "Conversions", status: "active", investimento: 6430.2, impressoes: 825400, cliques: 18820, ctr: 2.28, cpc: 0.34, leads: 0, cpl: 0, conversoes: 152, cpa: 42.30, receita: 38000, roas: 5.91, add_to_cart: 980, initiate_checkout: 388 },
  { id: "m_m3", cliente_id: "marina-saleme", plataforma: "meta", campanha_id: "43854712003", campanha_nome: "Retargeting - Carrinho Abandonado", objetivo: "Conversions", status: "active", investimento: 2180.4, impressoes: 320500, cliques: 9450, ctr: 2.95, cpc: 0.23, leads: 0, cpl: 0, conversoes: 98, cpa: 22.25, receita: 26460, roas: 12.13, add_to_cart: 480, initiate_checkout: 285 },
];

// ==================== HELPERS ====================

export function getCampanhasPorCliente(slug: string): Campanha[] {
  if (slug === "petderma") return CAMPANHAS_PETDERMA;
  if (slug === "marina-saleme") return CAMPANHAS_MARINA;
  return [];
}

export function getClientePorSlug(slug: string): Cliente | undefined {
  return CLIENTES.find((c) => c.slug === slug);
}

// Compatibilidade com código antigo
export const CAMPANHAS = CAMPANHAS_PETDERMA;
export const TOP_ADS: AdCriativo[] = [];

// ==================== SÉRIE TEMPORAL POR TIPO ====================

export function gerarSerie30Dias(tipo: TipoNegocio = "lead_whatsapp"): SeriePonto[] {
  const hoje = new Date();
  const serie: SeriePonto[] = [];

  for (let i = 29; i >= 0; i--) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - i);

    const baseInvestimento = 1500 + Math.sin(i / 4) * 280 + rand(-150, 220);
    const investimento = Math.max(600, baseInvestimento);
    const cliques = Math.round(investimento / rand(0.4, 0.9));
    const impressoes = Math.round(cliques / rand(0.018, 0.035));

    if (tipo === "ecommerce") {
      const baseConv = 35 + Math.sin(i / 5) * 9 + rand(-6, 8);
      const baseRoas = 5.5 + Math.cos(i / 6) * 1.0 + rand(-0.4, 0.5);
      const conversoes = Math.max(8, Math.round(baseConv));
      const roas = Math.max(1, baseRoas);
      const receita = investimento * roas;
      const cpa = investimento / conversoes;

      serie.push({
        data: data.toISOString().split("T")[0],
        investimento: Number(investimento.toFixed(2)),
        leads: 0, cpl: 0,
        conversoes,
        receita: Number(receita.toFixed(2)),
        roas: Number(roas.toFixed(2)),
        cpa: Number(cpa.toFixed(2)),
        cliques,
        impressoes,
      });
    } else {
      const baseLeads = 38 + Math.sin(i / 5) * 11 + rand(-7, 9);
      const leads = Math.max(10, Math.round(baseLeads));
      const cpl = investimento / leads;

      serie.push({
        data: data.toISOString().split("T")[0],
        investimento: Number(investimento.toFixed(2)),
        leads,
        cpl: Number(cpl.toFixed(2)),
        conversoes: 0, receita: 0, roas: 0, cpa: 0,
        cliques,
        impressoes,
      });
    }
  }
  return serie;
}

// ==================== TOP ADS ====================

export const TOP_ADS_PETDERMA: AdCriativo[] = [
  { id: "p_ad1", campanha: "CTWA - Cães", plataforma: "meta", thumbnail: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=120&h=120&fit=crop", headline: "Coceira no seu pet? Avaliação grátis no WhatsApp", investimento: 3820.5, leads: 142, ctr: 3.42, cpl: 26.91 },
  { id: "p_ad2", campanha: "Lead Form - Captação Geral", plataforma: "meta", thumbnail: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=120&h=120&fit=crop", headline: "Diagnóstico dermatológico para seu pet", investimento: 2950.2, leads: 108, ctr: 2.95, cpl: 27.32 },
  { id: "p_ad3", campanha: "[Search] Marca", plataforma: "google", thumbnail: "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=120&h=120&fit=crop", headline: "Petderma — Atendimento veterinário online", investimento: 2120.8, leads: 88, ctr: 4.12, cpl: 24.10 },
  { id: "p_ad4", campanha: "CTWA - Lookalike Compradores", plataforma: "meta", thumbnail: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=120&h=120&fit=crop", headline: "Trate alergias e doenças de pele no seu pet", investimento: 1240.5, leads: 38, ctr: 2.45, cpl: 32.64 },
];

export const TOP_ADS_MARINA: AdCriativo[] = [
  { id: "m_ad1", campanha: "Advantage+ Shopping", plataforma: "meta", thumbnail: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=120&h=120&fit=crop", headline: "Coleção Inverno Marina Saleme — 20% OFF", investimento: 4820.5, conversoes: 142, ctr: 3.42, cpa: 33.95, roas: 7.85 },
  { id: "m_ad2", campanha: "Retargeting - Carrinho", plataforma: "meta", thumbnail: "https://images.unsplash.com/photo-1551803091-e20673f15770?w=120&h=120&fit=crop", headline: "Você esqueceu seu look! Frete grátis hoje", investimento: 1240.5, conversoes: 52, ctr: 4.12, cpa: 23.86, roas: 9.42 },
  { id: "m_ad3", campanha: "[Pmax] Catálogo Completo", plataforma: "google", thumbnail: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=120&h=120&fit=crop", headline: "Marina Saleme — Moda feminina premium", investimento: 5820.8, conversoes: 132, ctr: 2.78, cpa: 44.10, roas: 5.45 },
];

// ==================== ANOMALIAS ====================

export const ANOMALIAS: Anomalia[] = [
  { id: "an1", tipo: "cpl_subiu", severidade: "alta", metrica: "CPL", valor_atual: 62.82, baseline: 38.4, desvio_percentual: 63.6, descricao: "CPL da campanha [Search] Genérico subiu 63% vs últimos 7 dias", narrativa_ia: "Alta significativa no CPL. Possíveis causas: keywords em modo amplo capturando termos irrelevantes ou queda na taxa de resposta no WhatsApp. Recomendação: revisar search terms.", detectada_em: new Date(Date.now() - 1000 * 60 * 30).toISOString(), resolvida: false, campanha: "[Search] Dermatologia Pet - Genérico" },
  { id: "an2", tipo: "leads_caiu", severidade: "media", metrica: "Leads", valor_atual: 89, baseline: 142, desvio_percentual: -37.3, descricao: "Leads de CTWA Lookalike caíram 37%", narrativa_ia: "Queda de volume de leads na campanha de lookalike. Audiência pode estar saturada. Considere atualizar para Lookalike de compradores recentes (90d).", detectada_em: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), resolvida: false, campanha: "CTWA - Lookalike Compradores" },
  { id: "an3", tipo: "investimento_acima", severidade: "critica", metrica: "Investimento Diário", valor_atual: 4820.0, baseline: 2150.0, desvio_percentual: 124.18, descricao: "Gasto diário 124% acima do baseline", narrativa_ia: "Crítico: investimento dobrou em 24h sem ajuste manual no change tracker.", detectada_em: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), resolvida: false },
];

// ==================== MUDANÇAS ====================

export const MUDANCAS: Mudanca[] = [
  { id: "mu1", feita_em: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(), feita_por: "ADM_GERAL", entidade_tipo: "campanha", entidade_nome: "CTWA - Cães", campo: "budget_diario", valor_antes: "R$ 250,00", valor_depois: "R$ 320,00", veredicto: "positiva", narrativa_ia: "Aumento de 28% no budget gerou +112 leads (CTWA) com CPL estável. Mudança bem calibrada.", impacto_dias: 21 },
  { id: "mu2", feita_em: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), feita_por: "ADM_GERAL", entidade_tipo: "keyword", entidade_nome: "[Search] Genérico - 8 keywords negativadas", campo: "negative_keywords", valor_antes: "0", valor_depois: "8", veredicto: "positiva", narrativa_ia: "8 keywords negativadas. CPL caiu 18% nas 2 semanas seguintes.", impacto_dias: 14 },
  { id: "mu3", feita_em: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), feita_por: "ADM_GERAL", entidade_tipo: "campanha", entidade_nome: "Retargeting - Carrinho Abandonado", campo: "budget_diario", valor_antes: "R$ 70,00", valor_depois: "R$ 100,00", veredicto: "aguardando", narrativa_ia: "Aumento de 43% no budget. Aguardando 14 dias para análise definitiva.", impacto_dias: 7 },
];

// ==================== VENDAS MANUAIS ====================

export const VENDAS_MANUAIS: VendaManual[] = [
  { id: "vm1", cliente_id: "petderma", periodo_inicio: "2026-04-21", periodo_fim: "2026-04-27", total_leads_recebidos: 245, total_investimento: 12480.5, leads_fechados: 42, faturamento: 10500, perc_origem_meta: 65, perc_origem_google: 35, observacoes: "Semana com pico de demanda - férias escolares.", preenchido_em: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
  { id: "vm2", cliente_id: "petderma", periodo_inicio: "2026-04-14", periodo_fim: "2026-04-20", total_leads_recebidos: 218, total_investimento: 11820.4, leads_fechados: 35, faturamento: 8750, perc_origem_meta: 70, perc_origem_google: 30, observacoes: "", preenchido_em: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString() },
  { id: "vm3", cliente_id: "petderma", periodo_inicio: "2026-04-07", periodo_fim: "2026-04-13", total_leads_recebidos: 198, total_investimento: 10245.8, leads_fechados: 28, faturamento: 7000, perc_origem_meta: 72, perc_origem_google: 28, preenchido_em: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString() },
];

// ==================== CARRINHOS ABANDONADOS ====================

export function gerarCarrinhosAbandonados(): CarrinhoAbandonado[] {
  const hoje = new Date();
  const lista: CarrinhoAbandonado[] = [];
  for (let i = 13; i >= 0; i--) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - i);
    const total = Math.round(40 + rand(-12, 20));
    const checkout = Math.round(total * rand(0.45, 0.65));
    const finalizado = Math.round(checkout * rand(0.55, 0.75));
    const valor_total = total * rand(220, 380);
    const valor_recuperado = (total - finalizado) * rand(80, 220);
    lista.push({
      data: data.toISOString().split("T")[0],
      total_carrinhos: total,
      total_iniciado_checkout: checkout,
      total_finalizado: finalizado,
      valor_total_carrinhos: Number(valor_total.toFixed(2)),
      valor_recuperado: Number(valor_recuperado.toFixed(2)),
      taxa_recuperacao: Number(((valor_recuperado / valor_total) * 100).toFixed(2)),
    });
  }
  return lista;
}
