import { CTA_PRINCIPAL } from "@/lib/config";
import { Botao } from "@/components/ui/botao";
import { Predio } from "@/components/ui/icones";
import { Reveal } from "@/components/ui/motion";

/**
 * A faixa escura que fecha cada página antes da frase de fecho.
 *
 * `itens` é a linha de diferenciais da página-mãe aprovada pelo cliente
 * ("Atendimento personalizado · Conformidade com as normas · …"). Entra
 * como texto separado por régua, não como quatro ícones.
 */
export function FaixaCta({
  titulo,
  texto,
  cta = CTA_PRINCIPAL,
  href,
  itens,
}: {
  titulo: readonly [string, string?];
  texto: string;
  cta?: string;
  href: string;
  itens?: readonly string[];
}) {
  return (
    <section className="v-faixa">
      <div className="v-wrap">
        <Reveal className="v-faixa__grid">
          <Predio className="v-faixa__icone" />
          <h2 className="v-display v-h3">
            {titulo[0]}
            {titulo[1] ? (
              <>
                <br />
                {titulo[1]}
              </>
            ) : null}
          </h2>
          <p className="v-faixa__sep">{texto}</p>
          <div>
            <Botao href={href} variante="ghost">
              {cta}
            </Botao>
          </div>
        </Reveal>

        {itens?.length ? (
          <Reveal as="ul" className="v-faixa__itens" cascata>
            {itens.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
