import {
  Wrench,
  Wind,
  Sparkles,
  Cable,
  Droplets,
  MoveRight,
} from "lucide-react";
import { waLink } from "./config";
import { Chapter } from "./chapter";
import { RevealSection, TiltCard } from "./tilt-card";
import { HeroCanvasClient } from "./hero-canvas-client";
import { WhatsAppIcon } from "./whatsapp-icon";

const services = [
  {
    icon: Cable,
    title: "Engenharia que dimensiona",
    code: "01 / PROJETOS",
    desc: "Cálculo de carga térmica, especificação e projeto executivo pra obras novas e retrofit.",
    cta: "Falar sobre um projeto",
    message: "Olá! Gostaria de falar sobre um projeto de climatização.",
  },
  {
    icon: Wind,
    title: "Precisão cirúrgica",
    code: "02 / INSTALAÇÃO",
    desc: "Split, Multi Split, VRF, VRV, Self Contained e Chiller — com materiais originais.",
    cta: "Solicitar orçamento",
    message: "Olá! Quero um orçamento de instalação de ar condicionado.",
  },
  {
    icon: Wrench,
    title: "Longevidade garantida",
    code: "03 / MANUTENÇÃO",
    desc: "Planos preventivos e corretivos que evitam paradas e reduzem o consumo de energia.",
    cta: "Conhecer os planos",
    message: "Olá! Quero saber sobre planos de manutenção.",
  },
  {
    icon: Sparkles,
    title: "Ar de montanha",
    code: "04 / HIGIENIZAÇÃO",
    desc: "Limpeza de serpentina, hélice e dreno. Elimina bactérias, mofo e mau cheiro.",
    cta: "Agendar higienização",
    message: "Olá! Preciso de higienização do ar condicionado.",
  },
  {
    icon: Droplets,
    title: "Pressão exata",
    code: "05 / RECARGA",
    desc: "R-410A, R-32 e R-22. Detecção de vazamento e teste de estanqueidade antes da carga.",
    cta: "Verificar meu sistema",
    message: "Olá! Meu ar não gela, preciso verificar o gás.",
  },
  {
    icon: MoveRight,
    title: "Diagnóstico real",
    code: "06 / REPARO",
    desc: "Placa, capacitor, sensor, ventilador. Diagnóstico com laudo técnico antes da troca.",
    cta: "Solicitar diagnóstico",
    message: "Olá! Meu ar condicionado quebrou, preciso de reparo.",
  },
];

export function Services() {
  return (
    <section id="servicos" className="relative py-16 lg:py-36">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        {/* header 2 colunas: texto + palco 3D interativo */}
        <div className="grid lg:grid-cols-2 gap-8 items-center mb-9 lg:mb-16">
          <RevealSection className="max-w-2xl mx-auto text-center lg:mx-0 lg:text-left">
            <Chapter n="02" label="Soluções" />
            <h2 className="mt-4 text-4xl sm:text-5xl lg:text-[3.6rem] andre-display leading-[1.02] text-white">
              Do projeto à manutenção,{" "}
              <span className="andre-gradient-text">ciclo completo</span>.
            </h2>
            <p className="mt-4 text-slate-300 text-base leading-relaxed">
              A Climafrio acompanha o sistema por toda a vida útil: especifica,
              instala, mantém e responde quando você precisa.
            </p>
          </RevealSection>
          <div className="relative h-[300px] sm:h-[360px] lg:h-[420px]">
            <div className="andre-hero-product-glow" aria-hidden />
            <HeroCanvasClient />
            <p className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 font-tech text-[9.5px] uppercase tracking-[0.3em] text-[var(--andre-muted)] whitespace-nowrap">
              Unidade 3D · a névoa responde ao seu scroll
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {services.map((s, i) => (
            <TiltCard key={s.title} delay={i * 0.06} className="andre-card p-6 flex flex-col relative">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-md shadow-sky-900/60 mb-4">
                <s.icon className="h-5 w-5 text-white" />
              </span>
              <p className="font-tech text-[10px] tracking-[0.24em] text-[var(--andre-primary)] mb-2">
                {s.code}
              </p>
              <h3 className="andre-display text-xl text-white leading-tight">
                {s.title}
              </h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed flex-1">
                {s.desc}
              </p>
              <a
                href={waLink(s.message)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-green-400 hover:text-green-300 transition-colors group"
              >
                <WhatsAppIcon className="h-4 w-4 shrink-0" />
                {s.cta}
                <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
