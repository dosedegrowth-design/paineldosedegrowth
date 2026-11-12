"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminReviewSignupAction } from "@/lib/tayssa/actions/clients";
import { dateTime } from "@/lib/tayssa/format";
import { formatBrPhone } from "@/lib/tayssa/phone";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { useTarefa } from "@/components/tayssa/ui/acao";

/**
 * Pedido de VIP de quem fez o cadastro no site (Lucas, 12/11/2026: "se a
 * cliente faz o cadastro e não é VIP, ela vai ter atendimento, horários,
 * tudo mais; aprovar o quê?"). A conta já marca horário desde o cadastro:
 * a única decisão é o VIP: "Aprovar VIP" ou "Não aprovar" (segue cliente; o
 * VIP vem pela sequência de atendimentos). Nos dois casos, um toque manda a
 * saudação pronta no WhatsApp ("para ela dar uma mensagem de saudação ali
 * para a menina").
 */
export function SignupReviewPanel({
  id,
  name,
  nickname,
  email,
  phone,
  message,
  requestedAt,
  naFicha = false,
}: {
  id: string;
  name: string;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  requestedAt: string | null;
  /** no topo da ficha (conta já ativa), na largura do conteúdo */
  naFicha?: boolean;
}) {
  const router = useRouter();
  const [escolha, setEscolha] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [welcome, setWelcome] = useState<string | null>(null);
  const [decidido, setDecidido] = useState<"vip" | "nao" | null>(null);
  const [pending, start] = useTarefa();
  const first = nickname?.trim() || name.split(" ")[0];

  const run = (vip: boolean) =>
    start(async () => {
      setError(null);
      setEscolha(vip);
      const r = await adminReviewSignupAction({ id, vip });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setDecidido(vip ? "vip" : "nao");
      setWelcome(r.data.welcomeUrl);
    });

  return (
    <article className={`tya-pedido${naFicha ? " tya-pedido--na-ficha" : ""}`} data-decidido={decidido === "vip" ? "approve" : decidido ? "reject" : undefined}>
      <header className="tya-pedido__topo">
        <span className="tya-pedido__ini" aria-hidden>
          {first.charAt(0).toUpperCase()}
        </span>
        <div className="tya-pedido__quem">
          <span className="tya-pedido__rotulo">
            {decidido === "vip" ? "Nova cliente · VIP" : decidido ? "Nova cliente · sem VIP" : "Nova cliente"}
          </span>
          <h2 className="tya-pedido__nome">{name}</h2>
          {requestedAt ? <span className="tya-pedido__quando">se cadastrou em {dateTime(requestedAt).replace(" ", " às ")}</span> : null}
        </div>
      </header>

      {decidido ? (
        <div className="tya-pedido__fim">
          <p>
            {decidido === "vip"
              ? `${first} já é VIP. Manda a saudação:`
              : `${first} continua cliente, com a conta para marcar horário. Manda a saudação:`}
          </p>
          <div className="tya-pedido__acoes">
            {welcome ? (
              <a href={welcome} target="_blank" rel="noopener noreferrer" className="tya-btn tya-btn--primary">
                Mandar saudação no WhatsApp
              </a>
            ) : null}
            <button type="button" className="tya-btn tya-btn--ghost" onClick={() => router.refresh()}>
              Ver a ficha
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

          <p className="tya-small" style={{ margin: 0 }}>
            A conta dela já está pronta para marcar horário. Decida o VIP e mande a saudação.
          </p>
          <div className="tya-pedido__acoes tya-pedido__acoes--dois">
            <button type="button" className="tya-btn tya-btn--gold" onClick={() => run(true)} disabled={pending}>
              {pending && escolha === true ? "Aprovando…" : "Aprovar VIP"}
            </button>
            <button type="button" className="tya-btn tya-btn--ghost" onClick={() => run(false)} disabled={pending}>
              {pending && escolha === false ? "Gravando…" : "Não aprovar"}
            </button>
          </div>
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
