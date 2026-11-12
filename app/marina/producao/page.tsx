import type { Metadata } from "next";
import Image from "next/image";
import { FAZER, FORA, TOTAL_PECAS, type Peca } from "./pecas";

export const metadata: Metadata = {
  title: "Marina Saleme · Peças para fotografar",
  description: "As peças que vieram só em still e precisam de foto com modelo.",
  robots: { index: false, follow: false },
};

const PASTA = "/marina/producao";

function Cartao({ peca, i, fora }: { peca: Peca; i: number; fora?: boolean }) {
  return (
    <li className="border border-neutral-200 bg-white">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-neutral-200 px-4 py-3 sm:px-5">
        <span className="font-serif text-[15px] leading-none text-[#F15839]">
          {String(i + 1).padStart(2, "0")}
        </span>
        <h3 className="text-[15px] font-semibold leading-snug text-neutral-900">
          {peca.nome}
        </h3>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          estampa {peca.estampa}
        </span>
      </div>

      <div className="grid gap-5 p-4 sm:grid-cols-[minmax(0,320px)_minmax(0,1fr)] sm:p-5">
        <div className="flex gap-3">
          {peca.fotos.map((f, j) => (
            <a
              key={f}
              href={peca.originais[j] ?? `${PASTA}/${f}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block min-w-0 flex-1 bg-neutral-100"
              title="Abrir o arquivo original"
            >
              <Image
                src={`${PASTA}/${f}`}
                alt={peca.nome}
                width={960}
                height={1200}
                sizes="(min-width: 640px) 320px, 92vw"
                className="h-auto w-full"
              />
            </a>
          ))}
        </div>

        <div className="text-[14px] leading-relaxed text-neutral-700">
          <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5">
            <dt className="text-neutral-400">Em estoque</dt>
            <dd className={fora ? "font-medium text-[#b02a16]" : "font-medium text-neutral-900"}>
              {fora
                ? peca.estoque
                : `${peca.pecas} ${peca.pecas === 1 ? "peça" : "peças"} · ${peca.estoque}`}
            </dd>
            <dt className="text-neutral-400">Valor</dt>
            <dd className="text-neutral-900">{peca.preco}</dd>
          </dl>

          {peca.obs ? (
            <p className="mt-3.5 border-l-2 border-[#F15839] pl-3 text-[13px] leading-relaxed text-neutral-600">
              {peca.obs}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
            {peca.originais.map((o, j) => (
              <a
                key={o}
                href={o}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#F15839] underline underline-offset-4"
              >
                Baixar a foto original
                {peca.originais.length > 1 ? ` ${j + 1}` : ""}
              </a>
            ))}
            {peca.loja ? (
              <a
                href={peca.loja}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 underline underline-offset-4"
              >
                Ver na loja
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}

export default function ProducaoPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
    <main className="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-10 sm:px-8">
      <header className="border-b-2 border-neutral-900 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#F15839]">
          Marina Saleme · Produção de novembro
        </p>
        <h1 className="mt-3 font-serif text-[34px] leading-[1.1] text-neutral-900 sm:text-[42px]">
          Só tem a estampa, falta a modelo
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-600">
          Estas peças chegaram só em still, a roupa sozinha no fundo branco. Do
          jeito que estão não sobem como anúncio, então precisam de foto com
          modelo vestindo. São {FAZER.length} peças e {TOTAL_PECAS} unidades
          paradas na loja, em ordem de quem tem mais estoque.
        </p>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-neutral-500">
          Estoque conferido na loja em 11 de novembro de 2026. Os tamanhos ao
          lado de cada peça são o que existe para vestir na modelo. Clique na
          foto, ou em baixar a foto original, para pegar o arquivo no tamanho em
          que ele chegou.
        </p>
      </header>

      <section className="mt-10">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-900">
            Para fotografar
          </h2>
          <span className="text-[11px] uppercase tracking-[0.14em] text-neutral-400">
            {FAZER.length} peças
          </span>
        </div>
        <ul className="mt-4 flex flex-col gap-4">
          {FAZER.map((p, i) => (
            <Cartao key={p.nome} peca={p} i={i} />
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b02a16]">
            Não vale mais fotografar
          </h2>
          <span className="text-[11px] uppercase tracking-[0.14em] text-neutral-400">
            {FORA.length} peças
          </span>
        </div>
        <p className="mt-2.5 max-w-2xl text-[13.5px] leading-relaxed text-neutral-600">
          Estas vieram no mesmo lote, mas esgotaram nestes onze dias ou não
          estão à venda. Ficam aqui só para ninguém gastar tempo com elas.
        </p>
        <ul className="mt-4 flex flex-col gap-4">
          {FORA.map((p, i) => (
            <Cartao key={p.nome} peca={p} i={i} fora />
          ))}
        </ul>
      </section>

      <footer className="mt-14 border-t border-neutral-200 pt-5 text-[12.5px] leading-relaxed text-neutral-500">
        Dose de Growth · Se alguma peça vender antes da produção, me avisa que
        eu tiro da lista.
      </footer>
    </main>
    </div>
  );
}
