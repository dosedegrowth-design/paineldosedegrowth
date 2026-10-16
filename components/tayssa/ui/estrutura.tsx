"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const KEY = "ty_estrutura";
const Ctx = createContext(false);

/**
 * Modo estrutura: mostra os espaços reservados para conteúdo que ainda
 * não chegou (bio, endereço, vídeos…). Liga com `?estrutura=1` (vale para
 * a aba enquanto ela estiver aberta) e desliga com `?estrutura=0`. Em
 * desenvolvimento fica ligado. O visitante comum nunca vê: no site
 * publicado, seção sem conteúdo real simplesmente não aparece.
 *
 * Começa sempre desligado no servidor e liga depois da montagem, para o
 * HTML pré-renderizado ser o do visitante e a hidratação bater.
 */
export function EstruturaProvider({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let ligado = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_TAYSSA_ESTRUTURA === "1";
    try {
      const q = new URLSearchParams(window.location.search).get("estrutura");
      if (q === "1") sessionStorage.setItem(KEY, "1");
      if (q === "0") sessionStorage.removeItem(KEY);
      if (sessionStorage.getItem(KEY) === "1") ligado = true;
      if (q === "0") ligado = false;
    } catch {}
    // leitura de ambiente do navegador: só existe depois de montar
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ligado) setOn(true);
  }, []);
  return (
    <Ctx.Provider value={on}>
      {children}
      {on ? (
        <p className="ty-estrutura-aviso" role="note">
          Modo estrutura · os blocos tracejados são conteúdo pendente ·{" "}
          <a href="?estrutura=0">sair</a>
        </p>
      ) : null}
    </Ctx.Provider>
  );
}

export const useEstrutura = () => useContext(Ctx);

/**
 * Marca de conteúdo pendente. Só desenha no modo estrutura; fora dele não
 * ocupa espaço nenhum.
 */
export function Pendente({
  titulo,
  detalhe,
  midia = false,
}: {
  titulo: string;
  detalhe?: string;
  /** sobreposto a um quadro de foto/vídeo */
  midia?: boolean;
}) {
  const on = useEstrutura();
  if (!on) return null;
  return (
    <div className={`ty-pendente${midia ? " ty-pendente--midia" : ""}`} data-pendente={titulo}>
      <span className="ty-pendente__selo">conteúdo pendente</span>
      <span className="ty-pendente__titulo">{titulo}</span>
      {detalhe ? <span className="ty-pendente__detalhe">{detalhe}</span> : null}
    </div>
  );
}
