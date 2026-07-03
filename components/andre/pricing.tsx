import { Check } from "lucide-react";
import { waLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";
import { RevealSection, TiltCard } from "./tilt-card";
import { Chapter } from "./chapter";
import { Watermark } from "./site-frame";

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
      className="relative py-24 lg:py-36 border-y border-white/[0.06] overflow-hidden"
    >
      {/* composição de fundo: luz + tipografia vazada */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 45% at 50% 78%, rgba(34, 211, 238, 0.13), transparent 68%), radial-gradient(40% 32% at 12% 12%, rgba(56, 189, 248, 0.08), transparent 60%)",
          }}
        />
        <Watermark text="ORÇAMENTO" top="4%" />
        <div
          className="absolute inset-x-0 bottom-0 h-40"
          style={{
            background:
              "linear-gradient(0deg, rgba(6,10,20,0.9), transparent)",
          }}
        />
      </div>
      <div className="relative max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="max-w-2xl mx-auto text-center mb-14 lg:mb-20">
          <div className="flex justify-center">
            <Chapter n="06" label="Investimento" />
          </div>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-[3.6rem] andre-display leading-[1.02] text-white">
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
                  className="andre-btn-primary mt-8 inline-flex w-full items-center justify-center gap-2 h-12 px-4 rounded-2xl text-sm whitespace-nowrap"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0" />
                  Pedir orçamento
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
