"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { VIDEOS, temVideo, type VideoPresence } from "@/lib/tayssa/media";
import { MotionMedia } from "@/components/tayssa/ui/motion-media";
import { useEstrutura } from "@/components/tayssa/ui/estrutura";
import { Bloom } from "@/components/tayssa/flora/bloom";
import { useIsMobile } from "@/components/tayssa/ui/use-media";

/**
 * O filme — o processo de perto.
 *
 * A seção fica grudada na tela enquanto o scroll abre a janela: começa
 * como o arco da casa, no meio da página, e cresce até ocupar a tela
 * inteira. As duas flores que guardam os cantos do arco são empurradas
 * para fora conforme ele abre — a mídia nasce de dentro delas. Só
 * `clip-path`, `transform` e `opacity` se mexem.
 *
 * Sem vídeo real a seção não existe no site publicado (no modo estrutura
 * aparece com o espaço reservado). Foto não substitui o filme: ampliada
 * à tela cheia, a foto de hoje (recorte de 720px) desmancha. Com movimento reduzido, a janela já
 * nasce aberta e nada fica grudado.
 */
export function Film({ video }: { video?: VideoPresence }) {
  const estrutura = useEstrutura();
  // a seção só existe com vídeo (ou na revisão). O palco vive num
  // componente à parte para o `useScroll` nascer já com a seção montada —
  // com a referência vazia ele mediria a página inteira.
  if (!temVideo(video) && !estrutura) return null;
  return <Palco video={video} />;
}

function Palco({ video }: { video?: VideoPresence }) {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // o arco: inset do topo/laterais/base em %, raio do topo em px
  const ini = mobile ? [16, 10, 18] : [14, 33, 12];
  const k = useTransform(scrollYProgress, [0.05, 0.62], [0, 1], { clamp: true });
  const clip = useTransform(k, (v) => {
    if (reduced) return "inset(0% 0% 0% 0% round 0px)";
    const [t, l, b] = ini.map((n) => (n * (1 - v)).toFixed(2));
    const r = Math.round(600 * (1 - v));
    return `inset(${t}% ${l}% ${b}% ${l}% round ${r}px ${r}px 0px 0px)`;
  });
  const escala = useTransform(k, [0, 1], reduced ? [1, 1] : [1.18, 1]);
  const flor = useTransform(k, [0, 1], reduced ? [1, 1] : [1, 0.6]);
  const florE = useTransform(k, [0, 1], reduced ? ["0vw", "0vw"] : ["0vw", "-22vw"]);
  const florD = useTransform(k, [0, 1], reduced ? ["0vw", "0vw"] : ["0vw", "22vw"]);
  const tituloO = useTransform(scrollYProgress, [0, 0.12, 0.3], reduced ? [1, 1, 1] : [1, 1, 0]);
  const legendaO = useTransform(scrollYProgress, [0.55, 0.7], reduced ? [1, 1] : [0, 1]);

  return (
    <section ref={ref} id="filme" className="tyfm" aria-label="O processo, de perto">
      <div className="tyfm__palco">
        <motion.h2 className="tyfm__titulo" style={{ opacity: tituloO }}>
          O olhar, <em>de perto</em>.
        </motion.h2>

        <motion.div className="tyfm__janela" style={{ clipPath: clip }}>
          <motion.div className="tyfm__escala" style={{ scale: escala }}>
            <MotionMedia
              video={VIDEOS.processo}
              presence={video}
              className="tyfm__midia"
              sizes="100vw"
              pendente={{
                titulo: "Filme do processo",
                detalhe:
                  "20–40 s, horizontal 16:9 (1920×1080) + vertical 9:16 (1080×1920), sem som, sem texto queimado. Abre até a tela cheia no scroll.",
              }}
            />
          </motion.div>
          <motion.p className="tyfm__legenda ty-mono" style={{ opacity: legendaO }}>
            {VIDEOS.processo.label}
          </motion.p>
        </motion.div>

        <motion.div className="tyfm__flor tyfm__flor--e" style={{ x: florE, scale: flor }} aria-hidden>
          <Bloom kind="flor" seed={41} tom="magenta" />
        </motion.div>
        <motion.div className="tyfm__flor tyfm__flor--d" style={{ x: florD, scale: flor }} aria-hidden>
          <Bloom kind="flor" seed={17} tom="vinho" />
        </motion.div>
      </div>
    </section>
  );
}
