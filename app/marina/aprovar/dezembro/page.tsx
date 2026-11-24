import type { Metadata } from "next";
import { Aprovar, type ItemAprovar } from "@/components/marina/aprovar";
import { getRespostas } from "@/lib/marina/queries/aprovacoes";
import { CONFERIR, NOVOS } from "./dados";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marina Saleme · Estampas novas",
  description: "Os anúncios das estampas novas, para aprovar.",
  robots: { index: false, follow: false },
};

export default async function AprovarDezembroPage() {
  const salvas = await getRespostas("dezembro");

  const itens: ItemAprovar[] = NOVOS.map((a) => ({
    id: a.id,
    nome: a.peca,
    meta: CONFERIR[a.id] ?? `Estampa ${a.titulo.charAt(0)}${a.titulo.slice(1).toLowerCase()}`,
    metaDestaque: Boolean(CONFERIR[a.id]),
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

  return (
    <div className="min-h-screen bg-white text-neutral-900">
    <main className="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-10 sm:px-8">
      <header className="mx-auto max-w-[760px] border-b-2 border-neutral-900 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#F15839]">
          Marina Saleme · Aprovação
        </p>
        <h1 className="mt-3 font-serif text-[32px] leading-[1.1] text-neutral-900 sm:text-[40px]">
          As estampas novas, prontas para anunciar
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">
          São {NOVOS.length} peças nas estampas Onça, Tijolo, Rei Rainha e
          Paraíso, montadas com as fotos da pasta que vocês mandaram. Cada
          peça aparece nos dois formatos, Feed e Reels, para vocês verem como
          fica no celular. Em cada uma, diga se está{" "}
          <strong className="font-semibold text-neutral-900">aprovado</strong> ou{" "}
          <strong className="font-semibold text-neutral-900">recusado</strong>.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
          O que vocês aprovarem já sobe: está tudo montado aqui, é só apertar o
          botão. As novas entram no lugar dos anúncios que não estavam
          vendendo.
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-neutral-500">
          As legendas são as do PDF que veio na pasta, do jeito que estão lá.
          Em quatro peças a foto veio só no formato de Reels; nelas tem uma
          linha em laranja avisando que o Feed é um recorte da mesma foto.
          Preço e link do produto entram depois que vocês aprovarem.
        </p>
      </header>

      <div className="mt-6">
        <Aprovar
          link="dezembro"
          titulo="Marina Saleme · estampas novas"
          itens={itens}
          salvas={salvas}
        />
      </div>

      <footer className="mx-auto mt-14 max-w-[760px] border-t border-neutral-200 pt-5 text-[12.5px] leading-relaxed text-neutral-500">
        Dose de Growth · Nada aqui veio de fora da pasta de vocês: as fotos e
        as legendas são as que vocês mandaram.
      </footer>
    </main>
    </div>
  );
}
