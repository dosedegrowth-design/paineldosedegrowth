import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { listServices } from "@/lib/tayssa/queries/admin";
import type { ServiceWithClient } from "@/lib/tayssa/queries/admin";
import { ROUTES } from "@/lib/tayssa/config";
import { currency, dateShort, dateTime, monthName, weekdayShort } from "@/lib/tayssa/format";
import { adminReviewServiceAction } from "@/lib/tayssa/actions/services";
import { SERVICE_STATUS_LABEL, type ServiceStatus } from "@/lib/tayssa/types";
import { AdminBlock, AdminHeader, Empty } from "@/components/tayssa/admin/shell";
import { ActionButton, NoteAction } from "@/components/tayssa/admin/controls";
import { Icone, type IconeNome } from "@/components/tayssa/admin/icons";
import { TransitionLink } from "@/components/tayssa/ui/transition";

/** Cada estado tem uma cor só dele — para ler no relance. */
const TOM: Record<ServiceStatus, "warn" | "ok" | "quiet"> = {
  pending: "warn",
  approved: "ok",
  rejected: "quiet",
};

function Selo({ status }: { status: ServiceStatus }) {
  return <span className={`tya-pill tya-pill--${TOM[status]}`}>{SERVICE_STATUS_LABEL[status]}</span>;
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

/** "12 / out" a partir de "2026-10-12", sem passar por fuso. */
function diaMes(iso: string): { dia: string; mes: string } {
  return { dia: iso.slice(8, 10), mes: monthName(Number(iso.slice(5, 7)) - 1).slice(0, 3) };
}

/** Registro aguardando: data à esquerda, quem e o quê no meio, ação à direita. */
function Registro({ s, children }: { s: ServiceWithClient; children?: ReactNode }) {
  const { dia, mes } = diaMes(s.service_date);
  return (
    <li className="tya-slot" data-tom={TOM[s.status]}>
      <div className="tya-slot__when">
        <span className="tya-slot__dow">{weekdayShort(s.service_date)}</span>
        <span className="tya-num tya-slot__h">{dia}</span>
        <span className="tya-slot__d">{mes}</span>
      </div>

      <div className="tya-slot__body">
        <div className="tya-slot__top">
          <TransitionLink href={ROUTES.adminClient(s.client_id)} className="tya-link tya-slot__name">
            {s.client?.name ?? "Cliente"}
          </TransitionLink>
          <Selo status={s.status} />
          {/* dourado diz "já está nas mãos dela": ponto de atendimento não
              confirmado ainda não entrou, e ficava dourado dentro do bloco
              "Aguardando você", ao lado de um selo de espera. */}
          <span className={`tya-pill tya-num ${s.status === "approved" ? "tya-pill--gold" : "tya-pill--quiet"}`}>
            {s.points} pts
          </span>
        </div>
        <p className="tya-slot__meta">
          {s.service_name} · {dateShort(s.service_date)}
          {s.amount != null ? ` · ${currency(s.amount)}` : ""}
        </p>
        {s.notes ? <p className="tya-quote">“{s.notes}”</p> : null}
        <p className="tya-slot__mine">
          <span className="tya-slot__tag">enviado</span>
          {dateTime(s.submitted_at)}
        </p>
      </div>

      {children ? <div className="tya-slot__acts">{children}</div> : null}
    </li>
  );
}

export default async function ServicesAdminPage() {
  await requireAdminPage();
  const [pending, all] = await Promise.all([listServices("pending"), listServices("all")]);
  const recent = all.filter((s) => s.status !== "pending").slice(0, 40);

  return (
    <>
      <AdminHeader
        eyebrow="Atendimentos"
        title={
          pending.length ? (
            <>
              {pending.length} a <em>confirmar</em>
            </>
          ) : (
            <>
              Nada a <em>confirmar</em>
            </>
          )
        }
        lead="Registros enviados pelas clientes. Só depois da sua confirmação os pontos entram na jornada."
        actions={
          <TransitionLink href={ROUTES.adminAgenda} className="tya-btn tya-btn--ghost">
            <Icone nome="agenda" />
            Ver a agenda
          </TransitionLink>
        }
      />

      <AdminBlock
        title="Aguardando você"
        aside={
          pending.length ? (
            <span className="tya-pill tya-pill--warn">{pending.length} aguardando</span>
          ) : (
            <span className="tya-pill tya-pill--ok">fila vazia</span>
          )
        }
      >
        {pending.length ? (
          <ul className="tya-list">
            {pending.map((s) => (
              <Registro key={s.id} s={s}>
                <ActionButton
                  action={adminReviewServiceAction}
                  args={{ id: s.id, decision: "approve" as const }}
                  variant="accent"
                >
                  Confirmar
                </ActionButton>
                <NoteAction
                  action={adminReviewServiceAction}
                  args={{ id: s.id, decision: "reject" as const }}
                  label="Motivo (ela vê)"
                >
                  Não confirmar
                </NoteAction>
              </Registro>
            ))}
          </ul>
        ) : (
          <Vazio icone="atendimentos" titulo="Nenhum registro aguardando confirmação">
            Quando uma cliente registrar um atendimento pelo app, ele espera aqui — os pontos só entram depois do seu
            sim.
          </Vazio>
        )}
      </AdminBlock>

      <AdminBlock
        title="Recentes"
        aside={recent.length ? <span className="tya-pill tya-pill--quiet">{recent.length} registros</span> : null}
      >
        {recent.length ? (
          <div className="tya-tablewrap tya-tablewrap--bare">
            <table className="tya-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Pontos</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => (
                  <tr key={s.id}>
                    <td data-rotulo="Data" className="tya-num" style={{ whiteSpace: "nowrap" }}>
                      {dateShort(s.service_date)}
                    </td>
                    <td data-rotulo="Cliente">
                      <TransitionLink href={ROUTES.adminClient(s.client_id)} className="tya-link">
                        {s.client?.name ?? "—"}
                      </TransitionLink>
                    </td>
                    <td data-rotulo="Serviço">{s.service_name}</td>
                    <td data-rotulo="Pontos" className="tya-num">{s.points}</td>
                    <td data-rotulo="Estado">
                      <Selo status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Vazio icone="atendimentos" titulo="Ainda não há atendimentos">
            Os registros confirmados e não confirmados ficam guardados aqui.
          </Vazio>
        )}
      </AdminBlock>
    </>
  );
}
