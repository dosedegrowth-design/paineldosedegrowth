import Link from "next/link";
import { AREAS, type AreaSlug } from "@/lib/areas";

/**
 * A barra das cinco áreas, colada embaixo do hero. Dá para pular de uma
 * especialidade para a outra sem voltar ao índice. No celular ela rola na
 * horizontal — nenhuma área é removida.
 *
 * É índice, não botoeira: número em cima, nome embaixo, régua separando.
 * A ativa se marca por uma régua vermelha e pelo texto branco — sem caixa
 * preenchida e sem ícone. Ícone aqui não informava nada que o nome já não
 * dissesse.
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
              <span className="v-tab__n">{a.numero}</span>
              <span className="v-tab__nome">
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
