"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { bateBusca } from "@/lib/tayssa/busca";

/**
 * Peças do Manual do painel. O texto mora em `lib/tayssa/manual.ts`;
 * `*assim*` vira negrito (nome de botão, de menu, de campo).
 */
export function TextoDoManual({ texto }: { texto: string }): ReactNode {
  const partes = texto.split(/(\*[^*]+\*)/g).filter(Boolean);
  return partes.map((p, i) => (p.startsWith("*") && p.endsWith("*") ? <b key={i}>{p.slice(1, -1)}</b> : p));
}

/**
 * "O que você quer fazer?": esconde os tópicos que não batem com o que ela
 * digitou (sem acento, sem caixa) e as seções que ficam vazias.
 */
export function BuscaNoManual() {
  const [q, setQ] = useState("");
  const [nada, setNada] = useState(false);
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raiz = campo.current?.closest(".tya-manual");
    if (!raiz) return;
    let algum = false;
    raiz.querySelectorAll<HTMLElement>("[data-manual-secao]").forEach((secao) => {
      let naSecao = false;
      secao.querySelectorAll<HTMLElement>("[data-manual-topico]").forEach((t) => {
        const bate = bateBusca(q, [t.dataset.busca, secao.dataset.busca]);
        t.hidden = !bate;
        if (bate) naSecao = true;
      });
      secao.hidden = !naSecao;
      if (naSecao) algum = true;
    });
    setNada(!algum);
  }, [q]);

  return (
    <div className="tya-manual__busca">
      <label className="tya-manual__campo">
        <span className="tya-sr">Buscar no manual</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          ref={campo}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="O que você quer fazer? Ex.: confirmar, pontos, avisos"
          enterKeyHint="search"
          autoComplete="off"
        />
      </label>
      {q && nada ? <p className="tya-small">Nada com “{q}”. Tente outra palavra, como agenda, cliente ou sinal.</p> : null}
    </div>
  );
}
