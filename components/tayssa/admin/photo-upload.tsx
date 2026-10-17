"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminPrepareMediaUploadAction, adminRegisterMediaAction } from "@/lib/tayssa/actions/photos";
import { PHOTO_MAX_BYTES, PHOTO_TYPES, VIDEO_MAX_BYTES, VIDEO_TYPES } from "@/lib/tayssa/config";
import { CATEGORIAS } from "@/lib/tayssa/catalogo";
import type { CategoriaMidia } from "@/lib/tayssa/types";
import { Campo, Marcar } from "@/components/tayssa/admin/forms";
import { Icone } from "@/components/tayssa/admin/icons";

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const ACEITA = [...Object.keys(PHOTO_TYPES), ...Object.keys(VIDEO_TYPES)].join(",");

/** Até onde o nome de um produto aparece inteiro dentro do chip no celular. */
const CHIP_CARACTERES = 34;
function atalhos(nomes: string[]): string[] {
  return nomes
    .slice(0, 6)
    .sort((a, b) => Number(a.length > CHIP_CARACTERES) - Number(b.length > CHIP_CARACTERES));
}

type Etapa = "parado" | "preparando" | "enviando" | "registrando";

/** Largura e altura reais do arquivo, lidas no aparelho (o servidor não vê o arquivo). */
function medir(url: string, video: boolean): Promise<{ width: number; height: number } | null> {
  return new Promise((ok) => {
    if (video) {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => ok({ width: v.videoWidth, height: v.videoHeight });
      v.onerror = () => ok(null);
      v.src = url;
    } else {
      const i = new Image();
      i.onload = () => ok({ width: i.naturalWidth, height: i.naturalHeight });
      i.onerror = () => ok(null);
      i.src = url;
    }
  });
}

/** PUT direto no Storage com o endereço assinado, contando o progresso. */
function enviar(url: string, file: File, onProgresso: (p: number) => void): Promise<void> {
  return new Promise((ok, falha) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", file.type);
    xhr.setRequestHeader("cache-control", "max-age=31536000");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgresso(e.loaded / e.total);
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? ok() : falha(new Error(`envio ${xhr.status}`)));
    xhr.onerror = () => falha(new Error("rede"));
    xhr.send(file);
  });
}

/**
 * ADICIONAR AO CATÁLOGO. A Tayssa escolhe a categoria (cílios,
 * sobrancelha, boca, pele), diz o produto ("Volume inglês") e sobe foto ou
 * vídeo. O arquivo vai direto do aparelho para o Storage; o painel só
 * registra. Daí o site monta sozinho o rolo daquele produto.
 */
