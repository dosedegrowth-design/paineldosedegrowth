import { Instagram } from "lucide-react";
import { IgReelPhone } from "./ig-reel-phone";
import { Reveal } from "./reveal";
import { IG_URL, REELS } from "./site-data";

/* Fileira de iPhones com a UI real de Reels — estética de agência
   (Revolution/Exclusive): prints animados do conteúdo dela, clique
   abre o Reel de verdade. */
export function CarolPortfolio() {
  return (
    <section
      id="portfolio"
      className="carol-dark-section relative overflow-hidden bg-[var(--carol-dark)] py-24 text-[var(--carol-dark-fg)] md:py-32"
    >
      <span aria-hidden className="carol-watermark left-[-2%] top-6 text-[18vw]">reels</span>

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="carol-eyebrow">Portfólio</p>
            <h2 className="carol-display mt-4 text-4xl md:text-5xl">
              O conteúdo dela,{" "}
              <span className="carol-display-italic text-[var(--carol-accent-light)]">
                como aparece no feed
              </span>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-[var(--carol-dark-muted)]">
              Moda, lifestyle, reviews, fitness, unboxing e GRWM — toque em
              qualquer celular pra assistir o Reel real no Instagram.
            </p>
          </div>
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="carol-btn carol-btn-ghost !px-6 !py-3 !text-[13px]"
          >
            <Instagram className="h-4 w-4" />
            Ver perfil completo
          </a>
        </Reveal>
      </div>

      {/* Strip de celulares — arrasta no mobile, respiro no desktop */}
      <Reveal delay={0.1}>
        <div className="mt-14 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto flex w-max snap-x snap-mandatory gap-6 px-5 md:gap-8 md:px-10">
            {REELS.map((reel, i) => (
              <IgReelPhone
                key={reel.url}
                reel={reel}
                className={`snap-center ${
                  i % 2 === 0 ? "rotate-[2.5deg]" : "-rotate-[2.5deg] mt-6"
                }`}
              />
            ))}
          </div>
        </div>
      </Reveal>

      <p className="mt-4 text-center text-[11.5px] text-[var(--carol-dark-muted)]/80">
        Prints da interface com o conteúdo real de @daybycarolk — arraste pro
        lado pra ver mais.
      </p>
    </section>
  );
}
