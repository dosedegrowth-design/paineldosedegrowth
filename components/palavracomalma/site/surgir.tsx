"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Faz os blocos .lj-rv surgirem ao entrar na tela. Refaz a varredura a cada troca de página. */
export function Surgir() {
  const caminho = usePathname();
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".lj-rv:not(.is-in)"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [caminho]);
  return null;
}
