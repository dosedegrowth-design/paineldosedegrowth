"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminReviewSignupAction } from "@/lib/tayssa/actions/clients";
import { dateTime } from "@/lib/tayssa/format";
import { formatBrPhone } from "@/lib/tayssa/phone";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { Area } from "@/components/tayssa/admin/forms";
import { useTarefa } from "@/components/tayssa/ui/acao";

/**
 * A Tayssa libera quem se cadastrou no site (cadastro VIP, 09/11/2026). Um
 * cartão só, centrado: quem é, o recado, o WhatsApp e três decisões.
 * "Liberar" abre a conta para a agenda (o VIP vem com os atendimentos);
 * "Liberar como VIP" já entra VIP; "Recusar" guarda o motivo só para ela.
 * Depois, um toque manda a resposta pronta no WhatsApp.
 */
export function SignupReviewPanel({
  id,
  name,
  nickname,
  email,
  phone,
  message,
  requestedAt,
}: {
  id: string;
  name: string;
  nickname: string | null;
  email: string | null;
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
  const [pending, start] = useTarefa();
  const first = nickname?.trim() || name.split(" ")[0];

  const run = (decision: "approve" | "reject", comoVip = false) =>
    start(async () => {
      setError(null);
      setVip(comoVip);
      const r = await adminReviewSignupAction({ id, decision, vip: comoVip, note: note.trim() || undefined });
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
            {decided === "approve" ? (vip ? "Liberada como VIP" : "Conta liberada") : decided === "reject" ? "Cadastro recusado" : "Cadastro para liberar"}
          </span>
          <h2 className="tya-pedido__nome">{name}</h2>
          {requestedAt ? <span className="tya-pedido__quando">se cadastrou em {dateTime(requestedAt).replace(" ", " às ")}</span> : null}
        </div>
      </header>

      {decided ? (
        <div className="tya-pedido__fim">
          <p>
            {decided === "approve"
              ? `${first} já pode entrar com o WhatsApp e a senha que criou${vip ? ", já como VIP" : ""}. Avisa ela:`
              : "A conta fica marcada como recusada. Se mudar de ideia, dá para reativar na ficha dela."}
          </p>
          <div className="tya-pedido__acoes">
            {decided === "approve" && welcome ? (
              <a href={welcome} target="_blank" rel="noopener noreferrer" className="tya-btn tya-btn--primary">
                Avisar no WhatsApp
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
            {nickname ? (
              <div>
                <dt>Chamar de</dt>
                <dd>{nickname}</dd>
              </div>
            ) : null}
            <div>
              <dt>WhatsApp</dt>
              <dd>
                {phone ? (
                  <a href={whatsappUrl(phone, `Oi, ${first}! Aqui é a Tayssa.`)} target="_blank" rel="noopener noreferrer" className="tya-link">
                    {formatBrPhone(phone)}
                  </a>
                ) : (
                  "sem WhatsApp"
                )}
              </dd>
            </div>
            {email ? (
              <div>
                <dt>E-mail</dt>
                <dd>{email}</dd>
              </div>
            ) : null}
          </dl>

          {!rejecting ? (
            <div className="tya-pedido__acoes tya-pedido__acoes--tres">
              <button type="button" className="tya-btn tya-btn--primary" onClick={() => run("approve")} disabled={pending}>
                {pending && !vip ? "Liberando…" : "Liberar"}
              </button>
              <button type="button" className="tya-btn tya-btn--gold" onClick={() => run("approve", true)} disabled={pending}>
                {pending && vip ? "Liberando…" : "Liberar como VIP"}
              </button>
              <button type="button" className="tya-btn tya-btn--ghost" onClick={() => setRejecting(true)} disabled={pending}>
                Recusar
              </button>
            </div>
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
