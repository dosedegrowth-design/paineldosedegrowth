/**
 * Regras de negócio puras (sem banco, sem Next) — fidelidade, indicação,
 * aniversário, blackout, inatividade. Testáveis isoladamente.
 *
 * REGRA ABSOLUTA: nada aqui concede benefício. Estas funções só
 * descrevem progresso e elegibilidade; a Tayssa confirma no admin.
 */

import type { BenefitRow, BlackoutRow } from "@/lib/tayssa/types";

// ------------------------------------------------------------
// Fidelidade (pontos por atendimento aprovado)
// ------------------------------------------------------------

export type Milestone = {
  benefitId: string;
  key: string;
  title: string;
  description: string | null;
  threshold: number;
  /** meses seguidos com atendimento que o marco também pede (0 = só pontos) */
  meses: number;
  reached: boolean;
};

export type LoyaltyProgress = {
  points: number;
  /** meses seguidos com atendimento, até hoje */
  meses: number;
  milestones: Milestone[];
  /** Último marco alcançado. */
  current: Milestone | null;
  /** Próximo marco (null se todos alcançados). */
  next: Milestone | null;
  /** 0..1 do trecho entre o marco atual e o próximo (o critério mais atrasado manda). */
  progressToNext: number;
  pointsToNext: number;
  /** meses seguidos que ainda faltam para o próximo marco */
  mesesToNext: number;
  /** 0..1 da jornada inteira (até o último marco). */
  overall: number;
};

/** Os meses seguidos que um marco de pontos também pede (`config.meses_seguidos`). */
export function mesesDoMarco(b: Pick<BenefitRow, "config">): number {
  const n = Number(b.config?.meses_seguidos);
  return Number.isInteger(n) && n > 0 ? n : 0;
}

export function loyaltyProgress(
  points: number,
  loyaltyBenefits: Pick<
    BenefitRow,
    "id" | "key" | "name" | "description" | "threshold" | "active" | "type" | "threshold_unit" | "config"
  >[],
  /** meses seguidos com atendimento (`mesesSeguidos`); marco que pede constância só abre com eles */
  meses = 0
): LoyaltyProgress {
  // só marcos em PONTOS entram na jornada; o cartão (unidade "services")
  // tem ciclo próprio
  const milestones: Milestone[] = loyaltyBenefits
    .filter(
      (b) =>
        b.active &&
        b.type === "loyalty" &&
        (b.threshold ?? 0) > 0 &&
        (b.threshold_unit ?? "points") === "points"
    )
    .map((b) => ({
      benefitId: b.id,
      key: b.key,
      title: b.name,
      description: b.description,
      threshold: b.threshold as number,
      meses: mesesDoMarco(b),
      reached: points >= (b.threshold as number) && meses >= mesesDoMarco(b),
    }))
    .sort((a, b) => a.threshold - b.threshold);

  const reached = milestones.filter((m) => m.reached);
  const current = reached.length ? reached[reached.length - 1] : null;
  const next = milestones.find((m) => !m.reached) ?? null;
  const floor = current?.threshold ?? 0;
  const span = next ? next.threshold - floor : 0;
  // pontos completos não bastam quando o marco pede constância: o anel só
  // fecha com os dois
  const progressToNext = next
    ? Math.min(
        Math.max(0, Math.min(1, (points - floor) / (span || 1))),
        next.meses ? Math.min(1, meses / next.meses) : 1
      )
    : 1;
  const last = milestones[milestones.length - 1];
  const overall = last ? Math.min(1, points / last.threshold) : 0;

  return {
    points,
    meses,
    milestones,
    current,
    next,
    progressToNext,
    pointsToNext: next ? Math.max(0, next.threshold - points) : 0,
    mesesToNext: next ? Math.max(0, next.meses - meses) : 0,
    overall,
  };
}

// ------------------------------------------------------------
// Constância e o caminho até o VIP
// ------------------------------------------------------------

