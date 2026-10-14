"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { Bell, Check, Lock, Minus, Plus, Search, ShoppingBag, X } from "lucide-react";
import { CATEGORIAS, PRODUTOS, brl, type Categoria } from "@/app/palavracomalma/produtos";

const sem = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function Catalogo() {
  const [cat, setCat] = useState<Categoria | "Todos">("Todos");
  const [busca, setBusca] = useState("");
  const [carrinho, setCarrinho] = useState<Record<number, number>>({});
  const [aberto, setAberto] = useState(false);
  const [avisos, setAvisos] = useState<number[]>([]);
  const [checkout, setCheckout] = useState(false);

  const lista = useMemo(
    () =>
      PRODUTOS.filter((p) => (cat === "Todos" || p.categoria === cat) && sem(p.nome).includes(sem(busca.trim()))).sort(
        (a, b) => Number(b.disponivel) - Number(a.disponivel)
      ),
    [cat, busca]
  );

  const itens = Object.entries(carrinho)
    .map(([id, q]) => ({ p: PRODUTOS.find((x) => x.id === Number(id))!, q }))
    .filter((x) => x.q > 0);
  const total = itens.reduce((s, x) => s + x.q * (x.p.promo ?? x.p.preco), 0);
  const qtd = itens.reduce((s, x) => s + x.q, 0);

  const mudar = (id: number, d: number) => setCarrinho((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + d) }));

  return (
    <div className="pa-cel">
      <div className="pa-cel-tela">
        <div className="pa-cat">
          <div className="pa-cat-cupom">
            Primeira compra? Use <b>ALMA10</b> e ganhe 10%
          </div>
          <div className="pa-cat-head">
            <img src="/palavracomalma/logo-claro.png" alt="Palavra com Alma" />
            <button className="pa-cat-sac" onClick={() => setAberto(true)} aria-label="Abrir carrinho">
              <ShoppingBag size={17} />
              {qtd > 0 && <i>{qtd}</i>}
            </button>
          </div>
          <label className="pa-cat-busca">
            <Search size={15} />
            <input value={busca} onChange={(e) => {
                // a busca procura na loja inteira, não só na categoria marcada
                setBusca(e.target.value);
                setCat("Todos");
              }} placeholder="Buscar: caderno, baralho, cabaça..." />
          </label>
          <div className="pa-cat-chips" role="group" aria-label="Categorias">
            {(["Todos", ...CATEGORIAS] as const).map((c) => (
              <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="pa-cat-lista" key={cat + busca}>
            {lista.length === 0 && <p className="pa-cat-vazio">Nada encontrado com “{busca}”.</p>}
            {lista.map((p) => {
              const off = p.promo ? Math.round((1 - p.promo / p.preco) * 100) : 0;
              const avisado = avisos.includes(p.id);
              return (
                <div className={`pa-cat-p${p.disponivel ? "" : " is-off"}`} key={p.id}>
                  <div className="pa-fig">
                    <img src={p.img} alt="" loading="lazy" />
                    {p.disponivel && off > 0 && <span className="pa-cat-off">-{off}%</span>}
                    {!p.disponivel && <span className="pa-cat-esg">Esgotado</span>}
                    {p.disponivel && (
                      <button className="pa-cat-mais" onClick={() => mudar(p.id, 1)} aria-label={`Adicionar ${p.nome}`}>
                        <Plus size={17} />
                      </button>
                    )}
                  </div>
                  <b>{p.nome}</b>
                  {p.disponivel ? (
                    <div>
                      {p.promo && <s>{brl(p.preco)}</s>}
                      <strong>{brl(p.promo ?? p.preco)}</strong>
                    </div>
                  ) : (
                    <button
                      className={`pa-cat-avise${avisado ? " is-ok" : ""}`}
                      onClick={() => setAvisos((a) => (avisado ? a : [...a, p.id]))}
                    >
                      {avisado ? (
                        <>
                          <Check size={11} style={{ display: "inline", verticalAlign: "-1px" }} /> Te avisamos
                        </>
                      ) : (
                        <>
                          <Bell size={11} style={{ display: "inline", verticalAlign: "-1px" }} /> Avise-me
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {aberto && (
          <>
            <div className="pa-gaveta-fundo" onClick={() => setAberto(false)} />
            <aside className="pa-gaveta" aria-label="Carrinho">
              <h4>
                Sua sacola
                <button onClick={() => setAberto(false)} aria-label="Fechar">
                  <X size={18} />
                </button>
              </h4>
              <ul>
                {itens.length === 0 && (
                  <li style={{ display: "block", color: "var(--apagado)" }}>Toque no + de algum produto para ele aparecer aqui.</li>
                )}
                {itens.map(({ p, q }) => (
                  <li key={p.id}>
                    <img src={p.img} alt="" />
                    <div>
                      <b>{p.nome}</b>
                      <span>{brl(p.promo ?? p.preco)}</span>
                      <div className="pa-qtd">
                        <button onClick={() => mudar(p.id, -1)} aria-label="Menos um">
                          <Minus size={12} />
                        </button>
                        {q}
                        <button onClick={() => mudar(p.id, 1)} aria-label="Mais um">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="pa-gaveta-tot">
                Subtotal <strong>{brl(total)}</strong>
              </div>
              <button className="pa-gaveta-fim" disabled={!qtd} onClick={() => setCheckout(true)} style={{ opacity: qtd ? 1 : 0.5 }}>
                Finalizar compra
              </button>
              <p className="pa-gaveta-nota">Frete calculado pelo Tray Envios na próxima tela.</p>
            </aside>
          </>
        )}

        {checkout && (
          <div className="pa-checkout-aviso">
            <div>
              <Lock size={28} color="var(--ouro)" style={{ margin: "0 auto" }} />
              <b>Aqui entra o checkout da Tray</b>
              <p>Pagamento pela Vindi (cartão, boleto e Pix), frete, pedido e nota fiscal: tudo como funciona hoje.</p>
              <button
                onClick={() => {
                  setCheckout(false);
                  setAberto(false);
                }}
              >
                Voltar ao catálogo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
