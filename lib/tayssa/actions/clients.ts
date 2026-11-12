"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { vipDb } from "@/lib/tayssa/db";
import { assertAdmin } from "@/lib/tayssa/auth/guards";
import { hashToken, newToken, revokeAllSessions } from "@/lib/tayssa/auth/session";
import { logAudit } from "@/lib/tayssa/audit";
import { referralCode } from "@/lib/tayssa/codes";
import { PASSWORD_TOKEN_DAYS, ROUTES, publicUrl } from "@/lib/tayssa/config";
import { pedidoDeVip } from "@/lib/tayssa/rules";
import { adminClientSchema, reviewSignupSchema } from "@/lib/tayssa/validation";
import { MENSAGEM_CADASTRO_VIP_LIBERADO, MENSAGEM_SAUDACAO, renderTemplate, whatsappUrl } from "@/lib/tayssa/whatsapp";
import { BusinessError, bool, runAction, str } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult, UserRow, UserStatus } from "@/lib/tayssa/types";

function revalidateAdmin() {
  revalidatePath(ROUTES.admin, "layout");
  revalidatePath(ROUTES.vip, "layout");
}

async function issueAccessLink(userId: string, adminId: string, purpose: "setup" | "reset") {
  const token = newToken();
  const expires = new Date(Date.now() + PASSWORD_TOKEN_DAYS * 24 * 60 * 60 * 1000);
  // um link novo aposenta os de senha que ainda não foram usados: só o último vale
  await vipDb()
    .from("password_tokens")
    .update({ expires_at: new Date().toISOString() })
    .eq("user_id", userId)
    .in("purpose", ["setup", "reset"])
    .is("used_at", null);
  const { error } = await vipDb().from("password_tokens").insert({
    user_id: userId,
    token_hash: hashToken(token),
    purpose,
    expires_at: expires.toISOString(),
    created_by: adminId,
  });
  if (error) throw new Error(error.message);
  return {
    url: `${publicUrl(ROUTES.setPassword)}?token=${token}`,
    expiresAt: expires.toISOString(),
  };
}

type CreatedClient = { id: string; accessUrl: string; phone: string | null; firstName: string };

export async function adminCreateClientAction(
  _prev: ActionResult<CreatedClient> | null,
  formData: FormData
): Promise<ActionResult<CreatedClient>> {
  return runAction("clients.create", async () => {
    const admin = await assertAdmin();
    const input = adminClientSchema.parse({
      name: str(formData, "name"),
      email: str(formData, "email"),
      nickname: str(formData, "nickname"),
      phone: str(formData, "phone"),
      birthday: str(formData, "birthday"),
      notes: str(formData, "notes"),
      vip: bool(formData, "vip"),
    });
    // o login dela é o WhatsApp ou o e-mail: sem nenhum dos dois, ela não entra
    if (!input.email && !input.phone) throw new BusinessError("Informe o WhatsApp ou o e-mail: é por ele que ela entra.", "phone");
    const db = vipDb();
    if (input.email) {
      const { data: dupEmail } = await db.from("users").select("id").eq("email", input.email).maybeSingle();
      if (dupEmail) throw new BusinessError("Já existe uma conta com esse e-mail.", "email");
    }
    if (input.phone) {
      const { data: dupPhone } = await db.from("users").select("id").eq("phone", input.phone).maybeSingle();
      if (dupPhone) throw new BusinessError("Já existe uma conta com esse telefone.", "phone");
    }

    const { data: created, error } = await db
      .from("users")
      .insert({
        role: "client",
        email: input.email,
        name: input.name,
        nickname: input.nickname,
        phone: input.phone,
        status: "active",
        created_by: admin.id,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const id = (created as { id: string }).id;

    const now = new Date().toISOString();
    const { error: pErr } = await db.from("client_profiles").insert({
      user_id: id,
      birthday: input.birthday,
      vip_status: input.vip ? "active" : "none",
      vip_since: input.vip ? now : null,
      referral_code: referralCode(),
      notes: input.notes,
    });
    if (pErr) throw new Error(pErr.message);

    const link = await issueAccessLink(id, admin.id, "setup");
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "client_created",
      entityType: "user",
      entityId: id,
      meta: { vip: Boolean(input.vip) },
    });
    revalidateAdmin();
    return {
      id,
      accessUrl: link.url,
      phone: input.phone,
      firstName: (input.nickname ?? input.name).trim().split(/\s+/)[0],
    };
  });
}

