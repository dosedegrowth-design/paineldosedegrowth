import { Check } from "lucide-react";
import { waLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";
import { RevealSection } from "./tilt-card";

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
      className="relative py-20 lg:py-28 bg-white border-y border-slate-200"
    >
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="max-w-2xl mx-auto text-center mb-12 lg:mb-14">
          <span className="andre-chip">Preços transparentes</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[2.7rem] font-black leading-tight tracking-tight text-slate-900">
            Preço fechado{" "}
            <span className="andre-gradient-text">antes da visita</span>.
          </h2>
          <p className="mt-4 text-slate-600 text-base leading-relaxed">
            Valores base — o orçamento exato sai em minutos no WhatsApp,
            conforme modelo e local. Sem surpresa na hora de pagar.
          </p>
        </RevealSection>

        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`andre-card p-7 flex flex-col relative ${
                p.featured ? "ring-2 ring-sky-500 shadow-xl shadow-sky-100" : ""
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-600 to-cyan-500 text-white text-[11px] font-bold px-3 py-1 shadow">
                  MAIS PEDIDO
                </span>
              )}
              <h3 className="text-base font-extrabold text-slate-900">
                {p.name}
              </h3>
              <p className="mt-3 text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                {p.prefix}
              </p>
              <p className="text-4xl font-black tracking-tight text-slate-900">
                {p.price}
              </p>
              <p className="mt-2 text-sm text-slate-600">{p.desc}</p>
              <ul className="mt-5 space-y-2.5 flex-1">
                {p.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                    {it}
                  </li>
                ))}
              </ul>
              <a
                href={waLink(p.message)}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-6 inline-flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all ${
                  p.featured ? "andre-btn-primary" : "andre-btn-ghost"
                }`}
              >
                <WhatsAppIcon className={`h-4 w-4 ${p.featured ? "" : "text-green-600"}`} />
                Pedir orçamento exato
              </a>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Visita técnica gratuita mediante execução do serviço · Pagamento em
          dinheiro, Pix ou cartão
        </p>
      </div>
    </section>
  );
}
