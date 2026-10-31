import type { Metadata, Viewport } from "next";
// a fonte do site dela, para a tela ter a cara da marca
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/500.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/instrument-sans/700.css";
import "../../briefing.css";
import { chaveConfere, getOrganizarMarina } from "@/lib/marina/queries/briefing";
import { MarinaOrganizar } from "@/components/briefing/marina/organizar";

export const metadata: Metadata = {
  title: { absolute: "Organizar as fotos · Marina Saleme" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#f7f7f5" };

/** Cada visita lê o estado de agora: nada aqui é guardado em cache. */
export const dynamic = "force-dynamic";

/**
 * A Bia confere, foto por foto, se cada imagem está na frente certa:
 * últimas peças ou estampas novas. Mesmo link e mesma chave (?k=) do
 * formulário: quem abre é quem tem o endereço que a DDG gerou.
 */
export default async function OrganizarMarina({ searchParams }: { searchParams: Promise<{ k?: string }> }) {
  const { k } = await searchParams;
  if (!k || !(await chaveConfere(k))) {
    return (
      <div className="ddgb ddgb--marina">
        <main className="ddgb-pagina ddgb-pagina--fora">
          <section className="ddgb-abre">
            <p className="ddgb-abre__cliente">Dose de Growth</p>
            <h1>Esse link não abre a tela.</h1>
            <p>Confira se copiou o endereço inteiro, ou peça um novo para a DDG.</p>
          </section>
        </main>
      </div>
    );
  }
  const dados = await getOrganizarMarina();
  return <MarinaOrganizar chave={k} {...dados} />;
}
