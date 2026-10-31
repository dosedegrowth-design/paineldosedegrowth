import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { marinaDb } from "@/lib/marina/db";
import type { Anuncio, ArquivoAnuncio, Frente, ItemOrganizar, Mes } from "@/lib/marina/briefing";

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

export type OrganizarMarina = {
  itens: ItemOrganizar[];
  organizadoEm: string | null;
};

/**
 * Tudo que a Bia subiu, uma linha por foto ou vídeo, já com o nome da peça
 * onde ela cadastrou. É o que a tela de organizar mostra nas duas colunas.
 */
export async function getOrganizarMarina(): Promise<OrganizarMarina> {
  const db = marinaDb();
  const [arquivosR, anunciosR, configR] = await Promise.all([
    db
      .from("briefing_arquivos")
      .select("id, anuncio_id, public_url, nome, mime, bytes, frente, fora")
      .order("created_at"),
    db.from("briefing_anuncios").select("id, ordem, peca, estampa").order("ordem"),
    db.from("briefing_config").select("dados").eq("chave", "_organizado").maybeSingle(),
  ]);
  for (const r of [arquivosR, anunciosR]) {
    if (r.error) throw new Error(r.error.message);
  }

  const porAnuncio = new Map(
    ((anunciosR.data ?? []) as { id: string; ordem: number; peca: string; estampa: string }[]).map((a) => [a.id, a]),
  );

  const itens = (
    (arquivosR.data ?? []) as {
      id: string;
      anuncio_id: string;
      public_url: string;
      nome: string;
      mime: string;
      bytes: number | null;
      frente: string;
      fora: boolean;
    }[]
  ).map((f) => {
    const a = porAnuncio.get(f.anuncio_id);
    return {
      id: f.id,
      anuncioId: f.anuncio_id,
      url: f.public_url,
      nome: f.nome,
      mime: f.mime,
      bytes: f.bytes,
      frente: f.frente as Frente,
      fora: f.fora,
      // o rótulo que a Bia escreveu à mão vira coluna; sai do nome da peça.
      // Um deles veio sem abrir parêntese ("… seção últimas peças)"), daí o `\(?`
      peca: (a?.peca ?? "")
        .replace(/\s*\(?\s*(?:se[çc][ãa]o\s*)?(?:[úu]ltimas\s+pe[çc]as|novas\s+estampas)\s*\)?\s*$/i, "")
        .trim(),
      estampa: a?.estampa?.trim() ?? "",
      ordem: a?.ordem ?? 0,
    };
  });

  // agrupadas por peça, na ordem em que ela cadastrou
  itens.sort((x, y) => x.ordem - y.ordem);

  const organizadoEm =
    ((configR.data as { dados: { organizado_em?: string } } | null)?.dados?.organizado_em as string) ?? null;

  return { itens, organizadoEm };
}
