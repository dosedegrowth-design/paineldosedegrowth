import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { getClientOverview } from "@/lib/tayssa/queries/client";
import { ROUTES } from "@/lib/tayssa/config";
import { renderTemplate, whatsappUrl } from "@/lib/tayssa/whatsapp";
import { dateLong, plural } from "@/lib/tayssa/format";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { StatusText, ServiceStatusText } from "@/components/tayssa/ui/status";
import { JourneyPath } from "@/components/tayssa/vip/journey-path";
import { BenefitObject } from "@/components/tayssa/vip/benefit-object";
import { VipSection, EmptyState } from "@/components/tayssa/vip/section";

/**
 * Início do espaço privado. O nome é o título. Depois, o que importa:
 * onde ela está, o que tem, o que pode desbloquear, o que vem a seguir.
 */
export default async function VipHome() {
  const user = await requireClientPage();
  const o = await getClientOverview(user);
  const wa = o.settings.whatsapp;
  const phone = o.settings.business.whatsapp;

  const activeBenefits = o.benefits.filter((b) => ["available", "requested", "approved"].includes(b.status));
  const validating = o.benefits.filter((b) => b.status === "pending_validation");

  const nowLines: { tone: "ok" | "wait" | "accent" | "fg" | "off"; text: string }[] = [];
  nowLines.push(
    user.isVip
      ? { tone: "ok", text: "Seu VIP está em dia." }
      : { tone: "fg", text: "Seu acesso está ativo." }
  );
  if (o.loyalty.next) {
    nowLines.push({
      tone: "fg",
      text: `Você está a ${o.loyalty.pointsToNext} ${plural(o.loyalty.pointsToNext, "ponto", "pontos")} de “${o.loyalty.next.title}”.`,
    });
  } else if (o.loyalty.milestones.length) {
    nowLines.push({ tone: "ok", text: "Você alcançou todos os marcos da jornada." });
  }
  if (o.referral.remaining > 0 && o.referral.approved > 0) {
    nowLines.push({
      tone: "fg",
      text: `Você está a ${o.referral.remaining} ${plural(o.referral.remaining, "indicação", "indicações")} de liberar seu próximo benefício.`,
    });
  }
  if (o.pendingServices > 0) {
    nowLines.push({
      tone: "wait",
      text: `${o.pendingServices} ${plural(o.pendingServices, "atendimento aguarda", "atendimentos aguardam")} confirmação da Tayssa.`,
    });
  }
  if (validating.length > 0) {
    nowLines.push({ tone: "accent", text: `${validating.length} ${plural(validating.length, "benefício em validação", "benefícios em validação")}.` });
  }
  if (activeBenefits.length > 0) {
    nowLines.push({ tone: "accent", text: `Você tem ${activeBenefits.length} ${plural(activeBenefits.length, "benefício desbloqueado", "benefícios desbloqueados")}.` });
  }

  return (
    <>
      <div style={{ paddingBottom: "clamp(40px, 6vw, 88px)" }}>
        <Reveal>
          <span className="ty-eyebrow" style={{ display: "block", marginBottom: 20 }}>
            {dateLong(new Date(), true)}
          </span>
        </Reveal>
        <MaskedLines
          as="h1"
          inView={false}
          className="ty-display"
          lineClassName="ty-vip-hello"
          lines={[`Olá, ${user.displayName}.`, <em key="e">Esse espaço é seu.</em>]}
        />
        <Reveal delay={0.4}>
          <ul style={{ listStyle: "none", margin: "36px 0 0", padding: 0, display: "grid", gap: 12, maxWidth: 620 }}>
            {nowLines.map((l, i) => (
              <li key={i} style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
                <StatusText tone={l.tone}>{""}</StatusText>
                <span className="ty-lead" style={{ fontSize: 18 }}>
                  {l.text}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <VipSection
        eyebrow="Minha jornada"
        title={
          <>
            {o.points} <em>pontos</em>
          </>
        }
        aside={
          <p className="ty-body" style={{ maxWidth: 380 }}>
            {o.approvedCount === 0
              ? "Assim que seu primeiro atendimento for confirmado, sua jornada aparece aqui."
              : `${o.approvedCount} ${plural(o.approvedCount, "atendimento confirmado", "atendimentos confirmados")}. Cada um soma na sua jornada; marcos desbloqueiam cuidados extras escolhidos pela Tayssa.`}
            <TransitionLink href={ROUTES.vipJourney} className="ty-link ty-link--caps" style={{ display: "inline-block", marginTop: 18 }}>
              Ver a jornada
            </TransitionLink>
          </p>
        }
      >
        <JourneyPath loyalty={o.loyalty} compact />
      </VipSection>

      <VipSection
        eyebrow="Benefícios"
        title={activeBenefits.length ? <>Você desbloqueou <em>{activeBenefits.length}</em>.</> : <>Seu próximo <em>benefício</em></>}
        aside={
          <TransitionLink href={ROUTES.vipBenefits} className="ty-link ty-link--caps">
            Ver todos
          </TransitionLink>
        }
      >
        {activeBenefits.length ? (
          <div>
            {activeBenefits.slice(0, 2).map((b) => (
              <BenefitObject
                key={b.id}
                item={b}
                isVip={user.isVip}
                whatsappUrl={whatsappUrl(phone, renderTemplate(wa.benefit_request, { name: user.displayName, benefit: b.title }))}
              />
            ))}
          </div>
        ) : (
          <EmptyState>Continue sua jornada. Seu próximo benefício está mais perto do que parece.</EmptyState>
        )}
      </VipSection>

      <VipSection
        eyebrow="Indicações"
        title={
          <>
            {o.referral.inCycle} <em>/ {o.referral.threshold}</em>
          </>
        }
        aside={
          <p className="ty-body" style={{ maxWidth: 380 }}>
            {o.referral.approved === 0
              ? "Seu primeiro convite pode começar aqui."
              : o.referral.remaining === o.referral.threshold
                ? `Rodada completa. Você já liberou ${o.referral.cyclesEarned} ${plural(o.referral.cyclesEarned, "benefício", "benefícios")} de indicação.`
                : `Falta ${o.referral.remaining} ${plural(o.referral.remaining, "indicação confirmada", "indicações confirmadas")} para “${o.referral.rewardTitle}”.`}
            {o.referralsInProgress > 0 ? (
              <span className="ty-small" style={{ display: "block", marginTop: 8 }}>
                {o.referralsInProgress} em andamento.
              </span>
            ) : null}
            <TransitionLink href={ROUTES.vipReferrals} className="ty-link ty-link--caps" style={{ display: "inline-block", marginTop: 18 }}>
              Indicar alguém
            </TransitionLink>
          </p>
        }
      >
        <ReferralLine count={o.referral.inCycle} total={o.referral.threshold} />
      </VipSection>

      <VipSection
        eyebrow="Aniversário"
        title={user.isVip ? <>Sua <em>semana</em></> : <>Experiência <em>VIP</em></>}
        aside={
          <TransitionLink href={ROUTES.vipBirthday} className="ty-link ty-link--caps">
            Saber mais
          </TransitionLink>
        }
      >
        {!user.isVip ? (
          <EmptyState>Esse benefício faz parte da experiência VIP. O acesso é liberado pela Tayssa.</EmptyState>
        ) : !o.birthday ? (
          <EmptyState>Conte sua data de aniversário para a Tayssa. Ela cadastra, e sua semana aparece aqui.</EmptyState>
        ) : o.birthdayBenefit ? (
          <BenefitObject
            item={o.birthdayBenefit}
            isVip={user.isVip}
            whatsappUrl={whatsappUrl(phone, renderTemplate(wa.birthday_request, { name: user.displayName }))}
          />
        ) : (
          <EmptyState>
            {o.birthday.inWindow
              ? "É a sua semana. A Tayssa libera o presente por aqui."
              : `Seu aniversário é em ${dateLong(o.birthday.nextDate)}. Na semana, uma experiência escolhida pela Tayssa para você.`}
          </EmptyState>
        )}
      </VipSection>

      <VipSection
        eyebrow="Histórico"
        title={<>Seus <em>atendimentos</em></>}
        aside={
          <TransitionLink href={ROUTES.vipHistory} className="ty-link ty-link--caps">
            Ver tudo
          </TransitionLink>
        }
      >
        {o.recentServices.length ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {o.recentServices.map((s) => (
              <li key={s.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 18, padding: "14px 0", borderTop: "1px solid var(--t-line)", alignItems: "baseline" }}>
                <span className="ty-small ty-num">{dateLong(s.service_date)}</span>
                <span style={{ fontSize: 16 }}>{s.service_name}</span>
                <ServiceStatusText status={s.status} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>Assim que seu primeiro atendimento for confirmado, sua jornada aparecerá aqui.</EmptyState>
        )}
      </VipSection>
      <style>{`.ty-vip-hello { font-size: clamp(40px, 7vw, 120px); }`}</style>
    </>
  );
}

/** Linha segmentada — indicação como progressão, sem barra genérica. */
function ReferralLine({ count, total }: { count: number; total: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${total}, 1fr)`, gap: 10, maxWidth: 420 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ display: "grid", gap: 10 }}>
          <div style={{ height: 2, background: i < count ? "var(--t-fg)" : "var(--t-line-strong)" }} />
          <span className="ty-small ty-num" style={{ opacity: i < count ? 1 : 0.6 }}>
            {String(i + 1).padStart(2, "0")}
          </span>
        </div>
      ))}
    </div>
  );
}
