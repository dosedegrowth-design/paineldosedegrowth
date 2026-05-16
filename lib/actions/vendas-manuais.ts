"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ==================== TYPES ====================

export interface VendaManual {
  id: string;
  cliente_id: string;
  periodo_inicio: string;
  periodo_fim: string;
  total_leads_recebidos: number;
  total_investimento: number;
  leads_fechados: number;
  faturamento: number;
  perc_origem_meta: number | null;
  perc_origem_google: number | null;
  observacoes: string | null;
  preenchido_por: string | null;
  preenchido_em: string;
}

const CreateSchema = z.object({
  cliente_id: z.string().uuid("cliente_id inválido"),
  periodo_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inicio inválida"),
  periodo_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data fim inválida"),
  total_leads_recebidos: z.number().int().nonnegative(),
  total_investimento: z.number().nonnegative(),
  leads_fechados: z.number().int().nonnegative(),
  faturamento: z.number().nonnegative(),
  perc_origem_meta: z.number().min(0).max(100).nullable().optional(),
  perc_origem_google: z.number().min(0).max(100).nullable().optional(),
  observacoes: z.string().nullable().optional(),
});

// ==================== ACTIONS ====================

/**
 * Lista vendas manuais do cliente, ordenadas por período mais recente.
 */
export async function listarVendasManuais(
  clienteId: string,
  limit: number = 50
): Promise<VendaManual[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .schema("trafego_ddg")
      .from("vendas_manuais")
      .select(
        "id, cliente_id, periodo_inicio, periodo_fim, total_leads_recebidos, total_investimento, leads_fechados, faturamento, perc_origem_meta, perc_origem_google, observacoes, preenchido_por, preenchido_em"
      )
      .eq("cliente_id", clienteId)
      .order("periodo_inicio", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("listarVendasManuais:", error);
      return [];
    }
    return (data ?? []) as VendaManual[];
  } catch (err) {
    console.error("listarVendasManuais exception:", err);
    return [];
  }
}

/**
 * Cria nova venda manual.
 */
export async function criarVendaManual(
  input: z.input<typeof CreateSchema>
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const parsed = CreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .schema("trafego_ddg")
      .from("vendas_manuais")
      .insert({
        cliente_id: parsed.data.cliente_id,
        periodo_inicio: parsed.data.periodo_inicio,
        periodo_fim: parsed.data.periodo_fim,
        total_leads_recebidos: parsed.data.total_leads_recebidos,
        total_investimento: parsed.data.total_investimento,
        leads_fechados: parsed.data.leads_fechados,
        faturamento: parsed.data.faturamento,
        perc_origem_meta: parsed.data.perc_origem_meta ?? null,
        perc_origem_google: parsed.data.perc_origem_google ?? null,
        observacoes: parsed.data.observacoes ?? null,
        preenchido_por: user?.id ?? null,
      })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };

    revalidatePath("/vendas-manuais");
    revalidatePath("/dashboard");
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/**
 * Remove uma venda manual.
 */
export async function deletarVendaManual(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .schema("trafego_ddg")
      .from("vendas_manuais")
      .delete()
      .eq("id", id);

    if (error) return { ok: false, error: error.message };
    revalidatePath("/vendas-manuais");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
