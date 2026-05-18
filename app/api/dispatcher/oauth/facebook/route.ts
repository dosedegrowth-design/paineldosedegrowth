import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeVaultSecret } from "@/lib/whatsapp/vault";
import { WhatsappClient } from "@/lib/whatsapp/client";

/**
 * POST /api/dispatcher/oauth/facebook
 *
 * Recebe o `code` do Embedded Signup (FB.login com config_id),
 * troca por `business_integration_system_user_access_token` (token de longa duracao
 * que persiste mesmo se o user sair do Business Manager).
 *
 * Body do popup retorna alem do code:
 *  - data.phone_number_id (quando user terminou Embedded Signup)
 *  - data.waba_id
 *
 * Cf: https://developers.facebook.com/docs/whatsapp/embedded-signup/implementation
 *
 * Body: { code, phone_number_id, waba_id, display_name? }
 */
export async function POST(req: Request) {
  const body = await req.json();
  const { code, phone_number_id, waba_id, display_name } = body as {
    code: string;
    phone_number_id: string;
    waba_id: string;
    display_name?: string;
  };

  if (!code || !phone_number_id || !waba_id) {
    return NextResponse.json(
      { error: "code, phone_number_id e waba_id sao obrigatorios" },
      { status: 400 },
    );
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const apiVersion = process.env.META_API_VERSION ?? "v25.0";
  if (!appId || !appSecret) {
    return NextResponse.json({ error: "META_APP_ID/SECRET nao configurados" }, { status: 500 });
  }

  // 1. Troca code por access_token (business_integration_system_user)
  const tokenUrl = new URL(`https://graph.facebook.com/${apiVersion}/oauth/access_token`);
  tokenUrl.searchParams.set("client_id", appId);
  tokenUrl.searchParams.set("client_secret", appSecret);
  tokenUrl.searchParams.set("code", code);
  const tokenRes = await fetch(tokenUrl.toString());
  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok || !tokenJson.access_token) {
    return NextResponse.json(
      { error: `Falha trocando code: ${JSON.stringify(tokenJson)}` },
      { status: 400 },
    );
  }
  const accessToken: string = tokenJson.access_token;

  // 2. Subscribe o app a essa WABA (pra receber callbacks de status)
  await fetch(`https://graph.facebook.com/${apiVersion}/${waba_id}/subscribed_apps`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => {});

  // 3. Pega info do numero pra cache (tier, quality rating, display)
  const tempClient = new WhatsappClient({
    accessToken,
    wabaId: waba_id,
    phoneNumberId: phone_number_id,
  });

  let phoneInfo: Awaited<ReturnType<typeof tempClient.getPhoneNumberInfo>> | null = null;
  try {
    phoneInfo = await tempClient.getPhoneNumberInfo();
  } catch {
    // segue mesmo se falhar — completa depois via sync
  }

  // 4. Salva token no Vault
  const tokenKey = `waba_token_${phone_number_id}`;
  try {
    await writeVaultSecret(tokenKey, accessToken, `Token WABA ${display_name ?? phone_number_id}`);
  } catch (e) {
    return NextResponse.json(
      { error: `Vault falhou: ${(e as Error).message}` },
      { status: 500 },
    );
  }

  // 5. Cria/atualiza conta
  const supabase = await createClient();
  const finalName = display_name ?? phoneInfo?.verified_name ?? `WABA ${phone_number_id}`;
  const { data, error } = await supabase
    .schema("disparador" as never)
    .from("contas")
    .upsert(
      {
        display_name: finalName,
        waba_id,
        phone_number_id,
        phone_number_display: phoneInfo?.display_phone_number ?? null,
        token_vault_key: tokenKey,
        quality_rating: phoneInfo?.quality_rating ?? "UNKNOWN",
        tier: phoneInfo?.messaging_limit_tier ?? "TIER_1K",
        ultima_sync_meta: new Date().toISOString(),
        ativo: true,
      },
      { onConflict: "phone_number_id" },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ conta: data });
}
