/**
 * Edge Function: sync-meta-ads
 *
 * Sincroniza dados Meta Ads pra todos os clientes ativos com OAuth conectado.
 *
 * Triggers:
 * - Cron pg_cron 4x/dia (06h, 12h, 18h, 23h BRT)
 * - Chamada manual via POST { cliente_id } (sync de um cliente só)
 *
 * Body opcional:
 *   { cliente_id?: string, days_back?: number (default 30) }
 *
 * Fluxo por cliente:
 *  1. Lê clientes_acessos para pegar meta_ad_account_id + meta_long_lived_token
 *  2. GET /{ad_account}/campaigns + insights diários (últimos N dias)
 *  3. GET /{ad_account}/adsets + insights
 *  4. GET /{ad_account}/ads + creative.thumbnail_url
 *  5. Upsert em trafego_ddg.{campanhas,adsets,ads}_snapshot
 *  6. Atualiza ultima_sync_meta no clientes_acessos
 *  7. Loga resultado em trafego_ddg.logs
 *
 * Auth: pode ser chamada sem JWT (verify_jwt=false), mas requer
 * SUPABASE_SERVICE_ROLE_KEY pra escrever sob RLS.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const META_API_VERSION = "v22.0";
const META_GRAPH = `https://graph.facebook.com/${META_API_VERSION}`;

interface Cliente {
  id: string;
  slug: string;
  nome: string;
  tipo_negocio: string;
}

interface ClienteAcesso {
  cliente_id: string;
  meta_ad_account_id: string;
  meta_long_lived_token: string;
  meta_pixel_id: string | null;
}

interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  effective_status?: string;
  insights?: { data: MetaInsight[] };
}

interface MetaAdSet {
  id: string;
  name: string;
  status: string;
  campaign_id: string;
  effective_status?: string;
  insights?: { data: MetaInsight[] };
}

interface MetaAd {
  id: string;
  name: string;
  status: string;
  adset_id: string;
  creative?: {
    id?: string;
    thumbnail_url?: string;
    image_url?: string;
    title?: string;
    body?: string;
    call_to_action_type?: string;
  };
  insights?: { data: MetaInsight[] };
}

interface MetaInsight {
  date_start: string;
  date_stop?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  actions?: Array<{ action_type: string; value: string }>;
  action_values?: Array<{ action_type: string; value: string }>;
  conversions?: string;
}

// ============ HELPERS ============

function numero(v: string | number | undefined | null): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}

/**
 * Extrai conversões e valor de actions/action_values.
 * Prioridade:
 *   - purchase / offsite_conversion.fb_pixel_purchase (e-commerce)
 *   - lead / onsite_conversion.lead_grouped (lead_whatsapp)
 *   - omni_purchase, complete_registration (fallback)
 */
function extrairConversoes(insight: MetaInsight): {
  conversoes: number;
  receita: number;
  leads: number;
} {
  const ACTIONS_PURCHASE = new Set([
    "purchase",
    "omni_purchase",
    "offsite_conversion.fb_pixel_purchase",
    "onsite_web_purchase",
  ]);
  const ACTIONS_LEAD = new Set([
    "lead",
    "onsite_conversion.lead_grouped",
    "offsite_conversion.fb_pixel_lead",
    "complete_registration",
    "messaging_conversation_started_7d",
    "onsite_conversion.messaging_conversation_started_7d",
  ]);

  let conversoes = 0;
  let leads = 0;
  let receita = 0;

  for (const a of insight.actions ?? []) {
    const val = numero(a.value);
    if (ACTIONS_PURCHASE.has(a.action_type)) conversoes += val;
    if (ACTIONS_LEAD.has(a.action_type)) leads += val;
  }
  for (const a of insight.action_values ?? []) {
    const val = numero(a.value);
    if (ACTIONS_PURCHASE.has(a.action_type)) receita += val;
  }

  return { conversoes, leads, receita };
}

