import { DIFERENCIAIS, SOBRE } from "@/lib/home";
import { Numeros } from "@/components/secoes/numeros";
import { Reveal } from "@/components/ui/reveal";

/**
 * Competência + credibilidade (§2, §15, §19).
 *
 * "Essa empresa consegue pegar o meu problema de segurança contra
 * incêndio e resolver." Sem CREA em lugar nenhum, sem quadradinho de
 * estatística solto.
 */
export function Sobre() {
  return (
    <>
      <section className="v-section" aria-labelledby="sobre-titulo">
        <div className="v-wrap">
          <Reveal className="v-comp">
            <div>
              <p className="v-eyebrow">{SOBRE.eyebrow}</p>
              <h2 className="v-display v-h2" id="sobre-titulo" style={{ marginTop: 10 }}>
                {SOBRE.titulo[0]}
                <br />
                <span className="v-dot">{SOBRE.titulo[1]?.replace(/\.$/, "")}</span>
              </h2>
            </div>
            <div>
              <p className="v-lead">{SOBRE.texto}</p>
            </div>
          </Reveal>

          <div style={{ marginTop: "clamp(28px, 3.4vw, 44px)" }}>
            <Numeros />
          </div>
        </div>
      </section>

      <section className="v-section v-light" aria-labelledby="difs-titulo">
        <div className="v-wrap">
          <h2 className="v-eyebrow" id="difs-titulo">
            Por que a VIVA
          </h2>
          <ul className="v-difs" style={{ marginTop: 20 }}>
            {DIFERENCIAIS.map((d) => (
              <li className="v-dif" key={d.titulo}>
                <h3 className="v-dif__title">{d.titulo}</h3>
                <p className="v-dif__text">{d.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
