import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/dispatcher/contas?ativo=true
 * Lista contas (numeros WhatsApp) sincronizados do Meta BM.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const onlyAtivo = url.searchParams.get("ativo") === "true";

  const supabase = await createClient();
  let q = supabase
    .schema("disparador" as never)
    .from("contas")
    .select("*, business:businesses(display_name, meta_business_id)")
    .order("ativo", { ascending: false })
    .order("display_name");
  if (onlyAtivo) q = q.eq("ativo", true);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ contas: data });
}
