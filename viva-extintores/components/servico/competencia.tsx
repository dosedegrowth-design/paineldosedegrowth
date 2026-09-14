import type { Area } from "@/lib/areas";
import { SELOS_AREA, SELO_OBRAS } from "@/lib/numeros";
import { whatsappUrl } from "@/lib/whatsapp";
import { Botao } from "@/components/ui/botao";
import { FotoReal } from "@/components/ui/foto-real";
import { Reveal } from "@/components/ui/reveal";
import { Check, Engrenagem, Escudo, Pessoas } from "@/components/ui/icones";

/**
 * O bloco de competência: o que a VIVA faz nesta área, a foto de obra ao
 * lado, o trio de selos e a galeria de obra logo abaixo.
 */
export function Competencia({ area }: { area: Area }) {
  return (
    <section className="v-section" aria-labelledby="competencia-titulo">
      <div className="v-wrap">
        <p className="v-secnum">{area.numero}</p>

        <Reveal className="v-comp">
          <div>
            <h2 className="v-display v-h2" id="competencia-titulo">
              {area.blocoTitulo[0]}
              {area.blocoTitulo[1] ? (
                <>
                  <br />
                  {area.blocoTitulo[1]}
                </>
              ) : null}
            </h2>
            <p className="v-body v-comp__intro">{area.blocoIntro}</p>

            <ul className="v-list">
              {area.itens.map((item) => (
                <li key={item}>
                  <Check />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="v-comp__cta">
              <Botao href={whatsappUrl(area.ctaMensagem)}>{area.ctaRotulo}</Botao>
            </div>
          </div>

          <div>
            <ul className="v-selos">
              <li className="v-selo">
                <Engrenagem />
                <p className="v-selo__t">
                  {SELOS_AREA[0].titulo}
                  <br />
                  {SELOS_AREA[0].subtitulo}
                </p>
              </li>
              <li className="v-selo">
                <Escudo />
                <p className="v-selo__t">
                  {SELOS_AREA[1].titulo}
                  <br />
                  {SELOS_AREA[1].subtitulo}
                </p>
              </li>
              <li className="v-selo">
                <Pessoas />
                <p className="v-selo__n">{SELO_OBRAS.valor}</p>
                <p className="v-selo__x">{SELO_OBRAS.rotulo}</p>
              </li>
            </ul>

            <div style={{ marginTop: "clamp(18px, 2.2vw, 28px)" }}>
              <FotoReal
                foto={area.destaque}
                legenda
                sizes="(max-width: 1080px) 100vw, 46vw"
              />
            </div>
          </div>
        </Reveal>

        <Reveal>
          <ul
            className="v-gal"
            style={{ ["--cols" as string]: String(area.galeria.length) }}
          >
            {area.galeria.map((f) => (
              <li key={f.src}>
                <FotoReal foto={f} legenda sizes="(max-width: 900px) 50vw, 20vw" />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
