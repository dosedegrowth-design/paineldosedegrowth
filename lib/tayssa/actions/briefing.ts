"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { vipDb } from "@/lib/tayssa/db";
import { chaveConfere } from "@/lib/tayssa/queries/briefing";
import { PHOTO_BUCKET, PHOTO_MAX_BYTES, PHOTO_TYPES, VIDEO_MAX_BYTES, VIDEO_TYPES } from "@/lib/tayssa/config";
import { TECNICAS, type ArquivoBriefing, type SecaoId, type TipoArquivo } from "@/lib/tayssa/briefing";
import { BusinessError, runAction } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult } from "@/lib/tayssa/types";

/**
 * O briefing da Tayssa, respondido pelo link da DDG. Não há login: cada
 * action confere a chave do link antes de tocar em qualquer coisa. Ela
 * salva parte por parte enquanto digita; os arquivos vão direto do
 * aparelho para o Storage (endereço assinado), no original.
 */

const LINK_INVALIDO = "Esse link não abre mais o formulário. Peça um novo para a DDG.";

async function exigirChave(k: string) {
  if (!(await chaveConfere(k))) throw new BusinessError(LINK_INVALIDO, undefined, "chave");
}

const texto = (max: number) => z.string().max(max, `Até ${max} caracteres.`);

const PARTES = {
  voce: z.object({ nome: texto(80), bio: texto(4000), tempo: texto(80), formacao: texto(2000) }),
  servicos: z.object({
    itens: z
      .array(
        z.object({
          nome: texto(80),
          frase: texto(300),
          diferencial: texto(500),
          duracao: texto(40),
          valor: texto(40),
          mostrarValor: z.boolean(),
        }),
      )
      .max(30),
  }),
  atendimento: z.object({
    dias: z.array(z.number().int().min(0).max(6)).max(7),
    horarios: texto(400),
    antecedencia: texto(80),
    sinal: texto(40),
    pix: texto(120),
    pagamentos: z.array(texto(40)).max(8),
    atraso: texto(2000),
    endereco: texto(300),
    mostrarEndereco: z.enum(["", "completo", "bairro", "nao"]),
  }),
  midia: z.object({ drive: texto(500) }),
  depoimentos: z.object({
    itens: z.array(z.object({ nome: texto(60), texto: texto(1200), autorizou: z.boolean() })).max(20),
  }),
  vip: z.object({
    beneficios: z.record(
      z.string().max(60),
      z.object({ ok: z.enum(["", "sim", "mudar"]), texto: texto(1000) }),
    ),
  }),
  numeros: z.object({
    periodo: texto(80),
    itens: z.array(z.object({ valor: texto(30), rotulo: texto(80) })).max(6),
  }),
  marca: z.object({ instagram: texto(80), whatsapp: texto(40), logo: z.enum(["", "sim", "nao"]) }),
  final: z.object({ recado: texto(4000) }),
} satisfies Record<SecaoId, z.ZodTypeAny>;

/** SALVAR UMA PARTE. Chamada a cada pausa na digitação e no "Pronto". */
export async function salvarParteBriefingAction(input: {
  k: string;
  secao: SecaoId;
  dados: unknown;
  pronto?: boolean;
}): Promise<ActionResult<{ salvoEm: string }>> {
  return runAction("briefing.salvar", async () => {
    await exigirChave(input.k);
    // Object.hasOwn: "constructor"/"__proto__" não passam por parte do formulário
    if (!Object.hasOwn(PARTES, input.secao)) throw new BusinessError("Parte desconhecida.");
    const schema = PARTES[input.secao];
    const dados = schema.parse(input.dados);
    const salvoEm = new Date().toISOString();
    const { error } = await vipDb()
      .from("briefing")
      .upsert({ secao: input.secao, dados: { ...dados, pronto: Boolean(input.pronto) }, updated_at: salvoEm });
    if (error) throw new Error(error.message);
    return { salvoEm };
  });
}

const TIPOS: TipoArquivo[] = [
  "trabalho",
  "retrato",
  "estudio",
  "flor",
  "video_abertura",
  "video_processo",
  "depoimento",
  "insights",
  "logo",
];

