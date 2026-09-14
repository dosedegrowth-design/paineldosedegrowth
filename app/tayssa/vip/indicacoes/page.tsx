import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { getClientOverview, getClientReferrals } from "@/lib/tayssa/queries/client";
import { plural, dateLong } from "@/lib/tayssa/format";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { ReferralStatusText } from "@/components/tayssa/ui/status";
import { VipSection, EmptyState } from "@/components/tayssa/vip/section";
import { VipReferralForm } from "@/components/tayssa/vip/forms";

export default async function ReferralsPage() {
  const user = await requireClientPage();
  const [o, referrals] = await Promise.all([getClientOverview(user), getClientReferrals(user.id)]);
  const r = o.referral;

  return (
    <>
      <div style={{ paddingBottom: "clamp(40px, 6vw, 88px)" }}>
        <Reveal>
          <span className="ty-eyebrow" style={{ display: "block", marginBottom: 20 }}>
            Minhas indicações
          </span>
        </Reveal>
        <MaskedLines
          as="h1"
          inView={false}
          className="ty-display"
          lineClassName="ty-vip-title"
          lines={[
            `${r.inCycle} / ${r.threshold} indicações válidas.`,
            <em key="e">
              {r.approved === 0
                ? "Seu primeiro convite pode começar aqui."
                : r.remaining === r.threshold
                  ? "Rodada completa."
                  : `Falta ${r.remaining} ${plural(r.remaining, "indicação", "indicações")}.`}
            </em>,
          ]}
        />
        <Reveal delay={0.35}>
          <p className="ty-body" style={{ marginTop: 22, maxWidth: 520, fontSize: 16 }}>
            A cada {r.threshold} indicações confirmadas: {r.rewardDescription ?? r.rewardTitle}
            {r.cyclesEarned > 0 ? ` Você já liberou ${r.cyclesEarned} ${plural(r.cyclesEarned, "vez", "vezes")}.` : ""}
          </p>
        </Reveal>
      </div>

      <VipSection
        eyebrow="Indicar"
        title={<>Alguém que <em>merece</em></>}
        aside={
          <ul className="ty-small" style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8, maxWidth: 380 }}>
            <li>Vale para quem ainda não é cliente.</li>
            <li>Conta depois do primeiro atendimento, confirmado pela Tayssa.</li>
            <li>Cada pessoa é contabilizada uma vez.</li>
            <li>O benefício não vira dinheiro.</li>
          </ul>
        }
      >
        <VipReferralForm />
      </VipSection>

      <VipSection eyebrow="Acompanhar" title={<>Suas <em>indicações</em></>}>
        {referrals.length ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {referrals.map((ref) => (
              <li
                key={ref.id}
                style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, padding: "16px 0", borderTop: "1px solid var(--t-line)", alignItems: "baseline" }}
              >
                <div>
                  <span style={{ fontSize: 17 }}>{ref.referred_name}</span>
                  <span className="ty-small" style={{ display: "block", marginTop: 4 }}>
                    Indicada em {dateLong(ref.created_at)}
                    {ref.status === "approved" && ref.approved_at ? ` · confirmada em ${dateLong(ref.approved_at)}` : ""}
                  </span>
                  {ref.status === "rejected" && ref.status_note ? (
                    <span className="ty-small" style={{ display: "block", marginTop: 4, fontStyle: "italic" }}>
                      “{ref.status_note}”
                    </span>
                  ) : null}
                </div>
                <ReferralStatusText status={ref.status} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>Seu primeiro convite pode começar aqui.</EmptyState>
        )}
      </VipSection>
      <style>{`.ty-vip-title { font-size: clamp(34px, 4.8vw, 80px); }`}</style>
    </>
  );
}
