import { NextResponse } from "next/server";
import { createClient as createSbClient } from "@supabase/supabase-js";

/**
 * GET /api/dispatcher/pending?campanha_id=xxx&limit=50
 *
 * Endpoint chamado pelo n8n a cada iteracao do loop.
 * Retorna proximos envios pending da campanha.
 *
 * Auth: header X-Dispatcher-Secret
 */
export async function GET(req: Request) {
  const secret = req.headers.get("x-dispatcher-secret");
  if (!secret || secret !== process.env.N8N_DISPATCHER_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const campanha_id = url.searchParams.get("campanha_id");
  const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);

  if (!campanha_id) return NextResponse.json({ error: "campanha_id obrigatorio" }, { status: 400 });

  const supabase = createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  // Pega envios pending + checa estado da campanha
  const { data: campanha } = await supabase
    .schema("disparador" as never)
    .from("campanhas")
    .select("status, pacing_per_sec, total_falhados, total_enviados")
    .eq("id", campanha_id)
    .single();

  if (!campanha) return NextResponse.json({ error: "campanha nao encontrada" }, { status: 404 });

  const c = campanha as { status: string; pacing_per_sec: number; total_falhados: number; total_enviados: number };

  if (c.status === "paused" || c.status === "cancelled" || c.status === "done") {
    return NextResponse.json({ envios: [], campanha_status: c.status, stop: true });
  }

  // Circuit-breaker: > 10% de erro com pelo menos 50 enviados → pausa
  if (c.total_enviados >= 50 && c.total_falhados / (c.total_falhados + c.total_enviados) > 0.1) {
    await supabase
      .schema("disparador" as never)
      .from("campanhas")
      .update({ status: "paused", paused_reason: "circuit-breaker (>10% erro)" })
      .eq("id", campanha_id);
    return NextResponse.json({ envios: [], campanha_status: "paused", stop: true, reason: "circuit-breaker" });
  }

  const { data: envios, error } = await supabase
    .schema("disparador" as never)
    .from("envios")
    .select("id")
    .eq("campanha_id", campanha_id)
    .eq("status", "pending")
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Se nao tem mais nenhum pending, marca campanha como done
  if (!envios || envios.length === 0) {
    await supabase
      .schema("disparador" as never)
      .from("campanhas")
      .update({ status: "done", finished_at: new Date().toISOString() })
      .eq("id", campanha_id)
      .neq("status", "done");
    return NextResponse.json({ envios: [], campanha_status: "done", stop: true });
  }

  return NextResponse.json({
    envios,
    pacing_per_sec: c.pacing_per_sec,
    delay_ms_per_msg: Math.ceil(1000 / c.pacing_per_sec),
    stop: false,
  });
}
