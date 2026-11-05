"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { logServerError, vipDb } from "@/lib/tayssa/db";
import { lerLinkDeEntrada } from "@/lib/tayssa/auth/link";
import { hashPassword, verifyPassword } from "@/lib/tayssa/auth/password";
import { autenticar } from "@/lib/tayssa/auth/entrar";
import {
  createSession,
  destroySession,
  getSessionUser,
  hashToken,
  revokeAllSessions,
} from "@/lib/tayssa/auth/session";
import { logAudit } from "@/lib/tayssa/audit";
import { ROUTES } from "@/lib/tayssa/config";
import {
  changePasswordSchema,
  loginSchema,
  setPasswordSchema,
} from "@/lib/tayssa/validation";
import { BusinessError, bool, runAction, str } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult } from "@/lib/tayssa/types";
import { assertClient } from "@/lib/tayssa/auth/guards";
import { ipDaRequisicao } from "@/lib/tayssa/limite";
import { getSettings } from "@/lib/tayssa/settings";

function safeNext(next: string): string | null {
  return next.startsWith("/tayssa/") && !next.startsWith("//") ? next : null;
}

/**
 * Para onde a cliente vai ao entrar: com o VIP fechado, direto aos horários
 * dela; quem a Tayssa ativou como VIP entra pelo início do VIP.
 */
async function inicioDaCliente(userId: string): Promise<string> {
  const { rules } = await getSettings();
  if (rules.vip_aberto) return ROUTES.vip;
  const { data } = await vipDb().from("client_profiles").select("vip_status").eq("user_id", userId).maybeSingle();
  return (data as { vip_status?: string } | null)?.vip_status === "active" ? ROUTES.vip : ROUTES.vipBook;
}

export async function loginAction(
  _prev: ActionResult<{ redirectTo: string; name: string }> | null,
  formData: FormData
): Promise<ActionResult<{ redirectTo: string; name: string }>> {
  const result = await runAction("auth.login", async () => {
    // WhatsApp ou e-mail no mesmo campo ("email" ainda chega de telas antigas)
    const input = loginSchema.parse({
      login: str(formData, "login") || str(formData, "email"),
      password: str(formData, "password"),
    });
    const ip = await ipDaRequisicao();
    const user = await autenticar(input.login, input.password, ip);
    // "Manter conectada neste celular": só desliga quando a tela manda o campo desmarcado
    const lembrar = str(formData, "lembrar_campo") ? bool(formData, "lembrar") : true;

    await createSession(user.id, { lembrar });
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
    const home = user.role === "admin" ? ROUTES.admin : await inicioDaCliente(user.id);
    const name = user.nickname?.trim() || user.name.trim().split(/\s+/)[0];
    return { redirectTo: next ?? home, name };
  });
  return result;
}

/**
 * O botão "Entrar" da página do link. Convite (magic) é queimado com uma
 * atualização condicional: se dois toques chegam juntos, só um entra.
 * Link que não vale mais volta para a tela de entrada, sem contar história.
 */
export async function entrarPorLinkAction(formData: FormData): Promise<void> {
  const token = str(formData, "t");
  let destino = `${ROUTES.login}?link=expirado`;
  try {
    const link = await lerLinkDeEntrada(token);
    if (link) {
      const db = vipDb();
      let pode = true;
      if (link.purpose === "magic") {
        const { data: queimado, error } = await db
          .from("password_tokens")
          .update({ used_at: new Date().toISOString() })
          .eq("id", link.id)
          .is("used_at", null)
          .select("id");
        if (error) throw new Error(error.message);
        pode = Boolean(queimado?.length);
      } else {
        // teste: não queima, só registra a última vez que alguém entrou
        await db.from("password_tokens").update({ used_at: new Date().toISOString() }).eq("id", link.id);
      }
      if (pode) {
        await createSession(link.user_id);
        await logAudit({
          actorId: link.user_id,
          actorRole: link.role === "admin" ? "admin" : "client",
          action: link.purpose === "demo" ? "login_link_demo" : "login_link",
          entityType: "user",
          entityId: link.user_id,
        });
        destino = link.role === "admin" ? ROUTES.admin : await inicioDaCliente(link.user_id);
      }
    }
  } catch (e) {
    logServerError("auth.magicLink", e);
  }
  redirect(destino);
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
      // só link de senha: convite (magic) e teste (demo) não trocam senha de ninguém
      .in("purpose", ["setup", "reset"])
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

    // gasta o link antes de tudo: dois envios juntos, só um passa
    const { data: queimado, error: burnErr } = await db
      .from("password_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", row.id)
      .is("used_at", null)
      .select("id");
    if (burnErr) throw new Error(burnErr.message);
    if (!queimado?.length) throw new BusinessError("Esse link não é mais válido. Peça um novo para a Tayssa.");

    const password_hash = await hashPassword(input.password);
    const { error } = await db
      .from("users")
      .update({ password_hash })
      .eq("id", row.user_id);
    if (error) throw new Error(error.message);

    await revokeAllSessions(row.user_id);
    await createSession(row.user_id);
    await logAudit({
      actorId: row.user_id,
      actorRole: row.user.role,
      action: "password_set",
      entityType: "user",
      entityId: row.user_id,
    });
    return { redirectTo: row.user.role === "admin" ? ROUTES.admin : await inicioDaCliente(row.user_id) };
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
    // senha nova fecha as outras portas: os outros aparelhos saem, este continua
    await revokeAllSessions(me.id);
    await createSession(me.id);
    await logAudit({
      actorId: me.id,
      actorRole: "client",
      action: "password_changed",
      entityType: "user",
      entityId: me.id,
    });
    // a página de verdade mora em /tayssa/vip/perfil (ROUTES.vipProfile é o apelido)
    revalidatePath(ROUTES.vip, "layout");
    return undefined;
  });
}
