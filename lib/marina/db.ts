import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase do schema `marina_saleme`, com service role.
 * NUNCA importar em client component: quem autoriza é a chave do link,
 * conferida no servidor antes de qualquer leitura ou escrita.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MarinaClient = SupabaseClient<any, "marina_saleme", "marina_saleme", any, any>;

let cached: MarinaClient | null = null;

export function marinaDb(): MarinaClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase não configurado: faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  }
  cached = createClient(url, key, {
    db: { schema: "marina_saleme" },
    auth: { persistSession: false, autoRefreshToken: false },
  }) as MarinaClient;
  return cached;
}
