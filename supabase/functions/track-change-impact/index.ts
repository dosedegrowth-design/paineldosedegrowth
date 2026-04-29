/**
 * Edge Function: track-change-impact
 * Cron diário 08h.
 *
 * Para mudanças com veredicto = 'aguardando' que tenham 7/14/21 dias:
 * 1. Buscar métricas pós-mudança (mesmo período antes vs depois)
 * 2. Calcular delta
 * 3. Atualizar metricas_apos_*d_jsonb
 * 4. Aos 21d, gerar narrativa final via Haiku e definir veredicto
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async () => {
  return new Response(
    JSON.stringify({
      status: "skeleton",
      message: "track-change-impact — implementação na Fase 3",
      timestamp: new Date().toISOString(),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
