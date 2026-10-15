import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { listReferrals } from "@/lib/tayssa/queries/admin";
import type { ReferralWithClient } from "@/lib/tayssa/queries/admin";
import { ROUTES } from "@/lib/tayssa/config";
import { dateShort } from "@/lib/tayssa/format";
import { formatBrPhone } from "@/lib/tayssa/phone";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { REFERRAL_STATUS_LABEL, type ReferralStatus } from "@/lib/tayssa/types";
import { adminSetReferralStatusAction } from "@/lib/tayssa/actions/referrals";
import { AdminBlock, AdminHeader, Empty } from "@/components/tayssa/admin/shell";
import { ActionButton, ReferralStatusControl } from "@/components/tayssa/admin/controls";
import { Icone, type IconeNome } from "@/components/tayssa/admin/icons";
import { TransitionLink } from "@/components/tayssa/ui/transition";

const STEPS =
  "Em análise → Contato feito → Atendimento agendado → Atendimento realizado → Confirmada. Só “Confirmada” conta para quem indicou — e só você confirma.";

/**
 * Cada estado tem uma cor só dele — para ler no relance. O dourado fica
 * em "Atendimento realizado": é o estado que espera a palavra dela e o
 * único que, confirmado, vira benefício para quem indicou.
 */
const TOM: Record<ReferralStatus, "warn" | "brand" | "gold" | "ok" | "quiet"> = {
  pending: "warn",
  contacted: "quiet",
  scheduled: "brand",
  completed: "warn",
  approved: "ok",
  rejected: "quiet",
};

