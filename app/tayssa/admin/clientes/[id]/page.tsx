import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { getClientDetail } from "@/lib/tayssa/queries/admin";
import { getActiveServices, getPublicBenefits } from "@/lib/tayssa/queries/catalog";
import { getSettings } from "@/lib/tayssa/settings";
import { toISODate } from "@/lib/tayssa/rules";
import { cicloLegivel, currency, dateLong, dateShort, dateTime, isWithinHours, nowInBusinessTz } from "@/lib/tayssa/format";
import { formatBrPhone } from "@/lib/tayssa/phone";
import { renderTemplate, whatsappUrl } from "@/lib/tayssa/whatsapp";
import { ROUTES, publicUrl } from "@/lib/tayssa/config";
import { auditLabel } from "@/lib/tayssa/audit-labels";
import type { ClientBenefitStatus, ReferralStatus, ServiceStatus, UserStatus, VipStatus } from "@/lib/tayssa/types";
import {
  BENEFIT_STATUS_LABEL,
  REFERRAL_STATUS_LABEL,
  SERVICE_STATUS_LABEL,
  USER_STATUS_LABEL,
  VIP_STATUS_LABEL,
} from "@/lib/tayssa/types";
import { adminSetClientStatusAction, adminSetVipAction, adminRevokeSessionsAction } from "@/lib/tayssa/actions/clients";
import { adminReviewServiceAction } from "@/lib/tayssa/actions/services";
import {
  adminApproveBenefitRequestAction,
  adminRedeemBenefitAction,
  adminRejectBenefitAction,
  adminValidateBenefitAction,
} from "@/lib/tayssa/actions/benefits";
import { AdminBlock, AdminHeader, Empty, Stat } from "@/components/tayssa/admin/shell";
import { ActionButton, NoteAction } from "@/components/tayssa/admin/controls";
import { AccessLinkPanel, AdminServiceEntryForm, ClientEditForm, GrantCustomBenefitForm, ReleaseBirthdayForm } from "@/components/tayssa/admin/forms";
import { SignupReviewPanel } from "@/components/tayssa/admin/signup-review";
import { TransitionLink } from "@/components/tayssa/ui/transition";

/* ---- selos de estado: o dourado é do VIP, o cassis é do que espera ---- */
const VIP_TOM: Record<VipStatus, string> = {
  active: "tya-pill--gold",
  suspended: "tya-pill--warn",
  none: "tya-pill--quiet",
};
const CONTA_TOM: Record<UserStatus, string> = {
  pending: "tya-pill--warn",
  active: "tya-pill--ok",
  inactive: "tya-pill--quiet",
  suspended: "tya-pill--bad",
  rejected: "tya-pill--bad",
};
const SERVICO_TOM: Record<ServiceStatus, string> = {
  pending: "tya-pill--warn",
  approved: "tya-pill--ok",
  rejected: "tya-pill--quiet",
};
const BENEFICIO_TOM: Record<ClientBenefitStatus, string> = {
  pending_validation: "tya-pill--warn",
  available: "tya-pill--gold",
  requested: "tya-pill--warn",
  approved: "tya-pill--ok",
  redeemed: "tya-pill--quiet",
  expired: "tya-pill--quiet",
  rejected: "tya-pill--bad",
};
const INDICACAO_TOM: Record<ReferralStatus, string> = {
  pending: "tya-pill--warn",
  contacted: "tya-pill--warn",
  scheduled: "tya-pill--brand",
  completed: "tya-pill--brand",
  approved: "tya-pill--ok",
  rejected: "tya-pill--bad",
};

const Selo = ({ tom, children }: { tom: string; children: React.ReactNode }) => (
  <span className={`tya-pill ${tom}`}>{children}</span>
);


