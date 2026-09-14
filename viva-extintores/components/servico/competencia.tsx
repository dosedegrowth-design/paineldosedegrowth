import type { Area } from "@/lib/areas";
import { whatsappUrl } from "@/lib/whatsapp";
import { Botao } from "@/components/ui/botao";
import { FotoReal } from "@/components/ui/foto-real";
import { Reveal } from "@/components/ui/reveal";

/**
 * O bloco de competência: o que a VIVA faz nesta área, com a foto de obra
 * ao lado e o caminho de conversão logo abaixo (PROBLEMA → COMPETÊNCIA →
 * PROVA → AÇÃO, §3).
 */
export function Competencia({ area }: { area: Area }) {
  return (
    <section className="v-section" aria-labelledby="competencia-titulo">
      <div className="v-wrap">
        <Reveal className="v-comp">
          <div>
            <p className="v-eyebrow">{area.numero}</p>
            <h2 className="v-display v-h2" id="competencia-titulo" style={{ marginTop: 10 }}>
              {area.blocoTitulo[0]}
              {area.blocoTitulo[1] ? (
                <>
                  <br />
                  {area.blocoTitulo[1]}
                </>
              ) : null}
            </h2>
            {area.blocoIntro ? <p className="v-lead v-comp__intro">{area.blocoIntro}</p> : null}

            <ul className="v-list">
              {area.itens.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <ul className="v-selos">
              {area.selos.map((s) => (
                <li className="v-selo" key={s}>
                  {s}
                </li>
              ))}
            </ul>

            <div className="v-comp__cta">
              <Botao href={whatsappUrl(area.ctaMensagem)}>{area.ctaRotulo}</Botao>
            </div>
          </div>

          <div>
            <FotoReal
              foto={area.destaque}
              legenda
              sizes="(max-width: 1080px) 100vw, 46vw"
            />
          </div>
        </Reveal>

        <Reveal>
          <ul className="v-gal">
            {area.galeria.map((f) => (
              <li key={f.src}>
                <FotoReal foto={f} legenda sizes="(max-width: 900px) 50vw, 24vw" />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
