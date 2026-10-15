import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { listClientBenefits, type ClientBenefitWithClient } from "@/lib/tayssa/queries/admin";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES } from "@/lib/tayssa/config";
import { cicloLegivel, dateShort } from "@/lib/tayssa/format";
import { BENEFIT_STATUS_LABEL, type ClientBenefitStatus } from "@/lib/tayssa/types";
import {
  adminApproveBenefitRequestAction,
  adminRedeemBenefitAction,
  adminRejectBenefitAction,
  adminValidateBenefitAction,
} from "@/lib/tayssa/actions/benefits";
import { AdminBlock, AdminHeader, Empty } from "@/components/tayssa/admin/shell";
import { ActionButton, NoteAction } from "@/components/tayssa/admin/controls";
import { Icone, type IconeNome } from "@/components/tayssa/admin/icons";
import { TransitionLink } from "@/components/tayssa/ui/transition";

/**
 * Cada estado tem uma cor só dele. O dourado é do benefício liberado —
 * é o que a cliente vê acender no espaço dela.
 */
const TOM: Record<ClientBenefitStatus, "warn" | "gold" | "brand" | "ok" | "quiet" | "bad"> = {
  pending_validation: "warn",
  available: "gold",
  requested: "warn",
  approved: "ok",
  redeemed: "quiet",
  expired: "quiet",
  rejected: "bad",
};

/** Quanto do histórico cabe na tela de uma vez. A contagem nunca sai daqui. */
const HISTORICO_NA_TELA = 60;

