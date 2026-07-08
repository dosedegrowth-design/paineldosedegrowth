"use client";

import React, { useEffect, useState } from "react";

/* Hero com galeria em arco: imagens distribuídas num semicírculo acima do
   conteúdo. Genérico e sem tema — o fundo/cores vêm do consumidor via
   className, e o conteúdo central (título, CTAs) via children. */

type ArcGalleryHeroProps = {
  images: string[];
  /** alt correspondente a cada imagem (mesmo índice de `images`) */
  alts?: string[];
  startAngle?: number;
  endAngle?: number;
  // raio do arco por breakpoint
  radiusLg?: number;
  radiusMd?: number;
  radiusSm?: number;
  // tamanho de cada card por breakpoint
  cardSizeLg?: number;
  cardSizeMd?: number;
  cardSizeSm?: number;
  /** classes extras na section externa (fundo, texto, paddings) */
  className?: string;
  /** chrome dos cards (borda, sombra, raio) — tem default neutro */
  cardClassName?: string;
  /** conteúdo central exibido abaixo do arco */
  children?: React.ReactNode;
};

export const ArcGalleryHero: React.FC<ArcGalleryHeroProps> = ({
  images,
  alts,
  startAngle = 20,
  endAngle = 160,
  radiusLg = 480,
  radiusMd = 360,
  radiusSm = 260,
  cardSizeLg = 120,
  cardSizeMd = 100,
  cardSizeSm = 80,
  className = "",
  cardClassName = "rounded-2xl shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-800",
  children,
}) => {
  const [dimensions, setDimensions] = useState({
    radius: radiusLg,
    cardSize: cardSizeLg,
  });

  // Redimensiona arco e cards conforme a largura da viewport
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDimensions({ radius: radiusSm, cardSize: cardSizeSm });
      } else if (width < 1024) {
        setDimensions({ radius: radiusMd, cardSize: cardSizeMd });
      } else {
        setDimensions({ radius: radiusLg, cardSize: cardSizeLg });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [radiusLg, radiusMd, radiusSm, cardSizeLg, cardSizeMd, cardSizeSm]);

  // Garante ao menos 2 pontos pra distribuir os ângulos do arco
  const count = Math.max(images.length, 2);
  const step = (endAngle - startAngle) / (count - 1);

  return (
    <section
      className={`relative overflow-hidden min-h-screen flex flex-col ${className}`}
    >
      {/* Container do anel que controla a geometria */}
      <div
        className="relative mx-auto"
        style={{
          width: "100%",
          // folga extra pra não clipar os cards do topo
          height: dimensions.radius * 1.2,
        }}
      >
        {/* Pivô central dos transforms — base inferior centralizada */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2">
          {images.map((src, i) => {
            const angle = startAngle + step * i; // graus
            const angleRad = (angle * Math.PI) / 180;

            const x = Math.cos(angleRad) * dimensions.radius;
            const y = Math.sin(angleRad) * dimensions.radius;

            return (
              <div
                key={i}
                className="absolute opacity-0 animate-fade-in-up"
                style={{
                  width: dimensions.cardSize,
                  height: dimensions.cardSize,
                  left: `calc(50% + ${x}px)`,
                  bottom: `${y}px`,
                  transform: `translate(-50%, 50%)`,
                  animationDelay: `${i * 100}ms`,
                  animationFillMode: "forwards",
                  zIndex: count - i,
                }}
              >
                <div
                  className={`overflow-hidden transition-transform hover:scale-105 w-full h-full ${cardClassName}`}
                  style={{ transform: `rotate(${angle / 4}deg)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={alts?.[i] ?? `Foto ${i + 1}`}
                    className="block w-full h-full object-cover"
                    draggable={false}
                    loading={i > 5 ? "lazy" : undefined}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/400x400/0b1220/94a3b8?text=Foto";
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conteúdo posicionado abaixo do arco */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 -mt-40 md:-mt-52 lg:-mt-64">
        <div
          className="text-center max-w-2xl px-6 opacity-0 animate-fade-in"
          style={{ animationDelay: "800ms", animationFillMode: "forwards" }}
        >
          {children}
        </div>
      </div>

      {/* Animações do arco */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translate(-50%, 60%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 50%);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation-name: fade-in-up;
          animation-duration: 0.8s;
          animation-timing-function: ease-out;
        }
        .animate-fade-in {
          animation-name: fade-in;
          animation-duration: 0.8s;
          animation-timing-function: ease-out;
        }
      `}</style>
    </section>
  );
};
