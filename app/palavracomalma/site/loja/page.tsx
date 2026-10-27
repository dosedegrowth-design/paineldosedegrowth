import type { Metadata } from "next";
import Link from "next/link";
import { Vitrine, type Filtro } from "@/components/palavracomalma/site/vitrine";
import { BASE, MENU, PRODUTOS, cartao, categoriaPorSlug, categoriaPorId, daCategoria } from "../catalogo";

export const metadata: Metadata = { title: { absolute: "Loja · Palavra com Alma" } };

export default async function Loja({ searchParams }: { searchParams: Promise<{ c?: string; q?: string }> }) {
  const { c, q } = await searchParams;
  const cat = categoriaPorSlug(c);
  const pai = cat?.pai ? categoriaPorId(cat.pai) : undefined;

  const filtros: Filtro[] = MENU.flatMap((m) => [
    { id: m.id, nome: m.nome, slug: m.slug, pai: null, ids: daCategoria(m.id).map((p) => p.id) },
    ...m.filhas.map((f) => ({ id: f.id, nome: f.nome, slug: f.slug, pai: m.id, ids: daCategoria(f.id).map((p) => p.id) })),
  ]);

  // texto da categoria vindo do cadastro dela (só a primeira parte, sem as listas)
  const texto = cat?.descricao
    .split(/\n\s*\n/)
    .map((t) => t.trim())
    .filter((t) => t && !t.includes("·") && !/^[\p{Extended_Pictographic}]/u.test(t))
    .slice(0, 1)[0];

  return (
    <>
      <section className="lj-cab">
        <div className="lj-wrap">
          <nav className="lj-migalha" aria-label="Você está em">
            <Link href={BASE}>Início</Link>
            <span>/</span>
            <Link href={`${BASE}/loja`}>Loja</Link>
            {pai && (
              <>
                <span>/</span>
                <Link href={`${BASE}/loja?c=${encodeURIComponent(pai.slug)}`}>{pai.nome}</Link>
              </>
            )}
            {cat && (
              <>
                <span>/</span>
                <b>{cat.nome}</b>
              </>
            )}
          </nav>
          <h1>{q ? <>Resultados para “{q}”</> : cat ? cat.nome : "Toda a loja"}</h1>
          {texto && <p>{texto.replace(/\s{2,}/g, " ")}</p>}
          {!cat && !q && <p>Cadernos, baralhos, magias e peças em 3D. Tudo com produção própria.</p>}
        </div>
      </section>
      <div className="lj-wrap">
        <Vitrine key={`${c ?? ""}|${q ?? ""}`} cartoes={PRODUTOS.map(cartao)} filtros={filtros} inicial={cat?.slug} buscaInicial={q} />
      </div>
    </>
  );
}
