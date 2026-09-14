import { DOCUMENTOS, ETAPAS } from "@/lib/documentos";
import { FOTOS } from "@/lib/photos";
import { FotoReal } from "@/components/ui/foto-real";
import { Reveal } from "@/components/ui/reveal";

/**
 * Exclusivo da página 04 (§11): dois caminhos de regularização e o
 * percurso até a aprovação. "Da análise e projeto à execução e aprovação."
 */
export function BlocoDocumentos() {
  return (
    <section className="v-section v-section--tight" aria-labelledby="docs-titulo">
      <div className="v-wrap">
        <Reveal>
          <p className="v-eyebrow" id="docs-titulo">
            Qual é o seu caso
          </p>

          <ul className="v-docs" style={{ marginTop: 20 }}>
            {DOCUMENTOS.map((d, i) => (
              <li className="v-doc" key={d.sigla}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0,1fr) 108px",
                    gap: 18,
                    alignItems: "start",
                  }}
                >
                  <div>
                    <p className="v-doc__sigla">{d.sigla}</p>
                    <p className="v-doc__nome">{d.nome}</p>
                    <p className="v-doc__para">{d.para}</p>
                    <p className="v-doc__texto">{d.texto}</p>
                  </div>
                  <FotoReal
                    foto={i === 0 ? FOTOS.laudos.clcb : FOTOS.laudos.avcb}
                    sizes="108px"
                  />
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal>
          <h3 className="v-display v-h3" style={{ marginTop: "clamp(30px, 3.6vw, 48px)" }}>
            Da análise e do projeto
            <br />
            <span className="v-dot">à execução e à aprovação</span>
          </h3>
          <ol className="v-etapas">
            {ETAPAS.map((e) => (
              <li className="v-etapa" key={e.n}>
                <p className="v-etapa__n">{e.n}</p>
                <p className="v-etapa__t">{e.titulo}</p>
                <p className="v-etapa__x">{e.texto}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
