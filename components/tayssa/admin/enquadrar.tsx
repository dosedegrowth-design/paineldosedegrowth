"use client";

import { useEffect, useRef, type CSSProperties, type PointerEvent } from "react";
import { estiloFoco } from "@/lib/tayssa/catalogo";

export type Quadro = { x: number; y: number; zoom: number };
export const QUADRO_PADRAO: Quadro = { x: 50, y: 50, zoom: 1 };

const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const arred = (v: number) => Math.round(v * 100) / 100;

/** Estilo que o site e o editor usam igual (vive em lib/tayssa/catalogo.ts). */
export const estiloQuadro = (q: Quadro): CSSProperties => estiloFoco(q);

/**
 * Enquadrar antes de publicar: a mídia aparece no mesmo formato do cartão
 * do rolo. Arrastar (dedo ou mouse) muda o ponto que fica no centro; o
 * controle, a roda do mouse ou o gesto de pinça mudam o zoom. O que ela vê
 * aqui é o que o site mostra.
 */
export function Enquadrar({
  url,
  tipo,
  valor,
  onMudar,
  formato,
}: {
  url: string;
  tipo: "image" | "video";
  valor: Quadro;
  onMudar: (q: Quadro) => void;
  /** proporção da janela (CSS aspect-ratio); sem ela, o cartão do rolo */
  formato?: string;
}) {
  const caixa = useRef<HTMLDivElement>(null);
  const toques = useRef(new Map<number, { x: number; y: number }>());
  const inicio = useRef<{ q: Quadro; dist: number; px: number; py: number } | null>(null);

  const comecar = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    toques.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...toques.current.values()];
    const dist = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
    inicio.current = { q: valor, dist, px: e.clientX, py: e.clientY };
  };
  const mover = (e: PointerEvent<HTMLDivElement>) => {
    if (!toques.current.has(e.pointerId) || !inicio.current || !caixa.current) return;
    toques.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...toques.current.values()];
    const r = caixa.current.getBoundingClientRect();
    if (pts.length > 1 && inicio.current.dist > 0) {
      // pinça: a distância entre os dedos muda o zoom
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      onMudar({ ...valor, zoom: arred(limitar(inicio.current.q.zoom * (d / inicio.current.dist), 1, 3)) });
      return;
    }
    // arrastar a foto para a direita traz o lado esquerdo dela para o centro
    const dx = ((e.clientX - inicio.current.px) / r.width) * 100;
    const dy = ((e.clientY - inicio.current.py) / r.height) * 100;
    const ganho = 1 / Math.max(1, inicio.current.q.zoom * 0.9);
    onMudar({
      ...valor,
      x: arred(limitar(inicio.current.q.x - dx * ganho, 0, 100)),
      y: arred(limitar(inicio.current.q.y - dy * ganho, 0, 100)),
    });
  };
  const soltar = (e: PointerEvent<HTMLDivElement>) => {
    toques.current.delete(e.pointerId);
    const resta = [...toques.current.entries()][0];
    inicio.current = resta ? { q: valor, dist: 0, px: resta[1].x, py: resta[1].y } : null;
  };
  // a roda do mouse dá zoom sem rolar a página (ouvinte não passivo: o do
  // React é passivo e não deixa cancelar a rolagem)
  const atual = useRef({ valor, onMudar });
  useEffect(() => {
    atual.current = { valor, onMudar };
  });
  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const roda = (e: WheelEvent) => {
      e.preventDefault();
      const { valor: v, onMudar: muda } = atual.current;
      muda({ ...v, zoom: arred(limitar(v.zoom - e.deltaY * 0.002, 1, 3)) });
    };
    el.addEventListener("wheel", roda, { passive: false });
    return () => el.removeEventListener("wheel", roda);
  }, []);

  return (
    <div className="tya-quadro">
      <div
        ref={caixa}
        className="tya-quadro__janela"
        style={formato ? { aspectRatio: formato } : undefined}
        onPointerDown={comecar}
        onPointerMove={mover}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        role="application"
        aria-label="Arraste para centralizar; use o controle de zoom abaixo"
      >
        {tipo === "video" ? (
          <video src={url} muted loop playsInline autoPlay style={estiloQuadro(valor)} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" draggable={false} style={estiloQuadro(valor)} />
        )}
        <span className="tya-quadro__guia" aria-hidden />
      </div>
      <div className="tya-quadro__controles">
        <button
          type="button"
          className="tya-btn tya-btn--sm tya-btn--ghost"
          aria-label="Menos zoom"
          onClick={() => onMudar({ ...valor, zoom: arred(limitar(valor.zoom - 0.1, 1, 3)) })}
        >
          −
        </button>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={valor.zoom}
          aria-label="Zoom"
          onChange={(e) => onMudar({ ...valor, zoom: Number(e.target.value) })}
        />
        <button
          type="button"
          className="tya-btn tya-btn--sm tya-btn--ghost"
          aria-label="Mais zoom"
          onClick={() => onMudar({ ...valor, zoom: arred(limitar(valor.zoom + 0.1, 1, 3)) })}
        >
          +
        </button>
        <button type="button" className="tya-btn tya-btn--sm tya-btn--soft" onClick={() => onMudar(QUADRO_PADRAO)}>
          Centralizar
        </button>
      </div>
      <p className="tya-small">
        Arraste para escolher o centro. Zoom em {Math.round(valor.zoom * 100)}%.
      </p>
    </div>
  );
}
