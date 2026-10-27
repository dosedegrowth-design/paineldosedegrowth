/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight, Hand, Instagram, Palette, ShieldCheck, Truck } from "lucide-react";
import { CartaoProduto } from "@/components/palavracomalma/site/cartao";
import { WhatsAppIcon } from "@/components/palavracomalma/site/whatsapp";
import { BASE, INSTAGRAM, MENU, PRODUTOS, cartao, categoriaPorId, daCategoria, porId, waLink } from "../catalogo";

function Titulo({ titulo, sub, link, rotulo }: { titulo: string; sub?: string; link?: string; rotulo?: string }) {
  return (
    <div className="lj-tit lj-rv">
      <div>
        <h2>{titulo}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {link && (
        <Link href={link} className="lj-tit-link">
          {rotulo ?? "Ver todos"} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

// Faixas da abertura: marcam o lugar do vídeo da loja até ela gravar o dela.
const FITA = Array.from({ length: 2 }, (_, k) => (
  <span key={k}>
    {Array.from({ length: 5 }, (_, j) => (
      <b key={j}>
        Seu vídeo aqui <i />
      </b>
    ))}
  </span>
));

export default function Home() {
  const destaques = PRODUTOS.filter((p) => p.destaque && p.disponivel).slice(0, 10).map(cartao);
  const novidades = PRODUTOS.filter((p) => p.lancamento && p.disponivel && !p.destaque).slice(0, 8).map(cartao);
  const orixas = daCategoria(33).slice(0, 6);
  const descOrixas = categoriaPorId(33)?.descricao.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean) ?? [];
  // baralhos: primeiro os que têm foto de verdade do deck
  const ordemDecks = [259, 261, 263, 287];
  const decks = daCategoria(9)
    .filter((p) => p.disponivel)
    .sort((a, b) => (ordemDecks.indexOf(a.id) + 1 || 99) - (ordemDecks.indexOf(b.id) + 1 || 99))
    .slice(0, 4)
    .map(cartao);
  const fotoPers = [porId(21)?.imgs[0], porId(203)?.imgs[0]].filter(Boolean) as string[];

  // capa de cada coleção: uma foto real de produto da categoria
  const capas: Record<number, number> = { 7: 203, 9: 259, 27: 189, 31: 17, 47: 251, 51: 269, 53: 273, 61: 305 };
  const colecoes = MENU.map((c) => {
    const p = porId(capas[c.id]) ?? daCategoria(c.id)[0];
    return { ...c, img: p?.imgs[0] ?? "" };
  });

  return (
    <>
      {/* ============ ABERTURA ============ */}
      <section className="lj-hero">
        <div className="lj-x" aria-hidden>
          <div className="lj-fita is-a">
            <div>{FITA}</div>
          </div>
          <div className="lj-fita is-b">
            <div>{FITA}</div>
          </div>
        </div>
        <div className="lj-hero-veu" />
        <div className="lj-hero-txt">
          <h1>Cadernos, baralhos e magias feitos à mão</h1>
          <p className="lj-hero-sub">Peças autorais e personalizadas, com produção própria. Enviamos para todo o Brasil.</p>
          <div className="lj-hero-ctas">
            <Link href={`${BASE}/loja`} className="lj-btn is-ouro">
              Ver a loja
            </Link>
            <Link href={`${BASE}/loja?c=personalizados`} className="lj-btn is-contorno">
              Personalizar o meu
            </Link>
          </div>
        </div>
      </section>

      {/* vantagens */}
      <div className="lj-vant">
        <div className="lj-wrap lj-vant-in">
          <p>
            <Hand size={20} />
            <span>
              <b>Produção própria</b> Feito à mão no ateliê
            </span>
          </p>
          <p>
            <Palette size={20} />
            <span>
              <b>Personalize</b> Capa, miolo e cartas
            </span>
          </p>
          <p>
            <Truck size={20} />
            <span>
              <b>Todo o Brasil</b> Envio com rastreio
            </span>
          </p>
          <p>
            <ShieldCheck size={20} />
            <span>
              <b>Pague como quiser</b> Pix, boleto ou cartão em até 3x
            </span>
          </p>
        </div>
      </div>

      {/* ============ COLEÇÕES ============ */}
      <section className="lj-sec" id="colecoes">
        <div className="lj-wrap">
          <Titulo titulo="Compre por coleção" link={`${BASE}/loja`} rotulo="Toda a loja" />
          <div className="lj-colecoes">
            {colecoes.map((c, k) => (
              <Link
                key={c.id}
                href={`${BASE}/loja?c=${encodeURIComponent(c.slug)}`}
                className="lj-colecao lj-rv"
                style={{ ["--i" as string]: String(k % 4) }}
              >
                <span className="lj-colecao-fig">
                  <img src={c.img} alt="" loading={k < 4 ? "eager" : "lazy"} />
                </span>
                <b>{c.nome}</b>
                <small>
                  {c.total} {c.total === 1 ? "produto" : "produtos"}
                </small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DESTAQUES ============ */}
      <section className="lj-sec">
        <div className="lj-wrap">
          <Titulo titulo="Destaques da loja" link={`${BASE}/loja`} />
        </div>
        <div className="lj-trilho lj-rv">
          <div className="lj-trilho-in">
            {destaques.map((c) => (
              <CartaoProduto key={c.id} c={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ COLEÇÃO ORIXÁS ============ */}
      <section className="lj-orixas">
        <div className="lj-wrap lj-orixas-in">
          <div className="lj-orixas-txt lj-rv">
            <span className="lj-selo">Cadernos A4 e A5</span>
            <h2>Coleção Orixás</h2>
            {descOrixas.slice(1, 3).map((t, k) => (
              <p key={k}>{t.replace(/\s{2,}/g, " ")}</p>
            ))}
            <Link href={`${BASE}/loja?c=${encodeURIComponent("cadernos-personalizados/colecao-orixas")}`} className="lj-btn is-ouro">
              Ver a coleção
            </Link>
          </div>
          <div className="lj-orixas-grade">
            {orixas.map((p, k) => (
              <Link
                key={p.id}
                href={`${BASE}/produto/${p.id}`}
                className="lj-orixas-peca lj-rv"
                style={{ ["--i" as string]: String(k % 3) }}
              >
                <span>
                  <img src={p.imgs[0]} alt={p.nome} loading="lazy" />
                </span>
                <b>{p.nome.split(/[:\-·]/)[0].replace("Caderno", "").trim()}</b>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BARALHOS ============ */}
      <section className="lj-sec">
        <div className="lj-wrap">
          <Titulo
            titulo="Baralhos"
            sub="Escolha o deck e personalize o verso. Produção em até 20 dias úteis."
            link={`${BASE}/loja?c=baralho-personalizado`}
          />
          <div className="lj-grade">
            {decks.map((c) => (
              <CartaoProduto key={c.id} c={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ PERSONALIZAÇÃO ============ */}
      <section className="lj-sec">
        <div className="lj-wrap lj-pers">
          <div className="lj-pers-fotos lj-rv">
            {fotoPers.map((src) => (
              <img key={src} src={src} alt="Caderno personalizado da Palavra com Alma" loading="lazy" />
            ))}
          </div>
          <div className="lj-pers-txt lj-rv">
            <h2>Como funciona a personalização</h2>
            <ol className="lj-passos">
              {[
                { t: "Escolha a peça", d: "Caderno, refil, baralho ou kit. Capa, contracapa e páginas internas podem ser suas." },
                { t: "Envie a sua ideia", d: "Depois da compra, mande pelo WhatsApp a foto, a frase ou como quer personalizar." },
                { t: "Aprove a arte", d: "A gente cria e você aprova antes de ir para a produção." },
                { t: "Produção e envio", d: "De 10 a 15 dias úteis depois da aprovação da arte. Envio com rastreio." },
              ].map((p) => (
                <li key={p.t}>
                  <b>{p.t}</b>
                  <span>{p.d}</span>
                </li>
              ))}
            </ol>
            <div className="lj-pers-ctas">
              <Link href={`${BASE}/loja?c=personalizados`} className="lj-btn is-ouro">
                Ver personalizados
              </Link>
              <a
                href={waLink("Oi! Vim pelo site e quero personalizar uma peça.")}
                target="_blank"
                rel="noopener noreferrer"
                className="lj-btn is-contorno"
              >
                <WhatsAppIcon size={18} /> Tirar dúvidas
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ NOVIDADES ============ */}
      {novidades.length > 0 && (
        <section className="lj-sec">
          <div className="lj-wrap">
            <Titulo titulo="Novidades" link={`${BASE}/loja`} />
            <div className="lj-grade">
              {novidades.map((c) => (
                <CartaoProduto key={c.id} c={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ INSTAGRAM ============ */}
      <section className="lj-insta">
        <div className="lj-wrap lj-insta-in lj-rv">
          <Instagram size={26} />
          <h2>Acompanhe a produção no Instagram</h2>
          <p>Bastidores, lançamentos e as peças personalizadas saindo do ateliê.</p>
          <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="lj-btn is-claro">
            @loja.palavracomalma
          </a>
        </div>
      </section>
    </>
  );
}