/**
 * Quantos meses seguidos, até hoje, tiveram pelo menos um atendimento
 * confirmado. O mês de agora ainda não acabou: sem visita nele, a conta
 * começa no mês passado (não zera). Um mês inteiro sem visita recomeça a
 * contagem do zero.
 */
export function mesesSeguidos(datas: string[], hoje: Date): number {
  const comVisita = new Set(datas.map((d) => d.slice(0, 7)));
  const chave = (ano: number, mes: number) => `${ano}-${String(mes + 1).padStart(2, "0")}`;
  let ano = hoje.getFullYear();
  let mes = hoje.getMonth();
  const voltaUm = () => {
    mes -= 1;
    if (mes < 0) {
      mes = 11;
      ano -= 1;
    }
  };
  if (!comVisita.has(chave(ano, mes))) voltaUm();
  let n = 0;
  while (comVisita.has(chave(ano, mes))) {
    n++;
    voltaUm();
  }
  return n;
}

export type CriteriosVip = {
  /** atendimentos na sequência (4) */
  visitas: number;
  /** a sequência inteira cabe nestes dias (70) */
  janelaDias: number;
  /** de um atendimento para o seguinte: no mínimo (15) */
  intervaloMin: number;
  /** e no máximo (20) */
  intervaloMax: number;
};

export type ProgressoVip = {
  criterios: CriteriosVip;
  /** atendimentos que contam na sequência de agora (0..visitas) */
  contam: number;
  faltam: number;
  /** completou uma sequência inteira: o painel avisa e a Tayssa confirma o VIP */
  cumpre: boolean;
  /** o último atendimento que contou (AAAA-MM-DD) */
  ultima: string | null;
  /** quando fazer o próximo para seguir a sequência (AAAA-MM-DD) */
  proximaDe: string | null;
  proximaAte: string | null;
  /** passou do intervalo máximo sem atendimento: recomeça no próximo */
  venceu: boolean;
  /** 0..1 */
  fracao: number;
};

const diaUTC = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
const diasEntre = (de: string, ate: string) => Math.round((diaUTC(ate) - diaUTC(de)) / 86400000);
const somaDias = (iso: string, n: number) => new Date(diaUTC(iso) + n * 86400000).toISOString().slice(0, 10);
const isoLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * O caminho até o VIP (Lucas, 09/11/2026): 4 atendimentos feitos em até 70
 * dias, de 15 a 20 dias entre um e outro. Conta o atendimento que a Tayssa
 * marcou como realizado. Um feito antes de 15 dias do anterior não conta e
 * não zera; passou de 20 dias, a sequência recomeça nele. Quem completou uma
 * sequência inteira cumpre (e continua cumprindo): o painel mostra em
 * "Prontas para VIP". Nunca muda o status sozinho: a Tayssa confirma.
 */
export function progressoVip(datas: string[], hoje: Date, criterios: CriteriosVip): ProgressoVip {
  const c = criterios;
  const ordenadas = [...new Set(datas.map((d) => d.slice(0, 10)))].sort();
  let seq: string[] = [];
  let cumpre = false;
  for (const d of ordenadas) {
    const ultima = seq[seq.length - 1];
    if (!ultima) {
      seq = [d];
    } else {
      const intervalo = diasEntre(ultima, d);
      if (intervalo < c.intervaloMin) continue;
      if (intervalo > c.intervaloMax || diasEntre(seq[0], d) > c.janelaDias) seq = [d];
      else seq.push(d);
    }
    if (seq.length >= c.visitas) cumpre = true;
  }
  const ultima = seq[seq.length - 1] ?? null;
  const venceu = !cumpre && ultima !== null && diasEntre(ultima, isoLocal(hoje)) > c.intervaloMax;
  const contam = cumpre ? c.visitas : venceu ? 0 : Math.min(seq.length, c.visitas);
  const segue = !cumpre && !venceu && ultima !== null;
  return {
    criterios: c,
    contam,
    faltam: Math.max(0, c.visitas - contam),
    cumpre,
    ultima,
    proximaDe: segue ? somaDias(ultima!, c.intervaloMin) : null,
    proximaAte: segue ? somaDias(ultima!, c.intervaloMax) : null,
    venceu,
    fracao: c.visitas > 0 ? Math.min(1, contam / c.visitas) : 1,
  };
}