export async function adminUpdateClientAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return runAction("clients.update", async () => {
    const admin = await assertAdmin();
    const id = str(formData, "id");
    const input = adminClientSchema.parse({
      name: str(formData, "name"),
      email: str(formData, "email"),
      nickname: str(formData, "nickname"),
      phone: str(formData, "phone"),
      birthday: str(formData, "birthday"),
      notes: str(formData, "notes"),
    });
    const db = vipDb();
    const { data: current } = await db.from("users").select("*").eq("id", id).eq("role", "client").maybeSingle();
    if (!current) throw new BusinessError("Cliente não encontrada.");

    if (!input.email && !input.phone) throw new BusinessError("Informe o WhatsApp ou o e-mail: é por ele que ela entra.", "phone");
    if (input.email) {
      const { data: dupEmail } = await db.from("users").select("id").eq("email", input.email).neq("id", id).maybeSingle();
      if (dupEmail) throw new BusinessError("Já existe uma conta com esse e-mail.", "email");
    }
    if (input.phone) {
      const { data: dupPhone } = await db.from("users").select("id").eq("phone", input.phone).neq("id", id).maybeSingle();
      if (dupPhone) throw new BusinessError("Já existe uma conta com esse telefone.", "phone");
    }

    const { error } = await db
      .from("users")
      .update({ name: input.name, email: input.email, nickname: input.nickname, phone: input.phone })
      .eq("id", id);
    if (error) throw new Error(error.message);
    const { error: pErr } = await db
      .from("client_profiles")
      .update({ birthday: input.birthday, notes: input.notes })
      .eq("user_id", id);
    if (pErr) throw new Error(pErr.message);

    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "client_updated",
      entityType: "user",
      entityId: id,
    });
    revalidateAdmin();
    return undefined;
  });
}

export async function adminSetVipAction(input: {
  id: string;
  vip: "active" | "none" | "suspended";
}): Promise<ActionResult> {
  return runAction("clients.setVip", async () => {
    const admin = await assertAdmin();
    input = z.object({ id: z.string().uuid("Registro inválido"), vip: z.enum(["active", "none", "suspended"]) }).parse(input);
    const db = vipDb();
    const { data: profile } = await db.from("client_profiles").select("vip_status, vip_since").eq("user_id", input.id).maybeSingle();
    const p = profile as { vip_status: string; vip_since: string | null } | null;
    if (!p) throw new BusinessError("Cliente não encontrada.");
    const patch: Record<string, unknown> = { vip_status: input.vip };
    if (input.vip === "active" && !p.vip_since) patch.vip_since = new Date().toISOString();
    if (input.vip === "none") patch.vip_since = null;
    const { error } = await db.from("client_profiles").update(patch).eq("user_id", input.id);
    if (error) throw new Error(error.message);
    // incluiu no VIP pela ficha quem tinha pedido o VIP no cadastro: o pedido está respondido
    if (input.vip === "active") {
      const { error: rErr } = await db
        .from("users")
        .update({ reviewed_at: new Date().toISOString(), reviewed_by: admin.id })
        .eq("id", input.id)
        .eq("signup_source", "self")
        .is("reviewed_at", null);
      if (rErr) throw new Error(rErr.message);
    }
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: `vip_${input.vip}`,
      entityType: "user",
      entityId: input.id,
      meta: { from: p.vip_status, to: input.vip },
    });
    revalidateAdmin();
    return undefined;
  });
}

export async function adminSetClientStatusAction(input: {
  id: string;
  status: UserStatus;
}): Promise<ActionResult> {
  return runAction("clients.setStatus", async () => {
    const admin = await assertAdmin();
    // aqui só ativa, desativa ou suspende: aprovar/recusar cadastro tem fluxo próprio
    input = z.object({ id: z.string().uuid("Registro inválido"), status: z.enum(["active", "inactive", "suspended"]) }).parse(input);
    const db = vipDb();
    const { data } = await db.from("users").select("id, status").eq("id", input.id).eq("role", "client").maybeSingle();
    const u = data as Pick<UserRow, "id" | "status"> | null;
    if (!u) throw new BusinessError("Cliente não encontrada.");
    const { error } = await db.from("users").update({ status: input.status }).eq("id", input.id);
    if (error) throw new Error(error.message);
    if (input.status !== "active") await revokeAllSessions(input.id);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: `client_${input.status}`,
      entityType: "user",
      entityId: input.id,
      meta: { from: u.status, to: input.status },
    });
    revalidateAdmin();
    return undefined;
  });
}

