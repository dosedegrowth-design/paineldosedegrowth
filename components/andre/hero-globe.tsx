import { ShieldCheck, Zap, Clock } from "lucide-react";
import { ANDRE_CONFIG, waLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";
import { SplitText } from "./split-text";
import { Magnetic } from "./magnetic";
import { MistBackground } from "./mist-background";
import { GlobeBackdrop } from "./globe-backdrop";

/* Hero com globo wireframe 3D (DotGlobeHero do 21st.dev) girando atrás da
   headline. O canvas three.js só monta em desktop via GlobeBackdrop; no
   mobile o fundo é o MistBackground (CSS), mantendo o hero leve. */

export function HeroGlobe() {
  return (
    <section
      id="top"
      className="relative overflow-hidden min-h-[100svh] flex items-center"
    >
      <MistBackground />
      <GlobeBackdrop />

      {/* vinheta pra ancorar a leitura no centro */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(70% 55% at 50% 50%, transparent 0%, rgba(5, 8, 12, 0.55) 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-5 lg:px-8 pt-28 pb-24 lg:py-0 text-center">
        <div className="andre-anim-in">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-[var(--andre-border)] bg-white/[0.04] backdrop-blur-md px-4 py-2 font-tech text-[10.5px] uppercase tracking-[0.28em] text-[var(--andre-muted)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--andre-primary)] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--andre-primary)]" />
            </span>
            São Paulo · Atendimento 24h
          </span>
        </div>

        <h1 className="andre-display mt-8 text-[2.7rem] sm:text-6xl lg:text-7xl xl:text-8xl uppercase leading-[0.92] tracking-tighter text-white">
          <SplitText text="O frio certo," delay={0.15} />
          <br />
          <SplitText text="no silêncio certo." delay={0.5} gradient />
        </h1>

        <p className="mt-8 text-base sm:text-lg text-[var(--andre-muted)] max-w-lg mx-auto leading-relaxed andre-anim-in [animation-delay:900ms]">
          Instalação, manutenção e higienização com precisão de engenharia.
          Orçamento em minutos, atendimento em até 24h.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 andre-anim-in [animation-delay:1100ms]">
          <Magnetic>
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="andre-btn-primary inline-flex items-center justify-center gap-2 h-13 px-7 rounded-sm text-[15px]"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Solicitar visita no WhatsApp
            </a>
          </Magnetic>
          <a
            href="#como-funciona"
            className="andre-btn-ghost inline-flex items-center justify-center h-13 px-7 rounded-sm text-[15px]"
          >
            Como funciona
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-[13px] text-[var(--andre-muted)] andre-anim-in [animation-delay:1300ms]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[var(--andre-primary)]" />
            90 dias de garantia
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-[var(--andre-primary)]" />
            Resposta em ~5 min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-[var(--andre-primary)]" />
            {ANDRE_CONFIG.rating} · {ANDRE_CONFIG.clientsServed} clientes
          </span>
        </div>

        {/* scroll cue */}
        <div className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 andre-anim-in [animation-delay:1600ms]">
          <span className="font-tech text-[10px] tracking-[0.3em] uppercase text-[var(--andre-muted)]">
            role
          </span>
          <span className="andre-scroll-line" />
        </div>
      </div>
    </section>
  );
}
