"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import type { VideoPresence, VideoSlot } from "@/lib/tayssa/media";
import type { PhotoSlot } from "@/lib/tayssa/photos";
import { RealPhoto } from "@/components/tayssa/ui/real-photo";
import { Pendente } from "@/components/tayssa/ui/estrutura";

type Conexao = { saveData?: boolean; effectiveType?: string };

/**
 * Mídia em movimento: o vídeo real quando existe, a foto real quando não,
 * o campo tonal quando nenhum dos dois — sempre no mesmo quadro, então
 * trocar o material é só trocar o arquivo.
 *
 * - Celular/tablet em pé recebe a versão vertical; deitado, a horizontal.
 *   O pôster certo aparece já no primeiro quadro (via <picture>), antes
 *   do JS; o vídeo só é pedido quando o quadro entra na tela.
 * - Toca mudo, em loop, inline (iOS), e pausa fora da tela (bateria).
 * - Movimento reduzido ou economia de dados: não toca sozinho; o botão
 *   de play fica à mão. Há sempre um botão de pausar quando toca.
 */
export function MotionMedia({
  video,
  presence,
  photo,
  className,
  style,
  sizes = "100vw",
  priority = false,
  pendente,
  children,
}: {
  video: VideoSlot;
  presence?: VideoPresence;
  /** foto real para quando não houver vídeo (já filtrada: existe) */
  photo?: PhotoSlot;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  priority?: boolean;
  /** o que falta aqui, para o modo estrutura */
  pendente?: { titulo: string; detalhe?: string };
  /** camada por cima (texto, flor) */
  children?: ReactNode;
}) {
  const caixa = useRef<HTMLDivElement>(null);
  const el = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const naTela = useInView(caixa, { amount: 0.15 });
  const [src, setSrc] = useState<string | null>(null);
  const [tocando, setTocando] = useState(false);
  const [pausadoPeloUsuario, setPausado] = useState(false);
  const [semAuto, setSemAuto] = useState(false);

  const temH = Boolean(presence?.landscape);
  const temV = Boolean(presence?.portrait);
  const temVideo = temH || temV;

  // escolhe a versão pela orientação; troca se a pessoa girar o aparelho
  useEffect(() => {
    if (!temVideo) return;
    const mq = window.matchMedia("(orientation: portrait)");
    const escolher = () => {
      const emPe = mq.matches;
      setSrc(emPe ? (temV ? video.portrait : video.landscape) : temH ? video.landscape : video.portrait);
    };
    const c = (navigator as Navigator & { connection?: Conexao }).connection;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSemAuto(Boolean(c?.saveData) || c?.effectiveType === "2g" || c?.effectiveType === "slow-2g");
    escolher();
    mq.addEventListener("change", escolher);
    return () => mq.removeEventListener("change", escolher);
  }, [temVideo, temH, temV, video]);

  const auto = !reduced && !semAuto && !pausadoPeloUsuario;

  // toca só quando está na tela; pausa ao sair
  useEffect(() => {
    const v = el.current;
    if (!v || !src) return;
    if (naTela && auto) {
      v.play().catch(() => setTocando(false));
    } else {
      v.pause();
    }
  }, [naTela, auto, src]);

  const alternar = () => {
    const v = el.current;
    if (!v) return;
    if (v.paused) {
      setPausado(false);
      v.play().catch(() => undefined);
    } else {
      setPausado(true);
      v.pause();
    }
  };

  const posterH = presence?.poster ? video.poster : undefined;
  const posterV = presence?.posterPortrait ? video.posterPortrait : posterH;

  return (
    <div
      ref={caixa}
      className={["tym", className ?? ""].join(" ").trim()}
      style={style}
      data-playing={tocando}
      data-media={temVideo ? "video" : photo ? "foto" : "vazio"}
    >
      {temVideo ? (
        <>
          {posterH || posterV ? (
            <picture>
              {posterV ? <source media="(orientation: portrait)" srcSet={posterV} /> : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="tym__poster" src={posterH ?? posterV} alt="" fetchPriority={priority ? "high" : "auto"} />
            </picture>
          ) : photo ? (
            <RealPhoto photo={photo} ratio="fill" sizes={sizes} priority={priority} style={{ position: "absolute", inset: 0 }} />
          ) : (
            <div className="tym__vazio" />
          )}
          <video
            ref={el}
            src={src ?? undefined}
            muted
            loop
            playsInline
            preload={naTela ? "auto" : "none"}
            aria-label={video.label}
            onPlaying={() => setTocando(true)}
            onPause={() => setTocando(false)}
          />
          <button
            type="button"
            className="tym__ctrl"
            onClick={alternar}
            aria-label={tocando ? "Pausar vídeo" : "Tocar vídeo"}
            aria-pressed={tocando}
          >
            {tocando ? (
              <svg viewBox="0 0 16 16" aria-hidden>
                <rect x="3" y="2" width="3.4" height="12" rx="1" />
                <rect x="9.6" y="2" width="3.4" height="12" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" aria-hidden>
                <path d="M4 2.4v11.2a.6.6 0 0 0 .9.5l9-5.6a.6.6 0 0 0 0-1L4.9 1.9a.6.6 0 0 0-.9.5z" />
              </svg>
            )}
          </button>
        </>
      ) : photo ? (
        <RealPhoto photo={photo} ratio="fill" sizes={sizes} priority={priority} style={{ position: "absolute", inset: 0 }} />
      ) : (
        <div className="tym__vazio" />
      )}
      {!temVideo && pendente ? <Pendente titulo={pendente.titulo} detalhe={pendente.detalhe} midia /> : null}
      {children}
    </div>
  );
}
