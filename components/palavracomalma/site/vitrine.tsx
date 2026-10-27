"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Cartao } from "@/app/palavracomalma/site/catalogo";
import { CartaoProduto } from "./cartao";

export type Filtro = { id: number; nome: string; slug: string; pai: number | null; ids: number[] };

const ORDENS = [
  { id: "destaques", nome: "Destaques" },
  { id: "menor", nome: "Menor preço" },
  { id: "maior", nome: "Maior preço" },
  { id: "novos", nome: "Novidades" },
];

const sem = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function Vitrine({
  cartoes,
  filtros,
  inicial,
  buscaInicial,
}: {
  cartoes: Cartao[];
  filtros: Filtro[];
  inicial?: string;
  buscaInicial?: string;
}) {
  const [cat, setCat] = useState<string | undefined>(inicial);
  const [q, setQ] = useState(buscaInicial ?? "");
  const [ordem, setOrdem] = useState("destaques");
  const [soDisp, setSoDisp] = useState(false);

  const atual = filtros.find((f) => f.slug === cat);
  const raiz = atual ? (atual.pai ? filtros.find((f) => f.id === atual.pai) : atual) : undefined;
  const filhas = raiz ? filtros.filter((f) => f.pai === raiz.id) : [];
  const topo = filtros.filter((f) => !f.pai);

  function escolher(slug?: string) {
    setCat(slug);
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("c", slug);
    else url.searchParams.delete("c");
    url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }

  const lista = useMemo(() => {
    const t = sem(q.trim());
    const ids = atual ? new Set(atual.ids) : null;
    const base = cartoes.filter(
      (c) => (!ids || ids.has(c.id)) && (!soDisp || c.disponivel) && (!t || sem(c.nome + " " + c.catNome).includes(t))
    );
    const preco = (c: Cartao) => c.promo ?? c.preco;
    const ord = [...base].sort((a, b) => {
      if (a.disponivel !== b.disponivel) return a.disponivel ? -1 : 1;
      if (ordem === "menor") return preco(a) - preco(b);
      if (ordem === "maior") return preco(b) - preco(a);
      if (ordem === "novos") return Number(b.lancamento) - Number(a.lancamento) || b.id - a.id;
      return Number(b.destaque) - Number(a.destaque) || b.id - a.id;
    });
    return ord;
  }, [cartoes, atual, q, ordem, soDisp]);

  const disponiveis = lista.filter((c) => c.disponivel).length;

  return (
    <div className="lj-vit">
      <div className="lj-vit-barra">
        <div className="lj-chips" role="group" aria-label="Categorias">
          <button aria-pressed={!cat} onClick={() => escolher(undefined)}>
            Tudo
          </button>
          {topo.map((f) => (
            <button key={f.id} aria-pressed={raiz?.id === f.id} onClick={() => escolher(f.slug)}>
              {f.nome}
            </button>
          ))}
        </div>
        {filhas.length > 0 && (
          <div className="lj-chips is-sub" role="group" aria-label="Subcategorias">
            <button aria-pressed={atual?.id === raiz?.id} onClick={() => escolher(raiz!.slug)}>
              Todos
            </button>
            {filhas.map((f) => (
              <button key={f.id} aria-pressed={atual?.id === f.id} onClick={() => escolher(f.slug)}>
                {f.nome}
              </button>
            ))}
          </div>
        )}
        <div className="lj-vit-ferr">
          <label className="lj-vit-busca">
            <Search size={17} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nesta lista" />
          </label>
          <label className="lj-vit-ordem">
            <SlidersHorizontal size={16} />
            <select value={ordem} onChange={(e) => setOrdem(e.target.value)} aria-label="Ordenar">
              {ORDENS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="lj-vit-linha">
          <p className="lj-vit-conta">
            {lista.length} {lista.length === 1 ? "produto" : "produtos"}
            {lista.length !== disponiveis && ` · ${disponiveis} disponíveis`}
          </p>
          <label className="lj-chave">
            <input type="checkbox" checked={soDisp} onChange={(e) => setSoDisp(e.target.checked)} />
            <i aria-hidden />
            Só disponíveis
          </label>
        </div>
      </div>

      {lista.length === 0 ? (
        <p className="lj-vit-vazio">Nada encontrado. Tente outra palavra ou outra categoria.</p>
      ) : (
        <div className="lj-grade" key={`${cat}-${ordem}-${soDisp}`}>
          {lista.map((c, k) => (
            <CartaoProduto key={c.id} c={c} prioridade={k < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
