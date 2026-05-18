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
  components: Array<{ type: string; text?: string }>;
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
  const matches = body.text.match(/\{\{\d+\}\}/g);
  if (!matches) return 0;
  return Math.max(...matches.map((m) => parseInt(m.replace(/\D/g, ""), 10)));
}

async function upsertTemplates(contaId: string, templates: MetaTemplate[]): Promise<number> {
  if (templates.length === 0) return 0;
  const rows = templates.map((t) => ({
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
    ultima_sync_meta: new Date().toISOString(),
  }));

  const { error } = await supabase
    .schema("disparador")
    .from("templates")
    .upsert(rows, { onConflict: "conta_id,name,language" });

  if (error) throw new Error(error.message);
  return rows.length;
}
