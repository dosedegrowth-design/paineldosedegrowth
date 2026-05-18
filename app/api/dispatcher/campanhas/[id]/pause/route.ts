import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/dispatcher/campanhas/[id]/pause
 * Pausa uma campanha em execucao. n8n vai detectar via /pending no proximo ciclo.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("disparador" as never)
    .from("campanhas")
    .update({ status: "paused", paused_reason: "manual" })
    .eq("id", id)
    .eq("status", "running")
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Campanha nao esta running" }, { status: 400 });
  return NextResponse.json({ campanha: data });
}
