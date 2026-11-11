import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { getAdminOverview, getAgenda, type AppointmentWithClient } from "@/lib/tayssa/queries/admin";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES, criteriosVip } from "@/lib/tayssa/config";
import { regraVipLegivel } from "@/lib/tayssa/rules";
import { renderTemplate, whatsappUrl } from "@/lib/tayssa/whatsapp";
import { dateShort, dateTime, dayLabel, dayMonth, hhmm, numero, weekdayShort } from "@/lib/tayssa/format";
import { situacaoDoPedido } from "@/lib/tayssa/types";
import { auditLabel } from "@/lib/tayssa/audit-labels";
import { AdminBlock, AdminHeader, Empty, Stat } from "@/components/tayssa/admin/shell";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { TyLinkButton } from "@/components/tayssa/ui/button";

/** "Hoje · qua, 11/11", "Amanhã · qui, 12/11" ou "sex, 13 de novembro". */
function rotuloDoDia(iso: string): string {
  const dia = dayLabel(iso);
  const relativo = dia === "hoje" || dia === "amanhã";
  const texto = relativo ? `${dia} · ${weekdayShort(iso)}, ${dayMonth(iso)}` : dia;
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Os próximos horários, dia a dia (Lucas, 11/11/2026: "pra ela acordar,
 * abrir a agenda e ver como está"): de hoje em diante, os pedidos e os
 * confirmados, até 10, agrupados pelo dia.
 */
function proximosPorDia(agenda: { today: string; todayList: AppointmentWithClient[]; requested: AppointmentWithClient[]; upcoming: AppointmentWithClient[] }) {
  const vistos = new Set<string>();
  const proximos = [...agenda.todayList, ...agenda.requested, ...agenda.upcoming]
    .filter((a) => (a.status === "requested" || a.status === "confirmed") && a.scheduled_date >= agenda.today)
    .filter((a) => (vistos.has(a.id) ? false : (vistos.add(a.id), true)))
    .sort((a, b) => (a.scheduled_date + a.scheduled_time).localeCompare(b.scheduled_date + b.scheduled_time))
    .slice(0, 10);
  const dias: { iso: string; itens: AppointmentWithClient[] }[] = [];
  for (const a of proximos) {
    const ultimo = dias[dias.length - 1];
    if (ultimo?.iso === a.scheduled_date) ultimo.itens.push(a);
    else dias.push({ iso: a.scheduled_date, itens: [a] });
  }
  return dias;
}

/** "O que precisa da minha atenção?" — a primeira pergunta do admin. */
export default async function AdminHome() {
  const admin = await requireAdminPage();
  const [o, settings, agenda] = await Promise.all([getAdminOverview(), getSettings(), getAgenda()]);
  const dias = proximosPorDia(agenda);
  const needs = o.pendingSignups.length + o.appointmentsRequested + o.appointmentsToClose + o.pendingServices + o.referralsInProgress + o.benefitsToValidate + o.benefitsRequested + o.readyForVip.length;

  return (
    <>
      <AdminHeader
        eyebrow={`Olá, ${admin.displayName}`}
        title={needs > 0 ? <>{needs} {needs === 1 ? "coisa espera" : "coisas esperam"} <em>você.</em></> : <>Tudo em <em>dia.</em></>}
        lead="Aprovações, indicações e benefícios só acontecem com a sua confirmação."
        actions={<TyLinkButton href={ROUTES.adminClientNew} size="sm" variant="solid" arrow>Nova cliente</TyLinkButton>}
      />

      <div className="tya-kpis tya-kpis--home">
        <Stat n={o.pendingSignups.length} label="Cadastros para liberar" href={ROUTES.adminClients} alert={o.pendingSignups.length > 0} />
        <Stat n={o.appointmentsRequested} label="Horários a confirmar" href={ROUTES.adminAgenda} alert={o.appointmentsRequested > 0} />
        <Stat n={o.pendingServices} label="Atendimentos a confirmar" href={ROUTES.adminServices} alert={o.pendingServices > 0} />
        <Stat n={o.referralsInProgress} label="Indicações em andamento" href={ROUTES.adminReferrals} alert={o.referralsInProgress > 0} />
        <Stat n={o.benefitsToValidate} label="Benefícios a validar" href={ROUTES.adminBenefits} alert={o.benefitsToValidate > 0} />
        <Stat n={o.benefitsRequested} label="Benefícios solicitados" href={ROUTES.adminBenefits} alert={o.benefitsRequested > 0} />
        <Stat n={o.readyForVip.length} label="Prontas para VIP" href={ROUTES.adminClients} alert={o.readyForVip.length > 0} />
        <Stat n={o.birthdaysThisMonth} label="Aniversários no mês" href={ROUTES.adminBirthdays} />
        <Stat n={`${o.vipActive}/${o.totalClients}`} label="VIP / clientes" href={ROUTES.adminClients} />
      </div>

      <div className="tya-home-blocks">
        {/* o que ela olha ao acordar: o primeiro quadro, sempre (Lucas, 11/11/2026) */}
        <AdminBlock title="Próximos horários" aside={<TransitionLink href={ROUTES.adminAgenda} className="ty-link ty-link--caps">Ver agenda</TransitionLink>}>
          {dias.length ? (
            <div>
              {dias.map(({ iso, itens }) => (
                <div key={iso}>
                  <p className="tya-eyebrow" style={{ margin: "14px 0 2px" }}>{rotuloDoDia(iso)}</p>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {itens.map((a) => (
                      <li key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: "1px solid var(--t-line)", alignItems: "center" }}>
                        <div>
                          <span className="ty-num" style={{ fontWeight: 600, marginRight: 10 }}>{hhmm(a.scheduled_time)}</span>
                          {a.client ? (
                            <TransitionLink href={ROUTES.adminClient(a.client.id)} className="ty-link">{a.client.nickname?.trim() || a.client.name}</TransitionLink>
                          ) : (
                            "Cliente"
                          )}
                          <span className="ty-small" style={{ display: "block" }}>
                            {a.service_name} · {situacaoDoPedido(a).toLowerCase()}
                          </span>
                        </div>
                        <TransitionLink href={a.status === "requested" ? `${ROUTES.adminAgenda}#pedidos` : ROUTES.adminAgenda} className="ty-link ty-link--caps">
                          {a.status === "requested" ? "Confirmar" : "Abrir"}
                        </TransitionLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <Empty>{o.appointmentsToClose ? `Nenhum horário à frente. ${o.appointmentsToClose} ${o.appointmentsToClose === 1 ? "horário passado espera" : "horários passados esperam"} fechamento na Agenda.` : "Nenhum horário marcado à frente."}</Empty>
          )}
        </AdminBlock>

        {o.pendingSignups.length ? (
          <AdminBlock title="Cadastros para liberar" aside={<TransitionLink href={ROUTES.adminClients} className="ty-link ty-link--caps">Ver todos</TransitionLink>}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {o.pendingSignups.slice(0, 6).map((c) => (
                <li key={c.user.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: "1px solid var(--t-line)", alignItems: "center" }}>
                  <div>
                    <TransitionLink href={ROUTES.adminClient(c.user.id)} className="ty-link">{c.user.name}</TransitionLink>
                    <span className="ty-small" style={{ display: "block" }}>
                      {c.user.requested_at ? `se cadastrou em ${dateTime(c.user.requested_at)}` : "cadastro VIP"}
                      {c.user.signup_message ? ` · “${c.user.signup_message.slice(0, 60)}${c.user.signup_message.length > 60 ? "…" : ""}”` : ""}
                    </span>
                  </div>
                  <TransitionLink href={ROUTES.adminClient(c.user.id)} className="ty-link ty-link--caps">
                    Liberar
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </AdminBlock>
        ) : null}
        {o.readyForVip.length ? (
          <AdminBlock title="Prontas para VIP" aside={<span className="ty-small">completaram a sequência</span>}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {o.readyForVip.slice(0, 6).map((c) => (
                <li key={c.user.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: "1px solid var(--t-line)", alignItems: "center" }}>
                  <div>
                    <TransitionLink href={ROUTES.adminClient(c.user.id)} className="ty-link">{c.user.name}</TransitionLink>
                    <span className="ty-small" style={{ display: "block" }}>
                      {c.vip.criterios.visitas} atendimentos na sequência · {numero(c.points)} pontos
                    </span>
                  </div>
                  <TransitionLink href={ROUTES.adminClient(c.user.id)} className="ty-link ty-link--caps">
                    Ativar VIP
                  </TransitionLink>
                </li>
              ))}
            </ul>
            <p className="ty-small" style={{ marginTop: 10 }}>
              Critério: {regraVipLegivel(criteriosVip(settings.rules))}. O VIP só entra quando você ativa.
            </p>
          </AdminBlock>
        ) : null}
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
