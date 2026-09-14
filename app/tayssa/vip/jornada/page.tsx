import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { getClientOverview } from "@/lib/tayssa/queries/client";
import { getActiveServices } from "@/lib/tayssa/queries/catalog";
import { toISODate } from "@/lib/tayssa/rules";
import { plural } from "@/lib/tayssa/format";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { JourneyPath } from "@/components/tayssa/vip/journey-path";
import { VipSection } from "@/components/tayssa/vip/section";
import { SubmitServiceForm } from "@/components/tayssa/vip/forms";

export default async function JourneyPage() {
  const user = await requireClientPage();
  const [o, services] = await Promise.all([getClientOverview(user), getActiveServices()]);

  return (
    <>
      <div style={{ paddingBottom: "clamp(40px, 6vw, 88px)" }}>
        <Reveal>
          <span className="ty-eyebrow" style={{ display: "block", marginBottom: 20 }}>
            Minha jornada
          </span>
        </Reveal>
        <MaskedLines
          as="h1"
          inView={false}
          className="ty-display"
          lineClassName="ty-vip-title"
          lines={[`${o.points} pontos.`, <em key="e">{o.loyalty.next ? `Faltam ${o.loyalty.pointsToNext} para o próximo marco.` : "Todos os marcos alcançados."}</em>]}
        />
      </div>

      <VipSection
        eyebrow="O caminho"
        title={<>Onde você <em>está</em></>}
        aside={
          <p className="ty-body" style={{ maxWidth: 380 }}>
            Cada atendimento confirmado soma pontos. Ao alcançar um marco, a Tayssa valida e o
            benefício aparece desbloqueado. Nada é automático: ela confirma cada etapa.
          </p>
        }
      >
        <JourneyPath loyalty={o.loyalty} />
      </VipSection>

      <VipSection eyebrow="Marcos" title={<>O que cada marco <em>desbloqueia</em></>}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {o.loyalty.milestones.map((m) => (
            <li key={m.key} style={{ padding: "20px 0", borderTop: "1px solid var(--t-line)", display: "grid", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline", flexWrap: "wrap" }}>
                <h3 className="ty-h-sm" style={{ fontSize: 26 }}>{m.title}</h3>
                <span className={`ty-status ${m.reached ? "ty-status--ok" : "ty-status--off"}`}>
                  {m.reached ? "Alcançado" : `${m.threshold} pontos`}
                </span>
              </div>
              {m.description ? <p className="ty-body">{m.description}</p> : null}
            </li>
          ))}
          {!o.loyalty.milestones.length ? (
            <li className="ty-body">Os marcos da jornada ainda estão sendo definidos pela Tayssa.</li>
          ) : null}
        </ul>
      </VipSection>

      <VipSection
        eyebrow="Registrar"
        title={<>Fez um atendimento <em>recente?</em></>}
        aside={
          <p className="ty-body" style={{ maxWidth: 380 }}>
            Registre aqui para a Tayssa confirmar. Só depois da confirmação os pontos entram.
            {o.pendingServices > 0 ? (
              <span className="ty-small" style={{ display: "block", marginTop: 10 }}>
                {o.pendingServices} {plural(o.pendingServices, "registro aguardando", "registros aguardando")} confirmação.
              </span>
            ) : null}
          </p>
        }
      >
        <SubmitServiceForm services={services} todayISO={toISODate(new Date())} />
      </VipSection>
      <style>{`.ty-vip-title { font-size: clamp(36px, 5.2vw, 84px); }`}</style>
    </>
  );
}