export function PhotoUpload({ produtos }: { produtos: Partial<Record<CategoriaMidia, string[]>> }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [categoria, setCategoria] = useState<CategoriaMidia>("cilios");
  const [produto, setProduto] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<Etapa>("parado");
  const [progresso, setProgresso] = useState(0);
  const [erro, setErro] = useState<{ campo?: string; texto: string } | null>(null);
  const [feito, setFeito] = useState<string | null>(null);

  const video = !!file && file.type in VIDEO_TYPES;
  const limite = video ? VIDEO_MAX_BYTES : PHOTO_MAX_BYTES;
  const grande = !!file && file.size > limite;
  const ocupado = etapa !== "parado";
  const sugestoes = produtos[categoria] ?? [];

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const escolher = (f: File | null) => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
    setErro(null);
    setFeito(null);
  };

  const subir = async (fd: FormData) => {
    setErro(null);
    setFeito(null);
    if (!file) return setErro({ campo: "file", texto: "Escolha uma foto ou um vídeo." });
    if (produto.trim().length < 2) return setErro({ campo: "lash_style", texto: "Diga o produto ou a técnica." });
    if (grande) return;
    try {
      setEtapa("preparando");
      const prep = await adminPrepareMediaUploadAction({ mime: file.type, bytes: file.size });
      if (!prep.ok) {
        setEtapa("parado");
        return setErro({ campo: prep.field, texto: prep.error });
      }
      setEtapa("enviando");
      setProgresso(0);
      await enviar(prep.data.signedUrl, file, setProgresso);
      setEtapa("registrando");
      const tam = preview ? await medir(preview, video) : null;
      const r = await adminRegisterMediaAction({
        path: prep.data.path,
        mime: file.type,
        bytes: file.size,
        category: categoria,
        lash_style: produto,
        caption: String(fd.get("caption") ?? ""),
        featured: fd.get("featured") === "on",
        width: tam?.width ?? null,
        height: tam?.height ?? null,
      });
      setEtapa("parado");
      if (!r.ok) return setErro({ campo: r.field, texto: r.error });
      escolher(null);
      setFeito(`${video ? "Vídeo" : "Foto"} de ${produto.trim()} no ar. O rolo do site já tem.`);
      formRef.current?.reset();
      router.refresh();
    } catch {
      setEtapa("parado");
      setErro({ campo: "file", texto: "O envio caiu no meio. Confira a internet e tente de novo." });
    }
  };

  const textoBotao =
    etapa === "preparando"
      ? "Preparando…"
      : etapa === "enviando"
        ? `Enviando… ${Math.round(progresso * 100)}%`
        : etapa === "registrando"
          ? "Colocando no ar…"
          : video
            ? "Adicionar vídeo"
            : "Adicionar foto";

  return (
    <form
      ref={formRef}
      noValidate
      className="tya-stack"
      aria-busy={ocupado || undefined}
      onSubmit={(e) => {
        e.preventDefault();
        void subir(new FormData(e.currentTarget));
      }}
    >
      <div>
        <span className="tya-label" id="cat-label">
          Categoria
        </span>
        <div className="tya-sugs" role="radiogroup" aria-labelledby="cat-label">
          {CATEGORIAS.map((c) => (
            <button
              key={c.slug}
              type="button"
              role="radio"
              aria-checked={categoria === c.slug}
              className="tya-chip"
              data-on={categoria === c.slug ? "true" : "false"}
              onClick={() => setCategoria(c.slug)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Campo
          label="Produto / técnica"
          name="lash_style"
          list={`tayssa-produtos-${categoria}`}
          placeholder={
            categoria === "cilios"
              ? "ex.: Volume inglês"
              : categoria === "sobrancelha"
                ? "ex.: Design com henna"
                : categoria === "labios"
                  ? "ex.: Lip spa"
                  : categoria === "pele"
                    ? "ex.: Limpeza profunda"
                    : "ex.: Antes e depois"
          }
          required
          value={produto}
          onChange={(e) => setProduto(e.target.value)}
          error={erro?.campo === "lash_style" ? erro.texto : undefined}
          hint="Cada produto vira um rolo no site, com tudo que você subir nele."
        />
        <datalist id={`tayssa-produtos-${categoria}`}>
          {sugestoes.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        {sugestoes.length ? (
          <div className="tya-sugs">
            {atalhos(sugestoes).map((s) => (
              <button
                key={s}
                type="button"
                className="tya-chip"
                title={s}
                data-on={produto === s ? "true" : "false"}
                onClick={() => setProduto(s)}
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <label className="tya-drop" data-cheio={preview ? "true" : "false"}>
        {preview ? (
          <>
            {video ? (
              <video src={preview} muted loop playsInline autoPlay />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" />
            )}
            <span className="tya-pill tya-pill--dark tya-drop__troca">Trocar</span>
          </>
        ) : (
          <span className="tya-drop__hint">
            <Icone nome="fotos" />
            <b>Escolher foto ou vídeo</b>
            <span>
              Foto JPG, PNG, WebP ou AVIF até {PHOTO_MAX_BYTES / 1024 / 1024} MB
              <br />
              Vídeo MP4, MOV ou WebM até {VIDEO_MAX_BYTES / 1024 / 1024} MB · em pé fica melhor
            </span>
          </span>
        )}
        <input type="file" name="file" accept={ACEITA} onChange={(e) => escolher(e.target.files?.[0] ?? null)} />
      </label>
      {file ? (
        grande ? (
          <p className="tya-err" style={{ marginTop: -4 }} role="alert">
            {file.name} · {mb(file.size)} — acima do limite de {limite / 1024 / 1024} MB.
          </p>
        ) : (
          <p className="tya-small" style={{ marginTop: -4 }}>
            {video ? "Vídeo" : "Foto"} · {file.name} · {mb(file.size)}
          </p>
        )
      ) : null}

      <Campo label="Legenda (opcional)" name="caption" maxLength={120} placeholder="ex.: Efeito natural, fio a fio" />
      <Marcar name="featured" label="Destaque — abre o rolo do produto" />

      {erro && erro.campo !== "lash_style" ? (
        <p className="tya-err" role="alert">
          {erro.texto}
        </p>
      ) : null}
      {feito ? (
        <p className="tya-ok" role="status">
          {feito}
        </p>
      ) : null}

      <div>
        <button type="submit" className="tya-btn tya-btn--primary" disabled={ocupado || grande}>
          {textoBotao}
        </button>
      </div>
      {etapa === "enviando" ? (
        <span className="tya-progresso" aria-hidden>
          <i style={{ transform: `scaleX(${progresso})` }} />
        </span>
      ) : ocupado ? (
        <span className="tya-skel tya-skel--bar" aria-hidden />
      ) : null}
    </form>
  );
}
