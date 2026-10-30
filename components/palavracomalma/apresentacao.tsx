"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Maximize2, Minimize2, X, ZoomIn } from "lucide-react";

// Apresentação comercial do projeto Palavra com Alma: 6 slides, tela cheia.
// Todos os prints vêm do preview publicado (painel.dosedegrowth.com/palavracomalma/site)
// e da loja atual (palavracomalma.com.br), capturados em 29/out/2026.

const F = "/palavracomalma/apresentacao";
const TOTAL = 6;

// Todo print é clicável: abre no meio da tela (ZoomTela). Os dados vão em data-* para a
// apresentação montar a fila de prints do slide sem cada mockup precisar saber dela.
function Navegador({ src, url, alt, className = "" }: { src: string; url: string; alt: string; className?: string }) {
  return (
    <div className={`ap-nav ${className}`} data-zoom="nav" data-src={src} data-alt={alt} data-url={url}>
      <span className="ap-ampliar" aria-hidden>
        <ZoomIn />
      </span>
      <div className="ap-nav-barra" aria-hidden>
        <i />
        <i />
        <i />
        <span>{url}</span>
      </div>
      <img src={src} alt={alt} width={2000} height={1250} />
    </div>
  );
}

function Celular({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`ap-cel ${className}`} data-zoom="cel" data-src={src} data-alt={alt}>
      <span className="ap-ampliar" aria-hidden>
        <ZoomIn />
      </span>
      <img src={src} alt={alt} width={800} height={1731} />
    </div>
  );
}

