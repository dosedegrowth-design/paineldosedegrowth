import { Phone } from "lucide-react";
import { ANDRE_CONFIG, waLink, telLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";

export function FinalCTA() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 andre-aurora pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-5 lg:px-8 text-center">
        <span className="andre-chip">Bora resolver?</span>
        <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
          Seu ar merece um técnico{" "}
          <span className="andre-gradient-text">que atende o telefone</span>.
        </h2>
        <p className="mt-5 text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Manda uma foto do seu aparelho no WhatsApp. Em minutos você recebe um
          orçamento honesto — sem enrolação, sem taxa escondida, sem call center.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="andre-btn-primary inline-flex items-center gap-2 h-12 px-7 rounded-lg text-[15px]"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Chamar André no WhatsApp
          </a>
          <a
            href={telLink()}
            className="andre-btn-ghost inline-flex items-center gap-2 h-12 px-7 rounded-lg text-[15px] font-semibold"
          >
            <Phone className="h-5 w-5" style={{ color: "#7dd3fc" }} />
            {ANDRE_CONFIG.phone}
          </a>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          {ANDRE_CONFIG.emergencyText}
        </p>
      </div>
    </section>
  );
}
