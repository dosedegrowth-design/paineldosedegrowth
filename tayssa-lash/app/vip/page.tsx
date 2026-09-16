import Link from "next/link";
import { requireClientPage } from "@/lib/auth/guards";
import { getVipHome } from "@/lib/queries/vip";
import { ROUTES } from "@/lib/config";
import { dayLabel, dateLong, hhmm, isWithinHours, nowInBusinessTz, plural } from "@/lib/format";
import { APPOINTMENT_STATUS_LABEL } from "@/lib/types";
import { LoyaltyCard } from "@/components/vip/loyalty-card";
import { RankingList } from "@/components/vip/ranking-list";
import { CountUp } from "@/components/vip/count-up";
import { ProgressRing } from "@/components/vip/progress-ring";
import { Timeline } from "@/components/vip/timeline";
import { MilestoneMoment, type Moment } from "@/components/vip/milestone-moment";
import { buildTimeline } from "@/lib/timeline";
import { toCardStamps } from "@/lib/queries/vip";
import { getPhotoLibrary } from "@/lib/queries/photos";
import { getPhotoAvailability } from "@/lib/photos-server";
import { assignPhotos } from "@/lib/photos";

/**
 * A casa da cliente. Uma tela, de cima para baixo, na ordem do que ela
 * quer saber: como estou, meu cartão, meus pontos, quando eu volto.
 */
export default async function VipHome() {
  const user = await requireClientPage();
  const [{ overview: o, card, appointments, ranking }, library, available] = await Promise.all([
    getVipHome(user),
    getPhotoLibrary(),
    getPhotoAvailability(),
  ]);
  // só fotos que existem: biblioteca sempre; estáticas se o arquivo está lá (senão a frente nasce tonal, sem 404)
  const photos = assignPhotos(library).card.filter((p) => available[p.src] ?? true);

  const activeBenefits = o.benefits.filter((b) => ["available", "requested", "approved"].includes(b.status));
  const validating = o.benefits.filter((b) => b.status === "pending_validation");
  const next = appointments.next;
  // algo novo com um benefício dela nas últimas 72h? liberado fala mais alto que alcançado
  const released = o.benefits.find((b) => b.status === "available" && isWithinHours(b.available_at, 72));
  const reached = o.benefits.find((b) => b.status === "pending_validation" && isWithinHours(b.eligible_at ?? b.created_at, 72));
  const fresh = released ?? reached;
  const moment: Moment | null = fresh
    ? { id: `${fresh.id}:${fresh.status}`, kind: fresh === released ? "released" : "reached", title: fresh.title }
    : null;
  const timeline = buildTimeline({
    services: o.recentServices,
    benefits: o.benefits,
    appointments: appointments.upcoming,
    birthday: o.birthday,
    loyalty: o.loyalty,
    today: nowInBusinessTz(),
  });

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

      {moment ? <MilestoneMoment moment={moment} /> : null}

      <div style={{ marginTop: 22 }}>
        <LoyaltyCard
          cycle={card.cycle}
          size={card.size}
          stamps={toCardStamps(card.stamps)}
          completedCards={card.completedCards}
          rewardTitle={o.settings.loyalty.card_reward_title}
          rewardStatus={card.reward?.status ?? null}
          photos={photos}
          holderName={user.displayName}
          memberSince={user.profile?.vip_since ?? null}
          isVip={user.isVip}
          withLink
        />
      </div>

      <div className="tyv-kpis">
        <div className="tyv-panel tyv-kpi tyv-kpi--ring">
          <ProgressRing
            progress={o.loyalty.next ? o.loyalty.progressToNext : o.points > 0 ? 1 : 0}
            label={`${o.points} pontos${o.loyalty.next ? `, faltam ${o.loyalty.pointsToNext} para ${o.loyalty.next.title}` : ""}`}
          >
            <CountUp value={o.points} className="tyv-ring__n" />
            <span className="tyv-ring__unit">pontos</span>
          </ProgressRing>
          <p className="tyv-kpi__foot" style={{ marginTop: 10 }}>
            {o.loyalty.next ? (
              <>
                faltam <strong>{o.loyalty.pointsToNext}</strong> para {o.loyalty.next.title}
              </>
            ) : o.points > 0 ? (
              "todos os marcos alcançados"
            ) : (
              "sua primeira visita começa aqui"
            )}
          </p>
        </div>
        <div className="tyv-kpi-col">
          <div className="tyv-panel tyv-kpi">
            <span className="tyv-label">Ranking</span>
            <p className="tyv-stat__n">
              <CountUp value={ranking.position} />
              <small>de {ranking.total}</small>
            </p>
            <p className="tyv-kpi__foot">
              {ranking.total <= 1
                ? "primeira do clube"
                : ranking.toClimb > 0
                  ? `${ranking.toClimb} ${plural(ranking.toClimb, "ponto", "pontos")} para subir`
                  : "você lidera o ranking"}
            </p>
          </div>
          <div className="tyv-panel tyv-kpi">
            <span className="tyv-label">Visitas</span>
            <p className="tyv-stat__n">
              <CountUp value={o.approvedCount} />
            </p>
            <p className="tyv-kpi__foot">
              {o.lastServiceDate ? `última em ${dateLong(o.lastServiceDate)}` : "confirmadas pela Tayssa"}
            </p>
          </div>
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
          <h2 className="tyv-h2">Sua jornada</h2>
          <Link href={ROUTES.vipProfile} className="tyv-link" style={{ opacity: 0.75 }}>
            Histórico
          </Link>
        </div>
        <div className="tyv-panel">
          {timeline.upcoming.length || timeline.recent.length ? (
            <Timeline data={timeline} />
          ) : (
            <p className="tyv-empty">Sua primeira visita confirmada abre a jornada.</p>
          )}
        </div>
      </section>
    </>
  );
}
