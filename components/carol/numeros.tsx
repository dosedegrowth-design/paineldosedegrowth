import { Reveal } from "./reveal";
import { AUDIENCIA, METRICAS } from "./site-data";

export function CarolNumeros() {
  return (
    <section
      id="numeros"
      className="carol-dark-section relative overflow-hidden bg-[var(--carol-dark)] py-24 text-[var(--carol-dark-fg)] md:py-32"
    >
      <span aria-hidden className="carol-watermark right-[-4%] top-8 text-[20vw]">2,1mi</span>

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <p className="carol-eyebrow">Resultados · últimos 30 dias</p>
          <h2 className="carol-display mt-4 text-4xl md:text-5xl">
            Números que uma{" "}
            <span className="carol-display-italic text-[#e75a93]">publi comum</span>{" "}
            não entrega
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-[var(--carol-dark-muted)]">
            Crescimento puxado por conteúdo: 96,2% das visualizações vêm de
            público novo, descobrindo o perfil pelos Reels.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
          {METRICAS.map((m, i) => (
            <Reveal key={m.rotulo} delay={i * 0.06}>
              <div className="border-l-2 border-[var(--carol-accent)] pl-5">
                <p className="carol-display text-4xl leading-none md:text-5xl">
                  {m.valor}
                </p>
                <p className="mt-2 text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--carol-dark-fg)]/85">
                  {m.rotulo}
                </p>
                <p className="mt-1 text-[12.5px] text-[var(--carol-dark-muted)]">
                  {m.detalhe}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Audiência */}
        <Reveal delay={0.1}>
          <div className="mt-20 rounded-3xl border border-[var(--carol-dark-line)] bg-[var(--carol-dark-soft)] p-7 md:p-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="carol-eyebrow">Quem assiste</p>
                <h3 className="carol-display mt-2 text-2xl md:text-3xl">
                  A audiência que decide a compra da casa
                </h3>
              </div>
              <p className="max-w-xs text-[13px] leading-relaxed text-[var(--carol-dark-muted)]">
                Perfil ideal pra marcas de beleza, moda, lifestyle, casa e
                bem-estar.
              </p>
            </div>

            <div className="mt-8 grid gap-7 md:grid-cols-3">
              {AUDIENCIA.map((a) => (
                <div key={a.rotulo}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] font-bold uppercase tracking-[0.14em]">
                      {a.rotulo}
                    </span>
                    <span className="carol-display text-2xl text-[#e75a93]">
                      {String(a.valor).replace(".", ",")}%
                    </span>
                  </div>
                  <div className="carol-bar mt-3">
                    <span style={{ width: `${a.valor}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
