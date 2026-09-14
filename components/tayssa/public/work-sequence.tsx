"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useScroll, useTransform, type MotionValue } from "framer-motion";
import { PHOTOS, type PhotoSlot } from "@/lib/tayssa/photos";
import { RealPhoto } from "@/components/tayssa/ui/real-photo";
import { useIsMobile } from "@/components/tayssa/ui/use-media";

const FRAMES: { n: string; title: string; text: string; photo: PhotoSlot }[] = [
  { n: "01", title: "Fio a fio", text: "Natural, leve, um a um.", photo: PHOTOS.work01 },
  { n: "02", title: "Volume", text: "Presença, sem exagero.", photo: PHOTOS.work02 },
  { n: "03", title: "Manutenção", text: "O cuidado que mantém o resultado.", photo: PHOTOS.work03 },
];

/**
 * Transição 3 — storytelling em pin.
 * A seção prende por 3 telas. Cada foto entra por máscara de baixo pra
 * cima e assume o quadro; a legenda troca em sincronia. Ao final, solta.
 */
export function WorkSequence() {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <div id="trabalho" ref={ref} style={{ height: `${FRAMES.length * 100 + 60}vh`, position: "relative" }}>
      <section className="ty-pin" aria-label="Trabalho">
        <div
          className="ty-container"
          style={{
            height: "100%",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 5fr) minmax(0, 7fr)",
            alignItems: "center",
            gap: isMobile ? 18 : "clamp(32px, 5vw, 96px)",
            paddingTop: isMobile ? "calc(var(--t-nav-h) + 8px)" : 0,
            paddingBottom: isMobile ? 24 : 0,
          }}
        >
          {/* legendas */}
          <div style={{ position: "relative", minHeight: isMobile ? 184 : 260, order: isMobile ? 2 : 1 }}>
            <span className="ty-eyebrow" style={{ display: "block", marginBottom: isMobile ? 12 : 26 }}>
              Trabalho
            </span>
            {FRAMES.map((f, i) => (
              <Caption key={f.n} frame={f} index={i} progress={scrollYProgress} total={FRAMES.length} />
            ))}
            <Counter progress={scrollYProgress} total={FRAMES.length} />
          </div>

          {/* pilha de fotos */}
          <div
            style={{
              position: "relative",
              order: isMobile ? 1 : 2,
              aspectRatio: "4 / 5",
              width: isMobile ? "min(100%, calc(52svh * 0.8))" : "min(100%, calc(80vh * 0.8))",
              margin: isMobile ? "0 auto" : "0 0 0 auto",
              justifySelf: isMobile ? "center" : "end",
            }}
          >
            {FRAMES.map((f, i) => (
              <Frame key={f.n} frame={f} index={i} progress={scrollYProgress} total={FRAMES.length} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function bounds(index: number, total: number) {
  // cada quadro ocupa uma fatia igual do progresso
  const size = 1 / total;
  return { start: index * size, end: (index + 1) * size, size };
}

function Frame({
  frame,
  index,
  progress,
  total,
}: {
  frame: (typeof FRAMES)[number];
  index: number;
  progress: MotionValue<number>;
  total: number;
}) {
  const { start, size } = bounds(index, total);
  // entra por máscara (de baixo) na primeira metade da fatia; o primeiro já começa visível
  const reveal = useTransform(
    progress,
    index === 0 ? [0, 0.0001] : [start - size * 0.35, start + size * 0.25],
    index === 0 ? [0, 0] : [100, 0]
  );
  const clipPath = useMotionTemplate`inset(${reveal}% 0% 0% 0%)`;
  const scale = useTransform(
    progress,
    [start - size * 0.35, start + size * 0.25, start + size],
    [1.12, 1, 1.04]
  );
  const y = useTransform(progress, [start, start + size], [0, -18]);
  return (
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        clipPath,
        zIndex: index,
        willChange: "clip-path",
      }}
    >
      <motion.div style={{ position: "absolute", inset: 0, scale, y }}>
        <RealPhoto photo={frame.photo} ratio="fill" sizes="(max-width: 767px) 100vw, 55vw" style={{ height: "100%" }} />
      </motion.div>
    </motion.div>
  );
}

function Caption({
  frame,
  index,
  progress,
  total,
}: {
  frame: (typeof FRAMES)[number];
  index: number;
  progress: MotionValue<number>;
  total: number;
}) {
  const { start, end, size } = bounds(index, total);
  const isLast = index === total - 1;
  const inKeys = index === 0 ? [0, 0.0001] : [start - size * 0.1, start + size * 0.15];
  const outKeys = isLast ? [end + 1, end + 2] : [end - size * 0.15, end + size * 0.05];
  const opacity = useTransform(progress, [...inKeys, ...outKeys], [index === 0 ? 1 : 0, 1, 1, 0]);
  const y = useTransform(progress, [...inKeys, ...outKeys], [index === 0 ? 0 : 26, 0, 0, -20]);
  return (
    <motion.div
      style={{ position: "absolute", top: 40, left: 0, right: 0, opacity, y, pointerEvents: "none" }}
      aria-hidden={index !== 0}
    >
      <h3 className="ty-display" style={{ fontSize: "clamp(44px, 6vw, 104px)" }}>
        {frame.title}
      </h3>
      <p className="ty-body" style={{ marginTop: 14, fontSize: 16 }}>
        {frame.text}
      </p>
    </motion.div>
  );
}

function Counter({ progress, total }: { progress: MotionValue<number>; total: number }) {
  const current = useTransform(progress, (v) =>
    String(Math.min(total, Math.max(1, Math.floor(v * total) + 1))).padStart(2, "0")
  );
  const width = useTransform(progress, [0, 1], ["0%", "100%"]);
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, display: "flex", alignItems: "center", gap: 16 }}>
      <span className="ty-num" style={{ fontSize: 12, letterSpacing: "0.2em" }}>
        <motion.span>{current}</motion.span>
        <span className="ty-muted"> / {String(total).padStart(2, "0")}</span>
      </span>
      <span style={{ position: "relative", width: 96, height: 1, background: "var(--t-line)" }}>
        <motion.span style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: "var(--t-fg)", width }} />
      </span>
    </div>
  );
}
