import { Phone, ShieldCheck, Zap, Clock, Star } from "lucide-react";
import { ANDRE_CONFIG, waLink, telLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";
import { HeroCanvasClient } from "./hero-canvas-client";
import { SplitText } from "./split-text";
import { Magnetic } from "./magnetic";
import { MistBackground } from "./mist-background";

const stars = Array.from({ length: 24 });

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden min-h-[100svh] flex items-center"
    >
      <div className="absolute inset-0 andre-aurora pointer-events-none" />
      <MistBackground />
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {stars.map((_, i) => (
          <span
            key={i}
            className="andre-star"
            style={{
              left: `${(i * 137) % 100}%`,
              top: `${(i * 53) % 55}%`,
              animationDelay: `${(i % 8) * 0.45}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-5 lg:px-8 py-24 lg:py-0">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-4 items-center">
          {/* Editorial */}
          <div>
            <div className="andre-anim-in">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-[var(--andre-border)] bg-white/[0.03] px-4 py-2 font-tech text-[10.5px] uppercase tracking-[0.28em] text-[var(--andre-muted)]">
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

            <p className="mt-7 text-base sm:text-lg text-[var(--andre-muted)] max-w-lg leading-relaxed andre-anim-in [animation-delay:900ms]">
              Instalação, manutenção e higienização com precisão de
              engenharia. Orçamento em minutos, atendimento em até 24h.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-4 andre-anim-in [animation-delay:1100ms]">
              <Magnetic>
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="andre-btn-primary inline-flex items-center justify-center gap-2 h-13 px-7 rounded-sm text-[15px]"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Solicitar visita técnica
                </a>
              </Magnetic>
              <span className="font-tech text-xs tracking-[0.18em] text-[var(--andre-muted)] uppercase">
                4,9 · {ANDRE_CONFIG.clientsServed} clientes
              </span>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[13px] text-slate-400 andre-anim-in [animation-delay:1300ms]">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-sky-400" />
                90 dias de garantia
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-sky-400" />
                Resposta em ~5 min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-sky-400" />
                Atendimento em 24h
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-400" fill="#fbbf24" />
                {ANDRE_CONFIG.rating} · {ANDRE_CONFIG.clientsServed} clientes
              </span>
            </div>
          </div>

          {/* Cena WebGL envolta em brilho gelado */}
          <div className="relative h-[340px] sm:h-[420px] lg:h-[78vh]">
            <div className="andre-hero-product-glow" aria-hidden />
            <HeroCanvasClient />
          </div>
        </div>

        {/* scroll cue */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 andre-anim-in [animation-delay:1600ms]">
          <span className="text-[10px] tracking-[0.3em] uppercase text-slate-500 font-bold">
            role
          </span>
          <span className="andre-scroll-line" />
        </div>
      </div>
    </section>
  );
}
