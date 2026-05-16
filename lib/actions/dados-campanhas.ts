"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Camada de leitura de dados sincronizados de Meta + Google.
 *
 * Todas as queries leem das tabelas *_snapshot, agregando por período.
 * Quando não houver dados (cliente sem sync ainda), retorna estruturas vazias.
 */

// ==================== TYPES ====================

export type Plataforma = "meta" | "google";
export type StatusCampanha = "active" | "paused" | "removed" | string;

export interface CampanhaAgregada {
  campanha_id: string;
  campanha_nome: string;
  plataforma: Plataforma;
  objetivo: string | null;
  status: StatusCampanha | null;
  investimento: number;
  impressoes: number;
  cliques: number;
  conversoes: number;
  receita: number;
  ctr: number;
  cpc: number;
  cpa: number;
  cpl: number; // para lead_whatsapp = cpa
  roas: number;
  ultima_data: string | null;
}

export interface SeriePonto {
  data: string;
  investimento: number;
  impressoes: number;
  cliques: number;
  conversoes: number;
  receita: number;
  leads: number;
  cpl: number;
  cpa: number;
  roas: number;
}

export interface KPIsGerais {
  investimento: number;
  impressoes: number;
  cliques: number;
  conversoes: number;
  receita: number;
  ctr: number;
  cpc: number;
  cpa: number;
  cpl: number;
  roas: number;
  // por plataforma
  investimento_meta: number;
  investimento_google: number;
}

export interface AdResumo {
  ad_id: string;
  ad_nome: string;
  plataforma: Plataforma;
  thumbnail_url: string | null;
  headline: string | null;
  campanha_nome: string | null;
  investimento: number;
  impressoes: number;
  cliques: number;
  conversoes: number;
  receita: number;
  ctr: number;
  cpa: number;
  cpl: number;
  roas: number;
}

// ==================== HELPERS ====================

function defaultRange(daysBack: number): { since: string; until: string } {
  const until = new Date();
  const since = new Date(until.getTime() - daysBack * 86400000);
  return {
    since: since.toISOString().split("T")[0],
    until: until.toISOString().split("T")[0],
  };
}

// ==================== KPIs GERAIS ====================

export async function getKPIsGerais(
  clienteId: string,
  daysBack: number = 30
): Promise<KPIsGerais> {
  const { since, until } = defaultRange(daysBack);
  const supabase = await createClient();

  const { data, error } = await supabase
    .schema("trafego_ddg")
    .from("campanhas_snapshot")
    .select(
      "plataforma, investimento, impressoes, cliques, conversoes, receita"
    )
    .eq("cliente_id", clienteId)
    .gte("data", since)
    .lte("data", until);

  if (error || !data || data.length === 0) {
    return {
      investimento: 0,
      impressoes: 0,
      cliques: 0,
      conversoes: 0,
      receita: 0,
      ctr: 0,
      cpc: 0,
      cpa: 0,
      cpl: 0,
      roas: 0,
      investimento_meta: 0,
      investimento_google: 0,
    };
  }

  let investimento = 0;
  let impressoes = 0;
  let cliques = 0;
  let conversoes = 0;
  let receita = 0;
  let investimento_meta = 0;
  let investimento_google = 0;

  for (const r of data) {
    const inv = Number(r.investimento ?? 0);
    investimento += inv;
    impressoes += Number(r.impressoes ?? 0);
    cliques += Number(r.cliques ?? 0);
    conversoes += Number(r.conversoes ?? 0);
    receita += Number(r.receita ?? 0);
    if (r.plataforma === "meta") investimento_meta += inv;
    if (r.plataforma === "google") investimento_google += inv;
  }

  const ctr = impressoes ? (cliques / impressoes) * 100 : 0;
  const cpc = cliques ? investimento / cliques : 0;
  const cpa = conversoes ? investimento / conversoes : 0;
  const cpl = cpa; // mesmo cálculo, semântica depende do tipo_negocio
  const roas = investimento ? receita / investimento : 0;

  return {
    investimento,
    impressoes,
    cliques,
    conversoes,
    receita,
    ctr,
    cpc,
    cpa,
    cpl,
    roas,
    investimento_meta,
    investimento_google,
  };
}

