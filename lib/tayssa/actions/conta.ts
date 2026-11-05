"use server";

import { revalidatePath } from "next/cache";
import { vipDb } from "@/lib/tayssa/db";
import { hashPassword } from "@/lib/tayssa/auth/password";
import { autenticar } from "@/lib/tayssa/auth/entrar";
import { createSession, destroySession, getSessionUser } from "@/lib/tayssa/auth/session";
import { logAudit } from "@/lib/tayssa/audit";
import { referralCode } from "@/lib/tayssa/codes";
import { ROUTES } from "@/lib/tayssa/config";
import { contaAgendaSchema, loginSchema } from "@/lib/tayssa/validation";
import { ipDaRequisicao, passouDoLimite } from "@/lib/tayssa/limite";
import { BusinessError, runAction } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult } from "@/lib/tayssa/types";

/**
 * A conta da agenda (05/11/2026): com o VIP fechado, a cliente cria a conta
 * na própria folha de agendar do site (nome, WhatsApp e senha, sem e-mail)
 * ou entra com a que já tem, e marca o horário ali mesmo. A conta nasce
 * ativa, sem aprovação: é só para a agenda. O VIP, quando abrir, a Tayssa
 * liga na ficha dela.
 */

export type ContaNaAgenda = { nome: string };

const primeiroNome = (u: { nickname?: string | null; name: string }) =>
  u.nickname?.trim() || u.name.trim().split(/\s+/)[0];

/** Quem está com a sessão aberta neste aparelho (só cliente: a folha agenda para ela). */
export async function contaDaAgendaAction(): Promise<ActionResult<ContaNaAgenda | null>> {
  return runAction("conta.sessao", async () => {
    const user = await getSessionUser();
    if (!user || user.role !== "client") return null;
    return { nome: user.displayName };
  });
}

export async function criarContaAgendaAction(input: {
  nome: string;
  whatsapp: string;
  senha: string;
}): Promise<ActionResult<ContaNaAgenda>> {
  return runAction("conta.criar", async () => {
    const p = contaAgendaSchema.parse(input);
    const ip = await ipDaRequisicao();
    if (await passouDoLimite({ acoes: ["conta_agenda_criada", "conta_agenda_repetida"], ip, maximo: 6, minutos: 60 })) {
      throw new BusinessError("Muitas contas criadas daqui em pouco tempo. Tente de novo mais tarde.");
    }
    const db = vipDb();
    const { data: ja, error: jErr } = await db
      .from("users")
      .select("id")
      .eq("phone", p.whatsapp)
      .eq("role", "client")
      .neq("status", "rejected")
      .limit(1);
    if (jErr) throw new Error(jErr.message);
    const existente = (ja?.[0] ?? null) as { id: string } | null;
    if (existente) {
      await logAudit({
        actorId: null,
        actorRole: "public",
        action: "conta_agenda_repetida",
        entityType: "user",
        entityId: existente.id,
        meta: { ip },
      });
      throw new BusinessError("Esse WhatsApp já tem conta. Toque em “Já tenho conta” e entre com a sua senha.", "whatsapp");
    }

    const password_hash = await hashPassword(p.senha);
    const { data: criado, error } = await db
      .from("users")
      .insert({
        role: "client",
        email: null,
        name: p.nome,
        phone: p.whatsapp,
        password_hash,
        status: "active",
        signup_source: "agenda",
      })
      .select("id")
      .single();
    if (error) {
      // outra aba criou a mesma conta no mesmo instante (índice único do WhatsApp)
      if (error.code === "23505") {
        throw new BusinessError("Esse WhatsApp já tem conta. Toque em “Já tenho conta” e entre com a sua senha.", "whatsapp");
      }
      throw new Error(error.message);
    }
    const id = (criado as { id: string }).id;
    const { error: pErr } = await db.from("client_profiles").insert({
      user_id: id,
      vip_status: "none",
      referral_code: referralCode(),
    });
    if (pErr) {
      // sem o perfil a conta fica pela metade (e o WhatsApp "já em uso"): desfaz
      await db.from("users").delete().eq("id", id);
      throw new Error(pErr.message);
    }

    await createSession(id);
    await logAudit({
      actorId: id,
      actorRole: "client",
      action: "conta_agenda_criada",
      entityType: "user",
      entityId: id,
      meta: { ip },
    });
    revalidatePath(ROUTES.admin, "layout");
    return { nome: primeiroNome({ name: p.nome }) };
  });
}

export async function entrarNaAgendaAction(input: { login: string; senha: string }): Promise<ActionResult<ContaNaAgenda>> {
  return runAction("conta.entrar", async () => {
    const p = loginSchema.parse({ login: input.login, password: input.senha });
    const ip = await ipDaRequisicao();
    const user = await autenticar(p.login, p.password, ip);
    if (user.role !== "client") {
      throw new BusinessError("Essa é a conta do painel. Para agendar, entre com uma conta de cliente.");
    }
    await createSession(user.id);
    await vipDb().from("users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id);
    await logAudit({ actorId: user.id, actorRole: "client", action: "login", entityType: "user", entityId: user.id, meta: { onde: "agenda" } });
    return { nome: primeiroNome(user) };
  });
}

/** "Não é você?": sai da conta sem sair da folha de agendar. */
export async function sairDaContaAction(): Promise<ActionResult> {
  return runAction("conta.sair", async () => {
    const user = await getSessionUser();
    await destroySession();
    if (user) {
      await logAudit({ actorId: user.id, actorRole: user.role, action: "logout", entityType: "user", entityId: user.id });
    }
    return undefined;
  });
}
