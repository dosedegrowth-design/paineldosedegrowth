// Edge Function: dispatcher-trigger-scheduled (v6)
// Roda via pg_cron a cada minuto.
// 1) Pega campanhas 'scheduled' cujo horario ja passou -> dispara
// 2) Pega campanhas 'running' com envios pending e sem atividade ha >3min
//    (= Edge Function bateu timeout e parou no meio) -> re-dispara

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FIRE_URL = `${SUPABASE_URL}/functions/v1/dispatcher-fire-campanha`;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

Deno.serve(async () => {
  const now = new Date().toISOString();
  const results: Array<{ id: string; nome: string; tipo: string; ok: boolean; detail?: string }> = [];

  // (1) Campanhas SCHEDULED cujo horario passou
  const { data: scheduledCampanhas } = await supabase
    .schema("disparador")
    .from("campanhas")
    .select("id, nome, scheduled_at")
    .eq("status", "scheduled")
    .lte("scheduled_at", now);

  for (const c of (scheduledCampanhas ?? []) as Array<{ id: string; nome: string }>) {
    const { data: locked } = await supabase
      .schema("disparador")
      .from("campanhas")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", c.id)
      .eq("status", "scheduled")
      .select("id")
      .single();
    if (!locked) continue;

    fireCampanha(c.id).catch((e) => {
      results.push({ id: c.id, nome: c.nome, tipo: "scheduled", ok: false, detail: e.message });
    });
    results.push({ id: c.id, nome: c.nome, tipo: "scheduled", ok: true });
  }

  // (2) Campanhas RUNNING com envios pending e sem atividade ha >3min
  //     (Edge Function deve ter batido timeout 5min)
  const cutoffDate = new Date(Date.now() - 3 * 60 * 1000).toISOString();
  const { data: stuckCampanhas } = await supabase
    .schema("disparador")
    .from("campanhas")
    .select("id, nome, started_at, atualizado_em")
    .eq("status", "running")
    .lte("atualizado_em", cutoffDate);

  for (const c of (stuckCampanhas ?? []) as Array<{ id: string; nome: string }>) {
    // Confere se tem envios pending
    const { count } = await supabase
      .schema("disparador")
      .from("envios")
      .select("id", { count: "exact", head: true })
      .eq("campanha_id", c.id)
      .eq("status", "pending");

    if (!count || count === 0) continue;

    // Toca atualizado_em pra evitar re-disparar no proximo cron antes da Edge terminar
    await supabase
      .schema("disparador")
      .from("campanhas")
      .update({ atualizado_em: new Date().toISOString() })
      .eq("id", c.id);

    fireCampanha(c.id).catch((e) => {
      results.push({ id: c.id, nome: c.nome, tipo: "resumo", ok: false, detail: e.message });
    });
    results.push({ id: c.id, nome: c.nome, tipo: "resumo", ok: true, detail: `${count} pendentes` });
  }

  return new Response(JSON.stringify({ triggered: results.length, results, ts: now }), {
    headers: { "Content-Type": "application/json" },
  });
});

// Fire-and-forget: chama Edge Function sem esperar resposta
function fireCampanha(campanha_id: string): Promise<void> {
  // Nao usa await -- queremos que a chamada continue em background
  return fetch(FIRE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campanha_id }),
  }).then(() => {}).catch(() => {});
}
