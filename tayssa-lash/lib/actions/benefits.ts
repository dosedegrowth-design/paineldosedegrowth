"use server";

import { revalidatePath } from "next/cache";
import { vipDb } from "@/lib/db";
import { assertAdmin, assertClient } from "@/lib/auth/guards";
import { logAudit } from "@/lib/audit";
import { ROUTES } from "@/lib/config";
import { getSettings } from "@/lib/settings";
import { defaultValidityDays } from "@/lib/engine";
import { addDays, birthdayCycleKey } from "@/lib/rules";
import {
  benefitDecisionSchema,
  customBenefitSchema,
  releaseBirthdaySchema,
} from "@/lib/validation";
import { BusinessError, runAction, str } from "@/lib/actions/_helpers";
import type { ActionResult, BenefitRow, ClientBenefitRow } from "@/lib/types";

async function loadClientBenefit(id: string): Promise<ClientBenefitRow & { benefit: BenefitRow }> {
  const { data } = await vipDb()
    .from("client_benefits")
    .select("*, benefit:benefits(*)")
    .eq("id", id)
    .maybeSingle();
  const row = data as (ClientBenefitRow & { benefit: BenefitRow }) | null;
  if (!row) throw new BusinessError("Benefício não encontrado.");
  return row;
}

function revalidateBoth() {
  revalidatePath(ROUTES.admin, "layout");
  revalidatePath(ROUTES.vip, "layout");
}

/** Cliente sinaliza que quer usar um benefício desbloqueado. */
export async function requestBenefitAction(input: {
  id: string;
  note?: string;
}): Promise<ActionResult> {
  return runAction("benefits.request", async () => {
    const me = await assertClient();
    const cb = await loadClientBenefit(input.id);
    if (cb.client_id !== me.id) throw new BusinessError("Benefício não encontrado.");
    if (cb.status !== "available") {
      throw new BusinessError("Esse benefício não está disponível para solicitação agora.");
    }
    if (cb.benefit.type === "birthday" && !me.isVip) {
      throw new BusinessError("Esse benefício faz parte da experiência VIP.");
    }
    const { error } = await vipDb()
      .from("client_benefits")
      .update({
        status: "requested",
        requested_at: new Date().toISOString(),
        client_note: input.note?.slice(0, 500) ?? null,
      })
      .eq("id", cb.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: me.id,
      actorRole: "client",
      action: "benefit_requested",
      entityType: "client_benefit",
      entityId: cb.id,
    });
    revalidateBoth();
    return undefined;
  });
}

/**
 * Admin valida a elegibilidade detectada pelo sistema:
 * pending_validation -> available (com validade).
 */
export async function adminValidateBenefitAction(input: {
  id: string;
  title?: string;
  description?: string;
  note?: string;
  validity_days?: string;
}): Promise<ActionResult> {
  return runAction("benefits.adminValidate", async () => {
    const admin = await assertAdmin();
    const parsed = benefitDecisionSchema.parse(input);
    const cb = await loadClientBenefit(parsed.id);
    if (cb.status !== "pending_validation") {
      throw new BusinessError("Esse benefício já foi validado.");
    }
    const days = parsed.validity_days ?? (await defaultValidityDays(cb.benefit));
    const now = new Date();
    const { error } = await vipDb()
      .from("client_benefits")
      .update({
        status: "available",
        title: parsed.title ?? cb.title,
        description: parsed.description ?? cb.description,
        admin_note: parsed.note,
        available_at: now.toISOString(),
        expires_at: addDays(now, days).toISOString(),
      })
      .eq("id", cb.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "benefit_validated",
      entityType: "client_benefit",
      entityId: cb.id,
      meta: { client_id: cb.client_id, validity_days: days },
    });
    revalidateBoth();
    return undefined;
  });
}

/** Admin confirma a solicitação (requested -> approved) — aí a cliente agenda. */
export async function adminApproveBenefitRequestAction(input: {
  id: string;
  note?: string;
}): Promise<ActionResult> {
  return runAction("benefits.adminApprove", async () => {
    const admin = await assertAdmin();
    const parsed = benefitDecisionSchema.parse(input);
    const cb = await loadClientBenefit(parsed.id);
    if (cb.status !== "requested" && cb.status !== "available") {
      throw new BusinessError("Esse benefício não está aguardando confirmação.");
    }
    const { error } = await vipDb()
      .from("client_benefits")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        admin_note: parsed.note ?? cb.admin_note,
      })
      .eq("id", cb.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "benefit_approved",
      entityType: "client_benefit",
      entityId: cb.id,
      meta: { client_id: cb.client_id },
    });
    revalidateBoth();
    return undefined;
  });
}

/** Admin marca como utilizado depois do atendimento. */
export async function adminRedeemBenefitAction(input: {
  id: string;
  note?: string;
}): Promise<ActionResult> {
  return runAction("benefits.adminRedeem", async () => {
    const admin = await assertAdmin();
    const parsed = benefitDecisionSchema.parse(input);
    const cb = await loadClientBenefit(parsed.id);
    if (!["available", "requested", "approved"].includes(cb.status)) {
      throw new BusinessError("Esse benefício não pode ser marcado como utilizado.");
    }
    const { error } = await vipDb()
      .from("client_benefits")
      .update({
        status: "redeemed",
        redeemed_at: new Date().toISOString(),
        admin_note: parsed.note ?? cb.admin_note,
      })
      .eq("id", cb.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "benefit_redeemed",
      entityType: "client_benefit",
      entityId: cb.id,
      meta: { client_id: cb.client_id },
    });
    revalidateBoth();
    return undefined;
  });
}

