import "server-only";
import { cache } from "react";
import { createHash } from "node:crypto";
import { vipDb } from "@/lib/tayssa/db";
import { getSettings } from "@/lib/tayssa/settings";
import { nowInBusinessTz } from "@/lib/tayssa/format";
import { diaAberto, horariosDaData, taxaDoHorario, toISODate } from "@/lib/tayssa/rules";
import { somaDoPedido } from "@/lib/tayssa/agendar";
import { horariosFechados } from "@/lib/tayssa/queries/vip";
import { estadoVisual, intervaloDaVista, type EstadoVisual } from "@/lib/tayssa/agenda-visual";
import {
  FORMAS,
  PCT_TAYSSA_PADRAO,
  formaValida,
  historicoDaCliente,
  linhaFin,
  nomeCurto,
  resumir,
  situacaoPagamento,
  type AtendimentoFin,
  type FormaPagamento,
  type HistoricoCliente,
  type Periodo,
  type ResumoFinanceiro,
  type SituacaoPagamento,
} from "@/lib/tayssa/financeiro";
import type { AppointmentStatus, ServicoDoPedido } from "@/lib/tayssa/types";
import type { BookingSettings } from "@/lib/tayssa/config";

/**
 * Gestão do painel (17/11/2026): a agenda por dia, semana e mês, os
 * atendimentos realizados com os pagamentos, o financeiro (faturado,
 * recebido, pendente e a divisão Tayssa/Larissa), o histórico de cada
 * cliente e o relatório que vai para a Larissa. Tudo do banco, nada inventado.
 */

export function agoraNaCasa(): { iso: string; min: number; hhmm: string } {
  const n = nowInBusinessTz();
  const min = n.getHours() * 60 + n.getMinutes();
  return { iso: toISODate(n), min, hhmm: `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}` };
}

export type ServicoDoCatalogo = {
  id: string;
  name: string;
  preco: number | null;
  preco_manutencao: number | null;
  duration_min: number | null;
  active: boolean;
  point_value: number;
};

export const getCatalogo = cache(async (): Promise<ServicoDoCatalogo[]> => {
  const { data, error } = await vipDb()
    .from("services")
    .select("id, name, preco, preco_manutencao, duration_min, active, point_value, sort_order")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return ((data ?? []) as (ServicoDoCatalogo & { preco: unknown; preco_manutencao: unknown })[]).map((s) => ({
    ...s,
    preco: s.preco == null ? null : Number(s.preco),
    preco_manutencao: s.preco_manutencao == null ? null : Number(s.preco_manutencao),
  }));
});

/**
 * O valor de um agendamento: o combinado (o painel pode mudar); senão a soma
 * dos serviços como estavam na hora de marcar; senão o catálogo (na
 * manutenção, o da manutenção do volume da nota). A taxa de horário especial
 * de dezembro entra junto.
 */
export function valorDoAgendamento(
  a: {
    valor?: number | string | null;
    servicos?: ServicoDoPedido[] | null;
    service_id: string | null;
    client_note: string | null;
    scheduled_date: string;
    scheduled_time: string;
  },
  catalogo: readonly ServicoDoCatalogo[],
  booking: BookingSettings,
): number | null {
  if (a.valor != null && a.valor !== "") return Number(a.valor);
  const taxa = taxaDoHorario(booking, a.scheduled_date, a.scheduled_time);
  let base: number | null = null;
  if (a.servicos?.length) base = somaDoPedido(a.servicos).valor;
  else {
    const volume = a.client_note?.match(/^Manutenção do (.+)\.$/)?.[1];
    const doVolume = volume ? catalogo.find((s) => s.name === volume)?.preco_manutencao : null;
    base = doVolume ?? catalogo.find((s) => s.id === a.service_id)?.preco ?? null;
  }
  return base == null ? null : base + taxa;
}

// ------------------------------------------------------------
// Agenda (dia, semana, mês)
// ------------------------------------------------------------

