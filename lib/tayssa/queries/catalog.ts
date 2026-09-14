import "server-only";
import { cache } from "react";
import { vipDb, isDbConfigured, logServerError } from "@/lib/tayssa/db";
import type { BenefitRow, BlackoutRow, ServiceRow } from "@/lib/tayssa/types";

export const getActiveServices = cache(async (): Promise<ServiceRow[]> => {
  if (!isDbConfigured()) return [];
  try {
    const { data, error } = await vipDb()
      .from("services")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []) as ServiceRow[];
  } catch (e) {
    logServerError("catalog.services", e);
    return [];
  }
});

export const getAllServices = cache(async (): Promise<ServiceRow[]> => {
  const { data, error } = await vipDb().from("services").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as ServiceRow[];
});

/** Benefícios ativos — usado também na página pública (com fallback). */
export const getPublicBenefits = cache(async (): Promise<BenefitRow[]> => {
  if (!isDbConfigured()) return [];
  try {
    const { data, error } = await vipDb()
      .from("benefits")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []) as BenefitRow[];
  } catch (e) {
    logServerError("catalog.benefits", e);
    return [];
  }
});

export const getAllBenefits = cache(async (): Promise<BenefitRow[]> => {
  const { data, error } = await vipDb().from("benefits").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as BenefitRow[];
});

export const getBlackouts = cache(async (): Promise<BlackoutRow[]> => {
  const { data, error } = await vipDb()
    .from("blackout_periods")
    .select("*")
    .order("starts_on", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as BlackoutRow[];
});
