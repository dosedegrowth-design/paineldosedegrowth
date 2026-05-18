import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/dispatcher/start
 * Dispara o workflow n8n para iniciar uma campanha.
 *
 * Body: { campanha_id }
 */
export async function POST(req: Request) {
  const { campanha_id } = await req.json();
  if (!campanha_id) {
    return NextResponse.json({ error: "campanha_id obrigatorio" }, { status: 400 });
  }

  const supabase = await createClient();

  // Marca como running antes de chamar n8n (lock otimista)
  const { data: campanha, error: updErr } = await supabase
    .schema("disparador" as never)
    .from("campanhas")
    .update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", campanha_id)
    .in("status", ["draft", "scheduled", "paused"])
    .select()
    .single();

  if (updErr || !campanha) {
    return NextResponse.json(
      { error: "Campanha nao encontrada ou em estado incompativel" },
      { status: 400 },
    );
  }

  const url = process.env.N8N_DISPATCHER_WEBHOOK_URL;
  const secret = process.env.N8N_DISPATCHER_WEBHOOK_SECRET;
  if (!url) {
    return NextResponse.json({ error: "N8N_DISPATCHER_WEBHOOK_URL nao configurada" }, { status: 500 });
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "X-Dispatcher-Secret": secret } : {}),
      },
      body: JSON.stringify({ campanha_id }),
    });
    if (!res.ok) {
      // Rollback
      await supabase
        .schema("disparador" as never)
        .from("campanhas")
        .update({ status: "error", paused_reason: `n8n webhook ${res.status}` })
        .eq("id", campanha_id);
      return NextResponse.json({ error: `n8n nao aceitou trigger: ${res.status}` }, { status: 502 });
    }
  } catch (e) {
    await supabase
      .schema("disparador" as never)
      .from("campanhas")
      .update({ status: "error", paused_reason: (e as Error).message })
      .eq("id", campanha_id);
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }

  return NextResponse.json({ campanha, status: "started" });
}
