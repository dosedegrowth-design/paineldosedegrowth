"use client";

import { useCallback, useEffect, useRef } from "react";

export type OAuthProvider = "meta" | "google" | "shopify";

export interface OAuthCompleteEvent {
  type: "ddg_oauth_complete";
  provider: OAuthProvider;
  ok: boolean;
  clienteId: string | null;
  error: string | null;
}

interface UseOAuthPopupOpts {
  onComplete: (event: OAuthCompleteEvent) => void;
}

/**
 * Hook compartilhado pra abrir OAuth em popup com fallback automático para redirect.
 *
 * Como funciona:
 * 1. abrirPopup(url) tenta abrir window.open(url, ..., features)
 * 2. Se popup foi bloqueado pelo browser, faz window.location.href = url (fallback)
 * 3. Listener de "message" no window principal recebe { type: 'ddg_oauth_complete', ... }
 * 4. Chama onComplete e limpa watcher
 *
 * Server action precisa ser chamada com modo="popup" pra callback retornar HTML
 * em vez de redirect.
 */
export function useOAuthPopup({ onComplete }: UseOAuthPopupOpts) {
  const popupRef = useRef<Window | null>(null);
  const watcherRef = useRef<number | null>(null);

  // Cleanup
  const cleanup = useCallback(() => {
    if (watcherRef.current) {
      window.clearInterval(watcherRef.current);
      watcherRef.current = null;
    }
    popupRef.current = null;
  }, []);

  // Listener de postMessage
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      // Aceita só do mesmo origin
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.type !== "ddg_oauth_complete") return;
      onComplete(data as OAuthCompleteEvent);
      cleanup();
    };
    window.addEventListener("message", handler);
    return () => {
      window.removeEventListener("message", handler);
      cleanup();
    };
  }, [onComplete, cleanup]);

  /**
   * Abre o popup. Retorna true se popup abriu, false se fez fallback redirect.
   */
  const abrirPopup = useCallback(
    (url: string, _provider: OAuthProvider): boolean => {
      const w = 600;
      const h = 720;
      const left = window.screenX + (window.outerWidth - w) / 2;
      const top = window.screenY + (window.outerHeight - h) / 2;
      const features = `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,scrollbars=yes`;

      const popup = window.open(url, "ddg_oauth_popup", features);

      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        // Bloqueado pelo browser → fallback redirect
        window.location.href = url;
        return false;
      }

      popupRef.current = popup;
      try {
        popup.focus();
      } catch {
        // alguns browsers bloqueiam .focus()
      }

      // Watcher: se user fechar popup manualmente sem completar OAuth,
      // faz cleanup pra não deixar listener pendurado
      watcherRef.current = window.setInterval(() => {
        if (popupRef.current && popupRef.current.closed) {
          cleanup();
          // Não chama onComplete: foi cancelamento manual
        }
      }, 800) as unknown as number;

      return true;
    },
    [cleanup]
  );

  return { abrirPopup };
}