/** "4 atendimentos em até 70 dias, com 15 a 20 dias entre um e outro" */
export function regraVipLegivel(c: CriteriosVip): string {
  return `${c.visitas} atendimentos em até ${c.janelaDias} dias, com ${c.intervaloMin} a ${c.intervaloMax} dias entre um e outro`;
}

const diaMes = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** Onde ela está no caminho do VIP, numa frase. */
export function andamentoVipLegivel(p: ProgressoVip): string {
  if (p.cumpre) return "completou a sequência: a Tayssa confirma o VIP";
  if (p.venceu) return `passaram mais de ${p.criterios.intervaloMax} dias do último: a contagem recomeça no próximo atendimento`;
  if (!p.contam || !p.proximaDe || !p.proximaAte) return "a contagem começa no próximo atendimento";
  return `${p.contam} de ${p.criterios.visitas} · o próximo entre ${diaMes(p.proximaDe)} e ${diaMes(p.proximaAte)}`;
}

/**
 * Quem é VIP tem prioridade na agenda, principalmente em dezembro (regra
 * da Tayssa, 29/10/2026). No painel, os pedidos de horário das VIPs vêm
 * primeiro; dentro de cada grupo, do mais próximo ao mais distante.
 */
export function vipPrimeiro<T extends { vip: boolean; scheduled_date: string; scheduled_time: string }>(pedidos: T[]): T[] {
  const quando = (p: T) => `${p.scheduled_date} ${p.scheduled_time}`;
  return [...pedidos].sort((a, b) => Number(b.vip) - Number(a.vip) || quando(a).localeCompare(quando(b)));
}

// ------------------------------------------------------------
// Indicação (ciclos de N indicações confirmadas)
// ------------------------------------------------------------

export type ReferralProgress = {
  approved: number;
  threshold: number;
  /** Quantas na rodada atual (0..threshold-1, ou threshold se acabou de fechar). */
  inCycle: number;
  remaining: number;
  /** Rodadas completas (cada uma pode virar um benefício). */
  cyclesEarned: number;
};

export function referralProgress(
  approved: number,
  threshold: number
): ReferralProgress {
  const t = Math.max(1, Math.floor(threshold || 1));
  const cyclesEarned = Math.floor(approved / t);
  const inCycle = approved - cyclesEarned * t;
  return {
    approved,
    threshold: t,
    inCycle,
    remaining: t - inCycle,
    cyclesEarned,
  };
}

/** chave de ciclo do benefício de indicação: referral:1, referral:2, … */
export function referralCycleKey(cycleNumber: number): string {
  return `referral:${cycleNumber}`;
}

export function loyaltyCycleKey(benefitKey: string): string {
  return `loyalty:${benefitKey}`;
}

export function birthdayCycleKey(year: number): string {
  return `birthday:${year}`;
}

// ------------------------------------------------------------
// Datas utilitárias (sempre em data local "civil", sem fuso)
// ------------------------------------------------------------

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export function daysBetween(a: Date, b: Date): number {
  const ms = 24 * 60 * 60 * 1000;
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((ub - ua) / ms);
}

// ------------------------------------------------------------
// Aniversário
// ------------------------------------------------------------

export type BirthdayInfo = {
  /** Próxima ocorrência (este ano ou o próximo). */
  nextDate: Date;
  daysUntil: number;
  isToday: boolean;
  inWindow: boolean;
  windowStart: Date;
  windowEnd: Date;
  /** a janela é o mês inteiro do aniversário (as telas falam "mês", não "semana") */
  mesInteiro: boolean;
  /** Ano do ciclo a que a janela atual pertence. */
  cycleYear: number;
};

