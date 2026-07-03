import {
  Phone,
  ShieldCheck,
  Zap,
  Star,
  Clock,
} from "lucide-react";
import { ANDRE_CONFIG, waLink, telLink } from "./config";
import { HeroScene } from "./hero-scene";
import { WhatsAppIcon } from "./whatsapp-icon";
import { HeroCanvasClient } from "./hero-canvas-client";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <HeroScene />
      <div className="absolute inset-0 andre-grid-bg pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-5 lg:px-8 pt-16 lg:pt-24 pb-20 lg:pb-28">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center">
          {/* Left: copy */}
          <div className="andre-anim-in">
            <div className="flex items-center gap-2 mb-6">
              <span className="andre-chip inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 andre-wa-pulse" />
                Atendendo hoje · {ANDRE_CONFIG.city}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.02] tracking-tight">
              Ar que trabalha.
              <br />
              <span className="andre-gradient-text">
                Técnico que resolve.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Instalação, manutenção preventiva, higienização e recarga de gás
              para Split, Multi Split, VRF, Piso Teto e Cassete —
              com <strong className="text-white">garantia real</strong> e
              atendimento em até <strong className="text-white">24h</strong>.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="andre-btn-primary inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg text-[15px]"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Chamar André no WhatsApp
              </a>
              <a
                href={telLink()}
                className="andre-btn-ghost inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg text-[15px] font-semibold"
              >
                <Phone className="h-5 w-5" style={{ color: "#7dd3fc" }} />
                {ANDRE_CONFIG.phone}
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-slate-400">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" style={{ color: "#7dd3fc" }} />
                90 dias de garantia
              </span>
              <span className="inline-flex items-center gap-2">
                <Zap className="h-4 w-4" style={{ color: "#7dd3fc" }} />
                Orçamento em minutos
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: "#7dd3fc" }} />
                Atendimento em 24h
              </span>
            </div>
          </div>

          {/* Right: 3D unit + quote widget */}
          <div className="andre-anim-in [animation-delay:120ms] flex flex-col gap-5">
            <div className="relative h-[300px] sm:h-[360px] lg:h-[380px] rounded-2xl overflow-hidden andre-glass">
              <HeroCanvasClient />
              <div className="pointer-events-none absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-400">
                <span>Arraste para girar</span>
                <span style={{ color: "#7dd3fc" }}>· 3D real</span>
              </div>
            </div>
            <div className="andre-glass rounded-2xl p-6 lg:p-7 relative">
              <div
                className="absolute -top-3 left-6 andre-chip"
                style={{ background: "#0e172a" }}
              >
                Resposta em ~5 min
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full ring-2 ring-[#0e172a]"
                      style={{
                        background: `linear-gradient(135deg,
                          hsl(${200 + i * 20}, 70%, ${55 - i * 8}%),
                          hsl(${185 + i * 15}, 60%, ${40 - i * 6}%))`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-400 leading-tight">
                  <strong className="text-white">
                    {ANDRE_CONFIG.clientsServed}
                  </strong>{" "}
                  clientes atendidos em {ANDRE_CONFIG.yearsExperience} anos
                </p>
              </div>

              <div className="flex items-center gap-1.5 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4"
                    fill="#fbbf24"
                    color="#fbbf24"
                  />
                ))}
                <span className="text-xs text-slate-300 ml-1 font-semibold">
                  {ANDRE_CONFIG.rating} de 5
                </span>
              </div>

              <div className="space-y-3">
                <QuoteRow label="Instalação Split 9.000 – 12.000 BTU" price="a partir de R$ 380" />
                <QuoteRow label="Manutenção completa + higienização" price="a partir de R$ 190" />
                <QuoteRow label="Recarga de gás R-410A / R-32" price="sob consulta" />
                <QuoteRow label="Visita técnica + diagnóstico" price="gratuita*" />
              </div>

              <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
                *Visita gratuita mediante execução do serviço. Valores variam
                por modelo e localização.
              </p>

              <a
                href={waLink("Olá, André! Quero receber um orçamento personalizado.")}
                target="_blank"
                rel="noopener noreferrer"
                className="andre-btn-primary mt-5 w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg text-sm"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Quero meu orçamento grátis
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuoteRow({ label, price }: { label: string; price: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-white/[0.05] last:border-b-0">
      <span className="text-[13px] text-slate-300 leading-tight">{label}</span>
      <span className="text-[13px] font-semibold text-white whitespace-nowrap">
        {price}
      </span>
    </div>
  );
}
