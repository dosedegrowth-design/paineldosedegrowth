"use server";

import { randomUUID } from "node:crypto";
import { z, ZodError } from "zod";
import { marinaDb } from "@/lib/marina/db";
import { chaveConfere } from "@/lib/marina/queries/briefing";
import {
  FRENTES,
  LIMITES,
  MESES,
  type Anuncio,
  type ArquivoAnuncio,
  type Frente,
  type Mes,
  type Resultado,
} from "@/lib/marina/briefing";
import {
  ACEITA_EXT,
  BUCKET,
  FOTO_MAX_BYTES,
  FOTO_TYPES,
  MAX_ANUNCIOS_MES,
  VIDEO_MAX_BYTES,
  VIDEO_TYPES,
} from "@/lib/marina/config";

/**
 * O briefing da Marina Saleme, respondido pela Bia no link da DDG. Não há
 * login: cada action confere a chave do link antes de tocar em qualquer
 * coisa. Os arquivos vão direto do aparelho para o Storage, no original.
 */

const LINK_INVALIDO = "Esse link não abre mais o formulário. Peça um novo para a DDG.";
const GENERICO = "Deu alguma coisa errada aqui. Tente de novo em instantes.";

class ErroDeRegra extends Error {}

async function exigirChave(k: string) {
  if (!(await chaveConfere(k))) throw new ErroDeRegra(LINK_INVALIDO);
}

async function rodar<T>(escopo: string, fn: () => Promise<T>): Promise<Resultado<T>> {
  try {
    return { ok: true, data: await fn() } as Resultado<T>;
  } catch (e) {
    if (e instanceof ErroDeRegra) return { ok: false, error: e.message };
    if (e instanceof ZodError) return { ok: false, error: e.issues[0]?.message ?? GENERICO };
    console.error(`[marina.${escopo}]`, e);
    return { ok: false, error: GENERICO };
  }
}

const mesSchema = z.enum(MESES);
const uuid = z.string().uuid();
const campos = z.object({
  peca: z.string().max(LIMITES.peca, `A peça passa de ${LIMITES.peca} caracteres.`),
  estampa: z.string().max(LIMITES.estampa, `A estampa passa de ${LIMITES.estampa} caracteres.`),
  legenda: z.string().max(LIMITES.legenda, `A legenda passa de ${LIMITES.legenda} caracteres.`),
  link: z.string().max(LIMITES.link, `O link passa de ${LIMITES.link} caracteres.`),
});

/** NOVO ANÚNCIO, vazio, no fim da lista do mês. */
export async function criarAnuncioAction(input: { k: string; mes: Mes }): Promise<Resultado<Anuncio>> {
  return rodar("criar", async () => {
    await exigirChave(input.k);
    const mes = mesSchema.parse(input.mes);
    const db = marinaDb();
    const { count } = await db
      .from("briefing_anuncios")
      .select("id", { count: "exact", head: true })
      .eq("mes", mes);
    if ((count ?? 0) >= MAX_ANUNCIOS_MES)
      throw new ErroDeRegra(`São ${MAX_ANUNCIOS_MES} anúncios no mês, o limite. Fale com a DDG.`);
    const { data, error } = await db
      .from("briefing_anuncios")
      .insert({ mes, ordem: count ?? 0 })
      .select("id, mes, ordem, peca, estampa, legenda, link")
      .single();
    if (error || !data) throw new Error(error?.message ?? "sem linha");
    return data as Anuncio;
  });
}

/** SALVAR UM ANÚNCIO. Chamada a cada pausa na digitação. */
export async function salvarAnuncioAction(input: {
  k: string;
  id: string;
  dados: unknown;
}): Promise<Resultado<{ salvoEm: string }>> {
  return rodar("salvar", async () => {
    await exigirChave(input.k);
    const id = uuid.parse(input.id);
    const dados = campos.parse(input.dados);
    const salvoEm = new Date().toISOString();
    const { error } = await marinaDb()
      .from("briefing_anuncios")
      .update({ ...dados, updated_at: salvoEm })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { salvoEm };
  });
}

/** APAGAR UM ANÚNCIO. Os arquivos dele saem junto, do banco e do Storage. */
export async function removerAnuncioAction(input: { k: string; id: string }): Promise<Resultado> {
  return rodar("remover", async () => {
    await exigirChave(input.k);
    const id = uuid.parse(input.id);
    const db = marinaDb();
    const { data: arqs } = await db.from("briefing_arquivos").select("storage_path").eq("anuncio_id", id);
    const { error } = await db.from("briefing_anuncios").delete().eq("id", id);
    if (error) throw new Error(error.message);
    const caminhos = ((arqs ?? []) as { storage_path: string }[]).map((a) => a.storage_path);
    if (caminhos.length) await db.storage.from(BUCKET).remove(caminhos);
    return undefined;
  });
}

/** SUBIR ARQUIVO, primeiro tempo: confere tipo e tamanho e devolve o endereço assinado. */
export async function prepararArquivoAction(input: {
  k: string;
  anuncioId: string;
  mime: string;
  bytes: number;
}): Promise<Resultado<{ path: string; signedUrl: string }>> {
  return rodar("preparar", async () => {
    await exigirChave(input.k);
    uuid.parse(input.anuncioId);
    const ext = FOTO_TYPES[input.mime] ?? VIDEO_TYPES[input.mime];
    if (!ext) throw new ErroDeRegra("Mande foto (JPG, PNG, WebP, HEIC) ou vídeo (MP4 ou MOV).");
    const limite = input.mime in VIDEO_TYPES ? VIDEO_MAX_BYTES : FOTO_MAX_BYTES;
    if (!(input.bytes > 0)) throw new ErroDeRegra("Esse arquivo está vazio.");
    if (input.bytes > limite) {
      throw new ErroDeRegra(
        `Esse arquivo tem ${(input.bytes / 1024 / 1024).toFixed(0)} MB e o limite é ${limite / 1024 / 1024} MB.`,
      );
    }
    const path = `briefing/${randomUUID()}.${ext}`;
    const { data, error } = await marinaDb().storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw new Error(`storage: ${error?.message ?? "sem endereço"}`);
    return { path, signedUrl: data.signedUrl };
  });
}

