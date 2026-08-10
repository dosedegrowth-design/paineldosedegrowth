"use client";

import { Camera, Sparkle } from "lucide-react";
import MarqueeAlongSvgPath from "@/components/ui/marquee-along-svg-path";
import { Reveal } from "./reveal";
import { FOTOS_AUTORAIS, ORCAMENTO_URL } from "./site-data";

/* Curva em S usada pela galeria de fotografia */
const GALLERY_PATH =
  "M1 209.434C58.5872 255.935 387.926 325.938 482.583 209.434C600.905 63.8051 525.516 -43.2211 427.332 19.9613C329.149 83.1436 352.902 242.723 515.041 267.302C644.752 286.966 943.56 181.94 995 156.5";

/* Fotografia profissional + modelo como serviço à parte — pedido da
   Carol no áudio: destacar essa frente separada do UGC. */
export function CarolFotografia() {
  return (
    <section id="fotografia" className="bg-[var(--carol-bg-soft)] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal className="max-w-2xl">
            <p className="carol-eyebrow flex items-center gap-2">
              <Camera className="h-3.5 w-3.5" />
              Serviço à parte
            </p>
            <h2 className="carol-display mt-4 text-4xl text-[var(--carol-ink)] md:text-5xl">
              Fotografia profissional{" "}
              <span className="carol-display-italic text-[var(--carol-accent-deep)]">
                &amp; modelo
              </span>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-[var(--carol-muted)]">
              Além do UGC, a Carol atende ensaios e campanhas como{" "}
              <strong className="text-[var(--carol-ink)]">fotógrafa</strong> —
              e também do outro lado da lente, como{" "}
              <strong className="text-[var(--carol-ink)]">modelo</strong>, com
              a presença de cena que vem do ballet. Duas frentes contratáveis
              separadamente do conteúdo em vídeo.
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
              Orçar fotos ou campanha
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 overflow-hidden rounded-3xl border border-[var(--carol-line)] bg-[var(--carol-bg)]">
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
                  className="h-40 w-28 overflow-hidden rounded-lg shadow-xl transition-transform duration-300 ease-in-out hover:scale-150 md:h-28 md:w-20"
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
          <p className="mt-3 text-center text-[11.5px] text-[var(--carol-muted)]/80">
            Arraste as fotos — ensaios reais da Carol.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
