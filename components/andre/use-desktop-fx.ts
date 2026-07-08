"use client";

/* Efeitos pesados (WebGL, blend modes de tela cheia) só valem em desktop
   com ponteiro fino e sem prefers-reduced-motion. Como o gate roda ANTES
   de montar os componentes dinâmicos, o chunk do three.js nem é baixado
   no mobile. */

import { useEffect, useState } from "react";

export function useDesktopFX() {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia(
      "(min-width: 1024px) and (pointer: fine)"
    ).matches;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (desktop && !reduce) setOk(true);
  }, []);

  return ok;
}
