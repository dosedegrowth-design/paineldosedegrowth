"use client";

import { useMemo, useState } from "react";
import type { ClientSummary } from "@/lib/tayssa/queries/admin";
import { ROUTES } from "@/lib/tayssa/config";
import { dateShort } from "@/lib/tayssa/format";
import { bateBusca } from "@/lib/tayssa/busca";
import { formatBrPhone } from "@/lib/tayssa/phone";
import { brl, ehRecorrente, frequenciaLegivel } from "@/lib/tayssa/financeiro";
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
  return (c.pedidoVip ? 1 : 0) + c.pendingServices + c.benefitsPendingValidation;
}

function pendencias(c: ClientSummary) {
  const partes: string[] = [];
  if (c.pedidoVip) partes.push("nova cliente");
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

type Filtro = "all" | "pending" | "agenda" | "vip" | "pronta" | "attention" | "inactive" | "recorrente";

/** a cliente da agenda não tem e-mail: a linha de baixo mostra o WhatsApp */
const contato = (c: ClientSummary) => c.user.email ?? (c.user.phone ? formatBrPhone(c.user.phone) : "");

export type EstatisticaDaCliente = { quantidade: number; totalGasto: number; frequenciaDias: number | null };

export function ClientsTable({ clients, estatisticas = {} }: { clients: ClientSummary[]; estatisticas?: Record<string, EstatisticaDaCliente> }) {
  const est = (c: ClientSummary) => estatisticas[c.user.id];
  // recorrente: 3 atendimentos realizados ou mais (17/11/2026)
  const recorrente = (c: ClientSummary) => ehRecorrente(est(c)?.quantidade ?? 0);
  const [q, setQ] = useState("");
  // pediram o VIP no cadastro do site e esperam a resposta (a conta já marca horário)
  const pendingCount = clients.filter((c) => c.pedidoVip).length;
  // cadastradas pela agenda e ainda fora do VIP: a Tayssa escolhe quem incluir (Lucas, 05/11/2026)
  const agendaCount = clients.filter((c) => c.user.signup_source === "agenda" && c.profile?.vip_status !== "active").length;
  const attentionCount = clients.filter((c) => espera(c) > 0).length;
  const prontaCount = clients.filter((c) => c.prontaParaVip).length;
  const [only, setOnly] = useState<Filtro>(pendingCount ? "pending" : "all");
  const list = useMemo(() => {
    return clients.filter((c) => {
      if (!bateBusca(q, [c.user.name, c.user.nickname, c.user.email, c.user.phone])) return false;
      if (only === "pending") return c.pedidoVip;
      if (only === "agenda") return c.user.signup_source === "agenda";
      if (only === "vip") return c.profile?.vip_status === "active";
      if (only === "pronta") return c.prontaParaVip;
      if (only === "attention") return espera(c) > 0;
      if (only === "inactive") return c.inactive;
      if (only === "recorrente") return ehRecorrente(estatisticas[c.user.id]?.quantidade ?? 0);
      return true;
    });
  }, [clients, q, only, estatisticas]);

  const filtros: [Filtro, string, number | null][] = [
    ["all", "Todas", null],
    ["pending", "Novas clientes", pendingCount || null],
    ["agenda", "Da agenda", agendaCount || null],
    ["vip", "VIP", null],
    ["pronta", "Prontas para VIP", prontaCount || null],
    ["attention", "Com pendência", attentionCount || null],
    ["recorrente", "Recorrentes", clients.filter((c) => recorrente(c)).length || null],
    ["inactive", "Sem voltar há tempo", null],
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
            <button
              key={k}
              type="button"
              className="tya-chip"
              data-on={only === k}
              aria-pressed={only === k}
              onClick={() => setOnly(k)}
            >
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
                ? "Nenhuma cliente nova esperando você."
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
                    <th>Atendimentos</th>
                    <th>Total gasto</th>
                    <th>Último atendimento</th>
                    <th>Pontos</th>
                    <th>Pendências</th>
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
                            {contato(c)}
                          </span>
                          {c.user.status !== "active" ? (
                            <span style={{ display: "inline-flex", marginTop: 5 }}>
                              <SeloConta status={c.user.status} />
                            </span>
                          ) : null}
                        </td>
                        <td>
                          <SeloVip status={c.profile?.vip_status ?? "none"} />
                          {c.prontaParaVip ? <span className="tya-pill tya-pill--gold" style={{ marginLeft: 6 }}>pronta p/ VIP</span> : null}
                        </td>
                        <td className="tya-num">
                          {est(c)?.quantidade ?? 0}
                          {recorrente(c) ? (
                            <span className="tya-pill tya-pill--ok" style={{ marginLeft: 6 }}>
                              recorrente
                            </span>
                          ) : null}
                        </td>
                        <td className="tya-num">{est(c)?.totalGasto ? brl(est(c)!.totalGasto) : "—"}</td>
                        <td className="tya-num">
                          {c.lastServiceDate ? dateShort(c.lastServiceDate) : "—"}
                          {est(c)?.quantidade ? (
                            <span className="tya-small" style={{ display: "block" }}>
                              {frequenciaLegivel(est(c)!.frequenciaDias, est(c)!.quantidade)}
                            </span>
                          ) : null}
                          {c.inactive ? (
                            <span style={{ display: "block", marginTop: 5 }}>
                              <SeloInativa c={c} />
                            </span>
                          ) : null}
                        </td>
                        <td className="tya-num">{c.points}</td>
                        <td>
                          {p.length ? (
                            <span className="tya-pill tya-pill--brand">{p.join(" · ")}</span>
                          ) : (
                            <span className="tya-small">—</span>
                          )}
                        </td>
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
                    <p className="tya-small" style={{ overflowWrap: "anywhere" }}>{contato(c)}</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "10px 0 14px" }}>
                      <SeloVip status={c.profile?.vip_status ?? "none"} />
                      {c.prontaParaVip ? <span className="tya-pill tya-pill--gold">pronta p/ VIP</span> : null}
                      <SeloConta status={c.user.status} />
                      {p.length ? <span className="tya-pill tya-pill--brand">{p.join(" · ")}</span> : null}
                      <SeloInativa c={c} />
                      {recorrente(c) ? <span className="tya-pill tya-pill--ok">recorrente</span> : null}
                    </div>
                    <div className="tya-mini">
                      <div>
                        <b>{est(c)?.quantidade ?? 0}</b>
                        <span>Atendimentos</span>
                      </div>
                      <div>
                        <b>{est(c)?.totalGasto ? brl(est(c)!.totalGasto).replace(",00", "") : "—"}</b>
                        <span>Total gasto</span>
                      </div>
                      <div>
                        <b>{c.lastServiceDate ? dateShort(c.lastServiceDate).slice(0, 5) : "—"}</b>
                        <span>Último</span>
                      </div>
                    </div>
                    {est(c)?.quantidade ? <p className="tya-small" style={{ marginTop: 8 }}>{frequenciaLegivel(est(c)!.frequenciaDias, est(c)!.quantidade)}</p> : null}
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
