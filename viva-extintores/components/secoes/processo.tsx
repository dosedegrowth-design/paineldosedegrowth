import { PROCESSO } from "@/lib/institucional";
import { Linhas, Reveal } from "@/components/ui/motion";

/**
 * Como o trabalho acontece, em quatro etapas.
 *
 * Linhas, não cards: cada etapa é uma régua que atravessa a página, com o
 * número à esquerda e o texto à direita. É o gesto de índice editorial —
 * o mesmo de `/servicos` — e evita a quarta grade de caixinhas do site.
 */
export function Processo() {
  return (
    <section className="v-section v-processo" aria-labelledby="processo-titulo">
      <div className="v-wrap">
        <div className="v-cab">
          <div>
            <p className="v-eyebrow">{PROCESSO.eyebrow}</p>
            <Linhas
              as="h2"
              id="processo-titulo"
              className="v-display v-h2 v-cab__titulo"
              linhas={PROCESSO.titulo}
            />
          </div>
        </div>

        <ol className="v-passos">
          {PROCESSO.passos.map((passo, i) => (
            <Reveal as="li" key={passo.n} className="v-passo" delay={i * 0.07}>
              <span className="v-passo__n">{passo.n}</span>
              <h3 className="v-display v-passo__titulo">{passo.titulo}</h3>
              <p className="v-passo__texto">{passo.texto}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
