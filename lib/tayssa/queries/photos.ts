import "server-only";
import { cache } from "react";
import { vipDb, isDbConfigured, logServerError } from "@/lib/tayssa/db";
import type { PhotoRow } from "@/lib/tayssa/types";
import { chavePreco } from "@/lib/tayssa/catalogo";

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

/**
 * As fotos escolhidas como capa dos serviços, pelo id. A capa pode ser uma
 * foto da galeria que não está nos carrosséis, então não vem da biblioteca
 * do site. Falha de banco: nenhuma, e cada serviço usa a primeira foto dele.
 */
export async function getFotosPorIds(ids: string[]): Promise<Record<string, PhotoRow>> {
  const unicos = [...new Set(ids.filter(Boolean))];
  if (!unicos.length || !isDbConfigured()) return {};
  try {
    const { data, error } = await vipDb().from("photos").select("*").in("id", unicos);
    if (error) throw new Error(error.message);
    return Object.fromEntries(((data ?? []) as PhotoRow[]).map((p) => [p.id, p]));
  } catch (e) {
    logServerError("photos.porId", e);
    return {};
  }
}

/** Estilos existentes, para a Tayssa reaproveitar o nome em vez de digitar de novo. */
export function lashStyles(photos: PhotoRow[]): string[] {
  const seen = new Map<string, number>();
  for (const p of photos) seen.set(p.lash_style, (seen.get(p.lash_style) ?? 0) + 1);
  return [...seen.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
}

/**
 * Valor de cada produto da galeria (`vip.produtos`), pela chave
 * "categoria:nome normalizado" — a mesma que agrupa os rolos. Sem a tabela
 * (migração ainda não aplicada) ou sem banco: nenhum valor, e o site só não
 * mostra preço.
 */
export const getPrecosProdutos = cache(async (): Promise<Record<string, number>> => {
  if (!isDbConfigured()) return {};
  try {
    const { data, error } = await vipDb().from("produtos").select("categoria, nome, preco").not("preco", "is", null);
    if (error) throw new Error(error.message);
    const out: Record<string, number> = {};
    for (const r of (data ?? []) as { categoria: string; nome: string; preco: number }[]) {
      out[chavePreco(r.categoria, r.nome)] = Number(r.preco);
    }
    return out;
  } catch (e) {
    logServerError("photos.precos", e);
    return {};
  }
});
