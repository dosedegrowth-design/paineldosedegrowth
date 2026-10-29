import "server-only";
import { cache } from "react";
import { nowInBusinessTz } from "@/lib/tayssa/format";
import { vipDb } from "@/lib/tayssa/db";
import { getSettings } from "@/lib/tayssa/settings";
import { getPublicBenefits } from "@/lib/tayssa/queries/catalog";
import { horariosFechados } from "@/lib/tayssa/queries/vip";
import { expireStaleBenefits } from "@/lib/tayssa/engine";
import {
  birthdayInfo,
  horariosDoDia,
  isBirthdayInMonth,
  isInactive,
  loyaltyProgress,
  referralProgress,
  timeToMinutes,
  toISODate,
  type BirthdayInfo,
  type LoyaltyProgress,
  type ReferralProgress,
} from "@/lib/tayssa/rules";
import type {
  AuditRow,
  BenefitRow,
  ClientBenefitRow,
  ClientProfileRow,
  ClientServiceRow,
  ReferralRow,
  UserRow,
  AppointmentRow,
} from "@/lib/tayssa/types";

type UserWithProfile = UserRow & { client_profiles: ClientProfileRow | ClientProfileRow[] | null };

function profileOf(u: UserWithProfile): ClientProfileRow | null {
  const p = u.client_profiles;
  return Array.isArray(p) ? p[0] ?? null : p;
}

export type ClientSummary = {
  user: UserRow;
  profile: ClientProfileRow | null;
  points: number;
  approvedCount: number;
  lastServiceDate: string | null;
  pendingServices: number;
  approvedReferrals: number;
  benefitsAvailable: number;
  benefitsPendingValidation: number;
  inactive: boolean;
};

async function loadClientRows(): Promise<UserWithProfile[]> {
  const { data, error } = await vipDb()
    .from("users")
    .select("*, client_profiles(*)")
    .eq("role", "client")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as UserWithProfile[];
}

/** Lista de clientes com agregados (escala pequena: reduz em memória). */
export const listClients = cache(async (): Promise<ClientSummary[]> => {
  const db = vipDb();
  await expireStaleBenefits();
  const [users, settings, servicesRes, referralsRes, benefitsRes] = await Promise.all([
    loadClientRows(),
    getSettings(),
    db.from("client_services").select("client_id, status, points, service_date"),
    db.from("referrals").select("referrer_user_id, status"),
    db.from("client_benefits").select("client_id, status"),
  ]);
  if (servicesRes.error) throw new Error(servicesRes.error.message);
  if (referralsRes.error) throw new Error(referralsRes.error.message);
  if (benefitsRes.error) throw new Error(benefitsRes.error.message);

  const services = (servicesRes.data ?? []) as Pick<
    ClientServiceRow,
    "client_id" | "status" | "points" | "service_date"
  >[];
  const referrals = (referralsRes.data ?? []) as Pick<ReferralRow, "referrer_user_id" | "status">[];
  const benefits = (benefitsRes.data ?? []) as Pick<ClientBenefitRow, "client_id" | "status">[];
  // "hoje" no fuso do estúdio: no relógio do servidor (UTC) já é amanhã depois das 21h
  const today = nowInBusinessTz();

  return users.map((u) => {
    const mine = services.filter((s) => s.client_id === u.id);
    const approved = mine.filter((s) => s.status === "approved");
    const last = approved.map((s) => s.service_date).sort().reverse()[0] ?? null;
    const myBenefits = benefits.filter((b) => b.client_id === u.id);
    return {
      user: u,
      profile: profileOf(u),
      points: approved.reduce((s, r) => s + r.points, 0),
      approvedCount: approved.length,
      lastServiceDate: last,
      pendingServices: mine.filter((s) => s.status === "pending").length,
      approvedReferrals: referrals.filter(
        (r) => r.referrer_user_id === u.id && r.status === "approved"
      ).length,
      benefitsAvailable: myBenefits.filter((b) =>
        ["available", "requested", "approved"].includes(b.status)
      ).length,
      benefitsPendingValidation: myBenefits.filter((b) => b.status === "pending_validation").length,
      inactive: isInactive(last, settings.rules.inactivity_days, today),
    };
  });
});

