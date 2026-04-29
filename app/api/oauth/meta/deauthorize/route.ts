/**
 * Facebook Deauthorize Callback.
 *
 * Quando um usuário revoga o app dele em Facebook → Settings → Apps → "Remover",
 * Meta dispara POST aqui com signed_request.
 *
 * Diferente do data-deletion (que pede exclusão completa de dados),
 * este callback só nos avisa que o token OAuth foi invalidado.
 *
 * Doc: https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow#deauth
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const META_APP_SECRET = process.env.META_APP_SECRET ?? "";

function base64UrlDecode(input: string): Buffer {
  const padded =
    input.replace(/-/g, "+").replace(/_/g, "/") +
    "==".slice((input.length + 2) % 4);
  return Buffer.from(padded, "base64");
}

function parseSignedRequest(
  signedRequest: string,
  secret: string
): { user_id?: string } | null {
  try {
    const [encodedSig, payload] = signedRequest.split(".");
    if (!encodedSig || !payload) return null;

    const sig = base64UrlDecode(encodedSig);
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest();

    if (!crypto.timingSafeEqual(sig, expectedSig)) return null;

    return JSON.parse(base64UrlDecode(payload).toString("utf-8"));
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const signedRequest = formData.get("signed_request");

  if (!signedRequest || typeof signedRequest !== "string") {
    return NextResponse.json({ error: "missing signed_request" }, { status: 400 });
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

  try {
    const supabase = createAdminClient();

    // 1. Logar evento
    await supabase
      .schema("trafego_ddg")
      .from("logs")
      .insert({
        acao: "facebook_deauthorize",
        entidade: "facebook_user",
        entidade_id: facebookUserId,
        payload_jsonb: {
          source: "facebook_deauthorize_callback",
          deauthorized_at: new Date().toISOString(),
        },
      });

    // 2. Invalidar tokens vinculados a esse facebook user_id
    // (clientes_acessos podem ter sido conectados via OAuth desse user)
    // Por segurança, marcamos como erro pra forçar reconexão
    // TODO Fase 1: implementar mapeamento user_id facebook -> clientes_acessos
  } catch (err) {
    console.error("deauthorize error:", err);
  }

  // Meta não espera body específico — só status 200
  return NextResponse.json({ status: "deauthorized" });
}

// GET retorna info pro Meta validar
export async function GET() {
  return NextResponse.json({
    endpoint: "Facebook Deauthorize Callback",
    method: "POST",
    description:
      "Receives signed_request from Facebook when user revokes app authorization",
  });
}
