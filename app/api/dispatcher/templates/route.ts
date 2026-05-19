import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clientForConta } from "@/lib/whatsapp/factory";
import { WhatsappClient, type TemplateComponent } from "@/lib/whatsapp/client";

/**
 * GET /api/dispatcher/templates?waba_id=xxx (ou conta_id=xxx)
 * Lista templates do banco. Filtra por WABA ou pela WABA da conta.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  let wabaId = url.searchParams.get("waba_id");
  const contaId = url.searchParams.get("conta_id");

  const supabase = await createClient();

  if (!wabaId && contaId) {
    const { data: c } = await supabase
      .schema("disparador" as never)
      .from("contas")
      .select("waba_id")
      .eq("id", contaId)
      .single<{ waba_id: string }>();
    wabaId = c?.waba_id ?? null;
  }

  if (!wabaId) return NextResponse.json({ error: "waba_id ou conta_id obrigatorio" }, { status: 400 });

  const { data, error } = await supabase
    .schema("disparador" as never)
    .from("templates")
    .select("*")
    .eq("waba_id", wabaId)
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ templates: data });
}

/**
 * POST /api/dispatcher/templates
 * Cria template na Meta + salva localmente como PENDING.
 *
 * Body: { conta_id, name, language, category, components: TemplateComponent[] }
 */
export async function POST(req: Request) {
  const body = await req.json();
  const { conta_id, name, language, category, components, header_media_url, header_media_type } = body as {
    conta_id: string;
    name: string;
    language: string;
    category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
    components: TemplateComponent[];
    header_media_url?: string | null;
    header_media_type?: "IMAGE" | "VIDEO" | "DOCUMENT" | null;
  };

  if (!conta_id || !name || !language || !category || !components) {
    return NextResponse.json(
      { error: "conta_id, name, language, category, components sao obrigatorios" },
      { status: 400 },
    );
  }

  const { client, conta } = await clientForConta(conta_id);

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
        business_id: conta.business_id,
        waba_id: conta.waba_id,
        meta_id: metaResp.id,
        name,
        language,
        category,
        status: (metaResp.status ?? "PENDING").toUpperCase(),
        components,
        variables_count: WhatsappClient.countBodyVariables(components),
        header_media_url: header_media_url ?? null,
        header_media_type: header_media_type ?? null,
        ultima_sync_meta: new Date().toISOString(),
      },
      { onConflict: "waba_id,name,language" },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ template: data, meta: metaResp }, { status: 201 });
}
