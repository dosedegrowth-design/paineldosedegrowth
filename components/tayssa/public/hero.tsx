"use client";

import { useRef, type PointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "framer-motion";
import type { BusinessSettings } from "@/lib/tayssa/config";
import { ROUTES } from "@/lib/tayssa/config";
import type { PhotoSlot } from "@/lib/tayssa/photos";
import type { FloraTom, FlowerKind } from "@/lib/tayssa/flora";
import { VIDEOS, temVideo, type VideoPresence } from "@/lib/tayssa/media";
import { MotionMedia } from "@/components/tayssa/ui/motion-media";
import { Bloom } from "@/components/tayssa/flora/bloom";
import { FundoVivo } from "@/components/tayssa/ui/fundo-vivo";
import { useEstrutura } from "@/components/tayssa/ui/estrutura";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { useIntroReady } from "@/components/tayssa/public/experience";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];


/* Flores que vivem em volta da janela, em profundidades diferentes: as de
   trás andam pouco com o mouse, as da frente andam muito — é isso que dá
   o volume. Cada uma também flutua sozinha, num tempo próprio. */
type FlorPalco = {
  kind: FlowerKind;
  seed: number;
  tom: FloraTom;
  /** posição no palco, em % */
  x: number;
  y: number;
  /** largura, em % da largura do palco */
  w: number;
  rotate: number;
  /** quanto anda com o mouse (negativo = contra) */
  depth: number;
  /** some no celular */
  desktop?: boolean;
  delay: number;
  frente?: boolean;
};
const FLORES: FlorPalco[] = [
  { kind: "flor", seed: 7, tom: "pétala", x: -6, y: 52, w: 46, rotate: -18, depth: -0.5, delay: 0.5, desktop: true },
  { kind: "flor", seed: 5, tom: "magenta", x: 70, y: 6, w: 40, rotate: 16, depth: 0.9, delay: 0.75, frente: true },
  { kind: "flor", seed: 3, tom: "rosa", x: 82, y: 70, w: 30, rotate: -30, depth: -0.35, delay: 0.9 },
  { kind: "botao", seed: 11, tom: "magenta", x: 2, y: 8, w: 9, rotate: -22, depth: 1.4, delay: 1.05, frente: true },
  { kind: "botao", seed: 4, tom: "rosa", x: 96, y: 40, w: 7, rotate: 28, depth: 1.2, delay: 1.15, frente: true, desktop: true },
];

/**
 * Abertura, na linguagem do site da iWin: fundo vinho vivo, o nome dela
 * entrando letra a letra no centro, com letra de volume, os dois caminhos em cápsula — e embaixo a
 * janela em arco flutuando em 3D, que segue o mouse (no celular, o
 * scroll), com as flores da casa em volta em profundidades diferentes.
 */
