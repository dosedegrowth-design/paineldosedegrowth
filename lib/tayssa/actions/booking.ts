"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { vipDb } from "@/lib/tayssa/db";
import { assertClient } from "@/lib/tayssa/auth/guards";
import { logAudit } from "@/lib/tayssa/audit";
import { ROUTES } from "@/lib/tayssa/config";
import { getSettings } from "@/lib/tayssa/settings";
import {
  appointmentEnded,
  appointmentStarted,
  bookableDays,
  horariosDaData,
  horariosParaMarcar,
  slotIsBookable,
  toISODate,
  trechosOcupados,
} from "@/lib/tayssa/rules";
import {
  avisoDaReservaVip,
  cabeNoHorario,
  diaLegivel,
  diaSoVip,
  duracaoLegivel,
  ehManutencao,
  horaLegivel,
  juntarServicos,
  somaDoPedido,
} from "@/lib/tayssa/agendar";
import { avisarTayssa } from "@/lib/tayssa/avisos";
import { isoDateField } from "@/lib/tayssa/validation";
import { horariosFechados } from "@/lib/tayssa/queries/vip";
import { expirarPedidosSemSinal } from "@/lib/tayssa/queries/expira";
import { nowInBusinessTz } from "@/lib/tayssa/format";
import { BusinessError, runAction } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult, AppointmentRow, ServiceRow, ServicoDoPedido } from "@/lib/tayssa/types";

/** Quantos serviços cabem num pedido (cílios, sobrancelha, lábios, pele e mais um). */
const MAX_SERVICOS = 5;

