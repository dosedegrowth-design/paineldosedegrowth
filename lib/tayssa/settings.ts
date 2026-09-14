import "server-only";
import { cache } from "react";
import { vipDb, isDbConfigured, logServerError } from "@/lib/tayssa/db";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/tayssa/config";

function merge<T extends Record<string, unknown>>(base: T, override: unknown): T {
  if (!override || typeof override !== "object" || Array.isArray(override)) {
    return base;
  }
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
    if (v === undefined || v === null) continue;
    out[k] = v;
  }
  return out as T;
}

/**
 * Configuração viva (banco) com fallback nos defaults. A experiência
 * pública NUNCA quebra por causa do banco: se falhar, usa os defaults.
 */
export const getSettings = cache(async (): Promise<Settings> => {
  if (!isDbConfigured()) return DEFAULT_SETTINGS;
  try {
    const { data, error } = await vipDb().from("settings").select("key, value");
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as { key: string; value: unknown }[];
    const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      business: merge(DEFAULT_SETTINGS.business, byKey.business),
      rules: merge(DEFAULT_SETTINGS.rules, byKey.rules),
      birthday: merge(DEFAULT_SETTINGS.birthday, byKey.birthday),
      whatsapp: merge(DEFAULT_SETTINGS.whatsapp, byKey.whatsapp),
    };
  } catch (e) {
    logServerError("settings.get", e);
    return DEFAULT_SETTINGS;
  }
});
