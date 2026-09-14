"use client";

import { createContext, useContext, type ReactNode } from "react";

/** src -> o arquivo existe? (calculado no servidor). */
const Ctx = createContext<Record<string, boolean> | null>(null);

export function DisponibilidadeProvider({
  value,
  children,
}: {
  value: Record<string, boolean>;
  children: ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Sem provider, assume que existe e deixa o onError decidir. */
export function useFotoDisponivel(src: string): boolean {
  const mapa = useContext(Ctx);
  if (!mapa) return true;
  return mapa[src] ?? true;
}
