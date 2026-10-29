import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { marinaDb } from "@/lib/marina/db";
import type { Anuncio, ArquivoAnuncio, Mes } from "@/lib/marina/briefing";

/**
 * A chave do link (?k=) confere com o hash guardado em
 * marina_saleme.briefing_config, linha '_acesso'. Sem a linha, ninguém
 * entra: o formulário só existe depois que a DDG gera o link.
 */
export async function chaveConfere(k: string | null | undefined): Promise<boolean> {
  if (!k || k.length < 16 || k.length > 200) return false;
  const { data } = await marinaDb()
    .from("briefing_config")
    .select("dados")
    .eq("chave", "_acesso")
    .maybeSingle();
  const guardado = (data as { dados: { chave_hash?: string } } | null)?.dados?.chave_hash;
  if (!guardado) return false;
  const a = Buffer.from(createHash("sha256").update(k).digest("hex"));
  const b = Buffer.from(guardado);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type BriefingMarina = {
  anuncios: Anuncio[];
  arquivos: ArquivoAnuncio[];
  enviadoEm: string | null;
};

export async function getBriefingMarina(): Promise<BriefingMarina> {
  const db = marinaDb();
  const [anunciosR, arquivosR, configR] = await Promise.all([
    db
      .from("briefing_anuncios")
      .select("id, mes, ordem, peca, estampa, legenda, link")
      .order("mes")
      .order("ordem")
      .order("created_at"),
    db
      .from("briefing_arquivos")
      .select("id, anuncio_id, public_url, nome, mime, bytes")
      .order("created_at"),
    db.from("briefing_config").select("dados").eq("chave", "_envio").maybeSingle(),
  ]);
  for (const r of [anunciosR, arquivosR]) {
    if (r.error) throw new Error(r.error.message);
  }

  const anuncios = ((anunciosR.data ?? []) as (Anuncio & { mes: string })[]).map((a) => ({
    id: a.id,
    mes: a.mes as Mes,
    ordem: a.ordem,
    peca: a.peca,
    estampa: a.estampa,
    legenda: a.legenda,
    link: a.link,
  }));

  const arquivos = (
    (arquivosR.data ?? []) as {
      id: string;
      anuncio_id: string;
      public_url: string;
      nome: string;
      mime: string;
      bytes: number | null;
    }[]
  ).map((f) => ({
    id: f.id,
    anuncioId: f.anuncio_id,
    url: f.public_url,
    nome: f.nome,
    mime: f.mime,
    bytes: f.bytes,
  }));

  const enviadoEm =
    ((configR.data as { dados: { enviado_em?: string } } | null)?.dados?.enviado_em as string) ?? null;

  return { anuncios, arquivos, enviadoEm };
}
