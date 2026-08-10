import { Eye, UserPlus } from "lucide-react";
import { CountUp } from "./count-up";
import { InsightsPhone } from "./insights-phone";
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
        <div className="grid items-center gap-14 lg:grid-cols-[7fr_5fr]">
          <div>
            <Reveal className="max-w-2xl">
              <p className="carol-eyebrow">Resultados · últimos 30 dias</p>
              <h2 className="carol-display mt-4 text-4xl md:text-5xl">
                Números que uma{" "}
                <span className="carol-display-italic text-[var(--carol-accent-light)]">
                  publi comum
                </span>{" "}
                não entrega
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-[var(--carol-dark-muted)]">
                Direto do Instagram Insights da Carol: 96,2% das visualizações
                vêm de público novo, descobrindo o perfil pelos Reels.
              </p>
            </Reveal>

            <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
              {METRICAS.map((m, i) => (
                <Reveal key={m.rotulo} delay={i * 0.06}>
                  <div className="border-l-2 border-[var(--carol-accent-light)] pl-5">
                    <p className="carol-display text-3xl leading-none md:text-4xl">
                      <CountUp value={m.valor} />
                    </p>
                    <p className="mt-2 text-[12.5px] font-bold uppercase tracking-[0.14em] text-[var(--carol-dark-fg)]/85">
                      {m.rotulo}
                    </p>
                    <p className="mt-1 text-[12px] text-[var(--carol-dark-muted)]">
                      {m.detalhe}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Print do Insights animado, como a Carol pediu */}
          <Reveal delay={0.12} className="relative mx-auto">
            <InsightsPhone className="rotate-[3deg]" />

            {/* chips flutuantes com números reais por cima do print */}
            <div
              aria-hidden
              className="carol-float absolute -left-16 top-16 hidden rounded-2xl border border-[var(--carol-dark-line)] bg-[var(--carol-dark-soft)]/95 px-4 py-3 shadow-xl backdrop-blur sm:block"
            >
              <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--carol-dark-muted)]">
                <Eye className="h-3.5 w-3.5 text-[var(--carol-accent-light)]" />
                visualizações
              </p>
              <p className="carol-display mt-1 text-2xl text-[var(--carol-accent-light)]">
                <CountUp value="2,16 mi" />
              </p>
            </div>
            <div
              aria-hidden
              className="carol-float carol-float-late absolute -right-10 bottom-24 hidden rounded-2xl border border-[var(--carol-dark-line)] bg-[var(--carol-dark-soft)]/95 px-4 py-3 shadow-xl backdrop-blur sm:block"
            >
              <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--carol-dark-muted)]">
                <UserPlus className="h-3.5 w-3.5 text-[var(--carol-accent-light)]" />
                seguidores
              </p>
              <p className="carol-display mt-1 text-2xl text-[var(--carol-accent-light)]">
                <CountUp value="+3.704" />
              </p>
            </div>
          </Reveal>
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
                    <span className="carol-display text-2xl text-[var(--carol-accent-light)]">
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