function Selo({ status }: { status: ClientBenefitStatus }) {
  return <span className={`tya-pill tya-pill--${TOM[status]}`}>{BENEFIT_STATUS_LABEL[status]}</span>;
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

export default async function BenefitsAdminPage() {
  await requireAdminPage();
  const [all, settings] = await Promise.all([listClientBenefits(), getSettings()]);
  const toValidate = all.filter((b) => b.status === "pending_validation");
  const requested = all.filter((b) => b.status === "requested");
  const live = all.filter((b) => ["available", "approved"].includes(b.status));
  const historyAll = all.filter((b) => ["redeemed", "expired", "rejected"].includes(b.status));
  const history = historyAll.slice(0, HISTORICO_NA_TELA);
  const days = settings.rules.benefit_validity_days;
  const espera = toValidate.length + requested.length;

  /** A linha de trabalho do benefício: de quem é, o que é, e a decisão à direita. */
  const Linha = ({
    b,
    actions,
    espera: aguarda,
  }: {
    b: ClientBenefitWithClient;
    actions?: ReactNode;
    espera?: boolean;
  }) => (
    <li className={`tya-item${aguarda ? " tya-item--wait" : ""}`}>
      <div>
        <div className="tya-slot__top">
          <TransitionLink href={ROUTES.adminClient(b.client_id)} className="tya-link tya-slot__name">
            {b.client?.name ?? "Cliente"}
          </TransitionLink>
          <Selo status={b.status} />
        </div>
        <p className="tya-slot__meta">
          {b.title}
          {b.benefit?.name && b.benefit.name !== b.title ? ` · ${b.benefit.name}` : ""} · {dateShort(b.created_at)}
          {b.expires_at ? ` · válido até ${dateShort(b.expires_at)}` : ""}
        </p>
        {cicloLegivel(b.cycle_key) ? (
          <p className="tya-slot__mine">
            <span className="tya-slot__tag">ciclo</span>
            {cicloLegivel(b.cycle_key)}
          </p>
        ) : null}
        {b.client_note ? <p className="tya-quote">Ela: “{b.client_note}”</p> : null}
      </div>
      {actions ? <div className="tya-item__acts">{actions}</div> : null}
    </li>
  );

  return (
    <>
      <AdminHeader
        eyebrow="Benefícios"
        title={
          espera ? (
            <>
              {espera} esperando <em>sua palavra</em>
            </>
          ) : (
            <>
              Tudo <em>em dia</em>
            </>
          )
        }
        lead="O sistema só identifica quem alcançou o marco e deixa o benefício em validação. Nada é prometido à cliente antes do seu sim."
      />

      <div className="tya-kpis tya-kpis--2sm tya-stagger">
        <Atalho n={toValidate.length} label="A validar" href="#validar" alerta={toValidate.length > 0} />
        <Atalho n={requested.length} label="Solicitados" href="#solicitados" alerta={requested.length > 0} />
        <Atalho n={live.length} label="Liberados" href="#liberados" />
        <Atalho n={historyAll.length} label="No histórico" href="#historico" />
      </div>

      <AdminBlock
        id="validar"
        title="Elegíveis — validar"
        aside={
          toValidate.length ? (
            <span className="tya-pill tya-pill--warn">{toValidate.length} aguardando</span>
          ) : (
            <span className="tya-pill tya-pill--ok">fila vazia</span>
          )
        }
      >
        <p className="tya-small" style={{ marginBottom: 14 }}>
          Alcançaram um marco. Ao validar, o benefício aparece desbloqueado para ela — e só então.
        </p>
        {toValidate.length ? (
          <ul className="tya-list">
            {toValidate.map((b) => (
              <Linha
                key={b.id}
                b={b}
                espera
                actions={
                  <>
                    <NoteAction
                      action={adminValidateBenefitAction}
                      args={{ id: b.id }}
                      variant="accent"
                      label="Recado para ela (opcional)"
                      extra={
                        <div>
                          <label className="tya-label" htmlFor={`validade-${b.id}`}>
                            Validade (dias)
                          </label>
                          <input
                            id={`validade-${b.id}`}
                            className="tya-field"
                            name="validity_days"
                            defaultValue={String(days)}
                            inputMode="numeric"
                          />
                        </div>
                      }
                    >
                      Validar e desbloquear
                    </NoteAction>
                    <NoteAction action={adminRejectBenefitAction} args={{ id: b.id }} label="Motivo (ela vê)">
                      Não liberar
                    </NoteAction>
                  </>
                }
              />
            ))}
          </ul>
        ) : (
          <Vazio icone="beneficios" titulo="Nenhum benefício aguardando validação">
            Quando uma cliente fechar um cartão, completar uma indicação ou chegar ao marco de pontos, o benefício
            espera aqui pela sua validação.
          </Vazio>
        )}
      </AdminBlock>

      <AdminBlock
        id="solicitados"
        title="Solicitados — confirmar"
        aside={
          requested.length ? (
            <span className="tya-pill tya-pill--warn">{requested.length} pedido{requested.length === 1 ? "" : "s"}</span>
          ) : (
            <span className="tya-pill tya-pill--ok">nenhum pedido</span>
          )
        }
      >
        <p className="tya-small" style={{ marginBottom: 14 }}>
          Ela quer usar o benefício. Confirme e ela agenda.
        </p>
        {requested.length ? (
          <ul className="tya-list">
            {requested.map((b) => (
              <Linha
                key={b.id}
                b={b}
                espera
                actions={
                  <>
                    <ActionButton action={adminApproveBenefitRequestAction} args={{ id: b.id }} variant="accent">
                      Confirmar
                    </ActionButton>
                    <ActionButton action={adminRedeemBenefitAction} args={{ id: b.id }}>
                      Marcar utilizado
                    </ActionButton>
                    <NoteAction action={adminRejectBenefitAction} args={{ id: b.id }} label="Motivo (ela vê)">
                      Não liberar
                    </NoteAction>
                  </>
                }
              />
            ))}
          </ul>
        ) : (
          <Vazio icone="beneficios" titulo="Nenhuma solicitação aberta">
            Os pedidos feitos no app da cliente caem aqui.
          </Vazio>
        )}
      </AdminBlock>

      <AdminBlock
        id="liberados"
        title="Desbloqueados e confirmados"
        aside={live.length ? <span className="tya-pill tya-pill--gold">{live.length} em pé</span> : null}
      >
        <p className="tya-small" style={{ marginBottom: 14 }}>
          Marque como utilizado depois do atendimento.
        </p>
        {live.length ? (
          <ul className="tya-list">
            {live.map((b) => (
              <Linha
                key={b.id}
                b={b}
                actions={
                  <>
                    <ActionButton action={adminRedeemBenefitAction} args={{ id: b.id }} variant="solid">
                      Marcar utilizado
                    </ActionButton>
                    <NoteAction action={adminRejectBenefitAction} args={{ id: b.id }} label="Motivo (ela vê)">
                      Cancelar
                    </NoteAction>
                  </>
                }
              />
            ))}
          </ul>
        ) : (
          <Vazio icone="beneficios" titulo="Nenhum benefício ativo no momento">
            Os que você validar ou confirmar ficam aqui até serem usados.
          </Vazio>
        )}
      </AdminBlock>

      <AdminBlock
        id="historico"
        title="Histórico"
        aside={
          historyAll.length ? (
            <span className="tya-pill tya-pill--quiet">{historyAll.length} registros</span>
          ) : null
        }
      >
        {history.length ? (
          <>
            <ul className="tya-list">
              {history.map((b) => (
                <Linha key={b.id} b={b} />
              ))}
            </ul>
            {historyAll.length > history.length ? (
              <p className="tya-small" style={{ marginTop: 14 }}>
                Na tela, {history.length} de {historyAll.length} registros.
              </p>
            ) : null}
          </>
        ) : (
          <Vazio icone="beneficios" titulo="Nada no histórico ainda">
            Utilizados, expirados e não liberados ficam guardados aqui.
          </Vazio>
        )}
      </AdminBlock>
    </>
  );
}
