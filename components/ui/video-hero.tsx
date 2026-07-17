"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* Hero de tela cheia com vídeo de fundo (adaptado do padrão 21st.dev
   "NeuralKinetics"): vídeo full-viewport atrás de tudo, conteúdo ancorado
   na base sobre um fade em gradiente, animações de entrada suaves com
   ease [0.16, 1, 0.3, 1]. Genérico: tema e conteúdo vêm do consumidor. */

const EASE = [0.16, 1, 0.3, 1] as const;

interface VideoHeroProps {
  videoSrc: string;
  /** fonte WebM/VP9 opcional — navegadores preferem, arquivo menor */
  videoSrcWebm?: string;
  poster?: string;
  /** quando false, renderiza só o poster (prefers-reduced-motion) */
  playVideo?: boolean;
  /** camadas de overlay sobre o vídeo (gradientes, vinhetas) */
  overlay?: React.ReactNode;
  /** conteúdo ancorado na base */
  children?: React.ReactNode;
  /** classes do wrapper do rodapé (gradiente de fundo etc.) */
  footerClassName?: string;
  className?: string;
}

export function VideoHero({
  videoSrc,
  videoSrcWebm,
  poster,
  playVideo = true,
  overlay,
  children,
  footerClassName,
  className,
}: VideoHeroProps) {
  return (
    <section
      className={cn(
        "relative min-h-[100svh] flex flex-col justify-end overflow-hidden",
        className
      )}
    >
      {/* vídeo full-viewport atrás de tudo */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
        aria-hidden
      >
        {playVideo ? (
          <video
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            {videoSrcWebm && <source src={videoSrcWebm} type="video/webm" />}
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )
        )}
        {overlay}
      </motion.div>

      {/* conteúdo ancorado na base, sobre o fade */}
      <motion.div
        className={cn("relative z-30", footerClassName)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: EASE }}
      >
        {children}
      </motion.div>
    </section>
  );
}

/* blocos animados do rodapé — mesmos delays do design original */
export function VideoHeroReveal({
  delay,
  children,
  className,
}: {
  delay: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
