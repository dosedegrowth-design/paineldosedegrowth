/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight, Instagram } from "lucide-react";
import { CartaoProduto } from "@/components/palavracomalma/site/cartao";
import { WhatsAppIcon } from "@/components/palavracomalma/site/whatsapp";
import { BASE, INSTAGRAM, MENU, PRODUTOS, cartao, categoriaPorId, daCategoria, porId, waLink } from "../catalogo";

// Estrelas e brasas em posições fixas (iguais no servidor e no navegador)
const { ESTRELAS, BRASAS } = (() => {
  let s = 11;
  const r = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return {
    ESTRELAS: Array.from({ length: 46 }, () => ({ t: r() * 70, l: r() * 100, z: 1 + r() * 1.6, d: 2.5 + r() * 4, a: r() * 5 })),
    BRASAS: Array.from({ length: 12 }, () => ({ l: 8 + r() * 84, d: 9 + r() * 7, a: r() * 10, x: (r() - 0.5) * 120 })),
  };
})();

const v = (o: Record<string, string>) => o as React.CSSProperties;

// Faixas da abertura: marcam o lugar do vídeo da loja até ela gravar o dela.
const FITA = Array.from({ length: 2 }, (_, k) => (
  <span key={k}>
    {Array.from({ length: 5 }, (_, j) => (
      <b key={j}>
        Seu vídeo aqui <i aria-hidden>✦</i>
      </b>
    ))}
  </span>
));

