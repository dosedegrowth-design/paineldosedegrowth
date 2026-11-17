"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { vipDb } from "@/lib/tayssa/db";
import { assertAdmin } from "@/lib/tayssa/auth/guards";
import { logAudit } from "@/lib/tayssa/audit";
import { ROUTES, publicUrl } from "@/lib/tayssa/config";
import { getSettings } from "@/lib/tayssa/settings";
import { referralCode } from "@/lib/tayssa/codes";
import { normalizeBrPhone } from "@/lib/tayssa/phone";
import { hashToken, newToken } from "@/lib/tayssa/auth/session";
import { duracaoField, isoDateField } from "@/lib/tayssa/validation";
import { BusinessError, runAction } from "@/lib/tayssa/actions/_helpers";
import { juntarServicos } from "@/lib/tayssa/agendar";
import { minutos, seCruzam } from "@/lib/tayssa/agenda-visual";
import { brl, centavos, divisaoValida, formaValida, lerNumero, resolverPeriodo } from "@/lib/tayssa/financeiro";
import { registrarPagamentos } from "@/lib/tayssa/pagamentos";
import { agoraNaCasa, getCatalogo, montarRelatorio } from "@/lib/tayssa/queries/gestao";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import type { ActionResult, ServicoDoPedido } from "@/lib/tayssa/types";

/**
 * Gestão do painel (17/11/2026): marcar e mudar horário pela agenda, os
 * pagamentos de cada atendimento, a divisão Tayssa/Larissa e o link do
 * relatório para a Larissa. Só a Tayssa logada.
 */

function revalidar() {
  revalidatePath(ROUTES.admin, "layout");
  revalidatePath(ROUTES.vip, "layout");
}

const horaField = z.string().trim().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Escolha o horário");
const idsServicos = z.array(z.string().uuid()).min(1, "Escolha o serviço").max(5, "No máximo 5 serviços num horário");

/** O pedido monta com o catálogo: nomes, minutos e valores como estão hoje. */
async function servicosEscolhidos(ids: string[]): Promise<ServicoDoPedido[]> {
  const catalogo = await getCatalogo();
  const unicos = [...new Set(ids)];
  return unicos.map((id) => {
    const s = catalogo.find((c) => c.id === id);
    if (!s) throw new BusinessError("Um dos serviços não está mais no catálogo.");
    return { id: s.id, nome: s.name, duracao: s.duration_min ?? 0, preco: s.preco };
  });
}

/** Outro horário em cima deste? (pedido, confirmado ou realizado; cancelado e falta liberam) */
async function quemOcupa(data: string, hora: string, duracao: number, ignorar: string | null, padrao: number): Promise<string | null> {
  const { data: rows, error } = await vipDb()
    .from("appointments")
    .select("id, scheduled_time, duration_min, client:users!appointments_client_id_fkey(name, nickname)")
    .eq("scheduled_date", data)
    .in("status", ["requested", "confirmed", "done"]);
  if (error) throw new Error(error.message);
  for (const r of (rows ?? []) as unknown as { id: string; scheduled_time: string; duration_min: number | null; client: { name: string; nickname: string | null } | null }[]) {
    if (r.id === ignorar) continue;
    if (seCruzam({ ini: minutos(hora), dur: duracao }, { ini: minutos(r.scheduled_time), dur: r.duration_min || padrao })) {
      return `${r.client?.nickname?.trim() || r.client?.name || "Outra cliente"} às ${r.scheduled_time.slice(0, 5)}`;
    }
  }
  return null;
}

function lerValor(texto: string | undefined, campo = "valor"): number | null {
  if (!texto?.trim()) return null;
  const v = lerNumero(texto);
  if (v == null || v < 0 || v > 100000) throw new BusinessError("Valor inválido. Use só números, ex.: 170 ou 170,50.", campo);
  return Math.round(v * 100) / 100;
}

function lerDuracao(texto: string | undefined, padrao: number): number {
  const r = duracaoField.safeParse(texto ?? "");
  if (!r.success) throw new BusinessError("Tempo inválido. Escreva, por exemplo, 3h, 1h30 ou 40 min.", "duracao");
  const d = r.data ?? padrao;
  if (d < 15 || d > 480) throw new BusinessError("O horário precisa ter de 15 minutos a 8 horas.", "duracao");
  return d;
}

// ------------------------------------------------------------
// Agenda: marcar, mudar e reagendar pelo painel
// ------------------------------------------------------------

