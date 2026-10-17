"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { estiloFoco, type MidiaCatalogo } from "@/lib/tayssa/catalogo";

/**
 * O rolo: fotos e vídeos de um produto passando sozinhos, sem fim, cada
 * cartão flutuando no seu tempo. Mouse em cima (ou dedo) pausa; tocar
 * abre a mídia grande, com as setas para ir e voltar. Vídeo só toca
 * quando está na tela — e sempre sem som.
 */
export function Rolo({
  itens,
  tamanho = "grande",
  rotulo,
  sentido = 1,
}: {
  itens: MidiaCatalogo[];
  tamanho?: "grande" | "mini";
  /** nome do rolo para leitor de tela */
  rotulo: string;
  /** 1 corre para a esquerda, -1 para a direita */
  sentido?: 1 | -1;
}) {
  const reduced = useReducedMotion();
  const [aberto, setAberto] = useState<number | null>(null);
  if (!itens.length) return null;
  // o laço precisa de largura: repete até ter cartões suficientes, e dobra
  // a fila inteira para a emenda nunca aparecer
  const minimo = tamanho === "mini" ? 8 : 7;
  const base: MidiaCatalogo[] = [];
  while (base.length < minimo) base.push(...itens);
  const fila = [...base, ...base];
  const segundos = base.length * (tamanho === "mini" ? 3.2 : 4.6);

  return (
    <div className={`ty-rolo ty-rolo--${tamanho}`} role="region" aria-label={rotulo}>
      <div
        className="ty-rolo__trilho"
        data-janela
        data-parado={reduced ? "true" : "false"}
        style={{ "--dur": `${segundos}s`, "--dir": sentido === 1 ? "normal" : "reverse" } as CSSProperties}
      >
        {fila.map((m, i) => {
          const original = i % itens.length;
          const copia = i >= itens.length;
          return (
            <button
              key={`${m.id}-${i}`}
              type="button"
              className="ty-rolo__cartao"
              data-janela-item
              data-video={m.tipo === "video" || undefined}
              style={{ "--i": i % 5 } as CSSProperties}
              onClick={() => setAberto(original)}
              aria-label={`Abrir ${m.tipo === "video" ? "vídeo" : "foto"}: ${m.produto}`}
              // só a primeira volta é navegável por teclado/leitor
              tabIndex={copia ? -1 : undefined}
              aria-hidden={copia || undefined}
            >
              <span className="ty-rolo__flutua">
                <Midia m={m} />
                <span className="ty-rolo__brilho" aria-hidden />
                <span className="ty-rolo__rotulo">
                  {m.tipo === "video" ? <i className="ty-rolo__play" aria-hidden /> : null}
                  {m.produto}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <Visor itens={itens} aberto={aberto} onMudar={setAberto} />
    </div>
  );
}

/** Foto leve ou vídeo que toca só enquanto aparece. */
function Midia({ m, grande = false }: { m: MidiaCatalogo; grande?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  // no rolo, toca só quando o cartão é o escolhido (`data-tocar`, posto por
  // PausaForaDaTela: um vídeo por vez, o mais perto do centro da tela)
  useEffect(() => {
    const v = ref.current;
    const cartao = v?.closest<HTMLElement>("[data-janela-item]");
    if (!v || !cartao || grande) return;
    const seguir = () => {
      if (cartao.hasAttribute("data-tocar")) void v.play().catch(() => {});
      else v.pause();
    };
    seguir();
    const mo = new MutationObserver(seguir);
    mo.observe(cartao, { attributes: true, attributeFilter: ["data-tocar"] });
    return () => mo.disconnect();
  }, [grande]);
  // no rolo vale o enquadramento que a Tayssa escolheu; no visor, a mídia inteira
  const quadro = grande ? undefined : estiloFoco(m.foco);
  if (m.tipo === "video") {
    return (
      <video
        ref={ref}
        className="ty-rolo__midia"
        style={quadro}
        // #t=0.1: o Safari do iPhone mostra o primeiro quadro do vídeo parado
        src={grande ? m.url : `${m.url}#t=0.1`}
        muted
        loop
        playsInline
        autoPlay={grande}
        preload="metadata"
        aria-label={m.alt}
      />
    );
  }
  return (
    <Image
      className="ty-rolo__midia"
      src={m.url}
      alt={m.alt}
      fill
      sizes={grande ? "(max-width: 767px) 92vw, 70vw" : "(max-width: 767px) 60vw, 300px"}
      style={quadro ?? { objectFit: "contain" }}
      draggable={false}
    />
  );
}

/** A mídia grande, por cima de tudo: setas, Esc e arrastar para os lados. */
function Visor({
  itens,
  aberto,
  onMudar,
}: {
  itens: MidiaCatalogo[];
  aberto: number | null;
  onMudar: (i: number | null) => void;
}) {
  const reduced = useReducedMotion();
  const [dir, setDir] = useState(1);
  const fecharRef = useRef<HTMLButtonElement>(null);
  // o portal só existe no navegador: no servidor (e na hidratação) não há visor
  const montado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const ir = (passo: number) => {
    if (aberto === null) return;
    setDir(passo);
    onMudar((aberto + passo + itens.length) % itens.length);
  };
  useEffect(() => {
    if (aberto === null) return;
    fecharRef.current?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMudar(null);
      if (e.key === "ArrowRight") ir(1);
      if (e.key === "ArrowLeft") ir(-1);
    };
    document.addEventListener("keydown", tecla);
    const antes = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tecla);
      document.documentElement.style.overflow = antes;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  if (!montado) return null;
  const m = aberto === null ? null : itens[aberto];
  return createPortal(
    <AnimatePresence>
      {m ? (
        <motion.div
          className="ty-visor ty-scope"
          data-theme="night"
          role="dialog"
          aria-modal="true"
          aria-label={m.produto}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.3 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onMudar(null);
          }}
        >
          <AnimatePresence mode="popLayout" custom={dir}>
            <motion.figure
              key={m.id}
              className="ty-visor__fig"
              custom={dir}
              initial={reduced ? false : { opacity: 0, x: dir * 80, scale: 0.94, rotateY: dir * -12 }}
              animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: dir * -80, scale: 0.94 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              drag={reduced ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70) ir(1);
                else if (info.offset.x > 70) ir(-1);
              }}
            >
              <div className="ty-visor__midia" style={{ aspectRatio: String(m.ratio) }}>
                <Midia m={m} grande />
              </div>
              <figcaption>
                <b>{m.produto}</b>
                {m.legenda ? <span>{m.legenda}</span> : null}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
          {itens.length > 1 ? (
            <>
              <button type="button" className="ty-visor__seta ty-visor__seta--ant" aria-label="Anterior" onClick={() => ir(-1)} />
              <button type="button" className="ty-visor__seta ty-visor__seta--prox" aria-label="Próxima" onClick={() => ir(1)} />
              <span className="ty-visor__conta" aria-live="polite">
                {(aberto ?? 0) + 1} / {itens.length}
              </span>
            </>
          ) : null}
          <button ref={fecharRef} type="button" className="ty-visor__fechar" aria-label="Fechar" onClick={() => onMudar(null)} />
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
