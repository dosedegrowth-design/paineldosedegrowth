import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeVaultSecret } from "@/lib/whatsapp/vault";
import { WhatsappClient } from "@/lib/whatsapp/client";

/**
 * GET /api/dispatcher/contas
 * Lista contas WABA cadastradas.
 */
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("disparador" as never)
    .from("contas")
    .select("id,display_name,waba_id,phone_number_id,phone_number_display,tier,quality_rating,ativo,ultima_sync_meta")
    .order("display_name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ contas: data });
}

/**
 * POST /api/dispatcher/contas
 * Cadastra nova conta WABA. Salva token no Vault e valida com chamada Meta.
 *
 * Body: { display_name, waba_id, phone_number_id, access_token }
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  const { display_name, waba_id, phone_number_id, access_token } = body;
  if (!display_name || !waba_id || !phone_number_id || !access_token) {
    return NextResponse.json(
      { error: "display_name, waba_id, phone_number_id e access_token sao obrigatorios" },
      { status: 400 },
    );
  }

  // Valida com Meta antes de salvar
  const tempClient = new WhatsappClient({
    accessToken: access_token,
    wabaId: waba_id,
    phoneNumberId: phone_number_id,
  });

  let phoneInfo: Awaited<ReturnType<typeof tempClient.getPhoneNumberInfo>>;
  try {
    phoneInfo = await tempClient.getPhoneNumberInfo();
  } catch (e) {
    return NextResponse.json(
      { error: `Token/IDs nao validados pela Meta: ${(e as Error).message}` },
      { status: 400 },
    );
  }

  const tokenKey = `waba_token_${phone_number_id}`;

  try {
    await writeVaultSecret(tokenKey, access_token, `Token WABA ${display_name}`);
  } catch (e) {
    return NextResponse.json(
      { error: `Falha ao salvar token no Vault: ${(e as Error).message}` },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .schema("disparador" as never)
    .from("contas")
    .insert({
      display_name,
      waba_id,
      phone_number_id,
      phone_number_display: phoneInfo.display_phone_number,
      token_vault_key: tokenKey,
      quality_rating: phoneInfo.quality_rating ?? "UNKNOWN",
      tier: phoneInfo.messaging_limit_tier ?? "TIER_1K",
      ultima_sync_meta: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conta: data }, { status: 201 });
}
