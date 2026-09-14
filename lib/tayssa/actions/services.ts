"use server";

import { revalidatePath } from "next/cache";
import { vipDb } from "@/lib/tayssa/db";
import { assertAdmin, assertClient } from "@/lib/tayssa/auth/guards";
import { logAudit } from "@/lib/tayssa/audit";
import { ROUTES } from "@/lib/tayssa/config";
import { stampVisit, syncLoyaltyEligibility } from "@/lib/tayssa/engine";
import {
  adminServiceEntrySchema,
  reviewSchema,
  serviceSubmissionSchema,
} from "@/lib/tayssa/validation";
import { nowInBusinessTz } from "@/lib/tayssa/format";
import { BusinessError, runAction, str } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult, ClientServiceRow, ServiceRow } from "@/lib/tayssa/types";

async function getService(id: string): Promise<ServiceRow> {
  const { data } = await vipDb().from("services").select("*").eq("id", id).maybeSingle();
  const s = data as ServiceRow | null;
  if (!s || !s.active) throw new BusinessError("Escolha um serviço válido.", "service_id");
  return s;
}

function notInFuture(iso: string) {
  const today = nowInBusinessTz();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  if (iso > todayISO) throw new BusinessError("A data não pode ser no futuro.", "service_date");
}

/** Cliente registra um atendimento para a Tayssa confirmar. Nada conta antes disso. */
export async function submitServiceAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  return runAction("services.submit", async () => {
    const me = await assertClient();
    const input = serviceSubmissionSchema.parse({
      service_id: str(formData, "service_id"),
      service_date: str(formData, "service_date"),
      amount: str(formData, "amount"),
      notes: str(formData, "notes"),
    });
    notInFuture(input.service_date);
    const service = await getService(input.service_id);

    // evita duplicado óbvio: mesmo serviço, mesmo dia, ainda pendente/aprovado
    const { data: dup } = await vipDb()
      .from("client_services")
      .select("id")
      .eq("client_id", me.id)
      .eq("service_id", service.id)
      .eq("service_date", input.service_date)
      .neq("status", "rejected")
      .maybeSingle();
    if (dup) throw new BusinessError("Esse atendimento já está registrado.", "service_date");

    const { data, error } = await vipDb()
      .from("client_services")
      .insert({
        client_id: me.id,
        service_id: service.id,
        service_name: service.name,
        service_date: input.service_date,
        amount: input.amount,
        points: service.point_value,
        status: "pending",
        notes: input.notes,
        submitted_by: "client",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const row = data as { id: string };
    await logAudit({
      actorId: me.id,
      actorRole: "client",
      action: "service_submitted",
      entityType: "client_service",
      entityId: row.id,
    });
    revalidatePath(ROUTES.vip, "layout");
    revalidatePath(ROUTES.admin, "layout");
    return { id: row.id };
  });
}

/** Admin registra um atendimento já confirmado (entra aprovado). */
export async function adminAddServiceAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  return runAction("services.adminAdd", async () => {
    const admin = await assertAdmin();
    const input = adminServiceEntrySchema.parse({
      client_id: str(formData, "client_id"),
      service_id: str(formData, "service_id"),
      service_date: str(formData, "service_date"),
      amount: str(formData, "amount"),
      points_override: str(formData, "points_override"),
      notes: str(formData, "notes"),
    });
    notInFuture(input.service_date);
    const service = await getService(input.service_id);
    const now = new Date().toISOString();
    const { data, error } = await vipDb()
      .from("client_services")
      .insert({
        client_id: input.client_id,
        service_id: service.id,
        service_name: service.name,
        service_date: input.service_date,
        amount: input.amount,
        points: input.points_override ?? service.point_value,
        status: "approved",
        notes: input.notes,
        submitted_by: "admin",
        reviewed_by: admin.id,
        reviewed_at: now,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const row = data as { id: string };
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "service_added",
      entityType: "client_service",
      entityId: row.id,
      meta: { client_id: input.client_id, points: input.points_override ?? service.point_value },
    });
    // visita confirmada: carimbo no cartão + marcos de pontos
    await stampVisit(input.client_id, {
      id: row.id,
      service_name: service.name,
      points: input.points_override ?? service.point_value,
      reviewed_at: now,
    });
    await syncLoyaltyEligibility(input.client_id);
    revalidatePath(ROUTES.admin, "layout");
    revalidatePath(ROUTES.vip, "layout");
    return { id: row.id };
  });
}

export async function adminReviewServiceAction(input: {
  id: string;
  decision: "approve" | "reject";
  note?: string;
  points?: number | null;
}): Promise<ActionResult> {
  return runAction("services.adminReview", async () => {
    const admin = await assertAdmin();
    const parsed = reviewSchema.parse({ id: input.id, note: input.note });
    const db = vipDb();
    const { data } = await db.from("client_services").select("*").eq("id", parsed.id).single();
    const row = data as ClientServiceRow | null;
    if (!row) throw new BusinessError("Registro não encontrado.");
    if (row.status !== "pending") throw new BusinessError("Esse registro já foi revisado.");

    const points =
      input.decision === "approve" && Number.isInteger(input.points) && (input.points as number) >= 0
        ? (input.points as number)
        : row.points;

    const { error } = await db
      .from("client_services")
      .update({
        status: input.decision === "approve" ? "approved" : "rejected",
        points,
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
        review_note: parsed.note,
      })
      .eq("id", parsed.id);
    if (error) throw new Error(error.message);

    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: input.decision === "approve" ? "service_approved" : "service_rejected",
      entityType: "client_service",
      entityId: parsed.id,
      meta: { client_id: row.client_id, points, note: parsed.note },
    });
    if (input.decision === "approve") {
      await stampVisit(row.client_id, {
        id: row.id,
        service_name: row.service_name,
        points,
        reviewed_at: new Date().toISOString(),
      });
      await syncLoyaltyEligibility(row.client_id);
    }
    revalidatePath(ROUTES.admin, "layout");
    revalidatePath(ROUTES.vip, "layout");
    return undefined;
  });
}
