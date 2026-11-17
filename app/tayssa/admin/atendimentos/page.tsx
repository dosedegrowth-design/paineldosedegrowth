import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { agoraNaCasa, getHistoricoDaCliente, listarAtendimentosRealizados, paraFin, type AtendimentoRealizado } from "@/lib/tayssa/queries/gestao";
import {
  FORMAS,
  LISTA_FORMAS,
  PCT_TAYSSA_PADRAO,
  SITUACAO_PAGAMENTO,
  brl,
  formaValida,
  frequenciaLegivel,
  resolverPeriodo,
  resumir,
  type SituacaoPagamento,
} from "@/lib/tayssa/financeiro";
import { bateBusca } from "@/lib/tayssa/busca";
import { PeriodoSeletor } from "@/components/tayssa/admin/periodo";
import { PagamentoAcoes, RemoverPagamento } from "@/components/tayssa/admin/pagamentos";
import { listServices } from "@/lib/tayssa/queries/admin";
import type { ServiceWithClient } from "@/lib/tayssa/queries/admin";
import { ROUTES } from "@/lib/tayssa/config";
import { currency, dateShort, dateTime, monthName, weekdayShort } from "@/lib/tayssa/format";
import { adminReviewServiceAction } from "@/lib/tayssa/actions/services";
import { SERVICE_STATUS_LABEL, type ServiceStatus } from "@/lib/tayssa/types";
import { AdminBlock, AdminHeader, Empty } from "@/components/tayssa/admin/shell";
import { ActionButton, NoteAction } from "@/components/tayssa/admin/controls";
import { Icone, type IconeNome } from "@/components/tayssa/admin/icons";
import { TransitionLink } from "@/components/tayssa/ui/transition";

/** Cada estado tem uma cor só dele — para ler no relance. */
const TOM: Record<ServiceStatus, "warn" | "ok" | "quiet"> = {
  pending: "warn",
  approved: "ok",
  rejected: "quiet",
};

function Selo({ status }: { status: ServiceStatus }) {
  return <span className={`tya-pill tya-pill--${TOM[status]}`}>{SERVICE_STATUS_LABEL[status]}</span>;
}

/** Vazio desenhado: ícone, uma frase curta e o porquê. */
function Vazio({ icone, titulo, children }: { icone: IconeNome; titulo: string; children?: ReactNode }) {
  return (
    <Empty>
      <span className="tya-nada">
        <Icone nome={icone} />
        <b>{titulo}</b>
        {children ? <span>{children}</span> : null}
      </span>
    </Empty>
  );
}

/** "12 / out" a partir de "2026-10-12", sem passar por fuso. */
function diaMes(iso: string): { dia: string; mes: string } {
  return { dia: iso.slice(8, 10), mes: monthName(Number(iso.slice(5, 7)) - 1).slice(0, 3) };
}

/** Registro aguardando: data à esquerda, quem e o quê no meio, ação à direita. */
function Registro({ s, children }: { s: ServiceWithClient; children?: ReactNode }) {
  const { dia, mes } = diaMes(s.service_date);
  return (
    <li className="tya-slot" data-tom={TOM[s.status]}>
      <div className="tya-slot__when">
        <span className="tya-slot__dow">{weekdayShort(s.service_date)}</span>
        <span className="tya-num tya-slot__h">{dia}</span>
        <span className="tya-slot__d">{mes}</span>
      </div>

      <div className="tya-slot__body">
        <div className="tya-slot__top">
          <TransitionLink href={ROUTES.adminClient(s.client_id)} className="tya-link tya-slot__name">
            {s.client?.name ?? "Cliente"}
          </TransitionLink>
          <Selo status={s.status} />
          {/* dourado diz "já está nas mãos dela": ponto de atendimento não
              confirmado ainda não entrou, e ficava dourado dentro do bloco
              "Aguardando você", ao lado de um selo de espera. */}
          <span className={`tya-pill tya-num ${s.status === "approved" ? "tya-pill--gold" : "tya-pill--quiet"}`}>
            {s.points} pts
          </span>
        </div>
        <p className="tya-slot__meta">
          {s.service_name} · {dateShort(s.service_date)}
          {s.amount != null ? ` · ${currency(s.amount)}` : ""}
        </p>
        {s.notes ? <p className="tya-quote">“{s.notes}”</p> : null}
        <p className="tya-slot__mine">
          <span className="tya-slot__tag">enviado</span>
          {dateTime(s.submitted_at)}
        </p>
      </div>

      {children ? <div className="tya-slot__acts">{children}</div> : null}
    </li>
  );
}

