"use client";

import { useState, type CSSProperties } from "react";
import { arquivo, conjunto, type Corte, type FotoSlot } from "@/lib/photos";
import { useFotoDisponivel } from "@/components/ui/disponibilidade";

/**
 * Foto tratada, com procedência.
 *
 * O arquivo servido é o que `scripts/grade.mjs` produziu: mesmo contraste,
 * mesma saturação, mesmo recorte de todas as outras. É o que faz o acervo
 * — celular em obra, foto de entrega, imagem de apresentação — parecer um
 * corpo fotográfico só em vez de colagem.
 *
 * `corte="auto"` troca o recorte no celular: retrato até 760px, paisagem
 * daí para cima. É direção de arte de verdade, não a mesma imagem espremida.
 *
 * Quando o slot é ilustrativo a marca fica na legenda, discreta. Ela existe
 * para ninguém confundir imagem de apresentação com obra da VIVA — mas não
 * precisa gritar por cima da foto.
 *
 * Sem arquivo, cai no campo tonal. Nunca buraco, nunca imagem de banco.
 */
export function FotoReal({
  foto,
  className,
  style,
  sizes = "100vw",
  priority = false,
  legenda = false,
  corte = "w",
  ratio,
  zoom = false,
}: {
  foto: FotoSlot;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  priority?: boolean;
  legenda?: boolean;
  /** recorte servido; "auto" = retrato no celular, paisagem no resto */
  corte?: Corte | "auto";
  ratio?: number | "fill";
  /** aproxima devagar quando o contêiner recebe hover */
  zoom?: boolean;
}) {
  const [erro, setErro] = useState(false);
  const disponivel = useFotoDisponivel(foto.base);
  const faltando = erro || !disponivel;
  const aspect = ratio === "fill" ? undefined : ratio;
  const principal: Corte = corte === "auto" ? "w" : corte;

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
        <picture>
          {corte === "auto" ? (
            <source media="(max-width: 760px)" srcSet={conjunto(foto, "p")} sizes={sizes} />
          ) : null}
          <source srcSet={conjunto(foto, principal)} sizes={sizes} />
          <img
            src={arquivo(foto, principal)}
            alt={foto.alt}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            fetchPriority={priority ? "high" : undefined}
            onError={() => setErro(true)}
          />
        </picture>
      )}

      {/* a marca de imagem ilustrativa aparece sempre — é regra do cliente,
          não enfeite. A legenda descritiva é que é opcional. */}
      {!faltando && (foto.ilustrativa || (legenda && foto.legenda)) ? (
        <span className="v-photo__caption">
          {legenda ? foto.legenda : null}
          {foto.ilustrativa ? (
            <em
              className="v-photo__ilus"
              title="Imagem de apresentação — não é obra executada pela VIVA"
            >
              {legenda && foto.legenda ? " · " : ""}imagem ilustrativa
            </em>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