const ESTRELAS = Array.from({ length: 26 }, (_, k) => {
  const r = (n: number) => ((Math.sin(k * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  const q = (v: number) => Math.round(v * 100) / 100;
  return { t: q(r(1) * 100), l: q(r(2) * 100), z: q(1 + r(3) * 2), d: q(3 + r(4) * 4), a: q(r(5) * 5) };
});
function Ceu() {
  return (
    <div className="ap-ceu" aria-hidden>
      {ESTRELAS.map((e, k) => (
        <i
          key={k}
          style={{
            top: `${e.t}%`,
            left: `${e.l}%`,
            width: e.z,
            height: e.z,
            animationDuration: `${e.d}s`,
            animationDelay: `${e.a}s`,
          }}
        />
      ))}
    </div>
  );
}

function Rodape({ n }: { n: number }) {
  return (
    <div className="ap-rod" aria-hidden>
      <span>
        <b>{String(n).padStart(2, "0")}</b> Palavra com Alma · Proposta de evolução da loja virtual · Dose de Growth
      </span>
    </div>
  );
}

const d = (n: number) => ({ ["--d" as string]: String(n) }) as React.CSSProperties;

type ItemZoom = { tipo: "nav" | "cel"; src: string; alt: string; url: string; legenda: string; el: HTMLElement };
type EstadoZoom = { itens: ItemZoom[]; i: number; troca: boolean; fechando: boolean };

const VOO = { duration: 560, easing: "cubic-bezier(.2,.85,.25,1)" };
const semMovimento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Transform que leva o quadro (no meio da tela) de volta ao lugar e ao tamanho do print no slide. */
function noLugar(quadro: HTMLElement, origem: HTMLElement) {
  const t = quadro.getBoundingClientRect();
  const o = origem.getBoundingClientRect();
  return `translate(${o.left - t.left}px, ${o.top - t.top}px) scale(${o.width / t.width}, ${o.height / t.height})`;
}

/** O print aberto no meio da tela: sai do lugar dele no slide, cresce, e volta ao fechar. */
function ZoomTela({
  z,
  onIr,
  onFechar,
  onFim,
}: {
  z: EstadoZoom;
  onIr: (i: number) => void;
  onFechar: () => void;
  onFim: () => void;
}) {
  const quadro = useRef<HTMLDivElement>(null);
  const fundo = useRef<HTMLDivElement>(null);
  const item = z.itens[z.i];
  const total = z.itens.length;

  // o print some do slide enquanto está aberto no meio (parece que saiu de lá)
  useEffect(() => {
    const origem = item.el.classList;
    origem.add("is-zoom-origem");
    return () => origem.remove("is-zoom-origem");
  }, [item]);

  // abrir
  useLayoutEffect(() => {
    if (!quadro.current || semMovimento()) return;
    quadro.current.animate([{ transform: noLugar(quadro.current, item.el) }, { transform: "none" }], VOO);
    fundo.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: "ease-out" });
    // só na abertura; trocar de print usa a animação de CSS
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fechar: volta para o lugar do print que está aberto agora
  useEffect(() => {
    if (!z.fechando) return;
    if (!quadro.current || semMovimento()) return onFim();
    const voo = quadro.current.animate([{ transform: "none" }, { transform: noLugar(quadro.current, item.el) }], {
      ...VOO,
      duration: 460,
      fill: "forwards",
    });
    fundo.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: "ease-in", fill: "forwards" });
    voo.onfinish = onFim;
  }, [z.fechando, item, onFim]);

  return (
    <div
      className={`ap-zoom${z.fechando ? " is-fechando" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={item.legenda}
      onClick={onFechar}
    >
      <div className="ap-zoom-fundo" ref={fundo} />
      <div key={z.i} ref={quadro} className={`ap-zoom-quadro is-${item.tipo}${z.troca ? " is-troca" : ""}`}>
        {item.tipo === "nav" ? (
          <div className="ap-nav">
            <div className="ap-nav-barra" aria-hidden>
              <i />
              <i />
              <i />
              <span>{item.url}</span>
            </div>
            <img src={item.src} alt={item.alt} width={2000} height={1250} />
          </div>
        ) : (
          <div className="ap-cel">
            <img src={item.src} alt={item.alt} width={800} height={1731} />
          </div>
        )}
      </div>
      <div className="ap-zoom-info" onClick={(e) => e.stopPropagation()}>
        {total > 1 && (
          <button onClick={() => onIr(z.i - 1)} disabled={z.i === 0} aria-label="Print anterior">
            <ChevronLeft size={18} />
          </button>
        )}
        <span>{item.legenda}</span>
        {total > 1 && (
          <>
            <small>
              {z.i + 1} / {total}
            </small>
            <button onClick={() => onIr(z.i + 1)} disabled={z.i === total - 1} aria-label="Próximo print">
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>
      <button className="ap-zoom-fechar" aria-label="Fechar">
        <X size={20} />
      </button>
    </div>
  );
}

export function Apresentacao() {
  const [atual, setAtual] = useState(0);
  const [cheia, setCheia] = useState(false);
  // o valor do slide 5 começa escondido numa carta virada; vira no clique ou no "avançar"
  const [revelado, setRevelado] = useState(false);
  const toque = useRef<{ x: number; y: number } | null>(null);
  // print aberto no meio da tela
  const [zoom, setZoom] = useState<EstadoZoom | null>(null);
  const fecharZoom = useCallback(() => setZoom((z) => (z ? { ...z, fechando: true } : z)), []);
  const fimZoom = useCallback(() => setZoom(null), []);
  const irZoom = useCallback(
    (i: number) => setZoom((z) => (z && !z.fechando && i >= 0 && i < z.itens.length ? { ...z, i, troca: true } : z)),
    []
  );
  // com um print aberto, "avançar" e "voltar" andam pelos prints do slide; passando do último ou do primeiro, fecha
  const passoZoom = useCallback(
    (passo: 1 | -1) => {
      if (!zoom || zoom.fechando) return;
      const i = zoom.i + passo;
      if (i < 0 || i >= zoom.itens.length) fecharZoom();
      else irZoom(i);
    },
    [zoom, fecharZoom, irZoom]
  );

  const abrirZoom = useCallback((e: React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-zoom]");
    const slide = el?.closest(".ap-slide");
    if (!el || !slide) return;
    const els = Array.from(slide.querySelectorAll<HTMLElement>("[data-zoom]"));
    const itens = els.map((x) => ({
      tipo: x.dataset.zoom === "cel" ? ("cel" as const) : ("nav" as const),
      src: x.dataset.src ?? "",
      alt: x.dataset.alt ?? "",
      url: x.dataset.url ?? "",
      legenda: x.closest("figure")?.querySelector("figcaption")?.textContent?.trim() || x.dataset.alt || "",
      el: x,
    }));
    setZoom({ itens, i: els.indexOf(el), troca: false, fechando: false });
  }, []);

  const ir = useCallback((n: number) => {
    const alvo = Math.max(0, Math.min(TOTAL - 1, n));
    setAtual(alvo);
    history.replaceState(null, "", `#${alvo + 1}`);
  }, []);

  const avancar = useCallback(() => {
    if (atual === 4 && !revelado) setRevelado(true);
    else ir(atual + 1);
  }, [atual, revelado, ir]);

  const telaCheia = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    // o slide vem da âncora da URL (#1 a #6), na abertura e quando ela muda
    const lerAncora = () => {
      const n = parseInt(location.hash.slice(1), 10);
      if (n >= 1 && n <= TOTAL) setAtual(n - 1);
    };
    lerAncora();
    const fs = () => setCheia(Boolean(document.fullscreenElement));
    window.addEventListener("hashchange", lerAncora);
    document.addEventListener("fullscreenchange", fs);
    return () => {
      window.removeEventListener("hashchange", lerAncora);
      document.removeEventListener("fullscreenchange", fs);
    };
  }, []);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (zoom) {
        if (k === "Escape") fecharZoom();
        else if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(k)) {
          e.preventDefault();
          passoZoom(1);
        } else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k)) {
          e.preventDefault();
          passoZoom(-1);
        } else if (k === "f" || k === "F") telaCheia();
        return;
      }
      if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(k)) {
        e.preventDefault();
        avancar();
      } else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k)) {
        e.preventDefault();
        ir(atual - 1);
      } else if (k === "Home") ir(0);
      else if (k === "End") ir(TOTAL - 1);
      else if (k === "f" || k === "F") telaCheia();
      else if (/^[1-6]$/.test(k)) ir(Number(k) - 1);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [atual, ir, avancar, telaCheia, zoom, fecharZoom, passoZoom]);

  const cls = (n: number, extra: string) => `ap-slide ${extra}${n === atual ? " is-ativo" : ""}`;

  return (
    <div
      className="ap"
      onClick={(e) => {
        if (!zoom) abrirZoom(e);
      }}
      onTouchStart={(e) => (toque.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        if (!toque.current) return;
        const dx = e.changedTouches[0].clientX - toque.current.x;
        const dy = e.changedTouches[0].clientY - toque.current.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          if (zoom) passoZoom(dx < 0 ? 1 : -1);
          else if (dx < 0) avancar();
          else ir(atual - 1);
        }
        toque.current = null;
      }}
    >
      {/* ============ 1. CAPA ============ */}
      <section className={cls(0, "is-escuro ap-s1")} aria-hidden={atual !== 0} aria-label="Capa">
        <Ceu />
        <div className="ap-quadro">
          <div className="ap-capa-txt">
            <img className="ap-logo ap-in" style={d(0)} src="/palavracomalma/logo-claro.png" alt="Loja Palavra com Alma" width={900} height={385} />
            <p className="ap-rotulo ap-in" style={d(1)}>
              Proposta de evolução da loja virtual
            </p>
            <h1 className="ap-in" style={d(2)}>
              Palavra com Alma
            </h1>
            <p className="ap-capa-sub ap-in" style={d(3)}>
              Uma <em>nova experiência</em> para a sua loja virtual.
            </p>
            <p className="ap-assina ap-in" style={d(4)}>
              Preparado para Natália · Dose de Growth
            </p>
          </div>
          <div className="ap-capa-telas">
            <Navegador className="ap-in" src={`${F}/novo-home.webp`} url="prévia do novo site" alt="Abertura do novo site, no computador" />
            <Celular className="ap-capa-cel ap-in" src={`${F}/novo-home-cel.webp`} alt="Abertura do novo site, no celular" />
          </div>
        </div>
        <Rodape n={1} />
      </section>

      {/* ============ 2. A PROPOSTA ============ */}
      <section className={cls(1, "is-claro ap-s2")} aria-hidden={atual !== 1} aria-label="A proposta">
        <div className="ap-quadro">
          <div className="ap-cab">
            <p className="ap-rotulo ap-in" style={d(0)}>
              A proposta
            </p>
            <h2 className="ap-in" style={d(1)}>
              Uma loja com a <em>identidade</em> da sua marca
            </h2>
            <p className="ap-sub ap-in" style={d(2)}>
              Mais do que trocar cores ou instalar um tema pronto: uma experiência desenhada a partir dos seus produtos.
            </p>
          </div>
          <div className="ap-s2-corpo">
          <div className="ap-compara">
            <figure className="ap-in" style={d(3)}>
              <Navegador src={`${F}/atual-home.webp`} url="palavracomalma.com.br" alt="Página inicial da loja atual" />
              <figcaption>Loja atual</figcaption>
            </figure>
            <span className="ap-seta ap-in" style={d(4)} aria-hidden>
              <ArrowRight />
            </span>
            <figure className="ap-in" style={d(5)}>
              <Navegador src={`${F}/novo-home.webp`} url="prévia do novo site" alt="Página inicial do novo site" />
              <figcaption>
                <b>Proposta</b>
              </figcaption>
            </figure>
          </div>
          <ul className="ap-beneficios">
            {[
              "Identidade visual própria",
              "Produtos mais organizados",
              "Navegação mais intuitiva",
              "Compra pensada para cada tipo de produto",
              "Liberdade para evoluir o visual",
            ].map((t, k) => (
              <li key={t} className="ap-in" style={d(6 + k)}>
                <i>{k + 1}</i>
                {t}
              </li>
            ))}
          </ul>
          </div>
        </div>
        <Rodape n={2} />
      </section>

      {/* ============ 3. O NOVO SITE ============ */}
      <section className={cls(2, "is-escuro ap-s3")} aria-hidden={atual !== 2} aria-label="O novo site">
        <Ceu />
        <div className="ap-quadro">
          <div className="ap-cab is-linha">
            <div>
              <p className="ap-rotulo ap-in" style={d(0)}>
                O novo site
              </p>
              <h2 className="ap-in" style={d(1)}>
                Como fica a <em>nova loja</em>
              </h2>
            </div>
            <p className="ap-selo ap-in" style={d(2)}>
              Prévia navegável com os <b>70 produtos reais</b> da loja
            </p>
          </div>
          <div className="ap-mostra">
            <figure className="ap-m-cel ap-in" style={d(3)}>
              <Celular src={`${F}/novo-home-cel.webp`} alt="Abertura no celular, com o espaço do vídeo" />
              <figcaption>Abertura com espaço para o vídeo</figcaption>
            </figure>
            <figure className="ap-m-grande ap-in" style={d(4)}>
              <Navegador src={`${F}/novo-catalogo.webp`} url="prévia do novo site / baralhos" alt="Catálogo com categorias e filtros" />
              <figcaption>Categorias, filtros e catálogo</figcaption>
            </figure>
            <div className="ap-m-pilha">
              <figure className="ap-in" style={d(5)}>
                <Navegador src={`${F}/novo-busca.webp`} url="prévia do novo site" alt="Busca com resultados na hora" />
                <figcaption>Busca com resultado na hora</figcaption>
              </figure>
              <figure className="ap-in" style={d(6)}>
                <Navegador src={`${F}/novo-produto.webp`} url="prévia do novo site / produto" alt="Página de produto com variações e preço" />
                <figcaption>Produto com variações e preço no Pix</figcaption>
              </figure>
            </div>
            <figure className="ap-m-cel ap-in" style={d(7)}>
              <Celular src={`${F}/novo-sacola-cel.webp`} alt="Sacola lateral no celular" />
              <figcaption>Sacola lateral</figcaption>
            </figure>
          </div>
        </div>
        <Rodape n={3} />
      </section>

      {/* ============ 4. PERSONALIZAÇÃO ============ */}
      <section className={cls(3, "is-claro ap-s4")} aria-hidden={atual !== 3} aria-label="Personalização">
        <div className="ap-quadro">
          <div className="ap-cab">
            <p className="ap-rotulo ap-in" style={d(0)}>
              Personalização
            </p>
            <h2 className="ap-in" style={d(1)}>
              Identidade própria, <em>estrutura da Tray</em>
            </h2>
          </div>
          <div className="ap-lados">
            <div className="ap-lado is-nosso ap-in" style={d(2)}>
              <h3>Desenvolvido sob medida</h3>
              <p>O que a cliente vê e por onde ela navega.</p>
              <ul>
                {[
                  "Página inicial",
                  "Categorias e catálogo",
                  "Busca e filtros",
                  "Páginas de produto",
                  "Cabeçalho e rodapé",
                  "Sacola lateral",
                  "Animações e elementos da marca",
                ].map((t) => (
                  <li key={t}>
                    <Check size={16} /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="ap-ponte ap-in" style={d(3)} aria-hidden>
              <span>vitrine</span>
              <ArrowRight />
              <span>pedido</span>
            </div>
            <div className="ap-lado is-tray ap-in" style={d(4)}>
              <div>
                <h3>Mantido pela Tray</h3>
                <p>Onde o pedido é processado.</p>
                <ul>
                  {[
                    "Checkout e finalização do pedido",
                    "Integração com pagamentos",
                    "Cálculo e operação do frete",
                    "Login e área do cliente",
                    "Estruturas da plataforma",
                  ].map((t) => (
                    <li key={t}>
                      <Check size={16} /> {t}
                    </li>
                  ))}
                </ul>
                <div className="ap-integra">
                  <span>Vindi</span>
                  <span>Tray Envios</span>
                  <span>Mercado Livre</span>
                </div>
              </div>
              <figure>
                <Celular src={`${F}/tray-carrinho-cel.webp`} alt="Carrinho da Tray com as cores da marca" />
                <figcaption>Carrinho da Tray com as cores da marca</figcaption>
              </figure>
            </div>
          </div>
          <div className="ap-notas">
            <p className="ap-in" style={d(5)}>
              <b>Plano Loja 2</b> O Loja 1 não libera o tema próprio. A migração é o primeiro passo técnico.
            </p>
            <p className="ap-in" style={d(6)}>
              <b>Testado antes de publicar</b> Pagamento, frete e Mercado Livre validados no tema novo antes de ir ao ar.
            </p>
          </div>
        </div>
        <Rodape n={4} />
      </section>

      {/* ============ 5. INVESTIMENTO ============ */}
      <section className={cls(4, "is-escuro is-vinho ap-s5")} aria-hidden={atual !== 4} aria-label="Investimento">
        <Ceu />
        <div className="ap-quadro">
          <div className="ap-preco">
            <p className="ap-rotulo ap-in" style={d(0)}>
              Investimento
            </p>
            <button
              type="button"
              className={`ap-revela ap-in${revelado ? " is-revelado" : ""}`}
              style={d(1)}
              onClick={() => setRevelado(true)}
              aria-label={revelado ? "Investimento: R$ 6.500" : "Revelar o investimento"}
            >
              <span className="ap-revela-in">
                <span className="ap-revela-verso" aria-hidden>
                  <img src="/palavracomalma/logo-claro.png" alt="" width={900} height={385} />
                  <i>
                    <span className="ap-so-mouse">Clique</span>
                    <span className="ap-so-toque">Toque</span> para revelar
                  </i>
                </span>
                <span className="ap-revela-frente" aria-hidden={!revelado}>
                  <span className="ap-valor">R$ 6.500</span>
                </span>
              </span>
            </button>
            <p className="ap-valor-sub ap-in" style={d(2)}>
              Desenvolvimento completo do tema personalizado
            </p>
            <div className="ap-prazo ap-in" style={d(3)}>
              <span>Prazo estimado</span>
              <b>30 a 45 dias</b>
              <small>Da liberação dos acessos e materiais até os testes e a aprovação final.</small>
            </div>
            <ul className="ap-obs ap-in" style={d(4)}>
              <li>Condições comerciais a combinar nesta conversa.</li>
              <li>O plano Loja 2 é contratado à parte, direto com a Tray.</li>
            </ul>
          </div>
          <div className="ap-arcos">
            {[
              { src: "/palavracomalma/p/203.jpg", alt: "Caderno Oxóssi da Coleção Orixás" },
              { src: "/palavracomalma/p/259.jpg", alt: "Deck Grande Realista, capa caveira" },
              { src: "/palavracomalma/p/189.jpg", alt: "Magia no Espelho" },
            ].map((f, k) => (
              <span key={f.src} className="ap-arco ap-in" style={d(2 + k)}>
                <img src={f.src} alt={f.alt} />
              </span>
            ))}
            <p className="ap-frase ap-in" style={d(6)}>
              Uma loja desenvolvida sob medida para valorizar a marca e oferecer uma experiência de compra mais consistente.
            </p>
          </div>
        </div>
        <Rodape n={5} />
      </section>

      {/* ============ 6. PRÓXIMOS PASSOS ============ */}
      <section className={cls(5, "is-claro ap-s6")} aria-hidden={atual !== 5} aria-label="Próximos passos">
        <div className="ap-quadro">
          <div className="ap-cab">
            <p className="ap-rotulo ap-in" style={d(0)}>
              Próximos passos
            </p>
            <h2 className="ap-in" style={d(1)}>
              Como vamos <em>trabalhar</em>
            </h2>
          </div>
          <ol className="ap-passos">
            {[
              { t: "Alinhamento e aprovação", d: "Prévia apresentada, proposta validada e condições comerciais definidas." },
              { t: "Preparação da plataforma", d: "Migração para o plano Loja 2 e liberação dos acessos." },
              { t: "Desenvolvimento e testes", d: "Tema criado em separado. A loja atual segue no ar durante todo o processo." },
              { t: "Aprovação e publicação", d: "Produtos, variações, carrinho, frete, pagamento e checkout testados antes de publicar." },
              { t: "Ajustes finais", d: "Correções depois da validação e entrega do projeto." },
            ].map((p, k) => (
              <li key={p.t} className="ap-in" style={d(2 + k)}>
                <i>{k + 1}</i>
                <b>{p.t}</b>
                <span>{p.d}</span>
              </li>
            ))}
          </ol>
          <p className="ap-precisa ap-in" style={d(7)}>
            <b>Da sua parte</b> o vídeo da abertura, o ok para atualizar as fotos dos produtos e a confirmação do e-mail e do
            telefone de atendimento do checkout.
          </p>
          <p className="ap-final ap-in" style={d(8)}>
            Vamos construir uma loja com a identidade da Palavra com Alma, <em>sem abrir mão do que já funciona.</em>
          </p>
        </div>
        <Rodape n={6} />
      </section>

      {/* ============ controles ============ */}
      <div className="ap-progresso" aria-hidden>
        <i style={{ transform: `scaleX(${(atual + 1) / TOTAL})` }} />
      </div>
      <nav className="ap-ctrl" aria-label="Navegação dos slides">
        <button onClick={() => ir(atual - 1)} disabled={atual === 0} aria-label="Slide anterior">
          <ChevronLeft size={18} />
        </button>
        <span aria-live="polite">
          {atual + 1} / {TOTAL}
        </span>
        <button onClick={avancar} disabled={atual === TOTAL - 1} aria-label="Próximo slide">
          <ChevronRight size={18} />
        </button>
        <button className="ap-cheia" onClick={telaCheia} aria-label={cheia ? "Sair da tela cheia" : "Tela cheia"}>
          {cheia ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </nav>

      {zoom && <ZoomTela z={zoom} onIr={irZoom} onFechar={fecharZoom} onFim={fimZoom} />}
    </div>
  );
}
