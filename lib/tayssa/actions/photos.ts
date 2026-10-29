"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { vipDb } from "@/lib/tayssa/db";
import { assertAdmin } from "@/lib/tayssa/auth/guards";
import { logAudit } from "@/lib/tayssa/audit";
import { PHOTO_BUCKET, PHOTO_MAX_BYTES, PHOTO_TYPES, ROUTES, VIDEO_MAX_BYTES, VIDEO_TYPES } from "@/lib/tayssa/config";
import { precoField, enquadramentoSchema, photoMetaSchema } from "@/lib/tayssa/validation";
import { BusinessError, runAction } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult, PhotoRow } from "@/lib/tayssa/types";

function revalidatePhotos() {
  // a foto entra em todos os consumidores de uma vez
  revalidatePath(ROUTES.home);
  revalidatePath(ROUTES.admin, "layout");
  revalidatePath(ROUTES.vip, "layout");
}

/**
 * ADICIONAR FOTO OU VÍDEO, em dois tempos. O arquivo não passa pelo
 * servidor do site (o limite de corpo da Vercel é 4,5 MB e vídeo passa
 * disso): o painel pede aqui um endereço assinado, manda o arquivo direto
 * para o Storage e depois registra a mídia com categoria e produto.
 */
export async function adminPrepareMediaUploadAction(input: {
  mime: string;
  bytes: number;
}): Promise<ActionResult<{ path: string; signedUrl: string }>> {
  return runAction("photos.prepare", async () => {
    await assertAdmin();
    const ehVideo = input.mime in VIDEO_TYPES;
    const ext = PHOTO_TYPES[input.mime] ?? VIDEO_TYPES[input.mime];
    if (!ext) throw new BusinessError("Use foto JPG, PNG, WebP ou AVIF, ou vídeo MP4, MOV ou WebM.", "file");
    const limite = ehVideo ? VIDEO_MAX_BYTES : PHOTO_MAX_BYTES;
    if (!(input.bytes > 0)) throw new BusinessError("Escolha um arquivo.", "file");
    if (input.bytes > limite) {
      throw new BusinessError(
        `O arquivo tem ${(input.bytes / 1024 / 1024).toFixed(1)} MB. O limite é ${limite / 1024 / 1024} MB${ehVideo ? " para vídeo" : ""}.`,
        "file"
      );
    }
    const path = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;
    const { data, error } = await vipDb().storage.from(PHOTO_BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw new Error(`storage: ${error?.message ?? "sem endereço"}`);
    return { path, signedUrl: data.signedUrl };
  });
}

/** Os nomes de arquivo viram texto seguro para guardar e baixar de volta. */
const nomeArquivo = (n: string) =>
  n
    .replace(/[\u0000-\u001f\\/]/g, "")
    .trim()
    .slice(0, 160) || "arquivo";

/**
 * GUARDAR NA GALERIA: o arquivo já está no Storage, original; aqui ele ganha
 * a linha no banco com nome, tamanho, tipo e medidas. Ainda não vai ao site.
 */
export async function adminSaveToGalleryAction(input: {
  path: string;
  mime: string;
  bytes: number;
  original_name: string;
  width?: number | null;
  height?: number | null;
}): Promise<ActionResult<{ id: string }>> {
  return runAction("photos.gallery", async () => {
    const admin = await assertAdmin();
    const ehVideo = input.mime in VIDEO_TYPES;
    if (!(input.mime in PHOTO_TYPES) && !ehVideo) throw new BusinessError("Tipo de arquivo não aceito.", "file");
    // o caminho tem de ser um que este painel acabou de assinar: ano/uuid.ext
    if (!/^\d{4}\/[0-9a-f-]{36}\.(jpg|png|webp|avif|mp4|webm|mov)$/.test(input.path)) {
      throw new BusinessError("Envio inválido. Tente de novo.", "file");
    }
    const db = vipDb();
    const { data: pub } = db.storage.from(PHOTO_BUCKET).getPublicUrl(input.path);
    const medida = (n?: number | null) => (Number.isInteger(n) && (n as number) > 0 && (n as number) < 20000 ? n : null);
    const { data: created, error } = await db
      .from("photos")
      .insert({
        storage_path: input.path,
        public_url: pub.publicUrl,
        lash_style: "",
        category: "cilios",
        media_type: ehVideo ? "video" : "image",
        alt: "Trabalho da Tayssa",
        width: medida(input.width),
        height: medida(input.height),
        original_name: nomeArquivo(input.original_name),
        bytes: Number.isFinite(input.bytes) ? Math.round(input.bytes) : null,
        mime: input.mime,
        featured: false,
        status: "gallery",
        sort_order: 0,
        created_by: admin.id,
      })
      .select("id")
      .single();
    if (error) {
      // não deixa arquivo órfão no bucket
      await db.storage.from(PHOTO_BUCKET).remove([input.path]);
      throw new Error(error.message);
    }
    const id = (created as { id: string }).id;
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "photo_added",
      entityType: "photo",
      entityId: id,
      meta: { tipo: ehVideo ? "video" : "image", bytes: input.bytes, destino: "galeria" },
    });
    revalidatePath(ROUTES.admin, "layout");
    return { id };
  });
}