// ==================== SÉRIE TEMPORAL ====================

export async function getSerieDiaria(
  clienteId: string,
  daysBack: number = 30
): Promise<SeriePonto[]> {
  const { since, until } = defaultRange(daysBack);
  const supabase = await createClient();

  const { data, error } = await supabase
    .schema("trafego_ddg")
    .from("campanhas_snapshot")
    .select("data, investimento, impressoes, cliques, conversoes, receita")
    .eq("cliente_id", clienteId)
    .gte("data", since)
    .lte("data", until);

  if (error || !data) return [];

  // Agrupar por data
  const mapa = new Map<
    string,
    { invest: number; imp: number; cli: number; conv: number; rec: number }
  >();
  for (const r of data) {
    const dt = r.data as string;
    const prev = mapa.get(dt) ?? { invest: 0, imp: 0, cli: 0, conv: 0, rec: 0 };
    prev.invest += Number(r.investimento ?? 0);
    prev.imp += Number(r.impressoes ?? 0);
    prev.cli += Number(r.cliques ?? 0);
    prev.conv += Number(r.conversoes ?? 0);
    prev.rec += Number(r.receita ?? 0);
    mapa.set(dt, prev);
  }

  const lista: SeriePonto[] = [];
  for (const [data, v] of Array.from(mapa.entries()).sort()) {
    const cpa = v.conv ? v.invest / v.conv : 0;
    const roas = v.invest ? v.rec / v.invest : 0;
    lista.push({
      data,
      investimento: v.invest,
      impressoes: v.imp,
      cliques: v.cli,
      conversoes: v.conv,
      receita: v.rec,
      leads: v.conv, // para lead_whatsapp
      cpl: cpa,
      cpa,
      roas,
    });
  }
  return lista;
}

// ==================== CAMPANHAS AGREGADAS ====================

export async function getCampanhasAgregadas(
  clienteId: string,
  daysBack: number = 30
): Promise<CampanhaAgregada[]> {
  const { since, until } = defaultRange(daysBack);
  const supabase = await createClient();

  const { data, error } = await supabase
    .schema("trafego_ddg")
    .from("campanhas_snapshot")
    .select(
      "campanha_id, campanha_nome, plataforma, objetivo, status, data, investimento, impressoes, cliques, conversoes, receita"
    )
    .eq("cliente_id", clienteId)
    .gte("data", since)
    .lte("data", until);

  if (error || !data) return [];

  const mapa = new Map<string, CampanhaAgregada>();
  for (const r of data) {
    const key = `${r.plataforma}|${r.campanha_id}`;
    const prev = mapa.get(key) ?? {
      campanha_id: r.campanha_id as string,
      campanha_nome: r.campanha_nome as string,
      plataforma: r.plataforma as Plataforma,
      objetivo: r.objetivo as string | null,
      status: r.status as string | null,
      investimento: 0,
      impressoes: 0,
      cliques: 0,
      conversoes: 0,
      receita: 0,
      ctr: 0,
      cpc: 0,
      cpa: 0,
      cpl: 0,
      roas: 0,
      ultima_data: null,
    };
    prev.investimento += Number(r.investimento ?? 0);
    prev.impressoes += Number(r.impressoes ?? 0);
    prev.cliques += Number(r.cliques ?? 0);
    prev.conversoes += Number(r.conversoes ?? 0);
    prev.receita += Number(r.receita ?? 0);
    // Status mais recente vence (sequência tabular do PostgREST não é determinística por data)
    if (!prev.ultima_data || (r.data as string) > prev.ultima_data) {
      prev.ultima_data = r.data as string;
      prev.status = r.status as string | null;
    }
    mapa.set(key, prev);
  }

  const lista = Array.from(mapa.values()).map((c) => {
    const ctr = c.impressoes ? (c.cliques / c.impressoes) * 100 : 0;
    const cpc = c.cliques ? c.investimento / c.cliques : 0;
    const cpa = c.conversoes ? c.investimento / c.conversoes : 0;
    const roas = c.investimento ? c.receita / c.investimento : 0;
    return { ...c, ctr, cpc, cpa, cpl: cpa, roas };
  });

  // Ordena por investimento desc (default)
  return lista.sort((a, b) => b.investimento - a.investimento);
}

