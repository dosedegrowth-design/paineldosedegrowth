import { Check } from "lucide-react";
import { waLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";
import { RevealSection, TiltCard } from "./tilt-card";
import { Chapter } from "./chapter";

const plans = [
  {
    name: "Higienização",
    price: "R$ 190",
    prefix: "a partir de",
    desc: "Ar com cheiro de novo e saúde no ambiente.",
    items: [
      "Limpeza de serpentina e hélice",
      "Produto bactericida e antifúngico",
      "Desobstrução do dreno",
      "Coleta dos resíduos",
    ],
    message: "Olá, André! Quero um orçamento de higienização.",
    featured: false,
  },
  {
    name: "Instalação Split",
    price: "R$ 380",
    prefix: "a partir de",
    desc: "9.000 a 12.000 BTU com material incluso básico.",
    items: [
      "Suporte, vácuo e teste completo",
      "Tubulação frigorígena até 3m",
      "Nivelamento e acabamento",
      "Nota fiscal + garantia 90 dias",
    ],
    message: "Olá, André! Quero um orçamento de instalação de split.",
    featured: true,
  },
  {
    name: "Manutenção",
    price: "R$ 150",
    prefix: "a partir de",
    desc: "Check-up que evita a quebra do compressor.",
    items: [
      "Diagnóstico técnico com laudo",
      "Verificação de gás e pressões",
      "Limpeza de filtros",
      "Relatório assinado",
    ],
    message: "Olá, André! Quero agendar uma manutenção.",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section
      id="precos"
      className="relative py-24 lg:py-36 bg-white/[0.02] border-y border-white/[0.06]"
    >
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="max-w-2xl mx-auto text-center mb-14 lg:mb-20">
          <div className="flex justify-center">
            <Chapter n="06" label="Investimento" />
          </div>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-[3.6rem] font-black leading-tight tracking-tight text-white">
            Preço fechado{" "}
            <span className="andre-gradient-text">antes da visita</span>.
          </h2>
          <p className="mt-4 text-slate-300 text-base leading-relaxed">
            Valores base — o orçamento exato sai em minutos no WhatsApp.
            Sem surpresa na hora de pagar.
          </p>
        </RevealSection>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-5 items-stretch lg:items-center">
          {plans.map((p, i) => (
            <div
              key={p.name}
              className={
                p.featured
                  ? "relative z-10 lg:scale-[1.06] lg:-translate-y-2"
                  : ""
              }
            >
              <TiltCard
                delay={i * 0.08}
                intensity={4}
                className={`p-8 flex flex-col relative rounded-3xl h-full ${
                  p.featured
                    ? "andre-card-featured andre-border-glow"
                    : "andre-card"
                }`}
              >
                {/* cabeçalho: título + selo lado a lado, sem sobreposição */}
                <div className="flex items-center justify-between gap-3">
                  <h3
                    className={`text-[15px] font-extrabold uppercase tracking-[0.14em] ${
                      p.featured ? "text-cyan-300" : "text-slate-300"
                    }`}
                  >
                    {p.name}
                  </h3>
                  {p.featured && (
                    <span className="shrink-0 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 text-[#04222e] text-[10px] font-black tracking-wider px-3 py-1.5 shadow-lg shadow-cyan-500/30">
                      MAIS PEDIDO
                    </span>
                  )}
                </div>

                <div className="mt-6 flex items-baseline gap-2">
                  <p className="text-5xl lg:text-[3.4rem] font-black tracking-tight text-white leading-none">
                    {p.price}
                  </p>
                </div>
                <p className="mt-1.5 text-[11px] uppercase tracking-[0.18em] font-bold text-slate-500">
                  {p.prefix} · serviço completo
                </p>

                <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                  {p.desc}
                </p>

                <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                <ul className="space-y-3 flex-1">
                  {p.items.map((it) => (
                    <li
                      key={it}
                      className="flex items-start gap-2.5 text-sm text-slate-300"
                    >
                      <span
                        className={`mt-0.5 inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full ${
                          p.featured ? "bg-cyan-400/20" : "bg-sky-400/10"
                        }`}
                      >
                        <Check className="h-3 w-3 text-sky-400" />
                      </span>
                      {it}
                    </li>
                  ))}
                </ul>

                <a
                  href={waLink(p.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-8 inline-flex items-center justify-center gap-2 h-12 rounded-2xl text-sm font-bold transition-all ${
                    p.featured ? "andre-btn-primary" : "andre-btn-ghost"
                  }`}
                >
                  <WhatsAppIcon
                    className={`h-4 w-4 ${p.featured ? "" : "text-green-500"}`}
                  />
                  Pedir orçamento exato
                </a>
              </TiltCard>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-slate-500">
          Visita técnica gratuita mediante execução do serviço · Dinheiro, Pix
          ou cartão
        </p>
      </div>
    </section>
  );
}
