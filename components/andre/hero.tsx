import { Phone, ShieldCheck, Zap, Clock, Star } from "lucide-react";
import { ANDRE_CONFIG, waLink, telLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";
import { HeroCanvasClient } from "./hero-canvas-client";

const stars = Array.from({ length: 24 });

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0 andre-aurora pointer-events-none" />
      <div className="absolute inset-0 andre-grid-bg pointer-events-none" />
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

      <div className="relative max-w-6xl mx-auto px-5 lg:px-8 pt-14 lg:pt-24 pb-16 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
          {/* Copy */}
          <div className="andre-anim-in">
            <span className="andre-chip">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Atendendo agora · {ANDRE_CONFIG.city}
            </span>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[3.4rem] font-black leading-[1.05] tracking-tight text-white">
              Seu ar condicionado
              <br />
              resolvido{" "}
              <span className="andre-gradient-text">sem enrolação</span>.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Instalação, manutenção, higienização e recarga de gás com{" "}
              <strong className="text-white">orçamento em minutos</strong> pelo
              WhatsApp e atendimento em até{" "}
              <strong className="text-white">24h</strong>. Split, Multi Split,
              VRF, Piso Teto e Cassete.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="andre-btn-primary inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-[15px]"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Pedir orçamento grátis
              </a>
              <a
                href={telLink()}
                className="andre-btn-ghost inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-[15px]"
              >
                <Phone className="h-5 w-5 text-sky-400" />
                {ANDRE_CONFIG.phone}
              </a>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[13px] text-slate-400">
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
                {ANDRE_CONFIG.rating} ({ANDRE_CONFIG.clientsServed} clientes)
              </span>
            </div>
          </div>

          {/* 3D */}
          <div className="relative h-[320px] sm:h-[400px] lg:h-[480px]">
            <HeroCanvasClient />
          </div>
        </div>
      </div>
    </section>
  );
}
