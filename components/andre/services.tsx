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

const services = [
  {
    icon: Wind,
    title: "Precisão cirúrgica",
    code: "01 / INSTALAÇÃO",
    desc: "Split, Multi Split, Piso Teto, Cassete e VRF. Materiais originais e nivelamento perfeito.",
    cta: "Quero instalar",
    message: "Olá, André! Quero um orçamento de instalação de ar condicionado.",
  },
  {
    icon: Wrench,
    title: "Longevidade tech",
    code: "02 / MANUTENÇÃO",
    desc: "Check-up completo que evita quebra do compressor e reduz até 30% da conta de luz.",
    cta: "Agendar manutenção",
    message: "Olá, André! Quero agendar uma manutenção preventiva.",
  },
  {
    icon: Sparkles,
    title: "Ar de montanha",
    code: "03 / HIGIENIZAÇÃO",
    desc: "Limpeza de serpentina, hélice e dreno. Elimina bactérias, mofo e mau cheiro.",
    cta: "Higienizar meu ar",
    message: "Olá, André! Preciso de higienização do ar condicionado.",
  },
  {
    icon: Droplets,
    title: "Pressão exata",
    code: "04 / RECARGA",
    desc: "R-410A, R-32 e R-22. Detecção de vazamento e teste de estanqueidade antes da carga.",
    cta: "Verificar gás",
    message: "Olá, André! Meu ar não gela, preciso verificar o gás.",
  },
  {
    icon: Cable,
    title: "Diagnóstico real",
    code: "05 / REPARO",
    desc: "Placa, capacitor, sensor, ventilador. Diagnóstico com laudo antes da troca.",
    cta: "Meu ar quebrou",
    message: "Olá, André! Meu ar condicionado quebrou, preciso de reparo.",
  },
  {
    icon: MoveRight,
    title: "Recomeço sem dano",
    code: "06 / MUDANÇA",
    desc: "Retiramos, transportamos e reinstalamos no endereço novo, sem danificar nada.",
    cta: "Vou mudar de casa",
    message: "Olá, André! Preciso desinstalar/mudar meu ar condicionado.",
  },
];

export function Services() {
  return (
    <section id="servicos" className="relative py-24 lg:py-36">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        {/* header 2 colunas: texto + palco 3D interativo */}
        <div className="grid lg:grid-cols-2 gap-8 items-center mb-12 lg:mb-16">
          <RevealSection className="max-w-2xl">
            <Chapter n="03" label="A solução" />
            <h2 className="mt-4 text-4xl sm:text-5xl lg:text-[3.6rem] andre-display leading-[1.02] text-white">
              Tudo o que seu ar precisa,{" "}
              <span className="andre-gradient-text">com um técnico só</span>.
            </h2>
            <p className="mt-4 text-slate-300 text-base leading-relaxed">
              Do primeiro furo na parede até a manutenção anual. Você fala com
              o André direto — sem call center.
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
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-sky-300 hover:text-sky-200 transition-colors group"
              >
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
