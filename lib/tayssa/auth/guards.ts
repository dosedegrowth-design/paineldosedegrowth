import "server-only";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/tayssa/config";
import { getSessionUser, type SessionUser } from "@/lib/tayssa/auth/session";
import { getSettings } from "@/lib/tayssa/settings";

/**
 * Guards de página (redirecionam) e de action (lançam AuthError).
 * Toda página/action autenticada chama um destes ANTES de tocar no banco —
 * a autorização acontece perto do dado, não só no middleware.
 */

export class AuthError extends Error {
  constructor(message = "Sua sessão expirou. Entre novamente.") {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(ROUTES.login);
  return user;
}

export async function requireClientPage(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "client") redirect(ROUTES.admin);
  return user;
}

/**
 * Cartão, pontos, benefícios e jornada. Com o programa fechado para todas
 * (Configurações → Programa VIP), quem não é VIP vê essas telas trancadas,
 * com a regra e o andamento dela (Lucas, 09/11/2026: "campos bloqueados");
 * antes ia direto para os horários. Quem a Tayssa ativou como VIP na ficha
 * vê tudo.
 */
export async function requireProgramaVipPage(): Promise<{ user: SessionUser; bloqueado: boolean }> {
  const [user, settings] = await Promise.all([requireClientPage(), getSettings()]);
  return { user, bloqueado: !settings.rules.vip_aberto && !user.isVip };
}

export async function requireAdminPage(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect(ROUTES.restricted);
  return user;
}

export async function assertClient(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || user.role !== "client") throw new AuthError();
  return user;
}

export async function assertAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    throw new AuthError("Essa ação é exclusiva da administradora.");
  }
  return user;
}
