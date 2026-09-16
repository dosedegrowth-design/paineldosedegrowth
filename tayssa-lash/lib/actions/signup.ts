"use server";

import { revalidatePath } from "next/cache";
import { vipDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/audit";
import { referralCode } from "@/lib/codes";
import { ROUTES } from "@/lib/config";
import { getSettings } from "@/lib/settings";
import { signupSchema } from "@/lib/validation";
import { BusinessError, runAction, str } from "@/lib/actions/_helpers";
import type { ActionResult } from "@/lib/types";

export type SignupResult = { firstName: string; email: string };

/**
 * A cliente pede acesso pelo site. A conta nasce em `pending`, com a senha
 * que ela escolheu — mas nada abre até a Tayssa aprovar. Nenhuma sessão é
 * criada aqui.
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
    const db = vipDb();

    const { data: dupEmail } = await db.from("users").select("id, status").ilike("email", input.email).maybeSingle();
    if (dupEmail) {
      const st = (dupEmail as { status: string }).status;
      throw new BusinessError(
        st === "pending"
          ? "Esse e-mail já pediu acesso. A Tayssa está revisando."
          : "Já existe uma conta com esse e-mail. Entre por aqui ou peça um novo link para a Tayssa.",
        "email"
      );
    }
    const { data: dupPhone } = await db.from("users").select("id").eq("phone", input.phone).maybeSingle();
    if (dupPhone) throw new BusinessError("Esse WhatsApp já está em uma conta.", "phone");

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
    if (pErr) throw new Error(pErr.message);

    await logAudit({
      actorId: id,
      actorRole: "public",
      action: "signup_requested",
      entityType: "user",
      entityId: id,
      meta: { source: "self" },
    });
    revalidatePath(ROUTES.admin, "layout");
    return { firstName: input.name.trim().split(/\s+/)[0], email: input.email };
  });
}
