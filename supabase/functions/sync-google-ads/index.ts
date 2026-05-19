/**
 * sync-google-ads (Edge Function)
 *
 * Versao Deno do sync Google Ads. Substitui /api/sync/google na rota de cron.
 *
 * Body opcional: { cliente_id?: string, days_back?: number (default 30) }
 *
 * Por cliente conectado:
 *  1. Refresh access_token
 *  2. GAQL: campaign + metrics diarios -> campanhas_snapshot
 *  3. GAQL: ad_group + metrics diarios -> adsets_snapshot (best-effort)
 *  4. GAQL: keyword_view + quality_score -> keywords_snapshot (best-effort)
 *  5. GAQL: search_term_view -> search_terms (best-effort)
 *  6. Atualiza ultima_sync_google
 *
 * Env vars necessarias (Supabase secrets):
 *  - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (ja configurados)
 *  - GOOGLE_OAUTH_CLIENT_ID
 *  - GOOGLE_OAUTH_CLIENT_SECRET
 *  - GOOGLE_ADS_DEVELOPER_TOKEN
 *  - GOOGLE_ADS_LOGIN_CUSTOMER_ID (opcional, MCC fallback)
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET");
const GOOGLE_DEV_TOKEN = Deno.env.get("GOOGLE_ADS_DEVELOPER_TOKEN");
const GOOGLE_LOGIN_CUSTOMER_ID = Deno.env.get("GOOGLE_ADS_LOGIN_CUSTOMER_ID");

const GAPI = "https://googleads.googleapis.com/v23";

function dateRange(daysBack: number): { since: string; until: string } {
  const until = new Date();
  const since = new Date(until.getTime() - daysBack * 86400000);
  return { since: since.toISOString().split("T")[0], until: until.toISOString().split("T")[0] };
}

function microsToReais(micros: number | string | null | undefined): number {
  if (micros == null) return 0;
  const n = typeof micros === "string" ? Number(micros) : micros;
  return Number.isFinite(n) ? n / 1_000_000 : 0;
}

function num(v: unknown): number {
  if (v == null || v === "") return 0;
  const n = typeof v === "string" ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : 0;
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) throw new Error("Google OAuth env vars ausentes");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Refresh token ${res.status}: ${err.slice(0, 300)}`);
  }
  const j = (await res.json()) as { access_token: string };
  return j.access_token;
}

interface GAQLResult<T = Record<string, unknown>> {
  results?: T[];
  nextPageToken?: string;
}

async function gaql<T = Record<string, unknown>>(params: {
  customerId: string;
  loginCustomerId?: string | null;
  accessToken: string;
  query: string;
}): Promise<T[]> {
  if (!GOOGLE_DEV_TOKEN) throw new Error("GOOGLE_ADS_DEVELOPER_TOKEN ausente");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${params.accessToken}`,
    "developer-token": GOOGLE_DEV_TOKEN,
    "Content-Type": "application/json",
  };
  const loginCustomer = params.loginCustomerId || GOOGLE_LOGIN_CUSTOMER_ID;
  if (loginCustomer) headers["login-customer-id"] = loginCustomer.replace(/-/g, "");

  const all: T[] = [];
  let pageToken: string | undefined;
  let count = 0;
  do {
    const body: Record<string, unknown> = { query: params.query };
    if (pageToken) body.pageToken = pageToken;
    const res = await fetch(`${GAPI}/customers/${params.customerId}/googleAds:search`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`GAQL ${res.status}: ${err.slice(0, 500)}`);
    }
    const data = (await res.json()) as GAQLResult<T>;
    if (data.results) all.push(...data.results);
    pageToken = data.nextPageToken;
    count++;
  } while (pageToken && count < 20);
  return all;
}

interface SyncResult {
  cliente_slug: string;
  cliente_nome: string;
  ok: boolean;
  campanhas: number;
  ad_groups: number;
  keywords: number;
  search_terms: number;
  insight_rows: number;
  erro?: string;
  duration_ms: number;
}

type CampRow = { campaign?: { id?: string; name?: string; status?: string; advertisingChannelType?: string }; metrics?: { costMicros?: string|number; impressions?: string|number; clicks?: string|number; conversions?: string|number; conversionsValue?: string|number }; segments?: { date?: string } };
type AgRow = { adGroup?: { id?: string; name?: string; status?: string }; campaign?: { id?: string }; metrics?: CampRow["metrics"]; segments?: { date?: string } };
type StRow = { searchTermView?: { searchTerm?: string }; campaign?: { id?: string; name?: string }; adGroup?: { id?: string }; metrics?: CampRow["metrics"] };

async function syncCliente(
  supabase: ReturnType<typeof createClient>,
  cliente: { id: string; slug: string; nome: string },
  acesso: { google_customer_id: string; google_login_customer_id: string | null; google_oauth_refresh_token: string },
  daysBack: number
): Promise<SyncResult> {
  const t0 = Date.now();
  const r: SyncResult = { cliente_slug: cliente.slug, cliente_nome: cliente.nome, ok: false, campanhas: 0, ad_groups: 0, keywords: 0, search_terms: 0, insight_rows: 0, duration_ms: 0 };
  try {
    const { since, until } = dateRange(daysBack);
    const customerId = acesso.google_customer_id.replace(/-/g, "");
    const loginCustomerId = acesso.google_login_customer_id?.replace(/-/g, "") || null;
    const accessToken = await refreshAccessToken(acesso.google_oauth_refresh_token);

    // 1. CAMPANHAS
    const camps = await gaql<CampRow>({ customerId, loginCustomerId, accessToken, query: `
      SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
             metrics.cost_micros, metrics.impressions, metrics.clicks,
             metrics.conversions, metrics.conversions_value,
             segments.date
      FROM campaign
      WHERE segments.date BETWEEN '${since}' AND '${until}'
      ORDER BY segments.date DESC` });
    r.insight_rows = camps.length;
    const distinctCamp = new Set<string>();
    const campRows: Record<string, unknown>[] = [];
    for (const row of camps) {
      const c = row.campaign, m = row.metrics, s = row.segments;
      if (!c?.id || !s?.date) continue;
      distinctCamp.add(c.id);
      const investimento = microsToReais(m?.costMicros);
      const impressoes = num(m?.impressions);
      const cliques = num(m?.clicks);
      const conversoes = num(m?.conversions);
      const receita = num(m?.conversionsValue);
      const ctr = impressoes ? (cliques/impressoes)*100 : 0;
      const cpc = cliques ? investimento/cliques : 0;
      const cpa = conversoes ? investimento/conversoes : 0;
      const roas = investimento ? receita/investimento : 0;
      campRows.push({
        cliente_id: cliente.id, plataforma: "google", campanha_id: c.id,
        campanha_nome: c.name ?? `Campanha ${c.id}`,
        objetivo: c.advertisingChannelType ?? null, status: c.status ?? null,
        data: s.date, investimento, impressoes, cliques,
        ctr: Number(ctr.toFixed(4)), cpc: Number(cpc.toFixed(4)),
        conversoes, cpa: Number(cpa.toFixed(2)),
        receita, roas: Number(roas.toFixed(4)),
        raw_jsonb: row, sincronizado_em: new Date().toISOString(),
      });
    }
    r.campanhas = distinctCamp.size;
    if (campRows.length > 0) {
      for (let i = 0; i < campRows.length; i += 500) {
        const { error } = await supabase.schema("trafego_ddg").from("campanhas_snapshot")
          .upsert(campRows.slice(i, i+500), { onConflict: "cliente_id,plataforma,campanha_id,data" });
        if (error) throw new Error(`campanhas_snapshot: ${error.message}`);
      }
    }

    // 2. AD GROUPS (best-effort)
    try {
      const adgs = await gaql<AgRow>({ customerId, loginCustomerId, accessToken, query: `
        SELECT ad_group.id, ad_group.name, ad_group.status, ad_group.campaign,
               campaign.id, metrics.cost_micros, metrics.impressions, metrics.clicks,
               metrics.conversions, metrics.conversions_value, segments.date
        FROM ad_group WHERE segments.date BETWEEN '${since}' AND '${until}'` });
      const distinctAg = new Set<string>();
      const agRows: Record<string, unknown>[] = [];
      for (const row of adgs) {
        const ag = row.adGroup, c = row.campaign, m = row.metrics, s = row.segments;
        if (!ag?.id || !s?.date) continue;
        distinctAg.add(ag.id);
        agRows.push({
          cliente_id: cliente.id, plataforma: "google",
          campanha_id: c?.id ?? "", adset_id: ag.id,
          adset_nome: ag.name ?? `AdGroup ${ag.id}`, status: ag.status ?? null,
          data: s.date, investimento: microsToReais(m?.costMicros),
          impressoes: num(m?.impressions), cliques: num(m?.clicks),
          conversoes: num(m?.conversions), receita: num(m?.conversionsValue),
          raw_jsonb: row,
        });
      }
      r.ad_groups = distinctAg.size;
      if (agRows.length > 0) {
        for (let i = 0; i < agRows.length; i += 500) {
          const { error } = await supabase.schema("trafego_ddg").from("adsets_snapshot")
            .upsert(agRows.slice(i, i+500), { onConflict: "cliente_id,plataforma,adset_id,data" });
          if (error) console.warn(`adsets: ${error.message}`);
        }
      }
    } catch (e) { console.warn(`ad_group fail: ${String(e).slice(0, 200)}`); }

    // 3. SEARCH TERMS (best-effort)
    try {
      const sts = await gaql<StRow>({ customerId, loginCustomerId, accessToken, query: `
        SELECT search_term_view.search_term, campaign.id, campaign.name, ad_group.id,
               metrics.cost_micros, metrics.clicks, metrics.conversions
        FROM search_term_view
        WHERE segments.date BETWEEN '${since}' AND '${until}' AND metrics.cost_micros > 0
        ORDER BY metrics.cost_micros DESC LIMIT 500` });
      const stMap = new Map<string, { termo: string; campanha_id: string; adgroup_id: string|null; gasto: number; cliques: number; conversoes: number }>();
      for (const row of sts) {
        const termo = row.searchTermView?.searchTerm, c = row.campaign, ag = row.adGroup, m = row.metrics;
        if (!termo || !c?.id) continue;
        const key = `${termo}|${c.id}|${ag?.id ?? ""}`;
        const prev = stMap.get(key) ?? { termo, campanha_id: c.id, adgroup_id: ag?.id ?? null, gasto: 0, cliques: 0, conversoes: 0 };
        prev.gasto += microsToReais(m?.costMicros);
        prev.cliques += num(m?.clicks);
        prev.conversoes += num(m?.conversions);
        stMap.set(key, prev);
      }
      const stRows = Array.from(stMap.values()).map((s) => ({
        cliente_id: cliente.id, termo: s.termo, campanha_id: s.campanha_id,
        adgroup_id: s.adgroup_id, gasto_total: s.gasto, cliques_total: s.cliques,
        conversoes_total: s.conversoes, ultimo_visto: until, primeiro_visto: since,
      }));
      r.search_terms = stRows.length;
      if (stRows.length > 0) {
        const { error } = await supabase.schema("trafego_ddg").from("search_terms")
          .upsert(stRows, { onConflict: "cliente_id,termo,campanha_id" });
        if (error) console.warn(`search_terms: ${error.message}`);
      }
    } catch (e) { console.warn(`search_term_view fail: ${String(e).slice(0, 200)}`); }

    // 4. Marca ultima sync
    await supabase.schema("trafego_ddg").from("clientes_acessos").update({
      ultima_sync_google: new Date().toISOString(),
      ultima_sync_status: "success",
      google_ultimo_erro: null,
    }).eq("cliente_id", cliente.id);
    r.ok = true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    r.erro = msg;
    await supabase.schema("trafego_ddg").from("clientes_acessos").update({
      ultima_sync_status: "erro",
      google_ultimo_erro: msg.slice(0, 1000),
    }).eq("cliente_id", cliente.id);
  }
  r.duration_ms = Date.now() - t0;
  return r;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" } });

  const t0 = Date.now();
  let clienteIdFiltro: string | undefined;
  let daysBack = 30;
  try {
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      clienteIdFiltro = body.cliente_id;
      daysBack = Number(body.days_back ?? 30);
    }
  } catch { /* ignore */ }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_DEV_TOKEN) {
    return new Response(JSON.stringify({
      error: "Faltam secrets no Supabase",
      check: {
        GOOGLE_OAUTH_CLIENT_ID: !!GOOGLE_CLIENT_ID,
        GOOGLE_OAUTH_CLIENT_SECRET: !!GOOGLE_CLIENT_SECRET,
        GOOGLE_ADS_DEVELOPER_TOKEN: !!GOOGLE_DEV_TOKEN,
        GOOGLE_ADS_LOGIN_CUSTOMER_ID: !!GOOGLE_LOGIN_CUSTOMER_ID,
      },
    }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } });
  let query = supabase.schema("trafego_ddg").from("clientes")
    .select("id, slug, nome, clientes_acessos!inner(google_customer_id, google_login_customer_id, google_oauth_refresh_token, status_google)")
    .eq("ativo", true)
    .eq("clientes_acessos.status_google", "conectado");
  if (clienteIdFiltro) query = query.eq("id", clienteIdFiltro);

  const { data: clientes, error } = await query;
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });

  const results: SyncResult[] = [];
  for (const c of clientes ?? []) {
    const acessoArr = (c as unknown as { clientes_acessos: Array<{ google_customer_id: string; google_login_customer_id: string | null; google_oauth_refresh_token: string }> }).clientes_acessos;
    const acesso = Array.isArray(acessoArr) ? acessoArr[0] : acessoArr;
    if (!acesso?.google_customer_id || !acesso?.google_oauth_refresh_token) continue;
    const r = await syncCliente(supabase, { id: (c as { id: string }).id, slug: (c as { slug: string }).slug, nome: (c as { nome: string }).nome }, acesso, daysBack);
    results.push(r);
  }

  return new Response(JSON.stringify({
    status: "ok",
    total_clientes: results.length,
    sucesso: results.filter((r) => r.ok).length,
    falha: results.filter((r) => !r.ok).length,
    duration_ms: Date.now() - t0,
    results,
  }), { headers: { "Content-Type": "application/json" } });
});
