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
import { SectionFX } from "./section-fx";
import { RevealSection, TiltCard } from "./tilt-card";
import { ANDRE_CONFIG, waLink, telLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";

/* Blocos-resumo da home institucional — cada um apresenta a página
   correspondente e leva pra ela. */

export function EmpresaTeaser() {
  return (
    <section className="relative py-16 lg:py-28">
      <SectionFX aurora stars={7} />
      <div className="relative max-w-6xl mx-auto px-5 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <RevealSection className="text-center lg:text-center">
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
          <RevealSection>
            <div className="andre-card overflow-hidden">
              <div className="relative aspect-[16/9]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/andre/servicos/ambiente.jpg"
                  alt="Ar-condicionado split instalado em ambiente residencial"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1018]/80 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-0 right-0 text-center font-tech text-[9.5px] uppercase tracking-[0.28em] text-slate-200">
                  Instalação entregue · acabamento limpo
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                ["1985", "ano de fundação"],
                ["8", "linhas de produto"],
                ["6", "marcas parceiras"],
              ].map(([v, l]) => (
                <div key={l} className="andre-card p-4 text-center">
                  <p className="text-2xl lg:text-3xl font-black text-white tabular-nums">
                    {v}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400 leading-snug">
                    {l}
                  </p>
                </div>
              ))}
            </div>
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
    foto: "/andre/servicos/projetos.jpg",
    desc: "Carga térmica, especificação e projeto executivo pra obra e retrofit.",
  },
  {
    icon: Wind,
    title: "Instalação",
    foto: "/andre/servicos/instalacao.jpg",
    desc: "Do Split ao Chiller, com materiais originais e equipe própria.",
  },
  {
    icon: Wrench,
    title: "Manutenção",
    foto: "/andre/servicos/manutencao.jpg",
    desc: "Planos preventivos e corretivos pra operação que não pode parar.",
  },
];

export function SolucoesTeaser() {
  return (
    <section className="relative py-16 lg:py-28 bg-white/[0.02] border-y border-white/[0.06]">
      <SectionFX grid stars={6} />
      <div className="relative max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="flex flex-col items-center text-center gap-4">
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
            <TiltCard key={s.title} delay={i * 0.07} className="andre-card overflow-hidden">
              <div className="relative aspect-[16/9] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.foto}
                  alt={s.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1018] via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-md shadow-sky-900/60">
                  <s.icon className="h-5 w-5 text-white" />
                </span>
              </div>
              <div className="p-6 pt-4 text-center">
                <h3 className="andre-display text-xl text-white">{s.title}</h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {s.desc}
                </p>
              </div>
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
      <SectionFX aurora flip flakes={8} />
      <div className="relative max-w-6xl mx-auto px-5 lg:px-8 text-center">
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
      <SectionFX stars={8} />
      <div className="relative max-w-6xl mx-auto px-5 lg:px-8">
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
