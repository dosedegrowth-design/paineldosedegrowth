import { requireClientPage } from "@/lib/auth/guards";
import { getClientOverview, getClientReferrals } from "@/lib/queries/client";
import { renderTemplate, whatsappUrl } from "@/lib/whatsapp";
import { dateLong, plural } from "@/lib/format";
import { REFERRAL_STATUS_LABEL } from "@/lib/types";
import { BenefitItem } from "@/components/vip/benefit-item";
import { VipReferralForm } from "@/components/vip/forms";

/**
 * Tudo que a cliente pode ganhar, em uma tela: o que já é dela, o que
 * está em validação, o aniversário e as indicações que abrem o próximo.
 */
export default async function BenefitsPage() {
  const user = await requireClientPage();
  const [o, referrals] = await Promise.all([getClientOverview(user), getClientReferrals(user.id)]);
  const phone = o.settings.business.whatsapp;
  const wa = o.settings.whatsapp;

  const active = o.benefits.filter((b) => ["available", "requested", "approved"].includes(b.status));
  const validating = o.benefits.filter((b) => b.status === "pending_validation");
  const past = o.benefits.filter((b) => ["redeemed", "expired", "rejected"].includes(b.status));

  const link = (title: string, type: string | undefined) =>
    whatsappUrl(
      phone,
      renderTemplate(type === "birthday" ? wa.birthday_request : wa.benefit_request, {
        name: user.displayName,
        benefit: title,
      })
    );

  return (
    <>
      <h1 className="tyv-hello">
        Seus <em>benefícios</em>.
      </h1>
      <p className="tyv-sub">
        {active.length
          ? `${active.length} ${plural(active.length, "desbloqueado", "desbloqueados")} esperando você.`
          : "Cada visita, cada indicação e seu aniversário abrem algo por aqui."}
      </p>

      {active.length ? (
        <section className="tyv-section">
          <div className="tyv-section-head">
            <h2 className="tyv-h2">Para usar</h2>
          </div>
          <div className="tyv-stack">
            {active.map((b) => (
              <BenefitItem key={b.id} item={b} isVip={user.isVip} whatsappUrl={link(b.title, b.benefit?.type)} />
            ))}
          </div>
        </section>
      ) : null}

      {validating.length ? (
        <section className="tyv-section">
          <div className="tyv-section-head">
            <h2 className="tyv-h2">Em validação</h2>
            <span className="tyv-label">a Tayssa confirma</span>
          </div>
          <div className="tyv-stack">
            {validating.map((b) => (
              <BenefitItem key={b.id} item={b} isVip={user.isVip} />
            ))}
          </div>
        </section>
      ) : null}

      {!active.length && !validating.length ? (
        <section className="tyv-section">
          <div className="tyv-panel">
            <p className="tyv-empty">
              Seu próximo benefício está mais perto do que parece: o cartão completo é o primeiro deles.
            </p>
          </div>
        </section>
      ) : null}

      <section className="tyv-section">
        <div className="tyv-section-head">
          <h2 className="tyv-h2">Aniversário</h2>
          {user.isVip ? <span className="tyv-label">experiência VIP</span> : null}
        </div>
        <div className="tyv-panel">
          {!user.isVip ? (
            <p className="tyv-empty">Esse benefício faz parte da experiência VIP. O acesso é liberado pela Tayssa.</p>
          ) : !o.birthday ? (
            <p className="tyv-empty">Conte sua data de aniversário para a Tayssa. Ela cadastra, e sua semana aparece aqui.</p>
          ) : o.birthday.inWindow ? (
            <p className="tyv-sub" style={{ fontSize: 15 }}>
              É a sua semana. A Tayssa libera seu presente por aqui.
            </p>
          ) : (
            <p className="tyv-sub" style={{ fontSize: 15 }}>
              Seu aniversário é em {dateLong(o.birthday.nextDate)}. Na sua semana, uma experiência escolhida pela Tayssa
              para você.
            </p>
          )}
          {o.blackout ? (
            <p className="tyv-sub" style={{ fontSize: 12.5, marginTop: 10 }}>
              Em {o.blackout.name} a agenda tem restrições até {dateLong(o.blackout.endsOn)}.
            </p>
          ) : null}
        </div>
      </section>

      <section className="tyv-section">
        <div className="tyv-section-head">
          <h2 className="tyv-h2">Indicações</h2>
          <span className="tyv-label">
            {o.referral.inCycle} de {o.referral.threshold}
          </span>
        </div>
        <div className="tyv-panel">
          <p className="tyv-sub" style={{ fontSize: 14.5 }}>
            {o.referral.approved === 0
              ? `Indique ${o.referral.threshold} pessoas e a Tayssa libera “${o.referral.rewardTitle}”.`
              : o.referral.remaining === o.referral.threshold
                ? `Rodada completa. Você já liberou ${o.referral.cyclesEarned} ${plural(o.referral.cyclesEarned, "benefício", "benefícios")} de indicação.`
                : `${plural(o.referral.remaining, "Falta", "Faltam")} ${o.referral.remaining} ${plural(o.referral.remaining, "indicação confirmada", "indicações confirmadas")} para “${o.referral.rewardTitle}”.`}
          </p>
          <div className="tyv-dots" style={{ marginTop: 14 }}>
            {Array.from({ length: o.referral.threshold }, (_, i) => (
              <i key={i} data-on={i < o.referral.inCycle} />
            ))}
          </div>
          <div className="tyv-divider" />
          <VipReferralForm />
        </div>

        {referrals.length ? (
          <div className="tyv-panel" style={{ marginTop: 12 }}>
            {referrals.slice(0, 6).map((r) => (
              <div key={r.id} className="tyv-row">
                <div>
                  <p style={{ fontSize: 15 }}>{r.referred_name}</p>
                  <p className="tyv-sub" style={{ fontSize: 12.5 }}>
                    {dateLong(r.created_at)}
                  </p>
                </div>
                <span className={`tyv-badge ${r.status === "approved" ? "" : "tyv-badge--quiet"}`}>
                  {REFERRAL_STATUS_LABEL[r.status]}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {past.length ? (
        <section className="tyv-section">
          <div className="tyv-section-head">
            <h2 className="tyv-h2">Já viveu</h2>
          </div>
          <div className="tyv-stack">
            {past.slice(0, 4).map((b) => (
              <BenefitItem key={b.id} item={b} isVip={user.isVip} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
