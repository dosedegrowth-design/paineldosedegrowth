/**
 * Edge Function: push-offline-conversions
 * Cron a cada 30min.
 *
 * Para cada evento_offline com status pendente ou falha:
 * 1. Resolver cliente_id → credenciais Google + Meta
 * 2. Push para Google Ads (Enhanced Conversions for Leads)
 *    - Match por gclid (priority) ou email_hash + phone_hash
 * 3. Push para Meta CAPI (/{pixel_id}/events)
 *    - Match por fbclid + email_hash
 * 4. Atualizar enviado_*_em e enviado_*_status
 * 5. Retry: 3 tentativas com backoff exponencial
 *
 * Esta é a feature DIFERENCIAL DDG.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async () => {
  return new Response(
    JSON.stringify({
      status: "skeleton",
      message: "push-offline-conversions — implementação na Fase 4 (DIFERENCIAL DDG)",
      timestamp: new Date().toISOString(),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
