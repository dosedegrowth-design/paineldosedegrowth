"use server";

import { revalidatePath } from "next/cache";
import { logServerError, vipDb } from "@/lib/tayssa/db";
import { assertAdmin } from "@/lib/tayssa/auth/guards";
import { logAudit } from "@/lib/tayssa/audit";
import { ROUTES } from "@/lib/tayssa/config";
import { getApprovedServiceStats, podarMarcosPerdidos, syncLoyaltyEligibility } from "@/lib/tayssa/engine";
import { ajusteDePontos } from "@/lib/tayssa/rules";
import { ajustePontosSchema } from "@/lib/tayssa/validation";
import { BusinessError, runAction, str } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult, ServiceRow } from "@/lib/tayssa/types";

export type AjusteFeito = {
  /** o que entrou no registro: negativo quando tirou */
  pontos: number;
  servico: string;
  /** o total da cliente depois da correção */
  total: number;
};

/**
 * Correção de pontos na ficha da cliente (Lucas, 12/11/2026: marcou
 * manutenção, fez aplicação, e entrou com os pontos da manutenção). A
 * Tayssa tira ou adiciona os pontos de um serviço do catálogo, nunca um
 * número solto. Os atendimentos e o cartão não mudam: a correção é uma
 * linha à parte, que soma no total e aparece no histórico dela.
 */
export async function adminAjustarPontosAction(
  _prev: ActionResult<AjusteFeito> | null,
  formData: FormData
): Promise<ActionResult<AjusteFeito>> {
  return runAction("pontos.ajustar", async () => {
    const admin = await assertAdmin();
    const input = ajustePontosSchema.parse({
      client_id: str(formData, "client_id"),
      service_id: str(formData, "service_id"),
      tipo: str(formData, "tipo"),
      note: str(formData, "note"),
    });
    const db = vipDb();
    const [clienteRes, servicoRes] = await Promise.all([
      db.from("users").select("id").eq("id", input.client_id).eq("role", "client").maybeSingle(),
      db.from("services").select("*").eq("id", input.service_id).maybeSingle(),
    ]);
    if (clienteRes.error) throw new Error(clienteRes.error.message);
    if (servicoRes.error) throw new Error(servicoRes.error.message);
    if (!clienteRes.data) throw new BusinessError("Cliente não encontrada.");
    const servico = servicoRes.data as ServiceRow | null;
    if (!servico) throw new BusinessError("Escolha o serviço.", "service_id");

    const { points: antes } = await getApprovedServiceStats(input.client_id);
    const conta = ajusteDePontos(antes, servico.point_value, input.tipo);
    if (!conta.ok) throw new BusinessError(conta.motivo, "service_id");

    const { data, error } = await db
      .from("ajustes_pontos")
      .insert({
        client_id: input.client_id,
        service_id: servico.id,
        service_name: servico.name,
        points: conta.pontos,
        note: input.note,
        created_by: admin.id,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: conta.pontos > 0 ? "pontos_adicionados" : "pontos_tirados",
      entityType: "ajuste_pontos",
      entityId: (data as { id: string }).id,
      meta: { client_id: input.client_id, points: conta.pontos, service_name: servico.name, note: input.note },
    });

    // marcos: subiu, o motor abre o que ela alcançou (sempre em validação);
    // caiu, sai da fila o marco que ela deixou de alcançar
    try {
      if (conta.pontos > 0) await syncLoyaltyEligibility(input.client_id);
      else await podarMarcosPerdidos(input.client_id, antes, conta.total);
    } catch (e) {
      logServerError("pontos.marcos", e);
    }

    revalidatePath(ROUTES.admin, "layout");
    revalidatePath(ROUTES.vip, "layout");
    return { pontos: conta.pontos, servico: servico.name, total: conta.total };
  });
}
