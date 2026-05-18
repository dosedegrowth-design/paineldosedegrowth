/**
 * Helper para instanciar WhatsappClient a partir de uma conta no banco.
 * Server-side only (le Vault).
 */
import { createClient as createServerClient } from "@/lib/supabase/server";
import { WhatsappClient } from "./client";
import { readVaultSecret } from "./vault";

export interface ContaWaba {
  id: string;
  waba_id: string;
  phone_number_id: string;
  token_vault_key: string;
  display_name: string;
  tier: string;
  quality_rating: string;
  ativo: boolean;
}

export async function getConta(contaId: string): Promise<ContaWaba> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .schema("disparador" as never)
    .from("contas")
    .select("*")
    .eq("id", contaId)
    .single<ContaWaba>();
  if (error || !data) throw new Error(`Conta ${contaId} nao encontrada: ${error?.message}`);
  return data;
}

export async function clientForConta(contaId: string): Promise<{ client: WhatsappClient; conta: ContaWaba }> {
  const conta = await getConta(contaId);
  if (!conta.ativo) throw new Error(`Conta ${conta.display_name} esta inativa`);
  const token = await readVaultSecret(conta.token_vault_key);
  const client = new WhatsappClient({
    accessToken: token,
    wabaId: conta.waba_id,
    phoneNumberId: conta.phone_number_id,
  });
  return { client, conta };
}
