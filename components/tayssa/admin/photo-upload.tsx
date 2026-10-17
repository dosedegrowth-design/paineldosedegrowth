"use client";

import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { adminPrepareMediaUploadAction, adminSaveToGalleryAction } from "@/lib/tayssa/actions/photos";
import { PHOTO_MAX_BYTES, PHOTO_TYPES, VIDEO_MAX_BYTES, VIDEO_TYPES } from "@/lib/tayssa/config";
import { Icone } from "@/components/tayssa/admin/icons";

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const ACEITA = [...Object.keys(PHOTO_TYPES), ...Object.keys(VIDEO_TYPES)].join(",");
/** quantos arquivos sobem ao mesmo tempo: rápido sem engasgar o celular */
const SIMULTANEOS = 3;

type Linha = { id: number; nome: string; bytes: number; estado: "fila" | "enviando" | "ok" | "erro"; progresso: number; erro?: string };

/** Largura e altura reais, lidas no aparelho (o servidor não abre o arquivo). */
function medir(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((ok) => {
    const url = URL.createObjectURL(file);
    const fim = (v: { width: number; height: number } | null) => {
      URL.revokeObjectURL(url);
      ok(v);
    };
    if (file.type in VIDEO_TYPES) {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => fim({ width: v.videoWidth, height: v.videoHeight });
      v.onerror = () => fim(null);
      v.src = url;
    } else {
      const i = new Image();
      i.onload = () => fim({ width: i.naturalWidth, height: i.naturalHeight });
      i.onerror = () => fim(null);
      i.src = url;
    }
  });
}

/** PUT direto no Storage com o endereço assinado: o arquivo vai como está. */
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
 * SUBIR PARA A GALERIA. Quantos arquivos ela quiser de uma vez — fotos e
 * vídeos, no original, sem compressão. Nada vai para o site aqui: a galeria
 * guarda, e ela publica depois, com categoria, produto e enquadramento.
 */
export function PhotoUpload() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [arrastando, setArrastando] = useState(false);
  const [rodando, setRodando] = useState(false);

  const atualizar = (id: number, mudanca: Partial<Linha>) =>
    setLinhas((ls) => ls.map((l) => (l.id === id ? { ...l, ...mudanca } : l)));

  const subirUm = async (id: number, file: File) => {
    const video = file.type in VIDEO_TYPES;
    if (!(file.type in PHOTO_TYPES) && !video) return atualizar(id, { estado: "erro", erro: "Tipo não aceito" });
    const limite = video ? VIDEO_MAX_BYTES : PHOTO_MAX_BYTES;
    if (file.size > limite) return atualizar(id, { estado: "erro", erro: `Acima de ${limite / 1024 / 1024} MB` });
    try {
      atualizar(id, { estado: "enviando", progresso: 0 });
      const prep = await adminPrepareMediaUploadAction({ mime: file.type, bytes: file.size });
      if (!prep.ok) return atualizar(id, { estado: "erro", erro: prep.error });
      await enviar(prep.data.signedUrl, file, (p) => atualizar(id, { progresso: p }));
      const tam = await medir(file);
      const r = await adminSaveToGalleryAction({
        path: prep.data.path,
        mime: file.type,
        bytes: file.size,
        original_name: file.name,
        width: tam?.width ?? null,
        height: tam?.height ?? null,
      });
      atualizar(id, r.ok ? { estado: "ok", progresso: 1 } : { estado: "erro", erro: r.error });
    } catch {
      atualizar(id, { estado: "erro", erro: "O envio caiu. Tente de novo." });
    }
  };

  const comecar = async (files: File[]) => {
    if (!files.length) return;
    const base = Date.now();
    const novas = files.map((f, i) => ({ id: base + i, nome: f.name, bytes: f.size, estado: "fila" as const, progresso: 0 }));
    setLinhas((ls) => [...novas, ...ls].slice(0, 400));
    setRodando(true);
    let proximo = 0;
    let feitos = 0;
    const trabalhador = async () => {
      while (proximo < files.length) {
        const i = proximo++;
        await subirUm(novas[i].id, files[i]);
        // a galeria aparece enchendo, sem esperar o lote inteiro
        if (++feitos % 12 === 0) router.refresh();
      }
    };
    await Promise.all(Array.from({ length: Math.min(SIMULTANEOS, files.length) }, trabalhador));
    setRodando(false);
    router.refresh();
  };

  const soltar = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setArrastando(false);
    void comecar([...e.dataTransfer.files]);
  };

  const ok = linhas.filter((l) => l.estado === "ok").length;
  const erros = linhas.filter((l) => l.estado === "erro").length;
  const total = linhas.length;

  return (
    <div className="tya-stack">
      <label
        className="tya-drop tya-drop--lote"
        data-arrastando={arrastando ? "true" : "false"}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={soltar}
      >
        <span className="tya-drop__hint">
          <Icone nome="fotos" />
          <b>{arrastando ? "Pode soltar" : "Escolher fotos e vídeos"}</b>
          <span>
            Quantos quiser de uma vez, no arquivo original. Foto até {PHOTO_MAX_BYTES / 1024 / 1024} MB, vídeo até{" "}
            {VIDEO_MAX_BYTES / 1024 / 1024} MB.
          </span>
        </span>
        <input
          ref={input}
          type="file"
          multiple
          accept={ACEITA}
          onChange={(e) => {
            void comecar([...(e.target.files ?? [])]);
            e.target.value = "";
          }}
        />
      </label>

      {total ? (
        <div className="tya-lote" aria-live="polite">
          <p className="tya-lote__resumo">
            {rodando ? "Enviando: " : ""}
            {ok} de {total} na galeria{erros ? `, ${erros} com problema` : ""}.
          </p>
          <span className="tya-progresso" aria-hidden>
            <i style={{ transform: `scaleX(${total ? (ok + erros) / total : 0})` }} />
          </span>
          <ul className="tya-lote__lista">
            {linhas.slice(0, 60).map((l) => (
              <li key={l.id} data-estado={l.estado}>
                <span className="tya-lote__nome">{l.nome}</span>
                <span className="tya-lote__estado">
                  {l.estado === "fila"
                    ? "na fila"
                    : l.estado === "enviando"
                      ? `${Math.round(l.progresso * 100)}%`
                      : l.estado === "ok"
                        ? `${mb(l.bytes)} guardado`
                        : l.erro}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