export function birthdayInfo(
  birthdayISO: string,
  today: Date,
  before: number,
  after: number,
  /** do dia 1º ao último dia do mês do aniversário, no lugar dos dias antes e depois */
  mesInteiro = false
): BirthdayInfo {
  const b = parseISODate(birthdayISO);
  const mes = b.getMonth();
  const ultimoDia = (ano: number) => new Date(ano, mes + 1, 0).getDate();
  // 29/02 em ano sem esse dia cai no 28, não em 1º de março
  const naData = (ano: number) => new Date(ano, mes, Math.min(b.getDate(), ultimoDia(ano)));
  const inicio = (d: Date) => (mesInteiro ? new Date(d.getFullYear(), mes, 1) : addDays(d, -before));
  const fim = (d: Date) => (mesInteiro ? new Date(d.getFullYear(), mes, ultimoDia(d.getFullYear())) : addDays(d, after));
  // se a janela deste ano já passou, a próxima ocorrência é no ano que vem
  let occurrence = naData(today.getFullYear());
  if (daysBetween(today, fim(occurrence)) < 0) occurrence = naData(today.getFullYear() + 1);
  const windowStart = inicio(occurrence);
  const windowEnd = fim(occurrence);
  const daysUntil = daysBetween(today, occurrence);
  const inWindow =
    daysBetween(windowStart, today) >= 0 && daysBetween(today, windowEnd) >= 0;
  return {
    nextDate: occurrence,
    daysUntil,
    isToday: daysUntil === 0,
    inWindow,
    windowStart,
    windowEnd,
    mesInteiro,
    cycleYear: occurrence.getFullYear(),
  };
}

/**
 * Validade do presente de aniversário liberado hoje no modo mês inteiro: até
 * o último dia do mês dela (1 dia no mínimo). Fora desse modo, a validade
 * padrão do benefício.
 */
export function validadeDoAniversario(info: BirthdayInfo, today: Date, padrao: number): number {
  if (!info.mesInteiro) return padrao;
  return Math.min(365, Math.max(1, daysBetween(today, info.windowEnd) + 1));
}

/** Aniversariantes de um mês (0-11) a partir de uma lista de datas. */
export function isBirthdayInMonth(birthdayISO: string, month: number): boolean {
  return parseISODate(birthdayISO).getMonth() === month;
}

// ------------------------------------------------------------
// Blackout (ex.: dezembro)
// ------------------------------------------------------------

export function activeBlackout(
  date: Date,
  periods: Pick<BlackoutRow, "name" | "starts_on" | "ends_on" | "benefit_types" | "active">[],
  benefitType: string
): { name: string; endsOn: Date } | null {
  for (const p of periods) {
    if (!p.active) continue;
    if (!p.benefit_types.includes(benefitType) && !p.benefit_types.includes("all")) {
      continue;
    }
    const s = parseISODate(p.starts_on);
    const e = parseISODate(p.ends_on);
    if (daysBetween(s, date) >= 0 && daysBetween(date, e) >= 0) {
      return { name: p.name, endsOn: e };
    }
  }
  return null;
}

// ------------------------------------------------------------
// Inatividade
// ------------------------------------------------------------

export function daysSince(iso: string | null | undefined, today: Date): number | null {
  if (!iso) return null;
  return daysBetween(parseISODate(iso), today);
}

export function isInactive(
  lastServiceISO: string | null | undefined,
  inactivityDays: number,
  today: Date
): boolean {
  const d = daysSince(lastServiceISO, today);
  return d === null ? true : d >= inactivityDays;
}

// ------------------------------------------------------------
// Agenda (puro): dias e horários que a cliente pode escolher
// ------------------------------------------------------------

export type BookableDay = { iso: string; weekday: number; date: Date };

/**
 * Dias abertos dentro do horizonte, a partir de hoje. No período especial
 * (dezembro) abre quem tem horário naquela data, domingo inclusive, e a
 * folga fecha; fora dele valem os dias da semana da casa.
 */