const TOM_PAGAMENTO: Record<SituacaoPagamento, "ok" | "warn" | "bad" | "quiet"> = {
  pago: "ok",
  parcial: "warn",
  pendente: "bad",
  sem_valor: "quiet",
};

const OPCOES = [
  { tipo: "hoje" as const, rotulo: "Hoje" },
  { tipo: "ontem" as const, rotulo: "Ontem" },
  { tipo: "semana" as const, rotulo: "Esta semana" },
  { tipo: "mes" as const, rotulo: "Este mês" },
  { tipo: "mes-passado" as const, rotulo: "Mês passado" },
];

/** Uma linha de atendimento realizado: quando, quem, o quê, quanto e como pagou. */
function Atendimento({ a, base, manter }: { a: AtendimentoRealizado; base: string; manter: Record<string, string> }) {
  const falta = a.valor != null ? Math.max(0, a.valor - a.recebido) : null;
  return (
    <li className="tyar" data-situacao={a.situacao}>
      <div className="tyar__quando">
        <span className="tya-slot__dow">{weekdayShort(a.data)}</span>
        <span className="tya-num tyar__dia">{a.data.slice(8, 10)}</span>
        <span className="tya-slot__d">{monthName(Number(a.data.slice(5, 7)) - 1).slice(0, 3)}</span>
        {a.hora ? <span className="tyar__hora">{a.hora}</span> : null}
      </div>
      <div className="tyar__corpo">
        <div className="tya-slot__top">
          <TransitionLink href={`${base}?${new URLSearchParams({ ...manter, ver: a.clienteId }).toString()}#historico`} className="tya-link tya-slot__name">
            {a.cliente}
          </TransitionLink>
          <span className={`tya-pill tya-pill--${TOM_PAGAMENTO[a.situacao]}`}>{SITUACAO_PAGAMENTO[a.situacao]}</span>
        </div>
        <p className="tya-slot__meta">{a.servico}</p>
        <p className="tyar__valores">
          <b>{a.valor != null ? brl(a.valor) : "sem valor"}</b>
          {a.formas ? <span>{a.formas}</span> : null}
          {a.situacao === "parcial" || a.situacao === "pendente" ? <span className="tyar__falta">falta {brl(falta ?? 0)}</span> : null}
        </p>
        {a.notas ? <p className="tya-quote">“{a.notas}”</p> : null}
        <PagamentoAcoes atendimentoId={a.id} valor={a.valor} recebido={a.recebido} situacao={a.situacao} formaPadrao={a.pagamentos[a.pagamentos.length - 1]?.forma ?? null} />
      </div>
    </li>
  );
}

