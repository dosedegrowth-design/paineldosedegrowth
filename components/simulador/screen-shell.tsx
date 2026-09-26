import type { ReactNode } from "react";

/** Conteúdo de uma etapa; entra e sai com um fade curto (ver `.sim-anim`). */
export function ScreenShell({ children }: { children: ReactNode }) {
  return <div className="sim-anim">{children}</div>;
}
