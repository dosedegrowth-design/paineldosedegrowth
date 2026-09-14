"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { vipDb } from "@/lib/tayssa/db";
import { assertClient } from "@/lib/tayssa/auth/guards";
import { logAudit } from "@/lib/tayssa/audit";
import { ROUTES } from "@/lib/tayssa/config";
import { getSettings } from "@/lib/tayssa/settings";
import { bookableDays, slotIsBookable, toISODate } from "@/lib/tayssa/rules";
import { isoDateField } from "@/lib/tayssa/validation";
import { BusinessError, runAction } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult, AppointmentRow, ServiceRow } from "@/lib/tayssa/types";

const createSchema = z.object({
  service_id: z.string().uuid("Escolha um serviço"),
  date: isoDateField,
  time: z.string().regex(/^\d{2}:\d{2}$/, "Escolha um horário"),
  note: z.string().trim().max(300).optional().transform((v) => v || null),
});

export type BookingResult = {
  id: string;
  serviceName: string;
  date: string;
  time: string;
};

/**
 * Agendamento interno. Tudo validado contra a configuração da casa:
 * dia aberto, horário oferecido, antecedência, horário livre, limite
 * de horários em aberto por cliente. Nasce em "requested"; a Tayssa
 * confirma no painel dela.
 */
export async function createAppointmentAction(input: {
  service_id: string;
  date: string;
  time: string;
  note?: string;
}): Promise<ActionResult<BookingResult>> {
  return runAction("booking.create", async () => {
    const me = await assertClient();
    const parsed = createSchema.parse(input);
    const db = vipDb();
    const settings = await getSettings();
    const b = settings.booking;
    const now = new Date();

    const { data: s } = await db.from("services").select("*").eq("id", parsed.service_id).maybeSingle();
    const service = s as ServiceRow | null;
    if (!service || !service.active) throw new BusinessError("Escolha um serviço válido.", "service_id");

    const days = bookableDays(now, b);
    if (!days.some((d) => d.iso === parsed.date)) {
      throw new BusinessError("Esse dia não está aberto para agendamento.", "date");
    }
    if (!b.slots.includes(parsed.time)) {
      throw new BusinessError("Esse horário não é oferecido.", "time");
    }
    if (!slotIsBookable(parsed.date, parsed.time, now, b.lead_hours)) {
      throw new BusinessError(
        `Esse horário já está muito perto. Escolha um com pelo menos ${b.lead_hours}h de antecedência.`,
        "time"
      );
    }

    const { count: openCount } = await db
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("client_id", me.id)
      .in("status", ["requested", "confirmed"])
      .gte("scheduled_date", toISODate(now));
    if ((openCount ?? 0) >= b.max_open_per_client) {
      throw new BusinessError(
        `Você já tem ${openCount} ${openCount === 1 ? "horário marcado" : "horários marcados"}. Cancele um para marcar outro.`
      );
    }

    const { data: taken } = await db
      .from("appointments")
      .select("id")
      .eq("scheduled_date", parsed.date)
      .eq("scheduled_time", `${parsed.time}:00`)
      .in("status", ["requested", "confirmed"])
      .limit(1);
    if (taken && taken.length) {
      throw new BusinessError("Esse horário acabou de ser reservado. Escolha outro.", "time");
    }

    const { data: created, error } = await db
      .from("appointments")
      .insert({
        client_id: me.id,
        service_id: service.id,
        service_name: service.name,
        scheduled_date: parsed.date,
        scheduled_time: `${parsed.time}:00`,
        duration_min: b.default_duration_min,
        status: "requested",
        client_note: parsed.note,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const id = (created as { id: string }).id;

    await logAudit({
      actorId: me.id,
      actorRole: "client",
      action: "appointment_requested",
      entityType: "appointment",
      entityId: id,
      meta: { service: service.name, date: parsed.date, time: parsed.time },
    });
    revalidatePath(ROUTES.vip, "layout");
    revalidatePath(ROUTES.admin, "layout");
    return { id, serviceName: service.name, date: parsed.date, time: parsed.time };
  });
}

export async function cancelAppointmentAction(input: { id: string }): Promise<ActionResult> {
  return runAction("booking.cancel", async () => {
    const me = await assertClient();
    const db = vipDb();
    const { data } = await db.from("appointments").select("*").eq("id", input.id).maybeSingle();
    const a = data as AppointmentRow | null;
    if (!a || a.client_id !== me.id) throw new BusinessError("Horário não encontrado.");
    if (!["requested", "confirmed"].includes(a.status)) {
      throw new BusinessError("Esse horário não pode mais ser cancelado.");
    }
    const { error } = await db
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", a.id)
      .eq("client_id", me.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: me.id,
      actorRole: "client",
      action: "appointment_cancelled",
      entityType: "appointment",
      entityId: a.id,
    });
    revalidatePath(ROUTES.vip, "layout");
    revalidatePath(ROUTES.admin, "layout");
    return undefined;
  });
}
