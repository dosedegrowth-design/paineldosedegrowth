import Link from "next/link";
import { Chapter } from "./chapter";
import { SectionFX } from "./section-fx";
import { RevealSection } from "./tilt-card";

/* As 6 marcas parceiras do site climafrio.com.br, em tipografia
   estilizada (sem logos de terceiros). */

const marcas = [
  { nome: "Springer Midea", slug: "springer-midea" },
  { nome: "Elgin", slug: "elgin" },
  { nome: "LG", slug: "lg" },
  { nome: "Samsung", slug: "samsung" },
  { nome: "Daikin", slug: "daikin" },
  { nome: "Carrier", slug: "carrier" },
];

export function Marcas() {
  return (
    <section id="marcas" className="relative py-14 lg:py-24">
      <SectionFX aurora stars={10} />
      <div className="relative max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="text-center">
          <Chapter n="05" label="Marcas parceiras" />
          <h2 className="mt-4 text-3xl sm:text-4xl andre-display leading-[1.05] text-white">
            As melhores marcas,{" "}
            <span className="andre-gradient-text">homologadas</span>.
          </h2>
        </RevealSection>

        <RevealSection className="mt-9 lg:mt-12">
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {marcas.map((m) => (
              <li key={m.slug} className="andre-card">
                <Link
                  href={`/andre/marcas/${m.slug}`}
                  className="h-20 flex items-center justify-center px-4 transition-colors hover:text-white"
                >
                  <span className="andre-display text-base sm:text-lg text-slate-300 tracking-tight text-center whitespace-nowrap">
                    {m.nome}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-center font-tech text-[10px] uppercase tracking-[0.24em] text-slate-500">
            Equipamentos originais · Garantia de fábrica · Suporte técnico
          </p>
        </RevealSection>
      </div>
    </section>
  );
}
