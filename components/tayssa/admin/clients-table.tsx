"use client";

import { useMemo, useState } from "react";
import type { ClientSummary } from "@/lib/tayssa/queries/admin";
import { ROUTES } from "@/lib/tayssa/config";
import { dateShort } from "@/lib/tayssa/format";
import { VIP_STATUS_LABEL } from "@/lib/tayssa/types";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { StatusText } from "@/components/tayssa/ui/status";

export function ClientsTable({ clients }: { clients: ClientSummary[] }) {
  const [q, setQ] = useState("");
  const [only, setOnly] = useState<"all" | "vip" | "attention" | "inactive">("all");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return clients.filter((c) => {
      if (s && !`${c.user.name} ${c.user.nickname ?? ""} ${c.user.email} ${c.user.phone ?? ""}`.toLowerCase().includes(s)) return false;
      if (only === "vip") return c.profile?.vip_status === "active";
      if (only === "attention") return c.pendingServices > 0 || c.benefitsPendingValidation > 0;
      if (only === "inactive") return c.inactive;
      return true;
    });
  }, [clients, q, only]);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "end" }}>
        <label className="ty-field" style={{ minWidth: 240, flex: "1 1 240px" }}>
          <span className="ty-field__label">Buscar</span>
          <input className="ty-field__input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="nome, e-mail, telefone" style={{ fontSize: 15 }} />
        </label>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {(
            [
              ["all", "Todas"],
              ["vip", "VIP"],
              ["attention", "Com pendência"],
              ["inactive", "Inativas"],
            ] as const
          ).map(([k, label]) => (
            <button key={k} className={`ty-link ty-link--caps ${only === k ? "ty-link--on" : ""}`} style={{ opacity: only === k ? 1 : 0.6 }} onClick={() => setOnly(k)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="ty-table-wrap">
        <table className="ty-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>VIP</th>
              <th>Pontos</th>
              <th>Último atendimento</th>
              <th>Pendências</th>
              <th>Benefícios</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.user.id}>
                <td>
                  <TransitionLink href={ROUTES.adminClient(c.user.id)} className="ty-link" style={{ fontSize: 15 }}>
                    {c.user.name}
                  </TransitionLink>
                  <span className="ty-small" style={{ display: "block" }}>
                    {c.user.email}
                    {c.user.status !== "active" ? ` · conta ${c.user.status === "inactive" ? "desativada" : "suspensa"}` : ""}
                  </span>
                </td>
                <td>
                  <StatusText tone={c.profile?.vip_status === "active" ? "ok" : c.profile?.vip_status === "suspended" ? "wait" : "off"}>
                    {VIP_STATUS_LABEL[c.profile?.vip_status ?? "none"]}
                  </StatusText>
                </td>
                <td className="ty-num">{c.points}</td>
                <td className="ty-num">
                  {c.lastServiceDate ? dateShort(c.lastServiceDate) : "—"}
                  {c.inactive && c.lastServiceDate ? <span className="ty-small" style={{ display: "block", color: "var(--t-accent)" }}>inativa</span> : null}
                </td>
                <td className="ty-num">
                  {c.pendingServices > 0 ? `${c.pendingServices} atend.` : ""}
                  {c.pendingServices > 0 && c.benefitsPendingValidation > 0 ? " · " : ""}
                  {c.benefitsPendingValidation > 0 ? `${c.benefitsPendingValidation} benef.` : ""}
                  {!c.pendingServices && !c.benefitsPendingValidation ? "—" : ""}
                </td>
                <td className="ty-num">{c.benefitsAvailable || "—"}</td>
              </tr>
            ))}
            {!list.length ? (
              <tr>
                <td colSpan={6} className="ty-small">
                  Nenhuma cliente encontrada.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
