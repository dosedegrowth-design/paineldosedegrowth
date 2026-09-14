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
  reached: boolean;
};

export type LoyaltyProgress = {
  points: number;
  milestones: Milestone[];
  /** Último marco alcançado. */
  current: Milestone | null;
  /** Próximo marco (null se todos alcançados). */
  next: Milestone | null;
  /** 0..1 do trecho entre o marco atual e o próximo. */
  progressToNext: number;
  pointsToNext: number;
  /** 0..1 da jornada inteira (até o último marco). */
  overall: number;
};

export function loyaltyProgress(
  points: number,
  loyaltyBenefits: Pick<
    BenefitRow,
    "id" | "key" | "name" | "description" | "threshold" | "active" | "type"
  >[]
): LoyaltyProgress {
  const milestones: Milestone[] = loyaltyBenefits
    .filter((b) => b.active && b.type === "loyalty" && (b.threshold ?? 0) > 0)
    .map((b) => ({
      benefitId: b.id,
      key: b.key,
      title: b.name,
      description: b.description,
      threshold: b.threshold as number,
      reached: points >= (b.threshold as number),
    }))
    .sort((a, b) => a.threshold - b.threshold);

  const reached = milestones.filter((m) => m.reached);
  const current = reached.length ? reached[reached.length - 1] : null;
  const next = milestones.find((m) => !m.reached) ?? null;
  const floor = current?.threshold ?? 0;
  const span = next ? next.threshold - floor : 0;
  const progressToNext = next
    ? Math.max(0, Math.min(1, (points - floor) / (span || 1)))
    : 1;
  const last = milestones[milestones.length - 1];
  const overall = last ? Math.min(1, points / last.threshold) : 0;

  return {
    points,
    milestones,
    current,
    next,
    progressToNext,
    pointsToNext: next ? Math.max(0, next.threshold - points) : 0,
    overall,
  };
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
  /** Ano do ciclo a que a janela atual pertence. */
  cycleYear: number;
};

export function birthdayInfo(
  birthdayISO: string,
  today: Date,
  before: number,
  after: number
): BirthdayInfo {
  const b = parseISODate(birthdayISO);
  const thisYear = new Date(today.getFullYear(), b.getMonth(), b.getDate());
  // se a janela deste ano já passou, a próxima ocorrência é no ano que vem
  const endThis = addDays(thisYear, after);
  let occurrence = thisYear;
  if (daysBetween(today, endThis) < 0) {
    occurrence = new Date(today.getFullYear() + 1, b.getMonth(), b.getDate());
  }
  const windowStart = addDays(occurrence, -before);
  const windowEnd = addDays(occurrence, after);
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
    cycleYear: occurrence.getFullYear(),
  };
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
// Expiração de benefício
// ------------------------------------------------------------

export function benefitExpiry(
  from: Date,
  validityDays: number | null | undefined,
  fallbackDays: number
): Date {
  return addDays(from, validityDays ?? fallbackDays);
}
