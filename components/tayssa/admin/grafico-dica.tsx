"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

type Dica = { valor: string; rotulo: string; x: number; y: number };

/**
 * A dica dos gráficos do painel: passar o mouse, tocar ou chegar pelo
 * teclado (setas) numa marca com `data-dica` mostra o valor em cima dela.
 * Ela só ajuda: todo valor também está escrito no gráfico, na legenda ou
 * na tabela. A rosca diz onde fica o meio da fatia em `data-dica-x/y`
 * (fração da caixa do desenho).
 */
export function ComDica({ children, className, rotulo }: { children: ReactNode; className?: string; rotulo: string }) {
  const raiz = useRef<HTMLDivElement>(null);
  const caixa = useRef<HTMLDivElement>(null);
  const ativo = useRef<Element | null>(null);
  const toque = useRef(false);
  const [dica, setDica] = useState<Dica | null>(null);

  const marcas = useCallback(() => [...(raiz.current?.querySelectorAll("[data-dica]") ?? [])], []);

  const mostrar = useCallback((el: Element | null) => {
    const r = raiz.current;
    ativo.current?.removeAttribute("data-ativo");
    ativo.current = el;
    if (!r || !el) {
      setDica(null);
      return;
    }
    el.setAttribute("data-ativo", "");
    const base = r.getBoundingClientRect();
    const m = el.getBoundingClientRect();
    let x = m.left + m.width / 2 - base.left;
    let y = m.top - base.top;
    const fx = el.getAttribute("data-dica-x");
    const fy = el.getAttribute("data-dica-y");
    if (fx && fy) {
      const s = el.closest("svg")?.getBoundingClientRect();
      if (s) {
        x = s.left - base.left + Number(fx) * s.width;
        y = s.top - base.top + Number(fy) * s.height;
      }
    }
    setDica({ valor: el.getAttribute("data-dica") ?? "", rotulo: el.getAttribute("data-dica-rotulo") ?? "", x, y });
  }, []);

  // a dica nunca sai pelos lados do gráfico
  useLayoutEffect(() => {
    const c = caixa.current;
    const r = raiz.current;
    if (!c || !r || !dica) return;
    const w = c.offsetWidth;
    const max = r.clientWidth;
    const x = Math.min(Math.max(dica.x, w / 2 + 2), Math.max(w / 2 + 2, max - w / 2 - 2));
    c.style.left = `${x}px`;
    c.style.top = `${dica.y}px`;
  }, [dica]);

  // tocar fora do gráfico fecha a dica fixada pelo toque
  useEffect(() => {
    if (!dica) return;
    const fora = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) mostrar(null);
    };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, [dica, mostrar]);

  const naMarca = (alvo: EventTarget | null) => {
    const el = (alvo as Element | null)?.closest?.("[data-dica]") ?? null;
    return el && raiz.current?.contains(el) ? el : null;
  };

  const tecla = (e: KeyboardEvent<HTMLDivElement>) => {
    const lista = marcas();
    if (!lista.length) return;
    const i = ativo.current ? lista.indexOf(ativo.current) : -1;
    let prox = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") prox = Math.min(lista.length - 1, i + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") prox = Math.max(0, i < 0 ? 0 : i - 1);
    else if (e.key === "Home") prox = 0;
    else if (e.key === "End") prox = lista.length - 1;
    else if (e.key === "Escape") {
      mostrar(null);
      return;
    } else return;
    e.preventDefault();
    mostrar(lista[prox]);
  };

  return (
    <div
      ref={raiz}
      className={`tyg-dica-area${className ? ` ${className}` : ""}`}
      tabIndex={0}
      role="group"
      aria-label={rotulo}
      onPointerDown={(e) => {
        toque.current = e.pointerType !== "mouse";
      }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const el = naMarca(e.target);
        if (el !== ativo.current) mostrar(el);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") mostrar(null);
      }}
      onClick={(e) => {
        const el = naMarca(e.target);
        // tocar de novo na mesma marca fecha
        if (toque.current && el && el === ativo.current) mostrar(null);
        else mostrar(el);
      }}
      onKeyDown={tecla}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) mostrar(null);
      }}
    >
      {children}
      <div ref={caixa} className="tyg-dica" role="status" aria-live="polite" hidden={!dica}>
        {dica ? (
          <>
            <b>{dica.valor}</b>
            {dica.rotulo ? <span>{dica.rotulo}</span> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
