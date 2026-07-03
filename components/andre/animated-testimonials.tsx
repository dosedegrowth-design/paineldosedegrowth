"use client";

/* Carrossel de depoimentos com stack 3D de fotos do serviço executado
   e citação revelada palavra por palavra. Adaptado da Aceternity
   (21st.dev) para o design cold-tech do site. */

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type Depoimento = {
  quote: string;
  name: string;
  designation: string;
  service: string;
  src: string;
};

/* Rotações fixas por índice — Math.random() no render causaria
   mismatch de hidratação. */
const ROTATIONS = [-8, 7, -5, 9, -6, 4];

export function AnimatedTestimonials({
  testimonials,
  autoplay = true,
  className,
}: {
  testimonials: Depoimento[];
  autoplay?: boolean;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  const handleNext = () =>
    setActive((prev) => (prev + 1) % testimonials.length);
  const handlePrev = () =>
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const isActive = (index: number) => index === active;

  useEffect(() => {
    if (!autoplay || reduce) return;
    const interval = setInterval(
      () => setActive((prev) => (prev + 1) % testimonials.length),
      6000
    );
    return () => clearInterval(interval);
  }, [autoplay, reduce, testimonials.length]);

  const t = testimonials[active];

  return (
    <div className={cn("relative grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20", className)}>
      {/* Stack de fotos com rotação 3D */}
      <div className="relative h-72 sm:h-80 w-full max-w-md mx-auto md:max-w-none">
        <AnimatePresence>
          {testimonials.map((item, index) => (
            <motion.div
              key={item.src}
              initial={{
                opacity: 0,
                scale: 0.9,
                rotate: ROTATIONS[index % ROTATIONS.length],
              }}
              animate={{
                opacity: isActive(index) ? 1 : 0.55,
                scale: isActive(index) ? 1 : 0.94,
                rotate: isActive(index) ? 0 : ROTATIONS[index % ROTATIONS.length],
                zIndex: isActive(index) ? 40 : testimonials.length - index,
                y: reduce ? 0 : isActive(index) ? [0, -40, 0] : 0,
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: reduce ? 0 : 0.4, ease: "easeInOut" }}
              className="absolute inset-0 origin-bottom"
            >
              <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[var(--andre-border)] shadow-2xl shadow-cyan-950/40">
                <Image
                  src={item.src}
                  alt={`Serviço executado: ${item.service}`}
                  fill
                  sizes="(max-width: 768px) 90vw, 44vw"
                  draggable={false}
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 font-tech text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--andre-primary)]" />
                  {item.service}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Citação + navegação */}
      <div className="flex flex-col justify-between py-2 text-center md:text-left">
        <motion.div
          key={active}
          initial={reduce ? false : { y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <div className="flex items-center justify-center md:justify-start gap-1 mb-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4" fill="#fbbf24" color="#fbbf24" />
            ))}
          </div>
          <blockquote className="text-lg sm:text-xl text-slate-300 leading-relaxed">
            {reduce
              ? `“${t.quote}”`
              : t.quote.split(" ").map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut",
                      delay: 0.02 * index,
                    }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
          </blockquote>
          <h3 className="mt-6 text-xl font-bold text-white">{t.name}</h3>
          <p className="mt-1 font-tech text-[11px] uppercase tracking-[0.2em] text-slate-400">
            {t.designation}
          </p>
        </motion.div>

        <div className="flex justify-center md:justify-start gap-3 pt-10">
          <button
            onClick={handlePrev}
            aria-label="Depoimento anterior"
            data-magnetic
            className="group/button inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--andre-border)] bg-[var(--andre-card)] transition-colors hover:border-[var(--andre-primary)]"
          >
            <ArrowLeft className="h-4.5 w-4.5 text-white transition-transform duration-300 group-hover/button:-translate-x-0.5" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Próximo depoimento"
            data-magnetic
            className="group/button inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--andre-border)] bg-[var(--andre-card)] transition-colors hover:border-[var(--andre-primary)]"
          >
            <ArrowRight className="h-4.5 w-4.5 text-white transition-transform duration-300 group-hover/button:translate-x-0.5" />
          </button>
          <span className="ml-2 inline-flex items-center font-tech text-[10px] uppercase tracking-[0.2em] text-slate-500">
            {String(active + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
