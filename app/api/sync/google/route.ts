/**
 * API Route: POST /api/sync/google
 *
 * Sincroniza dados Google Ads pra clientes ativos com OAuth conectado.
 *
 * Triggers:
 *  - pg_cron 4x/dia (08h, 14h, 20h, 02h BRT)
 *  - Botão manual no painel
 *
 * Auth: Bearer token via header `Authorization: Bearer ${SYNC_TOKEN}` OU usuário ADM autenticado.
 *
 * Body opcional:
 *   { cliente_id?: string, days_back?: number (default 30) }
 *
 * Por cliente:
 *  1. Refresh access token usando refresh_token salvo
 *  2. GAQL: campaign + metrics diários
 *  3. GAQL: ad_group + metrics diários
 *  4. GAQL: keyword_view + quality_score
 *  5. GAQL: search_term_view + cost/clicks/conversions
 *  6. Upsert em *_snapshot / search_terms
 *  7. Atualiza ultima_sync_google
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const GOOGLE_DEV_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
const GOOGLE_LOGIN_CUSTOMER_ID = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
const SYNC_TOKEN = process.env.WEBHOOK_HMAC_SECRET; // reusa o secret existente

const GAPI = "https://googleads.googleapis.com/v23";

// ============ HELPERS ============

function dateRange(daysBack: number): { since: string; until: string } {
  const until = new Date();
  const since = new Date(until.getTime() - daysBack * 86400000);
  return {
    since: since.toISOString().split("T")[0],
    until: until.toISOString().split("T")[0],
  };
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
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials missing");
  }
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
    throw new Error(`Refresh token failed: ${res.status} ${err.slice(0, 200)}`);
  }
  const j = (await res.json()) as { access_token: string };
  return j.access_token;
}

interface GAQLResult<T = Record<string, unknown>> {
  results?: T[];
  fieldMask?: string;
  nextPageToken?: string;
}

async function gaql<T = Record<string, unknown>>(params: {
  customerId: string;
  accessToken: string;
  query: string;
}): Promise<T[]> {
  if (!GOOGLE_DEV_TOKEN) throw new Error("GOOGLE_ADS_DEVELOPER_TOKEN missing");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${params.accessToken}`,
    "developer-token": GOOGLE_DEV_TOKEN,
    "Content-Type": "application/json",
  };
  if (GOOGLE_LOGIN_CUSTOMER_ID) {
    headers["login-customer-id"] = GOOGLE_LOGIN_CUSTOMER_ID;
  }

  const all: T[] = [];
  let pageToken: string | undefined;
  let count = 0;
  do {
    const body: Record<string, unknown> = { query: params.query };
    if (pageToken) body.pageToken = pageToken;

    const res = await fetch(
      `${GAPI}/customers/${params.customerId}/googleAds:search`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`GAQL failed: ${res.status} ${err.slice(0, 300)}`);
    }
    const data = (await res.json()) as GAQLResult<T>;
    if (data.results) all.push(...data.results);
    pageToken = data.nextPageToken;
    count++;
  } while (pageToken && count < 20);
  return all;
}

// ============ SYNC ============

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

// Resultado bruto da Google Ads API tem estrutura aninhada
type GoogleCampaignRow = {
  campaign?: {
    id?: string;
    name?: string;
    status?: string;
    advertisingChannelType?: string;
  };
  metrics?: {
    costMicros?: string | number;
    impressions?: string | number;
    clicks?: string | number;
    conversions?: string | number;
    conversionsValue?: string | number;
  };
  segments?: { date?: string };
};

type GoogleAdGroupRow = {
  adGroup?: { id?: string; name?: string; status?: string; campaignId?: string };
  campaign?: { id?: string };
  metrics?: GoogleCampaignRow["metrics"];
  segments?: { date?: string };
};

type GoogleSearchTermRow = {
  searchTermView?: { searchTerm?: string };
  campaign?: { id?: string; name?: string };
  adGroup?: { id?: string };
  metrics?: GoogleCampaignRow["metrics"];
};

async function syncCliente(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  cliente: { id: string; slug: string; nome: string },
  acesso: { google_customer_id: string; google_oauth_refresh_token: string },
  daysBack: number
): Promise<SyncResult> {
  const t0 = Date.now();
  const result: SyncResult = {
    cliente_slug: cliente.slug,
    cliente_nome: cliente.nome,
    ok: false,
    campanhas: 0,
    ad_groups: 0,
    keywords: 0,
    search_terms: 0,
    insight_rows: 0,
    duration_ms: 0,
  };

  try {
    const { since, until } = dateRange(daysBack);
    const customerId = acesso.google_customer_id.replace(/-/g, "");
    const accessToken = await refreshAccessToken(acesso.google_oauth_refresh_token);

    // 1. CAMPANHAS + insights diários
    const campaignsQuery = `
      SELECT
        campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
        metrics.cost_micros, metrics.impressions, metrics.clicks,
        metrics.conversions, metrics.conversions_value,
        segments.date
      FROM campaign
      WHERE segments.date BETWEEN '${since}' AND '${until}'
      ORDER BY segments.date DESC
    `;
    const camps = await gaql<GoogleCampaignRow>({
      customerId,
      accessToken,
      query: campaignsQuery,
    });
    result.insight_rows = camps.length;

    // Conta distinct campaigns
    const distinctCampIds = new Set<string>();
    const campRows: Record<string, unknown>[] = [];
    for (const r of camps) {
      const c = r.campaign;
      const m = r.metrics;
      const s = r.segments;
      if (!c?.id || !s?.date) continue;
      distinctCampIds.add(c.id);

      const investimento = microsToReais(m?.costMicros);
      const impressoes = num(m?.impressions);
      const cliques = num(m?.clicks);
      const conversoes = num(m?.conversions);
      const receita = num(m?.conversionsValue);
      const ctr = impressoes ? (cliques / impressoes) * 100 : 0;
      const cpc = cliques ? investimento / cliques : 0;
      const cpa = conversoes ? investimento / conversoes : 0;
      const roas = investimento ? receita / investimento : 0;

      campRows.push({
        cliente_id: cliente.id,
        plataforma: "google",
        campanha_id: c.id,
        campanha_nome: c.name ?? `Campanha ${c.id}`,
        objetivo: c.advertisingChannelType ?? null,
        status: c.status ?? null,
        data: s.date,
        investimento,
        impressoes,
        cliques,
        ctr: Number(ctr.toFixed(4)),
        cpc: Number(cpc.toFixed(4)),
        conversoes,
        cpa: Number(cpa.toFixed(2)),
        receita,
        roas: Number(roas.toFixed(4)),
        raw_jsonb: r,
        sincronizado_em: new Date().toISOString(),
      });
    }
    result.campanhas = distinctCampIds.size;

    if (campRows.length > 0) {
      const { error } = await supabase
        .schema("trafego_ddg")
        .from("campanhas_snapshot")
        .upsert(campRows, {
          onConflict: "cliente_id,plataforma,campanha_id,data",
        });
      if (error) throw new Error(`campanhas_snapshot: ${error.message}`);
    }

    // 2. AD GROUPS (mapeados como adsets pra compatibilidade)
    const adGroupsQuery = `
      SELECT
        ad_group.id, ad_group.name, ad_group.status, ad_group.campaign,
        campaign.id,
        metrics.cost_micros, metrics.impressions, metrics.clicks,
        metrics.conversions, metrics.conversions_value,
        segments.date
      FROM ad_group
      WHERE segments.date BETWEEN '${since}' AND '${until}'
    `;
    const adgs = await gaql<GoogleAdGroupRow>({
      customerId,
      accessToken,
      query: adGroupsQuery,
    });

    const distinctAg = new Set<string>();
    const agRows: Record<string, unknown>[] = [];
    for (const r of adgs) {
      const ag = r.adGroup;
      const c = r.campaign;
      const m = r.metrics;
      const s = r.segments;
      if (!ag?.id || !s?.date) continue;
      distinctAg.add(ag.id);

      agRows.push({
        cliente_id: cliente.id,
        plataforma: "google",
        campanha_id: c?.id ?? "",
        adset_id: ag.id,
        adset_nome: ag.name ?? `AdGroup ${ag.id}`,
        status: ag.status ?? null,
        data: s.date,
        investimento: microsToReais(m?.costMicros),
        impressoes: num(m?.impressions),
        cliques: num(m?.clicks),
        conversoes: num(m?.conversions),
        receita: num(m?.conversionsValue),
        raw_jsonb: r,
      });
    }
    result.ad_groups = distinctAg.size;

    if (agRows.length > 0) {
      const { error } = await supabase
        .schema("trafego_ddg")
        .from("adsets_snapshot")
        .upsert(agRows, {
          onConflict: "cliente_id,plataforma,adset_id,data",
        });
      if (error) throw new Error(`adsets_snapshot: ${error.message}`);
    }

    // 3. KEYWORDS + Quality Score
    const keywordsQuery = `
      SELECT
        ad_group_criterion.criterion_id, ad_group_criterion.keyword.text,
        ad_group_criterion.keyword.match_type, ad_group_criterion.quality_info.quality_score,
        ad_group.id, campaign.id,
        metrics.cost_micros, metrics.clicks, metrics.conversions,
        segments.date
      FROM keyword_view
      WHERE segments.date BETWEEN '${since}' AND '${until}'
        AND ad_group_criterion.status = 'ENABLED'
    `;
    type KwRow = {
      adGroupCriterion?: {
        criterionId?: string;
        keyword?: { text?: string; matchType?: string };
        qualityInfo?: { qualityScore?: number };
      };
      adGroup?: { id?: string };
      campaign?: { id?: string };
      metrics?: GoogleCampaignRow["metrics"];
      segments?: { date?: string };
    };
    let kws: KwRow[] = [];
    try {
      kws = await gaql<KwRow>({
        customerId,
        accessToken,
        query: keywordsQuery,
      });
    } catch (e) {
      // Algumas contas (Pmax, DSA) não têm keyword_view — ignorar
      console.warn("[sync-google] keyword_view falhou:", String(e).slice(0, 100));
    }

    const distinctKw = new Set<string>();
    const kwRows: Record<string, unknown>[] = [];
    for (const r of kws) {
      const k = r.adGroupCriterion;
      const ag = r.adGroup;
      const c = r.campaign;
      const m = r.metrics;
      const s = r.segments;
      if (!k?.keyword?.text || !s?.date) continue;
      const kwKey = `${c?.id}-${ag?.id}-${k.criterionId}`;
      distinctKw.add(kwKey);

      kwRows.push({
        cliente_id: cliente.id,
        campanha_id: c?.id ?? "",
        adgroup_id: ag?.id ?? null,
        keyword: k.keyword.text,
        match_type: k.keyword.matchType ?? null,
        quality_score: k.qualityInfo?.qualityScore ?? null,
        data: s.date,
        investimento: microsToReais(m?.costMicros),
        cliques: num(m?.clicks),
        conversoes: num(m?.conversions),
      });
    }
    result.keywords = distinctKw.size;

    if (kwRows.length > 0) {
      const { error } = await supabase
        .schema("trafego_ddg")
        .from("keywords_snapshot")
        .upsert(kwRows, {
          onConflict: "cliente_id,campanha_id,keyword,match_type,data",
        });
      if (error) console.warn("[sync-google] keywords_snapshot:", error.message);
    }

    // 4. SEARCH TERMS (agregados pelo período)
    const searchTermsQuery = `
      SELECT
        search_term_view.search_term,
        campaign.id, campaign.name, ad_group.id,
        metrics.cost_micros, metrics.clicks, metrics.conversions
      FROM search_term_view
      WHERE segments.date BETWEEN '${since}' AND '${until}'
        AND metrics.cost_micros > 0
      ORDER BY metrics.cost_micros DESC
      LIMIT 500
    `;
    let sts: GoogleSearchTermRow[] = [];
    try {
      sts = await gaql<GoogleSearchTermRow>({
        customerId,
        accessToken,
        query: searchTermsQuery,
      });
    } catch (e) {
      console.warn("[sync-google] search_term_view falhou:", String(e).slice(0, 100));
    }

    // Agregação por (termo + campanha + adgroup) — sum entre datas
    const stMap = new Map<
      string,
      {
        termo: string;
        campanha_id: string;
        adgroup_id: string | null;
        gasto: number;
        cliques: number;
        conversoes: number;
      }
    >();
    for (const r of sts) {
      const termo = r.searchTermView?.searchTerm;
      const c = r.campaign;
      const ag = r.adGroup;
      const m = r.metrics;
      if (!termo || !c?.id) continue;
      const key = `${termo}|${c.id}|${ag?.id ?? ""}`;
      const prev = stMap.get(key) ?? {
        termo,
        campanha_id: c.id,
        adgroup_id: ag?.id ?? null,
        gasto: 0,
        cliques: 0,
        conversoes: 0,
      };
      prev.gasto += microsToReais(m?.costMicros);
      prev.cliques += num(m?.clicks);
      prev.conversoes += num(m?.conversions);
      stMap.set(key, prev);
    }
    const stRows = Array.from(stMap.values()).map((s) => ({
      cliente_id: cliente.id,
      termo: s.termo,
      campanha_id: s.campanha_id,
      adgroup_id: s.adgroup_id,
      gasto_total: s.gasto,
      cliques_total: s.cliques,
      conversoes_total: s.conversoes,
      ultimo_visto: until,
      primeiro_visto: since,
    }));
    result.search_terms = stRows.length;

    if (stRows.length > 0) {
      const { error } = await supabase
        .schema("trafego_ddg")
        .from("search_terms")
        .upsert(stRows, {
          onConflict: "cliente_id,termo,campanha_id",
        });
      if (error) console.warn("[sync-google] search_terms:", error.message);
    }

    // 5. Atualiza última sync
    await supabase
      .schema("trafego_ddg")
      .from("clientes_acessos")
      .update({
        ultima_sync_google: new Date().toISOString(),
        ultima_sync_status: "success",
        google_ultimo_erro: null,
      })
      .eq("cliente_id", cliente.id);

    result.ok = true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    result.erro = msg;
    await supabase
      .schema("trafego_ddg")
      .from("clientes_acessos")
      .update({
        ultima_sync_status: "erro",
        google_ultimo_erro: msg.slice(0, 500),
      })
      .eq("cliente_id", cliente.id);
  }

  result.duration_ms = Date.now() - t0;

  await supabase
    .schema("trafego_ddg")
    .from("logs")
    .insert({
      cliente_id: cliente.id,
      acao: "sync_google",
      entidade: "api_route",
      payload_jsonb: result,
      sucesso: result.ok,
      erro: result.erro ?? null,
    });

  return result;
}

// ============ HANDLER ============

export async function POST(req: NextRequest) {
  const t0 = Date.now();

  // Auth: aceita bearer token OU usuário logado ADM
  const authHeader = req.headers.get("authorization") ?? "";
  const bearerToken = authHeader.replace(/^Bearer\s+/i, "");
  const tokenOk = SYNC_TOKEN && bearerToken === SYNC_TOKEN;

  if (!tokenOk) {
    return NextResponse.json(
      { error: "Unauthorized — pass Authorization: Bearer <SYNC_TOKEN>" },
      { status: 401 }
    );
  }

  let targetClienteId: string | null = null;
  let daysBack = 30;
  try {
    const body = await req.json().catch(() => ({}));
    targetClienteId = body?.cliente_id ?? null;
    daysBack = body?.days_back ?? 30;
  } catch {
    // ok
  }

  const supabase = createAdminClient();

  // Busca clientes elegíveis
  let query = supabase
    .schema("trafego_ddg")
    .from("clientes")
    .select(
      `
      id, slug, nome,
      acessos:clientes_acessos!inner (
        cliente_id, google_customer_id, google_oauth_refresh_token, status_google
      )
    `
    )
    .eq("ativo", true)
    .eq("acessos.status_google", "conectado");

  if (targetClienteId) query = query.eq("id", targetClienteId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: clientesData, error: clientesErr }: any = await query;

  if (clientesErr) {
    return NextResponse.json(
      { error: clientesErr.message },
      { status: 500 }
    );
  }

  const results: SyncResult[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const c of (clientesData ?? []) as any[]) {
    const acesso = Array.isArray(c.acessos) ? c.acessos[0] : c.acessos;
    if (!acesso?.google_customer_id || !acesso?.google_oauth_refresh_token)
      continue;
    const r = await syncCliente(
      supabase,
      { id: c.id, slug: c.slug, nome: c.nome },
      acesso,
      daysBack
    );
    results.push(r);
  }

  return NextResponse.json({
    status: "ok",
    total_clientes: results.length,
    sucesso: results.filter((r) => r.ok).length,
    falha: results.filter((r) => !r.ok).length,
    duration_ms: Date.now() - t0,
    results,
  });
}

// GET retorna info do endpoint (útil pra validar deploy)
export async function GET() {
  return NextResponse.json({
    endpoint: "Google Ads Sync",
    method: "POST",
    auth: "Bearer SYNC_TOKEN (= WEBHOOK_HMAC_SECRET)",
    body: { cliente_id: "optional uuid", days_back: "optional number, default 30" },
    description: "Sincroniza campanhas, ad_groups, keywords e search_terms do Google Ads",
  });
}
