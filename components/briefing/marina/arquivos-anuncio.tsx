"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  prepararArquivoAction,
  registrarArquivoAction,
  removerArquivoAction,
} from "@/lib/marina/actions/briefing";
import { ehVideo, peso, type ArquivoAnuncio } from "@/lib/marina/briefing";
import { ACEITA } from "@/lib/marina/config";

/** quantos sobem ao mesmo tempo: rápido sem engasgar o celular */
const SIMULTANEOS = 2;

type Envio = { id: number; nome: string; progresso: number; erro?: string };

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
 * As fotos e os vídeos de um anúncio. O arquivo vai do aparelho direto
 * para o Storage, no original: o servidor só assina o endereço e depois
 * registra o que chegou.
 */
export function ArquivosAnuncio({
  chave,
  anuncioId,
  arquivos,
  onMudou,
}: {
  chave: string;
  anuncioId: string;
  /** todos os arquivos do briefing; aqui só aparecem os deste anúncio */
  arquivos: ArquivoAnuncio[];
  onMudou: (fn: (lista: ArquivoAnuncio[]) => ArquivoAnuncio[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const seq = useRef(0);
  const [envios, setEnvios] = useState<Envio[]>([]);
  const meus = arquivos.filter((a) => a.anuncioId === anuncioId);

  const atualizar = (id: number, patch: Partial<Envio>) =>
    setEnvios((l) => l.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  async function subir(file: File, id: number) {
    const prep = await prepararArquivoAction({
      k: chave,
      anuncioId,
      mime: file.type,
      bytes: file.size,
    });
    if (!prep.ok) return atualizar(id, { erro: prep.error });
    try {
      await enviar(prep.data.signedUrl, file, (p) => atualizar(id, { progresso: p }));
    } catch {
      return atualizar(id, { erro: "A internet caiu no meio. Tente de novo." });
    }
    const reg = await registrarArquivoAction({
      k: chave,
      anuncioId,
      path: prep.data.path,
      mime: file.type,
      bytes: file.size,
      nome: file.name,
    });
    if (!reg.ok) return atualizar(id, { erro: reg.error });
    onMudou((l) => [...l, reg.data]);
    setEnvios((l) => l.filter((e) => e.id !== id));
  }

  async function escolheu(files: FileList | null) {
    if (!files?.length) return;
    const lista = [...files];
    const novos = lista.map((f) => ({ id: ++seq.current, nome: f.name, progresso: 0 }));
    setEnvios((l) => [...l, ...novos]);
    // de dois em dois, para não travar a conexão do celular
    for (let i = 0; i < lista.length; i += SIMULTANEOS) {
      await Promise.all(lista.slice(i, i + SIMULTANEOS).map((f, j) => subir(f, novos[i + j].id)));
    }
    if (input.current) input.current.value = "";
  }

  async function tirar(id: string) {
    onMudou((l) => l.filter((a) => a.id !== id));
    await removerArquivoAction({ k: chave, id });
  }

  return (
    <div className="ddgb-arquivos">
      <div className="ddgb-arquivos__cabeca">
        <div>
          <p className="ddgb-arquivos__titulo">Foto ou vídeo</p>
          <p className="ddgb-dica">
            Pode mandar os dois e quantos quiser. Mande o original do rolo da câmera, não o que baixa
            do Instagram.
          </p>
        </div>
      </div>

      <input
        ref={input}
        className="ddgb-arquivos__input"
        type="file"
        accept={ACEITA}
        multiple
        onChange={(e) => escolheu(e.target.files)}
      />
      <button type="button" className="ddgb-arquivos__botao" onClick={() => input.current?.click()}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Escolher do aparelho
      </button>

      {envios.length ? (
        <ul className="ddgb-envios">
          {envios.map((e) => (
            <li key={e.id}>
              <span className="ddgb-envios__nome">{e.nome}</span>
              {e.erro ? (
                <span className="ddgb-envios__erro">{e.erro}</span>
              ) : (
                <span>{Math.round(e.progresso * 100)}%</span>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {meus.length ? (
        <ul className="ddgb-galeria">
          {meus.map((a) => (
            <li key={a.id} className="ddgb-galeria__item">
              {ehVideo(a.mime) ? (
                <video className="ddgb-galeria__video" src={a.url} muted playsInline preload="metadata" />
              ) : (
                <Image
                  className="ddgb-galeria__mini"
                  src={a.url}
                  alt={a.nome}
                  width={160}
                  height={200}
                  unoptimized
                />
              )}
              <span className="ddgb-galeria__nome">{a.nome}</span>
              {peso(a.bytes) ? <span className="ddgb-galeria__peso">{peso(a.bytes)}</span> : null}
              <button
                type="button"
                className="ddgb-galeria__tirar"
                onClick={() => tirar(a.id)}
                aria-label={`Tirar ${a.nome}`}
              >
                Tirar
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