function Titulo({ olho, titulo, link, rotulo }: { olho: string; titulo: React.ReactNode; link?: string; rotulo?: string }) {
  return (
    <div className="lj-tit lj-rv">
      <div>
        <p className="lj-olho">{olho}</p>
        <h2>{titulo}</h2>
      </div>
      {link && (
        <Link href={link} className="lj-tit-link">
          {rotulo ?? "Ver todos"} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const desejados = PRODUTOS.filter((p) => p.destaque && p.disponivel).slice(0, 10).map(cartao);
  const novidades = PRODUTOS.filter((p) => p.lancamento && p.disponivel && !p.destaque).slice(0, 8).map(cartao);
  const orixas = daCategoria(33);
  const descOrixas = categoriaPorId(33)?.descricao.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean) ?? [];
  const decks = daCategoria(9).filter((p) => p.disponivel).slice(0, 4);
  const personalizado = porId(21);
  const kit = porId(203);

  // capa de cada coleção: um produto real (de preferência disponível) da categoria
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
        <div className="lj-ceu" aria-hidden>
          {ESTRELAS.map((e, k) => (
            <span
              key={k}
              className="lj-estrela"
              style={v({ top: `${e.t}%`, left: `${e.l}%`, width: `${e.z}px`, height: `${e.z}px`, "--d": `${e.d}s`, "--a": `${e.a}s` })}
            />
          ))}
          {BRASAS.map((b, k) => (
            <span key={k} className="lj-brasa" style={v({ left: `${b.l}%`, "--d": `${b.d}s`, "--a": `${b.a}s`, "--x": `${b.x}px` })} />
          ))}
        </div>
        <div className="lj-hero-txt">
          <p className="lj-hero-olho">Feito à mão · com intenção</p>
          <h1>
            Cadernos, baralhos e magias <em>com alma.</em>
          </h1>
          <p className="lj-hero-sub">Peças autorais e personalizadas, com produção própria, para guardar o seu sagrado.</p>
          <div className="lj-hero-ctas">
            <Link href={`${BASE}/loja`} className="lj-btn is-ouro">
              Ver a loja
            </Link>
            <Link href={`${BASE}/loja?c=personalizados`} className="lj-btn is-contorno">
              Personalize o seu
            </Link>
          </div>
        </div>
        <a href="#colecoes" className="lj-hero-desce" aria-label="Rolar para as coleções">
          <i />
        </a>
      </section>

      {/* faixa */}
      <div className="lj-faixa" aria-hidden>
        <div>
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k}>
              Produção própria <b>✦</b> Personalizados <b>✦</b> Coleção Orixás <b>✦</b> Coleção Tarot <b>✦</b> Baralhos <b>✦</b>
              Magias <b>✦</b> Enviamos para todo o Brasil <b>✦</b>
            </span>
          ))}
        </div>
      </div>

      {/* ============ COLEÇÕES ============ */}
      <section className="lj-sec" id="colecoes">
        <div className="lj-wrap">
          <Titulo olho="Escolha por onde começar" titulo={<>Nossas <em>coleções</em></>} link={`${BASE}/loja`} rotulo="Toda a loja" />
          <div className="lj-colecoes">
            {colecoes.map((c, k) => (
              <Link
                key={c.id}
                href={`${BASE}/loja?c=${encodeURIComponent(c.slug)}`}
                className="lj-colecao lj-rv"
                style={v({ "--i": String(k) })}
              >
                <span className="lj-colecao-fig">
                  <img src={c.img} alt="" loading={k < 4 ? "eager" : "lazy"} />
                </span>
                <b>{c.nome}</b>
                <small>{c.total} produtos</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MAIS DESEJADOS ============ */}
      <section className="lj-sec">
        <div className="lj-wrap">
          <Titulo olho="Os favoritos de quem compra" titulo={<>Mais <em>desejados</em></>} link={`${BASE}/loja`} />
        </div>
        <div className="lj-trilho lj-rv">
          <div className="lj-trilho-in">
            {desejados.map((c) => (
              <CartaoProduto key={c.id} c={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ COLEÇÃO ORIXÁS ============ */}
      <section className="lj-orixas">
        <div className="lj-wrap lj-orixas-in">
          <div className="lj-orixas-txt lj-rv">
            <p className="lj-olho">Cadernos · A4 e A5</p>
            <h2>
              Coleção <em>Orixás</em>
            </h2>
            {descOrixas.slice(1, 4).map((t, k) => (
              <p key={k}>{t.replace(/\s{2,}/g, " ")}</p>
            ))}
            <Link href={`${BASE}/loja?c=${encodeURIComponent("cadernos-personalizados/colecao-orixas")}`} className="lj-btn is-ouro">
              Conhecer a coleção
            </Link>
          </div>
          <div className="lj-orixas-mosaico">
            {orixas.slice(0, 6).map((p, k) => (
              <Link
                key={p.id}
                href={`${BASE}/produto/${p.id}`}
                className="lj-orixas-peca lj-rv"
                style={v({ "--i": String(k) })}
                aria-label={p.nome}
              >
                <img src={p.imgs[0]} alt={p.nome} loading="lazy" />
                <span>{p.nome.split(/[:\-·]/)[0].replace("Caderno", "").trim()}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PERSONALIZAÇÃO ============ */}
      <section className="lj-sec">
        <div className="lj-wrap lj-pers">
          <div className="lj-pers-fotos lj-rv">
            {personalizado && <img src={personalizado.imgs[0]} alt={personalizado.nome} loading="lazy" />}
            {kit && <img src={kit.imgs[0]} alt={kit.nome} loading="lazy" />}
          </div>
          <div className="lj-pers-txt">
            <Titulo olho="Do seu jeito" titulo={<>Como funciona a <em>personalização</em></>} />
            <ol className="lj-passos">
              {[
                { t: "Escolha a peça", d: "Caderno, refil, baralho ou kit. Capa, contracapa e páginas internas podem ser suas." },
                { t: "Envie a sua ideia", d: "Depois da compra, mande pelo WhatsApp a foto, a frase ou como quer personalizar." },
                { t: "Aprove a arte", d: "A gente cria e você aprova antes de qualquer coisa ir para a produção." },
                { t: "Produção própria", d: "De 10 a 15 dias úteis depois da aprovação da arte, feito à mão." },
                { t: "Envio para todo o Brasil", d: "Com código de rastreio, direto para você." },
              ].map((p, k) => (
                <li key={p.t} className="lj-rv" style={v({ "--i": String(k) })}>
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

      {/* ============ BARALHOS ============ */}
      <section className="lj-baralhos">
        <div className="lj-wrap">
          <Titulo
            olho="Decks com produção de até 20 dias úteis"
            titulo={<>Baralhos com o <em>seu verso</em></>}
            link={`${BASE}/loja?c=baralho-personalizado`}
          />
          <p className="lj-baralhos-sub lj-rv">
            Escolha um dos nossos decks e conte como quer personalizar o verso do seu baralho.
          </p>
          <div className="lj-cartas">
            {decks.map((p, k) => (
              <Link key={p.id} href={`${BASE}/produto/${p.id}`} className="lj-carta lj-rv" style={v({ "--i": String(k) })}>
                <span className="lj-carta-in">
                  <span className="lj-carta-verso">✦</span>
                  <span className="lj-carta-frente">
                    <img src={p.imgs[1] ?? p.imgs[0]} alt={p.nome} loading="lazy" />
                  </span>
                </span>
                <b>{cartao(p).nome}</b>
              </Link>
            ))}
          </div>
          <p className="lj-cartas-dica">Passe o mouse nas cartas para ver o verso</p>
        </div>
      </section>

      {/* ============ NOVIDADES ============ */}
      {novidades.length > 0 && (
        <section className="lj-sec">
          <div className="lj-wrap">
            <Titulo olho="Acabou de chegar" titulo={<>Novidades da <em>loja</em></>} link={`${BASE}/loja`} />
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
          <Instagram size={30} />
          <h2>
            Acompanhe a produção no <em>Instagram</em>
          </h2>
          <p>Bastidores, lançamentos e as peças personalizadas saindo do ateliê.</p>
          <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="lj-btn is-claro">
            @loja.palavracomalma
          </a>
        </div>
      </section>
    </>
  );
}
