import type { Metadata, Viewport } from "next";
import "../briefing.css";
import { chaveConfere, getBriefing } from "@/lib/tayssa/queries/briefing";
import { BriefingForm } from "@/components/briefing/briefing-form";

export const metadata: Metadata = {
  title: { absolute: "Briefing do site · Tayssa Lash" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#f7f4ef" };

/** Cada visita lê o que ela já respondeu: nada aqui é guardado em cache. */
export const dynamic = "force-dynamic";

/**
 * O briefing que a Tayssa responde, no domínio da DDG. Sem login: quem
 * abre é quem tem o link com a chave (?k=), gerada pela DDG.
 */
export default async function BriefingTayssa({ searchParams }: { searchParams: Promise<{ k?: string }> }) {
  const { k } = await searchParams;
  if (!k || !(await chaveConfere(k))) {
    return (
      <div className="ddgb">
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
  const briefing = await getBriefing();
  return <BriefingForm chave={k} {...briefing} />;
}
