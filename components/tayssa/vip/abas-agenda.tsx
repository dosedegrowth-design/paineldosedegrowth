"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

export type AbaDaAgenda = "realizados" | "aberto" | "marcar";

const ABAS: { id: AbaDaAgenda; nome: string }[] = [
  { id: "realizados", nome: "Realizados" },
  { id: "aberto", nome: "Em aberto" },
  { id: "marcar", nome: "Marcar" },
];

/**
 * Meus agendamentos (Lucas, 05/11/2026): três abas logo abaixo do topo,
 * Realizados · Em aberto · Marcar. Tocar numa aba troca só o que vem
 * embaixo; o topo fica onde está, e a barra das abas gruda embaixo do topo
 * quando a lista é longa. As três ficam montadas (a do "Marcar" guarda o
 * que ela já escolheu) e a aba vai para o endereço (?aba=), então
 * recarregar ou voltar abre a mesma.
 */
export function AbasDaAgenda({
  inicial,
  contagem,
  realizados,
  aberto,
  marcar,
}: {
  inicial: AbaDaAgenda;
  contagem: { realizados: number; aberto: number };
  realizados: ReactNode;
  aberto: ReactNode;
  marcar: ReactNode;
}) {
  const [aba, setAba] = useState<AbaDaAgenda>(inicial);
  const [grudada, setGrudada] = useState(false);
  const base = useId();
  const barra = useRef<HTMLDivElement>(null);
  const marco = useRef<HTMLSpanElement>(null);
  const indice = ABAS.findIndex((a) => a.id === aba);

  // a faixa atrás das abas só aparece quando a barra gruda embaixo do topo (solta, era um
  // retângulo claro no meio da página); o marco fica logo acima da barra e some sob o topo
  useEffect(() => {
    const el = barra.current;
    const m = marco.current;
    if (!el || !m) return;
    const topo = Math.ceil(parseFloat(getComputedStyle(el).top) || 0);
    const io = new IntersectionObserver(
      ([e]) => setGrudada(!e.isIntersecting && e.boundingClientRect.top < topo + 1),
      { rootMargin: `-${topo + 1}px 0px 0px 0px` },
    );
    io.observe(m);
    return () => io.disconnect();
  }, []);

  // o endereço acompanha a aba sem navegar (nada recarrega, o histórico não enche)
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("aba") === aba) return;
    url.searchParams.set("aba", aba);
    window.history.replaceState(window.history.state, "", url);
  }, [aba]);

  const trocar = (id: AbaDaAgenda) => {
    setAba(id);
    // a barra grudada: ao trocar com a página rolada, o começo da aba nova aparece logo embaixo dela
    const el = barra.current;
    if (el && el.getBoundingClientRect().top <= 72) {
      const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ block: "start", behavior: reduzir ? "auto" : "smooth" });
    }
  };

  // setas do teclado andam entre as abas, como o leitor de tela espera
  const teclas = (e: KeyboardEvent<HTMLDivElement>) => {
    const passo = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!passo) return;
    e.preventDefault();
    const proxima = ABAS[(indice + passo + ABAS.length) % ABAS.length];
    trocar(proxima.id);
    document.getElementById(`${base}-aba-${proxima.id}`)?.focus();
  };

  const conteudo: Record<AbaDaAgenda, ReactNode> = { realizados, aberto, marcar };

  return (
    <div className="tyv-abas">
      <span ref={marco} className="tyv-abas__marco" aria-hidden />
      <div ref={barra} className="tyv-abas__barra" data-grudada={grudada || undefined}>
        <div
          className="tyv-abas__lista"
          role="tablist"
          aria-label="Meus agendamentos"
          onKeyDown={teclas}
          style={{ "--tyv-aba": indice } as CSSProperties}
        >
          <span className="tyv-abas__marca" aria-hidden />
          {ABAS.map((a) => {
            const n = a.id === "realizados" ? contagem.realizados : a.id === "aberto" ? contagem.aberto : null;
            return (
              <button
                key={a.id}
                id={`${base}-aba-${a.id}`}
                type="button"
                role="tab"
                className="tyv-abas__aba"
                aria-selected={aba === a.id}
                aria-controls={`${base}-painel-${a.id}`}
                tabIndex={aba === a.id ? 0 : -1}
                onClick={() => trocar(a.id)}
              >
                {a.nome}
                {n ? <span className="tyv-abas__n">{n}</span> : null}
              </button>
            );
          })}
        </div>
      </div>

      {ABAS.map((a) => (
        <div
          key={a.id}
          id={`${base}-painel-${a.id}`}
          role="tabpanel"
          aria-labelledby={`${base}-aba-${a.id}`}
          className="tyv-abas__painel"
          hidden={aba !== a.id}
        >
          {conteudo[a.id]}
        </div>
      ))}
    </div>
  );
}
