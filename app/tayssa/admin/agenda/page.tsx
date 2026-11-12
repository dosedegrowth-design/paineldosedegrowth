import type { ReactNode } from "react";
import Link from "next/link";
import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { getAgenda, getGradeAgenda } from "@/lib/tayssa/queries/admin";
import { AgendaGrade } from "@/components/tayssa/admin/agenda-grade";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES, publicUrl } from "@/lib/tayssa/config";
import { dateShort, dayLabel, dayMonth, hhmm, nowInBusinessTz, weekdayShort } from "@/lib/tayssa/format";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { horariosDaSemana, mensagemConfirmacao, nomeDaCliente, prazoDoSinal, reais } from "@/lib/tayssa/agendar";
import { situacaoDoPedido, type AppointmentStatus } from "@/lib/tayssa/types";
import { taxaDoHorario } from "@/lib/tayssa/rules";
import type { BookingSettings } from "@/lib/tayssa/config";
import { pixDoPedido, type PixDaAgenda } from "@/lib/tayssa/pix";
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
import { AvisosDePedido } from "@/components/tayssa/admin/avisos";
import { AvisoDeConfirmacao } from "@/components/tayssa/admin/aviso-confirmacao";

/** A Agenda com a mensagem de confirmação de um horário aberta (logo depois do "Confirmar"). */
const avisarDe = (id: string) => `${ROUTES.adminAgenda}?avisar=${id}`;

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

function Selo({ a }: { a: Pick<AppointmentWithClient, "status" | "comprovante_em"> }) {
  // pedido com comprovante anexado: "Comprovante enviado", no tom de quem está pronto para conferir
  const tom = a.status === "requested" && a.comprovante_em ? "ok" : TOM[a.status];
  return <span className={`tya-pill tya-pill--${tom}`}>{situacaoDoPedido(a)}</span>;
}

