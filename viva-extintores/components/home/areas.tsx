import Link from "next/link";
import { AREAS } from "@/lib/areas";
import { Seta } from "@/components/ui/icones";
import { FotoReal } from "@/components/ui/foto-real";
import { Reveal } from "@/components/ui/reveal";

/**
 * As cinco portas de entrada do portfólio.
 *
 * São CINCO — a lista é fechada. Cada card leva para a página própria
 * daquela área; esta grade é índice, não resumo. No celular empilha
 * 01…05 sem perder foto nem texto.
 */
export function AreasGrid({
  titulo,
  texto,
}: {
  titulo: string;
  texto: string;
}) {
  return (
    <section className="v-section" aria-labelledby="areas-titulo">
      <div className="v-wrap" style={{ textAlign: "center" }}>
        <h2 className="v-display v-h2" id="areas-titulo">
          {titulo}
        </h2>
        <p className="v-body" style={{ marginTop: 10 }}>
          {texto}
        </p>

        <ul className="v-areas" style={{ textAlign: "left" }}>
          {AREAS.map((a, i) => (
            <Reveal as="li" key={a.slug} delay={i * 0.05}>
              <Link className="v-area" href={a.href}>
                <div className="v-area__media">
                  <FotoReal
                    foto={a.cardFoto}
                    ratio="fill"
                    sizes="(max-width: 900px) 100vw, (max-width: 1080px) 50vw, 250px"
                    style={{ height: "100%" }}
                  />
                </div>
                <div className="v-area__body">
                  <span className="v-area__num">{a.numero}</span>
                  <h3 className="v-display v-area__title">
                    {a.cardTitulo[0]}
                    {a.cardTitulo[1] ? (
                      <>
                        <br />
                        {a.cardTitulo[1]}
                      </>
                    ) : null}
                  </h3>
                  <p className="v-area__resume">{a.cardResumo}</p>
                  <span className="v-area__go">
                    <Seta />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