const nomeArquivo = (n: string) =>
  n
    .replace(/[\u0000-\u001f\\/]/g, "")
    .trim()
    .slice(0, 160) || "arquivo";

/** SUBIR ARQUIVO, segundo tempo: já está no Storage; aqui ele entra na lista do anúncio. */
export async function registrarArquivoAction(input: {
  k: string;
  anuncioId: string;
  path: string;
  mime: string;
  bytes: number;
  nome: string;
}): Promise<Resultado<ArquivoAnuncio>> {
  return rodar("registrar", async () => {
    await exigirChave(input.k);
    const anuncioId = uuid.parse(input.anuncioId);
    if (!(input.mime in FOTO_TYPES) && !(input.mime in VIDEO_TYPES)) throw new ErroDeRegra("Tipo de arquivo não aceito.");
    // só um caminho que este formulário acabou de assinar
    if (!new RegExp(`^briefing/[0-9a-f-]{36}\\.(${ACEITA_EXT})$`).test(input.path)) {
      throw new ErroDeRegra("Envio inválido. Tente de novo.");
    }
    const db = marinaDb();
    const { data: pub } = db.storage.from(BUCKET).getPublicUrl(input.path);
    const { data, error } = await db
      .from("briefing_arquivos")
      .insert({
        anuncio_id: anuncioId,
        storage_path: input.path,
        public_url: pub.publicUrl,
        nome: nomeArquivo(input.nome),
        mime: input.mime,
        bytes: Number.isFinite(input.bytes) ? Math.round(input.bytes) : null,
      })
      .select("id, anuncio_id, public_url, nome, mime, bytes")
      .single();
    if (error || !data) {
      await db.storage.from(BUCKET).remove([input.path]);
      throw new Error(error?.message ?? "sem linha");
    }
    const a = data as {
      id: string;
      anuncio_id: string;
      public_url: string;
      nome: string;
      mime: string;
      bytes: number | null;
    };
    return { id: a.id, anuncioId: a.anuncio_id, url: a.public_url, nome: a.nome, mime: a.mime, bytes: a.bytes };
  });
}

/** Tirar um arquivo que subiu errado: sai da lista e do Storage. */
export async function removerArquivoAction(input: { k: string; id: string }): Promise<Resultado> {
  return rodar("remover-arquivo", async () => {
    await exigirChave(input.k);
    const db = marinaDb();
    const { data, error } = await db
      .from("briefing_arquivos")
      .delete()
      .eq("id", uuid.parse(input.id))
      .select("storage_path")
      .maybeSingle();
    if (error) throw new Error(error.message);
    const path = (data as { storage_path: string } | null)?.storage_path;
    if (path) await db.storage.from(BUCKET).remove([path]);
    return undefined;
  });
}

/** ENVIAR: marca a hora. A Bia continua podendo mexer em tudo depois. */
export async function enviarBriefingMarinaAction(input: { k: string }): Promise<Resultado<{ enviadoEm: string }>> {
  return rodar("enviar", async () => {
    await exigirChave(input.k);
    const enviadoEm = new Date().toISOString();
    const { error } = await marinaDb()
      .from("briefing_config")
      .upsert({ chave: "_envio", dados: { enviado_em: enviadoEm }, updated_at: enviadoEm });
    if (error) throw new Error(error.message);
    return { enviadoEm };
  });
}

/** MOVER uma foto de uma frente para a outra (tela de organizar). */
export async function moverArquivoAction(input: {
  k: string;
  id: string;
  frente: Frente;
}): Promise<Resultado> {
  return rodar("mover", async () => {
    await exigirChave(input.k);
    const id = uuid.parse(input.id);
    const frente = z.enum(FRENTES).parse(input.frente);
    const { error } = await marinaDb()
      .from("briefing_arquivos")
      .update({ frente, fora: false })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return undefined;
  });
}

/**
 * TIRAR ou DEVOLVER uma foto. Tirar não apaga nada: a imagem sai das duas
 * listas e fica na gaveta, de onde dá para devolver.
 */
export async function guardarArquivoAction(input: {
  k: string;
  id: string;
  fora: boolean;
}): Promise<Resultado> {
  return rodar("guardar", async () => {
    await exigirChave(input.k);
    const id = uuid.parse(input.id);
    const fora = z.boolean().parse(input.fora);
    const { error } = await marinaDb().from("briefing_arquivos").update({ fora }).eq("id", id);
    if (error) throw new Error(error.message);
    return undefined;
  });
}

/** TERMINEI DE ORGANIZAR: marca a hora para a DDG saber que pode montar. */
export async function organizadoMarinaAction(input: { k: string }): Promise<Resultado<{ organizadoEm: string }>> {
  return rodar("organizado", async () => {
    await exigirChave(input.k);
    const organizadoEm = new Date().toISOString();
    const { error } = await marinaDb()
      .from("briefing_config")
      .upsert({ chave: "_organizado", dados: { organizado_em: organizadoEm }, updated_at: organizadoEm });
    if (error) throw new Error(error.message);
    return { organizadoEm };
  });
}
