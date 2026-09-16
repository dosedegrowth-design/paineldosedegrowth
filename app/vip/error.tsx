"use client";

/** Algo falhou ao montar a tela. Sem tela branca, sem jargão: um convite a tentar de novo. */
export default function VipError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="tyv-panel" style={{ marginTop: 28 }} role="alert">
      <span className="tyv-label">Algo não carregou</span>
      <p className="tyv-empty" style={{ marginTop: 10 }}>
        Deu um soluço por aqui. Nada foi perdido — tente de novo. Se continuar, a Tayssa está a um toque no WhatsApp, ali em cima.
      </p>
      <button type="button" className="tyv-btn tyv-btn--ghost" style={{ marginTop: 18 }} onClick={reset}>
        Tentar de novo
      </button>
    </div>
  );
}
