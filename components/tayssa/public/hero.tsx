"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { BusinessSettings } from "@/lib/tayssa/config";
import { ROUTES } from "@/lib/tayssa/config";
import type { PhotoSlot } from "@/lib/tayssa/photos";
import { VIDEOS, temVideo, type VideoPresence } from "@/lib/tayssa/media";
import { MotionMedia } from "@/components/tayssa/ui/motion-media";
import { Arranjo, type Peca } from "@/components/tayssa/flora/arranjo";
import { useEstrutura } from "@/components/tayssa/ui/estrutura";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { useIntroReady } from "@/components/tayssa/public/experience";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** A frase de abertura, quebrada como o olho lê: três tempos. */
const LINHAS = [
  { texto: "Cílios que combinam", em: false },
  { texto: "com o seu rosto —", em: false },
  { texto: "não com a moda.", em: true },
];

/* Flores da abertura, em duas camadas. Atrás da marca: uma peônia clara
   (tom pétala) que a tipografia vinho atravessa sem perder leitura. Na
   frente: um botão bordô e uma rosa pequena que cruzam a ponta do "Lash"
   e correm mais rápido no scroll — é isso que dá profundidade. */
const FLORES_FUNDO: Peca[] = [
  { kind: "peonia", seed: 7, tom: "pétala", x: 84, y: 30, size: "clamp(260px, 40vw, 640px)", rotate: -12, depth: -0.4 },
  {
    kind: "rosa",
    seed: 3,
    tom: "rosa",
    x: 101,
    y: 58,
    size: "clamp(120px, 15vw, 250px)",
    rotate: 20,
    depth: -0.2,
    delay: 260,
    hideBelow: 768,
  },
  { kind: "folha", x: 71, y: 52, size: "clamp(34px, 3.4vw, 54px)", rotate: -58, depth: -0.3, hideBelow: 768 },
];
const FLORES_FRENTE: Peca[] = [
  {
    kind: "botao",
    seed: 11,
    tom: "bordo",
    x: 94,
    y: 16,
    size: "clamp(70px, 7.5vw, 120px)",
    rotate: 28,
    depth: 1,
    delay: 500,
  },
  {
    kind: "rosa",
    seed: 21,
    tom: "vinho",
    x: 62,
    y: 39,
    size: "clamp(64px, 6vw, 104px)",
    rotate: -8,
    depth: 0.7,
    delay: 380,
    hideBelow: 768,
  },
];
/* na janela da mídia: a peônia vinho morde o canto do arco */
const FLORES_JANELA: Peca[] = [
  { kind: "peonia", seed: 5, tom: "vinho", x: 4, y: 10, size: "46%", rotate: -16, depth: 0.6, delay: 640 },
  { kind: "folha", x: 22, y: 2, size: "11%", rotate: 34, depth: 0.5 },
  { kind: "botao", seed: 2, tom: "rosa", x: 98, y: 88, size: "20%", rotate: 150, depth: 0.4, delay: 820 },
];

/**
 * Abertura. A marca ocupa a largura inteira e sai pelas bordas: a
 * palavra é a imagem — e as flores da casa a atravessam, uma atrás e
 * outras na frente. Ao lado, a declaração em três tempos, com a última
 * linha em itálico serifado. Do outro lado, a janela em arco: vídeo real
 * quando existir, foto real quando não, e o campo tonal com a flor quando
 * nenhum dos dois — a composição nunca depende do material para existir.
 */
