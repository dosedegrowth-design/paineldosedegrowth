"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { vipDb } from "@/lib/tayssa/db";
import { hashPassword, verifyPassword } from "@/lib/tayssa/auth/password";
import {
  createSession,
  destroySession,
  getSessionUser,
  hashToken,
  revokeAllSessions,
} from "@/lib/tayssa/auth/session";
import { logAudit } from "@/lib/tayssa/audit";
import {
  LOGIN_MAX_ATTEMPTS,
  LOGIN_WINDOW_MINUTES,
  ROUTES,
} from "@/lib/tayssa/config";
import {
  changePasswordSchema,
  loginSchema,
  setPasswordSchema,
} from "@/lib/tayssa/validation";
import { BusinessError, runAction, str } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult, UserRow } from "@/lib/tayssa/types";
import { assertClient } from "@/lib/tayssa/auth/guards";

const INVALID = "E-mail ou senha não conferem.";

function safeNext(next: string): string | null {
  return next.startsWith("/tayssa/") && !next.startsWith("//") ? next : null;
}

async function tooManyAttempts(email: string): Promise<boolean> {
  const since = new Date(Date.now() - LOGIN_WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count } = await vipDb()
    .from("audit_log")
    .select("id", { count: "exact", head: true })
    .eq("action", "login_failed")
    .eq("meta->>email", email)
    .gte("created_at", since);
  return (count ?? 0) >= LOGIN_MAX_ATTEMPTS;
}

export async function loginAction(
  _prev: ActionResult<{ redirectTo: string; name: string }> | null,
  formData: FormData
): Promise<ActionResult<{ redirectTo: string; name: string }>> {
  const result = await runAction("auth.login", async () => {
    const input = loginSchema.parse({
      email: str(formData, "email"),
      password: str(formData, "password"),
    });

    if (await tooManyAttempts(input.email)) {
      throw new BusinessError(
        "Muitas tentativas. Aguarde alguns minutos e tente novamente."
      );
    }

    const { data } = await vipDb()
      .from("users")
      .select("*")
      .ilike("email", input.email)
      .maybeSingle();
    const user = (data ?? null) as UserRow | null;

    const valid = user ? await verifyPassword(input.password, user.password_hash) : false;
    if (!user || !valid) {
      await logAudit({
        actorId: null,
        actorRole: "public",
        action: "login_failed",
        entityType: "user",
        entityId: user?.id ?? null,
        meta: { email: input.email },
      });
      throw new BusinessError(INVALID);
    }
    if (user.status !== "active") {
      throw new BusinessError(
        "Seu acesso está pausado no momento. Fale com a Tayssa para reativar."
      );
    }

    await createSession(user.id);
    await vipDb()
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", user.id);
    await logAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "login",
      entityType: "user",
      entityId: user.id,
    });

    const next = safeNext(str(formData, "next"));
    const home = user.role === "admin" ? ROUTES.admin : ROUTES.vip;
    const name = user.nickname?.trim() || user.name.trim().split(/\s+/)[0];
    return { redirectTo: next ?? home, name };
  });
  return result;
}

export async function logoutAction(): Promise<void> {
  const user = await getSessionUser();
  await destroySession();
  if (user) {
    await logAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "logout",
      entityType: "user",
      entityId: user.id,
    });
  }
  redirect(ROUTES.home);
}

export async function setPasswordAction(
  _prev: ActionResult<{ redirectTo: string }> | null,
  formData: FormData
): Promise<ActionResult<{ redirectTo: string }>> {
  return runAction("auth.setPassword", async () => {
    const input = setPasswordSchema.parse({
      token: str(formData, "token"),
      password: str(formData, "password"),
      confirm: str(formData, "confirm"),
    });
    const db = vipDb();
    const { data, error: lookupError } = await db
      .from("password_tokens")
      // FK nomeada: `password_tokens` aponta para `users` por user_id e por
      // created_by, e o embed sem o nome da constraint é rejeitado.
      .select(
        "id, user_id, expires_at, used_at, user:users!password_tokens_user_id_fkey(id, role, status)"
      )
      .eq("token_hash", hashToken(input.token))
      .maybeSingle();
    // falha de banco não pode virar "link expirado": runAction registra e
    // mostra a mensagem genérica, sem confundir a cliente
    if (lookupError) throw new Error(lookupError.message);
    const row = data as unknown as {
      id: string;
      user_id: string;
      expires_at: string;
      used_at: string | null;
      user: { id: string; role: "client" | "admin"; status: string } | null;
    } | null;

    if (!row || row.used_at || new Date(row.expires_at).getTime() < Date.now()) {
      throw new BusinessError(
        "Esse link não é mais válido. Peça um novo para a Tayssa."
      );
    }
    if (!row.user || row.user.status !== "active") {
      throw new BusinessError("Esse acesso está pausado. Fale com a Tayssa.");
    }

    const password_hash = await hashPassword(input.password);
    const { error } = await db
      .from("users")
      .update({ password_hash })
      .eq("id", row.user_id);
    if (error) throw new Error(error.message);
    await db
      .from("password_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", row.id);

    await revokeAllSessions(row.user_id);
    await createSession(row.user_id);
    await logAudit({
      actorId: row.user_id,
      actorRole: row.user.role,
      action: "password_set",
      entityType: "user",
      entityId: row.user_id,
    });
    return { redirectTo: row.user.role === "admin" ? ROUTES.admin : ROUTES.vip };
  });
}

export async function changePasswordAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return runAction("auth.changePassword", async () => {
    const me = await assertClient();
    const input = changePasswordSchema.parse({
      current: str(formData, "current"),
      password: str(formData, "password"),
      confirm: str(formData, "confirm"),
    });
    const { data } = await vipDb()
      .from("users")
      .select("password_hash")
      .eq("id", me.id)
      .single();
    const ok = await verifyPassword(input.current, (data as { password_hash: string | null } | null)?.password_hash ?? null);
    if (!ok) throw new BusinessError("A senha atual não confere.", "current");
    const password_hash = await hashPassword(input.password);
    const { error } = await vipDb().from("users").update({ password_hash }).eq("id", me.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: me.id,
      actorRole: "client",
      action: "password_changed",
      entityType: "user",
      entityId: me.id,
    });
    revalidatePath(ROUTES.vipProfile);
    return undefined;
  });
}
