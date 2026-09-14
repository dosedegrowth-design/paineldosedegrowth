import type { Area } from "@/lib/areas";
import { SELOS_AREA, SELO_OBRAS } from "@/lib/numeros";
import { whatsappUrl } from "@/lib/whatsapp";
import { Botao } from "@/components/ui/botao";
import { FotoReal } from "@/components/ui/foto-real";
import { Linhas, Reveal } from "@/components/ui/motion";
import { Check } from "@/components/ui/icones";

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
            <Linhas
              as="h2"
              id="competencia-titulo"
              className="v-display v-h2"
              linhas={area.blocoTitulo}
            />
            <p className="v-body v-comp__intro">{area.blocoIntro}</p>

            <ul className="v-list v-cascata-in">
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
            {/* sem ícone e sem caixinha: duas afirmações e o único número
                confirmado da área, separados por régua */}
            <ul className="v-marcas">
              {SELOS_AREA.map((selo) => (
                <li key={selo.titulo}>
                  <b>{selo.titulo}</b>
                  <span>{selo.subtitulo}</span>
                </li>
              ))}
              <li className="v-marcas__n">
                <b>{SELO_OBRAS.valor}</b>
                <span>{SELO_OBRAS.rotulo}</span>
              </li>
            </ul>

            <div className="v-comp__foto">
              <FotoReal
                foto={area.destaque}
                corte="w"
                legenda
                zoom
                sizes="(max-width: 1080px) 100vw, 46vw"
              />
            </div>
          </div>
        </Reveal>

        <Reveal>
          <ul
            className="v-gal v-cascata-in"
            style={{ ["--cols" as string]: String(area.galeria.length) }}
          >
            {area.galeria.map((f) => (
              <li key={f.base}>
                <FotoReal foto={f} corte="q" legenda zoom sizes="(max-width: 900px) 50vw, 20vw" />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
