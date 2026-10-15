"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminAddPhotoAction } from "@/lib/tayssa/actions/photos";
import { PHOTO_MAX_BYTES } from "@/lib/tayssa/config";
import type { ActionResult } from "@/lib/tayssa/types";
import { Campo, Marcar } from "@/components/tayssa/admin/forms";
import { Icone } from "@/components/tayssa/admin/icons";

type R = ActionResult<{ id: string }>;

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/**
 * Até onde o nome de um volume aparece inteiro dentro do chip no celular
 * (a medida está no `.tya-sugs .tya-chip` do admin.css). O banco aceita 80
 * caracteres, então o que passar disto termina em reticências.
 */
const CHIP_CARACTERES = 34;

/**
 * Os atalhos de nome, na ordem em que a tela mostra. Os seis mais usados
 * continuam sendo os seis — isso é o que ela reconhece —, mas a fila leva
 * primeiro os nomes que cabem inteiros e deixa os compridos no fim, onde o
 * corte custa menos. A ordenação é estável: dentro de cada grupo a ordem de
 * uso se mantém. Nome comprido não é descartado: o botão carrega o nome
 * inteiro no `title` e no texto, então nada se perde no corte.
 */
function atalhos(styles: string[]): string[] {
  return styles
    .slice(0, 6)
    .sort((a, b) => Number(a.length > CHIP_CARACTERES) - Number(b.length > CHIP_CARACTERES));
}

/**
 * ADICIONAR FOTO. A Tayssa escolhe o arquivo e diz o volume/estilo.
 * O resto — caminho, URL, medidas, onde aparece — é do sistema.
 *
 * O arquivo sobe de verdade para o Storage e a linha é gravada no banco
 * (`adminAddPhotoAction`). Nada aqui é estado de tela: se o envio falhar,
 * o erro aparece e a foto não existe.
 */
export function PhotoUpload({ styles }: { styles: string[] }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<R | null, FormData>(adminAddPhotoAction, null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [style, setStyle] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const err = state && !state.ok ? state : null;
  // Arquivo acima do teto não sobe. O servidor recusaria igual; recusar aqui
  // poupa a rede dela e devolve a resposta na hora.
  const grande = !!file && file.size > PHOTO_MAX_BYTES;

  // sucesso: estado derivado limpa a prévia (durante o render, como o React
  // recomenda) e o efeito cuida do que é externo: o <form> e a rota
  const [seen, setSeen] = useState<R | null>(null);
  if (state !== seen) {
    setSeen(state);
    if (state?.ok) {
      setPreview(null);
      setFile(null);
      setStyle("");
    }
  }
  useEffect(() => {
    if (!state?.ok) return;
    formRef.current?.reset();
    router.refresh();
  }, [state, router]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return (
    <form ref={formRef} action={action} noValidate className="tya-stack" aria-busy={pending || undefined}>
      <label className="tya-drop" data-cheio={preview ? "true" : "false"}>
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" />
            <span className="tya-pill tya-pill--dark tya-drop__troca">Trocar</span>
          </>
        ) : (
          <span className="tya-drop__hint">
            <Icone nome="fotos" />
            <b>Escolher foto</b>
            <span>
              JPG, PNG, WebP ou AVIF · até {PHOTO_MAX_BYTES / 1024 / 1024} MB
              <br />
              Em pé (retrato) é o formato que o site usa.
            </span>
          </span>
        )}
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (preview) URL.revokeObjectURL(preview);
            setPreview(f ? URL.createObjectURL(f) : null);
            setFile(f ? { name: f.name, size: f.size } : null);
          }}
        />
      </label>
      {file ? (
        grande ? (
          <p className="tya-err" style={{ marginTop: -4 }} role="alert">
            {file.name} · {mb(file.size)} — acima do limite de {PHOTO_MAX_BYTES / 1024 / 1024} MB. Escolha uma foto
            menor.
          </p>
        ) : (
          <p className="tya-small" style={{ marginTop: -4 }}>
            {file.name} · {mb(file.size)}
          </p>
        )
      ) : null}

      <div>
        <Campo
          label="Volume / estilo"
          name="lash_style"
          list="tayssa-styles"
          placeholder="ex.: Volume brasileiro"
          required
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          error={err?.field === "lash_style" ? err.error : undefined}
          hint="É por esse nome que a foto encontra o lugar dela no site."
        />
        <datalist id="tayssa-styles">
          {styles.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        {styles.length ? (
          <div className="tya-sugs">
            {atalhos(styles).map((s) => (
              <button
                key={s}
                type="button"
                className="tya-chip"
                title={s}
                data-on={style === s ? "true" : "false"}
                onClick={() => setStyle(s)}
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <Campo label="Legenda (opcional)" name="caption" maxLength={120} placeholder="ex.: Fio a fio, efeito natural" hint="Aparece em mono, embaixo da foto." />
      <Campo label="Descrição para leitores de tela (opcional)" name="alt" maxLength={200} hint="Sem isso, viramos o volume/estilo em descrição." />
      <Marcar name="featured" label="Destaque — põe a foto no começo da fila" />

      {err && (!err.field || err.field === "file") ? (
        <p className="tya-err" role="alert">
          {err.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="tya-ok" role="status">
          Foto adicionada. Ela já vale para o site e para o cartão.
        </p>
      ) : null}

      <div>
        <button type="submit" className="tya-btn tya-btn--primary" disabled={pending || grande}>
          {pending ? "Enviando…" : "Adicionar foto"}
        </button>
      </div>
      {pending ? <span className="tya-skel tya-skel--bar" aria-hidden /> : null}
    </form>
  );
}
