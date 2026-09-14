"use server";

import { revalidatePath } from "next/cache";
import { vipDb } from "@/lib/tayssa/db";
import { assertAdmin } from "@/lib/tayssa/auth/guards";
import { logAudit } from "@/lib/tayssa/audit";
import { ROUTES } from "@/lib/tayssa/config";
import {
  benefitConfigSchema,
  birthdaySettingsSchema,
  blackoutSchema,
  businessSettingsSchema,
  catalogServiceSchema,
  rulesSettingsSchema,
  whatsappTemplatesSchema,
} from "@/lib/tayssa/validation";
import { BusinessError, bool, list, runAction, str } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult } from "@/lib/tayssa/types";

function revalidateAll() {
  revalidatePath(ROUTES.home, "layout");
}

async function saveSetting(key: string, value: unknown, adminId: string) {
  const { error } = await vipDb()
    .from("settings")
    .upsert({ key, value, updated_by: adminId, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  await logAudit({
    actorId: adminId,
    actorRole: "admin",
    action: "settings_updated",
    entityType: "settings",
    entityId: key,
  });
  revalidateAll();
}

export async function updateBusinessSettingsAction(_p: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return runAction("settings.business", async () => {
    const admin = await assertAdmin();
    const input = businessSettingsSchema.parse({
      name: str(fd, "name"),
      tagline: str(fd, "tagline"),
      specialty: str(fd, "specialty"),
      whatsapp: str(fd, "whatsapp"),
      instagram_url: str(fd, "instagram_url"),
      instagram_handle: str(fd, "instagram_handle"),
    });
    await saveSetting("business", input, admin.id);
    return undefined;
  });
}

export async function updateRulesSettingsAction(_p: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return runAction("settings.rules", async () => {
    const admin = await assertAdmin();
    const input = rulesSettingsSchema.parse({
      vip_min_services: str(fd, "vip_min_services"),
      inactivity_days: str(fd, "inactivity_days"),
      benefit_validity_days: str(fd, "benefit_validity_days"),
    });
    await saveSetting("rules", input, admin.id);
    return undefined;
  });
}

export async function updateBirthdaySettingsAction(_p: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return runAction("settings.birthday", async () => {
    const admin = await assertAdmin();
    const rules = str(fd, "rules")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const input = birthdaySettingsSchema.parse({
      window_days_before: str(fd, "window_days_before"),
      window_days_after: str(fd, "window_days_after"),
      once_per_year: bool(fd, "once_per_year"),
      rules,
    });
    await saveSetting("birthday", input, admin.id);
    return undefined;
  });
}

export async function updateWhatsappTemplatesAction(_p: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return runAction("settings.whatsapp", async () => {
    const admin = await assertAdmin();
    const keys = [
      "public_schedule",
      "public_vip_info",
      "public_refer",
      "vip_support",
      "vip_refer",
      "benefit_request",
      "birthday_request",
      "inactive_outreach",
    ] as const;
    const input = whatsappTemplatesSchema.parse(
      Object.fromEntries(keys.map((k) => [k, str(fd, k)]))
    );
    await saveSetting("whatsapp", input, admin.id);
    return undefined;
  });
}

// ---------------- Catálogo de serviços ----------------

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function upsertCatalogServiceAction(_p: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return runAction("settings.service", async () => {
    const admin = await assertAdmin();
    const input = catalogServiceSchema.parse({
      id: str(fd, "id") || undefined,
      name: str(fd, "name"),
      description: str(fd, "description"),
      point_value: str(fd, "point_value"),
      active: bool(fd, "active"),
      sort_order: str(fd, "sort_order") || undefined,
    });
    const db = vipDb();
    if (input.id) {
      const { error } = await db
        .from("services")
        .update({
          name: input.name,
          description: input.description,
          point_value: input.point_value,
          active: input.active,
          sort_order: input.sort_order ?? 0,
        })
        .eq("id", input.id);
      if (error) throw new Error(error.message);
    } else {
      const base = slugify(input.name) || "servico";
      const slug = `${base}-${Date.now().toString(36)}`;
      const { error } = await db.from("services").insert({
        slug,
        name: input.name,
        description: input.description,
        point_value: input.point_value,
        active: input.active,
        sort_order: input.sort_order ?? 50,
      });
      if (error) throw new Error(error.message);
    }
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: input.id ? "service_catalog_updated" : "service_catalog_created",
      entityType: "service",
      entityId: input.id ?? null,
      meta: { name: input.name, point_value: input.point_value },
    });
    revalidateAll();
    return undefined;
  });
}

// ---------------- Benefícios (regras) ----------------

export async function updateBenefitConfigAction(_p: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return runAction("settings.benefit", async () => {
    const admin = await assertAdmin();
    const input = benefitConfigSchema.parse({
      id: str(fd, "id"),
      name: str(fd, "name"),
      description: str(fd, "description"),
      threshold: str(fd, "threshold") ? str(fd, "threshold") : null,
      validity_days: str(fd, "validity_days") ? str(fd, "validity_days") : null,
      active: bool(fd, "active"),
    });
    const db = vipDb();
    const { data } = await db.from("benefits").select("type").eq("id", input.id).maybeSingle();
    const b = data as { type: string } | null;
    if (!b) throw new BusinessError("Benefício não encontrado.");
    if (b.type !== "birthday" && b.type !== "custom" && (!input.threshold || input.threshold <= 0)) {
      throw new BusinessError("Informe um limite maior que zero.", "threshold");
    }
    const percent = str(fd, "percent");
    const patch: Record<string, unknown> = {
      name: input.name,
      description: input.description,
      threshold: b.type === "birthday" ? null : input.threshold,
      validity_days: input.validity_days,
      active: input.active,
    };
    if (b.type === "referral" && percent) {
      const n = Number(percent);
      if (!Number.isFinite(n) || n < 0 || n > 100) throw new BusinessError("Percentual inválido.", "percent");
      patch.config = { percent: n };
    }
    const { error } = await db.from("benefits").update(patch).eq("id", input.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "benefit_config_updated",
      entityType: "benefit",
      entityId: input.id,
      meta: patch,
    });
    revalidateAll();
    return undefined;
  });
}

// ---------------- Blackout ----------------

export async function addBlackoutAction(_p: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return runAction("settings.blackoutAdd", async () => {
    const admin = await assertAdmin();
    const input = blackoutSchema.parse({
      name: str(fd, "name"),
      starts_on: str(fd, "starts_on"),
      ends_on: str(fd, "ends_on"),
      benefit_types: list(fd, "benefit_types"),
    });
    if (input.ends_on < input.starts_on) throw new BusinessError("O fim precisa ser depois do início.", "ends_on");
    const { error } = await vipDb().from("blackout_periods").insert({ ...input, active: true });
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "blackout_added",
      entityType: "blackout",
      meta: input,
    });
    revalidateAll();
    return undefined;
  });
}

export async function toggleBlackoutAction(input: { id: string; active: boolean }): Promise<ActionResult> {
  return runAction("settings.blackoutToggle", async () => {
    const admin = await assertAdmin();
    const { error } = await vipDb().from("blackout_periods").update({ active: input.active }).eq("id", input.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: input.active ? "blackout_enabled" : "blackout_disabled",
      entityType: "blackout",
      entityId: input.id,
    });
    revalidateAll();
    return undefined;
  });
}
