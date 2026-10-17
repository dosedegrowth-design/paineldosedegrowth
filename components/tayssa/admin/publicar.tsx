"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminPublishMediaAction, adminUpdatePhotoAction } from "@/lib/tayssa/actions/photos";
import { CATEGORIAS, chave, produtoParecido } from "@/lib/tayssa/catalogo";
import type { CategoriaMidia, PhotoRow } from "@/lib/tayssa/types";
import { Enquadrar, type Quadro } from "@/components/tayssa/admin/enquadrar";

export type ProdutosPorCategoria = Partial<Record<CategoriaMidia, string[]>>;

/**
 * Publicar (ou ajustar o que já está no ar). Ela enquadra, escolhe a
 * categoria e o produto — da lista que já existe, para o rolo não se
 * dividir em grafias diferentes — e põe no site. Produto novo só entra
 * de propósito, e se o nome parecer com um que já existe o painel avisa.
 */
export function Publicar({
  item,
  produtos,
  onFechar,
}: {
  item: PhotoRow;
  produtos: ProdutosPorCategoria;
  onFechar: () => void;
}) {
  const router = useRouter();
  const dialogo = useRef<HTMLDialogElement>(null);
  const noAr = item.status === "active";
  const [categoria, setCategoria] = useState<CategoriaMidia>(item.category ?? "cilios");
  const lista = produtos[categoria] ?? [];
  const [produto, setProduto] = useState(item.lash_style ?? "");
  const [novo, setNovo] = useState(!!item.lash_style && !lista.includes(item.lash_style) ? true : lista.length === 0);
  const [confirmouNovo, setConfirmouNovo] = useState(false);
  const [legenda, setLegenda] = useState(item.caption ?? "");
  const [preco, setPreco] = useState("");
  const [destaque, setDestaque] = useState(item.featured);
  const [quadro, setQuadro] = useState<Quadro>({
    x: Number(item.focus_x ?? 50),
    y: Number(item.focus_y ?? 50),
    zoom: Number(item.zoom ?? 1),
  });
  const [erro, setErro] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    const d = dialogo.current;
    if (d && !d.open) d.showModal();
  }, []);

  // grafia diferente do mesmo produto vira o produto que já existe
  const existenteIgual = novo ? lista.find((p) => chave(p) === chave(produto)) : undefined;
  const parecido = novo && !existenteIgual ? produtoParecido(produto, lista) : null;
  const nomeFinal = existenteIgual ?? produto.trim();
  const precisaDecidir = Boolean(parecido) && !confirmouNovo;
  const podePublicar = nomeFinal.length >= 2 && !precisaDecidir && !pending;

  const trocarCategoria = (c: CategoriaMidia) => {
    setCategoria(c);
    const l = produtos[c] ?? [];
    setNovo(l.length === 0);
    setProduto("");
    setConfirmouNovo(false);
  };

  const enviar = () =>
    start(async () => {
      setErro(null);
      const dados = {
        id: item.id,
        category: categoria,
        lash_style: nomeFinal,
        caption: legenda,
        featured: destaque,
        focus_x: quadro.x,
        focus_y: quadro.y,
        zoom: quadro.zoom,
      };
      const r = noAr
        ? await adminUpdatePhotoAction({ ...dados, alt: item.alt, sort_order: item.sort_order })
        : await adminPublishMediaAction({ ...dados, preco: novo && !existenteIgual ? preco : undefined });
      if (!r.ok) return setErro(r.error);
      dialogo.current?.close();
      onFechar();
      router.refresh();
    });

  return (
    <dialog
      ref={dialogo}
      className="tya-publicar"
      aria-labelledby={`pub-${item.id}`}
      onClose={onFechar}
      onClick={(e) => {
        if (e.target === e.currentTarget) dialogo.current?.close();
      }}
    >
      <div className="tya-publicar__corpo">
        <div className="tya-publicar__midia">
          <Enquadrar url={item.public_url} tipo={item.media_type} valor={quadro} onMudar={setQuadro} />
        </div>

        <div className="tya-publicar__campos">
          <header className="tya-publicar__topo">
            <h2 id={`pub-${item.id}`}>{noAr ? "Ajustar publicação" : "Publicar no site"}</h2>
            <button type="button" className="tya-btn tya-btn--sm tya-btn--ghost" onClick={() => dialogo.current?.close()}>
              Fechar
            </button>
          </header>
          {item.original_name ? <p className="tya-small">{item.original_name}</p> : null}

          <div>
            <span className="tya-label" id={`cat-${item.id}`}>
              Categoria
            </span>
            <div className="tya-sugs" role="radiogroup" aria-labelledby={`cat-${item.id}`}>
              {CATEGORIAS.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  role="radio"
                  aria-checked={categoria === c.slug}
                  className="tya-chip"
                  data-on={categoria === c.slug ? "true" : "false"}
                  onClick={() => trocarCategoria(c.slug)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="tya-label" id={`prod-${item.id}`}>
              Produto
            </span>
            {lista.length ? (
              <div className="tya-sugs" role="radiogroup" aria-labelledby={`prod-${item.id}`}>
                {lista.map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={!novo && produto === p}
                    className="tya-chip"
                    data-on={!novo && produto === p ? "true" : "false"}
                    onClick={() => {
                      setNovo(false);
                      setProduto(p);
                    }}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  className="tya-chip tya-chip--novo"
                  data-on={novo ? "true" : "false"}
                  onClick={() => {
                    setNovo(true);
                    setProduto("");
                    setConfirmouNovo(false);
                  }}
                >
                  + Novo produto
                </button>
              </div>
            ) : null}
            {novo ? (
              <div className="tya-field-wrap" style={{ marginTop: 10 }}>
                <input
                  className="tya-field"
                  aria-label="Nome do produto novo"
                  placeholder={categoria === "cilios" ? "ex.: Volume inglês" : "Nome do produto"}
                  value={produto}
                  maxLength={80}
                  onChange={(e) => {
                    setProduto(e.target.value);
                    setConfirmouNovo(false);
                  }}
                />
                {existenteIgual ? (
                  <p className="tya-small" role="status" style={{ marginTop: 6 }}>
                    Já existe como <b>{existenteIgual}</b>: vai para o mesmo rolo.
                  </p>
                ) : parecido && !confirmouNovo ? (
                  <div className="tya-aviso" role="alert">
                    <span>
                      Parece <b>{parecido}</b>, que já existe. É o mesmo produto?
                    </span>
                    <span className="tya-aviso__acoes">
                      <button
                        type="button"
                        className="tya-btn tya-btn--sm tya-btn--primary"
                        onClick={() => {
                          setNovo(false);
                          setProduto(parecido);
                        }}
                      >
                        Usar {parecido}
                      </button>
                      <button type="button" className="tya-btn tya-btn--sm tya-btn--ghost" onClick={() => setConfirmouNovo(true)}>
                        É outro produto
                      </button>
                    </span>
                  </div>
                ) : null}
                {!noAr && !existenteIgual ? (
                  <label className="tya-field-wrap" style={{ marginTop: 10 }}>
                    <span className="tya-label">Valor do produto (opcional)</span>
                    <input
                      className="tya-field"
                      inputMode="decimal"
                      placeholder="ex.: 180 — vazio, o site não mostra valor"
                      value={preco}
                      maxLength={12}
                      onChange={(e) => setPreco(e.target.value)}
                    />
                  </label>
                ) : null}
              </div>
            ) : null}
          </div>

          <label className="tya-field-wrap">
            <span className="tya-label">Legenda (opcional)</span>
            <input
              className="tya-field"
              value={legenda}
              maxLength={120}
              placeholder="ex.: Efeito natural"
              onChange={(e) => setLegenda(e.target.value)}
            />
          </label>
          <label className="tya-check">
            <input type="checkbox" checked={destaque} onChange={(e) => setDestaque(e.target.checked)} />
            <span>Destaque: abre o rolo do produto</span>
          </label>

          {erro ? (
            <p className="tya-err" role="alert">
              {erro}
            </p>
          ) : null}
          <div className="tya-publicar__acoes">
            <button type="button" className="tya-btn tya-btn--primary" disabled={!podePublicar} onClick={enviar}>
              {pending ? "Salvando…" : noAr ? "Salvar ajustes" : "Publicar no rolo"}
            </button>
            {nomeFinal.length >= 2 ? (
              <span className="tya-small">
                Vai para {CATEGORIAS.find((c) => c.slug === categoria)?.label} › {nomeFinal}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </dialog>
  );
}