// ==================== TOP ADS ====================

export async function getTopAds(
  clienteId: string,
  daysBack: number = 30,
  limit: number = 10
): Promise<AdResumo[]> {
  const { since, until } = defaultRange(daysBack);
  const supabase = await createClient();

  // Vamos pegar ads + cruzar com campanhas pra ter campanha_nome
  const { data: adsData, error } = await supabase
    .schema("trafego_ddg")
    .from("ads_snapshot")
    .select(
      "ad_id, ad_nome, plataforma, adset_id, thumbnail_url, headline, data, investimento, impressoes, cliques, conversoes, receita"
    )
    .eq("cliente_id", clienteId)
    .gte("data", since)
    .lte("data", until)
    .gt("investimento", 0);

  if (error || !adsData || adsData.length === 0) return [];

  // Agrega por ad_id
  const mapa = new Map<string, AdResumo>();
  for (const r of adsData) {
    const key = `${r.plataforma}|${r.ad_id}`;
    const prev = mapa.get(key) ?? {
      ad_id: r.ad_id as string,
      ad_nome: r.ad_nome as string,
      plataforma: r.plataforma as Plataforma,
      thumbnail_url: r.thumbnail_url as string | null,
      headline: r.headline as string | null,
      campanha_nome: null,
      investimento: 0,
      impressoes: 0,
      cliques: 0,
      conversoes: 0,
      receita: 0,
      ctr: 0,
      cpa: 0,
      cpl: 0,
      roas: 0,
    };
    prev.investimento += Number(r.investimento ?? 0);
    prev.impressoes += Number(r.impressoes ?? 0);
    prev.cliques += Number(r.cliques ?? 0);
    prev.conversoes += Number(r.conversoes ?? 0);
    prev.receita += Number(r.receita ?? 0);
    mapa.set(key, prev);
  }

  const lista = Array.from(mapa.values()).map((a) => {
    const ctr = a.impressoes ? (a.cliques / a.impressoes) * 100 : 0;
    const cpa = a.conversoes ? a.investimento / a.conversoes : 0;
    const roas = a.investimento ? a.receita / a.investimento : 0;
    return { ...a, ctr, cpa, cpl: cpa, roas };
  });

  // Ordena por investimento desc
  return lista.sort((a, b) => b.investimento - a.investimento).slice(0, limit);
}

// ==================== VENDAS MANUAIS (lead_whatsapp) ====================

export interface VendasManuaisAgregado {
  total_leads_recebidos: number;
  leads_fechados: number;
  faturamento: number;
  total_investimento: number;
  // computados
  taxa_fechamento: number; // %
  cac_real: number;
  ticket_medio: number;
  roas_real: number;
  // meta
  periodos_registrados: number;
  ultimo_preenchimento: string | null;
}

/**
 * Agrega vendas_manuais do cliente para os últimos N dias (ou todas).
 * Retorna zeros quando não há registros preenchidos.
 */
