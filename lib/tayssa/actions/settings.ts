"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { vipDb } from "@/lib/tayssa/db";
import { assertAdmin } from "@/lib/tayssa/auth/guards";
import { logAudit } from "@/lib/tayssa/audit";
import { ROUTES } from "@/lib/tayssa/config";
import {
  benefitConfigSchema,
  birthdaySettingsSchema,
  blackoutSchema,
  bookingSettingsSchema,
  businessSettingsSchema,
  catalogServiceSchema,
  loyaltySettingsSchema,
  numerosSettingsSchema,
  rulesSettingsSchema,
  signupSettingsSchema,
  whatsappTemplatesSchema,
} from "@/lib/tayssa/validation";
import { gradeDeHorarios } from "@/lib/tayssa/rules";
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

const NO_DIA = ["No domingo", "Na segunda", "Na terça", "Na quarta", "Na quinta", "Na sexta", "No sábado"];
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Agenda: os dias abertos, o primeiro e o último horário de cada dia, o
 * intervalo entre eles e as regras de antecedência. A grade de cada dia
 * sai daí: segunda das 10h às 16h, de hora em hora → 10h, 11h … 16h.
 */
export async function updateBookingSettingsAction(_p: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return runAction("settings.booking", async () => {
    const admin = await assertAdmin();
    const weekdays = [...new Set(list(fd, "weekdays").map(Number))].filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
    // o intervalo primeiro: sem ele não há grade para montar
    const { intervalo_min } = z
      .object({ intervalo_min: bookingSettingsSchema.shape.intervalo_min })
      .parse({ intervalo_min: str(fd, "intervalo_min") });
    const slots_por_dia: Record<string, string[]> = {};
    for (const d of weekdays) {
      const de = str(fd, `de_${d}`).trim();
      const ate = str(fd, `ate_${d}`).trim();
      if (!HHMM.test(de) || !HHMM.test(ate)) {
        throw new BusinessError(`Escolha o primeiro e o último horário ${NO_DIA[d].toLowerCase()}.`, `horas_${d}`);
      }
      if (ate < de) throw new BusinessError(`${NO_DIA[d]}, o último horário está antes do primeiro.`, `horas_${d}`);
      const grade = gradeDeHorarios(de, ate, intervalo_min);
      if (grade.length > 24) {
        throw new BusinessError(`${NO_DIA[d]} ficariam mais de 24 horários. Aumente o intervalo.`, `horas_${d}`);
      }
      slots_por_dia[String(d)] = grade;
    }
    const input = bookingSettingsSchema.parse({
      weekdays,
      // a lista geral guarda todos os horários da semana (reserva de quem não tem lista própria)
      slots: [...new Set(Object.values(slots_por_dia).flat())],
      slots_por_dia,
      intervalo_min,
      lead_hours: str(fd, "lead_hours"),
      horizon_days: str(fd, "horizon_days"),
      default_duration_min: str(fd, "default_duration_min"),
      max_open_per_client: str(fd, "max_open_per_client"),
      deposit_reais: str(fd, "deposit_reais").replace(",", "."),
    });
    await saveSetting("booking", input, admin.id);
    return undefined;
  });
}

/** Cartão de fidelidade: tamanho (vale para cartões novos) e o presente ao fechar. */
export async function updateLoyaltySettingsAction(_p: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return runAction("settings.loyalty", async () => {
    const admin = await assertAdmin();
    const input = loyaltySettingsSchema.parse({
      card_size: str(fd, "card_size"),
      card_reward_title: str(fd, "card_reward_title"),
      card_reward_description: str(fd, "card_reward_description"),
    });
    await saveSetting("loyalty", input, admin.id);
    return undefined;
  });
}

/** Cadastro pelo site: aberto ou fechado, e a mensagem de boas-vindas ao aprovar. */
export async function updateSignupSettingsAction(_p: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return runAction("settings.signup", async () => {
    const admin = await assertAdmin();
    const input = signupSettingsSchema.parse({
      open: bool(fd, "open"),
      welcome_template: str(fd, "welcome_template"),
    });
    if (!input.welcome_template.includes("{url}")) {
      throw new BusinessError("A mensagem precisa conter {url} — é por ali que a cliente entra.", "welcome_template");
    }
    await saveSetting("signup", input, admin.id);
    return undefined;
  });
}

/** Quadro de números do site: só o que ela escreve aparece; vazio = o quadro some. */
export async function updateNumerosSettingsAction(_p: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return runAction("settings.numeros", async () => {
    const admin = await assertAdmin();
    const valores = list(fd, "valor");
    const rotulos = list(fd, "rotulo");
    const detalhes = list(fd, "detalhe");
    const input = numerosSettingsSchema.parse({
      periodo: str(fd, "periodo"),
      fonte: str(fd, "fonte"),
      itens: valores.map((valor, i) => ({ valor, rotulo: rotulos[i] ?? "", detalhe: detalhes[i] ?? "" })),
      nao_seguidores: str(fd, "nao_seguidores").replace("%", "").replace(",", ".").trim(),
    });
    await saveSetting("numeros", input, admin.id);
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
      preco: str(fd, "preco"),
      duration_min: str(fd, "duration_min"),
      preco_manutencao: str(fd, "preco_manutencao"),
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
          preco: input.preco,
          duration_min: input.duration_min,
          preco_manutencao: input.preco_manutencao,
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
        preco: input.preco,
        duration_min: input.duration_min,
        preco_manutencao: input.preco_manutencao,
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
