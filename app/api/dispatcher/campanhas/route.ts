import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/dispatcher/campanhas
 * Lista campanhas.
 */
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("disparador" as never)
    .from("campanhas")
    .select(`
      *,
      conta:contas(display_name, phone_number_display),
      template:templates(name, language, category)
    `)
    .order("criado_em", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ campanhas: data });
}

/**
 * POST /api/dispatcher/campanhas
 * Cria campanha + insere envios pending.
 *
 * Body: {
 *   conta_id, template_id, upload_id?, nome, pacing_per_sec?,
 *   contatos: [{ telefone, telefone_raw, variables: { "1": "...", "2": "..." } }],
 *   scheduled_at?: ISO string
 * }
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  const {
    conta_id,
    template_id,
    upload_id,
    nome,
    pacing_per_sec,
    contatos,
    scheduled_at,
  } = body as {
    conta_id: string;
    template_id: string;
    upload_id?: string;
    nome: string;
    pacing_per_sec?: number;
    contatos: Array<{ telefone: string; telefone_raw?: string; variables?: Record<string, string> }>;
    scheduled_at?: string;
  };

  if (!conta_id || !template_id || !nome || !contatos?.length) {
    return NextResponse.json(
      { error: "conta_id, template_id, nome, contatos[] obrigatorios" },
      { status: 400 },
    );
  }

  const { data: campanha, error: campErr } = await supabase
    .schema("disparador" as never)
    .from("campanhas")
    .insert({
      conta_id,
      template_id,
      upload_id: upload_id ?? null,
      nome,
      pacing_per_sec: pacing_per_sec ?? 3,
      total_contatos: contatos.length,
      scheduled_at: scheduled_at ?? null,
      status: scheduled_at ? "scheduled" : "draft",
      custo_estimado_brl: contatos.length * 0.4,
    })
    .select()
    .single();

  if (campErr || !campanha) {
    return NextResponse.json({ error: campErr?.message ?? "erro ao criar campanha" }, { status: 500 });
  }

  // Insere envios pending em batches
  const batch = 1000;
  for (let i = 0; i < contatos.length; i += batch) {
    const slice = contatos.slice(i, i + batch).map((c) => ({
      campanha_id: (campanha as { id: string }).id,
      telefone: c.telefone,
      telefone_raw: c.telefone_raw ?? c.telefone,
      variables: c.variables ?? {},
      status: "pending",
    }));
    const { error: envErr } = await supabase
      .schema("disparador" as never)
      .from("envios")
      .insert(slice);
    if (envErr) {
      // Rollback simples — apaga campanha pra nao deixar lixo
      await supabase.schema("disparador" as never).from("campanhas").delete().eq("id", (campanha as { id: string }).id);
      return NextResponse.json({ error: `Falha ao inserir envios: ${envErr.message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ campanha }, { status: 201 });
}
