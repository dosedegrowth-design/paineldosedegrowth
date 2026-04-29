/**
 * Edge Function: detect-anomalies
 * Cron diário 07h.
 *
 * Para cada cliente ativo:
 * 1. Calcular baseline 7d e 14d das 5 métricas-chave (investimento, conv, CPA, ROAS, CTR)
 * 2. Comparar valor de D-1 com baseline
 * 3. Se desvio > threshold (config_alertas), criar registro em anomalias
 * 4. Gerar narrativa via Claude Haiku
 * 5. Se severidade = critica, enviar WhatsApp via Evolution
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async () => {
  return new Response(
    JSON.stringify({
      status: "skeleton",
      message: "detect-anomalies — implementação na Fase 3",
      timestamp: new Date().toISOString(),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
