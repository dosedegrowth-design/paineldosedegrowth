/**
 * Edge Function: sync-google-ads
 *
 * Roda 4x/dia (06h, 12h, 18h, 23h via cron).
 * Para cada cliente ativo com google_oauth_refresh_token configurado:
 *  1. OAuth refresh → access token
 *  2. GAQL queries (campanhas, adsets, ads, keywords, search_terms)
 *  3. Upsert em trafego_ddg.*_snapshot
 *  4. Log de sucesso/erro em trafego_ddg.logs
 *
 * Implementação concreta na Fase 1.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  // TODO Fase 1:
  // const { createClient } = await import("jsr:@supabase/supabase-js@2");
  // const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  //
  // 1. Buscar clientes ativos com google_customer_id
  // 2. Para cada cliente:
  //    a. Refresh access token (POST /token)
  //    b. Query campanhas: SELECT campaign.id, campaign.name, metrics.cost_micros, ...
  //    c. Query search_terms: SELECT search_term_view.search_term, ...
  //    d. Upsert em campanhas_snapshot (cliente_id, plataforma='google', data, ...)
  //    e. Atualizar clientes_acessos.ultima_sync_google = now()
  // 3. Logar resultados
  return new Response(
    JSON.stringify({
      status: "skeleton",
      message: "sync-google-ads — implementação na Fase 1",
      timestamp: new Date().toISOString(),
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
});