/** "hoje às 14h32", "ontem às 9h05", "05/11 às 18h" (horário de Brasília) */
function quandoAnexou(iso: string): string {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" }).format(d);
  const hora = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(new Date(iso))
    .replace(":", "h");
  const dia = fmt(new Date(iso));
  const hoje = fmt(new Date());
  const ontem = fmt(new Date(Date.now() - 86_400_000));
  return `${dia === hoje ? "hoje" : dia === ontem ? "ontem" : dia} às ${hora}`;
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
  sinal,
  booking,
  children,
}: {
  a: AppointmentWithClient;
  tom?: "warn" | "brand" | "ok" | "quiet" | "bad";
  /** a agenda da casa: dezembro tem a taxa de horário especial no horário */
  booking: BookingSettings;
  /** pedido esperando o sinal: o prazo, o comprovante e a mensagem pronta pedindo o Pix */
  sinal?: { horas: number; valor: number; pix: PixDaAgenda | null };
  children?: ReactNode;
}) {
  const first = clientName(a).split(/\s+/)[0];
  const esperandoSinal = a.status === "requested" && sinal;
  const comComprovante = Boolean(esperandoSinal && a.comprovante_em);
  // o código do Pix vai na mensagem (ela copia direto do WhatsApp) quando a chave está no painel
  const codigoPix = esperandoSinal ? pixDoPedido(sinal.pix, sinal.valor, a.id) : null;
  // dezembro: R$ 30 no primeiro e no último horário de cada dia; no dia 24, em todos
  const taxa = taxaDoHorario(booking, a.scheduled_date, a.scheduled_time);
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
          {a.vip ? <span className="tya-pill tya-pill--gold">VIP</span> : null}
          <Selo a={a} />
        </div>
        <p className="tya-slot__meta">
          {a.service_name} · {a.duration_min} min · {weekdayShort(a.scheduled_date)}, {dateShort(a.scheduled_date)}
          {taxa > 0 ? <> · <b>+ {reais(taxa)} de taxa de horário especial</b></> : null}
        </p>
        {a.client_note ? <p className="tya-quote">“{a.client_note}”</p> : null}
        {esperandoSinal && comComprovante ? (
          <p className="tya-slot__mine tya-slot__mine--ok">
            <span className="tya-slot__tag">comprovante</span>
            Anexado {quandoAnexou(a.comprovante_em!)} · confira o Pix de {reais(sinal.valor)} e confirme.{" "}
            <a
              href={ROUTES.adminComprovante(a.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="tya-link"
            >
              Ver comprovante
            </a>
          </p>
        ) : esperandoSinal ? (
          <p className="tya-slot__mine">
            <span className="tya-slot__tag">sem comprovante</span>
            Aguardando {reais(sinal.valor)} no Pix · sem o comprovante, o pedido cai{" "}
            {prazoDoSinal(a.created_at, sinal.horas).legivel}
          </p>
        ) : null}
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
              // o link do horário vai junto: no WhatsApp ele vira o cartão (folder) com os dados do pedido
              esperandoSinal && !comComprovante
                ? codigoPix
                  ? `Oi, ${first}! Aqui é a Tayssa. Recebi seu pedido de ${a.service_name} para ${dayLabel(a.scheduled_date)} às ${hhmm(a.scheduled_time)}.${taxa > 0 ? ` Esse horário tem a taxa de horário especial de ${reais(taxa)}.` : ""}\n\nSeu horário: ${publicUrl(ROUTES.horario(a.id))}\n\nPara confirmar, pague o sinal de ${reais(sinal.valor)} pelo Pix copia e cola abaixo e anexe o comprovante em Meus horários: ${publicUrl(ROUTES.vipBook)}\n\n${codigoPix}`
                  : `Oi, ${first}! Aqui é a Tayssa. Recebi seu pedido de ${a.service_name} para ${dayLabel(a.scheduled_date)} às ${hhmm(a.scheduled_time)}.${taxa > 0 ? ` Esse horário tem a taxa de horário especial de ${reais(taxa)}.` : ""}\n\nSeu horário: ${publicUrl(ROUTES.horario(a.id))}\n\nPara confirmar, o sinal é de ${reais(sinal.valor)} no Pix. A chave é: `
                : `Oi, ${first}! Sobre seu horário de ${dayLabel(a.scheduled_date)} às ${hhmm(a.scheduled_time)}: `,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="tya-link tya-link--quiet tya-slot__wa"
          >
            {esperandoSinal && !comComprovante ? "Pedir o sinal no WhatsApp" : "WhatsApp"}
          </a>
        ) : null}
        {/* confirmado: a mensagem pronta para a cliente, de novo quando ela precisar */}
        {a.status === "confirmed" ? (
          <Link href={avisarDe(a.id)} scroll={false} replace className="tya-link tya-link--quiet tya-slot__wa">
            Mensagem de confirmação
          </Link>
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

export default async function AgendaAdminPage({ searchParams }: { searchParams: Promise<{ avisar?: string }> }) {
  await requireAdminPage();
  const [agenda, settings, grade, params] = await Promise.all([getAgenda(), getSettings(), getGradeAgenda(), searchParams]);
  const b = settings.booking;
  // logo depois do "Confirmar": a mensagem pronta para a cliente daquele horário
  const confirmado = params.avisar
    ? [...agenda.todayList, ...agenda.upcoming, ...agenda.toClose].find(
        (a) => a.id === params.avisar && a.status === "confirmed",
      )
    : undefined;
  const aviso = confirmado
    ? (() => {
        const nome = nomeDaCliente(confirmado.client?.name ?? "", confirmado.client?.nickname);
        const mensagem = mensagemConfirmacao({
          nome,
          servico: confirmado.service_name,
          tecnica: confirmado.client_note?.match(/^Manutenção do (.+)\.$/)?.[1] ?? null,
          dia: confirmado.scheduled_date,
          hora: confirmado.scheduled_time.slice(0, 5),
          comprovante: Boolean(confirmado.comprovante_em),
          taxa: taxaDoHorario(b, confirmado.scheduled_date, confirmado.scheduled_time),
          endereco: b.local_endereco,
          sala: b.local_sala,
          interfone: b.local_interfone,
          tolerancia: b.tolerancia_min,
          recado: confirmado.admin_note,
          link: publicUrl(ROUTES.vipBook),
        });
        return {
          nome: nome || "a cliente",
          mensagem,
          whatsapp: confirmado.client?.phone ? whatsappUrl(confirmado.client.phone, mensagem) : null,
        };
      })()
    : null;
  const sinalDoPainel = {
    horas: b.sinal_horas,
    valor: b.deposit_reais,
    pix: b.pix_chave ? { chave: b.pix_chave, nome: b.pix_nome, cidade: b.pix_cidade, banco: b.pix_banco } : null,
  };
  const comComprovante = agenda.requested.filter((a) => a.comprovante_em).length;
  const semComprovante = agenda.requested.length - comComprovante;
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
        lead={
          sinalDoPainel.pix
            ? `A semana como no Google Agenda: toque num horário para abrir ou fechar. A cliente marca pelo site, paga o sinal pelo Pix copia e cola e anexa o comprovante: confira e confirme. Sem comprovante em ${b.sinal_horas}h, o pedido cai sozinho e o horário volta para a agenda.`
            : `A semana como no Google Agenda: toque num horário para abrir ou fechar. A cliente marca pelo site com a conta dela e o pedido segura o horário por ${b.sinal_horas}h esperando o sinal: peça o Pix no WhatsApp e confirme quando ele cair. Sem comprovante nesse prazo, o pedido cai sozinho e o horário volta para a agenda.`
        }
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

      {/* a notificação no celular dela a cada horário marcado pelo site */}
      <AvisosDePedido />

      <AdminBlock id="semana" title="Semana">
        <AgendaGrade grade={grade} />
      </AdminBlock>

      <AdminBlock
        id="pedidos"
        title="Pedidos de horário"
        aside={
          agenda.requested.length ? (
            <span className="tya-slot__resumo">
              {comComprovante ? (
                <span className="tya-pill tya-pill--ok">{comComprovante} com comprovante para conferir</span>
              ) : null}
              {semComprovante ? (
                <span className="tya-pill tya-pill--warn">{semComprovante} sem comprovante</span>
              ) : null}
            </span>
          ) : null
        }
      >
        {agenda.requested.length ? (
          <ul className="tya-list">
            {agenda.requested.map((a) => (
              <Slot key={a.id} a={a} sinal={sinalDoPainel} booking={b}>
                <NoteAction
                  action={adminConfirmAppointmentAction}
                  args={{ id: a.id }}
                  label="Recado para a cliente (opcional)"
                  variant="accent"
                  depois={avisarDe(a.id)}
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
            Quando uma cliente marcar um horário pelo site, ele aparece aqui. Confira o comprovante do Pix e confirme.
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
              <Slot key={a.id} a={a} sinal={sinalDoPainel} booking={b}>
                {a.status === "requested" ? (
                  <NoteAction
                    action={adminConfirmAppointmentAction}
                    args={{ id: a.id }}
                    label="Recado para a cliente (opcional)"
                    variant="accent"
                    depois={avisarDe(a.id)}
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
        <AdminBlock id="fechar" title="Para fechar" aside={<span className="tya-pill tya-pill--bad">já passaram</span>}>
          <ul className="tya-list">
            {agenda.toClose.map((a) => (
              <Slot key={a.id} a={a} tom="bad" booking={b}>
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
              <Slot key={a.id} a={a} booking={b}>
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
              {horariosDaSemana(b).map((g) => (
                <span key={g.dias} className="tya-pill tya-pill--quiet">
                  {g.dias} · <span className="tya-num">{g.horas}</span>
                </span>
              ))}
            </div>
            <p className="tya-small" style={{ marginTop: 8 }}>
              De {b.intervalo_min} em {b.intervalo_min} minutos. O último horário de cada dia é o último início.
            </p>
          </dd>
          <dt>Regras</dt>
          <dd className="tya-small">
            antecedência mínima {b.lead_hours}h · até {b.horizon_days} dias à frente · cada serviço ocupa o tempo dele
            (sem tempo próprio, {b.default_duration_min} min) · até {b.max_open_per_client}{" "}
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
                      <Selo a={a} />
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

      {/* logo depois do "Confirmar" (ou de "Mensagem de confirmação"): o texto pronto para a cliente */}
      {aviso ? (
        <AvisoDeConfirmacao
          key={params.avisar}
          nome={aviso.nome}
          mensagem={aviso.mensagem}
          whatsapp={aviso.whatsapp}
          fechar={ROUTES.adminAgenda}
        />
      ) : null}
    </>
  );
}
