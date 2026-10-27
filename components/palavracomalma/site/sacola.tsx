"use client";
/* eslint-disable @next/next/no-img-element */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Lock, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { BASE, brl } from "@/app/palavracomalma/site/catalogo";

export type ItemSacola = {
  chave: string;
  pid: number;
  vid?: number;
  nome: string;
  detalhe?: string;
  preco: number;
  img: string;
  qtd: number;
  /** Fator do parcelamento em 3x com juros da Vindi, tirado da Tray. */
  fator?: number;
};

type Ctx = {
  itens: ItemSacola[];
  qtd: number;
  total: number;
  aberta: boolean;
  abrir: () => void;
  fechar: () => void;
  adicionar: (item: Omit<ItemSacola, "chave" | "qtd">, origem?: HTMLElement | null) => void;
  mudar: (chave: string, delta: number) => void;
  pulso: number;
};

const SacolaCtx = createContext<Ctx | null>(null);
const CHAVE = "pca-sacola-v1";

export function useSacola() {
  const c = useContext(SacolaCtx);
  if (!c) throw new Error("useSacola fora do provider");
  return c;
}

/** Foto que voa da origem até o ícone da sacola. */
function voar(origem: HTMLElement, img: string) {
  const alvo = document.querySelector<HTMLElement>("[data-lj-sacola]");
  if (!alvo || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const a = origem.getBoundingClientRect();
  const b = alvo.getBoundingClientRect();
  const el = document.createElement("img");
  el.src = img;
  el.alt = "";
  el.className = "lj-voando";
  const lado = Math.min(a.width, 120);
  Object.assign(el.style, {
    left: `${a.left + a.width / 2 - lado / 2}px`,
    top: `${a.top + a.height / 2 - (lado * 4) / 6}px`,
    width: `${lado}px`,
  });
  document.body.appendChild(el);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  el.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(.6)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.15)`, opacity: 0.3 },
    ],
    { duration: 750, easing: "cubic-bezier(.5,0,.3,1)" }
  ).onfinish = () => el.remove();
}

export function SacolaProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemSacola[]>([]);
  const [aberta, setAberta] = useState(false);
  const [pulso, setPulso] = useState(0);
  const carregou = useRef(false);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do armazenamento do navegador
      if (salvo) setItens(JSON.parse(salvo));
    } catch {}
    carregou.current = true;
  }, []);

  useEffect(() => {
    if (!carregou.current) return;
    try {
      localStorage.setItem(CHAVE, JSON.stringify(itens));
    } catch {}
  }, [itens]);

  const adicionar = useCallback<Ctx["adicionar"]>((item, origem) => {
    const chave = `${item.pid}:${item.vid ?? 0}`;
    setItens((atual) => {
      const ja = atual.find((i) => i.chave === chave);
      if (ja) return atual.map((i) => (i.chave === chave ? { ...i, qtd: i.qtd + 1 } : i));
      return [...atual, { ...item, chave, qtd: 1 }];
    });
    if (origem) voar(origem, item.img);
    setTimeout(() => setPulso((p) => p + 1), origem ? 700 : 0);
  }, []);

  const mudar = useCallback((chave: string, delta: number) => {
    setItens((atual) =>
      atual.flatMap((i) => (i.chave !== chave ? [i] : i.qtd + delta <= 0 ? [] : [{ ...i, qtd: i.qtd + delta }]))
    );
  }, []);

  const valor = useMemo<Ctx>(
    () => ({
      itens,
      qtd: itens.reduce((s, i) => s + i.qtd, 0),
      total: itens.reduce((s, i) => s + i.qtd * i.preco, 0),
      aberta,
      abrir: () => setAberta(true),
      fechar: () => setAberta(false),
      adicionar,
      mudar,
      pulso,
    }),
    [itens, aberta, adicionar, mudar, pulso]
  );

  return (
    <SacolaCtx.Provider value={valor}>
      {children}
      <Gaveta />
    </SacolaCtx.Provider>
  );
}

function Gaveta() {
  const { itens, aberta, fechar, mudar, total, qtd } = useSacola();
  useEffect(() => {
    if (!aberta) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    document.addEventListener("keydown", esc);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.documentElement.style.overflow = "";
    };
  }, [aberta, fechar]);

  if (!aberta) return null;
  return (
    <div className="lj-gav-raiz" role="dialog" aria-modal="true" aria-label="Sua sacola">
      <div className="lj-gav-fundo" onClick={fechar} />
      <aside className="lj-gav">
        <header className="lj-gav-topo">
          <h2>
            Sua sacola <span>{qtd > 0 ? `${qtd} ${qtd === 1 ? "item" : "itens"}` : ""}</span>
          </h2>
          <button onClick={fechar} aria-label="Fechar sacola" className="lj-icone-btn">
            <X size={20} />
          </button>
        </header>

        {itens.length === 0 ? (
          <div className="lj-gav-vazia">
            <ShoppingBag size={34} />
            <p>Sua sacola está vazia.</p>
            <Link href={`${BASE}/loja`} className="lj-btn is-claro" onClick={fechar}>
              Ver a loja
            </Link>
          </div>
        ) : (
          <>
            <ul className="lj-gav-lista">
              {itens.map((i) => (
                <li key={i.chave}>
                  <Link href={`${BASE}/produto/${i.pid}`} onClick={fechar} className="lj-gav-foto">
                    <img src={i.img} alt="" />
                  </Link>
                  <div>
                    <Link href={`${BASE}/produto/${i.pid}`} onClick={fechar} className="lj-gav-nome">
                      {i.nome}
                    </Link>
                    {i.detalhe && <span className="lj-gav-det">{i.detalhe}</span>}
                    <div className="lj-gav-linha">
                      <div className="lj-qtd">
                        <button onClick={() => mudar(i.chave, -1)} aria-label="Menos um">
                          <Minus size={14} />
                        </button>
                        <span>{i.qtd}</span>
                        <button onClick={() => mudar(i.chave, 1)} aria-label="Mais um">
                          <Plus size={14} />
                        </button>
                      </div>
                      <strong>{brl(i.preco * i.qtd)}</strong>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="lj-gav-rodape">
              <div className="lj-gav-total">
                <span>Subtotal</span>
                <strong>{brl(total)}</strong>
              </div>
              <p>Frete calculado na próxima etapa. Pix, boleto ou cartão em até 3x.</p>
              <Link href={`${BASE}/finalizar`} className="lj-btn is-ouro is-cheio" onClick={fechar}>
                <Lock size={16} /> Finalizar compra
              </Link>
              <button className="lj-gav-continuar" onClick={fechar}>
                Continuar comprando
              </button>
            </footer>
          </>
        )}

      </aside>
    </div>
  );
}

export function BotaoSacola() {
  const { qtd, abrir, pulso } = useSacola();
  return (
    <button className="lj-icone-btn lj-sacola-btn" onClick={abrir} aria-label={`Abrir sacola, ${qtd} itens`} data-lj-sacola>
      <ShoppingBag size={21} />
      {qtd > 0 && (
        <i key={pulso} className="lj-sacola-n">
          {qtd}
        </i>
      )}
    </button>
  );
}
