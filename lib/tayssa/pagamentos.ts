import "server-only";
import { vipDb } from "@/lib/tayssa/db";
import { logAudit } from "@/lib/tayssa/audit";
import type { FormaPagamento } from "@/lib/tayssa/financeiro";

export type NovoPagamento = {
  valor: number;
  forma: FormaPagamento;
  origem: "sinal" | "atendimento" | "manual";
  /** quando o dinheiro entrou (padrão: agora) */
  recebidoEm?: string;
  nota?: string | null;
};

/**
 * Grava os pagamentos de um atendimento (17/11/2026). Só entra pagamento de
 * verdade: valor maior que zero, forma conhecida. Recebido é o que está
 * aqui; o resto do valor do atendimento fica pendente.
 */
export async function registrarPagamentos(visitaId: string, itens: readonly NovoPagamento[], adminId: string | null): Promise<void> {
  const validos = itens.filter((p) => Number.isFinite(p.valor) && p.valor > 0);
  if (!validos.length) return;
  const { error } = await vipDb()
    .from("pagamentos")
    .insert(
      validos.map((p) => ({
        client_service_id: visitaId,
        valor: Math.round(p.valor * 100) / 100,
        forma: p.forma,
        origem: p.origem,
        recebido_em: p.recebidoEm ?? new Date().toISOString(),
        nota: p.nota ?? null,
        created_by: adminId,
      })),
    );
  if (error) throw new Error(error.message);
  await logAudit({
    actorId: adminId,
    actorRole: adminId ? "admin" : "system",
    action: "pagamento_registrado",
    entityType: "client_service",
    entityId: visitaId,
    meta: { pagamentos: validos.map((p) => ({ valor: p.valor, forma: p.forma, origem: p.origem })) },
  });
}
