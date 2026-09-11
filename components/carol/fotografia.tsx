import { Camera, Sparkle } from "lucide-react";
import { CarolGaleria } from "./galeria";
import { Reveal } from "./reveal";
import { ORCAMENTO_URL } from "./site-data";
import { PORTFOLIO_FOTOS } from "./portfolio-fotos";

/* Portfólio de ensaios da Carol como MODELO — serviço à parte do UGC.
   Pedido dela (set/2026): nada de "fotógrafa" na página; o que fica é
   criadora de conteúdo, estrategista, modelo e bailarina. */
export function CarolFotografia() {
  return (
    <section id="fotografia" className="bg-[var(--carol-bg-soft)] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal className="max-w-2xl">
            <p className="carol-eyebrow flex items-center gap-2">
              <Camera className="h-3.5 w-3.5" />
              Ensaios profissionais · serviço à parte
            </p>
            <h2 className="carol-display mt-4 text-4xl text-[var(--carol-ink)] md:text-5xl">
              Ensaios como{" "}
              <span className="carol-display-italic text-[var(--carol-accent-deep)]">
                modelo
              </span>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-[var(--carol-muted)]">
              {PORTFOLIO_FOTOS.length} fotos de ensaios e campanhas reais.
              Além do conteúdo em vídeo, a Carol atua como{" "}
              <strong className="text-[var(--carol-ink)]">modelo</strong> —
              com a presença de cena que vem da sua atuação como{" "}
              <strong className="text-[var(--carol-ink)]">bailarina</strong>.
              Uma frente contratável à parte pra ensaios e campanhas da sua
              marca.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <a
              href={ORCAMENTO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="carol-btn carol-btn-primary !px-7 !py-3.5 !text-[13.5px]"
            >
              <Sparkle className="h-4 w-4" />
              Orçar ensaio ou campanha
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-12">
          <CarolGaleria />
          <p className="mt-4 text-center text-[11.5px] text-[var(--carol-muted)]/80">
            Clique em qualquer foto pra ampliar e navegar pelo ensaio.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
