"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { BusinessSettings } from "@/lib/tayssa/config";
import { ROUTES } from "@/lib/tayssa/config";
import type { PhotoSlot } from "@/lib/tayssa/photos";
import { RealPhoto } from "@/components/tayssa/ui/real-photo";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { useIsMobile } from "@/components/tayssa/ui/use-media";
import { useIntroReady } from "@/components/tayssa/public/experience";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** A frase de abertura, quebrada como o olho lê: três tempos. */
const LINHAS = [
  { texto: "Cílios que combinam", em: false },
  { texto: "com o seu rosto —", em: false },
  { texto: "não com a moda.", em: true },
];

/**
 * Abertura. A marca ocupa a largura inteira e sai pelas bordas: a
 * palavra é a imagem. Ao lado, a declaração em três tempos, com a
 * última linha em itálico serifado. Embaixo, a ficha técnica do que a
 * casa faz. Foto entra como peça chapada — e só quando existe de
 * verdade; sem ela, a composição se sustenta na tipografia.
 */
export function Hero({
  business,
  scheduleUrl,
  photo,
}: {
  business: BusinessSettings;
  scheduleUrl: string;
  /** foto de destaque da biblioteca; sem ela, o herói é tipográfico */
  photo?: PhotoSlot;
}) {
  const ready = useIntroReady();
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // a marca desliza de leve enquanto a página sobe — só isso
  const marcaX = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -60]);
  const marcaO = useTransform(scrollYProgress, [0, 0.85], [1, 0.08]);

  const [primeira = "Tayssa", segunda = "Lash"] = business.name.trim().split(/\s+/);
  // a palavra ocupa a largura da tela: o corpo sai do número de letras
  const letras = `${primeira} ${segunda}`.length;
  const entra = ready && !reduced;

  return (
    <section ref={ref} className="ty-hero" aria-label="Abertura">
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

      <div className="ty-hero__corpo">
        <div className="ty-hero__dizer">
          {LINHAS.map((l, i) => (
            <span key={l.texto} className="ty-hero__linha">
              <motion.span
                initial={reduced ? false : { y: "110%" }}
                animate={entra ? { y: "0%" } : reduced ? {} : { y: "110%" }}
                transition={{ duration: 0.95, delay: 0.3 + i * 0.1, ease: EASE }}
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

        {/* a foto é opcional: entra chapada, sem moldura, quando existe */}
        {photo ? (
          <motion.figure
            className="ty-hero__figura ty-figure"
            initial={reduced ? false : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={
              entra
                ? { opacity: 1, clipPath: "inset(0 0 0% 0)" }
                : reduced
                  ? {}
                  : { opacity: 0, clipPath: "inset(0 0 100% 0)" }
            }
            transition={{ duration: 1.3, delay: 0.42, ease: EASE }}
          >
            <RealPhoto photo={photo} ratio={isMobile ? 4 / 5 : 3 / 4} sizes="(max-width: 899px) 100vw, 38vw" priority />
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
