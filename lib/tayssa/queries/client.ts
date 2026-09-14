import "server-only";
import { cache } from "react";
import { vipDb } from "@/lib/tayssa/db";
import { getSettings } from "@/lib/tayssa/settings";
import { getPublicBenefits, getBlackouts } from "@/lib/tayssa/queries/catalog";
import { getClientBenefits } from "@/lib/tayssa/engine";
import {
  activeBlackout,
  birthdayInfo,
  loyaltyProgress,
  referralProgress,
  type BirthdayInfo,
  type LoyaltyProgress,
  type ReferralProgress,
} from "@/lib/tayssa/rules";
import type { SessionUser } from "@/lib/tayssa/auth/session";
import type {
  BenefitRow,
  ClientBenefitRow,
  ClientServiceRow,
  ReferralRow,
} from "@/lib/tayssa/types";
import { nowInBusinessTz } from "@/lib/tayssa/format";
import type { Settings } from "@/lib/tayssa/config";

export type ClientBenefitView = ClientBenefitRow & {
  benefit: Pick<BenefitRow, "key" | "type" | "name"> | null;
};

export type ClientOverview = {
  user: SessionUser;
  settings: Settings;
  points: number;
  approvedCount: number;
  lastServiceDate: string | null;
  loyalty: LoyaltyProgress;
  referral: ReferralProgress & { rewardTitle: string; rewardDescription: string | null };
  benefits: ClientBenefitView[];
  pendingServices: number;
  referralsInProgress: number;
  birthday: BirthdayInfo | null;
  birthdayBenefit: ClientBenefitView | null;
  blackout: { name: string; endsOn: Date } | null;
  recentServices: ClientServiceRow[];
};

export const getClientOverview = cache(async (user: SessionUser): Promise<ClientOverview> => {
  const db = vipDb();
  const [settings, benefitsCatalog, blackouts, servicesRes, referralsRes, benefits] =
    await Promise.all([
      getSettings(),
      getPublicBenefits(),
      getBlackouts(),
      db
        .from("client_services")
        .select("*")
        .eq("client_id", user.id)
        .order("service_date", { ascending: false }),
      db
        .from("referrals")
        .select("status")
        .eq("referrer_user_id", user.id),
      getClientBenefits(user.id),
    ]);

  if (servicesRes.error) throw new Error(servicesRes.error.message);
  if (referralsRes.error) throw new Error(referralsRes.error.message);

  const services = (servicesRes.data ?? []) as ClientServiceRow[];
  const approved = services.filter((s) => s.status === "approved");
  const points = approved.reduce((s, r) => s + r.points, 0);
  const pendingServices = services.filter((s) => s.status === "pending").length;

  const refs = (referralsRes.data ?? []) as Pick<ReferralRow, "status">[];
  const approvedRefs = refs.filter((r) => r.status === "approved").length;
  const inProgress = refs.filter((r) => !["approved", "rejected"].includes(r.status)).length;
  const referralBenefit = benefitsCatalog.find((b) => b.type === "referral");
  const referral = {
    ...referralProgress(approvedRefs, referralBenefit?.threshold ?? 3),
    rewardTitle: referralBenefit?.name ?? "Benefício de indicação",
    rewardDescription: referralBenefit?.description ?? null,
  };

  const today = nowInBusinessTz();
  const birthday =
    user.profile?.birthday
      ? birthdayInfo(
          user.profile.birthday,
          today,
          settings.birthday.window_days_before,
          settings.birthday.window_days_after
        )
      : null;
  const birthdayBenefit =
    benefits.find(
      (b) =>
        b.benefit?.type === "birthday" &&
        b.cycle_key === `birthday:${birthday?.cycleYear ?? today.getFullYear()}`
    ) ?? null;

  return {
    user,
    settings,
    points,
    approvedCount: approved.length,
    lastServiceDate: approved[0]?.service_date ?? null,
    loyalty: loyaltyProgress(points, benefitsCatalog),
    referral,
    benefits,
    pendingServices,
    referralsInProgress: inProgress,
    birthday,
    birthdayBenefit,
    blackout: activeBlackout(today, blackouts, "birthday"),
    recentServices: services.slice(0, 5),
  };
});

export const getClientServiceHistory = cache(
  async (clientId: string): Promise<ClientServiceRow[]> => {
    const { data, error } = await vipDb()
      .from("client_services")
      .select("*")
      .eq("client_id", clientId)
      .order("service_date", { ascending: false })
      .order("submitted_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as ClientServiceRow[];
  }
);

export const getClientReferrals = cache(async (clientId: string): Promise<ReferralRow[]> => {
  const { data, error } = await vipDb()
    .from("referrals")
    .select("*")
    .eq("referrer_user_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ReferralRow[];
});
