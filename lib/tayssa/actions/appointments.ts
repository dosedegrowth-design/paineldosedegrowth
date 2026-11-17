"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logServerError, vipDb } from "@/lib/tayssa/db";
import { assertAdmin } from "@/lib/tayssa/auth/guards";
import { logAudit } from "@/lib/tayssa/audit";
import { ROUTES } from "@/lib/tayssa/config";
import { registerVisit } from "@/lib/tayssa/visits";
import { appointmentReviewSchema, isoDateField } from "@/lib/tayssa/validation";
import { timeToMinutes, toISODate } from "@/lib/tayssa/rules";
import { getSettings } from "@/lib/tayssa/settings";
import { syncLoyaltyEligibility } from "@/lib/tayssa/engine";
import { nowInBusinessTz } from "@/lib/tayssa/format";
import { BusinessError, runAction } from "@/lib/tayssa/actions/_helpers";
import { registrarPagamentos } from "@/lib/tayssa/pagamentos";
import { formaValida, lerNumero } from "@/lib/tayssa/financeiro";
import { getCatalogo, valorDoAgendamento } from "@/lib/tayssa/queries/gestao";
import type { ActionResult, AppointmentRow, ServiceRow } from "@/lib/tayssa/types";

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
  /** o valor cobrado (vazio = o do agendamento) — 17/11/2026 */
  valor?: string;
  /** a forma do que ela pagou na hora (pix, dinheiro, cartao_credito, cartao_debito, outro) */
  forma?: string;
  /** "sim": o restante foi recebido agora · "nao": fica pendente */
  recebido?: string;
}): Promise<ActionResult> {
  return runAction("appointments.complete", async () => {
    const admin = await assertAdmin();
    const parsed = appointmentReviewSchema.parse({ id: input.id, note: input.note });
    const a = await loadAppointment(parsed.id);
    if (!["requested", "confirmed"].includes(a.status)) throw new BusinessError("Esse horário já foi encerrado.");
    if (a.scheduled_date > toISODate(nowInBusinessTz())) {
      throw new BusinessError("Esse horário ainda não aconteceu.");
    }
    // o pagamento: o valor cobrado, o sinal que já entrou no Pix e o resto (agora ou pendente)
    const settings = await getSettings();
    const catalogo = await getCatalogo();
    const valorDigitado = lerNumero(input.valor);
    if (input.valor?.trim() && (valorDigitado == null || valorDigitado < 0 || valorDigitado > 100000)) {
      throw new BusinessError("Valor inválido. Use só números, ex.: 170 ou 170,50.", "valor");
    }
    const valorCobrado = valorDigitado ?? valorDoAgendamento(a, catalogo, settings.booking);
    const sinal = a.comprovante_em ? settings.booking.deposit_reais : 0;
    const resto = valorCobrado != null ? Math.max(0, Math.round((valorCobrado - sinal) * 100) / 100) : 0;
    const recebeuAgora = input.recebido === "sim";
    if (recebeuAgora && resto > 0 && !formaValida(input.forma)) throw new BusinessError("Escolha a forma de pagamento.", "forma");

    const override = input.points?.trim();
    let points: number | null = null;
    if (override) {
      points = Number(override);
      if (!Number.isInteger(points) || points < 0 || points > 100000) throw new BusinessError("Pontos inválidos.", "points");
    }

    const db = vipDb();
    let service: (Pick<ServiceRow, "name" | "point_value"> & { id: string | null }) | null = null;
    if ((a.servicos?.length ?? 0) > 1) {
      // vários serviços num horário só: uma visita (um carimbo), com os pontos de todos somados
      const ids = a.servicos!.map((s) => s.id);
      const { data } = await db.from("services").select("id, point_value").in("id", ids);
      const lidos = (data ?? []) as Pick<ServiceRow, "id" | "point_value">[];
      const faltou = ids.some((sid) => !lidos.some((r) => r.id === sid));
      if (!faltou) service = { id: a.service_id, name: a.service_name, point_value: lidos.reduce((s, r) => s + r.point_value, 0) };
      else if (points === null) {
        throw new BusinessError("Um dos serviços saiu do catálogo: informe os pontos desta visita.", "points");
      }
    } else if (a.service_id) {
      const { data } = await db.from("services").select("id, name, point_value").eq("id", a.service_id).maybeSingle();
      service = (data as Pick<ServiceRow, "id" | "name" | "point_value"> | null) ?? null;
    }
    if (!service) {
      if (points === null) throw new BusinessError("O serviço saiu do catálogo: informe os pontos desta visita.", "points");
      service = { id: a.service_id, name: a.service_name, point_value: points };
    }

    // reserva o horário primeiro: um segundo clique (ou outro aparelho) já
    // encontra "done" e para aqui, em vez de contar a visita duas vezes
    const { data: reservado, error: rErr } = await db
      .from("appointments")
      .update({ status: "done", admin_note: parsed.note, reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
      .eq("id", a.id)
      .in("status", ["requested", "confirmed"])
      .select("id")
      .maybeSingle();
    if (rErr) throw new Error(rErr.message);
    if (!reservado) throw new BusinessError("Esse horário já foi encerrado.");

    let visit: { id: string; points: number };
    try {
      visit = await registerVisit({
        adminId: admin.id,
        clientId: a.client_id,
        service,
        serviceDate: a.scheduled_date,
        amount: valorCobrado,
        pctTayssa: settings.financeiro.pct_tayssa,
        points,
        notes: parsed.note,
        auditMeta: { appointment_id: a.id },
      });
    } catch (e) {
      // devolve o horário como estava: dá para tentar "Realizado" de novo
      await db
        .from("appointments")
        .update({ status: a.status, admin_note: a.admin_note, reviewed_by: a.reviewed_by, reviewed_at: a.reviewed_at })
        .eq("id", a.id);
      throw e;
    }

    const { error } = await db.from("appointments").update({ client_service_id: visit.id }).eq("id", a.id);
    if (error) throw new Error(error.message);
    // o sinal (comprovante anexado) já entrou no Pix; o resto entra agora ou fica pendente
    try {
      await registrarPagamentos(
        visit.id,
        [
          ...(sinal > 0 ? [{ valor: Math.min(sinal, valorCobrado ?? sinal), forma: "pix" as const, origem: "sinal" as const, recebidoEm: a.comprovante_em ?? undefined, nota: "Sinal do agendamento" }] : []),
          ...(recebeuAgora && resto > 0 && formaValida(input.forma) ? [{ valor: resto, forma: input.forma, origem: "atendimento" as const }] : []),
        ],
        admin.id,
      );
    } catch (e) {
      // o atendimento já está registrado: o pagamento dá para lançar depois em Atendimentos realizados
      logServerError("appointments.complete.pagamento", e);
    }
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

// ------------------------------------------------------------
// Corrigir a data (Tayssa, 16/11/2026: "coloquei a data incorreta: registrei
// como se ela tivesse feito em dezembro, quando já tinha feito antes").
// Muda o registro que existe: nunca cria outro horário nem outra visita.
// ------------------------------------------------------------

const corrigirDataSchema = z.object({
  id: z.string().uuid("Registro inválido"),
  date: isoDateField,
  time: z.string().regex(/^\d{2}:\d{2}$/, "Escolha a hora"),
});

/** "AAAA-MM-DDTHH:MM" de agora, no relógio da casa */
function agoraDaCasa(): string {
  const n = nowInBusinessTz();
  return `${toISODate(n)}T${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
}

/**
 * A data (e a hora) de um horário. Em aberto e indo para o futuro: confere
 * se não bate com outra cliente. Para o passado é correção do histórico
 * (depois é só marcar "Realizado"). Realizado: a visita ligada muda junto,
 * e a recorrência (VIP, meses seguidos, inativa) segue a data nova.
 */
export async function adminCorrigirDataHorarioAction(input: { id: string; date: string; time: string }): Promise<ActionResult> {
  return runAction("appointments.redate", async () => {
    const admin = await assertAdmin();
    const p = corrigirDataSchema.parse(input);
    const a = await loadAppointment(p.id);
    if (!["requested", "confirmed", "done"].includes(a.status)) {
      throw new BusinessError("Esse horário foi cancelado ou a cliente faltou: não há data para corrigir.");
    }
    const futuro = `${p.date}T${p.time}` > agoraDaCasa();
    if (a.status === "done" && futuro) throw new BusinessError("Atendimento realizado não pode ficar no futuro.", "date");
    const db = vipDb();
    if (futuro) {
      // outra cliente no mesmo trecho do dia: não deixa dois horários um em cima do outro
      const settings = await getSettings();
      const { data, error } = await db
        .from("appointments")
        .select("scheduled_time, duration_min")
        .eq("scheduled_date", p.date)
        .in("status", ["requested", "confirmed"])
        .neq("id", a.id);
      if (error) throw new Error(error.message);
      const ini = timeToMinutes(p.time);
      const fim = ini + (a.duration_min || settings.booking.default_duration_min);
      const bate = ((data ?? []) as { scheduled_time: string; duration_min: number | null }[]).some((o) => {
        const oi = timeToMinutes(o.scheduled_time);
        return ini < oi + (o.duration_min || settings.booking.default_duration_min) && oi < fim;
      });
      if (bate) throw new BusinessError("Nesse horário já tem outra cliente marcada. Escolha outro.", "time");
    }
    const { error } = await db
      .from("appointments")
      .update({ scheduled_date: p.date, scheduled_time: `${p.time}:00` })
      .eq("id", a.id);
    if (error) {
      if (error.code === "23505") throw new BusinessError("Nesse horário já tem outro pedido em aberto.", "time");
      throw new Error(error.message);
    }
    if (a.client_service_id) {
      const { error: vErr } = await db.from("client_services").update({ service_date: p.date }).eq("id", a.client_service_id);
      if (vErr) throw new Error(vErr.message);
    }
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "appointment_redated",
      entityType: "appointment",
      entityId: a.id,
      meta: { client_id: a.client_id, de: `${a.scheduled_date} ${a.scheduled_time.slice(0, 5)}`, para: `${p.date} ${p.time}` },
    });
    if (a.client_service_id) await recalcularMarcos(a.client_id);
    revalidate();
    return undefined;
  });
}

/**
 * A data de um atendimento já registrado (a lista "Atendimentos" da ficha).
 * O horário da agenda ligado a ele muda junto; nada é duplicado.
 */
export async function adminCorrigirDataVisitaAction(input: { id: string; date: string }): Promise<ActionResult> {
  return runAction("services.redate", async () => {
    const admin = await assertAdmin();
    const p = corrigirDataSchema.omit({ time: true }).parse(input);
    if (p.date > toISODate(nowInBusinessTz())) throw new BusinessError("O atendimento não pode ficar no futuro.", "date");
    const db = vipDb();
    const { data } = await db.from("client_services").select("id, client_id, service_date").eq("id", p.id).maybeSingle();
    const v = data as { id: string; client_id: string; service_date: string } | null;
    if (!v) throw new BusinessError("Atendimento não encontrado.");
    const { error } = await db.from("client_services").update({ service_date: p.date }).eq("id", v.id);
    if (error) throw new Error(error.message);
    const { error: aErr } = await db.from("appointments").update({ scheduled_date: p.date }).eq("client_service_id", v.id);
    if (aErr) throw new Error(aErr.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "service_redated",
      entityType: "client_service",
      entityId: v.id,
      meta: { client_id: v.client_id, de: v.service_date, para: p.date },
    });
    await recalcularMarcos(v.client_id);
    revalidate();
    return undefined;
  });
}

/** Data de visita mudou: os marcos que pedem meses seguidos podem abrir (sempre em validação). */
async function recalcularMarcos(clientId: string) {
  try {
    await syncLoyaltyEligibility(clientId);
  } catch (e) {
    logServerError("appointments.redate.marcos", e);
  }
}