export async function adminCriarAgendamentoAction(input: {
  clienteId?: string;
  nome?: string;
  telefone?: string;
  servicoIds: string[];
  data: string;
  hora: string;
  duracao?: string;
  valor?: string;
  forma?: string;
  observacoes?: string;
}): Promise<ActionResult<{ id: string; clienteId: string; clienteNova: boolean }>> {
  return runAction("gestao.criarAgendamento", async () => {
    const admin = await assertAdmin();
    const data = isoDateField.parse(input.data);
    const hora = horaField.parse(input.hora);
    const ids = idsServicos.parse(input.servicoIds ?? []);
    const settings = await getSettings();
    const lista = await servicosEscolhidos(ids);
    const somaMin = lista.reduce((s, x) => s + (x.duracao || 0), 0);
    const duracao = lerDuracao(input.duracao, somaMin || settings.booking.default_duration_min);
    const valor = lerValor(input.valor);
    const forma = input.forma?.trim() ? input.forma.trim() : null;
    if (forma && !formaValida(forma)) throw new BusinessError("Forma de pagamento inválida.", "forma");
    const observacoes = (input.observacoes ?? "").trim().slice(0, 500) || null;
    const db = vipDb();

    // o horário primeiro: com conflito, nada é criado (nem a cliente nova)
    const ocupado = await quemOcupa(data, hora, duracao, null, settings.booking.default_duration_min);
    if (ocupado) throw new BusinessError(`Nesse horário já tem ${ocupado}. Escolha outro horário ou mude a duração.`, "hora");

    // a cliente: a escolhida, ou a que já tem esse WhatsApp (nada de cadastro duplicado), ou uma nova
    let clienteId = input.clienteId?.trim() || null;
    let clienteNova = false;
    if (clienteId) {
      const { data: u } = await db.from("users").select("id").eq("id", clienteId).eq("role", "client").maybeSingle();
      if (!u) throw new BusinessError("Cliente não encontrada.", "cliente");
    } else {
      const nome = (input.nome ?? "").trim().replace(/\s+/g, " ");
      if (nome.length < 2) throw new BusinessError("Escreva o nome da cliente.", "nome");
      const telefone = normalizeBrPhone(input.telefone ?? "");
      if (!telefone) throw new BusinessError("WhatsApp inválido. Use DDD + número.", "telefone");
      const { data: existente } = await db.from("users").select("id").eq("role", "client").eq("phone", telefone).maybeSingle();
      if (existente) clienteId = (existente as { id: string }).id;
      else {
        const { data: criada, error } = await db
          .from("users")
          .insert({ role: "client", name: nome.slice(0, 120), phone: telefone, status: "active", signup_source: "admin", created_by: admin.id })
          .select("id")
          .single();
        if (error) {
          if (error.code === "23505") throw new BusinessError("Esse WhatsApp já tem conta. Procure pelo nome dela.", "telefone");
          throw new Error(error.message);
        }
        clienteId = (criada as { id: string }).id;
        clienteNova = true;
        const { error: pErr } = await db.from("client_profiles").insert({ user_id: clienteId, vip_status: "none", referral_code: referralCode() });
        if (pErr) throw new Error(pErr.message);
        await logAudit({ actorId: admin.id, actorRole: "admin", action: "client_created", entityType: "user", entityId: clienteId, meta: { pela: "agenda" } });
      }
    }

    const agora = new Date().toISOString();
    const { data: criado, error } = await db
      .from("appointments")
      .insert({
        client_id: clienteId,
        service_id: lista[0].id,
        service_name: juntarServicos(lista.map((s) => s.nome)),
        servicos: lista,
        scheduled_date: data,
        scheduled_time: hora,
        duration_min: duracao,
        // marcado pela Tayssa: já confirmado (não espera o sinal nem cai em 24h)
        status: "confirmed",
        admin_note: observacoes,
        valor,
        forma_pagamento: forma,
        origem: "painel",
        reviewed_by: admin.id,
        reviewed_at: agora,
      })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") throw new BusinessError("Já tem um horário marcado nesse dia e hora.", "hora");
      throw new Error(error.message);
    }
    const id = (criado as { id: string }).id;
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "appointment_created_by_admin",
      entityType: "appointment",
      entityId: id,
      meta: { client_id: clienteId, data, hora, servicos: lista.map((s) => s.nome) },
    });
    revalidar();
    return { id, clienteId: clienteId!, clienteNova };
  });
}