export async function adminRejectBenefitAction(input: {
  id: string;
  note?: string;
}): Promise<ActionResult> {
  return runAction("benefits.adminReject", async () => {
    const admin = await assertAdmin();
    const parsed = benefitDecisionSchema.parse(input);
    const cb = await loadClientBenefit(parsed.id);
    if (["redeemed", "rejected"].includes(cb.status)) {
      throw new BusinessError("Esse benefício já foi encerrado.");
    }
    const { error } = await vipDb()
      .from("client_benefits")
      .update({
        status: "rejected",
        rejected_at: new Date().toISOString(),
        admin_note: parsed.note ?? cb.admin_note,
      })
      .eq("id", cb.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "benefit_rejected",
      entityType: "client_benefit",
      entityId: cb.id,
      meta: { client_id: cb.client_id, note: parsed.note },
    });
    revalidateBoth();
    return undefined;
  });
}

/**
 * Admin libera o benefício de aniversário do ano (escolhendo o presente).
 * Só para VIP ativo; uma vez por ano.
 */
export async function adminReleaseBirthdayAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return runAction("benefits.adminBirthday", async () => {
    const admin = await assertAdmin();
    const input = releaseBirthdaySchema.parse({
      client_id: str(formData, "client_id"),
      title: str(formData, "title"),
      description: str(formData, "description"),
      validity_days: str(formData, "validity_days"),
    });
    const db = vipDb();
    const { data: profile } = await db
      .from("client_profiles")
      .select("vip_status, birthday")
      .eq("user_id", input.client_id)
      .maybeSingle();
    const p = profile as { vip_status: string; birthday: string | null } | null;
    if (!p) throw new BusinessError("Cliente não encontrada.");
    if (p.vip_status !== "active") throw new BusinessError("O benefício de aniversário é só para VIP ativo.");
    if (!p.birthday) throw new BusinessError("Cadastre a data de aniversário da cliente primeiro.");

    const { data: benefit } = await db.from("benefits").select("*").eq("type", "birthday").eq("active", true).maybeSingle();
    const b = benefit as BenefitRow | null;
    if (!b) throw new BusinessError("Não há benefício de aniversário ativo nas configurações.");

    const settings = await getSettings();
    const year = new Date().getFullYear();
    const cycleKey = birthdayCycleKey(year);
    if (settings.birthday.once_per_year) {
      const { data: existing } = await db
        .from("client_benefits")
        .select("id, status")
        .eq("client_id", input.client_id)
        .eq("benefit_id", b.id)
        .eq("cycle_key", cycleKey)
        .maybeSingle();
      if (existing) throw new BusinessError("O benefício de aniversário deste ano já foi liberado.");
    }
    const days = input.validity_days ?? (await defaultValidityDays(b));
    const now = new Date();
    const { data: created, error } = await db
      .from("client_benefits")
      .insert({
        client_id: input.client_id,
        benefit_id: b.id,
        cycle_key: cycleKey,
        status: "available",
        title: input.title,
        description: input.description,
        available_at: now.toISOString(),
        expires_at: addDays(now, days).toISOString(),
        created_by: admin.id,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "birthday_released",
      entityType: "client_benefit",
      entityId: (created as { id: string }).id,
      meta: { client_id: input.client_id, year, title: input.title },
    });
    revalidateBoth();
    return undefined;
  });
}

/** Admin concede um benefício especial (tipo custom) manualmente. */
export async function adminGrantCustomBenefitAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return runAction("benefits.adminCustom", async () => {
    const admin = await assertAdmin();
    const input = customBenefitSchema.parse({
      client_id: str(formData, "client_id"),
      benefit_id: str(formData, "benefit_id"),
      title: str(formData, "title"),
      description: str(formData, "description"),
      validity_days: str(formData, "validity_days"),
    });
    const db = vipDb();
    const { data: benefit } = await db.from("benefits").select("*").eq("id", input.benefit_id).maybeSingle();
    const b = benefit as BenefitRow | null;
    if (!b || !b.active) throw new BusinessError("Benefício inválido.");
    const days = input.validity_days ?? (await defaultValidityDays(b));
    const now = new Date();
    const cycleKey = `manual:${now.getTime()}`;
    const { data: created, error } = await db
      .from("client_benefits")
      .insert({
        client_id: input.client_id,
        benefit_id: b.id,
        cycle_key: cycleKey,
        status: "available",
        title: input.title,
        description: input.description,
        available_at: now.toISOString(),
        expires_at: addDays(now, days).toISOString(),
        created_by: admin.id,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "benefit_granted",
      entityType: "client_benefit",
      entityId: (created as { id: string }).id,
      meta: { client_id: input.client_id, benefit: b.key, title: input.title },
    });
    revalidateBoth();
    return undefined;
  });
}