export function bookableDays(
  today: Date,
  booking: { weekdays: number[]; horizon_days: number; especial?: PeriodoEspecial | null }
): BookableDay[] {
  const out: BookableDay[] = [];
  for (let i = 0; i <= booking.horizon_days; i++) {
    const d = addDays(today, i);
    const iso = toISODate(d);
    const aberto = noPeriodoEspecial(booking.especial, iso)
      ? horariosDoPeriodo(booking.especial, iso, d.getDay()).length > 0
      : booking.weekdays.includes(d.getDay());
    if (!aberto) continue;
    out.push({ iso, weekday: d.getDay(), date: d });
  }
  return out;
}

/** "HH:MM" -> minutos desde meia-noite */
export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.slice(0, 5).split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Início e fim de um horário marcado, no relógio da casa (como `now`). */
export function appointmentWindow(
  dateISO: string,
  hhmm: string,
  durationMin: number | null | undefined
): { start: Date; end: Date } {
  const d = parseISODate(dateISO);
  const [h, m] = hhmm.slice(0, 5).split(":").map(Number);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h ?? 0, m ?? 0);
  const minutes = Number.isFinite(durationMin) && (durationMin ?? 0) > 0 ? (durationMin as number) : 60;
  return { start, end: new Date(start.getTime() + minutes * 60_000) };
}

/**
 * O horário já terminou? Sai de "próximos" e para de contar no limite de
 * horários em aberto — antes, o das 10h30 de hoje seguia como "próximo"
 * até a meia-noite.
 */
export function appointmentEnded(
  a: { scheduled_date: string; scheduled_time: string; duration_min?: number | null },
  now: Date
): boolean {
  return appointmentWindow(a.scheduled_date, a.scheduled_time, a.duration_min).end.getTime() <= now.getTime();
}

/** O horário já começou? Daí em diante só a Tayssa encerra (realizado ou falta). */
export function appointmentStarted(
  a: { scheduled_date: string; scheduled_time: string },
  now: Date
): boolean {
  return appointmentWindow(a.scheduled_date, a.scheduled_time, null).start.getTime() <= now.getTime();
}

/** O horário ainda respeita a antecedência mínima? */
export function slotIsBookable(
  dateISO: string,
  hhmm: string,
  now: Date,
  leadHours: number
): boolean {
  const d = parseISODate(dateISO);
  const [h, m] = hhmm.slice(0, 5).split(":").map(Number);
  const slot = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h ?? 0, m ?? 0);
  return slot.getTime() - now.getTime() >= leadHours * 60 * 60 * 1000;
}

// ------------------------------------------------------------
// Agenda por dia e por duração
// ------------------------------------------------------------

/** Os horários de início de um dia da semana: a lista do dia ou, sem ela, a geral. */
export function horariosDoDia(
  booking: { slots: string[]; slots_por_dia?: Record<string, string[]> | null },
  weekday: number
): string[] {
  const doDia = booking.slots_por_dia?.[String(weekday)];
  return doDia?.length ? doDia : booking.slots;
}

/**
 * Horário especial de um período (dezembro de 2026, do carrossel "Agenda de
 * Dezembro" da Tayssa). Lucas, 12/11/2026: "24 tem acréscimo de R$ 30 em
 * qualquer horário" e "horários de dezembro têm que ter acréscimo de 30 no
 * primeiro e no último horário". Guardado na linha `periodo_especial` de
 * `vip.settings`, fora de `booking` (salvar Configurações → Agenda regrava
 * `booking` inteiro), e preso em `settings.booking.especial` ao ler.
 */
export type PeriodoEspecial = {
  /** "AAAA-MM-DD", o primeiro e o último dia do período (inclusive) */
  desde: string;
  ate: string;
  /** os horários de início de cada dia da semana no período ("0" = domingo); dia sem lista fica fechado */
  slots_por_dia: Record<string, string[]>;
  /** taxa de horário especial, em reais: no primeiro e no último horário de cada dia */
  taxa: number;
  /** dias com horário próprio; `taxa_em_todos`: a taxa vale em qualquer horário do dia (24/12) */
  dias: Record<string, { slots: string[]; taxa_em_todos?: boolean }>;
  /** dias sem atendimento */
  folgas: string[];
};

