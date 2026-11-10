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

export type SignupResult = { firstName: string };

/**
 * Cadastro VIP pelo site (Lucas, 09/11/2026). A conta nasce em `pending`,
 * com a senha que ela escolheu, e nada abre até a Tayssa liberar no painel
 * (ela avisa a Tayssa pelo WhatsApp na tela final). Nenhuma sessão é criada
 * aqui. Sem e-mail: ela entra com o WhatsApp. Um WhatsApp, uma conta: quem
 * já agendou pelo site é mandada para entrar (a folha de agendar já diz o
 * mesmo, então isso não revela nada novo).
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
      apelido: str(formData, "apelido"),
      phone: str(formData, "phone"),
      password: str(formData, "password"),
      confirm: str(formData, "confirm"),
      birthday: str(formData, "birthday"),
      message: str(formData, "message"),
    });
    const ip = await ipDaRequisicao();
    if (await passouDoLimite({ acoes: ["signup_requested", "signup_repeated"], ip, maximo: 5, minutos: 60 })) {
      throw new BusinessError("Muitos cadastros daqui em pouco tempo. Tente mais tarde ou fale com a Tayssa pelo WhatsApp.");
    }
    const db = vipDb();
    const firstName = input.apelido ?? input.name.trim().split(/\s+/)[0];

    const { data: ja, error: jErr } = await db
      .from("users")
      .select("id, status")
      .eq("phone", input.phone)
      .eq("role", "client")
      .neq("status", "rejected")
      .limit(1);
    if (jErr) throw new Error(jErr.message);
    const existente = (ja?.[0] ?? null) as { id: string; status: string } | null;
    if (existente) {
      await logAudit({
        actorId: null,
        actorRole: "public",
        action: "signup_repeated",
        entityType: "user",
        entityId: existente.id,
        meta: { ip, por: "phone" },
      });
      throw new BusinessError(
        existente.status === "pending"
          ? "Esse WhatsApp já fez o cadastro e está esperando a Tayssa liberar. Mande uma mensagem para ela."
          : "Esse WhatsApp já tem conta. Toque em “Já tenho conta” e entre com a sua senha.",
        "phone"
      );
    }

    const password_hash = await hashPassword(input.password);
    const now = new Date().toISOString();
    const { data: created, error } = await db
      .from("users")
      .insert({
        role: "client",
        email: null,
        name: input.name,
        nickname: input.apelido,
        phone: input.phone,
        password_hash,
        status: "pending",
        signup_source: "self",
        signup_message: input.message,
        requested_at: now,
      })
      .select("id")
      .single();
    if (error) {
      // outra aba fez o mesmo cadastro no mesmo instante (índice único do WhatsApp)
      if (error.code === "23505") {
        throw new BusinessError("Esse WhatsApp já tem conta. Toque em “Já tenho conta” e entre com a sua senha.", "phone");
      }
      throw new Error(error.message);
    }
    const id = (created as { id: string }).id;

    const { error: pErr } = await db.from("client_profiles").insert({
      user_id: id,
      birthday: input.birthday,
      vip_status: "none",
      referral_code: referralCode(),
    });
    if (pErr) {
      // sem o perfil a conta fica pela metade (e o WhatsApp "já em uso"): desfaz
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
    return { firstName };
  });
}
