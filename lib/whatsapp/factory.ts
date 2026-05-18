/**
 * Helper para instanciar WhatsappClient a partir de uma conta no banco.
 * Server-side only (le Vault via RPC).
 */
import { createClient as createSbClient } from "@supabase/supabase-js";
import { WhatsappClient } from "./client";

export interface ContaWaba {
  id: string;
  business_id: string;
  waba_id: string;
  phone_number_id: string;
  display_name: string;
  tier: string;
  quality_rating: string;
  ativo: boolean;
  business: {
    id: string;
    meta_business_id: string;
    token_vault_key: string;
    display_name: string;
  } | null;
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service role nao configurado");
  return createSbClient(url, key, { auth: { persistSession: false } });
}

export async function getConta(contaId: string): Promise<ContaWaba> {
  const supabase = adminClient();
  const { data, error } = await supabase
    .schema("disparador" as never)
    .from("contas")
    .select(`
      id, business_id, waba_id, phone_number_id, display_name, tier, quality_rating, ativo,
      business:businesses (id, meta_business_id, token_vault_key, display_name)
    `)
    .eq("id", contaId)
    .single<ContaWaba>();
  if (error || !data) throw new Error(`Conta ${contaId} nao encontrada: ${error?.message}`);
  return data;
}

export async function clientForConta(contaId: string): Promise<{ client: WhatsappClient; conta: ContaWaba }> {
  const conta = await getConta(contaId);
  if (!conta.ativo) throw new Error(`Conta ${conta.display_name} esta inativa`);
  if (!conta.business?.token_vault_key) throw new Error(`Conta sem business associado`);

  const supabase = adminClient();
  const { data: tokenResp, error: tokenErr } = await supabase
    .schema("disparador" as never)
    .rpc("get_token", { secret_name: conta.business.token_vault_key });
  if (tokenErr || !tokenResp) throw new Error(`get_token falhou: ${tokenErr?.message ?? "vazio"}`);
  const token = tokenResp as unknown as string;

  const client = new WhatsappClient({
    accessToken: token,
    wabaId: conta.waba_id,
    phoneNumberId: conta.phone_number_id,
  });
  return { client, conta };
}
