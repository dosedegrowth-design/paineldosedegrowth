import { ShieldCheck, Zap, Clock } from "lucide-react";
import { ANDRE_CONFIG, waLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";
import { SplitText } from "./split-text";
import { Magnetic } from "./magnetic";
import { MistBackground } from "./mist-background";

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden min-h-[100svh] flex items-center"
    >
      {/* foto hiper-real com tratamento de cinema */}
      <div className="absolute inset-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/andre/hero-ac.jpg"
          alt=""
          fetchPriority="high"
          className="andre-kenburns absolute inset-0 h-full w-full object-cover object-[68%_30%]"
        />
        <div className="absolute inset-0 andre-vignette-radial" />
        <div className="absolute inset-0 andre-vignette-linear" />
        <div className="absolute inset-0 andre-vignette-left" />
      </div>

      <MistBackground />

      <div className="relative w-full max-w-6xl mx-auto px-5 lg:px-8 pt-28 pb-20 lg:py-0">
        <div className="max-w-2xl mx-auto text-center lg:mx-0 lg:text-left">
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
            <span className="relative inline-block">
              <SplitText text="no silêncio certo." delay={0.5} gradient />
              {/* rabisco que se desenha sozinho */}
              <svg
                className="andre-scribble absolute -bottom-3 left-0 w-full h-4"
                viewBox="0 0 600 24"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M4 16 C 80 6, 150 20, 230 12 S 380 4, 460 14 S 560 20, 596 10"
                  stroke="hsl(185 100% 50% / 0.85)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-9 text-base sm:text-lg text-[var(--andre-muted)] max-w-lg mx-auto lg:mx-0 leading-relaxed andre-anim-in [animation-delay:900ms]">
            Instalação, manutenção e higienização com precisão de engenharia.
            Orçamento em minutos, atendimento em até 24h.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 andre-anim-in [animation-delay:1100ms]">
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
            <span className="font-tech text-xs tracking-[0.18em] text-[var(--andre-muted)] uppercase">
              4,9 · {ANDRE_CONFIG.clientsServed} clientes
            </span>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2.5 text-[13px] text-[var(--andre-muted)] andre-anim-in [animation-delay:1300ms]">
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
              Atendimento em 24h
            </span>
          </div>
        </div>

        {/* scroll cue */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 andre-anim-in [animation-delay:1600ms]">
          <span className="font-tech text-[10px] tracking-[0.3em] uppercase text-[var(--andre-muted)]">
            role
          </span>
          <span className="andre-scroll-line" />
        </div>
      </div>
    </section>
  );
}
