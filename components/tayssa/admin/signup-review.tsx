"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminReviewSignupAction } from "@/lib/tayssa/actions/clients";
import { dateTime } from "@/lib/tayssa/format";
import { formatBrPhone } from "@/lib/tayssa/phone";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { TyButton } from "@/components/tayssa/ui/button";
import { TyTextarea } from "@/components/tayssa/ui/field";

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
        <p className="ty-lead" style={{ fontSize: 18 }}>
          {decided === "approve" ? `${name.split(" ")[0]} já pode entrar.` : "Pedido recusado."}
        </p>
        {decided === "approve" ? (
          <p className="ty-body">
            A conta está ativa{vip ? " e já como VIP" : ""}. Ela entra com o e-mail e a senha que escolheu no cadastro — avisa ela:
          </p>
        ) : (
          <p className="ty-body">A conta fica marcada como recusada; se mudar de ideia, dá para reativar em “Conta”.</p>
        )}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {decided === "approve" && welcome ? (
            <a href={welcome} target="_blank" rel="noopener noreferrer" className="ty-btn ty-btn--sm ty-btn--solid">
              <span>Mandar boas-vindas no WhatsApp</span>
              <span className="ty-btn__arrow" aria-hidden />
            </a>
          ) : null}
          {decided === "approve" ? (
            <TyButton size="sm" onClick={() => router.refresh()}>
              Atualizar ficha
            </TyButton>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18, maxWidth: 640 }}>
      <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 18px", fontSize: 14.5 }}>
        <dt className="ty-eyebrow" style={{ fontSize: 10 }}>Pedido</dt>
        <dd style={{ margin: 0 }}>{requestedAt ? dateTime(requestedAt) : "—"}</dd>
        <dt className="ty-eyebrow" style={{ fontSize: 10 }}>E-mail</dt>
        <dd style={{ margin: 0 }}>{email}</dd>
        <dt className="ty-eyebrow" style={{ fontSize: 10 }}>WhatsApp</dt>
        <dd style={{ margin: 0 }}>
          {phone ? (
            <a href={whatsappUrl(phone, `Oi, ${name.split(" ")[0]}! Aqui é a Tayssa.`)} target="_blank" rel="noopener noreferrer" className="ty-link">
              {formatBrPhone(phone)}
            </a>
          ) : (
            "—"
          )}
        </dd>
        {message ? (
          <>
            <dt className="ty-eyebrow" style={{ fontSize: 10 }}>Recado</dt>
            <dd style={{ margin: 0, fontWeight: 300 }}>“{message}”</dd>
          </>
        ) : null}
      </dl>

      {!rejecting ? (
        <>
          <label className="ty-check">
            <input type="checkbox" checked={vip} onChange={(e) => setVip(e.target.checked)} />
            <span>Já entra como VIP (aniversário e benefícios exclusivos liberados)</span>
          </label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <TyButton size="sm" variant="solid" arrow onClick={() => run("approve")} disabled={pending}>
              {pending ? "Aprovando…" : "Aprovar acesso"}
            </TyButton>
            <TyButton size="sm" onClick={() => setRejecting(true)} disabled={pending}>
              Recusar
            </TyButton>
          </div>
        </>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          <TyTextarea
            label="Motivo (só você vê)"
            name="note"
            rows={2}
            maxLength={300}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <TyButton size="sm" variant="accent" onClick={() => run("reject")} disabled={pending}>
              {pending ? "Recusando…" : "Confirmar recusa"}
            </TyButton>
            <TyButton size="sm" onClick={() => setRejecting(false)} disabled={pending}>
              Voltar
            </TyButton>
          </div>
        </div>
      )}
      {error ? (
        <div className="ty-form-error" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}
