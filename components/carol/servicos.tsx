import {
  Camera,
  Clapperboard,
  Film,
  Lightbulb,
  Mic,
  PackageOpen,
  Plane,
  Quote,
  ScrollText,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "./reveal";
import { SERVICOS } from "./site-data";

const ICONES: Record<string, LucideIcon> = {
  Camera,
  Clapperboard,
  Film,
  Lightbulb,
  Mic,
  PackageOpen,
  Plane,
  Quote,
  ScrollText,
  Sparkles,
};

export function CarolServicos() {
  return (
    <section id="servicos" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <p className="carol-eyebrow">Serviços</p>
          <h2 className="carol-display mt-4 text-4xl text-[var(--carol-ink)] md:text-5xl">
            Tudo que a sua marca precisa,{" "}
            <span className="carol-display-italic text-[var(--carol-accent-deep)]">
              em uma só creator
            </span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICOS.map((s, i) => {
            const Icone = ICONES[s.icone] ?? Sparkles;
            return (
              <Reveal key={s.titulo} delay={(i % 3) * 0.06}>
                <div className="carol-card group h-full p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--carol-accent-soft)] text-[var(--carol-accent-deep)] transition-colors duration-300 group-hover:bg-[var(--carol-accent)] group-hover:text-white">
                    <Icone className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-[16px] font-bold text-[var(--carol-ink)]">
                    {s.titulo}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--carol-muted)]">
                    {s.texto}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