/** Editar e reagendar um horário em aberto: serviços, dia, hora, duração, valor, forma e observação. */
export async function adminEditarAgendamentoAction(input: {
  id: string;
  servicoIds: string[];
  data: string;
  hora: string;
  duracao?: string;
  valor?: string;
  forma?: string;
  observacoes?: string;
}): Promise<ActionResult> {
  return runAction("gestao.editarAgendamento", async () => {
    const admin = await assertAdmin();
    const id = z.string().uuid().parse(input.id);
    const db = vipDb();
    const { data: atual } = await db.from("appointments").select("*").eq("id", id).maybeSingle();
    const a = atual as { id: string; client_id: string; status: string; scheduled_date: string; scheduled_time: string } | null;
    if (!a) throw new BusinessError("Horário não encontrado.");
    if (a.status !== "requested" && a.status !== "confirmed") {
      throw new BusinessError("Esse horário já foi encerrado. A data se corrige em Corrigir data, e o valor em Atendimentos realizados.");
    }
    const data = isoDateField.parse(input.data);
    const hora = horaField.parse(input.hora);
    const ids = idsServicos.parse(input.servicoIds ?? []);
    const settings = await getSettings();
    const lista = await servicosEscolhidos(ids);
    const somaMin = lista.reduce((s, x) => s + (x.duracao || 0), 0);
    const duracao = lerDuracao(input.duracao, somaMin || settings.booking.default_duration_min);
    const valor = lerValor(input.valor);
    const forma = input.forma?.trim() ? input.forma.trim() : null;
    if (forma && !formaValida(forma)) throw new BusinessError("Forma de pagamento inválida.", "forma");
    const observacoes = (input.observacoes ?? "").trim().slice(0, 500) || null;

    const ocupado = await quemOcupa(data, hora, duracao, id, settings.booking.default_duration_min);
    if (ocupado) throw new BusinessError(`Nesse horário já tem ${ocupado}. Escolha outro horário ou mude a duração.`, "hora");

    const { error } = await db
      .from("appointments")
      .update({
        service_id: lista[0].id,
        service_name: juntarServicos(lista.map((s) => s.nome)),
        servicos: lista,
        scheduled_date: data,
        scheduled_time: hora,
        duration_min: duracao,
        valor,
        forma_pagamento: forma,
        admin_note: observacoes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .in("status", ["requested", "confirmed"]);
    if (error) {
      if (error.code === "23505") throw new BusinessError("Já tem um horário marcado nesse dia e hora.", "hora");
      throw new Error(error.message);
    }
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "appointment_edited",
      entityType: "appointment",
      entityId: id,
      meta: { client_id: a.client_id, de: `${a.scheduled_date} ${a.scheduled_time.slice(0, 5)}`, para: `${data} ${hora}` },
    });
    revalidar();
    return undefined;
  });
}

// ------------------------------------------------------------
// Pagamentos de um atendimento realizado
// ------------------------------------------------------------

async function atendimentoComPago(id: string): Promise<{ id: string; client_id: string; valor: number | null; recebido: number }> {
  const db = vipDb();
  const [vRes, pRes] = await Promise.all([
    db.from("client_services").select("id, client_id, amount, status").eq("id", id).maybeSingle(),
    db.from("pagamentos").select("valor").eq("client_service_id", id),
  ]);
  const v = vRes.data as { id: string; client_id: string; amount: number | string | null; status: string } | null;
  if (!v || v.status !== "approved") throw new BusinessError("Atendimento não encontrado.");
  const recebido = ((pRes.data ?? []) as { valor: number | string }[]).reduce((s, p) => s + centavos(Number(p.valor)), 0) / 100;
  return { id: v.id, client_id: v.client_id, valor: v.amount == null ? null : Number(v.amount), recebido };
}

/** Registrar um pagamento (o resto, uma parte, outra forma). Não passa do que falta. */
export async function adminRegistrarPagamentoAction(input: { atendimentoId: string; valor: string; forma: string; data?: string }): Promise<ActionResult> {
  return runAction("gestao.registrarPagamento", async () => {
    const admin = await assertAdmin();
    const at = await atendimentoComPago(z.string().uuid().parse(input.atendimentoId));
    const valor = lerValor(input.valor);
    if (!valor || valor <= 0) throw new BusinessError("Informe o valor recebido.", "valor");
    if (!formaValida(input.forma)) throw new BusinessError("Escolha a forma de pagamento.", "forma");
    if (at.valor != null && centavos(at.recebido) + centavos(valor) > centavos(at.valor)) {
      throw new BusinessError(`Passa do valor do atendimento: falta receber ${brl(Math.max(0, at.valor - at.recebido))}.`, "valor");
    }
    const hoje = agoraNaCasa().iso;
    const data = input.data?.trim() ? isoDateField.parse(input.data) : hoje;
    if (data > hoje) throw new BusinessError("O pagamento não pode ficar no futuro.", "data");
    await registrarPagamentos(
      at.id,
      [{ valor, forma: input.forma, origem: "manual", recebidoEm: data === hoje ? undefined : `${data}T12:00:00-03:00` }],
      admin.id,
    );
    revalidar();
    return undefined;
  });
}

