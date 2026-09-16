import { NextResponse, type NextRequest } from "next/server";
import { vipDb, isDbConfigured, logServerError } from "@/lib/tayssa/db";
import { createSession, hashToken } from "@/lib/tayssa/auth/session";
import { logAudit } from "@/lib/tayssa/audit";
import { ROUTES } from "@/lib/tayssa/config";
import type { UserRole, UserStatus } from "@/lib/tayssa/types";

export const dynamic = "force-dynamic";

/**
 * Entrada por link: a Tayssa manda um link e a cliente entra sem digitar
 * senha. O link vale uma vez só, expira, e é guardado no banco apenas
 * como hash — quem vê a linha não consegue entrar com ela.
 *
 * Link inválido, vencido ou já usado não conta história: manda para a
 * tela de entrada normal.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t")?.trim();
  const fail = () => NextResponse.redirect(new URL(`${ROUTES.login}?link=expirado`, request.url));
  if (!token || !isDbConfigured()) return fail();

  try {
    const db = vipDb();
    const { data, error } = await db
      .from("password_tokens")
      .select("id, user_id, purpose, used_at, expires_at, user:users!password_tokens_user_id_fkey(role, status)")
      .eq("token_hash", hashToken(token))
      .eq("purpose", "magic")
      .maybeSingle();
    if (error) throw new Error(error.message);

    const row = data as unknown as {
      id: string;
      user_id: string;
      used_at: string | null;
      expires_at: string;
      user: { role: UserRole; status: UserStatus } | null;
    } | null;

    if (!row || row.used_at || new Date(row.expires_at) < new Date()) return fail();
    if (!row.user || row.user.status !== "active") return fail();

    // queima o link antes de abrir a sessão: um link, uma entrada
    const { error: burnError } = await db
      .from("password_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", row.id)
      .is("used_at", null);
    if (burnError) throw new Error(burnError.message);

    await createSession(row.user_id);
    await logAudit({
      actorId: row.user_id,
      actorRole: row.user.role === "admin" ? "admin" : "client",
      action: "login_link",
      entityType: "user",
      entityId: row.user_id,
    });
    return NextResponse.redirect(new URL(row.user.role === "admin" ? ROUTES.admin : ROUTES.vip, request.url));
  } catch (e) {
    logServerError("auth.magicLink", e);
    return fail();
  }
}
