import { MARCAS } from "./site-data";

export function CarolMarcasStrip() {
  const row = [...MARCAS, ...MARCAS];
  return (
    <section id="marcas" className="border-y border-[var(--carol-line)] bg-[var(--carol-bg-soft)] py-10">
      <p className="carol-eyebrow px-5 text-center">
        Bastidores de estratégia e criação para marcas como
      </p>
      <div className="carol-marquee mt-6" aria-hidden>
        <div className="carol-marquee-track">
          {row.map((marca, i) => (
            <span
              key={`${marca}-${i}`}
              className="carol-display inline-flex items-center gap-10 px-10 text-3xl text-[var(--carol-ink)]/70 md:text-4xl"
            >
              {marca}
              <span className="text-xl text-[var(--carol-accent)]">✦</span>
            </span>
          ))}
        </div>
      </div>
      <p className="mx-auto mt-6 max-w-xl px-5 text-center text-xs leading-relaxed text-[var(--carol-muted)]">
        Atuação como publicitária e estrategista em projetos e campanhas dessas
        marcas — a bagagem de quem sabe o que funciona antes de apertar o rec.
      </p>
    </section>
  );
}
