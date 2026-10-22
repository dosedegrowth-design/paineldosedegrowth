"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { motion, useReducedMotion, useTransform } from "framer-motion";
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
 * No celular as paradas ficam centradas, uma embaixo da outra, e a onda
 * desce em serpentina: sai do lado de um círculo, contorna o texto pela
 * margem e entra no próximo — um lado de cada vez —, desenhando com a
 * rolagem como a do computador.
 */
export function Jornada({ paradas, className }: { paradas: Parada[]; className?: string }) {
  const ref = useRef<HTMLOListElement>(null);
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const reduced = useReducedMotion();
  const scrollYProgress = useProgressoRolagem(ref, ["start 85%", "end 55%"]);
  const desenho = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [0.02, 1]);

  const pts = paradas.map((_, i) => ({ x: (W * (i + 0.5)) / paradas.length, y: i % 2 ? 210 : 90 }));
  const d = curva(pts);
  const onda = useOndaDoCelular(ref);

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
      {onda ? (
        <svg className="tyj__onda" width={onda.w} height={onda.h} viewBox={`0 0 ${onda.w} ${onda.h}`} aria-hidden>
          <defs>
            <mask id={`o${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width={onda.w} height={onda.h}>
              <motion.path d={onda.d} stroke="white" strokeWidth="10" fill="none" style={{ pathLength: desenho }} />
            </mask>
          </defs>
          <path d={onda.d} className="tyj__traco" mask={`url(#o${id})`} />
        </svg>
      ) : null}
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
        </li>
      ))}
    </ol>
  );
}

type Circulo = { x: number; y: number; raio: number };

/**
 * A serpentina do celular: de cada círculo até o próximo, sai pelo lado
 * (direita, esquerda, direita…), desce pela margem e volta pelo mesmo
 * lado. O texto fica no meio, longe da linha; onde ela encosta no
 * círculo, o fundo dele a cobre.
 */
function serpentina(c: Circulo[], largura: number): string {
  const margem = 6;
  let d = "";
  for (let i = 0; i < c.length - 1; i++) {
    const a = c[i];
    const b = c[i + 1];
    const lado = i % 2 === 0 ? 1 : -1;
    const borda = lado > 0 ? largura - margem : margem;
    const ax = a.x + lado * a.raio;
    const bx = b.x + lado * b.raio;
    const curva = Math.min(90, (b.y - a.y) / 3);
    d += `M${ax} ${a.y} C${ax + lado * curva} ${a.y} ${borda} ${a.y + curva * 0.4} ${borda} ${a.y + curva} `;
    d += `L${borda} ${b.y - curva} C${borda} ${b.y - curva * 0.4} ${bx + lado * curva} ${b.y} ${bx} ${b.y} `;
  }
  return d.trim();
}

/** Mede os círculos no celular (abaixo de 900px) e refaz a onda quando algo muda de tamanho. */
function useOndaDoCelular(ref: RefObject<HTMLOListElement | null>) {
  const [onda, setOnda] = useState<{ w: number; h: number; d: string } | null>(null);
  useEffect(() => {
    const ol = ref.current;
    if (!ol) return;
    const celular = window.matchMedia("(max-width: 899px)");
    const medir = () => {
      if (!celular.matches) {
        setOnda(null);
        return;
      }
      const caixa = ol.getBoundingClientRect();
      const circulos = Array.from(ol.querySelectorAll<HTMLElement>(".tyj__circulo"), (el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - caixa.left + r.width / 2, y: r.top - caixa.top + r.height / 2, raio: r.width / 2 };
      });
      if (circulos.length < 2) {
        setOnda(null);
        return;
      }
      const w = Math.round(caixa.width);
      const h = Math.round(caixa.height);
      setOnda((atual) => {
        const d = serpentina(circulos, w);
        return atual && atual.w === w && atual.h === h && atual.d === d ? atual : { w, h, d };
      });
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(ol);
    celular.addEventListener("change", medir);
    return () => {
      ro.disconnect();
      celular.removeEventListener("change", medir);
    };
  }, [ref]);
  return onda;
}
