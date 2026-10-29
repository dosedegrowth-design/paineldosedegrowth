"use client";

import { useEffect } from "react";
import { avisarErro } from "@/components/tayssa/ui/sem-quebrar";

/**
 * Quando algo quebra no site, no VIP ou no painel: no lugar da tela branca
 * de "Application error", um recado e o botão de tentar de novo. O erro vai
 * para o log da Vercel.
 */
export default function ErroTayssa({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => {
    avisarErro("pagina", error);
  }, [error]);

  return (
    <main className="ty-section">
      <div className="ty-container" style={{ display: "grid", gap: 18, justifyItems: "center", textAlign: "center", paddingBlock: "18vh" }}>
        <h1 className="ty-h">Algo travou por aqui.</h1>
        <p className="ty-body">Tente de novo. Se continuar, chame a Tayssa no WhatsApp.</p>
        <button type="button" className="ty-btn" onClick={() => unstable_retry()}>
          <span>Tentar de novo</span>
        </button>
      </div>
    </main>
  );
}