export async function getVendasManuaisAgregadas(
  clienteId: string,
  daysBack: number = 30
): Promise<VendasManuaisAgregado> {
  const empty: VendasManuaisAgregado = {
    total_leads_recebidos: 0,
    leads_fechados: 0,
    faturamento: 0,
    total_investimento: 0,
    taxa_fechamento: 0,
    cac_real: 0,
    ticket_medio: 0,
    roas_real: 0,
    periodos_registrados: 0,
    ultimo_preenchimento: null,
  };

  try {
    const { since } = defaultRange(daysBack);
    const supabase = await createClient();
    const { data, error } = await supabase
      .schema("trafego_ddg")
      .from("vendas_manuais")
      .select(
        "total_leads_recebidos, leads_fechados, faturamento, total_investimento, preenchido_em"
      )
      .eq("cliente_id", clienteId)
      .gte("periodo_inicio", since);

    if (error || !data || data.length === 0) return empty;

    let total_leads_recebidos = 0;
    let leads_fechados = 0;
    let faturamento = 0;
    let total_investimento = 0;
    let ultimo: string | null = null;
    for (const v of data) {
      total_leads_recebidos += Number(v.total_leads_recebidos ?? 0);
      leads_fechados += Number(v.leads_fechados ?? 0);
      faturamento += Number(v.faturamento ?? 0);
      total_investimento += Number(v.total_investimento ?? 0);
      const pe = v.preenchido_em as string | null;
      if (pe && (!ultimo || pe > ultimo)) ultimo = pe;
    }

    return {
      total_leads_recebidos,
      leads_fechados,
      faturamento,
      total_investimento,
      taxa_fechamento: total_leads_recebidos
        ? (leads_fechados / total_leads_recebidos) * 100
        : 0,
      cac_real: leads_fechados ? total_investimento / leads_fechados : 0,
      ticket_medio: leads_fechados ? faturamento / leads_fechados : 0,
      roas_real: total_investimento ? faturamento / total_investimento : 0,
      periodos_registrados: data.length,
      ultimo_preenchimento: ultimo,
    };
  } catch (err) {
    console.error("getVendasManuaisAgregadas:", err);
    return empty;
  }
}

// ==================== STATUS DA SYNC ====================

export interface StatusSync {
  ultima_sync_meta: string | null;
  ultima_sync_google: string | null;
  ultima_sync_status: string | null;
  meta_ultimo_erro: string | null;
  google_ultimo_erro: string | null;
}

export async function getStatusSync(clienteId: string): Promise<StatusSync> {
  const supabase = await createClient();
  const { data } = await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .select(
      "ultima_sync_meta, ultima_sync_google, ultima_sync_status, meta_ultimo_erro, google_ultimo_erro"
    )
    .eq("cliente_id", clienteId)
    .single();

  return {
    ultima_sync_meta: data?.ultima_sync_meta ?? null,
    ultima_sync_google: data?.ultima_sync_google ?? null,
    ultima_sync_status: data?.ultima_sync_status ?? null,
    meta_ultimo_erro: data?.meta_ultimo_erro ?? null,
    google_ultimo_erro: data?.google_ultimo_erro ?? null,
  };
}

// ==================== TRIGGER SYNC MANUAL ====================

export async function dispararSyncMeta(
  clienteId: string
): Promise<{ ok: boolean; error?: string; result?: unknown }> {
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sync-meta-ads`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cliente_id: clienteId, days_back: 30 }),
    });
    if (!res.ok) {
      return { ok: false, error: `Sync falhou: ${res.status}` };
    }
    const result = await res.json();
    return { ok: true, result };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function dispararSyncGoogle(
  clienteId: string
): Promise<{ ok: boolean; error?: string; result?: unknown }> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "https://painel.dosedegrowth.com";
    const token = process.env.WEBHOOK_HMAC_SECRET;
    if (!token) return { ok: false, error: "SYNC_TOKEN não configurado" };

    const res = await fetch(`${baseUrl}/api/sync/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cliente_id: clienteId, days_back: 30 }),
    });
    if (!res.ok) {
      const txt = await res.text();
      return { ok: false, error: `Sync falhou: ${res.status} ${txt.slice(0, 200)}` };
    }
    const result = await res.json();
    return { ok: true, result };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
