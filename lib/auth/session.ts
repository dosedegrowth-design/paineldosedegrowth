import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { vipDb, isDbConfigured, logServerError } from "@/lib/db";
import { SESSION_COOKIE, SESSION_DAYS } from "@/lib/config";
import type { ClientProfileRow, UserRole, UserStatus } from "@/lib/types";

export type SessionUser = {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  nickname: string | null;
  phone: string | null;
  status: UserStatus;
  /** Nome como a cliente gosta de ser chamada. */
  displayName: string;
  firstName: string;
  profile: ClientProfileRow | null;
  isVip: boolean;
};

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}

/** Só pode ser chamado em server action / route handler (seta cookie). */
export async function createSession(userId: string): Promise<void> {
  const token = newToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const h = await headers();
  const { error } = await vipDb().from("sessions").insert({
    user_id: userId,
    token_hash: hashToken(token),
    user_agent: h.get("user-agent")?.slice(0, 300) ?? null,
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    expires_at: expires.toISOString(),
  });
  if (error) throw new Error(error.message);
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(expires));
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await vipDb()
        .from("sessions")
        .update({ revoked_at: new Date().toISOString() })
        .eq("token_hash", hashToken(token));
    } catch (e) {
      logServerError("session.destroy", e);
    }
  }
  store.delete(SESSION_COOKIE);
}

export async function revokeAllSessions(userId: string): Promise<void> {
  await vipDb()
    .from("sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("revoked_at", null);
}

type SessionQueryRow = {
  id: string;
  expires_at: string;
  revoked_at: string | null;
  last_seen_at: string;
  user:
    | {
        id: string;
        role: UserRole;
        email: string;
        name: string;
        nickname: string | null;
        phone: string | null;
        status: UserStatus;
        client_profiles: ClientProfileRow | ClientProfileRow[] | null;
      }
    | null;
};

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/**
 * Usuária da sessão atual (memoizado por request).
 * Retorna null se não há cookie, sessão expirada/revogada ou conta inativa.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  // lê o cookie ANTES de qualquer outra coisa: é o que faz a rota ser
  // renderizada por requisição (nunca prerenderizar página personalizada)
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !isDbConfigured()) return null;
  try {
    const { data, error } = await vipDb()
      .from("sessions")
      .select(
        "id, expires_at, revoked_at, last_seen_at, user:users(id, role, email, name, nickname, phone, status, client_profiles(*))"
      )
      .eq("token_hash", hashToken(token))
      .maybeSingle();
    if (error || !data) return null;
    const row = data as unknown as SessionQueryRow;
    if (row.revoked_at) return null;
    if (new Date(row.expires_at).getTime() < Date.now()) return null;
    const u = row.user;
    if (!u || u.status !== "active") return null;
    const profileRaw = u.client_profiles;
    const profile = Array.isArray(profileRaw) ? profileRaw[0] ?? null : profileRaw;

    // toque de "visto por último" no máximo 1x por hora, sem bloquear
    if (Date.now() - new Date(row.last_seen_at).getTime() > 60 * 60 * 1000) {
      void vipDb()
        .from("sessions")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", row.id)
        .then(() => undefined, () => undefined);
    }

    const displayName = (u.nickname?.trim() || firstName(u.name)) as string;
    return {
      id: u.id,
      role: u.role,
      email: u.email,
      name: u.name,
      nickname: u.nickname,
      phone: u.phone,
      status: u.status,
      displayName,
      firstName: firstName(u.name),
      profile: u.role === "client" ? profile : null,
      isVip: u.role === "client" && profile?.vip_status === "active",
    };
  } catch (e) {
    logServerError("session.get", e);
    return null;
  }
});
