import { requireAdminPage } from "@/lib/auth/guards";
import { getAgenda } from "@/lib/queries/admin";
import { getSettings } from "@/lib/settings";
import { ROUTES } from "@/lib/config";
import { dateShort, dayLabel, hhmm, nowInBusinessTz, weekdayShort } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";
import { APPOINTMENT_STATUS_LABEL } from "@/lib/types";
import type { AppointmentWithClient } from "@/lib/queries/admin";
import {
  adminCancelAppointmentAction,
  adminCompleteAppointmentAction,
  adminConfirmAppointmentAction,
  adminNoShowAppointmentAction,
} from "@/lib/actions/appointments";
import { AdminBlock, AdminHeader, Empty } from "@/components/admin/shell";
import { ActionButton, NoteAction } from "@/components/admin/controls";
import { TransitionLink } from "@/components/ui/transition";
import { TyInput } from "@/components/ui/field";

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function clientName(a: AppointmentWithClient): string {
  return a.client?.nickname?.trim() || a.client?.name || "Cliente";
}

function Who({ a }: { a: AppointmentWithClient }) {
  const first = clientName(a).split(/\s+/)[0];
  return (
    <div style={{ minWidth: 0 }}>
      <span style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
        <span className="ty-num" style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>
          {hhmm(a.scheduled_time)}
        </span>
        {a.client ? (
          <TransitionLink href={ROUTES.adminClient(a.client.id)} className="ty-link" style={{ fontSize: 16 }}>
            {a.client.name}
          </TransitionLink>
        ) : (
          <span style={{ fontSize: 16 }}>Cliente</span>
        )}
      </span>
      <span style={{ display: "block", marginTop: 4 }}>
        {a.service_name} · {weekdayShort(a.scheduled_date)}, {dateShort(a.scheduled_date)} · {a.duration_min} min
        <span className="ty-small"> · {APPOINTMENT_STATUS_LABEL[a.status].toLowerCase()}</span>
      </span>
      {a.client_note ? (
        <span className="ty-small" style={{ display: "block", fontWeight: 300 }}>
          “{a.client_note}”
        </span>
      ) : null}
      {a.admin_note ? (
        <span className="ty-small" style={{ display: "block" }}>
          sua observação: {a.admin_note}
        </span>
      ) : null}
      {a.client?.phone ? (
        <a
          href={whatsappUrl(a.client.phone, `Oi, ${first}! Sobre seu horário de ${dayLabel(a.scheduled_date)} às ${hhmm(a.scheduled_time)}: `)}
          target="_blank"
          rel="noopener noreferrer"
          className="ty-link ty-link--caps"
          style={{ display: "inline-block", marginTop: 6 }}
        >
          WhatsApp
        </a>
      ) : null}
    </div>
  );
}

function Row({ a, children }: { a: AppointmentWithClient; children?: React.ReactNode }) {
  return (
    <li style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 18, padding: "16px 0", borderTop: "1px solid var(--t-line)", alignItems: "start" }}>
      <Who a={a} />
      {children ? <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>{children}</div> : null}
    </li>
  );
}

/** Fechar um horário que já aconteceu: realizado (vira visita confirmada) ou faltou. */
function CloseActions({ a }: { a: AppointmentWithClient }) {
  return (
    <>
      <NoteAction
        action={adminCompleteAppointmentAction}
        args={{ id: a.id }}
        label="Observação (opcional)"
        variant="accent"
        extra={<TyInput label="Pontos desta visita (vazio = do catálogo)" name="points" inputMode="numeric" placeholder="ex.: 40" />}
      >
        Realizado
      </NoteAction>
      <ActionButton action={adminNoShowAppointmentAction} args={{ id: a.id }} confirm="Marcar como não compareceu? Nada soma para a cliente.">
        Não compareceu
      </ActionButton>
    </>
  );
}

