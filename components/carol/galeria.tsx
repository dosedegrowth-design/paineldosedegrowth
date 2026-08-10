"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { PORTFOLIO_FOTOS } from "./portfolio-fotos";

const INICIAIS = 18;

/* Portfólio fotográfico completo: masonry com as 65 fotos profissionais
   da Carol + lightbox navegável (setas, teclado, contador). */
export function CarolGaleria() {
  const [todas, setTodas] = useState(false);
  const [aberta, setAberta] = useState<number | null>(null);
  const reduce = useReducedMotion();

  const visiveis = todas ? PORTFOLIO_FOTOS : PORTFOLIO_FOTOS.slice(0, INICIAIS);

  const navegar = useCallback(
    (delta: number) => {
      setAberta((atual) => {
        if (atual === null) return atual;
        const n = PORTFOLIO_FOTOS.length;
        return (atual + delta + n) % n;
      });
    },
    []
  );

  // Teclado + trava do scroll enquanto o lightbox está aberto
  useEffect(() => {
    if (aberta === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberta(null);
      if (e.key === "ArrowLeft") navegar(-1);
      if (e.key === "ArrowRight") navegar(1);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [aberta, navegar]);

  return (
    <>
      {/* Masonry */}
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>button]:mb-3">
        {visiveis.map((foto, i) => (
          <button
            key={foto.src}
            type="button"
            onClick={() => {
              // abre o lightbox já com acesso às 65 (a masonry continua compacta)
              setAberta(i);
            }}
            aria-label={`Ampliar foto ${i + 1} de ${PORTFOLIO_FOTOS.length}`}
            className="group block w-full overflow-hidden rounded-xl"
            style={{ aspectRatio: `${foto.w} / ${foto.h}` }}
          >
            <img
              src={foto.src}
              alt={`Ensaio profissional ${i + 1} — Carolina Kühn`}
              loading={i < 6 ? "eager" : "lazy"}
              decoding="async"
              width={foto.w}
              height={foto.h}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          </button>
        ))}
      </div>

      {!todas && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setTodas(true)}
            className="carol-btn carol-btn-ghost"
          >
            <Plus className="h-4 w-4" />
            Ver as {PORTFOLIO_FOTOS.length} fotos
          </button>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {aberta !== null && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-[#14160c]/95 backdrop-blur-sm"
            onClick={() => setAberta(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Foto ampliada"
          >
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => setAberta(null)}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              type="button"
              aria-label="Foto anterior"
              onClick={(e) => {
                e.stopPropagation();
                navegar(-1);
              }}
              className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 md:left-6"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <motion.img
              key={aberta}
              initial={reduce ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              src={PORTFOLIO_FOTOS[aberta].src}
              alt={`Ensaio profissional ${aberta + 1} — Carolina Kühn`}
              className="max-h-[86svh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              type="button"
              aria-label="Próxima foto"
              onClick={(e) => {
                e.stopPropagation();
                navegar(1);
              }}
              className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 md:right-6"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[13px] font-semibold tracking-wide text-white/80">
              {aberta + 1} / {PORTFOLIO_FOTOS.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