export default async function ServicesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; data?: string; mes?: string; de?: string; ate?: string; cliente?: string; servico?: string; forma?: string; situacao?: string; ver?: string }>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const hoje = agoraNaCasa().iso;
  const periodo = resolverPeriodo(params, hoje, "mes");
  const base = ROUTES.adminServices;
  const [pending, doPeriodo] = await Promise.all([listServices("pending"), listarAtendimentosRealizados(periodo.de, periodo.ate, null)]);
  // filtros: cliente (nome ou telefone), serviço, forma de pagamento e situação
  const q = (params.cliente ?? "").trim();
  const servico = (params.servico ?? "").trim();
  const forma = formaValida(params.forma) ? params.forma : "";
  const situacao = (["pago", "parcial", "pendente", "sem_valor"] as const).find((x) => x === params.situacao) ?? "";
  const lista = doPeriodo.filter(
    (a) =>
      (!q || bateBusca(q, [a.cliente, a.apelido, a.telefone])) &&
      (!servico || a.servico.split(" + ").includes(servico)) &&
      (!forma || a.pagamentos.some((p) => p.forma === forma)) &&
      (!situacao || a.situacao === situacao),
  );
  const resumo = resumir(lista.map(paraFin), PCT_TAYSSA_PADRAO);
  const servicosDoPeriodo = [...new Set(doPeriodo.flatMap((a) => a.servico.split(" + ")))].sort((x, y) => x.localeCompare(y));
  const filtros: Record<string, string> = Object.fromEntries(
    Object.entries({ cliente: q, servico, forma, situacao }).filter(([, v]) => v),
  ) as Record<string, string>;
  const manterPeriodo: Record<string, string> = Object.fromEntries(
    Object.entries({ periodo: params.periodo, data: params.data, mes: params.mes, de: params.de, ate: params.ate }).filter(([, v]) => v),
  ) as Record<string, string>;
  const historico = params.ver && /^[0-9a-f-]{36}$/.test(params.ver) ? await getHistoricoDaCliente(params.ver) : null;
  const nomeDoHistorico = historico?.atendimentos[0]?.cliente ?? null;

  return (
    <>
      <AdminHeader
        eyebrow="Atendimentos realizados"
        title={
          <>
            {resumo.atendimentos} {resumo.atendimentos === 1 ? "atendimento" : "atendimentos"} · <em>{periodo.rotulo.charAt(0).toLowerCase() + periodo.rotulo.slice(1)}</em>
          </>
        }
        lead="Só entra atendimento realizado. Cancelamentos e faltas ficam de fora, e o que não foi pago aparece como pendente."
        actions={
          <>
            <TransitionLink href={ROUTES.adminFinanceiro} className="tya-btn tya-btn--ghost">
              <Icone nome="financeiro" />
              Financeiro
            </TransitionLink>
            <TransitionLink href={ROUTES.adminAgenda} className="tya-btn tya-btn--ghost">
              <Icone nome="agenda" />
              Agenda
            </TransitionLink>
          </>
        }
      />

      {pending.length ? (
        <AdminBlock title="Registrados pelas clientes, aguardando você" aside={<span className="tya-pill tya-pill--warn">{pending.length} aguardando</span>}>
          <ul className="tya-list">
            {pending.map((s) => (
              <Registro key={s.id} s={s}>
                <ActionButton action={adminReviewServiceAction} args={{ id: s.id, decision: "approve" as const }} variant="accent">
                  Confirmar
                </ActionButton>
                <NoteAction action={adminReviewServiceAction} args={{ id: s.id, decision: "reject" as const }} label="Motivo (ela vê)">
                  Não confirmar
                </NoteAction>
              </Registro>
            ))}
          </ul>
        </AdminBlock>
      ) : null}

      <section className="tya-sec tya-up">
        <div className="tya-card tyaf-filtros">
          <PeriodoSeletor base={base} periodo={periodo} hoje={hoje} opcoes={OPCOES} manter={filtros} />
          <form method="get" action={base} className="tyaf-filtros__form">
            {Object.entries(manterPeriodo).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
            <label>
              <span>Cliente</span>
              <input name="cliente" defaultValue={q} className="tya-field" placeholder="Nome ou WhatsApp" />
            </label>
            <label>
              <span>Serviço</span>
              <select name="servico" defaultValue={servico} className="tya-field">
                <option value="">Todos</option>
                {servicosDoPeriodo.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Forma de pagamento</span>
              <select name="forma" defaultValue={forma} className="tya-field">
                <option value="">Todas</option>
                {LISTA_FORMAS.map((f) => (
                  <option key={f} value={f}>
                    {FORMAS[f]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Pagamento</span>
              <select name="situacao" defaultValue={situacao} className="tya-field">
                <option value="">Todos</option>
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
                <option value="parcial">Parcial</option>
                <option value="sem_valor">Sem valor</option>
              </select>
            </label>
            <div className="tyaf-filtros__botoes">
              <button type="submit" className="tya-btn tya-btn--primary">
                Filtrar
              </button>
              {Object.keys(filtros).length ? (
                <TransitionLink href={`${base}?${new URLSearchParams(manterPeriodo).toString()}`} className="tya-link">
                  Limpar filtros
                </TransitionLink>
              ) : null}
            </div>
          </form>
        </div>
      </section>

      <div className="tya-kpis tya-kpis--2sm tyaf-kpis">
        <div className="tya-card tya-kpi">
          <span className="tya-eyebrow">Atendimentos</span>
          <p className="tya-kpi__n">{resumo.atendimentos}</p>
        </div>
        <div className="tya-card tya-kpi">
          <span className="tya-eyebrow">Clientes atendidas</span>
          <p className="tya-kpi__n">{resumo.clientes}</p>
        </div>
        <div className="tya-card tya-kpi">
          <span className="tya-eyebrow">Faturado</span>
          <p className="tya-kpi__n">{brl(resumo.bruto)}</p>
        </div>
        <div className="tya-card tya-kpi">
          <span className="tya-eyebrow">Recebido</span>
          <p className="tya-kpi__n">{brl(resumo.recebido)}</p>
        </div>
        <div className={`tya-card tya-kpi${resumo.pendente > 0 ? " tya-kpi--alert" : ""}`}>
          <span className="tya-eyebrow">Pendente</span>
          <p className="tya-kpi__n">{brl(resumo.pendente)}</p>
        </div>
      </div>

      {historico ? (
        <AdminBlock
          id="historico"
          title={<>Histórico de {nomeDoHistorico ?? "cliente"}</>}
          aside={
            <span style={{ display: "inline-flex", gap: 12 }}>
              <TransitionLink href={ROUTES.adminClient(params.ver!)} className="tya-link">
                Abrir a ficha
              </TransitionLink>
              <TransitionLink href={`${base}?${new URLSearchParams({ ...manterPeriodo, ...filtros }).toString()}`} className="tya-link">
                Fechar
              </TransitionLink>
            </span>
          }
        >
          <dl className="tyar-hist">
            <div>
              <dt>Atendimentos</dt>
              <dd>{historico.historico.quantidade}</dd>
            </div>
            <div>
              <dt>Primeira visita</dt>
              <dd>{historico.historico.primeira ? dateShort(historico.historico.primeira) : "—"}</dd>
            </div>
            <div>
              <dt>Última visita</dt>
              <dd>{historico.historico.ultima ? dateShort(historico.historico.ultima) : "—"}</dd>
            </div>
            <div>
              <dt>Frequência</dt>
              <dd>{frequenciaLegivel(historico.historico.frequenciaDias, historico.historico.quantidade) || "—"}</dd>
            </div>
            <div>
              <dt>Total gasto</dt>
              <dd>{brl(historico.historico.totalGasto)}</dd>
            </div>
            <div>
              <dt>Valores pagos</dt>
              <dd>{brl(historico.historico.totalPago)}</dd>
            </div>
            <div>
              <dt>Horários marcados à frente</dt>
              <dd>{historico.futuros.length}</dd>
            </div>
            <div>
              <dt>Cancelados · faltas</dt>
              <dd>
                {historico.cancelados} · {historico.faltas}
              </dd>
            </div>
          </dl>
          {historico.historico.servicos.length ? (
            <p className="tyar-hist__servicos">
              <span className="tya-eyebrow">Serviços realizados</span>
              {historico.historico.servicos.map((s) => (
                <span key={s.nome} className="tya-pill tya-pill--quiet">
                  {s.nome} · {s.vezes}x
                </span>
              ))}
            </p>
          ) : null}
          {historico.futuros.length ? (
            <p className="tya-small" style={{ marginTop: 8 }}>
              À frente: {historico.futuros.map((f) => `${dateShort(f.data)} às ${f.hora} (${f.servico})`).join(" · ")}
            </p>
          ) : null}
          <div className="tya-tablewrap tya-tablewrap--bare" style={{ marginTop: 12 }}>
            <table className="tya-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Serviço</th>
                  <th>Valor</th>
                  <th>Pagamentos</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {historico.atendimentos.map((a) => (
                  <tr key={a.id}>
                    <td data-rotulo="Data" className="tya-num" style={{ whiteSpace: "nowrap" }}>
                      {dateShort(a.data)}
                      {a.hora ? ` ${a.hora}` : ""}
                    </td>
                    <td data-rotulo="Serviço">{a.servico}</td>
                    <td data-rotulo="Valor" className="tya-num">
                      {a.valor != null ? brl(a.valor) : "—"}
                    </td>
                    <td data-rotulo="Pagamentos">
                      {a.pagamentos.length
                        ? a.pagamentos.map((p) => (
                            <span key={p.id} className="tyar-pag">
                              {brl(p.valor)} {FORMAS[p.forma]}
                              {p.origem === "sinal" ? " (sinal)" : ""} · {dateShort(p.recebidoEm)} <RemoverPagamento id={p.id} />
                            </span>
                          ))
                        : "—"}
                    </td>
                    <td data-rotulo="Situação">
                      <span className={`tya-pill tya-pill--${TOM_PAGAMENTO[a.situacao]}`}>{SITUACAO_PAGAMENTO[a.situacao]}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminBlock>
      ) : null}

      <AdminBlock
        title="Atendimentos do período"
        aside={lista.length !== doPeriodo.length ? <span className="tya-pill tya-pill--quiet">{lista.length} de {doPeriodo.length} com os filtros</span> : null}
      >
        {lista.length ? (
          <ul className="tya-list">
            {lista.map((a) => (
              <Atendimento key={a.id} a={a} base={base} manter={{ ...manterPeriodo, ...filtros }} />
            ))}
          </ul>
        ) : (
          <Vazio icone="atendimentos" titulo="Nenhum atendimento realizado aqui">
            {doPeriodo.length ? "Nada com esses filtros. Tente limpar os filtros." : "Quando você marcar um horário como Realizado na Agenda, ele aparece aqui com o valor e o pagamento."}
          </Vazio>
        )}
      </AdminBlock>
    </>
  );
}
