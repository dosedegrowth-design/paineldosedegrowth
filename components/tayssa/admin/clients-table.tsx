"use client";

import { useMemo, useState } from "react";
import type { ClientSummary } from "@/lib/tayssa/queries/admin";
import { ROUTES } from "@/lib/tayssa/config";
import { dateShort } from "@/lib/tayssa/format";
import { USER_STATUS_LABEL, VIP_STATUS_LABEL } from "@/lib/tayssa/types";
import type { UserStatus, VipStatus } from "@/lib/tayssa/types";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { Empty } from "@/components/tayssa/admin/shell";
import { Icone } from "@/components/tayssa/admin/icons";

/** O dourado é do VIP; o resto fica sóbrio. */
const VIP_TOM: Record<VipStatus, string> = {
  active: "tya-pill--gold",
  suspended: "tya-pill--warn",
  none: "tya-pill--quiet",
};
const CONTA_TOM: Record<UserStatus, string> = {
  pending: "tya-pill--warn",
  active: "tya-pill--ok",
  inactive: "tya-pill--quiet",
  suspended: "tya-pill--bad",
  rejected: "tya-pill--bad",
};

function SeloVip({ status }: { status: VipStatus }) {
  return <span className={`tya-pill ${VIP_TOM[status]}`}>{VIP_STATUS_LABEL[status]}</span>;
}

/** Só aparece quando a conta não está no estado normal. */
function SeloConta({ status }: { status: UserStatus }) {
  if (status === "active") return null;
  return <span className={`tya-pill ${CONTA_TOM[status]}`}>{USER_STATUS_LABEL[status]}</span>;
}

/**
 * O que espera decisão dela — a MESMA conta da ficha da cliente. Quando a
 * lista contava só atendimento e benefício, a ficha da Juliana dizia
 * "Pendências 1" e a linha dela na lista dizia "—": o panorama mentia.
 */
function espera(c: ClientSummary) {
  return (c.user.status === "pending" ? 1 : 0) + c.pendingServices + c.benefitsPendingValidation;
}

function pendencias(c: ClientSummary) {
  const partes: string[] = [];
  if (c.user.status === "pending") partes.push("pedido de acesso");
  if (c.pendingServices > 0) partes.push(`${c.pendingServices} atend.`);
  if (c.benefitsPendingValidation > 0) partes.push(`${c.benefitsPendingValidation} benef.`);
  return partes;
}

/** Diz por que ela caiu na lista de inativas: nunca veio ou parou de vir. */
function SeloInativa({ c }: { c: ClientSummary }) {
  if (!c.inactive) return null;
  const nunca = !c.lastServiceDate;
  return (
    <span className={`tya-pill ${nunca ? "tya-pill--quiet" : "tya-pill--warn"}`}>
      {nunca ? "sem atendimento" : "inativa"}
    </span>
  );
}

type Filtro = "all" | "pending" | "vip" | "attention" | "inactive";

export function ClientsTable({ clients }: { clients: ClientSummary[] }) {
  const [q, setQ] = useState("");
  const pendingCount = clients.filter((c) => c.user.status === "pending").length;
  const attentionCount = clients.filter((c) => espera(c) > 0).length;
  const [only, setOnly] = useState<Filtro>(pendingCount ? "pending" : "all");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return clients.filter((c) => {
      if (s && !`${c.user.name} ${c.user.nickname ?? ""} ${c.user.email} ${c.user.phone ?? ""}`.toLowerCase().includes(s)) return false;
      if (only === "pending") return c.user.status === "pending";
      if (only === "vip") return c.profile?.vip_status === "active";
      if (only === "attention") return espera(c) > 0;
      if (only === "inactive") return c.inactive;
      return true;
    });
  }, [clients, q, only]);

  const filtros: [Filtro, string, number | null][] = [
    ["all", "Todas", null],
    ["pending", "Pedidos de acesso", pendingCount || null],
    ["vip", "VIP", null],
    ["attention", "Com pendência", attentionCount || null],
    ["inactive", "Inativas", null],
  ];

  return (
    <div className="tya-up">
      <div className="tya-toolbar">
        <div className="tya-find">
          <Icone nome="busca" />
          <input
            className="tya-field"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone"
            aria-label="Buscar cliente"
          />
        </div>
        <div className="tya-chips">
          {filtros.map(([k, label, n]) => (
            <button key={k} type="button" className="tya-chip" data-on={only === k} onClick={() => setOnly(k)}>
              {label}
              {n ? <span className="tya-chip__n">{n}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {!list.length ? (
        <div className="tya-card">
          <Empty>
            {q.trim()
              ? `Nenhuma cliente encontrada para “${q.trim()}”.`
              : only === "pending"
                ? "Nenhum pedido de acesso esperando."
                : "Nenhuma cliente nesta lista."}
          </Empty>
        </div>
      ) : (
        <>
          {/* desktop: a tabela larga rola sozinha dentro do quadro */}
          <div className="tya-only-lg">
            <div className="tya-tablewrap">
              <table className="tya-table">
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
                  {list.map((c) => {
                    const p = pendencias(c);
                    return (
                      <tr key={c.user.id}>
                        <td>
                          <TransitionLink href={ROUTES.adminClient(c.user.id)} className="tya-link">
                            {c.user.name}
                          </TransitionLink>
                          <span className="tya-small" style={{ display: "block" }}>
                            {c.user.email}
                          </span>
                          {c.user.status !== "active" ? (
                            <span style={{ display: "inline-flex", marginTop: 5 }}>
                              <SeloConta status={c.user.status} />
                            </span>
                          ) : null}
                        </td>
                        <td>
                          <SeloVip status={c.profile?.vip_status ?? "none"} />
                        </td>
                        <td className="tya-num">{c.points}</td>
                        <td className="tya-num">
                          {c.lastServiceDate ? dateShort(c.lastServiceDate) : "—"}
                          {c.inactive ? (
                            <span style={{ display: "block", marginTop: 5 }}>
                              <SeloInativa c={c} />
                            </span>
                          ) : null}
                        </td>
                        <td>
                          {p.length ? (
                            <span className="tya-pill tya-pill--brand">{p.join(" · ")}</span>
                          ) : (
                            <span className="tya-small">—</span>
                          )}
                        </td>
                        <td className="tya-num">{c.benefitsAvailable || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* celular: cada cliente é um cartão */}
          <div className="tya-only-sm">
            {list.map((c) => {
              const p = pendencias(c);
              return (
                <TransitionLink key={c.user.id} href={ROUTES.adminClient(c.user.id)} style={{ display: "block" }}>
                  <article className="tya-card tya-card--hover">
                    <strong style={{ fontSize: 15, fontWeight: 600 }}>{c.user.name}</strong>
                    <p className="tya-small" style={{ overflowWrap: "anywhere" }}>{c.user.email}</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "10px 0 14px" }}>
                      <SeloVip status={c.profile?.vip_status ?? "none"} />
                      <SeloConta status={c.user.status} />
                      {p.length ? <span className="tya-pill tya-pill--brand">{p.join(" · ")}</span> : null}
                      <SeloInativa c={c} />
                    </div>
                    <div className="tya-mini">
                      <div>
                        <b>{c.points}</b>
                        <span>Pontos</span>
                      </div>
                      <div>
                        <b>{c.lastServiceDate ? dateShort(c.lastServiceDate).slice(0, 5) : "—"}</b>
                        <span>Último</span>
                      </div>
                      <div>
                        <b>{c.benefitsAvailable || "—"}</b>
                        <span>Benefícios</span>
                      </div>
                    </div>
                  </article>
                </TransitionLink>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
