import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Sparkles, Truck } from "lucide-react";
import { CartaoProduto } from "@/components/palavracomalma/site/cartao";
import { CompraProduto, Galeria } from "@/components/palavracomalma/site/produto-cliente";
import { BASE, PRODUTOS, cartao, nomeCurto, porId, prazoLegivel, raiz } from "../../catalogo";

export function generateStaticParams() {
  return PRODUTOS.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = porId(Number(id));
  return { title: { absolute: p ? `${nomeCurto(p.nome)} · Palavra com Alma` : "Palavra com Alma" } };
}

export default async function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = porId(Number(id));
  if (!p) notFound();
  const r = raiz(p.cat_id);
  const relacionados = PRODUTOS.filter((x) => x.id !== p.id && raiz(x.cat_id)?.id === r?.id)
    .sort((a, b) => Number(b.disponivel) - Number(a.disponivel))
    .slice(0, 4)
    .map(cartao);
  const prazo = prazoLegivel(p);

  return (
    <>
      <div className="lj-wrap lj-prod">
        <nav className="lj-migalha" aria-label="Você está em">
          <Link href={BASE}>Início</Link>
          <span>/</span>
          <Link href={`${BASE}/loja`}>Loja</Link>
          {r && (
            <>
              <span>/</span>
              <Link href={`${BASE}/loja?c=${encodeURIComponent(r.slug)}`}>{r.nome}</Link>
            </>
          )}
        </nav>

        <div className="lj-prod-grade">
          <Galeria imgs={p.imgs.length ? p.imgs : ["/palavracomalma/video-capa.jpg"]} nome={p.nome} />

          <div className="lj-prod-info">
            {r && <span className="lj-prod-cat">{r.nome}</span>}
            <h1>{nomeCurto(p.nome)}</h1>
            {p.resumo && <p className="lj-prod-resumo">{p.resumo}</p>}

            <CompraProduto
              id={p.id}
              nome={p.nome}
              nomeCurto={nomeCurto(p.nome)}
              preco={p.preco}
              promo={p.promo}
              disponivel={p.disponivel}
              imgs={p.imgs}
              variacoes={p.variacoes}
              prazo={p.disponivel ? prazo : ""}
              parcela={p.parcela}
            />

            {p.aviso && (
              <div className="lj-prod-aviso">
                <Sparkles size={18} />
                <p>{p.aviso.replace(/\bdis úteis\b/, "dias úteis")}</p>
              </div>
            )}

            <ul className="lj-prod-garantias">
              <li>
                <Truck size={18} /> Envio para todo o Brasil com rastreio
              </li>
              {prazo && p.disponivel && (
                <li>
                  <Clock size={18} /> {prazo}
                </li>
              )}
            </ul>
          </div>
        </div>

        {p.desc && (
          <section className="lj-prod-desc">
            <h2>Sobre a peça</h2>
            <div dangerouslySetInnerHTML={{ __html: p.desc }} />
          </section>
        )}
      </div>

      {relacionados.length > 0 && (
        <section className="lj-sec">
          <div className="lj-wrap">
            <div className="lj-tit">
              <div>
                <p className="lj-olho">Combina com</p>
                <h2>
                  Mais de <em>{r?.nome}</em>
                </h2>
              </div>
            </div>
            <div className="lj-grade">
              {relacionados.map((c) => (
                <CartaoProduto key={c.id} c={c} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
