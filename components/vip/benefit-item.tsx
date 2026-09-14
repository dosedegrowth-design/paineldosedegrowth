"use client";

import { useState, useTransition } from "react";
import { requestBenefitAction } from "@/lib/actions/benefits";
import { BENEFIT_STATUS_LABEL, type ClientBenefitStatus } from "@/lib/types";
import type { ClientBenefitView } from "@/lib/queries/client";
import { dateLong } from "@/lib/format";

const HUMAN: Record<ClientBenefitStatus, string> = {
  pending_validation: "A Tayssa está validando. Assim que confirmar, ele aparece desbloqueado aqui.",
  available: "É seu. Quando quiser usar, é só avisar.",
  requested: "Solicitado. A Tayssa confirma e você agenda.",
  approved: "Confirmado. É só agendar pelo WhatsApp.",
  redeemed: "Utilizado. Obrigada por fazer parte.",
  expired: "Esse benefício expirou.",
  rejected: "Esse benefício não foi liberado desta vez.",
};

/**
 * Benefício no app: título grande, uma frase, um botão. Nada de tabela
 * nem de letra pequena — a cliente lê no ônibus, com uma mão só.
 */
export function BenefitItem({
  item,
  whatsappUrl,
  isVip,
}: {
  item: ClientBenefitView;
  whatsappUrl?: string;
  isVip: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ClientBenefitStatus>(item.status);
  const locked = item.benefit?.type === "birthday" && !isVip;
  const faded = ["redeemed", "expired", "rejected"].includes(status);

  const request = () =>
    start(async () => {
      setError(null);
      const r = await requestBenefitAction({ id: item.id });
      if (!r.ok) setError(r.error);
      else setStatus("requested");
    });

  return (
    <article className="tyv-panel" style={{ opacity: faded ? 0.6 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <span className="tyv-label">{item.benefit?.type === "birthday" ? "Aniversário" : item.benefit?.type === "referral" ? "Indicação" : "Fidelidade"}</span>
        <span className={`tyv-badge ${status === "available" ? "" : "tyv-badge--quiet"}`}>
          {BENEFIT_STATUS_LABEL[status]}
        </span>
      </div>
      <h3 className="tyv-h2" style={{ margin: "12px 0 8px" }}>
        {item.title}
      </h3>
      {item.description ? (
        <p className="tyv-sub" style={{ fontSize: 14 }}>
          {item.description}
        </p>
      ) : null}
      <p className="tyv-sub" style={{ fontSize: 12.5, marginTop: 10 }}>
        {locked ? "Esse benefício faz parte da experiência VIP." : HUMAN[status]}
        {item.expires_at && ["available", "requested", "approved"].includes(status)
          ? ` Válido até ${dateLong(item.expires_at, true)}.`
          : ""}
      </p>
      {item.admin_note && ["approved", "available", "rejected"].includes(status) ? (
        <p className="tyv-sub" style={{ fontSize: 13, fontWeight: 300, marginTop: 8 }}>
          Tayssa: “{item.admin_note}”
        </p>
      ) : null}
      {error ? (
        <div className="ty-form-error" role="alert" style={{ marginTop: 12 }}>
          {error}
        </div>
      ) : null}
      {!locked && status === "available" ? (
        <button type="button" className="tyv-btn tyv-btn--accent" style={{ marginTop: 16 }} onClick={request} disabled={pending}>
          {pending ? "Enviando…" : "Quero usar"}
        </button>
      ) : null}
      {!locked && (status === "approved" || status === "requested") && whatsappUrl ? (
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="tyv-btn tyv-btn--ghost" style={{ marginTop: 16 }}>
          Agendar pelo WhatsApp
        </a>
      ) : null}
    </article>
  );
}