const ISO_DIA = /^\d{4}-\d{2}-\d{2}$/;
const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;
const listaDeHoras = (v: unknown): string[] =>
  Array.isArray(v) ? [...new Set(v.filter((h): h is string => typeof h === "string" && HH_MM.test(h)))].sort() : [];

/** O que veio do banco, conferido: qualquer peça fora do formato fica de fora (sem período = null). */
export function lerPeriodoEspecial(v: unknown): PeriodoEspecial | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  const desde = typeof o.desde === "string" && ISO_DIA.test(o.desde) ? o.desde : "";
  const ate = typeof o.ate === "string" && ISO_DIA.test(o.ate) ? o.ate : "";
  if (!desde || !ate || ate < desde) return null;
  const slots_por_dia: Record<string, string[]> = {};
  if (o.slots_por_dia && typeof o.slots_por_dia === "object") {
    for (const [k, l] of Object.entries(o.slots_por_dia as Record<string, unknown>)) {
      if (/^[0-6]$/.test(k)) slots_por_dia[k] = listaDeHoras(l);
    }
  }
  const dias: PeriodoEspecial["dias"] = {};
  if (o.dias && typeof o.dias === "object") {
    for (const [k, d] of Object.entries(o.dias as Record<string, unknown>)) {
      if (!ISO_DIA.test(k) || !d || typeof d !== "object") continue;
      const dd = d as Record<string, unknown>;
      dias[k] = { slots: listaDeHoras(dd.slots), taxa_em_todos: dd.taxa_em_todos === true };
    }
  }
  const folgas = Array.isArray(o.folgas) ? o.folgas.filter((f): f is string => typeof f === "string" && ISO_DIA.test(f)) : [];
  const taxa = Number(o.taxa);
  return { desde, ate, slots_por_dia, taxa: Number.isFinite(taxa) && taxa > 0 ? taxa : 0, dias, folgas };
}

/** O período especial vale nesse dia? */
export function noPeriodoEspecial(p: PeriodoEspecial | null | undefined, iso: string): p is PeriodoEspecial {
  return Boolean(p && p.desde <= iso && iso <= p.ate);
}

/** Os horários de uma data dentro do período: folga não tem nenhum; dia com horário próprio, os dele. */
function horariosDoPeriodo(p: PeriodoEspecial, iso: string, weekday: number): string[] {
  if (p.folgas.includes(iso)) return [];
  const dia = p.dias[iso];
  if (dia) return [...dia.slots];
  return [...(p.slots_por_dia[String(weekday)] ?? [])];
}

/** Os horários de início de uma data: dezembro tem os seus (e a folga, nenhum); fora dele, os de sempre. */
export function horariosDaData(
  booking: { slots: string[]; slots_por_dia?: Record<string, string[]> | null; especial?: PeriodoEspecial | null },
  iso: string
): string[] {
  const weekday = parseISODate(iso).getDay();
  if (noPeriodoEspecial(booking.especial, iso)) return horariosDoPeriodo(booking.especial, iso, weekday);
  return horariosDoDia(booking, weekday);
}

/** A data abre para agendamento? (no período, quem tem horário; fora, os dias da semana da casa) */
export function diaAberto(
  booking: {
    weekdays: number[];
    slots: string[];
    slots_por_dia?: Record<string, string[]> | null;
    especial?: PeriodoEspecial | null;
  },
  iso: string
): boolean {
  if (noPeriodoEspecial(booking.especial, iso)) return horariosDaData(booking, iso).length > 0;
  return booking.weekdays.includes(parseISODate(iso).getDay());
}

