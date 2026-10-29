import type { Metadata, Viewport } from "next";
// a fonte do site dela, para o formulário ter a cara da marca
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/500.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/instrument-sans/700.css";
import "../briefing.css";
import { chaveConfere, getBriefingMarina } from "@/lib/marina/queries/briefing";
import { MarinaBriefingForm } from "@/components/briefing/marina/marina-form";

export const metadata: Metadata = {
  title: { absolute: "Anúncios do mês · Marina Saleme" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#f7f7f5" };

/** Cada visita lê o que a Bia já cadastrou: nada aqui é guardado em cache. */
export const dynamic = "force-dynamic";

/**
 * O formulário que a Bia responde, no domínio da DDG, dizendo o que a
 * Marina quer anunciar no mês seguinte. Sem login: quem abre é quem tem o
 * link com a chave (?k=), gerada pela DDG.
 */
export default async function BriefingMarina({ searchParams }: { searchParams: Promise<{ k?: string }> }) {
  const { k } = await searchParams;
  if (!k || !(await chaveConfere(k))) {
    return (
      <div className="ddgb ddgb--marina">
        <main className="ddgb-pagina ddgb-pagina--fora">
          <section className="ddgb-abre">
            <p className="ddgb-abre__cliente">Dose de Growth</p>
            <h1>Esse link não abre o formulário.</h1>
            <p>Confira se copiou o endereço inteiro, ou peça um novo para a DDG.</p>
          </section>
        </main>
      </div>
    );
  }
  const briefing = await getBriefingMarina();
  return <MarinaBriefingForm chave={k} {...briefing} />;
}
