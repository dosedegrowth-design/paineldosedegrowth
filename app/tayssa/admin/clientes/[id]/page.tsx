import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { getClientDetail } from "@/lib/tayssa/queries/admin";
import { getActiveServices, getPublicBenefits } from "@/lib/tayssa/queries/catalog";
import { getSettings } from "@/lib/tayssa/settings";
import { toISODate } from "@/lib/tayssa/rules";
import { currency, dateLong, dateShort, dateTime, isWithinHours } from "@/lib/tayssa/format";
import { formatBrPhone } from "@/lib/tayssa/phone";
import { renderTemplate, whatsappUrl } from "@/lib/tayssa/whatsapp";
import { ROUTES, publicUrl } from "@/lib/tayssa/config";
import { auditLabel } from "@/lib/tayssa/audit-labels";
import { VIP_STATUS_LABEL, USER_STATUS_LABEL } from "@/lib/tayssa/types";
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
import { BenefitStatusText, ReferralStatusText, ServiceStatusText, StatusText } from "@/components/tayssa/ui/status";

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

  return (
    <>
      <AdminHeader
        eyebrow="Cliente"
        title={<>{user.name}</>}
        lead={
          <>
            {user.email} · {user.phone ? formatBrPhone(user.phone) : "sem telefone"} · conta {USER_STATUS_LABEL[user.status].toLowerCase()}
            {profile?.vip_since ? ` · VIP desde ${dateShort(profile.vip_since)}` : ""}
          </>
        }
        actions={
          user.phone ? (
            <a href={whatsappUrl(user.phone, `Oi, ${first}! `)} target="_blank" rel="noopener noreferrer" className="ty-btn ty-btn--sm">
              <span>WhatsApp</span>
            </a>
          ) : null
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0 28px" }}>
        <Stat n={VIP_STATUS_LABEL[vip]} label="Status" />
        <Stat n={d.summary.points} label="Pontos" />
        <Stat n={d.summary.approvedCount} label="Atendimentos" />
        <Stat n={d.summary.approvedReferrals} label="Indicações confirmadas" />
        <Stat n={profile?.birthday ? dateShort(profile.birthday).slice(0, 5) : "—"} label="Aniversário" />
        <Stat n={d.summary.pendingServices + d.summary.benefitsPendingValidation} label="Pendências" alert={d.summary.pendingServices + d.summary.benefitsPendingValidation > 0} />
      </div>

      {user.signup_source === "self" && user.status !== "pending" && isWithinHours(user.reviewed_at, 48) ? (
        <AdminBlock title="Pedido de acesso" aside={<span className="ty-small">revisado em {dateTime(user.reviewed_at)}</span>}>
          <p className="ty-lead" style={{ fontSize: 18 }}>
            {user.status === "rejected" ? "Recusado." : `${(user.nickname ?? user.name).split(" ")[0]} já pode entrar.`}
          </p>
          <p className="ty-body" style={{ marginTop: 6 }}>
            {user.status === "rejected"
              ? "A conta ficou marcada como recusada. Se mudar de ideia, reative em “Conta”."
              : "A conta está ativa. Ela entra com o e-mail e a senha que escolheu no cadastro — o botão de boas-vindas está em “Conta”."}
          </p>
          {user.review_note ? (
            <p className="ty-small" style={{ marginTop: 8, fontWeight: 300 }}>Sua nota: “{user.review_note}”</p>
          ) : null}
        </AdminBlock>
      ) : null}
      {user.status === "pending" ? (
        <AdminBlock title="Pedido de acesso">
          <SignupReviewPanel
            id={user.id}
            name={user.name}
            email={user.email}
            phone={user.phone}
            message={user.signup_message}
            requestedAt={user.requested_at}
          />
        </AdminBlock>
      ) : null}

      <AdminBlock title="Acesso e VIP">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 32 }}>
          <div style={{ display: "grid", gap: 12 }}>
            <span className="ty-eyebrow">VIP</span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
            <span className="ty-small">
              Referência: {settings.rules.vip_min_services} atendimentos. Ela tem {d.summary.approvedCount}. A decisão é sua.
            </span>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            <span className="ty-eyebrow">Conta</span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
                  className="ty-btn ty-btn--xs ty-btn--solid"
                >
                  <span>Boas-vindas no WhatsApp</span>
                </a>
              ) : null}
              {d.activeSessions > 0 ? (
                <ActionButton action={adminRevokeSessionsAction} args={{ id: user.id }}>
                  Encerrar sessões ({d.activeSessions})
                </ActionButton>
              ) : null}
            </div>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            <span className="ty-eyebrow">Link de acesso</span>
            <AccessLinkPanel userId={user.id} name={user.name} phone={user.phone} hasPassword={d.hasPassword} />
          </div>
        </div>
      </AdminBlock>

      <AdminBlock title="Aniversário" aside={profile?.birthday ? `${dateLong(profile.birthday)} · semana de ${dateShort(d.birthday!.windowStart)} a ${dateShort(d.birthday!.windowEnd)}` : "sem data"}>
        {d.thisYearBirthday ? (
          <p className="ty-body">
            Liberado este ano: <strong style={{ fontWeight: 500, color: "var(--t-fg)" }}>{d.thisYearBirthday.title}</strong> · <BenefitStatusText status={d.thisYearBirthday.status} />
          </p>
        ) : canReleaseBirthday ? (
          <ReleaseBirthdayForm clientId={user.id} defaultDays={benefits.find((b) => b.type === "birthday")?.validity_days ?? settings.rules.benefit_validity_days} />
        ) : (
          <Empty>{vip !== "active" ? "Só VIP ativo recebe o benefício de aniversário." : "Cadastre a data de aniversário para liberar o benefício."}</Empty>
        )}
      </AdminBlock>

      <AdminBlock title="Atendimentos" aside={`${d.summary.approvedCount} confirmados · ${d.summary.pendingServices} pendentes`}>
        <div style={{ display: "grid", gap: 28 }}>
          {d.services.length ? (
            <div className="ty-table-wrap">
              <table className="ty-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Serviço</th>
                    <th>Valor</th>
                    <th>Pontos</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {d.services.map((s) => (
                    <tr key={s.id}>
                      <td className="ty-num">{dateShort(s.service_date)}</td>
                      <td>
                        {s.service_name}
                        {s.notes ? <span className="ty-small" style={{ display: "block" }}>{s.notes}</span> : null}
                        <span className="ty-small" style={{ display: "block" }}>por {s.submitted_by === "client" ? "ela" : "você"}</span>
                      </td>
                      <td className="ty-num">{s.amount != null ? currency(s.amount) : "—"}</td>
                      <td className="ty-num">{s.points}</td>
                      <td><ServiceStatusText status={s.status} /></td>
                      <td>
                        {s.status === "pending" ? (
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
            <span className="ty-eyebrow" style={{ display: "block", marginBottom: 14 }}>Registrar atendimento confirmado</span>
            <AdminServiceEntryForm clientId={user.id} services={services} todayISO={toISODate(new Date())} />
          </div>
        </div>
      </AdminBlock>

      <AdminBlock title="Benefícios">
        <div style={{ display: "grid", gap: 28 }}>
          {d.benefits.length ? (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {d.benefits.map((b) => (
                <li key={b.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, padding: "14px 0", borderTop: "1px solid var(--t-line)", alignItems: "start" }}>
                  <div>
                    <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
                      <strong style={{ fontWeight: 500, fontSize: 16 }}>{b.title}</strong>
                      <BenefitStatusText status={b.status} />
                    </div>
                    <span className="ty-small" style={{ display: "block", marginTop: 4 }}>
                      {b.benefit?.name ?? "—"} · {b.cycle_key} · criado {dateShort(b.created_at)}
                      {b.expires_at ? ` · válido até ${dateShort(b.expires_at)}` : ""}
                    </span>
                    {b.client_note ? <span className="ty-small" style={{ display: "block", fontWeight: 300 }}>Ela: “{b.client_note}”</span> : null}
                    {b.admin_note ? <span className="ty-small" style={{ display: "block", fontWeight: 300 }}>Você: “{b.admin_note}”</span> : null}
                  </div>
                  <BenefitActions id={b.id} status={b.status} defaultDays={settings.rules.benefit_validity_days} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nenhum benefício ainda. Eles aparecem quando ela alcança um marco ou quando você concede.</Empty>
          )}
          <div>
            <span className="ty-eyebrow" style={{ display: "block", marginBottom: 14 }}>Conceder benefício especial</span>
            <GrantCustomBenefitForm clientId={user.id} benefits={benefits} defaultDays={settings.rules.benefit_validity_days} />
          </div>
        </div>
      </AdminBlock>

      <AdminBlock title="Indicações feitas por ela" aside={`${d.referral.approved} confirmadas · ${d.referral.inCycle}/${d.referral.threshold} na rodada`}>
        {d.referrals.length ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {d.referrals.map((r) => (
              <li key={r.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: "1px solid var(--t-line)" }}>
                <span>
                  {r.referred_name} <span className="ty-small">· {formatBrPhone(r.referred_phone)} · {dateShort(r.created_at)}</span>
                </span>
                <ReferralStatusText status={r.status} />
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Nenhuma indicação ainda.</Empty>
        )}
      </AdminBlock>

      <AdminBlock title="Dados">
        <ClientEditForm user={user} profile={profile} />
      </AdminBlock>

      <AdminBlock title="Histórico de ações">
        {d.audit.length ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {d.audit.map((a) => (
              <li key={a.id} style={{ display: "grid", gridTemplateColumns: "minmax(120px, auto) 1fr", gap: 16, padding: "8px 0", borderTop: "1px solid var(--t-line)", fontSize: 13.5 }}>
                <span className="ty-small ty-num">{dateTime(a.created_at)}</span>
                <span>
                  {auditLabel(a.action)} <span className="ty-small">· {a.actor_role === "admin" ? "você" : a.actor_role === "client" ? "ela" : a.actor_role}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Sem ações registradas.</Empty>
        )}
      </AdminBlock>
      {profile?.notes ? (
        <p className="ty-small" style={{ marginTop: 20 }}>
          <StatusText tone="off">Notas internas</StatusText> {profile.notes}
        </p>
      ) : null}
    </>
  );
}

function BenefitActions({ id, status, defaultDays }: { id: string; status: string; defaultDays: number }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
      {status === "pending_validation" ? (
        <NoteAction
          action={adminValidateBenefitAction}
          args={{ id }}
          variant="accent"
          label="Recado para ela (opcional)"
          extra={<input className="ty-field__input" name="validity_days" defaultValue={String(defaultDays)} inputMode="numeric" aria-label="Validade em dias" style={{ fontSize: 13.5 }} />}
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
    </div>
  );
}