// ------------------------------------------------------------
// Agenda
// ------------------------------------------------------------

export type AppointmentWithClient = AppointmentRow & {
  client: Pick<UserRow, "id" | "name" | "nickname" | "phone"> | null;
};

export type Agenda = {
  /** hoje, no fuso da casa (YYYY-MM-DD) */
  today: string;
  /** pedidos esperando a Tayssa (de hoje em diante) */
  requested: AppointmentWithClient[];
  /** o dia de hoje: pedidos e confirmados */
  todayList: AppointmentWithClient[];
  /** confirmados de amanhã em diante */
  upcoming: AppointmentWithClient[];
  /** já passaram e ninguém fechou: realizado ou não compareceu */
  toClose: AppointmentWithClient[];
  /** encerrados recentes */
  past: AppointmentWithClient[];
};

function shiftDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

export const getAgenda = cache(async (): Promise<Agenda> => {
  const now = nowInBusinessTz();
  const today = toISODate(now);
  const { data, error } = await vipDb()
    .from("appointments")
    .select("*, client:users!appointments_client_id_fkey(id, name, nickname, phone)")
    .gte("scheduled_date", toISODate(shiftDays(now, -45)))
    .lte("scheduled_date", toISODate(shiftDays(now, 120)))
    .order("scheduled_date")
    .order("scheduled_time")
    .limit(500);
  if (error) throw new Error(error.message);
  const all = (data ?? []) as AppointmentWithClient[];
  const open = (a: AppointmentWithClient) => a.status === "requested" || a.status === "confirmed";
  return {
    today,
    requested: all.filter((a) => a.status === "requested" && a.scheduled_date >= today),
    todayList: all.filter((a) => open(a) && a.scheduled_date === today),
    upcoming: all.filter((a) => a.status === "confirmed" && a.scheduled_date > today),
    toClose: all.filter((a) => open(a) && a.scheduled_date < today),
    past: all
      .filter((a) => !open(a))
      .sort((a, b) => (b.scheduled_date + b.scheduled_time).localeCompare(a.scheduled_date + a.scheduled_time))
      .slice(0, 40),
  };
});

// ------------------------------------------------------------
// Grade da agenda (painel): semana a semana, como o Google Agenda
// ------------------------------------------------------------

export type ConsultaNaGrade = {
  id: string;
  clienteId: string | null;
  nome: string;
  servico: string;
  status: AppointmentRow["status"];
};
/** livre/fechado: a Tayssa alterna · ocupado: tem pedido ou confirmado · folga: dia que não atende · passou: já foi */
export type EstadoCelula = "livre" | "fechado" | "ocupado" | "folga" | "passou";
export type CelulaAgenda = {
  hora: string;
  estado: EstadoCelula;
  /** quem começa neste horário */
  consultas: ConsultaNaGrade[];
  /** quem começou antes e ainda está na cadeira (o volume de 3h das 9h, às 10h e 11h) */
  segue: ConsultaNaGrade | null;
};
export type DiaGrade = { iso: string; aberto: boolean; celulas: CelulaAgenda[] };
export type GradeAgenda = { hoje: string; agoraHora: string; dias: DiaGrade[] };

/**
 * Da semana atual (domingo) até o fim do horizonte de agendamento: cada
 * dia com os horários da grade dele (Configurações → Agenda) mais
 * qualquer horário fora dela que tenha cliente marcada. Nada some: o que
 * está ocupado, fechado ou já passou aparece com o seu estado, e o
 * serviço longo ocupa as linhas seguintes até terminar.
 */
