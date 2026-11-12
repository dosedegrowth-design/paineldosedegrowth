"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { vipDb } from "@/lib/tayssa/db";
import { hashPassword } from "@/lib/tayssa/auth/password";
import { logAudit } from "@/lib/tayssa/audit";
import { referralCode } from "@/lib/tayssa/codes";
import { ROUTES } from "@/lib/tayssa/config";
import { getSettings } from "@/lib/tayssa/settings";
import { signupSchema } from "@/lib/tayssa/validation";
import { ipDaRequisicao, passouDoLimite } from "@/lib/tayssa/limite";
import { avisarTayssa } from "@/lib/tayssa/avisos";
import { BusinessError, runAction, str } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult } from "@/lib/tayssa/types";

export type SignupResult = { firstName: string };

/**
 * Cadastro VIP pelo site (Lucas, 09/11/2026; 12/11/2026: "se a cliente faz o
 * cadastro e não é VIP, ela vai ter atendimento, horários, tudo mais;
 * aprovar o quê?"). A conta nasce ativa, com a senha que ela escolheu: ela
 * já entra e marca horário. O cadastro fica como pedido de VIP
 * (`requested_at`, sem `reviewed_at`) e a Tayssa só decide o VIP no painel. Sem e-mail: ela entra com o WhatsApp.
 * Um WhatsApp, uma conta: quem já agendou pelo site é mandada para entrar
 * (a folha de agendar já diz o mesmo, então isso não revela nada novo).
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
      throw new BusinessError("Esse WhatsApp já tem conta. Toque em “Já tenho conta” e entre com a sua senha.", "phone");
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
        status: "active",
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
    // nova cliente: aviso no celular da Tayssa (VIP ou não), para ela mandar a saudação
    after(() =>
      avisarTayssa({
        titulo: "Nova cliente",
        corpo: `${input.name} fez o cadastro no site.`,
        url: ROUTES.adminClient(id),
        tag: `cliente-${id}`,
      }),
    );
    revalidatePath(ROUTES.admin, "layout");
    return { firstName };
  });
}
