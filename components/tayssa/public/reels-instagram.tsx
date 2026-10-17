"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ReelInstagram } from "@/lib/tayssa/content";
import { Pendente, useEstrutura } from "@/components/tayssa/ui/estrutura";

/**
 * Os vídeos do Instagram tocando no próprio site (como na vitrine da
 * iWin): uma fileira que desliza com o dedo, cada vídeo toca sozinho e sem
 * som quando aparece, o toque no alto-falante liga o som, e o botão leva
 * direto para a publicação. Sem vídeos cadastrados, a fileira não existe.
 */
export function ReelsInstagram({ reels, handle, perfilUrl }: { reels: ReelInstagram[]; handle: string; perfilUrl: string }) {
  const estrutura = useEstrutura();
  const trilho = useRef<HTMLDivElement>(null);
  if (!reels.length) {
    return estrutura ? (
      <section className="tyri" aria-label="Vídeos do Instagram">
        <div className="ty-container">
          <Pendente
            titulo="Vídeos do Instagram"
            detalhe="Vídeos verticais que tocam no site, cada um com o botão para a publicação. Entram no fim do projeto (lib/tayssa/content.ts → instagram)."
          />
        </div>
      </section>
    ) : null;
  }
  const rolar = (dir: 1 | -1) => {
    const el = trilho.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 600), behavior: "smooth" });
  };
  return (
    <section className="tyri" aria-label="Vídeos do Instagram">
      <div className="ty-container tyri__topo">
        <h2 className="tyri__titulo">
          Do estúdio, <em>em movimento</em>
        </h2>
        <div className="tyri__setas">
          <button type="button" className="tyri__seta tyri__seta--ant" aria-label="Vídeos anteriores" onClick={() => rolar(-1)} />
          <button type="button" className="tyri__seta" aria-label="Próximos vídeos" onClick={() => rolar(1)} />
        </div>
      </div>
      <div ref={trilho} className="tyri__trilho">
        {reels.map((r, i) => (
          <Reel key={`${r.url}-${r.video}-${i}`} reel={r} i={i} handle={handle} />
        ))}
        <a href={perfilUrl} target="_blank" rel="noopener noreferrer" className="tyri__perfil">
          <span>Ver tudo em</span>
          <b>{handle}</b>
        </a>
      </div>
    </section>
  );
}

function Reel({ reel, i, handle }: { reel: ReelInstagram; i: number; handle: string }) {
  const reduced = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const [som, setSom] = useState(false);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !reduced) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.6 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);
  return (
    <motion.figure
      className="tyri__reel"
      initial={reduced ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: Math.min(i, 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <video
        ref={video}
        src={reel.video}
        poster={reel.poster}
        muted={!som}
        loop
        playsInline
        preload="metadata"
        aria-label={reel.legenda ?? `Vídeo de ${handle}`}
      />
      <span className="tyri__veu" aria-hidden />
      <button
        type="button"
        className="tyri__som"
        aria-pressed={som}
        aria-label={som ? "Tirar o som" : "Ligar o som"}
        onClick={() => {
          setSom((s) => !s);
          void video.current?.play().catch(() => {});
        }}
        data-som={som}
      />
      <figcaption>
        {reel.legenda ? <span className="tyri__legenda">{reel.legenda}</span> : null}
        <a href={reel.url} target="_blank" rel="noopener noreferrer" className="tyri__ver">
          Ver no Instagram
        </a>
      </figcaption>
    </motion.figure>
  );
}
