import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clientForConta } from "@/lib/whatsapp/factory";
import { WhatsappClient, type TemplateComponent } from "@/lib/whatsapp/client";

/**
 * GET /api/dispatcher/templates?conta_id=xxx
 * Lista templates de uma conta (do banco, nao da Meta).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const contaId = url.searchParams.get("conta_id");
  if (!contaId) return NextResponse.json({ error: "conta_id obrigatorio" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("disparador" as never)
    .from("templates")
    .select("*")
    .eq("conta_id", contaId)
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ templates: data });
}

/**
 * POST /api/dispatcher/templates
 * Cria novo template na Meta + salva localmente como PENDING.
 *
 * Body: { conta_id, name, language, category, components: TemplateComponent[] }
 */
export async function POST(req: Request) {
  const body = await req.json();
  const { conta_id, name, language, category, components } = body as {
    conta_id: string;
    name: string;
    language: string;
    category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
    components: TemplateComponent[];
  };

  if (!conta_id || !name || !language || !category || !components) {
    return NextResponse.json(
      { error: "conta_id, name, language, category, components sao obrigatorios" },
      { status: 400 },
    );
  }

  const { client } = await clientForConta(conta_id);

  let metaResp: { id: string; status: string };
  try {
    metaResp = await client.createTemplate({ name, language, category, components });
  } catch (e) {
    return NextResponse.json(
      { error: `Meta rejeitou template: ${(e as Error).message}` },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("disparador" as never)
    .from("templates")
    .upsert(
      {
        conta_id,
        meta_id: metaResp.id,
        name,
        language,
        category,
        status: (metaResp.status ?? "PENDING").toUpperCase(),
        components,
        variables_count: WhatsappClient.countBodyVariables(components),
        ultima_sync_meta: new Date().toISOString(),
      },
      { onConflict: "conta_id,name,language" },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ template: data, meta: metaResp }, { status: 201 });
}
