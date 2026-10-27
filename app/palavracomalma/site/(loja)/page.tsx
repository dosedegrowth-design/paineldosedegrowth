/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight, Instagram } from "lucide-react";
import { CartaoProduto } from "@/components/palavracomalma/site/cartao";
import { WhatsAppIcon } from "@/components/palavracomalma/site/whatsapp";
import { BASE, INSTAGRAM, MENU, PRODUTOS, cartao, categoriaPorId, daCategoria, porId, waLink } from "../catalogo";

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function Titulo({ titulo, nota, link, rotulo }: { titulo: string; nota?: string; link?: string; rotulo?: string }) {
  return (
    <div className="lj-tit lj-rv">
      <h2>{titulo}</h2>
      {nota && <p className="lj-mao">{nota}</p>}
      {link && (
        <Link href={link} className="lj-tit-link">
          {rotulo ?? "Ver todos"} <ArrowRight size={15} />
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
        Seu vídeo aqui <i aria-hidden>✶</i>
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
          <p className="lj-hero-olho">Ateliê de cadernos, baralhos e magias</p>
          <h1>
            <span className="lj-linha">
              <span>Cada peça,</span>
            </span>
            <span className="lj-linha">
              <span>
                <em>feita à mão</em>
              </span>
            </span>
            <span className="lj-linha">
              <span>com intenção.</span>
            </span>
          </h1>
          <p className="lj-hero-sub">Peças autorais e personalizadas, com produção própria. Enviamos para todo o Brasil.</p>
          <div className="lj-hero-ctas">
            <Link href={`${BASE}/loja`} className="lj-btn is-lacre">
              Ver a loja
            </Link>
            <Link href={`${BASE}/loja?c=personalizados`} className="lj-btn is-papel">
              Personalizar o meu
            </Link>
          </div>
        </div>
      </section>

      {/* ============ VANTAGENS ============ */}
      <div className="lj-vant">
        <div className="lj-wrap lj-vant-in">
          <p>
            <b>Produção própria</b> feito à mão no ateliê
          </p>
          <p>
            <b>Personalize</b> capa, miolo e cartas
          </p>
          <p>
            <b>Todo o Brasil</b> envio com rastreio
          </p>
          <p>
            <b>Pague como quiser</b> Pix, boleto ou cartão em até 3x
          </p>
        </div>
      </div>

      {/* ============ SUMÁRIO (coleções) ============ */}
      <section className="lj-sec lj-papel" id="colecoes">
        <div className="lj-wrap lj-sumario">
          <div className="lj-sumario-cab lj-rv">
            <h2>Sumário</h2>
            <p className="lj-mao">escolha por onde começar</p>
          </div>
          <ol className="lj-sumario-lista">
            {colecoes.map((c, k) => (
              <li key={c.id} className="lj-rv" style={{ ["--i" as string]: String(k) }}>
                <Link href={`${BASE}/loja?c=${encodeURIComponent(c.slug)}`}>
                  <i>{ROMANOS[k]}.</i>
                  <b>{c.nome}</b>
                  <span className="lj-pontos" aria-hidden />
                  <small>
                    {c.total} {c.total === 1 ? "peça" : "peças"}
                  </small>
                  <span className="lj-sumario-foto">
                    <img src={c.img} alt="" loading={k < 3 ? "eager" : "lazy"} />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ DESTAQUES ============ */}
      <section className="lj-sec lj-papel is-mural">
        <div className="lj-wrap">
          <Titulo titulo="Destaques do ateliê" nota="os que mais saem daqui" link={`${BASE}/loja`} />
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
            <p className="lj-olho">Cadernos A4 e A5</p>
            <h2>
              Coleção <em>Orixás</em>
            </h2>
            {descOrixas.slice(1, 3).map((t, k) => (
              <p key={k}>{t.replace(/\s{2,}/g, " ")}</p>
            ))}
            <Link href={`${BASE}/loja?c=${encodeURIComponent("cadernos-personalizados/colecao-orixas")}`} className="lj-btn is-papel">
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
      <section className="lj-sec lj-papel">
        <div className="lj-wrap">
          <Titulo titulo="Baralhos" nota="o verso pode ser seu" link={`${BASE}/loja?c=baralho-personalizado`} />
          <p className="lj-sub lj-rv">Escolha o deck e personalize o verso. Produção em até 20 dias úteis.</p>
          <div className="lj-grade">
            {decks.map((c) => (
              <CartaoProduto key={c.id} c={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ PERSONALIZAÇÃO (receita) ============ */}
      <section className="lj-sec lj-papel is-pautado">
        <div className="lj-wrap lj-pers">
          <div className="lj-pers-fotos lj-rv">
            {fotoPers.map((src) => (
              <figure key={src}>
                <img src={src} alt="Caderno personalizado da Palavra com Alma" loading="lazy" />
              </figure>
            ))}
          </div>
          <div className="lj-pers-txt lj-rv">
            <p className="lj-olho">Do seu jeito</p>
            <h2>Como se faz um personalizado</h2>
            <ol className="lj-passos">
              {[
                { t: "Escolha a peça", d: "Caderno, refil, baralho ou kit. Capa, contracapa e páginas internas podem ser suas." },
                { t: "Envie a sua ideia", d: "Depois da compra, mande pelo WhatsApp a foto, a frase ou como quer personalizar." },
                { t: "Aprove a arte", d: "A gente cria e você aprova antes de ir para a produção." },
                { t: "Produção e envio", d: "De 10 a 15 dias úteis depois da aprovação da arte. Envio com rastreio." },
              ].map((p, k) => (
                <li key={p.t}>
                  <i>{ROMANOS[k]}</i>
                  <b>{p.t}</b>
                  <span>{p.d}</span>
                </li>
              ))}
            </ol>
            <div className="lj-pers-ctas">
              <Link href={`${BASE}/loja?c=personalizados`} className="lj-btn is-lacre">
                Ver personalizados
              </Link>
              <a
                href={waLink("Oi! Vim pelo site e quero personalizar uma peça.")}
                target="_blank"
                rel="noopener noreferrer"
                className="lj-btn is-tinta"
              >
                <WhatsAppIcon size={18} /> Tirar dúvidas
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ NOVIDADES ============ */}
      {novidades.length > 0 && (
        <section className="lj-sec lj-papel">
          <div className="lj-wrap">
            <Titulo titulo="Recém-saídos do ateliê" link={`${BASE}/loja`} />
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
          <Instagram size={24} />
          <h2>
            Os bastidores ficam <em>no Instagram</em>
          </h2>
          <p>Lançamentos e as peças personalizadas saindo do ateliê.</p>
          <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="lj-btn is-papel">
            @loja.palavracomalma
          </a>
        </div>
      </section>
    </>
  );
}
