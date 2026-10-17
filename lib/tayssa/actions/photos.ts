"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { vipDb } from "@/lib/tayssa/db";
import { assertAdmin } from "@/lib/tayssa/auth/guards";
import { logAudit } from "@/lib/tayssa/audit";
import { PHOTO_BUCKET, PHOTO_MAX_BYTES, PHOTO_TYPES, ROUTES, VIDEO_MAX_BYTES, VIDEO_TYPES } from "@/lib/tayssa/config";
import { photoMetaSchema } from "@/lib/tayssa/validation";
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

export async function adminRegisterMediaAction(input: {
  path: string;
  mime: string;
  bytes: number;
  category: string;
  lash_style: string;
  caption?: string;
  featured?: boolean;
  width?: number | null;
  height?: number | null;
}): Promise<ActionResult<{ id: string }>> {
  return runAction("photos.register", async () => {
    const admin = await assertAdmin();
    const meta = photoMetaSchema.parse({
      lash_style: input.lash_style,
      category: input.category,
      caption: input.caption,
      featured: input.featured,
    });
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
        lash_style: meta.lash_style,
        category: meta.category,
        media_type: ehVideo ? "video" : "image",
        caption: meta.caption,
        alt: `${meta.lash_style} — trabalho da Tayssa`,
        width: medida(input.width),
        height: medida(input.height),
        featured: Boolean(meta.featured),
        status: "active",
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
      meta: { category: meta.category, produto: meta.lash_style, tipo: ehVideo ? "video" : "image", bytes: input.bytes },
    });
    revalidatePhotos();
    return { id };
  });
}

export async function adminUpdatePhotoAction(input: {
  id: string;
  lash_style: string;
  category?: string;
  caption?: string;
  alt?: string;
  featured?: boolean;
  sort_order?: number;
}): Promise<ActionResult> {
  return runAction("photos.update", async () => {
    const admin = await assertAdmin();
    const meta = photoMetaSchema.parse(input);
    const db = vipDb();
    const { data } = await db.from("photos").select("id").eq("id", input.id).maybeSingle();
    if (!data) throw new BusinessError("Foto não encontrada.");
    const { error } = await db
      .from("photos")
      .update({
        lash_style: meta.lash_style,
        category: meta.category,
        caption: meta.caption,
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

/** Arquivar tira do site e do cartão sem apagar; restaurar devolve. */
export async function adminArchivePhotoAction(input: { id: string; archived: boolean }): Promise<ActionResult> {
  return runAction("photos.archive", async () => {
    const admin = await assertAdmin();
    const { error } = await vipDb()
      .from("photos")
      .update({ status: input.archived ? "archived" : "active" })
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

/** Apagar de verdade: some do bucket e do banco. */
export async function adminDeletePhotoAction(input: { id: string }): Promise<ActionResult> {
  return runAction("photos.delete", async () => {
    const admin = await assertAdmin();
    const db = vipDb();
    const { data } = await db.from("photos").select("*").eq("id", input.id).maybeSingle();
    const photo = data as PhotoRow | null;
    if (!photo) throw new BusinessError("Foto não encontrada.");
    const { error: rmErr } = await db.storage.from(PHOTO_BUCKET).remove([photo.storage_path]);
    if (rmErr) throw new Error(`storage: ${rmErr.message}`);
    const { error } = await db.from("photos").delete().eq("id", input.id);
    if (error) throw new Error(error.message);
    await logAudit({ actorId: admin.id, actorRole: "admin", action: "photo_deleted", entityType: "photo", entityId: input.id, meta: { lash_style: photo.lash_style } });
    revalidatePhotos();
    return undefined;
  });
}
