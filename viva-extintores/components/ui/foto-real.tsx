"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import type { FotoSlot } from "@/lib/photos";
import { useFotoDisponivel } from "@/components/ui/disponibilidade";

/**
 * Foto com procedência explícita.
 *
 * Quando o slot é `ilustrativa`, a etiqueta aparece sobre a imagem: é
 * imagem de apresentação, não obra executada pela VIVA. Quem olha nunca
 * confunde as duas coisas — e é isso que permite mandar o site para o
 * cliente antes de as fotos reais chegarem.
 *
 * Se o arquivo sumir, o componente cai no campo tonal em vez de deixar um
 * buraco.
 */
export function FotoReal({
  foto,
  className,
  style,
  sizes = "100vw",
  priority = false,
  legenda = false,
  ratio,
  zoom = false,
}: {
  foto: FotoSlot;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  priority?: boolean;
  legenda?: boolean;
  ratio?: number | "fill";
  /** aproxima devagar quando o contêiner recebe hover */
  zoom?: boolean;
}) {
  const [erro, setErro] = useState(false);
  const disponivel = useFotoDisponivel(foto.src);
  const faltando = erro || !disponivel;
  const aspect = ratio === "fill" ? undefined : (ratio ?? foto.ratio);

  return (
    <div
      className={["v-photo", zoom ? "v-photo--zoom" : "", className ?? ""].join(" ").trim()}
      style={{ aspectRatio: aspect, ...style }}
    >
      {faltando ? (
        <div className="v-photo__ph" role="img" aria-label={`${foto.alt} — foto a inserir`}>
          <span className="v-photo__ph-tag">Foto · a inserir</span>
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

      {foto.ilustrativa && !faltando ? (
        <span className="v-photo__ilus" title="Imagem de apresentação — não é obra executada pela VIVA">
          Imagem ilustrativa
        </span>
      ) : null}

      {legenda && foto.legenda && !faltando ? (
        <span className="v-photo__caption">{foto.legenda}</span>
      ) : null}
    </div>
  );
}