/** SUBIR ARQUIVO, primeiro tempo: confere tipo e tamanho e devolve o endereço assinado. */
export async function prepararArquivoBriefingAction(input: {
  k: string;
  tipo: TipoArquivo;
  mime: string;
  bytes: number;
}): Promise<ActionResult<{ path: string; signedUrl: string }>> {
  return runAction("briefing.preparar", async () => {
    await exigirChave(input.k);
    if (!TIPOS.includes(input.tipo)) throw new BusinessError("Tipo de arquivo desconhecido.");
    const ehVideo = input.mime in VIDEO_TYPES;
    const ext = PHOTO_TYPES[input.mime] ?? VIDEO_TYPES[input.mime];
    if (!ext) throw new BusinessError("Mande foto (JPG, PNG, WebP) ou vídeo (MP4 ou MOV).");
    const limite = ehVideo ? VIDEO_MAX_BYTES : PHOTO_MAX_BYTES;
    if (!(input.bytes > 0)) throw new BusinessError("Esse arquivo está vazio.");
    if (input.bytes > limite) {
      throw new BusinessError(
        `Esse arquivo tem ${(input.bytes / 1024 / 1024).toFixed(0)} MB e o limite é ${limite / 1024 / 1024} MB. Mande pelo link do Google Drive.`,
      );
    }
    const path = `briefing/${randomUUID()}.${ext}`;
    const { data, error } = await vipDb().storage.from(PHOTO_BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw new Error(`storage: ${error?.message ?? "sem endereço"}`);
    return { path, signedUrl: data.signedUrl };
  });
}

const nomeArquivo = (n: string) =>
  n
    .replace(/[\u0000-\u001f\\/]/g, "")
    .trim()
    .slice(0, 160) || "arquivo";

/** SUBIR ARQUIVO, segundo tempo: o arquivo já está no Storage; aqui ele entra na lista. */
export async function registrarArquivoBriefingAction(input: {
  k: string;
  tipo: TipoArquivo;
  path: string;
  mime: string;
  bytes: number;
  nome: string;
}): Promise<ActionResult<ArquivoBriefing>> {
  return runAction("briefing.registrar", async () => {
    await exigirChave(input.k);
    if (!TIPOS.includes(input.tipo)) throw new BusinessError("Tipo de arquivo desconhecido.");
    if (!(input.mime in PHOTO_TYPES) && !(input.mime in VIDEO_TYPES)) throw new BusinessError("Tipo de arquivo não aceito.");
    // só um caminho que este formulário acabou de assinar
    if (!/^briefing\/[0-9a-f-]{36}\.(jpg|png|webp|avif|mp4|webm|mov)$/.test(input.path)) {
      throw new BusinessError("Envio inválido. Tente de novo.");
    }
    const db = vipDb();
    const { data: pub } = db.storage.from(PHOTO_BUCKET).getPublicUrl(input.path);
    const { data, error } = await db
      .from("briefing_arquivos")
      .insert({
        tipo: input.tipo,
        storage_path: input.path,
        public_url: pub.publicUrl,
        nome: nomeArquivo(input.nome),
        mime: input.mime,
        bytes: Number.isFinite(input.bytes) ? Math.round(input.bytes) : null,
      })
      .select("id, tipo, public_url, nome, mime, bytes, tecnica")
      .single();
    if (error || !data) {
      await db.storage.from(PHOTO_BUCKET).remove([input.path]);
      throw new Error(error?.message ?? "sem linha");
    }
    const a = data as { id: string; tipo: TipoArquivo; public_url: string; nome: string; mime: string; bytes: number | null; tecnica: string | null };
    return { id: a.id, tipo: a.tipo, url: a.public_url, nome: a.nome, mime: a.mime, bytes: a.bytes, tecnica: a.tecnica };
  });
}

/** A técnica de uma foto do trabalho. */
export async function tecnicaArquivoBriefingAction(input: {
  k: string;
  id: string;
  tecnica: string;
}): Promise<ActionResult> {
  return runAction("briefing.tecnica", async () => {
    await exigirChave(input.k);
    const tecnica = input.tecnica === "" ? null : (TECNICAS as readonly string[]).includes(input.tecnica) ? input.tecnica : null;
    const { error } = await vipDb().from("briefing_arquivos").update({ tecnica }).eq("id", z.string().uuid().parse(input.id));
    if (error) throw new Error(error.message);
    return undefined;
  });
}

/** Tirar um arquivo que subiu errado: sai da lista e do Storage. */
export async function removerArquivoBriefingAction(input: { k: string; id: string }): Promise<ActionResult> {
  return runAction("briefing.remover", async () => {
    await exigirChave(input.k);
    const db = vipDb();
    const { data, error } = await db
      .from("briefing_arquivos")
      .delete()
      .eq("id", z.string().uuid().parse(input.id))
      .select("storage_path")
      .maybeSingle();
    if (error) throw new Error(error.message);
    const path = (data as { storage_path: string } | null)?.storage_path;
    if (path) await db.storage.from(PHOTO_BUCKET).remove([path]);
    return undefined;
  });
}

/** ENVIAR: marca a hora. Ela continua podendo mudar qualquer resposta depois. */
export async function enviarBriefingAction(input: { k: string }): Promise<ActionResult<{ enviadoEm: string }>> {
  return runAction("briefing.enviar", async () => {
    await exigirChave(input.k);
    const enviadoEm = new Date().toISOString();
    const { error } = await vipDb()
      .from("briefing")
      .upsert({ secao: "_envio", dados: { enviado_em: enviadoEm }, updated_at: enviadoEm });
    if (error) throw new Error(error.message);
    return { enviadoEm };
  });
}
