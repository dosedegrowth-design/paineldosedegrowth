"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";

// ==================== TYPES ====================

export interface RelatorioReal {
  id: string;
  cliente_id: string;
  tipo: "pdf" | "whatsapp" | "email" | "csv";
  periodo_inicio: string | null;
  periodo_fim: string | null;
  conteudo: string | null;
  prompt_usado: string | null;
  modelo_ia: string | null;
  tokens_usados: number | null;
  enviado_para: string[] | null;
  gerado_em: string;
}

export async function listarRelatorios(
  clienteId: string,
  limit: number = 20
): Promise<RelatorioReal[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .schema("trafego_ddg")
      .from("relatorios")
      .select(
        "id, cliente_id, tipo, periodo_inicio, periodo_fim, conteudo, prompt_usado, modelo_ia, tokens_usados, enviado_para, gerado_em"
      )
      .eq("cliente_id", clienteId)
      .order("gerado_em", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("listarRelatorios:", error);
      return [];
    }
    return (data ?? []) as RelatorioReal[];
  } catch (err) {
    console.error("listarRelatorios exception:", err);
    return [];
  }
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";

interface MetricasRelatorio {
  cliente_nome: string;
  periodo: string;
  investimento: number;
  conversoes: number;
  receita: number;
  cpa: number;
  roas: number;
  campanhas_top: Array<{ nome: string; gasto: number; conversoes: number }>;
}

/**
 * Gera relatório usando Claude Haiku 4.5 (rápido e barato).
 */
export async function gerarRelatorioIA(input: {
  cliente_id: string;
  tipo: "whatsapp" | "email" | "pdf";
  periodo_inicio: string;
  periodo_fim: string;
  prompt_extra?: string;
}): Promise<{ ok: true; conteudo: string; tokens: number; id: string } | { ok: false; error: string }> {
  if (!ANTHROPIC_API_KEY) {
    return { ok: false, error: "ANTHROPIC_API_KEY não configurado" };
  }

  try {
    const supabase = await createClient();

    // Busca cliente + métricas do período
    const { data: cliente } = await supabase
      .schema("trafego_ddg")
      .from("clientes")
      .select("nome, tipo_negocio")
      .eq("id", input.cliente_id)
      .single();

    if (!cliente) return { ok: false, error: "Cliente não encontrado" };

    const { data: campanhas } = await supabase
      .schema("trafego_ddg")
      .from("campanhas_snapshot")
      .select("campanha_nome, investimento, conversoes, receita")
      .eq("cliente_id", input.cliente_id)
      .gte("data", input.periodo_inicio)
      .lte("data", input.periodo_fim);

    let investimento = 0;
    let conversoes = 0;
    let receita = 0;
    const porCampanha = new Map<string, { gasto: number; conversoes: number }>();
    for (const c of campanhas ?? []) {
      const inv = Number(c.investimento ?? 0);
      const conv = Number(c.conversoes ?? 0);
      const rec = Number(c.receita ?? 0);
      investimento += inv;
      conversoes += conv;
      receita += rec;
      const prev = porCampanha.get(c.campanha_nome) ?? { gasto: 0, conversoes: 0 };
      prev.gasto += inv;
      prev.conversoes += conv;
      porCampanha.set(c.campanha_nome, prev);
    }
    const top = Array.from(porCampanha.entries())
      .map(([nome, v]) => ({ nome, ...v }))
      .sort((a, b) => b.gasto - a.gasto)
      .slice(0, 5);

    const cpa = conversoes > 0 ? investimento / conversoes : 0;
    const roas = investimento > 0 ? receita / investimento : 0;

    const metricas: MetricasRelatorio = {
      cliente_nome: cliente.nome,
      periodo: `${input.periodo_inicio} a ${input.periodo_fim}`,
      investimento,
      conversoes,
      receita,
      cpa,
      roas,
      campanhas_top: top,
    };

    // Constrói prompt
    const guideline = {
      whatsapp:
        "Mensagem otimizada pra WhatsApp em português brasileiro. Use emojis estratégicos (📊 📈 ⚠️ ✅). Máximo 1200 caracteres. Tom: direto, executivo. Termine com 1 ação recomendada.",
      email:
        "Email em português brasileiro. Estrutura: linha 1 = assunto sugerido, depois corpo com saudação, resumo executivo em 3-4 parágrafos curtos, lista das top campanhas e fechamento profissional. Use formatação HTML simples.",
      pdf:
        "Relatório formal em português brasileiro pra cliente final. Estruture em seções: Resumo Executivo, Performance Geral, Top Campanhas, Recomendações. Sem markdown excessivo (será renderizado em PDF).",
    }[input.tipo];

    const prompt = `Gere um relatório de tráfego pago para ${cliente.nome}.

Período: ${metricas.periodo}
Tipo de negócio: ${cliente.tipo_negocio === "lead_whatsapp" ? "Lead/WhatsApp" : "E-commerce"}

Métricas agregadas:
- Investimento total: R$ ${investimento.toFixed(2)}
- Conversões/Leads: ${conversoes}
- Receita: R$ ${receita.toFixed(2)}
- CPA/CPL médio: R$ ${cpa.toFixed(2)}
- ROAS: ${roas.toFixed(2)}x

Top 5 campanhas:
${top.map((c) => `- ${c.nome}: R$ ${c.gasto.toFixed(2)} / ${c.conversoes} conv.`).join("\n")}

${input.prompt_extra ? `Instruções adicionais do cliente:\n${input.prompt_extra}\n` : ""}

${guideline}`;

    // Chama Anthropic
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const conteudo =
      msg.content[0]?.type === "text" ? msg.content[0].text : "";
    const tokensUsados = (msg.usage?.input_tokens ?? 0) + (msg.usage?.output_tokens ?? 0);

    // Salva no banco
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: rel, error: insErr } = await supabase
      .schema("trafego_ddg")
      .from("relatorios")
      .insert({
        cliente_id: input.cliente_id,
        tipo: input.tipo,
        periodo_inicio: input.periodo_inicio,
        periodo_fim: input.periodo_fim,
        conteudo,
        prompt_usado: prompt.slice(0, 2000),
        modelo_ia: "claude-haiku-4-5",
        tokens_usados: tokensUsados,
        gerado_por: user?.id ?? null,
      })
      .select("id")
      .single();

    if (insErr) return { ok: false, error: insErr.message };

    revalidatePath("/relatorios");
    return { ok: true, conteudo, tokens: tokensUsados, id: rel.id };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