export const getGradeAgenda = cache(async (): Promise<GradeAgenda> => {
  const settings = await getSettings();
  const b = settings.booking;
  const now = nowInBusinessTz();
  const hoje = toISODate(now);
  const agoraHora = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const inicio = shiftDays(now, -now.getDay());
  const fim = shiftDays(now, Math.max(13, Math.min(b.horizon_days, 84)));
  const de = toISODate(inicio);
  const ate = toISODate(fim);

  const [{ data, error }, fechados] = await Promise.all([
    vipDb()
      .from("appointments")
      .select("id, scheduled_date, scheduled_time, duration_min, service_name, status, client:users!appointments_client_id_fkey(id, name, nickname)")
      .gte("scheduled_date", de)
      .lte("scheduled_date", ate)
      .in("status", ["requested", "confirmed", "done"])
      .order("scheduled_time"),
    horariosFechados(de, ate),
  ]);
  if (error) throw new Error(error.message);
  type Linha = {
    id: string;
    scheduled_date: string;
    scheduled_time: string;
    duration_min: number | null;
    service_name: string;
    status: AppointmentRow["status"];
    client: { id: string; name: string; nickname: string | null } | null;
  };
  const porDia = new Map<string, Linha[]>();
  for (const a of (data ?? []) as unknown as Linha[]) {
    const l = porDia.get(a.scheduled_date) ?? [];
    l.push(a);
    porDia.set(a.scheduled_date, l);
  }

  const naGrade = (a: Linha): ConsultaNaGrade => ({
    id: a.id,
    clienteId: a.client?.id ?? null,
    nome: a.client?.nickname || a.client?.name || "Cliente",
    servico: a.service_name,
    status: a.status,
  });
  const aberta = (a: Linha) => a.status === "requested" || a.status === "confirmed";

  const dias: DiaGrade[] = [];
  for (let d = new Date(inicio); toISODate(d) <= ate; d = shiftDays(d, 1)) {
    const iso = toISODate(d);
    const aberto = b.weekdays.includes(d.getDay());
    const grade = aberto ? horariosDoDia(b, d.getDay()) : [];
    const marcadas = porDia.get(iso) ?? [];
    const horas = [...new Set([...grade, ...marcadas.map((a) => a.scheduled_time.slice(0, 5))])].sort();
    dias.push({
      iso,
      aberto,
      celulas: horas.map((hora) => {
        const consultas = marcadas.filter((a) => a.scheduled_time.slice(0, 5) === hora).map(naGrade);
        // quem começou antes e ainda não terminou segura este horário
        const t = timeToMinutes(hora);
        const antes = marcadas.find((a) => {
          const ini = timeToMinutes(a.scheduled_time);
          return ini < t && t < ini + (a.duration_min && a.duration_min > 0 ? a.duration_min : b.default_duration_min);
        });
        const passou = iso < hoje || (iso === hoje && hora <= agoraHora);
        const estado: EstadoCelula = passou
          ? "passou"
          : consultas.some((c) => c.status === "requested" || c.status === "confirmed") || (antes && aberta(antes))
            ? "ocupado"
            : !grade.includes(hora)
              ? "folga"
              : fechados.has(`${iso}T${hora}`)
                ? "fechado"
                : "livre";
        return { hora, estado, consultas, segue: !consultas.length && antes ? naGrade(antes) : null };
      }),
    });
  }
  return { hoje, agoraHora, dias };
});

export type AdminOverview = {
  /** pediram acesso pelo site e esperam a Tayssa */
  pendingSignups: ClientSummary[];
  /** pedidos de horário esperando confirmação */
  appointmentsRequested: number;
  /** a agenda de hoje (pedidos e confirmados) */
  agendaToday: AppointmentWithClient[];
  /** horários que já passaram sem fechamento */
  appointmentsToClose: number;
  totalClients: number;
  vipActive: number;
  pendingServices: number;
  referralsInProgress: number;
  benefitsToValidate: number;
  benefitsRequested: number;
  birthdaysThisMonth: number;
  birthdaysThisWeek: ClientSummary[];
  inactiveClients: ClientSummary[];
  recentAudit: AuditRow[];
};

