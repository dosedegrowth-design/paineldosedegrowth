import { ArrowDown, Instagram } from "lucide-react";
import DiagonalMarqueeCarousel from "@/components/ui/great-ui-diagonal-marquee-carousel";
import { CountUp } from "./count-up";
import { Reveal } from "./reveal";
import { HERO_CARDS, IG_HANDLE, IG_URL, ORCAMENTO_URL } from "./site-data";

export function CarolHero() {
  return (
    <section id="topo" className="relative flex min-h-svh items-center justify-center overflow-hidden">
      {/* Carrossel diagonal de fundo com conteúdo dela */}
      <DiagonalMarqueeCarousel
        cards={[...HERO_CARDS]}
        angle={-18}
        baseSpeed={150}
        className="absolute inset-0 h-full max-h-none w-full max-w-none"
        cardClassName="h-[170px] w-[230px] md:h-[210px] md:w-[290px] rounded-2xl"
        fadeClassName="from-[var(--carol-bg)]"
        overlayClassName="bg-black/10"
      />

      {/* Véu leve — as fotos da Carol aparecem; a legibilidade do texto
          fica por conta do núcleo radial forte logo abaixo */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 bg-[var(--carol-bg)]/45 md:bg-[var(--carol-bg)]/25"
      />
      <div
        aria-hidden
        className="absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse 56% 46% at 50% 45%, rgba(246,241,231,0.96) 0%, rgba(246,241,231,0.82) 38%, rgba(246,241,231,0.35) 64%, transparent 84%)",
        }}
      />

      <div className="relative z-20 mx-auto flex max-w-4xl flex-col items-center px-5 pb-24 pt-32 text-center md:pt-36">
        <Reveal>
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="carol-chip transition-transform hover:scale-[1.03]"
          >
            <Instagram className="h-3.5 w-3.5" />
            @{IG_HANDLE}
          </a>
        </Reveal>

        <Reveal delay={0.08}>
          <h1 className="carol-display mt-7 text-[clamp(3rem,10vw,6.5rem)] text-[var(--carol-ink)]">
            Carolina Kühn
          </h1>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="carol-display-italic mt-4 max-w-2xl text-[clamp(1.25rem,3.2vw,1.85rem)] leading-snug text-[var(--carol-ink)]/85">
            8+ anos de estratégia nos bastidores de grandes marcas.
            <br className="hidden md:block" /> Agora, também{" "}
            <span className="carol-hl">na frente da câmera</span>.
          </p>
        </Reveal>

        <Reveal delay={0.24}>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--carol-muted)]">
            UGC creator, estrategista, fotógrafa e modelo. Conteúdo 100%
            focado em mulheres — e pensado pra gerar resultado.
          </p>
        </Reveal>

        <Reveal delay={0.32} className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href={ORCAMENTO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="carol-btn carol-btn-primary w-full sm:w-auto"
          >
            Solicitar orçamento
          </a>
          <a href="#portfolio" className="carol-btn carol-btn-ghost w-full sm:w-auto">
            Ver portfólio
          </a>
        </Reveal>

        <Reveal delay={0.42}>
          <dl className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              { v: "2,16 mi", l: "visualizações / 30 dias" },
              { v: "1,26 mi", l: "contas alcançadas" },
              { v: "+3,7 mil", l: "seguidores / 30 dias" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <dt className="sr-only">{s.l}</dt>
                <dd className="carol-display text-2xl text-[var(--carol-accent-deep)] md:text-3xl">
                  <CountUp value={s.v} />
                </dd>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--carol-muted)]">
                  {s.l}
                </p>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      <a
        href="#marcas"
        aria-label="Rolar para a próxima seção"
        className="absolute bottom-7 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[var(--carol-line)] bg-[var(--carol-bg)]/80 p-3.5 text-[var(--carol-muted)] backdrop-blur transition-colors hover:text-[var(--carol-accent-deep)]"
      >
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}
