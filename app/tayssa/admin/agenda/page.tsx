import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { getAgenda, getGradeAgenda } from "@/lib/tayssa/queries/admin";
import { AgendaGrade } from "@/components/tayssa/admin/agenda-grade";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES } from "@/lib/tayssa/config";
import { dateShort, dayLabel, dayMonth, hhmm, nowInBusinessTz, weekdayShort } from "@/lib/tayssa/format";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { APPOINTMENT_STATUS_LABEL, type AppointmentStatus } from "@/lib/tayssa/types";
import type { AppointmentWithClient } from "@/lib/tayssa/queries/admin";
import {
  adminCancelAppointmentAction,
  adminCompleteAppointmentAction,
  adminConfirmAppointmentAction,
  adminNoShowAppointmentAction,
} from "@/lib/tayssa/actions/appointments";
import { AdminBlock, AdminHeader, Empty } from "@/components/tayssa/admin/shell";
import { ActionButton, NoteAction } from "@/components/tayssa/admin/controls";
import { Icone, type IconeNome } from "@/components/tayssa/admin/icons";
import { TransitionLink } from "@/components/tayssa/ui/transition";

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** "seg, ter e qua" — lista em português, sem vírgula antes do "e". */
function lista(dias: string[]): string {
  if (dias.length < 2) return dias.join("");
  return `${dias.slice(0, -1).join(", ")} e ${dias[dias.length - 1]}`;
}

/** Cada estado tem uma cor só dele — para ler no relance, sem reler o texto. */
const TOM: Record<AppointmentStatus, "warn" | "brand" | "ok" | "quiet" | "bad"> = {
  requested: "warn",
  confirmed: "brand",
  done: "ok",
  cancelled: "quiet",
  no_show: "bad",
};

function clientName(a: AppointmentWithClient): string {
  return a.client?.nickname?.trim() || a.client?.name || "Cliente";
}

function Selo({ status }: { status: AppointmentStatus }) {
  return <span className={`tya-pill tya-pill--${TOM[status]}`}>{APPOINTMENT_STATUS_LABEL[status]}</span>;
}

/** Vazio desenhado: ícone, uma frase curta e o porquê. */
function Vazio({ icone, titulo, children }: { icone: IconeNome; titulo: string; children?: ReactNode }) {
  return (
    <Empty>
      <span className="tya-nada">
        <Icone nome={icone} />
        <b>{titulo}</b>
        {children ? <span>{children}</span> : null}
      </span>
    </Empty>
  );
}

/**
 * Atalho do topo: número que vem do banco e desce para a seção. Sem `href`
 * — quando a seção não está na tela — fica cartão, não link: clicar num
 * link para uma âncora que não existe não faz nada.
 */
function Atalho({ n, label, href, alerta }: { n: number; label: string; href?: string; alerta?: boolean }) {
  const classe = `tya-card tya-kpi${href ? " tya-card--hover" : ""}${alerta ? " tya-kpi--alert" : ""}`;
  const corpo = (
    <>
      <span className="tya-eyebrow">{label}</span>
      <p className="tya-kpi__n">{n}</p>
    </>
  );
  return href ? (
    <a href={href} className={classe}>
      {corpo}
    </a>
  ) : (
    <div className={classe}>{corpo}</div>
  );
}

