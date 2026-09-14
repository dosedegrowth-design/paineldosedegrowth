import type { Metadata } from "next";
import { getSettings } from "@/lib/tayssa/settings";
import { getPublicBenefits } from "@/lib/tayssa/queries/catalog";
import { ROUTES } from "@/lib/tayssa/config";
import { TyBrand } from "@/components/tayssa/ui/brand";
import { PublicReferralForm } from "@/components/tayssa/public/referral-form";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { PublicFooter } from "@/components/tayssa/public/footer";

export const metadata: Metadata = {
  title: "Indicar alguém",
  description: "Indique alguém para conhecer o trabalho da Tayssa. A indicação vale após o primeiro atendimento confirmado.",
};

const RULES = [
  "Vale para quem ainda não é cliente da Tayssa.",
  "A pessoa indicada precisa dizer que veio por você.",
  "Conta depois do atendimento realizado e pago normalmente.",
  "Cada pessoa só pode ser contabilizada uma vez.",
  "Não vale indicar a si mesma.",
  "Atendimentos gratuitos, permutas ou cortesias não contam.",
  "O benefício não vira dinheiro e é liberado pela Tayssa, nunca automaticamente.",
];

export default async function ReferPage() {
  const [settings, benefits] = await Promise.all([getSettings(), getPublicBenefits()]);
  const referral = benefits.find((b) => b.type === "referral");

  return (
    <>
      <header className="ty-nav" data-solid="true">
        <TransitionLink href={ROUTES.home} className="ty-nav__brand">
          <TyBrand />
        </TransitionLink>
        <TransitionLink href={ROUTES.login} className="ty-link ty-link--caps">
          Entrar
        </TransitionLink>
      </header>

      <main className="ty-container" style={{ paddingTop: "calc(var(--t-nav-h) + clamp(48px, 8vw, 120px))", paddingBottom: "clamp(80px, 10vw, 160px)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "clamp(40px, 6vw, 120px)",
            alignItems: "start",
          }}
        >
          <div>
            <Reveal>
              <span className="ty-eyebrow" style={{ display: "block", marginBottom: 22 }}>
                Indicação
              </span>
            </Reveal>
            <MaskedLines
              as="h1"
              inView={false}
              className="ty-display"
              lineClassName="ty-refpage-title"
              lines={["Indique", "alguém que", <em key="e">merece.</em>]}
            />
            <Reveal delay={0.3}>
              <p className="ty-body" style={{ marginTop: 26, maxWidth: 440, fontSize: 16 }}>
                Você não precisa ser VIP para indicar. Quando a pessoa indicada faz o primeiro
                atendimento e a Tayssa confirma, sua indicação entra na sua conta e o
                benefício é liberado.
              </p>
              {referral ? (
                <p className="ty-lead" style={{ marginTop: 22, fontSize: 18 }}>
                  {referral.description}
                  {referral.threshold ? (
                    <span className="ty-small" style={{ display: "block", marginTop: 6 }}>
                      Após {referral.threshold} indicações confirmadas.
                    </span>
                  ) : null}
                </p>
              ) : null}
              <ul style={{ margin: "34px 0 0", padding: 0, listStyle: "none", maxWidth: 460 }}>
                {RULES.map((r, i) => (
                  <li
                    key={i}
                    className="ty-small"
                    style={{ padding: "10px 0", borderTop: "1px solid var(--t-line)", display: "flex", gap: 14 }}
                  >
                    <span className="ty-num" style={{ flex: "none", letterSpacing: "0.16em" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.35} amount={0.05}>
            <PublicReferralForm whatsapp={settings.business.whatsapp} referTemplate={settings.whatsapp.public_refer} />
          </Reveal>
        </div>
      </main>
      <PublicFooter business={settings.business} />
      <style>{`.ty-refpage-title { font-size: clamp(36px, 4.56vw, 60px); }`}</style>
    </>
  );
}
