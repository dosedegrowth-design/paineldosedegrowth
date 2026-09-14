import "server-only";
import { cache } from "react";
import { vipDb } from "@/lib/tayssa/db";
import { getSettings } from "@/lib/tayssa/settings";
import { getActiveServices } from "@/lib/tayssa/queries/catalog";
import { getCardState, type CardState } from "@/lib/tayssa/engine";
import { getClientOverview, type ClientOverview } from "@/lib/tayssa/queries/client";
import { bookableDays, slotIsBookable, toISODate } from "@/lib/tayssa/rules";
import type { SessionUser } from "@/lib/tayssa/auth/session";
import type { AppointmentRow, CardStamp, LoyaltyStampRow, ServiceRow, UserRow } from "@/lib/tayssa/types";

/** Linha do banco -> o que a interface do cartão precisa (nada além). */
export function toCardStamps(stamps: LoyaltyStampRow[]): CardStamp[] {
  return stamps.map((s) => ({
    id: s.id,
    position: s.position,
    serviceName: s.service_name,
    points: s.points,
    revealed: Boolean(s.revealed_at),
    date: s.stamped_at,
  }));
}

// ------------------------------------------------------------
// Agenda da cliente
// ------------------------------------------------------------

export type Appointments = {
  next: AppointmentRow | null;
  upcoming: AppointmentRow[];
  past: AppointmentRow[];
};

export const getAppointments = cache(async (clientId: string): Promise<Appointments> => {
  const { data, error } = await vipDb()
    .from("appointments")
    .select("*")
    .eq("client_id", clientId)
    .order("scheduled_date", { ascending: false })
    .order("scheduled_time", { ascending: false })
    .limit(60);
  if (error) throw new Error(error.message);
  const all = (data ?? []) as AppointmentRow[];
  const today = toISODate(new Date());
  const upcoming = all
    .filter((a) => ["requested", "confirmed"].includes(a.status) && a.scheduled_date >= today)
    .sort((a, b) => (a.scheduled_date + a.scheduled_time).localeCompare(b.scheduled_date + b.scheduled_time));
  const past = all.filter((a) => !upcoming.includes(a));
  return { next: upcoming[0] ?? null, upcoming, past };
});

// ------------------------------------------------------------
// Disponibilidade para marcar (dias + horários livres)
// ------------------------------------------------------------

export type DayAvailability = {
  iso: string;
  weekday: number;
  slots: { time: string; available: boolean }[];
};

export const getAvailability = cache(async (): Promise<{ days: DayAvailability[]; services: ServiceRow[] }> => {
  const settings = await getSettings();
  const b = settings.booking;
  const now = new Date();
  const days = bookableDays(now, b);
  if (!days.length) return { days: [], services: [] };

  const [{ data, error }, services] = await Promise.all([
    vipDb()
      .from("appointments")
      .select("scheduled_date, scheduled_time")
      .gte("scheduled_date", days[0].iso)
      .lte("scheduled_date", days[days.length - 1].iso)
      .in("status", ["requested", "confirmed"]),
    getActiveServices(),
  ]);
  if (error) throw new Error(error.message);
  const taken = new Set(
    ((data ?? []) as { scheduled_date: string; scheduled_time: string }[]).map(
      (r) => `${r.scheduled_date}T${r.scheduled_time.slice(0, 5)}`
    )
  );

  return {
    days: days.map((d) => ({
      iso: d.iso,
      weekday: d.weekday,
      slots: b.slots.map((t) => ({
        time: t,
        available: !taken.has(`${d.iso}T${t}`) && slotIsBookable(d.iso, t, now, b.lead_hours),
      })),
    })),
    services: services.filter((s) => s.slug !== "outro"),
  };
});

// ------------------------------------------------------------
// Ranking: gamificação leve, sem expor dados de ninguém
// ------------------------------------------------------------

export type RankingRow = { position: number; name: string; points: number; me: boolean };
export type Ranking = {
  position: number;
  total: number;
  points: number;
  /** vizinhança: até 2 acima e 2 abaixo, com a cliente no meio */
  rows: RankingRow[];
  /** quantos pontos para subir uma posição (0 se já é a primeira) */
  toClimb: number;
};

function firstName(u: Pick<UserRow, "name" | "nickname">): string {
  return (u.nickname?.trim() || u.name.trim()).split(/\s+/)[0];
}

export const getRanking = cache(async (clientId: string): Promise<Ranking> => {
  const db = vipDb();
  const [usersRes, servicesRes] = await Promise.all([
    db.from("users").select("id, name, nickname").eq("role", "client").eq("status", "active"),
    db.from("client_services").select("client_id, points").eq("status", "approved"),
  ]);
  if (usersRes.error) throw new Error(usersRes.error.message);
  if (servicesRes.error) throw new Error(servicesRes.error.message);
  const users = (usersRes.data ?? []) as Pick<UserRow, "id" | "name" | "nickname">[];
  const pts = new Map<string, number>();
  for (const s of (servicesRes.data ?? []) as { client_id: string; points: number }[]) {
    pts.set(s.client_id, (pts.get(s.client_id) ?? 0) + s.points);
  }
  const board = users
    .map((u) => ({ id: u.id, name: firstName(u), points: pts.get(u.id) ?? 0 }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  const idx = Math.max(0, board.findIndex((r) => r.id === clientId));
  const position = idx + 1;
  const from = Math.max(0, idx - 2);
  const to = Math.min(board.length, idx + 3);
  const rows = board.slice(from, to).map((r, i) => ({
    position: from + i + 1,
    name: r.name,
    points: r.points,
    me: r.id === clientId,
  }));
  const mine = board[idx]?.points ?? 0;
  const above = idx > 0 ? board[idx - 1].points : null;
  return {
    position,
    total: board.length,
    points: mine,
    rows,
    toClimb: above === null ? 0 : Math.max(0, above - mine + 1),
  };
});

// ------------------------------------------------------------
// Início: tudo que a home precisa, em uma chamada
// ------------------------------------------------------------

export type VipHome = {
  overview: ClientOverview;
  card: CardState;
  appointments: Appointments;
  ranking: Ranking;
};

export const getVipHome = cache(async (user: SessionUser): Promise<VipHome> => {
  const [overview, card, appointments, ranking] = await Promise.all([
    getClientOverview(user),
    getCardState(user.id),
    getAppointments(user.id),
    getRanking(user.id),
  ]);
  return { overview, card, appointments, ranking };
});
