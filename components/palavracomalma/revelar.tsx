"use client";

import { useEffect, useState } from "react";

/** Faz os blocos .pa-rv surgirem ao rolar (um único observer para a página). */
export function Revelar() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".pa-rv"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

export type ItemNav = { id: string; rotulo: string };

/** Menu fixo de atalhos; marca a seção que está na tela. */
export function Navegacao({ itens }: { itens: ItemNav[] }) {
  const [ativo, setAtivo] = useState<string | undefined>();

  useEffect(() => {
    const secoes = itens
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const visiveis = entries.filter((e) => e.isIntersecting);
        if (visiveis.length) setAtivo(visiveis[0].target.id);
        // acima da primeira seção (no topo da página) nenhum atalho fica marcado
        else if (secoes[0] && secoes[0].getBoundingClientRect().top > window.innerHeight / 2) setAtivo(undefined);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    secoes.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [itens]);

  // mantém o atalho ativo visível na faixa rolável
  useEffect(() => {
    if (!ativo) return;
    const a = document.querySelector<HTMLElement>(`.pa-nav a[href="#${ativo}"]`);
    const faixa = a?.parentElement;
    if (a && faixa) faixa.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" });
  }, [ativo]);

  return (
    <nav className="pa-nav" aria-label="Seções">
      <div className="pa-wrap pa-nav-in">
        {itens.map((i) => (
          <a key={i.id} href={`#${i.id}`} className={ativo === i.id ? "is-on" : undefined}>
            {i.rotulo}
          </a>
        ))}
      </div>
    </nav>
  );
}