export function Hero({
  business,
  scheduleUrl,
  photo,
  video,
}: {
  business: BusinessSettings;
  scheduleUrl: string;
  /** foto de destaque da biblioteca; sem ela, a janela mostra a flor */
  photo?: PhotoSlot;
  /** quais arquivos do vídeo de abertura existem */
  video?: VideoPresence;
}) {
  const ready = useIntroReady();
  const reduced = useReducedMotion();
  const estrutura = useEstrutura();
  const ref = useRef<HTMLElement>(null);
  const entra = ready || Boolean(reduced);

  // mouse: -0.5..0.5 nos dois eixos, com mola (nada anda seco)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 70, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 70, damping: 18, mass: 0.6 });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // ao descer: a frase sobe e apaga, a janela sobe e cresce, como o iPhone da iWin
  const textoY = useTransform(scrollYProgress, [0, 0.6], [0, reduced ? 0 : -90]);
  const textoO = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const palcoY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -140]);
  const palcoS = useTransform(scrollYProgress, [0, 0.7], [1, reduced ? 1 : 1.08]);
  // a janela inclina com o mouse; no toque, o scroll dá um giro leve
  const giroScroll = useTransform(scrollYProgress, [0, 0.8], [0, reduced ? 0 : -10]);
  const rotY = useTransform(sx, [-0.5, 0.5], [reduced ? 0 : -12, reduced ? 0 : 12]);
  const rotXmouse = useTransform(sy, [-0.5, 0.5], [reduced ? 0 : 9, reduced ? 0 : -9]);
  const rotX = useTransform(() => rotXmouse.get() + giroScroll.get());
  // o brilho do vidro corre no sentido contrário do giro
  const brilhoX = useTransform(sx, [-0.5, 0.5], ["70%", "30%"]);
  const brilhoY = useTransform(sy, [-0.5, 0.5], ["70%", "30%"]);
  const brilho = useTransform(
    () => `radial-gradient(60% 50% at ${brilhoX.get()} ${brilhoY.get()}, rgba(255,230,238,.28), transparent 70%)`
  );

  const mover = (e: PointerEvent<HTMLElement>) => {
    if (reduced || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const soltar = () => {
    mx.set(0);
    my.set(0);
  };

  const temJanela = Boolean(photo) || temVideo(video) || estrutura;
  // o nome dela entra letra a letra: sobe, gira de leve no eixo X e ganha foco
  const [primeira = "Tayssa", segunda = "Lash"] = business.name.trim().split(/\s+/);
  const letras = (palavra: string, base: number) =>
    Array.from(palavra).map((l, i) => (
      <motion.span
        key={`${l}-${i}`}
        className="tyh__letra"
        initial={reduced ? false : { opacity: 0, y: "0.45em", rotateX: -70, filter: "blur(14px)" }}
        animate={entra ? { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" } : undefined}
        transition={{ duration: 1.1, delay: base + i * 0.055, ease: EASE }}
      >
        {l}
      </motion.span>
    ));
  // o nome também acompanha o mouse, mais devagar que a janela
  const nomeY = useTransform(sy, [-0.5, 0.5], [reduced ? 0 : 5, reduced ? 0 : -5]);
  const nomeRotY = useTransform(sx, [-0.5, 0.5], [reduced ? 0 : -6, reduced ? 0 : 6]);
  const nomeRotX = useTransform(sy, [-0.5, 0.5], [reduced ? 0 : 5, reduced ? 0 : -5]);

  return (
    <section
      ref={ref}
      className="tyh ty-night"
      aria-label="Abertura"
      onPointerMove={mover}
      onPointerLeave={soltar}
    >
      <FundoVivo />

      <motion.div className="tyh__texto" style={{ y: textoY, opacity: textoO }}>
        <motion.h1
          className="tyh__nome"
          aria-label={business.name}
          style={{ rotateX: nomeRotX, rotateY: nomeRotY, y: nomeY }}
        >
          <span aria-hidden className="tyh__nome-parte">
            {letras(primeira, 0.15)}
          </span>
          {segunda ? (
            <span aria-hidden className="tyh__nome-parte tyh__nome-parte--leve">
              {letras(segunda, 0.15 + primeira.length * 0.055 + 0.08)}
            </span>
          ) : null}
        </motion.h1>

        <motion.p
          className="tyh__oficio"
          initial={reduced ? false : { opacity: 0, y: 12, filter: "blur(6px)" }}
          animate={entra ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
          transition={{ duration: 0.9, delay: 0.15 + (primeira.length + (segunda?.length ?? 0)) * 0.055 + 0.2, ease: EASE }}
        >
          {business.specialty}
        </motion.p>

        <motion.div
          className="tyh__acoes"
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={entra ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, delay: 0.85, ease: EASE }}
        >
          <a href={scheduleUrl} target="_blank" rel="noopener noreferrer" className="tyh__btn tyh__btn--claro">
            Agendar no WhatsApp
            <span className="tyh__seta" aria-hidden />
          </a>
          <TransitionLink href={ROUTES.signup} className="tyh__btn tyh__btn--vidro">
            Pedir acesso ao VIP
          </TransitionLink>
        </motion.div>
      </motion.div>

      <motion.div className="tyh__palco" style={{ y: palcoY, scale: palcoS }}>
        <div className="tyh__halo" aria-hidden />
        {FLORES.filter((f) => !f.frente).map((f, i) => (
          <FlorViva key={`t${i}`} f={f} sx={sx} sy={sy} ready={entra} reduced={Boolean(reduced)} />
        ))}

        <motion.figure
          className="tyh__janela"
          style={{ rotateX: rotX, rotateY: rotY }}
          initial={reduced ? false : { opacity: 0, y: 80, rotateX: 18 }}
          animate={entra ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1.4, delay: 0.45, ease: EASE }}
        >
          <div className="tyh__janela-corpo">
            {temJanela ? (
              <MotionMedia
                video={VIDEOS.hero}
                presence={video}
                photo={photo}
                className="tyh__midia"
                sizes="(max-width: 899px) 80vw, 420px"
                priority
                pendente={{
                  titulo: "Vídeo de abertura",
                  detalhe:
                    "Loop de 6–10 s, sem som, horizontal 16:9 + vertical 9:16. Enquanto não chega, entra a foto do herói.",
                }}
              />
            ) : (
              <div className="tyh__midia tyh__midia--flor" aria-hidden>
                <Bloom seed={5} tom="magenta" open={entra} delay={600} />
              </div>
            )}
            <motion.span className="tyh__vidro" style={{ background: brilho }} aria-hidden />
          </div>
        </motion.figure>

        {FLORES.filter((f) => f.frente).map((f, i) => (
          <FlorViva key={`f${i}`} f={f} sx={sx} sy={sy} ready={entra} reduced={Boolean(reduced)} />
        ))}
      </motion.div>

      <motion.a
        href="#trabalho"
        className="tyh__descer"
        initial={reduced ? false : { opacity: 0 }}
        animate={entra ? { opacity: 1 } : undefined}
        transition={{ duration: 0.8, delay: 1.4 }}
        aria-label="Ver o trabalho"
      >
        <span aria-hidden />
      </motion.a>
    </section>
  );
}

function FlorViva({
  f,
  sx,
  sy,
  ready,
  reduced,
}: {
  f: FlorPalco;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  ready: boolean;
  reduced: boolean;
}) {
  const x = useTransform(sx, [-0.5, 0.5], [-60 * f.depth, 60 * f.depth]);
  const y = useTransform(sy, [-0.5, 0.5], [-40 * f.depth, 40 * f.depth]);
  return (
    <motion.div
      className={["tyh__flor", f.frente ? "tyh__flor--frente" : "", f.desktop ? "tyh__flor--desktop" : ""].join(" ")}
      style={
        {
          left: `${f.x}%`,
          top: `${f.y}%`,
          width: `${f.w}%`,
          x: reduced ? 0 : x,
          y: reduced ? 0 : y,
          "--r": `${f.rotate}deg`,
          "--t": `${5 + (f.seed % 4)}s`,
        } as MotionStyle
      }
      initial={reduced ? false : { opacity: 0, scale: 0.6 }}
      animate={ready ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 1.2, delay: f.delay, ease: EASE }}
    >
      <div className="tyh__flor-flutua">
        <Bloom kind={f.kind} seed={f.seed} tom={f.tom} open={ready} delay={f.delay * 1000} />
      </div>
    </motion.div>
  );
}
