"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminAddPhotoAction } from "@/lib/tayssa/actions/photos";
import { PHOTO_MAX_BYTES } from "@/lib/tayssa/config";
import type { ActionResult } from "@/lib/tayssa/types";
import { TyInput } from "@/components/tayssa/ui/field";
import { TyButton } from "@/components/tayssa/ui/button";

type R = ActionResult<{ id: string }>;

/**
 * ADICIONAR FOTO. A Tayssa escolhe o arquivo e diz o volume/estilo.
 * O resto — caminho, URL, medidas, onde aparece — é do sistema.
 */
export function PhotoUpload({ styles }: { styles: string[] }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<R | null, FormData>(adminAddPhotoAction, null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const err = state && !state.ok ? state : null;

  // sucesso: estado derivado limpa a prévia (durante o render, como o React
  // recomenda) e o efeito cuida do que é externo: o <form> e a rota
  const [seen, setSeen] = useState<R | null>(null);
  if (state !== seen) {
    setSeen(state);
    if (state?.ok) {
      setPreview(null);
      setFileName(null);
    }
  }
  useEffect(() => {
    if (!state?.ok) return;
    formRef.current?.reset();
    router.refresh();
  }, [state, router]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return (
    <form ref={formRef} action={action} noValidate style={{ display: "grid", gap: 20, maxWidth: 720 }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(140px, 200px) 1fr", gap: 20, alignItems: "start" }}>
        <label
          className="ty-photo"
          style={{
            aspectRatio: "4 / 5",
            borderRadius: 12,
            overflow: "hidden",
            border: "1px dashed var(--t-line-strong)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            background: "var(--t-photo)",
            position: "relative",
          }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span className="ty-eyebrow" style={{ fontSize: 10, textAlign: "center", padding: 12 }}>
              Escolher foto
              <br />
              <span style={{ opacity: 0.7, letterSpacing: 0.02, textTransform: "none", fontWeight: 400 }}>JPG, PNG, WebP · até {PHOTO_MAX_BYTES / 1024 / 1024} MB</span>
            </span>
          )}
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            required
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (preview) URL.revokeObjectURL(preview);
              setPreview(f ? URL.createObjectURL(f) : null);
              setFileName(f?.name ?? null);
            }}
          />
        </label>
        <div style={{ display: "grid", gap: 18 }}>
          <TyInput
            label="Volume / estilo"
            name="lash_style"
            list="tayssa-styles"
            placeholder="ex.: Volume brasileiro"
            required
            error={err?.field === "lash_style" ? err.error : undefined}
            hint="É por esse nome que a foto encontra o lugar dela no site."
          />
          <datalist id="tayssa-styles">
            {styles.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <TyInput label="Legenda (opcional)" name="caption" maxLength={120} placeholder="ex.: Fio a fio, efeito natural" />
          <TyInput label="Descrição para leitores de tela (opcional)" name="alt" maxLength={200} />
          <label className="ty-check">
            <input type="checkbox" name="featured" />
            <span>Destaque — entra no herói do site e na frente do cartão</span>
          </label>
        </div>
      </div>
      {fileName ? <span className="ty-small">{fileName}</span> : null}
      {err && (!err.field || err.field === "file") ? (
        <div className="ty-form-error" role="alert">
          {err.error}
        </div>
      ) : null}
      {state?.ok ? (
        <div className="ty-form-ok" role="status">
          Foto adicionada. Ela já vale para o site e para o cartão.
        </div>
      ) : null}
      <div>
        <TyButton type="submit" size="sm" variant="solid" arrow disabled={pending}>
          {pending ? "Enviando…" : "Adicionar foto"}
        </TyButton>
      </div>
    </form>
  );
}
