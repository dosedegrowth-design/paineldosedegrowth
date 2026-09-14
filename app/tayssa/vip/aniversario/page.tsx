import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { getClientOverview } from "@/lib/tayssa/queries/client";
import { renderTemplate, whatsappUrl } from "@/lib/tayssa/whatsapp";
import { dateLong } from "@/lib/tayssa/format";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { BenefitObject } from "@/components/tayssa/vip/benefit-object";
import { VipSection, EmptyState } from "@/components/tayssa/vip/section";

export default async function BirthdayPage() {
  const user = await requireClientPage();
  const o = await getClientOverview(user);
  const s = o.settings;
  const infoUrl = whatsappUrl(s.business.whatsapp, s.whatsapp.public_vip_info);
  const requestUrl = whatsappUrl(s.business.whatsapp, renderTemplate(s.whatsapp.birthday_request, { name: user.displayName }));

  if (!user.isVip) {
    return (
      <div style={{ paddingBlock: "clamp(40px, 8vw, 120px)" }}>
        <Reveal>
          <span className="ty-eyebrow" style={{ display: "block", marginBottom: 20 }}>
            Aniversário
          </span>
        </Reveal>
        <MaskedLines
          as="h1"
          inView={false}
          className="ty-display"
          lineClassName="ty-vip-title"
          lines={["Esse benefício faz parte", <em key="e">da experiência VIP.</em>]}
        />
        <Reveal delay={0.4}>
          <p className="ty-body" style={{ marginTop: 22, maxWidth: 480, fontSize: 16 }}>
            O acesso VIP é liberado pela Tayssa de acordo com a relação de cada cliente com o
            estúdio. Se quiser saber como funciona, fale com ela.
          </p>
          <a href={infoUrl} target="_blank" rel="noopener noreferrer" className="ty-btn ty-btn--solid" style={{ marginTop: 26 }}>
            <span>Falar com Tayssa</span>
            <span className="ty-btn__arrow" aria-hidden />
          </a>
        </Reveal>
        <style>{`.ty-vip-title { font-size: clamp(34px, 5vw, 80px); }`}</style>
      </div>
    );
  }

  const b = o.birthday;
  const headline = !b
    ? ["Sua semana", <em key="e">ainda não tem data.</em>]
    : b.isToday
      ? ["Hoje é o seu dia.", <em key="e">Que bom ter você aqui.</em>]
      : b.inWindow
        ? ["É a sua semana.", <em key="e">Ela é sua.</em>]
        : [`${dateLong(b.nextDate)}.`, <em key="e">{b.daysUntil === 1 ? "Falta 1 dia." : `Faltam ${b.daysUntil} dias.`}</em>];

  return (
    <>
      <div style={{ paddingBottom: "clamp(40px, 6vw, 88px)" }}>
        <Reveal>
          <span className="ty-eyebrow" style={{ display: "block", marginBottom: 20 }}>
            Aniversário
          </span>
        </Reveal>
        <MaskedLines as="h1" inView={false} className="ty-display" lineClassName="ty-vip-title" lines={headline} />
      </div>

      <VipSection
        eyebrow="Sua experiência"
        title={<>Escolhida <em>para você</em></>}
        aside={
          <p className="ty-body" style={{ maxWidth: 380 }}>
            O presente não é fixo: a Tayssa escolhe de acordo com o seu perfil e o seu momento.
            Vale na semana do aniversário
            {b ? ` (${dateLong(b.windowStart)} a ${dateLong(b.windowEnd)})` : ""}, com agendamento.
            {o.blackout ? ` Neste período (${o.blackout.name}) a agenda tem restrições; o benefício pode ser usado depois de ${dateLong(o.blackout.endsOn)}.` : ""}
          </p>
        }
      >
        {!b ? (
          <EmptyState>Conte sua data de aniversário para a Tayssa. Ela cadastra, e sua semana aparece aqui.</EmptyState>
        ) : o.birthdayBenefit ? (
          <BenefitObject item={o.birthdayBenefit} isVip whatsappUrl={requestUrl} />
        ) : (
          <div style={{ display: "grid", gap: 20 }}>
            <EmptyState>
              {b.inWindow
                ? "É a sua semana. A Tayssa libera o presente por aqui e você agenda."
                : "Na sua semana, o presente aparece aqui, liberado pela Tayssa."}
            </EmptyState>
            {b.inWindow ? (
              <a href={requestUrl} target="_blank" rel="noopener noreferrer" className="ty-btn ty-btn--sm ty-btn--solid" style={{ justifySelf: "start" }}>
                <span>Quero agendar meu benefício</span>
                <span className="ty-btn__arrow" aria-hidden />
              </a>
            ) : null}
          </div>
        )}
      </VipSection>

      <VipSection eyebrow="Como funciona" title={<>Poucas <em>regras</em></>}>
        <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {s.birthday.rules.map((r, i) => (
            <li key={i} className="ty-body" style={{ display: "flex", gap: 16, padding: "12px 0", borderTop: "1px solid var(--t-line)" }}>
              <span className="ty-num ty-small" style={{ flex: "none", letterSpacing: "0.16em", paddingTop: 3 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      </VipSection>
      <style>{`.ty-vip-title { font-size: clamp(36px, 5.2vw, 84px); }`}</style>
    </>
  );
}
