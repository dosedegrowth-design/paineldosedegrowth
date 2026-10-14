import type { Metadata } from "next";
import { ANUNCIOS, CONJUNTOS } from "./anuncios";

export const metadata: Metadata = {
  title: "Marina Saleme · Anúncios de Outubro",
  description: "Os 22 anúncios da estrutura de outubro de 2026.",
  robots: { index: false, follow: false },
};

const LOJA = "https://marinasaleme-estamparia.com/products";

export default function MarinaPage() {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-10 sm:px-8">
      <header className="border-b-2 border-neutral-900 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#F15839]">
          Marina Saleme · Outubro 2026
        </p>
        <h1 className="mt-3 font-serif text-[34px] leading-[1.1] text-neutral-900 sm:text-[42px]">
          Os anúncios desta rodada
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-600">
          22 anúncios, um para cada peça, divididos em três conjuntos. Só no
          Instagram, no Feed e no Reels. Cada anúncio leva direto para a página
          da peça na loja.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-[13px] text-neutral-500">
          {CONJUNTOS.map((c) => (
            <span key={c}>
              <strong className="font-semibold text-neutral-900">
                {ANUNCIOS.filter((a) => a.conjunto === c).length}
              </strong>{" "}
              {c}
            </span>
          ))}
        </div>
      </header>

      {CONJUNTOS.map((conjunto) => {
        const itens = ANUNCIOS.filter((a) => a.conjunto === conjunto);
        return (
          <section key={conjunto} className="mt-14">
            <h2 className="mb-7 flex items-baseline justify-between border-b border-neutral-900 pb-2 font-serif text-[22px] text-neutral-900">
              {conjunto}
              <span className="text-[11px] font-sans uppercase tracking-[0.18em] text-neutral-400">
                {itens.length} anúncios
              </span>
            </h2>

            <div className="grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {itens.map((a) => (
                <article key={a.n} className="flex flex-col">
                  <a
                    href={`${LOJA}/${a.produto}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden bg-neutral-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.img}
                      alt={a.nome}
                      width={1440}
                      height={1800}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover"
                    />
                  </a>
                  <div className="mt-4 flex items-baseline gap-2.5">
                    <span className="font-serif text-[17px] leading-none text-[#F15839]">
                      {a.n}
                    </span>
                    <h3 className="text-[14.5px] font-medium leading-snug text-neutral-900">
                      {a.nome}
                    </h3>
                  </div>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-neutral-600">
                    {a.legenda}
                  </p>
                  <a
                    href={`${LOJA}/${a.produto}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 self-start text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F15839] hover:underline"
                  >
                    Comprar agora →
                  </a>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <footer className="mt-20 border-t-2 border-neutral-900 pt-5 text-[13px] leading-relaxed text-neutral-500">
        Todas as imagens em 4:5, foto inteira, sem corte automático, sem música
        e sem alteração da plataforma.
        <br />
        Dose de Growth
      </footer>
    </main>
  );
}
