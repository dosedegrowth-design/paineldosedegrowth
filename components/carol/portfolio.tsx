"use client";

import { Camera, Play } from "lucide-react";
import MarqueeAlongSvgPath from "@/components/ui/marquee-along-svg-path";
import { Reveal } from "./reveal";
import { FOTOS_AUTORAIS, REELS } from "./site-data";

/* Curva em S usada pela galeria de fotografia */
const GALLERY_PATH =
  "M1 209.434C58.5872 255.935 387.926 325.938 482.583 209.434C600.905 63.8051 525.516 -43.2211 427.332 19.9613C329.149 83.1436 352.902 242.723 515.041 267.302C644.752 286.966 943.56 181.94 995 156.5";

export function CarolPortfolio() {
  return (
    <section id="portfolio" className="bg-[var(--carol-bg-soft)] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <p className="carol-eyebrow">Portfólio</p>
          <h2 className="carol-display mt-4 text-4xl text-[var(--carol-ink)] md:text-5xl">
            UGC em vídeo,{" "}
            <span className="carol-display-italic text-[var(--carol-accent-deep)]">
              por categoria
            </span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-[var(--carol-muted)]">
            Moda, lifestyle, reviews, fitness, unboxing e GRWM — clique pra
            assistir no Instagram.
          </p>
        </Reveal>

        {/* Galeria 1 — UGC em vídeo */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REELS.map((reel, i) => (
            <Reveal key={reel.url} delay={(i % 3) * 0.07}>
              <a
                href={reel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden rounded-3xl"
              >
                <img
                  src={reel.img}
                  alt={`UGC de ${reel.categoria.toLowerCase()} — Carolina Kühn`}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                  <div>
                    <p className="carol-display text-2xl text-white">
                      {reel.categoria}
                    </p>
                    <p className="mt-1 text-[12.5px] text-white/75">
                      {reel.descricao}
                    </p>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-all duration-300 group-hover:bg-[var(--carol-accent)] group-hover:scale-110">
                    <Play className="h-4 w-4 fill-white text-white" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        {/* Galeria 2 — Fotografia autoral */}
        <Reveal className="mt-28 max-w-2xl">
          <p className="carol-eyebrow flex items-center gap-2">
            <Camera className="h-3.5 w-3.5" />
            Fotografia autoral
          </p>
          <h3 className="carol-display mt-4 text-3xl text-[var(--carol-ink)] md:text-4xl">
            Creator que também é{" "}
            <span className="carol-display-italic text-[var(--carol-accent-deep)]">
              fotógrafa
            </span>
          </h3>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--carol-muted)]">
            Um diferencial raro no mercado de UGC: além dos vídeos, a marca
            recebe fotografia profissional autoral. Arraste as fotos abaixo.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-6 overflow-hidden rounded-3xl border border-[var(--carol-line)] bg-[var(--carol-bg)]">
            <MarqueeAlongSvgPath
              path={GALLERY_PATH}
              viewBox="0 0 996 330"
              baseVelocity={7}
              slowdownOnHover
              draggable
              grabCursor
              repeat={1}
              dragSensitivity={0.1}
              responsive
              className="h-[300px] w-full select-none md:h-[420px]"
            >
              {FOTOS_AUTORAIS.map((src, i) => (
                <div
                  key={src}
                  className="h-24 w-16 overflow-hidden rounded-lg shadow-xl transition-transform duration-300 ease-in-out hover:scale-150 md:h-28 md:w-20"
                >
                  <img
                    src={src}
                    alt={`Fotografia autoral ${i + 1} — Carolina Kühn`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </div>
              ))}
            </MarqueeAlongSvgPath>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
