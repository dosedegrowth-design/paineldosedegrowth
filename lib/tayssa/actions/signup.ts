"use server";

import { revalidatePath } from "next/cache";
import { vipDb } from "@/lib/tayssa/db";
import { hashPassword } from "@/lib/tayssa/auth/password";
import { logAudit } from "@/lib/tayssa/audit";
import { referralCode } from "@/lib/tayssa/codes";
import { ROUTES } from "@/lib/tayssa/config";
import { getSettings } from "@/lib/tayssa/settings";
import { signupSchema } from "@/lib/tayssa/validation";
import { ipDaRequisicao, passouDoLimite } from "@/lib/tayssa/limite";
import { BusinessError, runAction, str } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult } from "@/lib/tayssa/types";

export type SignupResult = { firstName: string; email: string };

/**
 * A cliente pede acesso pelo site. A conta nasce em `pending`, com a senha
 * que ela escolheu — mas nada abre até a Tayssa aprovar. Nenhuma sessão é
 * criada aqui. E-mail ou WhatsApp que já têm conta recebem a mesma resposta
 * de um pedido novo: o formulário não revela a ninguém quem é cliente.
 */
export async function signupAction(
  _prev: ActionResult<SignupResult> | null,
  formData: FormData
): Promise<ActionResult<SignupResult>> {
  return runAction("signup.request", async () => {
    const settings = await getSettings();
    if (!settings.signup.open) {
      throw new BusinessError("O cadastro está fechado no momento. Fale com a Tayssa pelo WhatsApp.");
    }
    const input = signupSchema.parse({
      name: str(formData, "name"),
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      password: str(formData, "password"),
      confirm: str(formData, "confirm"),
      birthday: str(formData, "birthday"),
      message: str(formData, "message"),
    });
    const ip = await ipDaRequisicao();
    if (await passouDoLimite({ acoes: ["signup_requested", "signup_repeated"], ip, maximo: 5, minutos: 60 })) {
      throw new BusinessError("Muitos pedidos daqui em pouco tempo. Tente mais tarde ou fale com a Tayssa pelo WhatsApp.");
    }
    const db = vipDb();
    const firstName = input.name.trim().split(/\s+/)[0];

    const [porEmail, porFone] = await Promise.all([
      db.from("users").select("id").eq("email", input.email).limit(1),
      db.from("users").select("id").eq("phone", input.phone).limit(1),
    ]);
    if (porEmail.error) throw new Error(porEmail.error.message);
    if (porFone.error) throw new Error(porFone.error.message);
    const existente = (porEmail.data?.[0] ?? porFone.data?.[0]) as { id: string } | undefined;
    if (existente) {
      await logAudit({
        actorId: null,
        actorRole: "public",
        action: "signup_repeated",
        entityType: "user",
        entityId: existente.id,
        meta: { ip, por: porEmail.data?.length ? "email" : "phone" },
      });
      return { firstName, email: input.email };
    }

    const password_hash = await hashPassword(input.password);
    const now = new Date().toISOString();
    const { data: created, error } = await db
      .from("users")
      .insert({
        role: "client",
        email: input.email,
        name: input.name,
        phone: input.phone,
        password_hash,
        status: "pending",
        signup_source: "self",
        signup_message: input.message,
        requested_at: now,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const id = (created as { id: string }).id;

    const { error: pErr } = await db.from("client_profiles").insert({
      user_id: id,
      birthday: input.birthday,
      vip_status: "none",
      referral_code: referralCode(),
    });
    if (pErr) {
      // sem o perfil a conta fica pela metade (e o e-mail "já em uso"): desfaz
      await db.from("users").delete().eq("id", id);
      throw new Error(pErr.message);
    }

    await logAudit({
      actorId: id,
      actorRole: "public",
      action: "signup_requested",
      entityType: "user",
      entityId: id,
      meta: { source: "self", ip },
    });
    revalidatePath(ROUTES.admin, "layout");
    return { firstName, email: input.email };
  });
}
