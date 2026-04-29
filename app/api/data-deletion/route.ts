/**
 * Facebook Data Deletion Callback.
 *
 * Quando um usuário remove o app dele em Facebook → Settings → Apps,
 * Meta dispara POST aqui com signed_request.
 *
 * Doc oficial: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 *
 * Fluxo:
 * 1. Meta envia POST com body: signed_request=<base64>.<HMAC-SHA256>
 * 2. Validamos a signature usando META_APP_SECRET
 * 3. Extraímos o user_id do Facebook
 * 4. Iniciamos exclusão dos dados desse usuário (assíncrono)
 * 5. Retornamos JSON com:
 *    - url: página onde o usuário pode acompanhar status
 *    - confirmation_code: identificador desta solicitação
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://painel.dosedegrowth.com";
const META_APP_SECRET = process.env.META_APP_SECRET ?? "";

function base64UrlDecode(input: string): Buffer {
  // Converte base64url para base64 padrão
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "==".slice((input.length + 2) % 4);
  return Buffer.from(padded, "base64");
}

function parseSignedRequest(signedRequest: string, secret: string): { user_id?: string } | null {
  try {
    const [encodedSig, payload] = signedRequest.split(".");
    if (!encodedSig || !payload) return null;

    const sig = base64UrlDecode(encodedSig);
    const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest();

    if (!crypto.timingSafeEqual(sig, expectedSig)) return null;

    const data = JSON.parse(base64UrlDecode(payload).toString("utf-8"));
    return data;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  // Meta envia como form-urlencoded
  const formData = await req.formData();
  const signedRequest = formData.get("signed_request");

  if (!signedRequest || typeof signedRequest !== "string") {
    return NextResponse.json(
      { error: "missing signed_request" },
      { status: 400 }
    );
  }

  if (!META_APP_SECRET) {
    return NextResponse.json(
      { error: "META_APP_SECRET not configured" },
      { status: 500 }
    );
  }

  const data = parseSignedRequest(signedRequest, META_APP_SECRET);
  if (!data || !data.user_id) {
    return NextResponse.json(
      { error: "invalid signed_request" },
      { status: 400 }
    );
  }

  const facebookUserId = data.user_id;
  const confirmationCode = `del_${crypto.randomBytes(8).toString("hex")}`;

  // Marca como pendente de exclusão
  try {
    const supabase = createAdminClient();

    // Log da solicitação
    await supabase
      .schema("trafego_ddg")
      .from("logs")
      .insert({
        acao: "data_deletion_request",
        entidade: "facebook_user",
        entidade_id: facebookUserId,
        payload_jsonb: {
          confirmation_code: confirmationCode,
          source: "facebook_data_deletion_callback",
          requested_at: new Date().toISOString(),
        },
      });

    // TODO Fase 1: implementar exclusão real assíncrona
    // - Buscar user em auth.users por user_metadata.facebook_id = facebookUserId
    // - Remover de clientes_users
    // - Remover de logs
    // - Remover tokens OAuth
    // - Marcar auth.user como deletado
  } catch (err) {
    console.error("data-deletion error:", err);
  }

  return NextResponse.json({
    url: `${APP_URL}/excluir-dados/${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}

// GET retorna info sobre o endpoint (útil pro Meta validar que existe)
export async function GET() {
  return NextResponse.json({
    endpoint: "Facebook Data Deletion Callback",
    method: "POST",
    description: "Receives signed_request from Facebook when user removes app permission",
    docs: `${APP_URL}/excluir-dados`,
  });
}