export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const [d, services, benefits, settings] = await Promise.all([
    getClientDetail(id),
    getActiveServices(),
    getPublicBenefits(),
    getSettings(),
  ]);
  if (!d) notFound();
  const { user, profile } = d.summary;
  const first = user.nickname ?? user.name.split(" ")[0];
  const vip = profile?.vip_status ?? "none";
  const canReleaseBirthday = vip === "active" && profile?.birthday && !d.thisYearBirthday;
  // a faixa só vale se contar tudo o que espera decisão sua nesta ficha
  const beneficiosPedidos = d.benefits.filter((b) => b.status === "requested").length;
  const esperando =
    d.summary.pendingServices + d.summary.benefitsPendingValidation + beneficiosPedidos;
  const revisadoAgora = user.signup_source === "self" && user.status !== "pending" && isWithinHours(user.reviewed_at, 48);

  // pedido de acesso: ainda não há ficha para mostrar — só a decisão, num cartão centrado
  if (user.status === "pending") {
    return (
      <div className="tya-pedido-pagina tya-up">
        <TransitionLink href={ROUTES.adminClients} className="tya-pedido-pagina__voltar">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M14.5 6 8.5 12l6 6" />
          </svg>
          Clientes
        </TransitionLink>
        <SignupReviewPanel
          id={user.id}
          name={user.name}
          email={user.email}
          phone={user.phone}
          message={user.signup_message}
          requestedAt={user.requested_at}
        />
      </div>
    );
  }

  return (
    <>
      <AdminHeader
        eyebrow="Cliente"
        title={<>{user.name}</>}
        lead={
          <>
            Conta {USER_STATUS_LABEL[user.status].toLowerCase()} · {VIP_STATUS_LABEL[vip].toLowerCase()}
            {profile?.vip_since ? ` desde ${dateShort(profile.vip_since)}` : ""}
          </>
        }
        actions={
          <>
            {user.phone ? (
              <a
                href={whatsappUrl(user.phone, `Oi, ${first}! `)}
                target="_blank"
                rel="noopener noreferrer"
                className="tya-btn tya-btn--ghost"
              >
                WhatsApp
              </a>
            ) : null}
            <TransitionLink href={ROUTES.adminClients} className="tya-btn tya-btn--ghost">
              Todas as clientes
            </TransitionLink>
          </>
        }
      />

      {/* ---------- quem é ela ---------- */}
      <div className="tya-kpis tya-kpis--tight">
        <Stat n={d.summary.points} label="Pontos" />
        <Stat n={d.summary.approvedCount} label="Atendimentos" />
        <Stat n={d.summary.approvedReferrals} label="Indicações confirmadas" />
        {/* `benefitsAvailable` soma available + requested + approved; o
            "requested" ainda espera decisão dela e já é contado em
            Pendências. Sem tirar daqui, a mesma faixa dizia que o benefício
            estava liberado E esperando. */}
        <Stat n={Math.max(0, d.summary.benefitsAvailable - beneficiosPedidos)} label="Benefícios liberados" />
        <Stat n={profile?.birthday ? dateShort(profile.birthday).slice(0, 5) : "—"} label="Aniversário" />
        <Stat n={esperando} label="Pendências" alert={esperando > 0} />
      </div>

      <AdminBlock
        title="Quem é ela"
        aside={
          <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
            <Selo tom={VIP_TOM[vip]}>{VIP_STATUS_LABEL[vip]}</Selo>
            <Selo tom={CONTA_TOM[user.status]}>{USER_STATUS_LABEL[user.status]}</Selo>
            {d.summary.inactive ? <Selo tom="tya-pill--warn">Sem atendimento recente</Selo> : null}
          </span>
        }
      >
        <dl className="tya-defs">
          <dt>E-mail</dt>
          <dd>{user.email}</dd>
          <dt>WhatsApp</dt>
          <dd>
            {user.phone ? (
              <a href={whatsappUrl(user.phone, `Oi, ${first}! `)} target="_blank" rel="noopener noreferrer" className="tya-link">
                {formatBrPhone(user.phone)}
              </a>
            ) : (
              "—"
            )}
          </dd>
          <dt>Aniversário</dt>
          <dd>{profile?.birthday ? dateLong(profile.birthday) : "—"}</dd>
          <dt>Entrou</dt>
          <dd>
            {user.signup_source === "self" ? "pelo site, com pedido de acesso" : "cadastrada por você"}
            {user.requested_at ? ` · ${dateTime(user.requested_at)}` : ""}
          </dd>
          <dt>Sessões</dt>
          <dd>
            {d.activeSessions > 0
              ? `${d.activeSessions} ${d.activeSessions === 1 ? "aparelho conectado" : "aparelhos conectados"}`
              : "nenhum aparelho conectado"}
            {user.last_login_at ? ` · última entrada ${dateTime(user.last_login_at)}` : ""}
          </dd>
        </dl>
      </AdminBlock>

      {revisadoAgora ? (
        <AdminBlock
          title="Pedido de acesso"
          aside={<span className="tya-small">revisado em {dateTime(user.reviewed_at)}</span>}
        >
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Selo tom={user.status === "rejected" ? "tya-pill--bad" : "tya-pill--ok"}>
              {user.status === "rejected" ? "Recusado" : "Aprovado"}
            </Selo>
            <p className="tya-small" style={{ margin: 0 }}>
              {user.status === "rejected"
                ? "A conta ficou marcada como recusada. Se mudar de ideia, reative em “Acesso e VIP”."
                : `${(user.nickname ?? user.name).split(" ")[0]} já pode entrar com o e-mail e a senha que escolheu no cadastro — o botão de boas-vindas está em “Acesso e VIP”.`}
            </p>
          </div>
          {user.review_note ? <p className="tya-quote">Sua nota: “{user.review_note}”</p> : null}
        </AdminBlock>
      ) : null}

      {/* ---------- acesso ---------- */}
      <AdminBlock title="Acesso e VIP">
        <div className="tya-cols">
          <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <span className="tya-eyebrow">VIP</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {vip !== "active" ? (
                <ActionButton action={adminSetVipAction} args={{ id: user.id, vip: "active" as const }} variant="accent">
                  Ativar VIP
                </ActionButton>
              ) : null}
              {vip === "active" ? (
                <ActionButton action={adminSetVipAction} args={{ id: user.id, vip: "suspended" as const }}>
                  Suspender VIP
                </ActionButton>
              ) : null}
              {vip !== "none" ? (
                <ActionButton action={adminSetVipAction} args={{ id: user.id, vip: "none" as const }} confirm="Remover o acesso VIP desta cliente?">
                  Remover VIP
                </ActionButton>
              ) : null}
            </div>
            <span className="tya-small">
              Referência: {settings.rules.vip_min_services} atendimentos. Ela tem {d.summary.approvedCount}. A decisão é sua.
            </span>
          </div>

          <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <span className="tya-eyebrow">Conta</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {user.status === "active" ? (
                <>
                  <ActionButton action={adminSetClientStatusAction} args={{ id: user.id, status: "suspended" as const }} confirm="Suspender a conta? Ela perde o acesso até você reativar.">
                    Suspender conta
                  </ActionButton>
                  <ActionButton action={adminSetClientStatusAction} args={{ id: user.id, status: "inactive" as const }} confirm="Desativar a conta?">
                    Desativar
                  </ActionButton>
                </>
              ) : (
                <ActionButton action={adminSetClientStatusAction} args={{ id: user.id, status: "active" as const }} variant="solid">
                  Reativar conta
                </ActionButton>
              )}
              {user.signup_source === "self" && user.status === "active" && user.phone ? (
                <a
                  href={whatsappUrl(
                    user.phone,
                    renderTemplate(settings.signup.welcome_template, {
                      name: (user.nickname ?? user.name).trim().split(/\s+/)[0],
                      url: publicUrl(ROUTES.login),
                    })
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tya-btn tya-btn--sm tya-btn--primary"
                >
                  Boas-vindas no WhatsApp
                </a>
              ) : null}
              {d.activeSessions > 0 ? (
                <ActionButton action={adminRevokeSessionsAction} args={{ id: user.id }}>
                  Encerrar sessões ({d.activeSessions})
                </ActionButton>
              ) : null}
            </div>
          </div>

          <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <span className="tya-eyebrow">Link de acesso</span>
            <AccessLinkPanel userId={user.id} name={user.name} phone={user.phone} hasPassword={d.hasPassword} />
          </div>
        </div>
      </AdminBlock>

      {/* ---------- pontos e rodada de indicações ---------- */}
      <AdminBlock
        title="Pontos e marcos"
        aside={<span className="tya-small">{d.loyalty.points} pontos acumulados</span>}
      >
        {d.loyalty.milestones.length ? (
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <div className="tya-bar">
                <i style={{ width: `${Math.round(d.loyalty.overall * 100)}%` }} />
              </div>
              <p className="tya-small" style={{ marginTop: 8 }}>
                {d.loyalty.next
                  ? `Faltam ${d.loyalty.pointsToNext} ${d.loyalty.pointsToNext === 1 ? "ponto" : "pontos"} para “${d.loyalty.next.title}”.`
                  : "Ela já passou por todos os marcos da jornada."}
              </p>
            </div>
            <ul className="tya-list">
              {d.loyalty.milestones.map((m) => (
                <li key={m.benefitId} className="tya-row">
                  <span>
                    {m.title}
                    <span className="tya-small"> · {m.threshold} pontos</span>
                  </span>
                  <Selo tom={m.reached ? "tya-pill--ok" : "tya-pill--quiet"}>{m.reached ? "Alcançado" : "A caminho"}</Selo>
                </li>
              ))}
            </ul>
            <p className="tya-small">
              Marco alcançado não libera nada sozinho: o benefício nasce em validação e só você desbloqueia.
            </p>
          </div>
        ) : (
          <Empty>Nenhum marco de pontos cadastrado no catálogo.</Empty>
        )}
      </AdminBlock>

      {/* ---------- aniversário ---------- */}
      <AdminBlock
        title="Aniversário"
        aside={
          profile?.birthday ? (
            <span className="tya-small">
              {dateLong(profile.birthday)} · semana de {dateShort(d.birthday!.windowStart)} a {dateShort(d.birthday!.windowEnd)}
            </span>
          ) : (
            <span className="tya-small">sem data</span>
          )
        }
      >
        {d.thisYearBirthday ? (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{d.thisYearBirthday.title}</span>
            <Selo tom={BENEFICIO_TOM[d.thisYearBirthday.status]}>{BENEFIT_STATUS_LABEL[d.thisYearBirthday.status]}</Selo>
            <span className="tya-small">liberado este ano</span>
          </div>
        ) : canReleaseBirthday ? (
          <ReleaseBirthdayForm
            clientId={user.id}
            defaultDays={benefits.find((b) => b.type === "birthday")?.validity_days ?? settings.rules.benefit_validity_days}
          />
        ) : (
          <Empty>
            {vip !== "active" ? "Só VIP ativo recebe o benefício de aniversário." : "Cadastre a data de aniversário para liberar o benefício."}
          </Empty>
        )}
      </AdminBlock>

      {/* ---------- atendimentos ---------- */}
      <AdminBlock
        title="Atendimentos"
        aside={
          <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
            <Selo tom="tya-pill--quiet">{d.summary.approvedCount} confirmados</Selo>
            {d.summary.pendingServices > 0 ? <Selo tom="tya-pill--warn">{d.summary.pendingServices} a confirmar</Selo> : null}
          </span>
        }
      >
        <div style={{ display: "grid", gap: 24 }}>
          {d.services.length ? (
            <div className="tya-tablewrap">
              <table className="tya-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Serviço</th>
                    <th>Valor</th>
                    <th>Pontos</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {d.services.map((s) => (
                    <tr key={s.id}>
                      <td className="tya-num">{dateShort(s.service_date)}</td>
                      <td>
                        {s.service_name}
                        {s.notes ? <span className="tya-small" style={{ display: "block" }}>{s.notes}</span> : null}
                        <span className="tya-small" style={{ display: "block" }}>por {s.submitted_by === "client" ? "ela" : "você"}</span>
                      </td>
                      <td className="tya-num">{s.amount != null ? currency(s.amount) : "—"}</td>
                      <td className="tya-num">{s.points}</td>
                      <td>
                        <Selo tom={SERVICO_TOM[s.status]}>{SERVICE_STATUS_LABEL[s.status]}</Selo>
                      </td>
                      <td>
                        {s.status === "pending" ? (
                          <div className="tya-item__acts" style={{ justifyContent: "flex-start" }}>
                            <ActionButton action={adminReviewServiceAction} args={{ id: s.id, decision: "approve" as const }} variant="accent">
                              Confirmar
                            </ActionButton>
                            <NoteAction action={adminReviewServiceAction} args={{ id: s.id, decision: "reject" as const }} label="Motivo (ela vê)">
                              Não confirmar
                            </NoteAction>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty>Nenhum atendimento ainda.</Empty>
          )}
          <div>
            <span className="tya-eyebrow" style={{ display: "block", marginBottom: 12 }}>Registrar atendimento confirmado</span>
            <AdminServiceEntryForm clientId={user.id} services={services} todayISO={toISODate(nowInBusinessTz())} />
          </div>
        </div>
      </AdminBlock>

      {/* ---------- benefícios ---------- */}
      <AdminBlock
        title="Benefícios"
        aside={
          d.summary.benefitsPendingValidation > 0 ? (
            <Selo tom="tya-pill--warn">{d.summary.benefitsPendingValidation} a validar</Selo>
          ) : (
            <span className="tya-small">{d.summary.benefitsAvailable} liberados</span>
          )
        }
      >
        <div style={{ display: "grid", gap: 24 }}>
          {d.benefits.length ? (
            <ul className="tya-list">
              {d.benefits.map((b) => (
                <li key={b.id} className="tya-item">
                  <div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <strong style={{ fontWeight: 600, fontSize: 14.5 }}>{b.title}</strong>
                      <Selo tom={BENEFICIO_TOM[b.status]}>{BENEFIT_STATUS_LABEL[b.status]}</Selo>
                    </div>
                    <span className="tya-small" style={{ display: "block", marginTop: 4 }}>
                      {/* o motor grava title = benefit.name, então nas linhas
                          dele os dois são a mesma string: repetir só enche a
                          linha. Mesmo critério da tela de Benefícios. */}
                      {[
                        b.benefit?.name && b.benefit.name !== b.title ? b.benefit.name : null,
                        cicloLegivel(b.cycle_key),
                        `criado ${dateShort(b.created_at)}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                      {b.expires_at ? ` · válido até ${dateShort(b.expires_at)}` : ""}
                    </span>
                    {b.client_note ? <p className="tya-quote">Ela: “{b.client_note}”</p> : null}
                    {b.admin_note ? <p className="tya-quote">Você: “{b.admin_note}”</p> : null}
                  </div>
                  <div className="tya-item__acts">
                    <BenefitActions id={b.id} status={b.status} defaultDays={settings.rules.benefit_validity_days} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nenhum benefício ainda. Eles aparecem quando ela alcança um marco ou quando você concede.</Empty>
          )}
          <div>
            <span className="tya-eyebrow" style={{ display: "block", marginBottom: 12 }}>Conceder benefício especial</span>
            <GrantCustomBenefitForm clientId={user.id} benefits={benefits} defaultDays={settings.rules.benefit_validity_days} />
          </div>
        </div>
      </AdminBlock>

      {/* ---------- indicações ---------- */}
      <AdminBlock
        title="Indicações feitas por ela"
        aside={
          <span className="tya-small">
            {d.referral.approved} confirmadas · {d.referral.inCycle}/{d.referral.threshold} na rodada
          </span>
        }
      >
        {d.referrals.length ? (
          <ul className="tya-list">
            {d.referrals.map((r) => (
              <li key={r.id} className="tya-row">
                <span>
                  {r.referred_name}
                  <span className="tya-small"> · {formatBrPhone(r.referred_phone)} · {dateShort(r.created_at)}</span>
                </span>
                <Selo tom={INDICACAO_TOM[r.status]}>{REFERRAL_STATUS_LABEL[r.status]}</Selo>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Nenhuma indicação ainda.</Empty>
        )}
      </AdminBlock>

      {/* ---------- dados e histórico ---------- */}
      <AdminBlock title="Dados">
        <ClientEditForm user={user} profile={profile} />
        {profile?.notes ? (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--tya-line-soft)" }}>
            <span className="tya-eyebrow">Notas internas de hoje</span>
            <p className="tya-quote">{profile.notes}</p>
          </div>
        ) : null}
      </AdminBlock>

      <AdminBlock title="Histórico de ações">
        {d.audit.length ? (
          <ul className="tya-list">
            {d.audit.map((a) => (
              <li
                key={a.id}
                className="tya-row"
                style={{ display: "grid", gridTemplateColumns: "minmax(120px, auto) minmax(0, 1fr)", gap: 16, alignItems: "baseline" }}
              >
                <span className="tya-small tya-num">{dateTime(a.created_at)}</span>
                <span style={{ fontSize: 13 }}>
                  {auditLabel(a.action)}
                  <span className="tya-small"> · {a.actor_role === "admin" ? "você" : a.actor_role === "client" ? "ela" : a.actor_role === "public" ? "site" : a.actor_role === "system" ? "sistema" : a.actor_role}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Sem ações registradas.</Empty>
        )}
      </AdminBlock>
    </>
  );
}

function BenefitActions({ id, status, defaultDays }: { id: string; status: ClientBenefitStatus; defaultDays: number }) {
  return (
    <>
      {status === "pending_validation" ? (
        <NoteAction
          action={adminValidateBenefitAction}
          args={{ id }}
          variant="accent"
          label="Recado para ela (opcional)"
          extra={
            <div>
              <label className="tya-label" htmlFor={`val-${id}`}>
                Validade (dias)
              </label>
              <input id={`val-${id}`} className="tya-field" name="validity_days" defaultValue={String(defaultDays)} inputMode="numeric" />
            </div>
          }
        >
          Validar e desbloquear
        </NoteAction>
      ) : null}
      {status === "requested" || status === "available" ? (
        <ActionButton action={adminApproveBenefitRequestAction} args={{ id }} variant="solid">
          Confirmar
        </ActionButton>
      ) : null}
      {["available", "requested", "approved"].includes(status) ? (
        <ActionButton action={adminRedeemBenefitAction} args={{ id }}>
          Marcar utilizado
        </ActionButton>
      ) : null}
      {!["redeemed", "rejected", "expired"].includes(status) ? (
        <NoteAction action={adminRejectBenefitAction} args={{ id }} label="Motivo (ela vê)">
          Não liberar
        </NoteAction>
      ) : null}
    </>
  );
}
