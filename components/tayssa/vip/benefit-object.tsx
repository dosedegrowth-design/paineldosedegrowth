"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { requestBenefitAction } from "@/lib/tayssa/actions/benefits";
import { BENEFIT_TYPE_LABEL, type ClientBenefitStatus } from "@/lib/tayssa/types";
import type { ClientBenefitView } from "@/lib/tayssa/queries/client";
import { dateLong } from "@/lib/tayssa/format";
import { BenefitStatusText } from "@/components/tayssa/ui/status";
import { TyButton } from "@/components/tayssa/ui/button";

const HUMAN: Record<ClientBenefitStatus, string> = {
  pending_validation: "A Tayssa está validando. Assim que confirmar, ele aparece desbloqueado aqui.",
  available: "Você desbloqueou um benefício. Quando quiser usar, sinalize para a Tayssa.",
  requested: "Solicitado. A Tayssa confirma e você agenda.",
  approved: "Confirmado. É só agendar pelo WhatsApp.",
  redeemed: "Utilizado. Obrigada por fazer parte.",
  expired: "Esse benefício expirou.",
  rejected: "Esse benefício não foi liberado desta vez.",
};

/**
 * Benefício como objeto de valor: tipografia grande, uma linha, estado.
 * Nada de "10% OFF" dentro de card.
 */
export function BenefitObject({
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
  const [localStatus, setLocalStatus] = useState<ClientBenefitStatus>(item.status);
  const status = localStatus;
  const typeLabel = item.benefit ? BENEFIT_TYPE_LABEL[item.benefit.type] : "Benefício";
  const locked = item.benefit?.type === "birthday" && !isVip;

  const request = () =>
    start(async () => {
      setError(null);
      const r = await requestBenefitAction({ id: item.id });
      if (!r.ok) setError(r.error);
      else setLocalStatus("requested");
    });

  return (
    <motion.article
      layout
      style={{
        padding: "clamp(22px, 3vw, 36px) 0",
        borderTop: "1px solid var(--t-line-strong)",
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 14,
        opacity: ["expired", "rejected", "redeemed"].includes(status) ? 0.55 : 1,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span className="ty-eyebrow">{typeLabel}</span>
        <BenefitStatusText status={status} />
      </div>
      <h3 className="ty-display" style={{ fontSize: "clamp(30px, 4vw, 56px)" }}>
        {item.title}
      </h3>
      {item.description ? (
        <p className="ty-body" style={{ maxWidth: 520, fontSize: 16 }}>
          {item.description}
        </p>
      ) : null}
      <p className="ty-small" style={{ maxWidth: 520 }}>
        {locked ? "Esse benefício faz parte da experiência VIP." : HUMAN[status]}
        {item.expires_at && ["available", "requested", "approved"].includes(status) ? (
          <> Válido até {dateLong(item.expires_at, true)}.</>
        ) : null}
        {status === "redeemed" && item.redeemed_at ? <> Em {dateLong(item.redeemed_at, true)}.</> : null}
      </p>
      {item.admin_note && ["approved", "available", "rejected"].includes(status) ? (
        <p className="ty-small" style={{ fontStyle: "italic" }}>
          Tayssa: “{item.admin_note}”
        </p>
      ) : null}
      {error ? (
        <div className="ty-form-error" role="alert">
          {error}
        </div>
      ) : null}
      {!locked ? (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 6 }}>
          {status === "available" ? (
            <TyButton size="sm" variant="accent" arrow onClick={request} disabled={pending}>
              {pending ? "Enviando…" : "Quero usar"}
            </TyButton>
          ) : null}
          {(status === "approved" || status === "requested") && whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="ty-btn ty-btn--sm ty-btn--solid">
              <span>Agendar pelo WhatsApp</span>
              <span className="ty-btn__arrow" aria-hidden />
            </a>
          ) : null}
        </div>
      ) : null}
    </motion.article>
  );
}
