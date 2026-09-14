import "server-only";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/config";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";

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
