"use server";

import { revalidatePath } from "next/cache";
import { vipDb } from "@/lib/db";
import { assertClient } from "@/lib/auth/guards";
import { logAudit } from "@/lib/audit";
import { ROUTES } from "@/lib/config";
import { BusinessError, runAction } from "@/lib/actions/_helpers";
import type { ActionResult, ClientBenefitRow, LoyaltyCardRow, LoyaltyStampRow } from "@/lib/types";

export type RevealResult = {
  position: number;
  points: number;
  serviceName: string;
  cardSize: number;
  filled: number;
  /** verdadeiro só na raspada que fecha o cartão (nada dourado sobrando) */
  cardCompleted: boolean;
  /** título do presente quando a raspada fecha o cartão */
  rewardTitle: string | null;
  rewardStatus: ClientBenefitRow["status"] | null;
};

/**
 * A cliente raspa um carimbo do PRÓPRIO cartão. Revelar não cria nada:
 * só marca revealed_at. O carimbo (e os pontos) já existiam desde a
 * confirmação do atendimento pela Tayssa.
 */
export async function revealStampAction(input: { id: string }): Promise<ActionResult<RevealResult>> {
  return runAction("card.reveal", async () => {
    const me = await assertClient();
    const db = vipDb();
    const { data } = await db.from("loyalty_stamps").select("*").eq("id", input.id).maybeSingle();
    const stamp = data as LoyaltyStampRow | null;
    if (!stamp || stamp.client_id !== me.id) throw new BusinessError("Carimbo não encontrado.");

    if (!stamp.revealed_at) {
      const { error } = await db
        .from("loyalty_stamps")
        .update({ revealed_at: new Date().toISOString() })
        .eq("id", stamp.id)
        .eq("client_id", me.id);
      if (error) throw new Error(error.message);
      await logAudit({
        actorId: me.id,
        actorRole: "client",
        action: "stamp_revealed",
        entityType: "loyalty_stamp",
        entityId: stamp.id,
        meta: { position: stamp.position, points: stamp.points },
      });
    }

    const { data: cardRow } = await db.from("loyalty_cards").select("*").eq("id", stamp.card_id).single();
    const card = cardRow as LoyaltyCardRow;
    const [{ count }, { count: pending }] = await Promise.all([
      db.from("loyalty_stamps").select("id", { count: "exact", head: true }).eq("card_id", card.id),
      db
        .from("loyalty_stamps")
        .select("id", { count: "exact", head: true })
        .eq("card_id", card.id)
        .is("revealed_at", null),
    ]);
    // a festa é da última raspada: enquanto sobrar carimbo dourado, cada
    // revelação mostra só os pontos daquela visita
    const closedNow = Boolean(card.completed_at) && (pending ?? 0) === 0;
    let rewardTitle: string | null = null;
    let rewardStatus: ClientBenefitRow["status"] | null = null;
    if (card.client_benefit_id) {
      const { data: r } = await db
        .from("client_benefits")
        .select("title, status")
        .eq("id", card.client_benefit_id)
        .maybeSingle();
      const rb = r as Pick<ClientBenefitRow, "title" | "status"> | null;
      rewardTitle = rb?.title ?? null;
      rewardStatus = rb?.status ?? null;
    }

    revalidatePath(ROUTES.vip, "layout");
    return {
      position: stamp.position,
      points: stamp.points,
      serviceName: stamp.service_name,
      cardSize: card.card_size,
      filled: count ?? 0,
      cardCompleted: closedNow,
      rewardTitle,
      rewardStatus,
    };
  });
}
