import "server-only";
import { marinaDb } from "@/lib/marina/db";
import type { Link, RespostaSalva } from "@/lib/marina/aprovar";

/** As respostas já dadas num link, para a tela abrir com tudo preenchido. */
export async function getRespostas(link: Link): Promise<RespostaSalva[]> {
  const { data, error } = await marinaDb()
    .from("aprovacoes")
    .select("item_id, resposta, comentario, atualizado_em")
    .eq("link", link);
  if (error || !data) return [];
  return (data as {
    item_id: string;
    resposta: string | null;
    comentario: string | null;
    atualizado_em: string;
  }[]).map((r) => ({
    itemId: r.item_id,
    resposta: r.resposta === "sim" || r.resposta === "nao" ? r.resposta : null,
    comentario: r.comentario ?? "",
    atualizadoEm: r.atualizado_em,
  }));
}
