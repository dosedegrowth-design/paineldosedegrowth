import { Target, Eye, Handshake } from "lucide-react";
import { RevealSection, TiltCard } from "./tilt-card";

/* Seção institucional — história, missão, visão e valores.
   Textos de missão/visão/valores são os oficiais do site climafrio.com.br. */

const mvv = [
  {
    icon: Target,
    title: "Missão",
    text: "Oferecer a solução ideal de climatização e exercer excelência no atendimento aos clientes.",
  },
  {
    icon: Eye,
    title: "Visão",
    text: "Ser empresa de referência, reconhecida como melhor opção por clientes, colaboradores e fornecedores, pela qualidade de nossos produtos, serviços e relacionamento.",
  },
  {
    icon: Handshake,
    title: "Valores",
    text: "Integridade e honestidade. Empenho e qualidade para com clientes, colaboradores e fornecedores. Responsabilidade e comprometimento.",
  },
];

export function Empresa() {
  return (
    <section id="empresa" className="relative py-16 lg:py-36">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <RevealSection className="max-w-2xl mx-auto text-center lg:mx-0 lg:text-left">
            <h2 className=" text-4xl sm:text-5xl lg:text-[3.6rem] andre-display leading-[1.02] text-white">
              Quatro décadas de{" "}
              <span className="andre-gradient-text">clima sob controle</span>.
            </h2>
            <p className="mt-6 text-slate-300 text-base sm:text-lg leading-relaxed">
              Desde <strong className="text-white">1985</strong>, a Climafrio
              desenvolve soluções de climatização ambiental para indústrias,
              hotéis, hospitais, empreendimentos comerciais e residenciais em
              São Paulo.
            </p>
            <p className="mt-4 text-slate-400 text-base leading-relaxed">
              Do projeto ao pós-obra, cada instalação nasce de engenharia —
              dimensionamento correto, equipamentos das melhores marcas e uma
              equipe que valoriza criatividade, qualidade e trabalho
              colaborativo.
            </p>
            <p className="mt-6 font-tech text-[11px] uppercase tracking-[0.28em] text-[var(--andre-primary)]">
              Desde 1985 · São Paulo/SP
            </p>
          </RevealSection>

          <div className="grid gap-4">
            {mvv.map((m, i) => (
              <TiltCard
                key={m.title}
                delay={i * 0.08}
                className="andre-card p-6 lg:p-7 flex items-start gap-5"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-md shadow-sky-900/60">
                  <m.icon className="h-5 w-5 text-white" />
                </span>
                <div>
                  <h3 className="andre-display text-lg text-white">{m.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
                    {m.text}
                  </p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