const createSchema = z.object({
  // vários serviços num horário só, um depois do outro (16/11/2026)
  service_ids: z
    .array(z.string().uuid("Escolha um serviço"))
    .min(1, "Escolha um serviço")
    .max(MAX_SERVICOS, `Até ${MAX_SERVICOS} serviços no mesmo horário`)
    .transform((ids) => [...new Set(ids)]),
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
 * dia aberto, horário da grade daquele dia, antecedência, horário livre
 * pelo tempo inteiro dos serviços, limite de horários em aberto por
 * cliente. Nasce em "requested"; a Tayssa confirma no painel dela.
 *
 * Vários serviços num horário só (Lucas, 16/11/2026: "se ela marcar boca,
 * cílios e sobrancelha, ela manda só R$ 50"): um pedido, um sinal, os
 * serviços um depois do outro, com o tempo somado. `service_id` sozinho
 * (tela aberta de antes da mudança) vale como um serviço.
 */
export async function createAppointmentAction(input: {
  service_ids?: string[];
  service_id?: string;
  date: string;
  time: string;
  note?: string;
}): Promise<ActionResult<BookingResult>> {
  return runAction("booking.create", async () => {
    const me = await assertClient();
    const parsed = createSchema.parse({
      ...input,
      service_ids: input.service_ids?.length ? input.service_ids : input.service_id ? [input.service_id] : [],
    });
    const db = vipDb();
    // o horário de um pedido que perdeu o prazo do sinal já está livre de novo
    await expirarPedidosSemSinal();
    const settings = await getSettings();
    const b = settings.booking;
    const now = nowInBusinessTz();

    const { data: lidos, error: sErr } = await db.from("services").select("*").in("id", parsed.service_ids);
    if (sErr) throw new Error(sErr.message);
    // na ordem em que ela escolheu (é a ordem em que a Tayssa faz)
    const escolhidos = parsed.service_ids.map((sid) => ((lidos ?? []) as ServiceRow[]).find((x) => x.id === sid));
    if (escolhidos.some((x) => !x || !x.active)) throw new BusinessError("Escolha um serviço válido.", "service_id");
    const servicos = escolhidos as ServiceRow[];
    // manutenção (a genérica): o valor é o da manutenção do volume dela (a nota diz qual)
    const volume = parsed.note?.match(/^Manutenção do (.+)\.$/)?.[1] ?? null;
    const precoDaManutencao = volume
      ? (((await db.from("services").select("preco_manutencao").eq("name", volume).maybeSingle()).data as { preco_manutencao: number | null } | null)
          ?.preco_manutencao ?? null)
      : null;
    const lista: ServicoDoPedido[] = servicos.map((x) => ({
      id: x.id,
      nome: x.name,
      duracao: x.duration_min ?? b.default_duration_min,
      preco:
        precoDaManutencao != null && ehManutencao(x.slug, x.name)
          ? Number(precoDaManutencao)
          : x.preco != null
            ? Number(x.preco)
            : null,
    }));
    const nomeDoPedido = juntarServicos(lista.map((x) => x.nome));

    const dia = bookableDays(now, b).find((d) => d.iso === parsed.date);
    if (!dia) {
      throw new BusinessError("Esse dia não está aberto para agendamento.", "date");
    }
    // prioridade VIP: o fim de ano guardado só para quem é VIP (o site já esconde; aqui é a garantia)
    if (!me.isVip && diaSoVip(parsed.date, b.prioridade_vip, now)) {
      throw new BusinessError(avisoDaReservaVip(b.prioridade_vip, now, "cliente") ?? "Essa data ainda não abriu.", "date");
    }
    const grade = horariosDaData(b, dia.iso);
    if (!grade.includes(parsed.time)) {
      throw new BusinessError("Esse horário não é oferecido.", "time");
    }
    if (!slotIsBookable(parsed.date, parsed.time, now, b.lead_hours)) {
      throw new BusinessError(
        `Esse horário já está muito perto. Escolha um com pelo menos ${b.lead_hours}h de antecedência.`,
        "time"
      );
    }

    // em aberto = ainda não terminou (o de hoje cedo já não segura a vaga)
    const { data: abertos, error: aErr } = await db
      .from("appointments")
      .select("scheduled_date, scheduled_time, duration_min")
      .eq("client_id", me.id)
      .in("status", ["requested", "confirmed"])
      .gte("scheduled_date", toISODate(now));
    if (aErr) throw new Error(aErr.message);
    const openCount = ((abertos ?? []) as Pick<AppointmentRow, "scheduled_date" | "scheduled_time" | "duration_min">[]).filter(
      (a) => !appointmentEnded(a, now)
    ).length;
    if (openCount >= b.max_open_per_client) {
      throw new BusinessError(
        `Você já tem ${openCount} ${openCount === 1 ? "horário marcado" : "horários marcados"}. Desmarque um para marcar outro.`
      );
    }

    // os serviços precisam caber inteiros, um depois do outro: o volume de 3h às 10h não entra se às 11h já tem alguém
    const duracao = somaDoPedido(lista).duracao || b.default_duration_min;
    const [{ data: doDia, error: dErr }, fechados] = await Promise.all([
      db
        .from("appointments")
        .select("scheduled_time, duration_min")
        .eq("scheduled_date", parsed.date)
        .in("status", ["requested", "confirmed"]),
      horariosFechados(parsed.date, parsed.date),
    ]);
    if (dErr) throw new Error(dErr.message);
    const ocupado = trechosOcupados(
      grade,
      (doDia ?? []) as { scheduled_time: string; duration_min: number | null }[],
      [...fechados].map((f) => f.split("T")[1]),
      b.default_duration_min
    );
    const slot = horariosParaMarcar(parsed.date, [parsed.time], ocupado, now, b.lead_hours)[0];
    if (!slot.available) {
      throw new BusinessError(
        fechados.has(`${parsed.date}T${parsed.time}`)
          ? "Esse horário não está disponível. Escolha outro."
          : "Esse horário acabou de ser reservado. Escolha outro.",
        "time"
      );
    }
    if (!cabeNoHorario(slot, duracao)) {
      throw new BusinessError(
        lista.length > 1
          ? `Os serviços juntos levam ${duracaoLegivel(duracao)} e não cabem a partir desse horário. Escolha outro.`
          : `${nomeDoPedido} leva ${duracaoLegivel(duracao)} e não cabe a partir desse horário. Escolha outro.`,
        "time"
      );
    }

    const { data: created, error } = await db
      .from("appointments")
      .insert({
        client_id: me.id,
        service_id: lista[0].id,
        service_name: nomeDoPedido,
        scheduled_date: parsed.date,
        scheduled_time: `${parsed.time}:00`,
        duration_min: duracao,
        status: "requested",
        client_note: parsed.note,
        servicos: lista,
      })
      .select("id")
      .single();
    if (error) {
      // outra cliente marcou o mesmo horário no mesmo instante (índice único)
      if (error.code === "23505") throw new BusinessError("Esse horário acabou de ser reservado. Escolha outro.", "time");
      throw new Error(error.message);
    }
    const id = (created as { id: string }).id;

    await logAudit({
      actorId: me.id,
      actorRole: "client",
      action: "appointment_requested",
      entityType: "appointment",
      entityId: id,
      meta: { service: nomeDoPedido, date: parsed.date, time: parsed.time },
    });
    // o aviso no celular da Tayssa sai depois da resposta: ela confirma quando o sinal cair
    after(() =>
      avisarTayssa({
        titulo: "Novo pedido de horário",
        corpo: `${me.name} · ${nomeDoPedido} · ${diaLegivel(parsed.date)} às ${horaLegivel(parsed.time)}`,
        url: `${ROUTES.adminAgenda}#pedidos`,
        tag: `pedido-${id}`,
      }),
    );
    revalidatePath(ROUTES.vip, "layout");
    revalidatePath(ROUTES.admin, "layout");
    return { id, serviceName: nomeDoPedido, date: parsed.date, time: parsed.time };
  });
}

export async function cancelAppointmentAction(input: { id: string }): Promise<ActionResult> {
  return runAction("booking.cancel", async () => {
    const me = await assertClient();
    const id = z.string().uuid("Registro inválido").parse(input.id);
    const db = vipDb();
    const { data } = await db.from("appointments").select("*").eq("id", id).maybeSingle();
    const a = data as AppointmentRow | null;
    if (!a || a.client_id !== me.id) throw new BusinessError("Horário não encontrado.");
    if (!["requested", "confirmed"].includes(a.status)) {
      throw new BusinessError("Esse horário não pode mais ser desmarcado.");
    }
    // o que já começou não se desmarca: quem fecha (realizado ou falta) é a Tayssa
    if (appointmentStarted(a, nowInBusinessTz())) {
      throw new BusinessError("Esse horário já começou ou passou. Se algo aconteceu, fale com a Tayssa pelo WhatsApp.");
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
