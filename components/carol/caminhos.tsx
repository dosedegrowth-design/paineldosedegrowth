import {
  ArrowRight,
  Flower2,
  MessageCircle,
  Store,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "./reveal";
import { CAMINHOS } from "./site-data";

const ICONES: Record<string, LucideIcon> = { Store, MessageCircle, Flower2 };

/* Triagem que a Carol pediu no áudio: três portas de entrada claras —
   marca, orçamento ou mulher querendo entrar na comunidade. */
export function CarolCaminhos() {
  return (
    <section id="caminhos" className="py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="carol-eyebrow">Por onde começar</p>
          <h2 className="carol-display mt-4 text-3xl text-[var(--carol-ink)] md:text-4xl">
            O que te{" "}
            <span className="carol-display-italic text-[var(--carol-accent-deep)]">
              trouxe até aqui?
            </span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {CAMINHOS.map((c, i) => {
            const Icone = ICONES[c.icone] ?? Flower2;
            return (
              <Reveal key={c.titulo} delay={i * 0.08}>
                <a
                  href={c.href}
                  {...(c.externo
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="carol-card group flex h-full flex-col p-7"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--carol-accent-soft)] text-[var(--carol-accent-deep)] transition-colors duration-300 group-hover:bg-[var(--carol-accent)] group-hover:text-white">
                    <Icone className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-[16px] font-bold leading-snug text-[var(--carol-ink)]">
                    {c.titulo}
                  </h3>
                  <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-[var(--carol-muted)]">
                    {c.texto}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold text-[var(--carol-accent-deep)]">
                    Esse é o meu caso
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
