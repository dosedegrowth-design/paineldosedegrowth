import Link from "next/link";
import { AREAS, type AreaSlug } from "@/lib/areas";

/**
 * A barra das cinco áreas dentro das páginas internas: dá para pular de
 * uma especialidade para a outra sem voltar ao índice. No mobile ela rola
 * na horizontal — nenhuma área é removida (§21).
 */
export function Abas({ atual }: { atual: AreaSlug }) {
  return (
    <nav className="v-tabs" aria-label="Áreas de atuação">
      <div className="v-wrap" style={{ paddingInline: 0 }}>
        <div className="v-tabs__list">
          {AREAS.map((a) => (
            <Link
              key={a.slug}
              href={a.href}
              className="v-tab"
              aria-current={a.slug === atual ? "page" : undefined}
            >
              <span className="v-tab__num">{a.numero}</span>
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
