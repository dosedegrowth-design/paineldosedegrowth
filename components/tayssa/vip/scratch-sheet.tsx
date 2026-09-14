"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { revealStampAction, type RevealResult } from "@/lib/tayssa/actions/card";
import { dateLong } from "@/lib/tayssa/format";
import type { CardStamp } from "@/lib/tayssa/types";

/** vibração curta — só onde o aparelho suporta */
function buzz(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* aparelho sem motor: segue sem tremer */
    }
  }
}

const SPARKS = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  return { x: Math.cos(angle) * (60 + (i % 4) * 22), y: Math.sin(angle) * (46 + (i % 3) * 20), d: i * 0.012 };
});

/**
 * A raspada. O carimbo já existe desde que a Tayssa confirmou o
 * atendimento — raspar é descobrir, não sortear. O dedo tira a folha
 * dourada; aos 55% a folha some sozinha para não cansar.
 */
export function ScratchSheet({
  stamp,
  cardSize,
  onClose,
  onRevealed,
  remaining,
  onNext,
}: {
  stamp: CardStamp;
  cardSize: number;
  onClose: () => void;
  onRevealed: (id: string, result: RevealResult | null) => void;
  remaining: number;
  onNext?: () => void;
}) {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const moves = useRef(0);
  const lastBuzz = useRef(0);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<RevealResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const reveal = useCallback(() => {
    if (open) return;
    setOpen(true);
    buzz([14, 60, 26]);
    start(async () => {
      const r = await revealStampAction({ id: stamp.id });
      if (r.ok) {
        setResult(r.data);
        onRevealed(stamp.id, r.data);
      } else {
        setError(r.error);
        onRevealed(stamp.id, null);
      }
    });
  }, [open, stamp.id, onRevealed]);

  // folha dourada
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const paint = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      const g = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      g.addColorStop(0, "#e7cb9d");
      g.addColorStop(0.28, "#cda876");
      g.addColorStop(0.5, "#f2e0c1");
      g.addColorStop(0.74, "#c49c6a");
      g.addColorStop(1, "#e3c79c");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, rect.width, rect.height);
      // textura discreta, para a folha não parecer plástico
      ctx.globalAlpha = 0.16;
      for (let i = 0; i < 220; i++) {
        ctx.fillStyle = i % 2 ? "#fff6e6" : "#8f6a3d";
        ctx.fillRect(Math.random() * rect.width, Math.random() * rect.height, 2, 1);
      }
      ctx.globalAlpha = 1;
    };
    const id = requestAnimationFrame(paint);
    window.addEventListener("resize", paint);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", paint);
    };
  }, []);

  const clearedEnough = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return false;
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 24) {
      total++;
      if (data[i] < 40) clear++;
    }
    return total > 0 && clear / total > 0.55;
  };

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || open) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 38;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    const from = last.current ?? { x, y };
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    last.current = { x, y };
    const now = Date.now();
    if (now - lastBuzz.current > 140) {
      lastBuzz.current = now;
      buzz(6);
    }
    if (++moves.current % 8 === 0 && clearedEnough()) reveal();
  };

  const prize = (
    <div className="tys__prize">
      <span className="tys__pts">
        <i>+</i>
        {stamp.points}
      </span>
      <span className="tys__name">{stamp.serviceName}</span>
      <span className="tys__meta">
        {dateLong(stamp.date)} · carimbo {stamp.position} de {cardSize}
      </span>
    </div>
  );

  const done = result ?? (open && !pending);
  const cardClosed = result?.cardCompleted ?? false;

  return (
    <>
      <motion.div
        className="tyv-sheet-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        className="tyv-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Carimbo ${stamp.position}`}
        initial={{ y: reduced ? 0 : "100%" }}
        animate={{ y: 0 }}
        exit={{ y: reduced ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
      >
        <div className="tyv-sheet__grip" aria-hidden />
        <p className="tyv-label" style={{ marginBottom: 4 }}>
          {open ? "Seu carimbo" : "Raspe com o dedo"}
        </p>
        <h2 className="tyv-h2" style={{ marginBottom: 16 }}>
          {open ? (cardClosed ? "Cartão completo." : "Mais uma visita sua.") : "O que essa visita te deu."}
        </h2>

        <div className="tys">
          {prize}
          <AnimatePresence>
            {!open ? (
              <motion.canvas
                key="foil"
                ref={canvasRef}
                className="tys__canvas"
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onPointerDown={(e) => {
                  drawing.current = true;
                  last.current = null;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  scratch(e);
                }}
                onPointerMove={scratch}
                onPointerUp={() => {
                  drawing.current = false;
                  last.current = null;
                }}
                onPointerCancel={() => {
                  drawing.current = false;
                  last.current = null;
                }}
              />
            ) : null}
          </AnimatePresence>
          {!open ? <span className="tys__hint">deslize o dedo</span> : null}
          <AnimatePresence>
            {open && !reduced
              ? SPARKS.map((s, i) => (
                  <motion.span
                    key={i}
                    className="tys__spark"
                    initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    animate={{ opacity: 0, x: s.x, y: s.y, scale: 0.3 }}
                    transition={{ duration: 1.1, delay: s.d, ease: "easeOut" }}
                  />
                ))
              : null}
          </AnimatePresence>
        </div>

        {error ? (
          <div className="ty-form-error" role="alert" style={{ marginTop: 14 }}>
            {error}
          </div>
        ) : null}

        {open && cardClosed && result?.rewardTitle ? (
          <p className="tyv-sub" style={{ marginTop: 16 }}>
            Você fechou o cartão: <strong style={{ color: "var(--t-fg)" }}>{result.rewardTitle}</strong>.{" "}
            {result.rewardStatus === "available"
              ? "Já está liberado em Benefícios."
              : "A Tayssa valida e ele aparece em Benefícios."}
          </p>
        ) : null}

        <div className="tyv-stack" style={{ marginTop: 20 }}>
          {!open ? (
            <button type="button" className="tyv-btn tyv-btn--ghost" onClick={reveal}>
              Revelar sem raspar
            </button>
          ) : remaining > 0 && onNext ? (
            <button type="button" className="tyv-btn tyv-btn--accent" onClick={onNext}>
              Raspar o próximo
            </button>
          ) : null}
          <button type="button" className="tyv-btn tyv-btn--ghost" onClick={onClose}>
            {done ? "Fechar" : "Agora não"}
          </button>
        </div>
      </motion.div>
    </>
  );
}
