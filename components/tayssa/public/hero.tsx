"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import type { BusinessSettings } from "@/lib/tayssa/config";
import { ROUTES } from "@/lib/tayssa/config";
import { PHOTOS } from "@/lib/tayssa/photos";
import { RealPhoto } from "@/components/tayssa/ui/real-photo";
import { MaskedLines } from "@/components/tayssa/ui/reveal";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { Magnetic } from "@/components/tayssa/ui/magnetic";
import { useIsMobile } from "@/components/tayssa/ui/use-media";
import { useIntroReady } from "@/components/tayssa/public/experience";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Transição 1 e 2.
 * Entrada: a foto abre a partir de uma faixa vertical estreita; "TAYSSA"
 * sobe por linhas. Scroll: a foto encolhe até virar um cartão (portrait à
 * direita no desktop, topo no mobile) e a declaração editorial aparece.
 * Tudo em clip-path/transform/opacity, ligado ao scroll.
 */
export function Hero({
  business,
  scheduleUrl,
}: {
  business: BusinessSettings;
  scheduleUrl: string;
}) {
  const ready = useIntroReady();
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // foto: de tela cheia a cartão
  const t = useTransform(scrollYProgress, [0.12, 0.72], [0, 1]);
  const insetTop = useTransform(t, [0, 1], isMobile ? [0, 9] : [0, 12]);
  const insetRight = useTransform(t, [0, 1], isMobile ? [0, 6] : [0, 6]);
  const insetBottom = useTransform(t, [0, 1], isMobile ? [0, 46] : [0, 12]);
  const insetLeft = useTransform(t, [0, 1], isMobile ? [0, 6] : [0, 56]);
  const clipPath = useMotionTemplate`inset(${insetTop}% ${insetRight}% ${insetBottom}% ${insetLeft}%)`;
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  // texto do hero sai; declaração entra
  const titleOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.3], [0, -70]);
  const stmtOpacity = useTransform(scrollYProgress, [0.5, 0.82], [0, 1]);
  const stmtY = useTransform(scrollYProgress, [0.5, 0.82], [48, 0]);
  const stmtPointer = useTransform(scrollYProgress, (v) => (v > 0.6 ? "auto" : "none"));

  // foto reage ao cursor (1.5%)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * -14);
    my.set(((e.clientY - r.top) / r.height - 0.5) * -14);
  };

  return (
    <div ref={ref} style={{ height: isMobile ? "200vh" : "230vh", position: "relative" }}>
      <section className="ty-pin" aria-label="Apresentação" onPointerMove={onMove}>
        {/* foto */}
        <motion.div
          style={{ position: "absolute", inset: 0, clipPath, willChange: "clip-path" }}
          initial={reduced ? false : { clipPath: "inset(0% 44% 0% 44%)" }}
          animate={ready ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
          transition={{ duration: 1.6, ease: EASE, delay: 0.15 }}
        >
          <motion.div style={{ position: "absolute", inset: "-4%", scale: photoScale, x: sx, y: sy }}>
            <RealPhoto photo={PHOTOS.hero} ratio="fill" priority sizes="100vw" style={{ height: "100%" }} />
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(16,13,11,0.18) 0%, rgba(16,13,11,0) 35%, rgba(16,13,11,0) 60%, rgba(16,13,11,0.55) 100%)",
              }}
            />
          </motion.div>
        </motion.div>

        {/* texto do hero */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "0 var(--t-gutter) clamp(36px, 6vh, 72px)",
            color: "#f1eae1",
            opacity: titleOpacity,
            y: titleY,
            pointerEvents: "none",
          }}
        >
          <motion.span
            className="ty-eyebrow"
            style={{ color: "rgba(241,234,225,0.7)", marginBottom: 22 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            {business.specialty}
          </motion.span>
          <MaskedLines
            as="h1"
            inView={false}
            play={ready}
            lines={["Tayssa"]}
            className="ty-display"
            lineClassName="ty-hero-title"
            delay={0.45}
            duration={1.2}
          />
          <MaskedLines
            as="p"
            inView={false}
            play={ready}
            lines={[<span key="s" className="ty-i">{business.tagline}</span>]}
            className="ty-display"
            delay={0.7}
            lineClassName="ty-hero-sub"
          />
          <motion.div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 24,
              marginTop: 34,
              pointerEvents: "auto",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: EASE, delay: 1.1 }}
          >
            <Magnetic>
              <a
                href={scheduleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ty-btn ty-btn--sm"
                style={{ color: "#f1eae1", borderColor: "rgba(241,234,225,0.5)" }}
                data-cursor="Agendar"
              >
                <span>Agendar</span>
                <span className="ty-btn__arrow" aria-hidden />
              </a>
            </Magnetic>
            <TransitionLink href={ROUTES.login} className="ty-link ty-link--caps" style={{ color: "#f1eae1" }}>
              Entrar no VIP
            </TransitionLink>
          </motion.div>
        </motion.div>

        {/* declaração (aparece quando a foto vira cartão) */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            padding: isMobile
              ? "0 var(--t-gutter) clamp(28px, 6vh, 56px)"
              : "0 var(--t-gutter)",
            opacity: stmtOpacity,
            y: stmtY,
            pointerEvents: stmtPointer,
          }}
        >
          <div style={{ maxWidth: isMobile ? "100%" : "44%" }}>
            <span className="ty-eyebrow" style={{ display: "block", marginBottom: 22 }}>
              Sobre
            </span>
            <h2 className="ty-display" style={{ fontSize: "clamp(34px, 5.2vw, 84px)" }}>
              Cílios feitos
              <br />
              com calma,
              <br />
              técnica e <em>cuidado.</em>
            </h2>
            <p className="ty-body" style={{ marginTop: 26, maxWidth: 440, fontSize: 16 }}>
              {business.name} trabalha com o olhar: aplicação, manutenção e os
              detalhes que só se percebem de perto. Quem volta ganha mais do que
              um horário. Ganha um lugar.
            </p>
          </div>
        </motion.div>

        {/* indicador de scroll */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            right: "var(--t-gutter)",
            bottom: 28,
            width: 1,
            height: 56,
            background: "rgba(241,234,225,0.35)",
            overflow: "hidden",
            opacity: titleOpacity,
          }}
        >
          <motion.div
            style={{ position: "absolute", inset: 0, background: "#f1eae1" }}
            animate={reduced ? undefined : { y: ["-100%", "100%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </section>

      <style>{`
        .ty-hero-title { font-size: clamp(76px, 17vw, 260px); letter-spacing: 0.02em; text-transform: uppercase; line-height: 0.86; }
        .ty-hero-sub { font-size: clamp(22px, 2.6vw, 40px); margin-top: 10px; }
      `}</style>
    </div>
  );
}
