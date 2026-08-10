import { Reveal } from "./reveal";
import { PROCESSO } from "./site-data";

export function CarolProcesso() {
  return (
    <section id="processo" className="bg-[var(--carol-bg-soft)] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <p className="carol-eyebrow">Como funciona</p>
          <h2 className="carol-display mt-4 text-4xl text-[var(--carol-ink)] md:text-5xl">
            Processo claro,{" "}
            <span className="carol-display-italic text-[var(--carol-accent-deep)]">
              do briefing à entrega
            </span>
          </h2>
        </Reveal>

        <ol className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {PROCESSO.map((p, i) => (
            <Reveal key={p.titulo} delay={(i % 3) * 0.07}>
              <li className="relative border-t-2 border-[var(--carol-line)] pt-6 transition-colors hover:border-[var(--carol-accent)]">
                <span className="carol-display-italic absolute -top-5 right-0 text-4xl text-[var(--carol-accent)]/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[16px] font-bold text-[var(--carol-ink)]">
                  {p.titulo}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--carol-muted)]">
                  {p.texto}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