export default async function AgendaAdminPage() {
  await requireAdminPage();
  const [agenda, settings] = await Promise.all([getAgenda(), getSettings()]);
  const b = settings.booking;
  const todayISO = agenda.today;
  const now = nowInBusinessTz();
  const alreadyHappened = (a: AppointmentWithClient) => {
    const [h, m] = a.scheduled_time.split(":").map(Number);
    return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
  };
  const attention = agenda.requested.length + agenda.toClose.length;

  return (
    <>
      <AdminHeader
        eyebrow="Agenda"
        title={
          attention ? (
            <>
              {attention} {attention === 1 ? "horário espera" : "horários esperam"} <em>você.</em>
            </>
          ) : (
            <>
              Agenda em <em>dia.</em>
            </>
          )
        }
        lead="A cliente pede o horário pelo app; ele só vale depois que você confirma. Ao marcar como realizado, a visita entra confirmada, com pontos e carimbo."
        actions={
          <TransitionLink href={`${ROUTES.adminSettings}#agenda`} className="ty-link ty-link--caps">
            Editar disponibilidade
          </TransitionLink>
        }
      />

      <AdminBlock title="Pedidos de horário" aside={agenda.requested.length ? `${agenda.requested.length} aguardando` : undefined}>
        {agenda.requested.length ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {agenda.requested.map((a) => (
              <Row key={a.id} a={a}>
                <NoteAction action={adminConfirmAppointmentAction} args={{ id: a.id }} label="Recado para a cliente (opcional)" variant="accent">
                  Confirmar
                </NoteAction>
                <NoteAction action={adminCancelAppointmentAction} args={{ id: a.id }} label="Motivo (ela vê)">
                  Recusar
                </NoteAction>
              </Row>
            ))}
          </ul>
        ) : (
          <Empty>Nenhum pedido de horário aguardando.</Empty>
        )}
      </AdminBlock>

      <AdminBlock title="Hoje" aside={`${weekdayShort(todayISO)}, ${dateShort(todayISO)}`}>
        {agenda.todayList.length ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {agenda.todayList.map((a) => (
              <Row key={a.id} a={a}>
                {a.status === "requested" ? (
                  <NoteAction action={adminConfirmAppointmentAction} args={{ id: a.id }} label="Recado para a cliente (opcional)" variant="accent">
                    Confirmar
                  </NoteAction>
                ) : null}
                {alreadyHappened(a) ? <CloseActions a={a} /> : null}
                <NoteAction action={adminCancelAppointmentAction} args={{ id: a.id }} label="Motivo (ela vê)">
                  Cancelar
                </NoteAction>
              </Row>
            ))}
          </ul>
        ) : (
          <Empty>Nenhum horário hoje.</Empty>
        )}
      </AdminBlock>

      {agenda.toClose.length ? (
        <AdminBlock title="Para fechar" aside="já passaram — realizado ou não compareceu?">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {agenda.toClose.map((a) => (
              <Row key={a.id} a={a}>
                <CloseActions a={a} />
                <NoteAction action={adminCancelAppointmentAction} args={{ id: a.id }} label="Motivo (ela vê)">
                  Cancelar
                </NoteAction>
              </Row>
            ))}
          </ul>
        </AdminBlock>
      ) : null}

      <AdminBlock title="Próximos confirmados">
        {agenda.upcoming.length ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {agenda.upcoming.map((a) => (
              <Row key={a.id} a={a}>
                <NoteAction action={adminCancelAppointmentAction} args={{ id: a.id }} label="Motivo (ela vê)">
                  Cancelar
                </NoteAction>
              </Row>
            ))}
          </ul>
        ) : (
          <Empty>Nenhum horário confirmado à frente.</Empty>
        )}
      </AdminBlock>

      <AdminBlock
        title="Disponibilidade"
        aside={
          <TransitionLink href={`${ROUTES.adminSettings}#agenda`} className="ty-link ty-link--caps">
            Editar
          </TransitionLink>
        }
      >
        <div style={{ display: "grid", gap: 8, maxWidth: 640 }}>
          <span>
            <span className="ty-small">Dias · </span>
            {b.weekdays.map((d) => WEEKDAYS[d]).join(", ")}
          </span>
          <span>
            <span className="ty-small">Horários · </span>
            {b.slots.join(" · ")}
          </span>
          <span className="ty-small">
            antecedência mínima {b.lead_hours}h · até {b.horizon_days} dias à frente · {b.default_duration_min} min por atendimento · até{" "}
            {b.max_open_per_client} {b.max_open_per_client === 1 ? "horário em aberto" : "horários em aberto"} por cliente
          </span>
        </div>
      </AdminBlock>

      <AdminBlock title="Encerrados recentes">
        {agenda.past.length ? (
          <div className="ty-table-wrap">
            <table className="ty-table">
              <thead>
                <tr>
                  <th>Quando</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {agenda.past.map((a) => (
                  <tr key={a.id}>
                    <td className="ty-num">
                      {dateShort(a.scheduled_date)} {hhmm(a.scheduled_time)}
                    </td>
                    <td>
                      {a.client ? (
                        <TransitionLink href={ROUTES.adminClient(a.client.id)} className="ty-link">
                          {a.client.name}
                        </TransitionLink>
                      ) : (
                        "Cliente"
                      )}
                    </td>
                    <td>{a.service_name}</td>
                    <td>
                      {APPOINTMENT_STATUS_LABEL[a.status]}
                      {a.admin_note ? <span className="ty-small"> · {a.admin_note}</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>Nada encerrado nos últimos 45 dias.</Empty>
        )}
      </AdminBlock>
    </>
  );
}
