"use server";

import { revalidatePath } from "next/cache";
import { vipDb } from "@/lib/db";
import { assertAdmin } from "@/lib/auth/guards";
import { logAudit } from "@/lib/audit";
import { ROUTES } from "@/lib/config";
import { registerVisit } from "@/lib/visits";
import { appointmentReviewSchema } from "@/lib/validation";
import { toISODate } from "@/lib/rules";
import { nowInBusinessTz } from "@/lib/format";
import { BusinessError, runAction } from "@/lib/actions/_helpers";
import type { ActionResult, AppointmentRow, ServiceRow } from "@/lib/types";

async function loadAppointment(id: string): Promise<AppointmentRow> {
  const { data } = await vipDb().from("appointments").select("*").eq("id", id).maybeSingle();
  const a = data as AppointmentRow | null;
  if (!a) throw new BusinessError("Horário não encontrado.");
  return a;
}

function revalidate() {
  revalidatePath(ROUTES.admin, "layout");
  revalidatePath(ROUTES.vip, "layout");
}

/** Pedido de horário vira compromisso. Só a Tayssa faz isso. */
export async function adminConfirmAppointmentAction(input: { id: string; note?: string }): Promise<ActionResult> {
  return runAction("appointments.confirm", async () => {
    const admin = await assertAdmin();
    const parsed = appointmentReviewSchema.parse(input);
    const a = await loadAppointment(parsed.id);
    if (a.status !== "requested") throw new BusinessError("Esse horário não está aguardando confirmação.");
    const { error } = await vipDb()
      .from("appointments")
      .update({ status: "confirmed", admin_note: parsed.note, reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
      .eq("id", a.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "appointment_confirmed",
      entityType: "appointment",
      entityId: a.id,
      meta: { client_id: a.client_id, date: a.scheduled_date, time: a.scheduled_time },
    });
    revalidate();
    return undefined;
  });
}

/** Cancela um pedido ou um horário confirmado. O motivo é visto pela cliente. */
export async function adminCancelAppointmentAction(input: { id: string; note?: string }): Promise<ActionResult> {
  return runAction("appointments.cancel", async () => {
    const admin = await assertAdmin();
    const parsed = appointmentReviewSchema.parse(input);
    const a = await loadAppointment(parsed.id);
    if (!["requested", "confirmed"].includes(a.status)) throw new BusinessError("Esse horário já foi encerrado.");
    const { error } = await vipDb()
      .from("appointments")
      .update({ status: "cancelled", admin_note: parsed.note, reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
      .eq("id", a.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "appointment_cancelled_by_admin",
      entityType: "appointment",
      entityId: a.id,
      meta: { client_id: a.client_id, date: a.scheduled_date, time: a.scheduled_time, note: parsed.note },
    });
    revalidate();
    return undefined;
  });
}

/**
 * Atendimento realizado: fecha o horário E registra a visita confirmada
 * (pontos do serviço, carimbo no cartão, marcos). Um clique, tudo junto.
 */
export async function adminCompleteAppointmentAction(input: {
  id: string;
  note?: string;
  /** pontos diferentes do catálogo (opcional) */
  points?: string;
}): Promise<ActionResult> {
  return runAction("appointments.complete", async () => {
    const admin = await assertAdmin();
    const parsed = appointmentReviewSchema.parse({ id: input.id, note: input.note });
    const a = await loadAppointment(parsed.id);
    if (!["requested", "confirmed"].includes(a.status)) throw new BusinessError("Esse horário já foi encerrado.");
    if (a.scheduled_date > toISODate(nowInBusinessTz())) {
      throw new BusinessError("Esse horário ainda não aconteceu.");
    }
    const override = input.points?.trim();
    let points: number | null = null;
    if (override) {
      points = Number(override);
      if (!Number.isInteger(points) || points < 0 || points > 100000) throw new BusinessError("Pontos inválidos.", "points");
    }

    const db = vipDb();
    let service: Pick<ServiceRow, "id" | "name" | "point_value"> | null = null;
    if (a.service_id) {
      const { data } = await db.from("services").select("id, name, point_value").eq("id", a.service_id).maybeSingle();
      service = (data as Pick<ServiceRow, "id" | "name" | "point_value"> | null) ?? null;
    }
    if (!service) {
      if (points === null) throw new BusinessError("O serviço saiu do catálogo: informe os pontos desta visita.", "points");
      service = { id: a.service_id ?? "", name: a.service_name, point_value: points };
    }

    const visit = await registerVisit({
      adminId: admin.id,
      clientId: a.client_id,
      service,
      serviceDate: a.scheduled_date,
      points,
      notes: parsed.note,
      auditMeta: { appointment_id: a.id },
    });

    const { error } = await db
      .from("appointments")
      .update({
        status: "done",
        client_service_id: visit.id,
        admin_note: parsed.note,
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", a.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "appointment_done",
      entityType: "appointment",
      entityId: a.id,
      meta: { client_id: a.client_id, client_service_id: visit.id, points: visit.points },
    });
    revalidate();
    return undefined;
  });
}

/** A cliente não veio. Nada soma; fica registrado. */
export async function adminNoShowAppointmentAction(input: { id: string }): Promise<ActionResult> {
  return runAction("appointments.noShow", async () => {
    const admin = await assertAdmin();
    const a = await loadAppointment(appointmentReviewSchema.parse({ id: input.id }).id);
    if (!["requested", "confirmed"].includes(a.status)) throw new BusinessError("Esse horário já foi encerrado.");
    if (a.scheduled_date > toISODate(nowInBusinessTz())) throw new BusinessError("Esse horário ainda não aconteceu.");
    const { error } = await vipDb()
      .from("appointments")
      .update({ status: "no_show", reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
      .eq("id", a.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "appointment_no_show",
      entityType: "appointment",
      entityId: a.id,
      meta: { client_id: a.client_id, date: a.scheduled_date },
    });
    revalidate();
    return undefined;
  });
}
