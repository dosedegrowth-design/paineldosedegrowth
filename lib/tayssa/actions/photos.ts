"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { vipDb } from "@/lib/tayssa/db";
import { assertAdmin } from "@/lib/tayssa/auth/guards";
import { logAudit } from "@/lib/tayssa/audit";
import { PHOTO_BUCKET, PHOTO_MAX_BYTES, PHOTO_TYPES, ROUTES } from "@/lib/tayssa/config";
import { imageSize } from "@/lib/tayssa/image-size";
import { photoMetaSchema } from "@/lib/tayssa/validation";
import { BusinessError, bool, runAction, str } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult, PhotoRow } from "@/lib/tayssa/types";

function revalidatePhotos() {
  // a foto entra em todos os consumidores de uma vez
  revalidatePath(ROUTES.home);
  revalidatePath(ROUTES.admin, "layout");
  revalidatePath(ROUTES.vip, "layout");
}

/**
 * ADICIONAR FOTO: um upload, um registro, e a imagem já existe para o
 * site, o cartão e o que vier. A Tayssa dá o volume/estilo; o sistema
 * cuida do resto (caminho, URL, medidas, ordem).
 */
export async function adminAddPhotoAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  return runAction("photos.add", async () => {
    const admin = await assertAdmin();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) throw new BusinessError("Escolha uma foto.", "file");
    const ext = PHOTO_TYPES[file.type];
    if (!ext) throw new BusinessError("Use JPG, PNG, WebP ou AVIF.", "file");
    if (file.size > PHOTO_MAX_BYTES) {
      throw new BusinessError(`A foto tem ${(file.size / 1024 / 1024).toFixed(1)} MB. O limite é ${PHOTO_MAX_BYTES / 1024 / 1024} MB.`, "file");
    }
    const meta = photoMetaSchema.parse({
      lash_style: str(formData, "lash_style"),
      caption: str(formData, "caption"),
      alt: str(formData, "alt"),
      featured: bool(formData, "featured"),
    });

    const buf = Buffer.from(await file.arrayBuffer());
    const size = imageSize(buf);
    const path = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;
    const db = vipDb();
    const { error: upErr } = await db.storage
      .from(PHOTO_BUCKET)
      .upload(path, buf, { contentType: file.type, upsert: false, cacheControl: "31536000" });
    if (upErr) throw new Error(`storage: ${upErr.message}`);
    const { data: pub } = db.storage.from(PHOTO_BUCKET).getPublicUrl(path);

    const { data: created, error } = await db
      .from("photos")
      .insert({
        storage_path: path,
        public_url: pub.publicUrl,
        lash_style: meta.lash_style,
        caption: meta.caption,
        alt: meta.alt ?? `${meta.lash_style} — trabalho da Tayssa`,
        width: size?.width ?? null,
        height: size?.height ?? null,
        featured: Boolean(meta.featured),
        status: "active",
        sort_order: 0,
        created_by: admin.id,
      })
      .select("id")
      .single();
    if (error) {
      // não deixa arquivo órfão no bucket
      await db.storage.from(PHOTO_BUCKET).remove([path]);
      throw new Error(error.message);
    }
    const id = (created as { id: string }).id;
    await logAudit({
      actorId: admin.id,
      actorRole: "admin",
      action: "photo_added",
      entityType: "photo",
      entityId: id,
      meta: { lash_style: meta.lash_style, bytes: file.size, width: size?.width, height: size?.height },
    });
    revalidatePhotos();
    return { id };
  });
}

export async function adminUpdatePhotoAction(input: {
  id: string;
  lash_style: string;
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