/**
 * PUBLICAR: da galeria para o rolo do produto, com o enquadramento que ela
 * escolheu na prévia. Daí o site, o cartão e os serviços já enxergam.
 */
export async function adminPublishMediaAction(input: {
  id: string;
  category: string;
  lash_style: string;
  caption?: string;
  featured?: boolean;
  focus_x?: number;
  focus_y?: number;
  zoom?: number;
  /** valor do produto, quando ela cria um produto novo ao publicar (vazio = sem valor) */
  preco?: string;
}): Promise<ActionResult> {
  return runAction("photos.publish", async () => {
    const admin = await assertAdmin();
    input = { ...input, id: z.string().uuid("Registro inválido").parse(input.id) };
    const meta = photoMetaSchema.parse({
      lash_style: input.lash_style,
      category: input.category,
      caption: input.caption,
      featured: input.featured,
    });
    const quadro = enquadramentoSchema.parse({ focus_x: input.focus_x, focus_y: input.focus_y, zoom: input.zoom });
    const db = vipDb();
    const { data } = await db.from("photos").select("id, published_at").eq("id", input.id).maybeSingle();
    if (!data) throw new BusinessError("Item não encontrado.");
    const { error } = await db
      .from("photos")
      .update({
        lash_style: meta.lash_style,
        category: meta.category,
        caption: meta.caption,
        alt: `${meta.lash_style} — trabalho da Tayssa`,
        featured: Boolean(meta.featured),
        ...quadro,
        status: "active",
        published_at: (data as { published_at: string | null }).published_at ?? new Date().toISOString(),
      })
      .eq("id", input.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "photo_updated",
      entityType: "photo",
      entityId: input.id,
      meta: { publicado: true, category: meta.category, produto: meta.lash_style },
    });
    if (input.preco !== undefined) await salvarPreco(meta.category, meta.lash_style, input.preco);
    revalidatePhotos();
    return undefined;
  });
}

export async function adminUpdatePhotoAction(input: {
  id: string;
  lash_style: string;
  category?: string;
  focus_x?: number;
  focus_y?: number;
  zoom?: number;
  caption?: string;
  alt?: string;
  featured?: boolean;
  sort_order?: number;
}): Promise<ActionResult> {
  return runAction("photos.update", async () => {
    const admin = await assertAdmin();
    input = {
      ...input,
      id: z.string().uuid("Registro inválido").parse(input.id),
      sort_order: z.number().int().min(-100000).max(100000).optional().parse(input.sort_order),
    };
    const meta = photoMetaSchema.parse(input);
    const quadro =
      input.zoom === undefined ? {} : enquadramentoSchema.parse({ focus_x: input.focus_x, focus_y: input.focus_y, zoom: input.zoom });
    const db = vipDb();
    const { data } = await db.from("photos").select("id").eq("id", input.id).maybeSingle();
    if (!data) throw new BusinessError("Foto não encontrada.");
    const { error } = await db
      .from("photos")
      .update({
        lash_style: meta.lash_style,
        category: meta.category,
        caption: meta.caption,
        ...quadro,
        alt: meta.alt ?? `${meta.lash_style} — trabalho da Tayssa`,
        featured: Boolean(meta.featured),
        sort_order: Number.isInteger(input.sort_order) ? input.sort_order : 0,
      })
      .eq("id", input.id);
    if (error) throw new Error(error.message);
    await logAudit({ actorId: admin.id, actorRole: "admin", action: "photo_updated", entityType: "photo", entityId: input.id });
    revalidatePhotos();
    return undefined;
  });
}

