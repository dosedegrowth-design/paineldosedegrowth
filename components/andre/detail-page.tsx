import Link from "next/link";
import { Check, MoveRight } from "lucide-react";
import { PageHeader } from "./page-header";
import { RevealSection } from "./tilt-card";
import { ContatoBand } from "./home-teasers";
import { SectionFX } from "./section-fx";
import type { DetailItem } from "./site-data";

/* Template das páginas de detalhe (produto, marca, segmento):
   header com breadcrumb de 2 níveis, corpo editorial + card de
   destaques, itens relacionados e CTA institucional. */

export function DetailPage({
  n,
  kicker,
  item,
  parent,
  related,
  relatedTitle,
  relatedBase,
}: {
  n: string;
  kicker: string;
  item: DetailItem;
  parent: { label: string; href: string };
  related: DetailItem[];
  relatedTitle: string;
  relatedBase: string;
}) {
  const base =
    item.titulo === item.nome
      ? ""
      : item.titulo.replace(` ${item.nome}`, "");

  return (
    <>
      <PageHeader
        n={n}
        kicker={kicker}
        crumb={item.nome}
        parent={parent}
        title={base}
        highlight={item.nome + "."}
        sub={item.resumo}
      />

      <section className="relative pb-16 lg:pb-28">
        <SectionFX aurora flip stars={7} flakes={4} />
        <div className="relative max-w-6xl mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12 items-start">
            <RevealSection>
              {item.corpo.map((p) => (
                <p
                  key={p.slice(0, 24)}
                  className="text-slate-300 text-base sm:text-lg leading-relaxed mt-5 first:mt-0"
                >
                  {p}
                </p>
              ))}
            </RevealSection>

            <RevealSection className="andre-card p-6 lg:p-7">
              <p className="font-tech text-[10px] uppercase tracking-[0.28em] text-[var(--andre-primary)]">
                Destaques
              </p>
              <ul className="mt-4 space-y-3">
                {item.destaques.map((d) => (
                  <li key={d} className="flex items-start gap-2.5 text-sm text-slate-200">
                    <Check className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                    {d}
                  </li>
                ))}
              </ul>
            </RevealSection>
          </div>

          <RevealSection className="mt-14 lg:mt-20">
            <p className="font-tech text-[10px] uppercase tracking-[0.28em] text-slate-500 mb-4">
              {relatedTitle}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`${relatedBase}/${r.slug}`}
                  className="andre-card inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-300 hover:text-white hover:border-sky-400/40 transition-colors group"
                >
                  {r.nome}
                  <MoveRight className="h-3.5 w-3.5 text-sky-400 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      <ContatoBand />
    </>
  );
}
