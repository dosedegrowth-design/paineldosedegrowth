import "server-only";
import { vipDb } from "@/lib/tayssa/db";
import { hashToken } from "@/lib/tayssa/auth/session";
import type { UserRole, UserStatus } from "@/lib/tayssa/types";

export type LinkDeEntrada = {
  id: string;
  user_id: string;
  purpose: "magic" | "demo";
  used_at: string | null;
  role: UserRole;
  nome: string;
};

/**
 * Entrada por link — dois tipos, guardados do mesmo jeito (só o hash vive
 * no banco) e os dois com validade:
 *
 *   magic · convite. Vale UMA entrada: é queimado ao entrar.
 *   demo  · teste. Abre quantas vezes quiser, em quantos aparelhos quiser,
 *           até expirar. Cada aparelho ganha a própria sessão.
 *
 * Só lê: abrir o link não gasta nada (a prévia do WhatsApp abre o link
 * sozinha antes da cliente tocar). Quem gasta é o botão "Entrar".
 */
export async function lerLinkDeEntrada(token: string | null | undefined): Promise<LinkDeEntrada | null> {
  const t = token?.trim();
  if (!t) return null;
  const { data, error } = await vipDb()
    .from("password_tokens")
    .select("id, user_id, purpose, used_at, expires_at, user:users!password_tokens_user_id_fkey(role, status, name, nickname)")
    .eq("token_hash", hashToken(t))
    .in("purpose", ["magic", "demo"])
    .maybeSingle();
  if (error) throw new Error(error.message);
  const row = data as unknown as {
    id: string;
    user_id: string;
    purpose: "magic" | "demo";
    used_at: string | null;
    expires_at: string;
    user: { role: UserRole; status: UserStatus; name: string; nickname: string | null } | null;
  } | null;
  if (!row || new Date(row.expires_at).getTime() < Date.now()) return null;
  if (row.purpose === "magic" && row.used_at) return null;
  if (!row.user || row.user.status !== "active") return null;
  return {
    id: row.id,
    user_id: row.user_id,
    purpose: row.purpose,
    used_at: row.used_at,
    role: row.user.role,
    nome: row.user.nickname?.trim() || row.user.name.trim().split(/\s+/)[0],
  };
}
