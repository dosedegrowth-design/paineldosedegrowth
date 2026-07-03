import { ClipboardCheck, Wrench, Sparkles } from "lucide-react";
import { waLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";
import { RevealSection } from "./tilt-card";

const steps = [
  {
    n: "01",
    icon: WhatsAppIcon,
    title: "Você fala no WhatsApp",
    desc: "Manda foto, modelo ou só descreve o problema. Em minutos você tem um retorno técnico.",
  },
  {
    n: "02",
    icon: ClipboardCheck,
    title: "Recebe o orçamento",
    desc: "Preço fechado antes da visita. Sem surpresa, sem taxa escondida.",
  },
  {
    n: "03",
    icon: Wrench,
    title: "Técnico agendado",
    desc: "Escolhe o melhor dia e horário. Chegamos no horário combinado, com uniforme e ferramenta.",
  },
  {
    n: "04",
    icon: Sparkles,
    title: "Ar funcionando",
    desc: "Serviço testado, nota fiscal emitida e 90 dias de garantia. Você paga só se aprovar.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="relative py-20 lg:py-28 border-y border-white/[0.06] overflow-hidden"
      style={{ background: "rgba(7, 12, 24, 0.6)" }}
    >
      <div className="andre-bg andre-bg-stream">
        <span className="stream-line l1" />
        <span className="stream-line l2" />
        <span className="stream-line l3" />
        <span className="stream-line l4" />
        <span className="stream-line l5" />
        <span className="stream-line l6" />
        {(["f1", "f2", "f3", "f4"] as const).map((k) => (
          <svg key={k} className={`stream-flake ${k}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="2" x2="22" y1="12" y2="12" />
            <line x1="12" x2="12" y1="2" y2="22" />
            <path d="m20 16-4-4 4-4" />
            <path d="m4 8 4 4-4 4" />
            <path d="m16 4-4 4-4-4" />
            <path d="m8 20 4-4 4 4" />
          </svg>
        ))}
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="max-w-2xl mb-12">
          <span className="andre-chip">Como funciona</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
            Do WhatsApp ao{" "}
            <span className="andre-gradient-text">ar funcionando</span> em
            poucos passos.
          </h2>
        </RevealSection>

        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <li key={s.n} className="relative">
              <div className="andre-card p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-4xl font-black leading-none tracking-tight"
                    style={{ color: "rgba(125, 211, 252, 0.35)" }}
                  >
                    {s.n}
                  </span>
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{
                      background: "rgba(56,189,248,0.10)",
                      border: "1px solid rgba(56,189,248,0.25)",
                    }}
                  >
                    <s.icon
                      className="h-4.5 w-4.5"
                      style={{ color: "#7dd3fc" }}
                    />
                  </span>
                </div>
                <h3 className="text-base font-bold text-white leading-tight">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  {s.desc}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute top-1/2 -right-2 h-px w-4"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(125,211,252,0.4), transparent)",
                  }}
                />
              )}
            </li>
          ))}
        </ol>

        <div className="mt-12 flex justify-center">
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="andre-btn-primary inline-flex items-center gap-2 h-12 px-6 rounded-lg text-[15px]"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Chamar André no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
