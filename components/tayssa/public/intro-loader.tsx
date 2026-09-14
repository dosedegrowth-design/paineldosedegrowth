"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const KEY = "ty_intro_seen";
const LETTERS = ["T", "A", "Y", "S", "S", "A"];
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Abertura: uma vez por sessão. "TAYSSA" sobe por máscara letra a letra,
 * uma linha fina cresce, a cortina levanta revelando o hero. ~1.9s.
 */
export function IntroLoader({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"boot" | "show" | "lift" | "gone">("boot");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {}
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (seen || reduced) {
      // repetiu a visita nesta sessão: some no próximo frame, sem cerimônia
      timers.push(
        setTimeout(() => {
          setPhase("gone");
          onDone();
        }, 0)
      );
    } else {
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      timers.push(setTimeout(() => setPhase("show"), 0));
      timers.push(setTimeout(() => setPhase("lift"), 1350));
      timers.push(setTimeout(() => onDone(), 1650));
      timers.push(setTimeout(() => setPhase("gone"), 2300));
    }
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {phase !== "gone" ? (
        <motion.div
          className="ty-loader"
          aria-hidden
          initial={{ clipPath: "inset(0 0 0 0)" }}
          animate={{ clipPath: phase === "lift" ? "inset(0 0 100% 0)" : "inset(0 0 0 0)" }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          style={{ willChange: "clip-path" }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
            <div
              className="ty-display"
              style={{
                display: "flex",
                gap: "0.06em",
                fontSize: "clamp(40px, 8vw, 96px)",
                letterSpacing: "0.18em",
                paddingLeft: "0.18em",
              }}
            >
              {LETTERS.map((l, i) => (
                <span key={i} className="ty-mask" style={{ display: "inline-block" }}>
                  <motion.span
                    style={{ display: "inline-block" }}
                    initial={{ y: "110%" }}
                    animate={{ y: phase === "boot" ? "110%" : "0%" }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.08 + i * 0.06 }}
                  >
                    {l}
                  </motion.span>
                </span>
              ))}
            </div>
            <motion.div
              style={{
                width: 160,
                height: 1,
                background: "rgba(241,234,225,0.22)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <motion.div
                style={{ position: "absolute", inset: 0, background: "#f1eae1", transformOrigin: "left" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: phase === "boot" ? 0 : 1 }}
                transition={{ duration: 1.15, ease: EASE, delay: 0.2 }}
              />
            </motion.div>
            <motion.span
              className="ty-eyebrow"
              style={{ color: "rgba(241,234,225,0.55)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "boot" ? 0 : 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Private Beauty Experience
            </motion.span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
