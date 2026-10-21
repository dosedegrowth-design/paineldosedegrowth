"use server";

import { revalidatePath } from "next/cache";
import { vipDb } from "@/lib/tayssa/db";
import { assertAdmin, assertClient } from "@/lib/tayssa/auth/guards";
import { logAudit } from "@/lib/tayssa/audit";
import { ROUTES } from "@/lib/tayssa/config";
import { syncReferralEligibility } from "@/lib/tayssa/engine";
import {
  publicReferralSchema,
  referralStatusSchema,
  vipReferralSchema,
} from "@/lib/tayssa/validation";
import { BusinessError, runAction, str } from "@/lib/tayssa/actions/_helpers";
import { ipDaRequisicao, passouDoLimite } from "@/lib/tayssa/limite";
import type { ActionResult, ReferralRow, ReferralStatus } from "@/lib/tayssa/types";

const ALREADY_CLIENT =
  "Essa pessoa já possui um cadastro ou relacionamento com a Tayssa e não pode ser contabilizada como nova indicação.";
const ALREADY_REFERRED = "Essa pessoa já foi indicada. Cada indicação vale uma vez.";
const SELF = "Você não pode indicar a si mesma.";

/** Por que essa indicação não pode contar (null = pode). */
async function motivoInvalida(referredPhone: string): Promise<"cliente" | "indicada" | null> {
  const db = vipDb();
  const [user, ref] = await Promise.all([
    db.from("users").select("id").eq("phone", referredPhone).limit(1),
    db.from("referrals").select("id").eq("referred_phone", referredPhone).neq("status", "rejected").limit(1),
  ]);
  if (user.error) throw new Error(user.error.message);
  if (ref.error) throw new Error(ref.error.message);
  if (user.data?.length) return "cliente";
  if (ref.data?.length) return "indicada";
  return null;
}

async function assertReferredIsNew(referredPhone: string, referrerPhone: string | null) {
  if (referrerPhone && referrerPhone === referredPhone) {
    throw new BusinessError(SELF, "referred_phone");
  }
  const motivo = await motivoInvalida(referredPhone);
  if (motivo === "cliente") throw new BusinessError(ALREADY_CLIENT, "referred_phone");
  if (motivo === "indicada") throw new BusinessError(ALREADY_REFERRED, "referred_phone");
}

/**
 * Indicação pública: quem indica não precisa ter conta. A resposta é a
 * mesma quando a pessoa indicada já é cliente ou já foi indicada — o
 * formulário aberto não revela a ninguém quem é cliente da Tayssa. Nesse
 * caso nada é gravado como indicação; fica só o registro no audit.
 */
export async function submitPublicReferralAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  return runAction("referrals.public", async () => {
    const input = publicReferralSchema.parse({
      referrer_name: str(formData, "referrer_name"),
      referrer_phone: str(formData, "referrer_phone"),
      referred_name: str(formData, "referred_name"),
      referred_phone: str(formData, "referred_phone"),
      note: str(formData, "note"),
    });
    if (input.referrer_phone === input.referred_phone) throw new BusinessError(SELF, "referred_phone");
    const ip = await ipDaRequisicao();
    if (await passouDoLimite({ acoes: ["referral_submitted", "referral_ignored"], ip, maximo: 10, minutos: 60 })) {
      throw new BusinessError("Muitas indicações daqui em pouco tempo. Tente mais tarde ou fale com a Tayssa pelo WhatsApp.");
    }
    const motivo = await motivoInvalida(input.referred_phone);
    if (motivo) {
      await logAudit({
        actorId: null,
        actorRole: "public",
        action: "referral_ignored",
        entityType: "referral",
        entityId: null,
        meta: { source: "public", motivo, ip },
      });
      return { id: "" };
    }

    // Se quem indica já é cliente cadastrada, a indicação conta pra ela.
    const { data: referrers } = await vipDb()
      .from("users")
      .select("id")
      .eq("phone", input.referrer_phone)
      .eq("role", "client")
      .limit(1);
    const referrer = (referrers?.[0] ?? null) as { id: string } | null;

    const { data, error } = await vipDb()
      .from("referrals")
      .insert({
        referrer_user_id: referrer?.id ?? null,
        referrer_name: input.referrer_name,
        referrer_phone: input.referrer_phone,
        referred_name: input.referred_name,
        referred_phone: input.referred_phone,
        note: input.note,
        source: "public",
        status: "pending",
      })
      .select("id")
      .single();
    if (error) {
      // indicada no mesmo instante por outra pessoa: mesma resposta neutra
      if (error.code === "23505") return { id: "" };
      throw new Error(error.message);
    }
    const row = data as { id: string };
    await logAudit({
      actorId: null,
      actorRole: "public",
      action: "referral_submitted",
      entityType: "referral",
      entityId: row.id,
      meta: { source: "public", ip },
    });
    revalidatePath(ROUTES.admin, "layout");
    return { id: row.id };
  });
}

