import Link from "next/link";
import {
  MoveRight,
  Cable,
  Wind,
  Wrench,
  HeartPulse,
  Factory,
  FlaskConical,
  Store,
  Home,
  Warehouse,
  Phone,
} from "lucide-react";
import { Chapter } from "./chapter";
import { RevealSection, TiltCard } from "./tilt-card";
import { ANDRE_CONFIG, waLink, telLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";

/* Blocos-resumo da home institucional — cada um apresenta a página
   correspondente e leva pra ela. */

export function EmpresaTeaser() {
  return (
    <section className="relative py-16 lg:py-28">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <RevealSection>
            <Chapter n="01" label="A empresa" />
            <h2 className="mt-4 text-4xl sm:text-5xl andre-display leading-[1.02] text-white">
              Quatro décadas de{" "}
              <span className="andre-gradient-text">clima sob controle</span>.
            </h2>
            <p className="mt-5 text-slate-300 text-base sm:text-lg leading-relaxed">
              Desde <strong className="text-white">1985</strong>, a Climafrio
              desenvolve soluções de climatização pra indústrias, hotéis,
              hospitais, comércio e residências em São Paulo.
            </p>
            <Link
              href="/andre/empresa"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[var(--andre-primary)] hover:text-cyan-300 transition-colors group"
            >
              Conheça a história, missão e valores
              <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </RevealSection>
          <RevealSection className="grid grid-cols-3 gap-3">
            {[
              ["1985", "ano de fundação"],
              ["8", "linhas de produto"],
              ["6", "marcas parceiras"],
            ].map(([v, l]) => (
              <div key={l} className="andre-card p-5 text-center">
                <p className="text-3xl lg:text-4xl font-black text-white tabular-nums">
                  {v}
                </p>
                <p className="mt-1 text-[11px] text-slate-400 leading-snug">
                  {l}
                </p>
              </div>
            ))}
          </RevealSection>
        </div>
      </div>
    </section>
  );
}

const solucoesDestaque = [
  {
    icon: Cable,
    title: "Projetos",
    desc: "Carga térmica, especificação e projeto executivo pra obra e retrofit.",
  },
  {
    icon: Wind,
    title: "Instalação",
    desc: "Do Split ao Chiller, com materiais originais e equipe própria.",
  },
  {
    icon: Wrench,
    title: "Manutenção",
    desc: "Planos preventivos e corretivos pra operação que não pode parar.",
  },
];

export function SolucoesTeaser() {
  return (
    <section className="relative py-16 lg:py-28 bg-white/[0.02] border-y border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <Chapter n="02" label="Soluções" />
            <h2 className="mt-4 text-4xl sm:text-5xl andre-display leading-[1.02] text-white">
              Do projeto à manutenção,{" "}
              <span className="andre-gradient-text">ciclo completo</span>.
            </h2>
          </div>
          <Link
            href="/andre/solucoes"
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--andre-primary)] hover:text-cyan-300 transition-colors group shrink-0"
          >
            Todas as soluções
            <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </RevealSection>

        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {solucoesDestaque.map((s, i) => (
            <TiltCard key={s.title} delay={i * 0.07} className="andre-card p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-md shadow-sky-900/60 mb-4">
                <s.icon className="h-5 w-5 text-white" />
              </span>
              <h3 className="andre-display text-xl text-white">{s.title}</h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {s.desc}
              </p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}

const segmentosChips = [
  { icon: HeartPulse, label: "Hospitalar" },
  { icon: Factory, label: "Industrial" },
  { icon: FlaskConical, label: "Sala limpa" },
  { icon: Store, label: "Comercial" },
  { icon: Home, label: "Residencial" },
  { icon: Warehouse, label: "Galpões" },
];

export function SegmentosTeaser() {
  return (
    <section className="relative py-16 lg:py-28">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 text-center">
        <RevealSection>
          <Chapter n="03" label="Segmentos" />
          <h2 className="mt-4 text-4xl sm:text-5xl andre-display leading-[1.02] text-white">
            Cada ambiente exige{" "}
            <span className="andre-gradient-text">uma engenharia</span>.
          </h2>
        </RevealSection>
        <RevealSection className="mt-9 flex flex-wrap justify-center gap-3">
          {segmentosChips.map((s) => (
            <Link
              key={s.label}
              href="/andre/segmentos"
              className="andre-card inline-flex items-center gap-2.5 px-5 py-3 hover:border-sky-400/40 transition-colors"
            >
              <s.icon className="h-4.5 w-4.5 text-sky-400" />
              <span className="text-sm font-bold text-slate-200">
                {s.label}
              </span>
            </Link>
          ))}
        </RevealSection>
        <RevealSection className="mt-8">
          <Link
            href="/andre/segmentos"
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--andre-primary)] hover:text-cyan-300 transition-colors group"
          >
            Ver todos os segmentos
            <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </RevealSection>
      </div>
    </section>
  );
}

export function ContatoBand() {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="andre-card px-6 py-10 lg:px-12 lg:py-12 text-center">
          <h2 className="text-3xl sm:text-4xl andre-display leading-[1.05] text-white">
            Vamos falar sobre{" "}
            <span className="andre-gradient-text">o seu projeto</span>?
          </h2>
          <p className="mt-3 text-slate-400 text-base max-w-xl mx-auto">
            Equipe técnica própria, resposta com orçamento e prazo.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
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
            <Link
              href="/andre/contato"
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--andre-primary)] hover:text-cyan-300 transition-colors group px-3"
            >
              Página de contato
              <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
