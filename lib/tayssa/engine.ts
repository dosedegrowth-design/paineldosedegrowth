import "server-only";
import { vipDb } from "@/lib/tayssa/db";
import { getSettings } from "@/lib/tayssa/settings";
import {
  loyaltyCycleKey,
  referralCycleKey,
  referralProgress,
} from "@/lib/tayssa/rules";
import type { BenefitRow, ClientBenefitRow } from "@/lib/tayssa/types";

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

/** Marcos de fidelidade alcançados que ainda não têm registro. */
export async function syncLoyaltyEligibility(clientId: string): Promise<number> {
  const [points, benefits] = await Promise.all([
    getApprovedPoints(clientId),
    getActiveBenefits(),
  ]);
  let created = 0;
  for (const b of benefits) {
    if (b.type !== "loyalty" || !b.threshold || b.threshold <= 0) continue;
    if (points < b.threshold) continue;
    if (await insertEligibility(clientId, b, loyaltyCycleKey(b.key))) created++;
  }
  return created;
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
