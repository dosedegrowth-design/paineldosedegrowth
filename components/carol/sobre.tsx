import { Sparkles } from "lucide-react";
import { Reveal } from "./reveal";

export function CarolSobre() {
  return (
    <section id="sobre" className="relative overflow-hidden py-24 md:py-32">
      <span className="carol-watermark left-[-2%] top-6 text-[22vw]">Carol</span>

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 md:grid-cols-[5fr_6fr] md:px-8">
        {/* Retrato editorial (placeholder até as fotos reais do Drive) */}
        <Reveal className="relative mx-auto w-full max-w-md">
          <div className="rotate-[-2deg] rounded-[24px] bg-white p-3 pb-14 shadow-[0_24px_60px_-24px_rgba(36,26,32,0.4)]">
            <img
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
              alt="Carolina Kühn"
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
                Recentemente, decidiu unir essa bagagem à criação de UGC e se
                tornar também o rosto do próprio conteúdo. O resultado?{" "}
                <strong className="text-[var(--carol-ink)]">
                  Conteúdo que não é só bonito — é pensado estrategicamente pra
                  gerar resultado.
                </strong>
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 flex gap-4 rounded-2xl border border-[var(--carol-accent)]/25 bg-[var(--carol-accent-soft)]/60 p-5">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[var(--carol-accent-deep)]" />
              <p className="text-[14.5px] leading-relaxed text-[var(--carol-ink)]/80">
                <strong className="text-[var(--carol-accent-deep)]">Antes da publicidade, o palco.</strong>{" "}
                A presença de câmera vem da formação no ballet: performance,
                expressão e disciplina são técnica — não improviso.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
