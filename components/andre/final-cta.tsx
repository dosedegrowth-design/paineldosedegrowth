import { Phone } from "lucide-react";
import { ANDRE_CONFIG, waLink, telLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";

export function FinalCTA() {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-500 px-6 py-14 lg:px-16 lg:py-20 text-center shadow-2xl shadow-sky-900/40">
          {/* textura sutil */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1.5px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
              Seu ar merece um técnico
              <br className="hidden sm:block" /> que atende o telefone.
            </h2>
            <p className="mt-4 text-sky-50 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Manda uma foto do aparelho no WhatsApp. Em minutos você recebe um
              orçamento honesto — sem enrolação, sem taxa escondida.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-xl text-[15px] font-bold bg-white text-slate-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <WhatsAppIcon className="h-5 w-5 text-green-600" />
                Chamar André no WhatsApp
              </a>
              <a
                href={telLink()}
                className="inline-flex items-center gap-2 h-12 px-7 rounded-xl text-[15px] font-bold text-white border border-white/40 hover:bg-white/10 transition-colors"
              >
                <Phone className="h-5 w-5" />
                {ANDRE_CONFIG.phone}
              </a>
            </div>

            <p className="mt-6 text-xs text-sky-100">
              {ANDRE_CONFIG.emergencyText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
