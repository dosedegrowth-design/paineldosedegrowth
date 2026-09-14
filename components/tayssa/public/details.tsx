"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { PHOTOS, type PhotoSlot } from "@/lib/tayssa/photos";
import { RealPhoto } from "@/components/tayssa/ui/real-photo";
import { useIsMobile } from "@/components/tayssa/ui/use-media";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";

const ITEMS: { photo: PhotoSlot; w: number; offset: number; kind: "foto" | "publicação" }[] = [
  { photo: PHOTOS.detail01, w: 30, offset: 0, kind: "foto" },
  { photo: PHOTOS.detail02, w: 22, offset: 14, kind: "publicação" },
  { photo: PHOTOS.detail03, w: 34, offset: -6, kind: "foto" },
  { photo: PHOTOS.detail04, w: 22, offset: 18, kind: "publicação" },
  { photo: PHOTOS.detail05, w: 28, offset: 2, kind: "foto" },
  { photo: PHOTOS.detail06, w: 22, offset: 12, kind: "publicação" },
];

/**
 * Transição 5 — vertical vira horizontal.
 * A seção prende e um trilho de fotos e prints reais do Instagram corre
 * na horizontal enquanto a página desce. A tipografia fica ancorada.
 * No mobile o trilho é um scroll horizontal nativo (gesto deliberado).
 */
export function Details({ instagramUrl, handle }: { instagramUrl: string; handle: string }) {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.08, 0.95], [0, -distance]);

  useEffect(() => {
    const measure = () => {
      const rail = railRef.current;
      if (!rail) return;
      setDistance(Math.max(0, rail.scrollWidth - window.innerWidth + 24));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (railRef.current) ro.observe(railRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isMobile]);

  const head = (
    <div style={{ flex: "none", width: isMobile ? "78vw" : "min(34vw, 520px)", paddingRight: isMobile ? 0 : 24 }}>
      <Reveal>
        <span className="ty-eyebrow" style={{ display: "block", marginBottom: 20 }}>
          Real
        </span>
      </Reveal>
      <MaskedLines
        as="h2"
        className="ty-display"
        lineClassName="ty-details-title"
        lines={["Trabalho real.", <em key="c">Clientes reais.</em>]}
      />
      <Reveal delay={0.15}>
        <p className="ty-body" style={{ marginTop: 22, maxWidth: 380 }}>
          Sem banco de imagens. O que está aqui saiu do estúdio e do {handle}.
          Publicações aparecem como são: prints, com a textura de quem posta o próprio trabalho.
        </p>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ty-link ty-link--caps"
          style={{ marginTop: 24, display: "inline-block" }}
        >
          Ver mais no Instagram
        </a>
      </Reveal>
    </div>
  );

  if (isMobile || reduced) {
    return (
      <section className="ty-section" aria-label="Trabalho real" style={{ paddingBottom: 0 }}>
        <div className="ty-container">{head}</div>
        <div
          style={{
            display: "flex",
            gap: 14,
            overflowX: "auto",
            padding: "32px var(--t-gutter) 64px",
            scrollSnapType: "x proximity",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {ITEMS.map((it, i) => (
            <div key={i} style={{ flex: "none", width: `${Math.max(56, it.w * 2.2)}vw`, scrollSnapAlign: "start" }}>
              <RealPhoto photo={it.photo} sizes="70vw" showCaption />
              <span className="ty-small" style={{ display: "block", marginTop: 8, letterSpacing: "0.18em", textTransform: "uppercase", fontSize: 10 }}>
                {it.kind} · {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div ref={ref} style={{ height: "300vh", position: "relative" }}>
      <section className="ty-pin" aria-label="Trabalho real" style={{ display: "flex", alignItems: "center" }}>
        <motion.div
          ref={railRef}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(24px, 3vw, 56px)",
            paddingLeft: "var(--t-gutter)",
            paddingRight: "var(--t-gutter)",
            x,
            willChange: "transform",
          }}
        >
          {head}
          {ITEMS.map((it, i) => (
            <RailItem key={i} item={it} index={i} progress={scrollYProgress} />
          ))}
          <div style={{ flex: "none", width: "12vw" }} />
        </motion.div>
      </section>
      <style>{`.ty-details-title { font-size: clamp(33px, 3.5vw, 47px); }`}</style>
    </div>
  );
}

function RailItem({
  item,
  index,
  progress,
}: {
  item: (typeof ITEMS)[number];
  index: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  // cada foto tem uma leve deriva vertical própria — profundidade sem exagero
  const y = useTransform(progress, [0, 1], [item.offset * 2, -item.offset * 2]);
  return (
    <motion.figure
      style={{
        flex: "none",
        width: `${item.w}vw`,
        maxWidth: 520,
        margin: 0,
        y,
        marginTop: `${item.offset}vh`,
      }}
    >
      <RealPhoto photo={item.photo} sizes="34vw" hover showCaption />
      <figcaption
        className="ty-small"
        style={{ marginTop: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontSize: 10 }}
      >
        {item.kind} · {String(index + 1).padStart(2, "0")}
      </figcaption>
    </motion.figure>
  );
}
