"use client";

import { useEffect } from "react";

/**
 * A agenda e a conta da cliente na paleta do site (09/11/2026): o marcador
 * faz o vip-site.css pintar a tela no vinho escuro, e a barra do navegador
 * acompanha enquanto a tela está aberta (ao sair, volta à cor do VIP).
 * A cor da barra não vem de `viewport` na página: numa rota reescrita pelo
 * middleware (/tayssa/meus-horarios → /tayssa/vip/agendar) isso dava 404.
 */
export function TomDoSite() {
  useEffect(() => {
    const metas = Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'));
    const antes = metas.map((m) => m.content);
    for (const m of metas) m.content = "#2a0714";
    return () => metas.forEach((m, i) => (m.content = antes[i]));
  }, []);
  return <span className="tyv-tom-site" hidden />;
}