/** Indicação feita dentro do VIP. */
export async function submitVipReferralAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  return runAction("referrals.vip", async () => {
    const me = await assertClient();
    const input = vipReferralSchema.parse({
      referred_name: str(formData, "referred_name"),
      referred_phone: str(formData, "referred_phone"),
      note: str(formData, "note"),
    });
    // sem o WhatsApp dela não dá para conferir a auto-indicação
    if (!me.phone) {
      throw new BusinessError("Antes de indicar, cadastre seu WhatsApp em Meu perfil.", "referred_phone");
    }
    await assertReferredIsNew(input.referred_phone, me.phone);

    const { data, error } = await vipDb()
      .from("referrals")
      .insert({
        referrer_user_id: me.id,
        referrer_name: me.name,
        referrer_phone: me.phone,
        referred_name: input.referred_name,
        referred_phone: input.referred_phone,
        note: input.note,
        source: "vip",
        status: "pending",
      })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") throw new BusinessError(ALREADY_REFERRED, "referred_phone");
      throw new Error(error.message);
    }
    const row = data as { id: string };
    await logAudit({
      actorId: me.id,
      actorRole: "client",
      action: "referral_submitted",
      entityType: "referral",
      entityId: row.id,
      meta: { source: "vip" },
    });
    revalidatePath(ROUTES.vip, "layout");
    revalidatePath(ROUTES.admin, "layout");
    return { id: row.id };
  });
}

const ALLOWED: Record<ReferralStatus, ReferralStatus[]> = {
  pending: ["contacted", "scheduled", "completed", "approved", "rejected"],
  contacted: ["scheduled", "completed", "approved", "rejected", "pending"],
  scheduled: ["completed", "approved", "rejected", "contacted"],
  completed: ["approved", "rejected", "scheduled"],
  approved: ["rejected"],
  rejected: ["pending"],
};

/** Admin move a indicação no pipeline. Só 'approved' conta pra cliente. */
export async function adminSetReferralStatusAction(input: {
  id: string;
  status: ReferralStatus;
  note?: string;
}): Promise<ActionResult> {
  return runAction("referrals.adminStatus", async () => {
    const admin = await assertAdmin();
    const parsed = referralStatusSchema.parse(input);
    const db = vipDb();
    const { data } = await db.from("referrals").select("*").eq("id", parsed.id).single();
    const ref = data as ReferralRow | null;
    if (!ref) throw new BusinessError("Indicação não encontrada.");
    if (ref.status === parsed.status) return undefined;
    if (!ALLOWED[ref.status].includes(parsed.status)) {
      throw new BusinessError("Essa mudança de status não é permitida.");
    }

    if (parsed.status === "approved") {
      // regra: a pessoa indicada não pode ser cliente antiga
      const { data: existing } = await db
        .from("users")
        .select("id, created_at")
        .eq("phone", ref.referred_phone)
        .maybeSingle();
      const u = existing as { id: string; created_at: string } | null;
      if (u && new Date(u.created_at).getTime() < new Date(ref.created_at).getTime()) {
        throw new BusinessError(
          "A pessoa indicada já era cliente antes da indicação. Não pode ser confirmada."
        );
      }
    }

    const now = new Date().toISOString();
    const patch: Partial<ReferralRow> = {
      status: parsed.status,
      status_note: parsed.note,
      reviewed_by: admin.id,
    };
    if (parsed.status === "completed") patch.completed_at = now;
    if (parsed.status === "approved") {
      patch.approved_at = now;
      patch.completed_at = ref.completed_at ?? now;
    }
    if (parsed.status === "rejected" || parsed.status === "pending") {
      patch.approved_at = null;
    }
    const { error } = await db.from("referrals").update(patch).eq("id", parsed.id);
    if (error) throw new Error(error.message);

    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: `referral_${parsed.status}`,
      entityType: "referral",
      entityId: parsed.id,
      meta: { from: ref.status, to: parsed.status, note: parsed.note },
    });

    if (ref.referrer_user_id && (parsed.status === "approved" || ref.status === "approved")) {
      await syncReferralEligibility(ref.referrer_user_id);
    }
    revalidatePath(ROUTES.admin, "layout");
    revalidatePath(ROUTES.vip, "layout");
    return undefined;
  });
}
