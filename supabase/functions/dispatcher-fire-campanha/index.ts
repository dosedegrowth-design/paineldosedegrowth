// Edge Function: dispatcher-fire-campanha (v7 - chunks pequenos)
// Processa MAX_PER_CALL envios e sai. Cron retoma a cada minuto.
// Evita IDLE_TIMEOUT 150s do Supabase Edge Functions.
//
// Chamada por:
// - /api/dispatcher/start (quando usuario clica Iniciar disparo)
// - dispatcher-trigger-scheduled (cron a cada 1min pra retomar travados)

const PAINEL_URL = "https://painel.dosedegrowth.com";
const DISPATCHER_SECRET = "468ff4595978b1312a502b9b12b9a03c87628dd2212792e8428553cfca128fcd";
const MAX_PER_CALL = 150; // ~150 * 700ms = 105s (abaixo do IDLE_TIMEOUT 150s)
const MAX_DURATION_MS = 110 * 1000; // safety stop antes do IDLE_TIMEOUT

Deno.serve(async (req) => {
  let body: { campanha_id?: string } = {};
  try { body = await req.json(); } catch { /* ok */ }

  const campanha_id = body.campanha_id;
  if (!campanha_id) {
    return new Response(JSON.stringify({ ok: false, error: "campanha_id obrigatorio" }), { status: 400 });
  }

  const stats = { sent: 0, failed: 0, iterations: 0, errors: [] as string[], done: false };
  const startedAt = Date.now();

  while (stats.sent + stats.failed < MAX_PER_CALL) {
    stats.iterations++;

    if (Date.now() - startedAt > MAX_DURATION_MS) {
      stats.errors.push("Safety stop (110s)");
      break;
    }

    // 1) GET /pending
    let pending;
    try {
      const r = await fetch(
        `${PAINEL_URL}/api/dispatcher/pending?campanha_id=${campanha_id}&limit=50`,
        { headers: { "X-Dispatcher-Secret": DISPATCHER_SECRET } },
      );
      pending = await r.json();
    } catch (e) {
      stats.errors.push(`pending: ${(e as Error).message}`);
      break;
    }

    if (pending.stop || !pending.envios?.length) {
      stats.done = true;
      break;
    }

    const delayMs = pending.delay_ms_per_msg ?? 334;

    // 2) Pra cada envio: POST /send + sleep pacing
    for (const e of pending.envios as Array<{ id: string }>) {
      // Stop se ja atingiu o limite ou se vai bater timeout
      if (stats.sent + stats.failed >= MAX_PER_CALL) break;
      if (Date.now() - startedAt > MAX_DURATION_MS) break;

      try {
        const sendRes = await fetch(`${PAINEL_URL}/api/dispatcher/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Dispatcher-Secret": DISPATCHER_SECRET,
          },
          body: JSON.stringify({ envio_id: e.id }),
        });
        const sendJson = await sendRes.json();
        if (sendRes.ok && sendJson.ok) {
          stats.sent++;
        } else {
          stats.failed++;
          stats.errors.push(`${e.id}: ${sendJson.error || sendRes.status}`);
        }
      } catch (e2) {
        stats.failed++;
        stats.errors.push(`${e.id}: ${(e2 as Error).message}`);
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  return new Response(JSON.stringify({
    ok: true,
    campanha_id,
    ...stats,
    durationMs: Date.now() - startedAt,
  }), { headers: { "Content-Type": "application/json" } });
});
