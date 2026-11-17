"use client";

import { useState } from "react";
import { useTarefa } from "@/components/tayssa/ui/acao";
import { WhatsAppIcon } from "@/components/tayssa/ui/whatsapp";
import { adminGerarLinkRelatorioAction, adminRevogarLinkRelatorioAction } from "@/lib/tayssa/actions/gestao";

/**
 * "Enviar relatório para Larissa" (17/11/2026): gera a página do relatório
 * do período (um link só dela, que dá para revogar) e abre o WhatsApp da
 * Larissa com a mensagem e o link prontos. Quem envia é a Tayssa: o painel
 * não manda nada sozinho.
 */
export function EnviarRelatorio({ periodo, nomeLarissa }: { periodo: Record<string, string>; nomeLarissa: string }) {
  const [link, setLink] = useState<{ url: string; whatsapp: string } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTarefa();
  if (link) {
    return (
      <div className="tyaenv">
        <p className="tya-small">Link do relatório pronto. Confira e envie pelo WhatsApp da {nomeLarissa}:</p>
        <input className="tya-field tyaenv__link" readOnly value={link.url} onFocus={(e) => e.currentTarget.select()} aria-label="Link do relatório" />
        <div className="tyaenv__botoes">
          <a href={link.whatsapp} target="_blank" rel="noopener noreferrer" className="tya-btn tya-btn--primary">
            <WhatsAppIcon size={16} />
            Abrir o WhatsApp da {nomeLarissa}
          </a>
          <button
            type="button"
            className="tya-btn tya-btn--ghost"
            onClick={() => {
              navigator.clipboard
                ?.writeText(link.url)
                .then(() => setCopiado(true))
                .catch(() => setCopiado(false));
            }}
          >
            {copiado ? "Link copiado" : "Copiar link"}
          </button>
          <button type="button" className="tya-link" onClick={() => setLink(null)}>
            Gerar outro
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="tyaenv">
      <button
        type="button"
        className="tya-btn tya-btn--primary"
        disabled={pendente}
        onClick={() => {
          setErro(null);
          iniciar(async () => {
            const r = await adminGerarLinkRelatorioAction(periodo);
            if (!r.ok) setErro(r.error);
            else setLink({ url: r.data.url, whatsapp: r.data.whatsapp });
          });
        }}
      >
        <WhatsAppIcon size={16} />
        {pendente ? "Gerando o relatório…" : `Enviar relatório para ${nomeLarissa}`}
      </button>
      {erro ? <p className="tya-err">{erro}</p> : null}
    </div>
  );
}

export function RevogarLink({ id }: { id: string }) {
  const [certeza, setCerteza] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTarefa();
  if (!certeza) {
    return (
      <button type="button" className="tya-link" onClick={() => setCerteza(true)}>
        Desativar link
      </button>
    );
  }
  return (
    <span>
      <button
        type="button"
        className="tya-link"
        disabled={pendente}
        onClick={() => {
          setErro(null);
          iniciar(async () => {
            const r = await adminRevogarLinkRelatorioAction({ id });
            if (!r.ok) setErro(r.error);
          });
        }}
      >
        {pendente ? "Desativando…" : "Sim, desativar"}
      </button>{" "}
      <button type="button" className="tya-link" onClick={() => setCerteza(false)}>
        não
      </button>
      {erro ? <span className="tya-err"> {erro}</span> : null}
    </span>
  );
}
