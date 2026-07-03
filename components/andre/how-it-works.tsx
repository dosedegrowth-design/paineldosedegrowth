import { ClipboardCheck, Wrench } from "lucide-react";
import { Chapter } from "./chapter";
import { waLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";
import { RevealSection } from "./tilt-card";

const steps = [
  {
    n: "1",
    icon: WhatsAppIcon,
    title: "Chama no WhatsApp",
    desc: "Manda foto ou descreve o problema. Em ~5 minutos você recebe retorno técnico com preço fechado.",
  },
  {
    n: "2",
    icon: ClipboardCheck,
    title: "Agenda o melhor horário",
    desc: "Sem taxa escondida, sem surpresa. Chegamos no horário combinado, com uniforme e ferramenta.",
  },
  {
    n: "3",
    icon: Wrench,
    title: "Ar funcionando, garantido",
    desc: "Serviço testado na sua frente, nota fiscal e 90 dias de garantia. Você só paga se aprovar.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="relative py-24 lg:py-36 bg-white/[0.02] border-y border-white/[0.06]"
    >
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="max-w-2xl mb-12 lg:mb-14">
          <Chapter n="04" label="Como funciona" />
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-[3.6rem] font-black leading-tight tracking-tight text-white">
            Do WhatsApp ao{" "}
            <span className="andre-gradient-text">ar gelando</span> em 3 passos.
          </h2>
        </RevealSection>

        <ol className="grid md:grid-cols-3 gap-5">
          {steps.map((s) => (
            <li key={s.n} className="andre-card p-7 relative overflow-hidden">
              <span className="absolute -top-4 -right-2 text-[7rem] font-black leading-none text-sky-400/10 select-none pointer-events-none">
                {s.n}
              </span>
              <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-400/10 border border-sky-400/25 mb-4">
                <s.icon className="h-5 w-5 text-sky-400" />
              </span>
              <h3 className="relative text-lg font-extrabold text-white">
                {s.title}
              </h3>
              <p className="relative text-sm text-slate-300 mt-2 leading-relaxed">
                {s.desc}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex justify-center">
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="andre-btn-primary inline-flex items-center gap-2 h-12 px-7 rounded-xl text-[15px]"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Começar agora — orçamento grátis
          </a>
        </div>
      </div>
    </section>
  );
}
