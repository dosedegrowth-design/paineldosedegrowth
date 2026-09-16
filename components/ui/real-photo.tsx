"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import type { PhotoSlot } from "@/lib/photos";
import { usePhotoAvailable } from "@/components/ui/photo-availability";

/**
 * Foto real com fallback honesto: se o arquivo ainda não existe em
 * public/photos, mostra um campo tonal com legenda. Nunca inventa
 * imagem. Trocar a foto = trocar o arquivo.
 */
export function RealPhoto({
  photo,
  className,
  style,
  sizes = "100vw",
  priority = false,
  hover = false,
  showCaption = false,
  ratio,
}: {
  photo: PhotoSlot;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  priority?: boolean;
  hover?: boolean;
  showCaption?: boolean;
  /** força proporção (senão usa a do slot) */
  ratio?: number | "fill";
}) {
  const [errored, setErrored] = useState(false);
  const available = usePhotoAvailable(photo.src);
  const failed = errored || !available;
  const aspect = ratio === "fill" ? undefined : ratio ?? photo.ratio;
  return (
    <div
      className={["ty-photo", hover ? "ty-photo--hover" : "", className ?? ""].join(" ").trim()}
      style={{ aspectRatio: aspect, ...style }}
    >
      {!failed ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setErrored(true)}
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div className="ty-photo__ph" role="img" aria-label={`${photo.alt} (foto a inserir)`}>
          <span className="ty-photo__ph-label">foto real · @1.tayssa</span>
        </div>
      )}
      {showCaption && photo.caption && !failed ? (
        <span className="ty-photo__caption">{photo.caption}</span>
      ) : null}
    </div>
  );
}
