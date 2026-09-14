"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { vipDb } from "@/lib/tayssa/db";
import { assertAdmin } from "@/lib/tayssa/auth/guards";
import { hashToken, newToken, revokeAllSessions } from "@/lib/tayssa/auth/session";
import { logAudit } from "@/lib/tayssa/audit";
import { PASSWORD_TOKEN_DAYS, ROUTES, publicUrl } from "@/lib/tayssa/config";
import { adminClientSchema } from "@/lib/tayssa/validation";
import { BusinessError, bool, runAction, str } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult, UserRow, UserStatus } from "@/lib/tayssa/types";

function referralCode(): string {
  // 6 chars legíveis (sem 0/O/1/I)
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

function revalidateAdmin() {
  revalidatePath(ROUTES.admin, "layout");
  revalidatePath(ROUTES.vip, "layout");
}

async function issueAccessLink(userId: string, adminId: string, purpose: "setup" | "reset") {
  const token = newToken();
  const expires = new Date(Date.now() + PASSWORD_TOKEN_DAYS * 24 * 60 * 60 * 1000);
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
    const db = vipDb();
    const { data: dupEmail } = await db.from("users").select("id").ilike("email", input.email).maybeSingle();
    if (dupEmail) throw new BusinessError("Já existe uma conta com esse e-mail.", "email");
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

    const { data: dupEmail } = await db.from("users").select("id").ilike("email", input.email).neq("id", id).maybeSingle();
    if (dupEmail) throw new BusinessError("Já existe uma conta com esse e-mail.", "email");
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
    const db = vipDb();
    const { data: profile } = await db.from("client_profiles").select("vip_status, vip_since").eq("user_id", input.id).maybeSingle();
    const p = profile as { vip_status: string; vip_since: string | null } | null;
    if (!p) throw new BusinessError("Cliente não encontrada.");
    const patch: Record<string, unknown> = { vip_status: input.vip };
    if (input.vip === "active" && !p.vip_since) patch.vip_since = new Date().toISOString();
    if (input.vip === "none") patch.vip_since = null;
    const { error } = await db.from("client_profiles").update(patch).eq("user_id", input.id);
    if (error) throw new Error(error.message);
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

/** Gera novo link de acesso (primeiro acesso ou redefinição). */
export async function adminIssueAccessLinkAction(input: {
  id: string;
}): Promise<ActionResult<{ url: string; expiresAt: string }>> {
  return runAction("clients.accessLink", async () => {
    const admin = await assertAdmin();
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
