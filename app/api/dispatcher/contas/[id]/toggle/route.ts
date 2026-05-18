import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/dispatcher/contas/[id]/toggle
 * Alterna a flag `ativo` de uma conta (UI shortcut).
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: atual, error: getErr } = await supabase
    .schema("disparador" as never)
    .from("contas")
    .select("ativo")
    .eq("id", id)
    .single<{ ativo: boolean }>();

  if (getErr || !atual) {
    return NextResponse.json({ error: getErr?.message ?? "nao encontrada" }, { status: 404 });
  }

  const { data, error } = await supabase
    .schema("disparador" as never)
    .from("contas")
    .update({ ativo: !atual.ativo })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conta: data });
}
