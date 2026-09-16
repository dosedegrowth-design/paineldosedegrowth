import "server-only";
import { cache } from "react";
import { vipDb } from "@/lib/tayssa/db";
import { getSettings } from "@/lib/tayssa/settings";
import { getPublicBenefits } from "@/lib/tayssa/queries/catalog";
import { expireStaleBenefits } from "@/lib/tayssa/engine";
import {
  birthdayInfo,
  isBirthdayInMonth,
  isInactive,
  loyaltyProgress,
  referralProgress,
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
  const today = new Date();

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

export type AdminOverview = {
  /** pediram acesso pelo site e esperam a Tayssa */
  pendingSignups: ClientSummary[];
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
  const [clients, pendingRes, refRes, benRes, auditRes] = await Promise.all([
    listClients(),
    db.from("client_services").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "contacted", "scheduled", "completed"]),
    db.from("client_benefits").select("status").in("status", ["pending_validation", "requested"]),
    db.from("audit_log").select("*").order("created_at", { ascending: false }).limit(12),
  ]);
  const ben = (benRes.data ?? []) as Pick<ClientBenefitRow, "status">[];
  const today = new Date();
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
  const referralBenefit = catalog.find((b) => b.type === "referral");
  const benefits = (benefitsRes.data ?? []) as ClientDetail["benefits"];
  const today = new Date();
  const birthday = summary.profile?.birthday
    ? birthdayInfo(
        summary.profile.birthday,
        today,
        settings.birthday.window_days_before,
        settings.birthday.window_days_after
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
  const [clients, settings, benefitsRes] = await Promise.all([
    listClients(),
    getSettings(),
    vipDb()
      .from("client_benefits")
      .select("*, benefit:benefits(type)")
      .eq("cycle_key", `birthday:${new Date().getFullYear()}`),
  ]);
  const released = (benefitsRes.data ?? []) as (ClientBenefitRow & { benefit: { type: string } | null })[];
  const today = new Date();
  return clients
    .filter((c) => c.profile?.birthday && isBirthdayInMonth(c.profile.birthday, month))
    .map((c) => ({
      ...c,
      info: birthdayInfo(
        c.profile!.birthday!,
        today,
        settings.birthday.window_days_before,
        settings.birthday.window_days_after
      ),
      releasedThisYear:
        released.find((b) => b.client_id === c.user.id && b.benefit?.type === "birthday") ?? null,
    }))
    .sort((a, b) => {
      const da = a.profile!.birthday!.slice(5);
      const db_ = b.profile!.birthday!.slice(5);
      return da.localeCompare(db_);
    });
});

export const todayISO = () => toISODate(new Date());
