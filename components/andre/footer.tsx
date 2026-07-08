import { Snowflake, Phone, MapPin, Mail, ShoppingBag } from "lucide-react";
import { WhatsAppIcon } from "./whatsapp-icon";
import { ANDRE_CONFIG, waLink, telLink } from "./config";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#04070f] py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 justify-center md:justify-start">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-md shadow-sky-900/60">
                <Snowflake className="h-4.5 w-4.5 text-white" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-black tracking-tight text-white">
                  {ANDRE_CONFIG.brand}
                </p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-semibold">
                  Soluções em climatização · desde 1985
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-md mx-auto md:mx-0">
              Projetos, instalação e manutenção de sistemas de climatização
              pra indústrias, hotéis, hospitais, comércio e residências.
              Quatro décadas de engenharia do clima em São Paulo.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-400">
              <li className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-sky-400 shrink-0" />
                {ANDRE_CONFIG.address} · CEP {ANDRE_CONFIG.cep}
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">
              Contato
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={telLink()}
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-medium"
                >
                  <Phone className="h-4 w-4 text-sky-400" />
                  {ANDRE_CONFIG.phone}
                </a>
              </li>
              <li>
                <a
                  href="tel:08000151011"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-medium"
                >
                  <Phone className="h-4 w-4 text-sky-400" />
                  {ANDRE_CONFIG.phone0800}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${ANDRE_CONFIG.email}`}
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-medium"
                >
                  <Mail className="h-4 w-4 text-sky-400" />
                  {ANDRE_CONFIG.email}
                </a>
              </li>
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
                  href={ANDRE_CONFIG.lojaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-medium"
                >
                  <ShoppingBag className="h-4 w-4 text-sky-400" />
                  Loja virtual
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">
              Institucional
            </p>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li><a href="#empresa" className="hover:text-white transition-colors">A empresa</a></li>
              <li><a href="#servicos" className="hover:text-white transition-colors">Soluções</a></li>
              <li><a href="#produtos" className="hover:text-white transition-colors">Linhas de produto</a></li>
              <li><a href="#segmentos" className="hover:text-white transition-colors">Segmentos</a></li>
              <li><a href="#marcas" className="hover:text-white transition-colors">Marcas parceiras</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Dúvidas frequentes</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 font-tech text-[10px] uppercase tracking-[0.22em] text-[var(--andre-muted)]">
          <p>
            © {new Date().getFullYear()} {ANDRE_CONFIG.brand} · CNPJ{" "}
            {ANDRE_CONFIG.cnpj}
          </p>
          <p>Desde 1985 · São Paulo/SP</p>
        </div>
      </div>
    </footer>
  );
}
