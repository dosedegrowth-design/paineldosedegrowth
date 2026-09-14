"use client";

import { ROUTES } from "@/lib/config";
import { MaskedLines, Reveal } from "@/components/ui/reveal";
import { TyLinkButton } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { useIsMobile } from "@/components/ui/use-media";

const STEPS = [
  { n: "01", t: "Você indica", d: "Nome e telefone de quem ainda não conhece a Tayssa." },
  { n: "02", t: "Ela confirma", d: "A pessoa faz o primeiro atendimento e a Tayssa valida." },
  { n: "03", t: "O benefício é seu", d: "Liberado depois da confirmação. Nunca automático." },
];

/** Transição 7 — indicação pública. Qualquer pessoa pode indicar. */
export function ReferralCta() {
  const isMobile = useIsMobile();
  return (
    <section id="indicar" className="ty-section" aria-label="Indicação">
      <div className="ty-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 6fr) minmax(0, 6fr)",
            gap: isMobile ? 36 : "clamp(40px, 6vw, 120px)",
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
              as="h2"
              className="ty-display"
              lineClassName="ty-ref-title"
              lines={["Conhece alguém", "que precisa", <em key="e">conhecer a Tayssa?</em>]}
            />
            <Reveal delay={0.2}>
              <div style={{ marginTop: 32 }}>
                <Magnetic>
                  <TyLinkButton href={ROUTES.refer} variant="solid" arrow>
                    Indicar alguém
                  </TyLinkButton>
                </Magnetic>
              </div>
            </Reveal>
          </div>
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {STEPS.map((s, i) => (
              <Reveal key={s.n} as="li" delay={0.1 + i * 0.08}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "56px 1fr",
                    gap: 16,
                    padding: "22px 0",
                    borderTop: "1px solid var(--t-line)",
                  }}
                >
                  <span className="ty-num ty-muted" style={{ fontSize: 11, letterSpacing: "0.2em", paddingTop: 6 }}>
                    {s.n}
                  </span>
                  <div>
                    <h3 className="ty-h-sm" style={{ fontSize: 24 }}>{s.t}</h3>
                    <p className="ty-body" style={{ marginTop: 6 }}>{s.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
      <style>{`.ty-ref-title { font-size: clamp(31px, 3.65vw, 50px); }`}</style>
    </section>
  );
}
