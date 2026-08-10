import { MARCAS } from "./site-data";

export function CarolMarcasStrip() {
  const row = [...MARCAS, ...MARCAS, ...MARCAS];
  return (
    <section id="marcas" className="border-y border-[var(--carol-line)] bg-[var(--carol-bg-soft)] py-9">
      <p className="carol-eyebrow px-5 text-center !text-[10.5px] !tracking-[0.32em] opacity-80">
        Bastidores de estratégia e criação para marcas como
      </p>
      {/* Lista acessível — o marquee visual abaixo é aria-hidden */}
      <p className="sr-only">{MARCAS.join(", ")}.</p>
      <div className="carol-marquee mt-5" aria-hidden>
        <div className="carol-marquee-track">
          {row.map((marca, i) => (
            <span
              key={`${marca}-${i}`}
              className="carol-display-italic inline-flex items-center gap-9 px-9 text-lg font-normal tracking-wide text-[var(--carol-ink)]/45 md:text-xl"
            >
              {marca}
              <span className="block h-1 w-1 rounded-full bg-[var(--carol-accent)]/50" />
            </span>
          ))}
        </div>
      </div>
      <p className="mx-auto mt-5 max-w-xl px-5 text-center text-[11.5px] leading-relaxed text-[var(--carol-muted)]/80">
        Atuação como publicitária e estrategista em projetos e campanhas dessas
        marcas — a bagagem de quem sabe o que funciona antes de apertar o rec.
      </p>
    </section>
  );
}