export type ConsultaAgenda = {
  id: string;
  clienteId: string | null;
  /** como ela é chamada (apelido) */
  nome: string;
  nomeCompleto: string;
  telefone: string | null;
  servico: string;
  servicoIds: string[];
  data: string;
  hora: string;
  duracao: number;
  status: AppointmentStatus;
  estado: EstadoVisual;
  valor: number | null;
  taxa: number;
  formaPrevista: FormaPagamento | null;
  comprovante: boolean;
  notaCliente: string | null;
  notaTayssa: string | null;
  origem: "site" | "painel";
  vip: boolean;
  /** o atendimento que nasceu do "Realizado" (com o pagamento) */
  atendimento: { id: string; valor: number | null; recebido: number; situacao: SituacaoPagamento } | null;
};

export type DiaDaAgendaPainel = {
  iso: string;
  aberto: boolean;
  /** os horários de início da grade (Configurações › Agenda e dezembro) */
  horarios: string[];
  /** os que a Tayssa fechou */
  fechados: string[];
};

export type AgendaVisao = {
  vista: "dia" | "semana" | "mes";
  data: string;
  de: string;
  ate: string;
  hoje: string;
  agoraMin: number;
  duracaoPadrao: number;
  dias: DiaDaAgendaPainel[];
  consultas: ConsultaAgenda[];
};

type LinhaAgendamento = {
  id: string;
  client_id: string;
  service_id: string | null;
  service_name: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_min: number | null;
  status: AppointmentStatus;
  client_note: string | null;
  admin_note: string | null;
  client_service_id: string | null;
  comprovante_em: string | null;
  servicos: ServicoDoPedido[] | null;
  valor: number | string | null;
  forma_pagamento: string | null;
  origem: "site" | "painel" | null;
  client: { id: string; name: string; nickname: string | null; phone: string | null; client_profiles: { vip_status: string } | { vip_status: string }[] | null } | null;
};

const SELECT_AGENDAMENTO =
  "id, client_id, service_id, service_name, scheduled_date, scheduled_time, duration_min, status, client_note, admin_note, client_service_id, comprovante_em, servicos, valor, forma_pagamento, origem, client:users!appointments_client_id_fkey(id, name, nickname, phone, client_profiles(vip_status))";

export const getAgendaVisao = cache(async (vista: "dia" | "semana" | "mes", data: string): Promise<AgendaVisao> => {
  const settings = await getSettings();
  const b = settings.booking;
  const agora = agoraNaCasa();
  const { de, ate } = intervaloDaVista(vista, data);
  const db = vipDb();
  const [res, fechados, catalogo] = await Promise.all([
    db.from("appointments").select(SELECT_AGENDAMENTO).gte("scheduled_date", de).lte("scheduled_date", ate).order("scheduled_time"),
    horariosFechados(de, ate),
    getCatalogo(),
  ]);
  if (res.error) throw new Error(res.error.message);
  const linhas = (res.data ?? []) as unknown as LinhaAgendamento[];

  // os atendimentos (e os pagamentos) dos horários já fechados como "Realizado"
  const visitas = linhas.map((l) => l.client_service_id).filter((v): v is string => Boolean(v));
  const fin = await financeiroDosAtendimentos(visitas);

  const consultas: ConsultaAgenda[] = linhas.map((a) => {
    const perfil = Array.isArray(a.client?.client_profiles) ? a.client?.client_profiles[0] : a.client?.client_profiles;
    const duracao = a.duration_min && a.duration_min > 0 ? a.duration_min : b.default_duration_min;
    const hora = a.scheduled_time.slice(0, 5);
    const visita = a.client_service_id ? fin.get(a.client_service_id) ?? null : null;
    return {
      id: a.id,
      clienteId: a.client?.id ?? null,
      nome: a.client?.nickname?.trim() || a.client?.name || "Cliente",
      nomeCompleto: a.client?.name ?? "Cliente",
      telefone: a.client?.phone ?? null,
      servico: a.service_name,
      servicoIds: a.servicos?.length ? a.servicos.map((s) => s.id) : a.service_id ? [a.service_id] : [],
      data: a.scheduled_date,
      hora,
      duracao,
      status: a.status,
      estado: estadoVisual({ status: a.status, data: a.scheduled_date, hora, duracao }, agora),
      valor: valorDoAgendamento(a, catalogo, b),
      taxa: taxaDoHorario(b, a.scheduled_date, a.scheduled_time),
      formaPrevista: formaValida(a.forma_pagamento) ? a.forma_pagamento : null,
      comprovante: Boolean(a.comprovante_em),
      notaCliente: a.client_note,
      notaTayssa: a.admin_note,
      origem: a.origem === "painel" ? "painel" : "site",
      vip: perfil?.vip_status === "active",
      atendimento: visita
        ? { id: a.client_service_id!, valor: visita.valor, recebido: visita.recebido, situacao: situacaoPagamento(visita.valor, visita.recebido) }
        : null,
    };
  });

  const dias: DiaDaAgendaPainel[] = [];
  for (let iso = de; iso <= ate; iso = proximoDia(iso)) {
    const aberto = diaAberto(b, iso);
    const horarios = aberto ? horariosDaData(b, iso) : [];
    dias.push({ iso, aberto, horarios, fechados: horarios.filter((h) => fechados.has(`${iso}T${h}`)) });
  }
  return { vista, data, de, ate, hoje: agora.iso, agoraMin: agora.min, duracaoPadrao: b.default_duration_min, dias, consultas };
});

