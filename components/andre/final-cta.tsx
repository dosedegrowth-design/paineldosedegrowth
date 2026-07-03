import { Phone } from "lucide-react";
import { ANDRE_CONFIG, waLink, telLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";
import { BeamsCollision } from "./beams-collision";

export function FinalCTA() {
  return (
    <section className="relative py-14 lg:py-24">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="andre-border-glow relative rounded-3xl">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--andre-border)] shadow-2xl shadow-cyan-950/30">
          <BeamsCollision className="px-6 py-16 lg:px-16 lg:py-24 text-center bg-[linear-gradient(180deg,hsl(215_25%_8%),hsl(220_22%_5%))]">
            <div className="relative z-10">
              <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-[var(--andre-primary)]">
                Último passo
              </p>
              <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl andre-display leading-[1.02] text-white">
                Seu ar merece um técnico
                <br className="hidden sm:block" /> que atende o telefone.
              </h2>
              <p className="mt-4 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Manda uma foto do aparelho no WhatsApp. Em minutos você recebe
                um orçamento honesto — sem enrolação, sem taxa escondida.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-magnetic
                  className="andre-btn-primary inline-flex items-center gap-2 h-12 px-7 rounded-xl text-[15px]"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Chamar no WhatsApp
                </a>
                <a
                  href={telLink()}
                  className="andre-btn-ghost inline-flex items-center gap-2 h-12 px-7 rounded-xl text-[15px] font-bold"
                >
                  <Phone className="h-5 w-5 text-[var(--andre-primary)]" />
                  {ANDRE_CONFIG.phone}
                </a>
              </div>

              <p className="mt-7 font-tech text-[10px] uppercase tracking-[0.2em] text-slate-500">
                {ANDRE_CONFIG.emergencyText}
              </p>
            </div>
          </BeamsCollision>
          </div>
        </div>
      </div>
    </section>
  );
}
