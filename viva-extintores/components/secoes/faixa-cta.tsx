import { Botao } from "@/components/ui/botao";
import { Reveal } from "@/components/ui/reveal";

/** A faixa escura que fecha cada página antes dos casos reais. */
export function FaixaCta({
  titulo,
  texto,
  cta,
  href,
}: {
  titulo: readonly [string, string?];
  texto: string;
  cta: string;
  href: string;
}) {
  return (
    <section className="v-faixa">
      <div className="v-wrap">
        <Reveal className="v-faixa__grid">
          <h2 className="v-display v-h3">
            {titulo[0]}
            {titulo[1] ? (
              <>
                <br />
                {titulo[1]}
              </>
            ) : null}
          </h2>
          <p className="v-body v-faixa__sep">{texto}</p>
          <div>
            <Botao href={href}>{cta}</Botao>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
