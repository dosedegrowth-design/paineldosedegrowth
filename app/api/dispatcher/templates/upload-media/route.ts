import { NextResponse } from "next/server";
import { createClient as createSbClient } from "@supabase/supabase-js";

/**
 * POST /api/dispatcher/templates/upload-media
 *
 * Upload de midia pra templates Meta WhatsApp (header IMAGE/VIDEO/DOCUMENT).
 *
 * Faz DUAS coisas:
 *  1. Resumable Upload API Meta -> retorna `handle` pra criar template
 *  2. Upload Supabase Storage (bucket disparador-media) -> retorna `public_url` pra disparar
 *
 * Returns: { handle: string, public_url: string }
 */

const API_VERSION = process.env.META_API_VERSION ?? "v25.0";

export const maxDuration = 60;

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const contaId = formData.get("conta_id") as string | null;

  if (!file || !contaId) {
    return NextResponse.json({ error: "file e conta_id obrigatorios" }, { status: 400 });
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

  // Pega buffer uma vez (precisamos pra Meta + pra Supabase)
  const buf = await file.arrayBuffer();
  const fileLength = file.size;
  const fileType = file.type;

  // ─── META: Resumable Upload ───────────────────────────────
  // STEP 1: Cria upload session
  const sessionUrl = new URL(`https://graph.facebook.com/${API_VERSION}/${businessObj.meta_app_id}/uploads`);
  sessionUrl.searchParams.set("file_length", fileLength.toString());
  sessionUrl.searchParams.set("file_type", fileType);
  sessionUrl.searchParams.set("file_name", file.name);
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

  // ─── SUPABASE STORAGE: Upload pra ter URL publica ─────────
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const storagePath = `${contaId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadStorageErr } = await supabase.storage
    .from("disparador-media")
    .upload(storagePath, buf, {
      contentType: fileType,
      upsert: false,
    });
  if (uploadStorageErr) {
    return NextResponse.json(
      { error: `Falha upload Storage: ${uploadStorageErr.message}`, handle },
      { status: 502 },
    );
  }

  const { data: publicData } = supabase.storage
    .from("disparador-media")
    .getPublicUrl(storagePath);
  const publicUrl = publicData.publicUrl;

  return NextResponse.json({
    handle,
    public_url: publicUrl,
    filename: file.name,
  });
}