function proximoDia(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + 1)).toISOString().slice(0, 10);
}

/** Valor e recebido de cada atendimento (para a agenda mostrar se o "Realizado" já foi pago). */
async function financeiroDosAtendimentos(ids: string[]): Promise<Map<string, { valor: number | null; recebido: number }>> {
  const mapa = new Map<string, { valor: number | null; recebido: number }>();
  if (!ids.length) return mapa;
  const db = vipDb();
  const [vRes, pRes] = await Promise.all([
    db.from("client_services").select("id, amount").in("id", ids),
    db.from("pagamentos").select("client_service_id, valor").in("client_service_id", ids),
  ]);
  if (vRes.error) throw new Error(vRes.error.message);
  if (pRes.error) throw new Error(pRes.error.message);
  for (const v of (vRes.data ?? []) as { id: string; amount: number | string | null }[]) {
    mapa.set(v.id, { valor: v.amount == null ? null : Number(v.amount), recebido: 0 });
  }
  for (const p of (pRes.data ?? []) as { client_service_id: string; valor: number | string }[]) {
    const m = mapa.get(p.client_service_id);
    if (m) m.recebido = Math.round((m.recebido + Number(p.valor)) * 100) / 100;
  }
  return mapa;
}

/** As clientes para o "Novo agendamento": nome, apelido e WhatsApp (a busca acha por qualquer um). */
export const listarClientesDaAgenda = cache(async (): Promise<{ id: string; nome: string; apelido: string | null; telefone: string | null }[]> => {
  const { data, error } = await vipDb()
    .from("users")
    .select("id, name, nickname, phone, status")
    .eq("role", "client")
    .neq("status", "rejected")
    .order("name");
  if (error) throw new Error(error.message);
  return ((data ?? []) as { id: string; name: string; nickname: string | null; phone: string | null }[]).map((u) => ({
    id: u.id,
    nome: u.name,
    apelido: u.nickname,
    telefone: u.phone,
  }));
});

// ------------------------------------------------------------
// Atendimentos realizados (com os pagamentos)
// ------------------------------------------------------------

export type PagamentoDoAtendimento = { id: string; valor: number; forma: FormaPagamento; origem: "sinal" | "atendimento" | "manual"; recebidoEm: string };

export type AtendimentoRealizado = {
  id: string;
  clienteId: string;
  cliente: string;
  apelido: string | null;
  telefone: string | null;
  data: string;
  hora: string | null;
  servico: string;
  valor: number | null;
  pctTayssa: number | null;
  pagamentos: PagamentoDoAtendimento[];
  recebido: number;
  situacao: SituacaoPagamento;
  /** "Pix + Dinheiro" */
  formas: string;
  notas: string | null;
  agendamentoId: string | null;
};