async function fetchMeta<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Meta API ${url.split("?")[0]} failed:`, res.status);
      return null;
    }
    return (await res.json()) as T;
  } catch (e) {
    console.error("Meta fetch error:", e);
    return null;
  }
}

/** Pagina automaticamente sobre paging.next */
async function fetchAllPages<T>(initialUrl: string): Promise<T[]> {
  const items: T[] = [];
  let url: string | undefined = initialUrl;
  let count = 0;
  while (url && count < 20) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await fetchMeta(url);
    if (!res?.data) break;
    items.push(...(res.data as T[]));
    url = res.paging?.next;
    count++;
  }
  return items;
}

/**
 * Calcula data range pra insights.
 */
function dateRange(daysBack: number): { since: string; until: string } {
  const until = new Date();
  const since = new Date(until.getTime() - daysBack * 86400000);
  return {
    since: since.toISOString().split("T")[0],
    until: until.toISOString().split("T")[0],
  };
}

// ============ MAIN ============

interface SyncResult {
  cliente_slug: string;
  cliente_nome: string;
  ok: boolean;
  campanhas: number;
  adsets: number;
  ads: number;
  insight_rows: number;
  erro?: string;
  duration_ms: number;
}

async function syncCliente(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  cliente: Cliente,
  acesso: ClienteAcesso,
  daysBack: number
): Promise<SyncResult> {
  const t0 = Date.now();
  const result: SyncResult = {
    cliente_slug: cliente.slug,
    cliente_nome: cliente.nome,
    ok: false,
    campanhas: 0,
    adsets: 0,
    ads: 0,
    insight_rows: 0,
    duration_ms: 0,
  };

  try {
    const { since, until } = dateRange(daysBack);
    const token = acesso.meta_long_lived_token;
    const adAcc = acesso.meta_ad_account_id;
    if (!token || !adAcc) {
      throw new Error("Credenciais Meta incompletas");
    }

    // ============ 1. CAMPANHAS + insights ============
    const campaignFields = [
      "id",
      "name",
      "status",
      "effective_status",
      "objective",
      `insights.time_range({"since":"${since}","until":"${until}"}).time_increment(1){date_start,spend,impressions,clicks,ctr,cpc,actions,action_values}`,
    ].join(",");

    const campaigns = await fetchAllPages<MetaCampaign>(
      `${META_GRAPH}/${adAcc}/campaigns?fields=${campaignFields}&limit=200&access_token=${token}`
    );
    result.campanhas = campaigns.length;

    // Cria mapa campanha_id -> nome pra agregar dados
    const campanhaInfo = new Map<string, MetaCampaign>();
    for (const c of campaigns) campanhaInfo.set(c.id, c);

    // Upsert snapshot diário das campanhas
    const campSnapRows: Record<string, unknown>[] = [];
    for (const c of campaigns) {
      const insights = c.insights?.data ?? [];
      for (const ins of insights) {
        const conv = extrairConversoes(ins);
        const investimento = numero(ins.spend);
        const impressoes = numero(ins.impressions);
        const cliques = numero(ins.clicks);
        const ctr = impressoes ? (cliques / impressoes) * 100 : 0;
        const cpc = cliques ? investimento / cliques : 0;

        // CPA / ROAS dependem do tipo de conversão
        const conversoesEfetivas = conv.conversoes || conv.leads;
        const cpa = conversoesEfetivas ? investimento / conversoesEfetivas : 0;
        const roas = investimento ? conv.receita / investimento : 0;

        campSnapRows.push({
          cliente_id: cliente.id,
          plataforma: "meta",
          campanha_id: c.id,
          campanha_nome: c.name,
          objetivo: c.objective,
          status: c.effective_status ?? c.status,
          data: ins.date_start,
          investimento,
          impressoes,
          cliques,
          ctr: Number(ctr.toFixed(4)),
          cpc: Number(cpc.toFixed(4)),
          conversoes: conversoesEfetivas,
          cpa: Number(cpa.toFixed(2)),
          receita: conv.receita,
          roas: Number(roas.toFixed(4)),
          raw_jsonb: { ...ins, _split: { purchases: conv.conversoes, leads: conv.leads, receita: conv.receita } },
          sincronizado_em: new Date().toISOString(),
        });
        result.insight_rows++;
      }

      // Linha de "estado atual" (sem insight) — só pra ter campanha visível mesmo sem entrega
      if (insights.length === 0) {
        campSnapRows.push({
          cliente_id: cliente.id,
          plataforma: "meta",
          campanha_id: c.id,
          campanha_nome: c.name,
          objetivo: c.objective,
          status: c.effective_status ?? c.status,
          data: until,
          investimento: 0,
          impressoes: 0,
          cliques: 0,
          conversoes: 0,
          receita: 0,
          raw_jsonb: { no_insights: true, fetched_at: new Date().toISOString() },
          sincronizado_em: new Date().toISOString(),
        });
      }
    }

    if (campSnapRows.length > 0) {
      // Upsert por (cliente_id, plataforma, campanha_id, data)
      const { error } = await supabase
        .schema("trafego_ddg")
        .from("campanhas_snapshot")
        .upsert(campSnapRows, {
          onConflict: "cliente_id,plataforma,campanha_id,data",
        });
      if (error) throw new Error(`campanhas_snapshot: ${error.message}`);
    }

    // ============ 2. ADSETS + insights ============
    const adsetFields = [
      "id",
      "name",
      "status",
      "effective_status",
      "campaign_id",
      `insights.time_range({"since":"${since}","until":"${until}"}).time_increment(1){date_start,spend,impressions,clicks,actions,action_values}`,
    ].join(",");

    const adsets = await fetchAllPages<MetaAdSet>(
      `${META_GRAPH}/${adAcc}/adsets?fields=${adsetFields}&limit=200&access_token=${token}`
    );
    result.adsets = adsets.length;

    const adsetSnapRows: Record<string, unknown>[] = [];
    for (const a of adsets) {
      const insights = a.insights?.data ?? [];
      for (const ins of insights) {
        const conv = extrairConversoes(ins);
        adsetSnapRows.push({
          cliente_id: cliente.id,
          plataforma: "meta",
          campanha_id: a.campaign_id,
          adset_id: a.id,
          adset_nome: a.name,
          status: a.effective_status ?? a.status,
          data: ins.date_start,
          investimento: numero(ins.spend),
          impressoes: numero(ins.impressions),
          cliques: numero(ins.clicks),
          conversoes: conv.conversoes || conv.leads,
          receita: conv.receita,
          raw_jsonb: ins,
        });
      }
    }

    if (adsetSnapRows.length > 0) {
      const { error } = await supabase
        .schema("trafego_ddg")
        .from("adsets_snapshot")
        .upsert(adsetSnapRows, {
          onConflict: "cliente_id,plataforma,adset_id,data",
        });
      if (error) throw new Error(`adsets_snapshot: ${error.message}`);
    }

    // ============ 3. ADS + creative ============
    const adFields = [
      "id",
      "name",
      "status",
      "effective_status",
      "adset_id",
      "creative{id,thumbnail_url,image_url,title,body,call_to_action_type}",
      `insights.time_range({"since":"${since}","until":"${until}"}).time_increment(1){date_start,spend,impressions,clicks,actions,action_values}`,
    ].join(",");

    const ads = await fetchAllPages<MetaAd>(
      `${META_GRAPH}/${adAcc}/ads?fields=${adFields}&limit=200&access_token=${token}`
    );
    result.ads = ads.length;

    const adSnapRows: Record<string, unknown>[] = [];
    for (const ad of ads) {
      const cre = ad.creative;
      const insights = ad.insights?.data ?? [];
      for (const ins of insights) {
        const conv = extrairConversoes(ins);
        adSnapRows.push({
          cliente_id: cliente.id,
          plataforma: "meta",
          adset_id: ad.adset_id,
          ad_id: ad.id,
          ad_nome: ad.name,
          thumbnail_url: cre?.thumbnail_url ?? cre?.image_url ?? null,
          headline: cre?.title ?? null,
          description: cre?.body ?? null,
          cta: cre?.call_to_action_type ?? null,
          status: ad.effective_status ?? ad.status,
          data: ins.date_start,
          investimento: numero(ins.spend),
          impressoes: numero(ins.impressions),
          cliques: numero(ins.clicks),
          conversoes: conv.conversoes || conv.leads,
          receita: conv.receita,
          raw_jsonb: ins,
        });
      }
      // Sempre garante uma linha "atual" pra ad existir mesmo sem entrega
      if (insights.length === 0) {
        adSnapRows.push({
          cliente_id: cliente.id,
          plataforma: "meta",
          adset_id: ad.adset_id,
          ad_id: ad.id,
          ad_nome: ad.name,
          thumbnail_url: cre?.thumbnail_url ?? cre?.image_url ?? null,
          headline: cre?.title ?? null,
          description: cre?.body ?? null,
          cta: cre?.call_to_action_type ?? null,
          status: ad.effective_status ?? ad.status,
          data: until,
          investimento: 0,
          impressoes: 0,
          cliques: 0,
          conversoes: 0,
          receita: 0,
          raw_jsonb: { no_insights: true },
        });
      }
    }

    if (adSnapRows.length > 0) {
      const { error } = await supabase
        .schema("trafego_ddg")
        .from("ads_snapshot")
        .upsert(adSnapRows, {
          onConflict: "cliente_id,plataforma,ad_id,data",
        });
      if (error) throw new Error(`ads_snapshot: ${error.message}`);
    }

    // ============ 4. Atualiza última sync ============
    await supabase
      .schema("trafego_ddg")
      .from("clientes_acessos")
      .update({
        ultima_sync_meta: new Date().toISOString(),
        ultima_sync_status: "success",
        meta_ultimo_erro: null,
      })
      .eq("cliente_id", cliente.id);

    result.ok = true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    result.erro = msg;
    // Marca status_meta como erro se falha grave
    await supabase
      .schema("trafego_ddg")
      .from("clientes_acessos")
      .update({
        ultima_sync_status: "erro",
        meta_ultimo_erro: msg.slice(0, 500),
      })
      .eq("cliente_id", cliente.id);
  }

  result.duration_ms = Date.now() - t0;

  // Log
  await supabase
    .schema("trafego_ddg")
    .from("logs")
    .insert({
      cliente_id: cliente.id,
      acao: "sync_meta",
      entidade: "edge_function",
      payload_jsonb: result,
      sucesso: result.ok,
      erro: result.erro ?? null,
    });

  return result;
}

Deno.serve(async (req) => {
  const t0 = Date.now();

  // Parâmetros opcionais
  let targetClienteId: string | null = null;
  let daysBack = 30;
  try {
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      targetClienteId = body.cliente_id ?? null;
      daysBack = body.days_back ?? 30;
    }
  } catch (_e) {
    // body opcional
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "SUPABASE_URL / SERVICE_ROLE_KEY ausentes" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Busca clientes elegíveis
  let query = supabase
    .schema("trafego_ddg")
    .from("clientes")
    .select(
      `
      id, slug, nome, tipo_negocio,
      acessos:clientes_acessos!inner (
        cliente_id, meta_ad_account_id, meta_long_lived_token, meta_pixel_id, status_meta
      )
    `
    )
    .eq("ativo", true)
    .eq("acessos.status_meta", "conectado");

  if (targetClienteId) query = query.eq("id", targetClienteId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: clientesData, error: clientesErr }: any = await query;

  if (clientesErr) {
    return new Response(
      JSON.stringify({ error: clientesErr.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const results: SyncResult[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const c of (clientesData ?? []) as any[]) {
    const acesso = Array.isArray(c.acessos) ? c.acessos[0] : c.acessos;
    if (!acesso?.meta_ad_account_id || !acesso?.meta_long_lived_token) continue;
    const r = await syncCliente(
      supabase,
      { id: c.id, slug: c.slug, nome: c.nome, tipo_negocio: c.tipo_negocio },
      acesso,
      daysBack
    );
    results.push(r);
  }

  return new Response(
    JSON.stringify(
      {
        status: "ok",
        total_clientes: results.length,
        sucesso: results.filter((r) => r.ok).length,
        falha: results.filter((r) => !r.ok).length,
        duration_ms: Date.now() - t0,
        results,
      },
      null,
      2
    ),
    { headers: { "Content-Type": "application/json" } }
  );
});