/** "Marcar como pago": o que falta entra de uma vez, na forma escolhida. */
export async function adminQuitarAtendimentoAction(input: { atendimentoId: string; forma: string }): Promise<ActionResult> {
  return runAction("gestao.quitar", async () => {
    const admin = await assertAdmin();
    const at = await atendimentoComPago(z.string().uuid().parse(input.atendimentoId));
    if (!formaValida(input.forma)) throw new BusinessError("Escolha a forma de pagamento.", "forma");
    if (at.valor == null) throw new BusinessError("Esse atendimento está sem valor: informe o valor antes.");
    const falta = Math.round((at.valor - at.recebido) * 100) / 100;
    if (falta <= 0) throw new BusinessError("Esse atendimento já está pago.");
    await registrarPagamentos(at.id, [{ valor: falta, forma: input.forma, origem: "manual" }], admin.id);
    revalidar();
    return undefined;
  });
}

export async function adminRemoverPagamentoAction(input: { id: string }): Promise<ActionResult> {
  return runAction("gestao.removerPagamento", async () => {
    const admin = await assertAdmin();
    const id = z.string().uuid().parse(input.id);
    const db = vipDb();
    const { data } = await db.from("pagamentos").select("*").eq("id", id).maybeSingle();
    const p = data as { id: string; client_service_id: string; valor: number; forma: string; origem: string } | null;
    if (!p) throw new BusinessError("Pagamento não encontrado.");
    const { error } = await db.from("pagamentos").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "pagamento_removido",
      entityType: "client_service",
      entityId: p.client_service_id,
      meta: { pagamento: { valor: p.valor, forma: p.forma, origem: p.origem } },
    });
    revalidar();
    return undefined;
  });
}

/** O valor cobrado de um atendimento (o antigo sem valor, ou um acerto). Não fica abaixo do que já entrou. */
export async function adminDefinirValorAtendimentoAction(input: { atendimentoId: string; valor: string }): Promise<ActionResult> {
  return runAction("gestao.definirValor", async () => {
    const admin = await assertAdmin();
    const at = await atendimentoComPago(z.string().uuid().parse(input.atendimentoId));
    const valor = lerValor(input.valor);
    if (valor == null) throw new BusinessError("Informe o valor.", "valor");
    if (centavos(valor) < centavos(at.recebido)) throw new BusinessError(`Já entraram ${brl(at.recebido)} neste atendimento: o valor não pode ser menor.`, "valor");
    const { error } = await vipDb().from("client_services").update({ amount: valor, updated_at: new Date().toISOString() }).eq("id", at.id);
    if (error) throw new Error(error.message);
    await logAudit({ actorId: admin.id, actorRole: "admin", action: "valor_atendimento_alterado", entityType: "client_service", entityId: at.id, meta: { client_id: at.client_id, de: at.valor, para: valor } });
    revalidar();
    return undefined;
  });
}

// ------------------------------------------------------------
// A divisão Tayssa/Larissa e o contato da Larissa
// ------------------------------------------------------------

export async function adminSalvarDivisaoAction(input: { pct_tayssa: string; pct_larissa: string }): Promise<ActionResult> {
  return runAction("gestao.divisao", async () => {
    const admin = await assertAdmin();
    const t = lerNumero(input.pct_tayssa);
    const l = lerNumero(input.pct_larissa);
    if (t == null || l == null || !divisaoValida(t, l)) throw new BusinessError("Os dois percentuais precisam somar 100%.", "pct_tayssa");
    const settings = await getSettings();
    const atual = settings.financeiro;
    if (Math.round(atual.pct_tayssa * 100) === Math.round(t * 100) && Math.round(atual.pct_larissa * 100) === Math.round(l * 100)) {
      throw new BusinessError("A divisão já é essa.");
    }
    const db = vipDb();
    const agora = new Date().toISOString();
    const { error } = await db
      .from("settings")
      .upsert({ key: "financeiro", value: { ...atual, pct_tayssa: t, pct_larissa: l }, updated_by: admin.id, updated_at: agora });
    if (error) throw new Error(error.message);
    const { error: hErr } = await db.from("divisao_historico").insert({ pct_tayssa: t, pct_larissa: l, vigente_desde: agora, created_by: admin.id });
    if (hErr) throw new Error(hErr.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "divisao_alterada",
      entityType: "settings",
      meta: { de: `${atual.pct_tayssa}/${atual.pct_larissa}`, para: `${t}/${l}` },
    });
    revalidar();
    return undefined;
  });
}