/**
 * A taxa de horário especial de um início, em reais (0 = sem taxa): no dia
 * com taxa em todos (24/12), qualquer horário; nos outros dias do período,
 * só o primeiro e o último horário do dia; fora do período, nenhuma.
 */
export function taxaDoHorario(
  booking: { slots: string[]; slots_por_dia?: Record<string, string[]> | null; especial?: PeriodoEspecial | null },
  iso: string,
  hora: string
): number {
  const p = booking.especial;
  if (!noPeriodoEspecial(p, iso) || !(p.taxa > 0)) return 0;
  const grade = [...horariosDaData(booking, iso)].sort();
  const h = hora.slice(0, 5);
  if (!grade.includes(h)) return 0;
  if (p.dias[iso]?.taxa_em_todos) return p.taxa;
  return h === grade[0] || h === grade[grade.length - 1] ? p.taxa : 0;
}

/** minutos desde a meia-noite -> "HH:MM" */
export function minutesToTime(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

/**
 * A grade de um dia a partir do primeiro e do último início:
 * "10:00" a "16:00" de 60 em 60 -> 10h, 11h … 16h. O último é o último
 * horário em que um atendimento começa (pode terminar depois dele).
 */
export function gradeDeHorarios(de: string, ate: string, passoMin: number): string[] {
  const inicio = timeToMinutes(de);
  const fim = timeToMinutes(ate);
  if (!(passoMin > 0) || fim < inicio) return [];
  const out: string[] = [];
  for (let t = inicio; t <= fim && t < 24 * 60; t += passoMin) out.push(minutesToTime(t));
  return out;
}

/** Um pedaço ocupado do dia, em minutos desde a meia-noite: [inicio, fim). */
export type Trecho = { inicio: number; fim: number };

/**
 * O que já ocupa um dia: cada pedido ou confirmado do começo ao fim (um
 * volume de 3h às 9h segura também 10h e 11h) e cada horário que a Tayssa
 * fechou, até o horário seguinte da grade.
 */
export function trechosOcupados(
  grade: string[],
  marcados: { scheduled_time: string; duration_min?: number | null }[],
  fechados: Iterable<string>,
  duracaoPadrao: number
): Trecho[] {
  const out: Trecho[] = marcados.map((m) => {
    const inicio = timeToMinutes(m.scheduled_time);
    const minutos = Number.isFinite(m.duration_min) && (m.duration_min ?? 0) > 0 ? (m.duration_min as number) : duracaoPadrao;
    return { inicio, fim: inicio + minutos };
  });
  const inicios = grade.map(timeToMinutes).sort((a, b) => a - b);
  for (const f of fechados) {
    const inicio = timeToMinutes(f);
    out.push({ inicio, fim: inicios.find((g) => g > inicio) ?? inicio + 60 });
  }
  return out;
}

export type HorarioParaMarcar = {
  time: string;
  /** dá para começar ali: nada ocupando e com a antecedência mínima */
  available: boolean;
  /** minutos livres a partir dele até o próximo trecho ocupado (null = o resto do dia) */
  ate: number | null;
};

/**
 * Os horários de um dia para quem vai marcar: cada início diz se está
 * livre e quanto tempo segue livre depois dele. O serviço só cabe onde o
 * tempo dele alcança (`cabeNoHorario`, em lib/tayssa/agendar.ts).
 */
export function horariosParaMarcar(
  dateISO: string,
  grade: string[],
  ocupado: Trecho[],
  now: Date,
  leadHours: number
): HorarioParaMarcar[] {
  return grade.map((time) => {
    const t = timeToMinutes(time);
    const preso = ocupado.some((o) => o.inicio <= t && t < o.fim);
    let proximo: number | null = null;
    for (const o of ocupado) if (o.inicio > t && (proximo === null || o.inicio < proximo)) proximo = o.inicio;
    return {
      time,
      available: !preso && slotIsBookable(dateISO, time, now, leadHours),
      ate: proximo === null ? null : proximo - t,
    };
  });
}
