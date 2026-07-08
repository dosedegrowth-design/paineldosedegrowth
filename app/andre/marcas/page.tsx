import type { Metadata } from "next";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import { PageHeader } from "@/components/andre/page-header";
import { RevealSection, TiltCard } from "@/components/andre/tilt-card";
import { ContatoBand } from "@/components/andre/home-teasers";
import { MARCAS } from "@/components/andre/site-data";

export const metadata: Metadata = {
  title: "Marcas — Climafrio | Springer Midea, Elgin, LG, Samsung, Daikin e Carrier",
  description:
    "As seis marcas parceiras da Climafrio: Springer Midea, Elgin, LG, Samsung, Daikin e Carrier — equipamentos originais com garantia de fábrica.",
};

export default function MarcasPage() {
  return (
    <>
      <PageHeader
        n="05"
        kicker="Marcas parceiras"
        crumb="Marcas"
        title="As melhores marcas,"
        highlight="homologadas."
        sub="Seis fabricantes, um critério: a Climafrio especifica a marca certa pro porte e pro orçamento de cada projeto — sempre com equipamento original e garantia de fábrica."
      />

      <section className="relative pb-16 lg:pb-28">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {MARCAS.map((m, i) => (
              <TiltCard key={m.slug} delay={i * 0.06} className="andre-card">
                <Link href={`/andre/marcas/${m.slug}`} className="block p-6 group">
                  <h2 className="andre-display text-2xl text-white leading-tight">
                    {m.nome}
                  </h2>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    {m.resumo}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--andre-primary)]">
                    Conhecer a linha
                    <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </TiltCard>
            ))}
          </div>

          <RevealSection className="mt-8">
            <p className="text-center font-tech text-[10px] uppercase tracking-[0.24em] text-slate-500">
              Equipamentos originais · Garantia de fábrica · Suporte técnico
            </p>
          </RevealSection>
        </div>
      </section>

      <ContatoBand />
    </>
  );
}
