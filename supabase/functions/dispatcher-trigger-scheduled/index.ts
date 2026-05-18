// Edge Function: dispatcher-trigger-scheduled
// Roda via pg_cron a cada minuto. Pega campanhas scheduled cujo horario ja passou
// e dispara o webhook n8n pra cada uma.

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const N8N_URL = Deno.env.get("N8N_DISPATCHER_WEBHOOK_URL") ?? "https://webhook.dosedegrowth.cloud/webhook/disparador-start";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

Deno.serve(async () => {
  const now = new Date().toISOString();

  const { data: campanhas, error } = await supabase
    .schema("disparador")
    .from("campanhas")
    .select("id, nome, scheduled_at")
    .eq("status", "scheduled")
    .lte("scheduled_at", now);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (!campanhas?.length) {
    return new Response(JSON.stringify({ triggered: 0, ts: now }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const results: Array<{ id: string; nome: string; ok: boolean; detail?: string }> = [];

  for (const c of campanhas as Array<{ id: string; nome: string; scheduled_at: string }>) {
    // Lock otimista: marca como running antes de chamar n8n
    const { data: locked, error: lockErr } = await supabase
      .schema("disparador")
      .from("campanhas")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", c.id)
      .eq("status", "scheduled")
      .select("id")
      .single();
    if (lockErr || !locked) {
      results.push({ id: c.id, nome: c.nome, ok: false, detail: "lock falhou" });
      continue;
    }

    try {
      const res = await fetch(N8N_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campanha_id: c.id }),
      });
      if (!res.ok) {
        await supabase
          .schema("disparador")
          .from("campanhas")
          .update({ status: "error", paused_reason: `n8n trigger ${res.status}` })
          .eq("id", c.id);
        results.push({ id: c.id, nome: c.nome, ok: false, detail: `n8n ${res.status}` });
      } else {
        results.push({ id: c.id, nome: c.nome, ok: true });
      }
    } catch (e) {
      await supabase
        .schema("disparador")
        .from("campanhas")
        .update({ status: "error", paused_reason: (e as Error).message })
        .eq("id", c.id);
      results.push({ id: c.id, nome: c.nome, ok: false, detail: (e as Error).message });
    }
  }

  return new Response(JSON.stringify({ triggered: results.length, results, ts: now }), {
    headers: { "Content-Type": "application/json" },
  });
});
