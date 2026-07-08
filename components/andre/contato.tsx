import { Phone, MapPin, Mail, ShoppingBag } from "lucide-react";
import { ANDRE_CONFIG, waLink, telLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";
import { BeamsCollision } from "./beams-collision";

/* Contato institucional — todos os canais oficiais da Climafrio. */

const canais = [
  {
    icon: MapPin,
    title: "Sede",
    lines: [
      "Rua Padre Adelino, 2074 — Quarta Parada",
      `São Paulo/SP · CEP ${ANDRE_CONFIG.cep}`,
    ],
  },
  {
    icon: Phone,
    title: "Telefones",
    lines: [
      `${ANDRE_CONFIG.phone} — Grande São Paulo`,
      `${ANDRE_CONFIG.phone0800} — demais localidades`,
    ],
  },
  {
    icon: Mail,
    title: "E-mail",
    lines: [ANDRE_CONFIG.email, "Resposta em horário comercial"],
  },
  {
    icon: ShoppingBag,
    title: "Loja virtual",
    lines: ["loja.climafrio.com.br", "Equipamentos e peças pra todo o Brasil"],
  },
];

export function Contato() {
  return (
    <section id="contato" className="relative py-14 lg:py-24">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="andre-border-glow relative rounded-3xl">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--andre-border)] shadow-2xl shadow-cyan-950/30">
            <BeamsCollision className="px-6 py-16 lg:px-16 lg:py-20 text-center bg-[linear-gradient(180deg,hsl(215_25%_8%),hsl(220_22%_5%))]">
              <div className="relative z-10">
                <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-[var(--andre-primary)]">
                  Contato
                </p>
                <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl andre-display leading-[1.02] text-white">
                  Vamos falar sobre
                  <br className="hidden sm:block" /> o seu projeto?
                </h2>
                <p className="mt-4 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                  Da especificação de um sistema VRF à manutenção do split da
                  sala: nossa equipe técnica responde com orçamento e prazo.
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
                    Falar com um especialista
                  </a>
                  <a
                    href={telLink()}
                    className="andre-btn-ghost inline-flex items-center gap-2 h-12 px-7 rounded-xl text-[15px] font-bold"
                  >
                    <Phone className="h-5 w-5 text-[var(--andre-primary)]" />
                    {ANDRE_CONFIG.phone}
                  </a>
                </div>

                <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                  {canais.map((c) => (
                    <div
                      key={c.title}
                      className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"
                    >
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-400/10 border border-sky-400/25 mb-3">
                        <c.icon className="h-4.5 w-4.5 text-sky-400" />
                      </span>
                      <p className="text-sm font-bold text-white">{c.title}</p>
                      {c.lines.map((l) => (
                        <p
                          key={l}
                          className="text-[13px] text-slate-400 mt-1 leading-snug"
                        >
                          {l}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>

                <p className="mt-8 font-tech text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Climafrio · CNPJ {ANDRE_CONFIG.cnpj} · desde 1985
                </p>
              </div>
            </BeamsCollision>
          </div>
        </div>
      </div>
    </section>
  );
}
