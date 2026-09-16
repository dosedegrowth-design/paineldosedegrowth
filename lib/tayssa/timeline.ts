/**
 * A jornada da cliente numa lista só — pura (sem banco, sem Next).
 * O que vem (horário marcado, aniversário, próximo marco) e o que já
 * aconteceu (visitas, benefícios), na ordem em que ela vive isso.
 *
 * Não decide nada: só descreve. Benefício aqui só aparece com o status
 * que a Tayssa deu no admin.
 */
import { APPOINTMENT_STATUS_LABEL, type AppointmentRow, type ClientBenefitRow, type ClientServiceRow } from "./types.ts";
import { toISODate, type BirthdayInfo, type LoyaltyProgress } from "./rules.ts";
import { dateLong, dayLabel, hhmm, plural } from "./format.ts";

export type TimelineKind =
  | "visit"
  | "pending"
  | "benefit"
  | "validating"
  | "requested"
  | "used"
  | "appointment"
  | "birthday"
  | "milestone";

export type TimelineTone = "plum" | "gold" | "ivory" | "muted";

export type TimelineItem = {
  id: string;
  kind: TimelineKind;
  /** data de referência (YYYY-MM-DD); null = sem data (ex.: próximo marco) */
  date: string | null;
  title: string;
  detail: string;
  /** valor à direita: "+25", "liberado"… */
  value?: string;
  tone: TimelineTone;
};

export type Timeline = {
  /** o que vem, do mais próximo ao mais distante */
  upcoming: TimelineItem[];
  /** o que já aconteceu, do mais recente ao mais antigo */
  recent: TimelineItem[];
};

export type TimelineInput = {
  services: ClientServiceRow[];
  benefits: (ClientBenefitRow & { benefit?: { type: string; key: string } | null })[];
  appointments: AppointmentRow[];
  birthday: BirthdayInfo | null;
  loyalty: LoyaltyProgress;
  today: Date;
  /** limites por lista */
  limits?: { upcoming?: number; recent?: number };
};

const day = (v: string | null | undefined) => (v ? v.slice(0, 10) : null);

export function buildTimeline({
  services,
  benefits,
  appointments,
  birthday,
  loyalty,
  today,
  limits = {},
}: TimelineInput): Timeline {
  const todayISO = toISODate(today);
  const upcoming: TimelineItem[] = [];
  const recent: TimelineItem[] = [];

  for (const a of appointments) {
    if (!["requested", "confirmed"].includes(a.status) || a.scheduled_date < todayISO) continue;
    upcoming.push({
      id: `apt:${a.id}`,
      kind: "appointment",
      date: a.scheduled_date,
      title: a.service_name,
      detail: `${dayLabel(a.scheduled_date, today)} · ${hhmm(a.scheduled_time)} · ${APPOINTMENT_STATUS_LABEL[a.status].toLowerCase()}`,
      tone: a.status === "confirmed" ? "ivory" : "muted",
    });
  }

  if (birthday && (birthday.inWindow || birthday.daysUntil <= 30)) {
    upcoming.push({
      id: "birthday",
      kind: "birthday",
      date: birthday.inWindow ? todayISO : toISODate(birthday.nextDate),
      title: "Semana de aniversário",
      detail: birthday.isToday
        ? "é hoje — parabéns"
        : birthday.inWindow
          ? "sua janela está aberta"
          : `em ${birthday.daysUntil} ${plural(birthday.daysUntil, "dia", "dias")} · ${dateLong(birthday.nextDate)}`,
      tone: "gold",
    });
  }

  if (loyalty.next) {
    upcoming.push({
      id: `milestone:${loyalty.next.key}`,
      kind: "milestone",
      date: null,
      title: loyalty.next.title,
      detail: `${loyalty.pointsToNext === 1 ? "falta" : "faltam"} ${loyalty.pointsToNext} ${plural(loyalty.pointsToNext, "ponto", "pontos")}`,
      value: `${loyalty.next.threshold}`,
      tone: "muted",
    });
  }

  for (const s of services) {
    if (s.status === "approved") {
      recent.push({
        id: `svc:${s.id}`,
        kind: "visit",
        date: s.service_date,
        title: s.service_name,
        detail: dateLong(s.service_date),
        value: `+${s.points}`,
        tone: "plum",
      });
    } else if (s.status === "pending") {
      recent.push({
        id: `svc:${s.id}`,
        kind: "pending",
        date: s.service_date,
        title: s.service_name,
        detail: `${dateLong(s.service_date)} · aguarda confirmação da Tayssa`,
        tone: "muted",
      });
    }
  }

  for (const b of benefits) {
    if (b.status === "available" || b.status === "approved") {
      recent.push({
        id: `ben:${b.id}`,
        kind: "benefit",
        date: day(b.available_at ?? b.approved_at ?? b.updated_at),
        title: b.title,
        detail: b.status === "approved" ? "aprovado — combine com a Tayssa" : "liberado pela Tayssa",
        value: "seu",
        tone: "gold",
      });
    } else if (b.status === "pending_validation") {
      recent.push({
        id: `ben:${b.id}`,
        kind: "validating",
        date: day(b.eligible_at ?? b.created_at),
        title: b.title,
        detail: "em validação pela Tayssa",
        tone: "muted",
      });
    } else if (b.status === "requested") {
      recent.push({
        id: `ben:${b.id}`,
        kind: "requested",
        date: day(b.requested_at ?? b.updated_at),
        title: b.title,
        detail: "pedido enviado",
        tone: "gold",
      });
    } else if (b.status === "redeemed") {
      recent.push({
        id: `ben:${b.id}`,
        kind: "used",
        date: day(b.redeemed_at ?? b.updated_at),
        title: b.title,
        detail: "aproveitado",
        tone: "muted",
      });
    }
  }

  // o que vem: por data, sem data por último; estável para empates
  upcoming.sort((a, b) => (a.date === b.date ? 0 : a.date === null ? 1 : b.date === null ? -1 : a.date.localeCompare(b.date)));
  // o que passou: mais recente primeiro
  recent.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  return {
    upcoming: upcoming.slice(0, limits.upcoming ?? 3),
    recent: recent.slice(0, limits.recent ?? 6),
  };
}
