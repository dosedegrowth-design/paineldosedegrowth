import { Sprout } from "lucide-react";
import { FlowerSimple, SprigRosemary } from "./botanicals";
import { Reveal } from "./reveal";

export function CarolSobre() {
  return (
    <section id="sobre" className="relative overflow-hidden py-24 md:py-32">
      <span aria-hidden className="carol-watermark left-[-2%] top-6 text-[22vw]">Carol</span>
      <SprigRosemary className="absolute -left-4 bottom-8 h-52 rotate-[16deg] text-[var(--carol-accent)]/20" />
      <FlowerSimple className="absolute right-8 top-16 h-14 w-14 rotate-12 text-[var(--carol-terra)]/25" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 md:grid-cols-[5fr_6fr] md:px-8">
        {/* Retrato editorial */}
        <Reveal className="relative mx-auto w-full max-w-md">
          <div className="rotate-[-2deg] rounded-[24px] bg-white p-3 pb-14 shadow-[0_24px_60px_-24px_rgba(46,43,32,0.4)]">
            <img
              src="/carol/sobre.webp"
              alt="Carolina Kühn"
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full rounded-2xl object-cover"
            />
            <p className="carol-display-italic mt-4 text-center text-lg text-[var(--carol-muted)]">
              estratégia com rosto, história e técnica
            </p>
          </div>
          <div className="absolute -right-3 -top-4 rotate-[4deg] rounded-full bg-[var(--carol-accent)] px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-white shadow-lg md:-right-6">
            8+ anos de mercado
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="carol-eyebrow">Quem é Carolina</p>
            <h2 className="carol-display mt-4 text-4xl text-[var(--carol-ink)] md:text-5xl">
              Do backstage das marcas para a{" "}
              <span className="carol-display-italic text-[var(--carol-accent-deep)]">
                frente da câmera
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-7 space-y-5 text-[15.5px] leading-relaxed text-[var(--carol-muted)]">
              <p>
                Carolina é <strong className="text-[var(--carol-ink)]">publicitária com mais de 8 anos</strong>{" "}
                de atuação no mercado digital. Ao longo da carreira, trabalhou na
                estratégia e criação de conteúdo pra marcas como Nestlé, Itaú,
                Caudalie, McDonald&apos;s, Apple, ONU e Clinique — do lado de quem
                decide o que vai ao ar, não do lado de quem aparece.
              </p>
              <p>
                Antes da publicidade, o palco: a presença de câmera vem da{" "}
                <strong className="text-[var(--carol-ink)]">formação no ballet</strong> —
                e, além de criar, ela também atua como{" "}
                <strong className="text-[var(--carol-ink)]">modelo</strong>.
                Performance, expressão e disciplina são técnica, não improviso.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 flex gap-4 rounded-2xl border border-[var(--carol-accent)]/25 bg-[var(--carol-accent-soft)]/60 p-5">
              <Sprout className="mt-0.5 h-5 w-5 shrink-0 text-[var(--carol-accent-deep)]" />
              <p className="text-[14.5px] leading-relaxed text-[var(--carol-ink)]/80">
                <strong className="text-[var(--carol-accent-deep)]">
                  No meio do caminho, nasceu um projeto social.
                </strong>{" "}
                A comunidade de mulheres que a Carol lidera ressignificou muita
                coisa na vida dela — inclusive o jeito de criar: hoje, o
                conteúdo é 100% focado em mulheres, feito com escuta e
                acolhimento.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
