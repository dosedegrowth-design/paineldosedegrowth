import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/dispatcher/templates/upload-url
 *
 * Assina uma URL de upload direto pro bucket `disparador-media`.
 *
 * Existe pra o arquivo NÃO passar pela Serverless Function: a Vercel corta
 * qualquer corpo de requisição acima de 4,5MB na borda. Aqui só trafega JSON
 * (alguns bytes); o browser manda os bytes direto pro Storage.
 *
 * Body:    { conta_id, filename, content_type }
 * Returns: { path, token }
 */

export const BUCKET = "disparador-media";

export async function POST(req: Request) {
  let body: { conta_id?: string; filename?: string; content_type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "body inválido" }, { status: 400 });
  }

  const { conta_id: contaId, filename } = body;
  if (!contaId || !filename) {
    return NextResponse.json({ error: "conta_id e filename obrigatórios" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Confere que a conta existe antes de assinar qualquer coisa.
  const { data: conta, error: contaErr } = await supabase
    .schema("disparador" as never)
    .from("contas")
    .select("id")
    .eq("id", contaId)
    .single();
  if (contaErr || !conta) {
    return NextResponse.json({ error: "conta não encontrada" }, { status: 404 });
  }

  const ext = filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${contaId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    return NextResponse.json(
      { error: `Falha assinando upload: ${error?.message ?? "sem resposta"}` },
      { status: 502 },
    );
  }

  return NextResponse.json({ path: data.path, token: data.token });
}
