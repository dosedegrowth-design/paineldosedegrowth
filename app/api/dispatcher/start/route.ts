import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/dispatcher/start
 * Dispara a Edge Function dispatcher-fire-campanha que processa a campanha.
 *
 * Body: { campanha_id }
 */
export async function POST(req: Request) {
  const { campanha_id } = await req.json();
  if (!campanha_id) {
    return NextResponse.json({ error: "campanha_id obrigatorio" }, { status: 400 });
  }

  const supabase = await createClient();

  // Marca como running (lock otimista)
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

  // Chama Edge Function dispatcher-fire-campanha (fire-and-forget)
  // Nao usamos await porque a Edge Function pode levar minutos pra processar
  // e o Vercel Serverless tem timeout de 10s.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_SUPABASE_URL nao configurado" }, { status: 500 });
  }

  fetch(`${supabaseUrl}/functions/v1/dispatcher-fire-campanha`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campanha_id }),
  }).catch((e) => {
    // Erro de fetch nao bloqueia - campanha esta marcada como running
    // e Edge Function pode ser re-disparada manualmente se falhar
    console.error("[dispatcher/start] fetch Edge falhou:", e);
  });

  return NextResponse.json({ campanha, status: "started" });
}
