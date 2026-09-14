import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { getClientServiceHistory } from "@/lib/tayssa/queries/client";
import { currency, dateLong } from "@/lib/tayssa/format";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { ServiceStatusText } from "@/components/tayssa/ui/status";
import { VipSection, EmptyState } from "@/components/tayssa/vip/section";

/** Linha do tempo: a relação documentada. */
export default async function HistoryPage() {
  const user = await requireClientPage();
  const all = await getClientServiceHistory(user.id);
  const approved = all.filter((s) => s.status === "approved");
  const pending = all.filter((s) => s.status === "pending");
  const rejected = all.filter((s) => s.status === "rejected");
  const total = approved.reduce((n, s) => n + s.points, 0);

  const byYear = approved.reduce<Record<string, typeof approved>>((acc, s) => {
    const y = s.service_date.slice(0, 4);
    (acc[y] ??= []).push(s);
    return acc;
  }, {});

  return (
    <>
      <div style={{ paddingBottom: "clamp(40px, 6vw, 88px)" }}>
        <Reveal>
          <span className="ty-eyebrow" style={{ display: "block", marginBottom: 20 }}>
            Histórico
          </span>
        </Reveal>
        <MaskedLines
          as="h1"
          inView={false}
          className="ty-display"
          lineClassName="ty-vip-title"
          lines={
            approved.length
              ? [`${approved.length} ${approved.length === 1 ? "atendimento" : "atendimentos"}.`, <em key="e">{total} pontos na jornada.</em>]
              : ["Sua jornada", <em key="e">começa no primeiro atendimento.</em>]
          }
        />
      </div>

      <VipSection eyebrow="Confirmados" title={<>Sua <em>linha do tempo</em></>}>
        {approved.length ? (
          <div style={{ display: "grid", gap: 36 }}>
            {Object.entries(byYear)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([year, items]) => (
                <div key={year}>
                  <span className="ty-eyebrow" style={{ display: "block", marginBottom: 8 }}>
                    {year}
                  </span>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {items.map((s) => (
                      <li
                        key={s.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(96px, auto) 1fr auto",
                          gap: 18,
                          padding: "16px 0",
                          borderTop: "1px solid var(--t-line)",
                          alignItems: "baseline",
                        }}
                      >
                        <span className="ty-small ty-num">{dateLong(s.service_date)}</span>
                        <div>
                          <span style={{ fontSize: 17 }}>{s.service_name}</span>
                          {s.amount != null ? (
                            <span className="ty-small" style={{ display: "block", marginTop: 3 }}>
                              {currency(s.amount)}
                            </span>
                          ) : null}
                        </div>
                        <span className="ty-num" style={{ fontFamily: "var(--t-font-display)", fontSize: 22 }}>
                          +{s.points}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        ) : (
          <EmptyState>Assim que seu primeiro atendimento for confirmado, sua jornada aparecerá aqui.</EmptyState>
        )}
      </VipSection>

      {pending.length || rejected.length ? (
        <VipSection eyebrow="Registros" title={<>Aguardando e <em>não confirmados</em></>}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {[...pending, ...rejected].map((s) => (
              <li key={s.id} style={{ display: "grid", gridTemplateColumns: "minmax(96px, auto) 1fr auto", gap: 18, padding: "16px 0", borderTop: "1px solid var(--t-line)", alignItems: "baseline" }}>
                <span className="ty-small ty-num">{dateLong(s.service_date)}</span>
                <div>
                  <span style={{ fontSize: 17 }}>{s.service_name}</span>
                  {s.status === "rejected" && s.review_note ? (
                    <span className="ty-small" style={{ display: "block", marginTop: 3, fontStyle: "italic" }}>
                      “{s.review_note}”
                    </span>
                  ) : null}
                </div>
                <ServiceStatusText status={s.status} />
              </li>
            ))}
          </ul>
        </VipSection>
      ) : null}
      <style>{`.ty-vip-title { font-size: clamp(36px, 5.2vw, 84px); }`}</style>
    </>
  );
}
