import type { Metadata } from "next";
import { Aprovar, type ItemAprovar } from "@/components/marina/aprovar";
import { getRespostas } from "@/lib/marina/queries/aprovacoes";
import { CARROSSEIS, NOVOS } from "./dados";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marina Saleme · Anúncios novos",
  description: "Os anúncios novos montados com as fotos de vocês, para aprovar.",
  robots: { index: false, follow: false },
};

export default async function AprovarNovosPage() {
  const salvas = await getRespostas("novos");

  const avulsos: ItemAprovar[] = NOVOS.map((a) => ({
    id: a.id,
    nome: a.peca,
    texto: a.texto,
    titulo: a.titulo,
    botao: a.botao,
    rotuloMidia: "Feed 4:5",
    midia: { tipo: "imagem", src: a.feed, proporcao: "4 / 5" },
    segunda: {
      rotulo: "Reels e Stories 9:16",
      midia: { tipo: "imagem", src: a.reels, proporcao: "9 / 16" },
    },
  }));

  const carrosseis: ItemAprovar[] = CARROSSEIS.map((c) => ({
    id: c.id,
    nome: c.nome,
    meta: `Carrossel · ${c.cards.length} peças`,
    texto: c.texto,
    titulo: c.titulo,
    botao: c.botao,
    midia: { tipo: "carrossel", cards: c.cards },
  }));

  const itens = [...avulsos, ...carrosseis];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
    <main className="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-10 sm:px-8">
      <header className="mx-auto max-w-[760px] border-b-2 border-neutral-900 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#F15839]">
          Marina Saleme · Aprovação
        </p>
        <h1 className="mt-3 font-serif text-[32px] leading-[1.1] text-neutral-900 sm:text-[40px]">
          Os anúncios novos, com as fotos de vocês
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">
          São {NOVOS.length} peças e {CARROSSEIS.length} carrosséis, montados
          só com as fotos da pasta que vocês mandaram. Cada peça aparece nos
          dois formatos, Feed e Reels, só para vocês verem como fica no
          celular. Em cada um, diga se está{" "}
          <strong className="font-semibold text-neutral-900">aprovado</strong> ou{" "}
          <strong className="font-semibold text-neutral-900">recusado</strong>.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
          O que vocês aprovarem já sobe: está tudo montado aqui, é só apertar o
          botão. Então é rápido.
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-neutral-500">
          A foto inteira cabe dentro dos dois formatos, sem corte nenhum, então
          nenhuma modelo fica com a cabeça cortada. Onde o nome do arquivo não
          dizia a peça, está escrito &ldquo;nome a confirmar&rdquo;: se puderem
          escrever o nome certo no comentário, a gente corrige. Preço e link do
          produto entram depois que vocês aprovarem.
        </p>
      </header>

      <div className="mt-6">
        <Aprovar
          link="novos"
          titulo="Marina Saleme · anúncios novos"
          itens={itens}
          salvas={salvas}
        />
      </div>

      <footer className="mx-auto mt-14 max-w-[760px] border-t border-neutral-200 pt-5 text-[12.5px] leading-relaxed text-neutral-500">
        Dose de Growth · Nada aqui foi gerado por IA e nada veio de fora da
        pasta de vocês. As {NOVOS.length} fotos foram conferidas uma a uma:
        todas têm modelo, nenhuma é foto de peça sozinha.
      </footer>
    </main>
    </div>
  );
}
