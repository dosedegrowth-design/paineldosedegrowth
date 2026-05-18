/**
 * Wrapper Supabase Vault para acessar tokens Meta.
 *
 * Vault armazena segredos criptografados. Cada conta WABA tem 1 segredo,
 * referenciado por `token_vault_key` em `disparador.contas`.
 *
 * Use service role client (server-side only).
 */

import { createClient } from "@supabase/supabase-js";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service role nao configurado");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Le um segredo do Vault pelo nome (token_vault_key). */
export async function readVaultSecret(name: string): Promise<string> {
  const supabase = adminClient();
  const { data, error } = await supabase
    .schema("vault")
    .from("decrypted_secrets")
    .select("decrypted_secret")
    .eq("name", name)
    .single();

  if (error || !data?.decrypted_secret) {
    throw new Error(`Vault: nao foi possivel ler segredo "${name}": ${error?.message ?? "nao encontrado"}`);
  }
  return data.decrypted_secret;
}

/** Cria ou atualiza um segredo no Vault. */
export async function writeVaultSecret(name: string, secret: string, description?: string): Promise<void> {
  const supabase = adminClient();

  // Tenta criar; se ja existir, atualiza via RPC update_secret
  const { error: createErr } = await supabase.rpc("create_secret", {
    new_secret: secret,
    new_name: name,
    new_description: description ?? `Token WABA ${name}`,
  });

  if (createErr && !createErr.message.toLowerCase().includes("duplicate")) {
    throw new Error(`Vault create_secret falhou: ${createErr.message}`);
  }

  if (createErr) {
    // Ja existe — pega ID e atualiza
    const { data: existing, error: findErr } = await supabase
      .schema("vault")
      .from("secrets")
      .select("id")
      .eq("name", name)
      .single();
    if (findErr || !existing) throw new Error(`Vault: nao achei "${name}" pra atualizar`);

    const { error: updErr } = await supabase.rpc("update_secret", {
      secret_id: existing.id,
      new_secret: secret,
      new_name: name,
      new_description: description ?? `Token WABA ${name}`,
    });
    if (updErr) throw new Error(`Vault update_secret falhou: ${updErr.message}`);
  }
}
