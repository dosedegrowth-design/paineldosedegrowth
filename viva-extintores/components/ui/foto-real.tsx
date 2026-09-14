"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import type { FotoSlot } from "@/lib/photos";
import { useFotoDisponivel } from "@/components/ui/disponibilidade";

/**
 * Foto real com fallback honesto (§20, §24).
 *
 * Se o arquivo ainda não existe em `public/photos/`, mostra um campo
 * tonal com o que aquela foto precisa ser. Nunca stock, nunca ilustração,
 * nunca imagem sintética. Trocar a foto = colocar o arquivo no lugar.
 */
export function FotoReal({
  foto,
  className,
  style,
  sizes = "100vw",
  priority = false,
  legenda = false,
  ratio,
}: {
  foto: FotoSlot;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  priority?: boolean;
  /** mostra a legenda sobre a foto quando ela existe */
  legenda?: boolean;
  /** força a proporção; "fill" deixa o container mandar */
  ratio?: number | "fill";
}) {
  const [erro, setErro] = useState(false);
  const disponivel = useFotoDisponivel(foto.src);
  const faltando = erro || !disponivel;
  const aspect = ratio === "fill" ? undefined : (ratio ?? foto.ratio);

  return (
    <div
      className={["v-photo", className ?? ""].join(" ").trim()}
      style={{ aspectRatio: aspect, ...style }}
    >
      {faltando ? (
        <div className="v-photo__ph" role="img" aria-label={`${foto.alt} — foto a inserir`}>
          <span className="v-photo__ph-tag">Foto real · a inserir</span>
          <span className="v-photo__ph-alt">{foto.legenda ?? foto.alt}</span>
        </div>
      ) : (
        <Image
          src={foto.src}
          alt={foto.alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setErro(true)}
          style={{ objectFit: "cover" }}
        />
      )}
      {legenda && foto.legenda && !faltando ? (
        <span className="v-photo__caption">{foto.legenda}</span>
      ) : null}
    </div>
  );
}
