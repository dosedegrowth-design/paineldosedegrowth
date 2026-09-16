import "server-only";
import { cache } from "react";
import { vipDb, isDbConfigured, logServerError } from "@/lib/tayssa/db";
import type { PhotoRow } from "@/lib/tayssa/types";

/**
 * A biblioteca é uma só. Quem consome (site, cartão, herói) recebe a
 * lista pronta e decide a composição; a Tayssa só decide o conteúdo.
 * Falha de banco não derruba o site público: devolve vazio.
 */
export const getPhotoLibrary = cache(async (): Promise<PhotoRow[]> => {
  if (!isDbConfigured()) return [];
  try {
    const { data, error } = await vipDb()
      .from("photos")
      .select("*")
      .eq("status", "active")
      .order("featured", { ascending: false })
      .order("sort_order")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as PhotoRow[];
  } catch (e) {
    logServerError("photos.library", e);
    return [];
  }
});

/** Admin: tudo, inclusive arquivadas. */
export const listAllPhotos = cache(async (): Promise<PhotoRow[]> => {
  const { data, error } = await vipDb()
    .from("photos")
    .select("*")
    .order("status")
    .order("featured", { ascending: false })
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as PhotoRow[];
});

/** Estilos existentes, para a Tayssa reaproveitar o nome em vez de digitar de novo. */
export function lashStyles(photos: PhotoRow[]): string[] {
  const seen = new Map<string, number>();
  for (const p of photos) seen.set(p.lash_style, (seen.get(p.lash_style) ?? 0) + 1);
  return [...seen.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
}
