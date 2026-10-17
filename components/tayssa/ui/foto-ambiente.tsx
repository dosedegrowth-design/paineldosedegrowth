"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useTransform } from "framer-motion";
import { useProgressoRolagem } from "@/components/tayssa/ui/rolagem";
import type { PhotoSlot } from "@/lib/tayssa/photos";
import { usePhotoAvailable } from "@/components/tayssa/ui/photo-availability";
import { FundoVivo } from "@/components/tayssa/ui/fundo-vivo";

/**
 * O fundo de uma seção vinho: uma foto real do trabalho, com pouca luz e
 * tingida de vinho, correndo devagar no scroll (parallax), e o fundo vivo
 * por cima. A foto vira atmosfera, não vitrine — por isso pode ser a de
 * hoje (recorte de vídeo) sem pesar. Sem foto, fica só o fundo vivo.
 */
export function FotoAmbiente({ photo, posicao = "50% 50%" }: { photo?: PhotoSlot; posicao?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const disponivel = usePhotoAvailable(photo?.src ?? "");
  const scrollYProgress = useProgressoRolagem(ref, ["start end", "end start"]);
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-12%", "12%"]);
  const escala = useTransform(scrollYProgress, [0, 0.5, 1], reduced ? [1.15, 1.15, 1.15] : [1.25, 1.15, 1.25]);

  return (
    <div ref={ref} className="ty-amb" aria-hidden>
      <FundoVivo />
      {photo && disponivel ? (
        <motion.div className="ty-amb__foto" style={{ y, scale: escala }}>
          <Image src={photo.src} alt="" fill sizes="100vw" style={{ objectFit: "cover", objectPosition: posicao }} />
        </motion.div>
      ) : null}
      <span className="ty-amb__veu" />
    </div>
  );
}