/** Tirar do site devolve à galeria (com categoria, produto e enquadramento); voltar publica de novo. */
export async function adminArchivePhotoAction(input: { id: string; archived: boolean }): Promise<ActionResult> {
  return runAction("photos.archive", async () => {
    const admin = await assertAdmin();
    input = z.object({ id: z.string().uuid("Registro inválido"), archived: z.boolean() }).parse(input);
    const { error } = await vipDb()
      .from("photos")
      .update({ status: input.archived ? "gallery" : "active" })
      .eq("id", input.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: input.archived ? "photo_archived" : "photo_restored",
      entityType: "photo",
      entityId: input.id,
    });
    revalidatePhotos();
    return undefined;
  });
}

/**
 * Apagar de verdade: some do bucket e do banco. Foto que veio do formulário
 * da Tayssa (`briefing/…`) é o próprio arquivo que ela mandou: sai só da
 * Mídia, o original continua no formulário.
 */
export async function adminDeletePhotoAction(input: { id: string }): Promise<ActionResult> {
  return runAction("photos.delete", async () => {
    const admin = await assertAdmin();
    input = { id: z.string().uuid("Registro inválido").parse(input.id) };
    const db = vipDb();
    const { data } = await db.from("photos").select("*").eq("id", input.id).maybeSingle();
    const photo = data as PhotoRow | null;
    if (!photo) throw new BusinessError("Foto não encontrada.");
    if (!photo.storage_path.startsWith("briefing/")) {
      const { error: rmErr } = await db.storage.from(PHOTO_BUCKET).remove([photo.storage_path]);
      if (rmErr) throw new Error(`storage: ${rmErr.message}`);
    }
    const { error } = await db.from("photos").delete().eq("id", input.id);
    if (error) throw new Error(error.message);
    await logAudit({ actorId: admin.id, actorRole: "admin", action: "photo_deleted", entityType: "photo", entityId: input.id, meta: { lash_style: photo.lash_style } });
    revalidatePhotos();
    return undefined;
  });
}

/** Grava (ou apaga, se vazio) o valor de um produto. */
async function salvarPreco(categoria: string, nome: string, bruto: string) {
  const preco = precoField.parse(bruto);
  const { error } = await vipDb()
    .from("produtos")
    .upsert({ categoria, nome: nome.trim(), preco }, { onConflict: "categoria,nome" });
  if (error) throw new Error(error.message);
}

/**
 * Valor de um produto da galeria ("Volume inglês" etc.). Aparece no
 * catálogo do site e na folha de agendar; vazio = o site não mostra valor.
 */
export async function adminSalvarPrecoProdutoAction(input: {
  categoria: string;
  nome: string;
  preco: string;
}): Promise<ActionResult> {
  return runAction("photos.preco", async () => {
    const admin = await assertAdmin();
    const { category, lash_style } = photoMetaSchema.parse({ category: input.categoria, lash_style: input.nome });
    await salvarPreco(category, lash_style, input.preco);
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "produto_preco",
      entityType: "produto",
      meta: { categoria: category, produto: lash_style, preco: input.preco },
    });
    revalidatePhotos();
    return undefined;
  });
}

const linkInstagramSchema = z
  .string()
  .trim()
  .max(300)
  .transform((v) => v || null)
  .refine((v) => v === null || /^https:\/\/(www\.)?instagram\.com\/\S+$/.test(v), "Cole o link do post do Instagram (começa com https://www.instagram.com/).");

/**
 * O link da publicação no Instagram (portfólio do site): no visor, "Ver no
 * Instagram" abre o post. Vazio = o botão leva ao perfil.
 */
export async function adminSalvarLinkInstagramAction(input: { id: string; url: string }): Promise<ActionResult> {
  return runAction("photos.instagram", async () => {
    const admin = await assertAdmin();
    input = { ...input, id: z.string().uuid("Registro inválido").parse(input.id) };
    const url = linkInstagramSchema.parse(input.url);
    const { data, error } = await vipDb().from("photos").update({ instagram_url: url }).eq("id", input.id).select("id");
    if (error) throw new Error(error.message);
    if (!data?.length) throw new BusinessError("Mídia não encontrada.");
    await logAudit({ actorId: admin.id, actorRole: "admin", action: "photo_instagram", entityType: "photo", entityId: input.id, meta: { url } });
    revalidatePhotos();
    return undefined;
  });
}
