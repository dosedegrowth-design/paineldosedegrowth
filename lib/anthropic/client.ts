/**
 * Anthropic Claude wrapper.
 *
 * Modelos:
 * - claude-sonnet-4-5: chatbot, análises complexas (qualidade > custo)
 * - claude-haiku-4-5: massa, narrativas curtas, relatórios (custo > qualidade)
 */
import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function client() {
  if (!_client) {
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }
  return _client;
}

export type ModelTier = "sonnet" | "haiku";

const MODELS: Record<ModelTier, string> = {
  sonnet: "claude-sonnet-4-5",
  haiku: "claude-haiku-4-5",
};

/**
 * Gera narrativa curta de anomalia (Haiku, barato).
 */
export async function gerarNarrativaAnomalia(params: {
  metrica: string;
  valor_atual: number;
  baseline: number;
  desvio_percentual: number;
  contexto?: Record<string, unknown>;
}): Promise<string> {
  const msg = await client().messages.create({
    model: MODELS.haiku,
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `Você é analista de tráfego pago. Em 2-3 frases, explique a possível causa e sugira 1 ação. Não use markdown.

Métrica: ${params.metrica}
Valor atual: ${params.valor_atual}
Baseline: ${params.baseline}
Desvio: ${params.desvio_percentual.toFixed(1)}%
Contexto: ${JSON.stringify(params.contexto ?? {}).slice(0, 500)}`,
      },
    ],
  });
  return msg.content[0]?.type === "text" ? msg.content[0].text : "";
}

/**
 * Gera narrativa de mudança (impacto pós 7/14/21d).
 */
export async function gerarNarrativaMudanca(params: {
  campo: string;
  valor_antes: string;
  valor_depois: string;
  metricas_antes: Record<string, number>;
  metricas_depois: Record<string, number>;
  dias: number;
}): Promise<{ narrativa: string; veredicto: "positiva" | "negativa" | "neutra" }> {
  const msg = await client().messages.create({
    model: MODELS.haiku,
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Análise de mudança em campanha de tráfego ${params.dias} dias depois.

${params.campo}: ${params.valor_antes} → ${params.valor_depois}

Métricas ANTES da mudança: ${JSON.stringify(params.metricas_antes)}
Métricas APÓS: ${JSON.stringify(params.metricas_depois)}

Escreva 2-3 frases analisando se a mudança foi positiva, negativa ou neutra. Termine com EXATAMENTE uma destas palavras na última linha: positiva, negativa, neutra.`,
      },
    ],
  });
  const text = msg.content[0]?.type === "text" ? msg.content[0].text : "";
  const last = text.trim().split("\n").pop()?.toLowerCase().trim() ?? "";
  const veredicto: "positiva" | "negativa" | "neutra" = last.includes("positiva")
    ? "positiva"
    : last.includes("negativa")
    ? "negativa"
    : "neutra";
  return { narrativa: text, veredicto };
}

/**
 * Chatbot com tool use (Sonnet).
 */
export async function chatbot(params: {
  mensagens: Array<{ role: "user" | "assistant"; content: string }>;
  contexto: string;
}) {
  return client().messages.create({
    model: MODELS.sonnet,
    max_tokens: 1024,
    system: `Você é assistente de tráfego pago para a Dose de Growth (DDG).
Responde em português brasileiro, direto ao ponto, sem markdown excessivo.

Contexto da conta atual:
${params.contexto}`,
    messages: params.mensagens,
  });
}

/**
 * Geração de relatório (Haiku).
 */
export async function gerarRelatorio(params: {
  cliente_nome: string;
  periodo: string;
  metricas: Record<string, unknown>;
  prompt_customizado?: string;
  formato: "pdf" | "whatsapp" | "email";
}): Promise<string> {
  const guideline = {
    pdf: "Estruture em seções: Resumo Executivo, Performance por Plataforma, Top Campanhas, Recomendações. Sem markdown excessivo (será renderizado em PDF).",
    whatsapp: "Mensagem curta otimizada para WhatsApp. Use emojis estratégicos (📊 📈 ⚠️). Máximo 800 caracteres.",
    email: "Estrutura: assunto sugerido na primeira linha, depois corpo HTML-friendly em parágrafos curtos.",
  }[params.formato];

  const msg = await client().messages.create({
    model: MODELS.haiku,
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: `Gere relatório de tráfego pago para ${params.cliente_nome} · ${params.periodo}.

Métricas:
${JSON.stringify(params.metricas, null, 2)}

${params.prompt_customizado ? `Instruções adicionais: ${params.prompt_customizado}` : ""}

${guideline}`,
      },
    ],
  });
  return msg.content[0]?.type === "text" ? msg.content[0].text : "";
}
