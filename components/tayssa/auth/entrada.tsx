import type { CSSProperties, ReactNode } from "react";
import "@/app/tayssa/entrar/entrar.css";
import { ROUTES } from "@/lib/tayssa/config";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { FundoVivo } from "@/components/tayssa/ui/fundo-vivo";
import { MarcaViva } from "@/components/tayssa/ui/marca-viva";

/**
 * A porta do clube (entrar, pedir acesso, aguardando), no desenho da
 * entrada do painel da iWin: fundo vivo, a marca flutuando no alto, um
 * cartão de vidro no centro e um rodapé discreto com os caminhos.
 */
export function Entrada({
  children,
  links,
}: {
  children: ReactNode;
  /** caminhos do rodapé, além de "Site" */
  links?: { href: string; label: string; externo?: boolean }[];
}) {
  return (
    <div className="tyl ty-scope" data-theme="night">
      <FundoVivo />
      <div className="tyl__page">
        <main className="tyl__centro">
          <TransitionLink href={ROUTES.home} className="tyl__marca tyl-surge" aria-label="Tayssa Lash — voltar ao site">
            <MarcaViva />
          </TransitionLink>
          {children}
        </main>
        <footer className="tyl__rodape tyl-surge" style={{ "--d": "0.7s" } as CSSProperties}>
          <p>Tayssa Lash · área privada</p>
          <nav aria-label="Caminhos">
            <TransitionLink href={ROUTES.home} className="tyl__rodape-link">
              Site
            </TransitionLink>
            {links?.map((l) => (
              <span key={l.href} className="tyl__rodape-par">
                <span aria-hidden>·</span>
                {l.externo ? (
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="tyl__rodape-link">
                    {l.label}
                  </a>
                ) : (
                  <TransitionLink href={l.href} className="tyl__rodape-link">
                    {l.label}
                  </TransitionLink>
                )}
              </span>
            ))}
          </nav>
        </footer>
      </div>
    </div>
  );
}
