import Link from "next/link";
import {
  AirVent,
  PanelTop,
  Layers,
  Network,
  Building2,
  Boxes,
  Container,
  Snowflake,
  ShoppingBag,
  MoveRight,
} from "lucide-react";
import { RevealSection, TiltCard } from "./tilt-card";
import { ANDRE_CONFIG } from "./config";

/* As 8 linhas de produto do site climafrio.com.br, com descrições
   institucionais de uma linha cada. */

const linhas = [
  {
    icon: AirVent,
    name: "Split",
    slug: "split",
    desc: "A linha clássica pra ambientes residenciais e comerciais de pequeno porte.",
  },
  {
    icon: PanelTop,
    name: "Hi Wall",
    slug: "hi-wall",
    desc: "Evaporadora de parede compacta, silenciosa e de instalação versátil.",
  },
  {
    icon: Layers,
    name: "Multi Split",
    slug: "multi-split",
    desc: "Vários ambientes climatizados com uma única unidade condensadora.",
  },
  {
    icon: Network,
    name: "Multi V",
    slug: "multi-v",
    desc: "Sistema VRF da LG pra edifícios com controle individual por zona.",
  },
  {
    icon: Building2,
    name: "VRF",
    slug: "vrf",
    desc: "Vazão de refrigerante variável — eficiência pra médios e grandes edifícios.",
  },
  {
    icon: Boxes,
    name: "VRV",
    slug: "vrv",
    desc: "A tecnologia Daikin de volume variável pra projetos corporativos.",
  },
  {
    icon: Container,
    name: "Self Contained",
    slug: "self-contained",
    desc: "Climatização robusta pra grandes áreas, data centers e lojas.",
  },
  {
    icon: Snowflake,
    name: "Chiller",
    slug: "chiller",
    desc: "Água gelada pra plantas industriais, hospitais e shopping centers.",
  },
];

export function Produtos() {
  return (
    <section id="produtos" className="relative py-16 lg:py-36">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="max-w-2xl mx-auto text-center lg:mx-0 lg:text-left">
          <h2 className=" text-4xl sm:text-5xl lg:text-[3.6rem] andre-display leading-[1.02] text-white">
            Do Split ao Chiller,{" "}
            <span className="andre-gradient-text">a linha completa</span>.
          </h2>
          <p className="mt-4 text-slate-300 text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
            Oito linhas de equipamentos pra climatizar de um quarto a uma
            planta industrial — sempre com a marca e o porte certos pro
            projeto.
          </p>
        </RevealSection>

        <div className="mt-10 lg:mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {linhas.map((l, i) => (
            <TiltCard key={l.name} delay={i * 0.05} className="andre-card">
              <Link
                href={`/andre/produtos/${l.slug}`}
                className="p-5 lg:p-6 flex flex-col h-full group"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 border border-sky-400/25 mb-4">
                  <l.icon className="h-5 w-5 text-sky-400" />
                </span>
                <h3 className="andre-display text-lg text-white leading-tight">
                  {l.name}
                </h3>
                <p className="text-[13px] text-slate-400 mt-1.5 leading-relaxed flex-1">
                  {l.desc}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--andre-primary)]">
                  Saiba mais
                  <MoveRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </TiltCard>
          ))}
        </div>

        <RevealSection className="mt-8 lg:mt-10">
          <div className="andre-card px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-300 text-center sm:text-left">
              <span className="font-bold text-white">
                Peças e equipamentos também na loja virtual
              </span>{" "}
              — catálogo completo com entrega pra todo o Brasil.
            </p>
            <a
              href={ANDRE_CONFIG.lojaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="andre-btn-ghost inline-flex items-center gap-2 h-11 px-5 rounded-sm text-sm shrink-0 group"
            >
              <ShoppingBag className="h-4 w-4 text-[var(--andre-primary)]" />
              Visitar loja virtual
              <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
