import { NextResponse } from "next/server";
import { createClient as createSbClient } from "@supabase/supabase-js";

/**
 * POST /api/dispatcher/templates/upload-media
 *
 * Registra na Meta uma midia que JA esta no bucket `disparador-media`.
 *
 * O arquivo nao passa por aqui: o browser sobe direto pro Storage com a URL
 * assinada por /api/dispatcher/templates/upload-url, porque a Vercel corta
 * requisicoes acima de 4,5MB na borda. Esta rota recebe so o path em JSON,
 * baixa os bytes do Storage (trafego de saida, sem limite) e faz o Resumable
 * Upload pra Meta.
 *
 * Body:    { conta_id, storage_path, filename, content_type }
 * Returns: { handle: string, public_url: string, filename: string }
 */

const API_VERSION = process.env.META_API_VERSION ?? "v25.0";
const BUCKET = "disparador-media";

export const maxDuration = 60;

export async function POST(req: Request) {
  let body: {
    conta_id?: string;
    storage_path?: string;
    filename?: string;
    content_type?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "body invalido" }, { status: 400 });
  }

  const contaId = body.conta_id;
  const storagePath = body.storage_path;
  const filename = body.filename ?? storagePath?.split("/").pop() ?? "arquivo";

  if (!contaId || !storagePath) {
    return NextResponse.json({ error: "conta_id e storage_path obrigatorios" }, { status: 400 });
  }
  // O path é gerado pela rota que assina o upload e começa sempre pela conta.
  if (!storagePath.startsWith(`${contaId}/`)) {
    return NextResponse.json({ error: "storage_path nao pertence a conta" }, { status: 403 });
  }

  const supabase = createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  // Pega token + app_id via business
  const { data: contaRow } = await supabase
    .schema("disparador" as never)
    .from("contas")
    .select("business:businesses(token_vault_key, meta_app_id)")
    .eq("id", contaId)
    .single();

  const conta = contaRow as unknown as {
    business: { token_vault_key: string; meta_app_id: string | null } | { token_vault_key: string; meta_app_id: string | null }[] | null;
  } | null;

  const businessObj = Array.isArray(conta?.business) ? conta?.business?.[0] : conta?.business;
  if (!businessObj?.token_vault_key || !businessObj.meta_app_id) {
    return NextResponse.json({ error: "conta sem business/token/app_id" }, { status: 500 });
  }

  const { data: tokenResp } = await supabase
    .schema("disparador" as never)
    .rpc("get_token", { secret_name: businessObj.token_vault_key });
  if (!tokenResp) return NextResponse.json({ error: "token vazio" }, { status: 500 });
  const token = tokenResp as unknown as string;

  // Baixa do Storage: o arquivo ja esta la, subido direto pelo browser.
  const { data: blob, error: downloadErr } = await supabase.storage
    .from(BUCKET)
    .download(storagePath);
  if (downloadErr || !blob) {
    return NextResponse.json(
      { error: `Arquivo nao encontrado no Storage: ${downloadErr?.message ?? storagePath}` },
      { status: 404 },
    );
  }

  const buf = await blob.arrayBuffer();
  const fileLength = buf.byteLength;
  const fileType = body.content_type || blob.type || "application/octet-stream";

  // ─── META: Resumable Upload ───────────────────────────────
  // STEP 1: Cria upload session
  const sessionUrl = new URL(`https://graph.facebook.com/${API_VERSION}/${businessObj.meta_app_id}/uploads`);
  sessionUrl.searchParams.set("file_length", fileLength.toString());
  sessionUrl.searchParams.set("file_type", fileType);
  sessionUrl.searchParams.set("file_name", filename);
  sessionUrl.searchParams.set("access_token", token);

  const sessionRes = await fetch(sessionUrl.toString(), { method: "POST" });
  const sessionJson = await sessionRes.json();
  if (!sessionRes.ok) {
    return NextResponse.json(
      { error: `Falha criando upload session Meta: ${JSON.stringify(sessionJson)}` },
      { status: 502 },
    );
  }
  const sessionId = sessionJson.id as string;

  // STEP 2: Upload binario pra Meta
  const uploadRes = await fetch(`https://graph.facebook.com/${API_VERSION}/${sessionId}`, {
    method: "POST",
    headers: {
      Authorization: `OAuth ${token}`,
      file_offset: "0",
    },
    body: buf,
  });
  const uploadJson = await uploadRes.json();
  if (!uploadRes.ok || !uploadJson.h) {
    return NextResponse.json(
      { error: `Falha upload Meta: ${JSON.stringify(uploadJson)}` },
      { status: 502 },
    );
  }
  const handle = uploadJson.h as string;

  // ─── SUPABASE STORAGE: so a URL publica ───────────────────
  // O arquivo ja foi subido direto pelo browser; nao ha nada pra gravar aqui.
  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  return NextResponse.json({
    handle,
    public_url: publicData.publicUrl,
    filename,
  });
}
