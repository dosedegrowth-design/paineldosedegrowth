"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { brl, porId, type Produto } from "@/app/palavracomalma/produtos";

const TIPOS = [
  { id: "deslizar", nome: "Deslizar", texto: "A nova tela entra pelo lado, como num aplicativo. É a mais natural no celular." },
  { id: "esmaecer", nome: "Esmaecer", texto: "Uma tela some e a outra aparece devagar. Discreta e elegante." },
  { id: "cortina", nome: "Cortina", texto: "A nova tela desce de cima para baixo, como uma cortina abrindo." },
  { id: "portal", nome: "Portal", texto: "A tela nova se abre num círculo a partir do ponto onde a pessoa tocou." },
  { id: "pagina", nome: "Página de livro", texto: "A tela vira como a página de um caderno. Combina com a loja." },
  { id: "ouro", nome: "Cortina com logo", texto: "Uma cortina vinho com o seu logo passa entre uma tela e outra. Momento de marca." },
];

const LISTA = [203, 263, 189, 267].map(porId);

type Tela = { tipo: "home" } | { tipo: "produto"; p: Produto };

export function Passagens() {
  const [tipo, setTipo] = useState("deslizar");
  const [atual, setAtual] = useState<Tela>({ tipo: "home" });
  const [anterior, setAnterior] = useState<Tela | null>(null);
  const [anim, setAnim] = useState("");
  const [rodada, setRodada] = useState(0);
  const [ouro, setOuro] = useState(0);
  const [ponto, setPonto] = useState({ x: 50, y: 50 });
  const tela = useRef<HTMLDivElement>(null);
  const t = TIPOS.find((x) => x.id === tipo)!;

  function ir(prox: Tela, voltando: boolean, e?: React.MouseEvent) {
    if (e && tela.current) {
      const r = tela.current.getBoundingClientRect();
      setPonto({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
    }
    if (tipo === "ouro") {
      setOuro((o) => o + 1);
      setTimeout(() => {
        setAnterior(null);
        setAnim("");
        setAtual(prox);
      }, 520);
      return;
    }
    setAnterior(atual);
    setAnim(tipo === "deslizar" && voltando ? "voltar" : tipo);
    setAtual(prox);
    setRodada((r) => r + 1);
  }

  function render(s: Tela) {
    if (s.tipo === "home") {
      return (
        <>
          <div className="pa-pas-head">
            <img src="/palavracomalma/logo-claro.png" alt="" />
            <ShoppingBag size={17} color="var(--ouro-2)" />
          </div>
          <p className="pa-pas-titulo">MAIS VENDIDOS</p>
          <div className="pa-pas-grid">
            {LISTA.map((p) => (
              <button key={p.id} onClick={(e) => ir({ tipo: "produto", p }, false, e)}>
                <img src={p.img} alt="" />
                <b>{p.nome}</b>
                <span>{brl(p.promo ?? p.preco)}</span>
              </button>
            ))}
          </div>
        </>
      );
    }
    const p = s.p;
    return (
      <>
        <div className="pa-pas-head">
          <button onClick={(e) => ir({ tipo: "home" }, true, e)}>
            <ChevronLeft size={16} /> Voltar
          </button>
          <ShoppingBag size={17} color="var(--ouro-2)" />
        </div>
        <div className="pa-pas-prod">
          <img src={p.img} alt="" />
          <div>
            <h4>{p.nome}</h4>
            <p>Feito à mão, com produção própria.</p>
            <strong>{brl(p.promo ?? p.preco)}</strong>
            <i>Adicionar ao carrinho</i>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="pa-demo">
      <div className="pa-cel">
        <div className="pa-cel-tela" ref={tela} style={{ ["--px" as string]: `${ponto.x}%`, ["--py" as string]: `${ponto.y}%` }}>
          {anterior && <div className="pa-pas-tela">{render(anterior)}</div>}
          <div
            key={`tela-${rodada}`}
            className={`pa-pas-tela is-por-cima${anim ? ` pa-in-${anim}` : ""}`}
            onAnimationEnd={() => setAnterior(null)}
          >
            {render(atual)}
          </div>
          {ouro > 0 && (
            <div key={`ouro-${ouro}`} className="pa-cortina-ouro">
              <img src="/palavracomalma/logo-claro.png" alt="" />
            </div>
          )}
        </div>
      </div>
      <div className="pa-demo-lado">
        <div>
          <p className="pa-sel-t">1. Escolha a passagem</p>
          <div className="pa-sel" role="group" aria-label="Tipos de passagem">
            {TIPOS.map((x) => (
              <button key={x.id} aria-pressed={x.id === tipo} onClick={() => setTipo(x.id)}>
                {x.nome}
              </button>
            ))}
          </div>
        </div>
        <p className="pa-explica">
          <b>{t.nome}:</b> {t.texto}
        </p>
        <p className="pa-explica">
          <b>2. Toque num produto</b> dentro do celular para abrir a página dele, e em <b>Voltar</b> para retornar. Troque a
          passagem e teste de novo.
        </p>
      </div>
    </div>
  );
}
