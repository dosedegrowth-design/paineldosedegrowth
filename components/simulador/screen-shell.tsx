import type { ReactNode } from "react";

/**
 * Esqueleto de toda tela: faixa escura em cima + folha branca embaixo.
 * Os fundos ficam fixos entre as telas; só o conteúdo (`.sim-anim`) entra e
 * sai — assim a troca de etapa não pisca.
 */
export function ScreenShell({
  band,
  bandClassName,
  children,
}: {
  band: ReactNode;
  bandClassName?: string;
  children: ReactNode;
}) {
  return (
    <>
      <div className={`sim-band${bandClassName ? ` ${bandClassName}` : ""}`}>
        <div className="sim-band__in sim-anim">{band}</div>
      </div>
      <div className="sim-sheet">
        <div className="sim-sheet__in sim-anim sim-anim--late">{children}</div>
      </div>
    </>
  );
}
