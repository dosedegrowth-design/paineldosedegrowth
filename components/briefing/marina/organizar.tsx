"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  guardarArquivoAction,
  moverArquivoAction,
  organizadoMarinaAction,
  renomearArquivoAction,
} from "@/lib/marina/actions/briefing";
import {
  FRENTES,
  FRENTE_DICA,
  FRENTE_TITULO,
  LIMITE_PECA,
  contarFrente,
  ehVideo,
  outraFrente,
  type Frente,
  type ItemOrganizar,
} from "@/lib/marina/briefing";
import type { OrganizarMarina } from "@/lib/marina/queries/briefing";

type Estado = "" | "salvando" | "salvo" | "erro";

const quando = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * A tela de organizar: as duas frentes de novembro lado a lado, cada uma
 * rolando como um feed. A Bia olha foto por foto e deixa onde está ou manda
 * para a outra. O que não é criativo ela tira, e o tirado fica na gaveta.
 *
 * Nada de `useActionState`/`<form action>` aqui: no Next 16 o "pendente" do
 * React fica esperando a revalidação da tela inteira e às vezes não volta.
 */
export function MarinaOrganizar({
  chave,
  itens: iniciais,
  organizadoEm,
}: OrganizarMarina & { chave: string }) {
  const [itens, setItens] = useState<ItemOrganizar[]>(iniciais);
  const [ativa, setAtiva] = useState<Frente>(FRENTES[0]);
  const [gaveta, setGaveta] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const campo = useRef<HTMLInputElement | null>(null);
  const [estado, setEstado] = useState<Estado>("");
  const [recado, setRecado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [organizado, setOrganizado] = useState<string | null>(organizadoEm);
  const [fechando, setFechando] = useState(false);
  const relogio = useRef<number | undefined>(undefined);

  function avisar(texto: string) {
    setRecado(texto);
    window.clearTimeout(relogio.current);
    relogio.current = window.setTimeout(() => setRecado(null), 2600);
  }

  /**
   * Mexe na tela na hora e grava depois; se falhar, a foto volta para onde
   * estava e o recado vira o erro (ela pode estar lá embaixo, longe do topo).
   */
  async function aplicar(
    id: string,
    patch: Partial<ItemOrganizar>,
    gravar: () => Promise<{ ok: boolean; error?: string }>,
    feito: string,
  ) {
    const antes = itens.find((i) => i.id === id);
    if (!antes) return;
    setItens((l) => l.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    setEstado("salvando");
    setErro(null);
    const r = await gravar();
    if (!r.ok) {
      const recado = r.error ?? "Não deu para salvar. Tente de novo.";
      setItens((l) => l.map((i) => (i.id === id ? antes : i)));
      setEstado("erro");
      setErro(recado);
      avisar(recado);
      return;
    }
    setEstado("salvo");
    avisar(feito);
  }

  function mover(item: ItemOrganizar) {
    const destino = outraFrente(item.frente);
    void aplicar(
      item.id,
      { frente: destino, fora: false },
      () => moverArquivoAction({ k: chave, id: item.id, frente: destino }),
      `Foi para ${FRENTE_TITULO[destino]}.`,
    );
  }

  function guardar(item: ItemOrganizar, fora: boolean) {
    void aplicar(
      item.id,
      { fora },
      () => guardarArquivoAction({ k: chave, id: item.id, fora }),
      fora ? "Tirada. Está guardada, dá para devolver." : `Voltou para ${FRENTE_TITULO[item.frente]}.`,
    );
  }

  function renomear(item: ItemOrganizar, valor: string) {
    const peca = valor.trim();
    setEditando(null);
    if (peca === item.peca) return;
    void aplicar(
      item.id,
      { peca: peca || item.grupo },
      () => renomearArquivoAction({ k: chave, id: item.id, peca }),
      peca ? `Agora chama ${peca}.` : "Voltou a usar o nome do cadastro.",
    );
  }

  async function terminei() {
    setFechando(true);
    setErro(null);
    const r = await organizadoMarinaAction({ k: chave });
    setFechando(false);
    if (!r.ok) return setErro(r.error);
    setOrganizado(r.data.organizadoEm);
    avisar("Avisamos a DDG. Obrigado, Bia.");
  }

  const tiradas = itens.filter((i) => i.fora);

  function cartao(item: ItemOrganizar) {
    const destino = outraFrente(item.frente);
    return (
      <article key={item.id} className="ddgb-post">
        <div className="ddgb-post__midia">
          {ehVideo(item.mime) ? (
            <video src={item.url} controls muted playsInline preload="metadata" />
          ) : (
            <Image
              src={item.url}
              alt={item.peca || item.nome}
              fill
              sizes="(min-width: 900px) 44vw, 92vw"
              style={{ objectFit: "contain" }}
            />
          )}
          {ehVideo(item.mime) ? <span className="ddgb-post__selo">vídeo</span> : null}
        </div>
        <div className="ddgb-post__texto">
          {editando === item.id ? (
            <div className="ddgb-post__editar">
              <label htmlFor={`peca-${item.id}`}>Nome do produto, como na loja</label>
              <input
                id={`peca-${item.id}`}
                type="text"
                autoComplete="off"
                autoFocus
                maxLength={LIMITE_PECA}
                defaultValue={item.peca}
                onKeyDown={(e) => {
                  if (e.key === "Enter") renomear(item, e.currentTarget.value);
                  if (e.key === "Escape") setEditando(null);
                }}
                ref={(el) => {
                  campo.current = el;
                }}
              />
              <div className="ddgb-post__editar-acoes">
                <button type="button" onClick={() => renomear(item, campo.current?.value ?? "")}>
                  Salvar
                </button>
                <button type="button" className="ddgb-link ddgb-link--quieto" onClick={() => setEditando(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="ddgb-post__peca">{item.peca || "Sem nome"}</p>
              <p className="ddgb-post__de">
                {item.estampa ? <span>{item.estampa}</span> : null}
                {item.produtoUrl ? (
                  <>
                    {item.estampa ? " · " : null}
                    <a href={item.produtoUrl} target="_blank" rel="noreferrer">
                      ver na loja
                    </a>
                  </>
                ) : null}
                {" · "}
                <button type="button" className="ddgb-post__corrigir" onClick={() => setEditando(item.id)}>
                  não é essa peça?
                </button>
              </p>
              {item.grupo && item.grupo !== item.peca ? (
                <p className="ddgb-post__grupo">você cadastrou em: {item.grupo}</p>
              ) : null}
              <p className="ddgb-post__arquivo">{item.nome}</p>
            </>
          )}
        </div>
        <div className="ddgb-post__acoes">
          {item.fora ? (
            <button type="button" className="ddgb-post__mover" onClick={() => guardar(item, false)}>
              Devolver para {FRENTE_TITULO[item.frente]}
            </button>
          ) : (
            <>
              <button type="button" className="ddgb-post__mover" onClick={() => mover(item)}>
                Mover para {FRENTE_TITULO[destino]}
              </button>
              <button type="button" className="ddgb-post__tirar" onClick={() => guardar(item, true)}>
                Tirar
              </button>
            </>
          )}
        </div>
      </article>
    );
  }

  return (
    <div className="ddgb ddgb--marina">
      <header className="ddgb-topo ddgb-topo--largo">
        <div className="ddgb-topo__linha">
          <span className="ddgb-marca">Marina Saleme</span>
          <span className="ddgb-salvo" aria-live="polite">
            {recado
              ? recado
              : estado === "salvando"
                ? "salvando…"
                : estado === "salvo"
                  ? "salvo"
                  : estado === "erro"
                    ? "não salvou"
                    : ""}
          </span>
        </div>
      </header>

      <main className="ddgb-pagina ddgb-pagina--largo">
        <section className="ddgb-abre">
          <p className="ddgb-abre__cliente">Dose de Growth</p>
          <h1>Oi, Bia. Cada foto está na frente certa?</h1>
          <p>
            Aqui estão as fotos e os vídeos que você mandou, nas duas frentes. Desça olhando: se a foto
            está no lugar, não precisa fazer nada. Se está na frente errada, toque em mover.
          </p>
          <ul className="ddgb-abre__dicas">
            <li>O que não for foto de anúncio, use o Tirar. Não apaga nada, fica guardado.</li>
            <li>Salva sozinho. Pode fechar e voltar depois.</li>
          </ul>
        </section>

        <div className="ddgb-meses" role="tablist" aria-label="Frente">
          {FRENTES.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={f === ativa}
              className={`ddgb-mes${f === ativa ? " ddgb-mes--agora" : ""}`}
              onClick={() => setAtiva(f)}
            >
              <span className="ddgb-mes__titulo">{FRENTE_TITULO[f]}</span>
              <span className="ddgb-mes__conta">
                {contarFrente(f, itens)} {contarFrente(f, itens) === 1 ? "foto" : "fotos"} · {FRENTE_DICA[f]}
              </span>
            </button>
          ))}
        </div>

        {erro ? <p className="ddgb-erro">{erro}</p> : null}

        <div className="ddgb-frentes">
          {FRENTES.map((f) => {
            const doFeed = itens.filter((i) => !i.fora && i.frente === f);
            return (
              <section key={f} className="ddgb-frente" {...(f === ativa ? { "data-ativa": "" } : {})}>
                <h2 className="ddgb-frente__titulo">
                  {FRENTE_TITULO[f]}
                  <span>{doFeed.length}</span>
                </h2>
                <div className="ddgb-feed">
                  {doFeed.length ? (
                    doFeed.map(cartao)
                  ) : (
                    <p className="ddgb-dica">Nenhuma foto nesta frente.</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {tiradas.length ? (
          <section className="ddgb-gaveta">
            <button type="button" className="ddgb-link ddgb-link--quieto" onClick={() => setGaveta((g) => !g)}>
              {gaveta ? "Fechar as tiradas" : `Ver as tiradas (${tiradas.length})`}
            </button>
            {gaveta ? <div className="ddgb-feed">{tiradas.map(cartao)}</div> : null}
          </section>
        ) : null}

        <footer className="ddgb-rodape">
          {organizado ? (
            <p className="ddgb-enviado">
              Você avisou a DDG em {quando(organizado)}. Pode continuar mexendo: a gente vê as mudanças.
            </p>
          ) : null}
          <button type="button" className="ddgb-enviar" onClick={terminei} disabled={fechando}>
            {fechando ? "Avisando…" : organizado ? "Avisar a DDG de novo" : "Terminei de organizar"}
          </button>
          <p className="ddgb-nota">
            {contarFrente("ultimas", itens)} em Últimas peças · {contarFrente("novas", itens)} em Estampas novas
            {tiradas.length ? ` · ${tiradas.length} ${tiradas.length === 1 ? "tirada" : "tiradas"}` : ""}
          </p>
        </footer>
      </main>
    </div>
  );
}
