"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import type { ServiceRow } from "@/lib/types";
import { PHOTOS, type PhotoSlot } from "@/lib/photos";
import { RealPhoto } from "@/components/ui/real-photo";
import { Reveal, MaskedLines } from "@/components/ui/reveal";
import { useFinePointer, useIsMobile } from "@/components/ui/use-media";
import { Magnetic } from "@/components/ui/magnetic";

const PHOTO_BY_SLUG: Record<string, PhotoSlot> = {
  "aplicacao-cilios": PHOTOS.serviceLash,
  "manutencao-cilios": PHOTOS.serviceMaintenance,
  "design-sobrancelhas": PHOTOS.serviceBrow,
  "lip-spa": PHOTOS.serviceLip,
  "limpeza-de-pele": PHOTOS.serviceFacial,
};

const FALLBACK: ServiceRow[] = [
  { id: "1", slug: "aplicacao-cilios", name: "Aplicação de cílios", description: "Aplicação completa, fio a fio ou volume.", point_value: 0, active: true, sort_order: 1 },
  { id: "2", slug: "manutencao-cilios", name: "Manutenção de cílios", description: "Manutenção periódica da aplicação.", point_value: 0, active: true, sort_order: 2 },
  { id: "3", slug: "design-sobrancelhas", name: "Design de sobrancelhas", description: "Design e acabamento.", point_value: 0, active: true, sort_order: 3 },
  { id: "4", slug: "lip-spa", name: "Lip spa", description: "Hidratação e cuidado dos lábios.", point_value: 0, active: true, sort_order: 4 },
  { id: "5", slug: "limpeza-de-pele", name: "Limpeza de pele", description: "Facial e limpeza profunda.", point_value: 0, active: true, sort_order: 5 },
];

/**
 * Transição 4 — serviços como tipografia.
 * Lista em Bodoni, uma linha por serviço. No desktop, a foto do serviço
 * segue o cursor enquanto a linha está sob o mouse; no mobile, o toque
 * abre a foto dentro da linha.
 */
export function Services({ services, scheduleUrl }: { services: ServiceRow[]; scheduleUrl: string }) {
  const list = (services.length ? services : FALLBACK).filter((s) => s.slug !== "outro");
  const fine = useFinePointer();
  const isMobile = useIsMobile();
  const [active, setActive] = useState<number | null>(null);
  const [openMobile, setOpenMobile] = useState<number | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 22, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 120, damping: 22, mass: 0.5 });
  const onMove = (e: React.PointerEvent) => {
    mx.set(e.clientX);
    my.set(e.clientY);
  };

  return (
    <section id="servicos" className="ty-section" aria-label="Serviços" onPointerMove={fine ? onMove : undefined}>
      <div className="ty-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 4fr) minmax(0, 8fr)",
            gap: isMobile ? 34 : "clamp(32px, 5vw, 96px)",
            alignItems: "start",
          }}
        >
          <div style={{ position: isMobile ? "static" : "sticky", top: "calc(var(--t-nav-h) + 24px)" }}>
            <Reveal>
              <span className="ty-eyebrow" style={{ display: "block", marginBottom: 20 }}>
                Serviços
              </span>
            </Reveal>
            <MaskedLines
              as="h2"
              className="ty-display"
              lineClassName="ty-services-title"
              lines={["O que a", <em key="e">Tayssa</em>, "faz."]}
            />
            <Reveal delay={0.2}>
              <p className="ty-body" style={{ marginTop: 24, maxWidth: 360 }}>
                Valores e disponibilidade direto com ela, no WhatsApp. Sem tabela
                genérica: cada olhar pede uma conversa.
              </p>
              <div style={{ marginTop: 28 }}>
                <Magnetic>
                  <a href={scheduleUrl} target="_blank" rel="noopener noreferrer" className="ty-btn ty-btn--sm">
                    <span>Agendar atendimento</span>
                    <span className="ty-btn__arrow" aria-hidden />
                  </a>
                </Magnetic>
              </div>
            </Reveal>
          </div>

          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {list.map((s, i) => {
              const photo = PHOTO_BY_SLUG[s.slug] ?? PHOTOS.work01;
              const isOpen = openMobile === i;
              return (
                <Reveal key={s.id} as="li" delay={i * 0.05} amount={0.3}>
                  <div
                    role={isMobile ? "button" : undefined}
                    tabIndex={isMobile ? 0 : undefined}
                    aria-expanded={isMobile ? isOpen : undefined}
                    onPointerEnter={() => fine && setActive(i)}
                    onPointerLeave={() => fine && setActive(null)}
                    onClick={() => isMobile && setOpenMobile(isOpen ? null : i)}
                    onKeyDown={(e) => {
                      if (isMobile && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        setOpenMobile(isOpen ? null : i);
                      }
                    }}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      alignItems: "baseline",
                      gap: "clamp(14px, 2vw, 32px)",
                      padding: "clamp(22px, 2.6vw, 36px) 0",
                      borderTop: "1px solid var(--t-line-strong)",
                      borderBottom: i === list.length - 1 ? "1px solid var(--t-line-strong)" : undefined,
                      cursor: isMobile ? "pointer" : undefined,
                    }}
                  >
                    <span className="ty-num ty-muted" style={{ fontSize: 11, letterSpacing: "0.2em" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <motion.h3
                        className="ty-display"
                        style={{ fontSize: "clamp(23px, 2.74vw, 37px)", display: "inline-block" }}
                        animate={{ x: active === i ? 10 : 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {s.name}
                      </motion.h3>
                      {s.description ? (
                        <p className="ty-body" style={{ marginTop: 8, maxWidth: 480 }}>
                          {s.description}
                        </p>
                      ) : null}
                      <AnimatePresence initial={false}>
                        {isMobile && isOpen ? (
                          <motion.div
                            key="ph"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                            style={{ overflow: "hidden" }}
                          >
                            <div style={{ paddingTop: 18, maxWidth: 300 }}>
                              <RealPhoto photo={photo} sizes="80vw" />
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                    <span
                      className="ty-btn__arrow"
                      aria-hidden
                      style={{
                        alignSelf: "center",
                        transform: isMobile && isOpen ? "rotate(90deg)" : undefined,
                        transition: "transform var(--t-ui) var(--t-ease-out)",
                      }}
                    />
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </div>

      {/* foto que segue o cursor (desktop) */}
      {fine ? (
        <motion.div
          aria-hidden
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            x: sx,
            y: sy,
            width: 260,
            zIndex: 40,
            pointerEvents: "none",
            translateX: "-50%",
            translateY: "-58%",
            rotate: -3,
          }}
        >
          <AnimatePresence>
            {active !== null ? (
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.86, clipPath: "inset(20% 0 20% 0)" }}
                animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0 0% 0)" }}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.25 } }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                style={{ boxShadow: "0 30px 60px -30px rgba(26,21,18,0.55)" }}
              >
                <RealPhoto photo={PHOTO_BY_SLUG[list[active]?.slug] ?? PHOTOS.work01} sizes="260px" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}

      <style>{`.ty-services-title { font-size: clamp(36px, 4.26vw, 57px); }`}</style>
    </section>
  );
}
