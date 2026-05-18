// Edge Function: dispatcher-sync-wabas (v4)
// Sincroniza WABAs + Phone Numbers do Meta BM para disparador.contas
//
// IMPORTANTE: preserva flag 'ativo' das contas existentes (separa INSERT de UPDATE)
//
// POST /functions/v1/dispatcher-sync-wabas { business_id?: uuid }

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const API_VERSION = Deno.env.get("META_API_VERSION") ?? "v25.0";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

interface Business { id: string; meta_business_id: string; token_vault_key: string; display_name: string }
interface MetaWaba { id: string; name: string }
interface MetaPhone {
  id: string; display_phone_number: string; verified_name: string;
  quality_rating?: string; messaging_limit_tier?: string;
}
interface ContaRow {
  business_id: string; waba_id: string; phone_number_id: string;
  display_name: string; waba_name: string; phone_number_display: string;
  tier: string; quality_rating: string; origem: "OWNED" | "CLIENT";
  ultima_sync_meta: string;
}

Deno.serve(async (req) => {
  let body: { business_id?: string } = {};
  try { body = req.method === "POST" ? await req.json() : {}; } catch { /* ok */ }

  const q = supabase.schema("disparador").from("businesses")
    .select("id, meta_business_id, token_vault_key, display_name")
    .eq("ativo", true);
  if (body.business_id) q.eq("id", body.business_id);
  const { data: businesses, error } = await q;

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  if (!businesses?.length) {
    return new Response(JSON.stringify({ synced: 0 }), { headers: { "Content-Type": "application/json" } });
  }

  const results = [];
  for (const biz of businesses as Business[]) {
    results.push(await syncBusiness(biz));
  }
  return new Response(JSON.stringify({ results }), { headers: { "Content-Type": "application/json" } });
});

async function syncBusiness(biz: Business) {
  const errors: string[] = [];
  let wabasCount = 0;
  let inserted = 0;
  let updated = 0;

  try {
    const { data: tokenResp, error: tokenErr } = await supabase
      .schema("disparador").rpc("get_token", { secret_name: biz.token_vault_key });
    if (tokenErr || !tokenResp) throw new Error(`get_token: ${tokenErr?.message ?? "vazio"}`);
    const token = tokenResp as unknown as string;

    const ownedWabas = await fetchWabas(biz.meta_business_id, token, "owned");
    const clientWabas = await fetchWabas(biz.meta_business_id, token, "client");
    wabasCount = ownedWabas.length + clientWabas.length;

    // Existentes pra este BM
    const { data: existentes } = await supabase
      .schema("disparador").from("contas")
      .select("id, waba_id, phone_number_id")
      .eq("business_id", biz.id);
    const existMap = new Map<string, string>();
    for (const c of (existentes ?? []) as Array<{ id: string; waba_id: string; phone_number_id: string }>) {
      existMap.set(`${c.waba_id}|${c.phone_number_id}`, c.id);
    }

    const allFromMeta: ContaRow[] = [];
    for (const w of ownedWabas) {
      const phones = await fetchPhoneNumbers(w.id, token).catch((e) => { errors.push(`owned ${w.name}: ${e.message}`); return []; });
      for (const p of phones) allFromMeta.push(toRow(biz.id, w, p, "OWNED"));
    }
    for (const w of clientWabas) {
      const phones = await fetchPhoneNumbers(w.id, token).catch((e) => { errors.push(`client ${w.name}: ${e.message}`); return []; });
      for (const p of phones) allFromMeta.push(toRow(biz.id, w, p, "CLIENT"));
    }

    const novas = allFromMeta.filter((r) => !existMap.has(`${r.waba_id}|${r.phone_number_id}`));
    const atualizar = allFromMeta.filter((r) => existMap.has(`${r.waba_id}|${r.phone_number_id}`));

    if (novas.length > 0) {
      const { error: insErr } = await supabase.schema("disparador").from("contas")
        .insert(novas.map((r) => ({ ...r, ativo: false })));
      if (insErr) errors.push(`insert: ${insErr.message}`);
      else inserted = novas.length;
    }

    for (const r of atualizar) {
      const id = existMap.get(`${r.waba_id}|${r.phone_number_id}`)!;
      const { error: updErr } = await supabase.schema("disparador").from("contas")
        .update({
          display_name: r.display_name,
          waba_name: r.waba_name,
          phone_number_display: r.phone_number_display,
          tier: r.tier,
          quality_rating: r.quality_rating,
          origem: r.origem,
          ultima_sync_meta: r.ultima_sync_meta,
        })
        .eq("id", id);
      if (updErr) errors.push(`update ${r.waba_name}: ${updErr.message}`);
      else updated++;
    }

    await supabase.schema("disparador").from("businesses")
      .update({ ultima_sync_meta: new Date().toISOString() })
      .eq("id", biz.id);

  } catch (e) {
    errors.push((e as Error).message);
  }

  return { business_id: biz.id, wabas: wabasCount, inserted, updated, errors };
}

async function fetchWabas(bmId: string, token: string, type: "owned" | "client"): Promise<MetaWaba[]> {
  const endpoint = type === "owned" ? "owned_whatsapp_business_accounts" : "client_whatsapp_business_accounts";
  const all: MetaWaba[] = [];
  let url: string | null = `https://graph.facebook.com/${API_VERSION}/${bmId}/${endpoint}?fields=id,name&limit=100`;
  while (url) {
    const res: Response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`fetchWabas ${type} ${res.status}: ${await res.text()}`);
    const json: { data?: MetaWaba[]; paging?: { next?: string } } = await res.json();
    all.push(...(json.data ?? []));
    url = json.paging?.next ?? null;
  }
  return all;
}

async function fetchPhoneNumbers(wabaId: string, token: string): Promise<MetaPhone[]> {
  const url = `https://graph.facebook.com/${API_VERSION}/${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,messaging_limit_tier&limit=100`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`fetchPhones ${res.status}: ${await res.text()}`);
  const json = await res.json() as { data?: MetaPhone[] };
  return json.data ?? [];
}

function toRow(businessUuid: string, w: MetaWaba, p: MetaPhone, origem: "OWNED" | "CLIENT"): ContaRow {
  return {
    business_id: businessUuid,
    waba_id: w.id,
    phone_number_id: p.id,
    display_name: p.verified_name ?? w.name,
    waba_name: w.name,
    phone_number_display: p.display_phone_number,
    tier: (p.messaging_limit_tier ?? "TIER_1K").toUpperCase(),
    quality_rating: (p.quality_rating ?? "UNKNOWN").toUpperCase(),
    origem,
    ultima_sync_meta: new Date().toISOString(),
  };
}
