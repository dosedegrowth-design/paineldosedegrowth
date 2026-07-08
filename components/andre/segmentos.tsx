import Link from "next/link";
import {
  HeartPulse,
  Factory,
  FlaskConical,
  Store,
  Home,
  Warehouse,
  Users,
  Server,
  MoveRight,
  type LucideIcon,
} from "lucide-react";
import { RevealSection, TiltCard } from "./tilt-card";
import { SectionFX } from "./section-fx";
import { SEGMENTOS_DATA } from "./site-data";

/* As 8 aplicações do site climafrio.com.br, cada card levando pra
   página de detalhe do segmento. */

const icones: Record<string, LucideIcon> = {
  hospitalar: HeartPulse,
  industrial: Factory,
  "sala-limpa": FlaskConical,
  comercial: Store,
  residencial: Home,
  ambientes: Users,
  galpoes: Warehouse,
  "salas-climatizadas": Server,
};

export function Segmentos() {
  return (
    <section
      id="segmentos"
      className="relative py-16 lg:py-28 bg-white/[0.02] border-y border-white/[0.06]"
    >
      <SectionFX aurora grid flakes={10} />
      <div className="relative max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-[3.6rem] andre-display leading-[1.02] text-white">
            Cada ambiente exige{" "}
            <span className="andre-gradient-text">uma engenharia</span>.
          </h2>
          <p className="mt-4 text-slate-300 text-base leading-relaxed">
            De um centro cirúrgico a um galpão logístico, projetamos a
            climatização em torno da exigência de cada operação.
          </p>
        </RevealSection>

        <div className="mt-10 lg:mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {SEGMENTOS_DATA.map((s, i) => {
            const Icon = icones[s.slug] ?? Store;
            return (
              <TiltCard key={s.slug} delay={i * 0.05} className="andre-card">
                <Link
                  href={`/andre/segmentos/${s.slug}`}
                  className="p-6 flex flex-col h-full group"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-md shadow-sky-900/60 mb-4">
                    <Icon className="h-5 w-5 text-white" />
                  </span>
                  <h3 className="andre-display text-xl text-white leading-tight">
                    {s.nome}
                  </h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed flex-1">
                    {s.resumo}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--andre-primary)]">
                    Saiba mais
                    <MoveRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