export const getAdminOverview = cache(async (): Promise<AdminOverview> => {
  const db = vipDb();
  const [clients, agenda, pendingRes, refRes, benRes, auditRes] = await Promise.all([
    listClients(),
    getAgenda(),
    db.from("client_services").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "contacted", "scheduled", "completed"]),
    db.from("client_benefits").select("status").in("status", ["pending_validation", "requested"]),
    db.from("audit_log").select("*").order("created_at", { ascending: false }).limit(12),
  ]);
  // falha do banco aparece como erro (com "Tentar de novo"), nunca como "0 pendentes"
  for (const r of [pendingRes, refRes, benRes, auditRes]) if (r.error) throw new Error(r.error.message);
  const ben = (benRes.data ?? []) as Pick<ClientBenefitRow, "status">[];
  const today = nowInBusinessTz();
  const month = today.getMonth();
  const withBirthday = clients.filter((c) => c.profile?.birthday);
  const thisMonth = withBirthday.filter((c) => isBirthdayInMonth(c.profile!.birthday!, month));
  const thisWeek = withBirthday.filter((c) => {
    const info = birthdayInfo(c.profile!.birthday!, today, 0, 0);
    return info.daysUntil >= 0 && info.daysUntil <= 7;
  });
  return {
    pendingSignups: clients
      .filter((c) => c.user.status === "pending")
      .sort((a, b) => (a.user.requested_at ?? "").localeCompare(b.user.requested_at ?? "")),
    appointmentsRequested: agenda.requested.length,
    agendaToday: agenda.todayList,
    appointmentsToClose: agenda.toClose.length,
    totalClients: clients.filter((c) => c.user.status !== "pending" && c.user.status !== "rejected").length,
    vipActive: clients.filter((c) => c.profile?.vip_status === "active").length,
    pendingServices: pendingRes.count ?? 0,
    referralsInProgress: refRes.count ?? 0,
    benefitsToValidate: ben.filter((b) => b.status === "pending_validation").length,
    benefitsRequested: ben.filter((b) => b.status === "requested").length,
    birthdaysThisMonth: thisMonth.length,
    birthdaysThisWeek: thisWeek,
    inactiveClients: clients
      .filter((c) => c.inactive && c.user.status === "active")
      .sort((a, b) => (a.lastServiceDate ?? "").localeCompare(b.lastServiceDate ?? ""))
      .slice(0, 8),
    recentAudit: (auditRes.data ?? []) as AuditRow[],
  };
});

export type ClientDetail = {
  summary: ClientSummary;
  services: ClientServiceRow[];
  referrals: ReferralRow[];
  benefits: (ClientBenefitRow & { benefit: Pick<BenefitRow, "key" | "type" | "name"> | null })[];
  audit: AuditRow[];
  loyalty: LoyaltyProgress;
  referral: ReferralProgress;
  birthday: BirthdayInfo | null;
  thisYearBirthday: ClientBenefitRow | null;
  hasPassword: boolean;
  activeSessions: number;
};

export const getClientDetail = cache(async (id: string): Promise<ClientDetail | null> => {
  const db = vipDb();
  const clients = await listClients();
  const summary = clients.find((c) => c.user.id === id);
  if (!summary) return null;
  const [settings, catalog, servicesRes, referralsRes, benefitsRes, auditRes, sessionsRes] =
    await Promise.all([
      getSettings(),
      getPublicBenefits(),
      db.from("client_services").select("*").eq("client_id", id).order("service_date", { ascending: false }),
      db.from("referrals").select("*").eq("referrer_user_id", id).order("created_at", { ascending: false }),
      db
        .from("client_benefits")
        .select("*, benefit:benefits(key, type, name)")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
      db
        .from("audit_log")
        .select("*")
        .or(`entity_id.eq.${id},actor_user_id.eq.${id},meta->>client_id.eq.${id}`)
        .order("created_at", { ascending: false })
        .limit(30),
      db
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", id)
        .is("revoked_at", null)
        .gt("expires_at", new Date().toISOString()),
    ]);
  for (const r of [servicesRes, referralsRes, benefitsRes, auditRes, sessionsRes]) if (r.error) throw new Error(r.error.message);
  const referralBenefit = catalog.find((b) => b.type === "referral");
  const benefits = (benefitsRes.data ?? []) as ClientDetail["benefits"];
  const today = nowInBusinessTz();
  const birthday = summary.profile?.birthday
    ? birthdayInfo(
        summary.profile.birthday,
        today,
        settings.birthday.window_days_before,
        settings.birthday.window_days_after,
        settings.birthday.mes_inteiro
      )
    : null;
  return {
    summary,
    services: (servicesRes.data ?? []) as ClientServiceRow[],
    referrals: (referralsRes.data ?? []) as ReferralRow[],
    benefits,
    audit: (auditRes.data ?? []) as AuditRow[],
    loyalty: loyaltyProgress(summary.points, catalog),
    referral: referralProgress(summary.approvedReferrals, referralBenefit?.threshold ?? 3),
    birthday,
    thisYearBirthday:
      benefits.find(
        (b) => b.benefit?.type === "birthday" && b.cycle_key === `birthday:${today.getFullYear()}`
      ) ?? null,
    hasPassword: Boolean(summary.user.password_hash),
    activeSessions: sessionsRes.count ?? 0,
  };
});

