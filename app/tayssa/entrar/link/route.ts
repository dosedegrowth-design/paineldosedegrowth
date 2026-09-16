import { NextResponse, type NextRequest } from "next/server";
import { vipDb, isDbConfigured, logServerError } from "@/lib/tayssa/db";
import { createSession, hashToken } from "@/lib/tayssa/auth/session";
import { logAudit } from "@/lib/tayssa/audit";
import { ROUTES } from "@/lib/tayssa/config";
import type { UserRole, UserStatus } from "@/lib/tayssa/types";

export const dynamic = "force-dynamic";

/**
 * Entrada por link — dois tipos, guardados do mesmo jeito (só o hash
 * vive no banco) e os dois com validade:
 *
 *   magic · convite. Vale UMA entrada: é queimado antes de abrir a
 *           sessão. É o que a Tayssa manda para uma cliente.
 *   demo  · teste. Abre quantas vezes quiser, em quantos aparelhos
 *           quiser, até expirar. Cada aparelho ganha a própria sessão.
 *
 * Link inválido, vencido ou já usado não conta história: volta para a
 * tela de entrada.
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
      .in("purpose", ["magic", "demo"])
      .maybeSingle();
    if (error) throw new Error(error.message);

    const row = data as unknown as {
      id: string;
      user_id: string;
      purpose: "magic" | "demo";
      used_at: string | null;
      expires_at: string;
      user: { role: UserRole; status: UserStatus } | null;
    } | null;

    if (!row || new Date(row.expires_at) < new Date()) return fail();
    if (row.purpose === "magic" && row.used_at) return fail();
    if (!row.user || row.user.status !== "active") return fail();

    if (row.purpose === "magic") {
      // convite: queima antes de abrir a sessão — um link, uma entrada
      const { error: burnError } = await db
        .from("password_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("id", row.id)
        .is("used_at", null);
      if (burnError) throw new Error(burnError.message);
    } else {
      // teste: não queima, só registra a última vez que alguém entrou
      await db.from("password_tokens").update({ used_at: new Date().toISOString() }).eq("id", row.id);
    }

    await createSession(row.user_id);
    await logAudit({
      actorId: row.user_id,
      actorRole: row.user.role === "admin" ? "admin" : "client",
      action: row.purpose === "demo" ? "login_link_demo" : "login_link",
      entityType: "user",
      entityId: row.user_id,
    });
    return NextResponse.redirect(new URL(row.user.role === "admin" ? ROUTES.admin : ROUTES.vip, request.url));
  } catch (e) {
    logServerError("auth.magicLink", e);
    return fail();
  }
}
