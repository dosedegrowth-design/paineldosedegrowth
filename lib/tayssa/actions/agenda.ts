"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { vipDb } from "@/lib/tayssa/db";
import { assertAdmin } from "@/lib/tayssa/auth/guards";
import { logAudit } from "@/lib/tayssa/audit";
import { ROUTES } from "@/lib/tayssa/config";
import { getSettings } from "@/lib/tayssa/settings";
import { getAgendaPublica } from "@/lib/tayssa/queries/vip";
import { isoDateField } from "@/lib/tayssa/validation";
import { horariosDoDia, toISODate } from "@/lib/tayssa/rules";
import { nowInBusinessTz } from "@/lib/tayssa/format";
import { BusinessError, runAction } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult } from "@/lib/tayssa/types";

/**
 * A agenda que a cliente vê na hora em que abre a folha de agendar (site
 * público): só dia, horário e se está livre — nada de quem marcou. Sem
 * login: é a mesma informação que a página já mostra.
 */
export async function agendaPublicaAction(): Promise<ActionResult<Awaited<ReturnType<typeof getAgendaPublica>>>> {
  return runAction("agenda.publica", async () => getAgendaPublica());
}

const horaField = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido");
const horarioSchema = z.object({ dia: isoDateField, hora: horaField, fechar: z.boolean() });
const diaSchema = z.object({ dia: isoDateField, fechar: z.boolean() });

function revalidar() {
  revalidatePath(ROUTES.adminAgenda);
  revalidatePath(ROUTES.vipBook);
  revalidatePath(ROUTES.home);
}

/** Dia que ainda dá para mexer: hoje em diante, aberto na grade da casa. Devolve a grade dele. */
async function validarDia(dia: string): Promise<string[]> {
  const b = (await getSettings()).booking;
  if (dia < toISODate(nowInBusinessTz())) throw new BusinessError("Esse dia já passou.");
  const [a, m, d] = dia.split("-").map(Number);
  const semana = new Date(a, m - 1, d).getDay();
  if (!b.weekdays.includes(semana)) {
    throw new BusinessError("Esse dia é folga na agenda. Para abrir, mude os dias em Configurações → Agenda.");
  }
  return horariosDoDia(b, semana);
}

/**
 * A Tayssa marca um horário como disponível ou não. Fechado, ele continua
 * aparecendo para a cliente — riscado, sem dar para escolher.
 */
export async function adminAlternarHorarioAction(input: { dia: string; hora: string; fechar: boolean }): Promise<ActionResult> {
  return runAction("agenda.horario", async () => {
    const admin = await assertAdmin();
    const p = horarioSchema.parse(input);
    const grade = await validarDia(p.dia);
    if (!grade.includes(p.hora)) throw new BusinessError("Esse horário não faz parte da grade da agenda.");
    const db = vipDb();
    const { error } = p.fechar
      ? await db.from("agenda_bloqueios").upsert({ dia: p.dia, hora: p.hora, created_by: admin.id }, { onConflict: "dia,hora" })
      : await db.from("agenda_bloqueios").delete().eq("dia", p.dia).eq("hora", p.hora);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: p.fechar ? "agenda_horario_fechado" : "agenda_horario_aberto",
      entityType: "agenda",
      meta: { dia: p.dia, hora: p.hora },
    });
    revalidar();
    return undefined;
  });
}

/** O dia inteiro de uma vez: fecha (ou reabre) todos os horários da grade. */
export async function adminAlternarDiaAction(input: { dia: string; fechar: boolean }): Promise<ActionResult> {
  return runAction("agenda.dia", async () => {
    const admin = await assertAdmin();
    const p = diaSchema.parse(input);
    const grade = await validarDia(p.dia);
    const db = vipDb();
    const { error } = p.fechar
      ? await db
          .from("agenda_bloqueios")
          .upsert(grade.map((hora) => ({ dia: p.dia, hora, created_by: admin.id })), { onConflict: "dia,hora" })
      : await db.from("agenda_bloqueios").delete().eq("dia", p.dia);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: p.fechar ? "agenda_dia_fechado" : "agenda_dia_aberto",
      entityType: "agenda",
      meta: { dia: p.dia },
    });
    revalidar();
    return undefined;
  });
}
