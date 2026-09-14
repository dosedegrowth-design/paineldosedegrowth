import Link from "next/link";
import { AREAS } from "@/lib/areas";
import { Seta } from "@/components/ui/icones";
import { FotoReal } from "@/components/ui/foto-real";
import { Reveal } from "@/components/ui/reveal";

/**
 * As cinco portas de entrada (§6). Três em cima, duas embaixo no desktop;
 * 01 a 05 uma abaixo da outra no celular, sem perder foto nem texto (§21).
 *
 * Cada card leva para a página própria daquela área — a inicial é índice,
 * não resumo (§7).
 */
export function AreasGrid() {
  return (
    <section className="v-section" aria-labelledby="areas-titulo">
      <div className="v-wrap">
        <h2 className="v-eyebrow" id="areas-titulo">
          Cinco áreas de atuação
        </h2>

        <ul className="v-areas" style={{ marginTop: 20 }}>
          {AREAS.map((a, i) => (
            <Reveal as="li" key={a.slug} delay={i * 0.05}>
              <Link className="v-area" href={a.href}>
                <div className="v-area__media">
                  <FotoReal
                    foto={a.cardFoto}
                    ratio="fill"
                    sizes="(max-width: 900px) 100vw, (max-width: 1340px) 40vw, 440px"
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
                  <Seta className="v-area__go" />
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
