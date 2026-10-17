"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminReviewSignupAction } from "@/lib/tayssa/actions/clients";
import { dateTime } from "@/lib/tayssa/format";
import { formatBrPhone } from "@/lib/tayssa/phone";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { Area } from "@/components/tayssa/admin/forms";

/**
 * A Tayssa decide quem entra. Um cartão só, centrado e na largura de um
 * cartão (não da tela): quem é, o recado, como falar com ela e duas
 * decisões. Aprovar abre a conta na hora (a senha a cliente já escolheu);
 * recusar guarda o motivo só para ela.
 */
export function SignupReviewPanel({
  id,
  name,
  email,
  phone,
  message,
  requestedAt,
}: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  requestedAt: string | null;
}) {
  const router = useRouter();
  const [vip, setVip] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [welcome, setWelcome] = useState<string | null>(null);
  const [decided, setDecided] = useState<"approve" | "reject" | null>(null);
  const [pending, start] = useTransition();
  const first = name.split(" ")[0];

  const run = (decision: "approve" | "reject") =>
    start(async () => {
      setError(null);
      const r = await adminReviewSignupAction({ id, decision, vip, note: note.trim() || undefined });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setDecided(decision);
      setWelcome(r.data.welcomeUrl);
    });

  return (
    <article className="tya-pedido" data-decidido={decided ?? undefined}>
      <header className="tya-pedido__topo">
        <span className="tya-pedido__ini" aria-hidden>
          {first.charAt(0).toUpperCase()}
        </span>
        <div className="tya-pedido__quem">
          <span className="tya-pedido__rotulo">
            {decided === "approve" ? "Acesso aprovado" : decided === "reject" ? "Pedido recusado" : "Pedido de acesso"}
          </span>
          <h2 className="tya-pedido__nome">{name}</h2>
          {requestedAt ? <span className="tya-pedido__quando">pediu em {dateTime(requestedAt).replace(" ", " às ")}</span> : null}
        </div>
      </header>

      {decided ? (
        <div className="tya-pedido__fim">
          <p>
            {decided === "approve"
              ? `${first} já pode entrar com o e-mail e a senha que escolheu${vip ? ", já como VIP" : ""}. Avisa ela:`
              : "A conta fica marcada como recusada. Se mudar de ideia, dá para reativar na ficha dela."}
          </p>
          <div className="tya-pedido__acoes">
            {decided === "approve" && welcome ? (
              <a href={welcome} target="_blank" rel="noopener noreferrer" className="tya-btn tya-btn--primary">
                Mandar boas-vindas no WhatsApp
              </a>
            ) : null}
            <button type="button" className="tya-btn tya-btn--ghost" onClick={() => router.refresh()}>
              {decided === "approve" ? "Abrir a ficha" : "Fechar"}
            </button>
          </div>
        </div>
      ) : (
        <>
          {message ? <blockquote className="tya-pedido__recado">{message}</blockquote> : null}

          <dl className="tya-pedido__dados">
            <div>
              <dt>E-mail</dt>
              <dd>{email}</dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd>
                {phone ? (
                  <a href={whatsappUrl(phone, `Oi, ${first}! Aqui é a Tayssa.`)} target="_blank" rel="noopener noreferrer" className="tya-link">
                    {formatBrPhone(phone)}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>

          {!rejecting ? (
            <>
              <label className="tya-pedido__vip">
                <span>
                  <b>Já entra como VIP</b>
                  <small>aniversário e benefícios exclusivos liberados</small>
                </span>
                <input type="checkbox" role="switch" className="tya-switch" checked={vip} onChange={(e) => setVip(e.target.checked)} />
              </label>
              <div className="tya-pedido__acoes">
                <button type="button" className="tya-btn tya-btn--primary" onClick={() => run("approve")} disabled={pending}>
                  {pending ? "Aprovando…" : "Aprovar acesso"}
                </button>
                <button type="button" className="tya-btn tya-btn--ghost" onClick={() => setRejecting(true)} disabled={pending}>
                  Recusar
                </button>
              </div>
            </>
          ) : (
            <div className="tya-pedido__recusa">
              <Area label="Motivo (só você vê)" name="note" rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
              <div className="tya-pedido__acoes">
                <button type="button" className="tya-btn tya-btn--danger" onClick={() => run("reject")} disabled={pending}>
                  {pending ? "Recusando…" : "Confirmar recusa"}
                </button>
                <button type="button" className="tya-btn tya-btn--ghost" onClick={() => setRejecting(false)} disabled={pending}>
                  Voltar
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {error ? (
        <p className="tya-err" role="alert">
          {error}
        </p>
      ) : null}
    </article>
  );
}
