import "server-only";
import { vipDb } from "@/lib/tayssa/db";
import { verifyPassword } from "@/lib/tayssa/auth/password";
import { logAudit } from "@/lib/tayssa/audit";
import { LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MINUTES } from "@/lib/tayssa/config";
import { chaveDoLogin } from "@/lib/tayssa/phone";
import { passouDoLimite } from "@/lib/tayssa/limite";
import { BusinessError } from "@/lib/tayssa/actions/_helpers";
import type { UserRow } from "@/lib/tayssa/types";

export const LOGIN_INVALIDO = "WhatsApp, e-mail ou senha não conferem.";

/** Tentativas erradas na janela: pelo login (protege a conta) e pelo endereço de internet (protege todas). */
async function tentativasDemais(login: string, ip: string | null): Promise<boolean> {
  const desde = new Date(Date.now() - LOGIN_WINDOW_MINUTES * 60 * 1000).toISOString();
  const [porLogin, porIp] = await Promise.all([
    vipDb()
      .from("audit_log")
      .select("id", { count: "exact", head: true })
      .eq("action", "login_failed")
      .eq("meta->>login", login)
      .gte("created_at", desde),
    passouDoLimite({ acoes: ["login_failed"], ip, maximo: LOGIN_MAX_ATTEMPTS * 4, minutos: LOGIN_WINDOW_MINUTES }),
  ]);
  return (porLogin.count ?? 0) >= LOGIN_MAX_ATTEMPTS || porIp;
}

/**
 * Confere WhatsApp (ou e-mail) e senha e devolve a conta. Não abre sessão:
 * quem chama decide para onde ela vai. Erro de senha e conta que não existe
 * dão a mesma mensagem (ninguém descobre quem é cliente por aqui).
 */
export async function autenticar(loginBruto: string, senha: string, ip: string | null): Promise<UserRow> {
  const chave = chaveDoLogin(loginBruto);
  const login = chave ? `${chave.tipo}:${chave.valor}` : loginBruto.trim().toLowerCase().slice(0, 120);
  if (await tentativasDemais(login, ip)) {
    throw new BusinessError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
  }

  let user: UserRow | null = null;
  if (chave?.tipo === "email") {
    // e-mail exato (gravado em minúsculas): com ilike, um "_" virava curinga
    const { data, error } = await vipDb().from("users").select("*").eq("email", chave.valor).maybeSingle();
    if (error) throw new Error(error.message);
    user = (data ?? null) as UserRow | null;
  } else if (chave?.tipo === "whatsapp") {
    // o número de cliente é único (índice users_cliente_phone_idx); a Tayssa entra pelo e-mail
    const { data, error } = await vipDb()
      .from("users")
      .select("*")
      .eq("phone", chave.valor)
      .eq("role", "client")
      .neq("status", "rejected")
      .limit(2);
    if (error) throw new Error(error.message);
    const contas = (data ?? []) as UserRow[];
    user = contas.length === 1 ? contas[0] : null;
  }

  const valida = user ? await verifyPassword(senha, user.password_hash) : false;
  if (!user || !valida) {
    await logAudit({
      actorId: null,
      actorRole: "public",
      action: "login_failed",
      entityType: "user",
      entityId: user?.id ?? null,
      meta: { login, ip },
    });
    throw new BusinessError(LOGIN_INVALIDO);
  }
  if (user.status !== "active") {
    // a senha confere, mas a porta ainda não abre: cada motivo tem sua tela
    const err = new BusinessError(
      user.status === "pending"
        ? "Seu cadastro está com a Tayssa. Mande uma mensagem para ela liberar; assim que ela liberar, é só entrar."
        : user.status === "rejected"
          ? "Esse acesso não foi liberado. Fale com a Tayssa pelo WhatsApp."
          : "Seu acesso está pausado no momento. Fale com a Tayssa para reativar."
    );
    err.code = user.status;
    throw err;
  }
  return user;
}
