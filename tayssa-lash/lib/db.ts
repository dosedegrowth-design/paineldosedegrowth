import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase do schema `vip`, com service role.
 * NUNCA importar em client components. Toda autorização é feita no
 * servidor (lib/auth/guards.ts) antes de tocar no banco.
 */

// Sem tipos gerados do schema: o client é "solto" e cada query faz cast
// explícito para os tipos de lib/types.ts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VipClient = SupabaseClient<any, "vip", "vip", any, any>;

let cached: VipClient | null = null;

export function isDbConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function vipDb(): VipClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase não configurado: faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cached = createClient<any, "vip">(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "vip" },
  }) as unknown as VipClient;
  return cached;
}

/** Mensagem humana para erros inesperados (a técnica vai pro log). */
export const GENERIC_ERROR =
  "Não conseguimos concluir isso agora. Tente novamente em alguns instantes.";

export function logServerError(scope: string, error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(`[tayssa:${scope}]`, msg);
}
