"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * O que toda camada de tela cheia do site precisa (visores de foto e
 * vídeo, menu do celular) e elas não tinham:
 * - a página atrás para de rolar — inclusive o Lenis, que ignora o
 *   `overflow: hidden` e seguia rolando o site com a roda do mouse;
 * - o Tab gira dentro da camada (antes passeava pelo site escondido atrás);
 * - Esc fecha;
 * - ao fechar, o foco volta para quem abriu (antes caía no <body>).
 *
 * Chame ANTES de qualquer efeito que mova o foco para dentro da camada:
 * quem abriu é lido no momento em que ela abre.
 */
export function useCamadaAberta(
  aberto: boolean,
  camada: RefObject<HTMLElement | null>,
  opcoes: { aoEsc?: () => void; extras?: RefObject<HTMLElement | null>[] } = {}
) {
  const aoEsc = useRef(opcoes.aoEsc);
  const extras = useRef(opcoes.extras);
  useEffect(() => {
    aoEsc.current = opcoes.aoEsc;
    extras.current = opcoes.extras;
  });

  useEffect(() => {
    if (!aberto) return;
    const volta = document.activeElement as HTMLElement | null;
    window.__tyLenis?.stop();

    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape" && aoEsc.current) {
        aoEsc.current();
        return;
      }
      if (e.key !== "Tab") return;
      const el = camada.current;
      if (!el) return;
      const alvos = [
        ...(extras.current ?? []).map((r) => r.current).filter((x): x is HTMLElement => Boolean(x)),
        ...Array.from(el.querySelectorAll<HTMLElement>(FOCAVEIS)),
      ].filter((x) => x.getClientRects().length > 0);
      if (!alvos.length) return;
      const ativo = document.activeElement as HTMLElement | null;
      const i = ativo ? alvos.indexOf(ativo) : -1;
      if (i === -1) {
        e.preventDefault();
        alvos[e.shiftKey ? alvos.length - 1 : 0].focus();
      } else if (e.shiftKey && i === 0) {
        e.preventDefault();
        alvos[alvos.length - 1].focus();
      } else if (!e.shiftKey && i === alvos.length - 1) {
        e.preventDefault();
        alvos[0].focus();
      }
    };
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("keydown", tecla);
      window.__tyLenis?.start();
      if (volta && volta.isConnected && volta !== document.body) volta.focus({ preventScroll: true });
    };
  }, [aberto, camada]);
}
