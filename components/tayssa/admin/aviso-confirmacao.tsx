"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { copiarTexto } from "@/components/tayssa/ui/copiar";
import { WhatsAppIcon } from "@/components/tayssa/ui/whatsapp";

/** A mensagem como o WhatsApp mostra: *assim* vira negrito, linha vazia separa os blocos. */
function Previa({ texto }: { texto: string }) {
  const blocos = texto.split("\n\n");
  return (
    <div className="tya-aviso__bolha">
      {blocos.map((bloco, i) => (
        <p key={i}>
          {bloco.split("\n").map((linha, j) => (
            <span key={j} className="tya-aviso__linha">
              {linha.split(/(\*[^*\n]+\*)/g).map((parte, k) =>
                /^\*[^*\n]+\*$/.test(parte) ? <b key={k}>{parte.slice(1, -1)}</b> : parte,
              )}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

/**
 * Logo depois do "Confirmar" na Agenda (Lucas, 11/11/2026): a mensagem pronta
 * para aquela cliente, com o nome dela, o horário confirmado, o comprovante
 * aceito, o endereço, a tolerância e o recado. Sem a API oficial do
 * WhatsApp, o envio é da Tayssa: abre a conversa da cliente com o texto ou
 * copia. Fechar tira o `?avisar=` do endereço; o "Mensagem de confirmação"
 * de cada horário confirmado abre de novo.
 */
export function AvisoDeConfirmacao({
  nome,
  mensagem,
  whatsapp,
  fechar,
}: {
  nome: string;
  mensagem: string;
  /** a conversa da cliente com o texto (sem WhatsApp no cadastro, só copiar) */
  whatsapp: string | null;
  /** para onde volta ao fechar (a Agenda sem o `?avisar=`) */
  fechar: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [copiado, setCopiado] = useState(false);
  const [semCopiar, setSemCopiar] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d || d.open) return;
    d.showModal();
    // o foco vai para a ação principal (sem isso o navegador foca a bolha, que rola, e desenha a moldura nela)
    d.querySelector<HTMLElement>(".tya-aviso__acoes a, .tya-aviso__acoes button")?.focus({ preventScroll: true });
  }, []);

  const copiar = async () => {
    const deu = await copiarTexto(mensagem);
    setSemCopiar(!deu);
    if (deu) {
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 3000);
    }
  };

  return (
    <dialog
      ref={ref}
      className="tya-aviso"
      aria-labelledby="tya-aviso-titulo"
      onClose={() => router.replace(fechar, { scroll: false })}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close();
      }}
    >
      <div className="tya-aviso__corpo">
        <header className="tya-aviso__topo">
          <span className="tya-pill tya-pill--ok">Horário confirmado</span>
          <h2 id="tya-aviso-titulo">Mensagem para {nome}</h2>
          <p className="tya-small">
            Pronta para mandar: abra a conversa no WhatsApp com o texto ou copie e cole onde quiser.
          </p>
        </header>

        <Previa texto={mensagem} />

        {semCopiar ? (
          <p className="tya-small" role="status">
            O navegador não deixou copiar. Segure no texto acima, selecione tudo e copie.
          </p>
        ) : null}

        <div className="tya-aviso__acoes">
          {whatsapp ? (
            <a className="tya-btn tya-btn--primary tya-aviso__whats" href={whatsapp} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={18} />
              Abrir a conversa no WhatsApp
            </a>
          ) : null}
          <button type="button" className="tya-btn tya-btn--ghost" onClick={copiar} aria-live="polite">
            {copiado ? "Mensagem copiada" : "Copiar mensagem"}
          </button>
          <button type="button" className="tya-btn tya-btn--ghost tya-aviso__fechar" onClick={() => ref.current?.close()}>
            Fechar
          </button>
        </div>
      </div>
    </dialog>
  );
}