export type ServiceWithClient = ClientServiceRow & { client: Pick<UserRow, "id" | "name" | "nickname"> | null };

export const listServices = cache(
  async (status: "pending" | "all" = "pending"): Promise<ServiceWithClient[]> => {
    let q = vipDb()
      .from("client_services")
      .select("*, client:users!client_services_client_id_fkey(id, name, nickname)")
      .order("submitted_at", { ascending: false })
      .limit(200);
    if (status === "pending") q = q.eq("status", "pending");
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []) as ServiceWithClient[];
  }
);

export type ReferralWithClient = ReferralRow & { referrer: Pick<UserRow, "id" | "name"> | null };

export const listReferrals = cache(async (): Promise<ReferralWithClient[]> => {
  const { data, error } = await vipDb()
    .from("referrals")
    .select("*, referrer:users!referrals_referrer_user_id_fkey(id, name)")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw new Error(error.message);
  return (data ?? []) as ReferralWithClient[];
});

export type ClientBenefitWithClient = ClientBenefitRow & {
  client: Pick<UserRow, "id" | "name" | "nickname"> | null;
  benefit: Pick<BenefitRow, "key" | "type" | "name"> | null;
};

export const listClientBenefits = cache(async (): Promise<ClientBenefitWithClient[]> => {
  await expireStaleBenefits();
  const { data, error } = await vipDb()
    .from("client_benefits")
    .select("*, client:users!client_benefits_client_id_fkey(id, name, nickname), benefit:benefits(key, type, name)")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw new Error(error.message);
  return (data ?? []) as ClientBenefitWithClient[];
});

export type BirthdayEntry = ClientSummary & {
  info: BirthdayInfo;
  releasedThisYear: ClientBenefitRow | null;
};

export const listBirthdays = cache(async (month: number): Promise<BirthdayEntry[]> => {
  const today = nowInBusinessTz();
  const ano = today.getFullYear();
  // perto da virada, o aniversário que está para chegar já é do ano que vem:
  // o ciclo de cada cliente vem de birthdayInfo, igual ao que o VIP usa
  const [clients, settings, benefitsRes] = await Promise.all([
    listClients(),
    getSettings(),
    vipDb()
      .from("client_benefits")
      .select("*, benefit:benefits(type)")
      .in("cycle_key", [`birthday:${ano}`, `birthday:${ano + 1}`]),
  ]);
  if (benefitsRes.error) throw new Error(benefitsRes.error.message);
  const released = (benefitsRes.data ?? []) as (ClientBenefitRow & { benefit: { type: string } | null })[];
  return clients
    .filter((c) => c.profile?.birthday && isBirthdayInMonth(c.profile.birthday, month))
    .map((c) => {
      const info = birthdayInfo(
        c.profile!.birthday!,
        today,
        settings.birthday.window_days_before,
        settings.birthday.window_days_after,
        settings.birthday.mes_inteiro
      );
      return {
        ...c,
        info,
        releasedThisYear:
          released.find(
            (b) => b.client_id === c.user.id && b.benefit?.type === "birthday" && b.cycle_key === `birthday:${info.cycleYear}`
          ) ?? null,
      };
    })
    .sort((a, b) => {
      const da = a.profile!.birthday!.slice(5);
      const db_ = b.profile!.birthday!.slice(5);
      return da.localeCompare(db_);
    });
});

