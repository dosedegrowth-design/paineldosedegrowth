import { NextResponse } from "next/server";
import { createClient as createSbClient } from "@supabase/supabase-js";

/**
 * POST /api/dispatcher/campanhas/[id]/resend
 *
 * Força o reprocessamento de uma campanha que travou no meio (a Edge Function
 * bateu timeout e sobrou envio parado). Dois modos:
 *  - mode "retomar": processa os envios que ficaram em `pending`.
 *  - mode "falhados": volta os `failed` pra `pending` e reprocessa.
 *
 * Marca a campanha como `running` e dispara a Edge Function (fire-and-forget).
 * O cron dispatcher-trigger-scheduled também retoma sozinho, mas isso dá o
 * botão manual pra não precisar esperar.
 *
 * Body: { mode: "retomar" | "falhados" }
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let mode: "retomar" | "falhados" = "retomar";
  try {
    const body = await req.json();
    if (body?.mode === "falhados") mode = "falhados";
  } catch { /* usa retomar */ }

  const supabase = createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  // Modo "falhados": devolve os que deram erro pra fila
  let resetados = 0;
  if (mode === "falhados") {
    const { data: reset } = await supabase
      .schema("disparador" as never)
      .from("envios")
      .update({ status: "pending", error_code: null, error_message: null, failed_at: null })
      .eq("campanha_id", id)
      .eq("status", "failed")
      .select("id");
    resetados = reset?.length ?? 0;
  }

  // Conta quantos estão pendentes agora
  const { count: pendentes } = await supabase
    .schema("disparador" as never)
    .from("envios")
    .select("id", { count: "exact", head: true })
    .eq("campanha_id", id)
    .eq("status", "pending");

  if (!pendentes || pendentes === 0) {
    return NextResponse.json(
      { error: mode === "falhados" ? "Nenhuma falha pra reenviar." : "Nenhum envio pendente." },
      { status: 400 },
    );
  }

  // Marca running (destrava campanha que ficou 'done'/'running' presa)
  await supabase
    .schema("disparador" as never)
    .from("campanhas")
    .update({ status: "running", atualizado_em: new Date().toISOString() })
    .eq("id", id);

  // Dispara a Edge Function sem esperar (ela processa em lotes; o cron retoma se faltar)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  fetch(`${supabaseUrl}/functions/v1/dispatcher-fire-campanha`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campanha_id: id }),
  }).catch((e) => console.error("[resend] fetch Edge falhou:", e));

  return NextResponse.json({ ok: true, mode, pendentes, resetados });
}