export function Hero({
  business,
  scheduleUrl,
  photo,
  video,
}: {
  business: BusinessSettings;
  scheduleUrl: string;
  /** foto de destaque da biblioteca; sem ela, o herói é tipográfico */
  photo?: PhotoSlot;
  /** quais arquivos do vídeo de abertura existem */
  video?: VideoPresence;
}) {
  const ready = useIntroReady();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // a marca desliza de leve enquanto a página sobe — só isso
  const marcaX = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -60]);
  const marcaO = useTransform(scrollYProgress, [0, 0.85], [1, 0.08]);

  const [primeira = "Tayssa", segunda = "Lash"] = business.name.trim().split(/\s+/);
  // a palavra ocupa a largura da tela: o corpo sai do número de letras
  const letras = `${primeira} ${segunda}`.length;
  const entra = ready && !reduced;

  const estrutura = useEstrutura();
  const temJanela = Boolean(photo) || temVideo(video);

  return (
    <section ref={ref} className="ty-hero" aria-label="Abertura">
      <Arranjo
        pecas={FLORES_FUNDO}
        className="ty-hero__flores ty-hero__flores--fundo"
        open={ready}
        track={ref}
        label="hero-fundo"
      />
      <div className="ty-hero__top">
        <motion.p
          className="ty-mono"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
        >
          {business.specialty}
        </motion.p>
        <motion.p
          className="ty-mono"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.18, ease: EASE }}
        >
          {business.instagram_handle}
        </motion.p>
      </div>

      {/* a marca é a imagem */}
      <motion.h1 className="ty-hero__marca" style={{ x: marcaX, opacity: marcaO }} aria-label={business.name}>
        <span className="ty-wordmark" style={{ "--ty-letras": letras } as React.CSSProperties} aria-hidden>
          <motion.span
            style={{ display: "inline-block" }}
            initial={reduced ? false : { y: "16%", opacity: 0 }}
            animate={entra ? { y: "0%", opacity: 1 } : reduced ? {} : { y: "16%", opacity: 0 }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            {primeira}
          </motion.span>{" "}
          <motion.em
            style={{ display: "inline-block" }}
            initial={reduced ? false : { y: "16%", opacity: 0 }}
            animate={entra ? { y: "0%", opacity: 1 } : reduced ? {} : { y: "16%", opacity: 0 }}
            transition={{ duration: 1.1, delay: 0.09, ease: EASE }}
          >
            {segunda}
          </motion.em>
        </span>
      </motion.h1>
      <Arranjo
        pecas={FLORES_FRENTE}
        className="ty-hero__flores ty-hero__flores--frente"
        open={ready}
        track={ref}
        label="hero-frente"
      />

      <div className="ty-hero__corpo">
        <div className="ty-hero__dizer">
          {LINHAS.map((l, i) => (
            <span key={l.texto} className="ty-hero__linha">
              <motion.span
                initial={reduced ? false : { y: "110%" }}
                animate={entra ? { y: "0%" } : reduced ? {} : { y: "110%" }}
                transition={{
                  duration: 0.95,
                  delay: 0.3 + i * 0.1,
                  ease: EASE,
                }}
              >
                {l.em ? <em>{l.texto}</em> : l.texto}
              </motion.span>
            </span>
          ))}

          <motion.div
            className="ty-hero__acoes"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={entra ? { opacity: 1, y: 0 } : reduced ? {} : { opacity: 0, y: 16 }}
            transition={{ duration: 0.8, delay: 0.72, ease: EASE }}
          >
            <a href={scheduleUrl} target="_blank" rel="noopener noreferrer" className="ty-btn ty-btn--solid">
              Agendar no WhatsApp
            </a>
            <TransitionLink href={ROUTES.signup} className="ty-hero__secundario">
              Pedir acesso ao clube
            </TransitionLink>
          </motion.div>
        </div>

        {/* a janela em arco: vídeo > foto > campo tonal com flor. Some só
            se não houver nem vídeo nem foto E não estivermos revisando a
            estrutura — aí a tipografia e as flores seguram a abertura. */}
        {temJanela || estrutura ? (
          <motion.figure
            className="ty-hero__figura"
            initial={reduced ? false : { opacity: 0, y: 30 }}
            animate={entra ? { opacity: 1, y: 0 } : reduced ? {} : { opacity: 0, y: 30 }}
            transition={{ duration: 1.3, delay: 0.42, ease: EASE }}
          >
            <div className="ty-hero__janela-wrap">
              <MotionMedia
                video={VIDEOS.hero}
                presence={video}
                photo={photo}
                className="ty-hero__janela"
                sizes="(max-width: 899px) 100vw, 34vw"
                priority
                pendente={{
                  titulo: "Vídeo de abertura",
                  detalhe:
                    "Loop de 6–10 s, sem som, horizontal 16:9 + vertical 9:16. Enquanto não chega, entra a foto do herói.",
                }}
              />
              <Arranjo
                pecas={FLORES_JANELA}
                className="ty-hero__flores-janela"
                open={ready}
                track={ref}
                label="hero-janela"
              />
            </div>
          </motion.figure>
        ) : null}
      </div>

      <motion.div
        className="ty-hero__ficha ty-rail"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 0.9, delay: 0.85, ease: EASE }}
      >
        <span>Fio a fio</span>
        <i aria-hidden>+</i>
        <span>Volume</span>
        <i aria-hidden>+</i>
        <span>Manutenção</span>
        <i aria-hidden>=</i>
        <span className="ty-mono--accent">o seu olhar</span>
      </motion.div>
    </section>
  );
}
