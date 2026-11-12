"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { salvarRespostaAction } from "@/lib/marina/actions/aprovacoes";
import {
  LIMITE_COMENTARIO,
  ROTULOS,
  resumoWhatsApp,
  type Link,
  type Midia,
  type Resposta,
  type RespostaSalva,
} from "@/lib/marina/aprovar";

type Estado = { resposta: Resposta | null; comentario: string; erro?: string };

/* ---------------------------------------------------------------- mídia */

function Carrossel({ cards }: { cards: { src: string; nome: string; descricao?: string }[] }) {
  return (
    <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto bg-neutral-100 pb-2">
      {cards.map((c, i) => (
        <figure key={c.src} className="w-[82%] shrink-0 snap-start bg-white sm:w-[46%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.src} alt={c.nome} loading="lazy" className="aspect-square w-full object-cover" />
          <figcaption className="border-t border-neutral-200 px-3 py-2.5">
            <p className="text-[12.5px] font-semibold leading-snug text-neutral-900">{c.nome}</p>
            {c.descricao ? (
              <p className="mt-0.5 text-[11.5px] leading-snug text-neutral-500">{c.descricao}</p>
            ) : null}
            <p className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
              {i + 1} de {cards.length}
            </p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function Peca({ midia }: { midia: Midia }) {
  if (midia.tipo === "carrossel") return <Carrossel cards={midia.cards} />;
  if (midia.tipo === "video") {
    return (
      <video
        src={midia.src}
        poster={midia.capa}
        controls
        playsInline
        preload="none"
        className="w-full bg-neutral-100"
        style={{ aspectRatio: midia.proporcao }}
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={midia.src}
      alt=""
      loading="lazy"
      className="w-full bg-neutral-100 object-cover"
      style={{ aspectRatio: midia.proporcao }}
    />
  );
}

/* -------------------------------------------------------- anúncio no ar */

function Moldura({
  texto,
  titulo,
  botao,
  children,
}: {
  texto: string;
  titulo: string;
  botao: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden border border-neutral-200 bg-white">
      <div className="flex items-center gap-2.5 px-3.5 py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-neutral-900 text-[11px] font-semibold tracking-wide text-white">
          MS
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold leading-tight text-neutral-900">
            Marina Saleme Estamparia
          </span>
          <span className="block text-[11.5px] leading-tight text-neutral-500">Patrocinado</span>
        </span>
      </div>
      <p className="whitespace-pre-line px-3.5 pb-3 text-[13.5px] leading-relaxed text-neutral-800">
        {texto}
      </p>
      {children}
      <div className="flex items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50 px-3.5 py-3">
        <span className="min-w-0 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-neutral-900">
          <span className="block truncate">{titulo}</span>
          <span className="block text-[11px] font-normal normal-case tracking-normal text-neutral-500">
            marinasaleme-estamparia.com
          </span>
        </span>
        <span className="shrink-0 bg-neutral-200 px-3 py-1.5 text-[12px] font-semibold text-neutral-800">
          {botao}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ resposta */

function Botoes({
  link,
  itemId,
  estado,
  mudar,
}: {
  link: Link;
  itemId: string;
  estado: Estado;
  mudar: (e: Partial<Estado>, salvar: boolean) => void;
}) {
  const r = ROTULOS[link];
  const [aberto, setAberto] = useState(estado.comentario.length > 0);

  const botao = (valor: Resposta, rotulo: string, cor: string) => {
    const ativo = estado.resposta === valor;
    return (
      <button
        type="button"
        onClick={() => mudar({ resposta: ativo ? null : valor }, true)}
        aria-pressed={ativo}
        className={`flex-1 border px-3 py-3 text-[14px] font-semibold transition-colors ${
          ativo ? cor : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
        }`}
      >
        {rotulo}
      </button>
    );
  };

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        {botao("sim", r.sim, "border-[#1f7a4d] bg-[#1f7a4d] text-white")}
        {botao("nao", r.nao, "border-[#b02a16] bg-[#b02a16] text-white")}
      </div>

      {aberto ? (
        <textarea
          value={estado.comentario}
          maxLength={LIMITE_COMENTARIO}
          onChange={(e) => mudar({ comentario: e.target.value }, false)}
          onBlur={() => mudar({}, true)}
          rows={2}
          placeholder="Comentário (opcional)"
          className="mt-2 w-full resize-y border border-neutral-300 bg-white px-3 py-2 text-[16px] leading-snug text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none sm:text-[14px]"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="mt-2 text-[12.5px] text-neutral-500 underline underline-offset-4"
        >
          Escrever um comentário
        </button>
      )}

      {estado.erro ? (
        <p className="mt-2 text-[12.5px] font-medium text-[#b02a16]">{estado.erro}</p>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------------- lista */

export type ItemAprovar = {
  id: string;
  nome: string;
  meta?: string;
  texto: string;
  titulo: string;
  botao: string;
  midia: Midia;
  /** Um mesmo anúncio em dois formatos (Link 2). */
  segunda?: { rotulo: string; midia: Midia };
  rotuloMidia?: string;
  /** `meta` é uma pergunta para a cliente, não um dado: aparece em laranja. */
  metaDestaque?: boolean;
};

export function Aprovar({
  link,
  titulo,
  itens,
  salvas,
}: {
  link: Link;
  titulo: string;
  itens: ItemAprovar[];
  salvas: RespostaSalva[];
}) {
  const [estados, setEstados] = useState<Record<string, Estado>>(() => {
    const m: Record<string, Estado> = {};
    for (const i of itens) {
      const s = salvas.find((x) => x.itemId === i.id);
      m[i.id] = { resposta: s?.resposta ?? null, comentario: s?.comentario ?? "" };
    }
    return m;
  });
  const [, iniciar] = useTransition();
  const [copiado, setCopiado] = useState(false);

  const mudar = useCallback(
    (itemId: string) => (parcial: Partial<Estado>, salvar: boolean) => {
      setEstados((atual) => {
        const proximo = { ...atual[itemId], ...parcial, erro: undefined };
        if (salvar) {
          iniciar(async () => {
            const r = await salvarRespostaAction({
              link,
              itemId,
              resposta: proximo.resposta,
              comentario: proximo.comentario,
            });
            if (!r.ok) {
              setEstados((a) => ({ ...a, [itemId]: { ...a[itemId], erro: r.error } }));
            }
          });
        }
        return { ...atual, [itemId]: proximo };
      });
    },
    [link],
  );

  const contagem = useMemo(() => {
    let sim = 0, nao = 0;
    for (const i of itens) {
      const r = estados[i.id]?.resposta;
      if (r === "sim") sim++;
      else if (r === "nao") nao++;
    }
    return { sim, nao, falta: itens.length - sim - nao };
  }, [estados, itens]);

  const copiar = useCallback(async () => {
    const mapa = new Map<string, RespostaSalva>();
    for (const i of itens) {
      const e = estados[i.id];
      mapa.set(i.id, {
        itemId: i.id,
        resposta: e?.resposta ?? null,
        comentario: e?.comentario ?? "",
        atualizadoEm: "",
      });
    }
    const texto = resumoWhatsApp(titulo, link, itens.map((i) => ({ id: i.id, nome: i.nome })), mapa);
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = texto;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(ta);
      }
    }
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 2500);
  }, [estados, itens, link, titulo]);

  const r = ROTULOS[link];

  return (
    <>
      <div className="sticky top-0 z-20 -mx-5 mb-5 border-b border-neutral-200 bg-white/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="mx-auto flex max-w-[760px] flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="text-[12.5px] text-neutral-600">
            <strong className="font-semibold text-[#1f7a4d]">{contagem.sim}</strong> {r.simPlural}
            {" · "}
            <strong className="font-semibold text-[#b02a16]">{contagem.nao}</strong> {r.naoPlural}
            {contagem.falta > 0 ? (
              <>
                {" · "}
                <strong className="font-semibold text-neutral-900">{contagem.falta}</strong> sem resposta
              </>
            ) : null}
          </p>
          <button
            type="button"
            onClick={copiar}
            className="bg-[#F15839] px-3.5 py-2 text-[12.5px] font-semibold text-white"
          >
            {copiado ? "Copiado!" : "Copiar respostas"}
          </button>
        </div>
      </div>

      <ul className="mx-auto flex max-w-[760px] flex-col gap-9">
        {itens.map((item, i) => (
          <li key={item.id} id={item.id} className="scroll-mt-20">
            <div className="mb-2.5 flex flex-wrap items-baseline gap-x-2.5">
              <span className="font-serif text-[14px] leading-none text-[#F15839]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[15px] font-semibold leading-snug text-neutral-900">{item.nome}</h3>
            </div>
            {item.meta ? (
              <p
                className={
                  item.metaDestaque
                    ? "mb-2.5 border-l-2 border-[#F15839] pl-2.5 text-[12px] leading-relaxed text-[#b0441f]"
                    : "mb-2.5 text-[11.5px] leading-relaxed text-neutral-500"
                }
              >
                {item.meta}
              </p>
            ) : null}

            {item.segunda ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    {item.rotuloMidia ?? "Feed 4:5"}
                  </p>
                  <Moldura texto={item.texto} titulo={item.titulo} botao={item.botao}>
                    <Peca midia={item.midia} />
                  </Moldura>
                </div>
                <div>
                  <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    {item.segunda.rotulo}
                  </p>
                  <Moldura texto={item.texto} titulo={item.titulo} botao={item.botao}>
                    <Peca midia={item.segunda.midia} />
                  </Moldura>
                </div>
              </div>
            ) : (
              <Moldura texto={item.texto} titulo={item.titulo} botao={item.botao}>
                <Peca midia={item.midia} />
              </Moldura>
            )}

            <Botoes
              link={link}
              itemId={item.id}
              estado={estados[item.id] ?? { resposta: null, comentario: "" }}
              mudar={mudar(item.id)}
            />
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-10 flex max-w-[760px] justify-center">
        <button
          type="button"
          onClick={copiar}
          className="w-full bg-[#F15839] px-4 py-3.5 text-[14px] font-semibold text-white sm:w-auto sm:px-10"
        >
          {copiado ? "Copiado! Agora é só colar no WhatsApp" : "Copiar respostas para o WhatsApp"}
        </button>
      </div>
    </>
  );
}