function Selo({ status }: { status: ReferralStatus }) {
  return <span className={`tya-pill tya-pill--${TOM[status]}`}>{REFERRAL_STATUS_LABEL[status]}</span>;
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

/** Atalho do topo: número que vem do banco e desce para a seção. */
function Atalho({ n, label, href, alerta }: { n: number; label: string; href: string; alerta?: boolean }) {
  return (
    <a href={href} className={`tya-card tya-kpi tya-card--hover${alerta ? " tya-kpi--alert" : ""}`}>
      <span className="tya-eyebrow">{label}</span>
      <p className="tya-kpi__n">{n}</p>
    </a>
  );
}

/** Quem indicou: a cliente com conta, ou o nome solto que ainda não virou conta. */
function QuemIndicou({ r }: { r: ReferralWithClient }) {
  if (r.referrer) {
    return (
      <TransitionLink href={ROUTES.adminClient(r.referrer.id)} className="tya-link">
        {r.referrer.name}
      </TransitionLink>
    );
  }
  return (
    <>
      {r.referrer_name ?? "—"} ({r.referrer_phone ? formatBrPhone(r.referrer_phone) : "sem telefone"}, sem conta)
    </>
  );
}

/** A linha de trabalho da indicação: quem, por quem, e a decisão à direita. */
function Linha({ r, espera }: { r: ReferralWithClient; espera?: boolean }) {
  return (
    <li className={`tya-item${espera ? " tya-item--wait" : ""}`}>
      <div>
        <div className="tya-slot__top">
          <span className="tya-slot__name">{r.referred_name}</span>
          <Selo status={r.status} />
        </div>
        <p className="tya-slot__meta">
          <a
            href={whatsappUrl(r.referred_phone, `Oi, ${r.referred_name.split(" ")[0]}! `)}
            target="_blank"
            rel="noopener noreferrer"
            className="tya-link"
          >
            {formatBrPhone(r.referred_phone)}
          </a>
          {" · indicada por "}
          <QuemIndicou r={r} />
          {` · ${r.source === "vip" ? "pelo VIP" : "pelo site"} · ${dateShort(r.created_at)}`}
        </p>
        {r.note ? <p className="tya-quote">“{r.note}”</p> : null}
        {!r.referrer ? (
          <p className="tya-slot__mine">
            <span className="tya-pill tya-pill--warn">sem conta</span>{" "}
            A indicação não soma em ninguém até você criar a conta dela com este telefone.
          </p>
        ) : null}
      </div>
      <div className="tya-item__acts">
        {espera ? (
          <ActionButton
            action={adminSetReferralStatusAction}
            args={{ id: r.id, status: "approved" as const }}
            variant="accent"
            confirm={`Confirmar a indicação de ${r.referred_name}? Quem indicou passa a contar com ela.`}
          >
            Confirmar indicação
          </ActionButton>
        ) : null}
        <ReferralStatusControl id={r.id} current={r.status} action={adminSetReferralStatusAction} />
      </div>
    </li>
  );
}

/** Quanto da tabela de encerradas cabe na tela de uma vez. */
const ENCERRADAS_NA_TELA = 60;

/** Primeiro o que já foi atendido (espera a palavra dela), depois o resto do caminho. */
const ORDEM: ReferralStatus[] = ["completed", "scheduled", "contacted", "pending", "approved", "rejected"];

export default async function ReferralsAdminPage() {
  await requireAdminPage();
  const all = await listReferrals();
  const open = all
    .filter((r) => !["approved", "rejected"].includes(r.status))
    .sort((a, b) => ORDEM.indexOf(a.status) - ORDEM.indexOf(b.status));
  const closedAll = all.filter((r) => ["approved", "rejected"].includes(r.status));
  const closed = closedAll.slice(0, ENCERRADAS_NA_TELA);
  const esperando = open.filter((r) => r.status === "completed").length;
  const confirmadas = closedAll.filter((r) => r.status === "approved").length;

  return (
    <>
      <AdminHeader
        eyebrow="Indicações"
        title={
          esperando ? (
            <>
              {esperando} {esperando === 1 ? "pronta" : "prontas"} para <em>confirmar</em>
            </>
          ) : open.length ? (
            <>
              {open.length} em <em>andamento</em>
            </>
          ) : (
            <>
              Nenhuma em <em>andamento</em>
            </>
          )
        }
        lead={STEPS}
      />

      <div className="tya-kpis tya-kpis--2sm tya-stagger">
        <Atalho n={esperando} label="Prontas para confirmar" href="#pipeline" alerta={esperando > 0} />
        <Atalho n={open.length} label="Em andamento" href="#pipeline" />
        <Atalho n={confirmadas} label="Confirmadas" href="#encerradas" />
        <Atalho n={closedAll.length - confirmadas} label="Não confirmadas" href="#encerradas" />
      </div>

      <AdminBlock
        id="pipeline"
        title="Em andamento"
        aside={
          esperando ? (
            <span className="tya-pill tya-pill--warn">{esperando} esperando você</span>
          ) : open.length ? (
            <span className="tya-pill tya-pill--quiet">{open.length} em caminho</span>
          ) : (
            <span className="tya-pill tya-pill--ok">fila vazia</span>
          )
        }
      >
        {open.length ? (
          <ul className="tya-list">
            {open.map((r) => (
              <Linha key={r.id} r={r} espera={r.status === "completed"} />
            ))}
          </ul>
        ) : (
          <Vazio icone="indicacoes" titulo="Nenhuma indicação em andamento">
            Quando alguém indicar uma amiga — pelo site ou pelo app — ela entra aqui em análise e caminha até a sua
            confirmação.
          </Vazio>
        )}
      </AdminBlock>

      <AdminBlock
        id="encerradas"
        title="Encerradas"
        aside={
          closedAll.length ? (
            <span className="tya-pill tya-pill--quiet">
              {confirmadas} {confirmadas === 1 ? "confirmada" : "confirmadas"} de {closedAll.length}
            </span>
          ) : null
        }
      >
        {closed.length ? (
          <>
            <div className="tya-tablewrap tya-tablewrap--bare">
              <table className="tya-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Indicada</th>
                    <th>Por</th>
                    <th>Estado</th>
                    <th>Mudar</th>
                  </tr>
                </thead>
                <tbody>
                  {closed.map((r) => (
                    <tr key={r.id}>
                      <td data-rotulo="Data" className="tya-num" style={{ whiteSpace: "nowrap" }}>
                        {dateShort(r.approved_at ?? r.updated_at)}
                      </td>
                      <td data-rotulo="Indicada">{r.referred_name}</td>
                      <td data-rotulo="Por">
                        <QuemIndicou r={r} />
                      </td>
                      <td data-rotulo="Estado">
                        <Selo status={r.status} />
                        {r.status_note ? <p className="tya-small">{r.status_note}</p> : null}
                      </td>
                      <td data-rotulo="Mudar">
                        <ReferralStatusControl id={r.id} current={r.status} action={adminSetReferralStatusAction} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {closedAll.length > closed.length ? (
              <p className="tya-small" style={{ marginTop: 14 }}>
                Na tela, {closed.length} de {closedAll.length} encerradas.
              </p>
            ) : null}
          </>
        ) : (
          <Vazio icone="indicacoes" titulo="Nenhuma indicação encerrada">
            As confirmadas e as não confirmadas ficam guardadas aqui.
          </Vazio>
        )}
      </AdminBlock>
    </>
  );
}
