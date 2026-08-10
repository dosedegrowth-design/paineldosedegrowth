import { Reveal } from "./reveal";
import { UGC_STATS } from "./site-data";

export function CarolUgcStats() {
  return (
    <section id="ugc" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="carol-eyebrow">Por que UGC</p>
          <h2 className="carol-display mt-4 text-4xl text-[var(--carol-ink)] md:text-5xl">
            O formato em que o público{" "}
            <span className="carol-display-italic text-[var(--carol-accent-deep)]">
              confia de verdade
            </span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-[var(--carol-muted)]">
            Não é tendência, é comportamento de consumo: conteúdo com cara de
            gente real converte mais do que publicidade tradicional.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {UGC_STATS.map((s, i) => (
            <Reveal key={s.valor} delay={i * 0.08}>
              <div className="carol-card flex h-full flex-col p-7">
                <p className="carol-display text-5xl text-[var(--carol-accent)]">
                  {s.valor}
                </p>
                <p className="mt-4 text-[13.5px] leading-relaxed text-[var(--carol-muted)]">
                  {s.texto}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-[11px] text-[var(--carol-muted)]/70">
          Dados de estudos de mercado sobre user-generated content.
        </p>
      </div>
    </section>
  );
}
