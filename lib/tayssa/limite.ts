import "server-only";
import { headers } from "next/headers";
import { vipDb } from "@/lib/tayssa/db";

/**
 * Freio para o que qualquer pessoa consegue chamar sem conta (entrar,
 * pedir acesso, indicar): conta no audit_log quantas vezes o mesmo
 * endereço de internet fez aquilo na janela de tempo. O IP vai no `meta`
 * de cada registro.
 */

export async function ipDaRequisicao(): Promise<string | null> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim();
  return ip ? ip.slice(0, 64) : null;
}

export async function passouDoLimite(opcoes: {
  acoes: string[];
  ip: string | null;
  maximo: number;
  minutos: number;
}): Promise<boolean> {
  if (!opcoes.ip) return false;
  const desde = new Date(Date.now() - opcoes.minutos * 60 * 1000).toISOString();
  const { count, error } = await vipDb()
    .from("audit_log")
    .select("id", { count: "exact", head: true })
    .in("action", opcoes.acoes)
    .eq("meta->>ip", opcoes.ip)
    .gte("created_at", desde);
  if (error) return false; // o freio nunca tranca a porta por falha própria
  return (count ?? 0) >= opcoes.maximo;
}
