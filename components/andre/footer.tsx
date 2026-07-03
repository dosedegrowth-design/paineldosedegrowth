import { Snowflake, Phone, MapPin, Clock } from "lucide-react";
import { WhatsAppIcon } from "./whatsapp-icon";
import { ANDRE_CONFIG, waLink, telLink } from "./config";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#04070f] py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-md shadow-sky-900/60">
                <Snowflake className="h-4.5 w-4.5 text-white" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-black tracking-tight text-white">
                  {ANDRE_CONFIG.brand}
                </p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-semibold">
                  Ar condicionado · SP
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-md">
              {ANDRE_CONFIG.tagline} Atendendo residencial, comercial e
              industrial em São Paulo e Grande SP há{" "}
              {ANDRE_CONFIG.yearsExperience} anos.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">
              Contato
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-medium"
                >
                  <WhatsAppIcon className="h-4 w-4 text-green-600" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={telLink()}
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-medium"
                >
                  <Phone className="h-4 w-4 text-sky-400" />
                  {ANDRE_CONFIG.phone}
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-slate-400">
                <MapPin className="h-4 w-4 text-sky-400" />
                {ANDRE_CONFIG.city}
              </li>
              <li className="inline-flex items-center gap-2 text-slate-400">
                <Clock className="h-4 w-4 text-sky-400" />
                Seg a Sáb · 8h às 20h
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">
              Serviços
            </p>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li><a href="#servicos" className="hover:text-white transition-colors">Instalação</a></li>
              <li><a href="#servicos" className="hover:text-white transition-colors">Manutenção preventiva</a></li>
              <li><a href="#servicos" className="hover:text-white transition-colors">Higienização</a></li>
              <li><a href="#servicos" className="hover:text-white transition-colors">Recarga de gás</a></li>
              <li><a href="#precos" className="hover:text-white transition-colors">Preços</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 font-tech text-[10px] uppercase tracking-[0.22em] text-[var(--andre-muted)]">
          <p>
            © {new Date().getFullYear()} {ANDRE_CONFIG.brand}. Todos os
            direitos reservados.
          </p>
          <p>Orçamento grátis · Garantia 90 dias · Nota fiscal</p>
        </div>
      </div>
    </footer>
  );
}