export type SignupReview = {
  /** aprovou o VIP (true) ou não aprovou (false) */
  vip: boolean;
  /** link de WhatsApp com a saudação pronta (do VIP ou de boas-vindas), quando ela tem telefone */
  welcomeUrl: string | null;
};

/**
 * Pedido de VIP de quem fez o cadastro no site (Lucas, 12/11/2026: fora o
 * VIP, não há o que aprovar). A conta já marca horário desde o cadastro;
 * aqui a Tayssa só decide o VIP: aprova (entra VIP) ou não aprova (continua
 * cliente, o VIP vem pela sequência de atendimentos). Conta antiga ainda em
 * `pending` abre junto, nas duas respostas.
 */
export async function adminReviewSignupAction(input: { id: string; vip: boolean }): Promise<ActionResult<SignupReview>> {
  return runAction("clients.reviewSignup", async () => {
    const admin = await assertAdmin();
    const parsed = reviewSignupSchema.parse(input);
    const db = vipDb();
    const { data } = await db
      .from("users")
      .select("id, status, name, nickname, phone, signup_source, reviewed_at, client_profiles(vip_status)")
      .eq("id", parsed.id)
      .eq("role", "client")
      .maybeSingle();
    const u = data as
      | (Pick<UserRow, "id" | "status" | "name" | "nickname" | "phone" | "signup_source" | "reviewed_at"> & {
          client_profiles: { vip_status: string } | { vip_status: string }[] | null;
        })
      | null;
    if (!u) throw new BusinessError("Pedido não encontrado.");
    const perfil = Array.isArray(u.client_profiles) ? u.client_profiles[0] : u.client_profiles;
    if (!pedidoDeVip(u, perfil?.vip_status)) throw new BusinessError("Esse pedido já foi decidido.");

    const now = new Date().toISOString();
    // só passa quem ainda não foi decidida: dois toques não decidem duas vezes
    const { data: decidido, error } = await db
      .from("users")
      .update({ status: "active", reviewed_at: now, reviewed_by: admin.id })
      .eq("id", u.id)
      .is("reviewed_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!decidido) throw new BusinessError("Esse pedido já foi decidido.");

    if (parsed.vip) {
      const { error: vErr } = await db.from("client_profiles").update({ vip_status: "active", vip_since: now }).eq("user_id", u.id);
      if (vErr) throw new Error(vErr.message);
    }

    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: parsed.vip ? "vip_pedido_aprovado" : "vip_pedido_nao_aprovado",
      entityType: "user",
      entityId: u.id,
      meta: { vip: parsed.vip },
    });
    revalidateAdmin();

    // a saudação pronta: aprovou o VIP, o recado do VIP (o padrão da Gabi); senão, as boas-vindas
    const welcomeUrl = u.phone
      ? whatsappUrl(
          u.phone,
          renderTemplate(parsed.vip ? MENSAGEM_CADASTRO_VIP_LIBERADO : MENSAGEM_SAUDACAO, {
            name: (u.nickname ?? u.name).trim().split(/\s+/)[0],
            url: publicUrl(ROUTES.login),
          })
        )
      : null;
    return { vip: parsed.vip, welcomeUrl };
  });
}

/** Gera novo link de acesso (primeiro acesso ou redefinição). */
export async function adminIssueAccessLinkAction(input: {
  id: string;
}): Promise<ActionResult<{ url: string; expiresAt: string }>> {
  return runAction("clients.accessLink", async () => {
    const admin = await assertAdmin();
    input = { id: z.string().uuid("Registro inválido").parse(input.id) };
    const db = vipDb();
    const { data } = await db.from("users").select("id, password_hash, status").eq("id", input.id).maybeSingle();
    const u = data as Pick<UserRow, "id" | "password_hash" | "status"> | null;
    if (!u) throw new BusinessError("Conta não encontrada.");
    if (u.status !== "active") throw new BusinessError("Reative a conta antes de gerar o link.");
    const link = await issueAccessLink(u.id, admin.id, u.password_hash ? "reset" : "setup");
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "access_link_issued",
      entityType: "user",
      entityId: u.id,
      meta: { purpose: u.password_hash ? "reset" : "setup" },
    });
    return link;
  });
}

export async function adminRevokeSessionsAction(input: { id: string }): Promise<ActionResult> {
  return runAction("clients.revokeSessions", async () => {
    const admin = await assertAdmin();
    input = { id: z.string().uuid("Registro inválido").parse(input.id) };
    await revokeAllSessions(input.id);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "sessions_revoked",
      entityType: "user",
      entityId: input.id,
    });
    return undefined;
  });
}
