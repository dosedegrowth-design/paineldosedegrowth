import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { getCardState } from "@/lib/tayssa/engine";
import { getSettings } from "@/lib/tayssa/settings";
import { toCardStamps } from "@/lib/tayssa/queries/vip";
import { dateLong, plural } from "@/lib/tayssa/format";
import { BENEFIT_STATUS_LABEL } from "@/lib/tayssa/types";
import { LoyaltyCard } from "@/components/tayssa/vip/loyalty-card";

export default async function CardPage() {
  const user = await requireClientPage();
  const [card, settings] = await Promise.all([getCardState(user.id), getSettings()]);
  const stamps = toCardStamps(card.stamps);
  const revealed = stamps.filter((s) => s.revealed).sort((a, b) => b.position - a.position);

  return (
    <>
      <h1 className="tyv-hello">
        Seu <em>cartão</em>.
      </h1>
      <p className="tyv-sub">
        {card.unrevealed
          ? `Toque no dourado para raspar. ${card.unrevealed} ${plural(card.unrevealed, "carimbo espera", "carimbos esperam")} você.`
          : `A cada ${card.size} visitas confirmadas, um presente escolhido pela Tayssa.`}
      </p>

      <div style={{ marginTop: 22 }}>
        <LoyaltyCard
          cycle={card.cycle}
          size={card.size}
          stamps={stamps}
          completedCards={card.completedCards}
          rewardTitle={settings.loyalty.card_reward_title}
          rewardStatus={card.reward?.status ?? null}
        />
      </div>

      {card.reward ? (
        <section className="tyv-section">
          <div className="tyv-panel">
            <span className="tyv-label">Presente do cartão</span>
            <p style={{ fontSize: 18, marginTop: 8 }}>{card.reward.title}</p>
            <p className="tyv-sub" style={{ fontSize: 13.5, marginTop: 6 }}>
              {card.reward.description ?? settings.loyalty.card_reward_description}
            </p>
            <p className="tyv-sub" style={{ fontSize: 12.5, marginTop: 10 }}>
              {BENEFIT_STATUS_LABEL[card.reward.status]}
              {card.reward.status === "pending_validation" ? " — a Tayssa confirma e ele aparece em Benefícios." : "."}
            </p>
          </div>
        </section>
      ) : null}

      <section className="tyv-section">
        <div className="tyv-section-head">
          <h2 className="tyv-h2">Carimbos deste cartão</h2>
        </div>
        <div className="tyv-panel">
          {revealed.length ? (
            revealed.map((s) => (
              <div key={s.id} className="tyv-row">
                <div>
                  <p style={{ fontSize: 15 }}>{s.serviceName}</p>
                  <p className="tyv-sub" style={{ fontSize: 12.5 }}>
                    {dateLong(s.date)} · posição {s.position}
                  </p>
                </div>
                <span className="tyv-num" style={{ fontSize: 18 }}>
                  +{s.points}
                </span>
              </div>
            ))
          ) : (
            <p className="tyv-empty">
              {card.unrevealed
                ? "Raspe o dourado para ver o que sua visita rendeu."
                : "Seu primeiro carimbo chega quando a Tayssa confirmar a visita."}
            </p>
          )}
        </div>
      </section>

      <section className="tyv-section">
        <div className="tyv-section-head">
          <h2 className="tyv-h2">Como funciona</h2>
        </div>
        <div className="tyv-panel">
          <div className="tyv-row">
            <span style={{ fontSize: 14.5, maxWidth: "82%" }}>
              A Tayssa confirma o atendimento. O carimbo aparece dourado no seu cartão.
            </span>
            <span className="tyv-num" style={{ fontSize: 20, opacity: 0.5 }}>
              01
            </span>
          </div>
          <div className="tyv-row">
            <span style={{ fontSize: 14.5, maxWidth: "82%" }}>
              Você raspa com o dedo e descobre quantos pontos aquela visita rendeu.
            </span>
            <span className="tyv-num" style={{ fontSize: 20, opacity: 0.5 }}>
              02
            </span>
          </div>
          <div className="tyv-row">
            <span style={{ fontSize: 14.5, maxWidth: "82%" }}>
              Com as {card.size} posições preenchidas, o presente entra em Benefícios depois que a Tayssa valida.
            </span>
            <span className="tyv-num" style={{ fontSize: 20, opacity: 0.5 }}>
              03
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
