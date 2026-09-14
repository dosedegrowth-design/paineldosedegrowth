"use client";

import { createContext, useContext, type ReactNode } from "react";

/** src -> existe? (calculado no servidor). Sem provider, tenta carregar. */
const Ctx = createContext<Record<string, boolean> | null>(null);

export function PhotoAvailabilityProvider({
  value,
  children,
}: {
  value: Record<string, boolean>;
  children: ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePhotoAvailable(src: string): boolean {
  const map = useContext(Ctx);
  if (!map) return true;
  return map[src] ?? true;
}