export async function adminSalvarContatoLarissaAction(input: { nome: string; whatsapp: string }): Promise<ActionResult> {
  return runAction("gestao.contatoLarissa", async () => {
    const admin = await assertAdmin();
    const nome = (input.nome ?? "").trim().slice(0, 60);
    if (nome.length < 2) throw new BusinessError("Escreva o nome.", "nome");
    const whatsapp = normalizeBrPhone(input.whatsapp ?? "");
    if (!whatsapp) throw new BusinessError("WhatsApp inválido. Use DDD + número.", "whatsapp");
    const settings = await getSettings();
    const { error } = await vipDb()
      .from("settings")
      .upsert({ key: "financeiro", value: { ...settings.financeiro, larissa_nome: nome, larissa_whatsapp: whatsapp }, updated_by: admin.id, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    await logAudit({ actorId: admin.id, actorRole: "admin", action: "settings_updated", entityType: "settings", meta: { financeiro: "contato da Larissa" } });
    revalidar();
    return undefined;
  });
}

// ------------------------------------------------------------
// O link do relatório para a Larissa
// ------------------------------------------------------------

/**
 * Gera a página do relatório do período (uma foto do fechamento: mudar algo
 * depois não muda o que ela recebeu) e devolve o link e o WhatsApp da
 * Larissa com a mensagem pronta. O envio é da Tayssa: o painel não manda
 * nada sozinho (não há integração oficial de WhatsApp no projeto).
 */
export async function adminGerarLinkRelatorioAction(input: {
  periodo?: string;
  data?: string;
  mes?: string;
  de?: string;
  ate?: string;
}): Promise<ActionResult<{ id: string; url: string; whatsapp: string; mensagem: string }>> {
  return runAction("gestao.linkRelatorio", async () => {
    const admin = await assertAdmin();
    const periodo = resolverPeriodo(input, agoraNaCasa().iso);
    const [dados, settings] = await Promise.all([montarRelatorio(periodo), getSettings()]);
    const token = newToken();
    const { data, error } = await vipDb()
      .from("relatorios_links")
      .insert({ token_hash: hashToken(token), de: periodo.de, ate: periodo.ate, rotulo: periodo.rotulo, dados, created_by: admin.id })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const id = (data as { id: string }).id;
    const url = publicUrl(ROUTES.relatorioCompartilhado(token));
    const r = dados.resumo;
    const mensagem = [
      `Oi, ${settings.financeiro.larissa_nome || "Larissa"}! Aqui é a Tayssa.`,
      `Segue o relatório de ${periodo.rotulo.charAt(0).toLowerCase() + periodo.rotulo.slice(1)}:`,
      "",
      `*Atendimentos:* ${r.atendimentos}`,
      `*Faturamento:* ${brl(r.bruto)}`,
      `*Sua parte (${String(r.larissa.pct).replace(".", ",")}%):* ${brl(r.larissa.bruto)}`,
      "",
      url,
    ].join("\n");
    await logAudit({ actorId: admin.id, actorRole: "admin", action: "relatorio_link_gerado", entityType: "relatorio", entityId: id, meta: { de: periodo.de, ate: periodo.ate } });
    revalidatePath(ROUTES.adminRelatorios);
    return { id, url, whatsapp: whatsappUrl(settings.financeiro.larissa_whatsapp, mensagem), mensagem };
  });
}

export async function adminRevogarLinkRelatorioAction(input: { id: string }): Promise<ActionResult> {
  return runAction("gestao.revogarLink", async () => {
    const admin = await assertAdmin();
    const id = z.string().uuid().parse(input.id);
    const { data, error } = await vipDb()
      .from("relatorios_links")
      .update({ revogado_em: new Date().toISOString() })
      .eq("id", id)
      .is("revogado_em", null)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new BusinessError("Esse link já estava revogado.");
    await logAudit({ actorId: admin.id, actorRole: "admin", action: "relatorio_link_revogado", entityType: "relatorio", entityId: id });
    revalidatePath(ROUTES.adminRelatorios);
    return undefined;
  });
}
