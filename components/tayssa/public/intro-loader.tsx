"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { flor } from "@/lib/tayssa/flora";
import { Bloom } from "@/components/tayssa/flora/bloom";

const KEY = "ty_intro_seen";
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const INOUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

type Fase = "boot" | "risca" | "cor" | "abre" | "fim";

/**
 * Abertura — uma vez por sessão (~2,8 s), na linguagem do deltacafes.com:
 *
 * 1. risca  — sobre o vinho do teto do estúdio, a flor da parede se
 *             desenha em contorno, pétala por pétala;
 * 2. cor    — a flor ganha cor e abre; "Tayssa" e "Lash" deslizam para
 *             fora de trás dela, um para cada lado;
 * 3. abre   — as palavras somem e a flor cresce até virar a janela: o
 *             véu tem um furo no formato dela, que se expande e revela o
 *             site por dentro da flor.
 *
 * Com movimento reduzido (ou na segunda visita da sessão) não existe.
 */
export function IntroLoader({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const [fase, setFase] = useState<Fase>("boot");
  const petalas = useMemo(() => flor("flor", 5, "magenta"), []);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {}
    const t: ReturnType<typeof setTimeout>[] = [];
    if (seen || reduced) {
      t.push(
        setTimeout(() => {
          setFase("fim");
          onDone();
        }, 0),
      );
    } else {
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      t.push(setTimeout(() => setFase("risca"), 60));
      t.push(setTimeout(() => setFase("cor"), 900));
      t.push(setTimeout(() => setFase("abre"), 2050));
      t.push(setTimeout(() => onDone(), 2250));
      t.push(setTimeout(() => setFase("fim"), 3000));
    }
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abre = fase === "abre";
  const comCor = fase === "cor" || abre;

  return (
    <AnimatePresence>
      {fase !== "fim" ? (
        <motion.div
          className="ty-loader ty-loader--flor"
          aria-hidden
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          {/* o véu: vinho com um furo no formato da flor, que cresce */}
          <svg className="ty-loader__veu" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
            <defs>
              <mask id="ty-veu" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">
                <rect width="1000" height="1000" fill="white" />
                {/* o furo só existe quando abre: antes da hidratação não há
                    transformação aplicada, e ele apareceria inteiro */}
                {abre ? (
                  <motion.g
                    style={{ transformBox: "view-box", transformOrigin: "500px 520px" }}
                    initial={{ scale: 0.001 }}
                    animate={{ scale: 34 }}
                    transition={{ duration: 1.05, ease: INOUT }}
                  >
                    <g transform="translate(500 545) scale(0.55)">
                      {petalas.map((p, i) => (
                        <path key={i} d={p.camadas[0].d} transform={`rotate(${p.a})`} fill="black" />
                      ))}
                    </g>
                  </motion.g>
                ) : null}
              </mask>
            </defs>
            <rect width="1000" height="1000" fill="var(--t-noir)" mask="url(#ty-veu)" />
          </svg>

          <motion.div
            className="ty-loader__palco"
            animate={abre ? { scale: 5, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ duration: abre ? 0.9 : 0.3, ease: INOUT }}
          >
            {/* palavra da esquerda sai de trás da flor */}
            <span className="ty-loader__lado ty-loader__lado--e">
              <motion.span
                initial={{ x: "105%" }}
                animate={{ x: comCor && !abre ? "0%" : "105%" }}
                transition={{ duration: 0.9, ease: EASE, delay: comCor && !abre ? 0.2 : 0 }}
              >
                Tayssa
              </motion.span>
            </span>

            <span className="ty-loader__marca">
              {/* o contorno que se desenha */}
              <svg className="ty-loader__risco" viewBox="-125 -125 250 170">
                {petalas.map((p, i) => (
                  <motion.path
                    key={i}
                    d={p.camadas[0].d}
                    transform={`rotate(${p.a})`}
                    fill="none"
                    stroke="#d797a8"
                    strokeWidth={0.9}
                    pathLength={1}
                    initial={{ pathLength: 0, opacity: 1 }}
                    animate={{
                      pathLength: fase === "boot" ? 0 : 1,
                      opacity: comCor ? 0 : 1,
                    }}
                    transition={{
                      pathLength: { duration: 0.75, ease: INOUT, delay: i * 0.018 },
                      opacity: { duration: 0.5 },
                    }}
                  />
                ))}
              </svg>
              {/* a cor chega por cima do risco */}
              <Bloom kind="flor" seed={5} tom="magenta" open={comCor} className="ty-loader__cor" />
            </span>

            <span className="ty-loader__lado ty-loader__lado--d">
              <motion.span
                initial={{ x: "-105%" }}
                animate={{ x: comCor && !abre ? "0%" : "-105%" }}
                transition={{ duration: 0.9, ease: EASE, delay: comCor && !abre ? 0.28 : 0 }}
              >
                <em>Lash</em>
              </motion.span>
            </span>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
