"use client";

import { TyButton } from "@/components/tayssa/ui/button";

/** unstable_retry busca a tela de novo no servidor (o reset só redesenhava o erro). */
export default function AdminError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <div style={{ paddingBlock: "clamp(28px, 4vw, 56px)", maxWidth: 560 }} role="alert">
      <span className="ty-eyebrow" style={{ display: "block", marginBottom: 12 }}>
        Algo não carregou
      </span>
      <h1 className="ty-display" style={{ fontSize: "clamp(26px, 3.34vw, 40px)" }}>
        Deu um <em>soluço</em> por aqui.
      </h1>
      <p className="ty-body" style={{ marginTop: 12 }}>
        Nada foi perdido. Tente de novo; se continuar, recarregue a página.
      </p>
      <div style={{ marginTop: 22 }}>
        <TyButton size="sm" variant="solid" onClick={() => unstable_retry()}>
          Tentar de novo
        </TyButton>
      </div>
    </div>
  );
}
