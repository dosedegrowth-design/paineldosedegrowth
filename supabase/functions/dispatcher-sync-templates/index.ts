// Supabase Edge Function: dispatcher-sync-templates
// Pull diario dos templates Meta -> disparador.templates
//
// Trigger: pg_cron diario OU chamada manual via API:
//   POST /functions/v1/dispatcher-sync-templates  { conta_id?: string }
// (sem conta_id, sincroniza todas as contas ativas)

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const API_VERSION = Deno.env.get("META_API_VERSION") ?? "v25.0";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

interface MetaTemplate {
  id: string;
  name: string;
  language: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  status: "PENDING" | "APPROVED" | "REJECTED" | "DISABLED" | "PAUSED";
  components: Array<{
    type: string;
    text?: string;
    format?: string;
    example?: { header_handle?: string[]; header_url?: string[] };
  }>;
  quality_score?: { score?: string };
  rejected_reason?: string;
}

interface Conta {
  id: string;
  waba_id: string;
  token_vault_key: string;
}

Deno.serve(async (req) => {
  let body: { conta_id?: string } = {};
  try {
    body = req.method === "POST" ? await req.json() : {};
  } catch { /* ignore */ }

  // Pega contas ativas
  const query = supabase
    .schema("disparador")
    .from("contas")
    .select("id, waba_id, token_vault_key")
    .eq("ativo", true);

  if (body.conta_id) query.eq("id", body.conta_id);

  const { data: contas, error: contasErr } = await query;
  if (contasErr) {
    return new Response(JSON.stringify({ error: contasErr.message }), { status: 500 });
  }
  if (!contas || contas.length === 0) {
    return new Response(JSON.stringify({ synced: 0, message: "Nenhuma conta ativa" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const results: Array<{ conta_id: string; templates: number; error?: string }> = [];

  for (const conta of contas as Conta[]) {
    try {
      const token = await readToken(conta.token_vault_key);
      const fetched = await fetchTemplates(conta.waba_id, token);
      const upserted = await upsertTemplates(conta.id, fetched);
      results.push({ conta_id: conta.id, templates: upserted });
    } catch (e) {
      results.push({ conta_id: conta.id, templates: 0, error: (e as Error).message });
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { "Content-Type": "application/json" },
  });
});

async function readToken(name: string): Promise<string> {
  const { data, error } = await supabase
    .schema("vault" as never)
    .from("decrypted_secrets")
    .select("decrypted_secret")
    .eq("name", name)
    .single();
  if (error || !data) throw new Error(`Vault read "${name}": ${error?.message}`);
  return (data as { decrypted_secret: string }).decrypted_secret;
}

async function fetchTemplates(wabaId: string, token: string): Promise<MetaTemplate[]> {
  const url = `https://graph.facebook.com/${API_VERSION}/${wabaId}/message_templates?limit=200`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Meta API ${res.status}: ${await res.text()}`);
  const json = await res.json() as { data: MetaTemplate[] };
  return json.data ?? [];
}

function countBodyVars(components: MetaTemplate["components"]): number {
  const body = components.find((c) => c.type === "BODY");
  if (!body?.text) return 0;
  // conta apenas variáveis POSICIONAIS ({{1}}). Nomeadas ({{nome}}) são
  // derivadas dos components na hora do envio, não por esse contador.
  const matches = body.text.match(/\{\{\d+\}\}/g);
  if (!matches) return 0;
  return Math.max(...matches.map((m) => parseInt(m.replace(/\D/g, ""), 10)));
}

const STORAGE_MARKER = "/storage/v1/object/public/disparador-media/";

/**
 * Templates com header IMAGE/VIDEO/DOCUMENT exigem a mídia em TODO envio.
 * A URL de exemplo da Meta (scontent.whatsapp.net) expira, então baixamos
 * uma vez e re-hospedamos no Storage (bucket público disparador-media).
 * Retorna { url, type } ou null.
 */
async function ensureHeaderMedia(
  contaId: string,
  t: MetaTemplate,
  existingUrl: string | null | undefined,
): Promise<{ url: string; type: string } | null> {
  const header = t.components.find((c) => c.type === "HEADER");
  const fmt = (header?.format ?? "TEXT").toUpperCase();
  if (fmt !== "IMAGE" && fmt !== "VIDEO" && fmt !== "DOCUMENT") return null;

  // Já re-hospedado antes -> reaproveita (não baixa de novo toda sync)
  if (existingUrl && existingUrl.includes(STORAGE_MARKER)) {
    return { url: existingUrl, type: fmt };
  }

  const srcUrl = header?.example?.header_handle?.[0] ?? header?.example?.header_url?.[0];
  if (!srcUrl) return null;

  try {
    const res = await fetch(srcUrl);
    if (!res.ok) throw new Error(`download ${res.status}`);
    const contentType = res.headers.get("content-type") ?? "application/octet-stream";
    const buf = new Uint8Array(await res.arrayBuffer());
    const ext = fmt === "IMAGE" ? "jpg" : fmt === "VIDEO" ? "mp4" : "pdf";
    const path = `${contaId}/tmpl-${t.id}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("disparador-media")
      .upload(path, buf, { contentType, upsert: true });
    if (upErr) throw new Error(upErr.message);

    const { data: pub } = supabase.storage.from("disparador-media").getPublicUrl(path);
    return { url: pub.publicUrl, type: fmt };
  } catch (e) {
    console.error(`ensureHeaderMedia falhou (${t.name}):`, (e as Error).message);
    return null;
  }
}

async function upsertTemplates(contaId: string, templates: MetaTemplate[]): Promise<number> {
  if (templates.length === 0) return 0;

  // URLs de mídia já salvas (pra não re-baixar toda sync)
  const { data: existing } = await supabase
    .schema("disparador")
    .from("templates")
    .select("name, language, header_media_url")
    .eq("conta_id", contaId);
  const existingMap = new Map<string, string | null>(
    (existing ?? []).map((r: { name: string; language: string; header_media_url: string | null }) =>
      [`${r.name}|${r.language}`, r.header_media_url]),
  );

  const rows = [];
  for (const t of templates) {
    const media = await ensureHeaderMedia(contaId, t, existingMap.get(`${t.name}|${t.language}`));
    rows.push({
      conta_id: contaId,
      meta_id: t.id,
      name: t.name,
      language: t.language,
      category: t.category,
      status: t.status,
      components: t.components,
      variables_count: countBodyVars(t.components),
      rejection_reason: t.rejected_reason ?? null,
      quality_score: t.quality_score?.score ?? null,
      header_media_url: media?.url ?? null,
      header_media_type: media?.type ?? null,
      ultima_sync_meta: new Date().toISOString(),
    });
  }

  const { error } = await supabase
    .schema("disparador")
    .from("templates")
    .upsert(rows, { onConflict: "conta_id,name,language" });

  if (error) throw new Error(error.message);
  return rows.length;
}
