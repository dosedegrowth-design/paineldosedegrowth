"use client";

import { useEffect } from "react";

/**
 * Link com âncora para uma parte fechada (o "Indicar alguém" da casa leva a
 * Benefícios#indicar): a linha abre sozinha e a tela vai até ela. Vale
 * também quando a âncora muda com a página já aberta.
 */
export function AbrirPeloEndereco() {
  useEffect(() => {
    const abrir = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      if (!(el instanceof HTMLDetailsElement)) return;
      el.open = true;
      const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      requestAnimationFrame(() => el.scrollIntoView({ block: "start", behavior: reduzir ? "auto" : "smooth" }));
    };
    abrir();
    window.addEventListener("hashchange", abrir);
    return () => window.removeEventListener("hashchange", abrir);
  }, []);
  return null;
}
