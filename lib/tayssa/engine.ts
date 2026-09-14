import "server-only";
import { vipDb } from "@/lib/tayssa/db";
import { getSettings } from "@/lib/tayssa/settings";
import {
  loyaltyCycleKey,
  referralCycleKey,
  referralProgress,
} from "@/lib/tayssa/rules";
import type {
  BenefitRow,
  ClientBenefitRow,
  LoyaltyCardRow,
  LoyaltyStampRow,
} from "@/lib/tayssa/types";

/**
 * Motor de elegibilidade.
 *
 * REGRA ABSOLUTA: o sistema identifica elegibilidade e cria o registro em
 * `pending_validation`. Só a administradora muda para `available`.
 * Nunca promete nem entrega benefício sozinho.
 */

export async function getActiveBenefits(): Promise<BenefitRow[]> {
  const { data, error } = await vipDb()
    .from("benefits")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as BenefitRow[];
}

export async function getApprovedPoints(clientId: string): Promise<number> {
  const { data, error } = await vipDb()
    .from("client_services")
    .select("points")
    .eq("client_id", clientId)
    .eq("status", "approved");
  if (error) throw new Error(error.message);
  return ((data ?? []) as { points: number }[]).reduce((s, r) => s + (r.points ?? 0), 0);
}

export async function getApprovedReferralCount(clientId: string): Promise<number> {
  const { count, error } = await vipDb()
    .from("referrals")
    .select("id", { count: "exact", head: true })
    .eq("referrer_user_id", clientId)
    .eq("status", "approved");
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function insertEligibility(
  clientId: string,
  benefit: BenefitRow,
  cycleKey: string
): Promise<boolean> {
  const { data, error } = await vipDb()
    .from("client_benefits")
    .upsert(
      {
        client_id: clientId,
        benefit_id: benefit.id,
        cycle_key: cycleKey,
        status: "pending_validation",
        title: benefit.name,
        description: benefit.description,
      },
      { onConflict: "client_id,benefit_id,cycle_key", ignoreDuplicates: true }
    )
    .select("id");
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

/** Marcos de fidelidade (em pontos) alcançados que ainda não têm registro. */
export async function syncLoyaltyEligibility(clientId: string): Promise<number> {
  const [points, benefits] = await Promise.all([
    getApprovedPoints(clientId),
    getActiveBenefits(),
  ]);
  let created = 0;
  for (const b of benefits) {
    if (b.type !== "loyalty" || !b.threshold || b.threshold <= 0) continue;
    if ((b.threshold_unit ?? "points") !== "points") continue; // cartão tem ciclo próprio
    if (points < b.threshold) continue;
    if (await insertEligibility(clientId, b, loyaltyCycleKey(b.key))) created++;
  }
  return created;
}

// ------------------------------------------------------------
// Cartão de fidelidade: uma visita confirmada = um carimbo
// ------------------------------------------------------------

export type StampResult = {
  stampId: string;
  position: number;
  cardSize: number;
  cardCompleted: boolean;
};

/**
 * Carimba a próxima posição do cartão aberto da cliente. Ao fechar o
 * cartão, nasce o benefício em pending_validation (a Tayssa libera).
 * Idempotente por atendimento (unique client_service_id).
 */
export async function stampVisit(
  clientId: string,
  service: { id: string; service_name: string; points: number; reviewed_at?: string | null }
): Promise<StampResult | null> {
  const db = vipDb();
  const settings = await getSettings();
  const size = settings.loyalty.card_size;

  // já carimbado? (reaprovação, reprocessamento)
  const { data: existing } = await db
    .from("loyalty_stamps")
    .select("id, position, card_id")
    .eq("client_service_id", service.id)
    .maybeSingle();
  if (existing) return null;

  let { data: card } = await db
    .from("loyalty_cards")
    .select("*")
    .eq("client_id", clientId)
    .is("completed_at", null)
    .order("cycle_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  let c = card as LoyaltyCardRow | null;
  if (!c) {
    const { data: last } = await db
      .from("loyalty_cards")
      .select("cycle_number")
      .eq("client_id", clientId)
      .order("cycle_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    const cycle = ((last as { cycle_number: number } | null)?.cycle_number ?? 0) + 1;
    const { data: created, error } = await db
      .from("loyalty_cards")
      .insert({ client_id: clientId, cycle_number: cycle, card_size: size })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    card = created;
    c = created as LoyaltyCardRow;
  }

  const { data: last } = await db
    .from("loyalty_stamps")
    .select("position")
    .eq("card_id", c.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = ((last as { position: number } | null)?.position ?? 0) + 1;

  const { data: stamp, error: sErr } = await db
    .from("loyalty_stamps")
    .insert({
      card_id: c.id,
      client_id: clientId,
      position,
      client_service_id: service.id,
      service_name: service.service_name,
      points: service.points,
      stamped_at: service.reviewed_at ?? new Date().toISOString(),
      revealed_at: null, // a cliente raspa para revelar
    })
    .select("id")
    .single();
  if (sErr) {
    if (sErr.code === "23505") return null;
    throw new Error(sErr.message);
  }

  const completed = position >= c.card_size;
  if (completed) {
    const { data: b } = await db
      .from("benefits")
      .select("*")
      .eq("key", "card_complete")
      .maybeSingle();
    let benefitId: string | null = null;
    if (b) {
      const { data: cb } = await db
        .from("client_benefits")
        .upsert(
          {
            client_id: clientId,
            benefit_id: (b as BenefitRow).id,
            cycle_key: `card:${c.cycle_number}`,
            status: "pending_validation",
            title: settings.loyalty.card_reward_title,
            description: settings.loyalty.card_reward_description,
          },
          { onConflict: "client_id,benefit_id,cycle_key", ignoreDuplicates: true }
        )
        .select("id")
        .maybeSingle();
      benefitId = (cb as { id: string } | null)?.id ?? null;
    }
    await db
      .from("loyalty_cards")
      .update({ completed_at: new Date().toISOString(), client_benefit_id: benefitId })
      .eq("id", c.id);
  }

  return {
    stampId: (stamp as { id: string }).id,
    position,
    cardSize: c.card_size,
    cardCompleted: completed,
  };
}

export type CardState = {
  /** cartão exibido: o mais recente (mesmo completo, enquanto houver o que raspar) ou um novo vazio */
  card: LoyaltyCardRow | null;
  stamps: LoyaltyStampRow[];
  size: number;
  filled: number;
  unrevealed: number;
  cycle: number;
  completed: boolean;
  completedCards: number;
  /** benefício do cartão exibido (se completo) */
  reward: ClientBenefitRow | null;
};

export async function getCardState(clientId: string): Promise<CardState> {
  const db = vipDb();
  const settings = await getSettings();
  const size = settings.loyalty.card_size;
  const { data: cards, error } = await db
    .from("loyalty_cards")
    .select("*")
    .eq("client_id", clientId)
    .order("cycle_number", { ascending: false });
  if (error) throw new Error(error.message);
  const all = (cards ?? []) as LoyaltyCardRow[];
  const completedCards = all.filter((c) => c.completed_at).length;

  // Carimbo por raspar nunca fica para trás: se o cartão anterior ainda
  // tem dourado, é ele que aparece — a cliente termina de raspar (e ganha
  // a revelação do presente) antes de seguir para o cartão novo.
  const { data: pending } = await db
    .from("loyalty_stamps")
    .select("card_id")
    .eq("client_id", clientId)
    .is("revealed_at", null);
  const pendingCards = new Set(((pending ?? []) as { card_id: string }[]).map((r) => r.card_id));
  const latest =
    [...all].reverse().find((c) => pendingCards.has(c.id)) ?? all[0] ?? null;

  if (!latest) {
    return { card: null, stamps: [], size, filled: 0, unrevealed: 0, cycle: 1, completed: false, completedCards, reward: null };
  }

  const { data: st } = await db
    .from("loyalty_stamps")
    .select("*")
    .eq("card_id", latest.id)
    .order("position");
  const stamps = (st ?? []) as LoyaltyStampRow[];
  const unrevealed = stamps.filter((s) => !s.revealed_at).length;

  // cartão completo e tudo já raspado: mostra o próximo, vazio
  if (latest.completed_at && unrevealed === 0) {
    return {
      card: null,
      stamps: [],
      size,
      filled: 0,
      unrevealed: 0,
      cycle: latest.cycle_number + 1,
      completed: false,
      completedCards,
      reward: null,
    };
  }

  let reward: ClientBenefitRow | null = null;
  if (latest.client_benefit_id) {
    const { data: r } = await db.from("client_benefits").select("*").eq("id", latest.client_benefit_id).maybeSingle();
    reward = (r as ClientBenefitRow | null) ?? null;
  }
  return {
    card: latest,
    stamps,
    size: latest.card_size,
    filled: stamps.length,
    unrevealed,
    cycle: latest.cycle_number,
    completed: Boolean(latest.completed_at),
    completedCards,
    reward,
  };
}

/** Ciclos de indicação fechados que ainda não têm registro. */
export async function syncReferralEligibility(clientId: string): Promise<number> {
  const [approved, benefits] = await Promise.all([
    getApprovedReferralCount(clientId),
    getActiveBenefits(),
  ]);
  const referralBenefit = benefits.find((b) => b.type === "referral");
  if (!referralBenefit || !referralBenefit.threshold) return 0;
  const progress = referralProgress(approved, referralBenefit.threshold);
  let created = 0;
  for (let c = 1; c <= progress.cyclesEarned; c++) {
    if (await insertEligibility(clientId, referralBenefit, referralCycleKey(c))) created++;
  }
  return created;
}

/** Expira (lazy) benefícios vencidos da cliente. */
export async function expireStaleBenefits(clientId?: string): Promise<void> {
  const now = new Date().toISOString();
  let q = vipDb()
    .from("client_benefits")
    .update({ status: "expired" })
    .in("status", ["available", "requested", "approved"])
    .lt("expires_at", now);
  if (clientId) q = q.eq("client_id", clientId);
  const { error } = await q;
  if (error) throw new Error(error.message);
}

export async function getClientBenefits(clientId: string): Promise<
  (ClientBenefitRow & { benefit: Pick<BenefitRow, "key" | "type" | "name"> | null })[]
> {
  await expireStaleBenefits(clientId);
  const { data, error } = await vipDb()
    .from("client_benefits")
    .select("*, benefit:benefits(key, type, name)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as (ClientBenefitRow & {
    benefit: Pick<BenefitRow, "key" | "type" | "name"> | null;
  })[];
}

export async function defaultValidityDays(benefit: Pick<BenefitRow, "validity_days">) {
  const settings = await getSettings();
  return benefit.validity_days ?? settings.rules.benefit_validity_days;
}
