// Supabase Edge Function: dispatcher-sync-insights
// Puxa insights AGREGADOS da Meta por WABA (enviadas, entregues, volume cobrável)
// e grava em disparador.insights_numero (por número, por dia).
//
// Custo em R$ NÃO vem da API (BM cobrado via parceiro/BSP). Calculamos por
// volume_cobravel × RATE_BRL (calibrável pra bater com a fatura do parceiro).
//
// Chamada:
//   POST /functions/v1/dispatcher-sync-insights
//   body opcional: { waba_id?, days?, start?, end? }
//   - waba_id: só um número (senão todos os ativos)
//   - days: janela pra trás (default 30). Backfill: use days maior ou start/end (epoch s)

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const API_VERSION = Deno.env.get("META_API_VERSION") ?? "v25.0";

// Tarifa marketing BR calibrada pelo total que a Meta mostra (R$993,09 / 3.087).
// Ajuste aqui se o parceiro cobrar diferente.
const RATE_BRL = 0.3217;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

interface Conta {
  waba_id: string;
  phone_number_display: string | null;
  display_name: string | null;
  business: { token_vault_key: string } | { token_vault_key: string }[] | null;
}

function epochToDate(sec: number): string {
  return new Date(sec * 1000).toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

async function readToken(name: string): Promise<string> {
  const { data, error } = await supabase.schema("disparador").rpc("get_token", { secret_name: name });
  if (error || !data) throw new Error(`get_token: ${error?.message ?? "vazio"}`);
  return data as unknown as string;
}

async function fetchAnalytics(waba: string, token: string, start: number, end: number) {
  const url = `https://graph.facebook.com/${API_VERSION}/${waba}?fields=analytics.start(${start}).end(${end}).granularity(DAY)&access_token=${token}`;
  const r = await fetch(url);
  const j = await r.json();
  if (!r.ok) throw new Error(`analytics ${r.status}: ${JSON.stringify(j.error ?? j)}`);
  return (j.analytics?.data_points ?? []) as Array<{ start: number; sent: number; delivered: number }>;
}

async function fetchPricing(waba: string, token: string, start: number, end: number) {
  const url = `https://graph.facebook.com/${API_VERSION}/${waba}?fields=pricing_analytics.start(${start}).end(${end}).granularity(DAILY)&access_token=${token}`;
  const r = await fetch(url);
  const j = await r.json();
  if (!r.ok) return []; // pricing pode faltar permissão em algumas contas; não quebra
  const blocks = j.pricing_analytics?.data ?? [];
  const points: Array<{ start: number; volume: number }> = [];
  for (const b of blocks) for (const p of b.data_points ?? []) points.push({ start: p.start, volume: p.volume ?? 0 });
  return points;
}

async function syncWaba(conta: Conta, start: number, end: number) {
  const biz = Array.isArray(conta.business) ? conta.business[0] : conta.business;
  if (!biz?.token_vault_key) throw new Error("sem business/token");
  const token = await readToken(biz.token_vault_key);

  const [analytics, pricing] = await Promise.all([
    fetchAnalytics(conta.waba_id, token, start, end),
    fetchPricing(conta.waba_id, token, start, end),
  ]);

  // Junta por dia
  const porDia = new Map<string, { enviadas: number; entregues: number; volume: number }>();
  for (const a of analytics) {
    const d = epochToDate(a.start);
    const cur = porDia.get(d) ?? { enviadas: 0, entregues: 0, volume: 0 };
    cur.enviadas += a.sent ?? 0;
    cur.entregues += a.delivered ?? 0;
    porDia.set(d, cur);
  }
  for (const p of pricing) {
    const d = epochToDate(p.start);
    const cur = porDia.get(d) ?? { enviadas: 0, entregues: 0, volume: 0 };
    cur.volume += p.volume ?? 0;
    porDia.set(d, cur);
  }

  const rows = [...porDia.entries()]
    .filter(([, v]) => v.enviadas > 0 || v.entregues > 0 || v.volume > 0)
    .map(([periodo, v]) => ({
      waba_id: conta.waba_id,
      phone_number_display: conta.phone_number_display,
      conta_display_name: conta.display_name,
      periodo,
      enviadas: v.enviadas,
      entregues: v.entregues,
      volume_cobravel: v.volume,
      custo_estimado_brl: Math.round(v.volume * RATE_BRL * 100) / 100,
      sync_at: new Date().toISOString(),
    }));

  if (rows.length > 0) {
    const { error } = await supabase
      .schema("disparador")
      .from("insights_numero")
      .upsert(rows, { onConflict: "waba_id,periodo" });
    if (error) throw new Error(error.message);
  }
  return rows.length;
}

Deno.serve(async (req) => {
  let body: { waba_id?: string; days?: number; start?: number; end?: number } = {};
  try { body = req.method === "POST" ? await req.json() : {}; } catch { /* ok */ }

  const end = body.end ?? Math.floor(Date.now() / 1000);
  const start = body.start ?? end - (body.days ?? 30) * 86400;

  const query = supabase
    .schema("disparador")
    .from("contas")
    .select("waba_id, phone_number_display, display_name, business:businesses(token_vault_key)")
    .eq("ativo", true);
  if (body.waba_id) query.eq("waba_id", body.waba_id);

  const { data: contas, error } = await query;
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  // Dedup por waba_id (várias contas podem compartilhar a mesma WABA)
  const vistos = new Set<string>();
  const unicas = (contas as Conta[] ?? []).filter((c) => {
    if (vistos.has(c.waba_id)) return false;
    vistos.add(c.waba_id);
    return true;
  });

  const results: Array<{ waba_id: string; dias: number; error?: string }> = [];
  for (const conta of unicas) {
    try {
      const n = await syncWaba(conta, start, end);
      results.push({ waba_id: conta.waba_id, dias: n });
    } catch (e) {
      results.push({ waba_id: conta.waba_id, dias: 0, error: (e as Error).message });
    }
  }

  return new Response(JSON.stringify({ periodo: { start, end }, numeros: results.length, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
