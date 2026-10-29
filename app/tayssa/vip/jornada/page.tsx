import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { getVipHome } from "@/lib/tayssa/queries/vip";
import { nowInBusinessTz, numero, plural } from "@/lib/tayssa/format";
import { buildTimeline } from "@/lib/tayssa/timeline";
import { RankingList } from "@/components/tayssa/vip/ranking-list";
import { Timeline } from "@/components/tayssa/vip/timeline";

/**
 * A jornada dela: o que vem pela frente, o que já passou e onde ela está
 * no ranking. Sai da home para a home ficar leve — um toque no ícone traz.
 */
export default async function VipJornada() {
  const user = await requireClientPage();
  const { overview: o, appointments, ranking } = await getVipHome(user);
  const timeline = buildTimeline({
    services: o.recentServices,
    benefits: o.benefits,
    appointments: appointments.upcoming,
    birthday: o.birthday,
    loyalty: o.loyalty,
    vip: { progresso: o.vip, jaVip: user.isVip },
    today: nowInBusinessTz(),
    limits: { upcoming: 4 },
  });

  return (
    <>
      <h1 className="tyv-hello">
        {user.displayName}, <em>sua jornada</em>.
      </h1>
      <p className="tyv-sub">
        {o.approvedCount
          ? `${o.approvedCount} ${plural(o.approvedCount, "visita confirmada", "visitas confirmadas")} e ${numero(o.points)} pontos até aqui.`
          : "Sua primeira visita confirmada abre a jornada."}
      </p>

      <section className="tyv-section">
        <div className="tyv-section-head">
          <h2 className="tyv-h2">O caminho</h2>
        </div>
        <div className="tyv-panel">
          {timeline.upcoming.length || timeline.recent.length ? (
            <Timeline data={timeline} />
          ) : (
            <p className="tyv-empty">Sua primeira visita confirmada abre a jornada, {user.displayName}.</p>
          )}
        </div>
      </section>

      <section className="tyv-section">
        <div className="tyv-section-head">
          <h2 className="tyv-h2">Ranking</h2>
          <span className="tyv-label">Pontos confirmados</span>
        </div>
        {ranking.total > 1 ? (
          <div className="tyv-panel tyv-panel--lista">
            <RankingList rows={ranking.rows} />
          </div>
        ) : (
          <div className="tyv-panel">
            <p className="tyv-empty">
              Você é a primeira do VIP, {user.displayName}. O ranking ganha vizinhas conforme a Tayssa abre acesso para
              novas clientes.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