/**
 * Os atendimentos realizados (confirmados) do período, do mais novo ao mais
 * antigo. Cancelamento e falta não são atendimento: não entram aqui.
 */
export const listarAtendimentosRealizados = cache(
  async (de: string | null, ate: string | null, clienteId: string | null): Promise<AtendimentoRealizado[]> => {
    const db = vipDb();
    let q = db
      .from("client_services")
      .select("id, client_id, service_name, service_date, amount, pct_tayssa, notes, created_at, client:users!client_services_client_id_fkey(id, name, nickname, phone)")
      .eq("status", "approved")
      .order("service_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(2000);
    if (de) q = q.gte("service_date", de);
    if (ate) q = q.lte("service_date", ate);
    if (clienteId) q = q.eq("client_id", clienteId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    type Linha = {
      id: string;
      client_id: string;
      service_name: string;
      service_date: string;
      amount: number | string | null;
      pct_tayssa: number | string | null;
      notes: string | null;
      client: { id: string; name: string; nickname: string | null; phone: string | null } | null;
    };
    const linhas = (data ?? []) as unknown as Linha[];
    const ids = linhas.map((l) => l.id);
    const pagamentos = new Map<string, PagamentoDoAtendimento[]>();
    const horas = new Map<string, { hora: string; agendamentoId: string }>();
    // em lotes: o endereço da consulta tem limite de tamanho
    for (let i = 0; i < ids.length; i += 150) {
      const lote = ids.slice(i, i + 150);
      const [pRes, aRes] = await Promise.all([
        db.from("pagamentos").select("id, client_service_id, valor, forma, origem, recebido_em").in("client_service_id", lote).order("recebido_em"),
        db.from("appointments").select("id, client_service_id, scheduled_time").in("client_service_id", lote),
      ]);
      if (pRes.error) throw new Error(pRes.error.message);
      if (aRes.error) throw new Error(aRes.error.message);
      for (const p of (pRes.data ?? []) as { id: string; client_service_id: string; valor: number | string; forma: FormaPagamento; origem: PagamentoDoAtendimento["origem"]; recebido_em: string }[]) {
        const l = pagamentos.get(p.client_service_id) ?? [];
        l.push({ id: p.id, valor: Number(p.valor), forma: p.forma, origem: p.origem, recebidoEm: p.recebido_em });
        pagamentos.set(p.client_service_id, l);
      }
      for (const a of (aRes.data ?? []) as { id: string; client_service_id: string; scheduled_time: string }[]) {
        horas.set(a.client_service_id, { hora: a.scheduled_time.slice(0, 5), agendamentoId: a.id });
      }
    }
    return linhas.map((l) => {
      const pags = pagamentos.get(l.id) ?? [];
      const valor = l.amount == null ? null : Number(l.amount);
      const recebido = Math.round(pags.reduce((s, p) => s + p.valor * 100, 0)) / 100;
      return {
        id: l.id,
        clienteId: l.client_id,
        cliente: l.client?.name ?? "Cliente",
        apelido: l.client?.nickname ?? null,
        telefone: l.client?.phone ?? null,
        data: l.service_date,
        hora: horas.get(l.id)?.hora ?? null,
        servico: l.service_name,
        valor,
        pctTayssa: l.pct_tayssa == null ? null : Number(l.pct_tayssa),
        pagamentos: pags,
        recebido,
        situacao: situacaoPagamento(valor, recebido),
        formas: [...new Set(pags.map((p) => FORMAS[p.forma]))].join(" + "),
        notas: l.notes,
        agendamentoId: horas.get(l.id)?.agendamentoId ?? null,
      };
    });
  },
);

export function paraFin(a: AtendimentoRealizado): AtendimentoFin {
  return {
    id: a.id,
    clienteId: a.clienteId,
    data: a.data,
    servico: a.servico,
    valor: a.valor,
    pctTayssa: a.pctTayssa,
    pagamentos: a.pagamentos.map((p) => ({ valor: p.valor, forma: p.forma })),
  };
}

/** O financeiro do período: os atendimentos realizados e o resumo (atendimento antigo sem % guardado vale 70). */
export const getFinanceiroDoPeriodo = cache(async (de: string, ate: string): Promise<{ lista: AtendimentoRealizado[]; resumo: ResumoFinanceiro }> => {
  const lista = await listarAtendimentosRealizados(de, ate, null);
  return { lista, resumo: resumir(lista.map(paraFin), PCT_TAYSSA_PADRAO) };
});

// ------------------------------------------------------------
// Histórico de uma cliente e as estatísticas da lista de clientes
// ------------------------------------------------------------

export type HistoricoDaClienteCompleto = {
  historico: HistoricoCliente;
  atendimentos: AtendimentoRealizado[];
  futuros: { id: string; data: string; hora: string; servico: string; status: AppointmentStatus }[];
  cancelados: number;
  faltas: number;
};

export const getHistoricoDaCliente = cache(async (clienteId: string): Promise<HistoricoDaClienteCompleto> => {
  const hoje = agoraNaCasa().iso;
  const [atendimentos, agRes] = await Promise.all([
    listarAtendimentosRealizados(null, null, clienteId),
    vipDb().from("appointments").select("id, scheduled_date, scheduled_time, service_name, status").eq("client_id", clienteId).order("scheduled_date"),
  ]);
  if (agRes.error) throw new Error(agRes.error.message);
  const ag = (agRes.data ?? []) as { id: string; scheduled_date: string; scheduled_time: string; service_name: string; status: AppointmentStatus }[];
  return {
    historico: historicoDaCliente(atendimentos.map(paraFin)),
    atendimentos,
    futuros: ag
      .filter((a) => (a.status === "requested" || a.status === "confirmed") && a.scheduled_date >= hoje)
      .map((a) => ({ id: a.id, data: a.scheduled_date, hora: a.scheduled_time.slice(0, 5), servico: a.service_name, status: a.status })),
    cancelados: ag.filter((a) => a.status === "cancelled").length,
    faltas: ag.filter((a) => a.status === "no_show").length,
  };
});

/** Por cliente: quantos atendimentos, primeira e última visita, total gasto e pago, frequência (a lista de Clientes). */
export const getEstatisticasDasClientes = cache(async (): Promise<Map<string, HistoricoCliente>> => {
  const lista = await listarAtendimentosRealizados(null, null, null);
  const por = new Map<string, AtendimentoFin[]>();
  for (const a of lista) {
    const l = por.get(a.clienteId) ?? [];
    l.push(paraFin(a));
    por.set(a.clienteId, l);
  }
  return new Map([...por.entries()].map(([id, l]) => [id, historicoDaCliente(l)]));
});

// ------------------------------------------------------------
// A divisão: o histórico das mudanças
// ------------------------------------------------------------

export type MudancaDeDivisao = { id: string; pctTayssa: number; pctLarissa: number; vigenteDesde: string; por: string | null };

export const getHistoricoDaDivisao = cache(async (): Promise<MudancaDeDivisao[]> => {
  const { data, error } = await vipDb()
    .from("divisao_historico")
    .select("id, pct_tayssa, pct_larissa, vigente_desde, autor:users!divisao_historico_created_by_fkey(name)")
    .order("vigente_desde", { ascending: false })
    .limit(30);
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as { id: string; pct_tayssa: number | string; pct_larissa: number | string; vigente_desde: string; autor: { name: string } | null }[]).map((r) => ({
    id: r.id,
    pctTayssa: Number(r.pct_tayssa),
    pctLarissa: Number(r.pct_larissa),
    vigenteDesde: r.vigente_desde,
    por: r.autor?.name ?? null,
  }));
});

// ------------------------------------------------------------
// O relatório (painel, PDF e a página da Larissa)
// ------------------------------------------------------------

export type LinhaDoRelatorio = {
  data: string;
  hora: string | null;
  /** nome curto ("Mariana L."): o que sai do painel não leva o nome inteiro nem o telefone */
  cliente: string;
  servico: string;
  valor: number | null;
  /** como a cliente pagou no salão (Pix, cartão…), quando foi informado */
  formas: string;
  tayssa: number;
  larissa: number;
  /** só nos links gerados antes do modelo do repasse (versão 1) */
  recebido?: number;
  situacao?: SituacaoPagamento;
};

/**
 * A foto do fechamento que vai no link da Larissa e no PDF. Versão 2
 * (17/11/2026): só os atendimentos e a divisão; o resumo e os repasses saem
 * de `resumoDoRelatorio()` na hora de mostrar (o link antigo, versão 1, tem
 * as mesmas linhas e aparece igual).
 */
export type RelatorioDados = {
  versao: 1 | 2;
  periodo: { de: string; ate: string; rotulo: string };
  geradoEm: string;
  negocio: string;
  larissa: string;
  linhas: LinhaDoRelatorio[];
};

/** Os atendimentos do período como linhas do relatório, em ordem de dia e hora. */
export function linhasDoRelatorio(lista: AtendimentoRealizado[]): LinhaDoRelatorio[] {
  return [...lista]
    .sort((a, b) => (a.data + (a.hora ?? "")).localeCompare(b.data + (b.hora ?? "")))
    .map((a) => {
      const div = linhaFin(a);
      return {
        data: a.data,
        hora: a.hora,
        cliente: nomeCurto(a.cliente),
        servico: a.servico,
        valor: a.valor,
        formas: a.formas,
        tayssa: div.tayssa,
        larissa: div.larissa,
      };
    });
}

export async function montarRelatorio(p: Periodo): Promise<RelatorioDados> {
  const [{ lista }, settings] = await Promise.all([getFinanceiroDoPeriodo(p.de, p.ate), getSettings()]);
  return {
    versao: 2,
    periodo: { de: p.de, ate: p.ate, rotulo: p.rotulo },
    geradoEm: new Date().toISOString(),
    negocio: settings.business.name,
    larissa: settings.financeiro.larissa_nome || "Larissa",
    linhas: linhasDoRelatorio(lista),
  };
}

export type LinkDoRelatorio = { id: string; rotulo: string; de: string; ate: string; criadoEm: string; revogadoEm: string | null; acessos: number; ultimoAcesso: string | null };

export const listarLinksDoRelatorio = cache(async (): Promise<LinkDoRelatorio[]> => {
  const { data, error } = await vipDb()
    .from("relatorios_links")
    .select("id, rotulo, de, ate, created_at, revogado_em, acessos, ultimo_acesso")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error(error.message);
  return ((data ?? []) as { id: string; rotulo: string; de: string; ate: string; created_at: string; revogado_em: string | null; acessos: number; ultimo_acesso: string | null }[]).map((r) => ({
    id: r.id,
    rotulo: r.rotulo,
    de: r.de,
    ate: r.ate,
    criadoEm: r.created_at,
    revogadoEm: r.revogado_em,
    acessos: r.acessos,
    ultimoAcesso: r.ultimo_acesso,
  }));
});

export function hashDoToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** O relatório de um link: null se o token não existe ou foi revogado (a página diz qual). */
export async function relatorioDoToken(token: string): Promise<{ estado: "ok"; dados: RelatorioDados } | { estado: "revogado" } | { estado: "nao_existe" }> {
  if (!/^[A-Za-z0-9_-]{20,80}$/.test(token)) return { estado: "nao_existe" };
  const db = vipDb();
  const { data, error } = await db.from("relatorios_links").select("id, dados, revogado_em, acessos").eq("token_hash", hashDoToken(token)).maybeSingle();
  if (error) throw new Error(error.message);
  const row = data as { id: string; dados: RelatorioDados; revogado_em: string | null; acessos: number } | null;
  if (!row) return { estado: "nao_existe" };
  if (row.revogado_em) return { estado: "revogado" };
  await db.from("relatorios_links").update({ acessos: (row.acessos ?? 0) + 1, ultimo_acesso: new Date().toISOString() }).eq("id", row.id);
  return { estado: "ok", dados: row.dados };
}
