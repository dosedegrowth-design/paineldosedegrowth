import Link from "next/link";
import { AREAS, type AreaSlug } from "@/lib/areas";
import { IconeArea } from "@/components/ui/icones";

/**
 * A barra das cinco áreas, colada embaixo do hero. Dá para pular de uma
 * especialidade para a outra sem voltar ao índice. No celular ela rola na
 * horizontal — nenhuma área é removida.
 */
export function Abas({ atual }: { atual?: AreaSlug }) {
  return (
    <nav className="v-tabs" aria-label="Áreas de atuação">
      <div className="v-wrap">
        <div className="v-tabs__list">
          {AREAS.map((a) => (
            <Link
              key={a.slug}
              href={a.href}
              className="v-tab"
              aria-current={a.slug === atual ? "page" : undefined}
            >
              <IconeArea nome={a.icone} />
              <span>
                {a.aba[0]}
                <br />
                {a.aba[1]}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
