"use client";

import { useRef, type PointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "framer-motion";
import { useProgressoRolagem } from "@/components/tayssa/ui/rolagem";
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
import { LinkAgendar } from "@/components/tayssa/public/agendar";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];


/* Flores no fundo, atrás da janela: pequenas, aparecendo pelas bordas da
   foto, e andam pouco com o mouse (o que está longe anda pouco). Nenhuma
   passa na frente da foto dela (pedido do Lucas, 29/10/2026: estavam em
   cima do retrato e grandes demais). Cada uma flutua no seu tempo. */
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
  /**
   * lugar no celular, em %: lá a janela ocupa quase toda a largura e em cima
   * dela estão os botões, então as flores ficam no chão, embaixo e dos lados
   */
  cel?: { x: number; y: number };
  delay: number;
};
const FLORES: FlorPalco[] = [
  { kind: "flor", seed: 5, tom: "magenta", x: 64, y: -16, w: 17, rotate: 16, depth: 0.3, delay: 0.75, cel: { x: 70, y: 97 } },
  { kind: "flor", seed: 3, tom: "rosa", x: 12, y: 78, w: 14, rotate: -24, depth: -0.25, delay: 0.9, cel: { x: 10, y: 99 } },
  { kind: "flor", seed: 7, tom: "pétala", x: 76, y: 62, w: 16, rotate: -14, depth: -0.2, delay: 0.5, desktop: true },
  { kind: "botao", seed: 11, tom: "magenta", x: 20, y: -6, w: 5, rotate: -22, depth: 0.4, delay: 1.05, cel: { x: 0.5, y: 34 } },
  { kind: "botao", seed: 4, tom: "rosa", x: 84, y: 30, w: 4.5, rotate: 28, depth: 0.35, delay: 1.15, desktop: true },
];

/**
 * Abertura, na linguagem do site da iWin: fundo vinho vivo, o nome dela
 * entrando letra a letra no centro, com letra de volume, os dois caminhos em cápsula — e embaixo a
 * janela quadrada flutuando em 3D, que segue o mouse (no celular, o
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

  const scrollYProgress = useProgressoRolagem(ref, ["start start", "end start"]);
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
        // no fim, o filtro sai de vez: blur(0px) parado ainda é um efeito refeito a cada quadro
        animate={entra ? { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } } : undefined}
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
          {/* o traço de assinatura: corre por baixo do nome e fecha num
              laço, desenhado depois que a última letra chega */}
          <svg className="tyh__assina" viewBox="0 0 720 70" preserveAspectRatio="none" aria-hidden focusable="false">
            <defs>
              <linearGradient id="tyh-assina-cor" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#f7c1d1" stopOpacity="0" />
                <stop offset="0.18" stopColor="#f7c1d1" />
                <stop offset="0.7" stopColor="#f08cad" />
                <stop offset="1" stopColor="#e8bf86" />
              </linearGradient>
            </defs>
            <motion.path
              d="M6 44 C 120 30, 250 56, 400 40 S 610 24, 668 36 C 704 44, 708 18, 684 20 C 664 22, 672 48, 714 52"
              fill="none"
              stroke="url(#tyh-assina-cor)"
              strokeWidth="3.2"
              strokeLinecap="round"
              initial={reduced ? false : { pathLength: 0, opacity: 0 }}
              animate={entra ? { pathLength: 1, opacity: 1 } : undefined}
              transition={{
                pathLength: { duration: 1.4, delay: 0.25 + (primeira.length + (segunda?.length ?? 0)) * 0.055, ease: [0.65, 0, 0.35, 1] },
                opacity: { duration: 0.2, delay: 0.25 + (primeira.length + (segunda?.length ?? 0)) * 0.055 },
              }}
            />
          </svg>
        </motion.h1>

        <motion.p
          className="tyh__oficio"
          initial={reduced ? false : { opacity: 0, y: 12, filter: "blur(6px)" }}
          animate={entra ? { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } } : undefined}
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
          <LinkAgendar href={scheduleUrl} className="tyh__btn tyh__btn--claro">
            Agendar horário
            <span className="tyh__seta" aria-hidden />
          </LinkAgendar>
          <TransitionLink href={ROUTES.signup} className="tyh__btn tyh__btn--vidro">
            Pedir acesso ao VIP
          </TransitionLink>
        </motion.div>
      </motion.div>

      <motion.div className="tyh__palco" style={{ y: palcoY, scale: palcoS }}>
        <div className="tyh__halo" aria-hidden />
        {/* as flores moram no fundo: todas antes da janela, nenhuma por cima da foto */}
        {FLORES.map((f, i) => (
          <FlorViva key={i} f={f} sx={sx} sy={sy} ready={entra} reduced={Boolean(reduced)} />
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
      className={["tyh__flor", f.desktop ? "tyh__flor--desktop" : ""].join(" ")}
      style={
        {
          "--x": `${f.x}%`,
          "--y": `${f.y}%`,
          "--xc": `${f.cel?.x ?? f.x}%`,
          "--yc": `${f.cel?.y ?? f.y}%`,
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
