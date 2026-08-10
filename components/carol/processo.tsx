"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";
import { PROCESSO } from "./site-data";

const AUTO_ADVANCE_MS = 4500;

export function CarolProcesso() {
  const [ativo, setAtivo] = useState(0);
  const interagiu = useRef(false);
  const reduce = useReducedMotion();

  // Avança sozinho até a primeira interação (desligado com reduced motion)
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => {
      if (!interagiu.current) setAtivo((v) => (v + 1) % PROCESSO.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(t);
  }, [reduce]);

  const selecionar = (i: number) => {
    interagiu.current = true;
    setAtivo(i);
  };

  const etapa = PROCESSO[ativo];

  return (
    <section id="processo" className="bg-[var(--carol-bg-soft)] py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <p className="carol-eyebrow">Como funciona</p>
          <h2 className="carol-display mt-4 text-4xl text-[var(--carol-ink)] md:text-5xl">
            Processo claro,{" "}
            <span className="carol-display-italic text-[var(--carol-accent-deep)]">
              do briefing à entrega
            </span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-[var(--carol-muted)]">
            Seis etapas, zero surpresa: a marca sabe exatamente onde o projeto
            está — do primeiro contato ao arquivo final.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          {/* Stepper */}
          <div className="relative mt-14">
            {/* trilho + progresso */}
            <div
              aria-hidden
              className="absolute left-0 right-0 top-[22px] hidden h-px bg-[var(--carol-ink)]/12 md:block"
            />
            <motion.div
              aria-hidden
              className="absolute left-0 top-[22px] hidden h-px bg-[var(--carol-accent)] md:block"
              animate={{ width: `${(ativo / (PROCESSO.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />

            <div className="relative grid grid-cols-3 gap-y-6 md:flex md:items-start md:justify-between">
              {PROCESSO.map((p, i) => {
                const feito = i <= ativo;
                return (
                  <button
                    key={p.titulo}
                    type="button"
                    onClick={() => selecionar(i)}
                    aria-current={i === ativo ? "step" : undefined}
                    className="group flex flex-col items-center gap-3 md:w-[110px]"
                  >
                    <span
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-full border text-[13px] font-bold transition-all duration-300",
                        i === ativo
                          ? "scale-110 border-[var(--carol-accent)] bg-[var(--carol-accent)] text-white shadow-[0_10px_24px_-10px_rgba(95,108,56,0.7)]"
                          : feito
                            ? "border-[var(--carol-accent)]/60 bg-[var(--carol-accent-soft)] text-[var(--carol-accent-deep)]"
                            : "border-[var(--carol-ink)]/20 bg-[var(--carol-bg)] text-[var(--carol-muted)] group-hover:border-[var(--carol-accent)]/50"
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "px-1 text-center text-[11px] font-semibold leading-tight transition-colors duration-300",
                        i === ativo
                          ? "text-[var(--carol-accent-deep)]"
                          : "text-[var(--carol-muted)]"
                      )}
                    >
                      {p.titulo}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card da etapa selecionada */}
          <div className="mt-10 min-h-[180px] md:min-h-[160px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={ativo}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="carol-card relative overflow-hidden p-8 md:p-10"
              >
                <span
                  aria-hidden
                  className="carol-display-italic pointer-events-none absolute -right-2 -top-6 select-none text-[7rem] leading-none text-[var(--carol-accent)]/10"
                >
                  {String(ativo + 1).padStart(2, "0")}
                </span>
                <p className="carol-eyebrow !text-[10.5px]">
                  Etapa {ativo + 1} de {PROCESSO.length}
                </p>
                <h3 className="carol-display mt-3 text-2xl text-[var(--carol-ink)] md:text-3xl">
                  {etapa.titulo}
                </h3>
                <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-[var(--carol-muted)]">
                  {etapa.texto}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
