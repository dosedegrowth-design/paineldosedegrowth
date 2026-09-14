import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { getClientOverview } from "@/lib/tayssa/queries/client";
import { renderTemplate, whatsappUrl } from "@/lib/tayssa/whatsapp";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { BenefitObject } from "@/components/tayssa/vip/benefit-object";
import { VipSection, EmptyState } from "@/components/tayssa/vip/section";

export default async function BenefitsPage() {
  const user = await requireClientPage();
  const o = await getClientOverview(user);
  const phone = o.settings.business.whatsapp;
  const wa = o.settings.whatsapp;

  const active = o.benefits.filter((b) => ["available", "requested", "approved"].includes(b.status));
  const validating = o.benefits.filter((b) => b.status === "pending_validation");
  const past = o.benefits.filter((b) => ["redeemed", "expired", "rejected"].includes(b.status));

  const link = (title: string, type: string | undefined) =>
    whatsappUrl(
      phone,
      renderTemplate(type === "birthday" ? wa.birthday_request : wa.benefit_request, { name: user.displayName, benefit: title })
    );

  return (
    <>
      <div style={{ paddingBottom: "clamp(40px, 6vw, 88px)" }}>
        <Reveal>
          <span className="ty-eyebrow" style={{ display: "block", marginBottom: 20 }}>
            Benefícios
          </span>
        </Reveal>
        <MaskedLines
          as="h1"
          inView={false}
          className="ty-display"
          lineClassName="ty-vip-title"
          lines={
            active.length
              ? [`Você desbloqueou ${active.length}.`, <em key="e">Quando quiser, é seu.</em>]
              : ["Seu próximo benefício", <em key="e">está no caminho.</em>]
          }
        />
      </div>

      <VipSection eyebrow="Desbloqueados" title={<>Para <em>usar</em></>}>
        {active.length ? (
          <div>
            {active.map((b) => (
              <BenefitObject key={b.id} item={b} isVip={user.isVip} whatsappUrl={link(b.title, b.benefit?.type)} />
            ))}
          </div>
        ) : (
          <EmptyState>Continue sua jornada. Seu próximo benefício está mais perto do que parece.</EmptyState>
        )}
      </VipSection>

      {validating.length ? (
        <VipSection
          eyebrow="Em validação"
          title={<>A Tayssa está <em>confirmando</em></>}
          aside={<p className="ty-body" style={{ maxWidth: 360 }}>Você alcançou o marco. A Tayssa confere e libera.</p>}
        >
          <div>
            {validating.map((b) => (
              <BenefitObject key={b.id} item={b} isVip={user.isVip} />
            ))}
          </div>
        </VipSection>
      ) : null}

      {past.length ? (
        <VipSection eyebrow="Histórico" title={<>O que você já <em>viveu</em></>}>
          <div>
            {past.map((b) => (
              <BenefitObject key={b.id} item={b} isVip={user.isVip} />
            ))}
          </div>
        </VipSection>
      ) : null}
      <style>{`.ty-vip-title { font-size: clamp(36px, 5.2vw, 84px); }`}</style>
    </>
  );
}
