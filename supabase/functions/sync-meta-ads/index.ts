/**
 * Edge Function: sync-meta-ads
 * Cron 4x/dia.
 *
 * Para cada cliente ativo com meta_ad_account_id:
 * 1. Pull /campaigns?fields=id,name,status,objective,insights{...}
 * 2. Pull /adsets, /ads (com creative.thumbnail_url)
 * 3. Cache thumbnails em Supabase Storage
 * 4. Upsert em trafego_ddg.*_snapshot
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async () => {
  return new Response(
    JSON.stringify({
      status: "skeleton",
      message: "sync-meta-ads — implementação na Fase 1",
      timestamp: new Date().toISOString(),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
