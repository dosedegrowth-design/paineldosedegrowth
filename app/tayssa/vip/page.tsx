import Link from "next/link";
import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { getVipHome } from "@/lib/tayssa/queries/vip";
import { ROUTES } from "@/lib/tayssa/config";
import { dayLabel, dateLong, hhmm, plural } from "@/lib/tayssa/format";
import { APPOINTMENT_STATUS_LABEL } from "@/lib/tayssa/types";
import { LoyaltyCard } from "@/components/tayssa/vip/loyalty-card";
import { RankingList } from "@/components/tayssa/vip/ranking-list";
import { toCardStamps } from "@/lib/tayssa/queries/vip";

/**
 * A casa da cliente. Uma tela, de cima para baixo, na ordem do que ela
 * quer saber: como estou, meu cartão, meus pontos, quando eu volto.
 */
export default async function VipHome() {
  const user = await requireClientPage();
  const { overview: o, card, appointments, ranking } = await getVipHome(user);

  const activeBenefits = o.benefits.filter((b) => ["available", "requested", "approved"].includes(b.status));
  const validating = o.benefits.filter((b) => b.status === "pending_validation");
  const next = appointments.next;

  const status = card.unrevealed
    ? `Você tem ${card.unrevealed} ${plural(card.unrevealed, "carimbo novo", "carimbos novos")} no cartão.`
    : next
      ? `Seu próximo horário é ${dayLabel(next.scheduled_date)}, às ${hhmm(next.scheduled_time)}.`
      : o.pendingServices
        ? `${o.pendingServices} ${plural(o.pendingServices, "atendimento aguarda", "atendimentos aguardam")} confirmação da Tayssa.`
        : activeBenefits.length
          ? `Você tem ${activeBenefits.length} ${plural(activeBenefits.length, "benefício desbloqueado", "benefícios desbloqueados")}.`
          : "Que bom te ver por aqui.";

  return (
    <>
      <h1 className="tyv-hello">
        Olá, <em>{user.displayName}</em>.
      </h1>
      <p className="tyv-sub">{status}</p>

      <div style={{ marginTop: 22 }}>
        <LoyaltyCard
          cycle={card.cycle}
          size={card.size}
          stamps={toCardStamps(card.stamps)}
          completedCards={card.completedCards}
          rewardTitle={o.settings.loyalty.card_reward_title}
          rewardStatus={card.reward?.status ?? null}
          withLink
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
        <div className="tyv-panel">
          <span className="tyv-label">Pontos</span>
          <p className="tyv-stat__n" style={{ marginTop: 8 }}>
            {o.points}
          </p>
          <p className="tyv-sub" style={{ fontSize: 12.5, marginTop: 6 }}>
            {o.loyalty.next
              ? `faltam ${o.loyalty.pointsToNext} para “${o.loyalty.next.title}”`
              : o.points > 0
                ? "todos os marcos alcançados"
                : "sua primeira visita começa aqui"}
          </p>
        </div>
        <div className="tyv-panel">
          <span className="tyv-label">Ranking</span>
          <p className="tyv-stat__n" style={{ marginTop: 8 }}>
            {ranking.position}
            <small>de {ranking.total}</small>
          </p>
          <p className="tyv-sub" style={{ fontSize: 12.5, marginTop: 6 }}>
            {ranking.total <= 1
              ? "primeira do clube"
              : ranking.toClimb > 0
                ? `${ranking.toClimb} pontos para subir`
                : "você lidera o ranking"}
          </p>
        </div>
      </div>

      <section className="tyv-section">
        <Link href={ROUTES.vipBook} className="tyv-btn tyv-btn--accent">
          Agendar meu horário
        </Link>
        {next ? (
          <div className="tyv-panel" style={{ marginTop: 12 }}>
            <div className="tyv-row" style={{ paddingTop: 0 }}>
              <div>
                <span className="tyv-label">Próximo horário</span>
                <p style={{ fontSize: 17, marginTop: 6 }}>
                  {dayLabel(next.scheduled_date)} · {hhmm(next.scheduled_time)}
                </p>
                <p className="tyv-sub" style={{ fontSize: 13 }}>
                  {next.service_name} · {APPOINTMENT_STATUS_LABEL[next.status]}
                </p>
              </div>
              <Link href={ROUTES.vipBook} className="tyv-link" style={{ opacity: 0.75 }}>
                Ver
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      <section className="tyv-section">
        <div className="tyv-section-head">
          <h2 className="tyv-h2">Ranking</h2>
          <span className="tyv-label">Pontos confirmados</span>
        </div>
        {ranking.total > 1 ? (
          <RankingList rows={ranking.rows} />
        ) : (
          <div className="tyv-panel">
            <p className="tyv-empty">
              Você é a primeira do clube. O ranking ganha vizinhas conforme a Tayssa abre acesso para novas clientes.
            </p>
          </div>
        )}
      </section>

      <section className="tyv-section">
        <div className="tyv-section-head">
          <h2 className="tyv-h2">Benefícios</h2>
          <Link href={ROUTES.vipBenefits} className="tyv-link" style={{ opacity: 0.75 }}>
            Ver todos
          </Link>
        </div>
        <div className="tyv-panel">
          {activeBenefits.length || validating.length ? (
            <>
              {activeBenefits.slice(0, 2).map((b) => (
                <div key={b.id} className="tyv-row">
                  <span style={{ fontSize: 15 }}>{b.title}</span>
                  <span className="tyv-badge">Desbloqueado</span>
                </div>
              ))}
              {validating.slice(0, 2).map((b) => (
                <div key={b.id} className="tyv-row">
                  <span style={{ fontSize: 15 }}>{b.title}</span>
                  <span className="tyv-badge tyv-badge--quiet">Em validação</span>
                </div>
              ))}
            </>
          ) : (
            <p className="tyv-empty">Seu próximo benefício está mais perto do que parece.</p>
          )}
        </div>
      </section>

      <section className="tyv-section">
        <div className="tyv-section-head">
          <h2 className="tyv-h2">Últimas visitas</h2>
          <Link href={ROUTES.vipProfile} className="tyv-link" style={{ opacity: 0.75 }}>
            Histórico
          </Link>
        </div>
        <div className="tyv-panel">
          {o.recentServices.length ? (
            o.recentServices.slice(0, 3).map((s) => (
              <div key={s.id} className="tyv-row">
                <div>
                  <p style={{ fontSize: 15 }}>{s.service_name}</p>
                  <p className="tyv-sub" style={{ fontSize: 12.5 }}>
                    {dateLong(s.service_date)}
                  </p>
                </div>
                <span className="tyv-num" style={{ fontSize: 18, opacity: s.status === "approved" ? 1 : 0.45 }}>
                  {s.status === "approved" ? `+${s.points}` : "—"}
                </span>
              </div>
            ))
          ) : (
            <p className="tyv-empty">Sua primeira visita confirmada abre o cartão.</p>
          )}
        </div>
      </section>
    </>
  );
}