/** A linha de trabalho: hora grande à esquerda, quem e o quê no meio, ação à direita. */
function Slot({
  a,
  tom,
  children,
}: {
  a: AppointmentWithClient;
  tom?: "warn" | "brand" | "ok" | "quiet" | "bad";
  children?: ReactNode;
}) {
  const first = clientName(a).split(/\s+/)[0];
  return (
    <li className="tya-slot" data-tom={tom ?? TOM[a.status]}>
      <div className="tya-slot__when">
        <span className="tya-slot__dow">{weekdayShort(a.scheduled_date)}</span>
        <span className="tya-num tya-slot__h">{hhmm(a.scheduled_time)}</span>
        <span className="tya-slot__d">{dayMonth(a.scheduled_date)}</span>
      </div>

      <div className="tya-slot__body">
        <div className="tya-slot__top">
          {a.client ? (
            <TransitionLink href={ROUTES.adminClient(a.client.id)} className="tya-link tya-slot__name">
              {a.client.name}
            </TransitionLink>
          ) : (
            <span className="tya-slot__name">Cliente</span>
          )}
          <Selo status={a.status} />
        </div>
        <p className="tya-slot__meta">
          {a.service_name} · {a.duration_min} min · {weekdayShort(a.scheduled_date)}, {dateShort(a.scheduled_date)}
        </p>
        {a.client_note ? <p className="tya-quote">“{a.client_note}”</p> : null}
        {a.admin_note ? (
          <p className="tya-slot__mine">
            <span className="tya-slot__tag">sua observação</span>
            {a.admin_note}
          </p>
        ) : null}
        {a.client?.phone ? (
          <a
            href={whatsappUrl(
              a.client.phone,
              `Oi, ${first}! Sobre seu horário de ${dayLabel(a.scheduled_date)} às ${hhmm(a.scheduled_time)}: `
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="tya-link tya-link--quiet tya-slot__wa"
          >
            WhatsApp
          </a>
        ) : null}
      </div>

      {children ? <div className="tya-slot__acts">{children}</div> : null}
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
        extra={
          <div>
            <label className="tya-label" htmlFor={`pontos-${a.id}`}>
              Pontos desta visita (vazio = do catálogo)
            </label>
            <input
              id={`pontos-${a.id}`}
              className="tya-field"
              name="points"
              inputMode="numeric"
              placeholder="ex.: 40"
            />
          </div>
        }
      >
        Realizado
      </NoteAction>
      <ActionButton
        action={adminNoShowAppointmentAction}
        args={{ id: a.id }}
        confirm="Marcar como não compareceu? Nada soma para a cliente."
      >
        Não compareceu
      </ActionButton>
    </>
  );
}

export default async function AgendaAdminPage() {
  await requireAdminPage();
  const [agenda, settings, grade] = await Promise.all([getAgenda(), getSettings(), getGradeAgenda()]);
  const b = settings.booking;
  const todayISO = agenda.today;
  const now = nowInBusinessTz();
  const alreadyHappened = (a: AppointmentWithClient) => {
    const [h, m] = a.scheduled_time.split(":").map(Number);
    return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
  };
  const attention = agenda.requested.length + agenda.toClose.length;
  const diasAbertos = WEEKDAYS.filter((_, i) => b.weekdays.includes(i));
  const diasFolga = WEEKDAYS.filter((_, i) => !b.weekdays.includes(i));

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
        lead="A semana como no Google Agenda: toque num horário para abrir ou fechar. A cliente pede o horário pelo app; ele só vale depois que você confirma. Ao marcar como realizado, a visita entra confirmada, com pontos e carimbo."
        actions={
          <TransitionLink href={`${ROUTES.adminSettings}#agenda`} className="tya-btn tya-btn--ghost">
            <Icone nome="config" />
            Editar disponibilidade
          </TransitionLink>
        }
      />

      <div className="tya-kpis tya-kpis--2sm tya-stagger">
        <Atalho n={agenda.requested.length} label="Pedidos" href="#pedidos" alerta={agenda.requested.length > 0} />
        <Atalho n={agenda.todayList.length} label="Hoje" href="#hoje" />
        <Atalho
          n={agenda.toClose.length}
          label="Para fechar"
          href={agenda.toClose.length ? "#fechar" : undefined}
          alerta={agenda.toClose.length > 0}
        />
        <Atalho n={agenda.upcoming.length} label="Próximos" href="#proximos" />
      </div>

      <AdminBlock id="semana" title="Semana">
        <AgendaGrade grade={grade} />
      </AdminBlock>

      <AdminBlock
        id="pedidos"
        title="Pedidos de horário"
        aside={agenda.requested.length ? <span className="tya-pill tya-pill--warn">{agenda.requested.length} aguardando</span> : null}
      >
        {agenda.requested.length ? (
          <ul className="tya-list">
            {agenda.requested.map((a) => (
              <Slot key={a.id} a={a}>
                <NoteAction
                  action={adminConfirmAppointmentAction}
                  args={{ id: a.id }}
                  label="Recado para a cliente (opcional)"
                  variant="accent"
                >
                  Confirmar
                </NoteAction>
                <NoteAction action={adminCancelAppointmentAction} args={{ id: a.id }} label="Motivo (ela vê)">
                  Recusar
                </NoteAction>
              </Slot>
            ))}
          </ul>
        ) : (
          <Vazio icone="agenda" titulo="Nenhum pedido aguardando">
            Quando uma cliente pedir um horário pelo app, ele aparece aqui para você confirmar ou recusar.
          </Vazio>
        )}
      </AdminBlock>

      <AdminBlock
        id="hoje"
        title="Hoje"
        aside={
          <span className="tya-pill tya-pill--quiet">
            {weekdayShort(todayISO)}, {dateShort(todayISO)}
          </span>
        }
      >
        {agenda.todayList.length ? (
          <ul className="tya-list">
            {agenda.todayList.map((a) => (
              <Slot key={a.id} a={a}>
                {a.status === "requested" ? (
                  <NoteAction
                    action={adminConfirmAppointmentAction}
                    args={{ id: a.id }}
                    label="Recado para a cliente (opcional)"
                    variant="accent"
                  >
                    Confirmar
                  </NoteAction>
                ) : null}
                {alreadyHappened(a) ? <CloseActions a={a} /> : null}
                <NoteAction action={adminCancelAppointmentAction} args={{ id: a.id }} label="Motivo (ela vê)">
                  Cancelar
                </NoteAction>
              </Slot>
            ))}
          </ul>
        ) : (
          <Vazio icone="agenda" titulo="Nenhum horário hoje">
            {agenda.toClose.length
              ? `Mas ${agenda.toClose.length} ${agenda.toClose.length === 1 ? "horário passado espera" : "horários passados esperam"} fechamento logo abaixo.`
              : "O dia está livre na agenda."}
          </Vazio>
        )}
      </AdminBlock>

      {agenda.toClose.length ? (
        <AdminBlock
          id="fechar"
          title="Para fechar"
          aside={<span className="tya-pill tya-pill--bad">já passaram</span>}
        >
          <ul className="tya-list">
            {agenda.toClose.map((a) => (
              <Slot key={a.id} a={a} tom="bad">
                <CloseActions a={a} />
                <NoteAction action={adminCancelAppointmentAction} args={{ id: a.id }} label="Motivo (ela vê)">
                  Cancelar
                </NoteAction>
              </Slot>
            ))}
          </ul>
        </AdminBlock>
      ) : null}

      <AdminBlock id="proximos" title="Próximos confirmados">
        {agenda.upcoming.length ? (
          <ul className="tya-list">
            {agenda.upcoming.map((a) => (
              <Slot key={a.id} a={a}>
                <NoteAction action={adminCancelAppointmentAction} args={{ id: a.id }} label="Motivo (ela vê)">
                  Cancelar
                </NoteAction>
              </Slot>
            ))}
          </ul>
        ) : (
          <Vazio icone="agenda" titulo="Nenhum horário confirmado à frente">
            Os horários que você confirmar aparecem aqui, do mais próximo ao mais distante.
          </Vazio>
        )}
      </AdminBlock>

      <AdminBlock
        title="Disponibilidade"
        aside={
          <TransitionLink href={`${ROUTES.adminSettings}#agenda`} className="tya-link tya-link--quiet">
            Editar
          </TransitionLink>
        }
      >
        <dl className="tya-defs">
          <dt>Dias</dt>
          <dd>
            {/* a folga vai escrita na pastilha, e a regra inteira vem abaixo em
                texto: quem atende e quem folga não pode depender da cor. */}
            <div className="tya-pills">
              {WEEKDAYS.map((d, i) => (
                <span key={d} className={`tya-pill tya-pill--${b.weekdays.includes(i) ? "brand" : "quiet"}`}>
                  {b.weekdays.includes(i) ? d : `${d} · folga`}
                </span>
              ))}
            </div>
            <p className="tya-small" style={{ marginTop: 8 }}>
              {diasAbertos.length === 0
                ? "Nenhum dia aberto para agendamento."
                : diasFolga.length === 0
                  ? "Atende todos os dias da semana."
                  : `Atende ${lista(diasAbertos)}. Folga ${lista(diasFolga)}.`}
            </p>
          </dd>
          <dt>Horários</dt>
          <dd>
            <div className="tya-pills">
              {b.slots.map((s) => (
                <span key={s} className="tya-pill tya-pill--quiet tya-num">
                  {s}
                </span>
              ))}
            </div>
          </dd>
          <dt>Regras</dt>
          <dd className="tya-small">
            antecedência mínima {b.lead_hours}h · até {b.horizon_days} dias à frente · {b.default_duration_min} min por
            atendimento · até {b.max_open_per_client}{" "}
            {b.max_open_per_client === 1 ? "horário em aberto" : "horários em aberto"} por cliente
          </dd>
        </dl>
      </AdminBlock>

      <AdminBlock title="Encerrados recentes">
        {agenda.past.length ? (
          <div className="tya-tablewrap tya-tablewrap--bare">
            <table className="tya-table">
              <thead>
                <tr>
                  <th>Quando</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {agenda.past.map((a) => (
                  <tr key={a.id}>
                    <td data-rotulo="Quando" className="tya-num" style={{ whiteSpace: "nowrap" }}>
                      {dateShort(a.scheduled_date)} · {hhmm(a.scheduled_time)}
                    </td>
                    <td data-rotulo="Cliente">
                      {a.client ? (
                        <TransitionLink href={ROUTES.adminClient(a.client.id)} className="tya-link">
                          {a.client.name}
                        </TransitionLink>
                      ) : (
                        "Cliente"
                      )}
                    </td>
                    <td data-rotulo="Serviço">{a.service_name}</td>
                    <td data-rotulo="Estado">
                      <Selo status={a.status} />
                      {a.admin_note ? <span className="tya-small"> · {a.admin_note}</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Vazio icone="agenda" titulo="Nada encerrado nos últimos 45 dias">
            Realizados, cancelados e faltas aparecem aqui depois que você fecha o horário.
          </Vazio>
        )}
      </AdminBlock>
    </>
  );
}
