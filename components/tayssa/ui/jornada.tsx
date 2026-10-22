"use client";

import { useId, useRef } from "react";
import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useProgressoRolagem } from "@/components/tayssa/ui/rolagem";
import { Icone, type IconeNome } from "@/components/tayssa/ui/icones";

export type Parada = { n: string; nome: string; texto: string; icone: IconeNome };

const W = 1000;
const H = 300;

/** Curva que passa pelos pontos, com alças horizontais (onda suave). */
function curva(pts: { x: number; y: number }[]): string {
  const ini = { x: 0, y: pts[0].y + 40 };
  const fim = { x: W, y: pts[pts.length - 1].y - 40 };
  const todos = [ini, ...pts, fim];
  let d = `M${ini.x} ${ini.y}`;
  for (let i = 1; i < todos.length; i++) {
    const a = todos[i - 1];
    const b = todos[i];
    const dx = (b.x - a.x) * 0.5;
    d += ` C${a.x + dx} ${a.y} ${b.x - dx} ${b.y} ${b.x} ${b.y}`;
  }
  return d;
}

/**
 * Jornada — as etapas ligadas por uma linha tracejada que se desenha
 * conforme a página desce (o "Journey of coffee" do Delta). Cada parada
 * é um círculo com um ícone animado; embaixo, o nome em cartaz e o texto.
 * No celular as paradas ficam centradas, uma embaixo da outra, e a linha
 * vira um elo entre cada parada e a próxima: descendo pelo meio, ela
 * passaria por cima do texto.
 */
export function Jornada({ paradas, className }: { paradas: Parada[]; className?: string }) {
  const ref = useRef<HTMLOListElement>(null);
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const reduced = useReducedMotion();
  const scrollYProgress = useProgressoRolagem(ref, ["start 85%", "end 55%"]);
  const desenho = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [0.02, 1]);

  const pts = paradas.map((_, i) => ({ x: (W * (i + 0.5)) / paradas.length, y: i % 2 ? 210 : 90 }));
  const d = curva(pts);

  return (
    <ol ref={ref} className={["tyj", className ?? ""].join(" ").trim()} style={{ ["--tyj-n" as string]: paradas.length }}>
      <svg className="tyj__linha" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        <defs>
          <mask id={`m${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
            <motion.path d={d} stroke="white" strokeWidth="14" fill="none" style={{ pathLength: desenho }} />
          </mask>
        </defs>
        <path d={d} className="tyj__traco" mask={`url(#m${id})`} />
      </svg>
      {paradas.map((p, i) => (
        <li
          key={p.n}
          className="tyj__parada ty-ico-gatilho"
          style={{ ["--x" as string]: `${pts[i].x / 10}%`, ["--yf" as string]: pts[i].y / H }}
        >
          <span className="tyj__circulo">
            <Icone nome={p.icone} />
          </span>
          <span className="tyj__n">{p.n}</span>
          <h3 className="tyj__nome">{p.nome}</h3>
          <p className="tyj__texto">{p.texto}</p>
          {i < paradas.length - 1 ? (
            <Elo desenho={desenho} de={i / (paradas.length - 1)} ate={(i + 1) / (paradas.length - 1)} />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/** Celular: o traço até a próxima parada, crescendo no seu trecho da rolagem. */
function Elo({ desenho, de, ate }: { desenho: MotionValue<number>; de: number; ate: number }) {
  const escala = useTransform(desenho, [de, ate], [0, 1]);
  return <motion.span className="tyj__elo" aria-hidden style={{ scaleY: escala }} />;
}
