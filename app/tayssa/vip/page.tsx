import Link from "next/link";
import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { getVipHome } from "@/lib/tayssa/queries/vip";
import { ROUTES } from "@/lib/tayssa/config";
import { dayLabel, faltaLegivel, hhmm, isWithinHours, numero, plural } from "@/lib/tayssa/format";
import { APPOINTMENT_STATUS_LABEL } from "@/lib/tayssa/types";
import { LoyaltyCard } from "@/components/tayssa/vip/loyalty-card";
import { CountUp } from "@/components/tayssa/vip/count-up";
import { ProgressRing } from "@/components/tayssa/vip/progress-ring";
import { MilestoneMoment, type Moment } from "@/components/tayssa/vip/milestone-moment";
import { CaminhoVip } from "@/components/tayssa/vip/programa";
import { toCardStamps } from "@/lib/tayssa/queries/vip";
import { Icone, type IconeNome } from "@/components/tayssa/ui/icones";
import type { CSSProperties } from "react";

/**
 * A casa da cliente. Leve: o nome dela, o cartão logo abaixo (como o de
 * pagar no celular) e um painel de ícones que leva a cada parte do VIP.
 * O detalhe mora nas telas de cada ícone; aqui fica o resumo em cores.
 */
export default async function VipHome() {
  const user = await requireClientPage();
  const { overview: o, card, appointments, ranking } = await getVipHome(user);

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

  const status = card.unrevealed
    ? `Você tem ${card.unrevealed} ${plural(card.unrevealed, "carimbo novo", "carimbos novos")} no cartão.`
    : next
      ? `Seu próximo horário é ${dayLabel(next.scheduled_date)}, às ${hhmm(next.scheduled_time)}.`
      : o.pendingServices
        ? `${o.pendingServices} ${plural(o.pendingServices, "atendimento aguarda", "atendimentos aguardam")} confirmação da Tayssa.`
        : activeBenefits.length
          ? `Você tem ${activeBenefits.length} ${plural(activeBenefits.length, "benefício desbloqueado", "benefícios desbloqueados")}.`
          : "Que bom te ver por aqui.";

  const preenchidos = card.stamps.length;
  const atalhos: { href: string; titulo: string; dica: string; icone: IconeNome; destaque?: boolean }[] = [
    {
      href: ROUTES.vipBook,
      titulo: "Agendar",
      dica: next ? `${dayLabel(next.scheduled_date)}, ${hhmm(next.scheduled_time)}` : "escolha o seu dia",
      icone: "calendario",
      destaque: true,
    },
    {
      href: ROUTES.vipCard,
      titulo: "Meu cartão",
      dica: card.unrevealed
        ? `${card.unrevealed} ${plural(card.unrevealed, "carimbo novo", "carimbos novos")}`
        : `${preenchidos} de ${card.size} visitas`,
      icone: "cartaoVip",
    },
    {
      href: ROUTES.vipBenefits,
      titulo: "Benefícios",
      dica: activeBenefits.length
        ? `${activeBenefits.length} ${plural(activeBenefits.length, "desbloqueado", "desbloqueados")}`
        : validating.length
          ? "em validação"
          : "os seus presentes",
      icone: "presente",
    },
    { href: ROUTES.vipJourney, titulo: "Minha jornada", dica: `${numero(o.points)} pontos`, icone: "brilho" },
    { href: `${ROUTES.vipBenefits}#indicar`, titulo: "Indicar alguém", dica: "uma amiga sua", icone: "coracao" },
    { href: ROUTES.vipProfile, titulo: "Meu perfil", dica: "seus dados", icone: "pessoa" },
  ];

  return (
    <>
      <div className="tyv-hello-wrap">
        <h1 className="tyv-hello">
          Olá, <em>{user.displayName}</em>.
        </h1>
        <p className="tyv-sub">{status}</p>
      </div>

      {/* o cartão logo abaixo do nome, como o cartão de pagar no celular:
          toca e ele vira, com os carimbos e os pontos atrás */}
      <div className="tyv-cartao-home">
        <LoyaltyCard
          cycle={card.cycle}
          size={card.size}
          stamps={toCardStamps(card.stamps)}
          completedCards={card.completedCards}
          rewardTitle={o.settings.loyalty.card_reward_title}
          rewardStatus={card.reward?.status ?? null}
          holderName={user.displayName}
          memberSince={user.profile?.vip_since ?? null}
          isVip={user.isVip}
          points={o.points}
          withLink
        />
      </div>

      {moment ? <MilestoneMoment moment={moment} /> : null}

      <nav className="tyv-hub" aria-label={`O seu espaço, ${user.displayName}`}>
        {atalhos.map((a, i) => (
          <Link
            key={a.href}
            href={a.href}
            className="tyv-hub__item ty-ico-gatilho"
            data-destaque={a.destaque ? "true" : undefined}
            style={{ "--i": i } as CSSProperties}
          >
            <span className="tyv-hub__icone">
              <Icone nome={a.icone} />
            </span>
            <span className="tyv-hub__titulo">{a.titulo}</span>
            <span className="tyv-hub__dica">{a.dica}</span>
          </Link>
        ))}
      </nav>

      <section className="tyv-section" aria-labelledby="resumo-titulo">
        <div className="tyv-section-head">
          <h2 className="tyv-h2" id="resumo-titulo">
            Seu momento
          </h2>
        </div>
        <div className="tyv-resumo">
          <div className="tyv-resumo__item">
            <ProgressRing
              cor="azul"
              size={92}
              stroke={7}
              progress={o.loyalty.next ? o.loyalty.progressToNext : o.points > 0 ? 1 : 0}
              label={`${numero(o.points)} pontos${o.loyalty.next ? `, ${faltaLegivel(o.loyalty.pointsToNext, o.loyalty.mesesToNext)} para ${o.loyalty.next.title}` : ""}`}
            >
              <CountUp value={o.points} className="tyv-ring__n" />
            </ProgressRing>
            <span className="tyv-resumo__nome">Pontos</span>
            <span className="tyv-resumo__dica">
              {o.loyalty.next
                ? o.loyalty.pointsToNext > 0
                  ? `${plural(o.loyalty.pointsToNext, "falta", "faltam")} ${numero(o.loyalty.pointsToNext)}`
                  : `${plural(o.loyalty.mesesToNext, "falta", "faltam")} ${o.loyalty.mesesToNext} ${plural(o.loyalty.mesesToNext, "mês", "meses")}`
                : o.points > 0
                  ? "todos os marcos"
                  : "começa aqui"}
            </span>
          </div>
          <div className="tyv-resumo__item">
            <ProgressRing
              cor="amarelo"
              size={92}
              stroke={7}
              progress={card.size ? preenchidos / card.size : 0}
              label={`${preenchidos} de ${card.size} visitas no cartão`}
            >
              <span className="tyv-ring__n">
                {preenchidos}
                <small>/{card.size}</small>
              </span>
            </ProgressRing>
            <span className="tyv-resumo__nome">Cartão</span>
            <span className="tyv-resumo__dica">{card.size - preenchidos > 0 ? `faltam ${card.size - preenchidos}` : "completo"}</span>
          </div>
          <div className="tyv-resumo__item">
            <ProgressRing
              cor="vermelho"
              size={92}
              stroke={7}
              progress={ranking.total ? (ranking.total - ranking.position + 1) / ranking.total : 0}
              label={`Posição ${ranking.position} de ${ranking.total} no ranking`}
            >
              <span className="tyv-ring__n">
                {ranking.position}º
              </span>
            </ProgressRing>
            <span className="tyv-resumo__nome">Ranking</span>
            <span className="tyv-resumo__dica">
              {ranking.total <= 1 ? "a primeira" : ranking.toClimb > 0 ? `${numero(ranking.toClimb)} pts para subir` : "na frente"}
            </span>
          </div>
        </div>
      </section>

      {/* quem ainda não é VIP vê o caminho: as etapas e o que falta em cada uma */}
      {!user.isVip ? (
        <section className="tyv-section" aria-labelledby="caminho-titulo">
          <div className="tyv-section-head">
            <h2 className="tyv-h2" id="caminho-titulo">
              Caminho até o VIP
            </h2>
          </div>
          <CaminhoVip loyalty={o.loyalty} vip={o.vip} ehVip={false} compacto />
        </section>
      ) : null}

      {next ? (
        <section className="tyv-section">
          <Link href={ROUTES.vipBook} className="tyv-panel tyv-proximo">
            <span className="tyv-proximo__dia">
              <b>{dayLabel(next.scheduled_date)}</b>
              <span>{hhmm(next.scheduled_time)}</span>
            </span>
            <span className="tyv-proximo__txt">
              <b>{next.service_name}</b>
              <span>{APPOINTMENT_STATUS_LABEL[next.status]}</span>
            </span>
          </Link>
        </section>
      ) : null}
    </>
  );
}
