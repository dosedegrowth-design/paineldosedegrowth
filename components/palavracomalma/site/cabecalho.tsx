"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { BASE, brl, INSTAGRAM, waLink, type Cartao } from "@/app/palavracomalma/site/catalogo";
import { BotaoSacola } from "./sacola";
import { WhatsAppIcon } from "./whatsapp";

export type ItemMenu = { id: number; nome: string; slug: string; filhas: { id: number; nome: string; slug: string }[] };

const RECADOS = [
  "Produção própria, feita à mão",
  "Personalize capa, miolo e cartas",
  "Enviamos para todo o Brasil",
  "Pix, cartão ou boleto",
];

const sem = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function Cabecalho({ menu, cartoes }: { menu: ItemMenu[]; cartoes: Cartao[] }) {
  const caminho = usePathname();
  const naHome = caminho === BASE || caminho === `${BASE}/`;
  const [rolou, setRolou] = useState(false);
  const [escondido, setEscondido] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [busca, setBusca] = useState(false);
  const [recado, setRecado] = useState(0);
  const ultimoY = useRef(0);

  useEffect(() => {
    const rolar = () => {
      const y = window.scrollY;
      setRolou(y > 30);
      setEscondido(y > 220 && y > ultimoY.current + 4);
      if (y < ultimoY.current - 4) setEscondido(false);
      ultimoY.current = y;
    };
    rolar();
    window.addEventListener("scroll", rolar, { passive: true });
    return () => window.removeEventListener("scroll", rolar);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setRecado((r) => (r + 1) % RECADOS.length), 3800);
    return () => clearInterval(t);
  }, []);

  // fecha menus ao trocar de página
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reação à navegação
    setMenuAberto(false);
    setBusca(false);
  }, [caminho]);

  useEffect(() => {
    document.documentElement.style.overflow = menuAberto || busca ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuAberto, busca]);

  const transparente = naHome && !rolou && !menuAberto;

  return (
    <>
      <div className="lj-recado" aria-live="polite">
        <span key={recado}>{RECADOS[recado]}</span>
      </div>
      <header
        className={`lj-topo${transparente ? " is-transp" : ""}${escondido && !menuAberto ? " is-escondido" : ""}`}
      >
        <div className="lj-topo-in">
          <button className="lj-icone-btn lj-so-cel" onClick={() => setMenuAberto((v) => !v)} aria-label="Abrir menu">
            {menuAberto ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link href={BASE} className="lj-marca" aria-label="Palavra com Alma, início">
            <img src="/palavracomalma/logo-claro.png" alt="Palavra com Alma" width={900} height={385} />
          </Link>

          <nav className="lj-nav" aria-label="Categorias">
            {menu.map((c) => (
              <div className="lj-nav-item" key={c.id}>
                <Link href={`${BASE}/loja?c=${encodeURIComponent(c.slug)}`}>
                  {c.nome}
                  {c.filhas.length > 0 && <ChevronDown size={14} />}
                </Link>
                {c.filhas.length > 0 && (
                  <div className="lj-nav-sub">
                    <Link href={`${BASE}/loja?c=${encodeURIComponent(c.slug)}`}>Ver tudo em {c.nome}</Link>
                    {c.filhas.map((f) => (
                      <Link key={f.id} href={`${BASE}/loja?c=${encodeURIComponent(f.slug)}`}>
                        {f.nome}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="lj-topo-acoes">
            <button className="lj-icone-btn" onClick={() => setBusca(true)} aria-label="Buscar">
              <Search size={21} />
            </button>
            <BotaoSacola />
          </div>
        </div>
      </header>

      {menuAberto && (
        <div className="lj-menu-cel">
          <nav>
            <Link href={`${BASE}/loja`} className="lj-menu-n">
              <i>01</i> Toda a loja
            </Link>
            {menu.map((c, k) => (
              <div key={c.id}>
                <Link href={`${BASE}/loja?c=${encodeURIComponent(c.slug)}`} className="lj-menu-n">
                  <i>{String(k + 2).padStart(2, "0")}</i> {c.nome}
                </Link>
                {c.filhas.length > 0 && (
                  <div className="lj-menu-filhas">
                    {c.filhas.map((f) => (
                      <Link key={f.id} href={`${BASE}/loja?c=${encodeURIComponent(f.slug)}`}>
                        {f.nome}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="lj-menu-contato">
            <a href={waLink("Oi, Palavra com Alma! Vim pelo site.")} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={18} /> WhatsApp
            </a>
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
              @loja.palavracomalma
            </a>
          </div>
        </div>
      )}

      {busca && <Busca cartoes={cartoes} fechar={() => setBusca(false)} />}
    </>
  );
}

function Busca({ cartoes, fechar }: { cartoes: Cartao[]; fechar: () => void }) {
  const [q, setQ] = useState("");
  const campo = useRef<HTMLInputElement>(null);
  useEffect(() => {
    campo.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [fechar]);

  const achados = useMemo(() => {
    const t = sem(q.trim());
    if (t.length < 2) return [];
    return cartoes
      .filter((c) => sem(c.nome + " " + c.catNome).includes(t))
      .sort((a, b) => Number(b.disponivel) - Number(a.disponivel))
      .slice(0, 8);
  }, [q, cartoes]);

  const sugestoes = ["Caderno", "Baralho", "Cabaça", "Caveira", "Chaveiro", "Orixás"];

  return (
    <div className="lj-busca" role="dialog" aria-modal="true" aria-label="Buscar produtos">
      <div className="lj-busca-fundo" onClick={fechar} />
      <div className="lj-busca-caixa">
        <div className="lj-busca-campo">
          <Search size={20} />
          <input ref={campo} value={q} onChange={(e) => setQ(e.target.value)} placeholder="O que você procura?" />
          <button className="lj-icone-btn" onClick={fechar} aria-label="Fechar busca">
            <X size={20} />
          </button>
        </div>
        {q.trim().length < 2 ? (
          <div className="lj-busca-sug">
            <span>Mais buscados</span>
            <div>
              {sugestoes.map((s) => (
                <button key={s} onClick={() => setQ(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : achados.length === 0 ? (
          <p className="lj-busca-vazio">Nada encontrado para “{q}”.</p>
        ) : (
          <ul className="lj-busca-lista">
            {achados.map((c) => (
              <li key={c.id}>
                <Link href={`${BASE}/produto/${c.id}`}>
                  <img src={c.img} alt="" loading="lazy" />
                  <span>
                    <b>{c.nome}</b>
                    <small>{c.catNome}</small>
                  </span>
                  <em>{c.disponivel ? brl(c.promo ?? c.preco) : "Esgotado"}</em>
                </Link>
              </li>
            ))}
            <li className="lj-busca-todos">
              <Link href={`${BASE}/loja?q=${encodeURIComponent(q)}`}>Ver todos os resultados</Link>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
