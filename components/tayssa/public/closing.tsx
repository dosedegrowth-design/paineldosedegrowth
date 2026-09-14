"use client";

import { ROUTES } from "@/lib/tayssa/config";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { TyExternalButton, TyLinkButton } from "@/components/tayssa/ui/button";
import { Magnetic } from "@/components/tayssa/ui/magnetic";
import { scrollToTarget } from "@/components/tayssa/ui/smooth-scroll";

/** Transição 8 — fechamento. Não é "fale conosco": é o convite. */
export function Closing({ scheduleUrl }: { scheduleUrl: string }) {
  return (
    <section className="ty-section" aria-label="Começar" style={{ paddingBottom: "clamp(64px, 8vw, 120px)" }}>
      <div className="ty-container" style={{ textAlign: "center" }}>
        <MaskedLines
          as="h2"
          className="ty-display"
          lineClassName="ty-close-title"
          lines={["Sua experiência", <em key="e">começa aqui.</em>]}
        />
        <Reveal delay={0.25}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 16,
              marginTop: "clamp(36px, 4vw, 56px)",
            }}
          >
            <Magnetic>
              <TyExternalButton href={scheduleUrl} variant="solid" arrow cursor="WhatsApp">
                Agendar
              </TyExternalButton>
            </Magnetic>
            <Magnetic>
              <button className="ty-btn" onClick={() => scrollToTarget("#vip")} data-cursor="VIP">
                <span>Conhecer o VIP</span>
              </button>
            </Magnetic>
            <Magnetic>
              <TyLinkButton href={ROUTES.refer} cursor="Indicar">
                Indicar
              </TyLinkButton>
            </Magnetic>
          </div>
        </Reveal>
      </div>
      <style>{`.ty-close-title { font-size: clamp(44px, 8vw, 140px); }`}</style>
    </section>
  );
}
