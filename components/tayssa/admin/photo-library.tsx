"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminArchivePhotoAction, adminDeletePhotoAction, adminUpdatePhotoAction } from "@/lib/tayssa/actions/photos";
import type { PhotoRow } from "@/lib/tayssa/types";
import { dateShort } from "@/lib/tayssa/format";
import { TyButton } from "@/components/tayssa/ui/button";
import { TyInput } from "@/components/tayssa/ui/field";

/**
 * A biblioteca: tudo que a Tayssa subiu, onde cada foto está, e os
 * controles que mudam o site na hora (destaque, arquivar, apagar).
 */
export function PhotoLibrary({ photos, styles }: { photos: PhotoRow[]; styles: string[] }) {
  const active = photos.filter((p) => p.status === "active");
  const archived = photos.filter((p) => p.status === "archived");
  if (!photos.length) {
    return <p className="ty-body" style={{ fontWeight: 300, fontSize: 17 }}>Nenhuma foto ainda. A primeira que você subir vira o herói do site.</p>;
  }
  return (
    <div style={{ display: "grid", gap: 36 }}>
      <Grid title={`${active.length} no ar`} photos={active} styles={styles} />
      {archived.length ? <Grid title={`${archived.length} arquivadas`} photos={archived} styles={styles} muted /> : null}
    </div>
  );
}

function Grid({ title, photos, styles, muted }: { title: string; photos: PhotoRow[]; styles: string[]; muted?: boolean }) {
  return (
    <div>
      <span className="ty-eyebrow" style={{ display: "block", marginBottom: 14 }}>
        {title}
      </span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 18, opacity: muted ? 0.7 : 1 }}>
        {photos.map((p, i) => (
          <PhotoCard key={p.id} photo={p} styles={styles} position={i + 1} />
        ))}
      </div>
    </div>
  );
}

function PhotoCard({ photo, styles, position }: { photo: PhotoRow; styles: string[]; position: number }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [style, setStyle] = useState(photo.lash_style);
  const [caption, setCaption] = useState(photo.caption ?? "");
  const [alt, setAlt] = useState(photo.alt);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      setErr(null);
      const r = await fn();
      if (!r.ok) setErr(r.error ?? "Não deu certo.");
      else {
        setEditing(false);
        router.refresh();
      }
    });

  return (
    <article style={{ display: "grid", gap: 10, border: "1px solid var(--t-line)", borderRadius: 14, padding: 10 }}>
      <div style={{ position: "relative", aspectRatio: "4 / 5", borderRadius: 8, overflow: "hidden", background: "var(--t-photo)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.public_url} alt={photo.alt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <span className="ty-eyebrow" style={{ position: "absolute", top: 8, left: 8, fontSize: 9.5, background: "rgba(16,13,11,0.7)", color: "#f1eae1", padding: "4px 7px", borderRadius: 999 }}>
          {photo.featured ? "★ destaque" : `#${position}`}
        </span>
      </div>
      {editing ? (
        <div style={{ display: "grid", gap: 12 }}>
          <TyInput label="Volume / estilo" name={`style-${photo.id}`} list="tayssa-styles-lib" value={style} onChange={(e) => setStyle(e.target.value)} />
          <datalist id="tayssa-styles-lib">
            {styles.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <TyInput label="Legenda" name={`caption-${photo.id}`} value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={120} />
          <TyInput label="Descrição (leitores de tela)" name={`alt-${photo.id}`} value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={200} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <TyButton
              size="xs"
              variant="solid"
              disabled={pending}
              onClick={() =>
                run(() => adminUpdatePhotoAction({ id: photo.id, lash_style: style, caption, alt, featured: photo.featured, sort_order: photo.sort_order }))
              }
            >
              Salvar
            </TyButton>
            <TyButton size="xs" onClick={() => setEditing(false)} disabled={pending}>
              Cancelar
            </TyButton>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 4 }}>
          <strong style={{ fontSize: 14, fontWeight: 600 }}>{photo.lash_style}</strong>
          <span className="ty-small">{photo.caption ?? "sem legenda"}</span>
          <span className="ty-small" style={{ opacity: 0.7 }}>
            {photo.width && photo.height ? `${photo.width}×${photo.height} · ` : ""}
            {dateShort(photo.created_at)}
          </span>
        </div>
      )}
      {!editing ? (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <TyButton size="xs" onClick={() => setEditing(true)} disabled={pending}>
            Editar
          </TyButton>
          <TyButton
            size="xs"
            disabled={pending}
            onClick={() =>
              run(() => adminUpdatePhotoAction({ id: photo.id, lash_style: photo.lash_style, caption: photo.caption ?? "", alt: photo.alt, featured: !photo.featured, sort_order: photo.sort_order }))
            }
          >
            {photo.featured ? "Tirar destaque" : "Destacar"}
          </TyButton>
          <TyButton size="xs" disabled={pending} onClick={() => run(() => adminArchivePhotoAction({ id: photo.id, archived: photo.status === "active" }))}>
            {photo.status === "active" ? "Arquivar" : "Restaurar"}
          </TyButton>
          <TyButton
            size="xs"
            variant="accent"
            disabled={pending}
            onClick={() => {
              if (window.confirm("Apagar esta foto de vez? Ela some do site, do cartão e do bucket.")) run(() => adminDeletePhotoAction({ id: photo.id }));
            }}
          >
            Apagar
          </TyButton>
        </div>
      ) : null}
      {err ? <span className="ty-field__error">{err}</span> : null}
    </article>
  );
}
