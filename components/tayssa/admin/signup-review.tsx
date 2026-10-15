"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminReviewSignupAction } from "@/lib/tayssa/actions/clients";
import { dateTime } from "@/lib/tayssa/format";
import { formatBrPhone } from "@/lib/tayssa/phone";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { Area } from "@/components/tayssa/admin/forms";

/**
 * A Tayssa decide quem entra. Aprovar abre a conta na hora (a senha a
 * cliente já escolheu); recusar guarda o motivo só para ela.
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
      // a ficha só recarrega quando ela quiser: o link de boas-vindas fica na tela
      if (decision === "reject") router.refresh();
    });

  if (decided) {
    return (
      <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
        <div>
          <span className={`tya-pill ${decided === "approve" ? "tya-pill--ok" : "tya-pill--bad"}`}>
            {decided === "approve" ? "Acesso aprovado" : "Pedido recusado"}
          </span>
        </div>
        <p className="tya-lead" style={{ marginTop: 0 }}>
          {decided === "approve"
            ? `${name.split(" ")[0]} já pode entrar. A conta está ativa${vip ? " e já como VIP" : ""} — ela entra com o e-mail e a senha que escolheu no cadastro. Avisa ela:`
            : "A conta fica marcada como recusada; se mudar de ideia, dá para reativar em “Conta”."}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {decided === "approve" && welcome ? (
            <a href={welcome} target="_blank" rel="noopener noreferrer" className="tya-btn tya-btn--sm tya-btn--primary">
              Mandar boas-vindas no WhatsApp
            </a>
          ) : null}
          {decided === "approve" ? (
            <button type="button" className="tya-btn tya-btn--sm tya-btn--ghost" onClick={() => router.refresh()}>
              Atualizar ficha
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <dl className="tya-defs">
        <dt>Pedido</dt>
        <dd>{requestedAt ? dateTime(requestedAt) : "—"}</dd>
        <dt>E-mail</dt>
        <dd>{email}</dd>
        <dt>WhatsApp</dt>
        <dd>
          {phone ? (
            <a href={whatsappUrl(phone, `Oi, ${name.split(" ")[0]}! Aqui é a Tayssa.`)} target="_blank" rel="noopener noreferrer" className="tya-link">
              {formatBrPhone(phone)}
            </a>
          ) : (
            "—"
          )}
        </dd>
        {message ? (
          <>
            <dt>Recado</dt>
            <dd>
              <span className="tya-quote" style={{ display: "block", marginTop: 0 }}>“{message}”</span>
            </dd>
          </>
        ) : null}
      </dl>

      {!rejecting ? (
        <>
          <label className="tya-check">
            <input type="checkbox" checked={vip} onChange={(e) => setVip(e.target.checked)} />
            <span>Já entra como VIP (aniversário e benefícios exclusivos liberados)</span>
          </label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="tya-btn tya-btn--primary" onClick={() => run("approve")} disabled={pending}>
              {pending ? "Aprovando…" : "Aprovar acesso"}
            </button>
            <button type="button" className="tya-btn tya-btn--ghost" onClick={() => setRejecting(true)} disabled={pending}>
              Recusar
            </button>
          </div>
        </>
      ) : (
        <div style={{ display: "grid", gap: 12, maxWidth: 480 }}>
          <Area
            label="Motivo (só você vê)"
            name="note"
            rows={2}
            maxLength={300}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="tya-btn tya-btn--sm tya-btn--danger" onClick={() => run("reject")} disabled={pending}>
              {pending ? "Recusando…" : "Confirmar recusa"}
            </button>
            <button type="button" className="tya-btn tya-btn--sm tya-btn--ghost" onClick={() => setRejecting(false)} disabled={pending}>
              Voltar
            </button>
          </div>
        </div>
      )}
      {error ? (
        <p className="tya-err" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
