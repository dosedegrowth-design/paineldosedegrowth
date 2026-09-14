import { ABERTURA } from "@/lib/institucional";
import { FOTOS } from "@/lib/photos";
import { FotoReal } from "@/components/ui/foto-real";
import { Linhas, Reveal } from "@/components/ui/motion";

/**
 * A tese, logo depois da capa.
 *
 * Existe por dois motivos. O primeiro é editorial: a capa é escura, as
 * cinco frentes são escuras — sem essa respirada clara no meio, a metade
 * de cima da página vira uma massa preta só. O segundo é de conteúdo:
 * antes de listar o que a VIVA faz, é preciso dizer qual é o problema.
 *
 * Texto grande, coluna estreita, uma foto. Nada de card.
 */
export function Abertura() {
  return (
    <section className="v-section v-abertura" aria-labelledby="abertura-titulo">
      <div className="v-wrap">
        <div className="v-abertura__grid">
          <div className="v-abertura__texto">
            <p className="v-eyebrow">{ABERTURA.eyebrow}</p>
            <Linhas
              as="h2"
              id="abertura-titulo"
              className="v-display v-h1 v-abertura__titulo"
              linhas={ABERTURA.titulo}
            />
            {ABERTURA.paragrafos.map((paragrafo, i) => (
              <Reveal key={i} delay={0.16 + i * 0.08}>
                <p className="v-lead v-abertura__p">{paragrafo}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="v-abertura__media" delay={0.2}>
            <FotoReal
              foto={FOTOS.site.equipe}
              corte="p"
              ratio={4 / 5}
              legenda
              zoom
              sizes="(max-width: 900px) 92vw, 34vw"
            />
          </Reveal>
        </div>

        <Reveal className="v-abertura__nota" delay={0.1}>
          <p>{ABERTURA.destaque}</p>
        </Reveal>
      </div>
    </section>
  );
}
