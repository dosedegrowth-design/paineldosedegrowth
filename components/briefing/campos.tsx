"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  prepararArquivoBriefingAction,
  registrarArquivoBriefingAction,
  removerArquivoBriefingAction,
  tecnicaArquivoBriefingAction,
} from "@/lib/tayssa/actions/briefing";
import { TECNICAS, type ArquivoBriefing, type TipoArquivo } from "@/lib/tayssa/briefing";

/* ---------- campos ---------- */

export function Campo({
  rotulo,
  dica,
  valor,
  onChange,
  placeholder,
  tipo = "text",
  inputMode,
  autoComplete = "off",
}: {
  rotulo: string;
  dica?: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  tipo?: "text" | "url" | "tel";
  inputMode?: "text" | "decimal" | "numeric" | "tel" | "url";
  autoComplete?: string;
}) {
  const id = useId();
  return (
    <div className="ddgb-campo">
      <label htmlFor={id}>{rotulo}</label>
      {dica ? <p className="ddgb-dica">{dica}</p> : null}
      <input
        id={id}
        type={tipo}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={valor}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function Texto({
  rotulo,
  dica,
  valor,
  onChange,
  placeholder,
  linhas = 4,
}: {
  rotulo: string;
  dica?: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  linhas?: number;
}) {
  const id = useId();
  return (
    <div className="ddgb-campo">
      <label htmlFor={id}>{rotulo}</label>
      {dica ? <p className="ddgb-dica">{dica}</p> : null}
      <textarea id={id} rows={linhas} value={valor} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/** Botões que ligam e desligam (dias, formas de pagamento). */
export function Chips<T extends string | number>({
  rotulo,
  opcoes,
  marcados,
  onChange,
}: {
  rotulo: string;
  opcoes: { valor: T; nome: string }[];
  marcados: T[];
  onChange: (v: T[]) => void;
}) {
  return (
    <fieldset className="ddgb-campo">
      <legend>{rotulo}</legend>
      <div className="ddgb-chips">
        {opcoes.map((o) => {
          const ligado = marcados.includes(o.valor);
          return (
            <button
              key={String(o.valor)}
              type="button"
              className="ddgb-chip"
              aria-pressed={ligado}
              onClick={() => onChange(ligado ? marcados.filter((m) => m !== o.valor) : [...marcados, o.valor])}
            >
              {o.nome}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Uma escolha só, em botões lado a lado. */
export function Escolha<T extends string>({
  rotulo,
  opcoes,
  valor,
  onChange,
}: {
  rotulo: string;
  opcoes: { valor: T; nome: string }[];
  valor: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="ddgb-campo">
      <legend>{rotulo}</legend>
      <div className="ddgb-escolha" role="radiogroup">
        {opcoes.map((o) => (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={valor === o.valor}
            className="ddgb-escolha__op"
            onClick={() => onChange(o.valor)}
          >
            {o.nome}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Interruptor({ rotulo, ligado, onChange }: { rotulo: ReactNode; ligado: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="ddgb-interruptor">
      <input type="checkbox" checked={ligado} onChange={(e) => onChange(e.target.checked)} />
      <span className="ddgb-interruptor__trilho" aria-hidden />
      <span>{rotulo}</span>
    </label>
  );
}

/* ---------- arquivos ---------- */

const ACEITA = {
  foto: "image/jpeg,image/png,image/webp,image/avif",
  video: "video/mp4,video/quicktime,video/webm",
  ambos: "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/quicktime,video/webm",
} as const;

/** quantos sobem ao mesmo tempo: rápido sem engasgar o celular */
const SIMULTANEOS = 2;

const mb = (bytes: number | null) => (bytes == null ? "" : `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`);

type Envio = { id: number; nome: string; progresso: number; erro?: string };

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

export function Arquivos({
  chave,
  tipo,
  titulo,
  dica,
  varios,
  aceita,
  arquivos,
  onMudou,
}: {
  chave: string;
  tipo: TipoArquivo;
  titulo: string;
  dica?: string;
  varios: boolean;
  aceita: keyof typeof ACEITA;
  /** todos os arquivos do briefing; aqui só aparecem os deste tipo */
  arquivos: ArquivoBriefing[];
  onMudou: (fn: (lista: ArquivoBriefing[]) => ArquivoBriefing[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const seq = useRef(0);
  const [envios, setEnvios] = useState<Envio[]>([]);
  const meus = arquivos.filter((a) => a.tipo === tipo);
  const cheio = !varios && meus.length > 0;

  const atualizar = (id: number, patch: Partial<Envio>) =>
    setEnvios((l) => l.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  async function subir(file: File, id: number) {
    const prep = await prepararArquivoBriefingAction({ k: chave, tipo, mime: file.type, bytes: file.size });
    if (!prep.ok) return atualizar(id, { erro: prep.error });
    try {
      await enviar(prep.data.signedUrl, file, (p) => atualizar(id, { progresso: p }));
    } catch {
      return atualizar(id, { erro: "A internet caiu no meio. Tente de novo." });
    }
    const reg = await registrarArquivoBriefingAction({
      k: chave,
      tipo,
      path: prep.data.path,
      mime: file.type,
      bytes: file.size,
      nome: file.name,
    });
    if (!reg.ok) return atualizar(id, { erro: reg.error });
    onMudou((l) => [...l, reg.data]);
    setEnvios((l) => l.filter((e) => e.id !== id));
  }

  async function escolher(files: FileList | null) {
    if (!files?.length) return;
    const lista = Array.from(files).slice(0, varios ? 30 : 1);
    const fila = lista.map((file) => ({ file, id: ++seq.current }));
    setEnvios((l) => [...l, ...fila.map(({ file, id }) => ({ id, nome: file.name, progresso: 0 }))]);
    // sobem de dois em dois
    let i = 0;
    const trabalhador = async () => {
      while (i < fila.length) {
        const { file, id } = fila[i++];
        await subir(file, id);
      }
    };
    await Promise.all(Array.from({ length: Math.min(SIMULTANEOS, fila.length) }, trabalhador));
    if (input.current) input.current.value = "";
  }

  async function remover(a: ArquivoBriefing) {
    onMudou((l) => l.filter((x) => x.id !== a.id));
    const r = await removerArquivoBriefingAction({ k: chave, id: a.id });
    if (!r.ok) onMudou((l) => [...l, a]);
  }

  async function tecnica(a: ArquivoBriefing, valor: string) {
    onMudou((l) => l.map((x) => (x.id === a.id ? { ...x, tecnica: valor || null } : x)));
    await tecnicaArquivoBriefingAction({ k: chave, id: a.id, tecnica: valor });
  }

  return (
    <div className="ddgb-arquivos">
      <div className="ddgb-arquivos__cabeca">
        <div>
          <p className="ddgb-arquivos__titulo">{titulo}</p>
          {dica ? <p className="ddgb-dica">{dica}</p> : null}
        </div>
        {meus.length ? <span className="ddgb-contador">{meus.length}</span> : null}
      </div>

      {meus.length ? (
        <ul className="ddgb-galeria">
          {meus.map((a) => (
            <li key={a.id} className="ddgb-galeria__item">
              <div className="ddgb-galeria__mini">
                {a.mime.startsWith("image/") ? (
                  <Image src={a.url} alt="" fill sizes="120px" style={{ objectFit: "cover" }} />
                ) : (
                  <span className="ddgb-galeria__video" aria-hidden>
                    <svg viewBox="0 0 24 24">
                      <path d="M8 5.5v13l10.5-6.5z" />
                    </svg>
                  </span>
                )}
                <button type="button" className="ddgb-galeria__tirar" onClick={() => remover(a)} aria-label={`Tirar ${a.nome}`}>
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
              <span className="ddgb-galeria__nome" title={a.nome}>
                {a.nome}
              </span>
              <span className="ddgb-galeria__peso">{mb(a.bytes)}</span>
              {tipo === "trabalho" ? (
                <select
                  className="ddgb-galeria__tecnica"
                  value={a.tecnica ?? ""}
                  onChange={(e) => tecnica(a, e.target.value)}
                  aria-label={`Técnica de ${a.nome}`}
                >
                  <option value="">Qual técnica?</option>
                  {TECNICAS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {envios.length ? (
        <ul className="ddgb-envios" aria-live="polite">
          {envios.map((e) => (
            <li key={e.id} data-erro={e.erro ? "" : undefined}>
              <span className="ddgb-envios__nome">{e.nome}</span>
              {e.erro ? (
                <>
                  <span className="ddgb-envios__erro">{e.erro}</span>
                  <button type="button" className="ddgb-link" onClick={() => setEnvios((l) => l.filter((x) => x.id !== e.id))}>
                    Ok
                  </button>
                </>
              ) : (
                <span className="ddgb-barra" aria-label={`Enviando ${Math.round(e.progresso * 100)}%`}>
                  <span style={{ transform: `scaleX(${Math.max(0.03, e.progresso)})` }} />
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {cheio ? null : (
        <>
          <input
            ref={input}
            type="file"
            accept={ACEITA[aceita]}
            multiple={varios}
            className="ddgb-arquivos__input"
            onChange={(e) => escolher(e.target.files)}
            tabIndex={-1}
            aria-hidden
          />
          <button type="button" className="ddgb-arquivos__botao" onClick={() => input.current?.click()}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M12 16V4m0 0-4.5 4.5M12 4l4.5 4.5M4.5 15v3.5A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5V15" />
            </svg>
            {meus.length ? (varios ? "Mandar mais" : "Trocar") : aceita === "video" ? "Escolher vídeo" : aceita === "foto" ? (varios ? "Escolher fotos" : "Escolher foto") : "Escolher arquivos"}
          </button>
        </>
      )}
    </div>
  );
}
