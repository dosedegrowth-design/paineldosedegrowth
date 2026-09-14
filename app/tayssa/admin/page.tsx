import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { getAdminOverview } from "@/lib/tayssa/queries/admin";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES } from "@/lib/tayssa/config";
import { renderTemplate, whatsappUrl } from "@/lib/tayssa/whatsapp";
import { dateShort, dateTime, dayMonth } from "@/lib/tayssa/format";
import { auditLabel } from "@/lib/tayssa/audit-labels";
import { AdminBlock, AdminHeader, Empty, Stat } from "@/components/tayssa/admin/shell";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { TyLinkButton } from "@/components/tayssa/ui/button";

/** "O que precisa da minha atenção?" — a primeira pergunta do admin. */
export default async function AdminHome() {
  const admin = await requireAdminPage();
  const [o, settings] = await Promise.all([getAdminOverview(), getSettings()]);
  const needs = o.pendingServices + o.referralsInProgress + o.benefitsToValidate + o.benefitsRequested;

  return (
    <>
      <AdminHeader
        eyebrow={`Olá, ${admin.displayName}`}
        title={needs > 0 ? <>{needs} {needs === 1 ? "coisa espera" : "coisas esperam"} <em>você.</em></> : <>Tudo em <em>dia.</em></>}
        lead="Aprovações, indicações e benefícios só acontecem com a sua confirmação."
        actions={<TyLinkButton href={ROUTES.adminClientNew} size="sm" variant="solid" arrow>Nova cliente</TyLinkButton>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0 28px" }}>
        <Stat n={o.pendingServices} label="Atendimentos a confirmar" href={ROUTES.adminServices} alert={o.pendingServices > 0} />
        <Stat n={o.referralsInProgress} label="Indicações em andamento" href={ROUTES.adminReferrals} alert={o.referralsInProgress > 0} />
        <Stat n={o.benefitsToValidate} label="Benefícios a validar" href={ROUTES.adminBenefits} alert={o.benefitsToValidate > 0} />
        <Stat n={o.benefitsRequested} label="Benefícios solicitados" href={ROUTES.adminBenefits} alert={o.benefitsRequested > 0} />
        <Stat n={o.birthdaysThisMonth} label="Aniversários no mês" href={ROUTES.adminBirthdays} />
        <Stat n={`${o.vipActive}/${o.totalClients}`} label="VIP / clientes" href={ROUTES.adminClients} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "0 clamp(28px, 4vw, 64px)", marginTop: 24 }}>
        <AdminBlock title="Aniversários nos próximos 7 dias" aside={<TransitionLink href={ROUTES.adminBirthdays} className="ty-link ty-link--caps">Ver mês</TransitionLink>}>
          {o.birthdaysThisWeek.length ? (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {o.birthdaysThisWeek.map((c) => (
                <li key={c.user.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: "1px solid var(--t-line)", alignItems: "center" }}>
                  <div>
                    <TransitionLink href={ROUTES.adminClient(c.user.id)} className="ty-link">{c.user.name}</TransitionLink>
                    <span className="ty-small" style={{ display: "block" }}>
                      {dayMonth(c.profile!.birthday!)} · {c.profile?.vip_status === "active" ? "VIP" : "não VIP"}
                    </span>
                  </div>
                  {c.user.phone ? (
                    <a href={whatsappUrl(c.user.phone, `Oi, ${c.user.nickname ?? c.user.name.split(" ")[0]}! `)} target="_blank" rel="noopener noreferrer" className="ty-link ty-link--caps">
                      WhatsApp
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nenhum aniversário nesta semana.</Empty>
          )}
        </AdminBlock>

        <AdminBlock title={`Clientes sem atendimento há ${settings.rules.inactivity_days}+ dias`} aside={<TransitionLink href={ROUTES.adminClients} className="ty-link ty-link--caps">Ver todas</TransitionLink>}>
          {o.inactiveClients.length ? (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {o.inactiveClients.map((c) => (
                <li key={c.user.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: "1px solid var(--t-line)", alignItems: "center" }}>
                  <div>
                    <TransitionLink href={ROUTES.adminClient(c.user.id)} className="ty-link">{c.user.name}</TransitionLink>
                    <span className="ty-small" style={{ display: "block" }}>
                      {c.lastServiceDate ? `último em ${dateShort(c.lastServiceDate)}` : "sem atendimento confirmado"}
                    </span>
                  </div>
                  {c.user.phone ? (
                    <a
                      href={whatsappUrl(c.user.phone, renderTemplate(settings.whatsapp.inactive_outreach, { name: c.user.nickname ?? c.user.name.split(" ")[0] }))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ty-link ty-link--caps"
                    >
                      Chamar
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Todas as clientes ativas passaram por aqui recentemente.</Empty>
          )}
        </AdminBlock>
      </div>

      <AdminBlock title="Últimos movimentos">
        {o.recentAudit.length ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {o.recentAudit.map((a) => (
              <li key={a.id} style={{ display: "grid", gridTemplateColumns: "minmax(120px, auto) 1fr", gap: 16, padding: "8px 0", borderTop: "1px solid var(--t-line)", fontSize: 13.5 }}>
                <span className="ty-small ty-num">{dateTime(a.created_at)}</span>
                <span>
                  {auditLabel(a.action)}
                  <span className="ty-small"> · {a.actor_role === "admin" ? "você" : a.actor_role === "client" ? "cliente" : a.actor_role === "public" ? "site" : "sistema"}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Ainda não há movimentos registrados.</Empty>
        )}
      </AdminBlock>
    </>
  );
}
